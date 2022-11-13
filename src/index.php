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

	<h4>v1.29.14 (November 5, 2022)</h4>
	<ul>
		<li>Custom Ranking updates:</li>
		<ul>
			<li>The "Species" filter can now import a Pokemon list from a custom group you have made and saved elsewhere on the site.</li>
			<li>Custom Rankings now use the league default movesets instead of generating movesets from scratch. (You can still provide moveset overrides.)</li>
			<ul>
				<li>In general, this should save time checking custom ranking results for the correct movesets.</li>
				<li>You can disable this feature per cup. Generated movesets may work better for small cups where off-meta movesets are more likely.</li>
			</ul>
			<li>You can now specify a Ranking Weight Multiplier per Pokemon in the Moveset Overrides section. Use this to increase the weighting applied to any meta defining Pokemon in your cup and generate more fine-tuned results.</li>
		</ul>
	</ul>

	<h4>v1.29.13 (November 3, 2022)</h4>
	<ul>
		<li>Matrix Battle updates:</li>
		<ul>
			<li>Wins that change to ties and ties that change to losses are now shown as differences in Matrix Battle.</li>
			<li>Added a "swap" button above Matrix Battle selections to quickly swap Pokemon groups between the left and right sides.</li>
			<li>Added a "Duplicate" button when editing a Pokemon in a Matrix Battle list.</li>
		</ul>

		<li>"Show Move Counts" settings on the rankings page now persists</li>
		<li>Pokemon can now be selected by dex number.</li>
		<li>Ranking CSV export now contains a dex number column.</li>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/infographics/22-11-shadow-predictions/">
				<img src="<?php echo $WEB_ROOT; ?>articles/article-assets/infographics/22-11-shadow-predictions/thumb.jpg">
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/infographics/22-11-shadow-predictions/">PvPoke's Shadow Crystal Ball</a></h4>
			<div class="date">November 13, 2022</div>
			<p>Which Shadow Pokemon could become more relevant for PvP in a future move update or Community Day? Check out this speculative list if you have TM's to spare!</p>
			<div class="tags"><a href="<?php echo $WEB_ROOT; ?>articles?tag=Infographic"># Infographic</a></div>
		</div>
	</div>

</div>

<?php
// Localhost developer panel
if (strpos($WEB_ROOT, 'src') !== false) : ?>

	<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/interface/RankingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php endif; ?>

<?php require_once 'footer.php'; ?>
