<?php

$META_TITLE = 'Custom Rankings';

$META_DESCRIPTION = 'Configure a custom Pokemon GO tournament and see simple rankings.';


require_once 'header.php'; ?>

<h1>Custom Rankings</h1>
<div class="section white custom-rankings">
	<p>This tool will generate high-level rankings to help you develop a custom cup or tournament. Select your rulesets below for which Pokemon to include or exclude.</p>

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

	<a class="toggle" href="#">Advanced <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content advanced">
		<div class="flex-section">
			<div>
				<h3 class="section-title">Subject Shields</h3>
				<select class="subject-shield-select" index="0">
					<option value="0">No shields</option>
					<option value="1" selected>1 shield</option>
					<option value="2">2 shields</option>
				</select>
			</div>
			<div>
				<h3 class="section-title">Target Shields</h3>
				<select class="target-shield-select" index="1">
					<option value="0">No shields</option>
					<option value="1" selected>1 shield</option>
					<option value="2">2 shields</option>
				</select>
			</div>
		</div>
		<div class="flex-section">
			<div>
				<div class="exclude-low-pokemon check on"><span></span> Exclude Low-Performing Pokemon</div>
				<p class="small">This setting excludes Pokemon which have a league overall score of less than 70 from the simulations. This significantly reduces the time it takes to generate results. Recommend disabling for small metas.</p>
			</div>
		</div>

		<div class="flex-section">
			<div>
				<h3 class="section-title">Subject Energy<br>Advantage</h3>
				<input type="number" class="subject-turns" index="0" placeholder="Turns" />
			</div>
			<div>
				<h3 class="section-title">Target Energy<br>Advantage</h3>
				<input type="number" class="target-turns" index="1" placeholder="Turns" />
			</div>
		</div>
		<h3 class="section-title">Import League or Cup</h3>
		<?php require_once 'modules/cupselect.php'; ?>
		<p>Import the rulesets and recommended moves from an existing format.</p>
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
					<option value="move">Move</option>
					<option value="moveType">Move Type</option>
					<option value="cost">Charged Move Cost</option>
					<option value="distance">Buddy Walk Distance</option>
					<option value="evolution">Evolution</option>
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
					<div class="check" value="ultrabeast"><span></span> Ultra Beast</div>
					<div class="check" value="alolan"><span></span> Alolan</div>
					<div class="check" value="galarian"><span></span> Galarian</div>
					<div class="check" value="hisuian"><span></span> Hisuian</div>
					<div class="check" value="regional"><span></span> Regional</div>
					<div class="check" value="starter"><span></span> Starter</div>
					<div class="check" value="shadow"><span></span> Shadow</div>
					<div class="check" value="shadoweligible"><span></span> Shadow Eligible</div>
					<div class="check" value="mega"><span></span> Mega</div>
				</div>
			</div>

			<div class="field-section evolution">
				<p>Select evolution requirements below.</p>
				<div class="field-container">
					<div class="check" value="0"><span></span> No evolution</div>
					<div class="check" value="1"><span></span> First stage</div>
					<div class="check" value="2"><span></span> Middle stage</div>
					<div class="check" value="3"><span></span> Final stage</div>
				</div>
			</div>

			<div class="field-section id">
				<p>Enter a list of Pokemon ID's below, separated by commas. For inclusion, these Pokemon will be included regardless of the other filters. For exclusion, Shadow and XL versions of a listed ID will also be excluded.</p>
				<p>Pokemon ID's are lowercase. Some examples:</p>
				<ul>
					<li><em>pikachu</em></li>
					<li><em>raichu_alolan</em></li>
					<li><em>giratina_altered</em></li>
					<li><em>deoxys_defense</em></li>
					<li><em>sirfetchd</em></li>
				</ul>
				<div class="field-container">
					<input class="ids" placeholder="Pokemon ID's" />
					<button class="import-custom-group">Import from Custom Group</button>
				</div>
			</div>

			<div class="field-section dex">
				<p>Enter a range (inclusive) of Pokedex entry numbers to filter. Below are example ranges:</p>
				<ul>
					<li><strong>Generation 1:</strong> 1-151</li>
					<li><strong>Generation 2:</strong> 152-251</li>
					<li><strong>Generation 3:</strong> 252-386</li>
					<li><strong>Generation 4:</strong> 387-493</li>
					<li><strong>Generation 5:</strong> 494-649</li>
					<li><strong>Generation 6:</strong> 650-721</li>
					<li><strong>Generation 7:</strong> 722-807</li>
					<li><strong>Generation 8:</strong> 808-898</li>
					<li><strong>Legends (Hisui):</strong> 899-905</li>
					<li><strong>Generation 9:</strong> 906-1008</li>
				</ul>
				<div class="field-container">
					<input class="start-range" placeholder="Start #" />
					<input class="end-range" placeholder="End #" />
				</div>
			</div>

			<div class="field-section cost">
				<p>Select eligible or ineligible second Charged Move costs.</p>
				<div class="field-container">
					<div class="check" value="10000"><span></span> 10,000</div>
					<div class="check" value="50000"><span></span> 50,000</div>
					<div class="check" value="75000"><span></span> 75,000</div>
					<div class="check" value="100000"><span></span> 100,000</div>
				</div>
			</div>

			<div class="field-section distance">
				<p>Select eligible or ineligible buddy walk distances.</p>
				<div class="field-container">
					<div class="check" value="1"><span></span> 1km</div>
					<div class="check" value="3"><span></span> 3km</div>
					<div class="check" value="5"><span></span> 5km</div>
					<div class="check" value="20"><span></span> 20km</div>
				</div>
			</div>

			<div class="field-section move">
				<p>Enter a list of move ID's below, separated by commas. This filter will match any Pokemon that can learn one of the listed moves. This filter does not force a Pokemon to use a specific move.</p>
				<p>Move ID examples:</p>
				<ul>
					<li><em>counter</em></li>
					<li><em>ice_beam</em></li>
					<li><em>weather_ball_fire</em></li>
				</ul>
				<div class="field-container">
					<input class="move-ids" placeholder="Move ID's" />
				</div>
			</div>

			<div class="field-section move-type">
				<p>Select one or more Pokemon types below. A Pokemon will be included or excluded if it has a move matching any of these types in its movepool. This filter does not force a Pokemon to use a specific move. This filter will not match Hidden Power.</p>
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
				</div>
				<div class="field-container">
					<button class="select-all">Select All</button>
					<button class="deselect-all">Deselect All</button>
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

	<div class="poke-search-container">
		<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon" />
		<a href="#" class="search-info">i</a>
	</div>

	<div class="ranking-header">Pokemon</div>
	<div class="ranking-header right">Score</div>

	<div class="rankings-container clear"></div>

	<a href="#" class="button download-csv">Export to CSV</a>
</div>

<div class="section white custom-rankings-import">
	<h3>Import/Export Settings</h3>

	<p>Copy the text below to export your custom settings or paste to import settings.</p>

	<textarea class="import"></textarea>
	<div class="copy">Copy</div>
</div>

<div class="section white custom-rankings-list">
	<h3>Pokemon List (<span class="pokemon-count">0</span>)</h3>
	<p>This list below contains eligible Pokemon for this cup. Pokemon that don't meet certain stat requirements, such as low CP Pokemon, aren't included for ranking purposes.</p>
	<textarea class="pokemon-list"></textarea>
	<a href="#" class="toggle-pokemon-list">Show Pokemon ID's</a>
</div>

<div class="section white custom-rankings-meta-group">
	<h3>Custom Group</h3>
	<p>Save or copy this custom group of the top 100 Pokemon to use in <a href="<?php echo $WEB_ROOT; ?>battle/" target="_blank">Multi-Battle</a> or the <a href="<?php echo $WEB_ROOT; ?>team-builder/" target="_blank">Team Builder</a>.</p>
	<?php require 'modules/pokemultiselect.php'; ?>
</div>


<div class="hide">
	<?php require 'modules/pokeselect.php'; ?>
</div>

<div class="section white custom-rankings-overrides">
	<h3>Moveset Overrides</h3>
	<p>The rankings generate recommended movesets for each Pokemon. A different moveset may be more optimal, so you can add a Pokemon below to override its ranked moveset. Any overrides below will take priority over the league default movesets.</p>

	<div class="use-default-movesets check on"><span></span> Use League Default Movesets</div>
	<?php require 'modules/pokemultiselect.php'; ?>
</div>

<div class="delete-filter-confirm hide">
	<p>Remove this filter?</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>

<div class="import-group-modal hide">
	<p>Select a custom group to import below.</p>

	<select class="custom-group-list"></select>

	<div class="center flex">
		<div class="button import">Import Group</div>
	</div>
</div>

<div class="sandbox-search-strings hide">
	<p>You can use the following search formats to filter Pokemon:</p>
	<table>
		<tr>
			<td><strong>Pokemon Name</strong></td>
			<td>"azumarill"</td>
		</tr>
		<tr>
			<td><strong>Pokemon Type</strong></td>
			<td>"water"</td>
		</tr>
		<tr>
			<td><strong>Move Name</strong></td>
			<td>"@counter"</td>
		</tr>
		<tr>
			<td><strong>Move Type</strong></td>
			<td>"@fighting"</td>
		</tr>
		<tr>
			<td><strong>And</strong></td>
			<td>"water&amp;@fighting"</td>
		</tr>
		<tr>
			<td><strong>Or</strong></td>
			<td>"water,fighting"</td>
		</tr>
		<tr>
			<td><strong>Not</strong></td>
			<td>"!water"</td>
		</tr>
	</table>
</div>

<?php require_once 'modules/rankingdetails.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/RankerSandboxWeightingMoveset.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/Pokebox.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/RankingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/CustomRankingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankerMain.js"></script>

<?php require_once 'footer.php'; ?>
