
// Other interfaces are singleton, but this one needs to interact with the RankingInterface

var object = new interfaceObject();
object.init();

function interfaceObject(){

	var battle;
	var gm = GameMaster.getInstance();
	var ranker = RankerMaster.getInstance();
	var rankingInterface = InterfaceMaster.getInstance();
	var pokeSelectors = [];
	var customMetaSelector;
	var overrideSelector;
	var rankingsRunning = false;
	var loadingDataFromCup = false; // Flag for whether we want to import new data into the moveset overrides
	var self = this;

	// Store selected filter for later manipulation
	var selectedElement;
	var selectedListIndex;
	var selectedFilterIndex;

	var cup = {
		name: "custom",
		title: "Custom",
		include: [],
		exclude: [],
		overrides: [],
		league: 1500
	}

	// The scenario to rank
	var scenario = {
		slug: "custom",
		shields: [1,1],
		energy: [0,0]
	};

	var pokemonList = [];

	// Filter lists
	var filterLists = [ cup.include, cup.exclude ]; // Array for easy reference

	this.init = function(){

		var data = GameMaster.getInstance().data;

		rankingInterface.setContext("custom");
		rankingInterface.setCustomRankingInterface(self);

		$(".league-select").on("change", selectLeague);
		$(".add-filter").on("click", addFilter);
		$(".simulate").on("click", generateRankings);
		$(".cup-select").on("change", selectCup);
		$(".subject-shield-select, .target-shield-select").on("change", changeScenarioShields);
		$(".subject-turns, .target-turns").on("keyup, change", changeScenarioEnergy);
		$("body").on("change", ".filter-type", changeFilterType);
		$("body").on("stateChange", ".field-section .check", filterCheckBox);
		$("body").on("keyup", ".field-section input", filterInput);
		$("body").on("click", ".field-section.type .select-all, .field-section.type .deselect-all", typeSelectAll);
		$("body").on("click", ".filter .remove", deleteFilterConfirm);

		battle = new Battle();

		customMetaSelector = new PokeMultiSelect($(".poke.multi").eq(0));
		customMetaSelector.init(data.pokemon, battle);
		customMetaSelector.setContext("customrankings");

		overrideSelector = new PokeMultiSelect($(".poke.multi").eq(1));
		overrideSelector.init(data.pokemon, battle);
		overrideSelector.setContext("customrankings");
	};

	// Update the displayed filters

	this.updateFilterDisplay = function(){
		$(".filters").each(function(index, value){
			var $el = $(this);
			var filters = filterLists[index];

			if(filters.length > 0){
				$el.html("");

				for(var i = 0; i < filters.length; i++){
					var $filter = $(".filter.clone").clone();
					$filter.removeClass("hide clone");
					$filter.attr("index", i);
					$filter.find("a.toggle .name").html(filters[i].name);
					$filter.attr("type", filters[i].filterType);

					$el.append($filter);
				}
			} else{
				$el.html("<p>No filters yet.</p>")
			}

		});
	}

	// Update filter values from UI

	this.updateFilterValues = function($el){
		var listIndex = $el.closest(".filters").attr("list-index");
		var filter = filterLists[listIndex][parseInt($el.attr("index"))];

		// Set filter type and name
		filter.filterType = $el.find(".filter-type option:selected").val();
		filter.name = $el.find(".filter-type option:selected").html();

		// Set filter values

		filter.values = [];

		switch(filter.filterType){
			case "type":
				$el.find(".type .check.on").each(function(index, value){
					filter.values.push($(this).attr("value"));
				});
				break;

			case "tag":
				$el.find(".tag .check.on").each(function(index, value){
					filter.values.push($(this).attr("value"));
				});
				break;

			case "id":
				var str = $el.find("input.ids").val().toLowerCase().replace(/ /g,'');
				filter.values = str.split(",");
				break;

			case "dex":
				filter.values = [parseInt($el.find("input.start-range").val()), parseInt($el.find("input.end-range").val())];
				break;

			case "cost":
				$el.find(".cost .check.on").each(function(index, value){
					filter.values.push(parseInt($(this).attr("value")));
				});
				break;

			case "distance":
				$el.find(".distance .check.on").each(function(index, value){
					filter.values.push(parseInt($(this).attr("value")));
				});
				break;
		}

		// Output the cup data to JSON
		var json = JSON.stringify(cup);
		$("textarea.import").val(json);
	}

	// Updated the list of valid Pokemon

	this.updatePokemonList = function(){
		var listStr = "";
		pokemonList = gm.generateFilteredPokemonList(battle, cup.include, cup.exclude);

		for(var i = 0; i < pokemonList.length; i++){
			if(i > 0){
				listStr += ", ";
			}

			listStr += pokemonList[i].speciesName;
		}


		$(".pokemon-list").html(listStr);
		$(".pokemon-count").html(pokemonList.length);
	}

	// Receive ranking data from the ranker

	this.receiveRankingData = function(data){
		if(ranker.getMoveSelectMode() == "auto"){
			// Run the rankings again with established movesets
			$(".button.simulate").html("Running rankings...");

			// Convert overrides custom group into an array
			var overrides = [];
			var group = overrideSelector.getPokemonList();

			for(var i = 0; i < group.length; i++){
				var chargedMoves = [];
				for(n = 0; n < group[i].chargedMoves.length; n++){
					chargedMoves.push(group[i].chargedMoves[n].moveId);
				}

				overrides.push({
					speciesId: group[i].speciesId,
					fastMove: group[i].fastMove.moveId,
					chargedMoves: chargedMoves
				});
			}

			cup.overrides = overrides;
			ranker.setMoveOverrides(battle.getCP(), "custom", overrides);

			// Output the cup data to JSON
			var json = JSON.stringify(cup);
			$("textarea.import").val(json);

			generateRankings(null, data);
		} else if(ranker.getMoveSelectMode() == "force"){
			$(".button.simulate").html("Simulate");
			$(".custom-rankings-results").show();
			$(".custom-rankings-list").show();

			// Set this ranking data in the gamemaster for recommended move reference
			var key = "allcustom"+battle.getCP();
			gm.rankings[key] = data[0];

			rankingInterface.displayRankingData(data[0]);

			customMetaSelector.setPokemonList(rankingInterface.getMetaGroup());
		}

	}

	// Import settings and set up displayed filters to match new data

	this.importCupSettings = function(data){
		cup.include = data.include;
		cup.exclude = data.exclude;
		cup.league = data.league
		cup.levelCap = data.levelCap;
		
		if(data.overrides){
			cup.overrides = data.overrides;
		}

		filterLists = [cup.include, cup.exclude];

		// Clear all displayed filters
		$(".filters .filter").remove();

		// Add filters back
		for(var i = 0; i < cup.include.length; i++){
			self.addFilterFromData("include", cup.include[i], i);
		}

		for(var i = 0; i < cup.exclude.length; i++){
			self.addFilterFromData("exclude", cup.exclude[i], i);
		}

		// Import moveset overrides
		overrideSelector.quickFillGroup(cup.overrides);

		// Set league
		$(".league-select option[value=\""+cup.league+"\"][level-cap=\""+cup.levelCap+"\"]").prop("selected","selected");
		$(".league-select").trigger("change");
	}

	// Import moveset oversides using an existing cup's rankings

	this.importMovesetsFromRankings = function(data){
		if(! loadingDataFromCup){
			return;
		}

		var list = [];

		for(var i = 0; i < Math.min(data.length,100); i++){
			var r = data[i];

			var pokemon = new Pokemon(r.speciesId, 0, battle);
			pokemon.initialize();
			pokemon.selectMove("fast", r.moveset[0]);
			pokemon.selectMove("charged", r.moveset[1], 0);

			if(r.moveset.length > 2){
				pokemon.selectMove("charged", r.moveset[2],1);
			} else{
				pokemon.selectMove("charged", "none", 1);
			}

			list.push(pokemon);
		}

		overrideSelector.setPokemonList(list);

		loadingDataFromCup = false;
	}

	// Add a new displayed filter given a filter category and filter data

	this.addFilterFromData = function(category, data, index){
		var $filter = $(".filter.clone").clone();
		$filter.removeClass("hide clone");
		$filter.find("a.toggle .name").html(data.name);
		$filter.attr("index", index);
		$filter.attr("type", data.filterType);
		$("." + category + " .filters").append($filter);

		// Process and select current values
		switch(data.filterType){
			case "type":
			case "tag":
			case "cost":
			case "distance":
				for(var i = 0; i < data.values.length; i++){
					$filter.find(".check[value=\""+data.values[i]+"\"]").addClass("on");
				}
				break;

			case "id":
				$filter.find("input.ids").val(data.values.join(","));
				break;

			case "dex":
				$filter.find("input.start-range").val(data.values[0]);
				$filter.find("input.end-range").val(data.values[1]);
				break;
		}
	}

	// Add a new filter to the include or exclude settings

	function addFilter(e){
		var listIndex = parseInt($(e.target).attr("list-index"));
		var filters = filterLists[listIndex];

		// Add a new filter

		filters.push({
			filterType: "type",
			name: "Type",
			values: []
		});

		var $filter = $(".filter.clone").clone();
		$filter.removeClass("hide clone");
		$filter.find("a.toggle .name").html("Type");
		$filter.attr("index", filters.length-1);
		$filter.attr("type", "type");
		$(".filters").eq(listIndex).append($filter);
	}

	// Change the type of a filter

	function changeFilterType(e){
		var $el = $(e.target).closest(".filter");
		var listIndex = $el.closest(".filters").attr("list-index");
		var filter = filterLists[listIndex][parseInt($el.attr("index"))];

		self.updateFilterValues($el);
		$el.find("a.toggle .name").html(filter.name);
		$el.attr("type",filter.filterType);
	}

	// Confirm whether or not to delete a filter

	function deleteFilterConfirm(e){
		var $el = $(e.target).closest(".filter");
		var listIndex = $el.closest(".filters").attr("list-index");

		selectedElement = $el;
		selectedListIndex = listIndex;
		selectedFilterIndex = parseInt($el.attr("index"));

		modalWindow("Remove Filter", $(".delete-filter-confirm"));
	}

	// Confirm whether or not to delete a filter

	function deleteFilterConfirm(e){
		var $el = $(e.target).closest(".filter");
		var listIndex = $el.closest(".filters").attr("list-index");

		selectedElement = $el;
		selectedListIndex = listIndex;
		selectedFilterIndex = parseInt($el.attr("index"));

		modalWindow("Remove Filter", $(".delete-filter-confirm"));

		$(".modal .yes").click(deleteSelectedFilter);
	}

	// Delete a previously selected filter

	function deleteSelectedFilter(){
		filterLists[selectedListIndex].splice(selectedFilterIndex, 1);
		$(selectedElement).remove();
		closeModalWindow();

		// Decrement the index of remaining filter elements by 1

		$(".filters").eq(selectedListIndex).find(".filter").each(function(i, value){
			var index = parseInt($(this).attr("index"));

			if(index > selectedFilterIndex){
				$(this).attr("index", index-1);
			}
		});
	}

	// Event handler for changing the league select

	function selectLeague(e){
		var allowed = [500, 1500, 2500, 10000];
		var cp = parseInt($(".league-select option:selected").val());
		var levelCap = parseInt($(".league-select option:selected").attr("level-cap"));

		if(allowed.indexOf(cp) > -1){
			battle.setCP(cp);
			battle.setLevelCap(levelCap);
			cup.league = cp;
			cup.levelCap = levelCap;
		}
	}

	// Event handler for changing the amount of shields in the ranking scenario

	function changeScenarioShields(e){
		var index = parseInt($(this).attr("index"));
		var val = parseInt($(this).find("option:selected").val());
		var allowed = [0,1,2];

		if(allowed.indexOf(val) > -1){
			scenario.shields[index] = val;
		}
	}

	// Event handler for changing the amount of shields in the ranking scenario

	function changeScenarioEnergy(e){
		var index = parseInt($(this).attr("index"));
		var val = parseInt($(this).val());
		if(val < 0){
			val = 0;
		}

		scenario.energy[index] = val;
	}

	// Import the settings of an existing up

	function selectCup(e){
		var val = $(".cup-select option:selected").val();
		var c = gm.getCupById(val);

		if(c){
			c.name = "custom";

			$(".custom-rankings-import textarea.import").val(JSON.stringify(c));
			$(".custom-rankings-import textarea.import").trigger("change");
		}

		loadingDataFromCup = true;
	}

	// Run simulation

	function generateRankings(e, data){
		// Just some good old client side validation
		if(cup.name != "custom"){
			// Is this like being stopped at customs?
			return false;
		}

		$(".button.simulate").html("Generating...");

		if((! data)&&(rankingsRunning)){
			rankingsRunning = true;
			return false;
		} else if((! data)&&(!rankingsRunning)){
			self.updatePokemonList();
		}


		if(! data){
			// Generate movesets
			ranker.setMoveSelectMode("auto");
			ranker.setScenarioOverrides([scenario]);
			ranker.rankLoop(battle.getCP(true), cup, self.receiveRankingData);
		} else{
			// Generate rankings with movesets established
			ranker.setMoveSelectMode("force");
			ranker.setScenarioOverrides([scenario]);
			rankingInterface.setScenario(scenario);
			ranker.rankLoop(battle.getCP(true), cup, self.receiveRankingData, data[0]);
		}
	}

	// Turn a filter's checkbox on or off

	function filterCheckBox(e){
		self.updateFilterValues($(e.target).closest(".filter"));
	}

	// Change a filter's input field

	function filterInput(e){
		self.updateFilterValues($(e.target).closest(".filter"));
	}

	// Select or deselect all types

	function typeSelectAll(e){
		var $el = $(e.target).closest(".filter");
		var listIndex = $el.closest(".filters").attr("list-index");
		var filter = filterLists[listIndex][parseInt($el.attr("index"))];

		if($(e.target).hasClass("select-all")){
			$el.find(".type .check").addClass("on");
		} else{
			$el.find(".type .check").removeClass("on");
		}

		self.updateFilterValues($el);
	}

	// Oh yeah, it's big brain copy + paste time
	// Copy list text

	$(".custom-rankings-import .copy").click(function(e){
		var el = $(e.target).prev()[0];
		el.focus();
		el.setSelectionRange(0, el.value.length);
		document.execCommand("copy");
	});

	// Copy text to import

	$(".custom-rankings-import textarea.import").on("click", function(e){
		this.setSelectionRange(0, this.value.length);
	});

	// Import text

	$(".custom-rankings-import textarea.import").on("change", function(e){
		var data = JSON.parse($(this).val());
		self.importCupSettings(data);
	});
};
