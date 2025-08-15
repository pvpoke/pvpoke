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
                    self.setGameMasterData(customData);
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

            // Save new data to localstorage

            $("body").on("click", ".modal #save-new-modal-btn", function(e){
                // Validate new entry
                let title = $(".modal #gm_name").val();
                let id = GMEditorUtils.StringToID(title, "gm-id");
                let errors = GMEditorUtils.ValidateField("gamemaster", "gm-id", id);

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
                    $(".modal #gm_name + .error-label").html(errors.join(" "));
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
