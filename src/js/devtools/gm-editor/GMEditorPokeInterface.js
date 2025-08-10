// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){
            let gm = GameMaster.getInstance();
            let data;
            let self = this;
            let battle = new Battle();

            let selectedPokemon;


			this.init = function(){
                data = gm.data;

                if(get){
                    self.loadGetData();
                }
			}

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				// Cycle through parameters and set them

				for(let key in get){
					if(get.hasOwnProperty(key)){

						let val = get[key];

						// Process each type of parameter

						switch(key){
							case "p":
								selectedPokemon = gm.getPokemonById(val);

                                if(selectedPokemon){
                                    self.displaySelectedPokemon();
                                    self.updateExportCode();
                                }
								break;
						}
					}
				}
			}

            // Update all form fields with data from the selected Pokemon entry

            this.displaySelectedPokemon = function(){
                if(! selectedPokemon){
                    return false;
                }

                // Name & ID's

                $("#species-id").val(selectedPokemon.speciesId);
                $("#species-name").val(selectedPokemon.speciesName);
                $("#dex").val(selectedPokemon.dex);

                if(selectedPokemon?.aliasId){
                    $("#alias-id").val(selectedPokemon.aliasId);
                }

                // Game data
                $("#stats-atk").val(selectedPokemon.baseStats.atk);
                $("#stats-def").val(selectedPokemon.baseStats.def);
                $("#stats-hp").val(selectedPokemon.baseStats.hp);

                $("#buddy-distance option[value='"+selectedPokemon.buddyDistance+"']").prop("selected", "selected");
                $("#third-move-cost option[value='"+selectedPokemon.thirdMoveCost+"']").prop("selected", "selected");

                if(selectedPokemon?.levelFloor){
                    $("#level-floor").val(selectedPokemon.levelFloor);
                }

            }

            this.updateExportCode = function(){
                $("textarea.import").html(JSON.stringify(selectedPokemon));
            }

            // Search for a Pokemon
			let searchTimeout;
			let searchStr = '';
			let $target = null;
            let searchMode = "filter";

			$("body").on("keyup", ".poke-search", function(e){
				searchStr = $(this).val().toLowerCase().trim();

				$target = $(".train-table");

				// Reset the timeout when a new key is typed. This prevents queries from being submitted too quickly and bogging things down on mobile.
				window.clearTimeout(searchTimeout);
				searchTimeout = window.setTimeout(submitSearchQuery, 200);
			});

			function submitSearchQuery(){
				let list = GameMaster.getInstance().generatePokemonListFromSearchString(searchStr, battle);
                
                $target.find("tbody tr").removeClass("find");
                $target.find("tbody tr").show();

                if(searchMode == "filter"){
                    // Only show matching rows
                    $target.find("tbody tr").each(function(index, value){
                        let id = $(this).attr("data");

                        if(list.includes(id)){
                            $(this).show();
                        } else{
                            $(this).hide();
                        }
                    });
                } else if(searchMode == "find" && list.length > 0){
                    // Scroll to the first matching row
                    let targetId = list[0];
                    let $targetRow = $target.find("tbody tr[data='"+targetId+"']");

                    if($targetRow.length > 0){
                        $targetRow.addClass("find");

                        let elTop = $targetRow.position().top;
                        let containerTop = $(".table-container").position().top;
                        let gotoTop = elTop - containerTop - 20;

                        $(".table-container").scrollTop(gotoTop);
                    }
                }

			}

            // Event handler for selecting form group options
            $(".form-group .option").click(function(e){
                let val = $(this).attr("value");
                let $parent = $(this).closest(".form-group");

                $parent.find(".option").removeClass("on");
                $(this).addClass("on");

                switch($parent.attr("data")){
                    case "search-mode":
                        searchMode = val;

                        if($(".poke-search").first().val() != ''){
                            $(".poke-search").first().trigger("keyup");
                        }
                        break;
                }

            });

			// Event handler for sorting table columns

			$("thead a").on("click", function(e){

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

				switch(sort){
                    case "dex":
                        data.pokemon.sort((a,b) => (a.dex > b.dex) ? sortDirection : ((b.dex > a.dex) ? -sortDirection : 0));
                        break;

                    case "name":
                        data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? sortDirection : ((b.speciesName > a.speciesName) ? -sortDirection : 0));
                        break;

                    case "priority":
                        data.pokemon.sort((a,b) => {
                            let priorityA = a?.searchPriority ? a.searchPriority : 0;
                            let priorityB = b?.searchPriority ? b.searchPriority : 0;

                            if(priorityA > priorityB){
                                return -sortDirection;
                            } else if(priorityB > priorityA){
                                return sortDirection;
                            } else{
                                return 0;
                            }
                        });
                        break;

                    case "released":
                        data.pokemon.sort((a,b) => (a.released > b.released) ? -sortDirection : ((b.released > a.released) ? sortDirection : 0));
                        break;
                }

				self.displayPokemonList();
			});

            // Duplicate a Pokemon entry

            $("body").on("click", ".train-table a.poke-copy", function(e){
                e.preventDefault();

                let speciesId = $(this).closest("tr").attr("data");

                if(speciesId){
                    
                    let pokemon = data.pokemon.find(p => p.speciesId == speciesId);

                    if(pokemon){
                        let pokemonIndex = data.pokemon.findIndex(p => p.speciesId == speciesId);
                        let newPokemon = {...pokemon};

                        let isUniqueId = false;
                        let copyCount = 1;
                        let newId;
                        let newName;

                        // Iterate on copy counts to find a unique ID (eg. charizard_copy_2)
                        while(! isUniqueId){
                            newId = newPokemon.speciesId + "_copy";
                            newName = newPokemon.speciesName + " (Copy)";

                            if(copyCount > 1){
                                newId += "_" + copyCount;
                                newName = newPokemon.speciesName + " (Copy " + copyCount + ")";
                            }

                            if(! data.pokemon.find(p => p.speciesId == newId)){
                                isUniqueId = true;
                            }

                            copyCount++;
                        }

                        newPokemon.speciesId = newId;
                        newPokemon.speciesName = newName;

                        data.pokemon.splice(pokemonIndex+1, 0, newPokemon);

                        self.displayPokemonList();

                        if($(".poke-search").first().val() != ''){
                            $(".poke-search").first().trigger("keyup");
                        }
                    }
                }
            });

            // Delete a Pokemon entry

            $("body").on("click", ".train-table a.poke-delete", function(e){
                e.preventDefault();

                let speciesId = $(this).closest("tr").attr("data");

                if(speciesId){
                    let pokemonIndex = data.pokemon.findIndex(p => p.speciesId == speciesId);
                    let pokemon = data.pokemon.find(p => p.speciesId == speciesId);

                    if(pokemon){
                        modalWindow("Delete Pokemon", $(".delete-poke-confirm").first());
                        $(".modal span.name").html(pokemon.speciesName);
                        
                        $(".modal .button.yes").click(function(e){
                            
                            closeModalWindow();

                            data.pokemon.splice(pokemonIndex, 1);

                            self.displayPokemonList();
                        });
                    }
                }
            });

            // Copy list text

            $(".custom-rankings-import .copy").click(function(e){
                var el = $(e.target).prev()[0];
                el.focus();
                el.setSelectionRange(0, el.value.length);
                document.execCommand("copy");
            });

            // Copy text to import

            $(".custom-rankings-import textarea.import").on("click", function(e){
                this.setSelectionRange(0, this.value.length);
            });

            // Import text

            $(".custom-rankings-import textarea.import").on("change", function(e){
                try{
                    let customData = JSON.parse($(this).val());
                    if(customData.length > 0 && customData.every(p => p?.speciesId)){
                        data.pokemon = customData;
                        self.displayPokemonList();
                    }
                } catch(e){
                    console.error(e);
                    modalWindow("Data Error", $(".import-error").first());
                }
                
            });

            // Save data to localstorage

            $("body").on("click", ".modal #save-new-modal-btn", function(e){
                // Validate new entry
                let title = $(".modal #gm_name").val();
                let id = GMEditorUtils.StringToID(title, "gm_id");
                let errors = GMEditorUtils.ValidateField("gm_id", id);

                $(".modal #gm_name + .error-label").hide();

                if(errors.length == 0){
                    data.title = title;
                    data.id = id;

                    self.updateExportCode();

                    gm.saveCustomGameMaster(data);
                    
                    // Navigate to edit page
                    window.location.href = $("a#save-new-btn").attr("href");
                } else{
                    $(".modal #gm_name + .error-label").show();
                    $(".modal #gm_name + .error-label").html(errors.join(" "));
                }

                console.log(errors);

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
