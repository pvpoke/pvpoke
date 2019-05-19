// JavaScript Document

/*
* This is the Ranker.js file without all the bells and whistles,
* used to rank potential counters on the Team Builder page.
* Should I be using the same code? Yup. Am I? Nope. Stay tuned for
* when this comes back to bite me.
*/

var RankerMaster = (function () {
    var instance;

    function createInstance() {


        var object = new rankerObject();

		function rankerObject(){
			var gm = GameMaster.getInstance();
			var battle;
			var self = this;

			var targets = []; // Set targets to rank against

			var rankings = [];

			var shieldOverride = 0;
			var shieldMode = 'single'; // single - sim specific shield scenarios, average - sim average of 0 and 1 shields each
			var chargedMoveCountOverride = 2;
			var shieldBaitOverride = true;

			var csv = '';

			this.context = "team-builder";

			// Run an individual rank set

			this.rank = function(team, league, cup, exclusionList){

				var totalBattles = 0;

				battle = new Battle();
				battle.setCP(league);
				battle.setCup(cup.name);

				var pokemonList = [];
				var teamRatings = [];

				for(var i = 0; i < team.length; i++){
					teamRatings.push([]);
				}

				rankings = [];

				if(team.length == 1){
					csv = 'Pokemon,Battle Rating'
				}

				if((targets.length == 0)||(cup.name != "custom")){

					// Gather all eligible Pokemon

					var minStats = 3000; // You must be this tall to ride this ride

					if(battle.getCP() == 1500){
						minStats = 1250;
					} else if(battle.getCP() == 2500){
						minStats = 2000;
					}

					var bannedList = ["mewtwo","giratina_altered","groudon","kyogre","rayquaza","palkia","dialga","heatran","giratina_origin"];
					var permaBannedList = ["rotom","rotom_fan","rotom_frost","rotom_heat","rotom_mow","rotom_wash","regigigas","phione","manaphy","darkrai","shaymin_land","shaymin_sky","arceus","arceus_bug","arceus_dark","arceus_dragon","arceus_electric","arceus_fairy","arceus_fighting","arceus_fire","arceus_flying","arceus_ghost","arceus_grass","arceus_ground","arceus_ice","arceus_poison","arceus_psychic","arceus_rock","arceus_steel","arceus_water","jirachi","kecleon"]; // Don't rank these Pokemon at all yet
					var allowedList = [];

					if(cup.name == "nightmare"){
						permaBannedList = permaBannedList.concat(["sableye","medicham","lugia","cresselia","deoxys","deoxys_attack","deoxys_defense","deoxys_speed","mew","celebi","latios","latias","uxie","azelf","mesprit"]);
					}


					if(exclusionList){
						bannedList = bannedList.concat(exclusionList);
					}

					for(var i = 0; i < gm.data.pokemon.length; i++){

						if(gm.data.pokemon[i].fastMoves.length > 0){
							var pokemon = new Pokemon(gm.data.pokemon[i].speciesId, 0, battle);

							pokemon.initialize(battle.getCP());

							var stats = (pokemon.stats.hp * pokemon.stats.atk * pokemon.stats.def) / 1000;

							if(stats >= minStats){

								if((battle.getCP() == 1500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
									continue;
								}

								if((allowedList.length > 0) && (allowedList.indexOf(pokemon.speciesId) == -1)){
									continue;
								}

								if(permaBannedList.indexOf(pokemon.speciesId) > -1){
									continue;
								}
								
								if((cup.name == "rainbow")&&( (pokemon.dex > 251) || (pokemon.speciesId.indexOf("alolan") > -1))){
									continue;
								}

								if((cup.types.length > 0) && (cup.types.indexOf(pokemon.types[0]) < 0) && (cup.types.indexOf(pokemon.types[1]) < 0) ){
									continue;
								}

								pokemonList.push(pokemon);
							}
						}
					}

				} else{

					// Otherwise, push all set targets into the list

					for(var i = 0; i < targets.length; i++){
						pokemonList.push(targets[i]);
					}
				}


				// For all eligible Pokemon, simulate battles and gather rating data

				var rankCount = pokemonList.length;

				for(var i = 0; i < rankCount; i++){

					var pokemon = pokemonList[i];

					var rankObj = {
						speciesId: pokemon.speciesId,
						speciesName: pokemon.speciesName,
						types: pokemon.types,
						rating: 0,
						opRating: 0,
						index: i
					};

					// Add to CSV

					var name = pokemon.speciesName;

					if(targets.length > 0){
						var moveset = {
							fastMove: pokemon.fastMove,
							chargedMoves: []
						};

						name += ' (' + pokemon.fastMove.abbreviation;

						if(pokemon.chargedMoves.length > 0){
							name += '+';
						}

						for(var n = 0; n < pokemon.chargedMoves.length; n++){
							moveset.chargedMoves.push(pokemon.chargedMoves[n]);

							if(n > 0){
								name += '/';
							}

							name += pokemon.chargedMoves[n].abbreviation;
						}

						rankObj.moveset = moveset;

						name += ')';

					}

					csv += '\n' + name;

					var avg = 0;
					var opponentRating = 0;

					// Simulate battle against each Pokemon

					for(var n = 0; n < team.length; n++){

						var opponent = team[n];

						opponent.index = 1;

						totalBattles++;

						var initialize = true;

						if(targets.length > 0){
							initialize = false;
						}

						battle.setNewPokemon(pokemon, 0, initialize);


						if(team.length > 3){
							battle.setNewPokemon(opponent, 1);
						} else{
							battle.setNewPokemon(opponent, 1, false); // Keep settings for selected Pokemon
						}

						// Force best moves on counters but not on the user's selected Pokemon

						if(targets.length == 0){
							pokemon.autoSelectMoves(chargedMoveCountOverride);
						}

						if(team.length > 3){
							opponent.autoSelectMoves(chargedMoveCountOverride);
						}

						pokemon.baitShields = shieldBaitOverride;

						var shieldTestArr = []; // Array of shield scenarios to test

						if(shieldMode == 'single'){
							shieldTestArr.push(shieldOverride);
						} else if(shieldMode == 'average'){
							shieldTestArr.push(0, 1);
						}

						var avgPokeRating = 0;
						var avgOpRating = 0;

						for(var j = 0; j < shieldTestArr.length; j++){
							pokemon.setShields(shieldTestArr[j]);

							if(shieldMode == 'average'){
								opponent.setShields(shieldTestArr[j]);
							}

							battle.simulate();
							
							var healthRating = (pokemon.hp / pokemon.stats.hp);
							var damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));

							var opHealthRating = (opponent.hp / opponent.stats.hp);
							var opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));

							var rating = Math.floor( (healthRating + damageRating) * 500);
							var opRating = Math.floor( (opHealthRating + opDamageRating) * 500);

							avgPokeRating += rating;
							avgOpRating += opRating;
						}

						avgPokeRating = Math.floor(avgPokeRating / shieldTestArr.length);
						avgOpRating = Math.floor(avgOpRating / shieldTestArr.length);

						csv += ',' + avgOpRating;

						avg += avgPokeRating;
						opponentRating = avgOpRating;

						teamRatings[n].push(avgOpRating);
					}

					avg = Math.floor(avg / team.length);

					rankObj.rating = avg;
					rankObj.opRating = opponentRating;
					rankings.push(rankObj);
				}

				// Sort rankings

				if(self.context == "team-builder"){
					rankings.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));
				} else if(self.context == "battle"){
					rankings.sort((a,b) => (a.rating > b.rating) ? 1 : ((b.rating > a.rating) ? -1 : 0));
				}


				// Sort team's matchups by best to worst

				for(var i = 0; i < teamRatings.length; i++){
					 teamRatings[i].sort((a,b) => (a > b) ? -1 : ((b > a) ? 1 : 0));
				}

				battle.clearPokemon(); // Prevents associated Pokemon objects from being altered by future battles

				return {rankings: rankings, teamRatings: teamRatings, csv: csv};
			}

			// Override Pokemon shield settings with the provided value

			this.setShields = function(value){
				shieldOverride = value;
			}

			// Override charged move count with the provided value

			this.setChargedMoveCount = function(value){
				chargedMoveCountOverride = value;
			}

			// Override whether or not to bait shields

			this.setShieldBaitOverride = function(value){
				shieldBaitOverride = value;
			}

			// Set the targets to rank against

			this.setTargets = function(arr){
				targets = arr;
			}

			// Set how to handle multiple shield scenarios

			this.setShieldMode = function(value){
				shieldMode = value;
			}

		};

        return object;
	}

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
