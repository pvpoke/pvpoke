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
            let lastSavedLearnset; // JSON of the last saved learnset

            let pokemonWithMove = [];
            let pokemonWithoutMove = [];

			this.init = function(){
                data = gm.data;

                self.fillAllFormOptions();

                if(get){
                    self.loadGetData();
                }

                pokeSearch.setBattle(battle);

                // Gather initial learnset
                if(selectedMove){
                    pokemonWithMove = [];
                    pokemonWithoutMove = [];

                    data.pokemon.forEach(pokemon => {
                        if(pokemon.fastMoves.includes(selectedMove.moveId) || pokemon.chargedMoves.includes(selectedMove.moveId)){
                            pokemonWithMove.push(pokemon);
                        } else{
                            pokemonWithoutMove.push(pokemon);
                        }
                    });

                    pokemonWithMove.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));
                    pokemonWithoutMove.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

                    lastSavedLearnset = JSON.stringify(
                        pokemonWithMove.flatMap(pokemon => pokemon.speciesId)
                    );

                    submitSearchQuery();
                    self.displayLearnset();
                }

                // Remove save and edit buttons when editing default
                if(settings.gamemaster == "gamemaster"){
                    $("#save-changes-btn").remove();
                }
			}

            this.updateLastSavedJSON = function(){
                lastSavedJSON = JSON.stringify(selectedMove);
                lastSavedGM = window.localStorage.getItem(settings.gamemaster);
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
                                let moveFound = false;
                                
                                if(val !== "new"){
                                    selectedMove = gm.getMoveDataById(val);

                                    if(selectedMove){
                                        self.updateLastSavedJSON();
                                        self.displaySelectedMove();
                                        moveFound = true;
                                    } else{
                                        modalWindow("Entry Not Found", $(".entry-not-found").first());
                                    }
                                }

                                if(! moveFound){
                                    selectedMove = {
                                        "moveId": "",
                                        "name": "",
                                        "type": "none",
                                        "power": 1,
                                        "energy": 0,
                                        "energyGain": 1,
                                        "turns": 1,
                                        "cooldown": 500,
                                        "archetype": "Low Quality"
                                    };

                                    data.moves.push(selectedMove);
                                    self.updateLastSavedJSON();
                                    self.displaySelectedMove();
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
                        $("#move-effect option").first().prop("selected", "selected");
                        $(".move-effect-field").hide();
                    }

                    let dpe = Math.round((selectedMove.power / selectedMove.energy) * 100) / 100;

                    $("#move-stat-label").html("<b>DPE: </b> " + dpe);

                    $(".fast-only").hide();
                    $(".charged-only").show();
                } else{
                    // Fast Move
                    $(".form-group[data='category'] .option[value='fast']").addClass("on");

                    $("#move-energy").val(selectedMove.energyGain);
                    $("#move-turns").val(selectedMove.turns);

                    self.fillFormOptions($("#move-archetype"), gm.data.fastMoveArchetypes);

                    let dpt = Math.round((selectedMove.power / selectedMove.turns) * 100) / 100;
                    let ept = Math.round((selectedMove.energyGain / selectedMove.turns) * 100) / 100;

                    $("#move-stat-label").html("<b>DPT: </b> " + dpt + ", " + "<b>EPT: </b> " + ept + " ");

                    $(".charged-only").hide();
                    $(".move-effect-field").hide();
                    $(".fast-only").show();
                }

                $("#move-archetype option[value='"+selectedMove.archetype+"']").prop("selected", "selected");

                self.updateExportCode();
                self.validateMove();
            }

            self.displayLearnset = function(){
                GMEditorUtils.DisplayEditableList("learnset", pokemonWithMove);

                // Enable or disable save button
                let json = JSON.stringify(
                    pokemonWithMove.flatMap(pokemon => pokemon.speciesId)
                );

                if(json != lastSavedLearnset && data?.id && data?.id != "gamemaster"){
                    $("#save-changes-btn").removeAttr("disabled");
                }
            }

            // Run validations on the full Pokemon entry
            this.validateMove = function(){
                let moveErrors = GMEditorUtils.ValidateMoveEntry(selectedMove);

                $("#gm-editor-moves .error-label").remove();

                moveErrors.forEach(moveError => {
                    let $errorItem = $("<div class='error-label'></div>");
                    let $field = $("#gm-editor-moves [name='"+moveError.fieldName+"']").first();
                    let fieldErrors = moveError.errors;

                    fieldErrors.forEach(fieldError => {
                        $errorItem.append($("<div>"+fieldError+"</div>"));
                    });

                    $field.after($errorItem);
                    $errorItem.show();
                });

                // Enable or disable save button
                if(moveErrors.length > 0){
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
			let $target = $("#add-learnset");

			$("body").on("keyup", ".poke-search", function(e){
				searchStr = $(this).val().toLowerCase().trim();

				

				// Reset the timeout when a new key is typed. This prevents queries from being submitted too quickly and bogging things down on mobile.
				window.clearTimeout(searchTimeout);
				searchTimeout = window.setTimeout(submitSearchQuery, 200);
			});

			function submitSearchQuery(){
				let list = GameMaster.getInstance().generatePokemonListFromSearchString(searchStr, battle);
                let optionData = pokemonWithoutMove.filter(pokemon => list.includes(pokemon.speciesId));

                let selectedIndex = 0;
                let selectedPokemon;

                if(list.length > 0){
                    selectedPokemon = optionData.find(pokemon => pokemon.speciesId == list[0]);

                    if(selectedPokemon){
                        selectedIndex = optionData.findIndex(pokemon => pokemon.speciesId == selectedPokemon.speciesId);
                    }
                }

                // Display options immediately ahead of and behind the selected Pokemon
                let totalToDisplay = 30;
                let startIndex = Math.max(0, selectedIndex - Math.floor(totalToDisplay / 2));
                let remainingDisplayCount = totalToDisplay - (selectedIndex - startIndex);
                let stopIndex = Math.min(optionData?.length || 0, selectedIndex + remainingDisplayCount);

                $target.find("option").remove();

                // Add options to select element
                for(var i = startIndex; i < stopIndex; i++){
                    let poke = optionData[i];
                    let $option = $("<option value=\""+poke.speciesId+"\">"+poke.speciesName+"</option>");

                    $target.append($option);
                }

                if(selectedPokemon){
                    $target.find("option[value=\""+selectedPokemon.speciesId+"\"]").prop("selected", "selected");
                } else{
                    $target.find("option").first().prop("selected", "selected");
                }

                $target.trigger("change");
			}

            // Event handler for selecting form group options
            $(".form-group .option").click(function(e){
                let val = $(this).attr("value");
                let $parent = $(this).closest(".form-group");

                $parent.find(".option").removeClass("on");
                $(this).addClass("on");

                switch($parent.attr("data")){
                    case "category":
                        if(val == "fast"){
                            selectedMove.energyGain = 1;
                            selectedMove.energy = 0;
                            delete selectedMove?.buffs;
                            delete selectedMove?.buffApplyChance;
                            delete selectedMove?.buffTarget;
                            delete selectedMove?.buffsSelf;
                            delete selectedMove?.buffsOpponent;
                        } else if(val == "charged"){
                            selectedMove.energyGain = 0;
                            selectedMove.energy = 50;
                            selectedMove.turns = 1;
                            selectedMove.cooldown = 500;
                        }

                        selectedMove.archetype = gm.generateArchetypeByMove(selectedMove);

                        self.displaySelectedMove();
                        break;
                }

            });

            // Generate move archetype
            $("button#generate-archetype").click(function(e){
                selectedMove.archetype = gm.generateArchetypeByMove(selectedMove);
                self.displaySelectedMove();
            });

            // Event handler for changing a select field
            $("#gm-editor-moves select, #gm-editor-learnset select").on("change", function(e){
                let fieldName = $(this).attr("name");
                let val = $(this).val();

                switch(fieldName){
                    case "move-type":
                        selectedMove.type = val;
                        break;

                    case "move-effect":

                            switch(val){
                                case "self":
                                case "opponent":
                                    selectedMove.buffTarget = val;
                                    delete selectedMove?.buffsSelf;
                                    delete selectedMove?.buffsOpponent;

                                    if(! selectedMove?.buffs){
                                        selectedMove.buffs = [0,0];
                                    }

                                    if(! selectedMove?.buffApplyChance){
                                        selectedMove.buffApplyChance = "1";
                                    }
                                    break;

                                case "both":
                                    selectedMove.buffTarget = val;

                                    if(! selectedMove?.buffsSelf || ! selectedMove?.buffsOpponent){
                                        if(! selectedMove?.buffs){
                                            selectedMove.buffs = [0,0];
                                            selectedMove.buffsSelf = [0,0];
                                            selectedMove.buffsOpponent = [0, 0];
                                        } else{
                                            selectedMove.buffsSelf = [...selectedMove.buffs];
                                            selectedMove.buffsOpponent = [0, 0];
                                        }
                                    }

                                    if(! selectedMove?.buffApplyChance){
                                        selectedMove.buffApplyChance = "1";
                                    }
                                    break;

                                case "none":
                                    delete selectedMove?.buffs;
                                    delete selectedMove?.buffApplyChance;
                                    delete selectedMove?.buffTarget;
                                    delete selectedMove?.buffsSelf;
                                    delete selectedMove?.buffsOpponent;
                                    break;

                            }

                            selectedMove.archetype = gm.generateArchetypeByMove(selectedMove);
                        break;

                    case "move-archetype":
                        selectedMove.archetype = val;
                        break;

                    case "add-learnset":
                        let selectedPokemon = pokemonWithoutMove.find(pokemon => pokemon.speciesId == val);

                        if(selectedPokemon){
                            $("#add-learnset").attr("class", "editable-list-selector field-mw " + selectedPokemon.types[0]);
                        } else{
                            $("#add-learnset").attr("class", "editable-list-selector field-mw");
                        }
                        break;
                }

                if($(this).closest(".section.white").attr("id") == "gm-editor-moves"){
                    self.displaySelectedMove();
                }
            });

            // Submit an input field when pressing enter
            $("body").on("keypress", "#gm-editor-moves input, #gm-editor-learnset input", function(e){
                if(e.which == 13){

                    if($(this).hasClass("poke-search")){
                        $("#learnset-confirm").trigger("click");
                    } else{
                        $(this).blur();
                    }
                    
                }
            });

            // Add a Pokemon to the learnset
            $("#learnset-confirm").click(function(e){
                let speciesId = $("#add-learnset option:selected").val();

                // Automatically add the move to shadow and mega variants of the same Pokemon
                let selectedPokemon = data.pokemon.filter(pokemon => 
                    pokemon.speciesId == speciesId ||
                    pokemon.speciesId == speciesId + "_shadow" ||
                    pokemon.speciesId == speciesId + "_mega" ||
                    pokemon.speciesId == speciesId + "_mega_x" ||
                    pokemon.speciesId == speciesId + "_mega_y" ||
                    pokemon.speciesId == speciesId + "_primal"
                );

                selectedPokemon.forEach(pokemon => {
                    if(! pokemon.fastMoves.includes(selectedMove.moveId) && ! pokemon.chargedMoves.includes(selectedMove.moveId)){
                        let movepool = selectedMove.energy > 0 ? pokemon.chargedMoves : pokemon.fastMoves;

                        movepool.push(selectedMove.moveId);

                        pokemonWithMove.push(pokemon);
                        pokemonWithoutMove = pokemonWithoutMove.filter(poke => poke.speciesId != pokemon.speciesId);
                    }
                });

                $("#gm-editor-learnset .poke-search").val("");
                $("#gm-editor-learnset .poke-search").trigger("keyup");

                self.displayLearnset();
            });

            // Event handler for changing an input field
            $("body").on("change", "#gm-editor-moves input", function(e){
                let fieldName = $(this).attr("name");
                let val = $(this).val();

                switch(fieldName){
                    case "move-id":
                        selectedMove.moveId = val.toUpperCase();
                        break;

                    case "move-name":
                        selectedMove.name = val;
                        break;

                    case "abbreviation":
                        if(val != ""){
                            selectedMove.abbreviation = val;
                        } else{
                            delete selectedMove.abbreviation;
                        }
                        break;

                    case "move-power":
                        selectedMove.power = parseInt(val);
                        selectedMove.archetype = gm.generateArchetypeByMove(selectedMove);
                        break;

                    case "move-energy":
                        if(selectedMove.energy > 0){
                            selectedMove.energy = Math.max(parseInt(val), 35);

                            if(selectedMove.energy > 100){
                                selectedMove.energy = 100;
                            }
                        } else{
                            selectedMove.energyGain = Math.max(parseInt(val), 1);

                            if(selectedMove.energyGain > 100){
                                selectedMove.energyGain = 100;
                            }
                        }

                        selectedMove.archetype = gm.generateArchetypeByMove(selectedMove);
                        break;

                    case "effect-apply-chance":
                        let chance = parseFloat(val);

                        if(chance < 0){
                            chance = 0;
                        } else if (chance > 1){
                            chance = 1;
                        }

                        selectedMove.buffApplyChance = val+""; // Convert to string
                        break;

                    case "attacker-stat-atk":
                    case "attacker-stat-def":
                    case "defender-stat-atk":
                    case "defender-stat-def":
                        let stage = parseInt(val);
                        if(stage < -gm.data.settings.maxBuffStages){
                            stage = -gm.data.settings.maxBuffStages;
                        } else if(stage > gm.data.settings.maxBuffStages){
                            stage = gm.data.settings.maxBuffStages;
                        }

                        let propertyName = "buffs";
                        if(selectedMove.buffTarget == "both"){
                            propertyName = fieldName.includes("attacker") ? "buffsSelf" : "buffsOpponent";
                        }

                        let arrayIndex = fieldName.includes("atk") ? 0 : 1;

                        selectedMove[propertyName][arrayIndex] = stage;

                        if(selectedMove.buffTarget == "both"){
                            selectedMove.buffs = [...selectedMove.buffsSelf];
                        }

                        selectedMove.archetype = gm.generateArchetypeByMove(selectedMove);
                        break;

                    case "move-turns":
                        let turns = parseInt(val);

                        if(turns < 0){
                            turns = 1;
                        } else if (turns > 10){
                            turns = 10;
                        }

                        selectedMove.turns = turns;
                        selectedMove.cooldown = 500 * turns;
                        selectedMove.archetype = gm.generateArchetypeByMove(selectedMove);
                        break; 
                }

                if($(this).closest(".section.white").attr("id") == "gm-editor-moves"){
                    self.displaySelectedMove();
                }
            });

            // Event handler for deleting an item from an editable list
            $("body").on("click", ".editable-list > div > span", function(e){
                let id = $(this).closest("div").attr("data");
                let key = $(this).closest(".editable-list").attr("data");

                if(id && key){
                    switch(key){
                        case "learnset":
                            // Remove move from selected Pokemon's movepool
                            let selectedPokemon = data.pokemon.find(pokemon => pokemon.speciesId == id);

                            if(selectedPokemon){
                                let movepool = selectedMove.energy > 0 ? selectedPokemon.chargedMoves : selectedPokemon.fastMoves;

                                if(movepool.length > 1){
                                    if(selectedMove.energy > 0){
                                        selectedPokemon.chargedMoves = movepool.filter(move => move != selectedMove.moveId);
                                    } else{
                                        selectedPokemon.fastMoves = movepool.filter(move => move != selectedMove.moveId);
                                    }

                                    pokemonWithMove = pokemonWithMove.filter(pokemon => pokemon.speciesId != selectedPokemon.speciesId);
                                    pokemonWithoutMove.push(selectedPokemon);
                                    self.displayLearnset();
                                } else{
                                    modalWindow("Error", $(".learnset-remove-error"));

                                    let pokeUrl = host + "gm-editor/pokemon/" + selectedPokemon.speciesId + "/";
                                    $(".modal a.edit-pokemon").attr("href", pokeUrl);
                                    $(".modal span.name").html(selectedPokemon.speciesName);
                                }
                            }
                            break;
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
                    if(customData && customData?.moveId){
                        selectedMove = customData;
                        self.displaySelectedMove();
                    }
                } catch(e){
                    console.error(e);
                    modalWindow("Data Error", $(".import-error").first());
                    selectedMove = JSON.parse(lastSavedJSON);
                    self.displaySelectedMove();
                }
                
            });

            // Save data to localstorage

            $("#save-changes-btn").click(function(e){
                let errors = []; // Add validation here

                if(errors.length == 0){
                    // Load most recent data and insert this entry into the document
                    let lastSavedObj = JSON.parse(lastSavedJSON);
                    let currentData = JSON.parse(localStorage.getItem(settings.gamemaster));
                    
                    // Find last saved object in current data
                    let targetEntry = currentData.moves.findIndex(move => move.moveId == lastSavedObj.moveId);

                    if(targetEntry !== -1){
                        // Overwrite an existing entry
                        currentData.moves[targetEntry] = selectedMove;
                    } else{
                        // Insert a new entry
                        currentData.moves.push(selectedMove);

                    }

                    // Save individual learnsets
                    pokemonWithMove.forEach(p => {
                        let currentPokemon = currentData.pokemon.find(poke => poke.speciesId == p.speciesId);
                        let newPokemon = data.pokemon.find(poke => poke.speciesId == p.speciesId);

                        // Map learnset changes onto current data from localstorage
                        if(currentPokemon && newPokemon && ! currentPokemon.fastMoves.includes(selectedMove.moveId) && ! currentPokemon.chargedMoves.includes(selectedMove.moveId)){
                            if(selectedMove.energy > 0){
                                currentPokemon.chargedMoves.push(selectedMove.moveId);
                            } else{
                                currentPokemon.fastMoves.push(selectedMove.moveId);
                            }
                        }
                    });

                    pokemonWithoutMove.forEach(p => {
                        let currentPokemon = currentData.pokemon.find(poke => poke.speciesId == p.speciesId);
                        let newPokemon = data.pokemon.find(poke => poke.speciesId == p.speciesId);

                        // Map learnset changes onto current data from localstorage
                        if(currentPokemon && newPokemon && (currentPokemon.fastMoves.includes(selectedMove.moveId) || ! currentPokemon.chargedMoves.includes(selectedMove.moveId))){
                            if(selectedMove.energy > 0){
                                currentPokemon.chargedMoves = newPokemon.chargedMoves;
                            } else{
                                currentPokemon.fastdMoves = newPokemon.fastMoves;
                            }
                        }
                    });

                    data = currentData;

                    gm.saveCustomGameMaster(data);
                    modalWindow("Data Saved", $(".save-data").first());

                    lastSavedJSON = JSON.stringify(selectedMove);
                    lastSavedGM = window.localStorage.getItem(settings.gamemaster);
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
