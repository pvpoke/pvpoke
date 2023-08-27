<?php require_once 'header.php'; ?>

<div class="section home white">

	<p>Welcome to PvPoke.com! We're an open-source tool for simulating, ranking, and building teams for Pokemon GO PvP (player versus player) battles. Check out the links below to get started.</p>

	<a href="<?php echo $WEB_ROOT; ?>battle/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-battle"></span>
			<span class="btn-label">
				<h2>Battle</h2>
				<p>Simulate a battle between two custom Pokemon.</p>
			</span>
		</span>
	</a>

	<a href="<?php echo $WEB_ROOT; ?>rankings/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-rankings"></span>
			<span class="btn-label">
				<h2>Rankings</h2>
				<p>Explore the rankings, movesets, and counters for the top Pokemon in each league.</p>
			</span>
		</span>
	</a>

	<a href="<?php echo $WEB_ROOT; ?>team-builder/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-team"></span>
			<span class="btn-label">
				<h2>Team Builder</h2>
				<p>Build your own team and see their type matchups and potential counters.</p>
			</span>
		</span>
	</a>

	<a href="<?php echo $WEB_ROOT; ?>train/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-train"></span>
			<span class="btn-label">
				<h2>Train</h2>
				<p>Play real-time battle simulations against a CPU opponent.</p>
			</span>
		</span>
	</a>


	<a href="<?php echo $WEB_ROOT; ?>contribute/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-heart"></span>
			<span class="btn-label">
				<h2>Contribute</h2>
				<p>Check out the source code on Github or lend your support through Patreon.</p>
			</span>
		</span>
	</a>

	<h3>Pokemon Scarlet &amp; Violet</h3>

	<a href="<?php echo $WEB_ROOT; ?>tera/" class="button tera-button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-tera"></span>
			<span class="btn-label">
				<h2>Tera Raid Counter Calculator</h2>
				<p>Take on Tera Raid bosses with this tool to look up Pokemon with the best type matchups.</p>
			</span>
		</span>
	</a>

	<?php require 'modules/ads/body-728.php'; ?>

	<?php if($_SETTINGS->ads == 1) : ?>
		<span data-ccpa-link="1"></span>
	<?php endif; ?>

	<!--Update section for updates-->
	<h3>What's New</h3>

	<h4>v1.30.8 (August 27, 2023)</h4>
	<ul>
		<li>Tweaked ranking formula for Chargers category to factor in a Pokemon's fast move pressure (ability to farm down) and the amount of energy a Pokemon can take out of a matchup if it's forced to throw a Charged Move (ability to overfarm).</li>
		<li>Tweaked ranking formula for Consistency category to further penalize Pokemon that use the moves Power-Up Punch, Feather Dance, Bubble Beam, and Lunge.</li>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
	<div class="col-3">
		<a href="<?php echo $WEB_ROOT; ?>articles/community-day/23-08-froakie/">
			<img src="<?php echo $WEB_ROOT; ?>articles/article-assets/community-day/23-08-froakie/thumb.jpg">
		</a>
	</div>
	<div class="col-9">
		<h4><a href="<?php echo $WEB_ROOT; ?>articles/community-day/23-08-froakie/">Froakie Community Day Guide for PvP</a></h4>
		<div class="date">August 9, 2023</div>
		<p>Fan favorite Greninja is finally getting the level-up it needs! Will it be enough to become viable in PvP? Find out more about Greninja and IV's to look for during the upcoming Community Day!</p>
		<div class="tags"><a href="<?php echo $WEB_ROOT; ?>articles?tag=Community Day"># Community Day</a><a href="<?php echo $WEB_ROOT; ?>articles?tag=Infographic"># Infographic</a></div>
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

<?php else: ?>

	<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>

	<script>
	var gm = GameMaster.getInstance();
	</script>

<?php endif; ?>

<?php require_once 'footer.php'; ?>
