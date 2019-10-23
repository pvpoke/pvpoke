// JavaScript Document

/*
* This is for testing that all A vs. B matchups produce the same results as B vs. A
*/

var RankerMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new rankerObject();
		
		function rankerObject(){
			var gm = GameMaster.getInstance();
			var battle = new Battle();
			
			var rankings = [];
			
			// Run all ranking sets at once
			
			this.rankLoop = function(){
				
				var leagues = [1500];
				var shields = [ [1,1] ];
				
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
				
				var cup = battle.getCup();
				
				rankings = [];
				
				// Gather all eligible Pokemon
				battle.setCP(league);
				
				var minCP = 2000; // You must be this tall to ride this ride
				
				if(battle.getCP() == 1500){
					minCP = 1200;
				} else if(battle.getCP() == 2500){
					minCP = 1500;
				}
				
				// Don't allow these Pokemon into the Great League. They can't be trusted.
				
				var bannedList = ["mewtwo","giratina_altered","groudon","kyogre","garchomp","latios","latias","palkia","dialga","heatran","regice","regirock"];
				
				// If you want to rank specfic Pokemon, you can enter their species id's here
				
				var allowedList = [];
				
				for(var i = 0; i < gm.data.pokemon.length; i++){
					
					if(gm.data.pokemon[i].fastMoves.length > 0){ // Only add Pokemon that have move data
						var pokemon = new Pokemon(gm.data.pokemon[i].speciesId, 0, battle);

						pokemon.initialize(battle.getCP());

						if(pokemon.cp >= minCP){
							
							if((battle.getCP() == 1500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
								continue;
							}
							
							if((allowedList.length > 0) && (allowedList.indexOf(pokemon.speciesId) == -1)){
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
						
						avg += rating;
						
						if(rankings[n]){
							
							// When shields are the same, A vs B is the same as B vs A, so take the existing result
							
							if((rankings[n].matches[i])&&(shieldCounts[0]==shieldCounts[1])){
								
								if(rankings[n].matches[i].opRating != rating){
									console.log(pokemon.speciesId + " vs. " + opponent.speciesId + " " + rating + " " + opponent.speciesId + " vs. " + pokemon.speciesId + " " + rankings[n].matches[i].opRating);
								}		
							}
						}
					}

					rankings.push(rankObj);
				}
				
				console.log("total battles " + totalBattles);
				
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