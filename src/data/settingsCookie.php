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

// Map new settings to any existing settings
$settings = [];

if (isset($_COOKIE['settings'])) {
	$settings = json_decode($_COOKIE['settings'], true);
}

// Only update properties supplied in POST.
$settings = array_replace($settings, $_POST);

// Preserve the existing language unless a valid replacement was supplied.
$supportedLanguages = array_keys(getMoveLanguages());

if (isset($_POST['language']) && !in_array($_POST['language'], $supportedLanguages, true)) {
	if (isset($settings['language']) && in_array($settings['language'], $supportedLanguages, true)) {
		$settings['language'] = $settings['language'];
	} else {
		$settings['language'] = 'en';
	}
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
