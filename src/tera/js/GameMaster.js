// JavaScript Document

var GameMaster = (function () {
    var instance;

    function createInstance(interface) {
        var object = new Object();

		object.data = {};

		// Load Pokemon data
		$.getJSON( webRoot+"tera/data/pokemon.json?v="+siteVersion, function( data ){
			object.data = data;

			data.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

			InterfaceMaster.getInstance().init(object);
		});

		// Return a Pokemon object given species ID

		object.getPokemonById = function(id){
			var pokemon;

			$.each(object.data, function(index, poke){

				if(poke.id == id){
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
