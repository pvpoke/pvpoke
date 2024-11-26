<?php
header("Content-Type: text/csv");
header("Content-Disposition: attachment; filename=movesets.csv");

$gm = json_decode(file_get_contents('gamemaster.json'), true);

$output = fopen('php://output', 'w');
fputcsv($output, ['Pokemon', 'Fast Moves', 'Charged Moves']);

// Iterate through Pokemon and list attack names
foreach ($gm['pokemon'] as $pokemon) {
	$fastMoves = array();
	$chargedMoves = array();

	$keys = array_column($gm['moves'], 'moveId');

	foreach ($pokemon['fastMoves'] as $moveId) {
		$index = array_search($moveId, $keys);
		$move = $gm['moves'][$index];

		array_push($fastMoves, $move['name']);
	}

	foreach ($pokemon['chargedMoves'] as $moveId) {
		$index = array_search($moveId, $keys);
		$move = $gm['moves'][$index];
		
		array_push($chargedMoves, $move['name']);
	}

	fputcsv($output, [$pokemon['speciesName'], implode($fastMoves, '|'), implode($chargedMoves, '|')]);
}

fclose($output);
?>
