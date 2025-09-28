<?php

$META_TITLE = 'Override Editor';

require_once '../header.php';

?>

<h1>Override Editor</h1>
<div class="section league-select-container white">
	<?php require '../modules/formatselect.php'; ?>

	<a class="ranker-link" style="margin-left: 20px;" href="<?php echo $WEB_ROOT; ?>ranker.php">Ranker &rarr;</a>

	<p style="margin-top: 10px;">Select a format to edit the moveset and weighting overrides.</p>

	<div class="override-controls flex" style="margin-bottom: 20px;">
		<button class="new-pokemon">+ New Pokemon</button>
		<button class="import-movesets" style="margin-left: 15px;">Import League Movesets</button>
		<button class="clear-weights" style="margin-left: 15px;">Clear Weights</button>
		<button class="clear-editor-scores" style="margin-left: 15px;">Clear Editor Scores</button>
	</div>
	<hr></hr>
	<br>
	<div class="poke-search-container">
		<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon" />
		<a href="#" class="search-info" title="Search Help">?</a>
		<a href="#" class="search-traits" title="Search Traits">+</a>

		<div  style="margin-left: 100px;" class="flex align-items-center">
			<label>Sort:</label>
			<select style="margin-left: 5px; width:100px;" class="sort-select">
				<option value="id">ID</option>
				<option value="weight">Weight</option>
				<option value="editorscore">Editor Score</option>
			</select>
		</div>

	</div>


	<div class="ranking-header">Pokemon</div>
	<div class="ranking-header right">Weight</div>

	<h2 class="loading">Loading data...</h2>
	<div class="rankings-container clear"></div>
</div>

<textarea class="import" style="width:100%; height: 150px; padding: 10px;"></textarea>
<div class="button copy export-json">Copy</div>

<?php require_once '../modules/search-string-help.php'; ?>

<div class="search-traits-selector hide">
	<p>Select the options below to search for Pokemon traits and playstyles.</p>

	<div class="traits"></div>

	<div class="center flex">
		<div class="button search">Search</div>
	</div>
</div>

<div class="hide">
	<?php require '../modules/pokeselect.php'; ?>
</div>


<?php require_once '../modules/rankingdetails.php'; ?>

<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/OverrideInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/Pokebox.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>

<script src="<?php echo $WEB_ROOT; ?>js/battle/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/libs/hexagon-chart.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
