// JavaScript Document

var InterfaceMaster = (function () {
	var instance;

	function createInstance() {

		var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var gm = GameMaster.getInstance();
			var battle = new Battle();
			var pokeSelectors = [];
			var multiSelectors = [];
			var results = [];
			var sortDirection = -1; // -1 = most damage first
			var showIVs = false;

			this.context = "damagevisualizer";

			this.init = function(){

				var cp = 1500;

				battle.setCP(cp);
				battle.setCup("all");

				// Initialize attacker PokeSelect
				$(".damage-viz > .poke.single").each(function(index, value){
					var selector = new PokeSelect($(this), index);
					selector.setBattle(battle);
					selector.init(gm.data.pokemon, battle);
					pokeSelectors.push(selector);
				});

				// Initialize opponent PokeMultiSelect
				$(".damage-viz > .poke.multi").each(function(index, value){
					var selector = new PokeMultiSelect($(this));
					selector.init(gm.data.pokemon, battle);
					multiSelectors.push(selector);
				});

				pokeSearch.setBattle(battle);

				$(".league-select").on("change", selectLeague);
				$(".battle-btn").on("click", generateResults);
				$(".damage-viz-sort").on("click", toggleSort);
				$("body").on("click", ".check", function(){ $(this).toggleClass("on"); });
			};

			// Required by GameMaster ranking data callback
			this.displayRankingData = function(){};

			function selectLeague(){
				var cp = parseInt($(".league-select option:selected").val());
				var levelCap = parseInt($(".league-select option:selected").attr("level-cap"));

				battle.setCP(cp);
				battle.setLevelCap(levelCap);

				multiSelectors[0].setCP(cp);

				// Re-initialize attacker if selected
				var poke = pokeSelectors[0].getPokemon();
				if(poke){
					poke.initialize(cp);
				}
			}

			function generateResults(){
				var attacker = pokeSelectors[0].getPokemon();
				if(!attacker){
					return;
				}

				var opponents = multiSelectors[0].getPokemonList();
				if(opponents.length === 0){
					return;
				}

				var cp = battle.getCP();
				showIVs = $(".poke.multi .check.show-ivs").hasClass("on");
				results = [];

				// Set attacker in battle so damage calculations work
				battle.setNewPokemon(attacker, 0, false);

				// Ensure attacker charged moves have STAB set
				for(var m = 0; m < attacker.chargedMoves.length; m++){
					attacker.chargedMoves[m].stab = attacker.getStab(attacker.chargedMoves[m]);
				}

				for(var i = 0; i < opponents.length; i++){
					var defender = new Pokemon(opponents[i].speciesId, 1, battle);
					defender.initialize(cp);

					// Apply IVs from the multiselect if specified
					if(opponents[i].ivs){
						defender.setIV("atk", opponents[i].ivs.atk);
						defender.setIV("def", opponents[i].ivs.def);
						defender.setIV("hp", opponents[i].ivs.hp);
					}

					if(opponents[i].level){
						defender.setLevel(opponents[i].level);
					}

					var moveResults = [];

					for(var m = 0; m < attacker.chargedMoves.length; m++){
						var move = attacker.chargedMoves[m];

						if(move.moveId == "none") continue;

						var damage = DamageCalculator.damage(attacker, defender, move);
						var hpPercent = Math.min((damage / defender.stats.hp) * 100, 100);

						moveResults.push({
							moveName: move.name,
							moveType: move.type,
							damage: damage,
							hpPercent: hpPercent
						});
					}

					// Calculate max damage percent for sorting
					var maxPercent = 0;
					for(var m = 0; m < moveResults.length; m++){
						if(moveResults[m].hpPercent > maxPercent){
							maxPercent = moveResults[m].hpPercent;
						}
					}

					results.push({
						pokemon: defender,
						speciesName: defender.speciesName,
						types: defender.types,
						hp: defender.stats.hp,
						level: defender.level,
						ivs: defender.ivs,
						moveResults: moveResults,
						maxDamagePercent: maxPercent
					});
				}

				sortResults();
				displayResults();

				$(".damage-viz-results").removeClass("hide").show();
			}

			function sortResults(){
				results.sort(function(a, b){
					return (b.maxDamagePercent - a.maxDamagePercent) * sortDirection;
				});
			}

			function toggleSort(){
				sortDirection *= -1;

				if(sortDirection === -1){
					$(".damage-viz-sort").html("Sort: Most Damage &#9660;");
				} else{
					$(".damage-viz-sort").html("Sort: Least Damage &#9650;");
				}

				sortResults();
				displayResults();
			}

			function displayResults(){
				var html = "";

				for(var i = 0; i < results.length; i++){
					var r = results[i];
					var typeClass = r.types[0];

					html += '<div class="damage-card">';
					html += '<div class="card-header ' + typeClass + '">';
					html += '<span class="pokemon-name">' + r.speciesName + '</span>';
					html += '<span class="pokemon-hp">';
					if(showIVs && r.level && r.ivs){
						html += 'Lv' + r.level + ' ' + r.ivs.atk + '/' + r.ivs.def + '/' + r.ivs.hp + ' &middot; ';
					}
					html += r.hp + ' HP</span>';
					html += '</div>';

					for(var m = 0; m < r.moveResults.length; m++){
						var mr = r.moveResults[m];
						var barColor = getBarColor(mr.hpPercent);

						html += '<div class="move-damage-row">';
						html += '<div class="move-info">';
						html += '<span class="move-name ' + mr.moveType + '">' + mr.moveName + '</span>';
						html += '<span class="damage-values">';
						html += '<span class="damage-number">' + mr.damage + '</span>';
						html += '<span class="damage-percent">' + mr.hpPercent.toFixed(1) + '%</span>';
						html += '</span>';
						html += '</div>';
						html += '<div class="hp bar-back">';
						html += '<div class="bar" style="width:' + Math.min(mr.hpPercent, 100) + '%" color="' + barColor + '"></div>';
						html += '</div>';
						html += '</div>';
					}

					html += '</div>';
				}

				$(".damage-viz-container").html(html);
			}

			function getBarColor(damagePercent){
				if(damagePercent >= 50) return "red";
				if(damagePercent >= 25) return "yellow";
				return "green";
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
