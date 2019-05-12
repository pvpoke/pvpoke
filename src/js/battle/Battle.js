// JavaScript Document

function Battle(){
	var gm = GameMaster.getInstance();
	var interface;

	var self = this;
	var pokemon = [null, null];
	var cp = 1500;
	var cup = {name: "all", types: []}; // List of allowed types

	var decisionLog = []; // For debugging
	var debug = false;

	var actions = []; // User defined actions
	var previousTurnActions = [] // Actions from the previous turn
	var sandbox = false; // Is this automated or following user instructions?

	// Battle properties

	var timeline = [];
	var time;
	var turns;

	var duration = 0;
	var battleRatings = [];
	var turnsToWin = [0, 0];
	var winner;

	var battleEndMode = "first"; // first - end the battle on the first faint, both - end the battle once both Pokemon faint

	var roundChargedMoveUsed;
	var roundShieldUsed;

	var usePriority = false;

	var startingValues = [
		{hp: 0, energy: 0},
		{hp: 0, energy: 0}
	];

	// Buff parameters

	var buffChanceModifier = -1; // -1 prevents buffs, 1 guarantees buffs

	this.init = function(){
		interface = InterfaceMaster.getInterface();
	}

	this.setNewPokemon = function(poke, index, initialize){
		initialize = typeof initialize !== 'undefined' ? initialize : true;

		poke.setBattle(self);

		if(initialize){
			poke.initialize(cp);
		}

		poke.index = index;

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

	// Return the starting values of the battle.

	this.getStartingValues = function(){
		return startingValues;
	}

	// Set the modifier for buff apply chance, -1 prevents buffs and 1 guarantees them

	this.setBuffChanceModifier = function(value){
		buffChanceModifier = value;
	}

	// Calculate damage given an attacker, defender, and move, requires move to be initialized first

	this.calculateDamage = function(attacker, defender, move){

		var bonusMultiplier = 1.3;
		var effectiveness = defender.typeEffectiveness[move.type];


		var damage = Math.floor(move.power * move.stab * ( attacker.getEffectiveStat(0) / defender.getEffectiveStat(1)) * effectiveness * 0.5 * bonusMultiplier) + 1;

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

			startingValues[i].hp = pokemon[i].hp;
			startingValues[i].energy = pokemon[i].energy;
		}

		// Determine if charged move priority should be used

		if(pokemon[0].priority != pokemon[1].priority){
			usePriority = true;
		}

		time = 0;
		turns = 0;
		turnsToWin = [0, 0];
		timeline = [];

		var deltaTime = 500;

		// Main battle loop

		var continueBattle = true;

		while(continueBattle){

			// For display purposes, need to track whether a Pokemon has used a charged move or shield each round

			roundChargedMoveUsed = 0;
			roundShieldUsed = false;

			// Hold the actions for both Pokemon this turn

			var turnActions = [];

			// Reduce cooldown for both POkemon

			for(var i = 0; i < 2; i++){
				var poke = pokemon[i];
				poke.cooldown = Math.max(0, poke.cooldown - deltaTime); // Reduce cooldown
			}

			turns++;

			// Determine actions for both Pokemon

			for(var i = 0; i < 2; i++){

				var poke = pokemon[i];
				var opponent = this.getOpponent(i);

				var currentShields = poke.shields + opponent.shields;

				// If Pokemon can take action

				chargedMoveUsed = false; // Flag so Pokemon only uses one Charged Move per round

				if(poke.cooldown == 0){
					var action = null;

					if(! sandbox){
						action = self.decideAction(poke, opponent);
					} else{
						// Search for a charged move action

						for(var n = 0; n < actions.length; n++){
							var a = actions[n];

							if((a.actor == i)&&(a.turn == turns)&&(poke.chargedMoves.length > a.value)){
								action = a;
							}
						}
					}

					// If no other action set, use a fast move

					if(! action){
						action = new TimelineAction("fast", i, turns, 0, {priority: poke.priority});
					}

					turnActions.push(action);
				}

				if(poke.shields + opponent.shields < currentShields){
					roundShieldUsed = true;
				}
			}

			// Sort actions by priority

			if(turnActions.length > 1){
				if(turnActions[1].settings.priority > turnActions[0].settings.priority){
					var firstAction = turnActions[0];
					turnActions.splice(0, 1);
					turnActions.push(firstAction);
				}
			}

			// Process actions on this turn

			for(var n = 0; n < turnActions.length; n++){
				var action = turnActions[n];
				var poke = pokemon[action.actor];
				var opponent = pokemon[ (action.actor == 0) ? 1 : 0 ];

				var chargedMoveThisTurn = false;
				var priorityChargedMoveThisTurn = false;

				for(var j = 0; j < turnActions.length; j++){
					var a = turnActions[j];

					if(a.type == "charged"){
						chargedMoveThisTurn = true;

						if(a.settings.priority > 0){
							priorityChargedMoveThisTurn = true;
						}
					}
				}

				switch(action.type){

					case "fast":
						action.valid = true;

						// Check for a charged move last turn and this turn
						var chargedMoveLastTurn = false;

						for(var j = 0; j < previousTurnActions.length; j++){
							var a = previousTurnActions[j];

							if(a.type == "charged"){
								chargedMoveLastTurn = true;
							}
						}


						if((chargedMoveLastTurn)&&(chargedMoveThisTurn > 0)){
							action.valid = false;
						}
						break;

					case "charged":
						var move = poke.chargedMoves[action.value];

						if(poke.energy >= move.energy){
							action.valid = true;
						}

						// Check if knocked out from a priority move

						if((usePriority)&&(poke.hp <= 0)&&(poke.priority == 0)&&(priorityChargedMoveThisTurn)){
							action.valid = false;
						}
						break;
				}

				self.processAction(action, poke, opponent);
			}

			// Set previous turn Actions

			previousTurnActions = turnActions;

			if(roundChargedMoveUsed == 0){
				time += deltaTime;
			} else{
				// This is for display purposes only

				if(roundShieldUsed){
					time += 7500 * (roundChargedMoveUsed-1);
				} else if((! usePriority)||((pokemon[0].hp > 0)&&(pokemon[1].hp > 0))){
					time += 7500;
				}

			}

			duration = time;

			// Check for faint
			for(var i = 0; i < 2; i++){
				var poke = pokemon[i];

				if(poke.hp <= 0){
					timeline.push(new TimelineEvent("faint", "Faint", poke.index, time, turns));

					var opponentIndex = (i == 0) ? 0 : 1;

					if(turnsToWin[opponentIndex] == 0){
						turnsToWin[opponentIndex] = turns;
					}
				}

				// Reset after a charged move

				if(roundChargedMoveUsed){
					poke.cooldown = 0;
					poke.damageWindow = 0;
				}
			}

			continueBattle = ((pokemon[0].hp > 0) && (pokemon[1].hp > 0));

			if(battleEndMode == "both"){
				continueBattle = ((pokemon[0].hp > 0) || (pokemon[1].hp > 0));
			}

			// Check for time expired, this will also prevent accidental infinite loops
			if(time > 240000){
				continueBattle = false;
			}

		}

		battleRatings = [pokemon[0].getBattleRating(), pokemon[1].getBattleRating()];

		// Set winner

		if(battleRatings[0] > battleRatings[1]){
			winner = {
				pokemon: pokemon[0],
				rating: battleRatings[0],
				hp: pokemon[0].hp,
				energy: pokemon[0].energy,
				buffs: [pokemon[0].statBuffs[0], pokemon[0].statBuffs[1]],
				shields: pokemon[0].shields
			};
		} else if(battleRatings[1] > battleRatings[0]){
			winner = {
				pokemon: pokemon[1],
				rating: battleRatings[1],
				hp: pokemon[1].hp,
				energy: pokemon[1].energy,
				buffs: [pokemon[1].statBuffs[0], pokemon[1].statBuffs[1]],
				shields: pokemon[0].shields
			};
		} else if(battleRatings[1] == battleRatings[0]){
			winner = {
				pokemon: false,
				rating: battleRatings[0]
			};
		}

		return timeline;
	}

	// Run AI decision making to determine battle action this turn, and return the resulting action

	this.decideAction = function(poke, opponent){

		// Use primary charged move if available

		if((poke.bestChargedMove) && (poke.energy >= poke.bestChargedMove.energy)){

			// Use maximum number of Fast Moves before opponent can act

			var useChargedMove = true;

			self.logDecision(turns, poke, "'s best charged move is charged (" + poke.bestChargedMove.name + ")");

			if((opponent.cooldown == 0)||(opponent.cooldown == opponent.fastMove.cooldown)){

				if((opponent.fastMove.cooldown > poke.fastMove.cooldown)){
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

			if(opponent.shields > 0){

			   if(opponent.hp <= (poke.fastMove.damage * (opponent.fastMove.cooldown / poke.fastMove.cooldown))){
					useChargedMove = false;

					self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because opponent has shields and fast moves will knock them out before their cooldown completes");
				}

				// Don't use best charged move if opponent has shields and a cheaper move is charged

				if(poke.baitShields){

					for(var n = 0; n < poke.chargedMoves.length; n++){
						if((poke.energy >= poke.chargedMoves[n].energy) && (poke.chargedMoves[n].energy < poke.bestChargedMove.energy)){
							useChargedMove = false;

							self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because it has a cheaper move to remove shields");
						}
					}
				}
			}

			if(useChargedMove){
				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(poke.bestChargedMove),
					{shielded: false, buffs: false, priority: poke.priority});

				chargedMoveUsed = true;

				return action;
			}

		}

		for(var n = 0; n < poke.activeChargedMoves.length; n++){
			var move = poke.activeChargedMoves[n];
			var moveIndex = poke.chargedMoves.indexOf(move);

			if((poke.energy >= move.energy)&&(!chargedMoveUsed)){
				move.damage = self.calculateDamage(poke, opponent, move);
				self.logDecision(turns, poke, " has " + move.name + " charged");

				// Use charged move if it would KO the opponent

				if((move.damage >= opponent.hp) && (opponent.hp > poke.fastMove.damage) && (opponent.shields == 0) && (!chargedMoveUsed)){
					action = new TimelineAction(
						"charged",
						poke.index,
						turns,
						moveIndex,
						{shielded: false, buffs: false, priority: poke.priority});

					chargedMoveUsed = true;
					self.logDecision(turns, poke, " will knock out opponent with " + move.name);
					return action;
				}

				// Use charged move if the opponent has a shield

				if((opponent.shields > 0)  && (!chargedMoveUsed) && ((move == poke.bestChargedMove)||( (poke.baitShields) && (poke.energy >= poke.bestChargedMove.energy) ))){

					// Don't use a charged move if a fast move will result in a KO

					if((opponent.hp > poke.fastMove.damage)&&(opponent.hp > (poke.fastMove.damage *(opponent.fastMove.cooldown / poke.fastMove.cooldown)))){
						self.logDecision(turns, poke, " wants to remove shields with " + move.name + " and opponent won't faint from fast move damage before next cooldown");

						if( ((opponent.cooldown == 0)||(opponent.cooldown == opponent.fastMove.cooldown)) && (opponent.fastMove.cooldown > poke.fastMove.cooldown) ){
							self.logDecision(turns, poke, " doesn't use " + move.name + " because opponent isn't on cooldown and its fast move is faster");
						} else{
							action = new TimelineAction(
								"charged",
								poke.index,
								turns,
								moveIndex,
								{shielded: false, buffs: false, priority:poke.priority});

							chargedMoveUsed = true;
							return action;
						}
					}
				}

				// Use charged move if about to be KO'd

				var nearDeath = false;

				// Will this Pokemon be knocked out this round?

				if(opponent.cooldown == 0){
					// Will a Fast Move knock it out?
					if(poke.hp <= opponent.fastMove.damage){
						nearDeath = true;

						self.logDecision(turns, poke, " will be knocked out by opponent's fast move this turn");
					}

					// Will a Charged Move knock it out?
					if(poke.shields == 0){
						for(var j = 0; j < opponent.chargedMoves.length; j++){

							if((opponent.energy >= opponent.chargedMoves[j].energy) && (poke.hp <= self.calculateDamage(opponent, poke, opponent.chargedMoves[j]))){
								nearDeath = true;

								self.logDecision(turns, poke, " doesn't have shields and will by knocked out by opponent's " + opponent.chargedMoves[j].name + " this turn");
							}
						}
					}
				}

				// If this Pokemon uses a Fast Move, will it be knocked out while on cooldown?

				if( (((opponent.cooldown > 0) && (opponent.cooldown < poke.fastMove.cooldown)) || ((opponent.cooldown == 0) && (opponent.fastMove.cooldown < poke.fastMove.cooldown))) && (roundChargedMoveUsed == 0)){

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
						var futureEffectiveEnergy = opponent.energy + (opponent.fastMove.energyGain * (futureActions-1));
						var futureEffectiveHP = poke.hp - ((futureActions-1) * opponent.fastMove.damage);

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

				// Don't use this Charged Move is a better one is available

				if((poke.bestChargedMove)&&(poke.energy >= poke.bestChargedMove.energy)&&(move.damage < poke.bestChargedMove.damage)){
					nearDeath = false;

					self.logDecision(turns, poke, " doesn't use " + move.name + " because a better move is available");
				}

				// Don't process this if battle continues until both Pokemon faint

				if(battleEndMode == "both"){
					nearDeath = false;
				}

				if((nearDeath)&&(!chargedMoveUsed)){
					action = new TimelineAction(
						"charged",
						poke.index,
						turns,
						moveIndex,
						{shielded: false, buffs: false, priority: poke.priority});

					chargedMoveUsed = true;
					return action;
				}
			}
		}

	}

	// Process and apply a set battle action

	this.processAction = function(action, poke, opponent){

		// Don't run this action if it's invalidated

		if(! action.valid){
			return false;
		}

		switch(action.type){

			case "fast":
				var move = poke.fastMove;
				self.useMove(poke, opponent, move);
				break;

			case "charged":
				var move = poke.chargedMoves[action.value];

				// Validate this move can be used

				if(poke.energy >= move.energy){
					self.useMove(poke, opponent, move, action.settings.shielded, action.settings.buffs);

					chargedMoveUsed = true;
					roundChargedMoveUsed++;
				}
				break;
		}
	}

	// Use a move on an opposing Pokemon and produce a Timeline Event

	this.useMove = function(attacker, defender, move, forceShields, forceBuff){

		var type = "fast " + move.type;
		var damage = self.calculateDamage(attacker, defender, move);
		move.damage = damage;

		var displayTime = time;
		var shieldBuffModifier = 0;

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

			if( ((sandbox) && (forceShields) && (defender.shields > 0)) || ((! sandbox) && (defender.shields > 0)) ){
				var useShield = true;

				// For PuP and similar moves, don't shield if it's survivable

				if((! sandbox)&&(move.buffs)&&(move.buffs[0] > 0)&&(move.buffApplyChance == 1)){
					useShield = false;

					var postMoveHP = defender.hp - damage; // How much HP will be left after the attack
					var currentBuffs = [attacker.statBuffs[0], attacker.statBuffs[1]]; // Capture this to reset later
					attacker.applyStatBuffs(move.buffs);

					var fastDamage = self.calculateDamage(attacker, defender, attacker.fastMove);

					// Determine how much damage will be dealt per cycle to see if the defender will survive to shield the next cycle

					for (var i = 0; i < attacker.chargedMoves.length; i++){
						var chargedMove = attacker.chargedMoves[i];
						var fastAttacks = Math.ceil(Math.max(chargedMove.energy - attacker.energy, 0) / attacker.fastMove.energyGain) + 2; // Give some margin for error here
						var fastAttackDamage = fastAttacks * fastDamage;
						var chargedDamage = self.calculateDamage(attacker, defender, chargedMove);
						var cycleDamage = fastAttackDamage + 1;

						if(postMoveHP <= cycleDamage){
							useShield = true;
						}
					}

					attacker.statBuffs = [currentBuffs[0], currentBuffs[1]]; // Reset to original

					// If the defender can't afford to let a charged move connect, block

					for (var i = 0; i < attacker.chargedMoves.length; i++){
						var chargedMove = attacker.chargedMoves[i];
						var chargedDamage = self.calculateDamage(attacker, defender, chargedMove);

						if(chargedDamage >= defender.hp / 2){
							useShield = true;
						}
					}
				}

				if(useShield){

					timeline.push(new TimelineEvent("shield", "Shield", defender.index, time+5500, turns, [damage-1]));
					damage = 1;
					defender.shields--;
					roundShieldUsed = true;

					// Don't debuff if it shields

					if((move.buffs)&&(move.buffTarget == "opponent")){
						shieldBuffModifier = 0;
					}

					self.logDecision(turns, defender, " blocks with a shield");

					// If a shield has already been used, add time so events don't visually overlap

					if(roundChargedMoveUsed == 0){
						time+=7500;
					}

				} else{

					self.logDecision(turns, defender, " doesn't shield because it can withstand the attack and is saving shields for later, boosted attacks");
				}
			}

			if((usePriority)&&(roundChargedMoveUsed==0)&&(! useShield)){
				time+=7500;
			}

		} else{
			// If Fast Move

			attacker.energy += attacker.fastMove.energyGain;
			attacker.cooldown = move.cooldown;

			if(attacker.energy > 100){
				attacker.energy = 100;
			}
		}

		defender.hp = Math.max(0, defender.hp-damage);

		// Adjust display time so events don't visually overlap
		// This was really hard for my little brain to figure out so like really don't touch it

		if(move.energy > 0){
			displayTime += 5500;
		} else if(roundShieldUsed){
			displayTime -= 7500;
		}

		// Apply move buffs and debuffs

		var buffApplied = false;

		if(move.buffs){

			// Roll against the buff chance to see if it applies

			var buffRoll = Math.random() + buffChanceModifier + shieldBuffModifier; // Totally not Really Random but just to get off the ground for now

			if(forceBuff){
				buffRoll += 1;
			}

			if((move.buffApplyChance == 1)&&(! sandbox)){
				buffRoll += 1; // Force guaranteed buffs even when they're disabled
			}

			if(buffRoll > 1 - move.buffApplyChance){

				var buffTarget = attacker;

				if(move.buffTarget == "opponent"){
					buffTarget = defender;
				}

				buffTarget.applyStatBuffs(move.buffs);

				buffApplied = true;

				var buffType = "debuff";

				if((move.buffs[0] > 0) || (move.buffs[1] > 0)){
					buffType = "buff";
				}

				type += " " + buffType;

			}

		}

		// Set energy value for TimelineEvent

		var energyValue = move.energyGain;

		if(move.energy > 0){
			energyValue = -move.energy;
		}

		if(! buffApplied){
			timeline.push(new TimelineEvent(type, move.name, attacker.index, displayTime, turns, [damage, energyValue]));
		} else{
			var buffStr = "";

			if(move.buffs[0] > 0){
				buffStr += "+";
			}

			buffStr += move.buffs[0] + " Attack<br>";

			if(move.buffs[1] > 0){
				buffStr += "+";
			}

			buffStr += move.buffs[1] + " Defense";

			timeline.push(new TimelineEvent(type, move.name, attacker.index, displayTime, turns, [damage, energyValue, buffStr]));
		}


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
		return winner;
	}

	// Return battle rating results

	this.getBattleRatings = function(){
		return battleRatings;
	}

	// Return turns to win

	this.getTurnsToWin = function(){
		return turnsToWin;
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

	// Convert timeine to user-editable actions

	this.convertTimelineToActions = function(){
		var actions = [];

		// Iterate through timeline events

		for(var i = 0; i < timeline.length; i++){
			var event = timeline[i];

			// Fast moves are the default so only process charged moves

			if(event.type.indexOf("charged") > -1){

				// Determine which attack is being used

				var index = 0;

				for(var n = 0; n < pokemon[event.actor].chargedMoves.length; n++){
					if(pokemon[event.actor].chargedMoves[n].name == event.name){
						index = n;
					}
				}

				// Is the very previous event a shield event?

				var shielded = false;

				if((timeline[i-1])&&(timeline[i-1].type == "shield")&&(timeline[i-1].actor != event.actor)){
					shielded = true;
				}

				var buffs = (event.values[2] !== undefined); // Check to see if any buff or debuff values are associated with this event

				actions.push(new TimelineAction(
					"charged",
					event.actor,
					event.turn,
					index,
					{
						shielded: shielded,
						buffs: buffs,
						priority: pokemon[event.actor].priority
					}
				));
			}
		}

		return actions;
	}

	// Set an array of user-defined actions to be processed by the simulator

	this.setActions = function(arr){
		actions = arr;

		// Reset action validation

		for(var i = 0; i < actions.length; i++){
			actions[i].valid = false;
		}
	}

	// Return actions

	this.getActions = function(){
		return actions;
	}

	// Set whether or not the simulator will follow user input

	this.setSandboxMode = function(val){
		sandbox = val;

		if(val){
			actions = self.convertTimelineToActions();
		}
	}

	// Override another Pokemon's priority, used to remove priority from one Pokemon when it is given to another

	this.overridePriority = function(index, val){
		if(pokemon.length > index){
			pokemon[index].priority = val;
		}
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
