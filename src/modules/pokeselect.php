<div class="poke single">
	<a class="random" href="#">Random</a>
	<a class="swap" href="#">Swap</a>

	<div class="poke-search-container flex">
		<input class="poke-search" type="text" placeholder="Search name">
		<a href="#" class="search-info" title="Search Help" context="pokeselect">?</a>
	</div>

	<select class="poke-select">
		<option disabled selected value="">Select a Pokemon</option>
	</select>

	<div class="form-select-container">
		<div class="form-select-border"></div>
		<select class="form-select">
			<option value="" selected disabled>Select another form</option>
		</select>
		<a class="form-link" href="#"></a>
	</div>

	<?php include 'pokebox.php'; ?>

	<div class="poke-stats">

		<h3 class="cp"><span class="identifier" title="Shadow"></span> cp <span class="stat"></span></h3>
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

		<div class="mega-cp-container">
			<h3 class="base-name section-title">Pokemon</h3>
			<h3 class="mega-cp">cp <span class="stat"></span></h3>
		</div>

		<div class="advanced-section">
			<a class="advanced section-title" href="#">Edit/Check IVs <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
			<div class="fields">

				<div class="ivs">
					<div class="flex">
						<input class="level" type="number" placeholder="Level" min="1" max="40" step=".5" />
						<div class="ivs-group">
							<input class="iv" iv="atk" type="number" placeholder="Atk" min="0" max="15" step="1" /><span>/</span>
							<input class="iv" iv="def" type="number" placeholder="Def" min="0" max="15" step="1" /><span>/</span>
							<input class="iv" iv="hp" type="number" placeholder="HP" min="0" max="15" step="1" />
						</div>
					</div>

					<div class="flex">
						<label class="level">Level</label>
						<div class="ivs-group labels">
							<label class="iv">Atk</label><span>&nbsp;</span>
							<label class="iv">Def</label><span>&nbsp;</span>
							<label class="iv">HP</label>
						</div>
					</div>
					<div class="iv-rank">Rank&nbsp;<span class="value"></span><span class="count"></span><span class="info-icon">i</span></div>
				</div>
				<div class="maximize-section">
					<div class="check-group">
						<div class="check on" value="overall"><span></span>Overall</div>
						<div class="check" value="atk"><span></span>Atk</div>
						<div class="check" value="def"><span></span>Def</div>
					</div>
					<div class="level-cap-group">
						<div>Level Cap:</div>
						<div class="check on" value="40"><span></span>40</div>
						<div class="check" value="41"><span></span>41</div>
						<div class="check" value="50"><span></span>50</div>
						<div class="check" value="51"><span></span>51</div>
					</div>
					<div class="check auto-level on"><span></span>Auto level</div>
					<button class="maximize-stats">Maximize</button>
					<button class="restore-default">Default</button>
				</div>
			</div>
		</div>

		<div class="move-select-container">
			<h3 class="section-title">Fast Move</h3>

			<select class="move-select fast"></select>

			<h3 class="section-title">Charged Moves</h3>

			<select class="move-select charged"></select>
			<select class="move-select charged"></select>
			<button class="auto-select">Select Recommended Moves</button>
			<div class="legacy">* Exclusive move<br><sup>†</sup> Unobtainable move</div>
		</div>

		<div class="options">
			<div class="shield-section">
				<h3 class="section-title">Shields</h3>
				<div class="form-group shield-picker">
					<div class="option" value="0"><div class="icon"></div> 0</div>
					<div class="option on" value="1"><div class="icon"></div> 1</div>
					<div class="option" value="2"><div class="icon"></div> 2</div>
				</div>
			</div>
			<div class="shadow-section">
				<h3 class="section-title">Shadow Form</h3>
				<div class="form-group shadow-picker">
					<div class="option on" value="normal">Normal</div>
					<div class="option" value="shadow">Shadow</div>
				</div>
			</div>
			<a href="#" class="section-title toggle">Options <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
			<div class="toggle-content">
				<div class="flex">
					<div class="label">HP:</div><input class="start-hp" type="number" min="0" placeholder="Starting HP" />
				</div>
				<div class="flex">
					<div class="label">Energy:</div><input class="start-energy" type="number" min="0" max="100" placeholder="Starting Energy" />
				</div>
				<button class="add-fast-move">+ Move</button>
				<button class="pull-from-timeline">Pull from timeline</button>

				<h3 class="section-title">Baiting</h3>
				<div class="form-group bait-picker">
					<div class="option" value="0">Off</div>
					<div class="option on" value="1">Selective</div>
					<div class="option" value="2">On</div>
				</div>

				<div class="stat-modifiers">
					<h3 class="section-title">Stat Modifiers (-4 to 4)</h3>
					<input class="stat-mod" iv="atk" type="number" placeholder="Atk" min="-4" max="4" step="1" />
					<input class="stat-mod" iv="def" type="number" placeholder="Def" min="-4" max="4" step="1" />
				</div>
				<div class="damage-adjustments">
					<div class="adjustment attack">
						<div class="value">x1</div>
						<div class="label">damage dealt</div>
					</div>
					<div class="adjustment defense">
						<div class="value">x1</div>
						<div class="label">damage taken</div>
					</div>
				</div>
				<div class="check optimize-timing on"><span></span>Optimize move timing</div>
				<div class="check switch-delay"><span></span>1 turn switch</div>
			</div>
		</div>

		<div class="custom-ranking-options">
			<h3 class="section-title">Ranking Weight Multiplier</h3>
			<input class="ranking-weight" type="number" placeholder="Weight" min="0" value="1" />
			<div class="legacy">Matchup scores against this Pokemon will be multiplied by the value above. Default is 1. Use values of 2-10 depending on meta relevancy. Use 0 to remove all weighting.</div>
		</div>

		<a href="#" class="clear-selection">Clear Selection</a>

		<div class="hp bar-back">
			<div class="bar"></div>
			<div class="bar damage"></div>
			<div class="stat"></div>
		</div>

		<div class="move-bars">
			<div class="move-bar">
				<div class="label">CM</div>
				<div class="bar"></div>
				<div class="bar"></div>
				<div class="bar"></div>
				<div class="bar-back"></div>
			</div>
			<div class="energy-label">
				<div class="num">0</div>
				<div>energy</div>
			</div>
			<div class="move-bar">
				<div class="label">CM</div>
				<div class="bar"></div>
				<div class="bar"></div>
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

	<div class="pokeselector-search-help article hide">
		<p>You can use the following keyboard commands when selecting a Pokemon:</p>
		<table cellspacing="0">
			<tr>
				<td><strong>&uarr;</strong></td>
				<td>Navigate up alphabetically (to select a related form)</td>
			</tr>
			<tr>
				<td><strong>&darr;</strong></td>
				<td>Navigate down alphabetically (to select a related form)</td>
			</tr>
			<tr>
				<td><strong>Enter</strong></td>
				<td>Multi-Select: Add or save changes to the current Pokemon. You can press Enter again to bring up a new Add Pokemon window.</td>
			</tr>
		</table>
	</div>

	<div class="iv-rank-details hide">
		<p>Below are the overall stat rankings for this Pokemon's IVs out of <b class="count">4096</b> possible combinations.</p>
		<div class="iv-rank-results">

		</div>
		<div class="iv-rank-result template hide">
			<h3>Pokemon</h3>
			<table class="stats-table iv-rankings" cellspacing="0">
				<thead>
					<tr>
						<td><span class="name">CP</span></td>
						<td><span class="name">Level</span></td>
						<td><span class="name">IV Rank</span></td>
					</tr>
				</thead>
				<tbody>
				</tbody>
			</table>
		</div>

	</div>
</div>
