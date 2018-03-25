'use strict';

//Use modules express and http
const express = require('express');
const app = express();
const http = require('http').Server(app);
const firebase = require('firebase');

//Use socketIO and path
const socketIO = require('socket.io');
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

//socketIO stuff
const io = socketIO(http);

//List of online users
var users = [];

io.on('connection', (socket)=>{
  var user = "";
  io.emit('users', users);

  //On connect, intialize new User
  socket.on('signin', (username)=>{
    //Add new user
    users.push(new User(username, 0, 0));
    user = username;
    console.log(user+" connected");
    //Emit userlist
    io.emit('users', users);
  });

  //On disconnect, clean userlist
  socket.on('disconnect', (r)=>{
    console.log(user+" disconnected");
    //Remove the user
    findAndExecUserIndex(user, (u)=>{
      users.splice(u, 1);
    });
    //Emit userlist
    io.emit('users', users);
  });

  //On state update, update everyone else
  socket.on('state update', (x, y)=>{
    findAndExecUser(user, (u)=>{
      u.x = x;
      u.y = y;
    });
  });
});

function User(username, x, y){
  this.username = username;
  this.x = x;
  this.y = y;
  this.health = 100;
  this.speed = 3;
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
  console.log("before: "+users);
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
