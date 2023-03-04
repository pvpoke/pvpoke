<?php require_once 'header.php'; ?>

<h1>Ranker Sandbox</h1>
<div class="section league-select-container">
	<?php require 'modules/formatselect.php'; ?>
	<button class="simulate">Simulate</button>

	<a style="margin-left: 30px;" class="rankings-link" href="<?php echo $WEB_ROOT; ?>rankings/">Rankings &rarr;</a>

	<div class="output"></div>
</div>

<script src="js/GameMaster.js?v=50"></script>
<script src="js/pokemon/Pokemon.js"></script>
<script src="js/interface/RankerInterface.js"></script>
<script src="js/battle/TimelineEvent.js"></script>
<script src="js/battle/Battle.js"></script>
<script src="js/battle/RankerOverall.js"></script>
<script src="js/RankerMain.js"></script>

<?php require_once 'footer.php'; ?>
