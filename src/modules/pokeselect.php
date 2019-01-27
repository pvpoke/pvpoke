<div class="poke">
	<a class="random" href="#">Random</a>
	<input class="poke-search" type="text" placeholder="Search name">
	<select class="poke-select">
		<option disabled selected value="">Select a Pokemon</option>
	</select>

	<div class="poke-stats">
		<h3 class="cp">cp <span class="stat"></span></h3>
		<div class="types"></div>
		<div class="stat-container attack clear">
			<div class="stat-label">
				<span class="label-name">attack</span>
				<span class="stat">100</span>
			</div>
			<div class="bar-back">
				<div class="bar"></div>
			</div>
		</div>
		<div class="stat-container defense clear">
			<div class="stat-label">
				<span class="label-name">defense</span>
				<span class="stat">100</span>
			</div>
			<div class="bar-back">
				<div class="bar"></div>
			</div>
		</div>
		<div class="stat-container stamina clear">
			<div class="stat-label">
				<span class="label-name">stamina</span>
				<span class="stat">100</span>
			</div>
			<div class="bar-back">
				<div class="bar"></div>
			</div>
		</div>
		<div class="clear"></div>
		<div class="stat-container overall clear">
			<div class="stat-label">
				<span class="label-name">overall</span>
				<span class="stat">100</span>
			</div>
		</div>
		<div class="clear"></div>

		<div class="advanced-section">
			<a class="advanced" href="#">Advanced <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
			<div class="fields">
				<input class="level" type="number" placeholder="Level" min="1" max="40" step=".5" />
				<div class="ivs">
					<h3>IV's</h3>
					<input class="iv" iv="atk" type="number" placeholder="Atk" min="0" max="15" step="1" />
					<input class="iv" iv="def" type="number" placeholder="Def" min="0" max="15" step="1" />
					<input class="iv" iv="hp" type="number" placeholder="HP" min="0" max="15" step="1" />
				</div>
			</div>
		</div>
		
		<h3 class="section-title">Moves</h3>

		<select class="move-select fast"></select>
		<select class="move-select charged"></select>
		<select class="move-select charged"></select>
		<button class="auto-select">Auto Select</button>
		<div class="legacy">* Legacy Move</div>
		
		<div class="options">
			<h3 class="section-title">Options</h3>
			<select class="shield-select">
				<option value="0">No shields</option>
				<option value="1">1 shield</option>
				<option value="2">2 shields</option>
			</select>
		</div>
		
		<a href="#" class="clear-selection">Clear Selection</a>

		<div class="hp bar-back">
			<div class="bar"></div>
			<div class="stat"></div>
		</div>
	</div>
</div>