// JavaScript Document

function Battle(){
	var gm = GameMaster.getInstance();
	var interface;

	var self = this;
	var pokemon = [null, null];
	var players = [];
	var cp = 1500;
	var cup = {name: "all", include: [], exclude: []}; // List of allowed types

	var decisionLog = []; // For debugging
	var debug = false;

	var actions = []; // User defined actions
	var previousTurnActions = [] // Actions from the previous turn
	var turnMessages = []; // Array of messages to be displayed by the emulator for specific Pokemon
	var turnAnimations = []; // Animations to be displayed by the front end this turn
	var turnActions = []; // Actions to be performed this turn
	var queuedActions = []; // Input registered from previous turns to be processed on future turns
	var sandbox = false; // Is this automated or following user instructions?
	var mode = "simulate"; // Simulate or emulate?

	// Battle properties

	var timeline = [];
	var time;
	var turns;
	var lastProcessedTurn = 0; // Preserve the turn number so Pokemon don't act twice during Charged Move sequence
	var deltaTime = 500;

	var duration = 0;
	var battleRatings = [];
	var turnsToWin = [0, 0];
	var winner;

	var battleEndMode = "first"; // first - end the battle on the first faint, both - end the battle once both Pokemon faint
	var phase = "neutral";
	var phaseProps; // A collection of properties associated with the current phase
	var phaseTimeout; // Used to trigger the end of certain phases like charging up and switching
	var mainLoopInterval;
	var isPaused = false; // A flag for whether or not to pause the battle
	var sixtySecondMarked = false; // Flag for if the 60 second marker has been displayed yet in the timeline

	var roundChargedMoveUsed;
	var roundChargedMovesInitiated; // used in decision making
	var roundShieldUsed;

	var chargedMinigameTime = 10000;

	var usePriority = false;

	var chargeAmount = 0; // Multiplier used in emulated battles
	var playerUseShield = false; // Flag for a player to use an available shield in emulated battles

	var startingValues = [
		{hp: 0, energy: 0},
		{hp: 0, energy: 0}
	];

	// Buff parameters

	var buffChanceModifier = -1; // -1 prevents buffs, 1 guarantees buffs

	// Callback for inteface to updated

	var updateCallback;

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

		// Set shields for corresponding player

		if(mode == "emulate"){

			poke.shields = players[index].getShields();
			poke.startingShields = players[index].getShields();
			poke.priority = players[index].getPriority();

			// Evaluate AI
			if((pokemon[0])&&(pokemon[1])){
				for(var i = 0; i < pokemon.length; i++){
					pokemon[i].resetMoves();

					if(players[i].getAI()){
						players[i].getAI().evaluateMatchup(turns, pokemon[i], self.getOpponent(i), players[(i == 0) ? 1 : 0]);
					}
				}
			}
		}
	}

	this.getPokemon = function(){
		return pokemon;
	}

	// This is used after team rankings so Pokemon don't auto-select moves based on the last simulated battle

	this.clearPokemon = function(){
		pokemon = [null, null];
	}

	// Set the active players

	this.setPlayers = function(arr){
		players = arr;

		for(var i = 0; i < players.length; i++){
			players[i].reset();
		}
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

	// Set cup object from Game Master

	this.setCup = function(cupName){
		cup = gm.getCupById(cupName);
	}

	// Set a custom cup object

	this.setCustomCup = function(customCup){
		cup = customCup;
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

	this.calculateDamage = function(attacker, defender, move, charge){
		charge = typeof charge !== 'undefined' ? charge : 1;

		var bonusMultiplier = 1.3;
		var effectiveness = defender.typeEffectiveness[move.type];
		var chargeMultiplier = charge; // The amount of charge for a Charged Move

		// Fully charge moves in regular simulation or if the opponent is an AI
		if((mode == "emulate")&&(players[attacker.index])){
			if((move.energyGain > 0)||(players[attacker.index].getAI() !== false)){
				chargeAmount = 1;
			}

			chargeMultiplier = chargeAmount;

			// Protection to prevent 0 damage
			if(chargeMultiplier == 0){
				chargeMultiplier = 1;
			}
		}

		var damage = Math.floor(move.power * move.stab * ( attacker.getEffectiveStat(0) / defender.getEffectiveStat(1)) * effectiveness * chargeMultiplier * 0.5 * bonusMultiplier) + 1;

		return damage;
	}

	// Calculate damage given stats and effectiveness

	this.calculateDamageByStats = function(attacker, defender, attack, defense, effectiveness, move){

		var bonusMultiplier = 1.3;

		var damage = Math.floor(move.power * move.stab * (attack/defense) * effectiveness * 0.5 * bonusMultiplier) + 1;

		return damage;
	}

	// Solve for Attack given the damage, defense, effectiveness, and move

	this.calculateBreakpoint = function(attacker, defender, damage, defense, effectiveness, move){

		var bonusMultiplier = 1.3;

		var attack = ((damage - 1) * defense) / (move.power * move.stab * effectiveness * 0.5 * bonusMultiplier);

		return attack;
	}

	// Solve for Defense given the damage, attack, effectiveness, and move

	this.calculateBulkpoint = function(attacker, defender, damage, attack, effectiveness, move){

		var bonusMultiplier = 1.3;

		var defense =  (move.power * move.stab * effectiveness * 0.5 * bonusMultiplier * attack) / (damage);

		return defense;
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

	// Reset all battle components and initiate the battle

	this.start = function(){
		// Reset all Pokemon
		for(var i = 0; i < pokemon.length; i++){
			pokemon[i].reset();

			startingValues[i].hp = pokemon[i].hp;
			startingValues[i].energy = pokemon[i].energy;
		}

		// Reset all actions
		for(var i = 0; i < actions.length; i++){
			actions[i].processed = false;
		}

		// Determine if charged move priority should be used
		usePriority = false;

		if(pokemon[0].stats.atk != pokemon[1].stats.atk){
			usePriority = true;
		}

		time = 0;
		turns = 1;
		lastProcessedTurn = 0;
		turnsToWin = [0, 0];
		timeline = [];
		queuedActions = [];
		turnActions = [];
		sixtySecondMarked = false;
	}

	// Process a turn

	this.step = function(){
		// Return from this function if paused
		if(phase == "game_paused"){
			return false;
		}

		// For display purposes, need to track whether a Pokemon has used a charged move or shield each round

		roundChargedMoveUsed = 0;
		roundChargedMovesInitiated = 0;
		roundShieldUsed = false;

		// Hold the actions for both Pokemon this turn

		if(turns > lastProcessedTurn){
			turnActions = [];
		}

		// Reduce cooldown for both Pokemon

		for(var i = 0; i < 2; i++){
			var poke = pokemon[i];
			poke.cooldown = Math.max(0, poke.cooldown - deltaTime); // Reduce cooldown
			poke.chargedMovesOnly = false;
			if(turns > lastProcessedTurn){
				poke.hasActed = false;
			}
		}

		// Reduce switch timer for both players

		for(var i = 0; i < players.length; i++){
			players[i].decrementSwitchTimer(deltaTime);
		}

		// Exit if not regular battle phase

		if(phase != "neutral"){
			return false;
		}

		// Determine actions for both Pokemon
		var actionsThisTurn = false;
		var chargedMoveThisTurn = false;
		var cooldownsToSet = [pokemon[0].cooldown, pokemon[1].cooldown]; // Store cooldown values to set later

		if(turns > lastProcessedTurn){
			for(var i = 0; i < 2; i++){

				var poke = pokemon[i];
				var opponent = this.getOpponent(i);
				var action = self.getTurnAction(poke, opponent);

				if(action){
					actionsThisTurn = true;
					if(action.type == "charged"){
						chargedMoveThisTurn = true;
					}

					// Are both Pokemon alive?

					if((action.type == "switch")||((action.type != "switch")&&(poke.hp > 0)&&(opponent.hp > 0))){
						if((action.type=="fast")&&(mode == "emulate")){
							// Submit an animation to be played
							self.pushAnimation(poke.index, "fast", pokemon[action.actor].fastMove.cooldown / 500);
						}

						var valid = true;

						if(action.type == "fast"){
							if(poke.chargedMovesOnly){
								valid = false;
							}

							if(valid){
								cooldownsToSet[i] += poke.fastMove.cooldown;
							}
						}

						if(valid){
							queuedActions.push(action);
						}
					}
				}
			}
		}

		// Set cooldowns for both Pokemon. We do this after move decision making because cooldown values are used in the decision making process
		pokemon[0].cooldown = cooldownsToSet[0];
		pokemon[1].cooldown = cooldownsToSet[1];

		// Take actions from the queue to be processed now
		for(var i = 0; i < queuedActions.length; i++){
			var action = queuedActions[i];
			var valid = false;

			// Is there a fast move that's eligible to be processed this turn?
			if(action.type == "fast"){

				// Was this queued on a previous turn? See if it's eligible
				var timeSinceActivated = (turns - action.turn) * 500;
				var chargedMoveLastTurn = false;

				for(var n = 0; n < previousTurnActions.length; n++){
					if(previousTurnActions[n].type == "charged"){
						chargedMoveLastTurn = true;
					}
				}

				var requiredTimeToPass = pokemon[action.actor].fastMove.cooldown - 500;

				if(timeSinceActivated >= requiredTimeToPass){
					action.settings.priority += 20;
					valid = true;
				}
				if((timeSinceActivated >= 500)&&(chargedMoveLastTurn)){
					action.settings.priority += 20;
					valid = true;
				}
			}

			if(action.type == "charged"){
				valid = true;
			}

			if(action.type == "wait"){
				valid = true;
			}

			if(action.type == "switch"){
				valid = true;
			}

			if(valid){
				turnActions.push(action);
				queuedActions.splice(i, 1);
				i--;
			}
		}

		// Sort actions by priority
		turnActions.sort((a,b) => (a.settings.priority > b.settings.priority) ? -1 : ((b.settings.priority > a.settings.priority) ? 1 : 0));

		// Process actions on this turn

		for(var n = 0; n < turnActions.length; n++){
			// Return here if we've reached a suspended state
			if(phase != "neutral"){
				return false;
			}

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

					if(opponent.hp < 1){
						action.valid = false;
					}
					break;

				case "charged":
					var move = poke.chargedMoves[action.value];

					if(! move){
						console.log("ERROR: Can't find move " + action.value);
					} else{
						if(poke.energy >= move.energy){
							action.valid = true;
						}

						// Check if knocked out from a priority move

						if((usePriority)&&(poke.hp <= 0)&&(poke.priority == 0)&&(priorityChargedMoveThisTurn)){
							action.valid = false;
						}
					}

					// Check if knocked out from a priority move
					if((usePriority)&&(poke.hp <= 0)){
						action.valid = false;
					}

					// Check if knocked out by a fast move
					var lethalFastMove = false;
					var opponentChargedMoveThisTurn = false;

					for(var j = 0; j < turnActions.length; j++){
						if(turnActions[j].actor != action.actor){
							if(turnActions[j].type == "fast"){
								// Need to check if the damage has already been applied this turn
								if(((opponent.cooldown == 0)&&(poke.hp <= pokemon[turnActions[j].actor].fastMove.damage)) || (poke.hp < 1)){
									lethalFastMove = true;
								}

							} else if(turnActions[j].type == "charged"){
								opponentChargedMoveThisTurn = true;
							}
						}
					}

					if((lethalFastMove)&&(! opponentChargedMoveThisTurn)){
						action.valid = false;
					}

					break;

				case "wait":
					action.valid = true;
					break;

				case "switch":
					if(((poke.cooldown == 0)&&(players[poke.index].getSwitchTimer() == 0))||(poke.hp < 1)){
						action.valid = true;
					}
					break;
			}

			self.processAction(action, poke, opponent);
		}
		// Set previous turn actions and clear the current turn

		previousTurnActions = turnActions;
		turnActions = [];

		if(mode == "emulate"){
			actions = [];
		}

		if(roundChargedMoveUsed == 0){
			time += deltaTime;
		} else{
			// This is for display purposes only

			if(roundShieldUsed){
				time += chargedMinigameTime * (roundChargedMoveUsed-1);
			} else{
				time += chargedMinigameTime;
			}

		}

		duration = time;
		lastProcessedTurn = turns;
		turns++;

		// Display sixty second marker after 60 seconds have passed

		if((mode == "simulate")&&(time >= 60000)&&(! sixtySecondMarked)){
			timeline.push(new TimelineEvent("switchAvailable", "Switch Available (60 seconds)", 0, time, turns));
			sixtySecondMarked = true;
		}

		// Check for faint
		var faintedPokemonIndexes = [];

		for(var i = 0; i < 2; i++){
			var poke = pokemon[i];

			if(poke.hp <= 0){
				timeline.push(new TimelineEvent("faint", "Faint", poke.index, time, turns));

				var opponentIndex = (i == 0) ? 0 : 1;

				if(turnsToWin[opponentIndex] == 0){
					turnsToWin[opponentIndex] = turns;
				}

				faintedPokemonIndexes.push(poke.index);

				if(mode == "emulate"){
					self.pushAnimation(poke.index, "switch", true);
				}
			}

			// Reset after a charged move

			if(roundChargedMoveUsed){
				poke.damageWindow = 0;
				poke.cooldown = 0;
			}
		}

		if((mode == "emulate")&&(faintedPokemonIndexes.length > 0)){

			// Are all Pokemon fainted or should the battle continue?

			if((players[0].getRemainingPokemon() > 0)&&(players[1].getRemainingPokemon() > 0)){
				phase = "suspend_switch";
				phaseProps = {
					actors: faintedPokemonIndexes
				};

				if(players[0].getRemainingPokemon() > 1){
					phaseTimeout = setTimeout(self.forceSwitch,	13000);
				} else{
					self.forceSwitch();
				}

				// Reset cooldowns for active Pokemon

				for(var i = 0; i < pokemon.length; i++){
					pokemon[i].cooldown = 0;
				}

				// AI switch
				if(phaseProps.actors.indexOf(1) > -1){
					var switchChoice = players[1].getAI().decideSwitch();
					var waitTime = 500;

					if((players[1].getAI().hasStrategy("WAIT_CLOCK"))&&(players[1].getSwitchTimer() > 0)&&(players[1].getRemainingPokemon() > 1)){
						waitTime = Math.min(players[1].getSwitchTimer() - 1000, 5000);
						waitTime = Math.floor(Math.random() * waitTime) + 2000;
					}

					setTimeout(function(){
						self.queueAction(1, "switch", switchChoice);
					}, waitTime);
				}
			} else{
				var result = "tie";
				phase = "game_over";

				if(players[0].getRemainingPokemon() > players[1].getRemainingPokemon()){
					result = "win";
				} else{
					result = "loss";
				}

				self.dispatchUpdate({ result: result });
				clearInterval(mainLoopInterval);
			}

			// If a Pokemon has fainted, clear the action queue
			turnActions = [];
			queuedActions = [];
		}
	}

	// This is the meat of the pie. Runs the battle simulation and returns an array of timeline events

	this.simulate = function(){

		mode = "simulate";
		self.start();

		// Main battle loop

		var continueBattle = true;

		while(continueBattle){

			self.step();

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

	this.emulate = function(callback){
		mode = "emulate";
		sandbox = true;
		buffChanceModifier = 0;
		updateCallback = callback;

		// Sort and reset Pokemon
		for(var i = 0; i < players.length; i++){
			players[i].reset();

			var team = players[i].getTeam();

			for(var n = 0; n < team.length; n++){
				team[n].fullReset();
			}
		}

		for(var i = 0; i < pokemon.length; i++){
			pokemon[i].setBattle(self);
		}

		players[1].getAI().evaluateMatchup(turns, pokemon[1], pokemon[0], players[0]);

		self.start();

		var countdown = 5;
		phase = "countdown";
		self.dispatchUpdate();

		// Initiate countdown


		var countdownInterval = setInterval(function(){
			countdown--;

			if(countdown < 1){
				phase = "neutral";
				clearInterval(countdownInterval);
				self.dispatchUpdate();
			} else{
				self.dispatchUpdate({ countdown: countdown });
			}

		}, 1000);

		mainLoopInterval = setInterval(function(){
			self.step();
			self.dispatchUpdate();
		}, 500);
	}

	// Isolated function that returns an action a pokemon will perform this turn

	this.getTurnAction = function(poke, opponent){
		var action = null;

		// If Pokemon can take action

		chargedMoveUsed = false; // Flag so Pokemon only uses one Charged Move per round

		if((poke.cooldown == 0)&&(! poke.hasActed)){
			if((! sandbox)||((mode == "emulate")&&(players[poke.index].getAI() !== false)&&(poke.hp > 0))){
				poke.hasActed = true;

				if(mode == "simulate"){
					action = self.decideAction(poke, opponent);
				} else{
					action = players[poke.index].getAI().decideAction(turns, poke, opponent);
				}
			} else{
				// Search for a charged move action

				for(var n = 0; n < actions.length; n++){
					var a = actions[n];

					if( ((mode == "simulate")&&(a.actor == poke.index)&&(a.turn == turns)&&(poke.chargedMoves.length > a.value))
					   || ( (mode == "emulate") && (a.actor == poke.index) && (! poke.hasActed) ) ){
						action = a;

						// Apply priority
						action.settings.priority = poke.priority;

						// Don't do action if not enough energy
						if((action.type == "charged")&&(poke.energy < poke.chargedMoves[action.value].energy)){
							action = null;
						}

						poke.hasActed = true;
					}
				}
			}

			// If no other action set, use a fast move
			if((! action)&&( (mode == "simulate") || ((mode == "emulate")&&(players[poke.index].getAI() !== false)))){
				action = new TimelineAction("fast", poke.index, turns, 0, {priority: poke.priority});
			}

			// Set cooldown

			if((action)&&(action.type == "fast")){
				timeline.push(new TimelineEvent("tap interaction", "Tap", poke.index, time, turns, [2,0]));
			}

			// Adjust priority

			if(action){
				if(action.type == "charged"){
					roundChargedMovesInitiated++;

					// Reset all cooldowns
					if((opponent.cooldown > 0)&&(! opponent.hasActed)){
						action.settings.priority += 4;
						/* if(opponent.cooldown > 0){
							opponent.chargedMovesOnly = true;
						}

						// Hook an opponent's charged move if also using a charged move
						var hookingOnLastTurn = false;

						if(opponent.cooldown == 500){
							// We're going to do a super hacky workaround here and credit energy early for decision making
							hookingOnLastTurn = true;
							opponent.energy += opponent.fastMove.energyGain;
						}

						opponent.cooldown = 0;

						var a = self.getTurnAction(opponent, poke);

						if(hookingOnLastTurn){
							opponent.energy -= opponent.fastMove.energyGain; // Now take that energy away, sike
						}

						if((a)&&(a.type == "charged")){
							queuedActions.push(a);
						} */

					}

					//poke.cooldown = 0;
					action.settings.priority += 10;

					// Set additional priority by attack stat
					if(poke.stats.atk > opponent.stats.atk){
						action.settings.priority++;
					}
				}

				if(action.type == "switch"){
					action.settings.priority += 20;
				}
			}
		}

		return action;
	}

	// Run AI decision making to determine battle action this turn, and return the resulting action

	this.decideAction = function(poke, opponent){

		var chargedMoveReady = [];
		var winsCMP = opponent.stats.atk < poke.stats.atk;

		var fastDamage = self.calculateDamage(poke, opponent, poke.fastMove);
		var oppFastDamage = self.calculateDamage(opponent, poke, opponent.fastMove);

		// If no charged move ready, always throw fast move or farm energy is on
		if (poke.energy < poke.fastestChargedMove.energy || poke.farmEnergy) {
			useChargedMove = false;
			return;
		}

		// If a fast move KOs before opponent's cooldown is over, use fast move
		if((opponent.hp <= fastDamage)){
			useChargedMove = false;

			self.logDecision(turns, poke, " uses " + poke.fastMove.name + " because a fast move will knock out the opponent before they can attack.");
			return;
		}

		// Evaluate cooldown to reach each charge move
		for(var n = 0; n < poke.chargedMoves.length; n++) {
			if (poke.energy >= poke.chargedMoves[n].energy) {
				chargedMoveReady.push(0);
			} else {
				chargedMoveReady.push(Math.ceil((poke.chargedMoves[n].energy - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.cooldown / 500);
			}
		}

		var turnsToLive = Infinity;
		var queue = [];
		var moveTurns = poke.fastMove.cooldown / 500;

		// Check if opponent is in the middle of a fast move and adjust accordingly
		// ELEMENTS OF STATE: POKEMON HP, OPPONENT ENERGY, CURRENT TURN, SHIELDS

		if (opponent.cooldown != 0) {
			queue.unshift([poke.hp - oppFastDamage, opponent.energy + opponent.fastMove.energyGain, opponent.cooldown / 500, poke.shields]);
		} else {
			queue.unshift([poke.hp, opponent.energy, 0, poke.shields]);
		}


		// Check if opponent can KO in your fast move cooldown
		while (queue.length != 0) {

			var currState = queue.shift();

			// If turn > when you can act before your opponent, move to the next item in the queue
			if (winsCMP) {
				if (currState[2] > poke.fastMove.cooldown / 500) {
					continue;
				}
			} else {
				if (currState[2] > poke.fastMove.cooldown / 500 + 1) {
					continue;
				}
			}

			// Check if a fast move faints, add results to queue
			if (currState[0] - oppFastDamage <= 0) {
				turnsToLive = Math.min(currState[2] + opponent.fastMove.cooldown / 500, turnsToLive);
				break;
			} else {
				queue.unshift([currState[0] - oppFastDamage, currState[1] + opponent.fastMove.energyGain, currState[2] + opponent.fastMove.cooldown / 500, currState[3]])
			}
			
			// Shield bait if shields are up, otherwise try to KO
			if (currState[3] != 0) {
				if (currState[1] >= opponent.fastestChargedMove.energy) {
					queue.unshift([currState[0] - 1, currState[1] - opponent.fastestChargedMove.energy, currState[2] + 1, currState[3] - 1])
				}
			} else {
				// Check if any charge move KO's, add results to queue
				for(var n = 0; n < opponent.chargedMoves.length; n++) {
					if (currState[1] >= opponent.chargedMoves[n].energy) {
						moveDamage = self.calculateDamage(opponent, poke, opponent.chargedMoves[n]);
						if (moveDamage >= currState[0]) {
							turnsToLive = Math.min(currState[2], turnsToLive);
							self.logDecision(turns, poke, " opponent has energy to use " + opponent.chargedMoves[n].name + " and it would do " + moveDamage + " damage. I have " + turnsToLive + " turn(s) to live");
							break;
						}
						queue.unshift([currState[0] - moveDamage, currState[1] - opponent.chargedMoves[n].energy, currState[2] + 1, currState[3]])
					}
				}
			}
		}

		// If you can't throw a fast move and live, throw whatever move you can with the most damage
		if (turnsToLive != -1) {
			if (turnsToLive * 500 < poke.fastMove.cooldown || (turnsToLive * 500 == poke.fastMove.cooldown && !winsCMP)) {

				var maxDamageMoveIndex = 0;
				var prevMoveDamage = -1;

				for(var n = 0; n < poke.chargedMoves.length; n++) {

					// Find highest damage available move
					if (chargedMoveReady[n] == 0) {
						var moveDamage = self.calculateDamage(poke, opponent, poke.chargedMoves[n]);
						if (moveDamage > prevMoveDamage) {
							maxDamageMoveIndex = n;
							prevMoveDamage = moveDamage;
						}
					}
				}

				// If no moves available, throw fast move
				if (prevMoveDamage == -1) {
					useChargedMove = false;
					self.logDecision(turns, poke, " uses a fast move because it is has " + turnsToLive + " turn(s) before it is KO'd but has no energy.");
					return;
				// Throw highest damage move
				} else {

					self.logDecision(turns, poke, " uses " + poke.chargedMoves[maxDamageMoveIndex].name + " because it is has " + turnsToLive + " turn(s) before it is KO'd.");

					action = new TimelineAction(
						"charged",
						poke.index,
						turns,
						maxDamageMoveIndex,
						{shielded: false, buffs: false, priority: poke.priority});

					chargedMoveUsed = true;
					return action;
				}
			}
		}

		// Calculate the most efficient way to defeat opponent

		//ELEMENTS OF DP QUEUE: ENERGY, OPPONENT HEALTH, TURNS, OPPONENT SHIELDS, USED MOVES, ATTACK BUFF

		var stateCount = 0;

		var DPQueue = [[poke.energy, opponent.hp, 0, opponent.shields, []]];
		var finalState;
		while (DPQueue.length != 0) {

			// A not very good way to prevent infinite loops
			if (stateCount >= 500) {
				self.logDecision(turns, poke, " considered too many states, likely an infinite loop");
				useChargedMove = false;
				return;
			}
			stateCount++;

			// DEBUG
			/*
			for (var stateInd = 0; stateInd < DPQueue.length; stateInd++) {
				self.logDecision(turns, poke, stateInd + "th element in DP queue is " + DPQueue[stateInd]);
			}
			*/
			

			var currState = DPQueue.shift();
			var DPchargedMoveReady = [];

			// DEBUG
//			self.logDecision(turns, poke, " is considering putting the opponent at " + currState[1] + " hp at turn " + currState[2]);

			// Found fastest way to defeat enemy, fastest = optimal in this case since damage taken is strictly dependent on time
			// Set finalState to currState and do more evaluation later
			if (currState[1] <= 0) {

//				self.logDecision(turns, poke, " decides the optimal plan is to use " + currState);

				finalState = currState;
				break;

			}

			// Evaluate cooldown to reach each charge move
			for(var n = 0; n < poke.chargedMoves.length; n++) {
				if (currState[0] >= poke.chargedMoves[n].energy) {
					DPchargedMoveReady.push(0);
				} else {
					DPchargedMoveReady.push(Math.ceil((poke.chargedMoves[n].energy - currState[0]) / poke.fastMove.energyGain) * poke.fastMove.cooldown / 500);
				}
			}

			// Push states onto queue in order of TURN
			for(var n = poke.chargedMoves.length - 1; n >= 0; n--) {

				// Apply stat changes to pokemon attack
				var currentMult = 0
				if (currState[5] >= 0) {
					currentMult = 1 + 0.25 * currState[5];
				} else {
					currentMult = 1 / (1 + 0.25 * currState[5]);
				}

				poke.attack *= currentMult;

				var moveDamage = self.calculateDamage(poke, opponent, poke.chargedMoves[n]);
				var fastSimulatedDamage = self.calculateDamage(poke, opponent, poke.fastMove);

				// Remove stat changes from pokemon attack
				poke.attack /= currentMult;

				// Add result of farming down from this point
				var movesToFarmDown = Math.ceil(currState[1] / fastSimulatedDamage);

				// Place state at correct spot in priority queue
				var i = 0;
				if (DPQueue.length == 0) {
					DPQueue.unshift([currState[0] + poke.fastMove.energyGain * movesToFarmDown, 0, currState[2] + movesToFarmDown * poke.fastMove.cooldown / 500, currState[3], currState[4], currState[5]]);
				} else {
					while (DPQueue[i][2] < currState[2] + movesToFarmDown * poke.fastMove.cooldown / 500) {
						i ++;
						if (i == DPQueue.length) {
							break;
						}
					}
					DPQueue.splice(i, 0, [currState[0] + poke.fastMove.energyGain * movesToFarmDown, 0, currState[2] + movesToFarmDown * poke.fastMove.cooldown / 500, currState[3], currState[4], currState[5]])	
				}

				// Find new attack after move
				var attackMult = currState[5];

				// If attack guaranteed buffs attack, apply effects
				if (poke.chargedMoves[n].buffTarget && (poke.chargedMoves[n].buffTarget == "self") && poke.buffApplyChance == 1) {
					attackMult += poke.chargedMoves[n].buffs[0];
				}

				// If attack guaranteed debuffs opponent defense, apply effects
				if (poke.chargedMoves[n].buffTarget && (poke.chargedMoves[n].buffTarget == "opponent") && poke.buffApplyChance == 1) {
					attackMult -= poke.chargedMoves[n].buffs[1];
				}

				// If move is ready, use it and add results to queue
				if (DPchargedMoveReady[n] == 0) {

					// If shielded, apply 1 damage, otherwise apply move damage
					var newOppHealth = currState[1] - moveDamage;
					if (currState[3] > 0) {
						newOppHealth = currState[1] - 1;
					}

					var newShields = currState[3];
					// Assume pokemon shields
					if (newShields > 0) {
						newShields--;
					}

					// DEBUG
//					self.logDecision(turns, poke, " wants to use " + poke.chargedMoves[n].name + " because it has the energy for it. Opponent hp will be " + newOppHealth + ". Turn = " + (currState[2]));
					
					// Remove all elements that are strictly worse than this state while checking if there are any elements better than this state
					var i = 0;
					var insertElement = true;
					while (i < DPQueue.length && DPQueue[i][2] == currState[2] + 1) {
						if (DPQueue[i][1] == newOppHealth && DPQueue[i][5] == attackMult) {
							if (DPQueue[i][0] < (currState[0] - poke.chargedMoves[n].energy)) {
								DPQueue.splice(i, 1);
							} else if (DPQueue[i][0] ==  (currState[0] - poke.chargedMoves[n].energy)) {

								// Added this just for perrserker
								// If energy is the same and opponent at same health choose path with less debuffs
								var DPDebuffs = 0;
								var currDebuffs = 0;
								for (var x = 0; x < DPQueue[i][4].length; x++) {
									if (DPQueue[i][4][x].selfDebuffing) {
										DPDebuffs++;
									}
								}
								for (var x = 0; x < currState[4]; x++) {
									if (currState[4][x].selfDebuffing) {
										currDebuffs++;
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
						if (DPQueue.length == 0) {
							DPQueue.unshift([newEnergy, newOppHealth, currState[2] + 1, newShields, currState[4].concat([poke.chargedMoves[n]]), attackMult]);
						} else {
							while (DPQueue[i][2] < currState[2] + 1) {
								i ++;
								if (i == DPQueue.length) {
									break;
								}
							}
							DPQueue.splice(i, 0, [currState[0] - poke.chargedMoves[n].energy, newOppHealth, currState[2] + 1, newShields, currState[4].concat([poke.chargedMoves[n]]), attackMult])
						}
					}
					
				} else {
					var newEnergy = currState[0] - poke.chargedMoves[n].energy + poke.fastMove.energyGain * (DPchargedMoveReady[n] / (poke.fastMove.cooldown / 500));
					var newOppHealth = currState[1] - moveDamage - fastSimulatedDamage * (DPchargedMoveReady[n] / (poke.fastMove.cooldown / 500));

					// If shields are up, only apply fast move damage
					if (currState[3] > 0) {
						newOppHealth = currState[1] - fastSimulatedDamage * (DPchargedMoveReady[n] / (poke.fastMove.cooldown / 500)) - 1;
					}
					var newTurn = currState[2] + DPchargedMoveReady[n] + 1;
					var newShields = currState[3]

					// Assume pokemon shields
					if (newShields > 0) {
						newShields--;
					}

					// DEBUG: If move is not ready, calculate values when it is ready and add to queue at correct spot
					/*
					self.logDecision(turns, poke, " wants to use " + poke.chargedMoves[n].name + " when it has energy for at turn " + newTurn + ". Opponent hp will be " + newOppHealth + ". Current turn is " + currState[2] + ". Current energy is " + currState[0]);
					for (var i = currState[4].length - 1; i >= 0; i--) {
						self.logDecision(turns, poke, " would use " + currState[4][i].name + " before that");
					}
					*/
					

					// Place in priority queue, with TURN being the priority
					var i = 0;
					if (DPQueue.length == 0) {
						DPQueue.unshift([newEnergy, newOppHealth, newTurn, newShields, currState[4].concat([poke.chargedMoves[n]]), attackMult]);
					} else {
						while (DPQueue[i][2] < newTurn) {
							i ++;
							if (i == DPQueue.length) {
								break;
							}
						}

						DPQueue.splice(i, 0, [newEnergy, newOppHealth, newTurn, newShields, currState[4].concat([poke.chargedMoves[n]]), attackMult])
					}

					// If move will debuff attack, calculate values when you stack two of them then throw
					if (poke.chargedMoves[n].selfDebuffing && poke.chargedMoves[n].buffs[0] < 0) {

						newTurn = Math.ceil((poke.chargedMoves[n].energy * 2 - currState[0]) / poke.fastMove.energyGain) * poke.fastMove.cooldown / 500;
						newEnergy = Math.min(100, currState[2] + newTurn * poke.fastMove.energyGain) - poke.chargedMoves[n].energy;
						newOppHealth = currState[1] - moveDamage - fastSimulatedDamage * (newTurn / poke.fastMove.cooldown / 500);
						if (currState[3] > 0) {
							newOppHealth += moveDamage - 1;
						}

						newTurn += currState[2] + 1

						i = 0;
						if (DPQueue.length == 0) {
							DPQueue.unshift([newEnergy, newOppHealth, newTurn, newShields, currState[4].concat([poke.chargedMoves[n]]), attackMult]);
						} else {
							while (DPQueue[i][2] < newTurn) {
								i ++;
								if (i == DPQueue.length) {
									break;
								}
							}

							DPQueue.splice(i, 0, [newEnergy, newOppHealth, newTurn, newShields, currState[4].concat([poke.chargedMoves[n]]), attackMult])
						}
					}
				}
			}
		}

		// Evaluate throwing strategy after finding optimal plan

		// Check if farming down is faster
		if (finalState[4].length == 0) {
			useChargedMove = false;
			self.logDecision(turns, poke, " uses a fast move because it has chosen to farm down");
			return;
		}

		// If bait shields is off, always throw high damage move first
		if (!poke.baitShields) {
			finalState[4].sort(function(a, b) {
				var moveDamage1 = self.calculateDamage(poke, opponent, a);
				var moveDamage2 = self.calculateDamage(poke, opponent, b);
				return moveDamage2 - moveDamage1;
			})
		} else {
			// Try to build up to best move to bait
			if (opponent.shields > 0) {
				if (finalState[4][0] != poke.bestChargedMove && poke.energy < poke.bestChargedMove) {
					self.logDecision(turns, poke, " doesn't use " + finalState[4][0].name + " because it wants to pretend it is going to use " + poke.bestChargedMove.name);
				}
			}
		}

		// If move is self debuffing and doesn't KO, try to stack as much as you can
		if (finalState[4][0].selfDebuffing) {
			if (poke.energy < Math.floor(100 / finalState[4][0].energy) * finalState[4][0].energy) {
				var moveDamage = self.calculateDamage(poke, opponent, finalState[4][0]);
				if (opponent.hp > moveDamage || opponent.shields != 0) {
					useChargedMove = false;
					self.logDecision(turns, poke, " doesn't use " + finalState[4][0].name + " because it wants to minimize time debuffed and it can stack the move " + Math.floor(100 / currState[4][0].energy) + " times");
					return;
				}
			}
		}

		// If move is self buffing or debuffs opponent, evaluate whether or not to throw it first
		// No need to check first move since we are throwing it anyways
		// Scrapped for now, NOT FUNCTIONING RN
/*
		for (var i = 1; i < finalState[4].length; i++) {
			var buffMove = finalState[4][i];

			// Avoid redundancy and infinite loops
			if (finalState[4][0] == buffMove) {
				continue;
			}

			// If move buffs attack or debuffs opponent defense
			if (buffMove.buffApplyChance && buffMove.buffApplyChance > 0 && ((buffMove.buffTarget == "self" && buffMove.buffs[0] > 0) || (buffMove.buffTarget == "opponent" && buffMove.buffs[1] < 0))) {

				var attackMult = 1;

				// Apply attack buff to attack multiplier
				if (buffMove.buffTarget == "self") {
					attackMult += buffMove.buffs[0] * 0.25;
				}

				// Defense drop is the same as an attack buff
				if (buffMove.buffTarget == "opponent") {
					attackMult += -buffMove.buffs[1] * 0.25;
				}
				
				var opponentShields = opponent.shields;

				// If opponent has no shields, throw buff move first if it's guaranteed
				if (opponentShields == 0 && buffMove.buffApplyChance == 1) {

					self.logDecision(turns, poke, "GOES FOR THE BUFF HEHEHE");
					finalState.splice(i, 1);
					finalState.unshift(buffMove);

				} else {

					// Calculate expected value of throwing it where it is now

					var turnsAfter = 0;

					var totalDamageAfterMove = 0;
					for (var x = i + 1; x < finalState[4].length; x++) {
						// Calculate approximate turns after move is thrown
						turnsAfter += Math.ceil(finalState[4][x].energy / poke.fastMove.energyGain);
						if (opponentShields == 0) {
							totalDamageAfterMove += self.calculateDamage(poke, opponent, finalState[4][x]);
						} else {
							opponentShields --;
						}
					}

					// Add fast move damage
					totalDamageAfterMove += Math.floor((turnsAfter / (poke.fastMove.cooldown / 500))) * fastDamage;

					var currentExpectedValue = buffMove.buffApplyChance * (totalDamageAfterMove * attackMult - totalDamageAfterMove);

					// Calculate expected value of throwing it first
					opponentShields = opponent.shields
					var totalMovedDamage = 0;

					for (var x = 0; x < n; x++) {

						if (x == n) {
							continue;
						}

						if (opponentShields == 0) {
							totalMovedDamage += self.calculateDamage(poke, opponent, finalState[4][x]);
						} else {
							opponentShields --;
						}
					}

					totalMovedDamage += totalDamageAfterMove;

					totalMovedDamage += Math.floor((finalState[2] - turns - (finalState.length - 1 - i)) / (poke.fastMove.cooldown / 500)) * fastDamage;

					var movedExpectedValue = buffMove.buffApplyChance * (totalMovedDamage * attackMult - totalMovedDamage);

					if (movedExpectedValue > currentExpectedValue) {
						self.logDecision(turns, poke, "GOES FOR THE BUFF");
						finalState.splice(i, 1);
						finalState.unshift(buffMove);
					} else {
						self.logDecision(turns, poke, "Doesn't go for the buff because it's not worth it.");
					}
				}
			}


			// If move buffs defense or debuffs opponent attack, throw it early if it's the cheapest move
			if (buffMove.buffApplyChance && buffMove.buffApplyChance > 0 && ((buffMove.buffTarget == "self" && (buffMove.buffs[1] > 0)) || (buffMove.buffTarget == "opponent" && buffMove.buffs[0] < 0))) {
				if (poke.fastestChargedMove == buffMove) {
					self.logDecision(turns, poke, "GOES FOR THE BUFF");
					finalState.splice(i, 1);
					finalState.unshift(buffMove);
				} else {
					self.logDecision(turns, poke, "Doesn't go for the buff because it's not worth it.");
				}
			}
		}
*/

		if (poke.energy >= finalState[4][0].energy) {
			if (finalState[4].length > 1) {
				self.logDecision(turns, poke, " uses " + finalState[4][0].name + " because it thinks that using " + (finalState[4].length - 1) + " moves afterwards is the best plan.");

				// Debugging Log
				for (var i = 1; i < finalState[4].length; i++) {
					self.logDecision(turns, poke, " wants to use " + finalState[4][i].name + " after it uses " + finalState[4][i - 1].name);
				}

			} else {
				self.logDecision(turns, poke, " uses " + finalState[4][0].name + " at turn " + turns + " because it KO's or it wants to farm down afterwards");
			}

		} else {
			useChargedMove = false;
			self.logDecision(turns, poke, " uses a fast move because it has no energy for " + finalState[4][0].name);
			return;
		}


		action = new TimelineAction(
			"charged",
			poke.index,
			turns,
			poke.chargedMoves.indexOf(currState[4][0]),
			{shielded: false, buffs: false, priority: poke.priority});

		chargedMoveUsed = true;
		return action;
	}

	// Queue an action to be processed on the next available turn

	this.queueAction = function(actor, type, value){
		// First, clear any existing actions that belong to the current actor

		for(var i = 0; i < actions.length; i++){
			// Don't override a switch
			if(actions[i].actor == actor){
				if(actions[i].type != "switch"){
					actions.splice(i, 1);
					break;
				} else{
					return false;
				}
			}
		}

		// Insert a new action

		var action = new TimelineAction(
			type,
			actor,
			turns,
			value,
			{ shielded: false, buffs: false, priority: pokemon[actor].priority }
			);

		actions.push(action);

		if((type=="switch")&&(phase == "suspend_switch")){
			// If all required switches have been answered, resume the battle
			var switchesAnswered = 0;

			for(var i = 0; i < phaseProps.actors.length; i++){
				for(var n = 0; n < actions.length; n++){
					if((actions[n].type == "switch")&&(actions[n].actor == phaseProps.actors[i])){
						switchesAnswered++;
					}
				}
			}

			if(switchesAnswered == phaseProps.actors.length){
				clearTimeout(phaseTimeout);
				phase = "neutral";
			}
		}
	}


	// Process and apply a set battle action

	this.processAction = function(action, poke, opponent){

		// Don't run this action if it's invalidated

		if((! action.valid)||(action.processed)){
			return false;
		}

		// Set porcessed to true so it isn't processed twice
		action.processed = true;

		switch(action.type){

			case "fast":
				var move = poke.fastMove;
				self.useMove(poke, opponent, move);
				break;

			case "charged":
				var move = poke.chargedMoves[action.value];

				// Validate this move can be used

				if(poke.energy >= move.energy){
					if(mode == "simulate"){
						self.useMove(poke, opponent, move, action.settings.shielded, action.settings.buffs, action.settings.charge);
					} else if((mode == "emulate")&&(phase != "suspend_charged")){
						// Initiate the suspended phase

						// If multiple charged moves are being used on this turn, set the turn counter back
						var continueSameTurn = false;

						for(var i = 0; i < turnActions.length; i++){
							if((turnActions[i].type == "charged")&&(turnActions[i].actor != poke.index)){
								continueSameTurn = true;
							}
						}

						if(continueSameTurn){
							turns--;
						}

						phase = "suspend_charged";
						phaseProps = {
							actor: poke.index,
							move: action.value,
							power: 1,
							shield: false
						};

						chargeAmount = 0;
						playerUseShield = false;

						if(players[opponent.index].getAI() !== false){
							playerUseShield = players[opponent.index].getAI().decideShield(poke, opponent, move);
						}

						// Initiate the move animation
						setTimeout(function(){
							phase = "animating";
							self.dispatchUpdate({
								type: "charged",
								actor: poke.index,
								moveName: move.name,
								moveType: move.type
							});
						}, 6000);

						// Execute this move after a set amount of time
						setTimeout(function(){
							self.useMove(poke, opponent, move, playerUseShield, action.settings.buffs);

							// If AI, evaluate the rest of the matchup
							if(opponent.hp > 0){
								if(players[1].getAI()){
									players[1].getAI().evaluateMatchup(turns, pokemon[1], pokemon[0], players[0]);
								}
							}
						}, 8000);

						// Return the game to the neutral phase
						phaseTimeout = setTimeout(function(){
							phase = "neutral";
						}, 10000);

					}

					chargedMoveUsed = true;
					roundChargedMoveUsed++;
				}
				break;

			case "wait":
				var displayTime = time;
				if(roundShieldUsed){
					displayTime -= chargedMinigameTime;
				}
				timeline.push(new TimelineEvent("tap interaction wait", "Wait", poke.index, displayTime, turns, [2,0]));
				break;

			case "switch":
				var player = players[poke.index];
				var newPokemon = player.getTeam()[action.value];

				if(newPokemon){
					if(poke.hp > 0){
						player.startSwitchTimer();

						// Reset the outgoing Pokemon's buffs and debuffs
						poke.statBuffs = [0,0];
						poke.startStatBuffs = [0,0];
					} else{
						self.getOpponent(poke.index).cooldown = 500;
					}
					self.setNewPokemon(newPokemon, poke.index, false);

					if(mode == "emulate"){
						// Submit an animation to be played
						self.pushAnimation(poke.index, "switch", false);
					}
				}
				break;
		}
	}

	// Use a move on an opposing Pokemon and produce a Timeline Event

	this.useMove = function(attacker, defender, move, forceShields, forceBuff, charge){
		charge = typeof charge !== 'undefined' ? charge : 1;

		var type = "fast " + move.type;
		var damage = self.calculateDamage(attacker, defender, move, charge);
		move.damage = damage;

		var displayTime = time;
		var shieldBuffModifier = 0;

		self.logDecision(turns, attacker, " uses " + move.name);

		// If Charged Move

		if(move.energy > 0){

			type = "charged " + move.type;
			attacker.energy -= move.energy;

			if((usePriority)&&(roundChargedMoveUsed > 0)&&(roundShieldUsed == 0)){
				time+=chargedMinigameTime;
			}

			// Add tap events for display

			for(var i = 0; i < 8; i++){
				timeline.push(new TimelineEvent("tap "+move.type, "Swipe", attacker.index, time+(1000*i), turns, [i]));
			}

			// If defender has a shield, use it

			if( ((sandbox) && (forceShields) && (defender.shields > 0)) || ((! sandbox) && (defender.shields > 0)) ){
				var useShield = true;

				// For PuP, Acid Spray and similar moves, don't shield if it's survivable

				if((! sandbox)&&(move.buffs)&&(((move.buffs[0] > 0) && (move.buffTarget == "self")) || ((move.buffs[1] < 0) && (move.buffTarget == "opponent")))&&(move.buffApplyChance == 1)){
					useShield = false;

					var postMoveHP = defender.hp - damage; // How much HP will be left after the attack
					// Capture current buffs for pokemon whose buffs will change
					var currentBuffs;
					if (move.buffs[0] > 0) {
						currentBuffs = [attacker.statBuffs[0], attacker.statBuffs[1]];
						attacker.applyStatBuffs(move.buffs);
					} else {
						currentBuffs = [defender.statBuffs[0], defender.statBuffs[1]];
						defender.applyStatBuffs(move.buffs);
					}

					var fastDamage = self.calculateDamage(attacker, defender, attacker.fastMove);

					// Determine how much damage will be dealt per cycle to see if the defender will survive to shield the next cycle

					var fastAttacks = Math.ceil(Math.max(move.energy - attacker.energy, 0) / attacker.fastMove.energyGain) + 2; // Give some margin for error here
					var fastAttackDamage = fastAttacks * fastDamage;
					var cycleDamage = (fastAttackDamage + 1) * defender.shields;

					if(postMoveHP <= cycleDamage){
						useShield = true;
					}

					// Reset buffs to original
					if (move.buffs[0] > 0) {
						attacker.statBuffs = [currentBuffs[0], currentBuffs[1]];
					} else {
						defender.statBuffs = [currentBuffs[0], currentBuffs[1]];
					}

					// If the defender can't afford to let a charged move connect, block

					for (var i = 0; i < attacker.chargedMoves.length; i++){
						var chargedMove = attacker.chargedMoves[i];

						if(attacker.energy + chargedMove.energy >= chargedMove.energy){
							var chargedDamage = self.calculateDamage(attacker, defender, chargedMove);

							if(chargedDamage >= defender.hp / 1.5){
								useShield = true;
							}
						}
					}
				}

				if(useShield){
					var damageBlocked = damage-1;

					timeline.push(new TimelineEvent("shield", "Shield", defender.index, time+8500, turns, [damageBlocked]));
					damage = 1;
					defender.shields--;
					roundShieldUsed = true;

					if(players.length > 0){
						players[defender.index].useShield();
					}

					turnMessages.push({ index: defender.index, str: "Blocked!"});

					// Don't debuff if it shields

					if((move.buffs)&&(move.buffTarget == "opponent")){
						shieldBuffModifier = 0;
					}

					self.logDecision(turns, defender, " blocks with a shield");

					// If a shield has already been used, add time so events don't visually overlap

					if(roundChargedMoveUsed == 0){
						time+=chargedMinigameTime;
					}

					// Accumulate battle stats

					if(mode == "emulate"){
						attacker.battleStats.shieldsBurned++;
						defender.battleStats.shieldsUsed++;
						defender.battleStats.damageBlocked += damageBlocked;

						if(attacker.battleStats.shieldsUsed > 0){
							attacker.battleStats.shieldsFromShields++;
						}
					}

				} else{

					self.logDecision(turns, defender, " doesn't shield because it can withstand the attack and is saving shields for later, boosted attacks");
				}
			} else{
				// No shield used

				if(mode == "emulate"){
					var effectiveness = defender.typeEffectiveness[move.type];
					if(effectiveness > 1){
						turnMessages.push({ index: defender.index, str: "Super effective!"});
					} else if(effectiveness < 1){
						turnMessages.push({ index: defender.index, str: "Not very effective..."});
					}

					if((defender.hp <= damage)&&(players[0].getSwitchTimer() == 0)&&(players[1].getSwitchTimer()==0)){
						attacker.battleStats.switchAdvantages++;
					}
				}
			}

			if(mode == "emulate"){
				attacker.battleStats.energyUsed += move.energy
				attacker.battleStats.chargedDamage += damage;
			}

			// Clear the queue if defender if fainted by a Charged Move
			if((mode == "emulate")&&(defender.hp <= 0)){
				turnActions = [];
				queuedActions = [];
			}

		} else{
			// If Fast Move

			if(mode == "emulate"){
				attacker.battleStats.energyGained += Math.min(move.energyGain, 100 - attacker.energy);
			}

			attacker.energy += attacker.fastMove.energyGain;

			if(attacker.energy > 100){
				attacker.energy = 100;
			}
		}


		// In the emulator, accumulate battle stats

		if(mode == "emulate"){
			attacker.battleStats.damage += (Math.min(damage, defender.hp) / defender.stats.hp) * 100;

			if(attacker.battleStats.shieldsUsed > 0){
				attacker.battleStats.damageFromShields += (Math.min(damage, defender.hp) / defender.stats.hp) * 100;
			}

			// Enter health bar animations
			var effectiveness = defender.typeEffectiveness[move.type];

			self.pushAnimation(defender.index, "damage", effectiveness);
		}

		// Inflict damage

		defender.hp = Math.max(0, defender.hp-damage);

		// Adjust display time so events don't visually overlap
		// This was really hard for my little brain to figure out so like really don't touch it

		if(move.energy > 0){
			displayTime += 8500;

			if((usePriority)&&(roundChargedMoveUsed > 0)&&(! roundShieldUsed)){
				displayTime += chargedMinigameTime;
			}
		} else if(roundShieldUsed){
			displayTime -= chargedMinigameTime;
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

				// In emulated battles, add buff messages

				if(mode == "emulate"){
					var statNames = ["Attack","Defense"];
					var statDescriptions = ["fell sharply","fell","","rose","rose sharply"];

					for(var i = move.buffs.length-1; i >= 0; i--){
						if(move.buffs[i] != 0){
							turnMessages.push({ index: buffTarget.index, str: statNames[i] + " " + statDescriptions[move.buffs[i]+2] +"!"});
						}
					}
				}

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

		// If a Pokemon has fainted, clear the action queue

		if((defender.hp < 1)&&(mode == "emulate")){
			turnActions = [];
			queuedActions = [];
		}

		return time;
	}


	// Send a battle update to the interface

	this.dispatchUpdate = function(props){

		if(! updateCallback){
			return false;
		}

		var data = {
			turn: turns,
			phase: phase,
			pokemon: pokemon,
			players: players,
			messages: turnMessages,
			animations: turnAnimations
		};

		if((phase == "suspend_charged")||(phase == "suspend_switch")){
			props = phaseProps;
		}

		// Merge additional properties supplied in parameters

		for (var prop in props){
			data[prop] = props[prop];
		}

		updateCallback(data);

		// Clear turn messages so they aren't displayed multiple times

		turnMessages = [];
		turnAnimations = [];
	}

	// Set a charge multiplier in emulated Battles

	this.setChargeAmount = function(val){
		chargeAmount = val;
	}

	// Set whether or not the player will use a shield for the upcoming Charged Move

	this.setPlayerUseShield = function(val){
		playerUseShield = val;
	}

	// Pause or resume the simulation

	this.setPause = function(val){
		isPaused = val;

		if(isPaused){
			phase = "game_paused";
		} else{
			phase = "neutral";
		}
	}

	// Completely stop the current simulation

	this.stop = function(){
		clearInterval(mainLoopInterval);
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

	// Reset the current turn number

	this.setTurns = function(val){
		turns = val;
	}

	// Return the current turn number

	this.getTurns = function(){
		return turns;
	}

	// Return the current players

	this.getPlayers = function(){
		return players;
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
						charge: 1,
						priority: pokemon[event.actor].priority
					}
				));
			}
		}

		return actions;
	}

	// Calculate number of turns it would take to flip the matchup

	this.calculateTurnMargin = function(){
		var turnMargin = 0;
		var target = pokemon[0]; // The Pokemon that won the battle
		var subject = pokemon[1]; // The Pokemon that lost the battle
		var turnArr = [];

		if(subject.hp > target.hp){
			target = pokemon[1];
			subject = pokemon[0];
		}

		// Calculate turns away from fainting with Fast Moves

		var fastMoveTurns = Math.ceil(target.hp / subject.fastMove.damage) * (subject.fastMove.cooldown / 500);
		var fastestChargedMoveTurns = 100;

		for(var i = 0; i < subject.chargedMoves.length; i++){
			var chargedMove = subject.chargedMoves[i];
			var chargedMoveTurns = 0
			var fastMovesFromChargedMove = Math.ceil((chargedMove.energy - subject.energy) / subject.fastMove.energyGain);
			var sequenceDamage = chargedMove.damage + (fastMovesFromChargedMove * subject.fastMove.damage);

			if(fastMovesFromChargedMove < 0){
				fastMovesFromChargedMove = 0;
			}

			if(sequenceDamage >= target.hp){
				chargedMoveTurns = 1 + (fastMovesFromChargedMove * (subject.fastMove.cooldown / 500));
			} else{
				chargedMoveTurns = 1 + (fastMovesFromChargedMove * (subject.fastMove.cooldown / 500)) + (Math.ceil((target.hp-sequenceDamage) / subject.fastMove.damage) * (subject.fastMove.cooldown / 500));
			}

			if(chargedMoveTurns < fastestChargedMoveTurns){
				fastestChargedMoveTurns = chargedMoveTurns;
			}

		}

		turnMargin = Math.min(fastMoveTurns, fastestChargedMoveTurns);

		return turnMargin;
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

	// Force a switch at the end of the suspended switch period

	this.forceSwitch = function(){
		for(var i = 0; i < phaseProps.actors.length; i++){
			var player = players[phaseProps.actors[i]];
			var team = player.getTeam();

			// Switch in the first available Pokemon
			for(var n = 0; n < team.length; n++){
				if(team[n].hp > 0){
					self.queueAction(phaseProps.actors[i], "switch", n);
					break;
				}
			}
		}
	}

	// For the emulator, push an animation into the list of animations from this turn

	this.pushAnimation = function(actor, type, value){
		turnAnimations.push({
			actor: actor,
			type: type,
			value: value
		});
	}

	// Set whether to emulate or simulate

	this.setBattleMode = function(val){
		mode = val;
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
			hp: pokemon.hp,
			string: string
		});
	}

	// Output debug log to console

	this.debug = function(){

		for(var i = 0; i < decisionLog.length; i++){
			var log = decisionLog[i];

			console.log(log.turn + "\t:\t" + log.pokemon.speciesName + "(" + log.hp + ") " + log.string);
		}
	}

	this.getDuration = function(){
		return duration;
	}

	this.getTimeline = function(){
		return timeline;
	}
};
