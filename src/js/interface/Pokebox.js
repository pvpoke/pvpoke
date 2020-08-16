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

	$el.find("a.open-pokebox").click(openPokebox);
	$el.find("."+selectMode).show();

	this.loadPokebox = function(forceLoad){
		// Fetch box data from Pokebattler
		if((forceLoad)||(box.length == 0)){
			$.ajax({
				url:"https://fight.pokebattler.com/profiles/1",
				dataType: 'json',
				success:function(json){
					box = [];

					// Convert each Pokemon entry into a Pokemon object
					for(var i = 0; i < json.pokemon.length; i++){
						var obj = json.pokemon[i];
						var id = self.translateId(obj.pokemon, "species");
						var pokemon = new Pokemon(id, 0, battle);
						pokemon.initialize();

						if(pokemon){
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

					self.displayBox();
				},
				error:function(){
					console.log("Pokebox error");
				}
			});
		} else{
			self.displayBox();
		}
	}

	// Adapt species or move ids for the PvPoke gamemaster

	this.translateId = function(id, type){
		if(type == "species"){
			id = id.toLowerCase();
			id = id.replace("_form","");
			id = id.replace("alola","alolan");
		} else if(type == "move"){
			id = id.replace("_FAST","");
			id = id.replace("FUTURESIGHT","FUTURE_SIGHT");
		}

		return id;
	}

	// Display list of Pokemon in the box

	this.displayBox = function(){
		$(".modal .pokebox-list").html("");

		for(var i = 0; i < box.length; i++){
			var pokemon = box[i];

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

		$(".modal .pokebox-list .rank").click(selectPokemon);
		$(".modal .button.select").click(selectGroup);
	}

	// Click the prompt to open the Pokebox

	function openPokebox(e){
		e.preventDefault();

		modalWindow("Import Pokemon", $el.find(".pokebox-import"));

		self.loadPokebox(false);
	}

	// Select a Pokemon in the Pokebox

	function selectPokemon(e){
		e.preventDefault();

		$(e.target).closest(".rank").toggleClass("selected");

		var index = $(e.target).closest(".rank").index();
		var pokemon = box[index];

		if(selectMode == "single"){
			selector.setSelectedPokemon(pokemon);
			closeModalWindow();
		}
	}

	// Submit a group of selected Pokemon to a MultiSelector

	function selectGroup(e){
		e.preventDefault();

		var group = [];

		$(".modal .rank").each(function(index, value){
			if($(this).hasClass("selected")){
				group.push(box[index]);
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
}
