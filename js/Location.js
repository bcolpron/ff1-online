function Location(name) {
    this.loaded = $.Deferred();
    var that = this;
    $.when(
        loadJSON("maps/" + name + "/tiles.json").then(function(data) {
            that.tiles = data;
        }),
        loadJSON("maps/" + name +"/location.json").then(function(data) {
            that.data = data;
        })
        ).then(function() {
            that.loaded.resolve();
    });
}