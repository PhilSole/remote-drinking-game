// ==================================================================
//
//  This module handles new visitors who are not joining another game
//
// ==================================================================
codrink19.welcome = function() {
    let $buttonStart;

    let init = function() {

        $buttonStart = $body.find('.button-start');

        $buttonStart.on('click', function() {
            codrink19.waitingRoom.init();
        });
    }

    return {
        init: init
    } 
}();