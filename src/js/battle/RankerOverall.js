// JavaScript Document

/*
* This object loads all current ranking data from each category and produces overall rating
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

			var moveUsageMode = "single";

			var self = this;

			// Hook for interface

			this.rankLoop = function(cp, cup){


				battle.setCup(cup.name);
				battle.setCP(cp);

				var leagues = [cp];

				for(var i = 0; i < leagues.length; i++){
					rankingCombinations.push({league: leagues[i]});
				}

				var currentRankings = rankingCombinations.length;

				var rankingInterval = setInterval(function(){
					if((rankingCombinations.length == currentRankings)&&(rankingCombinations.length > 0)){
						currentRankings--;

						battle.setCP(rankingCombinations[0].league);

						self.rank(battle.getCup(), rankingCombinations[0].league);

						rankingCombinations.splice(0, 1);
					}
				}, 1000);
			}

			// Load existing ranking data

			this.rank = function(cup, league){

				var categories = ["leads","closers","attackers","defenders"];

				for(var i = 0; i < categories.length; i++){
					gm.loadRankingData(self, categories[i], league, cup.name);
				}
			}

			// If all data is loaded, process it

			this.displayRankingData = function(){

				var league = battle.getCP().toString();
				var cup = battle.getCup().name;
				var categories = ["leads","closers","attackers","defenders"];

				if(gm.loadedData < categories.length){
					return;
				}

				gm.loadedData = 0;

				rankings = [];

				for(var i = 0; i < categories.length; i++){

					var key = cup + "" + categories[i] + "" + league;

					var arr = gm.rankings[key];

					// Sort by species name

					arr.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

					for(var n = 0; n < arr.length; n++){
						var rankObj = arr[n];

						if(! rankings[n]){

							rankObj.scores = [rankObj.score];
							rankObj.score = rankObj.score;

							rankObj.score = Math.pow(rankObj.scores[0] * rankObj.scores[1])


							// Sort moves by id

							if(! rankObj.moves.chargedMoves){
								console.log(rankObj);
							}

							rankObj.moves.fastMoves.sort((a,b) => (a.moveId > b.moveId) ? -1 : ((b.moveId > a.moveId) ? 1 : 0));
							rankObj.moves.chargedMoves.sort((a,b) => (a.moveId > b.moveId) ? -1 : ((b.moveId > a.moveId) ? 1 : 0));

							rankings.push(rankObj);

						} else{
							rankings[n].score *= rankObj.score;
							rankings[n].scores.push(rankObj.score);

							if(moveUsageMode == "aggregate"){
								// Add move usage for all moves

								rankObj.moves.fastMoves.sort((a,b) => (a.moveId > b.moveId) ? -1 : ((b.moveId > a.moveId) ? 1 : 0));
								rankObj.moves.chargedMoves.sort((a,b) => (a.moveId > b.moveId) ? -1 : ((b.moveId > a.moveId) ? 1 : 0));

								for(var j = 0; j < rankObj.moves.fastMoves.length; j++){
									rankings[n].moves.fastMoves[j].uses += rankObj.moves.fastMoves[j].uses;
								}

								for(var j = 0; j < rankObj.moves.chargedMoves.length; j++){
									rankings[n].moves.chargedMoves[j].uses += rankObj.moves.chargedMoves[j].uses;
								}
							}
						}
					}
				}

				// Produce final rankings

				for(var i = 0; i < rankings.length; i++){

					var r = rankings[i];
					var pokemon = new Pokemon(r.speciesId, 0, battle);
					pokemon.initialize();

					// Calculate consistency score based on moveset

					var arr = r.moveStr.split("-");
					var fastMove = pokemon.fastMovePool[arr[0]];
					var chargedMoves = [pokemon.chargedMovePool[arr[1]-1]];
					var consistencyScore = 1;

					// Only calculate with two Charged Moves
					if((arr.length > 2)&&(arr[2] != "0")){						
						chargedMoves.push(pokemon.chargedMovePool[arr[2]-1]);

						var effectivenessScenarios = [
							[1, 1]
							];

						if(chargedMoves[0].type != chargedMoves[1].type){
							effectivenessScenarios.push(
								[0.625, 1],
								[1, 0.625]
							);
						}

						// Here we are looking at how depenendent each Pokemon is on baiting in scenarios where both moves are neutral, or one or the other is resisted
						for(var n = 0; n < effectivenessScenarios.length; n++){
							// Sort moves by name as a starting point
							chargedMoves.sort((a,b) => (a.name > b.name) ? -1 : ((b.name > a.name) ? 1 : 0));

							// Need to reset this number because of how movesets are generated
							chargedMoves[0].dpe = (chargedMoves[0].damage / chargedMoves[0].energy) * effectivenessScenarios[n][0];
							chargedMoves[1].dpe = (chargedMoves[1].damage / chargedMoves[1].energy) * effectivenessScenarios[n][1];
							chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));

							// Factor in Power-Up Punch where Pokemon may be consistent spamming it

							if(chargedMoves[1].moveId == "POWER_UP_PUNCH"){
								chargedMoves[1].dpe *= 2;
								chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));
							}

							// Calculate how much fast move vs charged move damage this Pokemon puts out per cycle
							var cycleFastMoves = Math.ceil(chargedMoves[0].energy / fastMove.energyGain);
							var cycleFastDamage = fastMove.damage * cycleFastMoves;
							var cycleDamage = cycleFastDamage + chargedMoves[0].damage;

							var factor = 1;
							if((chargedMoves[0].energy > chargedMoves[1].energy)||( (chargedMoves[0].energy == chargedMoves[1].energy) && (chargedMoves[1].moveId == "ACID_SPRAY") )){
								factor = (cycleFastDamage / cycleDamage) + ((chargedMoves[0].damage / cycleDamage) * (chargedMoves[1].dpe / chargedMoves[0].dpe));
							}

							consistencyScore *= factor;
						}


						// Now do a square root mean
						consistencyScore = Math.pow(consistencyScore, (1/effectivenessScenarios.length));
					}

					consistencyScore = Math.round(consistencyScore * 1000) / 10;

					/* Let's try a different approach to calculating overall score.
					* Weigh the top 2 ratings by 9/20 and the bottom 2 ratings by 1/20.
					* This will better represent specialized Pokemon.
					*/

					var scores = [];
					var sortedScores = [];

					for(var n = 0; n < rankings[i].scores.length; n++){
						scores.push(rankings[i].scores[n]);
					}

					rankings[i].scores.push(consistencyScore);

					var bestScore = Math.max(scores[0], scores[1]);
					sortedScores.push(
						Math.min(scores[0], scores[1]),
						scores[2],
						scores[3]
						);

					sortedScores.sort((a,b) => (a > b) ? -1 : ((b > a) ? 1 : 0));

					// Old Formula

					// rankings[i].score = Math.pow( Math.pow(sortedScores[0], 9) * Math.pow(sortedScores[1], 9) * Math.pow(sortedScores[2], 1) * Math.pow(sortedScores[3], 1), (1/20));

					rankings[i].score = Math.pow( Math.pow(bestScore, 12) * Math.pow(sortedScores[0], 6) * Math.pow(sortedScores[1], 1) * Math.pow(sortedScores[2], 1) * Math.pow(consistencyScore, 2), (1/22));

					rankings[i].score = Math.floor(rankings[i].score*10) / 10;
				}

				rankings.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0));

				var json = JSON.stringify(rankings);

				console.log(json);

				var json = JSON.stringify(rankings);
				var league = battle.getCP();
				var category = "overall";

				console.log(category+"/rankings-"+league+".json");

				// Write to a file

				$.ajax({

					url : 'data/write.php',
					type : 'POST',
					data : {
						'data' : json,
						'league' : league,
						'category' : category,
						'cup' : cup
					},
					dataType:'json',
					success : function(data) {
						console.log(data);
					},
					error : function(request,error)
					{
						console.log("Request: "+JSON.stringify(request));
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
