<?php

$META_TITLE = 'IVs';

$META_DESCRIPTION = 'Investigate damage breakpoints and bulkpoints across a meta to see if your Pokemon is worth powering up.';

$CANONICAL = '/ivs/';

if(isset($_GET['p'])){
	// Put Pokemon names in the meta title

	$name = ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['p']))[0]));

	$META_TITLE = 'IVs - ' . $name;
}

require_once 'header.php';

?>

<h1>IVs</h1>

<div class="section league-select-container white">
	<?php require 'modules/leagueselect.php'; ?>
	<select class="mode-select">
		<option value="breakpoints">Breakpoints</option>
		<option value="bulkpoints">Bulkpoints</option>
		<option value="cmp">Charged Move Ties</option>
	</select>
	<p class="description breakpoints">Select a Pokemon and targets to evaluate Fast Move breakpoints against them.</p>
	<p class="description bulkpoints hide">Select a Pokemon and targets to evaluate Fast Move breakpoints against your Pokemon.</p>
	<p class="description cmp hide">Select a Pokemon and targets to evaluate Charged Move ties against them.</p>
</div>

<div class="section poke-select-container iv-tool">
	<?php require 'modules/pokeselect.php'; ?>
	<?php require 'modules/pokemultiselect.php'; ?>
	<div class="clear"></div>
</div>

<button class="button analyze">Analyze</button>

<div class="section white breakpoint-results">
	<h3 class="iv-title"></h3>
	<div class="iv-table">
	</div>
</div>


<div class="share-link-container">
	<p>Share this battle:</p>
	<div class="share-link">
		<input type="text" value="" readonly>
		<div class="copy">Copy</div>
	</div>
</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/IVInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
