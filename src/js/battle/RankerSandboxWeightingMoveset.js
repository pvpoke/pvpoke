// JavaScript Document

// This is the primary Ranker object that produces JSON ranking results for every league and category
// Recommend copying to a test or sandbox file to test new algorithms

const RankerMaster = (function () {
  let instance;

  function createInstance() {
    const object = new RankerObject();

    function RankerObject() {
      const gm = GameMaster.getInstance();
      const battle = new Battle();

      let rankings = [];
      const rankingCombinations = [];

      let moveSelectMode = 'force';
      let rankingData;
      let allResults = []; // Array of all ranking results

      let leagues = [1500];

      // Ranking scenarios, energy is turns of advantage
      let scenarios = GameMaster.getInstance().data.rankingScenarios;

      let currentLeagueIndex = 0;
      let currentScenarioIndex = 0;

      let startTime = 0; // For debugging and performance testing

      let pokemonList = [];

      const self = this;

      // Load override data
      const file = `${webRoot}data/rankingoverrides.json?v=${siteVersion}`;
      let overrides = [];

      $.getJSON(file, (data) => {
        // Sort alphabetically
        overrides = data;
        console.log(`Ranking overrides loaded [${overrides.length}]`);
      });

      // Load existing rankings to get best movesets
      this.displayRankingData = function (data, callback) {
        rankingData = data;

        self.initPokemonList(battle.getCP());

        currentScenarioIndex = 0;

        for (
          currentScenarioIndex = 0;
          currentScenarioIndex < scenarios.length;
          currentScenarioIndex++
        ) {
          const r = self.rank(leagues[currentLeagueIndex], scenarios[currentScenarioIndex]);
          allResults.push(r);
        }

        callback(allResults);
      };

      this.initPokemonList = function (cp) {
        startTime = Date.now();

        pokemonList = [];
        const cup = battle.getCup();

        // Gather all eligible Pokemon
        battle.setCP(cp);

        if (moveSelectMode === 'auto') {
          pokemonList = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude);
        } else if (moveSelectMode === 'force') {
          pokemonList = gm.generateFilteredPokemonList(
            battle,
            cup.include,
            cup.exclude,
            rankingData,
            overrides
          );
        }

        console.log(`List generated in: ${Date.now() - startTime}`);
      };

      // Run all ranking sets at once
      this.rankLoop = function (cp, cup, callback, data) {
        startTime = Date.now();

        battle.setCP(cp);
        if (cup.name !== 'custom') {
          battle.setCup(cup.name);
        } else {
          battle.setCustomCup(cup);
        }

        currentLeagueIndex = 0;
        currentScenarioIndex = 0;

        leagues = [cp];
        allResults = [];

        for (
          let currentLeagueIndex = 0;
          currentLeagueIndex < leagues.length;
          currentLeagueIndex++
        ) {
          if (moveSelectMode === 'auto') {
            self.initPokemonList(cp);

            // Only do 1 scenario for move generation
            scenarios = scenarios.splice(0, 1);

            for (
              currentScenarioIndex = 0;
              currentScenarioIndex < scenarios.length;
              currentScenarioIndex++
            ) {
              rankingCombinations.push({
                league: leagues[currentLeagueIndex],
                scenario: scenarios[currentScenarioIndex],
              });
            }
          } else if (moveSelectMode === 'force') {
            // Load existing ranking data first
            if (!data) {
              gm.loadRankingData(self, 'overall', leagues[currentLeagueIndex], cup.name);
            } else {
              self.displayRankingData(data, callback);
            }
          }
        }

        let currentRankings = rankingCombinations.length;

        const rankingInterval = setInterval(() => {
          if (rankingCombinations.length === currentRankings && rankingCombinations.length > 0) {
            currentRankings -= 1;

            startTime = Date.now();

            const r = self.rank(rankingCombinations[0].league, rankingCombinations[0].scenario);
            allResults.push(r);

            console.log(`Total time: ${Date.now() - startTime}`);

            rankingCombinations.splice(0, 1);

            if (rankingCombinations.length === 0) {
              callback(allResults);
            }
          }
        }, 1000);
      };

      // Run an individual rank set
      this.rank = function (league, scenario) {
        const cup = battle.getCup();
        let totalBattles = 0;
        const shieldCounts = scenario.shields;

        rankings = [];

        // For all eligible Pokemon, simulate battles and gather rating data
        const rankCount = pokemonList.length;

        for (let i = 0; i < rankCount; i++) {
          const pokemon = pokemonList[i];

          // Start with a blank rank object
          const rankObj = {
            speciesId: pokemon.speciesId,
            speciesName: pokemon.speciesName,
            rating: 0,
            matches: [], // Contains results of every individual battle
            matchups: [], // After simulation, this will hold the "Key Matchups"
            counters: [], // After simulation, this will hold the "Top Counters"
            moves: [], // After simulation, this will contain usage stats for fast and charged moves
          };

          let avg = 0;

          // Simulate battle against each Pokemon
          for (let n = 0; n < rankCount; n++) {
            const opponent = pokemonList[n];

            // If battle has already been simulated, skip
            if (rankings[n]) {
              // When shields are the same, A vs B is the same as B vs A, so take the existing result
              if (
                rankings[n].matches[i] &&
                shieldCounts[0] === shieldCounts[1] &&
                scenario.energy[0] === scenario.energy[1]
              ) {
                rankObj.matches.push({
                  opponent: opponent.speciesId,
                  rating: rankings[n].matches[i].opRating,
                  adjRating: rankings[n].matches[i].adjOpRating,
                  opRating: rankings[n].matches[i].rating,
                  adjOpRating: rankings[n].matches[i].adjRating,
                  moveUsage: rankings[n].matches[i].oppMoveUsage,
                  oppMoveUsage: rankings[n].matches[i].moveUsage,
                });

                avg += rankings[n].matches[i].adjOpRating;

                continue;
              }
            }

            totalBattles += 1;

            // Set both Pokemon and auto select their moves
            battle.setNewPokemon(pokemon, 0, false);
            battle.setNewPokemon(opponent, 1, false);

            pokemon.reset();
            opponent.reset();

            // Initialize values
            let healthRating = 500;
            let damageRating = 500;

            let opHealthRating = 500;
            let opDamageRating = 500;

            let rating = 500;
            let opRating = 500;

            let turnsToWin = 1;
            let turnRatio = 1;
            let opTurnRatio = 1;

            let winMultiplier = 1;
            let opWinMultiplier = 1;
            let adjRating = 500;
            let adjOpRating = 500;

            if (moveSelectMode === 'auto') {
              // pokemon.autoSelectMoves();
              // opponent.autoSelectMoves();
            } else if (moveSelectMode === 'force') {
              pokemon.setShields(shieldCounts[0]);
              opponent.setShields(shieldCounts[1]);

              // Set energy advantage
              if (scenario.energy[0] === 0) {
                pokemon.startEnergy = 0;
              } else {
                pokemon.startEnergy = Math.min(
                  pokemon.fastMove.energyGain *
                    Math.floor((scenario.energy[0] * 500) / pokemon.fastMove.cooldown),
                  100
                );
              }

              if (scenario.energy[1] === 0) {
                opponent.startEnergy = 0;
              } else {
                opponent.startEnergy = Math.min(
                  opponent.fastMove.energyGain *
                    Math.floor((scenario.energy[1] * 500) / opponent.fastMove.cooldown),
                  100
                );
              }

              battle.simulate();

              // Calculate Battle Rating for each Pokemon
              healthRating = pokemon.hp / pokemon.stats.hp;
              damageRating = (opponent.stats.hp - opponent.hp) / opponent.stats.hp;

              opHealthRating = opponent.hp / opponent.stats.hp;
              opDamageRating = (pokemon.stats.hp - pokemon.hp) / pokemon.stats.hp;

              rating = Math.floor((healthRating + damageRating) * 500);
              opRating = Math.floor((opHealthRating + opDamageRating) * 500);

              turnsToWin = battle.getTurnsToWin();
              turnRatio = turnsToWin[0] / turnsToWin[1];
              opTurnRatio = turnsToWin[1] / turnsToWin[0];

              // Modify ratings by shields burned and shields remaining
              winMultiplier = 1;
              opWinMultiplier = 1;

              if (rating > opRating) {
                opWinMultiplier = 0;
              } else {
                winMultiplier = 0;
              }

              adjRating =
                rating +
                (100 * (opponent.startingShields - opponent.shields) * winMultiplier +
                  100 * pokemon.shields * winMultiplier);
              adjOpRating =
                opRating +
                (100 * (pokemon.startingShields - pokemon.shields) * opWinMultiplier +
                  100 * opponent.shields * opWinMultiplier);
            }

            // Push final results into the rank object's matches array
            rankObj.matches.push({
              opponent: opponent.speciesId,
              rating,
              adjRating,
              opRating,
              adjOpRating,
              moveUsage: pokemon.generateMoveUsage(opponent, opponent.weightModifier),
              oppMoveUsage: opponent.generateMoveUsage(pokemon, pokemon.weightModifier),
            });

            avg += adjRating;
          }

          avg = Math.floor(avg / rankCount);

          rankObj.rating = avg;
          rankObj.scores = [avg];

          // Push all moves into moveset
          const fastMoves = [];
          const chargedMoves = [];

          for (let j = 0; j < pokemon.fastMovePool.length; j++) {
            fastMoves.push({ moveId: pokemon.fastMovePool[j].moveId, uses: 0 });
          }

          for (let j = 0; j < pokemon.chargedMovePool.length; j++) {
            chargedMoves.push({
              moveId: pokemon.chargedMovePool[j].moveId,
              uses: 0,
            });
          }

          // Assign special rating to movesets and determine best overall moveset
          for (let j = 0; j < rankObj.matches.length; j++) {
            const { moveUsage } = rankObj.matches[j];

            for (let k = 0; k < fastMoves.length; k++) {
              for (let l = 0; l < moveUsage.fastMoves.length; l++) {
                if (fastMoves[k].moveId === moveUsage.fastMoves[l].moveId) {
                  fastMoves[k].uses += moveUsage.fastMoves[l].uses;
                }
              }
            }

            for (let k = 0; k < chargedMoves.length; k++) {
              for (let l = 0; l < moveUsage.chargedMoves.length; l++) {
                if (chargedMoves[k].moveId === moveUsage.chargedMoves[l].moveId) {
                  chargedMoves[k].uses += moveUsage.chargedMoves[l].uses;
                }
              }
            }
          }

          // Sort move arrays and add them to the rank object
          fastMoves.sort((a, b) => (a.uses > b.uses ? -1 : b.uses > a.uses ? 1 : 0));
          chargedMoves.sort((a, b) => (a.uses > b.uses ? -1 : b.uses > a.uses ? 1 : 0));

          rankObj.moves = { fastMoves, chargedMoves };

          rankings.push(rankObj);
        }

        console.log(`total battles ${totalBattles}`);

        // Weigh all Pokemon matchups by their opponent's average rating
        let iterations = 10;

        // Doesn't make sense to weight which attackers can beat which other attackers, so don't weight those
        if (
          scenario.energy[0] !== scenario.energy[1] ||
          scenario.shields[0] !== scenario.shields[1]
        ) {
          iterations = 1;
        }

        // Iterate through the rankings and weigh each matchup Battle Rating by the average rating of the opponent
        let rankCutoffIncrease = 0.06;
        let rankWeightExponent = 1.65;

        if (cup.name === 'kingdom') {
          rankCutoffIncrease = 0.05;
          rankWeightExponent = 1.5;
        }

        if (cup.name === 'tempest') {
          rankWeightExponent = 1.25;
        }

        if (cup.name === 'toxic') {
          iterations = 1;
        }

        if (cup.name === 'rose') {
          iterations = 1;
        }

        if (cup.name === 'sorcerous') {
          iterations = 1;
        }

        if (cup.name === 'continentals-2') {
          iterations = 1;
        }

        if (cup.name === 'catacomb') {
          iterations = 1;
        }

        if (cup.name === 'all' && battle.getCP() === 10000) {
          iterations = 1;
        }

        if (cup.name === 'all' && battle.getCP() === 2500) {
          iterations = 1;
        }

        if (cup.name === 'all' && battle.getCP() === 1500) {
          iterations = 1;
        }

        if (cup.name === 'goteamup' && battle.getCP() === 1500) {
          iterations = 1;
        }

        if (cup.name === 'voyager' && battle.getCP() === 1500) {
          iterations = 1;
        }

        if (cup.name === 'grunt-4' && battle.getCP() === 1500) {
          iterations = 1;
        }

        if (cup.name === 'forest' && battle.getCP() === 1500) {
          iterations = 1;
        }

        if (cup.name === 'premier' && battle.getCP() === 10000) {
          iterations = 1;
        }

        if (cup.name === 'premier' && battle.getCP() === 2500) {
          iterations = 1;
        }

        if (
          cup.name === 'sorcerous-mirror' ||
          cup.name === 'sinister-mirror' ||
          cup.name === 'timeless-mirror'
        ) {
          iterations = 1;
        }

        if (cup.name === 'custom') {
          iterations = 7;
        }

        // Do fewer or no iterations for a very small pool
        if (rankings.length < 30) {
          iterations = 1;
        }

        for (let n = 0; n < iterations; n++) {
          const bestScore = Math.max.apply(
            Math,
            rankings.map((o) => {
              return o.scores[n];
            })
          );

          for (let i = 0; i < rankCount; i++) {
            let score = 0;

            const { matches } = rankings[i];
            let weights = 0;

            for (let j = 0; j < matches.length; j++) {
              let weight = Math.pow(
                Math.max(rankings[j].scores[n] / bestScore - (0.1 + rankCutoffIncrease * n), 0),
                rankWeightExponent
              );

              if (cup.name === 'sorcerous') {
                weight = 1;
              }

              if (cup.name === 'catacomb') {
                weight = 1;
              }

              if (cup.name === 'continentals-2') {
                weight = 1;
              }

              if (cup.name === 'premier') {
                weight = 1;
              }

              if (
                cup.name === 'sorcerous-mirror' ||
                cup.name === 'sinister-mirror' ||
                cup.name === 'timeless-mirror'
              ) {
                weight = 1;
              }

              // Don't score Pokemon in the mirror match
              if (rankings[j].speciesId === pokemonList[i].speciesId) {
                weight = 0;
              }

              if (pokemonList[j].weightModifier) {
                weight *= pokemonList[j].weightModifier;
              } else {
                if (cup.name === 'all' && battle.getCP() === 1500) {
                  weight = 0;
                }
              }

              // For switches, punish hard losses more. The goal is to identify safe switches
              if (scenario.slug === 'switches' && matches[j].adjRating < 500) {
                weight *= 1 + Math.pow(500 - matches[j].adjRating, 2) / 20000;
              }

              const sc = matches[j].adjRating * weight;
              const opScore = 1000 - matches[j].adjRating * weight;

              if (rankings[j].scores[n] / bestScore < 0.1 + rankCutoffIncrease * n) {
                weight = 0;
              }

              weights += weight;
              matches[j].score = sc;
              matches[j].opScore = opScore;
              score += sc;
            }

            const avgScore = Math.floor(score / weights);

            rankings[i].scores.push(avgScore);
          }
        }

        // Determine final score and sort matches
        for (let i = 0; i < rankCount; i++) {
          const pokemon = pokemonList[i];

          // If data is available, take existing move use data

          // if (moveSelectMode === 'force' && rankingData) {
          //   // Find Pokemon in existing rankings
          //   for (var k = 0; k < rankingData.length; k++) {
          //     if (pokemon.speciesId === rankingData[k].speciesId) {
          //       rankings[i].moves = rankingData[k].moves;
          //     }
          //   }
          // }

          rankings[i].moveset = [pokemon.fastMove.moveId, pokemon.chargedMoves[0].moveId];

          if (pokemon.chargedMoves[1]) {
            rankings[i].moveset.push(pokemon.chargedMoves[1].moveId);
          }

          rankings[i].score = rankings[i].scores[rankings[i].scores.length - 1];

          delete rankings[i].scores;

          // Set top matchups and counters
          const { matches } = rankings[i];

          rankings[i].matches.sort((a, b) =>
            a.opScore > b.opScore ? 1 : b.opScore > a.opScore ? -1 : 0
          );

          const matchupCount = Math.min(5, rankings[i].matches.length);
          let keyMatchupsCount = 0;

          // Gather 5 worst matchups for counters
          for (let j = 0; j < rankings[i].matches.length; j++) {
            const match = rankings[i].matches[j];

            delete match.moveUsage;
            delete match.oppMoveUsage;
            delete match.score;
            delete match.opScore;
            delete match.adjRating;
            delete match.adjOpRating;
            delete match.opRating;

            if (match.rating < 500) {
              rankings[i].counters.push(match);
              keyMatchupsCount += 1;

              if (keyMatchupsCount >= matchupCount) {
                break;
              }
            }
          }

          // Gather 5 best matchups, weighted by opponent rank
          rankings[i].matches.sort((a, b) => (a.score > b.score ? -1 : b.score > a.score ? 1 : 0));

          keyMatchupsCount = 0;

          for (let j = 0; j < rankings[i].matches.length; j++) {
            const match = rankings[i].matches[j];

            delete match.moveUsage;
            delete match.oppMoveUsage;
            delete match.score;
            delete match.opScore;
            delete match.adjRating;
            delete match.adjOpRating;
            delete match.OpRating;

            if (match.rating > 500) {
              rankings[i].matchups.push(match);
              keyMatchupsCount += 1;

              if (keyMatchupsCount >= matchupCount) {
                break;
              }
            }
          }

          delete rankings[i].matches;
          // delete rankings[i].movesets;
        }

        // Sort rankings by best to worst
        rankings.sort((a, b) => (a.score > b.score ? -1 : b.score > a.score ? 1 : 0));

        // Scale all scores on scale of 100;
        const highest = rankings[0].score;

        for (let i = 0; i < rankings.length; i++) {
          rankings[i].score = Math.floor((rankings[i].score / highest) * 1000) / 10;
        }

        // Write rankings to file
        if (cup.name !== 'custom') {
          const category = scenario.slug;

          const json = JSON.stringify(rankings);
          const league = battle.getCP();

          console.log(json);
          console.log(`/${cup.name}/${category}/rankings-${league}.json`);

          $.ajax({
            url: 'data/write.php',
            type: 'POST',
            data: {
              data: json,
              league,
              category,
              cup: cup.name,
            },
            dataType: 'json',
            success(data) {
              console.log(data);
            },
            error(request, error) {
              console.log(`Request: ${JSON.stringify(request)}`);
              console.log(error);
            },
          });
        }

        return rankings;
      };

      // Set whether to autoselect moves or force a best moveset
      this.setMoveSelectMode = function (value) {
        moveSelectMode = value;
      };

      // Return the current move select mode
      this.getMoveSelectMode = function () {
        return moveSelectMode;
      };

      // Set move overrides for a specific cup and league
      this.setMoveOverrides = function (league, cup, values) {
        // Iterate through existing overrides and replace if already exists
        let cupFound = false;

        for (let i = 0; i < overrides.length; i++) {
          if (overrides[i].league === league && overrides[i].cup === cup) {
            cupFound = true;
            overrides[i].pokemon = values;
          }
        }

        // If a cup wasn't found, add a new one
        if (!cupFound) {
          overrides.push({
            league,
            cup,
            pokemon: values,
          });
        }
      };

      // Set the scenarios to be ranked
      this.setScenarioOverrides = function (arr) {
        scenarios = arr;
      };

      // Given a Pokemon, output a string of numbers for URL building
      function generateURLMoveStr(pokemon) {
        let moveStr = '';

        const fastMoveIndex = pokemon.fastMovePool.indexOf(pokemon.fastMove);
        const chargedMove1Index = pokemon.chargedMovePool.indexOf(pokemon.chargedMoves[0]) + 1;
        const chargedMove2Index = pokemon.chargedMovePool.indexOf(pokemon.chargedMoves[1]) + 1;

        moveStr = `${fastMoveIndex}-${chargedMove1Index}-${chargedMove2Index}`;

        return moveStr;
      }
    }

    return object;
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();
