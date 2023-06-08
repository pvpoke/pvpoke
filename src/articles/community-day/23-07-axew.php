<?php


$META_TITLE = 'Axew Community Day Guide for PvP';

$META_DESCRIPTION = 'Axew is hacking its way onto the Community Day roster. Can it cut a place in PvP? Read up on the meta impact for Haxorus and Breaking Swipe!';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/23-07-axew/og.jpg';

require_once '../../header.php';

?>

<div class="section article white axew">
	<h1>Axew Community Day Guide for PvP</h1>
	<div class="date">Last updated June 8th, 2023</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/23-07-axew/banner.jpg" />
	<p>Axew is getting a long-awaited and long-expected Community Day, evolving to obtain the exclusive move Breaking Swipe. Will it be enough for Haxorus to break into the meta? Below are the leagues and IV spreads to look out for, and answers to frequently asked questions. You can find more info on Axew Community Day at the <a href="https://pokemongolive.com/post/communityday-june-2023-axew" target="_blank">Pokemon GO blog</a>. </p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, June 10th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">3x Catch XP</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Breaking Swipe</div>
			<div class="detail">50 power, 35 energy, guaranteed to lower the opponent's Attack</div>
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
			<div class="mega-item" mega="charizard-x">
				<div class="mega-image"></div>
				<div class="mega-label">Charizard X</div>
			</div>
			<div class="mega-item" mega="ampharos">
				<div class="mega-image"></div>
				<div class="mega-label">Ampharos</div>
			</div>
			<div class="mega-item" mega="sceptile">
				<div class="mega-image"></div>
				<div class="mega-label">Sceptile</div>
			</div>
			<div class="mega-item" mega="altaria">
				<div class="mega-image"></div>
				<div class="mega-label">Altaria</div>
			</div>
			<div class="mega-item" mega="latios">
				<div class="mega-image"></div>
				<div class="mega-label">Latias/Latios</div>
			</div>
			<div class="mega-item" mega="salamence">
				<div class="mega-image"></div>
				<div class="mega-label">Salamence</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Haxorus with Breaking Swipe?</strong></h3>
		<div class="faq-answer">
			<p><b>Breaking Swipe improves Haxorus significantly in every league and gives it strong potential in Master Premier cup and themed cups.</b> Breaking Swipe is identical to Dragon Claw but comes with a guaranteed Attack drop against the opponent, which makes Breaking Swipe a strict upgrade for Haxorus. Similar to Lunge, Breaking Swipe gives the glass cannon Haxorus a much needed defensive cushion. Haxorus will perform best with shields so it can stack debuffs and protect itself from early attacks.</p>
			<p>In general, Haxorus is a member of the non-STAB Counter users like Deoxys, Vigoroth, and Obstagoon, and is far more Attack-weighted. Its Dragon typing gives it useful resistances (including Water and Grass), but also makes it especially vulnerable to Fairies. Haxorus has access to multiple viable Charged Moves including Night Slash, Surf, or Earthquake to hit targets like Mewtwo, Metagross, Excadrill, or Galarian Stunfisk. It's more likely to use Night Slash or Surf since it lacks the stats to utilize Earthquake effectively.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/23-07-axew/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "23-07-axew"; // This is used to fetch JSON data for this page's checklist
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
