'use strict';

//Use modules express and http
const express = require('express');
const app = express();
const http = require('http').Server(app);
const firebase = require('firebase');

//Use websockets
const ws = require('ws');
const path = require('path');

//Variables for server port (for heroku) and index.html
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

//Sends index.html
app.get('/', (req, res) => {
  res.sendFile(INDEX);
})

//Sends static files like CSS, JS, images, etc.
app.use(express.static('.'));

//Listen on port 3000 or whatever port the app is running on
http.listen(PORT, ()=> {
  console.log('listening on *:'+ PORT + ' o3o');
})

//List of online users
var users = [];

//Make new WebSocket server
var wss = new ws.Server(
  {
    server: http
  },
  function(){
    console.log("WebSocket server now listening at "+ wss.address());
  }
);


wss.on('connection', (socket, request)=>{
  var user = "";

  wss.broadcast('users', users);

  //On disconnect, clean userlist
  socket.on('close', (code, reason)=>{
    console.log(user+" disconnected with code "+code);

    //Remove the user
    findAndExecUserIndex(user, (u)=>{
      users.splice(u, 1);
    });
    //Emit userlist
    wss.broadcast('users', users);
    wss.broadcast('user disconn', user);
  });

  //Define an emit function for sending data
  function sendToClient(type, data){
    var obj = {
      type: type,
      data: data
    };
    //Send data to server if socket is open
    if(socket.readyState === ws.OPEN)
      socket.send(JSON.stringify(obj));
  }

  /***
  * Defining message handlers
  ***/

  //Container for message handlers
  var handlers = {};

  //On connect, intialize new User
  handlers.signin = function(username){
    //TODO implement better validation
    //Validate user
    if(username.length > 20){
      sendToClient('signin', {accept: false, reason: "Username too long"});
      return;
    } else {
      //Add new user
      users.push(new User(username, 0, 0));
      user = username;
      console.log(user+" connected");
      //Emit userlist
      wss.broadcast('users', users);

      sendToClient('signin', {accept: true});
    }
  };

  //On state update, update everyone else
  //TODO Make this more efficient
  handlers['state update'] = function(x, y, d){
    findAndExecUser(user, (u)=>{
      //Update values
      u.x = x;
      u.y = y;
      u.direction = d;
      wss.broadcast('users', users);
    });
  };

  //Handle messages
  socket.on('message', function(data){
    //Handle empty messages
    if(data == undefined){
      console.log("unexpected message: "+data);
      return;
    }

    //Get the data sent from the server
    var message = JSON.parse(data);

    //Execute the handler for the message type, passing the data along
    handlers[message.type](message.data);
  });
});

function User(username, x, y){
  this.username = username;
  this.x = x;
  this.y = y;
  this.health = 100;
  this.speed = 3;
  this.direction = "down";
}

function findUser(user){
  var i = -1;
  for (var index = 0; index < users.length; index++){
    if (users[index].username == user){
      i = index;
      break;
    }
  }
  return i;
}

function findAndExecUser(user, fun){
    if (findUser(user) != -1) fun(users[findUser(user)]);
    else {
      console.log("A find and execute has failed.");
    }
}

function findAndExecUserIndex(user, fun){
    if (findUser(user) != -1) fun(findUser(user));
    else {
      console.log("A find and execute has failed.");
    }
}

// Broadcast to all.
wss.broadcast = function broadcast(type, data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(
        {
          type: type,
          data: data
        }
      ));
    }
        {
          type: type,
          data: data
        }
      ));
  });
};
