var keys = {};

//Function to handle keyboard events
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}
function handleInputs() {
  if (keys.up.isDown){
    move(game.directions.up, 0, game.player.speed);
    game.player.direction = "up";
  }
  if (keys.down.isDown){
    move(game.directions.down, 0, -game.player.speed);
    game.player.direction = "down";
  }
  if (keys.left.isDown){
    move(game.directions.left, -game.player.speed, 0);
    game.player.direction = "left";
  }
  if (keys.right.isDown){
    move(game.directions.right, game.player.speed, 0);
    game.player.direction = "right";
  }
}

//Function to handle movement
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
  game.bg.tilePosition.x-=vx;
  game.bg.tilePosition.y+=vy;

  //Update position variables
  game.player.x+=vx;
  game.player.y+=vy;
  game.player.direction = direction;

  //Update position of map (relative to player)
  game.players.position.x-=vx;
  game.players.position.y+=vy;
}
