<?php


$META_TITLE = 'Litwick Community Day Guide for PvP';

$META_DESCRIPTION = 'Will Litwick be able to haunt its way into PvP this Community Day? Let\'s shed some light on how Chandelure performs in PvP!';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/22-10-litwick/og.jpg';

require_once '../../header.php';

?>

<div class="section article white litwick">
	<h1>Litwick Community Day Guide for PvP</h1>
	<div class="date">Last updated October 12, 2022</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/22-10-litwick/banner.jpg" />
	<p>Litwick's long-awaited Community Day is coming! The Litwick family doesn't have much relevance in PvP, but we'll walk through the details below in case you want to go the extra mile. You can find more info on Litwick Community Day at the <a href="https://pokemongolive.com/en/post/community-day-october-2022-litwick/" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, October 15th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">x3 Catch XP</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Poltergeist</div>
			<div class="detail">140 power</div>
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
				<div class="mega-label">Charizard (Either)</div>
			</div>
			<div class="mega-item" mega="gengar">
				<div class="mega-image"></div>
				<div class="mega-label">Gengar</div>
			</div>
			<div class="mega-item" mega="houndoom">
				<div class="mega-image"></div>
				<div class="mega-label">Houndoom</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Chandelure with Poltergeist?</strong></h3>
		<div class="faq-answer">
			<p><b>Chandelure isn't relevant for competitive PvP and Poltergeist is unlikely to provide a noteworthy improvement.</b> Chandelure is a Ghost/Fire type with an extremely glassy stat distribution. With its main moves of Incinerate and Flame Charge, Chandelure lacks the speed of Haunter or Gengar, and the staying power of Alolan Marowak or Talonflame.</p>
			<p>Poltergeist appears to be a high energy Ghost-type Charged Move, which doesn't help Chandelure with the drawbacks above. At best, Poltergeist may be a minor improvement over Shadow Ball in some scenarios.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/22-10-litwick/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "22-10-litwick"; // This is used to fetch JSON data for this page's checklist
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
