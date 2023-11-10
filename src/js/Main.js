// JavaScript Document

function Main(){
	var interface;
	var gm;

	init();

	function init(){
		if(typeof InterfaceMaster !== 'undefined'){
			interface = InterfaceMaster.getInstance();
		}
		gm = GameMaster.getInstance();

	}

	this.getGM = function(){
		return gm;
	}
}

var main = new Main();
