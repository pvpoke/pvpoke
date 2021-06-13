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
			var selectedTeamPool = false; // Store the id of the selected team pool
			var partySize = 3;

			self.init = function(){
				battle = new Battle();

				// Init the multiselector
				multiSelector = new PokeMultiSelect($(".poke.multi"));
				multiSelector.init(gm.data.pokemon, battle);
				multiSelector.setMaxPokemonCount(partySize);

				// Hide the CP and advanced IV's section of the pokeSelector
				$(".poke.single h3.cp, .poke.single .advanced-section").hide();

				// Load Great League movesets by default

				gm.loadRankingData(self, "overall", 1500, "all");

				// Event handlers

				$(".button.new-team").click(setupNewTeam);
				$(".button.add-team").click(addNewTeam);
				$(".league-select").change(selectLeague);
				$("body").on("click", "a.edit", setupEditTeam);
				$("body").on("click", "a.delete", confirmDeleteTeam);
				$(".button.save-changes").click(editTeam);
				$("body").on("click", ".check", checkBox);


				$(".training-editor-import textarea").change(function(e){
					var data = JSON.parse($(".training-editor-import textarea").val());
					self.importTeams(data);
				});

				// Load pools from local storage
				var i = 0;

				while(window.localStorage.key(i) !== null){
					var key = window.localStorage.key(i);
					var content = window.localStorage.getItem(key);

					try{
						var data = JSON.parse(content);

						if((data.dataType)&&(data.dataType == "training-teams")){
							$(".team-fill-select").append("<option value=\""+key+"\" type=\"custom\">"+data.name+"</option>");
						}
					} catch{

					}

					i++;
				}
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

				$(".training-editor-import textarea").val(self.convertListToJSON(""));
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
				teams = [];

				for(var i = 0; i < obj.data.length; i++){
					var team = obj.data[i].pokemon;

					multiSelector.quickFillGroup(team);
					teams.push(multiSelector.getPokemonList());
				}

				$(".multi-selector").hide();
				$(".button.new-team").show();

				self.updateTeamList();
			}

			// Given an id, save current team pool to localstorage

			self.saveTeamPool = function(name, isNew){
				var data = self.convertListToJSON(name);

				if(name == ''){
					return;
				}

				window.localStorage.setItem("team-pool-" + name, data);

				if(! isNew){
					modalWindow("Custom Group Saved", $("<p><b>"+name+"</b> has been updated.</p>"))
				} else{
					// Add new group to all dropdowns

					$(".team-fill-select").append($("<option value=\"team-pool-"+name+"\" type=\"custom\">"+name+"</option>"));
					$(".team-fill-select option").last().prop("selected", "selected");

					$(".team-fill-buttons .save-as").show();
					$(".team-fill-buttons .save-custom").show();
					$(".team-fill-buttons .delete-btn").show();
				}
			}

			self.convertListToJSON = function(name){
				var teamJSON = [];

				for(var i = 0; i < teams.length; i++){
					var team = teams[i];

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
					name: name,
					dataType: "training-teams",
					data: teamJSON
				};

				return JSON.stringify(data);
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
				$(".button.add-poke-btn").click();
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
				var levelCap = parseInt($(".league-select option:selected").attr("level-cap"));

				battle.setCP(cp);
				battle.setLevelCap(levelCap);

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

			// Open the save window

			$(".team-fill-buttons .save-btn").click(function(e){

				if((! selectedTeamPool)||($(e.target).hasClass("save-as"))){
					// Prompt to save a new group if a custom one isn't selected
					modalWindow("Save Team Pool", $(".save-pool").eq(0));
				} else{
					self.saveTeamPool(selectedTeamPool.replace("team-pool-",""), false);
				}

			});

			// Close the save window and save new group

			$("body").on("click", ".modal .button.save", function(e){
				self.saveTeamPool($(".modal input.list-name").val(), true);

				closeModalWindow();
			});

			// Load an existing group

			$(".team-fill-select").change(function(e){
				var val = $(this).find("option:selected").val();

				// Create a new group

				if(val == "new"){
					teams = [];

					self.updateTeamList();

					// Show the save button

					$(".team-fill-buttons .save-as").hide();
					$(".team-fill-buttons .save-custom").show();
					$(".team-fill-buttons .delete-btn").hide();

					selectedTeamPool = false;
				} else{
					var data = window.localStorage.getItem(val);
					self.importTeams(JSON.parse(data));

					// Show the save and delete buttons

					$(".team-fill-buttons .save-as").show();
					$(".team-fill-buttons .save-custom").show();
					$(".team-fill-buttons .delete-btn").show();

					selectedTeamPool = val;
				}
			});

			// Open the delete group window

			$(".team-fill-buttons .delete-btn").click(function(e){
				var name = $(".team-fill-select option:selected").html();

				modalWindow("Delete Group", $(".delete-list-confirm").first());

				$(".modal .name").html(name);


				// Trigger for deleting group cookie

				$(".modal .delete-list-confirm .button.yes").click(function(e){

					window.localStorage.removeItem(selectedTeamPool);

					closeModalWindow();

					// Remove option from quick fill selects

					$(".team-fill-select option[value='"+selectedTeamPool+"']").remove();
					$(".team-fill-select option").first().prop("selected", "selected");
					$(".team-fill-select").trigger("change");
				});
			});
		}

		// Turn checkboxes on and off

		function checkBox(e){
			$(this).toggleClass("on");
			$(this).trigger("change");
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
