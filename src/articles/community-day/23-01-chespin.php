<?php


$META_TITLE = 'Chespin Community Day Guide for PvP';

$META_DESCRIPTION = 'Chesnaught is finally getting Frenzy Plant! Can it find a way to crack into the PvP meta? Check out its meta relevance and PvP IV\'s to look for.';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/23-01-chespin/og.jpg';

require_once '../../header.php';

?>

<div class="section article white chespin">
	<h1>Chespin Community Day Guide for PvP</h1>
	<div class="date">Last updated December 21, 2022</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/23-01-chespin/banner.jpg" />
	<p>Chesnaught's day in the sun has finally arrived and it will be able to learn its exclusive move, Frenzy Plant! It will have play in every league and is worth obtaining for PvP. Just how good will it be? Let's explore below! You can find more info on Chespin Community Day at the <a href="https://pokemongolive.com/post/community-january-2023-chespin?hl=en" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, January 7th <br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">1/4th Egg Hatch Distance</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Frenzy Plant</div>
			<div class="detail">100 power, 45 energy</div>
		</div>
	</div>

	<a name="checklist"></a>
	<h3 class="article-header"><strong>League &amp; IV Recommendations</strong></h3>

	<?php require_once 'templates/checklist-template.php'; ?>

	<div class="mega-section">
		<div class="mega-title">
			<div class="mega-icon"></div>
			<h4>Mega Evolve one of these Pokemon during Community Day to earn bonus catch candy!</h4>
		</div>
		<div class="mega-list">
			<div class="mega-item" mega="venusaur">
				<div class="mega-image"></div>
				<div class="mega-label">Venusaur</div>
			</div>
			<div class="mega-item" mega="sceptile">
				<div class="mega-image"></div>
				<div class="mega-label">Sceptile</div>
			</div>
			<div class="mega-item" mega="abomasnow">
				<div class="mega-image"></div>
				<div class="mega-label">Abomasnow</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Chesnaught with Frenzy Plant?</strong></h3>
		<div class="faq-answer">
			<p><b>Chesnaught is strictly better with Frenzy Plant and has play in every league.</b> It's a solid Grass option on par with Meganium, but a step below top Grass types like Trevenant or Venusaur. Its Fighting sub-typing makes it one of the few Pokemon to resist both Rock and Ground-type moves from Galarian Stunfisk or Excadrill.</p>
			<p>Chesnaught's opportunity in the meta has declined since its debut. It has little counterplay against the current top Grass options or against its Flying-type counters, which were recently buffed. Chesnaught now also faces stiff competition against Virizion, which has better stats and moves. Nonetheless, it still has play in open leagues and should be strong in future themed cups.</p>
		</div>
	</div>

	<a name="further-resources"></a>
	<h3 class="article-header"><strong>Additional Resources</strong></h3>

	<div class="flex further-resource-links">
		<a href="https://www.stadiumgaming.gg/rank-checker" class="gostadium" target="_blank">Stadium Gaming<br>Rank Checker</a>
		<a href="https://pvpivs.com/" target="_blank">pvpivs.com</a>
	</div>

	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/community-day/23-01-chespin/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "23-01-chespin"; // This is used to fetch JSON data for this page's checklist
</script>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ArticleChecklist.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../../footer.php'; ?>
