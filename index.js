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
        status: 'waiting',
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

// This does a check to see if the room exists
app.get('/join', function(req, res){
    // The query params
    let reqRoom = req.query.r;
    let reqCreator = req.query.n;

    // The supposed room object.
    let roomObject = roomsList.filter(room => room.lock === reqRoom)[0];

    // Send index.html no matter what
    res.sendFile(__dirname + '/index.html');

    // Redirect depending on whether room actually exists and attach status param
    if(roomObject) {
        res.redirect('/?r=' + reqRoom + '&n=' + reqCreator + '&s=' + roomObject.status);
    } else if(reqCreator) {
        res.redirect('/?r=gameover&n=' + reqCreator);
    } else {
        res.redirect('/?r=gameover');    
    }
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


    // ---------------------------------------------------------------------------------------
    // Handle user disconnecting
    // ---------------------------------------------------------------------------------------
    socket.on('disconnect', function(){
        console.log('user disconnected with ID: ' + socket.id);
    });


    // ---------------------------------------------------------------------------------------
    // Handle user reconnection request
    // ---------------------------------------------------------------------------------------
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


    // ---------------------------------------------------------------------------------------
    // New game requested from the waiting room by new player
    // ---------------------------------------------------------------------------------------
    socket.on('new game request', function(nickname, lock, acknowledge){
        playersList.push({id:socket.id, nickname:nickname, roomKey:lock});
        roomsList.push({lock:lock, status:'waiting'});

        socket.join(lock);
        acknowledge();
    });


    // ---------------------------------------------------------------------------------------
    // A player enters the waiting room and can see who's there
    // ---------------------------------------------------------------------------------------
    socket.on('see waiting room', function(roomKey, acknowledge){
        let otherPlayers = playersList.filter(player => player.roomKey === roomKey);
        acknowledge(otherPlayers);
    });


    // ---------------------------------------------------------------------------------------
    // Joining player has submitted name to actually join the room
    // ---------------------------------------------------------------------------------------
    socket.on('join room', function(nickname, roomKey, acknowledge){
        playersList.push({id:socket.id, nickname:nickname, roomKey:roomKey});
        let allPlayers = playersList.filter(player => player.roomKey === roomKey);

        socket.join(roomKey);
        acknowledge(allPlayers);
        socket.to(roomKey).emit('new member', allPlayers);
    });

    // ---------------------------------------------------------------------------------------
    // A player has clicked the start button
    // ---------------------------------------------------------------------------------------
    socket.on('start game request', function(roomKey){
        let roomObject = roomsList.filter(room => room['lock'] === roomKey)[0];

        if(roomObject.status != 'started' ) {
            roomObject.status = 'started';
            roomObject.turn = socket.id;

            let allPlayers = playersList.filter(player => player.roomKey === roomKey);

            io.to(roomKey).emit('game start', allPlayers, roomObject, dataMinigames);
        }
    });





});