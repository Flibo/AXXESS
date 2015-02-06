function Sprite(data) {

	//Restrictions:
	//	An unanimated image cannot be rotated. You have to define a 
	//  framelength and the whole image as a single frame sprite sheet

	//	The only required field is id, which is the same ID as given during
	//	resource preload in resources.js

	//	Sprite sheets must be single animation each, on a single row

	//	Examples:
	//	Sprite sheet
	/*
		var test_spr = new Sprite({
			  id: "test"
			, framesize: [64, 64]
			, framelength: 1000 //ms
			, x:300
			, y:400
			, centered: true
			, scale: 2
		});
	*/

	//	Static image
	/*
		this.logo_spr = new Sprite({
			  id: "logo"
			, scale: 0.5
			, x: canvas.width/2 
			, y: 50
			, centered: true
		});
	*/

	this.image = resQueue.getResult(data.id);
	this.width = this.image.width;
	this.height = this.image.height;
	this.framesize = (data.framesize) ? data.framesize : [this.width, this.height];
	this.frames = this.width / this.framesize[0];

	if (!data.framelength) {
		this.no_anim = true;
	} else {
		this.no_anim = false;
		this.framelength = data.framelength;
	}
	

	this.frame = 0;
	this.frametimer = 0;

	this.posX = data.x ? data.x : 0;
	this.posY = data.y ? data.y : 0;

	this.scale = (data.scale) ? data.scale : 1;

	this.centered = data.centered ? data.centered : false;

	this.rotation = data.rotation ? data.rotation : 0;
}

Sprite.prototype.update = function(dt) {
	if (this.no_anim) {
		return;
	}

	this.frametimer += dt;

	if (this.frametimer > this.framelength) {
		this.frame = (this.frame + 1) % this.frames;
		this.frametimer = 0;
	}
}

Sprite.prototype.draw = function() {
	var cX = this.posX;
	var cY = this.posY;

	if (this.centered) {
		cX -= this.scale*this.width/2;
		cY -= this.scale*this.height/2;
	}

	if (!this.no_anim) {
		context.save();
		context.translate(this.posX, this.posY);
		context.rotate(this.rotation*Math.PI/180);

		context.drawImage(
		  this.image
		, this.frame*this.framesize[0]
		, 0
		, this.framesize[0]
		, this.framesize[1]
		, this.centered ? -(this.scale*this.framesize[0]/2) : 0
		, this.centered ? -(this.scale*this.framesize[1]/2) : 0
		, this.framesize[0]*this.scale
		, this.framesize[1]*this.scale
		);

	context.restore();
	} else {
		context.drawImage(
		  this.image
		, 0
		, 0
		, this.width
		, this.height
		, cX
		, cY
		, this.width*this.scale
		, this.height*this.scale
		);
	}

}


Sprite.prototype.getBB = function() {
	return {
	  x: this.posX - this.centered ? this.scale*this.framesize[0]/2 : 0
	, y: this.posY - this.centered ? this.scale*this.framesize[1]/2 : 0
	, width: this.framesize[0]
	, height: this.framesize[1]
	};
}