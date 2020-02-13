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

			var shieldOverrides = [0, 0];
			var shieldMode = 'single'; // single - sim specific shield scenarios, average - sim average of 0 and 1 shields each
			var chargedMoveCountOverride = 2;
			var shieldBaitOverrides = [true, true];
			var overrideSettings = [{
				shields: 1,
				ivs: "original",
				bait: true
			}, {
				shields: 1,
				ivs: "original",
				bait: true
			}];

			var csv = '';

			this.context = "team-builder";

			// Run an individual rank set

			this.rank = function(team, league, cup, exclusionList, context){
				if(context){
					self.context = context;
				}

				var totalBattles = 0;

				battle = new Battle();
				battle.setCP(league);
				if(cup.name != "custom"){
					battle.setCup(cup.name);
				} else{
					battle.setCustomCup(cup);
				}

				var pokemonList = [];
				var teamRatings = [];

				for(var i = 0; i < team.length; i++){
					teamRatings.push([]);

					// Adjust IVs as needed
					console.log(overrideSettings[0].ivs);
					if((overrideSettings[0].ivs != "gamemaster")&&(overrideSettings[0].ivs != "original")){
						team[i].maximizeStat(overrideSettings[0].ivs);
					} else if((overrideSettings[0].ivs == "gamemaster")&&(team[i].isCustom)){
						team[i].isCustom = false;
						team[i].initialize(battle.getCP());
						if(! team[i].baitShields){
							team[i].isCustom = true;
						}
					}
				}

				rankings = [];

				if(team.length == 1){
					csv = 'Pokemon,Battle Rating,Energy Remaining,HP Remaining'
				}

				if(((targets.length == 0)||(cup.name != "custom"))&&(context != "matrix")){
					// Get a full list of Pokemon from the game master
					pokemonList = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude);
				} else{
					// Otherwise, push all set targets into the list

					for(var i = 0; i < targets.length; i++){
						pokemonList.push(targets[i]);
					}
				}

				// Remove any Pokemon that are in the exclusion list
				if(exclusionList){
					for(var i = 0; i < pokemonList.length; i++){
						if(exclusionList.indexOf(pokemonList[i].speciesId) > -1){
							pokemonList.splice(i, 1);
						}
					}
				}

				// For all eligible Pokemon, simulate battles and gather rating data

				var rankCount = pokemonList.length;

				for(var i = 0; i < rankCount; i++){

					var pokemon = pokemonList[i];

					if(targets.length == 0){
						pokemon.selectRecommendedMoveset();
					}

					var rankObj = {
						pokemon: pokemon,
						speciesId: pokemon.speciesId,
						speciesName: pokemon.speciesName,
						types: pokemon.types,
						rating: 0,
						opRating: 0,
						matchups: [],
						index: i
					};

					// Add to CSV

					var name = pokemon.speciesName;
					var moveset = {
						fastMove: pokemon.fastMove,
						chargedMoves: []
					};

					name += ' ' + pokemon.generateMovesetStr();
					csv += '\n' + name;

					for(var n = 0; n < pokemon.chargedMoves.length; n++){
						moveset.chargedMoves.push(pokemon.chargedMoves[n]);
					}

					if((overrideSettings[1].ivs != "gamemaster")&&(overrideSettings[1].ivs != "original")){
						pokemon.maximizeStat(overrideSettings[1].ivs);
					} else if((overrideSettings[1].ivs == "gamemaster")&&(pokemon.isCustom)){
						pokemon.isCustom = false;
						pokemon.initialize(battle.getCP());
						if(! pokemon.baitShields){
							pokemon.isCustom = true;
						}
					}

					rankObj.moveset = moveset;

					var avg = 0;
					var matchupScore = 0; // A softer representation of wins/losses used for team builder threats and alternatives
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

						battle.setNewPokemon(pokemon, 0, false);
						battle.setNewPokemon(opponent, 1, false);


						// Force best moves on counters but not on the user's selected Pokemon

						if((context != "team-counters")&&(context != "matrix")&&(team.length > 1)){
							opponent.selectRecommendedMoveset();
						}

						pokemon.baitShields = overrideSettings[1].bait;

						if(context == "matrix"){
							opponent.baitShields = overrideSettings[0].bait;
						}

						if(! overrideSettings[1].bait){
							pokemon.isCustom = true;
						}

						if(! overrideSettings[0].bait){
							opponent.isCustom = true;
						}

						var shieldTestArr = []; // Array of shield scenarios to test


						if(shieldMode == 'single'){
							shieldTestArr.push([ overrideSettings[0].shields, overrideSettings[1].shields ]);
						} else if(shieldMode == 'average'){
							shieldTestArr.push([0,0], [1,1]);
						}

						var avgPokeRating = 0;
						var avgOpRating = 0;
						var shieldRatings = [];

						for(var j = 0; j < shieldTestArr.length; j++){
							pokemon.setShields(shieldTestArr[j][1]);

							if((shieldMode == 'average')||(context == 'matrix')){
								opponent.setShields(shieldTestArr[j][0]);
							}

							battle.simulate();

							var healthRating = (pokemon.hp / pokemon.stats.hp);
							var damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));

							var opHealthRating = (opponent.hp / opponent.stats.hp);
							var opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));

							var rating = Math.floor( (healthRating + damageRating) * 500);
							var opRating = Math.floor( (opHealthRating + opDamageRating) * 500);

							if(isNaN(avgPokeRating)){
								console.log(battle.getPokemon());
								return false;
							}

							avgPokeRating += rating;
							avgOpRating += opRating;

							shieldRatings.push(rating);
						}

						if(shieldTestArr.length > 1){
							avgPokeRating = Math.round( Math.pow(shieldRatings[0] * Math.pow(shieldRatings[1], 3), 1/4));
						}

						avgOpRating = Math.floor(avgOpRating / shieldTestArr.length);

						csv += ',' + avgOpRating + ',' + opponent.energy + ',' + opponent.hp;

						avg += avgPokeRating;
						opponentRating = avgOpRating;

						var score = 500;

						if(avgPokeRating > 500){
							score = 500 + Math.pow(avgPokeRating - 500, .75);
						} else{
							score = avgPokeRating / 2;
						}

						if((pokemon.overall)&&(pokemon.scores[5])){
							score *= Math.sqrt(pokemon.overall) * Math.pow(pokemon.scores[5], 1/4);
						} else{
							score *= 10 * Math.pow(100, 1/4);
						}

						matchupScore += score;

						if(settings.matrixDirection == "column"){
							avgPokeRating = 1000 - avgPokeRating;
						}

						teamRatings[n].push(avgOpRating);
						rankObj.matchups.push({
							opponent: opponent,
							rating: avgPokeRating,
							score: score
							});
					}

					avg = Math.floor(avg / team.length);
					matchupScore = matchupScore / team.length;

					rankObj.rating = avg;
					rankObj.opRating = opponentRating;
					rankObj.score = matchupScore;
					rankObj.overall = (pokemon.overall !== undefined) ? pokemon.overall : 0;
					rankObj.speciesName = pokemon.speciesName;

					rankings.push(rankObj);
				}

				// Sort rankings

				if((self.context == "team-builder")||(self.context == "team-counters")){
					rankings.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));
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

			this.setShields = function(value, index){
				shieldOverrides[index] = value;
			}

			// Override charged move count with the provided value

			this.setChargedMoveCount = function(value){
				chargedMoveCountOverride = value;
			}

			// Override whether or not to bait shields

			this.setShieldBaitOverride = function(value, index){
				shieldBaitOverrides[index] = value;
			}

			// Set the targets to rank against

			this.setTargets = function(arr){
				targets = arr;
			}

			// Set how to handle multiple shield scenarios

			this.setShieldMode = function(value){
				shieldMode = value;
			}

			// Apply settings from a MultiSelector

			this.applySettings = function(settings, index){
				overrideSettings[index] = settings;
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
