
function GameController() {
    this.left = $.Callbacks('unique');
    this.right = $.Callbacks('unique');
    this.up = $.Callbacks('unique');
    this.down = $.Callbacks('unique');
    this.stop = $.Callbacks('unique');
    this.mainCharacterClassChange = $.Callbacks('unique');
    this.classSelectionAvailable = $.Callbacks('unique');
};
