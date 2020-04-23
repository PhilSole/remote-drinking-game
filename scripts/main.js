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

// Global layout vars
let windowHeight, windowWidth;

// Global objects
let socket;
let urlParams;
let playerData = {};
let roomData = {};


// Kickoff when the document is ready
$(document).ready(function() {
    // Save global DOM references
    setGlobalDOMVars();

    // window width and height for layout with JS
    setGlobalLayoutVars();

    // Check for existing game data in URL or localStorage. Just enough to direct them and have the data validated.
    getExistingGameData();

    // Initialise socket.io-client
    socket = io();

    // Only direct when the socket connects
    socket.on('connect', (e) => {
        directVisitor();
    });

    // Initialise the home module
    codrink19.home.init();

    // Set global event listeners
    $(window).on('resize', $.debounce( 50, handleResize));
});

function setGlobalDOMVars() {
    $body = $('body');
    $viewHome = $body.find('.view.home');
    $viewWaiting = $body.find('.view.waiting-room');
    $viewGame = $body.find('.view.game');
    $viewLoading = $body.find('.view.loading');
}

function setGlobalLayoutVars() {
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
}

function getExistingGameData() {
    // Check if localStorage values
    playerData.id = localStorage.getItem('id');

    // Check query params for roomKey, if localStorage is expired this might be relevant
    urlParams = new URLSearchParams(window.location.search);
    playerData.roomKey = urlParams.get('r'); // Might be null
}

function directVisitor() {
    // Direct based on data presence
    if(playerData.id) {
        // codrink19.connection.reconnection();  

    } else if(playerData.roomKey) {
        // No local storage but roomKey in query params so new player but room may be started, finished, or waiting.
        // New player always has to go through the waiting room though so they can enter a nickname

        if(playerData.roomKey === 'gameover') {
            codrink19.home.gameNotFound();    
        } else {
            codrink19.home.allowJoinGame();   
        }
        
    } else {
        // No local storage or roomKey
        codrink19.home.allowNewGame();
    }
}

function handleResize() {
    setGlobalLayoutVars();
}