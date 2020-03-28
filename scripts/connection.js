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
        let playerRoom = localStorage.getItem('playerRoom');
        if(playerRoom) { 
            socket.emit('credentials', playerRoom); 
        } else {
            codrink19.allowStart.init();
        }

    }

    return {
        init: init
    } 
}();