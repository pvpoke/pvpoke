/*
 * Funtionality for the Pokemon selection interface, for Pokemon groups.
 * This file is dependent on a few others: PokeSelect.js and ModalWindow.js
 */

function PokeMultiSelect(element){
	var $el = element;
	var $input = $el.find("input");
	var gm = GameMaster.getInstance();
	var pokemon = [];
	var pokemonList = [];
	var self = this;
	var interface;
	var battle;
	
	var selectedIndex = -1;
	var pokeSelector;
	
	this.init = function(pokes, b){
		pokemon = pokes;
		battle = b;
		interface = InterfaceMaster.getInstance();
	}
	
	// Open Pokemon select modal window to add or edit a Pokemon
	
	this.openPokeSelect = function(index){
		
		selectedIndex = index;
		
		modalWindow("Select Pokemon", $(".poke").first());
		
		pokeSelector = new PokeSelect($(".modal .poke"), 1);
		pokeSelector.init(pokemon, battle);
		
		if(index == -1){
			// New Pokemon
			
			pokeSelector.clear();
			
			$(".modal-content").append("<div class=\"center\"><div class=\"save-poke button\">Add Pokemon</div></div>");
		} else{
			
			// Edit existing Pokemon
			
			pokeSelector.setSelectedPokemon(pokemonList[index]);
			
			$(".modal-content").append("<div class=\"center\"><div class=\"save-poke button\">Save Changes</div></div>");
		}
		
	}
	
	// Display the selected Pokemon list
	
	self.updateListDisplay = function(){
		
		$el.find(".rankings-container").html('');
		
		for(var i = 0; i < pokemonList.length; i++){

			var pokemon = pokemonList[i];

			var $item = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\"><div class=\"name-container\"><span class=\"name\">"+pokemon.speciesName+"</span><span class=\"moves\"></span></div><div class=\"remove\"></div></div>");
			
			var moveList = [pokemon.fastMove];
			
			for(var n = 0; n < pokemon.chargedMoves.length; n++){
				moveList.push(pokemon.chargedMoves[n]);
			}
			
			for(var n = 0; n < moveList.length; n++){
				// Code for move icons, but I think the move names work better for readability
				
				// $item.find(".moves").append("<div class=\"move " + moveList[n].type + "\">"+moveList[n].name+"</div>");
				
				if(n > 0){
					$item.find(".moves").append(", ");
				}
				
				$item.find(".moves").append(moveList[n].name);
			}

			$el.find(".rankings-container").append($item);
		}
		
	}
	
	// After loading from the GameMaster, fill in a preset group
	
	self.quickFillGroup = function(data){
		
		pokemonList = [];
		
		for(var i = 0; i < data.length; i++){
			var pokemon = new Pokemon(data[i].speciesId, 1, battle);
			pokemon.selectMove("fast", data[i].fastMove);
			
			for(var n = 0; n < data[i].chargedMoves.length; n++){
				pokemon.selectMove("charged", data[i].chargedMoves[n], n);
			}
			
			pokemonList.push(pokemon);
		}
		
		self.updateListDisplay();
	}
	
	// Show or hide custom options when changing the cup select
	
	$el.find(".cup-select").change(function(e){
		if($(this).find("option:selected").val() == "custom"){
			$(".custom-options").show();
			$(".charged-count-select").hide();
		} else{
			$(".custom-options").hide();
			$(".charged-count-select").show();
		}
	});
	
	// Click the add new Pokemon button
	
	$el.find(".add-poke-btn").click(function(e){
		self.openPokeSelect(-1);
	});
	
	// Click a Pokemon in the list to edit
	
	$("body").on("click", ".poke.multi .rankings-container .rank", function(e){
		
		// Don't open if clicking the remove button
		
		if($(this).find(".remove:hover").length > 0){
			return;
		}
		
		var index = $el.find(".rankings-container .rank").index($(this));
		
		self.openPokeSelect(index);
	});
	
	// Add or save a Pokemon in the Pokemon list
	
	$("body").on("click", ".modal .save-poke", function(e){
		
		// Make sure something's selected
		if(! pokeSelector){
			return false;
		}		
		
		var pokemon = pokeSelector.getPokemon();
		
		if(! pokemon){
			return false;
		}
		
		if(selectedIndex == -1){
			// Add new Pokemon to list
			
			pokemonList.push(pokemon);
			
		} else{
			pokemonList[selectedIndex] = pokemon;
		}
		
		closeModalWindow();
		
		self.updateListDisplay();
		
	});
	
	
	// Bring up the modal window to remove a Pokemon
	
	$("body").on("click", ".poke.multi .rankings-container .remove", function(e){
		
		selectedIndex = $el.find(".rankings-container .rank").index($(this).closest(".rank"));
		
		modalWindow("Remove Pokemon", $(".remove-poke-confirm"));
		
		$(".modal .name").html(pokemonList[selectedIndex].speciesName);
	});
	
	// Confirm to remove Pokemon
	
	$("body").on("click", ".modal .remove-poke-confirm .yes", function(e){
		pokemonList.splice(selectedIndex, 1);
		self.updateListDisplay();
		closeModalWindow();
	});
	
	// Decline confirmation
	
	$("body").on("click", ".modal .no", function(e){
		closeModalWindow();
	});
	
	// Select a quick fill group
	
	$el.find(".quick-fill-select").change(function(e){
		var val = $(this).find("option:selected").val();
		
		// Load a preset group from data files
		
		if(val.indexOf("custom") == -1){
			gm.loadGroupData(self, val);
		}
	});
	
	// Return the list of selected Pokemon
	
	this.getPokemonList = function(){
		return pokemonList;
	}
}