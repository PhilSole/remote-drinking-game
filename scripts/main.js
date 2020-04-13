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
    initDOMReferences();

    // Check for existing game data in URL or localStorage
    getGameData();

    // If there is game data, modify home
    codrink19.home.init();

    // Initialise socket.io-client
    socket = io();

    // Only direct when the socket connects
    socket.on('connect', (e) => {
        directVisitor();
    });    
    
});

function initDOMReferences() {
    $body = $('body');
    $viewHome = $body.find('.view.home');
    $viewWaiting = $body.find('.view.waiting-room');
    $viewGame = $body.find('.view.game');
    $viewLoading = $body.find('.view.loading');
}

function getGameData() {
    // Check if localStorage values
    playerData.id = localStorage.getItem('id');

    // Check if no local storage ID, check query params for roomKey
    if(!playerData.id) {
        urlParams = new URLSearchParams(window.location.search);
        playerData.roomKey = urlParams.get('r');
    }
}

function directVisitor() {
    console.log('erm');
    // Direct based on data presence
    if(playerData.id) {
        // codrink19.connection.reconnection();    
    } else if(playerData.roomKey) {
        // No local storage but roomKey in query params
    } else {
        // No local storage or roomKey
        codrink19.home.allowNewGame();
    }
}