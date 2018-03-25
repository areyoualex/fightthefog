function Player(x, y){
  //Get character textures
  this.sprite = new PIXI.Sprite(
    app.loader.resources["char"].texture
  );

  //Initialize player
  this.sprite.texture.frame = new PIXI.Rectangle(0,0,64,64); //Set subset of image
  this.x = 0;
  this.y = 0;
  this.sprite.x = x;
  this.sprite.y = y;
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.speed = 3;
  this.health = 0;
}
