<?php

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