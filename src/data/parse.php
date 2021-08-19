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

		// Load app game master file to parse

		$.getJSON( "../data/gamemaster/gamemaster-app.json", function( data ){
			var templates = data;
			var pokemon = [];

			console.log(templates);

			for(var i = 0; i < data.length; i++){
				var template = data[i];

				if(! template.data.pokemonSettings){
					continue;
				}

				if( (template.templateId.indexOf("NORMAL") > -1) || (template.templateId.indexOf("SHADOW") > -1) || (template.templateId.indexOf("PURIFIED") > -1)){
					continue;
				}

				// Parse out the dex number from the template Id

				var dexStr = template.templateId.split("_");
				dexStr = dexStr[0].split("V0");
				var dexNumber = parseInt(dexStr[1]);

				var settings = template.data.pokemonSettings;
				var speciesId = settings.pokemonId.toLowerCase();

				if(settings.form){
					speciesId = settings.form.toLowerCase();
				}

				var speciesName = speciesId[0].toUpperCase() + speciesId.substring(1);

				// Gather fast moves and charged moves

				var fastMoves = [];
				var chargedMoves = [];

				// Catch for Smeargle, which doesn't have set moves
				if(settings.quickMoves){
					for(var n = 0; n < settings.quickMoves.length; n++){
						settings.quickMoves[n] = settings.quickMoves[n].replace("_FAST","");
					}

					fastMoves = settings.quickMoves;
					chargedMoves = settings.cinematicMoves;
				}

				// Gather Poekmon types
				var types = ["none", "none"];

				if(settings.type){
					types[0] = settings.type.replace("POKEMON_TYPE_","").toLowerCase();
				}

				if(settings.type2){
					types[1] = settings.type2.replace("POKEMON_TYPE_","").toLowerCase();
				}

				var poke = {
					dex: dexNumber,
					speciesName: speciesName,
					speciesId: speciesId,
					baseStats: {
						atk: settings.stats.baseAttack,
						def: settings.stats.baseDefense,
						hp: settings.stats.baseStamina
					},
					types: types,
					fastMoves: fastMoves,
					chargedMoves: chargedMoves,
					defaultIVs: {
						cp1500: [20, 15, 15, 15],
						cp2500: [20, 15, 15, 15]
					},
					buddyDistance: settings.kmBuddyDistance,
					thirdMoveCost: settings.thirdMove.stardustToUnlock,
					released: false
				};

				pokemon.push(poke);
			}

			console.log(JSON.stringify(pokemon));
		});



	</script>
</body>
</html>
