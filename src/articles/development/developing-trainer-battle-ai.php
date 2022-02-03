<?php


$META_TITLE = 'Developing an AI for Pokemon GO Trainer Battles';

$META_DESCRIPTION = 'Read about the artificial intelligence behind PvPoke\'s training battles.';

require_once '../../header.php';

?>

<div class="section article white">
	<h1>Developing an AI for Pokemon GO Trainer Battles</h1>
	<div class="date">Last updated July 30th, 2019</div>
	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/developing-trainer-battle-ai/banner.jpg" />
	<p>The site now features Training Battles, real-time battle simulations against an AI opponent! This was a huge endeavor and I was really excited to create an engaging practice tool that people could use anytime, anywhere. Pokemon GO Trainer  Battles have a lot of complexity - from team compositions to in-game battle  tactics like baiting shields and switching. Developing an AI to play the game  might seem like a daunting task, but there are two core systems I designed to  keep it elegant and engaging at the same time. </p>
<p>Jump to a section:
  <ol>
				<li><a href="#goals">Design Goals</a></li>
				<li><a href="#evaluation">Matchup Evaluation</a></li>
				<li><a href="#decisions">Decision Making</a></li>
				<li><a href="#teams">Team Selection</a></li>
				<li><a href="#closing">Closing Thoughts</a></li>
	  </ol>
	<a name="goals"></a>
<h3 class="article-header"><strong>Design Goals</strong></h3>
<p dir="ltr">When I set out to create the AI, I primarily wanted to design an adversary that would play like a human opponent, and that you would beat the same way you would beat a human player. Especially when it comes to difficulty, this meant following a few bullet points:</p>
<ul>
  <li dir="ltr">The AI needs to employ strategies and thinking that real players do
  </li>
  <li dir="ltr">The AI shouldn&rsquo;t have information a human opponent wouldn&rsquo;t (don&rsquo;t make it omniscient about the player&rsquo;s team selection or move usage)
  </li>
  <li dir="ltr">Difficulty must be exclusively through the AI&rsquo;s behavior and not through artificial means like inflating Pokemon CP
  </li>
  <li dir="ltr">It&rsquo;s okay for the AI to make mistakes
  </li>
</ul>
<p dir="ltr">Team GO Rocket battles have proven to be a challenge in their own right, for example, but I knew for this project it was vital to make the AI beatable in the same way you&rsquo;d beat a human player. That is, I didn&rsquo;t want to introduce any qualities or quirks that players would adapt to in order to beat the AI, that wouldn&rsquo;t be relevant in actual Trainer Battles. I also didn&rsquo;t want the AI to be outright unbeatable or infallible; if a player recognizes the AI has made a mistake, that&rsquo;s still a learning moment.</p>
<p dir="ltr">In order to accomplish this, I knew I needed to do the following:</p>
<ul>
  <li dir="ltr">Allow the AI to assign long-term strategies that alter its default behavior
  </li>
  <li dir="ltr">Give it a means to evaluate matchups in order to determine those strategies
  </li>
</ul>
<p dir="ltr">One of my first steps was to catalogue as many player strategies as I could and organize them in an algorithmic way (&ldquo;if this, do that&rdquo;). If my opponent is low on HP, let&rsquo;s faint them down and farm some energy. If my opponent is about to get a Charged Move that will be bad for me, let&rsquo;s duck out of there and absorb it with another Pokemon.</p>
<p dir="ltr">Below is a table of some example strategies or traits, and the difficulty levels that employ them:</p>
<table class="stats-table" cellspacing="0">
	<tr>
		<td class="title"></td>
		<td class="label">Novice</td>
		<td class="label">Rival</td>
		<td class="label">Elite</td>
		<td class="label">Champion</td>
	</tr>
	<tr>
		<td>Shielding</td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
	</tr>
	<tr>
		<td>2 Charged Moves</td>
		<td class="center"></td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
	</tr>
	<tr>
		<td>Basic Switching</td>
		<td class="center"></td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
	</tr>
	<tr>
		<td>Energy Farming</td>
		<td class="center"></td>
		<td class="center"></td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
	</tr>
	<tr>
		<td>Shield Baiting</td>
		<td class="center"></td>
		<td class="center"></td>
		<td class="center">&#10004;</td>
		<td class="center">&#10004;</td>
	</tr>
	<tr>
		<td>Advanced Switching</td>
		<td class="center"></td>
		<td class="center"></td>
		<td class="center"></td>
		<td class="center">&#10004;</td>
	</tr>
	<tr>
		<td>Switch Clock Management</td>
		<td class="center"></td>
		<td class="center"></td>
		<td class="center"></td>
		<td class="center">&#10004;</td>
	</tr>

</table>
<p dir="ltr">So how is this all implemented? Let&rsquo;s take a look at the two core systems that make the AI tick!</p>
<p><a name="evaluation"></a>
</p>
<h3 class="article-header"><strong>Matchup Evaluation</strong></h3>
<p>There are so many variables to take into account  when considering matchups, from typing to shields to energy. Practiced players will know the relevant matchups and what beats what.</p>
<p>Beating at the AI&rsquo;s heart is the simulator you  already know. It pits Pokemon with their current HP and energy against each  other to obtain approximate knowledge of current or potential matchups. When it  does this, the AI runs four different scenarios: </p>
<ul type="disc">
  <li><strong>Both Bait:</strong> Will I win this if my opponent       and I successfully bait shields?</li>
  <li><strong>No Bait:</strong> Will I win this without       baiting shields?</li>
  <li><strong>Neither Bait: </strong>Will I win this if neither of       us bait shields?</li>
  <li><strong>Farm:</strong> Will I win this using Fast       Moves only?</li>
</ul>
<p>If these scenarios look good, the AI will stick  it out and decide on a strategy to try and win the matchup. If these scenarios  don&rsquo;t look good, it&rsquo;ll look for an opportunity to switch. </p>
<p>The AI performs matchup evaluation at a few  specific moments: </p>
<ul type="disc">
  <li>During team selection in Tournament Mode to evaluate       best picks and counter picks</li>
  <li>At the beginning of the game</li>
  <li>After either player switches</li>
  <li>After each Charged Move</li>
</ul>
<p>This results in a tendency for the AI to switch  after Charged Moves, which lines up with real player behavior of queuing a  switch during Charged Moves. Evaluating matchups on every turn was also a  possibility but resulted in erratic behavior; here the AI is better able to  commit to a strategy. </p>
<a name="decisions"></a>
  <h3 class="article-header"><strong>Decision Making</strong></h3>
      <p dir="ltr">Once the AI has gathered all of this information, how does it decide what to do? The AI&rsquo;s second core system is here to help! Everything the AI chooses or does originates from a pseudo-random decision making function. Simply put, this function acts as a lottery for different choices, and the AI&rsquo;s available information determines each options&rsquo; weight, or how many times that option entered into the &ldquo;drawing&rdquo;.      </p>
	<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/developing-trainer-battle-ai/ai-graphic-options.jpg" /></p>
      <p dir="ltr">As shown above, the AI will randomly choose between several options, and the likelihood of selecting any particular option depends on its weight value. The AI adjusts these weight values to help itself make the &ldquo;right&rdquo; choice but the door is always open for something unconventional.  </p>
  <p dir="ltr">This pseudo-randomness was an important part of my design goals - I didn&rsquo;t want the AI to always play the same matchups the same way, and I wanted to add a touch of unpredictability. With this system, the AI is open to mistakes and misplays, while at the same time capable of stumbling backwards into genius that wouldn&rsquo;t be possible in a more rigid decision-making system.</p>
  <p dir="ltr">Literally everything the AI does passes through this system - from roster picks to choosing strategies, switches, or whether or not to shield incoming attacks.
	<a name="teams"></a>  </p>
  <h3 class="article-header">Team Selection</h3>
  <p>If you&rsquo;re trying to make a challenging AI, you  also need to give it a challenging team. There are a few different ways I could  have gone about this - one simple solution, for example, would be to make a  list of preset teams for the AI to pick from. This would have been fine, but I  wanted a high amount of a variability so players can really sharpen their own  picking skills. How do you generate random teams that are also balanced and  competitive, and vary by difficulty? </p>
  <p>The answer I went with is a slot system. Picks  are categorized into several slots (&ldquo;Tank&rdquo;, &ldquo;Grass,&rdquo; Mudboi,&rdquo; etc.), and the AI  uses the pseudo-random decision making described above to select a slot and  then select a Pokemon within that slot. Once a slot and Pokemon are picked,  they can&rsquo;t be picked again, and the AI repeats this until all 6 of its roster spots  are filled. </p>
	<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/developing-trainer-battle-ai/ai-graphic-roster.jpg" /></p>
  <p>Each slot also has synergies with other slots.  When a &ldquo;Mudboi&rdquo; is selected, for example, the AI is more likely to pick  something from the &ldquo;Flying&rdquo; slot to help cover the Grass weakness. </p>
  <p>The last element to consider is difficulty. At  lower difficulties, the AI&rsquo;s picks more off-meta things or thrifty versions of  meta counterparts. Each Pokemon within a slot is assigned a difficulty level,  and the AI will only select it if the Pokemon&rsquo;s difficulty level is within 1 of  its own. For example a level 3 AI (&ldquo;Champion&rdquo;) will only select Pokemon that  belong to difficulty 2 or 3, while a level 0 AI (&ldquo;Novice&rdquo;) will only select  Pokemon that belong to difficulty 0 or 1. This allows for a range of pick options  while maintaining good picks for the higher difficulties and less optimal picks  for the lower difficulties. </p>
  <p>Selecting a roster is one thing, but how about  selecting a team? Players have pick strategies that can be defined in a few  categories. This <a href="https://old.reddit.com/r/TheSilphArena/comments/bop4wb/high_level_pvp_tips_and_strategies_2/" target="_blank">Reddit  post</a> by C9Gotem goes in depth about different tiers  of thinking involved in pick strategies, and was a helpful reference as I  worked on this part of the AI. </p>
  <p>In Tournament Mode, the AI can employ the  following pick strategies: </p>
  <ul type="disc">
    <li><strong>Basic: </strong>The AI chooses an ordered set       three directly from its roster. This is similar to if a player uses a       preset team of 3 that they&rsquo;re well practiced with. Because of the slot       synergies, these teams are usually balanced but this strategy can also       have some unconventional results.<strong></strong></li>
    <li><strong>Best: </strong>The AI leads with the Pokemon       that has the most positive matchups against the opponent. The AI then selects       a &ldquo;bodyguard&rdquo; for the lead to counter its counters, and rounds out the       team with a Pokemon that fits well with both.<strong></strong></li>
    <li><strong>Counter:</strong> Like the above, but the AI       leads with a Pokemon that counters the opponent&rsquo;s best Pokemon.</li>
    <li><strong>Unbalanced:</strong> The AI selects two well-rounded       Pokemon and leads with a bodyguard for them both. This strategy aims to       produce lineups that overpower typical balanced teams and control the flow       of battle.</li>
    <li><strong>Same Team: </strong>After a match, the AI will use       the same team again. It&rsquo;s more likely to do this after a win.<strong></strong></li>
    <li><strong>Same Team, Different Lead: </strong>After       a match, the AI will use the same team again but lead with the previous       team&rsquo;s bodyguard. This has the effect of countering the previous lead&rsquo;s       counter. It&rsquo;s more likely to do this after a win.<strong></strong></li>
    <li><strong>Counter Last Lead: </strong>The AI will       lead with its best counter to the opponent&rsquo;s previous lead. It&rsquo;s more       likely to do this after a loss.<strong></strong></li>
  </ul>
  <p>In this way, the AI picks similarly to  conventional players and hopefully makes for good practice when it comes to  picking in a tournament! </p>
	<a name="closing"></a>
	<h3 class="article-header">Closing Thoughts</h3>
	<p>This project was a huge passion and effort. I hope it enhances your enjoyment of the game and helps you develop a winning skillset! Big picture, it's also my hope that these training battles might inspire newcomers to PvP, other developers, and if they should see them, Niantic themselves. Here's hoping for a bright and exciting future!</p>
	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/development/developing-trainer-battle-ai/" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>
<script>
	// Generate scorecards from data

	$(document).ready(function(e){

		$(".rating-data").each(function(){

			var $data = $(this);
			var $table = $(".rating-table-template").clone().removeClass("rating-table-template hide");
			var id = $(this).attr("data-id");
			var moveset = $(this).attr("data-moveset");

			var classes = ["loss","close-loss","tie","close-win","win"];

			$data.find("div").each(function(index, value){
				var $row = $table.find("tr.hide").clone().removeClass("hide");
				var opId = $(this).attr("data-id");
				var opMoveset = $(this).attr("data-moveset");
				var ratings = $(this).attr("data-ratings").split(",");

				$row.find(".name").html($(this).attr("data-name"));

				for(var i = 0; i < ratings.length; i++){

					var rating = parseInt(ratings[i]);
					var className = classes[rating + 2];
					var battleLink = "<?php echo $WEB_ROOT; ?>battle/1500/"+id+"/"+opId+"/"+i+""+i+"/"+moveset+"/"+opMoveset+"/";

					$row.find("a").eq(i).addClass(className);
					$row.find("a").eq(i).attr("href", battleLink);
				}

				$table.find("tbody").append($row);
			});

			$table.find("tr.hide").remove();

			$table.insertAfter($(this));

		});

	});

</script>
<?php require_once '../../footer.php'; ?>
