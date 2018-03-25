//Global PIXI.js app variable
var app;
var game = {};

//Socket.io constant
const socket = io();

$(()=>{
  //When sign in button is clicked
  $("#signin > button").bind("click", function(){
    //If text is blank, tell user to fill it out
    if($("#signin > input:eq(0)").val() == "") { alert("Please enter a name."); }
    else {
      //Hide sign-in form
      $("#signin").hide();
      createGame();
    }
  });
});

//Called after signin
function createGame(){
    //TODO connect to server and make a socket
    $("#signin").append("<p>Logging in...</p>");

  //Create application
  app = new PIXI.Application({
    "width":640,
    "height":480
  });

  //Add child to DOM
  document.body.appendChild(app.view);

  //Load everything
  load();
}

//Will handle all loading
function load(){
  app.loader.add('bg1', 'resources/images/bg1.png')
    .add('char', 'resources/images/char.png')
  console.log("load() has been reached");
  app.loader.load(setup);
}

function setup(){
  console.log("setup() has been reached");

  //Make background sprite
  game.bg = new PIXI.extras.TilingSprite(
    app.loader.resources["bg1"].texture,
    640, 480);

  //Make player
  game.player = new Player(320, 240);
  game.player.health = 100;

  game.healthDisplay = new PIXI.Graphics();
  game.healthDisplay.beginFill(0x00FF99);
  game.healthDisplay.drawRect(320-150, 20, 300/100*game.player.health, 15);
  game.healthDisplay.endFill();

  //Add new sprites to stage
  app.stage.addChild(game.bg);
  app.stage.addChild(game.player.sprite);
  app.stage.addChild(game.healthDisplay);

  //Set up ping variable
  game.pingcount = 0;

  //This specifies the loop
  app.ticker.add(()=>{
    //Call the current game state loop and render it
    game.state();
    //Get ping
    if(game.pingcount>=120){
      game.pingcount = 0;
    socket.emit('ping');
    } else {
      game.pingcount++;
    }
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

//Holds the game's current state
game.state = play;

function play(){
  //These specify sprites in the spritesheet
  game.player.directions = {
    up: new PIXI.Rectangle(0, 0, 64, 64),
    down: new PIXI.Rectangle(0, 64, 64, 64),
    left: new PIXI.Rectangle(64, 64, 64, 64),
    right: new PIXI.Rectangle(64, 0, 64, 64)
  };
  //Update the health display
  // game.healthDisplay.clear();
  // game.healthDisplay.beginFill(0x00FF99);
  // game.healthDisplay.drawRect(320, 20, 150/100*game.player.health, 15);
  // game.healthDisplay.endFill();

  if (keys.up.isDown){
    move(game.player.directions.down, 0, game.player.speed);
  }
  if (keys.down.isDown){
    move(game.player.directions.up, 0, -game.player.speed);
  }
  if (keys.left.isDown){
    move(game.player.directions.left, game.player.speed, 0);
  }
  if (keys.right.isDown){
    move(game.player.directions.right, -game.player.speed, 0);
  }
}

//Function to handle movement and updating server
function move(direction, vx, vy){
    game.player.sprite.texture.frame = direction; //Set subset of image
    game.player.sprite.texture._updateUvs();
    game.bg.tilePosition.x+=vx;
    game.bg.tilePosition.y+=vy;
}

socket.on('pong', function(ping){
  game.ping = ping;
  console.log("ping: "+ping);
});
