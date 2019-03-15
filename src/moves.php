<?php

$CANONICAL = '/moves/';

$META_TITLE = 'PvP Move List';

$META_DESCRIPTION = 'Explore moves and movsets in Pokemon GO PvP.';

require_once 'header.php';

?>

<h1>Moves</h1>
<div class="section white">
	<select class="mode-select">
		<option value="fast">Fast Moves</option>
		<option value="charged">Charged Moves</option>
		<option value="charged">Moveset Explorer</option>
	</select>
	<p>The table below lists every move in the game, their stats, and which Pokemon can learn them. Sort or filter, or experiment with a custom moveset.</p>
	<h2 class="loading">Loading data...</h2>
	<table class="sortable-table stats-table moves" cellpadding="0" cellspacing="0"></table>
</div>


<!--test 2-->
<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=46"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=12"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/SortableTable.js"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/MovesInterface.js"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=6"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=24"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=2"></script>

<?php require_once 'footer.php'; ?>