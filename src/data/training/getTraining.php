<?php
header('Content-Type: application/json; charset=utf-8');

if(! isset($_GET['format'])){
	exit();
}

// Parameters
$format = $_GET['format'];
$lookbackDays = 14; // Number of days to look back for data from the present days
$lookbackTimestamp = date('Y-m-d 00:00:00', strtotime(date('Y-m-d') . ' - ' . $lookbackDays . ' days'));
$pokeMinimum = 0; // Required Pokemon usage volume to appear in the data
$teamMinimum = 0; // Required team usage volume to appear in the data
$usageBreakdownMinimum = .05; // Required Pokemon usage percentage to get usage trend data

$data = new stdClass();
$data -> properties = new stdClass();
$data -> performers = array();
$data -> teams = array();

require_once '../../modules/config.php';

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
$mysqli->set_charset('utf8');

// Date and time of update
$data->properties->lastUpdated = date("F j, Y");

// Total Pokemon count in timespan
$query = $mysqli->prepare("SELECT COUNT(*) FROM training_pokemon WHERE postDatetime > ? AND format = ?");
$query->bind_param("ss", $lookbackTimestamp, $_GET['format']);
$query->execute();
$query->bind_result($totalPokemon);
$query->fetch();
$query->close();

$data->properties->totalPerformers = $totalPokemon;

// Total team count in timespan
$query = $mysqli->prepare("SELECT COUNT(*) FROM training_team WHERE postDatetime > ? AND format = ?");
$query->bind_param("ss", $lookbackTimestamp, $_GET['format']);
$query->execute();
$query->bind_result($totalTeams);
$query->fetch();
$query->close();

$data->properties->totalTeams = $totalTeams;

// Get top individual performers within the timespan
$query = $mysqli->prepare("SELECT pokemonId, AVG(individualScore), AVG(teamScore) as teamAvg, COUNT(*) FROM training_pokemon WHERE postDatetime > ? AND format = ? GROUP BY pokemonId HAVING COUNT(*) > ? ORDER BY teamAvg DESC");
$query->bind_param("ssi", $lookbackTimestamp, $_GET['format'], $pokeMinimum);
$query->execute();
$query->bind_result($pokemonId, $individualScore, $teamScore, $games);
while($query->fetch()){
	$pokemon = new stdClass();
	$pokemon->pokemon = $pokemonId;
	$pokemon->individualScore = floatval(number_format($individualScore, 2));
	$pokemon->teamScore = floatval(number_format($teamScore, 2));
	$pokemon->games = $games;

	array_push($data -> performers, $pokemon);
}

$query->close();

// Get usage for individual performers over time, in a specified window of days
$usagePeriod = 3; // Number of days per lookbackperiod
$usagePeriodCount = 10; // Number of periods to look back

for($i = 1; $i <= $usagePeriodCount; $i++){
	$lookbackDayStart = strtotime(date('Y-m-d') . ' - ' . ($usagePeriod * $i) . ' days');
	$lookbackDayEnd = strtotime(date('Y-m-d') . ' - ' . ($usagePeriod * ($i-1)) . ' days');
	$lookbackStartStr = date('Y-m-d 00:00:00', $lookbackDayStart);
	$lookbackEndStr = date('Y-m-d 23:59:59', $lookbackDayEnd);

	// Total Pokemon count in the current day
	$query = $mysqli->prepare("SELECT COUNT(*) FROM training_pokemon WHERE postDatetime > ? AND postDatetime < ? AND format = ?");
	$query->bind_param("sss", $lookbackStartStr, $lookbackEndStr, $_GET['format']);
	$query->execute();
	$query->bind_result($totalPokemonByPeriod);
	$query->fetch();
	$query->close();

	$totalTeamsByPeriod = $totalPokemonByPeriod / 3;

	foreach($data -> performers as $poke){
		if($poke -> games / $totalPokemon >= $usageBreakdownMinimum){
			// Record usage breakdown for this Pokemon
			if($i == 1){
				$poke -> usageTrend = array();
			}

			// Total Pokemon count in the current day
			$query = $mysqli->prepare("SELECT COUNT(*) FROM training_pokemon WHERE pokemonId = ? AND postDatetime > ? AND postDatetime < ? AND format = ?");
			$query->bind_param("ssss", $poke->pokemon, $lookbackStartStr, $lookbackEndStr, $_GET['format']);
			$query->execute();
			$query->bind_result($pokemonUsageByPeriod);
			$query->fetch();
			$query->close();

			$usage = floatval(number_format( ($pokemonUsageByPeriod / $totalTeamsByPeriod) * 100, 2));
			array_unshift($poke->usageTrend, $usage);
		}
	}
}

// Get top teams within the timespan
$query = $mysqli->prepare("SELECT teamStr, AVG(teamScore) as teamAvg, COUNT(*) FROM training_team WHERE postDatetime > ? AND format = ? GROUP BY teamStr HAVING COUNT(*) > ? ORDER BY teamAvg DESC");
$query->bind_param("ssi", $lookbackTimestamp, $_GET['format'], $teamMinimum);
$query->execute();
$query->bind_result($teamStr, $teamScore, $games);
while($query->fetch()){
	$team = new stdClass();
	$team->team = $teamStr;
	$team->teamScore = floatval(number_format($teamScore, 2));
	$team->games = $games;

	array_push($data -> teams, $team);
}

$query->close();

$mysqli->close();

echo json_encode($data);

exit();
 ?>
