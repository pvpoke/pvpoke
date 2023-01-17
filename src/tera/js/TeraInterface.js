var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			let self = this;
			let ranker = new TeraRanker();
			let gm = GameMaster.getInstance();
			let selectedTypes = [];
			let selectedPokemon;
			let selectedTera;
			let results = [];

			this.init = function(){
				// Populate Pokemon select list
				for(var i = 0; i < gm.data.length; i++){
					$("#poke-select").append("<option value='"+gm.data[i].id+"'>"+gm.data[i].name+"</option>");
				}
			}

			this.displayResults = function(r){
				results = r;

				$("#results tbody").html("");

				let displayedSpecies = [];
				let displayCount = 0;
				let displayMax = 50;
				let i = 0;

				while(displayCount < displayMax){
					// Show only the best scored version of each species
					if(displayedSpecies.indexOf(results[i].pokemon.id) > -1){
						i++;
						continue;
					}

					let $row = $('<tr><td></td><td>-</td><td></td><td></td></tr>');
					$row.find("td").eq(0).html(results[i].pokemon.name);

					// Show Pokemon typings
					let $types = $("<div class='flex'></div>");

					for(var n = 0; n < results[i].pokemon.types.length; n++){
						let $type = createTypeLabel(results[i].pokemon.types[n]);
						$types.append($type);
					}

					$row.find("td").eq(1).html($types);

					// Show Pokemon tera type
					let $teraType = createTypeLabel(results[i].tera);
					$teraType.addClass("tera");
					$row.find("td").eq(2).html($teraType);

					// Show Pokemon's score
					$row.find("td").eq(3).html(Math.round(results[i].overall * 100) / 100);

					$("#results tbody").append($row);

					displayedSpecies.push(results[i].pokemon.id);

					i++;
					displayCount++;

				}
			}


			// Run the tera counter calculator and display the results
			$("button#run").click(function(e){
				let r = ranker.rankAttackers(selectedPokemon, selectedTypes, selectedTera);

				self.displayResults(r);
			});

			// Select a Pokemon from the raid boss select list on input search

			$("#poke-search").keyup(function(e){
				let searchStr = $(this).val().toLowerCase();

				$("#poke-select option").each(function(index, value){
					let name = $(this).html().toLowerCase();

					if(name.startsWith(searchStr)){
						$(this).prop("selected", "selected");
						selectNewPokemon($(this).val());
						return false;
					}
				});
			});

			// Clear the search input on focus

			$("#poke-search").focus(function(e){
				$("#poke-search").val("");
			});

			// Select a Pokemon from the dropdown
			$("#poke-select").change(function(e){
				selectNewPokemon($(this).find("option:selected").val());
			});

			// Change the current tera type
			$("#tera-select").change(function(e){
				selectedTera = $(this).find("option:selected").val();

				updateRaidBossDisplay();
			});

			// Add a new selected type to the list of attacks
			$("#attack-type-select").change(function(e){
				let type = $("#attack-type-select option:selected").val();
				selectedTypes.push(type);

				$("#attack-type-select option").first().prop("selected", "selected");

				updateRaidBossDisplay();
			});

			// Remove a selected type from the list of attacks
			$("body").on("click", ".type-item a.close", function(e){
				e.preventDefault();

				let $item = $(this).closest(".type-item");
				let index = $(".boss-attack-types .type-item").index($item);

				selectedTypes.splice(index, 1);

				updateRaidBossDisplay();
			});

			// Select a new Pokemon from the given id
			function selectNewPokemon(id){
				// Empty value
				if(id == '' || id == null){
					selectedPokemon = null;
					selectedTypes = [];
					updateRaidBossDisplay();
					return;
				}

				selectedPokemon = gm.getPokemonById(id);

				selectedTypes = [];

				for(var i = 0; i < selectedPokemon.types.length; i++){
					selectedTypes.push(selectedPokemon.types[i]);
				}

				updateRaidBossDisplay();
			}

			// Update the raid boss UI with the current values
			function updateRaidBossDisplay(){
				$(".boss-section").attr("tera-type", selectedTera);

				$(".boss-attack-types .type-item").remove();

				for(var i = 0; i < selectedTypes.length; i++){
					let $type = createTypeLabel(selectedTypes[i]);

					$type.insertBefore($(".boss-attack-types select"));
				}

			}

			function createTypeLabel(type){
				let $type = $(".type-item.template").clone().removeClass("template");
				let typeName = type.charAt(0).toUpperCase() + type.slice(1);

				$type.addClass(type);
				$type.attr("tera-type", type);
				$type.find(".type-name").html(typeName);

				return $type;
			}

		}

        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
