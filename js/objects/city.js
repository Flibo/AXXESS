function City(world, id, name, continent, size, x, y) {
	this.world = world;
	this.id = id;
	this.name = name;
	this.continent = continent;
	this.size = size;

	this.world_x = x;
	this.world_y = y;

	//Mechanics
	this.development = 1; //speed of development
	this.connections = {};	//key-value pairs of (other city, list of connection objects)
	this.agents = []; //list of agents that are currently in this city

	this.prosperity = 0.75; //float from 0 to 1

	this.avg_traffic = 0;
	this.avg_income = 0;

	//City's own event handler
	this.EH = new EventHandler();

	//normal city agent generation
	//the 3000 below is the initial timer before any agents are sent
	var agentgen_event = new GameEvent("agentgen test", 5000
		, function() {

		}, function() {
			this.params.owner.addAgent();
			this.params.EH.addEvent(this.copy({limit: this.params.owner.getAgentGenTimer()}));
		}, {EH: this.EH, owner: this});

	this.EH.addEvent(agentgen_event);


	//
	this.send_timer = 0;
	this.send_limit = 0; //seconds

	this.funds = 0;

	this.alive = true;

}

City.prototype.getAgentGenTimer = function() {
	return 5000 - this.development*300 - 1000*Math.random();
}

City.prototype.development_speeds = ["Stagnant", "Slow", "Normal", "Fast", "Rapid"];

City.prototype.boost = function(incr) {
	this.development = Math.max(0, Math.min(this.development_speeds.length - 1, this.development + incr));
}

/* sublime text minimap helper                                                                                                    
                                                                                                                                 
UUUUUUUU     UUUUUUUUPPPPPPPPPPPPPPPPP   DDDDDDDDDDDDD                  AAA         TTTTTTTTTTTTTTTTTTTTTTTEEEEEEEEEEEEEEEEEEEEEE
U::::::U     U::::::UP::::::::::::::::P  D::::::::::::DDD              A:::A        T:::::::::::::::::::::TE::::::::::::::::::::E
U::::::U     U::::::UP::::::PPPPPP:::::P D:::::::::::::::DD           A:::::A       T:::::::::::::::::::::TE::::::::::::::::::::E
UU:::::U     U:::::UUPP:::::P     P:::::PDDD:::::DDDDD:::::D         A:::::::A      T:::::TT:::::::TT:::::TEE::::::EEEEEEEEE::::E
 U:::::U     U:::::U   P::::P     P:::::P  D:::::D    D:::::D       A:::::::::A     TTTTTT  T:::::T  TTTTTT  E:::::E       EEEEEE
 U:::::D     D:::::U   P::::P     P:::::P  D:::::D     D:::::D     A:::::A:::::A            T:::::T          E:::::E             
 U:::::D     D:::::U   P::::PPPPPP:::::P   D:::::D     D:::::D    A:::::A A:::::A           T:::::T          E::::::EEEEEEEEEE   
 U:::::D     D:::::U   P:::::::::::::PP    D:::::D     D:::::D   A:::::A   A:::::A          T:::::T          E:::::::::::::::E   
 U:::::D     D:::::U   P::::PPPPPPPPP      D:::::D     D:::::D  A:::::A     A:::::A         T:::::T          E:::::::::::::::E   
 U:::::D     D:::::U   P::::P              D:::::D     D:::::D A:::::AAAAAAAAA:::::A        T:::::T          E::::::EEEEEEEEEE   
 U:::::D     D:::::U   P::::P              D:::::D     D:::::DA:::::::::::::::::::::A       T:::::T          E:::::E             
 U::::::U   U::::::U   P::::P              D:::::D    D:::::DA:::::AAAAAAAAAAAAA:::::A      T:::::T          E:::::E       EEEEEE
 U:::::::UUU:::::::U PP::::::PP          DDD:::::DDDDD:::::DA:::::A             A:::::A   TT:::::::TT      EE::::::EEEEEEEE:::::E
  UU:::::::::::::UU  P::::::::P          D:::::::::::::::DDA:::::A               A:::::A  T:::::::::T      E::::::::::::::::::::E
    UU:::::::::UU    P::::::::P          D::::::::::::DDD A:::::A                 A:::::A T:::::::::T      E::::::::::::::::::::E
      UUUUUUUUU      PPPPPPPPPP          DDDDDDDDDDDDD   AAAAAAA                   AAAAAAATTTTTTTTTTT      EEEEEEEEEEEEEEEEEEEEEE
                                                                                                                                 
*/

City.prototype.update = function(dt) {

	this.EH.update(dt);

	this.funds += this.getIncome();

	if (this.agents.length > 1) {
		this.prosperity -= 0.0001 //agents dont like lying around
		if (this.agents.length > 5) {
			this.prosperity -= 0.0001;
			if (this.agents.length > 10) {
				this.prosperity -= 0.0001;
			}
		}
	}
	
	for (var i = 0; i < this.agents.length; i++) {
		if (this.agents[i].remove) {
			this.agents.splice(i--, 1); //removed because obsolete (target was destroyed)
		}
	}


	if (this.prosperity >= 1) {
		
		this.prosperity = 1;
		this.boost(1);
		if (this.development != this.development_speeds.length - 1) {
			this.prosperity = 0.4;
			this.funds += 200;
		} //else do something noice
	} else if (this.prosperity < 0.20) {
		if (this.development == 0) {
			if (this.prosperity <= 0.01) {
				this.alive = false;
			}
		} else {
			this.boost(-1);
		this.prosperity = 0.8;
		}
		
	}


	for (var i = 0; i < this.agents.length; i++) {
		if (this.agents[i].target == this) {
			var agent = this.agents.splice(i--, 1);
			agent = null; //rip
			this.funds += 0.75;
			this.prosperity += 0.04; //city makes "profit" if an agent has to travel
									 //at most 5 paths to get here
		}
	}

	//Send agents from here towards their target
	
	this.send_timer += dt/1000;
	if (this.send_timer > this.send_limit) {
		this.send_timer = 0;

		for (var i = 0; i < this.agents.length; i++) {
			var a = this.agents.splice(i--, 1)[0];
			a.path = this.findFastestPath(this.world, a.target);
			if (a.path == null || a.path.length == 0) {
				this.agents.splice(++i, 0, a); //adds it back in
				continue;
			}

			var min_weight = 9999;
			var min_conn = null;
			for (var j = 0; j < this.connections[a.path[1].id].length; j++) {
				if (this.connections[a.path[1].id][j].weight < min_weight) {
					min_weight = this.connections[a.path[1].id][j].weight;
					min_conn = this.connections[a.path[1].id][j];
				}
			}

			a.distance = 0;
			min_conn.addAgent(a);
			this.prosperity -= 0.008; //sending an agent loses some prosperity

		}
		

		//Recalculate average traffic for tooltip
		this.avg_traffic = 0;

		var counter = 0; //because stupid object and no .length
		for (var c in this.connections) {
			var conn = this.connections[c];
			for (var i = 0; i < conn.length; i++) {
				this.avg_traffic += conn[i].getTraffic();
				counter++;
			}
			
		}
		this.avg_traffic = counter != 0 ? this.avg_traffic/counter : 0;

	}
}

/* sublime text minimap helper
DDDDDDDDDDDDD      RRRRRRRRRRRRRRRRR                  AAA   WWWWWWWW                           WWWWWWWW
D::::::::::::DDD   R::::::::::::::::R                A:::A  W::::::W                           W::::::W
D:::::::::::::::DD R::::::RRRRRR:::::R              A:::::A W::::::W                           W::::::W
DDD:::::DDDDD:::::DRR:::::R     R:::::R            A:::::::AW::::::W                           W::::::W
  D:::::D    D:::::D R::::R     R:::::R           A:::::::::AW:::::W           WWWWW           W:::::W 
  D:::::D     D:::::DR::::R     R:::::R          A:::::A:::::AW:::::W         W:::::W         W:::::W  
  D:::::D     D:::::DR::::RRRRRR:::::R          A:::::A A:::::AW:::::W       W:::::::W       W:::::W   
  D:::::D     D:::::DR:::::::::::::RR          A:::::A   A:::::AW:::::W     W:::::::::W     W:::::W    
  D:::::D     D:::::DR::::RRRRRR:::::R        A:::::A     A:::::AW:::::W   W:::::W:::::W   W:::::W     
  D:::::D     D:::::DR::::R     R:::::R      A:::::AAAAAAAAA:::::AW:::::W W:::::W W:::::W W:::::W      
  D:::::D     D:::::DR::::R     R:::::R     A:::::::::::::::::::::AW:::::W:::::W   W:::::W:::::W       
  D:::::D    D:::::D R::::R     R:::::R    A:::::AAAAAAAAAAAAA:::::AW:::::::::W     W:::::::::W        
DDD:::::DDDDD:::::DRR:::::R     R:::::R   A:::::A             A:::::AW:::::::W       W:::::::W         
D:::::::::::::::DD R::::::R     R:::::R  A:::::A               A:::::AW:::::W         W:::::W          
D::::::::::::DDD   R::::::R     R:::::R A:::::A                 A:::::AW:::W           W:::W           
DDDDDDDDDDDDD      RRRRRRRR     RRRRRRRAAAAAAA                   AAAAAAAWWW             WWW     
*/

City.prototype.draw = function(dt) {
	//Draw the city marker and the tooltip if the mouse is hovering over the icon
	/*
		 ^
		/ \
	   /   \
	   \   /
	   	\ /
	   	 V
	*/
	context.strokeStyle = "#00ff00";
	context.lineWidth = 1;
	context.beginPath();
	var xbase = this.world_x;
	var ybase = this.world_y;
	var sx = 10 + 2*this.development;
	var sy = sx*1.333

	//outline
	context.moveTo(xbase - sx, ybase);
	context.lineTo(xbase, ybase - sy);
	context.lineTo(xbase + sx, ybase);
	context.lineTo(xbase, ybase + sy);
	context.lineTo(xbase - sx, ybase);
	context.stroke();

	//filling
	context.beginPath();
	context.moveTo(xbase, ybase + sy); //bottom point
	if (this.prosperity <= 0.5) {
		context.lineTo(xbase - (this.prosperity * 2) * sx, ybase + sy - (this.prosperity * 2) * sy);
		context.lineTo(xbase + (this.prosperity * 2) * sx, ybase + sy - (this.prosperity * 2) * sy);
		context.lineTo(xbase, ybase + sy);
	} else {
		context.lineTo(xbase - sx, ybase);
		context.lineTo(xbase - sx + (this.prosperity - 0.5)*2 * sx, ybase - (this.prosperity - 0.5)*2 * sy);
		context.lineTo(xbase + sx - (this.prosperity - 0.5)*2 * sx, ybase - (this.prosperity - 0.5)*2 * sy);
		context.lineTo(xbase + sx, ybase);
		context.lineTo(xbase, ybase + sy);
	}

	context.fillStyle = "hsl(" + Math.floor(this.prosperity*120) + ", 70%, 50%)";
	context.fill();

	context.fillStyle = "#00ff00";
	//draw agents as small dots near the marker
	//TODO bugs on larger cities, minor
	var agent_count = Math.min(3, this.agents.length); //max 3 dots
	for (var i = 0; i < agent_count; i++) {
		context.beginPath();
		context.arc(xbase + 1 + 4*(i+1), ybase + 1 - 23 + 5*(i+1), 2, 0, Math.PI*2);
		context.fill();
	}

}

City.prototype.growth_boost = function() { //applies a rapid "growth" to the city
	//this.boost(-1); //intentional

	this.funds += 50;
	this.prosperity += 0.1;

	var agent_count = Math.min(Math.max(Math.floor(this.development*8*Math.random()), 5), 30);
	var newagent_event = new GameEvent("new agent", 100
		, function() {}
		, function() {
			this.params.owner.addAgent();
			if (this.params.count-- > 0) {
				this.params.owner.EH.addEvent(this.copy({count: this.params.count}))
			}
			
		}, {owner: this, count: agent_count});

	this.EH.addEvent(newagent_event);
}


City.prototype.drawTooltip = function(dt) {
	//find the size of the required tooltip box
	var fontsize = 16;
	var pad = 2;
	var bigpad = 8;
	var lines = 3;
	var tt_height = (fontsize+pad)*lines + 100 //# of lines + others
	var border = 1;

	context.font = fontsize*2 + "px AR_DESTINE"; // *3 bug or smth with font

	var name_width = context.measureText(this.name).width;

	var tt_width = Math.max(180, name_width) + 60;

	var base_x = this.world_x;
	var base_y = this.world_y;

	if (base_x + tt_width > canvas.width) {
		base_x -= tt_width;
	}
	if (base_y + tt_height > canvas.height) {
		base_y -= tt_height;
	}

	context.fillStyle = "#00ff00";
	context.fillRect(base_x, base_y, tt_width, tt_height);
	context.fillStyle = "#001100";
	context.fillRect(base_x + border, base_y + border, tt_width - 2*border, tt_height - 2*border);

	var c_x = base_x + tt_width/2;
	var c_y = base_y + tt_height/2;

	var cur_y = base_y;

	//name field and divider
	context.fillStyle = "#00ff00";
	context.fillText(this.name, c_x - name_width/2, cur_y += bigpad + fontsize + 2);
	context.fillRect(base_x, cur_y += bigpad, tt_width, 1);

	context.font = fontsize + "px Courier";
	//prosperity
	context.fillText("Prosperity: " + Math.round(this.prosperity*100) + "%", base_x + fontsize, cur_y += bigpad + fontsize + 2);
	context.fillText("Progress: " + this.development_speeds[this.development], base_x + fontsize, cur_y += bigpad + fontsize + 2);
	context.fillText("Average traffic: " + Math.round(this.avg_traffic*100) + "%", base_x + fontsize, cur_y += bigpad + fontsize + 2);
	context.fillText("Income: $" + this.avg_income.toFixed(2), base_x + fontsize, cur_y += bigpad + fontsize + 2);
}

City.prototype.findFastestPath = function(world, destination) {
	//Dijkstra, credit to andrewhayward @ GitHub: https://github.com/andrewhayward/dijkstra
	graph = new Graph(world.weight_map);
	var result = graph.findShortestPath(this.id.toString(), destination.id.toString());
	if (result == null) {
		return null;
	}
	else {
		for (var i = 0; i < result.length; i++) {
			result[i] = world.getCityById(parseInt(result[i]));
		}

		return result;
	}
}

function pushOrCreate(dict, key, val) {
	if (dict.hasOwnProperty(key)) {
		dict[key].push(val);
	}
	else {
		dict[key] = [val];
	}
}

City.prototype.addConnection = function(id, dest, material) {
	var t_conn = new Connection(id, this, dest);
	var o_conn = new Connection(id, dest, this);
	t_conn.material = material;
	o_conn.material = material;
	t_conn.opposite = o_conn;
	o_conn.opposite = t_conn;

	//calculate weight here?
	//unless material single-handedly decides it
	//in which case, ignore this

	pushOrCreate(this.connections, dest.id, t_conn);
	pushOrCreate(dest.connections, this.id, o_conn);

	adjustWeightMap(this.world, this, dest);
}

City.prototype.addAgent = function(agent) {
	//if given parameter is empty, just create a new one

	if (arguments.length == 0) {
		var r_city = this.world.randomCity();
		while(this.id == r_city.id && typeof r_city != "undefined") {
			if (this.world.cities.length == 1) { //there is only one city? shouldnt happen but avoids infinite loop
				return;
			}
			r_city = this.world.randomCity();
		}

		var r_weight = Math.floor(Math.random()*5+10);
		this.agents.push(new Agent(this, r_city, r_weight));
	} else { //DOESNT WORK FOR NEWLY CREATED?
		this.agents.push(agent);
		agent.location = this;
		agent.distance = 0;
	}

}


//unneeded?
City.prototype.removeAgent = function(agent) {
	var i = this.agents.indexOf(agent);
	if (i > -1) {
		return this.agents.splice(i, 1)[0]; //index 0 because splice returns a list
	} else {
		console.log("City.prototype.removeAgent: Couldn't find such an agent"); //panostus
		return null;
	}
}

City.prototype.getAccumulatedFunds = function() {
	var temp = this.funds;
	this.avg_income = temp;
	this.funds = 0;
	return temp;
}

City.prototype.getCostTo = function(other, material) {
	//base cost for building any connection + if it's intercontinental
	var dist = distance([this.world_x, this.world_y], [other.world_x, other.world_y]);
	var intercont = this.continent != other.continent;

	var basecost = 100 + (intercont ? 100 : 0);
	var matcost = material;

	var cost = (basecost + dist*matcost)*(intercont ? 1.5 : 1);
	return cost;
}

City.prototype.getIncome = function() {
	return Math.max(Math.min(this.prosperity, 1), 0.5) * (this.development != 0 ? this.development : 0.5) / 35;
}

City.prototype.destroy = function() {

	var refund_conns = 0;
	for (var i = 0; i < this.connections.length; i++) {
		refund_conns += this.getCostTo(this.connections[i].dest, this.connections[i].material) * 0.5;
		this.connections[i].destroy();
	}

	//remove agents from other cities that would become idle forever
	for (var i = 0; i < this.world.cities.length; i++) {
		var other = this.world.cities[i];
		if (other != this) {
			for (var j = 0; j < other.agents.length; j++) {
				var agent = other.agents[j];
				if (agent.target == this) {
					agent.remove = true;
				}
			}
		}
	}

	return this.funds + refund_conns;
}