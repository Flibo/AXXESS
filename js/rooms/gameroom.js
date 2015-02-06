function GameRoom(name, id, data) {
	this.name = name;
	this.id = id;
	this.objects = [];
	this.quit = false;

	//use data parameter to pass along information from room to room

	this.world = data.world;
	this.prerender = data.prerender;


	this.tools = ["Inspect", "New Connection", "Remove Connection"]; //last is DEV
	this.tool = 0;

	this.EH = new EventHandler();
	this.AH = new AnimationHandler();

	//HUD TEXTBOX
	this.eventbox = new TextBox(0, canvas.height - 90, 300, 90, 6, 14);

	this.eventbox.addLine("Game started!");

	// AUTOMATIC CITY GENERATION
	var citygen_event = new GameEvent("new city", 20000
	, function() {

	}, function() {
		var res = this.params.world.newCity();
		if (res != null) {
			var cityadd_event = new GameEvent("add city", -1
			, function() {

			}, function() {
				this.params.world.addCity(this.params.city)
				this.params.textbox.addLine("A new city has formed (" + this.params.city.name + ")");
				createjs.Sound.play("newcity");
			}, {world: this.params.world, city: res, textbox: this.params.textbox});

			if (!this.params.owner.lost && !this.params.owner.won) {
				this.params.AH.addAnimation(new CityAnimation(res.world_x, res.world_y, cityadd_event));
				this.params.EH.addEvent(cityadd_event);
				this.params.EH.addEvent(this.copy()); //fires a new event after this one is done
			}
		}
		
	}, {world: this.world, EH: this.EH, AH: this.AH, textbox: this.eventbox, owner: this});

	// "INSTANT" CITY GENERATION
	var citycreate_event = new GameEvent("create city", 0
		, function() {

		}, function() {
			var res = this.params.world.newCity();
			if (res != null) {
				var cityadd_event = new GameEvent("add city", -1
				, function() {

				}, function() {
					this.params.world.addCity(this.params.city);

				}, {world: this.params.world, city: res});

				this.params.AH.addAnimation(new CityAnimation(res.world_x, res.world_y, cityadd_event));
				this.params.EH.addEvent(cityadd_event);
			}
		}, {world: this.world, AH: this.AH, EH: this.EH});



	//add three starting cities
	this.EH.addEvent(citycreate_event.copy({limit: 100})); //override limit value
	this.EH.addEvent(citycreate_event.copy({limit: 200}));
	this.EH.addEvent(citycreate_event.copy({limit: 300}));
	//this.EH.addEvent(citycreate_event.copy({limit: 300}));
	//make the cities generate
	this.EH.addEvent(citygen_event);

	//GROWTH BOOSTS
	//picks a random city from a set of highest developed cities and sends lots of agents from there
	var cityboost_event = new GameEvent("city boost", 45000 //30000 maybe?
		, function() {

		}, function() {
			//sort all the cities by development
			//pick random from the highest ranking

			var cities = this.params.owner.world.cities.slice();
			var highest = 0;
			var highest_list = [];
			for (var i = 0; i < cities.length; i++) {
				if (cities[i].development > highest) {
					highest_list = [];
					highest_list.push(cities[i]);
					highest = cities[i].development;
				} else if (cities[i].development == highest) {
					highest_list.push(cities[i]);
				}
			}

			var rand_city = highest_list[Math.floor(Math.random()*highest_list.length)];

			if (!this.params.owner.lost && !this.params.owner.won) {

				rand_city.growth_boost(); //do it right when the animation begins
				this.params.owner.eventbox.addLine("Massive growth in " + rand_city.name);
			//register the animation, assign the above event as it's callback and register that too.
				this.params.owner.AH.addAnimation( new CityBoostAnimation(rand_city.world_x, rand_city.world_y, null)); //nothing happens after animation
				this.params.owner.EH.addEvent(this.copy());
			}
			

		}, {owner: this}); //quicker and cleaner than above examples
	this.EH.addEvent(cityboost_event);

	//FUNDS GENERATION
	var fundsgen_event = new GameEvent("funds", 1000
		,function() {}
		,function() {
			for (var i = 0; i < this.params.owner.world.cities.length; i++) {
				this.params.owner.generateFunds(this.params.owner.world.cities[i]);
			}

			this.params.owner.applyUpkeep();


			this.params.owner.EH.addEvent(this.copy());

		}, {owner: this});

	this.EH.addEvent(fundsgen_event);

	//WINNING CONDITION
	var wincond_event = new GameEvent("win", -1
		, function() {
			if (this.params.owner.funds > 5000) {
				this.params.owner.won = true;
			}
		}, function() {

		}, {owner: this} );

	this.EH.addEvent(wincond_event);

	//LOSING CONDITION - BANKRUPT
	var losecond_bankrupt_event = new GameEvent("lose - bankrupt", -1
		, function() {
			if (this.params.owner.funds <= -100) {
				this.params.owner.lost = true;
				this.params.owner.losstype = "bankrupt";
			}
		}, function() {

		}, {owner: this} );

	this.EH.addEvent(losecond_bankrupt_event);

	//LOSING CONDITION - TOO MANY CITIES GONE
	var losecond_wither_event = new GameEvent("lose - wither", -1
		, function() {
			if (this.params.owner.withered_cities > this.params.owner.wither_max) {
				this.params.owner.lost = true;
				this.params.owner.losstype = "wither";
			}
		}, function() {

		}, {owner: this});

	this.EH.addEvent(losecond_wither_event);

	//LOSING ANIMATION, DESTORY ALL CITIES
	this.loseanim_event = new GameEvent("lose anim", 300
		, function() {}
		, function() {
			var rand_city = this.params.owner.world.randomCity();

			if (typeof rand_city == "undefined") { //sick chance call!
				var ev = new GameEvent("wait", 1000
					, function() {}
					, function() {
						this.params.owner.played_end_anim = true;
					}, {owner: this.params.owner});
				this.params.owner.EH.addEvent(ev);
			} else {
				rand_city.alive = false;
				this.params.owner.EH.addEvent(this.copy());
			}
				


		}, {owner: this});

	//WINNING ANIMATION
	this.winanim_event = new GameEvent("win anim", 2500
		, function() {

		}, function() {
			this.params.owner.played_end_anim = true;

		}, {owner: this} );


	//GAME STATE VARIABLES
	this.won = false;
	this.lost = false;
	this.losstype = "";
	this.withered_cities = 0;
	this.wither_max = 3;
	this.play_win_anim = false;
	this.play_loss_anim = false;
	this.played_end_anim = false;

	this.bankruptcy_warning = false;
	this.bankruptcy_warning_was = false;

	this.traffic_data = [];
	this.traffic_fetch_timer = 0;
	this.traffic_fetch_limit = 5000; //ms

	this.timer = 0;

	//DRAGGING LINES
	this.clicked_spot = null;
	this.clicked_city = null;
	this.closest_city = null;
	this.current_cost = null;

	//CURRENT MOUSE POSITION
	this.mousepos = null;

	//CONNECTION DELETION
	this.radius = 10.0;
	this.selected_conns = [];

	//HUD + MATERIAL SELECTION
	this.tools_position = {x: 0, y: 0};
	this.icon_size = 48;
	this.icon_count = 4;
	this.material_count = 3;
	this.selected_material = 0;
	this.expand_materials_in_hud = false;

	this.funds = 2500;
	this.connections_in_use = [0, 0, 0];

	this.inspect_spr = new Sprite({
			  id: "inspect"
			, scale: 1.0
			, x: this.tools_position.x 
			, y: this.tools_position.y
			, centered: false
		});

	this.newconnection_spr = new Sprite({
			  id: "newconnection"
			, scale: 1.0
			, x: this.tools_position.x + this.icon_size
			, y: this.tools_position.y
			, centered: false
		});

	this.removeconnection_spr = new Sprite({
			  id: "removeconnection"
			, scale: 1.0
			, x: this.tools_position.x + this.icon_size * 2
			, y: this.tools_position.y
			, centered: false
		});

	this.materials_spr = new Sprite({
			  id: "materials"
			, scale: 1.0
			, x: this.tools_position.x + this.icon_size * 3
			, y: this.tools_position.y
			, centered: false
		});

	this.material1_spr = new Sprite({
			  id: "material1"
			, scale: 1.0
			, x: this.tools_position.x + this.icon_size * 3
			, y: this.tools_position.y + this.icon_size
			, centered: false
		});

	this.material2_spr = new Sprite({
			  id: "material2"
			, scale: 1.0
			, x: this.tools_position.x + this.icon_size * 3
			, y: this.tools_position.y + this.icon_size * 2
			, centered: false
		});

	this.material3_spr = new Sprite({
			  id: "material3"
			, scale: 1.0
			, x: this.tools_position.x + this.icon_size * 3
			, y: this.tools_position.y + this.icon_size * 3
			, centered: false
		});
}

/* sublime text minimap helper   made with http://patorjk.com/software/taag                                                                                         
                                                                                                                                 
UUUUUUUU     UUUUUUUUPPPPPPPPPPPPPPPPP   DDDDDDDDDDDDD                  AAA         TTTTTTTTTTTTTTTTTTTTTTTEEEEEEEEEEEEEEEEEEEEEE
U::::::U     U::::::UP::::::::::::::::P  D::::::::::::DDD              A:::A        T:::::::::::::::::::::TE::::::::::::::::::::E
U::::::U     U::::::UP::::::PPPPPP:::::P D:::::::::::::::DD           A:::::A       T:::::::::::::::::::::TE::::::::::::::::::::E
UU:::::U     U:::::UUPP:::::P     P:::::PDDD:::::DDDDD:::::D         A:::::::A      T:::::TT:::::::TT:::::TEE::::::EEEEEEEEE::::E
 U:::::U     U:::::U   P::::P     P:::::P  D:::::D    D:::::D       A:::::::::A     TTTTTT  T:::::T  TTTTTT  E:::::E       EEEEEE
 U:::::D     D:::::U   P::::P     P:::::P  D:::::D     D:::::D     A:::::A:::::A            T:::::T          E:::::E             
 U:::::D     D:::::U   P::::PPPPPP:::::P   D:::::D     D:::::D    A:::::A A:::::A           T:::::T          E::::::EEEEEEEEEE   
 U:::::D     D:::::U   P:::::::::::::PP    D:::::D     D:::::D   A:::::A   A:::::A          T:::::T          E:::::::::::::::E   
 U:::::D     D:::::U   P::::PPPPPPPPP      D:::::D     D:::::D  A:::::A     A:::::A         T:::::T          E:::::::::::::::E   
 U:::::D     D:::::U   P::::P              D:::::D     D:::::D A:::::AAAAAAAAA:::::A        T:::::T          E::::::EEEEEEEEEE   
 U:::::D     D:::::U   P::::P              D:::::D     D:::::DA:::::::::::::::::::::A       T:::::T          E:::::E             
 U::::::U   U::::::U   P::::P              D:::::D    D:::::DA:::::AAAAAAAAAAAAA:::::A      T:::::T          E:::::E       EEEEEE
 U:::::::UUU:::::::U PP::::::PP          DDD:::::DDDDD:::::DA:::::A             A:::::A   TT:::::::TT      EE::::::EEEEEEEE:::::E
  UU:::::::::::::UU  P::::::::P          D:::::::::::::::DDA:::::A               A:::::A  T:::::::::T      E::::::::::::::::::::E
    UU:::::::::UU    P::::::::P          D::::::::::::DDD A:::::A                 A:::::A T:::::::::T      E::::::::::::::::::::E
      UUUUUUUUU      PPPPPPPPPP          DDDDDDDDDDDDD   AAAAAAA                   AAAAAAATTTTTTTTTTT      EEEEEEEEEEEEEEEEEEEEEE
                                                                                                                                 
*/

GameRoom.prototype.update = function(dt) {
	this.EH.update(dt);
	this.AH.update(dt);

	if (!this.won && !this.lost) {
		this.timer += dt/1000;
	}
	
	//win/loss conditions
	if (this.won) {
		if (!this.play_win_anim) {
			this.eventbox.addLine("Game won!");
			createjs.Sound.play("applause");
			this.EH.addEvent(this.winanim_event);

			this.calcCityScores();

		}
		this.play_win_anim = true;
	} else if (this.lost) {
		if (!this.play_loss_anim) {
			this.eventbox.addLine("Game lost!");
			this.EH.addEvent(this.loseanim_event);

			this.calcCityScores();
		}
		this.play_loss_anim = true;
	}

	if (this.played_end_anim) {
		this.quit = true; //finally end the room
	}

	var fetch = false;

	//traffic data
	this.traffic_fetch_timer += dt;
	if (this.traffic_fetch_timer > this.traffic_fetch_limit) {
		this.traffic_fetch_timer = 0;
		fetch = true;
	}

	if (this.funds < 0 && !this.bankruptcy_warning_was) {
		this.bankruptcy_warning = true;
	} else if (this.funds >= 0) {
		this.bankruptcy_warning = false;
		this.bankruptcy_warning_was = false;
	}

	if (this.bankruptcy_warning) {
		this.bankruptcy_warning_was = true;
		this.bankruptcy_warning = false;
		this.eventbox.addLine("Warning! Bankruptcy at $-100!");
	}


	this.connections_in_use = [0, 0, 0];

	//update cities
	for (var i = 0; i < this.world.cities.length; i++) {
		var current_city = this.world.cities[i];
		var conns = current_city.connections;

		current_city.update(dt);

		//update connections
		for (var c in conns) {
			for (var k = 0; k < conns[c].length; k++) {
				conns[c][k].update(dt);

				if (fetch) {
					this.traffic_data.push(conns[c][k].getTraffic());
				}

				this.connections_in_use[conns[c][k].material]++;
			}
		}
	}

	//remove destroyed (too stagnant) cities
	for (var i = 0; i < this.world.cities.length; i++) {
		var city = this.world.cities[i];
		if (!city.alive) {
			this.withered_cities++;
			this.funds += city.destroy();
			createjs.Sound.play("removecity", {volume: 0.4});

			this.AH.addAnimation( new CityDestroyAnimation(city.world_x, city.world_y, null) ); //no callback needed
			if (this.withered_cities <= this.wither_max) {
				this.eventbox.addLine(city.name + " has withered (" + (this.wither_max - this.withered_cities) + " left)");
			}
			

			this.world.removeCity(this.world.cities[i]);
			i--;
		}
	}
	
	//new connection snap
	if (this.clicked_city != null) {
		var closest = this.world.getClosestCity(this.mousepos);
		if (distance(this.mousepos, [closest.world_x, closest.world_y]) < 80 && closest != this.clicked_city) {
			this.closest_city = closest;
		} else {
			this.closest_city = null;
		}
	}

}

/*  sublime text minimap helper                                                                                               
                                                                                                                      
EEEEEEEEEEEEEEEEEEEEEEVVVVVVVV           VVVVVVVVEEEEEEEEEEEEEEEEEEEEEENNNNNNNN        NNNNNNNNTTTTTTTTTTTTTTTTTTTTTTT
E::::::::::::::::::::EV::::::V           V::::::VE::::::::::::::::::::EN:::::::N       N::::::NT:::::::::::::::::::::T
E::::::::::::::::::::EV::::::V           V::::::VE::::::::::::::::::::EN::::::::N      N::::::NT:::::::::::::::::::::T
EE::::::EEEEEEEEE::::EV::::::V           V::::::VEE::::::EEEEEEEEE::::EN:::::::::N     N::::::NT:::::TT:::::::TT:::::T
  E:::::E       EEEEEE V:::::V           V:::::V   E:::::E       EEEEEEN::::::::::N    N::::::NTTTTTT  T:::::T  TTTTTT
  E:::::E               V:::::V         V:::::V    E:::::E             N:::::::::::N   N::::::N        T:::::T        
  E::::::EEEEEEEEEE      V:::::V       V:::::V     E::::::EEEEEEEEEE   N:::::::N::::N  N::::::N        T:::::T        
  E:::::::::::::::E       V:::::V     V:::::V      E:::::::::::::::E   N::::::N N::::N N::::::N        T:::::T        
  E:::::::::::::::E        V:::::V   V:::::V       E:::::::::::::::E   N::::::N  N::::N:::::::N        T:::::T        
  E::::::EEEEEEEEEE         V:::::V V:::::V        E::::::EEEEEEEEEE   N::::::N   N:::::::::::N        T:::::T        
  E:::::E                    V:::::V:::::V         E:::::E             N::::::N    N::::::::::N        T:::::T        
  E:::::E       EEEEEE        V:::::::::V          E:::::E       EEEEEEN::::::N     N:::::::::N        T:::::T        
EE::::::EEEEEEEE:::::E         V:::::::V         EE::::::EEEEEEEE:::::EN::::::N      N::::::::N      TT:::::::TT      
E::::::::::::::::::::E          V:::::V          E::::::::::::::::::::EN::::::N       N:::::::N      T:::::::::T      
E::::::::::::::::::::E           V:::V           E::::::::::::::::::::EN::::::N        N::::::N      T:::::::::T      
EEEEEEEEEEEEEEEEEEEEEE            VVV            EEEEEEEEEEEEEEEEEEEEEENNNNNNNN         NNNNNNN      TTTTTTTTTTT      
      
*/

GameRoom.prototype.event = function(type, event) {
	//remember to use relMouseCoords(event) to get canvas-relative mouse coordinates
	if (this.lost || this.won) {
		return; //let the animations play in peace
	}
	if (type == "mousedown") {
		if (event.which == 1) {
			if (this.tool == 1) {
				this.clicked_spot = canvas.relMouseCoords(event);
				this.clicked_city = this.world.getClosestCity(this.clicked_spot);
				if (this.clicked_city != null && distance(this.clicked_spot, [this.clicked_city.world_x, this.clicked_city.world_y]) > 32) {
					this.clicked_city = null;
					this.clicked_spot = null;
					this.current_cost = null;
				}
			}/* else if (this.tool == 0) { //test city destroying
				var spot = canvas.relMouseCoords(event);
				var city = this.world.getClosestCity(spot);
				city.alive = false;
			} */
		} 
	} else if (type == "mouseup") {
		if (event.which == 1) {
			if (this.tool == 1) { //make connection
				if (this.clicked_spot != null && this.clicked_city != null && this.closest_city != null) {
					if (this.buyConnection(this.current_cost)) {
						this.world.makeConnection(this.clicked_city, this.closest_city, this.selected_material);
						createjs.Sound.play("newconn", {volume: 0.7});
					}
					
				}
				this.clicked_spot = null;
				this.clicked_city = null;
				this.closest_city = null;
				this.current_cost = null;
			} else if (this.tool == 2) {//remove connection
				for (var i = 0; i < this.selected_conns.length; i++) {

					var conn = this.selected_conns[i];
					var amount = conn.source.getCostTo(conn.dest, this.getMaterialCost(conn.material)) * 0.5;

					this.eventbox.addLine("Disconnecting refunded $" +Math.floor(amount));
					createjs.Sound.play("removeconn", {volume: 0.6});
					this.funds += amount;

					this.selected_conns[i].destroy();
					this.selected_conns[i] = null;
				}
			}
			//tool hud interaction
			if (this.mousepos[0] > this.tools_position.x 
			 && this.mousepos[0] < this.tools_position.x + this.icon_size * this.icon_count
			 && this.mousepos[1] > this.tools_position.y
			 && this.mousepos[1] < this.tools_position.y + this.icon_size) {
				//materials expansion
				if (this.mousepos[0] > this.tools_position.x + this.icon_size * (this.icon_count - 1)) {
					if (this.expand_materials_in_hud) {
						this.expand_materials_in_hud = false;
					}
					else {
						this.expand_materials_in_hud = true;
					}
				}
				//remove connection
				else if (this.mousepos[0] > this.tools_position.x + this.icon_size * (this.icon_count - 2)) {
					this.tool = 2;
				}
				//new connection
				else if (this.mousepos[0] > this.tools_position.x + this.icon_size * (this.icon_count - 3)) {
					this.tool = 1;
				}
				//inspect tool
				else {
					this.tool = 0;
				}

			}
			//material selection
			if (this.expand_materials_in_hud
			 && this.mousepos[0] > this.tools_position.x + this.icon_size * (this.icon_count - 1)
			 && this.mousepos[0] < this.tools_position.x + this.icon_size * this.icon_count
			 && this.mousepos[1] > this.tools_position.y + this.icon_size
			 && this.mousepos[1] < this.tools_position.y + this.icon_size * (this.material_count + 1)) {
			 	//Pt
				if (this.mousepos[1] > this.tools_position.y + this.icon_size * this.material_count) {
					this.selected_material = 2;
				}
				//Cu
				else if (this.mousepos[1] > this.tools_position.y + this.icon_size * (this.material_count - 1)) {
					this.selected_material = 1;
				}
				//Fe
				else {
					this.selected_material = 0;
				}
				this.expand_materials_in_hud = false;
				this.tool = 1; 
			}
		}
	} else if (type == "keydown") {
		if (event.which == 32) {
			//space
			//this.quit = true;
		} else {
			if (event.which >= 49 && event.which <= 51) { //number keys for tools
				this.tool = event.which - 48 - 1; //normalized 
				if (this.tool >= this.tools.length) {
					this.tool = this.tools.length;
				}
			}
		}
	} else if (type == "mousemove") {
		this.mousepos = canvas.relMouseCoords(event);
	}
}

GameRoom.prototype.end = function() {
	roomQueue.push( new ScoreRoom("Score Screen", this.id+1, {game: this} )); //pass the whole thang
}


/* sublime text minimap helper
DDDDDDDDDDDDD      RRRRRRRRRRRRRRRRR                  AAA   WWWWWWWW                           WWWWWWWW
D::::::::::::DDD   R::::::::::::::::R                A:::A  W::::::W                           W::::::W
D:::::::::::::::DD R::::::RRRRRR:::::R              A:::::A W::::::W                           W::::::W
DDD:::::DDDDD:::::DRR:::::R     R:::::R            A:::::::AW::::::W                           W::::::W
  D:::::D    D:::::D R::::R     R:::::R           A:::::::::AW:::::W           WWWWW           W:::::W 
  D:::::D     D:::::DR::::R     R:::::R          A:::::A:::::AW:::::W         W:::::W         W:::::W  
  D:::::D     D:::::DR::::RRRRRR:::::R          A:::::A A:::::AW:::::W       W:::::::W       W:::::W   
  D:::::D     D:::::DR:::::::::::::RR          A:::::A   A:::::AW:::::W     W:::::::::W     W:::::W    
  D:::::D     D:::::DR::::RRRRRR:::::R        A:::::A     A:::::AW:::::W   W:::::W:::::W   W:::::W     
  D:::::D     D:::::DR::::R     R:::::R      A:::::AAAAAAAAA:::::AW:::::W W:::::W W:::::W W:::::W      
  D:::::D     D:::::DR::::R     R:::::R     A:::::::::::::::::::::AW:::::W:::::W   W:::::W:::::W       
  D:::::D    D:::::D R::::R     R:::::R    A:::::AAAAAAAAAAAAA:::::AW:::::::::W     W:::::::::W        
DDD:::::DDDDD:::::DRR:::::R     R:::::R   A:::::A             A:::::AW:::::::W       W:::::::W         
D:::::::::::::::DD R::::::R     R:::::R  A:::::A               A:::::AW:::::W         W:::::W          
D::::::::::::DDD   R::::::R     R:::::R A:::::A                 A:::::AW:::W           W:::W           
DDDDDDDDDDDDD      RRRRRRRR     RRRRRRRAAAAAAA                   AAAAAAAWWW             WWW     
*/

GameRoom.prototype.draw = function(dt) {
	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);

	//draw continents and ellipse
	context.putImageData(this.prerender, 0, 0);

	var s = this.world.tilesize;

	this.drawConnections();

	//draw cities
	context.strokeStyle = "#00ff00";
	for (var i = 0; i < this.world.cities.length; i++) { //each city
		this.world.cities[i].draw(); 
	}

	//animations
	this.AH.draw(dt);

	//HUD
	this.drawHUD(dt);

	//draw tooltip(s)
	if (this.tool == 0) { //inspect tool
		for (var i = 0; i < this.world.cities.length; i++) { //each city
		//null check for mouse pos
			if (this.mousepos != null && distance([this.world.cities[i].world_x, this.world.cities[i].world_y], this.mousepos) < 32) {
				this.world.cities[i].drawTooltip(dt);
				break;
			}
		}
	}

	//new connection tooltip while dragging
	if (this.tool == 1 && this.clicked_spot != null && this.clicked_city != null) {
		this.drawConnectionTooltip();
	}

	//debug 
	//context.font = "15px courier";
	context.font = "15px courier";
	context.fillStyle = "#55ff55";
	//context.fillText("Room name: " + this.name + ", id: " + this.id + " --- " + dt + "ms", 10, 510);
	//context.fillText("Tool" + (this.tool+1) + ": " + this.tools[this.tool], 10, 530);
	context.fillText("FPS: " + Math.floor(1/dt*1000), canvas.width-120, 30);
}

GameRoom.prototype.drawHUD = function(dt) {
	//context.drawImage(this.hudimg, 0, 0);

	var y = 190

	context.fillStyle = "#001100";
	context.strokeStyle = "#00ff00";
	context.lineWidth = 1;

	//general purpose hud
	context.beginPath();
	context.moveTo(canvas.width, canvas.height - y);
	context.lineTo(canvas.width - 130, canvas.height - y + 60);
	context.lineTo(canvas.width - 190, canvas.height);
	context.stroke();
	context.lineTo(canvas.width, canvas.height);
	context.closePath();
	context.fill();

	//current cash
	context.font = "10px Courier";
	context.fillStyle = "#00ff00";
	context.fillText("Credits", canvas.width - 60, canvas.height - 148);
	context.font = "24px Courier";
	context.fillText("$" + Math.floor(this.funds), canvas.width - 90, canvas.height - 124);

	//material use and upkeep
	context.font = "12px Courier";
	context.fillText("Iron wires: " + this.connections_in_use[0]/2, canvas.width - 130, canvas.height - 100);
	//context.fillText("Upkeep: $" + this.getMaterialUpkeep(0)*this.connections_in_use[0]/2, canvas.width - 124, canvas.height - 86);
	context.fillText("Copper wires: " + this.connections_in_use[1]/2, canvas.width - 136, canvas.height - 86);
	//context.fillText("Upkeep: $" + this.getMaterialUpkeep(1)*this.connections_in_use[1]/2, canvas.width - 136, canvas.height - 58);
	context.fillText("Platinum wires: " + this.connections_in_use[2]/2, canvas.width - 142, canvas.height - 72);
	//context.fillText("Upkeep: $" + this.getMaterialUpkeep(2)*this.connections_in_use[2]/2, canvas.width - 148, canvas.height - 30);

	var upkeep = this.getMaterialUpkeep(0)*this.connections_in_use[0]/2;
	upkeep += this.getMaterialUpkeep(1)*this.connections_in_use[1]/2;
	upkeep += this.getMaterialUpkeep(2)*this.connections_in_use[2]/2;

	context.fillText("Total upkeep: $" + upkeep, canvas.width - 148, canvas.height - 58);

	//tools
	context.fillStyle = "#002200";
	context.fillRect(this.tools_position.x
			   , this.tools_position.y
			   , this.icon_size * this.icon_count
			   , this.icon_size);

	//focus on currently selected tool
	var focus_color = "#664400";
	context.fillStyle = focus_color;
	context.fillRect(this.tools_position.x + this.tool * this.icon_size
	   			   , this.tools_position.y
	  			   , this.icon_size
	  			   , this.icon_size);

	//draw tool graphics
	this.inspect_spr.draw();
	this.newconnection_spr.draw();
	this.removeconnection_spr.draw();
	this.materials_spr.draw();

	//material and tool text
	context.font = "12px Courier";
	context.fillStyle = "#00ff00";

	context.fillText("Tool: " + this.tools[this.tool], 6, 64);
	context.fillText("Material: " + this.getMaterialName(), 6, 78);

	//material selection
	if (this.expand_materials_in_hud) {
		context.fillStyle = "#003300";
		context.fillRect(this.tools_position.x + this.icon_size * (this.icon_count - 1)
					   , this.tools_position.y + this.icon_size
					   , this.icon_size
					   , this.icon_size * this.material_count);

		//focus on the currently selected material
		context.fillStyle = focus_color;
		context.fillRect(this.tools_position.x + this.icon_size * (this.icon_count - 1)
		   			   , this.tools_position.y + this.icon_size * (this.selected_material + 1)
		  			   , this.icon_size
		  			   , this.icon_size);

		this.material1_spr.draw();
		this.material2_spr.draw();
		this.material3_spr.draw();
	} else { //draw an indication arrow
		var basex = this.tools_position.x + this.icon_size * (this.icon_count - 1)
		context.beginPath();
		context.moveTo(basex + 6, this.tools_position.y + this.icon_size + 4);
		context.lineTo(basex - 6 + this.icon_size, this.tools_position.y + this.icon_size + 4);
		context.lineTo(basex + this.icon_size/2, this.tools_position.y + this.icon_size + 4 + this.icon_size/3);
		context.closePath();
		context.stroke();
	}

	//event textbox
	this.eventbox.draw(dt);

	//timer
	context.font = "40px AR_DESTINE";
	context.fillStyle = "#00ff00";
	var mins = parseInt( this.timer / 60 ) % 60;
	var secs = parseInt( this.timer % 60 );
	mins = mins<10 ? "0" + mins : mins;
	secs = secs<10 ? "0" + secs : secs;
	context.fillText(mins + ":" + secs, canvas.width - 135, canvas.height - 10);


}

GameRoom.prototype.drawConnectionTooltip = function() {

	if (this.closest_city != null) {
		var dist = distance([this.clicked_city.world_x, this.clicked_city.world_y], [this.closest_city.world_x, this.closest_city.world_y]);
		var matcost = this.getMaterialCost(this.selected_material);
		var intercont = this.clicked_city.continent != this.closest_city.continent;

		var cost = this.clicked_city.getCostTo(this.closest_city, matcost);
		this.current_cost = cost;

		var basex = this.closest_city.world_x;
		var basey = this.closest_city.world_y;
		var w = 130;
		var h = 62;

		if (basex + w > canvas.width) {
			basex -= w;
		}
		if (basey + h > canvas.height) {
			basey -= h;
		}

		//the connecting line
		context.beginPath();
		context.moveTo(this.clicked_city.world_x, this.clicked_city.world_y);
		context.lineTo(this.closest_city.world_x, this.closest_city.world_y);
		context.strokeStyle = "#ffffff";
		context.lineWidth = this.selected_material*2 + 1;
		context.stroke();

		//the tooltip
		context.fillStyle = "#001100";
		context.strokeStyle = "#00ff00";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(basex, basey);
		context.lineTo(basex + w, basey);
		context.lineTo(basex + w, basey + h);
		context.lineTo(basex, basey + h);
		context.closePath();
		context.fill();
		context.stroke();

		context.fillStyle = "#00ff00";
		context.font = "12px Courier";
		context.fillText("Distance: " + Math.floor(dist) + "km", basex+3, basey+14);
		context.fillText("Mat. cost: $" + matcost + "/km", basex+3, basey+28)

		if (intercont) {
			context.fillText("Intercontinental", basex+3, basey+42);
		} else {
			context.fillText("Local Connection", basex+3, basey+42);
		}
		if (cost > this.funds) {
			context.fillStyle = "#ff4400";
		}
		context.fillText("Cost: $" + Math.floor(cost), basex+3, basey+56);


	} else {
		//the free connecting line
		context.beginPath();
		context.moveTo(this.clicked_city.world_x, this.clicked_city.world_y);
		context.lineTo(this.mousepos[0], this.mousepos[1]);
		context.strokeStyle = "#ffffff";
		context.lineWidth = this.selected_material*2 + 1;
		context.stroke();
	}





}

GameRoom.prototype.drawConnections = function() {
	var done_connections = {};
	this.selected_conns = [];

	for (var i = 0; i < this.world.cities.length; i++) { //each city
		var current_city = this.world.cities[i];
		done_connections[current_city.id] = true;
		var conns = current_city.connections;

		for (var c in conns) { //each other city this city is connected to
			var conn = conns[c];
			//if we have already drawn the lines between these two cities, skip
			if (done_connections.hasOwnProperty(conn[0].dest.id)) {
				continue;
			}
			var width = 15;

			var city1 = [conn[0].source.world_x, conn[0].source.world_y];
			var city2 = [conn[0].dest.world_x, conn[0].dest.world_y];

			var o_city = this.world.getCityById(c);

			if (o_city == null) {
				conn[0].destroy();
				continue;
			}

			var o_conn = o_city.connections[current_city.id]; //opposite city's connections

			//odd number of connections makes the first to draw in the center
			var start = 0;
			//straight line
			if (conn.length % 2 == 1) {
				start = 1;
				width += 10;

				context.beginPath();
				context.moveTo(city1[0], city1[1]);
				context.lineTo(city2[0], city2[1]);

				var center_x = (city2[0] + city1[0]) / 2;
				var center_y = (city2[1] + city1[1]) / 2;

				//highlight connection if mouse is near the center & tool selected
				if (this.tool == 2 && Math.pow(Math.pow(this.mousepos[0] - center_x, 2) + Math.pow(this.mousepos[1] - center_y, 2), 0.5)
					< this.radius) {
					context.strokeStyle = "#FFFFFF";
					this.selected_conns.push(conn[0]);
				}
				else {
					context.strokeStyle = conn[0].getStyle();
				}

				//width varies from material
				context.lineWidth = (conn[0].material * 2) + 1;
				context.stroke();
				context.lineWidth = 1;

				//visualize the center
				if (this.tool == 2) {
					context.fillStyle = "#ff0000";
					context.beginPath();
					context.arc(center_x, center_y, 3, 0, Math.PI*2);
					context.fill();
				}

				//draw agents
				var dp1 = [city2[0] - city1[0], city2[1] - city1[1]];
				for (var a = 0; a < conn[0].agents.length; a++) {
					var x = city1[0] + dp1[0] * conn[0].agents[a].distance;
					var y = city1[1] + dp1[1] * conn[0].agents[a].distance;
					conn[0].agents[a].draw(x, y);
				}

				//opposite direction as well
				var dp2 = [-dp1[0], -dp1[1]];
				for (var a = 0; a < o_conn[0].agents.length; a++) {
					var x = city2[0] + dp2[0] * o_conn[0].agents[a].distance;
					var y = city2[1] + dp2[1] * o_conn[0].agents[a].distance;
					o_conn[0].agents[a].draw(x, y);
				}
			}

			var midpoint = [(city1[0] + city2[0]) / 2, (city1[1] + city2[1]) / 2];
			var normal = [-(city2[1] - city1[1]), city2[0] - city1[0]];
			var l_n = Math.pow(Math.pow(normal[0], 2) + Math.pow(normal[1], 2), 0.5);
			var normal2 = [-normal[0], -normal[1]];

			var cp;
			//this loop handles bezier curves
			for (var k = start; k < conn.length; k += 2) { //each connection between these two cities
				//bezier point for quadratic bezier
				var bp = [midpoint[0] + normal[0] * width / l_n, midpoint[1] + normal[1] * width / l_n];

				context.beginPath();
				context.moveTo(city1[0], city1[1]);
				context.quadraticCurveTo(bp[0], bp[1], city2[0], city2[1]);
				context.strokeStyle = conn[k].getStyle();

				//highlight connection if mouse is near the center of it & tool selected
				if (this.tool == 2) {
					var point = jsBezier.pointOnCurve([{x: city1[0], y: city1[1]}
								   				 	  ,{x: bp[0], y: bp[1]}
								  	    		 	  ,{x: city2[0], y: city2[1]}]
								  	    		 	  ,0.5);

					var dist = Math.pow(Math.pow(this.mousepos[0] - point.x , 2)
									  + Math.pow(this.mousepos[1] - point.y , 2), 0.5);
					if (dist < this.radius) {
						context.strokeStyle = "#FFFFFF";
						this.selected_conns.push(conn[k]);
					}
				}

				context.lineWidth = (conn[k].material * 2) + 1;
				context.stroke();
				context.lineWidth = 1;

				if (this.tool == 2) {
					context.fillStyle = "#ff0000";
					context.beginPath();
					context.arc(point.x, point.y, 3, 0, Math.PI*2);
					context.fill();
				}

				var bp2 = [midpoint[0] + normal2[0] * width / l_n, midpoint[1] + normal2[1] * width / l_n];

				context.beginPath();
				context.moveTo(city1[0], city1[1]);
				context.quadraticCurveTo(bp2[0], bp2[1], city2[0], city2[1]);
				context.strokeStyle = conn[k + 1].getStyle();

				//highlight connection if mouse is near the center of it
				if (this.tool == 2) {
					point = jsBezier.pointOnCurve([{x: city1[0], y: city1[1]}
								   				  ,{x: bp2[0], y: bp2[1]}
								  	    		  ,{x: city2[0], y: city2[1]}]
								  	    		  ,0.5);

					var dist = Math.pow(Math.pow(this.mousepos[0] - point.x , 2)
									  + Math.pow(this.mousepos[1] - point.y , 2), 0.5);
					if (dist < this.radius) {
						context.strokeStyle = "#FFFFFF";
						this.selected_conns.push(conn[k + 1]);
					}
				}

				context.lineWidth = (conn[k + 1].material * 2) + 1;
				context.stroke();
				context.lineWidth = 1;

				//visualize the center
				if (this.tool == 2) {
					context.fillStyle = "#ff0000";
					context.beginPath();
					context.arc(point.x, point.y, 3, 0, Math.PI*2);
					context.fill();
				}

				//draw agents
				for (var a = 0; a < conn[k].agents.length; a++) {
					cp = jsBezier.pointOnCurve([{x: city1[0], y: city1[1]}
							   					   ,{x: bp[0], y: bp[1]}
							  					   ,{x: city2[0], y: city2[1]}]
							   					   , 1 - conn[k].agents[a].distance);
					conn[k].agents[a].draw(cp.x, cp.y);
				}
				//opposite direction
				for (var a = 0; a < o_conn[k].agents.length; a++) {
					cp = jsBezier.pointOnCurve([{x: city2[0], y: city2[1]}
							   					   ,{x: bp[0], y: bp[1]}
							  					   ,{x: city1[0], y: city1[1]}]
							   					   , 1 - o_conn[k].agents[a].distance);
					o_conn[k].agents[a].draw(cp.x, cp.y);
				}
				//same of the second connection
				for (var a = 0; a < conn[k + 1].agents.length; a++) {
					cp = jsBezier.pointOnCurve([{x: city1[0], y: city1[1]}
							   					   ,{x: bp2[0], y: bp2[1]}
							  					   ,{x: city2[0], y: city2[1]}]
							   					   , 1 - conn[k + 1].agents[a].distance);
					conn[k + 1].agents[a].draw(cp.x, cp.y);
				}
				for (var a = 0; a < o_conn[k + 1].agents.length; a++) {
					cp = jsBezier.pointOnCurve([{x: city2[0], y: city2[1]}
							   					   ,{x: bp2[0], y: bp2[1]}
							  					   ,{x: city1[0], y: city1[1]}]
							   					   , 1 - o_conn[k + 1].agents[a].distance);
					o_conn[k + 1].agents[a].draw(cp.x, cp.y);
				}

				width += 20;
			}
		}
	}
}

GameRoom.prototype.getMaterialCost = function(mat) {
	var costs = [1, 2.76, 4.89]; //factors
	return costs[this.selected_material];
}

GameRoom.prototype.getMaterialName = function() {
	var names = ["Iron", "Copper", "Platinum"];
	return names[this.selected_material];
}

GameRoom.prototype.getMaterialUpkeep = function(material) {
	var upkeeps = [2, 3, 4];
	return upkeeps[material];
}

GameRoom.prototype.buyConnection = function(cost) {
	if (cost > this.funds) {
		return false;
	}
	this.funds -= cost;
	return true;
}

GameRoom.prototype.generateFunds = function(city) {
	//var min = 0;
	//var max = 50;

	//var amount = Math.min(max, Math.max(min, city.getAccumulatedFunds()));
	this.funds += city.getAccumulatedFunds();
}

GameRoom.prototype.applyUpkeep = function() {
	this.funds -= this.getMaterialUpkeep(0) * this.connections_in_use[0]/2;
	this.funds -= this.getMaterialUpkeep(1) * this.connections_in_use[1]/2;
	this.funds -= this.getMaterialUpkeep(2) * this.connections_in_use[2]/2;
}

GameRoom.prototype.calcCityScores = function() {
	this.avg_citygrowth = 0;
	this.avg_cityprosperity = 0;
	for (var i = 0; i < this.world.cities.length; i++) {
		var city = this.world.cities[i];
		this.avg_citygrowth += city.development;
		this.avg_cityprosperity += city.prosperity;
	}
	this.avg_citygrowth /= this.world.cities.length;
	this.avg_cityprosperity /= this.world.cities.length;
}

function distance(pair1, pair2) {
	return Math.pow(Math.pow(pair1[0] - pair2[0], 2) + Math.pow(pair1[1] - pair2[1], 2), 0.5);
}