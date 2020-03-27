var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
const shortid = require('shortid');

let gamesList = {};

// Make the 'public' directory able to serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'socket.io')));

// Handle request to root
app.get('/', function(req, res){
    let reqGame = req.query.game;

    if(!reqGame) {
        res.sendFile(__dirname + '/views/index.html');
    } else if(reqGame === 'new') {
        res.sendFile(__dirname + '/views/waiting-room.html');
    } else {
        res.sendFile(__dirname + '/views/game.html');
    }

});

// Handle a connection to the app. 
// Create a new player OR
// Match it to an existing player if it's a reconnection.
io.on('connection', function(socket){
    console.log('a connection was detected');

    socket.on('new game request', function(name){
        gamesList[socket.id] = [{id:socket.id, name:name}];
        console.log(gamesList);
    });

    socket.on('credentials', function(playerRoom){
        if(playerRoom in gamesList) {
            socket.emit('room check', true);
        } else {
            socket.emit('room check', false);   
        }
    });


    // Broadcast connection to OTHER clients
    // TODO: check if this is just a reconnection with stored values for user
    socket.broadcast.emit('hi');


    // Handle a test event from a client
    socket.on('test', function(msg){
        console.log('message: ' + msg);
    });


    // Handle user disconnecting
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });    
});


// Handle and event from a specific socket(user)
io.on('test', function(socket) {

})

// Set the port for Heroku or local
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

// Listen on the port
http.listen(port, function(){
    console.log('listening on: ' + port);
});