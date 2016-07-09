function Controller(map, location, character, server, manager, game) {
    this.game = game;
    this.location = location;
    this.map = map;
    this.character = character;
    this.server = server;
    this.manager = manager;
    this.direction = this.NONE;
    this.moveTimer = null;

    server.onConnect(function() {
        server.send(character.dump());
    });
    
    map.setPosition(character.position.x - 7, character.position.y - 7);
    
    if (this.location.data.ship) {
        this.putShip(this.location.data.ship.x, this.location.data.ship.y);
    }
    
    this.setMovementSpeed(this.character.traits.speed);
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
    this.direction = this.LEFT;
    this.startMove();
}
Controller.prototype.right = function() {
    this.direction = this.RIGHT;
    this.startMove();
}
Controller.prototype.up = function() {
    this.direction = this.UP;
    this.startMove();
}
Controller.prototype.down = function() {
    this.direction = this.DOWN;
    this.startMove();
}
Controller.prototype.stop = function() {
    this.direction = this.NONE;
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
            } else if (this.character.class_ === "canoe" && Character.prototype.CHARACTER_TRAITS.isMoveable(p.x, p.y, this.location.tiles)) {
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
        this.characterClass = this.character.class_;
        this.character.setClass("ship");
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
    this.ship = new Character(this.map, "ship", x, y, Character.prototype.RIGHT);
}

Controller.prototype.checkForLocationActions = function(x,y) {
    if (this.location.data.actions) {
        _.forEach(this.location.data.actions, $.proxy(function(action) {
            _.forEach(action.tiles, $.proxy(function(tile) {
                if (x == tile.x && y == tile.y) {
                    if (action.name === "warp") {
                        this.game.warpTo(action.to);
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
    this.stopMove();
    this.moveTimer = setTimeout($.proxy(function() {
        this.characterClass = this.character.class_;
        this.character.setClass("canoe");
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

