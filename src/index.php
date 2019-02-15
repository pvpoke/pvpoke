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
	<p>Stat buffs and debuffs are here! Stat buff mechanics are now working on the following pages:</p>
	<ul>
		<li>Single battles</li>
		<li>Multi battles (as a preset only)</li>
		<li>Team Builder (as a preset only)</li>
	</ul>
	<p>Please note that stat buffing moves and mechanics are currently <i>not</i> implemented in the following:</p>
	<ul>
		<li>Rankings</li>
		<li>Multi battle simulations</li>
		<li>Team Builder simulations</li>
		<li>Auto move selection and use</li>
		<ul>
			<li>Optimal play involving stat-buffing moves still needs to be analyzed, so currently Pokemon aren't any more likely to select or use stat-buffing moves than before. If you want to look at these moves in particular, consider selecting only these moves.</li>
		</ul>
	</ul>
	
	<p></p>
	<p>Pardon the dust, and thanks for your patience as these changes are implemented throughout the site!</p>
	
	<h4>v1.4.0 (February 15, 2019)</h4>
	<ul>
		<li>Initial implementation for stat-buffing moves (see above)</li>
		<li>Option to enter starting stat buffs/debuffs in the "Advanced" stat section (note that at this time these settings won't carry over when sharing links, sorry for the inconvenience!)</li>
		<li>Ranking algorithm updates:</li>
		<ul>
			<li>Pokemon are now excluded by minimum base stat product instead of minimum CP. This includes Pokemon like Wobbuffet who didn't meet the previous CP cutoff but have similar bast stat products to viable Pokemon.</li>
			<li>Pokemon in the Lead, Attacker, and Defender categories are now awarded extra points based on the number of shields they both keep and remove. This emphasizes Pokemon who use fewer shields or remove more shields when they win.</li>
		</ul>
		<li>Pokemon Select search has been tweaked to select the first matching Pokemon</li>
		<ul>
			<li>This ensures Pokemon that come alphabetically first are selected (e.g. Giratina Altered instead of Giratina Origin)</li>
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