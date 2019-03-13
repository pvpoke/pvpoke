<?php require_once 'header.php'; ?>

<h1>Ranker</h1>
<div class="section white">
	
	<?php require 'modules/cupselect.php'; ?>

	<p>The button below will generate ranking data for all leagues and categories, and save it to the '/data' directory. Open the developer console before clicking to see output. This process may take a few minutes.</p>
	
	<button class="simulate">Simulate</button>
	
	<div class="output"></div>
</div>

<script src="js/GameMaster.js?v=2"></script>
<script src="js/pokemon/Pokemon.js?v=2"></script>
<script src="js/interface/RankerInterface.js?v=2"></script>
<script src="js/battle/TimelineEvent.js?v=2"></script>
<script src="js/battle/Battle.js?v=2"></script>
<script src="js/battle/RankerSandboxWeighting.js"></script>
<script src="js/RankerMain.js"></script>

<?php require_once 'footer.php'; ?>