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

	<h4>v1.24.7 (December 10, 2021)</h4>
	<ul>
		<li>Battle timeline tooltips now show a move's damage in percent alongside the damage value.</li>
		<li>Future ranking updates will sort key wins and losses by Battle Rating.</li>
		<ul>
			<li>These were previously sorted by a behind-the-scenes score used to determine the key win and key loss lists.</li>
			<li>This change is currently present in custom rankings, and will take effect in the main rankings when those are updated in the future.</li>
		</ul>
		<li>Clicking the "Battle" button after using the "Explore Win Conditions" feature will revert the simulation to non-random results.</li>
		<li>On mobile, the Pokemon search function on the Battle and Team Builder pages now completes when you finish typing rather than every keypress.</li>
		<ul>
			<li>This change is aimed at mitigating input lag on some mobile devices.</li>
		</ul>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/ultimate-guide-to-team-building/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/team-building-thumb.jpg" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/ultimate-guide-to-team-building/">Ultimate Team Building Guide by PolymersUp</a></h4>
			<div class="date">August 11, 2020</div>
			<p>Learn the fundamentals of building a good team and how to use the PvPoke Team Builder to its full potential.</p>
		</div>

	</div>

</div>

<?php require_once 'footer.php'; ?>
