$(function(){
    function adjust() {
        $("body").css("margin-top", ($("body").height() - $(".main-panel").height())/2);
    }
    $(window).resize(adjust);
    adjust();

    window.game = new GameController();
    var loc = game.loadLocation("world");
});
