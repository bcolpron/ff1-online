function CharacterManager(map) {
    this.map = map;
    this.characters = {};
}

CharacterManager.prototype.addOrUpdate = function(id, data) {
    var found = this.characters[id];
    if (!found) {
        found = this.characters[id] = new Character(this.map, data.class, data.left, data.top, data.direction);
    } else {
        found.update(data);
    }
    found.setMoving();
}

CharacterManager.prototype.remove = function(id) {
    var found = this.characters[id];
    if (found) {
        found.remove();
        delete this.characters[id];
    }
}

CharacterManager.prototype.clear = function() {
    for (i in this.characters) {
        this.characters[i].remove();
    }
    this.characters = {};
}

CharacterManager.prototype.isFree = function(x, y) {
    for (i in this.characters) {
        if (this.characters[i].position.x == x && this.characters[i].position.y == y) {
            return false;
            }
    }
    return true;
}
