function Player(user){
  //Get character textures
  this.sprite = new PIXI.Sprite(
    game.charsprite.clone()
  );

  console.log(username + " has logged in");

  //Initialize player
  this.x = user.x;
  this.y = user.y;
  this.direction = "down";
  this.sprite.texture.frame = game.directions[this.direction];

  //Player username
  this.username = user.username;
  var text = new PIXI.Text(user.username,
    { fontFamily: "Open Sans", fontSize: 12, fill:0xffffff }
  );
  text.anchor.x = 0.5;
  text.anchor.y = 0.5;
  text.y = 44;
  this.sprite.addChild(text);
  this.sprite.x = this.x;
  this.sprite.y = this.y;

  //Centering
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;

  //Other values
  this.speed = 3;
  this.health = 0;
}
