// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var gm;
			var battle;
			var pokeSelectors = [];
			var multiSelector = new PokeMultiSelect($(".poke.multi"));
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

				multiSelector.init(data.pokemon, battle);
				multiSelector.setMaxPokemonCount(6);

				$(".league-select").on("change", selectLeague);
				$(".cup-select").on("change", selectCup);
				$(".format-select").on("change", selectFormat);
				$(".rate-btn").on("click", rateClick);
				$(".print-scorecard").on("click", printScorecard);
				$("body").on("click", ".alternatives-table .button.add", addAlternativePokemon);
				$("body").on("click", ".check", checkBox);

				// If get data exists, load settings

				this.loadGetData();

				// Load rankings for the current league

				if(! get){
					gm.loadRankingData(self, "overall", parseInt($(".league-select option:selected").val()), "all");
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
												pokemon.setShadowType(arr[n], false);
												break;
										}
									}

									// Split out the move string and select moves

									var moveStr = list[i].split("-m-")[1];
									arr = moveStr.split("-");

									console.log(arr);

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

								multiSelector.setPokemonList(pokeList);
								break;

							case "cp":
								$(".league-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".league-select").trigger("change");
								break;

							case "cup":
								$(".cup-select option[value=\""+val+"\"]").prop("selected","selected");

								if($(".format-select option[cup=\""+val+"\"]").length > 0){
									$(".format-select option[cup=\""+val+"\"]").prop("selected","selected");
								} else{
									var cat = $(".cup-select option[value=\""+val+"\"]").attr("cat");
									$(".format-select option[value=\""+cat+"\"]").prop("selected","selected");
									selectFormat();

									$(".cup-select option[value=\""+val+"\"]").prop("selected","selected");
								}

								var cup = $(".cup-select option:selected").val();
								battle.setCup(cup);
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

				// Get team and validate results

				var team = multiSelector.getPokemonList();

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

				var ranker = RankerMaster.getInstance();
				ranker.setShieldMode("average");

				var data = ranker.rank(team, battle.getCP(), battle.getCup(), [], "team-counters");
				var counterRankings = data.rankings;
				var teamRatings = data.teamRatings;
				var counterTeam = [];

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

				for(var i = 0; i < 10; i++){
					var r = counterRankings[i];

					var pokemon = new Pokemon(r.speciesId, 1, battle);
					pokemon.initialize(true);

					// Manually set moves if previously selected, otherwise autoselect
					var moveNameStr = '';

					if(r.moveset){
						pokemon.selectMove("fast", r.moveset.fastMove.moveId);

						moveNameStr = r.moveset.fastMove.name;

						for(var n = 0; n < r.moveset.chargedMoves.length; n++){
							pokemon.selectMove("charged", r.moveset.chargedMoves[n].moveId, n);

							moveNameStr += ", " + r.moveset.chargedMoves[n].name;
						}
					}

					// Display threat score
					avgThreatScore += r.score;

					// Push to counter team

					if(i < 6){
						counterTeam.push(pokemon);
					}

					// Add results to threats table

					$row = $("<tr><th class=\"name\"><b>"+(i+1)+". "+pokemon.speciesName+"</b></th></tr>");

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

						var pokeStr = pokemon.generateURLPokeStr();
						var moveStr = pokemon.generateURLMoveStr();
						var opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
						var opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
						var battleLink = host+"battle/"+battle.getCP()+"/"+pokeStr+"/"+opPokeStr+"/11/"+moveStr+"/"+opMoveStr+"/";
						$cell.find("a").attr("href", battleLink);

						$row.append($cell);
					}

					$(".threats-table tbody").append($row);
				}

				// Display average threat score
				avgThreatScore = Math.round(avgThreatScore / 200);
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

					csv += ',' + (Math.round(r.score/2)/10) + ',' + r.overall;
				}

				// Display meta scorecard
				counterRankings.sort((a,b) => (a.overall > b.overall) ? -1 : ((b.overall > a.overall) ? 1 : 0));

				for(var i = 0; i < 20; i++){
					var r = counterRankings[i];

					var pokemon = new Pokemon(r.speciesId, 1, battle);
					pokemon.initialize(true);

					// Manually set moves if previously selected, otherwise autoselect
					var moveNameStr = '';

					if(r.moveset){
						pokemon.selectMove("fast", r.moveset.fastMove.moveId);

						moveNameStr = r.moveset.fastMove.name;

						for(var n = 0; n < r.moveset.chargedMoves.length; n++){
							pokemon.selectMove("charged", r.moveset.chargedMoves[n].moveId, n);

							moveNameStr += ", " + r.moveset.chargedMoves[n].name;
						}
					}

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

						var pokeStr = pokemon.generateURLPokeStr();
						var moveStr = pokemon.generateURLMoveStr();
						var opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
						var opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
						var battleLink = host+"battle/"+battle.getCP()+"/"+pokeStr+"/"+opPokeStr+"/11/"+moveStr+"/"+opMoveStr+"/";
						$cell.find("a").attr("href", battleLink);

						$row.append($cell);
					}

					$(".meta-table tbody").append($row);
				}

				// And for kicks, generate the counters to those counters

				var exclusionList = []; // Exclude the current team from the alternative results

				for(var i = 0; i < team.length; i++){
					exclusionList.push(team[i].speciesId);
				}

				var altRankings = ranker.rank(counterTeam, battle.getCP(), battle.getCup(), exclusionList).rankings;

				$(".alternatives-table").html("");

				var $row = $("<thead><tr><td></td></tr></thead>");

				for(var n = 0; n < counterTeam.length; n++){
					$row.find("tr").append("<td class=\"name-small\">"+counterTeam[n].speciesName+"</td>");
				}

				$(".alternatives-table").append($row);
				$(".alternatives-table").append("<tbody></tbody>");

				for(var i = 0; i < 10; i++){
					var r = altRankings[i];

					var pokemon = new Pokemon(r.speciesId, 1, battle);

					// Manually set moves if previously selected, otherwise autoselect
					var moveNameStr = '';

					if(r.moveset){
						pokemon.selectMove("fast", r.moveset.fastMove.moveId);

						moveNameStr = r.moveset.fastMove.name;

						for(var n = 0; n < r.moveset.chargedMoves.length; n++){
							pokemon.selectMove("charged", r.moveset.chargedMoves[n].moveId, n);

							moveNameStr += ", " + r.moveset.chargedMoves[n].name;
						}
					}

					// Add results to alternatives table

					$row = $("<tr><th class=\"name\"><b>"+(i+1)+". "+pokemon.speciesName+"<div class=\"button add\" pokemon=\""+pokemon.speciesId+"\">+</div></b></th></tr>");

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

						var pokeStr = pokemon.generateURLPokeStr();
						var moveStr = pokemon.generateURLMoveStr();
						var opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
						var opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
						var battleLink = host+"battle/"+battle.getCP()+"/"+pokeStr+"/"+opPokeStr+"/11/"+moveStr+"/"+opMoveStr+"/";
						$cell.find("a").attr("href", battleLink);

						$row.append($cell);
					}

					$(".alternatives-table tbody").append($row);
				}

				if(team.length == 6){
					$(".alternatives-table .button.add").hide();
				}

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

			// Event handler for changing the league select

			function selectLeague(e){
				var allowed = [1500, 2500, 10000];
				var cp = parseInt($(".league-select option:selected").val());

				if(allowed.indexOf(cp) > -1){

					battle.setCP(cp);

					for(var i = 0; i < pokeSelectors.length; i++){
						pokeSelectors[i].setCP(cp);
					}
				}

			}

			// Event handler for changing the cup select

			function selectCup(e){
				var cup = $(".cup-select option:selected").val();
				battle.setCup(cup);

				// Filter PokeSelect options by type
				var cupTypes = [];
				cup = battle.getCup();

				for(var i = 0; i < cup.include.length; i++){
					if(cup.include[i].filterType == "type"){
						cupTypes = cup.include[i].values;
					}
				}

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].filterByTypes(cupTypes);
				}


				// Load ranking data for movesets
				var key = battle.getCup().name + "overall" + battle.getCP();

				if(! gm.rankings[key]){
					gm.loadRankingData(self, "overall", battle.getCP(), battle.getCup().name);
				}
			}

			// Event handler for changing the format category

			function selectFormat(e){
				var format = $(".format-select option:selected").val();
				var cup = $(".format-select option:selected").attr("cup");

				$(".cup-select option").hide();
				$(".cup-select option[cat=\""+format+"\"]").show();
				$(".cup-select option[cat=\""+format+"\"]").eq(0).prop("selected", true);

				if(cup){
					$(".cup-select option[value=\""+cup+"\"]").eq(0).prop("selected", true);
				}

				$(".cup-select").change();

				if((format == "all")||(cup)){
					$(".cup-select").hide();
				} else{
					$(".cup-select").show();
				}

				if(format == "custom"){
					// Redirect to the custom rankings page
					window.location.href = webRoot+'custom-rankings/';
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
					var cp = battle.getCP();
					var cup = battle.getCup().name;

					var pokes = multiSelector.getPokemonList();
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
				$(".poke.multi .add-poke-btn").trigger("click");
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
