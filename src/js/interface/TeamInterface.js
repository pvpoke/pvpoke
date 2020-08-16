// JavaScript Document

const InterfaceMaster = (function () {
  let instance;

  function createInstance() {
    const object = new InterfaceObject();

    function InterfaceObject() {
      let gm;
      let battle;
      const pokeSelectors = [];
      const multiSelectors = [
        new PokeMultiSelect($('.team .poke.multi')),
        new PokeMultiSelect($('.custom-threats .poke.multi')),
        new PokeMultiSelect($('.custom-alternatives .poke.multi')),
      ];
      let results; // Store team matchup results for later reference
      const self = this;
      let runningResults = false;

      const histograms = [];

      this.context = 'team';

      this.init = function () {
        gm = GameMaster.getInstance();
        const { data } = gm;

        battle = new Battle();

        // Initialize selectors and push Pokemon data
        $('.poke.single').each((index) => {
          const selector = new PokeSelect($(this), index);
          pokeSelectors.push(selector);

          selector.init(data.pokemon, battle);
        });

        for (let i = 0; i < multiSelectors.length; i++) {
          multiSelectors[i].init(data.pokemon, battle);
        }

        multiSelectors[0].setMaxPokemonCount(6);

        $('.league-select').on('change', selectLeague);
        $('.cup-select').on('change', selectCup);
        $('.format-select').on('change', selectFormat);
        $('.rate-btn').on('click', rateClick);
        $('.print-scorecard').on('click', printScorecard);
        $('body').on('click', '.alternatives-table .button.add', addAlternativePokemon);
        $('body').on('click', '.check', checkBox);

        // If get data exists, load settings
        this.loadGetData();

        // Load rankings for the current league
        if (!get) {
          gm.loadRankingData(
            self,
            'overall',
            parseInt($('.league-select option:selected').val()),
            'all'
          );
        }

        window.addEventListener('popstate', (e) => {
          get = e.state;
          self.loadGetData();
        });
      };

      // Given JSON of get parameters, load these settings
      this.loadGetData = function () {
        // Clear all currently selected Pokemon
        for (let i = 0; i < pokeSelectors.length; i++) {
          pokeSelectors[i].clear();
        }

        $('.section.typings').hide();

        if (!get) {
          return false;
        }

        // Cycle through parameters and set them
        for (const key in get) {
          if (get.hasOwnProperty(key)) {
            const val = get[key];

            // Process each type of parameter
            switch (key) {
              case 't':
                // Add each team member to the multi-selector
                const list = val.split(',');
                const pokeList = [];

                for (let i = 0; i < list.length; i++) {
                  let arr = list[i].split('-');
                  const pokemon = new Pokemon(arr[0], index, battle);

                  pokemon.initialize(battle.getCP());

                  if (arr.length >= 8) {
                    pokemon.setIV('atk', arr[2]);
                    pokemon.setIV('def', arr[3]);
                    pokemon.setIV('hp', arr[4]);
                    pokemon.setLevel(arr[1]);
                  }

                  // Check string for other parameters
                  for (let n = 0; n < arr.length; n++) {
                    switch (arr[n]) {
                      case 'shadow':
                      case 'purified':
                        pokemon.setShadowType(arr[n]);
                        break;
                    }
                  }

                  // Split out the move string and select moves

                  const moveStr = list[i].split('-m-')[1];
                  arr = moveStr.split('-');

                  // Search string for any custom moves
                  const customMoveIndexes = [];

                  for (let n = 0; n < arr.length; n++) {
                    if (arr[n].match('([A-Z_]+)')) {
                      const move = gm.getMoveById(arr[i]);
                      const movePool =
                        move.energyGain > 0 ? pokemon.fastMovePool : pokemon.chargedMovePool;
                      const moveType = move.energyGain > 0 ? 'fast' : 'charged';
                      let moveIndex = 0;

                      if (arr[i + 1]) {
                        moveIndex = parseInt(arr[i + 1]);
                      }

                      pokemon.addNewMove(arr[i], movePool, true, moveType, moveIndex);
                      customMoveIndexes.push(moveIndex);
                    }
                  }

                  pokemon.selectMove('fast', pokemon.fastMovePool[arr[0]].moveId, 0);

                  for (let n = 1; n < arr.length; n++) {
                    // Don't set this move if already set as a custom move
                    if (customMoveIndexes.indexOf(n - 1) > -1) {
                      continue;
                    }

                    let moveId = 'none';

                    if (arr[n] > 0) {
                      moveId = pokemon.chargedMovePool[arr[n] - 1].moveId;
                    }

                    if (moveId !== 'none') {
                      pokemon.selectMove('charged', moveId, n - 1);
                    } else {
                      if (arr[1] === '0' && arr[2] === '0') {
                        // Always deselect the first move because removing it pops the 2nd move up
                        pokemon.selectMove('charged', moveId, 0);
                      } else {
                        pokemon.selectMove('charged', moveId, n - 1);
                      }
                    }
                  }

                  pokeList.push(pokemon);
                }

                multiSelectors[0].setPokemonList(pokeList);
                break;

              case 'cp':
                $(`.league-select option[value="${val}"]`).prop('selected', 'selected');
                $('.league-select').trigger('change');
                break;

              case 'cup':
                $(`.cup-select option[value="${val}"]`).prop('selected', 'selected');

                if ($(`.format-select option[cup="${val}"]`).length > 0) {
                  $(`.format-select option[cup="${val}"]`).prop('selected', 'selected');
                } else {
                  const cat = $(`.cup-select option[value="${val}"]`).attr('cat');
                  $(`.format-select option[value="${cat}"]`).prop('selected', 'selected');
                  selectFormat();

                  $(`.cup-select option[value="${val}"]`).prop('selected', 'selected');
                }

                const cup = $('.cup-select option:selected').val();

                if (cup === 'sorcerous') {
                  $('#main h1').html('Team Wizard');
                }

                if (cup === 'cliffhanger') {
                  multiSelectors[0].setCliffhangerMode(true);
                }
                battle.setCup(cup);
                break;

              case 'm1':
              case 'm2':
              case 'm3':
                let index = 0;

                if (key === 'm2') {
                  index = 1;
                } else if (key === 'm3') {
                  index = 2;
                }

                const poke = pokeSelectors[index].getPokemon();
                let arr = val.split('-');

                // Legacy move construction
                if (arr.length <= 1) {
                  arr = val.split('');
                }

                // Search string for any custom moves to add
                const customMoveIndexes = [];

                for (let i = 0; i < arr.length; i++) {
                  if (arr[i].match('([A-Z_]+)')) {
                    const move = gm.getMoveById(arr[i]);
                    const movePool = move.energyGain > 0 ? poke.fastMovePool : poke.chargedMovePool;
                    const moveType = move.energyGain > 0 ? 'fast' : 'charged';
                    let moveIndex = 0;

                    if (arr[i + 1]) {
                      moveIndex = parseInt(arr[i + 1]);
                    }

                    poke.addNewMove(arr[i], movePool, true, moveType, moveIndex);
                    customMoveIndexes.push(moveIndex);
                  }
                }

                const fastMoveId = $('.poke')
                  .eq(index)
                  .find('.move-select.fast option')
                  .eq(parseInt(arr[0]))
                  .val();
                poke.selectMove('fast', fastMoveId, 0);

                for (let i = 1; i < arr.length; i++) {
                  // Don't set this move if already set as a custom move
                  if (customMoveIndexes.indexOf(i - 1) > -1) {
                    continue;
                  }

                  const moveId = $('.poke')
                    .eq(index)
                    .find('.move-select.charged')
                    .eq(i - 1)
                    .find('option')
                    .eq(parseInt(arr[i]))
                    .val();

                  if (moveId !== 'none') {
                    poke.selectMove('charged', moveId, i - 1);
                  } else if (arr[1] === '0' && arr[2] === '0') {
                    // Always deselect the first move because removing it pops the 2nd move up
                    poke.selectMove('charged', moveId, 0);
                  } else {
                    poke.selectMove('charged', moveId, i - 1);
                  }
                }

                break;

              default:
                break;
            }
          }
        }

        // Update both Pokemon selectors
        for (let i = 0; i < pokeSelectors.length; i++) {
          pokeSelectors[i].update();
        }

        // Auto run the battle
        $('.rate-btn').trigger('click');
      };

      // Callback for loading ranking data
      this.displayRankingData = function () {
        console.log('Ranking data loaded');

        if (runningResults) {
          self.updateTeamResults();

          $('html, body').animate(
            {
              scrollTop: $('.section.typings a').first().offset().top,
            },
            500
          );

          $('.rate-btn').html('Rate Team');
        }
      };

      // Update team info output
      this.updateTeamResults = function () {
        const key = `${battle.getCup().name}overall${battle.getCP()}`;

        if (!gm.rankings[key]) {
          runningResults = true;
          gm.loadRankingData(self, 'overall', battle.getCP(), battle.getCup().name);
          return false;
        }

        // Gather advanced settings
        const scorecardCount = parseInt($('.scorecard-length-select option:selected').val());
        const allowShadows = $('.team-option .check.allow-shadows').hasClass('on');
        const baitShields = $('.team-option .check.shield-baiting').hasClass('on');

        // Get team and validate results
        const team = multiSelectors[0].getPokemonList();

        if (team.length === 0) {
          $('.section.error').show();
          return false;
        }

        // Process defensive and offensive matchups
        const defenseArr = [];
        const offenseArr = [];

        for (let i = 0; i < team.length; i++) {
          const poke = team[i];

          defenseArr.push({
            name: poke.speciesName,
            type: poke.types[0],
            matchups: this.getTypeEffectivenessArray(poke.types, 'defense'),
          });

          // Gather offensive matchups for fast move
          offenseArr.push({
            name: poke.fastMove.name,
            type: poke.fastMove.type,
            matchups: this.getTypeEffectivenessArray([poke.fastMove.type], 'offense'),
          });

          // Gather offensive matchups for all charged moves
          for (let n = 0; n < poke.chargedMoves.length; n++) {
            offenseArr.push({
              name: poke.chargedMoves[n].name,
              type: poke.chargedMoves[n].type,
              matchups: this.getTypeEffectivenessArray([poke.chargedMoves[n].type], 'offense'),
            });
          }
        }

        // Display data
        $('.typings').show();

        this.displayArray(defenseArr, 'defense');
        this.displayArray(offenseArr, 'offense');
        this.generateSummaries(defenseArr, offenseArr);

        // Generate counters and histograms, and display that, too
        const ranker = RankerMaster.getInstance();
        ranker.setShieldMode('average');
        ranker.applySettings(
          {
            shields: 1,
            ivs: 'original',
            bait: baitShields,
          },
          0
        );
        ranker.applySettings(
          {
            shields: 1,
            ivs: 'original',
            bait: baitShields,
          },
          1
        );

        // Set targets for custom threats
        if (multiSelectors[1].getPokemonList().length > 0) {
          ranker.setTargets(multiSelectors[1].getPokemonList());
        }

        const data = ranker.rank(team, battle.getCP(), battle.getCup(), [], 'team-counters');
        const counterRankings = data.rankings;
        const { teamRatings } = data;
        const counterTeam = [];

        // Clear targets so it will default to the normal format if the user changes settings
        ranker.setTargets([]);
        results = counterRankings;

        // Let's start with the histograms, because they're kinda neat
        for (let i = 0; i < team.length; i++) {
          if (histograms.length <= i) {
            const histogram = new BattleHistogram($('.histogram').eq(i));
            histogram.generate(team[i], teamRatings[i]);

            histograms.push(histogram);
          } else {
            histograms[i].generate(team[i], teamRatings[i]);
          }
        }

        // Potential threats
        let csv = ','; // CSV data of all matchups
        $('.section.typings .rankings-container').html('');
        $('.threats-table').html('');
        $('.meta-table').html('');

        var $row = $(
          `
						<thead>
							<tr>
								<td></td>
							</tr>
						</thead>
					`
        );

        for (let n = 0; n < team.length; n++) {
          $row.find('tr').append(`<td class="name-small">${team[n].speciesName}</td>`);

          csv += `${team[n].speciesName} ${team[n].generateMovesetStr()}`;
          if (n < team.length - 1) {
            csv += ',';
          }
        }

        csv += ',Threat Score,Overall Rating';

        $('.threats-table').append($row);
        $('.meta-table').append($row.clone());
        $('.threats-table').append('<tbody></tbody>');
        $('.meta-table').append('<tbody></tbody>');

        let avgThreatScore = 0;
        let count = 0;
        let total = scorecardCount;
        let i = 0;

        while (count < total && i < counterRankings.length) {
          const r = counterRankings[i];

          if (r.speciesId.indexOf('_shadow') > -1 && !allowShadows) {
            i += 1;
            continue;
          }

          const pokemon = new Pokemon(r.speciesId, 1, battle);
          pokemon.initialize(true);

          // Manually set moves if previously selected, otherwise autoselect
          let moveNameStr = '';

          if (r.moveset) {
            pokemon.selectMove('fast', r.moveset.fastMove.moveId);

            moveNameStr = r.moveset.fastMove.name;

            for (let n = 0; n < r.moveset.chargedMoves.length; n++) {
              pokemon.selectMove('charged', r.moveset.chargedMoves[n].moveId, n);

              moveNameStr += `, ${r.moveset.chargedMoves[n].name}`;
            }
          }

          // Display threat score
          if (count < 20) {
            avgThreatScore += r.score;
          }

          // Push to counter team
          if (count < 6) {
            counterTeam.push(pokemon);
          }

          // Add results to threats table
          $row = $(
            `
							<tr>
								<th class="name">
									<b>${count + 1}. ${pokemon.speciesName}</b>
								</th>
							</tr>
						`
          );

          for (let n = 0; n < r.matchups.length; n++) {
            const $cell = $(
              `
								<td>
									<a class="rating" href="#" target="blank">
										<span></span>
									</a>
								</td>
							`
            );

            const { rating } = r.matchups[n];

            if (rating === 500) {
              $cell.find('a').addClass('tie');
            } else if (rating < 500 && rating > 250) {
              $cell.find('a').addClass('close-loss');
            } else if (rating <= 250) {
              $cell.find('a').addClass('loss');
            } else if (rating > 500 && rating < 750) {
              $cell.find('a').addClass('close-win');
            } else if (rating >= 750) {
              $cell.find('a').addClass('win');
            }

            if (!baitShields) {
              pokemon.isCustom = true;
              pokemon.baitShields = false;
              r.matchups[n].opponent.isCustom = true;
              r.matchups[n].opponent.baitShields = false;
            }

            const pokeStr = pokemon.generateURLPokeStr();
            const moveStr = pokemon.generateURLMoveStr();
            const opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
            const opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
            const battleLink = `${host}battle/${battle.getCP()}/${pokeStr}/${opPokeStr}/11/${moveStr}/${opMoveStr}/`;
            $cell.find('a').attr('href', battleLink);

            $row.append($cell);
          }

          i += 1;
          count += 1;

          $('.threats-table tbody').append($row);
        }

        // Display average threat score
        avgThreatScore = Math.round(avgThreatScore / 400);
        $('.threat-score').html(avgThreatScore);

        // Build CSV results
        for (let i = 0; i < counterRankings.length; i++) {
          const r = counterRankings[i];
          csv += '\n';
          csv += `${r.speciesName} ${r.pokemon.generateMovesetStr()},`;

          for (let n = 0; n < r.matchups.length; n++) {
            csv += r.matchups[n].rating;

            if (n < r.matchups.length - 1) {
              csv += ',';
            }
          }

          csv += `,${Math.round(r.score / 2) / 10},${r.overall}`;
        }

        // Display meta scorecard
        if (multiSelectors[1].getPokemonList().length === 0) {
          counterRankings.sort((a, b) =>
            a.overall > b.overall ? -1 : b.overall > a.overall ? 1 : 0
          );
        } else {
          counterRankings.sort((a, b) =>
            a.speciesName > b.speciesName ? 1 : b.speciesName > a.speciesName ? -1 : 0
          );
        }

        count = 0;
        total = scorecardCount;
        i = 0;

        while (count < total && i < counterRankings.length) {
          const r = counterRankings[i];

          if (r.speciesId.indexOf('_shadow') > -1 && !allowShadows) {
            i += 1;
            continue;
          }

          const pokemon = new Pokemon(r.speciesId, 1, battle);
          pokemon.initialize(true);

          // Manually set moves if previously selected, otherwise autoselect
          let moveNameStr = '';

          if (r.moveset) {
            pokemon.selectMove('fast', r.moveset.fastMove.moveId);

            moveNameStr = r.moveset.fastMove.name;

            for (let n = 0; n < r.moveset.chargedMoves.length; n++) {
              pokemon.selectMove('charged', r.moveset.chargedMoves[n].moveId, n);

              moveNameStr += `, ${r.moveset.chargedMoves[n].name}`;
            }
          }

          // Add results to meta table
          $row = $(
            `
							<tr>
								<th class="name">
									<b>${pokemon.speciesName}</b>
								</th>
							</tr>
						`
          );

          for (let n = 0; n < r.matchups.length; n++) {
            const $cell = $(
              `
								<td>
									<a class="rating" href="#" target="blank">
										<span></span>
									</a>
								</td>
							`
            );

            const { rating } = r.matchups[n];

            if (rating === 500) {
              $cell.find('a').addClass('tie');
            } else if (rating < 500 && rating > 250) {
              $cell.find('a').addClass('close-loss');
            } else if (rating <= 250) {
              $cell.find('a').addClass('loss');
            } else if (rating > 500 && rating < 750) {
              $cell.find('a').addClass('close-win');
            } else if (rating >= 750) {
              $cell.find('a').addClass('win');
            }

            if (!baitShields) {
              pokemon.isCustom = true;
              pokemon.baitShields = false;
              r.matchups[n].opponent.isCustom = true;
              r.matchups[n].opponent.baitShields = false;
            }

            const pokeStr = pokemon.generateURLPokeStr();
            const moveStr = pokemon.generateURLMoveStr();
            const opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
            const opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
            const battleLink = `${host}battle/${battle.getCP()}/${pokeStr}/${opPokeStr}/11/${moveStr}/${opMoveStr}/`;
            $cell.find('a').attr('href', battleLink);

            $row.append($cell);
          }

          i += 1;
          count += 1;

          $('.meta-table tbody').append($row);
        }

        // And for kicks, generate the counters to those counters
        const exclusionList = []; // Exclude the current team from the alternative results

        for (let i = 0; i < team.length; i++) {
          exclusionList.push(team[i].speciesId);
        }

        // In Cliffhanger, exclude Pokemon that would put the team over the point limit
        let tiers = [];

        if (battle.getCup().name === 'cliffhanger') {
          const cliffObj = multiSelectors[0].calculateCliffhangerPoints();
          const remainingPoints = cliffObj.max - cliffObj.points;
          tiers = cliffObj.tiers;

          // Add ineligible tiers to the exclusion list
          for (let i = 0; i < tiers.length; i++) {
            if (remainingPoints < tiers[i].points) {
              for (let n = 0; n < tiers[i].pokemon.length; n++) {
                exclusionList.push(tiers[i].pokemon[n]);
                exclusionList.push(`${tiers[i].pokemon[n]}_shadow`);
              }
            }
          }
        }

        // For Season 2 continentals, exclude Pokemon in already occupied slots
        if (battle.getCup().name === 'continentals-2' && team.length < 6) {
          // Add ineligible Pokemon to the exclusion list
          const { slots } = battle.getCup();

          for (let i = 0; i < slots.length; i++) {
            for (let n = 0; n < team.length; n++) {
              if (slots[i].pokemon.indexOf(team[n].speciesId) > -1) {
                for (let j = 0; j < slots[i].pokemon.length; j++) {
                  exclusionList.push(slots[i].pokemon[j]);
                }

                continue;
              }
            }
          }
        }

        // Set targets for custom alternatives
        if (multiSelectors[2].getPokemonList().length > 0) {
          ranker.setTargets(multiSelectors[2].getPokemonList());
        }

        const altRankings = ranker.rank(counterTeam, battle.getCP(), battle.getCup(), exclusionList)
          .rankings;

        // Clear targets so it will default to the normal format if the user changes settings
        ranker.setTargets([]);

        $('.alternatives-table').html('');

        var $row = $(
          `
						<thead>
							<tr>
								<td></td>
							</tr>
						</thead>
					`
        );

        for (let n = 0; n < counterTeam.length; n++) {
          $row.find('tr').append(`<td class="name-small">${counterTeam[n].speciesName}</td>`);
        }

        $('.alternatives-table').append($row);
        $('.alternatives-table').append('<tbody></tbody>');

        count = 0;
        total = scorecardCount;
        i = 0;

        while (count < total && i < altRankings.length) {
          const r = altRankings[i];

          if (r.speciesId.indexOf('_shadow') > -1 && !allowShadows) {
            i += 1;
            continue;
          }

          const pokemon = new Pokemon(r.speciesId, 1, battle);

          // Manually set moves if previously selected, otherwise autoselect
          let moveNameStr = '';

          if (r.moveset) {
            pokemon.selectMove('fast', r.moveset.fastMove.moveId);

            moveNameStr = r.moveset.fastMove.name;

            for (let n = 0; n < r.moveset.chargedMoves.length; n++) {
              pokemon.selectMove('charged', r.moveset.chargedMoves[n].moveId, n);

              moveNameStr += `, ${r.moveset.chargedMoves[n].name}`;
            }
          }

          // Add results to alternatives table
          $row = $(
            `
							<tr>
								<th class="name">
									<b>
										${count + 1}. ${pokemon.speciesName}
										<div class="button add" pokemon="${pokemon.speciesId}">+</div>
									</b>
								</th>
							</tr>
						`
          );

          for (let n = 0; n < r.matchups.length; n++) {
            const $cell = $(
              `
								<td>
									<a class="rating" href="#" target="blank">
										<span></span>
									</a>
								</td>
							`
            );

            const { rating } = r.matchups[n];

            if (rating === 500) {
              $cell.find('a').addClass('tie');
            } else if (rating < 500 && rating > 250) {
              $cell.find('a').addClass('close-loss');
            } else if (rating <= 250) {
              $cell.find('a').addClass('loss');
            } else if (rating > 500 && rating < 750) {
              $cell.find('a').addClass('close-win');
            } else if (rating >= 750) {
              $cell.find('a').addClass('win');
            }

            if (!baitShields) {
              pokemon.isCustom = true;
              pokemon.baitShields = false;
              r.matchups[n].opponent.isCustom = true;
              r.matchups[n].opponent.baitShields = false;
            }

            const pokeStr = pokemon.generateURLPokeStr();
            const moveStr = pokemon.generateURLMoveStr();
            const opPokeStr = r.matchups[n].opponent.generateURLPokeStr();
            const opMoveStr = r.matchups[n].opponent.generateURLMoveStr();
            const battleLink = `${host}battle/${battle.getCP()}/${pokeStr}/${opPokeStr}/11/${moveStr}/${opMoveStr}/`;
            $cell.find('a').attr('href', battleLink);

            $row.append($cell);
          }

          // Add region for alternative Pokemon for Voyager
          if (battle.getCup().name === 'voyager') {
            const regions = gm.data.pokemonRegions;
            let regionName = '';
            let regionNumber = '';

            for (let j = 0; j < regions.length; j++) {
              if (pokemon.dex >= regions[j].dexStart && pokemon.dex >= regions[j].dexStart) {
                regionName = regions[j].name;
                regionNumber = `Gen ${j + 1}`;

                if (j > 3) {
                  regionNumber = 'Gen 5+';
                }
              }

              if (pokemon.hasTag('alolan')) {
                regionName = 'Alola';
                regionNumber = 'Gen 5+';
              }

              if (pokemon.hasTag('galarian') || pokemon.speciesId === 'melmetal') {
                regionName = 'Galar';
                regionNumber = 'Gen 5+';
              }
            }

            $row.find('th.name').append(
              `
								<div class="region-label ${regionName.toLowerCase()}">
									${regionName} (${regionNumber})
								</div>
							`
            );
          }

          // Add points for alternative Pokemon for Cliffhanger
          if (battle.getCup().name === 'cliffhanger') {
            let tierName = '';
            let pointsName = 'points';
            const searchId = pokemon.speciesId.replace('_shadow', '');
            let points = 0;

            for (let j = 0; j < tiers.length; j++) {
              if (tiers[j].pokemon.indexOf(searchId) > -1) {
                // Being sneaky here and borrowing Voyager Cup name colors
                tierName = gm.data.pokemonRegions[j].name;
                points = tiers[j].points;
                break;
              }
            }

            if (points === 1) {
              pointsName = 'point';
            }

            $row.find('th.name').append(
              `
								<div class="region-label ${tierName.toLowerCase()}">
									${points} ${pointsName}
								</div>
							`
            );
          }

          // Add slot label for Continentals
          if (battle.getCup().name === 'continentals-2') {
            const tierName = '';
            let slot = 0;

            const { slots } = battle.getCup();

            for (let j = 0; j < slots.length; j++) {
              if (slots[j].pokemon.indexOf(pokemon.speciesId) > -1) {
                slot = j + 1;
                break;
              }
            }

            $row.find('th.name').append(`<div class="region-label">Slot ${slot}</div>`);
          }

          $('.alternatives-table tbody').append($row);

          i += 1;
          count += 1;
        }

        if (team.length === 6) {
          $('.alternatives-table .button.add').hide();
        }

        // Update the overall team grades
        $('.overview-section .notes div').hide();

        // Coverage grade, take threat score
        const threatGrade = self.calculateLetterGrade(1200 - avgThreatScore, 670);

        $('.overview-section.coverage .grade').html(threatGrade.letter);
        $('.overview-section.coverage .grade').attr('grade', threatGrade.letter);
        $(`.overview-section.coverage .notes div[grade="${threatGrade.letter}"]`).show();

        // Bulk grade, average HP x Defense stats
        const leagueAverageBulk = [22000, 35000, 35000];
        let averageBulk = 0;
        let goalBulk = leagueAverageBulk[0];

        for (let i = 0; i < team.length; i++) {
          team[i].fullReset();
          averageBulk += team[i].getEffectiveStat(1) * team[i].stats.hp;
        }

        averageBulk /= team.length;

        if (battle.getCP() === 2500) {
          goalBulk = leagueAverageBulk[1];
          if (battle.getCup().name === 'premier') {
            goalBulk = 33000;
          }
        } else if (battle.getCP() === 10000) {
          goalBulk = leagueAverageBulk[2];
        }

        const bulkGrade = self.calculateLetterGrade(averageBulk, goalBulk);
        $('.overview-section.bulk .grade').html(bulkGrade.letter);
        $('.overview-section.bulk .grade').attr('grade', bulkGrade.letter);
        $(`.overview-section.bulk .notes div[grade="${bulkGrade.letter}"]`).show();

        // Safety grade, how safe these Pokemon's matchups are
        const overallRankings = gm.rankings[key];
        let averageSafety = 0;

        for (let i = 0; i < team.length; i++) {
          let safety = 60;

          for (let n = 0; n < overallRankings.length; n++) {
            if (team[i].speciesId === overallRankings[n].speciesId) {
              safety = overallRankings[n].scores[2];
              break;
            }
          }
          averageSafety += safety;
        }

        averageSafety /= team.length;

        const safetyGrade = self.calculateLetterGrade(averageSafety, 98);
        $('.overview-section.safety .grade').html(safetyGrade.letter);
        $('.overview-section.safety .grade').attr('grade', safetyGrade.letter);
        $(`.overview-section.safety .notes div[grade="${safetyGrade.letter}"]`).show();

        // Consistency grade, how bait dependent movesets are
        let averageConsistency = 0;

        for (let i = 0; i < team.length; i++) {
          averageConsistency += team[i].calculateConsistency();
        }

        averageConsistency /= team.length;

        const consistencyGrade = self.calculateLetterGrade(averageConsistency, 98);
        $('.overview-section.consistency .grade').html(consistencyGrade.letter);
        $('.overview-section.consistency .grade').attr('grade', consistencyGrade.letter);
        $(`.overview-section.consistency .notes div[grade="${consistencyGrade.letter}"]`).show();

        // Set download link data
        let cupTitle = 'All Pokemon';
        if (battle.getCup().title) {
          cupTitle = battle.getCup().title;
        }
        const filename = `Team vs. ${cupTitle}.csv`;
        let filedata = '';

        if (!csv.match(/^data:text\/csv/i)) {
          filedata = [csv];
          filedata = new Blob(filedata, { type: 'text/csv' });
        }

        $('.button.download-csv').attr('href', window.URL.createObjectURL(filedata));
        $('.button.download-csv').attr('download', filename);

        runningResults = false;
      };

      // Given a goal value, convert a score into a letter grade
      this.calculateLetterGrade = function (value, goal) {
        const gradeScale = [
          { letter: 'A', value: 0.9 },
          { letter: 'B', value: 0.8 },
          { letter: 'C', value: 0.7 },
          { letter: 'D', value: 0.6 },
        ];

        const percentage = value / goal;
        let letter = 'F';

        for (let i = gradeScale.length - 1; i >= 0; i--) {
          if (percentage >= gradeScale[i].value) {
            letter = gradeScale[i].letter;
          }
        }

        const result = {
          letter,
        };

        return result;
      };

      // Given a subject type, produce effectiveness array for offense or defense
      this.getTypeEffectivenessArray = function (subjectTypes, direction) {
        const arr = [];

        const allTypes = this.getAllTypes();

        for (let n = 0; n < allTypes.length; n++) {
          let effectiveness;
          if (direction === 'offense') {
            effectiveness = battle.getEffectiveness(subjectTypes[0], [allTypes[n]]);

            // Round to nearest thousandths to avoid Javascript floating point wonkiness
            effectiveness = Math.floor(effectiveness * 1000) / 1000;

            arr.push(effectiveness);
          } else if (direction === 'defense') {
            effectiveness = battle.getEffectiveness(allTypes[n], subjectTypes);

            // Round to nearest thousandths to avoid Javascript floating point wonkiness
            effectiveness = Math.floor(effectiveness * 1000) / 1000;

            arr.push(effectiveness);
          }
        }

        return arr;
      };

      // Array of all types
      this.getAllTypes = function () {
        const types = [
          'Bug',
          'Dark',
          'Dragon',
          'Electric',
          'Fairy',
          'Fighting',
          'Fire',
          'Flying',
          'Ghost',
          'Grass',
          'Ground',
          'Ice',
          'Normal',
          'Poison',
          'Psychic',
          'Rock',
          'Steel',
          'Water',
        ];

        return types;
      };

      this.displayArray = function (arr, direction) {
        $(`.typings .${direction}`).html('');

        // Yes, actually using the <table> tag for its intended function
        const $table = $('<table></table>');

        // Output header row of all types
        const allTypes = this.getAllTypes();
        let $tr = $(
          `
						<tr>
							<td></td>
						</tr>
					`
        );

        for (let i = 0; i < allTypes.length; i++) {
          $tr.append(
            `
							<td class="${allTypes[i].toLowerCase()} heading">
								${allTypes[i]}
							</td>
						`
          );
        }

        $table.append($tr);

        // Output row for each item in arr
        for (let i = 0; i < arr.length; i++) {
          $tr = $('<tr></tr>');

          $tr.append(
            `
							<td class="${arr[i].type} name heading">
								${arr[i].name}
							</td>
						`
          );

          for (let n = 0; n < arr[i].matchups.length; n++) {
            const number = arr[i].matchups[n];
            const colors = ['81, 251, 35', '251, 35, 81'];
            let colorIndex = 0;
            let opacity = 0;

            // Display green for resistance and effective moves, red for weaknesses and ineffective moves
            if (direction === 'defense') {
              if (number < 1) {
                colorIndex = 0;
                opacity = 0.244 / number;
              } else if (number > 1) {
                colorIndex = 1;
                opacity = number / 2.65;
              }
            } else if (direction === 'offense') {
              if (number < 1) {
                colorIndex = 1;
                opacity = 0.39 / number;
              } else if (number > 1) {
                colorIndex = 0;
                opacity = number / 1.6;
              }
            }

            $tr.append(
              `
								<td style="background:rgba(${colors[colorIndex]},${opacity})">
									${arr[i].matchups[n]}
								</td>
							`
            );
          }

          $table.append($tr);
        }

        $(`.typings .${direction}`).append($table);
      };

      // Given arrays for defensive and offensive effectiveness, produce a written summary
      this.generateSummaries = function (defenseArr, offenseArr) {
        $('.summary').html('');

        // Defensive Summary
        let defenseSumArr = []; // Array of string items
        defenseSumArr = this.generateTypeSummary(defenseArr, defenseSumArr, 'defense');

        const $defenseList = $('<ul></ul>');

        for (let i = 0; i < defenseSumArr.length; i++) {
          $defenseList.append(`<li>${defenseSumArr[i]}</li>`);
        }

        $('.defense-summary').append($defenseList);

        // Offensive Summary
        let offenseSumArr = []; // Array of string items
        offenseSumArr = this.generateTypeSummary(offenseArr, offenseSumArr, 'offense');

        const $offenseList = $('<ul></ul>');

        for (let i = 0; i < offenseSumArr.length; i++) {
          $offenseList.append(`<li>${offenseSumArr[i]}</li>`);
        }

        $('.offense-summary').append($offenseList);
      };

      // Return an array of descriptions given an array of type effectiveness, and a flag for offense or defense
      this.generateTypeSummary = function (arr, sumArr, direction) {
        const typesResistedArr = [];
        const typesWeakArr = [];
        const typesNeutralOrBetter = []; // Array of types that can be hit for neutral damage or better
        const productArr = []; // Product of resistances across all Pokemon

        const allTypes = this.getAllTypes();

        for (let i = 0; i < allTypes.length; i++) {
          typesResistedArr.push(0);
          typesWeakArr.push(0);
          typesNeutralOrBetter.push(0);
          productArr.push(1);
        }

        for (let i = 0; i < arr.length; i++) {
          const obj = arr[i];

          for (let n = 0; n < obj.matchups.length; n++) {
            if (obj.matchups[n] < 1) {
              typesResistedArr[n] = 1;
            } else if (obj.matchups[n] > 1) {
              typesWeakArr[n] = 1;
            }

            if (obj.matchups[n] >= 1) {
              typesNeutralOrBetter[n] = 1;
            }

            productArr[n] *= obj.matchups[n];
          }
        }

        // Produce a final defensive count
        let typesResisted = 0;
        let typesWeak = 0;
        const overallStrengths = [];
        const overallWeaknesses = [];
        const overallNoNeutralDamage = [];

        for (let i = 0; i < allTypes.length; i++) {
          if (typesResistedArr[i] === 1) {
            typesResisted += 1;
          }

          if (typesWeakArr[i] === 1) {
            typesWeak += 1;
          }

          if (typesNeutralOrBetter[i] === 0) {
            overallNoNeutralDamage.push(allTypes[i]);
          }

          if (productArr[i] < 1) {
            overallStrengths.push(allTypes[i]);
          } else if (productArr[i] > 1) {
            overallWeaknesses.push(allTypes[i]);
          }
        }

        if (direction === 'defense') {
          sumArr.push(`This team resists ${typesResisted} of ${allTypes.length} types.`);
          sumArr.push(`This team is weak to ${typesWeak} of ${allTypes.length} types.`);
        } else if (direction === 'offense') {
          sumArr.push(
            `This team can hit ${typesWeak} of ${allTypes.length} types super effectively.`
          );
        }

        let str;

        // On defense show which types are best resisted, and on offense show which types are best hit effectively
        if (overallStrengths.length > 0) {
          if (direction === 'defense') {
            str = this.generateTypeSummaryList(overallStrengths, 'Overall, strong against', '');
          } else if (direction === 'offense') {
            str = this.generateTypeSummaryList(
              overallWeaknesses,
              'Overall, most effective against',
              ''
            );
          }

          sumArr.push(str);
        }

        // On defense, show list of types that hit this team most effectively
        if (overallWeaknesses.length > 0 && direction === 'defense') {
          str = this.generateTypeSummaryList(overallWeaknesses, 'Overall, weak to', '');

          sumArr.push(str);
        }

        // On offense, show list of types that can't be hit with neutral or better damage
        if (overallNoNeutralDamage.length > 0 && direction === 'offense') {
          str = this.generateTypeSummaryList(
            overallNoNeutralDamage,
            "This team can't hit",
            ' for at least neutral damage.'
          );

          sumArr.push(str);
        }

        return sumArr;
      };

      // Generate and return a descriptive string given a list of types
      this.generateTypeSummaryList = function (arr, beforeStr, afterStr) {
        let str = beforeStr;

        for (let i = 0; i < arr.length; i++) {
          if (i > 0) {
            str += ',';

            if (i === arr.length - 1 && i > 1) {
              str += ' and';
            }
          }

          str += ` <span class="${arr[i].toLowerCase()}">${arr[i]}</span>`;
        }

        str += afterStr;

        return str;
      };

      // Event handler for changing the league select
      function selectLeague() {
        const allowed = [1500, 2500, 10000];
        const cp = parseInt($('.league-select option:selected').val());

        if (allowed.indexOf(cp) > -1) {
          battle.setCP(cp);

          // Set the selected team to the new CP
          for (let i = 0; i < multiSelectors.length; i++) {
            multiSelectors[i].setCP(cp);
          }
        }

        gm.loadRankingData(
          self,
          'overall',
          parseInt($('.league-select option:selected').val()),
          'all'
        );
      }

      // Event handler for changing the cup select
      function selectCup() {
        let cup = $('.cup-select option:selected').val();
        battle.setCup(cup);

        // Filter PokeSelect options by type
        let cupTypes = [];
        cup = battle.getCup();

        for (let i = 0; i < cup.include.length; i++) {
          if (cup.include[i].filterType === 'type') {
            cupTypes = cup.include[i].values;
          }
        }

        for (let i = 0; i < pokeSelectors.length; i++) {
          pokeSelectors[i].filterByTypes(cupTypes);
        }

        if (cup.name === 'sorcerous') {
          $('#main h1').html('Team Wizard');
        } else {
          $('#main h1').html('Team Builder');
        }

        multiSelectors[0].setCliffhangerMode(cup === 'cliffhanger');

        // Load ranking data for movesets
        const key = `${battle.getCup().name}overall${battle.getCP()}`;

        if (!gm.rankings[key]) {
          gm.loadRankingData(self, 'overall', battle.getCP(), battle.getCup().name);
        }
      }

      // Event handler for changing the format category
      function selectFormat() {
        const format = $('.format-select option:selected').val();
        const cup = $('.format-select option:selected').attr('cup');

        $('.cup-select option').hide();
        $(`.cup-select option[cat="${format}"]`).show();
        $(`.cup-select option[cat="${format}"]`).eq(0).prop('selected', true);

        if (cup) {
          $(`.cup-select option[value="${cup}"]`).eq(0).prop('selected', true);
        }

        $('.cup-select').change();

        if (format === 'all' || cup) {
          $('.cup-select').hide();
        } else {
          $('.cup-select').show();
        }

        if (format === 'custom') {
          // Redirect to the custom rankings page
          window.location.href = `${webRoot}custom-rankings/`;
        }

        multiSelectors[0].setCliffhangerMode(cup === 'cliffhanger');
      }

      // Event handler for clicking the rate button
      function rateClick() {
        $('.rate-btn').html('Generating...');
        $('.section.error').hide();

        // This is stupid but the visual updates won't execute until Javascript has completed the entire thread
        setTimeout(() => {
          const results = self.updateTeamResults();

          // Set new page state
          const cp = battle.getCP();
          const cup = battle.getCup().name;

          const pokes = multiSelectors[0].getPokemonList();
          const moveStrs = [];
          let teamStr = `team-builder/${cup}/${cp}/`;

          for (let i = 0; i < pokes.length; i++) {
            const poke = pokes[i];

            moveStrs.push(poke.generateURLMoveStr());

            teamStr += pokes[i].generateURLPokeStr('team-builder');

            if (i < pokes.length - 1) {
              teamStr += '%2C';
            }
          }

          // Add move strings to URL
          const link = host + teamStr;

          $('.share-link input').val(link);

          // Push state to browser history so it can be navigated, only if not from URL parameters
          if (get) {
            let sameTeam = true;

            for (let i = 0; i < pokes.length; i++) {
              if (get[`p${i + 1}`] !== pokes[i].speciesId) {
                sameTeam = false;
              }
            }

            if (get.cup !== cup) {
              sameTeam = false;
            }

            if (sameTeam) {
              return;
            }
          }

          const url = webRoot + teamStr;

          // No guarantee the user will have selected 3 Pokemon, so need to account for all possibilities
          const data = { cup, cp };

          for (let i = 0; i < pokes.length; i++) {
            data[`p${i + 1}`] = pokes[i].speciesId;
            data[`m${i + 1}`] = moveStrs[i];
          }

          window.history.pushState(data, 'Team Builder', url);

          // Send Google Analytics pageview
          gtag('config', UA_ID, { page_location: host + url, page_path: url });

          if (results === false) {
            return;
          }

          $('.rate-btn').html('Rate Team');

          // Scroll down to results
          $('html, body').animate(
            {
              scrollTop: $('.section.typings a').first().offset().top,
            },
            500
          );
        }, 10);
      }

      // Add a Pokemon from the alternatives table
      function addAlternativePokemon(e) {
        const id = $(e.target).attr('pokemon');
        $('.poke-select-container .poke.multi .add-poke-btn').trigger('click');
        $(`.modal .poke-select option[value="${id}"]`).prop('selected', 'selected');
        $('.modal .poke-select').trigger('change');
        $('html, body').animate({ scrollTop: $('.poke.multi').offset().top }, 500);
      }

      // Open the print dialogue
      function printScorecard(e) {
        e.preventDefault();

        $('body').addClass('scorecard-print');

        window.print();
      }

      // Turn checkboxes on and off
      function checkBox() {
        $(this).toggleClass('on');
        $(this).trigger('change');
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
