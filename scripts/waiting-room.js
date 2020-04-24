// ==================================================================
//
//  This module handles the waiting room logic
//
// ==================================================================
codrink19.waitingRoom = function() {

    let $headerWrap, $main, $sub;
    let $formWrap, $form, $playerName;
    let $shareStartWrap, $shareLinkWrap, $shareLink, $btnBegin;
    let $waitingWrap, $waitingList, $roomCount;

    let roomKey, roomObject, allPlayers, minigames;
    
    let init = function(theRoomKey, theRoomObject, thePlayers, theMinigames) {
        roomKey = theRoomKey;
        roomObject = theRoomObject;
        allPlayers = thePlayers;
        minigames = theMinigames;

        // Set DOM references
        setWaitingDOMvars();

        // Either joining an existing room or creating a new one
        checkExistingCredentials();
        
        // set UI interaction listeners
        setUIEventListeners();

        // listen for socket events
        setSocketListeners();

        // show the waiting room view
        showWaitingRoom();   

        $playerName.focus();
    }

    function setWaitingDOMvars() {
        $headerWrap = $viewWaiting.find('.header-wrap');
        $main = $headerWrap.find('.main');
        $sub = $headerWrap.find('.sub');

        $formWrap = $viewWaiting.find('.nickname-form-wrap');
        $form = $formWrap.find('.formPlayer');
        $feedback = $formWrap.find('.form-feedback');
        $playerName = $form.find('#playerName');

        $shareStartWrap = $viewWaiting.find('.share-start-wrap');
        $shareLinkWrap = $shareStartWrap.find('.share-link-wrap');
        $shareLink = $shareStartWrap.find('#shareLink');
        $btnCopy = $shareStartWrap.find('.link-copy');
        $btnBegin = $shareStartWrap.find('.begin');

        $waitingWrap = $viewWaiting.find('.waiting-list-wrap');
        $waitingList = $waitingWrap.find('#waitingList');
        $roomCount = $waitingWrap.find('.room-count');        
    }

    function checkExistingCredentials() {
        if(roomObject) {

            $formWrap.addClass('hide-me');
            $main.text("You're reconnected");

            if(roomObject.status == 'started') {
                codrink19.game.init(allPlayers, roomObject, minigames);
            } else {
                // Construct the game share link
                let gameURL = location.host + '/join?r=' + roomObject.lock + '&n=' + encodeURI(playerData.nickname);

                $shareLink.text(gameURL);
                $shareLinkWrap.addClass('show-flex');
                $sub.text('Share this link with your friends so they can join the game.').addClass('show-block');                
            }

        } else if(roomKey) {

            $main.text("You're connected");
            $sub.text('Enter a nickname to join the player list.').addClass('show-block');

            seeWaitingRoom();
        }
    }

    function seeWaitingRoom() {
        socket.emit('see waiting room', roomKey, function(otherplayers, roomObject) {
            otherplayers.forEach(player => {
                $waitingList.append('<li>' + player.nickname + '</li>');    
            });
            
            if(roomObject.status == 'started') {
                $roomCount.append(' (game has started)');    
            }

            $waitingWrap.addClass('show-block');
        });
    }

    function setUIEventListeners() {
        // Listen for successful nickname submission and call to create new game
        $form.on('submit', function(e) {
            e.preventDefault();

            let nickname = validateNickname();

            if(!roomKey) {
                createNewGame(nickname);
            } else {
                joinGame(nickname);
            }
        });

        // Set up copy button with clipboard.js library
        let clipboard = new ClipboardJS('.link-copy');
        
        // Listen for start button click
        $btnBegin.on('click', function() {
            socket.emit('start game request', playerData.roomKey);
        });
    }

    function validateNickname() {
        let nickname = $playerName.val();
        let regexp = /^[a-z 0-9]+$/gmi;

        if(!regexp.test(nickname)) {
            if(nickname.length === 0) {
                $feedback.html('But what will I call you?');   
            } else {
                $feedback.html('Maximum 20 letters (Latin), numbers, and spaces sorry.');
            }
            
            $playerName.one('input', function() {
                $feedback.html('');
            });
        } else {
            return nickname;
        }        
    }

    function createNewGame(nickname) {
        if(!nickname) return;

        // New game so give it an ID
        let lock = Math.random().toString(36).slice(-6);

        // Emit a socket event with new player name and room
        socket.emit('new game request', nickname, lock, function() {
            // Set in-memory and local storage values for player ID and name
            setPlayerData(socket.id, nickname, lock);
        });

        // Construct the game share link
        let gameURL = location.host + '/?r=' + lock + '&n=' + encodeURI(nickname);

        // Update the view
        $formWrap.addClass('hide-me');
        $waitingList.append('<li>' + nickname + '</li>');
        $shareLink.text(gameURL);
        $shareLinkWrap.addClass('show-flex');
        $waitingWrap.addClass('show-block');
        $main.text("All set, " + nickname);
        $sub.text('Share this link with your friends so they can join the game.').addClass('show-block');
    }
    
    function joinGame(nickname) {
        if(!nickname) return;

        // Emit a socket event with new player name and the room to join
        socket.emit('join room', nickname, roomKey, function(allPlayers, theRoomObject, theMinigames) {
            // Set local storage values for player ID and name Existing game so room given
            roomObject = theRoomObject;
            minigames = theMinigames;
            setPlayerData(socket.id, nickname, roomKey);
            updateWaitingList(allPlayers); // Shows begin button if more than one player
            $main.text("You're in, " + nickname);

            if(roomObject.status == 'started') {
                codrink19.game.init(allPlayers, roomObject, minigames);
            } else {
                $sub.text('You can wait for more players or start the game.');
                $btnBegin.addClass('show-block');
            }
        });

        // Update the view
        $formWrap.addClass('hide-me'); 
    }    

    function setSocketListeners() {
        // A new member has joined the room so update the view
        socket.on('new member', function(allPlayers) {
            let newPlayer = allPlayers[allPlayers.length - 1].nickname;
            updateWaitingList(allPlayers);
            $main.text(newPlayer + " joined!");

            if(allPlayers.length > 1) {
                $sub.text('You can wait for more players or start the game.');
                $btnBegin.addClass('show-block');
            }
        });
        
        // The game is being started so init the game
        socket.on('game start', function(allPlayers, roomObject, minigames) {
            codrink19.game.init(allPlayers, roomObject, minigames);
        });
    }

    function setPlayerData(id, nickname, roomKey) {
        playerData.id = id;
        playerData.nickname = nickname;
        playerData.roomKey = roomKey;

        localStorage.setItem('id', id);
        localStorage.setItem('nickname', nickname);
        localStorage.setItem('roomKey', roomKey);
    }

    function updateWaitingList(allPlayers) {
        $waitingList.html('');
        
        allPlayers.forEach(player => {
            $waitingList.append('<li>' + player.nickname + '</li>');    
        });

        $roomCount.html(allPlayers.length + ' players');
    }

    function showWaitingRoom() {
        // Waiting room is ready so transition views
        $viewHome.removeClass('active');
        $viewWaiting.addClass('active');
    }

    return {
        init: init
    } 
}();

