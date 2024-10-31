<?php

$CANONICAL = '/settings/';

$META_TITLE = 'Site Settings';

$META_DESCRIPTION = 'Adjust your settings and preferences for the site.';

require_once 'header.php';

?>

<h1>Settings</h1>
<div class="section moves white">
	<p>Adjust your site preferences below. These will be saved in a cookie to your device.</p>

	<div class="settings">
		<h3>Default Pokemon Preferences</h3>
		<select class="input" id="default-ivs">
			<option value="gamemaster" <?php if($_SETTINGS->defaultIVs == "gamemaster") : ?>selected<?php endif; ?>>Typical IV's (~Rank 500)</option>
			<option value="maximize" <?php if($_SETTINGS->defaultIVs == "maximize") : ?>selected<?php endif; ?>>Maximum stat product (Rank 1)</option>
		</select>
		<p>Currently, this will choose which IV's to set for Pokemon you select in Single Battle, Multi-Battle, and the Team Builder. Opponents in Multi-Battle and the Team Builder will still use the "typical" IV's.</p>

		<h3>Pokebox</h3>
		<p>PvPoke integrates with <a target="_blank" href="https://www.pokebattler.com/" class="pokebattler">Pokebattler</a> so you can permanently store your Pokemon and import them anywhere on the site. Enter your Pokebattler account ID below to link your Pokebox:</p>
		<input type="text" class="input" id="pokebox-id" <?php if(isset($_SETTINGS->pokeboxId)) : ?>value="<?php echo intval($_SETTINGS->pokeboxId); ?>"<?php endif; ?> />

		<h3>XL Pokemon</h3>
		<div class="check xls <?php if($_SETTINGS->xls == 1) : ?>on<?php endif; ?>"><span></span> Show XL Pokemon</div>
		<p>Choose whether to show Pokemon over Level 40 in the primary rankings or Team Builder results. You can temporarily toggle them on the respective pages.</p>

		<h3>Advertisements</h3>
		<div class="check ads <?php if($_SETTINGS->ads == 1) : ?>on<?php endif; ?>"><span></span> Show ads</div>
		<p>Ads help support the site and the Pokemon GO community!</p>

		<h3>Battle Timeline</h3>
		<div class="check animate-timeline <?php if($_SETTINGS->animateTimeline == 1) : ?>on<?php endif; ?>"><span></span> Animate after generating results</div>

		<h3>Ranking Details Display</h3>
		<p>Select how to display a Pokemon's stats, moves, matchups, and other details on the rankings pages.</p>
		<select class="input" id="ranking-details">
			<option value="one-page" <?php if((isset($_SETTINGS->rankingDetails))&&($_SETTINGS->rankingDetails == "one-page")) : ?>selected<?php endif; ?>>One Page</option>
			<option value="tabs" <?php if((isset($_SETTINGS->rankingDetails))&&($_SETTINGS->rankingDetails == "tabs")) : ?>selected<?php endif; ?>>Tabs</option>
		</select>

		<h3>Hard Moveset Links</h3>
		<div class="check hard-moveset-links <?php if($_SETTINGS->hardMovesetLinks == 1) : ?>on<?php endif; ?>"><span></span> Bake move ID's into battle links</div>
		<p>This setting is for article writing purposes. When active, movesets are hard coded into the URL so battle links are preserved during future moveset updates.</p>

		<h3>Site Theme</h3>
		<?php
		$theme = "default";

		if(isset($_SETTINGS->theme)){
			$theme = $_SETTINGS->theme;
		}
		?>
		<div>
			<select class="input" id="theme-select">
				<option value="default" <?php if($theme == "default") : ?>selected<?php endif; ?>>Default</option>
				<option value="night" <?php if($theme == "night") : ?>selected<?php endif; ?>>Night</option>
			</select>
		</div>

		<h3>Colorblind Mode</h3>
		<div class="check colorblindMode <?php if($_SETTINGS->colorblindMode == 1) : ?>on<?php endif; ?>"><span></span> Colorblind mode</div>
		<p>Increase contrast for battle rating colors, symbols, and tables.</p>

		<table class="rating-table" cellspacing="0">
			<tbody><tr>
				<td><a href="javascript:void(0)" class="rating margin-6 loss"><span></span>200</a></td>
				<td><a href="javascript:void(0)" class="rating margin-6 close-loss"><span></span>400</a></td>
				<td><a href="javascript:void(0)" class="rating margin-6 tie"><span></span>500</a></td>
				<td><a href="javascript:void(0)" class="rating margin-6 close-win"><span></span>600</a></td>
				<td><a href="javascript:void(0)" class="rating margin-6 win"><span></span>800</a></td>
			</tr>
		</tbody></table>

		<h3>Performance Mode</h3>
		<div class="check performanceMode <?php if($_SETTINGS->performanceMode == 1) : ?>on<?php endif; ?>"><span></span> Performance mode</div>
		<p>Improve CPU performance on the Rankings page. Enable this if you experience lag or freezes on your browser. This feature disabled the Suggested Teammates and Similar Pokemon lists in the ranking details.</p>

		<h3>Gamemaster Version</h3>
		<p>Select the current Pokemon and move values, either the default values or an alternative set.</p>
		<?php
		$gamemaster = "gamemaster";

		if(isset($_SETTINGS->gamemaster)){
			$gamemaster = $_SETTINGS->gamemaster;
		}
		?>
		<div>
			<select class="input" id="gm-select">
				<option value="gamemaster" <?php if($gamemaster == "gamemaster") : ?>selected<?php endif; ?>>Default</option>
				<option value="gamemaster-mega" <?php if($gamemaster == "gamemaster-mega") : ?>selected<?php endif; ?>>Mega Evolutions (Speculative)</option>
				<option value="gamemaster-paldea" <?php if($gamemaster == "gamemaster-paldea") : ?>selected<?php endif; ?>>Generation 9 (Speculative)</option>
			</select>
		</div>

		<div class="save button">Save Settings</div>
	</div>
</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/Settings.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=<?php echo $SITE_VERSION; ?>"></script>


<?php require_once 'footer.php'; ?>
