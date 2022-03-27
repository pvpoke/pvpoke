<select class="cup-select">
	<option value="all" cup="all" meta-group500="littlegeneral" meta-group1500="great" meta-group2500="ultra" meta-group10000="master">Open League</option>
	<option value="premierclassic" meta-group2500="ultrapremierclassic" meta-group10000="masterpremierclassic">Premier Classic</option>
	<option value="littlejungle" meta-group500="littlejungle">Little Jungle Cup</option>
	<option value="halloween" meta-group1500="halloween">Halloween Cup</option>
	<option value="obsidian" meta-group1500="obsidian">Silph Obsidian Cup</option>
	<option value="nemesis" meta-group1500="nemesis">Silph Nemesis Cup</option>
	<option value="cometultra" meta-group2500="cometultra">Silph Factions (Ultra Comet)</option>
	<option value="floatingcity" meta-group1500="floatingcity">Silph Factions (Floating City)</option>
	<option value="dungeon" meta-group1500="dungeon">Silph Factions (Dungeon)</option>

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
		<option value="community" cup="cliffhanger">GO Stadium Cliffhanger</option>
	<?php endif; ?>

	<?php if((strpos($_SERVER['REQUEST_URI'], 'battle') !== false)||(strpos($_SERVER['REQUEST_URI'], 'rankings') !== false)): ?>
		<option value="custom" cup="custom">Custom</option>
	<?php endif; ?>

</select>
