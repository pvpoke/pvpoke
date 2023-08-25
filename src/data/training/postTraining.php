<?php
header('Content-Type: application/json; charset=utf-8');

$response = new stdClass();
$response -> result = 1;
$response -> error = '';

session_start();

if(! isset($_SESSION['last_training_timestamp'])){
	$_SESSION['last_training_timestamp'] = 0;
}

if(time() - $_SESSION['last_training_timestamp'] < 120){
	$response -> result = 0;
	$response -> error = 'Rate limited';
	echo json_encode($response);
	exit();
} else{
	$_SESSION['last_training_timestamp'] = time();
}

if(! isset($_POST['pokemon']) || ! isset($_POST['teams'])){
	$response -> result = 0;
	$response -> error = 'Insufficient data posted';
	echo json_encode($response);
	exit();
}

require_once '../../modules/config.php';

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
$mysqli->set_charset('utf8');

$query = $mysqli->prepare("INSERT INTO training_pokemon(pokemonId, format, teamPosition, playerType, teamScore, individualScore, shields) VALUES (?, ?, ?, ?, ?, ?, ?)");

foreach($_POST['pokemon'] as $poke){
	$query->bind_param("ssiiidi", $poke['pokemonId'], $poke['format'], $poke['teamPosition'], $poke['playerType'], $poke['teamScore'], $poke['individualScore'], $poke['shields']);
	if($query->execute() === false){
		$response -> result = 0;
		$response -> error = 'One or more Pokemon records failed';
	}
}

$query = $mysqli->prepare("INSERT INTO training_team(teamStr, format, playerType, teamScore) VALUES (?, ?, ?, ?)");

foreach($_POST['teams'] as $team){
	$query->bind_param("ssii", $team['teamStr'], $team['format'], $team['playerType'], $team['teamScore']);
	if($query->execute() === false){
		$response -> result = 0;
		$response -> error = 'One or more team records failed';
	}
}

$mysqli->close();

echo json_encode($response);

exit();
 ?>
