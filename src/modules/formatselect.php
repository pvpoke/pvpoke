<select class="format-select">
	<option value="1500" cup="all" meta-group="great">Great League</option>
	<option value="2500" cup="all" meta-group="ultra">Ultra League</option>
	<option value="2500" cup="premierclassic" meta-group="ultrapremierclassic">Ultra League (Premier Classic)</option>
	<option value="10000" cup="all" meta-group="master">Master League</option>
	<option value="10000" cup="classic" meta-group="master">Master League (Classic)</option>
	<option value="10000" cup="premierclassic" meta-group="masterpremierclassic">Master League (Premier Classic)</option>
	<option value="1500" cup="halloween" meta-group="halloween">Halloween Cup</option>
	<option value="1500" cup="kanto" meta-group="kanto">Kanto Cup</option>
	<option value="1500" cup="factions" meta-group="factions">Silph Factions (Comet)</option>
	<option value="1500" cup="twilightfactions" meta-group="twilight">Silph Factions (Twilight)</option>
	<option value="1500" cup="lunar" meta-group="lunar">Silph Lunar Cup</option>
	<option value="1500" cup="brawler" meta-group="brawler">Silph Brawler Cup</option>
	<option value="1500" cup="safari" meta-group="safari">Victory Road Safari Cup</option>

	<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
		<option value="1500" cup="cliffhanger" meta-group="great">GO Stadium Cliffhanger</option>
	<?php endif; ?>
	<option value="1500" cup="custom">Custom</option>
</select>
