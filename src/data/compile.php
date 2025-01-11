<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
</head>

<body>
<?php

// Build gamemaster.json from individual json chunks

$base = json_decode(file_get_contents('gamemaster/base.json'), true);
$pokemon = json_decode(file_get_contents('gamemaster/pokemon.json'), true);
$moves = json_decode(file_get_contents('gamemaster/moves.json'), true);
$formats = json_decode(file_get_contents('gamemaster/formats.json'), true);
//$cups = json_decode(file_get_contents('gamemaster/cups/archive/cups.json'), true);

$base["timestamp"] = date("Y-m-d H:i:s", time());
$base["pokemon"] = $pokemon;
$base["moves"] = $moves;
$base["formats"] = $formats;

// Iterate through all active cup files and add to the cups list
$dir = new DirectoryIterator(dirname(__FILE__) . '/gamemaster/cups');
foreach ($dir as $file) {
    if ($file->getExtension() == 'json') {
		$cup = json_decode(file_get_contents('gamemaster/cups/'. $file->getFilename()), true);

		if(! is_null($cup)){
			array_push($base["cups"], $cup);
		} else{
			echo $file->getFilename() . ' is missing or invalid<br>';
		}
    }
}

$json = json_encode($base, JSON_UNESCAPED_SLASHES);

file_put_contents('gamemaster.json', $json);
file_put_contents('gamemaster.min.json', $json);

echo 'gamemaster compiled';


?>
</body>
</html>
