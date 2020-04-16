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

	<h4>v1.14.8 (April 3, 2020)</h4>
	<ul>
		<li>Fixed some battle logic issues in the simulations:</li>
		<ul>
			<li>Pokemon more accurately take into account unregistered Fast Move damage when firing off Charged Moves before fainting.</li>
			<li>Pokemon more consistently fire stored Charged Moves ahead of Charged Move ties they will lose. This issue resulted in Pokemon sometimes not firing Charged Moves at all, especially while building up self-debuffing moves like Superpower.</li>
			<li>Fixed an issue where "hooking" couldn't occur on the same turn a Pokemon gained enough energy for a Charged Move. Hooking is when you queue a Charged Move in the middle of your Fast Move, and it fires immediately after your opponent uses a Charged Move during that time (in-game this appears like a "false" Charged Move tie).</li>
		</ul>
		<li>Rankings have been updated with the above changes. For the most part these changes don't significantly change matchups but make bad matchups less extreme for certain Pokemon.</li>
	</ul>

	<h4>v1.14.7 (April 3, 2020)</h4>
	<ul>
		<li>Random Voyager teams are now available to fight in Training Battles!</li>
	</ul>

	<h4>v1.14.6 (April 2, 2020)</h4>
	<ul>
		<li>Simulations and rankings have been updated with the April balance changes including a buff to Bullet Seed and nerfs to Ancient Power, Ominous Wind, and Silver Wind!</li>
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
