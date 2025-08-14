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

            let selectedMove;
            let lastSavedJSON; // JSON of the last saved data

			this.init = function(){
                data = gm.data;

                self.fillAllFormOptions();

                if(get){
                    self.loadGetData();
                }
			}

            this.updateLastSavedJSON = function(){
                lastSavedJSON = JSON.stringify(selectedMove);
                $("#save-changes-btn").attr("disabled", "disabled");
            }

            // Dynamically insert form field options

            this.fillAllFormOptions = function(){
                let allTypes = Pokemon.getAllTypes();
                self.fillFormOptions($("#move-type"), allTypes);
            }

            // Fill the options for a single select element
            this.fillFormOptions = function($el, options){
                let fieldName = $el.attr("name");

                options.forEach(option => {
                    switch(fieldName){
                        case "move-type":
                            $el.append($("<option value='"+option.toLowerCase()+"'>"+option+"</option>"))
                            break;

                        case "add-learnset":
                            $el.append($("<option value='"+option.speciesId+"'>"+option.speciesName+"</option>"))
                            break;

                        default:
                            $el.append($("<option value='"+option+"'>"+option+"</option>"))
                            break;

                    }
                });

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
							case "m":
								selectedMove = gm.getMoveDataById(val);

                                if(selectedMove){
                                    self.updateLastSavedJSON();
                                    self.displaySelectedMove();
                                    self.displayLearnset();
                                }
								break;
						}
					}
				}
			}

            // Update all form fields with data from the selected Pokemon entry

            this.displaySelectedMove = function(){
                if(! selectedMove){
                    return false;
                }

                // Name & ID's

                $("#move-id").val(selectedMove.moveId);
                $("#move-name").val(selectedMove.name);
                $("#abbreviation").val(selectedMove.abbreviation);

                // Game data

                $("#move-type option[value='"+selectedMove.type+"']").prop("selected", "selected");
                $("#move-type").attr("class", selectedMove.type);

                $("#move-power").val(selectedMove.power);

                // Fast Move and Charged Move specific values
                $(".form-group[data='category'] .option").removeClass("on");
                $("#move-archetype").find("option:not(:first-child)").remove();

                if(selectedMove.energy > 0){
                    // Charged Move
                    $(".form-group[data='category'] .option[value='charged']").addClass("on");

                    $("#move-energy").val(selectedMove.energy);

                    self.fillFormOptions($("#move-archetype"), gm.data.chargedMoveArchetypes);

                    if(selectedMove?.buffs){
                        $("#move-effect option[value='"+selectedMove.buffTarget+"']").prop("selected", "selected");
                        $("#effect-apply-chance").val(selectedMove.buffApplyChance);
                        $(".move-effect-field").show();

                        switch(selectedMove.buffTarget){
                            case "self":
                                $("#attacker-stat-atk").val(selectedMove.buffs[0]);
                                $("#attacker-stat-def").val(selectedMove.buffs[1]);
                                $(".stat-modifiers .gm-field-wrapper").eq(0).show();
                                $(".stat-modifiers .gm-field-wrapper").eq(1).hide();
                                break;

                            case "opponent":
                                $("#defender-stat-atk").val(selectedMove.buffs[0]);
                                $("#defender-stat-def").val(selectedMove.buffs[1]);
                                $(".stat-modifiers .gm-field-wrapper").eq(1).show();
                                $(".stat-modifiers .gm-field-wrapper").eq(0).hide();
                                break; 

                            case "both":
                                $("#attacker-stat-atk").val(selectedMove.buffsSelf[0]);
                                $("#attacker-stat-def").val(selectedMove.buffsSelf[1]);
                                $("#defender-stat-atk").val(selectedMove.buffsOpponent[0]);
                                $("#defender-stat-def").val(selectedMove.buffsOpponent[1]);
                                $(".stat-modifiers .gm-field-wrapper").show();
                                break; 

                        }
                    } else{
                        $(".move-effect-field").hide();
                    }

                    $(".fast-only").hide();
                    $(".charged-only").show();
                } else{
                    // Fast Move
                    $(".form-group[data='category'] .option[value='fast']").addClass("on");

                    $("#move-energy").val(selectedMove.energyGain);
                    $("#move-turns").val(selectedMove.turns);

                    self.fillFormOptions($("#move-archetype"), gm.data.chargedMoveArchetypes);

                    $(".charged-only").hide();
                    $(".move-effect-field").hide();
                    $(".fast-only").show();
                }

                $("#move-archetype option[value='"+selectedMove.archetype+"']").prop("selected", "selected");

                self.updateExportCode();
                //self.validatePokemon();
            }

            self.displayLearnset = function(){
                let pokemonWithMove = [];
                let pokemonWithoutMove = [];

                // Generate list of Pokemon which already have the move and Pokemon which don't
                let pokemonList = data.pokemon.forEach(pokemon => {
                    if(pokemon.fastMoves.includes(selectedMove.moveId) || pokemon.chargedMoves.includes(selectedMove.moveId)){
                        pokemonWithMove.push(pokemon);
                    } else{
                        pokemonWithoutMove.push(pokemon);
                    }
                });

                pokemonWithMove.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));
                pokemonWithoutMove.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

                GMEditorUtils.DisplayEditableList("learnset", pokemonWithMove);
                self.fillFormOptions($("#add-learnset"), pokemonWithoutMove);
            }

            // Given a base list element and data items, output HTML for an editable list

            this.displayEditableList = function($el, listItems){
                let dataType = $el.attr("data");
                $el.html("");

                if(! listItems || listItems?.length == 0){
                    return;
                }

                switch(dataType){
                    case "fastMoves":
                    case "chargedMoves":
                    case "legacyMoves":
                    case "eliteMoves":
                        if(typeof listItems !== "undefined"){
                            listItems.forEach(id => {
                                let move = gm.getMoveById(id);

                                if(move){
                                    let $item = $("<div></div>");
                                    $item.html(move.name);
                                    $item.addClass(move.type);
                                    $item.attr("data", id);
                                    $item.append("<span></span>");

                                    $el.append($item);
                                }
                            });
                        }
                        break;

                    default:
                        listItems.forEach(id => {
                            let $item = $("<div></div>");
                            $item.html(id);
                            $item.attr("data", id);
                            $item.append("<span></span>");

                            $el.append($item);
                        });
                        break;
                }
            }

            // Run validations on the full Pokemon entry
            this.validatePokemon = function(){
                let pokemonErrors = GMEditorUtils.ValidatePokemonEntry(selectedMove);

                $("#gm-editor-pokemon .error-label").remove();

                pokemonErrors.forEach(pokeError => {
                    let $errorItem = $("<div class='error-label'></div>");
                    let $field = $("#gm-editor-pokemon [name='"+pokeError.fieldName+"']").first();
                    let fieldErrors = pokeError.errors;

                    fieldErrors.forEach(fieldError => {
                        $errorItem.append($("<div>"+fieldError+"</div>"));
                    });

                    $field.after($errorItem);
                    $errorItem.show();
                });

                // Enable or disable save button
                if(pokemonErrors.length > 0){
                    $("#save-changes-btn").attr("disabled", "disabled");
                }
            }

            this.updateExportCode = function(){
                let json = JSON.stringify(selectedMove)
                $("textarea.import").val(json);

                // Enable or disable save button
                if(json != lastSavedJSON && data?.id && data?.id != "gamemaster"){
                    $("#save-changes-btn").removeAttr("disabled");
                } else{
                    $("#save-changes-btn").attr("disabled", "disabled");
                }
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
                    case "released":
                        selectedMove.released = val == "yes" ? true : false;
                        self.displayselectedMove();
                        break;
                }

            });

            // Generate new default IV's
            $("button#generate-default-ivs").click(function(e){
                selectedMove.defaultIVs = gm.generateDefaultIVsByPokemon(selectedMove);
                self.displayselectedMove();
            });

            // Event handler for changing a select field
            $("#gm-editor-pokemon select").on("change", function(e){
                let fieldName = $(this).attr("name");
                let val = $(this).val();

                switch(fieldName){
                    case "primary-type":
                        selectedMove.types[0] = val;
                        break;

                    case "secondary-type":
                        selectedMove.types[1] = val;
                        break;

                    case "buddy-distance":
                        selectedMove.buddyDistance = parseInt(val);
                        break;

                    case "third-move-cost":
                        selectedMove.thirdMoveCost = parseInt(val);
                        break;

                    case "add-fast-move":
                        selectedMove.fastMoves.push(val);
                        break;

                    case "add-charged-move":
                        selectedMove.chargedMoves.push(val);
                        break;

                    case "add-elite-move":
                        if(selectedMove?.eliteMoves){
                            selectedMove.eliteMoves.push(val);
                        } else{
                            selectedMove.eliteMoves = [val];
                        }
                        
                        break; 

                    case "add-legacy-move":
                        if(selectedMove?.legacyMoves){
                            selectedMove.legacyMoves.push(val);
                        } else{
                            selectedMove.legacyMoves = [val];
                        }
                        break;

                    case "add-tag":
                        if(selectedMove?.tags){
                            selectedMove.tags.push(val);
                        } else{
                            selectedMove.tags = [val];
                        }
                        break;
                }

                self.displayselectedMove();
            });

            // Submit an input field when pressing enter
            $("body").on("keypress", "#gm-editor-pokemon input", function(e){
                if(e.which == 13){
                    $(this).blur();
                }
            });

            // Event handler for changing an input field
            $("body").on("change", "#gm-editor-pokemon input", function(e){
                let fieldName = $(this).attr("name");
                let val = $(this).val();

                switch(fieldName){
                    case "species-id":
                        selectedMove.speciesId = val;
                        break;

                    case "species-name":
                        selectedMove.speciesName = val;
                        break;

                    case "alias-id":
                        if(val != ""){
                            selectedMove.aliasId = val;
                        } else{
                            delete selectedMove.aliasId;
                        }
                        break;

                    case "dex":
                        selectedMove.dex = parseInt(val);
                        break;

                    case "stats-atk":
                    case "stats-def":
                    case "stats-hp":
                        let key = $(this).attr("data");
                        selectedMove.baseStats[key] = parseInt(val);
                        selectedMove.defaultIVs = gm.generateDefaultIVsByPokemon(selectedMove);
                        break;

                    case "level-floor":
                        if(val != ""){
                            selectedMove.levelFloor = Math.floor(val * 2) / 2;
                        } else{
                            delete selectedMove.levelFloor;
                        }

                        selectedMove.defaultIVs = gm.generateDefaultIVsByPokemon(selectedMove);
                        break;

                    case "iv-level":
                    case "iv-atk":
                    case "iv-def":
                    case "iv-hp":
                        let ivKey = $(this).closest("tr").attr("data");
                        let index = parseInt($(this).attr("data"));

                        if(ivKey && index !== null){
                            selectedMove.defaultIVs[ivKey][index] = Math.floor(val * 2) / 2; // Ensure levels are at whole or half numbers
                        }
                        break;

                    case "add-nickname":
                        if(val != ""){
                            if(selectedMove?.nicknames){
                                selectedMove.nicknames.push(val.toLowerCase());
                            } else{
                                selectedMove.nicknames = [val.toLowerCase()];
                            }

                            $(this).val("");
                        }
                        break;

                    case "search-priority":
                        selectedMove.searchPriority = parseInt(val);
                        break;

                }

                self.displayselectedMove();
            });

            // Event handler for deleting an item from an editable list
            $("body").on("click", ".editable-list > div > span", function(e){
                let id = $(this).closest("div").attr("data");
                let key = $(this).closest(".editable-list").attr("data");

                if(id && key && selectedMove.hasOwnProperty(key)){
                    selectedMove[key] = selectedMove[key].filter(item => item != id);

                    // Enforce one Fast Attack or one Charged Attack
                    if(selectedMove[key].length == 0){
                        switch(key){
                            case "fastMoves":
                                selectedMove.fastMoves = ["SPLASH"];
                                break;

                            case "chargedMoves":
                                selectedMove.chargedMoves = ["STRUGGLE"];
                                break;

                            default:
                                delete selectedMove[key];
                                break;
                        }
                    }

                    self.displayselectedMove();
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
                    if(customData && customData?.speciesId){
                        selectedMove = customData;
                        self.displayselectedMove();
                    }
                } catch(e){
                    console.error(e);
                    modalWindow("Data Error", $(".import-error").first());
                    selectedMove = JSON.parse(lastSavedJSON);
                    self.displayselectedMove();
                }
                
            });

            // Save data to localstorage

            $("#save-changes-btn").click(function(e){
                let errors = []; // Add validation here

                if(errors.length == 0){
                    gm.saveCustomGameMaster(data);
                    modalWindow("Data Saved", $(".save-data").first());

                    lastSavedJSON = JSON.stringify(selectedMove);
                } else{
                    modalWindow("Error", $(".save-data-error").first());
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
