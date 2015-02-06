//preload here

function preload(callback) {

	resQueue = new createjs.LoadQueue(); //global
	//DEV: parameter false for local deployment

	resQueue.installPlugin(createjs.Sound);

	resQueue.on("complete", function() {
		window.setTimeout(function() {
			callback();
		}, 200);
	}, this); 
	resQueue.on("error", function(e) {
		console.log("Error in loading resource:");
		console.log(e.item);
	}, this);

	resQueue.on("progress", function(event) {
		preloadProgress = event.progress;
	});

	resQueue.loadFile({id:"menu_bg", src:"assets/menu_background.png"});
	resQueue.loadFile({id:"logo", src:"assets/logo4.png"});
	resQueue.loadFile({id:"test", src:"assets/test.png"});
	resQueue.loadFile({id:"inspect", src:"assets/inspect.png"});
	resQueue.loadFile({id:"newconnection", src:"assets/newconnection.png"});
	resQueue.loadFile({id:"removeconnection", src:"assets/removeconnection.png"});
	resQueue.loadFile({id:"materials", src:"assets/materials.png"});
	resQueue.loadFile({id:"material1", src:"assets/material1.png"});
	resQueue.loadFile({id:"material2", src:"assets/material2.png"});
	resQueue.loadFile({id:"material3", src:"assets/material3.png"});

	resQueue.loadFile({id:"help1", src:"assets/help1.png"});
	resQueue.loadFile({id:"help2", src:"assets/help2.png"});
	resQueue.loadFile({id:"help3", src:"assets/help3.png"});
	resQueue.loadFile({id:"help4", src:"assets/help4.png"});
	resQueue.loadFile({id:"help5", src:"assets/help5.png"});

	//sounds
	//http://www.freesound.org/people/suonho/sounds/27568/
	resQueue.loadFile({id:"newcity", src:"assets/newcity_short.ogg"});
	//http://jwintermusic.com/archive/ep82-song-87/
	resQueue.loadFile({id:"song", src:"assets/song.ogg"});
	resQueue.loadFile({id:"applause", src:"assets/applause.ogg"});
	resQueue.loadFile({id:"removeconn", src:"assets/removeconnection.ogg"});
	resQueue.loadFile({id:"newconn", src:"assets/newconnection.ogg"});
	resQueue.loadFile({id:"removecity", src:"assets/removecity.ogg"});
}


function progressbar() {
	animFrame = window.requestAnimationFrame(progressbar);

	var temp = +new Date();
	var dt = temp - time;
	time = temp;

	var barwidth = 200;
	var barheight = 30;

	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);

	context.fillStyle = "#447744";
	context.fillRect(960/2 - barwidth/2 - 2, 540/2 - barheight/2 - 2, barwidth+4, barheight+4) //outline
	context.fillStyle = "#000000";
	context.fillRect(960/2 - barwidth/2, 540/2 - barheight/2, barwidth, barheight) //outline
	context.fillStyle = "#447744";
	context.fillRect(960/2 - barwidth/2, 540/2 - barheight/2, barwidth*preloadProgress, barheight); //the bar itself
	context.font = "18px arial";
	context.fillText("Loading " + parseInt(preloadProgress*100) + "%", 960/2 - barwidth/2, 540/2 - barheight/2 + 60)
}