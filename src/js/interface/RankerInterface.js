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
				
				$(".league-select").on("change", selectLeague);
				$(".cup-select").on("change", selectCup);
				$(".simulate").on("click", startRanker);
				
				battle = new Battle();

			};
			
			// Event handler for changing the league select
			
			function selectLeague(e){
				var allowed = [1500, 2500, 10000];
				var cp = parseInt($(".league-select option:selected").val());
				
				if(allowed.indexOf(cp) > -1){
					battle.setCP(cp);
				}
				
			}
			
			// Event handler for changing the cup select
			
			function selectCup(e){
				var cup = $(".cup-select option:selected").val();
				battle.setCup(cup);
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