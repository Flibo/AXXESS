// This dummy class is intended to be manually copied or overriden to get very specific functionality

function Animation() {

}

Animation.prototype.update = function(dt) {

}

Animation.prototype.draw = function(dt) {

}


//Handler object for animations

function AnimationHandler() {
	this.animations = [];
}

AnimationHandler.prototype.addAnimation = function(anim) {
	this.animations.push(anim);
}

AnimationHandler.prototype.update = function(dt) {
	for (var i = 0; i < this.animations.length; i++) {
		this.animations[i].update(dt);
		if (this.animations[i].finished) {
			this.animations.splice(i--, 1); //possibly dangerous
		}
	}
}

AnimationHandler.prototype.draw = function(dt) {
	for (var i = 0; i < this.animations.length; i++) {
		this.animations[i].draw(dt);
	}
}




function CityAnimation(x, y, callback_event) {
	this.xbase = x;
	this.ybase = y;
	this.cb_event = callback_event;

	this.size = 2000;
	this.finished = false;
	this.called_back = false;
}

CityAnimation.prototype.update = function(dt) {
	if (this.size > 16) {
		this.size -= 700*dt/1000; //pixels in second
	} else {
		this.size = 16;
		this.finished = true;
	}

	if (this.finished && !this.called_back) {
		this.called_back = true;
		this.cb_event.finished = true;
	}
}

CityAnimation.prototype.draw = function(dt) {
	context.strokeStyle = "#00ff00";

	context.beginPath();

	context.moveTo(this.xbase - this.size*0.75, this.ybase);
	context.lineTo(this.xbase, this.ybase - this.size);// /
	context.lineTo(this.xbase + this.size*0.75, this.ybase);//  \
	context.lineTo(this.xbase, this.ybase + this.size);//  /
	context.lineTo(this.xbase - this.size*0.75, this.ybase);// \
	context.stroke();
}




function CityBoostAnimation(x, y, callback_event) {
	this.xbase = x;
	this.ybase = y;
	this.cb_event = callback_event;

	this.radius = 0;
	this.finished = false;
	this.called_back = false;
}

CityBoostAnimation.prototype.update = function(dt) {
	if (this.radius < 2000) {
		this.radius += 200*dt/1000; //pixels in second
	} else {
		this.radius = 2000;
		this.finished = true;
	}

	if (this.finished && !this.called_back) {
		this.called_back = true;
		if (this.cb_event != null) {
			this.cb_event.finished = true;
		}
	}
}

CityBoostAnimation.prototype.draw = function(dt) {
	context.strokeStyle = "#00ff00";
	context.beginPath();
	context.arc(this.xbase, this.ybase, this.radius, 0, Math.PI*2, false);
	context.arc(this.xbase, this.ybase, this.radius*0.5, 0, Math.PI*2, true);
	//context.stroke();

	var gradient = context.createRadialGradient(this.xbase, this.ybase, this.radius*0.5, this.xbase, this.ybase, this.radius);
	gradient.addColorStop(0, "rgba(0, 127, 0, 0)");
	gradient.addColorStop(0.5, "rgba(0, 127, 0, 0.5)");
	//gradient.addColorStop(0.5, "rgba(0, 255, 0, 0.5)");
	gradient.addColorStop(1, "rgba(0, 127, 0, 0)");
	//gradient.addColorStop(1, "rgba(0, 0, 0, 0.5");

	context.fillStyle = gradient;
	context.fill();
}



function CityDestroyAnimation(x, y, callback_event) {
	this.xbase = x;
	this.ybase = y;
	this.cb_event = callback_event;

	this.radius = 0;
	this.finished = false;
	this.called_back = false;
}

CityDestroyAnimation.prototype.update = function(dt) {
	if (this.radius < 2000) {
		this.radius += 800*dt/1000; //pixels in second
	} else {
		this.radius = 2000;
		this.finished = true;
	}

	if (this.finished && !this.called_back) {
		this.called_back = true;
		if (this.cb_event != null) {
			this.cb_event.finished = true;
		}
	}
}

CityDestroyAnimation.prototype.draw = function(dt) {
	context.strokeStyle = "#00ff00";
	context.beginPath();
	context.arc(this.xbase, this.ybase, this.radius, 0, Math.PI*2, false);
	context.arc(this.xbase, this.ybase, this.radius*0.5, 0, Math.PI*2, true);
	//context.stroke();

	var gradient = context.createRadialGradient(this.xbase, this.ybase, this.radius*0.5, this.xbase, this.ybase, this.radius);
	gradient.addColorStop(0, "rgba(127, 0, 0, 0)");
	gradient.addColorStop(0.5, "rgba(127, 0, 0, 0.5)");
	//gradient.addColorStop(0.5, "rgba(0, 255, 0, 0.5)");
	gradient.addColorStop(1, "rgba(127, 0, 0, 0)");
	//gradient.addColorStop(1, "rgba(0, 0, 0, 0.5");

	context.fillStyle = gradient;
	context.fill();
}