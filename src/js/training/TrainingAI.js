// Load AI archetypes

var file = webRoot+"data/training/aiArchetypes.json?v=1";
var aiData = [];

$.getJSON( file, function( data ){
	aiData = data;
	console.log("AI data loaded ["+aiData.length+"]");
});

function TrainingAI(l, p, b){
	var level = parseInt(l);
	var player = p;
	var battle = b;
	var gm = GameMaster.getInstance();
	var teamPool = [];
	var partySize = 3;
	var props = aiData[l];
	var generateRosterCallback;
	var self = this;

	var currentStrategy; // The current employed strategy to determine behavior
	var scenarios;

	var turnLastEvaluated = 0;

	if(level == 0){
		chargedMoveCount = 1;
	}

	// Generate a random roster of 6 given a cup and league

	this.generateRoster = function(size, callback){
		partySize = size;
		generateRosterCallback = callback;

		var league = battle.getCP();
		var cup = battle.getCup().name;

		if(! teamPool[league+""+cup]){
			gm.loadTeamData(league, cup, self.setTeamPool);
			return;
		}

		var pool = teamPool[league+""+cup];
		var slotBucket = [];
		var slots = [];

		// Put all the slots in bucket, multiple times for its weight value

		for(var i = 0; i < pool.length; i++){
			for(var n = 0; n < pool[i].weight; n++){
				slotBucket.push(pool[i].slot);
			}
		}

		// Draw 6 unique slots from the bucket

		for(var i = 0; i < 6; i++){
			var index = Math.floor(Math.random() * slotBucket.length);
			var slot = slotBucket[index];
			var synergies = pool.filter(obj => {
  				return obj.slot === slot
			})[0].synergies;
			slots.push(slot);

			// Add synergies to bucket to increase chances of picking them
			for(var n = 0; n < synergies.length; n++){
				if(slotBucket.indexOf(synergies[n]) > -1){
					slotBucket.push(synergies[n], synergies[n]);
				}
			}

			// Clear the selected value from the bucket
			var itemIndex = 0;
			while ((itemIndex = slotBucket.indexOf(slot, itemIndex)) > -1) {
			  slotBucket.splice(itemIndex, 1);
			}
		}

		// For each slot, pick a random Pokemon

		var roster = [];
		var selectedIds = []; // Array of Pokemon ID's to check to avoid duplicates

		for(var i = 0; i < slots.length; i++){
			// Grab the pool of Pokemon given the slot name
			var slotPool = pool.filter(obj => {
  				return obj.slot === slots[i]
			})[0].pokemon;
			var pokeBucket = [];

			for(var n = 0; n < slotPool.length; n++){
				var poke = slotPool[n];
				// Is this Pokemon valid to be added to the team?
				if((selectedIds.indexOf(poke.speciesId) === -1)&&(Math.abs(poke.difficulty - level) <= 1)){
					for(var j = 0; j < poke.weight; j++){
						pokeBucket.push(poke);
					}
				}
			}

			// Select a random poke from the bucket
			var index = Math.floor(Math.random() * pokeBucket.length);
			var poke = pokeBucket[index];
			var pokemon = new Pokemon(poke.speciesId, player.index, battle);
			pokemon.initialize(battle.getCP());

			// Select a random IV spread according to difficulty
			var ivCombos = pokemon.generateIVCombinations("overall", 1, props.ivComboRange);
			var rank = Math.floor(Math.random() * ivCombos.length);

			// If this Pokemon maxes under or near 1500, make sure it's close to 1500
			if(ivCombos[0].level >= 39){
				rank = Math.floor(Math.random() * 50 * (props.ivComboRange  / 4000));
			}
			var combo = ivCombos[rank];

			pokemon.setIV("atk", combo.ivs.atk);
			pokemon.setIV("def", combo.ivs.def);
			pokemon.setIV("hp", combo.ivs.hp);
			pokemon.setLevel(combo.level);

			pokemon.selectMove("fast", poke.fastMove);
			for(var n = 0; n < props.chargedMoveCount; n++){
				pokemon.selectMove("charged", poke.chargedMoves[n], n);
			}

			if(props.chargedMoveCount == 1){
				pokemon.selectMove("charged", "none", 1);
			}

			roster.push(pokemon);
			selectedIds.push(poke.speciesId);
		}

		player.setRoster(roster);
		generateRosterCallback(roster);
	}

	// With a set roster, produce a team of 3

	this.generateTeam = function(opponentRoster, previousResult, previousTeams){
		var roster = player.getRoster();
		var team = [];
		
		// Reset all Pokemon involves
		
		for(var i = 0; i < opponentRoster.length; i++){
			opponentRoster[i].fullReset();
		}
		
		for(var i = 0; i < roster.length; i++){
			roster[i].fullReset();
		}

		// Choose a pick strategy
		var pickStrategyOptions = [];

		if(! previousResult){
			// If this is a fresh round, use these strategies
			pickStrategyOptions.push(new DecisionOption("BASIC", 1));
			pickStrategyOptions.push(new DecisionOption("BEST", 4));
			pickStrategyOptions.push(new DecisionOption("COUNTER", 4));
			pickStrategyOptions.push(new DecisionOption("UNBALANCED", 2));
		} else{
			// If this is subsequent round, use these strategies
			var winStratWeight = 2;
			var loseStratWeight = 2;

			if(previousResult == "win"){
				loseStratWeight = 6;
			} else if(previousResult == "loss"){
				winStratWeight = 6;
			}

			pickStrategyOptions.push(new DecisionOption("SAME_TEAM", winStratWeight));
			pickStrategyOptions.push(new DecisionOption("SAME_TEAM_DIFFERENT_LEAD", winStratWeight));
			pickStrategyOptions.push(new DecisionOption("COUNTER_LAST_LEAD", loseStratWeight));
			pickStrategyOptions.push(new DecisionOption("COUNTER", loseStratWeight));
		}

		var pickStrategy = self.chooseOption(pickStrategyOptions).name;

		console.log(pickStrategy);

		switch(pickStrategy){
			// Choose a random set of 3 from the roster
			case "BASIC":
				var startIndex = Math.floor(Math.random() * 4);
				for(var i = 0; i < 3; i++){
					team.push(roster[startIndex + i]);
				}
				break;

			// Choose a team that has the best average matchups against the opponent's roster
			case "BEST":
				var teamPerformance = self.calculateAverageRosterPerformance(roster, opponentRoster);

				// Lead with the best average Pokemon
				team.push(teamPerformance[0].pokemon);

				// Next, let's give it a bodyguard
				var scenarios = teamPerformance[0].scenarios;
				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to best

				var targets = [scenarios[0].opponent, scenarios[1].opponent];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				// Finally, let's round them out with a Pokemon that does best against their collective counters
				teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
				targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);
				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				break;

			// Choose a team that counter's the opponent's best Pokemon
			case "COUNTER":
				var teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, roster);
				var scenarios = teamPerformance[0].scenarios;

				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to best

				// Lead with the best counter
				team.push(scenarios[0].opponent);

				// Next, let's give it a bodyguard
				var scenarios = self.runBulkScenarios("NO_BAIT", team[0], opponentRoster);
				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to last

				var targets = [scenarios[0].opponent, scenarios[1].opponent];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				// Finally, let's round them out with a Pokemon that does best against their collective counters
				teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
				targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);
				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				break;

			// Choose two high performance Pokemon and lead with a bodyguard
			case "UNBALANCED":
				var teamPerformance = self.calculateAverageRosterPerformance(roster, opponentRoster);

				// Choose the best two average Pokemon
				team.push(teamPerformance[0].pokemon, teamPerformance[1].pokemon);

				// Finally, let's round lead with a Pokemon that does best against their collective counters
				teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
				targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);
				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.splice(0, 0, teamPerformance[i].pokemon);
						break;
					}
				}

				break;

			// Use the same team as last time
			case "SAME_TEAM":
				var previousTeam = previousTeams[1];

				for(var i = 0; i < previousTeam.length; i++){
					team.push(previousTeam[i]);
				}
				break;

			// Use the same team as last time but with the previous lead's bodyguard as the lead
			case "SAME_TEAM_DIFFERENT_LEAD":
				var previousTeam = previousTeams[1];

				team.push(previousTeam[1]);
				previousTeam.splice(1,1);

				for(var i = 0; i < previousTeam.length; i++){
					team.push(previousTeam[i]);
				}
				break;

			// Choose a team that counter's the opponent's previous lead
			case "COUNTER_LAST_LEAD":
				var opponentPreviousLead = previousTeams[0][0];

				var teamPerformance = self.calculateAverageRosterPerformance([opponentPreviousLead], roster);
				var scenarios = teamPerformance[0].scenarios;

				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to best

				// Lead with the best counter
				team.push(scenarios[0].opponent);

				// Next, let's give it a bodyguard
				var scenarios = self.runBulkScenarios("NO_BAIT", team[0], opponentRoster);
				scenarios.sort((a,b) => (a.average > b.average) ? 1 : ((b.average > a.average) ? -1 : 0)); // Sort by worst to last

				var targets = [scenarios[0].opponent, scenarios[1].opponent];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				// Finally, let's round them out with a Pokemon that does best against their collective counters
				teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
				targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

				teamPerformance = self.calculateAverageRosterPerformance(roster, targets);
				// Add the best bodyguard that isn't the currently selected Pokemon
				for(var i = 0; i < teamPerformance.length; i++){
					if(team.indexOf(teamPerformance[i].pokemon) == -1){
						team.push(teamPerformance[i].pokemon);
						break;
					}
				}

				break;
		}
		console.log(team);

		player.setTeam(team);
	}

	// Return an array of average performances of team A against team B

	this.calculateAverageRosterPerformance = function(teamA, teamB){
		var results = [];

		for(var i = 0; i < teamA.length; i++){
			var scenarios = self.runBulkScenarios("NO_BAIT", teamA[i], teamB);
			var average = 0;

			for(var n = 0; n < scenarios.length; n++){
				average += scenarios[n].average;
			}

			average /= scenarios.length;

			results.push({
				pokemon: teamA[i],
				scenarios: scenarios,
				average: average
			});
		}

		// Sort by average rating
		results.sort((a,b) => (a.average > b.average) ? -1 : ((b.average > a.average) ? 1 : 0));
		return results;
	}

	// Set the pool of available Pokemon from data

	this.setTeamPool = function(league, cup, data){
		teamPool[league+""+cup] = data;
		self.generateRoster(partySize, generateRosterCallback);
	}

	// Evaluate the current matchup and decide a high level strategy

	this.evaluateMatchup = function(turn, pokemon, opponent, opponentPlayer){
		// Preserve current HP, energy, and stat boosts
		pokemon.startHp = pokemon.hp;
		pokemon.startEnergy = pokemon.energy;
		pokemon.startStatBuffs = [pokemon.statBuffs[0], pokemon.statBuffs[1]];
		pokemon.startCooldown = pokemon.cooldown;
		pokemon.startingShields = pokemon.shields;
		pokemon.baitShields = true;
		pokemon.farmEnergy = false;

		opponent.startHp = opponent.hp;
		opponent.startEnergy = opponent.energy;
		opponent.startStatBuffs = [opponent.statBuffs[0], opponent.statBuffs[1]];
		opponent.startCooldown = opponent.cooldown;
		opponent.startingShields = opponent.shields;
		opponent.baitShields = true;
		opponent.farmEnergy = false;

		// Sim multiple scenarios to help determine strategy

		scenarios = {};

		scenarios.bothBait = self.runScenario("BOTH_BAIT", pokemon, opponent);
		scenarios.neitherBait = self.runScenario("NEITHER_BAIT", pokemon, opponent);
		scenarios.noBait = self.runScenario("NO_BAIT", pokemon, opponent);
		scenarios.farm = self.runScenario("FARM", pokemon, opponent);

		var overallRating = (scenarios.bothBait.average + scenarios.neitherBait.average + scenarios.noBait.average) / 3;

		var options = [];
		var totalSwitchWeight = 0;

		if((self.hasStrategy("SWITCH_BASIC"))&&(player.getSwitchTimer() == 0)&&(player.getRemainingPokemon() > 1)){
			var switchWeight = Math.floor(Math.max((500 - overallRating) / 10, 0));

			// Don't switch Pokemon when HP is low
			if((self.hasStrategy("PRESERVE_SWITCH_ADVANTAGE"))&&(opponentPlayer.getSwitchTimer() - player.getSwitchTimer() < 30)&&(pokemon.hp / pokemon.stats.hp <= .25)&&(opponentPlayer.getRemainingPokemon() > 1)){
				switchWeight = 0;
			}
			options.push(new DecisionOption("SWITCH_BASIC", switchWeight));

			totalSwitchWeight += switchWeight;

			// See if it's feasible to build up energy before switching
			if(self.hasStrategy("SWITCH_FARM")){
				var dpt = (opponent.fastMove.damage / (opponent.fastMove.cooldown / 500));
				var percentPerTurn = (dpt / pokemon.startHp) * 100; // The opponent's fast attack will deal this % damage per turn
				var weightFactor =  Math.pow(Math.round(Math.max(3 - percentPerTurn, 0)), 2);

				totalSwitchWeight += (switchWeight * weightFactor);
				options.push(new DecisionOption("SWITCH_FARM", switchWeight * weightFactor));
			}
		}

		// If there's a decent chance this Pokemon really shouldn't switch out, add other actions

		if(totalSwitchWeight < 10){
			options.push(new DecisionOption("DEFAULT", 1));

			if((self.hasStrategy("BAIT_SHIELDS"))&&(opponent.shields > 0)){
				var baitWeight = Math.round( (scenarios.bothBait.average - scenarios.noBait.average) / 20);

				// If this Pokemon's moves are very close in DPE, prefer the shorter energy move
				if((scenarios.bothBait.average >= 500)&&(pokemon.chargedMoves.length == 2)){
					if(Math.abs(pokemon.chargedMoves[0].dpe - pokemon.chargedMoves[1].dpe) <= .1){
						baitWeight += 5;
					}
				}

				options.push(new DecisionOption("BAIT_SHIELDS", baitWeight));
			}

			if(self.hasStrategy("FARM_ENERGY")){
				var farmWeight = Math.round( (scenarios.farm.average - 600) / 20);
				if(opponentPlayer.getRemainingPokemon() < 2){
					farmWeight = 0;
				}
				options.push(new DecisionOption("FARM", farmWeight));
			}
		}

		// Decide the AI's operating strategy
		var option = self.chooseOption(options);
		self.processStrategy(option.name);

		if(turn !== undefined){
			turnLastEvaluated = battle.getTurns();
		} else{
			turnLastEvaluated = 1;
		}
	}

	// Run a specific scenario

	this.runScenario = function(type, pokemon, opponent){
		var scenario = {
			opponent: opponent,
			name: type,
			matchups: [],
			average: 0,
			minShields: 3
		};

		// Preserve old Pokemon stats
		var startStats = [
			{
				shields: pokemon.startingShields,
				hp: pokemon.hp,
				energy: pokemon.energy,
				cooldown: pokemon.cooldown
			},
			{
				shields: opponent.startingShields,
				hp: opponent.hp,
				energy: opponent.energy,
				cooldown: opponent.cooldown
			}
		];

		switch(type){
			case "BOTH_BAIT":
				pokemon.baitShields = true;
				pokemon.farmEnergy = false;
				opponent.baitShields = true;
				opponent.farmEnergy = false;
				break;

			case "NEITHER_BAIT":
				pokemon.baitShields = false;
				pokemon.farmEnergy = false;
				opponent.baitShields = false;
				opponent.farmEnergy = false;
				break;

			case "NO_BAIT":
				pokemon.baitShields = false;
				pokemon.farmEnergy = false;
				opponent.baitShields = true;
				opponent.farmEnergy = false;
				break;

			case "FARM":
				pokemon.baitShields = true;
				pokemon.farmEnergy = true;
				opponent.baitShields = true;
				opponent.farmEnergy = false;
				break;
		}

		var b = new Battle();
		b.setNewPokemon(pokemon, 0, false);
		b.setNewPokemon(opponent, 1, false);

		for(var i = 0; i <= startStats[0].shields; i++){
			for(n = 0; n <= startStats[1].shields; n++){
				pokemon.startingShields = i;
				opponent.startingShields = n;
				b.simulate();

				var rating = b.getBattleRatings()[0];
				scenario.matchups.push(rating);
				scenario.average += rating;

				if((rating >= 500)&&(i < scenario.minShields)){
					scenario.minShields = i;
				}
			}
		}

		scenario.average /= scenario.matchups.length;

		pokemon.startingShields = startStats[0].shields;
		pokemon.startHp = startStats[0].hp;
		pokemon.startEnergy = startStats[0].energy;
		pokemon.startCooldown = startStats[0].cooldown;

		opponent.startingShields = startStats[1].shields;
		opponent.startHp = startStats[1].hp;
		opponent.startEnergy = startStats[1].energy;
		opponent.startCooldown = startStats[1].cooldown;

		pokemon.reset();
		opponent.reset();
		pokemon.index = 1;
		pokemon.farmEnergy = false;
		opponent.index = 0;
		opponent.farmEnergy = false;

		return scenario;
	}

	this.runBulkScenarios = function(type, pokemon, opponents){
		var scenarios = [];

		for(var i = 0; i < opponents.length; i++){
			var scenario = self.runScenario(type, pokemon, opponents[i]);
			scenarios.push(scenario);
		}

		return scenarios;
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

	// Change settings to accomodate a new strategy

	this.processStrategy = function(strategy){
		currentStrategy = strategy;

		var pokemon = battle.getPokemon()[player.getIndex()];

		switch(currentStrategy){
			case "SWITCH_FARM":
				pokemon.farmEnergy = true;
				break;

			case "FARM":
				pokemon.farmEnergy = true;
				break;

			case "DEFAULT":
				pokemon.baitShields = false;
				pokemon.farmEnergy = false;
				break;

			case "BAIT_SHIELDS":
				pokemon.baitShields = true;
				pokemon.farmEnergy = false;
				break;
		}
	}

	this.decideAction = function(turn, poke, opponent){
		var action = null;

		console.log(poke.speciesId + " " + currentStrategy);

		poke.setBattle(battle);
		poke.resetMoves();

		if((currentStrategy.indexOf("SWITCH") > -1) && (player.getSwitchTimer() == 0)){
			var performSwitch = false;

			if((currentStrategy == "SWITCH_BASIC") && (turn - turnLastEvaluated >= props.reactionTime)){
				performSwitch = true;
			}

			if(currentStrategy == "SWITCH_FARM"){
				// Check to see if the opposing Pokemon is close to a damaging Charged Move
				var potentialDamage = self.calculatePotentialDamage(opponent, poke, opponent.energy);

				// How much potential damage will they have after one more Fast Move?

				var extraFastMoves = Math.floor((poke.fastMove.cooldown - opponent.cooldown) / (opponent.fastMove.cooldown))
				var futureEnergy = opponent.energy + (extraFastMoves * opponent.fastMove.energyGain);
				var futureDamage = self.calculatePotentialDamage(opponent, poke, futureEnergy);

				if((futureDamage >= poke.hp)||(futureDamage >= poke.stats.hp * .15)){
					performSwitch = true;
				}

			}

			if(performSwitch){
				// Determine a Pokemon to switch to
				var switchChoice = self.decideSwitch();
				action = new TimelineAction("switch", player.getIndex(), turn, switchChoice, {priority: poke.priority});
			}
		}

		poke.resetMoves(true);

		if(! action){
			action = battle.decideAction(poke, opponent);
		}

		return action;
	}

	// Return the index of a Pokemon to switch to

	this.decideSwitch = function(){
		var switchOptions = [];
		var team = player.getTeam();
		var poke = battle.getPokemon()[player.getIndex()];
		var opponent = battle.getOpponent(player.getIndex());

		for(var i = 0; i < team.length; i++){
			var pokemon = team[i];

			if((pokemon.hp > 0)&&(pokemon != poke)){
				var scenario = self.runScenario("NO_BAIT", pokemon, opponent);
				var weight = Math.round(scenario.average / 100);

				if(scenario.average > 500){
					weight *= 10;
				}

				switchOptions.push(new DecisionOption(i, weight));
			}
		}

		var switchChoice = self.chooseOption(switchOptions);
		return switchChoice.name;
	}

	// Decide whether or not to shield a Charged Attack

	this.decideShield = function(attacker, defender, m){
		// First, how hot are we looking in this current matchup?
		var currentScenario = self.runScenario("NO_BAIT", defender, attacker);
		var currentRating = currentScenario.average;
		var currentHp = defender.hp;
		var estimatedEnergy = defender.energy + (Math.floor(Math.random() * (props.energyGuessRange * 2)) - props.energyGuessRange);
		var potentialDamage = 0;
		var potentialHp = defender.hp - potentialDamage;

		// Which move do we think the attacker is using?
		var moves = [];
		var minimumEnergy = 100;

		for(var i = 0; i < attacker.chargedMoves.length; i++){
			if(minimumEnergy > attacker.chargedMoves[i].energy){
				minimumEnergy = attacker.chargedMoves[i].energy;

				if(estimatedEnergy < minimumEnergy){
					estimatedEnergy = minimumEnergy; // Want to make sure at least one valid move can be guessed
				}
			}


			if(estimatedEnergy >= attacker.chargedMoves[i].energy){
				attacker.chargedMoves.damage = battle.calculateDamage(attacker, defender, attacker.chargedMoves[i], true);
				moves.push(attacker.chargedMoves[i]);
			}
		}

		// Sort moves by damage

		moves.sort((a,b) => (a.damage > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

		var moveGuessOptions = [];

		for(var i = 0; i < moves.length; i++){
			var moveWeight = 1;
			// Is this the actual move being used? Cheat a little bit and give the AI some heads up
			if(moves[i].name == m.name){
				moveWeight += props.moveGuessCertainty;
			}
			moveGuessOptions.push(new DecisionOption(i, moveWeight));
		}

		var move = moves[self.chooseOption(moveGuessOptions).name]; // The guessed move of the attacker

		// Great! We've guessed the move, now let's analyze if we should shield like a player would
		var yesWeight = 1;
		var noWeight = 1;

		// Will this attack hurt?
		var damageWeight = Math.min(Math.round((move.damage / defender.stats.hp) * 10), 10);

		if(damageWeight > 4){
			damageWeight = damageWeight - 4;
			yesWeight += (damageWeight * 2);
		} else{
			damageWeight = 4 - damageWeight;
			noWeight += damageWeight;
		}

		// Is this move going to knock me out?
		if(move.damage >= defender.hp){
			// How good of a matchup is this for us?
			if(currentRating > 500){
				yesWeight += Math.round((currentRating - 500) / 10)
			} else if(player.getRemainingPokemon() > 1){
				noWeight += Math.round((500 - currentRating) / 10)
			}
		}

		// How many Pokemon do I have left compared to shields?

		if(yesWeight - noWeight > -3){
			yesWeight += (3 - player.getRemainingPokemon()) * 3;
		}

		var options = [];
		options.push(new DecisionOption(true, yesWeight));
		options.push(new DecisionOption(false, noWeight));

		var decision = self.chooseOption(options).name;

		return decision;
	}

	// Given a pokemon and its stored energy, how much potential damage can it deal?

	this.calculatePotentialDamage = function(attacker, defender, energy, stack){
		stack = typeof stack !== 'undefined' ? stack : true;

		var totalDamage = [];

		for(var i = 0; i < attacker.chargedMoves.length; i++){
			var countMultiplier = Math.floor(energy / attacker.chargedMoves[i].energy);
			if(! stack){
				countMultiplier = 0;
				if(attacker.chargedMoves[i].energy <= energy){
					countMultiplier = 1;
				}
			}

			var damage = countMultiplier * battle.calculateDamage(attacker, defender, attacker.chargedMoves[i], true);
			totalDamage.push(damage);
		}

		if(totalDamage.length == 0){
			return 0;
		} else{
			return Math.max.apply(Math, totalDamage);
		}
	}

	// Return whether not this AI can run the provided strategy
	this.hasStrategy = function(strategy){
		return (props.strategies.indexOf(strategy) > -1);
	}

	// Return the AI's difficulty level

	this.getLevel = function(){
		return level;
	}

	// Return the name of the difficulty level
	this.difficultyToString = function(){
		var name = "AI";

		switch(level){
			case 0:
				name = "Novice";
				break;

			case 1:
				name = "Rival";
				break;

			case 2:
				name = "Elite";
				break;

			case 3:
				name = "Champion";
				break;
		}

		return name;
	}

}
