<?php

$META_TITLE = 'Training Team Editor';

$META_DESCRIPTION = 'Edit the teams you battle in training.';


require_once '../header.php';
?>
<h1>Training Team Editor</h1>
<div class="section home white train editor">
	<p>Create your own team pool below to customize the teams you face in <a href="<?php echo $WEB_ROOT; ?>train/" target="_blank">Training Battles</a>. Note that CP and IV values are determined when the team is selected during play.</p>

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
						<td><a href="#" class="edit">Edit</a></td>
						<td><a href="#" class="delete">Delete</a></td>
					</tr>
				</thead>
				<tbody>
				</tbody>
			</table>
		</div>

		<button class="button new-team">+ New Team</button>

		<div class="multi-selector" mode="new">
			<?php require '../modules/pokemultiselect.php'; ?>
			<button class="button add-team">Add Team</button>
			<button class="button save-changes">Save Changes</button>
		</div>

	</div>
</div>

<div class="section white training-editor-import">
	<h3>Save/Load Teams</h3>

	<p>Save this team pool locally or load an existing team pool.</p>

	<select class="team-fill-select">
		<option value="new">New Team Pool</option>
	</select>
	<div class="flex team-fill-buttons">
		<button class="save-btn save-custom">Save</button>
		<button class="save-btn save-as hide">Save As</button>
		<button class="delete-btn hide">Delete</button>
	</div>
</div>

<div class="section white training-editor-import">
	<h3>Import/Export Teams</h3>

	<p>Copy the text below to export your custom team pool or paste to import teams. Sign up with <a href="https://gobattlelog.com" target="_blank">GoBattleLog.com</a> to export your most frequently encountered teams!</p>

	<textarea class="import"></textarea>
	<div class="copy">Copy</div>
</div>


<div class="hide">
	<?php require '../modules/pokeselect.php'; ?>
</div>

<div class="team-delete-confirm hide">
	<p>Delete this team?</p>
	<p></p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>

<div class="enter-full-team hide">
	<p>Please enter a full team.</p>
</div>

<div class="save-pool hide">
	<input class="list-name" placeholder="Team pool name" />
	<p>This will save your team pool locally to your device. Use the export code to transfer this pool between devices.</p>
	<div class="center">
		<div class="button save">Save</div>
	</div>
</div>

<div class="delete-list-confirm hide">
	<p>Delete <b><span class="name"></span></b>? This team pool will be permanently removed from your device.</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Player.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/training/TrainingEditor.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/Pokebox.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>


<?php require_once '../footer.php'; ?>
