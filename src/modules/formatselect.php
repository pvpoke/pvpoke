<select class="format-select">
	<option value="1500" cup="all" meta-group="great">Great League</option>
	<option value="2500" cup="all" meta-group="ultra">Ultra League</option>
	<option value="10000" cup="all" meta-group="master">Master League</option>
	<option value="10000" cup="classic" meta-group="master">Master League (Classic)</option>
	<option value="2500" cup="remix" meta-group="remixultra">Ultra League Remix</option>
	<option value="1500" cup="holiday" meta-group="holiday">Holiday Cup</option>
	<option value="1500" cup="sinnoh" meta-group="sinnoh">Sinnoh Cup</option>
	<option value="1500" cup="glacial" meta-group="glacial">Silph Glacial Cup</option>
	<option value="1500" cup="fusionfactions" meta-group="fusion">Silph Factions (Fusion)</option>
	<option value="1500" cup="comet" meta-group="comet">Gymbreakers Comet Cup</option>

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
		<option value="1500" cup="cliffhanger" meta-group="great">GO Stadium Cliffhanger</option>
	<?php endif; ?>
	<option value="1500" cup="custom">Custom</option>
</select>
