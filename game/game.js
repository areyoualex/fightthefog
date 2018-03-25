//Global PIXI.js app variable
var app;
var game = {};

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

  //Get character textures
  game.player = new PIXI.Sprite(
    app.loader.resources["char"].texture
  );
  game.player.texture.frame = new PIXI.Rectangle(0,0,64,64); //Set subset of image
  game.player.x = 320;
  game.player.y = 240;
  game.player.anchor.x = 0.5;
  game.player.anchor.y = 0.5;
  game.speed = 3;

  //Add new sprites to stage
  app.stage.addChild(game.bg)
    .addChild(game.player);
  //This specifies the loop
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

//Holds the game's current state
game.state = play;

function play(){
  game.player.directions = {
    up: new PIXI.Rectangle(0, 0, 64, 64),
    down: new PIXI.Rectangle(0, 64, 64, 64),
    left: new PIXI.Rectangle(64, 64, 64, 64),
    right: new PIXI.Rectangle(64, 0, 64, 64)
  };
  //TODO do stuff
  if (keys.up.isDown){
    move(game.player.directions.down, 0, game.speed);
  }
  if (keys.down.isDown){
    move(game.player.directions.up, 0, -game.speed);
  }
  if (keys.left.isDown){
    move(game.player.directions.left, game.speed, 0);
  }
  if (keys.right.isDown){
    move(game.player.directions.right, -game.speed, 0);
  }
}

//Function to handle movement and updating server
function move(direction, vx, vy){
    game.player.texture.frame = direction; //Set subset of image
    game.player.texture._updateUvs();
    game.bg.tilePosition.x+=vx;
    game.bg.tilePosition.y+=vy;
}
