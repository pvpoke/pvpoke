// JavaScript Document

function Battle(){
	var gm = GameMaster.getInstance();
	var interface;

	var self = this;
	var pokemon = [null, null];
	var players = [];
	var cp = 1500;
	var levelCap = 50;
	var cup = {name: "all", include: [], exclude: [{
		filterType: "tag",
		values: ["mega"]
	}]}; // List of allowed types

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
	var decisionMethod = "default"; // Default or random

	// Battle properties

	var timeline = [];
	var time;
	var matchupDisplayTime;
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
	var thirtySecondMarked = false; // Flag for if the 60 second marker has been displayed yet in the timeline

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

		if(poke.activeFormId != poke.startFormId){
			poke.reset();
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

	this.getCP = function(forURLStr){
		forURLStr = typeof forURLStr !== 'undefined' ? forURLStr : false;

		if((forURLStr)&&(levelCap != 50)){
			return cp + "-"+ + levelCap;
		} else{
			return parseInt(cp);
		}

	}

	this.setCP = function(cpLimit){
		cp = cpLimit;

		for(var i = 0; i < pokemon.length; i++){
			if(pokemon[i]){
				pokemon[i].initialize(cp);
			}
		}
	}

	this.setLevelCap = function(val){
		levelCap = val;

		for(var i = 0; i < pokemon.length; i++){
			if(pokemon[i]){
				pokemon[i].initialize(cp);
			}
		}
	}

	this.getLevelCap = function(){
		return levelCap;
	}

	// Set cup object from Game Master

	this.setCup = function(cupName){
		cup = gm.getCupById(cupName);

		if(! cup){
			return false;
		}

		if(cup.levelCap){
			self.setLevelCap(cup.levelCap);
		}
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

		var attackStatMultiplier = attacker.getStatBuffMultiplier(0, true);

		var attack = ((damage - 1) * defense) / (move.power * move.stab * effectiveness * attacker.shadowAtkMult * attackStatMultiplier * 0.5 * bonusMultiplier);

		return attack;
	}

	// Solve for Defense given the damage, attack, effectiveness, and move

	this.calculateBulkpoint = function(attacker, defender, damage, attack, effectiveness, move){

		var bonusMultiplier = 1.3;

		var defenseStatMultiplier = defender.getStatBuffMultiplier(1, true);

		var defense =  (move.power * move.stab * effectiveness * 0.5 * bonusMultiplier * attack) / (damage);

		defense = (defense * defenseStatMultiplier) / defender.shadowDefMult;

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
		matchupDisplayTime = 0;
		turns = 1;
		lastProcessedTurn = 0;
		turnsToWin = [0, 0];
		timeline = [];
		queuedActions = [];
		turnActions = [];
		turnMessages = [];
		turnAnimations = [];
		sixtySecondMarked = false;
		thirtySecondMarked = false;
		decisionLog = [];
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

		// Check for a Charged Move this turn to apply floating Fast Moves
		var chargedMoveQueuedThisTurn = false;

		for(var i = 0; i < queuedActions.length; i++){
			var action = queuedActions[i];
			if(action.type == "charged"){
				chargedMoveQueuedThisTurn = true;
			}
		}


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
				} else if(chargedMoveQueuedThisTurn){
					action.settings.priority -= 20;
					valid = true;
				}

				/*if((timeSinceActivated >= 500)&&(chargedMoveLastTurn)){
					action.settings.priority += 20;
					valid = true;
				}*/
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

			switch(action.type){

				case "fast":
					action.valid = true;

					if(opponent.hp < 1){
						action.valid = false;
					}

					if((poke.hp < 1)&&(chargedMoveUsed)){
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
					}

					// Check if knocked out from a priority move
					if((usePriority)&&(poke.hp <= 0)&&(poke.faintSource == "charged")){
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

					// This prevents Charged Moves from being used on the same turn as lethal Fast Moves
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
			matchupDisplayTime += deltaTime;
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

		if((mode == "simulate")&&(matchupDisplayTime >= 50000)&&(! sixtySecondMarked)){
			timeline.push(new TimelineEvent("switchAvailable", "Switch Available (50 seconds)", 0, time, turns));
			sixtySecondMarked = true;
		}

		if((mode == "simulate")&&(matchupDisplayTime >= 30000)&&(! thirtySecondMarked)){
			//timeline.push(new TimelineEvent("switchAvailable", "Switch Available (30 seconds)", 0, time, turns));
			thirtySecondMarked = true;
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
			}

			// Reset after a charged move

			if(roundChargedMoveUsed){
				poke.cooldown = 0;
			}
		}

		if((mode == "emulate")&&(faintedPokemonIndexes.length > 0)&&(phase == "neutral")){

			// Push faint animations
			for(var i = 0; i < faintedPokemonIndexes.length; i++){
				self.pushAnimation(faintedPokemonIndexes[i], "switch", true);
			}

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
					if(decisionMethod == "default"){
						action = self.decideAction(poke, opponent);
					} else{
						action = self.decideRandomAction(poke, opponent);
					}

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
					action.settings.priority += 15;
				}
			}
		}

		return action;
	}

	// Run AI decision making to determine battle action this turn, and return the resulting action

	this.decideAction = function(poke, opponent){

		var chargedMoveReady = [];
		var winsCMP = poke.stats.atk >= opponent.stats.atk;

		var fastDamage = self.calculateDamage(poke, opponent, poke.fastMove);
		var oppFastDamage = self.calculateDamage(opponent, poke, opponent.fastMove);
		var hasNonDebuff = false;

		// If no Charged Moves at all, return
		if(poke.activeChargedMoves.length < 1){
			useChargedMove = false;
			return;
		}

		// If no charged move ready, always throw fast move or farm energy is on
		if (poke.energy < poke.fastestChargedMove.energy || poke.farmEnergy) {
			useChargedMove = false;
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
				chargedMoveReady.push(Math.ceil((poke.activeChargedMoves[n].energy - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.cooldown / 500);
			}
		}

		var turnsToLive = Infinity;
		var queue = [];
		var moveTurns = poke.fastMove.cooldown / 500;

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
					if (currState.turn > poke.fastMove.cooldown / 500) {
						continue;
					}
				} else {
					if (currState.turn > poke.fastMove.cooldown / 500 + 1) {
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
						var moveDamage = self.calculateDamage(opponent, poke, opponent.activeChargedMoves[n]);

						if (moveDamage >= currState.hp) {
							turnsToLive = Math.min(currState.turn, turnsToLive);

							if(poke.stats.atk > opponent.stats.atk && opponent.fastMove.cooldown % poke.fastMove.cooldown == 0){
								turnsToLive++;
							}

							self.logDecision(turns, poke, " opponent has energy to use " + opponent.activeChargedMoves[n].name + " and it would do " + moveDamage + " damage. I have " + turnsToLive + " turn(s) to live, opponent has " + currState.opEnergy);
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
				turnsToLive = Math.min(currState.turn + (opponent.fastMove.cooldown / 500), turnsToLive);
				break;
			} else {
				queue.unshift(
					{
						hp: currState.hp - oppFastDamage,
						opEnergy: currState.opEnergy + opponent.fastMove.energyGain,
						turn: currState.turn + opponent.fastMove.cooldown / 500,
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
						var moveDamage = self.calculateDamage(poke, opponent, poke.activeChargedMoves[n]);

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
					useChargedMove = false;
					self.logDecision(turns, poke, " uses a fast move because it has " + turnsToLive + " turn(s) before it is KO'd but has no energy.");
					return;
				// Throw highest damage move
				} else {

					self.logDecision(turns, poke, " uses " + poke.chargedMoves[maxDamageMoveIndex].name + " because it has " + turnsToLive + " turn(s) before it is KO'd.");

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

		// Throw a lethal Charged Move if it will faint the opponent

		if(! poke.farmEnergy && opponent.shields == 0){
			for(var n = 0; n < poke.activeChargedMoves.length; n++) {
				var move = poke.activeChargedMoves[n];
				var moveIndex = poke.chargedMoves.indexOf(poke.activeChargedMoves[n]);

				if(poke.energy >= move.energy){
					var moveDamage = self.calculateDamage(poke, opponent, poke.activeChargedMoves[n]);

					// Don't throw self debuffing moves at this point, or if the opponent will faint from Fast Move damage
					if(opponent.hp <= moveDamage && (! move.selfDebuffing) && (n == 0 || (n == 1 && ! poke.baitShields)) && opponent.hp > poke.fastMove.damage){

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
				var turnsPlanned = (poke.fastMove.cooldown / 500) + Math.floor(poke.energy / poke.activeChargedMoves[0].energy);

				if(poke.stats.atk < opponent.stats.atk){
					turnsPlanned++;
				}

				if(turnsPlanned > turnsToLive){
					optimizeTiming = false;
				}

				self.logDecision(turns, poke, " has " + turnsToLive + " turns to live");

				// Don't optimize if we can KO with a Charged Move
				if(opponent.shields == 0){
					for(var n = 0; n < poke.activeChargedMoves.length; n++) {
						poke.activeChargedMoves[n].damage = self.calculateDamage(poke, opponent, poke.activeChargedMoves[n]);

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
					var turnsFromMove = (fastMovesFromCharged * (opponent.fastMove.cooldown / 500)) + 1;

					opponent.activeChargedMoves[n].damage = self.calculateDamage(opponent, poke, opponent.activeChargedMoves[n]);

					var moveDamage = opponent.activeChargedMoves[n].damage + (opponent.fastMove.damage * fastMovesInFastMove);

					if(poke.shields > 0){
						moveDamage = 1 + (opponent.fastMove.damage * fastMovesInFastMove)
					}

					if (turnsFromMove <= (poke.fastMove.cooldown / 500) && moveDamage >= poke.hp) {
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
					useChargedMove = false;
					self.logDecision(turns, poke, " is optimizing move timing");
					return;
				}
			}
		}

		// Evaluate if opponent can't be fainted in a limited number of cycles. If so, do a simpler move selection.

		var bestChargedDamage = self.calculateDamage(poke, opponent, poke.bestChargedMove);
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
				if(poke.baitShields && opponent.shields > 0 && ! poke.activeChargedMoves[0].selfDebuffing && self.wouldShield(poke, opponent, poke.activeChargedMoves[1]).value){
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
				useChargedMove = false;
				return;
			} else{
				// Stack self debuffing moves
				if(selectedMove.selfDebuffing){
					var energyToReach = poke.energy + (Math.floor((100 - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.energyGain);
					if(poke.energy < energyToReach){
						useChargedMove = false;
						return;
					}
				}

				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(selectedMove),
					{shielded: false, buffs: false, priority: poke.priority});

				chargedMoveUsed = true;
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
				self.logDecision(turns, poke, " considered too many states, likely an infinite loop");
				useChargedMove = false;
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
					DPchargedMoveReady.push(Math.ceil((poke.activeChargedMoves[n].energy - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.cooldown / 500);
				}
			}

			// Push states onto queue in order of TURN
			for(var n = 0; n < poke.activeChargedMoves.length; n++) {

				// Apply stat changes to pokemon attack
				var currentStatBuffs = [poke.statBuffs[0], poke.statBuffs[1]];
				poke.applyStatBuffs([currState.buffs, 0]);

				var moveDamage = self.calculateDamage(poke, opponent, poke.activeChargedMoves[n]);
				var fastSimulatedDamage = self.calculateDamage(poke, opponent, poke.fastMove);

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
					DPQueue.unshift(new BattleState(currState.energy + poke.fastMove.energyGain * movesToFarmDown, 0, currState.turn + movesToFarmDown * poke.fastMove.cooldown / 500, currState.opponentShields, currState.moves, currState.buffs, currState.chance));
				} else {
					while (DPQueue[i].turn <= currState.turn + movesToFarmDown * poke.fastMove.cooldown / 500) {
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
						DPQueue.splice(i, 0, new BattleState(currState.energy + poke.fastMove.energyGain * movesToFarmDown, 0, currState.turn + movesToFarmDown * poke.fastMove.cooldown / 500, currState.opponentShields, currState.moves, currState.buffs, currState.chance));
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

						var newTurn = Math.ceil((poke.activeChargedMoves[n].energy * 2 - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.cooldown / 500;
						newEnergy = Math.floor(newTurn / (poke.fastMove.cooldown / 500)) * poke.fastMove.energyGain + currState.energy - poke.activeChargedMoves[n].energy;

						if (newTurn != 0) {
							// Calculate new health
							newOppHealth = currState.oppHealth - fastSimulatedDamage * (newTurn / (poke.fastMove.cooldown / 500));

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
					var newEnergy = currState.energy - poke.activeChargedMoves[n].energy + poke.fastMove.energyGain * (DPchargedMoveReady[n] / (poke.fastMove.cooldown / 500));
					var newOppHealth = currState.oppHealth - moveDamage - fastSimulatedDamage * (DPchargedMoveReady[n] / (poke.fastMove.cooldown / 500));

					// If shields are up, only apply fast move damage
					if (currState.oppShields > 0) {
						newOppHealth = currState.oppHealth - fastSimulatedDamage * (DPchargedMoveReady[n] / (poke.fastMove.cooldown / 500)) - 1;
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

						newTurn = Math.ceil((poke.activeChargedMoves[n].energy * 2 - currState.energy) / poke.fastMove.energyGain) * poke.fastMove.cooldown / 500;
						newEnergy = Math.floor(newTurn / (poke.fastMove.cooldown / 500)) * poke.fastMove.energyGain + currState.energy - poke.activeChargedMoves[n].energy;

						// Calculate new health
						newOppHealth = currState.oppHealth - fastSimulatedDamage * (newTurn / (poke.fastMove.cooldown / 500));

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
			useChargedMove = false;
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
			self.logDecision(turns, poke, " changes its plan because it needs the BOOST to win or debuff");
			finalState = bestPlan;

		} else {
			// We guaranteed KO before opponent or opponent hasn't evaluated their turnsToKO yet.
			finalState = stateList[stateList.length - 1];
		}


		// Return if plan is the farm down
		if (finalState.moves.length == 0) {

			if(! poke.getBoostMove()){
				self.logDecision(turns, poke, " wants to farm down");
				useChargedMove = false;
				return;
			} else{
				finalState.moves.push(poke.getBoostMove());
				self.logDecision(turns, poke, " will force throw a boost move");
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
					self.logDecision(turns, poke, " doesn't use " + finalState.moves[0].name + " because it wants to bait");
					useChargedMove = false;
					return;
				}
			}
		}

		// Don't bait if the opponent won't shield
		if (poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves.length > 1) {
			var dpeRatio = (poke.activeChargedMoves[1].damage / poke.activeChargedMoves[1].energy) / (finalState.moves[0].damage / finalState.moves[0].energy);

			if ((poke.energy >= poke.activeChargedMoves[1].energy)&&(dpeRatio > 1.5)) {
				if(! self.wouldShield(poke, opponent, poke.activeChargedMoves[1]).value){
					finalState.moves[0] = poke.activeChargedMoves[1];
				}
			}
		}

		// If pokemon needs boost, we cannot reorder and no moves both buff and debuff
		if (!needsBoost) {
			// If not baiting shields or shields are down and no moves debuff, throw most damaging move first
			if (!poke.baitShields || (opponent.shields == 0 && debuffingMove == false)) {
				finalState.moves.sort(function(a, b) {
					var moveDamage1 = self.calculateDamage(poke, opponent, a);
					var moveDamage2 = self.calculateDamage(poke, opponent, b);
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
			if((opponent.energy >= opponent.bestChargedMove.energy)&&(! self.wouldShield(opponent, poke, opponent.bestChargedMove).value)&&(! poke.activeChargedMoves[0].selfBuffing)){
				useChargedMove = false;
				self.logDecision(turns, poke, " is deferring its self debuffing move until after the opponent fires its move");
				return;
			}
		}

		// If move is self debuffing and doesn't KO, try to stack as much as you can
		if (finalState.moves[0].selfDebuffing) {
			//var targetEnergy = poke.energy + (Math.round( (100 - poke.energy) / poke.fastMove.energyGain) * poke.fastMove.energyGain);
			targetEnergy = Math.floor(100 / finalState.moves[0].energy) * finalState.moves[0].energy;

			if (poke.energy < targetEnergy) {
				var moveDamage = self.calculateDamage(poke, opponent, finalState.moves[0]);
				if ((opponent.hp > moveDamage || opponent.shields != 0) && (poke.hp > opponent.fastMove.damage * 2 || opponent.fastMove.cooldown - poke.fastMove.cooldown > 500)){
					useChargedMove = false;
					self.logDecision(turns, poke, " doesn't use " + finalState.moves[0].name + " because it wants to minimize time debuffed and it can stack the move " + Math.floor(100 / finalState.moves[0].energy) + " times");
					return;
				}
			} else if(poke.baitShields && opponent.shields > 0 && poke.activeChargedMoves[0].energy - finalState.moves[0].energy <= 10 && ! poke.activeChargedMoves[0].selfDebuffing){
				// Use the lower energy move if it's a boosting move or if the opponent would shield the bigger move
				if(poke.activeChargedMoves[0].selfBuffing || self.wouldShield(poke, opponent, finalState.moves[0]).value){
					finalState.moves[0] = poke.activeChargedMoves[0];
				}
			}
		}


		// Use the final move, or a Fast Move if not enough energy
		if (poke.energy >= finalState.moves[0].energy) {
			if (finalState.moves.length > 1) {
				self.logDecision(turns, poke, " uses " + finalState.moves[0].name + " because it thinks that using " + (finalState.moves.length - 1) + " moves afterwards is the best plan.");

				// Debugging Log
				for (var i = 1; i < finalState.moves.length; i++) {
					self.logDecision(turns, poke, " wants to use " + finalState.moves[i].name + " after it uses " + finalState.moves[i - 1].name);
				}

			} else {
				self.logDecision(turns, poke, " uses " + finalState.moves[0].name + " at turn " + turns + " because it KO's or it wants to farm down afterwards");
			}

		} else {
			useChargedMove = false;
			self.logDecision(turns, poke, " uses a fast move because it has no energy for " + finalState.moves[0].name);
			return;
		}


		action = new TimelineAction(
			"charged",
			poke.index,
			turns,
			poke.chargedMoves.indexOf(finalState.moves[0]),
			{shielded: false, buffs: false, priority: poke.priority});

		chargedMoveUsed = true;
		return action;
	}

	// Select a randomized action for this turn
	this.decideRandomAction = function(poke, opponent){
		var fastMoveWeight = 10;
		var hasKnockoutMove = false;
		var actionOptions = [];
		var chargedMoveValues = [];

		// Evaluate when to randomly use Charged Moves
		for(var i = 0; i < poke.activeChargedMoves.length; i++){
			if(poke.energy >= poke.activeChargedMoves[i].energy){
				poke.activeChargedMoves[i].damage = self.calculateDamage(poke, opponent, poke.activeChargedMoves[i]);
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

		let actionType = self.chooseOption(actionOptions);
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

				chargedMoveUsed = true;
				break;

			case "CHARGED_MOVE_1":
				action = new TimelineAction(
					"charged",
					poke.index,
					turns,
					poke.chargedMoves.indexOf(poke.activeChargedMoves[1]),
					{shielded: false, buffs: false, priority: poke.priority});

				chargedMoveUsed = true;
				break;
		}

		return action;
	}

	// Choose an option from an array
	this.chooseOption = function(options){
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

	// Queue an action to be processed on the next available turn

	this.queueAction = function(actor, type, value){
		// First, clear any existing actions that belong to the current actor

		for(var i = 0; i < actions.length; i++){
			// Don't override a switch
			if(actions[i].actor == actor){
				if((actions[i].type != "switch")||(type == "switch")){
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

						// If multiple moves are set to process on this turn, continue the same turn
						var continueSameTurn = false;

						for(var i = 0; i < turnActions.length; i++){
							if(((turnActions[i].type == "charged")||(turnActions[i].type == "fast"))&&(turnActions[i].actor != poke.index)){
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

			matchupDisplayTime += chargedMinigameTime;

			// Add tap events for display

			for(var i = 0; i < 8; i++){
				timeline.push(new TimelineEvent("tap "+move.type, "Swipe", attacker.index, time+(1000*i), turns, [i]));
			}

			// If defender has a shield, use it

			if( ((sandbox) && (forceShields) && (defender.shields > 0)) || ((! sandbox) && (defender.shields > 0)) ){
				var useShield = true;
				var shieldWeight = 1;
				var noShieldWeight = 1; // Used for randomized shielding decisions
				var shieldDecision = self.wouldShield(attacker, defender, move);

				// Don't shield early PUP's, Acid Sprays, or similar moves
				if( (! sandbox) && move.buffs && move.selfBuffing){
					if( (move.buffTarget == "self" && move.buffs[0] > 0) ||
					move.buffTarget == "opponent" ){
						useShield = shieldDecision.value;
					}

					// For moves with multiple targets
					if( move.buffTarget == "both" && (move.buffsSelf[0] > 0 ||
					move.buffsOpponent[1] < 0) ){
						useShield = shieldDecision.value;
					}
				}

				// Don't shield early moves if the user has a defense debuffing move

				if( (! sandbox) && defender.bestChargedMove && defender.bestChargedMove.selfDefenseDebuffing){
					if(attacker.shields > 0){
						useShield = shieldDecision.value;
					} else if(defender.bestChargedMove && attacker.bestChargedMove){
						// If the attacker has no shields, shield this attack if the defender's next move will knock out the attacker
						var fastToNextCharged = Math.ceil( (defender.bestChargedMove.energy - defender.energy) / defender.fastMove.energyGain);
						var turnsToNextCharged = fastToNextCharged * (defender.fastMove.cooldown / 500);
						var cycleDamage = (fastToNextCharged * defender.fastMove.damage) + defender.bestChargedMove.damage;

						var attackerTurnsToNextCharged = Math.ceil((attacker.activeChargedMoves[0].energy - attacker .energy) / attacker.fastMove.energyGain) * (attacker.fastMove.cooldown / 500);

						if(attacker.stats.atk > defender.stats.atk){
							attackerTurnsToNextCharged--;
						}

						if((turnsToNextCharged >= attackerTurnsToNextCharged) && (attacker.hp <= cycleDamage)){
							useShield = shieldDecision.value;
						}
					}
				}

				if(decisionMethod == "random"){
					// For randomized battles, randomize shield usage
					shieldWeight = shieldDecision.shieldWeight;
					noShieldWeight = shieldDecision.noShieldWeight;

					// Shield the move if it's the lowest energy move and guaranteed to KO

					var lowestMoveEnergy = attacker.chargedMoves[0].energy;
					var lowestMoveDamage = attacker.chargedMoves[0].damage;

					if((attacker.chargedMoves.length > 1)&&(attacker.chargedMoves[1].energy < lowestMoveEnergy)){
						lowestMoveEnergy = attacker.chargedMoves[1].energy;
					}

					if((attacker.chargedMoves.length > 1)&&(attacker.chargedMoves[1].damage < lowestMoveDamage)){
						lowestMoveDamage = attacker.chargedMoves[1].damage;
					}

					if((move.energy == lowestMoveEnergy)&&(damage >= defender.hp * .75)){
						shieldWeight += 10;
					}

					if((move.energy == lowestMoveEnergy)&&(damage >= defender.hp * .95)){
						noShieldWeight = 0;
					}

					if(lowestMoveDamage >= defender.hp * .95){
						noShieldWeight = 0;
					}

					var shieldOptions = [
						new DecisionOption("YES", shieldWeight),
						new DecisionOption("NO", noShieldWeight)
					];

					var option = self.chooseOption(shieldOptions);

					if(option.name == "YES"){
						useShield = true;
					} else{
						useShield = false;
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

					if(mode == "emulate"){
						turnMessages.push({ index: defender.index, str: "Blocked!"});
					}

					// Don't debuff if it shields

					if((move.buffs)&&(move.buffTarget == "opponent")){
						shieldBuffModifier = 0;
					}

					self.logDecision(turns, defender, " blocks with a shield");

					// If a shield has already been used, add time so events don't visually overlap

					if((usePriority)&&(roundChargedMoveUsed > 0)&&(roundShieldUsed > 0)){
						displayTime = time;
					}

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

		if((move.energyGain > 0)&&(roundChargedMoveUsed)){
			displayTime += 9500;
		}



		// Apply move buffs and debuffs

		var buffApplied = false;

		if(move.buffs){

			// Roll against the buff chance to see if it applies

			var buffRoll = Math.random() + buffChanceModifier + shieldBuffModifier; // Totally not Really Random but just to get off the ground for now

			if(forceBuff){
				buffRoll += 2; // Allow this to overcome the buffChanceModifier
			}

			if((move.buffApplyChance == 1)&&(! sandbox)){
				buffRoll += 1; // Force guaranteed buffs even when they're disabled
			}

			// For moves that have a buff apply chance, apply the deterministically by incrementing a value each activation based on the chance
			if((move.buffApplyChance < 1) && (move.buffApplyMeter !== undefined) &&(! sandbox)&&(buffChanceModifier == -1)){

				var startApplyCount = Math.floor(move.buffApplyMeter);
				move.buffApplyMeter += move.buffApplyChance;

				// If the cumulative activations of this move pass a whole number, deterministically apply the buff
				if(startApplyCount < Math.floor(move.buffApplyMeter)){
					buffRoll += 2;
				}
			}

			if(buffRoll > 1 - move.buffApplyChance){

				// Gather targets for move buffs or debuffs
				var buffTargets = [];
				var buffType = "debuff";

				if((move.buffTarget == "opponent")||(move.buffTarget == "both")){
					var buffType = "debuff";
					var buffs = move.buffs;

					if(move.buffTarget == "both"){
						buffs = move.buffsOpponent;
					}

					if((buffs[0] > 0) || (buffs[1] > 0)){
						buffType = "buff";
					}

					buffTargets.push({
						target: defender,
						buffs: buffs,
						buffType: buffType
					});
				}

				if((move.buffTarget == "self")||(move.buffTarget == "both")){
					buffType = "debuff";
					buffs = move.buffs;

					if(move.buffTarget == "both"){
						buffs = move.buffsSelf;
					}

					if((buffs[0] > 0) || (buffs[1] > 0)){
						buffType = "buff";
					}

					buffTargets.push({
						target: attacker,
						buffs: buffs,
						buffType: buffType
					});
				}

				// Apply all buff effects to their relevant targets

				for(var i = 0; i < buffTargets.length; i++){
					var buffs = buffTargets[i].buffs;

					buffTargets[i].target.applyStatBuffs(buffs);

					// In emulated battles, add buff messages

					if(mode == "emulate"){
						var statNames = ["Attack","Defense"];

						for(var n = buffs.length-1; n >= 0; n--){
							if(buffs[n] != 0){
								var statDescription = "";

								if(buffs[n] < -1){
									statDescription = "fell sharply";
								} else if(buffs[n] == -1){
									statDescription = "fell";
								} else if(buffs[n] == 1){
									statDescription = "rose";
								} else if(buffs[n] > 1){
									statDescription = "rose sharply";
								}

								turnMessages.push({ index: buffTargets[i].target.index, str: statNames[n] + " " + statDescription +"!"});
							}
						}
					}
				}

				buffApplied = true;

				// Set string for Charged Move timeline event

				var buffType = "debuff";

				if((move.buffs[0] > 0) || (move.buffs[1] > 0)){
					buffType = "buff";
				}

				type += " " + buffType;

			}

		}

		// Set energy value for TimelineEvent

		var energyValue = move.energyGain;
		var percentDamage = Math.round((damage / defender.stats.hp) * 1000) / 10;

		if(move.energy > 0){
			energyValue = -move.energy;
		}

		var timelineDescriptions = [damage, energyValue, percentDamage]

		if(buffApplied){
			var buffStr = "";

			if(move.buffs[0] != 0){
				if(move.buffs[0] > 0){
					buffStr += "+";
				}

				buffStr += move.buffs[0] + " Attack";

				if(move.buffs[1] != 0){
					buffStr += "<br>";
				}
			}

			if(move.buffs[1] > 0){
				buffStr += "+";
			}

			if(move.buffs[1] != 0){
				buffStr += move.buffs[1] + " Defense";
			}

			timelineDescriptions.push(buffStr);
		}

		// Apply form changes
		if(attacker.formChange){
			if(attacker.formChange.trigger == "charged_move" && move.energy > 0 && (attacker.formChange.moveId == "ANY" || attacker.formChange.moveId == move.moveId)){
				attacker.changeForm();

				timelineDescriptions.push("Form Change");
				self.logDecision(turns, attacker, " has changed forms into " + attacker.activeFormId);

				if(mode == "emulate"){
					self.pushAnimation(attacker.index, "formchange", attacker.activeFormId);
				}
			}

		}

		timeline.push(new TimelineEvent(type, move.name, attacker.index, displayTime, turns, timelineDescriptions));

		// If a Pokemon has fainted, clear the action queue

		if(defender.hp <= 0){

			// Mark how this Pokemon fainted
			var moveType = "fast";

			if(move.energy > 0){
				moveType = "charged";
			}

			defender.faintSource = moveType;

			if(mode == "emulate"){
				queuedActions = [];
			}
		}

		return time;
	}

	// Returns a boolean for default sims, and weights for randomized sims to determine if a Pokemon would shield a Charged Move

	this.wouldShield = function(attacker, defender, move){
		var useShield = false;
		var shieldWeight = 1;
		var noShieldWeight = 2; // Used for randomized shielding decisions
		var damage = self.calculateDamage(attacker, defender, move);
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

		var fastDamage = self.calculateDamage(attacker, defender, attacker.fastMove);

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
		var fastDPT = fastDamage / (attacker.fastMove.cooldown / 500);

		for (var i = 0; i < attacker.chargedMoves.length; i++){
			var chargedMove = attacker.chargedMoves[i];

			if(attacker.energy + chargedMove.energy >= chargedMove.energy){
				var chargedDamage = self.calculateDamage(attacker, defender, chargedMove);

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
		if((mode == "simulate")&&(attacker.baitShields == 2)){
			useShield = true;
		}

		return {
			value: useShield,
			shieldWeight: shieldWeight,
			noShieldWeight: noShieldWeight
		};
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
			[74,85,169],
			[11,118,215]
		]; // rgb
		var lossColors = [
			[199,12,112],
			[111,56,160]
		]; // rgb

		if(settings.colorblindMode){
			winColors = [
				[59,113,227],
				[26,133,255]
			]; // rgb

			lossColors = [
				[212,17,89],
				[178,39,120]
			]; // rgb
		}

		// Apply a gradient to bar color
		var colors = (rating <= 500) ? lossColors : winColors;
		var color = [ colors[0][0], colors[0][1], colors[0][2] ];

		if(rating > 1000){
			rating = 1000;
		} else if(rating < 0){
			rating = 0;
		}

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

	// Returns whether a battle rating was a win, close win, tie, close loss, or loss

	this.getRatingClass = function(rating){
		if(rating == 500){
			return "tie";
		} else if( (rating < 500) && (rating > 250)){
			return "close-loss";
		} else if( rating <= 250){
			return "loss";
		} else if( (rating > 500) && (rating < 750)){
			return "close-win";
		} else if( rating >= 750){
			return "win";
		}
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

				var buffs = (event.values[3] !== undefined); // Check to see if any buff or debuff values are associated with this event

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
			buffChanceModifier = -1;
			actions = self.convertTimelineToActions();
		} else{
			buffChanceModifier = 0;
		}
	}

	// Set whether decisions are decided by the default deterministic method, or random

	this.setDecisionMethod = function(val){
		decisionMethod = val;
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

	this.getDisplayTime = function(){
		return matchupDisplayTime;
	}

	this.getTimeline = function(){
		return timeline;
	}

	// State used for DP in battle simulation
	function BattleState(pokeEnergy, opponentHealth, currentTurn, opponentShields, usedMoves, attackBuff, probability) {
		this.energy = pokeEnergy;
		this.oppHealth = opponentHealth;
		this.turn = currentTurn;
		this.oppShields = opponentShields;
		this.moves = usedMoves;
		this.buffs = attackBuff;
		this.chance = probability;
	}
};
