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

	<h4>v1.12.25 (January 21, 2020)</h4>
	<ul>
		<li>Attack stat now determines Charged Move ties:
			<ul>
				<li>Ties are determined by the Pokemon's actual Attack stat, which factors in the base stat, Attack IV, and level.</li>
			</ul>
		</li>
		<li>Sims, rankings, and Training Battles are updated with the new CMP tiebreaker.</li>
		<li>Added a new Charged Move Ties section in the battle details that show the Attack values a Pokemon needs to hit to win Charged Move ties.</li>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/cliffhanger-team-building/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/cliffhanger-thumb.jpg" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/cliffhanger-team-building/">Team Building for GO Stadium Cliffhanger</a></h4>
			<div class="date"> January 4, 2020</div>
			<p>GO Stadium has introduced an exciting new format called Cliffhanger! Learn how to spend your points and build your Cliffhanger team from the ground up.</p>
		</div>
	</div>

</div>

<?php require_once 'footer.php'; ?>
