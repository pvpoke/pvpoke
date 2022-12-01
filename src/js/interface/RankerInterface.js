// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var battle;
			var ranker = RankerMaster.getInstance();
			var pokeSelectors = [];
			var animating = false;
			var self = this;

			this.init = function(){

				var data = GameMaster.getInstance().data;

				$(".format-select").on("change", selectFormat);
				$(".simulate").on("click", startRanker);

				battle = new Battle();

				// Load initial overrides
				$.ajax({
					dataType: "json",
					url: webRoot + "data/overrides/all/1500.json?v=" + siteVersion,
					mimeType: "application/json",
					success: function(data) {
						if (ranker.setMoveOverrides) {
							ranker.setMoveOverrides(1500, "all", data);
							console.log("Ranking overrides loaded [" + data.length + "]");
						}
					},
					error: function(request, error) {
						console.log("Request: " + JSON.stringify(request));
						console.log(error);
					}
				});

				self.loadGetData();

			};

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				$(".format-select option[cup='"+get["cup"]+"'][value="+get["cp"]+"]").prop("selected", "selected");

				$(".format-select").trigger("change");
			}

			// Event handler for changing the league select

			function selectFormat(e){
				var cp = $(".format-select option:selected").val();
				var cup = $(".format-select option:selected").attr("cup");

				battle.setCP(cp);
				battle.setCup(cup);

				if(! battle.getCup().levelCap){
					battle.setLevelCap(50);
				}

				loadOverrides();

				$("a.rankersandbox-link").attr("href", webRoot+"rankersandbox.php?cup="+cup+"&cp="+cp);
				$("a.rankings-link").attr("href", webRoot+"rankings/"+cup+"/"+cp+"/overall/");
			}

			// Load overrides for the currently selected league and cup

			function loadOverrides(){

				var file = webRoot+"data/overrides/"+battle.getCup().name+"/"+battle.getCP()+".json?v="+siteVersion;

				$.getJSON( file, function( data ){
					if(ranker.setMoveOverrides){
						ranker.setMoveOverrides(battle.getCP(), battle.getCup().name, data);
						console.log("Ranking overrides loaded [" + data.length + "]");
					}
				});

			}

			// Run simulation

			function startRanker(){
				ranker.rankLoop(battle.getCP(), battle.getCup());
			}
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
