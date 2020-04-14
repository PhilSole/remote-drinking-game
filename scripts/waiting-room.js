// ==================================================================
//
//  This module handles the waiting room logic
//
// ==================================================================
codrink19.waitingRoom = function() {

    let $headerWrap, $main, $sub;
    let $formWrap, $form, $playerName;
    let $shareStartWrap, $shareLink, $btnBegin;
    let $waitingWrap, $waitingList, $roomCount;
    
    let init = function(roomKey) {
        // Set DOM references  
        
        $headerWrap = $viewWaiting.find('.header-wrap');
        $main = $headerWrap.find('.main');
        $sub = $headerWrap.find('.sub');

        $formWrap = $viewWaiting.find('.nickname-form-wrap');
        $form = $formWrap.find('.formPlayer');
        $feedback = $formWrap.find('.form-feedback');
        $playerName = $form.find('#playerName');

        $shareStartWrap = $viewWaiting.find('.share-start-wrap');
        $shareLink = $shareStartWrap.find('.share-link');
        $btnBegin = $shareStartWrap.find('.begin');

        $waitingWrap = $viewWaiting.find('.waiting-list-wrap');
        $waitingList = $waitingWrap.find('#waitingList');
        $roomCount = $waitingWrap.find('.room-count');
        

        // Either joining an existing room or creating a new one
        if(roomKey) {
            socket.emit('see waiting room', roomKey, function(otherplayers) {
                otherplayers.forEach(player => {
                    $waitingList.append('<li>' + player['nickname'] + '</li>');    
                });
                $waitingWrap.addClass('show-block');
            });

            $main.text("You're connected");
            $sub.text('Enter a nickname to join the player list.');

        } else {
            console.log('no room ID to join');
        }

        $form.on('submit', function(e) {
            e.preventDefault();

            // Get the 'name' value from the form and validate it
            let nickname = $playerName.val();
            if(nickname) {
                if(!roomKey) {

                    // New game so give it an ID
                    let lock = Math.random().toString(36).slice(-6);

                    // Emit a socket event with new player name and room
                    socket.emit('new game request', nickname, lock, function() {
                        // Set in-memory and local storage values for player ID and name
                        setPlayerData(socket.id, nickname, lock);
                    });

                    // Construct the game share link
                    let gameURL = location.protocol + '//' + location.host + '/join?r=' + lock + '&n=' + nickname;

                    // Update the view
                    $formWrap.addClass('hide-me');
                    $waitingList.append('<li>' + nickname + '</li>');
                    $shareLink.text(gameURL).addClass('show-block');
                    $waitingWrap.addClass('show-block');
                    $main.text("Thanks, " + nickname);
                    $sub.text('Share this link with your friends so they can join the game.');
                } else {                        

                    // Emit a socket event with new player name and the room to join
                    socket.emit('join room', nickname, roomKey, function(allPlayers) {
                        // Set local storage values for player ID and name Existing game so room given
                        setPlayerData(socket.id, nickname, roomKey);
                        updateWaitingList(allPlayers);
                    });

                    // Update the view
                    $formWrap.addClass('hide-me');
                }
            } else {
                $feedback.html('But what will we call you?');
                $playerName.one('input', function() {
                    $feedback.html('');
                });
            }
        });
        
        socket.on('new member', function(players) {
            updateWaitingList(players);
        });

        $btnBegin.on('click', function() {
            socket.emit('start game request', playerData.room, function(allPlayers, roomobject, minigames) {
                codrink19.game.init(allPlayers, roomobject, minigames);
            });
        });
        
        socket.on('game start', function(allPlayers, roomobject, minigames) {
            codrink19.game.init(allPlayers, roomobject, minigames);
        });

        $playerName.focus();

        // Waiting room is ready so transition views
        $viewHome.removeClass('active');
        $viewWaiting.addClass('active');


        function setPlayerData(id, nickname, roomKey) {
            playerData.id = id;
            playerData.nickname = nickname;
            playerData.roomKey = roomKey;

            // localStorage.setItem('id', id);
            // localStorage.setItem('nickname', nickname);
            // localStorage.setItem('roomKey', roomKey);
        }

        function updateWaitingList(allPlayers) {
            $waitingList.html('');
            
            allPlayers.forEach(player => {
                $waitingList.append('<li>' + player.nickname + '</li>');    
            });

            $roomCount.html(allPlayers.length + ' players');

            if(allPlayers.length > 1) {
                $btnBegin.addClass('show-block');
            }
        }
    }

    return {
        init: init
    } 
}();

