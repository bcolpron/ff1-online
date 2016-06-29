function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function loadJSON(url) {
    var loaded = $.Deferred();
    $.getJSON(url, null, function(data) {
        loaded.resolve(data);
    });
    return loaded;
}

function whenAllImagesLoaded() {
    var deferred = $.Deferred();
    var img$ = $("img");
    var count = img$.length;
    function imgLoaded() {
        if (--count === 0) {
            deferred.resolve();
        }
    }
    img$.each(function() {
        var $this = $(this);
        $this.one("load", imgLoaded);
        if (this.complete) {
            $this.trigger("load");
        }
    });
    console.log(count + " images still to load...");
    return deferred;
}
