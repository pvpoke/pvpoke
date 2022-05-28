<?php

function debug_to_console($data) {
    $output = $data;
    if (is_array($output))
        $output = implode(',', $output);

    echo "<script>console.log('Debug Objects: " . $output . "' );</script>";
}

//currenty just want to see what the post request looks like
//exit();
debug_to_console($_FILES);
debug_to_console("in network handler");


if((! isset($_POST["model.json"])) || (! isset($_POST["model.weights.bin"]))){
    exit();
}

$response = [
	'response' => 'success'
	];

$filedir = "training/ainetwork/";
$filepath = $filedir . basename($_FILES['model.json']['name']);
if(! move_uploaded_file($_FILES['model.json']['tmp_name'], $filepath)){
	$response = [
        'response' => 400
        ];
}

$filepath = $filedir . basename($_FILES['model.weights.bin']['name']);
if(! move_uploaded_file($_FILES['model.weights.bin']['tmp_name'], $filepath)){
    $response = [
        'response' => 400
        ];
}


// Return a JSON response
echo json_encode($response);


?>