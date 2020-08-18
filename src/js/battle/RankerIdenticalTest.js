// JavaScript Document

// This is for testing that all A vs. B matchups produce the same results as B vs. A

const RankerMaster = (function () {
  let instance;

  function createInstance() {
    const object = new RankerObject();

    function RankerObject() {
      const gm = GameMaster.getInstance();
      const battle = new Battle();

      let rankings = [];

      // Run all ranking sets at once
      this.rankLoop = function () {
        const leagues = [1500];
        const shields = [[1, 1]];

        for (let i = 0; i < leagues.length; i++) {
          for (let n = 0; n < shields.length; n++) {
            this.rank(leagues[i], shields[n]);
          }
        }
      };

      // Run an individual rank set
      this.rank = function (league, shields) {
        let totalBattles = 0;
        const pokemonList = [];
        const shieldCounts = shields;
        const cup = battle.getCup();

        rankings = [];

        // Gather all eligible Pokemon
        battle.setCP(league);

        let minCP = 2000; // You must be this tall to ride this ride

        if (battle.getCP() === 1500) {
          minCP = 1200;
        } else if (battle.getCP() === 2500) {
          minCP = 1500;
        }

        // Don't allow these Pokemon into the Great League. They can't be trusted.
        const bannedList = [
          'mewtwo',
          'giratina_altered',
          'groudon',
          'kyogre',
          'garchomp',
          'latios',
          'latias',
          'palkia',
          'dialga',
          'heatran',
          'regice',
          'regirock',
        ];

        // If you want to rank specfic Pokemon, you can enter their species id's here
        const allowedList = [];

        for (let i = 0; i < gm.data.pokemon.length; i++) {
          if (gm.data.pokemon[i].fastMoves.length > 0) {
            // Only add Pokemon that have move data
            const pokemon = new Pokemon(gm.data.pokemon[i].speciesId, 0, battle);

            pokemon.initialize(battle.getCP());

            if (pokemon.cp >= minCP) {
              if (battle.getCP() === 1500 && bannedList.indexOf(pokemon.speciesId) > -1) {
                continue;
              }

              if (allowedList.length > 0 && allowedList.indexOf(pokemon.speciesId) === -1) {
                continue;
              }

              pokemonList.push(pokemon);
            }
          }
        }

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
            totalBattles += 1;

            // Set both Pokemon and auto select their moves
            battle.setNewPokemon(pokemon, 0);
            battle.setNewPokemon(opponent, 1);

            pokemon.autoSelectMoves();
            opponent.autoSelectMoves();

            pokemon.setShields(shieldCounts[0]);
            opponent.setShields(shieldCounts[1]);

            battle.simulate();

            // Calculate Battle Rating for each Pokemon
            const healthRating = pokemon.hp / pokemon.stats.hp;
            const damageRating = (opponent.stats.hp - opponent.hp) / opponent.stats.hp;

            const opHealthRating = opponent.hp / opponent.stats.hp;
            const opDamageRating = (pokemon.stats.hp - pokemon.hp) / pokemon.stats.hp;

            const rating = Math.floor((healthRating + damageRating) * 500);
            const opRating = Math.floor((opHealthRating + opDamageRating) * 500);

            // Search the timeline and store whether or not each charged move was used
            const chargedMovesList = [];
            const oppChargedMovesList = [];
            const timeline = battle.getTimeline();

            for (let k = 0; k < pokemon.chargedMoves.length; k++) {
              let uses = 0;

              for (let j = 0; j < timeline.length; j++) {
                if (timeline[j].name === pokemon.chargedMoves[k].name) {
                  uses = 1;
                }
              }

              chargedMovesList.push({
                moveId: pokemon.chargedMoves[k].moveId,
                uses,
              });
            }

            for (let k = 0; k < opponent.chargedMoves.length; k++) {
              let uses = 0;

              for (let j = 0; j < timeline.length; j++) {
                if (timeline[j].name === opponent.chargedMoves[k].name) {
                  uses = 1;
                }
              }

              oppChargedMovesList.push({
                moveId: opponent.chargedMoves[k].moveId,
                uses,
              });
            }

            // Push final results into the rank object's matches array
            rankObj.matches.push({
              opponent: opponent.speciesId,
              rating,
              opRating,
              moveSet: {
                fastMove: pokemon.fastMove.moveId,
                chargedMoves: chargedMovesList,
              },
              oppMoveSet: {
                fastMove: opponent.fastMove.moveId,
                chargedMoves: oppChargedMovesList,
              },
            });

            avg += rating;

            if (rankings[n]) {
              // When shields are the same, A vs B is the same as B vs A, so take the existing result
              if (rankings[n].matches[i] && shieldCounts[0] === shieldCounts[1]) {
                if (rankings[n].matches[i].opRating !== rating) {
                  console.log(
                    `${pokemon.speciesId} vs. ${opponent.speciesId} ${rating} ${opponent.speciesId} vs. ${pokemon.speciesId} ${rankings[n].matches[i].opRating}`
                  );
                }
              }
            }
          }

          rankings.push(rankObj);
        }

        console.log(`total battles ${totalBattles}`);

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
