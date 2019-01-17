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
	<?php require 'modules/pokeselect.php'; ?>
	<?php require 'modules/pokeselect.php'; ?>
	<?php require 'modules/pokeselect.php'; ?>
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
		<div class="histograms"></div>	
	</div>
	
	<a href="#" class="toggle active">Potential Threats <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>The Pokemon below have the best overall matchups against this team.</p>
		<div class="threats rankings-container"></div>
		<div class="clear"></div>
	</div>

	<a href="#" class="toggle active">Potential Alternatives <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>The Pokemon below have the best overall matchups against this team's potential threats.</p>
		<div class="alternatives rankings-container"></div>
		<div class="clear"></div>
	</div>
	
	<div class="share-link-container">
		<p>Share this team:</p>
		<div class="share-link">
			<input type="text" value="" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<!--test-->
<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=6"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/TeamInterface.js?v=3"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TeamRanker.js"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js"></script>

<?php require_once 'footer.php'; ?>