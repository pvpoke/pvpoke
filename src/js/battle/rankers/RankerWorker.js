// RankerWorker.js

// Minimal GameMaster stub for worker environment
var GameMaster = (function(){
	var instance;

	function createInstance(){
		return {
			data: {},
			pokemonMap: new Map(),
			moveMap: new Map(),
			cupMap: new Map(),
			getPokemonById: function(id){
				if(!id){ return null; }
				id = id.replace("_xl", "");
				return this.pokemonMap.get(id);
			},
			getMoveById: function(id){
				return this.moveMap.get(id);
			},
			getCupById: function(id){
				return this.cupMap.get(id);
			},
			generateFilteredPokemonList: function(battle, include, exclude, rankingData, overrides){
				// Not used in worker; caller sends lists directly.
				return [];
			}
		};
	}

	return {
		getInstance: function(){
			if(!instance){ instance = createInstance(); }
			return instance;
		},
		setData: function(data){
			var gm = this.getInstance();
			gm.data = data || {};
			gm.pokemonMap = new Map((gm.data.pokemon || []).map(function(p){ return [p.speciesId, p]; }));
			gm.moveMap = new Map((gm.data.moves || []).map(function(m){ return [m.moveId, m]; }));
			if(gm.data.cups){
				gm.cupMap = new Map((gm.data.cups || []).map(function(c){ return [c.name, c]; }));
			} else {
				gm.cupMap = new Map();
			}
			return gm;
		}
	};
})();

// import local classes (Pokemon, Battle, ranker)
importScripts(

	'../../pokemon/Pokemon.js',
	'../../battle/Battle.js',
    '../../battle/DamageCalculator.js',
    '../../battle/actions/ActionLogic.js',
    '../../battle/timeline/TimelineEvent.js',
    '../../battle/timeline/TimelineAction.js',
    '../../training/DecisionOption.js',
	'Ranker.js'
);

onmessage = function(event){
	var data = event.data;

	if(!data || !data.type){
		postMessage({type: 'error', error: 'Invalid message format'});
		return;
	}

	if(data.type === 'runScenario'){
		try {
			console.log('Worker processing scenario:', data.scenario.slug);
			// initialize GameMaster lookup
			if(data.gmData){
				GameMaster.setData(data.gmData);
			}

			var ranker = RankerMaster.getInstance();
			ranker.setWorkerMode(true);
			ranker.setBattleCP(data.cp);
			ranker.setBattleCup(data.cup);
			ranker.setWebRoot(data.webRoot);

			// Set pokemon lists with full Pokemon data including movesets and weight modifiers
			var pokeListMsg = data.pokemonList || [];
			var targetListMsg = data.targetList || [];
			ranker.setPokemonLists(pokeListMsg, targetListMsg);

			var result = ranker.rank(data.cp, data.scenario);

			postMessage({
				type: 'scenario-complete',
				result: {
					scenario: data.scenario,
					rankings: result,
					cup: data.cup,
					league: data.cp
				}
			});
		} catch(err) {
			console.error('Worker error in runScenario:', err);
			postMessage({type: 'error', error: err.toString()});
		}
	}
};
