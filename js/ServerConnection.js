function ServerConnection(url, id, manager) {
    this.url = url;
    this.id = id;
    this.closing = false;
    this.manager = manager;
    this._onConnectCallback = function() {};
    this.connect();
}

ServerConnection.prototype.connect = function() {
    this.ws = new WebSocket(this.url);
    $(".status").text("Connecting...");

    this.ws.onopen = $.proxy(this._onopen, this);
    this.ws.onclose = $.proxy(this._onclose, this);
    this.ws.onerror = function(e) {console.error("ws error");};
    this.ws.onmessage = $.proxy(this._onmessage, this);
}

ServerConnection.prototype._onopen = function() {
    console.log("Connected!")
    $(".status").text("Connected");
    this.manager.clear();
    this._onConnectCallback();
}

ServerConnection.prototype.onConnect = function(callback) {
    this._onConnectCallback = callback;
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
        callback();
    }
}

ServerConnection.prototype._onmessage = function(e) {
    var data = JSON.parse(e.data);
    for(var i in data.update) {
        this.manager.addOrUpdate(data.update[i].id, data.update[i]);
    }
    for(var i in data.removal) {
        this.manager.remove(data.removal[i]);
    }
}

ServerConnection.prototype.send = function(data) {
    data.id = this.id;
    if (this.ws) {
        try {
            this.ws.send(JSON.stringify({update: [data], removal: [] }));
        } catch (e) {
            console.error("failed to send update to server: " + e.message);
        }
    }
}

ServerConnection.prototype._onclose = function() {
    if (this.closing) return;
    console.log("connection closed. Reconnecting...")
    $(".status").text("Disconnected");
    setTimeout($.proxy(function() {
        this.connect();
    }, this), 1000);
}

ServerConnection.prototype.close = function() {
    this.closing = true;
    if (this.ws) {
        this.ws.close();
        this.ws = null;
    }
}
