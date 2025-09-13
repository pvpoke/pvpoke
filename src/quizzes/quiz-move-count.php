<?php

$META_TITLE = "Move Count Quiz";

$META_DESCRIPTION = 'Test your knowledge of how many fast moves are needed to reach a charged move.';

require_once '../header.php';

?>

<h1>Move Count Quiz</h1>
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

	<div class="quiz-header">Pokemon</div>
	<h5 class="loading" style="padding-bottom=4px">Loading pokemon...</h5>
	<div class="quiz-container clear"></div>
	<details class='quiz-hints'>
		<summary>Moves Details</summary>
			<div class="quiz-hints-container clear"></div>
	</details>
	<?php require_once '../modules/quizhints.php'; ?>
	<div class="quiz-header">Question</div>
	<div class="quiz-question" style="display: none;">
		<span class="question-text">How many Fast Moves does it take to reach the first Charged Move?</span>
		<div class="quiz-answer-input-container">
			<div class="quiz-answer-input">
				<select id="guess" style="height: 100%">
					<option value="" disabled selected>-- Choose --</option>
					<!-- Generate 0 to 16 -->
					<option value="0">0</option>
					<option value="1">1</option>
					<option value="2">2</option>
					<option value="3">3</option>
					<option value="4">4</option>
					<option value="5">5</option>
					<option value="6">6</option>
					<option value="7">7</option>
					<option value="8">8</option>
					<option value="9">9</option>
					<option value="10">10</option>
					<option value="11">11</option>
					<option value="12">12</option>
					<option value="13">13</option>
					<option value="14">14</option>
					<option value="15">15</option>
					<option value="16">16</option>
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
		<div class="quiz-feedback-explanation hidden"></div>
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
<script src="<?php echo $WEB_ROOT; ?>js/interface/QuizMoveCountInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
