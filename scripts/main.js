// ==================================================================
//
//  This module names some global stuff then kicks off the app
//
// ==================================================================

// Global variable to namespace modules
let codrink19 = {};

// Global DOM variables
let $body;

// Global objects
let socket;

$(document).ready(function() {

    // Assign global DOM variables
    $body = $('body');

    // Initialise modules
    codrink19.connection.init();

    if($body.is('.waiting-room')) {
        codrink19.waitingRoom.init();    
    }
    
});