// JavaScript Document

var InterfaceMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new interfaceObject();
		
		function interfaceObject(){
			
			var gm;
			var battle;
			var pokeSelectors = [];
			var self = this;
			
			var currentHistograms = [];
			var previousHistograms = [];
			
			this.context = "team";

			this.init = function(){
				
				gm = GameMaster.getInstance();
				var data = gm.data;
				
				// Initialize selectors and push Pokemon data

				$(".poke-select-container .poke").each(function(index, value){
					var selector = new PokeSelect($(this), index);
					pokeSelectors.push(selector);

					selector.init(data.pokemon);
				});
				
				$(".league-select").on("change", selectLeague);
				$(".cup-select").on("change", selectCup);
				$(".rate-btn").on("click", rateClick);
				$("body").on("click",".histogram .button", histogramButtonClick);
				
				battle = BattleMaster.getInstance();
				
				// If get data exists, load settings

				this.loadGetData();
				
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
							case "p1":
								pokeSelectors[0].setPokemon(val);
								break;
								
							case "p2":
								pokeSelectors[1].setPokemon(val);
								break;
								
							case "p3":
								pokeSelectors[2].setPokemon(val);
								break;
								
							case "cp":
								$(".league-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".league-select").trigger("change");
								break;
								
							case "cup":
								$(".cup-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".cup-select").trigger("change");
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
								var arr = val.split('');
								
								var fastMoveId = $(".poke").eq(index).find(".move-select.fast option").eq(parseInt(arr[0])).val();
								poke.selectMove("fast", fastMoveId, 0);
								
								for(var i = 1; i < arr.length; i++){
									var moveId = $(".poke").eq(index).find(".move-select.charged").eq(i-1).find("option").eq(parseInt(arr[i])).val();
									
									poke.selectMove("charged", moveId, i-1);
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
			
			// Update team info output
			
			this.updateTeamResults = function(){
				
				// Get team and validate results
				
				var team = [];
				
				for(var i = 0; i < pokeSelectors.length; i++){
					var poke = pokeSelectors[i].getPokemon();
					
					if(poke){
						team.push(poke);
					}
				}
				
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
				var data = ranker.rank(team, battle.getCP());
				var counterRankings = data.rankings;
				var teamRatings = data.teamRatings;
				var counterTeam = [];
				
				// Let's start with the histograms, because they're kinda neat
				
				$(".histograms").html('');
				
				if(currentHistograms){
					previousHistograms = currentHistograms; // Save previous for comparison
				}
				
				currentHistograms = [];
				
				var divisions = 20;
				var increment = 1000 / divisions; // Max Battle Rating of 1000, so divide that into equal chunks
				
				for(var i = 0; i < team.length; i++){
					
					var histogramCounts = []; // Stores the number of matchups in each bracket
					
					for(var n = 0; n < divisions; n++){
						histogramCounts.push(0);
					}
					
					// Bucket individual battle ratings into the histogram segments
					
					var ratings = teamRatings[i];
					
					for(var n = 0; n < ratings.length; n++){
						var division = Math.ceil(ratings[n] / increment) - 1; // Ensures a range of 0 to the number of divisions
						
						histogramCounts[division]++;
					}
					
					// Generate list of moves so it can be referenced above the chart
					
					var moveStr = team[i].fastMove.name;
					
					for(var n = 0; n < team[i].chargedMoves.length; n++){
						moveStr += ", " + team[i].chargedMoves[n].name;
					}
					
					var $histogram = $("<div class=\"histogram\"><h2>"+team[i].speciesName+"</h2><div class=\"move-label\">"+moveStr+"</div><div class=\"chart\"></div><div class=\"x-axis\"><div>0</div><div>500</div><div>1000</div></div><div class=\"label rating star\">Battle Rating</div><div class=\"button previous\">See Previous</div></div>");
					
					var scale = Math.floor(ratings.length / 4);
					var winColors = [
						[93,71,165],
						[0,143,187]
					]; // rgb
					var lossColors = [
						[186,0,143],
						[93,71,165]
					]; // rgb
					
					var barHeights = [];
					
					for(var n = 0; n < histogramCounts.length; n++){
						var height = (histogramCounts[n] / scale) * 100;
						var width = 100 / divisions;
						var $segment = $("<div class=\"segment\"><div class=\"bar\"></div></div>");
						
						barHeights.push(height);
						
						$segment.css("width", width+"%");
						$segment.find(".bar").css("height", height+"%");
												
						// Apply a gradient to bar color
						var colors = (n <= histogramCounts.length / 2) ? lossColors : winColors;
						var color = [ colors[0][0], colors[0][1], colors[0][2] ];
						
						for(var j = 0; j < color.length; j++){
							var range = colors[1][j] - color[j];
							var base = color[j];
							var ratio = (n / (histogramCounts.length / 2));
							
							if(ratio > 1){
								ratio -= 1;
							}
							
							color[j] = Math.floor(base + (range * ratio));
						}
						
						$segment.find(".bar").css("background", "rgb("+color[0]+","+color[1]+","+color[2]+")");
						
						$histogram.find(".chart").append($segment);
						
						if(previousHistograms.length > i){
							$histogram.find(".button").html("See Previous: " + previousHistograms[i].name);
							$histogram.find(".button").css("display","block");
						}
					}
					
					$(".histograms").append($histogram);
					
					// Store histogram for later comparison
					
					currentHistograms.push({
						name: team[i].speciesName,
						moves: moveStr,
						bars: barHeights
					});
				}
				
				$(".rankings-container").html('');
				
				for(var i = 0; i < 10; i++){
					var r = counterRankings[i];
					
					var pokemon = new Pokemon(r.speciesId);
					counterTeam.push(pokemon);
					
					var $el = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\"><div class=\"name-container\"><span class=\"number\">#"+(i+1)+"</span><span class=\"name\">"+pokemon.speciesName+"</span></div><div class=\"rating-container\"><div class=\"rating star\">"+r.rating+"</span></div><div class=\"clear\"></div></div><div class=\"details\"></div>");

					$(".rankings-container.threats").append($el);
				}
				
				// And for kicks, generate the counters to those counters
				
				var altRankings = ranker.rank(counterTeam, battle.getCP()).rankings;
				
				for(var i = 0; i < 10; i++){
					var r = altRankings[i];
					
					var pokemon = new Pokemon(r.speciesId);
					counterTeam.push(pokemon);
					
					var $el = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\"><div class=\"name-container\"><span class=\"number\">#"+(i+1)+"</span><span class=\"name\">"+pokemon.speciesName+"</span></div><div class=\"rating-container\"><div class=\"rating star\">"+r.rating+"</span></div><div class=\"clear\"></div></div><div class=\"details\"></div>");

					$(".rankings-container.alternatives").append($el);
				}
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
				
				console.log(gm);
				
				var cupTypes = gm.data.cups[cup];
				
				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].filterByTypes(cupTypes);
				}
			}
			
			// Event handler for clicking the rate button
			
			function rateClick(e){
				$(".rate-btn").html("Generating...");
				$(".section.error").hide();
				
				// This is stupid but the visual updates won't execute until Javascript has completed the entire thread
				
				setTimeout(function(){
					var results = self.updateTeamResults();

					$(".rate-btn").html("Rate Team");

					if(results === false){
						return;
					}

					// Scroll down to results
					
					$("html, body").animate({ scrollTop: $(".defense").offset().top }, 500);
					
					// Set new page state
					var cp = battle.getCP();
					var cup = battle.getCup().name;
					
					var pokes = [];
					var moveStrs = [];
					var teamStr = "team-builder/"+cup+"/"+cp+"/";
					
					for(var i = 0; i < pokeSelectors.length; i++){
						
						var poke = pokeSelectors[i].getPokemon();
						
						if(! poke){
							continue;
						}
						
						pokes.push(poke);
						
						var fastMoveIndex = pokes[i].fastMovePool.indexOf(pokes[i].fastMove);
						var chargedMove1Index = pokes[i].chargedMovePool.indexOf(pokes[i].chargedMoves[0])+1;
						var chargedMove2Index = pokes[i].chargedMovePool.indexOf(pokes[i].chargedMoves[1])+1;

						moveStrs.push(fastMoveIndex + "" + chargedMove1Index + "" + chargedMove2Index);
						
						teamStr += pokes[i].speciesId + "/";
					}
					
					// Add move strings to URL
					
					for(var i = 0; i < moveStrs.length; i++){
						teamStr += moveStrs[i] + "/";
					}

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

					},10);

			}
			
			// Animate a previous or current histogram
			
			function histogramButtonClick(e){
				var index = $(".histogram .button").index($(e.target));
				var $histogram = $(".histogram").eq(index);
				
				var data = previousHistograms[index];
				
				if($(e.target).hasClass("current")){
					data = currentHistograms[index];
					
					$(e.target).html("See Previous: " + previousHistograms[index].name);
				} else{
					$(e.target).html("See Current: " + currentHistograms[index].name);
				}
				
				$(e.target).toggleClass("current");
				$(e.target).toggleClass("previous");
				
				$histogram.find("h2").html(data.name);
				$histogram.find(".move-label").html(data.moves);
				
				// Animate each bar
				
				for(var i = 0; i < data.bars.length; i++){
					$histogram.find(".bar").eq(i).css("height", data.bars[i]+"%");
				}
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