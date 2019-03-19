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
	
	<h4>v1.6.2 (March 18, 2019)</h4>
	<ul>
		<li>Kingdom Cup support</li>
		<li>Ranking algorithm updates</li>
		<ul>
			<li>The lead, attacker, and defender scenarios now use 1 vs 1 shields, 0 vs 1 shields, and 1 vs 0 shields respectively (was previously 2 vs 2, 0 vs 2, 0 vs 2)</li>
			<ul>
				<li>This change better reflects likely in-game scenarios and shield usage. It also demphasizes Razor Leaf, which previously had significant power in 2-shield scenarios.</li>
			</ul>
			<li>Rankings now iterate multiple times through an updated weighting function.</li>
			<ul>
				<li>This weighting function removes the bottom Pokemon each iteration until the final iteration scores each Pokemon's performance against the remaining top Pokemon.</li>
				<li>Previously, Pokemon who performed broadly well but didn't perform well against the top would still rank highly. Rankings should now better represent the top Pokemon, and the Pokemon who beat them.</li>
				<li>Move usage is also now gathered from matchups against the top.</li>
			</ul>
		</ul>
		<li>Adjusted the modal window to prevent accidental closes in Sandbox Mode</li>
		<li>Fixed a battle logic issue that caused minor discrepancies with the shield baiting toggle</li>
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