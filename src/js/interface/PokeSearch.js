// Search input handler

$(".poke-search[context='ranking-search']").on("keyup", function(e){
	var searchStr = $(this).val().toLowerCase();	
	var list = GameMaster.getInstance().generatePokemonListFromSearchString(searchStr);

	$(".rankings-container > .rank").each(function(index, value){
		var id = $(this).attr("data");
		
		if(list.indexOf(id) > -1){
			$(this).show();
		} else{
			$(this).hide();
		}
	});
});

$("a.search-info").click(function(e){
	e.preventDefault();
	modalWindow("Search Strings", $(".sandbox-search-strings"));
});