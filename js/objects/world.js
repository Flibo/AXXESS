function World(width, height) {
	this.data = [];
	this.width = width;
	this.height = height;

	for (var i = 0; i < width; i++) {
		var build = [];
		for (var j = 0; j < height; j++) {
			build.push(3);
		}
		this.data.push(build);
	}


	//Ellipse
	var rx = width/2;
	var ry = height/2;
	var h = width/2;
	var k = height/2;

	for (var i = 0; i < width; i++) {
		for (var j = 0; j < height; j++) {
			if ( Math.pow(i-h, 2)/Math.pow(rx, 2) + Math.pow(j-k, 2)/Math.pow(ry, 2) - 1 <= 0) {
				this.data[i][j] = 2;
			}
		}
	}


	this.continents = [];
	this.continent_lines = [];
	this.cities = [];
	this.continent_cityspots = [];

	this.progress = 0;

	this.contcount = 0;
	this.randomcount = 0;
	this.generated_this_size = 0;
	this.cur_size = 0;
	this.continentid = 0;
	this.cityid = 0;
	this.connectionid = 0;
	this.weight_map = {};
}

//wat
World.prototype.tilesize = 12;

World.prototype.getProgress = function() {
	return this.progress;
}


//return value true - continue calling this function
//return value false - stop calling this function - either world is generated fully or it would take too long
World.prototype.generate = function() {
	var contlimit = 9;

	var randomlimit = 20;

	var tetriminos = 50; //+ rand 15 in code

	var params = [];
	//width, height, tetriminos, limit

	params.push([48, 48, 60, 2]); //big
	params.push([16, 16, 15, 4]); //medium
	params.push([12, 12, 5, 3]);  //small

	while (this.contcount < contlimit) {

		// if we generated enough of a certain size of continent, use the next one
		if (this.generated_this_size == params[this.cur_size][3]) {
			this.cur_size++;
			this.randomcount = 0;
			this.generated_this_size = 0;
		}

		// if we tried adding a continent but couldn't because it was too big, use a smaller continent size and reset random counter
		if (this.randomcount > randomlimit) {
			this.cur_size++;
			this.randomcount = 0;
		}

		if (this.cur_size >= params.length) {
			return false; //no more continent size presets left to generate!
		}

		var continent = new Continent(this.continentid++, 0, 0, params[this.cur_size][0], params[this.cur_size][1]);
		continent.generate(params[this.cur_size][2]);
		continent.crop();

		var w = continent.w;
		var h = continent.h;

		//lets try to find a red spot 100 times
		var red_random = 0;
		while (red_random < 100) {
			var r_x = Math.floor(Math.random()*this.width);
			var r_y = Math.floor(Math.random()*this.height);

			if (this.data[r_x][r_y] != 2) {
				red_random++;
			} else {
				break;
			}
		}
		
		if (red_random == 100) {
			return false; //couldnt find a new unassigned spot on the map in 100 random steps
		}

		//if the random point would go over the edge
		if (r_x + w >= this.width || r_y + h >= this.height) {
			this.randomcount++;
			return true; //retry
		}

		var isEmpty = true;
		//if we got too close to another continent
		for (var i = -2; i < w+2; i++) {
			for (var j = -2; j < h+2; j++) {
				if (r_x + i < 0 || r_x + i > this.width - 1 || r_y + j < 0 || r_y + j > this.height - 1) {
					continue; //out of bounds
				}
				if (this.data[r_x + i][r_y + j] == 1 || this.data[r_x + i][r_y + j] == 3) {
					isEmpty = false;
				}
			}
		}

		if (!isEmpty) {
			this.randomcount++;
			return true;
		}

		//We can finally add the continent to the world!

		for (var i = 0; i < w; i++) {
			for (var j = 0; j < h; j++) {
				this.data[r_x + i][r_y + j] = continent.get(i, j);
				if (continent.get(i, j) != 0 && continent.get(i, j) != 1) {
				}
			}
		}


		continent.x = r_x;
		continent.y  = r_y;
		
		this.continents.push(continent);
		this.continent_lines.push(continent.getEdgeCoordinates());
		this.continent_cityspots.push(this.generateCities(continent));

		this.contcount++;
		this.generated_this_size++;

		this.randomcount = 0;

		this.progress = this.contcount / contlimit;
		return true;
	}

	return false;
}

World.prototype.generateCities = function(continent) {
	//variables
	var area = 0;
	var bounds = continent.bounds;
	var land_copy = [];
	var landspots = [];
	var cityspots = [];
	//copy the original continent data
	for (var i = 0; i < continent.w; i++) { //bounds is actually jxi not ixj
		var temp = [];
		for (var j = 0; j < continent.h; j++) {
			temp.push(continent.get(i, j));
		}
		land_copy.push(temp);
	}
	//calculate area
	for (var i = 0; i < continent.w; i++) {
		for (var j = 0; j < continent.h; j++) {
			if (continent.get(i, j) == 1) {
				area++;
				landspots.push([i, j]);
			}
		}
	}
	//figure out number of cities max
	var city_radiuslimit = 5;//Math.max(3, Math.floor(area/25)); //range limit of how close cities can get
	var city_area = 5;
	var max_cities = 20;//Math.ceil(area/city_area);
	//put one randomly
	var random_spot = landspots[Math.floor(Math.random()*landspots.length)];
	cityspots.push(random_spot);
	//remove that area from possible locations
	removeArea(land_copy, random_spot[0], random_spot[1], city_radiuslimit);
	landspots = recalc_free_land(land_copy);
	//put rest as far as possible
	while(cityspots.length < max_cities) {
		if (landspots.length == 0) {
			break;
		}

		var maxdist = 0;
		var maxspot = [];
		for (var i = 0; i < landspots.length; i++) {
			var totaldist = 0;
			for (var j = 0; j < cityspots.length; j++) {
				var dist = Math.pow(Math.pow(cityspots[j][0] - landspots[i][0], 2) + Math.pow(cityspots[j][1] - landspots[i][1], 2), 0.5);
				totaldist += dist;
			}

			if (totaldist >= maxdist) {
				maxdist = totaldist;
				maxspot = landspots[i];
			}
		}

		cityspots.push(maxspot);
		removeArea(land_copy, maxspot[0], maxspot[1], city_radiuslimit);
		landspots = recalc_free_land(land_copy);
	}

	//return
	return cityspots;
}

World.prototype.newCity = function() {
	//take a random city location
	var r_cont = Math.floor(Math.random()*this.continents.length);
	var all = [];
	while(this.continent_cityspots[r_cont].length == 0) {
		r_cont = Math.floor(Math.random()*this.continents.length);
		if (all.indexOf(r_cont) == -1) {
			all.push(r_cont);
		} else {
			if (all.length == this.continents.length) {
				return null; //cant add new cities
			}
		}
	}

	var r_cityloc = this.continent_cityspots[r_cont].splice(Math.floor(Math.random()*this.continent_cityspots[r_cont].length), 1)[0];
	
	//generate a random city name
	var r_name = chance.city(); //chance.js

	var jitter = 4;

	var c_x = this.continents[r_cont].x*this.tilesize + r_cityloc[0]*this.tilesize -jitter + Math.floor(Math.random()*(jitter*2+1));
	var c_y = this.continents[r_cont].y*this.tilesize + r_cityloc[1]*this.tilesize -jitter + Math.floor(Math.random()*(jitter*2+1));

	//add a city there
	var city = new City
	(
		  this
		, this.cityid++ 				//id
		, r_name						//name
		, this.continents[r_cont]		//continent
		, 5 							//size
		,  c_x							//world x
		,  c_y 							//world y
	);							

	city.rel_x = r_cityloc[0];
	city.rel_y = r_cityloc[1];

	return city;
}


World.prototype.addCity = function(city) {
	this.weight_map[city.id] = {};
	this.cities.push(city);
}

World.prototype.removeCity = function(city) {
	this.cities.splice(this.cities.indexOf(city), 1);
}

World.prototype.randomCity = function() {
	//return random already existing city
	//flatten cities to a list
	
	var r_city = Math.floor(Math.random()*this.cities.length);
	var city = this.cities[r_city];

	return city;
}

World.prototype.getCityById = function(id) {

	for (var i = 0; i < this.cities.length; i++) { //each city
		if (this.cities[i].id == id) {
			return this.cities[i];
		}
	}
	
	return null;
}



function removeArea(array, x, y, radius) {
	for (var i = 0; i < array.length; i++) {
		for (var j = 0; j < array[0].length; j++) {
			if (Math.pow(Math.pow(x-i, 2) + Math.pow(y-j, 2), 0.5) <= radius) {
				array[i][j] = 0;
			}
		}
	}
}

function recalc_free_land(array) {
	var temp = [];
	for (var i = 0; i < array.length; i++) {
		for (var j = 0; j < array[0].length; j++) {
			if (array[i][j] == 1) {
				temp.push([i, j]);
			}
		}
	}
	return temp;
}

World.prototype.makeConnection = function(from, to, material) {
	//find which cities were hit
	/*var from_city = null;

	for (var i = 0; i < this.cities.length; i++) {
		var city = this.cities[i];
		if (distance(from, [city.world_x, city.world_y]) < 32) {
			from_city = city;
		}
	}
	

	var to_city = null;
	for (var i = 0; i < this.cities.length; i++) {
		var city = this.cities[i];
		if (distance(to, [city.world_x, city.world_y]) < 32) {
			to_city = city;
		}
	}*/
	
	//if they are not the same, make a connection

	if (from != null && to != null) {
		if (from.id != to.id) {
			from.addConnection(this.connectionid++, to, material);
		}
	}
}
//DEV ONLY
World.prototype.makeAgent = function(from, to) {
	var from_city = null;
	for (var i = 0; i < this.cities.length; i++) {
		var city = this.cities[i];
		if (distance(from, [city.world_x, city.world_y]) < 32) {
			from_city = city;
		}
		
	}
	//if they are not the same, make a connection

	if (from_city != null) {
		from_city.addAgent();
	}
}

//this shouldn't be needed
World.prototype.generateWeightMap = function() {
	//generate graph
	this.weight_map = {};
	var index = 0;

	for (var i = 0; i < this.cities.length; i++) {
		var city = this.cities[i];
		var connections = city.connections;
		weight_map[city.id] = {};
		for (key in connections) {
			//if there is more than one connection between two cities, choose the fastest one
			if (connections[key].length > 1) {
				index = 0;
				var min_weight = 9999;
				for (var k = 0; k < connections[key].length; k++) {
					if (connections[key][k].weight < min_weight) {
						min_weight = connections[key][k].weight;
						index = k;
					}
				}
			}
			else {
				index = 0;
			}

			this.weight_map[city.id][connections[key][index].dest.id] = connections[key][index].weight;
		}
	}
}

World.prototype.getClosestCity = function(spot) {
	var closest = null;
	var dist = 9999999;
	for (var i = 0; i < this.cities.length; i++) {
		if (closest == null) {
			closest = this.cities[i];
			dist = distance(spot, [closest.world_x, closest.world_y]);
		} else {
			var new_dist  = distance(spot, [this.cities[i].world_x, this.cities[i].world_y]);
			if (new_dist < dist) {
				dist = new_dist;
				closest = this.cities[i];
			}
		}
	}
	return closest;
}