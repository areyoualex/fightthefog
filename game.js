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
  app.loader.add('bg1', 'resources/images/bg1.png');
  console.log("load() has been reached");
  app.loader.load(setup);
}

function setup(){
  console.log("setup() has been reached");
  //Make background sprite
  game.bg = new PIXI.extras.TilingSprite(
    app.loader.resources["bg1"].texture,
    640, 480);

  //Add new sprites to stage
  app.stage.addChild(game.bg)
  //This specifies the loop
  app.ticker.add(()=>{
    //Call the current game state loop and render it
    game.state();
    app.render();
  });
  app.start();
}

//Holds the game's current state
game.state = play;

function play(){
  //TODO do stuff
}
