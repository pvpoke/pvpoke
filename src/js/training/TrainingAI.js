// Load AI archetypes

const file = `${webRoot}data/training/aiArchetypes.json?v=1`;
let aiData = [];

$.getJSON(file, function (data) {
  aiData = data;
  console.log(`AI data loaded [${aiData.length}]`);
});

function TrainingAI(l, p, b) {
  const level = parseInt(l);
  const player = p;
  const battle = b;
  const gm = GameMaster.getInstance();
  const teamPool = [];
  let partySize = 3;
  const props = aiData[l];
  let generateRosterCallback;
  const self = this;

  let currentStrategy; // The current employed strategy to determine behavior
  let previousStrategy; // Store the previous strategy
  let scenarios;
  let turnLastEvaluated = 0;

  if (level === 0) {
    chargedMoveCount = 1;
  }

  // Generate a random roster of 6 given a cup and league
  this.generateRoster = function (size, callback) {
    partySize = size;
    generateRosterCallback = callback;

    const league = battle.getCP();
    const cup = battle.getCup().name;

    if (!teamPool[`${league}${cup}`]) {
      gm.loadTeamData(league, cup, self.setTeamPool);
      return;
    }

    const pool = teamPool[`${league}${cup}`];
    const slotBucket = [];
    const slots = [];
    const roles = []; // Array of roles that have been filled on the team

    // Put all the slots in bucket, multiple times for its weight value
    for (let i = 0; i < pool.length; i++) {
      for (let n = 0; n < pool[i].weight; n++) {
        slotBucket.push(pool[i].slot);
      }
    }

    // Draw 6 unique slots from the bucket
    for (let i = 0; i < 6; i++) {
      const index = Math.floor(Math.random() * slotBucket.length);
      const slot = slotBucket[index];
      const { synergies } = pool.filter((obj) => {
        return obj.slot === slot;
      })[0];
      slots.push(slot);

      // Add synergies to bucket to increase chances of picking them
      for (let n = 0; n < synergies.length; n++) {
        if (slotBucket.indexOf(synergies[n]) > -1) {
          slotBucket.push(synergies[n], synergies[n]);
        }
      }

      // Clear the selected value from the bucket
      let itemIndex = 0;
      while ((itemIndex = slotBucket.indexOf(slot, itemIndex)) > -1) {
        slotBucket.splice(itemIndex, 1);
      }
    }

    // For each slot, pick a random Pokemon
    const roster = [];
    const selectedIds = []; // Array of Pokemon ID's to check to avoid duplicates
    let restrictedPicks = 0;
    let restrictedLimit = 6;
    let restrictedPicksExist = false;

    if (battle.getCup().restrictedPicks) {
      restrictedLimit = battle.getCup().restrictedPicks;
      restrictedPicksExist = true;
    }

    for (let i = 0; i < slots.length; i++) {
      // Grab the pool of Pokemon given the slot name
      let slotPool = pool.filter((obj) => {
        return obj.slot === slots[i];
      })[0].pokemon;
      const pokeBucket = [];

      // Choose from restricted picks if available
      if (restrictedPicksExist && restrictedPicks < restrictedLimit) {
        const slotObj = pool.filter((obj) => {
          return obj.slot === slots[i];
        })[0];

        if (slotObj.restricted) {
          slotPool = slotObj.restricted;
          restrictedPicks += 1;
        }
      }

      for (let n = 0; n < slotPool.length; n++) {
        const poke = slotPool[n];
        let role = 'none';

        if (poke.role) {
          role = poke.role;
        }
        // Is this Pokemon valid to be added to the team?
        if (
          selectedIds.indexOf(poke.speciesId) === -1 &&
          Math.abs(poke.difficulty - level) <= 1 &&
          roles.indexOf(role) === -1
        ) {
          for (let j = 0; j < poke.weight; j++) {
            pokeBucket.push(poke);
          }
        }
      }

      // Select a random poke from the bucket
      const index = Math.floor(Math.random() * pokeBucket.length);
      const poke = pokeBucket[index];

      const pokemon = new Pokemon(poke.speciesId, player.index, battle);
      pokemon.initialize(battle.getCP());

      roles.push(poke.role);

      // Select a random IV spread according to difficulty
      const ivCombos = pokemon.generateIVCombinations('overall', 1, props.ivComboRange);
      let rank = Math.floor(Math.random() * ivCombos.length);

      // If this Pokemon maxes under or near 1500, make sure it's close to 1500
      if (ivCombos[0].level >= 39) {
        rank = Math.floor(Math.random() * 50 * (props.ivComboRange / 4000));
      }
      const combo = ivCombos[rank];

      pokemon.setIV('atk', combo.ivs.atk);
      pokemon.setIV('def', combo.ivs.def);
      pokemon.setIV('hp', combo.ivs.hp);
      pokemon.setLevel(combo.level);

      pokemon.selectMove('fast', poke.fastMove);
      for (let n = 0; n < props.chargedMoveCount; n++) {
        pokemon.selectMove('charged', poke.chargedMoves[n], n);
      }

      if (props.chargedMoveCount === 1) {
        pokemon.selectMove('charged', 'none', 1);
      }

      roster.push(pokemon);
      selectedIds.push(poke.speciesId);
    }

    // Sort roster by dex number
    if (cup === 'voyager') {
      roster.sort((a, b) => (a.dex > b.dex ? 1 : b.dex > a.dex ? -1 : 0));
    }

    player.setRoster(roster);
    generateRosterCallback(roster);
  };

  // With a set roster, produce a team of 3
  this.generateTeam = function (opponentRoster, previousResult, previousTeams) {
    const roster = player.getRoster();
    const team = [];

    // Reset all Pokemon involves
    for (let i = 0; i < opponentRoster.length; i++) {
      opponentRoster[i].fullReset();
    }

    for (let i = 0; i < roster.length; i++) {
      roster[i].fullReset();
    }

    // In Single 3v3 mode, use the Basic option most of the time depending on difficulty
    let basicWeight = 1;

    if (opponentRoster.length < 6) {
      basicWeight = 4 * (4 - level);

      // Make the teams more random in GO Battle League
      if (battle.getCup().name === 'gobattleleague') {
        basicWeight *= 2;
      }
    }

    // Choose a pick strategy
    const pickStrategyOptions = [];

    if (!previousResult) {
      // If this is a fresh round, use these strategies
      pickStrategyOptions.push(new DecisionOption('BASIC', basicWeight));
      pickStrategyOptions.push(new DecisionOption('BEST', 6));
      pickStrategyOptions.push(new DecisionOption('COUNTER', 6));
      pickStrategyOptions.push(new DecisionOption('UNBALANCED', 3));
    } else {
      // If this is subsequent round, use these strategies
      let winStratWeight = 3;
      let loseStratWeight = 3;

      if (previousResult === 'win') {
        loseStratWeight = 12;
      } else if (previousResult === 'loss') {
        winStratWeight = 12;
      }

      pickStrategyOptions.push(new DecisionOption('SAME_TEAM', winStratWeight));
      pickStrategyOptions.push(new DecisionOption('SAME_TEAM_DIFFERENT_LEAD', winStratWeight));
      pickStrategyOptions.push(new DecisionOption('COUNTER_LAST_LEAD', loseStratWeight));
      pickStrategyOptions.push(new DecisionOption('COUNTER', loseStratWeight));
    }

    const pickStrategy = self.chooseOption(pickStrategyOptions).name;

    switch (pickStrategy) {
      // Choose a random set of 3 from the roster
      case 'BASIC':
        const startIndex = Math.floor(Math.random() * 4);
        for (let i = 0; i < 3; i++) {
          team.push(roster[startIndex + i]);
        }
        break;

      // Choose a team that has the best average matchups against the opponent's roster
      case 'BEST':
        var teamPerformance = self.calculateAverageRosterPerformance(roster, opponentRoster);

        // Lead with the best average Pokemon
        team.push(teamPerformance[0].pokemon);

        // Next, let's give it a bodyguard
        var { scenarios } = teamPerformance[0];
        scenarios.sort((a, b) => (a.average > b.average ? 1 : b.average > a.average ? -1 : 0)); // Sort by worst to best

        var targets = [scenarios[0].opponent, scenarios[1].opponent];

        teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

        // Add the best bodyguard that isn't the currently selected Pokemon
        for (let i = 0; i < teamPerformance.length; i++) {
          if (team.indexOf(teamPerformance[i].pokemon) === -1) {
            // Sometimes lead with the bodyguard, sometimes have it in the back
            if (Math.random() > 0.5) {
              team.push(teamPerformance[i].pokemon);
            } else {
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
        for (let i = 0; i < teamPerformance.length; i++) {
          if (team.indexOf(teamPerformance[i].pokemon) === -1) {
            team.push(teamPerformance[i].pokemon);
            break;
          }
        }

        break;

      // Choose a team that counters the opponent's best Pokemon
      case 'COUNTER':
        var teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, roster);
        var { scenarios } = teamPerformance[0];

        // Sort by worst to best
        scenarios.sort((a, b) => (a.average > b.average ? 1 : b.average > a.average ? -1 : 0));

        // Lead with the best counter
        team.push(scenarios[0].opponent);

        // Next, let's give it a bodyguard
        var scenarios = self.runBulkScenarios('NO_BAIT', team[0], opponentRoster);

        // Sort by worst to last
        scenarios.sort((a, b) => (a.average > b.average ? 1 : b.average > a.average ? -1 : 0));
        var targets = [scenarios[0].opponent, scenarios[1].opponent];
        teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

        // Add the best bodyguard that isn't the currently selected Pokemon
        for (let i = 0; i < teamPerformance.length; i++) {
          if (team.indexOf(teamPerformance[i].pokemon) === -1) {
            team.push(teamPerformance[i].pokemon);
            break;
          }
        }

        // Finally, let's round them out with a Pokemon that does best against their collective counters
        teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
        targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];
        teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

        // Add the best bodyguard that isn't the currently selected Pokemon
        for (let i = 0; i < teamPerformance.length; i++) {
          if (team.indexOf(teamPerformance[i].pokemon) === -1) {
            team.push(teamPerformance[i].pokemon);
            break;
          }
        }

        break;

      // Choose two high performance Pokemon and lead with a bodyguard
      case 'UNBALANCED':
        var teamPerformance = self.calculateAverageRosterPerformance(roster, opponentRoster);

        // Choose the best two average Pokemon
        team.push(teamPerformance[0].pokemon, teamPerformance[1].pokemon);

        // Finally, let's round lead with a Pokemon that does best against their collective counters
        teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
        targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];
        teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

        // Add the best bodyguard that isn't the currently selected Pokemon
        for (let i = 0; i < teamPerformance.length; i++) {
          if (team.indexOf(teamPerformance[i].pokemon) === -1) {
            team.splice(0, 0, teamPerformance[i].pokemon);
            break;
          }
        }

        break;

      // Use the same team as last time
      case 'SAME_TEAM':
        var previousTeam = previousTeams[1];

        for (let i = 0; i < previousTeam.length; i++) {
          team.push(previousTeam[i]);
        }

        break;

      // Use the same team as last time but with the previous lead's bodyguard as the lead
      case 'SAME_TEAM_DIFFERENT_LEAD':
        var previousTeam = previousTeams[1];

        team.push(previousTeam[1]);
        previousTeam.splice(1, 1);

        for (let i = 0; i < previousTeam.length; i++) {
          team.push(previousTeam[i]);
        }

        break;

      // Choose a team that counters the opponent's previous lead
      case 'COUNTER_LAST_LEAD':
        var opponentPreviousLead = previousTeams[0][0];

        var teamPerformance = self.calculateAverageRosterPerformance(
          [opponentPreviousLead],
          roster
        );

        var { scenarios } = teamPerformance[0];

        scenarios.sort((a, b) => (a.average > b.average ? 1 : b.average > a.average ? -1 : 0)); // Sort by worst to best

        // Lead with the best counter
        team.push(scenarios[0].opponent);

        // Next, let's give it a bodyguard
        var scenarios = self.runBulkScenarios('NO_BAIT', team[0], opponentRoster);
        scenarios.sort((a, b) => (a.average > b.average ? 1 : b.average > a.average ? -1 : 0)); // Sort by worst to last

        var targets = [scenarios[0].opponent, scenarios[1].opponent];

        teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

        // Add the best bodyguard that isn't the currently selected Pokemon
        for (let i = 0; i < teamPerformance.length; i++) {
          if (team.indexOf(teamPerformance[i].pokemon) === -1) {
            team.push(teamPerformance[i].pokemon);
            break;
          }
        }

        // Finally, let's round them out with a Pokemon that does best against their collective counters
        teamPerformance = self.calculateAverageRosterPerformance(opponentRoster, team);
        targets = [teamPerformance[0].pokemon, teamPerformance[1].pokemon];

        teamPerformance = self.calculateAverageRosterPerformance(roster, targets);

        // Add the best bodyguard that isn't the currently selected Pokemon
        for (let i = 0; i < teamPerformance.length; i++) {
          if (team.indexOf(teamPerformance[i].pokemon) === -1) {
            team.push(teamPerformance[i].pokemon);
            break;
          }
        }
        break;

      default:
        break;
    }

    console.log(pickStrategy);
    console.log(team);

    player.setTeam(team);
  };

  // Return an array of average performances of team A against team B
  this.calculateAverageRosterPerformance = function (teamA, teamB) {
    const results = [];

    for (let i = 0; i < teamA.length; i++) {
      const scenarios = self.runBulkScenarios('NO_BAIT', teamA[i], teamB);
      let average = 0;

      for (let n = 0; n < scenarios.length; n++) {
        average += scenarios[n].average;
      }

      average /= scenarios.length;

      results.push({
        pokemon: teamA[i],
        scenarios: scenarios,
        average: average,
      });
    }

    // Sort by average rating
    results.sort((a, b) => (a.average > b.average ? -1 : b.average > a.average ? 1 : 0));
    return results;
  };

  // Set the pool of available Pokemon from data
  this.setTeamPool = function (league, cup, data) {
    teamPool[`${league}${cup}`] = data;
    self.generateRoster(partySize, generateRosterCallback);
  };

  // Evaluate the current matchup and decide a high level strategy
  this.evaluateMatchup = function (turn, pokemon, opponent, opponentPlayer) {
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
    scenarios.bothBait = self.runScenario('BOTH_BAIT', pokemon, opponent);
    scenarios.neitherBait = self.runScenario('NEITHER_BAIT', pokemon, opponent);
    scenarios.noBait = self.runScenario('NO_BAIT', pokemon, opponent);
    scenarios.farm = self.runScenario('FARM', pokemon, opponent);

    const overallRating =
      (scenarios.bothBait.average + scenarios.neitherBait.average + scenarios.noBait.average) / 3;
    const options = [];
    let totalSwitchWeight = 0;

    if (
      self.hasStrategy('SWITCH_BASIC') &&
      player.getSwitchTimer() === 0 &&
      player.getRemainingPokemon() > 1
    ) {
      let switchThreshold = 500;

      if (
        self.hasStrategy('PRESERVE_SWITCH_ADVANTAGE') &&
        opponentPlayer.getRemainingPokemon() > 1
      ) {
        switchThreshold = 450;
      }

      let switchWeight = Math.floor(Math.max((switchThreshold - overallRating) / 10, 0));
      let canCounterSwitch = false;

      // Is the opponent switch locked and do I have a better Pokemon for it?
      if (opponentPlayer.getSwitchTimer() > 30000) {
        const team = player.getTeam();
        const remainingPokemon = [];

        for (let i = 0; i < team.length; i++) {
          if (team[i].hp > 0 && team[i] !== pokemon) {
            remainingPokemon.push(team[i]);
          }
        }

        for (let i = 0; i < remainingPokemon.length; i++) {
          const scenario = self.runScenario('NO_BAIT', remainingPokemon[i], opponent);
          const rating = scenario.average;

          if (rating - 500 > (Math.max(overallRating, 500) - 500) * 1.2) {
            switchWeight += Math.round((rating - overallRating) / 10);
            canCounterSwitch = true;
          }
        }
      }

      // Don't switch Pokemon when HP is low
      if (
        self.hasStrategy('PRESERVE_SWITCH_ADVANTAGE') &&
        opponentPlayer.getSwitchTimer() - player.getSwitchTimer() < 30 &&
        pokemon.hp / pokemon.stats.hp <= 0.25 &&
        opponentPlayer.getRemainingPokemon() > 1
      ) {
        switchWeight = 0;
      }
      options.push(new DecisionOption('SWITCH_BASIC', switchWeight));

      totalSwitchWeight += switchWeight;

      // See if it's feasible to build up energy before switching
      if (self.hasStrategy('SWITCH_FARM')) {
        const dpt = opponent.fastMove.damage / (opponent.fastMove.cooldown / 500);
        const percentPerTurn = (dpt / pokemon.stats.hp) * 100; // The opponent's fast attack will deal this % damage per turn
        let weightFactor = Math.pow(Math.round(Math.max(3 - percentPerTurn, 0)), 2);

        // Switch immediately if previously failed to switch before a Charged Move
        if (previousStrategy === 'SWITCH_FARM') {
          weightFactor = 0;
        }

        if (percentPerTurn > 3) {
          weightFactor = 0;
        }

        if (opponent.fastMove.energyGain / (opponent.fastMove.cooldown / 500) < 3) {
          weightFactor = 0;
        }

        if (pokemon.hp / pokemon.stats.hp < 0.5 && opponentPlayer.getRemainingPokemon() > 1) {
          weightFactor = 0.1;
        }

        if (canCounterSwitch) {
          weightFactor = 0.1;
        }

        if (pokemon.hp / pokemon.stats.hp < 0.25) {
          weightFactor = 0;
        }

        totalSwitchWeight += switchWeight * weightFactor;
        options.push(new DecisionOption('SWITCH_FARM', Math.floor(switchWeight * weightFactor)));
      }
    }

    // If there's a decent chance this Pokemon really shouldn't switch out, add other actions
    if (totalSwitchWeight < 10) {
      options.push(new DecisionOption('DEFAULT', 1));

      if (
        self.hasStrategy('BAIT_SHIELDS') &&
        opponent.shields > 0 &&
        pokemon.chargedMoves.length > 1
      ) {
        let baitWeight = Math.max(
          Math.round((scenarios.bothBait.average - scenarios.noBait.average) / 20),
          1
        );

        // If this Pokemon's moves are very close in DPE, prefer the shorter energy move
        if (scenarios.bothBait.average >= 500 && pokemon.chargedMoves.length === 2) {
          if (Math.abs(pokemon.chargedMoves[0].dpe - pokemon.chargedMoves[1].dpe) <= 0.1) {
            baitWeight += 5;
          }
        }

        // If behind on shields, bait more
        if (player.getShields() < opponentPlayer.getShields()) {
          baitWeight += 2;
        }

        // If this matchup is very bad, consider not baiting
        if (overallRating < 250) {
          baitWeight = 1;
        }

        // For Skull Bash specifically, prefer not to bait
        if (pokemon.bestChargedMove.moveId === 'SKULL_BASH' && player.getRemainingPokemon() > 1) {
          baitWeight = 0;
        }

        // If the Pokemon has very low health, don't bait
        if (pokemon.hp / pokemon.stats.hp < 0.25 && pokemon.energy < 70) {
          baitWeight = 0;
        }

        options.push(new DecisionOption('BAIT_SHIELDS', baitWeight));
      }

      if (self.hasStrategy('FARM_ENERGY')) {
        let farmWeight = Math.round((scenarios.farm.average - 600) / 20);

        // Let's farm if we'll win and the opponent is low on energy
        if (opponent.energy < 20 && scenarios.farm.average > 500) {
          farmWeight += 12;
        }

        // Don't farm against the last Pokemon
        if (opponentPlayer.getRemainingPokemon() < 2) {
          farmWeight = 0;
        }

        // Let's make very certain to farm if that looks like a winning strategy
        if (self.hasStrategy('BAD_DECISION_PROTECTION') && farmWeight >= 15) {
          farmWeight *= 5;
        }
        options.push(new DecisionOption('FARM', farmWeight));
      }
    }

    // Decide the AI's operating strategy
    const option = self.chooseOption(options);
    self.processStrategy(option.name);

    if (turn !== undefined) {
      turnLastEvaluated = battle.getTurns();
    } else {
      turnLastEvaluated = 1;
    }
  };

  // Run a specific scenario
  this.runScenario = function (type, pokemon, opponent) {
    const scenario = {
      opponent: opponent,
      name: type,
      matchups: [],
      average: 0,
      minShields: 3,
    };

    // Preserve old Pokemon stats
    const startStats = [
      {
        shields: pokemon.startingShields,
        hp: pokemon.hp,
        energy: pokemon.energy,
        cooldown: pokemon.cooldown,
        index: pokemon.index,
      },
      {
        shields: opponent.startingShields,
        hp: opponent.hp,
        energy: opponent.energy,
        cooldown: opponent.cooldown,
        index: opponent.index,
      },
    ];

    switch (type) {
      case 'BOTH_BAIT':
        pokemon.baitShields = true;
        pokemon.farmEnergy = false;
        opponent.baitShields = true;
        opponent.farmEnergy = false;
        break;

      case 'NEITHER_BAIT':
        pokemon.baitShields = false;
        pokemon.farmEnergy = false;
        opponent.baitShields = false;
        opponent.farmEnergy = false;
        break;

      case 'NO_BAIT':
        pokemon.baitShields = false;
        pokemon.farmEnergy = false;
        opponent.baitShields = true;
        opponent.farmEnergy = false;
        break;

      case 'FARM':
        pokemon.baitShields = true;
        pokemon.farmEnergy = true;
        opponent.baitShields = true;
        opponent.farmEnergy = false;
        break;
    }

    const b = new Battle();
    b.setNewPokemon(pokemon, 0, false);
    b.setNewPokemon(opponent, 1, false);

    const shieldWeights = [4, 4, 1];
    let totalWeight = 0;

    const maxShields = Math.max(pokemon.startingShields, opponent.startingShields);

    for (let i = 0; i <= startStats[0].shields; i++) {
      for (n = 0; n <= startStats[1].shields; n++) {
        pokemon.startingShields = i;
        opponent.startingShields = n;
        b.simulate();

        const rating = b.getBattleRatings()[0];

        scenario.matchups.push(rating);

        const shieldWeight = shieldWeights[i] * shieldWeights[n];
        totalWeight += shieldWeight;
        scenario.average += rating * shieldWeight;

        if (rating >= 500 && i < scenario.minShields) {
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
  };

  this.runBulkScenarios = function (type, pokemon, opponents) {
    const scenario = self.runScenario(type, pokemon, opponents[i]);
    scenarios = [];

    for (let i = 0; i < opponents.length; i++) {
      const scenario = self.runScenario(type, pokemon, opponents[i]);
      scenarios.push(scenario);
    }

    return scenarios;
  };

  // Choose an option from an array
  this.chooseOption = function (options) {
    const optionBucket = [];

    // Put all the options in bucket, multiple times for its weight value
    for (let i = 0; i < options.length; i++) {
      for (let n = 0; n < options[i].weight; n++) {
        optionBucket.push(options[i].name);
      }
    }

    // If all options have 0 weight, just toss the first option in there
    if (optionBucket.length === 0) {
      optionBucket.push(options[0].name);
    }

    const index = Math.floor(Math.random() * optionBucket.length);
    const optionName = optionBucket[index];
    const option = options.filter((obj) => {
      return obj.name === optionName;
    })[0];

    return option;
  };

  // Change settings to accomodate a new strategy
  this.processStrategy = function (strategy) {
    previousStrategy = currentStrategy;
    currentStrategy = strategy;

    const pokemon = battle.getPokemon()[player.getIndex()];

    switch (currentStrategy) {
      case 'SWITCH_FARM':
        pokemon.farmEnergy = true;
        break;

      case 'FARM':
        pokemon.farmEnergy = true;
        break;

      case 'DEFAULT':
        pokemon.baitShields = false;
        pokemon.farmEnergy = false;
        break;

      case 'BAIT_SHIELDS':
        pokemon.baitShields = true;
        pokemon.farmEnergy = false;
        break;

      case 'OVERFARM':
        pokemon.farmEnergy = true;
        break;

      default:
        break;
    }
  };

  this.decideAction = function (turn, poke, opponent) {
    let action = null;
    const opponentPlayer = battle.getPlayers()[opponent.index];

    poke.setBattle(battle);
    poke.resetMoves();

    // How much potential damage will they have after one more Fast Move?
    let extraFastMoves = Math.floor(
      (poke.fastMove.cooldown - opponent.cooldown) / opponent.fastMove.cooldown
    );

    // Give some extra room for overfarming
    if (currentStrategy.indexOf('SWITCH') === -1) {
      extraFastMoves += 1;
    }

    if (opponent.cooldown > 0 && opponent.cooldown < poke.fastMove.cooldown) {
      extraFastMoves = Math.max(extraFastMoves, 1);
    }

    const futureEnergy = opponent.energy + extraFastMoves * opponent.fastMove.energyGain;
    const futureDamage = self.calculatePotentialDamage(opponent, poke, futureEnergy);

    // Stop farming if they're about to get a lethal Charged Move
    if (futureDamage >= poke.hp && currentStrategy === 'FARM') {
      currentStrategy = 'DEFAULT';
      self.processStrategy(currentStrategy);
    }

    if (currentStrategy.indexOf('SWITCH') > -1 && player.getSwitchTimer() === 0) {
      let performSwitch = false;

      if (currentStrategy === 'SWITCH_BASIC' && turn - turnLastEvaluated >= props.reactionTime) {
        performSwitch = true;
      }

      if (currentStrategy === 'SWITCH_FARM') {
        // Check to see if the opposing Pokemon is close to a damaging Charged Move
        if (futureDamage >= poke.hp || futureDamage >= poke.stats.hp * 0.14) {
          performSwitch = true;
        }

        if (poke.hp / poke.stats.hp < 0.2) {
          performSwitch = true;
        }
      }

      if (performSwitch) {
        // Determine a Pokemon to switch to
        const switchChoice = self.decideSwitch();
        action = new TimelineAction('switch', player.getIndex(), turn, switchChoice, {
          priority: poke.priority,
        });
      }
    }

    // Potentially farm more energy than needed
    if (
      self.hasStrategy('OVERFARM') &&
      scenarios.noBait.average > 450 &&
      currentStrategy.indexOf('SWITCH') === -1 &&
      opponentPlayer.getRemainingPokemon() > 1
    ) {
      let overfarmChance = 2;

      // Be likely to overfarm if the opponent is low on energy
      overfarmChance += Math.round((50 - opponent.energy) / 10);

      if (futureDamage >= poke.hp || futureDamage >= poke.stats.hp * 0.15) {
        overfarmChance = -1;
      }

      if (poke.energy === 100) {
        overfarmChance = -1;
      }

      // Don't overfarm with Power-Up Punch or Acid Spray
      for (let i = 0; i < poke.chargedMoves.length; i++) {
        if (
          poke.chargedMoves[i].name === 'Power-Up Punch' ||
          poke.chargedMoves[i].name === 'Acid Spray'
        ) {
          overfarmChance = -1;
        }
      }

      // Don't overfarm if this Pokemon has extremely low HP
      if (poke.hp / poke.stats.hp < 0.2) {
        overfarmChance = -1;
      }

      // Perform overfarm
      if (Math.floor(Math.random() * overfarmChance) > 0) {
        action = new TimelineAction('fast', poke.index, turn, 0, {
          priority: poke.priority,
        });
      }
    }

    poke.resetMoves(true);

    if (!action) {
      action = battle.decideAction(poke, opponent);
    }

    return action;
  };

  // Return the index of a Pokemon to switch to
  this.decideSwitch = function () {
    const switchOptions = [];
    const team = player.getTeam();
    const poke = battle.getPokemon()[player.getIndex()];
    const opponent = battle.getOpponent(player.getIndex());
    const opponentPlayer = battle.getPlayers()[opponent.index];

    for (let i = 0; i < team.length; i++) {
      const pokemon = team[i];

      if (pokemon.hp > 0 && pokemon !== poke) {
        const scenario = self.runScenario('NO_BAIT', pokemon, opponent);
        let weight = 1;

        // Dramatically scale weight based on winning or losing
        if (scenario.average < 500) {
          weight = Math.round(Math.pow(scenario.average / 100, 4) / 20);
        } else {
          if (opponentPlayer.getSwitchTimer() > 10 || poke.hp <= 0) {
            // If the opponent is switch locked, favor the hard counter
            weight = Math.round(Math.pow((scenario.average - 250) / 100, 4));
          } else {
            // If the opponent isn't switch locked, favor the softer counter
            weight = Math.round(Math.pow((1000 - scenario.average) / 100, 4));
          }
        }

        if (weight < 1) {
          weight = 1;
        }

        switchOptions.push(new DecisionOption(i, weight));
      }
    }

    if (self.hasStrategy('BAD_DECISION_PROTECTION')) {
      switchOptions.sort((a, b) => (a.weight > b.weight ? -1 : b.weight > a.weight ? 1 : 0));

      if (switchOptions.length > 1 && switchOptions[0].weight > switchOptions[1].weight * 4) {
        switchOptions.splice(1, 1);
      }
    }
    const switchChoice = self.chooseOption(switchOptions);
    return switchChoice.name;
  };

  // Decide whether or not to shield a Charged Attack
  this.decideShield = function (attacker, defender) {
    // First, how hot are we looking in this current matchup?
    const currentScenario = self.runScenario('NO_BAIT', defender, attacker);
    const currentRating = currentScenario.average;
    const currentHp = defender.hp;
    let estimatedEnergy =
      attacker.energy +
      (Math.floor(Math.random() * (props.energyGuessRange * 2)) - props.energyGuessRange);
    const potentialDamage = 0;
    const potentialHp = defender.hp - potentialDamage;

    // Which move do we think the attacker is using?
    const moves = [];
    let minimumEnergy = 100;

    // Don't allow the AI to guess less energy than the opponent's fastest move
    for (let i = 0; i < attacker.chargedMoves.length; i++) {
      if (minimumEnergy > attacker.chargedMoves[i].energy) {
        minimumEnergy = attacker.chargedMoves[i].energy;
      }
    }

    if (estimatedEnergy < minimumEnergy) {
      estimatedEnergy = minimumEnergy; // Want to make sure at least one valid move can be guessed
    }

    for (let i = 0; i < attacker.chargedMoves.length; i++) {
      if (estimatedEnergy >= attacker.chargedMoves[i].energy) {
        attacker.chargedMoves.damage = battle.calculateDamage(
          attacker,
          defender,
          attacker.chargedMoves[i],
          true
        );
        moves.push(attacker.chargedMoves[i]);
      }
    }

    // Sort moves by damage
    moves.sort((a, b) => (a.damage > b.damage ? -1 : b.damage > a.damage ? 1 : 0));
    const moveGuessOptions = [];

    for (let i = 0; i < moves.length; i++) {
      let moveWeight = 1;

      // Is the opponent low on HP? Probably the higher damage move
      if (i === 0 && attacker.hp / attacker.stats.hp <= 0.25) {
        moveWeight += 8;

        if (moves[i].name === 'Acid Spray') {
          moveWeight += 12;
        }
      }

      // Be more cautious when you have more shields
      if (i === 0) {
        moveWeight += player.getShields();
      }

      // Am I the last Pokemon and will this move faint me? Better protect myself
      if (player.getRemainingPokemon() === 1 && moves[i].damage >= defender.hp) {
        moveWeight += 4;
      }

      // Is this move lower damage and higher energy? Definitely the other one, then
      if (
        i === 1 &&
        moves[i].damage < moves[0].damage &&
        moves[i].energy >= moves[0].energy &&
        moves[i].name !== 'Acid Spray'
      ) {
        moveGuessOptions[0].weight += 20;
      }
      moveGuessOptions.push(new DecisionOption(i, moveWeight));
    }

    var move = moves[self.chooseOption(moveGuessOptions).name]; // The guessed move of the attacker

    // Great! We've guessed the move, now let's analyze if we should shield like a player would
    let yesWeight = 4 + (3 - level) * 2; // Lower difficulties will make more random choices
    let noWeight = 4 + (3 - level) * 2;

    // Will this attack hurt?
    const damageWeight = Math.min(
      Math.round((move.damage / Math.max(defender.hp, defender.stats.hp / 2)) * 10),
      10
    );
    const moveDamage = move.damage;
    const fastMoveDamage = attacker.fastMove.damage;

    // Prefer shielding high damage moves over low damage moves
    if (damageWeight >= 5) {
      yesWeight += (damageWeight - 3) * (player.getShields() + 1);
    } else {
      noWeight += (8 - damageWeight) * 2;
    }

    // Prefer to shield hard hitting or knockout moves in good matchups over bad matchups
    if (damageWeight >= 6 || moveDamage + fastMoveDamage * 2 >= defender.hp) {
      if (player.getRemainingPokemon() > 1) {
        let yesRating = currentRating - 400;
        let noRating = 400 - currentRating;

        if (defender.hp / defender.stats.hp < 0.35) {
          yesRating = currentRating - 500;
          noRating = 500 - currentRating;
        }

        // If we're locked in, prefer to shield good matchups and let bad matchups go
        if (player.getSwitchTimer() > 0 && player.getRemainingPokemon() > 1) {
          yesRating *= 2;
          noRating *= 2;
        }

        yesWeight += Math.round((yesRating / 100) * damageWeight);
        noWeight += Math.round((noRating / 100) * (10 - damageWeight));
      } else {
        yesWeight += damageWeight;
        noWeight -= damageWeight;
      }
    }

    // Monkey see, monkey do
    if (
      attacker.battleStats.shieldsUsed > 0 &&
      damageWeight > 2 &&
      !self.hasStrategy('ADVANCED_SHIELDING')
    ) {
      yesWeight += 4;
    }

    // Is this Pokemon close to a move that will faint or seriously injure the attacker?
    for (let i = 0; i < defender.chargedMoves.length; i++) {
      const move = defender.chargedMoves[i];
      const turnsAway =
        Math.ceil((move.energy - defender.energy) / defender.fastMove.energyGain) *
        (defender.fastMove.cooldown / 500);

      if ((moveDamage >= attacker.hp || moveDamage >= defender.stats.hp * 0.8) && turnsAway <= 1) {
        if (self.hasStrategy('ADVANCED_SHIELDING')) {
          yesWeight += 4;
        }
      }
    }

    // Preserve shield advantage where possible
    if (
      player.getRemainingPokemon() > 1 &&
      attacker.startingShields >= defender.startingShields &&
      defender.battleStats.shieldsUsed > 0
    ) {
      yesWeight = Math.round(yesWeight / 2);

      if (currentScenario < 500) {
        yesWeight = Math.round(yesWeight / 4);
      }
    }

    // Is this the last Pokemon remaining? If so, protect it at all costs
    if (player.getRemainingPokemon() === 1) {
      yesWeight *= 2;
      noWeight = Math.round(noWeight / 4);
    }

    // Does my current Pokemon have a better matchup against the attacker than my remaining Pokemon?
    // if (self.hasStrategy('ADVANCED_SHIELDING') && player.getRemainingPokemon() > 1) {
    //   let team = player.getTeam();
    //   let remainingPokemon = [];

    //   for (let i = 0; i < team.length; i++) {
    //     if (team[i].hp > 0 && team[i] !== defender) {
    //       remainingPokemon.push(team[i]);
    //     }
    //   }

    //   let betterMatchupExists = false;

    //   for (let i = 0; i < remainingPokemon.length; i++) {
    //     let scenario = self.runScenario('NO_BAIT', remainingPokemon[i], attacker);

    //     if (scenario.average >= currentRating) {
    //       betterMatchupExists = true;
    //     }
    //   }

    //   if (
    //     !betterMatchupExists &&
    //     currentRating >= 500 &&
    //     (damageWeight > 4 || moveDamage + fastMoveDamage * 2 >= defender.hp)
    //   ) {
    //     yesWeight += 20;
    //     noWeight = Math.round(noWeight / 2);
    //   }

    //   // Avoid shielding twice if it won't be fatal
    //   if (
    //     betterMatchupExists &&
    //     moveDamage + fastMoveDamage * 2 < defender.hp &&
    //     defender.battleStats.shieldsUsed > 0
    //   ) {
    //     yesWeight = Math.round(yesWeight / 2);
    //   }
    // }

    // If one of these options is significantly more weighted than the other, make it the only option
    if (self.hasStrategy('BAD_DECISION_PROTECTION')) {
      if (yesWeight / noWeight >= 4) {
        noWeight = 0;
      } else if (noWeight / yesWeight >= 4) {
        yesWeight = 0;
      }
    }

    const options = [];
    options.push(new DecisionOption(true, yesWeight));
    options.push(new DecisionOption(false, noWeight));

    const decision = self.chooseOption(options).name;

    return decision;
  };

  // Given a pokemon and its stored energy, how much potential damage can it deal?
  this.calculatePotentialDamage = function (attacker, defender, energy, stack) {
    stack = typeof stack !== 'undefined' ? stack : true;

    const totalDamage = [];

    for (let i = 0; i < attacker.chargedMoves.length; i++) {
      let countMultiplier = Math.floor(energy / attacker.chargedMoves[i].energy);
      if (!stack) {
        countMultiplier = 0;
        if (attacker.chargedMoves[i].energy <= energy) {
          countMultiplier = 1;
        }
      }

      const damage =
        countMultiplier *
        battle.calculateDamage(attacker, defender, attacker.chargedMoves[i], true);
      totalDamage.push(damage);
    }

    if (totalDamage.length === 0) {
      return 0;
    } else {
      return Math.max.apply(Math, totalDamage);
    }
  };

  // Return whether not this AI can run the provided strategy
  this.hasStrategy = function (strategy) {
    return props.strategies.indexOf(strategy) > -1;
  };

  // Return the AI's difficulty level
  this.getLevel = function () {
    return level;
  };

  // Return the name of the difficulty level
  this.difficultyToString = function () {
    let name = 'AI';

    switch (level) {
      case 0:
        name = 'Novice';
        break;

      case 1:
        name = 'Rival';
        break;

      case 2:
        name = 'Elite';
        break;

      case 3:
        name = 'Champion';
        break;

      default:
        break;
    }

    return name;
  };
}
