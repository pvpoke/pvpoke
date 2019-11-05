<?php

$META_TITLE = 'Team Builder';

$META_DESCRIPTION = 'Build your team for Pokemon GO Trainer Battles. See how your Pokemon match up offensively and defensively, discover which Pokemon are the best counters to yours, and get suggestions for how to make your team better.';

$CANONICAL = '/team-builder/';

require_once 'header.php';

?>

<h1>Team Builder</h1>

<div class="section league-select-container white">
	<p>Select your Pokemon and movesets below. You'll see how your team matches up defensively and offensively against other types, which Pokemon pose a potential threat, and potential alternatives for your team. You can also use this tool to compare Pokemon with different levels and IV's.</p>
	<?php require 'modules/leagueselect.php'; ?>
	<?php require 'modules/cupselect.php'; ?>
</div>

<div class="section team-build poke-select-container">
	<?php require 'modules/pokemultiselect.php'; ?>
</div>

<button class="rate-btn button">Rate Team</button>
<div class="section white error">Please select one or more Pokemon.</div>

<div class="section typings white">
	<a href="#" class="toggle active">Defense <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<div class="summary defense-summary"></div>
		<div class="defense"></div>
	</div>

	<a href="#" class="toggle active">Offense <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<div class="summary offense-summary"></div>
		<div class="offense"></div>
	</div>

	<a href="#" class="toggle active">Battle Histograms <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>The charts below show how many good or bad matchups each Pokemon has among all matchups possible. A Battle Rating below 500 is a loss, and a Battle Rating above 500 is a win. You can compare previous results to examine different Pokemon, movesets, or stats.</p>
		<div class="histograms">
			<div class="histogram"></div>
			<div class="histogram"></div>
			<div class="histogram"></div>
			<div class="histogram"></div>
			<div class="histogram"></div>
			<div class="histogram"></div>
		</div>
	</div>

	<a href="#" class="toggle active">Potential Threats <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content article">
		<p>The Pokemon below have the best overall matchups against this team. Results are an average of 0 and 1 shield simulations. Scores also factor in a Pokemon's overall strength and consistency.</p>
		
		<table class="threats-table rating-table" cellspacing="0">
		</table>
		<a href="#" class="button download-csv">Export Full Matchups to CSV</a>
		<table class="rating-table legend" cellspacing="0">
				<tbody>
				<tr>
					<td><a href="#" class="rating win" target="_blank"><span></span></a></td>
					<td><b>Win:</b> This Pokemon wins decisively in most scenarios. It would take a big HP or energy lead to flip this matchup. This Pokemon can safely switch and win.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating close-win" target="_blank"><span></span></a></td>
					<td><b>Close Win:</b> This Pokemon is favored, but the matchup can flip with a small HP or energy lead. This Pokemon may not be able to safely switch and win.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating tie" target="_blank"><span></span></a></td>
					<td><b>Tie:</b> Neither Pokemon is favored. This matchup can flip depending on HP or energy lead, Charged Move priority, or IV's.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating close-loss" target="_blank"><span></span></a></td>
					<td><b>Close Loss:</b> This Pokemon is at a disadvantage, but the matchup can flip with a small HP or energy lead.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating loss" target="_blank"><span></span></a></td>
					<td><b>Loss:</b> This Pokemon loses decisively in most scenarios. It would take a big HP or energy lead to flip this matchup.</td>
				</tr>
			</tbody>
		</table>
	</div>

	<a href="#" class="toggle active">Potential Alternatives <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content article">
		<p>The Pokemon below have the best overall matchups against this team's potential threats. Results are an average of 0 and 1 shield simulations. Scores also factor in a Pokemon's overall strength and consistency.</p>
		<table class="alternatives-table rating-table" cellspacing="0">
		</table>
		
		<table class="rating-table legend" cellspacing="0">
				<tbody>
				<tr>
					<td><a href="#" class="rating win" target="_blank"><span></span></a></td>
					<td><b>Win:</b> This Pokemon wins decisively in most scenarios. It would take a big HP or energy lead to flip this matchup. This Pokemon can safely switch and win.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating close-win" target="_blank"><span></span></a></td>
					<td><b>Close Win:</b> This Pokemon is favored, but the matchup can flip with a small HP or energy lead. This Pokemon may not be able to safely switch and win.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating tie" target="_blank"><span></span></a></td>
					<td><b>Tie:</b> Neither Pokemon is favored. This matchup can flip depending on HP or energy lead, Charged Move priority, or IV's.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating close-loss" target="_blank"><span></span></a></td>
					<td><b>Close Loss:</b> This Pokemon is at a disadvantage, but the matchup can flip with a small HP or energy lead.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating loss" target="_blank"><span></span></a></td>
					<td><b>Loss:</b> This Pokemon loses decisively in most scenarios. It would take a big HP or energy lead to flip this matchup.</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="share-link-container">
		<p>Share this team:</p>
		<div class="share-link">
			<input type="text" value="" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<div class="hide">
	<?php require 'modules/pokeselect.php'; ?>
</div>

<!--test 4-->
<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/TeamInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/BattleHistogram.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=3"></script>

<?php require_once 'footer.php'; ?>
