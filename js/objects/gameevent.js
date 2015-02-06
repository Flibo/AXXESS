//Game Events
//func is called every update
//callback is called after time limit is up

/* Example use
	this.EH = new EventHandler();

	var test_event = new GameEvent("test", 3000
		, function() {
			//console.log(this.params);
			return "update";
	},    function() {
			return "done";
	}, {string: "test string"}); //empty parameters

	this.EH.addEvent(test_event);


	update:
	this.EH.update(dt);

*/


//Basically a custom version of setTimeout but with some flexibility

function GameEvent(name, limit, func, callback, params) {
	this.name = name;
	this.limit = limit;
	this.func = func;
	this.callback = callback;
	this.params = params;
	this.finished = false;
	this.called_back = false;
	this.timer = 0;
}

//returns the value of the called function, or null if the GameEvent has finished
GameEvent.prototype.update = function() {
	if (this.limit != -1) { //infinite event
		this.timer += arguments[0][0];
	} else {
		this.timer = -2;
	}
	

	if (this.timer > this.limit && !this.finished) {
		this.finished = true;
	}

	if (!this.finished) {
		return this.func(arguments[0]);
	}

	if (this.finished && !this.called_back) {
		this.called_back = true;
		return this.callback(arguments[0]);
	}
	return null;
}

GameEvent.prototype.copy = function(data) {
	if (arguments.length == 0) {
		return new GameEvent(this.name, this.limit, this.func, this.callback, this.params);
	} else { //override certain values
		var name = data.name ? data.name : this.name;
		var limit = data.limit ? data.limit : this.limit;
		var func = data.func ? data.func : this.func;
		var callback = data.callback ? data.callback : this.callback;
		var params = data.params ? data.params : this.params;

		return new GameEvent(name, limit, func, callback, params);
	}
		
}



function EventHandler() {
	this.events = [];
}

EventHandler.prototype.addEvent = function(event) {
	this.events.push(event);
}

EventHandler.prototype.update = function(dt) {
	//console.log(this.events.length);
	for (var i = this.events.length - 1; i >= 0; i--) {	
		var res = this.events[i].update(arguments);
		if (this.events[i].finished) {
			this.events.splice(i, 1);
		}
	}
}
