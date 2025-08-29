<?php


$META_TITLE = 'Rookidee Community Day Guide for PvP';

$META_DESCRIPTION = 'Corviknight makes a bid to enter the top meta. Will it finally beat the fraud allegations? Read up on everything you need to know for Rookidee Community Day!';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/25-08-rookidee/og.jpg';

require_once '../../header.php';

?>

<div class="section article white rookidee">
	<h1>Rookidee Community Day Guide for PvP</h1>
	<div class="date">Last updated August 27th, 2025</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/25-08-rookidee/banner.jpg" />
	<p>Corviknight has hovered on the edge of the PvP meta, but may finally have its chance to swoop in. It's getting a crucial speed buff with its exclusive attack, Air Cutter. Will it be enough to push Corviknight into core relevance? Let's look ahead to the move updates next season to get a bird's-eye view on Corviknight's prospects. You can find more info on Rookidee Community Day at the <a href="https://pokemongo.com/news/communityday-august-2025-rookidee" target="_blank">Pokemon GO blog</a>. </p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, August 30th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">1/4 Egg Hatch Distance</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Attack</h4>
			<div class="value">Air Cutter</div>
			<div class="detail">45 power, 30% chance to increase Attack by one stage</div>
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
			<div class="mega-item" mega="charizard-y">
				<div class="mega-image"></div>
				<div class="mega-label">Charizard</div>
			</div>
			<div class="mega-item" mega="pidgeot">
				<div class="mega-image"></div>
				<div class="mega-label">Pidgeot</div>
			</div>
			<div class="mega-item" mega="pinsir">
				<div class="mega-image"></div>
				<div class="mega-label">Pinsir</div>
			</div>
			<div class="mega-item" mega="aerodactyl">
				<div class="mega-image"></div>
				<div class="mega-label">Aerodactyl</div>
			</div>
			<div class="mega-item" mega="salamence">
				<div class="mega-image"></div>
				<div class="mega-label">Salamence</div>
			</div>
			<div class="mega-item" mega="rayquaza">
				<div class="mega-image"></div>
				<div class="mega-label">Rayquaza</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Corviknight with Air Cutter?</strong></h3>
		<div class="faq-answer">
			<p><b>Corviknight should assume a core meta role next season with Air Cutter.</b> It currently suffers from slow pacing and soft matchups, and Air Cutter will notably improve its performance. One drawback is Air Cutter's tepid damage output, but this is offset by its potential Attack boost.</p>
			<p>Air Cutter opens up Corviknight's moveset to explore other attack options, such as Payback. At the same time, Sky Attack is being improved, so some may prefer Corviknight with more reliable damage. Corviknight's prospects further improve as Dragons and Fairies become stronger next season. Corviknight should find the spotlight—not quite as strong as Skarmory at its peak, but nonetheless a crucial piece in the upcoming metagame.</p>
		</div>
	</div>

	<a name="further-resources"></a>
	<h3 class="article-header"><strong>Additional Resources</strong></h3>

	<div class="flex further-resource-links">
		<a href="https://pvpivs.com/" target="_blank">pvpivs.com</a>
	</div>

	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/community-day/25-08-rookidee/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "25-08-rookidee"; // This is used to fetch JSON data for this page's checklist
</script>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ArticleChecklist.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/DamageCalculator.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../../footer.php'; ?>
