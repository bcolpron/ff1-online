function Map(element) {
    this.areaCache = {};
    this.area = null;
    this.$element = $(element);
    this.element = this.$element[0];
}

Map.prototype.setLocation = function(l) {
    this.location = l;
    $.when(this.location.loaded).then(function() {
        
    });
}

Map.prototype.setScrollSpeed = function(speed) {
    this.$element.css({transition: "left " + 267/speed + "ms, top " + 267/speed + "ms",
                       "transition-timing-function": "linear"});
}

Map.prototype.setPosition = function(x,y) {
    if  (typeof x === "object") {
        y = x.y;
        x = x.x;
    }
    this.position = {x:x, y:y};
    this.element.style.left = -(x * 32);
    this.element.style.top = -(y * 32) - 16;

    var newArea = {x: Math.floor(x/16), y:Math.floor(y/15)};
    if (!_.isEqual(this.area, newArea)) {
        this.area = newArea;
        this.showAreaAndAround(this.area.x, this.area.y);
    }
};

Map.prototype.showAreaAndAround = function(x,y) {
    this.show(x-1,y-1);
    this.show(x-1,y);
    this.show(x-1,y+1);
    this.show(x-1,y+2);
    this.show(x,y-1);
    this.show(x,y);
    this.show(x,y+1);
    this.show(x,y+2);
    this.show(x+1,y-1);
    this.show(x+1,y);
    this.show(x+1,y+1);
    this.show(x+1,y+2);
    this.show(x+2,y-1);
    this.show(x+2,y);
    this.show(x+2,y+1);
    this.show(x+2,y+2);
    
    // cleanup
    this.unshow(x-2, y-2);
    this.unshow(x-2, y-1);
    this.unshow(x-2, y);
    this.unshow(x-2, y+1);
    this.unshow(x-2, y+2);
    this.unshow(x-1, y-2);
    this.unshow(x-1, y+3);
    this.unshow(x, y-2);
    this.unshow(x, y+3);
    this.unshow(x+1, y-2);
    this.unshow(x+1, y+3);
    this.unshow(x+2, y-2);
    this.unshow(x+2, y+3);
    this.unshow(x+3, y-2);
    this.unshow(x+3, y-1);
    this.unshow(x+3, y);
    this.unshow(x+3, y+1);
    this.unshow(x+3, y+2);
    this.unshow(x+3, y+3);
}

Map.prototype.show = function(x,y) {

	// normalize
	function wrapOver(v, max) {
		if (v < 0) return v + max;
		else if (v >= max) return v - max;
		else return v;
	}

    var tag = wrapOver(x, 16) + "x" + wrapOver(y,17);
    if (!this.areaCache[tag]) {
        console.log("loading map " + tag);
        html = '<img src="maps/world/' + tag + '.png" style="left: ' + (x*16*32) + 'px; top: ' + (y*15*32) + 'px" class="mapArea">';
        var img = this.areaCache[tag] = $(html)[0];
        this.element.appendChild(img);
    }
}

Map.prototype.unshow = function(x,y) {
    var tag = x + "x" + y;
    if (this.areaCache[tag]) {
        console.log("releading map " + tag);
        $(this.areaCache[tag]).remove();
        delete this.areaCache[tag];
    }
}

Map.prototype.add = function(sprites) {
	this.$element.append(sprites);
}

Map.prototype.update = function(character) {
    var left = character.position.x * 32;
    var top = character.position.y * 32 + character.traits.verticalAdjustment;
	
    character.sprites.each(function(i,e){
        e.style.left = left;
        e.style.top = top;
    });
}

Map.prototype.clear = function() {
    for (var tag in this.areaCache) {
        $(this.areaCache[tag]).remove();
    }
    this.areaCache = {};
}

