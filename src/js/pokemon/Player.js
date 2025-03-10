class Player {
	/**
	 * Represents a player in a battle
	 * @param {number} index 
	 * @param {any} aiType 
	 * @param {Battle} battle 
	 */
	constructor(index, aiType, battle) {
		this.index = index;
		this.battle = battle;
		
		// Initialize AI
		this.ai = aiType !== false ? new TrainingAI(aiType, this, battle) : false;
		
		// Arrays for Pokemon
		this.team = []; // Pokemon in the battle
		this.roster = []; // Full 6 Pokemon team
		
		// Battle properties
		this.shields = 2;
		this.switchTimer = 0;
		this.switchTime = 50000;
		this.wins = 0;
		this.priority = index;
	}

	reset() {
		this.shields = 2;
		this.switchTimer = 0;

		for (const pokemon of this.roster) {
			pokemon.reset();
		}
	}

	getRoster() {
		return this.roster;
	}

	setRoster(val) {
		this.roster = val;

		// For team generation purposes, give each Pokemon 2 shields and fully reset
		for (const pokemon of this.roster) {
			pokemon.setShields(2);
			pokemon.fullReset();
		}
	}

	getTeam() {
		return this.team;
	}

	setTeam(val) {
		this.team = val;

		// Reset battle stats
		for (const pokemon of this.team) {
			pokemon.resetBattleStats();
		}
	}

	/**
	 * Returns the number of shields remaining
	 * @returns {0|1|2}
	 */
	getShields() {
		return this.shields;
	}

	/**
	 * Attempts to use shield. Returns `true` if successful, otherwise returns `false`
	 * @returns {boolean}
	 */
	useShield() {
		if (this.shields > 0) {
			this.shields--;
			return true;
		}
		return false;
	}

	/**
	 * Returns the current switch timer in milliseconds
	 * @returns {number}
	 */
	getSwitchTimer() {
		return this.switchTimer;
	}

	/**
	 * 
	 * @param {number} val 
	 */
	setSwitchTime(val) {
		this.switchTime = val;
	}

	/**
	 * Starts the switch timer
	 */
	startSwitchTimer() {
		this.switchTimer = this.switchTime;
	}

	decrementSwitchTimer(deltaTime) {
		// Evaluate the matchup when the switch clock completes
		let evaluateMatchup = false;
		if ((this.switchTimer <= deltaTime) && (this.switchTimer > 0)) {
			evaluateMatchup = true;
		}

		this.switchTimer = Math.max(this.switchTimer - deltaTime, 0);

		if ((this.index == 1) && evaluateMatchup) {
			this.ai.evaluateMatchup(
				this.battle.getTurns(),
				this.battle.getPokemon()[1],
				this.battle.getPokemon()[0],
				this.battle.getPlayers()[0]
			);
		}
	}

	/**
	 * Return the AI controlling this player
	 * @returns {TrainingAI}
	 */
	getAI() {
		return this.ai;
	}

	/**
	 * Return the player's index
	 * @returns {number}
	 */
	getIndex() {
		return this.index;
	}

	/**
	 * Returns this priority of the player
	 * @returns {number}
	 */
	getPriority() {
		return this.priority;
	}

	/**
	 * Sets the priority of the player
	 * @param {number} val
	 */
	setPriority(val) {
		this.priority = val;
	}

	/**
	 * Returns the number of remaining Pokemon
	 * @returns {number}
	 */
	getRemainingPokemon() {
		let count = 0;

		for (const pokemon of this.team) {
			if (pokemon.hp > 0) {
				count++;
			}
		}

		return count;
	}

	/**
	 * Generate a random roster for this player
	 * @param {number} partySize
	 * @param {Function} callback
	 * @param {boolean} [customTeamPool=false]
	 */
	generateRoster(partySize, callback, customTeamPool = false) {
		this.ai.generateRoster(partySize, callback, customTeamPool);
	}

	/**
	 * Generate a team of 3 with an established roster
	 * @param opponentRoster
	 * @param {'win' | 'loss'} [previousResult]
	 * @param previousTeams
	 */
	generateTeam(opponentRoster, previousResult, previousTeams) {
		if (!previousResult) {
			this.ai.generateTeam(opponentRoster);
		} else {
			this.ai.generateTeam(opponentRoster, previousResult, previousTeams);
		}
	}
}
