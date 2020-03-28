var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
const shortid = require('shortid');

let playersList = [];
let roomsList = [];

// Make the 'public' directory able to serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'socket.io')));

// Handle request to root
app.get('/', function(req, res){
    let reqRoom = req.query.room;

    if(!reqRoom) {
        res.sendFile(__dirname + '/views/index.html');
    } else {
        console.log('the root one');

        res.sendFile(__dirname + '/views/waiting-room.html');
    }

});

// Handle request for new game
app.get('/new-game', function(req, res){
    res.sendFile(__dirname + '/views/waiting-room.html');
});

// Handle request to join game
app.get('/join', function(req, res){
    let reqRoom = req.query.room;

    console.log('the join root here');

    res.sendFile(__dirname + '/views/waiting-room.html');
    res.redirect('/?room=' + reqRoom);
});



// setInterval(() => {
//     console.log(playersList, roomsList);
// }, 10000);

// Handle a connection to the app. 
// Create a new player OR
// Match it to an existing player if it's a reconnection.
io.on('connection', function(socket){
    console.log('a connection was detected ID: ' + socket.id);

    // New game requested from the waiting room by new player
    socket.on('new game request', function(data){

        console.log('new game requested so push data to server arrays');
        let name = data['name'];
        let room = data['room'];

        playersList.push({id:socket.id, name:name, room:room, turn:'true'});
        roomsList.push(room);

        socket.join(room);

        console.log(playersList, roomsList);

    });

    // A player enters the waiting room and can see who's there
    socket.on('see waiting room', function(room){
        console.log(room);

        let otherPlayers = playersList.filter(player => player['room'] === room);
        
        console.log(otherPlayers);

        socket.emit('current players', otherPlayers);   
    });

    // Joining player has submitted name to actually join the room
    socket.on('join room', function(data){
        console.log('actually joining room with name');
        let name = data['name'];
        let room = data['room'];

        console.log(name, room, 'will these work?');

        playersList.push({id:socket.id, name:name, room:room, turn:'false'});

        console.log(playersList);

        socket.join(room);
        socket.emit('new member', playersList);
        socket.to(room).emit('new member', playersList);

    });

    socket.on('credentials', function(playerRoom){
        console.log('there are some credentials');

    });

    // Handle user disconnecting
    socket.on('disconnect', function(){
        console.log('user disconnected with ID: ' + socket.id);



    }); 


    // Broadcast connection to OTHER clients
    // TODO: check if this is just a reconnection with stored values for user
    socket.broadcast.emit('hi');


    // Handle a test event from a client
    socket.on('test', function(msg){
        console.log('message: ' + msg);
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