<div class="poke multi">

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') == false): ?>
		<?php require_once 'cupselect.php'; ?>
	<?php endif; ?>

	<div class="poke-stats">
		<div class="custom-options">
			<h3 class="section-title">Pokemon (<span class="poke-count">0</span> / <span class="poke-max-count">100</span>)</h3>
			<p>Create or select a group of custom Pokemon below.</p>
			<a class="custom-group-sort" href="#">Sort ...</a>
			<div class="rankings-container clear"></div>
			<div class="team-warning ineligible">A Pokemon may have too low stats or be ineligible.</div>
			<div class="team-warning labyrinth">Your Labyrinth Cup team can't share any typings.</div>

			<button class="add-poke-btn button">+ Add Pokemon</button>

			<?php include 'pokebox.php'; ?>

			<button class="export-btn">Import/Export</button>

			<h3 class="section-title">Quick Fill</h3>
			<select class="quick-fill-select">
				<option value="new">New Custom Group</option>
				<option value="littlegeneral" type="littlegeneral" class="hide multi-battle">Little Cup Meta</option>
				<option value="great" type="great" class="multi-battle">Great League Meta</option>
				<option value="ultra" type="ultra" class="hide multi-battle">Ultra League Meta</option>
				<option value="master" type="master" class="hide multi-battle">Master League Meta</option>
			</select>
			<div class="flex quick-fill-buttons">
				<button class="save-btn save-custom">Save</button>
				<button class="save-btn save-as hide">Save As</button>
				<button class="delete-btn hide">Delete</button>
			</div>

			<h3 class="section-title">Search String</h3>
			<button class="search-string-btn">Generate Search String</button>
		</div>

		<div class="options multi-battle-options">
			<h3 class="section-title">Filter</h3>
			<div class="form-group filter-picker">
				<div class="option on" value="meta">Meta</div>
				<div class="option" value="all">All Pokemon</div>
			</div>
		</div>

		<div class="options">
			<h3 class="section-title">Shields</h3>
			<div class="form-group shield-picker">
				<div class="option" value="0"><div class="icon"></div> 0</div>
				<div class="option on" value="1"><div class="icon"></div> 1</div>
				<div class="option" value="2"><div class="icon"></div> 2</div>
			</div>
			<h3 class="section-title">Baiting</h3>
			<div class="form-group bait-picker">
				<div class="option" value="0">Off</div>
				<div class="option on" value="1">Selective</div>
				<div class="option" value="2">On</div>
			</div>
			<h3 class="section-title">IV's</h3>
			<select class="default-iv-select">
				<option value="original">Original IV's</option>
				<option value="gamemaster">Default IV's</option>
				<option value="overall">Maximum stat product (Rank 1)</option>
				<option value="atk">Maximum Attack</option>
				<option value="def">Maximum Defense</option>
			</select>
			<select class="pokemon-level-cap-select" style="display:none;">
				<option value="40">Default Level Cap (40)</option>
				<option value="41">Buddy Level Cap (41)</option>
				<option value="50">New Level Cap (50)</option>
				<option value="51">New Buddy Level Cap (51)</option>
			</select>
			<div class="check show-ivs"><span></span>Show level &amp; IV's</div>
		</div>

		<a href="#" class="clear-selection">Clear Selections</a>
	</div>

	<div class="hide">
		<?php require 'pokeselect.php'; ?>
	</div>
</div>

<div class="remove-poke-confirm hide">
	<p>Remove <b><span class="name"></span></b> from the group?</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>

<div class="list-export hide">
	<p>Copy the text below or paste to import a custom group.</p>
	<textarea class="list-text" type="text"></textarea>
	<div class="export-options">
		<div class="copy">Copy</div>
		<a class="json" href="#">JSON Export</a>
	</div>

	<div class="center">
		<div class="button import">Import</div>
	</div>
</div>

<div class="save-list hide">
	<input class="list-name" placeholder="Custom group name" />
	<p>This will save your custom group to a cookie on your device. Use the import/export option to transfer this group between devices.</p>
	<div class="center">
		<div class="button save">Save</div>
	</div>
</div>

<div class="multi-clear-confirm hide">
	<p>Clear the current selection? This will not delete your custom group.</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>


<div class="delete-list-confirm hide">
	<p>Delete <b><span class="name"></span></b>? This custom group will be permanently removed from your device.</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>

<div class="sort-group hide">
	<p>Sort this group by one of the following:</p>

	<div class="center">
		<div class="button name">Name</div>
		<div class="button attack">Attack</div>
		<div class="button defense">Defense</div>
	</div>
</div>

<div class="search-string-window hide">
	<p>Copy the search string for your team below.</p>
	<div class="search-string-options flex">
		<div class="check hp-option on"><span></span>HP</div>
		<div class="check cp-option on"><span></span>CP</div>
		<div class="check region-option"><span></span>Always include region</div>
	</div>
	<h5>Note CP and HP are not used for Pokemon with default IVs.</h5>
	<textarea class="team-string-text" type="text" readonly></textarea>
	<div class="copy">Copy</div>
</div>
