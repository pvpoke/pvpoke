<?php

if(! isset($_POST)){
	$response = [
		'response' => 'error'
		];

	echo json_encode($response);
	
	exit();
}

$data = $_POST['data'];

file_put_contents('battleLog.csv', $json);

$response = ['response' => 'success'];
echo json_encode($response);
?>