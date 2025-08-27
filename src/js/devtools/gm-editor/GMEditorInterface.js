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

                        if(host.includes("localhost")){
                            $("#edit-btn").show();
                        } else{
                            $("#edit-btn").hide();
                        }
                    } else{
                        $("#save-btn").show();
                        $("#edit-btn").show();
                    }
                    
                    self.updateExportCode();
                    self.updateLastSavedJSON();
                    self.displayChangelog();
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
                lastSavedGM = window.localStorage.getItem(settings.gamemaster);
                $("#save-btn").attr("disabled", "disabled");
            }

            // Generate and display changelog

            this.displayChangelog = function(){
                $(".train-table tbody").html("");

                let id = $("#gm-select option:selected").val();

                if(id == "gamemaster"){
                    return;
                }

                let changes = [];
                let originalPokemon = gm.originalData.pokemon;
                let originaMoves = gm.originalData.moves;

                // Compare custom Pokemon data with original
                data.pokemon.forEach(newPokemon => {
                    let oldPokemon = originalPokemon.find(p => p.speciesId == newPokemon.speciesId);

                    if(oldPokemon){
                        // Compare overall values
                        let change = self.getObjectChanges(oldPokemon, newPokemon, "speciesId");

                        if(change){
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

                // Search for removals in new list
                originalPokemon.forEach(oldPokemon => {
                    let newPokemon = data.pokemon.find(p => p.speciesId == oldPokemon.speciesId);

                    if(! newPokemon){
                        changes.push({
                            type: "deletion",
                            id: oldPokemon.speciesId,
                            values: []
                        }); 
                    }
                });

                // Compare custom Pokemon data with original
                data.moves.forEach(newMove => {
                    let oldMove = originaMoves.find(p => p.moveId == newMove.moveId);

                    if(oldMove){
                        // Compare overall values
                        let change = self.getObjectChanges(oldMove, newMove, "moveId");

                        if(change){
                            changes.push(change);
                        }
                    } else{
                        changes.push({
                            type: "addition",
                            id: newMove.moveId,
                            values: []
                        });
                    }
                });

                // Search for removals in new list
                originaMoves.forEach(oldMove => {
                    let newMove = data.moves.find(p => p.moveId == oldMove.moveId);

                    if(! newMove){
                        changes.push({
                            type: "deletion",
                            id: oldMove.moveId,
                            values: []
                        }); 
                    }
                });

                // Display changes in table

                changes.forEach(change => {
                    let $row = $("<tr class=\""+change.type+"\"><td class=\"change-id\"></td><td class=\"changes\"><td></tr>");

                    let changeIdLabel = change.id;

                    if(change.type == "addition"){
                        changeIdLabel = "+ " + changeIdLabel;
                    } else if(change.type == "deletion"){
                        changeIdLabel = "- " + changeIdLabel;
                    }

                    $row.find(".change-id").html(changeIdLabel);

                    change.values.forEach(valueChange => {
                        let $changeLine = $("<div class=\"change-line " + valueChange.type + "\"></div>");

                        if(valueChange.oldValue == ""){
                            $changeLine.append(
                                "<div class=\"change-id\">"+valueChange.property+"</div>" +
                                "<div class=\"change-value\">"+valueChange.newValue+"</div>"
                            );
                        } else{
                            $changeLine.append(
                                "<div class=\"change-id\">"+valueChange.property+"</div>" +
                                "<div class=\"change-value\">"+valueChange.oldValue+" &rarr; "+valueChange.newValue+"</div>"
                            );
                        }

                        $row.find("td").eq(1).append($changeLine);
                    });

                    $(".train-table tbody").append($row);
                });
            }

            // Given two objects, compare properties and return changes
            this.getObjectChanges = function(oldObj, newObj, idKey){
                let change = null;

                if(JSON.stringify(newObj) != JSON.stringify(oldObj)){
                    // Identify individual changes
                    change = {
                        type: "edit",
                        id: newObj[idKey],
                        values: []
                    };
                    
                    for(property in newObj){
                        if(! oldObj.hasOwnProperty(property)){
                            change.values.push({
                                type: "addition",
                                property: property,
                                oldValue: "",
                                newValue: newObj[property]
                            })
                        } else if(JSON.stringify(newObj[property]) != JSON.stringify(oldObj[property])){
                            if(Array.isArray(newObj[property])){
                                // Identify new or removed values in an array
                                let oldArray = oldObj[property];
                                let newArray = newObj[property];
                                let arrayChanges = [];

                                let combinedArray = newObj[property].concat(oldObj[property]);
                                for(value of combinedArray){
                                    if(newArray.includes(value) && ! oldArray.includes(value)){
                                        arrayChanges.push("+ " + value);
                                    } else if(! newArray.includes(value) && oldArray.includes(value)){
                                        arrayChanges.push("- " + value);
                                    }
                                }

                                change.values.push({
                                    type: "edit",
                                    property: property,
                                    oldValue: "",
                                    newValue: arrayChanges.join(", ")
                                });
                            } else if(typeof newObj[property] == "object"){
                                change.values.push({
                                    type: "edit",
                                    property: property,
                                    oldValue: JSON.stringify(oldObj[property]),
                                    newValue: JSON.stringify(newObj[property])
                                });
                            } else{
                                change.values.push({
                                    type: "edit",
                                    property: property,
                                    oldValue: oldObj[property],
                                    newValue: newObj[property]
                                });
                            }
                        }
                    }
                }

                return change;
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

                    console.log(settings);

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
