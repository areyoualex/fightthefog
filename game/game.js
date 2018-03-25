//Global PIXI.js app variable
var app;
var game = {};
game.states = {};
game.users = [];
game.players = new PIXI.Container();
game.players.x = 320;
game.players.y = 240;
game.states.moved = false;
game.states.loaded = false;
var username;

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
  $("#signin").append("<p>Logging in...</p>");

  socket.emit('signin', $('#signin > input:eq(0)').val());

  username = $('#signin > input:eq(0)').val();

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
  game.states.loaded = true;

  //Make background sprite
  game.bg = new PIXI.extras.TilingSprite(
    app.loader.resources["bg1"].texture,
    640, 480);

  //Get sprite for character
  game.charsprite = PIXI.RenderTexture.create(128, 128);
  game.charsprite.baseTexture = app.loader.resources.char.texture.baseTexture;

  //Make player
  game.player = new Player(320, 240, username);
  game.player.health = 100;

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
  game.directions = {
    up: new PIXI.Rectangle(0, 0, 64, 64),
    down: new PIXI.Rectangle(0, 64, 64, 64),
    left: new PIXI.Rectangle(64, 64, 64, 64),
    right: new PIXI.Rectangle(64, 0, 64, 64)
  };
  //Update the health display
  game.healthDisplay.clear();
  game.healthDisplay.beginFill(0x00FF99);
  game.healthDisplay.drawRect(320-150, 20, 300/100*game.player.health, 15);
  game.healthDisplay.endFill();

  if (keys.up.isDown){
    move(game.directions.down, 0, game.player.speed);
    game.player.direction = "down";
  }
  if (keys.down.isDown){
    move(game.directions.up, 0, -game.player.speed);
    game.player.direction = "up";
  }
  if (keys.left.isDown){
    move(game.directions.left, game.player.speed, 0);
    game.player.direction = "left";
  }
  if (keys.right.isDown){
    move(game.directions.right, -game.player.speed, 0);
    game.player.direction = "right";
  }

  //Send state to server
  if (game.states.moved){
    socket.emit('state update', game.player.x, game.player.y, game.player.direction);
    game.states.moved = false;
  }

  //Update states of everyone else
  game.users.forEach((u)=>{
    u.sprite.x = u.x;
    u.sprite.y = u.y;
    u.sprite.texture.frame = game.directions[u.direction];
  });
}

//Function to handle movement and updating server
function move(direction, vx, vy){
  //Since player was moved, update game.states.moved
  game.states.moved = true;

  //Update display
  game.player.sprite.texture.frame = direction; //Set subset of image
  game.player.sprite.texture._updateUvs();
  if(game.bg.tilePosition.x+vx > 1000 || game.bg.tilePosition.x+vx < -1000)
    return;
  if(game.bg.tilePosition.y+vy > 1000 || game.bg.tilePosition.y+vy < -1000)
    return;
  game.bg.tilePosition.x+=vx;
  game.bg.tilePosition.y+=vy;

  //Update position variables
  game.player.x-=vx;
  game.player.y-=vy;
  game.player.direction = direction;

  //Update position of map
  game.players.position.x+=vx;
  game.players.position.y+=vy;
}

//Handle pings
socket.on('pong', function(ping){
  game.ping = ping;
  console.log("ping: "+ping);
});

//Handle userlist
socket.on('users', function(userlist){
  //If game is loaded, update the displayed users
  if(game.states.loaded){
    userlist.forEach((u)=>{
      if (u.username != game.player.username){
        //Find the index of the user
        var i = -1;
        for (var index = 0; index < game.users.length; index++){
          if (game.users[index].username == u.username){
            i = index;
            break;
          }
        }
        if (i == -1){
          //Make a new user
          var user = new Player(u.x, u.y, u.username);
          game.users.push(user);
          game.players.addChild(user.sprite);
        } else {
          //Update user status
          game.users[index].x = u.x;
          game.users[index].y = u.y;
          game.users[index].direction = u.direction;
        }
      }
    });
  }
  $("#users > ul").empty();
  userlist.forEach(function(user){
    var html = "<li>"+user.username+"</li>";
    $("#users > ul").append(html);
  });
});

socket.on('user disconn', function(username){
  //Find the index of the user
  var i = -1;
  for (var index = 0; index < game.users.length; index++){
    if (game.users[index].username == username){
      i = index;
      break;
    }
  }
  if (index != -1){
    //Delete the user
    game.players.removeChild(game.users[i].sprite);
    game.users.splice(index, 1);
  }
});
