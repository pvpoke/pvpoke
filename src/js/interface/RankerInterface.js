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

				$.getJSON( webRoot+"data/overrides/all/1500.json?v="+siteVersion, function( data ){
					if(ranker.setMoveOverrides){
						ranker.setMoveOverrides(1500, "all", data);
						console.log("Ranking overrides loaded [" + data.length + "]");
					}
				});

			};

			// Event handler for changing the league select

			function selectFormat(e){
				var cp = $(".format-select option:selected").val();
				var cup = $(".format-select option:selected").attr("cup");

				battle.setCP(cp);
				battle.setCup(cup);

				loadOverrides();

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
