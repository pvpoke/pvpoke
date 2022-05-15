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

	<h4>v1.27.2 (April 30, 2022)</h4>
	<ul>
		<li>Fixed shielding issues surrounding boosting moves like Flame Charge, which sometimes weren't being shielded correctly before.</li>
		<li>Relaxed optimized move timing for Pokemon with long duration Fast Moves; these Pokemon will now use Charged Moves with mostly optimal timing but not perfectly optimal timing. They will throw energy earlier and more consistently.</li>
		<li>Fixed an issue with optimized timing where Pokemon would sometimes go over 100 energy.</li>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/infographics/22-05-friend-trade-tier-list/">
				<img src="<?php echo $WEB_ROOT; ?>articles/article-assets/infographics/22-05-friend-trade-tier-list/thumb.jpg">
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/infographics/22-05-friend-trade-tier-list/">Sh!tty Friend Trade Tier List</a></h4>
			<div class="date">May 14, 2022</div>
			<p>Whether you meet new friends or that one person who doesn't open your gifts, here's a list of PvP trade ideas with low friendship level!</p>
			<div class="tags"><a href="<?php echo $WEB_ROOT; ?>articles?tag=Infographic"># Infographic</a></div>
		</div>
	</div>

</div>

<?php require_once 'footer.php'; ?>
