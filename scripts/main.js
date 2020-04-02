// ==================================================================
//
//  This module names some global stuff then kicks off the app
//
// ==================================================================

// Global variable to namespace modules
let codrink19 = {};

// Global DOM variables
let $body;
let $viewHome, $viewWaiting, $viewGame;

// Global objects
let socket;


// Kickoff when the document is ready
$(document).ready(function() {

    // Assign global DOM variables
    $body = $('body');
    $viewHome = $body.find('.view.home');
    $viewWaiting = $body.find('.view.waiting-room');
    $viewGame = $body.find('.view.game');

    // Check if new game or join game scenario
    let urlParams = new URLSearchParams(window.location.search);
    let roomID = urlParams.get('room');

    if(!roomID) {
        codrink19.welcome.init();    
    } else {
        codrink19.waitingRoom.init(roomID);

        $viewHome.removeClass('active');
        $viewWaiting.addClass('active');
    }    
});