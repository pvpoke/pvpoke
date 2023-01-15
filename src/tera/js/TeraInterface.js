var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			let self = this;
			let ranker = new TeraRanker();
			let gm = GameMaster.getInstance();

			this.init = function(){
				// Populate Pokemon select list
				for(var i = 0; i < gm.data.length; i++){
					$("#poke-select").append("<option value='"+gm.data[i].id+"'>"+gm.data[i].name+"</option>");
				}
			}


			// Run the tera counter calculator and display the results
			$("button#run").click(function(e){
				let types = [];

				types.push($("#type1 option:selected").val());

				if($("#type2 option:selected").val() != "none"){
					types.push($("#type2 option:selected").val());
				}

				let tera = $("#tera option:selected").val()

				let results = ranker.rankAttackers(types, tera);

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

					let $row = $('<tr><td></td><td>-</td><td></td></tr>');
					$row.find("td").eq(0).html(results[i].pokemon.name);

					$row.find("td").eq(1).html(results[i].pokemon.types.join(" / "));

					$row.find("td").eq(2).html(results[i].tera);
					$("#results tbody").append($row);

					displayedSpecies.push(results[i].pokemon.id);

					i++;
					displayCount++;

				}
			});

			// Select a Pokemon from the raid boss select list on input search

			$("#poke-search").keyup(function(e){
				let searchStr = $(this).val().toLowerCase();

				$("#poke-select option").each(function(index, value){
					let name = $(this).html().toLowerCase();

					if(name.startsWith(searchStr)){
						$(this).prop("selected", "selected");
						return false;
					}
				});
			});

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
