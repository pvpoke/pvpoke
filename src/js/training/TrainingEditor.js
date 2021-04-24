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
			var partySize = 3;

			self.init = function(){
				battle = new Battle();

				// Init the multiselector
				multiSelector = new PokeMultiSelect($(".poke.multi"));
				multiSelector.init(gm.data.pokemon, battle);
				multiSelector.setMaxPokemonCount(partySize);

				// Load Great League movesets by default

				gm.loadRankingData(self, "overall", 1500, "all");

				// Event handlers

				$(".button.new-team").click(setupNewTeam);
				$(".button.add-team").click(addNewTeam);
				$(".league-select").change(selectLeague);
				$("body").on("click", "a.edit", setupEditTeam);
				$("body").on("click", "a.delete", confirmDeleteTeam);
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

					for(var n = 0; n < team.length; n++){
						var pokemon = team[n];

						$row.find(".sprite-container").eq(n).attr("type-1", pokemon.types[0]);
						$row.find(".sprite-container").eq(n).attr("type-2", pokemon.types[0]);
						$row.find(".sprite-container").eq(n).attr("data", pokemon.speciesId);

						if(pokemon.types[1] != "none"){
							$row.find(".sprite-container").eq(n).attr("type-2", pokemon.types[1]);
						}

						var movesetStr = pokemon.fastMove.abbreviation+"+"+pokemon.chargedMoves[0].abbreviation;

						if(pokemon.chargedMoves.length > 1){
							movesetStr += "/" + pokemon.chargedMoves[1].abbreviation;
						}

						$row.find(".name").eq(n).html(pokemon.speciesName);
						$row.find(".moves").eq(n).html(movesetStr);
					}

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
					name: "New Team Pool",
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
						name: "New Team Pool",
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

				$(".multi-selector").hide();
				$(".button.new-team").show();

				self.updateTeamList();
			}

			// Clear and display the multiSelector

			function setupNewTeam(e){
				multiSelector.setPokemonList([]);
				multiSelector.updateListDisplay();
				$(".multi-selector").show();
				$(".multi-selector").attr("mode", "new");
				$(".button.new-team").hide();

				// Scroll to multiSelector
				$("html, body").animate({ scrollTop: $(".multi-selector").offset().top - 185 }, 500);
			}


			// Edit an existing team

			function setupEditTeam(e){
				e.preventDefault();

				// Subtract 1 because the first button is in the hidden template
				selectedTeamIndex = $("a.edit").index($(e.target)) - 1;
				multiSelector.setPokemonList(teams[selectedTeamIndex]);
				multiSelector.updateListDisplay();
				$(".multi-selector").show();
				$(".multi-selector").attr("mode", "edit");

				// Scroll to multiSelector
				$("html, body").animate({ scrollTop: $(".multi-selector").offset().top - 185 }, 500);
			}

			// Confirm the user wants to delete this team

			function confirmDeleteTeam(e){
				e.preventDefault();

				// Subtract 1 because the first button is in the hidden template
				selectedTeamIndex = $("a.delete").index($(e.target)) - 1;

				var selectedTeam = teams[selectedTeamIndex];

				modalWindow("Delete Team", $(".team-delete-confirm").first());

				var teamList = "";

				for(var i = 0; i < selectedTeam.length; i++){
					if(i > 0){
						teamList += ", ";
					}

					teamList += selectedTeam[i].speciesName;
				}

				$(".modal p").eq(1).html("<b>"+teamList+"</b>");

				// Hide the multiSelector so selected teams don't get mixed up

				$(".multi-selector").hide();
				$(".button.new-team").show();

				$(".modal .yes").click(function(e){
					teams.splice(selectedTeamIndex, 1);
					self.updateTeamList();

					closeModalWindow();
				});

				$(".modal .no").click(function(e){
					closeModalWindow();
				});
			}

			// Validate and add currently selected team

			function addNewTeam(e){
				var team = multiSelector.getPokemonList();

				if(team.length < partySize){
					modalWindow("Enter Full Team", $(".enter-full-team").first());

					return false;
				} else if(team.length == partySize){
					teams.push(team);
					$(".multi-selector").hide();
					$(".button.new-team").show();

					self.updateTeamList();
				}
			}

			// Save changes to selected team

			function editTeam(e){
				var team = multiSelector.getPokemonList();

				if(team.length < partySize){
					modalWindow("Enter Full Team", $(".enter-full-team").first());

					return false;
				} else if(team.length == partySize){
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

			// Oh yeah, it's big brain copy + paste time
			// Copy list text

			$(".training-editor-import .copy").click(function(e){
				var el = $(e.target).prev()[0];
				el.focus();
				el.setSelectionRange(0, el.value.length);
				document.execCommand("copy");
			});

			// Copy text to import

			$(".training-editor-import textarea.import").on("click", function(e){
				this.setSelectionRange(0, this.value.length);
			});


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
