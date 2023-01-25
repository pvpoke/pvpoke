/*
* The main Pokemon class used to represent individual Pokemon in battle
*/

function Pokemon(id, tera){

	let gm = GameMaster.getInstance();
	let self = this;
	let data = gm.getPokemonById(id);

	if(! data){
		console.error(id + " not found");
		return false;
	}

	// Base properties
	this.data = data;
	this.dex = data.dex;
	this.id = id;
	this.name = data.name;
	this.types = data.types.slice();
	this.tera = tera;
	this.stats = {
		hp: data.stats.hp,
		atk: data.stats.atk,
		def: data.stats.def,
		spA: data.stats.spA,
		spD: data.stats.spD,
		spe: data.stats.spe
	};

	this.traits = [];

	if(data.traits){
		for(var i = 0; i < data.traits.length; i++){
			this.traits.push(new Trait(data.traits[i]));
		}
	}

	// Set tera type
	this.setTera = function(type){
		self.tera = type;
	}

	// Turn a trait on or off. Enabling an exclusive trait will disable other exclusive traits.

	this.enableTrait = function(id){
		for(var i = 0; i < self.traits.length; i++){
			let trait = self.traits[i];

			if(trait.id == id){
				trait.active = true;

				// Disable other exclusive traits
				if(trait.type == "ability"){
					for(var n = 0; n < self.traits.length; n++){
						if(self.traits[n].id != id && self.traits[n].type == "ability"){
							trait.active = false;
						}
					}
				}

				break;
			}
		}
	}

	// Turn a trait off

	this.disableTrait = function(id){
		for(var i = 0; i < self.traits.length; i++){
			let trait = self.traits[i];

			if(trait.id == id){
				trait.active = false;
				break;
			}
		}
	}

	// Returns whether a Pokemon has an active trait and its effect value

	this.hasTrait = function(id){
		for(var i = 0; i < self.traits.length; i++){
			let trait = self.traits[i];

			if(trait.id == id && trait.active){
				return true;
			}
		}

		return false;
	}
}
