<?php

$META_TITLE = 'Damage Visualizer';
$META_DESCRIPTION = 'Calculate how much damage a Pokemon\'s charged moves deal against a group of opponents in Pokemon GO PvP.';
$CANONICAL = '/damage-visualizer/';

require_once 'header.php';

?>

<h1>Damage Visualizer</h1>

<div class="section league-select-container white">
	<?php require 'modules/leagueselect.php'; ?>
	<p class="description">Select a Pokemon and see how much damage its charged moves deal to a group of opponents.</p>
</div>

<div class="section poke-select-container matrix damage-viz">
	<?php require 'modules/pokeselect.php'; ?>
	<?php require 'modules/pokemultiselect.php'; ?>
</div>

<div class="section">
	<button class="battle-btn button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-battle"></span>
			<span class="btn-label">Generate</span>
		</span>
	</button>
</div>

<div class="section white damage-viz-results hide">
	<div class="damage-viz-header">
		<h3 class="section-title">Results</h3>
		<button class="damage-viz-sort button">Sort: Most Damage &#9660;</button>
	</div>
	<div class="damage-viz-container"></div>
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
<script src="<?php echo $WEB_ROOT; ?>js/interface/DamageVisualizerInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
