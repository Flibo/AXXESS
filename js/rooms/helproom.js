function HelpRoom(name, id, data) {
	this.name = name;
	this.id = id;
	this.quit = false;

	//use data parameter to pass along information from room to room

	this.EH = new EventHandler();

	var test_event = new GameEvent("test", 3000
		, function() {
			//console.log(this.params);
	},    function() {
		
	}, {string: "test string"}); //empty parameters

	this.EH.addEvent(test_event);

	this.state = 1;
	this.states = 6;

	this.next_color = "#00ff00";
	this.back_color = "#00ff00";

	this.help1 = new Sprite({
		  id: "help1"
		, scale: 0.5
		, x: canvas.width/2
		, y: 280
		, centered: true
	});


	this.help2 = new Sprite({
		  id: "help2"
		, scale: 0.7
		, x: canvas.width/2 - 190
		, y: 170
		, centered: true
	});


	this.help3 = new Sprite({
		  id: "help3"
		, scale: 1
		, x: canvas.width/2 - 100
		, y: 340
		, centered: true
	});

	this.help4 = new Sprite({
		  id: "help4"
		, scale: 1
		, x: canvas.width/2 - 250
		, y: 60
		, centered: true
	});

	this.help5 = new Sprite({
		  id: "help5"
		, scale: 1
		, x: canvas.width/2 + 350
		, y: 170
		, centered: true
	});

}

HelpRoom.prototype.update = function(dt) {

	this.EH.update(dt);

}

HelpRoom.prototype.draw = function(dt) {
	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);

	//next
	context.font = "38px AR_DESTINE";
	context.fillStyle = this.next_color;
	context.fillText("NEXT", 48, 96);
	context.fillStyle = this.back_color;
	context.fillText("BACK", 48, 496);
	context.fillStyle = "#00ff00";
	context.fillText(this.state + "/" + this.states, 48, 48);

	context.fillStyle = "#00ff00";

	var basex = 210;
	var basey = 80;

	context.font = "24px Courier";
	switch(this.state) {
		case 1:
			context.fillText("Welcome to AXXESS", basex, basey);
			context.fillText("This is the main game view:", basex, basey + 30);

			context.fillText("Tools", basex - 90, basey + 90);
			context.fillText("Events", basex - 90, basey + 330);
			context.fillText("Economy", basex + 520, basey + 330);

			this.help1.draw();
			break;
		case 2:
			context.fillText("You can access the tools in the top left corner.", basex, basey);
			context.fillText("General game events appear in the lower left corner.", basex, basey + 200);
			context.fillText("Economy overview is located in the lower right", basex, basey + 350);
			context.fillText("corner.", basex, basey + 375);
			this.help2.draw();
			this.help3.draw();
			break;
		case 3:
			context.fillText("Diamond shapes represent cities.", basex + 80, basey);
			context.fillText("They are filled depending on their prosperity.", basex, basey + 40);

			context.fillText("Cities generate income for you based on their", basex, basey + 120);
			context.fillText("size and prosperity.", basex, basey + 145);

			context.fillText("Use the Inspect tool over a city to learn", basex, basey + 200);
			context.fillText("more about the city.", basex, basey + 225);

			context.fillText("A city grows if its prosperity reaches 100%.", basex, basey + 280);
			context.fillText("They are destroyed if they become too small.", basex, basey + 305);

			context.fillText("New cities are generated periodically till", basex, basey + 360);
			context.fillText("the whole world has been filled.", basex, basey + 385);

			this.help4.draw();
			break;
		case 4:
			context.fillText("You can create connections between cities", basex, basey);
			context.fillText("with the New Connection tool.", basex, basey + 25);

			context.fillText("Click on a city and drag the mouse", basex, basey + 80);
			context.fillText("over to another city to see how much", basex, basey + 105);
			context.fillText("the new connection will cost.", basex, basey + 130);

			context.fillText("Release the button to build the connection.", basex, basey + 185);

			context.fillText("You can build as many connections as you like", basex, basey + 240);
			context.fillText("between any two cities, but each connection has", basex, basey + 265);
			context.fillText("an upkeep cost.", basex, basey + 290);

			context.fillText("You can change the building material of the", basex, basey + 345);
			context.fillText("new connection from the tools bar to increase", basex, basey + 370);
			context.fillText("its capacity.", basex, basey + 395);

			this.help5.draw();
			break;
		case 5:
			context.fillText("You'll see dots moving across connections", basex, basey);
			context.fillText("and waiting in cities.", basex, basey + 25);

			context.fillText("While passing through a city, the dots lower", basex, basey + 80);
			context.fillText("the city's prosperity slightly. However, when", basex, basey + 105);
			context.fillText("they reach their goal, that city receives a boost", basex, basey + 130);
			context.fillText("to its prosperity.", basex, basey + 155);

			context.fillText("The dots don't like waiting in cities either, so", basex, basey + 210);
			context.fillText("make sure to interconnect all of the cities somehow.", basex, basey + 235);

			context.fillText("The dots cause traffic over connections depending", basex, basey + 290);
			context.fillText("on the build material, changing the speed at which", basex, basey + 315);
			context.fillText("they move between the cities from fast to a snail's", basex, basey + 340);
			context.fillText("pace.", basex, basey + 365);
			break;
		case 6:
			context.fillText("Your goal is to reach 5000 credits without", basex, basey);
			context.fillText("having more than 3 cities withered from low", basex, basey + 25);
			context.fillText("prosperity.", basex, basey + 50);

			context.fillText("A sure way to lose is to ignore a new city", basex, basey + 105);
			context.fillText("and leave it outside the network.", basex, basey + 130);

			context.fillText("Connections within the same continent are much", basex, basey + 185);
			context.fillText("cheaper than intercontinental connections.", basex, basey + 210);

			context.fillText("Your overall score consists of average traffic", basex, basey + 265);
			context.fillText("over the network throughout the whole game, the", basex, basey + 290);
			context.fillText("possible time bonus and city growth, minus", basex, basey + 315);
			context.fillText("possible withered cities.", basex, basey + 340);
			break;
		case 7:
			break;
		case 8:
			break;
	}

	
}

HelpRoom.prototype.event = function(type, event) {
	//remember to use relMouseCoords(event) to get canvas-relative mouse coordinates
	if (type == "mousedown") {
		var pos = canvas.relMouseCoords(event);
		if (distance(pos, [80, 70]) < 60) {
			this.state++;
			if (this.state > this.states) {
				this.quit = true;
			}
		}

		if (distance(pos, [80, 470]) < 60) {
			this.state--;
			if (this.state < 1) {
				this.quit = true;
			}
		}

	} else if (type == "mousemove") {
		var pos = canvas.relMouseCoords(event);
		if (distance(pos, [80, 70]) < 60) {
			this.next_color = "#005500";
		} else {
			this.next_color = "#00ff00";
		}

		if (distance(pos, [80, 470]) < 60) {
			this.back_color = "#005500";
		} else {
			this.back_color = "#00ff00";
		}
	}
}

HelpRoom.prototype.end = function() {
	roomQueue.push( new MenuRoom("menu", this.id+1, {next_room: this.next_room} ));
}