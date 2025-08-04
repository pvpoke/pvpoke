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

                self.displayPokemonList();
			}

            this.displayPokemonList = function(){
                $(".train-table tbody").html("");

                data.pokemon.forEach(pokemon => {
                    let $row = $(".train-table tr.hide").first().clone().removeClass("hide");
                    
                    $row.find("td[data='dex']").html(pokemon.dex);
                    $row.find("td[data='name']").html(pokemon.speciesName);

                    let fastList = [];
                    let chargedList = [];

                    pokemon.fastMoves.forEach(move => {
                        fastList.push(gm.getMoveById(move).name);
                    });

                    pokemon.chargedMoves.forEach(move => {
                        chargedList.push(gm.getMoveById(move).name);
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
                    

                    $(".train-table tbody").append($row);
                });
            }



            this.updateExportCode = function(){
                $("textarea.import").html(JSON.stringify(data));
            }

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
