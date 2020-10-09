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

		if(settings.gamemaster == "gamemaster-mega"){
			$(".mega-warning").show();
		}

		$.getJSON( webRoot+"data/"+settings.gamemaster+".json?v="+siteVersion, function( data ){
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

			// First, clear all Shadow entries from the game master to start from a clean slate
			for(var i = 0; i < object.data.pokemon.length; i++){
				var poke = object.data.pokemon[i];
				if((poke)&&(poke.speciesId.indexOf("_shadow") > -1)){
					console.log("Removed " + poke.speciesId);
					object.data.pokemon.splice(i, 1);
					i--;
				}
			}

			var battle = new Battle();

			$.each(object.data.pokemon, function(index, poke){
				if(poke.speciesId.indexOf("_shadow") > -1){
					return false;
				}

				var pokemon = new Pokemon(poke.speciesId, 0, battle);
				var entry = object.getPokemonById(poke.speciesId);
				battle.setNewPokemon(pokemon, 0, false);

				// Remove Return and Frustration from legacy move list
				if(entry.legacyMoves){
					for(var i = 0; i < entry.legacyMoves.length; i++){
						if((entry.legacyMoves[i] == "FRUSTRATION")||(entry.legacyMoves[i] == "RETURN")){
							console.log("Removing Return from " + entry.speciesId);
							entry.legacyMoves.splice(i, 1);
							i--;

							continue;
						}

						// Remove any elite moves from the legacy move list
						if(entry.eliteMoves){
							if(entry.eliteMoves.indexOf(entry.legacyMoves[i]) > -1){
								entry.legacyMoves.splice(i, 1);
								i--;
							}
						}
					}

					if(entry.legacyMoves.length == 0){
						delete entry.legacyMoves;
					}
				}

				if(object.data.shadowPokemon.indexOf(poke.speciesId) > -1){
					// Get CP at level 25
					var cp = pokemon.calculateCP(0.667934, 0, 0, 0);
					entry.level25CP = cp;

					// Delete shadow from tags
					if(entry.tags){
						if(entry.tags.indexOf("shadow") > -1){
							entry.tags.splice(entry.tags.indexOf("shadow"), 1);

							if(entry.tags.length == 0){
								delete entry.tags;
							}
						}
					}

					if(entry.tags){
						if(entry.tags.indexOf("shadoweligible") == -1){
							entry.tags.push("shadoweligible");
						}
					} else{
						entry.tags = ["shadoweligible"];
					}

					// Duplicate the entry for the Shadow version of the Pokemon
					// Your clones are very impressive, you must be very proud

					if(!pokemon.hasTag("mega")){
						entry = JSON.parse(JSON.stringify(entry)); // Your clones are very impressive, you must be very proud

						entry.speciesId += "_shadow";
						entry.speciesName += " (Shadow)";
						entry.tags.splice(entry.tags.indexOf("shadowEligible"), 1);
						entry.tags.push("shadow");

						// Remove all legacy and exclusive moves that aren't available via Elite TM
						if(entry.legacyMoves){
							for(var i = 0; i < entry.fastMoves.length; i++){
								var remove = true;
								if(entry.legacyMoves.indexOf(entry.fastMoves[i]) > -1){
									if((entry.eliteMoves)&&(entry.eliteMoves.indexOf(entry.fastMoves[i]) > -1)){
										remove = false;
									}

									if(remove){
										entry.fastMoves.splice(i, 1);
										i--;
									}
								}
							}

							for(var i = 0; i < entry.chargedMoves.length; i++){
								var remove = true;
								if(entry.legacyMoves.indexOf(entry.chargedMoves[i]) > -1){
									if((entry.eliteMoves)&&(entry.eliteMoves.indexOf(entry.chargedMoves[i]) > -1)){
										remove = false;
									}

									if(remove){
										entry.chargedMoves.splice(i, 1);
										i--;
									}
								}
							}

							delete entry.legacyMoves;
						}

						delete entry.level25CP;
						object.data.pokemon.push(entry);
					}
				} else{
					if(entry.tags){
						if(entry.tags.indexOf("shadow") > -1){
							entry.tags.splice(entry.tags.indexOf("shadow"), 1);
						}
					}
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
					var level35cp = pokemon.calculateCP(0.76156384, 15, 15, 15);

					if(cp > leagues[i]){
						var floor = 5;
						var defaultIndex = 63;

						// For Pokemon that max near the league cap, default to lucky IV's
						if(level35cp < leagues[i]){
							floor = 12;
							defaultIndex = 16;
						}

						var combinations = pokemon.generateIVCombinations("overall", 1, 4096, null, floor);

						// For untradable Pokemon, set the index to the 54th rank
						if(pokemon.hasTag("untradeable")){
							defaultIndex = 53;
						}

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

			// Sort Pokemon by dex

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

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
						displayName: m.name,
						abbreviation: abbreviation,
						type: m.type,
						power: m.power,
						energy: m.energy,
						energyGain: m.energyGain,
						cooldown: m.cooldown,
						selfDebuffing: false,
						selfAttackDebuffing: false,
						legacy: false,
						elite: false
					};

					if((move.moveId == "RETURN")||(move.moveId == "FRUSTRATION")){
						move.legacy = true;
						move.displayName = move.displayName + "<sup>†</sup>";
					}

					if(m.buffs){
						move.buffs = m.buffs;
						move.buffApplyChance = parseFloat(m.buffApplyChance);
						move.buffTarget = m.buffTarget;

						if((move.buffTarget == "self")&&((move.buffs[0] < 0)||(move.buffs[1] < 0))){
							move.selfDebuffing = true;

							// Mark if move debuffs attack
							if(move.buffs[0] < 0){
								move.selfAttackDebuffing = true;
							}
						}
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
				var file = webRoot+"data/rankings/"+cup+"/"+category+"/"+"rankings-"+league+".json?v="+siteVersion;

				console.log(file);

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
				var file = webRoot+"data/groups/"+group+".json?v="+siteVersion;

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
				var file = webRoot+"data/training/teams/"+cup+"/"+league+".json?v="+siteVersion;

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

			var minStats = 3500; // You must be this tall to ride this ride

			if(battle.getCP() == 1500){
				minStats = 1250;
			} else if(battle.getCP() == 2500){
				minStats = 2800;
			}

			var bannedList = ["mewtwo","mewtwo_armored","giratina_altered","groudon","kyogre","rayquaza","palkia","dialga","heatran","giratina_origin","darkrai","cobalion","terrakion","virizion","thundurus_incarnate","regigigas","tornadus_incarnate","landorus_incarnate", "reshiram", "zekrom", "kyurem", "mewtwo_shadow"];
			var permaBannedList = ["rotom","rotom_fan","rotom_frost","rotom_heat","rotom_mow","phione","manaphy","shaymin_land","shaymin_sky","arceus","arceus_bug","arceus_dark","arceus_dragon","arceus_electric","arceus_fairy","arceus_fighting","arceus_fire","arceus_flying","arceus_ghost","arceus_grass","arceus_ground","arceus_ice","arceus_poison","arceus_psychic","arceus_rock","arceus_steel","arceus_water","kecleon"]; // Don't rank these Pokemon at all yet

			var maxDexNumber = 493;
			var releasedGen5 = ["snivy","servine","serperior","tepig","pignite","emboar","oshawott","dewott","samurott","lillipup","herdier","stoutland","purrloin","liepard","pidove","tranquill","unfezant","blitzle","zebstrika","foongus","amoonguss","drilbur","excadrill","litwick","lampent","chandelure","golett","golurk","deino","zweilous","hydreigon","pansage","panpour","pansear","simisage","simipour","simisear","ferroseed","ferrothorn","heatmor","durant","patrat","watchog","klink","klang","klinklang","yamask","cofagrigus","cobalion","terrakion","virizion","cryogonal","cubchoo","beartic","meltan","roggenrola","boldore","gigalith","tympole","palpitoad","seismitoad","dwebble","crustle","trubbish","garbodor","karrablast","escavalier","joltik","galvantula","shelmet","accelgor","timburr","gurdurr","conkeldurr","tirtouga","carracosta","archen","archeops","axew","fraxure","haxorus","throh","sawk","maractus","sigilyph","basculin","venipede","whirlipede","scolipede","minccino","cinccino","darumaka","darmanitan_standard","scraggy","scrafty","woobat","swoobat","tornadus_incarnate","audino","alomomola","thundurus_incarnate","rufflet","braviary","landorus_incarnate","genesect","solosis","duosion","reuniclus","gothita","gothitelle","gothorita","stunfisk","reshiram","zekrom","stunfisk_galarian","darumaka_galarian","darmanitan_galarian_standard","melmetal","obstagoon","perrserker","farfetchd_galarian", "kyurem", "ducklett", "swanna", "petilil", "lilligant", "victini", "elgyem", "beheeyem","bouffalant","sewaddle","leavanny","cottonee","whimsicott","emolga","deerling","sawsbuck"];

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
					// Only include releasedGen 5  Pokemon
					if((pokemon.dex > maxDexNumber)&&(releasedGen5.indexOf(pokemon.speciesId) == -1)&&(battle.getCup().name != "gen-5")){
						continue;
					}

					if((battle.getCP() == 1500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
						continue;
					}

					if(permaBannedList.indexOf(pokemon.speciesId) > -1){
						continue;
					}

					if((settings.gamemaster != "gamemaster-mega")&&(pokemon.hasTag("mega"))){
						continue;
					}

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

						// Exclude Pokemon that match any of the exclude filters
						if((! include)&&(filtersMatched > 0)&&(! includeIDFilter)){
							allowed = false;
						}
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
			var tags = object.data.pokemonTags;
			var regions = object.data.pokemonRegions;
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

							// legacy move search
							if ((param == "legacy")||(param == "special")) {
								for(var k = 0; k < pokemon.fastMovePool.length; k++){
									if((pokemon.fastMovePool[k].legacy == true)||(pokemon.fastMovePool[k].elite == true)){
										valid = true;
									} else if(param == "special") {
										if ((pokemon.fastMovePool[k].moveId == "FRUSTRATION")||(pokemon.fastMovePool[k].moveId === "RETURN")) {
											valid = true;
										}
									}
								}

								for(var k = 0; k < pokemon.chargedMovePool.length; k++){
									if((pokemon.chargedMovePool[k].legacy == true)||(pokemon.chargedMovePool[k].elite == true)){
										valid = true;
									} else if(param == "special") {
										if ((pokemon.chargedMovePool[k].moveId == "FRUSTRATION")||(pokemon.chargedMovePool[k].moveId === "RETURN")) {
											valid = true;
										}
									}
								}
							}

							// beam search
							if (param == "beam") {
								for(var k = 0; k < pokemon.chargedMovePool.length; k++){
									// only includes **REAL** beams
									if ((pokemon.chargedMovePool[k].moveId == "HYPER_BEAM")||(pokemon.chargedMovePool[k].moveId === "SOLAR_BEAM")) {
										valid = true;
									}
								}
							}

							// move name/type serach
							else {
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
							}
						} else{
							// Name search
							if(pokemon.speciesName.toLowerCase().startsWith(param)){
								valid = true;
							}

							// Type search
							if(pokemon.types.indexOf(param) > -1){
								valid = true;
							}

							// Tag search
							if((tags.indexOf(param) > -1)&&(pokemon.hasTag(param))){
								valid = true;
							}

							// Dex number search

							if(pokemon.dex == param){
								valid = true;
							}

							// Region/generation search
							for(k = 0; k < regions.length; k++){
								if((param == regions[k].string)||(param==regions[k].name)){
									if((pokemon.dex >= regions[k].dexStart)&&(pokemon.dex <= regions[k].dexEnd)){
										valid = true;

										// Exclude Alolan Pokemon from Gen1
										if((pokemon.hasTag("alolan"))&&(regions[k].string == "gen1")){
											valid = false;
										}
									}
								}
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
