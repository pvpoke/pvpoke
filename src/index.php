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
	
	<h4>v1.7.0 (April 5, 2019)</h4>
	<ul>
		<li>Added Moves page with reference tables for Fast and Charges moves, and a moveset explorer</li>
		<li>Reorganized some header links under a submenu</li>
		<ul>
			<li>It's free real estate</li>
		</ul>
		<li>Fixed a bug in Multi-Battle where switching between custom and other cup options would cause incorrect movesets to be displayed in the results</li>
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