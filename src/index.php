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
	
	<h4>v1.6.1 (March 12, 2019)</h4>
	<ul>
		<li>Fixed some visual issues in the multi-battle results on mobile that caused the layout to shift</li>
		<li>Removed the CP cap from manually entered IV's</li>
		<ul>
			<li>There was an issue in battle links that sometimes pushed Pokemon over the CP limit, but this fix caused usability issues. This has been adjusted to mostly fix the battle link issue while leaving manually inputted IV's unaffected.</li>
		</ul>
	</ul>
	
	<h4>v1.6.0 (March 11, 2019)</h4>
	<ul>
		<li>Multi-Battle now supports custom Pokemon groups</li>
		<ul>
			<li>Get started quickly with preset groups for each cup and league</li>
			<li>Add up to 50 Pokemon with specific movesets or IVs</li>
			<li>Save your groups locally or export them in text format</li>
		</ul>
		<li>Multi-Battle results can now be exported in CSV format</li>
		<li>Battle adjustments</li>
		<ul>
			<li>Auto move selection and use now include stat buffs in DPE calculations</li>
			<ul>
				<li>This is a simple tweak that causes a Pokemon like Hitmonchan to use Power-Up Punch over Brick Break when both have identical stats.</li>
			</ul>
			<li>Pokemon now favor lower energy moves when DPE is within a very close margin</li>
			<li>Added an option to turn shield baiting on or off</li>
			<ul>
				<li>When on, Pokemon always use low-energy moves against opponent shields. When off, Pokemon will only use their most efficient (highest DPE) move. This will help show which Pokemon rely on a shield bait to win their matchups.</li>
			</ul>
			<li>Pokemon option section is now toggleable to reduce clutter</li>
		</ul>
		<li>Sandbox Mode Fixes</li>
		<ul>
			<li>Fixed an issue where the "Apply buffs/debuffs" checkbox wasn't behaving correctly, esp. with Power-Up Punch</li>
			<li>Clicking a shield icon now brings up the edit window for the associated Charged Move</li>
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