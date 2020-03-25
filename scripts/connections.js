// ==================================================================
//
//  This module handles the player connections to the game
//
// ==================================================================
codrink19.connections = function() {
    
    let socket;

    let init = function() {
        console.log('hello from connections js');

        socket = io();

        // Handle form submission
        $('form').submit(function(e){
            e.preventDefault(); // prevents page reloading
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        });

        // Handle the 'chat message' event
        socket.on('chat message', function(msg){
            $('#messages').append($('<li>').text(msg));
        });
    }

    return {
        init: init
    } 
}();