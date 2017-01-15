const Key = (function() {

    const pressed = {};

    const A = 65;
    const W = 87;
    const D = 68;
    const S = 83;
    const SPACE = 32;

    function isDown(keyCode) {
        return pressed[keyCode];
    }

    function onKeydown(event) {
        pressed[event.keyCode] = true;
    }

    function onKeyup(event) {
        pressed[event.keyCode] = false;
    }

    window.addEventListener('keyup', function (event) {
        onKeyup(event);
    }, false);
    window.addEventListener('keydown', function (event) {
        onKeydown(event);
    }, false);

    return {
        isDown: isDown,
        A: A,
        W: W,
        D: D,
        S: S,
        SPACE: SPACE
    }

})();

