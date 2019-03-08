<?php

/*
* Given JSON data, write to the custom group cookie.
*/

if(! isset($_POST['name'])){
	$response = [
		'response' => 'error'
		];

	echo json_encode($response);
	
	exit();
}

$data = [
	'name'=>$_POST['name'],
	'data'=>$_POST['data']
];

$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '_', $_POST['name'])));

if(isset($_POST['data'])){
	setCookie('custom_group_' . $slug, json_encode($data), time() + (5 * 365 * 24 * 60 * 60), '/');
}

// Return a JSON response

$response = [
	'response' => 'success',
	'data' => $data
	];

echo json_encode($response);

?>