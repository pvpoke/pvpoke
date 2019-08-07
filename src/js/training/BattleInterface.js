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
			var chargeRate = 20;
			var chargeDecayRate = 0.5;
			var phaseInterval;
			var chargeTime = 6000;
			var switchTime = 13000;
			var phaseTimer = 4000;
			var countdown = 0;

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

				$(".team-indicator .cmp").hide();
				$(".team-indicator .cmp").eq(priorityAssignment).show();

				// Set lead pokemon
				battle.setBattleMode("emulate");
				battle.setTurns(1);
				battle.setPlayers(players);
				battle.setNewPokemon(players[0].getTeam()[0], 0, false);
				battle.setNewPokemon(players[1].getTeam()[0], 1, false);
				battle.emulate(self.update);

				// Reset interface for new battle

				$(".battle-window .switch-btn").removeClass("active");
				$(".controls .button-stack .pause-btn").removeClass("active");
				$(".battle-window .scene .pokemon-container").removeClass("animate-switch");
				$(".battle-window .scene .pokemon-container .messages").html("");
				$(".battle-window .countdown .text").html("");
				$(".battle-window .switch-btn").show();
				$(".switch-window").removeClass("active")
				$(".battle-window").attr("mode", props.mode);

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
							$(".charge-window .move-bars").append($(".controls .move-bar").eq(response.move).clone());
							$(".battle-window .animate-message .text").html("Tap to charge up "+activePokemon[0].chargedMoves[response.move].name+"!");
							$(".switch-window").removeClass("active");

							charge = 0;
							phaseTimer = chargeTime;
							phaseInterval = setInterval(chargeUpStep, 1000 / 60);
							break;

						case "suspend_charged_shield":
							$(".shield-window").removeClass("closed");
							phaseTimer = chargeTime;
							phaseInterval = setInterval(phaseStep, 1000 / 60);
							interfaceLockout = 750;
							break;

						case "suspend_charged_no_shields":
							$(".battle-window .animate-message .text").html("No Protect shields remaining");
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
							break;

						case "suspend_switch_self":
							phaseTimer = switchTime;
							phaseInterval = setInterval(phaseStep, 1000 / 60);
							self.openSwitchWindow();
							interfaceLockout = 750;
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

					// If a switch has occured, update the Pokemon display and Charged Move buttons
					if((activePokemon.length < i)||(activePokemon[i] != pokemon)){
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

							$(".team-indicator").eq(i).find(".name").html(pokemon.speciesName);
							$(".team-indicator").eq(i).find(".cp").html("CP " + pokemon.cp);
						}

						if(i == 0){
							$(".move-bar").hide();

							for(var n = 0; n < pokemon.chargedMoves.length; n++){
								var chargedMove = pokemon.chargedMoves[n];
								var $bar = $(".battle-window .move-bar").eq(n);

								$bar.show();
								$bar.find(".label").html(chargedMove.abbreviation);
								$bar.find(".bar").attr("class","bar " + chargedMove.type);
								$bar.find(".bar-back").attr("class","bar-back " + chargedMove.type);
							}
						}
					}

					// Update move buttons

					if(i == 0){
						for(var n = 0; n < pokemon.chargedMoves.length; n++){
							var chargedMove = pokemon.chargedMoves[n];
							var $bar = $(".battle-window .move-bar").eq(n);
							var chargePercent = (pokemon.energy / chargedMove.energy) * 100;

							$bar.find(".bar").first().css("height", chargePercent+"%");

							if(chargePercent >= 100){
								$bar.addClass("active");
							} else{
								$bar.removeClass("active");
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
						if(player.getSwitchTimer() == 0){
							$(".battle-window .switch-btn").addClass("active");
							$(".battle-window .switch-btn").html("&#8645;");
						} else{
							$(".battle-window .switch-btn").removeClass("active");
							$(".battle-window .switch-btn").html(Math.floor(player.getSwitchTimer() / 1000));
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
					}

					if(fastAnimationOccurred){
						setTimeout(function(){
							$(".battle-window .scene .pokemon-container").removeClass("animate-fast");
						}, 250);
					}
				}

				// Update the autotap button and queue an action

				if(autotap){
					$(".controls .auto-tap").addClass("active");
					if(bufferedSwitch == -1){
						// Queue a fast move
						battle.queueAction(0, "fast", 0);
					} else{
						// Queue a previously entered switch
						battle.queueAction(0, "switch", bufferedSwitch);
					}
				} else{
					$(".controls .auto-tap").removeClass("active");
				}

				// Hide the switch button if only one Pokemon remains

				if(players[0].getRemainingPokemon() == 1){
					$(".battle-window .switch-btn").hide();
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

			self.openSwitchWindow = function(){
				// Update the switch window Pokemon
				var team = players[0].getTeam();
				var index = 0;

				for(var i = 0; i < team.length; i++){
					if(team[i] != activePokemon[0]){
						$(".switch-window .pokemon").eq(index).find(".cp").html(team[i].cp);
						$(".switch-window .pokemon").eq(index).find(".name").html(team[i].speciesName);
						$(".switch-window .pokemon").eq(index).find(".name").attr("class", "name " + team[i].types[0]);
						$(".switch-window .pokemon").eq(index).attr("index", i);
						$(".switch-window .pokemon").eq(index).attr("type-1", team[i].types[0]);
						if(team[i].types[1] == "none"){
							$(".switch-window .pokemon").eq(index).attr("type-2", team[i].types[0]);
						} else{
							$(".switch-window .pokemon").eq(index).attr("type-2", team[i].types[1]);
						}

						if(team[i].hp > 0){
							$(".switch-window .pokemon").eq(index).addClass("active");
						} else{
							$(".switch-window .pokemon").eq(index).removeClass("active");
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
						$(".team-indicator").eq(index).find(".cp").html(activePokemon[index].cp);

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
				$(".end-screen .difficulty-name").html(players[1].getAI().difficultyToString());

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

				gtag('event', battleSummaryStr, {
				  'event_category' : 'Training Battle',
				  'event_label' : battleResult
				});

				// Report each Pokemon
				var teamStrs = [];
				var teamScores = [];

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
						var pokeStr = pokemon.speciesName + ' ' + pokemon.fastMove.abbreviation;
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

						// Add to team string
						if(n == 0){
							teamStr += pokeStr;
						} else{
							backupPokeStrs.push(pokeStr);
						}

						// Assign this Pokemon's score in battle, damage done plus shields broken

						var score = Math.round(pokemon.battleStats.damage + (50 * pokemon.battleStats.shieldsBurned));
						teamScore += score;

						// Only report this Pokemon if it was used in battle
						if(pokemon.hp < pokemon.stats.hp){
							gtag('event', battleSummaryStr, {
							  'event_category' : 'Training Pokemon',
							  'event_label' : pokeStr,
							  'value' : score+'',
							  'player_type': playerType,
							  'team_position': n+1
							});
						}

					}

					gtag('event', battleSummaryStr, {
					  'event_category' : 'Training Pokemon',
					  'event_label' : pokeStr,
					  'value' : score+'',
					  'player_type': playerType,
					  'team_position': n+1
					});

					// Alphabetize the last two Pokemon on the team and build the team string
					backupPokeStrs.sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0));

					for(var n = 0; n < backupPokeStrs.length; n++){
						teamStr += " " + backupPokeStrs[n];
					}

					teamStrs.push(teamStr);
					teamScores.push(teamScore);
				}

				// Report each team
				for(var i = 0; i < players.length; i++){
					var score = teamScores[i];
					var opponentIndex = (i == 0) ? 1 : 0;
					var opponentScore = teamScores[opponentIndex];
					var maxScore = Math.max(teamScores[0], teamScores[1]);
					var playerType = 0;
					if(i == 1){
						playerType = players[i].getAI().getLevel()+1;
					}

					var battleRating = Math.floor( (500 * ((maxScore - opponentScore) / maxScore)) + (500 * (score / maxScore)))

					gtag('event', battleSummaryStr, {
					  'event_category' : 'Training Team',
					  'event_label' : teamStrs[i],
					  'value' : battleRating+'',
					  'player_type': playerType,
					});
				}
			}

			// Handler for the charge up interval

			function chargeUpStep(){
				// Lock charge at 100 once user reaches 100
				if(charge < maxCharge){
					charge = Math.max(charge - chargeDecayRate, 0);
				}

				// Update rings
				var percent = (charge / maxCharge) * 100;

				$(".battle-window .charge-window .ring").css("width", percent + "%");
				$(".battle-window .charge-window .ring").css("height", percent + "%");

				self.updatePhaseTimer();
			}

			// Click handler for sending input to the Battle object

			function battleWindowClick(e){
				if(interfaceLockout > 0){
					return false;
				}

				// Open or close switch window
				if($(".battle-window .switch-btn.active:hover").length > 0){
					$(".switch-window").toggleClass("active");
					if($(".switch-window").hasClass("active")){
						self.openSwitchWindow();
					}
					return;
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
				if($(".switch-window .pokemon.active:hover").length > 0){
					var $target = $(e.target);

					if(! $target.hasClass("pokemon")){
						$target = $(e.target).closest(".pokemon");
					}

					var index = parseInt($target.attr("index"));
					battle.queueAction(0, "switch", index);
					bufferedSwitch = index;

					$(".switch-window").removeClass("active");

					if(phase == "suspend_switch_self"){
						clearInterval(phaseInterval);
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

				// Charge up a Charged Move
				if(phase == "suspend_charged_attack"){
					chargeUpClick(e);
				}
			}

			// Click handler for sending input to the Battle object

			function chargeUpClick(e){
				charge = Math.min(charge + chargeRate, maxCharge);
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

				// Alternate CMP so it remains the same on rematch
				priorityAssignment = (priorityAssignment == 1) ? 0 : 1;

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
