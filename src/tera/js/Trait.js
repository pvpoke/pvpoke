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

	// Returns -1 for no effect, numerical value if an effect activates based on the provided conditions
	this.getEffect = function(subject, opponent, attackType){
		let effect = -1;

		if(id == "water_absorb" && attackType == "water"){
			return 0;
		}

		return effect;
	}
}
