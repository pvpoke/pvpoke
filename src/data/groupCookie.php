<?php

/*
* Given JSON data, write to the custom group cookie.
* Alternatively, read and return the custom group cookie.
*/

// Read

$data = [];

if(isset($_COOKIE['custom_groups'])){
	$data = json_decode($_COOKIE['custom_groups']);
}

if((isset($_POST['data']))&&(isset($_POST['name']))){
	
	// Write
	
	$groupFound = false;
	
	foreach($data as &$group){
		if($group['name'] == $_POST['name']){
			
			$groupFound = true;
			
			$group['data'] = $_POST['data'];
		}
	}
	
	if(! $groupFound){
		array_push($data, ['name' => $_POST['name'], 'data' => $_POST['data']]);
	}
	
	// Write to cookie
	
	$_COOKIE['custom_groups'] = json_encode($data);
	
}

// Return a JSON response

$response = [
	'response' => 'success',
	'data' => $data
	];

echo json_encode($response);

?>