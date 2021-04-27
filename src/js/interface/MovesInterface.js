/*
* Interface functionality for move list and explorer
*/

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var data;
			var jumpToMove = false;
			var mode = "fast";
			var gm = GameMaster.getInstance();
			var table;

			this.init = function(){
				if(! get){
					this.displayMoves();
				} else{
					this.loadGetData();
				}

				// Add moves to select options

				for(var i = 0; i < gm.data.moves.length; i++){
					var move = gm.data.moves[i];
					var $option = $("<option type=\""+move.type+"\" value=\""+move.moveId+"\">"+move.name+"</option>");

					if(move.energyGain > 0){
						$(".move-select.fast").append($option);
					} else{
						$(".move-select.charged").append($option);
					}
				}


				$(".mode-select").on("change", selectMode);
				$(".poke-search").on("keyup change", searchMove);
				$(".move-select").on("change", selectMove);
				$(".effectiveness-select").on("change", self.generateExploreResults);
				$(".check").on("click", checkBox);

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});
			};

			// Grabs ranking data from the Game Master

			this.displayMoves = function(){

				var data = [];
				var headers = ["Move","Type","D"];

				if(mode == "fast"){
					headers.push("E", "T", "DPT", "EPT");
				} else{
					headers.push("E", "DPE", "Effects");
				}

				for(var i = 0; i < gm.data.moves.length; i++){
					var move = gm.data.moves[i];

					if((mode == "fast") && (move.energy > 0)){
						continue;
					} else if((mode == "charged") && (move.energyGain > 0)){
						continue;
					}

					var obj = {
						name: move.name,
						type: move.type,
						power: move.power
					}

					if(mode == "fast"){
						obj.energy = move.energyGain;
						obj.duration = move.cooldown / 500;
						obj.dpt = Math.floor( (move.power / (move.cooldown / 500) ) * 100) / 100;
						obj.ept = Math.floor( (move.energyGain / (move.cooldown / 500) ) * 100) / 100;
					} else if(mode == "charged"){
						obj.energy = move.energy;
						obj.dpe = Math.floor( (move.power / move.energy) * 100) / 100;
						obj.effects = gm.getStatusEffectString(move);
					}

					// Edge cases

					var valid = true;

					if(move.moveId.indexOf("HIDDEN_POWER") > -1){
						if(move.moveId == "HIDDEN_POWER_BUG"){
							obj.name = "Hidden Power"
							obj.type = "normal";
						} else{
							valid = false;
						}
					}

					if((move.moveId == "TRANSFORM") || (move.moveId.indexOf("BLASTOISE") > -1) ){
						valid = false;
					}

					if(valid){
						data.push(obj);
					}
				}

				table = new SortableTable($(".sortable-table.moves"), headers, data, self.tableSortCallback);
				table.sortAndDisplayData("name", true);

				// Filter table if search string is set

				if($(".poke-search").val() != ''){
					$(".poke-search").trigger("keyup");
				}

				$(".loading").hide();
			}

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				// Cycle through parameters and set them

				for(var key in get){
					if(get.hasOwnProperty(key)){

						var val = get[key];

						// Process each type of parameter

						switch(key){

							// Don't process default values so data doesn't needlessly reload

							case "mode":
								$(".mode-select option[value=\""+val+"\"]").prop("selected","selected");

								setTimeout(function(){$(".mode-select").trigger("change")}, 50);
								break;
						}
					}
				}
			}

			// When the view state changes, push to browser history so it can be navigated forward or back

			this.pushHistoryState = function(moveMode){
				var url = webRoot+"moves/"+moveMode+"/";

				var data = {mode: mode};

				window.history.pushState(data, "Moves", url);

				// Send Google Analytics pageview

				gtag('config', UA_ID, {page_location: (host+url), page_path: url});
			}

			// Refilter moves after being sorted

			this.tableSortCallback = function(){
				if($(".poke-search").val() != ''){
					$(".poke-search").trigger("keyup");
				}
			}

			// When moves are selected, show the resulting data

			this.generateExploreResults = function(moveChange = false){

				var fastMoveId = $(".move-select.fast option:selected").val();
				var chargedMoveId = $(".move-select.charged option:selected").val();
				var selectedCount = 0;

				if((fastMoveId != '') || (chargedMoveId != '')){
					selectedCount = 1;

					if((fastMoveId != '') && (chargedMoveId != '')){
						selectedCount = 2;
					}
				}

				// Return if no moves are selected

				if(selectedCount == 0){
					$(".explore-results").hide();
					return false;
				}

				$(".explore-results").show();
				$(".explore-results .moveset-stats").html('');

				// Gather all relevant moveset stats and push them over here

				var movesetStats = [];

				if(selectedCount == 2){
					var fastMove = gm.getMoveById(fastMoveId);
					var chargedMove = gm.getMoveById(chargedMoveId);

					var fastMultipliers = parseFloat($(".effectiveness-select.fast option:selected").val()) * ($(".stab.check.fast").hasClass("on") ? 1.2 : 1);
					var chargedMultipliers = parseFloat($(".effectiveness-select.charged option:selected").val()) * ($(".stab.check.charged").hasClass("on") ? 1.2 : 1);

					var fastMovesPerCycle = Math.ceil(chargedMove.energy / fastMove.energyGain);
					var cycleDuration = (fastMovesPerCycle * fastMove.cooldown) + 500;
					var cycleDurationStr = (cycleDuration / 500) + " turns (" + (cycleDuration / 1000) + " s)";
					var fastDamage = Math.round( (fastMovesPerCycle * fastMove.power * fastMultipliers) * 10) / 10;
					var chargedDamage = Math.round( (chargedMove.power * chargedMultipliers) * 10) / 10;
					var cycleDamage = Math.round( (fastDamage + chargedDamage) * 10) / 10;
					var cycleDPT = Math.round( (cycleDamage / (cycleDuration / 500)) * 100) / 100;

					movesetStats.push({ title: "Fast Damage", value: fastDamage});
					movesetStats.push({ title: "Charged Damage", value: chargedDamage});
					movesetStats.push({ title: "Total Damage", value: cycleDamage});
					movesetStats.push({ title: "Fast Moves", value: fastMovesPerCycle});
					movesetStats.push({ title: "Cycle Duration", value: cycleDurationStr});
					movesetStats.push({ title: "Damage Per Turn", value: cycleDPT});
				}

				// Display moveset stats

				for(var i = 0; i < movesetStats.length; i++){
					var $stat = $("<div class=\"stat\"><h3>"+movesetStats[i].title+"</h3>"+"<span>"+movesetStats[i].value+"</span></div>");
					$(".explore-results .moveset-stats").append($stat);
				}

				// Search for all Pokemon who know these moves

				if(moveChange){
					$(".explore-results .rankings-container").html('');

					for(var i = 0; i < gm.data.pokemon.length; i++){
						var pokemon = gm.data.pokemon[i];
						var valid = true;

						if(pokemon.shadow){
							pokemon.chargedMoves.push("RETURN","FRUSTRATION");
						}

						if((fastMoveId != '')&&(pokemon.fastMoves.indexOf(fastMoveId) == -1)){
							valid = false;
						}

						if((chargedMoveId != '')&&(pokemon.chargedMoves.indexOf(chargedMoveId) == -1)){
							valid = false;
						}

						var isLegacy = false;

						if((pokemon.legacyMoves) && ( (pokemon.legacyMoves.indexOf(fastMoveId) > -1) || (pokemon.legacyMoves.indexOf(chargedMoveId) > -1) )){
							isLegacy = true;
						}

						if(valid){
							var rankLink = host+"rankings/all/1500/overall/"+pokemon.speciesId;

							var $rank = $("<a href=\""+rankLink+"\" target=\"_blank\" class=\"rank "+pokemon.types[0]+"\"><div class=\"name-container\"><span class=\"name\">"+pokemon.speciesName+" "+(isLegacy ? "*" : "")+"</span></div></a>");

							$(".explore-results .rankings-container").append($rank);
						}
					}
				}

			}

			// Event handler for changing the league select

			function selectMode(e){
				mode = $(".mode-select option:selected").val();

				if(mode != "explore"){
					$(".explore").hide();
					$(".stats-table .charged, .stats-table .fast").hide();
					$(".stats-table ."+mode).show();
					$(".move-table-container").show();

					self.displayMoves();

				} else{
					$(".move-table-container").hide();
					$(".explore").show();
					$(".loading").hide();
				}

				self.pushHistoryState(mode);
			}

			// Search for a move in the table or to select

			function searchMove(e){

				var val = $(this).val().toLowerCase();

				if((mode == 'fast') || (mode == 'charged')){
					// Search for a move in the table

					var searches = $(this).val().toLowerCase().split(",");

					$(".stats-table.moves tr").hide();
					$(".stats-table.moves tr").eq(0).show();

					$(".stats-table.moves tr").each(function(index, value){

						for(var i = 0; i < searches.length; i++){
							// Don't filter out the headers

							if(index == 0){
								return;
							}

							var show = false;
							var types = ["bug","dark","dragon","electric","fairy","fighting","fire","flying","ghost","grass","ground","ice","normal","poison","psychic","rock","steel","water"];

							if(types.indexOf(searches[i]) == -1){
								// Name search
								var moveName = $(this).find("td").first().html().toLowerCase();

								if(moveName.startsWith(searches[i])){
									show = true;
								}
							} else{
								// Type search

								if(($(this).find("td").eq(1).find("span").html().toLocaleLowerCase() == searches[i])){
									show = true;
								}
							}

							if(show){
								$(this).show();
							}
						}

					});
				}

				// Explorer move search

				if(mode == 'explore'){
					var $select = $(this).next(".move-select");

					$select.find("option").each(function(index, value){
						var moveName = $(this).html().toLowerCase();

						if(moveName.startsWith(val)){
							$(this).prop("selected","selected");
							$select.trigger("change");
							return false;
						}
					});
				}
			}

			// Select a move in the move explorer dropdown

			function selectMove(e){

				if(mode != "explore"){
					return;
				}

				var val = $(this).find("option:selected").val();
				var type = $(this).find("option:selected").attr("type");

				// Reset classes

				if($(this).hasClass("fast")){
					$(this).attr("class","move-select fast");
				} else{
					$(this).attr("class","move-select charged");
				}

				// Add class for the move's type

				$(this).addClass(type);

				self.generateExploreResults(true);

			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");

				if($(this).hasClass("stab")){
					self.generateExploreResults(false);
				}
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
