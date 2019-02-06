// Search input handler

$(".poke-search").on("keyup", function(e){

	var types = ["bug","dark","dragon","electric","fairy","fighting","fire","flying","ghost","grass","ground","ice","normal","poison","psychic","rock","steel","water"];

	var searchStr = $(this).val().toLowerCase();

	if(searchStr == ''){
		$(".rankings-container > .rank").show();
		return;
	}

	var searchKeys = searchStr.split('&');

	$(".rankings-container > .rank").each(function(index, value){

		var show = false;

		for(var i = 0; i < searchKeys.length; i++){
			if(types.indexOf(searchKeys[i]) == -1){
				// Name search
				var pokeName = $(this).find(".name").html().toLowerCase();

				if(pokeName.startsWith(searchKeys[i])){
					show = true;
				}
			} else{
				// Type search

				if(($(this).attr("type-1") == searchKeys[i]) || ($(this).attr("type-2") == searchKeys[i])){
					show = true;
				}
			}
		}

		if(show){
			$(this).show();
		} else{
			$(this).hide();
		}
	});
});