<?php

/*
* Given JSON data, write to a file.
* This really, really, really doesn't belong in production. So watch out.
*/

// Validate that data exists and falls within the allowed parameters

if( (! isset($_POST['data'])) || (! isset($_POST['league'])) || (! isset($_POST['category'])) || (! isset($_POST['cup']))){
	exit();
}

// If only there was some universal source for this info, like some kind of master file??
// But nah let's scratch our head for 20 minutes when we can't figure out why the write function doesn't work after we change a name

$leagues = [500,1500,2500,10000];
$categories = ["closers","attackers","defenders","leads","switches","chargers","consistency","overall","beaminess"];

if( (! in_array($_POST['league'], $leagues)) || (! in_array($_POST['category'], $categories)) ){
	exit();
}

$json = json_decode($_POST['data']);

if($json === null){
	exit();
}

$filepath = 'rankings/' . $_POST['cup'] . '/' . $_POST['category'] . '/rankings-' . $_POST['league'] . '.json';;

if(file_put_contents($filepath, $_POST['data'])){
	echo '{ "status": "Success" }';
} else{
	echo '{ "status": "Fail" }';
}



?>
