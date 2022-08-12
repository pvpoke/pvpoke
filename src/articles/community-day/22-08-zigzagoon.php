<?php


$META_TITLE = 'Galarian Zigzagoon Community Day Guide for PvP';

$META_DESCRIPTION = 'Obstagoon is already a top tier Pokemon for PvP! Will Obstruct elevate it even further?';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/22-08-zigzagoon/og.jpg';

require_once '../../header.php';

?>

<div class="section article white zigzagoon">
	<h1>Galarian Zigzagoon Community Day Guide for PvP</h1>
	<div class="date">Last updated August 12, 2022</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/22-08-zigzagoon/banner.jpg" />
	<p>Galarian Zigzagoon will be making a special appearance in the wild this Community Day, bringing the chance to obtain optimal PvP IV's and Obstagoon's signature move, Obstruct. You can find more info on Galarian Zigzagoon Community Day at the <a href="https://pokemongolive.com/en/post/communityday-august-2022-galarian-zigzagoon/" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>
	<p>Special thanks to <a href="https://twitter.com/SwgTips" target="_blank">@SwgTips</a> for the IV research! Check out his <a href="https://gamepress.gg/pokemongo/obstagoon-pvp-iv-deep-dive" target="_blank">deep dive article</a> on Obstagoon IV's for more on Obstagoon breakpoints and bulkpoints.</p>
	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, August 13th<br></div>
			<div class="detail">11am - 2pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">x3 Catch Stardust</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">50% trade Stardust cost</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Obstruct</div>
			<div class="detail">15 power, 40 energy,  100% chance to lower opponent's Defense and raise user's Defense by 1 stage</div>
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
			<div class="mega-item" mega="absol">
				<div class="mega-image"></div>
				<div class="mega-label">Absol</div>
			</div>
			<div class="mega-item" mega="gyarados">
				<div class="mega-image"></div>
				<div class="mega-label">Gyarados</div>
			</div>
			<div class="mega-item" mega="houndoom">
				<div class="mega-image"></div>
				<div class="mega-label">Houndoom</div>
			</div>
			<div class="mega-item" mega="kangaskhan">
				<div class="mega-image"></div>
				<div class="mega-label">Kangaskhan</div>
			</div>
			<div class="mega-item" mega="lopunny">
				<div class="mega-image"></div>
				<div class="mega-label">Lopunny</div>
			</div>
			<div class="mega-item" mega="pidgeot">
				<div class="mega-image"></div>
				<div class="mega-label">Pidgeot</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Obstagoon with Obstruct?</strong></h3>
		<div class="faq-answer">
			<p><b>Obstagoon is already a top contender in Great and Ultra League. At worse, Obstruct will be a sidegrade to its existing move options.</b> At best, Obstruct gives Obstagoon more dynamic play than before and allows it power through neutral matchups similar to Nidoqueen. Obstruct has two guaranteed stat effects at 40 energy (compared to Acid Spray at 45 energy and Feather Dance at 50 energy). Obstagoon can leverage this best in the Ultra League where it has more bulk to take advantage of the stat boosts.</p>
			<p>Obstagoon is likely to continue using Night Slash as its primary Charged Move, with Obstruct as a secondary move option. Obstruct Obstagoon should shield early, throw Obstruct once or twice early in a matchup, and rely on Counter and Night Slash damage the rest of the way.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/22-08-zigzagoon/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "22-08-zigzagoon"; // This is used to fetch JSON data for this page's checklist
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
