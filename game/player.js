function Player(x, y, username){
  //Get character textures
  this.sprite = new PIXI.Sprite(
    game.charsprite.clone()
  );

  //Initialize player
  this.sprite.texture.frame = new PIXI.Rectangle(0,0,64,64); //Set subset of image
  this.x = 0;
  this.y = 0;
  this.direction = "down";

  //Player username
  this.username = username;
  var text = new PIXI.Text(username,
    { fontFamily: "Open Sans", fontSize: 12, fill:0xffffff }
  );
  text.anchor.x = 0.5;
  text.anchor.y = 0.5;
  text.y = 44;
  this.sprite.addChild(text);
  this.sprite.x = x;
  this.sprite.y = y;

  //Centering
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;

  //Other values
  this.speed = 3;
  this.health = 0;
}
