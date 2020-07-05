<?php require_once 'header.php'; ?>

<div class="section home white">
	<p>Welcome to PvPoke.com! We're an open-source tool for simulating, ranking, and building teams for Pokemon GO PvP (player versus player) battles. Check out the links below to get started.</p>

	<a href="<?php echo $WEB_ROOT; ?>battle/" class="button">
		<h2 class="icon-battle">Battle</h2>
		<p>Simulate a battle between two custom Pokemon.</p>
	</a>
	<a href="<?php echo $WEB_ROOT; ?>train/" class="button">
		<h2 class="icon-train">Train</h2>
		<p>Play real-time battle simulations against a CPU opponent.</p>
	</a>
	<a href="<?php echo $WEB_ROOT; ?>rankings/" class="button">
		<h2 class="icon-rankings">Rankings</h2>
		<p>Explore the rankings, movesets, and counters for the top Pokemon in each league.</p>
	</a>
	<a href="<?php echo $WEB_ROOT; ?>team-builder/" class="button">
		<h2 class="icon-team">Team Builder</h2>
		<p>Build your own team and see their type matchups and potential counters.</p>
	</a>
	<a href="<?php echo $WEB_ROOT; ?>contribute/" class="button">
		<h2 class="icon-contribute">Contribute</h2>
		<p>Check out the source code on Github or lend your support through Patreon.</p>
	</a>

	<!--Update section for updates-->
	<h3>What's New</h3>

	<h4>v1.15.11 (July 4, 2020)</h4>
	<ul>
		<li>New algorithm to generate move usage/preference stats in the rankings that should provide more realistic numbers:</li>
		<ul>
			<li>Previous algorithm auto-selected moves in each matchup and counted move usage in simulated battles. This method was time-consuming and would result in low or no usage for moves the algorithm didn't favor,
			such as Volt Switch or Blaze Kick.</li>
			<li>New algorithm ranks moves based on damage, energy, stat change, and TDO calculations. It produces more realistic movesets and makes it easier to compare potential performance between moves.</li>
		</ul>
	</ul>

	<h4>v1.15.10 (July 2, 2020)</h4>
	<ul>
		<li>Implemented a search priority to Pokemon selection so popular Pokemon like Azumarill and Giratina will appear first without needing to type most of the name.</li>
	</ul>

	<h4>v1.15.9 (July 1, 2020)</h4>
	<ul>
		<li>Updated interface for Charged Move buttons/meters to show overflow energy like in-game.</li>
		<li>Hovering over a Pokemon's selected Charged Moves shows damage in percentage and highlights the damage amount on the opponent's health bar.</li>
	</ul>

	<h3>Latest Article</h3>

	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/best-elite-tm-candidates-pvp/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/elite-tm-thumb.jpg" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/best-elite-tm-candidates-pvp/">Best Elite TM Candidates for PvP</a></h4>
			<div class="date">April 28, 2020</div>
			<p>Elite TM's are now available! Which exclusive moves and Pokemon are the best for your PvP team?</p>
		</div>

	</div>

</div>

<?php require_once 'footer.php'; ?>
