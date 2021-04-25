function Player(i, ai, b){
	// Properties
	var self = this;

	var index = i;
	var ai = ai;
	var battle = b;

	if(ai !== false){
		ai = new TrainingAI(ai, self, battle);
	}

	var team = []; // Array of Pokemon in the battle
	var roster = []; // Array of full 6 Pokemon on the team

	// Battle properties

	var shields = 2;
	var switchTimer = 0;
	var switchTime = 60000;
	var wins = 0;
	var priority = i;

	// Reset player and all Pokemon on the roster

	this.reset = function(){
		shields = 2;
		switchTimer = 0;

		for(var i = 0; i < roster.length; i++){
			roster[i].reset();
		}
	}

	// Get current roster

	this.getRoster = function(){
		return roster;
	}

	// Set current roster

	this.setRoster = function(val){
		roster = val;

		// For team generation purposes, give each Pokemon 2 shields and fully reset
		for(var i = 0; i < roster.length; i++){
			roster[i].setShields(2);
			roster[i].fullReset();
		}
	}

	// Get current team

	this.getTeam = function(){
		return team;
	}

	// Set current team

	this.setTeam = function(val){
		team = val;

		// Reset battle stats

		for(var i = 0; i < team.length; i++){
			team[i].resetBattleStats();
		}
	}

	// Get current number of shields

	this.getShields = function(){
		return shields;
	}

	// Use a shield if available, otherwise return false

	this.useShield = function(){
		if(shields > 0){
			shields--;
			return true;
		} else{
			return false;
		}
	}

	// Get current switch timer in milliseconds

	this.getSwitchTimer = function(){
		return switchTimer;
	}

	// Set the duration of the switch clock

	this.setSwitchTime = function(val){
		switchTime = val;
	}

	// Set the switch timer to its maximum value

	this.startSwitchTimer = function(){
		switchTimer = switchTime;
	}

	// Get current switch timer in milliseconds

	this.decrementSwitchTimer = function(deltaTime){
		// Evaluate the matchup when the switch clock completes
		var evaluateMatchup = false;
		if((switchTimer <= deltaTime)&&(switchTimer > 0)){
			evaluateMatchup = true;
		}

		switchTimer = Math.max(switchTimer-deltaTime, 0);

		if((index == 1)&&(evaluateMatchup)){
			ai.evaluateMatchup(battle.getTurns(), battle.getPokemon()[1], battle.getPokemon()[0], battle.getPlayers()[0]);
		}
	}

	// Return the AI controlling this player

	this.getAI = function(){
		return ai;
	}

	// Return the player's index

	this.getIndex = function(){
		return index;
	}

	// Return this player's priority

	this.getPriority = function(){
		return priority;
	}

	// Set this player's priority

	this.setPriority = function(val){
		priority = val;
	}

	// Return the number of available Pokemon

	this.getRemainingPokemon = function(){
		var count = 0;

		for(var i = 0; i < team.length; i++){
			if(team[i].hp > 0){
				count++;
			}
		}

		return count;
	}

	// Generate a random roster for this player

	this.generateRoster = function(partySize, callback, customTeamPool){
		customTeamPool = typeof customTeamPool !== 'undefined' ? customTeamPool : false;
		
		ai.generateRoster(partySize, callback, customTeamPool);
	}

	// Generate a team of 3 with an established roster

	this.generateTeam = function(opponentRoster, previousResult, previousTeams){
		if(! previousResult){
			ai.generateTeam(opponentRoster);
		} else{
			ai.generateTeam(opponentRoster, previousResult, previousTeams);
		}

	}
}
