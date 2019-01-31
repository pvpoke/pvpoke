// JavaScript Document

/*
* The main Pokemon class used to represent individual Pokemon in battle
*/

function Pokemon(id, i){

	var gm = GameMaster.getInstance();
	var data = gm.getPokemonById(id);
	var battle = BattleMaster.getInstance();
	var self = this;

	// Base properties
	this.speciesId = id;
	this.speciesName = data.speciesName;

	this.baseStats = { atk: data.baseStats.atk, def: data.baseStats.def, hp: data.baseStats.hp};
	this.stats = { atk: 0, def: 0, hp: 0 };
	this.ivs = { atk: 0, def: 0, hp: 0 };
	this.types = [ data.types[0], data.types[1] ];
	this.cp = 0;
	this.hp = 0;
	this.startHp = 0;
	this.startEnergy = 0;
	this.level = 40;
	this.cpm = 0.79030001;
	this.fastMovePool = [];
	this.chargedMovePool = [];
	this.legacyMoves = [];
	
	this.fastMove = null;
	this.chargedMoves = [];
	
	this.index = i;
	
	this.dps = 10; // Used later to calculate TDO

	// Battle properties

	this.energy = 0;
	this.cooldown = 0;
	this.damageWindow = 0;
	this.shields = 0;
	this.startingShields = 0;

	// Set legacy moves
	
	if(data.legacyMoves){
		this.legacyMoves = data.legacyMoves;
	}

	// Set battle moves
	
	for(var i = 0; i < data.fastMoves.length; i++){
		var move = gm.getMoveById(data.fastMoves[i]);
		
		if(move){
			move.legacy = (self.legacyMoves.indexOf(move.moveId) > -1);
			
			this.fastMovePool.push(move);
		}
	}
	
	for(var i = 0; i < data.chargedMoves.length; i++){
		var move = gm.getMoveById(data.chargedMoves[i]);
		
		if(move){
			move.legacy = (self.legacyMoves.indexOf(move.moveId) > -1);
			
			this.chargedMovePool.push(move);
		}
	}
	
	// Given a target CP, scale to CP, set actual stats, and initialize moves
	
	this.initialize = function(targetCP){
		
		if(targetCP){
			
		
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
		}

		//Set effective stats

		this.stats.atk = Math.floor(this.cpm * (this.baseStats.atk+this.ivs.atk));
		this.stats.def = Math.floor(this.cpm * (this.baseStats.def+this.ivs.def));
		this.stats.hp = Math.floor(this.cpm * (this.baseStats.hp+this.ivs.hp));
		this.hp = this.stats.hp;
		
		this.cp = Math.floor(( (this.baseStats.atk+this.ivs.atk) * Math.pow(this.baseStats.def+this.ivs.def, 0.5) * Math.pow(this.baseStats.hp+this.ivs.hp, 0.5) * Math.pow(this.cpm, 2) ) / 10);
		
		if(this.cp < 10){
			this.cp = 10;
		}
		
		// Set moves if unset
		
		this.resetMoves();
		
		if(! self.fastMove){
			
			self.autoSelectMoves();
		}
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
	
		// Set best DPE charged move
		
		if(this.chargedMoves.length > 0){
			self.bestChargedMove = self.chargedMoves[0];
			
			for(var i = 0; i < self.chargedMoves.length; i++){
				if(self.chargedMoves[i].dpe > self.bestChargedMove.dpe){
					self.bestChargedMove = self.chargedMoves[i];
				}
			}
		}
		
	}
	
	// Set a moves stab and damage traits given an opponent
	
	this.initializeMove = function(move){
		var opponent = battle.getOpponent(this.index);
		
		move.stab = this.getStab(move);
		
		if(opponent){
			move.damage = battle.calculateDamage(self, opponent, move);
		} else{
			move.damage = Math.floor(move.power * move.stab);
		}
		
		move.dps = move.damage / (move.cooldown / 500); // I guess this really damage per turn
		
		if(move.energy > 0){
			move.dpe = move.damage / move.energy;
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
		
		// Sort moves by ID for consistent order
		
		self.fastMovePool.sort((a,b) => (a.moveId > b.moveId) ? 1 : ((b.moveId > a.moveId) ? -1 : 0));
		self.chargedMovePool.sort((a,b) => (a.moveId > b.moveId) ? 1 : ((b.moveId > a.moveId) ? -1 : 0));
		
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
		
		self.chargedMoves.push(chargedMoves[0]);
		
		chargedMoves.splice(0,1);
		
		// Sort remaining charged moves by dpe, weighted by energy
		
		for(var i = 0; i < chargedMoves.length; i++){
			var move = chargedMoves[i];
			
			move.dpe = move.damage / Math.pow(move.energy, 2);
		}
		
		if(chargedMoves.length > 0){
			chargedMoves.sort((a,b) => (a.dpe > b.dpe) ? -1 : ((b.dpe > a.dpe) ? 1 : 0));

			for(var i = 0; i < count-1; i++){
				self.chargedMoves.push(chargedMoves[i]);
			}
		}

	}
	
	// Given a type string, move id, and charged move index, set a specific move
	
	this.selectMove = function(type, id, index){
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
					break;
				} else{
					move = arr[i];
					this.chargedMoves[index] = move;
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
	
	// Resets Pokemon prior to battle
	
	this.reset = function(){
		
		this.resetMoves();
		this.startHp = this.stats.hp;
		this.hp = this.startHp;
		this.energy = this.startEnergy;
		this.cooldown = 0;
		this.damageWindow = 0;
		this.shields = this.startingShields;
	}
	
	this.setShields = function(amount){
		this.startingShields = parseInt(amount);
	}
	
	this.setLevel = function(amount){
		this.level = amount;
		
		var cpms = [0.094,0.135137432,0.16639787,0.192650919,0.21573247,0.236572661,0.25572005,0.273530381,0.29024988,0.306057377,0.3210876,0.335445036,0.34921268,0.362457751,0.37523559,0.387592406,0.39956728,0.411193551,0.42250001,0.432926419,0.44310755,0.453059958,0.46279839,0.472336083,0.48168495,0.4908558,0.49985844,0.508701765,0.51739395,0.525942511,0.53435433,0.542635767,0.55079269,0.558830576,0.56675452,0.574569153,0.58227891,0.589887917,0.59740001,0.604818814,0.61215729,0.619399365,0.62656713,0.633644533,0.64065295,0.647576426,0.65443563,0.661214806,0.667934,0.674577537,0.68116492,0.687680648,0.69414365,0.700538673,0.70688421,0.713164996,0.71939909,0.725571552,0.7317,0.734741009,0.73776948,0.740785574,0.74378943,0.746781211,0.74976104,0.752729087,0.75568551,0.758630378,0.76156384,0.764486065,0.76739717,0.770297266,0.7731865,0.776064962,0.77893275,0.781790055,0.78463697,0.787473578,0.79030001];
		
		var index = (amount - 1) * 2;
		
		this.cpm = cpms[index];
		
		this.initialize(false);
	}
	
	this.setIV = function(iv, amount){
		if(iv == "atk"){
			this.ivs.atk = parseInt(amount);
		} else if(iv == "def"){
			this.ivs.def = parseInt(amount);
		} else if(iv == "hp"){
			this.ivs.hp = parseInt(amount);
		}
		
		this.initialize(false);
	}
	
	// Return battle rating for this Pokemon
	
	this.getBattleRating = function(){
		var opponent = battle.getOpponent(self.index);
		
		if(! opponent){
			return 0;
		}
		
		return Math.floor( (500 * ((opponent.stats.hp - opponent.hp) / opponent.stats.hp)) + (500 * (self.hp / self.stats.hp)))
	}
}