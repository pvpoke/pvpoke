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

		<h3>Battle Timeline</h3>
		<div class="check animate-timeline <?php if($_SETTINGS->animateTimeline == 1) : ?>on<?php endif; ?>"><span></span> Animate after generating results</div>

		<div class="save button">Save Settings</div>
	</div>
</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/Settings.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/RankingMain.js?v=<?php echo $SITE_VERSION; ?>"></script>


<?php require_once 'footer.php'; ?>
