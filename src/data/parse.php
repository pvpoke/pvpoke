<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
</head>

<body>
<?php
	
// Open the file for reading
if (($h = fopen("base_stats.csv", "r")) !== FALSE) 
{
	echo '	"pokemon": [<br>';
	
	
  // Convert each line into the local $data variable
  while (($data = fgetcsv($h, 1000, ",")) !== FALSE) 
  {		
    // Read the data from a single line
	  
	  echo '		{<br>';
	  echo '			"dex": ' . $data[0] . ',<br>';
	  echo '			"speciesName": "' . $data[1] . '",<br>';
	  echo '			"speciesId": "' . strtolower($data[1]) . '",<br>';
	  echo '			"baseStats": { "atk": '.$data[2].', "def": '.$data[3].', "hp": '.$data[4].' },';
	  echo '			"types": ["' . strtolower($data[5]) . '", "' . strtolower($data[6]) . '"],<br>';
	  echo '			"fastMoves": [],<br>';
	  echo '			"chargedMoves": []<br>';
	  echo '		},<br>';
  }
	
	echo ']';

  // Close the file
  fclose($h);
}
	
?>
</body>
</html>