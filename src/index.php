<?php require_once 'header.php'; ?>

<div class="section home white">
	<p>Welcome to PvPoke.com! We're an open-source tool for simulating, ranking, and building teams for Pokemon GO PvP (player versus player) battles. Check out the links below to get started.</p>

	<a href="<?php echo $WEB_ROOT; ?>battle/" class="button">
		<h2 class="icon-battle">Battle</h2>
		<p>Simulate a battle between two custom Pokemon.</p>
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
	
	<h4>v1.8.2 (July 3, 2019)</h4>
	<ul>
		<li>Fixed a bug that caused headers to disappear when searching on the Moves page</li>
		<li>Breakpoint and bulkpoint calculations now also check against max Defense and max Attack, respectively, and show which Attack or Defense values will guarantee a certain breakpoint or bulkpoint against that opponent.</li>
	</ul>

	<h4>v1.8.1 (July 2, 2019)</h4>
	<ul>
		<li>Adjusted Pokemon default IV's</li>
		<ul>
			<li>In the last update, Pokemon were assigned "rank 1" IV's by default, which maximized overall stats. However most players will not have rank 1 Pokemon and the default sims tended to differ from typical play.</li>
			<li>Pokemon now have a pregenerated set of default IV's that are roughly equivalent to "rank 500" out of 4,096 possible combinations. This provides a more realistic benchmark to prepare against while also trending toward the upper end for competitive play.</li>
			<li>Pokemon that can't be traded like Mew, Jirachi, and Deoxys now obey their respective IV limits when generating IV combinations.</li>
		</ul>
		<li>Adjusted Pokemon level and IV entry and added advanced options</li>
		<ul>
			<li>You can now choose to maximize overall stats, Attack, or Defense</li>
		</ul>
		<li>Added Breakpoint &amp; Bulkpoint section in the matchup details</li>
		<ul>
			<li>Breakpoints and bulkpoints are calculated for the left Pokemon against the specific right Pokemon. You may wish to explore multiple IV spreads for the defending Pokemon to identify which stat ranges you should target.</li>
			<li>Clicking any of the level &amp; IV combinations in the tables will enter them for the respective Pokemon.</li>
			<li>Where possible, this report will show an IV combination that reaches both the best breakpoint and best bulkpoint.</li>
		</ul>
		<li>Added Settings page where you can adjust the following preferences:</li>
		<ul>
			<li>Default IV combination (for Pokemon that you select)</li>
			<li>Enable or diable timeline animations</li>
		</ul>
	</ul>

	<p>Follow on <a href="https://twitter.com/pvpoke" target="_blank">Twitter</a> for the latest news and updates!</p>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/guide-to-fast-move-registration/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/mechanics-thumb.jpg?v=2" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/guide-to-fast-move-registration/">Guide to Fast Move Mechanics</a></h4>
			<div class="date"> June 24, 2019</div>
			<p>How exactly do Fast Moves work and register? This guide will walk through some of PvP's mysterious nuts and bolts.</p>
		</div>
	</div>

</div>

<?php require_once 'footer.php'; ?>
