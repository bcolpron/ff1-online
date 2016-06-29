$(function(){
    function adjust() {
        $("body").css("margin-top", ($("body").height() - $(".main-panel").height())/2);
    }
    $(window).resize(adjust);
    adjust();

    var area = $("#background");
    
    window.game = new GameController();
    new KeyboardController(game);
    new Joystick($(".joystick"), game);
    var picker = new CharacterPicker(game);
    
    
    window.map = new Map(area);
    window.manager = new CharacterManager(map);
    
    var loc = new Location("world");
    map.setLocation(loc);
    
    var charClass = Character.prototype.classes[Math.floor(Math.random() * 12)];
    window.character = new Character(map, charClass, 153, 165);
    
    var protocol = location.protocol === "https:" ? "wss" : "ws";
    window.ws = new ServerConnection(protocol + "://" + location.host + "/" + location.pathname + "/ws/foobar", guid(), manager);

    window.controller = new Controller(map, character, ws, manager, game); 
    game.setController(controller);
    
    
    // todo: fix me
    window.controller.classPicker = picker;

    $.when(location.loaded, whenAllImagesLoaded()).then(function() {
        $(".loading-box").hide();
        $(".curtain").height(0);
    });
});
