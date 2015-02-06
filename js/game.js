//main loop(event pump, game rooms?), resource loading etc

$(document).ready(function () {
	//preload here, callback to init after done
	preloadProgress = 0;
	init();
	preload(function() {
		window.cancelAnimationFrame(animFrame);

		roomQueue.push(new MenuRoom("Menu Room", 0, {})); //id = 0, empty data {}
		//MUSIC
		createjs.Sound.play("song", {loop: -1});
		main();
	});
	
});

function init() {
	roomQueue = [];
	inputQueue = [];

	canvas = document.getElementById("gameCanvas"); //global
	context = canvas.getContext("2d");

	muted = false;

	time = +new Date();

	progressbar(); //from resources.js
}

function main() {
	window.requestAnimationFrame(main);

	var temp = +new Date();
	var dt = temp - time;
	time = temp;

	if (muted) {
		createjs.Sound.setVolume(0);
	} else {
		createjs.Sound.setVolume(1);
	}

	//pump input queue
	/*for (var i = 0; i < inputQueue.length; i++) {
		var ev = inputQueue.splice(i--, 1)[0];
		if (roomQueue.length > 0) {
			roomQueue[0].event(ev.type, ev);
		}
	}*/

	//pump the room queue
	if (roomQueue.length > 0) {
		if (roomQueue[0].quit) {
			roomQueue[0].end(); //ends a room
			roomQueue.shift(); //finally remove the room from the queue
		}
		if (roomQueue.length > 0) {
			roomQueue[0].update(dt);
			roomQueue[0].draw(dt);
		} else {
			console.log("Room stack is empty!");
		}
	}
}

// INPUT

//prevent defaults not really needed

$(document).mousedown(function (event) {
	//event.preventDefault();
	if (roomQueue.length > 0) {
		roomQueue[0].event("mousedown", event);
		//inputQueue.push(event);
	}
	return false; //disables text/DOM element hightlighting via double click
});

$(document).mouseup(function (event) {
	//event.preventDefault();
	if (roomQueue.length > 0) {
		roomQueue[0].event("mouseup", event);
		//inputQueue.push(event);
	}
});

$(document).keydown(function (event) {
	if (event.key == "m") {
		muted = !muted;
	}
	//event.preventDefault();
	if (roomQueue.length > 0) {
		roomQueue[0].event("keydown", event);
		//inputQueue.push(event);
	}
});

$(document).keyup(function (event) {
	//event.preventDefault();
	if (roomQueue.length > 0) {
		roomQueue[0].event("keyup", event);
		//inputQueue.push(event);
	}
});

$(document).mousemove(function (event) {
	//event.preventDefault();
	if (roomQueue.length > 0) {
		roomQueue[0].event("mousemove", event);
		//inputQueue.push(event);
	}
});

//code borrowed from http://stackoverflow.com/a/5932203
function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent); //intentional

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return [canvasX, canvasY];
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;