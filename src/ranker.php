<?php require_once 'header.php'; ?>

<h1>Ranker</h1>
<div class="section white">
	<?php require 'modules/formatselect.php'; ?>
	<a style="margin-left: 30px;" class="rankersandbox-link" href="<?php echo $WEB_ROOT; ?>rankersandbox.php">Rankersandbox &rarr;</a>
	<p></p>
	<p>Select your format above and generate rankings. These will be saved as JSON to the '/data/rankings/' directory. This process may take a few minutes. Follow the instructions below to set up rankings for a new cup, or open the developer console for more info.</p>

	<button class="button simulate">Simulate</button>

	<div class="output"></div>
</div>

<script src="js/GameMaster.js?v=2"></script>
<script src="js/pokemon/Pokemon.js?v=2"></script>
<script src="js/interface/RankerInterface.js?v=2"></script>
<script src="js/battle/TimelineEvent.js?v=2"></script>
<script src="js/battle/TimelineAction.js?v=2"></script>
<script src="js/battle/Battle.js?v=2"></script>
<script src="js/battle/RankerSandboxWeightingMoveset.js"></script>
<script src="js/RankerMain.js"></script>

<?php require_once 'footer.php'; ?>
