// JavaScript Document

/*
* The main Pokemon class used to represent individual Pokemon in battle
*/

function Pokemon(id, i, b){

	var gm = GameMaster.getInstance();
	var data = gm.getPokemonById(id);
	var battle = b;
	var self = this;

	// CP modifiers at each level

	var cpms = [0.093999997,0.16639787,0.21573247,0.25572005,0.29024988,0.3210876,0.34921268,0.37523559,0.39956728,0.42250001,0.44310755,0.46279839,0.48168495,0.49985844,0.51739395,0.53435433,0.55079269,0.56675452,0.58227891,0.59740001,0.61215729,0.62656713,0.64065295,0.65443563,0.667934,0.68116492,0.69414365,0.70688421,0.71939909,0.7317,0.73776948,0.74378943,0.74976104,0.75568551,0.76156384,0.76739717,0.7731865,0.77893275,0.78463697,0.79030001,0.79530001,0.8003,0.8053,0.81029999,0.81529999];

	// Base properties
	this.dex = data.dex;
	this.speciesId = id;
	this.speciesName = data.speciesName;

	this.baseStats = { atk: data.baseStats.atk, def: data.baseStats.def, hp: data.baseStats.hp};
	this.stats = { atk: 0, def: 0, hp: 0 };
	this.statBuffs = [ 0, 0 ]; // 0 - attack, 1 - defense
	this.startStatBuffs = [ 0, 0 ];
	this.buffChanceModifier = 0;
	this.ivs = { atk: 0, def: 0, hp: 0 };
	this.types = [ data.types[0], data.types[1] ];
	this.cp = 0;
	this.hp = 0;
	this.startHp = 0;
	this.startEnergy = 0;
	this.startCooldown = 0;
	this.level = 40;
	this.levelCap = 40;
	this.cpm = 0.79030001;
	this.priority = 0; // Charged move priority
	this.fastMovePool = [];
	this.chargedMovePool = [];
	this.legacyMoves = [];
	this.eliteMoves = [];
	this.shadowEligible = false;
	this.shadowType = "normal"; // normal, shadow, or purified
	this.shadowAtkMult = 1;
	this.shadowDefMult = 1;

	this.typeEffectiveness = getTypeEffectivenessArray(b);

	this.fastMove = null;
	this.chargedMoves = [];

	this.isCustom = false; // Does this Pokemon have custom set levels and IV's?

	this.index = i;

	this.dps = 10; // Used later to calculate TDO

	// Battle properties

	this.energy = 0;
	this.cooldown = 0;
	this.damageWindow = 0;
	this.shields = 0;
	this.startingShields = 0;
	this.hasActed = false; // This Pokemon has acted this turn

	this.baitShields = true; // Use low energy attacks to bait shields
	this.farmEnergy = false; // use fast moves only
	this.chargedMovesOnly = false; // Only allow Charged Move actions

	// Training battle statistics

	this.battleStats = {};
	this.roundStats = {};

	// Set legacy moves

	if(data.legacyMoves){
		this.legacyMoves = data.legacyMoves;
	}
	
	if(data.eliteMoves){
		this.eliteMoves = data.eliteMoves;
	}

	// Set tags

	this.tags = [];

	if(data.tags){
		this.tags = data.tags;
	}

	// Set battle moves

	for(var i = 0; i < data.fastMoves.length; i++){
		var move = gm.getMoveById(data.fastMoves[i]);

		if(move){
			move.legacy = (self.legacyMoves.indexOf(move.moveId) > -1);
			move.elite = (self.eliteMoves.indexOf(move.moveId) > -1);
			
			if(move.elite){
				move.legacy = false;
			}
			
			move.displayName = move.name;
			
			if(move.legacy){
				move.displayName = move.name + " <sup>†</sup>";
			} else if(move.elite){
				move.displayName = move.name + " *";
			}

			this.fastMovePool.push(move);
		}
	}

	for(var i = 0; i < data.chargedMoves.length; i++){
		var move = gm.getMoveById(data.chargedMoves[i]);

		if(move){
			move.legacy = (self.legacyMoves.indexOf(move.moveId) > -1);
			move.elite = (self.eliteMoves.indexOf(move.moveId) > -1);
			
			if(move.elite){
				move.legacy = false;
			}
			
			move.displayName = move.name;
			
			if(move.legacy){
				move.displayName = move.name + " <sup>†</sup>";
			} else if(move.elite){
				move.displayName = move.name + " *";
			}

			this.chargedMovePool.push(move);
		}
	}
	
	
	// Add Return and Frustration for eligible Pokemon

	if((data.tags)&&(data.tags.indexOf("shadoweligible") > -1)){
		self.shadowEligible = true;

		if(data.level25CP <= b.getCP()){
			self.chargedMovePool.push(gm.getMoveById("RETURN"));
			self.legacyMoves.push("RETURN");
		}
	}

	if((data.tags)&&(data.tags.indexOf("shadow") > -1)){
		self.shadowEligible = true;

		if(data.tags.indexOf("shadow") > -1){
			self.chargedMovePool.push(gm.getMoveById("FRUSTRATION"));
		}

		self.legacyMoves.push("FRUSTRATION");
	}

	// Sort moves by ID for consistent order

	self.fastMovePool.sort((a,b) => (a.moveId > b.moveId) ? 1 : ((b.moveId > a.moveId) ? -1 : 0));
	self.chargedMovePool.sort((a,b) => (a.moveId > b.moveId) ? 1 : ((b.moveId > a.moveId) ? -1 : 0));

	// Given a target CP, scale to CP, set actual stats, and initialize moves

	this.initialize = function(targetCP, defaultMode){

		defaultMode = typeof defaultMode !== 'undefined' ? defaultMode : "gamemaster";

		this.cp = self.calculateCP();

		var maxCP = 10000;

		if(battle){
			maxCP = battle.getCP();
		}

		// Bandaid fix for scenarios where Pokemon who have shield baiting or stat boost settings are considered custom

		var isDefault = false;

		if((this.level == 40)&&(this.ivs.atk == 0) && (this.ivs.def == 0) && (this.ivs.hp == 0)){
			isDefault = true;
		}

		if(((targetCP)&&(! self.isCustom))||((this.cp > maxCP)&&(isDefault))){

			switch(defaultMode){
				case "scale":
					// Scale Pokemon to selected CP
					// If the Pokemon can't reach the CP limit without IV's, increment until it reaches the CP limit or 15/15/15

					var targetCPM = 1;
					var iv = -1;

					while((iv < 15) && (targetCPM > .7903)){
						iv++;

						targetCPM = Math.sqrt( (targetCP * 10) / ((this.baseStats.atk+iv) * Math.pow(this.baseStats.def+iv, 0.5) * Math.pow(this.baseStats.hp+iv, 0.5)));
					}

					this.ivs.atk = this.ivs.def = this.ivs.hp = iv;

					this.cpm = Math.min(targetCPM, .7903);
				break;

				case "maximize":
					self.maximizeStat("overall");
				break;

				case "gamemaster":
					if(maxCP == 10000){
						self.ivs.atk = self.ivs.def = self.ivs.hp = 15;
						self.setLevel(40, false);
					} else{
						var combination = data.defaultIVs["cp"+maxCP];
						self.ivs.atk = combination[1];
						self.ivs.def = combination[2];
						self.ivs.hp = combination[3];
						self.setLevel(combination[0], false);
					}
				break;
			}

		}

		//Set effective stats

		this.stats.atk = this.cpm * (this.baseStats.atk+this.ivs.atk);
		this.stats.def = this.cpm * (this.baseStats.def+this.ivs.def);
		this.stats.hp = Math.max(Math.floor(this.cpm * (this.baseStats.hp+this.ivs.hp)), 10);
		this.hp = this.stats.hp;
		this.startHp = this.hp;

		this.cp = self.calculateCP();

		if(this.cp < 10){
			this.cp = 10;
		}

		// Set Shadow Pokemon to Shadow

		if(self.hasTag("shadow")){
			self.setShadowType("shadow");
		}

		// Set moves if unset

		if(! self.fastMove){
			self.autoSelectMoves();
		} else{
			this.resetMoves();
		}
	}

	// Calculate and return the Pokemon's CP

	this.calculateCP = function(cpm = self.cpm, atk = self.ivs.atk, def = self.ivs.def, hp = self.ivs.hp){
		var cp = Math.floor(( (self.baseStats.atk+atk) * Math.pow(self.baseStats.def+def, 0.5) * Math.pow(self.baseStats.hp+hp, 0.5) * Math.pow(cpm, 2) ) / 10);

		return cp;
	}

	// Set an IV combination that maximizes atk, def, hp, or overall

	this.maximizeStat = function(sortStat) {
		combinations = self.generateIVCombinations(sortStat, 1, 1);

        if (combinations.length > 0) {
            this.ivs.atk = combinations[0].ivs.atk;
            this.ivs.def = combinations[0].ivs.def;
            this.ivs.hp = combinations[0].ivs.hp;
            this.setLevel(combinations[0].level, false)
        } else {
            this.ivs.atk = 15;
            this.ivs.def = 15;
            this.ivs.hp = 15;
            this.setLevel(self.levelCap, false);
        }

		var index = this.level - 1;
        this.stats.atk = this.cpm * (this.baseStats.atk+this.ivs.atk);
        this.stats.def = this.cpm * (this.baseStats.def+this.ivs.def);
        this.stats.hp = Math.max(Math.floor(this.cpm * (this.baseStats.hp+this.ivs.hp)), 10);
        this.hp = this.stats.hp;
        this.startHp = this.hp;

        this.cp = self.calculateCP();

		self.isCustom = true;
	}

	// Generate an array of IV combinations sorted by stat

	this.generateIVCombinations = function(sortStat, sortDirection, resultCount, filters, ivFloor) {
		var targetCP = battle.getCP();
		var level = self.levelCap;
        var atkIV = 15;
        var defIV = 15;
        var hpIV = 15;
        var calcCP = 0;
        var overall = 0;
		var bestStat = 0;
        var cpm = 0;
        var combinations = [];

		if(sortDirection == -1){
			bestStat = 10000;
		}

		var floor = 0;

		if(self.hasTag("legendary")){
			floor = 1;
		}

		if(ivFloor){
			floor = ivFloor;
		}

		if(self.hasTag("untradeable")){
			floor = 10;
		}

        hpIV = 15;
        while (hpIV >= floor) {
            defIV = 15;
            while (defIV >= floor) {
                atkIV = 15;
                while (atkIV >= floor) {
					level = 0.5;
					calcCP = 0;

					while((level < self.levelCap)&&(calcCP < targetCP)){
						level += 0.5;

						if(level % 1 == 0){
							// Set CPM for whole levels
							cpm = cpms[level - 1];
						} else{
							// Set CPM for half levels
							cpm = Math.sqrt( (Math.pow(cpms[Math.floor(level-1)], 2) + Math.pow(cpms[Math.ceil(level-1)], 2)) / 2);
						}

						calcCP = self.calculateCP(cpm, atkIV, defIV, hpIV);
					}

					if(calcCP > targetCP){
						level -= 0.5;
						if(level % 1 == 0){
							// Set CPM for whole levels
							cpm = cpms[level - 1];
						} else{
							// Set CPM for half levels
							cpm = Math.sqrt( (Math.pow(cpms[Math.floor(level-1)], 2) + Math.pow(cpms[Math.ceil(level-1)], 2)) / 2);
						}
						calcCP = this.calculateCP(cpm, atkIV, defIV, hpIV);
					}

                    if (calcCP <= targetCP) {
                        let atk = cpm * (self.baseStats.atk + atkIV) * self.shadowAtkMult;
                        let def = cpm * (self.baseStats.def + defIV) * self.shadowDefMult;
                        let hp = Math.floor(cpm * (self.baseStats.hp + hpIV));
                        overall = (hp * atk * def);

						if(self.shadowType == "shadow"){

						}

						var combination = {
							level: level,
							ivs: {
								atk: atkIV,
								def: defIV,
								hp: hpIV
							},
							atk: atk,
							def: def,
							hp: hp,
							overall: overall,
							cp: calcCP
						};

						var valid = true;

						// This whole jumble won't include combinations that don't beat our best or worst if we just want one result

						if(resultCount == 1){
							if(sortDirection == 1){
								if(combination[sortStat] < bestStat){
									valid = false;
								}
							} else if(sortDirection == -1){
								if(combination[sortStat] > bestStat){
									valid = false;
								}
							}

							if(valid){
								bestStat = combination[sortStat];
							}
						}

						// Check if a minimum value must be reached

						if(filters){
							for(var i = 0; i < filters.length; i++){
								if(combination[filters[i].stat] < filters[i].value){
									valid = false;
								}
							}
						}

						if(valid){
							combinations.push(combination);
						}
                    }
                    atkIV--;
                }
                defIV--;
            }
            hpIV--;
        }

		combinations.sort((a,b) => (a[sortStat] > b[sortStat]) ? (-1 * sortDirection) : ((b[sortStat] > a[sortStat]) ? (1 * sortDirection) : 0));
		results = combinations.splice(0, resultCount);

		return results;
	}

	// Given a defender, generate a list of Attack values that reach certain breakpoints

	this.calculateBreakpoints = function(defender){
		var effectiveness = defender.typeEffectiveness[self.fastMove.type];
		var minAttack = self.generateIVCombinations("atk", -1, 1)[0].atk;
		var maxAttack = self.generateIVCombinations("atk", 1, 1)[0].atk;
		var maxDefense = defender.generateIVCombinations("def", 1, 1)[0].def;
		var minDamage = battle.calculateDamageByStats(minAttack, defender.stats.def * defender.shadowDefMult, effectiveness, self.fastMove);
		var maxDamage = battle.calculateDamageByStats(maxAttack, defender.stats.def * defender.shadowDefMult, effectiveness, self.fastMove);

		var breakpoints = [];

		for(var i = minDamage; i <= maxDamage; i++){
			var breakpoint = battle.calculateBreakpoint(i, defender.stats.def * defender.shadowDefMult, effectiveness, self.fastMove);
			var maxDefenseBreakpoint = battle.calculateBreakpoint(i, maxDefense, effectiveness, self.fastMove);

			if(maxDefenseBreakpoint > maxAttack){
				maxDefenseBreakpoint = -1;
			}

			breakpoints.push({
				damage: i,
				attack: breakpoint,
				guaranteedAttack: maxDefenseBreakpoint
			});
		}

		return breakpoints;
	}

	// Given an attacker, generate a list of Defense values that reach certain bulkpoints

	this.calculateBulkpoints = function(attacker){
		var effectiveness = self.typeEffectiveness[attacker.fastMove.type];
		var minDefense = self.generateIVCombinations("def", -1, 1)[0].def;
		var maxDefense = self.generateIVCombinations("def", 1, 1)[0].def;
		var maxAttack = attacker.generateIVCombinations("atk", 1, 1)[0].atk * attacker.shadowAtkMult;
		var minDamage = battle.calculateDamageByStats(attacker.stats.atk * attacker.shadowAtkMult, maxDefense, effectiveness, attacker.fastMove);
		var maxDamage = battle.calculateDamageByStats(attacker.stats.atk * attacker.shadowAtkMult, minDefense, effectiveness, attacker.fastMove);

		var breakpoints = [];

		for(var i = minDamage; i <= maxDamage; i++){
			var bulkpoint = battle.calculateBulkpoint(i, attacker.stats.atk * attacker.shadowAtkMult, effectiveness, attacker.fastMove);
			var maxAttackBulkpoint = battle.calculateBulkpoint(i, maxAttack, effectiveness, attacker.fastMove);

			if(maxAttackBulkpoint > maxDefense){
				maxAttackBulkpoint = -1;
			}

			breakpoints.push({
				damage: i,
				defense: bulkpoint,
				guaranteedDefense: maxAttackBulkpoint
			});
		}

		return breakpoints;
	}

	// The benevolent cousin to this.getStabbed()
	// Returns Same Type Attack Bonus given a move

	this.getStab = function(move){
		if((move.type == this.types[0]) || (move.type == this.types[1])){
			return 1.2;
		} else{
			return 1;
		}
	}

	// Initialize moves and set their respective damage numbers

	this.resetMoves = function(){
		for(var i = 0; i < this.fastMovePool.length; i++){
			this.initializeMove(this.fastMovePool[i]);
		}

		for(var i = 0; i < this.chargedMovePool.length; i++){
			this.initializeMove(this.chargedMovePool[i]);
		}

		// Set best charged move

		self.activeChargedMoves = []; // Keep a list of charged moves sorted by energy

		if(this.chargedMoves.length > 0){

			for(var i = 0; i < self.chargedMoves.length; i++){
				self.activeChargedMoves.push(self.chargedMoves[i]);
			}

			self.activeChargedMoves.sort((a,b) => (a.energy > b.energy) ? 1 : ((b.energy > a.energy) ? -1 : 0));

			self.fastestChargedMove = self.activeChargedMoves[0];

			if(self.activeChargedMoves.length > 1){

				// If both moves cost the same energy and one has a buff effect, prioritize the buffing move

				if((self.activeChargedMoves[1].energy == self.activeChargedMoves[0].energy)&&(self.activeChargedMoves[1].buffs)&&(! self.activeChargedMoves[1].selfDebuffing)){
					var move = self.activeChargedMoves[0];
					self.activeChargedMoves.splice(0, 1);
					self.activeChargedMoves.push(move);
				}

				// If the cheaper move is a self debuffing move and the other move is a close non-debuffing move, prioritize the non-debuffing move

				if((self.activeChargedMoves[1].energy - self.activeChargedMoves[0].energy <= 10)&&(self.activeChargedMoves[0].selfAttackDebuffing)&&(! self.activeChargedMoves[1].selfDebuffing)){
					var move = self.activeChargedMoves[0];
					self.activeChargedMoves.splice(0, 1);
					self.activeChargedMoves.push(move);
				}
			}

			self.bestChargedMove = self.activeChargedMoves[0];
			self.bestChargedMove.dpe = self.bestChargedMove.damage / self.bestChargedMove.energy;

			for(var i = 0; i < self.activeChargedMoves.length; i++){
				var move = self.activeChargedMoves[i];
				move.dpe = move.damage / move.energy;

				// Use moves that have higher DPE
				if(move.dpe - self.bestChargedMove.dpe > .03){
					self.bestChargedMove = self.activeChargedMoves[i];
				}

				// When DPE is close, favor moves with guaranteed buff effects
				if((Math.abs(move.dpe - self.bestChargedMove.dpe) < .03)&&(self.bestChargedMove.buffs)&&(move.buffs)&&(move.buffApplyChance > self.bestChargedMove.buffApplyChance)&&(! move.selfDebuffing)){
					self.bestChargedMove = self.activeChargedMoves[i];
				}
			}

		} else{
			self.bestChargedMove = null;
		}
	}

	// Set a moves stab and damage traits given an opponent

	this.initializeMove = function(move){
		var opponent = battle.getOpponent(self.index);

		move.stab = self.getStab(move);

		if(opponent){
			move.damage = battle.calculateDamage(self, opponent, move);
		} else{
			move.damage = Math.floor(move.power * move.stab);
		}

		move.dps = move.damage / (move.cooldown / 500); // I guess this really damage per turn

		if(move.energy > 0){
			move.dpe = move.damage / move.energy;

			// If move buffs attack, apply that

			if(move.buffs){
				var buffEffect = 0;

				if((move.buffTarget == "self")&&(move.buffs[0] > 0)){
					buffEffect = move.buffs[0] * (80 / move.energy); // Factor in a rough number of times the move will be used in battle
				} else if((move.buffTarget == "opponent")&&(move.buffs[1] < 0)){
					buffEffect = Math.abs(move.buffs[1]) * (80 / move.energy);
				}

				var multiplier = ( (gm.data.settings.buffDivisor +(buffEffect* move.buffApplyChance)) / gm.data.settings.buffDivisor);

				move.dpe *= multiplier;
			}
		} else{
			move.eps = move.energyGain / (move.cooldown / 500);
			move.deps = move.dps * move.eps;
		}

	}

	// Select moves, given a Charged Move count (minimum 1)

	this.autoSelectMoves = function(count){

		count = typeof count !== 'undefined' ? count : 2;

		// First, initialize all moves to get updated damage numbers

		this.resetMoves();

		// Feed move pools into new arrays so they can be manipulated without affecting the originals

		var fastMoves = [];
		var chargedMoves = [];
		var targetArrs = [fastMoves, chargedMoves];
		var sourceArrs = [self.fastMovePool, self.chargedMovePool];

		for(var i = 0; i < sourceArrs.length; i++){
			for(var n = 0; n < sourceArrs[i].length; n++){
				targetArrs[i].push(sourceArrs[i][n]);
			}
		}

		// Pop beams to the front

		if((battle.getCup())&&(battle.getCup().name == "beam")){
			for(var i = 0; i < chargedMoves.length; i++){
				if((chargedMoves[i].moveId == "SOLAR_BEAM")||(chargedMoves[i].moveId == "HYPER_BEAM")){
					chargedMoves[i].dpe = 100;
				}
			}
		}

		// Sort charged moves by DPE

		chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));

		// Calculate TDO for each fast move and sort

		var opponent = battle.getOpponent(self.index);

		for(var i = 0; i < fastMoves.length; i++){
			var move = fastMoves[i];

			move.tdo = self.calculateTDO(move, chargedMoves[0], opponent, false);
		}

		fastMoves.sort((a,b) => (a.tdo > b.tdo) ? -1 : ((b.tdo > a.tdo) ? 1 : 0));

		// Do this for realsies so the opponent can compare

		self.calculateTDO(fastMoves[0], chargedMoves[0], opponent, true);

		self.fastMove = fastMoves[0];

		self.chargedMoves = [];

		if(count > 0){
			self.chargedMoves.push(chargedMoves[0]);

			chargedMoves.splice(0,1);
		}


		// Sort remaining charged moves by dpe, weighted by energy

		for(var i = 0; i < chargedMoves.length; i++){
			var move = chargedMoves[i];

			move.dpe *= 1 / move.energy;

			// If this move has a guaranteed stat effect, consider that as well

			if((move.buffApplyChance)&&(move.buffApplyChance == 1)){
				move.dpe *= 2;
			}
		}

		if(chargedMoves.length > 0){
			chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));

			for(var i = 0; i < count-1; i++){
				self.chargedMoves.push(chargedMoves[i]);
			}
		}

	}

	// Given a type string, move id, and charged move index, set a specific move

	this.selectMove = function(type, id, index, disallowCustomAddition){
		var moveFound = false;
		var arr = this.fastMovePool;

		if(type == "charged"){
			arr = this.chargedMovePool;
		}

		var i = 0;
		var move;

		if(index > self.chargedMoves.length){
			index = self.chargedMoves.length;
		}

		for(i = 0; i < arr.length; i++){
			if(arr[i].moveId == id){
				if(type == "fast"){
					move = arr[i];
					this.fastMove = move;
					moveFound = true;
					break;
				} else{
					move = arr[i];
					this.chargedMoves[index] = move;
					moveFound = true;
					break;
				}
			}
		}

		// If charged move is set to none, clear 2nd charged move

		if((type == "charged") && (id == "none")){
			this.chargedMoves.splice(index,1);
		}

		// If identical charged moves are selected, select first available

		if((type == "charged") && (this.chargedMoves.length > 1)){
			var nonIndex = 0;

			if(index == 0){
				nonIndex = 1;
			}

			if(id == this.chargedMoves[nonIndex].moveId){
				for(i = 0; i < arr.length; i++){
					if(arr[i].moveId != id){
						this.chargedMoves[nonIndex] = arr[i];
						break;
					}
				}
			}
		}

		// If the move wasn't found, add it to the movepool
		if((! disallowCustomAddition)&&(! moveFound)){
			self.addNewMove(id, arr, true, type, index);
		}
	}

	// Obtain a Pokemon's recommended moveset from the rankings and select them

	this.selectRecommendedMoveset = function(category){
		category = typeof category !== 'undefined' ? category : "overall";

		var cupName = "all";

		if(battle.getCup()){
			cupName = battle.getCup().name;
		}

		var key = cupName + category + battle.getCP();

		if(! gm.rankings[key]){
			console.log("Ranking data not loaded yet");
			return;
		}

		var rankings = gm.rankings[key];

		for(var i = 0; i < rankings.length; i++){
			var r = rankings[i];

			if(r.speciesId == self.speciesId){
				var moveIndexes = r.moveStr.split("-");

				self.selectMove("fast", self.fastMovePool[moveIndexes[0]].moveId);
				self.selectMove("charged", self.chargedMovePool[moveIndexes[1]-1].moveId, 0);

				if(moveIndexes[2] != 0){
					self.selectMove("charged", self.chargedMovePool[moveIndexes[2]-1].moveId, 1);
				}

				// Assign overall score for reference
				self.overall = r.score;
				self.scores = r.scores;
				break;
			}
		}
	}

	// Add new move to the supplied move pool, with a flag to automatically select the new move

	this.addNewMove = function(id, movepool, selectNewMove, moveType, index){
		var move = gm.getMoveById(id);

		if(! move){
			return false;
		}

		move.isCustom = true;
		movepool.push(move);

		if(selectNewMove){
			self.selectMove(moveType, id, index, true)
		}

		var props = {
			moveType: moveType,
			moveId: id
		};

		// Don't do this yet, since it breaks Multi-Battle links

		// gm.modifyPokemonEntry(self.speciesId, "movepool", props);

		self.resetMoves();
	}

	// This function calculates TDO given moveset and opponent, used for move selection

	this.calculateTDO = function(fastMove, chargedMove, opponent, final){
		var opponentDPS = Math.floor(20 * (100 / this.stats.def));
		var opponentDef = 100;

		if(opponent){
			opponentDPS = opponent.dps;
			opponentDef = opponent.stats.def;
		}

		var cycleFastMoves = Math.ceil(chargedMove.energy / fastMove.energyGain);
		var cycleTime = cycleFastMoves * (fastMove.cooldown / 2000);
		var cycleDamage = (cycleFastMoves * fastMove.damage) + chargedMove.damage;
		var cycleDPS = cycleDamage / cycleTime;

		if(final){
			this.dps = cycleDPS;
		}

		var timeToFaint = this.stats.hp / opponentDPS;
		var tdo = cycleDPS * timeToFaint;

		return tdo;
	}

	// Return whether or not this Pokemon has a move with buff or debuff effects

	this.hasBuffMove = function(){
		var hasBuffMove = false;

		if((self.fastMove.buffs)&&(self.fastMove.buffApplyChance < 1)){
			hasBuffMove = true;
		}

		for(var i = 0; i < self.chargedMoves.length; i++){
			if((self.chargedMoves[i].buffs)&&(self.chargedMoves[i].buffApplyChance < 1)){
				hasBuffMove = true;
			}
		}

		return hasBuffMove;
	}

	// Return effectiveness array for offense or defense

	/*
	* So this is really weird. Javascript functions declared like this can't be called until
	* after the declaration. I need to call this in the constructor. So instead of moving
	* the one line of code beneath the function declaration, I chose ... this.
	*/

	self.getTypeEffectivenessArray = function(){
		return getTypeEffectivenessArray(self.battle);
	}

	function getTypeEffectivenessArray(battle){

		if(! battle){
			return;
		}

		var arr = [];

		var allTypes = getAllTypes();

		for(var n = 0; n < allTypes.length; n++){
			effectiveness = battle.getEffectiveness(allTypes[n], self.types);
			arr[allTypes[n].toLowerCase()] = effectiveness;
		}

		return arr;
	}

	// Array of all types

	function getAllTypes(){
		var types = ["Bug","Dark","Dragon","Electric","Fairy","Fighting","Fire","Flying","Ghost","Grass","Ground","Ice","Normal","Poison","Psychic","Rock","Steel","Water"];

		return types;
	}

	// Resets Pokemon prior to battle

	this.reset = function(){
		self.hp = self.startHp;
		self.energy = self.startEnergy;
		self.cooldown = self.startCooldown;
		self.damageWindow = 0;
		self.shields = self.startingShields;
		self.statBuffs = [self.startStatBuffs[0], self.startStatBuffs[1]];
		self.resetMoves();
	}

	// Fully reset all Pokemon stats

	this.fullReset = function(){
		self.startHp = self.stats.hp;
		self.startEnergy = 0;
		self.startCooldown = 0;
		self.startStatBuffs = [0, 0];

		self.reset();
	}

	// Reset stats for emulated battles

	this.resetBattleStats = function(){
		self.battleStats = {
			damage: 0,
			shieldsBurned: 0,
			shieldsUsed: 0,
			damageBlocked: 0,
			damageFromShields: 0,
			shieldsFromShields: 0,
			switchAdvantages: 0,
			energyGained: 0,
			energyUsed: 0,
			chargedDamage: 0
		};
	}

	this.setShields = function(amount){
		this.startingShields = parseInt(amount);
	}

	this.setStartHp = function(amount){
		this.startHp = Math.min(amount, this.stats.hp);

		if(! amount){
			this.startHp = this.stats.hp;
		}
	}

	this.setStartEnergy = function(amount){
		this.startEnergy = Math.min(amount, 100);

		if(! amount){
			this.startEnergy = 0;
		}
	}

	this.setStartBuffs = function(buffs){
		this.startStatBuffs = buffs;
		this.statBuffs = [buffs[0], buffs[1]];
	}

	this.setLevel = function(amount, initialize){
		initialize = typeof initialize !== 'undefined' ? initialize : true;

		this.level = amount;
		var index = (amount - 1);

		if(index % 1 == 0){
			// Set CPM for whole levels
			this.cpm = cpms[index];
		} else{
			// Set CPM for half levels
			this.cpm = Math.sqrt( (Math.pow(cpms[Math.floor(index)], 2) + Math.pow(cpms[Math.ceil(index)], 2)) / 2);
		}

		if(initialize){
			this.isCustom = true;
			this.initialize(false);
		}
	}

	this.setIV = function(iv, amount){
		if(iv == "atk"){
			this.ivs.atk = parseInt(amount);
		} else if(iv == "def"){
			this.ivs.def = parseInt(amount);
		} else if(iv == "hp"){
			this.ivs.hp = parseInt(amount);
		}

		this.isCustom = true;
		this.initialize(false);
	}

	// Set battle reference object

	this.setBattle = function(b){
		battle = b;
	}

	// Get battle reference object

	this.getBattle = function(){
		return battle;
	}

	// Buff or debuff stats given an array of buffs

	this.applyStatBuffs = function(buffs){

		var maxBuffStages = gm.data.settings.maxBuffStages;

		for(var i = 0; i < buffs.length; i++){
			self.statBuffs[i] += buffs[i];

			self.statBuffs[i] = Math.min(self.statBuffs[i], maxBuffStages);
			self.statBuffs[i] = Math.max(self.statBuffs[i], -maxBuffStages);
		}

	}

	// Return effective stat after applying modifier, 0 - attack, 1 - defense

	this.getEffectiveStat = function(index){
		var buffDivisor = gm.data.settings.buffDivisor;
		var multiplier;

		if(self.statBuffs[index] > 0){
			multiplier = (buffDivisor + self.statBuffs[index]) / buffDivisor;
		} else{
			multiplier = buffDivisor / (buffDivisor - self.statBuffs[index]);
		}

		if(self.shadowType == "shadow"){
			if(index == 0){
				multiplier *= self.shadowAtkMult;
			} else if(index == 1){
				multiplier *= self.shadowDefMult;
			}
		}

		if(index == 0){
			return self.stats.atk * multiplier;
		} else if(index == 1){
			return self.stats.def * multiplier;
		}

		return false;
	}

	// Return battle rating for this Pokemon

	this.getBattleRating = function(){
		var opponent = battle.getOpponent(self.index);

		if(! opponent){
			return 0;
		}

		return Math.floor( (500 * ((opponent.stats.hp - opponent.hp) / opponent.stats.hp)) + (500 * (self.hp / self.stats.hp)))
	}

	// Return whether or not this Pokemon has a specific tag

	this.hasTag = function(tag){
		return (self.tags.indexOf(tag) > -1);
	}

	// Output a string of numbers for URL building and recreating a Pokemon

	this.generateURLPokeStr = function(context){
		var pokeStr = self.speciesId;

		if((self.isCustom)||(self.startStatBuffs[0] != 0)||(self.startStatBuffs[1] != 0)){
			var arr = [self.level];

			arr.push(self.ivs.atk, self.ivs.def, self.ivs.hp, self.startStatBuffs[0]+gm.data.settings.maxBuffStages, self.startStatBuffs[1]+gm.data.settings.maxBuffStages, self.baitShields ? 1 : 0);

			// Stat buffs are increased by 4 so the URL doesn't have to deal with parsing negative numbers

			var str = arr.join("-");

			pokeStr += "-" + str;
		}

		if(self.priority != 0){
			pokeStr += "-p";
		}

		if((self.shadowType != "normal")&&(self.speciesId.indexOf("_shadow") == -1)){
			pokeStr += "-"+self.shadowType;
		}

		if(context == "team-builder"){
			pokeStr += "-m-" + self.generateURLMoveStr();
		}

		return pokeStr;
	}


	// Output a string of numbers for URL building and recreating a moveset

	this.generateURLMoveStr = function(){
		var moveStr = '';

		var fastMoveIndex = self.fastMovePool.indexOf(self.fastMove);
		var chargedMove1Index = self.chargedMovePool.indexOf(self.chargedMoves[0])+1;
		var chargedMove2Index = self.chargedMovePool.indexOf(self.chargedMoves[1])+1;

		moveStr = fastMoveIndex + "-" + chargedMove1Index + "-" + chargedMove2Index;

		// Check for any custom moves;

		if(self.fastMove.isCustom){
			moveStr += "-" + self.fastMove.moveId;
		}

		for(var i = 0; i < self.chargedMoves.length; i++){
			if(self.chargedMoves[i].isCustom){
				moveStr += "-" + self.chargedMoves[i].moveId + "-" + i;
			}
		}

		return moveStr;
	}

	// Output a string of the Pokemon's moveset abbreviation

	this.generateMovesetStr = function(){
		var moveAbbreviationStr = self.fastMove.abbreviation;

		for(var i = 0; i < self.chargedMoves.length; i++){
			if(i == 0){
				moveAbbreviationStr += "+" + self.chargedMoves[i].abbreviation;
			} else{
				moveAbbreviationStr += "/" + self.chargedMoves[i].abbreviation;
			}
		}

		return moveAbbreviationStr;
	}

	// Change the value of this Pokemon's form type (normal, shadow, purified)

	this.setShadowType = function(val){
		self.shadowType = val;

		if(self.shadowType == "shadow"){
			self.shadowAtkMult = gm.data.settings.shadowAtkMult;
			self.shadowDefMult = gm.data.settings.shadowDefMult;

			if(self.speciesName.indexOf("Shadow") == -1){
				self.speciesName = self.speciesName + " (Shadow)";
			}
		} else{
			self.shadowAtkMult = 1;
			self.shadowDefMult = 1;

			if(self.speciesName.indexOf(" (Shadow)") > -1){
				self.speciesName = self.speciesName.replace(" (Shadow)","");
			}
		}
	}
}
