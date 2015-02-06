function Tetrimino() {
	this.shape = [[0, 0, 0, 0]
				 ,[0, 0, 0, 0]
				 ,[0, 0, 0, 0]
				 ,[0, 0, 0, 0]];
}

Tetrimino.prototype.assignShape = function(n) {
	switch(n) {
		case 0:
			this.shape = [[1, 1, 1, 1]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]];
			break;
		case 1:
			this.shape = [[1, 1, 1, 0]
						 ,[0, 0, 1, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]];
			break;
		case 2:
			this.shape = [[1, 1, 1, 0]
						 ,[1, 0, 0, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]];
			break;
		case 3:
			this.shape = [[1, 1, 0, 0]
						 ,[1, 1, 0, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]];
			break;
		case 4:
			this.shape = [[0, 1, 1, 0]
						 ,[1, 1, 0, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]];
			break;
		case 5:
			this.shape = [[1, 1, 1, 0]
						 ,[0, 1, 0, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]];
			break;
		case 6:
			this.shape = [[1, 1, 0, 0]
						 ,[0, 1, 1, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]];
			break;
		default:
			this.shape = [[0, 0, 0, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]
						 ,[0, 0, 0, 0]];	 
	}
}


function copy(o) {
   var out, v, key;
   out = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       out[key] = (typeof v === "object") ? copy(v) : v;
   }
   return out;
}

Tetrimino.prototype.mirror = function() {
	var temp = copy(this.shape);
  	for (var j = 0; j < 4; j++) {
  		for (var i = 0; i < 4; i++) {
  			this.shape[i][j] = temp[j][i];
  		}
  	}
}

function zeros(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}

//class for continents which are created by molding tetriminos together
//w and h are tetrimino block units
function Continent(id, x, y, w, h) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.points = [];
    this.bounds = zeros([h, w]);
    r = 2.25;

    //initialize continent with a center

    this.bounds[Math.floor(h/2)][Math.floor(w/2)] = 1;
    this.bounds[Math.floor(h/2 + 1)][Math.floor(w/2)] = 1;
    this.bounds[Math.floor(h/2 + 1)][Math.floor(w/2 + 1)] = 1;
    this.bounds[Math.floor(h/2)][Math.floor(w/2 + 1)] = 1;

    //this will probably break easily, use with care and big numbers
    for (var i = Math.floor(w / r); i < Math.floor((r - 1) * w / r); i++) {
    	for (var j = Math.floor(h / r); j < Math.floor((r - 1) * h / r); j++) {
    		this.bounds[j][i] = 1;
    	}
    }
}

Continent.prototype.get = function(x, y) {
	return this.bounds[y][x];
}

Continent.prototype.generate = function(n) {
	for (var i = 0; i < n; i++) {
		block = new Tetrimino();
		// bias for square tetrimino
		if (Math.random() > 0.05) {
			block.assignShape(3);
		}
		else {
			block.assignShape(Math.floor(Math.random() * 7));
		}
		if (Math.random() > 0.5) {block.mirror();}
		this.grow(block);
	}

	this.crop();
}

//helper function for Continent.grow
Continent.prototype.drawIfCollision = function(tetrimino, x, y) {
	if (this.checkCollision(tetrimino, x, y)) {
		for (j = 0; j < 4; j++) {
			for (i = 0; i < 4; i++) {
				if (tetrimino.shape[j][i] == 1) {
					this.bounds[y + j][x + i] = 1;
				}
			}
		}
		return true;
	}
	return false;
}

//basically this function just drops tetriminos on the continent from all directions
Continent.prototype.grow = function(tetrimino) {
	var grown = false;
	var bounds = this.getContinentBounds();

	//i'm not 100% confident on these
	var x_min = bounds[0][0] - 3;
	var y_min = bounds[0][1] - 3;
	var x_max = bounds[1][0];
	var y_max = bounds[1][1];

	if (x_min < 0) {x_min = 0;}
	if (y_min < 0) {y_min = 0;}
	if (x_max > this.w - 4) {x_max = this.w - 4;}
	if (y_max > this.h - 4) {y_max = this.h - 4;}

	var direction = Math.floor(Math.random() * 4);

	switch (direction) {
		case 0: //up
			var x = Math.floor(Math.random() * (x_max - x_min)) + x_min;

			for (var y = y_min; y < y_max; y++) {
				if (this.drawIfCollision(tetrimino, x, y)) {
					grown = true;
					break;
				}
			}
			break;

		case 1: //left
			var y = Math.floor(Math.random() * (y_max - y_min)) + y_min;

			for (var x = x_min; x < x_max; x++) {
				if (this.drawIfCollision(tetrimino, x, y)) {
					grown = true;
					break;
				}
			}
			break;

		case 2: //down
			var x = Math.floor(Math.random() * (x_max - x_min)) + x_min;

			for (var y = y_max; y > y_min; y--) {
				if (this.drawIfCollision(tetrimino, x, y)) {
					grown = true;
					break;
				}
			}
			break;

		case 3: //right
			var y = Math.floor(Math.random() * (y_max - y_min)) + y_min;

			for (var x = x_max; x > x_min; x--) {
				if (this.drawIfCollision(tetrimino, x, y)) {
					grown = true;
					break;
				}
			}
			break;

		default:
			break;
	}

	if (grown == false) {this.grow(tetrimino);}

}

Continent.prototype.checkCollision = function(tetrimino, offset_x, offset_y) {
	for (var y = offset_y; y < offset_y + 4; y++) {
		for (var x = offset_x; x < offset_x + 4; x++) {
			if ((tetrimino.shape[y - offset_y][x - offset_x] == 1) && (this.bounds[y][x] == 1)) {
				return true;
			}
		}
	}

	return false;
}

Continent.prototype.getContinentBounds = function() {
	var x_min = this.w;
	var x_max = 0;
	var y_min = this.h;
	var y_max = 0;

	for (var y = 0; y < this.h; y++) {
		for (var x = 0; x < this.w; x++) {
			if (this.bounds[y][x] == 1) {
				if 		(y < y_min) {y_min = y;}
				else if (y > y_max) {y_max = y;}
				if 		(x < x_min) {x_min = x;}
				else if (x > x_max) {x_max = x;}
			}
		}
	}

	return [[x_min, y_min], [x_max, y_max]];
}

//reduce the continent to its actual bounds
Continent.prototype.crop = function() {
	var bounds = this.getContinentBounds();
	var x_min = bounds[0][0];
	var y_min = bounds[0][1];
	var x_max = bounds[1][0];
	var y_max = bounds[1][1];

	//crop y
	for (var y = 0; y < y_min; y++) {
		this.bounds.shift();
	}

	for (var y = y_max; y < this.h - 1; y++) {
		this.bounds.pop();
	}

	this.h = this.bounds.length;
	//crop x

	for (var y = 0; y < this.h; y++) {
		for (var x = 0; x < x_min; x++) {
			this.bounds[y].shift();
		}
	}

	for (var y = 0; y < this.h; y++) {
		for (var x = x_max; x < this.w - 1; x++) {
			this.bounds[y].pop();
		}
	}

	this.w = this.bounds[0].length;
}

//add a ring of zeroes around the continent
Continent.prototype.pad = function() {
	//pad y
	this.bounds.unshift(Array.apply(null, new Array(this.w + 2)).map(Number.prototype.valueOf,0));
	this.bounds.push(Array.apply(null, new Array(this.w + 2)).map(Number.prototype.valueOf,0));

	//pad x
	for (var y = 1; y < this.h + 1; y++) {
		this.bounds[y].unshift(0);
		this.bounds[y].push(0);
	}

	this.w += 2;
	this.h += 2;
}

//floodfills the sea which helps us find any lakes inside the continent
Continent.prototype.floodFill = function(x, y) {
	//0 = unvisited water, 1 = unvisited land, 2 = visited water, 3 = visited land
	if (x > this.w - 1 || x < 0 || y > this.h - 1 || y < 0) {return;}

	var n = this.bounds[y][x];
	if (n == 2 || n == 3) {
		return;
	}
	else if (n == 1) {
		this.bounds[y][x] = 3;
		return;
	}
	else {
		this.bounds[y][x] = 2;
		this.floodFill(x + 1, y);
		this.floodFill(x, y + 1);
		this.floodFill(x - 1, y);
		this.floodFill(x, y - 1);
	}
}

//this function walks around the continent and gathers a path
Continent.prototype.walker = function() {
	//initial position, should be guaranteed to hit the continent
	var x = 0;
	var y = Math.round(this.h / 2);

	while (this.bounds[y][x + 1] != 1) {x++;} //go right until we hit a wall

	pos = [x, y];
	directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; //up and clockwise
	dir = directions[0];
	dir_n = 0;

	var next;
	var i = 0;
	var minimum_distance = 5;
	var points = [[x + 0.5, y]];

	start_position = [x, y]; //used also as the end position
	start_direction = directions[0];

	while (1) {
		next = this.bounds[pos[1] + dir[1]][pos[0] + dir[0]];

		if (pos[0] == start_position[0] && pos[1] == start_position[1] 
		 && dir[0] == start_direction[0] && dir[1] == start_direction[1]
		 && i > minimum_distance) {
			break;
		}
		if (next == 0) { //water
			pos[0] += dir[0];
			pos[1] += dir[1];
			dir_n = (dir_n + 1) % 4; //turn right
			dir = directions[dir_n];
		}
		else if (next == 1) { //land
			points.push([pos[0] + dir[0] / 2, pos[1] + dir[1] / 2]);
			dir_n = (dir_n + 3) % 4; //turn left
			dir = directions[dir_n];
		}
		i++;
	}

	return points;
}

Continent.prototype.getEdgeCoordinates = function() {
	this.pad(); //to allow for flood fill and walker
	//find the shoreline
	var points = this.walker();

	//remove any lakes
	this.floodFill(0, 0);
	for (var y = 0; y < this.h; y++) {
		for (var x = 0; x < this.w; x++) {
			if (this.bounds[y][x] == 0) {
				this.bounds[y][x] = 1;
			}
			else if (this.bounds[y][x] == 2) { //undo colors used by floodfill
				this.bounds[y][x] = 0;
			}
			else if (this.bounds[y][x] == 3) { //^
				this.bounds[y][x] = 1;
			}
		}
	}

	this.crop(); //undo pad

	//remove back to back duplicates
	var last = points[0];
	for (var i = 1; i < points.length; i++) {
		if (points[i][0] == last[0] && points[i][1] == last[1]) { //js, not even once
			points.splice(i, 1);
			i--;
		}
		else {
			last = points[i];
		}
	}

	//remove the last element if it's the same as the first
	if (points[points.length - 1][0] == points[0][0]
	 && points[points.length - 1][1] == points[0][1]) {
		points.pop();
	}

	return points;
}

//for testing
Continent.prototype.draw = function() {
	context.fillStyle = "#FF0000";
	size = 16;

	for (var y = 0; y < this.h; y++) {
		for (var x = 0; x < this.w; x++) {
			if (this.bounds[y][x] == 1) {
				context.fillStyle = "#FF0000";
			}
			else if (this.bounds[y][x] == 2) {
				context.fillStyle = "#00FF00";
			}
			else if (this.bounds[y][x] == 3) {
				context.fillStyle = "#0000FF";
			}
			else if (this.bounds[y][x] == 4) {
				context.fillStyle = "#FF00FF";
			}
			else {
				context.fillStyle = "#550000";
			}
			context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
		}
	}
}

function test() {
	canvas = document.getElementById("gameCanvas"); //global
	context = canvas.getContext("2d");

	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);

	//perform math
	var before = +new Date();
	cont = new Continent(1, 0, 0, 12, 12);
	cont.generate(3);
	var points = cont.getEdgeCoordinates();
	var after = +new Date();
	var time = after - before;
	console.log("Generating the continent took: " + time + " ms");

	//draw
	cont.draw();
	c = 16;
	offset_x = -8;
	offset_y = -8;
	context.strokeStyle = "#00FFFF";
	context.beginPath();
	context.moveTo(offset_x + points[0][0] * c, offset_y + points[0][1] * c);
	for (var i = 1; i < points.length; i++)
	{
		context.lineTo(offset_x + points[i][0] * c, offset_y + points[i][1] * c);
	}
	context.lineTo(offset_x + points[0][0] * c, offset_y + points[0][1] * c);
	context.stroke();


}

//$(document).ready(function () {
//	test();
//});
