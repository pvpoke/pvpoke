/*
 * Funtionality for the Pokemon selection interface, for Pokemon groups.
 * This file is dependent on a few others: PokeSelect.js and ModalWindow.js
 */

function Pokebox(element, selector, selectMode, b){
	var $el = element;
	var selector = selector;
	var selectMode = selectMode;
	var self = this;
	var battle = b;
	var box = [];
	var filteredBox = [];
	var maxCount = 100;
	var lastDateTime = settings.pokeboxLastDateTime; // Last dateTime refreshed

	$el.find("a.open-pokebox").click(openPokebox);
	$el.find(".pokebox-import").attr("select-mode", selectMode);

	this.loadPokebox = function(forceLoad){
		// Fetch box data from Pokebattler
		$(".modal .error").hide();

		if((forceLoad)||(box.length == 0)){
			var url = "https://fight.pokebattler.com/profiles/"+settings.pokeboxId;

			// Add timestamp to bypass cache
			if(forceLoad){
				lastDateTime = Date.now();
			}

			if(lastDateTime > 0){
				url = url + "?t=" + lastDateTime;
			}

			console.log(url);

			// Load Pokebox data

			$.ajax({
				url:url,
				dataType: 'json',
				success:function(json){
					box = [];

					// Convert each Pokemon entry into a Pokemon object
					for(var i = 0; i < json.pokemon.length; i++){
						var obj = json.pokemon[i];
						var id = self.translateId(obj.pokemon, "species");
						var pokemon = new Pokemon(id, 0, battle);

						if(pokemon){
							pokemon.initialize();
							pokemon.selectMove("fast", self.translateId(obj.quickMove, "move"));
							pokemon.selectMove("charged", self.translateId(obj.cinematicMove, "move"), 0);
							if(obj.cinematicMove2){
								pokemon.selectMove("charged", self.translateId(obj.cinematicMove2, "move"), 1);
							} else{
								pokemon.selectMove("charged", "none", 1);
							}

							pokemon.setLevel(parseFloat(obj.level));
							pokemon.setIV("atk", obj.individualAttack);
							pokemon.setIV("def", obj.individualDefense);
							pokemon.setIV("hp", obj.individualStamina);

							box.push(pokemon);
						}
					}

					// Sort box by speciesName

					box.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));

					self.displayBox();
				},
				error:function(){
					$(".modal .rankings-container").html("");
					$(".modal .error").show();
					$(".modal .pokebox-options").hide();
					$(".modal .poke-search").hide();
					$(".modal p").first().hide();
				}
			});

			// Save last Pokebox datetime
			if(settings.pokeboxLastDateTime < lastDateTime){
				settings.pokeboxLastDateTime = lastDateTime;

				$.ajax({

					url : host+'data/settingsCookie.php',
					type : 'POST',
					data : settings,
					dataType:'json',
					success : function(data) {
						console.log("Datetime " + settings.pokeboxLastDateTime + " saved");

					},
					error : function(request,error)
					{
						console.log("Request: "+JSON.stringify(request));
						console.log(error);
					}
				});
			};

		} else{
			self.displayBox();
		}
	}

	// Adapt species or move ids for the PvPoke gamemaster

	this.translateId = function(id, type){
		if(type == "species"){
			id = id.toLowerCase();
			id = id.replace("_form","");
			id = id.replace("_purified","");
			id = id.replace("alola","alolan");
		} else if(type == "move"){
			id = id.replace("_FAST","");
			id = id.replace("FUTURESIGHT","FUTURE_SIGHT");
		}

		switch(id){
			case "darmanitan":
				return "darmanitan_standard";
				break;

			case "thundurus":
				return "thundurus_incarnate";
				break;

			case "landorus":
				return "landorus_incarnate";
				break;

			case "tornadus":
				return "tornadus_incarnate";
				break;
		}

		return id;
	}

	// Display list of Pokemon in the box

	this.displayBox = function(){
		$(".modal .pokebox-list").html("");

		filteredBox = [];

		for(var i = 0; i < box.length; i++){
			var pokemon = box[i];

			if(pokemon.cp <= battle.getCP()){
				filteredBox.push(pokemon);

				var $item = $("<div class=\"rank " + pokemon.types[0] + "\" type-1=\""+pokemon.types[0]+"\" type-2=\""+pokemon.types[1]+"\" data=\""+pokemon.speciesId+"\"><div class=\"name-container\"><span class=\"name\">"+pokemon.speciesName+"</span><span class=\"moves\"></span></div><div class=\"remove\"></div></div>");
				$item.find(".moves").append("CP " + pokemon.cp + " " + pokemon.ivs.atk + "/" + pokemon.ivs.def + "/" + pokemon.ivs.hp + "<br>");
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

				$(".modal .pokebox-list").append($item);
			}
		}

		$(".modal .pokebox-list .rank").click(selectPokemon);
		$(".modal .button.select").click(selectGroup);
		$(".modal a.pokebox-refresh").click(refreshPokebox);
	}

	// Click the prompt to open the Pokebox

	function openPokebox(e){
		e.preventDefault();

		modalWindow("Import Pokemon", $el.find(".pokebox-import"));

		if((settings.pokeboxId)&&(settings.pokeboxId > 0)){
			$(".modal .pokebox-on").show();
			$(".modal .pokebox-off").hide();
			self.loadPokebox();
		} else{
			$(".modal .pokebox-on").hide();
			$(".modal .pokebox-off").show();
			$(".modal .button.save").click(saveSettings);
		}

		if(selectMode == "multi"){
			maxCount = selector.getAvailableSpots();

			$(".modal .poke-max-count").html(maxCount);
		}
	}

	// Select a Pokemon in the Pokebox

	function selectPokemon(e){
		e.preventDefault();

		// Don't select more than allowed
		if(($(".modal .rank.selected").length >= maxCount)&&(!$(e.target).closest(".rank").hasClass("selected"))){
			return;
		}

		$(e.target).closest(".rank").toggleClass("selected");

		var index = $(e.target).closest(".rank").index();
		var pokemon = filteredBox[index];

		if(selectMode == "single"){
			selector.setSelectedPokemon(pokemon);
			closeModalWindow();
		} else{
			$(".modal .poke-count").html($(".modal .rank.selected").length);
		}
	}

	// Submit a group of selected Pokemon to a MultiSelector

	function selectGroup(e){
		e.preventDefault();

		var group = [];

		$(".modal .rank").each(function(index, value){
			if($(this).hasClass("selected")){
				group.push(filteredBox[index]);
			}
		});

		// Merge the group into the existing MutliSelector

		var list = selector.getPokemonList();

		for(var i = 0; i < group.length; i++){
			list.push(group[i]);
		}

		selector.setPokemonList(list);
		closeModalWindow();
	}

	// Submit a group of selected Pokemon to a MultiSelector

	function refreshPokebox(e){
		e.preventDefault();

		$(".modal .pokebox-list").html("Loading Pokemon...");

		setTimeout(function(){
			self.loadPokebox(true);
		}, 250);
	}

	// Save the Pokebox settings after entering ID

	function saveSettings(e){

		var pokeboxId = parseInt($(".modal .pokebox-id").val());

		$.ajax({

			url : host+'data/settingsCookie.php',
			type : 'POST',
			data : {
				'defaultIVs' : settings.defaultIVs,
				'animateTimeline' : settings.animateTimeline,
				'theme': settings.theme,
				'matrixDirection': settings.matrixDirection,
				'gamemaster': settings.gamemaster,
				'pokeboxId': pokeboxId
			},
			dataType:'json',
			success : function(data) {
				settings.pokeboxId = pokeboxId;

				$(".modal .pokebox-off").hide();
				$(".modal .pokebox-on").show();

				self.loadPokebox(true);
			},
			error : function(request,error)
			{
				console.log("Request: "+JSON.stringify(request));
				console.log(error);
			}
		});
	}
}
