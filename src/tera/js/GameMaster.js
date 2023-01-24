// JavaScript Document

var GameMaster = (function () {
    var instance;

    function createInstance(interface) {
        var object = new Object();

		object.data = {};

		// Load Pokemon data
		$.getJSON( webRoot+"tera/data/gamemaster.json?v="+siteVersion, function( data ){
			object.data = data;

			data.pokemon.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

			InterfaceMaster.getInstance().init(object);
		});

		// Return Pokemon object data given species ID

		object.getPokemonById = function(id){
			var pokemon;

			$.each(object.data.pokemon, function(index, poke){

				if(poke.id == id){
					pokemon = poke;
					return;
				}
			});

			return pokemon;
		}

		// Return Trait object given trait ID

		object.getTraitById = function(id){
			var trait;

			$.each(object.data.traits, function(index, t){

				if(t.id == id){
					trait = t;
					return;
				}
			});

			return trait;
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
