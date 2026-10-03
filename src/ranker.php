<?php require_once 'header.php'; ?>

<h1>Ranker</h1>
<div class="section white">
	<?php require 'modules/formatselect.php'; ?>
	<a style="margin-left: 30px;" class="rankersandbox-link" href="<?php echo $WEB_ROOT; ?>rankersandbox.php">Rankersandbox &rarr;</a>

	<div class="check exclude-low-pokemon on"><span></span>Exclude Low-Performing Targets</div>
	<p></p>
	<p class="small">This setting excludes Pokemon which have a league overall score of less than 70 from the simulation targets. (They are still included in the rankings, but matchups against them are skipped.) This reduces the time it takes to generate results. Recommend disabling for small metas and first passes on large metas.</p>

	<p>Select your format above and generate rankings. These will be saved as JSON to the '/data/rankings/' directory. This process may take a few minutes. Follow the instructions below to set up rankings for a new cup, or open the developer console for more info.</p>

	<button class="button simulate">Simulate</button>

	<div class="output"></div>
</div>

<?php require_once 'modules/scripts/battle-scripts.php'; ?>

<script src="js/GameMaster.js?v=2"></script>
<script src="js/pokemon/Pokemon.js?v=2"></script>
<script src="js/interface/RankerInterface.js?v=2"></script>
<script src="js/battle/rankers/Ranker.js"></script>
<script src="js/RankerMain.js"></script>

<?php require_once 'footer.php'; ?>
