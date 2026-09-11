<?php

require_once __DIR__ . '/../modules/moveLanguages.php';

/*
* Given JSON data, write to the settings cookie
*/

if(! isset($_POST)){
	$response = [
		'response' => 'error'
		];

	echo json_encode($response);
	
	exit();
}

$supportedLanguages = array_keys(getMoveLanguages());

if(! isset($_POST['language']) || ! in_array($_POST['language'], $supportedLanguages, true)){
	$_POST['language'] = 'en';
}

$data = json_encode($_POST);

// Write to cookie

setcookie('settings', $data, time() + (5 * 365 * 24 * 60 * 60), '/');

// Return a JSON response

$response = [
	'response' => 'success',
	'data' => $data
	];

header('Content-Type: application/json');
echo json_encode($response);

?>
