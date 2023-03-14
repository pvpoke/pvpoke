<?php


$META_TITLE = 'Slowpoke Community Day Guide for PvP';

$META_DESCRIPTION = 'Not so fast! Slowpoke Community Day is around the corner. Find out how Surf will impact the whole Slow family in PvP and IV\'s to look for.';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/23-03-slowpoke/og.jpg';

require_once '../../header.php';

?>

<div class="section article white chespin">
	<h1>Slowpoke Community Day Guide for PvP</h1>
	<div class="date">Last updated March 15, 2023</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/23-01-slowpoke/banner.jpg" />
	<p>Slowpoke Community Day will feature both Kanto and Galarian forms of the Dopey Pokemon, and each of their evolutions will be able to learn the Charged Move, Surf. Which ones should you look out for? If you're into PvP, it turns out you may want to run Slowpoke Community Day kind of fast! You can find more info on Slowpoke Community Day at the <a href="https://pokemongolive.com/en/post/communityday-mar23-slowpoke/" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, March 18th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">3x Catch XP</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Surf</div>
			<div class="detail">65 power, 40 energy</div>
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
			<div class="mega-item" mega="alakazam">
				<div class="mega-image"></div>
				<div class="mega-label">Alakazam</div>
			</div>
			<div class="mega-item" mega="slowbro">
				<div class="mega-image"></div>
				<div class="mega-label">Slowbro</div>
			</div>
			<div class="mega-item" mega="medicham">
				<div class="mega-image"></div>
				<div class="mega-label">Medicham</div>
			</div>
			<div class="mega-item" mega="gardevoir">
				<div class="mega-image"></div>
				<div class="mega-label">Gardevoir</div>
			</div>
			<div class="mega-item" mega="gallade">
				<div class="mega-image"></div>
				<div class="mega-label">Gallade</div>
			</div>
			<div class="mega-item" mega="latios">
				<div class="mega-image"></div>
				<div class="mega-label">Latias/Latios</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>Which Slowpoke evolutions are good in PvP with the addition of Surf?</strong></h3>
		<div class="faq-answer">
			<p><b>Surf is a strong improvement for all four evolutions in the Slowpoke family and gives them top meta potential for future Great League and Ultra League themed cups.</b> As a whole, Slowbro, Slowking, and their Galarian forms have solid stats and typing but up to now have lacked convincing moves to compete. In particular, their movesets feature all high energy Charged Moves. Surf provides much needed speed to the Slowpoke family and expands coverage for the Galarian forms. All four should prefer Surf in PvP going forward.</p>
			<p><b>Galarian Slowbro and Galarian Slowking are recommended as a first priority</b> since Galarian Slowpoke is more difficult to obtain outside of special events. Both are poised to succeed in Great League and Ultra League themed cups. Galarian Slowbro is equipped to handle rival Poison types while Galarian Slowking has play against rival Psychic types with its Ghost coverage.</p>
			<p><b>Kanto Slowbro is another strong priority and should see similar improvement in Great League and Ultra League themed cups.</b> Slowbro may also find an anti-meta niche in the current Open Great League where it resists all of Medicham's Charged Moves. Slowbro has a shadow variant worth considering as well—if you have any Shadow Slowpoke with Frustration removed, look to obtain Shadow Slowbro with Surf during the event. Lastly, Mega Slowbro will notably improve in Mega Master League with Surf and is worth pursuing if you're a dedicated Master League Factions or draft player.</p>
			<p><b>Kanto Slowking is the lowest priority and generally worse than Slowbro.</b> Its movepool features more expensive Charged Moves (Blizzard and Fire Blast instead of Ice Beam). There may be niche situations where these are useful, but Slowbro is likely to be preferred over Slowking barring future move updates. Slowking will still be best with Surf than without it.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/23-03-slowpoke/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "23-03-slowpoke"; // This is used to fetch JSON data for this page's checklist
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
