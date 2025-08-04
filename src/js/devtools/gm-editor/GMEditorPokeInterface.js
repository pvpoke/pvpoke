// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){
            let gm = GameMaster.getInstance();
            let data;
            let self = this;


			this.init = function(){
                data = gm.data;
                $("a.gm-title").html("&larr; " + data.title);
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
                } else{
                    modalWindow("Data Error", $(".import-error").first());
                }
            }

            this.updateExportCode = function(){
                $("textarea.import").html(JSON.stringify(data));
            }

            // Change the gamemaster select dropdown
            $("#gm-select").on("change", function(e){
                let id = $(this).find("option:selected").val();

                // Set settings cookie here
             
                gm.loadCustomGameMaster(id, self.setGameMasterData);
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
                }
                
            });

            // Open the save window

            $("#save-new-btn").click(function(e){
                e.preventDefault();
                modalWindow("Save New Gamemaster", $(".save-new-gm").eq(0));
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
