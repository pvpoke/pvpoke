// JavaScript Document

var BattleMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new battleObject();
		
		function battleObject(){
			var gm = GameMaster.getInstance();
			var interface;
			
			var self = this;
			var pokemon = [null, null];
			var timeline = [];
			var duration = 0;
			var cp = 1500;
			var cup = {name: "all", types: []}; // List of allowed types
			
			var decisionLog = []; // For debugging
			
			this.init = function(){
				interface = InterfaceMaster.getInterface();
			}

			this.setNewPokemon = function(poke, index, initialize){
				initialize = typeof initialize !== 'undefined' ? initialize : true;
				
				if(initialize){
					poke.initialize(cp);
				}

				pokemon[index] = poke;
			}
			
			this.getPokemon = function(){
				return pokemon;
			}
			
			// This is used after team rankings so Pokemon don't auto-select moves based on the last simulated battle
			
			this.clearPokemon = function(){
				pokemon = [null, null];
			}

			this.getCP = function(){
				return cp;
			}

			this.setCP = function(cpLimit){
				cp = cpLimit;
				
				for(var i = 0; i < pokemon.length; i++){
					if(pokemon[i]){
						pokemon[i].initialize(cp);
					}
				}
			}
			
			// Set allowed types from GameMaster data
			
			this.setCup = function(cupName){
				
				if(gm.data.cups[cupName]){
					cup.name = cupName;
					cup.types = gm.data.cups[cupName];
				}
			}
			
			// Return object with a name and array of allowed types
			
			this.getCup = function(){
				return cup;
			}
			
			// Return the opposing Pokemon given an index of 0 or 1
			
			this.getOpponent = function(index){
				if(index == 0){
					return pokemon[1];
				} else{
					return pokemon[0];
				}
			}
			
			// Calculate damage given an attacker, defender, and move, requires move to be initialized first
			
			this.calculateDamage = function(attacker, defender, move){
							
				var bonusMultiplier = 1.3;

				var effectiveness = this.getEffectiveness(move.type, defender.types);
				
				var damage = Math.floor(move.power * move.stab * (attacker.stats.atk / defender.stats.def) * this.getEffectiveness(move.type, defender.types) * 0.5 * bonusMultiplier) + 1;

				return damage;
			}
			
			// Given a move type and array of defensive types, return the final type effectiveness multiplier
			
			this.getEffectiveness = function(moveType, targetTypes){
				var effectiveness = 1;
				
				var moveType = moveType.toLowerCase();
				
				for(var i = 0; i < targetTypes.length; i++){
					var type = targetTypes[i].toLowerCase();
					var traits = this.getTypeTraits(type);
					
					if(traits.weaknesses.indexOf(moveType) > -1){
						effectiveness *= 1.6;
					} else if(traits.resistances.indexOf(moveType) > -1){
						effectiveness *= .625;
					} else if(traits.immunities.indexOf(moveType) > -1){
						effectiveness *= .390625;
					}
				}
				
				return effectiveness;
			}
			
			// Helper function that returns an array of weaknesses, resistances, and immunities given defensive type
			
			this.getTypeTraits = function(type){
				var traits = {
					weaknesses: [],
					resistances: [],
					immunities: []
				};
				
				switch(type){
					case "normal":
						traits = { resistances: [],
						  weaknesses: ["fighting"],
						  immunities: ["ghost"] };
						break;
						
					case "fighting":
						traits = { resistances: ["rock", "bug", "dark"],
						  weaknesses: ["flying", "psychic", "fairy"],
						  immunities: [] };
						break;
						
					case "flying":
						traits = { resistances: ["fighting", "bug", "grass"],
						  weaknesses: ["rock", "electric", "ice"],
						  immunities: ["ground"] };
						break;
						
					case "poison":
						traits = { resistances: ["fighting", "poison", "bug", "fairy","grass"],
						  weaknesses: ["ground", "psychic"],
						  immunities: [] };
						break;
						
					case "ground":
						traits = { resistances: ["poison", "rock"],
						  weaknesses: ["water", "grass", "ice"],
						  immunities: ["electric"] };
						break;
						
					case "rock":
						traits = { resistances: ["normal", "flying", "poison", "fire"],
						  weaknesses: ["fighting", "ground", "steel", "water", "grass"],
						  immunities: [] };
						break;
						
					case "bug":
						traits = { resistances: ["fighting", "ground", "grass"],
						  weaknesses: ["flying", "rock", "fire"],
						  immunities: [] };
						break;
						
					case "ghost":
						traits = { resistances: ["poison", "bug"],
						  weaknesses: ["ghost","dark"],
						  immunities: ["normal", "fighting"] };
						break;
						
					case "steel":
						traits = { resistances: ["normal", "flying", "rock", "bug", "steel", "grass", "psychic", "ice", "dragon", "fairy"],
						  weaknesses: ["fighting", "ground", "fire"],
						  immunities: ["poison"] };
						break;
						
					case "fire":
						traits = { resistances: ["bug", "steel", "fire", "grass", "ice", "fairy"],
						  weaknesses: ["ground", "rock", "water"],
						  immunities: [] };
						break;
						
					case "water":
						traits = { resistances: ["steel", "fire", "water", "ice"],
						  weaknesses: ["grass", "electric"],
						  immunities: [] };
						break;
						
					case "grass":
						traits = { resistances: ["ground", "water", "grass", "electric"],
						  weaknesses: ["flying", "poison", "bug", "fire", "ice"],
						  immunities: [] };
						break;
						
					case "electric":
						traits = { resistances: ["flying", "steel", "electric"],
						  weaknesses: ["ground"],
						  immunities: [] };
						break;
						
					case "psychic":
						traits = { resistances: ["fighting", "psychic"],
						  weaknesses: ["bug", "ghost", "dark"],
						  immunities: [] };
						break;
						
					case "ice":
						traits = { resistances: ["ice"],
						  weaknesses: ["fighting", "fire", "steel", "rock"],
						  immunities: [] };
						break;
						
					case "dragon":
						traits = { resistances: ["fire", "water", "grass", "electric"],
						  weaknesses: ["dragon", "ice", "fairy"],
						  immunities: [] };
						break;
						
					case "dark":
						traits = { resistances: ["ghost", "dark"],
						  weaknesses: ["fighting", "fairy", "bug"],
						  immunities: ["psychic"] };
						break;
						
					case "fairy":
						traits = { resistances: ["fighting", "bug", "dark"],
						  weaknesses: ["poison", "steel"],
						  immunities: ["dragon"] };
						break;
				}
				
				return traits;
			}
			
			// This is the meat of the pie. Runs the battle simulation and returns an array of timeline events

			this.simulate = function(){
				
				for(var i = 0; i < pokemon.length; i++){
					pokemon[i].reset();
				}
				
				var time = 0;
				var turns = 0;
				timeline = [];
				
				var deltaTime = 500;
				
				// Main battle loop
				
				while((pokemon[0].hp > 0) && (pokemon[1].hp > 0)){
					
					// For display purposes, need to track whether a Pokemon has used a charged move or shield each round
					
					var roundChargedMoveUsed = 0;
					var roundShieldUsed = false;
					
					// Reduce cooldown for both POkemon
					
					for(var i = 0; i < 2; i++){
						var poke = pokemon[i];			
						poke.cooldown = Math.max(0, poke.cooldown - deltaTime); // Reduce cooldown
					}
					
					turns++;
					
					// Process actions for both Pokemon
					
					for(var i = 0; i < 2; i++){
						
						var poke = pokemon[i];
						var opponent = this.getOpponent(i);
						
						var currentShields = poke.shields + opponent.shields;
						
						// If Pokemon can take action
												
						var chargedMoveUsed = false; // Flag so Pokemon only uses one Charged Move per round
						
						if(poke.cooldown == 0){
							
							// Use primary charged move if available
							
							if((poke.bestChargedMove) && (poke.energy >= poke.bestChargedMove.energy)){
								
								// Use maximum number of Fast Moves before opponent can act
								
								var useChargedMove = true;
								
								self.logDecision(turns, poke, "'s best charged move is charged (" + poke.bestChargedMove.name + ")");
								
								if(opponent.cooldown == 0){
									if(opponent.fastMove.cooldown > poke.fastMove.cooldown){
										useChargedMove = false;
										
										self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because opponent isn't on cooldown and its fast move is faster");
									}
								} else{
									if(opponent.cooldown > poke.fastMove.cooldown){
										useChargedMove = false;
										
										self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because opponent will still be on cooldown after a fast move");
									}
								}
								
								// Don't use a charged move if fast moves will result in a KO
								
								if(opponent.hp <= poke.fastMove.damage){
									useChargedMove = false;
									
									self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because a fast move will knock out the opponent");
								}
								
								if((opponent.shields > 0)&&(opponent.hp <= (poke.fastMove.damage * (opponent.fastMove.cooldown / poke.fastMove.cooldown)))){
									useChargedMove = false;
									
									self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because opponent has shields and fast moves will knock them out before their cooldown completes");
								}
								
								if(useChargedMove){
									time = this.useMove(poke, opponent, poke.bestChargedMove, timeline, time, turns, roundShieldUsed, roundChargedMoveUsed);
									roundChargedMoveUsed++;
									chargedMoveUsed = true;
								}

							}
							
							// Process any available charged move
							
							for(var n = 0; n < poke.chargedMoves.length; n++){
								var move = poke.chargedMoves[n];
								
								if((poke.energy >= move.energy)&&(!chargedMoveUsed)){
									
									self.logDecision(turns, poke, " has " + move.name + " charged");
									
									// Use charged move if it would KO the opponent
									
									if((move.damage >= opponent.hp) && (opponent.shields == 0) && (!chargedMoveUsed)){
										time = this.useMove(poke, opponent, move, timeline, time, turns, roundShieldUsed, roundChargedMoveUsed);
										roundChargedMoveUsed++;
										chargedMoveUsed = true;
										
										self.logDecision(turns, poke, " will knock out opponent with " + move.name);
									}
									
									// Use charged move if the opponent has a shield
									
									if((opponent.shields > 0)  && (!chargedMoveUsed)){
										
										// Don't use a charged move if a fast move will result in a KO
										
										if((opponent.hp > poke.fastMove.damage)&&(opponent.hp > (poke.fastMove.damage *(opponent.fastMove.cooldown / poke.fastMove.cooldown)))){
											
											self.logDecision(turns, poke, " wants to remove shields with " + move.name + " and opponent won't faint from fast move damage before next cooldown");
											
											time = this.useMove(poke, opponent, move, timeline, time, turns, roundShieldUsed, roundChargedMoveUsed);
											roundChargedMoveUsed++;
											chargedMoveUsed = true;
										}
									}
									
									// Use charged move if about to be KO'd
									
									var nearDeath = false;
									
									// Will this Pokemon be knocked out this round?
									
									if(poke.index == 0){
										
										if(opponent.cooldown == 0){
											// Will a Fast Move knock it out?
											if(poke.hp <= opponent.fastMove.damage){
												nearDeath = true;
												
												self.logDecision(turns, poke, " will be knocked out by opponent's fast move this turn");
											}
											
											// Will a Charged Move knock it out?
											if(poke.shields == 0){
												for(var j = 0; j < opponent.chargedMoves.length; j++){

													if((opponent.energy >= opponent.chargedMoves[j].energy) && (poke.hp <= opponent.chargedMoves[j].damage)){
														nearDeath = true;

														self.logDecision(turns, poke, " doesn't have shields and will by knocked out by opponent's " + opponent.chargedMoves[j].name + " this turn");
													}
												}
											}
										}
									} else if(poke.hp <= 0){
										nearDeath = true;
										
										self.logDecision(turns, poke, " has already been fainted");
									}
									
									// If this Pokemon uses a Fast Move, will it be knocked out while on cooldown?
									
									if( ((opponent.cooldown > 0) && (opponent.cooldown < poke.fastMove.cooldown)) || ((opponent.cooldown == 0) && (opponent.fastMove.cooldown < poke.fastMove.cooldown))){
										
										// Can this Pokemon be knocked out by future Fast Moves?
										
										var availableTime = poke.fastMove.cooldown - opponent.cooldown;
										var futureActions = Math.ceil(availableTime / opponent.fastMove.cooldown);
										
										if(roundChargedMoveUsed > 0){
											futureActions = 0;
										}
										
										var futureFastDamage = futureActions * opponent.fastMove.damage;
										
										if(poke.hp <= futureFastDamage){
											nearDeath = true;
											
											self.logDecision(turns, poke, " will be knocked out by future fast move damage");
										}
										
										// Can this Pokemon be knocked out by future Charged Moves
										if(poke.shields == 0){
											var futureEffectiveEnergy = opponent.energy + (opponent.fastMove.energyGain * futureActions);
											var futureEffectiveHP = poke.hp - futureActions * opponent.fastMove.damage;

											for(var j = 0; j < opponent.chargedMoves.length; j++){

												if((futureEffectiveEnergy >= opponent.chargedMoves[j].energy) && (futureEffectiveHP <= opponent.chargedMoves[j].damage)){
													nearDeath = true;
													
													self.logDecision(turns, poke, " doesn't have shields and will be knocked out by future fast and charged move damage");
												}
											}
										}
									}
									
									// Don't use a Charged Move if the opponent is shielded and a Fast Move will result in a KO
									
									if((opponent.shields > 0)&&(opponent.hp <= poke.fastMove.damage)){
										nearDeath = false;
										
										self.logDecision(turns, poke, " doesn't use " + move.name + " because opponent has shields and will faint from a fast move this turn");
									}
	
									if((nearDeath)&&(!chargedMoveUsed)){
										time = this.useMove(poke, opponent, move, timeline, time, roundShieldUsed, roundChargedMoveUsed);
										roundChargedMoveUsed++;
										chargedMoveUsed = true;
									}
								}
							}
							
							// Otherwise, use fast move
							
							if(! chargedMoveUsed){
								time = this.useMove(poke, opponent, poke.fastMove, timeline, time, turns, roundShieldUsed, roundChargedMoveUsed);
							}

						}

						if(poke.shields + opponent.shields < currentShields){
							roundShieldUsed = true;
						}
						
					}
					
					if(roundChargedMoveUsed == 0){
						time += deltaTime;
					} else{
						// This is for display purposes only
						if(roundShieldUsed){
							time += 7500 * (roundChargedMoveUsed-1);
						} else{
							time += 7500;
						}
						
					}
				
					duration = time;
					
					// Check for faint
					for(var i = 0; i < 2; i++){
						var poke = pokemon[i];
	
						if(poke.hp <= 0){
							timeline.push(new TimelineEvent("faint", "Faint", poke.index, time, turns));
						}
						
						// Reset after a charged move
						
						if(roundChargedMoveUsed){
							poke.cooldown = 0;
							poke.damageWindow = 0;
						}
					}
					
				}
				
				return timeline;
			}
			
			// Use a move on an opposing Pokemon and produce a Timeline Event
			
			this.useMove = function(attacker, defender, move, timeline, time, turns, shieldUsed, roundChargedMoveUsed){
				
				var type = "fast " + move.type;
				var damage = move.damage;
				
				var displayTime = time;
				
				self.logDecision(turns, attacker, " uses " + move.name);
				
				// If Charged Move
				
				if(move.energy > 0){

					type = "charged " + move.type;
					
					attacker.energy -= move.energy;
					
					// Add tap events for display
					
					for(var i = 0; i < 5; i++){
						timeline.push(new TimelineEvent("tap "+move.type, "Tap", attacker.index, time+(1000*i), turns, [i]));
					}
					
					// If defender has a shield, use it
					
					if(defender.shields > 0){
						timeline.push(new TimelineEvent("shield", "Shield", defender.index, time+5500, turns, [damage-1]));
						damage = 1;
						defender.shields--;
						shieldUsed = true;
						
						self.logDecision(turns, defender, " blocks with a shield");
						
						// If a shield has already been used, add time so events don't visually overlap
						
						if(roundChargedMoveUsed == 0){
							time+=7500;
						}
					}
					
				} else{
					// If Fast Move
					
					attacker.energy += attacker.fastMove.energyGain;
					attacker.cooldown = move.cooldown;
				}
				
				defender.hp = Math.max(0, defender.hp-damage);
				
				// Adjust display time so events don't visually overlap
				// This was really hard for my little brain to figure out so like really don't touch it
				
				if(move.energy > 0){
					displayTime += 5500;
				} else if(shieldUsed){
					displayTime -= 7500;
				}
				
				// Set energy value for TimelineEvent
				
				var energyValue = move.energyGain;
				
				if(move.energy > 0){
					energyValue = -move.energy;
				}
				
				timeline.push(new TimelineEvent(type, move.name, attacker.index, displayTime, turns, [damage, energyValue]));

				return time;
				
			}
			
			// Return whether or not a simulation can run successfully
			
			this.validate = function(){
				if((pokemon[0]) && (pokemon[1])){
					return true;
				} else{
					return false;
				}
			}
			
			// Return victorious pokemon, or false if simultaneous knockout
			
			this.getWinner = function(){
				var winner = pokemon[0];
				
				if(pokemon[1].hp > pokemon[0].hp){
					winner = pokemon[1];
				} else if(pokemon[1].hp == pokemon[0].hp){
					winner = false;
				}
				
				return winner;
			}
			
			// Return a battle rating RGB color given a rating
			
			this.getRatingColor = function(rating){
				var winColors = [
					[93,71,165],
					[0,143,187]
				]; // rgb
				var lossColors = [
					[186,0,143],
					[93,71,165]
				]; // rgb

				// Apply a gradient to bar color
				var colors = (rating <= 500) ? lossColors : winColors;
				var color = [ colors[0][0], colors[0][1], colors[0][2] ];

				for(var j = 0; j < color.length; j++){
					var range = colors[1][j] - color[j];
					var base = color[j];
					var ratio = rating / 500;

					if(ratio > 1){
						ratio -= 1;
					}

					color[j] = Math.floor(base + (range * ratio));
				}
				
				return color;
			}
			
			// Add a decision to the debug log
			
			this.logDecision = function(turn, pokemon, string){
				decisionLog.push({
					turn: turn,
					pokemon: pokemon,
					string: string
				});
			}
			
			// Output debug log to console
			
			this.debug = function(){
				for(var i = 0; i < decisionLog.length; i++){
					var log = decisionLog[i];
					
					console.log(log.turn + "\t:\t" + log.pokemon.speciesName + "(" + log.pokemon.index + ") " + log.string);
				}
			}

			this.getDuration = function(){
				return duration;
			}

			this.getTimeline = function(){
				return timeline;
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