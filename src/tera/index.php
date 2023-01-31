<?php

if(isset($_GET['p']) && isset($_GET['t'])){
	// Put Pokemon names in the meta title

	$name = ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['p']))[0]));

	$META_TITLE = $name . ' Tera Raid Counters';

	$META_DESCRIPTION = 'Check ' . $name . ' Tera Raid counters and attackers with the best calculated type matchups.';

	$CANONICAL = '/tera/' . $_GET['p'] . '/' . $_GET['t'] . '/';
}


require_once 'header.php'; ?>

<div class="section home white">
	<h1>Tera Raid Counter Calculator</h1>

	<p>This tool is a raid counter calculator that measures potential attackers based on optimal offensive and defensive typing against the raid boss.</p>

	<div class="flex section-header margin-top">
		<h3>Tera Raid Boss</h3>
		<div class="hr"></div>
	</div>

	<p>Enter the Tera Raid boss details below. You can specify its offensive attack types to help narrow results.</p>


	<div class="bordered-section boss-section">

		<div class="pattern"></div>
		<div class="flash"></div>

		<div class="flex">
			<div class="poke-search-container">
				<input type="text" id="poke-search" placeholder="Search for a Pokemon" autocomplete="off" />
				<select id="poke-select">
					<option disabled selected value="">Select a Pokemon</option>
				</select>

				<h4 class="sub-title">Attack Types</h4>
				<div class="item-list boss-attack-types">
					<select id="attack-type-select">
						<option disabled selected value="">Add a type</option>
						<option value="bug">Bug</option>
						<option value="dark">Dark</option>
						<option value="dragon">Dragon</option>
						<option value="electric">Electric</option>
						<option value="fairy">Fairy</option>
						<option value="fighting">Fighting</option>
						<option value="fire">Fire</option>
						<option value="flying">Flying</option>
						<option value="ghost">Ghost</option>
						<option value="grass">Grass</option>
						<option value="ground">Ground</option>
						<option value="ice">Ice</option>
						<option value="normal">Normal</option>
						<option value="poison">Poison</option>
						<option value="psychic">Psychic</option>
						<option value="rock">Rock</option>
						<option value="steel">Steel</option>
						<option value="water">Water</option>
					</select>
				</div>

				<div class="type-item template flex">
					<div class="type-name-container flex">
						<div class="tera-icon"></div>
						<div class="type-name">
						</div>
					</div>

					<a href="#" class="close">×</a>
				</div>

				<div class="traits-container">
					<h4 class="sub-title">Traits</h4>
					<div class="item-list boss-traits traits"></div>

					<div class="trait-item template flex check">
						<span></span><div class="trait-name"></div>
					</div>
				</div>

			</div>
			<div class="tera-type-container">
				<div class="flex">
					<div class="tera-icon"></div>
					<div>
						<h4>Tera Type</h4>

						<div class="tera-type"></div>

						<select id="tera-select">
							<option value="" selected disabled>Select a Tera Type</option>
							<option value="bug">Bug</option>
							<option value="dark">Dark</option>
							<option value="dragon">Dragon</option>
							<option value="electric">Electric</option>
							<option value="fairy">Fairy</option>
							<option value="fighting">Fighting</option>
							<option value="fire">Fire</option>
							<option value="flying">Flying</option>
							<option value="ghost">Ghost</option>
							<option value="grass">Grass</option>
							<option value="ground">Ground</option>
							<option value="ice">Ice</option>
							<option value="normal">Normal</option>
							<option value="poison">Poison</option>
							<option value="psychic">Psychic</option>
							<option value="rock">Rock</option>
							<option value="steel">Steel</option>
							<option value="water">Water</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	</div>


	<button id="run">Check Counters</button>

	<div class="results-container">
		<div class="flex section-header margin-top">
			<h3>Counters</h3>
			<div class="hr"></div>
		</div>

		<p>The Pokemon below are the top scored based on their offensive and defensive typing against the raid boss.</p>

		<div class="bordered-section results-section">
			<div class="results-controls flex">
				<div>
					<input type="text" id="results-search" placeholder="Search counters" />
					<div class="search-instructions">Search by Pokemon, typing, or Tera type ("@water")</div>
				</div>
				<a class="results-options" href="#"></a>
			</div>

			<div class="table-container">
				<table id="results" cellspacing="0">
					<thead>
						<tr>
							<th>Pokemon</th>
							<th>Typing</th>
							<th>Tera Type</th>
							<th>Score</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		</div>

		<div class="name-details template template">
			<div class="pokemon-name"></div>
			<div class="traits flex"></div>
		</div>

		<div class="share-link-container">
			<p>Share these Tera Raid counters:</p>
			<div class="share-link">
				<input type="text" value="" readonly>
				<div class="copy">Copy</div>
			</div>
		</div>

		<div class="score-details template flex">
			<div class="typings flex full-row border-bottom"></div>
			<div class="tera-type flex full-row border-bottom">
				<div class="type-container"></div>
				<div class="label">Tera Type</div>
			</div>
			<div class="traits-container full-row border-bottom">
				<div class="traits flex"></div>
				<div class="label">Traits</div>
			</div>
			<div class="overall full-row border-bottom">
				<div class="score"></div>
				<div class="label">Counter Score</div>
			</div>

			<div class="offense">
				<div class="score"></div>
				<div class="label">Offense</div>
			</div>
			<span class="multiply">×</span>
			<div class="defense">
				<div class="score"></div>
				<div class="label">Defense</div>
			</div>

			<p><b>Counter Score</b> is the product of a Pokemon's offensive and defensive scores.</p>
			<p><b>Offensive Score</b> is a Pokemon's offensive damage multipliers based on its most effective attacking type and the raid boss's Tera type. It factors in STAB and base stats.</p>
			<p><b>Defensive Score</b> is the inverse of a Pokemon's defensive damage multipliers based on the raid boss's attack types, the Pokemon's base typing, and its Tera type. It factors in STAB and base stats.</p>
		</div>

		<div class="results-options template">

			<h4>Sort scores by</h4>
			<select class="score-sort-select">
				<option value="overall">Overall</option>
				<option value="offense">Offense</option>
				<option value="defense">Defense</option>
			</select>

			<div class="check show-best"><span></span>Show Best for each Species</div>

			<button class="save">Save Changes</button>
		</div>

	</div>

</div>


	<script src="<?php echo $WEB_ROOT; ?>tera/js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/Trait.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/TeraRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/TeraInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
