// ==================================================================
//
//  This module handles a game being created
//
// ==================================================================
codrink19.startGame = function() {

    let $buttonStart;
    
    let init = function() {
        $buttonStart = $body.find('.button-start');

        $buttonStart.on('click', function() {

            let roomID = socket.id;

            console.log(location.host);

            let gameURL = location.host + '/?room=' + socket.id;

            console.log(gameURL);

        });
        
    }

    return {
        init: init
    } 
}();