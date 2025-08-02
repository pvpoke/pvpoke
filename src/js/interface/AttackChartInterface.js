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
			let sort = "attack";
			let sortDirection = 1;

			let jumpToPoke = false;

			this.context = "attackchart"


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

				multiSelector.setUpdateCallback(self.displayRankingData);
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
				}

				if(multiSelector.getPokemonList().length == 0){
                    multiSelector.selectGroup(metaKey);
					return false;
                }

				// Don't proceed until rankings have loaded (ranking load triggers display)
				let rankingKey = battle.getCup().name + "overall" + battle.getCP();
				if(! gm.rankings[rankingKey]){
					return false;
				}

                // Calculate results and display in table

				$(".train-table tbody").html('Loading...');

				// Set after timeout to free up main thread
				setTimeout(function(){
					// Filter Pokemon list by unique species
					let pokemonList = [];
					let multiselectorList = multiSelector.getPokemonList();

					// If Pokemon selected in URL parameter isn't in the list, add it
					if(jumpToPoke && ! multiselectorList.find(p => p.aliasId.replace("_shadow", "") == jumpToPoke)){
						let newPokemon = new Pokemon(jumpToPoke, 0, battle);

						if(newPokemon){
							newPokemon.initialize(true);
							multiselectorList.push(newPokemon);
							multiSelector.setPokemonList(multiselectorList);
							return; // multiSelector will trigger this method to rerun with the Pokemon added
						} else{
							console.error("Could not add " + jumpToPoke);
							jumpToPoke = false;
						}					
					}

					multiselectorList.forEach(pokemon => {
						if(! pokemonList.find(p => p.aliasId.replace("_shadow", "") == pokemon.aliasId.replace("_shadow", ""))){
							pokemonList.push(pokemon);
						}
					});

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
					self.sortData(sort, sortDirection);
					
					// Determine the x axis scale
					const attackValues = data.flatMap(item => [item.minAtk, item.maxAtk]);
					const maxAttackValue = Math.max.apply(null, attackValues);
					const chartGutterSize = window.innerWidth <= 600 ? 0 : .055 * maxAttackValue;
					const chartMinAttack = Math.min.apply(null, attackValues) - chartGutterSize;
					const chartMaxAttack = Math.max.apply(null, attackValues) + chartGutterSize;
					const chartWidth = chartMaxAttack - chartMinAttack;

					$(".train-table tbody").html('');

					data.forEach((item, index) => {
						const pokemon = item.pokemon;
						const name = pokemon.speciesName.replace("(Shadow)", "");
						const displayMin = Math.floor(item.minAtk * 10) / 10;
						const displayMax = Math.floor(item.maxAtk * 10) / 10;
						const $row = $(".train-table tr.hide").clone().removeClass("hide");

						$row.find(".poke-name .name").html((index + 1) + ". " + name);
						$row.attr("data", pokemon.speciesId);

						// Set bar color relative to scale
						const colorRating = ( (item.topIvMinAtk - chartMinAttack) / (chartMaxAttack - chartMinAttack)) * 1000;
						const color = battle.getRatingColor(colorRating);
						$row.find(".cmp-item .bar, .cmp-item .subbar").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
						
						// Set bar width relative to chart
						const barWidth = ((item.maxAtk - item.minAtk) / chartWidth) * 100;
						const barPosition = ((item.minAtk - chartMinAttack) / chartWidth) * 100;
						const subsectionWidth = ((item.topIvMaxAtk - item.topIvMinAtk) / (item.maxAtk - item.minAtk)) * 100;
						const subsectionPosition = ((item.topIvMinAtk - item.minAtk) / (item.maxAtk - item.minAtk)) * 100;

						// Display min and max values
						$row.find(".min").html(displayMin);
						$row.find(".max").html(displayMax);

						// Add ranking link
						$row.find(".link a").attr("href", host+"rankings/" + battle.getCup().name + "/" + battle.getCP() + "/overall/" + pokemon.speciesId + "/");

						if(window.innerWidth <= 600){
							$row.find(".cmp-item .subbar").width(barWidth + "%");					
							$row.find(".cmp-item .subbar").css("left", barPosition + "%");
						} else{
							$row.find(".cmp-item").width(barWidth + "%");
							$row.find(".cmp-item").css("left", barPosition + "%");	
				
							$row.find(".cmp-item .subbar").width(subsectionWidth + "%");					
							$row.find(".cmp-item .subbar").css("left", subsectionPosition + "%");
						}

						$(".train-table tbody").append($row);
					});

					// Filter table if search string is set

					if($(".poke-search").first().val() != ''){
						$(".poke-search").first().trigger("keyup");
					}

					$(".table-container").scrollTop(0);

					// Jump to Pokemon if selected
					if(jumpToPoke){
						// Scroll to element
						let $row = $(".cmp-chart tr[data='"+jumpToPoke+"'], .cmp-chart tr[data='"+jumpToPoke+"_shadow']").first();

						if($row.length > 0){
							let elTop = $row.position().top;
							let containerTop = $(".table-container").position().top;
							let gotoTop = elTop - containerTop - 20;

							$("html, body").animate({ scrollTop: 150}, 500);
							$(".table-container").scrollTop(gotoTop);

							$row.trigger("click");
						}

						jumpToPoke = false;
					}
				}, 50);


				// Set share link URL
				let url = host+"attack-cmp-chart/"+battle.getCup().name+"/"+battle.getCP()+"/";
				$(".share-link input").val(url);

			}

			// Sort data given a sort column
			this.sortData = function(column, direction){
				switch(column){
					case "name":
						data.sort((a,b) => (a.pokemon.speciesName > b.pokemon.speciesName) ? direction : ((b.pokemon.speciesName > a.pokemon.speciesName) ? -direction : 0));
						break;

					case "attack":
						data.sort((a,b) => (a.topIvMinAtk > b.topIvMinAtk) ? -direction : ((b.topIvMinAtk > a.topIvMinAtk) ? direction : 0));
						break;
				}
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

							case "p":
								jumpToPoke = val.replace("_shadow", "");
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

				let selectedSort = $(e.target).attr("data");

				if(selectedSort != sort){
					sort = selectedSort;
					sortDirection = 1;
				} else{
					sortDirection = -sortDirection;
				}

				self.sortData(sort, sortDirection)

				self.displayRankingData();
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

				// Search rows of cmp chart
				$target.find("tbody tr").each(function(index, value){
					let id = $(this).attr("data");

					if(list.includes(id)){
						$(this).show();
					} else{
						$(this).hide();
					}
				});
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

			// Row click handler

			$("body").on("click", function(e){
				
				if($(e.target).closest(".legend-item").length > 0){
					return;
				}

				let $row = $(e.target).closest(".train-table tr");

				if($row.length > 0){
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

			// Select a comparison type from the chart legend

			$(".legend-item").click(function(e){
				compareType = $(this).attr("data");

				$(".legend-item").removeClass("selected");
				$(this).addClass("selected");

				if(selectedItem){
					highlightAttackRange(selectedItem.pokemon.speciesId);
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
