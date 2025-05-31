
class ActionLogic {

	// Run AI decision making to determine battle action this turn, and return the resulting action

	static decideAction(battle, poke, opponent){
		let turns = battle.getTurns()
		let action;
		let chargedMoveReady = []; // Array containing the indices of available charged attacks
		let winsCMP = poke.stats.atk >= opponent.stats.atk;

		let fastDamage = DamageCalculator.damage(poke, opponent, poke.fastMove);
		let oppFastDamage = DamageCalculator.damage(opponent, poke, opponent.fastMove);
		let hasNonDebuff = false;

		// If no Charged Moves at all, return
		if(poke.activeChargedMoves.length < 1){
			return;
		}

		// If no charged move ready, always throw fast move or farm energy is on
		if (poke.energy < poke.fastestChargedMove.energy || poke.farmEnergy) {
			return;
		}

		// Evaluate cooldown to reach each charge move
		for(var n = 0; n < poke.activeChargedMoves.length; n++) {
			if (!poke.activeChargedMoves[n].selfDebuffing) {
				hasNonDebuff = true;
			}
			if (poke.energy >= poke.activeChargedMoves[n].energy) {
				chargedMoveReady.push(0);
			} else {
				chargedMoveReady.push(Math.ceil((poke.activeChargedMoves[n].energy - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.turns);
			}
		}

		let turnsToLive = Infinity;
		let queue = [];
		let moveTurns = poke.fastMove.turns;

		// Check if opponent is in the middle of a fast move and adjust accordingly
		// ELEMENTS OF STATE: POKEMON HP, OPPONENT ENERGY, CURRENT TURN, SHIELDS

		if (opponent.cooldown != 0) {
			queue.unshift(
				{
					hp: poke.hp - oppFastDamage,
					opEnergy: opponent.energy + opponent.fastMove.energyGain,
					turn: opponent.cooldown / 500,
					shields: poke.shields
				}
			);
		} else {
			queue.unshift(
				{
					hp: poke.hp,
					opEnergy: opponent.energy,
					turn: 0,
					shields: poke.shields
				}
			);
		}

		// Check if opponent can KO in your fast move cooldown
		while (queue.length != 0) {

			var currState = queue.shift();

			// If turn > when you can act before your opponent, move to the next item in the queue

			if(currState.hp > oppFastDamage){
				if (winsCMP) {
					if (currState.turn > poke.fastMove.turns) {
						continue;
					}
				} else {
					if (currState.turn > poke.fastMove.turns + 1) {
						continue;
					}
				}
			}

			// Shield bait if shields are up, otherwise try to KO
			if (currState.shields != 0) {
				if (currState.opEnergy >= opponent.fastestChargedMove.energy) {
					queue.unshift(
						{
							hp: currState.hp - 1,
							opEnergy: currState.opEnergy - opponent.fastestChargedMove.energy,
							turn: currState.turn + 1,
							shields: currState.shields - 1
						}
					);
				}
			} else {
				// Check if any charge move KO's, add results to queue
				for(var n = 0; n < opponent.activeChargedMoves.length; n++) {

					if (currState.opEnergy >= opponent.activeChargedMoves[n].energy) {
						var moveDamage = DamageCalculator.damage(opponent, poke, opponent.activeChargedMoves[n]);

						if (moveDamage >= currState.hp) {
							turnsToLive = Math.min(currState.turn, turnsToLive);

							if(poke.stats.atk > opponent.stats.atk && opponent.fastMove.cooldown % poke.fastMove.cooldown == 0){
								turnsToLive++;
							}

							battle.logDecision(poke, " opponent has energy to use " + opponent.activeChargedMoves[n].name + " and it would do " + moveDamage + " damage. I have " + turnsToLive + " turn(s) to live, opponent has " + currState.opEnergy);
							break;
						}
						queue.unshift(
							{
								hp: currState.hp - moveDamage,
								opEnergy: currState.opEnergy - opponent.activeChargedMoves[n].energy,
								turn: currState.turn + 1,
								shields: currState.shields
							}
						);
					}
				}
			}

			// Check if a fast move faints, add results to queue
			if (currState.hp - oppFastDamage <= 0) {
				turnsToLive = Math.min(currState.turn + (opponent.fastMove.turns), turnsToLive);
				break;
			} else {
				queue.unshift(
					{
						hp: currState.hp - oppFastDamage,
						opEnergy: currState.opEnergy + opponent.fastMove.energyGain,
						turn: currState.turn + opponent.fastMove.turns,
						shields: currState.shields
					}
				);
			}
		}

		// If you can't throw a fast move and live, throw whatever move you can with the most damage
		if (turnsToLive != -1) {
			if(poke.hp <= opponent.fastMove.damage * 2 && opponent.fastMove.cooldown == 500){
				turnsToLive--;
			}

			// Anticipate a Fast Move landing that has already initiated
			if((poke.hp <= opponent.fastMove.damage)&&(opponent.cooldown > 0)&&(opponent.fastMove.cooldown > 500)){
				turnsToLive = opponent.cooldown / 500;

				if(opponent.hp > poke.fastMove.damage){
					turnsToLive--;
				}
			}

			// Anticipate a Fast Move landing if you use your Fast Move
			if(poke.hp <= opponent.fastMove.damage && opponent.cooldown == 0 && opponent.fastMove.cooldown <= poke.fastMove.cooldown + 500){
				if(opponent.hp > poke.fastMove.damage){
					turnsToLive--;
				}
			}

			if (turnsToLive * 500 < poke.fastMove.cooldown || (turnsToLive * 500 == poke.fastMove.cooldown && !winsCMP) || (turnsToLive * 500 == poke.fastMove.cooldown && poke.hp <= opponent.fastMove.damage)) {

				var maxDamageMoveIndex = 0;
				var prevMoveDamage = -1;

				for(var n = poke.activeChargedMoves.length; n >= 0; n--) {

					// Find highest damage available move
					if (chargedMoveReady[n] == 0) {
						var moveDamage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[n]);

						// If this move deals more damage than the other move, use it
						if (moveDamage > prevMoveDamage){
							maxDamageMoveIndex = poke.chargedMoves.indexOf(poke.activeChargedMoves[n]);
							prevMoveDamage = moveDamage;
						}

						// If the Pokemon can fire two of this move and deal more damage, use it
						if(poke.energy >= poke.activeChargedMoves[n].energy * 2 && poke.stats.atk > opponent.stats.atk && moveDamage * 2 > prevMoveDamage){
							maxDamageMoveIndex = poke.chargedMoves.indexOf(poke.activeChargedMoves[n]);
							prevMoveDamage = moveDamage * 2;
						}
					}
				}


				// If no moves available, throw fast move
				if (prevMoveDamage == -1) {
					battle.logDecision(poke, " uses a fast move because it has " + turnsToLive + " turn(s) before it is KO'd but has no energy.");
					return;
				// Throw highest damage move
				} else {

					battle.logDecision(poke, " uses " + poke.chargedMoves[maxDamageMoveIndex].name + " because it has " + turnsToLive + " turn(s) before it is KO'd.");

					action = new TimelineAction(
						"charged",
						poke.index,
						turns,
						maxDamageMoveIndex,
						{shielded: false, buffs: false, priority: poke.priority});

					return action;
				}
			}
		}

		// Throw a lethal Charged Move if it will faint the opponent

		if(! poke.farmEnergy && opponent.shields == 0){
			for(var n = 0; n < poke.activeChargedMoves.length; n++) {
				var move = poke.activeChargedMoves[n];
				var moveIndex = poke.chargedMoves.indexOf(poke.activeChargedMoves[n]);

				if(poke.energy >= move.energy){
					var moveDamage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[n]);

					// Don't throw self debuffing moves at this point, or if the opponent will faint from Fast Move damage
					if(opponent.hp <= moveDamage && (! move.selfDebuffing) && (n == 0 || (n == 1 && ! poke.baitShields)) && opponent.hp > poke.fastMove.damage){

						action = new TimelineAction(
							"charged",
							poke.index,
							turns,
							moveIndex,
							{shielded: false, buffs: false, priority: poke.priority});

						return action;
					}
				}
			}
		}

		// Optimize move timing to reduce free turns
		if(poke.optimizeMoveTiming){
			var targetCooldown = 500; // Look to throw moves when opponent is at this cooldown or lower

			if(poke.fastMove.cooldown >= 2000){
				targetCooldown = 1000;
			}

			if((poke.fastMove.cooldown >= 1500)&&(opponent.fastMove.cooldown == 2500)){
				targetCooldown = 1000;
			}

			if((poke.fastMove.cooldown == 1000)&&(opponent.fastMove.cooldown == 2000)){
				targetCooldown = 1000;
			}

			// Don't optimize timing for Pokemon with the same duration moves
			if(poke.fastMove.cooldown == opponent.fastMove.cooldown){
				targetCooldown = 0;
			}

			// Don't optimize timing for Pokemon with longer, even duration moves (ie 4 vs 2, 3 vs 1)
			if(poke.fastMove.cooldown % opponent.fastMove.cooldown == 0 && poke.fastMove.cooldown > opponent.fastMove.cooldown){
				targetCooldown = 0;
			}

			// Perform additional checks to execute optimal timing
			if( (opponent.cooldown == 0 || opponent.cooldown > targetCooldown) && targetCooldown > 0) {
				var optimizeTiming = true;

				// Don't optimize if we're about to faint from a fast move
				if(poke.hp <= opponent.fastMove.damage){
					optimizeTiming = false;
				}

				// Don't optimize if we'll go over 100 energy
				var queuedFastMoves = 0;
				var queuedActions = battle.getQueuedActions();
				for(var i = 0; i < queuedActions.length; i++){
					if((queuedActions[i].actor == poke.index)&&(queuedActions[i].type == "fast")){
						queuedFastMoves++;
					}
				}

				queuedFastMoves++; // Add 1 for the Fast Move we are thinking about doing

				if(poke.energy + (poke.fastMove.energyGain * queuedFastMoves) > 100){
					optimizeTiming = false;
				}

				// Don't optimize if we have fewer turns to live than we can throw Charged Moves
				var turnsPlanned = poke.fastMove.turns + Math.floor(poke.energy / poke.activeChargedMoves[0].energy);

				if(poke.stats.atk < opponent.stats.atk){
					turnsPlanned++;
				}

				if(turnsPlanned > turnsToLive){
					optimizeTiming = false;
				}

				battle.logDecision(poke, " has " + turnsToLive + " turns to live");

				// Don't optimize if we can KO with a Charged Move
				if(opponent.shields == 0){
					for(var n = 0; n < poke.activeChargedMoves.length; n++) {
						poke.activeChargedMoves[n].damage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[n]);

						if (poke.energy >= poke.activeChargedMoves[n].energy && poke.activeChargedMoves[n].damage >= opponent.hp) {

							optimizeTiming = false;
							break;
						}
					}
				}

				// Don't optimize if our opponent can KO with a Charged Move
				for(var n = 0; n < opponent.activeChargedMoves.length; n++) {
					var fastMovesFromCharged = Math.ceil((opponent.activeChargedMoves[n].energy - opponent.energy) / opponent.fastMove.energyGain);
					var fastMovesInFastMove = Math.floor(poke.fastMove.cooldown / opponent.fastMove.cooldown); // How many Fast Moves can the opponent get in if we do an extra move?
					var turnsFromMove = (fastMovesFromCharged * opponent.fastMove.turns) + 1;

					opponent.activeChargedMoves[n].damage = DamageCalculator.damage(opponent, poke, opponent.activeChargedMoves[n]);

					var moveDamage = opponent.activeChargedMoves[n].damage + (opponent.fastMove.damage * fastMovesInFastMove);

					if(poke.shields > 0){
						moveDamage = 1 + (opponent.fastMove.damage * fastMovesInFastMove)
					}

					if (turnsFromMove <= poke.fastMove.turns && moveDamage >= poke.hp) {
						optimizeTiming = false;
						break;
					}
				}

				// Don't optimize if the opponent will KO with Fast Moves it can fit into our Fast Move
				var fastMovesInFastMove = Math.floor( (poke.fastMove.cooldown + 500) / opponent.fastMove.cooldown);
				if(poke.hp <= opponent.fastMove.damage * fastMovesInFastMove){
					optimizeTiming = false;
				}



				if(optimizeTiming){
					battle.logDecision(poke, " is optimizing move timing");
					return;
				}
			}
		}

		// Evaluate if opponent can't be fainted in a limited number of cycles. If so, do a simpler move selection.

		var bestChargedDamage = DamageCalculator.damage(poke, opponent, poke.bestChargedMove);
		var bestCycleDamage = bestChargedDamage + (fastDamage * Math.ceil(poke.bestChargedMove.energy / poke.fastMove.energyGain));
		var minimumCycleThreshold = 2;

		// Prefer non-debuffing moves when it will take multiple to KO
		if(poke.bestChargedMove.selfDebuffing && poke.bestChargedMove.energy > poke.fastestChargedMove.energy && poke.bestChargedMove.dpe / poke.fastestChargedMove.dpe < 2){
			minimumCycleThreshold = 1.1;
		}

		if(opponent.hp / bestCycleDamage > minimumCycleThreshold){
			// It's going to take a lot of cycles to KO, so just throw the best move

			// Build up to best move
			var selectedMove = poke.bestChargedMove;

			if(poke.activeChargedMoves.length > 1){
				if(poke.baitShields && opponent.shields > 0 && ! poke.activeChargedMoves[0].selfDebuffing && ActionLogic.wouldShield(battle, poke, opponent, poke.activeChargedMoves[1]).value){
					selectedMove = poke.activeChargedMoves[0];
				}

				if(poke.bestChargedMove.selfDebuffing){
					for(var i = 0; i < poke.activeChargedMoves.length; i++){
						if((! poke.activeChargedMoves[i].selfDebuffing) && (selectedMove.dpe / poke.activeChargedMoves[i].dpe < 2)){
							selectedMove = poke.activeChargedMoves[i];
						}
					}
				}
			}

			if(poke.energy < selectedMove.energy){
				return;
			} else{
				// Stack self debuffing moves
				if(selectedMove.selfDebuffing){
					var energyToReach = poke.energy + (Math.floor((100 - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.energyGain);
					if(poke.energy < energyToReach){
						return;
					}
				}

				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(selectedMove),
					{shielded: false, buffs: false, priority: poke.priority});

				return action;
			}
		}

		// Calculate the most efficient way to defeat opponent

		// ELEMENTS OF DP QUEUE: ENERGY, OPPONENT HEALTH, TURNS, OPPONENT SHIELDS, USED MOVES, ATTACK BUFF, CHANCE

		var stateCount = 0;

		var DPQueue = [new BattleState(poke.energy, opponent.hp, 0, opponent.shields, [], 0, 1)];
		var stateList = [];
		var finalState;

		while (DPQueue.length != 0) {

			// A not very good way to prevent infinite loops
			if (stateCount >= 500) {
				battle.logDecision(poke, " considered too many states, likely an infinite loop");
				return;
			}
			stateCount++;

			var currState = DPQueue.shift();
			var DPchargedMoveReady = [];

			// Set cap of 4 for buffs
			currState.buffs = Math.min(4, currState.buffs);
			currState.buffs = Math.max(-4, currState.buffs);

			// Found fastest way to defeat enemy, fastest = optimal in this case since damage taken is strictly dependent on time
			// Set finalState to currState and do more evaluation later
			if (currState.oppHealth <= 0) {

				stateList.push(currState);

				if (currState.chance == 1) {
					break;
				} else {
					continue;
				}
			}

			// Evaluate cooldown to reach each charge move
			for(var n = 0; n < poke.activeChargedMoves.length; n++) {
				if (currState.energy >= poke.activeChargedMoves[n].energy) {
					DPchargedMoveReady.push(0);
				} else {
					DPchargedMoveReady.push(Math.ceil((poke.activeChargedMoves[n].energy - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.turns);
				}
			}

			// Push states onto queue in order of TURN
			for(var n = 0; n < poke.activeChargedMoves.length; n++) {

				// Apply stat changes to pokemon attack
				var currentStatBuffs = [poke.statBuffs[0], poke.statBuffs[1]];
				poke.applyStatBuffs([currState.buffs, 0]);

				var moveDamage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[n]);
				var fastSimulatedDamage = DamageCalculator.damage(poke, opponent, poke.fastMove);

				// Remove stat changes from pokemon attack
				poke.statBuffs = [currentStatBuffs[0], currentStatBuffs[1]];

				// Skip self defense debuffing moves like Superpower if they aren't lethal
				// MELMETAL V CRESSELIA IS A NIGHTMARE :D
				if (hasNonDebuff && poke.speciesName == "Melmetal" && opponent.speciesName == "Cresselia") {
					if((poke.activeChargedMoves[n].selfDebuffing) && (poke.activeChargedMoves[n].buffs[1] < 1) && (opponent.hp > moveDamage * (1 + 4 / (4 -	poke.activeChargedMoves[n].buffs[0])))){
						continue;
					}
				}

				// Add result of farming down from this point
				var movesToFarmDown = Math.ceil(currState.oppHealth / fastSimulatedDamage);

				// Place state at correct spot in priority queue
				var i = 0;
				var insertElement = true;
				if (DPQueue.length == 0) {
					DPQueue.unshift(new BattleState(currState.energy + poke.fastMove.energyGain * movesToFarmDown, 0, currState.turn + movesToFarmDown * poke.fastMove.turns, currState.opponentShields, currState.moves, currState.buffs, currState.chance));
				} else {
					while (DPQueue[i].turn <= currState.turn + movesToFarmDown * poke.fastMove.turns) {
						if (DPQueue[i].hp < 0) {
							insertElement = false;
							break;
						}
						i ++;
						if (i == DPQueue.length) {
							break;
						}
					}
					if (insertElement) {
						DPQueue.splice(i, 0, new BattleState(currState.energy + poke.fastMove.energyGain * movesToFarmDown, 0, currState.turn + movesToFarmDown * poke.fastMove.turns, currState.opponentShields, currState.moves, currState.buffs, currState.chance));
					}
				}

				// Find new attack after move
				var attackMult = currState.buffs;

				// Track if move has a chance to change TTK
				var changeTTKChance = 0;
				var possibleAttackMult = attackMult;

				// If attack changes attack stat, apply effects
				if (poke.activeChargedMoves[n].buffApplyChance && (poke.activeChargedMoves[n].buffTarget == "self")) {
					if (poke.activeChargedMoves[n].buffApplyChance == 1) {
						attackMult += poke.activeChargedMoves[n].buffs[0];
					} else {
						possibleAttackMult += poke.activeChargedMoves[n].buffs[0];
						changeTTKChance = poke.activeChargedMoves[n].buffApplyChance;
					}
				}

				// If attack changes opponent defense, apply effects
				if (poke.activeChargedMoves[n].buffApplyChance && (poke.activeChargedMoves[n].buffTarget == "opponent")) {
					if (poke.activeChargedMoves[n].buffApplyChance == 1) {
						attackMult -= poke.activeChargedMoves[n].buffs[1];
					} else {
						possibleAttackMult -= poke.activeChargedMoves[n].buffs[1];
						changeTTKChance = poke.activeChargedMoves[n].buffApplyChance;
					}
				}

				// DISABLE THE NON-GUARANTEED BUFF EVALUATION SYSTEM
				changeTTKChance = 0;

				// If move is ready, use it and add results to queue
				if (DPchargedMoveReady[n] == 0) {

					// If shielded, apply 1 damage, otherwise apply move damage
					var newOppHealth = currState.oppHealth - moveDamage;
					if (currState.oppShields > 0) {
						newOppHealth = currState.oppHealth - 1;
					}

					var newShields = currState.oppShields;
					// Assume pokemon shields
					if (newShields > 0) {
						newShields--;
					}

					// DEBUG
	//					self.logDecision(turns, poke, " wants to use " + poke.chargedMoves[n].name + " because it has the energy for it. Opponent hp will be " + newOppHealth + ". Turn = " + (currState.turn));

					// Remove all elements that are strictly worse than this state while checking if there are any elements better than this state
					var i = 0;
					insertElement = true;
					while (i < DPQueue.length && DPQueue[i].turn == currState.turn + 1) {
						if (DPQueue[i].oppHealth == newOppHealth && DPQueue[i].buffs == attackMult) {
							if (DPQueue[i].energy == (currState.energy - poke.activeChargedMoves[n].energy)) {

								// Added this just for Perrserker and Giratina
								// If energy is the same and opponent at same health choose path with less debuffs or more buff chances

								var DPDebuffs = 0;
								var currDebuffs = 0;
								for (var x = 0; x < DPQueue[i].moves.length; x++) {
									if (DPQueue[i].moves[x].selfDebuffing) {
										DPDebuffs++;
									}
									if (DPQueue[i].moves[x].buffApplyChance == 1 && DPQueue[i].moves[x].buffTarget == "self" && DPQueue[i].moves[x].buffs[0] + DPQueue[i].moves[x].buffs[1] > 0) {
										DPDebuffs--;
									}
								}
								var tempState = currState.moves.concat([poke.activeChargedMoves[n]]);
								for (var x = 0; x < tempState.length; x++) {
									if (tempState[x].selfDebuffing) {
										currDebuffs++;
									}
									if (tempState[x].buffApplyChance == 1 && tempState[x].buffTarget == "self" && tempState[x].buffs[0] + tempState[x].buffs[1] > 0) {
										currDebuffs--;
									}
								}


								if (DPDebuffs > currDebuffs) {
									DPQueue.splice(i, 1);
								} else {
									insertElement = false;
									i++;
								}
							} else {
								insertElement = false;
								i++;
							}

						} else {
							i++;
						}
					}
					if (insertElement) {

						// Place state at correct spot in priority queue
						var i = 0;
						var insert = true;
						if (DPQueue.length == 0) {
							DPQueue.unshift(new BattleState(newEnergy, newOppHealth, currState.turn + 1, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
							// If move has chance of changing TTK, add that result
							if (changeTTKChance != 0) {
								DPQueue.unshift(new BattleState(newEnergy, newOppHealth, currState.turn + 1, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
							}
						} else {
							while (DPQueue[i].turn <= currState.turn + 1) {
								if (DPQueue[i].hp <= newOppHealth && DPQueue[i].energy >= newEnergy && DPQueue[i].buffs >= attackMult && DPQueue[i].shields <= newShields) {
									insert = false;
									break;
								}
								i ++;
								if (i == DPQueue.length) {
									break;
								}
							}
							if (insert) {
								DPQueue.splice(i, 0, new BattleState(currState.energy - poke.activeChargedMoves[n].energy, newOppHealth, currState.turn + 1, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
							}
							// If move has chance of changing TTK, add that result
							if (changeTTKChance != 0) {
								DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, currState.turn + 1, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
							}
						}
					}

					// If move will debuff attack, calculate values when you stack two of them then throw
					if (poke.activeChargedMoves[n].selfDebuffing && poke.activeChargedMoves[n].buffs[0] < 0 && poke.activeChargedMoves[n].energy * 2 <= 100) {

						var newTurn = Math.ceil((poke.activeChargedMoves[n].energy * 2 - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.turns;
						newEnergy = Math.floor(newTurn / poke.fastMove.turns) * poke.fastMove.energyGain + currState.energy - poke.activeChargedMoves[n].energy;

						if (newTurn != 0) {
							// Calculate new health
							newOppHealth = currState.oppHealth - fastSimulatedDamage * (newTurn / poke.fastMove.turns);

							// Calculate shield scenarios
							if (currState.oppShields > 0) {
								newOppHealth = newOppHealth - 1;
							} else {
								newOppHealth = newOppHealth - moveDamage;
							}

							newTurn += currState.turn + 1;

							i = 0;
							insertElement = true;
							if (DPQueue.length == 0) {
								DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
								// If move has chance of changing TTK, add that result
								if (changeTTKChance != 0) {
									DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
								}
							} else {
								while (DPQueue[i].turn <= newTurn) {
									if (DPQueue[i].hp <= newOppHealth && DPQueue[i].energy >= newEnergy && DPQueue[i].buffs >= attackMult && DPQueue[i].shields <= newShields) {
										insertElement = false;
										break;
									}
									i ++;
									if (i == DPQueue.length) {
										break;
									}
								}
								if (insertElement) {
									DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
								}
								// If move has chance of changing TTK, add that result
								if (changeTTKChance != 0) {
									DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
								}
							}
						}


					}

				} else {
					var newEnergy = currState.energy - poke.activeChargedMoves[n].energy + poke.fastMove.energyGain * (DPchargedMoveReady[n] / poke.fastMove.turns);
					var newOppHealth = currState.oppHealth - moveDamage - fastSimulatedDamage * (DPchargedMoveReady[n] / poke.fastMove.turns);

					// If shields are up, only apply fast move damage
					if (currState.oppShields > 0) {
						newOppHealth = currState.oppHealth - fastSimulatedDamage * (DPchargedMoveReady[n] / poke.fastMove.turns) - 1;
					}
					var newTurn = currState.turn + DPchargedMoveReady[n] + 1;
					var newShields = currState.oppShields;

					// Assume pokemon shields
					if (newShields > 0) {
						newShields--;
					}

					// Place in priority queue, with TURN being the priority
					var i = 0;
					insertElement = true;
					if (DPQueue.length == 0) {
						DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
						// If move has chance of changing TTK, add that result
						if (changeTTKChance != 0) {
							DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
						}
					} else {
						while (DPQueue[i].turn < newTurn) {
							if (DPQueue[i].hp <= newOppHealth && DPQueue[i].energy >= newEnergy && DPQueue[i].buffs >= attackMult && DPQueue[i].shields <= newShields) {
								insertElement = false;
								break;
							}
							i ++;
							if (i == DPQueue.length) {
								break;
							}
						}
						if (insertElement) {
							DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
						}
						// If move has chance of changing TTK, add that result
						if (changeTTKChance != 0) {
							DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
						}
					}

					// If move will debuff attack, calculate values when you stack two of them then throw
					if (poke.activeChargedMoves[n].selfDebuffing && poke.activeChargedMoves[n].buffs[0] < 0 && poke.activeChargedMoves[n].energy * 2 <= 100) {

						newTurn = Math.ceil((poke.activeChargedMoves[n].energy * 2 - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.turns;
						newEnergy = Math.floor(newTurn / poke.fastMove.turns) * poke.fastMove.energyGain + currState.energy - poke.activeChargedMoves[n].energy;

						// Calculate new health
						newOppHealth = currState.oppHealth - fastSimulatedDamage * (newTurn / poke.fastMove.turns);

						// Calculate shield scenarios
						if (currState.oppShields > 0) {
							newOppHealth = newOppHealth - 1;
						} else {
							newOppHealth = newOppHealth - moveDamage;
						}

						newTurn += currState.turn + 1

						i = 0;
						insertElement = true;
						if (DPQueue.length == 0) {
							DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
							// If move has chance of changing TTK, add that result
							if (changeTTKChance != 0) {
								DPQueue.unshift(new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
							}
						} else {
							while (DPQueue[i].turn < newTurn) {
								if (DPQueue[i].hp <= newOppHealth && DPQueue[i].energy >= newEnergy && DPQueue[i].buffs >= attackMult && DPQueue[i].shields <= newShields) {
									insertElement = false;
									break;
								}
								i ++;
								if (i == DPQueue.length) {
									break;
								}
							}
							if (insertElement) {
								DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), attackMult, currState.chance));
							}
							// If move has chance of changing TTK, add that result
							if (changeTTKChance != 0) {
								DPQueue.splice(i, 0, new BattleState(newEnergy, newOppHealth, newTurn, newShields, currState.moves.concat([poke.activeChargedMoves[n]]), possibleAttackMult, currState.chance * changeTTKChance));
							}
						}
					}
				}
			}
		}

		// Evaluate throwing strategy after finding optimal plan

		// Set our turnsToKO to our guaranteed KO turn
		if(stateList.length > 0){
			poke.turnsToKO = turns + stateList[stateList.length - 1].turn;
		} else{
			return;
		}

		// If opponent KOs before our guaranteed KO, go for the least risky plan that still KOs before opponent KOs us.
		var needsBoost = false;
		if (stateList.length == 1) {
			finalState = stateList[0];
		} else if (opponent.turnsToKO != -1 && poke.turnsToKO > opponent.turnsToKO) {

			var bestPlan = stateList[0];
			for (var i = 1; i < stateList.length; i++) {
				if (stateList[i].chance > bestPlan) {
					bestPlan = stateList[i];
				}
			}
			battle.logDecision(poke, " changes its plan because it needs the BOOST to win or debuff");
			finalState = bestPlan;

		} else {
			// We guaranteed KO before opponent or opponent hasn't evaluated their turnsToKO yet.
			finalState = stateList[stateList.length - 1];
		}


		// Return if plan is the farm down
		if (finalState.moves.length == 0) {

			if(! poke.getBoostMove()){
				battle.logDecision(poke, " wants to farm down");
				return;
			} else{
				finalState.moves.push(poke.getBoostMove());
				battle.logDecision(poke, " will force throw a boost move");
			}
		}

		// Find if there are any debuffing moves and the most expensive move in planned move list
		var debuffingMove = false;
		var mostExpensiveMove = finalState.moves[0];
		for (var moveInd = 0; moveInd < finalState.moves.length; moveInd++) {
			if (finalState.moves[moveInd].selfDebuffing) {
				debuffingMove = true;
			}

			if(finalState.moves[moveInd].energy > mostExpensiveMove.energy){
				mostExpensiveMove = finalState.moves[moveInd];
			}
		}

		// If bait shields, build up to most expensive charge move in planned move list
		if (poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			if ((poke.energy < poke.activeChargedMoves[1].energy)&&(poke.activeChargedMoves[1].dpe > finalState.moves[0].dpe)) {
				var bait = true;

				// Don't go for baits if you have an effective self buffing move
				if((poke.activeChargedMoves[1].dpe / poke.activeChargedMoves[0].dpe <= 1.5)&&(poke.activeChargedMoves[0].selfBuffing)){
					bait = false;
				}


				if(bait){
					battle.logDecision(poke, " doesn't use " + finalState.moves[0].name + " because it wants to bait");
					return;
				}
			}
		}

		// Don't bait if the opponent won't shield
		if (poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			var dpeRatio = (poke.activeChargedMoves[1].damage / poke.activeChargedMoves[1].energy) / (finalState.moves[0].damage / finalState.moves[0].energy);

			if ((poke.energy >= poke.activeChargedMoves[1].energy)&&(dpeRatio > 1.5)) {
				if(! ActionLogic.wouldShield(battle, poke, opponent, poke.activeChargedMoves[1]).value){
					finalState.moves[0] = poke.activeChargedMoves[1];
				}
			}
		}

		// If pokemon needs boost, we cannot reorder and no moves both buff and debuff
		if (!needsBoost) {
			// If not baiting shields or shields are down and no moves debuff, throw most damaging move first
			if (!poke.baitShields || (opponent.shields == 0 && debuffingMove == false)) {
				finalState.moves.sort(function(a, b) {
					var moveDamage1 = DamageCalculator.damage(poke, opponent, a);
					var moveDamage2 = DamageCalculator.damage(poke, opponent, b);
					return moveDamage2 - moveDamage1;
				})
			}
		}

		// If shields are up, prefer low energy moves that are more efficient
		if (opponent.shields > 0 && poke.activeChargedMoves.length > 1 && poke.activeChargedMoves[0].energy <= finalState.moves[0].energy && poke.activeChargedMoves[0].dpe > finalState.moves[0].dpe && (! poke.activeChargedMoves[0].selfDebuffing)) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// If shields are down, prefer non-debuffing moves if both sides have significant HP remaining
		if (opponent.shields == 0 && poke.activeChargedMoves.length > 1 && finalState.moves[0].selfDebuffing && finalState.moves[0].energy > 50 && (poke.hp / poke.stats.hp) > .5 && (finalState.moves[0].damage / opponent.hp) < .8) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// Bandaid to force more efficient move of the same energy
		if (poke.activeChargedMoves.length > 1 && poke.activeChargedMoves[0].energy == finalState.moves[0].energy && poke.activeChargedMoves[0].dpe > finalState.moves[0].dpe && (! poke.activeChargedMoves[0].selfDebuffing)) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// Bandaid to force more efficient move of the similar energy if chosen move is self debuffing
		if (poke.activeChargedMoves.length > 1 && poke.activeChargedMoves[0].energy - 10 <= finalState.moves[0].energy && poke.activeChargedMoves[0].dpe > finalState.moves[0].dpe && finalState.moves[0].selfDebuffing && (! poke.activeChargedMoves[0].selfDebuffing)) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// Bandaid to force more efficient move of the similar energy if one move is self buffing
		if (poke.activeChargedMoves.length > 1 && poke.activeChargedMoves[0].energy - finalState.moves[0].energy <= 5 && poke.activeChargedMoves[0].dpe > finalState.moves[0].dpe && poke.activeChargedMoves[0].selfBuffing) {
			finalState.moves[0] = poke.activeChargedMoves[0];
		}

		// Don't bait with self debuffing moves
		if (poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			if ((poke.energy >= poke.activeChargedMoves[1].energy)&&(poke.activeChargedMoves[1].dpe > finalState.moves[0].dpe)) {
				if((finalState.moves[0].selfDebuffing)&&(! poke.activeChargedMoves[1].selfDebuffing)){
					finalState.moves[0] = poke.activeChargedMoves[1];
				}
			}
		}

		// While shields are up, prefer close non debuffing moves in scenarios where debuffing move won't KO

		if (opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			// Is one self debuffing and the other non self debuffing, and will the first Charged Move
			if((poke.activeChargedMoves[0].selfDebuffing)&&(! poke.activeChargedMoves[1].selfBuffing)){
				// Is the Pokemon baiting or will the self debuffing move not come close to a KO?
				if(poke.baitShields || (opponent.hp - poke.activeChargedMoves[0].damage > 10)){
					// Is the second move close in energy and dpe?
					if((poke.activeChargedMoves[1].energy - poke.activeChargedMoves[0].energy <= 10) && (poke.activeChargedMoves[1].dpe / poke.activeChargedMoves[0].dpe > 0.7)){
						finalState.moves[0] = poke.activeChargedMoves[1];
					}
				}
			}
		}

		// Defer self debuffing moves until after survivable Charged Moves
		if(finalState.moves[0].selfDebuffing && poke.shields == 0 && poke.energy < 100 && opponent.bestChargedMove){
			if((opponent.energy >= opponent.bestChargedMove.energy)&&(! ActionLogic.wouldShield(battle, opponent, poke, opponent.bestChargedMove).value)&&(! poke.activeChargedMoves[0].selfBuffing)){
				battle.logDecision(poke, " is deferring its self debuffing move until after the opponent fires its move");
				return;
			}
		}

		// If move is self debuffing and doesn't KO, try to stack as much as you can
		if (finalState.moves[0].selfDebuffing) {
			//var targetEnergy = poke.energy + (Math.round( (100 - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.energyGain);
			let targetEnergy = Math.floor(100 / finalState.moves[0].energy) * finalState.moves[0].energy;

			if (poke.energy < targetEnergy) {
				var moveDamage = DamageCalculator.damage(poke, opponent, finalState.moves[0]);
				if ((opponent.hp > moveDamage || opponent.shields != 0) && (poke.hp > opponent.fastMove.damage * 2 || opponent.fastMove.cooldown - poke.fastMove.cooldown > 500)){
					battle.logDecision(poke, " doesn't use " + finalState.moves[0].name + " because it wants to minimize time debuffed and it can stack the move " + Math.floor(100 / finalState.moves[0].energy) + " times");
					return;
				}
			} else if(poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves[0].energy - finalState.moves[0].energy <= 10 && ! poke.activeChargedMoves[0].selfDebuffing){
				// Use the lower energy move if it's a boosting move or if the opponent would shield the bigger move
				if(poke.activeChargedMoves[0].selfBuffing || ActionLogic.wouldShield(battle, poke, opponent, finalState.moves[0]).value){
					finalState.moves[0] = poke.activeChargedMoves[0];
				}
			}
		}


		// Use the final move, or a Fast Move if not enough energy
		if (poke.energy >= finalState.moves[0].energy) {
			if (finalState.moves.length > 1) {
				battle.logDecision(poke, " uses " + finalState.moves[0].name + " because it thinks that using " + (finalState.moves.length - 1) + " moves afterwards is the best plan.");

				// Debugging Log
				for (var i = 1; i < finalState.moves.length; i++) {
					battle.logDecision(poke, " wants to use " + finalState.moves[i].name + " after it uses " + finalState.moves[i - 1].name);
				}

			} else {
				battle.logDecision(poke, " uses " + finalState.moves[0].name + " at turn " + turns + " because it KO's or it wants to farm down afterwards");
			}

		} else {
			battle.logDecision(poke, " uses a fast move because it has no energy for " + finalState.moves[0].name);
			return;
		}

		action = new TimelineAction(
			"charged",
			poke.index,
			turns,
			poke.chargedMoves.indexOf(finalState.moves[0]),
			{shielded: false, buffs: false, priority: poke.priority});

		return action;
	}


	// Select a randomized action for this turn
	static decideRandomAction(battle, poke, opponent){
		let fastMoveWeight = 10;
		let hasKnockoutMove = false;
		let actionOptions = [];
		let chargedMoveValues = [];
		let turns = battle.getTurns();

		// Evaluate when to randomly use Charged Moves
		for(var i = 0; i < poke.activeChargedMoves.length; i++){
			if(poke.energy >= poke.activeChargedMoves[i].energy){
				poke.activeChargedMoves[i].damage = DamageCalculator.damage(poke, opponent, poke.activeChargedMoves[i]);
				let chargedMoveWeight = Math.round(poke.energy / 4);
				let damage = poke.activeChargedMoves[i].damage;

				if(poke.energy < poke.bestChargedMove.energy){
					chargedMoveWeight = Math.round(poke.energy / 50);
				}

				if(hasKnockoutMove){
					chargedMoveWeight = 0;
				}

				// Go for the KO if it's there
				if((damage >= opponent.hp)&&(opponent.shields == 0)){
					fastMoveWeight = 0;
					hasKnockoutMove = true;
				}

				// Don't use Charged Move if it's strictly worse than the other option
				if((i > 0)&&(poke.activeChargedMoves[i].damage < poke.activeChargedMoves[0].damage)&&(poke.activeChargedMoves[i].energy >= poke.activeChargedMoves[0].energy)&&(! poke.activeChargedMoves[i].selfBuffing)){
					chargedMoveWeight = 0;
				}

				// Use Charged Moves if capped on energy
				if(poke.energy == 100){
					chargedMoveWeight *= 2;
				}

				chargedMoveValues.push({move: poke.activeChargedMoves[i], damage: damage, weight: chargedMoveWeight, index: i});
			}
		}

		if(chargedMoveValues.length > 1){
			// If shields are up and both moves would KO, prefer non debuffing moves
			if((chargedMoveValues[0].damage >= opponent.hp)&&(chargedMoveValues[1].damage >= opponent.hp)&&(opponent.shields > 0)){
				if((chargedMoveValues[0].move.selfDebuffing)&&(! chargedMoveValues[1].move.selfDebuffing)&&(chargedMoveValues[1].move.energy <= chargedMoveValues[0].move.energy)){
					chargedMoveValues[0].weight = 0;
				} else if((chargedMoveValues[1].move.selfDebuffing)&&(! chargedMoveValues[0].move.selfDebuffing)&&(chargedMoveValues[0].move.energy <= chargedMoveValues[1].move.energy)){
					chargedMoveValues[1].weight = 0;
				}
			}
		}

		for(var i = 0; i < chargedMoveValues.length; i++){
			actionOptions.push(new DecisionOption("CHARGED_MOVE_"+chargedMoveValues[i].index, chargedMoveValues[i].weight));
		}

		actionOptions.push(new DecisionOption("FAST_MOVE", fastMoveWeight));

		let actionType = ActionLogic.chooseOption(actionOptions);
		let action;

		switch(actionType.name){
			case "FAST_MOVE":
				return;
				break;

			case "CHARGED_MOVE_0":
				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(poke.activeChargedMoves[0]),
					{shielded: false, buffs: false, priority: poke.priority});
				break;

			case "CHARGED_MOVE_1":
				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(poke.activeChargedMoves[1]),
					{shielded: false, buffs: false, priority: poke.priority});
				break;
		}

		return action;
	}

	// Choose an option from an array
	static chooseOption(options){
		var optionBucket = [];

		// Put all the options in bucket, multiple times for its weight value

		for(var i = 0; i < options.length; i++){
			for(var n = 0; n < options[i].weight; n++){
				optionBucket.push(options[i].name);
			}
		}

		// If all options have 0 weight, just toss the first option in there

		if(optionBucket.length == 0){
			optionBucket.push(options[0].name);
		}

		var index = Math.floor(Math.random() * optionBucket.length);
		var optionName = optionBucket[index];
		var option = options.filter(obj => {
			return obj.name === optionName
		})[0];

		return option;
	}

	// Returns a boolean for default sims, and weights for randomized sims to determine if a Pokemon would shield a Charged Move

	static wouldShield(battle, attacker, defender, move){
		var useShield = false;
		var shieldWeight = 1;
		var noShieldWeight = 2; // Used for randomized shielding decisions
		var damage = DamageCalculator.damage(attacker, defender, move);
		move.damage = damage;

		var postMoveHP = defender.hp - damage; // How much HP will be left after the attack
		// Capture current buffs for pokemon whose buffs will change
		var currentBuffs;
		var moveBuffs = [0, 0];

		if(move.buffs){
			moveBuffs = move.buffs;
		}

		if (moveBuffs[0] > 0) {
			currentBuffs = [attacker.statBuffs[0], attacker.statBuffs[1]];
			attacker.applyStatBuffs(moveBuffs);
		} else {
			currentBuffs = [defender.statBuffs[0], defender.statBuffs[1]];
			defender.applyStatBuffs(moveBuffs);
		}

		var fastDamage = DamageCalculator.damage(attacker, defender, attacker.fastMove);

		// Determine how much damage will be dealt per cycle to see if the defender will survive to shield the next cycle

		var fastAttacks = Math.ceil( (move.energy - Math.max(attacker.energy - move.energy, 0)) / attacker.fastMove.energyGain) + 1; // Give some margin for error here
		var fastAttackDamage = fastAttacks * fastDamage;
		var cycleDamage = (fastAttackDamage + 1) * defender.shields;

		if(postMoveHP <= cycleDamage){
			useShield = true;
			shieldWeight = 2;
		}

		// Reset buffs to original
		if (moveBuffs[0] > 0) {
			attacker.statBuffs = [currentBuffs[0], currentBuffs[1]];
		} else {
			defender.statBuffs = [currentBuffs[0], currentBuffs[1]];
		}

		// If the defender can't afford to let a charged move connect, block
		var fastDPT = fastDamage / attacker.fastMove.turns;

		for (var i = 0; i < attacker.chargedMoves.length; i++){
			var chargedMove = attacker.chargedMoves[i];

			if(attacker.energy + chargedMove.energy >= chargedMove.energy){
				var chargedDamage = DamageCalculator.damage(attacker, defender, chargedMove);

				if((chargedDamage >= defender.hp / 1.4)&&(fastDPT > 1.5)){
					useShield = true;
					shieldWeight = 4
				}

				if(chargedDamage >= defender.hp - cycleDamage){
					useShield = true;
					shieldWeight = 4
				}

				if((chargedDamage >= defender.hp / 2)&&(fastDPT > 2)){
					shieldWeight = 12
				}
			}
		}

		// Shield the first in a series of Attack debuffing moves like Superpower, if they would do major damage
		if(move.selfAttackDebuffing && (move.damage / defender.hp > 0.55)){
			useShield = true;
			shieldWeight = 4;
		}

		// When a Pokemon is set to always bait, always return true for this value
		if((battle.getMode() == "simulate")&&(attacker.baitShields == 2)){
			useShield = true;
		}

		return {
			value: useShield,
			shieldWeight: shieldWeight,
			noShieldWeight: noShieldWeight
		};
	}
}

// State used for DP in battle simulation
class BattleState{
	constructor(pokeEnergy, opponentHealth, currentTurn, opponentShields, usedMoves, attackBuff, probability){
		this.energy = pokeEnergy;
		this.oppHealth = opponentHealth;
		this.turn = currentTurn;
		this.oppShields = opponentShields;
		this.moves = usedMoves;
		this.buffs = attackBuff;
		this.chance = probability;
	}
}
