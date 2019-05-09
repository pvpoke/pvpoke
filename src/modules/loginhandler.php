<?php

// Patreon login code from https://github.com/Patreon/patreon-php/

require_once('./libs/patreon/API.php');
require_once('./libs/patreon/OAuth.php');

use Patreon\API;
use Patreon\OAuth;

$redirect_uri = "https://pvpoke.com";

$oauth_client = new OAuth($patreon_client_id, $patreon_client_secret);

$tokens = $oauth_client->get_tokens($_GET['code'], $redirect_uri);

var_dump($tokens);

if(isset($tokens['access_token'])){
	$access_token = $tokens['access_token'];
	$refresh_token = $tokens['refresh_token'];

	$api_client = new API($access_token);
	$api_client->api_return_format = 'object';

	// Retrieve the current user
	$patron_response = $api_client->fetch_user();

	var_dump($patron_response);
}

exit();

?>
