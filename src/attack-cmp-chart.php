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

	<p class="mt-1">When two Charged Moves occur on the same turn, the Pokemon with the highest Attack stat goes first. The chart below shows Attack stat ranges for each Pokemon. Click to see which Pokemon overlap.</p>

	<div class="flex align-items-center gap-15" style="margin-bottom: 15px;">
		<div class="poke-search-container">
			<input class="poke-search" target="cmp-chart" type="text" placeholder="Search Pokemon" />
			<a href="#" class="search-info">i</a>
		</div>
	</div>


	<div class="table-container cmp-chart-container">
		<table class="train-table cmp-chart" cellspacing="0">
			<thead>
				<tr>
					<th class="sticky poke-name"><a href="#" data="name">Pokemon</a></th>
					<th></th>
					<th><a href="#" class="sticky selected" data="attack">Attack Stat Range</a></th>
				</tr>
				<!--Row html to clone-->
				<tr class="hide">
					<td class="sticky poke-name"><div class="name"></div></td>
					<td class="link"><a target="_blank" href="#"></a></td>
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

	<div class="cmp-legend align-items-center flex gap-15 desktop">
		<div>Compare with:</div>
		<div class="legend-item flex align-items-center selected" data="typical">
			<div class="legend-square"></div>
			<div>Typical Attack range (with PvP IV's)</div>
		</div>
		<div class="legend-item flex align-items-center" data="full">
			<div class="legend-square light"></div>
			<div>Full Attack range</div>
		</div>
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
	<a class="toggle" href="#">Pokemon List <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>Customize the list below to add or remove Pokemon from the chart. Note that links shared from this page can only show the default list.</p>
		<?php require 'modules/pokemultiselect.php'; ?>
	</div>
</div>

<div class="section about white">
	<a class="toggle" href="#">About Charged Move Priority (CMP) <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>A Charged Move Priority (also called Charged Attack Priority) occurs when opposing Pokemon use a Charged Attack at the same time. Knowing when your Pokemon will win or lose CMP is valuable during competitive play.</p>
		<h4>What determines CMP?</h4>
		<p>The Pokemon with the higher Attack stat acts first during a CMP tie. A Pokemon's Attack stat is influenced by its base stat, level, and IV's. You can find your Pokemon's exact Attack stat by entering its IVs in the battle simulator. Attack stats displayed on the site are floored for readability, but note that the Attack stat uses its full decimal value to determine CMP.</p>
		<p>If two Pokemon tie with identical Attack stats, the winner is determined at random.</p>
		<p>Damage multipliers such as the Shadow bonus or stat buffs/debuffs have no effect on CMP.</p>
		<p>Forme changing Pokemon whose base stats change during combat (such as Aegislash) will use their current forme's stats to resolve CMP ties.</p>
		<h4>Why did I lose CMP when I should have won?</h4>
		<p>First, beware of some situations which appear like CMP ties but actually aren't. Sometimes called "false CMP", this can occur because you are still locked in your Fast Attack animation when you press your Charged Attack. Be alert when different Fast Attack durations are in play, and if your opponent is practicing optimal move timing.</p>
		<p>Second, technical issues such as lag or frame drops may cause you to miss a turn and fail to trigger CMP. This can occur more frequently when you attempt to fire a Charged Attack from a benched Pokemon after another of your Pokemon has fainted.</p>
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
