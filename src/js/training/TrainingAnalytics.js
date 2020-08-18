// Interface functionality for move list and explorer

const InterfaceMaster = (function () {
  let instance;

  function createInstance() {
    const object = new InterfaceObject();

    function InterfaceObject(matchHandler) {
      // It's matchHandlers all the way down
      const self = this;
      const gm = GameMaster.getInstance();
      const mode = 'tournament'; // Single or tournament
      const teamSelectMethod = 'random'; // Random or manual
      const partySize = 6;
      let battle;
      const roundNumber = 0;
      let pokemonData = []; // Collection of pick and usage rates for all Pokemon

      this.init = function () {
        const { data } = gm;
        battle = new Battle();

        // Load ranking data for movesets
        gm.loadRankingData(self, 'overall', 1500, 'all');

        // Event listeners
        $('.league-cup-select').on('change', selectLeague);
        $('.battle-btn').on('click', startBattle);
        $('a.random').on('click', randomizeTeam);
      };

      // Callback after ranking data is loaded
      this.displayRankingData = function () {
        console.log('Ranking data loaded');
      };

      // Hide setup after initiating battle
      this.close = function () {
        for (let i = 0; i < 4; i++) {
          $('.section').eq(i).slideUp(500);
        }

        $('.section.updates').slideUp(500);

        $('#main h1').slideUp(500);
      };

      // Callback for importing a randomly generated roster
      this.runPickProcess = function () {
        const playerA = new Player(0, 3, battle);
        const playerB = new Player(1, 3, battle);
        const resultSequence = [
          ['win', 'loss'],
          ['win', 'loss'],
          ['loss', 'win'],
        ];

        for (let i = 0; i < 100; i++) {
          playerA.getAI().generateRoster(partySize, self.collectRosterData);
          playerB.getAI().generateRoster(partySize, self.collectRosterData);

          for (let n = 0; n < 3; n++) {
            if (n === 0) {
              playerA.getAI().generateTeam(playerB.getRoster());
              playerB.getAI().generateTeam(playerA.getRoster());
            } else {
              playerA
                .getAI()
                .generateTeam(playerB.getRoster(), resultSequence[n][0], [
                  playerB.getTeam(),
                  playerA.getTeam(),
                ]);
              playerB
                .getAI()
                .generateTeam(playerA.getRoster(), resultSequence[n][1], [
                  playerA.getTeam(),
                  playerB.getTeam(),
                ]);
            }

            self.collectTeamData(playerA.getTeam());
            self.collectTeamData(playerB.getTeam());
          }
        }

        pokemonData.sort((a, b) =>
          a.rosterCount > b.rosterCount ? -1 : b.rosterCount > a.rosterCount ? 1 : 0
        );

        // Display pick data in table
        const $table = $(
          `
						<table>
							<tr>
								<td>Pokemon</td>
								<td>Roster Count</td>
								<td>Pick Count</td>
							</tr>
						</table>
					`
        );

        for (let i = 0; i < pokemonData.length; i++) {
          $table.append(
            `
							<tr>
								<td>${pokemonData[i].speciesId}</td>
								<td>${pokemonData[i].rosterCount}</td>
								<td>${pokemonData[i].pickCount}</td>
							</tr>
						`
          );
        }

        $('#main').append($table);
      };

      // Push team of 6 data into the current collection
      this.collectRosterData = function (roster) {
        // Search data for Pokemon ID
        for (let i = 0; i < roster.length; i++) {
          let found = false;

          for (let n = 0; n < pokemonData.length; n++) {
            if (roster[i].speciesId === pokemonData[n].speciesId) {
              found = true;
              pokemonData[n].rosterCount += 3;
              continue;
            }
          }

          if (!found) {
            pokemonData.push({
              speciesId: roster[i].speciesId,
              rosterCount: 3,
              pickCount: 0,
            });
          }
        }
      };

      // Push team of 3 data into the current collection
      this.collectTeamData = function (team) {
        // Search data for Pokemon ID
        for (let i = 0; i < team.length; i++) {
          for (let n = 0; n < pokemonData.length; n++) {
            if (team[i].speciesId === pokemonData[n].speciesId) {
              found = true;
              pokemonData[n].pickCount += 1;
              continue;
            }
          }
        }
      };

      // Dispatch battle start to the MatchHandler with provided options
      function startBattle() {
        pokemonData = [];

        // Initiate a player to load the training team data
        const player = new Player(0, 3, battle);
        player.getAI().generateRoster(partySize, self.runPickProcess);
      }

      // Event handler for changing the league select
      function selectLeague() {
        const vals = $('.league-cup-select option:selected').val().split(' ');
        const cp = vals[0];
        const cup = vals[1];

        battle.setCP(cp);
        battle.setCup(cup);
      }

      // Give the player a random team
      function randomizeTeam(e) {
        e.preventDefault();

        const difficulty = $('.difficulty-select option:selected').val();
        const player = new Player(0, difficulty, battle);
        player.getAI().generateRoster(partySize, self.importRandomizedRoster);
      }

      // Turn checkboxes on and off
      function checkBox() {
        $(this).toggleClass('on');
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

const myInterface = InterfaceMaster.getInstance();
