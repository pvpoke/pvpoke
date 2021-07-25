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

	var maxPokemonCount = 100;
	var selectedGroup = "";
	var selectedGroupType = "";
	var pokebox;
	var showIVs = false;

	var context = "";

	var settings = {
		shields: 1,
		ivs: "original",
		bait: true,
		levelCap: 50
	}

	var cliffhangerMode = false;

	this.init = function(pokes, b){
		pokemon = pokes;
		battle = b;
		interface = InterfaceMaster.getInstance();

		// Load groups from local storage
		var i = 0;

		while(window.localStorage.key(i) !== null){
			var key = window.localStorage.key(i);
			var content = window.localStorage.getItem(key);

			var groupRegex = new RegExp("([a-z_]*),([A-Z_]*),([A-Z_]*),([A-Z_]*)");

			if(groupRegex.test(content)){
				$el.find(".quick-fill-select").append("<option value=\""+key+"\" type=\"custom\">"+key+"</option>");
			}

			i++;
		}

		pokebox = new Pokebox($el.find(".pokebox"), self, "multi", b);
	}

	// Open Pokemon select modal window to add or edit a Pokemon

	this.openPokeSelect = function(index){

		selectedIndex = index;

		modalWindow("Select Pokemon", $(".poke.single").first());

		pokeSelector = new PokeSelect($(".modal .poke"), 1);
		pokeSelector.setContext("modal"+context);
		pokeSelector.init(gm.data.pokemon, battle);

		if(index == -1){
			// New Pokemon

			pokeSelector.clear();

			$(".modal-content").append("<div class=\"center\"><div class=\"save-poke button\">Add Pokemon</div></div>");


			if(interface.battleMode && interface.battleMode == "matrix"){
				$(".modal-content").append("<div class=\"center\"><div class=\"compare-poke button\">Add & Compare</div></div>");
			}



			$(".modal .poke-search").focus();
		} else{

			// Edit existing Pokemon

			pokeSelector.setSelectedPokemon(pokemonList[index]);

			$(".modal-content").append("<div class=\"center\"><div class=\"save-poke button\">Save Changes</div></div>");
		}

		// Add or save a Pokemon in the Pokemon list

		$(".modal .save-poke").on("click", function(e){

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

		// Add this Pokemon and other IV spreads

		$(".modal .compare-poke").on("click", function(e){

			// Make sure something's selected
			if(! pokeSelector){
				return false;
			}

			var pokemon = pokeSelector.getPokemon();

			if(! pokemon){
				return false;
			}

			pokemonList.push(pokemon);

			// Add multiple IV spreads of the same Pokemon
			var spreads = ["max"];

			if(battle.getCP() < 10000){
				spreads.push("def", "atk");
			}

			for(var i = 0; i < spreads.length; i++){
				var newPokemon = new Pokemon(pokemon.speciesId, 0, battle);
				newPokemon.initialize(false);

				newPokemon.selectMove("fast", pokemon.fastMove.moveId);

				if(pokemon.chargedMoves.length > 0){
					newPokemon.selectMove("charged", pokemon.chargedMoves[0].moveId, 0);
				}

				if(pokemon.chargedMoves.length > 1){
					newPokemon.selectMove("charged", pokemon.chargedMoves[1].moveId, 1);
				}

				newPokemon.setShadowType(pokemon.shadowType);
				newPokemon.levelCap = pokemon.levelCap;

				switch(spreads[i]){
					case "max":
						newPokemon.maximizeStat("overall");
						break;

					case "def":
						newPokemon.maximizeStat("def");
						break;

					case "atk":
						newPokemon.maximizeStat("atk");
						break;
				}

				pokemonList.push(newPokemon);
			}

			closeModalWindow();

			showIVs = true;

			$el.find(".check.show-ivs").addClass("on");

			self.updateListDisplay();

		});
	}


	// Display the selected Pokemon list

	this.updateListDisplay = function(){

		var context = interface.context;

		$el.find(".rankings-container").html('');

		// For Cliffhanger, calculate points
		var cliffObj;

		if(cliffhangerMode){
			cliffObj = self.calculateCliffhangerPoints();
		}

		for(var i = 0; i < pokemonList.length; i++){

			var pokemon = pokemonList[i];

			var $item = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\"><div class=\"name-container\"><span class=\"name\">"+pokemon.speciesName+"</span><span class=\"moves\"></span></div><div class=\"remove\"></div></div>");

			var moveList = [pokemon.fastMove];

			for(var n = 0; n < pokemon.chargedMoves.length; n++){
				moveList.push(pokemon.chargedMoves[n]);
			}

			for(var n = 0; n < moveList.length; n++){
				if(n > 0){
					$item.find(".moves").append(", ");
				}

				$item.find(".moves").append(moveList[n].displayName);
			}


			if(showIVs){
				$item.find(".moves").append("<br>Lvl "+pokemon.level+ " "+pokemon.ivs.atk+"/"+pokemon.ivs.def+"/"+pokemon.ivs.hp)
			}

			if(cliffhangerMode){
				$item.find(".name").prepend("<span class=\"cliffhanger-points\">"+pokemonList[i].cliffhangerPoints+"</span>");
			}

			if(battle.getCup().name == "continentals-3"){
				$item.find(".moves").prepend("(Slot " + pokemon.getContinentalSlot() + ") ");
			}

			// For Prismatic Cup, show color category

			if(battle.getCup().name == "prismatic" && context == "team"){
				var slots = battle.getCup().slots;

				for(var n = 0; n < slots.length; n++){
					if(slots[n].pokemon.indexOf(pokemon.speciesId) > -1){
						$item.find(".name").prepend("<span class=\"cliffhanger-points\">"+(n+1)+"</span>");
						break;
					}
				}
			}

			$el.find(".rankings-container").append($item);
		}

		if(! cliffhangerMode){
			$el.find(".section-title .poke-count").removeClass("error");
			$el.find(".section-title .poke-count").html(pokemonList.length);
			$el.find(".poke-max-count").html(maxPokemonCount);
		} else{
			$el.find(".section-title .poke-count").html(cliffObj.points);
			$el.find(".section-title .poke-max-count").html(cliffObj.max + " points");

			if(cliffObj.points > cliffObj.max){
				$el.find(".section-title .poke-count").addClass("error");
			} else{
				$el.find(".section-title .poke-count").removeClass("error");
			}
		}

		// Check team eligiblity

		$el.find(".team-warning").hide();

		if((context == "team")&&(pokemonList.length > 0)){
			// Check for any ineligible Pokemon
			var eligibleList =  gm.generateFilteredPokemonList(battle, battle.getCup().include, battle.getCup().exclude, false, false, false);

			for(var i = 0; i < pokemonList.length; i++){
				var speciesId = pokemonList[i].speciesId;
				var found = false;

				if((pokemonList[i].shadowType == "shadow")&&(speciesId.indexOf("_shadow") == -1)){
					speciesId += "_shadow";
				}

				for(var n = 0; n < eligibleList.length; n++){
					if(eligibleList[n].speciesId == speciesId){
						found = true;
						break;
					}
				}

				if(! found){
					$el.find(".rank").eq(i).addClass("warning");
					$el.find(".team-warning.ineligible").show();
				}
			}

			// For Labyrinth Cup, check there are no repeated types
			 if(battle.getCup().name == "labyrinth"){
				var usedTypes = [];
				var doubleTypes = [];

				// First, gather any double used types
				for(var i = 0; i < pokemonList.length; i++){
					if(usedTypes.indexOf(pokemonList[i].types[0]) > -1){
						doubleTypes.push(pokemonList[i].types[0]);
					}

					if(usedTypes.indexOf(pokemonList[i].types[1]) > -1){
						doubleTypes.push(pokemonList[i].types[1]);
					}

					if(usedTypes.indexOf(pokemonList[i].types[0]) > -1 || usedTypes.indexOf(pokemonList[i].types[1]) > -1){

						$el.find(".rank").eq(i).addClass("warning");
						$el.find(".team-warning.labyrinth").show();
					}

					usedTypes.push(pokemonList[i].types[0]);

					if(pokemonList[i].types[1] != "none"){
						usedTypes.push(pokemonList[i].types[1]);
					}
				}

				 // Mark Pokemon with double used types with a warning
				 for(var i = 0; i < pokemonList.length; i++){
					 if(doubleTypes.indexOf(pokemonList[i].types[0]) > -1 || doubleTypes.indexOf(pokemonList[i].types[1]) > -1){
						 $el.find(".rank").eq(i).addClass("warning");
						 $el.find(".team-warning.labyrinth").show();
					 }
				 }
			 }
		}

		if(pokemonList.length >= maxPokemonCount){
			$el.find(".add-poke-btn").hide();
			$el.find(".pokebox").hide();
		} else{
			$el.find(".add-poke-btn").show();
			$el.find(".pokebox").show();
		}

	}

	// After loading from the GameMaster, fill in a preset group

	this.quickFillGroup = function(data){
		pokemonList = [];

		for(var i = 0; i < data.length; i++){
			if(pokemonList.length >= maxPokemonCount){
				break;
			}

			var pokemon = new Pokemon(data[i].speciesId, 1, battle);
			pokemon.initialize(battle.getCP());
			pokemon.selectMove("fast", data[i].fastMove);

			for(var n = 0; n < 2; n++){

				if(n < data[i].chargedMoves.length){
					pokemon.selectMove("charged", data[i].chargedMoves[n], n);
				} else{
					pokemon.selectMove("charged", "none", 0);
				}

			}

			if(data[i].ivs){
				pokemon.setIV("atk", data[i].ivs[0]);
				pokemon.setIV("def", data[i].ivs[1]);
				pokemon.setIV("hp", data[i].ivs[2]);
			}

			if(data[i].level){
				pokemon.setLevel(data[i].level);
			}

			if(data[i].shadowType){
				pokemon.setShadowType(data[i].shadowType);
			}

			pokemonList.push(pokemon);
		}

		self.updateListDisplay();
	}

	// After loading from the GameMaster, fill in a preset group

	this.quickFillCSV = function(csv){

		var arr = csv.split('\n');

		pokemonList = [];

		var cp = battle.getCP();

		for(var i = 0; i < arr.length; i++){
			if(pokemonList.length >= maxPokemonCount){
				break;
			}

			var poke = arr[i].split(',');
			var pokeSettings = poke[0].split('-'); // Get the Pokemon ID and shadow type

			var pokemon = new Pokemon(pokeSettings[0].toLowerCase(), 1, battle);

			pokemon.initialize(cp);
			if(pokeSettings[1]){
				pokemon.setShadowType(pokeSettings[1]);
			}

			// Set moves

			pokemon.selectMove("fast", poke[1]);
			pokemon.selectMove("charged", poke[2], 0);
			pokemon.selectMove("charged", poke[3], 1);

			// Set first slot to none if both are none

			if((poke[2] == 'none')&&(poke[3] == 'none')){
				pokemon.selectMove("charged", poke[3], 0);
			}

			// Set any custom levels or ivs

			if(poke.length > 4){
				pokemon.isCustom = true;

				pokemon.setLevel(parseFloat(poke[4]));
				pokemon.setIV("atk", parseFloat(poke[5]));
				pokemon.setIV("def", parseFloat(poke[6]));
				pokemon.setIV("hp", parseFloat(poke[7]));
			}

			pokemonList.push(pokemon);
		}

		self.updateListDisplay();
	}

	// After loading from the GameMaster, fill in a preset group

	this.setPokemonList = function(list){
		pokemonList = list.slice(0, maxPokemonCount);
		self.updateListDisplay();
	}

	// Update the custom group selections when changing league

	this.setCP = function(cp){
		$el.find(".quick-fill-select option").hide();

		switch(cp){
			case 1500:
				// Show all except Ultra and Master
				$el.find(".quick-fill-select option").show();
				$el.find(".quick-fill-select option[value='ultra']").hide();
				$el.find(".quick-fill-select option[value='master']").hide();
				$el.find(".quick-fill-select option[value='premier']").hide();
				$el.find(".quick-fill-select option[value='little']").hide();
				break;

			case 2500:
				$el.find(".quick-fill-select option[value='ultra']").show();
				$el.find(".quick-fill-select option[type='ultra']").show();
				break;

			case 10000:
				$el.find(".quick-fill-select option[value='master']").show();
				$el.find(".quick-fill-select option[type='master']").show();
				break;

			case 500:
				$el.find(".quick-fill-select option[value='little']").show();
				$el.find(".quick-fill-select option[type='little']").show();
				break;
		}

		$el.find(".quick-fill-select option[type='custom']").show();

		battle.setCP(cp);

		// Set all Pokemon to the new CP limit
		for(var i = 0; i < pokemonList.length; i++){
			pokemonList[i].setBattle(battle);
			pokemonList[i].initialize(cp, settings.defaultIVs);
		}

		if(pokemonList.length > 0){
			self.updateListDisplay();
		}
	}

	// Update the custom group selections when changing league

	this.setLevelCap = function(levelCap){
		battle.setLevelCap(levelCap);

		// Set all Pokemon to the new level cap
		for(var i = 0; i < pokemonList.length; i++){
			pokemonList[i].setLevelCap(levelCap);
			pokemonList[i].setBattle(battle);
			pokemonList[i].initialize(battle.getCP(), settings.defaultIVs);
		}

		if(pokemonList.length > 0){
			self.updateListDisplay();
		}

		settings.levelCap = levelCap;
	}

	// Convert the current Pokemon list into exportable and savable JSON

	this.convertListToJSON = function(){
		var arr = [];

		for(var i = 0; i < pokemonList.length; i++){
			var obj = {
				speciesId: pokemonList[i].speciesId,
				fastMove: pokemonList[i].fastMove.moveId,
				chargedMoves: []
			};

			for(var n = 0; n < pokemonList[i].chargedMoves.length; n++){
				obj.chargedMoves.push(pokemonList[i].chargedMoves[n].moveId);
			}

			if(pokemonList[i].shadowType != "normal"){
				obj.shadowType = pokemonList[i].shadowType;
			}

			if(pokemon.isCustom){
				obj.level = pokemon.level;
				obj.ivs = [pokemon.ivs.atk, pokemon.ivs.def, pokemon.ivs.hp];
			}

			arr.push(obj);
		}

		return JSON.stringify(arr);
	}

	// Convert the current Pokemon list into exportable and savable JSON

	this.convertListToCSV = function(){
		var arr = [];

		var csv = '';

		for(var i = 0; i < pokemonList.length; i++){

			if(i > 0){
				csv += '\n';
			}

			csv += pokemonList[i].speciesId;

			if(pokemonList[i].shadowType != "normal"){
				csv += "-" + pokemonList[i].shadowType;
			}

			csv += ',' + pokemonList[i].fastMove.moveId;

			for(var n = 0; n < pokemonList[i].chargedMoves.length; n++){
				csv += ',' + pokemonList[i].chargedMoves[n].moveId
			}

			for(var n = 0; n < 2 - pokemonList[i].chargedMoves.length; n++){
				csv += ',none';
			}

			if(pokemonList[i].isCustom){
				csv += ',' + pokemonList[i].level + ',' + pokemonList[i].ivs.atk + ',' + pokemonList[i].ivs.def + ',' + pokemonList[i].ivs.hp
			}
		}

		return csv;
	}

	// Given a name, save current list to a cookie

	this.saveCustomList = function(name, isNew){
		var csv = self.convertListToCSV();

		if(name == ''){
			return;
		}

		window.localStorage.setItem(name, csv);

		if(! isNew){
			modalWindow("Custom Group Saved", $("<p><b>"+name+"</b> has been updated.</p>"))
		} else{
			// Add new group to all dropdowns

			$(".quick-fill-select").append($("<option value=\""+name+"\" type=\"custom\">"+name+"</option>"));
			$el.find(".quick-fill-select option").last().prop("selected", "selected");

			$el.find(".save-as").hide();
			$el.find(".save-custom").show();
			$el.find(".delete-btn").show();
		}
	}

	// Set the maximum number of selectable pokemon

	this.setMaxPokemonCount = function(val){
		maxPokemonCount = val;
		pokemonList = pokemonList.splice(0, maxPokemonCount);
		$el.find(".poke-max-count").html(maxPokemonCount);
		self.updateListDisplay();
	}

	// Set cliffhanger mode to true or false

	this.setCliffhangerMode = function(val){
		cliffhangerMode = val;

		self.updateListDisplay();
	}

	// Calculate a team's cliffhanger points, returns object with current points, maximum allowed, and tiers

	this.calculateCliffhangerPoints = function(){
		var tiers = battle.getCup().tierRules.tiers;
		var max = battle.getCup().tierRules.max;
		var floor = battle.getCup().tierRules.floor;
		var points = 0;

		for(var i = 0; i < pokemonList.length; i++){
			pokemonList[i].cliffhangerPoints = gm.getPokemonTier(pokemonList[i].speciesId, battle.getCup());
			points += pokemonList[i].cliffhangerPoints;
		}

		return {points: points, max: max, floor: floor, tiers: battle.getCup().tierRules.tiers};
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

		if(pokemonList.length < maxPokemonCount){
			self.openPokeSelect(-1);
		}
	});

	// Click a Pokemon in the list to edit

	$el.on("click", ".rankings-container .rank", function(e){

		// Don't open if clicking the remove button

		if($(this).find(".remove:hover").length > 0){
			return;
		}

		var index = $el.find(".rankings-container .rank").index($(this));

		self.openPokeSelect(index);
	});

	// Bring up the modal window to remove a Pokemon

	$el.on("click", ".rankings-container .remove", function(e){

		selectedIndex = $el.find(".rankings-container .rank").index($(this).closest(".rank"));

		modalWindow("Remove Pokemon", $(".remove-poke-confirm").first());

		$(".modal .name").html(pokemonList[selectedIndex].speciesName);


		// Confirm to remove Pokemon

		$(".modal .remove-poke-confirm .yes").click(function(e){
			pokemonList.splice(selectedIndex, 1);
			self.updateListDisplay();
			closeModalWindow();
		});
	});

	// Select a quick fill group

	$el.find(".quick-fill-select").change(function(e){
		var val = $(this).find("option:selected").val();
		var type = $(this).find("option:selected").attr("type");

		// Load a preset group from data files

		if((type != "custom")&&(val != "new")){
			gm.loadGroupData(self, val);

			// Show the save as button

			$el.find(".save-as").show();
			$el.find(".save-custom").hide();
			$el.find(".delete-btn").hide();
		}

		// Create a new group

		if(val == "new"){
			pokemonList = [];

			self.updateListDisplay();

			// Show the save button

			$el.find(".save-as").hide();
			$el.find(".save-custom").show();
			$el.find(".delete-btn").hide();
		}

		// Populate from a custom group

		if(type == "custom"){
			var data = window.localStorage.getItem(val);
			self.quickFillCSV(data);

			// Show the save and delete buttons

			$el.find(".save-as").hide();
			$el.find(".save-custom").show();
			$el.find(".delete-btn").show();
		}

		selectedGroup = val;
		selectedGroupType = type;

	});

	// Open the import/export window

	$el.find(".export-btn").click(function(e){
		modalWindow("Import/Export Custom Group", $(".list-export").eq(0));

		var csv = self.convertListToCSV();

		$(".modal .list-text").html(csv);


		// Copy list text

		$(".modal .list-export .copy").click(function(e){
			var el = $(e.target).prev()[0];
			el.focus();
			el.setSelectionRange(0, el.value.length);
			document.execCommand("copy");
		});

		// Import list text

		$(".modal .button.import").on("click", function(e){
			var data = $(".modal textarea.list-text").val();

			self.quickFillCSV(data);

			closeModalWindow();
		});
	});

	// Open the save window

	$el.find(".save-btn").click(function(e){

		var selectedGroupType = $(".quick-fill-select option[value='"+selectedGroup+"']").attr("type");

		if(selectedGroupType != "custom"){
			// Prompt to save a new group if a custom one isn't selected
			modalWindow("Save Group", $(".save-list").eq(0));

			// Add a property to the modal window to identify the index of this selector
			$(".modal .save-list").attr("selector-index", $(".poke.multi").index($el));
		} else{
			self.saveCustomList(selectedGroup, false);
		}

	});

	// Save data to cookie

	$("body").on("click", ".modal .button.save", function(e){

		// If the save list is for this selector, save it

		if($(".modal .save-list").attr("selector-index") == $(".poke.multi").index($el)){
			self.saveCustomList($(".modal input.list-name").val(), true);

			closeModalWindow();
		}
	});

	// Open the delete group window

	$el.find(".delete-btn").click(function(e){
		var name = $el.find(".quick-fill-select option:selected").html();

		modalWindow("Delete Group", $(".delete-list-confirm").first());

		$(".modal .name").html(name);


		// Trigger for deleting group cookie

		$(".modal .delete-list-confirm .button.yes").click(function(e){

			window.localStorage.removeItem(selectedGroup);

			closeModalWindow();

			// Remove option from quick fill selects

			$el.find(".quick-fill-select option[value='"+selectedGroup+"']").remove();
			$el.find(".quick-fill-select option").first().prop("selected", "selected");
			$el.find(".quick-fill-select").trigger("change");
		});
	});

	// Clear all selections

	$el.find(".clear-selection").click(function(e){
		e.preventDefault();

		modalWindow("Clear Custom Group", $(".multi-clear-confirm").first());

		$(".modal .yes").click(function(e){
			pokemonList = [];
			self.updateListDisplay();
			$el.find(".quick-fill-select option").first().prop("selected", "selected");

			closeModalWindow();
		});
	});

	// Change shield settings

	$el.find(".shield-select").on("change", function(e){
		settings.shields = parseInt($el.find(".shield-select option:selected").val());
	});

	// Change IV settings

	$el.find(".default-iv-select").on("change", function(e){
		settings.ivs = $el.find(".default-iv-select option:selected").val();
	});

	// Change bait toggle

	$el.find(".check.shield-baiting").on("click", function(e){
		settings.bait = (! settings.bait == true);
	});

	// Change level cap

	$el.find(".pokemon-level-cap-select").on("change", function(e){
		settings.levelCap = parseInt($el.find(".pokemon-level-cap-select option:selected").val());
	});

	// Show or hide IV's

	$el.find(".check.show-ivs").on("click", function(e){
		showIVs = (! showIVs == true);

		self.updateListDisplay();
	});

	// Event handler for changing the format select

	$el.find(".format-select").on("change",function(e){
		self.changeFormatSelect();
	});

	this.changeFormatSelect = function(){
		var format = $(".format-select option:selected").val();
		var cup = $(".format-select option:selected").attr("cup");

		$(".cup-select option").hide();
		$(".cup-select option[cat=\""+format+"\"]").show();

		if(cup){
			$(".cup-select option[value=\""+cup+"\"]").prop("selected", true);
		} else{
			$(".cup-select option[cat=\""+format+"\"]").eq(0).prop("selected", true);
		}

		$(".cup-select").change();

		if((format == "all")||(cup)){
			$(".cup-select").hide();
		} else{
			$(".cup-select").show();
		}
	}

	this.setBaitSetting = function(val){
		settings.bait = val;
	}

	// Return the list of selected Pokemon

	this.getPokemonList = function(){
		return pokemonList;
	}

	// Return the id of the selected custom group

	this.getSelectedGroup = function(){
		return selectedGroup;
	}

	// Return the type of the selected group

	this.getSelectedGroupType = function(){
		return selectedGroupType;
	}

	// Return the current option setings

	this.getSettings = function(){
		return settings;
	}

	// Set the context for this multiselector

	this.setContext = function(val){
		context = val;
	}

	// Return the number of remaining spots

	this.getAvailableSpots = function(){
		return maxPokemonCount - pokemonList.length;
	}

	// Force a group selection

	this.selectGroup = function(id){
		$el.find(".quick-fill-select option[value='"+id+"']").prop("selected", "selected");
		$el.find(".quick-fill-select").trigger("change");
	}
}
