
function GameController() {
    this.controller = null;
    this.enableClassSelectionCallbacks = $.Callbacks();
};

GameController.prototype.setController = function(controller) {
    this.controller = controller;
}

GameController.prototype.left = function() {
    this.controller && this.controller.left();
}
GameController.prototype.right = function() {
    this.controller && this.controller.right();
}
GameController.prototype.up = function() {
    this.controller && this.controller.up();
}
GameController.prototype.down = function() {
    this.controller && this.controller.down();
}
GameController.prototype.stop = function() {
    this.controller && this.controller.stop();
}
GameController.prototype.setClass = function(class_) {
    this.controller && this.controller.setClass(class_);
}
