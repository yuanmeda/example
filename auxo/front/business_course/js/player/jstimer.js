define(function (require) {
    var inner = {
        _serverTimeUrl: "/api/general/servertime",
        _timerInterval: 200,
        _maxOffset: 5000,
        _repeats: [],
        _onces: [],
        _init: function () {
            //延迟对象 
            this._def = $.Deferred();
            this._inited = false;
            this._loading = false;

            //获取服务器时间
            this._getServerTime();
            window.setInterval($.proxy(this._onInterval, this), this._timerInterval);
        },
        ready: function () {
            if (this._inited) {
                return $.Deferred(function (def) {
                    def.resolve();
                }).promise();
            }
            return this._def.promise();
        },
        isReady: function () {
            return this._inited;
        },
        _setServerTime: function (serverTime) {
            this._offsetTime = serverTime - new Date().getTime();
        },
        _getServerTime: function () {
            this._loading = true;
            var t = this;
            $.ajax({
                type: "GET",
                url: this._serverTimeUrl + "?clientUnixTime=" + new Date().getTime() / 1000,
                contentType: "application/json; charset=utf-8",
                cache: false,
                dataType: "jsonp",
                jsonp: "jsoncallback"
            }).success(function (data) {
                var ct = new Date().getTime();
                t._setServerTime(Math.floor(data[1] * 1000 + (ct - data[0] * 1000) / 2));
                if (!t._inited) {
                    t._inited = true;
                    t._def.resolve();
                }
                t._lastTime = t.time();
                t._loading = false;
            }).error(function () {
                t._loading = false;
            });
        },
        _checkInited: function () {
            if (!this._inited)
                $.error("the timer is not inited");
        },
        _onInterval: function () {
            if (this._inited && !this._loading) {
                var i = 0, cur = this.time();
                //处理时间不准确
                if (Math.abs(cur - this._lastTime) > this._maxOffset) {
                    this._getServerTime();
                    return;
                }
                this._lastTime = cur;
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
        },
        time: function () {
            this._checkInited();
            if (arguments.length == 0)
                return new Date().getTime() + this._offsetTime;
            return this._setServerTime(arguments[0]);
        },
        appendHandler: function (name, time, handler) {
            this._checkInited();
            this._onces.push({
                name: name,
                time: time,
                handler: handler
            });
        },
        appendRepeateHandler: function (name, handler, expried, delay) {
            this._checkInited();
            this._repeats.push({
                name: name,
                handler: handler,
                expried: expried,
                delay: delay,
                next: this.time() + delay
            });
        },
        removeHandler: function (name) {
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
        },
        //启动时间线
        startTimeline: function () {
            this._checkInited();
            this._totalStartTime = this.time();
            this._totalSpan = 0;
            this._popStartTime = this._totalStartTime;
            this._popSpan = 0;
            this._timelineRunning = true;
        },
        //暂停时间线
        pauseTimeline: function () {
            this._checkInited();
            if (this._timelineRunning) {
                this._timelineRunning = false;
                this._totalSpan += this.time() - this._totalStartTime;
                this._popSpan += this.time() - this._popStartTime;
            }
        },
        //继续时间线
        resumeTimeline: function () {
            this._checkInited();
            if (!this._timelineRunning) {
                this._timelineRunning = true;
                this._totalStartTime = this.time();
                this._popStartTime = this._totalStartTime;
            }
        },
        //获取自时间线启动以来经过的毫秒数（扣掉暂停的时间）
        getTotalSpan: function () {
            this._checkInited();
            if (this._timelineRunning)
                return this._totalSpan + this.time() - this._totalStartTime;
            return this._totalSpan;
        },
        //获取至上次调用本方法经过的毫秒数（扣掉暂停的时间）
        popSpan: function () {
            this._checkInited();
            var span = this._popSpan;
            this._popSpan = 0;
            if (this._timelineRunning) {
                var s = this._popStartTime;
                this._popStartTime = this.time();
                return span + this._popStartTime - s;
            }
            return span;
        },
        //获取至上次调用popSpan方法经过的毫秒数（扣掉暂停的时间）
        peekSpan: function () {
            this._checkInited();
            if (this._timelineRunning)
                return this._popSpan + this.time() - this._popStartTime;
            return this._popSpan;
        }
    };
    inner._init();
    return inner;
});