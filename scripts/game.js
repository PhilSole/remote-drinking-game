// ==================================================================
//
//  This module handles the game
//
// ==================================================================
codrink19.game = function() {
    let $currentPlayerName, $nextPlayerName, $yourTurnMessage, $waitingForMessage;

    let allPlayers, currentPlayer, nextPlayer;

    let subgames;

    let init = function(players, room, minigames) {
        console.log(players, room, minigames);

        $currentPlayerName = $viewGame.find('.current-player-name');
        $nextPlayerName = $viewGame.find('.next-player-name');
        $yourTurnMessage = $viewGame.find('.your-turn-message');
        $waitingForMessage = $viewGame.find('.waiting-for-message');

        allPlayers = players;
        subgames = minigames;

        // Loop through the players data from the server and set up the turn
        players.forEach((player, index) => {
            // Find who's turn it is
            if(player['id'] == room['turn']) {
                // Set the local current player var
                currentPlayer = player;
                setNextPlayer(index);
            }
        });

        if(currentPlayer.id == playerData.id) {
            thisPlayersTurn();
        } else {
            anotherPlayersTurn();
        }


        $viewWaiting.removeClass('active');
        $viewGame.addClass('active');
        
    }

    function anotherPlayersTurn() {
        console.log('another players turn');
        $currentPlayerName.text(currentPlayer.name);
        $waitingForMessage.addClass('show');
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
            $nextPlayerName.text(allPlayers[nextIndex].name);
        } 
    }




// ALL HELL BREAKS LOOSE HERE..... for now

    
    $btnPause = $('.container-subgame');
    $subGameDescription = $btnPause.find('.description');
    $subGamePara = $subGameDescription.find('p');
    $subGameName = $btnPause.find('.name');


    let gameLength;

    function thisPlayersTurn() {
        console.log('this players turn');
        $currentPlayerName.text('You!');
        $yourTurnMessage.addClass('show');

        gameLength = subgames.length;
        console.log(gameLength);

        animateEverything();


    }

    let currentGame = {};
    currentGame.going = true;
    let newNumber, newSubgame, newCategory;

    function animateEverything() {
        if(currentGame.going) {
            newNumber = getRandomInt(0, gameLength - 1);
            newSubgame = subgames[newNumber];
            newCategory = newSubgame.details.category;

            var newMain = newSubgame.name;
            var newSub = newSubgame.details.description;

            $subGameName.html(newMain);
            $subGamePara.html(newSub);

            animateLoopTimeout = setTimeout(animateEverything, 200);    
        }   
    }
    
    $btnPause.on('click', handlePause);

    function handlePause(event) {
        
        if(currentGame.going){
  

                $subGameDescription.addClass('show-me');
                $subGameName.addClass('animate-me');
                // $gamePage.addClass('subgame-selected');
                // perfectScroll = new PerfectScrollbar('.page-game .description p');

                // Data
                currentGame.going = false;

          

        } else {
            if(!$(event.target).is('.btn')) {
                $subGameDescription.removeClass('show-me');
                // $gamePage.removeClass('subgame-selected');
                $subGameName.removeClass('animate-me');

                currentGame.going = true;
                animateEverything();               

            }                
        }  
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    return {
        init: init
    } 
}();