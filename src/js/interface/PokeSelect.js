/*
 * Funtionality for the Pokemon selection interface
 */

function PokeSelect(element, i){
	var $el = element;
	var $pokeSelect = $el.find("select.poke-select");
	var $formSelect = $el.find("select.form-select");
	var $tooltip = $el.find(".tooltip");
	var $input = $el.find("input");
	var gm = GameMaster.getInstance();
	var battle;
	var index = i;
	var pokemon = [];
	var selectedPokemon;
	var self = this;
	var interface;
	var isCustom = false; // Whether or not the Pokemon has custom-set level, IVs, or traits
	var context = "main";
	var searchArr = []; // Array of searchable Pokemon sorted by priority
	var optionData = []; // Array of Pokemon data sorted alphabetically for option display
	var pokebox;
	var searchTimeout;

	var currentHP; // The currently animated HP
	var currentEnergy; // The currently animated energy
	var previousId = '';
	var previousForms = []; // Stores previously accessed forms to retain their levels

	var ivCombinationCount = 4096;

	this.init = function(pokes, b, filterData){
		pokemon = pokes;
		battle = b;

		$.each(gm.pokeSelectList, function(n, poke){

			if(poke.tags && poke.tags.indexOf("duplicate") > -1 && context != "modaloverrides"){
				return;
			}

			if(filterData){
				if(! filterData.some(p => p.speciesId == poke.speciesId)){
					return;
				}
			}
			// This array is searched for matching Pokemon
			searchArr.push(poke);
			optionData.push(poke);
		});

		$el.find(".check.auto-level").addClass("on");
		$el.find(".poke-search").val("");
		$el.attr("context", context);

		searchArr.sort((a,b) => (a.priority > b.priority) ? -1 : ((b.priority > a.priority) ? 1 : 0));

		interface = InterfaceMaster.getInstance();

		if(typeof Pokebox === 'function'){
			pokebox = new Pokebox($el.find(".pokebox"), self, "single", b);
		}

		self.clear();
	}

	this.update = function(){

		if(selectedPokemon){

			selectedPokemon.reset();

			$el.find(".poke-stats").show();

			$el.find(".attack .stat").html(Math.floor(selectedPokemon.stats.atk*10)/10);
			$el.find(".defense .stat").html(Math.floor(selectedPokemon.stats.def*10)/10);
			$el.find(".stamina .stat").html(selectedPokemon.stats.hp);

			$el.find(".poke-stats .stat").removeClass("buff debuff");

			// Display stat adjustments for damage dealt and taken
			let originalStats = {
				atk: selectedPokemon.cpm * (selectedPokemon.baseStats.atk + selectedPokemon.ivs.atk),
				def: selectedPokemon.cpm * (selectedPokemon.baseStats.def + selectedPokemon.ivs.def),
				hp: Math.max(Math.floor(selectedPokemon.cpm * (selectedPokemon.baseStats.hp + selectedPokemon.ivs.hp)), 10),
			}

			var effectiveAtk = selectedPokemon.getEffectiveStat(0);
			var effectiveDef = selectedPokemon.getEffectiveStat(1);

			var adjustmentAtk = Math.round((effectiveAtk / selectedPokemon.stats.atk) * 100) / 100;
			var adjustmentDef = Math.round( (1 / (effectiveDef / selectedPokemon.stats.def)) * 100) / 100;

			$el.find(".adjustment.attack .value").html("x" + adjustmentAtk);
			$el.find(".adjustment.defense .value").html("x" + adjustmentDef);

			$el.find(".adjustment .value").removeClass("buff debuff");

			// Show attack buff or debuff
			if(adjustmentAtk > 1){
				$el.find(".adjustment.attack .value").addClass("buff");
			} else if(adjustmentAtk < 1){
				$el.find(".adjustment.attack .value").addClass("debuff");
			}

			// Show defense buff or debuff
			if(adjustmentDef < 1){
				$el.find(".adjustment.defense .value").addClass("buff");
			} else if(adjustmentDef > 1){
				$el.find(".adjustment.defense .value").addClass("debuff");
			}

			// Show hp buff or debuff
			if(selectedPokemon.stats.hp > originalStats.hp){
				$el.find(".poke-stats .stamina .stat").addClass("buff");
			} else if(selectedPokemon.stats.hp < originalStats.hp){
				$el.find(".poke-stats .stamina .stat").addClass("debuff");
			}



			var overall = Math.round((originalStats.hp * originalStats.atk * originalStats.def) / 1000);
			var effectiveOverall = Math.round((selectedPokemon.stats.hp * selectedPokemon.getEffectiveStat(0) * selectedPokemon.getEffectiveStat(1)) / 1000);

			$el.find(".overall .stat").html(effectiveOverall);

			if(effectiveOverall > overall){
				$el.find(".overall .stat").addClass("buff");
			} else if(effectiveOverall < overall){
				$el.find(".overall .stat").addClass("debuff");
			}

			$el.find(".attack .bar").css("width", (selectedPokemon.stats.atk / 4)+"%");
			$el.find(".defense .bar").css("width", (selectedPokemon.stats.def / 4)+"%");
			$el.find(".stamina .bar").css("width", (selectedPokemon.stats.hp / 4)+"%");

			$el.find(".cp .stat").html(selectedPokemon.cp);

			$el.find(".hp .bar").css("width", ((selectedPokemon.hp / selectedPokemon.stats.hp)*100)+"%");
			$el.find(".hp .stat").html(selectedPokemon.hp+" / "+selectedPokemon.stats.hp);

			$el.find(".types").html('');

			if(selectedPokemon.autoLevel){
				$el.find(".check.auto-level").addClass("on");
			} else{
				$el.find(".check.auto-level").removeClass("on");
			}

			$el.find(".level-cap-group .check").removeClass("on");
			$el.find(".level-cap-group .check[value=\""+selectedPokemon.levelCap+"\"]").addClass("on");


			if(selectedPokemon.optimizeMoveTiming){
				$el.find(".check.optimize-timing").addClass("on");
			} else{
				$el.find(".check.optimize-timing").removeClass("on");
			}

			if(selectedPokemon.startCooldown == 1000){
				$el.find(".check.switch-delay").addClass("on");
			} else{
				$el.find(".check.switch-delay").removeClass("on");
			}

			if($el.find("input.level:focus, input.iv:focus").length == 0){
				$el.find("input.level").val(selectedPokemon.level);
				$el.find("input.iv").eq(0).val(selectedPokemon.ivs.atk);
				$el.find("input.iv").eq(1).val(selectedPokemon.ivs.def);
				$el.find("input.iv").eq(2).val(selectedPokemon.ivs.hp);
			}

			for(var i = 0; i < selectedPokemon.types.length; i++){

				var typeStr = selectedPokemon.types[i].charAt(0).toUpperCase() + selectedPokemon.types[i].slice(1);
				if(selectedPokemon.types[i] != "none"){
					$el.find(".types").append("<div class=\"type "+selectedPokemon.types[i]+"\">"+typeStr+"</div>");
				}
			}

			// Set move selects

			var $fastSelect = $el.find(".move-select.fast");

			$fastSelect.html('');
			$el.find(".move-select.charged").html('');

			if($fastSelect.html() == ''){
				// Add content to move selects

				for(var i = 0; i < selectedPokemon.fastMovePool.length; i++){
					var move = selectedPokemon.fastMovePool[i];

					$fastSelect.append("<option value=\""+move.moveId+"\">"+move.displayName+"</option");
				}

				if(context != "modalcustomrankings"){
					$fastSelect.append("<option value=\"custom\">Custom ...</option");
				}

				$el.find(".move-select.charged").each(function(index, value){

					$(this).append("<option value=\"none\">None</option");

					for(var i = 0; i < selectedPokemon.chargedMovePool.length; i++){

						var move = selectedPokemon.chargedMovePool[i];

						$(this).append("<option value=\""+move.moveId+"\">"+move.displayName+"</option");
					}

					if(context != "modalcustomrankings"){
						$(this).append("<option value=\"custom\">Other ...</option");
					}

				});
			}

			$fastSelect.find("option[value='"+selectedPokemon.fastMove.moveId+"']").prop("selected","selected");
			$fastSelect.attr("class", "move-select fast " + selectedPokemon.fastMove.type);

			$el.find(".add-fast-move").html("+ " + selectedPokemon.fastMove.name);
			$el.find(".add-fast-move").attr("class","add-fast-move " + selectedPokemon.fastMove.type);

			// Display charged moves

			$el.find(".move-bar").hide();

			for(var i = 0; i < $el.find(".move-select.charged").length; i++){
				if(i < selectedPokemon.chargedMoves.length){
					var chargedMove = selectedPokemon.chargedMoves[i];

					$el.find(".move-select.charged").eq(i).find("option[value='"+chargedMove.moveId+"']").prop("selected","selected");
					$el.find(".move-select.charged").eq(i).attr("class", "move-select charged " + chargedMove.type);
					$el.find(".move-bar").eq(i).show();
					$el.find(".move-bar").eq(i).find(".label").html(chargedMove.abbreviation);
					$el.find(".move-bar").eq(i).find(".bar").css("height","0%");
					$el.find(".move-bar").eq(i).find(".bar").eq(0).css("height","105%");
					$el.find(".move-bar").eq(i).find(".bar").attr("class","bar " + chargedMove.type);
					$el.find(".move-bar").eq(i).find(".bar-back").attr("class","bar-back " + chargedMove.type);
				} else{
					$el.find(".move-select.charged").eq(i).attr("class", "move-select charged");
					$el.find(".move-select.charged").eq(i).find("option").first().prop("selected","selected");
				}
			}

			// Display starting HP
			$el.find(".hp .bar.damage").hide();

			if(selectedPokemon.startHp < selectedPokemon.stats.hp){
				self.animateHealth(0);
			}

			if(selectedPokemon.startEnergy > 0){
				for(var i = 0; i < 2; i++){
					self.animateEnergy(i, 0);
				}
			}

			// Update checkbox options to match current settings

			if(selectedPokemon.priority == 1){
				$el.find(".check.priority").addClass("on");
			} else{
				$el.find(".check.priority").removeClass("on");
			}

			if(! selectedPokemon.negateFastMoves){
				$el.find(".check.negate-fast-moves").removeClass("on");
			} else{
				$el.find(".check.negate-fast-moves").addClass("on");
			}

			// Update the Shadow form radio buttons to display the currently selected setting

			$el.find(".form-group.shadow-picker .option").removeClass("on");
			$el.find(".form-group.shadow-picker .option[value=\""+selectedPokemon.shadowType+"\"]").addClass("on");

			// Update the bait form radio buttons to display the currently selected setting

			$el.find(".form-group.bait-picker .option").removeClass("on");
			$el.find(".form-group.bait-picker .option[value=\""+selectedPokemon.baitShields+"\"]").addClass("on");

			if(selectedPokemon.hasTag("shadow")){
				$el.find(".shadow-section").hide();
			} else{
				$el.find(".shadow-section").show();
			}

			// Show Shadow Identifier

			if(selectedPokemon.shadowType == "shadow"){
				$el.find(".cp .identifier").show();
			} else{
				$el.find(".cp .identifier").hide();
			}

			// Show custom ranking settings
			$el.find(".ranking-weight").val(selectedPokemon.rankingWeight);

			// Hide Pokebox after selection
			$el.find(".pokebox").hide();

			// Show base Pokemon CP for Mega Evolutions

			if(selectedPokemon.hasTag("mega")){
				// Get the ID of the original form
				var baseId = selectedPokemon.speciesId;

				baseId = baseId.replace("_mega_x", "");
				baseId = baseId.replace("_mega_y", "");
				baseId = baseId.replace("_mega", "");
				baseId = baseId.replace("_primal", "");

				var basePokemon = new Pokemon(baseId, index, battle);
				basePokemon.initialize(false);
				basePokemon.setIV("atk", selectedPokemon.ivs.atk);
				basePokemon.setIV("def", selectedPokemon.ivs.def);
				basePokemon.setIV("hp", selectedPokemon.ivs.hp);
				basePokemon.setLevel(selectedPokemon.level);

				$el.find(".mega-cp-container .base-name").html("Base " + basePokemon.speciesName);
				$el.find(".mega-cp-container .mega-cp .stat").html(basePokemon.cp);
				$el.find(".mega-cp-container").show();
			} else{
				$el.find(".mega-cp-container").hide();
			}

			// Show alternate form CP for form changing Pokemon
			$el.find(".form-cp-container").hide();

			if(selectedPokemon.formChange){
				let formId = selectedPokemon.formChange.alternativeFormId;
				let newStats = selectedPokemon.getFormStats(formId);

				// Update existing form data to match the current level and iv's
				previousForms.forEach(form => {
					if(form.speciesId == selectedPokemon.speciesId){
						form.setIV("atk", selectedPokemon.ivs.atk);
						form.setIV("def", selectedPokemon.ivs.def);
						form.setIV("hp", selectedPokemon.ivs.hp);
						form.setLevel(selectedPokemon.level, false);
						form.level = selectedPokemon.level;
					}
				});

				if(newStats.atk != selectedPokemon.stats.atk || newStats.def != selectedPokemon.stats.def || newStats.hp != selectedPokemon.stats.hp){
					var newForm = new Pokemon(formId, index, battle);
					newForm.initialize(false);
					newForm.setIV("atk", selectedPokemon.ivs.atk);
					newForm.setIV("def", selectedPokemon.ivs.def);
					newForm.setIV("hp", selectedPokemon.ivs.hp);
					newForm.setLevel(newStats.level);

					let previousFormData = previousForms.find(form => form.speciesId == formId);
					if(previousFormData 
						&& previousFormData.ivs.atk == newForm.ivs.atk
						&& previousFormData.ivs.def == newForm.ivs.def
						&& previousFormData.ivs.hp == newForm.ivs.hp){
						newForm.setLevel(previousFormData.level);
					}

					$el.find(".form-cp-container .base-name").html(newForm.speciesName + " Forme");
					$el.find(".form-cp-container .form-cp .stat").html(newForm.cp);
					$el.find(".form-cp-container a.select-alternate-form").attr("level", newForm.level);
					$el.find(".form-cp-container").show();
				}
			}

			// List related forms
			if(previousId != selectedPokemon.speciesId){
				previousId = selectedPokemon.speciesId;

				$formSelect.find("option:not(:first-child)").remove();

				var forms = gm.getPokemonForms(selectedPokemon.dex);

				// Remove the selectedPokemon from the list of alternative forms
				for(var i = 0; i < forms.length; i++){
					if(forms[i].speciesId == selectedPokemon.speciesId){
						forms.splice(i, 1);
					}
				}

				$el.find(".form-link").hide();

				if(forms.length > 0){
					$el.find(".form-select-container").css("visibility", "visible");

					if(forms.length > 1){
						// Show the form select dropdown
						$el.find(".form-select").show();
						$el.find(".form-link").hide();


						for(var i = 0; i < forms.length; i++){
							if(forms[i].speciesId != selectedPokemon.speciesId){
								$formSelect.append("<option value='"+forms[i].speciesId+"'>"+forms[i].speciesName+"</option>");
							}
						}
					} else{
						// Show a link to the alternative form

						$el.find(".form-select").hide();
						$el.find(".form-link").css("display", "block");
						$el.find(".form-link").text(forms[0].speciesName);
						$el.find(".form-link").attr("value", forms[0].speciesId);
					}
				} else{
					$el.find(".form-select-container").css("visibility", "hidden");
				}

				$formSelect.find("option").eq(0).prop("selected", "selected");
			}

		}
	}

	// Display the Pokemon's IV rank in the advanced stats section
	this.updateIVRank = function(){
		// Get rank value
		var rankObj = selectedPokemon.getIVRank("overall");
		var rank = rankObj.rank;
		var count = ivCombinationCount = rankObj.count;


		if(rank != 0){
			$el.find(".iv-rank .value").html("#" + rank);

			var rankColor = this.getIVRankColor(rank, count);
			$el.find(".iv-rank").css("background", "rgba("+rankColor[0]+","+rankColor[1]+","+rankColor[2]+", 1)");
		} else{
			$el.find(".iv-rank .value").html("??");
			$el.find(".iv-rank").css("background", "");
		}

		$el.find(".iv-rank .count").html(" / " + count);

	}

	this.getIVRankColor = function(rank, combinationCount){
		// Display rank color
		var highColor = [14, 176, 132];
		var mediumColor = [220, 165, 23];
		var lowColor = [198, 11, 11];

		var ratio = rank / combinationCount;
		var colorRatio = ratio / .25;

		var startColor = highColor;
		var endColor = mediumColor;

		if(ratio > .25){
			startColor = mediumColor;
			endColor = lowColor;
			ratio = (ratio - .25) / .75;
		}

		var rankColor = [0, 0, 0]; // Final color to be used

		for(var i = 0; i < rankColor.length; i++){
			var range = endColor[i] - startColor[i];
			var base = startColor[i];

			rankColor[i] = Math.floor(base + (range * colorRatio));
		}

		return rankColor;
	}


	// Generate and update the IV ranking table for the selected Pokemon's evolutionary family
	this.updateIVTableResults = function(){
		// Display results for this species first
		var list = [];

		if(selectedPokemon.family){
			list = GameMaster.getInstance().getPokemonByFamily(selectedPokemon.family.id)
		} else{
			list = [GameMaster.getInstance().getPokemonById(selectedPokemon.speciesId)];
		}

		list.sort((a,b) => (a.dex > b.dex) ? 1 : ((b.dex > a.dex) ? -1 : 0));

		// Move current Pokemon to front
		for(var i = 0; i < list.length; i++){
			if(list[i].speciesId == selectedPokemon.speciesId.replace("_shadow", "")){
				list.unshift(list.splice(i, 1)[0]);
			}
		}

		$(".modal .iv-rank-results").html("");

		for(var i = 0; i < list.length; i++){
			var $result = this.generateIVTableResult(list[i]);

			if(i == 0){
				$result.addClass("primary");
			}

			if($result.find("tbody tr").length > 0){

				$(".modal .iv-rank-results").append($result);
			}
		}

		$(".modal .count").html(ivCombinationCount);
	}

	// Generate the IV rankings values and HTML for a specific Pokemon in the modal view
	this.generateIVTableResult = function(poke){
		var leagues = [1500, 2500];
		var levelCaps = [50, 51];
		var statProductMin = [1500, 3500];

		var $result = $(".modal .iv-rank-result.template").first().clone().removeClass("template hide");
		var b = new Battle();
		var rows = [];

		for(var i = 0; i < leagues.length; i++){
			var leagueDisqualified = false;

			for(var n = 0; n < levelCaps.length; n++){
				if(leagueDisqualified){
					break;
				}

				b.setCP(leagues[i]);

				var pokemon = new Pokemon(poke.speciesId, 0, b);
				pokemon.initialize(true);
				pokemon.levelCap = levelCaps[n];
				pokemon.autoLevel = true;
				pokemon.setIV("atk", selectedPokemon.ivs.atk);
				pokemon.setIV("def", selectedPokemon.ivs.def);
				pokemon.setIV("hp", selectedPokemon.ivs.hp);

				// Select same Charged Moves so Return is applied for IV Floors
				if(selectedPokemon.hasMove("RETURN")){
					pokemon.selectMove("charged", "RETURN", 0);
				}

				var rankObj = pokemon.getIVRank("overall");

				// Exclude leagues that aren't relevant for the league
				if(leagues[i] - pokemon.cp < 300 || ((pokemon.stats.atk * pokemon.stats.def * pokemon.stats.hp) / 100) > statProductMin){
					rows.push({
						cp: pokemon.cp,
						level: pokemon.level,
						rank: rankObj.rank,
						count: rankObj.count,
						league: leagues[i]
					});
				} else{
					leagueDisqualified = true;
				}

			}
		}

		// Remove duplicate/obsolete best buddy rows
		for(var i = 0; i < rows.length; i++){
			if(i > 0 && rows[i-1].level == rows[i].level){
				rows.splice(i, 1);
				i--;
			}
		}

		// Update HTML with row results
		$result.find("h3").html(poke.speciesName);

		for(var i = 0; i < rows.length; i++){
			var $row = $("<tr><td class=\"league-"+rows[i].league+"\">"+rows[i].cp+"</td><td>"+rows[i].level+"</td><td><div class=\"iv-rank\">#"+rows[i].rank+"</div></td></tr>");
			var rankColor = this.getIVRankColor(rows[i].rank, rows[i].count);
			$row.find(".iv-rank").css("background", "rgba("+rankColor[0]+","+rankColor[1]+","+rankColor[2]+", 1)");
			$result.find("tbody").append($row);
		}

		return $result;
	}

	// During timeline playback, animate the health bar

	this.animateHealth = function(amount){
		var health = Math.max(0, selectedPokemon.startHp - amount);

		$el.find(".hp .bar").css("width", ((health / selectedPokemon.stats.hp)*100)+"%");
		$el.find(".hp .stat").html(health+" / "+selectedPokemon.stats.hp);
		$el.find(".hp .bar.damage").hide();

		if(health / selectedPokemon.stats.hp <= 0.25){
			$el.find(".hp .bar").attr("color", "red");
		} else if(health / selectedPokemon.stats.hp <= 0.5){
			$el.find(".hp .bar").attr("color", "yellow");
		} else{
			$el.find(".hp .bar").attr("color", "green");
		}

		currentHP = health;
	}

	// During timeline playback, animate the energy bar

	this.animateEnergy = function(index, amount){

		$el.find(".energy-label .num").html(Math.min(selectedPokemon.startEnergy + amount, 100));

		if(selectedPokemon.chargedMoves.length <= index){
			return;
		}

		var energy = selectedPokemon.startEnergy + amount;
		var $bar = $el.find(".move-bar").eq(index);

		$bar.find(".bar").each(function(i, value){
			var extraEnergy = energy - (selectedPokemon.chargedMoves[index].energy * i);

			$(this).css("height", ((extraEnergy / selectedPokemon.chargedMoves[index].energy)*105)+"%");
		});

		//$bar.find(".bar").css("height", ((energy / selectedPokemon.chargedMoves[index].energy)*100)+"%");

		if(energy >= selectedPokemon.chargedMoves[index].energy){
			$bar.addClass("active");
		} else{
			$bar.removeClass("active");
		}

		currentEnergy = energy;
	}

	// Display a damage amount on the health bar (triggered from Interface.js when hovering over another selector's Charged Moves)

	this.animateDamage = function(amount){
		var health = Math.max(0, selectedPokemon.startHp - amount);

		$el.find(".hp .bar.damage").css("width", ((amount / selectedPokemon.stats.hp)*100)+"%");
		$el.find(".hp .bar.damage").show();

		var position = Math.max( Math.ceil($el.find(".hp .bar").eq(0).width() - $el.find(".hp .bar.damage").width()), 0);
		$el.find(".hp .bar.damage").css("left", position+"px");

		var remainingHealth = ($el.find(".hp .bar").eq(0).width() - $el.find(".hp .bar").eq(1).width()) / 180;

		if(remainingHealth <= 0.25){
			$el.find(".hp .bar").attr("color", "red");
		} else if(remainingHealth <= 0.5){
			$el.find(".hp .bar").attr("color", "yellow");
		} else{
			$el.find(".hp .bar").attr("color", "green");
		}
	}

	// Reset IV and Level input fields, and other options when switching Pokemon

	this.reset = function(){
		$el.find("input.level").val('');
		$el.find("input.iv").val('');
		$el.find("input.stat-mod").val('');
		$el.find(".start-hp").val('');
		$el.find(".start-energy").val('');
		$el.find(".move-select").html('');
		$el.find(".starting-health").val(selectedPokemon.stats.hp);
		$el.find(".check.optimize-timing").removeClass("on");
		$el.find(".check.switch-delay").removeClass("on");
		$el.find(".check.priority").removeClass("on");
		$el.find(".check.negate-fast-moves").addClass("on");
		$el.find(".hp .bar.damage").hide();

		self.updateOptions();

		isCustom = false;

		if(interface.resetSandbox){
			interface.resetSandbox();
		}
	}

	// Remove the currently selected Pokemon

	this.clear = function(){
		selectedPokemon = null;
		previousForms = [];

		$el.find("input.level").val('');
		$el.find("input.iv").val('');
		$el.find("input.stat-mod").val('');
		$el.find(".start-hp").val('');
		$el.find(".start-energy").val('');
		$el.find(".move-select").html('');
		$el.find(".start-energy").val('');
		$el.find(".poke-stats").hide();
		$el.find(".pokebox").show();
		$pokeSelect.find("option").first().prop("selected", "selected");
		self.updateOptions();

		isCustom = false;
	}

	// Manually set the selected Pokemon with a specific Pokemon

	this.setSelectedPokemon = function(poke){
		selectedPokemon = poke;

		battle.setNewPokemon(selectedPokemon, index, false);

		// Clear current custom values

		$el.find("input.level, input.iv, input.stat-mod, input.start-hp, input.start-energy").val("");

		self.updateOptions();

		$pokeSelect.find("option[value=\""+poke.speciesId+"\"]").prop("selected","selected");

		if((poke.startStatBuffs[0] != 0)||(poke.startStatBuffs[1] != 0)){
			$el.find("input.stat-mod[iv='atk']").val(poke.startStatBuffs[0]);
			$el.find("input.stat-mod[iv='def']").val(poke.startStatBuffs[1]);
		}

		if(poke.startHp != poke.stats.hp){
			$el.find("input.start-hp").val(poke.startHp);
		}

		if(poke.startEnergy != 0){
			$el.find("input.start-energy").val(poke.startEnergy);
		}

		selectedPokemon.autoLevel = true;

		// Set shields to correct amount

		poke.startingShields = $el.find(".shield-picker .option.on").attr("value");

		// Set level and iv fields
		$el.find("input.level").val(selectedPokemon.level);
		$el.find("input.iv[iv='atk']").val(selectedPokemon.ivs.atk);
		$el.find("input.iv[iv='def']").val(selectedPokemon.ivs.def);
		$el.find("input.iv[iv='hp']").val(selectedPokemon.ivs.hp);

		// Preserve this form for later reference
		if(selectedPokemon.formChange && ! previousForms.some(form => form.speciesId == selectedPokemon.speciesId)){
			previousForms.push({...selectedPokemon});
		}

		self.updateIVRank();

		self.update();
	}

	// Set CP of the selected Pokemon, used in the team interface to circumvent the Battle class

	this.setCP = function(cp){

		if(!selectedPokemon){
			return;
		}

		selectedPokemon.initialize(cp, settings.defaultIVs);

		self.update();
	}

	// Returns the selected Pokemon object

	this.getPokemon = function(){
		return selectedPokemon;
	}

	// Sets a selected Pokemon given an Id

	this.setPokemon = function(id, fromURL = false){
		id = id.replace("_xl","");

		selectedPokemon = new Pokemon(id, index, battle);

		if(fromURL){
			selectedPokemon.initialize(battle.getCP());
		} else{
			selectedPokemon.initialize(battle.getCP(), settings.defaultIVs);
		}

		selectedPokemon.selectRecommendedMoveset();

		if($(".team-build").length == 0){
			battle.setNewPokemon(selectedPokemon, index);
		}

		var value = parseInt($el.find(".shield-picker .option.on").attr("value"));

		selectedPokemon.setShields(value);
		selectedPokemon.autoLevel = true;

		previousForms = [];

		// Preserve this form for later reference
		if(selectedPokemon.formChange && ! previousForms.some(form => form.speciesId == selectedPokemon.speciesId)){
			previousForms.push({...selectedPokemon});
		}

		self.reset();

		self.updateIVRank();

		self.update();

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}

		// Set level and iv fields
		$el.find("input.level").val(selectedPokemon.level);
		$el.find("input.iv[iv='atk']").val(selectedPokemon.ivs.atk);
		$el.find("input.iv[iv='def']").val(selectedPokemon.ivs.def);
		$el.find("input.iv[iv='hp']").val(selectedPokemon.ivs.hp);

		self.updateOptions();

		$pokeSelect.find("option[value=\""+id+"\"]").prop("selected","selected");
	}

	// Update battle reference object with new instance

	this.setBattle = function(b){
		battle = b;

		if(selectedPokemon){
			selectedPokemon.setBattle(battle);
		}
	}

	// Set the context for this selector

	this.setContext = function(value){
		context = value;
	}

	// Return whether or not the selected Pokemon has custom options set

	this.isCustom = function(){
		return isCustom;
	}

	// Externally select the number of shields

	this.setShields = function(value){
		$el.find(".shield-picker .option[value="+value+"]").trigger("click");
	}

	// Return the number of selected shields

	this.getShields = function(value){
		return parseInt($el.find(".shield-picker .option.on").attr("value"));
	}

	// Reset the selected Pokemon's starting shields to the selected value

	this.resetShields = function(){
		$el.find(".shield-picker .option.on").trigger("click");
	}

	// Remove specific Pokemon from the selectable list
	this.removePokemonFromOptions = function(pokemonList){
		for(var i = 0; i < pokemonList.length; i++){
			$el.find(".poke-select option[value='"+pokemonList[i].speciesId+"']").remove();
			searchArr.splice(searchArr.findIndex(p => p.speciesId == pokemonList[i].speciesId), 1);
		}
	}

	// Update dropdown options with a rolling window based on the selected Pokemon
	this.updateOptions = function(){
		let selectedIndex = 0;

		if(selectedPokemon){
			selectedIndex = optionData.findIndex(pokemon => pokemon.speciesId == selectedPokemon.speciesId);
		}

		// Display options immediately ahead of and behind the selected Pokemon
		let totalToDisplay = 30;
		let startIndex = Math.max(0, selectedIndex - Math.floor(totalToDisplay / 2));
		let remainingDisplayCount = totalToDisplay - (selectedIndex - startIndex);
		let stopIndex = Math.min(optionData?.length || 0, selectedIndex + remainingDisplayCount);

		$pokeSelect.find("option").slice(1).remove();

		// Add options to select element
		for(var i = startIndex; i < stopIndex; i++){
			let poke = optionData[i];
			let $option = $("<option value=\""+poke.speciesId+"\">"+poke.displayName+"</option>");

			$pokeSelect.append($option);
		}

		if(selectedPokemon){
			$pokeSelect.find("option[value=\""+selectedPokemon.speciesId+"\"]").prop("selected", "selected");
		} else{
			$pokeSelect.find("option").first().prop("selected", "selected");
		}
	}

	// Select different Pokemon

	$pokeSelect.on("change", function(e, fromURL){
		var id = $pokeSelect.find("option:selected").val();
		self.setPokemon(id, fromURL);
	});

	// Select different Pokemon form

	$formSelect.on("change", function(e){
		var id = $formSelect.find("option:selected").val();
		self.setPokemon(id);
		$formSelect.blur();
	});

	$el.find("a.form-link").click(function(e){
		e.preventDefault();

		var id = $(this).attr("value");
		$pokeSelect.find("option[value='"+id+"']").prop("selected", "selected");
		$pokeSelect.trigger("change");
		$(this).blur();
	});

	// Select different move

	$el.find(".move-select").on("change", function(e){

		$tooltip.hide();

		var moveId = $(this).find("option:selected").val();
		var moveSlotIndex = $el.find(".move-select.charged").index($(this));

		if(moveId != "custom"){
			// Add existing move

			if($(this).hasClass("fast")){
				selectedPokemon.selectMove("fast", moveId, 0);
			} else if ($(this).hasClass("charged")){
				selectedPokemon.selectMove("charged", moveId, moveSlotIndex);
			}

			self.update();
		} else{
			// Add custom move

			modalWindow("Add Custom Move", $el.find(".custom-move"));

			$(".modal .custom-move .name").html(selectedPokemon.speciesName);

			var isFastMove = $(e.target).hasClass("fast");

			// Add moves to select option

			for(var i = 0; i < gm.data.moves.length; i++){
				var move = gm.data.moves[i];

				if( (((isFastMove)&&(move.energyGain > 0))||((! isFastMove)&&(move.energyGain == 0))) && ( (selectedPokemon.fastMovePool.indexOf(move.moveId) == -1) && (selectedPokemon.chargedMovePool.indexOf(move.moveId) == -1))){
					var $option = $("<option type=\""+move.type+"\" value=\""+move.moveId+"\">"+move.name+"</option>");

					// Edge cases

					if((move.moveId != "TRANSFORM") && (move.moveId.indexOf("BLASTOISE") == -1) ){
						$(".modal").last().find(".move-select").append($option);
					}
				}
			}

			$(".modal").last().find(".move-select").on("change", function(e){
				var type = $(this).find("option:selected").attr("type");

				$(this).attr("class", "move-select " + type);
			});

			$(".modal").last().find(".move-select").trigger("change");

			// Search for a move

			$(".modal").last().find(".poke-search").on("keyup", function(e){
				var val = $(this).val().toLocaleLowerCase();
				var $select = $(this).next(".move-select");

				$select.find("option").each(function(index, value){
					var moveName = $(this).html().toLowerCase();

					if(moveName.startsWith(val)){
						$(this).prop("selected","selected");
						$select.trigger("change");
						return false;
					}
				});
			});

			// Add the custom move

			$(".modal").last().find(".add-move").on("click", function(e){
				var moveId = $(".modal").last().find(".move-select option:selected").val();
				var moveType = (isFastMove) ? "fast" : "charged";

				var pool = (isFastMove) ? selectedPokemon.fastMovePool : selectedPokemon.chargedMovePool;

				selectedPokemon.addNewMove(moveId, pool, true, moveType, moveSlotIndex);

				$(".modal").last().remove();

				self.update();
			});
		}

	});

    // Search select Pokemon

	$el.find(".poke-search").on("keyup", function(e){
		// Don't search on arrow key press
		if(e.which == 38 || e.which == 40){
			return;
		}

		// Reset the timeout when a new key is typed. This prevents queries from being submitted too quickly and bogging things down on mobile.
		window.clearTimeout(searchTimeout);

		if($(window).width() >= 768){
			searchTimeout = window.setTimeout(submitSearchQuery, 25);
		} else{
			searchTimeout = window.setTimeout(submitSearchQuery, 250);
		}
	});

	// Clear Poke Search on focus

	$el.find(".poke-search").on("focus", function(e){
		$(this).val("");

		// On mobile, Scroll the searchbar into view
		if($(window).width() <= 768 && context.indexOf("modal") == -1){
			$("html, body").animate({ scrollTop: $(this).offset().top - 65 }, 500);
		}
	});

	// Submit search query after specified input delay
	// Prevents submitting repeated searches and reduce lag on mobile

	function submitSearchQuery(){

		var searchStr = $el.find(".poke-search").val().toLowerCase().trim();

		if(searchStr == ''){
			return;
		}

		var idToSelect;

		for(var i = 0; i < searchArr.length; i++){
			var pokeName = searchArr[i].speciesName;

			// Name search
			if(pokeName.startsWith(searchStr)){
				idToSelect = searchArr[i].speciesId;
				break;
			}

			// Dex search
			if(searchArr[i].dex == searchStr){
				idToSelect = searchArr[i].speciesId;
				break;
			}

			// Nickname search
			if(searchArr[i].nicknames){
				let nicknameMatched = false;

				for(var n = 0; n < searchArr[i].nicknames.length; n++){
					if(searchArr[i].nicknames[n].startsWith(searchStr)){
						idToSelect = searchArr[i].speciesId;
						nicknameMatched = true;
						break;
					}
				}

				if(nicknameMatched){
					break;
				}

			}

		}

		var idAlreadySelected = false;

		if(selectedPokemon && (idToSelect == selectedPokemon.speciesId)){
			idAlreadySelected = true;
		}

		if((idToSelect)&&(! idAlreadySelected)){
			self.setPokemon(idToSelect);
		}
	}

	// Auto select Pokemon moves

	$el.find(".auto-select").on("click", function(e){

		selectedPokemon.resetMoves();
		selectedPokemon.selectRecommendedMoveset();

		self.update();
	});

	// Select number of shields for Pokemon

	$el.find(".shield-picker .option").on("click", function(e){

		var value = parseInt($(e.target).closest(".option").attr("value"));

		if(selectedPokemon){
			selectedPokemon.setShields(value);
		}

		self.update();
	});

	// Enter starting HP

	$el.find(".start-hp").on("keyup change", function(e){

		var value = parseInt($el.find(".start-hp").val());

		selectedPokemon.setStartHp(value);

		self.update();
	});

	// Enter starting energy

	$el.find(".start-energy").on("keyup change", function(e){

		var value = parseInt($el.find(".start-energy").val());

		selectedPokemon.setStartEnergy(value);

		self.update();
	});

	// Turn shield baiting on and off

	$el.find(".form-group.bait-picker .option").on("click", function(e){
		selectedPokemon.baitShields = parseInt($(e.target).attr("value"));

		selectedPokemon.isCustom = true;
		isCustom = true;
	});

	// Turn switch delay on or off

	$el.find(".check.switch-delay").on("click", function(e){
		// Cooldown decreases at the start of the battle step, so a start value of 1000 will result in a 500 ms delay
		selectedPokemon.startCooldown = selectedPokemon.startCooldown == 0 ? selectedPokemon.startCooldown = 1000 : selectedPokemon.startCooldown = 0;
		selectedPokemon.isCustom = true;
		isCustom = true;
	});

	// Turn move optimization on or off

	$el.find(".check.optimize-timing").on("click", function(e){
		selectedPokemon.optimizeMoveTiming = (! selectedPokemon.optimizeMoveTiming);

		selectedPokemon.isCustom = true;
		isCustom = true;
	});

	// Set Charged Move priority

	$el.find(".check.priority").on("click", function(e){
		// Uncheck all other priority checkboxes

		$(".poke .check.priority").eq( (index == 0) ? 1 : 0).removeClass("on");
		battle.overridePriority( (index == 0) ? 1 : 0, 0);

		selectedPokemon.priority = ($(e.target).hasClass("on")) ? 0 : 1;
	});

	// Toggle fast move negating

	$el.find(".check.negate-fast-moves").on("click", function(e){
		selectedPokemon.negateFastMoves = ($(e.target).hasClass("on")) ? 0 : 1;
	});

	// Toggle the advanced options drawer

	$el.find(".advanced-section a").on("click", function(e){
		e.preventDefault();
		$el.find(".advanced-section").toggleClass("active");
	});

	// Turn maximize stats on and off

    $el.find(".maximize-stats").on("click", function(e){
		var sortStat = $el.find(".maximize-section .check-group .check.on").first().attr("value");
		var levelCap = parseInt($el.find(".maximize-section .level-cap-group .check.on").first().attr("value"));

		selectedPokemon.levelCap = levelCap;
        selectedPokemon.maximizeStat(sortStat);

        selectedPokemon.isCustom = true;
        isCustom = true;

		self.updateIVRank();

        self.update();

		$el.find("input.level").val(selectedPokemon.level);
		$el.find("input.iv[iv='atk']").val(selectedPokemon.ivs.atk);
		$el.find("input.iv[iv='def']").val(selectedPokemon.ivs.def);
		$el.find("input.iv[iv='hp']").val(selectedPokemon.ivs.hp);

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}
    });

	// Turn maximize stats on and off

    $el.find(".level-cap-group .check").on("click", function(e){
		// This is really dumb, but needs to be set on a delay because this processes before the checks actually change
		setTimeout(function(){
			var levelCap = parseInt($el.find(".maximize-section .level-cap-group .check.on").first().attr("value"));
			selectedPokemon.levelCap = levelCap;
		}, 25);
    });

	// Select an option from the maximize section

	$el.find(".maximize-section div .check").on("click", function(e){
		$(e.target).closest(".check").parent().find(".check").removeClass("on");
	});

	// Select an option from the form section

	$el.find(".form-group .option").on("click", function(e){
		$(e.target).closest(".form-group").find(".option").removeClass("on");
		$(e.target).closest(".option").addClass("on");
	});

	// Change a form option

	$el.find(".form-group.shadow-picker .option").on("click", function(e){
		var formType = $(e.target).attr("value");
		selectedPokemon.setShadowType(formType);

		self.update();
	});

	// Toggle auto select on and off

	$el.find(".maximize-section .check.auto-level").on("click", function(e){
		selectedPokemon.autoLevel = ! selectedPokemon.autoLevel;

		if(selectedPokemon.autoLevel){
			selectedPokemon.setIV("atk", selectedPokemon.ivs.atk);
			$el.find("input.iv").eq(0).trigger("change");
		}
	});

	// Restore default IV's

    $el.find(".restore-default").on("click", function(e){
        selectedPokemon.isCustom = false;
        isCustom = false;
        selectedPokemon.initialize(battle.getCP());

		self.updateIVRank();

        self.update();

		$el.find("input.level").val(selectedPokemon.level);
		$el.find("input.iv[iv='atk']").val(selectedPokemon.ivs.atk);
		$el.find("input.iv[iv='def']").val(selectedPokemon.ivs.def);
		$el.find("input.iv[iv='hp']").val(selectedPokemon.ivs.hp);

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}
    });

	// Change level input

	$el.find("input.level").on("keyup change", function(e){

		var value = parseFloat($el.find("input.level").val());

		if((value >= 1) && (value <=55) && (value % 0.5 == 0)){
			// Valid level

			selectedPokemon.setLevel(value);
		}

		isCustom = true;
		selectedPokemon.isCustom = true;
		selectedPokemon.autoLevel = false; // Disable auto-leveling when the user overrides the Pokemon's level

		self.updateIVRank();

		self.update();

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}
	});

	// Change level input

	$el.find("input.iv").on("keyup change", function(e){

		var value = parseFloat($(this).val());
		var iv = $(this).attr("iv");

		if((value >= 0) && (value <=15) && (value % 1 == 0)){
			// Valid level

			selectedPokemon.setIV(iv, value);

			$el.find("input.level").val(selectedPokemon.level);
		}

		isCustom = true;

		self.updateIVRank();

		self.update();

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}
	});

	// Clear level inputs on focus

	$el.find("input.iv, input.level").on("focus", function(e){
		$(this).val("");
	});

	// Change stat modifier input

	$el.find("input.stat-mod").on("keyup change", function(e){

		var value = parseInt($(this).val());

		if(! value){
			value = 0;
		}

		if((value >= -4) && (value <=4) && (value % 1 == 0)){
			// Valid level

			var attackValue = parseInt($el.find("input.stat-mod[iv='atk']").val());
			var defenseValue = parseInt($el.find("input.stat-mod[iv='def']").val());

			if(! attackValue)
				attackValue = 0;

			if(! defenseValue)
				defenseValue = 0;

			selectedPokemon.setStartBuffs([attackValue, defenseValue]);
		}

		isCustom = true;

		self.update();

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}
	});

	// Change ranking weight

	$el.find("input.ranking-weight").on("keyup change", function(e){

		var value = parseFloat($el.find("input.ranking-weight").val());

		if(value >= 0){
			selectedPokemon.rankingWeight = value;
		}
	});

	// Show move stats on hover

	$el.on("mousemove", ".move-bar, .move-select", function(e){
		let $target = $(e.target);

		$tooltip.show();

		$tooltip.attr("class","tooltip");

		let move;
		let moveType;

		if($target.is(".move-bar")){
			let index = $el.find(".move-bar").index($target);
			move = selectedPokemon.chargedMoves[index];
			moveType = "charged";
		} else if($target.is(".move-select.charged")){
			let index = $el.find(".move-select.charged").index($target);
			move = selectedPokemon.chargedMoves[index];
			moveType = "charged";
		} else{
			move = selectedPokemon.fastMove;
			moveType = "fast";
		}

		if(! move){
			$tooltip.hide();
			return false;
		}

		let displayDamage = move.damage;
		let percent = 0;
		// If opponent exists, recalc damage using original stats
		if(battle.getOpponent(selectedPokemon.index)){
			let opponent = battle.getOpponent(selectedPokemon.index);
			let effectiveness = opponent.typeEffectiveness[move.type];

			displayDamage = DamageCalculator.damageByStats(selectedPokemon, opponent, selectedPokemon.getEffectiveStat(0, true), opponent.getEffectiveStat(1, true), effectiveness, move);
			percent = Math.floor( (displayDamage / opponent.hp) * 1000) / 10;
		}

		// Update tooltip display
		$tooltip.find(".name").html(move.name);
		$tooltip.addClass(move.type);
		let details = '';


		switch(moveType){
			case "fast":
				let dpt = Math.floor( (displayDamage / move.turns) * 100) / 100;
				let ept = Math.floor( (move.energyGain / move.turns) * 100) / 100;
				let turnLabel = move.turns > 1 ? "turns" : "turn";

				details = displayDamage + ' <span class="label">dmg</span> (' + dpt + ' <i>dpt</i>)<br>'
					+ move.energyGain + ' <span class="label">energy</span> (' + ept + ' <i>ept</i>)<br>'
					+ move.turns + ' <span class="label">' + turnLabel + '</span>';
				break;

			case "charged":
				let dpe = Math.floor( (displayDamage / move.energy) * 100) / 100;
				let moveCounts = Pokemon.calculateMoveCounts(selectedPokemon.fastMove, move);

				if(percent > 0){
					details = displayDamage + ' (' + percent + '%) <span class="label">dmg</span><br>'
						+ move.energy + ' <span class="label">energy</span><br>'
						+ dpe + ' <span class="label">dpe</span><br>'
						+ moveCounts.join("-") + ' <span class="label">counts</span>';
				} else{
					details = displayDamage + ' <span class="label">dmg</span><br>'
						+ move.energy + ' <span class="label">energy</span><br>'
						+ dpe + ' <span class="label">dpe</span><br>'
						+ moveCounts.join("-") + ' <span class="label">counts</span>';
				}

				break;
		}

		$tooltip.find(".details").html(details);

		var width = $tooltip.width();

		var left = $target.position().left + $target.width() + 30;
		var top = $target.position().top + 10;

		if($target.offset().left > $(window).width() / 2){
			left = $target.position().left - width - 20;
		}

		$tooltip.css("left",left+"px");
		$tooltip.css("top",top+"px");
	});

	// Hide tooltip when mousing over other elements

	$el.find(".move-bar, .move-select").mouseout(function(e){
		$tooltip.hide();
	});

	// Open the clear confirmation window

	$el.find(".clear-selection").on("click", function(e){
		e.preventDefault();

		modalWindow("Clear Selection", $el.find(".clear-confirm"));

		$(".modal .name").html(selectedPokemon.speciesName);

		$(".modal .clear-confirm .yes").click(function(e){
			closeModalWindow();
			self.clear();
		});

	});

	// use the currently animated HP and Energy

	$el.find(".pull-from-timeline").on("click", function(e){
		$el.find(".start-hp").val(currentHP);
		$el.find(".start-energy").val(currentEnergy);
		$el.find(".start-hp").trigger("keyup");
		$el.find(".start-energy").trigger("keyup");
	});

	// Add one Fast Move worth of energy to the energy field

	$el.find(".add-fast-move").on("click", function(e){
		var startEnergy = Math.min(selectedPokemon.startEnergy + selectedPokemon.fastMove.energyGain, 100);
		$el.find(".start-energy").val(startEnergy);
		$el.find(".start-energy").trigger("keyup");
	});

	// Randomize selection

	$el.find(".random").on("click", function(e){
		e.preventDefault();

		self.clear();

		let filteredPokemonList = gm.generateFilteredPokemonList(battle, battle.getCup().include, battle.getCup().exclude);
		let index = Math.floor(Math.random() * filteredPokemonList.length);

		self.setPokemon(filteredPokemonList[index].speciesId);

	});

	// Keyboard shortcuts for selecting a Pokemon

	$el.find(".poke-search").keydown(function(e){
		if (e.which === 38 || e.which === 40) {
			e.preventDefault();

			if(e.which == 38){
				if($el.find(".poke-select option:selected").prev() && ! $el.find(".poke-select option:selected").prev().prop('disabled')){
					$el.find(".poke-select option:selected").prev().prop("selected", "selected");
					$el.find(".poke-select").trigger("change");
				}
			} else if(e.which == 40){
				if($el.find(".poke-select option:selected").next()){
					$el.find(".poke-select option:selected").next().prop("selected", "selected");
					$el.find(".poke-select").trigger("change");
				}
			}
		}
	});

	// Show keyboard shortcuts

	$el.find("a.search-info").click(function(e){
		e.preventDefault();

		modalWindow("Keyboard Commands", $el.find(".pokeselector-search-help"));
	});

	// Open the iv checker modal window
	$el.find(".advanced-section .iv-rank").click(function(e){
		modalWindow("PvP IV Rankings", $el.find(".iv-rank-details"));

		self.updateIVTableResults();
	});

	// Select the Pokemon's alternative form

	$el.find("a.select-alternate-form").click(function(e){
		e.preventDefault();

		if(selectedPokemon.formChange){
			let formId = selectedPokemon.formChange.alternativeFormId;
			let newStats = selectedPokemon.getFormStats(formId);
			let newForm = new Pokemon(formId, index, battle);
			let newLevel = parseFloat($(e.target).closest("a").attr("level"))

			newForm.initialize(true);
			newForm.setIV("atk", selectedPokemon.ivs.atk);
			newForm.setIV("def", selectedPokemon.ivs.def);
			newForm.setIV("hp", selectedPokemon.ivs.hp);
			newForm.setLevel(newLevel);

			switch(formId){
				case "aegislash_blade":
					newForm.stats.hp = selectedPokemon.stats.hp;
					newForm.hp = newForm.stats.hp;
					break;
			}
			
			newForm.selectMove("fast", selectedPokemon.fastMove.moveId);

			// Must operate on the second Charged Attack first
			if(selectedPokemon.chargedMoves[1]){
				newForm.selectMove("charged", selectedPokemon.chargedMoves[1].moveId, 1);
			} else{
				newForm.selectMove("charged", "none", 1);
			}

			if(selectedPokemon.chargedMoves[0]){
				newForm.selectMove("charged", selectedPokemon.chargedMoves[0].moveId, 0);
			} else{
				newForm.selectMove("charged", "none", 0);
			}

			self.setSelectedPokemon(newForm);
		}
	});
}
