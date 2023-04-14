<?php


$META_TITLE = 'Togetic Community Day Guide for PvP';

$META_DESCRIPTION = 'Togetic is a charming addition to the Community Day roster, and its evolution, Togekiss, has play in all three leagues. Find out what to look out for in PvP.';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/23-04-togetic/og.jpg';

require_once '../../header.php';

?>

<div class="section article white togetic">
	<h1>Togetic Community Day Guide for PvP</h1>
	<div class="date">Last updated April 14, 2023</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/23-04-togetic/banner.jpg" />
	<p>Togetic is making a wild appearance in the upcoming April Community Day! Its evolution, Togekiss, is a longtime staple in Master League PvP, and also has a role in themed cups. How will Aura Sphere round out its viability? Below are the leagues and IV spreads to look out for, and answers to frequently asked questions. You can find more info on Togetic Community Day at the <a href="https://pokemongolive.com/en/post/communityday-april-2023-togetic" target="_blank">Pokemon GO blog</a>. </p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, April 15th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">1/4th Hatch Distance</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Aura Sphere</div>
			<div class="detail">100 power, 55 energy</div>
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
				<div class="mega-label">Charizard Y</div>
			</div>
			<div class="mega-item" mega="pidgeot">
				<div class="mega-image"></div>
				<div class="mega-label">Pidgeot</div>
			</div>
			<div class="mega-item" mega="aerodactyl">
				<div class="mega-image"></div>
				<div class="mega-label">Aerodactyl</div>
			</div>
			<div class="mega-item" mega="altaria">
				<div class="mega-image"></div>
				<div class="mega-label">Altaria</div>
			</div>
			<div class="mega-item" mega="gardevoir">
				<div class="mega-image"></div>
				<div class="mega-label">Gardevoir</div>
			</div>
			<div class="mega-item" mega="salamence">
				<div class="mega-image"></div>
				<div class="mega-label">Salamence</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Togekiss with Aura Sphere?</strong></h3>
		<div class="faq-answer">
			<p><b>Aura Sphere is a minor upgrade over Flamethrower in most situations.</b> Both are 55 energy moves that provide coverage against Steel types, but Aura Sphere has 100 base power compared to Flamethrower's 90. Fighting offensive coverage is also generally better than Fire, hitting Steel, Rock, Ice, Dark, and Normal for super effective damage. There are some matchups like Metagross where Togekiss will still prefer Flamethrower. Overall, Aura Sphere will be a small improvement in Togekiss's coverage and neutral play.</p>
			<p>In the big picture, Togekiss has been a longtime staple of Master League although its play has declined since the Charm nerf and the rise of Charged Move-based Fairies like Zacian and Florges. It still has a strong place in Master League, open Ultra League, and Great League themed cups such as Sinnoh Cup.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>What if Togekiss gets Fairy Wind in the future?</strong></h3>
		<div class="faq-answer">
			<p>If Fairy Wind is added to Togekiss's movepool, it will open the door for an energy oriented playstyle. Togekiss' Charged Move selection is poor compared to top Fairies, so Fairy Wind wouldn't be an immediate upgrade without other attack updates. The addition of Aura Sphere helps a little and allows Togekiss to pack interesting coverage combos like Flying/Fighting. Togekiss with Fairy Wind would likely want high rank IV's, so this Community Day is a good opportunity to hunt traditional PvP IV's that aren't obtainable from eggs or raids.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/23-04-togetic/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "23-04-togetic"; // This is used to fetch JSON data for this page's checklist
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
