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

  //Execute the handler for the message type if it exists, passing the data along
  if (message.type in game.handlers)
    game.handlers[message.type](message.data);
};

//Handle userlist
game.handlers.users = function(userlist){
  //If game is loaded, update the displayed users
  if(game.states.loaded){
    for(var u in userlist){
      //Check that this isn't the player
      if (userlist[u].username != game.player.username){
        //If user doesn't exist yet
        if (userlist[u].username in game.users === false){
          //Make a new user
          var newUser = new Player(userlist[u]);
          game.users[userlist[u].username] = newUser;
          //Add sprite to players
          game.players.addChild(newUser.sprite);
        } else {
          //Update user status
          // game.users[userlist[u].username].x = userlist[u].x;
          // game.users[userlist[u].username].y = userlist[u].y*-1;
          // game.users[userlist[u].username].direction = userlist[u].direction;
        }
      } else {
      }
    };
  }
  //Update user list
  $("#users > ul").empty();
  for (var i in userlist){
    var html = "<li>"+userlist[i].username+"</li>";
    $("#users > ul").append(html);
  };
}

//TODO integrate this into users handler
game.handlers['user disconn'] = function(username){
  console.log(username+" disconnected");
  if (username in game.users){
    //Delete the user
    console.log("removed user successfully");
    game.players.removeChild(game.users[username].sprite);
    delete game.users[username];
  }
  console.log("new user list:");
  console.log(JSON.stringify(users));
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

game.handlers['state update'] = function(state){
  //Check that this isn't the user
  if (state.username == game.player.username) return;

  //If game is loaded, update the user
  if(game.states.loaded){
    if (state.username in game.users){
      //Update user status
      game.users[state.username].x = state.x;
      game.users[state.username].y = state.y*-1;
      game.users[state.username].direction = state.direction;
    }
  }
};
