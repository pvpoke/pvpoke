// An action set in Sandbox Mode to be interpreted by Battle.js into a TimelineEvent

function TimelineAction(type, actor, turn, value, settings){
	this.type = type;
	this.actor = actor;
	this.turn = turn;
	this.value = value; // Index of charged move
	this.settings = settings;
	this.valid = false;
	this.processed = false; // Whether this action has been processed yet or not
	var self = this;

	this.typeToInt = function(){
		switch(self.type){
			case "fast":
			case "charged":
				return 1;
				break;

			case "wait":
				return 2;
				break;
		}

		return 0;
	}
}
