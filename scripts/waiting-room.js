// ==================================================================
//
//  This module handles the waiting room logic
//
// ==================================================================
codrink19.waitingRoom = function() {

    let $formWrap, $form, $playerName;
    let $waitingWrap, $waitingList, $shareLink;
    
    let init = function() {
        
        $formWrap = $body.find('.nickname-form-wrap');
        $form = $formWrap.find('.formPlayer');
        $playerName = $form.find('#playerName');
        $waitingWrap = $body.find('.waiting-list-wrap');
        $waitingList = $waitingWrap.find('#waitingList');
        $shareLink = $waitingWrap.find('.share-link');
        

        $form.on('submit', function(e) {
            e.preventDefault();
            let name = $playerName.val();
            if(name) {
                $formWrap.addClass('hide');
                $waitingList.append('<li>' + name + '</li>');
                let roomID = socket.id;
                let gameURL = location.protocol + '//' + location.host + '/?game=' + socket.id;
                $shareLink.append('<a href="' + gameURL + '">' + gameURL + '</a>');
                $waitingWrap.addClass('show');

                localStorage.setItem('playerID', socket.id);
                localStorage.setItem('playerRoom', socket.id);
                localStorage.setItem('playerName', name);
                socket.emit('new game request', name);
            } else {
                $form.find('.form-feedback').html('But what will we call you?');
                $playerName.one('change', function() {
                    $form.find('.form-feedback').html('');
                });
            }
        });
        
    }

    return {
        init: init
    } 
}();

