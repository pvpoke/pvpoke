<?php

/*
* Given JSON data, write to a file.
* This really, really, really doesn't belong in production. So watch out.
*/

// Validate that data exists and falls within the allowed parameters

if( (! isset($_POST['data'])) || (! isset($_POST['league'])) || (! isset($_POST['category'])) || (! isset($_POST['cup']))){
	exit("Data does not have valid keys.");
}

$leagues = [500,1500,2500,10000];
$categories = ["closers","attackers","defenders","leads","switches","chargers","consistency","overall","overrides"];

if( (! in_array($_POST['league'], $leagues)) || (! in_array($_POST['category'], $categories)) ){
	exit("League or category is not valid");
}

$json = json_decode($_POST['data']);

if($json === null){
	exit("JSON cannot be decoded.");
}

$cup = basename($_POST['cup']);
$filepath = '';

if($_POST['category'] == 'overrides'){
	$filepath = 'overrides/' . $cup . '/' . $_POST['league'] . '.json';
} else{
	$filepath = 'rankings/' . $cup . '/' . $_POST['category'] . '/rankings-' . $_POST['league'] . '.json';
}


if(file_put_contents($filepath, $_POST['data']) !== false){
	echo '{ "status": "Success" }';
} else{
	echo '{ "status": "Fail" }';
}

?>
