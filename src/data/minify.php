<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
</head>

<body>
<?php

// Quick link to minify gamemaster.json

$str = file_get_contents('gamemaster.json');

$json = json_decode($str, true);

$json = json_encode($json, JSON_UNESCAPED_UNICODE);

file_put_contents('gamemaster.min.json', $json);

echo 'gamemaster minified';
?>
</body>
</html>
