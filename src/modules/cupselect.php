<select class="format-select">
	<option value="all" cup="all">All Pokemon</option>
	<option value="official" cup="remix">Remix Cup</option>
	<option value="official" cup="holiday">Holiday Cup</option>
	<option value="official" cup="sinnoh">Sinnoh Cup</option>
	<option value="tsa-4" cup="glacial">Silph Glacial Cup</option>
	<option value="tsa-2" cup="factions">Silph Factions (Cave)</option>
	<option value="tsa-2" cup="fusionfactions">Silph Factions (Fusion)</option>
	<option value="community" cup="comet">Gymbreakers Comet Cup</option>

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
	<option value="flying" cat="official">Flying Cup</option>
	<option value="halloween" cat="official">Halloween Cup</option>
	<option value="kanto" cat="official">Kanto Cup</option>
	<option value="love" cat="official">Love Cup</option>
	<option value="retro" cat="official">Retro Cup</option>
	<option value="remix" cat="official">Remix</option>
	<option value="little" cat="official">Little Cup</option>
	<option value="element" cat="official">Element Cup</option>
	<option value="bidoof" cat="official">Bidoof Cup</option>
	<option value="holiday" cat="official">Holiday Cup</option>
	<option value="sinnoh" cat="official">Sinnoh Cup</option>
	<option value="classic" cat="official">Classic (ML Only)</option>
	<option value="littlejungle" cat="official">Little Jungle Cup</option>
	<option value="safari" cat="community">Montreal Safari Cup</option>
	<option value="fantasy" cat="community">GO LIVE Fantasy Cup</option>
	<option value="beam" cat="community">Get Beamed</option>
	<option value="grunt" cat="community">Grunt Cup Season 7</option>
	<option value="shadow" cat="community">Shadow Cup</option>
	<option value="goteamup" cat="community">GO Stadium GOTeamUp</option>
	<option value="cliffhanger" cat="community">GO Stadium Cliffhanger</option>
	<option value="uber" cat="community">Uber Tier Cup</option>
	<option value="scoville" cat="community">Scoville Cup</option>
	<option value="mexico" cat="community">México Cup</option>
	<option value="kaiser" cat="community">Kaiser Invitational</option>
	<option value="cerberus" cat="community">VR Cerberus Cup</option>
	<option value="ou" cat="community">PoGoRaids Overused Tournament</option>
	<option value="slitzko" cat="community">Slitzko Cup</option>
	<option value="johto" cat="community">Johto Cup</option>
	<option value="adl" cat="community">ADL</option>
	<option value="cutie" cat="community">Cutie Cup</option>
	<option value="unity" cat="community">Unity Cup</option>
	<option value="comet" cat="community">Comet Cup</option>
	<option value="jungle"  cat="tsa-1">Jungle Cup</option>
	<option value="rainbow" cat="tsa-1">Rainbow Cup</option>
	<option value="championships-1" cat="tsa-1">Season 1 Championships</option>
	<option value="regionals-1" cat="tsa-1">Season 1 Regionals</option>
	<option value="nightmare" cat="tsa-1">Nightmare Cup</option>
	<option value="kingdom" cat="tsa-1">Kingdom Cup</option>
	<option value="tempest" cat="tsa-1">Tempest Cup</option>
	<option value="twilight" cat="tsa-1">Twilight Cup</option>
	<option value="twilightfactions" cat="tsa-1">Twilight Cup</option>
	<option value="boulder" cat="tsa-1">Boulder Cup</option>
	<option value="catacomb" cat="tsa-2">Silph Catacomb Cup</option>
	<option value="continentals-2" cat="tsa-2">Season 2 Continentals</option>
	<option value="sorcerous" cat="tsa-2">Silph Sorcerous Cup</option>
	<option value="sorcerous-mirror" cat="tsa-2">Silph Sorcerous Cup (Mirror)</option>
	<option value="forest" cat="tsa-2">Forest Cup</option>
	<option value="voyager" cat="tsa-2">Voyager Cup</option>
	<option value="toxic" cat="tsa-2">Toxic Cup</option>
	<option value="rose" cat="tsa-2">Rose Cup</option>
	<option value="fusion" cat="tsa-2">Fusion Cup</option>
	<option value="fusionfactions" cat="tsa-2">Fusion Cup</option>
	<option value="timeless" cat="tsa-2">Timeless Cup</option>
	<option value="timeless-mirror" cat="tsa-2">Timeless Cup (Mirror)</option>
	<option value="ferocious" cat="tsa-2">Ferocious Cup</option>
	<option value="ferocious-mirror" cat="tsa-2">Ferocious Cup (Mirror)</option>
	<option value="sinister" cat="tsa-2">Sinister Cup</option>
	<option value="sinister-mirror" cat="tsa-2">Sinister Cup (Mirror)</option>
	<option value="circus" cat="tsa-2">Circus Cup</option>
	<option value="maelstrom" cat="tsa-2">Maelstrom Cup</option>
	<option value="origin" cat="tsa-2">Origin Cup</option>
	<option value="duet" cat="tsa-2">Duet Cup</option>
	<option value="sunrise" cat="tsa-3">Sunrise Cup</option>
	<option value="marsh" cat="tsa-3">Marsh Cup</option>
	<option value="nightfall" cat="tsa-3">Nightfall Cup</option>
	<option value="labyrinth" cat="tsa-3">Labyrinth Cup</option>
	<option value="vortex" cat="tsa-3">Vortex Cup</option>
	<option value="prismatic" cat="tsa-3">Prismatic Cup</option>
	<option value="commander" cat="tsa-3">Commander Cup</option>
	<option value="venture" cat="tsa-3">Venture Cup</option>
	<option value="continentals-3" cat="tsa-3">Continentals</option>
	<option value="factions" cat="tsa-3">Floating City</option>
	<option value="worlds" cat="tsa-3">Silph Worlds</option>
	<option value="lunar" cat="tsa-4">Silph Lunar Cup</option>
	<option value="brawler" cat="tsa-4">Silph Brawler Cup</option>
	<option value="glacial" cat="tsa-4">Silph Glacial Cup</option>
	<option value="custom" cat="custom">Custom</option>
</select>
