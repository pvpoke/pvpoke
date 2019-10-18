<select class="format-select">
	<option value="all" cup="all">All Pokemon</option>
	<option value="all" cup="gen-5">All Pokemon (With Generation 5)</option>
	<option value="tsa-2" cup="ferocious">Ferocious Cup</option>
	<option value="tsa-2" cup="sinister">Sinister Cup</option>
	<option value="tsa-1">Silph Arena Season 1</option>
	<option value="tsa-2">Silph Arena Season 2</option>
	<option value="community">Community Formats</option>

	<?php if((strpos($_SERVER['REQUEST_URI'], 'battle') !== false)||(strpos($_SERVER['REQUEST_URI'], 'rankings') !== false)): ?>
		<option value="custom" cup="custom">Custom</option>
	<?php endif; ?>

</select>

<select class="cup-select">
	<option value="all" cat="all">All Pokemon</option>
	<option value="gen-5" cat="all">All Pokemon (With Generation 5)</option>
	<option value="safari" cat="community">Montreal Safari Cup</option>
	<option value="fantasy" cat="community">GO LIVE Fantasy Cup</option>
	<option value="jungle"  cat="tsa-1">Jungle Cup</option>
	<option value="rainbow" cat="tsa-1">Rainbow Cup</option>
	<option value="championships-1" cat="tsa-1">Season 1 Championships</option>
	<option value="regionals-1" cat="tsa-1">Season 1 Regionals</option>
	<option value="nightmare" cat="tsa-1">Nightmare Cup</option>
	<option value="kingdom" cat="tsa-1">Kingdom Cup</option>
	<option value="tempest" cat="tsa-1">Tempest Cup</option>
	<option value="twilight" cat="tsa-1">Twilight Cup</option>
	<option value="boulder" cat="tsa-1">Boulder Cup</option>
	<option value="ferocious" cat="tsa-2">Ferocious Cup</option>
	<option value="sinister" cat="tsa-2">Sinister Cup</option>
	<option value="custom" cat="custom">Custom</option>
</select>
