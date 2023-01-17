<?php require_once 'header.php'; ?>

<div class="section home white">
	<h1>Tera Raid Counters</h1>

	<p>Enter the Tera Raid boss details below. You can specify its offensive move types to help narrow results. This tool will calculate potential raid attackers and counters based on optimal offensive and defensive typing against the raid boss.</p>

	<div class="flex section-header boss-header">
		<h3>Tera Raid Boss</h3>
		<div class="hr"></div>
	</div>

	<div class="bordered-section boss-section">

		<div class="pattern"></div>

		<div class="flex">
			<div class="poke-search-container">
				<input type="text" id="poke-search" placeholder="Search for a Pokemon" />
				<select id="poke-select">
					<option disabled selected value="">Select a Pokemon</option>
				</select>

				<h4 class="attack-title">Attack Types</h4>
				<div class="boss-attack-types">
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
			</div>
			<div class="tera-type-container">
				<div class="flex">
					<div class="tera-icon"></div>
					<div>
						<h4>Tera Type</h4>

						<div class="tera-type"></div>

						<select id="tera-select">
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


	<button style="margin-top: 20px;" id="run">Check Counters</button>

	<div class="flex section-header boss-header">
		<h3>Counters</h3>
		<div class="hr"></div>
	</div>

	<div class="bordered-section results-section">
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


</div>


	<script src="<?php echo $WEB_ROOT; ?>tera/js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>

	<script src="<?php echo $WEB_ROOT; ?>tera/js/TeraRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/TeraInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
