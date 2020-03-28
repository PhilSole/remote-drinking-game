// ==================================================================
//
//  This module handles the waiting room logic
//
// ==================================================================
codrink19.waitingRoom = function() {

    let $formWrap, $form, $playerName;
    let $waitingWrap, $waitingList, $shareWrap, $shareLink, $roomCount, $btnBegin;

    let urlParams, joiningID;
    
    let init = function() {
        
        $formWrap = $body.find('.nickname-form-wrap');
        $form = $formWrap.find('.formPlayer');
        $playerName = $form.find('#playerName');
        $waitingWrap = $body.find('.waiting-list-wrap');
        $waitingList = $waitingWrap.find('#waitingList');
        $shareWrap = $waitingWrap.find('.share-wrap');
        $shareLink = $shareWrap.find('.share-link');
        $roomCount = $waitingWrap.find('.room-count');
        $btnBegin = $waitingWrap.find('.begin');

        // CHecking if this visitor has been sent here via a share link with query param for room ID
        urlParams = new URLSearchParams(window.location.search);
        joiningID = urlParams.get('room');

        console.log(joiningID);

        // Either joining an existing room or creating a new one
        if(joiningID) {
            socket.emit('see waiting room', joiningID);
            $shareWrap.addClass('hide');
        } else {
            console.log('no joining ID');
        }

        $form.on('submit', function(e) {
            e.preventDefault();

            // Get the 'name' value from the form and validate it
            let nickname = $playerName.val();
            if(nickname) {
                // Set local storage values for player ID and name
                localStorage.setItem('playerID', socket.id);
                localStorage.setItem('playerName', nickname);

                if(!joiningID) {

                    // New game so give it an ID
                    let newRoomID = Math.random().toString(36).slice(-6);
                    localStorage.setItem('playerRoom', newRoomID);

                    // Emit a socket event with new player name and room
                    socket.emit('new game request', {name: nickname, room: newRoomID});

                    // Construct the game share link
                    let gameURL = location.protocol + '//' + location.host + '/join?room=' + newRoomID;

                    // Update the view
                    $formWrap.addClass('hide');
                    $waitingList.append('<li>' + nickname + '</li>');
                    $shareLink.val(gameURL);
                    $waitingWrap.addClass('show');
                } else {
                    // Existing game so room given
                    localStorage.setItem('playerRoom', joiningID);

                    // Emit a socket event with new player name and the room to join
                    socket.emit('join room', { name: nickname, room: joiningID });

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

        // Player hasn't actually joined room yet but show other players
        socket.on('current players', function(players) {
            console.log('current players emitted event');

            players.forEach(player => {
                $waitingList.append('<li>' + player['name'] + '</li>');    
            });

            $waitingWrap.addClass('show');
        });

        socket.on('new member', function(players) {
            console.log('new member emitted event with: ', players);

            $waitingList.html('');
            
            players.forEach(player => {
                console.log(player);
                $waitingList.append('<li>' + player['name'] + '</li>');    
            });

            $roomCount.html(players.length + ' players');

            if(players.length > 1) {
                $btnBegin.addClass('show');
            }

        });

        $btnBegin.on('click', function() {
            
        });
        
    }

    return {
        init: init
    } 
}();

