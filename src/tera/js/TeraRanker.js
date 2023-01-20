// Tera raid attacker calculator & ranker

function TeraRanker(){

	let self = this;

	let gm = GameMaster.getInstance();
	let standardHP = 10; // Square root of 100
	let statScorePower = 2/5;

	let allTypes = ["bug","dark","dragon","electric","fairy","fighting","fire","flying","ghost","grass","ground","ice","normal","poison","psychic","rock","steel","water"];

	this.rankAttackers = function(raidBoss, raidTypes, raidTera){

		// For each possible defensive and offensive type combination, calculate a defensive score
		let ranks = self.generateRankingList();

		// For all type combos, evaluate defensive scores

		for(var i = 0; i < ranks.length; i++){
			let rank = ranks[i];

			rank.defense = self.scoreDefense(raidBoss, rank.pokemon, rank.tera, raidTypes, raidTera);
			rank.offense = self.scoreOffense(raidBoss, rank.pokemon, rank.tera, raidTera);

			if(rank.defense > 0){
				rank.overall = rank.offense / rank.defense; // Overall score = damage output / damage input
			} else{
				rank.overall = rank.offense / 0.1;
			}
		}

		ranks.sort((a,b) => (a.overall > b.overall) ? -1 : ((b.overall > a.overall) ? 1 : 0));
		//ranks.sort((a,b) => (a.offense > b.offense) ? -1 : ((b.offense > a.offense) ? 1 : 0));
		//ranks.sort((a,b) => (a.defense > b.defense) ? 1 : ((b.defense > a.defense) ? -1 : 0));

		return ranks;
	}

	// Given a type combo, score offensively given the raid's tera type

	this.scoreOffense = function(raidBoss, attacker, attackerTera, raidTera){

		// Score the Pokemon's base types offensively
		let baseScore = 1;
		let neutralEffectiveness = 1;
		let attackerType1Effectiveness = self.getEffectiveness(attacker.types[0], raidTera) * 1.5;

		// The Pokemon will use its most effective offensive type, or at worst a neutral non-STAB move
		if(attacker.types.length > 1){
			let attackerType2Effectiveness = self.getEffectiveness(attacker.types[1], raidTera) * 1.5;
			baseScore = Math.max(neutralEffectiveness, attackerType1Effectiveness, attackerType2Effectiveness);
		} else{
			baseScore = Math.max(neutralEffectiveness, attackerType1Effectiveness);
		}

		let teraScore = self.getEffectiveness(attackerTera, raidTera);

		// Apply STAB
		if(attacker.types.indexOf(attackerTera) > -1){
			teraScore *= 2;
		} else{
			teraScore *= 1.5;
		}

		// Weighted average of both scores

		let score = ( (teraScore * 4) + (baseScore * 2) ) / 6;

		// Factor base stats
		let physical = (attacker.stats.atk > attacker.stats.spA);
		let statScore = 1;

		if(physical){
			statScore = (attacker.stats.atk * standardHP) / (raidBoss.stats.def * Math.sqrt(raidBoss.stats.hp));
		} else{
			statScore = (attacker.stats.spA * standardHP) / (raidBoss.stats.spD * Math.sqrt(raidBoss.stats.hp));
		}

		statScore = Math.pow(statScore, statScorePower);
		score *= statScore;

		if(attacker.id == "slaking"){
			score /= 2;
		}

		return score;
	}

	// Given a type combo, score defensively given offensive types

	this.scoreDefense = function(raidBoss, defender, defenderTera, raidTypes, raidTera){

		// Score the Pokemon's base types defensively
		let baseScore = 0;
		let arr = []; // Store effectiveness for each move in an array

		for(var i = 0; i < raidTypes.length; i++){
			let effectiveness = self.getEffectiveness(raidTypes[i], defender.types);
			effectiveness *= self.getStab(raidBoss, raidTypes[i], raidTera);

			if(defender.id == "clodsire" && raidTypes[i] == "water"){
				effectiveness = 0;
			}

			arr.push(effectiveness);
		}

		// Sort array to weigh the most dangerous move
		arr.sort((a,b) => (a > b) ? -1 : ((b > a) ? 1 : 0));

		baseScore += arr[0] * 4;

		for(var i = 1; i < arr.length; i++){
			baseScore += arr[i];
		}

		baseScore /= (arr.length - 1 + 4);

		// Score the Pokemon's tera type defensively
		let teraScore = 0;

		arr = [];

		for(var i = 0; i < raidTypes.length; i++){
			effectiveness = self.getEffectiveness(raidTypes[i], defenderTera);
			effectiveness *= self.getStab(raidBoss, raidTypes[i], raidTera);

			if(defender.id == "clodsire" && raidTypes[i] == "water"){
				effectiveness = 0;
			}

			arr.push(effectiveness);
		}

		arr.sort((a,b) => (a > b) ? -1 : ((b > a) ? 1 : 0));

		teraScore += arr[0] * 4;

		for(var i = 1; i < arr.length; i++){
			teraScore += arr[i];
		}

		teraScore /= (arr.length - 1 + 4);

		// Weighted average of both scores

		let score = ( (baseScore * 4) + (teraScore * 2) ) / 6;

		// Factor base stats
		let physical = (raidBoss.stats.atk > raidBoss.stats.spA);
		let statScore = 1;

		if(physical){
			statScore = (raidBoss.stats.atk * standardHP) / (defender.stats.def * Math.sqrt(defender.stats.hp));
		} else{
			statScore = (raidBoss.stats.spA * standardHP) / (defender.stats.spD * Math.sqrt(defender.stats.hp));
		}

		statScore = Math.pow(statScore, statScorePower);

		score *= statScore;

		score /= 3; // Scale Defense score to be on par with Offense

		return score;
	}

	// Compile a ranking list of all Pokemon entries and all possible tera types

	this.generateRankingList = function(){
		let ranks = [];

		for(var i = 0; i < gm.data.pokemon.length; i++){
			let poke = gm.data.pokemon[i];

			// Exclude Pokemon with low base stat total
			let stats = poke.stats;
			let total = stats.hp + stats.atk + stats.def + stats.spA + stats.spD + stats.spe;
			if(total < 425){
				continue;
			}

			for(var n = 0; n < allTypes.length; n++){
				// Add an entry for each Pokemon with each tera type]
				ranks.push({
					pokemon: poke,
					tera: allTypes[n]
				});
			}
		}

		return ranks;
	}

	// Given an array containing a defensive types, return an array of type effectiveness

	this.getTypeEffectivenessArray = function(types){

		var arr = [];

		for(var n = 0; n < allTypes.length; n++){
			effectiveness = self.getEffectiveness(allTypes[n], types);
			arr[allTypes[n]] = effectiveness;
		}

		return arr;
	}

	// Given a move type and array of defensive types, return the final type effectiveness multiplier

	this.getEffectiveness = function(moveType, targetTypes){
		var effectiveness = 1;

		if(! Array.isArray(targetTypes)){
			targetTypes = [targetTypes];
		}

		for(var i = 0; i < targetTypes.length; i++){
			var type = targetTypes[i];
			var traits = this.getTypeTraits(type);

			if(traits.weaknesses.indexOf(moveType) > -1){
				effectiveness *= 2;
			} else if(traits.resistances.indexOf(moveType) > -1){
				effectiveness *= .5;
			} else if(traits.immunities.indexOf(moveType) > -1){
				effectiveness *= .0;
			}
		}

		return effectiveness;
	}

	// Return a STAB multiplier given a Pokemon, a move type, and a Pokemon's tera type
	this.getStab = function(pokemon, moveType, teraType){
		let stab = 1;

		if(pokemon.types.indexOf(moveType) > -1 || moveType == teraType){
			stab = 1.5;
		}

		if(pokemon.types.indexOf(moveType) > -1 && moveType == teraType){
			stab = 2;
		}

		return stab;
	}

	// Helper function that returns an array of weaknesses, resistances, and immunities given defensive type

	this.getTypeTraits = function(type){
		var traits = {
			weaknesses: [],
			resistances: [],
			immunities: []
		};

		switch(type){
			case "normal":
				traits = { resistances: [],
				  weaknesses: ["fighting"],
				  immunities: ["ghost"] };
				break;

			case "fighting":
				traits = { resistances: ["rock", "bug", "dark"],
				  weaknesses: ["flying", "psychic", "fairy"],
				  immunities: [] };
				break;

			case "flying":
				traits = { resistances: ["fighting", "bug", "grass"],
				  weaknesses: ["rock", "electric", "ice"],
				  immunities: ["ground"] };
				break;

			case "poison":
				traits = { resistances: ["fighting", "poison", "bug", "fairy","grass"],
				  weaknesses: ["ground", "psychic"],
				  immunities: [] };
				break;

			case "ground":
				traits = { resistances: ["poison", "rock"],
				  weaknesses: ["water", "grass", "ice"],
				  immunities: ["electric"] };
				break;

			case "rock":
				traits = { resistances: ["normal", "flying", "poison", "fire"],
				  weaknesses: ["fighting", "ground", "steel", "water", "grass"],
				  immunities: [] };
				break;

			case "bug":
				traits = { resistances: ["fighting", "ground", "grass"],
				  weaknesses: ["flying", "rock", "fire"],
				  immunities: [] };
				break;

			case "ghost":
				traits = { resistances: ["poison", "bug"],
				  weaknesses: ["ghost","dark"],
				  immunities: ["normal", "fighting"] };
				break;

			case "steel":
				traits = { resistances: ["normal", "flying", "rock", "bug", "steel", "grass", "psychic", "ice", "dragon", "fairy"],
				  weaknesses: ["fighting", "ground", "fire"],
				  immunities: ["poison"] };
				break;

			case "fire":
				traits = { resistances: ["bug", "steel", "fire", "grass", "ice", "fairy"],
				  weaknesses: ["ground", "rock", "water"],
				  immunities: [] };
				break;

			case "water":
				traits = { resistances: ["steel", "fire", "water", "ice"],
				  weaknesses: ["grass", "electric"],
				  immunities: [] };
				break;

			case "grass":
				traits = { resistances: ["ground", "water", "grass", "electric"],
				  weaknesses: ["flying", "poison", "bug", "fire", "ice"],
				  immunities: [] };
				break;

			case "electric":
				traits = { resistances: ["flying", "steel", "electric"],
				  weaknesses: ["ground"],
				  immunities: [] };
				break;

			case "psychic":
				traits = { resistances: ["fighting", "psychic"],
				  weaknesses: ["bug", "ghost", "dark"],
				  immunities: [] };
				break;

			case "ice":
				traits = { resistances: ["ice"],
				  weaknesses: ["fighting", "fire", "steel", "rock"],
				  immunities: [] };
				break;

			case "dragon":
				traits = { resistances: ["fire", "water", "grass", "electric"],
				  weaknesses: ["dragon", "ice", "fairy"],
				  immunities: [] };
				break;

			case "dark":
				traits = { resistances: ["ghost", "dark"],
				  weaknesses: ["fighting", "fairy", "bug"],
				  immunities: ["psychic"] };
				break;

			case "fairy":
				traits = { resistances: ["fighting", "bug", "dark"],
				  weaknesses: ["poison", "steel"],
				  immunities: ["dragon"] };
				break;
		}

		return traits;
	}

}
