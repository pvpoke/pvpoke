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

	<h4>v1.9.0 (August 1, 2019)</h4>
	<ul>
		<li>Play real-time battle simulations against a CPU opponent with the new Training Battle feature, anytime and anywhere</li>
		<ul>
			<li>Practice with your teams or try new Pokemon before you invest</li>
			<li>Challenge four difficulty levels: Novice, Rival, Elite, and Champion</li>
			<ul>
				<li>Practice at your own pace in a pressure-free environment and against an opponent with your experience level</li>
			</ul>
			<li>Play in Great, Ultra, or Master League, or in any of The Silph Arena's Season 1 cups</li>
			<li>Play in Single Mode (blind 3v3) or Tournament Mode (pick 6, play 3, multiple rounds)</li>
			<li>Learn from your battles with advanced post-game stats</li>
		</ul>
		<li>Piggybacking is now reenabled for "self-piggybacking"; performing two Charged Moves in a row has the opportunity to negate the opponent's Fast Move</li>
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
