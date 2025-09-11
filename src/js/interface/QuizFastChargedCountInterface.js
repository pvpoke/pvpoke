// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {

        var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var gm = GameMaster.getInstance();
			var battle = new Battle();
			var numberAskedQuestions = 0;
			var numberCorrectAnswers = 0;
			var chargedMove;
			var fastMove;
			var useOnlyReccomendedMoveset = true;
			var numberTopPokemons;
			this.context = 'quiz';

			this.questionAnswers = {}

			// Show useRecc toggle if previously set
			if(window.localStorage.getItem("quiz_fcc_useOnlyReccomendedMoveset") == "false"){
				useOnlyReccomendedMoveset = false;
				updateReccomendedMovesetCheckbox()
			}

			this.init = function(){
				if(! get){
					this.displayRankings("overall","1500","all");
				} else{
					this.loadGetData();
				}

				$(".format-select").on("change", selectFormat);
				$(".top-ranking-select").on("change", selectTopRankings);
				$("body").on("click", ".quiz-check-btn", checkAnswer);
				$("body").on("click", ".quiz-next-btn", nextQuestion);
				$("body").on("click", ".check.quiz-reccomended-moveset", toggleUseOnlyReccomendedMoveset);

				pokeSearch.setBattle(battle);

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});
			};

			// Initialize with starting value when page loads
			$(document).ready(function() {
				selectTopRankings();
			});

			function selectTopRankings(e){
				var selectNumberTopPokemons = $(".top-ranking-select option:selected").val();
				numberTopPokemons = selectNumberTopPokemons
			}
			// Toggle use only reccomended moveset

			function toggleUseOnlyReccomendedMoveset(){
				useOnlyReccomendedMoveset = !useOnlyReccomendedMoveset
				window.localStorage.setItem("quiz_fcc_useOnlyReccomendedMoveset", useOnlyReccomendedMoveset)
				updateReccomendedMovesetCheckbox()
			}

			function updateReccomendedMovesetCheckbox(){
				if(!useOnlyReccomendedMoveset){
					$(".check.quiz-reccomended-moveset").removeClass("on");
				}else{
					$(".check.quiz-reccomended-moveset").addClass("on");
				}
			}

			// Grabs ranking data from the Game Master

			this.displayRankings = function(category, league, cup){

				var gm = GameMaster.getInstance();

				$(".quiz-container").html('');
				$(".loading").show();

				battle.setCup(cup);

				if(! battle.getCup().levelCap){
					battle.setLevelCap(50);
				}

				/* This timeout allows the interface to display the loading message before
				being thrown into the data loading loop */

				setTimeout(function(){
					gm.loadRankingData(self, category, league, cup);
				}, 50);

			}

			// Displays the grabbed data. Showoff.

			this.displayRankingData = function(rankings){

				var gm = GameMaster.getInstance();

				trials = 0;
				$(".quiz-feedback").text("")
				data = rankings;
				this.rankings = rankings;

				$(".section.white > .quiz-container").html('');

				$(".loading").hide();

				var i = 0;
				var rankingDisplayIncrement = 15;

				if(settings.performanceMode){
					rankingDisplayIncrement = 5;
				}

				if(numberTopPokemons == 'ALL'){
					this.quiz_ranking_index = Math.floor(Math.random() * rankings.length);
				} else {
					this.quiz_ranking_index = Math.floor(Math.random() * numberTopPokemons);
				}
				// Mostra solo il primo elemento della lista rankings
				try {
					self.displayRankingEntry(rankings[this.quiz_ranking_index], this.quiz_ranking_index);
				} catch (err) {
					console.error(rankings[this.quiz_ranking_index].speciesId + " could not be displayed", err);
				}


				// Poi chiama la funzione finale
				self.completeRankingDisplay();
				numberAskedQuestions++
			}

			this.displayRankingEntry = function(r, index){
				var pokemon = new Pokemon(r.speciesId, 0, battle);
				this.pokemon = pokemon;

				pokemon.initialize(true);
				pokemon.selectMove("fast", r.moveset[0]);
				pokemon.selectMove("charged", r.moveset[1], 0);

				if(r.moveset.length > 2){
					pokemon.selectMove("charged", r.moveset[2],1);
				} else{
					pokemon.selectMove("charged", "none", 1);
				}

				if(! pokemon.speciesId){
					return;
				}

				// Store the selected moves
				if(useOnlyReccomendedMoveset){
					// Use only recc moves
					this.fastMove = pokemon.fastMove
					chargedMoveIndex = Math.floor(Math.random() * 2)
				} else {
					// Pick among all available moves
					fastMoveIndex = Math.floor(Math.random() * pokemon.fastMovePool.length)
					chargedMoveIndex = Math.floor(Math.random() * pokemon.chargedMoves.length)
					this.fastMove = pokemon.fastMovePool[fastMoveIndex]
				}
				this.chargedMove = pokemon.chargedMoves[chargedMoveIndex]

				// Show the pokemon details
				var $el = $("<div class=\"rank typed-ranking quiz " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\" data=\""+pokemon.speciesId+"\">" +
					"<div class=\"pokemon-info\">" +
						"<div class=\"name-container\">" +
							"<span class=\"name\">"+pokemon.speciesName+"</span>" +
							"<div class=\"quiz-moves-container\">" +
								"<div class=\"quiz-move\"><b>Fast Move:</b> "+ this.fastMove.name + "</div>" +
								"<div class=\"quiz-move\"><b>Charged Move:</b> " + this.chargedMove.name + "</div>" +
							"</div>" +
						"</div>" +
						"<div class=\"type-container\"></div>" +
					"</div>" +
				"</div>");

				for(var i = 0; i < pokemon.types.length; i++){
					var typeStr = pokemon.types[i].charAt(0).toUpperCase() + pokemon.types[i].slice(1);
					if(pokemon.types[i] != "none"){
						$el.find(".type-container").append("<div class=\"type-info "+pokemon.types[i]+"\">"+typeStr+"</div>");
					}
				}

				if(pokemon.needsXLCandy()){
					$el.attr("needs-xls", "true");
					$el.find(".name").append("<span class=\"xl-info-icon\"></span>");
				}

				$(".section.white > .quiz-container").append($el);

				addHintMoveDetails()
			}

			this.completeRankingDisplay = function(){
				//when the data is loaded, show the question
				$(".quiz-question").show();
				$(".quiz-check-btn ").show();
				$(".quiz-next-btn ").show();
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
								battle.setCP(val);
								break;

							case "cat":
								// Select by sort first if it exists
								if($(".category-select option[sort=\""+val+"\"]").length > 0){
									$(".category-select option[sort=\""+val+"\"]").first().prop("selected", "selected");
								} else{
									$(".category-select option[value=\""+val+"\"]").first().prop("selected", "selected");
								}

								// Show relevant description

								var category = $(".category-select option:selected").val();
								var sort = $(".category-select option:selected").attr("sort");

								$(".description").hide();
								if(sort == "score"){
									$(".description."+category).show();
								} else{
									$(".description."+sort).show();
								}
								break;

							case "cup":
								battle.setCup(val);
								break;

							case "p":
								// We have to wait for the data to load before we can jump to a Pokemon, so store this for later
								jumpToPoke = val;
								break;

						}
					}
				}

				// Load data via existing change function

				var cp = battle.getCP();
				var category = $(".category-select option:selected").val();
				var cup = battle.getCup().name;

				$(".format-select option[value=\""+cp+"\"][cup=\""+cup+"\"]").prop("selected","selected");

				self.displayRankings(category, cp, cup, null);
			}

			function addHintMoveDetails(){
				// Display move data
				var pokemon = self.pokemon
				fastMove = self.fastMove
				chargedMove = self.chargedMove

				var $details = $(".quiz-hints-container");
				// Clear previous content
				$details.empty();
				// Append details template
				$details.append($(".details-template.hide").html());

				var $moveDetails = $details.find(".moveset.fast .move-detail-template.hide").clone();
				$moveDetails.removeClass("hide");

				// Contextualize the move archetype for this Pokemon
				var archetype = fastMove.archetype;
				var archetypeClass = 'general'; // For CSS

				if(fastMove.archetype == "Fast Charge"){
					archetypeClass = "spam";
				} else if(fastMove.archetype == "Heavy Damage"){
					archetypeClass = "nuke";
				} else if(fastMove.archetype == "Multipurpose"){
					archetypeClass = "high-energy";
				} else if(fastMove.archetype == "Low Quality"){
					archetypeClass = "low-quality";
				}

				$moveDetails.addClass(fastMove.type);
				$moveDetails.find(".name").html(fastMove.displayName);
				$moveDetails.find(".archetype .name").html(archetype);
				$moveDetails.find(".archetype .icon").addClass(archetypeClass);
				$moveDetails.find(".dpt .value").html(Math.round( ((fastMove.power * fastMove.stab * pokemon.shadowAtkMult) / (fastMove.cooldown / 500)) * 100) / 100);
				$moveDetails.find(".ept .value").html(Math.round( (fastMove.energyGain / (fastMove.cooldown / 500)) * 100) / 100);
				$moveDetails.find(".turns .value").html( fastMove.cooldown / 500 );
				$moveDetails.attr("data", fastMove.moveId);

				// Highlight this move if it's in the recommended moveset

				if(fastMove == pokemon.fastMove){
					$moveDetails.addClass("selected");
				}

				$details.find(".moveset.fast").append($moveDetails);

				// Display charged moves
				var $moveDetails = $details.find(".moveset.charged .move-detail-template.hide").clone();
				$moveDetails.removeClass("hide");

				// Contextualize the move archetype for this Pokemon
				var archetype = chargedMove.archetype;
				var archetypeClass = 'general'; // For CSS

				if(chargedMove.stab == 1){
					var descriptor = "Coverage";

					if(chargedMove.type == "normal"){
						descriptor = "Neutral"
					}

					switch(archetype){
						case "General":
							archetype = descriptor;
							break;

						case "High Energy":
							if(descriptor == "Coverage"){
								archetype = "High Energy Coverage";
							}
							break;

						case "Spam/Bait":
							archetype = descriptor + " Spam/Bait";
							break;

						case "Nuke":
							archetype = descriptor + " Nuke";
							break;

					}
				}

				if(chargedMove.archetype.indexOf("Boost") > -1){
					archetypeClass = "boost";
				} else if(chargedMove.archetype.indexOf("Self-Debuff") > -1){
					archetypeClass = "self-debuff";
				} else if(chargedMove.archetype.indexOf("Spam") > -1){
					archetypeClass = "spam";
				} else if(chargedMove.archetype.indexOf("High Energy") > -1){
					archetypeClass = "high-energy";
				} else if(chargedMove.archetype.indexOf("Nuke") > -1){
					archetypeClass = "nuke";
				} else if(chargedMove.archetype.indexOf("Debuff") > -1){
					archetypeClass = "debuff";
				}

				if(chargedMove.archetype == "Debuff Spam/Bait"){
					archetypeClass = "debuff";
				}

				$moveDetails.addClass(chargedMove.type);
				$moveDetails.find(".name").html(chargedMove.displayName);
				$moveDetails.find(".archetype .name").html(archetype);
				$moveDetails.find(".archetype .icon").addClass(archetypeClass);
				$moveDetails.find(".damage .value").html(Math.round((chargedMove.power * chargedMove.stab * pokemon.shadowAtkMult) * 100) / 100);
				$moveDetails.find(".energy .value").html(chargedMove.energy);
				$moveDetails.find(".dpe .value").html( Math.round( ((chargedMove.power * chargedMove.stab * pokemon.shadowAtkMult) / chargedMove.energy) * 100) / 100);
				$moveDetails.attr("data", chargedMove.moveId);

				if(chargedMove.buffs && chargedMove.buffApplyChance){
					$moveDetails.find(".move-effect").html(gm.getStatusEffectString(chargedMove));
				}

				//FIXME Add move counts, lo lasciamo?
				//var moveCounts = Pokemon.calculateMoveCounts(pokemon.fastMove, chargedMove);
				//$moveDetails.find(".move-count span").html(moveCounts[0] + " - " + moveCounts[1] + " - " + moveCounts[2] + " - " + moveCounts[3]);

				$details.find(".moveset.charged").append($moveDetails);
			}

			// Event handler for changing the cup select

			function selectFormat(e){
				var cp = $(".format-select option:selected").val();
				var cup = $(".format-select option:selected").attr("cup");
				var category = $(".category-select option:selected").val();
				var sort = $(".category-select option:selected").attr("sort");

				if(! category){
					category = "overall";
				}

				if(cup == "custom"){
					window.location.href = webRoot+'custom-rankings/';
					return;
				}

				self.displayRankings(category, cp, cup);
			}

			function nextQuestion(){
				$(".quiz-feedback-header").addClass("hidden")
				$(".quiz-feedback").addClass("hidden")
				$(".quiz-feedback-explanation").addClass("hidden")
				$(".quiz-feedback-explanation").addClass("hidden")
				$("details").removeAttr("open");
				self.displayRankingData(self.rankings)
			}

			function checkAnswer() {
				var quizAnswerInputValue = $(".quiz-answer-input option:selected").val();
				var numberOfMoves = Pokemon.calculateMoveCounts(self.fastMove, self.chargedMove);
				trials++
				result = quizAnswerInputValue == numberOfMoves[0]
				if(result && trials == 1){
					numberCorrectAnswers++
				}
				
				// Show feedback
				$(".quiz-feedback-header").removeClass("hidden");
				if(!result){
					$(".quiz-feedback")
						.removeClass("hidden feedback-correct")
						.addClass("feedback-wrong")
						.text("❌ " + quizAnswerInputValue + " is not the correct answer, try again!");
				} else {
					$(".quiz-feedback")
						.removeClass("hidden feedback-wrong")
						.addClass("feedback-correct")
						.text("✅ " + quizAnswerInputValue + " is the correct answer!");
					$(".quiz-feedback-explanation").removeClass("hidden").text(
							"The charging pattern is: " + numberOfMoves
					);
				}

				updateScore()
				updateAnswersHistory(self.pokemon, fastMove, chargedMove, result)
			}

			function updateAnswersHistory(pokemon, fastMove, chargedMove, result){
				// Only at correct answers at first trial are considered corrected
				if(trials > 1){
					result = false
				}
				questionKey = pokemon.speciesId + '|' + fastMove.moveId + '|' + chargedMove.moveId
				self.questionAnswers[questionKey] = result
			}

			function updateScore(){
				// Select the quiz-score container
				var $score = $(".quiz-score");

				// Update the current score
				$score.children().eq(1).text(numberCorrectAnswers);
				$score.children().eq(3).text(numberAskedQuestions);
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
