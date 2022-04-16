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

	<h4>v1.27.0 (April 16, 2022)</h4>
	<ul>
		<li>Core simulation logic has been updated with several changes and fixes:</li>
		<ul>
			<li>Added a new baiting behavior, "selective baiting", which only baits shields when it can meaningfully threaten the opponent. This behavior is now the default behavior.</li>
			<li>Optimized move timing is now default behavior.</li>
			<li>In some scenarios, Pokemon with self-debuffing moves like Close Combat will wait to use their moves if they can survive an imminent Charged Move.</li>
			<li>Fixed some issues surrounding faint predictions. Pokemon will now more reliably throw available energy before they faint.</li>
		</ul>
		<li>Updated Pokemon select interface with new shield, bait, and Shadow toggles</li>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/development/developer-notes-1-27-0/">
				<img src="<?php echo $WEB_ROOT; ?>articles/article-assets/developer-notes-1-27-0/thumb.jpg">
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/development/developer-notes-1-27-0/">PvPoke Developer Notes - Update 1.27.0</a></h4>
			<div class="date">April 16, 2022</div>
			<p>Get an overview on updates to the core simulation logic and default settings, including baiting behavior and optimized move timing.</p>
			<div class="tags"><a href="<?php echo $WEB_ROOT; ?>articles?tag=Development"># Development</a></div>
		</div>
	</div>

</div>

<?php require_once 'footer.php'; ?>
