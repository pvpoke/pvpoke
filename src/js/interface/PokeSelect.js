/*
 * Funtionality for the Pokemon selection interface
 */

function PokeSelect(element, i){
	var $el = element;
	var $pokeSelect = $el.find("select.poke-select");
	var $input = $el.find("input");
	var gm = GameMaster.getInstance();
	var battle;
	var index = i;
	var pokemon = [];
	var selectedPokemon;
	var self = this;
	var interface;
	var isCustom = false; // Whether or not the Pokemon has custom-set level, IVs, or traits
	
	this.init = function(pokes, b){
		pokemon = pokes;
		battle = b;
		
		$.each(pokemon, function(n, poke){
			
			if(poke.fastMoves.length > 0){
				$pokeSelect.append("<option value=\""+poke.speciesId+"\" type-1=\""+poke.types[0]+"\" type-2=\""+poke.types[1]+"\">"+poke.speciesName+"</option");
			}
		});
		
		interface = InterfaceMaster.getInstance();
	}
	
	this.update = function(){
		
		if(selectedPokemon){
			
			selectedPokemon.reset();
			
			$el.find(".poke-stats").show();
			
			$el.find(".stat").removeClass("buff debuff");

			$el.find(".attack .stat").html(Math.round(selectedPokemon.getEffectiveStat(0)*10)/10);
			$el.find(".defense .stat").html(Math.round(selectedPokemon.getEffectiveStat(1)*10)/10);
			$el.find(".stamina .stat").html(selectedPokemon.stats.hp);
			
			if(selectedPokemon.statBuffs[0] > 0){
				$el.find(".attack .stat").addClass("buff");
			} else if(selectedPokemon.statBuffs[0] < 0){
				$el.find(".attack .stat").addClass("debuff");
			}
			
			if(selectedPokemon.statBuffs[1] > 0){
				$el.find(".defense .stat").addClass("buff");
			} else if(selectedPokemon.statBuffs[1] < 0){
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

					$fastSelect.append("<option value=\""+move.moveId+"\">"+move.name+(move.legacy === false ? "" : " *")+"</option");
				}
				
			
				$el.find(".move-select.charged").each(function(index, value){
					
					$(this).append("<option value=\"none\">None</option");
					
					for(var i = 0; i < selectedPokemon.chargedMovePool.length; i++){

						var move = selectedPokemon.chargedMovePool[i];

						$(this).append("<option value=\""+move.moveId+"\">"+move.name+(move.legacy === false ? "" : " *")+"</option");
					}
				});
			}

			$fastSelect.find("option[value='"+selectedPokemon.fastMove.moveId+"']").prop("selected","selected");
			$fastSelect.attr("class", "move-select fast " + selectedPokemon.fastMove.type);
			
			// Display charged moves
			
			$el.find(".move-bar").hide();
			
			for(var i = 0; i < $el.find(".move-select.charged").length; i++){
				if(i < selectedPokemon.chargedMoves.length){
					var chargedMove = selectedPokemon.chargedMoves[i];
					
					$el.find(".move-select.charged").eq(i).find("option[value='"+chargedMove.moveId+"']").prop("selected","selected");
					$el.find(".move-select.charged").eq(i).attr("class", "move-select charged " + chargedMove.type);
					
					$el.find(".move-bar").eq(i).show();
					$el.find(".move-bar").eq(i).find(".label").html(chargedMove.abbreviation);
					$el.find(".move-bar").eq(i).find(".bar").css("height","100%");
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
		}
	}
	
	// During timeline playback, animate the health bar
	
	this.animateHealth = function(amount){
		var health = Math.max(0, selectedPokemon.startHp - amount);
		
		$el.find(".hp .bar").css("width", ((health / selectedPokemon.stats.hp)*100)+"%");
		$el.find(".hp .stat").html(health+" / "+selectedPokemon.stats.hp);
	}
	
	// During timeline playback, animate the energy bar
	
	this.animateEnergy = function(index, amount){
		
		if(selectedPokemon.chargedMoves.length <= index){
			return;
		}
		
		var energy = selectedPokemon.startEnergy + amount;
		var $bar = $el.find(".move-bar").eq(index);
		
		$bar.find(".bar").css("height", ((energy / selectedPokemon.chargedMoves[index].energy)*100)+"%");
		
		if(energy >= selectedPokemon.chargedMoves[index].energy){
			$bar.addClass("active");
		} else{
			$bar.removeClass("active");
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
		
		isCustom = false;
		
		if(interface.resetSandbox){
			interface.resetSandbox();
		}
	}
	
	// Remove the currently selected Pokemon
	
	this.clear = function(){
		selectedPokemon = null;
		
		$el.find(".poke-stats").hide();
		$el.find(".poke-search").val('');
		$el.find(".start-hp").val('');
		$el.find(".start-energy").val('');
		$pokeSelect.find("option").first().prop("selected", "selected");
		
		isCustom = false;
	}
	
	// Manually set the selected Pokemon with a specific Pokemon
	
	this.setSelectedPokemon = function(poke){
		selectedPokemon = poke;
		$pokeSelect.find("option[value=\""+poke.speciesId+"\"]").prop("selected","selected");
		self.update();
	}
	
	// Set CP of the selected Pokemon, used in the team interface to circumvent the Battle class
	
	this.setCP = function(cp){
		
		if(!selectedPokemon){
			return;
		}
		
		selectedPokemon.initialize(cp);
		
		// Set an existing level and iv options
		
		$el.find("input.level").trigger("keyup");
		$el.find("input.iv").trigger("keyup");
		
		self.update();
	}
	
	// Returns the selected Pokemon object
	
	this.getPokemon = function(){
		return selectedPokemon;
	}
	
	// Sets a selected Pokemon given an Id
	
	this.setPokemon = function(id){
		$pokeSelect.find("option[value=\""+id+"\"]").prop("selected","selected");
		$pokeSelect.trigger("change");
	}
	
	// Update battle reference object with new instance
	
	this.setBattle = function(b){
		battle = b;
		
		if(selectedPokemon){
			selectedPokemon.setBattle(battle);
		}
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
	
	$pokeSelect.on("change", function(e){
		var id = $pokeSelect.find("option:selected").val();
		selectedPokemon = new Pokemon(id, index, battle);
		
		if($(".team-build").length == 0){
			battle.setNewPokemon(selectedPokemon, index);
		} else{
			selectedPokemon.initialize(battle.getCP());
		}

		var value = parseInt($el.find(".shield-select option:selected").val());
		
		selectedPokemon.setShields(value);
		
		self.reset();
		
		self.update();
	});
	
	// Select different move
	
	$el.find(".move-select").on("change", function(e){
		
		var moveId = $(this).find("option:selected").val();
		
		if($(this).hasClass("fast")){
			selectedPokemon.selectMove("fast", moveId, 0);
		} else if ($(this).hasClass("charged")){
			var i = $el.find(".move-select.charged").index($(this));
			selectedPokemon.selectMove("charged", moveId, i);
		}
		
		self.update();		
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

			if($(".team-build").length == 0){
				battle.setNewPokemon(selectedPokemon, index);
			} else{
				selectedPokemon.initialize(battle.getCP());
			}

			var value = parseInt($el.find(".shield-select option:selected").val());

			selectedPokemon.setShields(value);

			self.reset();

			self.update();
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
		
		if(interface.runSandboxSim){
			interface.runSandboxSim();
		}
	});
	
	// Enter starting energy
	
	$el.find(".start-energy").on("keyup change", function(e){
		
		var value = parseInt($el.find(".start-energy").val());
		
		selectedPokemon.setStartEnergy(value);
		
		self.update();
		
		if(interface.runSandboxSim){
			interface.runSandboxSim();
		}
	});
	
	// Toggle the advanced options drawer
	
	$el.find(".advanced-section a").on("click", function(e){
		e.preventDefault();
		$el.find(".advanced-section").toggleClass("active");
	});
	
	// Change level input
	
	$el.find("input.level").on("keyup", function(e){
		
		var value = parseFloat($el.find("input.level").val());
		
		if((value >= 1) && (value <=40) && (value % 0.5 == 0)){
			// Valid level
			
			selectedPokemon.setLevel(value);
		}
		
		isCustom = true;
		
		self.update();
	});
	
	// Change level input
	
	$el.find("input.iv").on("keyup", function(e){
		
		var value = parseFloat($(this).val());
		
		if((value >= 0) && (value <=15) && (value % 1 == 0)){
			// Valid level
			
			selectedPokemon.setIV($(this).attr("iv"), value);
		}
		
		isCustom = true;
		
		self.update();
	});
	
	// Change stat modifier input
	
	$el.find("input.stat-mod").on("keyup", function(e){
		
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
	});
	
	// Clear selection on click
	
	$el.find(".clear-selection").on("click", function(e){
		e.preventDefault();
		
		self.clear();
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