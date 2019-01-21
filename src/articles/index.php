<?php

$META_TITLE = 'Articles';

$META_DESCRIPTION = 'Read up on tips, tricks, and analysis for Pokemon GO PvP.';


require_once '../header.php';
?>

<h1>Articles</h1>
<div class="section home white">
	
	<div class="article-item flex">
		<div class="col-3">
			<a href="<?php echo $WEB_ROOT; ?>articles/hoenn-pokemon-hunt-pvp/">
				<img src="<?php echo $WEB_ROOT; ?>assets/articles/hoenn-thumb.jpg" />
			</a>
		</div>
		<div class="col-9">
			<h4><a href="<?php echo $WEB_ROOT; ?>articles/hoenn-pokemon-hunt-pvp/">Hoenn Pokemon to Hunt for PvP</a></h4>
			<div class="date">January 21, 2019</div>
			<p>Which Hoenn Pokemon should you keep an eye out for to use in PvP during the Hoenn event? Take a look at this list to prepare for your Pokemon hunts!</p>
		</div>
		
	</div>
	
</div>

<?php require_once '../footer.php'; ?>