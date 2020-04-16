// ==================================================================
// 
//  This module handles the game
// 
// ==================================================================

codrink19.game = function() {
    // DOM references
    let $nextPlayerName;
    let $mainMessageWrap, $main, $sub;
    let $minigameWrap, $minigameTitle, $minigameDescription;
    let $infoButtonWrap, $info, $btnRestart;

    // Logic variables
    let allPlayers, roomObject, minigames;
    let currentPlayer;
    let newMinigame;

    let init = function(thePlayers, theRoom, theMinigames) {
        // Set the module scoped variables
        allPlayers = thePlayers;
        roomObject = theRoom;
        minigames = theMinigames;

        // Link the DOM elements to vars
        setDOMVars();

        // Loop through the players data from the server and find the current player
        setCurrentPlayer();

        // Check if this client is the current player and carry out the appropriate turn function
        runTheTurn();

        // Set the socket listeners for game events
        setSocketListeners();

        // Slide in the game screen
        showViewGame();
    }

    function setDOMVars() {
        // The next player in top right
        $nextPlayerName = $viewGame.find('.next-player-name');

        // The main messages at the top middle
        $mainMessageWrap = $viewGame.find('.main-message-wrap');
        $main = $mainMessageWrap.find('.main');
        $sub = $mainMessageWrap.find('.sub');

        // The minigame itself
        $minigameWrap = $viewGame.find('.minigame-wrap');
        $minigameTitle = $minigameWrap.find('.title');
        $minigameDescription = $minigameWrap.find('.description');

        // The extra info and restart button
        $infoButtonWrap = $viewGame.find('.info-button-wrap');
        $info = $infoButtonWrap.find('.info');
        $btnPassTurn = $infoButtonWrap.find('.btn-pass-turn');
        $btnRestart = $infoButtonWrap.find('.btn-restart');
    }

    function setCurrentPlayer() {
        allPlayers.forEach((player, index) => {
            // Find who's turn it is
            if(player.id == roomObject.turn) {
                // Set the local current player var
                currentPlayer = player;
                setNextPlayer(index);
            }
        });
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

    function runTheTurn() {
        // Use the roomObject param's history to set the available minigames and historical minigames
        setMinigames();

        // Start the ticker loop that repeatedly updates the minigame title
        tickerGoing = true;
        runTicker();

        // Decide this client's role in the turn
        if(currentPlayer.id == playerData.id) {
            thisPlayersTurn();
        } else {
            anotherPlayersTurn();
        }
    }

    function thisPlayersTurn() {
        // Update the main text for the current player
        $main.text('Your turn, ' + playerData.nickname);
        $sub.text('Tap anywhere to pick your mini-game').removeClass('hide-me');;

        // Add a class to the view making it interactive for the current player
        // $viewGame.addClass('current-player');

        // Add a listener to the screen for this player's click to pick a minigame
        $viewGame.one('click', () => {
            tickerGoing = false;
            $minigameDescription.text(newMinigame.details.description).addClass('show-block');
            $mainMessageWrap.addClass('hide-me');

            socket.emit('player pick', newMinigame.key, playerData.roomKey);

            setTimeout(() => {
                $btnPassTurn.addClass('show-inline-block');

                $btnPassTurn.one('click', () => {
                    console.log('clicked to pass turn');
                    socket.emit('pass turn', playerData.roomKey);    
                });
            }, 3000);
        });
    }

    function anotherPlayersTurn() {
        // Update the main text as a spectating player
        $main.text(currentPlayer.nickname + "'s turn");
        $sub.text('Waiting for ' + currentPlayer.nickname + ' to pick a mini-game.');
    } 


    // =========================================================
    // Run the turn
    // =========================================================    
    let minigamesAvailable = [];
    let minigamesHistory = [];

    function setMinigames() {
        if(roomObject.history) {
            minigamesAvailable = minigames.filter(minigame => roomObject.history.indexOf(minigame.key) === -1);
            minigamesHistory = minigames.filter(minigame => roomObject.history.indexOf(minigame.key) >= 0);
        } else {
            minigamesAvailable = minigames;
        }
    }

    let tickerGoing;
    function runTicker() {
        if(tickerGoing) {
            // Pick a random minigame
            let newIndex = getRandomInt(0, minigamesAvailable.length - 1);
            newMinigame = minigamesAvailable[newIndex];

            // Update the minigame title
            $minigameTitle.text(newMinigame.name);

            // Repeat very fast
            setTimeout(() => {
                runTicker();
            }, 300);
        }
    }

    function setSocketListeners() {
        // when another player makes a pick
        socket.on('player pick', function(minigameKey) {

            tickerGoing = false;
            newMinigame = minigames.find(minigame => minigame.key === minigameKey);


            $minigameTitle.text(newMinigame.name);
            $minigameDescription.text(newMinigame.details.description).addClass('show-block');

            $main.text(currentPlayer.nickname + ' picked:');
            $sub.addClass('hide-me');

        });

        // when another player makes a pick
        socket.on('pass turn', function(thePlayers, theRoom) {
            allPlayers = thePlayers;
            roomObject = theRoom;

            setCurrentPlayer();
            runTheTurn();

            $btnPassTurn.removeClass('show-inline-block');
            $minigameDescription.removeClass('show-block');
            $mainMessageWrap.removeClass('hide-me');
        });
    }


    // =========================================================
    // Helper functions
    // =========================================================
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function showViewGame() {
        $viewWaiting.removeClass('active');
        $viewGame.addClass('active');
    }

    return {
        init: init,
        setMinigames: setMinigames
    } 
}();