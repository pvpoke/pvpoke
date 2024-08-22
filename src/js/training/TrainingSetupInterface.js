/*
* Interface functionality for move list and explorer
*/
// Load AI archetypes

var file = webRoot+"data/training/teams/featured/featured-july.json?v=1";
var featuredTeams = [];

$.getJSON( file, function( data ){
	featuredTeams = data;
	console.log("Featured team data loaded ["+featuredTeams.length+"]");

	// Add featured teams to team select
	for(var i = 0; i < featuredTeams.length; i++){
		$(".featured-team-select").append("<option value=\""+featuredTeams[i].slug+"\">"+featuredTeams[i].name+" ("+featuredTeams[i].cupName+")</option>");
	}
});

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
			var playerRoster;
			var currentTeam = [];
			var currentTeamIndex = 0;
			var roundNumber = 0;
			var featuredTeam = null;

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

				// Load ranking data for movesets
				gm.loadRankingData(self, "overall", 1500, "all");

				// Event listeners

				$(".league-cup-select").on("change", selectLeague);
				$(".mode-select").on("change", selectMode);
				$(".team-method-select").on("change", selectTeamMethod);
				$(".featured-team-select").on("change", selectFeaturedTeam);
				$(".battle-btn").on("click", startBattle);
				$(".lets-go-btn").on("click", startTournamentBattle);
				$("a.return-to-setup").on("click", returnToSetup);
				$("body").on("click", ".self .roster .pokemon", selectRosterPokemon);
				$("a.random").on("click", randomizeTeam);
				$("body").on("click", ".check", checkBox);
				$("textarea.team-import").on("change", initTeamCodeCheck);
				$(".team-fill-select").on("change", loadTeamPool);

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
			};

			// Callback after ranking data is loaded

			this.displayRankingData = function(data){
				console.log("Ranking data loaded");
			}

			// Hide setup after initiating battle

			this.close = function(){
				for(var i = 0; i < 4; i++){
					$(".section").eq(i).hide();
				}

				$(".section.updates").hide();
				$(".header-ticker").hide();
				$("#main h1").hide();
				$("footer").hide();
			}

			// Show setup after battle

			this.open = function(){
				for(var i = 0; i < 3; i++){
					$(".section:not('.mega-warning')").eq(i).show();
				}

				$(".section.updates").show();
				$(".header-ticker").show();
				$("#main h1").show();
				$("footer").show();
			}

			this.openTeamSelect = function(players, roundRecord){
				playerRoster = players[0].getRoster();
				currentTeamIndex = 0;

				self.close();
				$(".section.team-select").show();

				// Display team rosters
				$(".team-select .roster, .team-select .team").html("");

				for(var i = 0; i < players.length; i++){
					var player = players[i];
					var roster = player.getRoster();

					for(var n = 0; n < roster.length; n++){
						var pokemon = roster[n];
						var $el = $(".switch-window .pokemon").first().clone();
						$el.show();

						$el.find(".name").attr("class","name");
						$el.attr("type-1", pokemon.types[0]);
						if(pokemon.types[1] == "none"){
							$el.attr("type-2", pokemon.types[0]);
						} else{
							$el.attr("type-2", pokemon.types[1]);
						}

						$el.attr("data-pokemon-id", pokemon.speciesId);
						$el.addClass("active");
						$el.find(".name").html(pokemon.speciesName);
						$el.find(".cp").html("cp " + pokemon.cp);
						$el.attr("index", n);

						if(i == 0){
							$el.find(".sprite-container").append("<div class=\"number\"></div>");
						}

						$(".team-select .roster").eq(1-i).append($el);

						// Check to see if this Pokemon was selected for a previous round
						if((i == 0)&&(currentTeam.length == 3)){
							var selectedCount = 0;

							for(var j = 0; j < currentTeam.length; j++){
								if(pokemon == currentTeam[j]){
									$el.addClass("selected");
									$el.attr("team-index", j);
									$el.find(".number").html((j+1));
									selectedCount++;
								}
							}

							if(selectedCount > 0){
								currentTeamIndex = 2;
							}
						}
					}
				}

				// Show the current round record
				$(".round-record").html(roundRecord[0] + "-" + roundRecord[1]);

				// Show or hide featured team details
				if(teamSelectMethod != "featured"){
					$(".team-select .opponent h3.center").show();
				} else{
					$(".team-select .opponent h3.center").hide();
				}
			}

			// Callback for importing a randomly generated roster

			this.importRandomizedRoster = function(roster){
				multiSelectors[0].setPokemonList(roster.slice(0, partySize));
			}

			// Set the current tournament round number for reference

			this.setRoundNumber = function(val){
				roundNumber = val;
			}

			// Dispatch battle start to the MatchHandler with provided options

			function startBattle(e){
				// Only start if league and cup are selected
				var val = $(".league-cup-select option:selected").val();

				if(val == ""){
					modalWindow("Select League", $("<p>Please select a league or cup.</p>"));

					return false;
				}


				var teams = [
					 multiSelectors[0].getPokemonList(),
					 multiSelectors[1].getPokemonList()
					];
				var difficulty = $(".difficulty-select option:selected").val();

				if((teams[0].length < partySize)||((teamSelectMethod == "manual")&&(teams[1].length < partySize))){
					modalWindow("Select Teams", $("<p>Please select a full team.</p>"));

					return false;
				}

				if((teamSelectMethod == "featured")&&(! featuredTeam)){
					modalWindow("Featured Team", $("<p>Please select a featured team to fight.</p>"));

					return false;
				}

				var autotapOverride = $(".autotap-toggle").hasClass("on");
				var switchTime = parseInt($(".switch-time-select option:selected").val());

				console.log(switchTime);

				// Set the round number to 0 for tournament mode
				roundNumber = 0;

				var props = {
					teams: teams,
					mode: mode,
					difficulty: difficulty,
					teamSelectMethod: teamSelectMethod,
					partySize: partySize,
					league: battle.getCP(),
					cup: battle.getCup().name,
					featuredTeam: featuredTeam,
					autotapOverride:autotapOverride,
					switchTime: switchTime,
					customTeamPool: []
					};

				// Reset roster selection for tournament mode
				if(mode == "tournament"){
					currentTeamIndex = 0;
					currentTeam = [];
				}

				// Set custom team pool

				if(teamSelectMethod == "custom"){
					props.customTeamPool = JSON.parse($("textarea.team-import").val());
				}

				handler.initBattle(props);
			}

			// Event handler for changing the battle mode

			function selectMode(e){
				partySize = 3;
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

				switch(teamSelectMethod){
					case "random":
						$(".poke.multi").eq(1).hide();
						$(".featured-team-section").hide();
						$(".custom-team-section").hide();
						featuredTeam = null;
						break;

					case "manual":
						$(".poke.multi").eq(1).show();
						$(".featured-team-section").hide();
						$(".custom-team-section").hide();
						featuredTeam = null;
						break;

					case "featured":
						$(".poke.multi").eq(1).hide();
						$(".featured-team-section").show();
						$(".custom-team-section").hide();
						featuredTeam = null;
						break;

					case "custom":
						$(".poke.multi").eq(1).hide();
						$(".featured-team-section").hide();
						$(".custom-team-section").show();
						featuredTeam = null;
						break;
				}

				$(".featured-team-description").hide();
				multiSelectors[1].setMaxPokemonCount(partySize);
			}

			// Event handler for changing the AI's team selection

			function selectFeaturedTeam(e){
				var slug = $(".featured-team-select option:selected").val();

				for(var i = 0; i < featuredTeams.length; i++){
					var team = featuredTeams[i];

					if(team.slug == slug){
						$(".featured-team-description img").attr("src", webRoot + "img/train/featured/"+team.img+".png?v=2");
						$(".featured-team-description a").attr("href", team.link);
						$(".featured-team-description a h3").html(team.name);
						$(".featured-team-description p").html(team.description);

						// Select the assocaited cup and league
						$(".league-cup-select option[value=\""+team.league+" "+team.cup+"\"]").prop("selected","selected");
						$(".league-cup-select").trigger("change");

						// Fill in the featured team
						multiSelectors[1].setMaxPokemonCount(6);
						multiSelectors[1].quickFillGroup(team.pokemon);

						$(".featured-team-description").show()

						featuredTeam = team;

						// Fill in team preview
						var teamPokemon = multiSelectors[1].getPokemonList();
						$(".featured-team-preview").html("");

						for(var n = 0; n < teamPokemon.length; n++){
							var pokemon = teamPokemon[n];
							var $row = $("<div class=\"preview-poke\"></div>");
							var $el = $(".switch-window .pokemon").first().clone();
							$el.find(".name").remove();
							$el.find(".cp").remove();

							$el.attr("type-1", pokemon.types[0]);
							if(pokemon.types[1] == "none"){
								$el.attr("type-2", pokemon.types[0]);
							} else{
								$el.attr("type-2", pokemon.types[1]);
							}

							$row.append($el);
							$row.append("<div class\"name-container\"><h6></h6><p></p></div>");

							var moveStr = pokemon.fastMove.name;

							if(pokemon.chargedMoves.length > 0){
								moveStr += " + " + pokemon.chargedMoves[0].name;

								if(pokemon.chargedMoves.length == 2){
									moveStr += " &amp; " + pokemon.chargedMoves[1].name;
								}
							}

							$row.find("h6").html(pokemon.speciesName);
							$row.find("p").html(moveStr);


							$(".featured-team-preview").append($row);
						}
					}
				}
			}

			// Event handler for choosing a Pokemon from the roster in tournament mode

			function selectRosterPokemon(e){
				var $el = $(e.target).closest(".pokemon")
				var index = $el.attr("index");


				if(! $el.hasClass("selected")){
					// Remove class and attributes from previously selected Pokemon of the same index
					$(".self .roster .pokemon[team-index="+currentTeamIndex+"]").removeClass("selected");

					// Insert or replace Pokemon on the team selection
					if(currentTeamIndex >= currentTeam.length){
						currentTeam.push(playerRoster[index]);
					} else{
						currentTeam.splice(currentTeamIndex, 1, playerRoster[index]);
					}

					$el.addClass("selected");
					$el.attr("team-index", currentTeamIndex);
					$el.find(".number").html((currentTeamIndex+1));

					// Search for the next available team index
					for(currentTeamIndex = 0; currentTeamIndex < currentTeam.length; currentTeamIndex++){
						if(currentTeam[currentTeamIndex] === null){
							break;
						}
					}

					currentTeamIndex = Math.min(currentTeamIndex, 2);

				} else{
					// Deselect a Pokemon

					$el.removeClass("selected");
					currentTeam[parseInt($el.attr("team-index"))] = null;
					currentTeamIndex = parseInt($el.attr("team-index"));

					// Reset the index to 0 if nothing is selected
					if($(".self .roster .pokemon.selected").length == 0){
						currentTeamIndex = 0;
					}
				}

				// Check to see if a full team is selected to show the continue button
				var teamCount = 0;

				for(var i = 0; i < currentTeam.length; i++){
					if(currentTeam[i] !== null){
						teamCount++;
					}
				}

				if(teamCount == 3){
					$(".team-select .lets-go-btn").css("display","block");
				} else{
					$(".team-select .lets-go-btn").hide();
				}
			}

			// Start a tournament battle after selecting a team

			function startTournamentBattle(e){
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
					cup: battle.getCup().name,
					featuredTeam: featuredTeam
					};

				if(roundNumber == 0){
					handler.startTournamentRound(currentTeam, props);
				} else{
					handler.startTournamentBattle(currentTeam, props);
				}

			}

			// Event handler for changing the league select

			function selectLeague(e){
				var vals = $(".league-cup-select option:selected").val().split(" ");
				var cp = vals[0];
				var cup = vals[1];

				battle.setCP(cp);
				battle.setCup(cup);

				if(! battle.getCup().levelCap){
					battle.setLevelCap(50);
				}

				for(var i = 0; i < multiSelectors.length; i++){
					multiSelectors[i].setCP(cp);
				}

				// Force featured team selection for Cliffhanger and hide randomize button
				if((cup == "cliffhanger")||(cup == "continentals-2")){
					$(".team-method-select option[value=\"featured\"]").prop("selected","selected");
					$(".team-method-select").trigger("change");
					$(".team-method-select option[value=\"random\"]").hide();
					$("a.random").hide();
				} else{
					$(".team-method-select option[value=\"random\"]").show();
					$("a.random").show();
				}

				// Force 3v3 for GO Battle League
				if((battle.getCup().partySize)&&(battle.getCup().partySize == 3)){
					$(".mode-select option[value=\"single\"]").prop("selected","selected");
					$(".mode-select option[value=\"tournament\"]").prop("disabled","disabled");
					$(".mode-select").trigger("change");
				} else{
					$(".mode-select option[value=\"tournament\"]").prop("disabled","");
				}

				gm.loadRankingData(self, "overall", cp, cup);
			}

			// Give the player a random team

			function randomizeTeam(e){
				e.preventDefault();

				var difficulty = $(".difficulty-select option:selected").val();
				var player = new Player(0, difficulty, battle);
				player.getAI().generateRoster(partySize, self.importRandomizedRoster);
			}

			// Provide visual feedback that the user entered the correct code in the correct place

			function initTeamCodeCheck(e){
				$(".custom-team-validation").hide();

				setTimeout(function(){
					if(validateTeamCode($(e.target).val())){
						$(".custom-team-validation.true").show();
					} else{
						$(".custom-team-validation.false").show();
					}
				}, 250);
			}

			// Load a team pool from local storage

			function loadTeamPool(e){
				var val = $(e.target).find("option:selected").val();
				var data = window.localStorage.getItem(val);

				$(".team-import").val(data);
				$(".team-import").trigger("change");
			}

			function validateTeamCode(code){
				var obj;

				try{
					obj = JSON.parse(code);
					console.log(obj);
				} catch{
					return false;
				}

				var teams = [];

				if(obj.dataType){
					teams = obj.data;
				} else{
					teams = obj;
				}

				if(teams.length < 1){
					return false;
				}

				return true;
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
				$(this).trigger("change");
			}

			// Return to the setup screen from the tournament team select screen

			function returnToSetup(e){
				e.preventDefault();

				handler.returnToSetup();
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
