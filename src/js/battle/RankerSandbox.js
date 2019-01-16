// JavaScript Document

var RankerMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new rankerObject();
		
		function rankerObject(){
			var gm = GameMaster.getInstance();
			var battle = BattleMaster.getInstance();
			
			var rankings = [];
			
			// Run all ranking sets at once
			
			this.rankLoop = function(){
				
				var leagues = [1500];
				var shields = [ [0,0] ];
				
				for(var i = 0; i < leagues.length; i++){
					for(var n = 0; n < shields.length; n++){
						this.rank(leagues[i], shields[n]);
					}
				}
				
			}		
			
			// Run an individual rank set
			
			this.rank = function(league, shields){
				
				var totalBattles = 0;
				
				var pokemonList = [];
				
				var shieldCounts = shields;
				
				rankings = [];
				
				// Gather all eligible Pokemon
				battle.setCP(league);
				
				var minCP = 2000;
				
				if(battle.getCP() == 1500){
					minCP = 1200;
				} else if(battle.getCP() == 2500){
					minCP = 1500;
				}
				
				var bannedList = ["mewtwo","ho-oh","lugia","giratina_altered","groudon","kyogre","garchomp","latios","latias","palkia","dialga","heatran","regice","regirock"];
				var allowedList = [];
				
				for(var i = 0; i < gm.data.pokemon.length; i++){
					
					if(gm.data.pokemon[i].fastMoves.length > 0){
						var pokemon = new Pokemon(gm.data.pokemon[i].speciesId, 0);

						pokemon.initialize(battle.getCP());

						if(pokemon.cp >= minCP){
							
							if((battle.getCP() == 1500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
								continue;
							}
							
							if((allowedList.length > 0) && (allowedList.indexOf(pokemon.speciesId) == -1)){
								continue;
							}
							
							pokemonList.push(pokemon.speciesId);
						}
					}
				}
				
				// For all eligible Pokemon, simulate battles and gather rating data
				
				var rankCount = pokemonList.length;
				
				for(var i = 0; i < rankCount; i++){
					
					var pokemon = new Pokemon(pokemonList[i], 0);
						
					var rankObj = {
						speciesId: pokemon.speciesId,
						speciesName: pokemon.speciesName,
						rating: 0,
						matches: [],
						matchups: [],
						counters: [],
						moves: []
					};
					
					var rms = 0;
					
					// Simulate battle against each Pokemon
					
					for(var n = 0; n < rankCount; n++){	
						
						var opponent = new Pokemon(pokemonList[n], 1);
						
						// If battle has already been simulated, skip
							
						if(rankings[n]){
							
							if((rankings[n].matches[i])&&(shieldCounts[0]==shieldCounts[1])){
								
								rankObj.matches.push({
									opponent: opponent.speciesId,
									rating: rankings[n].matches[i].opRating,
									opRating: rankings[n].matches[i].rating,
									moveSet: rankings[n].matches[i].oppMoveSet,
									oppMoveSet: rankings[n].matches[i].moveSet
								})
					
								rms += Math.pow(rankings[n].matches[i].opRating, 2);

								continue;
							}
						}
							
						totalBattles++;

						battle.setNewPokemon(pokemon, 0);
						battle.setNewPokemon(opponent, 1);
						
						pokemon.autoSelectMoves(1);
						opponent.autoSelectMoves(1);
						
						pokemon.setShields(shieldCounts[0]);
						opponent.setShields(shieldCounts[1]);
						
						battle.simulate();
						
						var healthRating = (pokemon.hp / pokemon.stats.hp);
						var damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));
						
						var opHealthRating = (opponent.hp / opponent.stats.hp);
						var opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));
						
						var rating = Math.floor( (healthRating + damageRating) * 500);
						var opRating = Math.floor( (opHealthRating + opDamageRating) * 500);
						
						if((opponent.hp == 0) && (pokemon.hp > 0)){
							rating = 1000;
							opRating = 0;
						} else if((opponent.hp > 0) && (pokemon.hp == 0)){
							rating = 0;
							opRating = 1000;
						} else if((opponent.hp == 0) && (pokemon.hp == 0)){
							rating = 500;
							opRating = 500;
						}
						
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
						
						rankObj.matches.push({
							opponent: opponent.speciesId,
							rating: rating,
							opRating: opRating,
							moveSet: {
								fastMove: pokemon.fastMove.moveId,
								chargedMoves: chargedMovesList
							},
							oppMoveSet: {
								fastMove: opponent.fastMove.moveId,
								chargedMoves: oppChargedMovesList
							}
						});
						
						rms += Math.pow(rating,2);
					}
					
					rms = Math.floor(Math.sqrt(rms / rankCount));
					
					rankObj.rating = rms;
					
					// Assign special rating to movesets and determine best overall moveset
					
					var fastMoves = [];
					var chargedMoves = [];
					
					for(var j = 0; j < rankObj.matches.length; j++){
						var moveset = rankObj.matches[j].moveSet;
						var fastMoveIndex = -1;
						
						for(var k = 0; k < fastMoves.length; k++){
							if(fastMoves[k].moveId == moveset.fastMove){
								fastMoveIndex = k;
								
								fastMoves[k].uses += 1;
							}
						}
						
						if(fastMoveIndex == -1){
							fastMoves.push({moveId: moveset.fastMove, uses: 1});
						}
						
						var chargedMoveIndexes = [-1,-1];
						
						for(var k = 0; k < chargedMoves.length; k++){
							for(var l = 0; l < moveset.chargedMoves.length; l++){
								if(chargedMoves[k].moveId == moveset.chargedMoves[l].moveId){
									chargedMoveIndexes[l] = k;

									chargedMoves[k].uses += moveset.chargedMoves[l].uses;
								}
							}
						}
						
						for(var k = 0; k < moveset.chargedMoves.length; k++){
							if(chargedMoveIndexes[k] == -1){
								chargedMoves.push({moveId: moveset.chargedMoves[k].moveId, uses: moveset.chargedMoves[k].uses});
							}
						}
					}
					
					fastMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
					chargedMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
					
					rankObj.moves = {fastMoves: fastMoves, chargedMoves: chargedMoves}
					
					rankings.push(rankObj);
				}
				
				console.log("total battles " + totalBattles);
				
				// Sort all Pokemon matchups
				
				var iterations = 0;
				
				for(var i = 0; i < rankCount; i++){
					rankings[i].scores = [];
					rankings[i].scores.push(rankings[i].rating);
				}
				
				for(var n = 0; n < iterations; n++){
					for(var i = 0; i < rankCount; i++){
						var score = 0;
						
						var matches = rankings[i].matches;
						
						for(var j = 0; j < matches.length; j++){
							
							var sc = Math.sqrt(matches[j].rating * (Math.pow(rankings[j].scores[n],2)));
							
							matches[j].score = sc;

							score += Math.pow(sc, 2);
						}

						rankings[i].scores.push(Math.floor(Math.sqrt(score / matches.length)));
					}
				}
				
				// Determine final score and sort matches
				
				for(var i = 0; i < rankCount; i++){
					
					// rankings[i].score = (rankings[i].scores[rankings[i].scores.length-1] - 500) * 2;
					
					rankings[i].score = rankings[i].scores[rankings[i].scores.length-1];
					
					delete rankings[i].scores;
					
					// Set top matchups and counters
					
					// Weight matches by opponent rank
					
					var matches = rankings[i].matches;
					
					rankings[i].matches.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));
					
					var matchupCount = 5;
					
					// Gather 5 worst matchups for counters
					
					for(var j = rankObj.matches.length - 1; j > rankings[i].matches.length - matchupCount - 1; j--){
						var match = rankings[i].matches[j];
						
						delete match.moveSet;
						delete match.oppMoveSet;
						delete match.score;
						
						rankings[i].counters.push(rankings[i].matches[j]);
					}
					
					// Gather 5 best matchups, weighted by opponent rank
					
					rankings[i].matches.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));
					
					for(var j = 0; j < matchupCount; j++){
						var match = rankings[i].matches[j];
						
						delete match.moveSet;
						delete match.oppMoveSet;
						delete match.score;
						
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
					category = "general";
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
				console.log(category+"/rankings-"+league+".json");
				
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