;(function () {
    'use strict';
    var postbox = new ko.subscribable();
    ko.subscribable.fn.publishOn = function (topic) {
        this.subscribe(function (newValue) {
            // window.console && console.log(topic);
            // window.console && console.log(newValue);
            postbox.notifySubscribers(newValue, topic);
        });
        return this;
    };
    ko.subscribable.fn.subscribeTo = function (topic, callback, context) {
        // window.console && console.log('sub:' + topic);
        postbox.subscribe(callback || this, context || null, topic);
        return this;
    };
})();

