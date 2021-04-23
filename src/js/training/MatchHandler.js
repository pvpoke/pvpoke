// JavaScript Document

function MatchHandler(){
	var self = this;
	var interface;
	var battler;
	var gm;
	var battle = new Battle();

	var players = [];
	var properties;

	var roundRecord = [0, 0];
	var previousRoundResult = null;
	var previousRoundTeams = [];

	// Initialize handler

	this.init = function(){
		gm = GameMaster.getInstance();
		interface = InterfaceMaster.getInstance(self);
		battler = BattlerMaster.getInstance(self, battle);
	}

	this.init();

	// Initialize battle from setup interface

	this.initBattle = function(props){
		properties = props;
		battle = new Battle();
		battle.setCP(props.league);
		battle.setCup(props.cup);

		// Set up players
		players = [];

		var player = new Player(0, false, battle);
		player.setRoster(props.teams[0]);
		players.push(player);

		var opponent = new Player(1, props.difficulty, battle);
		players.push(opponent);

		player.setSwitchTime(props.switchTime);
		opponent.setSwitchTime(props.switchTime);

		if(props.teamSelectMethod == "manual"){
			opponent.setRoster(props.teams[1]);
			self.startBattle();
		} else if(props.teamSelectMethod == "random"){
			opponent.generateRoster(props.partySize, self.rosterReady);
		} else if(props.teamSelectMethod == "featured"){
			opponent.setRoster(props.teams[1]);
			self.rosterReady();
		} else if(props.teamSelectMethod == "custom"){
			opponent.generateRoster(props.partySize, self.rosterReady, props.customTeamPool);
		}
	}

	// Initiate a new battle

	this.startBattle = function(){
		var player = players[0];
		var opponent = players[1];

		if(properties.mode == "single"){

			if(properties.teamSelectMethod == "manual"){
				opponent.setRoster(properties.teams[1]);
				opponent.setTeam(properties.teams[1]);
			} else{
				opponent.generateTeam(player.getRoster());
			}

			player.setTeam(properties.teams[0]);

			interface.close();
			battler.init(properties, battle, players);
		} else if(properties.mode == "tournament"){
			interface.openTeamSelect(players, roundRecord);
		}
	}

	// Initiate a new tournament battle

	this.startTournamentRound = function(team, props){
		roundRecord = [0, 0];
		self.startTournamentBattle(team, properties);
	}

	// Initiate a new tournament battle

	this.startTournamentBattle = function(team, props, opponentTeam){
		var player = players[0];
		var opponent = players[1];

		player.setTeam(team);

		// If we're rematching the previous round, use the same team
		if(! opponentTeam){
			opponent.generateTeam(player.getRoster(), previousRoundResult, previousRoundTeams);
		} else{
			opponent.setTeam(opponentTeam);
		}



		interface.close();
		battler.init(props, battle, players);
	}

	// Continue to the next round

	this.nextTournamentRoundSetup = function(result){
		$(".battle-window").attr("phase","");
		$("body").removeClass("battle-active");

		switch(result){
			case "win":
				roundRecord[0]++;
				break;
			case "loss":
				roundRecord[1]++;
				break;
		}

		// Set the round number in the interface
		interface.setRoundNumber(roundRecord[0]+roundRecord[1]);

		// Compile the teams used in the previous round
		previousRoundResult = result;
		previousRoundTeams = [];

		for(var i = 0; i < players.length; i++){
			var team = players[i].getTeam();
			var list = [];
			for(var n = 0; n < team.length; n++){
				list.push(team[n]);
			}

			previousRoundTeams.push(list);
		}
		interface.openTeamSelect(players, roundRecord);
	}

	this.startTournamentRound = function(team, props){
		roundRecord = [0, 0];
		previousRoundResult = null;
		previousRoundTeams = [];
		self.startTournamentBattle(team, properties);
	}

	// Return to the setup interface

	this.returnToSetup = function(){
		$("body").removeClass("battle-active");
		$(".section.team-select").hide();
		$(".battle-window").attr("phase","");
		interface.open();
	}

	// Callback that lets MatchHandler know the AI's roster is ready to begin play

	this.rosterReady = function(){
		self.startBattle();
	}
}

var matchHandler = new MatchHandler();
