// ===========================================================================================
//  App vars
// ===========================================================================================
let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let path = require('path');

// Minigames variable from json file
const dataMinigames = require(__dirname + '/public/data/subgames.json');

// Dummy data in global game data arrays
let playersList = [
    {
        id: '123',
        nickname: 'Bob',
        roomKey: 'abc'
    }
];

let roomsList = [
    {
        lock: 'abc',
        status: 'waiting',
        history: []
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

// This does a check to see if the room exists
app.get('/', function(req, res){
    // The query params
    let reqRoom = req.query.r;
    let reqCreator = req.query.n;

    // The supposed room object.
    let roomObject = roomsList.find(room => room.lock === reqRoom);

    // Send index.html no matter what
    res.sendFile(__dirname + '/index.html');

    // Redirect depending on whether room actually exists and attach status param
    if(roomObject) {
        res.redirect('/join?r=' + reqRoom + '&n=' + reqCreator);
    } else if(reqCreator) {
        res.redirect('/oops?r=gameover&n=' + reqCreator);
    } else {
        res.redirect('/new-game');    
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

        // Find the player in the playersList
        let playerIndex = playersList.findIndex(player => player.id === socket.id);
        let thePlayer = playersList[playerIndex];

        if(thePlayer) { // True if the disconnection happens after the player is registered on the playersList

            // Attach a timeout to delete the player in 10 minutes if no reconnection
            thePlayer.timeout = setTimeout(() => {
                playersList.splice(playerIndex, 1);
            }, 600000);
    
            // Check how many players are left in the room -> delete it or pass the turn if it was this player's turn
            let allPlayers = getActivePlayers(thePlayer.roomKey);
            let roomIndex = roomsList.findIndex(room => room.lock === thePlayer.roomKey);
            let theRoom = roomsList[roomIndex];

            if(allPlayers.length < 2) {
                roomsList.splice(roomIndex, 1);
            } else if(thePlayer.id == theRoom.turn) {
                passTurn(theRoom.lock);         
            }
        }
    });


    // ---------------------------------------------------------------------------------------
    // Handle user reconnection request
    // ---------------------------------------------------------------------------------------
    socket.on('request reconnection', function(playerID, acknowledge){
        let player = playersList.find(player => player.id === playerID);
        
        // If the player exist carry on
        if(player) {
            let roomObject = roomsList.find(room => room.lock === player.roomKey);

            // Now check if the room still exists for the player
            if(roomObject) {
                // Clear the timeout that would delete the player and set to active
                clearTimeout(player.timeout);
                player.timeout = 'active';

                // Set the new ID and join the room again
                player.id = socket.id;
                socket.join(player.roomKey);

                // Collect updated playersList for reconnecting player
                let allPlayers = getActivePlayers(player.roomKey);

                // Callback with success value and game data
                acknowledge(true, allPlayers, roomObject, dataMinigames);
            } else {
                acknowledge(false);
            }
        } else {
            // The game doesn't exist anymore so need to delete local storage
            acknowledge(false);
        }
    });    


    // ---------------------------------------------------------------------------------------
    // New game requested from the waiting room by new player
    // ---------------------------------------------------------------------------------------
    socket.on('new game request', function(nickname, lock, acknowledge){
        playersList.push({id:socket.id, nickname:nickname, roomKey:lock, timeout:'active'});
        roomsList.push({lock:lock, status:'waiting', history: []});

        socket.join(lock);
        acknowledge();
    });


    // ---------------------------------------------------------------------------------------
    // A player enters the waiting room and can see who's there
    // ---------------------------------------------------------------------------------------
    socket.on('see waiting room', function(roomKey, acknowledge){
        let otherPlayers = getActivePlayers(roomKey);
        let roomObject = roomsList.find(room => room.lock === roomKey);
        acknowledge(otherPlayers, roomObject);
    });


    // ---------------------------------------------------------------------------------------
    // Joining player has submitted name to actually join the room
    // ---------------------------------------------------------------------------------------
    socket.on('join room', function(nickname, roomKey, acknowledge){
        playersList.push({id:socket.id, nickname:nickname, roomKey:roomKey, timeout:'active'});
        let allPlayers = getActivePlayers(roomKey);
        let roomObject = roomsList.find(room => room.lock === roomKey);

        socket.join(roomKey);
        acknowledge(allPlayers, roomObject, dataMinigames);
        socket.to(roomKey).emit('new member', allPlayers);
    });

    // ---------------------------------------------------------------------------------------
    // A player has clicked the start button
    // ---------------------------------------------------------------------------------------
    socket.on('start game request', function(roomKey){
        let roomObject = roomsList.find(room => room.lock === roomKey);

        if(roomObject.status != 'started' ) {
            roomObject.status = 'started';
            roomObject.turn = socket.id;

            let allPlayers = getActivePlayers(roomKey);

            io.to(roomKey).emit('game start', allPlayers, roomObject, dataMinigames);
        }
    });


    // ---------------------------------------------------------------------------------------
    // A player picked their minigame
    // ---------------------------------------------------------------------------------------
    socket.on('player pick', function(minigameKey, roomKey){
        socket.to(roomKey).emit('player pick', minigameKey);

        let roomObject = roomsList.find(room => room.lock === roomKey);
        roomObject.history.push(minigameKey);
    });


    // ---------------------------------------------------------------------------------------
    // A player passed the turn
    // ---------------------------------------------------------------------------------------
    socket.on('pass turn', function(roomKey){
        passTurn(roomKey);
    });
});


function passTurn(roomKey) {
    let allPlayers = getActivePlayers(roomKey);
    let roomObject = roomsList.find(room => room.lock === roomKey);

    // Set the room turn to the next player's ID
    let currentIndex = allPlayers.findIndex(player => player.id === roomObject.turn);
    let nextIndex = 0;

    if(currentIndex < allPlayers.length - 1) {
        nextIndex = currentIndex + 1;
    }

    roomObject.turn = allPlayers[nextIndex].id;
    
    // Emit to room the passed turn
    io.to(roomKey).emit('turn passed', allPlayers, roomObject);    
}

function getActivePlayers(roomKey) {
    let allActivePlayers = playersList.filter(player => {
        if(player.roomKey === roomKey && player.timeout === 'active') {
            return true;
        } else {
            return false;
        }
    });

    return allActivePlayers;
}