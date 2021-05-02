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

	<h4>v1.22.0 (May 2, 2021)</h4>
	<ul>
		<li>Backend adjustments to default IV's and level cap.</li>
		<ul>
			<li>Default IV's now have a level cap of 50 for most Pokemon.</li>
			<ul>
				<li>Legendaries that haven't been available in raids since the Candy XL adjustments still have a level cap of 40.</li>
			</ul>
			<li>Default IV combinations are now higher ranked (~rank 100-200), still keeping some Attack weight.</li>
			<li>Level 40 and Level 50 Master League are now separate dropdowns in the league selector.</li>
			<li>Added a global toggle on the Settings page to filter XL eligible Pokemon across the site.</li>
		</ul>
		<li>Added new info and features to rankings section:</li>
		<ul>
			<li>Each Pokemon's performance ratings are now displayed in a radar chart.</li>
			<li>Moves are displayed with archetypes describing their strength and behavior.</li>
			<ul>
				<li>Move stats can now be viewed directly in the rankings.</li>
			</ul>
			<li>Ranking entries now list traits, short descriptions that illustrate each Pokemon's playstyle, strengths, and weaknesses. Traits can be searched in the searchbar.</li>
			<li>Ranking entries also list Charged Move cost and buddy distance. These can also be searched.</li>
			<ul>
				<li>Charged Move cost and buddy distance are also available as filters in Custom Rankings.</li>
			</ul>
		</ul>
		<li>Fixed an issue in Custom Rankings where battles linked in the key matchups section weren't using the movesets recommended in the rankings.</li>
		<li>Links to single battles no longer require movesets to be specified in the URL. The Pokemon will default to their recommended movesets.</li>
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
