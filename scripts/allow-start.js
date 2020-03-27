// ==================================================================
//
//  This module handles a game being created
//
// ==================================================================
codrink19.allowStart = function() {

    let $buttonStart;
    
    let init = function() {
        $buttonStart = $body.find('.button-start');

        $buttonStart.on('click', function() {

            let gameURL = location.protocol + '//' + location.host + '/?game=new';

            window.location = gameURL;
        });
        
    }

    return {
        init: init
    } 
}();