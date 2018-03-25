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

io.on('connection', (socket)=>{
  console.log("user connected");
  socket.on('ping', ()=>{
    console.log("was pinged");
  });
});
