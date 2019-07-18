<select class="cup-select">
	<option value="all">All Pokemon</option>
	<option value="jungle">Jungle Cup</option>
	<option value="rainbow">Rainbow Cup</option>
	<option value="championships-1">Season 1 Championships</option>
	<option value="regionals-1">Season 1 Regionals</option>
	<option value="nightmare">Nightmare Cup</option>
	<option value="kingdom">Kingdom Cup</option>
	<option value="tempest">Tempest Cup</option>
	<option value="twilight">Twilight Cup</option>
	<option value="boulder">Boulder Cup</option>
	<option value="kanto">Kanto Cup</option>
	<option value="johto">Johto Cup</option>
	<option value="hoenn">Hoenn Cup</option>
	<option value="uc">Ultra Counter</option>
	<option value="liguinha3">Liguinha 3</option>
	
	<?php if(strpos($_SERVER['REQUEST_URI'], 'battle') !== false): ?>
		<option value="custom">Custom</option>
	<?php endif; ?>

</select>
