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
			var battle = BattleMaster.getInstance();
			
			var rankings = [];

			// Run an individual rank set
			
			this.rank = function(team, league){
				
				var totalBattles = 0;
				
				var pokemonList = [];
				var teamRatings = [];
				
				for(var i = 0; i < team.length; i++){
					teamRatings.push([]);
				}
				
				rankings = [];
				
				// Gather all eligible Pokemon
				var cup = battle.getCup();
				
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
							
							if((cup.types.length > 0) && (cup.types.indexOf(pokemon.types[0]) < 0) && (cup.types.indexOf(pokemon.types[1]) < 0) ){	
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
						types: pokemon.types,
						rating: 0
					};
					
					var avg = 0;
					
					// Simulate battle against each Pokemon
					
					for(var n = 0; n < team.length; n++){	
						
						var opponent = team[n];
						
						opponent.index = 1;
							
						totalBattles++;

						battle.setNewPokemon(pokemon, 0);
						
						if(team.length > 3){
							battle.setNewPokemon(opponent, 1);
						} else{
							battle.setNewPokemon(opponent, 1, false); // Keep settings for selected Pokemon
						}
						
						
						// Force best moves on counters but not on the user's selected Pokemon
						
						pokemon.autoSelectMoves();
						
						if(team.length > 3){
							opponent.autoSelectMoves();
						}
						
						battle.simulate();
						
						var healthRating = (pokemon.hp / pokemon.stats.hp);
						var damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));
						
						var opHealthRating = (opponent.hp / opponent.stats.hp);
						var opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));
						
						var rating = Math.floor( (healthRating + damageRating) * 500);
						var opRating = Math.floor( (opHealthRating + opDamageRating) * 500);
						
						avg += rating;
						
						teamRatings[n].push(opRating);
					}
					
					avg = Math.floor(avg / team.length);
					
					rankObj.rating = avg;
					rankings.push(rankObj);
				}
				
				// Sort rankings by best to worst
				
				rankings.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));
				
				// Sort team's matchups by best to worst
				
				for(var i = 0; i < teamRatings.length; i++){
					 teamRatings[i].sort((a,b) => (a > b) ? -1 : ((b > a) ? 1 : 0));
				}
								
				battle.clearPokemon(); // Prevents associated Pokemon objects from being altered by future battles
				
				return {rankings: rankings, teamRatings: teamRatings};
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