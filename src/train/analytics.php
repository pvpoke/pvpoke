<?php

$META_TITLE = 'Training Battle';

$META_DESCRIPTION = 'Select your team and practice battling against an AI.';


require_once '../header.php';
?>
<h1>Training Battle Analytics</h1>
<div class="section home white">
	<p>Gather pick rate data from AI selected teams.</p>
</div>

<div class="hide">
	<?php require '../modules/pokeselect.php'; ?>
</div>

<div class="section poke-select-container train">
	<div class="poke">
		<h3>Your Team</h3>
		<?php require '../modules/pokemultiselect.php'; ?>
		<a class="random" href="#">Random</a>
	</div>

	<div class="poke ai-options">
		<h3>Settings</h3>
		<div class="poke-stats">
			<h3 class="section-title">League &amp; Cup</h3>
			<select class="league-cup-select">
				<option value="1500 gobattleleague">GO Battle League</option>
				<option value="2500 gobattleleague">GO Battle League (Ultra)</option>
				<option value="1500 all">Great League</option>
				<option value="2500 all">Ultra League</option>
				<option value="10000 all">Master League</option>
				<option value="1500 voyager">Voyager Cup</option>
			</select>
		</div>
	</div>
	<div class="clear"></div>
</div>

<div class="section">
	<button class="battle-btn button">Simulate</button>
</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Player.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/training/TrainingAnalytics.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/training/BattleInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/training/DecisionOption.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/training/TrainingAI.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/training/MatchHandler.js?v=<?php echo $SITE_VERSION; ?>"></script>


<?php require_once '../footer.php'; ?>
