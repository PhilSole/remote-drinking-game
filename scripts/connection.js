// ==================================================================
//
//  This module handles player disconnection and reconnection
//
// ==================================================================
codrink19.connection = function() {

    let reconnection = function() {

        socket.emit('request reconnection', playerData.id, function(gameExists, allPlayers, roomObject, minigames) {
  
            console.log('attempting to reconnect');

            if(gameExists) {

                playerData.id = localStorage.getItem('id');
                playerData.nickname = localStorage.getItem('nickname');
                playerData.roomKey = localStorage.getItem('roomKey');
                
                codrink19.waitingRoom.init(roomObject.lock, roomObject, allPlayers, minigames);

            } else {
                console.log('the localStorage data doesnt exist on server');
                localStorage.removeItem('id');
                localStorage.removeItem('roomKey');
                localStorage.removeItem('nickname');

                codrink19.home.gameNotFound();
            }

        });      


    }

    return {
        reconnection: reconnection
    }
}();