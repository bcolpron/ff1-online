function Character(map, class_, x, y, direction) {
    this.map = map;
    this.position = {x:x, y:y};
    this.class_ = null;
    this.sprites = $('<div class="character"/>');
    this.map.add(this.sprites);
    this.setClass(class_);
    this.setPosition(x,y);
    this.setDirection(direction || 0);
}

Character.prototype.DOWN = 0;
Character.prototype.UP       = 1;
Character.prototype.LEFT    = 2;
Character.prototype.RIGHT  = 3;
Character.prototype.ANIM    = 4;
Character.prototype.classes = ["chars/fi", "chars/bb", "chars/th", "chars/wm", "chars/bm", "chars/rm",
                               "chars/kn", "chars/ma", "chars/ni", "chars/ww", "chars/bw", "chars/rw",
                               "chars/ship", "chars/canoe"];

Character.prototype.WALKABLE = 1;
Character.prototype.SAILABLE = 4;
Character.prototype.CANOEABLE = 8;

Character.prototype.CHARACTER_TRAITS = {
    verticalAdjustment: -6,
    speed: 1,
    zIndex: 3,
    isMoveable(x,y, tiles) {
        return tiles[x][y] & Character.prototype.WALKABLE;
    }
};

Character.prototype.SHIP_TRAITS = {
    verticalAdjustment: -2,
    speed: 2,
    zIndex: 1,
    isMoveable(x,y, tiles) {
        return tiles[x][y] & Character.prototype.SAILABLE;
    }
};

Character.prototype.CANOE_TRAITS = {
    verticalAdjustment: 0,
    speed: 1,
    zIndex: 1,
    isMoveable(x,y, tiles) {
        return tiles[x][y] & Character.prototype.CANOEABLE;
    }
};

Character.prototype.setClass = function(class_) {
    if (this.class_ === class_) {
        return;
    }
    
    if (class_.startsWith("chars/") && !this.classes.find(function(e) { return e === class_; })) {
         throw new Error("invalid character class");
    }
    this.class_ = class_;
    
   var html = '<img class="sprite" src="images/' + this.class_ + '.gif" style="">\
        <img class="sprite" src="images/' + this.class_ + 'up.gif" style="display: none">\
        <img class="sprite" src="images/' + this.class_ + 'left.gif" style="display: none">\
        <img class="sprite" src="images/' + this.class_ + 'right.gif" style="display: none">\
        <img class="sprite" src="images/' + this.class_ + 'ani.gif" style="display: none">\
        <img class="sprite" src="images/' + this.class_ + 'aniup.gif" style="display: none">\
        <img class="sprite" src="images/' + this.class_ + 'anileft.gif" style="display: none">\
        <img class="sprite" src="images/' + this.class_ + 'aniright.gif" style="display: none">';
                
    this.sprites.html(html);
    this.setDirection(this.direction);

    if (Character.prototype.classes.indexOf(class_) < 12) {
        this.traits = this.CHARACTER_TRAITS;
    } else if (class_ == "chars/ship") {
        this.traits = this.SHIP_TRAITS;
    } else if (class_ == "chars/canoe") {
        this.traits = this.CANOE_TRAITS;
    }
    
    this.sprites.css({"z-index": this.traits.zIndex});
    this.sprites.css({transition: "left " + 267/this.traits.speed + "ms, top " + 267/this.traits.speed + "ms", "transition-timing-function": "linear"});
    this.map.update(this);
 }

Character.prototype.getPosition = function() {
    return {x: this.position.x, y: this.position.y};
}

Character.prototype.setPosition = function(x,y) {
    if  (typeof x === "object") {
        y = x.y;
        x = x.x;
    }

    this.position = {x:x, y:y};   
	this.map.update(this);
};

Character.prototype.setDirection = function(direction) {
    this.direction = direction;
    this.sprites.find(".sprite").hide().eq(direction).show();
}

Character.prototype.moveLeft = function() {
    this.setDirection(this.LEFT | this.ANIM);
};

Character.prototype.moveUp = function() {
    this.setDirection(this.UP | this.ANIM);
};

Character.prototype.moveRight = function() {
    this.setDirection(this.RIGHT | this.ANIM);
};

Character.prototype.moveDown = function() {
    this.setDirection(this.DOWN | this.ANIM);
};

Character.prototype.setMoving = function() {
    this.setDirection(this.direction | this.ANIM);
};

Character.prototype.stopMoving = function() {
    this.setDirection(this.direction & 0x3);
};

Character.prototype.remove = function() {
    this.sprites.remove();
    this.sprites = null;
}

Character.prototype.dump = function() {
    return {left: this.position.x, top: this.position.y, direction: this.direction, class: this.class_};
}

Character.prototype.update = function(dump) {
    this.setPosition(dump.left, dump.top);
    this.setDirection(dump.direction);
    this.setClass(dump.class);
}

Character.prototype.setTruncated = function(value) {
    this.sprites.height(value ? 16 : 32);
}
