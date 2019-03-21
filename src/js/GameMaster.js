// JavaScript Document

var GameMaster = (function () {
    var instance;
 
    function createInstance(interface) {
        var object = new Object();
		
		object.data = {};
		object.rankings = [];
		object.groups = [];
		object.loadedData = 0;
		
		$.getJSON( webRoot+"data/gamemaster.json?v=60", function( data ){
			object.data = data;
			
			// Sort Pokemon alphabetically for searching
			object.data.pokemon.sort((a,b) => (a.speciesName > b.speciesName) ? 1 : ((b.speciesName > a.speciesName) ? -1 : 0));
			
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
		
		// Return a move object from the GameMaster file given move ID
		
		object.getMoveById = function(id){
			var move;
			
			$.each(object.data.moves, function(index, m){
				
				if(m.moveId == id){
					
					// Generate move abbreviation
					
					var arr = m.moveId.split('_');
					var abbreviation = '';
					
					for(var i = 0; i < arr.length; i++){
						abbreviation += arr[i].charAt(0);
					}
					
					move = {
						moveId: m.moveId,
						name: m.name,
						abbreviation: abbreviation,
						type: m.type,
						power: m.power,
						energy: m.energy,
						energyGain: m.energyGain,
						cooldown: m.cooldown
					};
					
					if(m.buffs){
						move.buffs = m.buffs;
						move.buffApplyChance = parseFloat(m.buffApplyChance);
						move.buffTarget = m.buffTarget;
					}
					
					return;
				}
			});
			
			if(!move){
				console.log(id + " missing");
			}
			
			return move;
		}
		
		// Load and return ranking data JSON
		
		object.loadRankingData = function(caller, category, league, cup){
			
			var key = cup + "" + category + "" + league;
			
			if(! object.rankings[key]){
				var file = webRoot+"data/"+cup+"/"+category+"/"+"rankings-"+league+".json?v=60";
				
				$.getJSON( file, function( data ){
					object.rankings[key] = data;
					object.loadedData++;
					
					caller.displayRankingData(data);
				});
			} else{
				caller.displayRankingData(object.rankings[key]);
			}
		}
		
		// Load quick fill group JSON
		
		object.loadGroupData = function(caller, group){
			
			var key = group;
			
			if(! object.groups[key]){
				var file = webRoot+"data/groups/"+group+".json?v=60";
				
				$.getJSON( file, function( data ){
					
					// Sort alphabetically
					
					data.sort((a,b) => (a.speciesId > b.speciesId) ? 1 : ((b.speciesId > a.speciesId) ? -1 : 0));
					
					object.groups[key] = data;
					caller.quickFillGroup(data);
				});
			} else{
				caller.quickFillGroup(object.groups[key]);
			}
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