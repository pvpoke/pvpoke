<?php require_once 'header.php'; ?>

<div class="section home white">
	<h1>Tera Raid Counters</h1>

	<p>Enter the Tera Raid boss details below. You can specify its offensive move types to help narrow results. This tool will calculate potential raid attackers and counters based on optimal offensive and defensive typing against the raid boss.</p>

	<div class="flex section-header boss-header">
		<h3>Tera Raid Boss</h3>
		<div class="hr"></div>
	</div>

	<div class="bordered-section boss-section">

		<div class="flex">
			<div>
				<h4>Pokemon</h4>
				<input id="poke-search" />
				<select id="poke-select">
					<option disabled selected value="">Select a Pokemon</option>
				</select>
			</div>
			<div>
				<h4>Tera Type</h4>
				<div class="tera-type"></div>
			</div>
		</div>

		<h4>Attack Types</h4>
		<div class="boss-attack-types"></div>

		<select id="type1">
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

		<h4>Base Type 2</h4>

		<select id="type2">
			<option value="none" selected>-</option>
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

		<h4>Tera Type</h4>

		<select id="tera">
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


	<button style="margin-top: 20px;" id="run">Check Attackers</button>

	<table id="results" style="height: 500px; overflow-y: scroll; width: 100%" cellspacing="4">
		<thead>
			<tr>
				<th>Pokemon</th>
				<th>Typing</th>
				<th>Tera Type</th>
			</tr>
		</thead>
		<tbody><tbody>
	</table>

</div>


	<script src="<?php echo $WEB_ROOT; ?>tera/js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>

	<script src="<?php echo $WEB_ROOT; ?>tera/js/TeraRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/TeraInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>tera/js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
