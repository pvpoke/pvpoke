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

	<h4>v1.26.2 (February 21, 2022)</h4>
	<ul>
		<li>Matchup tables such as in Matrix Battle and the Team Builder now always read row vs column.</li>
		<ul>
			<li>This was previously an option in the settings, and the default was column vs row. This tended to cause confusion and made it unclear how the tables were intended to read.</li>
			<li>Added visuals to indicate correct reading direction.</li>
		</ul>
		<li>Matrix Battle results now include win/loss record and average.</li>
		<ul>
			<li>Win/Loss records show battle wins and losses for the row. When viewing the "Attack" tab, this record shows Charged Move tie wins and losses.</li>
		</ul>
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
