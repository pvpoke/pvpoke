<?php require_once 'header.php'; ?>

<div class="section home white">
	<p>Welcome to PvPoke.com! We're an open-source tool for simulating, ranking, and building teams for Pokemon GO PvP (player versus player)&amp; battles. Check out the links below to get started.</p>
	
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
	
	<h3>What's New</h3>
	<h4>v1.1.1 (January 22, 2019)</h4>
	<ul>
		<li>Fixed Alolan Raticate's typing</li>
		<li>Rewrote Charged Move decision making to be consistent regardless of Pokemon order</li>
		<li>Pokemon now make slightly more optimal choices by using Fast Moves for as long as possible while the opponent is on cooldown</li>
		<li>Rankings updated with the above changes</li>
		<ul>
			<li>Mostly minor changes but Pokemon with quick Fast Moves benefit more from the update</li>
		</ul>
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