var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let playerList = [];

// Make the 'public' directory able to serve static assets
app.use(express.static('/public'));

app.get('/', function(req, res){
    //   res.send('<h1>Hello world</h1>');
    console.log('is this happening');
    res.sendFile(__dirname + '/index.html');

});

io.on('connection', function(socket){
    console.log('a new player has entered');
    // console.log(socket);

    // Add the new ID to the player list
    // playerList.push(socket.id);

    // console.log(playerList);

    // io.emit('chat message', msg);

    // socket.on('disconnect', function(){
    //     console.log('user disconnected');
    // });

    // socket.on('chat message', function(msg){
    //     console.log('message: ' + msg);
    //     io.emit('chat message', msg);
    // });

    // socket.broadcast.emit('hi');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

http.listen(3000, function(){
    console.log('listening on *:3000');
});