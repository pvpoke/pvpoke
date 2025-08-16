// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){
            let gm = GameMaster.getInstance();
            let data = {};
            let self = this;
            let lastSavedJSON; // JSON of the last saved data
            let initializing = true;

			this.init = function(){
                // Load data from local storage
                var i = 0;

                while(window.localStorage.key(i) !== null){
                    let key = window.localStorage.key(i);
                    
                    // Catch invalid JSON
                    try{
                        let content = JSON.parse(window.localStorage.getItem(key));

                        if(content?.dataType && content.dataType == "gamemaster" && content?.id && content?.title){
                            $("#gm-select").append("<option value=\""+key+"\">"+content.title+"</option>");
                        }
                    } catch(e){
                        // Not valid JSON
                    }

                    i++;
                }

                // Load the currently selected gamemaster
                $("#gm-select option[value='"+settings.gamemaster+"']").attr("selected", "selected");
                $("#gm-select").trigger("change");

                initializing = false;
			}

            this.setGameMasterData = function(result){
				let customData = {
                    id: "",
                    title: "",
                    dataType: "gamemaster",
                    pokemon: [],
                    moves: []
				};

                // Map values of new data to current data
                let valid = true;

                if(result?.id){
                    customData = result.id;
                } else{
                    valid = false;
                }

                if(result?.title){
                    customData.title = result.title;
                } else{
                    valid = false;
                }

                if(result?.pokemon && result?.pokemon?.length > 0){
                    customData.pokemon = result.pokemon;
                } else{
                    valid = false;
                }

                if(result?.moves && result?.moves?.length > 0){
                    customData.moves = result.moves;
                } else{
                    valid = false;
                }

                if(valid){
                    data = result;

                    // Select dropdown option if ID exists
                    $("#gm-select option[value='"+data.id+"']").prop("selected", "selected");

                    let selectedGM = $("#gm-select option:selected").val();

                    // Update buttons
                    if(! selectedGM || selectedGM != data.id || selectedGM == "gamemaster"){
                        $("#save-btn").hide();
                        $("#edit-btn").hide();
                    } else{
                        $("#save-btn").show();
                        $("#edit-btn").show();
                    }
                    
                    self.updateExportCode();
                    self.updateLastSavedJSON();
                } else{
                    modalWindow("Data Error", $(".import-error").first());
                    self.updateExportCode();
                }
            }

            this.updateExportCode = function(){
                let json = JSON.stringify(data);
                $("textarea.import").val(json);

                // Enable or disable save button
                if(json != lastSavedJSON && data?.id && data?.id != "gamemaster"){
                    $("#save-btn").removeAttr("disabled");
                } else{
                    $("#save-btn").attr("disabled", "disabled");
                }
            }

            this.updateLastSavedJSON = function(){
                lastSavedJSON = JSON.stringify(data);
                $("#save-btn").attr("disabled", "disabled");
            }

            // Generate and display changelog

            this.displayChangelog = function(){
                let changes = [];
                let originalPokemon = gm.originalData.pokemon;
                let originaMoves = gm.originalData.moves;

                // Compare custom Pokemon data with original
                data.pokemon.forEach(newPokemon => {
                    let oldPokemon = originalPokemon.find(p => p.speciesId == newPokemon.speciesId);

                    if(oldPokemon){
                        // Compare overall values
                        if(JSON.stringify(newPokemon) != JSON.stringify(oldPokemon)){
                            // Identify individual changes
                            let change = {
                                type: "edit",
                                id: newPokemon.speciesId,
                                values: []
                            };
                            
                            for(property in newPokemon){
                                if(! oldPokemon.hasOwnProperty(property)){
                                    change.values.push({
                                        type: "addition",
                                        property: property,
                                        oldValue: "",
                                        newValue: newPokemon[property]
                                    })
                                } else if(JSON.stringify(newPokemon[property]) != JSON.stringify(oldPokemon[property])){
                                   change.values.push({
                                        type: "edit",
                                        property: property,
                                        oldValue: JSON.stringify(oldPokemon[property]),
                                        newValue: JSON.stringify(newPokemon[property])
                                    });
                                }
                            }

                            changes.push(change);
                        }
                    } else{
                        changes.push({
                            type: "addition",
                            id: newPokemon.speciesId,
                            values: []
                        });
                    }
                });

                console.log(changes);
            }

            // Change the gamemaster select dropdown
            $("#gm-select").on("change", function(e){
                let id = $(this).find("option:selected").val();

                // Set settings cookie here
             
                gm.loadCustomGameMaster(id, self.setGameMasterData);

                self.updateLastSavedJSON();

                // Save settings to new gamemaster
                if(! initializing){
                    settings.gamemaster = id;

                    $.ajax({

                        url : host+'data/settingsCookie.php',
                        type : 'POST',
                        data : settings,
                        dataType:'json',
                        success : function(data) {
                            console.log("Settings updated");
                        },
                        error : function(request,error)
                        {
                            console.log("Request: "+JSON.stringify(request));
                            console.log(error);
                        }
                    });
                }

                if(id == "gamemaster"){
                    $("#delete-gamemaster").hide();
                } else{
                    $("#delete-gamemaster").show();
                    self.displayChangelog();
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

                    let errors = GMEditorUtils.ValidateGamemaster(customData);

                    if(errors.length == 0){
                        self.setGameMasterData(customData);
                    } else{
                        console.error(e);
                        modalWindow("Data Error", $(".import-error").first());
                        self.updateExportCode();
                    }
                    
                } catch(e){
                    console.error(e);
                    modalWindow("Data Error", $(".import-error").first());
                    self.updateExportCode();
                }
                
            });

            // Open the save new window

            $("#save-new-btn").click(function(e){
                e.preventDefault();
                modalWindow("Save New Gamemaster", $(".save-new-gm").eq(0));
            });

            // Event handler for entering gm name

            $("body").on("change", ".modal #gm_name", function(e){
                // Sanitize title input
                let title = $(this).val();
                title = GMEditorUtils.RemoveSpecialCharacters(title);

                console.log(title);

                $(this).val(title);
            });

            // Save new data to localstorage

            $("body").on("click", ".modal #save-new-modal-btn", function(e){
                // Validate new entry
                let title = $(".modal input#gm_name").val();
                let id = GMEditorUtils.StringToID(title, "gm-id");

                data.title = title;
                data.id = id;

                let errors = GMEditorUtils.ValidateGamemaster(data);

                $(".modal #gm_name + .error-label").hide();

                if(errors.length == 0){
                    data.title = title;
                    data.id = id;

                    self.updateExportCode();

                    gm.saveCustomGameMaster(data);
                    

                    // Save settings to new gamemaster
                    settings.gamemaster = id;

                    $.ajax({

                        url : host+'data/settingsCookie.php',
                        type : 'POST',
                        data : settings,
                        dataType:'json',
                        success : function(data) {
                            // Navigate to edit page
                            window.location.href = $("a#save-new-btn").attr("href");
                        },
                        error : function(request,error)
                        {
                            console.log("Request: "+JSON.stringify(request));
                            console.log(error);
                        }
                    });

                } else{
                    $(".modal #gm_name + .error-label").show();

                    let errorText = [];

                    errors.forEach(error => {
                        errorText = [...errorText, ...error.errors];
                    });

                    $(".modal #gm_name + .error-label").html(errorText.join(" "));
                    self.updateExportCode();
                }
            });

            // Save changes

            $("#save-btn").click(function(e){
                e.preventDefault();

                let errors = []; // Add validation here

                if(errors.length == 0){
                    gm.saveCustomGameMaster(data);
                    modalWindow("Data Saved", $(".save-data").first());
                } else{
                    modalWindow("Error", $(".save-data-error").first());
                }
            });

            // Delete custom gamemaster

            $("#delete-gamemaster").click(function(e){
                modalWindow("Delete Gamemaster", $(".delete-gm-confirm").first());

                $(".modal .name").html(data.title);

                $(".modal .yes").click(function(e){
                    window.localStorage.removeItem(data.id);

                    // Revert to default gamemaster
                    $("#gm-select option[value='gamemaster']").attr("selected", "selected");
                    $("#gm-select").trigger("change");
                    
                    closeModalWindow();
                });
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
