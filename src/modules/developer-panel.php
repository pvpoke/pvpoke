<div id="dev-panel">
	<a class="wrench" href="#"></a>
	<div class="dev-panel-container">
		<h3>Developer Panel</h3>

		<h4>Data</h4>

		<a class="button" href="<?php echo $WEB_ROOT; ?>data/compile.php" target="_blank">Compile gamemaster</a>
		<a class="button dev-default-ivs" href="#">Generate default IV's</a>
		<a class="button dev-shadow-stats" href="#">Update Shadow stats</a>
		<a class="button dev-moveset-csv" href="#">Generate Moveset CSV</a>
		<!--<a class="button dev-validate-family" href="#">Validate Family IDs</a>-->

		<h4>Quick Links</h4>
		<a class="button" href="<?php echo $WEB_ROOT; ?>data/overrideEditor.php">Override Editor</a>
		<a class="button" href="<?php echo $WEB_ROOT; ?>ranker.php">Ranker</a>
		<a class="button" href="<?php echo $WEB_ROOT; ?>rankersandbox.php">Rankersandbox</a>
		<a class="button" href="<?php echo $WEB_ROOT; ?>rss/feedEditor.php">RSS Feed</a>
		<a class="button dev-production-link" href="#">Open page in production</a>
	</div>
</div>

<script>
	// On document ready
	$(function() {

		var gm = GameMaster.getInstance();
		var $devPanel = $("#dev-panel").first();

		// Open and close the developer panel
		$devPanel.find("a.wrench").click(function(e){
			e.preventDefault();
			$devPanel.toggleClass("active");
		});

		// Generate default IV's for Pokemon
		$devPanel.find("a.dev-default-ivs").click(function(e){
			e.preventDefault();
			gm.generateDefaultIVs();
		});

		// Generate default IV's for Pokemon
		$devPanel.find("a.dev-shadow-stats").click(function(e){
			e.preventDefault();
			gm.updateShadowStatus();
		});

		// Validate family IDs
		$devPanel.find("a.dev-validate-family").click(function(e){
			e.preventDefault();
			gm.validateFamilyData();
		});

		// Generate default IV's for Pokemon
		$devPanel.find("a.dev-moveset-csv").click(function(e){
			e.preventDefault();
			gm.generatePokemonMovesetCSV();
		});

		// Open the current page link on production
		$devPanel.find("a.dev-production-link").click(function(e){
			e.preventDefault();

			var pageURL = window.location.href.replace(host, "https://pvpoke.com/");

			window.open(pageURL, '_blank');
		});
	});

</script>
