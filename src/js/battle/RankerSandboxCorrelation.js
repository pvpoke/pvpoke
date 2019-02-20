// JavaScript Document

var RankerMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new rankerObject();
		
		function rankerObject(){
			var gm = GameMaster.getInstance();
			var battle = new Battle();
			
			var rankings = [];
			
			// Run all ranking sets at once
			
			this.rankLoop = function(cup){
				
				battle.setCup(cup.name);
				
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
				
				var cup = battle.getCup();
				
				rankings = [];
				
				// Gather all eligible Pokemon
				battle.setCP(league);
				
				var minStats = 3000; // You must be this tall to ride this ride
				
				if(battle.getCP() == 1500){
					minStats = 1250;
				} else if(battle.getCP() == 2500){
					minStats = 2000;
				}
				
				var bannedList = ["mewtwo","ho-oh","lugia","giratina_altered","groudon","kyogre","garchomp","latios","latias","palkia","dialga","heatran","regice","regirock"];
				var permaBannedList = ["burmy_trash","burmy_sandy","burmy_plant","wormadam_plant","wormadam_sandy","wormadam_trash","mothim","cherubi","cherrim_overcast","cherrim_sunny","shellos_east_sea","shellos_west_sea","gastrodon_east_sea","gastrodon_west_sea","hippopotas","hippowdon","leafeon","glaceon","rotom","rotom_fan","rotom_frost","rotom_heat","rotom_mow","rotom_wash","uxie","azelf","mesprit","regigigas","giratina_origin","phione","manaphy","darkrai","shaymin_land","shaymin_sky","arceus","arceus_bug","arceus_dark","arceus_dragon","arceus_electric","arceus_fairy","arceus_fighting","arceus_fire","arceus_flying","arceus_ghost","arceus_grass","arceus_ground","arceus_ice","arceus_poison","arceus_psychic","arceus_rock","arceus_steel","arceus_water","jirachi"]; // Don't rank these Pokemon at all yet
				var allowedList = [];
				
				for(var i = 0; i < gm.data.pokemon.length; i++){
					
					if(gm.data.pokemon[i].fastMoves.length > 0){
						var pokemon = new Pokemon(gm.data.pokemon[i].speciesId, 0, battle);

						pokemon.initialize(battle.getCP());

						var stats = (pokemon.stats.hp * pokemon.stats.atk * pokemon.stats.def) / 1000;

						if(stats >= minStats){
							
							if((battle.getCP() == 1500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
								continue;
							}
							
							if(permaBannedList.indexOf(pokemon.speciesId) > -1){
								continue;
							}
							
							if((allowedList.length > 0) && (allowedList.indexOf(pokemon.speciesId) == -1)){
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
						
						var opponent = pokemonList[n];
						
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
						
						pokemon.autoSelectMoves();
						opponent.autoSelectMoves();
						
						pokemon.setShields(shieldCounts[0]);
						opponent.setShields(shieldCounts[1]);
						
						battle.simulate();
						
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
						
						rankObj.matches.push({
							opponent: opponent.speciesId,
							rating: rating,
							opRating: opRating
						});
						
						rms += Math.pow(rating,2);
					}
					
					rms = Math.floor(Math.sqrt(rms / rankCount));
					
					rankObj.rating = rms;
					
					// Assign special rating to movesets and determine best overall moveset
					
					var fastMoves = [];
					var chargedMoves = [];
					
					for(var j = 0; j < 0; j++){
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
				
				// Determine correlation scores
				var csvStr = '0';
				
				for(var i = 0; i < rankings.length; i++){
					
										
					if(rankings[i].rating > 400){
					
						var correlations = [];

						csvStr += ',' + rankings[i].speciesId;

						for(var n = 0; n < rankings.length; n++){
							
							if(rankings[n].rating > 400){
								var avg = 0;

								for(var j = 0; j < rankings.length; j++){
									var correlation = 1000 - Math.abs(rankings[i].matches[j].rating - rankings[n].matches[j].rating);

									avg += correlation;
								}

								avg = avg / rankings.length;

								correlations.push({speciesId: rankings[n].speciesId, correlation: avg});
							}
						}

						rankings[i].correlations = correlations;
						
					}
				}
				
				// Determine groups
				
				var groups = [];
				
				for(var i = 0; i < rankings.length; i++){
					
					if(! rankings[i].correlations){
						continue;
					}
					
					var group = [];
					
					for(var n = 0; n < rankings[i].correlations.length; n++){
						if(rankings[i].correlations[n].correlation > 850){
							group.push(rankings[i].correlations[n].speciesId);
						}
					}
					
					// Search to see if a similar group exists
					var groupExists = false;
					
					for(var n = 0; n < groups.length; n++){
						var sharedCount = 0;
						
						for(var j = 0; j < group.length; j++){
							if(groups[n].indexOf(group[j]) > -1){
								sharedCount++;
							}
						}
						
						if(sharedCount > groups[n].length / 4){
							groupExists = true;
							
							if(groups[n].indexOf(rankings[i].speciesId) == -1){
								groups[n].push(rankings[i].speciesId);
							}
						}
					}
					
					if((! groupExists)&&(group.length > 3)){
						groups.push(group);
					}
				}
				
				console.log(groups);
				
				csvStr += '\n';
				
				for(var i = 0; i < rankings.length; i++){
					
					if(rankings[i].rating > 400){

						csvStr += rankings[i].speciesId;

						for(var n = 0; n < rankings[i].correlations.length; n++){
							csvStr += ',' + rankings[i].correlations[n].correlation;
						}

						csvStr += '\n';
					}
				}
				
				console.log(csvStr);
				
				// Determine final score and sort matches
				
				for(var i = 0; i < rankings.length; i++){
					
					delete rankings[i].scores;
					delete rankings[i].matches;
					delete rankings[i].movesets;
					
				}
				
				// Sort rankings by best to worst
				
				// rankings.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));
				
				// Scale all scores on scale of 100;
				
				/*var highest = rankings[0].score;
				
				for(var i = 0; i < rankings.length; i++){
					rankings[i].score = Math.floor((rankings[i].score / highest) * 1000) / 10;
				}*/
				
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