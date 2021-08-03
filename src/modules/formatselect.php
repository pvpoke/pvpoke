<select class="format-select">
	<option value="1500" cup="all" meta-group="great">Great League</option>
	<option value="1500" cup="remix" meta-group="remix">Great League (Remix)</option>
	<option value="2500" cup="all" meta-group="ultra">Ultra League</option>
	<option value="2500" cup="remix" meta-group="remixultra">Ultra League (Remix)</option>
	<option value="2500" cup="premier" meta-group="premierultra">Ultra League (Premier)</option>
	<option value="10000" cup="all" meta-group="master">Master League</option>
	<option value="10000" cup="classic" meta-group="master">Master League (Classic)</option>
	<option value="1500" cup="factions" meta-group="factions">Silph Factions (Dungeon)</option>
	<option value="1500" cup="nightfall" meta-group="nightfall">Silph Factions (Nightfall)</option>
	<option value="1500" cup="marsh" meta-group="marsh">7-Eleven Marsh Cup</option>
	<option value="1500" cup="shadow" meta-group="shadow">TeamRocketPvP Shadow Cup 3.0</option>
	<option value="1500" cup="cutie" meta-group="great">Regicide PvP Charity Tournament</option>

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
		<option value="1500" cup="cliffhanger" meta-group="great">GO Stadium Cliffhanger</option>
	<?php endif; ?>
	<option value="1500" cup="custom">Custom</option>
</select>
