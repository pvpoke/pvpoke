/*
* Class for individual Pokemon traits such as moves or abilities that affect type matchups, stats, or scoring
*/

function Trait(id){

	let gm = GameMaster.getInstance();
	let self = this;
	let data = gm.getTraitById(id);

	if(! data){
		console.error(id + " not found");
		return false;
	}

	// Base properties
	this.data = data;
	this.id = id;
	this.name = data.name;
	this.active = false;
	this.type = data.type; // ability or move
}

/* STATIC METHODS */

// Evaluate all type related traits and return the relevant effectiveness

Trait.evaluateType = function(moveType, targetTypes, attacker, defender){
	let effect = 1;

	if(! Array.isArray(targetTypes)){
		targetTypes = [targetTypes];
	}

	if( (defender.hasTrait("water_absorb") || defender.hasTrait("storm_drain")) && moveType == "water"){
		effect *= 0;
	}

	if( (defender.hasTrait("flash_fire") || defender.hasTrait("well_baked_body")) && moveType == "fire"){
		effect *= 0;
	}

	if(defender.hasTrait("heatproof") && moveType == "fire"){
		effect *= 0.5;
	}

	if(defender.hasTrait("levitate") && moveType == "ground"){
		effect *= 0;
	}

	if(defender.hasTrait("thick_fat") && (moveType == "ice" || moveType == "fire")){
		effect *= 0.5;
	}

	if(defender.hasTrait("purifying_salt") && moveType == "ghost"){
		effect *= 0.5;
	}

	return effect;
}

// Evaluate stat related traits and return the relevant multiplier

Trait.evaluateStat = function(stat, subject, opponent){
	let effect = 1;

	if(stat == "atk" && subject.hasTrait("huge_power")){
		effect *= 2;
	}

	return effect;
}
