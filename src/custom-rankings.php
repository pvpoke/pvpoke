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
					<div class="check" value="shadow"><span></span> Shadow</div>
					<div class="check" value="shadoweligible"><span></span> Shadow Eligible</div>
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
					<li><strong>Generation 4:</strong> 387-493</li>
					<li><strong>Generation 5:</strong> 494-649</li>
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

	<div class="poke-search-container">
		<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon" />
		<a href="#" class="search-info">i</a>
	</div>

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

<div class="details-template hide">
	<div class="detail-section float margin">
		<div class="ranking-header">Key Wins</div>
		<div class="ranking-header right">Battle Rating</div>
		<div class="matchups clear"></div>
	</div>
	<div class="detail-section float">
		<div class="ranking-header">Key Losses</div>
		<div class="ranking-header right">Battle Rating</div>
		<div class="counters clear"></div>
	</div>
	<div class="detail-section float margin">
		<div class="ranking-header">Fast Moves</div>
		<div class="ranking-header right">Usage</div>
		<div class="moveset fast clear"></div>
	</div>
	<div class="detail-section float">
		<div class="ranking-header">Charged Moves</div>
		<div class="ranking-header right">Usage</div>
		<div class="moveset charged clear"></div>
	</div>
	<div class="clear"></div>
	<div class="detail-section typing">
		<div class="rating-container">
			<div class="ranking-header">Primary Type</div>
			<div class="type"></div>
		</div>
		<div class="rating-container">
			<div class="ranking-header">Secondary Type</div>
			<div class="type"></div>
		</div>
	</div>
	<div class="detail-section float margin">
		<div class="ranking-header">Weaknesses</div>
		<div class="weaknesses clear"></div>
	</div>
	<div class="detail-section float">
		<div class="ranking-header">Resistances</div>
		<div class="resistances clear"></div>
	</div>
	<div class="clear"></div>
	<div class="detail-section stats">
		<div class="rating-container">
			<div class="ranking-header">Attack</div>
			<div class="rating"></div>&nbsp;-
			<div class="rating"></div>
		</div>
		<div class="rating-container">
			<div class="ranking-header">Defense</div>
			<div class="rating"></div>&nbsp;-
			<div class="rating"></div>
		</div>
		<div class="rating-container">
			<div class="ranking-header">Stamina</div>
			<div class="rating"></div>&nbsp;-
			<div class="rating"></div>
		</div>
		<div class="rating-container">
			<div class="ranking-header">Rank 1 Level &amp; IVs</div>
			<div class="rating"></div>
		</div>
	</div>
	<div class="share-link detail-section"><input type="text" readonly="">
		<div class="copy">Copy</div>
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
