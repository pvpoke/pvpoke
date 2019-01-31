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
	<h4>v1.2.1 (January 31, 2019)</h4>
	<ul>
		<li>Fixed some visual issues with the Battle timeline</li>
		<li>Battle links on the Rankings page now open in a new tab</li>
	</ul>
	<h4>v1.2.0 (January 30, 2019)</h4>
	<ul>
		<li>New Battle page features:</li>
		<ul>
			<li>Charged Move meters that animate with the timeline</li>
			<li>Playback controls to play the timeline in accelerated or real time</li>
			<li>Charged Moves on the timeline adjusted to better match in-game timing</li>
			<li>Timeline markings to better indicate when Charged Moves are being powered up</li>
			<li>Matchup Details section with a table of battle results for all shield combinations, and battle stats</li>
		</ul>
		<li>Fixed Girafarig's typing</li>
	</ul>
	
	<p>Follow on <a href="https://twitter.com/pvpoke" target="_blank">Twitter</a> for the latest news and updates!</p>
	
	<h3>Latest Article</h3>
	
	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/hoenn-pokemon-hunt-pvp/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/hoenn-thumb.jpg" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/hoenn-pokemon-hunt-pvp/">Hoenn Pokemon to Hunt for PvP</a></h4>
			<div class="date">January 21, 2019</div>
			<p>Which Hoenn Pokemon should you keep an eye out for to use in PvP during the Hoenn event? Take a look at this list to prepare for your Pokemon hunts!</p>
		</div>
		
	</div>
	
</div>

<?php require_once 'footer.php'; ?>