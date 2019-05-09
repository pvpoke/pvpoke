<?php
namespace Patreon;

class API {

	// Holds the access token
	private $access_token;

	// Holds the api endpoint used
	public $api_endpoint;

	// The cache for request results - an array that matches md5 of the unique API request to the returned result
	public static $request_cache;

	// Sets the reqeuest method for cURL
	public $api_request_method = 'GET';

	// Holds POST for cURL for requests other than GET
	public $curl_postfields = false;

	// Sets the format the return from the API is parsed and returned - array (assoc), object, or raw JSON
	public $api_return_format;


	public function __construct($access_token) {

		// Set the access token
		$this->access_token = $access_token;

		// Set API endpoint to use. Its currently V2
		$this->api_endpoint = "https://www.patreon.com/api/oauth2/v2/";

		// Set default return format - this can be changed by the app using the lib by setting it
		// after initialization of this class
		$this->api_return_format = 'array';

	}

	public function fetch_user() {
		// Fetches details of the current token user.
		return $this->get_data('identity?include=memberships&fields'.urlencode('[user]').'=email,first_name,full_name,image_url,last_name,thumb_url,url,vanity,is_email_verified&fields'.urlencode('[member]').'=currently_entitled_amount_cents,lifetime_support_cents,last_charge_status,patron_status,last_charge_date,pledge_relationship_start');
	}

	public function fetch_campaigns() {
		// Fetches the list of campaigns of the current token user. Requires the current user to be creator of the campaign or requires a creator access token
		return $this->get_data("campaigns");
	}

	public function fetch_campaign_details($campaign_id) {
		// Fetches details about a campaign - the membership tiers, benefits, creator and goals.  Requires the current user to be creator of the campaign or requires a creator access token
		return $this->get_data("campaigns/{$campaign_id}?include=benefits,creator,goals,tiers");
	}

	public function fetch_member_details($member_id) {
		// Fetches details about a member from a campaign. Member id can be acquired from fetch_page_of_members_from_campaign
		// currently_entitled_tiers is the best way to get info on which membership tiers the user is entitled to.  Requires the current user to be creator of the campaign or requires a creator access token.
		return $this->get_data("members/{$member_id}?include=address,campaign,user,currently_entitled_tiers");
	}

	public function fetch_page_of_members_from_campaign($campaign_id, $page_size, $cursor = null) {

		// Fetches a given page of members with page size and cursor point. Can be used to iterate through lists of members for a given campaign. Campaign id can be acquired from fetch_campaigns or from a saved campaign id variable.  Requires the current user to be creator of the campaign or requires a creator access token
		$url = "campaigns/{$campaign_id}/members?page%5Bcount%5D={$page_size}";

		if ($cursor != null) {

		  $escaped_cursor = urlencode($cursor);
		  $url = $url . "&page%5Bcursor%5D={$escaped_cursor}";

		}

		return $this->get_data($url);

	}

	public function get_data($suffix) {

		// Construct request:
		$api_request = $this->api_endpoint . $suffix;

		// This identifies a unique request
		$api_request_hash = md5($api_request);

		// Check if this request exists in the cache and if so, return it directly - avoids repeated requests to API in the same page run for same request string

		if ( isset( self::$request_cache[$api_request_hash] ) ) {
			return self::$request_cache[$api_request_hash];
		}

		// Request is new - actually perform the request

		$ch = $this->__create_ch($api_request);
		$json_string = curl_exec($ch);
		$info = curl_getinfo($ch);
		curl_close($ch);

		// don't try to parse a 500-class error, as it's likely not JSON
		if ( $info['http_code'] >= 500 ) {
		  return self::add_to_request_cache($api_request_hash, $json_string);
		}

		// don't try to parse a 400-class error, as it's likely not JSON
		if ( $info['http_code'] >= 400 ) {
		  return self::add_to_request_cache($api_request_hash, $json_string);
		}

		// Parse the return according to the format set by api_return_format variable

		if( $this->api_return_format == 'array' ) {
		  $return = json_decode($json_string, true);
		}

		if( $this->api_return_format == 'object' ) {
		  $return = json_decode($json_string);
		}

		if( $this->api_return_format == 'json' ) {
		  $return = $json_string;
		}

		// Add this new request to the request cache and return it
		return self::add_to_request_cache($api_request_hash, $return);

	}

	private function __create_ch($api_request) {

		// This function creates a cURL handler for a given URL. In our case, this includes entire API request, with endpoint and parameters

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $api_request);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

		if ( $this->api_request_method != 'GET' AND $this->curl_postfields ) {
			curl_setopt( $ch, CURLOPT_POSTFIELDS, $this->curl_postfields );
		}

		// Set the cURL request method - works for all of them

		curl_setopt( $ch, CURLOPT_CUSTOMREQUEST, $this->api_request_method );

		// Below line is for dev purposes - remove before release
		// curl_setopt($ch, CURLOPT_HEADER, 1);

		$headers = array(
			'Authorization: Bearer ' . $this->access_token,
			'User-Agent: Patreon-PHP, version 1.0.0, platform ' . php_uname('s') . '-' . php_uname( 'r' ),
		);

		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		return $ch;

	}

	public static function add_to_request_cache( $api_request_hash, $result ) {

		// This function manages the array that is used as the cache for API requests. What it does is to accept a md5 hash of entire query string (GET, with url, endpoint and options and all) and then add it to the request cache array

		// If the cache array is larger than 50, snip the first item. This may be increased in future

		if ( count( self::$request_cache ) > 50  ) {
			array_shift( self::$request_cache );
		}

		// Add the new request and return it

		return self::$request_cache[$api_request_hash] = $result;

	}


}
?>
