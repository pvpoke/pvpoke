// Search input handler

var pokeSearch = new function(){
	var searchTimeout;
	var searchStr = '';
	var searchList = [];
	var $target = null;
	var battle;
	var context;

	this.setBattle = function(b){
		battle = b;
	}


	this.getSearchList = function(){
		return searchList;
	}

	$("body").on("keyup", ".poke-search[context='ranking-search'], .poke-search[context='alternative-search']", function(e){
		searchStr = $(this).val().toLowerCase().trim();
		context = $(this).attr("context");


		$target = $(e.target).closest(".poke-search-container");

		// Reset the timeout when a new key is typed. This prevents queries from being submitted too quickly and bogging things down on mobile.
		window.clearTimeout(searchTimeout);

		if($(window).width() >= 768){
			searchTimeout = window.setTimeout(submitSearchQuery, 25);
		} else{
			searchTimeout = window.setTimeout(submitSearchQuery, 250);
		}

	});

	// Scroll searchbar into view on focus
	if(screen.width <= 768){
		$("body").on("focus", ".poke-search[context='ranking-search'], .poke-search[context='alternative-search']", function(e){
			$target = $(e.target).closest(".poke-search-container");

			$("html, body").animate({ scrollTop: $target.offset().top - 65 }, 500);

		});
	}


	$("a.search-info").click(function(e){
		e.preventDefault();

		if($(this).attr("context") != "pokeselect"){
			modalWindow("Search Strings", $(".sandbox-search-strings"));

			$(".modal a.nickname-list").click(function(e){
				e.preventDefault();

				modalWindow("Pokemon Nicknames", $(".search-nicknames"));

				var gm = GameMaster.getInstance();

				for(var i = 0; i < gm.data.pokemon.length; i++){
					var pokemon = gm.data.pokemon[i];

					if(pokemon.nicknames && ! pokemon.speciesId.includes("shadow") && ! pokemon.speciesId.includes("mega")){
						$(".modal .search-nicknames tbody").append("<tr><td>"+pokemon.speciesName+"</td><td>"+pokemon.nicknames.join(", ")+"</td></tr>");
					}
				}
			});
		}
	});

	// Open trait search

	$("a.search-traits").click(function(e){
		e.preventDefault();
		modalWindow("Search Traits", $(".search-traits-selector"));

		// Populate traits
		var traits = GameMaster.getInstance().data.pokemonTraits;

		for(var i = 0; i < traits.pros.length; i++){
			$(".modal .traits").append("<div class=\"pro\" value=\""+traits.pros[i]+"\">+ "+toTitleCase(traits.pros[i])+"</div>");
		}

		for(var i = 0; i < traits.cons.length; i++){
			$(".modal .traits").append("<div class=\"con\" value=\""+traits.cons[i]+"\">- "+toTitleCase(traits.cons[i])+"</div>");
		}

		// Prefill with existing search query

		var searchArr = $(".poke-search").val().split("&");

		for(var i = 0; i < searchArr.length; i++){
			$(".modal .traits > div[value=\""+searchArr[i]+"\"]").addClass("selected");
		}

		$(".modal .traits > div").click(function(e){
			$(this).toggleClass("selected");
		});

		// Submit search
		$(".modal .button.search").click(function(e){
			e.preventDefault();

			searchArr = [];

			$(".modal .traits .selected").each(function(index, value){
				searchArr.push($(this).attr("value"));
			});

			$(".poke-search").val(searchArr.join("&"));
			$(".poke-search").trigger("keyup");

			closeModalWindow();
		});

	})

	function submitSearchQuery(){
		searchList = GameMaster.getInstance().generatePokemonListFromSearchString(searchStr, battle);

		if(context == "alternative-search"){
			InterfaceMaster.getInstance().displayAlternatives(searchList);
			return;
		}

		$target.siblings(".rankings-container").find("> .rank").each(function(index, value){
			var id = $(this).attr("data");

			if((searchList.indexOf(id) > -1)||(! id)){
				$(this).show();
			} else{
				$(this).hide();
			}
		});
	}

	// Thanks stackoverflow
	function toTitleCase(str) {
	    return str.replace(/\w\S*/g, function(txt){
	        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	    });
	}

};
