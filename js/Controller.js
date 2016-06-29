function Controller(map, character, server, manager) {
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
    this.putShip(210, 153);
};

Controller.prototype.NONE  = 0;
Controller.prototype.UP    = 1;
Controller.prototype.DOWN  = 2;
Controller.prototype.LEFT  = 4;
Controller.prototype.RIGHT = 8;

Controller.prototype.DENSE_FOREST = 2;
Controller.prototype.DOCKABLE = 64;

Controller.prototype.startMove = function() {
    if (!this.moveTimer) {
        var that = this;
        this.moveTimer = setInterval(function() {
            that.move();
        }, 267/this.character.traits.speed);
        this.move();
    }
}

Controller.prototype.stopMove = function() {
    if (this.moveTimer) {
        clearInterval(this.moveTimer);
        this.moveTimer=null;
    }
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
    
	function normalize(p) {
		p = {x: p.x, y: p.y};
		
		if (p.x < 0) p.x += 256;
		else if (p.x >= 256) p.x -= 256;
		
		if (p.y < 0) p.y += 255;
		else if (p.y >= 255) p.y -= 255;
		
		return p;
	};
	p = normalize(p);

    if (character.traits.isMoveable(p.x, p.y, this.map.location.tiles)
        && this.manager.isFree(p.x, p.y)) {
    } else if (this.ship && _.isEqual(p, this.ship.position)) {
        this.boardShip();
        this.stopMove();
    } else if (this.map.location.tiles[p.x][p.y] & this.DOCKABLE) {
        this.unboardShip();
        this.stopMove();
    } else {
        p = this.character.getPosition();
        this.character.stopMoving();
    }
    
    if (this.map.location.tiles[p.x][p.y] & this.DENSE_FOREST) {
        var that = this;
        setTimeout(function() {that.character.setTruncated(true);}, 267/this.character.traits.speed);
    } else {
        this.character.setTruncated(false);
    }
        
    this.character.setPosition(p);
    this.map.setPosition(this.character.position.x - 7, this.character.position.y - 7);
    
    this.server.send(this.character.dump());
}

Controller.prototype.boardShip = function() {
    this.characterClass = this.character.class_;
    this.character.setClass("ship");
    this.character.stopMoving();
    this.takeShip();
    this.map.setScrollSpeed(this.character.traits.speed);
    this.classPicker.enable(false);
}

Controller.prototype.unboardShip = function() {
    this.character.setClass(this.characterClass);
    this.putShip(this.character.position.x, this.character.position.y);
    this.map.setScrollSpeed(this.character.traits.speed);
    this.classPicker.enable(true);
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