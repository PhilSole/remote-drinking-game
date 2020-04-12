// ==================================================================
//
//  This module handles player disconnection and reconnection
//
// ==================================================================
codrink19.connection = function() {

    let reconnection = function() {
        console.log('attempting reconnection');

        socket.emit('request reconnection', playerData.id, function(gameExists) {
            
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