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

	var hiddenLayerSizes = [10,10,10];
	// battle state = 126
	var numStates = 134;//this.getBattleState(0, player.getTeam()[0], battle.getPlayers[1].getTeam()[0], player, battle.getPlayers[1]).length;
	var m = null;//new PlayerModel(b, hiddenLayerSizes, numStates , 5, 100);

	var playerPrevRemaining = 3;
	var oppPrevRemaining = 3;
	var prevLead = undefined;
	var prevAction = undefined;
	var oppPrevShields = 2;

	this.init = function(player, opponent){
		let poke = player.getTeam()[0];
		let opp = opponent.getTeam()[0];
		initState = this.getBattleState(0, poke, opp, player, opponent);
		console.log('number of states:' + Object.keys(initState).length);
		numStates = Object.keys(initState).length;
		m = new PlayerModel(b, hiddenLayerSizes, numStates, 5, 100);
		m.defineModel(hiddenLayerSizes);
		prevLead = poke;
	}

	this.getModel = function(){
		return m;
	}

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
					for(var n = 0; n < 2; n++){
						pokemon.selectMove("charged", poke.chargedMoves[n], n);
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

	this.runScenario = function(type, pokemon, opponent){
		var scenario = {
			opponent: opponent,
			name: type,
			matchups: [],
			average: 0,
			minShields: 3
		};

		// Preserve current HP, energy, and stat boosts which get reset during simulation
		// Otherwise old values of startHp, startingShields, etc. may get used during the reset
		pokemon.startHp = pokemon.hp;
		pokemon.startEnergy = pokemon.energy;
		pokemon.startStatBuffs = [pokemon.statBuffs[0], pokemon.statBuffs[1]];
		pokemon.startCooldown = pokemon.cooldown;
		pokemon.startingShields = pokemon.shields;

		opponent.startHp = opponent.hp;
		opponent.startEnergy = opponent.energy;
		opponent.startStatBuffs = [opponent.statBuffs[0], opponent.statBuffs[1]];
		opponent.startCooldown = opponent.cooldown;
		opponent.startingShields = opponent.shields;

		// Preserve old Pokemon stats
		var startStats = [
			{
				shields: pokemon.startingShields,
				hp: pokemon.hp,
				energy: pokemon.energy,
				cooldown: pokemon.cooldown,
				index: pokemon.index
			},
			{
				shields: opponent.startingShields,
				hp: opponent.hp,
				energy: opponent.energy,
				cooldown: opponent.cooldown,
				index: opponent.index
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

		var shieldWeights = [4,4,1];
		var totalWeight = 0;

		var maxShields = Math.max(pokemon.startingShields, opponent.startingShields);

		for(var i = 0; i <= startStats[0].shields; i++){
			for(n = 0; n <= startStats[1].shields; n++){
				pokemon.startingShields = i;
				opponent.startingShields = n;
				b.simulate();

				var rating = b.getBattleRatings()[0];

				scenario.matchups.push(rating);

				var shieldWeight = shieldWeights[i] * shieldWeights[n];
				totalWeight += shieldWeight;
				scenario.average += (rating * shieldWeight);

				if((rating >= 500)&&(i < scenario.minShields)){
					scenario.minShields = i;
				}
			}
		}

		scenario.average /= totalWeight;

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
		pokemon.index = startStats[0].index;
		pokemon.farmEnergy = false;
		opponent.index = startStats[1].index;
		opponent.farmEnergy = false;

		return scenario;
	}

	this.computeReward = function(poke, opponent){
		let reward = 0;
		opponentPlayer = battle.getPlayers()[opponent.index];

		if (player.getRemainingPokemon() < playerPrevRemaining) {
			console.log("lost a pokemon, reward -4");
			reward -= 4;
		}
		if (opponentPlayer.getRemainingPokemon() < oppPrevRemaining) {
			console.log("opponent lost a pokemon, reward +5");
			reward += 5;
		}
		// need to discourage switching a little bit
		if ((prevLead !== undefined) && (prevLead.data.dex !== poke.data.dex)){
			console.log("player switch, reward -2");
			reward -= 2;
		}
		// one attempt at discouraging null actions - really bad rewards
		if (prevAction == null){
			console.log("invalid action, reward -100");
			reward -= 100;
		}
		// reward for making opponent use shield
		if (opponentPlayer.getShields() < oppPrevShields){
			console.log("opponent used a shield, reward +2");
			reward += 2;
		}

		playerPrevRemaining = player.getRemainingPokemon();
		oppPrevRemaining = opponentPlayer.getRemainingPokemon();
		prevLead = poke;
		oppPrevShields = opponentPlayer.getShields();

		return reward;

	}

	// THE ACTUAL decideAction
	// action types: fast, charged, switch
	// var action = new TimelineAction(type, actor, turns, value, { shielded: false, buffs: false, priority: pokemon[actor].priority });
	// wait: action = new TimelineAction("wait", poke or player, turns, poke)
	this.decideAction = function(turn, poke, opponent){

		var action = null;

		var state = this.getBattleState(turn, poke, opponent, player, battle.getPlayers()[opponent.index]);

		var reward = this.computeReward(poke, opponent);


		var networkAction = m.chooseAction(state, reward, 0.2);

		switch (networkAction){
			case 'fast':	// fast: action = new TimelineAction("fast", poke.index, turn, 0, {priority: poke.priority});
				action = new TimelineAction("fast", poke.index, turn, 0, {priority: poke.priority});
				break;
			
			case 'charged1':	// charged move #1: action = new TimelineAction("charged", poke.index, turns, poke.chargedMoves.indexOf(selectedMove), {shielded: false, buffs: false, priority: poke.priority});
				if (poke.energy >= poke.chargedMoves[0].energy) {
					action = new TimelineAction("charged", poke.index, turn, 0, {shielded: false, buffs: false, priority: poke.priority});
				}
				break;

			case 'charged2':
				if (poke.energy >= poke.chargedMoves[1].energy) {
					action = new TimelineAction("charged", poke.index, turn, 1, {shielded: false, buffs: false, priority: poke.priority});
				}
				break;

			case 'switch1': // switch: action = new TimelineAction("switch", player.getIndex(), turn, switchChoice, {priority: poke.priority});
				if (player.getTeam()[1].hp > 0 && player.getTeam()[1].data.dex != poke.data.dex) {
					action = new TimelineAction("switch", player.getIndex(), turn, 1, {priority: poke.priority});
				}
					break;

			case 'switch2':
				if (player.getTeam()[2].hp > 0 && player.getTeam()[2].data.dex != poke.data.dex) {
					action = new TimelineAction("switch", player.getIndex(), turn, 2, {priority: poke.priority});
				}
				break;
			
			// defaulting to fast move is bad idea, network will always just choose random numbers
			//default: // default to a fast move
				//action = new TimelineAction("fast", poke.index, turn, 0, {priority: poke.priority});
		}
		//console.log(action);

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



		// at the end of everything?
		poke.resetMoves(true);


		////////////////

		// prepare data

		// pass data to network, get decision and parse to var action


		prevAction = action;
		return action;
	}

	this.decideShield = function(attacker, defender, m){
		return true;
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
		state['turn'] = turn/480;

		// Player state
		state['P.switchTimer'] = player.getSwitchTimer()/60000;
		state['P.canSwitch'] = player.getSwitchTimer() == 0 ? 1 : 0;
		state['P.remainingPokes'] = player.getRemainingPokemon()/3;
		state['P.shields'] = player.getShields()/2;

		// Lead pokemon battle state
		state['p.hp'] = poke.hp/poke.stats.hp;
		state['p.energy'] = poke.energy/100;
		state['p.atk'] = (poke.statBuffs[0]+4)/8;
		state['p.def'] = (poke.statBuffs[1]+4)/8;
		state['p.cooldown'] = poke.cooldown/4000;

		// Lead pokemon move stats
		state['p.fast.damage'] = b.calculateDamage(poke, opp, poke.fastMove, 1)/opp.stats.hp;
		state['p.fast.energy'] = poke.fastMove.energyGain/100;
		state['p.fast.cooldown'] = poke.fastMove.cooldown/4000;

		// charged moves -- state size changes if only one charged move
		for (var i = 1; i<=2;i++){
			let charged = poke.chargedMoves[i-1];

			state['p.charged'+i+'.damage'] = Math.min(b.calculateDamage(poke, opp, charged, 1)/opp.stats.hp, 1);
			state['p.charged'+i+'.energy'] = charged.energy/100;
			state['p.charged'+i+'.canUse'] = poke.energy >= charged.energy ? 1 : 0;

			state['p.charged'+i+'.self.atk'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[0]+4)/8 : 0.5;
			state['p.charged'+i+'.self.def'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[1]+4)/8 : 0.5;
			state['p.charged'+i+'.opp.atk'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[0]+4)/8 : 0.5;
			state['p.charged'+i+'.opp.def'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[1]+4)/8 : 0.5;

			state['p.charged'+i+'.chance'] = (charged.buffs) ? charged.buffApplyChance : 0;
		}

		// Party pokemon
		let n = 1;
		for (i = 0; i < 3; i++){
			pokemon = player.getTeam()[i];
			if (pokemon.data.dex !== poke.data.dex) {
				// battle state
				state['party.'+n+'.hp'] = pokemon.hp/pokemon.stats.hp;
				state['party.'+n+'.energy'] = pokemon.energy/100;

				// move stats
				state['party.'+n+'.fast.damage'] = b.calculateDamage(pokemon, opp, pokemon.fastMove, 1)/opp.stats.hp;
				state['party.'+n+'.fast.energy'] = pokemon.fastMove.energyGain/100;
				state['party.'+n+'.fast.cooldown'] = pokemon.fastMove.cooldown/4000;

				// charged moves -- state size changes if only one charged move, need to fill with zeros
				for (var j = 1; j <= 2; j++){
					let charged = pokemon.chargedMoves[j-1];

					state['party.'+n+'.charged'+j+'.damage'] = Math.min(b.calculateDamage(pokemon, opp, charged, 1)/opp.stats.hp, 1);
					state['party.'+n+'.charged'+j+'.energy'] = charged.energy/100;
					state['party.'+n+'.charged'+j+'.canUse'] = pokemon.energy >= charged.energy ? 1 : 0;

					state['party.'+n+'.charged'+j+'.self.atk'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[0]+4)/8 : 0.5;
					state['party.'+n+'.charged'+j+'.self.def'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[1]+4)/8 : 0.5;
					state['party.'+n+'.charged'+j+'.opp.atk'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[0]+4)/8 : 0.5;
					state['party.'+n+'.charged'+j+'.opp.def'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[1]+4)/8 : 0.5;

					state['party.'+n+'.charged'+j+'.chance'] = (charged.buffs) ? charged.buffApplyChance : 0;
				}
				n++;
			}
		}


		// Opponent Player state
		state['O.switchTimer'] = opponent.getSwitchTimer()/60000;
		state['O.switchTimer.remainingPokes'] = opponent.getRemainingPokemon()/3;
		state['O.shields'] = opponent.getShields()/2;

		// Opponent lead pokemon battle state
		state['o.hp'] = opp.hp/opp.stats.hp;
		state['o.energy'] = opp.energy/100; // can't know this?
		state['o.atk'] = (opp.statBuffs[0]+4)/8;
		state['o.def'] = (opp.statBuffs[1]+4)/8;
		state['o.cooldown'] = opp.cooldown/4000;

		// Opponent lead move stats
		state['o.fast.damage'] = b.calculateDamage(opp, poke, opp.fastMove, 1)/poke.stats.hp;
		state['o.fast.energy'] = opp.fastMove.energyGain/100;
		state['o.fast.cooldown'] = opp.fastMove.cooldown/4000;

		// charged moves -- state size changes if only one charged move
		// can't know all of this at the start of the battle in practice,
		// charged move can only be added when it is seen
		for (i = 1; i <= 2; i++){
			let charged = opp.chargedMoves[i-1];

			state['o.charged'+i+'.damage'] = Math.min(b.calculateDamage(opp, poke, charged, 1)/poke.stats.hp, 1);
			state['o.charged'+i+'.energy'] = charged.energy/100;

			state['o.charged'+i+'.self.atk'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[0]+4)/8 : 0.5;
			state['o.charged'+i+'.self.def'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[1]+4)/8 : 0.5;
			state['o.charged'+i+'.opp.atk'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[0]+4)/8 : 0.5;
			state['o.charged'+i+'.opp.def'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[1]+4)/8 : 0.5;

			state['o.charged'+i+'.chance'] = (charged.buffs) ? charged.buffApplyChance : 0;
		}

		// Opponent party pokemon
		// can't know this all at start
		// can only know a party pokemon when opponent player switches one out
		n = 1;
		for (i = 0; i < 3; i++){
			pokemon = opponent.getTeam()[i];
			if (pokemon.data.dex !== opp.data.dex) {
				// battle state
				state['O.party.'+n+'.hp'] = pokemon.hp/pokemon.stats.hp;
				state['O.party.'+n+'.energy'] = pokemon.energy/100;

				// move stats
				state['O.party.'+n+'.fast.damage'] = b.calculateDamage(pokemon, poke, pokemon.fastMove, 1)/poke.stats.hp;
				state['O.party.'+n+'.fast.energy'] = pokemon.fastMove.energyGain/100;
				state['O.party.'+n+'.fast.cooldown'] = pokemon.fastMove.cooldown/4000;

				// charged moves -- state size changes if only one charged move, need to fill with zeros
				for (var j = 1; j<=2;j++){
					let charged = pokemon.chargedMoves[j-1];

					state['O.party.'+n+'.charged'+j+'.damage'] = Math.min((b.calculateDamage(pokemon, poke, charged, 1))/poke.stats.hp, 1);
					state['O.party.'+n+'.charged'+j+'.energy'] = charged.energy/100;

					state['O.party.'+n+'.charged'+j+'.self.atk'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[0]+4)/8 : 0.5;
					state['O.party.'+n+'.charged'+j+'.self.def'] = (charged.buffs && charged.buffTarget == 'self') ? (charged.buffs[1]+4)/8 : 0.5;
					state['O.party.'+n+'.charged'+j+'.opp.atk'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[0]+4)/8 : 0.5;
					state['O.party.'+n+'.charged'+j+'.opp.def'] = (charged.buffs && charged.buffTarget == 'opponent') ? (charged.buffs[1]+4)/8 : 0.5;

					state['O.party.'+n+'.charged'+j+'.chance'] = (charged.buffs) ? charged.buffApplyChance : 0;
				}
				n++;
			}
		}

		return state;
	}

}
