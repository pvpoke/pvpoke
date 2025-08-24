<?php

$cp = '1500';
$cup = 'all';

if(isset($_GET['cp'])){
	$cp = htmlspecialchars($_GET['cp']);
}

if(isset($_GET['cup'])){
	$cup = htmlspecialchars($_GET['cup']);
}

$CANONICAL = '/rankings/' . $cup . '/' . $cp . '/overall/';

switch($cp){
	case "500":
		$league = 'Little Cup';
		break;

	case "1500":
		$league = 'Great League';
		break;

	case "2500":
		$league = 'Ultra League';
		break;

	case "10000":
		$league = 'Master League';
		break;

	case "10000-40":
		$league = 'Master League Classic';
		break;

	default:
		$league = '';
		break;
}


// Load format data to generate page title
$formatFound = false;

if($cup != 'all' && ! $formatFound){
	// Only load format data for non default cups
	require_once 'data/formats.php';

	if(isset($formats) && is_array($formats)){
		// Find the format that matches the cup and cp
		foreach ( $formats as $format ) {
			if ( $cup == $format['cup'] && $cp == $format['cp'] ) {
				$league = $format['title'];
				$formatFound = true;
				break;
			}
		}

	}
}


$META_TITLE = $league . ' PvP Rankings';

$META_DESCRIPTION = 'Explore the top Pokemon for Pokemon GO PvP in the ' . $league . '. Rankings include top moves, matchups, and counters for every Pokemon, as well as ratings for different roles.';

if(isset($_GET['p'])){
	// Put Pokemon names in the meta title

	$name = ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['p']))[0]));

	if($name == 'Lanturnw'){
		$name = 'Lanturn';
	}

	$META_TITLE = $name . ' ' . $league . ' PvP Rankings';

	$META_DESCRIPTION = 'Explore key matchups, moves, and counters for ' . $name . ' in ' . $league . '.';

	$CANONICAL = '/rankings/' . $cup . '/' . $cp . '/overall/' . htmlspecialchars($_GET['p']) . '/';
}

require_once 'header.php';

?>

<h1>Quiz</h1>
<div class="section league-select-container white">
	<div class="ranking-filters flex">
		<div class="ranking-filter">
			<div class="flex">
				<h4>Format</h4>
				<a class="format-rules" href="#">Rules</a>
			</div>

			<?php require 'modules/formatselect.php'; ?>
		</div>
	</div>
</div>

<a href="#" class="button download-csv">Export to CSV</a>

<?php require 'modules/ads/body-728.php'; ?>

<?php require_once 'modules/search-string-help.php'; ?>
<?php require_once 'modules/search-traits.php'; ?>

<?php require_once 'modules/rankingdetails.php'; ?>

<div class="hide">
	<?php require 'modules/pokeselect.php'; ?>
</div>

<?php require_once 'modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/RankingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/rankers/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/libs/hexagon-chart.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
