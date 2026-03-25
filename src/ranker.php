<?php require_once 'header.php'; ?>

<h1>Ranker</h1>
<div class="section white">
	<?php require 'modules/formatselect.php'; ?>
	<a style="margin-left: 30px;" class="rankersandbox-link" href="<?php echo $WEB_ROOT; ?>rankersandbox.php">Rankersandbox &rarr;</a>
	<p></p>
	<p>Select your format above and generate rankings. These will be saved as JSON to the '/data/rankings/' directory. This process may take a few minutes. Follow the instructions below to set up rankings for a new cup, or open the developer console for more info.</p>

	<button class="button simulate">Simulate</button>

	<div class="output">
		<div id="ranker-progress-container" style="margin-top:15px; display:none;">
			<div id="ranker-progress-status" style="margin-bottom:8px;">Ready to run.</div>
			<div id="ranker-progress-bar-wrap" style="height:20px; background:#eee; border-radius:4px; overflow:hidden;">
				<div id="ranker-progress-bar" style="width:0%; height:100%; background:#2b8cff;"></div>
			</div>
			<div id="ranker-progress-text" style="margin-top:5px;">0 / 0 scenarios</div>
		</div>
	</div>
</div>

<?php require_once 'modules/scripts/battle-scripts.php'; ?>

<script src="js/GameMaster.js?v=2"></script>
<script src="js/pokemon/Pokemon.js?v=2"></script>
<script src="js/interface/RankerInterface.js?v=2"></script>
<script src="js/battle/rankers/Ranker.js"></script>
<script src="js/RankerMain.js"></script>

<?php require_once 'footer.php'; ?>
