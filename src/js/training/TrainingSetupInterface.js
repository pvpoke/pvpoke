/*
* Interface functionality for move list and explorer
*/

var InterfaceMaster = (function () {
    var instance;

    function createInstance(matchHandler) {


        var object = new interfaceObject(matchHandler);

		function interfaceObject(matchHandler){

			// It's matchHandlers all the way down
			var handler = matchHandler;

			var self = this;
			var gm = GameMaster.getInstance();
			var mode = "single"; // Single or tournament
			var teamSelectMethod = "random"; // Random or manual
			var partySize = 3;
			var battle;

			var multiSelectors = [];

			this.init = function(){
				var data = gm.data;
				battle = new Battle();

				for(var i = 0; i < 2; i++){
					var multiSelector = new PokeMultiSelect($(".poke.multi").eq(i));

					multiSelector.init(data.pokemon, battle);
					multiSelector.setMaxPokemonCount(partySize);
					multiSelectors.push(multiSelector);
				}

				// Event listeners

				$(".league-select").on("change", selectLeague);
				$(".cup-select").on("change", selectCup);
				$(".mode-select").on("change", selectMode);
				$(".team-method-select").on("change", selectTeamMethod);
				$(".battle-btn").on("click", startBattle);
			};

			// Hide setup after initiating battle

			this.close = function(){
				for(var i = 0; i < 3; i++){
					$(".section").eq(i).slideUp(500);
				}

				$("#main h1").slideUp(500);
			}

			// Show setup after battle

			this.open = function(){
				for(var i = 0; i < 3; i++){
					$(".section").eq(i).slideDown(500);
				}

				$("#main h1").slideDown(500);
			}

			// Dispatch battle start to the MatchHandler with provided options

			function startBattle(e){
				var teams = [
					 multiSelectors[0].getPokemonList(),
					 multiSelectors[1].getPokemonList()
					];
				var difficulty = $(".difficulty-select option:selected").val();

				if((teams[0].length < partySize)||((teamSelectMethod == "manual")&&(teams[1].length < partySize))){
					modalWindow("Select Teams", $("<p>Please select a full team.</p>"));

					return false;
				}

				var props = {
					teams: teams,
					mode: mode,
					difficulty: difficulty,
					teamSelectMethod: teamSelectMethod,
					partySize: partySize,
					league: battle.getCP(),
					cup: battle.getCup().name
					};

				handler.initBattle(props);
			}

			// Event handler for changing the battle mode

			function selectMode(e){
				var partySize = 3;
				mode = $(".mode-select option:selected").val();

 				if(mode == "tournament"){
					partySize = 6;
				}

				for(var i = 0; i < multiSelectors.length; i++){
					multiSelectors[i].setMaxPokemonCount(partySize);
				}
			}

			// Event handler for changing the AI's team selection

			function selectTeamMethod(e){
				teamSelectMethod = $(".team-method-select option:selected").val();

				if(teamSelectMethod == "manual"){
					$(".poke.multi").eq(1).show();
				} else{
					$(".poke.multi").eq(1).hide();
				}
			}

			// Event handler for changing the league select

			function selectLeague(e){
				var cp = $(".league-select option:selected").val();
				battle.setCP(cp);
			}

			// Event handler for changing the cup select

			function selectCup(e){
				var cup = $(".cup-select option:selected").val();
				battle.setCup(cup);
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
			}

		}

        return object;
    }

    return {
        getInstance: function (matchHandler) {
            if (!instance) {
                instance = createInstance(matchHandler);
            }
            return instance;
        }
    };
})();
