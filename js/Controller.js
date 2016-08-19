function Controller(map, location, character, manager, game) {
    this.game = game;
    this.location = location;
    this.map = map;
    this.character = character;
    this.manager = manager;
    this.direction = this.NONE;
    this.moveTimer = null;

    var protocol = window.location.protocol === "https:" ? "wss" : "ws";
    this.server = new ServerConnection(protocol + "://" + window.location.host + "/" + window.location.pathname + "/ws/?location=" + location.name, guid(), this.manager);
    this.server.onConnect($.proxy(function() {
        this.server.send(character.dump());
    }, this));
    
    map.setPosition(character.position.x - 7, character.position.y - 7);
    
    if (this.location.data.ship) {
        this.putShip(this.location.data.ship.x, this.location.data.ship.y);
    }
    
    this.setMovementSpeed(this.character.traits.speed);
    
    this.dialogBox = new DialogBox(".dialogbox");
    this.dialogBox.dismissedCallbacks.add($.proxy(function() {
        this.game.enableClassSelectionCallbacks.fire(true);
        this.startMove();
    }, this));
};

Controller.prototype.NONE  = 0;
Controller.prototype.UP    = 1;
Controller.prototype.DOWN  = 2;
Controller.prototype.LEFT  = 4;
Controller.prototype.RIGHT = 8;

Controller.prototype.DENSE_FOREST = 2;
Controller.prototype.DOCKABLE = 64;
Controller.prototype.CANOEABLE = 8;

Controller.prototype.startMove = function() {
    if (!this.moveTimer) {
        this.moveTimer = setInterval($.proxy(function() {
            this.move();
        }, this), this.movementTime);
        this.move();
    }
}

Controller.prototype.stopMove = function() {
    if (this.moveTimer) {
        clearInterval(this.moveTimer);
        this.moveTimer=null;
    }
}

Controller.prototype.setMovementSpeed = function(speed) {
    this.movementTime = 267/speed;
}

Controller.prototype.left = function() {
    if (!this.dialogBox.isVisible()) {
        this.direction = this.LEFT;
        this.startMove();
    }
    else {
        this.dialogBox.hide();
    }
}
Controller.prototype.right = function() {
    if (!this.dialogBox.isVisible()) {
        this.direction = this.RIGHT;
        this.startMove();
    }
    else {
        this.dialogBox.hide();
    }
}
Controller.prototype.up = function() {
    if (!this.dialogBox.isVisible()) {
        this.direction = this.UP;
        this.startMove();
    }
    else {
        this.dialogBox.hide();
    }
}
Controller.prototype.down = function() {
    if (!this.dialogBox.isVisible()) {
        this.direction = this.DOWN;
        this.startMove();
    }
    else {
        this.dialogBox.hide();
    }
}
Controller.prototype.stop = function() {
    this.direction = this.NONE;
}

Controller.prototype.action = function() {
    if (this.dialogBox.isVisible()) {
        this.dialogBox.hide();
    } else {
        var action = this.findActionTarget(this.character.getTargetPosition())
        if (action && action.name == "talk") {
            this.showDialog(action.text);
        } else {
            this.showDialog("Nothing here.");
        }
    }
}

Controller.prototype.findActionTarget = function(pos) {
    if (this.manager.findCharacterAt(pos.x, pos.y)) {
        return {name: "talk", text: "I am a bot. Please don't\nstand in my way."};
    }
    else if (this.location.data.actionTargets) {
        return _.find(this.location.data.actionTargets, function(action) {
            return _.find(action.tiles, function(tile) {
                return (pos.x == tile.x && pos.y == tile.y);
            }) !== undefined;
        });
    }
    return null;
}

Controller.prototype.showDialog = function(msg) {
    this.dialogBox.show(msg);
    this.character.stopMoving();
    this.stopMove();
    this.game.enableClassSelectionCallbacks.fire(false);
}

Controller.prototype.move = function() {
    var p = this.character.getPosition();
    this.character.setTruncated(this.location.tiles[p.x][p.y] & this.DENSE_FOREST);
    
    switch (this.direction) {
        case this.LEFT:
            p.x--;
            this.character.moveLeft();
            break;
        case this.UP:
            p.y--;
            this.character.moveUp();
            break;
        case this.RIGHT:
            p.x++;
            this.character.moveRight();
            break;
        case this.DOWN:
            p.y++;
            this.character.moveDown();
            break;
        case this.NONE:
            this.character.stopMoving();
            this.stopMove();
        default:
            return;
    }
    
    if (this.isWithinLocationBoundaries(p.x, p.y) && this.manager.isFree(p.x, p.y)) {
        if (!this.character.traits.isMoveable(p.x, p.y, this.location.tiles)) {
            if (this.ship && _.isEqual(p, this.ship.position)) {
                this.boardShip();
            } else if (this.location.tiles[p.x][p.y] & this.CANOEABLE) {
                this.boardCanoe();
            } else if (this.character.class_ === "chars/canoe" && Character.prototype.CHARACTER_TRAITS.isMoveable(p.x, p.y, this.location.tiles)) {
                this.unboardCanoe();
            } else if (this.location.tiles[p.x][p.y] & this.DOCKABLE) {
                this.unboardShip();
            } else {
                this.character.stopMoving();
                return;
            }
        }
        
        this.character.setPosition(p);
        this.map.setPosition(this.character.position.x - 7, this.character.position.y - 7);
        this.checkForLocationActions(p.x, p.y);
        this.server.send(this.character.dump());
    } else {
        this.character.stopMoving();
    }
}

Controller.prototype.isWithinLocationBoundaries = function(x, y) {
    return x >= 0 || x < this.location.data.extends.x * 16 || y >= 0 || y < this.location.data.extends.y * 15;
}

Controller.prototype.boardShip = function() {
    this.game.enableClassSelectionCallbacks.fire(false);
    this.stopMove();
    this.moveTimer = setTimeout($.proxy(function() {
        if (this.character.class_ !== "chars/canoe") {
            this.characterClass = this.character.class_;
        }
        this.character.setClass("chars/ship");
        this.character.stopMoving();
        this.takeShip();
        this.setMovementSpeed(this.character.traits.speed);
        this.map.setScrollSpeed(this.character.traits.speed);
        this.moveTimer = null;
        this.startMove();
    }, this), this.movementTime);
}

Controller.prototype.unboardShip = function() {
    this.stopMove();
    this.character.setClass(this.characterClass);
    this.putShip(this.character.position.x, this.character.position.y);
    this.map.setScrollSpeed(this.character.traits.speed);
    this.game.enableClassSelectionCallbacks.fire(true);
    this.setMovementSpeed(this.character.traits.speed);
    this.startMove();
}

Controller.prototype.setClass = function(class_) {
    this.character.setClass(class_);
    this.server.send(this.character.dump());
}

Controller.prototype.takeShip = function() {
    this.ship.remove();
    this.ship = null;
}

Controller.prototype.putShip = function(x,y) {
    this.ship = new Character(this.map, "chars/ship", x, y, Character.prototype.RIGHT);
}

Controller.prototype.checkForLocationActions = function(x,y) {
    if (this.location.data.actions) {
        _.forEach(this.location.data.actions, $.proxy(function(action) {
            _.forEach(action.tiles, $.proxy(function(tile) {
                if (x == tile.x && y == tile.y) {
                    if (action.name === "warp") {
                        this.game.warp(action.to);
                    } else if (action.name === "back") {
                        this.game.warpBack();
                    }
                }
            }, this));
        }, this));
    }
}

Controller.prototype.boardCanoe = function() {
    this.game.enableClassSelectionCallbacks.fire(false);
    
    if (this.character.class_ === "chars/ship") {
        this.putShip(this.character.position.x, this.character.position.y);
        this.character.setClass("chars/canoe");
    } else {
        this.characterClass = this.character.class_;
    }
    
    this.stopMove();
    this.moveTimer = setTimeout($.proxy(function() {
        this.character.setClass("chars/canoe");
        this.character.stopMoving();
        this.setMovementSpeed(this.character.traits.speed);
        this.map.setScrollSpeed(this.character.traits.speed);
        this.moveTimer = null;
        this.startMove();
    }, this), this.movementTime);
}

Controller.prototype.unboardCanoe = function() {
    this.stopMove();
    this.character.setClass(this.characterClass);
    this.map.setScrollSpeed(this.character.traits.speed);
    this.game.enableClassSelectionCallbacks.fire(true);
    this.setMovementSpeed(this.character.traits.speed);
    this.startMove();
}

Controller.prototype.close = function() {
    this.server.close();
}
