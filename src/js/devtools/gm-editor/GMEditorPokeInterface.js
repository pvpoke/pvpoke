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

                self.fillFormOptions();

                if(get){
                    self.loadGetData();
                }
			}

            // Dynamically insert form field options

            this.fillFormOptions = function(){
                let allTypes = Pokemon.getAllTypes();

                allTypes.forEach(type => {
                    $("#primary-type, #secondary-type").append($("<option value='"+type.toLowerCase()+"'>"+type+"</option>"))
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

                $("#primary-type option[value='"+selectedPokemon.types[0]+"']").prop("selected", "selected");
                $("#secondary-type option[value='"+selectedPokemon.types[1]+"']").prop("selected", "selected");
                $("#primary-type").attr("class", selectedPokemon.types[0]);
                $("#secondary-type").attr("class", selectedPokemon.types[1]);

                if(selectedPokemon?.levelFloor){
                    $("#level-floor").val(selectedPokemon.levelFloor);
                }

                // Default IV table
                $("#default-iv-table tbody").html("");

                for(let ivKey in selectedPokemon.defaultIVs){
                    let ivs = selectedPokemon.defaultIVs[ivKey];
                    let $row = $("#default-iv-table tr.hide").clone().removeClass("hide");

                    $row.attr("data", ivKey);
                    $row.find("td[data='league']").html(ivKey);
                    $row.find("input.level").val(ivs[0]);
                    $row.find("input[iv='atk']").val(ivs[1]);
                    $row.find("input[iv='def']").val(ivs[2]);
                    $row.find("input[iv='hp']").val(ivs[3]);

                    // Display Pokemon's rank and CP
                    let b = new Battle();

                    switch(ivKey){
                        case "cp500":
                            b.setCP(500);
                            break;
                        
                        case "cp1500":
                            b.setCP(1500);
                            break;

                        case "cp1500l40":
                            b.setCP(1500);
                            b.setLevelCap(40);
                            break;

                        case "cp2500":
                            b.setCP(2500);
                            break;

                        case "cp2500l40":
                            b.setCP(2500);
                            b.setLevelCap(40);
                            break;
                    }

                    let pokemon = new Pokemon(null, 0, b, selectedPokemon);
                    pokemon.initialize(true);

                    let combinations = pokemon.generateIVCombinations("overall", 1, 4096);
                    let rank = combinations.findIndex((combo) => combo.ivs.atk == ivs[1] && combo.ivs.def == ivs[2] && combo.ivs.hp == ivs[3]);

                    pokemon.setLevel(ivs[0]);
                    pokemon.setIV("atk", ivs[1]);
                    pokemon.setIV("def", ivs[2]);
                    pokemon.setIV("hp", ivs[3]);

                    if(rank > -1){
                        $row.find("td[data='rank']").html(rank+1);
                    } else{
                        $row.find("td[data='rank']").html("???");
                    }
                    
                    $row.find("td[data='cp']").html([pokemon.cp]);

                    $("#default-iv-table tbody").append($row);
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

            // Generate new default IV's
            $("button#generate-default-ivs").click(function(e){
                selectedPokemon.defaultIVs = gm.generateDefaultIVsByPokemon(selectedPokemon);
                self.displaySelectedPokemon();
            });

            // Event handler for changing a select field
            $("#gm-editor-pokemon select").on("change", function(e){
                let fieldName = $(this).attr("name");
                let val = $(this).val();

                switch(fieldName){
                    case "primary-type":
                        selectedPokemon.types[0] = val;
                        break;

                    case "secondary-type":
                        selectedPokemon.types[1] = val;
                        break;

                    case "buddy-distance":
                        selectedPokemon.buddyDistance = parseInt(val);
                        break;

                    case "third-move-cost":
                        selectedPokemon.thirdMoveCost = parseInt(val);
                        break;
                }

                self.displaySelectedPokemon();
                self.updateExportCode();
            });

            // Event handler for changing an input field
            $("body").on("change", "#gm-editor-pokemon input", function(e){
                let fieldName = $(this).attr("name");
                let val = $(this).val();

                switch(fieldName){
                    case "species-id":
                        selectedPokemon.speciesId = val;
                        break;

                    case "species-name":
                        selectedPokemon.speciesName = val;
                        break;

                    case "alias-id":
                        if(val != ""){
                            selectedPokemon.aliasId = val;
                        } else{
                            delete selectedPokemon.aliasId;
                        }
                        break;

                    case "dex":
                        selectedPokemon.dex = parseInt(val);
                        break;

                    case "stats-atk":
                    case "stats-def":
                    case "stats-hp":
                        let key = $(this).attr("data");
                        selectedPokemon.baseStats[key] = parseInt(val);
                        selectedPokemon.defaultIVs = gm.generateDefaultIVsByPokemon(selectedPokemon);
                        break;

                    case "level-floor":
                        if(val != ""){
                            selectedPokemon.levelFloor = parseInt(val);
                        } else{
                            delete selectedPokemon.levelFloor;
                        }

                        selectedPokemon.defaultIVs = gm.generateDefaultIVsByPokemon(selectedPokemon);
                        break;

                    case "iv-level":
                    case "iv-atk":
                    case "iv-def":
                    case "iv-hp":
                        let ivKey = $(this).closest("tr").attr("data");
                        let index = parseInt($(this).attr("data"));
                        console.log(index);

                        if(ivKey && index !== null){
                            selectedPokemon.defaultIVs[ivKey][index] = Math.floor(val * 2) / 2; // Ensure levels are at whole or half numbers
                        }
                        break;

                }

                self.displaySelectedPokemon();
                self.updateExportCode();
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
