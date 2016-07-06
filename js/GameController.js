
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
    
    this.setClass(Character.prototype.classes[Math.floor(Math.random() * 12)]);
    
    this.locationStack = [];
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
    this.characterClass = class_;
    this.locationController && this.locationController.setClass(class_);
}

GameController.prototype.openCurtains = function() {
    $(".loading-box").hide();
    $(".curtain").height(0);
}

GameController.prototype.closeCurtains = function() {
    $(".curtain").height("50%");
    var closed = $.Deferred();
    setTimeout(function() {
        closed.resolve();
    }, 1000);
    return closed;
}

GameController.prototype.warpTo = function(name, position) {
    this.enableClassSelectionCallbacks.fire(false);
    if (this.locationController) {
        this.locationController.stop();
        this.locationController = null;
        
        this.locationStack.push({name: this.location.name, position: this.character.getPosition()});
        
        setTimeout($.proxy(this.closeCurtainsAndLoadLocation, this, name, position), 267/this.character.traits.speed);
    } else {
        this.closeCurtainsAndLoadLocation(name, position);
    }
    return this.location;
}

GameController.prototype.loadLocation = function(name, position) {
    this.location = new Location(name);
    $.when(this.location.loaded).then($.proxy(this.doLoadLocation, this));
}

GameController.prototype.doLoadLocation = function(name, position) {
    this.map.setLocation(this.location);
    var startPos = position || this.location.data.initialPosition;
    this.character = new Character(this.map, this.characterClass, startPos.x, startPos.y);
    this.locationController = new Controller(this.map, this.location, this.character, this.serverConnection, this.manager, this); 

    $.when(whenAllImagesLoaded()).then($.proxy(function() {
        this.openCurtains();
        this.enableClassSelectionCallbacks.fire(true);
        setTimeout($.proxy(this.map.setScrollSpeed, this.map, 1), 0);
    }, this));
}

GameController.prototype.closeCurtainsAndLoadLocation = function(name, position) {
    var curtainsClosed = this.closeCurtains();
    this.map.setScrollSpeed(0);
    this.location = new Location(name);
    $.when(curtainsClosed).then($.proxy(function() {
        this.map.clear();
        if(this.character) {
            this.character.remove();
        }
        this.doLoadLocation(name, position);
    }, this));
}

GameController.prototype.warpBack = function() {
    var loc = this.locationStack.pop();
    if (loc) {
        this.warpTo(loc.name, loc.position);
    }
}
