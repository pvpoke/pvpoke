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

	<h4>v1.29.0 (July 7th, 2022)</h4>
	<ul>
		<li>Updated simulation mechanics to match behavior from the latest game version:</li>
		<ul>
			<li>Floating Fast Moves now apply immediately after a Charged Move instead of the turn after.</li>
			<ul>
				<li>This change effectively removes "overtapping" from the simulations.</li>
				<li>Fast Moves in the simulations still apply before Charged Moves. This will remain until in-game behavior is tested and confirmed otherwise.</li>
			</ul>
			<li>In battles using the Train feature, Fast Move damage now applies before switches that occur on the same turn.</li>
			<ul>
				<li>If you attempt to switch after a Charged Move, any floating Fast Moves will also apply to the current Pokemon first.</li>
			</ul>
		</ul>
		<li>"Consistency" score formula has been updated to weigh Fast Move duration less. Pokemon with long duration Fast Moves now have marginally higher Consistency scores.</li>
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
