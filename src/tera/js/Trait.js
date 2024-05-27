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

	if( (defender.hasTrait("volt_absorb") || defender.hasTrait("lightning_rod")) && moveType == "electric"){
		effect *= 0;
	}

	if(defender.hasTrait("heatproof") && moveType == "fire"){
		effect *= 0.5;
	}

	if(defender.hasTrait("sap_sipper") && moveType == "grass"){
		effect *= 0;
	}


	if( (defender.hasTrait("levitate") || defender.hasTrait("earth_eater") ) && moveType == "ground"){
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

	if( (stat == "atk" || stat == "spA") && subject.hasTrait("light_ball")){
		effect *= 2;
	}

	if(stat == "atk" && opponent.hasTrait("intimidate")){
		effect *= .8;
	}

	if(stat == "spA" && subject.hasTrait("competitive") && opponent.hasTrait("intimidate")){
		effect *= 1.5;
	}

	if(stat == "atk" && subject.hasTrait("defiant") && opponent.hasTrait("intimidate")){
		effect *= 1.25;
	}

	if(stat == "spD" && subject.hasTrait("ice_scales")){
		effect *= 2;
	}

	return effect;
}

// Evaluate stat related traits and return the relevant multiplier

Trait.evaluateStab = function(stab, attacker, moveType, teraType){

	if((attacker.types.indexOf(moveType) > -1 || moveType == teraType) && attacker.hasTrait("adaptability")) {
		stab = 2;
	}

	if(attacker.types.indexOf(moveType) > -1 && moveType == teraType && attacker.hasTrait("adaptability")){
		stab = 2.25;
	}

	return stab;
}
