<?php

$cp = '1500';
$cup = 'all';

if(isset($_GET['cp'])){
	$cp = htmlspecialchars($_GET['cp']);
}

if(isset($_GET['cup'])){
	$cup = htmlspecialchars($_GET['cup']);
}

$CANONICAL = '/attack-cmp-chart/' . $cup . '/' . $cp;

$league = 'Great League';

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
}

$META_TITLE = 'Attack Stat (CMP) Chart | ' . $league;

$META_DESCRIPTION = 'See the Attack stat ranges of Pokemon in ' . $league . ' and which Pokemon win Charged Move Priority (CMP). The Pokemon with the higher Attack stat goes first.';

require_once 'header.php';

?>

<h1>Attack Stat (CMP) Chart</h1>
<div class="section white">

	<?php require_once 'modules/formatselect.php'; ?>

	<p class="mt-1">When two Charged Moves occur on the same turn, the Pokemon with the highest Attack stat goes first. The chart below shows Attack stat ranges for each Pokemon. Click to see which Pokemon overlap with one another.</p>

	<div class="poke-search-container">
		<input class="poke-search" target="cmp-chart" type="text" placeholder="Search Pokemon" />
		<a href="#" class="search-info">i</a>
	</div>

	<div class="table-container cmp-chart-container">
		<table class="train-table cmp-chart" cellspacing="0">
			<thead>
				<tr>
					<th class="sticky poke-name"><a href="#" data="name">Pokemon</a></th>
					<th><a href="#" class="sticky selected" data="attack">Attack Stat</a></th>
				</tr>
				<!--Row html to clone-->
				<tr class="hide">
					<td class="sticky poke-name"><div class="name"></div></td>
					<td class="attack-range">
						<div class="cmp-item">
							<div class="bar"></div>
							<div class="subbar"></div>
							<div class="min"></div>
							<div class="max"></div>
						</div>
					</td>
				</tr>
			</thead>
			<tbody>
			</tbody>
		</table>
	</div>

	<div class="share-link-container">
		<p>Share this chart:</p>
		<div class="share-link">
			<input type="text" value="" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<?php require 'modules/ads/body-728.php'; ?>

<div class="section white custom-rankings-meta-group">
	<h3>Pokemon List</h3>
	<p>Customize the list below to add or remove Pokemon from the chart. Note that links shared from this page only show the default list.</p>
	<?php require 'modules/pokemultiselect.php'; ?>
</div>

<div class="section about white">
	<a class="toggle" href="#">About Charged Move Priority <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>This page offers another way to analyze the PvP meta to find Pokemon and teams that may work for you. Knowing what the data represents will help you make the most of it.</p>
		<h2>Where does this data come from?</h2>
		<p>Data is sampled from <a href="<?php echo $WEB_ROOT; ?>train/">Training Battles</a> people play against the site's bot. The sampled data is typically over a 7-day period. It includes Pokemon and team data as played by both players and the bot. While it doesn't directly represent battles from the game, it is a close approximation.</p>
		<p>The data is sampled with a threshold of around 150 minimum games for Pokemon, and 20 games minimum for teams. Pokemon and teams near these thresholds are marked orange to highlight their small sample sizes. Pokemon or teams with small sample sizes are more prone to being outliers (whether overperforming or underperforming). Consider these data points with some healthy skepticism.</p>
		<h3>How does this page differ from the regular rankings?</h3>
		<p>The regular rankings are generated using 1 vs 1 simulations between eligible Pokemon. The results are empirical and repeatable, but don't take into account team composition or full dynamic play like switching or failed/successful baits. It can provide immediate results for new Pokemon or move updates.</p>
		<p>The Training Analysis data is recorded from fully played games from the Train feature. Team composition, player decisions, and dynamic play are all taken into account. It is able to provide a fuller picture than the simulated rankings. However, the data is not empirical. Performance and usage numbers are subject to the players who use the Train feature, how frequently they use particular Pokemon, and their performance with those Pokemon. Training Analysis also cannot provide immediate data for new Pokemon or move updates; a sufficient volume of battles must be recorded first.</p>
	</div>
</div>

<?php require_once 'modules/search-string-help.php'; ?>

<?php require_once 'modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/Pokebox.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/AttackChartInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=3"></script>

<?php require_once 'footer.php'; ?>
