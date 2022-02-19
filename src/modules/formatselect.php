<select class="format-select">
	<option value="1500" cup="all" meta-group="great">Great League</option>
	<option value="2500" cup="all" meta-group="ultra">Ultra League</option>
	<option value="10000" cup="all" meta-group="master">Master League</option>
	<option value="10000" cup="classic" meta-group="master">Master League (Classic)</option>
	<option value="10000" cup="premierclassic" meta-group="master">Master League (Premier Classic)</option>
	<option value="1500" cup="love" meta-group="love">Love Cup</option>
	<option value="1500" cup="johto" meta-group="johto">Johto Cup</option>
	<option value="1500" cup="guardian" meta-group="guardian">Silph Guardian Cup</option>
	<option value="1500" cup="obsidian" meta-group="obsidian">Silph Obsidian Cup</option>
	<option value="1500" cup="factions" meta-group="factions">Silph Factions (Cave)</option>
	<option value="1500" cup="fusionfactions" meta-group="fusion">Silph Factions (Fusion)</option>

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
		<option value="1500" cup="cliffhanger" meta-group="great">GO Stadium Cliffhanger</option>
	<?php endif; ?>
	<option value="1500" cup="custom">Custom</option>
</select>
