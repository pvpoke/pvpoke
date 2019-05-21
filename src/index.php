<?php require_once 'header.php'; ?>

<div class="section home white">
	<p>Welcome to PvPoke.com! We're an open-source tool for simulating, ranking, and building teams for Pokemon GO PvP (player versus player) battles. Check out the links below to get started.</p>

	<a href="<?php echo $WEB_ROOT; ?>battle/" class="button">
		<h2 class="icon-battle">Battle</h2>
		<p>Simulate a battle between two custom Pokemon.</p>
	</a>
	<a href="<?php echo $WEB_ROOT; ?>rankings/" class="button">
		<h2 class="icon-rankings">Rankings</h2>
		<p>Explore the rankings, movesets, and counters for the top Pokemon in each league.</p>
	</a>
	<a href="<?php echo $WEB_ROOT; ?>team-builder/" class="button">
		<h2 class="icon-team">Team Builder</h2>
		<p>Build your own team and see their type matchups and potential counters.</p>
	</a>
	<a href="<?php echo $WEB_ROOT; ?>contribute/" class="button">
		<h2 class="icon-contribute">Contribute</h2>
		<p>Check out the source code on Github or lend your support through Patreon.</p>
	</a>

	<!--Update section for updates-->
	<h3>What's New</h3>
	
	<h4>v1.7.8 (May 21, 2019)</h4>
	<ul>
		<li>Shield dropdown has been moved out of the options section</li>
		<ul>
			<li>This is by the far the most frequently accessed option, and having it hidden caused some confusion on the Multi-Battle page.</li>
		</ul>
		<li>Added a "Pull from timeline" button for starting HP and Energy</li>
		<ul>
			<li>This will use the Pokemon's HP and Energy from the currently selected point in the battle timeline</li>
		</ul>
		<li>Ranking entries now link to a Multi-Battle so you can see all matchups for that Pokemon</li>
		<li>Multi-Battle CSV export now includes HP and Energy remaining for each matchup</li>
		<li>Sandbox Mode updates:</li>
		<ul>
			<li>Added an "Update" button so you can manually refresh the battle results after changing settings or IV's</li>
			<li>Fast Move icons now appear with a thicker border where a Pokemon has both Charged Moves ready. This should make it easier to lay out shield baiting and other scenarios.</li>
		</ul>
	</ul>

	<p>Follow on <a href="https://twitter.com/pvpoke" target="_blank">Twitter</a> for the latest news and updates!</p>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/freefolk-guide-kingdom-cup/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/kingdom-cup-thumb.jpg?v=2" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/freefolk-guide-kingdom-cup/">The Freefolk's Guide to Kingdom Cup</a></h4>
			<div class="date"> April 11, 2019</div>
			<p>How do you make do without Bastiodon and Lucario? This guide explores your options to help you build a competitive Kingdom Cup team.</p>
		</div>

	</div>

</div>

<?php require_once 'footer.php'; ?>
