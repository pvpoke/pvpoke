// JavaScript Document

var InterfaceMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new interfaceObject();
		
		function interfaceObject(){
				
			var battle;
			var pokeSelectors = [];
			var animating = false;
			var self = this;
			
			var time = 0;
			var timelineInterval;
			
			var histogram;
			
			this.context = "battle";
			this.battleMode = "single";
			
			var ranker = RankerMaster.getInstance();
			ranker.context = this.context;

			this.init = function(){

				var data = GameMaster.getInstance().data;
				
				// Initialize selectors and push Pokemon data

				$(".poke-select-container .poke.single").each(function(index, value){
					var selector = new PokeSelect($(this), index);
					pokeSelectors.push(selector);

					selector.init(data.pokemon);
				});
				
				$(".league-select").on("change", selectLeague);
				$(".mode-select").on("change", selectMode);
				$(".battle-btn").on("click", startBattle);
				$(".timeline-container").on("mousemove",".item",timelineEventHover);
				$("body").on("mousemove",mainMouseMove);
				$("body").on("mousedown",mainMouseMove);
				
				// Timeline playback
				
				$(".playback .play").click(timelinePlay);
				$(".playback .replay").click(timelineReplay);
				$(".playback-speed").change(timelineSpeedChange);
				
				// Details battle viewing
				
				$("body").on("click", "a.rating.star", viewShieldBattle);
				
				battle = BattleMaster.getInstance();
				
				// If get data exists, load settings

				this.loadGetData();
				
				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});

			};
			
			// Display HP gven a point in a timeline
			
			this.displayCumulativeDamage = function(timeline, time){
				var cumulativeDamage = [0,0];
				var cumulativeEnergy = [0,0];
				
				for(var i = 0; i < timeline.length; i++){
					var event = timeline[i];
					if(event.time <= time){
						$(".timeline .item[index="+i+"]").addClass("active");

						if((event.type.indexOf("fast") >= 0) || (event.type.indexOf("charged") >= 0)){
							if(event.actor == 0){
								cumulativeDamage[1] += event.values[0];
								cumulativeEnergy[0] += event.values[1];
							} else{
								cumulativeDamage[0] += event.values[0];
								cumulativeEnergy[1] += event.values[1];
							}
						}
					}
				}
				
				for(var n = 0; n < pokeSelectors.length; n++){
					pokeSelectors[n].animateHealth(cumulativeDamage[n]);
					
					for(i = 0; i < pokeSelectors[n].getPokemon().chargedMoves.length; i++){
						pokeSelectors[n].animateEnergy(i, cumulativeEnergy[n]);
					}
					
				}
				
				var left = ((time+1000) / (battle.getDuration()+2000) * 100)+"%";
				$(".timeline-container .tracker").css("left", left);
			}
			
			// Display battle timeline
			
			this.displayTimeline = function(b){
				
				var timeline = b.getTimeline();
				var duration = b.getDuration()+1000;
				
				$(".battle-results.single").show();
				$(".timeline").html('');
				
				for(var i = 0; i < timeline.length; i++){
					var event = timeline[i];
					var position = ((event.time+1000) / (duration+1000) * 100)+"%";
					
					var $item = $("<div class=\"item-container\"><div class=\"item "+event.type+"\" index=\""+i+"\" name=\""+event.name+"\" values=\""+event.values.join(',')+"\"></div></div>");
					$item.css("left", position);
					
					if(event.type.indexOf("tap") > -1){
						var height = 2 + (2 * event.values[0]);
						$item.find(".item").css("height", height+"px");
						$item.find(".item").css("top", -(height/2)+"px");
					}
					
					$(".timeline").eq(event.actor).append($item);
				}
				
				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].update();
				}
				
				// Show battle summary text
				
				var winner = b.getWinner();
				var durationSeconds = Math.floor(duration / 100) / 10;

				if(winner){
					var winnerRating = winner.getBattleRating();
					$(".battle-results .summary").html("<span class=\"name\">"+winner.speciesName+"</span> wins in <span class=\"time\">"+durationSeconds+"s</span> with a battle rating of <span class=\"rating star\">"+winnerRating+"</span>");
					
					var color = battle.getRatingColor(winnerRating);
					$(".battle-results .summary .rating").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
				} else{
					$(".battle-results .summary").html("Simultaneous knockout in <span class=\"time\">"+durationSeconds+"s</span>");
				}
				
				// Animate timelines

				$(".timeline .item").removeClass("active");
				
				var intMs = Math.floor(duration / 62);
				
				self.animateTimeline(-intMs * 15, intMs);
				
				// Generate and display share link
				
				var cp = b.getCP();
				var pokes = b.getPokemon();
				
				var moveStrs = [];
				
				for(var i = 0; i < pokes.length; i++){
					moveStrs.push(generateURLMoveStr(pokes[i]));
				}
				
				var battleStr = "battle/"+cp+"/"+pokes[0].speciesId+"/"+pokes[1].speciesId+"/"+pokes[0].startingShields+pokes[1].startingShields+"/"+moveStrs[0]+"/"+moveStrs[1]+"/";
				
				// Append extra options
				
				if( (pokes[0].startHp != pokes[0].stats.hp) || (pokes[1].startHp != pokes[1].stats.hp) || (pokes[0].startEnergy != 0) || (pokes[1].startEnergy != 0) ){
					battleStr += pokes[0].startHp + "-" + pokes[1].startHp + "/" + pokes[0].startEnergy + "-" + pokes[1].startEnergy + "/";
				}
				
				var link = host + battleStr;
				
				$(".share-link input").val(link);
				
				// Push state to browser history so it can be navigated, only if not from URL parameters
				
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
			
			this.generateMatchupDetails = function(battle){
				
				// Run simulations for every shield matchup
				
				var pokemon = [];
				
				for(var i = 0; i < pokeSelectors.length; i++){
					pokemon.push(pokeSelectors[i].getPokemon());
				}
				
				$(".battle-details .name-1").html(pokemon[0].speciesName);
				$(".rating-table .name-1.name").html(pokemon[0].speciesName.charAt(0)+".");
				$(".battle-details .name-2").html(pokemon[1].speciesName);
				
				for(var i = 0; i < 3; i++){
					
					for(var n = 0; n < 3; n++){
						
						pokemon[0].setShields(n);
						pokemon[1].setShields(i);
						
						battle.simulate();
						
						var rating = pokemon[0].getBattleRating();
						var color = battle.getRatingColor(rating);
						
						$(".rating-table .battle-"+i+"-"+n).html(rating);
						$(".rating-table .battle-"+i+"-"+n).css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
						
						if(rating > 500){
							$(".rating-table .battle-"+i+"-"+n).addClass("win");
						} else{
							$(".rating-table .battle-"+i+"-"+n).removeClass("win");
						}
					}
				}
				
				// Simulate original battle so duration and timeline data is preserved
				
				$(".shield-select").trigger("change");
				battle.simulate();
				
				// Calculate stats
				
				// Battle Rating
				
				for(var i = 0; i < 2; i++){
					
					rating = pokemon[i].getBattleRating();
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
					
					$(".stats-table .stat-energy-remaining").eq(i).html(pokemon[i].energy);
					
					if(turnsToChargedMove[i] > 0){
						$(".stats-table .stat-charged-time").eq(i).html(turnsToChargedMove[i]+" ("+(turnsToChargedMove[i]*.5)+"s)");
					}
				}
				
			}
			
			// Process selected Pokemon through the team ranker
			
			this.generateMultiBattleResults = function(){
				
				// Set settings

				var cup = $(".cup-select option:selected").val();
				var opponentShields = parseInt($(".poke.multi .shield-select option:selected").val());
				var chargedMoveCount = parseInt($(".poke.multi .charged-count-select option:selected").val());

				battle.setCup(cup);
				ranker.setShields(opponentShields);
				ranker.setChargedMoveCount(chargedMoveCount);
				
				var team = [];
				var poke = pokeSelectors[0].getPokemon();
				
				if(poke){
					team.push(poke);
				} else{
					return;
				}
				
				// Run battles through the ranker
				
				var data = ranker.rank(team, battle.getCP());
				var rankings = data.rankings;
				var shieldStr = poke.startingShields + "" + opponentShields;
				var moveStr = generateURLMoveStr(poke);
				
				$(".rankings-container").html('');
				
				battle.setNewPokemon(poke, 0, false);
				
				for(var i = 0; i < rankings.length; i++){
					var r = rankings[i];
					
					var pokemon = new Pokemon(r.speciesId);
					
					// Generate moves for link
					
					battle.setNewPokemon(pokemon, 1, true);
					pokemon.autoSelectMoves(chargedMoveCount);
					
					var opMoveStr = generateURLMoveStr(pokemon);
					
					var battleLink = host+"battle/"+battle.getCP()+"/"+poke.speciesId+"/"+r.speciesId+"/"+shieldStr+"/"+moveStr+"/"+opMoveStr+"/";
					
					// Append extra options

					if( (poke.startHp != poke.stats.hp) || (poke.startEnergy != 0) ){
						battleLink += poke.startHp +  "/" + poke.startEnergy + "/";
					}
					
					var $el = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\"><div class=\"name-container\"><span class=\"number\">#"+(i+1)+"</span><span class=\"name\">"+pokemon.speciesName+"</span></div><div class=\"rating-container\"><div class=\"rating star\">"+r.opRating+"</span></div><a target=\"_blank\" href=\""+battleLink+"\"></a><div class=\"clear\"></div></div><div class=\"details\"></div>");

					$(".rankings-container").append($el);
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
				
				var cp = battle.getCP();
				var battleStr = "battle/multi/"+cp+"/"+cup+"/"+poke.speciesId+"/"+poke.startingShields+opponentShields+"/"+moveStr+"/"+chargedMoveCount+"/";
				
				// Append extra options
				
				if( (poke.startHp != poke.stats.hp) || (poke.startEnergy != 0) ){
					battleStr += poke.startHp +  "/" + poke.startEnergy + "/";
				}
				
				
				var link = host + battleStr;
				
				$(".share-link input").val(link);
				
				// Push state to browser history so it can be navigated, only if not from URL parameters
				
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
			
			// Given JSON of get parameters, load these settings
			
			this.loadGetData = function(){
				
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
				
								// Auto select moves for both Pokemon

								for(var i = 0; i < pokeSelectors.length; i++){
									pokeSelectors[i].getPokemon().autoSelectMoves();
								}
								break;
								
							case "cp":
								$(".league-select option[value=\""+val+"\"]").prop("selected","selected");
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

								console.log(arr);
								
								var fastMoveId = $(".poke").eq(index).find(".move-select.fast option").eq(parseInt(arr[0])).val();
								poke.selectMove("fast", fastMoveId, 0);
								
								for(var i = 1; i < arr.length; i++){
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
																
								
							case "mode":
								$(".mode-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".mode-select").trigger("change");
								break;
								
							case "cup":
								$(".cup-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".cup-select").trigger("change");
								break;
								
							case "cms":
								$(".charged-count-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".charged-count-select").trigger("change");
								break;
								
						}
					}
					
				}
				
				// Update both Pokemon selectors

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].update();
				}
					
				// Auto run the battle

				$(".battle-btn").trigger("click");
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
			
			// Event handler for changing the battle mode
			
			function selectMode(e){
				self.battleMode = $(e.target).find("option:selected").val();
				
				$("p.description").hide();
				$("p."+self.battleMode).show();
				
				$(".poke-select-container").removeClass("single multi");
				$(".poke-select-container").addClass(self.battleMode);
				
				if(self.battleMode == "single"){
					pokeSelectors[0].setPokemon(pokeSelectors[0].getPokemon().speciesId);
					pokeSelectors[1].setPokemon(pokeSelectors[1].getPokemon().speciesId);
				}
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
							battle.simulate();
							battle.debug();
							self.displayTimeline(battle);
							self.generateMatchupDetails(battle);
						}

					} else if(self.battleMode == "multi"){					
						self.generateMultiBattleResults();
					}

					// Scroll to results

					$("html, body").animate({ scrollTop: $(".battle-results."+self.battleMode).offset().top - 185 }, 500);
					
					$(".battle-btn").html("Battle");
					
				}, 10);
			}
			
			// Event handler for timeline hover and click
			
			function timelineEventHover(e){
				
				if($(this).hasClass("tap")){
					return;
				}
				
				var $tooltip = $(".tooltip");
				
				$tooltip.show();
				
				$tooltip.attr("class","tooltip");
				$tooltip.find(".name").html($(this).attr("name"));
				$tooltip.addClass($(this).attr("class"));
				$tooltip.find(".details").html('');
			
				if(($(this).hasClass("fast")) || ($(this).hasClass("charged"))){
					
					var values = $(this).attr("values").split(',');
					
					$tooltip.find(".details").html(values[0] + " damage<br>" + values[1] + " energy");
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
			
			// Process tooltips and timeline hover
			
			function mainMouseMove(e){
				if($(".timeline .item:hover").length == 0){
					$(".tooltip").hide();
				}
				
				if(($(".timeline-container:hover").length > 0)&&(! animating)){
					var offsetX = ($(window).width() - $(".timeline-container").width()) / 2;
					var posX = e.clientX - offsetX;
					var hoverTime = ((battle.getDuration()+2000) * (posX / $(".timeline-container").width()))-1000;
					
					time = hoverTime;
					
					self.displayCumulativeDamage(battle.getTimeline(), time);
				}
			}
			
			// View a new battle after clicking one of the related battle ratings
			
			function viewShieldBattle(e){
				e.preventDefault();
				
				var shields = $(e.target).attr("shields").split(",");

				$(".shield-select").eq(0).find("option[value=\""+shields[1]+"\"]").prop("selected", "selected");
				$(".shield-select").eq(0).trigger("change");
				$(".shield-select").eq(1).find("option[value=\""+shields[0]+"\"]").prop("selected", "selected");
				$(".shield-select").eq(1).trigger("change");
				
				startBattle();
			}
			
			// Given a Pokemon output a string of numbers for URL building
			
			function generateURLMoveStr(pokemon){
				var moveStr = '';

				var fastMoveIndex = pokemon.fastMovePool.indexOf(pokemon.fastMove);
				var chargedMove1Index = pokemon.chargedMovePool.indexOf(pokemon.chargedMoves[0])+1;
				var chargedMove2Index = pokemon.chargedMovePool.indexOf(pokemon.chargedMoves[1])+1;
					
				moveStr = fastMoveIndex + "-" + chargedMove1Index + "-" + chargedMove2Index;
				
				return moveStr;
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