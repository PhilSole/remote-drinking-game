// ==================================================================
//
//  This module handles the player connections to the game
//
// ==================================================================
codrink19.connection = function() {
    
    let init = function() {
        console.log('This client initiated a new socket connection');

        // Initialise socket.io-client
        socket = io();

        // Check if this is just a reconnection or a new connection
        let playerID = localStorage.getItem('playerID');
        socket.emit('client connection', playerID);

        // Handle if this is a new client
        socket.on('new client', function(playerid){
            console.log('this is a new player so set ID to: ' + playerid);
            localStorage.setItem('playerID', playerid);
        });



        // Handle another new player joining
        socket.on('hi', function(msg){
            alert('a new player has connected');
        });

        // Emit a test event with value
        socket.emit('test', 'my value');    
        
    }

    return {
        init: init
    } 
}();

// ===============================================================================
//
//  Code snippets
//
// ===============================================================================

        // Handle form submission
        // $('form').submit(function(e){
        //     e.preventDefault(); // prevents page reloading
        //     socket.emit('chat message', $('#m').val());
        //     $('#m').val('');
        //     return false;
        // });

        // Handle the 'chat message' event
        // socket.on('chat message out', function(msg){
        //     $('#messages').append($('<li>').text(msg));
        // });