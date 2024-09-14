/*
* Interface functionality for move list and explorer
*/

var BattlerMaster = (function () {
    var instance;

    function createInstance(matchHandler) {


        var object = new interfaceObject(matchHandler);

		function interfaceObject(matchHandler){
			var handler = matchHandler;

			var self = this;
			var gm = GameMaster.getInstance();
			var battle;
			var players;
			var phase;
			var activePokemon = []; // The currently active Pokemon

			var multiSelectors = [];

			// Variables for handling charge up
			var charge = 0;
			var maxCharge = 100;
			var chargeRate = 2;
			var chargeDecayRate = 0;
			var phaseInterval;
			var chargeTime = 6000;
			var switchTime = 13000;
			var phaseTimer = 4000;
			var countdown = 0;
			var charging = false;

			// Helper variables
			var turn = 0;
			var time = 0;
			var properties;
			var battleResult;

			var interfaceLockout = 0; // Prevent clicking the shield or switch options too early
			var listenersInitialized = false; // Prevent event listeners from being added twice

			var priorityAssignment = 1; // Assign priority to a player

			var autotap = false; // Whether or not to automatically register fast moves
			var bufferedSwitch = -1; // If autotap is on, preserve the last input switch and attempt to use until successful

			// Kick off the setup and the battle

			this.init = function(props, b, p){
				properties = props;
				battle = b;
				players = p;
				phase = "countdown";
				turn = 0;
				time = 0;

				// Event listeners
				if(! listenersInitialized){
					$(".battle-window").on("click", battleWindowClick);
					$(".battle-window").on("mousedown touchstart", battleWindowMouseDown);
					$(".battle-window").on("mouseup touchend", battleWindowMouseUp);
					$(".shield-window .close").on("click", closeShieldClick);
					$(".shield-window .shield").on("click", useShieldClick);
					$(".end-screen .replay").on("click", replayBattleClick);
					$(".end-screen .new-match").on("click", newMatchClick);
					$(".end-screen .next-round").on("click", nextRoundClick);
					$(".end-screen a.tab").on("click", tabClick);
					$("body").on("click", ".modal .no", closeModalWindow);
					$("body").on("click", ".modal .restart-confirm .yes", replayBattleClick);
					$("body").on("click", ".modal .quit-confirm .yes", confirmQuitBattle);

					listenersInitialized = true;
				}

				// Close any open modal windows
				closeModalWindow();

				// Alternate CMP
				priorityAssignment = (priorityAssignment == 1) ? 0 : 1;

				for(var i = 0; i < players.length; i++){
					if(i == priorityAssignment){
						players[i].setPriority(1);
					} else{
						players[i].setPriority(0);
					}
				}

				// Turn on autotapping if override set
				if(props.autotapOverride){
					autotap = true;
					$(".controls .auto-tap").addClass("active");
				}

				$(".team-indicator .cmp").hide();
				//$(".team-indicator .cmp").eq(priorityAssignment).show();

				// Set lead pokemon
				battle.setBattleMode("emulate");
				battle.setTurns(1);
				battle.setPlayers(players);
				battle.setNewPokemon(players[0].getTeam()[0], 0, false);
				battle.setNewPokemon(players[1].getTeam()[0], 1, false);
				battle.emulate(self.update);

				// Reset interface for new battle

				$(".controls .button-stack .pause-btn").removeClass("active");
				$(".battle-window .scene .pokemon-container").removeClass("animate-switch");
				$(".battle-window .scene .pokemon-container .messages").html("");
				$(".battle-window .countdown .text").html("");
				$(".battle-window .switch-sidebar").show();
				$(".switch-sidebar").removeClass("active");
				$(".switch-window").removeClass("active");
				$(".switch-window .pokemon, .switch-sidebar .pokemon").show();
				$(".battle-window").attr("mode", props.mode);

				self.updateSwitchWindow();

				$("body").addClass("battle-active");

				// Scroll to the top of the page
				$("html, body").animate({ scrollTop: 0 }, 500);
			};

			// Given an update object, update the battle interface

			this.update = function(response){
				turn = response.turn;
				time += 500;

				// Interpret phase for player

				if(response.phase == "suspend_charged"){
					if(response.actor == 0){
						response.phase = "suspend_charged_attack";
					} else{
						if(response.players[0].getShields() > 0){
							response.phase = "suspend_charged_shield";
						} else{
							response.phase = "suspend_charged_no_shields";
						}

					}
				}

				if(response.phase == "suspend_switch"){
					if(response.actors.indexOf(0) > -1){
						response.phase = "suspend_switch_self";
					}
				}

				// Handle phase change

				if(phase != response.phase){
					// Transition into this phase
					switch(response.phase){
						case "suspend_charged_attack":
							$(".charge-window .move-bars").html('');

							var $moveBar = $(".controls .move-bar").eq(response.move).clone();
							$moveBar.addClass(activePokemon[0].chargedMoves[response.move].type);

							$(".charge-window .move-bars").append($moveBar);
							$(".battle-window .animate-message .text").html("Hold to charge up "+activePokemon[0].chargedMoves[response.move].name+"!");
							$(".switch-sidebar").removeClass("active");

							charge = 0;
							charging = false;
							phaseTimer = chargeTime;
							phaseInterval = setInterval(chargeUpStep, 1000 / 60);

							// Clear a previously buffered switch
							bufferedSwitch = -1;
							break;

						case "suspend_charged_shield":
							$(".shield-window").removeClass("closed");
							$(".switch-sidebar").removeClass("active");
							phaseTimer = chargeTime;
							phaseInterval = setInterval(phaseStep, 1000 / 60);
							interfaceLockout = 750;

							// Clear a previously buffered switch
							bufferedSwitch = -1;
							break;

						case "suspend_charged_no_shields":
							$(".battle-window .animate-message .text").html("No Protect shields remaining");
							$(".switch-sidebar").removeClass("active");
							break;


						case "animating":
							$(".animate-message .text").html(activePokemon[response.actor].speciesName + " used " + response.moveName);

							// If we're transitioning from the Charged Move minigame, submit the damage
							if(phase == "suspend_charged_attack"){
								var chargeMultiplier = Math.min(.25 + (.75 * (charge / maxCharge)), 1);
								battle.setChargeAmount(chargeMultiplier);
							}
							break;

						case "suspend_switch":
							$(".animate-message .text").html("Opponent is selecting a Pokemon");

							// Clear a previously buffered switch
							bufferedSwitch = -1;
							break;

						case "suspend_switch_self":
							phaseTimer = switchTime;
							phaseInterval = setInterval(phaseStep, 1000 / 60);
							interfaceLockout = 750;

							// Clear a previously buffered switch
							bufferedSwitch = -1;
							break;

						case "game_paused":
							$(".battle-window .countdown").removeClass("animate");
							$(".battle-window .countdown .text").html("II");
							break;

						case "game_over":
							battleResult = response.result;

							switch(response.result){
								case "win":
									$(".battle-window .end-screen .result").html("Victory!")
									$(".battle-window .end-screen .subtitle").html("Way to go!")
									break;

								case "loss":
									$(".battle-window .end-screen .result").html("Defeat")
									$(".battle-window .end-screen .subtitle").html("Let's see what we can learn!")
									break;

								case "tie":
									$(".battle-window .end-screen .result").html("Tie")
									$(".battle-window .end-screen .subtitle").html("What? No way!")
									break;
							}

							setTimeout(function(){
								$("body").removeClass("battle-active");
								$(".battle-window").attr("phase","game_over_screen");
								self.displayEndGameStats();
								self.reportBattleAnalytics();
							}, 1000);

							break;
					}

					// Transition out of this phase
					switch(phase){
						case "animating":
							$(".battle-window .pokemon-container .shield-sprite-container").removeClass("active");
							break;
					}
				}

				// Update Pokemon displays
				var playerSwitchOccurred = false;

				for(var i = 0; i < response.pokemon.length; i++){
					var pokemon = response.pokemon[i];

					var $poke = $(".scene .pokemon-container").eq(i);
					var percent = (pokemon.hp / pokemon.stats.hp) * 100;

					$poke.find(".hp .bar").css("width", percent+"%" );
					if(percent <= 25){
						$poke.find(".hp .bar").eq(1).attr("color", "red");
					} else if(percent <= 50){
						$poke.find(".hp .bar").eq(1).attr("color", "yellow");
					} else{
						$poke.find(".hp .bar").eq(1).attr("color", "green");
					}

					var formChanged = response.animations.findIndex(a => a.type == "formchange" && a.actor == i) > -1;

					// If a switch or form change has occured, update the Pokemon display and Charged Move buttons
					if(activePokemon.length < i || activePokemon[i] != pokemon || formChanged){
						$poke.find(".name").html(pokemon.speciesName);
						$poke.find(".name").attr("class", "name " + pokemon.types[0]);
						$poke.attr("cooldown", pokemon.fastMove.cooldown);



						// Show both Pokemon at the start
						if(response.turn == 1){
							$poke.find(".pokemon").attr("type-1", pokemon.types[0]);

							if(pokemon.types[1] != "none"){
								$poke.find(".pokemon").attr("type-2", pokemon.types[1]);
							} else{
								$poke.find(".pokemon").attr("type-2", pokemon.types[0]);
							}
							$poke.find(".pokemon").attr("data-pokemon-id", pokemon.speciesId);
							$(".team-indicator").eq(i).find(".name").html(pokemon.speciesName);
							$(".team-indicator").eq(i).find(".cp").html("CP " + pokemon.cp);
						}

						// Display Pokemon types
						$(".team-indicator").eq(i).find(".types .type").eq(0).attr("class","type " + pokemon.types[0]);
						$(".team-indicator").eq(i).find(".types .type").eq(1).attr("class","type " + pokemon.types[1]);
						$(".team-indicator").eq(i).find(".types .type").eq(0).html(pokemon.types[0].charAt(0));
						$(".team-indicator").eq(i).find(".types .type").eq(1).html(pokemon.types[1].charAt(0));

						if(i == 0){
							$(".move-bar").hide();
							$(".move-labels .label").hide();

							for(var n = 0; n < pokemon.chargedMoves.length; n++){
								var chargedMove = pokemon.chargedMoves[n];
								var $bar = $(".battle-window .move-bar").eq(n);

								$bar.show();
								$(".move-labels .label").eq(n).show();
								$bar.find(".label").html(chargedMove.abbreviation);
								$bar.find(".bar").attr("type",chargedMove.type);
								$bar.find(".bar-back").attr("class","bar-back " + chargedMove.type);
								$(".battle-window .move-labels .label").eq(n).html(chargedMove.name);
							}

							playerSwitchOccurred = true;
						}
					}

					// Update move buttons

					if(i == 0){
						for(var n = 0; n < pokemon.chargedMoves.length; n++){
							var chargedMove = pokemon.chargedMoves[n];
							var $bar = $(".battle-window .move-bar").eq(n);
							var chargePercent = Math.min((pokemon.energy / chargedMove.energy), 1);

							$bar.find(".bar").each(function(index, value){
								var extraEnergy = Math.min(((pokemon.energy - (chargedMove.energy * index)) / chargedMove.energy), 1);

								// This provides extra spacing so the white border doesn't show up at the bottom at 0 charge
								if(extraEnergy <= 0){
									extraEnergy = 0;
								}

								var positionBase = 66;
								if(index > 0){
									positionBase = 68;
								}

								var position = Math.min(66 - (extraEnergy * positionBase), 66);
								$bar.find(".bar").eq(index).css("top", position+"px");
							});

							if(chargePercent >= 1){
								$bar.addClass("active");
								$(".battle-window .move-labels .label").eq(n).addClass("active");
							} else{
								$bar.removeClass("active");
								$(".battle-window .move-labels .label").eq(n).removeClass("active");
							}
						}
					}
				}

				// Update player displays

				for(var i = 0; i < response.players.length; i++){
					var player = response.players[i];

					$(".battle-window .shields").eq(i).html(player.getShields());

					// Display Pokeballs for remaining Pokemon
					var activePokemonCount = 0;
					var team = player.getTeam();
					for(var n = 0; n < team.length; n++){
						if(team[n].hp > 0){
							activePokemonCount++;
						}
					}


					$(".team-indicator").eq(i).find(".ball").addClass("fainted");

					for(var j = 0; j < activePokemonCount; j++){
						if(i == 0){
							$(".team-indicator.left .ball").eq(j).removeClass("fainted");
						} else{
							$(".team-indicator.right .ball").eq(2-j).removeClass("fainted");
						}
					}

					// Update switch timer

					if(i == 0){
						if((player.getSwitchTimer() == 0)&&((phase == "animate")||(phase == "neutral"))){
							$(".battle-window .switch-sidebar").addClass("active");
						} else{
							$(".battle-window .switch-timer").html(Math.floor(player.getSwitchTimer() / 1000));
						}

						if(player.getSwitchTimer() == 0){
							$(".battle-window .switch-timer").css("visibility","hidden");
						} else{
							$(".battle-window .switch-timer").css("visibility","visible");
						}
					}
				}

				activePokemon = [];
				for(var i = 0; i < response.pokemon.length;i++){
					activePokemon.push(response.pokemon[i]);
				}
				phase = response.phase;

				$(".battle-window").attr("phase", phase);

				switch(phase){
					case "countdown":

						if((response.countdown !== undefined)&&(countdown+1 != response.countdown)){
							countdown = response.countdown-1;
							if(countdown == 0){
								countdown = "Go";
							}

							$(".battle-window .countdown").removeClass("animate");
							$(".battle-window .countdown .text").html(countdown);

							setTimeout(function(){
								$(".battle-window .countdown").addClass("animate");
							}, 50);
						}

						break;
				}

				// Update the switch sidebar if the player has switched
				if(playerSwitchOccurred){
					self.updateSwitchWindow();
				}

				// Display messages for this turn

				for(var i = 0; i < response.messages.length; i++){
					var message = response.messages[i];
					var $messageItem = $("<div turn=\""+response.turn+"\">"+message.str+"</div>");
					$(".battle-window .scene .pokemon-container").eq(message.index).find(".messages").append($messageItem);

					// Animate an opponent's shield when they shield
					if((message.index == 1)&&(message.str == "Blocked!")){
						$(".battle-window .pokemon-container.opponent .shield-sprite-container").addClass("active");
					}
				}

				// Clear any messages past the expiry time

				$(".battle-window .messages div").each(function(index, value){
					var messageTurn = parseInt($(this).attr("turn"));
					if(response.turn - messageTurn >= 4){
						$(this).remove();
					}
				});

				// Display any new animations

				for(var i = 0; i < response.animations.length; i++){
					var animation = response.animations[i];
					var fastAnimationOccurred = false;
					var damageAnimationOccurred = false;

					switch(animation.type){
						case "fast":
							fastAnimationOccurred = true;
							$(".battle-window .scene .pokemon-container").eq(animation.actor).find(".fast-move-circle").attr("class", "fast-move-circle " + activePokemon[animation.actor].fastMove.type);
							$(".battle-window .scene .pokemon-container").eq(animation.actor).addClass("animate-fast");
							break;

						case "switch":
							var actor = animation.actor;
							$(".battle-window .scene .pokemon-container").eq(animation.actor).addClass("animate-switch");
							$(".battle-window .scene .pokemon-container").eq(animation.actor).attr("animation-time", time);

							if(actor == 0){
								bufferedSwitch = -1;
							}

							if(animation.value === false){
								var duration = 1000;

								if(phase == "suspend_switch"){

									duration = 0;
								}

								$(".battle-window .scene .pokemon-container").eq(animation.actor).attr("animation-duration", duration);
							}
							break;

						case "damage":
							damageAnimationOccurred = true;
							var effectiveness = "effective";

							if(animation.value > 1){
								effectiveness = "super-effective";
							} else if(animation.value < 1){
								effectiveness = "not-very-effective";
							}

							$(".battle-window .scene .pokemon-container").eq(animation.actor).find(".hp.bar-back").addClass(effectiveness);
							break;
					}

					if(fastAnimationOccurred){
						setTimeout(function(){
							$(".battle-window .scene .pokemon-container").removeClass("animate-fast");
						}, 250);
					}

					if(damageAnimationOccurred){
						setTimeout(function(){
							$(".battle-window .scene .pokemon-container .hp.bar-back").removeClass("effective super-effective not-very-effective");
						}, 250);
					}
				}

				// Update the autotap button and queue an action

				if(autotap){
					$(".controls .auto-tap").addClass("active");
					battle.queueAction(0, "fast", 0);
				} else{
					$(".controls .auto-tap").removeClass("active");
				}

				// Queue a previously entered switch
				if(bufferedSwitch > -1){
					battle.queueAction(0, "switch", bufferedSwitch);
				}

				// Hide the switch button if only one Pokemon remains

				if(players[0].getRemainingPokemon() == 1){
					$(".battle-window .switch-sidebar").hide();
				}

				// Complete any outstanding switch animations
				self.completeSwitchAnimation();
			}


			// Decrement the timer and update UI
			self.updatePhaseTimer = function(){
				// Update timer
				phaseTimer = Math.max(phaseTimer - 1000 / 60, 0);
				interfaceLockout = Math.max(interfaceLockout - 1000 / 60, 0);
				$(".battle-window .timer .text").html(Math.floor(phaseTimer / 1000));

				if(phaseTimer <= 0){
					clearInterval(phaseInterval);
				}
			}

			self.updateSwitchWindow = function(){
				// Update the switch window Pokemon
				var team = players[0].getTeam();
				var index = 0;

				for(var i = 0; i < team.length; i++){
					if(team[i] != activePokemon[0]){
						var $targetContainers = [$(".switch-sidebar"), $(".switch-window")];

						for(var n = 0; n < $targetContainers.length; n++){
							$targetContainers[n].find(".pokemon").eq(index).find(".cp").html(team[i].cp);
							$targetContainers[n].find(".pokemon").eq(index).find(".name").html(team[i].speciesName);
							$targetContainers[n].find(".pokemon").eq(index).attr("index", i);
							$targetContainers[n].find(".pokemon").eq(index).attr("type-1", team[i].types[0]);


							var health = ((team[i].hp / team[i].stats.hp) * 100);

							$targetContainers[n].find(".pokemon").eq(index).find(".health").css("width", (.75 * health) + "%");

							if(health >= 50){
								$targetContainers[n].find(".pokemon").eq(index).find(".health").attr("color", "green");
							} else if(health >= 25){
								$targetContainers[n].find(".pokemon").eq(index).find(".health").attr("color", "yellow");
							} else{
								$targetContainers[n].find(".pokemon").eq(index).find(".health").attr("color", "red");
							}

							if(team[i].types[1] == "none"){
								$targetContainers[n].find(".pokemon").eq(index).attr("type-2", team[i].types[0]);
							} else{
								$targetContainers[n].find(".pokemon").eq(index).attr("type-2", team[i].types[1]);
							}

							if(team[i].hp > 0){
								$targetContainers[n].find(".pokemon").eq(index).addClass("active");
							} else{
								$targetContainers[n].find(".pokemon").eq(index).removeClass("active");
							}

							if(team[i].hp > 0){
								$targetContainers[n].find(".pokemon").eq(index).show();
							} else{
								$targetContainers[n].find(".pokemon").eq(index).hide();
							}
						}


						index++;
					}
				}
			}

			// When a switch animation has completed, fill in the updated sprite

			self.completeSwitchAnimation = function(){

				$(".battle-window .pokemon-container.animate-switch").each(function(index, value){
					var timePassed = time - parseInt($(this).attr("animation-time"));
					var index = ($(this).hasClass("opponent")) ? 1 : 0;

					if( (timePassed >= parseInt($(this).attr("animation-duration")))&&(activePokemon[index].hp > 0)){
						$(this).removeClass("animate-switch");
						$(this).find(".pokemon").attr("type-1", activePokemon[index].types[0]);
						$(this).eq(index).find(".name").attr("class", "name " + activePokemon[index].types[0]);

						$(".team-indicator").eq(index).find(".name").html(activePokemon[index].speciesName);
						$(".team-indicator").eq(index).find(".cp").html("CP " + activePokemon[index].cp);

						if(activePokemon[index].types[1] != "none"){
							$(this).find(".pokemon").attr("type-2", activePokemon[index].types[1]);
						} else{
							$(this).find(".pokemon").attr("type-2", activePokemon[index].types[0]);
						}
					}
				});

			}

			// At the end of the game, show relevant battle stats

			self.displayEndGameStats = function(){

				var maxScore = 400;
				var totalDamage = 0;
				var totalDamageBlocked = 0;
				var totalEnergyGained = 0;
				var totalEnergyUsed = 0;
				var totalEnergyLost = 0;
				var totalChargedDamage = 0;

				// Display damage stats

				for(var k = 0; k < players.length; k++){
					var team = players[k].getTeam();

					for(var i = 0; i < team.length; i++){
						var pokemon = team[i];
						var width = (pokemon.battleStats.damage / maxScore) * 100;

						if(k == 0){
							totalDamage += pokemon.battleStats.damage;
							totalDamageBlocked += pokemon.battleStats.damageBlocked;
							totalEnergyGained += pokemon.battleStats.energyGained;
							totalEnergyUsed += pokemon.battleStats.energyUsed;
							totalChargedDamage += pokemon.battleStats.chargedDamage;

							if(pokemon.hp <= 0){
								totalEnergyLost += pokemon.energy;
							}
						}

						$(".battle-stats .damage-section").eq(k).find(".pokemon-entry .name").eq(i).html(pokemon.speciesName);
						$(".battle-stats .damage-section").eq(k).find(".pokemon-entry .damage-bar").eq(i).css("width", width+"%");
						$(".battle-stats .damage-section").eq(k).find(".pokemon-entry").eq(i).find(".shield-bar").css("width", "0");
						for(var n = 0; n < pokemon.battleStats.shieldsBurned; n++){
							$(".battle-stats .damage-section").eq(k).find(".pokemon-entry").eq(i).find(".shield-bar").eq(n).css("width", ((50/maxScore) * 100)+"%");
						}
					}
				}

				totalDamage = Math.round(totalDamage);

				// Display shield stats

				var team = players[0].getTeam();
				var damageFromShields = 0;
				var shieldsFromShields = 0;
				var shieldsUsed = 2 - players[0].getShields();

				for(var i = 0; i < team.length; i++){
					var pokemon = team[i];

					damageFromShields += Math.round(pokemon.battleStats.damageFromShields);
					shieldsFromShields += pokemon.battleStats.shieldsFromShields;
				}

				$(".battle-stats .tab-section.shields .stat-shields-used").html(shieldsUsed);
				$(".battle-stats .tab-section.shields .stat-damage-dealt").html((Math.round( (damageFromShields / totalDamage) * 1000) / 10)+"%");
				$(".battle-stats .tab-section.shields .stat-shields-drawn").html(shieldsFromShields);
				$(".battle-stats .tab-section.shields .stat-damage-blocked").html(totalDamageBlocked);

				// Display energy stats

				$(".battle-stats .tab-section.energy .stat-energy-gained").html(totalEnergyGained);
				$(".battle-stats .tab-section.energy .stat-energy-used").html(totalEnergyUsed);
				$(".battle-stats .tab-section.energy .stat-energy-lost").html(totalEnergyLost);
				$(".battle-stats .tab-section.energy .stat-avg-dpe").html(Math.round( (totalChargedDamage / totalEnergyUsed) * 100) / 100);

				// Display AI difficulty
				var opponentName = players[1].getAI().difficultyToString();
				if(properties.featuredTeam !== null){
					opponentName = properties.featuredTeam.name;
				}
				$(".end-screen .difficulty-name").html(opponentName);

				// Reset tabs

				$(".end-screen a.tab").removeClass("active");
				$(".end-screen .tab-section").hide();
				$(".end-screen a.tab").eq(0).addClass("active");
				$(".end-screen .tab-section").eq(0).show();
			}

			// Report battle results to Google Analytics

			this.reportBattleAnalytics = function(result){

				var battleSummaryStr = battle.getCup().name + " " + battle.getCP() + " difficulty " + (players[1].getAI().getLevel()+1);

				// Report the overall battle result

				if(properties.featuredTeam !== null){
					gtag('event', 'Training Battle', {
					  'summary' : battleSummaryStr,
					  'result' : battleResult,
					  'featured_team': properties.featuredTeam.slug
					});
				} else{
					gtag('event', 'Training Battle', {
					  'summary' : battleSummaryStr,
  					  'result' : battleResult
					});
				}


				// Gather team and Pokemon data
				var teamStrs = [];
				var teamScores = [];

				var pokeObjs = [];
				var teamObjs = [];
				var cup = battle.getCup();
				var eligiblePokemon = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude);
				var teamsValid = true;

				for(var i = 0; i < players.length; i++){
					var team = players[i].getTeam();
					var teamStr = '';
					var backupPokeStrs = [];
					var playerType = 0;
					var teamScore = 0;

					if(i == 1){
						playerType = players[i].getAI().getLevel()+1;
					}

					for(var n = 0; n < team.length; n++){
						var pokemon = team[n];
						var pokeStr = pokemon.canonicalId + ' ' + pokemon.fastMove.abbreviation;
						var chargedMoveAbbrevations = [];

						for(var k = 0; k < pokemon.chargedMoves.length; k++){
							chargedMoveAbbrevations.push(pokemon.chargedMoves[k].abbreviation);
						}

						// Sort alphabetically
						chargedMoveAbbrevations.sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0));

						for(var k = 0; k < chargedMoveAbbrevations.length; k++){
							pokeStr += "/" + chargedMoveAbbrevations[k];
						}

						// Add to team string
						if(n == 0){
							teamStr += pokeStr;
						} else{
							backupPokeStrs.push(pokeStr);
						}

						// Assign this Pokemon's score in battle, damage done plus shields broken
						var shieldValue = 50;

						if((battle.getCP() == 2500)||(battle.getCP() == 10000)){
							shieldValue = 40;
						}

						pokemon.battleStats.score = Math.round(pokemon.battleStats.damage + (shieldValue * pokemon.battleStats.shieldsBurned));
						teamScore += pokemon.battleStats.score;
					}

					// Alphabetize the last two Pokemon on the team and build the team string
					backupPokeStrs.sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0));

					for(var n = 0; n < backupPokeStrs.length; n++){
						teamStr += "|" + backupPokeStrs[n];
					}

					teamStrs.push(teamStr);
					teamScores.push(teamScore);
				}

				// Report each team
				for(var i = 0; i < players.length; i++){
					var team = players[i].getTeam();
					var score = teamScores[i];
					var opponentIndex = (i == 0) ? 1 : 0;
					var opponentScore = teamScores[opponentIndex];
					var maxScore = Math.max(teamScores[0], teamScores[1]);
					var playerType = 0;
					if(i == 1){
						playerType = players[i].getAI().getLevel()+1;
					}

					// Check that all members of all teams are valid in the format
					var teamValid = true;

					for(var n = 0; n < team.length; n++){
						var found = false;

						for(var k = 0; k < eligiblePokemon.length; k++){
							if(eligiblePokemon[k].speciesId == team[n].speciesId){
								console.log(team[n].speciesId + " is eligible " + eligiblePokemon[k].speciesId);
								found = true;
							}
						}

						if(! found){
							teamsValid = false;
						}
					}

					var battleRating = Math.floor( (500 * ((maxScore - opponentScore) / maxScore)) + (500 * (score / maxScore)))

					// Report team stats

					gtag('event', 'Training Team', {
					  'summary' : battleSummaryStr,
					  'team' : teamStrs[i],
					  'value' : battleRating,
					  'player_type': playerType,
					});

					teamObjs.push({
						teamStr: teamStrs[i],
						format: battle.getCup().name + " " + battle.getCP(),
						playerType: playerType,
						teamScore: battleRating
					});

					console.log(teamStrs[i]);

					// Organize rosteer to report teams of 6

					var roster = players[i].getRoster();
					var pokeStrArr = [];

					for(var n = 0; n < roster.length; n++){
						var pokemon = roster[n];
						var pokeStr = pokemon.canonicalId + ' ' + pokemon.fastMove.abbreviation;
						var chargedMoveAbbrevations = [];

						for(var k = 0; k < pokemon.chargedMoves.length; k++){
							chargedMoveAbbrevations.push(pokemon.chargedMoves[k].abbreviation);
						}

						// Sort alphabetically
						chargedMoveAbbrevations.sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0));

						for(var k = 0; k < chargedMoveAbbrevations.length; k++){
							if(k == 0){
								pokeStr += "+" + chargedMoveAbbrevations[k];
							} else{
								pokeStr += "/" + chargedMoveAbbrevations[k];
							}
						}

						if(properties.mode == "tournament"){
							gtag('event', 'Training Roster Pokemon', {
								  'summary' : battleSummaryStr,
								  'speciesId' : pokemon.canonicalId,
								  'value' : battleRating,
								  'player_type': playerType
								});


							battleSummaryStr
						}

						pokeStrArr.push(pokeStr);
					}

					// Alphabetize the roster names
					pokeStrArr.sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0));

					var rosterStr = pokeStrArr.join(" ");

					// Report roster stats

					gtag('event', 'Training Roster', {
					  'summary' : battleSummaryStr,
					  'roster' : rosterStr,
					  'value' : battleRating,
					  'player_type': playerType,
					});

					for(var n = 0; n < team.length; n++){
						var pokemon = team[n];
						var pokeStr = pokemon.canonicalId + ' ' + pokemon.fastMove.abbreviation;
						var chargedMoveAbbrevations = [];

						for(var k = 0; k < pokemon.chargedMoves.length; k++){
							chargedMoveAbbrevations.push(pokemon.chargedMoves[k].abbreviation);
						}

						// Sort alphabetically
						chargedMoveAbbrevations.sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0));

						for(var k = 0; k < chargedMoveAbbrevations.length; k++){
							if(k == 0){
								pokeStr += "+" + chargedMoveAbbrevations[k];
							} else{
								pokeStr += "/" + chargedMoveAbbrevations[k];
							}
						}

						// Add to list of individual Pokemon db objects
						pokeObjs.push({
							pokemonId: pokeStr,
							format: battle.getCup().name + " " + battle.getCP(),
							teamPosition: n+1,
							playerType: playerType,
							teamScore: battleRating,
							individualScore: pokemon.battleStats.score,
							shields: pokemon.battleStats.shieldsUsed
						});

						gtag('event', 'Training Pokemon', {
						  'summary' : battleSummaryStr,
						  'pokemon' : pokeStr,
						  'value' : pokemon.battleStats.score+'',
						  'player_type': playerType,
						  'team_position': n+1,
						  'team_rating': battleRating
						});

					}
				}

				// Report final individual and team data to db

				if(teamsValid && players[1].getAI().getLevel()+1 >= 3){
					$.ajax({
				        url: "../data/training/postTraining.php",
				        method: "POST",
				        data: {
				            pokemon: pokeObjs,
							teams: teamObjs
				        },
				        success: function(response) {
							if(! response.result && response.error){
								console.error(response.error);
							}
				        },
				        error: function(error) {
				            console.log(error);
				        }
				    });
				}
			}

			// Handler for the charge up interval

			function chargeUpStep(){
				// Lock charge at 100 once user reaches 100

				if(charging){
					charge = Math.min(charge + chargeRate, maxCharge);
				}

				// Update rings
				var percent = (charge / maxCharge) * 100;
				var displayPercent = Math.round(25 + ((charge / maxCharge) * 75));

				$(".battle-window .charge-window .ring").css("width", percent + "%");
				$(".battle-window .charge-window .ring").css("height", percent + "%");
				$(".battle-window .charge-window .charge").html(displayPercent + "%");

				self.updatePhaseTimer();
			}

			// Click handler for sending input to the Battle object

			function battleWindowClick(e){
				if(interfaceLockout > 0){
					return false;
				}

				// Press one of the side button controls

				if($(".battle-window .controls .button-stack:hover").length > 0){

					// Pause or resume the game
					if($(".controls .button-stack .pause-btn:hover").length > 0){
						$(".controls .button-stack .pause-btn").toggleClass("active");
						battle.setPause($(".controls .button-stack .pause-btn").hasClass("active"));
					}

					// Open the restart confirm dialogue
					if($(".controls .button-stack .restart-btn:hover").length > 0){
						// Pause the game
						$(".controls .button-stack .pause-btn").addClass("active");
						battle.setPause(true);

						modalWindow("Restart Match", $(".restart-confirm"));
					}

					// Open the quit confirm dialogue
					if($(".controls .button-stack .quit-btn:hover").length > 0){
						// Pause the game
						$(".controls .button-stack .pause-btn").addClass("active");
						battle.setPause(true);

						modalWindow("Quit Match", $(".quit-confirm"));
					}

					return;
				}

				// Queue a switch
				if($(".switch-window .pokemon.active:hover, .switch-sidebar .pokemon.active:hover").length > 0){
					var $target = $(e.target);

					if(! $target.hasClass("pokemon")){
						$target = $(e.target).closest(".pokemon");
					}

					var index = parseInt($target.attr("index"));

					if((phase != "neutral")||$(".switch-sidebar").hasClass("active")){
						battle.queueAction(0, "switch", index);
						bufferedSwitch = index;

						$(".switch-window, .switch-sidebar").removeClass("active");

						if(phase == "suspend_switch_self"){
							clearInterval(phaseInterval);
						}
					} else{
						battle.queueAction(0, "fast", 0);
					}

					return;
				}

				// Turn autotap on or off
				if($(".controls .auto-tap:hover").length > 0){
					autotap = (! autotap);


					if(autotap){
						$(".controls .auto-tap").addClass("active");
						// Queue a fast move
						battle.queueAction(0, "fast", 0);
					} else{
						$(".controls .auto-tap").removeClass("active");
					}
					return;
				}


				if(($(".battle-window .controls .move-bar.active:hover").length == 0)&&($(".battle-window .switch-window:hover").length == 0)){
					// Fast move
					battle.queueAction(0, "fast", 0);
				} else{
					// Charged move
					var $target = $(e.target);

					if(! $target.hasClass("move-bar")){
						$target = $(e.target).closest(".move-bar");
					}

					var index = $(".battle-window .controls .move-bar").index($target); // Getting the index of the move
					if((index >= 0)&&(index < activePokemon[0].chargedMoves.length)){
						battle.queueAction(0, "charged", index);
					}
				}
			}

			// Handler for clicking down or tapping

			function battleWindowMouseDown(e){
				if(phase == "suspend_charged_attack"){
					e.preventDefault();
					charging = true;
				}
			}

			// Handler for clicking down or tapping

			function battleWindowMouseUp(e){
				if(phase == "suspend_charged_attack"){
					e.preventDefault();
					charging = false;
				}
			}

			// Close the shield window

			function closeShieldClick(){
				if(interfaceLockout == 0){
					$(".battle-window .shield-window").addClass("closed");
				}
			}

			// Use a shield

			function useShieldClick(){
				if(interfaceLockout == 0){
					$(".battle-window .shield-window").addClass("closed");
					$(".battle-window .pokemon-container.self .shield-sprite-container").addClass("active");
					battle.setPlayerUseShield(true);
				}
			}

			// At the end of a 3v3 match, replay the same battle

			function replayBattleClick(e){
				// Stop the current battle
				battle.stop();

				// Manually set the previous team
				if(properties.mode == "single"){
					properties.teamSelectMethod = "manual";
					properties.teams[1] = players[1].getTeam();
					handler.initBattle(properties);
				} else if(properties.mode == "tournament"){
					handler.startTournamentBattle(players[0].getTeam(), properties, players[1].getTeam());
				}

			}

			// Go back to the settings page

			function newMatchClick(e){
				handler.returnToSetup();
			}

			// User has confirmed they want to quit the battle
			function confirmQuitBattle(e){
				battle.stop();
				closeModalWindow();

				if(properties.mode == "single"){
					handler.returnToSetup();
				} else if(properties.mode == "tournament"){
					handler.nextTournamentRoundSetup("tie");
				}
			}

			// Go back to team select for a new round

			function nextRoundClick(e){
				handler.nextTournamentRoundSetup(battleResult);
			}

			// Select a new tab on the end screen

			function tabClick(e){
				e.preventDefault();

				$(".end-screen a.tab").removeClass("active");
				$(".end-screen .tab-section").hide();
				$(e.target).addClass("active");
				$(".end-screen .tab-section."+$(e.target).attr("href")).show();

			}

			// Handler for the the use shield timer

			function phaseStep(){
				self.updatePhaseTimer();
			}
		}

        return object;
    }

    return {
        getInstance: function (matchHandler) {
            if (!instance) {
                instance = createInstance(matchHandler);
            }
            return instance;
        }
    };
})();
