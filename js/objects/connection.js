function Connection(id, source, dest) {
	this.id = id;
	this.opposite = null;
	this.source = source;
	this.dest = dest;
	this.len = Math.pow(Math.pow((dest.world_x - source.world_x), 2) + Math.pow((dest.world_y - source.world_y), 2), 0.5);
	this.material = 0;
	this.baseweight = 0; 
	this.weightlimits = [30, 100]; //and numeric values possible
	this.factorlimits = [0.20, 1.00]; //both can be between 0 and 1
	this.weight = this.baseweight; //;20;// + Math.floor(Math.random()*100); //placeholder i guess
	this.spd_factor = 1;

	this.agents = []; //list of agents traveling on this connection
}

Connection.prototype.destroy = function() {
	/*//move agents back to their homes
	for (var i = 0; i < this.agents.length; i++) {
		this.source.agents.push(this.agents[i]);
	}
	for (var i = 0; i < this.opposite.agents.length; i++) {
		this.dest.agents.push(this.opposite.agents[i]);
	}*/
	//destroy the agents
	for (var i = 0; i < this.agents.length; i++) {
		delete this.agents[i];
	}
	for (var i = 0; i < this.opposite.agents.length; i++) {
		delete this.opposite.agents[i];
	}

	//remove the connection from the city's list and from weightmap
	for (var i = 0; i < this.source.connections[this.dest.id].length; i++) {
		if (this.source.connections[this.dest.id][i].id == this.id) {
			this.source.connections[this.dest.id].splice(i, 1);
			if (this.source.connections[this.dest.id].length == 0) {
				delete this.source.world.weight_map[this.source.id][this.dest.id];
				delete this.source.connections[this.dest.id];
			}
			else {
				adjustWeightMap(this.source.world, this.source, this.dest);
			}
			break;
		}
	}
	for (var i = 0; i < this.dest.connections[this.source.id].length; i++) {
		if (this.dest.connections[this.source.id][i].id == this.opposite.id) {
			this.dest.connections[this.source.id].splice(i, 1);
			if (this.dest.connections[this.source.id].length == 0) {
				delete this.dest.world.weight_map[this.dest.id][this.source.id];
				delete this.dest.connections[this.source.id];
			} 
			else {
				adjustWeightMap(this.source.world, this.source, this.dest);
			}
			break;
		}
	}

	this.agents = null;
	this.opposite.agents = null;
	this.opposite = null;
}

Connection.prototype.update = function(dt) {
	this.spd_factor = this.getLimitedWeight();
	//limited range:
	//low to high, eg. 30 to 300
	this.spd_factor = this.weightlimits[1] - this.spd_factor; //turns the calculated weight to a nicer form (difference from max)
	//high-low to 0, eg. 270 to 0
	this.spd_factor /= (this.weightlimits[1] - this.weightlimits[0]);
	//1 to 0
	this.spd_factor = Math.min(Math.max(this.factorlimits[0], this.spd_factor), this.factorlimits[1]);
	//between factorlimits, eg. 0.10 to 1.00

	for (var i = 0; i < this.agents.length; i++) {

		this.agents[i].update(dt, this.spd_factor, this.len);

		if (this.agents[i].distance >= 1) {
			var a  = this.removeAgent(this.agents[i]);
			this.dest.addAgent(a);
		}
	}
}

Connection.prototype.addAgent = function(agent) {
	this.agents.push(agent);
	this.weight += agent.weight;
	this.opposite.weight += agent.weight;
	adjustWeightMap(this.source.world, this.source, this.dest);
}

Connection.prototype.removeAgent = function(agent) {
	var i = this.agents.indexOf(agent);
	if (i > -1) {
		this.weight -= agent.weight;
		this.opposite.weight -= agent.weight;
		adjustWeightMap(this.source.world, this.source, this.dest);
		return this.agents.splice(i, 1)[0];
	}
	else {
		console.log("Connection.prototype.removeAgent: Couldn't find such an agent"); //panostus
		return null;
	}
}

Connection.prototype.getLimitedWeight = function() {
	return Math.max(Math.min(this.weight/((this.material+1)/2), this.weightlimits[1]), this.weightlimits[0]);

}

Connection.prototype.getStyle = function() {
	//normalize factor range from, eg. 0.1 - 0.9 to 0.0 - 1.0
	var norm_factor = (this.spd_factor - this.factorlimits[0])/this.factorlimits[1];
	return "hsl(" + Math.floor(norm_factor*120) + ", 70%, 50%)";
}

Connection.prototype.getTraffic = function() { //float 0-1
	var w = this.getLimitedWeight();
	w = this.weightlimits[1] - w;
	w /= (this.weightlimits[1] - this.weightlimits[0]);
	return 1-w;
}

//this should be called whenever there's a new connection or a connection's weight changes
function adjustWeightMap(world, city1, city2) {
	var min_weight = 9999;
	for (var i = 0; i < city1.connections[city2.id].length; i++) {
		if (city1.connections[city2.id][i].weight < min_weight) {
			min_weight = city1.connections[city2.id][i].weight;
		}
	}

	world.weight_map[city1.id][city2.id] = min_weight;
	world.weight_map[city2.id][city1.id] = min_weight;
}