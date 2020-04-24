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
                localStorage.setItem('id', socket.id);

                playerData.id = socket.id;
                playerData.nickname = localStorage.getItem('nickname');
                playerData.roomKey = localStorage.getItem('roomKey');

                if(roomObject.status == 'started') {
                    codrink19.game.init(allPlayers, roomObject, minigames);
                } else {
                    codrink19.waitingRoom.init(roomObject.lock);
                }
                
            } else {
                console.log('the localStorage data doesnt exist on server');
                localStorage.removeItem('id');
                localStorage.removeItem('roomKey');
                localStorage.removeItem('nickname');

                codrink19.home.allowNewGame();
            }

        });      


    }

    return {
        reconnection: reconnection
    }
}();