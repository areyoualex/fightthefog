//Global PIXI.js app variable
var app;

//Game variables to track state
var game = {};
game.states = {};
game.users = {};
game.players = new PIXI.Container();
game.players.x = 320;
game.players.y = 240;
game.states.moved = false;
game.states.loaded = false;

var username;

//WebSocket connection variable
var socket = undefined;

$(()=>{
  //When sign in button is clicked
  $("#signin > button").bind("click", function(){
    //If text is blank, tell user to fill it out
    if($("#signin > input:eq(0)").val() == "") { alert("Please enter a name."); }
    else {
      createGame();
    }
  });
  $.getJSON("users.json", function(data){
    $("#users > ul").empty();
    for (var u in data){
      var html = "<li>"+data[u].username+"</li>";
      $("#users > ul").append(html);
    }
  });
});

//Called after signin
function createGame(){
  $("#signin > p:eq(1)").remove();
  $("#signin").append("<p>Connecting to the server...</p>");

  //Start a connection with the server
  if (socket == undefined){
    socket = new WebSocket("ws://" + location.host);
    //When the connection opens, sign in
    socket.addEventListener('open', function(){
      //Add messages event listener
      socket.addEventListener('message', onMessage);
      sendToServer('signin', $('#signin > input:eq(0)').val());

      socket.addEventListener('close', function(e){
    		switch (e){
    		case 1000:	// CLOSE_NORMAL
    			console.log("WebSocket: closed");
    			break;
    		default:	// Abnormal closure
          socket = new WebSocket("ws://"+location.host);
          //TODO let server know that this is the disconnected user
    			break;
    		}
    	});

      socket.addEventListener('error', function(e){
        if (e.code == 'ECONNREFUSED'){
          socket = new WebSocket("ws://"+location.host);
          //TODO let server know that this is the disconnected user
        }
    	});
    });
  } else if (socket.readyState === WebSocket.OPEN)
      sendToServer('signin', $('#signin > input:eq(0)').val());
}

//Will handle all loading
function load(){
  console.log("load() has been reached");

  app.loader.add('bg1', 'resources/images/bg1.png')
    .add('char', 'resources/images/char.png')
  app.loader.load(setup);
}

function setup(){
  console.log("setup() has been reached");
  game.states.loaded = true;

  //Make background sprite
  game.bg = new PIXI.extras.TilingSprite(
    app.loader.resources["bg1"].texture,
    640, 480);

  //Get sprite for character
  game.charsprite = PIXI.RenderTexture.create(128, 128);
  game.charsprite.baseTexture = app.loader.resources.char.texture.baseTexture;

  //These specify sprites in the spritesheet
  game.directions = {
    up: new PIXI.Rectangle(0, 64, 64, 64),
    down: new PIXI.Rectangle(0, 0, 64, 64),
    left: new PIXI.Rectangle(64, 64, 64, 64),
    right: new PIXI.Rectangle(64, 0, 64, 64)
  };

  //Make player
  game.player = new Player({username: username, x: 0, y: 0});
  game.player.health = 100;
  game.player.sprite.x = 320;
  game.player.sprite.y = 240;

  game.healthDisplay = new PIXI.Graphics();
  game.healthDisplay.beginFill(0x00FF99);
  game.healthDisplay.drawRect(320-150, 20, 300/100*game.player.health, 15);
  game.healthDisplay.endFill();
  game.healthDisplay.text = new PIXI.Text('HEALTH: '+game.player.health, {
      fontFamily: 'Inconsolata', fontSize: 14, fill: 0xffffff
    });
  game.healthDisplay.text.anchor.x = 0.5;
  game.healthDisplay.text.anchor.y = 0.5;
  game.healthDisplay.text.x = 320;
  game.healthDisplay.text.y = 50;


  var namedisplay = new PIXI.Text('Hello, '+username,
    { fontFamily: 'Inconsolata', fontSize: 16, fill: 0xffffff }
  );
  namedisplay.x += 15;
  namedisplay.y += 18;

  //Add new sprites to stage
  app.stage.addChild(game.bg);
  app.stage.addChild(game.players);
  app.stage.addChild(game.player.sprite);
  app.stage.addChild(game.healthDisplay)
    .addChild(game.healthDisplay.text);
  app.stage.addChild(namedisplay);

  //Holds the game's current state
  game.state = game.states.play;

  //This specifies the game loop
  app.ticker.add(()=>{
    //Call the current game state loop and render it
    game.state();
    app.render();
  });
  app.start();

  //Create key listeners
  keys.up = keyboard(87);
  keys.left = keyboard(65);
  keys.down = keyboard(83);
  keys.right = keyboard(68);
  keys.space = keyboard(32);
}

game.states.play = function(){
  //Update the health display
  game.healthDisplay.clear();
  game.healthDisplay.beginFill(0x00FF99);
  game.healthDisplay.drawRect(320-150, 20, 300/100*game.player.health, 15);
  game.healthDisplay.endFill();

  //Keyboard input
  handleInputs();

  //Send state to server
  if (game.states.moved){
    var stateObj = {
      x: game.player.x,
      y: game.player.y,
      direction: game.player.direction,
    };
    sendToServer('state update', stateObj);
    game.states.moved = false;
  }

  //Update states of everyone else
  for (var u in game.users){
    if (game.users[u].sprite == undefined) return;
    else {
      game.users[u].sprite.x = game.users[u].x;
      game.users[u].sprite.y = game.users[u].y;
      game.users[u].sprite.texture.frame = game.directions[game.users[u].direction];
    }
  };
};
