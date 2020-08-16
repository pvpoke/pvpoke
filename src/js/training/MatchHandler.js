// JavaScript Document

function MatchHandler() {
  const self = this;
  let myInterface;
  let battler;
  let gm;
  let battle = new Battle();
  let players = [];
  let properties;
  let roundRecord = [0, 0];
  let previousRoundResult = null;
  let previousRoundTeams = [];

  // Initialize handler
  this.init = function () {
    gm = GameMaster.getInstance();
    myInterface = InterfaceMaster.getInstance(self);
    battler = BattlerMaster.getInstance(self, battle);
  };

  this.init();

  // Initialize battle from setup interface
  this.initBattle = function (props) {
    properties = props;
    battle = new Battle();
    battle.setCP(props.league);
    battle.setCup(props.cup);

    // Set up players
    players = [];

    const player = new Player(0, false, battle);
    player.setRoster(props.teams[0]);
    players.push(player);

    const opponent = new Player(1, props.difficulty, battle);
    players.push(opponent);

    if (props.teamSelectMethod === 'manual') {
      opponent.setRoster(props.teams[1]);
      self.startBattle();
    } else if (props.teamSelectMethod === 'random') {
      opponent.generateRoster(props.partySize, self.rosterReady);
    } else if (props.teamSelectMethod === 'featured') {
      opponent.setRoster(props.teams[1]);
      self.rosterReady();
    }
  };

  // Initiate a new battle
  this.startBattle = function () {
    const player = players[0];
    const opponent = players[1];

    if (properties.mode === 'single') {
      if (properties.teamSelectMethod === 'manual') {
        opponent.setRoster(properties.teams[1]);
        opponent.setTeam(properties.teams[1]);
      } else {
        opponent.generateTeam(player.getRoster());
      }

      player.setTeam(properties.teams[0]);

      myInterface.close();
      battler.init(properties, battle, players);
    } else if (properties.mode === 'tournament') {
      myInterface.openTeamSelect(players, roundRecord);
    }
  };

  // Initiate a new tournament battle
  this.startTournamentRound = function (team) {
    roundRecord = [0, 0];
    self.startTournamentBattle(team, properties);
  };

  // Initiate a new tournament battle
  this.startTournamentBattle = function (team, props, opponentTeam) {
    const player = players[0];
    const opponent = players[1];

    player.setTeam(team);

    // If we're rematching the previous round, use the same team
    if (!opponentTeam) {
      opponent.generateTeam(player.getRoster(), previousRoundResult, previousRoundTeams);
    } else {
      opponent.setTeam(opponentTeam);
    }

    myInterface.close();
    battler.init(props, battle, players);
  };

  // Continue to the next round
  this.nextTournamentRoundSetup = function (result) {
    $('.battle-window').attr('phase', '');
    $('body').removeClass('battle-active');

    switch (result) {
      case 'win':
        roundRecord[0] += 1;
        break;

      case 'loss':
        roundRecord[1] += 1;
        break;

      default:
        break;
    }

    // Set the round number in the interface
    myInterface.setRoundNumber(roundRecord[0] + roundRecord[1]);

    // Compile the teams used in the previous round
    previousRoundResult = result;
    previousRoundTeams = [];

    for (let i = 0; i < players.length; i++) {
      const team = players[i].getTeam();
      const list = [];
      for (let n = 0; n < team.length; n++) {
        list.push(team[n]);
      }

      previousRoundTeams.push(list);
    }
    myInterface.openTeamSelect(players, roundRecord);
  };

  this.startTournamentRound = function (team) {
    roundRecord = [0, 0];
    previousRoundResult = null;
    previousRoundTeams = [];
    self.startTournamentBattle(team, properties);
  };

  // Return to the setup interface
  this.returnToSetup = function () {
    $('body').removeClass('battle-active');
    $('.section.team-select').hide();
    $('.battle-window').attr('phase', '');
    myInterface.open();
  };

  // Callback that lets MatchHandler know the AI's roster is ready to begin play
  this.rosterReady = function () {
    self.startBattle();
  };
}

const matchHandler = new MatchHandler();
