<?php


$META_TITLE = 'Goomy Community Day Guide for PvP';

$META_DESCRIPTION = 'Goodra is getting Thunder Punch this weekend, but is it any good? Check out tips and IV\'s for this exciting Community Day for PvP!';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/24-06-goomy/og.jpg';

require_once '../../header.php';

?>

<div class="section article white goomy">
	<h1>Goomy Community Day Guide for PvP</h1>
	<div class="date">Last updated June 7th, 2024</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/24-06-goomy/banner.jpg" />
	<p>Goodra has been on the outside looking in on the Great League meta. Will Thunder Punch help it punch a ticket to competitive success? Let's see how it compares to Goodra's other moves and which IV's to watch out for! You can also see more info on Goomy Community Day at the <a href="https://pokemongolive.com/post/communityday-june-2024-goomy?hl=en" target="_blank">Pokemon GO blog</a>. </p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Sunday, June 9th<br></div>
			<div class="detail">2pm - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">3x Catch Stardust</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Thunder Punch</div>
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
			<div class="mega-item" mega="salamence">
				<div class="mega-image"></div>
				<div class="mega-label">Salamence</div>
			</div>
			<div class="mega-item" mega="latios">
				<div class="mega-image"></div>
				<div class="mega-label">Latias/Latios</div>
			</div>
			<div class="mega-item" mega="rayquaza">
				<div class="mega-image"></div>
				<div class="mega-label">Rayquaza</div>
			</div>
			<div class="mega-item" mega="garchomp">
				<div class="mega-image"></div>
				<div class="mega-label">Garchomp</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Goodra with Thunder Punch in PvP?</strong></h3>
		<div class="faq-answer">
			<p><b>Thunder Punch is on par with Goodra's other Charged Move options and is most valuable in Great League.</b> Goodra is among the bulkier Dragons and packs interesting coverage between Aqua Tail and Power Whip. With Thunder Punch, Goodra gains unique Electric coverage for key targets like Skarmory, Azumarill, and other strong Water types.</p>
			<p>While Thunder Punch has its benefits, it isn't a strict upgrade for Goodra and doesn't solve its main setbacks. Goodra lacks closing power without Draco Meteor and its coverage moves are all resisted by rival Dragon types. Because of this, Goodra will most likely fulfill an anti-meta, corebreaking role in the open leagues and take a backseat to the likes of Altaria, Dragonair, and Guzzlord in themed cups where Dragon types are strong.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>Which moveset should I use for Goodra?</strong></h3>
		<div class="faq-answer">
			<p><b>Goodra has multiple viable movesets, preferably Aqua Tail plus another coverage move. Your choice may depend on your team and personal preferences.</b> Below are Goodra's main moveset combinations, their advantages, and disadvantages.</p>
			<ul>
				<li><u>Aqua Tail/Thunder Punch -</u> Goodra's fastest moveset with the broadest coverage. Water and Electric complement each other well, resisted only by Grass and Dragon which aren't super prevalent. This Goodra can substitute for your team's Electric type, gaining advantage against them in return. However, it lacks closing power and falls short in neutral matchups.</li>
				<li><u>Aqua Tail/Power Whip -</u> Power Whip is super effective against Water types just like Thunder Punch, but crucially targets Lanturn and Water/Ground types. This moveset best compliments teammates who need to ward off these two, such as Skarmory, Bastiodon, or Skeledirge. Power Whip is also notably stronger than Aqua Tail or Thunder Punch, improving Goodra's neutral matchups. However, Aqua Tail and Power Whip share some redundant coverage and will struggle more against Skarmory and Altaria.</li>
				<li><u>Aqua Tail/Draco Meteor -</u> Draco Meteor packs major closing power which other movesets lack, and a surprise factor that will only improve after Community Day. This moveset gives Goodra the most neutral play. It's also Goodra's slowest moveset, sacrifices its corebreaking potential, and loses effectiveness in tournament play where movesets are known.</li>
			</ul>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/24-06-goomy/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "24-06-goomy"; // This is used to fetch JSON data for this page's checklist
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
