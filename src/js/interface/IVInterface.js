// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var gm = GameMaster.getInstance();
			var battle;
			var pokeSelector;
			var multiSelector;
			var self = this;

			this.init = function(){

				var data = gm.data;

				// Initialize selectors and push Pokemon data

				battle = new Battle();

				pokeSelector = new PokeSelect($(".poke-select-container .poke.single").eq(0), 0);
				pokeSelector.setBattle(battle);
				pokeSelector.init(data.pokemon, battle);

				multiSelector = new PokeMultiSelect($(".poke-select-container .poke.multi"));
				multiSelector.init(data.pokemon, battle);

				$(".league-select").on("change", selectLeague);
				$(".mode-select").on("change", selectMode);
				$(".button.analyze").on("click", generateResults);
				$("body").on("click", ".check", checkBox);

				// Load rankings for the current league

				var league = 1500;
				if(get.cp){
					league = get.cp;
				}

				gm.loadRankingData(self, "overall", league, "all");

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});

			};

			// Callback for laoding ranking data

			this.displayRankingData = function(){

			}

			// Given JSON of get parameters, load these settings

			this.loadGetData = function(){

				if(! get){
					return false;
				}

				settingGetParams = true;

				// Cycle through parameters and set them

				for(var key in get){

					if(get.hasOwnProperty(key)){

						var val = get[key];

						// Process each type of parameter

						switch(key){
							case "p":
								var arr = val.split('-');
								var index = 0;

								if(arr.length == 1){
									pokeSelector.setPokemon(val);
								} else{
									pokeSelector.setPokemon(arr[0]);

									var pokemon = pokeSelector.getPokemon();

									if(arr.length >= 8){
										pokemon.setIV("atk", arr[2]);
										pokemon.setIV("def", arr[3]);
										pokemon.setIV("hp", arr[4]);
										pokemon.setLevel(arr[1]);

										$("input.level").eq(index).val(pokemon.level);
										$("input.iv[iv='atk']").eq(index).val(pokemon.ivs.atk);
										$("input.iv[iv='def']").eq(index).val(pokemon.ivs.def);
										$("input.iv[iv='hp']").eq(index).val(pokemon.ivs.hp);

										$("input.stat-mod[iv='atk']").eq(index).val(parseInt(arr[5]) - 4);
										$("input.stat-mod[iv='def']").eq(index).val(parseInt(arr[6]) - 4);

										if(arr[7]){
											pokemon.baitShields = (parseInt(arr[7]) == 1);

											if(! pokemon.baitShields){
												$(".poke.single .shield-baiting").eq(index).removeClass("on");
											}
										}
									}

									// Check string for other parameters
									for(var i = 0; i < arr.length; i++){
										switch(arr[i]){
											case "shadow":
											case "purified":
												pokemon.setShadowType(arr[i]);
												$(".poke.single .form-group").eq(index).find(".check").removeClass("on");
												$(".poke.single .form-group").eq(index).find(".check[value=\""+arr[i]+"\"]").addClass("on");
												break;
										}
									}

									$("input.stat-mod[iv='atk']").eq(index).trigger("keyup");
								}

								pokeSelector.getPokemon().autoSelectMoves();

								break;

							case "cp":
								$(".league-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".league-select").trigger("change");
								break;

							case "m":
								var poke = pokeSelector.getPokemon();
								var arr = val.split('-');

								// Legacy move construction

								if(arr.length <= 1){
									arr = val.split('');
								}

								// Search string for any custom moves to add
								var customMoveIndexes = [];

								for(var i = 0; i < arr.length; i++){
									if(arr[i].match('([A-Z_]+)')){
										var move = gm.getMoveById(arr[i]);
										var movePool = (move.energyGain > 0) ? poke.fastMovePool : poke.chargedMovePool;
										var moveType = (move.energyGain > 0) ? "fast" : "charged";
										var moveIndex = 0;

										if(arr[i+1]){
											moveIndex = parseInt(arr[i+1]);
										}

										poke.addNewMove(arr[i], movePool, true, moveType, moveIndex);
										if(moveType == "charged"){
											customMoveIndexes.push(moveIndex);
										}
									}
								}


								var fastMoveId = $(".poke").eq(index).find(".move-select.fast option").eq(parseInt(arr[0])).val();
								poke.selectMove("fast", fastMoveId, 0);

								for(var i = 1; i < arr.length; i++){
									// Don't set this move if already set as a custom move

									if(customMoveIndexes.indexOf(i-1) > -1){
										continue;
									}

									var moveId = $(".poke").eq(index).find(".move-select.charged").eq(i-1).find("option").eq(parseInt(arr[i])).val();

									if(moveId != "none"){
										poke.selectMove("charged", moveId, i-1);
									} else{
										if((arr[1] == "0")&&(arr[2] == "0")){
											poke.selectMove("charged", moveId, 0); // Always deselect the first move because removing it pops the 2nd move up
										} else{
											poke.selectMove("charged", moveId, i-1);
										}
									}

								}

								break;

							case "mode":
								$(".mode-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".mode-select").trigger("change");
								break;

							case "g1":
								multiSelector.selectGroup(val);
								isLoadingPreset = true;
								break;

						}
					}

				}

				// Update both Pokemon selectors

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].update();
				}

				if((sandbox)&&(! get.hasOwnProperty("sandbox"))){
					$(".sandbox-btn").trigger("click");
				}

				settingGetParams = false;

				// Auto run the battle

				if(! isLoadingPreset){
					$(".battle-btn").trigger("click");
				} else{
					// Oh yeah, this is top level programming right here
					// Super bandaid fix to give preset lists time to load

					setTimeout(function(){
						$(".battle-btn").trigger("click");
					}, 500);
				}

				if(sandbox){
					self.runSandboxSim();
				}

			}

			// Produce and display the results

			function generateResults(e){
				var pokemon = pokeSelector.getPokemon();
				var targets = multiSelector.getPokemonList();
				var subjectStat = "atk";
				var targetStat = "def";
				var results = [];

				if((! pokemon)||(targets.length < 1)){
					return;
				}

				if(self.mode == "bulkpoints"){
					subjectStat = "def";
					targetStat = "atk";
				}

				// Min and max values for the table

				var minOverallDamage = 100;
				var maxOverallDamage = 0;

				// For each target, determine the maximum and minimum damage

				for(var i = 0; i < targets.length; i++){
					var target = targets[i];
					var move = pokemon.fastMove;
					var effectiveness = target.typeEffectiveness[move.type];
					var minStat = target.generateIVCombinations(targetStat, -1, 1)[0].def;
					var maxStat = target.generateIVCombinations(targetStat, 1, 1)[0].def;
					var minDamage = battle.calculateDamageByStats(target, pokemon, pokemon.stats.atk * pokemon.shadowAtkMult, maxStat * target.shadowDefMult, effectiveness, move);
					var maxDamage = battle.calculateDamageByStats(target, pokemon, pokemon.stats.atk * pokemon.shadowAtkMult, minStat * target.shadowDefMult, effectiveness, move);

					if(minDamage < minOverallDamage){
						minOverallDamage = Math.floor(minDamage);
					}

					if(maxDamage > maxOverallDamage){
						maxOverallDamage = Math.floor(maxDamage);
					}

					results.push({
						pokemon: target,
						min: minDamage,
						max: maxDamage
					})
				}

				// Create the graph
				$(".iv-title").html(pokemon.fastMove.name + " Damage");

				$(".iv-table .iv-header").html("");

				for(var i = minOverallDamage; i < maxOverallDamage; i++){
					$(".iv-table .iv-header").append("<div>"+i+"</div>");
				}

				var scale = $(".iv-header div").width();

				$(".iv-table .iv-body").html("");

				for(var i = 0; i < results.length; i++){
					var target = results[i].pokemon;

					var $row = $("<div class=\"iv-row\"></div>");

					$row.append("<div class=\"iv-name\">"+target.speciesName+"</div>")

					var $data = $("<div class=\"iv-data\"></div>");

					for(var n = results[i].min; n <= results[i].max; n++){
						$data.append("<div class=\"iv-item\">"+n+"</div>")
					}

					$row.append($data);

					$(".iv-table").append($row);
				}
			}

			// Event handler for changing the league select

			function selectLeague(e){
				var allowed = [1500, 2500, 10000];
				var cp = parseInt($(".league-select option:selected").val());

				if(allowed.indexOf(cp) > -1){
					battle.setCP(cp);

					for(var i = 0; i < pokeSelectors.length; i++){
						pokeSelectors[i].setBattle(battle);
						pokeSelectors[i].setCP(cp);
					}

					for(var i = 0; i < multiSelectors.length; i++){
						multiSelectors[i].setCP(cp);
					}
				}

				gm.loadRankingData(self, "overall", parseInt($(".league-select option:selected").val()), "all");
			}

			// Event handler for changing the battle mode

			function selectMode(e){
				self.battleMode = $(e.target).find("option:selected").val();

				$("p.description").hide();
				$("p."+self.battleMode).show();
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
				$(this).trigger("change");
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
