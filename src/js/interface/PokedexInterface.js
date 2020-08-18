// Interface functionality for move list and explorer

const InterfaceMaster = (function () {
  let instance;

  function createInstance() {
    const object = new InterfaceObject();

    function InterfaceObject() {
      const self = this;
      let data;
      const gm = GameMaster.getInstance();
      let table;
      const battle = new Battle();

      this.init = function () {
        if (!get) {
          this.displayPokemon();
        } else {
          this.loadGetData();
        }

        $('.league-select').on('change', selectLeague);
        $('.poke-search').on('keyup change', searchMove);

        window.addEventListener('popstate', function (e) {
          get = e.state;
          self.loadGetData();
        });
      };

      // Grabs ranking data from the Game Master
      this.displayPokemon = function () {
        const data = [];
        const headers = ['#', 'Pokemon', 'Types', 'HP', 'Atk', 'Def', 'Overall'];

        for (let i = 0; i < gm.data.pokemon.length; i++) {
          const pokemon = new Pokemon(gm.data.pokemon[i].speciesId, 0, battle);
          pokemon.initialize();

          const obj = {
            dex: pokemon.dex,
            name: pokemon.speciesName,
            type: pokemon.types[0],
            hp: pokemon.stats.hp,
            atk: Math.round(pokemon.stats.atk * 10) / 10,
            def: Math.round(pokemon.stats.def * 10) / 10,
            overall: Math.round((pokemon.stats.hp * pokemon.stats.atk * pokemon.stats.def) / 1000),
          };

          data.push(obj);
        }

        table = new SortableTable(
          $('.sortable-table.pokemon'),
          headers,
          data,
          self.tableSortCallback
        );
        table.sortAndDisplayData('dex', true);

        // Filter table if search string is set
        if ($('.poke-search').val() !== '') {
          $('.poke-search').trigger('keyup');
        }

        $('.loading').hide();
      };

      // Given JSON of get parameters, load these settings
      this.loadGetData = function () {
        if (!get) {
          return false;
        }

        // Cycle through parameters and set them
        for (const key in get) {
          if (get.hasOwnProperty(key)) {
            const val = get[key];

            // Process each type of parameter
            switch (key) {
              // Don't process default values so data doesn't needlessly reload
              case 'mode':
                $(`.mode-select option[value="${val}"]`).prop('selected', 'selected');

                setTimeout(() => {
                  $('.mode-select').trigger('change');
                }, 50);
                break;

              default:
                break;
            }
          }
        }
      };

      // When the view state changes, push to browser history so it can be navigated forward or back
      this.pushHistoryState = function (moveMode) {
        const url = `${webRoot}moves/${moveMode}/`;
        const data = { mode };

        window.history.pushState(data, 'Moves', url);

        // Send Google Analytics pageview
        gtag('config', UA_ID, { page_location: host + url, page_path: url });
      };

      // Refilter moves after being sorted
      this.tableSortCallback = function () {
        if ($('.poke-search').val() !== '') {
          $('.poke-search').trigger('keyup');
        }
      };

      // Event handler for changing the league select
      function selectMode() {
        mode = $('.mode-select option:selected').val();

        if (mode !== 'explore') {
          $('.explore').hide();
          $('.stats-table .charged, .stats-table .fast').hide();
          $(`.stats-table .${mode}`).show();
          $('.move-table-container').show();

          self.displayMoves();
        } else {
          $('.move-table-container').hide();
          $('.explore').show();
          $('.loading').hide();
        }

        self.pushHistoryState(mode);
      }

      // Search for a move in the table or to select
      function searchMove() {
        const val = $(this).val().toLowerCase();

        if (mode === 'fast' || mode === 'charged') {
          // Search for a move in the table
          $('.stats-table.moves tr').each((index) => {
            // Don't filter out the headers
            if (index === 0) {
              return;
            }

            let show = false;
            const types = [
              'bug',
              'dark',
              'dragon',
              'electric',
              'fairy',
              'fighting',
              'fire',
              'flying',
              'ghost',
              'grass',
              'ground',
              'ice',
              'normal',
              'poison',
              'psychic',
              'rock',
              'steel',
              'water',
            ];

            if (types.indexOf(val) === -1) {
              // Name search
              const moveName = $(this).find('td').first().html().toLowerCase();

              if (moveName.startsWith(val)) {
                show = true;
              }
            } else {
              // Type search
              if ($(this).find('td').eq(1).find('span').html().toLocaleLowerCase() === val) {
                show = true;
              }
            }

            if (show) {
              $(this).show();
            } else {
              $(this).hide();
            }
          });
        }

        // Explorer move search
        if (mode === 'explore') {
          const $select = $(this).next('.move-select');

          $select.find('option').each(() => {
            const moveName = $(this).html().toLowerCase();

            if (moveName.startsWith(val)) {
              $(this).prop('selected', 'selected');
              $select.trigger('change');
              return false;
            }
          });
        }
      }

      // Select a move in the move explorer dropdown
      function selectMove() {
        if (mode !== 'explore') {
          return;
        }

        const val = $(this).find('option:selected').val();
        const type = $(this).find('option:selected').attr('type');

        // Reset classes
        if ($(this).hasClass('fast')) {
          $(this).attr('class', 'move-select fast');
        } else {
          $(this).attr('class', 'move-select charged');
        }

        // Add class for the move's type
        $(this).addClass(type);

        self.generateExploreResults(true);
      }

      // Event handler for changing the league select
      function selectLeague() {
        const allowed = [1500, 2500, 10000];
        const cp = parseInt($('.league-select option:selected').val());

        if (allowed.indexOf(cp) > -1) {
          battle.setCP(cp);

          for (let i = 0; i < pokeSelectors.length; i++) {
            pokeSelectors[i].setBattle(battle);
            pokeSelectors[i].setCP(cp);
          }

          multiSelector.updateLeague(cp);
        }
      }

      // Turn checkboxes on and off
      function checkBox() {
        $(this).toggleClass('on');

        if ($(this).hasClass('stab')) {
          self.generateExploreResults(false);
        }
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
