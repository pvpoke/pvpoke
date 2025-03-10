/**
 * Type of TimelineAction
 * @typedef {"fast" | "charged" | "wait" | 'switch'} TimelineActionType
 */

/**
 * An action set in Sandbox Mode to be interpreted by Battle.js into a TimelineEvent
 */

class TimelineAction {
	/**
	 * @type {TimelineActionType}
	 */
	type;

	actor;

	/**
	 * @type {number}
	 */
	turn;

	/**
	 * Index of charged move to use
	 * @type {number}
	 */
	value;

	/**
	 * @type {any}
	 */

	settings;

	/**
	 * @type {boolean}
	 */
	processed;

	/**
	 * Whether this action has been processed yet or not
	 * @type {boolean}
	 */
	valid;

	/**
	 *
	 * @param {TimelineActionType} type
	 * @param actor
	 * @param {number} turn
	 * @param {number} value
	 * @param {any} settings
	 */
	constructor(type, actor, turn, value, settings) {
		this.type = type;
		this.actor = actor;
		this.turn = turn;
		this.value = value;
		this.settings = settings;
		this.valid = false;
		this.processed = false;
	}

	/**
	 * Converts the type to an integer
	 * @returns {0|1|2}
	 */
	typeToInt() {
		switch (this.type) {
			case "fast":
			case "charged":
				return 1;
				break;

			case "wait":
				return 2;
				break;
		}

		return 0;
	}
}
