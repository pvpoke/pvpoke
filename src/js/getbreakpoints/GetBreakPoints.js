var getBreakPoints = function(speciesId, league, moveset){
    var calcPointCallback = (poke, opp) => poke.calculateBreakpoints(opp);
    calcPoints(speciesId, league, moveset, "guaranteedAttack", calcPointCallback);
}

var getBulkPoints = function(speciesId, league, moveset){
    var calcPointCallback = (poke, opp) => poke.calculateBulkpoints(opp);
    calcPoints(speciesId, league, moveset, "guaranteedDefense", calcPointCallback);
}

var calcPoints = function(speciesId, league, moveset, sortCriteria, calcPointCallback){
    var battle = new Battle();
    battle.setCP(league);

    var gm = GameMaster.getInstance();
    let rankingsKey = "alloverall" + league;
    let rankings = gm.rankings[rankingsKey];
    
    var pokemon = new Pokemon(speciesId, 0, battle);
    pokemon.initialize(battle.getCP(), "maximize");
    pokemon.selectMove("fast", moveset[0]);
    pokemon.selectMove("charged", moveset[1], 0);

    if(moveset.length > 2){
        pokemon.selectMove("charged", moveset[2],1);
    } else{
        pokemon.selectMove("charged", "none", 1);
    }
    
    let breakpoints = [];
    for(let poke of rankings){
        if(poke.score < 75) break;
        let opponent = new Pokemon(poke.speciesId, 1, battle);
        opponent.initialize(battle.getCP(), "maximize");
        opponent.selectMove("fast", poke.moveset[0]);
        opponent.selectMove("charged", poke.moveset[1], 0);
        let breakpoint = calcPointCallback(pokemon, opponent);
        breakpoint.forEach(bp => {
            bp.opponent = poke.speciesId;
            bp.ownMove = moveset[0];
            bp.oppMove = poke.moveset[0];
        });
        breakpoints = breakpoints.concat(breakpoint);
    }
    breakpoints.sort((bp1, bp2) => bp2[sortCriteria]-bp1[sortCriteria]);
    console.log(breakpoints);
}