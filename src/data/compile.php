<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
</head>

<body>
<?php

// Build gamemaster.json from individual json chunks

$jsonBase = json_decode(file_get_contents('gamemaster/base.json'), true);
$jsonPokemon = json_decode(file_get_contents('gamemaster/pokemon.json'), true);
$jsonMoves = json_decode(file_get_contents('gamemaster/moves.json'), true);
$jsonCups = json_decode(file_get_contents('gamemaster/cups/archive/cups.json'), true);

$jsonBase["pokemon"] = $jsonPokemon;
$jsonBase["moves"] = $jsonMoves;
$jsonBase["cups"] = $jsonCups;

$json = json_encode($jsonBase, JSON_UNESCAPED_SLASHES);

file_put_contents('gamemaster.json', $json);
file_put_contents('gamemaster.min.json', $json);

echo 'gamemaster compiled';


?>
</body>
</html>
