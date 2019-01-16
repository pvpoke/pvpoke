<?php 

$META_TITLE = 'Battle';

$META_DESCRIPTION = 'Pit two custom Pokemon against each other in the Trainer Battle simulator. You can choose from any league, and customize movesets, levels, IV\'s, and shields.';

$CANONICAL = '/battle/';

if(isset($_GET['p1']) && (isset($_GET['p2']))){
	// Put Pokemon names in the meta title
	
	$name1 = ucwords(str_replace('_',' ',$_GET['p1']));
	$name2 = ucwords(str_replace('_',' ',$_GET['p2']));
	
	$META_TITLE = 'Battle - ' . $name1 . ' vs. ' . $name2;
}

require_once 'header.php';

?>

<h1>Battle</h1>

<div class="section league-select-container white">
	<p>Select two Pokemon from any league below to fight in a simulated battle. You can customize movesets, levels, IV's, and shields.</p>
	<?php require 'modules/leagueselect.php'; ?>
</div>

<div class="section poke-select-container">
	<?php require 'modules/pokeselect.php'; ?>
	<?php require 'modules/pokeselect.php'; ?>
	<div class="clear"></div>
</div>

<div class="section battle">
	<button class="battle-btn button">Battle</button>
	<div class="battle-results">
		<div class="timeline-container">
			<div class="timeline"></div>
			<div class="timeline"></div>
			<div class="tooltip"><h3 class="name"></h3><div class="details"></div></div>
			<div class="tracker"></div>
		</div>
		<div class="tip">Hover over or tap the timeline for details</div>
		<div class="summary section white"></div>
		<div class="share-link-container">
			<p>Share this battle:</p>
			<div class="share-link">
				<input type="text" value="" readonly>
				<div class="copy">Copy</div>
			</div>
		</div>
		
		<div class="section about white">
			<a class="toggle" href="#">About the Battle Simulator <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
			<div class="toggle-content">
				<p>Can Pokemon A beat Pokemon B, and by how much? The battle simulator seeks to calculate and illustrate the answer to that question. It displays a timeline of what each Pokemon does, and how much damage they deal. While the simulator strives to paint as accurate a picture as possible, note that various factors may affect the outcome of an actual battle, such as Pokemon stats, latency, device performance, and human decision-making. We hope the simulator can serve as a helpful guide for real-world battles.</p>
				<p>Below are details for how the battle simulator works.</p>
				<h2>Battle Rating</h2>
				<p>Battle Rating</a> is a metric used to represent each battle's outcome. It is the backbone of PvPoke's rankings. The Battle Rating formula is:</p>
				<p class="center"><span class="rating star">Battle Rating</span> = (500 x (Damage Dealt / Opponent's HP)) + (500 x (HP Remaining / HP))</p>
				<p>In other words, a Pokemon gets up to 500 points for the percentage of HP it damages in battle and up to 500 points for the percentage of HP it survives with. Battle Rating has a hypothetical maximum of 1000 (victory with no damage taken) and a hypothetical minimum of 0 (loss with no damage dealt). Victories will always have a minimum Battle Rating of 500</p>
				<p>Battle Rating is a way of measuring battles beyond simply "win" and "loss"; it may be valuable to know not only which Pokemon can win, but which can do so while sustaining the least amount of damage, leaving them in a better position for the next fight.</p>
				<h2>Pokemon Stats</h2>
				<p>A Pokemon's actual stats are a result of its base stats, IV's, and a CP multiplier (determined by level). The stats shown are a Pokemon's actual stats at the given CP or level. "Overall" is a product of the three stats and gives a general idea for performance, mostly useful for comparing Pokemon of the same or similar species.</p>
				<p>By default, Pokemon have IV's of 0 and are automatically scaled to meet the exact CP by solving for CP multiplier. If a Pokemon can't reach the CP limit at level 40, its IV's are incremented by 1 until it does reach the CP limit or until it has IV's of 15. This process results in Pokemon having a level/CP multiplier that isn't usually attainable. However, it best represents each Pokemon's natural ability with no other factors involved.</p>
				<h2>Move Selection</h2>
				<p>When using the auto select option, the simulator calculates which moves would be optimal in the current matchup. It does this in the steps below:</p>
				<ol>
					<li>Sort Charged Moves by DPE (damage per energy) and select the best move for the "Main" Charged Move. Some Charged Moves deal a lot of damage but take longer to charge, while others charge quickly but deal less damage. DPE helps determine each Pokemon's most efficient move in the matchup.</li>
					<li>Sort remaining Charged Moves by damage per energy squared and select the best move for the "Secondary" Charged Move. Since this weighs moves by energy, fast-charging moves are more likely to be selected than slow ones. This method for selecting a Secondary Charged Move was chosen because the battle algorithm prioritizes fast Charged Moves over the Main Charged Move in certain scenarios, so this helps give Pokemon access to their faster attacks even if they aren't as efficient on paper as other options (e.g. Dragonite with Dragon Claw or Magneton with Discharge).</li>
					<li>Calculate TDO (total damage output) for each Fast Move and select the best option. TDO is simply the product of DPS (how much damage a Pokemon deals per second, on average) and how much time the Pokemon lasts in battle.</li>
				</ol>
				<p>While this algorithm does its best to give each Pokemon the optimal result in battle, it does currently have a few pitfalls. First, TDO calculations don't take into account things like shields, or how many Charged Moves a Pokemon is actually able to use in its lifetime. This means a Pokemon may perform slightly better with a different Fast Move if shields are in play or if it faints before a certain threshold. Second, there may be edge cases where a certain move combination produces a better result than the one automatically selected due to damage hitting at specific times and in specific intervals. Know that auto selection will give you the best result the majority of the time, but don't be afraid to experiment with movesets for each matchup.</p>
				<p>You can customize moves at any time. Pokemon are given two Charged Moves by default, but you can set this to "None" if you want, or even remove both Charged Moves if you want to see how a Pokemon performs with only its Fast Move.</p>
				<h2>Battle Algorithm</h2>
				<p>Pokemon GO's Trainer Battles take place in 0.5-second "turns", and the simulator increments through each of those turns while determining the best possible action for both combatants. To determine those actions, the simulator performs the following checks:</p>
				<ol>
					<li>If the Main Charged Move is available, use it immediately.</li>
					<li>Use the Secondary Charged Move if:
						<ul>
							<li>It would KO the opponent</li>
							<li>The opponent has a shield</li>
							<li>The opponent's next action would result in a KO</li>
						</ul>
					</li>
					<li>If the opponent is using any Charged Move and shields are available, block it.</li>
					<li>If none of these are true, use the Fast Move.</li>
				</ol>
				<p>This algorithm produces the following behavior:</p>
				<ol>
					<li>Pokemon will use any move available if it would result in a KO.</li>
					<li>Pokemon will use any move available to deal the most possible damage before they feint.</li>
					<li>Pokemon will always shield themselves if possible.</li>
					<li>Pokemon will use their fastest Charged Move to remove an opponent's shields.</li>
				</ol>
				<p>This behavior may not always represent human play or strategies, but it's intended to give each Pokemon the best result in the specific battle.</p>
				<h2>Simultaneous Actions &amp; Knockouts</h2>
				<p>One nuance of Pokemon GO Trainer Battles is that actions occur simultaneously. Because of this, the battle simulator allows both Pokemon to take their action each turn even if one is technically fainted. Without this caveat, the first Pokemon in a simulated battle would have a distinct advantage simply because its moves are processed first.</p>
				<p>This can result in a battle simulation where two Pokemon knock each other out simultaneously. In these scenarios, bear in mind that the outcome of an actual battle may vary and, in the case of simultaneous Charged Moves, is heavily dependent on which goes first.</p>
			</div>
		</div>
		
	</div>
</div>

<!--test-->
<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=4"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=2"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/Interface.js?v=2"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=2"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=2"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=2"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=2"></script>

<?php require_once 'footer.php'; ?>