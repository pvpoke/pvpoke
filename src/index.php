<?php require_once 'header.php'; ?>

<div class="section home white">

	<p class="small">Welcome to PvPoke.com, an open-source tool for Pokemon GO PvP and GO Battle League!</p>

	<a href="<?php echo $WEB_ROOT; ?>battle/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-battle"></span>
			<span class="btn-label">
				<h2>Battle</h2>
				<p>Simulate battles between two or more Pokemon.</p>
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
				<p>Build your own team and see potential threats and suggestions.</p>
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


	<a href="<?php echo $WEB_ROOT; ?>contact/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-heart"></span>
			<span class="btn-label">
				<h2>Contact</h2>
				<p>Get in touch, report a technical issue, or lend your support through Patreon.</p>
			</span>
		</span>
	</a>

	<h3>Pokemon Scarlet &amp; Violet</h3>

	<a name="news"></a>

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

	<!--Update section for updates-->
	<div class="flex new-header">
		<h3>What's New</h3>
		<a href="<?php echo $WEB_ROOT; ?>rss/" target="_blank" class="feed-subscribe">RSS Feed</a>
	</div>

	<div class="feed-container expanded">
		<div class="feed"></div>

		<div class="news-item template hide">
			<h4></h4>
			<div class="news-content"></div>
			<div class="news-info">
				<div class="news-date"></div>
				<a href="#"><div class="link-text">pvpoke.com</div><div>&rarr;</div></a>
			</div>
		</div>

		<button class="feed-expand"></button>
	</div>

	<?php if($_SETTINGS->ads == 1) : ?>
		<span data-ccpa-link="1"></span>
	<?php endif; ?>

</div>

<?php
// Localhost developer panel
if (strpos($WEB_ROOT, 'src') !== false) : ?>

	<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/interface/HomeInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php else: ?>

	<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/interface/HomeInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php endif; ?>

<?php require_once 'footer.php'; ?>
