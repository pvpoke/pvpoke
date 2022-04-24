<?php


$META_TITLE = 'Stufful Community Day Guide for PvP';

$META_DESCRIPTION = 'Learn about the brand new Pokemon Stufful, and how its evolution may perform in PvP!';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/22-04-stufful/og.jpg';

require_once '../../header.php';

?>

<div class="section article white bewear">
	<h1>Stufful Community Day Guide for PvP</h1>
	<div class="date">Last updated April 22, 2022</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/22-04-stufful/banner.jpg" />
	<p>Stufful is debuting this weekend for April Community Day! What impact will Bewear have for PvP, is Drain Punch any good, and are there any special IV spreads to hunt? Let's find out! You can get more info about Stufful Community Day at the official <a href="https://pokemongolive.com/en/post/communityday-april22-stufful/" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, April 22nd<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Drain Punch</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">x3 Catch XP</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">x2 Catch Candy</div>
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
			<div class="mega-item" mega="lopunny">
				<div class="mega-image"></div>
				<div class="mega-label">Lopunny</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Bewear for PvP?</strong></h3>
		<div class="faq-answer">
			<p><b>Bewear may struggle in open play but has potential in themed cups or anti-meta roles.</b> It's a unique Normal/Fighting Pokemon with slightly Attack weighted stats and a solid movepool including Shadow Claw, Superpower, and Payback. It's playable in all three leagues.</p>
			<p>As a Normal type, Bewear can hit other Normal types for super effective damage, and as a Fighting type, Bewear can counter traditional Ghost-type walls. It also has the ability to hit back against Psychic types, so it's mainly vulnerable to Fairy and Flying-type Pokemon. Bewear has notable play against Trevenant and Walrein in Great and Ultra League (it can struggle against Walrein while shields are up), and against Giratina in Master League.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Drain Punch for Bewear?</strong></h3>
		<div class="faq-answer">
			<p><b>Drain Punch is unlikely to be a preferred move for Bewear.</b> Drain Punch has 20 base power and costs 40 energy, providing a 1 stage boost to Bewear's Defense. Drain Punch's role is largely as a bait move, comparable to Power-Up Punch (20 power, 35 energy) and Bubble Beam (25 power, 40 energy).</p>
			<p>Unfortunately for Drain Punch, Bewear has access to more convincing moves like Payback, Stomp, and Superpower. Superpower in particular (85 power, 40 energy) costs the same as Drain Punch but provides meaningful Fighting-type damage with over 4x the damage output. In addition, Bewear lacks the bulk to take full advantage of Drain Punch's Defense boosts, and lacks Same Type Attack Bonus (STAB) on Shadow Claw, so its Charged Moves need to do some heavy lifting. All in all, Drain Punch is  inefficient compared to Bewear's other Charged Moves.</p>
			<p><b>Look to evolve or keep multiple Bewear so you can have Bewear with and without Drain Punch in your collection.</b></p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/22-04-stufful/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "22-04-stufful"; // This is used to fetch JSON data for this page's checklist
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
