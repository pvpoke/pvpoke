<?php

$META_TITLE = 'Articles';

$META_DESCRIPTION = 'Read up on tips, tricks, and analysis for Pokemon GO PvP.';


require_once '../header.php';
?>

<h1>Articles</h1>
<div class="section home white">

	<input type="text" class="article-search" placeholder="Search title or tag" />

	<div class="articles"></div>
	<?php require_once '../modules/articlepreview.php'; ?>

	<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/interface/ArticlesInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
	<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

</div>

<?php require_once '../footer.php'; ?>
