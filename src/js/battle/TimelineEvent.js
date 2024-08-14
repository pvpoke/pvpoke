/**
 * @typedef {
 *      'switchAvailable' | 'faint' | 'tap interaction' |
 *      'tap interaction wait' | `tap{string}` | 'shield'
 *      } TimelineEventType
 */

/**
 * An event that occurs in the timeline
 */

class TimelineEvent {
	/**
	 * @type {TimelineEventType}
	 */
	type;
	/**
	 * @type {string}
	 */
	name;

	actor;

	/**
	 * @type {number}
	 */
	time;

	/**
	 * @type {number}
	 */
	turn;

	/**
	 * @type {Array<number>}
	 */
	values;

	/**
	 *
	 * @param {TimelineEventType} type
	 * @param {string} name
	 * @param actor
	 * @param {number} time
	 * @param {number} turn
	 * @param {Array<number>} [values]
	 */
	constructor(type, name, actor, time, turn, values) {
		values = typeof values !== "undefined" ? values : [0];
		this.type = type;
		this.name = name;
		this.actor = actor;
		this.time = time;
		this.turn = turn;
		this.values = values; // 0 - damage, 1 - energy
	}
}
