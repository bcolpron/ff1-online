function ActionButton(controller) {

    var that = this;
    this.enabled = true;

    $(".action-button").on("click touchstart", "", function(e) {
        if (that.enabled)
        {
            controller.action();
        }
    });
    
    controller.enableActionsCallbacks.add($.proxy(this.enable, this));
}

ActionButton.prototype.enable = function(val) {
    this.enabled = val;
    $(".action-button").css({opacity: val ? 1 : .5});
}
