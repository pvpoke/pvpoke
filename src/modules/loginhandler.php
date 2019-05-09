<?php

// Patreon login code from https://github.com/Patreon/patreon-php/

require_once('./libs/patreon/API.php');
require_once('./libs/patreon/OAuth.php');

use Patreon\API;
use Patreon\OAuth;

$client_id = '';      // Replace with your data
$client_secret = '';  // Replace with your data

$redirect_uri = "https://pvpoke.com";

$oauth_client = new OAuth($client_id, $client_secret);

$tokens = $oauth_client->get_tokens($_GET['code'], $redirect_uri);
$access_token = $tokens['access_token'];
$refresh_token = $tokens['refresh_token'];


exit();

?>
