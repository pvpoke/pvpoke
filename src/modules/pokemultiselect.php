<div class="poke multi">

	
	<?php require_once 'cupselect.php'; ?>
	<div class="poke-stats">
		<div class="options">
			<h3 class="section-title">Options</h3>
			<select class="shield-select">
				<option value="0">No shields</option>
				<option value="1">1 shield</option>
				<option value="2">2 shields</option>
			</select>
			<select class="charged-count-select">
				<option value="1">1 Charged Move</option>
				<option value="2" selected>2 Charged Moves</option>
			</select>
		</div>
		
		<div class="custom-options">
			<p>Create or select a group of custom Pokemon below.</p>
			<div class="rankings-container clear"></div>
			<button class="add-poke-btn button">+ Add Pokemon</button>
		</div>
	</div>
</div>

<div class="remove-pokemon-confirm hide">
	<p>Are you sure you want to remove <span class="name"></span> from the list?</p>
	
	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>