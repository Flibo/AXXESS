function TextBox(x, y, w, h, maxlines, fontsize) {
	this.lines = [];
	this.maxlines = maxlines;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.fontsize = fontsize;
}

TextBox.prototype.update = function(dt) {

}

TextBox.prototype.draw = function(dt) { //old lines become transparent
	//background and box
	context.fillStyle = "#001100";
	context.strokeStyle = "#00ff00";
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(this.x, this.y);
	context.lineTo(this.x + this.w, this.y);
	context.lineTo(this.x + this.w, this.y + this.h);
	context.lineTo(this.x, this.y + this.h);
	context.closePath();
	context.stroke();
	context.fill();

	context.font = this.fontsize + "px Courier";

	for (var i = 0; i < this.lines.length; i++) {
		context.fillStyle = "rgba(0, 200, 0, "+ ((this.lines.length - i)/this.lines.length) +")";
		context.fillText(this.lines[i], this.x + 8, this.y + this.h - i*(this.fontsize) - 6);
	}
}

TextBox.prototype.addLine = function(line) {
	this.lines.unshift(line);
	if (this.lines.length > this.maxlines) {
		this.lines.pop();
	}
}