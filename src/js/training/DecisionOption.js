class DecisionOption {
	/**
	 * @type {string | number | boolean}
	 */
	name;

	/**
	 * @type {number}
	 */
	weight;

	/**
	 *
	 * @param {string | number | boolean} name - Type is based on existing usage
	 * @param {number} weight
	 */
	constructor(name, weight) {
		this.name = name;
		this.weight = weight;
	}
}
