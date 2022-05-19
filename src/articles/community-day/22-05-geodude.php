<?php


$META_TITLE = 'Alolan Geodude Community Day Guide for PvP';

$META_DESCRIPTION = 'The Alolan Geodude family is ready to rock! Which leagues and Pokemon should you be on the lookout for and how impactful will Rollout be on the meta?';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/22-04-stufful/og.jpg';

require_once '../../header.php';

?>

<div class="section article white geodude">
	<h1>Alolan Geodude Community Day Guide for PvP</h1>
	<div class="date">Last updated May 19, 2022</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/22-05-geodude/banner.jpg" />
	<p>Alolan Geodude is rolling out this Community Day with the exclusive move Rollout! You can get more info about Geodude Community Day at the official <a href="https://pokemongolive.com/en/post/communityday-may-2022-alolan-geodude/" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, May 21st<br></div>
			<div class="detail">11am - 2pm local time</div>
		</div>
		<div class="feature">
			<h4>Exclusive Fast Move</h4>
			<div class="value">Rollout</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">x3 Catch Stardust</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">x2 Catch Candy</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">50% trade Stardust cost</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">1 extra special trade</div>
			<div class="detail">Can be made up to 2 hours after the event</div>
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
			<div class="mega-item" mega="aerodactyl">
				<div class="mega-image"></div>
				<div class="mega-label">Aerodactyl</div>
			</div>
			<div class="mega-item" mega="ampharos">
				<div class="mega-image"></div>
				<div class="mega-label">Ampharos</div>
			</div>
			<div class="mega-item" mega="manectric">
				<div class="mega-image"></div>
				<div class="mega-label">Manectric</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Alolan Golem with Rollout?</strong></h3>
		<div class="faq-answer">
			<p><b>Rollout is most likely a sidegrade for Alolan Golem. It will remain a themed cup Pokemon and won't have much play in open league metas.</b> Alolan Golem and its pre-evolutions are Rock/Electric type Pokemon with average stat product and decent movepools. Their typing is a major hindrance in open metas, where they are vulnerable to prominent Grass, Ground, and Fighting types. The Alolan Golem family shines best in themed cups where Ground types are uncommon and where their solid moves can hit for neutral damage. In these scenarios, Alolan Graveler is usually preferred over Alolan Golem due to Graveler's slight bulk advantage.</p>
			<p>Rollout is a high energy generating Rock-type Fast Move. Alolan Golem already has Volt Switch, which generates high energy as well as decent damage output. Which move is preferred may depend on the themed cup and its key meta targets. Look to keep multiple Alolan Golem so you have the ability to use both Rollout and Volt Switch in the future.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/22-05-geodude/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "22-05-geodude"; // This is used to fetch JSON data for this page's checklist
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
