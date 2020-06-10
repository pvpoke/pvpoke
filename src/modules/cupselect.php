<select class="format-select">
	<option value="all" cup="all">All Pokemon</option>
	<option value="official" cup="premier">Premier Cup</option>
	<option value="tsa-2" cup="sorcerous">Silph Sorcerous Cup</option>
	<option value="community" cup="goteamup">GO Stadium GOTeamUp</option>

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
		<option value="community" cup="cliffhanger">GO Stadium Cliffhanger</option>
	<?php endif; ?>

	<?php if((strpos($_SERVER['REQUEST_URI'], 'battle') !== false)||(strpos($_SERVER['REQUEST_URI'], 'rankings') !== false)): ?>
		<option value="custom" cup="custom">Custom</option>
	<?php endif; ?>

</select>

<select class="cup-select">
	<option value="all" cat="all">All Pokemon</option>
	<option value="gen-5" cat="all">All Pokemon (With Generation 5)</option>
	<option value="premier" cat="official">Premier Cup</option>
	<option value="safari" cat="community">Montreal Safari Cup</option>
	<option value="fantasy" cat="community">GO LIVE Fantasy Cup</option>
	<option value="beam" cat="community">Get Beamed</option>
	<option value="grunt-4" cat="community">Grunt Cup Season 4</option>
	<option value="goteamup" cat="community">GO Stadium GOTeamUp</option>
	<option value="cliffhanger" cat="community">GO Stadium Cliffhanger</option>
	<option value="jungle"  cat="tsa-1">Jungle Cup</option>
	<option value="rainbow" cat="tsa-1">Rainbow Cup</option>
	<option value="championships-1" cat="tsa-1">Season 1 Championships</option>
	<option value="regionals-1" cat="tsa-1">Season 1 Regionals</option>
	<option value="nightmare" cat="tsa-1">Nightmare Cup</option>
	<option value="kingdom" cat="tsa-1">Kingdom Cup</option>
	<option value="tempest" cat="tsa-1">Tempest Cup</option>
	<option value="twilight" cat="tsa-1">Twilight Cup</option>
	<option value="boulder" cat="tsa-1">Boulder Cup</option>
	<option value="sorcerous" cat="tsa-2">Silph Sorcerous Cup</option>
	<option value="forest" cat="tsa-2">Forest Cup</option>
	<option value="voyager" cat="tsa-2">Voyager Cup</option>
	<option value="toxic" cat="tsa-2">Toxic Cup</option>
	<option value="rose" cat="tsa-2">Rose Cup</option>
	<option value="fusion" cat="tsa-2">Fusion Cup</option>
	<option value="timeless" cat="tsa-2">Timeless Cup</option>
	<option value="ferocious" cat="tsa-2">Ferocious Cup</option>
	<option value="sinister" cat="tsa-2">Sinister Cup</option>
	<option value="custom" cat="custom">Custom</option>
</select>
