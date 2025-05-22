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
		// maps battle cp to list all pokemon objects for that cp
		object.allPokemon = {}
		object.pokemonMap = {};
		object.moveMap = {};

		if(settings.gamemaster == "gamemaster-mega"){
			$(".mega-warning").show();
		}

		var gmVersion = settings.gamemaster;

		if((gmVersion == "gamemaster-mega")||(gmVersion == "gamemaster-paldea")){
			gmVersion = "gamemaster";
		}

		// By default, load the minified version
		if((gmVersion == "gamemaster")&&(host.indexOf("localhost") == -1)){
			gmVersion = "gamemaster.min";
		}

		console.log("loading gamemaster");

		$.ajax({
			dataType: "json",
			url: webRoot+"data/"+gmVersion+".json?v="+siteVersion,
			mimeType: "application/json",
			error: function(request, error) {
				console.log("Request: " + JSON.stringify(request));
				console.log(error);
			},
			success: function( data ) {
				object.data = data;

				console.log("gamemaster loaded");

				// Insert cup and format values into cup and format select dropdowns
				if(typeof updateFormatSelect === "function"){
					updateFormatSelect(object.data.formats, InterfaceMaster.getInstance());
				}

				if(typeof updateCupSelect === "function"){
					updateCupSelect(object.data.formats, InterfaceMaster.getInstance());
				}

				// Insert format links into ranking submenu
				var formats = object.data.formats;

				for(var i = formats.length - 1; i >= 0; i--){
					if(formats[i].showFormat && ! formats[i].hideRankings && formats[i].title != "Custom"){
						var $link = $("<a href=\""+(host + "rankings/" + formats[i].cup + "/" + formats[i].cp + "/overall/"+"\">"+formats[i].title+"</a>"));
						$link.insertAfter($(".icon-rankings + .submenu a").eq(2));
					}
				}

				// Initialize search maps
				object.pokemonMap = new Map(object.data.pokemon.map(pokemon => [pokemon.speciesId, pokemon]));
				object.moveMap = new Map(object.data.moves.map(move => [move.moveId, move]));

				if(settings.gamemaster == "gamemaster"){
					// Sort Pokemon alphabetically for searching
					object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

					if(typeof InterfaceMaster !== 'undefined'){
						InterfaceMaster.getInstance().init(object);
					}

					if(typeof customRankingInterface !== 'undefined'){
						customRankingInterface.init(object);
					}
				} else if(settings.gamemaster == "gamemaster-mega"){
					// Load additional mega pokemon
					$.getJSON( webRoot+"data/megas.json?v="+siteVersion, function( data ){

						// Sort Pokemon alphabetically for searching
						object.data.pokemon = object.data.pokemon.concat(data);
						object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

						InterfaceMaster.getInstance().init(object);
					});
				} else if(settings.gamemaster == "gamemaster-paldea"){
					// Load additional mega pokemon
					$.getJSON( webRoot+"data/paldea.json?v="+siteVersion, function( data ){

						// Sort Pokemon alphabetically for searching
						object.data.pokemon = object.data.pokemon.concat(data);
						object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

						InterfaceMaster.getInstance().init(object);
					});
				}
			}
		});

		// function to help speed up searching by resuing Pokemon objects
		// could likely be used in other instances where `new Pokemon` is called
		object.getAllPokemon = function(battle) {
			const key = battle.getCP();

			if (!object.allPokemon.hasOwnProperty(key)) {
				object.allPokemon[key] = object.data.pokemon.map(p => {
					return new Pokemon(p.speciesId, 0, battle);
				})
			}

			return object.allPokemon[key]
		}


		// Return a Pokemon object given species ID

		object.getPokemonById = function(id){
			id = id.replace("_xl", "");

			var pokemon = object.pokemonMap.get(id);

			return pokemon;
		}

		// Return a list of Pokemon belong to a give familyId

		object.getPokemonByFamily = function(familyId){
			var list = [];

			$.each(object.data.pokemon, function(index, poke){

				if(poke.family && poke.family.id == familyId && poke.speciesId.indexOf("_shadow") == -1){
					list.push(poke);
					return;
				}
			});

			return list;
		}

		// Return all Pokemon entries that have the provided dex number

		object.getPokemonForms = function(dex){
			var list = [];

			$.each(object.data.pokemon, function(index, poke){

				if(poke.tags && poke.tags.indexOf("duplicate") > -1){
					return;
				}

				if(poke.dex == dex){
					list.push(poke);
					return;
				}
			});

			return list;
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
			/*for(var i = 0; i < object.data.pokemon.length; i++){
				var poke = object.data.pokemon[i];
				if((poke)&&(poke.speciesId.indexOf("_shadow") > -1)){
					console.log("Removed " + poke.speciesId);
					object.data.pokemon.splice(i, 1);
					i--;
				}
			}*/

			var battle = new Battle();

			$.each(object.data.pokemon, function(index, poke){
				if(poke.speciesId.indexOf("_shadow") > -1){
					return;
				}

				var pokemon = new Pokemon(poke.speciesId, 0, battle);
				var entry = object.getPokemonById(poke.speciesId);
				battle.setNewPokemon(pokemon, 0, false);

				if(pokemon.hasTag("shadoweligible")){
					return;
				}

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
						entry.tags = entry.tags.filter(t => t != "wildlegendary" && t != "shadoweligible");
						entry.tags.push("shadow");

						// Adjust IDs for evolutions

						if(entry.family){
							if(entry.family.parent && object.data.shadowPokemon.indexOf(entry.family.parent) > -1){
								entry.family.parent += "_shadow";
							}

							if(entry.family.evolutions){
								for(var i = 0; i < entry.family.evolutions.length; i++){
									entry.family.evolutions[i] += "_shadow";
								}
							}
						}

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

			var json = JSON.stringify(object.data.pokemon);

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
					var level40cp = pokemon.calculateCP(0.790300011634826, 15, 15, 15);
					var level45cp = pokemon.calculateCP(0.815299987792968, 15, 15, 15);

					if(cp > leagues[i]){
						var combo = object.generateDefaultIVCombo(pokemon, pokemon.levelCap, leagues[i], level45cp);

						if(combo){
							defaultIVs["cp"+leagues[i]] = [combo.level, combo.ivs.atk, combo.ivs.def, combo.ivs.hp]

							if(combo.level > 40){
								if(level40cp > leagues[i]){
									combo = object.generateDefaultIVCombo(pokemon, 40, leagues[i], level35cp);

									defaultIVs["cp"+leagues[i] + "l40"] = [combo.level, combo.ivs.atk, combo.ivs.def, combo.ivs.hp];
								} else{

									defaultIVs["cp"+leagues[i] + "l40"] = [40, 15, 15, 15];
								}
							}
						} else{
							defaultIVs["cp"+leagues[i]] = [1, 0, 0, 0];
						}
					} else{
						defaultIVs["cp"+leagues[i]] = [pokemon.levelCap, 15, 15, 15];
					}
				}

				// Pokemon exceptions

				if(pokemon.speciesId == "trevenant"){
					defaultIVs["cp1500"] = [22, 3, 13, 12];
				}

				if(pokemon.speciesId == "dhelmise"){
					defaultIVs["cp1500"] = [20, 1, 4, 4];
				}

				if(pokemon.speciesId == "medicham"){
					defaultIVs["cp1500"] = [49, 7, 15, 14];
				}

				if(pokemon.speciesId == "typhlosion_hisuian"){
					defaultIVs["cp1500"] = [20, 1, 1, 2];
				}

				if(pokemon.speciesId == "lokix"){
					defaultIVs["cp2500"] = [47.5, 11, 15, 15];
				}

				entry.defaultIVs = defaultIVs;
			});

			// Sort Pokemon by dex

			object.data.pokemon.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

			var json = JSON.stringify(object.data.pokemon);

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

			if(pokemon.hasTag("legendary") && pokemon.hasTag("shadow")){
				floor = 6;
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

		// Check parent and evolution IDs to validate Pokemon family data

		object.validateFamilyData = function(){

			$.each(object.data.pokemon, function(index, poke){

				if(poke.family){
					if(poke.family.parent){
						var parent = object.getPokemonById(poke.family.parent);
						if(! parent){
							console.error(poke.family.parent + " does not exist");
						}
					}

					if(poke.family.evolutions){
						for(var i = 0; i < poke.family.evolutions.length; i++){
							var evolution = object.getPokemonById(poke.family.evolutions[i]);

							if(! evolution){
								console.error(poke.family.evolutions[i] + " does not exist");
							}
						}
					}
				}

			});

			console.log("Family validation complete");
		}

		// Check parent and evolution IDs to validate Pokemon family data

		object.generatePokemonMovesetCSV = function(){

			var csv = 'Pokemon,Fast Moves,Charged Moves'

			$.each(object.data.pokemon, function(index, poke){
				var pokemon = new Pokemon(poke.speciesId, 0, new Battle());
				var fastNames = [];
				var chargedNames = [];

				$.each(pokemon.fastMovePool, function(i, move){
					fastNames.push(move.name);
				});

				$.each(pokemon.chargedMovePool, function(i, move){
					chargedNames.push(move.name);
				});

				csv += '\n'+pokemon.speciesName+','+fastNames.join("|")+','+chargedNames.join("|");
			});

			console.log(csv);
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
			if(id == "none")
				return;

			var m = object.moveMap.get(id);

			if(m !== undefined){

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
					selfDefenseDebuffing: false,
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

					if(move.buffTarget == "both"){
						move.buffsSelf = m.buffsSelf;
						move.buffsOpponent = m.buffsOpponent;
					}

					if( move.buffTarget == "self" && move.buffApplyChance >= .5 && move.moveId != "DRAGON_ASCENT" && (move.buffs[0] < 0 || move.buffs[1] < 0 )){
						move.selfDebuffing = true;

						// Mark if move debuffs attack
						if(move.buffs[0] < 0){
							move.selfAttackDebuffing = true;
						}

						// Mark if move debuffs defense
						if(move.buffs[1] < 0){
							move.selfDefenseDebuffing = true;
						}
					}

					if(move.buffApplyChance == 1 && (move.buffTarget == "opponent" || (move.buffTarget == "self" && (move.buffs[0] > 0 || move.buffs[1] > 0) || (move.buffTarget == "both" && (move.buffsSelf[0] > 0 || move.buffsSelf[1] > 0) )))){
						move.selfBuffing = true;
					}
				}

				if(m.formChange){
					move.formChange = JSON.parse(JSON.stringify(m.formChange));
				}
			} else{
				console.error(id + " missing");
			}

			return move;
		}


		// Get status effect string from a move

		object.getStatusEffectString = function(move){
			if (!move.buffs && !move.formChange) {
				return '';
			}

			var stringArray = []

			if(move.buffs){
				var atk = object.getStatusEffectStatString(move.buffs[0], 'Atk');
				var def = object.getStatusEffectStatString(move.buffs[1], 'Def');
				var buffApplyChance = parseFloat(move.buffApplyChance)*100 + '%';
				var buffTarget = move.buffTarget;
				stringArray.push(buffApplyChance + " chance", atk, def, buffTarget);

				if(move.buffTarget == "both"){
					stringArray[3] = "self";

					var atkOpp = object.getStatusEffectStatString(move.buffsOpponent[0], 'Atk');
					var defOpp = object.getStatusEffectStatString(move.buffsOpponent[1], 'Def');
					var buffApplyChance = parseFloat(move.buffApplyChance)*100 + '%';
					stringArray.push(buffApplyChance + " chance", atkOpp, defOpp, "opponent");
				}

			}

			if(move.formChange){
				stringArray.push("Form change");
			}

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

		// Return a cup object given an id name

		object.getFormat = function(cup, cp){
			var format;

			$.each(object.data.formats, function(index, f){
				if(f.cup == cup && parseInt(f.cp) == cp){
					format = f;
				}
			});

			return format;
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

					if(caller.displayRankingData){
						caller.displayRankingData(data);
					}
				});
			} else{
				if(caller.displayRankingData){
					caller.displayRankingData(object.rankings[key]);
				}
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

		object.loadGroupData = function(caller, group, rankingData){

			var key = group;

			if(! object.groups[key]){
				var file = webRoot+"data/groups/"+group+".json?v="+siteVersion;

				$.getJSON( file, function( data ){

					// Sort alphabetically

					data.sort((a,b) => (a.speciesId > b.speciesId) ? 1 : ((b.speciesId > a.speciesId) ? -1 : 0));

					object.groups[key] = data;

					// Return group data for all contexts except rankings
					var returnData = data;

					if(rankingData){
						returnData = rankingData;
					}

					if(caller.context != "team" && caller.context != "rankings"){
						caller.quickFillGroup(returnData);
					} else{
						caller.displayRankingData(returnData);
					}
				});
			} else{

				if(caller.context != "team" && caller.context != "rankings"){
					caller.quickFillGroup(object.groups[key]);
				} else{
					caller.displayRankingData(returnData);
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

		// Load article metadata json and return it to the interface

		object.loadArticleData = function(callback){
			var file = webRoot+"articles/articles.json?v="+siteVersion;

			$.getJSON( file, function( data ){
				console.log("article metadata loaded [" + data.length + "]");
				callback(data);
			});
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

			var minStats = 4900; // You must be this tall to ride this ride

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

			var bannedList = ["mewtwo","mewtwo_armored","giratina_altered","groudon","kyogre","palkia","dialga","cobalion","terrakion","virizion","regigigas","tornadus_therian","tornadus_therian_xl", "landorus_therian", "reshiram", "zekrom", "kyurem", "genesect_burn", "xerneas", "thundurus_therian", "yveltal", "meloetta_aria", "zacian", "zamazenta", "zacian_hero", "zamazenta_hero", "genesect_douse", "zarude", "hoopa_unbound", "genesect_shock", "tapu_koko", "tapu_lele", "tapu_bulu", "nihilego", "genesect_chill", "solgaleo", "lunala", "keldeo_ordinary", "kyogre_primal", "groudon_primal", "zygarde_complete", "enamorus_therian", "enamorus_incarnate", "dialga_origin", "palkia_origin", "necrozma", "necrozma_dawn_wings", "necrozma_dusk_mane", "marshadow", "kyurem_black", "kyurem_white"];

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

				if(stats >= minStats || battle.getCup().includeLowStatProduct ||
				 ( battle.getCP() == 1500 &&
				 pokemon.hasTag("include1500")) || ( battle.getCP() == 2500 &&
				 pokemon.hasTag("include2500")) || pokemon.hasTag("mega") ){
					// Today is the day
					if(! pokemon.released){
						continue;
					}

					if((battle.getCP() < 2500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
						continue;
					}

					if(pokemon.hasTag("duplicate1500") && (battle.getCP() != 1500 || (battle.getCup().name != "all" && battle.getCup().name != "retro" && battle.getCup().name != "halloween"))){
						continue;
					}

					// Ban Shadows from Little Cup that can't reach a low enough level
					if(battle.getCP() == 500 && pokemon.hasTag("shadow") && pokemon.level < 8){
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

								case "evolution":
									if(filter.values.indexOf(pokemon.getEvolutionStage()) > -1){
										filtersMatched++;
									}
									break;

								case "id":
									if((include)&&(filters.length > 1)){
										requiredFilters--;
									}

									var testId = pokemon.speciesId;

									// Exclude Shadow and XL versions of a listed Pokemon
									if((! include)||(filter.includeShadows)){
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

								case "move":
									for(var k = 0; k < filter.values.length; k++){
										if(pokemon.knowsMove(filter.values[k])){
											filtersMatched++;
										}
									}
									break;

								case "moveType":
									for(var k = 0; k < filter.values.length; k++){
										if(pokemon.knowsMoveType(filter.values[k])){
											filtersMatched++;
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

		// maps a search query to list of pokemon ids to avoid searching again
		object.searchStringCache = {}

		// Generate a list of Pokemon given a search string
		object.generatePokemonListFromSearchString = function(str, battle){


			// Break the search string up into queries
			var queries = str.toLowerCase().split(/\s*,\s*/);
			var searchKey = queries.join() + battle.getCP() + battle.getCup().name;

			// don't bother searching if any of the terms are empty
			// as all pokemon will be valid
			if (str == "") {
				return object.data.pokemon.map(p => p.speciesId)
			}

			// if you already searched, use cached list instead of regenerating
			if (object.searchStringCache.hasOwnProperty(searchKey)) {
				return object.searchStringCache[searchKey]
			}

			var results = []; // Store an array of qualifying Pokemon ID's

			var types = ["bug","dark","dragon","electric","fairy","fighting","fire","flying","ghost","grass","ground","ice","normal","poison","psychic","rock","steel","water"];
			var tags = object.data.pokemonTags;
			var regions = object.data.pokemonRegions;

			var metaKey = $(".format-select option:selected").first().attr("meta-group");

			if(! battle){
				battle = new Battle();
			}

			for(var i = 0; i < queries.length; i++){
				var query = queries[i];

				if(query == ""){
					continue;
				}

				var params = query.split('&');

				// iterate over existing pokemon instead of creating new objects
				for(const pokemon of object.getAllPokemon(battle)){

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

						// Evolution family search
						if((param.charAt(0) == "+")&&(param.length > 2)){
							param = param.substr(1, param.length-1);

							var searchPokemon = object.getPokemonById(param);

							if(searchPokemon && searchPokemon.family && pokemon.family && searchPokemon.family.id == pokemon.family.id){
								valid = true;
							}
						}

						// Move search
						if((param.charAt(0) == "@")&&(param.length > 2)){
							param = param.substr(1, param.length-1);

							// legacy move search
							if ((param == "legacy")||(param == "special")) {
								for(var k = 0; k < pokemon.fastMovePool.length; k++){
									if((pokemon.fastMovePool[k].legacy == true)||(pokemon.fastMovePool[k].elite == true)){
										valid = true;
									}
								}

								for(var k = 0; k < pokemon.chargedMovePool.length; k++){
									if((pokemon.chargedMovePool[k].legacy == true)||(pokemon.chargedMovePool[k].elite == true)){
										valid = true;
									}

									if(pokemon.chargedMovePool[k].moveId == "FRUSTRATION"||pokemon.chargedMovePool[k].moveId === "RETURN") {
										if(param == "special"){
											valid = true;
										} else if(param == "legacy"){
											valid = false;
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
								const fastOnly = (param.charAt(0) === "1")
								const chargedOnly = (param.charAt(0) === "2")
								if (fastOnly || chargedOnly) {
									param = param.substr(1, param.length-1)
								}
								// skip fast moves if @2
								if (!chargedOnly) {
									for(var k = 0; k < pokemon.fastMovePool.length; k++){
										if((pokemon.fastMovePool[k].name.toLocaleLowerCase().startsWith(param))||(pokemon.fastMovePool[k].type == param)){
											valid = true;
										}
									}
								}

								// skip charged moves if @1
								if (!fastOnly) {
									for(var k = 0; k < pokemon.chargedMovePool.length; k++){
										if((pokemon.chargedMovePool[k].name.toLocaleLowerCase().startsWith(param))||(pokemon.chargedMovePool[k].type == param)){
											valid = true;
										}
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

							// Nickname search
							if (pokemon.nicknames.indexOf(param) > -1) {
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

							// Meta group search
							if(param == "meta"){
								if(object.groups[metaKey] !== undefined){

									var group = object.groups[metaKey];

									valid = false;

									for(k = 0; k < group.length; k++){
										if(pokemon.speciesId.replace("_shadow", "") == group[k].speciesId.replace("_shadow", "")){
											valid = true;
										}
									}
								} else{
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

			object.searchStringCache[searchKey] = results
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

								if(pokemonList[n].chargedMoves.length < 2){
									pokemon.selectMove("charged", "none", 1);
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
