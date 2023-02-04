/*
* The main Pokemon class used to represent individual Pokemon in battle
*/

function Pokemon(id, tera, isBoss){
	isBoss = typeof isBoss !== 'undefined' ? isBoss : false;

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

	this.opponent = null;
	this.isBoss = isBoss;
	this.defaults = null;

	this.traits = [];

	if(data.traits){
		for(var i = 0; i < data.traits.length; i++){
			this.traits.push(new Trait(data.traits[i]));
		}
	}

	// For bosses, sort traits by type and enable default traits
	if(this.isBoss){
		this.traits.sort((a,b) => (a.type > b.type) ? 1 : ((b.type > a.type) ? -1 : 0));

		if(data.defaults){
			this.defaults = data.defaults;
		}
	}

	// Return a Pokemon's effective stat value
	this.stat = function(name){
		let value = self.stats[name];

		if(self.opponent){
			value *= Trait.evaluateStat(name, self, self.opponent);
		}

		return value;
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
							self.traits[n].active = false;
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

	// Turn off all traits

	this.disableAllTraits = function(id){
		for(var i = 0; i < self.traits.length; i++){
			let trait = self.traits[i];

			trait.active = false;
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

	// Return a URL string of enabled traits

	this.getTraitURLStr = function(){
		let traitIds = [];

		for(var i = 0; i < self.traits.length; i++){
			let trait = self.traits[i];

			if(trait.active){
				traitIds.push(trait.id);
			}
		}

		if(traitIds.length > 0){
			return traitIds.join("-");
		}

		return false;
	}

	// Returns an array of currently active traits

	this.getActiveTraits = function(){
		let activeTraits = [];

		for(var i = 0; i < self.traits.length; i++){
			if(self.traits[i].active){
				activeTraits.push(self.traits[i]);
			}
		}

		return activeTraits;
	}

	// Initialize defaults


	if(this.defaults && this.defaults.traits){
		for(var i = 0; i < this.defaults.traits.length; i++){
			this.enableTrait(this.defaults.traits[i]);
		}
	}
}
