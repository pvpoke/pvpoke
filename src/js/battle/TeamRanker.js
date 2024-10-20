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

			var shieldMode = 'single'; // single - sim specific shield scenarios, average - sim average of 0 and 1 shields each
			var chargedMoveCountOverride = 2;
			var shieldBaitOverrides = [true, true];
			var overrideSettings = [getDefaultMultiBattleSettings(), getDefaultMultiBattleSettings()];

			var useRecommendedMoves = true;

			var csv = '';

			this.context = "team-builder";

			// Run an individual rank set

			this.rank = function(team, cp, cup, exclusionList, context){
				if(context){
					self.context = context;
				}

				var totalBattles = 0;

				battle = new Battle();

				if(isNaN(cp)){
					var levelCap = parseInt(cp.split("-")[1]);
					cp = parseInt(cp.split("-")[0]);
					battle.setLevelCap(levelCap);
				}

				battle.setCP(cp);

				if(cup.name != "custom"){
					battle.setCup(cup.name);
				} else{
					battle.setCustomCup(cup);
				}

				var pokemonList = [];
				var teamRatings = [];

				for(var i = 0; i < team.length; i++){
					teamRatings.push([]);
				}

				rankings = [];

				if(team.length == 1){
					csv = 'Pokemon,Battle Rating,Energy Remaining,HP Remaining'
				}

				if((targets.length == 0)&&(context != "matrix")){
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
							i--;
						}
					}
				}

				// For all eligible Pokemon, simulate battles and gather rating data

				var rankCount = pokemonList.length;

				for(var i = 0; i < rankCount; i++){

					var pokemon = pokemonList[i];

					if((targets.length == 0)&&(useRecommendedMoves)){
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

					/*if((overrideSettings[1].ivs != "gamemaster")&&(overrideSettings[1].ivs != "original")){
						pokemon.levelCap = overrideSettings[1].levelCap;
						pokemon.maximizeStat(overrideSettings[1].ivs);
					} else if((overrideSettings[1].ivs == "gamemaster")&&(pokemon.isCustom)){
						pokemon.isCustom = false;
						pokemon.initialize(battle.getCP());
						if(pokemon.baitShields != 1){
							pokemon.isCustom = true;
						}
					}*/

					rankObj.moveset = moveset;

					var avg = 0;
					var matchupScore = 0; // A softer representation of wins/losses used for team builder threats and alternatives
					var matchupAltScore = 0;
					var opponentRating = 0;

					// Simulate battle against each Pokemon

					for(var n = 0; n < team.length; n++){

						var opponent = team[n];

						opponent.index = 1;

						totalBattles++;

						battle.setNewPokemon(pokemon, 0, false);
						battle.setNewPokemon(opponent, 1, false);


						// Force best moves on counters but not on the user's selected Pokemon

						if((context != "team-counters")&&(context != "matrix")&&(team.length > 1)&&(useRecommendedMoves)){
							opponent.selectRecommendedMoveset();
						}

						self.applySettingsToPokemon(overrideSettings[1], pokemon);

						if(context == "matrix" || context == "team-counters"){
							self.applySettingsToPokemon(overrideSettings[0], opponent);
						}

						if(overrideSettings[1].bait != 1){
							pokemon.isCustom = true;
						}

						if(overrideSettings[0].bait != 1){
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

							if((shieldMode == 'average')||(shieldMode == 'single')||(context == 'matrix')){
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
						var alternativeScore = 500;

						if(avgPokeRating > 500){
							alternativeScore = 500 + Math.pow(avgPokeRating - 500, .75);
							alternativeScore = avgPokeRating;
							score = avgPokeRating;
						} else{
							score = avgPokeRating / 2;
							alternativeScore = avgPokeRating / 2;
						}

						//score = avgPokeRating;

						if((pokemon.overall)&&(pokemon.scores[5])){
							var adjustment = ((pokemon.overall * 400) + (pokemon.scores[5] * 20)) / 42;
							alternativeScore = ((adjustment * 2) + (alternativeScore * 1)) / 3;

							if(score > 500){
								score = ((adjustment * 5) + (score)) / 6;
								//alternativeScore = ((adjustment * 4) + (alternativeScore * 1)) / 5;
							} else{
								//score = ((adjustment * 2) + (score)) / 3;
								score = score * (adjustment / 1000);
								//alternativeScore = ((adjustment * 1) + (alternativeScore * 4)) / 5;
							}

							//score *= 34 * ( (Math.pow(pokemon.overall, 2) * Math.pow(pokemon.scores[5], 1/4)) / (Math.pow(100, 2) * Math.pow(100, 1/4)));
						} else{
							//score *= 10 * Math.pow(100, 1/4);
						}

						matchupScore += score;
						matchupAltScore += alternativeScore;

						if(settings.matrixDirection == "column"){
							avgPokeRating = 1000 - avgPokeRating;
						}

						teamRatings[n].push(avgOpRating);


						var matchup = {
							opponent: opponent,
							rating: avgPokeRating,
							score: score,
							alternativeScore: score,
							time: battle.getDuration()
						};

						// Calculate breakpoint and bulkpoint
						if(context == "matrix"){
							pokemon.reset();
							opponent.reset();

							var breakpoint = battle.calculateDamageByStats(pokemon, opponent, pokemon.getEffectiveStat(0), opponent.getEffectiveStat(1), opponent.typeEffectiveness[pokemon.fastMove.type], pokemon.fastMove);

							var bulkpoint = battle.calculateDamageByStats(opponent, pokemon, opponent.getEffectiveStat(0), pokemon.getEffectiveStat(1), pokemon.typeEffectiveness[opponent.fastMove.type], opponent.fastMove);

							matchup.breakpoint = breakpoint; // Fast move breakpoint
							matchup.bulkpoint = bulkpoint; // Fast move bulkpoint
							matchup.breakpointCM1 = 0;
							matchup.breakpointCM2 = 0;
							matchup.bulkpointCM1 = 0;
							matchup.bulkpointCM2 = 0;

							if(pokemon.chargedMoves.length > 0){
								var breakpointCM1 = battle.calculateDamageByStats(pokemon, opponent, pokemon.getEffectiveStat(0), opponent.getEffectiveStat(1), opponent.typeEffectiveness[pokemon.chargedMoves[0].type], pokemon.chargedMoves[0]);
								matchup.breakpointCM1 = breakpointCM1;
							}

							if(pokemon.chargedMoves.length > 1){
								var breakpointCM2 = battle.calculateDamageByStats(pokemon, opponent, pokemon.getEffectiveStat(0), opponent.getEffectiveStat(1), opponent.typeEffectiveness[pokemon.chargedMoves[1].type], pokemon.chargedMoves[1]);
								matchup.breakpointCM2 = breakpointCM2;
							}

							if(opponent.chargedMoves.length > 0){
								var bulkpointCM1 = battle.calculateDamageByStats(opponent, pokemon, opponent.getEffectiveStat(0), pokemon.getEffectiveStat(1), pokemon.typeEffectiveness[opponent.chargedMoves[0].type], opponent.chargedMoves[0]);
								matchup.bulkpointCM1 = bulkpointCM1;
							}

							if(opponent.chargedMoves.length > 1){
								var bulkpointCM2 = battle.calculateDamageByStats(opponent, pokemon, opponent.getEffectiveStat(0), pokemon.getEffectiveStat(1), pokemon.typeEffectiveness[opponent.chargedMoves[1].type], opponent.chargedMoves[1]);
								matchup.bulkpointCM2 = bulkpointCM2;
							}


							matchup.atkDifferential = pokemon.stats.atk - opponent.stats.atk;
						}

						pokemon.reset();
						opponent.reset();

						rankObj.matchups.push(matchup);
					}

					avg = Math.floor(avg / team.length);
					matchupScore = matchupScore / team.length;
					matchupAltScore = matchupAltScore / team.length;

					rankObj.rating = avg;
					rankObj.opRating = opponentRating;
					rankObj.score = matchupScore;
					rankObj.matchupAltScore = matchupAltScore;
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

			// Override charged move count with the provided value

			this.setChargedMoveCount = function(value){
				chargedMoveCountOverride = value;
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

			this.applySettingsToPokemon = function(settings, pokemon){
				var defaultSettings = getDefaultMultiBattleSettings();

				var fastMoveCount = Math.floor((settings.startEnergy * 500) / pokemon.fastMove.cooldown);

				pokemon.baitShields = settings.bait;
				pokemon.startHp = Math.floor(settings.startHp * pokemon.stats.hp);
				pokemon.startEnergy = Math.min(pokemon.fastMove.energyGain * fastMoveCount, 100);
				pokemon.startCooldown = settings.startCooldown;
				pokemon.optimizeMoveTiming = settings.optimizeMoveTiming;
				pokemon.startStatBuffs = settings.startStatBuffs;

				if(settings.bait != defaultSettings.bait || settings.startCooldown != defaultSettings.startCooldown ||
					settings.optimizeMoveTiming != defaultSettings.optimizeMoveTiming || settings.startStatBuffs != defaultSettings.startStatBuffs){
					pokemon.isCustom = true;
				}
			}

			// Set whether to use recommended movesets for threats

			this.setRecommendMoveUsage = function(val){
				useRecommendedMoves = val;
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
