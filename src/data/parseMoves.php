<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
</head>

<body>
<?php
	
// Get move JSON
	
$str = file_get_contents('gamemaster.json');
	
$json = json_decode($str, true);

// Open the file for reading
if (($h = fopen("chargedmoves.csv", "r")) !== FALSE) 
{
	echo '	"moves": [<br>';
	
	
  // Convert each line into the local $data variable
  while (($data = fgetcsv($h, 1000, ",")) !== FALSE) 
  {	
	  
	 $id = str_replace('_FAST', '', $data[0]);
	  
	// Find original move in game master
	  
	for($i = 0; $i < count($json['moves']); $i++){
		
		$move = $json['moves'][$i];
		
		if($move['moveId'] == $id){
			// Read the data from a single line

			  echo '		{<br>';
			  echo '			"moveId": "' . $id . '",<br>';
			  echo '			"name": "' . $move['name'] . '",<br>';
			  echo '			"type": "' . $move['type'] . '",<br>';
			  echo '			"power": '.$data[1].',<br>';
			  echo '			"energy": '.$data[2].',<br>';
			  echo '			"energyGain": 0,<br>';
			  echo '			"damageWindow": ' . $move['damageWindow'] . ',<br>';
			  echo '			"cooldown": ' . $move['cooldown'] . '<br>';
			  echo '		},<br>';	
		}
	} 
  }
	
	echo ']';

  // Close the file
  fclose($h);
}
	
?>
</body>
</html>