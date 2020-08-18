function Player(i, ai, b) {
  // Properties
  const self = this;

  const index = i;
  var ai = ai;
  const battle = b;

  if (ai !== false) {
    ai = new TrainingAI(ai, self, battle);
  }

  let team = []; // Array of Pokemon in the battle
  let roster = []; // Array of full 6 Pokemon on the team

  // Battle properties
  let shields = 2;
  let switchTimer = 0;
  const switchTime = 60000;
  const wins = 0;
  let priority = i;

  // Reset player and all Pokemon on the roster
  this.reset = function () {
    shields = 2;
    switchTimer = 0;

    for (let i = 0; i < roster.length; i++) {
      roster[i].reset();
    }
  };

  // Get current roster
  this.getRoster = function () {
    return roster;
  };

  // Set current roster
  this.setRoster = function (val) {
    roster = val;

    // For team generation purposes, give each Pokemon 2 shields and fully reset
    for (let i = 0; i < roster.length; i++) {
      roster[i].setShields(2);
      roster[i].fullReset();
    }
  };

  // Get current team
  this.getTeam = function () {
    return team;
  };

  // Set current team
  this.setTeam = function (val) {
    team = val;

    // Reset battle stats
    for (let i = 0; i < team.length; i++) {
      team[i].resetBattleStats();
    }
  };

  // Get current number of shields
  this.getShields = function () {
    return shields;
  };

  // Use a shield if available, otherwise return false
  this.useShield = function () {
    if (shields > 0) {
      shields -= 1;
      return true;
    } else {
      return false;
    }
  };

  // Get current switch timer in milliseconds
  this.getSwitchTimer = function () {
    return switchTimer;
  };

  // Set the switch timer to its maximum value
  this.startSwitchTimer = function () {
    switchTimer = switchTime;
  };

  // Get current switch timer in milliseconds
  this.decrementSwitchTimer = function (deltaTime) {
    // Evaluate the matchup when the switch clock completes
    let evaluateMatchup = false;
    if (switchTimer <= deltaTime && switchTimer > 0) {
      evaluateMatchup = true;
    }

    switchTimer = Math.max(switchTimer - deltaTime, 0);

    if (index === 1 && evaluateMatchup) {
      ai.evaluateMatchup(
        battle.getTurns(),
        battle.getPokemon()[1],
        battle.getPokemon()[0],
        battle.getPlayers()[0]
      );
    }
  };

  // Return the AI controlling this player
  this.getAI = function () {
    return ai;
  };

  // Return the player's index
  this.getIndex = function () {
    return index;
  };

  // Return this player's priority
  this.getPriority = function () {
    return priority;
  };

  // Set this player's priority
  this.setPriority = function (val) {
    priority = val;
  };

  // Return the number of available Pokemon
  this.getRemainingPokemon = function () {
    let count = 0;

    for (let i = 0; i < team.length; i++) {
      if (team[i].hp > 0) {
        count += 1;
      }
    }

    return count;
  };

  // Generate a random roster for this player
  this.generateRoster = function (partySize, callback) {
    ai.generateRoster(partySize, callback);
  };

  // Generate a team of 3 with an established roster
  this.generateTeam = function (opponentRoster, previousResult, previousTeams) {
    if (!previousResult) {
      ai.generateTeam(opponentRoster);
    } else {
      ai.generateTeam(opponentRoster, previousResult, previousTeams);
    }
  };
}
