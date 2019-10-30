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
	case "boulder":
		$league = 'Boulder Cup';
		break;

	case "twilight":
		$league = 'Twilight Cup';
		break;

	case "tempest":
		$league = 'Tempest Cup';
		break;

	case "kingdom":
		$league = 'Kingdom Cup';
		break;

	case "nightmare":
		$league = 'Nightmare Cup';
		break;

	case "regionals-1":
		$league = 'Season 1 Regionals';
		break;

	case "championships-1":
		$league = 'Season 1 Championships';
		break;

	case "rainbow":
		$league = 'Rainbow Cup';
		break;

	case "jungle":
		$league = 'Jungle Cup';
		break;

	case "safari":
		$league = 'Safari Cup';
		break;

	case "fantasy":
		$league = 'Fantasy Cup';
		break;
		
	case "sinister":
		$league = 'Sinister Cup';
		break;
		
	case "ferocious":
		$league = 'Ferocious Cup';
		break;
}

$META_TITLE = $league . ' PvP Rankings';

$META_DESCRIPTION = 'Explore the top Pokemon for Pokemon GO PvP in the ' . $league . '. Rankings include top moves, matchups, and counters for every Pokemon, as well as ratings for different roles.';

require_once 'header.php';

?>

<h1>Rankings</h1>
<div class="section league-select-container white">
	<?php require 'modules/leagueselect.php'; ?>
	<?php require 'modules/cupselect.php'; ?>

	<div class="ranking-categories">
		<a class="selected" href="#" data="overall">Overall</a>
		<a href="#" data="leads">Leads</a>
		<a href="#" data="closers">Closers</a>
		<a href="#" data="attackers">Attackers</a>
		<a href="#" data="defenders">Defenders</a>
	</div>

	<div class="clear"></div>

	<p class="description overall"><b>The best Pokemon against top opponents in multiple roles.</b> They have the typing, moves, and stats to succeed against the top Pokemon in multiple scenarios.</p>

	<p class="description closers hide"><b>The best Pokemon with no shields in play.</b> Good typing, stats, and efficient moves give them the advantage.</p>

	<p class="description leads hide"><b>The best Pokemon with shields in play.</b> Capable of pressuring the opponent with good coverage or resistances, they're ideal leads in battle.</p>

	<p class="description attackers hide"><b>The best Pokemon against shielded opponents, while unshielded.</b> Their natural bulk, resistances, and strong attacks allow them to succeed against sturdy defenses.</p>

	<p class="description defenders hide"><b>The best Pokemon while shielded, against unshielded opponents.</b> Able to absorb incredible damage, they can emerge victorious against top opponents.</p>

	<p>Click or tap the rankings below for more details.</p>

	<div class="check on limited hide"><span></span>Show <div class="limited-title">Limited Pokemon</div>*</div>
	<div class="asterisk limited hide">* Only a limited number of these Pokemon can be selected per team.</div>

	<div class="poke-search-container">
		<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon" />
		<a href="#" class="search-info">i</a>
	</div>


	<div class="ranking-header">Pokemon</div>
	<div class="ranking-header right">Score</div>

	<h2 class="loading">Loading data...</h2>
	<div class="rankings-container clear"></div>
</div>

<div class="section about white">
	<a class="toggle" href="#">About Rankings <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>How do you know which Pokemon are the best for Trainer Battles? That question has countless answers, and below we'll go over how we arrived at ours, and how you can make the most of the rankings here.</p>
		<p>As we improve our simulator and ranking algorithms, please note that exact rankings may change. They aren't set-in-stone fact, but a best guess at which Pokemon might or might not be good for Trainer Battles. Ultimately we hope the rankings here are a helpful resource in their own way, and help you build toward succcess.</p>
		<h2>Using the Pokemon Rankings</h2>
		<p>In the top-level rankings, you'll see a score for each Pokemon. This score is an overall performance number from 0 to 100, where 100 is the best Pokemon in that league and category. It is derived from simulating every possible matchup, with each Pokemon's most used moveset (these may be manually adjusted). Use this score to compare overall performance between Pokemon; for example, the difference between the #1 and #50 Pokemon may not be the same as the difference between the #50 and #100 Pokemon. This score also allows you to see the parity in different leagues and categories.</p>
		<p>Trainer Battles feature a wide variety of scenarios, especially involving shields. In order to give a fuller picture, our overall rankings are derived from additional sets of rankings, where battles are simulated with different roles in mind. You can explore rankings for each of the following categories:</p>
		<ul>
			<li><b>Overall - </b> Derived from a Pokemon's score in all other categories. Moves are ranked based on usage in every category. Key Counters and Top Matchups, however, are taken from the Leads category.</li>
			<li><b>Leads - </b> Ranking battles simulated with 2 shields vs. 2 shields.</li>
			<li><b>Closers - </b> Ranking battles simulated with no shields vs. no shields.</li>
			<li><b>Attackers - </b> Ranking battles simulated with no shields vs. 2 shields.</li>
			<li><b>Defenders - </b> Ranking battles simulated with 2 shields vs. no shields.</li>
			<li><b>Consistency - </b> Rating of how dependent Pokemon are at baiting shields.</li>
		</ul>
		<p>Different Pokemon may succeed in different scenarios, so use these categories to help determine when a particular Pokemon would be the most valuable.</p>
		<p>Within each ranking, you'll see four separate detail sections:</p>
		<ul>
			<li><b>Fast Moves - </b> Which Fast Moves the Pokemon uses most in the league and category.</li>
			<li><b>Charged Moves - </b> Which Charged Moves the Pokemon uses most in the league and category.</li>
			<li><b>Key Matchups - </b> Which battles the Pokemon performs best in, weighed by the opponent's overall score.</li>
			<li><b>Top Counters - </b> Which opponents perform best against the Pokemon.</li>
		</ul>
		<p>Use these to see even more information about a Pokemon, which matchups it might be useful in, and what you can use to counter it.</p>
		<h2>Using the Move Rankings</h2>
		<p>Each Pokemon has a pool of Fast Moves and a pool of Charged Moves. Some moves might be better in one battle, and other moves might be better in another. For Trainer Battles, you'll want know which moves will be the best ones to have in the most matchups. You might also want to know which Pokemon are the best candidates for a second Charged Move. The move details within each Pokemon ranking can help you determine that.</p>
		<p>Each move is sorted by usage percentage—the percentage of battles where that move was used during the simulation, not just where it was selected. The distinction is that, in practice, an often selected move might be used infrequently, or conversely, an infrequently selected move might see more use in the matches where it's selected. Here are a few of examples to illustrate the difference:</p>
		<ul>
			<li>Kyogre's best Charged Move in terms of DPE (damage per energy) is Hydro Pump. However, Hydro Pump takes so long to charge and Kyogre's Fast Move, Waterfall, hits so hard that Kyogre ends up using the faster-charging move Thunder to knock out its opponents much more often than it uses Hydro Pump. In other words, there are very few Pokemon that would survive Kyogre's Thunder by the time it has Hydro Pump charged. As a result, Thunder has a higher usage percentage than Hydro Pump.</li>
			<li>On paper, Meganium's second best Charged Move is Solar Beam, and is selected in a large number of matchups. However, there are no situations in the current battle algorithm where Solar Beam is more optimal than Frenzy Plant, so it sees no usage. Alternatively, Earthquake is selected in fewer matchups but sees widespread use in the matchups where it's selected, making it a better secondary Charged Move than Solar Beam.</li>
			<li>Raticate and Alolan Raticate both know Hyper Beam and the faster but less efficient Hyper Fang. Raticate is less bulky than its Alolan counterpart, and that reflects in its move usage. It often doesn't survive long enough to use Hyper Beam, and ends up using Hyper Fang instead. Alolan Raticate, by comparison, survives to use Hyper Beam with more regular frequency, and so sees more balanced usage between Hyper Beam and Hyper Fang.</li>
		</ul>
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

<div class="sandbox-search-strings hide">
	<p>You can use the following search formats to filter Pokemon:</p>
	<table>
		<tr>
			<td><strong>Pokemon Name</strong></td>
			<td>"azumarill"</td>
		</tr>
		<tr>
			<td><strong>Pokemon Type</strong></td>
			<td>"water"</td>
		</tr>
		<tr>
			<td><strong>Move Name</strong></td>
			<td>"@counter"</td>
		</tr>
		<tr>
			<td><strong>Move Type</strong></td>
			<td>"@fighting"</td>
		</tr>
		<tr>
			<td><strong>And</strong></td>
			<td>"water&amp;@fighting"</td>
		</tr>
		<tr>
			<td><strong>Or</strong></td>
			<td>"water,fighting"</td>
		</tr>
		<tr>
			<td><strong>Not</strong></td>
			<td>"!water"</td>
		</tr>
	</table>
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
