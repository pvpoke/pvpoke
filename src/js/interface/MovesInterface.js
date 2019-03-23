// JavaScript Document

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
				
				
				$(".mode-select").on("change", selectMode);
				
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
					headers.push("E", "DPE");
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
				
				table = new SortableTable($(".sortable-table.moves"), headers, data);
				table.sortAndDisplayData("name", true);
				
				$(".loading").hide();
			}
			
			// Displays the grabbed data. Showoff.
			
			this.displayRankingData = function(rankings){
				
				var gm = GameMaster.getInstance();
				
				data = rankings;
				
				// Create an element for each ranked Pokemon
				
				for(var i = 0; i < rankings.length; i++){
					var r = rankings[i];
					
					var pokemon = new Pokemon(r.speciesId);
					
					// Is this the best way to add HTML content? I'm gonna go with no here. But does it work? Yes!
					
					var $el = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\" data=\""+pokemon.speciesId+"\"><div class=\"name-container\"><span class=\"number\">#"+(i+1)+"</span><span class=\"name\">"+pokemon.speciesName+"</span></div><div class=\"rating-container\"><div class=\"rating\">"+r.score+"</span></div><div class=\"clear\"></div></div><div class=\"details\"></div>");

					$(".rankings-container").append($el);
				}
				
				$(".loading").hide();
				$(".rank").on("click", selectPokemon);
				
				
				// If search string exists, process it
				
				if($(".poke-search").val() != ''){
					$(".poke-search").trigger("keyup");
				}
				
				
				// If a Pokemon has been selected via URL parameters, jump to it
				
				if(jumpToPoke){
					var $el = $(".rank[data=\""+jumpToPoke+"\"]")
					$el.trigger("click");
					
					// Scroll to element
					
					$("html, body").animate({ scrollTop: $(document).height()-$(window).height() }, 500);
					$(".rankings-container").scrollTop($el.position().top-$(".rankings-container").position().top-20);
					
					jumpToPoke = false;
				}
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
	
							case "cp":
								$(".league-select option[value=\""+val+"\"]").prop("selected","selected");
								
								break;
								
							case "cat":
								$(".ranking-categories a").removeClass("selected");
								$(".ranking-categories a[data=\""+val+"\"]").addClass("selected");
								break;
								
							case "cup":
								$(".cup-select option[value=\""+val+"\"]").prop("selected","selected");
								
								break;
								
							case "p":
								// We have to wait for the data to load before we can jump to a Pokemon, so store this for later
								jumpToPoke = val;
								break;
								
						}
					}
				}
				
				// Load data via existing change function
				
				var cp = $(".league-select option:selected").val();
				var category = $(".ranking-categories a.selected").attr("data");
				var cup = $(".cup-select option:selected").val();
				
				self.displayRankings(category, cp, cup, null);
			}
			
			// When the view state changes, push to browser history so it can be navigated forward or back
			
			this.pushHistoryState = function(moveMode){
				var url = webRoot+"moves/"+moveMode+"/";
				
				var data = {mode: mode};
				
				window.history.pushState(data, "Moves", url);
				
				// Send Google Analytics pageview
				
				gtag('config', UA_ID, {page_location: (host+url), page_path: url});
			}
			
			// Event handler for changing the league select
			
			function selectMode(e){
				mode = $(".mode-select option:selected").val();
				
				$(".stats-table .charged, .stats-table .fast").hide();
				$(".stats-table ."+mode).show();
				
				self.displayMoves();
				
				self.pushHistoryState(mode);
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