// JavaScript Document

function TimelineEvent(type, name, actor, time, turn, values){

	values = typeof values !== 'undefined' ? values : [0];

	this.type = type;
	this.name = name;
	this.actor = actor;
	this.time = time;
	this.turn = turn;
	this.values = values; // 0 - damage, 1 - energy
}
