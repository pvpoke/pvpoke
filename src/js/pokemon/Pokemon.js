// JavaScript Document

/*
* The main Pokemon class used to represent individual Pokemon in battle
*/

function Pokemon(id, i, b){

	id = id.replace("_xl","");

	var gm = GameMaster.getInstance();
	var data = gm.getPokemonById(id);
	var battle = b;
	var self = this;

	// CP modifiers at each level

	var cpms = [0.0939999967813491, 0.135137430784308, 0.166397869586944, 0.192650914456886, 0.215732470154762, 0.236572655026622, 0.255720049142837, 0.273530381100769, 0.290249884128570, 0.306057381335773, 0.321087598800659, 0.335445032295077, 0.349212676286697, 0.362457748778790, 0.375235587358474, 0.387592411085168, 0.399567276239395, 0.411193549517250, 0.422500014305114, 0.432926413410414, 0.443107545375824, 0.453059953871985, 0.462798386812210, 0.472336077786704, 0.481684952974319, 0.490855810259008, 0.499858438968658, 0.508701756943992, 0.517393946647644, 0.525942508771329, 0.534354329109191, 0.542635762230353, 0.550792694091796, 0.558830599438087, 0.566754519939422, 0.574569148039264, 0.582278907299041, 0.589887911977272, 0.597400009632110, 0.604823657502073, 0.612157285213470, 0.619404110566050, 0.626567125320434, 0.633649181622743, 0.640652954578399, 0.647580963301656, 0.654435634613037, 0.661219263506722, 0.667934000492096, 0.674581899290818, 0.681164920330047, 0.687684905887771, 0.694143652915954, 0.700542893277978, 0.706884205341339, 0.713169102333341, 0.719399094581604, 0.725575616972598, 0.731700003147125, 0.734741011137376, 0.737769484519958, 0.740785574597326, 0.743789434432983, 0.746781208702482, 0.749761044979095, 0.752729105305821, 0.755685508251190, 0.758630366519684, 0.761563837528228, 0.764486065255226, 0.767397165298461, 0.770297273971590, 0.773186504840850, 0.776064945942412, 0.778932750225067, 0.781790064808426, 0.784636974334716, 0.787473583646825, 0.790300011634826, 0.792803950958807, 0.795300006866455, 0.797803921486970, 0.800300002098083, 0.802803892322847, 0.805299997329711, 0.807803863460723, 0.810299992561340, 0.812803834895026, 0.815299987792968, 0.817803806620319, 0.820299983024597, 0.822803778631297, 0.825299978256225, 0.827803750922782, 0.830299973487854, 0.832803753381377, 0.835300028324127, 0.837803755931569, 0.840300023555755, 0.842803729034748, 0.845300018787384, 0.847803702398935, 0.850300014019012, 0.852803676019539, 0.855300009250640, 0.857803649892077, 0.860300004482269, 0.862803624012168, 0.865299999713897];

	if(! data){
		console.log(id + " not found");
		return false;
	}

	// Base properties
	this.data = data;
	this.dex = data.dex;
	this.speciesId = id;
	this.aliasId = this.speciesId;
	this.activeFormId = this.speciesId;
	this.canonicalId = id.replace("_xs","");
	this.speciesName = data.speciesName;

	// Use an alias for duplicate Pokemon entries to redirect to the main Pokemon ID
	if(data.aliasId){
		this.aliasId = data.aliasId;
	}

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
	this.startFormId = this.activeFormId;
	this.level = 50;
	this.levelCap = 50; // Variable level cap as determined by the battle settings
	this.baseLevelCap = 50; // The default level cap as determined by the game master
	this.baseLevelFloor = 1; // IV combinations won't go lower than this level
	this.cpm = 0.840300023555755;
	this.priority = 0; // Charged move priority
	this.fastMovePool = [];
	this.chargedMovePool = [];
	this.legacyMoves = [];
	this.eliteMoves = [];
	this.shadowEligible = false;
	this.shadowType = "normal"; // normal, shadow, or purified
	this.shadowAtkMult = 1;
	this.shadowDefMult = 1;
	this.released = data.released; // Used to filter Pokemon in rankings
	this.buddyDistance = data.buddyDistance;
	this.thirdMoveCost = data.thirdMoveCost;

	if(data.family){
		this.family = data.family;
	}

	if(data.formChange){
		this.formChange = data.formChange;
	}

	this.typeEffectiveness = getTypeEffectivenessArray(b);

	this.fastMove = null;
	this.chargedMoves = [];

	this.isCustom = false; // Does this Pokemon have custom set levels and IV's?
	this.autoLevel = false; // Automatically adjust a Pokemon to league CP when adjusting IVs

	this.index = i;

	this.dps = 10; // Used later to calculate TDO

	// Battle properties

	this.energy = 0;
	this.cooldown = 0;
	this.damageWindow = 0;
	this.shields = 0;
	this.startingShields = 0;
	this.hasActed = false; // This Pokemon has acted this turn

	this.baitShields = 1; // 0 - doesn't bait, 1 - baits selectively, 2 - always baits
	this.farmEnergy = false; // use fast moves only
	this.chargedMovesOnly = false; // Only allow Charged Move actions
	this.optimizeMoveTiming = true; // Optimize move timing to prevent opponent from getting extra turns
	this.turnsToKO = -1;

	// Training battle statistics

	this.battleStats = {};
	this.roundStats = {};

	// Custom ranking properties

	this.rankingWeight = 1;

	// Set legacy moves

	if(data.legacyMoves){
		this.legacyMoves = data.legacyMoves.slice();
	}

	if(data.eliteMoves){
		this.eliteMoves = data.eliteMoves.slice();
	}

	// Set tags

	this.tags = [];

	if(data.tags){
		this.tags = data.tags.slice();
	}

	// Set nicknames

	this.nicknames = [];

	if(data.nicknames){
		this.nicknames = data.nicknames.slice();
	}

	// Set level cap
	this.levelCap = b.getLevelCap();

	if(data.levelCap){
		this.baseLevelCap = data.levelCap;
		this.levelCap = data.levelCap;
	}

	if(data.levelFloor){
		this.baseLevelFloor = data.levelFloor;
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
				move.displayName = move.name + "<sup>†</sup>";
			} else if(move.elite){
				move.displayName = move.name + "*";
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
				move.displayName = move.name + "<sup>†</sup>";
			} else if(move.elite){
				move.displayName = move.name + "*";
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

		if((b.getLevelCap() <= self.baseLevelCap)&&(self.levelCap - b.getLevelCap() > 1)){
			self.levelCap = b.getLevelCap();
		}

		var maxCP = 10000;

		if(battle){
			maxCP = battle.getCP();
		}

		// Bandaid fix for scenarios where Pokemon who have shield baiting or stat boost settings are considered custom

		var isDefault = false;

		if((this.level == 40)&&(this.ivs.atk == 0) && (this.ivs.def == 0) && (this.ivs.hp == 0) && (! self.autoLevel)){
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
						self.setLevel(self.levelCap, false);
					} else{
						var combination = data.defaultIVs["cp"+maxCP];

						if((self.levelCap == 40)&&(data.defaultIVs["cp"+maxCP+"l40"])){
							combination = data.defaultIVs["cp"+maxCP+"l40"];
						}

						// If a valid combination exists for this CP cap
						if(combination){
							var level = Math.min(self.levelCap, combination[0]);

							if(combination){
								self.ivs.atk = combination[1];
								self.ivs.def = combination[2];
								self.ivs.hp = combination[3];
								self.setLevel(level, false);
							} else{
								self.ivs.atk = 15;
								self.ivs.def = 15;
								self.ivs.hp = 15;
								self.setLevel(self.levelCap, false);
							}
						} else{
							self.ivs.atk = 15;
							self.ivs.def = 15;
							self.ivs.hp = 15;
							self.setLevel(1, false);
						}


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
			self.fastMove = self.fastMovePool[0];
			self.chargedMoves = [self.chargedMovePool[0]];

			if(self.chargedMovePool.length > 1){
				self.chargedMoves.push(self.chargedMovePool[1]);
			}
		}
		this.resetMoves();
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

		if((self.hasTag("legendary") || self.hasTag("ultrabeast")) && ! self.hasTag("wildlegendary")){
			floor = 1;
		}

		if((self.hasTag("legendary") || self.hasTag("ultrabeast")) && (self.shadowType == "shadow" || self.hasTag("shadow"))){
			floor = 6;
		}

		if(ivFloor){
			floor = ivFloor;
		}

		if(self.hasTag("untradeable")){
			floor = 10;
		}

		if(self.hasMove("RETURN")){
			floor = 2;
		}

        hpIV = 15;
        while (hpIV >= floor) {
            defIV = 15;
            while (defIV >= floor) {
                atkIV = 15;
                while (atkIV >= floor) {
					if(targetCP > 500){ // Ignore level floor for Little Cup right now
						level = self.baseLevelFloor;
					} else{
						level = 0.5;
					}

					calcCP = 0;

					while((level < self.levelCap)&&(calcCP < targetCP)){
						level += 0.5;

						cpm = cpms[(level-1) * 2];

						/*if(level % 1 == 0){
							// Set CPM for whole levels
							cpm = cpms[level - 1];
						} else{
							// Set CPM for half levels
							cpm = Math.sqrt( (Math.pow(cpms[Math.floor(level-1)], 2) + Math.pow(cpms[Math.ceil(level-1)], 2)) / 2);
						}*/

						calcCP = self.calculateCP(cpm, atkIV, defIV, hpIV);
					}

					if(calcCP > targetCP){
						level -= 0.5;

						cpm = cpms[(level-1) * 2];
						/*if(level % 1 == 0){
							// Set CPM for whole levels
							cpm = cpms[level - 1];
						} else{
							// Set CPM for half levels
							cpm = Math.sqrt( (Math.pow(cpms[Math.floor(level-1)], 2) + Math.pow(cpms[Math.ceil(level-1)], 2)) / 2);
						}*/
						calcCP = this.calculateCP(cpm, atkIV, defIV, hpIV);
					}

                    if (calcCP <= targetCP) {
                        let atk = cpm * (self.baseStats.atk + atkIV);
                        let def = cpm * (self.baseStats.def + defIV);
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

	// Return the rank number of this Pokemon's IV combination for a given stat

	this.getIVRank = function(sortStat){
		var combinations = this.generateIVCombinations(sortStat, 1, 4096);
		var rank = combinations.findIndex((combo) => combo.ivs.atk == this.ivs.atk && combo.ivs.def == this.ivs.def && combo.ivs.hp == this.ivs.hp);
		rank++;

		return { rank: rank, count: combinations.length };
	}

	// Given a defender, generate a list of Attack values that reach certain breakpoints

	this.calculateBreakpoints = function(defender, move){
		var attackStatMultiplier = self.getStatBuffMultiplier(0, true);
		var defenseStatMultiplier = defender.getStatBuffMultiplier(1, true);

		var effectiveness = defender.typeEffectiveness[move.type];
		var minAttack = self.generateIVCombinations("atk", -1, 1)[0].atk * self.shadowAtkMult * attackStatMultiplier;
		var maxAttack = self.generateIVCombinations("atk", 1, 1)[0].atk * self.shadowAtkMult * attackStatMultiplier;
		var maxDefense = defender.generateIVCombinations("def", 1, 1)[0].def;

		var minDamage = battle.calculateDamageByStats(self, defender, minAttack, defender.stats.def * defender.shadowDefMult * defenseStatMultiplier, effectiveness, move);
		var maxDamage = battle.calculateDamageByStats(self, defender, maxAttack, defender.stats.def * defender.shadowDefMult * defenseStatMultiplier, effectiveness, move);

		var breakpoints = [];

		for(var i = minDamage; i <= maxDamage; i++){
			var breakpoint = battle.calculateBreakpoint(self, defender, i, defender.stats.def * defender.shadowDefMult * defenseStatMultiplier, effectiveness, move);
			var maxDefenseBreakpoint = battle.calculateBreakpoint(self, defender, i, maxDefense * defender.shadowDefMult * defenseStatMultiplier, effectiveness, move);

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

	this.calculateBulkpoints = function(attacker, move){
		var attackStatMultiplier = attacker.getStatBuffMultiplier(0, true);
		var defenseStatMultiplier = self.getStatBuffMultiplier(1, true);

		var effectiveness = self.typeEffectiveness[move.type];
		var minDefense = self.generateIVCombinations("def", -1, 1)[0].def * self.shadowDefMult * defenseStatMultiplier;
		var maxDefense = self.generateIVCombinations("def", 1, 1)[0].def * self.shadowDefMult * defenseStatMultiplier;
		var maxAttack = attacker.generateIVCombinations("atk", 1, 1)[0].atk * attacker.shadowAtkMult;
		var minDamage = battle.calculateDamageByStats(attacker, self, attacker.stats.atk * attacker.shadowAtkMult * attackStatMultiplier, maxDefense, effectiveness, move);
		var maxDamage = battle.calculateDamageByStats(attacker, self, attacker.stats.atk * attacker.shadowAtkMult * attackStatMultiplier, minDefense, effectiveness, move);
		var breakpoints = [];

		for(var i = minDamage; i <= maxDamage; i++){
			var bulkpoint = battle.calculateBulkpoint(attacker, self, i, attacker.stats.atk * attacker.shadowAtkMult * attackStatMultiplier, effectiveness, move);
			var maxAttackBulkpoint = battle.calculateBulkpoint(attacker, self, i, maxAttack  * attacker.shadowAtkMult * attackStatMultiplier, effectiveness, move);

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

				/*	Each chance buff move has an incrementing buff apply meter that will deterministically apply chance buffs
				*	once this value crosses each whole number.
				*/

				if(self.chargedMoves[i].buffs && self.chargedMoves[i].buffApplyChance < 1){
					self.chargedMoves[i].buffApplyMeter = self.chargedMoves[i].buffApplyChance;

					// For moves with a 50% chance, apply on the second activation
					if(self.chargedMoves[i].buffApplyChance == .5){
						self.chargedMoves[i].buffApplyMeter = 0;
					}
				}

				self.activeChargedMoves.push(self.chargedMoves[i]);
			}

			self.activeChargedMoves.sort((a,b) => (a.energy > b.energy) ? 1 : ((b.energy > a.energy) ? -1 : 0));

			self.fastestChargedMove = self.activeChargedMoves[0];

			if(self.activeChargedMoves.length > 1){

				// If both moves cost the same energy and one has a buff effect, prioritize the buffing move, or the move that does more damage

				if((self.activeChargedMoves[1].energy == self.activeChargedMoves[0].energy)&&(! self.activeChargedMoves[1].selfDebuffing)){

					if((self.activeChargedMoves[1].buffs)||(self.activeChargedMoves[1].damage > self.activeChargedMoves[0].damage)){
						var move = self.activeChargedMoves[0];
						self.activeChargedMoves.splice(0, 1);
						self.activeChargedMoves.push(move);
					}
				}

				// If both moves cost the same energy and one has a guaranteed buff effect, prioritize the buffing move

				if((self.activeChargedMoves[1].energy == self.activeChargedMoves[0].energy)&&(self.activeChargedMoves[0].buffs)&&(self.activeChargedMoves[1].buffs)&&(! self.activeChargedMoves[1].selfDebuffing)&&(self.activeChargedMoves[0].buffs)&&(self.activeChargedMoves[1].buffApplyChance > self.activeChargedMoves[0].buffApplyChance)){
					var move = self.activeChargedMoves[0];
					self.activeChargedMoves.splice(0, 1);
					self.activeChargedMoves.push(move);
				}

				// The Zap Cannon Registeel clause! It will treat Focus Blast like a self debuffing move and prefer Zap Cannon shields up

				if((self.activeChargedMoves[0].moveId == "FOCUS_BLAST")&&(self.activeChargedMoves[1].moveId == "ZAP_CANNON")){
					if(self.activeChargedMoves[1].dpe - self.activeChargedMoves[0].dpe > -.3){
						self.activeChargedMoves[0].buffs = [0,0];
						self.activeChargedMoves[0].buffTarget = "self";
						self.activeChargedMoves[0].selfDebuffing = true;
					} else{
						delete self.activeChargedMoves[0].buffs;
						delete self.activeChargedMoves[0].buffTarget;
						delete self.activeChargedMoves[0].selfDebuffing;
					}
				}

				// If both moves cost similar energy and DPE and one has a buff effect, prioritize the buffing move

				if((self.activeChargedMoves[1].energy - self.activeChargedMoves[0].energy <= 10)&&(! self.activeChargedMoves[1].selfDebuffing)){

					if((self.activeChargedMoves[1].selfBuffing)&&(self.activeChargedMoves[0].dpe - self.activeChargedMoves[1].dpe < .3)){
						var move = self.activeChargedMoves[0];
						self.activeChargedMoves.splice(0, 1);
						self.activeChargedMoves.push(move);
					}
				}

				// If the cheaper move is a self debuffing move and the other move is a close non-debuffing move, prioritize the non-debuffing move

				if((self.activeChargedMoves[1].energy - self.activeChargedMoves[0].energy <= 10)&&(self.activeChargedMoves[0].selfAttackDebuffing)&&(! self.activeChargedMoves[1].selfDebuffing)){
					var move = self.activeChargedMoves[0];
					self.activeChargedMoves.splice(0, 1);
					self.activeChargedMoves.push(move);
				}

				// If the cheaper move is a self debuffing move and the other move is a close non-debuffing move, prioritize the non-debuffing move if the self debuffing move cannot be stacked

				if((self.activeChargedMoves[1].energy - self.activeChargedMoves[0].energy <= 10)&&(self.activeChargedMoves[0].selfDebuffing)&&(self.activeChargedMoves[0].energy > 50)&&(! self.activeChargedMoves[1].selfDebuffing)){
					var move = self.activeChargedMoves[0];
					self.activeChargedMoves.splice(0, 1);
					self.activeChargedMoves.push(move);
				}

				// If the second move is a close energy, self buffing move, prioritize it as the bait move

				if(self.activeChargedMoves[1].energy - self.activeChargedMoves[0].energy <= 5 && self.activeChargedMoves[1].selfBuffing){
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
				if(((move.dpe - self.bestChargedMove.dpe > .03)&&(move.moveId != "SUPER_POWER"))||(move.dpe - self.bestChargedMove.dpe > .3)){
					if((! self.bestChargedMove.selfBuffing)||((self.bestChargedMove.selfBuffing)&&(move.dpe - self.bestChargedMove.dpe > .3))){
						self.bestChargedMove = self.activeChargedMoves[i];
					}

				}

				// When DPE is close, favor moves with guaranteed buff effects
				if((Math.abs(move.dpe - self.bestChargedMove.dpe) < .03)&&(self.bestChargedMove.buffs)&&(move.buffs)&&(move.buffApplyChance > self.bestChargedMove.buffApplyChance)&&(! move.selfDebuffing)){
					self.bestChargedMove = self.activeChargedMoves[i];
				}



				// Favor Obstruct over close energy moves
				if(self.activeChargedMoves[i].moveId == "OBSTRUCT"){
					self.bestChargedMove = self.activeChargedMoves[i];
				}
			}

			// Favor Obstruct over close energy moves
			if(self.activeChargedMoves[0].moveId == "OBSTRUCT" && self.activeChargedMoves[0].energy - self.bestChargedMove.energy <= 5 && self.activeChargedMoves[0].dpe / self.bestChargedMove.dpe > .2){
				self.bestChargedMove = self.activeChargedMoves[0];
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

				var multiplier = 1;

				if(buffEffect > 0){
					multiplier = ( (gm.data.settings.buffDivisor +(buffEffect* move.buffApplyChance)) / gm.data.settings.buffDivisor);
				}

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

		var opponent = battle.getOpponent(self.index);
		var usage = self.generateMoveUsage(opponent, 1);

		self.selectMove("fast", usage.fastMoves[0].moveId);
		self.selectMove("charged", usage.chargedMoves[0].moveId, 0);

		if((usage.chargedMoves.length > 1)&&(count > 1)&&(self.speciesId != "smeargle")){
			self.selectMove("charged", usage.chargedMoves[1].moveId, 1);
		} else if(self.speciesId == "smeargle"){
			self.selectMove("charged", "none", 1);
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
		if(! moveFound){
			if(! disallowCustomAddition){
				self.addNewMove(id, arr, true, type, index);
			} else{
				switch(type){
					case "fast":
						self.fastMove = gm.getMoveById(id);
						self.initializeMove(self.fastMove);
						break;

					case "charged":
						self.chargedMoves[index] = gm.getMoveById(id);
						self.initializeMove(self.chargedMoves[index]);
						break;
				}
			}

		}
	}

	// Obtain a Pokemon's recommended moveset from the rankings and select them

	this.selectRecommendedMoveset = function(category){
		category = typeof category !== 'undefined' ? category : "overall";

		var cupName = "all";

		if(battle.getCup()){
			cupName = battle.getCup().name;
		}

		if(cupName == "custom"){
			cupName = "all";
		}

		var key = cupName + category + battle.getCP();

		if(! gm.rankings[key]){
			console.log("Ranking data not loaded yet");
			return;
		}

		var rankings = gm.rankings[key];
		var found = false;

		for(var i = 0; i < rankings.length; i++){
			var r = rankings[i];

			if(r.speciesId == self.speciesId){
				self.selectMove("fast", r.moveset[0]);
				self.selectMove("charged", r.moveset[1], 0);

				if(r.moveset.length > 2){
					self.selectMove("charged", r.moveset[2], 1);
				} else{
					self.selectMove("charged", "none", 1);
				}

				self.resetMoves();

				// Assign overall score for reference
				self.overall = r.score;
				self.scores = r.scores;

				found = true;
				break;
			}
		}

		// If no results, auto select moveset
		if(! found){
			self.autoSelectMoves();
		}
	}

	// Given an opponent, generate move usage stats

	this.generateMoveUsage = function(opponent, weightModifier){
		weightModifier = typeof weightModifier !== 'undefined' ? weightModifier : 1;

		// First, initialize all moves to get updated damage numbers

		this.resetMoves();

		// Feed move pools into new arrays so they can be manipulated without affecting the originals

		var fastMoves = [];
		var chargedMoves = [];
		var fastMoveUses = [];
		var chargedMoveUses = [];
		var targetArrs = [fastMoves, chargedMoves];
		var sourceArrs = [self.fastMovePool, self.chargedMovePool];

		for(var i = 0; i < sourceArrs.length; i++){
			for(var n = 0; n < sourceArrs[i].length; n++){
				targetArrs[i].push(sourceArrs[i][n]);
			}
		}

		// Sort charged moves by DPE

		chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));

		var highestDPE = chargedMoves[0].dpe;

		for(var i = 0; i < chargedMoves.length; i++){
			var move = chargedMoves[i];
			var statChangeFactor = 1;

			// Calculate the magnitude of stat changes, factoring in stages and buff chance
			if(move.buffs){
				for(var n = 0; n < move.buffs.length; n++){
					// Don't factor self defense drops for move usage
					if((move.selfDebuffing)&&(n == 1)){
						continue;
					}

					if(move.buffs[n] > 0){
						if(move.buffTarget == "self"){
							statChangeFactor *= ((4+move.buffs[n]) / 4);
						} else if(move.buffTarget == "opponent"){
							statChangeFactor *= (1 / ((4+move.buffs[n]) / 4));
						}
					} else if(move.buffs[n] < 0){
						if(move.buffTarget == "self"){
							statChangeFactor *= (4 / (4-move.buffs[n]));
						} else if(move.buffTarget == "opponent"){
							statChangeFactor *= (1 / (4 / (4-move.buffs[n])));
						}
					}
				}

				statChangeFactor =  1 + ((statChangeFactor - 1) * move.buffApplyChance);
			}

			// Calculate usage based on raw damage, efficiency, and speed
			move.uses = (Math.pow(move.damage, 2) / Math.pow(move.energy, 4)) * Math.pow(statChangeFactor, 2);
		}

		chargedMoves.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

		// For moves that have a strictly better preference, sharply reduce usage
		total = chargedMoves[0].uses;

		for(var i = 1; i < chargedMoves.length; i++){
			for(var n = 0; n < i; n++){
				if((chargedMoves[i].type == chargedMoves[n].type)&&(chargedMoves[i].energy >= chargedMoves[n].energy)&&(chargedMoves[i].dpe / chargedMoves[n].dpe < 1.3)){
					chargedMoves[i].uses *= .5;
					break;
				}
			}

			total += chargedMoves[i].uses;
		}

		// Normalize move usage to total
		for(var i = 0; i < chargedMoves.length; i++){
			chargedMoves[i].uses = Math.round((chargedMoves[i].uses / total) * 100);
		}

		for(var i = 0; i < chargedMoves.length; i++){
			chargedMoveUses.push({
				moveId: chargedMoves[i].moveId,
				uses: chargedMoves[i].uses * weightModifier
			});
		}

		chargedMoveUses.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));


		// Calculate TDO for each fast move and sort
		var total = 0;

		// Let's use Yawn as a baseline for comparison
		var yawn = gm.getMoveById("YAWN");
		yawn.damage = 1;

		var baseline = self.calculateCycleDPT(yawn, chargedMoves[0]);

		for(var i = 0; i < fastMoves.length; i++){
			var move = fastMoves[i];
			var ept = move.energyGain / (move.cooldown / 500);
			var dpt = move.damage / (move.cooldown / 500);

			move.uses = self.calculateCycleDPT(move, chargedMoves[0]);
			move.uses = Math.max(move.uses - baseline, 0.1);
			move.uses *= Math.pow(Math.pow(dpt*Math.pow(ept,4), 1/5), Math.max(highestDPE - 1, 1)); // Emphasize fast charging moves with access to powerful Charged Moves

			total += move.uses;
		}

		// Normalize move usage to total
		for(var i = 0; i < fastMoves.length; i++){
			fastMoves[i].uses = Math.round((fastMoves[i].uses / total) * 100);

			fastMoveUses.push({
				moveId: fastMoves[i].moveId,
				uses: fastMoves[i].uses * weightModifier
			});
		}

		fastMoveUses.sort((a,b) => (a.uses > b.uses) ? -1 : ((b.uses > a.uses) ? 1 : 0));

		var results = {
			fastMoves: fastMoveUses,
			chargedMoves: chargedMoveUses
		};

		return results;
	}

	// Add new move to the supplied move pool, with a flag to automatically select the new move

	this.addNewMove = function(id, movepool, selectNewMove, moveType, index){
		var move = gm.getMoveById(id);

		if(! move){
			return false;
		}

		// Don't add move if it's already in the movepool
		if(this.knowsMove(id)){
			// Select the move that already exists
			if(selectNewMove){
				self.selectMove(moveType, id, index, true)
			}

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

	// Remove a specific move from the movepool (used for removing Frustration when Shadow type is changed)

	this.removeMove = function(id){
		for(var i = 0; i < self.chargedMovePool.length; i++){
			if(self.chargedMovePool[i].moveId == id){
				self.chargedMovePool.splice(i, 1);

				// Reset to the default moveset if the removed move is selected
				if(self.hasMove(id)){
					self.selectRecommendedMoveset();
				}

				return true;
			}
		}

		return false;
	}

	// This function calculates TDO given moveset and opponent, used for move selection

	this.calculateTDO = function(fastMove, chargedMove, opponent, final){
		var opponentDPS = Math.floor(20 * (100 / this.stats.def));
		var opponentDef = 100;

		if(opponent){
			opponentDPS = opponent.dps;
			opponentDef = opponent.stats.def;
		}

		// Calculate multiple cycles to avoid issues with overflow energy
		var cycleFastMoves = Math.ceil(chargedMove.energy / fastMove.energyGain);
		var cycleTime = cycleFastMoves * (fastMove.cooldown / 1000);
		var cycleDamage = (cycleFastMoves * fastMove.damage) + chargedMove.damage;
		var cycleDPS = cycleDamage / cycleTime;

		if(final){
			this.dps = cycleDPS;
		}

		var timeToFaint = this.stats.hp / opponentDPS;
		var tdo = cycleDPS * timeToFaint;

		return tdo;
	}

	// This function calculates cycle DPT given a moveset

	this.calculateCycleDPT = function(fastMove, chargedMove){
		// Calculate multiple cycles to avoid issues with overflow energy
		var cycleFastMoves = 150 / fastMove.energyGain;
		var cycleTime = (cycleFastMoves * (fastMove.cooldown / 500)) + 1;
		var cycleDamage = (cycleFastMoves * fastMove.damage) + (chargedMove.damage * ((150 / chargedMove.energy)-1)) + 1; // Emulate TDO with a shield
		var cycleDPT = cycleDamage / cycleTime;

		return cycleDPT;
	}

	// This function generates a list of descriptive traits displayed on the rankings page

	this.generateTraits = function(){
		var cupName = "all";
		var category = "overall";

		if(battle.getCup()){
			cupName = battle.getCup().name;
		}

		if(cupName == "custom"){
			cupName = "all";
		}

		// First, look up ranking data to use as a reference

		var key = cupName + category + battle.getCP();
		var rankings = gm.rankings[key];
		var r = false;
		var found = false;

		if(gm.rankings[key]){
			rankings = gm.rankings[key];

			for(var i = 0; i < rankings.length; i++){
				if(rankings[i].speciesId == self.speciesId){
					r = rankings[i];
				}
			}
		}

		// Initialize lists of positive and negative traits
		var pros = [];
		var cons = [];

		// Bulkiness
		var bulk = self.stats.def * self.stats.hp * self.shadowDefMult;
		var bulkScale = [12500,14000,17000,23000];
		var bulkRating = 0;

		if(battle.getCP() == 500){
			bulkScale = [4000,6000,8000,12000];
		} else if(battle.getCP() == 2500){
			bulkScale = [19000,22000,25000,31000];
		} else if(battle.getCP() == 10000){
			bulkScale = [27000,30000,35000,39000];
		}

		if(bulk <= bulkScale[0]){
			if(Math.pow(self.stats.atk * self.shadowAtkMult, 2) > bulk){
				cons.push({
					trait: "Glass Cannon",
					desc: "Hits hard but struggles to take hits. Depends on shields."
				});
			} else{
				cons.push({
					trait: "Glassy",
					desc: "Struggles to take hits and depends on shields."
				});
			}


			bulkRating = -2;

		} else if(bulk <= bulkScale[1]){
			cons.push({
				trait: "Less Bulky",
				desc: "Below average defensive stats and may struggle to take hits."
			});

			bulkRating = -1;
		} else if(bulk >= bulkScale[3]){
			pros.push({
				trait: "Extremely Bulky",
				desc: "Very high defensive stats and can absorb multiple attacks."
			});

			bulkRating = 2;
		} else if(bulk >= bulkScale[2]){
			pros.push({
				trait: "Bulky",
				desc: "Takes hits well."
			});

			bulkRating = 1;
		}

		// Charged Move activation speed
		var activationSpeed = Math.ceil( (self.fastestChargedMove.energy * 2) / self.fastMove.energyGain ) * self.fastMove.cooldown * (1 / 1000); // Avg speed over two cycles to account for overflow energy

		if(activationSpeed <= 12){
			pros.push({
				trait: "Spammy",
				desc: "Reaches Charged Moves quickly."
			});
		} else if(activationSpeed >= 19){
			cons.push({
				trait: "Slow",
				desc: "Takes a long time to reach Charged Moves."
			});
		}

		// Fast Move duration

		if(self.fastMove.cooldown == 500){
			pros.push({
				trait: "Agile",
				desc: "Uses short animations, can react quickly and reliably fire Charged Moves."
			});
		} else if(self.fastMove.cooldown >= 2000){
			cons.push({
				trait: "Clumsy",
				desc: "Uses long animations, is stuck while attacking and may not reliably fire Charged Moves."
			});
		}

		// Charged Move coverage
		var types = getAllTypes();
		var averagePower = 0;
		var totalResistingTypes = 0;
		var totalSuperEffectiveTypes = 0;

		var targetDef = 120;
		if(battle.getCP() == 500){
			targetDef = 75;
		} else if(battle.getCP() == 2500){
			targetDef = 150;
		} else if(battle.getCP() == 10000){
			targetDef = 170;
		}

		for(var i = 0; i < types.length; i++){
			var powerVSType = 0;
			var bestEffectiveness = 0;

			for(var n = 0; n < self.chargedMoves.length; n++){
				var effectiveness = battle.getEffectiveness(self.chargedMoves[n].type, [types[i].toLowerCase(), "none"]);
				var effectivePower = ((self.chargedMoves[n].power * self.chargedMoves[n].stab * self.shadowAtkMult * effectiveness) * (self.stats.atk / targetDef));
				var bestChargedMoveSpeed = Math.ceil(self.chargedMoves[n].energy / self.fastMove.energyGain) * (self.fastMove.cooldown / 500);
				effectivePower = effectivePower * (30 / bestChargedMoveSpeed);

				if(effectivePower > powerVSType){
					powerVSType = effectivePower;
				}

				if(effectiveness > bestEffectiveness){
					bestEffectiveness = effectiveness;
				}
			}

			averagePower += powerVSType;

			if(bestEffectiveness < 1){
				totalResistingTypes++;
			} else if(bestEffectiveness > 1){
				totalSuperEffectiveTypes++;
			}
		}

		averagePower /= types.length;

		var inflexible = false;

		if((totalResistingTypes == 0)&&(totalSuperEffectiveTypes >= 5)&&(averagePower >= 200)){
			pros.push({
				trait: "Flexible",
				desc: "Can hit a wide variety of types."
			});
		} else if((totalResistingTypes >= 2)&&(averagePower <= 240)&&(self.speciesId != "mew")){
			cons.push({
				trait: "Inflexible",
				desc: "May struggle to hit multiple types."
			});

			inflexible = true;
		}

		if(((self.chargedMoves.length == 1) || ((self.chargedMoves.length == 2) && (self.chargedMoves[0].type == self.chargedMoves[1].type))) && (! inflexible)){
			cons.push({
				trait: "Inflexible",
				desc: "May struggle to hit multiple types."
			});
		}

		// Switch and safety scores

		if(r){
			if(((r.scores[2] >= 90)||(r.scores[3] >= 90)) && ( (self.fastMove.energyGain / self.fastMove.cooldown) >= (3 / 500))) {
				pros.push({
					trait: "Dynamic",
					desc: "Performs well with energy and has fluid, dynamic matchups."
				});
			}
		}

		// Fast Move pressure

		var effectiveDPT = ((self.fastMove.power * self.fastMove.stab * self.shadowAtkMult) * (self.stats.atk / targetDef)) / (self.fastMove.cooldown / 500);

		if(effectiveDPT >= 4){
			pros.push({
				trait: "Fast Move Pressure",
				desc: "Deals heavy Fast Move damage. It can pressure switches and work around shields."
			});
		} else if(effectiveDPT <= 2){
			cons.push({
				trait: "Low Fast Move Pressure",
				desc: "Deals low Fast Move damage. It may struggle to bring down weakened opponents."
			});
		}

		// Charged Move/Shield Pressure
		var effectivePower = ((self.bestChargedMove.power * self.bestChargedMove.stab * self.shadowAtkMult) * (self.stats.atk / targetDef));
		var bestChargedMoveSpeed = Math.ceil(self.bestChargedMove.energy / self.fastMove.energyGain) * (self.fastMove.cooldown / 500);
		effectivePower = effectivePower * (30 / bestChargedMoveSpeed);

		if(effectivePower >= 210){
			pros.push({
				trait: "Shield Pressure",
				desc: "Pressures opponents to shield its strong or rapid attacks."
			});
		} else if(effectivePower <= 150){
			cons.push({
				trait: "Low Shield Pressure",
				desc: "May struggle to draw shields because of its weaker or slower attacks."
			});
		}

		// Defensive typing
		var totalResistances = 0;
		var totalWeaknesses = 0;
		var doubleWeaknesses = 0;

		for(var key in self.typeEffectiveness){
			if(self.typeEffectiveness[key] < 1){
				totalResistances++;
			} else if(self.typeEffectiveness[key] > 1){
				totalWeaknesses++;

				if(self.typeEffectiveness[key] > 1.6){
					doubleWeaknesses++;
				}
			}
		}

		if((totalResistances >= 6)&&(totalWeaknesses < totalResistances)&&(bulkRating >= 0)){
			pros.push({
				trait: "Defensive",
				desc: "Resists attacks from a wide variety of types."
			});
		} else if((totalWeaknesses >= 5)&&(totalWeaknesses > totalResistances)){
			cons.push({
				trait: "Vulnerable",
				desc: "Takes super effective damage from a wide variety of types."
			});
		}

		if(doubleWeaknesses > 0){
			cons.push({
				trait: "Volatile",
				desc: "Susceptible to one or more double weaknesses."
			});
		}

		// Check for specific move archetypes

		if(self.hasMove("OCTAZOOKA") || self.hasMove("LEAF_TORNADO") || self.hasMove("MIRROR_SHOT") || self.hasMove("MUDDY_WATER") || self.hasMove("TRI_ATTACK")){
			cons.push({
				trait: "Chaotic",
				desc: "Uses move effects that can drastically alter the game but depend on random chance."
			});
		}

		if(self.hasMove("POWER_UP_PUNCH") || self.hasMove("FLAME_CHARGE") || self.hasMove("FELL_STINGER")){
			pros.push({
				trait: "Momentum",
				desc: "Uses stat boosts to build momentum and power through teams."
			});
		}

		var hasSelfDebuffingMove = false;

		for(var i = 0; i < self.chargedMoves.length; i++){
			if(self.chargedMoves[i].selfDebuffing){
				hasSelfDebuffingMove = true;
			}
		}

		if(self.hasMove("BUBBLE_BEAM") || self.hasMove("ICY_WIND") || self.hasMove("LUNGE") || self.hasMove("SAND_TOMB") || self.hasMove("ACID_SPRAY") || hasSelfDebuffingMove){
			// Only give this trait to energy driven Pokemon
			if(self.fastMove.energyGain / self.fastMove.cooldown >= 3 / 500){
				cons.push({
					trait: "Technical",
					desc: "Uses complex moves that may have a high learning curve."
				});
			}
		}

		// Consistency

		if((r)&&(r.scores[5] <= 75)){
			cons.push({
				trait: "Inconsistent",
				desc: "May depend on baits and performs inconsistently."
			});
		}

		return {
			pros: pros,
			cons: cons
		};
	}

	// Generates a list of comparable Pokemon, comparing types, moves, and traits, receives existing as an input

	this.generateSimilarPokemon = function(traits){

		var pokemonList = gm.generateFilteredPokemonList(battle, battle.getCup().include, battle.getCup().exclude);

		for(var i = 0; i < pokemonList.length; i++){
			var pokemon = pokemonList[i];
			pokemon.selectRecommendedMoveset();

			pokemon.similarityScore = 0;

			var id = pokemon.speciesId.replace("_shadow","")

			if(id.indexOf("_xs") > -1){
				continue;
			}

			// A bunch of filtering here to remove Shadows of the same Pokemon and XS entries

			if(id == self.speciesId.replace("_xs","")){
				continue;
			}

			if(id == self.speciesId.replace("_shadow","")){
				continue;
			}

			var similarityScore = 0; // Used to compare similarity between Pokemon

			// Favor Pokemon with the same or similar types
			for(var n = 0; n < pokemon.types.length; n++){
				if((self.types.indexOf(pokemon.types[n]) > -1)&&(pokemon.types[n] != "none")){
					similarityScore += 400;
				}
			}

			// Favor Pokemon with the same or similar moves

			if(pokemon.fastMove.moveId == self.fastMove.moveId){
				similarityScore += 350;
			} else if(pokemon.fastMove.type == self.fastMove.moveId){
				similarityScore += 50;
			}

			for(var n = 0; n < pokemon.chargedMoves.length; n++){
				for(var j = 0; j < self.chargedMoves.length; j++){
					if(pokemon.chargedMoves[n].moveId == self.chargedMoves[j].moveId){
						similarityScore += 200;
					} else if(pokemon.chargedMoves[n].type == self.chargedMoves[j].moveId){
						similarityScore += 50;
					}
				}
			}

			// Favor Pokemon with similar traits
			if(! traits){
				traits = self.generateTraits();
			}

			pokemon.traits = pokemon.generateTraits();

			for(var n = 0; n < pokemon.traits.pros.length; n++){
				for(var k = 0; k < traits.pros.length; k++){
					if(pokemon.traits.pros[n].trait == traits.pros[k].trait){
						similarityScore += 100;

						// Favor Pokemon with similar bulk
						if((pokemon.traits.pros[n].trait == "Bulky")){
							similarityScore += 150;
						}

						// Favor Pokemon with similar bulk
						if((pokemon.traits.pros[n].trait == "Extremely Bulky")){
							similarityScore += 350;
						}
					}

					if((pokemon.traits.pros[n].trait == "Bulky") && (traits.pros[k].trait == "Extremely Bulky")){
						similarityScore += 25;
					}

					if((pokemon.traits.pros[n].trait == "Extremely Bulky") && (traits.pros[k].trait == "Bulky")){
						similarityScore += 25;
					}
				}
			}

			for(var n = 0; n < pokemon.traits.cons.length; n++){
				for(var k = 0; k < traits.cons.length; k++){
					if(pokemon.traits.cons[n].trait == traits.cons[k].trait){
						similarityScore += 50;
					}

					if((pokemon.traits.cons[n].trait == "Less Bulky") && (traits.cons[k].trait == "Glass Cannon")){
						similarityScore += 25;
					}

					if((pokemon.traits.cons[n].trait == "Glass Cannon") && (traits.cons[k].trait == "Less Bulky")){
						similarityScore += 25;
					}
				}
			}

			if(pokemon.overall){
				similarityScore *= Math.pow(pokemon.overall, 1.5);
			}

			pokemon.similarityScore = similarityScore;
		}

		pokemonList.sort((a,b) => (a.similarityScore > b.similarityScore) ? -1 : ((b.similarityScore > a.similarityScore) ? 1 : 0));

		return pokemonList;
	}

	// Returns a string that describes how this Pokemon uses XL Candy

	this.needsXLCandy = function(){
		if((self.baseLevelCap <= 40)||(self.levelCap <= 40)){
			return false;
		}

		var level41CP = self.calculateCP(0.795300006866455, 15, 15, 15);

		if(level41CP >= battle.getCP() + 150){
			return false;
		} else{
			return true
		}
	}

	// Return whether or not this Pokemon has a specific move

	this.hasMove = function(moveId){

		if((self.fastMove)&&(self.fastMove.moveId == moveId)){
			return true;
		}

		for(var i = 0; i < self.chargedMoves.length; i++){
			if(self.chargedMoves[i].moveId == moveId){
				return true;
			}
		}

		return false;
	}

	// Return whether or not this Pokemon has a specific move in its movepool

	this.knowsMove = function(moveId){
		moveId = moveId.toUpperCase();

		for(var i = 0; i < self.fastMovePool.length; i++){
			if(self.fastMovePool[i].moveId == moveId){
				return true;
			}
		}

		for(var i = 0; i < self.chargedMovePool.length; i++){
			if(self.chargedMovePool[i].moveId == moveId){
				return true;
			}
		}

		return false;
	}

	// Return whether or not this Pokemon has a move of a specific type

	this.knowsMoveType = function(type){

		for(var i = 0; i < self.fastMovePool.length; i++){
			if(self.fastMovePool[i].type == type){
				if(self.fastMovePool[i].moveId.indexOf("HIDDEN_POWER") == -1){
					return true;
				}
			}
		}

		for(var i = 0; i < self.chargedMovePool.length; i++){
			if(self.chargedMovePool[i].type == type){
				return true;
			}
		}

		return false;
	}

	// Returns a Pokemon's specific move by ID

	this.getMoveById = function(moveId){

		if((self.fastMove)&&(self.fastMove.moveId == moveId)){
			return self.fastMove;
		}

		for(var i = 0; i < self.chargedMoves.length; i++){
			if(self.chargedMoves[i].moveId == moveId){
				return self.chargedMoves[i];
			}
		}

		return false;
	}

	// Return whether or not this Pokemon has a move with buff or debuff effects

	this.hasBuffMove = function(){
		var hasBuffMove = false;

		for(var i = 0; i < self.chargedMoves.length; i++){
			if((self.chargedMoves[i].buffs)&&(self.chargedMoves[i].buffApplyChance < 1)){
				hasBuffMove = true;
			}
		}

		return hasBuffMove;
	}

	// Return whether or not this Pokemon has a move with guaranteed or high chance of boosting itself or debuffing the opponent
	// This is used for some battle/AI logic

	this.getBoostMove = function(){
		var boostMove = false;

		for(var i = 0; i < self.chargedMoves.length; i++){
			if((self.chargedMoves[i].buffs)&&(self.chargedMoves[i].buffApplyChance >= 0.5)&&(! self.chargedMoves[i].selfDebuffing)){
				boostMove = self.chargedMoves[i];
			}
		}

		return boostMove;
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

		if(self.activeFormId != self.startFormId){
			self.changeForm(self.startFormId);
		}

		self.resetMoves();
	}

	// Fully reset all Pokemon stats

	this.fullReset = function(){
		self.startHp = self.stats.hp;
		self.startEnergy = 0;
		self.startCooldown = 0;
		self.startStatBuffs = [0, 0];
		self.startFormId = self.activeFormId;

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

		self.level = amount;
		var index = ((amount-1) * 2);

		self.cpm = cpms[index];

		/*if(index % 1 == 0){
			// Set CPM for whole levels
			self.cpm = cpms[index];
		} else{
			// Set CPM for half levels
			self.cpm = Math.sqrt( (Math.pow(cpms[Math.floor(index)], 2) + Math.pow(cpms[Math.ceil(index)], 2)) / 2);
		}*/

		if(amount > self.levelCap){
			self.levelCap = amount;
		}

		if(initialize){
			self.isCustom = true;
			self.initialize(false);
		}
	}

	// Set this Pokemon's level cap
	this.setLevelCap = function(levelCap){
		self.levelCap = Math.min(levelCap, self.baseLevelCap);
	}

	this.setIV = function(iv, amount){
		if(iv == "atk"){
			this.ivs.atk = parseInt(amount);
		} else if(iv == "def"){
			this.ivs.def = parseInt(amount);
		} else if(iv == "hp"){
			this.ivs.hp = parseInt(amount);
		}

		// Automatically adjust to league cap

		if(self.autoLevel){
			var level = self.levelCap;
			self.cp = 100000;

			while(self.cp > battle.getCP()){
				self.setLevel(level, true);
				level -= 0.5;
			}
		} else{
			self.isCustom = true;
			self.initialize(false);
		}
	}

	// Set battle reference object

	this.setBattle = function(b){
		battle = b;

		self.setLevelCap(battle.getLevelCap());
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

	this.getEffectiveStat = function(index, useStartStatBuffs){
		useStartStatBuffs = (typeof useStartStatBuffs !== 'undefined') ?  useStartStatBuffs : false

		var multiplier = self.getStatBuffMultiplier(index, useStartStatBuffs);

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

	this.getStatBuffMultiplier = function(index, useStartStatBuffs){
		useStartStatBuffs = (typeof useStartStatBuffs !== 'undefined') ?  useStartStatBuffs : false
		var buffDivisor = gm.data.settings.buffDivisor;
		var sourceBuffs = self.statBuffs;
		var multiplier;

		if(useStartStatBuffs){
			sourceBuffs = self.startStatBuffs;
		}

		if(sourceBuffs[index] > 0){
			multiplier = (buffDivisor + sourceBuffs[index]) / buffDivisor;
		} else{
			multiplier = buffDivisor / (buffDivisor - sourceBuffs[index]);
		}

		return multiplier;
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
		var pokeStr = self.aliasId;

		if((self.isCustom)||(self.startStatBuffs[0] != 0)||(self.startStatBuffs[1] != 0)){
			var arr = [self.level];

			arr.push(self.ivs.atk, self.ivs.def, self.ivs.hp, self.startStatBuffs[0]+gm.data.settings.maxBuffStages, self.startStatBuffs[1]+gm.data.settings.maxBuffStages, self.baitShields, self.optimizeMoveTiming ? 1 : 0);

			// Stat buffs are increased by 4 so the URL doesn't have to deal with parsing negative numbers

			var str = arr.join("-");

			pokeStr += "-" + str;
		}

		if(self.priority != 0){
			pokeStr += "-p";
		}

		if(self.startCooldown == 1000){
			pokeStr += "-d-1000";
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

		var fastMoveStr = self.fastMovePool.indexOf(self.fastMove);
		var chargedMove1Str = self.chargedMovePool.indexOf(self.chargedMoves[0])+1;
		var chargedMove2Str = self.chargedMovePool.indexOf(self.chargedMoves[1])+1;

		// Check for any custom moves;

		if(self.fastMove.isCustom || settings.hardMovesetLinks){
			fastMoveStr = self.fastMove.moveId;
		}

		if(self.chargedMoves.length > 0){
			if(self.chargedMoves[0].isCustom || settings.hardMovesetLinks){
				chargedMove1Str = self.chargedMoves[0].moveId;
			}
		}

		if(self.chargedMoves.length > 1){
			if(self.chargedMoves[1].isCustom || settings.hardMovesetLinks){
				chargedMove2Str = self.chargedMoves[1].moveId;
			}
		}

		moveStr = fastMoveStr + "-" + chargedMove1Str + "-" + chargedMove2Str;

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

				// Add Frustration as a custom move
				if(! self.knowsMove("FRUSTRATION")){
					self.addNewMove("FRUSTRATION", self.chargedMovePool, false);
				}
			}
		} else{
			self.shadowAtkMult = 1;
			self.shadowDefMult = 1;

			if(self.speciesName.indexOf(" (Shadow)") > -1){
				self.speciesName = self.speciesName.replace(" (Shadow)","");

				// Remove Frustration if added as a Custom Move
				self.removeMove("FRUSTRATION");
			}
		}
	}

	// Calculate consistency score based on moveset, used in rankings and the team builder

	this.calculateConsistency = function(){

		var fastMove = self.fastMove;
		var chargedMoves = self.chargedMoves;
		var consistencyScore = 1;

		// Reset move stats
		fastMove.damage = fastMove.power * fastMove.stab;

		for(var i = 0; i < chargedMoves.length; i++){
			chargedMoves[i].damage = chargedMoves[i].power * chargedMoves[i].stab;
		}

		// Only calculate with two Charged Moves
		if(chargedMoves.length == 2){

			var effectivenessScenarios = [
				[1, 1]
				];

			if(chargedMoves[0].type != chargedMoves[1].type){
				effectivenessScenarios.push(
					[0.625, 1],
					[1, 0.625]
				);
			}

			// Here we are looking at how depenendent each Pokemon is on baiting in scenarios where both moves are neutral, or one or the other is resisted
			for(var n = 0; n < effectivenessScenarios.length; n++){
				// Sort moves by name as a starting point
				chargedMoves.sort((a,b) => (a.name > b.name) ? -1 : ((b.name > a.name) ? 1 : 0));

				// Need to reset this number because of how movesets are generated
				chargedMoves[0].dpe = (chargedMoves[0].damage / chargedMoves[0].energy) * effectivenessScenarios[n][0];
				chargedMoves[1].dpe = (chargedMoves[1].damage / chargedMoves[1].energy) * effectivenessScenarios[n][1];
				chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));

				// Factor in Power-Up Punch where Pokemon may be consistent spamming it

				if(chargedMoves[1].moveId == "POWER_UP_PUNCH"){
					chargedMoves[1].dpe *= 2;
					chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));
				}

				// Calculate how much fast move vs charged move damage this Pokemon puts out per cycle
				var cycleFastMoves = Math.ceil(chargedMoves[0].energy / fastMove.energyGain);
				var cycleFastDamage = fastMove.damage * cycleFastMoves;
				var cycleDamage = cycleFastDamage + chargedMoves[0].damage;

				if(fastMove.type == chargedMoves[0].type){
					cycleFastDamage *= effectivenessScenarios[n][0];
				} else if(fastMove.type == chargedMoves[1].type){
					cycleFastDamage *= effectivenessScenarios[n][1];
				}

				var factor = 1;
				if((chargedMoves[0].energy > chargedMoves[1].energy)||( (chargedMoves[0].energy == chargedMoves[1].energy) && (chargedMoves[1].moveId == "ACID_SPRAY")||((chargedMoves[0].selfAttackDebuffing)&&(! chargedMoves[1].selfDebuffing)&&(chargedMoves[1].energy - chargedMoves[0].energy <= 10))||((chargedMoves[0].selfDebuffing)&&(chargedMoves[0].energy > 50)&&(! chargedMoves[1].selfDebuffing)&&(chargedMoves[1].energy - chargedMoves[0].energy <= 10)))){
					factor = (cycleFastDamage / cycleDamage) + ((chargedMoves[0].damage / cycleDamage) * (chargedMoves[1].dpe / chargedMoves[0].dpe));

					// If the difference in energy is small, improve the consistency score as players may play straight more often
					if(chargedMoves[1].energy < chargedMoves[0].energy && ! chargedMoves[0].selfBuffing){
						factor += (1 - factor) * ((chargedMoves[1].energy-30) / (chargedMoves[0].energy-30)) * 0.5;
					} else if(chargedMoves[1].energy < chargedMoves[0].energy && chargedMoves[0].selfBuffing){
						factor += (1 - factor) * ((chargedMoves[1].energy-20) / (chargedMoves[0].energy-20)); // Players are more likely to spam self buffing moves than bait with non buffing moves
					}
				}

				// Add a factor for chance buff moves, especially high chance moves
				var buffChanceFactor = 0;

				for(var i = 0; i < chargedMoves.length; i++){

					if(chargedMoves[i].buffs && chargedMoves[i].buffApplyChance < 1 && chargedMoves[i].buffApplyChance > .15){
						var buffStages = Math.abs(chargedMoves[i].buffs[0]) + Math.abs(chargedMoves[i].buffs[1]);
						var buffConsistency = 0.5 + Math.abs(0.5 - chargedMoves[i].buffApplyChance); // 50% is the most chaotic, 10% the least

						// Roughly correlate buff strength to damage
						var buffsAsDamage = chargedMoves[i].damage + (buffStages * 25 * (1 - buffConsistency));

						buffChanceFactor += chargedMoves[i].damage / buffsAsDamage;
					} else{
						buffChanceFactor += 1;
					}
				}

				buffChanceFactor /= chargedMoves.length;


				consistencyScore *= factor * buffChanceFactor;
			}

			// Now do a square root mean
			consistencyScore = Math.pow(consistencyScore, (1/effectivenessScenarios.length));
		}

		// Factor in fast move duration, slower moves are less consistent
		/*var fastMoveConsistency = .5 + (.5 * (1 / (fastMove.cooldown / 500)));

		consistencyScore = ((consistencyScore * 6) + (fastMoveConsistency * 1)) / 7;*/

		// Penalize specific moves
		if(self.hasMove("POWER_UP_PUNCH")){
			consistencyScore *= .85;
		}

		if(self.hasMove("LUNGE")){
			consistencyScore *= .85;
		}

		if(self.hasMove("FEATHER_DANCE")){
			consistencyScore *= .75;
		}

		if(self.hasMove("BUBBLE_BEAM")){
			consistencyScore *= .75;
		}

		consistencyScore = Math.round(consistencyScore * 1000) / 10;

		return consistencyScore;
	}

	// Return the slot number for this Pokemon for Silph Season 3 Continentals

	this.getSlot = function(cup){
		var slotNumber = 0;

		for(var j = 0; j < cup.slots.length; j++){
			if((cup.slots[j].pokemon.indexOf(self.speciesId) > -1)||(cup.slots[j].pokemon.indexOf(self.speciesId.replace("_shadow","")) > -1)){
				slotNumber = j;
				break;
			}
		}

		return slotNumber;
	}

	// Return a numerical value for this Pokemon's evolution stage

	this.getEvolutionStage = function(){
		// Does not evolve and has no pre-evolution
		var stage = 0;

		if(this.family){
			// Evolves and has no pre-evolution
			if(this.family.evolutions && ! this.family.parent){
				stage = 1;
			}

			// Evolves and has a pre-evolution
			if(this.family.evolutions && this.family.parent){
				stage = 2;
			}

			// Does not evolve and has a pre-evolution
			if(! this.family.evolutions && this.family.parent){
				stage = 3;
			}
		}

		return stage;
	}

	// Change the Pokemon's form during battle

	this.changeForm = function(id){
		id = typeof id !== 'undefined' ? id : null;

		var formId = id;

		if(this.formChange.type == "toggle"){
			formId = this.activeFormId == this.formChange.defaultFormId ? this.formChange.alternativeFormId : this.formChange.defaultFormId;
		}

		var form = gm.getPokemonById(formId);

		this.speciesName = form.speciesName;
		this.activeFormId = formId;
		this.types = [ form.types[0], form.types[1] ];
		this.typeEffectiveness = getTypeEffectivenessArray(battle);

		// Adjust base stats and CP if new form has different stats
		if(this.baseStats != form.baseStats){
			this.baseStats = { atk: form.baseStats.atk, def: form.baseStats.def, hp: form.baseStats.hp};
			this.stats.atk = this.cpm * (this.baseStats.atk+this.ivs.atk);
			this.stats.def = this.cpm * (this.baseStats.def+this.ivs.def);
			this.stats.hp = Math.max(Math.floor(this.cpm * (this.baseStats.hp+this.ivs.hp)), 10);
		}

		// Form specific functionality
		switch(formId){
			case "morpeko_full_belly":
				self.replaceChargedMove("charged", "AURA_WHEEL_DARK", "AURA_WHEEL_ELECTRIC");
			break;

			case "morpeko_hangry":
				self.replaceChargedMove("charged", "AURA_WHEEL_ELECTRIC", "AURA_WHEEL_DARK");
			break;
		}

		self.resetMoves();
	}

	this.replaceChargedMove = function(moveType, oldMoveId, newMoveId){
		if(moveType == "fast"){
			self.selectMove(moveType, newMoveId, 0, true);
		} else if(moveType == "charged"){
			var moveIndex = self.chargedMoves.findIndex(m => m.moveId == oldMoveId);
			if(moveIndex > -1){
				self.selectMove(moveType, newMoveId, moveIndex, true);
			}
		}
	}


}

/* STATIC METHODS */

// Given Fast Move and Charged Move objects, calculate and return the move counts for 3 cycles

Pokemon.calculateMoveCounts = function(fastMove, chargedMove){
	var counts = [];

	counts.push( Math.ceil( (chargedMove.energy * 1) / fastMove.energyGain) );
	counts.push( Math.ceil( (chargedMove.energy * 2) / fastMove.energyGain) - counts[0] );
	counts.push( Math.ceil( (chargedMove.energy * 3) / fastMove.energyGain) - counts[0] - counts[1] );
	counts.push( Math.ceil( (chargedMove.energy * 4) / fastMove.energyGain) - counts[0] - counts[1] - counts[2] );

	return counts;

}
