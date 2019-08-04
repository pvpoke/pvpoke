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

	<h4>v1.9.2 (August 4, 2019)</h4>
	<ul>
		<li>Fixed an issue in Training Battles where Charged Moves would sometimes deal no damage</li>
		<ul>
			<li>This happened due to an issue where the game timers would desync and the Charged Move minigame would end early, resulting in your charge not being submitted before damage occurred. The timer desync part is still unresolved, but the Charged Move sequence has been reworked so your moves will deal the correct amount of damage even when this issue occurs.</li>
		</ul>
		<li>When Autotap is enabled in Training Battles, switch commands are buffered and submitted each turn until they succeed. This should resolve issues that made switching incredibly difficult with Autotap enabled.</li>
		<ul>
			<li>The simulator contains the same "switch glitch" in the game that causes switches to fail when you're in the middle of a Fast Move. For ease of use, this behavior is fixed when Autotap is enabled. You'll want to keep practicing care with your switches when you tap manually.</li>
		</ul>
		<li>Added the Rematch button for battles in Tournament Mode so you can replay against the same lineup. Matches you replay won't count for or against your record.</li>
		<li>Added a new set of controls to Training Battles so you can:</li>
		<ul>
			<li>Pause the game mid-match</li>
			<li>Instantly restart the current match</li>
			<li>Quit from the current match to the setup options in 3v3 mode, or the team select screen in 6v6 mode</li>
		</ul>
		<li>Tweaked the AI's pick strategies in 3v3 mode so counter leads are less frequent in the higher difficulties.</li>
		<ul>
			<li>The AI doesn't have advanced knowledge of your lead, but how the pick method works in 3v3 made a counter lead highly likely. This has been turned down so you should encounter a wider variety of leads and lineups. This doesn't impact 6v6.</li>
		</ul>
	</ul>

	<p>Follow on <a href="https://twitter.com/pvpoke" target="_blank">Twitter</a> for the latest news and updates!</p>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/developing-trainer-battle-ai/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/ai-thumb.jpg?v=2" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/developing-trainer-battle-ai/">Developing an AI for Pokemon GO Trainer Battles</a></h4>
			<div class="date"> July 30, 2019</div>
			<p>How does the AI on the site's training battles work? Read all about how I approached development and strategies the AI uses to mimic player behavior.</p>
		</div>
	</div>

</div>

<?php require_once 'footer.php'; ?>
