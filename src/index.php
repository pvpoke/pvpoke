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
	
	<h4>v1.6.4 (March 25, 2019)</h4>
	<ul>
		<li>Ranking items are easier to open and close</li>
		<li>Fixed some niche battle logic issues</li>
		<ul>
			<li>Shield baiting and near faint calculations were sometimes being done incorrectly</li>
		</ul>
		<li>Pokemon now bait shields with low-energy attacks when both of their charged moves are charged</li>
		<ul>
			<li>This lines up with how shield baiting is done in actual play</li>
		</ul>
		<li>Pokemon now shield against stat-boosting moves like Power-Up Punch more methodically</li>
		<ul>
			<li>Pokemon who can withstand Power-Up Punch will let early attacks go through and shield boosted ones later</li>
			<li>Pokemon who are threatened by a coverage move like Ice Punch or Shadow Ball will continue to block Power-Up Punch as the safest option</li>
			<li>Pokemon who bait shields with Power-Up Punch will continue using it until they successfully break shields</li>
		</ul>
	</ul>
	
	<p>Follow on <a href="https://twitter.com/pvpoke" target="_blank">Twitter</a> for the latest news and updates!</p>
	
	<h3>Latest Article</h3>
	
	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/early-2019-update-highlights/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/2019-update-thumb.jpg" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/early-2019-update-highlights/">Highlights of the Early 2019 Updates</a></h4>
			<div class="date">February 20, 2019</div>
			<p>Just how powerful is Razor Leaf? What's the best way to use stat-boosting moves? This article highlights some of the recent PvP updates and what you should keep your eyes on.</p>
		</div>
		
	</div>
	
</div>

<?php require_once 'footer.php'; ?>