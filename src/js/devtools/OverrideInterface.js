// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var data;
			var gm = GameMaster.getInstance();
			var context = "overrides"; // Used for internal reference
			var battle = new Battle();

			var selectedPokemonIndex = -1;

			var sort = "id";

			this.context = "rankings"; // Used for external reference

			this.init = function(){

				self.loadOverrides(1500, "all");

				$(".format-select").on("change", selectFormat);
				$("body").on("click", ".check", checkBox);

				pokeSearch.setBattle(battle);
			};

			// Grabs ranking data from the Game Master

			this.loadOverrides = function(league, cup){
				$(".rankings-container").html('');
				$(".loading").show();

				battle.setCup(cup);
				battle.setCP(league);

				if(! battle.getCup().levelCap){
					battle.setLevelCap(50);
				}


				gm.loadRankingData(self, "overall", league, cup);

				/* This timeout allows the interface to display the loading message before
				being thrown into the data loading loop */

				setTimeout(function(){
					$.getJSON( webRoot+"data/overrides/"+cup+"/"+league+".json?v="+siteVersion, function( data ){
						self.displayOverrideData(data);
					});
				}, 50);

			}

			// Displays the grabbed data. Showoff.

			this.displayOverrideData = function(rankings){
				data = rankings;

				// Assign weightings
				for(var i = 0; i < rankings.length; i++){
					if(typeof rankings[i].weight == 'undefined'){
						rankings[i].weight = 1;
					}
				}

				this.sortOverrideData();

				// Create an element for each ranked Pokemon
				$(".rankings-container").html('');

				for(var i = 0; i < rankings.length; i++){
					var r = rankings[i];

					var pokemon = new Pokemon(r.speciesId, 0, battle);

					if(! pokemon.speciesId){
						rankings.splice(i, 1);
						i--;
						continue;
					}

					pokemon.initialize(true);

					if(! pokemon.speciesId){
						continue;
					}

					// Get names of of ranking moves
					var displayedMoves = [];

					if(r.fastMove){
						pokemon.selectMove("fast", r.fastMove);
						displayedMoves.push(pokemon.fastMove.name);
					}

					if(r.chargedMoves){
						for(var n = 0; n < r.chargedMoves.length; n++){
							pokemon.selectMove("charged", r.chargedMoves[n], n);
							displayedMoves.push(pokemon.chargedMoves[n].name);
						}
					}

					var moveNameStr = displayedMoves.join(", ");
					var displayWeight = 1;

					if(typeof r.weight !== 'undefined'){
						displayWeight = r.weight;
					}

					// Is this the best way to add HTML content? I'm gonna go with no here. But does it work? Yes!

					var $el = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\" data=\""+pokemon.speciesId+"\"><div class=\"name-container\"><span class=\"name\">"+pokemon.speciesName+"</span><div class=\"moves\">"+moveNameStr+"</div></div><div class=\"rating-container\"><div class=\"rating\">x"+displayWeight+"</div><div class=\"clear\"></div></div><div class=\"details\"></div>");

					$(".section.white > .rankings-container").append($el);

					// Determine XL category

					if(pokemon.needsXLCandy()){
						$el.find(".name").append("<span class=\"xl-info-icon\">XL</span>");
					}
				}

				$(".loading").hide();
				$(".rank").on("click", selectPokemon);

				// If search string exists, process it

				if($(".poke-search").first().val() != ''){
					$(".poke-search").first().trigger("keyup");
				}

				var json = JSON.stringify(data);

				$("textarea.import").html(json);
			}

			// Sorty alphabetically or by weight
			this.sortOverrideData = function(){
				if(sort == "id"){
					data.sort((a,b) => (a.speciesId > b.speciesId) ? 1 : ((b.speciesId > a.speciesId) ? -1 : 0));
				} else if(sort == "weight"){
					data.sort((a,b) => (a.weight > b.weight) ? -1 : ((b.weight > a.weight) ? 1 : 0));
				}
			}

			this.openPokeSelect = function(pokemon){
				modalWindow("Select Pokemon", $(".poke.single").first());

				pokeSelector = new PokeSelect($(".modal .poke"), 1);
				pokeSelector.setContext("modal"+context);
				pokeSelector.init(gm.data.pokemon, battle);

				if(! pokemon){
					// New Pokemon

					pokeSelector.clear();

					$(".modal-content").append("<div class=\"center\"><div class=\"save-poke button\">Add Pokemon</div></div>");

					$(".modal .poke-search").focus();

					selectedPokemonIndex = -1;
				} else{

					// Edit existing Pokemon

					pokeSelector.setSelectedPokemon(pokemon);

					$(".modal-content").append("<div class=\"center\"><div class=\"save-poke button\">Save Changes</div></div>");
				}

				// Show custom rankings options for moveset overrides
				$(".modal .poke .custom-ranking-options").show();

				// Add or save a Pokemon in the Pokemon list

				$(".modal .save-poke").on("click", function(e){

					// Make sure something's selected
					if(! pokeSelector){
						return false;
					}

					var pokemon = pokeSelector.getPokemon();

					if(! pokemon){
						return false;
					}

					if(selectedPokemonIndex > -1){
						data[selectedPokemonIndex] = self.overrideFromPokemon(pokemon);
					} else{
						data.push(self.overrideFromPokemon(pokemon));
					}

					closeModalWindow();

					self.displayOverrideData(data);

				});
			}

			this.overrideFromPokemon = function(pokemon){
				var speciesId = pokemon.speciesId;

				if(pokemon.shadowType == "shadow"){
					speciesId += "_shadow";
				}

				var override = {
					speciesId: pokemon.speciesId,
					fastMove: pokemon.fastMove.moveId,
					chargedMoves: [],
					weight: pokemon.rankingWeight
				};

				for(var i = 0; i < pokemon.chargedMoves.length; i++){
					override.chargedMoves.push(pokemon.chargedMoves[i].moveId);
				}

				return override;
			}

			// Open Pokeselect on enter press for searchbar

			$(".poke-search").first().keypress(function(e){
				if(e.which == 13){
					// Open Pokeselect for first visible Pokemon
					var $rankings = $(".rankings-container .rank:visible");

					if($rankings.length > 0){
						$rankings.first().trigger("click");
					} else{
						self.openPokeSelect();

						$(".modal .poke-search").val($(this).val());
					}
				}
			})

			// Event handler for changing the cup select

			function selectFormat(e){
				var cp = $(".format-select option:selected").val();
				var cup = $(".format-select option:selected").attr("cup");

				self.loadOverrides(cp, cup);
			}

			// Event handler clicking on a Pokemon item, load detail data

			function selectPokemon(e){

				var cup = $(".format-select option:selected").attr("cup");
				var category = $(".ranking-categories a.selected").attr("data");
				var $rank = $(this).closest(".rank");

				selectedPokemonIndex = $($rank).index(".rank");

				var r = data[selectedPokemonIndex];

				var pokemon = new Pokemon(r.speciesId, 0, battle);

				pokemon.initialize(true);
				pokemon.selectRecommendedMoveset();

				if(r.fastMove){
					pokemon.selectMove("fast", r.fastMove);
				}

				if(r.chargedMoves){
					for(var n = 0; n < r.chargedMoves.length; n++){
						pokemon.selectMove("charged", r.chargedMoves[n], n);
					}
				}

				if(typeof r.weight !== 'undefined'){
					pokemon.rankingWeight = r.weight;
				}

				self.openPokeSelect(pokemon);
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
				$(this).trigger("stateChange");
			}

			$("button.toggle-sort").click(function(e){
				if(sort == "id"){
					sort = "weight";
				} else if(sort == "weight"){
					sort = "id";
				}

				$("button.toggle-sort").html("Sort: " + sort);

				self.sortOverrideData();
				self.displayOverrideData(data);

				$(".rankings-container").scrollTop(0);
			});

			$("button.new-pokemon").click(function(e){
				self.openPokeSelect();
			});

			// Clear all weightings from the overrides

			$(".clear-weights").click(function(e){
				for(var i = 0; i < data.length; i++){
					delete data[i].weight;
				}

				self.displayOverrideData(data);
			});

			// Import movesets for all eligible Pokemon from the open league rankings

			$(".import-movesets").click(function(e){
				var data = [];

				var rankings = [];
				var cup = battle.getCup();

				var key = "all" + "overall" + battle.getCP();

				if(gm.rankings[key]){
					rankings = [gm.rankings[key]][0]; // Wrapped in an array for weird reasons
				}

				var eligiblePokemon = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude);

				for(var i = 0; i < rankings.length; i++){
					var r = rankings[i];
					var isEligible = false;

					for(var n = 0; n < eligiblePokemon.length; n++){
						if(eligiblePokemon[n].speciesId == r.speciesId){
							isEligible = true;
							break;
						}
					}

					if(isEligible){
						var override = {
							speciesId: r.speciesId,
							fastMove: r.moveset[0],
							chargedMoves: []
						};

						for(var n = 1; n < r.moveset.length; n++){
							override.chargedMoves.push(r.moveset[n]);
						}

						data.push(override);
					}
				}

				self.sortOverrideData();
				self.displayOverrideData(data);
			});

			// Copy overrides to clipboard

			$(".export-json").click(function(e){
				e.preventDefault();

				var el = $(e.target).prev()[0];
				el.focus();
				el.setSelectionRange(0, el.value.length);
				document.execCommand("copy");
			});

			// Open a link to the ranker in a new tab

			$("a.ranker-link").click(function(e){
				e.preventDefault();

				window.open(webRoot + 'ranker.php?cup=' + battle.getCup().name + '&cp=' + battle.getCP(), '_blank');
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
