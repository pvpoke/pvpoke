
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
		<div class="cp-label">CP 100</div>
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
