<div class="poke single">
	<a class="random" href="#">Random</a>
	<a class="swap" href="#">Swap</a>
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

				<div class="ivs">
					<h3>Level &amp; IV's</h3>
					<input class="level" type="number" placeholder="Level" min="1" max="40" step=".5" />
					<div class="ivs-group">
						<input class="iv" iv="atk" type="number" placeholder="Atk" min="0" max="15" step="1" /><span>/</span>
						<input class="iv" iv="def" type="number" placeholder="Def" min="0" max="15" step="1" /><span>/</span>
						<input class="iv" iv="hp" type="number" placeholder="HP" min="0" max="15" step="1" />
					</div>
				</div>
				<div class="maximize-section">
					<div class="check-group">
						<div class="check on" value="overall"><span></span>Overall</div>
						<div class="check" value="atk"><span></span>Atk</div>
						<div class="check" value="def"><span></span>Def</div>
					</div>
					<button class="maximize-stats">Maximize</button>
					<button class="restore-default">Default</button>
				</div>
				<div class="stat-modifiers">
					<h3>Stat Modifiers (-4 to 4)</h3>
					<input class="stat-mod" iv="atk" type="number" placeholder="Atk" min="-4" max="4" step="1" />
					<input class="stat-mod" iv="def" type="number" placeholder="Def" min="-4" max="4" step="1" />
				</div>
			</div>
		</div>

		<div class="move-select-container">
			<h3 class="section-title">Fast Move</h3>

			<select class="move-select fast"></select>

			<h3 class="section-title">Charged Moves</h3>

			<select class="move-select charged"></select>
			<select class="move-select charged"></select>
			<button class="auto-select">Auto Select Moves</button>
			<div class="legacy">* Legacy Move</div>
		</div>

		<div class="options">
			<h3 class="section-title">Shields</h3>
			<select class="shield-select">
				<option value="0">No shields</option>
				<option value="1">1 shield</option>
				<option value="2">2 shields</option>
			</select>
			<a href="#" class="section-title toggle">Options <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
			<div class="toggle-content">
				<div class="flex">
					<div class="label">HP:</div><input class="start-hp" type="number" min="0" placeholder="Starting HP" />
				</div>
				<div class="flex">
					<div class="label">Energy:</div><input class="start-energy" type="number" min="0" max="100" placeholder="Starting Energy" />
				</div>
				<button class="pull-from-timeline">Pull from timeline</button>
				<div class="check shield-baiting on"><span></span>Bait shields with low-energy moves</div>
				<div class="check priority"><span></span>Charged Move priority</div>
			</div>
		</div>

		<a href="#" class="clear-selection">Clear Selection</a>

		<div class="hp bar-back">
			<div class="bar"></div>
			<div class="stat"></div>
		</div>

		<div class="move-bars">
			<div class="move-bar">
				<div class="label">CM</div>
				<div class="bar"></div>
				<div class="bar-back"></div>
			</div>
			<div class="move-bar">
				<div class="label">CM</div>
				<div class="bar"></div>
				<div class="bar-back"></div>
			</div>
		</div>
	</div>
	<div class="tooltip">
		<h3 class="name"></h3>
		<div class="details"></div>
	</div>

	<div class="clear-confirm hide">
		<p>Clear <b><span class="name"></span></b> from the selection?</p>

		<div class="center flex">
			<div class="button yes">Yes</div>
			<div class="button no">No</div>
		</div>
	</div>

	<div class="custom-move hide">
		<p>Add a custom move for <b><span class="name"></span></b>:</p>

		<input class="poke-search" context="move-search" type="text" placeholder="Search move"/>
		<select class="move-select">
			<option selected disabled value="">Select a Move</option>
		</select>

		<div class="center flex">
			<div class="button add-move">Add move</div>
		</div>
	</div>
</div>
