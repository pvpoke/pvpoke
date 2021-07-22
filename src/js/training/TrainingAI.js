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
	var currentTeamPool = null;
	var teamSelectMode = "normal";
	var partySize = 3;
	var props = aiData[l];
	var generateRosterCallback;
	var self = this;

	var currentStrategy; // The current employed strategy to determine behavior
	var previousStrategy; // Store the previous strategy
	var scenarios;

	var turnLastEvaluated = 0;

	if(level == 0){
		chargedMoveCount = 1;
	}

	// Generate a random roster of 6 given a cup and league

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

		if((partySize == 3)&&(currentTeamPool)){
			if(teamSelectMode == "preset" || ! currentTeamPool.slots){
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
		pokemon.baitShields = true;
		pokemon.farmEnergy = false;

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
			var switchThreshold = 500;

			if((self.hasStrategy("PRESERVE_SWITCH_ADVANTAGE"))&&(opponentPlayer.getRemainingPokemon() > 1)){
				switchThreshold = 450;
			}

			var switchWeight = Math.floor(Math.max((switchThreshold - overallRating) / 10, 0));
			var canCounterSwitch = false;

			// Is the opponent switch locked and do I have a better Pokemon for it?
			if(opponentPlayer.getSwitchTimer() > 30000){
				var team = player.getTeam();
				var remainingPokemon = [];

				for(var i = 0; i < team.length; i++){
					if((team[i].hp > 0)&&(team[i] != pokemon)){
						remainingPokemon.push(team[i]);
					}
				}

				for(var i = 0; i < remainingPokemon.length; i++){
					var scenario = self.runScenario("NO_BAIT", remainingPokemon[i], opponent);
					var rating = scenario.average;

					if(rating - 500 > (Math.max(overallRating, 500) - 500) * 1.2){
						switchWeight += Math.round((rating-overallRating)/10);
						canCounterSwitch = true;
					}
				}
			}

			// Don't switch Pokemon when HP is low
			if((self.hasStrategy("PRESERVE_SWITCH_ADVANTAGE"))&&(opponentPlayer.getSwitchTimer() - player.getSwitchTimer() < 30)&&(pokemon.hp / pokemon.stats.hp <= .25)&&(opponentPlayer.getRemainingPokemon() > 1)){
				switchWeight = 0;
			}
			options.push(new DecisionOption("SWITCH_BASIC", switchWeight));

			totalSwitchWeight += switchWeight;

			// See if it's feasible to build up energy before switching
			if(self.hasStrategy("SWITCH_FARM")){
				var dpt = (opponent.fastMove.damage / (opponent.fastMove.cooldown / 500));
				var percentPerTurn = (dpt / pokemon.stats.hp) * 100; // The opponent's fast attack will deal this % damage per turn
				var weightFactor =  Math.pow(Math.round(Math.max(3 - percentPerTurn, 0)), 2);

				// Switch immediately if previously failed to switch before a Charged Move
				if(previousStrategy == "SWITCH_FARM"){
					weightFactor = 0;
				}

				if(percentPerTurn > 3){
					weightFactor = 0;
				}

				if(opponent.fastMove.energyGain / (opponent.fastMove.cooldown / 500) < 3){
					weightFactor = 0;
				}

				if((pokemon.hp / pokemon.stats.hp < .5)&&(opponentPlayer.getRemainingPokemon() > 1)){
					weightFactor = .1;
				}

				if(canCounterSwitch){
					weightFactor = .1;
				}

				if(pokemon.hp / pokemon.stats.hp < .25){
					weightFactor = 0;
				}

				totalSwitchWeight += (switchWeight * weightFactor);
				options.push(new DecisionOption("SWITCH_FARM", Math.floor(switchWeight * weightFactor)));
			}
		}

		// If there's a decent chance this Pokemon really shouldn't switch out, add other actions

		if(totalSwitchWeight < 10){
			options.push(new DecisionOption("DEFAULT", 1));

			if((self.hasStrategy("BAIT_SHIELDS"))&&(opponent.shields > 0)&&(pokemon.chargedMoves.length > 1)){
				var baitWeight = Math.max(Math.round( (scenarios.bothBait.average - scenarios.noBait.average) / 20), 1);

				// If this Pokemon's moves are very close in DPE, prefer the shorter energy move
				if((scenarios.bothBait.average >= 500)&&(pokemon.chargedMoves.length == 2)){
					if(Math.abs(pokemon.chargedMoves[0].dpe - pokemon.chargedMoves[1].dpe) <= .1){
						baitWeight += 5;
					}
				}

				// If behind on shields, bait more
				if(player.getShields() < opponentPlayer.getShields()){
					baitWeight += 2;
				}

				// If this matchup is very bad, consider not baiting
				if(overallRating < 250){
					baitWeight = 1;
				}

				// For Skull Bash specifically, prefer not to bait
				if((pokemon.bestChargedMove.moveId == "SKULL_BASH")&&(player.getRemainingPokemon() > 1)){
					baitWeight = 0;
				}

				// If the Pokemon has very low health, don't bait
				if((pokemon.hp / pokemon.stats.hp < .25)&&(pokemon.energy < 70)){
					baitWeight = 0;
				}

				options.push(new DecisionOption("BAIT_SHIELDS", baitWeight));

				// If this Pokemon's most powerful Charged Move doesn't threaten shields, be less likely to bait
				var biggestDamage = 0;

				for(var i = 0; i < pokemon.chargedMoves.length; i++){
					if(pokemon.chargedMoves[i].damage > biggestDamage){
						biggestDamage = pokemon.chargedMoves[i].damage;
					}
				}

				if((biggestDamage < pokemon.hp * .9)&&(!pokemon.getBoostMove())){
					var defaultWeight = Math.ceil(pokemon.hp / biggestDamage);
					options.push(new DecisionOption("DEFAULT", defaultWeight));
				}
			}

			if(self.hasStrategy("FARM_ENERGY")){
				var farmWeight = Math.round( (scenarios.farm.average - 600) / 20);

				// Let's farm if we'll win and the opponent is low on energy
				if((opponent.energy < 20)&&(scenarios.farm.average > 500)){
					farmWeight += 12;
				}

				// Don't farm against the last Pokemon
				if(opponentPlayer.getRemainingPokemon() < 2){
					farmWeight = 0;
				}

				// Let's make very certain to farm if that looks like a winning strategy
				if((self.hasStrategy("BAD_DECISION_PROTECTION"))&&(farmWeight >= 15)){
					farmWeight *= 5;
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
		previousStrategy = currentStrategy;
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

			case "OVERFARM":
				pokemon.farmEnergy = true;
				break;
		}
	}

	this.decideAction = function(turn, poke, opponent){
		var action = null;
		var opponentPlayer = battle.getPlayers()[opponent.index];

		poke.setBattle(battle);
		poke.resetMoves();

		// How much potential damage will they have after one more Fast Move?
		var extraFastMoves = Math.floor((poke.fastMove.cooldown-opponent.cooldown) / (opponent.fastMove.cooldown));

		// Give some extra room for overfarming
		if((currentStrategy.indexOf("SWITCH") == -1)){
			extraFastMoves++;
		}

		if((opponent.cooldown > 0)&&(opponent.cooldown < poke.fastMove.cooldown)){
			extraFastMoves = Math.max(extraFastMoves, 1);
		}

		var futureEnergy = opponent.energy + (extraFastMoves * opponent.fastMove.energyGain);
		var futureDamage = self.calculatePotentialDamage(opponent, poke, futureEnergy);

		// Stop farming if they're about to get a lethal Charged Move

		if((futureDamage >= poke.hp)&&(currentStrategy=="FARM")){
			currentStrategy = "DEFAULT";
			self.processStrategy(currentStrategy);
		}

		if((currentStrategy.indexOf("SWITCH") > -1) && (player.getSwitchTimer() == 0)){
			var performSwitch = false;

			if((currentStrategy == "SWITCH_BASIC") && (turn - turnLastEvaluated >= props.reactionTime)){
				performSwitch = true;
			}

			if(currentStrategy == "SWITCH_FARM"){
				// Check to see if the opposing Pokemon is close to a damaging Charged Move
				if((futureDamage >= poke.hp)||(futureDamage >= poke.stats.hp * .14)){
					performSwitch = true;
				}

				if(poke.hp / poke.stats.hp < .2){
					performSwitch = true;
				}

			}

			if(performSwitch){
				// Determine a Pokemon to switch to
				var switchChoice = self.decideSwitch();
				action = new TimelineAction("switch", player.getIndex(), turn, switchChoice, {priority: poke.priority});
			}
		}

		// Potentially farm more energy than needed

		if((self.hasStrategy("OVERFARM"))&&(scenarios.noBait.average > 450)
			&&(currentStrategy.indexOf("SWITCH") == -1)&&(opponentPlayer.getRemainingPokemon() > 1)){
			var overfarmChance = 2;

			// Be likely to overfarm if the opponent is low on energy
			overfarmChance += Math.round((50 - opponent.energy) / 10);

			if((futureDamage >= poke.hp)||(futureDamage >= poke.stats.hp * .15)){
				overfarmChance = -1;
			}

			if(poke.energy == 100){
				overfarmChance = -1;
			}

			// Don't overfarm with Power-Up Punch or Acid Spray
			for(var i = 0; i < poke.chargedMoves.length; i++){
				if((poke.chargedMoves[i].name == "Power-Up Punch")||(poke.chargedMoves[i].name == "Acid Spray")){
					overfarmChance = -1;
				}
			}

			// Don't overfarm if this Pokemon has extremely low HP
			if(poke.hp / poke.stats.hp < .2){
				overfarmChance = -1;
			}

			// Perform overfarm
			if(Math.floor((Math.random() * overfarmChance)) > 0){
				action = new TimelineAction("fast", poke.index, turn, 0, {priority: poke.priority});
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
