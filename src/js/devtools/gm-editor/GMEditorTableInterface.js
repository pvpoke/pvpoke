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

            let sort = "";
			let sortDirection = 1;
            let source; // Point to either the pokemon array or the moves array
            let sourceType;
            let idKey;
            let nameKey;

			this.init = function(){
                data = gm.data;
                $("a.gm-title").html("&larr; " + data.title);

                pokeSearch.setBattle(battle);

                if(get && get['c']){
                    sourceType = get['c'];

                    switch(get['c']){
                        case "pokemon":
                            source = data.pokemon;
                            idKey = "speciesId";
                            nameKey = "speciesName";
                            sort = "dex";
                            self.displayPokemonList();
                            break;

                        case "moves":
                            source = data.moves;
                            idKey = "moveId";
                            nameKey = "name";
                            sort = "name";
                            self.displayMoveList();
                            break;
                    }
                }
			}

            // Centralized function for displaying the corresponding list
            this.displayList = function(){
                switch(sourceType){
                    case "pokemon":
                        self.displayPokemonList();
                        break;

                    case "moves":
                        self.displayMoveList();
                        break;
                }
            }

            // Display table of all Pokemon
            this.displayPokemonList = function(){
                gm.createSearchMaps();
                
                // Perform after delay to free up main thread
                setTimeout(function(){
                     $(".train-table tbody").html("");

                    source.forEach(pokemon => {
                        let $row = $(".train-table tr.hide").first().clone().removeClass("hide");
                        
                        $row.attr("data", pokemon.speciesId);
                        $row.find("td[data='dex']").html(pokemon.dex);
                        $row.find("td[data='name']").html(pokemon.speciesName);

                        let fastList = [];
                        let chargedList = [];

                        pokemon.fastMoves.forEach(move => {
                            let name = gm.getMoveById(move).name

                            if(pokemon?.eliteMoves?.includes(move)){
                                name += "*";
                            }

                            if(pokemon?.legacyMoves?.includes(move)){
                                name += "†"
                            }

                            fastList.push(name);
                        });

                        pokemon.chargedMoves.forEach(move => {
                            let name = gm.getMoveById(move).name

                            if(pokemon?.eliteMoves?.includes(move)){
                                name += "*";
                            }

                            if(pokemon?.legacyMoves?.includes(move)){
                                name += "†"
                            }

                            chargedList.push(name);
                        });

                        $row.find("td[data='fast']").html(fastList.join(", "));
                        $row.find("td[data='charged']").html(chargedList.join(", "));

                        if(pokemon.tags){
                            $row.find("td[data='tags']").html(pokemon.tags.join(", "));
                        }

                        if(pokemon.searchPriority){
                            $row.find("td[data='priority']").html(pokemon.searchPriority);
                        }

                        if(pokemon.released == true){
                            $row.find("td[data='released']").html("Yes");
                        } else{
                            $row.find("td[data='released']").html("No");
                        }

                        $row.find("a.poke-edit").attr("href", host+"gm-editor/pokemon/"+pokemon.speciesId+"/");
                        

                        $(".train-table tbody").append($row);
                    });

                    self.updateExportCode();
                }, 50);
            }

            // Display table of all moves
            this.displayMoveList = function(){
                gm.createSearchMaps();

                // Perform after delay to free up main thread
                setTimeout(function(){
                     $(".train-table tbody").html("");

                    source.forEach(move => {
                        let $row = $(".train-table tr.hide").first().clone().removeClass("hide");
                        
                        $row.attr("data", move.moveId);
                        $row.find("td[data='name']").html(move.name);
                        $row.find("td[data='type']").html(move.type);
                        $row.find("td[data='power']").html(move.power);

                        if(move.energyGain > 0){
                            $row.find("td[data='energy']").html(move.energyGain);
                            $row.find("td[data='turns']").html(move.turns);
                        } else{
                            $row.find("td[data='energy']").html(move.energy);
                        }

                        $row.find("td[data='effect']").html(gm.getStatusEffectString(move));

                        $row.find("a.poke-edit").attr("href", host+"gm-editor/moves/"+move.moveId+"/");
                        

                        $(".train-table tbody").append($row);
                    });

                    self.updateExportCode();
                }, 50);
            }

            this.updateExportCode = function(){
                $("textarea.import").html(JSON.stringify(source));
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
				let list = [];
                
                switch(sourceType){
                    case "pokemon":
                        list = gm.generatePokemonListFromSearchString(searchStr, battle);
                        break;

                    case "moves":
                        list = gm.generateMoveListFromSearchString(searchStr);
                        break;
                }
                
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
                        source.sort((a,b) => (a.dex > b.dex) ? sortDirection : ((b.dex > a.dex) ? -sortDirection : 0));
                        break;

                    case "name":
                        if(sourceType == "pokemon"){
                            source.sort((a,b) => (a.speciesName > b.speciesName) ? sortDirection : ((b.speciesName > a.speciesName) ? -sortDirection : 0));
                        } else if(sourceType == "moves"){
                            source.sort((a,b) => (a.name > b.name) ? sortDirection : ((b.name > a.name) ? -sortDirection : 0));
                        }
                        
                        break;

                    case "priority":
                        source.sort((a,b) => {
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
                        source.sort((a,b) => (a.released > b.released) ? -sortDirection : ((b.released > a.released) ? sortDirection : 0));
                        break;

                    case "type":
                        source.sort((a,b) => (a.type > b.type) ? sortDirection : ((b.type > a.type) ? -sortDirection : 0));
                        break;

                    case "turns":
                        source.sort((a,b) => {
                            let defaultTurnValue = sortDirection > 0 ? 0 : 10;
                            let turnsA = a?.energyGain > 0 ? a.turns : defaultTurnValue;
                            let turnsB = b?.energyGain > 0 ? b.turns : defaultTurnValue;

                            if(turnsA > turnsB){
                                return -sortDirection;
                            } else if(turnsB > turnsA){
                                return sortDirection;
                            } else{
                                return 0;
                            }
                        });
                        break; 

                    default:
                        source.sort((a,b) => (a[sort] > b[sort]) ? -sortDirection : ((b[sort] > a[sort]) ? sortDirection : 0));
                        break;
                }

                self.displayList();
			});

            // Duplicate a Pokemon or move entry

            $("body").on("click", ".train-table a.poke-copy", function(e){
                e.preventDefault();

                let selectedId = $(this).closest("tr").attr("data");

                if(selectedId){
                    
                    let targetObj = source.find(obj => obj[idKey] == selectedId);

                    if(targetObj){
                        let targetIndex = source.findIndex(obj => obj[idKey] == selectedId);
                        let copy = {...targetObj};

                        let isUniqueId = false;
                        let copyCount = 1;
                        let newId;
                        let newName;

                        // Iterate on copy counts to find a unique ID (eg. charizard_copy_2)
                        while(! isUniqueId){
                            newId = copy[idKey] + "_copy";
                            newName = copy[nameKey] + " (Copy)";

                            if(copyCount > 1){
                                newId += "_" + copyCount;
                                newName = copy[nameKey] + " (Copy " + copyCount + ")";
                            }

                            if(! source.find(obj => obj[idKey] == newId)){
                                isUniqueId = true;
                            }

                            copyCount++;
                        }

                        copy[idKey] = newId;
                        copy[nameKey] = newName;

                        source.splice(targetIndex+1, 0, copy);

                        self.displayList();

                        if($(".poke-search").first().val() != ''){
                            $(".poke-search").first().trigger("keyup");
                        }
                    }
                }
            });

            // Delete a Pokemon or move entry

            $("body").on("click", ".train-table a.poke-delete", function(e){
                e.preventDefault();

                let selectedId = $(this).closest("tr").attr("data");

                if(selectedId){
                    let targetIndex = source.findIndex(obj => obj[idKey] == selectedId);
                    let targetObj = source.find(obj => obj[idKey] == selectedId);

                    if(targetObj){
                        modalWindow("Delete Entry", $(".delete-poke-confirm").first());
                        $(".modal span.name").html(targetObj[nameKey]);
                        
                        $(".modal .button.yes").click(function(e){
                            
                            closeModalWindow();

                            source.splice(targetIndex, 1);

                            self.displayList();
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
