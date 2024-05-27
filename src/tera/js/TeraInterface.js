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
			let displayOptions = {
				sort: "overall",
				showBest: true
			};

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

			this.displayResults = function(r, animate, showBest){
				animate = typeof animate !== 'undefined' ? animate : true;
				showBest = typeof showBest !== 'undefined' ? showBest : displayOptions.showBest;

				// Sort results by sorting option
				switch(displayOptions.sort){
					case "overall":
					r.sort((a,b) => (a.overall > b.overall) ? -1 : ((b.overall > a.overall) ? 1 : 0));
					break;

					case "offense":
					r.sort((a,b) => (a.offense > b.offense) ? -1 : ((b.offense > a.offense) ? 1 : 0));
					break;

					case "defense":
					r.sort((a,b) => (a.defense > b.defense) ? 1 : ((b.defense > a.defense) ? -1 : 0));
					break;
				}


				$("#results tbody").html("");
				$("table#results").scrollTop(0);

				let displayedSpecies = [];
				let displayCount = 0;
				let displayMax = 50;
				let i = 0;
				displayedResults = [];

				while(displayCount < displayMax && i < r.length){
					// Show only the best scored version of each species
					if(showBest && displayedSpecies.indexOf(r[i].pokemon.id) > -1){
						i++;
						continue;
					}

					let $row = $('<tr><td></td><td>-</td><td></td><td></td></tr>');

					// Display name and traits
					let $name = $(".name-details.template").first().clone().removeClass("template");
					let traits = r[i].pokemon.getActiveTraits();

					$name.find(".pokemon-name").html(r[i].pokemon.name);

					for(var n = 0; n < traits.length; n++){
						$name.find(".traits").append("<div class=\"trait\">"+traits[n].name+"</div>");
					}

					$row.find("td").eq(0).html($name);

					// Show Pokemon typings
					let $types = $("<div class='flex'></div>");

					for(var n = 0; n < r[i].pokemon.types.length; n++){
						let $type = createTypeLabel(r[i].pokemon.types[n], false, false);
						$types.append($type);
					}

					$row.find("td").eq(1).html($types);

					// Show Pokemon tera type
					let $teraType = createTypeLabel(r[i].pokemon.tera, true, false);
					$row.find("td").eq(2).html($teraType);

					// Show Pokemon's score
					let score = roundScore(r[i].overall);

					if(displayOptions.sort == "offense"){
						score = roundScore(r[i].offense);
					} else if(displayOptions.sort == "defense"){
						score = roundScore(1 / r[i].defense);
					}

					$row.find("td").eq(3).html("<a class='score' href='#'>"+score+"</a>");

					if(animate){
						$row.addClass("animate");
					}

					$("#results tbody").append($row);

					displayedSpecies.push(r[i].pokemon.id);
					displayedResults.push(r[i]);

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

					// Clear searchbar
					$("#results-search").val('');
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
								selectedPokemon = new Pokemon(val);
								selectedPokemon.isBoss = true;
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

							case "tr":
								// Set raid boss traits
								let traits = val.split("-");

								selectedPokemon.disableAllTraits();

								for(var i = 0; i < traits.length; i++){
									selectedPokemon.enableTrait(traits[i]);
								}
								break;
						}
					}

				}

				selectedPokemon.tera = selectedTera;

				updateRaidBossDisplay();

				let r = ranker.rankAttackers(selectedPokemon, selectedTypes);

				results = r;

				self.displayResults(r);


				$(".share-link input").val(window.location.href);
			}


			// Run the tera counter calculator and display the results
			$("button#run").click(function(e){
				// Validation
				let valid = true;

				if(! selectedPokemon){
					$("#poke-select").addClass("error");
					valid = false;
				}

				if(! selectedTera){
					$("#tera-select").addClass("error");
					valid = false;
				}

				if(! valid){
					return false;
				}

				selectedPokemon.tera = selectedTera;


				let r = ranker.rankAttackers(selectedPokemon, selectedTypes);

				results = r;

				self.displayResults(r);

				// Update URL
				let currentURL = window.location.pathname
				let url = host + 'tera/' + selectedPokemon.id + '/' + selectedTera + '/' + selectedTypes.join('-');

				if(selectedPokemon.getTraitURLStr()){
					url += '/' + selectedPokemon.getTraitURLStr();
				}

				let data = {p: selectedPokemon.id, a: selectedTypes.join("-"), t: selectedTera, tr: selectedPokemon.getTraitURLStr() };

				window.history.pushState(data, "Tera Raid Counters", url);

				$(".share-link input").val(url);
				document.title = selectedPokemon.name + ' Tera Raid Counters | PvPoke';

				// Send Google Analytics pageview
				if(currentURL != url){
					gtag('event', 'page_view', { page_location: url, page_title: document.title,
					pageview_type: 'virtual'});
				}

				// Scroll to results

				$("html, body").animate({ scrollTop: $("table#results").offset().top - 185 }, 500);
			});

			// Select a Pokemon from the raid boss select list on input search

			$("#poke-search").keyup(function(e){
				let searchStr = $(this).val().toLowerCase().trim();

				$("#poke-select option").each(function(index, value){
					let name = $(this).html().toLowerCase();

					if(name.startsWith(searchStr)){
						$(this).prop("selected", "selected");
						selectNewPokemon($(this).val());
						return false;
					}
				});
			});

			// Scroll the name dropdown into view when the searchbox is selected

			$("#poke-search").focus(function(e){
				$("html, body").animate({ scrollTop: $("#poke-search").offset().top - 65 }, 500);
			});

			// Filter the counter results

			$("#results-search").keyup(function(e){
				let searchStr = $(this).val().toLowerCase();
				let searchResults = filterResults(searchStr);

				// Show all results for a species if it's the only result
				let showBest = displayOptions.showBest;
				let filteredSpecies = [];

				for(var i = 0; i < searchResults.length; i++){
					if(filteredSpecies.indexOf(searchResults[i].pokemon.id) == -1){
						filteredSpecies.push(searchResults[i].pokemon.id);
					}
				}

				if(filteredSpecies.length == 1){
					showBest = false;
				}

				self.displayResults(searchResults, false, showBest);
			});

			// Clear searchbar on focus
			$("#results-search").focus(function(e){
				$(this).val('');
			});

			// Scroll the results into view when the searchbox is selected

			$("#results-search").focus(function(e){
				$("html, body").animate({ scrollTop: $("#results-search").offset().top - 65 }, 500);
			});

			// Clear the search input on focus

			$("#poke-search").focus(function(e){
				$("#poke-search").val("");
			});

			// Select a Pokemon from the dropdown
			$("#poke-select").change(function(e){
				selectNewPokemon($(this).find("option:selected").val());

				$(this).removeClass("error");
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

				$(this).removeClass("error");

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

			// Enable or disable a boss trait
			$("body").on("change", ".boss-section .trait-item", function(e){
				if($(this).hasClass("on")){
					selectedPokemon.enableTrait($(this).attr("id"));
				} else{
					selectedPokemon.disableTrait($(this).attr("id"));
				}

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

				let traits = r.pokemon.getActiveTraits();

				for(var i = 0; i < traits.length; i++){
					$details.find(".traits").append("<div class=\"trait\">"+traits[i].name+"</div>");
				}

				if(traits.length == 0){
					$details.find(".traits-container").hide();
				}

				// Display typings
				for(var i = 0; i < r.pokemon.types.length; i++){
					$details.find(".typings").append(createTypeLabel(r.pokemon.types[i], false, false));
				}

				$details.find(".tera-type .type-container").append(createTypeLabel(r.pokemon.tera, true, false));

				let modal = modalWindow(r.pokemon.name, $details);
			});

			// Open results options modal
			$(".results-section a.results-options").click(function(e){
				e.preventDefault();

				let modal = modalWindow("Counter Options", $(".results-options.template").first().clone().removeClass("template"));

				$(".modal .score-sort-select option[value='"+displayOptions.sort+"']").prop("selected", "selected");

				if(displayOptions.showBest){
					$(".modal .check.show-best").addClass("on");
				}

				// Save display options and refresh display

				$(".modal button.save").click(function(e){
					displayOptions.sort = $(".modal .score-sort-select option:selected").val();
					displayOptions.showBest = $(".modal .check.show-best").hasClass("on");
					closeModalWindow();

					self.displayResults(results, false);
				});
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

				selectedPokemon = new Pokemon(id, selectedTera, true);

				// Set selected types
				selectedTypes = [];

				for(var i = 0; i < selectedPokemon.types.length; i++){
					selectedTypes.push(selectedPokemon.types[i]);
				}

				// Set any default moves, types, or traits
				if(selectedPokemon.defaults){
					if(selectedPokemon.defaults.moveTypes){
						selectedTypes = selectedPokemon.defaults.moveTypes;
					}

					if(selectedPokemon.defaults.teraType){
						selectedTera = selectedPokemon.defaults.teraType;
					}
				}

				updateRaidBossDisplay();
			}

			// Update the raid boss UI with the current values
			function updateRaidBossDisplay(){
				$(".boss-section").attr("tera-type", selectedTera);

				if(selectedTera){
					$(".boss-section .tera-type-container .tera-icon").show();
					$(".boss-section #tera-select option[value='"+selectedTera+"']").prop("selected", "selected");
				} else{
					$(".boss-section .tera-type-container .tera-icon").hide();
				}

				// Display attack types
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

				// Display boss traits
				$(".boss-traits .trait-item").remove();

				if(selectedPokemon && selectedPokemon.traits.length > 0){
					$(".boss-section .traits-container").show();

					for(var i = 0; i < selectedPokemon.traits.length; i++){
						let t = selectedPokemon.traits[i];
						let $trait = $(".trait-item.template").clone().removeClass("template");

						$trait.find(".trait-name").text(t.name);
						$trait.attr("id", t.id);

						if(t.active){
							$trait.addClass("on");
						}

						$(".boss-traits").append($trait);
					}
				} else{
					$(".boss-section .traits-container").hide();
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
