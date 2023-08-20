<?php
header('Content-Type: application/json; charset=utf-8');

require_once '../../modules/config.php';

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
$mysqli->set_charset('utf8');

$mysqli->close();

echo json_encode($_POST);
 ?>
