<?php

require_once __DIR__ . '/../modules/moveLanguages.php';

header('Content-Type: application/json');

$supportedLanguages = array_keys(getMoveLanguages());
$language = isset($_POST['language']) ? $_POST['language'] : '';

if(! in_array($language, $supportedLanguages, true)){
	http_response_code(400);
	echo json_encode([
		'response' => 'error',
		'message' => 'Unsupported language'
	]);
	exit();
}

$settings = [];

if(isset($_COOKIE['settings'])){
	$storedSettings = json_decode($_COOKIE['settings'], true);

	if(is_array($storedSettings)){
		$settings = $storedSettings;
	}
}

$settings['language'] = $language;
$data = json_encode($settings);

setcookie('settings', $data, time() + (5 * 365 * 24 * 60 * 60), '/');

echo json_encode([
	'response' => 'success',
	'language' => $language
]);

?>
