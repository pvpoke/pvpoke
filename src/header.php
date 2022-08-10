<?php require_once 'modules/config.php';
$SITE_VERSION = '1.29.4.5';

// This prevents caching on local testing
if (strpos($WEB_ROOT, 'src') !== false) {
    $SITE_VERSION = rand(1,1000) . '.' . rand(1,1000) . '.' . rand(1,1000);
}

// Initialize settings object
if(isset($_COOKIE['settings'])){
	$_SETTINGS = json_decode($_COOKIE['settings']);

	// Fill in missing settings with defaults
	if(! isset($_SETTINGS->matrixDirection)){
		$_SETTINGS->matrixDirection = "row";
	}

	// Fill in missing settings with defaults
	if(! isset($_SETTINGS->gamemaster)){
		$_SETTINGS->gamemaster = "gamemaster";
	}

	if(! isset($_SETTINGS->pokeboxId)){
		$_SETTINGS->pokeboxId = false;
	}

	if(! isset($_SETTINGS->pokeboxLastDateTime)){
		$_SETTINGS->pokeboxLastDateTime = 0;
	}

	if(! isset($_SETTINGS->ads)){
		$_SETTINGS->ads = 1;
	}

	if(! isset($_SETTINGS->xls)){
		$_SETTINGS->xls = 1;
	}

	if(! isset($_SETTINGS->rankingDetails)){
		$_SETTINGS->rankingDetails = "one-page";
	}

	if(! isset($_SETTINGS->hardMovesetLinks)){
		$_SETTINGS->hardMovesetLinks = 0;
	}

	// Validate the gamemaster setting, only allow these options
	$gamemasters = ["gamemaster", "gamemaster-mega"];

	if(! in_array($_SETTINGS->gamemaster, $gamemasters)){
		$_SETTINGS->gamemaster = "gamemaster";
	}
} else{
	$_SETTINGS = (object) [
		'defaultIVs' => "gamemaster",
		'animateTimeline' => 1,
		'theme' => 'default',
		'gamemaster' => 'gamemaster',
		'pokeboxId' => 0,
		'ads' => 1,
		'xls' => 1,
		'rankingDetails' => 'one-page',
		'hardMovesetLinks' => 0
	];
}

$performGroupMigration = false;

if(! isset($_COOKIE['migrate'])){
	$performGroupMigration = true;

	setcookie('migrate', 'true', time() + (5 * 365 * 24 * 60 * 60), '/');
}

?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php
if(! isset($META_TITLE)){
	$META_TITLE = 'PvPoke | Open-Source Battle Simulator, Rankings &amp; Team Building for Pokemon GO PvP';
} else{
	$META_TITLE = $META_TITLE . ' | PvPoke';
}

if(! isset($META_DESCRIPTION)){
	$META_DESCRIPTION = 'Looking for an edge in Pokemon GO Trainer Battles? Become a master with our open-source Pokemon battle simulator, explore the top Pokemon rankings, and get your team rated for PvP battles.';
}

if(! isset($OG_IMAGE)){
	$OG_IMAGE = 'https://pvpoke.com/img/og.jpg';
}
?>

<title><?php echo $META_TITLE; ?></title>
<meta name="description" content="<?php echo $META_DESCRIPTION; ?>" />

<?php if(isset($CANONICAL)): ?>
	<link rel="canonical" href="<?php echo $CANONICAL; ?>" /><!--Prevents Google from indexing hundreds of different versions of the same page-->
<?php endif; ?>

<!--OG tags for social-->
<meta property="og:title" content="<?php echo $META_TITLE; ?>" />
<meta property="og:description" content="<?php echo $META_DESCRIPTION; ?>" />
<meta property="og:image" content="<?php echo $OG_IMAGE; ?>" />

<meta name="apple-mobile-web-app-capable">
<meta name="mobile-web-app-capable">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="manifest" href="<?php echo $WEB_ROOT; ?>data/manifest.json?v=2">

<?php if(strpos($_SERVER['REQUEST_URI'], 'team-builder') !== false): ?>
	<link id="favicon" rel="icon" href="<?php echo $WEB_ROOT; ?>img/favicon_team_builder.png">
<?php elseif(strpos($_SERVER['REQUEST_URI'], 'rankings') !== false): ?>
	<link id="favicon" rel="icon" href="<?php echo $WEB_ROOT; ?>img/favicon_rankings.png">
<?php elseif(strpos($_SERVER['REQUEST_URI'], 'matrix') !== false): ?>
	<link id="favicon"  rel="icon" href="<?php echo $WEB_ROOT; ?>img/favicon_matrix.png">
<?php else: ?>
	<link id="favicon" rel="icon" href="<?php echo $WEB_ROOT; ?>img/favicon.png">
<?php endif; ?>

<link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>css/style.css?v=143">

<?php if(strpos($META_TITLE, 'Train') !== false): ?>
	<link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>css/train.css?v=20">
<?php endif; ?>

<?php if(strpos($_SERVER['REQUEST_URI'], 'articles') !== false): ?>
	<link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>css/article-extras.css?v=6">
<?php endif; ?>

<?php if((isset($_SETTINGS->theme))&&($_SETTINGS->theme != "default")): ?>
	<link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>css/themes/<?php echo $_SETTINGS->theme; ?>.css?v=21">
<?php endif; ?>

<script src="<?php echo $WEB_ROOT; ?>js/libs/jquery-3.3.1.min.js"></script>

<?php require_once('modules/analytics.php'); ?>

<script>
	// Host for link reference

	var host = "<?php echo $WEB_HOST; ?>";
	var webRoot = "<?php echo $WEB_ROOT; ?>";
	var siteVersion = "<?php echo $SITE_VERSION; ?>";

	<?php if(isset($_COOKIE['settings'])) : ?>
		var settings = {
			defaultIVs: "<?php echo htmlspecialchars($_SETTINGS->defaultIVs); ?>",
			animateTimeline: <?php echo htmlspecialchars($_SETTINGS->animateTimeline); ?>,
			matrixDirection: "row",
			gamemaster: "<?php echo htmlspecialchars($_SETTINGS->gamemaster); ?>",
			pokeboxId: "<?php echo intval($_SETTINGS->pokeboxId); ?>",
			pokeboxLastDateTime: "<?php echo intval($_SETTINGS->pokeboxLastDateTime); ?>",
			xls: <?php echo $_SETTINGS->xls; ?>,
			rankingDetails: "<?php echo htmlspecialchars($_SETTINGS->rankingDetails); ?>",
			hardMovesetLinks: <?php echo intval($_SETTINGS->hardMovesetLinks); ?>
		};
	<?php else: ?>

		var settings = {
			defaultIVs: "gamemaster",
			animateTimeline: 1,
			matrixDirection: "row",
			gamemaster: "gamemaster",
			pokeboxId: 0,
			pokeboxLastDateTime: 0,
			xls: true,
			rankingDetails: "one-page",
			hardMovesetLinks: 0
		};

	<?php endif; ?>

	// If $_GET request exists, output as JSON into Javascript

	<?php
	foreach($_GET as &$param){
		$param = htmlspecialchars($param);
	}


	if($_GET){
		echo 'var get = ' . json_encode($_GET) . ';';
	} else{
		echo 'var get = false;';
	}
	?>
</script>

	<?php require_once 'modules/ads/base-code.php'; ?>

</head>

<body>
	<header>
		<div class="header-wrap">
			<h1 class="title"><a href="/">PvPoke.com</a></h1>
			<div class="hamburger">
				<!--Because I'm too lazy to make a graphic-->
				<div class="meat"></div>
				<div class="meat"></div>
				<div class="meat"></div>
			</div>
			<div class="menu">
				<a class="icon-battle" href="<?php echo $WEB_ROOT; ?>battle/">Battle</a>
				<div class="parent-menu">
					<a class="icon-train" href="<?php echo $WEB_ROOT; ?>train/">Train</a>
					<div class="submenu">
						<div class="submenu-wrap">
							<a class="icon-rankings" href="<?php echo $WEB_ROOT; ?>train/analysis/">Top Performers</a>
						</div>
					</div>
				</div>
				<div class="parent-menu">
					<a class="icon-rankings" href="<?php echo $WEB_ROOT; ?>rankings/">Rankings</a>
					<div class="submenu">
						<div class="submenu-wrap">
							<a class="icon-rankings" href="<?php echo $WEB_ROOT; ?>custom-rankings/">Custom Rankings</a>
						</div>
					</div>
				</div>
				<a class="icon-team" href="<?php echo $WEB_ROOT; ?>team-builder/">Team Builder</a>
				<div class="parent-menu">
					<a class="more desktop" href="#"></a>
					<div class="submenu">
						<div class="submenu-wrap">
							<a class="icon-moves" href="<?php echo $WEB_ROOT; ?>moves/">Moves</a>
							<a class="icon-articles" href="<?php echo $WEB_ROOT; ?>articles/">Articles</a>
							<a class="icon-contribute" href="<?php echo $WEB_ROOT; ?>contribute/">Contribute</a>
							<a class="icon-settings" href="<?php echo $WEB_ROOT; ?>settings/">Settings</a>
							<a class="icon-twitter" href="https://twitter.com/pvpoke" target="_blank">Twitter</a>
							<a class="icon-unite" href="https://unite.pvpoke.com">PvPoke Unite</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>
	<div class="main-wrap">
		<div id="main">
			<div class="hide mega-warning"><b>Stats for unreleased Mega Evolutions are speculative. Don't invest any resources until they're officially released.</b></div>
