// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var gm = GameMaster.getInstance();
			var battle;
			var pokeSelectors = [];
			var multiSelectors = [];
			var animating = false;
			var self = this;

			var bulkResults;

			var time = 0;
			var timelineInterval;
			var timelineScaleMode = "fit";

			var histogram;
			var bulkHistogram;
			var bulkResults;
			var matrixResults;

			this.context = "battle";
			this.battleMode = "single";
			this.matrixMode = "battle";

			var sandbox = false;
			var actions = [];
			var sandboxPokemon;
			var sandboxAction;
			var sandboxActionIndex;
			var sandboxTurn;

			var multiBattleWorstToBest = true; // In multi battle, order the results from worst to best

			var chargeMultipliers = [1, .95, .75, .5, .25]; // Array of potential charge multipliers between full and minimum charge

			var modal;

			var csv; // Store the CSV from last results

			var settingGetParams = false; // Flag to keep certain functions from running

			var isLoadingPreset = false; // Flag that lets the sim know if it should wait for a preset list to finish loading
			var getDataLoaded = false // Flag that tells the interface if it has already loaded variables passed through the url

			var ranker = RankerMaster.getInstance();
			ranker.context = this.context;

			this.init = function(){

				var data = gm.data;

				// Initialize selectors and push Pokemon data

				battle = new Battle();
				battle.setBuffChanceModifier(0);

				pokeSearch.setBattle(battle);

				$(".poke-select-container .poke.single").each(function(index, value){
					var selector = new PokeSelect($(this), index);
					selector.setBattle(battle);
					pokeSelectors.push(selector);

					selector.init(data.pokemon, battle);
				});

				$(".poke-select-container .poke.multi").each(function(index, value){
					var selector = new PokeMultiSelect($(this));
					selector.init(data.pokemon, battle);

					multiSelectors.push(selector);
				});


				$(".league-select").on("change", selectLeague);
				$(".mode-select a").on("click", selectMode);
				$(".battle-btn").on("click", startBattle);
				$(".continue-container .button").on("click", continueBattle);
				$(".timeline-container").on("mousemove",".item",timelineEventHover);
				$(".poke a.swap").on("click", swapSelectedPokemon);
				$(".poke.single").on("mousemove",".move-bar",moveBarHover);
				$(".multi-battle-sort").on("click", sortMultiBattleResults);
				$(".battle-results.matrix .ranking-categories a").on("click", selectMatrixMode);
				$("body").on("mousemove",mainMouseMove);
				$("body").on("mousedown",mainMouseMove);
				$("body").on("click", ".check", checkBox);

				// Timeline playback

				$(".playback .play").click(timelinePlay);
				$(".playback .replay").click(timelineReplay);
				$(".playback-speed").change(timelineSpeedChange);
				$(".playback-scale").change(timelineScaleChange);

				// Details battle viewing

				$("body").on("click", ".battle-details .rating-table a.rating.star", viewShieldBattle);
				$("body").on("click", ".section.summary a.rating.star", viewBulkBattle);
				$("body").on("click", ".breakpoints-section .button, .cmp-section .button", selectBreakpointIVs);

				// Sandbox mode

				$(".sandbox-btn").click(toggleSandboxMode);
				$(".timeline-container").on("click",".item",timelineEventClick);
				$("body").on("change", ".modal .move-select", selectSandboxMove);
				$("body").on("change", ".modal .charge-select", selectSandboxChargePower);
				$("body").on("mousedown", ".modal .button.apply", applyActionChanges);
				$(".sandbox.clear-btn").click(clearSandboxClick);
				$("body").on("click", ".modal .sandbox-clear-confirm .button", confirmClearSandbox);
				$(".update-btn").on("click", self.runSandboxSim);

				// Load rankings for the current league

				var league = 1500;
				if(get.cp){
					if(get.cp.indexOf("-") == -1){
						league = get.cp;
					} else{
						league = get.cp.split("-")[0];
					}
				}

				gm.loadRankingData(self, "overall", league, "all");

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});

			};

			// Callback for loading ranking data

			this.displayRankingData = function(data){
				console.log("Ranking data loaded");

				if(! getDataLoaded){
					// If get data exists, load settings
					getDataLoaded = true;
					self.loadGetData();
				} else if(self.battleMode == "multi"){
					self.generateMultiBattleResults();

					$("html, body").animate({ scrollTop: $(".battle-results."+self.battleMode).offset().top - 185 }, 500);
				}

			}

			// If the opposing Pokemon is changed or updated, update both so damage numbers are accurate

			this.resetSelectedPokemon = function(){
				for(var i = 0; i < pokeSelectors.length; i++){
					if(pokeSelectors[i].getPokemon()){
						pokeSelectors[i].getPokemon().reset();
					}
				}
			}

			// Display HP gven a point in a timeline

			this.displayCumulativeDamage = function(timeline, time){
				var cumulativeDamage = [0,0];
				var cumulativeEnergy = [0,0];
				var startingValues = battle.getStartingValues();

				for(var i = 0; i < timeline.length; i++){
					var event = timeline[i];
					if(event.time <= time){
						$(".timeline .item[index="+i+"]").addClass("active");

						if((event.type.indexOf("fast") >= 0) || (event.type.indexOf("charged") >= 0)){
							if(event.actor == 0){
								cumulativeDamage[1] += event.values[0];
								cumulativeEnergy[0] = Math.min(cumulativeEnergy[0] + event.values[1], 100);
							} else{
								cumulativeDamage[0] += event.values[0];
								cumulativeEnergy[1] = Math.min(cumulativeEnergy[1] + event.values[1], 100);
							}
						}
					}
				}

				for(var n = 0; n < pokeSelectors.length; n++){

					// Adjust the values in case starting values have been changed since the sim was run

					cumulativeDamage[n] += pokeSelectors[n].getPokemon().startHp - startingValues[n].hp;
					cumulativeEnergy[n] -= pokeSelectors[n].getPokemon().startEnergy - startingValues[n].energy;

					pokeSelectors[n].animateHealth(cumulativeDamage[n]);

					for(i = 0; i < Math.max(pokeSelectors[n].getPokemon().chargedMoves.length, 1); i++){
						pokeSelectors[n].animateEnergy(i, cumulativeEnergy[n]);
					}

				}

				var left;

				if(timelineScaleMode == "fit"){
					left = ((time+1000) / (battle.getDuration()+2000) * 100)+"%";
				} else if(timelineScaleMode == "zoom"){
					left = (((time+1000) / 1000)*50);

					if(animating){
						if(left > $(".timeline-container").scrollLeft() - 100){
							$(".timeline-container").scrollLeft((left - $(".timeline-container").width())+100);
						}

						if(left < $(".timeline-container").scrollLeft()){
							$(".timeline-container").scrollLeft(left)
						}
					}

					left += "px";

				}
				$(".timeline-container .tracker").css("left", left);
			}

			// Display battle timeline

			this.displayTimeline = function(b, bulkRatings, animate){

				bulkRatings = typeof bulkRatings !== 'undefined' ? bulkRatings : false;
				animate = typeof animate !== 'undefined' ? animate : true;

				var timeline = b.getTimeline();
				var duration = b.getDuration()+1000;
				var pokemon = b.getPokemon();
				var energy = [pokemon[0].startEnergy, pokemon[1].startEnergy]; // Store energy so valid editable moves can be displayed
				var turnMargin = b.calculateTurnMargin();

				$(".battle-results.single").show();
				$(".timeline").html('');

				for(var i = 0; i < timeline.length; i++){
					var event = timeline[i];
					var position = ((event.time+1000) / (duration+1000) * 100)+"%";

					if(timelineScaleMode == "zoom"){
						position = ( ((event.time+1000)/1000)*50)+"px";
					}

					var $item = $("<div class=\"item-container\"><a href=\"#\" class=\"item "+event.type+"\" index=\""+i+"\" actor=\""+event.actor+"\" turn=\""+event.turn+"\" name=\""+event.name+"\" energy=\""+energy[event.actor]+"\" values=\""+event.values.join(',')+"\" onClick=\"\"></a></div>");

					$item.css("left", position);

					if((! animate)||(settings.animateTimeline === 0)){
						$item.find(".item").addClass("active");
					}

					// Calculate whether or not can be used on this turn for sandbox mode

					if(event.type.indexOf("fast") > -1){
						$item.find(".item").addClass("disabled");
					}

					if(event.type.indexOf("interaction") > -1){

						var usableChargedMoves = 0;;

						for(var n = 0; n < pokemon[event.actor].chargedMoves.length; n++){
							if(energy[event.actor] >= pokemon[event.actor].chargedMoves[n].energy){
								usableChargedMoves++;
							}
						}

						// Show differently whether 0, 1, or 2 Charged Moves are ready

						if(usableChargedMoves == 0){
							$item.find(".item").addClass("disabled");
						} else if(usableChargedMoves == 2){
							$item.find(".item").addClass("both");
						}
					}

					if(event.values[1]){
						energy[event.actor] = Math.min(energy[event.actor] + event.values[1], 100);
					}

					if(event.type.indexOf("tap") > -1){
						var height = 4 + (2 * event.values[0]);
						$item.find(".item").css("height", height+"px");
						$item.find(".item").css("width", height+"px");
						$item.find(".item").css("top", -(((height+2)/2)+1)+"px");

						if(event.type.indexOf("interaction") > -1){
							if($item.find(".item").hasClass("both")){
								$item.find(".item").css("top", -(((height+2)/2)+16)+"px");
							} else{
								$item.find(".item").css("top", -(((height+2)/2)+15)+"px");
							}
						}
					}

					$(".timeline").eq(event.actor).append($item);
				}

				// Scale both timelines

				if(timelineScaleMode == "fit"){
					$(".timeline").css("width","100%");
				} else if(timelineScaleMode == "zoom"){
					var width = $(".timeline-container .item-container").last().position().left;

					$(".timeline").css("width",(width+100)+"px");
				}

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].update();
				}

				// Show battle summary text

				var winner = b.getWinner();
				var durationSeconds = Math.floor(duration / 100) / 10;

				if(winner.pokemon){
					var winnerRating = winner.rating;
					$(".battle-results .summary").html("<div><span class=\"name\">"+winner.pokemon.speciesName+"</span> wins in <span class=\"time\">"+durationSeconds+"s</span> with a battle rating of <span class=\"rating star\">"+winnerRating+"</span></div>");

					if(turnMargin >= 20){
						turnMargin = "20+";
					}

					var marginSummary = "It is generally safe from energy, IV, or lag factors."
					var attr = "high";

					if(turnMargin < 5){
						marginSummary = "It is highly vulnerable to energy, IV, or lag factors."
						attr = "extreme";
					} else if(turnMargin <= 10){
						marginSummary = "It is somewhat vulnerable to energy, IV, or lag factors."
						attr = "low";
					} else if(turnMargin <= 15){
						marginSummary = "It is somewhat safe from energy, IV, or lag factors."
						attr = "medium";
					}

					$(".battle-results .summary").append("<div class=\"turn-margin-description\"><span class=\"turn-margin\" value=\""+attr+"\">"+turnMargin + " turn(s)</span> of difference can flip this scenario. " + marginSummary + "</div>");

					var color = battle.getRatingColor(winnerRating);
					$(".battle-results .summary .rating").first().css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");

					$(".continue-container").show();
					$(".continue-container .name").html(winner.pokemon.speciesName + " (" + winner.hp + " HP, " + winner.energy + " energy)");
				} else{
					$(".battle-results .summary").html("Simultaneous knockout in <span class=\"time\">"+durationSeconds+"s</span>");
					$(".continue-container").hide();
				}

				// Display bulk sim data

				if(bulkRatings){

					var pokemon = pokeSelectors[0].getPokemon();

					$(".battle-results .summary").append("<div class=\"bulk-summary\"></div>");

					$(".battle-results .bulk-summary").append("<div class=\"disclaimer\">This matchup contains moves that have a chance to buff or debuff stats. These results are generated from 500 simulations, and may vary.</div>");

					var bestRating = bulkResults.best.getBattleRatings()[0];
					var bestColor = battle.getRatingColor(bestRating);

					var medianRating = bulkResults.median.getBattleRatings()[0];
					var medianColor = battle.getRatingColor(medianRating);

					var worstRating = bulkResults.worst.getBattleRatings()[0];
					var worstColor = battle.getRatingColor(worstRating);

					$(".battle-results .bulk-summary").append("<p>"+pokemon.speciesName+"'s best battle rating is <a href=\"#\" class=\"rating star best\">"+bestRating+"</a></p>");
					$(".battle-results .bulk-summary").append("<p>"+pokemon.speciesName+"'s median battle rating is <a href=\"#\" class=\"rating star median\">"+medianRating+"</a></p>");
					$(".battle-results .bulk-summary").append("<p>"+pokemon.speciesName+"'s worst battle rating is <a href=\"#\" class=\"rating star worst\">"+worstRating+"</a></p>");

					$(".battle-results .bulk-summary .rating").eq(0).css("background-color", "rgb("+bestColor[0]+","+bestColor[1]+","+bestColor[2]+")");
					$(".battle-results .bulk-summary .rating").eq(1).css("background-color", "rgb("+medianColor[0]+","+medianColor[1]+","+medianColor[2]+")");
					$(".battle-results .bulk-summary .rating").eq(2).css("background-color", "rgb("+worstColor[0]+","+worstColor[1]+","+worstColor[2]+")");

					$(".battle-results .bulk-summary").append("<div class=\"histograms\"><div class=\"histogram\"></div></div>");

					// Generate and display histogram

					bulkHistogram = new BattleHistogram($(".battle-results .bulk-summary .histogram"));
					bulkHistogram.generate(pokeSelectors[0].getPokemon(), bulkRatings, 400);
				}

				// Animate timelines

				if(animate){

					$(".timeline .item").removeClass("active");

					var intMs = Math.floor(duration / 62);

					self.animateTimeline(-intMs * 15, intMs);
				} else{
					// Reset timeline visual properties

					self.displayCumulativeDamage(battle.getTimeline(), battle.getDuration());
				}

				// Generate and display share link

				if(! sandbox){
					var pokes = b.getPokemon();
					var cp = b.getCP(true);
					var moveStrs = [];

					for(var i = 0; i < pokes.length; i++){
						moveStrs.push(pokes[i].generateURLMoveStr());
					}

					var battleStr = self.generateSingleBattleLinkString(false);
					var link = host + battleStr;

					$(".share-link input").val(link);

					// Set document title

					document.title = "Battle - " + pokes[0].speciesName + " vs. " + pokes[1].speciesName + " | PvPoke";

					// Push state to browser history so it can be navigated, only if not from URL parameters

					gtag('event', 'Lookup', {
					  'event_category' : 'Simulation',
					  'event_label' : pokes[0].speciesId
					});
					gtag('event', 'Lookup', {
					  'event_category' : 'Simulation',
					  'event_label' : pokes[1].speciesId
					});

					if(get){
						get = false;

						return;
					}

					var url = webRoot+battleStr;

					var data = {cp: cp, p1: pokes[0].speciesId, p2: pokes[1].speciesId, s: pokes[0].startingShields+""+pokes[1].startingShields, m1: moveStrs[0], m2: moveStrs[1], h1: pokes[0].startHp, h2: pokes[1].startHp, e1: pokes[0].startEnergy, e2: pokes[1].startEnergy };

					window.history.pushState(data, "Battle", url);

					// Send Google Analytics pageview

					gtag('config', UA_ID, {page_location: (host+url), page_path: url});
				}
			}

			// Returns a string to be used in single battle links

			this.generateSingleBattleLinkString = function(sandbox){
				// Generate and display share link

				var cp = battle.getCP(true);
				var pokes = battle.getPokemon();

				var pokeStrs = [];
				var moveStrs = [];

				for(var i = 0; i < pokes.length; i++){
					pokeStrs.push(pokes[i].generateURLPokeStr());
					moveStrs.push(pokes[i].generateURLMoveStr());
				}

				var battleStr = "battle/";

				if(sandbox){
					battleStr += "sandbox/";
				}

				battleStr += cp+"/"+pokeStrs[0]+"/"+pokeStrs[1]+"/"+pokes[0].startingShields+pokes[1].startingShields+"/"+moveStrs[0]+"/"+moveStrs[1]+"/";

				// Append extra options

				if( (pokes[0].startHp != pokes[0].stats.hp) || (pokes[1].startHp != pokes[1].stats.hp) || (pokes[0].startEnergy != 0) || (pokes[1].startEnergy != 0) ){
					battleStr += pokes[0].startHp + "-" + pokes[1].startHp + "/" + pokes[0].startEnergy + "-" + pokes[1].startEnergy + "/";
				}

				if(sandbox){
					// Convert valid actions into parseable string
					var actionStr = self.generateActionStr();

					battleStr += actionStr + "/";
				}

				return battleStr;
			}

			// Return a concatenated string of actions

			this.generateActionStr = function(){
				var actionStr = "";

				for(var i = 0; i < actions.length; i++){
					if(actions[i].valid){
						var str = "";

						if(actionStr != ""){
							str += "-";
						}

						str += actions[i].turn + "." + actions[i].typeToInt() + actions[i].actor + actions[i].value + (actions[i].settings.shielded ? 1 : 0) + (actions[i].settings.buffs ? 1 : 0) + (actions[i].settings.charge ? chargeMultipliers.indexOf(actions[i].settings.charge) : 0);

						actionStr += str;
					}
				}

				if(actionStr == ""){
					actionStr = "0";
				}

				return actionStr;
			}

			// Animate timeline playback given a start time and rate in ms

			this.animateTimeline = function(startTime, timeRate){

				if(animating){
					return false;
				}

				animating = true;

				clearInterval(timelineInterval);

				time = startTime;

				timelineInterval = setInterval(function(){
					time += timeRate;

					self.displayCumulativeDamage(battle.getTimeline(), time);

					if(time > battle.getDuration()){
						animating = false;
						clearInterval(timelineInterval);

						$(".playback .play").removeClass("active");
					}
				}, 17);

			}

			// Generate matchup details after main battle has been simulated

			this.generateMatchupDetails = function(battle, doBulk){

				// Run simulations for every shield matchup

				var pokemon = [];

				for(var i = 0; i < pokeSelectors.length; i++){
					pokemon.push(pokeSelectors[i].getPokemon());
				}

				$(".battle-details .name-1").html(pokemon[0].speciesName);
				$(".rating-table .name-1.name").html(pokemon[0].speciesName.charAt(0)+".");
				$(".battle-details .name-2").html(pokemon[1].speciesName);

				if(! sandbox){
					var originalShields = [pokemon[0].startingShields, pokemon[1].startingShields];

					for(var i = 0; i < 3; i++){

						for(var n = 0; n < 3; n++){

							pokemon[0].setShields(n);
							pokemon[1].setShields(i);

							// Don't do this battle if it's already been simmed
							var rating;
							var color;

							if(! ((n == originalShields[0]) && (i == originalShields[1])) ) {
								var b = new Battle();
								b.setLevelCap(battle.getLevelCap());
								b.setCP(battle.getCP());
								b.setNewPokemon(pokemon[0], 0, false);
								b.setNewPokemon(pokemon[1], 1, false);

								if(doBulk){
									b = self.generateBulkSims(b).median;
								} else{
									b.simulate();
								}

								rating = b.getBattleRatings()[0];
								color = b.getRatingColor(rating);
							} else{
								rating = battle.getBattleRatings()[0];
								color = battle.getRatingColor(rating);
							}

							$(".rating-table .battle-"+i+"-"+n).html(rating);
							$(".rating-table .battle-"+i+"-"+n).css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");

							if(rating > 500){
								$(".rating-table .battle-"+i+"-"+n).addClass("win");
							} else{
								$(".rating-table .battle-"+i+"-"+n).removeClass("win");
							}
						}
					}

					// Reset shields for future battles

					$(".shield-select").trigger("change");
				}

				// Calculate stats

				// Battle Rating

				for(var i = 0; i < 2; i++){

					rating = battle.getBattleRatings()[i];
					color = battle.getRatingColor(rating);


					$(".stats-table .rating.star").eq(i).html(rating);
					$(".stats-table .rating.star").eq(i).css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");

					if(rating > 500){
						$(".stats-table .rating.star").eq(i).addClass("win");
					} else{
						$(".stats-table .rating.star").eq(i).removeClass("win");
					}
				}

				// Gather battle stats from timeline

				var timeline = battle.getTimeline();
				var totalDamage = [0,0];
				var fastDamage = [0,0];
				var chargedDamage = [0,0];
				var damageBlocked = [0,0];
				var turnsToChargedMove = [0,0];
				var energy = [0,0];
				var energyGained = [0,0];
				var energyUsed = [0,0];

				for(var i = 0; i < timeline.length; i++){
					var event = timeline[i];
					var eventType = event.type.split(" ")[0];

					switch(eventType){
						case "fast":
							totalDamage[event.actor] += event.values[0];
							fastDamage[event.actor] += event.values[0];
							energy[event.actor] += event.values[1];
							energyGained[event.actor] += event.values[1];
							break;

						case "charged":
							totalDamage[event.actor] += event.values[0];
							chargedDamage[event.actor] += event.values[0];
							energy[event.actor] += event.values[1];
							energyUsed[event.actor] -= event.values[1];
							break;

						case "shield":
							damageBlocked[event.actor] += event.values[0];
							break;
					}

					// Determine if first charged move is charged

					if(((eventType == "fast") || (eventType == "charged"))&&(turnsToChargedMove[event.actor] == 0)){
						for(var n = 0; n < pokemon[event.actor].chargedMoves.length; n++){
							if(energy[event.actor] >= pokemon[event.actor].chargedMoves[n].energy){
								turnsToChargedMove[event.actor] = event.turn + (pokemon[event.actor].fastMove.cooldown / 500);
							}
						}
					}
				}

				for(var i = 0; i < 2; i++){
					$(".stats-table .stat-total-damage").eq(i).html(totalDamage[i]);
					$(".stats-table .stat-damage-blocked").eq(i).html(damageBlocked[i]);

					var fastPercentage = Math.floor( (fastDamage[i] / totalDamage[i]) * 1000) / 10;
					var chargedPercentage = Math.floor( (chargedDamage[i] / totalDamage[i]) * 1000) / 10;

					$(".stats-table .stat-fast-damage").eq(i).html(fastDamage[i]+" ("+fastPercentage+"%)");
					$(".stats-table .stat-charged-damage").eq(i).html(chargedDamage[i]+" ("+chargedPercentage+"%)");

					$(".stats-table .stat-energy-gained").eq(i).html(energyGained[i]);
					$(".stats-table .stat-energy-used").eq(i).html(energyUsed[i]);

					$(".stats-table .stat-energy-remaining").eq(i).html(Math.min( (energyGained[i] - energyUsed[i])+pokemon[i].startEnergy, 100));

					if(turnsToChargedMove[i] > 0){
						$(".stats-table .stat-charged-time").eq(i).html(turnsToChargedMove[i]+" ("+(turnsToChargedMove[i]*.5)+"s)");
					}
				}

				// Calculate breakpoints and bulkpoints
				var breakpoints = pokemon[0].calculateBreakpoints(pokemon[1]);

				// Output to table

				$(".breakpoints-section .name-attacker").html(pokemon[0].speciesName);
				$(".breakpoints-section .name-defender").html(pokemon[1].speciesName);
				$(".stats-table.breakpoints .name-fast").html(pokemon[0].fastMove.name + " Damage");
				$(".stats-table.breakpoints .output").html('<tr></tr>');

				for(var i = breakpoints.length-1; i >= 0; i--){
					var attack = Math.round(breakpoints[i].attack * 100) / 100;
					var guaranteedAttack = Math.round(breakpoints[i].guaranteedAttack * 100) / 100;

					if(guaranteedAttack == -1){
						guaranteedAttack = "-";
					}

					// Find the best combinations that reaches this value
					var combinations = pokemon[0].generateIVCombinations("overall", 1, 2, [{stat: "atk", value: breakpoints[i].attack}]);

					$(".stats-table.breakpoints .output").append("<tr class=\"toggle\"><td>"+breakpoints[i].damage+"</td><td>"+attack+"</td><td>"+guaranteedAttack+"</td><td class=\"ivs\"><div class=\"button\" level=\""+combinations[0].level+"\" atk=\""+combinations[0].ivs.atk+"\" def=\""+combinations[0].ivs.def+"\" hp=\""+combinations[0].ivs.hp+"\">"+combinations[0].level+ " "+combinations[0].ivs.atk+"/"+combinations[0].ivs.def+"/"+combinations[0].ivs.hp+"</div></td></tr>");

					if(breakpoints[i].damage == pokemon[0].fastMove.damage){
						$(".stats-table.breakpoints .output tr").last().addClass("bold");
					}

				}

				var bulkpoints = pokemon[0].calculateBulkpoints(pokemon[1]);

				$(".stats-table.bulkpoints .name-fast").html(pokemon[1].fastMove.name + " Damage");
				$(".stats-table.bulkpoints .output").html('<tr></tr>');

				for(var i = 0; i < bulkpoints.length; i++){
					var defense = Math.round(bulkpoints[i].defense * 100) / 100;
					var guaranteedDefense = Math.round(bulkpoints[i].guaranteedDefense * 100) / 100;

					if(guaranteedDefense == -1){
						guaranteedDefense = "-";
					}


					// Find the best combinations that reaches this value
					var combinations = pokemon[0].generateIVCombinations("overall", 1, 2, [{stat: "def", value: bulkpoints[i].defense}]);

					$(".stats-table.bulkpoints .output").append("<tr class=\"toggle\"><td>"+bulkpoints[i].damage+"</td><td>"+defense+"</td><td>"+guaranteedDefense+"</td><td class=\"ivs\"><div class=\"button\" level=\""+combinations[0].level+"\" atk=\""+combinations[0].ivs.atk+"\" def=\""+combinations[0].ivs.def+"\" hp=\""+combinations[0].ivs.hp+"\">"+combinations[0].level+ " "+combinations[0].ivs.atk+"/"+combinations[0].ivs.def+"/"+combinations[0].ivs.hp+"</div></td></tr>");

					if(bulkpoints[i].damage == pokemon[1].fastMove.damage){
						$(".stats-table.bulkpoints .output tr").last().addClass("bold");
					}

				}

				// Find a golden combination that reaches the best breakpoint and bulkpoint if one exists

				var bestAttack = breakpoints[breakpoints.length-1].attack;
				var bestDefense = bulkpoints[0].defense;
				var combinations = pokemon[0].generateIVCombinations("overall", 1, 2, [
					{stat: "atk", value: bestAttack},
					{stat: "def", value: bestDefense}
				]);

				$(".breakpoints-section .golden-combination").html('');

				if((combinations.length > 0)&&(breakpoints.length > 1)&&(bulkpoints.length > 1)){
					$(".breakpoints-section .golden-combination").append("<p><div class=\"button\" level=\""+combinations[0].level+"\" atk=\""+combinations[0].ivs.atk+"\" def=\""+combinations[0].ivs.def+"\" hp=\""+combinations[0].ivs.hp+"\">"+combinations[0].level+ " "+combinations[0].ivs.atk+"/"+combinations[0].ivs.def+"/"+combinations[0].ivs.hp+"</div> "+pokemon[0].speciesName+" reaches the best breakpoint and bulkpoint against this "+pokemon[1].speciesName+".</p>");
				}

				// Calculate attack needed for CMP ties

				var minimumCMPAttack = pokemon[1].stats.atk + .001;
				var guaranteedCMPAttack = pokemon[1].generateIVCombinations("atk", 1, 1)[0].atk + .001;
				var maxCMPAttack = pokemon[0].generateIVCombinations("atk", 1, 1)[0].atk

				// Find the best combination that reaches this value
				var combinations = pokemon[0].generateIVCombinations("overall", 1, 2, [{stat: "atk", value: minimumCMPAttack}]);

				// Output to table

				$(".cmp-section .name-attacker").html(pokemon[0].speciesName);
				$(".cmp-section .name-defender").html(pokemon[1].speciesName);
				$(".stats-table.cmp .output").html('<tr></tr>');

				if(maxCMPAttack > minimumCMPAttack){
					$(".stats-table.cmp .output").append("<tr class=\"toggle\"><td>"+(Math.round(minimumCMPAttack * 100) / 100)+"</td><td>"+(Math.round(guaranteedCMPAttack * 100) / 100)+"</td><td class=\"ivs\"><div class=\"button\" level=\""+combinations[0].level+"\" atk=\""+combinations[0].ivs.atk+"\" def=\""+combinations[0].ivs.def+"\" hp=\""+combinations[0].ivs.hp+"\">"+combinations[0].level+ " "+combinations[0].ivs.atk+"/"+combinations[0].ivs.def+"/"+combinations[0].ivs.hp+"</div></td></tr>");

					// Don't show a result if this Pokemon can't guarantee a CMP win
					if(maxCMPAttack < guaranteedCMPAttack){
						$(".stats-table.cmp .output td").eq(1).html("-");
					}
				} else{
					// Show blank if this Pokemon can't win CMP at all
					$(".stats-table.cmp .output").append("<tr class=\"toggle\"><td>Can't win<br>CMP</td><td>Can't win<br>CMP</td><td>Can't win<br>CMP</td></tr>");
				}

			}

			// Process selected Pokemon through the team ranker

			this.generateMultiBattleResults = function(){

				// Set settings

				var cup = $(".cup-select option:selected").val();
				var opponentShields = parseInt($(".poke.multi").eq(0).find(".shield-select option:selected").val());
				var chargedMoveCount = parseInt($(".poke.multi .charged-count-select option:selected").val());
				var shieldBaiting = $(".poke.multi").eq(0).find(".check.shield-baiting").hasClass("on") ? 1 : 0;

				// Load rankings and movesets

				var key = cup + "overall" + battle.getCP();

				if((! gm.rankings[key])&&(cup != "custom")){
					gm.loadRankingData(self, "overall", battle.getCP(), cup);
					return false;
				}

				battle.setCup(cup);

				ranker.applySettings(multiSelectors[0].getSettings(), 1);

				var team = [];
				var poke = pokeSelectors[0].getPokemon();

				if(poke){
					ranker.applySettings({
						shields: poke.startingShields,
						ivs: "original",
						bait: poke.baitShields,
						levelCap: battle.getLevelCap()
					}, 0);
					team.push(poke);
				} else{
					return;
				}

				// Set multi selected Pokemon if available

				if(cup == "custom"){
					ranker.setTargets(multiSelectors[0].getPokemonList());
				} else{
					ranker.setTargets([]);
				}


				// Run battles through the ranker

				var data = ranker.rank(team, battle.getCP(true), battle.getCup());
				var rankings = data.rankings;
				var shieldStr = poke.startingShields + "" + opponentShields;
				var pokeStr = poke.generateURLPokeStr();
				var moveStr = poke.generateURLMoveStr();

				csv = data.csv;

				$(".battle-results .rankings-container").html('');

				battle.setNewPokemon(poke, 0, false);

				var pokemonList = multiSelectors[0].getPokemonList();
				var custom = (battle.getCup().name == "custom");
				var initialize = (custom == false);

				if(! custom){
					pokemonList = [];
				}

				// Order the rankings from best to worst or worst to best

				if(multiBattleWorstToBest){
					rankings.sort((a,b) => (a.opRating > b.opRating) ? 1 : ((b.opRating > a.opRating) ? -1 : 0));
				}

				for(var i = 0; i < rankings.length; i++){
					var r = rankings[i];

					var pokemon = r.pokemon;

					// Manually set moves if previously selected, otherwise autoselect
					var moveNameStr = '';

					if(r.moveset){
						pokemon.selectMove("fast", r.moveset.fastMove.moveId);

						moveNameStr = r.moveset.fastMove.displayName;

						for(var n = 0; n < r.moveset.chargedMoves.length; n++){
							pokemon.selectMove("charged", r.moveset.chargedMoves[n].moveId, n);

							moveNameStr += ", " + r.moveset.chargedMoves[n].displayName;
						}
					} else{
						pokemon.autoSelectMoves(chargedMoveCount);
					}

					if(! $(".poke.multi .check.shield-baiting").hasClass("on")){
						pokemon.baitShields = false;
						pokemon.isCustom = true;
					}

					var opPokeStr = pokemon.generateURLPokeStr();
					var opMoveStr = pokemon.generateURLMoveStr();

					var battleLink = host+"battle/"+battle.getCP(true)+"/"+pokeStr+"/"+opPokeStr+"/"+shieldStr+"/"+moveStr+"/"+opMoveStr+"/";

					// Append extra options

					if( (poke.startHp != poke.stats.hp) || (poke.startEnergy != 0) ){
						battleLink += poke.startHp +  "/" + poke.startEnergy + "/";
					}

					var $el = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\" data=\""+pokemon.speciesId+"\"><div class=\"name-container\"><span class=\"number\">#"+(i+1)+"</span><span class=\"name\">"+pokemon.speciesName+"</span></div><div class=\"rating-container\"><div class=\"rating star\">"+r.opRating+"</span></div><a target=\"_blank\" href=\""+battleLink+"\"></a><div class=\"clear\"></div></div><div class=\"details\"></div>");

					// Add moveset details if set

					if(r.moveset){
						$el.find(".name-container").append("<div class=\"moves\">"+moveNameStr+"</div>");
					}

					$(".battle-results .rankings-container").append($el);
				}

				// Generate and display histogram

				if(! histogram){
					histogram = new BattleHistogram($(".battle-results.multi .histogram"));
					histogram.generate(poke, data.teamRatings[0]);
				} else{
					histogram.generate(poke, data.teamRatings[0]);
				}

				$(".battle-results.multi").show();

				// Generate and display share link

				var cp = battle.getCP(true);
				var battleStr = "battle/multi/"+cp+"/"+cup+"/"+pokeStr+"/"+poke.startingShields+opponentShields+"/"+moveStr+"/"+chargedMoveCount+"-"+shieldBaiting;

				if(multiSelectors[0].getSettings().ivs != "original"){
					battleStr += "-"+multiSelectors[0].getSettings().ivs;
				}

				battleStr += "/";

				// Append extra options

				if( (poke.startHp != poke.stats.hp) || (poke.startEnergy != 0) ){
					battleStr += poke.startHp +  "/" + poke.startEnergy + "/";
				}

				// Add preset group to URL if available

				if(cup == "custom"){
					var groupName = multiSelectors[0].getSelectedGroup();

					if(multiSelectors[0].getSelectedGroupType() != "custom"){
						battleStr += groupName + "/";
					}
				}


				var link = host + battleStr;

				$(".share-link input").val(link);

				// Update download link with new data
				var poke = pokeSelectors[0].getPokemon();
				var moveAbbreviationStr = poke.generateMovesetStr();
				var filename = pokeSelectors[0].getPokemon().speciesName + " " + moveAbbreviationStr + " vs " + $(".poke.multi .cup-select option:selected").html() + " " + poke.startingShields + "-" + opponentShields + " shields.csv";
				var filedata = '';

				if (!csv.match(/^data:text\/csv/i)) {
					filedata = [csv];
					filedata = new Blob(filedata, { type: 'text/csv'});
				}

				$(".button.download-csv").attr("href", window.URL.createObjectURL(filedata));
				$(".button.download-csv").attr("download", filename);

				// Push state to browser history so it can be navigated, only if not from URL parameters

				gtag('event', 'Lookup', {
				  'event_category' : 'Simulation',
				  'event_label' : pokemon.speciesId
				});

				if(get){
					get = false;

					return;
				}

				var url = webRoot+battleStr;

				var data = {cp: cp, p1: poke.speciesId, cup:cup, s: poke.startingShields+""+opponentShields, m1: moveStr, cms: chargedMoveCount, mode: self.battleMode};

				window.history.pushState(data, "Battle", url);

				// Send Google Analytics pageview

				gtag('config', UA_ID, {page_location: (host+url), page_path: url});
			}

			// Process both groups of Pokemon through the team ranker

			this.generateMatrixResults = function(){

				// Appply settings from multiSelectors
				ranker.applySettings(multiSelectors[0].getSettings(), 1);
				ranker.applySettings(multiSelectors[1].getSettings(), 0);

				/* It's opposite day, so we get to switch these around.
				* But actually it's because TeamRanker is built for the Team Builder (how other Pokemon do vs your Pokemon)
				*/
				var team = multiSelectors[1].getPokemonList();
				var targets = multiSelectors[0].getPokemonList();

				if((team.length < 1)||(targets.length < 1)){
					return;
				}

				// Set multi selected Pokemon if available
				ranker.setTargets(targets);

				// Run battles through the ranker

				var data = ranker.rank(team, battle.getCP(true), battle.getCup(), [], "matrix");
				matrixResults = data.rankings;
				self.displayMatrixResults(matrixResults);

				// Push state to browser history so it can be navigated, only if not from URL parameters

				gtag('event', 'Lookup', {
				  'event_category' : 'Simulation',
				  'event_label' : 'Matrix'
				});
			}

			// Process both groups of Pokemon through the team ranker

			this.displayMatrixResults = function(rankings){

				var team = multiSelectors[1].getPokemonList();
				var targets = multiSelectors[0].getPokemonList();

				// Display results
				var csv = ','; // CSV data of all matchups
				$(".matrix-table").html("");

				var $row = $("<thead><tr><th></th></tr></thead>");

				for(var n = 0; n < team.length; n++){
					$row.find("tr").append("<th class=\"name-small\">"+team[n].speciesName+" <span>"+team[n].generateMovesetStr()+"<br>"+ team[n].ivs.atk + "/" + team[n].ivs.def + "/" + team[n].ivs.hp + "</span></th>");

					csv += team[n].speciesName+" "+team[n].generateMovesetStr() + " " + team[n].ivs.atk + "/" + team[n].ivs.def + "/" + team[n].ivs.hp;
					if(n < team.length -1){
						csv += ',';
					}
				}

				csv += '\n';

				$(".matrix-table").append($row);
				$(".matrix-table").append("<tbody></tbody>");
				$(".matrix-table").attr("mode", self.matrixMode);

				for(var i = 0; i < rankings.length; i++){
					var r = rankings[i];
					var pokemon = r.pokemon;

					// Add results to matrix table

					$row = $("<tr><th class=\"name\">"+pokemon.speciesName+" <span>"+pokemon.generateMovesetStr()+"<br>" + pokemon.ivs.atk + "/" + pokemon.ivs.def + "/" + pokemon.ivs.hp + "</span></th></tr>");

					csv += pokemon.speciesName + ' ' + pokemon.generateMovesetStr() + ' ' + + pokemon.ivs.atk + "/" + pokemon.ivs.def + "/" + pokemon.ivs.hp + ',';

					for(var n = 0; n < r.matchups.length; n++){
						var $cell = $("<td><a class=\"rating star\" href=\"#\" target=\"blank\"><span></span></a></td>");
						var rating = r.matchups[n].rating;
						var displayStat = r.matchups[n].rating;
						var color = battle.getRatingColor(rating);

						switch(self.matrixMode){
							case "breakpoint":
								displayStat = r.matchups[n].breakpoint;
								break;

							case "bulkpoint":
								displayStat = r.matchups[n].bulkpoint;
								break;

							case "attack":
								displayStat = r.matchups[n].atkDifferential;
						}

						csv += displayStat;

						if(n < r.matchups.length-1){
							csv += ',';
						}

						// Make the attack differential stat pretty
						if(self.matrixMode == "attack"){
							displayStat = Math.round(displayStat * 10) / 10;

							if(displayStat >= 0){
								displayStat = "+" + displayStat;
							}
						}

						$cell.find("a").html(displayStat);
						$cell.find("a").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");

						if(rating > 500){
							$cell.find("a").addClass("win");
						}

						var pokeStr = pokemon.generateURLPokeStr();
						var moveStr = pokemon.generateURLMoveStr();
						var opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
						var opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
						var battleLink = host+"battle/"+battle.getCP(true)+"/"+pokeStr+"/"+opPokeStr+"/"+pokemon.startingShields+""+r.matchups[n].opponent.startingShields+"/"+moveStr+"/"+opMoveStr+"/";
						$cell.find("a").attr("href", battleLink);

						$row.append($cell);
					}

					$(".matrix-table tbody").append($row);

					csv += '\n';
				}

				$(".battle-results.matrix").show();

				$(".battle-results.matrix p").hide();
				$(".battle-results.matrix p."+self.matrixMode).show();

				// Update download link with new data
				var filename = multiSelectors[0].getSelectedGroup() + " vs " + multiSelectors[1].getSelectedGroup() + ".csv";
				var filedata = '';

				if (!csv.match(/^data:text\/csv/i)) {
					filedata = [csv];
					filedata = new Blob(filedata, { type: 'text/csv'});
				}

				$(".button.download-csv").attr("href", window.URL.createObjectURL(filedata));
				$(".button.download-csv").attr("download", filename);
			}

			// Event handler for changing the battle mode

			function selectMatrixMode(e){
				e.preventDefault();

				self.matrixMode = $(e.target).attr("data");

				$(e.target).parent().find("a").removeClass("selected");
				$(e.target).addClass("selected");

				self.displayMatrixResults(matrixResults);
			}

			// For battles with buffs or debuffs, run bulk sims and return median match

			this.generateBulkSims = function(battle){

				var battles = [];
				var ratings = [];
				var simCount = 250;

				for(var i = 0; i < simCount; i++){
					var b = new Battle();
					b.setLevelCap(battle.getLevelCap());
					b.setCP(battle.getCP());
					b.setCup(battle.getCup());
					b.setBuffChanceModifier(0);

					b.setNewPokemon(pokeSelectors[0].getPokemon(), 0, false);
					b.setNewPokemon(pokeSelectors[1].getPokemon(), 1, false);

					b.simulate();

					var rating = b.getPokemon()[0].getBattleRating();

					battles.push({rating: rating, battle: b});
					ratings.push(rating);
				}

				// Sort results by battle rating

				battles.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));

				var medianIndex = Math.floor(simCount / 2);

				return {
					best: battles[0].battle,
					median: battles[medianIndex].battle,
					worst: battles[battles.length-1].battle,
					ratings: ratings
				};
			}

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				settingGetParams = true;

				// Cycle through parameters and set them

				for(var key in get){

					if(get.hasOwnProperty(key)){

						var val = get[key];

						// Process each type of parameter

						switch(key){
							case "p1":
							case "p2":
								var arr = val.split('-');
								var index = 0;

								if(key == "p2"){
									index = 1;
								}

								if(arr.length == 1){
									pokeSelectors[index].setPokemon(val);
								} else{
									pokeSelectors[index].setPokemon(arr[0]);

									var pokemon = pokeSelectors[index].getPokemon();

									if(arr.length >= 8){
										pokemon.setIV("atk", arr[2]);
										pokemon.setIV("def", arr[3]);
										pokemon.setIV("hp", arr[4]);
										pokemon.setLevel(arr[1]);

										$("input.level").eq(index).val(pokemon.level);
										$("input.iv[iv='atk']").eq(index).val(pokemon.ivs.atk);
										$("input.iv[iv='def']").eq(index).val(pokemon.ivs.def);
										$("input.iv[iv='hp']").eq(index).val(pokemon.ivs.hp);

										$("input.stat-mod[iv='atk']").eq(index).val(parseInt(arr[5]) - 4);
										$("input.stat-mod[iv='def']").eq(index).val(parseInt(arr[6]) - 4);

										if(arr[7]){
											pokemon.baitShields = (parseInt(arr[7]) == 1);

											if(! pokemon.baitShields){
												$(".poke.single .shield-baiting").eq(index).removeClass("on");
											}

											pokemon.optimizeMoveTiming = (parseInt(arr[8]) == 1);

											if(! pokemon.optimizeMoveTiming){
												$(".poke.single .optimize-timing").eq(index).removeClass("on");
											}
										}
									}

									// Check string for other parameters
									for(var i = 0; i < arr.length; i++){
										switch(arr[i]){
											case "shadow":
											case "purified":
												pokemon.setShadowType(arr[i]);
												$(".poke.single .form-group").eq(index).find(".check").removeClass("on");
												$(".poke.single .form-group").eq(index).find(".check[value=\""+arr[i]+"\"]").addClass("on");
												break;
										}
									}

									$("input.stat-mod[iv='atk']").eq(index).trigger("keyup");
								}

								if(index == 1){
									// Auto select moves for both Pokemon

									for(var i = 0; i < pokeSelectors.length; i++){
										pokeSelectors[i].getPokemon().autoSelectMoves();
									}
								}

								break;

							case "cp":
								//Parse this out if it contains level cap
								var getCP = val;

								if(val.indexOf("-") > -1){
									getCP = val.split("-")[0];
									var getCap = val.split("-")[1];

									$(".league-select option[value=\""+getCP+"\"][level-cap=\""+getCap+"\"]").prop("selected","selected");
								} else{
									$(".league-select option[value=\""+getCP+"\"]").prop("selected","selected");
								}

								$(".league-select").trigger("change");
								break;

							case "m1":
							case "m2":
								var index = 0;

								if(key == "m2"){
									index = 1;
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
										if(moveType == "charged"){
											customMoveIndexes.push(moveIndex);
										}
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

							case "s":
								var arr = val.split('');

								for(var i = 0; i < Math.min(arr.length, 2); i++){

									if((i == 0)||((i == 1)&&(self.battleMode == "single"))){
										$(".shield-select").eq(i).find("option[value=\""+arr[i]+"\"]").prop("selected", "selected");
										pokeSelectors[i].getPokemon().setShields(arr[i]);
									} else if((i == 1)&&(self.battleMode == "multi")){
										$(".poke.multi .shield-select").find("option[value=\""+arr[i]+"\"]").prop("selected", "selected");
										$(".poke.multi .shield-select").trigger("change");
									}

								}
								break;

							case "h":
								var arr = val.split('-');

								for(var i = 0; i < arr.length; i++){
									$(".start-hp").eq(i).val(arr[i]);
									$(".start-hp").eq(i).trigger("change");
								}

								break;

							case "e":
								var arr = val.split('-');

								for(var i = 0; i < arr.length; i++){
									$(".start-energy").eq(i).val(arr[i]);
									$(".start-energy").eq(i).trigger("change");
								}

								break;


							case "sandbox":
								if(! sandbox){
									$(".sandbox-btn").trigger("click");
								}
								break;

							case "a":
								// Parse action string into custom actions

								actions = [];

								if(val != "0"){
									var arr = val.split("-");

									for(var i = 0; i < arr.length; i++){

										// Individual actions are formatted like "5.10010"

										var turnArr = arr[i].split(".");
										var turn = parseInt(turnArr[0]);
										var str = turnArr[1];

										var paramsArr = str.split("");

										switch(paramsArr[0]){
											case "1":
												// Protect legacy links from breaking
												var charge = 1;
												if(paramsArr[5]){
													charge = chargeMultipliers[paramsArr[5]];
												}

												actions.push(new TimelineAction(
													"charged",
													parseInt(paramsArr[1]),
													turn,
													parseInt(paramsArr[2]),
													{
														shielded: (parseInt(paramsArr[3]) == 1 ? true : false),
														buffs: (parseInt(paramsArr[4]) == 1 ? true : false),
														charge: charge
													}
												));
												break;

												case "2":
													actions.push(new TimelineAction(
														"wait",
														parseInt(paramsArr[1]),
														turn,
														parseInt(paramsArr[2]),
														{
														}
													));
													break;
										}


									}

									battle.setActions(actions);
								}

								break;

							case "mode":
								$(".mode-select a[data=\""+val+"\"]").trigger("click");
								break;

							case "cup":
								$(".cup-select option[value=\""+val+"\"]").prop("selected","selected");

								if($(".format-select option[cup=\""+val+"\"]").length > 0){
									$(".format-select option[cup=\""+val+"\"]").prop("selected","selected");
								} else{
									var cat = $(".cup-select option[value=\""+val+"\"]").attr("cat");
									$(".format-select option[value=\""+cat+"\"]").prop("selected","selected");
									multiSelectors[0].changeFormatSelect();

									$(".cup-select option[value=\""+val+"\"]").prop("selected","selected");
								}

								$(".cup-select").trigger("change");
								break;

							case "cms":
								var arr = val.split("-");

								$(".charged-count-select option[value=\""+arr[0]+"\"]").prop("selected","selected");
								$(".charged-count-select").trigger("change");

								if(arr.length > 1){
									if(parseInt(arr[1]) == 0){
										$(".poke.multi .check.shield-baiting").removeClass("on");
										multiSelectors[0].setBaitSetting(false);
									}

									if(arr[2]){
										$(".poke.multi").eq(0).find(".default-iv-select option[value=\""+arr[2]+"\"]").prop("selected","selected");
										$(".poke.multi").eq(0).find(".default-iv-select").trigger("change");
									}
								}


								break;

							case "g1":
								multiSelectors[0].selectGroup(val);
								isLoadingPreset = true;
								break;

						}
					}

				}

				// Set to recommend moves if no moveset string provided

				if(! get["m1"]){
					if(pokeSelectors[0].getPokemon()){
						pokeSelectors[0].getPokemon().selectRecommendedMoveset();
					}
				}

				if(! get["m2"]){
					if(pokeSelectors[1].getPokemon()){
						pokeSelectors[1].getPokemon().selectRecommendedMoveset();
					}
				}

				// Update both Pokemon selectors

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].update();
				}

				if((sandbox)&&(! get.hasOwnProperty("sandbox"))){
					$(".sandbox-btn").trigger("click");
				}

				settingGetParams = false;

				// Auto run the battle

				if(! isLoadingPreset){
					$(".battle-btn").trigger("click");
				} else{
					// Oh yeah, this is top level programming right here
					// Super bandaid fix to give preset lists time to load

					setTimeout(function(){
						$(".battle-btn").trigger("click");
					}, 500);
				}

				if(sandbox){
					self.runSandboxSim();
				}

			}

			// Clear the sandbox timeline

			this.resetSandbox = function(){
				if((sandbox)&&(! settingGetParams)){
					actions = [];
					self.runSandboxSim();
				}
			}

			this.runSandboxSim = function(){

				if(! sandbox){
					return;
				}

				battle.setActions(actions);
				battle.simulate();
				self.displayTimeline(battle, false, false);
				self.generateMatchupDetails(battle, false);

				// Retrieve any invalid actions

				actions = battle.getActions();

				// Generate and display share link

				var pokes = battle.getPokemon();
				var cp = battle.getCP();
				var moveStrs = [];

				for(var i = 0; i < pokes.length; i++){
					moveStrs.push(pokes[i].generateURLMoveStr(pokes[i]));
				}

				var battleStr = self.generateSingleBattleLinkString(true);

				var link = host + battleStr;

				$(".share-link input").val(link);

				// Push state to browser history so it can be navigated, only if not from URL parameters

				if(get){
					get = false;

					return;
				}

				// Set document title

				document.title = "Battle - " + pokes[0].speciesName + " vs. " + pokes[1].speciesName + " | PvPoke";

				var url = webRoot+battleStr;

				var data = {cp: cp, p1: pokes[0].speciesId, p2: pokes[1].speciesId, s: pokes[0].startingShields+""+pokes[1].startingShields, m1: moveStrs[0], m2: moveStrs[1], h1: pokes[0].startHp, h2: pokes[1].startHp, e1: pokes[0].startEnergy, e2: pokes[1].startEnergy, sandbox: 1, a: self.generateActionStr() };

				window.history.pushState(data, "Battle", url);
			}

			// Event handler for changing the league select

			function selectLeague(e){
				var allowed = [500, 1500, 2500, 10000];
				var cp = parseInt($(".league-select option:selected").val());
				var levelCap = parseInt($(".league-select option:selected").attr("level-cap"));

				if(allowed.indexOf(cp) > -1){
					battle.setCP(cp);
					battle.setLevelCap(levelCap);

					// Set level cap

					for(var i = 0; i < pokeSelectors.length; i++){
						pokeSelectors[i].setBattle(battle);
						pokeSelectors[i].setCP(cp);
					}

					for(var i = 0; i < multiSelectors.length; i++){
						multiSelectors[i].setLevelCap(levelCap);
						multiSelectors[i].setCP(cp);
					}
				}

				var cupName = "all";

				if((cp == 10000)&&(levelCap == 40)){
					cupName = "classic";
					battle.setCup("classic");
				}

				gm.loadRankingData(self, "overall", parseInt($(".league-select option:selected").val()), cupName);
			}

			// Event handler for changing the battle mode

			function selectMode(e){
				var currentMode = self.battleMode;

				e.preventDefault();

				self.battleMode = $(e.target).attr("data");

				$(e.target).parent().find("a").removeClass("selected");
				$(e.target).addClass("selected");

				$("p.description").hide();
				$("p."+self.battleMode).show();

				$(".poke-select-container").removeClass("single multi matrix");
				$(".poke-select-container").addClass(self.battleMode);

				$(".battle-results").hide();

				if(self.battleMode == "single"){
					pokeSelectors[0].setSelectedPokemon(pokeSelectors[0].getPokemon());
					pokeSelectors[1].setSelectedPokemon(pokeSelectors[1].getPokemon());
				}

				if(self.battleMode == "matrix"){
					$(".poke.multi .custom-options").show();

					window.history.pushState({mode: "matrix"}, "Battle", webRoot + "battle/matrix/");
				}

				// When moving between Multi and Matrix, move multi custom group to the right Matrix group
				if(currentMode == "multi" && self.battleMode == "matrix"){
					multiSelectors[1].setPokemonList(multiSelectors[0].getPokemonList());
					multiSelectors[0].setPokemonList([]);
				}

				// And vice versa
				if(currentMode == "matrix" && self.battleMode == "multi"){
					multiSelectors[0].setPokemonList(multiSelectors[1].getPokemonList());
					multiSelectors[1].setPokemonList([]);
				}
			}

			// Swap the selected Pokemon between the left and right Pokemon selectors

			function swapSelectedPokemon(e){
				e.preventDefault();

				var pokemonA = pokeSelectors[0].getPokemon();
				var pokemonB = pokeSelectors[1].getPokemon();

				if(pokemonA && pokemonB){
					pokeSelectors[0].setSelectedPokemon(pokemonB);
					pokeSelectors[1].setSelectedPokemon(pokemonA);
				}
			}

			// Animate amount of damage from the selected Charged Move on the opposing Pokemon

			function moveBarHover(e){
				e.preventDefault();

				var pokeIndex = $(e.target).closest(".poke.single").index();
				var selectorIndex = (pokeIndex == 0) ? 1 : 0;
				var subject = pokeSelectors[pokeIndex].getPokemon();
				var target = pokeSelectors[selectorIndex].getPokemon();
				var moveIndex = $(e.target).closest(".move-bars").find(".move-bar").index($(e.target).closest(".move-bar"));
				var move = subject.chargedMoves[moveIndex];
				var effectiveness = target.typeEffectiveness[move.type];

				displayDamage = battle.calculateDamageByStats(subject, target, subject.getEffectiveStat(0, true), target.getEffectiveStat(1, true), effectiveness, move);

				pokeSelectors[selectorIndex].animateDamage(displayDamage)
			}

			// Run simulation

			function startBattle(){

				// Hide advanced sections so they don't push the timeline down

				$(".advanced-section").removeClass("active");
				$(".battle-results").hide();
				$(".battle-btn").html("Generating...");

				// This is stupid but the visual updates won't execute until Javascript has completed the entire thread

				setTimeout(function(){

					if(self.battleMode == "single"){

						// Begin a single battle

						if((battle.validate())&&(! animating)){

							// Does this matchup contain buffs or debuffs?

							var usesBuffs = ((pokeSelectors[0].getPokemon().hasBuffMove()) || (pokeSelectors[1].getPokemon().hasBuffMove()));

							if(sandbox){
								usesBuffs = false;
							}

							if(! usesBuffs){

								// If no, do a single sim

								// Update PokeSelectors with new battle instance

								for(var i = 0; i < pokeSelectors.length; i++){

									pokeSelectors[i].setBattle(battle);
								}

								battle.simulate();
								battle.debug();
								self.displayTimeline(battle, false, (settings.animateTimeline !== 0));
							} else{

								// If yes, bulk sim and display median battle

								bulkResults = self.generateBulkSims(battle);
								battle = bulkResults.median;
								battle.debug();

								// Update PokeSelectors with new battle instance

								for(var i = 0; i < pokeSelectors.length; i++){
									pokeSelectors[i].setBattle(battle);
								}

								self.displayTimeline(battle, bulkResults.ratings);

							}

							self.generateMatchupDetails(battle, usesBuffs);
						}

					} else if(self.battleMode == "multi"){
						self.generateMultiBattleResults();
					} else if(self.battleMode == "matrix"){
						self.generateMatrixResults();
					}

					// Scroll to results

					$("html, body").animate({ scrollTop: $(".battle-results."+self.battleMode).offset().top - 185 }, 500);

					$(".battle-btn").html("Battle");

				}, 17);
			}

			// Use the winner's remaining HP, energy, and stat buffs for the next fight

			function continueBattle(e){
				var winner = battle.getWinner();
				var index = winner.pokemon.index;
				var loserIndex = (index == 0) ? 1 : 0;

				$(".poke.single").eq(index).find(".start-hp").val(winner.hp);
				$(".poke.single").eq(index).find(".start-energy").val(winner.energy);
				$(".poke.single").eq(index).find(".stat-mod").eq(0).val(winner.buffs[0]);
				$(".poke.single").eq(index).find(".stat-mod").eq(1).val(winner.buffs[1]);
				$(".poke.single").eq(index).find(".shield-select option[value='"+winner.shields+"']").prop("selected","selected");


				$(".poke.single").eq(index).find(".start-hp").trigger("keyup");
				$(".poke.single").eq(index).find(".start-energy").trigger("keyup");
				$(".poke.single").eq(index).find(".stat-mod").trigger("keyup");

				$(".poke.single").eq(index).find(".options .toggle").addClass("active");

				// Clear other selector

				pokeSelectors[loserIndex].clear();

				// Scroll to inputs

				$("html, body").animate({ scrollTop: $(".poke.single").offset().top-25 }, 500);
			}

			// Event handler for timeline hover and click

			function timelineEventHover(e){

				var $tooltip = $(".battle .tooltip");

				$tooltip.show();

				$tooltip.attr("class","tooltip");

				if(sandbox){
					$tooltip.attr("class","tooltip sandbox");
				}

				$tooltip.find(".name").html($(this).attr("name"));
				$tooltip.addClass($(this).attr("class"));
				$tooltip.find(".details").html('');

				if((($(this).hasClass("fast")) || ($(this).hasClass("charged")))&&(! $(this).hasClass("tap"))){

					var values = $(this).attr("values").split(',');

					$tooltip.find(".details").html(values[0] + " damage<br>" + values[1] + " energy");

					if(values.length == 3){
						$tooltip.find(".details").append("<br>"+values[2]);
					}

				}

				var width = $tooltip.width();
				var left = (e.pageX - $(".section").first().offset().left) + 10;
				var top = e.pageY - 20;

				if( left > ($(".timeline-container").width() - width - 10) ){
					left -= width;
				}

				$tooltip.css("left",left+"px");
				$tooltip.css("top",top+"px");
			}

			// Click play or pause button

			function timelinePlay(e){
				$(".playback .play").toggleClass("active");

				if(animating){
					clearInterval(timelineInterval);

					animating = false;
				} else{

					var rate = 17 * parseInt($(".playback-speed option:selected").val());

					if(time >= battle.getDuration()){
						self.animateTimeline(0, rate);
					} else{
						self.animateTimeline(time, rate);
					}
				}
			}

			// Click replay button

			function timelineReplay(e){
				$(".playback .play").addClass("active");

				if(animating){
					clearInterval(timelineInterval);

					animating = false;
				}

				var rate = 17 * parseInt($(".playback-speed option:selected").val());

				self.animateTimeline(0, rate);
			}

			// Change playback speed during animation

			function timelineSpeedChange(e){

				var speed = parseInt($(".playback-speed option:selected").val());

				if(animating){
					clearInterval(timelineInterval);
					animating = false;

					var rate = 17 * speed;

					self.animateTimeline(time, rate);
				}

				if(speed == 1){
					$(".playback .disclaimer").show();
				} else{
					$(".playback .disclaimer").hide();
				}
			}

			// Change playback scale

			function timelineScaleChange(e){

				timelineScaleMode = $(".playback-scale option:selected").val();

				$(".timeline-container").toggleClass("zoom");
				$(".timeline-container").toggleClass("fit");

				if(animating){
					clearInterval(timelineInterval);
					animating = false;
					$(".playback .play").removeClass("active");
				}

				if(timelineScaleMode == "fit"){
					$(".timeline-container").scrollLeft(0);
					$(".timeline").css("width","100%");
				}

				self.displayTimeline(battle, false, false);
			}

			// Process tooltips and timeline hover

			function mainMouseMove(e){
				if($(".timeline .item:hover").length == 0){
					$(".battle .tooltip").hide();
				}

				if(($(".timeline-container:hover").length > 0)&&(! animating)){
					var offsetX = ($(window).width() - $(".timeline-container").width()) / 2;
					var posX = e.clientX - offsetX;
					var hoverTime;

					if(timelineScaleMode == "fit"){
						hoverTime = ((battle.getDuration()+2000) * (posX / $(".timeline-container").width()))-1000;
					} else if(timelineScaleMode == "zoom"){
						hoverTime = ((posX - 50 + $(".timeline-container").scrollLeft())/50) * 1000;
					}


					time = hoverTime;

					self.displayCumulativeDamage(battle.getTimeline(), time);
				}
			}

			// View a new battle after clicking one of the related battle ratings

			function viewShieldBattle(e){
				e.preventDefault();

				if(animating){
					clearInterval(timelineInterval);

					animating = false;
				}

				var shields = $(e.target).attr("shields").split(",");

				$(".shield-select").eq(0).find("option[value=\""+shields[1]+"\"]").prop("selected", "selected");
				$(".shield-select").eq(0).trigger("change");
				$(".shield-select").eq(1).find("option[value=\""+shields[0]+"\"]").prop("selected", "selected");
				$(".shield-select").eq(1).trigger("change");

				startBattle();
			}

			// View best or worst battle from bulk results

			function viewBulkBattle(e){
				e.preventDefault();

				if($(e.target).hasClass("best")){
					battle = bulkResults.best;
				} else if($(e.target).hasClass("worst")){
					battle = bulkResults.worst;
				} else if($(e.target).hasClass("median")){
					battle = bulkResults.median;
				}
				// Update PokeSelectors with new battle instance

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].setBattle(battle);
				}

				self.displayTimeline(battle, bulkResults.ratings);

				// Scroll to results

				$("html, body").animate({ scrollTop: $(".battle-results."+self.battleMode).offset().top - 185 }, 500);

			}

			// Select and enter an IV combination displayed in the breakpoint table

			function selectBreakpointIVs(e){
				$(".poke.single").first().find(".advanced-section").addClass("active");

				var level = parseFloat($(e.target).attr("level"));
				var atk = parseInt($(e.target).attr("atk"));
				var def = parseInt($(e.target).attr("def"));
				var hp = parseInt($(e.target).attr("hp"));

				var pokemon = pokeSelectors[0].getPokemon();

				if(pokemon){
					pokemon.setLevel(level);
					pokemon.setIV("atk", atk);
					pokemon.setIV("def", def);
					pokemon.setIV("hp", hp);
					pokeSelectors[0].update();

					// Set level and iv fields
					$(".poke.single").first().find("input.level").val(pokemon.level);
					$(".poke.single").first().find("input.iv[iv='atk']").val(pokemon.ivs.atk);
					$(".poke.single").first().find("input.iv[iv='def']").val(pokemon.ivs.def);
					$(".poke.single").first().find("input.iv[iv='hp']").val(pokemon.ivs.hp);
				}

				$("html, body").animate({ scrollTop: $(".poke").offset().top - 30 }, 500);

			}

			// Toggle multi-battle result sort

			function sortMultiBattleResults(e){
				multiBattleWorstToBest = ! multiBattleWorstToBest;

				if(multiBattleWorstToBest){
					$(".multi-battle-sort").html("Sort: Worst to best &#9650;");
				} else{
					$(".multi-battle-sort").html("Sort: Best to worst &#9660;");
				}

				// Reorganize child elements

				$(".battle-results.multi .rankings-container").children().each(function(i,li){$(".battle-results.multi .rankings-container").prepend(li)})
			}

			// Toggle Sandbox Mode on or off

			function toggleSandboxMode(e){
				$(this).toggleClass("active");
				$(".timeline-container").toggleClass("sandbox-mode");
				$(".battle .tooltip").toggleClass("sandbox");
				$(".sandbox, .automated").toggle();
				$(".sandbox-btn-container .sandbox").toggleClass("active");
				$(".matchup-detail-section").toggle();
				$(".bulk-summary").toggle();

				sandbox = $(this).hasClass("active");

				battle.setSandboxMode(sandbox);

				if(sandbox){
					actions = battle.getActions();

					// Give both Pokemon access to shields

					for(var i = 0; i < pokeSelectors.length; i++){
						if(pokeSelectors[i].getPokemon()){
							pokeSelectors[i].getPokemon().setShields(2);
						}
					}

					$(".battle-btn").hide();
					$(".update-btn").css("display","block");
				} else{
					// Update both Pokemon selectors

					$(".shield-select").trigger("change");

					for(var i = 0; i < pokeSelectors.length; i++){
						pokeSelectors[i].update();
					}

					$(".battle-btn").show();
					$(".update-btn").css("display","none");
				}
			}

			// Clicking on a timeline event to edit

			function timelineEventClick(e){

				e.preventDefault();

				if(! sandbox){
					return;
				}

				if($(this).hasClass("shield")){
					// Select the associated charged move

					var turn = $(this).attr("turn");
					var actor = ($(this).attr("actor") == 0) ? 1 : 0;

					$(".timeline .charged[turn='"+turn+"'][actor='"+actor+"']").trigger("click");
					return;
				}

				if((! $(this).hasClass("charged"))&&(! $(this).hasClass("interaction"))){
					return;
				}

				modal = new modalWindow("Select Move (Turn "+$(this).attr("turn")+")", $(".sandbox-move-select"));

				// Populate move select form;

				var actor = parseInt($(this).attr("actor"));
				var pokemon = pokeSelectors[actor].getPokemon();

				sandboxPokemon = pokemon;

				$(".modal .move-select").append("<option class=\""+pokemon.fastMove.type+"\" name=\""+pokemon.fastMove.name+"\" value=\""+pokemon.fastMove.moveId+"\">"+pokemon.fastMove.name+"</option>");

				for(var i = 0; i < pokemon.chargedMoves.length; i++){
					$(".modal .move-select").append("<option class=\""+pokemon.chargedMoves[i].type+"\" name=\""+pokemon.chargedMoves[i].name+"\" value=\""+pokemon.chargedMoves[i].moveId+"\">"+pokemon.chargedMoves[i].name+"</option>");

					// Disable if the Pokemon can't use this move at that time

					if(parseInt($(this).attr("energy")) < pokemon.chargedMoves[i].energy){
						$(".modal .move-select option").last().prop("disabled","disabled");
					}
				}

				$(".modal .move-select").append("<option class=\"none\" name=\"Wait\" value=\"wait\">Wait</option>");

				// Select clicked move

				var moveName = $(this).attr("name");

				if(moveName == "Tap"){
					moveName = pokemon.fastMove.name;
				}

				$(".modal .move-select option[name=\""+moveName+"\"]").prop("selected", "selected");
				$(".modal .move-select").trigger("change");

				// Identify corresponding action

				sandboxAction = null;
				sandboxTurn = parseInt($(this).attr("turn"));

				if(($(this).hasClass("charged"))||($(this).hasClass("wait"))){
					for(var i = 0; i < actions.length; i++){
						if((actions[i].actor == actor)&&(actions[i].turn == parseInt($(this).attr("turn")))){
							sandboxAction = actions[i];
							sandboxActionIndex = i;
						}
					}

					if(sandboxAction.settings.shielded){
						$(".modal .check.shields").addClass("on");
					}

					if(sandboxAction.settings.buffs){
						$(".modal .check.buffs").addClass("on");
					}

					if(sandboxAction.settings.charge){
						var chargeInt = chargeMultipliers.indexOf(sandboxAction.settings.charge);
						$(".modal .charge-select option[value=\""+chargeInt+"\"]").prop("selected", "selected");
					}
				}
			}

			// Change display info for sandbox move selection

			function selectSandboxMove(e){

				if(! sandboxPokemon){
					return;
				}

				var moveId = $(".modal .move-select option:selected").val();
				var move;


				if(moveId == sandboxPokemon.fastMove.moveId){
					move = sandboxPokemon.fastMove;

					$(".modal .fast").show();
					$(".modal .charged").hide();
				} else{
					for(var i = 0; i < sandboxPokemon.chargedMoves.length; i++){
						if(moveId == sandboxPokemon.chargedMoves[i].moveId){
							move = sandboxPokemon.chargedMoves[i];

							$(".modal .fast").hide();
							$(".modal .charged").show();
						}
					}
				}

				if(moveId != "wait"){
					$(".modal .move-stats").show();
					$(".modal .wait").hide();
					$(".modal .move-select").attr("class", "move-select " + move.type);

					// Fill in move stats

					$(".modal .stat-dmg span").html(move.damage);

					if(move.energyGain > 0){
						$(".modal .stat-energy span").html("+"+move.energyGain);
						$(".modal .stat-duration span").html(move.cooldown / 500);
						$(".modal .stat-dpt span").html(Math.round( (move.damage / (move.cooldown / 500)) * 100) / 100);
						$(".modal .stat-ept span").html(Math.round( (move.energyGain / (move.cooldown / 500)) * 100) / 100);
					} else{
						$(".modal .stat-energy span").html("-"+move.energy);
						$(".modal .stat-dpe span").html(Math.round( (move.damage / move.energy) * 100) / 100);
					}

					if(move.buffs){
						$(".modal .check.buffs").show();

						if(move.buffApplyChance == 1){
							$(".modal .check.buffs").addClass("on");
						} else{
							$(".modal .check.buffs").removeClass("on");
						}
					} else{
						$(".modal .check.buffs").hide();
					}
				} else{
					$(".modal .move-select").attr("class", "move-select");
					$(".modal .check").hide();
					$(".modal .move-stats").hide();
					$(".modal .wait").show();
				}


				// Briefly prevent the modal window from closing by accident

				setModalClosePrevention(100);
			}

			// Change display info for sandbox move selection

			function selectSandboxChargePower(e){

				if(! sandboxPokemon){
					return;
				}

				var moveId = $(".modal .move-select option:selected").val();
				var chargeIndex = parseInt($(".modal .charge-select option:selected").val());
				var chargeMultiplier = chargeMultipliers[chargeIndex];
				var move;

				for(var i = 0; i < sandboxPokemon.chargedMoves.length; i++){
					if(moveId == sandboxPokemon.chargedMoves[i].moveId){
						move = sandboxPokemon.chargedMoves[i];
					}
				}

				// Fill in move stats
				var damage = Math.floor((move.damage-1)*chargeMultiplier)+1;

				$(".modal .stat-dmg span").html(damage);
				$(".modal .stat-dpe span").html(Math.round( (damage / move.energy) * 100) / 100);

				// Briefly prevent the modal window from closing by accident

				setModalClosePrevention(100);
			}

			// Submit sandbox action changes

			function applyActionChanges(e){

				// If this is changing a charged move to a fast move, remove the action

				var selectedIndex = $(".modal .move-select")[0].selectedIndex;
				var selectedValue = $(".modal .move-select option:selected").val();

				if((sandboxAction)&&(selectedIndex == 0)){
					for(var i = 0; i < actions.length; i++){
						if(actions[i] == sandboxAction){
							actions.splice(i, 1);
							break;
						}
					}
				}

				// Charged move selection

				if(selectedIndex > 0){

					var shielded = $(".modal .check.shields").hasClass("on");

					if(! sandboxAction){

						// Insert new action

						if(selectedValue != "wait"){
							var chargeIndex = parseInt($(".modal .charge-select option:selected").val());
							var charge = chargeMultipliers[chargeIndex];

							actions.push(new TimelineAction(
								"charged",
								sandboxPokemon.index,
								sandboxTurn,
								selectedIndex-1,
								{
									shielded: $(".modal .check.shields").hasClass("on"),
									buffs: $(".modal .check.buffs").hasClass("on"),
									charge: charge
								}
							));
						} else{
							actions.push(new TimelineAction(
								"wait",
								sandboxPokemon.index,
								sandboxTurn,
								0,
								{}
							));
						}

					} else{

						// Modify existing action

						if(selectedValue != "wait"){
							var chargeIndex = parseInt($(".modal .charge-select option:selected").val());
							var charge = chargeMultipliers[chargeIndex];

							actions[sandboxActionIndex] = new TimelineAction(
								"charged",
								sandboxPokemon.index,
								sandboxTurn,
								selectedIndex-1,
								{
									shielded: $(".modal .check.shields").hasClass("on"),
									buffs: $(".modal .check.buffs").hasClass("on"),
									charge: charge
								}
							);
						} else{
							actions[sandboxActionIndex] = new TimelineAction(
								"wait",
								sandboxPokemon.index,
								sandboxTurn,
								0,
								{}
							);
						}

					}
				}

				// Rerun battle

				closeModalWindow();

				self.runSandboxSim();
			}

			// Bring up the confirmation window for clearing the timeline

			function clearSandboxClick(e){
				modalWindow("Reset Timeline?", $(".sandbox-clear-confirm"));
			}

			// Clear timeline or close window

			function confirmClearSandbox(e){

				if($(this).hasClass("no")){
					closeModalWindow();
				} else{
					self.resetSandbox();
					closeModalWindow();
				}

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
