
function GameController() {
    this.locationController = null;
    this.enableClassSelectionCallbacks = $.Callbacks();

    new KeyboardController(this);
    new Joystick($(".joystick"), this);
    new CharacterPicker(this);
    
    this.map = new Map($("#background"));
    this.manager = new CharacterManager(this.map);
    
    var protocol = location.protocol === "https:" ? "wss" : "ws";
    this.serverConnection = new ServerConnection(protocol + "://" + window.location.host + "/" + window.location.pathname + "/ws/foobar", guid(), this.manager);
};

GameController.prototype.left = function() {
    this.locationController && this.locationController.left();
}
GameController.prototype.right = function() {
    this.locationController && this.locationController.right();
}
GameController.prototype.up = function() {
    this.locationController && this.locationController.up();
}
GameController.prototype.down = function() {
    this.locationController && this.locationController.down();
}
GameController.prototype.stop = function() {
    this.locationController && this.locationController.stop();
}
GameController.prototype.setClass = function(class_) {
    this.locationController && this.locationController.setClass(class_);
}

GameController.prototype.openCurtains = function() {
    $(".loading-box").hide();
    $(".curtain").height(0);
}

GameController.prototype.closeCurtains = function() {
    $(".curtain").height("50%");
}

GameController.prototype.loadLocation = function(name) {
    this.closeCurtains();
    this.location = new Location(name);
    $.when(this.location.loaded).then($.proxy(function() {

        this.map.setLocation(this.location);

        var startPos = this.location.data.initialPosition;
        var charClass = Character.prototype.classes[Math.floor(Math.random() * 12)];
        this.character = new Character(this.map, charClass, startPos.x, startPos.y);

        this.locationController = new Controller(this.map, this.location, this.character, this.serverConnection, this.manager, this); 

        $.when(whenAllImagesLoaded()).then($.proxy(this.openCurtains, this));

    }, this));
    return this.location;
}
