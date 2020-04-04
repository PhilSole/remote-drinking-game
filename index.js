// ===========================================================================================
//  App vars
// ===========================================================================================
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
// var fs = require("fs");


let playersList = [];
let roomsList = [];


// ===========================================================================================
//  Declare the public assets directory
// ===========================================================================================
app.use(express.static(path.join(__dirname, 'public')));


// ===========================================================================================
//  Express routes 
//  Two main and a catch-all. One for new visitor and one for joining a room.
// ===========================================================================================
app.get('/', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/join', function(req, res){
    let reqRoom = req.query.room;

    res.sendFile(__dirname + '/views/index.html');
    res.redirect('/?room=' + reqRoom);
});

app.get('*', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});


// ===========================================================================================
//  Server set up port for Heroku or local
// ===========================================================================================
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

http.listen(port, function(){
    console.log('listening on: ' + port);
});


// ===========================================================================================
//  Set up socket listeners on 'connection'
//  Create a new player OR
//  Match it to an existing player if it's a reconnection.
// ===========================================================================================
io.on('connection', function(socket){
    console.log('Connection: socket ID — ' + socket.id);

    // New game requested from the waiting room by new player
    socket.on('new game request', function(data, acknowledge){
        let name = data['name'];
        let room = data['room'];

        playersList.push({id:socket.id, name:name, room:room});
        roomsList.push({id:room, started:false});

        socket.join(room);
        acknowledge();
    });

    // A player enters the waiting room and can see who's there
    socket.on('see waiting room', function(room, showRoom){
        let otherPlayers = playersList.filter(player => player['room'] === room);
        showRoom(otherPlayers);
    });

    // Joining player has submitted name to actually join the room
    socket.on('join room', function(data, acknowledge){
        let name = data['name'];
        let room = data['room'];

        playersList.push({id:socket.id, name:name, room:room});

        socket.join(room);
        acknowledge(playersList);
        socket.to(room).emit('new member', playersList);        
    });

    // A player has clicked the start button
    socket.on('start game request', function(roomID, acknowledge){
        let roomObject = roomsList.filter(room => room['id'] === roomID)[0];
        if(!roomObject['started']) {
            roomObject['started'] = true;
            
            roomObject['turn'] = socket.id;

            let allPlayers = playersList.filter(player => player['room'] === roomID);

            socket.to(roomID).emit('game start', allPlayers, roomObject);

            var dataMinigames = require(__dirname + '/public/data/subgames.json');
            acknowledge(allPlayers, roomObject, dataMinigames);    
        }
    });











    socket.on('credentials', function(playerRoom){
        console.log('there are some credentials');
    });

    // Handle user disconnecting
    socket.on('disconnect', function(){
        console.log('user disconnected with ID: ' + socket.id);
    }); 
});