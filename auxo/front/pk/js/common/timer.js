define(["require", "exports", './jstimer'], function (require, exports, __jstimer) {
    var Common;
    (function (Common) {
        function init() {
            if (window["__timer_inited"])
                return;
            window["__timer_inited"] = true;
            window["__timer_ver"] = swfobject.getFlashPlayerVersion(), window["_timer"] = undefined;
            window["__timer"] = new __jstimer.Common.JsTimer();
        }
        init();
        var TimerFactory = (function () {
            function TimerFactory() {
            }
            TimerFactory.Singleton = function () {
                return window["__timer"];
            };
            return TimerFactory;
        }());
        Common.TimerFactory = TimerFactory;
    })(Common = exports.Common || (exports.Common = {}));
});
//# sourceMappingURL=timer.js.map