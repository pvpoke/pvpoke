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
	
	<h4>v1.7.6 (May 7, 2019)</h4>
	<ul>
		<li>Updated Multi-Battle CSV download to work in Microsoft Edge</li>
		<li>Added number labels to the shield matchup table</li>
	</ul>
	
	<h4>v1.7.5 (May 4, 2019)</h4>
	<ul>
		<li>You can now add custom moves to a Pokemon's move pool, with fully shareable battle links.</li>
		<ul>
			<li>This feature isn't currently supported for Pokemon in custom Multi Battle groups.</li>
		</ul>
		<li>Fixed a bug where switching between Single Battle and Multi Battle would cause Pokemon's movesets to change.</li>
	</ul>
	
	<p>Follow on <a href="https://twitter.com/pvpoke" target="_blank">Twitter</a> for the latest news and updates!</p>
	
	<h3>Latest Article</h3>
	
	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/freefolk-guide-kingdom-cup/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/kingdom-cup-thumb.jpg?v=2" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/freefolk-guide-kingdom-cup/">The Freefolk's Guide to Kingdom Cup</a></h4>
			<div class="date"> April 11, 2019</div>
			<p>How do you make do without Bastiodon and Lucario? This guide explores your options to help you build a competitive Kingdom Cup team.</p>
		</div>
		
	</div>
	
</div>

<?php require_once 'footer.php'; ?>