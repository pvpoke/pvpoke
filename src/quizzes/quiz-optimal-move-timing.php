<?php

$META_TITLE = "Optimal Move Timing Quiz";

$META_DESCRIPTION = 'Practice throwing charged moves at the optimal time to minimize energy given to your opponent.';

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
					<h4>Pokemon Set</h4>
				</div>
				<select class="top-ranking-select">
					<option value="META">Meta Pokemon</option>
					<option value="20">Rankings Top 20</option>
					<option value="50">Rankings Top 50</option>
					<option value="100">Rankings Top 100</option>
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
		<div class="quiz-feedback-container-inner">
			<div class="quiz-feedback-container-left">
				<div class="quiz-feedback hidden"></div>
				<div class="optimal-timing-section optimal-timing-section-text hidden">
					<p class="timing-none" style="margin-top: 1em">Optimal Charged Move timing isn't applicable for <span class="name-attacker">Pokemon</span> in this matchup.</p>
					<p class="timing-most-optimal"><span class="name-attacker">Pokemon</span> should throw its Charged Moves after <span class="optimal-1"></span>, <span class="optimal-2"></span>, or <span class="optimal-3"></span> Fast Moves for the most optimal timing.</p>
				</div>
			</div>
			<div style="flex: 1">
				<div class="quiz-feedback-explanation hidden">
					<div class="battle-results">
						<div class="quiz battle-details">
							<div class="optimal-timing-section" style="flex: 1">
								<div class="optimal-timing-timeline">
									<div class="timeline"></div>
									<div class="timeline"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
			<div class="quiz-link-title-container hidden" style="padding-top: 10px">
        	<a class="quiz-link-title"  target="_blank" data-webroot="<?php echo $WEB_ROOT; ?>" href=""></a>
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
<?php require_once '../footer.php'; ?>
