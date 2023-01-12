// JavaScript Document

var GameMaster = (function () {
    var instance;

    function createInstance(interface) {
        var object = new Object();

		object.data = {};

		// Load Pokemon data
		$.getJSON( webRoot+"tera/data/pokemon.json?v="+siteVersion, function( data ){
			object.data = data;

			InterfaceMaster.getInstance().init(object);
		});

		// Return a Pokemon object given species ID

		object.getPokemonById = function(id){
			var pokemon;

			$.each(object.data.pokemon, function(index, poke){

				if(poke.speciesId == id){
					pokemon = poke;
					return;
				}
			});

			return pokemon;
		}


        return object;
    }

    return {
        getInstance: function (interface) {
            if (!instance) {
                instance = createInstance(interface);
            }
            return instance;
        }
    };
})();
