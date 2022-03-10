<?php


$META_TITLE = 'Sandshrew Community Day Guide for PvP';

$META_DESCRIPTION = 'Learn about Sandshrew\'s upcoming Community Day and how both of its Alolan and Kanto families will be relevant for PvP!';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/community-day/22-03-sandshrew/og.jpg';

require_once '../../header.php';

?>

<div class="section article white sandshrew">
	<h1>Sandshrew Community Day Guide for PvP</h1>
	<div class="date">Last updated March 10th, 2022</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/community-day/22-03-sandshrew/banner.jpg" />
	<p>Both forms of Sandshrew are rolling out this Community Day with some implications for future themed cups in PvP. You can find more info about Sandshrew Community Day at the official <a href="https://pokemongolive.com/en/post/communityday-mar22-sandshrew/" target="_blank">Pokemon GO blog</a>. Below are the leagues and IV spreads to look out for, and answers to frequently asked questions.</p>

	<a name="overview"></a>
	<h3 class="article-header"><strong>Overview</strong></h3>

	<div class="cd-features">
		<div class="feature">
			<h4>Date &amp; Time</h4>
			<div class="value">Sunday, March 13th<br></div>
			<div class="detail">11am - 5pm local time</div>
		</div>
		<div class="feature">
			<h4>Exclusive Fast Move</h4>
			<div class="value">Shadow Claw</div>
			<div class="detail">Alolan Sandslash</div>
		</div>
		<div class="feature">
			<h4>Exclusive Charged Move</h4>
			<div class="value">Night Slash</div>
			<div class="detail">Kanto Sandslash</div>
		</div>
		<div class="feature">
			<h4>Event Bonus</h4>
			<div class="value">1/4 Hatch Distance</div>
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
			<div class="mega-item" mega="steelix">
				<div class="mega-image"></div>
				<div class="mega-label">Steelix</div>
			</div>
			<div class="mega-item" mega="abomasnow">
				<div class="mega-image"></div>
				<div class="mega-label">Abomasnow</div>
			</div>
		</div>
	</div>

	<a name="faq"></a>
	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Alolan Sandslash with Shadow Claw?</strong></h3>
		<div class="faq-answer">
			<p><b>Shadow Claw is generally an upgrade for Alolan Sandslash and will perform best in themed cups.</b> Alolan Sandslash is playable in open Great League and Ultra League, but its double weaknesses to Fighting and Fire may make it too risky to use.</p>
			<p>Shadow Claw and STAB Powder Snow share identical move parameters for Alolan Sandslash (2 turns, 3 damage per turn, 4 energy per turn). However, Shadow Claw is less widely resisted than Powder Snow, in particular against other Ice and Steel types. For this reason, Shadow Claw will likely be the preferred Fast Move for Alolan Sandslash going forward except in metas which have a strong Normal or Dark-type presence.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>How good is Kanto Sandslash with Night Slash? Is Shadow better?</strong></h3>
		<div class="faq-answer">
			<p><b>Night Slash gives Kanto Sandslash a much needed low energy move and makes it viable for future themed cups.</b> Night Slash provides unique coverage among Ground types and gives Sandslash the ability to bait for its powerful Earthquake. Sandslash is outclassed by competing Ground types such as Galarian Stunfisk or Swampert, so it's unlikely to find much play in open leagues.</p>
			<p>Like most Shadows, Shadow Sandslash is not strictly better than regular Sandslash and has its pros and cons. Shadow Sandslash has more closing power, but may depend more on baiting. When Night Slash coverage is the main reason to use Sandslash, such as against Ghost types, Shadow Sandslash appears to perform slightly better,  securing KO's more reliably.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>I'm not level 40 and can't obtain Candy XL yet. Should I still evolve Sandslash for Ultra League?</strong></h3>
		<div class="faq-answer">
			<p><b>Yes, Sandslash is worth evolving even if you can't power one above level 40.</b> Evolve to obtain the exclusive moves, and then you can potentially use it in the future.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>My Shadow Sandshrew still has Frustration. Can it learn Night Slash if I evolve it during Community Day?</strong></h3>
		<div class="faq-answer">
			<p><b>No, a Shadow Pokemon with Frustration cannot learn an exclusive Charged Move when it evolves, </b> even if it has a 2nd Charged Move unlocked. You must have removed Frustration during a previous Team Rocket event.</p>
		</div>
	</div>

	<div class="faq-item">
		<h3 class="article-header"><strong>What will happen if I evolve a Purified Sandshrew during Community Day? Is there a way to obtain a Sandslash that knows both Night Slash and Return?</strong></h3>
		<div class="faq-answer">
			<p><b>Exclusive Charged Moves will replace Return if you evolve a Purified Pokemon during its Community Day event.</b> To obtain both Night Slash and Return, you must evolve your Pokemon after the event's evolution window (7pm local time), unlock a 2nd Charged Move, and use an Elite TM to obtain Night Slash.</p>
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
			<input type="text" value="https://pvpoke.com/articles/community-day/22-03-sandshrew/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!-- Scripts -->
<script>
	var articleId = "22-03-sandshrew"; // This is used to fetch JSON data for this page's checklist
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
