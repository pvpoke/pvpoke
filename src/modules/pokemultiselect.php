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
			<div class="check shield-baiting on"><span></span>Bait shields with low-energy moves</div>
		</div>
		
		<div class="custom-options">
			<h3 class="section-title">Pokemon (<span class="poke-count">0</span> / 50)</h3>
			<p>Create or select a group of custom Pokemon below.</p>
			<div class="rankings-container clear"></div>
			<button class="add-poke-btn button">+ Add Pokemon</button>

			<button class="export-btn">Import/Export</button>
			
			<h3 class="section-title">Quick Fill</h3>
			<select class="quick-fill-select">
				<option value="new">New Custom Group</option>
				<option value="great">Great League Meta</option>
				<option value="ultra" class="hide">Ultra League Meta</option>
				<option value="master" class="hide">Master League Meta</option>
				<option value="boulder">Boulder Cup Meta</option>
				<option value="twilight">Twilight Cup Meta</option>
				<option value="tempest">Tempest Cup Meta</option>
				
				<?php
				// Display custom groups
				
				foreach($_COOKIE as $key=>$value){
					if(strpos($key, 'custom_group') !== false){
						$data = json_decode($value, true);
						
						echo '<option value="'.$key.'" data="'.$data["data"].'">'.htmlspecialchars($data['name']).'</option>';
					}
				}
				
				?>
			</select>
			<div class="flex quick-fill-buttons">
				<button class="save-btn save-custom">Save</button>
				<button class="save-btn save-as hide">Save As</button>
				<button class="delete-btn hide">Delete</button>
			</div>
		</div>
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
	<div class="copy">Copy</div>
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

<div class="delete-list-confirm hide">
	<p>Delete <b><span class="name"></span></b>? This custom group will be permanently removed from your device.</p>
	
	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>