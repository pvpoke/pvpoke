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

					// Gather Elite Fast and Charged Moves

					var fastMoves = [];
					var chargedMoves = [];

					if(settings.eliteQuickMove){
						for(var n = 0; n < settings.eliteQuickMove.length; n++){
							settings.eliteQuickMove[n] = settings.eliteQuickMove[n].replace("_FAST","");
						}

						fastMoves = settings.eliteQuickMove;
					}

					// Catch for Smeargle, which doesn't have set moves
					if(settings.eliteCinematicMove){
						chargedMoves = settings.eliteCinematicMove;

						console.log(speciesId);
					}

					// Search for this pokemon in the existing data

					for(var n = 0; n < gm.pokemon.length; n++){
						var pokemon = gm.pokemon[n];
						if(pokemon.speciesId == speciesId){
							var eliteMoves = [];

							// Add elite moves to movepool if not already there
							for(var j = 0; j < fastMoves.length; j++){
								if(pokemon.fastMoves.indexOf(fastMoves[j]) == -1){
									pokemon.fastMoves.push(fastMoves[j]);
								}

								eliteMoves.push(fastMoves[j]);
							}

							// Add elite moves to movepool if not already there
							for(var j = 0; j < chargedMoves.length; j++){
								if(pokemon.chargedMoves.indexOf(chargedMoves[j]) == -1){
									pokemon.chargedMoves.push(chargedMoves[j]);
								}
								eliteMoves.push(chargedMoves[j]);
							}

							if(eliteMoves.length > 0){
								pokemon.eliteMoves = eliteMoves;

								// Remove Elite moves from the legacy move list
								if(pokemon.legacyMoves){
									for(var j = 0; j < pokemon.legacyMoves.length; j++){

										// Remove any elite moves from the legacy move list
										if(pokemon.eliteMoves.indexOf(pokemon.legacyMoves[j]) > -1){
											pokemon.legacyMoves.splice(j, 1);
											j--;
										}
									}

									if(pokemon.legacyMoves.length == 0){
										delete pokemon.legacyMoves;
									}
								}
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
