function PlayerAI(p, b){
	var player = p;
	var battle = b;
	var gm = GameMaster.getInstance();
	var teamPool = [];
	var currentTeamPool = null;
	var teamSelectMode = "normal";
	var partySize = 3;
	//var props = aiData;
	var generateRosterCallback;
	var self = this;

	var scenarios;

	var turnLastEvaluated = 0;

	if(level == 0){
		chargedMoveCount = 1;
	}

	var hiddenLayerSizes = [10,10,10];
	// battle state = 126
	var numStates = this.getBattleState(0, player.getTeam()[0], battle.getPlayers[1].getTeam()[0], player, battle.getPlayers[1]).length;
	var m = new PlayerModel(b, hiddenLayerSizes, numStates , 5, 100);

	var playerPrevRemaining = 3;
	var oppPrevRemaining = 3;

	// Generate a random roster of 6 given a cup and league
	// keeping

	this.generateRoster = function(size, callback, customTeamPool){
		partySize = size;
		generateRosterCallback = callback;

		var league = battle.getCP();
		var cup = battle.getCup().name;

		if((! teamPool[league+""+cup])&&(!customTeamPool)){
			gm.loadTeamData(league, cup, self.setTeamPool);
			return;
		}

		var pool;

		if(! customTeamPool){
			pool = teamPool[league+""+cup];
			currentTeamPool = teamPool[league+""+cup];
			teamSelectMode = "normal";
		} else{
			if(customTeamPool.data){
				pool = {
					"presets": customTeamPool.data
				}
			} else{
				pool = {
					"presets": customTeamPool
				}
			}

			currentTeamPool = pool;
			teamSelectMode = "preset";
		}

		// Test current pool for errors
		self.testPool(pool);

		if(pool.slots){
			pool = pool.slots;
		}

		var slotBucket = [];
		var slots = [];
		var roles = []; // Array of roles that have been filled on the team

		// Choose presets
		if(pool.presets){
			// Select a random preset team
			var presets = pool.presets;
			var presetIndex = Math.floor(Math.random() * pool.presets.length);
			var preset = pool.presets[presetIndex];
			pool = [];

			// For each Pokemon in the preset team, make a new "slot"

			for(var i = 0; i < preset.pokemon.length; i++){
				var slot = {
					slot: i,
					synergies: [],
					pokemon: [],
					weight: 1
				};

				preset.pokemon[i].weight = 1;
				preset.pokemon[i].difficulty = level;

				slot.pokemon.push(preset.pokemon[i]);

				pool.push(slot);
			}
		}

		// Put all the slots in bucket, multiple times for its weight value

		for(var i = 0; i < pool.length; i++){
			for(var n = 0; n < pool[i].weight; n++){
				slotBucket.push(pool[i].slot);
			}
		}

		// Draw unique slots from the bucket
		var rosterSize = 6;

		if((battle.getCup().partySize == 3)&&(battle.getCup().presetOnly)){
			rosterSize = battle.getCup().partySize;
		}

		if((teamSelectMode == "preset")&&(partySize == 3)){
			rosterSize = 3;
		}

		for(var i = 0; i < rosterSize; i++){
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
		var restrictedPicks = 0;
		var restrictedLimit = 6;
		var restrictedPicksExist = false;

		if(battle.getCup().restrictedPicks){
			restrictedLimit = battle.getCup().restrictedPicks;
			restrictedPicksExist = true;
		}

		for(var i = 0; i < slots.length; i++){
			// Grab the pool of Pokemon given the slot name
			var slotPool = pool.filter(obj => {
  				return obj.slot === slots[i]
			})[0].pokemon;
			var pokeBucket = [];

			// Choose from restricted picks if available
			if((restrictedPicksExist)&&(restrictedPicks<restrictedLimit)){
				var slotObj = pool.filter(obj => {
  				return obj.slot === slots[i]
			})[0];

				if(slotObj.restricted){
					slotPool = slotObj.restricted;
					restrictedPicks++;
				}
			}

			for(var n = 0; n < slotPool.length; n++){
				var poke = slotPool[n];
				var role = "none";

				if(poke.role){
					role = poke.role;
				}
				// Is this Pokemon valid to be added to the team?
				if((selectedIds.indexOf(poke.speciesId) === -1)&&(Math.abs(poke.difficulty - level) <= 1)&&(roles.indexOf(role) == -1)){
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

			if(self.hasStrategy("OPTIMIZE_TIMING")){
				pokemon.optimizeMoveTiming = true;
			}

			roles.push(poke.role);

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

			if(poke.shadowType){
				pokemon.setShadowType(poke.shadowType);
			}

			roster.push(pokemon);
			selectedIds.push(poke.speciesId);
		}

		player.setRoster(roster);
		generateRosterCallback(roster);
	}

	// With a set roster, produce a team of 3
	// keeping

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

		// In Single 3v3 mode, use the Basic option most of the time depending on difficulty
		var basicWeight = 1;

		if(opponentRoster.length < 6){
			basicWeight = (4 * (4 - level));

			// Make the teams more random in GO Battle League

			if((battle.getCup().partySize)&&(battle.getCup().partySize == 3)){
				basicWeight *= 3;
			}
		}

		// Choose a pick strategy
		var pickStrategyOptions = [];

		if(! previousResult){
			// If this is a fresh round, use these strategies
			pickStrategyOptions.push(new DecisionOption("BASIC", basicWeight));
			pickStrategyOptions.push(new DecisionOption("BEST", 6));
			pickStrategyOptions.push(new DecisionOption("COUNTER", 6));
			pickStrategyOptions.push(new DecisionOption("UNBALANCED", 3));
		} else{
			// If this is subsequent round, use these strategies
			var winStratWeight = 3;
			var loseStratWeight = 3;

			if(previousResult == "win"){
				loseStratWeight = 12;
			} else if(previousResult == "loss"){
				winStratWeight = 12;
			}

			pickStrategyOptions.push(new DecisionOption("SAME_TEAM", winStratWeight));
			pickStrategyOptions.push(new DecisionOption("SAME_TEAM_DIFFERENT_LEAD", winStratWeight));
			pickStrategyOptions.push(new DecisionOption("COUNTER_LAST_LEAD", loseStratWeight));
			pickStrategyOptions.push(new DecisionOption("COUNTER", loseStratWeight));
		}

		// Add option for presets
		if((currentTeamPool)&&(currentTeamPool.presets)&&(opponentRoster.length == 3)){
			pickStrategyOptions.push(new DecisionOption("PRESET", 90));
		}

		var pickStrategy = self.chooseOption(pickStrategyOptions).name;

		// If the team pool only has presets, use a preset

		if(currentTeamPool && battle.getCup().partySize && (battle.getCup().partySize == 3)){
			if(teamSelectMode == "preset" || (battle.getCup().presetOnly) || ((! currentTeamPool.slots) && (! currentTeamPool[0].slot))){

				pickStrategy = "PRESET";
			}
		}

		console.log(pickStrategyOptions);


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
						// Sometimes lead with the bodyguard, sometimes have it in the back
						if(Math.random() > .5){
							team.push(teamPerformance[i].pokemon);
						} else{
							team.unshift(teamPerformance[i].pokemon);
						}

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

			// Choose a team that counters the opponent's best Pokemon
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

			// Choose a team that counters the opponent's previous lead
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

			case "PRESET":
				var presetBucket = [];

				for(var i = 0; i < currentTeamPool.presets.length; i++){
					for(var n = 0; n < currentTeamPool.presets[i].weight; n++){
						presetBucket.push(currentTeamPool.presets[i]);
					}
				}

				var presetIndex = Math.floor(Math.random() * presetBucket.length);
				var preset = presetBucket[presetIndex];

				for(var i = 0; i < preset.pokemon.length; i++){
					var poke = preset.pokemon[i];
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

					team.push(pokemon);
				}

				break;
		}

		console.log(pickStrategy);
		console.log(team);

		player.setTeam(team);
	}

	// Test a pool of Pokemon for moveset errors
	// keeping

	this.testPool = function(pool){
		var slots = pool;
		var presets = [];
		var pokes = [];

		if(pool.slots){
			slots = pool.slots;
		}

		if(pool.presets){
			presets = pool.presets;
		}

		for(var i = 0; i < slots.length; i++){
			for(var n = 0; n < slots[i].pokemon.length; n++){
				pokes.push(slots[i].pokemon[n]);
			}
		}

		for(var i = 0; i < presets.length; i++){
			for(var n = 0; n < presets[i].pokemon.length; n++){
				pokes.push(presets[i].pokemon[n]);
			}
		}

		for(var i = 0; i < pokes.length; i++){
			var pokemon = new Pokemon(pokes[i].speciesId, 0, battle);

			if(pokemon.data.fastMoves.indexOf(pokes[i].fastMove) == -1){
				console.error(pokemon.speciesId + " doesn't know " + pokes[i].fastMove);
			}

			if(pokemon.data.chargedMoves.indexOf(pokes[i].chargedMoves[0]) == -1){
				console.error(pokemon.speciesId + " doesn't know " + pokes[i].chargedMoves[0]);
			}

			if(pokemon.data.chargedMoves.indexOf(pokes[i].chargedMoves[0]) == -1){
				console.error(pokemon.speciesId + " doesn't know " + pokes[i].chargedMoves[0]);
			}
		}
	}

	// Return an array of average performances of team A against team B
	// keeping? could be useful to pass to team selecting ML
	// but not using atm

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
	// keeping

	this.setTeamPool = function(league, cup, data){
		teamPool[league+""+cup] = data;
		self.generateRoster(partySize, generateRosterCallback);
	}

	// Evaluate the current matchup and decide a high level strategy
	// not using but can gut for parameters to possibly pass to network

	// uses scenario.average, player.getSwitchTimer(), player.getRemainingPokemon(),
	// opponentPlayer.getSwitchTimer(), opponentPlayer.getPokemonRemaining(),
	// pokemon.stats.hp (pokemon's full hp),

	// opponent.shields, pokemon.chargedMoves.length, pokemon.chargedMoves[i].dpe,
	// player.getShields(), opponentPlayer.getShields(),
	// pokemon.energy,
	// pokemon.chargedMoves[i].damage,

	// opponent.energy, opponentPlayer.getRemainingPokemon(),

	// Run a specific scenario
	// USEFUL
	// maybe try a network without running scenarios and one with?
	// goal is to analyze an ML strategy for GBL,
	// being able to run scenarios might be unreasonable?
	// but also just watching an AI be a menace could be cool

	// uses pokemon.hp, pokemon.energy, pokemon.cooldown, pokemon.shields, pokemon.statBuffs (arr length 2), and all same for opponent pokemon

	this.computeReward = function(poke, opponent){
		let reward = 0;
		opponentPlayer = battle.getPlayers()[opponent.index];

		if (player.getRemainingPokemon() < playerPrevRemaining) {
			reward -= 0.2;
		}
		if (opponentPlayer.getRemainingPokemon() < oppPrevRemaining) {
			reward += 0.1;
		}

		// additional options are... did opp/player use a shield

		return reward;

	}

	// THE ACTUAL decideAction
	// action types: fast, charged, switch
	// var action = new TimelineAction(type, actor, turns, value, { shielded: false, buffs: false, priority: pokemon[actor].priority });
	// switch: action = new TimelineAction("switch", player.getIndex(), turn, switchChoice, {priority: poke.priority});
	// fast: action = new TimelineAction("fast", poke.index, turn, 0, {priority: poke.priority});
	// charged: action = new TimelineAction("charged", poke.index, turns, poke.chargedMoves.indexOf(selectedMove), {shielded: false, buffs: false, priority: poke.priority});
	// wait: action = new TimelineAction("wait", poke or player, turns, poke)
	this.decideAction = function(turn, poke, opponent){
		var action = null;

		var state = this.getBattleState(turn, poke, opponent, player, battle.getPlayers()[opponent.index]);

		////////////////
		// pieces stolen from decideActionOLD
		/*

		var opponentPlayer = battle.getPlayers()[opponent.index];

		poke.setBattle(battle);
		poke.resetMoves();

		// How much potential damage will they have after one more Fast Move?
		var extraFastMoves = Math.floor((poke.fastMove.cooldown-opponent.cooldown) / (opponent.fastMove.cooldown));

		// if player has enough turns to do a fast move while opponent is still cooling down a fast move
		if((opponent.cooldown > 0)&&(opponent.cooldown < poke.fastMove.cooldown)){
			extraFastMoves = Math.max(extraFastMoves, 1);
		}

		var futureEnergy = opponent.energy + (extraFastMoves * opponent.fastMove.energyGain);
		var futureDamage = self.calculatePotentialDamage(opponent, poke, futureEnergy);


		var switchChoice = self.decideSwitch();
		*/

		opponent.fastMove.energyGain/100.0

		poke.fastMove.energyGain/100.0



		// at the end of everything?
		poke.resetMoves(true);


		////////////////

		// prepare data

		// pass data to network, get decision and parse to var action

		return action
	}

	// Return the index of a Pokemon to switch to
	// USEFUL
	// uses poke.hp (current battling pokemon), player.getTeam()[i].hp (other party members), opponentPlayer.getSwitchTimer(), and self.runScenario("NO_BAIT", pokemon, opponent).average
	// opponent refers to opposing battling pokemon

	this.decideSwitch = function(){
		var switchOptions = [];
		var team = player.getTeam();
		var poke = battle.getPokemon()[player.getIndex()];
		var opponent = battle.getOpponent(player.getIndex());
		var opponentPlayer = battle.getPlayers()[opponent.index];

		for(var i = 0; i < team.length; i++){
			var pokemon = team[i];

			if((pokemon.hp > 0)&&(pokemon != poke)){
				var scenario = self.runScenario("NO_BAIT", pokemon, opponent);
				var weight = 1;

				// Dramatically scale weight based on winning or losing
				if(scenario.average < 500){
					weight = Math.round(Math.pow(scenario.average / 100, 4) / 20);
				} else{

					if((opponentPlayer.getSwitchTimer() > 10)||(poke.hp <= 0)){
						// If the opponent is switch locked, favor the hard counter
						weight = Math.round(Math.pow((scenario.average-250) / 100, 4));
					} else{
						// If the opponent isn't switch locked, favor the softer counter
						weight = Math.round(Math.pow((1000-scenario.average) / 100, 4));
					}

				}

				if(weight < 1){
					weight = 1;
				}

				switchOptions.push(new DecisionOption(i, weight));
			}
		}

		if(self.hasStrategy("BAD_DECISION_PROTECTION")){
			switchOptions.sort((a,b) => (a.weight > b.weight) ? -1 : ((b.weight > a.weight) ? 1 : 0));

			if((switchOptions.length > 1)&&(switchOptions[0].weight > switchOptions[1].weight * 4)){
				switchOptions.splice(1, 1);
			}
		}
		var switchChoice = self.chooseOption(switchOptions);
		return switchChoice.name;
	}

	// Decide whether or not to shield a Charged Attack
	// USEFUL

	// uses poke.hp, opponent.energy, props.energyGuessRange,
	// minimumEnergy = min(opponent.chargedMoves.energy),
	// opponent.chargedMoves[i].damage, opponent.hp, opponent.stats.hp, 
	// player.getShields(), player.getRemainingPokemon(),
	// opponent.fastMove.damage, player.getSwitchTimer(),
	// opponentPlayer.battleStats.shieldsUsed,
	// poke.energy, poke.chargedMoves[i].energy,
	// poke.chargedMoves[i].damage,

	this.decideShield = function(attacker, defender, m){
		// First, how hot are we looking in this current matchup?
		var currentScenario = self.runScenario("NO_BAIT", defender, attacker);
		var currentRating = currentScenario.average;
		var currentHp = defender.hp;
		var estimatedEnergy = attacker.energy + (Math.floor(Math.random() * (props.energyGuessRange * 2)) - props.energyGuessRange);
		var potentialDamage = 0;
		var potentialHp = defender.hp - potentialDamage;

		// Which move do we think the attacker is using?
		var moves = [];
		var minimumEnergy = 100;

		// Don't allow the AI to guess less energy than the opponent's fastest move
		for(var i = 0; i < attacker.chargedMoves.length; i++){
			if(minimumEnergy > attacker.chargedMoves[i].energy){
				minimumEnergy = attacker.chargedMoves[i].energy;
			}
		}

		if(estimatedEnergy < minimumEnergy){
			estimatedEnergy = minimumEnergy; // Want to make sure at least one valid move can be guessed
		}

		for(var i = 0; i < attacker.chargedMoves.length; i++){
			if(estimatedEnergy >= attacker.chargedMoves[i].energy){
				attacker.chargedMoves.damage = battle.calculateDamage(attacker, defender, attacker.chargedMoves[i], true);
				moves.push(attacker.chargedMoves[i]);
			}
		}

		// Sort moves by damage

		moves.sort((a,b) => (a.damage > b.damage) ? -1 : ((b.damage > a.damage) ? 1 : 0));

		var moveGuessOptions = [];

		for(var i = 0; i < moves.length; i++){
			var moveWeight = 1;

			// Is the opponent low on HP? Probably the higher damage move
			if((i == 0)&&(attacker.hp / attacker.stats.hp <= .25)){
				moveWeight += 8;

				if(moves[i].name == "Acid Spray"){
					moveWeight += 12;
				}
			}

			// Be more cautious when you have more shields
			if(i == 0){
				moveWeight += player.getShields();
			}

			// Am I the last Pokemon and will this move faint me? Better protect myself
			if((player.getRemainingPokemon() == 1)&&(moves[i].damage >= defender.hp)){
				moveWeight += 4;
			}

			// Is this move lower damage and higher energy? Definitely the other one, then
			if((i == 1)&&(moves[i].damage < moves[0].damage)&&(moves[i].energy >= moves[0].energy)&&(moves[i].name != "Acid Spray")){
				moveGuessOptions[0].weight += 20;
			}
			moveGuessOptions.push(new DecisionOption(i, moveWeight));
		}

		var move = moves[self.chooseOption(moveGuessOptions).name]; // The guessed move of the attacker

		// Great! We've guessed the move, now let's analyze if we should shield like a player would
		var yesWeight = 4 + ((3-level)*2); // Lower difficulties will make more random choices
		var noWeight = 4 + ((3-level)*2);

		// Will this attack hurt?
		var damageWeight = Math.min(Math.round((move.damage / Math.max(defender.hp, defender.stats.hp / 2)) * 10), 10);
		var moveDamage = move.damage;
		var fastMoveDamage = attacker.fastMove.damage;

		// Prefer shielding high damage moves over low damage moves
		if(damageWeight >= 5){
			yesWeight += ((damageWeight - 3) * (player.getShields()+1));
		} else{
			noWeight += (8 - damageWeight) * 2;
		}

		// Prefer to shield hard hitting or knockout moves in good matchups over bad matchups

		if((damageWeight >= 6)||(moveDamage + (fastMoveDamage * 2) >= defender.hp)){

			if(player.getRemainingPokemon() > 1){
				var yesRating = currentRating - 400;
				var noRating = 400 - currentRating;

				if(defender.hp / defender.stats.hp < .35){
					yesRating = currentRating - 500;
					noRating = 500 - currentRating;
				}

				// If we're locked in, prefer to shield good matchups and let bad matchups go
				if((player.getSwitchTimer() > 0)&&(player.getRemainingPokemon() > 1)){
					yesRating *= 2;
					noRating *= 2;
				}

				yesWeight += Math.round( (yesRating / 100) * damageWeight);
				noWeight += Math.round( (noRating / 100) * (10 - damageWeight));
			} else{
				yesWeight += damageWeight;
				noWeight -= damageWeight;
			}

		}

		// Monkey see, monkey do
		if((attacker.battleStats.shieldsUsed > 0)&&(damageWeight > 2)&&(! self.hasStrategy("ADVANCED_SHIELDING"))){
			yesWeight += 4;
		}

		// Is this Pokemon close to a move that will faint or seriously injure the attacker?
		for(var i = 0; i < defender.chargedMoves.length; i++){
			var move = defender.chargedMoves[i];
			var turnsAway = Math.ceil( (move.energy - defender.energy) / defender.fastMove.energyGain ) * (defender.fastMove.cooldown / 500);

			if( ((moveDamage >= attacker.hp)||((moveDamage >= defender.stats.hp * .8)))&&(turnsAway <= 1)){
				if(self.hasStrategy("ADVANCED_SHIELDING")){
					yesWeight += 4;
				}
			}
		}

		// Preserve shield advantage where possible
		if((player.getRemainingPokemon() > 1)&&(attacker.startingShields >= defender.startingShields)&&(defender.battleStats.shieldsUsed > 0)){
			yesWeight = Math.round(yesWeight / 2);

			if(currentScenario < 500){
				yesWeight = Math.round(yesWeight / 4);
			}
		}

		// Is this the last Pokemon remaining? If so, protect it at all costs
		if(player.getRemainingPokemon() == 1){
			yesWeight *= 2;
			noWeight = Math.round(noWeight / 4);
		}

		/*

		// Does my current Pokemon have a better matchup against the attacker than my remaining Pokemon?
		if((self.hasStrategy("ADVANCED_SHIELDING"))&&(player.getRemainingPokemon() > 1)){
			var team = player.getTeam();
			var remainingPokemon = [];

			for(var i = 0; i < team.length; i++){
				if((team[i].hp > 0)&&(team[i] != defender)){
					remainingPokemon.push(team[i]);
				}
			}

			var betterMatchupExists = false;

			for(var i = 0; i < remainingPokemon.length; i++){
				var scenario = self.runScenario("NO_BAIT", remainingPokemon[i], attacker);

				if(scenario.average >= currentRating){
					betterMatchupExists = true;
				}
			}

			if((! betterMatchupExists)&&(currentRating >= 500)&&((damageWeight > 4)||(moveDamage + (fastMoveDamage * 2) >= defender.hp))){
				yesWeight += 20;
				noWeight = Math.round(noWeight / 2);
			}

			// Avoid shielding twice if it won't be fatal
			if((betterMatchupExists)&&(moveDamage + (fastMoveDamage * 2) < defender.hp)&&(defender.battleStats.shieldsUsed > 0)){
				yesWeight = Math.round(yesWeight / 2);
			}
		}
		*/

		// If one of these options is significantly more weighted than the other, make it the only option
		if(self.hasStrategy("BAD_DECISION_PROTECTION")){
			if(yesWeight / noWeight >= 4){
				noWeight = 0;
			} else if (noWeight / yesWeight >= 4){
				yesWeight = 0;
			}
		}

		var options = [];
		options.push(new DecisionOption(true, yesWeight));
		options.push(new DecisionOption(false, noWeight));

		var decision = self.chooseOption(options).name;

		return decision;
	}

	// Given a pokemon and its stored energy, how much potential damage can it deal?
	// KEEPING

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

	// state values are normalized here
	this.getBattleState = function(turn, poke, opp, player, opponent){
		var state = {};
		state[turn] = t/480;

		// Player state
		state['P.switchTimer'] = player.getSwitchTimer()/60;
		state['P.switchTimer.remainingPokes'] = player.getRemainingPokemon()/3;
		state['P.shields'] = player.getShields()/2;

		// Lead pokemon battle state
		state['p.hp'] = poke.hp/poke.startHp;
		state['p.energy'] = poke.energy/100;
		state['p.atkBuff'] = (poke.statBuffs[0]+4)/8;
		state['p.defBuff'] = (poke.statBuffs[1]+4)/8;
		state['p.cooldown'] = poke.cooldown/4;

		// Lead pokemon move stats
		state['p.fast.damage'] = poke.fastMove.damage/opp.stats.hp;
		state['p.fast.energy'] = poke.fastMove.energyGain/100;
		state['p.fast.cooldown'] = poke.fastMove.cooldown/4;

		// charged moves
		for (var i = 1; i<=poke.chargedMoves.length;i++){
			let charged = poke.chargedMoves[i-1];

			state['p.charged'+i+'.damage'] = Math.min(charged.damage/opp.stats.hp, 1);
			state['p.charged'+i+'.energy'] = charged.energy/100;

			state['p.charged'+i+'.self.atk'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[0]+4)/8 : 0.5;
			state['p.charged'+i+'.self.def'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[1]+4)/8 : 0.5;
			state['p.charged'+i+'.opp.atk'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[0]+4)/8 : 0.5;
			state['p.charged'+i+'.opp.def'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[1]+4)/8 : 0.5;

			state['p.charged'+i+'.chance'] = (charged.buffs) ? charged.buffApplyChance : 0;
		}

		// Party pokemon
		// battle state

		// move stats

		// charged moves

		// Opponent Player state

		// Opponent lead pokemon battle state

		// Opponent lead move stats

		// charged moves

		// Opponent party pokemon
		// battle state

		// move stats

		// charged moves
	}

}
