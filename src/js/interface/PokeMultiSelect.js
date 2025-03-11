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

	var filterMode = "meta";

	var multiSettings = getDefaultMultiBattleSettings();

	var cliffhangerMode = false;

	var showMoveCounts = false;

	// Show move counts if previously set
	if(window.localStorage.getItem("rankingsShowMoveCounts") == "true"){
		$el.find(".check.show-move-counts").addClass("on");
		$el.find(".rankings-container").toggleClass("show-move-counts");
		showMoveCounts = true;
	}

	this.init = function(pokes, b){
		pokemon = pokes;
		battle = b;
		interface = InterfaceMaster.getInstance();

		// Add quick fill lists for current cups
		var formats = gm.data.formats;
		for(var i = 0; i < formats.length; i++){
			if(formats[i].showMeta){
				var $meta = $("<option>"+formats[i].title+" Meta</option>");
				$meta.attr("value", formats[i].meta);

				var leagueName = "";

				switch(formats[i].cp){
					case 500:
					leagueName = "little";
					break;

					case 1500:
					leagueName = "great";
					break;

					case 2500:
					leagueName = "ultra";
					break;

					case 10000:
					leagueName = "master";
					break;
				}

				$meta.attr("type", leagueName);
				$meta.addClass("multi-battle");

				if(leagueName != "great"){
					$meta.addClass("hide");
				}

				$el.find(".quick-fill-select").append($meta);
			}
		}

		// Load groups from local storage
		var i = 0;

		while(window.localStorage.key(i) !== null){
			var key = window.localStorage.key(i);
			var content = window.localStorage.getItem(key);

			var groupRegex = new RegExp("([a-z_]*),([A-Z_]*),([A-Z_]*),([A-Z_]*)");

			if((groupRegex.test(content))&&(key.indexOf("criteo") == -1)){
				$el.find(".quick-fill-select").append("<option value=\""+key+"\" type=\"custom\">"+key+"</option>");
			}

			i++;
		}

		pokebox = new Pokebox($el.find(".pokebox"), self, "multi", b);
	}

	// Open Pokemon select modal window to add or edit a Pokemon

	this.openPokeSelect = function(index, focusName){
		focusName = typeof focusName !== 'undefined' ? focusName : true;

		selectedIndex = index;

		modalWindow("Select Pokemon", $(".hide .poke.single").first());

		pokeSelector = new PokeSelect($(".modal .poke"), 1);
		pokeSelector.setContext("modal"+context);
		pokeSelector.init(gm.data.pokemon, battle);

		if(index == -1){
			// New Pokemon

			pokeSelector.clear();

			$(".modal-content").append("<div class=\"center\"><div class=\"save-poke button\">Add Pokemon</div></div>");


			if(interface.battleMode && interface.battleMode == "matrix"){
				$(".modal-content").append("<div class=\"center\"><a href=\"#\" class=\"compare-poke\">Add & Compare</a></div>");
			}

			if(parseInt(settings.pokeboxId) > 0){
				$(".modal-content").append("<div class=\"center\"><a href=\"#\" class=\"compare-pokebox\">Add & Compare<br>from Pokebox</a></div>");
			}

			if(focusName){
				$(".modal .poke-search").focus();
			}
		} else{

			// Edit existing Pokemon

			pokeSelector.setSelectedPokemon(pokemonList[index]);

			$(".modal-content").append("<div class=\"center\"><div class=\"save-poke button\">Save Changes</div></div>");

			if(interface.battleMode && interface.battleMode == "matrix"){
				$(".modal-content").append("<div class=\"center\"><a href=\"#\" class=\"duplicate-poke\">Duplicate</a></div>");
			}

		}

		// Show custom rankings options for moveset overrides
		if(context == "customrankingsoverrides"){
			$(".modal .poke .custom-ranking-options").show();
		}

		// Add or save a Pokemon in the Pokemon list

		$(".modal .save-poke").on("click", function(e){

			// Make sure something's selected
			if(! pokeSelector){
				return false;
			}

			var pokemon = pokeSelector.getPokemon();
			var scrollToBottom = false;

			if(! pokemon){
				return false;
			}

			if(selectedIndex == -1){
				// Add new Pokemon to list

				pokemonList.push(pokemon);
				scrollToBottom = true;
			} else{
				pokemonList[selectedIndex] = pokemon;
			}

			closeModalWindow();

			self.updateListDisplay();

			if(scrollToBottom){
				$el.find(".rankings-container").scrollTop($el.find(".rankings-container").eq(0).prop("scrollHeight"));
			}
		});

		// Add this Pokemon and other IV spreads

		$(".modal .compare-poke").on("click", function(e){
			e.preventDefault();

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

		// Add a copy of this Pokemon to the multiselector

		$(".modal .duplicate-poke").on("click", function(e){
			e.preventDefault();

			// Make sure something's selected
			if(! pokeSelector){
				return false;
			}

			var pokemon = pokeSelector.getPokemon();

			if(! pokemon){
				return false;
			}

			// Duplicate Pokemon

			if((selectedIndex > -1) && (pokemonList.length < maxPokemonCount)){
				var newPokemon = new Pokemon(pokemon.speciesId, 0, battle);

				newPokemon.selectMove("fast", pokemon.fastMove.moveId);
				newPokemon.autoLevel = false;

				if(pokemon.chargedMoves.length > 0){
					newPokemon.selectMove("charged", pokemon.chargedMoves[0].moveId, 0);
				}

				if(pokemon.chargedMoves.length > 1){
					newPokemon.selectMove("charged", pokemon.chargedMoves[1].moveId, 1);
				}

				newPokemon.setShadowType(pokemon.shadowType);
				newPokemon.levelCap = pokemon.levelCap;
				newPokemon.setLevel(pokemon.level);
				newPokemon.setIV("atk", pokemon.ivs.atk);
				newPokemon.setIV("def", pokemon.ivs.def);
				newPokemon.setIV("hp", pokemon.ivs.hp);

				pokemonList.splice(selectedIndex, 0, newPokemon);
			}

			closeModalWindow();

			self.updateListDisplay();

		});

		// Add Pokemon and all matching Pokemon from Pokebox

		$(".modal .compare-pokebox").on("click", function(e){
			e.preventDefault();

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
			pokebox.loadPokebox(false, self.addPokemonFromPokebox, pokemon.speciesId);

		});


		// Keyboard shortcuts for entering a Pokemon

		$(".modal .poke-search").keypress(function(e){

			if(e.which == 13){
				// Open Pokeselect for first visible Pokemon
				$(".modal .button.save-poke").trigger("click");

				$el.find(".add-poke-btn").focus();
			}
		});
	}

	this.addPokemonFromPokebox = function(box){
		pokemonList = pokemonList.concat(box);

		closeModalWindow();

		showIVs = true;

		$el.find(".check.show-ivs").addClass("on");

		self.updateListDisplay();
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

			var $item = $("<div class=\"rank button-highlight " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\"><div class=\"name-container\"><span class=\"name\"><span class=\"number\">"+(i+1)+".</span>"+pokemon.speciesName+"</span><span class=\"moves\"></span></div><div class=\"remove\"></div></div>");

			var moveList = [pokemon.fastMove];

			for(var n = 0; n < pokemon.chargedMoves.length; n++){
				moveList.push(pokemon.chargedMoves[n]);
			}

			for(var n = 0; n < moveList.length; n++){
				if(n > 0){
					$item.find(".moves").append(", ");
				}

				var moveNameStr = moveList[n].displayName;

				if(moveList[n].energyGain > 0){
					moveNameStr += "<span class=\"count fast\">"+(moveList[n].cooldown / 500)+"</span>";
				} else{
					var moveCounts = Pokemon.calculateMoveCounts(pokemon.fastMove, moveList[n]);
					var moveCount = moveCounts[0];

					if(moveCounts[0] > moveCounts[1]){
						moveCount+="-";
					}

					if(moveCounts[2] < moveCounts[1] && moveCounts[1] == moveCounts[0]){
						moveCount+=".";
					}

					moveNameStr += "<span class=\"count\">"+moveCount+"</span>";
				}


				$item.find(".moves").append(moveNameStr);
			}


			if(showIVs){
				$item.find(".moves").append("<br>Lvl "+pokemon.level+ " "+pokemon.ivs.atk+"/"+pokemon.ivs.def+"/"+pokemon.ivs.hp)
			}

			if(cliffhangerMode){
				$item.find(".name").prepend("<span class=\"cliffhanger-points\">"+pokemonList[i].cliffhangerPoints+"</span>");
			}

			if(battle.getCup().slots){
				$item.find(".moves").prepend("(Slot " + (pokemon.getSlot(battle.getCup())+1) + ") ");
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
			// Check the rankings for any ineligible Pokemon
			var key = battle.getCup().name + "overall" + battle.getCP();

			if(gm.rankings[key]){
				var eligibleList = gm.rankings[key];

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
			}
		}

		// Show or hide sort button
		if(pokemonList.length > 0){
			$el.find("a.custom-group-sort").css("visibility", "visible");
			$el.find(".check.show-move-counts").css("visibility", "visible");
		} else{
			$el.find("a.custom-group-sort").css("visibility", "hidden");
			$el.find(".check.show-move-counts").css("visibility", "hidden");
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

			if(data[i].weight !== undefined){
				pokemon.rankingWeight = data[i].weight;
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

			if(pokemon.initialize){
				pokemon.initialize(cp);
				if(pokeSettings[1]){
					pokemon.setShadowType(pokeSettings[1]);
				}

				if(poke.length > 1){
					// Set moves

					pokemon.selectMove("fast", poke[1]);
					pokemon.selectMove("charged", poke[2], 0);
					pokemon.selectMove("charged", poke[3], 1);

					// Set first slot to none if both are none

					if((poke[2] == 'none')&&(poke[3] == 'none')){
						pokemon.selectMove("charged", poke[3], 0);
					}

				} else{
					// Select recommended moves
					pokemon.selectRecommendedMoveset();
				}
				// Set any custom levels or ivs

				if(poke.length > 4){
					pokemon.isCustom = true;

					const level = parseFloat(poke[4]);
					const atk = parseFloat(poke[5]);
					const def = parseFloat(poke[6]);
					const hp = parseFloat(poke[7]);

					// Don't set stats to be NaN
					if (Number.isNaN(level) || Number.isNaN(atk) || Number.isNaN(def) || Number.isNaN(hp)) {
						// Ignoring the alert here since 3rd party imports may not have IVs/Level
						// alert("Line " + (i+1) + " has invalid stats: \"" + poke + "\".");
					} else {
						pokemon.setLevel(level);
						pokemon.setIV("atk", atk);
						pokemon.setIV("def", def);
						pokemon.setIV("hp", hp);
					}
				}

				pokemonList.push(pokemon);
			}
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
		// only show quick fill metas with same cp as selected
		const leagueMap = {"little": 500, "great": 1500, "ultra": 2500, "master": 10000}
		$el.find(".quick-fill-select option").each(function(index, element) {
			element = $(element);
			// always show custom groups (from cookies) and create new group
			if (element.attr("type") === "custom" || element.attr("value") === "new") {
				element.show();
				return;
			}
			var optionCP = leagueMap[element.attr("type")];
			if (optionCP == cp) {
				element.show();
			} else {
				element.hide();
			}
		});
		// Load default meta group when switching to Multi Battle
		if((self.battleMode == "multi") && (! settingGetParams)){
			cupSelect.trigger("change");
		}

		battle.setCP(cp);

		// Set all Pokemon to the new CP limit
		for(var i = 0; i < pokemonList.length; i++){
			pokemonList[i].setBattle(battle);
			pokemonList[i].initialize(cp, multiSettings.defaultIVs);
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
			pokemonList[i].initialize(battle.getCP(), multiSettings.defaultIVs);
		}

		if(pokemonList.length > 0){
			self.updateListDisplay();
		}

		multiSettings.levelCap = levelCap;
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

	// Returns the currently selected filter mode

	this.getFilterMode = function(){
		return filterMode;
	}

	// Returns the currently selected filter mode

	this.setFilterMode = function(val){
		$el.find(".form-group.filter-picker .option").removeClass("on");
		$el.find(".form-group.filter-picker .option[value=\""+val+"\"]").addClass("on");
		filterMode = val;
	}

	// Externally select the number of shields

	this.setShields = function(value){
		$el.find(".shield-picker .option[value="+value+"]").trigger("click");
	}

	// Show or hide custom options when changing the cup select

	$el.find(".cup-select").change(function(e){
		var cup = $(this).find("option:selected").val();

		if(cup == "custom"){
			$(".custom-options").show();
			$(".multi-battle-options").hide();
			$(".charged-count-select").hide();
		} else{
			$(".custom-options").hide();
			$(".charged-count-select").show();
			$(".multi-battle-options").show();

			// Load meta group for selected format
			var metaGroup = $(this).find("option:selected").attr("meta-group"+battle.getCP());
			self.selectGroup(metaGroup);
		}
	});

	// Click the add new Pokemon button

	$el.find(".add-poke-btn").click(function(e, focusName){
		focusName = typeof focusName !== 'undefined' ? focusName : true;

		if(pokemonList.length < maxPokemonCount){
			self.openPokeSelect(-1, focusName);
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

	// Select an option from the form section

	$el.find(".form-group .check").on("click", function(e){
		$(e.target).closest(".check").parent().find(".check").removeClass("on");
	});

	// Change a form option

	$el.find(".form-group.filter-picker .option").on("click", function(e){
		filterMode = $(e.target).attr("value");
		console.log(filterMode);
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
			var el = $(e.target).parent().prev()[0];
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

		// Display export in JSON format

		$(".modal a.json").on("click", function(e){
			e.preventDefault();

			$(".modal .list-text").html(self.convertListToJSON());
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

	// Select an option from the form section

	$el.find(".form-group .option").on("click", function(e){
		$(e.target).closest(".form-group").find(".option").removeClass("on");
		$(e.target).closest(".option").addClass("on");
	});

	// Change shield settings

	$el.find(".shield-picker .option").on("click", function(e){
		var value = parseInt($(e.target).closest(".option").attr("value"));

		multiSettings.shields = value;
	});

	// Change IV settings

	$el.find(".default-iv-select").on("change", function(e){
		multiSettings.ivs = $el.find(".default-iv-select option:selected").val();

		// Adjust IVs as needed
		switch(multiSettings.ivs){
			case "overall":
			case "atk":
			case "def":
			for(var i = 0; i < pokemonList.length; i++){
				pokemonList[i].maximizeStat(multiSettings.ivs);
			}
			break;

			case "gamemaster":
			for(var i = 0; i < pokemonList.length; i++){
				pokemonList[i].levelCap = 50;
				pokemonList[i].isCustom = false;
				pokemonList[i].initialize(battle.getCP());
				if(pokemonList[i].baitShields != 1){
					pokemonList[i].isCustom = true;
				}
			}
			break;

			case "buddy":
			for(var i = 0; i < pokemonList.length; i++){
				pokemonList[i].levelCap = 51;
				pokemonList[i].maximizeStat("overall");
			}
			break;
		}

		modalWindow("IV's Applied", $("<p>The Pokemon in this group have been updated to <b>"+$el.find(".default-iv-select option:selected").html()+"</b>.</p>"));

		$el.find(".default-iv-select option").eq(0).prop("selected", "selected");

		if(battle.getCup().name != "custom"){
			$el.find(".cup-select").find("option[value=\"custom\"]").prop("selected", "selected");
			$el.find(".cup-select").trigger("change");
		}

		if(! showIVs){
			showIVs = true;
			$el.find(".check.show-ivs").addClass("on");
		}

		self.updateListDisplay();
	});

	// Change bait toggle

	$el.find(".bait-picker .option").on("click", function(e){
		multiSettings.bait = parseInt($(e.target).attr("value"));
	});

	// Change level cap

	$el.find(".pokemon-level-cap-select").on("change", function(e){
		multiSettings.levelCap = parseInt($el.find(".pokemon-level-cap-select option:selected").val());
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

	// Open the sort modal window and handle group sorting

	$el.find("a.custom-group-sort").on("click",function(e){
		e.preventDefault();

		modalWindow("Sort Group", $(".sort-group").first());

		$(".modal .name").click(function(e){
			// Sort alphabetically

			pokemonList.sort((a,b) => (a.speciesId > b.speciesId) ? 1 : ((b.speciesId > a.speciesId) ? -1 : 0));
			self.updateListDisplay();

			closeModalWindow();
		});

		$(".modal .attack").click(function(e){
			// Sort by Attack stats

			pokemonList.sort((a,b) => (a.stats.atk > b.stats.atk) ? -1 : ((b.stats.atk > a.stats.atk) ? 1 : 0));
			self.updateListDisplay();

			closeModalWindow();
		});

		$(".modal .defense").click(function(e){
			// Sort by Defense stats

			pokemonList.sort((a,b) => (a.stats.def > b.stats.def) ? -1 : ((b.stats.def > a.stats.def) ? 1 : 0));
			self.updateListDisplay();

			closeModalWindow();
		});
	});

	this.setBaitSetting = function(val){
		$el.find(".form-group.bait-picker .option[value=\""+val+"\"]").trigger("click");
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
		return multiSettings;
	}

	// Set settings provided a setting object

	this.setSettingsFromGet = function(obj){
		// Map values to settings object

		$el.find("input.start-hp").val(obj.startHp * 100);
		$el.find("input.start-hp").trigger("change");

		$el.find("input.start-energy").val(obj.startEnergy);
		$el.find("input.start-energy").trigger("change");

		$el.find("input.stat-mod").eq(0).val(obj.startStatBuffs[0]);
		$el.find("input.stat-mod").eq(1).val(obj.startStatBuffs[1]);
		$el.find("input.stat-mod").trigger("change");

		if(obj.startCooldown == 1000){
			$el.find(".check.switch-delay").trigger("click");
		}

		if(obj.optimizeMoveTiming == 0){
			$el.find(".check.optimize-timing").trigger("click");
		}
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

	// Open the search string generation window

	$el.find(".search-string-btn").click(function(e){
		var showHP = true;
		var showCP = true;
		var showRegion = false;

		modalWindow("Search String", $(".search-string-window").eq(0));

		self.generateSearchString(showHP, showCP, showRegion);

		// Generate new search string on option toggle

		$(".modal .search-string-options .check").click(function(e){

			if($(this).hasClass("hp-option")){
				showHP = (! showHP);
			} else if($(this).hasClass("cp-option")){
				showCP = (! showCP);
			} else if($(this).hasClass("region-option")){
				showRegion = (! showRegion);
			}

			self.generateSearchString(showHP, showCP, showRegion);
		});

		// Copy search string text

		$(".modal .search-string-window .copy").click(function(e){
			var el = $(e.target).prev()[0];
			el.focus();
			el.setSelectionRange(0, el.value.length);
			document.execCommand("copy");
		});

	});

	// Creates a search string for the current team

	this.generateSearchString = function(showHP, showCP, showRegion){
		var team = pokemonList
		var pokeID = []
		var fast = []
		var charge1 = []
		var charge2 = []
		var shadow = []
		var region = []
		var duplicates = []
		var custom = {
			HP   : [],
			CP   : []
		};

		// Sets values for each Pokemon

		for(var i = 0; i < team.length; i++){
			pokeID[i] = team[i].dex;
			fast[i] = team[i].fastMove.name;
			charge1[i] = team[i].chargedMoves[0].name;
			charge2[i] = (team[i].chargedMoves.length > 1) ? team[i].chargedMoves[1].name : false;
			shadow[i] = team[i].shadowType === "shadow";
			custom.CP[i] = (team[i].isCustom && showCP) ? team[i].cp : false;
			custom.HP[i] = (team[i].isCustom && showHP) ? team[i].stats.hp : false;
			duplicates[i] = false;

			// Checks for Weather Ball and Techno Blast (otherwise it will exclude all pokemon that have the move)

			charge1[i] = charge1[i].includes("Weather Ball") ? "Weather Ball" : charge1[i]
			charge2[i] = charge2[i].includes("Weather Ball") ? "Weather Ball" : charge2[i]
			charge1[i] = charge1[i].includes("Techno Blast") ? "Techno Blast" : charge1[i]
			charge2[i] = charge2[i].includes("Techno Blast") ? "Techno Blast" : charge2[i]

			// Checks for duplicate pokemon IDs

			for(var j = i - 1; j >= 0; j--){
				duplicates[j] = duplicates[j] || ((pokeID[i] === pokeID[j]) ? i : false)
			}

			// Checks for region tag

			for(var j = 0; j < team[i].tags.length; j++){
				region[i] = ((j < 1) ? false : region[i])
							|| (team[i].tags[j] === "alolan") ? "alola" : false
							|| (team[i].tags[j] === "galarian") ? "galar" : false
							;
			}

			region[i] = region[i] || (showRegion ? this.getRegion(pokeID[i]) : false)
		}

		var searchString = "";
		var shadowString = "!shadow";
		var nonshadowString = "shadow"
		var idString = ""

		for(var i = 0; i < team.length; i++){
			var fastMoveString = "";
			var charge1String = "";
			var charge2String = "";
			var cpString = "";
			var hpString = "";
			var regionString = "";
			var currentIndex = i;
			var isShadow = ""

			// Builds combined search string for all pokemon that share this pokemon's id

			while(duplicates[i] && (duplicates[i] !== true)){
				fastMoveString += "@1" + fast[currentIndex];
				charge1String += "@2" + charge1[currentIndex] + ",@3" + charge1[currentIndex];

				if(charge2[currentIndex]) {
					charge2String += "@2" + charge2[currentIndex] + ",@3" + charge2[currentIndex];
				} else {
					charge2String += "@3move";
				}

				cpString += custom.CP[currentIndex] ? ("CP" + custom.CP[currentIndex]) : "";
				hpString += custom.HP[currentIndex] ? ("HP" + custom.HP[currentIndex]) : "";
				region[currentIndex] = region[currentIndex] || this.getRegion(pokeID[i])
				regionString += (this.getRegion(pokeID[i]) !== region[currentIndex]
								&& regionString !== region[currentIndex])
								? ((regionString === "") ? "" : ",") + region[currentIndex] : ""
				region[i] = (this.getRegion(pokeID[i]) === region[currentIndex]) || region[i]
				if(isShadow === "") {
					isShadow = shadow[currentIndex] ? "yes" : "no"
				} else {
					isShadow = (isShadow === (shadow[currentIndex] ? "yes" : "no")) ? isShadow : "mixed"
				}

				if(duplicates[currentIndex]){
					fastMoveString += ",";
					charge1String += ",";
					charge2String += ",";
					currentIndex = duplicates[currentIndex];
					custom.CP[i] = custom.CP[i] && custom.CP[currentIndex];
					custom.HP[i] = custom.HP[i] && custom.HP[currentIndex];
					cpString += custom.CP[currentIndex] ? "," : "";
					hpString += custom.HP[currentIndex] ? "," : "";
				} else {
					fastMoveString += ",!" + pokeID[currentIndex] + "&"
					charge1String += ",!" + pokeID[currentIndex] + "&"
					charge2String += ",!" + pokeID[currentIndex] + "&"
					idString += ((idString === "") ? "" : ",") + pokeID[i]
					regionString += (region[i] === true)
								? ((regionString === "") ? "" : ",")
								+ this.getRegion(pokeID[i]) : ""
					regionString += (regionString === "") ? "" : ",!" + pokeID[currentIndex] + "&"
					cpString = custom.CP[i] ? (cpString + ",!" + pokeID[currentIndex] + "&") : "";
					hpString = custom.HP[i] ? (hpString + ",!" + pokeID[currentIndex] + "&") : "";
					shadowString += (isShadow !== "no") ? (((shadowString === "") ? "" : ",") + pokeID[i]) : "";
					nonshadowString += (isShadow !== "yes") ? (((nonshadowString === "") ? "" : ",") + pokeID[i]) : "";
					for(var j = team.length - 1; j >= 0; j--){
						duplicates[j] = (pokeID[i] === pokeID[j]) ? true : duplicates[j]
					}
				}

			}

			// Builds search string for non-duplicates, one pokemon at a time

			if(!duplicates[i]){
				searchString += "@1" + fast[i]
							+ ",!" + pokeID[i] + "&"
							+ "@2" + charge1[i]
							+ ",@3" + charge1[i]
							+ ",!" + pokeID[i] + "&"
							;

				if(charge2[i]) {
					searchString += "@2" + charge2[i]
								+ ",@3" + charge2[i]
								+ ",!" + pokeID[i] + "&"
								;
				} else {
					searchString += "@3move"
								+ ",!" + pokeID[i] + "&"
								;
				}

				searchString += custom.CP[i] ? ("CP" + custom.CP[i] + ",!" + pokeID[i] + "&") : "";
				searchString += custom.HP[i] ? ("HP" + custom.HP[i] + ",!" + pokeID[i] + "&") : "";
				searchString += region[i] ? (region[i] + ",!" + pokeID[i] + "&") : "";
				idString += ((idString === "") ? "" : ",") + pokeID[i]
				shadowString += shadow[i] ? ("," + pokeID[i] + "") : "";
				nonshadowString += shadow[i] ? "" : ("," + pokeID[i] + "");
			} else {
				searchString += fastMoveString + charge1String + charge2String + cpString + hpString + regionString;
			}
		}

		nonshadowString = (shadowString === "!shadow") ? "" : nonshadowString + "&" ;
		searchString += ((team.length > 0) ? shadowString + "&" + nonshadowString : "") + idString;

		$(".modal .team-string-text").val(searchString);
		return searchString
	}

	// Toggle move count info

	$el.find(".check.show-move-counts").click(function(e){
		showMoveCounts = (! showMoveCounts);

		$el.find(".rankings-container").toggleClass("show-move-counts");

		window.localStorage.setItem("rankingsShowMoveCounts", showMoveCounts)
	});

	// Enter starting HP

	$el.find(".start-hp").on("keyup change", function(e){

		multiSettings.startHp = parseFloat($el.find(".start-hp").val()) / 100;

		if(multiSettings.startHp < 0){
			multiSettings.startHp = 0;
		} else if (multiSettings.startHp > 1){
			multiSettings.startHp = 1;
		}

		if($el.find(".start-hp").val() == ''){
			multiSettings.startHp = 1;
		}
	});

	// Enter starting energy

	$el.find(".start-energy").on("keyup change", function(e){

		var value = parseInt($el.find(".start-energy").val());
		multiSettings.startEnergy = parseInt($el.find(".start-energy").val());

		if(multiSettings.startEnergy < 0){
			multiSettings.startEnergy = 0;
		} else if (multiSettings.startEnergy > 100){
			multiSettings.startEnergy = 100;
		}

		if($el.find(".start-energy").val() == ''){
			multiSettings.startEnergy = 0;
		}
	});

	// Turn switch delay on or off

	$el.find(".check.switch-delay").on("click", function(e){
		// Cooldown decreases at the start of the battle step, so a start value of 1000 will result in a 500 ms delay
		multiSettings.startCooldown = multiSettings.startCooldown == 0 ? multiSettings.startCooldown = 1000 : multiSettings.startCooldown = 0;
		console.log(multiSettings.startCooldown);
	});

	// Turn move optimization on or off

	$el.find(".check.optimize-timing").on("click", function(e){
		multiSettings.optimizeMoveTiming = (! multiSettings.optimizeMoveTiming);
	});

	// Change stat modifier options
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

			multiSettings.startStatBuffs = [attackValue, defenseValue];
		}

		var buffDivisor = gm.data.settings.buffDivisor;
		var adjustmentAtk = 1;
		var adjustmentDef = 1;

		if(attackValue > 0){
			adjustmentAtk = (buffDivisor + attackValue) / buffDivisor;
		} else{
			adjustmentAtk = buffDivisor / (buffDivisor - attackValue);
		}

		adjustmentAtk = Math.round(adjustmentAtk * 100) / 100;

		if(defenseValue > 0){
			adjustmentDef = (buffDivisor + defenseValue) / buffDivisor;
		} else{
			adjustmentDef = buffDivisor / (buffDivisor - defenseValue);
		}

		adjustmentDef = Math.round((1 / adjustmentDef) * 100) / 100;

		$el.find(".adjustment.attack .value").html("x" + adjustmentAtk);
		$el.find(".adjustment.defense .value").html("x" + adjustmentDef);

		$el.find(".adjustment .value").removeClass("buff debuff");

		if(adjustmentAtk > 1){
			$el.find(".adjustment.attack .value").addClass("buff");
		} else if(adjustmentAtk < 1){
			$el.find(".adjustment.attack .value").addClass("debuff");
		}

		if(adjustmentDef > 1){
			$el.find(".adjustment.defense .value").addClass("debuff");
		} else if(adjustmentDef < 1){
			$el.find(".adjustment.defense .value").addClass("buff");
		}
	});

	// Returns a region based on dex number

	this.getRegion = function(dexNumber){
		if(dexNumber < 1 || dexNumber > 898){
			return false
		} else if(dexNumber < 152){
			return "kanto"
		} else if(dexNumber < 252){
			return "johto"
		} else if(dexNumber < 387){
			return "hoenn"
		} else if(dexNumber < 494){
			return "sinnoh"
		} else if(dexNumber < 650){
			return "unova"
		} else if(dexNumber < 722){
		 	return "kalos"
		} else if(dexNumber < 810){
			return "alola"
		} else if(dexNumber < 899){
			return "galar"
		}
		return
	}
}


function getDefaultMultiBattleSettings() {
		return {
		shields: 1,
		ivs: "original",
		bait: 1,
		levelCap: 50,
		startHp: 1,
		startEnergy: 0,
		startCooldown: 0,
		optimizeMoveTiming: true,
		startStatBuffs: [ 0, 0 ]
	};
}
