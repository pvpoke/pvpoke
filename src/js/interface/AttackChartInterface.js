// JavaScript Document

let InterfaceMaster = (function () {
    let instance;

    function createInstance() {


        let object = new interfaceObject();

		function interfaceObject(){

			let self = this;
			let gm = GameMaster.getInstance();
            let data = [];
			let battle = new Battle();
            let multiSelector = new PokeMultiSelect($(".custom-rankings-meta-group .poke.multi"));
			
			// Control for selecting rows in the table
			let selectedItem = null;
			let compareType = "typical";


			this.init = function(){
                multiSelector.init(gm.data.pokemon, battle);
		        multiSelector.setContext("attackchart");

                pokeSearch.setBattle(battle);

				if(! get){
                    battle.setCP(1500);
                    battle.setCup("all");
					this.loadRankings("1500","all");
				} else{
					this.loadGetData();
				}

				$(".format-select").on("change", selectFormat);
				$("thead a").on("click", sortTable);
				$("body").on("click", ".check", checkBox);

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});
			};

			// Grabs ranking data from the Game Master

			this.loadRankings = function(cp, cup){
                gm.loadRankingData(self, "overall", cp, cup);
			}

			// Displays attack chart data for currently selected format

			this.displayRankingData = function(){
				// Load meta group
                let metaKey = $(".format-select option:selected").attr("meta-group");

                if(! gm.groups[metaKey]){
                    runningResults = true;
                    gm.loadGroupData(self, metaKey, gm.data);
                    return false;
                } else if(multiSelector.getPokemonList().length == 0){
                    multiSelector.selectGroup(metaKey);
                }

                // Calculate results and display in table

				$(".train-table tbody").html('');

                // Filter Pokemon list by unique species
                let pokemonList = [];
                let multiselectorList = multiSelector.getPokemonList();

                multiselectorList.forEach(pokemon => {
                    if(! pokemonList.find(p => p.speciesId.replace("_shadow", "") == pokemon.speciesId.replace("_shadow", ""))){
                        pokemonList.push(pokemon);
                    }
                })

                // Collect table data
                data = [];

                pokemonList.forEach(pokemon => {
                    const ivCombos = pokemon.generateIVCombinations("overall", 1, 4096);

                    if(ivCombos.length == 0){
                        console.error("No IV combinations found for " + pokemon.speciesId);
                        return;
                    }
					
					// Determine attack value range for overall IV combos
					const attackValues = ivCombos.map(combo => combo.atk);

                    const minAtk = Math.min.apply(null, attackValues);
                    const maxAtk = Math.max.apply(null, attackValues);

					// Determine attack value range for top IV combos
					let topIvComboCount = Math.round(ivCombos.length * .1); // Take Attack stat values of top 10% (Rank 409 or better)

					// If the Pokemon needs to be high level to reach its best combo, take a narrower cut
					if(ivCombos[0].cp < battle.getCP() - 20){
						topIvComboCount = 16;
					}

					const topIvCombos = ivCombos.slice(0, topIvComboCount);
					const topIvAttackValues = topIvCombos.map(combo => combo.atk);
					const topIvMinAtk = Math.min.apply(null, topIvAttackValues);
					const topIvMaxAtk = Math.max.apply(null, topIvAttackValues);

                    data.push(
                        {
                            pokemon: pokemon,
                            minAtk: minAtk,
                            maxAtk: maxAtk,
							topIvMinAtk: topIvMinAtk,
							topIvMaxAtk: topIvMaxAtk,
							rank1Atk: ivCombos[0].atk
                        }
                    );
                });

                // Sort data
				if(battle.getCP() == 10000){
					data.sort((a,b) => (a.maxAtk > b.maxAtk) ? -1 : ((b.maxAtk > a.maxAtk) ? 1 : 0));
				} else{
					data.sort((a,b) => (a.minAtk > b.minAtk) ? -1 : ((b.minAtk > a.minAtk) ? 1 : 0));
				}

				data.sort((a,b) => (a.topIvMinAtk > b.topIvMinAtk) ? -1 : ((b.topIvMinAtk > a.topIvMinAtk) ? 1 : 0));
                

                // Determine the x axis scale
                const attackValues = data.flatMap(item => [item.minAtk, item.maxAtk]);
                const chartMinAttack = Math.min.apply(null, attackValues) - 15;
                const chartMaxAttack = Math.max.apply(null, attackValues) + 15;
                const chartWidth = chartMaxAttack - chartMinAttack;

                data.forEach(item => {
                    const name = item.pokemon.speciesName.replace("(Shadow)", "");
                    const displayMin = Math.floor(item.minAtk * 10) / 10;
                    const displayMax = Math.floor(item.maxAtk * 10) / 10;
                    const $row = $(".train-table tr.hide").clone().removeClass("hide");

                    $row.find(".poke-name .name").html(name);
                    $row.attr("data", item.pokemon.speciesId);

					// Set bar color relative to scale
					const colorRating = ( (item.topIvMinAtk - chartMinAttack) / (chartMaxAttack - chartMinAttack)) * 1000;
					const color = battle.getRatingColor(colorRating);
					$row.find(".cmp-item .bar, .cmp-item .subbar").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");

					if(window.innerWidth <= 600){
						// Display min and max values
						$row.find(".min").html("");
                    	$row.find(".max").html(displayMin + " - " + displayMax);
					} else{
						// Set bar width relative to chart
						const barWidth = ((item.maxAtk - item.minAtk) / chartWidth) * 100;
						$row.find(".cmp-item").width(barWidth + "%");

						const subsectionWidth = ((item.topIvMaxAtk - item.topIvMinAtk) / (item.maxAtk - item.minAtk)) * 100;
						$row.find(".subbar").width(subsectionWidth + "%");

						// Set bar position relative to chart
                    	const position = ((item.minAtk - chartMinAttack) / chartWidth) * 100;
						$row.find(".cmp-item").css("left", position + "%");

						const subsectionPosition = ((item.topIvMinAtk - item.minAtk) / (item.maxAtk - item.minAtk)) * 100;
						$row.find(".cmp-item .subbar").css("left", subsectionPosition + "%");

						// Display min and max values
						$row.find(".min").html(displayMin);
                    	$row.find(".max").html(displayMax);
					}

                    $(".train-table tbody").append($row);
                });
			}

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				// Cycle through parameters and set them
				let cp = 1500;
				let cup = "all";

				for(let key in get){
					if(get.hasOwnProperty(key)){

						let val = get[key];

						// Process each type of parameter

						switch(key){

							// Don't process default values so data doesn't needlessly reload

							case "cp":
								cp = val;
								break;

							case "cup":
								cup = val;
								break;
						}
					}
				}

				// Load data via existing change function

				$(".format-select option[value=\""+cp+"\"][cup=\""+cup+"\"]").prop("selected","selected");

				battle.setCP(cp);
				battle.setCup(cup);
				self.loadRankings(cp, cup);
			}

			// When the view state changes, push to browser history so it can be navigated forward or back

			this.pushHistoryState = function(cup, cp){

				let url = webRoot+"attack-cmp-chart/"+cup+"/"+cp+"/";
				let data = {cup: cup, cp: cp };

				window.history.pushState(data, "Attack Stat (CMP) Chart", url);
			}


			// Event handler for changing the format category

			function selectFormat(e){
				let cp = $(".format-select option:selected").val();
				let cup = $(".format-select option:selected").attr("cup");

				selectedItem = null;

				battle.setCP(cp);
				battle.setCup(cup);

                // Clear currently selected Pokemon
                multiSelector.setPokemonList([]);
                multiSelector.setCP(cp);

				self.loadRankings(cp, cup);
				self.pushHistoryState(cup, cp);
			}

			// Event handler for selecting ranking category

			function sortTable(e){

				e.preventDefault();

				let $parent = $(e.target).closest("table");

				$parent.find("thead a").removeClass("selected");

				$(e.target).addClass("selected");

				let targetData = data.performers;
				let sortColumn = $(e.target).attr("data");

				if($parent.hasClass("teams")){
					targetData = data.teams;
				}

				switch(sortColumn){
					case "name":
						targetData.sort((a,b) => (a.pokemon > b.pokemon) ? 1 : ((b.pokemon > a.pokemon) ? -1 : 0));
						break;

					case "lead":
						targetData.sort((a,b) => (a.team > b.team) ? 1 : ((b.team > a.team) ? -1 : 0));
						break;

					case "individual":
						targetData.sort((a,b) => (a.individualScore > b.individualScore) ? -1 : ((b.individualScore > a.individualScore) ? 1 : 0));
						break;

					case "team":
						targetData.sort((a,b) => (a.teamScore > b.teamScore) ? -1 : ((b.teamScore > a.teamScore) ? 1 : 0));
						break;

					case "usage":
						targetData.sort((a,b) => (a.games > b.games) ? -1 : ((b.games > a.games) ? 1 : 0));
						break;
				}

				self.displayRankingData(data);

				submitSearchQuery();
			}

			let searchTimeout;
			let searchStr = '';
			let $target = null;

			$("body").on("keyup", ".poke-search", function(e){
				searchStr = $(this).val().toLowerCase().trim();

				$target = $(".train-table."+$(e.target).attr("target"));

				// Reset the timeout when a new key is typed. This prevents queries from being submitted too quickly and bogging things down on mobile.
				window.clearTimeout(searchTimeout);
				searchTimeout = window.setTimeout(submitSearchQuery, 200);
			});

			function submitSearchQuery(){
				let list = GameMaster.getInstance().generatePokemonListFromSearchString(searchStr, battle);

				if($target.hasClass("performers")){

					// Search rows of top performers
					$target.find("tbody tr").each(function(index, value){
						let id = $(this).attr("data");

						if(list.indexOf(id) > -1){
							$(this).show();
						} else{
							$(this).hide();
						}
					});

				} else if($target.hasClass("teams")){

					// Search makeups of team
					$target.find("tbody tr").each(function(index, value){
						let $row = $(this);
						let found = 0;

						$row.find(".pokemon").each(function(spriteIndex, spriteValue){
							let id = $(this).attr("data");

							if(list.indexOf(id) > -1){
								found++;
							}
						});

						if(found >= 3 || (! searchStr.includes("!")) && found > 0){
							$row.show();
						} else{
							$row.hide();
						}

					});
				}
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
				$(this).trigger("stateChange");
			}

			// Highlight Pokemon which fall within the same Attack stat range given species Id
			function highlightAttackRange(speciesId){
				selectedItem = data.find(obj => obj.pokemon.speciesId == speciesId);

				if(selectedItem){
					// Filter list of Pokemon which have overlapping Attack stats
					let filteredList = data;

					switch(compareType){
						case "typical": // Compare typical Attack stat range
							filteredList = data.filter(obj => obj.topIvMinAtk <= selectedItem.topIvMaxAtk && selectedItem.topIvMinAtk <= obj.topIvMaxAtk);
							break;

						default: // Compare full Attack stat range
							filteredList = data.filter(obj => obj.minAtk <= selectedItem.maxAtk && selectedItem.minAtk <= obj.maxAtk);
							break;
					}

					$(".train-table tbody tr").removeClass("faded");

					$(".train-table tbody tr").each(function(e){
						let $row = $(this);
						
						if(! filteredList.find(obj => obj.pokemon.speciesId == $row.attr("data"))){
							$row.addClass("faded");
						}
					});
				}
			}

			// Row hover handler

			$("body").on("click", function(e){

				if($(".train-table tbody tr:hover").length > 0){
					let $row = $(".train-table tbody tr:hover").first();
					let speciesId = $row.attr("data");

					if(speciesId && speciesId != selectedItem?.pokemon?.speciesId){
						$(".train-table tbody tr").removeClass("selected");
						$row.addClass("selected");
						highlightAttackRange(speciesId);
					} else{
						$(".train-table tbody tr").removeClass("faded selected");
						selectedItem = null;
					}
				} else{
					$(".train-table tbody tr").removeClass("faded selected");
					selectedItem = null;
				}

			});
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
