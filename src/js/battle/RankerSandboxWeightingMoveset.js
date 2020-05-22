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

			var rankings = [];
			var rankingCombinations = [];

			var moveSelectMode = "force";
			var rankingData;
			var allResults = []; // Array of all ranking results

			var leagues = [1500];


			// Ranking scenarios, energy is turns of advantage
			var scenarios = GameMaster.getInstance().data.rankingScenarios;

			var currentLeagueIndex = 0;
			var currentScenarioIndex = 0;

			var startTime = 0; // For debugging and performance testing

			var pokemonList = [];

			var self = this;

			// Load override data

			var file = webRoot+"data/rankingoverrides.json?v="+siteVersion;
			var overrides = [];

			$.getJSON( file, function( data ){

				// Sort alphabetically

				overrides = data;
				console.log("Ranking overrides loaded [" + overrides.length + "]");
			});

			// Load existing rankings to get best movesets

			this.displayRankingData = function(data, callback){
				rankingData = data;

				self.initPokemonList(battle.getCP());

				currentScenarioIndex = 0;

				for(currentScenarioIndex = 0; currentScenarioIndex < scenarios.length; currentScenarioIndex++){
					var r = self.rank(leagues[currentLeagueIndex], scenarios[currentScenarioIndex]);
					allResults.push(r);
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
				} else if(moveSelectMode == "force"){
					pokemonList = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude, rankingData, overrides);
				}

				console.log("List generated in: " + (Date.now() - startTime));

			}

			// Run all ranking sets at once

			this.rankLoop = function(cp, cup, callback, data){

				startTime = Date.now();

				battle.setCP(cp);
				if(cup.name != "custom"){
					battle.setCup(cup.name);
				} else{
					battle.setCustomCup(cup);
				}


				currentLeagueIndex = 0;
				currentScenarioIndex = 0;

				leagues = [cp];
				allResults = [];

				for(var currentLeagueIndex = 0; currentLeagueIndex < leagues.length; currentLeagueIndex++){

					if(moveSelectMode == "auto"){

						self.initPokemonList(cp);

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

				rankings = [];

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

					for(var n = 0; n < rankCount; n++){

						var opponent = pokemonList[n];

						// If battle has already been simulated, skip

						if(rankings[n]){

							// When shields are the same, A vs B is the same as B vs A, so take the existing result

							if((rankings[n].matches[i])&&(shieldCounts[0]==shieldCounts[1])&&(scenario.energy[0] == scenario.energy[1])){

								rankObj.matches.push({
									opponent: opponent.speciesId,
									rating: rankings[n].matches[i].opRating,
									adjRating: rankings[n].matches[i].adjOpRating,
									opRating: rankings[n].matches[i].rating,
									adjOpRating: rankings[n].matches[i].adjRating,
									moveSet: rankings[n].matches[i].oppMoveSet,
									oppMoveSet: rankings[n].matches[i].moveSet
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

						if(moveSelectMode == "auto"){
							pokemon.autoSelectMoves();
							opponent.autoSelectMoves();
						}

						pokemon.setShields(shieldCounts[0]);
						opponent.setShields(shieldCounts[1]);

						// Set energy advantage
						if(scenario.energy[0] == 0){
							pokemon.startEnergy = 0;
						} else{
							pokemon.startEnergy = Math.min(pokemon.fastMove.energyGain * (Math.floor((scenario.energy[0] * 500) / pokemon.fastMove.cooldown)), 100);
						}

						if(scenario.energy[1] == 0){
							opponent.startEnergy = 0;
						} else{
							opponent.startEnergy = Math.min(opponent.fastMove.energyGain * (Math.floor((scenario.energy[1] * 500) / opponent.fastMove.cooldown)), 100);
						}


						battle.simulate();


						// Calculate Battle Rating for each Pokemon

						var healthRating = (pokemon.hp / pokemon.stats.hp);
						var damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));

						var opHealthRating = (opponent.hp / opponent.stats.hp);
						var opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));

						var rating = Math.floor( (healthRating + damageRating) * 500);
						var opRating = Math.floor( (opHealthRating + opDamageRating) * 500);

						var turnsToWin = battle.getTurnsToWin();
						var turnRatio = turnsToWin[0] / turnsToWin[1];
						var opTurnRatio = turnsToWin[1] / turnsToWin[0];

						// Modify ratings by shields burned and shields remaining

						var winMultiplier = 1;
						var opWinMultiplier = 1;

						if(rating > opRating){
							opWinMultiplier = 0;
						} else{
							winMultiplier = 0;
						}

						var adjRating = rating + ( (100 * (opponent.startingShields - opponent.shields) * winMultiplier) + (100 * pokemon.shields * winMultiplier));
						var adjOpRating = opRating + ( (100 * (pokemon.startingShields - pokemon.shields) * opWinMultiplier) + (100 * opponent.shields * opWinMultiplier));

						//adjRating = turnRatio * 1000;
						//adjOpRating = opTurnRatio * 1000;

						// Search the timeline and store whether or not each charged move was used

						var chargedMovesList = [];
						var oppChargedMovesList = [];
						var timeline = battle.getTimeline();

						for(var k = 0; k < pokemon.chargedMoves.length; k++){
							var uses = 0;

							for(var j = 0; j < timeline.length; j++){
								if(timeline[j].name == pokemon.chargedMoves[k].name){
									uses = 1;
								}
							}

							chargedMovesList.push({moveId: pokemon.chargedMoves[k].moveId, uses: uses})
						}

						for(var k = 0; k < opponent.chargedMoves.length; k++){
							uses = 0;

							for(var j = 0; j < timeline.length; j++){
								if(timeline[j].name == opponent.chargedMoves[k].name){
									uses = 1;
								}
							}

							oppChargedMovesList.push({moveId: opponent.chargedMoves[k].moveId, uses: uses})
						}

						// Push final results into the rank object's matches array

						rankObj.matches.push({
							opponent: opponent.speciesId,
							rating: rating,
							adjRating: adjRating,
							opRating: opRating,
							adjOpRating: adjOpRating,
							moveSet: {
								fastMove: pokemon.fastMove.moveId,
								chargedMoves: chargedMovesList
							},
							oppMoveSet: {
								fastMove: opponent.fastMove.moveId,
								chargedMoves: oppChargedMovesList
							}
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
						var moveset = rankObj.matches[j].moveSet;

						for(var k = 0; k < fastMoves.length; k++){
							if(fastMoves[k].moveId == moveset.fastMove){
								fastMoves[k].uses += 1;
							}
						}

						for(var k = 0; k < chargedMoves.length; k++){
							for(var l = 0; l < moveset.chargedMoves.length; l++){
								if(chargedMoves[k].moveId == moveset.chargedMoves[l].moveId){
									chargedMoves[k].uses += moveset.chargedMoves[l].uses;
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

				if(cup.name == "kingdom"){
					rankCutoffIncrease = 0.05;
					rankWeightExponent = 1.5;
				}

				if(cup.name == "tempest"){
					rankWeightExponent = 1.25;
				}

				if(cup.name == "toxic"){
					iterations = 1;
				}

				if(cup.name == "rose"){
					iterations = 1;
				}


				if((cup.name == "all")&&(battle.getCP() == 10000)){
					iterations = 1;
				}

				if((cup.name == "all")&&(battle.getCP() == 2500)){
					iterations = 1;
				}

				if((cup.name == "all")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "voyager")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "grunt-4")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "forest")&&(battle.getCP() == 1500)){
					iterations = 1;
				}

				if((cup.name == "premier")&&(battle.getCP() == 10000)){
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

							var weight = Math.pow( Math.max((rankings[j].scores[n] / bestScore) - (.1 + (rankCutoffIncrease * n)), 0), rankWeightExponent);

							if(cup.name == "sorcerous"){
								weight = 1;
							}

							// Don't score Pokemon in the mirror match

							if(rankings[j].speciesId == pokemonList[i].speciesId){
								weight = 0;
							}

							if(pokemonList[j].weightModifier){
								weight *= pokemonList[j].weightModifier;
							}

							// For switches, punish hard losses more. The goal is to identify safe switches

							if((scenario.slug == "switches")&&(matches[j].adjRating < 500)){
								weight *= (1 + (Math.pow(500 - matches[j].adjRating, 2)/20000));
							}

							var sc = matches[j].adjRating * weight;

							if(rankings[j].scores[n] / bestScore < .1 + (rankCutoffIncrease * n)){
								weight = 0;
							}

							weights += weight;
							matches[j].score = sc;
							score += sc;
						}

						var avgScore = Math.floor(score / weights);

						rankings[i].scores.push(avgScore);
					}
				}

				// Determine final score and sort matches

				for(var i = 0; i < rankCount; i++){

					var pokemon = pokemonList[i];

					// Count up all the moves again but only include those against the top

					var fastMoves = [];
					var chargedMoves = [];

					for(var j = 0; j < pokemon.fastMovePool.length; j++){
						fastMoves.push({moveId: pokemon.fastMovePool[j].moveId, uses: 0});
					}

					for(var j = 0; j < pokemon.chargedMovePool.length; j++){
						chargedMoves.push({moveId: pokemon.chargedMovePool[j].moveId, uses: 0});
					}

					// Assign special rating to movesets and determine best overall moveset

					for(var j = 0; j < rankings[i].matches.length; j++){
						if(rankings[i].matches[j].score > 0){
							var moveset = rankings[i].matches[j].moveSet;

							for(var k = 0; k < fastMoves.length; k++){
								if(fastMoves[k].moveId == moveset.fastMove){
									fastMoves[k].uses += 1;
								}
							}

							for(var k = 0; k < chargedMoves.length; k++){
								for(var l = 0; l < moveset.chargedMoves.length; l++){
									if(chargedMoves[k].moveId == moveset.chargedMoves[l].moveId){
										chargedMoves[k].uses += moveset.chargedMoves[l].uses;
									}
								}
							}
						}
					}

					// If data is available, take existing move use data

					if((moveSelectMode == "force")&&(rankingData)){

						// Find Pokemon in existing rankings

						for(var k = 0; k < rankingData.length; k++){
							if(pokemon.speciesId == rankingData[k].speciesId){
								rankings[i].moves = rankingData[k].moves;
							}
						}
					} else{

						// Sort move arrays and add them to the rank object

						fastMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
						chargedMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

						rankings[i].moves = {fastMoves: fastMoves, chargedMoves: chargedMoves};
					}

					rankings[i].moveStr = generateURLMoveStr(pokemon);

					rankings[i].score = rankings[i].scores[rankings[i].scores.length-1];

					delete rankings[i].scores;

					// Set top matchups and counters

					var matches = rankings[i].matches;

					rankings[i].matches.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));

					var matchupCount = Math.min(5, rankings[i].matches.length);

					// Gather 5 worst matchups for counters

					for(var j = rankObj.matches.length - 1; j > rankings[i].matches.length - matchupCount - 1; j--){
						var match = rankings[i].matches[j];

						delete match.moveSet;
						delete match.oppMoveSet;
						delete match.score;
						delete match.adjRating;
						delete match.adjOpRating;

						rankings[i].counters.push(rankings[i].matches[j]);
					}

					// Gather 5 best matchups, weighted by opponent rank

					rankings[i].matches.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));

					var keyMatchupsCount = 0;

					for(var j = 0; j < rankings[i].matches.length; j++){
						var match = rankings[i].matches[j];

						delete match.moveSet;
						delete match.oppMoveSet;
						delete match.score;
						delete match.adjRating;
						delete match.adjOpRating;

						if(match.rating > 500){
							rankings[i].matchups.push(match);
							keyMatchupsCount++;

							if(keyMatchupsCount >= matchupCount){
								break;
							}
						}
					}

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

					console.log(json);
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
