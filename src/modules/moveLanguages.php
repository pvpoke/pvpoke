<?php

function getMoveLanguages(){
	$indexPath = __DIR__ . '/../data/locales/moves/index.json';
	$index = [];
	$languages = [];

	if(is_readable($indexPath)){
		$decodedIndex = json_decode(file_get_contents($indexPath), true);

		if(is_array($decodedIndex)){
			$index = $decodedIndex;
		}
	}

	if(isset($index['locales']) && is_array($index['locales'])){
		foreach($index['locales'] as $locale){
			if(
				isset($locale['code'], $locale['name']) &&
				preg_match('/^[a-z]{2}(?:-[a-z]{2})?$/', $locale['code'])
			){
				$languages[$locale['code']] = $locale['name'];
			}
		}
	}

	return count($languages) > 0 ? $languages : ['en' => 'English'];
}

?>
