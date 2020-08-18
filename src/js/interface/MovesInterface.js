// Interface functionality for move list and explorer

const InterfaceMaster = (function () {
  let instance;

  function createInstance() {
    const object = new InterfaceObject();

    function InterfaceObject() {
      const self = this;
      let data;
      const jumpToMove = false;
      let mode = 'fast';
      const gm = GameMaster.getInstance();
      let table;

      this.init = function () {
        if (!get) {
          this.displayMoves();
        } else {
          this.loadGetData();
        }

        // Add moves to select options
        for (let i = 0; i < gm.data.moves.length; i++) {
          const move = gm.data.moves[i];
          const $option = $(
            `<option type="${move.type}" value="${move.moveId4}">${move.name}</option>`
          );

          if (move.energyGain > 0) {
            $('.move-select.fast').append($option);
          } else {
            $('.move-select.charged').append($option);
          }
        }

        $('.mode-select').on('change', selectMode);
        $('.poke-search').on('keyup change', searchMove);
        $('.move-select').on('change', selectMove);
        $('.effectiveness-select').on('change', self.generateExploreResults);
        $('.check').on('click', checkBox);

        window.addEventListener('popstate', function (e) {
          get = e.state;
          self.loadGetData();
        });
      };

      // Grabs ranking data from the Game Master
      this.displayMoves = function () {
        const data = [];
        const headers = ['Move', 'Type', 'D'];

        if (mode === 'fast') {
          headers.push('E', 'T', 'DPT', 'EPT');
        } else {
          headers.push('E', 'DPE', 'Effects');
        }

        for (let i = 0; i < gm.data.moves.length; i++) {
          const move = gm.data.moves[i];

          if (mode === 'fast' && move.energy > 0) {
            continue;
          } else if (mode === 'charged' && move.energyGain > 0) {
            continue;
          }

          const obj = {
            name: move.name,
            type: move.type,
            power: move.power,
          };

          if (mode === 'fast') {
            obj.energy = move.energyGain;
            obj.duration = move.cooldown / 500;
            obj.dpt = Math.floor((move.power / (move.cooldown / 500)) * 100) / 100;
            obj.ept = Math.floor((move.energyGain / (move.cooldown / 500)) * 100) / 100;
          } else if (mode === 'charged') {
            obj.energy = move.energy;
            obj.dpe = Math.floor((move.power / move.energy) * 100) / 100;
            obj.effects = getStatusEffectString(move);
          }

          // Edge cases
          let valid = true;

          if (move.moveId.indexOf('HIDDEN_POWER') > -1) {
            if (move.moveId === 'HIDDEN_POWER_BUG') {
              obj.name = 'Hidden Power';
              obj.type = 'normal';
            } else {
              valid = false;
            }
          }

          if (move.moveId === 'TRANSFORM' || move.moveId.indexOf('BLASTOISE') > -1) {
            valid = false;
          }

          if (valid) {
            data.push(obj);
          }
        }

        table = new SortableTable(
          $('.sortable-table.moves'),
          headers,
          data,
          self.tableSortCallback
        );
        table.sortAndDisplayData('name', true);

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

      // When moves are selected, show the resulting data
      this.generateExploreResults = function (moveChange = false) {
        const fastMoveId = $('.move-select.fast option:selected').val();
        const chargedMoveId = $('.move-select.charged option:selected').val();
        let selectedCount = 0;

        if (fastMoveId !== '' || chargedMoveId !== '') {
          selectedCount = 1;

          if (fastMoveId !== '' && chargedMoveId !== '') {
            selectedCount = 2;
          }
        }

        // Return if no moves are selected
        if (selectedCount === 0) {
          $('.explore-results').hide();
          return false;
        }

        $('.explore-results').show();
        $('.explore-results .moveset-stats').html('');

        // Gather all relevant moveset stats and push them over here
        const movesetStats = [];

        if (selectedCount === 2) {
          const fastMove = gm.getMoveById(fastMoveId);
          const chargedMove = gm.getMoveById(chargedMoveId);

          const fastMultipliers =
            parseFloat($('.effectiveness-select.fast option:selected').val()) *
            ($('.stab.check.fast').hasClass('on') ? 1.2 : 1);
          const chargedMultipliers =
            parseFloat($('.effectiveness-select.charged option:selected').val()) *
            ($('.stab.check.charged').hasClass('on') ? 1.2 : 1);

          const fastMovesPerCycle = Math.ceil(chargedMove.energy / fastMove.energyGain);
          const cycleDuration = fastMovesPerCycle * fastMove.cooldown + 500;
          const cycleDurationStr = `${cycleDuration / 500} turns (${cycleDuration / 1000} s)`;
          const fastDamage =
            Math.round(fastMovesPerCycle * fastMove.power * fastMultipliers * 10) / 10;
          const chargedDamage = Math.round(chargedMove.power * chargedMultipliers * 10) / 10;
          const cycleDamage = Math.round((fastDamage + chargedDamage) * 10) / 10;
          const cycleDPT = Math.round((cycleDamage / (cycleDuration / 500)) * 100) / 100;

          movesetStats.push({ title: 'Fast Damage', value: fastDamage });
          movesetStats.push({ title: 'Charged Damage', value: chargedDamage });
          movesetStats.push({ title: 'Total Damage', value: cycleDamage });
          movesetStats.push({ title: 'Fast Moves', value: fastMovesPerCycle });
          movesetStats.push({
            title: 'Cycle Duration',
            value: cycleDurationStr,
          });
          movesetStats.push({ title: 'Damage Per Turn', value: cycleDPT });
        }

        // Display moveset stats
        for (var i = 0; i < movesetStats.length; i++) {
          const $stat = $(
            `
              <div class="stat">
                <h3>${movesetStats[i].title}</h3>
                <span>${movesetStats[i].value}</span>
              </div>
            `
          );

          $('.explore-results .moveset-stats').append($stat);
        }

        // Search for all Pokemon who know these moves
        if (moveChange) {
          $('.explore-results .rankings-container').html('');

          for (let i = 0; i < gm.data.pokemon.length; i++) {
            const pokemon = gm.data.pokemon[i];
            let valid = true;

            if (pokemon.shadow) {
              pokemon.chargedMoves.push('RETURN', 'FRUSTRATION');
            }

            if (fastMoveId !== '' && pokemon.fastMoves.indexOf(fastMoveId) === -1) {
              valid = false;
            }

            if (chargedMoveId !== '' && pokemon.chargedMoves.indexOf(chargedMoveId) === -1) {
              valid = false;
            }

            let isLegacy = false;

            if (
              pokemon.legacyMoves &&
              (pokemon.legacyMoves.indexOf(fastMoveId) > -1 ||
                pokemon.legacyMoves.indexOf(chargedMoveId) > -1)
            ) {
              isLegacy = true;
            }

            if (valid) {
              const rankLink = `${host}rankings/all/1500/overall/${pokemon.speciesId}`;

              const $rank = $(
                `
                  <a href="${rankLink}" target="_blank" class="rank ${pokemon.types[0]}">
                    <div class="name-container">
                      <span class="name">${pokemon.speciesName} ${isLegacy ? '*' : ''}</span>
                    </div>
                  </a>
                `
              );

              $('.explore-results .rankings-container').append($rank);
            }
          }
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
          const searches = $(this).val().toLowerCase().split(',');

          $('.stats-table.moves tr').hide();
          $('.stats-table.moves tr').eq(0).show();

          $('.stats-table.moves tr').each((index) => {
            for (let i = 0; i < searches.length; i++) {
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

              if (types.indexOf(searches[i]) === -1) {
                // Name search
                const moveName = $(this).find('td').first().html().toLowerCase();

                if (moveName.startsWith(searches[i])) {
                  show = true;
                }
              } else {
                // Type search
                if (
                  $(this).find('td').eq(1).find('span').html().toLocaleLowerCase() === searches[i]
                ) {
                  show = true;
                }
              }

              if (show) {
                $(this).show();
              }
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

      // Turn checkboxes on and off
      function checkBox() {
        $(this).toggleClass('on');

        if ($(this).hasClass('stab')) {
          self.generateExploreResults(false);
        }
      }

      // Get status effect string from move
      function getStatusEffectString(move) {
        if (!move.buffs) {
          return '';
        }
        const atk = getStatusEffectStatString(move.buffs[0], 'Atk');
        const def = getStatusEffectStatString(move.buffs[1], 'Def');
        const buffApplyChance = `${parseFloat(move.buffApplyChance) * 100}%`;
        const { buffTarget } = move;
        const stringArray = [buffApplyChance, atk, def, buffTarget];
        for (let i = 0; i < stringArray.length; i++) {
          stringArray[i] = `<div class="status-effect-description">${stringArray[i]}</div>`;
        }
        return stringArray.join('');
      }

      // Get stats string from move for status effects
      function getStatusEffectStatString(stat, type) {
        if (stat === 0) {
          return '';
        }
        let statString = stat;
        if (stat > 0) {
          statString = `+${statString}`;
        }
        return `${statString} ${type}`;
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
