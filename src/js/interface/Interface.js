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

				pokeSearch.setBattle(battle);

				$(".poke-select-container > .poke.single").each(function(index, value){
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
				$(".battle-btn").on("click", function(e){
					startBattle();
				});
				$(".summary").on("click", ".bulk-btn", function(e){
					startBattle(true);
				});
				$(".continue-container .button").on("click", continueBattle);
				$(".timeline-container").on("mousemove",".item",timelineEventHover);
				$(".poke a.swap").on("click", swapSelectedPokemon);
				$(".poke.single").on("mousemove",".move-bar",moveBarHover);
				$(".multi-battle-sort").on("click", sortMultiBattleResults);
				$(".battle-results.matrix .ranking-categories a").on("click", selectMatrixMode);
				$(".battle-results.matrix select.breakpoint-mode").on("change", selectMatrixBreakpointMode);
				$("body").on("click", ".battle-results.matrix a.difference", jumpToMatrixColumn);
				$("body").on("mousemove",mainMouseMove);
				$("body").on("mousedown",mainMouseMove);
				$("body").on("click", ".check", checkBox);

				// Timeline playback

				$(".playback .play").click(timelinePlay);
				$(".playback .replay").click(timelineReplay);
				$(".playback-speed").change(timelineSpeedChange);
				$(".playback-scale").change(timelineScaleChange);

				// Details battle viewing

				$("body").on("click", ".battle-details .rating-table a.rating", viewShieldBattle);
				$("body").on("click", ".section.summary a.rating", viewBulkBattle);
				$("body").on("click", ".breakpoints-section .button, .cmp-section .button", selectBreakpointIVs);
				$("body").on("change", "select.breakpoint-move", selectBreakpointMove);
				$("body").on("change", "select.bulkpoint-move", selectBulkpointMove);

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

			this.displayTimeline = function(b, bulkRatings, doRandomBulk, animate){

				bulkRatings = typeof bulkRatings !== 'undefined' ? bulkRatings : false;
				doRandomBulk = typeof doRandomBulk !== 'undefined' ? doRandomBulk : false;
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
				var rating = b.getBattleRatings()[0];
				var durationSeconds = Math.floor(b.getDisplayTime() / 100) / 10;

				if(rating != 500){
					var description = "wins";

					if(rating < 500){
						description = "loses";
					}

					$(".battle-results .summary").html("<div class=\"battle-summary-line\"><span class=\"name\">"+pokemon[0].speciesName+"</span> "+description+" in <span class=\"time\">"+durationSeconds+"s</span> with a battle rating of <span class=\"rating\"><span></span>"+rating+"</span></div>");

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

					const turnMarginDisplay = `${turnMargin} turn` + ((turnMargin === 1) ? "" : "s")
					$(".battle-results .summary").append("<div class=\"turn-margin-description\"><span class=\"turn-margin\" value=\""+attr+"\">" + turnMarginDisplay + "</span> of difference can flip this scenario. " + marginSummary + "</div>");

					var color = battle.getRatingColor(rating);

					$(".battle-results .summary .rating").first().css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
					$(".battle-results .summary .rating").addClass(battle.getRatingClass(rating));

					$(".continue-container").show();
					$(".continue-container .name").html(winner.pokemon.speciesName + " (" + winner.hp + " HP, " + winner.energy + " energy)");
				} else{
					$(".battle-results .summary").html("Simultaneous knockout in <span class=\"time\">"+durationSeconds+"s</span>");
					$(".continue-container").hide();
				}

				$(".battle-results .summary").append('<button class="bulk-btn button">Explore Win Conditions</button>');

				// Display bulk sim data

				if(bulkRatings){

					var pokemon = pokeSelectors[0].getPokemon();

					$(".battle-results .summary").append("<div class=\"bulk-summary\"></div>");

					var $outcomes = $("<div class=\"bulk-outcomes\"></div>");

					var bestRating = bulkResults.best.getBattleRatings()[0];
					var bestColor = battle.getRatingColor(bestRating);
					var bestClass = battle.getRatingClass(bestRating);

					var medianRating = bulkResults.median.getBattleRatings()[0];
					var medianColor = battle.getRatingColor(medianRating);
					var medianClass = battle.getRatingClass(medianRating);

					var worstRating = bulkResults.worst.getBattleRatings()[0];
					var worstColor = battle.getRatingColor(worstRating);
					var worstClass = battle.getRatingClass(worstRating);

					$outcomes.append("<div class=\"outcome\"><div class=\"outcome-label\">Worst</div><a href=\"#\" class=\"rating worst\"><span></span>"+worstRating+"</a></div>");

					if((bulkResults.medianLoss)&&(bulkResults.medianWin)){
						var medianLossRating = bulkResults.medianLoss.getBattleRatings()[0];
						var medianLossColor = battle.getRatingColor(medianLossRating);
						var medianLossClass = battle.getRatingClass(medianLossRating);

						$outcomes.append("<div class=\"outcome\"><div class=\"outcome-label\">Median<br>Loss</div><a href=\"#\" class=\"rating median-loss\"><span></span>"+medianLossRating+"</a></div>");
						$outcomes.find(".rating.median-loss").css("background-color", "rgb("+medianLossColor[0]+","+medianLossColor[1]+","+medianLossColor[2]+")");
						$outcomes.find(".rating.median-loss").addClass(medianLossClass);
					}

					$outcomes.append("<div class=\"outcome\"><div class=\"outcome-label\">Median</div><a href=\"#\" class=\"rating median\"><span></span>"+medianRating+"</a></div>");

					if((bulkResults.medianLoss)&&(bulkResults.medianWin)){
						var medianWinRating = bulkResults.medianWin.getBattleRatings()[0];
						var medianWinColor = battle.getRatingColor(medianWinRating);
						var medianWinClass = battle.getRatingClass(medianWinRating);

						$outcomes.append("<div class=\"outcome\"><div class=\"outcome-label\">Median<br>Win</div><a href=\"#\" class=\"rating median-win\"><span></span>"+medianWinRating+"</a></div>");
						$outcomes.find(".rating.median-win").css("background-color", "rgb("+medianWinColor[0]+","+medianWinColor[1]+","+medianWinColor[2]+")");
						$outcomes.find(".rating.median-win").addClass(medianWinClass);
					}

					$outcomes.append("<div class=\"outcome\"><div class=\"outcome-label\">Best</div><a href=\"#\" class=\"rating best\"><span></span>"+bestRating+"</a></div>");

					$outcomes.find(".rating.best").css("background-color", "rgb("+bestColor[0]+","+bestColor[1]+","+bestColor[2]+")");
					$outcomes.find(".rating.median").css("background-color", "rgb("+medianColor[0]+","+medianColor[1]+","+medianColor[2]+")");
					$outcomes.find(".rating.worst").css("background-color", "rgb("+worstColor[0]+","+worstColor[1]+","+worstColor[2]+")");

					$outcomes.find(".rating.best").addClass(bestClass);
					$outcomes.find(".rating.median").addClass(medianClass);
					$outcomes.find(".rating.worst").addClass(worstClass);

					$(".battle-results .bulk-summary").append($outcomes);

					$(".battle-results .bulk-summary").append("<div class=\"histograms\"><div class=\"histogram\"></div></div>");

					// Generate and display histogram

					bulkHistogram = new BattleHistogram($(".battle-results .bulk-summary .histogram"));
					bulkHistogram.generate(pokeSelectors[0].getPokemon(), bulkRatings, 400);

					$(".battle-results .bulk-summary").append("<div class=\"disclaimer\">Above is a collection of outcomes if both Pokemon take random move and shield actions. Explore the best, worst, and average results. Due to each Pokemon's randomized behavior, results may change and may not always represent realistic scenarios. Pokemon are not guaranteed to use all available shields or energy.</div>");
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

					document.title = pokes[0].speciesName + " vs. " + pokes[1].speciesName + " - Battle | PvPoke";

					// Push state to browser history so it can be navigated, only if not from URL parameters
					gtag('event', 'Lookup', {
					  'category': 'Simulation',
					  'speciesId' : pokes[0].speciesId
					});

					gtag('event', 'Lookup', {
					  'category': 'Simulation',
					  'speciesId' : pokes[1].speciesId
					});

					gtag('event', 'page_view', {
					  page_title: document.title,
					  page_location: link,
					  pageview_type: 'virtual'
					});

					if(get){
						get = false;

						return;
					}

					var url = webRoot+battleStr;

					var data = {cp: cp, p1: pokes[0].speciesId, p2: pokes[1].speciesId, s: pokes[0].startingShields+""+pokes[1].startingShields, m1: moveStrs[0], m2: moveStrs[1], h1: pokes[0].startHp, h2: pokes[1].startHp, e1: pokes[0].startEnergy, e2: pokes[1].startEnergy };

					window.history.pushState(data, "Battle", url);
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

			this.generateMatchupDetails = function(battle, bulkResults){

				// Run simulations for every shield matchup

				var pokemon = [];

				for(var i = 0; i < pokeSelectors.length; i++){
					pokemon.push(pokeSelectors[i].getPokemon());
				}

				$(".battle-details .name-1").html(pokemon[0].speciesName);
				$(".rating-table .name-1.name").html(pokemon[0].speciesName.charAt(0)+".");
				$(".battle-details .name-2").html(pokemon[1].speciesName);

				$(".rating-table .rating, .stats-table .rating").removeClass("win close-win tie close-loss loss");

				if(! sandbox){

					for(var i = 0; i < 3; i++){

						for(var n = 0; n < 3; n++){

							pokemon[0].setShields(n);
							pokemon[1].setShields(i);

							// Don't do this battle if it's already been simmed
							var rating;
							var color;

							var b = new Battle();
							b.setLevelCap(battle.getLevelCap());
							b.setCP(battle.getCP());
							b.setNewPokemon(pokemon[0], 0, false);
							b.setNewPokemon(pokemon[1], 1, false);

							b.simulate();


							/*if(bulkResults){
								b = bulkResults.median;
							} else{
								b.simulate();
							}*/

							rating = b.getBattleRatings()[0];
							color = b.getRatingColor(rating);

							$(".rating-table .battle-"+i+"-"+n).html("<span></span>" + rating);
							$(".rating-table .battle-"+i+"-"+n).addClass(battle.getRatingClass(rating));
							$(".rating-table .battle-"+i+"-"+n).css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
						}
					}

					// Reset shields for future battles

					pokeSelectors[0].resetShields();
					pokeSelectors[1].resetShields();
				}

				// Calculate stats

				// Battle Rating

				for(var i = 0; i < 2; i++){

					rating = battle.getBattleRatings()[i];
					color = battle.getRatingColor(rating);


					$(".stats-table .rating").eq(i).html("<span></span>"+rating);
					$(".stats-table .rating").eq(i).addClass(battle.getRatingClass(rating));
					$(".stats-table .rating").eq(i).css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
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
				$(".breakpoints-section .name-attacker").html(pokemon[0].speciesName);
				$(".breakpoints-section .name-defender").html(pokemon[1].speciesName);

				$("select.breakpoint-move option, select.bulkpoint-move option").remove();

				$("select.breakpoint-move").append("<option value=\""+pokemon[0].fastMove.moveId+"\">"+pokemon[0].fastMove.name+"</option>");

				for(var i = 0; i < pokemon[0].chargedMoves.length; i++){
					$("select.breakpoint-move").append("<option value=\""+pokemon[0].chargedMoves[i].moveId+"\">"+pokemon[0].chargedMoves[i].name+"</option>");
				}

				$("select.bulkpoint-move").append("<option value=\""+pokemon[1].fastMove.moveId+"\">"+pokemon[1].fastMove.name+"</option>");

				for(var i = 0; i < pokemon[1].chargedMoves.length; i++){
					$("select.bulkpoint-move").append("<option value=\""+pokemon[1].chargedMoves[i].moveId+"\">"+pokemon[1].chargedMoves[i].name+"</option>");
				}


				// List each Pokemon's moves for breakpoint and bulkpoint analysis

				var breakpoints = self.displayBreakpoints(pokemon[0].fastMove);
				var bulkpoints = self.displayBulkpoints(pokemon[1].fastMove);

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

				// Display optimal move timing chart

				$(".optimal-timing-section .name-attacker").html(pokemon[0].speciesName);
				$(".optimal-timing-section .name-defender").html(pokemon[1].speciesName);

				var targetCooldown = 500;
				var startCooldown = pokemon[0].startCooldown - 500;

				// Optimal timing is N/A when the opponent has a shorter move that is divisible into your move, or both Pokemon have the same move
				if(pokemon[0].fastMove.cooldown % pokemon[1].fastMove.cooldown == 0){
					if(pokemon[0].startCooldown == pokemon[1].startCooldown){
						targetCooldown = 0;
					} else if(pokemon[0].startCooldown > pokemon[1].startCooldown){
						targetCooldown = 0;
					} else{
						targetCooldown = 500;
					}
				}

				// Pokemon with 2 turn moves can only throw on turn 2 of a 4 turn move
				if(pokemon[0].fastMove.cooldown == 1000 && pokemon[1].fastMove.cooldown == 2000){
					if(pokemon[0].startCooldown == pokemon[1].startCooldown){
						targetCooldown = 1000;
					} else {
						var cooldownDifference = (pokemon[0].startCooldown - pokemon[1].startCooldown) - 500;
						targetCooldown = 1000 - cooldownDifference;
					}
				}

				var displayCycles = 0;

				var optimalTimes = []; // Array that stores integer counts of Fast Moves that provide optimal timing
				var opponentFastCount = 0;
				var opponentOffset = 0;

				if(pokemon[0].startCooldown == pokemon[1].startCooldown){
					opponentOffset = 0;
				} else if(pokemon[0].startCooldown == 1000){
					opponentOffset = -500;
				} else if(pokemon[1].startCooldown == 1000){
					opponentOffset = 500;
				}

				for(var i = 1; displayCycles < 3; i++){
					var targetTurn = opponentOffset + (pokemon[1].fastMove.cooldown * i) - targetCooldown; // Target the last turn of the move

					if(targetCooldown > 0 && targetTurn > 0 && targetTurn % pokemon[0].fastMove.cooldown == 0){ // If this turn is divisible by your Fast Move duration
						optimalTimes.push(targetTurn / pokemon[0].fastMove.cooldown); // Number of moves you need to use to reach this optimal turn
						displayCycles++;
					} else if(targetCooldown == 0){
						displayCycles++;
					}

					opponentFastCount = i;
				}

				if(targetCooldown == 0){
					opponentFastCount = (displayCycles * pokemon[0].fastMove.cooldown) / pokemon[1].fastMove.cooldown;
				}


				// Display fast moves on timeline
				if(optimalTimes.length > 0){
					displayCycles = optimalTimes[2];
				}

				// Add an empty chunk at the beginning for 1 turn switch
				if(pokemon[0].startCooldown == 1000){
					$fastItem = $('<div class="item fast fade"><div class="chunk"></div></div>');
					$fastItem.css("flex", 1);
					$(".optimal-timing-section .timeline").eq(0).append($fastItem);
				}

				if(pokemon[1].startCooldown == 1000){
					$fastItem = $('<div class="item fast fade"><div class="chunk"></div></div>');
					$fastItem.css("flex", 1);
					$(".optimal-timing-section .timeline").eq(1).append($fastItem);
				}

				for(i = 0; i < displayCycles; i++){
					var $fastItem = $('<div class="item fast '+pokemon[0].fastMove.type+'"></div>');
					$fastItem.css("flex", pokemon[0].fastMove.cooldown / 500 + "");

					for(var n = 0; n < pokemon[0].fastMove.cooldown / 500; n++){
						$fastItem.append('<div class="chunk"></div>')
					}

					if(optimalTimes.indexOf(i) == -1){
						$fastItem.addClass("fade");
					} else{
						$fastItem.addClass("throw");
					}

					$(".optimal-timing-section .timeline").eq(0).append($fastItem);
				}

				// Add an empty chunk at the end for a Charged Move space
				$(".optimal-timing-section p").hide();

				if(targetCooldown > 0){
					$fastItem = $('<div class="item fast throw '+pokemon[0].fastMove.type+'"></div>');
					$fastItem.css("flex", targetCooldown / 500 + "");
					for(var i = 0; i < targetCooldown / 500; i++){
						$fastItem.append("<div class=\"chunk\"></div>");
					}
					$(".optimal-timing-section .timeline").eq(0).append($fastItem);

					$(".optimal-timing-section .optimal-1").html(optimalTimes[0]);
					$(".optimal-timing-section .optimal-2").html(optimalTimes[1]);
					$(".optimal-timing-section .optimal-3").html(optimalTimes[2]);

					$(".optimal-timing-section p.timing-most-optimal").show();
				} else if(pokemon[0].startCooldown == 1000 && pokemon[1].startCooldown == 0 && pokemon[0].fastMove.cooldown == pokemon[1].fastMove.cooldown
				&& pokemon[0].fastMove.cooldown != 500){
					$(".optimal-timing-section p.timing-offset").show();
				} else{
					$(".optimal-timing-section p.timing-none").show();
				}

				for(i = 0; i < opponentFastCount; i++){
					$fastItem = $('<div class="item fast '+pokemon[1].fastMove.type+'"></div>');
					$fastItem.css("flex", pokemon[1].fastMove.cooldown / 500 + "");
					for(var n = 0; n < pokemon[1].fastMove.cooldown / 500; n++){
						$fastItem.append('<div class="chunk"></div>')
					}

					$(".optimal-timing-section .timeline").eq(1).append($fastItem);
				}

				// Add an empty chunk at the end  for 1 turn switch
				if($(".optimal-timing-section .timeline").eq(0).find(".chunk").length < $(".optimal-timing-section .timeline").eq(1).find(".chunk").length){
					$fastItem = $('<div class="item fast fade"><div class="chunk"></div></div>');
					$fastItem.css("flex", 1);
					$(".optimal-timing-section .timeline").eq(0).append($fastItem);
				} else if($(".optimal-timing-section .timeline").eq(1).find(".chunk").length < $(".optimal-timing-section .timeline").eq(0).find(".chunk").length){
					$fastItem = $('<div class="item fast fade"><div class="chunk"></div></div>');
					$fastItem.css("flex", 1);
					$(".optimal-timing-section .timeline").eq(1).append($fastItem);
				}
			}

			// Display breakpoint values in the breakpoint table
			this.displayBreakpoints = function(move){
				// Output to table
				var attacker = pokeSelectors[0].getPokemon();
				var defender = pokeSelectors[1].getPokemon();
				var breakpoints = attacker.calculateBreakpoints(defender, move);

				$(".stats-table.breakpoints .output").html('<tr></tr>');

				for(var i = breakpoints.length-1; i >= 0; i--){
					var attack = Math.round(breakpoints[i].attack * 100) / 100;
					var guaranteedAttack = Math.round(breakpoints[i].guaranteedAttack * 100) / 100;

					if(guaranteedAttack == -1){
						guaranteedAttack = "-";
					}

					// Find the best combinations that reaches this value
					var combinations = attacker.generateIVCombinations("overall", 1, 2, [{stat: "atk", value: breakpoints[i].attack}]);

					$(".stats-table.breakpoints .output").append("<tr class=\"toggle\"><td>"+breakpoints[i].damage+"</td><td>"+attack+"</td><td>"+guaranteedAttack+"</td><td class=\"ivs\"><div class=\"button\" level=\""+combinations[0].level+"\" atk=\""+combinations[0].ivs.atk+"\" def=\""+combinations[0].ivs.def+"\" hp=\""+combinations[0].ivs.hp+"\">"+combinations[0].level+ " "+combinations[0].ivs.atk+"/"+combinations[0].ivs.def+"/"+combinations[0].ivs.hp+"</div></td></tr>");

					if(breakpoints[i].damage == move.damage){
						$(".stats-table.breakpoints .output tr").last().addClass("bold");
					}

				}

				return breakpoints;
			}

			this.displayBulkpoints = function(move){
				// Output to table
				var attacker = pokeSelectors[1].getPokemon();
				var defender = pokeSelectors[0].getPokemon();
				var bulkpoints = defender.calculateBulkpoints(attacker, move);

				$(".stats-table.bulkpoints .output").html('<tr></tr>');

				for(var i = 0; i < bulkpoints.length; i++){
					var defense = Math.round(bulkpoints[i].defense * 100) / 100;
					var guaranteedDefense = Math.round(bulkpoints[i].guaranteedDefense * 100) / 100;

					if(guaranteedDefense == -1){
						guaranteedDefense = "-";
					}


					// Find the best combinations that reaches this value
					var combinations = defender.generateIVCombinations("overall", 1, 2, [{stat: "def", value: bulkpoints[i].defense}]);

					$(".stats-table.bulkpoints .output").append("<tr class=\"toggle\"><td>"+bulkpoints[i].damage+"</td><td>"+defense+"</td><td>"+guaranteedDefense+"</td><td class=\"ivs\"><div class=\"button\" level=\""+combinations[0].level+"\" atk=\""+combinations[0].ivs.atk+"\" def=\""+combinations[0].ivs.def+"\" hp=\""+combinations[0].ivs.hp+"\">"+combinations[0].level+ " "+combinations[0].ivs.atk+"/"+combinations[0].ivs.def+"/"+combinations[0].ivs.hp+"</div></td></tr>");

					if(bulkpoints[i].damage == attacker.fastMove.damage){
						$(".stats-table.bulkpoints .output tr").last().addClass("bold");
					}

				}

				return bulkpoints;
			}

			// Process selected Pokemon through the team ranker

			this.generateMultiBattleResults = function(){

				// Set settings

				var cup = $(".cup-select option:selected").val();
				var opponentShields = multiSelectors[0].getSettings().shields;
				var chargedMoveCount = 2;
				var shieldBaiting = multiSelectors[0].getSettings().bait;
				var multiBattleFilter = multiSelectors[0].getFilterMode();

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
					var settings = getDefaultMultiBattleSettings();

					settings.shields = poke.startingShields;
					settings.ivs = "original";
					settings.bait = poke.baitShields;
					settings.levelCap = battle.getLevelCap();

					ranker.applySettings(settings, 0);
					team.push(poke);
				} else{
					return;
				}

				// Set multi selected Pokemon if available
				if((multiBattleFilter == "meta")||(cup == "custom")){
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

					pokemon.baitShields = multiSelectors[0].getSettings().bait;

					if(pokemon.baitShields != 1){
						pokemon.isCustom = true;
					}

					var opPokeStr = pokemon.generateURLPokeStr();
					var opMoveStr = pokemon.generateURLMoveStr();

					var battleLink = host+"battle/"+battle.getCP(true)+"/"+pokeStr+"/"+opPokeStr+"/"+shieldStr+"/"+moveStr+"/"+opMoveStr+"/";

					// Append extra options

					if( poke.startHp != poke.stats.hp || pokemon.startHp != pokemon.stats.hp || poke.startEnergy != 0 || pokemon.startEnergy != 0){
						battleLink += poke.startHp + "-" + pokemon.startHp + "/" + poke.startEnergy + "-" + pokemon.startEnergy + "/";
					}

					var $el = $(
						"<div class=\"rank typed-ranking " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\" data=\""+pokemon.speciesId+"\">" +
							"<div class=\"pokemon-info\">" +
								"<div class=\"name-container\">" +
									"<span class=\"number\">#"+(i+1)+"</span>" +
									"<span class=\"name\">"+pokemon.speciesName+"</span>" +
									"<div class=\"moves\">"+moveNameStr+"</div>" +
								"</div>" +
								"<div class=\"type-container\"></div>" +
							"</div>" +
							"<div class=\"rating-container\">" +
								"<a class=\"rating\" target=\"_blank\" href=\""+battleLink+"\">" +
									"<span></span>"+r.opRating+"<i></i></span>" +
								"</a>" +
								"<div class=\"clear\">" +
							"</div>" +
						"</div>");

					var ratingColor = battle.getRatingColor(r.opRating);
					var ratingClass = battle.getRatingClass(r.opRating);
					$el.find(".rating").addClass(ratingClass);
					$el.find(".rating").css("background", "rgb("+ratingColor[0]+","+ratingColor[1]+","+ratingColor[2]+")");

					for(var n = 0; n < pokemon.types.length; n++){
						var typeStr = pokemon.types[n].charAt(0).toUpperCase() + pokemon.types[n].slice(1);
						if(pokemon.types[n] != "none"){
							$el.find(".type-container").append("<div class=\"type-info "+pokemon.types[n]+"\">"+typeStr+"</div>");
						}
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
				} else if(multiBattleFilter == "all"){
					battleStr += "all/";
				}

				// Add Multi Battle options
				var defaultSettings = getDefaultMultiBattleSettings();
				var settings = multiSelectors[0].getSettings();
				var options = [];

				if(settings.startHp != defaultSettings.startHp){
					options.push("hp=" + (settings.startHp * 100));
				}

				if(settings.startEnergy != defaultSettings.startEnergy){
					options.push("energy=" + settings.startEnergy);
				}

				if(settings.startCooldown != defaultSettings.startEnergy){
					options.push("cooldown=" + settings.startCooldown);
				}

				if(settings.startStatBuffs[0] != defaultSettings.startStatBuffs[0] || settings.startStatBuffs[1] != defaultSettings.startStatBuffs[1]){
					options.push("stats=" + settings.startStatBuffs[0] + "," + settings.startStatBuffs[1]);
				}

				if(settings.optimizeMoveTiming != defaultSettings.optimizeMoveTiming){
					options.push("timing=" + (settings.optimizeMoveTiming ? 1 : 0));
				}

				if(options.length > 0){
					battleStr += "?" + options.join("&") + "/";
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
				  'category' : 'Simulation',
				  'speciesId' : pokemon.speciesId
				});

				document.title = poke.speciesName + " Multi-Battle | PvPoke";

				if(get && get['p1']){
					get = false;

					return;
				}

				var url = webRoot+battleStr;

				var data = {cp: cp, p1: poke.speciesId, cup:cup, s: poke.startingShields+""+opponentShields, m1: moveStr, cms: chargedMoveCount, mode: self.battleMode};

				window.history.pushState(data, "Battle", url);

				// Send Google Analytics pageview
				gtag('event', 'page_view', {
				  page_title: document.title,
				  page_location: link,
				  pageview_type: 'virtual'
				});
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
				  'category' : 'Matrix'
				});
			}

			// Process both groups of Pokemon through the team ranker

			this.displayMatrixResults = function(rankings){

				var team = multiSelectors[1].getPokemonList();
				var targets = multiSelectors[0].getPokemonList();

				// Display results
				var csv = ','; // CSV data of all matchups
				$(".matrix-table").html("");

				var $row = $("<thead><tr><th></th><th class=\"arrow\"></th></tr></thead>");

				// Add matrix table headings for all Pokemon on the right side

				for(var n = 0; n < team.length; n++){
					$row.find("tr").append("<th class=\"name-small\">"+team[n].speciesName+" <span>"+team[n].generateMovesetStr()+"<br>"+ team[n].ivs.atk + "/" + team[n].ivs.def + "/" + team[n].ivs.hp + "</span></th>");

					csv += team[n].speciesName+" "+team[n].generateMovesetStr() + " " + team[n].ivs.atk + "/" + team[n].ivs.def + "/" + team[n].ivs.hp + ',';
				}

				// Add win-loss-draw and average columns

				csv +='Wins,Losses,Draws,';

				$row.find("tr").append("<th class=\"name-small\">Record (W/L/D)</th>");

				$row.find("tr").append("<th class=\"name-small\">Average</th>");

				csv +='Average';
				csv += '\n';

				$(".matrix-table.rating-table").append($row);
				$(".matrix-table").append("<tbody></tbody>");
				$(".matrix-table").attr("mode", self.matrixMode);

				for(var i = 0; i < rankings.length; i++){
					var r = rankings[i];
					var pokemon = r.pokemon;

					// Add results to matrix table
					var record = {
						wins: 0,
						losses: 0,
						draws: 0
					};

					var average = 0;

					$row = $("<tr><th class=\"number\">"+(i+1)+"</th><th class=\"name\">" + pokemon.speciesName+" <span>"+pokemon.generateMovesetStr()+"<br>" + pokemon.ivs.atk + "/" + pokemon.ivs.def + "/" + pokemon.ivs.hp + "</span></th></tr>");

					var $differenceRow = $row.clone();
					$differenceRow.append($("<td class=\"differences\"><div class=\"wins\"></div><div class=\"losses\"></div></td>"));

					csv += pokemon.speciesName + ' ' + pokemon.generateMovesetStr() + ' ' + + pokemon.ivs.atk + "/" + pokemon.ivs.def + "/" + pokemon.ivs.hp + ',';

					var differenceMatchups = []; // Keep a separate array to sort matchup differences

					for(var n = 0; n < r.matchups.length; n++){
						var opponent = r.matchups[n].opponent;

						r.matchups[n].difference = false; // Store whether or not this matchups is different or flipped from the base value
						r.matchups[n].matchupIndex = n;

						var $cell = $("<td><a class=\"rating\" href=\"#\" target=\"blank\"><span></span></a></td>");
						var rating = r.matchups[n].rating;
						var displayStat = r.matchups[n].rating;
						var baseValue = rankings[0].matchups[n].rating;
						var color = battle.getRatingColor(rating);
						var ratingClass = battle.getRatingClass(rating);

						// Determine values to display and any flipped matchups
						switch(self.matrixMode){
							case "battle":
								if(baseValue <= 500 && displayStat > 500){
									r.matchups[n].difference = "win";
								} if(baseValue < 500 && displayStat == 500){
									r.matchups[n].difference = "win";
								} else if(baseValue >= 500 && displayStat < 500){
									r.matchups[n].difference = "lose";
								} else if(baseValue > 500 && displayStat == 500){
									r.matchups[n].difference = "lose";
								}
								break;

							case "breakpoint":
								var breakpointMode = $(".battle-results.matrix .breakpoint-mode option:selected").val();

								if(breakpointMode == "fast"){
									displayStat = r.matchups[n].breakpoint;
									baseValue = rankings[0].matchups[n].breakpoint;
								} else if(breakpointMode == "cm1"){
									displayStat = r.matchups[n].breakpointCM1;
									baseValue = rankings[0].matchups[n].breakpointCM1;
								} else if(breakpointMode == "cm2"){
									displayStat = r.matchups[n].breakpointCM2;
									baseValue = rankings[0].matchups[n].breakpointCM2;
								}

								if(displayStat == 0){
									displayStat = "-";
								}

								if(displayStat > baseValue){
									r.matchups[n].difference = "win";
								} else if(displayStat < baseValue){
									r.matchups[n].difference = "lose";
								}
								break;

							case "bulkpoint":
								breakpointMode = $(".battle-results.matrix .breakpoint-mode option:selected").val();

								if(breakpointMode == "fast"){
									displayStat = r.matchups[n].bulkpoint;
									baseValue = rankings[0].matchups[n].bulkpoint;
								} else if(breakpointMode == "cm1"){
									displayStat = r.matchups[n].bulkpointCM1;
									baseValue = rankings[0].matchups[n].bulkpointCM2;
								} else if(breakpointMode == "cm2"){
									displayStat = r.matchups[n].bulkpointCM2;
									baseValue = rankings[0].matchups[n].bulkpointCM2;
								}

								if(displayStat == 0){
									displayStat = "-";
								}

								if(displayStat > baseValue){
									r.matchups[n].difference = "lose";
								} else if(displayStat < baseValue){
									r.matchups[n].difference = "win";
								}
								break;

							case "attack":
								displayStat = r.matchups[n].atkDifferential;
								baseValue = rankings[0].matchups[n].atkDifferential;

								if(displayStat > 0 && baseValue <= 0){
									r.matchups[n].difference = "win";
								} else if(displayStat < 0 && baseValue >= 0){
									r.matchups[n].difference = "lose";
								}
							break;
						}

						r.matchups[n].displayStat = displayStat;

						csv += displayStat + ',';
						average += displayStat;

						// Make the attack differential stat pretty
						if(self.matrixMode == "attack"){
							displayStat = Math.round(displayStat * 10) / 10;

							if(displayStat > 0){
								displayStat = "+" + displayStat;
								record.wins++;
							} else if(displayStat == 0){
								displayStat = "+" + displayStat;
								record.draws++;
							} else if(displayStat < 0){
								record.losses++;
							}
						}

						// Show battle result wins for all settings except Attack, which shows CMP tie records
						if(self.matrixMode != "attack"){
							if(rating > 500){
								record.wins++;
							} else if(rating == 500){
								record.draws++;
							} else if(rating < 500){
								record.losses++;
							}
						}

						$cell.find("a").html("<span></span>"+displayStat);
						$cell.find("a").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
						$cell.find("a").addClass(ratingClass);

						var pokeStr = pokemon.generateURLPokeStr();
						var moveStr = pokemon.generateURLMoveStr();
						var opPokeStr = opponent.generateURLPokeStr();
						var opMoveStr = opponent.generateURLMoveStr();
						var battleLink = host+"battle/"+battle.getCP(true)+"/"+pokeStr+"/"+opPokeStr+"/"+pokemon.startingShields+""+opponent.startingShields+"/"+moveStr+"/"+opMoveStr+"/";


						if( pokemon.startHp != pokemon.stats.hp || opponent.startHp != opponent.stats.hp || pokemon.startEnergy != 0 || opponent.startEnergy != 0){
							battleLink += pokemon.startHp + "-" + opponent.startHp + "/" + pokemon.startEnergy + "-" + opponent.startEnergy + "/";
						}


						$cell.find("a").attr("href", battleLink);

						$row.append($cell);

						differenceMatchups.push(r.matchups[n]);
					}

					average = average / r.matchups.length

					// Display win-loss record
					var recordStr = record.wins+"-"+record.losses+"-"+record.draws;

					var $cell = $("<td class=\"matrix-record\">"+recordStr+"</td>");
					$row.append($cell);

					csv += record.wins + ',' + record.losses + ',' + record.draws + ',';

					// Display average
					var displayAverage = Math.round(average * 100) / 100;

					if(self.matrixMode == "battle"){
						var color = battle.getRatingColor(displayAverage);
						var ratingClass = battle.getRatingClass(displayAverage);
						var $cell = $("<td><a class=\"rating "+ratingClass + " average\" target=\"blank\"><span></span>"+displayAverage+"</a></td>");

						$cell.find("a").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
						$row.append($cell);
					} else{
						var $cell = $("<td class=\"matrix-average\">"+displayAverage+"</td>");
						$row.append($cell);
					}


					csv += displayAverage;


					$(".matrix-table.rating-table tbody").append($row);

					// Sort and display differences
					differenceMatchups.sort((a,b) => (a.difference > b.difference) ? -1 : ((b.difference > a.difference) ? 1 : 0));

					for(var n = 0; n < differenceMatchups.length; n++){
						// Add differences

						if(differenceMatchups[n].difference){
							var $difference = $("<a href=\"#\" class=\"difference " + differenceMatchups[n].difference + "\" matchup-index=\""+differenceMatchups[n].matchupIndex+"\">"+differenceMatchups[n].opponent.speciesName+"<br><span>" + differenceMatchups[n].opponent.generateMovesetStr() + "</span></a>");
							var rating = differenceMatchups[n].rating;

							// Exaggerate differences so colors are easier to distinguish
							if(rating > 500){
								rating = Math.min(1000, rating + 200);
							} else if (rating < 500){
								rating = Math.max(0, rating - 200);
							}

							if(self.matrixMode == "battle"){
								var color = battle.getRatingColor(rating);
								if(rating == 500){
									color = [150,140,182];
								}
								$difference.css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
							}

							if(differenceMatchups[n].difference == "win"){
								$difference.prepend("+ ");
								$differenceRow.find(".differences .wins").append($difference);
							} else{
								$difference.prepend("- ");
								$differenceRow.find(".differences .losses").append($difference);
							}

						}
					}

					// Show message for no differences
					if(i > 0 && $differenceRow.find(".wins a").length == 0 && $differenceRow.find(".losses a").length == 0 ){
						$differenceRow.find(".differences").append("No differences");
					}

					$(".matrix-table.difference-table tbody").append($differenceRow);

					csv += '\n';
				}

				// Display win loss records


				$(".battle-results.matrix").show();

				$(".battle-results.matrix").first().find("p").hide();
				$(".battle-results.matrix").first().find("p."+self.matrixMode).show();

				if(self.matrixMode == "breakpoint" || self.matrixMode == "bulkpoint"){
					$(".battle-results.matrix select.breakpoint-mode").show();
				} else{
					$(".battle-results.matrix select.breakpoint-mode").hide();
				}

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

			// Event handler for changing the battle mode

			function selectMatrixBreakpointMode(e){
				e.preventDefault();

				self.displayMatrixResults(matrixResults);
			}


			// Jump to a specific column in the matrix results table to highlight a matchup

			function jumpToMatrixColumn(e){
				e.preventDefault();

				// Open matchups toggle if closed

				$(".battle-results.matrix .toggle").first().addClass("active");

				var matchupIndex = parseInt($(e.target).closest("a").attr("matchup-index")) + 1;
				var theadWidth = $(".matrix-table.rating-table thead th").first().width();
				var tableGotoOffset = $(".matrix-table.rating-table").parent().scrollLeft() + $(".matrix-table.rating-table thead th").eq(matchupIndex).position().left - theadWidth - 20;

				$(".matrix-table.rating-table").parent().scrollLeft(tableGotoOffset);

				// Highlight cells in this column
				$(".matrix-table.rating-table thead th").removeClass("selected");
				$(".matrix-table.rating-table tbody td").removeClass("selected");
				$(".matrix-table.rating-table thead th").eq(matchupIndex).addClass("selected");
				$(".matrix-table.rating-table tbody tr").each(function(index, value){
					$(this).find("td").eq(matchupIndex-1).addClass("selected");
				});


				$("html, body").animate({ scrollTop: $(".battle-results .matrix-table.rating-table").offset().top - 185 }, 500);
			}

			// For battles with buffs or debuffs, run bulk sims and return median match

			this.generateBulkSims = function(battle, n, isRandom){

				var battles = [];
				var wins = [];
				var losses = [];
				var ratings = [];
				var simCount = n;

				for(var i = 0; i < simCount; i++){
					var b = new Battle();
					b.setLevelCap(battle.getLevelCap());
					b.setCP(battle.getCP());
					b.setCup(battle.getCup());
					b.setBuffChanceModifier(0);

					if(isRandom){
						b.setDecisionMethod("random");
					}

					b.setNewPokemon(pokeSelectors[0].getPokemon(), 0, false);
					b.setNewPokemon(pokeSelectors[1].getPokemon(), 1, false);

					b.simulate();

					var rating = b.getPokemon()[0].getBattleRating();

					battles.push({rating: rating, battle: b});

					if(rating >= 500){
						wins.push({rating: rating, battle: b});
					} else{
						losses.push({rating: rating, battle: b});
					}

					ratings.push(rating);
				}

				// Sort results by battle rating

				battles.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));
				wins.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));
				losses.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));

				var medianIndex = Math.floor(simCount / 2);

				// Find median win and median loss
				var medianWin = null;
				var medianLoss = null;

				if(wins.length > 0){
					var medianWinIndex = Math.floor(wins.length / 2);
					medianWin = wins[medianWinIndex].battle;
				}

				if(losses.length > 0){
					var medianLossIndex = Math.floor(losses.length / 2)
					medianLoss = losses[medianLossIndex].battle;
				}

				return {
					best: battles[0].battle,
					median: battles[medianIndex].battle,
					worst: battles[battles.length-1].battle,
					medianWin: medianWin,
					medianLoss: medianLoss,
					ratings: ratings
				};
			}

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				settingGetParams = true;

				var multiBattleSettings = getDefaultMultiBattleSettings();

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
											pokemon.baitShields = parseInt(arr[7]);

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
												$(".poke.single .form-group").eq(index).find(".form").removeClass("on");
												$(".poke.single .form-group").eq(index).find(".form[value=\""+arr[i]+"\"]").addClass("on");
												break;

											case "d":
												if(arr.length > i + 1){
													pokemon.startCooldown = parseInt(arr[i+1]);
												}
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

								// Search string for any custom moves to add

								for(var i = 0; i < arr.length; i++){
									if(arr[i].match('([A-Z_]+)')){
										var move = gm.getMoveById(arr[i]);
										var movePool = (move.energyGain > 0) ? poke.fastMovePool : poke.chargedMovePool;
										var moveType = (move.energyGain > 0) ? "fast" : "charged";
										var moveIndex = i-1;

										poke.addNewMove(arr[i], movePool, true, moveType, moveIndex);
									}
								}


								var fastMoveId = $(".poke").eq(index).find(".move-select.fast option").eq(parseInt(arr[0])).val();
								poke.selectMove("fast", fastMoveId, 0);

								for(var i = 1; i < arr.length; i++){
									// Don't set this move if already set as a custom move

									if(arr[i].match('([A-Z_]+)')){
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
										pokeSelectors[i].setShields(arr[i]);
									} else if((i == 1)&&(self.battleMode == "multi")){
										multiSelectors[0].setShields(arr[i]);
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
								$(".cup-select option[value=\""+val+"\"][cp=\""+battle.getCP()+"\"]").prop("selected","selected");

								if($(".format-select option[cup=\""+val+"\"]").length > 0){
									$(".format-select option[cup=\""+val+"\"]").prop("selected","selected");
								} else{
									$(".cup-select option[value=\""+val+"\"][cp=\""+battle.getCP()+"\"]").prop("selected","selected");
								}

								$(".cup-select").trigger("change");
								break;

							case "cms":
								var arr = val.split("-");

								$(".charged-count-select option[value=\""+arr[0]+"\"]").prop("selected","selected");
								$(".charged-count-select").trigger("change");

								if(arr.length > 1){
									multiSelectors[0].setBaitSetting(parseInt(arr[1]));

									if(arr[2]){
										$(".poke.multi").eq(0).find(".default-iv-select option[value=\""+arr[2]+"\"]").prop("selected","selected");
										$(".poke.multi").eq(0).find(".default-iv-select").trigger("change");
									}
								}


								break;

							case "g1":
								if(val != "all"){
									multiSelectors[0].selectGroup(val);
								} else{
									multiSelectors[0].setFilterMode(val);
								}
								break;

							case "hp":
								multiBattleSettings.startHp = parseInt(val) / 100;
							break;

							case "energy":
								multiBattleSettings.startEnergy = parseInt(val);
							break;

							case "cooldown":
								multiBattleSettings.startCooldown = parseInt(val);
							break;

							case "stats":
								var arr = val.split(",");
								if(arr.length == 2){
									multiBattleSettings.startStatBuffs = [parseInt(arr[0]), parseInt(arr[1])];
								}
							break;

							case "timing":
								multiBattleSettings.optimizeMoveTiming = parseInt(val) == 1;
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

				if(self.battleMode == "multi"){
					isLoadingPreset = true;
					updateMultiBattleMetas();
					multiSelectors[0].setSettingsFromGet(multiBattleSettings);
				}


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
				self.displayTimeline(battle, false, false, false);
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

				document.title = pokes[0].speciesName + " vs. " + pokes[1].speciesName + " - Battle | PvPoke";

				var url = webRoot+battleStr;

				var data = {cp: cp, p1: pokes[0].speciesId, p2: pokes[1].speciesId, s: pokes[0].startingShields+""+pokes[1].startingShields, m1: moveStrs[0], m2: moveStrs[1], h1: pokes[0].startHp, h2: pokes[1].startHp, e1: pokes[0].startEnergy, e2: pokes[1].startEnergy, sandbox: 1, a: self.generateActionStr() };

				window.history.pushState(data, "Battle", url);
			}

			// Helper function for making sure Multi Battle displays valid metas

			function updateMultiBattleMetas() {
				var cp = parseInt($(".league-select option:selected").val());
				var cupSelect = $(".cup-select");
				// only show groups with same cp as selected. update whenever league changes
				cupSelect.find("option").each(function(index, element) {
					element = $(element);
					// always show open league and custom
					if (element.attr("value") === "all" || element.attr("value") === "custom") {
						element.show();
						return;
					}
					var optionCP = parseInt(element.attr("cp"))
					if (optionCP === cp) {
						element.show();
					} else {
						element.hide();
					}
				});
				// Load default meta group when switching to Multi Battle
				if((self.battleMode == "multi") && (! settingGetParams)){
					cupSelect.trigger("change");
				}
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

				updateMultiBattleMetas();

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
					if(pokeSelectors[0].getPokemon()){
						pokeSelectors[0].setSelectedPokemon(pokeSelectors[0].getPokemon());
					}

					if(pokeSelectors[1].getPokemon()){
						pokeSelectors[1].setSelectedPokemon(pokeSelectors[1].getPokemon());
					}

					document.title = "Battle | PvPoke";
					//$("#favicon").attr("href", webRoot+"img/favicon.png");
				}

				if(self.battleMode == "matrix"){
					$(".poke.multi .custom-options").show();

					window.history.pushState({mode: "matrix"}, "Battle", webRoot + "battle/matrix/");

					// Update document title and favicon
					document.title = "Matrix | PvPoke";
					//$("#favicon").attr("href", webRoot+"img/favicon_matrix.png");
				}

				if(self.battleMode == "multi"){
					document.title = "Multi-Battle | PvPoke";
					//$("#favicon").attr("href", webRoot+"img/favicon_multi_battle.png");
				}

				// Load default meta group when switching to Multi Battle
				if((self.battleMode == "multi") && (! settingGetParams)){
					updateMultiBattleMetas();
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

				// Reset all selectors to 1 shield

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].setShields(1);
				}

				for(var i = 0; i < multiSelectors.length; i++){
					multiSelectors[i].setShields(1);
				}
			}

			// Swap the selected Pokemon between the left and right Pokemon selectors

			function swapSelectedPokemon(e){
				e.preventDefault();

				if(self.battleMode == "single"){
					// Swap individual Pokemon
					var pokemonA = pokeSelectors[0].getPokemon();
					var pokemonB = pokeSelectors[1].getPokemon();

					if(pokemonA && pokemonB){
						pokeSelectors[0].setSelectedPokemon(pokemonB);
						pokeSelectors[1].setSelectedPokemon(pokemonA);
					}
				} else if(self.battleMode == "matrix"){
					var matrixA = multiSelectors[0].getPokemonList();
					var matrixB = multiSelectors[1].getPokemonList();

					multiSelectors[0].setPokemonList(matrixB);
					multiSelectors[1].setPokemonList(matrixA);
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

			function startBattle(doRandomBulk){

				// Hide advanced sections so they don't push the timeline down

				$(".advanced-section").removeClass("active");
				$(".battle-results").hide();
				$(".battle-btn .btn-label").html("Generating...");

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

							if(! doRandomBulk){

								// If no, do a single sim

								// Update PokeSelectors with new battle instance

								for(var i = 0; i < pokeSelectors.length; i++){

									pokeSelectors[i].setBattle(battle);
								}

								battle.setDecisionMethod("default");
								battle.setBuffChanceModifier(-1);
								battle.simulate();
								battle.debug();
								self.displayTimeline(battle, false, false, (settings.animateTimeline !== 0));
							} else{

								// If yes, bulk sim and display median battle
								var simCount = 1000;

								bulkResults = self.generateBulkSims(battle, simCount, doRandomBulk);
								battle = bulkResults.median;
								battle.debug();

								// Update PokeSelectors with new battle instance

								for(var i = 0; i < pokeSelectors.length; i++){
									pokeSelectors[i].setBattle(battle);
								}

								self.displayTimeline(battle, bulkResults.ratings, doRandomBulk, (settings.animateTimeline !== 0));

							}

							self.generateMatchupDetails(battle, bulkResults);
						}

					} else if(self.battleMode == "multi"){
						self.generateMultiBattleResults();
					} else if(self.battleMode == "matrix"){
						self.generateMatrixResults();
					}

					// Scroll to results

					$("html, body").animate({ scrollTop: $(".battle-results."+self.battleMode).offset().top - 185 }, 500);

					$(".battle-btn .btn-label").html("Battle");

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

				pokeSelectors[index].setShields(winner.shields);

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

					$tooltip.find(".details").html(values[0] + " damage");

					// Append damage percentage
					if(values.length > 2){
						$tooltip.find(".details").append(" ("+values[2]+"%)");
					}

					$tooltip.find(".details").append("<br>" + values[1] + " energy");

					for(var i = 3; i < values.length; i++){
						$tooltip.find(".details").append("<br>"+values[i]);
					}
				}

				var width = $tooltip.width();
				var left = (e.pageX - $(".section").first().offset().left) + 25;
				var top = e.pageY - 20;

				if( left > ($(".timeline-container").width() - width - 10) ){
					left -= width + 35;
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

				self.displayTimeline(battle, false, false, false);
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

				var $target = $(e.target).closest(".rating");

				if(animating){
					clearInterval(timelineInterval);

					animating = false;
				}

				var shields = $target.attr("shields").split(",");


				pokeSelectors[0].setShields(shields[1]);
				pokeSelectors[1].setShields(shields[0]);

				startBattle();
			}

			// View best or worst battle from bulk results

			function viewBulkBattle(e){
				e.preventDefault();

				var $target = $(e.target).closest(".rating");

				if($target.hasClass("best")){
					battle = bulkResults.best;
				} else if($target.hasClass("worst")){
					battle = bulkResults.worst;
				} else if($target.hasClass("median")){
					battle = bulkResults.median;
				} else if($target.hasClass("median-win")){
					battle = bulkResults.medianWin;
				} else if($target.hasClass("median-loss")){
					battle = bulkResults.medianLoss;
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

			// Select a move in the breakpoint or bulkpoint dropdown
			function selectBreakpointMove(e){
				var moveId = $(e.target).find("option:selected").val();
				var attacker = pokeSelectors[0].getPokemon();
				var move = attacker.getMoveById(moveId);

				self.displayBreakpoints(move);
			}

			// Select a move in the breakpoint or bulkpoint dropdown
			function selectBulkpointMove(e){
				var moveId = $(e.target).find("option:selected").val();
				var attacker = pokeSelectors[1].getPokemon();
				var move = attacker.getMoveById(moveId);

				self.displayBulkpoints(move);
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

					$(".shield-picker .option.on").trigger("click");

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
