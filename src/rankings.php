<?php

$cp = '1500';
$cup = 'all';

if(isset($_GET['cp'])){
	$cp = htmlspecialchars($_GET['cp']);
}

if(isset($_GET['cup'])){
	$cup = htmlspecialchars($_GET['cup']);
}

$CANONICAL = '/rankings/' . $cup . '/' . $cp . '/overall/';

$league = 'Great League';

switch($cp){
	case "1500":
		$league = 'Great League';
		break;

	case "2500":
		$league = 'Ultra League';
		break;

	case "10000":
		$league = 'Master League';
		break;
}

switch($cup){

	case "premier":
		$league = 'Premier';
		break;

	case "flying":
		$league = 'Flying Cup';
		break;

	case "halloween":
		$league = 'Halloween Cup';
		break;

	case "sunrise":
		$league = 'Silph Sunrise Cup';
		break;

	case "marsh":
		$league = 'Silph Marsh Cup';
		break;

	case "uber":
		$league = 'Uber Tier Cup';
		break;

	case "little":
		$league = 'Little Cup';
		break;

	case "kanto":
		$league = 'Kanto Cup';
		break;

}

$META_TITLE = $league . ' PvP Rankings';

$META_DESCRIPTION = 'Explore the top Pokemon for Pokemon GO PvP in the ' . $league . '. Rankings include top moves, matchups, and counters for every Pokemon, as well as ratings for different roles.';

if(isset($_GET['p'])){
	// Put Pokemon names in the meta title

	$name = ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['p']))[0]));

	$META_TITLE = $name . ' ' . $league . ' PvP Rankings';

	$META_DESCRIPTION = 'Explore key matchups, moves, and counters for ' . $name . ' in ' . $league . '.';

	$CANONICAL = '/rankings/' . $cup . '/' . $cp . '/overall/' . htmlspecialchars($_GET['p']) . '/';
}

require_once 'header.php';

?>

<h1>Rankings</h1>
<div class="section league-select-container white">
	<?php require 'modules/leagueselect.php'; ?>
	<?php require 'modules/cupselect.php'; ?>

	<div class="ranking-categories">
		<a class="selected" href="#" data="overall" scenario="leads">Overall</a>
		<a href="#" data="leads" scenario="leads">Leads</a>
		<a href="#" data="closers" scenario="closers">Closers</a>
		<a href="#" data="switches" scenario="switches">Switches</a>
		<a href="#" data="chargers" scenario="chargers">Chargers</a>
		<a href="#" data="attackers" scenario="attackers">Attackers</a>
		<a href="#" data="consistency" scenario="leads">Consistency</a>
	</div>

	<div class="clear"></div>

	<p class="description overall"><b>The best Pokemon overall across multiple roles.</b> They have the typing, moves, and stats to succeed as top contenders.</p>

	<p class="description closers hide"><b>The best Pokemon with no shields in play.</b> Bulk or hard-hitting moves allow them to close out matchups.</p>

	<p class="description leads hide"><b>The best Pokemon with shields in play.</b> Capable of applying pressure or winning extended fights, they're ideal leads in battle.</p>

	<p class="description attackers hide"><b>The best Pokemon against shielded opponents, while unshielded.</b> Their natural bulk, resistances, and strong attacks allow them to power through a disadvantage.</p>

	<p class="description switches hide"><b>The best Pokemon to switch to from an unfavorable lead.</b> These Pokemon have safe matchups and can pressure shields or deal heavy damage even in their losses.</p>

	<p class="description chargers hide"><b>The best Pokemon with an energy advantage.</b> Fast energy gain or powerful moves make them dangerous after building up energy.</p>

	<p class="description consistency hide"><b>These Pokemon perform the most dependably.</b> They provide consistent damage and rely less on baiting shields than other Pokemon.</p>

	<p class="description link hide"><b>Tournament Info:</b> <a href="#" target="_blank"></a></p>

	<p>You can enter your GBL encounters <a href="https://docs.google.com/forms/d/e/1FAIpQLScc_gCvXLTUs5tHORiPpEmuF6yL6UJ0j0P03oSNDRQvNNHa0w/viewform" target="_blank">here</a> to help provide usage data for ranking updates.</p>

	<p>Click or tap the rankings below for more details.</p>

	<div class="check on limited hide"><span></span>Show <div class="limited-title">Limited Pokemon</div>*</div>
	<div class="asterisk limited hide">* Only a limited number of these Pokemon can be selected per team.</div>

	<p class="limited hide">Search for Pokemon by region or generation by typing "kanto", "johto", etc. or "gen1", "gen2", etc.</p>

	<div class="continentals hide">
		<div class="flex">
			<div class="check" value="0"><span></span>Cliff</div>
			<div class="check" value="1"><span></span>Sierra</div>
			<div class="check" value="2"><span></span>Arlo</div>
			<div class="check" value="3"><span></span>Giovanni</div>
			<div class="check" value="4"><span></span>James</div>
			<div class="check" value="5"><span></span>Jessie</div>
		</div>
	</div>

	<div class="poke-search-container">
		<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon" spellcheck="false" autocorrect="off" />
		<a href="#" class="search-info">i</a>
	</div>


	<div class="ranking-header">Pokemon</div>
	<div class="ranking-header right">Score</div>

	<h2 class="loading">Loading data...</h2>
	<div class="rankings-container clear"></div>
</div>

<a href="#" class="button download-csv">Export to CSV</a>

<div class="section about white">
	<a class="toggle" href="#">About Rankings <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>How do you know which Pokemon are the best for Trainer Battles? That question has countless answers, and below we'll go over how we arrived at ours, and how you can make the most of the rankings here.</p>
		<p>As we improve our simulator and ranking algorithms, please note that exact rankings may change. They aren't set-in-stone fact, but a best guess at which Pokemon might or might not be good for Trainer Battles. Ultimately we hope the rankings here are a helpful resource in their own way, and help you build toward succcess.</p>
		<h2>Using the Pokemon Rankings</h2>
		<p>In the top-level rankings, you'll see a score for each Pokemon. This score is an overall performance number from 0 to 100, where 100 is the best Pokemon in that league and category. It is derived from simulating every possible matchup, with each Pokemon's most used moveset (these may be manually adjusted). Use this score to compare overall performance between Pokemon; for example, the difference between the #1 and #50 Pokemon may not be the same as the difference between the #50 and #100 Pokemon. This score also allows you to see the parity in different leagues and categories.</p>
		<p>Trainer Battles feature a wide variety of scenarios, especially involving shields. In order to give a fuller picture, our overall rankings are derived from additional sets of rankings, where battles are simulated with different roles in mind. You can explore rankings for each of the following categories:</p>
		<ul>
			<li><b>Overall - </b> Derived from a Pokemon's score in all other categories. Moves are ranked based on calculations across all opponents. Key Counters and Top Matchups, however, are taken from the Leads category.</li>
			<li><b>Leads - </b> Ranking battles simulated with 2 shields vs. 2 shields.</li>
			<li><b>Closers - </b> Ranking battles simulated with no shields vs. no shields.</li>
			<li><b>Switches - </b> Ranking battles simulated with 6 turns of energy advantage and scored to favor safe matches.</li>
			<li><b>Chargers - </b> Ranking battles simulated with 6 turns of energy advantage.</li>
			<li><b>Attackers - </b> Ranking battles simulated with no shields vs. 2 shields.</li>
			<li><b>Consistency - </b> Rating of how dependent Pokemon are at baiting shields.</li>
		</ul>
		<p>Different Pokemon may succeed in different scenarios, so use these categories to help determine when a particular Pokemon would be the most valuable.</p>
		<p>Within each ranking, you'll see four separate detail sections:</p>
		<ul>
			<li><b>Fast Moves - </b> Which Fast Moves the Pokemon uses most in the league and category.</li>
			<li><b>Charged Moves - </b> Which Charged Moves the Pokemon uses most in the league and category.</li>
			<li><b>Key Wins - </b> Which battles the Pokemon performs best in, weighed by the opponent's overall score.</li>
			<li><b>Key Counters - </b> Which significant opponents perform best against the Pokemon.</li>
		</ul>
		<p>Use these to see even more information about a Pokemon, which matchups it might be useful in, and what you can use to counter it.</p>
		<h2>Using the Move Rankings</h2>
		<p>Each Pokemon has a pool of Fast Moves and a pool of Charged Moves. Some moves might be better in one battle, and other moves might be better in another. For Trainer Battles, you'll want know which moves will be the best ones to have in the most matchups. You might also want to know which Pokemon are the best candidates for a second Charged Move. The move details within each Pokemon ranking can help you determine that.</p>
		<p>Moves are ranked using calculations primarily based on their damage and energy cost. Stat changes are also factored in. These calculations are run for each matchup, and then totaled across the format. Matchup weighting affects these numbers as well, so moves that would be used against significant meta targets will rank higher.</p>
		<p>When looking at potential moves, keep an eye out for Pokemon that have a strong tendency toward a single Fast Move and a single Charged Move. These Pokemon will have their optimal moveset in the most matchups. On the other hand, some Pokemon see more balanced usage in their Charged Moves. This is where having a second Charged Move comes into play.</p>
		<p>If you're investing in a second Charged Move, you want a pair that would be optimal in the most number of matchups. Two moves that would be used in 90% of matchups are better than two moves that would be used in 60% of matchups. You also want a move that adds the most value to those matchups. A second Charged Move that is used in 40% of matchups will give you more value than one that's used in 5% of matchups.</p>
		<p>However, not all matchups are equal. When your opponent switches in a Pokemon, it isn't just random; they're likely to send out something that's strong against you. Because of this, a Charged Move that counters your counters might be more valuable than the rankings indicate. Blastoise, for example, doesn't use Ice Beam often in simulated head-to-head matchups (premier Grass-types like Meganium and Venusaur will knock it out before it can). However, Ice Beam can still be valuable when your opponent sends out these Pokemon while Blastoise has Ice Beam near or fully charged, or if you have shields while they don't.</p>
		<p>As an exercise, select any one Pokemon in the <a href="<?php echo $WEB_ROOT; ?>team-builder/">Team Builder tool</a> and compare its battle histograms when it has one Charged Move and when it has two. If a second Charged Move improves its matchups, it might be one worth investing in.</p>
		<h2>Ranking Algorithm</h2>
		<p>Rankings are generated using the following steps:</p>
		<ol>
			<li>For each category:</li>
			<ol>
				<li>Simulate every possible matchup and assign a Battle Rating for each Pokemon.</li>
				<li>Calculate each Pokemon's average Battle Rating across all matchups.</li>
				<li>Iterate through the matchups again and weigh each individual Battle Rating by the opponent's average, calculating averages again each time. Iterate through this process multiple times. Only do this if matchups are even (same shields).</li>
				<li>Calculate a Pokemon's category score as a percentage of its average weighted Battle Rating to the #1 Pokemon.</li>
			</ol>
			<li>For each Pokemon, calculate the geometric mean of its scores in every category for the overall score.</li>
		</ol>
		<p>Battle Rating is at the core of the ranking algorithm. It tells us if a Pokemon wins in battle, and by how much. Averaging all of these tells us which Pokemon perform the best against the most other Pokemon.</p>
		<p>Comparing averages alone isn't always best, though; you aren't equally likely to face every Pokemon, and numerous weak Pokemon of a certain type could skew the results in favor of their counters. So, the algorithm iterates through every matchup again and weighs each Battle Rating by the opponent's average. Now a good Battle Rating against a powerful Pokemon has more value than a good Battle Rating against a weak one. This process is recursive; a Pokemon that has a low original average might have a better weighted average, affecting all of the Pokemon who rate well against it, so this process runs a number of times to allow the top Pokemon and those that beat them to filter upward in the rankings.</p>
		<p>The overall scores are calculated through a geometric mean (root of A x B x C) as opposed to a regular mean (quotient of A + B + C). This is because the category scores are percentages; adding these percentages doesn't produce a tangible value, so a geometric mean is more applicable. Geometric mean also favors well-rounded Pokemon over Pokemon who rank highly in one category but low in others.</p>
		<p>Each Pokemon is given its optimal moveset for every matchup. Note that this can cause Pokemon with broad movesets like Mew or Suicune with Hidden Power to rank more highly than they practically should; this is already adjusted for in the overall rankings, but may appear in the Team Builder.</p>
	</div>
</div>

<?php require_once 'modules/search-string-help.php'; ?>

<div class="details-template hide">
	<div class="detail-section float margin">
		<div class="ranking-header">Key Wins</div>
		<div class="ranking-header right">Battle Rating</div>
		<div class="matchups clear"></div>
	</div>
	<div class="detail-section float">
		<div class="ranking-header">Key Losses</div>
		<div class="ranking-header right">Battle Rating</div>
		<div class="counters clear"></div>
	</div>
	<div class="detail-section float margin">
		<div class="ranking-header">Fast Moves</div>
		<div class="ranking-header right">Preference</div>
		<div class="moveset fast clear"></div>
		<div class="footnote">
			* Event or Elite TM exclusive<br>
			<sup>†</sup> Unobtainable via TM
		</div>
	</div>
	<div class="detail-section float">
		<div class="ranking-header">Charged Moves</div>
		<div class="ranking-header right">Preference</div>
		<div class="moveset charged clear"></div>
	</div>
	<div class="clear"></div>
	<div class="detail-section moveset-override">This Pokemon's recommended moveset has been manually set over the calculated move preferences. This may be to prevent an impossible moveset or take advantage of specific matchups.</div>
	<div class="detail-section typing">
		<div class="rating-container">
			<div class="ranking-header">Primary Type</div>
			<div class="type"></div>
		</div>
		<div class="rating-container">
			<div class="ranking-header">Secondary Type</div>
			<div class="type"></div>
		</div>
	</div>
	<div class="detail-section float margin">
		<div class="ranking-header">Weaknesses</div>
		<div class="weaknesses clear"></div>
	</div>
	<div class="detail-section float">
		<div class="ranking-header">Resistances</div>
		<div class="resistances clear"></div>
	</div>
	<div class="clear"></div>
	<div class="detail-section stats">
		<div class="rating-container">
			<div class="ranking-header">Attack</div>
			<div class="rating"></div>&nbsp;-
			<div class="rating"></div>
		</div>
		<div class="rating-container">
			<div class="ranking-header">Defense</div>
			<div class="rating"></div>&nbsp;-
			<div class="rating"></div>
		</div>
		<div class="rating-container">
			<div class="ranking-header">Stamina</div>
			<div class="rating"></div>&nbsp;-
			<div class="rating"></div>
		</div>
		<div class="rating-container">
			<div class="ranking-header">Rank 1 Level &amp; IVs</div>
			<div class="rating"></div>
		</div>
	</div>
	<div class="share-link detail-section"><input type="text" readonly="">
		<div class="copy">Copy</div>
	</div>
</div>

<!--test 2-->
<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/RankingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once 'footer.php'; ?>
