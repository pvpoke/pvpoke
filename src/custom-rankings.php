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
		<div class="filters" list-index="0">
			<p>No filters yet.</p>
		</div>
		<button class="add-filter" list-index="0">+ Add Filter</button>
	</div>
	
	<div class="exclude">
		<h3>Exclude</h3>
		<p>Pokemon will be excluded if they meet any of the criteria below.</p>
		<div class="filters" list-index="1">
			<p>No filters yet.</p>
		</div>
		<button class="add-filter" list-index="1">+ Add Filter</button>
	</div>
	
	<div class="filter clone hide">
		<a class="toggle" href="#"><span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span> <span class="name">Filter Name</span></a>
		<div class="toggle-content">
			<div class="field-container">
				<label>Filter Type:</label>
				<select class="filter-type">
					<option value="type">Type</option>
					<option value="tag">Tag</option>
					<option value="species">Species</option>
					<option value="dex">Pokedex Number</option>
				</select>
			</div>
		</div>
	</div>

	<button class="simulate">Simulate</button>

	<div class="output"></div>
</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/CustomRankingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/RankerSandboxWeightingMoveset.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankerMain.js"></script>

<?php require_once 'footer.php'; ?>
