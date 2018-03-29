//Container for message handlers
game.handlers = {};

function sendToServer(type, data){
  var obj = {
    type: type,
    data: data
  };
  //Send data to server
  socket.send(JSON.stringify(obj));
}

function onMessage(event){
  //Get the data sent from the server
  var message = JSON.parse(event.data);

  //Execute the handler for the message type, passing the data along
  game.handlers[message.type](message.data);
};

//Handle userlist
game.handlers.users = function(userlist){
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
          //TODO more efficient user state update (don't send whole list)
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
}

//TODO integrate this into users handler
game.handlers['user disconn'] = function(username){
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
}

game.handlers.signin = function(key){
  if(key.accept) {
    //Hide sign-in form
    $("#signin").hide();

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
  } else {
    //If sign-in wasn't accepted, list reason
    $("#signin > p:last").text("Sign-in rejected: "+key.reason);
    $("#signin > p:last").css("color", "red");
    console.log("Sign in rejected because of: "+key.reason);
  }
};
