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

	<?php require 'modules/ads/body-728.php'; ?>

	<?php if($_SETTINGS->ads == 1) : ?>
		<span data-ccpa-link="1"></span>
	<?php endif; ?>

	<!--Update section for updates-->
	<h3>What's New</h3>

	<h4>v1.28.5 (June 16, 2022)</h4>
	<ul>
		<li>Adjusted the Team Builder interface to mitigate lag or freezes when adding a new Pokemon, especially on Android or other mobile devices.</li>
	</ul>

	<h4>v1.28.4 (June 11, 2022)</h4>
	<ul>
		<li>Tab title and icon updates:</li>
		<ul>
			<li>Multi-Battle and Matrix Battle tabs are now labeled in the page title</li>
			<li>Team Builder tabs list Pokemon names in the page title</li>
			<li>Added new favicons to help distinguish between Ranking, Multi-Battle, Matrix Battle, and Team Builder pages.</li>
		</ul>
		<li>Team Builder fixes/updates:</li>
		<ul>
			<li>Fixed an issue in the Team Builder where custom threats would revert to their default movesets.</li>
			<li>Shadow Pokemon in custom threats and alternatives lists will automatically appear in the results without needing to manually enable the Shadow Pokemon setting.</li>
		</ul>
		<li>Custom Rankings fixes:</li>
		<ul>
			<li>Fixed the "Import League or Cup" dropdown to import cup settings. This dropdown currently has duplicate entries and is missing recent cups - stay tuned for more updates.</li>
			<li>An issue where the Custom Rankings buttons would sometimes do nothing should be resolved.</li>
		</ul>
		<li>Fixed the "Copy" button for importing and exporting custom groups.</li>
		<li>Fixed an issue where battles with multiple custom added moves didn't generate links correctly.</li>
		<li>Fixed the Moves page search after sorting the table, and searching now allows for spaces between a list of move types or names.</li>
		<li>Normal Pokemon will have Frustration automatically added or removed from their movepools when changing the Pokemon Form setting.</li>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/community-day/22-06-deino/">
				<img src="<?php echo $WEB_ROOT; ?>articles/article-assets/community-day/22-06-deino/thumb.jpg">
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/community-day/22-06-deino/">Deino Community Day Guide for PvP</a></h4>
			<div class="date">June 22, 2022</div>
			<p>Are three heads better than one? Find out how Brutal Swing Hydreigon will impact the meta and which PvP Pokemon and IV's to look for this Community Day!</p>
			<div class="tags"><a href="<?php echo $WEB_ROOT; ?>articles?tag=Community Day"># Community Day</a><a href="<?php echo $WEB_ROOT; ?>articles?tag=Infographic"># Infographic</a></div>
		</div>
	</div>

</div>

<?php require_once 'footer.php'; ?>
