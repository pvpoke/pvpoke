// JavaScript Document

var GameMaster = (function () {
    var instance;

    function createInstance(interface) {
        var object = new Object();

		object.data = {};
		object.rankings = [];
		object.trainRankings = [];
		object.groups = [];
		object.teamPools = [];
		object.loadedData = 0;

		if(settings.gamemaster == "gamemaster-mega"){
			$(".mega-warning").show();
		}

		var gmVersion = settings.gamemaster;

		if((gmVersion == "gamemaster-mega")||(gmVersion == "gamemaster-kalos")){
			gmVersion = "gamemaster";
		}

		// By default, load the minified version
		if((gmVersion == "gamemaster")&&(host.indexOf("localhost") == -1)){
			gmVersion = "gamemaster.min";
		}

		$.getJSON( webRoot+"data/"+gmVersion+".json?v="+siteVersion, function( data ){
			object.data = data;

			if(settings.gamemaster == "gamemaster"){
				// Sort Pokemon alphabetically for searching
				object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

				InterfaceMaster.getInstance().init(object);
			} else if(settings.gamemaster == "gamemaster-mega"){
				// Load additional mega pokemon
				$.getJSON( webRoot+"data/megas.json?v="+siteVersion, function( data ){

					// Sort Pokemon alphabetically for searching
					object.data.pokemon = object.data.pokemon.concat(data);
					object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

					InterfaceMaster.getInstance().init(object);
				});
			} else if(settings.gamemaster == "gamemaster-kalos"){
				// Load additional mega pokemon
				$.getJSON( webRoot+"data/kalos.json?v="+siteVersion, function( data ){

					// Sort Pokemon alphabetically for searching
					object.data.pokemon = object.data.pokemon.concat(data);
					object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

					InterfaceMaster.getInstance().init(object);
				});
			}
		});

		// Return a Pokemon object given species ID

		object.getPokemonById = function(id){
			var pokemon;

			id = id.replace("_xl", "");

			$.each(object.data.pokemon, function(index, poke){

				if(poke.speciesId == id){
					pokemon = poke;
					return;
				}
			});

			return pokemon;
		}

		// Returns the point value of a Pokemon in a tiered meta

		object.getPokemonTier = function(id, cup){
			id = id.replace("_xs", "");
			id = id.replace("_shadow", "");

			if(! cup.tierRules){
				return false;
			}

			var tierRules = cup.tierRules;
			var tiers = cup.tierRules.tiers;
			var points = cup.tierRules.floor;

			for(var i = 0; i < tiers.length; i++){
				for(var n = 0; n < tiers[i].pokemon.length; n++){
					if(tiers[i].pokemon[n] == id){
						points = tiers[i].points;
						break;
					}
				}
			}

			return points;
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
				var leagues = [500,1500,2500];
				var battle = new Battle();

				var pokemon = new Pokemon(poke.speciesId, 0, battle);
				var entry = object.getPokemonById(poke.speciesId);
				battle.setNewPokemon(pokemon, 0, false);

				var defaultIVs = {
					cp500: [],
					cp1500: [],
					cp2500: []
				};

				for(var i = 0; i < leagues.length; i++){
					battle.setCP(leagues[i]);

					pokemon.ivs.atk = pokemon.ivs.def = pokemon.ivs.hp = 15;
					pokemon.setLevel(pokemon.levelCap, true);

					var cp = pokemon.cp;
					var level35cp = pokemon.calculateCP(0.76156384, 15, 15, 15);
					var level45cp = pokemon.calculateCP(0.815299987792968, 15, 15, 15);

					if(cp > leagues[i]){
						var combo = object.generateDefaultIVCombo(pokemon, pokemon.levelCap, leagues[i], level45cp);

						defaultIVs["cp"+leagues[i]] = [combo.level, combo.ivs.atk, combo.ivs.def, combo.ivs.hp]

						if(combo.level > 40){
							combo = object.generateDefaultIVCombo(pokemon, 40, leagues[i], level35cp);

							defaultIVs["cp"+leagues[i] + "l40"] = [combo.level, combo.ivs.atk, combo.ivs.def, combo.ivs.hp]

						}
					} else{
						defaultIVs["cp"+leagues[i]] = [pokemon.levelCap, 15, 15, 15];
					}
				}

				entry.defaultIVs = defaultIVs;
			});

			// Sort Pokemon by dex

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

			var json = JSON.stringify(object.data);

			console.log(json);
		}

		// Generate a singular default IV combo given league and level cap

		object.generateDefaultIVCombo = function(pokemon, levelCap, league, nearCapCP){
			var floor = 4;
			var defaultIndex = 15;

			// For Pokemon that max near the league cap, default to lucky IV's
			if(nearCapCP < league){
				floor = 12;
				defaultIndex = 7;
			}

			pokemon.setLevelCap(levelCap);

			var combinations = pokemon.generateIVCombinations("overall", 1, 4096, null, floor);

			// For untradable Pokemon, set the index to the 54th rank
			if(pokemon.hasTag("untradeable")){
				defaultIndex = 31;
			}

			if(defaultIndex > combinations.length){
				defaultIndex = Math.floor(combinations.length / 2);
			}

			pokemon.setLevelCap(50);

			return combinations[defaultIndex];
		}

		// Set level caps for gamemaster data

		object.setLevelCapData = function(){

			// List of legendaries and mythicals to be excluded from the level cap
			var levelCapExclusion = ["melmetal","thundurus_incarnate","thundurus_therian","landorus_incarnate","landorus_therian","tornadus_incarnate","tornadus_therian","rayquaza"];

			$.each(object.data.pokemon, function(index, poke){
				var battle = new Battle();
				var pokemon = new Pokemon(poke.speciesId, 0, battle);
				var entry = object.getPokemonById(poke.speciesId);

				if((pokemon.hasTag("legendary")||pokemon.hasTag("mythical")) && (levelCapExclusion.indexOf(pokemon.speciesId) == -1)){
					entry.levelCap = 40;
				}
			});

			// Sort Pokemon by dex

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

			var json = JSON.stringify(object.data);

			console.log(json);
		}

		// Analyze Charged Moves and bucket them into archetypes

		object.generateMoveArchetypes = function(){

			// List of legendaries and mythicals to be excluded from the level cap

			$.each(object.data.moves, function(index, move){
				var archetype = "General"; // Default archetype

				// Charged Moves

				if(move.energy > 0){
					var dpe = move.power / move.energy;

					// Categorize by energy
					if((move.energy > 60)&&(dpe > 1.5)){
						archetype = "Nuke";
					} else if(move.energy > 50){
						if(dpe > 1.75){
							archetype = "Nuke";
						} else{
							archetype = "High Energy";
						}

					} else if(move.energy < 45){
						archetype = "Spam/Bait"
					}

					var descriptor = "";

					if(move.buffs){

						if((move.buffTarget == "self")&&((move.buffs[0] > 0)||(move.buffs[1] > 0))){
							descriptor = "Boost"
						}

						if((move.buffTarget == "self")&&((move.buffs[0] < 0)||(move.buffs[1] < 0))){
							descriptor = "Self-Debuff"
						}

						if((move.buffTarget == "opponent")&&((move.buffs[0] < 0)||(move.buffs[1] < 0))){
							descriptor = "Debuff"
						}

						if(descriptor != ""){
							if(archetype == "General"){
								archetype = descriptor;
							} else if(archetype == "High Energy"){
								archetype = archetype + " " + descriptor;
							} else{
								archetype = descriptor + " " + archetype;
							}

							if(archetype == "Self-Debuff Spam/Bait"){
								archetype = "Self-Debuff Spam"
							}
						}
					}

					move.archetype = archetype;
				}


				// Fast Moves

				if(move.energyGain > 0){
					var dpt = move.power / (move.cooldown / 500)
					var ept = move.energyGain / (move.cooldown / 500)

					if((dpt >= 3.5) && (dpt > ept)){
						archetype = "Heavy Damage"
					}

					if((ept >= 3.5) && (ept > dpt)){
						archetype = "Fast Charge"
					}

					if( ((dpt >= 4) && (ept >= 3)) || ((dpt >= 3) && (ept >= 4)) ){
						archetype = "Multipurpose"
					}

					if( ((dpt < 3) && (ept <= 3)) || ((dpt <= 3) && (ept < 3)) ){
						archetype = "Low Quality"
					}

					move.archetype = archetype;
				}
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

					if(m.abbreviation){
						// Use predefined abbreviation if set
						abbreviation = m.abbreviation;
					} else{
						// Make abbreviation from first character of each word
						for(var i = 0; i < arr.length; i++){
							abbreviation += arr[i].charAt(0);
						}
					}

					var archetype = '';

					if(m.archetype){
						archetype = m.archetype;
					}

					move = {
						moveId: m.moveId,
						name: m.name,
						displayName: m.name,
						abbreviation: abbreviation,
						archetype: archetype,
						type: m.type,
						power: m.power,
						energy: m.energy,
						energyGain: m.energyGain,
						cooldown: m.cooldown,
						selfDebuffing: false,
						selfBuffing: false,
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

						if(move.buffApplyChance == 1 && (move.buffTarget == "opponent" || (move.buffTarget == "self" && (move.buffs[0] > 0 || move.buffs[1] > 0)))){
							move.selfBuffing = true;
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


		// Get status effect string from a move

		object.getStatusEffectString = function(move){
			if (!move.buffs) {
				return '';
			}
			var atk = object.getStatusEffectStatString(move.buffs[0], 'Atk');
			var def = object.getStatusEffectStatString(move.buffs[1], 'Def');
			var buffApplyChance = parseFloat(move.buffApplyChance)*100 + '%';
			var buffTarget = move.buffTarget;
			var stringArray = [buffApplyChance + " chance", atk, def, buffTarget];
			return "<div class=\"status-effect-description\">"+stringArray.join(' ')+"</div>";
		}

		// Get stats string from move for status effects

		object.getStatusEffectStatString = function(stat, type){
			if (stat === 0) {
				return "";
			}
			var statString = stat;
			if (stat > 0) {
				statString = "+" + statString;
			}
			return statString + " " + type;
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

		// Load and return ranking data JSON

		object.loadTrainData = function(caller, league, cup){

			var key = cup + "" + league;

			if(! object.trainRankings[key]){
				var file = webRoot+"data/training/analysis/"+cup+"/"+league+".json?v="+siteVersion;

				console.log(file);

				$.getJSON( file, function( data ){
					object.trainRankings[key] = data;

					caller.displayRankingData(data);
				});
			} else{
				caller.displayRankingData(object.trainRankings[key]);
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
					if(caller.context != "team"){
						caller.quickFillGroup(data);
					} else{
						caller.displayRankingData(data);
					}
				});
			} else{

				if(caller.context != "team"){
					caller.quickFillGroup(object.groups[key]);
				} else{
					caller.displayRankingData(data);
				}

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

		object.generateFilteredPokemonList = function(battle, include, exclude, rankingData, overrides, excludeByStatProduct){
			excludeByStatProduct = typeof excludeByStatProduct !== 'undefined' ? excludeByStatProduct : true;

			// Gather all eligible Pokemon

			var minStats = 3500; // You must be this tall to ride this ride

			if(battle.getCP() == 500){
				minStats = 0;
			} else if(battle.getCP() == 1500){
				minStats = 1370;
			} else if(battle.getCP() == 2500){
				minStats = 2800;
			}

			if(! excludeByStatProduct){
				minStats = 0;
			}

			var bannedList = ["mewtwo","mewtwo_armored","giratina_altered","groudon","kyogre","palkia","dialga","heatran","giratina_origin","darkrai","cobalion","terrakion","virizion","thundurus_incarnate","regigigas","tornadus_incarnate","tornadus_therian","tornadus_therian_xl","landorus_incarnate", "landorus_therian", "reshiram", "zekrom", "kyurem", "genesect_burn", "xerneas", "thundurus_therian", "yveltal", "meloetta_aria", "zacian", "zamazenta", "zacian_hero", "zamazenta_hero"];

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

				if((stats >= minStats)||((battle.getCP() == 1500)&&(pokemon.hasTag("include1500")))){
					// Today is the day
					if(! pokemon.released){
						continue;
					}

					if((battle.getCP() < 2500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
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

							// Check if this filter is valid for this league
							if(filter.leagues){
								if(filter.leagues.indexOf(battle.getCP()) == -1){
									requiredFilters--;
									continue;
								}
							}

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

								case "cost":
									if(filter.values.indexOf(pokemon.thirdMoveCost) > -1){
										filtersMatched++;
									}
									break;

								case "distance":
									if(filter.values.indexOf(pokemon.buddyDistance) > -1){
										filtersMatched++;
									}
									break;

								case "id":
									if((include)&&(filters.length > 1)){
										requiredFilters--;
									}

									var testId = pokemon.speciesId;

									// Exclude Shadow and XL versions of a listed Pokemon
									if(! include){
										testId = testId.replace("_shadow","");
										testId = testId.replace("_xs","");
									}

									if( filter.values.indexOf(testId) > -1 || filter.values.indexOf(pokemon.speciesId) > -1 ) {
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

		object.generatePokemonListFromSearchString = function(str, battle){
			// Break the search string up into queries
			var str = str.replace(/, /g, '').toLowerCase();
			var queries = str.split(',');
			var results = []; // Store an array of qualifying Pokemon ID's

			var types = ["bug","dark","dragon","electric","fairy","fighting","fire","flying","ghost","grass","ground","ice","normal","poison","psychic","rock","steel","water"];
			var tags = object.data.pokemonTags;
			var regions = object.data.pokemonRegions;

			if(! battle){
				battle = new Battle();
			}

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

							// Move cost search
							if(param.indexOf("k") > -1){
								var arr = param.split("k");
								if(pokemon.thirdMoveCost == parseInt(arr[0]) * 1000){
									valid = true;
								}
							}

							// Buddy distance search
							if(param.indexOf("km") > -1){
								var arr = param.split("km");
								if(pokemon.buddyDistance == parseInt(arr[0])){
									valid = true;
								}
							}

							// Hundo search
							if((param == "hundo")||(param == "4*")){
								pokemon.initialize(true);

								if(pokemon.ivs.atk == 15 && pokemon.ivs.def == 15 && pokemon.ivs.hp == 15){
									valid = true;
								}
							}

							// New XL search, no longer a tag
							if(param == "xl"){
								if(pokemon.needsXLCandy()){
									valid = true;
								}
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

							// Point/tier search
							if((param.indexOf("pt") > -1)||(param.indexOf("pts") > -1)){
								var val = param.replace("pt","");
								val = param.replace("pts","");
								val = parseInt(val);

								if(object.getPokemonTier(pokemon.speciesId, pokemon.getBattle().getCup()) == val){
									valid = true;
								}
							}

							// Trait search

							if((object.data.pokemonTraits.pros.indexOf(param) > -1)||(object.data.pokemonTraits.cons.indexOf(param) > -1)){
								pokemon.initialize(true);
								pokemon.selectRecommendedMoveset("overall");
								var traits = pokemon.generateTraits();
								var searchTraits = [param];

								// Add bulk traits above or below the searched trait if applicable

								if(param == "bulky"){
									searchTraits.push("extremely bulky");
								}

								if(param == "less bulky"){
									searchTraits.push("frail", "glass cannon");
								}

								if(traits){
									// Search traits for search term
									for(var k = 0; k < traits.pros.length; k++){
										if(searchTraits.indexOf(traits.pros[k].trait.toLowerCase()) > -1){
											valid = true;

											break;
										}
									}

									for(var k = 0; k < traits.cons.length; k++){
										if(searchTraits.indexOf(traits.cons[k].trait.toLowerCase()) > -1){
											valid = true;

											break;
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
							if (typeof pokemonList[n].weight !== 'undefined') {
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
