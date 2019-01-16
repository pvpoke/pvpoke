// JavaScript Document

var RankerMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new rankerObject();
		
		function rankerObject(){
			var gm = GameMaster.getInstance();
			var battle = BattleMaster.getInstance();
			
			var rankings = [];			
			
			this.rank = function(){
				
				var totalBattles = 0;
				
				var pokemonList = [];
				
				rankings = [];

				var cp = parseInt($(".league-select option:selected").val());

				var leagues = [1500,2500,10000];
				var index = leagues.indexOf(cp);

				if(index == -1){
					return;
				}

				var pokeRankings = gm.rankings[index];
				
				// Gather all eligible Pokemon
				
				var minCP = 2000;
				
				if(battle.getCP() == 1500){
					minCP = 1200;
				} else if(battle.getCP() == 2500){
					minCP = 1500;
				}
				
				var bannedList = ["mewtwo","ho-oh","lugia","giratina_altered","groudon","kyogre","slaking","garchomp"];
				var allowedList = [];
				
				for(var i = 0; i < pokeRankings.length; i++){
					
					var pokemon = new Pokemon(pokeRankings[i].speciesId, 0);

					pokemon.initialize(battle.getCP());

					if(pokemon.cp >= minCP){

						if((battle.getCP() == 1500)&&(bannedList.indexOf(pokemon.speciesId) > -1)){
							continue;
						}

						if((allowedList.length > 0) && (allowedList.indexOf(pokemon.speciesId) == -1)){
							continue;
						}

						pokemonList.push({id: pokemon.speciesId, moveset: pokeRankings[i].moveset});
					}
				}
				
				// For all eligible Pokemon, simulate battles and gather rating data
				
				var rankCount = 99;
				
				for(var i = 0; (i < rankCount) && (i < pokemonList.length); i++){
					
					var pokemon = new Pokemon(pokemonList[i].id, 0);
						
					var rankObj = {
						speciesId: pokemon.speciesId,
						speciesName: pokemon.speciesName,
						rating: 0,
						matches: [],
						matchups: [],
						counters: [],
						movesets: []
					};
					
					var rms = 0;
					
					// Simulate battle against each Pokemon
					
					for(var n = 0; (n < rankCount) && (n < pokemonList.length); n++){	
						
						var opponent = new Pokemon(pokemonList[n].id, 1);
						
						// If battle has already been simulated, skip
							
						if(rankings[n]){
							
							if(rankings[n].matches[i]){
								
								rankObj.matches.push({
									opponent: opponent.speciesId,
									rating: rankings[n].matches[i].opRating,
									opRating: rankings[n].matches[i].rating,
									moveSet: rankings[n].matches[i].oppMoveSet,
									oppMoveSet: rankings[n].matches[i].moveSet
								})
					
								rms += Math.pow(rankings[n].matches[i].opRating, 2);
								
								rankObj = this.processMoveset(rankObj, {fastMove: rankings[n].matches[i].oppMoveSet.fastMove, chargedMoves: rankings[n].matches[i].oppMoveSet.chargedMoves}, rankings[n].matches[i].opRating);

								continue;
							}
						}
							
						totalBattles++;

						battle.setNewPokemon(pokemon, 0);
						battle.setNewPokemon(opponent, 1);
						
						pokemon.fastMovePool = [gm.getMoveById(pokemonList[i].moveset.fastMove)];
						pokemon.chargedMovePool = [gm.getMoveById(pokemonList[i].moveset.chargedMoves[0]),gm.getMoveById(pokemonList[i].moveset.chargedMoves[1])];
						
						opponent.fastMovePool = [gm.getMoveById(pokemonList[n].moveset.fastMove)];
						opponent.chargedMovePool = [gm.getMoveById(pokemonList[n].moveset.chargedMoves[0]),gm.getMoveById(pokemonList[n].moveset.chargedMoves[1])];
						
						pokemon.autoSelectMoves(1);
						opponent.autoSelectMoves(1);
						
						battle.simulate();
						
						var healthRating = (pokemon.hp / pokemon.stats.hp);
						var damageRating = ((opponent.stats.hp - opponent.hp) / (opponent.stats.hp));
						
						var opHealthRating = (opponent.hp / opponent.stats.hp);
						var opDamageRating = ((pokemon.stats.hp - pokemon.hp) / (pokemon.stats.hp));
						
						var rating = Math.floor( (healthRating + damageRating) * 500);
						var opRating = Math.floor( (opHealthRating + opDamageRating) * 500);
						
						var chargedMovesList = [pokemon.chargedMoves[0].moveId];
						
						if(pokemon.chargedMoves[1]){
							chargedMovesList.push(pokemon.chargedMoves[1].moveId);
						}
						
						var oppChargedMovesList = [opponent.chargedMoves[0].moveId];
						
						if(opponent.chargedMoves[1]){
							oppChargedMovesList.push(opponent.chargedMoves[1].moveId);
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
						
						rankObj = this.processMoveset(rankObj, {fastMove: pokemon.fastMove.moveId, chargedMoves: chargedMovesList}, rating);
						
						rms += Math.pow(rating,2);
					}
					
					rms = Math.floor(Math.sqrt(rms / rankCount));
					
					rankObj.rating = rms;
					
					// Assign special rating to movesets and determine best overall moveset
					
					var fastMoves = [];
					var chargedMoves = [];
					
					for(var j = 0; j < rankObj.movesets.length; j++){
						var moveset = rankObj.movesets[j];
						
						var fastMoveIndex = -1;
						
						for(var k = 0; k < fastMoves.length; k++){
							if(fastMoves.moveId == moveset.fastMove){
								fastMoveIndex = k;
								
								fastMoves[k].uses += moveset.uses;
							}
						}
						
						if(fastMoveIndex == -1){
							fastMoves.push({moveId: moveset.fastMove, uses: moveset.uses});
						}
						
						var chargedMoveIndexes = [-1,-1];
						
						for(var k = 0; k < chargedMoves.length; k++){
							if(chargedMoves[k].moveId == moveset.chargedMoves[0]){
								chargedMoveIndexes[0] = k;
								
								chargedMoves[k].uses += moveset.uses;
							}
							
							if(moveset.chargedMoves[1]){
								if(chargedMoves[k].moveId == moveset.chargedMoves[1]){
									chargedMoveIndexes[1] = k;

									chargedMoves[k].uses += (moveset.uses * 0);
								}
							}
						}
						
						for(var k = 0; k < moveset.chargedMoves.length; k++){
							if(chargedMoveIndexes[k] == -1){
								
								var uses = moveset.uses;
								
								if(k > 0){
									uses *= 0;
								}
								
								chargedMoves.push({moveId: moveset.chargedMoves[k], uses: uses});
							}
						}
						
						moveset.rating = Math.floor(Math.sqrt(moveset.rating / moveset.uses));
						moveset.score = Math.pow(moveset.rating, 2) * moveset.uses;
					}
					
					fastMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
					chargedMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
					
					rankObj.movesets.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));
					
					if(chargedMoves.length < 2){
						rankObj.moveset = { fastMove: fastMoves[0].moveId, chargedMoves: [chargedMoves[0].moveId]};
					} else{
						rankObj.moveset = { fastMove: fastMoves[0].moveId, chargedMoves: [chargedMoves[0].moveId, chargedMoves[1].moveId] };
					}
					
					
					rankings.push(rankObj);
				}
				
				console.log("total battles " + totalBattles);
				
				// Sort all Pokemon matchups
				
				for(var i = 0; i < rankings.length; i++){
					
					// Set top matchups and counters
					
					// Weight matches by opponent rank.
					
					var matches = rankings[i].matches;
					
					for(var j = 0; j < matches.length; j++){
						matches[j].score = Math.sqrt(matches[j].rating * rankings[j].rating);
					}
					
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
					delete rankings[i].movesets;
					
				}
				
				// Sort rankings by best to worst
				
				rankings.sort((a,b) => (a.rating > b.rating) ? -1 : ((b.rating > a.rating) ? 1 : 0));
				
				return rankings;
			}
			
			this.processMoveset = function(rankObj, moveset, rating){
				// Check if moveset already exists
				
				var movesetFound = false;
				
				for(var i = 0; i < rankObj.movesets.length; i++){
					
					// Check if charged moves are identical
					
					var sameChargedMoves = true;
					
					for(var n = 0; n < moveset.chargedMoves.length; n++){
						
						if(rankObj.movesets[i].chargedMoves[n] != moveset.chargedMoves[n]){
							sameChargedMoves = false;
						}
					}
					
					if((rankObj.movesets[i].fastMove == moveset.fastMove) && (sameChargedMoves)){
						movesetFound = true;
						
						rankObj.movesets[i].uses++;
						rankObj.movesets[i].rating += Math.pow(rating, 2);
					}
				}
				
				if(! movesetFound){
					rankObj.movesets.push({
						fastMove: moveset.fastMove,
						chargedMoves: moveset.chargedMoves,
						uses: 1,
						rating: rating
					})
				}
				
				return rankObj;
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