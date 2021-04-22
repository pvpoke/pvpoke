/*
* Interface functionality for move list and explorer
*/

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {

        var object = new interfaceObject();

		function interfaceObject(){
			var self = this;
			var gm = GameMaster.getInstance();
			var battle;
			var teams = [];
			var multiSelector;
			var selectedTeamIndex; // Store index of the selected team when editing

			self.init = function(){
				battle = new Battle();

				// Init the multiselector
				multiSelector = new PokeMultiSelect($(".poke.multi"));
				multiSelector.init(gm.data.pokemon, battle);
				multiSelector.setMaxPokemonCount(6);

				// Load Great League movesets by default

				gm.loadRankingData(self, "overall", 1500, "all");

				// Event handlers

				$(".button.new-team").click(setupNewTeam);
				$(".button.add-team").click(addNewTeam);
				$(".league-select").change(selectLeague);
				$("body").on("click", ".button.edit", setupEditTeam);
				$(".button.save-changes").click(editTeam);
				$(".training-editor-import textarea").change(function(e){
					var data = JSON.parse($(".training-editor-import textarea").val());
					self.importTeams(data);
				});
			}

			self.displayRankingData = function(data){
				console.log("Ranking data loaded");
			}

			// Display all selected teams

			self.updateTeamList = function(){
				$(".train-table tbody").html('');

				var teamJSON = [];

				for(var i = 0; i < teams.length; i++){
					var team = teams[i];

					// Create a new row
					var $row = $(".train-table.teams thead tr.hide").clone();
					$row.removeClass("hide");

					var teamURL = host + "team-builder/" + battle.getCup().name + "/" + battle.getCP() + "/";
					var teamStr = '';
					var movesetStr = '';

					for(var n = 0; n < team.length; n++){
						var pokemon = team[n];

						teamStr += pokemon.speciesName + " " + pokemon.generateMovesetStr() + " ";

						$row.find(".sprite-container").eq(n).attr("type-1", pokemon.types[0]);
						$row.find(".sprite-container").eq(n).attr("type-2", pokemon.types[0]);
						$row.find(".sprite-container").eq(n).attr("data", pokemon.speciesId);

						if(pokemon.types[1] != "none"){
							$row.find(".sprite-container").eq(n).attr("type-2", pokemon.types[1]);
						}

						$row.find(".name").eq(n).html(pokemon.speciesName);
						$row.find(".moves").eq(n).html(movesetStr);

						var abbreviationArr = movesetStr.split("/");

						// Identify fast move
						var fastMoveIndex = 0;

						for(var j = 0; j < pokemon.fastMovePool.length; j++){
							if(pokemon.fastMovePool[j].abbreviation == abbreviationArr[0]){
								fastMoveIndex = j;
								break;
							}
						}

						var chargedMoveIndexes = [];

						for(var j = 0; j < pokemon.chargedMovePool.length; j++){
							if(pokemon.chargedMovePool[j].abbreviation == abbreviationArr[1]){
								chargedMoveIndexes.push(j+1);
							}

							if((abbreviationArr.length > 2)&&(pokemon.chargedMovePool[j].abbreviation == abbreviationArr[2])){
								chargedMoveIndexes.push(j+1);
							}
						}

						var pokeStr = pokemon.speciesId + "-m-" + fastMoveIndex + "-" + chargedMoveIndexes[0];

						if(chargedMoveIndexes.length > 1){
							pokeStr += "-" + chargedMoveIndexes[1];
						}

						if(n > 0){
							teamURL += ",";
						}

						teamURL += pokeStr;
					}

					$row.find(".link a").attr("href", teamURL);

					$(".train-table.teams tbody").append($row);

					// Hijack the multiSelector JSOn export to export the JSON for this team

					multiSelector.setPokemonList(team);

					var teamObj = {
						pokemon: JSON.parse(multiSelector.convertListToJSON()), // Oh boy
						weight: 1
					};
					teamJSON.push(teamObj);
					multiSelector.setPokemonList([]);
				}

				// Display export json
				var data = {
					dataType: "training-teams",
					data: teamJSON
				};

				$(".training-editor-import textarea").val(JSON.stringify(data));
			}

			// Import JSON data

			self.importTeams = function(obj){
				// If the data isn't preformatted, adjust it to match export JSON format

				if(! obj.dataType){
					// I heard you liked objects so I put an object in your object
					obj = {
						dataType: "training-teams",
						data: obj
					};
				}

				console.log(obj);

				if(! obj.data){
					return false;
				}

				// Hijack the multiSelector import to import each team

				for(var i = 0; i < obj.data.length; i++){
					var team = obj.data[i].pokemon;

					multiSelector.quickFillGroup(team);
					teams.push(multiSelector.getPokemonList());
				}

				self.updateTeamList();
			}

			// Clear and display the multiSelector

			function setupNewTeam(e){
				multiSelector.setPokemonList([]);
				multiSelector.updateListDisplay();
				$(".multi-selector").show();
				$(".multi-selector").attr("mode", "new");
				$(".button.new-team").hide();
			}


			// Edit an existing team

			function setupEditTeam(e){
				// Subtract 1 because the first button is in the hidden template
				selectedTeamIndex = $(".button.edit").index($(e.target)) - 1;
				multiSelector.setPokemonList(teams[selectedTeamIndex]);
				multiSelector.updateListDisplay();
				$(".multi-selector").show();
				$(".multi-selector").attr("mode", "edit");
			}

			// Validate and add currently selected team

			function addNewTeam(e){
				var team = multiSelector.getPokemonList();

				if(team.length > 0){
					teams.push(team);
					$(".multi-selector").hide();
					$(".button.new-team").show();

					self.updateTeamList();
				}
			}

			// Save changes to selected team

			function editTeam(e){
				var team = multiSelector.getPokemonList();

				if(team.length > 0){
					teams[selectedTeamIndex] = team;
					$(".multi-selector").hide();
					$(".button.new-team").show();

					self.updateTeamList();
				}
			}

			// Set a new battle CP

			function selectLeague(e){
				var cp = parseInt($(".league-select option:selected").val());

				battle.setCP(cp);

				gm.loadRankingData(self, "overall", cp, "all");
			}


		}

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
