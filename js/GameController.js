
function GameController() {
    this.locationController = null;
    this.enableClassSelectionCallbacks = $.Callbacks();
    this.enableActionsCallbacks = $.Callbacks();

    new KeyboardController(this);
    new Joystick($(".joystick"), this);
    new CharacterPicker(this);
    new ActionButton(this);
    
    this.map = new Map($("#background"));
    this.manager = new CharacterManager(this.map);
    
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
GameController.prototype.action = function() {
    this.locationController && this.locationController.action();
}

GameController.prototype.openCurtains = function() {
    $(".loading-box").hide();
    $(".curtain").height(0);
    var done = $.Deferred();
    setTimeout(function() {
        done.resolve();
    }, 1000);
    return done;
}

GameController.prototype.closeCurtains = function() {
    $(".curtain").height("50%");
    var closed = $.Deferred();
    setTimeout(function() {
        closed.resolve();
    }, 1000);
    return closed;
}

GameController.prototype.warp = function(name, position, stack) {
    this.warpTo(name, null, true);
}

GameController.prototype.warpTo = function(name, position, stack) {
    this.enableClassSelectionCallbacks.fire(false);
    this.locationController.stop();
    this.locationController.close();
    this.locationController = null;

    if (stack) {
        this.locationStack.push({name: this.location.name, position: this.character.getPosition()});
    }
    
    setTimeout($.proxy(this.closeCurtainsAndLoadLocation, this, name, position), 267/this.character.traits.speed);
}

GameController.prototype.loadLocation = function(name, position) {
    this.location = new Location(name);
    $.when(this.location.loaded).then($.proxy(this.doLoadLocation, this));
}

GameController.prototype.doLoadLocation = function(name, position) {
    this.map.setLocation(this.location);
    var startPos = position || this.location.data.initialPosition;
    this.character = new Character(this.map, this.characterClass, startPos.x, startPos.y);
    var loc = new Controller(this.map, this.location, this.character, this.manager, this); 

    $.when(whenAllImagesLoaded()).then($.proxy(function() {
        $.when(this.openCurtains()).then($.proxy(function () {
            this.enableClassSelectionCallbacks.fire(true);
            setTimeout($.proxy(this.map.setScrollSpeed, this.map, 1), 0);
            this.locationController = loc;
        }, this));
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
        this.warpTo(loc.name, loc.position, false);
    }
    else {
        throw new Error("no previous location");
    }
}
