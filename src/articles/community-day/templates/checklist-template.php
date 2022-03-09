
<div class="checklist-controls">
	<div class="control-container">
		<label>Sort: </label>
		<select class="sort">
			<option value="priority" direction="1">Priority</option>
			<option value="cp" direction="1">League</option>
			<option value="speciesId" direction="1">Species</option>
			<option value="caught" direction="1">Completed</option>
		</select>
	</div>

	<div class="control-container edit-control-off">
		<button class="edit">Edit</button>
	</div>

	<div class="control-container edit-control-on">
		<button class="reset">Reset</button>
	</div>
</div>

<div class="cd-checklist"></div>

<div class="checklist-item template">
	<div class="title-section">
		<div class="check"><span><div class="checkmark">&#10004;</div></span></div>
		<h4>High Rank Jumpluff</h4>
		<div class="league"></div>
	</div>
	<div class="iv-section">
		<div class="iv-label">
			<div class="level">Level 20</div>
			<div class="ivs">0/15/15</div>
		</div>
		<div class="iv-bars">
			<div class="iv-bar">
				<div class="divider"></div>
				<div class="divider"></div>
				<div class="bar"></div>
			</div>
			<div class="iv-bar">
				<div class="divider"></div>
				<div class="divider"></div>
				<div class="bar"></div>
			</div>
			<div class="iv-bar">
				<div class="divider"></div>
				<div class="divider"></div>
				<div class="bar"></div>
			</div>
		</div>
	</div>
	<div class="base-form-section">
		<img src="" />
		<div class="cp-label">
			<div class="cp-item">
				<div class="label">Base Form</div>
				<div class="cp">100</div>
			</div>
		</div>
	</div>
	<div class="priority-section">
		<h4>Priority</h4>
		<div class="item-controls">
			<a href="#" class="info">?</a>
			<a href="#" class="edit edit-control-on"></a>
			<a href="#" class="delete edit-control-on"></a>
		</div>
	</div>
</div>

<!--Modal window forms-->

<div class="checklist-reset-confirm hide">
	<p>Do you want to reset to the default checklist?</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>


<div class="checklist-delete-confirm hide">
	<p>Delete <b class="item-name"></b> from the checklist?</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>

<div class="checklist-new-item hide">
	<label>Title</label>
	<input class="title" type="text" maxlength="64" placeholder="Title" />

	<label>Species</label>
	<div class="species-section">
		<img src="" />
		<select class="speciesId"></select>
	</div>

	<label>League</label>
	<div class="league-section">
		<img src="" />
		<select class="league">
			<option value="special" cp="500">Little League</option>
			<option value="great" cp="1500" selected>Great League</option>
			<option value="ultra" cp="2500">Ultra League</option>
			<option value="master" cp="10000">Master League</option>
		</select>
	</div>

	<label>Priority</label>
	<select class="priority">
		<option value="1" selected>1: Priority</option>
		<option value="2">2: Nice To Have</option>
		<option value="3">3: Extra Mile</option>
	</select>

	<label>IVs</label>
	<div class="ivs-section">
		<input class="iv" iv="atk" type="number" min="0" max="15" step="1" placeholder="Atk" />
		<span>/</span>
		<input class="iv" iv="def" type="number" min="0" max="15" step="1" placeholder="Def" />
		<span>/</span>
		<input class="iv" iv="hp" type="number" min="0" max="15"step="1" placeholder="HP" />
	</div>

	<textarea class="notes" placeholder="Notes"></textarea>

	<div class="center flex">
		<div class="button add">Add Pokemon</div>
		<div class="button save">Save Changes</div>
	</div>
</div>
