// JavaScript Document

function Main(){
	
	var battle;
	var interface;
	var gm;
	
	init();
	
	function init(){
		var battle = BattleMaster.getInstance();
		var gm = GameMaster.getInstance();
	}
	
	this.getGM = function(){
		return gm;
	}
}

var main = new Main();