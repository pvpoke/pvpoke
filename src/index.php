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

	<h4>v1.9.3 (August 7, 2019)</h4>
	<ul>
		<li>In Training Battles, switch commands are now buffered regardless of whether autotap is enabled or disabled to make switching seamless.</li>
		<ul>
			<li>I intended to replicate the "switch glitch" that appears in-game but reports were that switching was more difficult than in-game.</li>
		</ul>
		<li>Fixed an issue where importing a team would sometimes result in no Charged Moves being selected.</li>
		<li>Popup windows (Pokemon selection, etc.) can now scroll on mobile in cases where the popup content extends beyond the screen.</li>
		<li>Adjusted Charged Move buttons to fix visual glitches on iPhone/Safari.</li>
		<li>Adjusted AI behavior, with a focus on Champion difficulty:</li>
		<ul>
			<li>The AI is now more hesitant to shield in general, especially involving Power-Up Punch and Acid Spray.</li>
			<li>The AI should also make fewer curious switches, such as tossing Pokemon against their hard counters.</li>
			<li>The AI is now more likely to preserve switch advantange and stick it out in close or neutral matchups.</li>
			<li>These changes result in more consistent behavior but also allow less veriance. I'll be looking closely at game data and feeback to make sure these behavior changes are more engaging and challenging than the old behaviors.</li>
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
