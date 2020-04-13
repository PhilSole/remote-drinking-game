// ===========================================================================================
//  App vars
// ===========================================================================================
let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let path = require('path');
// var fs = require("fs");

// Minigames variable from json file
const dataMinigames = require(__dirname + '/public/data/subgames.json');

// Dummy data in global game data arrays
let playersList = [
    {
        id: '123',
        nickname: 'Bob',
        roomKey: 'abc',
        timeout: {}
    }
];

let roomsList = [
    {
        lock: 'abc',
        started: true,
        timeout: {}
    }
];


// ===========================================================================================
//  Declare the public assets directory
// ===========================================================================================
app.use(express.static(path.join(__dirname, 'public')));


// ===========================================================================================
//  Express routes 
//  Two main and a catch-all. One for new visitor and one for joining a room.
// ===========================================================================================
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/join', function(req, res){
    let reqRoom = req.query.r;
    let reqCreator = req.query.n;

    res.sendFile(__dirname + '/index.html');
    res.redirect('/?r=' + reqRoom + '&n=' + reqCreator);
});

app.get('*', function(req, res){
    res.sendFile(__dirname + '/index.html');
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



    // Handle user disconnecting
    socket.on('disconnect', function(){
        console.log('user disconnected with ID: ' + socket.id);
    });



    // Handle user reconnection request
    socket.on('request reconnection', function(requestID, acknowledge){

        let playerData = playersList.filter(player => player['id'] === requestID)[0];

        // If the playerData exists the room must exist because all players in a room are deleted when the room is.
        if(playerData) {
            // Set the new ID and join the room again
            playerData.id = socket.id;
            socket.join(playerData.roomKey);

            // Collect updated game data for reconnecting player
            let roomObject = roomsList.filter(room => room['lock'] === playerData.roomKey)[0];
            let allPlayers = playersList.filter(player => player['roomKey'] === roomObject.lock);

            // Callback with success value and game data
            acknowledge(true, allPlayers, roomObject, dataMinigames);

        } else {
            // The game doesn't exist anymore so need to delete local storage
            acknowledge(false);
        }
    });    



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


});