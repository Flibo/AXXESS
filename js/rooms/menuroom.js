function MenuRoom(name, id, data) {
	this.name = name;
	this.id = id;
	this.quit = false;

	this.playbutton = {w: 200, h: 50, origcolor: "#33AA33", color: "#33AA33"};
	this.playbutton.x = canvas.width / 2 - this.playbutton.w / 2;
	this.playbutton.y = 150;

	this.helpbutton = {w: 200, h: 50, origcolor: "#33AA33", color: "#33AA33"};
	this.helpbutton.x = canvas.width / 2 - this.helpbutton.w / 2;
	this.helpbutton.y = 265;

	this.next_room = "game";

	//use data parameter to pass along information from room to room

	this.logo_spr = new Sprite({
		  id: "logo"
		, scale: 0.5
		, x: canvas.width/2 
		, y: 50
		, centered: true
	});

	this.menu_bg = new Sprite({
		  id: "menu_bg"
		, scale: 1
		, x: 0
		, y: 0
		, centered: false
	});

}

MenuRoom.prototype.update = function(dt) {
	this.logo_spr.update(dt);
}

MenuRoom.prototype.draw = function(dt) {
	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);

	this.menu_bg.draw();

	context.fillStyle = this.playbutton.color;
	context.fillRect(this.playbutton.x, this.playbutton.y, this.playbutton.w, this.playbutton.h);
	context.fillStyle = this.helpbutton.color;
	context.fillRect(this.helpbutton.x, this.helpbutton.y, this.helpbutton.w, this.helpbutton.h);

	context.font = "30px AR_DESTINE";
	context.textAlign = "center";
	context.fillStyle = "#000000";
	context.fillText("New Game", this.playbutton.x + this.playbutton.w / 2, this.playbutton.y + this.playbutton.h / 2 + 7);
	context.fillText("Help", this.helpbutton.x + this.helpbutton.w / 2, this.helpbutton.y + this.helpbutton.h / 2 + 7);
	context.textAlign = "left";

	//context.font = "15px courier";
	context.font = "15px courier";
	context.fillStyle = "#55ff55";
	context.fillText("A game by Henri Niva and Jesse Koivukoski (2014)", 10, canvas.height - 20);	
	context.fillText("Mute by pressing M", 10, 10);
	//context.fillText("Room name: " + this.name + ", id: " + this.id + " --- " + dt + "ms", 10, 520);

	this.logo_spr.draw();
}

MenuRoom.prototype.event = function(type, event) {
	//remember to use relMouseCoords(event) to get canvas-relative mouse coordinates
	if (type == "mousedown") {
		var pos = canvas.relMouseCoords(event);
		//new game
		if (pos[0] > this.playbutton.x && pos[0] < this.playbutton.x + this.playbutton.w
		  &&pos[1] > this.playbutton.y && pos[1] < this.playbutton.y + this.playbutton.h) {
		  	createjs.Sound.play("newcity");
			this.quit = true;
		}
		//help
		else if (pos[0] > this.helpbutton.x && pos[0] < this.helpbutton.x + this.helpbutton.w
		  	   &&pos[1] > this.helpbutton.y && pos[1] < this.helpbutton.y + this.helpbutton.h) {
			this.next_room = "help";
			this.quit = true;
		}
	} else if (type == "mousemove") {
		var pos = canvas.relMouseCoords(event);
		//new game
		if (pos[0] > this.playbutton.x && pos[0] < this.playbutton.x + this.playbutton.w
		  &&pos[1] > this.playbutton.y && pos[1] < this.playbutton.y + this.playbutton.h) {
		  	this.playbutton.color = "#005500";
		  	this.helpbutton.color = this.helpbutton.origcolor;
		}
		//help
		else if (pos[0] > this.helpbutton.x && pos[0] < this.helpbutton.x + this.helpbutton.w
		  	   &&pos[1] > this.helpbutton.y && pos[1] < this.helpbutton.y + this.helpbutton.h) {
			this.helpbutton.color = "#005500";
			this.playbutton.color = this.playbutton.origcolor;
		} else {
			this.helpbutton.color = this.helpbutton.origcolor;
			this.playbutton.color = this.playbutton.origcolor;
		}
	}
}

MenuRoom.prototype.end = function() {
	if (this.next_room == "game") {
		roomQueue.push( new WorldGenRoom("World Generation", this.id+1, {next_room: this.next_room} ));
	} else if (this.next_room == "help") {
		roomQueue.push( new HelpRoom("Help", this.id+1, {} ));
	}
	
}