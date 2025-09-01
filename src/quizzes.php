<?php require_once 'header.php'; ?>

<!--<div class="banner-link">Take the <a href="https://forms.gle/jUVrKMjGRkYSzui59" target="_blank">PvPoke.com feedback survey</a> and help improve the website!</div>-->

<div class="section home white">

	<p class="small">Welcome to Quiz PvP on PvPoke.com — train your Pokémon GO knowledge and sharpen your battle skills!</p>

	<a href="<?php echo $WEB_ROOT; ?>quiz-fast-charged-count/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-battle"></span>
			<span class="btn-label">
				<h2>Fast-Charged Counts</h2>
				<p>Test your knowledge of how many fast moves are needed to reach a charged move.</p>
			</span>
		</span>
	</a>

	<a href="<?php echo $WEB_ROOT; ?>quiz-optimal-move-timing/" class="button">
		<span class="btn-content-wrap">
			<span class="btn-icon btn-icon-rankings"></span>
			<span class="btn-label">
				<h2>Optimal Move Timing Quiz</h2>
				<p>Practice throwing charged moves at the optimal time to minimize energy given to your opponent.</p>
			</span>
		</span>
	</a>

<?php require_once 'footer.php'; ?>
