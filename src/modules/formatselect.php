<select class="format-select">
	<option value="1500" cup="all" meta-group="great">Great League</option>
	<option value="2500" cup="all" meta-group="ultra">Ultra League</option>
	<option value="10000" cup="all" meta-group="master">Master League</option>
	<option value="10000" cup="classic" meta-group="master">Master League (Classic)</option>
	<option value="500" cup="littlejungle" meta-group="littlejungle">Little Jungle Cup</option>
	<option value="1500" cup="halloween" meta-group="halloween">Halloween Cup</option>
	<option value="1500" cup="obsidian" meta-group="obsidian">Silph Obsidian Cup</option>
	<option value="1500" cup="nemesis" meta-group="nemesis">Silph Nemesis Cup</option>
	<option value="2500" cup="cometultra" meta-group="cometultra">Silph Factions (Ultra Comet)</option>
	<option value="1500" cup="floatingcity" meta-group="floatingcity">Silph Factions (Floating City)</option>
	<option value="1500" cup="dungeon" meta-group="dungeon">Silph Factions (Dungeon)</option>

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
		<option value="1500" cup="cliffhanger" meta-group="great">GO Stadium Cliffhanger</option>
	<?php endif; ?>
	<option value="1500" cup="custom">Custom</option>
</select>
