// ==================================================================
//
//  This module handles the home/splash view
//
// ==================================================================
codrink19.home = function() {
    let $connectMessage, $connectHeading, $connectText; 
    let $buttonStart;

    let init = function() {
        // Set DOM references
        $connectMessage = $body.find('.connecting-message');
        $connectHeading = $connectMessage.find('.heading');
        $connectText = $connectMessage.find('.message');
        
        // Update the splash screen with custom content based on data in URL or localStorage
        if(playerData.id) {
            $connectHeading.text('Reconnecting');
            $connectText.text('Attempting to get you back in.').addClass('show-block');
        } else if(playerData.roomKey) {
            roomData.creator = urlParams.get('n');
            if(roomData.creator) {
                $connectText.text('Connecting to game started by ' + roomData.creator).addClass('show-block');
            }
        }
    }

    // Show the new game button when client can connect
    let allowNewGame = function() {
        $buttonStart = $body.find('.button-start');

        $connectMessage.addClass('hide-me');
        $buttonStart.addClass('show-block');

        $buttonStart.on('click', function() {
            codrink19.waitingRoom.init();
        });        
    }

    return {
        init: init,
        allowNewGame: allowNewGame
    } 
}();