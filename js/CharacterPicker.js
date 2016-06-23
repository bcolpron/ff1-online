function CharacterPicker(game) {

    var that = this;
    this.enabled = true;

    $(".character-picker-button").on("click touchstart", "", function(e) {
        if (that.enabled)
        {
            $(".dialog-background").show();
            $(".character-picker").show();
        }
    });
    
    $(".dialog-background").on("click touchstart", "", function() {
        $(".dialog-background").hide();
        $(".character-picker").hide();
    });
    
    $(".character-button").on("click touchstart", "", function(e) {
        $(".dialog-background").hide();
        $(".character-picker").hide();
        game.mainCharacterClassChange.fire($(e.target).data().class);
    });
    
    game.classSelectionAvailable.add(function(val) {
        that.enable(val);
    });
}

CharacterPicker.prototype.enable = function(val) {
    this.enabled = val;
    $(".character-picker-button").css({opacity: val ? 1 : .5});
}
