// JavaScript Document

var GameMaster = (function () {
    var instance;

    function createInstance(interface) {
        var object = new Object();

		object.data = {};
		object.rankings = [];
		object.groups = [];
		object.teamPools = [];
		object.loadedData = 0;

		$.getJSON( webRoot+"data/gamemaster.json?v=198", function( data ){
			object.data = data;

			// Sort Pokemon alphabetically for searching
			object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

			InterfaceMaster.getInstance().init(object);
		});

		// Return a Pokemon object given species ID

		object.getPokemonById = function(id){
			var pokemon;

			$.each(object.data.pokemon, function(index, poke){

				if(poke.speciesId == id){
					pokemon = poke;
					return;
				}
			});

			return pokemon;
		}

		// Iterate through the Pokemon entries and apply shadow Pokemon traits

		object.updateShadowStatus = function(){

			$.each(object.data.pokemon, function(index, poke){
				var battle = new Battle();

				var pokemon = new Pokemon(poke.speciesId, 0, battle);
				var entry = object.getPokemonById(poke.speciesId);
				battle.setNewPokemon(pokemon, 0, false);

				if(object.data.shadowPokemon.indexOf(poke.speciesId) > -1){
					entry.shadow = true;

					// Remove Return and Frustration if they already exist
					for(var i = 0; i < entry.chargedMoves.length; i++){
						if((entry.chargedMoves[i] == "RETURN")||(entry.chargedMoves[i] == "FRUSTRATION")){
							entry.chargedMoves.splice(i, 1);
							i--;
						}
					}

					// Remove Return and Frustration if they already exist
					if(entry.legacyMoves){
						for(var i = 0; i < entry.legacyMoves.length; i++){
							if((entry.legacyMoves[i] == "RETURN")||(entry.legacyMoves[i] == "FRUSTRATION")){
								entry.legacyMoves.splice(i, 1);
								i--;
							}
						}

						if(entry.legacyMoves.length == 0){
							delete entry.legacyMoves;
						}
					}


					// Get CP at level 25
					var cp = pokemon.calculateCP(0.667934, 0, 0, 0);
					entry.level25CP = cp;
				}
			});

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

			var json = JSON.stringify(object.data);

			console.log(json);
		}

		// Iterate through the Pokemon entries and generate default IV's

		object.generateDefaultIVs = function(){

			$.each(object.data.pokemon, function(index, poke){
				var leagues = [1500,2500];
				var battle = new Battle();

				var pokemon = new Pokemon(poke.speciesId, 0, battle);
				var entry = object.getPokemonById(poke.speciesId);
				battle.setNewPokemon(pokemon, 0, false);

				var defaultIVs = {
					cp1500: [],
					cp2500: []
				};

				for(var i = 0; i < leagues.length; i++){
					battle.setCP(leagues[i]);

					var cp = pokemon.calculateCP(.79030001, 15, 15, 15);

					if(cp > leagues[i]){
						var combinations = pokemon.generateIVCombinations("overall", 1, 4096);
						var defaultIndex = Math.floor(combinations.length * .12207);

						var level = combinations[defaultIndex].level;
						var ivs = combinations[defaultIndex].ivs;
						var combination = [level, ivs.atk, ivs.def, ivs.hp];

						defaultIVs["cp"+leagues[i]] = combination;
					} else{
						defaultIVs["cp"+leagues[i]] = [40, 15, 15, 15];
					}
				}

				entry.defaultIVs = defaultIVs;
			});

			var json = JSON.stringify(object.data);

			console.log(json);
		}

		// Return a move object from the GameMaster file given move ID

		object.getMoveById = function(id){
			var move;

			$.each(object.data.moves, function(index, m){

				if(m.moveId == id){

					// Generate move abbreviation

					var arr = m.moveId.split('_');
					var abbreviation = '';

					for(var i = 0; i < arr.length; i++){
						abbreviation += arr[i].charAt(0);
					}

					move = {
						moveId: m.moveId,
						name: m.name,
						abbreviation: abbreviation,
						type: m.type,
						power: m.power,
						energy: m.energy,
						energyGain: m.energyGain,
						cooldown: m.cooldown
					};

					if(m.buffs){
						move.buffs = m.buffs;
						move.buffApplyChance = parseFloat(m.buffApplyChance);
						move.buffTarget = m.buffTarget;
					}

					return;
				}
			});

			if(!move){
				console.log(id + " missing");
			}

			return move;
		}

		// Return a cup object given an id name

		object.getCupById = function(id){
			var cup;

			$.each(object.data.cups, function(index, c){
				if(c.name == id){
					cup = c;
				}
			});

			return cup;
		}

		// Load and return ranking data JSON

		object.loadRankingData = function(caller, category, league, cup){

			var key = cup + "" + category + "" + league;

			if(! object.rankings[key]){
				var file = webRoot+"data/"+cup+"/"+category+"/"+"rankings-"+league+".json?v=198";

				$.getJSON( file, function( data ){
					object.rankings[key] = data;
					object.loadedData++;

					caller.displayRankingData(data);
				});
			} else{
				caller.displayRankingData(object.rankings[key]);
			}
		}

		// Load quick fill group JSON

		object.loadGroupData = function(caller, group){

			var key = group;

			if(! object.groups[key]){
				var file = webRoot+"data/groups/"+group+".json?v=198";

				$.getJSON( file, function( data ){

					// Sort alphabetically

					data.sort((a,b) => (a.speciesId > b.speciesId) ? 1 : ((b.speciesId > a.speciesId) ? -1 : 0));

					object.groups[key] = data;
					caller.quickFillGroup(data);
				});
			} else{
				caller.quickFillGroup(object.groups[key]);
			}
		}

		// Load team pool JSON for AI team generation

		object.loadTeamData = function(league, cup, callback){

			var key = league + "" + cup;

			if(! object.teamPools[key]){
				var file = webRoot+"data/training/teams/"+cup+"/"+league+".json?v=198";

				$.getJSON( file, function( data ){
					object.teamPools[key] = data;
					callback(league, cup, data);
				});
			} else{
				callback(league, cup, object.teamPools[key]);
			}
		}


		// Modify a Pokemon data entry

		object.modifyPokemonEntry = function(id, type, props){
			$.each(object.data.pokemon, function(index, poke){

				if(poke.speciesId == id){

					switch(type){
						case "movepool":

							var movepool = (props.moveType == "fast") ? poke.fastMoves : poke.chargedMoves;
							movepool.push(props.moveId);

							break;
					}
				}
			});
		}

		// Return a list of eligible Pokemon given a Battle object, and include and exclude filters

		object.generateFilteredPokemonList = function(battle, include, exclude, rankingData, overrides){
			// Gather all eligible Pokemon

			var minStats = 3000; // You must be this tall to ride this ride

			if(battle.getCP() == 1500){
				minStats = 1250;
			} else if(battle.getCP() == 2500){
				minStats = 2000;
			}

			var bannedList = ["mewtwo","mewtwo_armored","giratina_altered","groudon","kyogre","rayquaza","palkia","dialga","heatran","giratina_origin","darkrai","cobalion","terrakion","virizion"];
			var permaBannedList = ["rotom","rotom_fan","rotom_frost","rotom_heat","rotom_mow","rotom_wash","phione","manaphy","shaymin_land","shaymin_sky","arceus","arceus_bug","arceus_dark","arceus_dragon","arceus_electric","arceus_fairy","arceus_fighting","arceus_fire","arceus_flying","arceus_ghost","arceus_grass","arceus_ground","arceus_ice","arceus_poison","arceus_psychic","arceus_rock","arceus_steel","arceus_water","kecleon","zigzagoon_galarian","linoone_galarian"]; // Don't rank these Pokemon at all yet

			var maxDexNumber = 493;
			var releasedGen5 = ["snivy","servine","serperior","tepig","pignite","emboar","oshawott","dewott","samurott","lillipup","herdier","stoutland","purrloin","liepard","pidove","tranquill","unfezant","blitzle","zebstrika","foongus","amoonguss","drilbur","excadrill","litwick","lampent","chandelure","golett","golurk","deino","zweilous","hydreigon","pansage","panpour","pansear","simisage","simipour","simisear","ferroseed","ferrothorn","heatmor","durant","patrat","watchog","klink","klang","klinklang","yamask","cofagrigus","cobalion","terrakion","virizion","cryogonal","cubchoo","beartic","meltan","melmetal"];

			// Aggregate filters

			var filterLists = [
				include,
				exclude
			];

			var pokemonList = [];

			for(var i = 0; i < object.data.pokemon.length; i++){

				var pokemon = new Pokemon(object.data.pokemon[i].speciesId, 0, battle);
				pokemon.initialize(battle.getCP());

				var stats = (pokemon.stats.hp * pokemon.stats.atk * pokemon.stats.def) / 1000;

				if(stats >= minStats){
					// Process all filters
					var allowed = false;
					var includeIDFilter = false; // Flag to see if an ID filter should override other filters

					for(var n = 0; n < filterLists.length; n++){
						var filters = filterLists[n];
						var include = (n == 0);
						var filtersMatched = 0;
						var requiredFilters = filters.length;

						for(var j = 0; j < filters.length; j++){
							var filter = filters[j];

							switch(filter.filterType){
								case "type":

									if((filter.values.indexOf(pokemon.types[0]) > -1) || (filter.values.indexOf(pokemon.types[1]) > -1)){
										filtersMatched++;
									}
									break;

								case "dex":
									if((pokemon.dex >= filter.values[0])&&(pokemon.dex <= filter.values[1])){
										filtersMatched++;
									}
									break;

								case "tag":
									for(var k = 0; k < filter.values.length; k++){
										if(pokemon.hasTag(filter.values[k])){
											filtersMatched++;
										}
									}
									break;

								case "id":
									if((include)&&(filters.length > 1)){
										requiredFilters--;
									}

									if(filter.values.indexOf(pokemon.speciesId) > -1){
										filtersMatched += filters.length; // If a Pokemon is explicitly included, ignore all other filters

										if(include){
											includeIDFilter = true;
										}
									}
									break;
							}
						}

						// Only include Pokemon that match all of the include filters

						if((include)&&(filtersMatched >= requiredFilters)){
							allowed = true;
						}

						// Only include releasedGen 5  Pokemon

						if((pokemon.dex > maxDexNumber)&&(releasedGen5.indexOf(pokemon.speciesId) == -1)&&(battle.getCup().name != "gen-5")){
							allowed = false;
						}

						// Exclude Pokemon that match any of the exclude filters

						if((! include)&&(filtersMatched > 0)&&(! includeIDFilter)){
							allowed = false;
						}
					}

					if((battle.getCP() == 1500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
						allowed = false;
					}

					if(permaBannedList.indexOf(pokemon.speciesId) > -1){
						allowed = false;
					}

					if(allowed){

						// If data is available, force "best" moveset

						if((rankingData)&&(overrides)){

							// Find Pokemon in existing rankings
							for(var n = 0; n < rankingData.length; n++){
								if(pokemon.speciesId == rankingData[n].speciesId){

									// Sort by uses
									var fastMoves = rankingData[n].moves.fastMoves;
									var chargedMoves = rankingData[n].moves.chargedMoves;

									fastMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
									chargedMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

									pokemon.selectMove("fast", fastMoves[0].moveId);
									pokemon.selectMove("charged", chargedMoves[0].moveId, 0);

									pokemon.weightModifier = 1;

									if(chargedMoves.length > 1){
										pokemon.selectMove("charged", chargedMoves[1].moveId, 1);
									}

									object.overrideMoveset(pokemon, battle.getCP(), battle.getCup().name, overrides);
								}
							}
						}

						pokemonList.push(pokemon);
					}
				}
			}

			return pokemonList;
		}

		// Generate a list of Pokemon given a search string

		object.generatePokemonListFromSearchString = function(str){
			// Break the search string up into queries
			var str = str.replace(/, /g, '').toLowerCase();
			var queries = str.split(',');
			var results = []; // Store an array of qualifying Pokemon ID's

			var types = ["bug","dark","dragon","electric","fairy","fighting","fire","flying","ghost","grass","ground","ice","normal","poison","psychic","rock","steel","water"];
			var battle = new Battle();

			for(var i = 0; i < queries.length; i++){
				var query = queries[i];
				var params = query.split('&');

				for(var n = 0; n < object.data.pokemon.length; n++){
					var pokemon = new Pokemon(object.data.pokemon[n].speciesId, 0, battle);
					var paramsMet = 0;

					for(var j = 0; j < params.length; j++){
						var param = params[j];
						var isNot = false;
						var valid = false;

						if(param.length == 0){
							if(params.length == 1){
								paramsMet++;
							}
							continue;
						}

						if((param.charAt(0) == "!")&&(param.length > 1)){
							isNot = true;
							param = param.substr(1, param.length-1);
						}

						// Move search
						if((param.charAt(0) == "@")&&(param.length > 2)){
							param = param.substr(1, param.length-1);

							for(var k = 0; k < pokemon.fastMovePool.length; k++){
								if((pokemon.fastMovePool[k].name.toLocaleLowerCase().startsWith(param))||(pokemon.fastMovePool[k].type == param)){
									valid = true;
								}
							}

							for(var k = 0; k < pokemon.chargedMovePool.length; k++){
								if((pokemon.chargedMovePool[k].name.toLocaleLowerCase().startsWith(param))||(pokemon.chargedMovePool[k].type == param)){
									valid = true;
								}
							}
						} else{
							if((pokemon.types.indexOf(param) > -1)||(pokemon.speciesName.toLowerCase().startsWith(param))){
								valid = true;
							}
						}

						if(((valid)&&(!isNot))||((!valid)&&(isNot))){
							paramsMet++;
						}
					}

					if(paramsMet >= params.length){
						results.push(pokemon.speciesId);
					}
				}
			}

			return results;
		}

		// Override a Pokemon's moveset to be used in the rankings

		object.overrideMoveset = function(pokemon, league, cup, overrides){

			// Search eligible leagues and cups

			for(var i = 0; i < overrides.length; i++){

				if((overrides[i].league == league)&&(overrides[i].cup == cup)){

					// Iterate through Pokemon

					var pokemonList = overrides[i].pokemon;

					for(var n = 0; n < pokemonList.length; n++){
						if(pokemonList[n].speciesId == pokemon.speciesId){

							// Set Fast Move

							if(pokemonList[n].fastMove){
								pokemon.selectMove("fast", pokemonList[n].fastMove);
							}

							// Set Charged Moves

							if(pokemonList[n].chargedMoves){
								for(var j = 0; j < pokemonList[n].chargedMoves.length; j++){
									pokemon.selectMove("charged", pokemonList[n].chargedMoves[j], j);
								}

							}

							// Set weight modifier

							if(pokemonList[n].weight){
								pokemon.weightModifier = pokemonList[n].weight;
							}

							break;
						}
					}

					break;
				}
			}
		}

        return object;
    }

    return {
        getInstance: function (interface) {
            if (!instance) {
                instance = createInstance(interface);
            }
            return instance;
        }
    };
})();
