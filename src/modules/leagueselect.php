<?php if(strpos($_SERVER['REQUEST_URI'], 'custom-rankings') !== false): ?>
	<select class="league-select">
		<option value="500" level-cap="50">Little League</option>
		<option value="1500" level-cap="50" selected>Great League</option>
		<option value="2500" level-cap="40">Ultra League (Level 40)</option>
		<option value="2500" level-cap="50">Ultra League (Level 50)</option>
		<option value="10000" level-cap="40">Master League (Level 40)</option>
		<option value="10000" level-cap="50">Master League (Level 50)</option>
	</select>
<?php else:  ?>
	<select class="league-select">
		<option value="500" level-cap="50">Little League</option>
		<option value="1500" level-cap="50" selected>Great League</option>
		<option value="2500" level-cap="50">Ultra League</option>
		<option value="10000" level-cap="50">Master League</option>
	</select>
<?php endif; ?>



