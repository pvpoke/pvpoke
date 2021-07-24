// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var gm;
			var battle;
			var pokeSelectors = [];
			var multiSelectors = [
				new PokeMultiSelect($(".team .poke.multi")),
				new PokeMultiSelect($(".custom-threats .poke.multi")),
				new PokeMultiSelect($(".custom-alternatives .poke.multi")),
				new PokeMultiSelect($(".exclude-alternatives .poke.multi"))
			];
			var results; // Store team matchup results for later reference
			var self = this;
			var runningResults = false;

			var histograms = [];

			this.context = "team";


			this.init = function(){

				gm = GameMaster.getInstance();
				var data = gm.data;

				battle = new Battle();

				// Initialize selectors and push Pokemon data

				$(".poke.single").each(function(index, value){
					var selector = new PokeSelect($(this), index);
					pokeSelectors.push(selector);

					selector.init(data.pokemon, battle);
				});

				for(var i = 0; i < multiSelectors.length; i++){
					multiSelectors[i].init(data.pokemon, battle);
				}

				multiSelectors[0].setMaxPokemonCount(6);


				$(".format-select").on("change", selectFormat);
				$(".rate-btn").on("click", rateClick);
				$(".print-scorecard").on("click", printScorecard);
				$("body").on("click", ".alternatives-table .button.add", addAlternativePokemon);
				$("body").on("click", ".check", checkBox);

				// If get data exists, load settings

				this.loadGetData();

				// Load rankings for the current league

				if(! get){
					gm.loadRankingData(self, "overall", parseInt($(".format-select option:selected").attr("value")), "all");
				}

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});
			};

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				// Clear all currently selected Pokemon

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].clear();
				}

				$(".section.typings").hide();

				if(! get){
					return false;
				}

				// Cycle through parameters and set them

				for(var key in get){
					if(get.hasOwnProperty(key)){

						var val = get[key];

						// Process each type of parameter

						switch(key){
							case "t":
								// Add each team member to the multi-selector
								var list = val.split(",");
								var pokeList = [];

								for(var i = 0; i < list.length; i++){
									var arr = list[i].split('-');
									var pokemon = new Pokemon(arr[0], index, battle);

									pokemon.initialize(battle.getCP());

									if(arr.length >= 8){
										pokemon.setIV("atk", arr[2]);
										pokemon.setIV("def", arr[3]);
										pokemon.setIV("hp", arr[4]);
										pokemon.setLevel(arr[1]);
									}

									// Check string for other parameters
									for(var n = 0; n < arr.length; n++){
										switch(arr[n]){
											case "shadow":
											case "purified":
												pokemon.setShadowType(arr[n]);
												break;
										}
									}

									// Split out the move string and select moves

									var moveStr = list[i].split("-m-")[1];
									arr = moveStr.split("-");

									// Search string for any custom moves
									var customMoveIndexes = [];

									for(var n = 0; n < arr.length; n++){
										if(arr[n].match('([A-Z_]+)')){
											var move = gm.getMoveById(arr[i]);
											var movePool = (move.energyGain > 0) ? pokemon.fastMovePool : pokemon.chargedMovePool;
											var moveType = (move.energyGain > 0) ? "fast" : "charged";
											var moveIndex = 0;

											if(arr[i+1]){
												moveIndex = parseInt(arr[i+1]);
											}

											pokemon.addNewMove(arr[i], movePool, true, moveType, moveIndex);
											customMoveIndexes.push(moveIndex);
										}
									}

									pokemon.selectMove("fast", pokemon.fastMovePool[arr[0]].moveId, 0);

									for(var n = 1; n < arr.length; n++){
										// Don't set this move if already set as a custom move

										if(customMoveIndexes.indexOf(n-1) > -1){
											continue;
										}


										var moveId = "none";

										if(arr[n] > 0){
											moveId = pokemon.chargedMovePool[arr[n]-1].moveId;
										}

										if(moveId != "none"){
											pokemon.selectMove("charged", moveId, n-1);
										} else{
											if((arr[1] == "0")&&(arr[2] == "0")){
												pokemon.selectMove("charged", moveId, 0); // Always deselect the first move because removing it pops the 2nd move up
											} else{
												pokemon.selectMove("charged", moveId, n-1);
											}
										}

									}

									pokeList.push(pokemon);
								}

								multiSelectors[0].setPokemonList(pokeList);
								break;

							case "cp":
								//Parse this out if it contains level cap
								var getCP = val;

								if(val.indexOf("-") > -1){
									getCP = val.split("-")[0];
								}

								battle.setCP(getCP);

								// Set format

								$(".format-select option[value=\""+getCP+"\"][cup=\""+battle.getCup().name+"\"]").prop("selected","selected");
								break;

							case "cup":
								battle.setCup(val);

								if(battle.getCup().tierRules){
									multiSelectors[0].setCliffhangerMode(true);
								} else{
									multiSelectors[0].setCliffhangerMode(false);
								}
								break;

							case "m1":
							case "m2":
							case "m3":
								var index = 0;

								if(key == "m2"){
									index = 1;
								} else if(key == "m3"){
									index = 2;
								}

								var poke = pokeSelectors[index].getPokemon();
								var arr = val.split('-');

								// Legacy move construction

								if(arr.length <= 1){
									arr = val.split('');
								}

								// Search string for any custom moves to add
								var customMoveIndexes = [];

								for(var i = 0; i < arr.length; i++){
									if(arr[i].match('([A-Z_]+)')){
										var move = gm.getMoveById(arr[i]);
										var movePool = (move.energyGain > 0) ? poke.fastMovePool : poke.chargedMovePool;
										var moveType = (move.energyGain > 0) ? "fast" : "charged";
										var moveIndex = 0;

										if(arr[i+1]){
											moveIndex = parseInt(arr[i+1]);
										}

										poke.addNewMove(arr[i], movePool, true, moveType, moveIndex);
										customMoveIndexes.push(moveIndex);
									}
								}


								var fastMoveId = $(".poke").eq(index).find(".move-select.fast option").eq(parseInt(arr[0])).val();
								poke.selectMove("fast", fastMoveId, 0);

								for(var i = 1; i < arr.length; i++){
									// Don't set this move if already set as a custom move

									if(customMoveIndexes.indexOf(i-1) > -1){
										continue;
									}

									var moveId = $(".poke").eq(index).find(".move-select.charged").eq(i-1).find("option").eq(parseInt(arr[i])).val();

									if(moveId != "none"){
										poke.selectMove("charged", moveId, i-1);
									} else{
										if((arr[1] == "0")&&(arr[2] == "0")){
											poke.selectMove("charged", moveId, 0); // Always deselect the first move because removing it pops the 2nd move up
										} else{
											poke.selectMove("charged", moveId, i-1);
										}
									}

								}

								break;
						}
					}

				}

				// Update both Pokemon selectors

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].update();
				}

				// Auto run the battle

				$(".rate-btn").trigger("click");
			}

			// Callback for loading ranking data

			this.displayRankingData = function(data){
				console.log("Ranking data loaded");

				if(runningResults){
					self.updateTeamResults();

					$("html, body").animate({ scrollTop: $(".section.typings a").first().offset().top }, 500);


					$(".rate-btn").html("Rate Team");
				}
			}

			// Update team info output

			this.updateTeamResults = function(){

				var key = battle.getCup().name + "overall" + battle.getCP();

				if(! gm.rankings[key]){
					runningResults = true;
					gm.loadRankingData(self, "overall", battle.getCP(), battle.getCup().name);
					return false;
				}

				var metaKey = $(".format-select option:selected").attr("meta-group");

				if(! gm.groups[metaKey]){
					runningResults = true;
					gm.loadGroupData(self, metaKey);
					return false;
				}

				var metaGroup = gm.groups[metaKey];

				// Gather advanced settings
				var scorecardCount = parseInt($(".scorecard-length-select option:selected").val());
				var allowShadows = $(".team-option .check.allow-shadows").hasClass("on");
				var allowXL = $(".team-option .check.allow-xl").hasClass("on");
				var baitShields = $(".team-option .check.shield-baiting").hasClass("on");

				if(battle.getCup().name == "shadow"){
					allowShadows = true;
				}

				// Get team and validate results

				var team = multiSelectors[0].getPokemonList();

				if(team.length == 0){
					$(".section.error").show();
					return false;
				}

				// Process defensive and offensive matchups

				var defenseArr = [];
				var offenseArr = [];

				for(var i = 0; i < team.length; i++){
					var poke = team[i];

					defenseArr.push(
						{
							name: poke.speciesName,
							type: poke.types[0],
							matchups: this.getTypeEffectivenessArray(poke.types, "defense")
						});

					// Gather offensive matchups for fast move

					offenseArr.push(
						{
							name: poke.fastMove.name,
							type: poke.fastMove.type,
							matchups: this.getTypeEffectivenessArray([poke.fastMove.type], "offense")
						});

					// Gather offensive matchups for all charged moves

					for(var n = 0; n < poke.chargedMoves.length; n++){
						offenseArr.push(
							{
								name: poke.chargedMoves[n].name,
								type: poke.chargedMoves[n].type,
								matchups: this.getTypeEffectivenessArray([poke.chargedMoves[n].type], "offense")
							});
					}
				}

				// Display data

				$(".typings").show();

				this.displayArray(defenseArr, "defense");
				this.displayArray(offenseArr, "offense");
				this.generateSummaries(defenseArr, offenseArr);

				// Generate counters and histograms, and display that, too
				var shieldMode = $(".team-advanced .flex.poke .shield-select option:selected").val();
				var shieldCount = 1;

				if(shieldMode != "average"){
					shieldCount = parseInt(shieldMode);
					shieldMode = "single";
				}

				var ranker = RankerMaster.getInstance();
				ranker.setShieldMode(shieldMode);
				ranker.applySettings({
					shields: shieldCount,
					ivs: "original",
					bait: baitShields
				}, 0);
				ranker.applySettings({
					shields: shieldCount,
					ivs: "original",
					bait: baitShields
				}, 1);

				// Set targets for custom threats
				if(multiSelectors[1].getPokemonList().length > 0){
					ranker.setTargets(multiSelectors[1].getPokemonList());
				}

				var data = ranker.rank(team, battle.getCP(), battle.getCup(), [], "team-counters");
				var counterRankings = data.rankings;
				var teamRatings = data.teamRatings;
				var counterTeam = [];

				// Clear targets so it will default to the normal format if the user changes settings
				ranker.setTargets([]);

				results = counterRankings;

				// Let's start with the histograms, because they're kinda neat

				for(var i = 0; i < team.length; i++){
					if(histograms.length <= i){
						var histogram = new BattleHistogram($(".histogram").eq(i));
						histogram.generate(team[i], teamRatings[i]);

						histograms.push(histogram);
					} else{
						histograms[i].generate(team[i], teamRatings[i]);
					}
				}

				// Potential threats

				var csv = ','; // CSV data of all matchups
				$(".section.typings .rankings-container").html('');
				$(".threats-table").html("");
				$(".meta-table").html("");

				var $row = $("<thead><tr><td></td></tr></thead>");

				for(var n = 0; n < team.length; n++){
					$row.find("tr").append("<td class=\"name-small\">"+team[n].speciesName+"</td>");

					csv += team[n].speciesName + ' ' + team[n].generateMovesetStr();
					if(n < team.length -1){
						csv += ',';
					}
				}

				csv += ',Threat Score,Overall Rating';

				$(".threats-table").append($row);
				$(".meta-table").append($row.clone());
				$(".threats-table").append("<tbody></tbody>");
				$(".meta-table").append("<tbody></tbody>");

				var avgThreatScore = 0;
				var count = 0;
				var total = scorecardCount;
				var i = 0;

				while((count < total)&&(i < counterRankings.length)){
					var r = counterRankings[i];

					if((r.speciesId.indexOf("_shadow") > -1)&&(! allowShadows)){
						i++;
						continue;
					}

					if(r.speciesId.indexOf("_xs") > -1){
						i++;
						continue;
					}

					var pokemon = r.pokemon;

					// Display threat score
					if(count < 20){
						avgThreatScore += r.score;
					}

					// Push to counter team

					if(count < 6){
						counterTeam.push(pokemon);
					}

					// Add results to threats table

					$row = $("<tr><th class=\"name\"><b>"+(count+1)+". "+pokemon.speciesName+"</b></th></tr>");

					for(var n = 0; n < r.matchups.length; n++){
						var $cell = $("<td><a class=\"rating\" href=\"#\" target=\"blank\"><span></span></a></td>");
						var rating = r.matchups[n].rating;

						if(rating == 500){
							$cell.find("a").addClass("tie");
						} else if( (rating < 500) && (rating > 250)){
							$cell.find("a").addClass("close-loss");
						} else if( rating <= 250){
							$cell.find("a").addClass("loss");
						} else if( (rating > 500) && (rating < 750)){
							$cell.find("a").addClass("close-win");
						} else if( rating >= 750){
							$cell.find("a").addClass("win");
						}

						if(! baitShields){
							pokemon.isCustom = true;
							pokemon.baitShields = false;
							r.matchups[n].opponent.isCustom = true;
							r.matchups[n].opponent.baitShields = false;
						}

						var pokeStr = pokemon.generateURLPokeStr();
						var moveStr = pokemon.generateURLMoveStr();
						var opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
						var opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
						var shieldStr = shieldCount + "" + shieldCount;
						var battleLink = host+"battle/"+battle.getCP(true)+"/"+pokeStr+"/"+opPokeStr+"/"+shieldStr+"/"+moveStr+"/"+opMoveStr+"/";
						$cell.find("a").attr("href", battleLink);

						$row.append($cell);
					}

					i++;
					count++;

					$(".threats-table tbody").append($row);
				}

				// Display average threat score
				avgThreatScore = Math.round(avgThreatScore / 20);
				$(".threat-score").html(avgThreatScore);

				// Build CSV results

				for(var i = 0; i < counterRankings.length; i++){
					var r = counterRankings[i];

					csv += '\n';

					csv += r.speciesName + ' ' + r.pokemon.generateMovesetStr() + ',';

					for(var n = 0; n < r.matchups.length; n++){
						csv += r.matchups[n].rating;

						if(n < r.matchups.length-1){
							csv += ',';
						}
					}

					csv += ',' + (Math.round(r.score*10)/10) + ',' + r.overall;
				}

				// Display meta scorecard
				if(multiSelectors[1].getPokemonList().length == 0){
					counterRankings.sort((a,b) => (a.overall > b.overall) ? -1 : ((b.overall > a.overall) ? 1 : 0));
				} else{
					counterRankings.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));
				}


				count = 0;
				total = scorecardCount;
				i = 0;

				while((count < total)&&(i < counterRankings.length)){
					var r = counterRankings[i];

					if((r.speciesId.indexOf("_shadow") > -1)&&(! allowShadows)){
						i++;
						continue;
					}

					if((r.speciesId.indexOf("_xs") > -1)&&(allowXL)){
						i++;
						continue;
					}

					if((r.pokemon.needsXLCandy())&&(! allowXL)){
						i++;
						continue;
					}

					// Skip Pokemon if it isn't in the current meta group
					if(multiSelectors[1].getPokemonList().length == 0){
						var inMetaGroup = false;

						for(var n = 0; n < metaGroup.length; n++){
							var searchId = metaGroup[n].speciesId;
							searchId = searchId.replace("_shadow","");
							searchId = searchId.replace("_xs","");
							searchId = searchId.replace("_xl","");

							if(searchId == r.speciesId){
								inMetaGroup = true;
							}
						}

						if(! inMetaGroup){
							i++;
							continue;
						}
					}

					var pokemon = r.pokemon;

					// Add results to meta table

					$row = $("<tr><th class=\"name\"><b>"+pokemon.speciesName+"</b></th></tr>");

					for(var n = 0; n < r.matchups.length; n++){
						var $cell = $("<td><a class=\"rating\" href=\"#\" target=\"blank\"><span></span></a></td>");
						var rating = r.matchups[n].rating;

						if(rating == 500){
							$cell.find("a").addClass("tie");
						} else if( (rating < 500) && (rating > 250)){
							$cell.find("a").addClass("close-loss");
						} else if( rating <= 250){
							$cell.find("a").addClass("loss");
						} else if( (rating > 500) && (rating < 750)){
							$cell.find("a").addClass("close-win");
						} else if( rating >= 750){
							$cell.find("a").addClass("win");
						}

						if(! baitShields){
							pokemon.isCustom = true;
							pokemon.baitShields = false;
							r.matchups[n].opponent.isCustom = true;
							r.matchups[n].opponent.baitShields = false;
						}

						var pokeStr = pokemon.generateURLPokeStr();
						var moveStr = pokemon.generateURLMoveStr();
						var opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
						var opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
						var shieldStr = shieldCount + "" + shieldCount;
						var battleLink = host+"battle/"+battle.getCP(true)+"/"+pokeStr+"/"+opPokeStr+"/"+shieldStr+"/"+moveStr+"/"+opMoveStr+"/";
						$cell.find("a").attr("href", battleLink);

						$row.append($cell);
					}

					i++;
					count++;

					$(".meta-table tbody").append($row);
				}

				// And for kicks, generate the counters to those counters

				var exclusionList = []; // Exclude the current team from the alternative results

				for(var i = 0; i < team.length; i++){
					exclusionList.push(team[i].speciesId);
				}

				// Exclude any Pokemon specified in the advanced settings

				var manuallyExcluded = multiSelectors[3].getPokemonList();

				for(var i = 0; i < manuallyExcluded.length; i++){
					exclusionList.push(manuallyExcluded[i].speciesId);
				}

				// In Cliffhanger, exclude Pokemon that would put the team over the point limit
				var tiers = [];

				if(battle.getCup().tierRules){
					var cliffObj = multiSelectors[0].calculateCliffhangerPoints();
					var remainingPoints = cliffObj.max - cliffObj.points;
					tiers = cliffObj.tiers;
					var remainingPicks = 6 - team.length;

					// Reduce remaining points by the cost of remaining picks so incompatible tiers aren't suggested
					remainingPoints -= (remainingPicks - 1) * cliffObj.floor;

					console.log("remaining points:" + remainingPoints);

					// Add ineligible tiers to the exclusion list
					for(var i = 0; i < tiers.length; i++){
						if(remainingPoints < tiers[i].points){
							for(var n = 0; n < tiers[i].pokemon.length; n++){
								exclusionList.push(tiers[i].pokemon[n]);
								exclusionList.push(tiers[i].pokemon[n]+"_shadow");
								exclusionList.push(tiers[i].pokemon[n]+"_xl");
							}
						}
					}
				}

				// For Season 2 continentals, exclude Pokemon in already occupied slots

				if((battle.getCup().name == "prismatic")&&(team.length < 6)){
					// Add ineligible Pokemon to the exclusion list
					var slots = battle.getCup().slots;

					for(var i = 0; i < slots.length; i++){
						for(var n = 0; n < team.length; n++){
							if(slots[i].pokemon.indexOf(team[n].speciesId) > -1){
								for(var j = 0; j < slots[i].pokemon.length; j++){
									exclusionList.push(slots[i].pokemon[j]);
								}

								continue;
							}
						}
					}
				}

				// If using a restricted Pokemon, exclude restricted list

				if(battle.getCup().restrictedPokemon){
					for(var i = 0; i < team.length; i++){
						if(battle.getCup().restrictedPokemon.indexOf(team[i].speciesId) > -1){
							for(var n = 0; n < battle.getCup().restrictedPokemon.length; n++){
								exclusionList.push(battle.getCup().restrictedPokemon[n]);
							}

							break;
						}
					}
				}

				// Set targets for custom alternatives
				if(multiSelectors[2].getPokemonList().length > 0){
					ranker.setTargets(multiSelectors[2].getPokemonList());
				}

				var altRankings = ranker.rank(counterTeam, battle.getCP(), battle.getCup(), exclusionList).rankings;

				altRankings.sort((a,b) => (a.matchupAltScore > b.matchupAltScore) ? -1 : ((b.matchupAltScore > a.matchupAltScore) ? 1 : 0));

				// Clear targets so it will default to the normal format if the user changes settings
				ranker.setTargets([]);

				$(".alternatives-table").html("");

				var $row = $("<thead><tr><td></td></tr></thead>");

				for(var n = 0; n < counterTeam.length; n++){
					$row.find("tr").append("<td class=\"name-small\">"+counterTeam[n].speciesName+"</td>");
				}

				$(".alternatives-table").append($row);
				$(".alternatives-table").append("<tbody></tbody>");

				count = 0;
				total = scorecardCount;
				i = 0;

				// For labyrinth cup, exclude types already on team
				var excludedTypes = [];

				if(battle.getCup().name == "labyrinth"){
					for(var n = 0; n < team.length; n++){
						excludedTypes.push(team[n].types[0]);

						if(team[n].types[1] != "none"){
							excludedTypes.push(team[n].types[1]);
						}
					}
				}

				// For Continentals, exclude slots that are already filled
				var usedSlots = [];

				if(battle.getCup().name == "continentals-3"){
					for(var n = 0; n < team.length; n++){
						usedSlots.push(team[n].getContinentalSlot());
					}
				}

				while((count < total)&&(i < altRankings.length)){
					var r = altRankings[i];

					if((r.speciesId.indexOf("_shadow") > -1)&&(! allowShadows)){
						i++
						continue;
					}

					if((r.speciesId.indexOf("_xs") > -1)&&(allowXL)){
						i++;
						continue;
					}

					if((r.pokemon.needsXLCandy())&&(! allowXL)){
						i++;
						continue;
					}

					var pokemon = r.pokemon;

					// For Labyrinth Cup, exclude Pokemon of existing types
					if(battle.getCup().name == "labyrinth"){
						if(excludedTypes.indexOf(pokemon.types[0]) > -1 || excludedTypes.indexOf(pokemon.types[1]) > -1){
							i++;
							continue;
						}
					}

					// For Continentals, exclude Pokemon of existing slots
					if(battle.getCup().name == "continentals-3"){
						if(usedSlots.indexOf(pokemon.getContinentalSlot()) > -1){
							i++;
							continue;
						}
					}
					
					// Add results to alternatives table

					$row = $("<tr><th class=\"name\"><b>"+(count+1)+". "+pokemon.speciesName+"<div class=\"button add\" pokemon=\""+pokemon.speciesId+"\">+</div></b></th></tr>");

					for(var n = 0; n < r.matchups.length; n++){
						var $cell = $("<td><a class=\"rating\" href=\"#\" target=\"blank\"><span></span></a></td>");
						var rating = r.matchups[n].rating;

						if(rating == 500){
							$cell.find("a").addClass("tie");
						} else if( (rating < 500) && (rating > 250)){
							$cell.find("a").addClass("close-loss");
						} else if( rating <= 250){
							$cell.find("a").addClass("loss");
						} else if( (rating > 500) && (rating < 750)){
							$cell.find("a").addClass("close-win");
						} else if( rating >= 750){
							$cell.find("a").addClass("win");
						}

						if(! baitShields){
							pokemon.isCustom = true;
							pokemon.baitShields = false;
							r.matchups[n].opponent.isCustom = true;
							r.matchups[n].opponent.baitShields = false;
						}

						var pokeStr = pokemon.generateURLPokeStr();
						var moveStr = pokemon.generateURLMoveStr();
						var opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
						var opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
						var shieldStr = shieldCount + "" + shieldCount;
						var battleLink = host+"battle/"+battle.getCP(true)+"/"+pokeStr+"/"+opPokeStr+"/"+shieldStr+"/"+moveStr+"/"+opMoveStr+"/";
						$cell.find("a").attr("href", battleLink);

						$row.append($cell);
					}

					// Add region for alternative Pokemon for Continentals
					if(battle.getCup().name == "continentals-3"){
						var slotNumber = pokemon.getContinentalSlot();
						var regions = gm.data.pokemonRegions;
						var regionName = regions[slotNumber-1].name;

						$row.find("th.name").append("<div class=\"region-label "+regionName.toLowerCase()+"\">Slot "+ slotNumber + "</div>");
					}

					// Add points for alternative Pokemon for Cliffhanger
					if(battle.getCup().tierRules){
						var tierName = "";
						var pointsName = "points";
						var points = gm.getPokemonTier(pokemon.speciesId, battle.getCup());

						if(points == 1){
							pointsName = "point";
						}

						$row.find("th.name").append("<div class=\"region-label "+tierName.toLowerCase()+"\">"+points+" "+pointsName+"</div>");
					}

					// Add slot label for Continentals
					if(battle.getCup().name == "prismatic"){
						var tierName = "";
						var slot = 0;

						var slots = battle.getCup().slots;

						for(var j = 0; j < slots.length; j++){
							if(slots[j].pokemon.indexOf(pokemon.speciesId) > -1){
								slot = j+1;
								break;
							}
						}

						$row.find("th.name").append("<div class=\"region-label\">Slot "+slot+"</div>");
					}

					$(".alternatives-table tbody").append($row);

					i++;
					count++;
				}



				if(team.length == 6){
					$(".alternatives-table .button.add").hide();
				}

				// Update the overall team grades
				$(".overview-section .notes div").hide();

				// Coverage grade, take threat score
				var threatGrade = self.calculateLetterGrade(1200 - avgThreatScore, 640);

				$(".overview-section.coverage .grade").html(threatGrade.letter);
				$(".overview-section.coverage .grade").attr("grade", threatGrade.letter);
				$(".overview-section.coverage .notes div[grade=\""+threatGrade.letter+"\"]").show();

				// Bulk grade, average HP x Defense stats
				var leagueAverageBulk = [22000,35000,35000,10000];
				var averageBulk = 0;
				var goalBulk = leagueAverageBulk[0];

				for(var i = 0; i < team.length; i++){
					team[i].fullReset();
					averageBulk += (team[i].getEffectiveStat(1) * team[i].stats.hp);
				}

				averageBulk /= team.length;

				if(battle.getCP() == 2500){
					goalBulk = leagueAverageBulk[1];
					if(battle.getCup().name == "premier"){
						goalBulk = 33000;
					}
				} else if(battle.getCP() == 10000){
					goalBulk = leagueAverageBulk[2];
				} else if(battle.getCP() == 500){
					goalBulk = leagueAverageBulk[3];
				}

				var bulkGrade = self.calculateLetterGrade(averageBulk, goalBulk);
				$(".overview-section.bulk .grade").html(bulkGrade.letter);
				$(".overview-section.bulk .grade").attr("grade", bulkGrade.letter);
				$(".overview-section.bulk .notes div[grade=\""+bulkGrade.letter+"\"]").show();

				// Safety grade, how safe these Pokemon's matchups are

				var overallRankings = gm.rankings[key];
				var averageSafety = 0;

				for(var i = 0; i < team.length; i++){
					var safety = 60;

					for(var n = 0; n < overallRankings.length; n++){
						if(team[i].speciesId == overallRankings[n].speciesId){
							safety = overallRankings[n].scores[2];
							break;
						}
					}
					averageSafety += safety;
				}

				averageSafety /= team.length;

				var safetyGrade = self.calculateLetterGrade(averageSafety, 98);
				$(".overview-section.safety .grade").html(safetyGrade.letter);
				$(".overview-section.safety .grade").attr("grade", safetyGrade.letter);
				$(".overview-section.safety .notes div[grade=\""+safetyGrade.letter+"\"]").show();

				// Consistency grade, how bait dependent movesets are
				var averageConsistency = 0;

				for(var i = 0; i < team.length; i++){
					averageConsistency += team[i].calculateConsistency();
				}

				averageConsistency /= team.length;

				var consistencyGrade = self.calculateLetterGrade(averageConsistency, 98);
				$(".overview-section.consistency .grade").html(consistencyGrade.letter);
				$(".overview-section.consistency .grade").attr("grade", consistencyGrade.letter);
				$(".overview-section.consistency .notes div[grade=\""+consistencyGrade.letter+"\"]").show();

				// Set download link data
				var cupTitle = "All Pokemon";
				if(battle.getCup().title){
					cupTitle = battle.getCup().title;
				}
				var filename = "Team vs. " + cupTitle + ".csv";
				var filedata = '';

				if (!csv.match(/^data:text\/csv/i)) {
					filedata = [csv];
					filedata = new Blob(filedata, { type: 'text/csv'});
				}

				$(".button.download-csv").attr("href", window.URL.createObjectURL(filedata));
				$(".button.download-csv").attr("download", filename);

				runningResults = false;
			}

			// Given a goal value, convert a score into a letter grade

			this.calculateLetterGrade = function(value, goal){
				var gradeScale = [
					{
						letter: "A",
						value: .9
					},
					{
						letter: "B",
						value: .8
					},
					{
						letter: "C",
						value: .7
					},
					{
						letter: "D",
						value: .6
					}
				];

				var percentage = value / goal;
				var letter="F";

				for(var i = gradeScale.length - 1; i >= 0; i--){
					if(percentage >= gradeScale[i].value){
						letter = gradeScale[i].letter;
					}
				}

				var result = {
					letter: letter
				}


				return result;
			}

			// Given a subject type, produce effectiveness array for offense or defense

			this.getTypeEffectivenessArray = function(subjectTypes, direction){
				var arr = [];

				var allTypes = this.getAllTypes();

				for(var n = 0; n < allTypes.length; n++){

					if(direction == "offense"){
						var effectiveness = battle.getEffectiveness(subjectTypes[0], [allTypes[n]]);

						// Round to nearest thousandths to avoid Javascript floating point wonkiness

						effectiveness = Math.floor(effectiveness * 1000) / 1000;

						arr.push(effectiveness);
					} else if(direction == "defense"){
						effectiveness = battle.getEffectiveness(allTypes[n], subjectTypes);

						// Round to nearest thousandths to avoid Javascript floating point wonkiness

						effectiveness = Math.floor(effectiveness * 1000) / 1000;

						arr.push(effectiveness);
					}
				}

				return arr;
			}

			// Array of all types

			this.getAllTypes = function(){
				var types = ["Bug","Dark","Dragon","Electric","Fairy","Fighting","Fire","Flying","Ghost","Grass","Ground","Ice","Normal","Poison","Psychic","Rock","Steel","Water"];

				return types;
			}

			this.displayArray = function(arr, direction){
				$(".typings ."+direction).html('');

				// Yes, actually using the <table> tag for its intended function

				var $table = $("<table></table>");

				// Output header row of all types

				var allTypes = this.getAllTypes();
				var $tr = $("<tr><td></td></tr>");

				for(var i = 0; i < allTypes.length; i++){
					$tr.append("<td class=\""+allTypes[i].toLowerCase()+" heading\">"+allTypes[i]+"</td>");
				}

				$table.append($tr);

				// Output row for each item in arr

				for(var i = 0; i < arr.length; i++){

					$tr = $("<tr></tr>");

					$tr.append("<td class=\""+arr[i].type+" name heading\">"+arr[i].name+"</td>");

					for(var n = 0; n < arr[i].matchups.length; n++){

						var number = arr[i].matchups[n];
						var colors = ['81, 251, 35', '251, 35, 81'];
						var colorIndex = 0;
						var opacity = 0;

						// Display green for resistance and effective moves, red for weaknesses and ineffective moves

						if(direction == "defense"){
							if(number < 1){
								colorIndex = 0;
								opacity = .244 / number;
							} else if(number > 1){
								colorIndex = 1;
								opacity = number / 2.65;
							}
						} else if(direction == "offense"){
							if(number < 1){
								colorIndex = 1;
								opacity = .39 / number;
							} else if(number > 1){
								colorIndex = 0;
								opacity = number / 1.6;
							}
						}

						$tr.append("<td style=\"background:rgba("+colors[colorIndex]+","+opacity+")\">"+arr[i].matchups[n]+"</td>");
					}

					$table.append($tr);
				}

				$(".typings ."+direction).append($table);
			}

			// Given arrays for defensive and offensive effectiveness, produce a written summary

			this.generateSummaries = function(defenseArr, offenseArr){

				$(".summary").html('');

				// Defensive Summary

				var defenseSumArr = []; // Array of string items

				defenseSumArr = this.generateTypeSummary(defenseArr, defenseSumArr, "defense");

				var $defenseList = $("<ul></ul>");

				for(var i = 0; i < defenseSumArr.length; i++){
					$defenseList.append("<li>"+defenseSumArr[i]+"</li>");
				}

				$(".defense-summary").append($defenseList);

				// Offensive Summary

				var offenseSumArr = []; // Array of string items

				offenseSumArr = this.generateTypeSummary(offenseArr, offenseSumArr, "offense");

				var $offenseList = $("<ul></ul>");

				for(var i = 0; i < offenseSumArr.length; i++){
					$offenseList.append("<li>"+offenseSumArr[i]+"</li>");
				}

				$(".offense-summary").append($offenseList);
			}

			// Return an array of descriptions given an array of type effectiveness, and a flag for offense or defense

			this.generateTypeSummary = function(arr, sumArr, direction){
				var typesResistedArr = [];
				var typesWeakArr = [];
				var typesNeutralOrBetter = []; // Array of types that can be hit for neutral damage or better
				var productArr = []; // Product of resistances across all Pokemon

				var allTypes = this.getAllTypes();

				for(var i = 0; i < allTypes.length; i++){
					typesResistedArr.push(0);
					typesWeakArr.push(0);
					typesNeutralOrBetter.push(0);
					productArr.push(1);
				}

				for(var i = 0; i < arr.length; i++){
					var obj = arr[i];

					for(var n = 0; n < obj.matchups.length; n++){

						if(obj.matchups[n] < 1){
							typesResistedArr[n] = 1;
						} else if (obj.matchups[n] > 1){
							typesWeakArr[n] = 1;
						}

						if(obj.matchups[n] >= 1){
							typesNeutralOrBetter[n] = 1;
						}

						productArr[n] *= obj.matchups[n];
					}
				}
				// Produce a final defensive count

				var typesResisted = 0;
				var typesWeak = 0;
				var overallStrengths = [];
				var overallWeaknesses = [];
				var overallNoNeutralDamage = [];

				for(var i = 0; i < allTypes.length; i++){
					if(typesResistedArr[i] == 1){
						typesResisted++;
					}

					if(typesWeakArr[i] == 1){
						typesWeak++;
					}

					if(typesNeutralOrBetter[i] == 0){
						overallNoNeutralDamage.push(allTypes[i]);
					}

					if(productArr[i] < 1){
						overallStrengths.push(allTypes[i]);
					} else if(productArr[i] > 1){
						overallWeaknesses.push(allTypes[i]);
					}
				}

				if(direction == "defense"){
					sumArr.push("This team resists " + typesResisted + " of " + allTypes.length + " types.");
					sumArr.push("This team is weak to " + typesWeak + " of " + allTypes.length + " types.");
				} else if(direction == "offense"){
					sumArr.push("This team can hit " + typesWeak + " of " + allTypes.length + " types super effectively.");
				}

				var str;

				// On defense show which types are best resisted, and on offense show which types are best hit effectively

				if(overallStrengths.length > 0){
					if(direction=="defense"){
						str = this.generateTypeSummaryList(overallStrengths, "Overall, strong against","");
					} else if(direction=="offense"){
						str = this.generateTypeSummaryList(overallWeaknesses, "Overall, most effective against","");
					}

					sumArr.push(str);
				}

				// On defense, show list of types that hit this team most effectively

				if((overallWeaknesses.length > 0) && (direction == "defense")){
					str = this.generateTypeSummaryList(overallWeaknesses, "Overall, weak to","");

					sumArr.push(str);
				}

				// On offense, show list of types that can't be hit with neutral or better damage

				if((overallNoNeutralDamage.length > 0) && (direction == "offense")){
					str = this.generateTypeSummaryList(overallNoNeutralDamage, "This team can't hit", " for at least neutral damage.");

					sumArr.push(str);
				}

				return sumArr;
			}

			// Generate and return a descriptive string given a list of types

			this.generateTypeSummaryList = function(arr, beforeStr, afterStr){

				var str = beforeStr;

				for(var i = 0; i < arr.length; i++){
					if(i > 0){
						str += ",";

						if((i == arr.length - 1) && (i > 1)){
							str += " and";
						}
					}

					str += " <span class=\"" + arr[i].toLowerCase() + "\">" + arr[i] + "</span>";
				}

				str += afterStr;

				return str;
			}

			// Event handler for changing the cup select

			function selectFormat(e){
				var cp = $(".format-select option:selected").val();
				var cup = $(".format-select option:selected").attr("cup");

				battle.setCP(cp);
				battle.setCup(cup);

				var levelCap = 50;

				if(battle.getCup().levelCap){
					levelCap = battle.getCup().levelCap;
				}

				battle.setLevelCap(levelCap);

				// Set the selected team to the new CP
				for(var i = 0; i < multiSelectors.length; i++){
					multiSelectors[i].setCP(cp);
					multiSelectors[i].setLevelCap(levelCap);
				}

				if(battle.getCup().tierRules){
					multiSelectors[0].setCliffhangerMode(true);
				} else{
					multiSelectors[0].setCliffhangerMode(false);
				}

				// Load ranking data for movesets
				var key = battle.getCup().name + "overall" + battle.getCP();

				if(! gm.rankings[key]){
					gm.loadRankingData(self, "overall", battle.getCP(), battle.getCup().name);
				}
			}

			// Event handler for clicking the rate button

			function rateClick(e){
				$(".rate-btn").html("Generating...");
				$(".section.error").hide();

				// This is stupid but the visual updates won't execute until Javascript has completed the entire thread

				setTimeout(function(){
					var results = self.updateTeamResults();

					// Set new page state
					var cp = battle.getCP(true);
					var cup = battle.getCup().name;

					var pokes = multiSelectors[0].getPokemonList();
					var moveStrs = [];
					var teamStr = "team-builder/"+cup+"/"+cp+"/";

					for(var i = 0; i < pokes.length; i++){

						var poke = pokes[i];

						moveStrs.push(poke.generateURLMoveStr());

						teamStr += pokes[i].generateURLPokeStr("team-builder");

						if(i < pokes.length - 1){
							teamStr += "%2C";
						}
					}

					// Add move strings to URL

					var link = host + teamStr;

					$(".share-link input").val(link);

					// Push state to browser history so it can be navigated, only if not from URL parameters

					if(get){

						var sameTeam = true;

						for(var i = 0; i < pokes.length; i++){
							if(get["p"+(i+1)] != pokes[i].speciesId){
								sameTeam = false;
							}
						}

						if(get["cup"] != cup){
							sameTeam = false;
						}

						if(sameTeam){
							return;
						}
					}

					var url = webRoot+teamStr;

					// No guarantee the user will have selected 3 Pokemon, so need to account for all possibilities

					var data = {cup: cup, cp: cp};

					for(var i = 0; i < pokes.length; i++){
						data["p"+(i+1)] = pokes[i].speciesId;
						data["m"+(i+1)] = moveStrs[i];
					}

					window.history.pushState(data, "Team Builder", url);

					// Send Google Analytics pageview

					gtag('config', UA_ID, {page_location: (host+url), page_path: url});



					if(results === false){
						return;
					}

					$(".rate-btn").html("Rate Team");

					// Scroll down to results

					$("html, body").animate({ scrollTop: $(".section.typings a").first().offset().top }, 500);

					},
				10);

			}

			// Add a Pokemon from the alternatives table

			function addAlternativePokemon(e){
				var id = $(e.target).attr("pokemon");
				$(".poke-select-container .poke.multi .add-poke-btn").trigger("click");
				$(".modal .poke-select option[value=\""+id+"\"]").prop("selected", "selected");
				$(".modal .poke-select").trigger("change");
				$("html, body").animate({ scrollTop: $(".poke.multi").offset().top }, 500);
			}

			// Open the print dialogue

			function printScorecard(e){
				e.preventDefault();

				$("body").addClass("scorecard-print");

				window.print();
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
				$(this).trigger("change");
			}
		};

        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
