<?php require_once '../modules/config.php';
$SITE_VERSION = '1.3.11';

/*****************************************************************************

=============================TERAAAAAAAAAAAAAAAA==============================


******************************************************************************/

// This prevents caching on local testing
if (strpos($WEB_ROOT, 'src') !== false) {
    $SITE_VERSION = rand(1,1000) . '.' . rand(1,1000) . '.' . rand(1,1000);
}
?>

<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php
if(! isset($META_TITLE)){
	$META_TITLE = 'Tera Raid Counter Calculator | PvPoke';
} else{
	$META_TITLE = $META_TITLE . ' | PvPoke';
}

if(! isset($META_DESCRIPTION)){
	$META_DESCRIPTION = 'Find the best Pokemon, typings, and Tera types to use against Tera Raid bosses in Pokemon Scarlet & Pokemon Violet.';
}

if(! isset($OG_IMAGE)){
	$OG_IMAGE = 'https://pvpoke.com/tera/img/og.jpg';
}

// Initialize settings object
if(isset($_COOKIE['settings'])){
	$_SETTINGS = json_decode($_COOKIE['settings']);

	// Fill in missing settings with defaults
	if(! isset($_SETTINGS->ads)){
		$_SETTINGS->ads = 1;
	}
} else{
	$_SETTINGS = (object) [
		'ads' => 1
	];
}
?>

<title><?php echo $META_TITLE; ?></title>
<meta name="description" content="<?php echo $META_DESCRIPTION; ?>" />

<?php if(isset($CANONICAL)): ?>
	<link rel="canonical" href="<?php echo htmlspecialchars($CANONICAL); ?>" /><!--Prevents Google from indexing hundreds of different versions of the same page-->
<?php endif; ?>

<!--OG tags for social-->
<meta property="og:title" content="<?php echo $META_TITLE; ?>" />
<meta property="og:description" content="<?php echo $META_DESCRIPTION; ?>" />
<meta property="og:image" content="<?php echo $OG_IMAGE; ?>" />

<meta name="apple-mobile-web-app-capable">
<meta name="mobile-web-app-capable">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="manifest" href="<?php echo $WEB_ROOT; ?>data/manifest.json?v=3">


<link id="favicon" rel="icon" href="<?php echo $WEB_ROOT; ?>img/favicon.png">

<link rel="stylesheet" type="text/css" href="<?php echo $WEB_ROOT; ?>tera/css/tera-style.css?v=7">

<script src="<?php echo $WEB_ROOT; ?>js/libs/jquery-3.3.1.min.js"></script>

<?php require_once('../modules/analytics.php'); ?>

<script>
	// Host for link reference

	var host = "<?php echo $WEB_HOST; ?>";
	var webRoot = "<?php echo $WEB_ROOT; ?>";
	var siteVersion = "<?php echo $SITE_VERSION; ?>";

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
			<a href="<?php echo $WEB_ROOT; ?>tera"><img src="<?php echo $WEB_ROOT; ?>img/themes/sunflower/header-white.png" title="PvPoke.com" /></a>
			<a class="home-link" href="<?php echo $WEB_ROOT; ?>">Back to main site</a>
		</div>
	</header>
	<div class="main-wrap">
		<div id="main">
