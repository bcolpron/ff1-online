
function DialogBox(element) {
    this.$element = $(element);
    this.$element.height(20);
}

DialogBox.prototype.fontGlyphes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,_!'?-";
DialogBox.prototype.fontClasses = [
    "char-A", "char-B", "char-C", "char-D", "char-E", "char-F", "char-G", "char-H", "char-I", "char-J", 
    "char-K", "char-L", "char-M", "char-N", "char-O", "char-P", "char-Q", "char-R", "char-S", "char-T",
    "char-U", "char-V", "char-W", "char-X", "char-Y", "char-Z",
    "char-a_lo", "char-b_lo", "char-c_lo", "char-d_lo", "char-e_lo", "char-f_lo", "char-g_lo",
    "char-h_lo", "char-i_lo", "char-j_lo", "char-k_lo", "char-l_lo", "char-m_lo", "char-n_lo",
    "char-o_lo", "char-p_lo", "char-q_lo", "char-r_lo", "char-s_lo", "char-t_lo", "char-u_lo",
    "char-v_lo", "char-w_lo", "char-x_lo", "char-y_lo", "char-z_lo", 
    "char-0", "char-1", "char-2", "char-3", "char-4", "char-5", "char-6", "char-7", "char-8", "char-9", 
    "char-period", "char-comma", "char-ellipsis", "char-exclamation",
    "char-apostrophe", "char-question", "char-dash"
];

DialogBox.prototype.fillTextBox = function(dest, text) {
    dest.text('');
    for (i in text) {
        var found = this.fontGlyphes.indexOf(text[i]);
        if (found != -1) {
            dest.append('<div class="glyph ' + this.fontClasses[found] + '">');
        }
        else {
            if (text[i] == ' ') {
                dest.append('<div class="glyph char-whitespace">');
            } else if (text[i] == '\n') {
                dest.append('<br>');
            }
        }
    }
}

DialogBox.prototype.show = function(text) {
    this.fillTextBox(this.$element.find("div>div>div"), text);
    this.$element.show();
    this.$element.height(176);
}

DialogBox.prototype.hide = function() {
    this.$element.height(20);
    setTimeout($.proxy(function() {
        this.$element.hide();
    }, this), 1000);
};
