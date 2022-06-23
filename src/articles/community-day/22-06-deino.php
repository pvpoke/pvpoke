<?php


$META_TITLE = 'Deino Community Day Guide for PvP';

$META_DESCRIPTION = 'Are three heads better than one? Find out how Brutal Swing Hydreigon will impact the meta and which PvP Pokemon and IV\'s to look for this Community Day!';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/22-06-deino/og.jpg';

require_once '../../header.php';

?>

<div class="section article white deino">
	<h1>Deino Community Day Guide for PvP</h1>
	<div class="date">Last updated June 23, 2022</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/22-06-deino/banner.jpg" />
	<p>PvP isn't always as easy as "one, two, three" *, but this guide will help you get your head in the game for Deino Community Day! You can get more info about Deino Community Day at the official <a href="https://pokemongolive.com/en/post/communityday-june-2022-deino/" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>
	<p style="font-size: 12px;">* Sometimes you may even need to count to five.</p>
	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Saturday, June 25th<br></div>
			<div class="detail">11am - 2pm local time</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Brutal Swing</div>
			<div class="detail">65 power, 40 energy</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">1/4 Hatch Distance</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">Bonus Raid Battles</div>
			<div class="detail">2pm - 7pm local time</div>
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
			<div class="mega-item" mega="altaria">
				<div class="mega-image"></div>
				<div class="mega-label">Altaria</div>
			</div>
			<div class="mega-item" mega="ampharos">
				<div class="mega-image"></div>
				<div class="mega-label">Ampharos</div>
			</div>
			<div class="mega-item" mega="charizard-x">
				<div class="mega-image"></div>
				<div class="mega-label">Charizard-X</div>
			</div>
			<div class="mega-item" mega="gyarados">
				<div class="mega-image"></div>
				<div class="mega-label">Gyarados</div>
			</div>
			<div class="mega-item" mega="houndoom">
				<div class="mega-image"></div>
				<div class="mega-label">Houndoom</div>
			</div>
			<div class="mega-item" mega="latios">
				<div class="mega-image"></div>
				<div class="mega-label">Latias</div>
			</div>
			<div class="mega-item" mega="latios">
				<div class="mega-image"></div>
				<div class="mega-label">Latios</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Hydreigon with Brutal Swing?</strong></h3>
		<div class="faq-answer">
			<p><b>Brutal Swing is a strict upgrade over Dark Pulse and makes Hydreigon viable for Master League formats.</b> It is a low energy move with respectable damage, identical to Surf and Drill Peck. In open Master League, Hydreigon will be viable but may struggle against top picks like Dialga and Zacian. Its best potential is in Premier Classic, where it is comparable in power to Garchomp and Dragonite.</p>
			<p>Brutal Swing makes Hydreigon playable in themed cups, but it's generally outclassed by Zweilous in Great League.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/22-06-deino/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "22-06-deino"; // This is used to fetch JSON data for this page's checklist
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
