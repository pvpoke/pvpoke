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
	var switchTimerMarked = false; // Flag for if the 60 second marker has been displayed yet in the timeline

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

	var debugMode = false;

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
		
		poke.reset();
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

	// Return the current simulation mode

	this.getMode = function(){
		return mode;
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

	// Returns array of actions queued by all Pokemon
	this.getQueuedActions = function(){
		return queuedActions;
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
		switchTimerMarked = false;
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
							self.pushAnimation(poke.index, "fast", pokemon[action.actor].turns);
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

					if(poke.hp < 1 && poke.faintSource == "charged"){
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

		if((mode == "simulate")&&(matchupDisplayTime >= 45000)&&(! switchTimerMarked)){
			timeline.push(new TimelineEvent("switchAvailable", "Switch Available (45 seconds)", 0, time, turns));
			switchTimerMarked = true;
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

		if((poke.cooldown == 0)&&(! poke.hasActed)){
			if((! sandbox)||((mode == "emulate")&&(players[poke.index].getAI() !== false)&&(poke.hp > 0))){
				poke.hasActed = true;

				if(mode == "simulate"){
					if(decisionMethod == "default"){
						action = ActionLogic.decideAction(self, poke, opponent);
					} else{
						action = ActionLogic.decideRandomAction(self, poke, opponent);
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
						poke.setStartHp(poke.hp);
						poke.setStartEnergy(poke.energy);

						// Revert current Pokemon to original form
						if(poke.formChange && poke.activeFormId != poke.originalFormId){
							poke.startFormId = poke.originalFormId;
							poke.changeForm(poke.originalFormId);
						}
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

		let attackerChangedForm = false;
		let defenderChangedForm = false;

		// Apply pre-attack form changes
		if(attacker.formChange && attacker.formChange.trigger == "activate_charged" && attacker.activeFormId != attacker.formChange.alternativeFormId
			&& move.energy > 0  && (attacker.formChange.moveId == "ANY" || attacker.formChange.moveId == move.moveId)){
			attacker.changeForm(attacker.formChange.alternativeFormId);

			self.logDecision(attacker, " has changed forms into " + attacker.activeFormId);

			if(mode == "emulate"){
				self.pushAnimation(attacker.index, "formchange", attacker.activeFormId);
			}

			attackerChangedForm = true;
		}

		var type = "fast " + move.type;
		var damage = DamageCalculator.damage(attacker, defender, move, charge, mode, players);
		move.damage = damage;

		var displayTime = time;
		var shieldBuffModifier = 0;

		self.logDecision(attacker, " uses " + move.name);

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
				var shieldDecision = ActionLogic.wouldShield(self, attacker, defender, move);

				// Don't shield early PUP's, Acid Sprays, or similar moves
				if( (! sandbox) && move.buffs && move.selfBuffing){
					if( (move.buffTarget == "self" && move.buffs[0] > 0) ||
					(move.buffTarget == "opponent" && move.buffs[1] < 0)){
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
						var turnsToNextCharged = fastToNextCharged * defender.fastMove.turns;
						var cycleDamage = (fastToNextCharged * defender.fastMove.damage) + defender.bestChargedMove.damage;

						var attackerTurnsToNextCharged = Math.ceil((attacker.activeChargedMoves[0].energy - attacker .energy) / attacker.fastMove.energyGain) * attacker.fastMove.turns;

						if(attacker.stats.atk > defender.stats.atk){
							attackerTurnsToNextCharged--;
						}

						if((turnsToNextCharged >= attackerTurnsToNextCharged) && (attacker.hp <= cycleDamage)){
							useShield = shieldDecision.value;
						}
					}
				}

				if(defender.activeFormId == "aegislash_shield" && damage * 2 < defender.hp){
					useShield = false;
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

					var option = ActionLogic.chooseOption(shieldOptions);

					if(option.name == "YES"){
						useShield = true;
					} else{
						useShield = false;
					}
				}

				if(mode == "emulate" && players[defender.index].getShields() == 0){
					useShield = false;
				}

				if(useShield){
					var damageBlocked = damage-1;

					let shieldTimelineDescriptions = [damageBlocked];

					damage = 1;
					defender.shields--;
					roundShieldUsed = true;

					// Apply form changes
					if(defender.formChange && defender.formChange.trigger == "activate_shield" && defender.activeFormId != defender.formChange.alternativeFormId){
						defender.changeForm(defender.formChange.alternativeFormId);

						self.logDecision(defender, " has changed forms into " + defender.activeFormId);

						if(mode == "emulate"){
							self.pushAnimation(defender.index, "formchange", defender.activeFormId);
						}

						defenderChangedForm = true

						shieldTimelineDescriptions.push("Form Change");
					}

					timeline.push(new TimelineEvent("shield", "Shield", defender.index, time+8500, turns, shieldTimelineDescriptions));

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

					self.logDecision(defender, " blocks with a shield");

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

					self.logDecision(defender, " doesn't shield because it can withstand the attack and is saving shields for later, boosted attacks");
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

			let energyGain = attacker.fastMove.energyGain;

			// Hard code to apply to custom moves
			if(attacker.activeFormId == "aegislash_shield"){
				energyGain = 6;
			}


			attacker.energy += energyGain;

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

		// Hard code to apply to custom moves
		if(attacker.activeFormId == "aegislash_shield" && move.energyGain > 0){
			damage = 1;
		}

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

		// Hard code override for Shield forme with custom move
		if(attacker.activeFormId == "aegislash_shield" && move.energyGain > 0 && move.moveId.indexOf("AEGISLASH_CHARGE") == -1){
			energyValue = 6;
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

		// Apply post-attack form changes
		if(attacker.formChange && attacker.formChange.trigger == "charged_move" && attacker.activeFormId != attacker.formChange.alternativeFormId
			&& move.energy > 0 && (attacker.formChange.moveId == "ANY" || attacker.formChange.moveId == move.moveId)){

			attacker.changeForm(attacker.formChange.alternativeFormId);

			self.logDecision(attacker, " has changed forms into " + attacker.activeFormId);

			if(mode == "emulate"){
				self.pushAnimation(attacker.index, "formchange", attacker.activeFormId);
			}

			attackerChangedForm = true;
		}

		if(attackerChangedForm){
			timelineDescriptions.push("Form Change");
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

		var fastMoveTurns = Math.ceil(target.hp / subject.fastMove.damage) * subject.fastMove.turns;
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
				chargedMoveTurns = 1 + (fastMovesFromChargedMove * subject.fastMove.turns);
			} else{
				chargedMoveTurns = 1 + (fastMovesFromChargedMove * subject.fastMove.turns) + (Math.ceil((target.hp-sequenceDamage) / subject.fastMove.damage) * subject.fastMove.turns);
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

	this.logDecision = function(pokemon, string){
		if(! debugMode)
			return false;

		decisionLog.push({
			turn: turns,
			pokemon: pokemon,
			hp: pokemon.hp,
			string: string
		});
	}

	// Output debug log to console, debugMode must be set to true to collect logs

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

	this.setDebugMode = function(value){
		debugMode = value;
	}
};
