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

	<?php require 'modules/ads/body-728.php'; ?>

	<?php if($_SETTINGS->ads == 1) : ?>
		<span data-ccpa-link="1"></span>
	<?php endif; ?>

	<!--Update section for updates-->
	<h3>What's New</h3>

	<h4>v1.26.4 (March 30, 2022)</h4>
	<ul>
		<li>Team Builder now has a max team size option in the advanced settings for Silph Factions play. This doesn't change how teams are evaluated.</li>
		<li>Fixed an issue where entering Shadow Pokemon in the Team Builder's excluded threats or alternatives wouldn't exclude them.</li>
		<li>Custom groups can now be sorted by Attack, Defense, or name.</li>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/strategy/tournament-guide/">
				<img src="<?php echo $WEB_ROOT; ?>articles/article-assets/tournament-guide/thumb.jpg">
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/strategy/tournament-guide/">Strategy Guide for Tournament Play</a></h4>
			<div class="date">March 25, 2022</div>
			<p>How do you build a team for tournament play and pick your Pokemon for battle? Get an in depth look at tournament strategies with advice from veteran trainers!</p>
			<div class="tags"><a href="<?php echo $WEB_ROOT; ?>articles?tag=Strategy"># Strategy</a></div>
		</div>
	</div>

</div>

<?php require_once 'footer.php'; ?>
