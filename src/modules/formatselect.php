<select class="format-select">
	<option value="1500" cup="all" meta-group="great">Great League</option>
	<option value="1500" cup="remix" meta-group="remix">Great League (Remix)</option>
	<option value="2500" cup="all" meta-group="ultra">Ultra League</option>
	<option value="2500" cup="remix" meta-group="remixultra">Ultra League (Remix)</option>
	<option value="2500" cup="premier" meta-group="premierultra">Ultra League (Premier)</option>
	<option value="10000" cup="all" meta-group="master">Master League</option>
	<option value="10000" cup="classic" meta-group="master">Master League (Classic)</option>
	<option value="500" cup="element" meta-group="element">Element Cup</option>
	<option value="500" cup="bidoof" meta-group="bidoof">Bidoof Cup</option>
	<option value="1500" cup="venture" meta-group="venture">Silph Venture Cup</option>
	<option value="1500" cup="factions" meta-group="factions">Silph Factions (Atlantis)</option>
	<option value="1500" cup="adl" meta-group="great">Arrohh Draft League</option>

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
		<option value="1500" cup="cliffhanger" meta-group="great">GO Stadium Cliffhanger</option>
	<?php endif; ?>
	<option value="1500" cup="custom">Custom</option>
</select>
