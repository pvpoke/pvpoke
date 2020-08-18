// JavaScript Document

// This object loads all current ranking data from each category and produces overall rating

const RankerMaster = (function () {
  let instance;

  function createInstance() {
    const object = new rankerObject();

    function rankerObject() {
      const gm = GameMaster.getInstance();
      const battle = new Battle();

      let rankings = [];
      const rankingCombinations = [];

      const moveUsageMode = 'single';

      const self = this;

      // Hook for interface
      this.rankLoop = function (cp, cup) {
        battle.setCup(cup.name);
        battle.setCP(cp);

        const leagues = [cp];

        for (let i = 0; i < leagues.length; i++) {
          rankingCombinations.push({ league: leagues[i] });
        }

        let currentRankings = rankingCombinations.length;

        const rankingInterval = setInterval(() => {
          if (rankingCombinations.length === currentRankings && rankingCombinations.length > 0) {
            currentRankings -= 1;

            battle.setCP(rankingCombinations[0].league);

            self.rank(battle.getCup(), rankingCombinations[0].league);

            rankingCombinations.splice(0, 1);
          }
        }, 1000);
      };

      // Load existing ranking data
      this.rank = function (cup, league) {
        const categories = ['leads', 'closers', 'switches', 'chargers', 'attackers'];

        for (let i = 0; i < categories.length; i++) {
          gm.loadRankingData(self, categories[i], league, cup.name);
        }
      };

      // If all data is loaded, process it
      this.displayRankingData = function () {
        var league = battle.getCP().toString();
        const cup = battle.getCup().name;
        let categories = ['leads', 'closers', 'switches', 'chargers', 'attackers'];

        if (moveUsageMode === 'aggregate') {
          categories = ['leads'];
        }

        if (gm.loadedData < categories.length) {
          return;
        }

        gm.loadedData = 0;

        rankings = [];

        for (let i = 0; i < categories.length; i++) {
          const key = `${cup}${categories[i]}${league}`;

          const arr = gm.rankings[key];

          // Sort by species name
          arr.sort((a, b) =>
            a.speciesName > b.speciesName ? 1 : b.speciesName > a.speciesName ? -1 : 0
          );

          for (let n = 0; n < arr.length; n++) {
            const rankObj = arr[n];

            if (!rankings[n]) {
              rankObj.scores = [rankObj.score];
              rankObj.score = rankObj.score;

              rankObj.score = Math.pow(rankObj.scores[0] * rankObj.scores[1]);

              // Sort moves by id
              if (!rankObj.moves.chargedMoves) {
                console.log(rankObj);
              }

              rankObj.moves.fastMoves.sort((a, b) =>
                a.moveId > b.moveId ? -1 : b.moveId > a.moveId ? 1 : 0
              );
              rankObj.moves.chargedMoves.sort((a, b) =>
                a.moveId > b.moveId ? -1 : b.moveId > a.moveId ? 1 : 0
              );

              rankings.push(rankObj);
            } else {
              rankings[n].score *= rankObj.score;
              rankings[n].scores.push(rankObj.score);

              if (moveUsageMode === 'aggregate') {
                // Add move usage for all moves
                rankObj.moves.fastMoves.sort((a, b) =>
                  a.moveId > b.moveId ? -1 : b.moveId > a.moveId ? 1 : 0
                );
                rankObj.moves.chargedMoves.sort((a, b) =>
                  a.moveId > b.moveId ? -1 : b.moveId > a.moveId ? 1 : 0
                );

                for (let j = 0; j < rankObj.moves.fastMoves.length; j++) {
                  rankings[n].moves.fastMoves[j].uses += rankObj.moves.fastMoves[j].uses;
                }

                for (let j = 0; j < rankObj.moves.chargedMoves.length; j++) {
                  rankings[n].moves.chargedMoves[j].uses += rankObj.moves.chargedMoves[j].uses;
                }
              }
            }
          }
        }

        // Produce final rankings
        for (let i = 0; i < rankings.length; i++) {
          const r = rankings[i];
          const pokemon = new Pokemon(r.speciesId, 0, battle);
          pokemon.initialize();
          pokemon.selectMove('fast', r.moveset[0]);
          pokemon.selectMove('charged', r.moveset[1], 0);

          // Only calculate with two Charged Moves
          if (r.moveset.length > 2) {
            pokemon.selectMove('charged', r.moveset[2], 1);
          }

          const consistencyScore = pokemon.calculateConsistency();

          // Let's try a different approach to calculating overall score.
          // Weigh the top 2 ratings by 9/20 and the bottom 2 ratings by 1/20.
          // This will better represent specialized Pokemon.
          const scores = [];
          const sortedScores = [];

          for (let n = 0; n < rankings[i].scores.length; n++) {
            scores.push(rankings[i].scores[n]);
          }

          rankings[i].scores.push(consistencyScore);

          if (cup === 'beam') {
            rankings[i].scores.push(beaminess);
          }

          sortedScores.push(scores[0], scores[1], Math.max(scores[2], scores[3]), scores[4]);

          sortedScores.sort((a, b) => (a > b ? -1 : b > a ? 1 : 0));

          rankings[i].score = Math.pow(
            Math.pow(sortedScores[0], 9) *
              Math.pow(sortedScores[1], 7) *
              Math.pow(sortedScores[2], 6) *
              Math.pow(sortedScores[3], 2) *
              Math.pow(consistencyScore, 4),
            1 / 28
          );

          rankings[i].score = Math.floor(rankings[i].score * 10) / 10;
        }

        rankings.sort((a, b) => (a.score > b.score ? -1 : b.score > a.score ? 1 : 0));

        var json = JSON.stringify(rankings);

        console.log(json);

        var json = JSON.stringify(rankings);
        var league = battle.getCP();
        var category = 'overall';

        console.log(`${category}/rankings-${league}.json`);

        // Write to a file
        $.ajax({
          url: 'data/write.php',
          type: 'POST',
          data: {
            data: json,
            league,
            category,
            cup,
          },
          dataType: 'json',
          success(data) {
            console.log(data);
          },
          error(request, error) {
            console.log(`Request: ${JSON.stringify(request)}`);
          },
        });

        // Save beaminess
        if (cup === 'beam') {
          for (let i = 0; i < rankings.length; i++) {
            rankings[i].score = rankings[i].scores[6];
            delete rankings[i].scores;
          }

          rankings.sort((a, b) => (a.score > b.score ? -1 : b.score > a.score ? 1 : 0));

          var json = JSON.stringify(rankings);

          console.log(json);

          var json = JSON.stringify(rankings);
          var league = battle.getCP();
          var category = 'beaminess';

          console.log(`${category}/rankings-${league}.json`);

          // Write to a file
          $.ajax({
            url: 'data/write.php',
            type: 'POST',
            data: {
              data: json,
              league,
              category,
              cup,
            },
            dataType: 'json',
            success(data) {
              console.log(data);
            },
            error(request, error) {
              console.log(`Request: ${JSON.stringify(request)}`);
            },
          });

          return rankings;
        }

        // Save consistency scores
        for (let i = 0; i < rankings.length; i++) {
          rankings[i].score = rankings[i].scores[5];
          delete rankings[i].scores;
        }

        rankings.sort((a, b) => (a.score > b.score ? -1 : b.score > a.score ? 1 : 0));

        var json = JSON.stringify(rankings);

        console.log(json);

        var json = JSON.stringify(rankings);
        var league = battle.getCP();
        var category = 'consistency';

        console.log(`${category}/rankings-${league}.json`);

        // Write to a file
        $.ajax({
          url: 'data/write.php',
          type: 'POST',
          data: {
            data: json,
            league,
            category,
            cup,
          },
          dataType: 'json',
          success(data) {
            console.log(data);
          },
          error(request, error) {
            console.log(`Request: ${JSON.stringify(request)}`);
          },
        });

        return rankings;
      };
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
