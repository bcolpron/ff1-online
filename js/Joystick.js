function Joystick(joystick, controller) {
    var moving = false;
    function move(e) {
        if (moving) {
            var offset = joystick.offset();
            var x = e.pageX - offset.left - joystick.width()/2;
            var y = e.pageY - offset.top - joystick.height()/2;
            if (Math.abs(x)>Math.abs(y)) if (x > 0) controller.right(); else controller.left();
            else if (y > 0) controller.down(); else controller.up();
        }
    }
    
    joystick.on("mousedown", function(e) {
        e.preventDefault();
        moving = true;
        move(e);
    });
    $(document).on("mouseup", function(e) {
        e.preventDefault();
        moving = false;
        controller.stop();
    });
    $(document).on("mousemove", function(e) {
        e.preventDefault();
        move(e);
    });
    joystick.on("touchstart", function(e) {
        e.preventDefault();
        moving = true;
        move(e.originalEvent.touches[0]);
    });
    $(document).on("touchend", function(e) {
        e.preventDefault();
        if (moving) {
            moving = false;
            controller.stop();
        }
    });
    $(document).on("touchmove", function(e) {
        e.preventDefault();
        if (moving) {
            move(e.originalEvent.touches[0]);
         }
    });
}
