<?php

$META_TITLE = 'Training Battle';

$META_DESCRIPTION = 'Select your team and practice battling against an AI.';


require_once '../header.php';
?>
<h1>Training Battle</h1>
<div class="section home white">
	<p>Select your team and options below to battle in a real-time simulation against a CPU opponent.</p>
	<p>This tool is a training and learning resource intended to supplement your in-game battles. Experiment with new lineups or practice in a pressure free environment against a difficulty of your choice!</p>
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
			<select class="mode-select">
				<option value="single">Single (3v3)</option>
				<option value="tournament">Tournament (6v6)</option>
			</select>
			<h3 class="section-title">League &amp; Cup</h3>
			<select class="league-cup-select">
				<option value="1500 all">Great League</option>
				<option value="2500 all">Ultra League</option>
				<option value="10000 all">Master League</option>
				<option value="1500 jungle">Jungle Cup</option>
				<option value="1500 rainbow">Rainbow Cup</option>
				<option value="1500 regionals-1">Season 1 Regionals</option>
				<option value="1500 nightmare">Nightmare Cup</option>
				<option value="1500 kingdom">Kingdom Cup</option>
				<option value="1500 tempest">Tempest Cup</option>
				<option value="1500 twilight">Twilight Cup</option>
				<option value="1500 boulder">Boulder Cup</option>
			</select>
			<h3 class="section-title">Difficulty</h3>
			<select class="difficulty-select">
				<option value="0">Novice</option>
				<option value="1">Rival</option>
				<option value="2">Elite</option>
				<option value="3">Champion</option>
			</select>
			<h3 class="section-title">Team Selection</h3>
			<select class="team-method-select">
				<option value="random">Random</option>
				<option value="manual">Manual</option>
			</select>
			<?php require '../modules/pokemultiselect.php'; ?>
		</div>
	</div>
	<div class="clear"></div>
</div>

<div class="section">
	<button class="battle-btn button">Battle</button>
</div>

<div class="section team-select">
	<div class="opponent">
		<h3 class="center">Opponent's Roster</h3>
		<div class="roster pokemon-container"></div>
	</div>
	<h3 class="center">vs.</h3>
	<div class="self">
		<h3 class="center">Your Roster</h3>
		<div class="roster pokemon-container"></div>
		<p class="center">Select and order your team of 3 for battle!</p>
		<h4 class="center">Current Round: <span class="round-record"></span></h4>
	</div>
	<button class="lets-go-btn button">Let's Go!</button>
</div>

<div class="section battle">
	<div class="battle-window">
		<img class="img-block" src="<?php echo $WEB_ROOT; ?>img/train/battle-window-block.png" />
		<?php require_once 'modules/top.php'; ?>
		<?php require_once 'modules/scene.php'; ?>
		<?php require_once 'modules/controls.php'; ?>

		<div class="countdown">
			<div class="text"></div>
		</div>

		<div class="animate-message">
			<div class="text"></div>
		</div>

		<?php require_once 'modules/end-screen.php'; ?>
	</div>
</div>

<div class="section white updates">
	<h3>What's New</h3>

	<h4>v1.9.2 (August 4, 2019)</h4>
	<ul>
		<li>Fixed an issue in Training Battles where Charged Moves would sometimes deal no damage</li>
		<ul>
			<li>This happened due to an issue where the game timers would desync and the Charged Move minigame would end early, resulting in your charge not being submitted before damage occurred. The timer desync part is still unresolved, but the Charged Move sequence has been reworked so your moves will deal the correct amount of damage even when this issue occurs.</li>
		</ul>
		<li>When Autotap is enabled in Training Battles, switch commands are buffered and submitted each turn until they succeed. This should resolve issues that made switching incredibly difficult with Autotap enabled.</li>
		<ul>
			<li>The simulator contains the same "switch glitch" in the game that causes switches to fail when you're in the middle of a Fast Move. For ease of use, this behavior is fixed when Autotap is enabled. You'll want to keep practicing care with your switches when you tap manually.</li>
		</ul>
		<li>Added the Rematch button for battles in Tournament Mode so you can replay against the same lineup. Matches you replay won't count for or against your record.</li>
		<li>Added a new set of controls to Training Battles so you can:</li>
		<ul>
			<li>Pause the game mid-match</li>
			<li>Instantly restart the current match</li>
			<li>Quit from the current match to the setup options in 3v3 mode, or the team select screen in 6v6 mode</li>
		</ul>
		<li>Tweaked the AI's pick strategies in 3v3 mode so counter leads are less frequent in the higher difficulties.</li>
		<ul>
			<li>The AI doesn't have advanced knowledge of your lead, but how the pick method works in 3v3 made a counter lead highly likely. This has been turned down so you should encounter a wider variety of leads and lineups. This doesn't impact 6v6.</li>
		</ul>
	</ul>
</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Player.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/training/TrainingSetupInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
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
