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
			
			var self = this;
			
			// Run all ranking sets at once
			
			this.rankLoop = function(cup){
				if(cup.name != "custom"){
					battle.setCup(cup.name);
				} else{
					battle.setCustomCup(cup);
				}
				
				var leagues = [1500, 2500, 10000];
				var shields = [ [0,0], [2,2], [0,2], [2,0]];

				for(var i = 0; i < leagues.length; i++){
					for(var n = 0; n < shields.length; n++){
						rankingCombinations.push({league: leagues[i], shields: shields[n]});

					}
				}
				
				var currentRankings = rankingCombinations.length;
				
				var rankingInterval = setInterval(function(){
					if((rankingCombinations.length == currentRankings)&&(rankingCombinations.length > 0)){
						currentRankings--;
						
						self.rank(rankingCombinations[0].league, rankingCombinations[0].shields);
						
						rankingCombinations.splice(0, 1);
					}
				}, 1000);
				
			}		
			
			// Run an individual rank set
			
			this.rank = function(league, shields){
				
				var totalBattles = 0;
				
				var pokemonList = [];
				
				var shieldCounts = shields;
				
				var cup = battle.getCup();
				
				rankings = [];
				
				// Gather all eligible Pokemon
				battle.setCP(league);
				
				var minStats = 3000; // You must be this tall to ride this ride
				
				if(battle.getCP() == 1500){
					minStats = 1250;
				} else if(battle.getCP() == 2500){
					minStats = 2500;
				}
				
				// Don't allow these Pokemon into the Great League. They can't be trusted.
				
				var bannedList = ["mewtwo","giratina_altered","groudon","kyogre","rayquaza","garchomp","latios","latias","palkia","dialga","heatran","giratina_origin","darkrai"];
				var permaBannedList = ["burmy_trash","burmy_sandy","burmy_plant","wormadam_plant","wormadam_sandy","wormadam_trash","mothim","cherubi","cherrim_overcast","cherrim_sunny","shellos_east_sea","shellos_west_sea","gastrodon_east_sea","gastrodon_west_sea","hippopotas","hippowdon","leafeon","glaceon","rotom","rotom_fan","rotom_frost","rotom_heat","rotom_mow","rotom_wash","uxie","azelf","mesprit","regigigas","giratina_origin","phione","manaphy","darkrai","shaymin_land","shaymin_sky","arceus","arceus_bug","arceus_dark","arceus_dragon","arceus_electric","arceus_fairy","arceus_fighting","arceus_fire","arceus_flying","arceus_ghost","arceus_grass","arceus_ground","arceus_ice","arceus_poison","arceus_psychic","arceus_rock","arceus_steel","arceus_water","jirachi"]; // Don't rank these Pokemon at all yet
				
				// If you want to rank specfic Pokemon, you can enter their species id's here
				
				var allowedList = [];
				
				for(var i = 0; i < gm.data.pokemon.length; i++){
					
					if(gm.data.pokemon[i].fastMoves.length > 0){ // Only add Pokemon that have move data
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
							
							if((rankings[n].matches[i])&&(shieldCounts[0]==shieldCounts[1])){
								
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
						
						battle.setNewPokemon(pokemon, 0);
						battle.setNewPokemon(opponent, 1);
						
						pokemon.autoSelectMoves();
						opponent.autoSelectMoves();
						
						pokemon.setShields(shieldCounts[0]);
						opponent.setShields(shieldCounts[1]);
						
						battle.simulate();
						
						// Calculate Battle Rating for each Pokemon
						
						var healthRating = (pokemon.hp / pokemon.stats.hp);
						var damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));
						
						var opHealthRating = (opponent.hp / opponent.stats.hp);
						var opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));
						
						var rating = Math.floor( (healthRating + damageRating) * 500);
						var opRating = Math.floor( (opHealthRating + opDamageRating) * 500);
						
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
					
					rankObj.moves = {fastMoves: fastMoves, chargedMoves: chargedMoves}
					
					rankings.push(rankObj);
				}
				
				console.log("total battles " + totalBattles);
				
				// Weigh all Pokemon matchups by their opponent's average rating
				
				var iterations = 1;
				
				// Doesn't make sense to weight which attackers can beat which other attackers, so don't weight those
				
				if(shieldCounts[0] != shieldCounts[1]){
					iterations = 0;
				}
				
				for(var i = 0; i < rankCount; i++){
					var rating = rankings[i].rating;
					
					// Factor overall score by moveset consistency, this keeps things like Mew and Togetic from being artificially high

					var fastMovePercentage = rankings[i].moves.fastMoves[0].uses / rankings.length;

					if(fastMovePercentage < .5){
						rating *= Math.pow(fastMovePercentage, .125);
					}
					
					rankings[i].scores = [rating];
				}
				
				// Iterate through the rankings and weigh each matchup Battle Rating by the average rating of the opponent
				
				for(var n = 0; n < iterations; n++){
					for(var i = 0; i < rankCount; i++){
						var score = 0;
						
						var matches = rankings[i].matches;
						var weights = 0;
						
						for(var j = 0; j < matches.length; j++){
							
							var sc = matches[j].adjRating * rankings[j].scores[n];
							
							weights += rankings[j].scores[n];
							
							/* Factor overall score by moveset consistency again, if this doesn't happen
							* Pokemon with Hidden Power will filter to the top because they technically beat
							* a lot of top opponents */

							var fastMovePercentage = rankings[i].moves.fastMoves[0].uses / rankings.length;

							if(fastMovePercentage < .5){
								sc *= Math.pow(fastMovePercentage, .125);
							}
							
							matches[j].score = sc;

							score += sc;
						}
						
						var avgScore = Math.floor(score / weights);

						rankings[i].scores.push(avgScore);
					}
				}
				
				// Determine final score and sort matches
				
				for(var i = 0; i < rankCount; i++){
					
					// rankings[i].score = (rankings[i].scores[rankings[i].scores.length-1] - 500) * 2;
					
					rankings[i].score = rankings[i].scores[rankings[i].scores.length-1];

					delete rankings[i].scores;
					
					// Set top matchups and counters
	
					var matches = rankings[i].matches;
					
					rankings[i].matches.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));
					
					var matchupCount = 5;
					
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
					
					for(var j = 0; j < matchupCount; j++){
						var match = rankings[i].matches[j];
						
						delete match.moveSet;
						delete match.oppMoveSet;
						delete match.score;
						delete match.adjRating;
						delete match.adjOpRating;
						
						rankings[i].matchups.push(rankings[i].matches[j]);
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
				
				var category = "overall";
				
				if((shieldCounts[0] == 0) && (shieldCounts[1] == 0)){
					category = "closers";
				} else if((shieldCounts[0] == 2) && (shieldCounts[1] == 2)){
					category = "leads";
				} else if((shieldCounts[0] == 2) && (shieldCounts[1] == 0)){
					category = "defenders";
				} else if((shieldCounts[0] == 0) && (shieldCounts[1] == 2)){
					category = "attackers";
				}
				
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
				
				return rankings;
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