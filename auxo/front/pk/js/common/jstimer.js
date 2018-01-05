define(["require", "exports"], function (require, exports) {
    var Common;
    (function (Common) {
        var JsTimer = (function () {
            function JsTimer() {
                this._serverTimeUrl = "http://cloud.91open.com/v1/general/servertime";
                this._timerInterval = 200;
                this._maxOffset = 5000;
                this._repeats = [];
                this._onces = [];
                this._def = $.Deferred();
                this._inited = false;
                this._loading = false;
                this._offsetTime = 0;
                this._lasttime = 0;
                this._totalStartTime = 0;
                this._totalSpan = 0;
                this._popStartTime = 0;
                this._popSpan = 0;
                this._timelineRunning = false;
                this._getServerTime();
                window.setInterval($.proxy(this._onInterval, this), this._timerInterval);
            }
            JsTimer.prototype.ready = function () {
                if (this._inited) {
                    return $.Deferred(function (def) {
                        def.resolve();
                    }).promise();
                }
                return this._def.promise();
            };
            JsTimer.prototype.isReady = function () {
                return this._inited;
            };
            JsTimer.prototype.appendRepeateHandler = function (name, fun, invalidTime, intervalTime) {
                this._checkInited();
                this._repeats.push({ name: name, handler: fun, expried: invalidTime, delay: intervalTime, next: this.time() + intervalTime });
            };
            JsTimer.prototype.appendHandler = function (name, handleTime, fun) {
                this._checkInited();
                this._onces.push({ name: name, time: handleTime, handler: fun });
            };
            JsTimer.prototype.removeHandler = function (name) {
                this._checkInited();
                var i = 0;
                while (i < this._onces.length) {
                    if (this._onces[i].name == name) {
                        this._onces.splice(i, 1);
                        continue;
                    }
                    i++;
                }
                i = 0;
                while (i < this._repeats.length) {
                    if (this._repeats[i].name == name) {
                        this._repeats.splice(i, 1);
                        continue;
                    }
                    i++;
                }
            };
            JsTimer.prototype.startTimeline = function () {
                this._checkInited();
                this._totalStartTime = this.time();
                this._totalSpan = 0;
                this._popStartTime = this._totalStartTime;
                this._popSpan = 0;
                this._timelineRunning = true;
            };
            JsTimer.prototype.pauseTimeline = function () {
                this._checkInited();
                if (this._timelineRunning) {
                    this._timelineRunning = false;
                    this._totalSpan += this.time() - this._totalStartTime;
                    this._popSpan += this.time() - this._popStartTime;
                }
            };
            JsTimer.prototype.resumeTimeline = function () {
                this._checkInited();
                if (!this._timelineRunning) {
                    this._timelineRunning = true;
                    this._totalStartTime = this.time();
                    this._popStartTime = this._totalStartTime;
                }
            };
            JsTimer.prototype.getTotalSpan = function () {
                this._checkInited();
                if (this._timelineRunning)
                    return this._totalSpan + this.time() - this._totalStartTime;
                return this._totalSpan;
            };
            JsTimer.prototype.popSpan = function () {
                this._checkInited();
                var span = this._popSpan;
                this._popSpan = 0;
                if (this._timelineRunning) {
                    var s = this._popStartTime;
                    this._popStartTime = this.time();
                    return span + this._popStartTime - s;
                }
                return span;
            };
            JsTimer.prototype.peekSpan = function () {
                this._checkInited();
                if (this._timelineRunning)
                    return this._popSpan + this.time() - this._popStartTime;
                return this._popSpan;
            };
            JsTimer.prototype.time = function () {
                this._checkInited();
                return new Date().getTime() + this._offsetTime;
            };
            JsTimer.prototype._setServerTime = function (serverTime) {
                this._offsetTime = serverTime - new Date().getTime();
            };
            JsTimer.prototype._getServerTime = function () {
                var _this = this;
                this._loading = true;
                $.ajax({
                    type: "GET",
                    url: this._serverTimeUrl + "?clientUnixTime=" + new Date().getTime() / 1000,
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    dataType: "jsonp",
                    jsonp: "jsoncallback",
                    success: function (data) {
                        if (data.Code == 0) {
                            var data = data.Data;
                            var ct = new Date().getTime();
                            _this._setServerTime(Math.floor(data[1] * 1000 + (ct - data[0] * 1000) / 2));
                            if (!_this._inited) {
                                _this._inited = true;
                                _this._def.resolve();
                            }
                            _this._lasttime = _this.time();
                            _this._loading = false;
                        }
                    },
                    error: function (err) {
                        _this._loading = false;
                    }
                });
            };
            JsTimer.prototype._checkInited = function () {
                if (!this._inited)
                    $.error("the timer is not inited");
            };
            JsTimer.prototype._onInterval = function () {
                if (this._inited && !this._loading) {
                    var i = 0, cur = this.time();
                    if (Math.abs(cur - this._lasttime) > this._maxOffset) {
                        this._getServerTime();
                        return;
                    }
                    this._lasttime = cur;
                    while (i < this._onces.length) {
                        var c = this._onces[i];
                        if (cur >= c.time) {
                            c.handler(c.name);
                            this._onces.splice(i, 1);
                            continue;
                        }
                        i++;
                    }
                    i = 0;
                    while (i < this._repeats.length) {
                        var c = this._repeats[i];
                        if (cur >= c.expried) {
                            this._repeats.splice(i, 1);
                            break;
                        }
                        if (cur >= c.next) {
                            c.handler(c.name, cur);
                            c.next = cur + c.delay;
                        }
                        i++;
                    }
                }
            };
            return JsTimer;
        }());
        Common.JsTimer = JsTimer;
    })(Common = exports.Common || (exports.Common = {}));
});
//# sourceMappingURL=jstimer.js.map