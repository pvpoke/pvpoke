// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var gm = GameMaster.getInstance();
			var data;
			var context = "train_rankings";
			var mode = "pokemon";
			var battle = new Battle();
			var performerCSV = '';
			var teamCSV = '';


			this.init = function(){

				if(! get){
					this.loadRankings("1500","all");
				} else{
					this.loadGetData();
				}

				$(".format-select").on("change", selectFormat);
				$("thead a").on("click", sortTable);
				$("body").on("click", ".check", checkBox);

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});
			};

			// Grabs ranking data from the Game Master

			this.loadRankings = function(league, cup){
				league = parseInt(league);

				$(".train-table tbody").html('');
				$(".loading").show();

				battle.setCup(cup);
				battle.setCP(league);

				pokeSearch.setBattle(battle);

				/* This timeout allows the interface to display the loading message before
				being thrown into the data loading loop */

				setTimeout(function(){
					gm.loadTrainData(self, league, cup);
				}, 50);

			}

			// Displays the grabbed data. Showoff.

			this.displayRankingData = function(rankings){

				data = rankings;

				$(".train-table tbody").html('');

				// Initialize csv data

				performerCSV = 'Pokemon,Team Rating,Individual Rating,Usage\n';


				// Display top performers rankings

				for(var i = 0; i < rankings.performers.length; i++){
					var r = rankings.performers[i];

					// For now, convert species name to a species ID
					var arr = r.pokemon.split(" ");
					var movesetStr = arr[arr.length-1];
					var movesetArr = movesetStr.split(/\+|\//);
					var speciesId = r.pokemon.replace(" " + movesetStr, "");

					var pokemon = new Pokemon(speciesId, 0, battle);

					if(! pokemon.speciesId){
						continue;
					}

					// Create a new row
					var $row = $(".train-table.performers thead tr.hide").clone();
					$row.removeClass("hide");
					$row.attr("data", speciesId);
					$row.find(".sprite-container").attr("type-1", pokemon.types[0]);
					$row.find(".sprite-container").attr("type-2", pokemon.types[0]);

					if(pokemon.types[1] != "none"){
						$row.find(".sprite-container").attr("type-2", pokemon.types[1]);
					}

					$row.find(".name").html(pokemon.speciesName);
					$row.find(".moves").html(r.pokemon.split(" ")[1]);
					$row.find(".individual-score").html(r.individualScore.toFixed(1) + '%');
					$row.find(".team-score .score").html(r.teamScore.toFixed(1));

					if(r.teamScore >= 500){
						$row.find(".team-score .score").addClass("win");
					}

					// Normalize rating so it has more visual effect
					var colorRating = 500 + ((r.teamScore - 500) * 8);

					if(colorRating > 1000){
						colorRating = 1000;
					} else if(colorRating < 0){
						colorRating = 0;
					}

					var color = battle.getRatingColor(colorRating);
					$row.find(".team-score .score").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");

					var usage = (r.games / (data.properties.totalPerformers / 3) * 100).toFixed(1)+"%"
					$row.find(".usage").html(usage);
					$row.find(".link a").attr("href", host+"rankings/" + battle.getCup().name + "/" + battle.getCP() + "/overall/" + pokemon.speciesId + "/");

					if(r.games < 250){
						$row.find(".usage").addClass("low-volume");
					}

					$(".train-table.performers tbody").append($row);

					performerCSV += pokemon.speciesName + ' ' + movesetStr + ',' + r.teamScore + ',' + r.individualScore + ',' + usage + '\n';
				}

				// Display top teams rankings
				teamCSV = 'Team,Team Rating,Usage\n'

				for(var i = 0; i < rankings.teams.length; i++){
					var r = rankings.teams[i];
					var team = [];
					var arr = r.team.split("|"); // Split string value into Pokemon

					// Create a new row
					var $row = $(".train-table.teams thead tr.hide").clone();
					$row.removeClass("hide");

					var cupName = battle.getCup().name;
					var teamURL = host + "team-builder/" + cupName + "/" + battle.getCP(true) + "/";
					var teamStr = '';

					for(var n = 0; n < arr.length; n++){
						var speciesId = arr[n].split(" ")[0];
						var movesetStr = arr[n].split(" ")[1];

						var pokemon = new Pokemon(speciesId, 0, battle);

						if(! pokemon.speciesId){
							continue;
						}

						teamStr += pokemon.speciesName + " " + movesetStr + " ";

						$row.find(".sprite-container").eq(n).attr("type-1", pokemon.types[0]);
						$row.find(".sprite-container").eq(n).attr("type-2", pokemon.types[0]);
						$row.find(".sprite-container").eq(n).attr("data", speciesId);

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

						team.push(pokemon);
					}

					$row.find(".link a").attr("href", teamURL);
					$row.find(".team-score .score").html(r.teamScore.toFixed(1));

					if(r.teamScore >= 500){
						$row.find(".team-score .score").addClass("win");
					}

					// Normalize rating so it has more visual effect
					var colorRating = 500 + ((r.teamScore - 500) * 8);

					if(colorRating > 1000){
						colorRating = 1000;
					} else if(colorRating < 0){
						colorRating = 0;
					}

					var color = battle.getRatingColor(colorRating);
					var usage = ((r.games / data.properties.totalTeams)*100).toFixed(1)+"%";

					$row.find(".team-score .score").css("background-color", "rgb("+color[0]+","+color[1]+","+color[2]+")");
					$row.find(".usage").html(usage);

					if(r.games < 30){
						$row.find(".usage").addClass("low-volume");
					}

					teamCSV += teamStr + ',' + r.teamScore + ',' + usage + '\n';

					$(".train-table.teams tbody").append($row);
				}

				$(".loading").hide();

				// Update download link with new data
				var filename = battle.getCup().name + " " + battle.getCP() + " Top Performers.csv";
				var filedata = '';

				if (!performerCSV.match(/^data:text\/csv/i)) {
					filedata = [performerCSV];
					filedata = new Blob(filedata, { type: 'text/csv'});
				}

				$(".button.download-csv.performers").attr("href", window.URL.createObjectURL(filedata));
				$(".button.download-csv.performers").attr("download", filename);

				// Update download link with new data
				var filename = battle.getCup().name + " " + battle.getCP() + " Top Teams.csv";
				var filedata = '';

				if (!performerCSV.match(/^data:text\/csv/i)) {
					filedata = [teamCSV];
					filedata = new Blob(filedata, { type: 'text/csv'});
				}

				$(".button.download-csv.teams").attr("href", window.URL.createObjectURL(filedata));
				$(".button.download-csv.teams").attr("download", filename);

				// Display last update date

				$(".date-updated").html("Last updated " + data.properties.lastUpdated);

				// If search string exists, process it

				if($(".poke-search").val() != ''){
					$(".poke-search").trigger("keyup");
				}
			}

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				// Cycle through parameters and set them
				var cp = 1500;
				var cup = "all";

				for(var key in get){
					if(get.hasOwnProperty(key)){

						var val = get[key];

						// Process each type of parameter

						switch(key){

							// Don't process default values so data doesn't needlessly reload

							case "cp":
								cp = val;
								break;

							case "cup":
								cup = val;
								break;
						}
					}
				}

				// Load data via existing change function

				$(".format-select option[value=\""+cp+"\"][cup=\""+cup+"\"]").prop("selected","selected");

				battle.setCP(cp);
				battle.setCup(cup);
				self.loadRankings(cp, cup);
			}

			// When the view state changes, push to browser history so it can be navigated forward or back

			this.pushHistoryState = function(cup, cp){

				var url = webRoot+"train/analysis/"+cup+"/"+cp+"/";

				var data = {cup: cup, cp: cp };

				window.history.pushState(data, "Rankings", url);
			}


			// Event handler for changing the format category

			function selectFormat(e){
				var cp = $(".format-select option:selected").val();
				var cup = $(".format-select option:selected").attr("cup");
				var levelCap = parseInt($(".format-select option:selected").attr("level-cap"));

				battle.setCP(cp);
				battle.setCup(cup);
				battle.setLevelCap(levelCap);

				self.loadRankings(cp, cup);
				self.pushHistoryState(cup, cp);
			}

			// Event handler for selecting ranking category

			function sortTable(e){

				e.preventDefault();

				var $parent = $(e.target).closest("table");

				$parent.find("thead a").removeClass("selected");

				$(e.target).addClass("selected");

				var targetData = data.performers;
				var sortColumn = $(e.target).attr("data");

				if($parent.hasClass("teams")){
					targetData = data.teams;
				}

				switch(sortColumn){
					case "name":
						targetData.sort((a,b) => (a.pokemon > b.pokemon) ? 1 : ((b.pokemon > a.pokemon) ? -1 : 0));
						break;

					case "lead":
						targetData.sort((a,b) => (a.team > b.team) ? 1 : ((b.team > a.team) ? -1 : 0));
						break;

					case "individual":
						targetData.sort((a,b) => (a.individualScore > b.individualScore) ? -1 : ((b.individualScore > a.individualScore) ? 1 : 0));
						break;

					case "team":
						targetData.sort((a,b) => (a.teamScore > b.teamScore) ? -1 : ((b.teamScore > a.teamScore) ? 1 : 0));
						break;

					case "usage":
						targetData.sort((a,b) => (a.games > b.games) ? -1 : ((b.games > a.games) ? 1 : 0));
						break;
				}

				self.displayRankingData(data);

				submitSearchQuery();
			}

			var searchTimeout;
			var searchStr = '';
			var $target = null;

			$("body").on("keyup", ".poke-search", function(e){
				searchStr = $(this).val().toLowerCase();

				$target = $(".train-table."+$(e.target).attr("target"));

				// Reset the timeout when a new key is typed. This prevents queries from being submitted too quickly and bogging things down on mobile.
				window.clearTimeout(searchTimeout);
				searchTimeout = window.setTimeout(submitSearchQuery, 200);
			});

			$("a.search-info").click(function(e){
				e.preventDefault();
				modalWindow("Search Strings", $(".sandbox-search-strings"));
			});

			function submitSearchQuery(){
				var list = GameMaster.getInstance().generatePokemonListFromSearchString(searchStr);

				if($target.hasClass("performers")){

					// Search rows of top performers
					$target.find("tbody tr").each(function(index, value){
						var id = $(this).attr("data");

						if(list.indexOf(id) > -1){
							$(this).show();
						} else{
							$(this).hide();
						}
					});

				} else if($target.hasClass("teams")){

					// Search makeups of team
					$target.find("tbody tr").each(function(index, value){
						var $row = $(this);
						var found = 0;

						$row.find(".pokemon").each(function(spriteIndex, spriteValue){
							var id = $(this).attr("data");

							if(list.indexOf(id) > -1){
								found++;
							}
						});

						if(found >= 3 || (! searchStr.includes("!")) && found > 0){
							$row.show();
						} else{
							$row.hide();
						}

					});
				}
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
				$(this).trigger("stateChange");
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
