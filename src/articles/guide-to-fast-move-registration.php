<?php


$META_TITLE = 'Guide to Fast Move Mechanics';

$META_DESCRIPTION = 'How exactly do Fast Moves work and register? This guide will walk you through the basics of understanding the nuts and bolts of Trainer Battles.';

$OG_IMAGE = 'https://pvpoke.com/assets/articles/mechanics-og.jpg';

require_once '../header.php';

?>

<div class="section article white">
	<h1>Guide to Fast Move Mechanics</h1>
	<p><img src="<?php echo $WEB_ROOT; ?>assets/articles/mechanics-banner.jpg" style="border:none;"/></p>
	<div class="date">Last updated October 9th, 2019</div>
	<p><b>Update October 9th, 2019</b> - Since app version 0.157.0, the mechanics for Fast Move registration have changed! This article and the site simulations have been updated to reflect those changes.</p>
	<p>How exactly does Fast Move damage and energy work? In this article, we&rsquo;ll go over the mysterious mechanics behind Fast Moves and how they impact gameplay. </p>
    <p>Special thanks to FlarkeFiasco, GarretK19383, and TheMisterValor for bringing these mechanics to my attention and helping to compile and explore  video evidence for all sorts of scenarios! This was an incredibly challenging  puzzle to solve and it couldn&rsquo;t have been done without their help.</p>
	  <p>Jump to a section:
	  <ol>
				<li><a href="#turns">Turns</a></li>
				<li><a href="#duration">Fast Move Duration</a></li>
				<li><a href="#registration">Fast Move Registration</a></li>
				<li><a href="#sandbox">Sandbox Mode</a></li>
		  		<li><a href="#differences">Differences in 0.157.0</a></li>
	  </ol>
	<a name="turns"></a>
	<h3 class="article-header">Turns</h3>
	<p>
      Trainer Battles are broken up into turns. <strong>Each  turn lasts 0.5 seconds</strong>. On a typical turn, each Pokemon can take one action  - a Fast Move, a Charged Move, or a switch. Let&rsquo;s take a look at how Fast Moves  use turns and interact with one another. </p>
	<a name="duration"></a>
		<h3 class="article-header">Fast Move Duration</h3>
	<p>
      Each Fast Move lasts a certain number of turns,  usually referred to as its &ldquo;duration&rdquo; or &ldquo;cooldown&rdquo;. <strong>Duration determines the  amount of time between your Fast Moves.</strong> The timelines below illustrate  different Fast Moves and their durations. Each circle represents a new action. </p>
	<p><img src="<?php echo $WEB_ROOT; ?>assets/articles/mechanics-duration-timeline.png" style="border:none;"/></p>
	<p>As you can see, a shorter duration allows more  frequent actions. </p>
	<a name="registration"></a>
	<h3 class="article-header"> Fast Move Registration</h3>
	<div class="article-section">
		<p>
		  When you use a Fast Move, does it hit right  away? Actually most of the time, no! Since update 0.157.0, <b>Fast Move damage and energy always register on the last turn of the move.</b> This means you will always have the energy from your previous move when you go to perform another move. The earliest time a move can register hasn't changed with this update, but it's now guaranteed to register at that time (previously it required another action happening on the same turn).</p>
		<p>How does this all work? Check out to the table below for move durations, the number of turns that need to pass before the move hits, and example moves.  Note that 1-turn moves register immediately on the turn they are used. </p>
		<table cellspacing="0">
			<tr>
				<td><b>Duration</b></td>
				<td><b>Turns to Register</b></td>
				<td><b>Examples</b></td>
			</tr>
			<tr>
				<td>1</td>
				<td>0</td>
				<td>Water Gun, Dragon Breath, Bug Bite</td>
			</tr>
			<tr>
				<td>2</td>
				<td>1</td>
				<td>Counter, Vine Whip, Mud Shot</td>
			</tr>
			<tr>
				<td>3</td>
				<td>2</td>
				<td>Air Slash, Fire Spin, Bubble</td>
			</tr>
			<tr>
				<td>4</td>
				<td>3</td>
				<td>Confusion</td>
			</tr>
			<tr>
				<td>5</td>
				<td>4</td>
				<td>Volt Switch</td>
			</tr>
		</table>
		<p>So what does this look like in action? The  examples below show circles for when you tap to use a Fast Move and squares for  when the move actually hits. </p>
		  <h3>2-Turn Move vs. 2-Turn Move</h3>
		<p><img src="<?php echo $WEB_ROOT; ?>assets/articles/mechanics-register-2-2-new.png" style="border:none;" /></p>
		  <p>Above we have a mirror match where both Pokemon&rsquo;s  Fast Moves have the same duration. Damage and energy register on the 2nd turn of the move, so play alternates between Fast Moves being used and Fast Moves hitting. </p>
		  <h3>2-Turn Move vs. 4-Turn Move</h3>
	<p><img src="<?php echo $WEB_ROOT; ?>assets/articles/mechanics-register-2-4-new.png" style="border:none;"/></p>
		  <p>Things play out similarly when the Fast Moves involved  are even with one another. For example, Counter (2 turns) and Confusion (4  turns) happen in step so Confusion registers simultaneously with every other Counter. If you're a Confusion user, you're no longer stuck performing extra Confusions like you were pre-0.157.0.</p>
		<h3>1-Turn Move vs. 3-Turn Move</h3>
<p><img src="<?php echo $WEB_ROOT; ?>assets/articles/mechanics-register-1-3.png" style="border:none;"/></p>
		<p>Battles against Pokemon with 1-turn moves will play exactly like before, since 1-turn moves previously registered their opponent's Fast Moves at the earliest possible time.</p>
		  <h3>2-Turn Move vs. 3-Turn Move</h3>
<p><img src="<?php echo $WEB_ROOT; ?>assets/articles/mechanics-register-2-3-new.png" style="border:none;"/></p>
		  Pre-0.157.0, 2-turn vs. 3-turn move interactions were complex and unpredictable. Now both moves register at steady intervals.</p>
	</div>
<a name="sandbox"></a>
		<h3 class="article-header">Sandbox Mode</h3>
	<p>
      When you enter Sandbox Mode, circle  icons appear above the timeline to indicate when each players can use an  action, like what&rsquo;s been shown in the article so far. These appear at regular  intervals like you might be used to, dictated by Fast Move duration. <strong>Click  on the circular Tap icons to select an action for that turn.</strong></p>
    <p>You can select one of the following actions: </p>
    <ul type="disc">
      <li><strong>Fast Move - </strong>This player will use a Fast       Move. This action will queue a new Fast Move to be registered as described in this article.<strong></strong></li>
      <li><strong>Charged Move - </strong>This player       will use one of their Charged Moves. Note that a Charged Move will fail if a Fast Move that faints the user also registers on that turn.<strong></strong></li>
      <li><strong>Wait - </strong>This player will take no action on the selected turn.</li>
    </ul>
	<a name="differences"></a>
	<h3 class="article-header"> Differences in 0.157.0</h3>
	<p>A big question is how have matchups changed? Are there any major new wins or losses? Here's a summary of what you can expect to find!</p>
	<ul>
		<li>Flipped matchups will be ones that were previously very close with a difference of one or two Fast Moves, or IV's.</li>
		<li>Damage and energy registration now happen at more predictable intervals. 3-turn moves will behave the same whether they're against a 1-turn move or a 4-turn move.</li>
		<li>Pokemon are no longer overtapping, but that goes for their opponents as well. This generally benefits most Pokemon equally. Matchups involving a 3-turn move and a 2 or 4-turn move are the most suspectible to change because of how erratic move registration was previously.</li>
	</ul>

<!--<a name="videos"></a>
	<h3 class="article-header">Video Examples</h3>
	<p>
      Now, it&rsquo;s time to put this all together. Below  are video examples of real-world battles with their corresponding simulations.  Hopefully these help illustrate the mechanics at play and ground the  simulations as you explore them. </p>
	<p class="center">
		<iframe width="560" height="315" src="https://www.youtube.com/embed/WKcO_b_29tY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
	</p>
	<p>In the example above, Drapion and Xatu both have 3-turn moves (Infestation and Air Slash) so they gain energy and deal damage in step with one another. Mathematically, Drapion should be able to use Crunch after 5 Infestations, but it needs to use a 6th because the energy from its 5th Infestation doesn't register until both Pokemon use a 6th Fast Move.</p>
	<p class="center">
		<iframe width="560" height="315" src="https://www.youtube.com/embed/sBKWcxWSmws" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
	</p>
	<p>Here we have Hypno with a 4-turn move (Confusion) and Venusaur with a 2-turn move (Vine Whip). Venusaur gets 2 Vine Whips for every Confusion. Because they land evenly with one another, Hypno needs to use 6 Confusions to reach Shadow Ball.</p>
	<p class="center">
		<iframe width="560" height="315" src="https://www.youtube.com/embed/t9mR8RTdyTI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
	</p>
	<p>This example pulls out all the bells and whistles. Alolan Raichu has a 2-turn move (Spark) against a 3-turn move (Infestation), so energy and damage register in a staggered pattern. While Drapion beats Raichu to the first Charged Move, it also registers Raichu's energy early enough for Raichu to beat it to the next. Because of how these two moves interact, Raichu isn't dependent on registering its own attack.</p>-->
	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/guide-to-fast-move-registration/" readonly>
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
<?php require_once '../footer.php'; ?>
