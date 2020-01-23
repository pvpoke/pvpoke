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

	this.calculateDamageByStats = function(attack, defense, effectiveness, move){

		var bonusMultiplier = 1.3;

		var damage = Math.floor(move.power * move.stab * (attack/defense) * effectiveness * 0.5 * bonusMultiplier) + 1;

		return damage;
	}

	// Solve for Attack given the damage, defense, effectiveness, and move

	this.calculateBreakpoint = function(damage, defense, effectiveness, move){

		var bonusMultiplier = 1.3;

		var attack = ((damage - 1) * defense) / (move.power * move.stab * effectiveness * 0.5 * bonusMultiplier);

		return attack;
	}

	// Solve for Defense given the damage, attack, effectiveness, and move

	this.calculateBulkpoint = function(damage, attack, effectiveness, move){

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

		// In emulated battles, randomize priority

		if(mode == "emulate"){
			pokemon[0].priority = (Math.random() > .5) ? 1 : 0;
			pokemon[1].priority = (pokemon[0].priority == 0) ? 1 : 0;
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
					if(action.type == "fast"){
						cooldownsToSet[i] += poke.fastMove.cooldown;
					}

					// Are both Pokemon alive?

					if((action.type == "switch")||((action.type != "switch")&&(poke.hp > 0)&&(opponent.hp > 0))){
						if((action.type=="fast")&&(mode == "emulate")){
							// Submit an animation to be played
							self.pushAnimation(poke.index, "fast", pokemon[action.actor].fastMove.cooldown / 500);
						}

						var valid = true;

						if((action.type == "fast")&&(poke.chargedMovesOnly)){
							valid = false;
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
						if(opponent.cooldown > 0){
							opponent.chargedMovesOnly = true;
						}
						opponent.cooldown = 0;

						var a = self.getTurnAction(opponent, poke);
						if((a)&&(a.type == "charged")){
							queuedActions.push(a);
						}
					}
					poke.cooldown = 0;
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

		// Use primary charged move if available

		if((poke.bestChargedMove) && (poke.energy >= poke.bestChargedMove.energy)){

			// Use maximum number of Fast Moves before opponent can act

			var useChargedMove = true;

			self.logDecision(turns, poke, "'s best charged move is charged (" + poke.bestChargedMove.name + ")");

			// Don't use a charged move if fast moves will result in a KO
			var faintThreshold = poke.fastMove.damage;

			if(mode == "emulate"){
				faintThreshold = poke.fastMove.damage * 2;
			}

			if(opponent.hp <= faintThreshold){
				useChargedMove = false;

				self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because a fast move will knock out the opponent");
			}

			if(opponent.shields > 0){

			   if(opponent.hp <= (poke.fastMove.damage * (opponent.fastMove.cooldown / poke.fastMove.cooldown))){
					useChargedMove = false;

					self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because opponent has shields and fast moves will knock them out before their cooldown completes");
				}
			}

			// Don't use best charged move if opponent has shields and a cheaper move is charged

			for(var n = 0; n < poke.chargedMoves.length; n++){

				if(poke.chargedMoves[n] == poke.bestChargedMove){
					continue;
				}

				// Don't use best charged move if a cheaper move is available to bait or faint
				if((poke.energy >= poke.chargedMoves[n].energy) && ((poke.chargedMoves[n].energy < poke.bestChargedMove.energy) || ((poke.chargedMoves[n].energy == poke.bestChargedMove.energy)&&(poke.chargedMoves[n].buffs)))){
					if((poke.baitShields)&&(opponent.shields > 0)&&(! poke.chargedMoves[n].selfDebuffing)){
						useChargedMove = false;

						self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because it has a cheaper move to remove shields");
					}

					if(opponent.hp <= poke.chargedMoves[n].damage){
						useChargedMove = false;

						self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because it has a cheaper move to faint");
					}
				}

				// Don't use best charged move if it's a self debuffing move and a close non-debuffing move is available to burn shields
				if((poke.energy >= poke.chargedMoves[n].energy) && ((poke.chargedMoves[n].energy - poke.bestChargedMove.energy <= 10))){
					if((poke.baitShields)&&(opponent.shields > 0)&&(! poke.chargedMoves[n].selfDebuffing)&&(poke.bestChargedMove.selfAttackDebuffing)){
						useChargedMove = false;

						self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because it has a close non-debuffing move to remove shields");
					}
				}
			}

			// Don't use a Charged Move if primary attack has a self debuff and you can build more energy

			if((poke.bestChargedMove.buffTarget)&&( (poke.bestChargedMove.buffTarget == "self") && (poke.bestChargedMove.buffs[0] < 0 || poke.bestChargedMove.buffs[1] < 0))&&(poke.energy < Math.min(poke.bestChargedMove.energy * 2, 100))){
				useChargedMove = false;

				self.logDecision(turns, poke, " doesn't use " + poke.bestChargedMove.name + " because it wants to minimize time debuffed");
			}

			if(poke.farmEnergy){
				useChargedMove = false;
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
				if((move.damage >= opponent.hp) && (! poke.farmEnergy) && (move.energy <= poke.bestChargedMove.energy) && (!chargedMoveUsed)){

					// Don't try to KO with a self debuffing Charged Move if they still have shields
					var avoidSelfDebuff = false;

					if((opponent.shields > 0)&&(move.buffTarget)&&(move.buffTarget == "self")&&(move.buffs[0] < 0 || move.buffs[1] < 0)&&(poke.energy < Math.min(move.energy * 2, 100))){
						avoidSelfDebuff = true;
					}

					if((opponent.shields > 0)&&(poke.bestChargedMove.buffTarget)&&(poke.bestChargedMove.buffTarget == "self")&&(poke.bestChargedMove.buffs[0] < 0 || poke.bestChargedMove.buffs[1] < 0)&&(poke.bestChargedMove.energy < Math.min(move.energy * 2, 100))){
						avoidSelfDebuff = true;
					}

					if(! avoidSelfDebuff){
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
				}

				// Use this charged move if it has a guaranteed stat effect and this Pokemon has high fast move damage

				if((move.buffApplyChance)&&(move.buffApplyChance == 1)&&(poke.fastMove.damage / ((poke.fastMove.cooldown / 500) * opponent.stats.hp) >= .025)&&(opponent.hp > poke.bestChargedMove.damage)&&((move.buffs[0] > 0)||(move.buffs[1] > 0))){
					action = new TimelineAction(
						"charged",
						poke.index,
						turns,
						moveIndex,
						{shielded: false, buffs: false, priority: poke.priority});

					chargedMoveUsed = true;
					self.logDecision(turns, poke, " is looking to build up stat boosts with " + move.name);
					return action;
				}

				// Use charged move if the opponent has a shield

				if((opponent.shields > 0)  && (!chargedMoveUsed) && (! poke.farmEnergy) && (((!poke.baitShields)&&(move == poke.bestChargedMove))||( (poke.baitShields) && (poke.energy >= poke.bestChargedMove.energy)))){

					// Use this move if it has less than or equal energy than the Pokemon's fastest move
					if((move.energy == poke.fastestChargedMove.energy)||((move.energy - poke.fastestChargedMove.energy <= 10)&&(poke.fastestChargedMove.selfAttackDebuffing)&&(! move.selfDebuffing)&&(poke.baitShields))){

						// Don't use a charged move if a fast move will result in a KO

						if((opponent.hp > poke.fastMove.damage)&&(opponent.hp > (poke.fastMove.damage *(opponent.fastMove.cooldown / poke.fastMove.cooldown)))){

							var avoidSelfDebuff = false;

							if((opponent.shields > 0)&&(move.buffTarget)&&(move.buffTarget == "self")&&(move.buffs[0] < 0 || move.buffs[1] < 0)&&(poke.energy < Math.min(move.energy * 2, 100))){
								avoidSelfDebuff = true;
							}

							if(! avoidSelfDebuff){
								self.logDecision(turns, poke, " wants to remove shields with " + move.name + " and opponent won't faint from fast move damage before next cooldown");

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
				}

				// Use charged move if about to be KO'd

				var nearDeath = false;

				// Will a Fast Move knock it out?
				if((poke.hp <= opponent.fastMove.damage)&&(opponent.cooldown / poke.fastMove.cooldown < 3)){
					nearDeath = true;

					self.logDecision(turns, poke, " will be knocked out by opponent's fast move this turn");
				}

				// Will a 1 turn Fast Move knock it out next turn?
				if((poke.hp <= opponent.fastMove.damage * 2)&&(opponent.fastMove.cooldown == 500)){
					nearDeath = true;

					self.logDecision(turns, poke, " will be knocked out by opponent's fast move next turn");
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

				// If this Pokemon uses a Fast Move, will it be knocked out while on cooldown?
				if( (((opponent.cooldown > 0) && (opponent.cooldown < poke.fastMove.cooldown)) || ((opponent.cooldown == 0) && (opponent.fastMove.cooldown < poke.fastMove.cooldown))) && (roundChargedMoveUsed == 0)){

					// Can this Pokemon be knocked out by future Fast Moves?

					var availableTime = poke.fastMove.cooldown - opponent.cooldown;
					var futureActions = Math.ceil(availableTime / opponent.fastMove.cooldown);

					// If this Pokemon has already acted and they have a 1 turn move, add an action

					if(opponent.fastMove.cooldown == 500){
						futureActions++;
					}

					if((roundChargedMoveUsed > 0)||(roundChargedMovesInitiated > 0)){
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

						if(opponent.cooldown == 500){
							futureEffectiveEnergy += opponent.fastMove.energyGain;
						}

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

				// Don't use this Charged Move if a better one is available

				if((poke.bestChargedMove)&&(poke.energy >= poke.bestChargedMove.energy)&&(move.damage < poke.bestChargedMove.damage)&&((!poke.baitShields)||(opponent.shields == 0))){
					nearDeath = false;

					self.logDecision(turns, poke, " doesn't use " + move.name + " because a better move is available");
				}

				// Don't process this if battle continues until both Pokemon faint

				if(battleEndMode == "both"){
					nearDeath = false;
				}

				if((nearDeath)&&(!chargedMoveUsed)&&(! poke.farmEnergy)){
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

				if((! sandbox)&&(move.buffs)&&(move.buffs[0] > 0 || move.buffs[1] < 0)&&(move.buffApplyChance == 1)){
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
