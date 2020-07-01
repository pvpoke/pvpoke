/*
 * Funtionality for the Pokemon selection interface
 */

function PokeSelect(element, i){
	var $el = element;
	var $pokeSelect = $el.find("select.poke-select");
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

	var currentHP; // The currently animated HP
	var currentEnergy; // The currently animated energy

	this.init = function(pokes, b){
		pokemon = pokes;
		battle = b;

		$.each(pokemon, function(n, poke){

			if(poke.fastMoves.length > 0){
				$pokeSelect.append("<option value=\""+poke.speciesId+"\" type-1=\""+poke.types[0]+"\" type-2=\""+poke.types[1]+"\">"+poke.speciesName+"</option");
			}
		});

		interface = InterfaceMaster.getInstance();

		self.clear();
	}

	this.update = function(){

		if(selectedPokemon){

			selectedPokemon.reset();

			$el.find(".poke-stats").show();

			$el.find(".stat").removeClass("buff debuff");

			$el.find(".attack .stat").html(Math.floor(selectedPokemon.getEffectiveStat(0)*10)/10);
			$el.find(".defense .stat").html(Math.floor(selectedPokemon.getEffectiveStat(1)*10)/10);
			$el.find(".stamina .stat").html(selectedPokemon.stats.hp);

			if(selectedPokemon.getEffectiveStat(0) > selectedPokemon.stats.atk){
				$el.find(".attack .stat").addClass("buff");
			} else if(selectedPokemon.getEffectiveStat(0) < selectedPokemon.stats.atk){
				$el.find(".attack .stat").addClass("debuff");
			}

			if(selectedPokemon.getEffectiveStat(1) > selectedPokemon.stats.def){
				$el.find(".defense .stat").addClass("buff");
			} else if(selectedPokemon.getEffectiveStat(1) < selectedPokemon.stats.def){
				$el.find(".defense .stat").addClass("debuff");
			}

			var overall = Math.round((selectedPokemon.stats.hp * selectedPokemon.stats.atk * selectedPokemon.stats.def) / 1000);
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

			$el.find(".form-group .check").removeClass("on");
			$el.find(".form-group .check[value=\""+selectedPokemon.shadowType+"\"]").addClass("on");

			if(selectedPokemon.hasTag("shadow")){
				$el.find(".shadow-section").hide();
			} else{
				$el.find(".shadow-section").show();
			}
		}
	}

	// During timeline playback, animate the health bar

	this.animateHealth = function(amount){
		var health = Math.max(0, selectedPokemon.startHp - amount);

		$el.find(".hp .bar").css("width", ((health / selectedPokemon.stats.hp)*100)+"%");
		$el.find(".hp .stat").html(health+" / "+selectedPokemon.stats.hp);

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

	// Reset IV and Level input fields, and other options when switching Pokemon

	this.reset = function(){
		$el.find("input.level").val('');
		$el.find("input.iv").val('');
		$el.find("input.stat-mod").val('');
		$el.find(".start-hp").val('');
		$el.find(".start-energy").val('');
		$el.find(".move-select").html('');
		$el.find(".starting-health").val(selectedPokemon.stats.hp);
		$el.find(".check.shield-baiting").addClass("on");
		$el.find(".check.priority").removeClass("on");
		$el.find(".check.negate-fast-moves").addClass("on");

		isCustom = false;

		if(interface.resetSandbox){
			interface.resetSandbox();
		}
	}

	// Remove the currently selected Pokemon

	this.clear = function(){
		selectedPokemon = null;

		$el.find("input.level").val('');
		$el.find("input.iv").val('');
		$el.find("input.stat-mod").val('');
		$el.find(".start-hp").val('');
		$el.find(".start-energy").val('');
		$el.find(".move-select").html('');
		$el.find(".start-energy").val('');
		$el.find(".poke-stats").hide();
		$pokeSelect.find("option").first().prop("selected", "selected");

		isCustom = false;
	}

	// Manually set the selected Pokemon with a specific Pokemon

	this.setSelectedPokemon = function(poke){
		selectedPokemon = poke;

		battle.setNewPokemon(selectedPokemon, index, false);

		// Clear current custom values

		$el.find("input.level, input.iv, input.stat-mod, input.start-hp, input.start-energy").val("");

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

		// Set shields to correct amount

		$el.find(".shield-select option[value=\""+poke.startingShields+"\"]").prop("selected","selected");

		// Set level and iv fields
		$el.find("input.level").val(selectedPokemon.level);
		$el.find("input.iv[iv='atk']").val(selectedPokemon.ivs.atk);
		$el.find("input.iv[iv='def']").val(selectedPokemon.ivs.def);
		$el.find("input.iv[iv='hp']").val(selectedPokemon.ivs.hp);

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

	this.setPokemon = function(id){
		$pokeSelect.find("option[value=\""+id+"\"]").prop("selected","selected");
		$pokeSelect.trigger("change", true);
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

	// Show or hide Pokemon select options given array of types

	this.filterByTypes = function(types){

		$pokeSelect.find("option").removeClass("hide");

		if(types.length > 0){
			$pokeSelect.find("option").each(function(index, value){
				if((types.indexOf($(this).attr("type-1")) > -1) || (types.indexOf($(this).attr("type-2")) > -1)){
					$(this).removeClass("hide");
				} else{
					$(this).addClass("hide");
				}
			});
		}
	}

	// Select different Pokemon

	$pokeSelect.on("change", function(e, fromURL){
		var id = $pokeSelect.find("option:selected").val();
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

		var value = parseInt($el.find(".shield-select option:selected").val());

		selectedPokemon.setShields(value);

		self.reset();

		self.update();

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}

		// Set level and iv fields
		$el.find("input.level").val(selectedPokemon.level);
		$el.find("input.iv[iv='atk']").val(selectedPokemon.ivs.atk);
		$el.find("input.iv[iv='def']").val(selectedPokemon.ivs.def);
		$el.find("input.iv[iv='hp']").val(selectedPokemon.ivs.hp);
	});

	// Select different move

	$el.find(".move-select").on("change", function(e){

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

			$(".modal .name").html(selectedPokemon.speciesName);

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

		var searchStr = $el.find(".poke-search").val().toLowerCase();

		if(searchStr == '')
			return;

		var found = false;

		$pokeSelect.find("option").not(".hide").each(function(index, value){
			var pokeName = $(this).html().toLowerCase();

			if((pokeName.startsWith(searchStr))&&(! found)){

				$(this).prop("selected", "selected");

				found = true;

				return true;
			}
		});

		var id = $pokeSelect.find("option:selected").val();

		if(id){
			selectedPokemon = new Pokemon(id, index, battle);
			selectedPokemon.initialize(battle.getCP(), settings.defaultIVs);

			selectedPokemon.selectRecommendedMoveset();

			if($(".team-build").length == 0){
				battle.setNewPokemon(selectedPokemon, index);
			}

			var value = parseInt($el.find(".shield-select option:selected").val());

			selectedPokemon.setShields(value);

			self.reset();

			self.update();

			if(interface.resetSelectedPokemon){
				interface.resetSelectedPokemon();
			}


			// Set level and iv fields
			$el.find("input.level").val(selectedPokemon.level);
			$el.find("input.iv[iv='atk']").val(selectedPokemon.ivs.atk);
			$el.find("input.iv[iv='def']").val(selectedPokemon.ivs.def);
			$el.find("input.iv[iv='hp']").val(selectedPokemon.ivs.hp);
		}

	});

	// Auto select Pokemon moves

	$el.find(".auto-select").on("click", function(e){

		selectedPokemon.resetMoves();
		selectedPokemon.autoSelectMoves();

		self.update();
	});

	// Select number of shields for Pokemon

	$el.find(".shield-select").on("change", function(e){

		var value = parseInt($el.find(".shield-select option:selected").val());

		selectedPokemon.setShields(value);

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

	$el.find(".check.shield-baiting").on("click", function(e){
		selectedPokemon.baitShields = (! selectedPokemon.baitShields);

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

        self.update();

		$el.find("input.level").val(selectedPokemon.level);
		$el.find("input.iv[iv='atk']").val(selectedPokemon.ivs.atk);
		$el.find("input.iv[iv='def']").val(selectedPokemon.ivs.def);
		$el.find("input.iv[iv='hp']").val(selectedPokemon.ivs.hp);

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}
    });

	// Select an option from the maximize section

	$el.find(".maximize-section .check").on("click", function(e){
		$(e.target).closest(".check").parent().find(".check").removeClass("on");
	});

	// Select an option from the form section

	$el.find(".form-group .check").on("click", function(e){
		$(e.target).closest(".check").parent().find(".check").removeClass("on");
	});

	// Change a form option

	$el.find(".form-group .check").on("change", function(e){
		var formType = $(e.target).attr("value");
		selectedPokemon.setShadowType(formType);

		self.update();
	});

	// Restore default IV's

    $el.find(".restore-default").on("click", function(e){
        selectedPokemon.isCustom = false;
        isCustom = false;
        selectedPokemon.initialize(battle.getCP());

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

		if((value >= 1) && (value <=45) && (value % 0.5 == 0)){
			// Valid level

			selectedPokemon.setLevel(value);
		}

		isCustom = true;
		selectedPokemon.isCustom = true;

		self.update();

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}
	});

	// Change level input

	$el.find("input.iv").on("keyup change", function(e){

		var value = parseFloat($(this).val());

		if((value >= 0) && (value <=15) && (value % 1 == 0)){
			// Valid level

			selectedPokemon.setIV($(this).attr("iv"), value);
		}

		isCustom = true;

		self.update();

		if(interface.resetSelectedPokemon){
			interface.resetSelectedPokemon();
		}
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

	// Show move stats on hover

	$el.on("mousemove", ".move-bar", function(e){

		$tooltip.show();

		$tooltip.attr("class","tooltip");

		var index = $el.find(".move-bar").index($(e.target).closest(".move-bar"));
		var move = selectedPokemon.chargedMoves[index];
		var displayDamage = move.damage;
		// If opponent exists, recalc damage using original stats
		if(battle.getOpponent(selectedPokemon.index)){
			var opponent = battle.getOpponent(selectedPokemon.index);
			var effectiveness = opponent.typeEffectiveness[move.type];
			displayDamage = battle.calculateDamageByStats(selectedPokemon.stats.atk * opponent.shadowAtkMult, opponent.stats.def * selectedPokemon.shadowDefMult, effectiveness, move);
		}

		var dpe = Math.floor( (displayDamage / move.energy) * 100) / 100;

		$tooltip.find(".name").html(move.name);
		$tooltip.addClass(move.type);
		$tooltip.find(".details").html(displayDamage + ' damage<br>' + move.energy + ' energy<br>' + dpe + ' dpe');

		var width = $tooltip.width();
		var left = (e.pageX - $(".section").first().offset().left) + 10;
		var top = e.pageY - 20;

		if( left > ($(".timeline-container").width() - width - 10) ){
			left -= width;
		}

		if((left < 100)&&($(window).width() <= 480)){
			left = e.pageX;
		}

		$tooltip.css("left",left+"px");
		$tooltip.css("top",top+"px");
	});

	// Hide tooltip when mousing over other elements

	$("body").on("mousemove", function(e){
		if($el.find(".move-bar:hover").length == 0){
			$tooltip.hide();
		}
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

		var list = $pokeSelect.find("option").not(".hide");
		var index = Math.floor(Math.random() * list.length);

		self.setPokemon($(list).eq(index).val());

	});
}
