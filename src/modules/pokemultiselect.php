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
			
			<h3 class="section-title">Quick Fill</h3>
			<select class="quick-fill-select">
				<option value="" selected disabled>Choose a preset group</option>
				<option value="great">Great League Meta</option>
				<option value="ultra">Ultra League Meta</option>
				<option value="master">Master League Meta</option>
				<option value="boulder">Boulder Cup Meta</option>
				<option value="twilight">Twilight Cup Meta</option>
				<option value="tempest">Tempest Cup Meta</option>
			</select>
		</div>
	</div>
</div>

<div class="remove-poke-confirm hide">
	<p>Are you sure you want to remove <b><span class="name"></span></b> from the list?</p>
	
	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>