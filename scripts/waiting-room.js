// ==================================================================
//
//  This module handles the waiting room logic
//
// ==================================================================
codrink19.waitingRoom = function() {

    let $formWrap, $form, $playerName;
    let $waitingWrap, $waitingList, $shareWrap, $shareLink, $roomCount, $btnBegin;

    let playerData = {};
    
    let init = function(roomID = false) {
        
        $formWrap = $body.find('.nickname-form-wrap');
        $form = $formWrap.find('.formPlayer');
        $playerName = $form.find('#playerName');
        $waitingWrap = $body.find('.waiting-list-wrap');
        $waitingList = $waitingWrap.find('#waitingList');
        $shareWrap = $waitingWrap.find('.share-wrap');
        $shareLink = $shareWrap.find('.share-link');
        $roomCount = $waitingWrap.find('.room-count');
        $btnBegin = $waitingWrap.find('.begin');

        // Initialise socket.io-client
        socket = io();

        // Wait for connection to ensure communication possible
        socket.on('connect', (e) => {
            console.log('client: connect');

            // Either joining an existing room or creating a new one
            if(roomID) {
                socket.emit('see waiting room', roomID, function(otherplayers) {
                    otherplayers.forEach(player => {
                        $waitingList.append('<li>' + player['name'] + '</li>');    
                    });
                    $waitingWrap.addClass('show');
                });

                $shareWrap.addClass('hide');
            } else {
                console.log('no room ID to join');
            }

            $form.on('submit', function(e) {
                e.preventDefault();
    
                // Get the 'name' value from the form and validate it
                let nickname = $playerName.val();
                if(nickname) {
                    if(!roomID) {
    
                        // New game so give it an ID
                        let newRoomID = Math.random().toString(36).slice(-6);

                        // Emit a socket event with new player name and room
                        socket.emit('new game request', {name: nickname, room: newRoomID}, function() {
                            // Set in-memory and local storage values for player ID and name
                            setPlayerData(socket.id, nickname, newRoomID);
                        });
    
                        // Construct the game share link
                        let gameURL = location.protocol + '//' + location.host + '/join?room=' + newRoomID;
    
                        // Update the view
                        $formWrap.addClass('hide');
                        $waitingList.append('<li>' + nickname + '</li>');
                        $shareLink.val(gameURL);
                        $waitingWrap.addClass('show');
                    } else {                        
    
                        // Emit a socket event with new player name and the room to join
                        socket.emit('join room', { name: nickname, room: roomID }, function(players) {
                            // Set local storage values for player ID and name Existing game so room given
                            setPlayerData(socket.id, nickname, roomID);
                            updateWaitingList(players);
                        });
    
                        // Update the view
                        $formWrap.addClass('hide');
                    }
    
    
                } else {
                    $form.find('.form-feedback').html('But what will we call you?');
                    $playerName.one('change', function() {
                        $form.find('.form-feedback').html('');
                    });
                }
            });
            
            socket.on('new member', function(players) {
                updateWaitingList(players);
            });
    
            $btnBegin.on('click', function() {
                socket.emit('start game request', playerData.room, function() {
                    startGame();
                });
            });
            
            socket.on('game start', function() {
                startGame();
            });

        });

        function setPlayerData(id, name, room) {
            playerData.id = id;
            playerData.name = name;
            playerData.room = room;

            localStorage.setItem('playerID', id);
            localStorage.setItem('playerName', name);
            localStorage.setItem('playerRoom', room);
        }

        function updateWaitingList(players) {
            $waitingList.html('');
            
            players.forEach(player => {
                $waitingList.append('<li>' + player['name'] + '</li>');    
            });

            $roomCount.html(players.length + ' players');

            if(players.length > 1) {
                $btnBegin.addClass('show');
            }
        }

        function startGame() {
            codrink19.game.init();

            $viewWaiting.removeClass('active');
            $viewGame.addClass('active');
        }
    }

    return {
        init: init
    } 
}();

