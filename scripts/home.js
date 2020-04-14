// ==================================================================
//
//  This module handles the home/splash view
//
// ==================================================================
codrink19.home = function() {
    let $announcement, $connectMessage, $connectHeading; 
    let $buttonStart;

    let init = function() {
        // Set DOM references
        $announcement = $viewHome.find('.announcements');
        $connectMessage = $viewHome.find('.connecting-message');
        $connectHeading = $connectMessage.find('.heading');
        $ellipses = $connectMessage.find('.ellipses');
        $buttonStart = $viewHome.find('.button-start');
        $buttonJoin = $viewHome.find('.button-join');

        // Update the splash screen with custom content based on data in URL or localStorage
        updateSplash();
    }

    function updateSplash() {
        if(playerData.id) {
            $connectHeading.text('Reconnecting');
        } else if(playerData.roomKey) {
            roomData.creator = urlParams.get('n');
            if(roomData.creator) {
                $announcement.text(roomData.creator + ' invited you').addClass('show-block');
            } else {
                $announcement.text('Checking your invite').addClass('show-block');
            }
        }
    }

    // Show the new game button when client can connect
    let allowNewGame = function(showMessage) {
        if(!showMessage) {
            $connectMessage.addClass('hide-me');
        }
        
        $buttonStart.addClass('show-block');

        $buttonStart.on('click', function() {
            codrink19.waitingRoom.init();
        });        
    }

    // Show the new game button when client can connect
    let allowJoinGame = function() {
        $connectMessage.addClass('hide-me');
        $buttonJoin.addClass('show-block');

        $buttonJoin.on('click', function() {
            codrink19.waitingRoom.init(playerData.roomKey);
        });        
    }

    let gameNotFound = function() {
        $connectHeading.text('Game not found!');
        if(roomData.creator) {
            $announcement.text(roomData.creator + "'s game has finished");
        } else {
            $announcement.text("Whoops");  
        }
        $ellipses.addClass('hide-me');
        allowNewGame(true);
    }

    return {
        init: init,
        allowNewGame: allowNewGame,
        allowJoinGame: allowJoinGame,
        gameNotFound: gameNotFound
    } 
}();