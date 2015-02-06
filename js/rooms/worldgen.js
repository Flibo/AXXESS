function WorldGenRoom(name, id, data) {
	this.name = name;
	this.id = id;
	this.objects = [];
	this.quit = false;

	this.next_room = data.next_room;

	//use data parameter to pass along information from room to room

	this.progress = 0;
	this.done = false;

	this.world = new World(79, 44); //one smaller than 80, 45 to get the ellipse perfect

	this.continue_gen = true;

	this.gentime = +new Date();
}

WorldGenRoom.prototype.update = function(dt) {
	if (this.continue_gen) {
		this.continue_gen = this.world.generate();
		this.progress = this.world.getProgress();
	} else {
		this.progress = 1;
	}

	//changes room after a slight pause
	if (this.progress >= 1) {
		if (!this.done) {
			this.done = true;

			this.prerender();
			//console.log("Time taken to generate the world: " + (new Date() - this.gentime) + "ms");

			var _this = this;
			window.setTimeout(function() {
				_this.quit = true;
			}, 300);
		}
		
	}
}

WorldGenRoom.prototype.draw = function(dt) {
	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);


	context.font = "54px AR_DESTINE";
	context.fillStyle = "#55ff55";
	context.fillText("Generating the world: " + Math.round(this.progress*100) + "% done", 50, 100);
}

WorldGenRoom.prototype.event = function(type, event) {
	//remember to use relMouseCoords(event) to get canvas-relative mouse coordinates
}

WorldGenRoom.prototype.end = function() {
	if (this.next_room == "game") {
		roomQueue.push( new GameRoom("Game Room", this.id+1, {world: this.world, prerender: this.prerender_imgdata} )); 
	} else {
		roomQueue.push( new TestRoom("Test Room", this.id+1, {world: this.world, prerender: this.prerender_imgdata} )); 
	}
	
	//empty data {}, replace with generated world information (maybe a world object?)
}

//pre render the lines of continents
WorldGenRoom.prototype.prerender = function() {
	//ellipse variables
	var e_x = canvas.width/2;
	var e_y = canvas.height/2;
	var e_rx = canvas.width*1.32;
	var e_ry = canvas.height - 5;

	var temp_canvas = document.createElement('canvas');
	temp_canvas.width = canvas.width;
	temp_canvas.height = canvas.height;

	var temp_context = temp_canvas.getContext("2d");

	//draw ellipse background
	//drawEllipse(temp_context, e_x, e_y, e_rx, e_ry, "#00ff00", "fill");

	
	temp_context.fillStyle = "#000000";
	temp_context.fillRect(0,0,temp_canvas.width,temp_canvas.height);


	temp_context.line_width = 1;
	//draw globe lines
	for (var i = 1; i <= 10; i++) {
		drawEllipse(temp_context, e_x, e_y, e_rx - Math.pow(i,3), e_ry, "#003300", "stroke");
	}

	temp_context.strokeStyle = "#003300";

	//vertical
	temp_context.beginPath();
	temp_context.moveTo(canvas.width/2, 0);
	temp_context.lineTo(canvas.width/2, canvas.height);
	temp_context.stroke();

	//horizontals
	for (var i = 0; i < 10; i++) {
		temp_context.beginPath();
		temp_context.moveTo(0, i*(canvas.height/10));
		temp_context.lineTo(canvas.width, i*(canvas.height/10));
		temp_context.stroke();
	}	

	//mask canvas
	var mask_canvas = document.createElement('canvas');

	mask_canvas.width = canvas.width;
	mask_canvas.height = canvas.height;
	var mask_context = mask_canvas.getContext('2d');

	mask_context.fillStyle = "#000000";
	mask_context.fillRect(0, 0, canvas.width, canvas.height);
	mask_context.globalCompositeOperation = 'xor';

	drawEllipse(mask_context, e_x, e_y, e_rx, e_ry, "#000000", "fill");
	temp_context.drawImage(mask_canvas, 0, 0);


	//draw continents
	var s = this.world.tilesize;
	
	temp_context.strokeStyle = "#00ff00";
	temp_context.fillStyle = "#001100";

	for (var i = 0; i < this.world.continent_lines.length; i++) {
		var xoffset = s * this.world.continents[i].x;
		var yoffset = s * this.world.continents[i].y;

		var center = -8;

		temp_context.beginPath();
		temp_context.moveTo(center + xoffset + this.world.continent_lines[i][0][0] * s, center + yoffset + this.world.continent_lines[i][0][1] * s);
		for (var j = 1; j < this.world.continent_lines[i].length; j++) {
			temp_context.lineTo(center + xoffset + this.world.continent_lines[i][j][0] * s, center + yoffset + this.world.continent_lines[i][j][1] * s);
		}
		temp_context.lineTo(center + xoffset + this.world.continent_lines[i][0][0] * s, center + yoffset + this.world.continent_lines[i][0][1] * s);
		temp_context.stroke();
		temp_context.fill();
	}



	//draw ellipse
	drawEllipse(temp_context, e_x, e_y, e_rx, e_ry, "#008800", "stroke");

	this.prerender_imgdata = temp_context.getImageData(0, 0, canvas.width, canvas.height);
}


//code borrowed from http://www.williammalone.com/briefs/how-to-draw-ellipse-html5-canvas/
function drawEllipse(p_context, centerX, centerY, width, height, style, fill_or_stroke) {
	
	p_context.beginPath();
	
	p_context.moveTo(centerX, centerY - height/2); // A1
	
	p_context.bezierCurveTo(
		centerX + width/2, centerY - height/2, // C1
		centerX + width/2, centerY + height/2, // C2
		centerX, centerY + height/2); // A2

	p_context.bezierCurveTo(
		centerX - width/2, centerY + height/2, // C3
		centerX - width/2, centerY - height/2, // C4
		centerX, centerY - height/2); // A1
	
	p_context.strokeStyle = style;
	p_context.fillStyle = style;

	if (fill_or_stroke == "fill") {
		p_context.fill();
	} else if (fill_or_stroke == "stroke") {
		p_context.stroke();
	}

	p_context.closePath();	
}