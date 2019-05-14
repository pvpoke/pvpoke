<?php

$CANONICAL = '/pokedex/';

$META_TITLE = 'Pokedex';

$META_DESCRIPTION = 'Explore Pokemon stats for Pokemon GO PvP.';

require_once 'header.php';

?>

<h1>Pokedex</h1>
<div class="section moves white">
	<?php require_once 'modules/leagueselect.php' ?>

	<p>Sort or filter the moves below, or experiment with a custom moveset.</p>

	<h2 class="loading">Loading data...</h2>
	<div class="poke-table-container">
		<input class="poke-search" context="poke-search" type="text" placeholder="Search Move or Type" />
		<table class="sortable-table stats-table pokemon" cellpadding="0" cellspacing="0"></table>
	</div>
</div>


<!--test 2-->
<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/SortableTable.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokedexInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
