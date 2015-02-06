
//A moving agent
function Agent(home, target, weight) {
	this.home = home;
	this.location = home;
	this.target = target;
	this.weight = weight;
	this.distance = 0; //distance between 0-1 when traveling, goes up

	this.speed = 100; //how many pixels the agent should move per second on low traffic road

	this.TTL = 30; //lel <-- julmaa

	this.path = null;

	this.remove = false; //manual removal from cities
}

Agent.prototype.update = function(dt, weight, length) {
	this.distance += weight*(this.speed/length)*dt/1000;
}

Agent.prototype.draw = function(x, y) {
	context.fillStyle = "cyan";
	context.beginPath();
	context.arc(x, y, 4, 0, Math.PI*2);
	context.fill();
	context.strokeStyle = "black";
	context.lineWidth = 2;
	//context.stroke();
}