<?php

if(! isset($_POST)){
	$response = [
		'response' => 'error'
		];

	echo json_encode($response);
	
	exit();
}

$results = $_POST['results'];

file_put_contents('battleLog.csv', $results, FILE_APPEND);

$response = ['response' => 'success', 'data' => $results];
echo json_encode($response);
?>