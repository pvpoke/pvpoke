<?php

$META_TITLE = 'Custom Rankings';

$META_DESCRIPTION = 'Configure a custom cup and see simple rankings.';


require_once 'header.php'; ?>

<h1>Custom Rankings</h1>
<div class="section white custom-rankings">
	<?php require 'modules/leagueselect.php'; ?>

	<p>Select your rulesets below for which Pokemon to include or exclude.</p>
	
	<div class="include">
		<h3>Include</h3>
		<p>Pokemon will be included if they meet all of the criteria below.</p>
		<div class="filters">
			<p>No filters yet.</p>
		</div>
		<button class="add-filter">+ Add Filter</button>
	</div>
	
	<div class="exclude">
		<h3>Exclude</h3>
		<p>Pokemon will be excluded if they meet any of the criteria below.</p>
		<div class="filters">
			<p>No filters yet.</p>
		</div>
		<button class="add-filter">+ Add Filter</button>
	</div>
	

	<button class="simulate">Simulate</button>

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
