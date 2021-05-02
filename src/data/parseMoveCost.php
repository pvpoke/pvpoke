<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
<script src="../js/libs/jquery-3.3.1.min.js"></script>
</head>


<body>
	<script>
		/* This file parses the game master file from the app and adapts Pokemon entries into the format the site uses. */
		// Load existing game master
		var gm = [];

		$.getJSON( "../data/gamemaster.json", function( data ){
			gm = data;

			console.log(data);

			loadAppGM();
		});
		// Load app game master file to parse

		function loadAppGM(){
			$.getJSON( "../data/gamemaster-app.json", function( data ){
				var templates = data;

				console.log(templates);

				for(var i = 0; i < data.length; i++){
					var template = data[i];

					if(! template.data.pokemonSettings){
						continue;
					}

					if( (template.templateId.indexOf("SHADOW") > -1) || (template.templateId.indexOf("PURIFIED") > -1)){
						continue;
					}

					// Parse out speciesId

					var settings = template.data.pokemonSettings;
					var speciesId = settings.pokemonId.replace("_NORMAL","").toLowerCase();

					if(settings.form){
						speciesId = settings.form.replace("_NORMAL","").toLowerCase();
					}

					// Search for this pokemon in the existing data

					for(var n = 0; n < gm.pokemon.length; n++){
						var pokemon = gm.pokemon[n];

						if((pokemon.speciesId == speciesId)||(pokemon.speciesId == speciesId + "_shadow")||(pokemon.speciesId == speciesId + "_mega")||(pokemon.speciesId == speciesId + "_mega_x")||(pokemon.speciesId == speciesId + "_mega_y")){

							if(settings.kmBuddyDistance){
								pokemon.buddyDistance = settings.kmBuddyDistance;
							}

							if(settings.thirdMove){
								pokemon.thirdMoveCost = settings.thirdMove.stardustToUnlock;
							}

							continue;
						}
					}
				}

				console.log(JSON.stringify(gm));
			});
		}



	</script>
</body>
</html>
