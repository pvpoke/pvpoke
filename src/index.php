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

	<h4>v1.14.18 (May 8, 2020)</h4>
	<ul>
		<li>Added back Season 2 Silph rankings for the Battle of the Servers tournament. Note that these rankings don't include the upcoming move updates, and will be removed after the tournament begins.</li>
		<li>Updated and fixed some sim logic:</li>
		<ul>
			<li>Fixed an issue where Pokemon building up to two self-debuffing moves wouldn't throw a move before fainting.</li>
			<li>Pokemon now reach for a bigger move if it would KO rather than defaulting to the highest DPE move. This should improve some situations where the highest DPE move wasn't always the optimal play. This behavior is only active when baiting is turned on.</li>
		</ul>
	</ul>

	<h4>v1.14.16 (May 2, 2020)</h4>
	<ul>
		<li>Move balance changes have been rolled back until the delayed Season 2 start</li>
		<li>Note that the Premier Cup rankings use the current (old) move stats and will change once they're reimplemented.</li>
		<li>Updated versions of Moonblast, Wild Charge, and Drill Run are available to add as custom moves.</li>
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
			<div class="date">April 28, 2020</div>
			<p>Elite TM's are now available! Which exclusive moves and Pokemon are the best for your PvP team?</p>
		</div>

	</div>

</div>

<?php require_once 'footer.php'; ?>
