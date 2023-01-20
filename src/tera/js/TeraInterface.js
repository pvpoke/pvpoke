var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			let self = this;
			let ranker = new TeraRanker();
			let gm = GameMaster.getInstance();
			let selectedTypes = [];
			let selectedPokemon;
			let selectedTera;
			let results = [];
			let displayedResults = [];

			this.init = function(){
				// Populate Pokemon select list
				for(var i = 0; i < gm.data.pokemon.length; i++){
					$("#poke-select").append("<option value='"+gm.data.pokemon[i].id+"'>"+gm.data.pokemon[i].name+"</option>");
				}

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});

				if(get){
					self.loadGetData();
				}
			}

			this.displayResults = function(r, animate){
				animate = typeof animate !== 'undefined' ? animate : true;
				displayedResults = r;

				$("#results tbody").html("");

				let displayedSpecies = [];
				let displayCount = 0;
				let displayMax = 50;
				let i = 0;

				while(displayCount < displayMax && i < r.length){
					// Show only the best scored version of each species
					if(displayedSpecies.indexOf(r[i].pokemon.id) > -1){
						i++;
						continue;
					}

					let $row = $('<tr><td></td><td>-</td><td></td><td></td></tr>');
					$row.find("td").eq(0).html(r[i].pokemon.name);

					// Show Pokemon typings
					let $types = $("<div class='flex'></div>");

					for(var n = 0; n < r[i].pokemon.types.length; n++){
						let $type = createTypeLabel(r[i].pokemon.types[n], false, false);
						$types.append($type);
					}

					$row.find("td").eq(1).html($types);

					// Show Pokemon tera type
					let $teraType = createTypeLabel(r[i].tera, true, false);
					$row.find("td").eq(2).html($teraType);

					// Show Pokemon's score
					let score = Math.round(r[i].overall * 100) / 100;

					$row.find("td").eq(3).html("<a class='score' href='#'>"+score+"</a>");

					if(animate){
						$row.addClass("animate");
					}

					$("#results tbody").append($row);

					displayedSpecies.push(r[i].pokemon.id);

					i++;
					displayCount++;

				}

				// Animate displayed rows
				if(animate){
					$("#results tbody tr").each(function(index, value){

						setTimeout(function(){
							$(value).removeClass("animate");
						}, 30 * index);

					});
				}

				$(".results-container").show();
			}

			// Fill in settings from get parameters

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				// Cycle through parameters and set them

				for(var key in get){
					if(get.hasOwnProperty(key)){

						let val = get[key];

						// Process each type of parameter

						switch(key){
							case "p":
								// Set selected Pokemon
								selectedPokemon = gm.getPokemonById(val);
								$("#poke-select option[value='"+val+"']").prop("selected", "selected");

								// Default to stab types
								for(var i = 0; i < selectedPokemon.types.length; i++){
									selectedTypes.push(selectedPokemon.types[i]);
								}
								break;

							case "t":
								// Set tera type
								selectedTera = val;
								$("#tera-select option[value='"+val+"']").prop("selected", "selected");

								selectedTypes.push(selectedTera)
								break;

							case "a":
								// Set selected attack types
								selectedTypes = val.split("-");
								break;
						}
					}

				}

				updateRaidBossDisplay();

				let r = ranker.rankAttackers(selectedPokemon, selectedTypes, selectedTera);

				results = r;

				self.displayResults(r);
			}


			// Run the tera counter calculator and display the results
			$("button#run").click(function(e){
				let r = ranker.rankAttackers(selectedPokemon, selectedTypes, selectedTera);

				results = r;

				self.displayResults(r);

				// Update URL
				let currentURL = window.location.pathname
				let url = webRoot + 'tera/' + selectedPokemon.id + '/' + selectedTera + '/' + selectedTypes.join('-');

				let data = {p: selectedPokemon.id, a: selectedTypes.join("-"), t: selectedTera };

				window.history.pushState(data, "Tera Raid Counters", url);

				// Send Google Analytics pageview
				if(currentURL != url){
					gtag('config', UA_ID, {page_location: (host+url), page_path: url});
				}

				// Scroll to results

				$("html, body").animate({ scrollTop: $("table#results").offset().top - 185 }, 500);
			});

			// Select a Pokemon from the raid boss select list on input search

			$("#poke-search").keyup(function(e){
				let searchStr = $(this).val().toLowerCase();

				$("#poke-select option").each(function(index, value){
					let name = $(this).html().toLowerCase();

					if(name.startsWith(searchStr)){
						$(this).prop("selected", "selected");
						selectNewPokemon($(this).val());
						return false;
					}
				});
			});

			// Filter the counter results

			$("#results-search").keyup(function(e){
				let searchStr = $(this).val().toLowerCase();
				let searchResults = filterResults(searchStr);

				self.displayResults(searchResults, false);
			});


			// Clear the search input on focus

			$("#poke-search").focus(function(e){
				$("#poke-search").val("");
			});

			// Select a Pokemon from the dropdown
			$("#poke-select").change(function(e){
				selectNewPokemon($(this).find("option:selected").val());
			});

			// Change the current tera type
			$("#tera-select").change(function(e){
				selectedTera = $(this).find("option:selected").val();

				// Animate tera flash
				$(".boss-section .flash").css("left", "-300px");
				$(".boss-section .flash").css("opacity", "0.2");

			  $(".boss-section .flash").animate({
			    opacity: 0,
			    left: "800"
			}, 400);

				updateRaidBossDisplay();
			});

			// Add a new selected type to the list of attacks
			$("#attack-type-select").change(function(e){
				let type = $("#attack-type-select option:selected").val();
				selectedTypes.push(type);

				$("#attack-type-select option").first().prop("selected", "selected");

				updateRaidBossDisplay();
			});

			// Remove a selected type from the list of attacks
			$("body").on("click", ".type-item a.close", function(e){
				e.preventDefault();

				let $item = $(this).closest(".type-item");
				let index = $(".boss-attack-types .type-item").index($item);

				selectedTypes.splice(index, 1);

				updateRaidBossDisplay();
			});

			// Display score details in a modal window
			$("body").on("click", "#results a.score", function(e){
				e.preventDefault();

				// Get the data row for this cell
				let index = $(e.target).closest("tr").index("#results tbody tr");
				let r = displayedResults[index];
				let overall = roundScore(r.overall);
				let offense = roundScore(r.offense);
				let defense = roundScore(1 / r.defense);

				let $details = $(".results-container .score-details.template").first().clone().removeClass("template");
				$details.find(".overall .score").html(overall);
				$details.find(".offense .score").html(offense);
				$details.find(".defense .score").html(defense);

				// Display typings
				for(var i = 0; i < r.pokemon.types.length; i++){
					$details.find(".typings").append(createTypeLabel(r.pokemon.types[i], false, false));
				}

				$details.find(".tera-type .type-container").append(createTypeLabel(r.tera, true, false));

				let modal = modalWindow(r.pokemon.name, $details);
			});

			// Select a new Pokemon from the given id
			function selectNewPokemon(id){
				// Empty value
				if(id == '' || id == null){
					selectedPokemon = null;
					selectedTypes = [];
					updateRaidBossDisplay();
					return;
				}

				selectedPokemon = gm.getPokemonById(id);

				selectedTypes = [];

				for(var i = 0; i < selectedPokemon.types.length; i++){
					selectedTypes.push(selectedPokemon.types[i]);
				}

				updateRaidBossDisplay();
			}

			// Update the raid boss UI with the current values
			function updateRaidBossDisplay(){
				$(".boss-section").attr("tera-type", selectedTera);

				if(selectedTera){
					$(".boss-section .tera-type-container .tera-icon").show();
				} else{
					$(".boss-section .tera-type-container .tera-icon").hide();
				}

				$(".boss-attack-types .type-item").remove();

				if(selectedTypes.length >= 12){
					$("#attack-type-select").hide();
				} else{
					$("#attack-type-select").show();
				}

				for(var i = 0; i < selectedTypes.length; i++){
					let $type = createTypeLabel(selectedTypes[i], false, true);

					$type.insertBefore($(".boss-attack-types select"));
				}

			}

			function createTypeLabel(type, isTera, removable){
				removable = typeof removable !== 'undefined' ? removable : true;
				let $type = $(".type-item.template").clone().removeClass("template");
				let typeName = type.charAt(0).toUpperCase() + type.slice(1);

				$type.addClass(type);
				$type.attr("tera-type", type);
				$type.find(".type-name").html(typeName);

				if(isTera){
					$type.addClass("tera");
				}

				if(! removable){
					$type.find("a.close").remove();
				}

				return $type;
			}

			// Filter the results by a provided search str
			function filterResults(searchStr){
				searchStr = searchStr.replace(/, /g, '').toLowerCase();
				let queries = searchStr.split(',');
				let filteredResults = [];

				for(var i = 0; i < queries.length; i++){
					let query = queries[i];
					let params = query.split('&');

					for(var n = 0; n < results.length; n++){
						let r = results[n];
						let paramsMet = 0;

						for(var j = 0; j < params.length; j++){
							let param = params[j];
							let isNot = false;
							let valid = false;

							if(param.length == 0){
								if(params.length == 1){
									paramsMet++;
								}
								continue;
							}

							if((param.charAt(0) == "!")&&(param.length > 1)){
								isNot = true;
								param = param.substr(1, param.length-1);
							}

							// Type search
							if(r.pokemon.types.indexOf(param) > -1){
								valid = true;
							}

							// Name search
							if(r.pokemon.name.toLowerCase().startsWith(param)){
								valid = true;
							}

							// Tera type search

							if((param.charAt(0) == "@")&&(param.length > 1)){
								param = param.substr(1, param.length-1);

								if(r.tera == param){
									valid = true;
								}
							}

							if(((valid)&&(!isNot))||((!valid)&&(isNot))){
								paramsMet++;
							}
						}

						if(paramsMet >= params.length){
							filteredResults.push(r);
						}
					}
				}

				return filteredResults;
			}

			// Round scores by 2 digits
			function roundScore(score){
				return Math.round(score * 100) / 100;;
			}

		}

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
