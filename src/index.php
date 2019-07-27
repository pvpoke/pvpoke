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
	
	<h4>v1.8.5 (July 26, 2019)</h4>
	<ul>
		<li>Edited file names for CSV export to be more descriptive with information about moveset and shields</li>
	</ul>
	
	<h4>v1.8.4 (July 24, 2019)</h4>
	<ul>
		<li>Piggybacking is now disabled, following discoveries that it was patched in the latest Charged Move mechanic update</li>
		<ul>
			<li>Previously a quirk existed where you could cancel an opponent's Fast Move by performing a Charged Move immediately after another Charged Move. This technique was known as "piggybacking" and no longer works since the Charged Move minigame update.</li>
		</ul>
		<li>Added a charge dropdown in Sandbox Mode so you can select whether a Charged Move deals full or partial damage</li>
		<li>Adjusted Bastiodon's default IV's to be more realistic</li>
	</ul>

	<p>Follow on <a href="https://twitter.com/pvpoke" target="_blank">Twitter</a> for the latest news and updates!</p>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/mirror-cup-past-metas/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/mirror-thumb.jpg?v=2" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/mirror-cup-past-metas/">Mirror Cup: Glimpse at Past Metas</a></h4>
			<div class="date"> July 18, 2019</div>
			<p>The Mirror Cup is here! We get to look back at past cups with all the new Pokemon and movesets. What's changed and how can you prepare?</p>
		</div>
	</div>

</div>

<?php require_once 'footer.php'; ?>
