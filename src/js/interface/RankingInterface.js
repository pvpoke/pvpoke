// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var data;
			var jumpToPoke = false;
			var limitedPokemon = [];
			var context = "rankings";
			var battle = new Battle();

			this.init = function(){
				if(! get){
					this.displayRankings("overall","1500","all");
				} else{
					this.loadGetData();
				}


				$(".league-select").on("change", selectLeague);
				$(".cup-select").on("change", selectCup);
				$(".format-select").on("change", selectFormat);
				$(".ranking-categories a").on("click", selectCategory);
				$("body").on("click", ".check", checkBox);
				$("body").on("click", ".check.limited", toggleLimitedPokemon);

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});
			};

			// Grabs ranking data from the Game Master

			this.displayRankings = function(category, league, cup){

				var gm = GameMaster.getInstance();

				$(".rankings-container").html('');
				$(".loading").show();

				// Force 1500 if not general

				if((cup != 'all')&&(cup != 'gen-5')){
					league = 1500;

					$(".league-select option[value=\"1500\"]").prop("selected","selected");
				}
				
				battle.setCP(league);

				/* This timeout allows the interface to display the loading message before
				being thrown into the data loading loop */

				setTimeout(function(){
					gm.loadRankingData(self, category, league, cup);
				}, 50);

			}

			// Displays the grabbed data. Showoff.

			this.displayRankingData = function(rankings){

				var gm = GameMaster.getInstance();

				data = rankings;

				// Show any restrictions
				var cup = $(".cup-select option:selected").val();
				$(".limited").hide();
				limitedPokemon = [];

				if(cup == "championships-1"){
					$(".limited").show();
					$(".check.limited").addClass("on");

					limitedPokemon = ["medicham","lucario","venusaur","meganium","skarmory","altaria","bastiodon","probopass","tropius","azumarill"];
				}


				if(cup == "safari"){
					$(".limited").show();
					$(".check.limited").addClass("on");

					limitedPokemon = ["venusaur","meganium","skarmory","altaria","bastiodon","probopass","tropius","azumarill","wormadam_trash","forretress","vigoroth","swampert"];
				}

				if(cup == "fantasy"){
					$(".limited").show();
					$(".check.limited").addClass("on");

					limitedPokemon = ["azumarill","deoxys_defense","medicham","wormadam_trash","forretress","sableye"];
				}
				
				$(".section.white > .rankings-container").html('');


				// Create an element for each ranked Pokemon

				for(var i = 0; i < rankings.length; i++){
					var r = rankings[i];

					var pokemon = new Pokemon(r.speciesId, 0, battle);

					// Get names of of ranking moves

					var moveNameStr = '';

					var arr = r.moveStr.split("-");
					var move = pokemon.chargedMovePool[arr[1]-1];

					moveNameStr = pokemon.fastMovePool[arr[0]].name;
					if(pokemon.fastMovePool[arr[0]].legacy){
						moveNameStr += "*";
					}
					moveNameStr += ", " + move.name;
					if(move.legacy){
						moveNameStr += "*";
					}

					if((arr.length > 2)&&(arr[2] != "0")){
						move = pokemon.chargedMovePool[arr[2]-1];
						moveNameStr += ", " + move.name;

						if(move.legacy){
							moveNameStr += "*";
						}


					}

					// Is this the best way to add HTML content? I'm gonna go with no here. But does it work? Yes!

					var $el = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\" data=\""+pokemon.speciesId+"\"><div class=\"expand-label\"></div><div class=\"name-container\"><span class=\"number\">#"+(i+1)+"</span><span class=\"name\">"+pokemon.speciesName+"</span><div class=\"moves\">"+moveNameStr+"</div></div><div class=\"rating-container\"><div class=\"rating\">"+r.score+"</span></div><div class=\"clear\"></div></div><div class=\"details\"></div>");

					if(limitedPokemon.indexOf(pokemon.speciesId) > -1){
						$el.addClass("limited-rank");
					}

					$(".section.white > .rankings-container").append($el);
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

								if($(".format-select option[cup=\""+val+"\"]").length > 0){
									$(".format-select option[cup=\""+val+"\"]").prop("selected","selected");
								} else{
									var cat = $(".cup-select option[value=\""+val+"\"]").attr("cat");
									$(".format-select option[value=\""+cat+"\"]").prop("selected","selected");
									selectFormat();

									$(".cup-select option[value=\""+val+"\"]").prop("selected","selected");
								}

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

			this.pushHistoryState = function(cup, cp, category, speciesId){
				if(context == "custom"){
					return false;
				}

				var url = webRoot+"rankings/"+cup+"/"+cp+"/"+category+"/";

				if(speciesId){
					url += speciesId+"/";
				}

				var data = {cup: cup, cp: cp, cat: category, p: speciesId };

				window.history.pushState(data, "Rankings", url);

				// Send Google Analytics pageview

				gtag('config', UA_ID, {page_location: (host+url), page_path: url});
				gtag('event', 'Lookup', {
				  'event_category' : 'Rankings',
				  'event_label' : speciesId
				});
			}

			// Set a context so this interface can add or skip functionality

			this.setContext = function(value){
				context = value;
			}

			// Event handler for changing the league select

			function selectLeague(e){
				if($(".cup-select").length > 0){
					var cp = $(".league-select option:selected").val();
					var category = $(".ranking-categories a.selected").attr("data");
					var cup = $(".cup-select option:selected").val();

					self.displayRankings(category, cp, cup);

					self.pushHistoryState(cup, cp, category, null);
				}
			}

			// Event handler for changing the cup select

			function selectCup(e){
				var cp = $(".league-select option:selected").val();
				var category = $(".ranking-categories a.selected").attr("data");
				var cup = $(".cup-select option:selected").val();

				self.displayRankings(category, cp, cup);
				self.pushHistoryState(cup, cp, category, null);
			}

			// Event handler for changing the format category

			function selectFormat(e){
				var format = $(".format-select option:selected").val();
				var cup = $(".format-select option:selected").attr("cup");

				$(".cup-select option").hide();
				$(".cup-select option[cat=\""+format+"\"]").show();

				if(cup){
					$(".cup-select option[value=\""+cup+"\"]").eq(0).prop("selected", true);
				} else{
					$(".cup-select option[cat=\""+format+"\"]").eq(0).prop("selected", true);
				}

				if((format == "all")||(cup)){
					$(".cup-select").hide();
				} else{
					$(".cup-select").show();
				}

				var cp = $(".league-select option:selected").val();
				var category = $(".ranking-categories a.selected").attr("data");
				if(! cup){
					cup = $(".cup-select option:selected").val();
				}

				self.displayRankings(category, cp, cup);
				self.pushHistoryState(cup, cp, category, null);

				if(format == "custom"){
					// Redirect to the custom rankings page
					window.location.href = webRoot+'custom-rankings/';
				}
			}

			// Event handler for selecting ranking category

			function selectCategory(e){

				e.preventDefault();

				$(".ranking-categories a").removeClass("selected");

				$(e.target).addClass("selected");

				var cp = $(".league-select option:selected").val();
				var category = $(".ranking-categories a.selected").attr("data");
				var cup = $(".cup-select option:selected").val();

				$(".description").hide();
				$(".description."+category).show();

				self.displayRankings(category, cp, cup);

				self.pushHistoryState(cup, cp, category, null);
			}

			// Event handler clicking on a Pokemon item, load detail data

			function selectPokemon(e){

				// Don't collapse when clicking links or the share button

				if(! $(e.target).is(".rank, .rank > .rating-container, .rank > .rating-container *, .rank > .name-container, .rank > .name-container *, .rank > .expand-label")||($(e.target).is("a"))){
					return;
				}

				var cup = $(".cup-select option:selected").val();
				var $rank = $(this).closest(".rank");


				$rank.toggleClass("selected");
				$rank.find(".details").toggleClass("active");

				var index = $(".rankings-container > .rank").index($rank);
				var $details = $(".details").eq(index);

				if($details.html() != ''){
					return;
				}

				var r = data[index];
				var pokemon = new Pokemon(r.speciesId, 0, battle);

				// If overall, display score for each category

				if(r.scores){
					var categories = ["Lead","Closer","Attacker","Defender","Consistency"];

					var $section = $("<div class=\"detail-section overall\"></div>");

					for(var i = 0; i < r.scores.length; i++){
						var $item = $("<div class=\"rating-container\"><div class=\"ranking-header\">"+categories[i]+"</div><div class=\"rating\">"+r.scores[i]+"</div></div>");

						$section.append($item);
					}

					$details.append($section);
				}

				// Display move data

				var fastMoves = pokemon.fastMovePool;
				var chargedMoves = pokemon.chargedMovePool;

				for(var j = 0; j < fastMoves.length; j++){
					fastMoves[j].uses = 0;

					for(var n = 0; n < r.moves.fastMoves.length; n++){
						var move = r.moves.fastMoves[n];

						if(move.moveId == fastMoves[j].moveId){
							fastMoves[j].uses = move.uses;
						}
					}
				}

				for(var j = 0; j < chargedMoves.length; j++){
					chargedMoves[j].uses = 0;

					for(var n = 0; n < r.moves.chargedMoves.length; n++){
						var move = r.moves.chargedMoves[n];

						if(move.moveId == chargedMoves[j].moveId){
							chargedMoves[j].uses = move.uses;
						}
					}
				}

				fastMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));
				chargedMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

				// Buckle up, this is gonna get messy. This is the main detail HTML.

				$details.append("<div class=\"detail-section float margin\"><div class=\"ranking-header\">Fast Moves</div><div class=\"ranking-header right\">Usage</div><div class=\"moveset fast clear\"></div></div><div class=\"detail-section float\"><div class=\"ranking-header\">Charged Moves</div><div class=\"ranking-header right\">Usage</div><div class=\"moveset charged clear\"></div></div><div class=\"detail-section float margin\">	<div class=\"ranking-header\">Key Matchups</div><div class=\"ranking-header right\">Battle Rating</div><div class=\"matchups clear\"></div></div><div class=\"detail-section float\"><div class=\"ranking-header\">Top Counters</div><div class=\"ranking-header right\">Battle Rating</div><div class=\"counters clear\"></div></div><div class=\"clear\"></div><div class=\"share-link detail-section\"><input type=\"text\" readonly><div class=\"copy\">Copy</div></div></div>");

				// Need to calculate percentages

				var totalFastUses = 0;

				for(var n = 0; n < fastMoves.length; n++){
					totalFastUses += fastMoves[n].uses;
				}

				// Display fast moves

				for(var n = 0; n < fastMoves.length; n++){
					var percentStr = (Math.floor((fastMoves[n].uses / totalFastUses) * 1000) / 10) + "%";
					var displayWidth = (Math.floor((fastMoves[n].uses / totalFastUses) * 1000) / 20);

					if(displayWidth < 10){
						displayWidth = "auto";
					} else{
						displayWidth = displayWidth + "%";
					}

					$details.find(".moveset.fast").append("<div class=\"rank " + fastMoves[n].type + "\"><div class=\"name-container\"><span class=\"number\">#"+(n+1)+"</span><span class=\"name\">"+fastMoves[n].name+(fastMoves[n].legacy === false ? "" : " *")+"</span></div><div class=\"rating-container\"><div class=\"rating\" style=\"width:"+displayWidth+"\">"+percentStr+"</span></div><div class=\"clear\"></div></div>");
				}

				// Display charged moves

				var totalChargedUses = 0;

				for(var n = 0; n < chargedMoves.length; n++){
					totalChargedUses += chargedMoves[n].uses;
				}

				for(var n = 0; n < chargedMoves.length; n++){
					percentStr = (Math.floor((chargedMoves[n].uses / totalChargedUses) * 1000) / 10) + "%";
					displayWidth = (Math.floor((chargedMoves[n].uses / totalChargedUses) * 1000) / 20);

					if(displayWidth < 10){
						displayWidth = "auto";
					} else{
						displayWidth = displayWidth + "%";
					}

					$details.find(".moveset.charged").append("<div class=\"rank " + chargedMoves[n].type + "\"><div class=\"name-container\"><span class=\"number\">#"+(n+1)+"</span><span class=\"name\">"+chargedMoves[n].name+(chargedMoves[n].legacy === false ? "" : " *")+"</span></div><div class=\"rating-container\"><div class=\"rating\" style=\"width:"+displayWidth+"\">"+percentStr+"</span></div><div class=\"clear\"></div></div>");
				}

				// Helper variables for displaying matchups and link URL

				var cp = $(".league-select option:selected").val();
				var category = $(".ranking-categories a.selected").attr("data");
				var shieldStrs = {
					"overall": "11",
					"closers": "00",
					"leads": "11",
					"attackers": "01",
					"defenders": "10",
					"custom": "11"
				}

				if(context == "custom"){
					category = context;
				}

				// Display key matchups

				for(var n = 0; n < r.matchups.length; n++){
					var m = r.matchups[n];
					var opponent = new Pokemon(m.opponent, 1, battle);
					var battleLink = host+"battle/"+cp+"/"+pokemon.speciesId+"/"+opponent.speciesId+"/"+shieldStrs[category]+"/"+r.moveStr+"/";

					// Append opponent's move string

					for(var j = 0; j < data.length; j++){

						if(data[j].speciesId == opponent.speciesId){
							battleLink += data[j].moveStr + '/';
							break;
						}
					}

					var $item = $("<div class=\"rank " + opponent.types[0] + "\"><div class=\"name-container\"><span class=\"number\">#"+(n+1)+"</span><span class=\"name\">"+opponent.speciesName+"</span></div><div class=\"rating-container\"><div class=\"rating star\">"+m.rating+"</span></div><a target=\"_blank\" href=\""+battleLink+"\"></a><div class=\"clear\"></div></div>");

					$details.find(".matchups").append($item);
				}

				// Display top counters

				for(var n = 0; n < r.counters.length; n++){
					var c = r.counters[n];
					var opponent = new Pokemon(c.opponent, 1, battle);
					var battleLink = host+"battle/"+cp+"/"+pokemon.speciesId+"/"+opponent.speciesId+"/"+shieldStrs[category]+"/"+r.moveStr+"/";

					// Append opponent's move string

					for(var j = 0; j < data.length; j++){

						if(data[j].speciesId == opponent.speciesId){
							battleLink += data[j].moveStr + '/';
							break;
						}
					}

					var $item = $("<div class=\"rank " + opponent.types[0] + "\"><div class=\"name-container\"><span class=\"number\">#"+(n+1)+"</span><span class=\"name\">"+opponent.speciesName+"</span></div><div class=\"rating-container\"><div class=\"rating star\">"+c.opRating+"</span></div><a target=\"_blank\" href=\""+battleLink+"\"></a><div class=\"clear\"></div></div>");

					$details.find(".counters").append($item);
				}

				// Show share link
				var cup = $(".cup-select option:selected").val();
				var cupName = $(".cup-select option:selected").html();

				var link = host + "rankings/"+cup+"/"+cp+"/"+category+"/"+pokemon.speciesId+"/";

				$details.find(".share-link input").val(link);

				// Add multi-battle link
				if($(".cup-select").length > 0){
					var multiBattleLink = host+"battle/multi/"+cp+"/"+cup+"/"+pokemon.speciesId+"/"+shieldStrs[category]+"/"+r.moveStr+"/2-1/";

					$details.find(".share-link").before($("<div class=\"multi-battle-link\"><p>See all of <b>" + pokemon.speciesName + "'s</b> matchups:</p><a target=\"_blank\" class=\"button\" href=\""+multiBattleLink+"\">"+pokemon.speciesName+" vs. " + cupName +"</a></div>"));
				} else{
					$details.find(".share-link").remove();
				}


				// Only execute if this was a direct action and not loaded from URL parameters, otherwise pushes infinite states when the user navigates back

				if((get)&&(get.p == pokemon.speciesId)){
					return;
				}

				self.pushHistoryState(cup, cp, category, pokemon.speciesId);
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
				$(this).trigger("stateChange");
			}

			// Toggle the limited Pokemon from the Rankings

			function toggleLimitedPokemon(e){
				for(var i = 0; i < limitedPokemon.length; i++){
					$(".rank[data='"+limitedPokemon[i]+"']").toggleClass("hide");
				}
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
