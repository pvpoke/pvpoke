<?php require_once 'header.php'; ?>

<div class="section home white">
	<p>Welcome to PvPoke.com! We're an open-source tool for simulating, ranking, and building teams for Pokemon GO PvP (player versus player) battles. Check out the links below to get started.</p>

	<a href="<?php echo $WEB_ROOT; ?>battle/" class="button">
		<h2 class="icon-battle">Battle</h2>
		<p>Simulate a battle between two custom Pokemon.</p>
	</a>
	<a href="<?php echo $WEB_ROOT; ?>train/" class="button">
		<h2 class="icon-train">Train</h2>
		<p>Play real-time battle simulations against a CPU opponent.</p>
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

	<h4>v1.15.0 (April 21, 2020)</h4>
	<ul>
		<li>Pokemon default IV's have been tweaked:</li>
		<ul>
			<li>Most Pokemon are now rank 64 with an IV floor of 5 (were previously rank 500 with an IV floor of 0). This generally improves their stat product from the old defaults and gets them closer to the CP limit, while maintaining some distance between default and rank 1.</li>
			<li>Pokemon that reach the CP limit above level 35 default to rank 16 with an IV floor of 12 (lucky trades).</li>
			<li>Untradeable Pokemon like Mew default to rank 54 with an IV floor of 10.</li>
		</ul>
	</ul>

	<h4>v1.14.10 (April 17, 2020)</h4>
	<ul>
		<li>Training Battles have been updated to reflect recent interface changes in-game along with a few QOL updates:</li>
		<ul>
			<li>Type icons appear for each Pokemon at the top of the screen. These icons change immediately on switches.</li>
			<li>The HP bar flashes red, orange, or blue based on damage effectiveness.</li>
			<li>Added a "Return to Team Select" button to the 6v6 view in Tournament Mode.</li>
			<li>Added a master autotap toggle that will enable autotapping automatically between games.</li>
			<li>"Champion" is now the default difficulty.</li>
		</ul>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/best-elite-tm-candidates-pvp/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/elite-tm-thumb.jpg" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/best-elite-tm-candidates-pvp/">Best Elite TM Candidates for PvP</a></h4>
			<div class="date">April 14, 2020</div>
			<p>Elite TM's will soon be available! Which exclusive moves and Pokemon are the best for your PvP team?</p>
		</div>

	</div>

</div>

<?php require_once 'footer.php'; ?>
