// ==================================================================
// 
//  This module handles the game
// 
// ==================================================================

codrink19.game = function() {
    // DOM references
    let $nextPlayerName;
    let $mainMessageWrap, $main, $sub;
    let $minigameWrap;
    let $infoButtonWrap, $info, $btnRestart;

    // Logic variables
    let allPlayers, roomObject, minigames;
    let currentPlayer;

    let init = function(thePlayers, theRoom, theMinigames) {
        // The next player in top right
        $nextPlayerName = $viewGame.find('.next-player-name');

        // The main messages at the top middle
        $mainMessageWrap = $viewGame.find('.main-message-wrap');
        $main = $mainMessageWrap.find('.main');
        $sub = $mainMessageWrap.find('.sub');

        // The minigame itself
        $minigameWrap = $viewGame.find('.minigame-wrap');

        // The extra info and restart button
        $infoButtonWrap = $viewGame.find('.info-button-wrap');
        $info = $infoButtonWrap.find('.info');
        $btnRestart = $infoButtonWrap.find('.btn-restart');

        // Set the module scoped variables
        allPlayers = thePlayers;
        roomObject = theRoom;
        minigames = theMinigames;

        // Loop through the players data from the server and set up the turn
        allPlayers.forEach((player, index) => {
            // Find who's turn it is
            if(player['id'] == roomObject.turn) {
                // Set the local current player var
                currentPlayer = player;
                setNextPlayer(index);
            }
        });

        // Check if this client is the current player and carry out the appropriate turn function
        if(currentPlayer.id == playerData.id) {
            thisPlayersTurn();
        } else {
            anotherPlayersTurn();
        }

        // Slide in the game screen
        $viewWaiting.removeClass('active');
        $viewGame.addClass('active');
        
    }

    function setNextPlayer(currentindex) {
        let nextIndex;

        if(currentindex == allPlayers.length - 1) {
            nextIndex = 0;
        } else {
            nextIndex = currentindex + 1;
        }

        if(allPlayers[nextIndex].id == playerData.id) {
            $nextPlayerName.text('You!');    
        } else {
            $nextPlayerName.text(allPlayers[nextIndex].nickname);
        } 
    }

    function thisPlayersTurn() {
        $main.text('Your turn, ' + playerData.nickname);
        $sub.text('Tap anywhere to pick your mini-game');

        $viewGame.addClass('current-player');
    }

    function anotherPlayersTurn() {
        $main.text(currentPlayer.nickname + "'s turn");
        $sub.text('Waiting for, ' + currentPlayer.nickname + ' to pick a mini-game.');
    } 


    // =========================================================
    // Run the turn
    // =========================================================
    function tickerLoop() {
        if(tickerGoing) {

        }
    }


    // =========================================================
    // Helper functions
    // =========================================================
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return {
        init: init
    } 
}();