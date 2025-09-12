<?php

$cp = '1500';
$cup = 'all';

if(isset($_GET['cp'])){
	$cp = htmlspecialchars($_GET['cp']);
}

if(isset($_GET['cup'])){
	$cup = htmlspecialchars($_GET['cup']);
}

$CANONICAL = '/rankings/' . $cup . '/' . $cp . '/overall/';

switch($cp){
	case "500":
		$league = 'Little Cup';
		break;

	case "1500":
		$league = 'Great League';
		break;

	case "2500":
		$league = 'Ultra League';
		break;

	case "10000":
		$league = 'Master League';
		break;

	case "10000-40":
		$league = 'Master League Classic';
		break;

	default:
		$league = '';
		break;
}


// Load format data to generate page title
$formatFound = false;

if($cup != 'all' && ! $formatFound){
	// Only load format data for non default cups
	require_once '../data/formats.php';

	if(isset($formats) && is_array($formats)){
		// Find the format that matches the cup and cp
		foreach ( $formats as $format ) {
			if ( $cup == $format['cup'] && $cp == $format['cp'] ) {
				$league = $format['title'];
				$formatFound = true;
				break;
			}
		}

	}
}


$META_TITLE = $league . ' PvP Rankings';

$META_DESCRIPTION = 'Explore the top Pokemon for Pokemon GO PvP in the ' . $league . '. Rankings include top moves, matchups, and counters for every Pokemon, as well as ratings for different roles.';

if(isset($_GET['p'])){
	// Put Pokemon names in the meta title

	$name = ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['p']))[0]));

	if($name == 'Lanturnw'){
		$name = 'Lanturn';
	}

	$META_TITLE = $name . ' ' . $league . ' PvP Rankings';

	$META_DESCRIPTION = 'Explore key matchups, moves, and counters for ' . $name . ' in ' . $league . '.';

	$CANONICAL = '/rankings/' . $cup . '/' . $cp . '/overall/' . htmlspecialchars($_GET['p']) . '/';
}

require_once '../header.php';

?>

<h1>Optimal Move Timing Quiz</h1>
<div class="section league-select-container white" id='quiz'>
	<div class="flex space-between align-items-start" style="padding-bottom: 12px">
        <a class="back-title" href="<?php echo $WEB_ROOT; ?>quizzes/">&larr; Quizzes</a>
    </div>
	<div class="quiz-ranking-filters flex">
		<div class="quiz-select-container">
			<div class="ranking-filter">
				<div class="flex">
					<h4>Format</h4>
					<a class="format-rules" href="#">Rules</a>
				</div>
				
				<?php require '../modules/formatselect.php'; ?>
			</div>
			<div class="ranking-filter">
				<div class="flex">
					<h4>Top Rankings</h4>
				</div>
				<select class="top-ranking-select">
					<option value="10">10</option>
					<option value="50">50</option>
					<option value="100">100</option>
					<option value="200">200</option>
					<option value="ALL">All</option>
				</select>
			</div>
		</div>
		<div class="flex quiz-score">
			<div style="padding-right: 4px"><b>Score: </b></div>
			<div>0</div>
			<div>/</div>
			<div>0</div>
		</div>
	</div>

	<div class="quiz-checks flex">
		<div class="check quiz-reccomended-moveset on"><span></span>Only Use Recommended Moveset</div>
	</div>

	<div class="flex quiz-omt-match-container">
		<div class="yours" style="flex: 1">
			<div class="quiz-header">Your Pokemon</div>
			<h5 class="loading" style="padding-bottom=4px">Loading pokemon...</h5>
			<div class="quiz-container clear"></div>
			<details class='quiz-hints'>
				<summary>Move Details</summary>
				<div class="quiz-hints-container quiz-omt-hints-container clear"></div>
		</div>
		<div class="versus-text">VS</div>
		<div class="opponents" style="flex: 1">
			<div class="quiz-header">Opponent's Pokemon</div>
			<h5 class="loading" style="padding-bottom=4px">Loading pokemon...</h5>
			<div class="quiz-container clear"></div>
			<details class='quiz-hints'>
				<summary>Move Details</summary>
				<div class="quiz-hints-container quiz-omt-hints-container clear"></div>
		</div>
	</div>
	</details>
	<?php require_once '../modules/quizhints-only-fast-move.php'; ?>
	<details class="quiz-hints">
		<summary>Moves pattern</summary>
		<div class="battle-results">
		<div class="battle-details">
			<div class="optimal-timing-section">
				<div class="optimal-timing-timeline">
					<div class="timeline"></div>
					<div class="timeline"></div>
				</div>
			</div>
		</div>
	</div>
	</details>
	<div class="quiz-header">Question</div>
	<div class="quiz-question" style="display: none;">
		<span class="question-text">After how many Fast Moves should you throw the Charged Moves for the most optimal timing?</span>
		<div class="quiz-answer-input-container">
			<div class="quiz-answer-input">
				<select id="quiz-omt-guess" style="height: 100%">
					<option value="" disabled selected>-- Choose --</option>
					<!-- Generate 0 to 16 -->
					<option value="No optimal timing possible">No optimal timing possible</option>
					<option value="1,4,7">1,4,7</option>
					<option value="1,3,5">1,3,5</option>
					<option value="2,5,8">2,5,8</option>
					<option value="2,7,12">2,7,12</option>
					<option value="3,8,13">3,8,13</option>
				</select>
			</div>
			<button class="quiz-check-btn quiz-button" style="display: none;">
				<span class="btn-content-wrap">
					<span class="btn-label">Check Answer</span>
				</span>
			</button>
		</div>
	</div>
	<div class="quiz-feedback-container">
		<div class="quiz-header quiz-feedback-header hidden">Answer Review</div>
		<div class="quiz-feedback hidden"></div>
		<div class="quiz-feedback-explanation hidden">
			<div class="battle-results">
				<div class="battle-details">
					<div class="optimal-timing-section">
						<p class="timing-none">Optimal Charged Move timing isn't applicable for <span class="name-attacker">Pokemon</span> in this matchup.</p>
						<p class="timing-most-optimal"><span class="name-attacker">Pokemon</span> should throw its Charged Moves after <span class="optimal-1"></span>, <span class="optimal-2"></span>, or <span class="optimal-3"></span> Fast Moves for the most optimal timing.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="quiz-next-btn-container">
			<button class="quiz-next-btn button" style="display: none;">
				<span class="btn-content-wrap">
					<span class="btn-label">Next Question</span>
			</span>
		</button>
	</div>
</div>

<?php require '../modules/ads/body-728.php'; ?>

<div class="hide">
	<?php require '../modules/pokeselect.php'; ?>
</div>

<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/QuizOptimalMoveTimingInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/rankers/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/libs/hexagon-chart.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
