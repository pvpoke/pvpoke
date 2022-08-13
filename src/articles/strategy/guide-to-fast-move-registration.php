<?php


$META_TITLE = 'Guide to Fast Move Mechanics';

$META_DESCRIPTION = 'How exactly do Fast Moves work and register? This guide will walk you through the basics of understanding the nuts and bolts of Trainer Battles.';

$OG_IMAGE = 'https://pvpoke.com/articles/article-assets/guide-to-fast-move-registration/og.jpg';

require_once '../../header.php';

?>

<div class="section article white">
	<h1>Guide to Fast Move Mechanics</h1>
	<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/banner.jpg" style="border:none;"/></p>
	<div class="date">Last updated August 13th, 2022</div>
	<p>How exactly does Fast Move damage and energy work? What are sneaks, and how should you time your moves? In this article, we&rsquo;ll go over the mechanics behind Fast Moves and how they impact gameplay. </p>
    <p>Special thanks to FlarkeFiasco, GarretK19383, and TheMisterValor for bringing these mechanics to my attention and helping to compile and video examples for initial Fast Move mechanic work! This was an incredibly challenging  puzzle to solve and it couldn&rsquo;t have been done without their help.</p>
	<p>Also check out <a href="https://youtu.be/pAtCo8xg700" target="_blank">Wallower</a>, who has in-depth videos discussing move timing and other concepts discussed in this article.</p>
	  <p>Jump to a section:
	  <ol>
				<li><a href="#turns">Turns</a></li>
				<li><a href="#registration">Fast Move Registration</a></li>
				<li><a href="#optimal-timing">Optimal Move Timing</a></li>
				<li><a href="#sandbox">Sandbox Mode</a></li>
	  </ol>
	<a name="turns"></a>
	<h3 class="article-header">Turns</h3>
	<p>
      Trainer Battles are broken up into turns. <strong>Each  turn lasts 0.5 seconds</strong>. On a typical turn, each Pokemon can take one action  - a Fast Move, a Charged Move, or a switch. Let&rsquo;s take a look at how Fast Moves use turns and interact with one another. </p>
	<p>
      Each Fast Move lasts a certain number of turns,  usually referred to as its &ldquo;duration&rdquo; or &ldquo;cooldown&rdquo;. <strong>Duration determines the  amount of time between your Fast Moves.</strong> The timelines below illustrate  different Fast Moves and their durations. Each circle represents a new action. </p>
	<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/mechanics-duration-timeline.png" style="border:none;"/></p>
	<p>As you can see, a shorter duration allows more  frequent actions. You can fit 2 Counters in each Confusion, or 5 Dragon Breaths in 1 Incinerate.</p>
	<a name="registration"></a>
	<h3 class="article-header"> Fast Move Registration</h3>
	<div class="article-section">
		<p>
		  When you use a Fast Move, it doesn't hit right away. <b>Fast Move damage and energy register on the last turn of the move.</b> If you're using Counter, a 2-turn move, the animation begins on turn 1 and the damage and energy register on turn 2.</p>
		<p>Check out to the table below for move durations, the number of turns that need to pass before the move hits, and example moves.  Note that 1-turn moves register immediately on the turn they are used. </p>
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
				<td>Confusion, Volt Switch</td>
			</tr>
			<tr>
				<td>5</td>
				<td>4</td>
				<td>Incinerate</td>
			</tr>
		</table>
		<p>So what does this look like in action? The  examples below show circles for when you tap to use a Fast Move and squares for  when the move actually hits. </p>
		  <h3>2-Turn Move vs. 2-Turn Move</h3>
		<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/mechanics-register-2-2-new.png" style="border:none;" /></p>
		  <p>Above we have a mirror match where both Pokemon&rsquo;s  Fast Moves have the same duration. Damage and energy register on the 2nd turn of the move, so play alternates between Fast Moves being used and Fast Moves hitting. </p>
		  <h3>2-Turn Move vs. 4-Turn Move</h3>
	<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/mechanics-register-2-4-new.png" style="border:none;"/></p>
		  <p>Things play out similarly when the Fast Moves involved  are even with one another. For example, Counter (2 turns) and Confusion (4  turns) happen in step so Confusion registers simultaneously with every other Counter.</p>
		<h3>1-Turn Move vs. 3-Turn Move</h3>
<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/mechanics-register-1-3.png" style="border:none;"/></p>
		<p>In battles against a 1-turn move, the 1-turn move registers damage and energy each turn. Pokemon with 1 turn moves can maximize their move timing to throw at any interval in the opponent's animation.</p>
		  <h3>2-Turn Move vs. 3-Turn Move</h3>
<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/mechanics-register-2-3-new.png" style="border:none;"/></p>
		  <p>Some Pokemon matchups involve move timings that are out of sync. For example, a 2 turn and a 3 turn move line up every 3rd move. This can require specific counting or paying close attention to the move animations.</p>
	</div>

	<a name="optimal-timing"></a>
	<h3 class="article-header">Optimal Move Timing</h3>
	<p>Why does timing matter?</p>
	<p>When you use a Charged Move, you interrupt any ongoing Fast Moves to begin the Charged Move sequence. The Charged Move sequence resets all Pokemon cooldowns/animations. Afterward, both Pokemon can immediately act again. <b>When you interrupt an opponent's Fast Move, you effectively grant them "free" turns</b> and allow them to attack more frequently than if you had not interrupted them.</p>

	<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/interruption-example.png" style="border:none;"/></p>

	<p>In the above example, Counter Medicham (2 turns) is throwing Ice Punches at Incinerate Talonflame (5 turns). Incinerate has a very long cooldown, but each time Medicham uses a Charged Move, Talonflame is able to immediately attack again. Ordinarily, it would take 15 turns for Talonflame to use Incinerate 3 times. Here, it takes 8 turns for Talonflame to use Incinerate 3 times because Medicham is interrupting its Fast Moves and granting Talonflame "free" turns.</p>

	<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/optimized-timing.png" style="border:none;"/></p>

	<p>Here, Medicham is timing its Charged Moves optimally. By throwing Ice Punch on the last turn of Incinerate (the same turn it hits), Medicham grants Talonflame zero "free" turns.</p>

	<p><img src="<?php echo $WEB_ROOT; ?>articles/article-assets/guide-to-fast-move-registration/optimal-timing-guide.png" style="margin: 0 auto;"/></p>

	<p><b>The goal of optimal move timing is to reduce the number of "free" turns you grant your opponent when you use a Charged Move.</b> The graphic above highlights how many free turns you would grant your opponent if you interrupted their Fast Move on the specified turn. It's most optimal to throw your Charged Move <i>on the last turn</i> of your opponent's Fast Move. Throwing at this time results in zero "free" turns and doesn't allow your opponent to attack on the same turn as your Charged Move (see "Sneaking" below).</p>

	<p>Optimal move timing is largely impossible in mirror matches or other matchups where your Fast Moves align (such as a 2 turn vs 4 turn Fast Moves).</p>

<a name="sandbox"></a>
		<h3 class="article-header">Sandbox Mode</h3>
	<p>
      You can use the site's Sandbox Mode to further explore the impact of move timing and mechanics. When you enter Sandbox Mode, circle  icons appear above the timeline to indicate when each players can use an  action, like what&rsquo;s been shown in the article so far. These appear at regular  intervals like you might be used to, dictated by Fast Move duration. <strong>Click  on the circular Tap icons to select an action for that turn.</strong></p>
    <p>You can select one of the following actions: </p>
    <ul type="disc">
      <li><strong>Fast Move - </strong>This player will use a Fast       Move. This action will queue a new Fast Move to be registered as described in this article.<strong></strong></li>
      <li><strong>Charged Move - </strong>This player       will use one of their Charged Moves. Note that a Charged Move will fail if a Fast Move that faints the user also registers on that turn.<strong></strong></li>
      <li><strong>Wait - </strong>This player will take no action on the selected turn.</li>
    </ul>

	<div class="share-link-container">
		<p>Share this article:</p>
		<div class="share-link">
			<input type="text" value="https://pvpoke.com/articles/strategy/guide-to-fast-move-registration/" readonly>
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
