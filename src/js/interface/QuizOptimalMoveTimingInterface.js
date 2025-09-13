// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {

        var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var gm = GameMaster.getInstance();
			var battle = new Battle();
			this.yourPokemon = null;
			this.opponentsPokemon = null;
			var chargedMove;
			var fastMove;
			var useOnlyReccomendedMoveset = true;
			var numberTopPokemons;
			this.context = 'quiz';

			this.questionAnswers = {}

			// Show useRecc toggle if previously set
			if(window.localStorage.getItem("quiz_omt_useOnlyReccomendedMoveset") == "false"){
				useOnlyReccomendedMoveset = false;
				updateReccomendedMovesetCheckbox()
			}

			this.init = function(){
				this.category = 'overall'
				this.cp = '1500'
				this.cup = 'all'
				
				if(! get){
					this.displayRankings(this.category,this.cp,this.cup);
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
				window.localStorage.setItem("quiz_omt_useOnlyReccomendedMoveset", useOnlyReccomendedMoveset)
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

				var format = gm.getFormat(cup, league);

				if(format && format.rules){
					$("a.format-rules").show();
				} else{
					$("a.format-rules").hide();
				}

				// Force 1500 if not general

				if((cup == "premier")&&(league == 1500)){
					league = 10000;

					$(".league-select option[value=\"10000\"]").prop("selected","selected");
				}

				if((cup == "classic")&&(league != 10000)){
					league = 10000;

					$(".league-select option[value=\"10000\"]").prop("selected","selected");
				}

				if(cup == "little"){
					league = 500;

					$(".league-select option[value=\"500\"]").prop("selected","selected");
				}

				if(cup == "littlejungle"){
					$(".little-jungle").show();
				} else{
					$(".little-jungle").hide();
				}

				battle.setCup(cup);
				battle.setCP(league);

				if(! battle.getCup().levelCap){
					battle.setLevelCap(50);
				}

				if(battle.getCup().link){
					$(".description.link").show();
					$(".description.link a").attr("href", battle.getCup().link);
					$(".description.link a").html(battle.getCup().link);
				} else{
					$(".description.link").hide();
				}

				// Check ranking details settings to show ranking details in one page or tabs

				if(settings.rankingDetails == "tabs"){
					$(".quiz-container").addClass("detail-tabs-on");
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

				$(".section.white .opponents .quiz-container").html('');
				$(".section.white .yours .quiz-container").html('');
				$(".loading").hide();

				self.displayQuestion()

				// Poi chiama la funzione finale
				self.completeRankingDisplay();
			}

			this.displayQuestion = function(){
				let questionKey;
				//Avoid infinite loops
				let questionsPicked = 0;
				//Pick a new question that hasn't been correctly answered yet
				do {
					self.pickQuestion()
					questionsPicked++;
					questionKey = getQuestionKey(this.yourPokemon, this.opponentsPokemon);
				} while (questionKey in this.questionAnswers &&
						 this.questionAnswers[questionKey] === true &&
						 questionsPicked < 10000)

				try {
					self.displayRankingEntry(this.yourPokemon, true);
				} catch (err) {
					console.error(this.yourPokemon.speciesId + " could not be displayed", err);
				}
				try {
					self.displayRankingEntry(this.opponentsPokemon, false);
				} catch (err) {
					console.error(this.opponentsPokemon.speciesId + " could not be displayed", err);
				}
				fastMoveTiming(this.yourPokemon, this.opponentsPokemon)

				updateLink()
			}

			function updateLink(){
				const pokemon = self.yourPokemon
				const opponent = self.opponentsPokemon

				var pokeMoveStr = pokemon.generateURLMoveStr();

				var battleLink = host+"battle/"+self.cp+"/"+pokemon.aliasId+"/"+opponent.aliasId+"/11/"+pokeMoveStr+"/"+opponent.generateURLMoveStr()+"/";

				// Append energy settings
				battleLink += pokemon.stats.hp + "-" + opponent.stats.hp + "/";

				battleLink += "0";
				battleLink += "-";
				battleLink += "0";

				battleLink += "/";
				
				
				const newPath = battleLink; 
				const newText = `See ${pokemon.speciesName} vs ${opponent.speciesName} matchup →`;
				const root = $(".quiz-link-title").data("webroot");

				$(".quiz-link-title")
					.attr("href", root + newPath)
					.text(newText);
			}

			this.pickQuestion = function(){
				if(numberTopPokemons == 'ALL'){
					realNumberTopPokemons = rankings.length
				} else {
					realNumberTopPokemons = numberTopPokemons;
				}

				// Random index for "yours"
				this.quizRankingIndexYours = Math.floor(Math.random() * realNumberTopPokemons);

				// Random index for "opponents", different from "yours"
				do {
				this.quizRankingIndexOpponents = Math.floor(Math.random() * realNumberTopPokemons);
				} while (this.quizRankingIndexOpponents === this.quizRankingIndexYours);
				
				// Create your pokemon
				this.yourPokemon = new Pokemon(self.rankings[this.quizRankingIndexYours].speciesId, 0, battle);
				this.yourPokemon.initialize(true);

				// Pick the fast moves
				if(useOnlyReccomendedMoveset){
					this.yourPokemon.selectMove("fast", self.rankings[this.quizRankingIndexYours].moveset[0])
				} else {
					// Pick among all available moves
					fastMoveIndex = Math.floor(Math.random() * this.yourPokemon.fastMovePool.length)
					this.yourPokemon.selectMove("fast", this.yourPokemon.fastMovePool[fastMoveIndex].moveId)
				}
				
				// Create opponent's pokemon
				this.opponentsPokemon = new Pokemon(self.rankings[this.quizRankingIndexOpponents].speciesId, 0, battle);
				this.opponentsPokemon.initialize(true);
				
				// Pick the fast moves
				if(useOnlyReccomendedMoveset){
					this.opponentsPokemon.selectMove("fast", self.rankings[this.quizRankingIndexOpponents].moveset[0])
				} else {
					// Pick among all available moves
					fastMoveIndex = Math.floor(Math.random() * this.opponentsPokemon.fastMovePool.length)
					this.opponentsPokemon.selectMove("fast", this.opponentsPokemon.fastMovePool[fastMoveIndex].moveId)
				}
			}

			this.displayRankingEntry = function(pokemon, isYours){
				if(! pokemon.speciesId){
					return;
				}
				
				// Show the pokemon details
				var $el = $("<div class=\"rank typed-ranking quiz " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\" data=\""+pokemon.speciesId+"\">" +
					"<div class=\"pokemon-info\">" +
						"<div class=\"name-container\">" +
							"<span class=\"name\">"+pokemon.speciesName+"</span>" +
							"<div class=\"quiz-moves-container\">" +
								"<div class=\"quiz-move\"><b>Fast Move:</b> "+ pokemon.fastMove.name + "</div>" +
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

				if(isYours){
					$(".section.white .yours .quiz-container").append($el);
				} else {
					$(".section.white .opponents .quiz-container").append($el);
				}

				addHintMoveDetails(pokemon, isYours)
			}

			function fastMoveTiming(yourPokemon, opponentsPokemon) {
				$(".battle-results").hide();
				$(".optimal-timing-section .timeline").html("");

				var pokemon = [yourPokemon, opponentsPokemon]
				$(".quiz-feedback-container .name-attacker").html(pokemon[0].speciesName);
				$(".quiz-feedback-container .name-defender").html(pokemon[1].speciesName);

				var targetCooldown = 500;
				var startCooldown = pokemon[0].startCooldown - 500;

				// Optimal timing is N/A when the opponent has a shorter move that is divisible into your move, or both Pokemon have the same move
				if(pokemon[0].fastMove.cooldown % pokemon[1].fastMove.cooldown == 0){
					if(pokemon[0].startCooldown == pokemon[1].startCooldown){
						targetCooldown = 0;
					} else if(pokemon[0].startCooldown > pokemon[1].startCooldown){
						targetCooldown = 0;
					} else{
						targetCooldown = 500;
					}
				}

				// Pokemon with 2 turn moves can only throw on turn 2 of a 4 turn move
				if(pokemon[0].fastMove.cooldown == 1000 && pokemon[1].fastMove.cooldown == 2000){
					if(pokemon[0].startCooldown == pokemon[1].startCooldown){
						targetCooldown = 1000;
					} else {
						var cooldownDifference = (pokemon[0].startCooldown - pokemon[1].startCooldown) - 500;
						targetCooldown = 1000 - cooldownDifference;
					}
				}

				var displayCycles = 0;

				var optimalTimes = []; // Array that stores integer counts of Fast Moves that provide optimal timing
				var opponentFastCount = 0;
				var opponentOffset = 0;

				if(pokemon[0].startCooldown == pokemon[1].startCooldown){
					opponentOffset = 0;
				} else if(pokemon[0].startCooldown == 1000){
					opponentOffset = -500;
				} else if(pokemon[1].startCooldown == 1000){
					opponentOffset = 500;
				}

				for(var i = 1; displayCycles < 3; i++){
					var targetTurn = opponentOffset + (pokemon[1].fastMove.cooldown * i) - targetCooldown; // Target the last turn of the move

					if(targetCooldown > 0 && targetTurn > 0 && targetTurn % pokemon[0].fastMove.cooldown == 0){ // If this turn is divisible by your Fast Move duration
						optimalTimes.push(targetTurn / pokemon[0].fastMove.cooldown); // Number of moves you need to use to reach this optimal turn
						displayCycles++;
					} else if(targetCooldown == 0){
						displayCycles++;
					}

					opponentFastCount = i;
				}

				if(targetCooldown == 0){
					opponentFastCount = (displayCycles * pokemon[0].fastMove.cooldown) / pokemon[1].fastMove.cooldown;
				}


				// Display fast moves on timeline
				if(optimalTimes.length > 0){
					displayCycles = optimalTimes[2];
				}
				this.optimalTimes = optimalTimes;

				// Add an empty chunk at the beginning for 1 turn switch
				if(pokemon[0].startCooldown == 1000){
					$fastItem = $('<div class="item fast fade"><div class="chunk"></div></div>');
					$fastItem.css("flex", 1);
					$(".optimal-timing-section .timeline").eq(0).append($fastItem);
				}

				if(pokemon[1].startCooldown == 1000){
					$fastItem = $('<div class="item fast fade"><div class="chunk"></div></div>');
					$fastItem.css("flex", 1);
					$(".optimal-timing-section .timeline").eq(1).append($fastItem);
				}

				for(i = 0; i < displayCycles; i++){
					var $fastItem = $('<div class="item fast '+pokemon[0].fastMove.type+'"></div>');
					$fastItem.css("flex", pokemon[0].fastMove.turns + "");

					for(var n = 0; n < pokemon[0].fastMove.turns; n++){
						$fastItem.append('<div class="chunk"></div>')
					}

					if(optimalTimes.indexOf(i) == -1){
						$fastItem.addClass("fade");
					} else{
						$fastItem.addClass("throw");
					}

					$(".optimal-timing-section .timeline").eq(0).append($fastItem);
				}

				// Add an empty chunk at the end for a Charged Move space
				$(".quiz-feedback-container p").hide();

				if(targetCooldown > 0){
					$fastItem = $('<div class="item fast throw '+pokemon[0].fastMove.type+'"></div>');
					$fastItem.css("flex", targetCooldown / 500 + "");
					for(var i = 0; i < targetCooldown / 500; i++){
						$fastItem.append("<div class=\"chunk\"></div>");
					}
					$(".optimal-timing-section .timeline").eq(0).append($fastItem);

					$(".quiz-feedback-container .optimal-1").html(optimalTimes[0]);
					$(".quiz-feedback-container .optimal-2").html(optimalTimes[1]);
					$(".quiz-feedback-container .optimal-3").html(optimalTimes[2]);

					$(".quiz-feedback-container p.timing-most-optimal").show();
				} else if(pokemon[0].startCooldown == 1000 && pokemon[1].startCooldown == 0 && pokemon[0].fastMove.cooldown == pokemon[1].fastMove.cooldown
				&& pokemon[0].fastMove.cooldown != 500){
					$(".quiz-feedback-container p.timing-offset").show();
				} else{
					$(".quiz-feedback-container p.timing-none").show();
				}

				for(i = 0; i < opponentFastCount; i++){
					$fastItem = $('<div class="item fast '+pokemon[1].fastMove.type+'"></div>');
					$fastItem.css("flex", pokemon[1].fastMove.turns + "");
					for(var n = 0; n < pokemon[1].fastMove.turns; n++){
						$fastItem.append('<div class="chunk"></div>')
					}

					$(".optimal-timing-section .timeline").eq(1).append($fastItem);
				}

				// Add an empty chunk at the end  for 1 turn switch
				if($(".optimal-timing-section .timeline").eq(0).find(".chunk").length < $(".optimal-timing-section .timeline").eq(1).find(".chunk").length){
					$fastItem = $('<div class="item fast fade"><div class="chunk"></div></div>');
					$fastItem.css("flex", 1);
					$(".optimal-timing-section .timeline").eq(0).append($fastItem);
				} else if($(".optimal-timing-section .timeline").eq(1).find(".chunk").length < $(".optimal-timing-section .timeline").eq(0).find(".chunk").length){
					$fastItem = $('<div class="item fast fade"><div class="chunk"></div></div>');
					$fastItem.css("flex", 1);
					$(".optimal-timing-section .timeline").eq(1).append($fastItem);
				}

				//Show the section
				$(".battle-results").show();
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
				self.displayRankings(category, cp, cup, null);
			}

			function addHintMoveDetails(pokemon, isYours){
				// Display move data
				fastMove = pokemon.fastMove

				if(isYours){
					var $details = $(".yours .quiz-omt-hints-container");
				} else {
					var $details = $(".opponents .quiz-omt-hints-container");
				}
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
			}

			// Event handler for changing the cup select

			function selectFormat(e){
				self.cp = $(".format-select option:selected").val();
				self.cup = $(".format-select option:selected").attr("cup");
				
				self.category = "overall";

				resetQuiz()
				self.displayRankings(self.category, self.cp, self.cup);
			}

			function resetQuiz(){
				hideAnswer()
				self.questionAnswers = {}
				updateScore()
			}

			function hideAnswer(){
				$(".quiz-feedback-header").addClass("hidden")
				$(".quiz-feedback").addClass("hidden")
				$(".quiz-feedback-explanation").addClass("hidden")
				$(".quiz-feedback-explanation").addClass("hidden")
				$(".quiz-link-title-container").addClass("hidden")
				$(".optimal-timing-section").addClass("hidden")
				$("details").removeAttr("open");
			}

			function nextQuestion(){
				hideAnswer()
				self.displayRankingData(self.rankings)
			}

			function checkAnswer() {
				var quizAnswerInputValue = $(".quiz-answer-input option:selected").val();
				if(quizAnswerInputValue == ''){
					return
				}
				result = false
				trials++
				if((optimalTimes.length == 0 && quizAnswerInputValue == 'No optimal timing possible') || 
					optimalTimes.join(",") == quizAnswerInputValue){
					result = true
				}
				
				// Show feedback
				$(".quiz-feedback-header").removeClass("hidden");
				$(".quiz-link-title-container").removeClass("hidden")
				$(".optimal-timing-section").removeClass("hidden")
				if(!result){
					$(".quiz-feedback")
						.removeClass("hidden feedback-correct")
						.addClass("feedback-wrong")
						.text("❌ " + quizAnswerInputValue + " is not the correct answer");
				} else {
					$(".quiz-feedback")
						.removeClass("hidden feedback-wrong")
						.addClass("feedback-correct")
						.text("✅ " + quizAnswerInputValue + " is the correct answer!");
				}
				//Show answer in any case
				$(".quiz-feedback-explanation").removeClass("hidden");

				updateAnswersHistory(self.yourPokemon, self.opponentsPokemon, result)
				updateScore()
			}

			function updateAnswersHistory(yourPokemon, opponentsPokemon, result){
				// Only at correct answers at first trial are considered corrected
				if(trials > 1){
					result = false
				}
				questionKey = getQuestionKey(yourPokemon, opponentsPokemon)
				self.questionAnswers[questionKey] = result
			}

			function getQuestionKey(yourPokemon, opponentsPokemon){
				const questionKey = yourPokemon.speciesId + '|' + yourPokemon.fastMove.moveId + '|' + opponentsPokemon.speciesId + '|' + opponentsPokemon.fastMove.moveId 
				return questionKey
			}

			function updateScore(){
				// Select the quiz-score container
				var $score = $(".quiz-score");

				const answers = self.questionAnswers

				// Update the current score
				$score.children().eq(1).text(Object.values(answers).filter(value => value === true).length);
				$score.children().eq(3).text(Object.keys(answers).length);
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
