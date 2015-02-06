function ScoreRoom(name, id, data) {
	this.name = name;
	this.id = id;
	this.quit = false;

	//use data parameter to pass along information from room to room

	this.EH = new EventHandler();

	this.game = data.game;	



	this.game.avg_traffic = 0;

	for (var i = 0; i < this.game.traffic_data.length; i++) {
		this.game.avg_traffic += this.game.traffic_data[i];
	}
	this.game.avg_traffic = this.game.traffic_data.length != 0 ? this.game.avg_traffic / this.game.traffic_data.length: 0;

	this.growth_score = this.game.avg_citygrowth*this.game.avg_cityprosperity * 100;
	this.time_score = Math.max(60*10 - this.game.timer, 0);
	this.wither_score = Math.min(this.game.wither_max, this.game.withered_cities);
	this.traffic_score = (1-this.game.avg_traffic)*100;

	if (isNaN(this.growth_score)) {
		this.growth_score = 0;
	}

	this.score = 0;


	this.menu_color = "#00ff00";
	this.replay_color = "#00ff00";

}

ScoreRoom.prototype.update = function(dt) {

	this.EH.update(dt);

}

ScoreRoom.prototype.draw = function(dt) {
	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);

	context.fillStyle = "#00ff00";
	context.strokeStyle = "#00ff00";

	var basex = 100;
	var basey = 80;

	context.font = "40px AR_DESTINE";
	context.fillText(this.game.won ? "You won the excellent game of AXXESS" : "You lost the devious game of AXXESS", basex, basey);
	
	context.font = "28px Courier";
	
	this.score = 0;

	var pad_length = 28;

	//time formatting
	var time_text = "Time bonus:         5x " + parseInt(this.time_score);
	while (time_text.length < pad_length) {
		time_text += " ";
	}
	time_text += "=  " + 5*parseInt(this.time_score);
	this.score += 5*parseInt(this.time_score);

	//growth formatting
	var growth_text = "Growth score:      20x " + parseInt(this.growth_score) + "%";
	while (growth_text.length < pad_length) {
		growth_text += " ";
	}
	growth_text += "=  " + 20*parseInt(this.growth_score);
	this.score += 20*parseInt(this.growth_score);

	//traffic formatting
	var traffic_text = "Traffic score:     25x " + parseInt(this.traffic_score) + "%";
	while (traffic_text.length < pad_length) {
		traffic_text += " ";
	}
	traffic_text += "=  " + 25*parseInt(this.traffic_score);
	this.score += 25*parseInt(this.traffic_score);

	//wither formatting
	var wither_text = "Cities lost:    -1000x " + parseInt(this.wither_score);
	while (wither_text.length < pad_length) {
		wither_text += " ";
	}
	wither_text += "= " + (this.wither_score == 0 ? " " : "") + (-1000*parseInt(this.wither_score));
	this.score -= 1000*parseInt(this.wither_score);

	//score formatting
	var score_text = "Total score:";
	while (score_text.length < pad_length) {
		score_text += " ";
	}
	score_text += "= " + (this.score < 0 ? "" : " ") + this.score;


	context.fillText(time_text, basex + 100, basey + 90);
	context.fillText(growth_text, basex + 100, basey + 120);
	context.fillText(traffic_text, basex + 100, basey + 150);
	context.fillText(wither_text, basex + 100, basey + 180);

	context.fillText(score_text, basex + 100, basey + 240);


	context.fillStyle = this.menu_color;
	context.fillText("Back to Menu", 16, canvas.height - 50);
	context.fillStyle = this.replay_color;
	context.fillText("Play again", 750, canvas.height - 50);
}

ScoreRoom.prototype.event = function(type, event) {
	//remember to use relMouseCoords(event) to get canvas-relative mouse coordinates
	if (type == "mousedown") {
		var pos = canvas.relMouseCoords(event);
		if (distance(pos, [80, 470]) < 120) {
			this.next_room = "menu";
			this.quit = true;
		}

		if (distance(pos, [850, 470]) < 120) {
			this.next_room = "game";
			this.quit = true;
		}

	} else if (type == "mousemove") {
		var pos = canvas.relMouseCoords(event);
		if (distance(pos, [80, 470]) < 120) {
			this.menu_color = "#005500";
		} else {
			this.menu_color = "#00ff00";
		}

		if (distance(pos, [850, 470]) < 120) {
			this.replay_color = "#005500";
		} else {
			this.replay_color = "#00ff00";
		}
	}
}

ScoreRoom.prototype.end = function() {
	if (this.next_room == "menu") {
		roomQueue.push( new MenuRoom("menu", this.id+1, {next_room: this.next_room} )); //empty data {}
	} else if (this.next_room == "game") {
		roomQueue.push( new WorldGenRoom("World Generation", this.id+1, {next_room: this.next_room} ));
	}
	
}