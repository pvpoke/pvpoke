<?php

if((! isset($_FILES["model_json"])) || (! isset($_FILES["model_weights_bin"]))){
    exit();
}

$response = [
	'response' => 'success'
	];

$filedir = "training/ainetwork/";
$filepath = $filedir . basename($_FILES['model_json']['name']);
if(! move_uploaded_file($_FILES['model_json']['tmp_name'], $filepath)){
	$response = [
        'response' => 400
        ];
}

$filepath = $filedir . basename($_FILES['model_weights_bin']['name']);
if(! move_uploaded_file($_FILES['model_weights_bin']['tmp_name'], $filepath)){
    $response = [
        'response' => 400
        ];
}


// Return a JSON response
echo json_encode($response);


?>