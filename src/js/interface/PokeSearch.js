// Search input handler

var pokeSearch = new function(){
	var searchTimeout;
	var searchStr = '';
	var $target = null;
	var battle;

	this.setBattle = function(b){
		battle = b;
	}

	$("body").on("keyup", ".poke-search[context='ranking-search']", function(e){
		searchStr = $(this).val().toLowerCase();

		$target = $(e.target).closest(".poke-search-container");

		// Reset the timeout when a new key is typed. This prevents queries from being submitted too quickly and bogging things down on mobile.
		window.clearTimeout(searchTimeout);

		if($(window).width() >= 768){
			searchTimeout = window.setTimeout(submitSearchQuery, 25);
		} else{
			searchTimeout = window.setTimeout(submitSearchQuery, 250);
		}

	});

	$("a.search-info").click(function(e){
		e.preventDefault();
		modalWindow("Search Strings", $(".sandbox-search-strings"));
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
		var list = GameMaster.getInstance().generatePokemonListFromSearchString(searchStr, battle);

		$target.siblings(".rankings-container").find(".rank").each(function(index, value){
			var id = $(this).attr("data");

			if((list.indexOf(id) > -1)||(! id)){
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
