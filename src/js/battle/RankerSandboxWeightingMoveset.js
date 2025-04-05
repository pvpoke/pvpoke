// JavaScript Document

/*
* This is the primary Ranker object that produces JSON ranking results for every league and category
* Recommend copying to a test or sandbox file to test new algorithms
*/

var RankerMaster = (function () {
    var instance;

    function createInstance() {

        var object = new rankerObject();

		function rankerObject(){
			var gm = GameMaster.getInstance();
			var battle = new Battle();
			var rankingCombinations = [];

			var moveSelectMode = "force";
			var rankingData;
			var allResults = []; // Array of all ranking results

			var leagues = [1500];


			// Ranking scenarios, energy is turns of advantage
			var scenarios;

			var currentLeagueIndex = 0;
			var currentScenarioIndex = 0;

			var startTime = 0; // For debugging and performance testing

			var pokemonList = [];
			var targets = [];

			var self = this;

			var overrides = []; // Moveset override data

			// Load existing rankings to get best movesets

			this.displayRankingData = function(data, callback){
				rankingData = data;

				self.initPokemonList(battle.getCP());

				currentScenarioIndex = 0;

				if(! scenarios){
					scenarios = GameMaster.getInstance().data.rankingScenarios;
				}

				for(currentScenarioIndex = 0; currentScenarioIndex < scenarios.length; currentScenarioIndex++){
					var r = self.rank(leagues[currentLeagueIndex], scenarios[currentScenarioIndex]);

					if(! callback){
						delete r;
					} else{
						allResults.push(r);
					}
				}

				callback(allResults);
			}

			this.initPokemonList = function(cp){
				startTime = Date.now();

				pokemonList = [];
				var cup = battle.getCup();

				// Gather all eligible Pokemon
				battle.setCP(cp);

				if(moveSelectMode == "auto"){
					pokemonList = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude);
					targets = pokemonList;
				} else if(moveSelectMode == "force"){
					pokemonList = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude, rankingData, overrides);

					// Filter targets from pokemonList
					targets = [];

					for(var i = 0; i < pokemonList.length; i++){
						if(cup.filterTargets){
							if(pokemonList[i].weightModifier > 1){
								targets.push(pokemonList[i]);
							}
						} else{
							targets.push(pokemonList[i]);
						}
					}
				}

				// For custom rankings, exclude Pokemon with a low league overall score
				if(cup.excludeLowPokemon && gm.rankings["alloverall"+cp]){
					console.log(pokemonList.length);
					var lowPokemon = gm.rankings["alloverall"+cp].filter(ranking => ranking.score < 70);

					for(var i = 0; i < lowPokemon.length; i++){
						if((pokemonList.findIndex(r => r.speciesId == lowPokemon[i].speciesId) > -1)){
							pokemonList.splice(pokemonList.findIndex(r => r.speciesId == lowPokemon[i].speciesId), 1);
						}
						if((targets.findIndex(r => r.speciesId == lowPokemon[i].speciesId) > -1)){
							targets.splice(targets.findIndex(r => r.speciesId == lowPokemon[i].speciesId), 1);
						}
					}
					console.log(pokemonList.length);
				}

				console.log("List generated in: " + (Date.now() - startTime) + "ms");

			}

			// Run all ranking sets at once

			this.rankLoop = function(cp, cup, callback, data){

				startTime = Date.now();

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

				if(cup.levelCap){
					battle.setLevelCap(cup.levelCap);
				}

				currentLeagueIndex = 0;
				currentScenarioIndex = 0;

				leagues = [cp];
				allResults = [];

				if(! scenarios){
					scenarios = GameMaster.getInstance().data.rankingScenarios;
				}

				for(var currentLeagueIndex = 0; currentLeagueIndex < leagues.length; currentLeagueIndex++){

					if(moveSelectMode == "auto"){

						self.initPokemonList(cp);

						// Only do 1 scenario for move generation
						scenarios = scenarios.splice(0, 1);

						for(currentScenarioIndex = 0; currentScenarioIndex < scenarios.length; currentScenarioIndex++){
							rankingCombinations.push({league: leagues[currentLeagueIndex], scenario: scenarios[currentScenarioIndex]});
						}

					} else if(moveSelectMode == "force"){
						// Load existing ranking data first

						if(! data){
							gm.loadRankingData(self, "overall", leagues[currentLeagueIndex], cup.name);
						} else{
							self.displayRankingData(data, callback);
						}

					}
				}

				var currentRankings = rankingCombinations.length;

				var rankingInterval = setInterval(function(){
					if((rankingCombinations.length == currentRankings)&&(rankingCombinations.length > 0)){
						currentRankings--;

						startTime = Date.now();

						var r = self.rank(rankingCombinations[0].league, rankingCombinations[0].scenario);
						allResults.push(r);

						console.log("Total time: " + (Date.now() - startTime));

						rankingCombinations.splice(0, 1);

						if(rankingCombinations.length == 0){
							callback(allResults);
						}
					}
				}, 1000);
			}

			// Run an individual rank set

			this.rank = function(league, scenario){
				var cup = battle.getCup();
				var totalBattles = 0;
				var shieldCounts = scenario.shields;

				var rankings = [];

				// For all eligible Pokemon, simulate battles and gather rating data

				var rankCount = pokemonList.length;

				for(var i = 0; i < rankCount; i++){

					var pokemon = pokemonList[i];

					// Start with a blank rank object

					var rankObj = {
						speciesId: pokemon.speciesId,
						speciesName: pokemon.speciesName,
						rating: 0,
						matches: [], // Contains results of every individual battle
						matchups: [], // After simulation, this will hold the "Key Matchups"
						counters: [], // After simulation, this will hold the "Top Counters"
						moves: [] // After simulation, this will contain usage stats for fast and charged moves
					};

					var avg = 0;

					// Simulate battle against each Pokemon

					for(var n = 0; n < targets.length; n++){

						var opponent = targets[n];

						// If battle has already been simulated, skip

						if(rankings[n] && pokemonList.length == targets.length){

							// When shields are the same, A vs B is the same as B vs A, so take the existing result

							if((rankings[n].matches[i])&&(shieldCounts[0]==shieldCounts[1])&&(scenario.energy[0] == scenario.energy[1])){

								rankObj.matches.push({
									opponent: opponent.speciesId,
									rating: rankings[n].matches[i].opRating,
									adjRating: rankings[n].matches[i].adjOpRating,
									opRating: rankings[n].matches[i].rating,
									adjOpRating: rankings[n].matches[i].adjRating,
									moveUsage: rankings[n].matches[i].oppMoveUsage,
									oppMoveUsage: rankings[n].matches[i].moveUsage
								})

								avg += rankings[n].matches[i].adjOpRating;

								continue;
							}
						}

						totalBattles++;

						// Set both Pokemon and auto select their moves

						battle.setNewPokemon(pokemon, 0, false);
						battle.setNewPokemon(opponent, 1, false);

						pokemon.reset();
						opponent.reset();

						// Initialize values
						var healthRating = 500;
						var damageRating = 500;

						var opHealthRating = 500;
						var opDamageRating = 500;

						var rating = 500;
						var opRating = 500;

						var turnsToWin = 1;
						var turnRatio = 1;
						var opTurnRatio = 1;

						var winMultiplier = 1;
						var opWinMultiplier = 1;
						var adjRating = 500;
						var adjOpRating = 500;

						if(moveSelectMode == "auto"){

							//pokemon.autoSelectMoves();
							//opponent.autoSelectMoves();

						} else if(moveSelectMode == "force"){
							pokemon.setShields(shieldCounts[0]);
							opponent.setShields(shieldCounts[1]);

							// Set energy advantage
							if(scenario.energy[0] == 0){
								pokemon.startEnergy = 0;
							} else{
								var fastMoveCount = (Math.floor((scenario.energy[0] * 500) / pokemon.fastMove.cooldown));
								if(fastMoveCount == 0){
									fastMoveCount = 1;
								}

								pokemon.startEnergy = Math.min(pokemon.fastMove.energyGain * fastMoveCount, 100);
							}

							if(scenario.energy[1] == 0){
								opponent.startEnergy = 0;
							} else{
								var fastMoveCount = (Math.floor((scenario.energy[0] * 500) / pokemon.fastMove.cooldown));
								if(fastMoveCount == 0){
									fastMoveCount = 1;
								}

								opponent.startEnergy = Math.min(opponent.fastMove.energyGain * fastMoveCount, 100);
							}

							battle.simulate();

							// Calculate Battle Rating for each Pokemon

							healthRating = (pokemon.hp / pokemon.stats.hp);
							damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));

							opHealthRating = (opponent.hp / opponent.stats.hp);
							opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));

							rating = Math.floor( (healthRating + damageRating) * 500);
							opRating = Math.floor( (opHealthRating + opDamageRating) * 500);

							turnsToWin = battle.getTurnsToWin();
							turnRatio = turnsToWin[0] / turnsToWin[1];
							opTurnRatio = turnsToWin[1] / turnsToWin[0];

							// Modify ratings by shields burned and shields remaining

							winMultiplier = 1;
							opWinMultiplier = 1;

							if(rating > opRating){
								opWinMultiplier = 0;
							} else{
								winMultiplier = 0;
							}

							if(rating == 500){
								winMultiplier = 0;
								opWinMultiplier = 0;
							}

							adjRating = rating + ( (100 * (opponent.startingShields - opponent.shields) * winMultiplier) + (100 * pokemon.shields * winMultiplier));
							adjOpRating = opRating + ( (100 * (pokemon.startingShields - pokemon.shields) * opWinMultiplier) + (100 * opponent.shields * opWinMultiplier));
						}

						// Push final results into the rank object's matches array

						rankObj.matches.push({
							opponent: opponent.speciesId,
							rating: rating,
							adjRating: adjRating,
							opRating: opRating,
							adjOpRating: adjOpRating,
							moveUsage: pokemon.generateMoveUsage(opponent, opponent.weightModifier),
							oppMoveUsage: opponent.generateMoveUsage(pokemon, pokemon.weightModifier)
						});

						avg += adjRating;
					}

					avg = Math.floor(avg / rankCount);

					rankObj.rating = avg;
					rankObj.scores = [avg];

					// Push all moves into moveset

					var fastMoves = [];
					var chargedMoves = [];

					for(var j = 0; j < pokemon.fastMovePool.length; j++){
						fastMoves.push({moveId: pokemon.fastMovePool[j].moveId, uses: 0});
					}

					for(var j = 0; j < pokemon.chargedMovePool.length; j++){
						chargedMoves.push({moveId: pokemon.chargedMovePool[j].moveId, uses: 0});
					}

					// Assign special rating to movesets and determine best overall moveset

					for(var j = 0; j < rankObj.matches.length; j++){
						var moveUsage = rankObj.matches[j].moveUsage;

						for(var k = 0; k < fastMoves.length; k++){
							for(var l = 0; l < moveUsage.fastMoves.length; l++){
								if(fastMoves[k].moveId == moveUsage.fastMoves[l].moveId){
									fastMoves[k].uses += moveUsage.fastMoves[l].uses;
								}
							}
						}

						for(var k = 0; k < chargedMoves.length; k++){
							for(var l = 0; l < moveUsage.chargedMoves.length; l++){
								if(chargedMoves[k].moveId == moveUsage.chargedMoves[l].moveId){
									chargedMoves[k].uses += moveUsage.chargedMoves[l].uses;
								}
							}
						}
					}

					// Sort move arrays and add them to the rank object

					fastMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
					chargedMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

					rankObj.moves = {fastMoves: fastMoves, chargedMoves: chargedMoves};

					rankings.push(rankObj);
				}

				console.log("total battles " + totalBattles);

				// Weigh all Pokemon matchups by their opponent's average rating

				var iterations = 10;

				// Doesn't make sense to weight which attackers can beat which other attackers, so don't weight those

				if((scenario.energy[0] != scenario.energy[1])||(scenario.shields[0] != scenario.shields[1])){
					iterations = 1;
				}

				// Iterate through the rankings and weigh each matchup Battle Rating by the average rating of the opponent

				var rankCutoffIncrease = 0.06;
				var rankWeightExponent = 1.65;

				if((cup.name == "all")&&(battle.getCP() == 10000)){
					iterations = 1;
				}

				if((cup.name == "classic")&&(battle.getCP() == 10000)){
					iterations = 1;
				}

				if((cup.name == "factionsmaster")&&(battle.getCP() == 10000)){
					iterations = 1;
				}

				if((cup.name == "mega")&&(battle.getCP() == 10000)){
					iterations = 1;
				}

				if((cup.name == "all")&&(battle.getCP() == 2500)){
					iterations = 1;
				}

				if((cup.name == "all")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "championship")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "retro")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "adl")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if(cup.name == "lunar"){
					iterations = 1;
				}

				if(cup.name == "psychic"){
					iterations = 1;
				}

				if(cup.name == "fossil"){
					iterations = 1;
				}

				if(cup.name == "colony"){
					iterations = 1;
				}

				if(cup.name == "sunshine"){
					iterations = 1;
				}

				if(cup.name == "element"){
					iterations = 1;
				}

				if(cup.name == "elementremix"){
					iterations = 1;
				}

				if(cup.name == "single"){
					iterations = 1;
				}

				if(cup.name == "halloween"){
					iterations = 1;
				}

				if((cup.name == "goteamup")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "premier")&&(battle.getCP() == 10000)){
					iterations = 1;
				}

				if((cup.name == "premier")&&(battle.getCP() == 2500)){
					iterations = 1;
				}

				if(cup.name == "premierclassic"){
					iterations = 1;
				}

				if(cup.name == "spring"){
					iterations = 1;
				}

				if(cup.name == "factions"){
					iterations = 1;
				}

				if(cup.name == "flying"){
					iterations = 1;
				}

				if(cup.name == "littlecatch"){
					iterations = 1;
				}

				if(cup.name == "catch"){
					iterations = 1;
				}

				if(cup.name == "hisui"){
					iterations = 1;
				}

				if((cup.name == "remix")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "halloween")&&(battle.getCP() == 2500)){
					iterations = 1;
				}

				if(cup.name == "holiday"){
					iterations = 1;
				}

				if(cup.name == "kanto"){
					iterations = 1;
				}

				if(cup.name == "summer"){
					iterations = 1;
				}

				if(cup.name == "little"){
					iterations = 1;
				}

				if(cup.name == "littleremix"){
					iterations = 1;
				}

				if((cup.name == "little")&&(battle.getCP() == 500)){
					iterations = 1;
				}

				if(cup.name == "firefly"){
					iterations = 1;
				}

				if(cup.name == "architect"){
					iterations = 1;
				}

				if(cup.name == "mountain"){
					iterations = 1;
				}

				if(cup.name == "fantasy" && battle.getCP() == 1500){
					iterations = 1;
				}

				if(cup.name == "custom"){
					iterations = 7;
				}

				// Do fewer or no iterations for a very small pool
				if(rankings.length < 30){
					iterations = 1;
				}

				for(var n = 0; n < iterations; n++){

					var bestScore = Math.max.apply(Math, rankings.map(function(o) { return o.scores[n]; }))

					for(var i = 0; i < rankCount; i++){
						var score = 0;

						var matches = rankings[i].matches;
						var weights = 0;

						for(var j = 0; j < matches.length; j++){

							var weight = 1;

							if(pokemonList.length == targets.length){
								weight = Math.pow( Math.max((rankings[j].scores[n] / bestScore) - (.1 + (rankCutoffIncrease * n)), 0), rankWeightExponent);
							}

							if(cup.name == "premier"){
								weight = 1;
							}

							if(cup.name == "love"){
								weight = 1;
							}

							// Don't score Pokemon in the mirror match

							if(targets[j].speciesId == pokemonList[i].speciesId){
								weight = 0;
							}

							// Don't score XS Pokemon

							if(targets[j].hasTag("xs")){
								weight = 0;
							}

							if (typeof targets[j].weightModifier !== 'undefined') {
								weight *= targets[j].weightModifier;
							} else{
								if((cup.name == "all")&&(battle.getCP() == 1500)){
									weight = 0;
								}

								if((cup.name == "championship")&&(battle.getCP() == 1500)){
									weight = 0;
								}
							}

							// For switches, punish hard losses more. The goal is to identify safe switches

							if((scenario.slug == "switches")&&(matches[j].adjRating < 500)){
								weight *= (1 + (Math.pow(500 - matches[j].adjRating, 2)/20000));
							}

							var sc = matches[j].adjRating * weight;
							var opScore = matches[j].adjOpRating * Math.pow(4, weight);

							if(rankings[j].scores[n] / bestScore < .1 + (rankCutoffIncrease * n)){
								weight = 0;
							}

							if(weight >= 2){
								//opScore = opScore * Math.pow(2, weight)
							} else{
								//opScore = 0;
							}

							weights += weight;
							matches[j].score = sc;
							matches[j].opScore = opScore;
							score += sc;
						}

						var avgScore = Math.floor(score / weights);

						rankings[i].scores.push(avgScore);
					}
				}

				// Determine final score and sort matches

				for(var i = 0; i < rankCount; i++){

					var pokemon = pokemonList[i];

					// If data is available, take existing move use data

					/*if((moveSelectMode == "force")&&(rankingData)){

						// Find Pokemon in existing rankings

						for(var k = 0; k < rankingData.length; k++){
							if(pokemon.speciesId == rankingData[k].speciesId){
								rankings[i].moves = rankingData[k].moves;
							}
						}
					}*/

					rankings[i].moveset = [pokemon.fastMove.moveId, pokemon.chargedMoves[0].moveId];

					if(pokemon.chargedMoves[1]){
						rankings[i].moveset.push(pokemon.chargedMoves[1].moveId);
					}

					if(pokemon.speciesId == "morpeko_full_belly"){
						rankings[i].moveset[1] = "AURA_WHEEL_ELECTRIC";
					}

					rankings[i].score = rankings[i].scores[rankings[i].scores.length-1];

					// For chargers, factor in Fast Move pressure for ability to farm down, and maximum carryover energy after firing a Charged Move

					if(scenario.slug == "chargers"){
						var fastMoveDPT = ((pokemon.fastMove.power * pokemon.fastMove.stab * pokemon.shadowAtkMult) * (pokemon.stats.atk / 100)) / (pokemon.fastMove.cooldown / 500);
						var maximumEnergyRemaining = 100 - Math.min.apply(Math, pokemon.activeChargedMoves.map(function(m) { return m.energy; }))

						rankings[i].score *= Math.pow( Math.pow((maximumEnergyRemaining / 100), 1/2) * Math.pow((fastMoveDPT / 5), 1/6), 1/6);
					}

					delete rankings[i].scores;

					// Set top matchups and counters

					var matches = rankings[i].matches;

					rankings[i].matches.sort((a,b) => (a.opScore > b.opScore) ? -1 : ((b.opScore > a.opScore) ? 1 : 0));

					var matchupCount = Math.min(5, rankings[i].matches.length);
					var keyMatchupsCount = 0;

					// Gather 5 worst matchups for counters

					for(var j = 0; j < rankings[i].matches.length; j++){
						var match = rankings[i].matches[j];

						delete match.moveUsage;
						delete match.oppMoveUsage;
						delete match.score;
						delete match.opScore;
						delete match.adjRating;
						delete match.adjOpRating;
						delete match.opRating;

						if((match.rating < 500)||(cup.name == "bidoof")){
							rankings[i].counters.push(match);
							keyMatchupsCount++;

							if(keyMatchupsCount >= matchupCount){
								break;
							}
						}
					}

					// Sort key counters by battle rating
					rankings[i].counters.sort((a,b) => (a.rating > b.rating) ? 1 : ((b.rating > a.rating) ? -1 : 0));

					// Gather 5 best matchups, weighted by opponent rank

					rankings[i].matches.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));

					keyMatchupsCount = 0;

					for(var j = 0; j < rankings[i].matches.length; j++){
						var match = rankings[i].matches[j];

						delete match.moveUsage;
						delete match.oppMoveUsage;
						delete match.score;
						delete match.opScore;
						delete match.adjRating;
						delete match.adjOpRating;
						delete match.OpRating;

						if((match.rating > 500)||(cup.name == "bidoof")){
							rankings[i].matchups.push(match);
							keyMatchupsCount++;

							if(keyMatchupsCount >= matchupCount){
								break;
							}
						}
					}

					// Sort key matchups by battle rating
					rankings[i].matchups.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));

					delete rankings[i].matches;
					//delete rankings[i].movesets;

				}

				// Sort rankings by best to worst

				rankings.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));

				// Scale all scores on scale of 100;

				var highest = rankings[0].score;

				for(var i = 0; i < rankings.length; i++){
					rankings[i].score = Math.floor((rankings[i].score / highest) * 1000) / 10;
				}

				// Write rankings to file
				if(cup.name != "custom"){

					var category = scenario.slug;

					var json = JSON.stringify(rankings);
					var league = battle.getCP();

					console.log("/"+cup.name+"/"+category+"/rankings-"+league+".json");

					$.ajax({

						url : 'data/write.php',
						type : 'POST',
						data : {
							'data' : json,
							'league' : league,
							'category' : category,
							'cup': cup.name
						},
						dataType:'json',
						success : function(data) {
							console.log(data);

							delete rankings;
						},
						error : function(request,error)
						{
							console.log("Request: "+JSON.stringify(request));
							console.log(error);
						}
					});
				}

				return rankings;
			}

			// Set whether to autoselect moves or force a best moveset

			this.setMoveSelectMode = function(value){
				moveSelectMode = value;
			}

			// Return the current move select mode

			this.getMoveSelectMode = function(){
				return moveSelectMode;
			}

			// Set move overrides for a specific cup and league

			this.setMoveOverrides = function(league, cup, values){
				// Iterate through existing overrides and replace if already exists
				var cupFound = false;

				for(var i = 0; i < overrides.length; i++){
					if((overrides[i].league == league)&&(overrides[i].cup == cup)){
						cupFound = true;
						overrides[i].pokemon = values;
					}
				}

				// If a cup wasn't found, add a new one
				if(! cupFound){
					overrides.push({
						league: league,
						cup: cup,
						pokemon: values
					})
				}
			}

			// Set the scenarios to be ranked

			this.setScenarioOverrides = function(arr){
				scenarios = arr;
			}

			// Given a Pokemon, output a string of numbers for URL building

			function generateURLMoveStr(pokemon){
				var moveStr = '';

				var fastMoveIndex = pokemon.fastMovePool.indexOf(pokemon.fastMove);
				var chargedMove1Index = pokemon.chargedMovePool.indexOf(pokemon.chargedMoves[0])+1;
				var chargedMove2Index = pokemon.chargedMovePool.indexOf(pokemon.chargedMoves[1])+1;

				moveStr = fastMoveIndex + "-" + chargedMove1Index + "-" + chargedMove2Index;

				return moveStr;
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
