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

	<h4>v1.8.0 (June 24, 2019)</h4>
	<ul>
		<li>Updated battle simulator to be more accurate with in-game mechanics and scenarios:</li>
		<ul>
			<li>Fast Moves now register after a certain number of turns have passed. See <a href="<?php echo $WEB_ROOT; ?>articles/guide-to-fast-move-registration/">this article</a> for full details.</li>
			<li>Pokemon cannot use a Charged Move if they are fainted by a Fast Move on the same turn.</li>
			<li>Cooldowns reset immediately before a Charged Move. This allows an opposing Pokemon to use a Charged Move on the same turn if they have one available.</li>
		</ul>
	</ul>
	<ul>
		<li>Sandbox Mode adjustments and fixes:</li>
		<ul>
			<li>When you enter Sandbox Mode, circle "Tap" icons will appear where a Pokemon can take an action. Click these to assign and edit actions.</li>
			<ul>
				<li>Previously, you clicked on Fast or Charged Move icons to edit actions. Fast Moves may not always register on the turn where they're used, so it didn't feel intuitive to keep using them this way.</li>
			</ul>
			<li>Added a new "Wait" action that will make the Pokemon skip a turn.</li>
			<li>Added an "Update" button that will force the Sandbox simulation to rerun.</li>
			<ul>
				<li>Previously, the simulation would automatically rerun when adjusting Pokemon settings but there was no manual way to rerun the simulation.</li>
			</ul>
			<li>Fixed an issue where the "Continue Battling" button wouldn't work in Sandbox Mode.</li>
			<li>Fixed an issue where the "Pull From Timeline" button wouldn't correctly apply starting energy.</li>
		</ul>
	</ul>
	<ul>
		<li>Pokemon now use the "maximum stat product" IV combination by default.</li>
		<ul>
			<li>Previously, Pokemon were perfectly scaled to 1500 CP using their base stats. The purpose of this was to represent base Pokemon better and reduce the effect of IV's, but resulted in stats that weren't always possible. While there are other feasible options here and it may not be optimal for every Pokemon, making "best" IV's the default was a frequent request and is the goal most players are aiming for.</li>
			<li>You may notice the Team Builder and Multi-Battle tools take a little longer to run because of this change. I am hoping to optimize this further in the future!</li>
		</ul>
	</ul>
	<ul>
		<li>Rankings updated and tweaked:</li>
		<ul>
			<li>All rankings have been regenerated with updated results.</li>
			<li>The overall score formula has been adjusted slightly to favor the Lead and Closer categories over the Attacker and Defender categories.</li>
			<ul>
				<li>Good closers are naturally good defenders, for example, so this tweak favors more well rounded Pokemon without having too negative effects on specialized Pokemon. The overall change is minor but should produce slightly more realistic results.</li>
			</ul>
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
