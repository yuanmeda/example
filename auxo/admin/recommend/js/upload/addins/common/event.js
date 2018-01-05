﻿define(["require", "exports"], function(require, exports) {
    var Event = (function () {
        function Event(type) {
            this.type = type;
        }
        return Event;
    })();
    exports.Event = Event;
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this._listeners = [];
        }
        EventDispatcher.prototype.hasEventListener = function (type, listener) {
            var exists = false;
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].type === type && this._listeners[i].listener === listener) {
                    exists = true;
                }
            }

            return exists;
        };

        EventDispatcher.prototype.addEventListener = function (typeStr, listenerFunc) {
            if (this.hasEventListener(typeStr, listenerFunc)) {
                return;
            }

            this._listeners.push({ type: typeStr, listener: listenerFunc });
        };

        EventDispatcher.prototype.removeEventListener = function (typeStr, listenerFunc) {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].type === typeStr && this._listeners[i].listener === listenerFunc) {
                    this._listeners.splice(i, 1);
                }
            }
        };

        EventDispatcher.prototype.dispatchEvent = function (evt) {
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].type === evt.type) {
                    this._listeners[i].listener.call(this, evt);
                }
            }
        };
        return EventDispatcher;
    })();
    exports.EventDispatcher = EventDispatcher;
});
//# sourceMappingURL=event.js.map
