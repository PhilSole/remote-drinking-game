var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
const shortid = require('shortid');

let playerList = [];

// Make the 'public' directory able to serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'socket.io')));

// Handle request to root
app.get('/', function(req, res){
    let reqRoom = req.param('room');

    if(!reqRoom) {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.sendFile(__dirname + '/views/waiting-room.html');   
    }

});

// Handle a connection to the app. 
// Create a new player OR
// Match it to an existing player if it's a reconnection.
io.on('connection', function(socket){
    console.log('a connection was detected');

    socket.on('credentials', function(playerid){
        if(playerid) {

        } else {
            socket.emit('new client', shortid.generate());
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


// ===============================================================================
//
//  Code snippets
//
// ===============================================================================

    // console.log(socket);

    // Add the new ID to the player list
    // playerList.push(socket.id);

    // console.log(playerList);



    // socket.on('chat message', function(msg){
    //     console.log('message: ' + msg);
    //     io.emit('chat message out', msg);
    // });

    // socket.broadcast.emit('hi');