define(["require", "exports"], function (require, exports) {
    var Common;
    (function (Common) {
        window["_learningTimer"] = {
            index: 0,
            create: function (handler) {
                var n = "h1_" + this.index++;
                this[n] = handler;
                return "_learningTimer." + n;
            }
        };
        var SwfTimer = (function () {
            function SwfTimer() {
                this._serverTimeUrl = "http://cloud.91open.com/v1/general/servertime";
                this._swfUrl = "flashtimer.swf";
                this._inited = false;
                this._def = $.Deferred();
                this._timelineRunning = false;
                this._ref = null;
                this._totalStartTime = 0;
                this._totalSpan = 0;
                this._popStartTime = 0;
                this._popSpan = 0;
                this._swfUrl = require.toUrl("./flashtimer_v2.swf?v=1231");
                window["flashTimerReady"] = $.proxy(this._flashReady, this);
                this._inited = false;
                this._def = $.Deferred();
                this._timelineRunning = false;
            }
            SwfTimer.prototype.ready = function () {
                if (!this._inited) {
                    $('body').append("<div id='swf_flashtimer' style='display:none;'></div>");
                    swfobject.embedSWF(this._swfUrl, "swf_flashtimer", "0", "0", "9.0.0", null, null, { allowscriptaccess: "always" });
                }
                if (this._inited) {
                    return $.Deferred(function (def) {
                        def.resolve();
                    }).promise();
                }
                return this._def.promise();
            };
            SwfTimer.prototype.isReady = function () {
                return this._inited;
            };
            SwfTimer.prototype.appendRepeateHandler = function (name, fun, invalidTime, intervalTime) {
                this._checkInited();
                var n = window["_learningTimer"].create(fun);
                this._ref.appendRepeateHandler(name, n, invalidTime, intervalTime);
            };
            SwfTimer.prototype.appendHandler = function (name, handleTime, fun) {
                this._checkInited();
                var n = window["_learningTimer"].create(fun);
                this._ref.appendHandler(name, handleTime, n);
            };
            SwfTimer.prototype.removeHandler = function (name) {
                this._checkInited();
                this._ref.removeHandler(name);
            };
            SwfTimer.prototype.startTimeline = function () {
                this._checkInited();
                this._totalStartTime = this.time();
                this._totalSpan = 0;
                this._popStartTime = this._totalStartTime;
                this._popSpan = 0;
                this._timelineRunning = true;
            };
            SwfTimer.prototype.pauseTimeline = function () {
                this._checkInited();
                if (this._timelineRunning) {
                    this._timelineRunning = false;
                    this._totalSpan += this.time() - this._totalStartTime;
                    this._popSpan += this.time() - this._popStartTime;
                }
            };
            SwfTimer.prototype.resumeTimeline = function () {
                this._checkInited();
                if (!this._timelineRunning) {
                    this._timelineRunning = true;
                    this._totalStartTime = this.time();
                    this._popStartTime = this._totalStartTime;
                }
            };
            SwfTimer.prototype.getTotalSpan = function () {
                this._checkInited();
                if (this._timelineRunning)
                    return this._totalSpan + this.time() - this._totalStartTime;
                return this._totalSpan;
            };
            SwfTimer.prototype.popSpan = function () {
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
            SwfTimer.prototype.peekSpan = function () {
                if (this._timelineRunning)
                    return this._popSpan + this.time() - this._popStartTime;
                return this._popSpan;
            };
            SwfTimer.prototype.time = function () {
                this._checkInited();
                return this._ref.getNetworkTime();
            };
            SwfTimer.prototype._flashReady = function () {
                var _this = this;
                this._ref = document.getElementById("swf_flashtimer");
                var now = new Date();
                this._ref.setNetworkTime(now.getTime());
                $.ajax({
                    type: "GET",
                    url: this._serverTimeUrl + "?clientUnixTime=" + this._ref.getNetworkTime() / 1000,
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    dataType: "jsonp",
                    jsonp: "jsoncallback",
                    success: function (data) {
                        if (data.Code == 0) {
                            var data = data.Data;
                            var ct = _this._ref.getNetworkTime();
                            _this._ref.setNetworkTime(Math.floor(data[1] * 1000 + (ct - data[0] * 1000) / 2));
                            _this._inited = true;
                            _this._def.resolve();
                        }
                    }
                });
            };
            SwfTimer.prototype._checkInited = function () {
                if (!this._inited)
                    $.error("the timer is not inited");
            };
            return SwfTimer;
        }());
        Common.SwfTimer = SwfTimer;
    })(Common = exports.Common || (exports.Common = {}));
});
//# sourceMappingURL=swftimer.js.map