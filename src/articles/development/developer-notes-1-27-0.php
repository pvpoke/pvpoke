<?php


$META_TITLE = 'PvPoke Developer Notes - Update 1.27.0';

$META_DESCRIPTION = 'Get an overview on updates to the core simulation logic and default settings, including baiting behavior and optimized move timing.';

require_once '../../header.php';

?>

<div class="section article white">
	<h1>PvPoke Developer Notes - Update 1.27.0</h1>
	<div class="date">Last updated April 16th, 2022</div>
	<p>Developer of PvPoke here! The latest site update makes some core changes to how the simulations work, and I'll be diving into those changes and how Pokemon are evaluated differently compared to before. I’ll also be sharing some behind the scenes thoughts and challenges.</p>
<p>Jump to a section:
  <ol>
	  			<li><a href="#intro">Overview</a></li>
				<li><a href="#baiting">New Baiting Behaviors</a></li>
				<li><a href="#timing">Optimized Move Timing</a></li>
				<li><a href="#other">Other Updates &amp; Fixes</a></li>
	  </ol>

	  <a name="intro"></a>
  	<h3 class="article-header">Overview</h3>
	<p>Before we get into the details, let&rsquo;s lay a quick groundwork on how PvPoke works and what these changes mean!</p>
	<p>The PvPoke simulator determines the result of a Pokemon matchup by playing it out using a set of behavior rules. These behavior rules range from simple ones like &ldquo;use your Charged Move when you have the energy&rdquo; to more complicated ones like &ldquo;don&rsquo;t throw self-debuffing moves early in a matchup if you have a non-debuffing move with comparable damage output&rdquo;. All in all, these behavior rules attempt to produce a single result that represents a typical matchup between two Pokemon, and arrive at a number that can be used for analysis.</p>
	<p>Of course, the behavior rules and results aren&rsquo;t perfect! (No, Melmetal isn&rsquo;t supposed to helplessly throw Rock Slides into Steelix.) This article highlights some changes I&rsquo;ve made to improve them and what to expect from the results and rankings.</p>

	<img src="<?php echo $WEB_ROOT;?>articles/article-assets/developer-notes-1-27-0/sim-update-rankings.jpg" />

	<a name="baiting"></a>
	<h3 class="article-header">New Baiting Behaviors</h3>

	<p>Baiting behaviors have been expanded with a &ldquo;selective baiting&rdquo; option. This behavior only baits shields when the Pokemon can meaningfully threaten the opponent with its other Charged Move (the opponent can&rsquo;t survive the Charged Move plus subsequent Fast Moves). This baiting behavior is the new default behavior, as opposed to always baiting in every matchup.</p>
	<p>With this change, Pokemon like Bubble Beam Jellicent will no longer bait shields against bulky opponents like Azumarill, who can survive their big move (in this case, Shadow Ball). It reduces the number of unrealistic baits in the default simulations and lowers the overperformance of bait dependent Pokemon.</p>
	<p>The goal of this change is to reduce the impact of &ldquo;sim hero&rdquo; Pokemon who are guaranteed to perform well in the simulations but don&rsquo;t perform as consistently in practice. While &ldquo;sim hero&rdquo; Pokemon will always exist, I hope this helps produce more realistic results than before. It also fixes issues that resulted from special shielding rules surrounding Power-Up Punch and Poison Fang; for example, Scrafty will no longer attempt to bait against Ghost-type Pokemon and will simply use Foul Play instead.</p>
	<p><em>Development Note:</em> When I first started working on this update, I initially made it so Pokemon don&rsquo;t shield at all until a Charged Move threatens them. That sounds like realistic play, but I quickly realized it would be bad as a tool! The site&rsquo;s Battle Rating metric evaluates matchups based on HP remaining, so bulkier Pokemon would unintuitively have lower scores since they would be less inclined to use their shields. I then shifted from changing when defenders choose to shield to changing when attackers choose to bait.</p>

	<div class="article-note">
		<h4>Why do baits always succeed in the simulations?</h4>
		<p>The answer to this goes way back to the foundational designs of PvPoke. PvPoke is based around the “battle timeline” as a tool for visualizing and exploring Pokemon matchups. For each matchup, the simulation solves for one result to display on the battle timeline or reference in other tools like the rankings or team builder. That result needs to be repeatable and shareable.</p>
		<p>To arrive at that result, the simulation must make assumptions about the Pokemon (such as moves and IV’s) and player behavior (such as baiting). In this case, the outcome of baiting must be a boolean value—that is, baits must either always succeed or always fail. Always successful baits skew the results in favor of some Pokemon, but the same would be true if baits always failed. The changes described in this article should help find a middle ground.</p>
	</div>

	<a name="timing"></a>
	<h3 class="article-header">Optimized Move Timing</h3>

	<p>Previously, the default simulations didn&rsquo;t use optimized Charged Move timing although this was available as an advanced setting. (Read more about optimized timing <a href="https://pvpoke.com/articles/strategy/guide-to-fast-move-registration/#optimal-timing" target="_blank">here!</a>) The default simulations now use optimized timing.</p>
	<p>This change positively impacts Pokemon with short Fast Moves (like Lock On or Dragon Breath) who now play more optimally against their opponents, and negatively impacts Pokemon with long Fast Moves (like Incinerate), whose opponents now play more optimally against them. It also reduces the number of Fast Move &ldquo;sneaks&rdquo; present in the default simulations, which had an impact on pacing and matchup outcomes.</p>
	<p>The goal of this change is to remove some asterisks or qualifiers that surround the default simulations. In particular, the optimized move timing setting is generally only discussed when the default simulation produces a different result—and the result with optimized timing is generally considered to be the more correct of the two. Perfectly optimized move timing isn&rsquo;t representative of typical play, but this change should reduce the need to double check the simulation results or add asterisks to related analysis.</p>

	<a name="other"></a>
	<h3 class="article-header">Other Updates &amp; Fixes</h3>

	<p>In this update, I also made fixes so Pokemon more accurately predict when they&rsquo;re about to faint and throw available energy accordingly. Previously, many Pokemon would faint with loaded energy. In addition, I also added some edge cases where Pokemon with self-debuffing moves like Close Combat or Wild Charge will wait for their opponent to throw a survivable Charged Move before debuffing themselves. This change should slightly improve results for Pokemon like Zacian.</p>
	<p><em>Developer Note:</em> While testing these updates, I compared results from the old simulations to the new simulations. When the results were significantly different, it was important to evaluate if one Pokemon was playing more correctly, or if the other Pokemon was playing worse.</p>
	<p>Through this, I discovered a bug in the old simulations that caused many of Talonflame&rsquo;s opponents to faint with energy because they were incorrectly predicting they could survive another Fast Move. Some of Talonflame&rsquo;s wins are now softer wins as a result of these fixes. Sorry, Talonflame! Its ratings are being hit on multiple fronts in this update, but it&rsquo;s still an excellent Pokemon.</p>

	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/development/developer-notes-1-27-0/" readonly>
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
