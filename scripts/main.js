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
let urlParams;
let playerData = {};
let roomData = {};


// Kickoff when the document is ready
$(document).ready(function() {
    // Save global DOM references
    initGlobalDOMVars();

    // Check for existing game data in URL or localStorage
    getExistingGameData();

    // Initialise socket.io-client
    socket = io();

    // Only direct when the socket connects
    socket.on('connect', (e) => {
        directVisitor();
    });

    // Initialise the home module
    codrink19.home.init(); 
    
});

function initGlobalDOMVars() {
    $body = $('body');
    $viewHome = $body.find('.view.home');
    $viewWaiting = $body.find('.view.waiting-room');
    $viewGame = $body.find('.view.game');
    $viewLoading = $body.find('.view.loading');
}

function getExistingGameData() {
    // Check if localStorage values
    playerData.id = localStorage.getItem('id');

    // Check if no local storage ID, check query params for roomKey
    if(!playerData.id) {
        urlParams = new URLSearchParams(window.location.search);
        playerData.roomKey = urlParams.get('r');
    }
}

function directVisitor() {
    // Direct based on data presence
    if(playerData.id) {
        // codrink19.connection.reconnection();  

    } else if(playerData.roomKey) {
        // No local storage but roomKey in query params so new player but room may be started, finished, or waiting.
        // New player always has to go through the waiting room though
        roomData.status = urlParams.get('s');

        switch (roomData.status) {
            case 'waiting':
                console.log('waiting status');
                codrink19.home.allowJoinGame();
                break;
            case 'started':
                console.log('started status');
                // codrink19.game.init();
                break;
            default:
                codrink19.home.gameNotFound();
                break;
        }
        
    } else {
        // No local storage or roomKey
        codrink19.home.allowNewGame();
    }
}