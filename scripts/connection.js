// ==================================================================
//
//  This module handles player disconnection and reconnection
//
// ==================================================================
codrink19.connection = function() {

    let reconnection = function() {

        socket.emit('request reconnection', playerData.id, function(gameExists, allPlayers, roomObject, minigames) {
            
            if(gameExists) {

            } else {
                console.log('it doesnt');
            }
        });      


    }

    return {
        reconnection: reconnection
    }
}();