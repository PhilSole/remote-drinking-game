// ==================================================================
//
//  This module names some global stuff then kicks off the app
//
// ==================================================================

// Global variable to namespace modules
let codrink19 = {};

// Global DOM variables
let $body;
let $viewHome, $viewWaiting, $viewGame, $viewLoading;

// Global objects
let socket;

let playerData = {};


// Kickoff when the document is ready
$(document).ready(function() {
    console.log('app initialisation');

    // Assign global DOM variables
    $body = $('body');
    $viewHome = $body.find('.view.home');
    $viewWaiting = $body.find('.view.waiting-room');
    $viewGame = $body.find('.view.game');
    $viewLoading = $body.find('.view.loading');

    // Check if query params
    let urlParams = new URLSearchParams(window.location.search);
    playerData.roomKey = urlParams.get('r');

    // Check if localStorage values
    playerData.id = localStorage.getItem('id');

    // Initialise socket.io-client
    socket = io(); 

    socket.on('connect', (e) => {
        if(playerData.id) {
            codrink19.connection.reconnection();    
        }
    });
}); 