<?php

$META_TITLE = 'Custom Rankings';

$META_DESCRIPTION = 'Configure a custom cup and see simple rankings.';


require_once 'header.php'; ?>

<h1>Custom Rankings</h1>
<div class="section white custom-rankings">
	<p>This tool will generate high-level rankings to help you develop a custom meta. Select your rulesets below for which Pokemon to include or exclude.</p>

	<?php require 'modules/leagueselect.php'; ?>

	<div class="include">
		<h3>Include</h3>
		<p>Pokemon will be included if they meet all of the criteria below.</p>
		<div class="filters" list-index="0">
		</div>
		<button class="add-filter" list-index="0">+ Add Filter</button>
	</div>

	<div class="exclude">
		<h3>Exclude</h3>
		<p>Pokemon will be excluded if they meet any of the criteria below.</p>
		<div class="filters" list-index="1">
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
					<option value="id">Species</option>
					<option value="dex">Pokedex Number</option>
				</select>
			</div>
			<div class="field-section type">
				<p>Select one or more Pokemon types below. A Pokemon will be included or excluded if it has any of these types.</p>
				<div class="field-container">
					<div class="check" value="bug"><span></span> Bug</div>
					<div class="check" value="dark"><span></span> Dark</div>
					<div class="check" value="dragon"><span></span> Dragon</div>
					<div class="check" value="electric"><span></span> Electric</div>
					<div class="check" value="fairy"><span></span> Fairy</div>
					<div class="check" value="fighting"><span></span> Fighting</div>
					<div class="check" value="fire"><span></span> Fire</div>
					<div class="check" value="flying"><span></span> Flying</div>
					<div class="check" value="ghost"><span></span> Ghost</div>
					<div class="check" value="grass"><span></span> Grass</div>
					<div class="check" value="ground"><span></span> Ground</div>
					<div class="check" value="ice"><span></span> Ice</div>
					<div class="check" value="normal"><span></span> Normal</div>
					<div class="check" value="poison"><span></span> Poison</div>
					<div class="check" value="psychic"><span></span> Psychic</div>
					<div class="check" value="rock"><span></span> Rock</div>
					<div class="check" value="steel"><span></span> Steel</div>
					<div class="check" value="water"><span></span> Water</div>
					<div class="check" value="none"><span></span> Mono-type</div>
				</div>
				<div class="field-container">
					<button class="select-all">Select All</button>
					<button class="deselect-all">Deselect All</button>
				</div>
			</div>

			<div class="field-section tag">
				<p>Select one or more Pokemon categories below. A Pokemon will be included or excluded if it fits any of these requirements.</p>
				<div class="field-container">
					<div class="check" value="legendary"><span></span> Legendary</div>
					<div class="check" value="mythical"><span></span> Mythical</div>
					<div class="check" value="alolan"><span></span> Alolan</div>
					<div class="check" value="regional"><span></span> Regional</div>
				</div>
			</div>

			<div class="field-section id">
				<p>Enter a list of Pokemon ID's below, separated by commas. For inclusion, these Pokemon will be included regardless of the other filters.</p>
				<p>Pokemon ID's are lowercase. Some examples:</p>
				<ul>
					<li><em>pikachu</em></li>
					<li><em>raichu_alolan</em></li>
					<li><em>giratina_altered</em></li>
					<li><em>deoxys_defense</em></li>
				</ul>
				<div class="field-container">
					<input class="ids" placeholder="Pokemon ID's" />
				</div>
			</div>

			<div class="field-section dex">
				<p>Enter a range (inclusive) of Pokedex entry numbers to filter. Below are example ranges:</p>
				<ul>
					<li><strong>Generation 1:</strong> 1-151</li>
					<li><strong>Generation 2:</strong> 152-251</li>
					<li><strong>Generation 3:</strong> 252-386</li>
					<li><strong>Generation 4:</strong> 387-488</li>
				</ul>
				<div class="field-container">
					<input class="start-range" placeholder="Start #" />
					<input class="end-range" placeholder="End #" />
				</div>
			</div>
		</div>
		<div class="remove">X</div>
	</div>

	<button class="simulate button">Simulate</button>

	<div class="output"></div>
</div>

<div class="section white custom-rankings-results">
	<h3>Rankings</h3>

	<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon Name or Type" />

	<div class="ranking-header">Pokemon</div>
	<div class="ranking-header right">Score</div>

	<div class="rankings-container clear"></div>
</div>

<div class="section white custom-rankings-list">
	<h3>Pokemon List (<span class="pokemon-count">0</span>)</h3>
	<p>This list below contains eligible Pokemon for this cup. Pokemon that don't meet certain stat requirements, such as low CP Pokemon, aren't included for ranking purposes.</p>
	<textarea class="pokemon-list"></textarea>
</div>

<div class="section white custom-rankings-import">
	<h3>Import/Export Settings</h3>

	<p>Copy the text below to export your custom settings or paste to import settings.</p>
	
	<textarea class="import"></textarea>
	<div class="copy">Copy</div>
</div>

<div class="hide">
	<?php require 'modules/pokeselect.php'; ?>
</div>

<div class="section white custom-rankings-overrides">
	<h3>Moveset Overrides</h3>
	<p>The rankings generate recommended movesets for each Pokemon. A different moveset may be more optimal, so you can add a Pokemon below to override its ranked moveset.</p>
	<?php require 'modules/pokemultiselect.php'; ?>
</div>



<div class="delete-filter-confirm hide">
	<p>Remove this filter?</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/RankerSandboxWeightingMoveset.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankerMain.js"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/RankingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/CustomRankingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
