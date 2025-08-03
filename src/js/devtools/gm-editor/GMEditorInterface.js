// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){
            let gm = GameMaster.getInstance();
            let data = {};
            let self = this;


			this.init = function(){
                // Load the currently selected gamemaster
                $("#gm-select option[value='"+settings.gamemaster+"']").attr("selected", "selected");
                $("#gm-select").trigger("change");
			}

            this.setGameMasterData = function(result){
                data = result;
                
                self.updateExportCode();
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
                data = JSON.parse($(this).val());
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
                let id = GMEditorUtils.StringToID(title);
                let errors = GMEditorUtils.ValidateField("gm_id", id);

                if(errors.length == 0){
                    data.title = title;
                    data.id = id;

                    self.updateExportCode();

                    gm.saveCustomGameMaster(data);
                    
                    // Navigate to edit page
                    window.location.href = $("a#save-new-btn").attr("href");
                } else{

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
