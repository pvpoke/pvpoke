<?php

$META_TITLE = 'Training Battle';

$META_DESCRIPTION = 'Select your team and practice battling against an AI.';


require_once '../header.php';
?>
<h1>Training Battle</h1>
<div class="section home white">
	<p>Select your team and options below to battle against a CPU opponent.</p>
	<p>This tool is a training and learning resource intended to supplement your in-game battles. Experiment with new lineups or practice in a pressure free environment against a difficulty of your choice.</p>
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
	</div>
	<button class="lets-go-btn button">Let's Go!</button>
</div>

<div class="section battle">
	<div class="battle-window">
		<img class="img-block" src="<?php echo $WEB_ROOT; ?>img/train/battle-window-block.png" />
		<div class="top">
			<div class="timer">
				<div class="text">12</div>
			</div>
			<div class="team-indicator left">
				<div class="ball"></div>
				<div class="ball"></div>
				<div class="ball"></div>
			</div>
			<div class="shields left">2</div>
			<div class="team-indicator right">
				<div class="ball"></div>
				<div class="ball"></div>
				<div class="ball"></div>
			</div>
			<div class="shields right">2</div>
		</div>

		<div class="scene">
			<div class="background"></div>
			<div class="pokemon-container self">
				<div class="messages"></div>
				<h3 class="name">Venusaur</h3>
				<div class="hp bar-back">
					<div class="bar damage"></div>
					<div class="bar"></div>
				</div>
				<div class="pokemon">
					<div class="shadow"></div>
					<div class="main-sprite"></div>
					<div class="secondary-sprite"></div>
					<div class="white-sprite"></div>
					<div class="shield-sprite-container">
						<div class="shield-sprite"></div>
						<div class="shield-sprite"></div>
						<div class="shield-sprite"></div>
						<div class="shield-sprite"></div>
					</div>
				</div>
			</div>

			<div class="pokemon-container opponent">
				<div class="messages"></div>
				<h3 class="name">Skarmory</h3>
				<div class="hp bar-back">
					<div class="bar damage"></div>
					<div class="bar"></div>
				</div>
				<div class="pokemon">
					<div class="shadow"></div>
					<div class="main-sprite"></div>
					<div class="secondary-sprite"></div>
					<div class="white-sprite"></div>
					<div class="shield-sprite-container">
						<div class="shield-sprite"></div>
						<div class="shield-sprite"></div>
						<div class="shield-sprite"></div>
						<div class="shield-sprite"></div>
					</div>
				</div>
			</div>
		</div>

		<div class="controls">
			<div class="move-bars">
				<div class="move-bar">
					<div class="label">T</div>
					<div class="bar electric"></div>
					<div class="bar-back electric"></div>
				</div>
				<div class="move-bar">
					<div class="label">MB</div>
					<div class="bar steel"></div>
					<div class="bar-back steel"></div>
				</div>
			</div>
			<div class="switch-btn active"></div>
		</div>

		<div class="shield-window">
			<div class="container">
				<p>Attack incoming! Use Protect Shield?</p>
				<div class="shield"></div>
				<div class="shield-count"></div>
				<div class="close">Not Now</div>
			</div>
		</div>

		<div class="charge-window">
			<div class="container">
				<div class="rings">
					<div class="ring-container">
						<div class="ring"></div>
					</div>
					<div class="ring-container">
						<div class="ring"></div>
					</div>
					<div class="ring-container">
						<div class="ring"></div>
					</div>
					<div class="ring-container">
						<div class="move-bars">
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="switch-window">
			<div class="container">
				<p>Switch in a new pokemon?</p>
				<div class="pokemon-container">
					<div class="pokemon">
						<div class="cp">cp 1500</div>
						<div class="sprite-container">
							<div class="main-sprite"></div>
							<div class="secondary-sprite"></div>
						</div>
						<div class="name">Pokemon 1</div>
					</div>
					<div class="pokemon">
						<div class="cp">cp 1500</div>
						<div class="sprite-container">
							<div class="main-sprite"></div>
							<div class="secondary-sprite"></div>
						</div>
						<div class="name">Pokemon 2</div>
					</div>
				</div>
			</div>
		</div>

		<div class="countdown">
			<div class="text"></div>
		</div>

		<div class="animate-message">
			<div class="text"></div>
		</div>

		<div class="end-screen-container">
			<div class="end-screen section white">
				<h3 class="result">You won!</h3>
				<div class="battle-stats">
					<div class="tab-section damage">
						<div class="pokemon-entry">
							<div class="poke-icon">
								<div class="name">Azumarill</div>
								<div class="image"></div>
							</div>
							<div class="damage-container">
								<div class="damage-bar"></div>
							</div>
						</div>
						<div class="pokemon-entry">
							<div class="poke-icon">
								<div class="name">Azumarill</div>
								<div class="image"></div>
							</div>
							<div class="damage-container">
								<div class="damage-bar"></div>
							</div>
						</div>
						<div class="pokemon-entry">
							<div class="poke-icon">
								<div class="name">Azumarill</div>
								<div class="image"></div>
							</div>
							<div class="damage-container">
								<div class="damage-bar"></div>
							</div>
						</div>
					</div>
				</div>

				<div class="buttons">
					<div class="button replay">Rematch</div>
					<div class="button next-round">Next Round</div>
					<div class="button new-match">New Match</div>
				</div>
			</div>
		</div>


	</div>
</div>

<script src="<?php echo $WEB_ROOT; ?>/js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/pokemon/Player.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/training/TrainingSetupInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/training/BattleInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/training/DecisionOption.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/training/TrainingAI.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/interface/PokeMultiSelect.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/battle/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>/js/training/MatchHandler.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
