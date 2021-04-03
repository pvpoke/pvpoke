<?php

$META_TITLE = 'Training Battle Editor';

$META_DESCRIPTION = 'Edit the teams you battle in training.';


require_once '../header.php';
?>
<h1>Training Battle Editor</h1>
<div class="section home white train">
	<p>Create your own team pool below to customize the teams you face in <a href="<?php echo $WEB_ROOT; ?>train/">training battles</a>.</p>


	<div class="team-selector">
		<div class="table-container">
			<table class="train-table teams" cellspacing="0">
				<thead>
					<tr>
						<td class="poke-name">Team (Lead First)</td>
						<td class="poke-name"></td>
						<td class="poke-name"></td>
						<td></td>
						<td></td>
					</tr>
					<!--Row html to clone-->
					<tr class="hide">
						<td class="poke-name">
							<div class="team-member">
								<div class="sprite-container pokemon">
									<div class="main-sprite"></div>
									<div class="secondary-sprite"></div>
								</div>
								<div class="name-container">
									<div class="name">Azumarill</div>
									<div class="moves">Bubble, Ice Beam, Hydro Pump</div>
								</div>
							</div>
						</td>
						<td class="poke-name">
							<div class="team-member">
								<div class="sprite-container pokemon">
									<div class="main-sprite"></div>
									<div class="secondary-sprite"></div>
								</div>
								<div class="name-container">
									<div class="name">Azumarill</div>
									<div class="moves">Bubble, Ice Beam, Hydro Pump</div>
								</div>
							</div>
						</td>
						<td class="poke-name">
							<div class="team-member">
								<div class="sprite-container pokemon">
									<div class="main-sprite"></div>
									<div class="secondary-sprite"></div>
								</div>
								<div class="name-container">
									<div class="name">Azumarill</div>
									<div class="moves">Bubble, Ice Beam, Hydro Pump</div>
								</div>
							</div>
						</td>
						<td><button class="button edit">Edit</button></td>
						<td><button class="button delete">Delete</button></td>
					</tr>
				</thead>
				<tbody>
				</tbody>
			</table>
		</div>

		<button class="button new-team">+ Add Team</button>

		<div class="poke">
			<?php require '../modules/pokemultiselect.php'; ?>
		</div>

	</div>
</div>

<div class="hide">
	<?php require '../modules/pokeselect.php'; ?>
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
