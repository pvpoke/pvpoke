<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Untitled Document</title>
<script src="../js/libs/jquery-3.3.1.min.js"></script>
</head>


<body>
	<script>
		// Load existing game master
		var gm = [];

		$.getJSON( "../data/gamemaster/pokemon.json", function( data ){
			gm = data;

			console.log(gm);

			loadAppGM();
		});
		// Load app game master file to parse

		function loadAppGM(){
			$.getJSON( "../data/gamemaster/gamemaster-app.json", function( data ){
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
						speciesId = String(settings.form).replace("_NORMAL","").toLowerCase();
					}

					// Search for this pokemon in the existing data

					for(var n = 0; n < gm.length; n++){
						var pokemon = gm[n];

						if((pokemon.speciesId == speciesId)||(pokemon.speciesId == speciesId + "_shadow")||(pokemon.speciesId == speciesId + "_mega")||(pokemon.speciesId == speciesId + "_mega_x")||(pokemon.speciesId == speciesId + "_mega_y")){

							delete pokemon.family;

							var family = {

							};

							if(settings.familyId){
								family.id = settings.familyId;
							}

							if(settings.parentPokemonId){
								var parentId = settings.parentPokemonId.toLowerCase();
								parentId = parentId.replace("_normal", "");

								family.parent = parentId;
							}

							if(settings.evolutionBranch){
								var evolutions = [];

								for(var j = 0; j < settings.evolutionBranch.length; j++){

									if(settings.evolutionBranch[j].evolution){
										var speciesId = settings.evolutionBranch[j].evolution.toLowerCase();

										if(settings.evolutionBranch[j].form){
											settings.evolutionBranch[j].form.toLowerCase();
										}

										speciesId = speciesId.replace("_normal", "");

										evolutions.push(speciesId);
									}
								}

								if(evolutions.length > 0){
									family.evolutions = evolutions;
								}
							}

							if(family.parent || family.evolutions){
								pokemon.family = family;
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
