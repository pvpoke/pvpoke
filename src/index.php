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

	<h4>v1.20.11 (February 13, 2020)</h4>
	<ul>
		<li>Matrix Battle now has additional result tabs:</li>
		<ul>
			<li>"Battle" tab displays matchup results as before.</li>
			<li>"Breakpoint" tab displays Fast Move damage dealt.</li>
			<li>"Bulkpoint" tab displays Fast Move damage received.</li>
			<li>"Attack" tab displays Attack stat differential for analyzing Charged Move ties.</li>
		</ul>
		<li>Matrix Battle page is now directly linkable</li>
		<li>Modes on the Battle page are now in tabs instead of a dropdown.</li>
	</ul>

	<h4>v1.20.9 (February 11, 2020)</h4>
	<ul>
		<li>Damage multipliers from the Shadow boost or stat changes are no longer displayed as part of a Pokemon's stats. Instead, the multipliers are now shown in the Advanced/IV's section.</li>
		<ul>
			<li>Previously, Shadow Pokemon would appear to have higher Attack stats than their regular counterparts, which isn't functionally the case.</li>
		</ul>
		<li>Resolved interface issues where IV's and level cap settings weren't displayed correctly when selecting new Pokemon.</li>
		<li>Custom ranking fixes:</li>
		<ul>
			<li>XL Pokemon now appear correctly in the custom rankings (when allowed).</li>
			<li>Banning a Pokemon with the "Species" filter now also bans Shadow and XL versions of that Pokemon - no need to separately list their ID's.</li>
		</ul>
		<li>When adding new Pokemon to Matrix Battle, the new "Add &amp; Compare" button adds other IV spreads of that same Pokemon in a single click.</li>
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
