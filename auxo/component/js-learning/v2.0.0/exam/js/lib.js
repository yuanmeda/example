define('util', [
    'require',
    'exports'
], function (require, exports) {
    var Common;
    (function (Common) {
        var Hash = function () {
            function Hash(source) {
                this.source = source;
                this._object = null;
                if ($.isPlainObject(source))
                    this._object = source;
                else
                    this._object = {};
            }
            Hash.prototype.get = function (key) {
                return this._object[key];
            };
            Hash.prototype.set = function (key, value) {
                return this._object[key] = value;
            };
            Hash.prototype.unset = function (key) {
                var value = this._object[key];
                delete this._object[key];
                return value;
            };
            Hash.prototype.keys = function () {
                var results = [];
                for (var k in this._object)
                    results.push(k);
                return results;
            };
            Hash.prototype.values = function () {
                var results = [];
                for (var k in this._object)
                    results.push(this._object[k]);
                return results;
            };
            Hash.prototype.contains = function (key) {
                return this._object.hasOwnProperty(key);
            };
            Hash.prototype.merage = function (value) {
                $.extend(this._object, value);
            };
            Hash.prototype.merageArray = function (values) {
                for (var i = 0, len = values.length; i < len; i++) {
                    var item = values[i], key = item.Id;
                    if (this.contains(key))
                        item = $.extend(this.get(key), item);
                    this.set(key, item);
                }
            };
            return Hash;
        }();
        Common.Hash = Hash;
    }(Common = exports.Common || (exports.Common = {})));
});
define('jstimer', [
    'require',
    'exports'
], function (require, exports) {
    var Common;
    (function (Common) {
        var JsTimer = function () {
            function JsTimer() {
                this._serverTimeUrl = 'http://cloud.91open.com/v1/general/servertime';
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
                this._repeats.push({
                    name: name,
                    handler: fun,
                    expried: invalidTime,
                    delay: intervalTime,
                    next: this.time() + intervalTime
                });
            };
            JsTimer.prototype.appendHandler = function (name, handleTime, fun) {
                this._checkInited();
                this._onces.push({
                    name: name,
                    time: handleTime,
                    handler: fun
                });
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
                    type: 'GET',
                    url: this._serverTimeUrl + '?clientUnixTime=' + new Date().getTime() / 1000,
                    contentType: 'application/json; charset=utf-8',
                    cache: false,
                    dataType: 'jsonp',
                    jsonp: 'jsoncallback',
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
                    $.error('the timer is not inited');
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
        }();
        Common.JsTimer = JsTimer;
    }(Common = exports.Common || (exports.Common = {})));
});
define('swftimer', [
    'require',
    'exports'
], function (require, exports) {
    var Common;
    (function (Common) {
        window['_learningTimer'] = {
            index: 0,
            create: function (handler) {
                var n = 'h1_' + this.index++;
                this[n] = handler;
                return '_learningTimer.' + n;
            }
        };
        var SwfTimer = function () {
            function SwfTimer() {
                this._serverTimeUrl = 'http://cloud.91open.com/v1/general/servertime';
                this._swfUrl = 'flashtimer.swf';
                this._inited = false;
                this._def = $.Deferred();
                this._timelineRunning = false;
                this._ref = null;
                this._totalStartTime = 0;
                this._totalSpan = 0;
                this._popStartTime = 0;
                this._popSpan = 0;
                this._swfUrl = 'http://s21.tianyuimg.com/typescript/addins/timer/v1/flashtimer_v2.swf?';
                window['flashTimerReady'] = $.proxy(this._flashReady, this);
                this._inited = false;
                this._def = $.Deferred();
                this._timelineRunning = false;
            }
            SwfTimer.prototype.ready = function () {
                if (!this._inited) {
                    $('body').append('<div id=\'swf_flashtimer\' style=\'display:none;\'></div>');
                    swfobject.embedSWF(this._swfUrl, 'swf_flashtimer', '0', '0', '9.0.0', null, null, { allowscriptaccess: 'always' });
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
                var n = window['_learningTimer'].create(fun);
                this._ref.appendRepeateHandler(name, n, invalidTime, intervalTime);
            };
            SwfTimer.prototype.appendHandler = function (name, handleTime, fun) {
                this._checkInited();
                var n = window['_learningTimer'].create(fun);
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
                this._ref = document.getElementById('swf_flashtimer');
                var now = new Date();
                this._ref.setNetworkTime(now.getTime());
                $.ajax({
                    type: 'GET',
                    url: this._serverTimeUrl + '?clientUnixTime=' + this._ref.getNetworkTime() / 1000,
                    contentType: 'application/json; charset=utf-8',
                    cache: false,
                    dataType: 'jsonp',
                    jsonp: 'jsoncallback',
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
                    $.error('the timer is not inited');
            };
            return SwfTimer;
        }();
        Common.SwfTimer = SwfTimer;
    }(Common = exports.Common || (exports.Common = {})));
});
define('timer', [
    'require',
    'exports',
    'jstimer'
], function (require, exports, __jstimer) {
    var Common;
    (function (Common) {
        function init() {
            if (window['__timer_inited'])
                return;
            window['__timer_inited'] = true;
            window['__timer_ver'] = swfobject.getFlashPlayerVersion(), window['_timer'] = undefined;
            window['__timer'] = new __jstimer.Common.JsTimer();
        }
        init();
        var TimerFactory = function () {
            function TimerFactory() {
            }
            TimerFactory.Singleton = function () {
                return window['__timer'];
            };
            return TimerFactory;
        }();
        Common.TimerFactory = TimerFactory;
    }(Common = exports.Common || (exports.Common = {})));
});
(function ($) {
    var temp = '        <div class="w-test-alert" style="display: none;" data-bind="visible:summary().length>0,css:{\'wt-alert-fixed\':ispaperMode()}">            <div class="wt-alert-wrap">                <div class="wt-alert-con">                    <h3 data-bind="text:$root.i18n.title"></h3>                    <div class="wt-alert-txt" data-bind="html:summary()"></div>                </div>                <a href="javascript:;" class="wa-fold-btn"></a>            </div>        </div>        ';
    $.widget('studying.explain', {
        options: {
            summary: 'asdf',
            showed: function () {
            },
            hidded: function () {
            },
            ispaperMode: false,
            i18n: { title: '考试说明' }
        },
        _init: function () {
            if (ko.contextFor(this.element[0]))
                ko.cleanNode(this.element[0]);
            this._inner = $(this.element).empty().html(temp);
            this._vm = ko.mapping.fromJS(this.options);
            ko.applyBindings(this._vm, this._inner[0]);
            $(document).off('click', '.ln-btn-explain', $.proxy(this.show, this)).on('click', '.ln-btn-explain', $.proxy(this.show, this));
            $(document).off('click', '.wa-fold-btn', $.proxy(this.hide, this)).on('click', '.wa-fold-btn', $.proxy(this.hide, this));
        },
        show: function () {
            var t = this;
            $('.wt-alert-con').hide();
            this._inner.show().find('.wt-alert-wrap').css({ left: '100%' }).stop(true, true).animate({ left: '235px' }, 500, function () {
                $('.wt-alert-con').show();
                t._trigger('showed');
            });
        },
        hide: function () {
            var t = this;
            $('.wt-alert-con').hide();
            t._inner.find('.wt-alert-wrap').css({ left: '235px' }).stop(true, true).animate({ left: '100%' }, 500, function () {
                t._inner.hide();
                t._trigger('hidded');
            });
        }
    });
}(jQuery));
define('studying.explain', [], function () {
    return;
});
(function ($) {
    $.widget('studying.judge', {
        options: {
            id: 0,
            sub: 0,
            options: [
                '对',
                '错'
            ],
            answer: {
                Answer: '',
                Result: 0
            },
            standard: '',
            editable: true,
            inited: function () {
            },
            changed: function () {
            }
        },
        _init: function () {
            var tmp = '                <div class="ln-judge wt-item-options single" data-bind="foreach:options, css:{\'ln-options-editable\':editable}">                    <div class="wt-item-option" data-bind="attr:{\'data-item\':$data},css:{\'opt-active\':answered,\'opt-right\':standarded}">                        <div class="wt-opt-con" data-bind="css:{\'opt-hover\':hovered}">                            <em><i></i><span>&nbsp;</span><ins></ins></em>                            <div class="wt-option-txt" data-bind="html:content"></div>                        </div>                    </div>                </div>                ';
            this.element.html(tmp);
            var op = this.options;
            switch (op.answer.Answer) {
            case '对':
                op.answer.Answer = this.options.i18n.right;
                break;
            case '错':
                op.answer.Answer = this.options.i18n.error;
                break;
            }
            var vm = $.extend({}, op, {
                options: Enumerable.from(op.options).select(function (n, i) {
                    var content = op.options[i];
                    return {
                        content: content,
                        answered: op.answer.Answer.indexOf(content) > -1,
                        standarded: op.standard.indexOf(content) > -1,
                        hovered: false
                    };
                }).toArray()
            });
            this._vm = ko.mapping.fromJS(vm);
            this._vm.pushAnswer = $.proxy(this._pushAnswer, this);
            this._inner = $('.ln-judge', this.element);
            this._trigger('inited', null, this._ui());
            ko.applyBindings(this._vm, this._inner[0]);
            $('.wt-item-option', this._inner).click($.proxy(this._onOptionClick, this)).hover($.proxy(this._onOptionHover, this));
        },
        _pushAnswer: function (answer) {
            var item = Enumerable.from(this._vm.options()).firstOrDefault(null, '$.content()==\'' + answer + '\'');
            if (item != null) {
                if (!item.answered()) {
                    Enumerable.from(this._vm.options()).forEach('$.answered(false)');
                    item.answered(true);
                    this._triggerChanged();
                }
            }
        },
        _triggerChanged: function () {
            var temp = Enumerable.from(this._vm.options()).where('$.answered()').select('$.content()').toArray().join('');
            if (temp === this.options.i18n.right)
                temp = '对';
            if (temp === this.options.i18n.error)
                temp = '错';
            this._vm.answer.Answer(temp);
            this._trigger('changed', null, this._ui());
        },
        _onOptionClick: function (evt) {
            if (!this._vm.editable())
                return;
            var ctx = ko.contextFor(evt.currentTarget);
            ctx.$parent.pushAnswer(ctx.$data.content());
        },
        _onOptionHover: function (evt) {
            if (!this._vm.editable())
                return;
            ko.dataFor(evt.currentTarget).hovered(evt.type == 'mouseenter');
        },
        _ui: function () {
            return { viewModel: this._vm };
        },
        viewModel: function () {
            return this._vm;
        }
    });
}(jQuery));
define('studying.judge', [], function () {
    return;
});
(function ($, studying) {
    studying.loading = {
        _to: 0,
        _showing: false,
        i18n: { title: 'Loading...' },
        _init: function () {
            var tmpl = '<div class="test-loading"><i><span>' + this.i18n.title + '</span></i></div><div class="test-loading-cover"></div>';
            $(document.body).append(tmpl);
            this._inner = $('.test-loading', document.body);
            $(window).resize($.proxy(this._delayResize, this));
        },
        show: function (title) {
            if (title) {
                $('.test-loading span').html(title);
            }
            $(this).trigger('shown');
            var t = this;
            window.clearTimeout(this._to);
            $('.test-loading-cover').show().css('opacity', 0.01);
            this._to = window.setTimeout(function () {
                t._showing = true;
                $('.test-loading-cover').css('opacity', 0.3);
                t._inner.show();
                t._resize();
            }, 300);
        },
        hide: function () {
            window.clearTimeout(this._to);
            this._inner.hide();
            $('.test-loading-cover').hide();
            $(this).trigger('hidden');
            this._showing = false;
        },
        _delayResize: function (evt) {
            window.clearTimeout(this._last);
            this._last = window.setTimeout($.proxy(this._resize, this), 10);
        },
        _resize: function (evt) {
            if (this._showing) {
                this._inner.css('top', $(window).height() / 2 - this._inner.height() / 2);
                this._inner.css('left', $(window).width() / 2 - this._inner.width() / 2);
            }
        }
    };
    studying.loading._init();
}(jQuery, jQuery.studying || (jQuery.studying = {})));
define('studying.loading', [], function () {
    return;
});
(function ($, studying) {
    studying.message = {
        show: function (title, ele, iconClass) {
            var msg = $('.hs-box');
            if (msg.length > 0) {
                msg.find('span').html('<i></i>' + title).end();
            } else {
                $('body').append('<div class="hs-box"><span class="hs-alert"><i></i>' + title + '</span></div>');
                msg = $('.hs-box');
            }
            if (typeof iconClass == 'string') {
                msg.addClass(iconClass);
            } else {
                msg.removeClass().addClass('hs-box');
            }
            if (typeof ele == 'undefined' && $('.w-test-con').length > 0) {
                ele = $('.w-test-con');
            }
            msg.show().position({ of: window }).position({
                my: 'center top',
                at: 'center top',
                of: ele || studying.message.setup.of || window,
                offset: studying.message.setup.offset || '0 15'
            }).css({ zIndex: 999 }).stop(true, true).hide().fadeIn(500).delay(1000).fadeOut(500);
        }
    };
}(jQuery, jQuery.studying || (jQuery.studying = {})));
jQuery.studying.message.setup = {
    of: window,
    offset: '0 15'
};
define('studying.message', [], function () {
    return;
});
(function ($) {
    $.widget('studying.navigator', {
        options: {
            num: 1,
            numChanged: function () {
            },
            onNextButtonClick: function () {
            },
            items: [],
            batches: [],
            partTitles: [],
            isShowAnswerState: true,
            isShowCurrentState: true,
            disableJump: false,
            autoHidePrev: false,
            autoHideNext: false,
            getNumByQuestionId: function () {
            },
            getCurrentQuestionState: function () {
            }
        },
        _init: function () {
            var tmpl = '            <div class="wt-sheet-bd">                <div class="wt-sheet-field">                    <div class="wt-sheet-box" data-bind="foreach:page">                        <p class="wt-sheet-tit" data-bind="visible:partTilte != \'\', html:$root.getPartTitle($index()+1,partTilte)"></p>                        <ul class="clearfix" data-bind="foreach:cells">                            <li  data-bind="css:{\'nosure\':nosure(),\'done\': state()==7 || (!$root.isShowAnswerState() && (state()==1 || state()==2)),\'success\':state()==1 && $root.isShowAnswerState(),\'error\':state()==2 && $root.isShowAnswerState(),\'cur\':num()==$root.num() && $root.isShowCurrentState()}" style="position: relative;">                                <i data-bind="visible: state() == 1 || state() == 2, css: {\'i-success\':state()==1 && $root.isShowAnswerState(),\'i-error\':state()==2 && $root.isShowAnswerState()}"></i>                                <a href="javascript:;" data-bind="text:num, css: {\'ln-item-hover\': $root.disableJump()}""></a>                            </li>                         </ul>                    </div>                </div>            </div>                ';
            this.element.html(tmpl);
            for (var i = 0; i < this.options.items.length; i++) {
                var d = this.options.items[i];
                d.num = i + 1;
                d.hover = false;
                d.nosure = this.options.items[i].nosure || false;
                this.options.items[i] = d;
            }
            this.batcheIds = Array.prototype.concat.apply([], this.options.batches);
            this.itemsCount = this.options.items.length;
            var vm = ko.mapping.fromJS(this.options), t = this;
            vm.getItemById = function (id) {
                var arr = t.options.items;
                for (var i = 0, len = arr.length; i < len; i++) {
                    if (arr[i].Id == id) {
                        return vm.items()[i];
                    }
                }
            };
            vm.page = ko.computed(function () {
                if (Object.prototype.toString.call(this.partTitles()).toLowerCase().indexOf('array') > -1 && this.partTitles().length > 0) {
                    var items = this.items(), section = [], batches = this.batches(), partTitles = this.partTitles(), newPartTitles = [], num = 0;
                    for (var i = 0; i < batches.length; i++) {
                        var row = {
                            num: i + 1,
                            partTilte: partTitles[i] || '',
                            cells: []
                        };
                        var batcheQuestionLen = batches[i].length;
                        for (var j = 0; j < batcheQuestionLen; j++) {
                            var cell = this.getItemById(batches[i][j]);
                            num++;
                            cell.num(num);
                            row.cells.push(cell);
                        }
                        if (row.cells.length == batcheQuestionLen && row.cells.length > 0) {
                            newPartTitles.push(partTitles[i]);
                            section.push(row);
                        }
                    }
                    this.partTitles(newPartTitles);
                    return section;
                } else {
                    var section = [], num = 0, row = {
                            num: 1,
                            partTilte: '',
                            cells: []
                        };
                    section.push(row);
                    for (var j = 0, len = t.batcheIds.length; j < len; j++) {
                        var cell = this.getItemById(t.batcheIds[j]);
                        num++;
                        cell.num(num);
                        row.cells.push(cell);
                    }
                    return section;
                }
            }, vm);
            vm.num.subscribe(this._onNumChanged, this);
            vm.getPartTitle = function (num, title) {
                if (title) {
                    var chineseNum = vm.getChineseNumber(num);
                    var newtitle = $(title).length > 0 ? $(title).text() : title;
                    return chineseNum + '\u3001' + newtitle;
                }
                return '';
            };
            vm.getChineseNumber = function (num) {
                num = parseInt(num, 10);
                if (isNaN(num)) {
                    return 0;
                }
                var c1 = [
                    '',
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8',
                    '9'
                ];
                var c2 = [
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    ''
                ];
                var numStrArr = num.toFixed(0).toString().split('');
                if (numStrArr.length > 9) {
                    if (console)
                        console.log('只能处理到亿');
                    return num;
                }
                var result = '';
                for (var i = numStrArr.length, j = 0; i > 0; i--, j++) {
                    var index = parseInt(numStrArr[j], 10);
                    result += c1[index];
                    result += c2[i];
                }
                return result;
            };
            this._vm = vm;
            this._inner = this.element;
            this._trigger('inited', null, this._ui());
            ko.applyBindings(vm, this._inner[0]);
            if (!this._vm.disableJump()) {
                $(document).off('click', '.wt-sheet-field li', $.proxy(this._onCellClick, this)).on('click', '.wt-sheet-field li', $.proxy(this._onCellClick, this));
            }
            $(document).off('click', '.w-test-collapse', $.proxy(this._onSidCollapseClick, this)).on('click', '.w-test-collapse', $.proxy(this._onSidCollapseClick, this));
            $(document).off('click', '.ln-btn-prev', $.proxy(this.prev, this)).on('click', '.ln-btn-prev', $.proxy(this.prev, this));
            $(document).off('click', '.ln-btn-next', $.proxy(this.next, this)).on('click', '.ln-btn-next', $.proxy(this.next, this));
            $(document).off('keyup', $.proxy(this._shortcutKeyHandle, this)).on('keyup', $.proxy(this._shortcutKeyHandle, this));
            vm.num.valueHasMutated();
        },
        _shortcutKeyHandle: function (evt) {
            var target = $(evt.target);
            if (target.is('input') || target.is('textarea')) {
                return;
            }
            switch (evt.keyCode) {
            case 37:
                this.prev();
                break;
            case 39:
                this.next();
                break;
            }
        },
        _onSidCollapseClick: function () {
            $('.test-wrapper').toggleClass('test-unflod');
            $('.wt-item-list').css({ width: 'auto' });
        },
        _onCellHover: function (evt) {
            $(evt.currentTarget).toggleClass('ln-item-hover', evt.type == 'mouseenter');
        },
        _onCellClick: function (evt) {
            var data = ko.dataFor(evt.currentTarget);
            if (data.num() == this._vm.num())
                this._vm.num.valueHasMutated();
            else
                this._vm.num(data.num());
        },
        getItemByNum: function () {
            var num = this._vm.num();
            if (arguments.length == 1)
                num = arguments[0];
            var id = this.batcheIds[num - 1];
            return Enumerable.from(this._vm.items()).first(function (v) {
                return v.Id() == id;
            });
        },
        getPartTitleByNum: function () {
            var num = this._vm.num(), index = 0;
            if (arguments.length == 1)
                num = arguments[0];
            var page = this._vm.page();
            for (var i = 0, len = page.length; i < len; i++) {
                if (num > page[i].cells.length) {
                    num = num - page[i].cells.length;
                } else {
                    index = i;
                    break;
                }
            }
            var partTitles = this._vm.partTitles(), partTitle = '';
            if (Object.prototype.toString.call(partTitles).indexOf('Array') > -1 && partTitles.length > 0 && index < partTitles.length) {
                partTitle = $(partTitles[index]).text() || this._vm.partTitles()[index];
                partTitle = this._vm.getPartTitle(index + 1, partTitle);
            }
            return partTitle;
        },
        num: function () {
            if (arguments.length == 1) {
                var vm = this._vm;
                vm.num(arguments[0]);
            } else {
                return this._vm.num();
            }
        },
        next: function () {
            var context = {
                nextQuestionId: '',
                currentQuestionId: '',
                jumpToNextQuestion: true,
                hiddenNextButton: false
            };
            var currentQuestionState = this.options.getCurrentQuestionState(this.num());
            var questionId = currentQuestionState && currentQuestionState.id;
            var questionAnswerStatus = currentQuestionState && currentQuestionState.answerStatus;
            this.options.onNextButtonClick(context, questionId, questionAnswerStatus);
            if (context.hiddenNextButton) {
                var n = $('.ln-btn-next').removeClass('wt-next-disabled').removeClass('wt-next-hidden').removeClass('wt-active');
                n.addClass('wt-next-disabled').addClass('wt-next-hidden');
                if (this._vm.autoHideNext)
                    n.addClass('wt-next-hidden');
            } else {
                if (context.jumpToNextQuestion) {
                    if (context.nextQuestionId) {
                        var nextNum = this.options.getNumByQuestionId(context.nextQuestionId);
                        if (nextNum && nextNum <= this.itemsCount) {
                            this.num(nextNum);
                            return true;
                        }
                    } else {
                        if (this.num() < this.itemsCount) {
                            this.num(this.num() + 1);
                            return true;
                        }
                        return false;
                    }
                }
            }
            return false;
        },
        prev: function () {
            if (this.num() > 1) {
                this.num(this.num() - 1);
                return true;
            }
            return false;
        },
        _onNumChanged: function (nv) {
            var n = $('.ln-btn-next').removeClass('wt-next-disabled').removeClass('wt-next-hidden').removeClass('wt-active'), p = $('.ln-btn-prev').removeClass('wt-prev-disabled').removeClass('wt-prev-hidden').removeClass('wt-active');
            if (this.itemCount == 1 || nv == this.itemsCount) {
                n.addClass('wt-next-disabled');
                p.addClass('wt-active');
                if (this._vm.autoHideNext())
                    n.addClass('wt-next-hidden');
            }
            if (nv == 1) {
                p.addClass('wt-prev-disabled');
                n.addClass('wt-active');
                if (this._vm.autoHidePrev())
                    p.addClass('wt-prev-hidden');
            }
            if (this.itemsCount > 1 && nv != 1 && nv != this.itemsCount) {
                n.addClass('wt-active');
                p.addClass('wt-active');
            }
            if (this.itemsCount == 1) {
                p.removeClass('wt-active');
                n.removeClass('wt-active');
            }
            this._trigger('numChanged', null, this._ui({ item: this.getItemByNum(nv) }));
        },
        viewModel: function () {
            return this._vm;
        },
        _ui: function (v) {
            return $.extend({ viewModel: this._vm }, v);
        },
        setState: function (qid, state) {
            var curq = Enumerable.from(this._vm.items()).firstOrDefault(null, '$.Id()==\'' + qid + '\'');
            curq.state(state);
        },
        setNoSureState: function (qid, state) {
            var curq = Enumerable.from(this._vm.items()).firstOrDefault(null, '$.Id()==\'' + qid + '\'');
            curq.nosure(state);
        },
        stateChange: function (qid, state) {
            var curq = Enumerable.from(this._vm.items()).firstOrDefault(null, '$.Id()==\'' + qid + '\'');
            curq.state(state);
        }
    });
}(jQuery));
define('studying.navigator', [], function () {
    return;
});
(function ($) {
    var temp = '        <div class="wt-sheet-stat">            <p class="wss-text" data-bind="text:$root.i18n.title"></p>            <div class="wt-sheet-p">                <span id="statProgress" class="p1"></span>                <span class="wts-p-text" data-bind="text: $root.i18n.accuracy"></span>            </div>            <p class="wss-num"><span>                <span data-bind="text: $root.i18n.right"></span>                    <em data-bind="text:correctCount">23</em>                    <span data-bind="text: $root.i18n.question"></span>                </span>                <span>                    <span data-bind="text: $root.i18n.error"></span>                    <b data-bind="text:wrongCount"></b>                    <span data-bind="text: $root.i18n.question"></span>                 </span>                 <span>                    <span data-bind="text: $root.i18n.noAnswer"></span>                    <strong data-bind="text:unDoneCount">90%</strong>                    <span data-bind="text: $root.i18n.question"></span>                 </span>            </p>        </div>        ';
    $.widget('studying.navigatorStat', {
        options: {
            correctCount: 10,
            wrongCount: 5,
            unDoneCount: 0,
            correctRate: 33.33,
            i18n: {
                title: '本次成绩',
                accuracy: '正确率',
                right: '答对',
                question: '题',
                error: '答错',
                noAnswer: '未做'
            }
        },
        _init: function () {
            this._inner = $(this.element).html(temp);
            this.options.correctRate = this.options.correctRate <= 1 ? this.options.correctRate.toFixed(2) : (this.options.correctRate / 100).toFixed(2);
            this._vm = ko.mapping.fromJS(this.options);
            ko.applyBindings(this._vm, this._inner[0]);
            var t = this;
            new SWFProgress({
                flash_url: staticUrl + '/addins/swfprogress/swfprogress.swf',
                htmlId: 'statProgress',
                width: 130,
                height: 130,
                flashvars: {
                    radius: 65,
                    end: t._vm.correctRate()
                }
            });
        }
    });
}(jQuery));
define('studying.navigatorstat', [], function () {
    return;
});
(function ($) {
    $.widget('studying.questionOption', {
        options: {
            id: 0,
            sub: 0,
            options: [],
            multiSelect: true,
            subType: 0,
            editable: true,
            answer: {
                Answer: '',
                Result: -1
            },
            standard: '',
            ispapermode: false,
            i18n: { answerTitle: '此选项为参考答案' }
        },
        _init: function () {
            var tmpl = '<div class="wt-item-options" data-bind="foreach:options, css:{\'ln-options-mutil\':multiSelect,\'ln-options-single\':!multiSelect(), \'ln-options-editable\':editable}">    <div class="wt-item-option" data-bind="attr:{\'data-item\':$data},css:{\'opt-active\':answered,\'opt-right\':standarded}">        <div class="wt-opt-con" data-bind="css:{\'opt-hover\':hovered}">            <em data-bind="attr:{title:standarded ? $root.i18n.answerTitle: \'\' }"><i></i><span data-bind="text: label() + \'\u3001\'"></span><ins data-bind="visible:$root.subType()!=1"></ins>            </em>            <div class="wt-option-txt" data-bind="html:content"></div>        </div>    </div></div>                ';
            this.element.html(tmpl);
            var op = this.options;
            var vm = $.extend({}, op, {
                options: Enumerable.from(op.options).select(function (n, i) {
                    var lbl = String.fromCharCode(i + 65);
                    return {
                        label: lbl,
                        content: n,
                        answered: op.answer.Answer.indexOf(lbl) > -1,
                        standarded: op.standard.indexOf(lbl) > -1,
                        hovered: false
                    };
                }).toArray()
            });
            this._vm = ko.mapping.fromJS(vm);
            this._vm.pushAnswer = $.proxy(this._pushAnswer, this);
            this._inner = $('.wt-item-options ', this.element);
            this._trigger('inited', null, this._ui());
            ko.applyBindings(this._vm, this._inner[0]);
            this.layout();
            $('.wt-item-option', this._inner).hover($.proxy(this._onOptionHover, this)).click($.proxy(this._onOptionClick, this));
        },
        layout: function () {
            this._inner.removeClass('ln-span1 ln-span2 ln-span4');
            var mb = this.element.closest('.ln-main-body:hidden');
            mb.show();
            if (this.options.options.join('').indexOf('<img') < 0) {
                var dds = this._inner.find('dd');
                var lw = this._inner.width() - 50, max = 0;
                lw = lw < 0 ? 0 : lw;
                for (var i = 0; i < dds.length; i++) {
                    var dd = $(dds[i]), w = dd.width() + 65;
                    if (w > lw / 2) {
                        max = lw;
                        break;
                    }
                    max = Math.max(max, w);
                }
                if (max < lw / 4)
                    this._inner.addClass('ln-span4');
                else if (max < lw / 2)
                    this._inner.addClass('ln-span2');
                else
                    this._inner.addClass('ln-span1');
            } else
                this._inner.addClass('ln-span1');
            mb.hide();
        },
        _onKeyUp: function (evt) {
            if (!this._vm.editable())
                return;
            if (evt.keyCode >= 65 && evt.keyCode <= 65 + this._vm.options().length)
                this._pushAnswer(String.fromCharCode(evt.keyCode));
        },
        _pushAnswer: function (answer) {
            var item = Enumerable.from(this._vm.options()).firstOrDefault(null, '$.label()==\'' + answer + '\'');
            if (item != null) {
                if (this._vm.multiSelect()) {
                    item.answered(!item.answered());
                    this._triggerChanged();
                } else if (!item.answered()) {
                    Enumerable.from(this._vm.options()).forEach('$.answered(false)');
                    item.answered(true);
                    this._triggerChanged();
                }
            }
        },
        _triggerChanged: function () {
            this._vm.answer.Answer(Enumerable.from(this._vm.options()).where('$.answered()').select('$.label()').toArray().join(''));
            this._trigger('changed', null, this._ui());
        },
        _onOptionHover: function (evt) {
            if (!this._vm.editable())
                return;
            ko.dataFor(evt.currentTarget).hovered(evt.type == 'mouseenter');
        },
        _onOptionClick: function (evt) {
            if (!this._vm.editable())
                return;
            var ctx = ko.contextFor(evt.currentTarget);
            ctx.$parent.pushAnswer(ctx.$data.label());
        },
        _ui: function () {
            return { viewModel: this._vm };
        },
        viewModel: function () {
            return this._vm;
        }
    });
}(jQuery));
define('studying.option', [], function () {
    return;
});
(function ($) {
    $.widget('studying.qtiquestion', {
        options: {
            'uncertain': '',
            'num': 1,
            'question': {},
            'analysisData': {},
            'result': {},
            'scorelist': [],
            'changed': function (evt, ui) {
            },
            'showAnalysis': function (evt, ui) {
            },
            'learnButtonClick': function (evt, ui) {
            },
            'questionButtonClick': function (evt, ui) {
            },
            'errorButtonClick': function (evt, ui) {
            },
            'inited': function (evt, ui) {
            },
            'showAnswer': false,
            'subType': 0,
            'editable': true,
            'partTitle': '',
            'ispapermode': false,
            'hover': false,
            'nosure': false,
            'questionInBankId': undefined,
            'showQuestionBank': false,
            'showGotoLearnButton': false,
            'showQuizButton': false,
            'showErrorButton': false,
            'hideErrorButton': false,
            'errorReasons': [],
            'questionErrorReasons': [],
            'nosureHandle': function () {
            },
            'showQuestionNum': true,
            'i18n': {
                'temporarilyUncertain': '暂不确定',
                'cancelTemporarilyUncertain': '取消标记题目',
                'rightAnswerLabel': '正确答案',
                'answerRightTitle': '您答对了',
                'subjectiveUserAnswer': '主观题用户答案',
                'questionExplanation': '题目详解',
                'questionsExplanation': '套题详解',
                'notScore': '\t不计分',
                'score': '分',
                'analysisTitle': '<暂无>',
                'notAnswer': '您未作答',
                'subQuestionUserTitle': '您错答为',
                'singleChoice': '单选题',
                'multipleChoice': '多选题',
                'indefiniteChoice': '不定项选择题',
                'completion': '填空题',
                'subjectivity': '主观题',
                'judgment': '判断题',
                'matching': '连线题',
                'complex': '套题',
                'noMarkTitle': '未批改',
                'answerWrongTitle': '您答错了',
                'questionType': {
                    'nd_linkup': '连连看',
                    'interactive': '互动题',
                    'base': '基础题',
                    'ndLinkupOld': '连连看',
                    'ndOrder': '排序题',
                    'ndProbabilitycard': '互动卡牌题',
                    'fraction': '分式加减',
                    'memorycard': '记忆卡片题',
                    'classified': '分类题型',
                    'table': '分类表格题',
                    'pointsequencing': '点排序题',
                    'arithmetic': '竖式计算题',
                    'textselect': '文本选择题',
                    'magicbox': '魔方盒游戏',
                    'wordpuzzle': '字谜游戏题',
                    'guessword': '猜词游戏',
                    'fillblank': '选词填空题',
                    'compare': '比大小',
                    'nd_section_evaluating': '英语篇章发音评测',
                    'nd_sentence_evaluat': '英语句子发音评测',
                    'nd_enoral_word': '英语口语单词',
                    'nd_enoral_sentence': '英语口语句子',
                    'nd_enoral_paragraph': '英语口语段落',
                    'nd_enoral_dialogue': '英语口语对话',
                    'nd_enoral_composition': '英语口语作文'
                },
                'gotoAnswer': '去答题',
                'gotoViewAnswer': '去查看答案',
                'commit': '确定',
                'edit': '编辑',
                'cancel': '取消',
                'questionBank': {
                    'addErrorReason': '+添加错因',
                    'makeEmphasis': '标记为重点',
                    'cancelEmphasis': '取消标记为重点',
                    'addToQuestionBank': '加入错题本',
                    'inQuestionBank': '已加入错题本',
                    'errorReason': '错因',
                    'createErrorReason': '创建',
                    'enterErrorReason': '请输入错因',
                    'editReasonBtnTitlt': '完成',
                    'headerTitle': '查看答案&解析',
                    'systemTitle': '系统提示',
                    'deleteTitle': '确认删除\uFF1F',
                    'note': '笔记',
                    'noteTitle': '写下对这道题心得感想吧~'
                },
                'gotoLearn': '去学习',
                'quiz': '提问'
            }
        },
        _init: function () {
            var tmpl = '                <div class="ln-work w-test-item" data-bind="css: {\'w-item-hover\':$root.hover(),\'w-item-nosure\':$root.ispapermode() && $root.nosure()}">                    <div data-bind="if: !$root.isInteractiveQuestion()">                        <div class="wt-item-body qti-container""></div>                    </div>                    <div data-bind="if: $root.isInteractiveQuestion()">                        <div class="wt-item-body icp-interactive">                            <div class="head">                                <span data-bind="text: $root.num() + \'\u3001\'"></span>                                <span data-bind="text: \'(\' + $root.getQuestionTypeName() + \')\'"></span>                                <div class="body" data-bind="html: $root.getInteractiveQuestionBody()"></div>                            </div>                            <div class="body">                                <a target="_blank" data-bind="visible: !$root.showAnswer(), attr: { href: $root.getInteractiveQuestionAnswerUrl() }, text: $root.i18n.gotoAnswer"></a>                                <a target="_blank" data-bind="visible: $root.showAnswer(), attr: { href: $root.getInteractiveQuestionAnswerUrl() }, text: $root.i18n.gotoViewAnswer"></a>                            </div>                        </div>                    </div>                    <div class="wt-item-analysis-container" data-bind="visible: $root.showAnswer() && $root.showQuestionBank()">                        <div class="wt-container-header">                            <div class="title">                                <a class="icon" data-bind="visible: $root.isInQuestionBank(), css: {\'down\': $root.isInQuestionBank(), \'up\': !$root.isInQuestionBank() },click: $root.slideAnalysisSection" href="javascript:;"></a>                                <span data-bind="text: $root.i18n.questionBank.headerTitle"></span>                            </div>                            <div class="toolbar" data-bind="visible: $root.showQuestionBank()">                                <a class="ln-btn ln-btn-small" data-bind="click: $root.gotoReason,visible: $root.isInQuestionBank(), text: $root.i18n.questionBank.addErrorReason" href="javascript:;"></a>                                <a class="ln-btn ln-btn-small" data-bind="click: $root.setEmphasisQuestion, visible: $root.isInQuestionBank() && !$root.isKeyWrongQuestion(), text: $root.i18n.questionBank.makeEmphasis" href="javascript:;"></a>                                <a class="ln-btn ln-btn-small" data-bind="click: $root.cancelEmphasisQuestion, visible: $root.isInQuestionBank() && $root.isKeyWrongQuestion(), text: $root.i18n.questionBank.cancelEmphasis" href="javascript:;">取消标为重点</a>                                <a class="ln-btn ln-btn-small" data-bind="click: $root.addToQuestionBank, visible: !$root.isInQuestionBank(), text: $root.i18n.questionBank.addToQuestionBank" href="javascript:;">加入错题本</a>                                <a class="ln-btn ln-btn-small disabled" data-bind="visible: $root.isInQuestionBank(), text: $root.i18n.questionBank.inQuestionBank" href="javascript:;">已加入错题本</a>                            </div>                        </div>                        <div class="wt-container-bd" data-bind="visible: $root.isInQuestionBank() && $root.showQuestionBank()">                            <div class="wt-reason-bd">                                <div class="title">                                    <a class="icon err" href="javascript:;"></a>                                    <span data-bind="text: $root.i18n.questionBank.errorReason"></span>                                </div>                                <div class="item">                                    <div class="col-1">                                        <!--ko foreach: $root.questionErrorReasons-->                                            <!--ko if: type()==="wrong_reason"-->                                                <a class="tag seled" data-bind="text: value" href="javascript:;"></a>                                            <!--/ko-->                                        <!--/ko-->                                        <a class="ln-btn ln-btn-small" data-bind="click: $root.showAddReasonElement,text: $root.getAddReasonText" href="javascript:;"></a>                                    </div>                                </div>                            </div>                            <div class="wt-reason-edit-bd" style="display: none;">                                <div class="item" style="margin: 10px 0 0 0;">                                    <div class="dg-form">                                        <div>                                            <!--ko foreach: $root.errorReasons-->                                                <!--ko if: type()==="wrong_reason"-->                                                    <a class="tag" data-bind="click: $root.onTagClick, text: value, attr:{ \'data-id\': id, \'data-sel\': $root.hasBeenAssociated($data) ? 1 : 0 }, css: { sel: $root.hasBeenAssociated($data) }" href="javascript:;"></a>                                                    <div class="pop" style="display: none;">                                                        <i class="icon edit" data-bind="click: $root.showEditReasonBody"></i>                                                        <i class="icon del" data-bind="click: $root.delErrorReason"></i>                                                    </div>                                                    <div class="r-edit" style="display: none;">                                                        <input type="text" data-bind="value: value" maxlength="15">                                                        <a class="ln-btn ln-btn-small" data-bind="text: $root.i18n.questionBank.editReasonBtnTitlt,click: $root.updateErrorReason" href="javascript:;"></a>                                                    </div>                                                <!--/ko-->                                            <!--/ko-->                                        </div>                                        <div class="txt-reason">                                            <input data-bind="attr: {placeHolder: $root.i18n.questionBank.enterErrorReason}" type="text" maxlength="15" />                                            <a class="ln-btn ln-btn-small" data-bind="click: $root.addErrorReason, text: $root.i18n.questionBank.createErrorReason" href="javascript:;" style="vertical-align: middle;">创建</a>                                        </div>                                        <div class="ft">                                            <a class="ln-btn ln-btn-small" data-bind="text: $root.i18n.commit, click: $root.showReasonBody" href="javascript:;"></a>                                        </div>                                    </div>                                </div>                            </div>                            <div class="wt-note-bd">                                <div class="title">                                    <a class="icon err" href="javascript:;"></a>                                    <span data-bind="text: $root.i18n.questionBank.note"></span>                                </div>                                <div class="item">                                    <div class="col-1">                                        <p data-bind="visible: !$root.isNoteEdit() && $root.noteContent, text: $root.noteContent"></p>                                        <textarea data-bind="visible: $root.isNoteEdit(), value: $root.noteContent, attr:{\'placeholder\': $root.i18n.questionBank.noteTitle}" maxlength="400"></textarea>                                        <div>                                            <a class="ln-btn ln-btn-small" data-bind="visible: !$root.isNoteEdit(), click: function() { $root.isNoteEdit(true) },text: $root.getAddReasonText" href="javascript:;"></a>                                            <a class="ln-btn ln-btn-small" data-bind="visible: $root.isNoteEdit(), click: function() { $root.updateNote($element) },text: $root.i18n.commit" href="javascript:;"></a>                                        </div>                                    </div>                                </div>                            </div>                        </div>                    </div>                    <div style="margin: 20px 0 0 45px;">                        <div data-bind="visible: !$root.commitBtnEnabled()">                            <a class="ln-btn disabled" href="javascript:void(0);" data-bind="visible: $root.showCommit(), text: $root.i18n.commit()"></a>                        </div>                        <div data-bind="visible: $root.commitBtnEnabled()">                            <a class="ln-btn" href="javascript:void(0);" data-bind="visible: $root.showCommit(), click: $root.commit, text: $root.i18n.commit()"></a>                        </div>                    </div>                    <div class="wt-item-btns"><a href="javascript:;" data-bind="attr: { title: $root.uncertain }"></a></div>                </div>                ';
            var that = this;
            this.element.empty().html(tmpl);
            this.options.uncertain = this.options.i18n.temporarilyUncertain;
            var op = this.options;
            this._inner = $('.ln-work', this.element);
            var vm = ko.mapping.fromJS(op);
            this._vm = vm;
            this._vm.isNoteEdit = ko.observable(false);
            this._vm.noteContent = ko.computed(function () {
                return this.note ? ko.unwrap(this.note.content) : '';
            }, this._vm);
            this._vm.updateNote = $.proxy(function (element) {
                var content = $.trim($(element).closest('.item').find('textarea').val());
                var data = {
                    'note_id': '',
                    'note': null
                };
                if (content) {
                    data.note = {
                        'content': content,
                        'target_id': 'questionbank:' + this._vm.questionInBankId(),
                        'target_name': 'questionbank',
                        'is_open': false
                    };
                    if (this._vm.note && this._vm.note.id()) {
                        data.note_id = this._vm.note.id();
                        this._trigger('updateNote', null, data);
                    } else {
                        this._trigger('createNote', null, data);
                    }
                } else {
                    this._trigger('deleteNote', null, this._vm.note.id());
                }
                this._vm.isNoteEdit(false);
            }, this);
            $('.dg-form .tag').live('mouseenter', function (evt) {
                var tPosition = $(evt.target).position();
                var left = tPosition.left + ($(evt.target).width() - 15);
                var top = tPosition.top - 10;
                $('.pop').hide();
                $(evt.target).next().css('top', top + 'px').css('left', left + 'px').show();
            }).live('mouseleave', function (evt) {
                $('.pop').hide();
            });
            $('.pop').live('mouseenter', function (evt) {
                if ($(evt.target).hasClass('pop')) {
                    $(evt.target).show();
                } else {
                    $(evt.target).parent().show();
                }
            }).live('mouseleave', function (evt) {
                if ($(evt.target).hasClass('pop')) {
                    $(evt.target).hide();
                } else {
                    $(evt.target).parent().hide();
                }
            });
            this._vm.showEditReasonBody = $.proxy(function (context, evt) {
                var oldValue = $(evt.target).parent().prev().text();
                $(evt.target).parent().prev().data('oldvalue', oldValue);
                $(evt.target).closest('.dg-form').find('div .tag').show();
                $(evt.target).closest('.dg-form').find('div .r-edit').hide();
                $(evt.target).parent().hide().prev().hide();
                $(evt.target).parent().next().show();
            }, this);
            this._vm.delErrorReason = $.proxy(function (context, evt) {
                var that = this;
                context = ko.mapping.toJS(context);
                $.fn.udialog.confirm2(that.options.i18n.questionBank.deleteTitle, {
                    title: that.options.i18n.questionBank.systemTitle,
                    disabledClose: true,
                    buttons: [
                        {
                            text: that.options.i18n.commit,
                            click: function () {
                                var reasonId = context.id;
                                var reasons = that._vm.errorReasons();
                                for (var i = reasons.length - 1; i >= 0; i--) {
                                    if (reasonId == reasons[i].id()) {
                                        reasons.splice(i, 1);
                                    }
                                }
                                that._vm.errorReasons(reasons);
                                that._trigger('deleteErrorReason', null, {
                                    'questionId': that.options.questionInBankId,
                                    'reason': context.value
                                });
                                $(this)['udialog']('hide');
                            }
                        },
                        {
                            text: that.options.i18n.cancel,
                            click: function () {
                                var t = $(this);
                                t['udialog']('hide');
                            },
                            'class': 'default-btn'
                        }
                    ]
                });
            }, this);
            this._vm.gotoNote = $.proxy(function (context, evt) {
                var parentTop = $(evt.target).closest('.wt-item-analysis-container').find('.wt-container-bd').position().top;
                var noteTop = $(evt.target).closest('.wt-item-analysis-container').find('.wt-container-bd>.wt-note-bd').position().top;
                $(window).scrollTop(parentTop + noteTop - 108);
            }, this);
            this._vm.gotoReason = $.proxy(function (context, evt) {
                var parentTop = $(evt.target).closest('.wt-item-analysis-container').find('.wt-container-bd').position().top;
                var noteTop = $(evt.target).closest('.wt-item-analysis-container').find('.wt-container-bd>.wt-reason-bd').position().top;
                $(window).scrollTop(parentTop + noteTop - 108);
            }, this);
            this._vm.getAddReasonText = ko.computed(function () {
                var reasons = Enumerable.from(ko.mapping.toJS(this._vm.questionErrorReasons)).where('$.user_question_id=\'' + this.options.question.Id + '\'').toArray();
                if (reasons && reasons.length > 0)
                    return '编辑';
                return '+添加错因';
            }, this);
            this._vm.isInQuestionBank = $.proxy(function () {
                var questioId = this.options.questionInBankId;
                var tags = Enumerable.from(ko.mapping.toJS(this._vm.questionErrorReasons)).where(function (item) {
                    if (item.type == 'wrong_question' && item.userQuestionId == questioId)
                        return true;
                    return false;
                }).toArray();
                if (tags && tags.length > 0) {
                    return true;
                }
                return false;
            }, this);
            this._vm.tempTags = ko.observable([]);
            this._vm.onTagClick = $.proxy(function (context, evt) {
                var sel = $(evt.target).data('sel');
                if (Boolean(sel)) {
                    $(evt.target).removeClass('sel').data('sel', 0);
                } else {
                    $(evt.target).addClass('sel').data('sel', 1);
                }
            }, this);
            this._vm.hasBeenAssociated = $.proxy(function (data) {
                data = ko.mapping.toJS(data);
                var reasons = Enumerable.from(ko.mapping.toJS(this._vm.questionErrorReasons)).where(function (item) {
                    if (item.userQuestionTagId == data.id)
                        return true;
                    return false;
                }).toArray();
                if (reasons && reasons.length > 0) {
                    return true;
                }
                return false;
            }, this);
            this._vm.isKeyWrongQuestion = ko.observable(this.isKeyWrongQuestion());
            this._vm.addToQuestionBank = $.proxy(function () {
                this._trigger('addToQuestionBank', null, { 'questionId': this.options.questionInBankId });
            }, this);
            this._vm.setEmphasisQuestion = $.proxy(function () {
                this._vm.isKeyWrongQuestion(true);
                this._trigger('setEmphasisQuestion', null, { 'questionId': this.options.questionInBankId });
            }, this);
            this._vm.cancelEmphasisQuestion = $.proxy(function () {
                this._vm.isKeyWrongQuestion(false);
                this._trigger('removeEmphasisQuestion', null, { 'questionId': this.options.questionInBankId });
            }, this);
            this._vm.addErrorReason = $.proxy(function (context, evt) {
                var data = {
                    'type': 'wrong_reason',
                    'value': $(evt.target).prev().val()
                };
                this._trigger('addErrorReason', null, data);
                $(evt.target).prev().val('');
            }, this);
            this._vm.updateErrorReason = $.proxy(function (context, evt) {
                $(evt.target).parent().hide().prev().prev().show();
                var data = {
                    'reasonId': context.id(),
                    'reason': {
                        'type': 'wrong_reason',
                        'value': $(evt.target).prev().val(),
                        'oldValue': $(evt.target).parent().prev().prev().data('oldvalue')
                    }
                };
                this._trigger('updateErrorReason', null, data);
            }, this);
            this._vm.deleteErrorReason = $.proxy(function () {
                var data = {
                    'questionId': this.options.questionInBankId,
                    'reason': {
                        'type': 'wrong_reason',
                        'value': 'reason_id'
                    }
                };
                this._trigger('deleteErrorReason', null, data);
            }, this);
            this._vm.updateQuestionTags = $.proxy(function (evt) {
                var tagEls = $(evt.target).closest('.dg-form').find('div>.tag.sel');
                var reasons = [];
                for (var i = 0; i < tagEls.length; i++) {
                    reasons.push($(tagEls[i]).data('id'));
                }
                var data = {
                    'questionId': this.options.questionInBankId,
                    'reason': {
                        'type': 'wrong_reason',
                        'value': reasons
                    }
                };
                this._trigger('updateQuestionTags', null, data);
            }, this);
            this._vm.showAddReasonElement = $.proxy(function (context, evt) {
                $(evt.target).closest('.wt-item-analysis-container').find('.wt-reason-bd, .wt-note-bd').hide();
                $(evt.target).closest('.wt-item-analysis-container').find('.wt-reason-edit-bd').show();
            }, this);
            this._vm.showReasonBody = $.proxy(function (context, evt) {
                this._vm.updateQuestionTags(evt);
                $(evt.target).closest('.dg-form').find('div .tag').show();
                $(evt.target).closest('.dg-form').find('div .r-edit').hide();
                $(evt.target).closest('.wt-item-analysis-container').find('.wt-reason-bd, .wt-note-bd').show();
                $(evt.target).closest('.wt-item-analysis-container').find('.wt-reason-edit-bd').hide();
            }, this);
            this._vm.slideAnalysisSection = $.proxy(function (context, evt) {
                if (!this._vm.isInQuestionBank())
                    return false;
                var contextEl = $(evt.target).closest('.wt-item-analysis-container');
                var analysisEl = contextEl.find('.wt-item-analysis');
                if ($(evt.target).hasClass('down')) {
                    $(evt.target).removeClass('down').addClass('up').closest('.wt-item-analysis-container').find('.wt-item-analysis,.wt-container-bd').hide();
                } else {
                    $(evt.target).removeClass('up').addClass('down');
                    contextEl.find('.wt-container-bd').show();
                    if (analysisEl.data('display') != 'none') {
                        contextEl.find('.wt-item-analysis').show();
                    }
                }
            }, this);
            this._vm.getQuestionType = $.proxy(function () {
                var items = ko.mapping.toJS(this.question.items);
                return items[0].type;
            }, this._vm);
            this._vm.isInteractiveQuestion = $.proxy(function () {
                return this.question.items ? false : true;
            }, this._vm);
            this._vm.isSingleQuestion = $.proxy(function () {
                if (!Array.prototype.indexOf) {
                    Array.prototype.indexOf = function (elt) {
                        var len = this.length >>> 0;
                        var from = Number(arguments[1]) || 0;
                        from = from < 0 ? Math.ceil(from) : Math.floor(from);
                        if (from < 0)
                            from += len;
                        for (; from < len; from++) {
                            if (from in this && this[from] === elt)
                                return from;
                        }
                        return -1;
                    };
                }
                if (this.question.items && this.question.items().length > 0) {
                    var allowTypes = [
                        'judge',
                        'choice'
                    ];
                    var type = ko.mapping.toJS(this.question.items)[0].type;
                    return allowTypes.indexOf(type) >= 0;
                } else {
                    return this.question.items ? false : true;
                }
            }, this._vm);
            this._vm.getInteractiveQuestionBody = $.proxy(function () {
                return '';
            }, this._vm);
            this._vm.isEnglishQuestion = $.proxy(function () {
                var question = ko.mapping.toJS(this.question);
                switch (question.res_type) {
                case '$RE0463':
                case '$RE0462':
                case '$RE0461':
                case '$RE0460':
                case '$RE0459':
                case '$RE0434':
                case '$RE0443':
                    return true;
                default:
                    return false;
                }
            }, this._vm);
            this._vm.getInteractiveQuestionAnswerUrl = $.proxy(function () {
                if (this.isEnglishQuestion()) {
                    if (this.showAnswer()) {
                        return ko.unwrap(this.host) + '/exam/detection/analysis/' + ko.unwrap(this.examId) + '?question_id=' + ko.unwrap(this.questionId) + '&session_id=' + ko.unwrap(this.sessionId);
                    } else {
                        var host = ko.unwrap(this.host).replace('http://', 'https://');
                        return host + '/exam/detection/reading/' + ko.unwrap(this.examId) + '?question_id=' + ko.unwrap(this.questionId) + '&session_id=' + ko.unwrap(this.sessionId);
                    }
                } else {
                    return ko.unwrap(this.host) + '/exam/' + ko.unwrap(this.examId) + '/icplayer/index?_lang_=zn_CN&inject=answerFlow&question_id=' + ko.unwrap(this.questionId) + '&session_id=' + ko.unwrap(this.sessionId);
                }
            }, this._vm);
            this._vm.getQuestionTypeName = $.proxy(function () {
                var question = ko.mapping.toJS(this.question);
                switch (question.res_type) {
                case '$RE0401':
                    return this.i18n.questionType.ndLinkupOld();
                case '$RE0402':
                    return this.i18n.questionType.ndOrder();
                case '$RE0426':
                    return this.i18n.questionType.ndProbabilitycard();
                case '$RE0416':
                    return this.i18n.questionType.fraction();
                case '$RE0407':
                    return this.i18n.questionType.memorycard();
                case '$RE0415':
                    return this.i18n.questionType.classified();
                case '$RE0403':
                    return this.i18n.questionType.table();
                case '$RE0418':
                    return this.i18n.questionType.pointsequencing();
                case '$RE0408':
                    return this.i18n.questionType.arithmetic();
                case '$RE0414':
                    return this.i18n.questionType.textselect();
                case '$RE0411':
                    return this.i18n.questionType.magicbox();
                case '$RE0406':
                    return this.i18n.questionType.wordpuzzle();
                case '$RE0410':
                    return this.i18n.questionType.guessword();
                case '$RE0421':
                    return this.i18n.questionType.fillblank();
                case '$RE0409':
                    return this.i18n.questionType.compare();
                case '$RE0463':
                    return this.i18n.questionType.nd_enoral_composition();
                case '$RE0462':
                    return this.i18n.questionType.nd_enoral_dialogue();
                case '$RE0461':
                    return this.i18n.questionType.nd_enoral_paragraph();
                case '$RE0460':
                    return this.i18n.questionType.nd_enoral_sentence();
                case '$RE0459':
                    return this.i18n.questionType.nd_enoral_word();
                case '$RE0434':
                    return this.i18n.questionType.nd_sentence_evaluat();
                case '$RE0443':
                    return this.i18n.questionType.nd_section_evaluating();
                default:
                    return this.i18n.questionType.interactive();
                }
            }, this._vm);
            this._vm.diff = function (a, b) {
                return a.filter(function (i) {
                    return b.indexOf(i) < 0;
                });
            };
            this._vm.showCommit = function () {
                return !this.showAnswer() && !this.isSingleQuestion() && (this.mode && this.mode() == 4);
            };
            this._vm.commit = $.proxy(function () {
                this._onShowAnalysis();
            }, this);
            var answer = ko.unwrap(this._vm.result.Answers);
            this._vm.commitBtnEnabled = ko.observable(answer.length != undefined ? false : true);
            this._trigger('inited', null, this._ui());
            ko.applyBindings(this._vm, this._inner[0]);
            if (this._vm.ispapermode() && this._vm.editable()) {
                $(this.element).eq(0).unbind('hover', $.proxy(this._onQuestionHover, this)).hover($.proxy(this._onQuestionHover, this));
                $('.wt-item-btns', this.element).unbind('click', $.proxy(this._onNosuerClick, this)).click($.proxy(this._onNosuerClick, this));
            }
            if (!this._vm.isInteractiveQuestion()) {
                this._initPlayer();
            }
        },
        _initPlayer: function () {
            var option = {
                refPath: ko.unwrap(this._vm.qtiPath.refPath),
                unifyTextEntry: true
            };
            this.player = window.QtiPlayer.createPlayer(option);
            this._displayQuestion();
            this._vm.player = this.player;
        },
        _onQuestionHover: function (evt) {
            if (!this._vm.ispapermode())
                return;
            ko.dataFor($(evt.currentTarget).find('.w-test-item')[0]).hover(evt.type == 'mouseenter');
        },
        _onNosuerClick: function () {
            var result = !this._vm.nosure();
            this._vm.nosure(result);
            if (result)
                this._vm.uncertain(this._vm.i18n.cancelTemporarilyUncertain());
            else
                this._vm.uncertain(this._vm.i18n.temporarilyUncertain());
            this._trigger('nosureHandle', null, this._ui({
                nosure: result,
                num: this._vm.num()
            }));
        },
        _displayQuestion: function () {
            this.player.load(ko.mapping.toJS(this._vm.question), $.proxy(function () {
                var renderOption = {
                    'skin': 'elearning',
                    'showQuestionName': true,
                    'showNum': this._vm.showQuestionNum(),
                    'showAnswer': true,
                    'sequenceNumber': this._vm.num(),
                    'showLock': !this._vm.editable(),
                    'sequenceNumber': this._vm.num()
                };
                if (ko.unwrap(this._vm.result) && ko.unwrap(this._vm.result.Answers)) {
                    var as = ko.mapping.toJS(this._vm.result.Answers);
                    if (Array.isArray(as))
                        as.length > 0 && this.player.setAnswer(as);
                    else
                        this.player.setAnswer(as);
                }
                this.player.render($('.wt-item-body.qti-container', this._inner), renderOption, $.proxy(function () {
                    this.player.answerOnChange($.proxy(this._onAnswerChanged, this));
                }, this));
            }, this));
        },
        _onAnswerChanged: function (answer) {
            if (!this._vm.editable())
                return;
            var state = this.player.getAnswerState();
            this._vm.result.Result(state.completionStatus == 'INCOMPLETE' ? 0 : 7);
            this._vm.result.Answers = answer;
            this._trigger('changed', null, this._ui());
            var flag = false;
            for (var item in answer) {
                answer[item].value.length > 0 && (flag = true);
            }
            this._vm.commitBtnEnabled(flag);
            if (this._vm.isSingleQuestion()) {
                this._onShowAnalysis();
            }
        },
        _onShowAnalysis: function () {
            this._trigger('showAnalysis', null, this._ui());
        },
        _ui: function (v) {
            return $.extend({ viewModel: this._vm }, v);
        },
        onDomReady: function () {
            if (this._vm.showAnswer() && !this._vm.isInteractiveQuestion()) {
                var analysis = ko.mapping.toJS(this._vm.analysisData);
                analysis.item.items = Enumerable.from(analysis.item.items).toArray();
                var ref_path = 'http://sdpcs.beta.web.sdp.101.com/v0.1/static';
                var explanations = Enumerable.from(analysis.item.feedbacks).where('$.identifier=="showAnswer"').toArray();
                var responseArray = Enumerable.from(analysis.item.responses).toArray();
                for (var i = 0; i < analysis.item.items.length; i++) {
                    var vm = {}, isComplex = false;
                    if ((analysis.item.resType == '$RE0208' || analysis.item.resType == '$RE0237') && i == 0) {
                        continue;
                    } else if (analysis.item.resType == '$RE0208' || analysis.item.resType == '$RE0237') {
                        isComplex = true;
                        vm = {
                            questionType: analysis.item.items[i].type,
                            i18n: this._vm.i18n,
                            standardAnswer: analysis.item.items[i].type != 'data' ? i - 1 < responseArray.length ? responseArray[i - 1].corrects.join() : '' : this.getAnalysisCorrectAnswer(responseArray, i),
                            status: analysis.items[i - 1].questionAnswerStatus ? analysis.items[i - 1].questionAnswerStatus : 7,
                            explanation: explanations[i - 1].content.replace('${ref-path}', ref_path),
                            showQuestionBank: this._vm.showQuestionBank(),
                            'showGotoLearnButton': this._vm.showGotoLearnButton(),
                            'showQuizButton': this._vm.showQuizButton(),
                            'showErrorButton': this._vm.showErrorButton(),
                            'hideErrorButton': this._vm.hideErrorButton()
                        };
                    } else {
                        vm = {
                            questionType: analysis.item.items[i].type,
                            i18n: this._vm.i18n,
                            standardAnswer: analysis.item.items[i].type != 'data' ? i < responseArray.length ? responseArray[i].corrects.join() : '' : this.getAnalysisCorrectAnswer(responseArray, i + 1),
                            status: analysis.items[i].questionAnswerStatus ? analysis.items[i].questionAnswerStatus : 7,
                            explanation: explanations[i].content.replace('${ref-path}', ref_path),
                            showQuestionBank: this._vm.showQuestionBank(),
                            'showGotoLearnButton': this._vm.showGotoLearnButton(),
                            'showQuizButton': this._vm.showQuizButton(),
                            'showErrorButton': this._vm.showErrorButton(),
                            'hideErrorButton': this._vm.hideErrorButton()
                        };
                    }
                    var templateHtml = '                            <div class="wt-item-analysis" style="display:block;">                                <div class="wt-analysis-hd" style="padding-left: 13px;">                                    <div class="clearfix wt-analysis-enum" data-bind="if: questionType() != \'textentry\' && questionType()!= \'extendedtext\' && $root.questionType() != \'data\'">                                        <div class="left">                                            <strong data-bind="html: $root.i18n.rightAnswerLabel() + \'[\'+ $root.standardAnswer() +\']\'"></strong>                                            <strong data-bind="visible:$root.status() == 5, text: $root.i18n.answerRightTitle"></strong>                                            <b data-bind="visible:$root.status() == 7 || $root.status() == 9, text: $root.i18n.answerWrongTitle"></b>                                            <b data-bind="visible:$root.status() == 0, text: $root.i18n.notAnswer"></b>                                            <b data-bind="visible:$root.status() == 1, text: $root.i18n.noMarkTitle"></b>                                        </div>                                        <div class="right">                                            <a class="ln-btn ln-btn-small go-learn" data-bind="visible: $root.showGotoLearnButton() && ($root.status() == 7 || $root.status() == 9), text: $root.i18n.gotoLearn" href="javascript:;"></a>                                            <a class="ln-btn ln-btn-small go-question" data-bind="visible: $root.showQuizButton(), text: $root.i18n.quiz" href="javascript:;"></a>                                            <a class="co-ln-btn ln-btn-small go-error" data-bind="visible: $root.showErrorButton(), text: $root.i18n.questionBank.addToQuestionBank" href="javascript:;"></a>                                            <a class="co-ln-btn ln-btn-small disabled" data-bind="visible: $root.hideErrorButton(), text: $root.i18n.questionBank.inQuestionBank" href="javascript:;" style="height: 29px;"></a>                                        </div>                                    </div>                                    <div class="clearfix wt-analysis-enum" data-bind="if: $root.questionType()== \'data\' || $root.questionType()== \'textentry\' || $root.questionType()== \'extendedtext\'">                                        <div class="left">                                            <strong data-bind="html: $root.i18n.rightAnswerLabel()"></strong>                                            <div class="wt-answer-txt" data-bind="html:$root.standardAnswer()"></div>                                        </div>                                        <div class="right">                                            <a class="co-ln-btn ln-btn-small go-error" data-bind="visible: $root.showErrorButton(), text: $root.i18n.questionBank.addToQuestionBank" href="javascript:;"></a>                                            <a class="co-ln-btn ln-btn-small disabled" data-bind="visible: $root.hideErrorButton(), text: $root.i18n.questionBank.inQuestionBank" href="javascript:;" style="height: 29px;"></a>                                        </div>                                    </div>                                    <div class="toobar" data-bind="visible: $root.showQuestionBank()">                                    </div>                                     <div class="wt-analysis-bd">                                        <i class="analysis-tip"></i>                                    <div class="wt-analysis-txt" data-bind="html:$root.explanation()"></div>                                </div>                            </div>                        ';
                    var el = $(templateHtml);
                    vm = ko.mapping.fromJS(vm);
                    ko.applyBindings(vm, el[0]);
                    var qid = isComplex ? 'RESPONSE_' + i + '-1' : 'RESPONSE_' + (i + 1) + '-1';
                    this.player.setExtrasAnswer({
                        modelId: qid,
                        extraHtml: el[0].outerHTML
                    }, true);
                    $('.wt-item-analysis').off('click', '.go-learn').on('click', '.go-learn', $.proxy(function () {
                        this._vm.learnButtonClick();
                    }, this));
                    $('.wt-item-analysis').off('click', '.go-question').on('click', '.go-question', $.proxy(function () {
                        this._vm.questionButtonClick();
                    }, this));
                    $('.wt-item-analysis').off('click', '.go-error').on('click', '.go-error', $.proxy(function () {
                        this._vm.errorButtonClick();
                    }, this));
                }
            }
        },
        getAnalysisCorrectAnswer: function (responseArray, questionIndex) {
            var standardAnswer = '';
            for (var i = 0; i < responseArray.length; i++) {
                if (this.startWith(responseArray[i].identifier, 'RESPONSE_' + questionIndex)) {
                    standardAnswer += '\u3010' + responseArray[i].corrects.join() + '\u3011';
                }
            }
            return standardAnswer;
        },
        startWith: function (str, value) {
            if (value == null || value == '' || str.length == 0 || value.length > str.length)
                return false;
            if (str.substr(0, value.length) == value)
                return true;
            else
                return false;
            return true;
        },
        updateQuestionRelateTag: function (data) {
            this._vm.questionErrorReasons.push(ko.mapping.fromJS(data));
        },
        updateErrorReasons: function (data) {
            this._vm.errorReasons.push(ko.mapping.fromJS(data));
        },
        updateErrorReasonById: function (data) {
            var errorReasons = ko.mapping.toJS(this._vm.errorReasons);
            for (var i = 0; i < errorReasons.length; i++) {
                if (errorReasons[i].id == data.id) {
                    this._vm.errorReasons()[i].value(data.reason.oldValue);
                }
            }
        },
        updateQuestionReasons: function (data) {
            var qrs = this._vm.questionErrorReasons();
            for (var i = qrs.length - 1; i >= 0; i--) {
                if (qrs[i].type() == 'wrong_reason')
                    qrs.splice(i, 1);
            }
            for (var i = 0; i < data.length; i++) {
                qrs.push(ko.mapping.fromJS(data[i]));
            }
            this._vm.questionErrorReasons(qrs);
        },
        updateShowError: function (data) {
            $('.go-error').css('display', 'none').next().css('display', 'inline-block');
        },
        updateNote: function (data) {
            if (this._vm.note) {
                this._vm.note.id(data.id);
                this._vm.note.userId(data.userId);
                this._vm.note.projectId(data.projectId);
                this._vm.note.content(data.content);
                this._vm.note.targetId(data.targetId);
                this._vm.note.targetName(data.targetName);
                this._vm.note.isOpen(data.isOpen);
                this._vm.note.createTime(data.createTime);
                this._vm.note.updateTime(data.updateTime);
                this._vm.note.praiseCount(data.praiseCount);
            } else {
                this._vm.note = {
                    'id': ko.observable(data.id),
                    'userId': ko.observable(data.userId),
                    'projectId': ko.observable(data.projectId),
                    'content': ko.observable(data.content),
                    'targetId': ko.observable(data.targetId),
                    'targetName': ko.observable(data.targetName),
                    'isOpen': ko.observable(data.isOpen),
                    'createTime': ko.observable(data.createTime),
                    'updateTime': ko.observable(data.updateTime),
                    'praiseCount': ko.observable(data.praiseCount)
                };
            }
        },
        deleteNote: function () {
            this._vm.note.content('');
            this._vm.note.id(null);
        },
        isKeyWrongQuestion: function () {
            var questioId = this.options.questionInBankId;
            var tags = Enumerable.from(ko.mapping.toJS(this._vm.questionErrorReasons)).where('$.type==\'key_wrong_question\' && $.userQuestionId == ' + '\'' + questioId + '\'').toArray();
            if (tags && tags.length > 0)
                return true;
            return false;
        },
        resetKeyWrongQuestionStatus: function () {
            this._vm.isKeyWrongQuestion(false);
        }
    });
}(jQuery));
define('studying.qtiquestion', [], function () {
    return;
});
(function ($) {
    $.widget('studying.completion', {
        options: {
            id: 0,
            sub: 1,
            ops: [
                '我会做',
                '我不会做'
            ],
            curIndex: -1,
            answer: {
                Answer: null,
                Result: 0
            },
            showAnswer: false,
            ispapermode: false,
            changed: function (e, ui) {
            },
            inited: function () {
            }
        },
        _historyAnswer: '',
        _init: function () {
            var paperTmpl = '                <div class="wt-item-options" data-bind="foreach: ops">                    <div class="wt-item-option">                        <label data-bind="text: content() + \')\'"></label>                        <input type="text" maxlength="50" data-bind="disable: $root.showAnswer, value: answer">                    </div>                </div>';
            var op = this.options, vm = $.extend({}, op, {
                    curIndex: !op.answer.Result ? -1 : op.answer.Result == 1 ? 0 : 1,
                    ops: Enumerable.from(op.ops).select(function (n, i) {
                        var answer = op.answer.Answer == '' ? null : JSON.parse(op.answer.Answer);
                        var optionAnswer = Enumerable.from(answer).firstOrDefault(null, '$.index==' + (i + 1));
                        return {
                            item: i,
                            content: n,
                            standarded: !i && op.showAnswer,
                            answer: optionAnswer ? optionAnswer.value : ''
                        };
                    }).toArray()
                });
            this.element.html(paperTmpl);
            this._vm = ko.mapping.fromJS(vm);
            this._vm.curIndex.subscribe(function (nv) {
                switch (nv) {
                case 1:
                    this._historyAnswer = this._vm.answer.Answer();
                    this._vm.answer.Answer('###');
                    break;
                case 0:
                    this._vm.answer.Answer(this._historyAnswer || ' ');
                    break;
                }
                this._trigger('changed', null, this._ui());
            }, this);
            this._inner = $('.wt-item-options', this.element);
            this._trigger('inited', null, this._ui());
            ko.applyBindings(this._vm, this._inner[0]);
            $('input', this._inner).focusout($.proxy(this._textchange, this));
        },
        _textchange: function (evt) {
            var answers = [];
            for (var i = 0; i < this._vm.ops().length; i++) {
                var answer = ko.unwrap(this._vm.ops)[i].answer();
                if (answer) {
                    var tempAnswer = {
                        'type': 'sequence',
                        'index': [i + 1],
                        'value': [answer]
                    };
                    answers.push(tempAnswer);
                }
            }
            this._vm.answer.Answer(answers.length > 0 ? JSON.stringify(answers) : '');
            this._trigger('changed', null, this._ui());
        },
        _optionHover: function (evt) {
            var o = ko.dataFor(this), d = ko.contextFor(this);
            if (d.$parent.showAnswer()) {
                return;
            }
            evt.type == 'mouseenter' ? o.hovered(true) : o.hovered(false);
        },
        _optionChange: function (evt) {
            var o = ko.dataFor(this), d = ko.contextFor(this);
            if (d.$parent.showAnswer()) {
                return;
            }
            d.$parent.curIndex(o.item());
        },
        _ui: function () {
            return { viewModel: this._vm };
        }
    });
}(jQuery));
define('studying.completion', [], function () {
    return;
});
(function ($) {
    $.widget('studying.subjective', {
        options: {
            id: 0,
            sub: 1,
            ops: [
                '我会做',
                '我不会做'
            ],
            curIndex: -1,
            answer: {
                Answer: '',
                Result: 0
            },
            showAnswer: false,
            ispapermode: false,
            changed: function (e, ui) {
            },
            inited: function () {
            },
            i18n: {
                attachement: '附件\uFF1A',
                uploadTitle: '(附件允许上传图片文件\uFF0C最大不超过10M)',
                uploadingText: '上传中\uFF1A',
                downloadAttachement: '点击下载',
                selectFileText: '请选择文件...',
                fileLimitSize: '选择的文件过大',
                sureBtn: '确定',
                uploadError: {
                    HTTP: '请求错误',
                    ABORT: '上传中止',
                    SERVER: '服务器错误',
                    ERROE_HEADER: '上传错误\uFF1A',
                    INVALID_FILETYPE: '不支持的文件类型',
                    FILE_EXCEEDS_SIZE_LIMIT: '文件尺寸过大',
                    ZERO_BYTE_FILE: '零字节文件'
                }
            }
        },
        _historyAnswer: '',
        _init: function () {
            var paperTmpl = '                   <div class="wt-item-options">                        <textarea data-bind="value: answer.Answer,disable :showAnswer"></textarea>                        <div class="wt-attachment" data-bind="visible: !$root.hasAttachement() && !$root.showAnswer()&&$root.uploadAllowed">                            <span data-bind="text: $root.i18n.attachement">附件\uFF1A</span>                            <div data-bind="text: $root.i18n.selectFileText, attr: { \'id\': \'placeholder\'+ $root.id() + $root.sub() }" style="vertical-align: text-bottom; height: 20px; display: inline-block;" class="uploadPlaceHolder"></div>                            <span data-bind="text: $root.i18n.uploadTitle">(附件允许上传图片文件\uFF0C最大不超过10M)</span>                        </div>                        <div data-bind="visible: $root.uploading()">                            <span data-bind="text: $root.i18n.uploadingText">上传中\uFF1A</span>                            <div style="display: inline-block;" data-bind="attr: { \'id\': \'placeholderparcent\'+ $root.id() }"></div>                        </div>                        <div data-bind="visible: $root.hasAttachement">                            <span data-bind="text: $root.i18n.attachement">附件\uFF1A</span>                            <a target="_blank" style="cursor: pointer; color:#0302DF;" data-bind="attr: { href: $root.attachementUrl }, text: $root.i18n.downloadAttachement">点击下载</a>                            <a href="#" class="close" data-bind="visible: !$root.showAnswer(), click: $root.removeAttachment">\xD7</a>                        </div>                  </div>';
            var op = this.options, vm = $.extend({}, op, {
                    curIndex: !op.answer.Result ? -1 : op.answer.Result == 1 ? 0 : 1,
                    ops: Enumerable.from(op.ops).select(function (n, i) {
                        return {
                            item: i,
                            content: n,
                            standarded: !i && op.showAnswer,
                            hovered: false
                        };
                    }).toArray()
                });
            this.element.html(paperTmpl);
            this._vm = ko.mapping.fromJS(vm);
            this._vm.uploading = ko.observable(false);
            if (!this._vm.answer.Attachement)
                this._vm.answer.Attachement = ko.observable('');
            this._vm.hasAttachement = ko.computed($.proxy(function () {
                return ko.unwrap(this.answer.Attachement) != '';
            }, this._vm));
            this._vm.attachementUrl = ko.computed($.proxy(function () {
                var attachementData = ko.unwrap(this.answer.Attachement);
                attachementData = attachementData ? JSON.parse(ko.unwrap(this.answer.Attachement)) : null;
                if (attachementData && attachementData['url'])
                    return attachementData['url'] + '&attachment=true';
                return '';
            }, this._vm));
            this._vm.removeAttachment = $.proxy(function () {
                this._vm.answer.Attachement('');
                this._trigger('changed', null, this._ui());
            }, this);
            this._vm.curIndex.subscribe(function (nv) {
                switch (nv) {
                case 1:
                    this._historyAnswer = this._vm.answer.Answer();
                    this._vm.answer.Answer('###');
                    break;
                case 0:
                    this._vm.answer.Answer(this._historyAnswer || ' ');
                    break;
                }
                this._trigger('changed', null, this._ui());
            }, this);
            this._inner = $('.wt-item-options', this.element);
            this._trigger('inited', null, this._ui());
            ko.applyBindings(this._vm, this._inner[0]);
            $('.wt-item-option', this._inner).hover(this._optionHover).click(this._optionChange);
            $('textarea', this._inner).focusout($.proxy(this._textchange, this));
        },
        onShow: function () {
            ko.unwrap(this._vm.uploadAllowed) && this._initSwf();
        },
        _initSwf: function () {
            var postArgs = {
                'session': this.options.attachementSetting.session,
                'path': this.options.attachementSetting.path,
                'name': new Date().getTime() + '.jpg',
                'scope': 1
            };
            this.uploader = new WebUploader.Uploader({
                swf: '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: this.options.attachementSetting.url,
                auto: true,
                duplicate: true,
                pick: {
                    id: '#placeholder' + ko.unwrap(this._vm.id) + ko.unwrap(this._vm.sub),
                    multiple: false
                },
                formData: postArgs,
                fileSingleSizeLimit: 10 * 1024 * 1024,
                accept: [{
                        title: 'Files',
                        extensions: 'gif,jpg,jpeg,bmp,png,rar,zip,xls,xlsx,doc,docx',
                        mimeTypes: 'image/gif,image/jpeg,image/bmp,image/png,image/jpg,application/x-rar-compressed,application/x-compressed,application/x-zip-compressed,application/zip,multipart/x-zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.rar'
                    }]
            });
            this.uploader.on('uploadStart', $.proxy(this.uploadStart, this, postArgs));
            this.uploader.on('uploadProgress', $.proxy(this.uploadProgress, this));
            this.uploader.on('uploadError', $.proxy(this.uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this));
            this.uploader.on('error', $.proxy(this.error, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
        },
        uploadStart: function (postArgs, file) {
            postArgs.name = file.name;
            this._vm.uploading(true);
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = '*/*';
        },
        uploadProgress: function (file, percentage) {
            $('#placeholderparcent' + ko.unwrap(this._vm.id)).show().text('(' + Math.floor(percentage * 100) + '%)');
        },
        uploadError: function (file, reason) {
            var tip = this.options.i18n.uploadError.ERROE_HEADER;
            switch (reason) {
            case 'http':
                tip = tip + this.options.i18n.uploadError.HTTP;
                break;
            case 'abort':
                tip = tip + this.options.i18n.uploadError.ABORT;
                break;
            case 'server':
                tip = tip + this.options.i18n.uploadError.SERVER;
                break;
            }
            $.fn.udialog.alert(tip, {
                width: '420',
                buttons: [{
                        text: this.options.i18n.sureBtn,
                        click: function () {
                            $(this)['udialog']('hide');
                        }
                    }],
                disabledClose: true
            });
        },
        error: function (type) {
            var tip = this.options.i18n.uploadError.ERROE_HEADER;
            switch (type) {
            case 'Q_TYPE_DENIED':
                if (WUFile.size && WUFile.size == 0) {
                    tip = tip + this.options.i18n.uploadError.ZERO_BYTE_FILE;
                } else {
                    tip = tip + this.options.i18n.uploadError.INVALID_FILETYPE;
                }
                break;
            case 'Q_EXCEED_SIZE_LIMIT':
                tip = tip + this.options.i18n.uploadError.FILE_EXCEEDS_SIZE_LIMIT;
                break;
            case 'Q_EXCEED_NUM_LIMIT':
                tip = tip + this.options.i18n.uploadError.FILE_EXCEEDS_NUM_LIMIT;
                break;
            }
            $.fn.udialog.alert(tip, {
                width: '420',
                buttons: [{
                        text: this.options.i18n.sureBtn,
                        click: function () {
                            $(this)['udialog']('hide');
                        }
                    }],
                disabledClose: true
            });
        },
        uploadSuccess: function (file, response) {
            this._vm.uploading(false);
            var attachement = {
                'id': response.dentry_id,
                'url': this._vm.attachementSetting.downloadUrlFormat() + '?dentryId=' + response.dentry_id + '&attachment=true&name=' + file.name
            };
            if (this._vm.answer.Attachement)
                this._vm.answer.Attachement(JSON.stringify(attachement));
            else
                this._vm.answer.Attachement = ko.observable(JSON.stringify(attachement));
            this._trigger('changed', null, this._ui());
        },
        _textchange: function (evt) {
            if (!this._vm.ispapermode) {
                if (!this._vm.curIndex()) {
                    this._vm.answer.Answer().length || this._vm.answer.Answer(' ');
                } else {
                    this._vm.answer.Answer('###');
                }
            }
            this._trigger('changed', null, this._ui());
        },
        _optionHover: function (evt) {
            var o = ko.dataFor(this), d = ko.contextFor(this);
            if (d.$parent.showAnswer()) {
                return;
            }
            evt.type == 'mouseenter' ? o.hovered(true) : o.hovered(false);
        },
        _optionChange: function (evt) {
            var o = ko.dataFor(this), d = ko.contextFor(this);
            if (d.$parent.showAnswer()) {
                return;
            }
            d.$parent.curIndex(o.item());
        },
        _ui: function () {
            return { viewModel: this._vm };
        },
        stringFormat: function (str, args) {
            var result = str;
            if (arguments.length > 1) {
                if (arguments.length == 2 && typeof args == 'object') {
                    for (var key in args) {
                        if (args[key] != undefined) {
                            var reg = new RegExp('({' + key + '})', 'g');
                            result = result.replace(reg, args[key]);
                        }
                    }
                } else {
                    for (var i = 0; i < arguments.length; i++) {
                        if (arguments[i] != undefined) {
                            var reg = new RegExp('({)' + i + '(})', 'g');
                            result = result.replace(reg, arguments[i]);
                        }
                    }
                }
            }
            return result;
        }
    });
}(jQuery));
define('studying.subjective', [], function () {
    return;
});
define('studying.answer', [
    'require',
    'exports'
], function (require, exports) {
    var Studying;
    (function (Studying) {
        var Answer = function () {
            function Answer() {
                this.store = null;
                var _document = $(document);
                _document.off('click', '.ln-btn-submit', $.proxy(this._onSubmit, this)).on('click', '.ln-btn-submit', $.proxy(this._onSubmit, this));
                _document.off('click', '.ln-btn-fullscreen', $.proxy(this._fullscreen, this)).on('click', '.ln-btn-fullscreen', $.proxy(this._fullscreen, this));
                _document.off('click', '.ln-btn-restart', $.proxy(this._restart, this)).on('click', '.ln-btn-restart', $.proxy(this._restart, this));
                _document.off('click', '.ln-btn-finish', $.proxy(this._finish, this)).on('click', '.ln-btn-finish', $.proxy(this._finish, this));
            }
            Answer.prototype._onSubmit = function () {
                $.studying.message.show('请实现_onSubmit方法\uFF01');
            };
            Answer.prototype._fullscreen = function () {
                $.studying.message.show('请实现_fullscreen方法\uFF01');
            };
            Answer.prototype._restart = function () {
                $.studying.message.show('请实现_restart方法\uFF01');
            };
            Answer.prototype._finish = function () {
                $.studying.message.show('请实现_finish方法\uFF01');
            };
            Answer.prototype._toTimeString = function (span) {
                span = Math.ceil(parseInt(span / 1000 + ''));
                var h = parseInt(span / 3600 + '');
                var m = parseInt(span / 60 + '') % 60;
                var s = span % 60;
                return (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s);
            };
            return Answer;
        }();
        Studying.Answer = Answer;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.enum', [
    'require',
    'exports'
], function (require, exports) {
    var Studying;
    (function (Studying) {
        var ConstValue = function () {
            function ConstValue() {
            }
            ConstValue.MaxExamEndTime = 33008486400000;
            ConstValue.MinDateTime = 259200000;
            ConstValue.LocalAnswerKey = 'LocalAnswer';
            return ConstValue;
        }();
        Studying.ConstValue = ConstValue;
        (function (Result) {
            Result[Result['Undo'] = 0] = 'Undo';
            Result[Result['Correct'] = 1] = 'Correct';
            Result[Result['Wrong'] = 2] = 'Wrong';
            Result[Result['Subjective'] = 3] = 'Subjective';
            Result[Result['Done'] = 7] = 'Done';
            Result[Result['Invalid'] = 9] = 'Invalid';
        }(Studying.Result || (Studying.Result = {})));
        var Result = Studying.Result;
        (function (AnswerMode) {
            AnswerMode[AnswerMode['Test'] = 1] = 'Test';
            AnswerMode[AnswerMode['Exercise'] = 2] = 'Exercise';
            AnswerMode[AnswerMode['View'] = 3] = 'View';
            AnswerMode[AnswerMode['ExericseSingleCommit'] = 4] = 'ExericseSingleCommit';
        }(Studying.AnswerMode || (Studying.AnswerMode = {})));
        var AnswerMode = Studying.AnswerMode;
        (function (QuestionType) {
            QuestionType[QuestionType['SingleChoice'] = 10] = 'SingleChoice';
            QuestionType[QuestionType['MultipleChoice'] = 15] = 'MultipleChoice';
            QuestionType[QuestionType['IndefiniteChoice'] = 18] = 'IndefiniteChoice';
            QuestionType[QuestionType['Completion'] = 20] = 'Completion';
            QuestionType[QuestionType['Subjectivity'] = 25] = 'Subjectivity';
            QuestionType[QuestionType['Judgment'] = 30] = 'Judgment';
            QuestionType[QuestionType['Matching'] = 40] = 'Matching';
            QuestionType[QuestionType['Complex'] = 50] = 'Complex';
            QuestionType[QuestionType['Nd_Fraction'] = '$RE0416'] = 'Nd_Fraction';
            QuestionType[QuestionType['NdMemorycard'] = '$RE0407'] = 'NdMemorycard';
            QuestionType[QuestionType['Nd_Classified'] = '$RE0415'] = 'Nd_Classified';
            QuestionType[QuestionType['Nd_Table'] = '$RE0403'] = 'Nd_Table';
            QuestionType[QuestionType['Nd_Pointsequencing'] = '$RE0418'] = 'Nd_Pointsequencing';
            QuestionType[QuestionType['Nd_Arithmetic'] = '$RE0408'] = 'Nd_Arithmetic';
            QuestionType[QuestionType['NdLinkupOld'] = '$RE0401'] = 'NdLinkupOld';
            QuestionType[QuestionType['NdOrder'] = '$RE0402'] = 'NdOrder';
            QuestionType[QuestionType['Nd_Probabilitycard'] = '$RE0426'] = 'Nd_Probabilitycard';
            QuestionType[QuestionType['ND_Textselect'] = '$RE0414'] = 'ND_Textselect';
            QuestionType[QuestionType['Nd_Magicbox'] = '$RE0411'] = 'Nd_Magicbox';
            QuestionType[QuestionType['Nd_Wordpuzzle'] = '$RE0406'] = 'Nd_Wordpuzzle';
            QuestionType[QuestionType['Nd_Guessword'] = '$RE0410'] = 'Nd_Guessword';
            QuestionType[QuestionType['Nd_Fillblank'] = '$RE0421'] = 'Nd_Fillblank';
            QuestionType[QuestionType['Nd_Compare_old'] = '$RE0409'] = 'Nd_Compare_old';
            QuestionType[QuestionType['nd_enoral_composition'] = '$RE463'] = 'nd_enoral_composition';
            QuestionType[QuestionType['nd_enoral_dialogue'] = '$RE462'] = 'nd_enoral_dialogue';
            QuestionType[QuestionType['nd_enoral_paragraph'] = '$RE461'] = 'nd_enoral_paragraph';
            QuestionType[QuestionType['nd_enoral_sentence'] = '$RE460'] = 'nd_enoral_sentence';
            QuestionType[QuestionType['nd_enoral_word'] = '$RE459'] = 'nd_enoral_word';
            QuestionType[QuestionType['nd_sentence_evaluat'] = '$RE434'] = 'nd_sentence_evaluat';
            QuestionType[QuestionType['nd_section_evaluating'] = '$RE443'] = 'nd_section_evaluating';
        }(Studying.QuestionType || (Studying.QuestionType = {})));
        var QuestionType = Studying.QuestionType;
        (function (UserExamStatus) {
            UserExamStatus[UserExamStatus['Disabled'] = 0] = 'Disabled';
            UserExamStatus[UserExamStatus['Waiting'] = 1] = 'Waiting';
            UserExamStatus[UserExamStatus['Ready'] = 4] = 'Ready';
            UserExamStatus[UserExamStatus['Joining'] = 8] = 'Joining';
            UserExamStatus[UserExamStatus['Submit'] = 16] = 'Submit';
            UserExamStatus[UserExamStatus['Marked'] = 32] = 'Marked';
            UserExamStatus[UserExamStatus['UnjoinAndFinished'] = 64] = 'UnjoinAndFinished';
            UserExamStatus[UserExamStatus['SubmitAndFinished'] = 80] = 'SubmitAndFinished';
            UserExamStatus[UserExamStatus['MarkedAndFinished'] = 96] = 'MarkedAndFinished';
            UserExamStatus[UserExamStatus['Timeout'] = 101] = 'Timeout';
            UserExamStatus[UserExamStatus['Preparation'] = 112] = 'Preparation';
        }(Studying.UserExamStatus || (Studying.UserExamStatus = {})));
        var UserExamStatus = Studying.UserExamStatus;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.loader', [
    'require',
    'exports',
    'util',
    'studying.enum'
], function (require, exports, __hash, __enum) {
    var Studying;
    (function (Studying) {
        var Loader = function () {
            function Loader() {
                this._datas = null;
                this._datas = new __hash.Common.Hash();
            }
            Loader.prototype.load = function (id) {
                var _this = this;
                var c = this.get(id), cells = null;
                if (this.checkMissingHandler(c)) {
                    if (typeof c != 'undefined' && typeof c._def != 'undefined' && c._def != null)
                        return $.Deferred(function (def) {
                            c._def.done(function () {
                                def.resolve(_this.get(id));
                            });
                        }).promise();
                    cells = this._filterMissing(this.batchHandler(c));
                    return $.Deferred(function (def) {
                        _this._invokeRequestHandler(cells).done(function () {
                            def.resolve(_this.get(id));
                        });
                    }).promise();
                }
                return $.Deferred(function (def) {
                    _this._fixCell(c);
                    def.resolve(c);
                }).promise();
            };
            Loader.prototype.get = function (id) {
                return this._datas.get(id);
            };
            Loader.prototype.datas = function () {
                return this._datas;
            };
            Loader.prototype._invokeRequestHandler = function (cells) {
                var def = this.requestHandler(cells), that = this;
                Enumerable.from(cells).select(function (c) {
                    c._def = def;
                });
                return def.done($.proxy(function (cReturnCells, returnCells) {
                    this.mergeCells($.map(returnCells, function (cl, ci) {
                        typeof cl.Question != 'undefined' && typeof cl.Result != 'undefined' && this.checkQuestionState(cl);
                        return {
                            Id: cells[ci].Id,
                            Question: cl
                        };
                    }));
                }, this)).always(function () {
                    Enumerable.from(cells).select(function (c) {
                        c._def = null;
                    });
                });
            };
            Loader.prototype.mergeCells = function (cells) {
                var _this = this;
                this._datas.merageArray(Enumerable.from(cells).select(function (c) {
                    return _this._fixCell(c);
                }).toArray());
            };
            Loader.prototype._filterMissing = function (cells) {
                var _this = this;
                return Enumerable.from(cells).where(function (c) {
                    return _this.checkMissingHandler(c) && typeof c._def == 'undefined';
                }).toArray();
            };
            Loader.prototype._fixCell = function (cell) {
                if (cell.Result == null)
                    cell.Result = undefined;
                var ocell = this.get(cell.Id);
                cell = $.extend(true, ocell, cell);
                if (typeof cell.Question != 'undefined') {
                    var _result = {
                        'Result': {
                            'Answers': [],
                            'CostSeconds': 0,
                            'Result': 0
                        }
                    };
                    cell = $.extend({}, _result, cell);
                }
                return cell;
            };
            Loader.prototype._fixStandardAnswer = function (answer, questionType) {
                if (questionType == __enum.Studying.QuestionType.Completion && answer) {
                    var answers = JSON.parse(answer), tempAnswers = [];
                    for (var i = 0; i < answers.length; i++) {
                        tempAnswers.push({
                            'title': answers[i].index.toString(),
                            'answer': answers[i].value.toString()
                        });
                    }
                    answer = tempAnswers;
                }
                return answer;
            };
            Loader.prototype.checkMissingHandler = function (cell) {
                return typeof cell.Question == 'undefined';
            };
            return Loader;
        }();
        Studying.Loader = Loader;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.updater', [
    'require',
    'exports',
    'util'
], function (require, exports, __hash) {
    var Studying;
    (function (Studying) {
        var Updater = function () {
            function Updater(data) {
                this._updateQueue = null;
                this._def = null;
                this._i18n = {
                    noNeedToSave: '无需保存',
                    saveSuccess: '保存成功',
                    saveFaile: '保存失败'
                };
                this._updateQueue = new __hash.Common.Hash();
                if (data && data.i18n && data.i18n.common && data.i18n.common.updater) {
                    this._i18n = data.i18n.common.updater;
                }
            }
            Updater.prototype.set = function (cell) {
                this._updateQueue.set(cell.Id, cell);
            };
            Updater.prototype.queue = function (cell, time) {
                this._updateQueue.set(cell.Id, cell);
                var updateCells = this._getQueue();
                this.beforAnswerSaveHandler(updateCells, time);
                if (this.checkSubmitHandler(updateCells))
                    this.submit();
            };
            Updater.prototype.submit = function () {
                this._submit();
            };
            Updater.prototype.commit = function () {
                var _this = this;
                this._submit();
                if (this._def == null)
                    return $.Deferred(function (def) {
                        def.resolve();
                    }).promise();
                var updateCells = this._getQueue();
                if (updateCells.length == 0)
                    return this._def;
                return $.Deferred(function (def) {
                    _this._def.then(function () {
                        _this._submit();
                        _this._def.then(function () {
                            def.resolve();
                        }, function () {
                            def.reject();
                        });
                    }, function () {
                        def.reject();
                    });
                });
            };
            Updater.prototype.queueIsEmpty = function () {
                return this._getQueue() && this._getQueue().length > 0 ? false : true;
            };
            Updater.prototype._getQueue = function () {
                return this._updateQueue.values();
            };
            Updater.prototype._setQueue = function (cells) {
                var _this = this;
                $.each(cells, function (i, cell) {
                    if (!_this._updateQueue.contains(cell.Id))
                        _this._updateQueue.set(cell.Id, cell);
                });
            };
            Updater.prototype._submit = function () {
                var _this = this;
                if (this._def != null)
                    return;
                var updateCells = this._getQueue();
                if (updateCells.length == 0) {
                    this.answerSavedHandler(false);
                    return;
                }
                this._updateQueue = new __hash.Common.Hash();
                this._def = this.submitHandler(updateCells);
                this._def.done(function (submitable) {
                    _this.answerSavedHandler(submitable);
                    $.studying.message.show(_this._i18n.saveSuccess);
                    _this._def = null;
                }).fail(function () {
                    _this._setQueue(updateCells);
                    $.studying.message.show(_this._i18n.saveFaile);
                    _this._def = null;
                }).always(function () {
                    _this._def = null;
                });
            };
            return Updater;
        }();
        Studying.Updater = Updater;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.helper', [
    'require',
    'exports'
], function (require, exports) {
    var Studying;
    (function (Studying) {
        var HelperMethods = function () {
            function HelperMethods() {
            }
            HelperMethods.ResolveUrl = function (url) {
                var pattern = /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/;
                return pattern.exec(url);
            };
            HelperMethods.ResolveHost = function (url) {
                var buff = this.ResolveUrl(url);
                var data = {
                    'host': '',
                    'path': ''
                };
                if (buff[2] && buff[3] && buff[4] && buff[5]) {
                    data.host = buff[2] + ':' + buff[3] + '@' + buff[4] + buff[5];
                } else if (buff[4] && buff[5]) {
                    data.host = buff[4] + ':' + buff[5];
                } else if (buff[4]) {
                    data.host = buff[4];
                }
                if (buff[6] && buff[7]) {
                    data.path = buff[6] + '?' + buff[7];
                } else if (buff[6]) {
                    data.path = buff[6];
                }
                return data;
            };
            HelperMethods.GenUrlEandRom = function (url) {
                var random = new Date().getTime();
                var index = url.indexOf('?');
                if (index > -1) {
                    return url + '&_=' + random;
                } else {
                    return url + '?_=' + random;
                }
            };
            return HelperMethods;
        }();
        Studying.HelperMethods = HelperMethods;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.store', [
    'require',
    'exports',
    'util',
    'studying.enum',
    'studying.loader',
    'studying.updater',
    'studying.helper'
], function (require, exports, __hash, __enum, __loader, __updater, __helper) {
    var Studying;
    (function (Studying) {
        var Store = function () {
            function Store(data) {
                this.loader = null;
                this.updater = null;
                this.viewModel = null;
                this.data = null;
                this.interactiveQuestions = null;
                this._inited = false;
                this.loader = new __loader.Studying.Loader();
                this.updater = new __updater.Studying.Updater(data);
                this.interactiveQuestions = new __hash.Common.Hash();
                this.viewModel = [];
                this.data = $.extend(true, {
                    CurrentQuestionId: 0,
                    Batches: [],
                    Cells: [],
                    InteractiveQuestions: [],
                    Host: '',
                    QtiPath: { RefPath: '' },
                    SubjectiveMarkStrategy: 0
                }, data);
                this.loader.batchHandler = $.proxy(this._buildCellBatch, this);
                this.loader.requestHandler = $.proxy(this._loadCells, this);
                this.loader.requestAnalysisHandler = $.proxy(this._loadAnalysisData, this);
                this.loader.checkQuestionState = $.proxy(this._checkQuestionState, this);
                this.updater.submitHandler = $.proxy(this._submit, this);
                this.updater.checkSubmitHandler = $.proxy(this._checkSubmit, this);
                this.updater.answerSavedHandler = $.proxy(this._onAnswerSaved, this);
                this.updater.beforAnswerSaveHandler = $.proxy(this._onAnswerSaving, this);
                this._initCells();
                this._loadRefPath();
                this.calculateNum();
            }
            Store.prototype._checkQuestionState = function (cell) {
                if (!this.isDone(cell)) {
                    cell.Result['Result'] = __enum.Studying.Result.Undo;
                    this.questionStateChangeHandler(cell.Id, __enum.Studying.Result.Undo);
                }
            };
            Store.prototype.removeLocalAnswer = function () {
                this._onAnswerSaved(false);
            };
            Store.prototype._onAnswerSaved = function (submitable) {
                if (this.data.EventCallbacks && this.data.EventCallbacks.onAnswerSaved && $.isFunction(this.data.EventCallbacks.onAnswerSaved)) {
                    var localStorageAnswers = store.get(__enum.Studying.ConstValue.LocalAnswerKey + this.data.SessionId);
                    localStorageAnswers = localStorageAnswers ? JSON.parse(localStorageAnswers) : null;
                    this.data.EventCallbacks.onAnswerSaved.call(this, localStorageAnswers);
                }
                store.remove(__enum.Studying.ConstValue.LocalAnswerKey + this.data.SessionId);
                if (submitable && submitable.submitable) {
                    this.sessionNeedSubmitHandler();
                }
            };
            Store.prototype._onAnswerSaving = function (cells, time) {
                var localStorageAnswers = {
                    time: time,
                    sessionId: this.data.SessionId,
                    data: Enumerable.from(cells).select(function (value) {
                        return {
                            Id: value.Id,
                            Result: value.Result,
                            state: value.state,
                            submit: value.submit
                        };
                    }).toArray()
                };
                store.set(__enum.Studying.ConstValue.LocalAnswerKey + this.data.SessionId, JSON.stringify(localStorageAnswers));
            };
            Store.prototype._submit = function (cells) {
            };
            Store.prototype._checkSubmit = function (cells) {
                return true;
            };
            Store.prototype.setInited = function () {
                this._inited = true;
                this.initedHandler();
            };
            Store.prototype.hasInited = function () {
                return this._inited;
            };
            Store.prototype._initCells = function () {
                var _this = this;
                var cells = Enumerable.from(this.data.Cells).select(function (c) {
                    c.state = _this._getState(c);
                    c.submit = c.Result != null;
                    return c;
                }).toArray();
                this.data.Items = cells;
                this.loader.mergeCells(cells);
            };
            Store.prototype._loadCells = function (cells) {
                var _this = this;
                var that = this;
                var ids = Enumerable.from(cells).select('$.Id').toArray();
                var baseQuestionIds = [], interactiveQuestionIds = [];
                Enumerable.from(ids).forEach(function (item, index) {
                    if (_this.interactiveQuestions.get(item)) {
                        interactiveQuestionIds.push(item);
                    } else {
                        baseQuestionIds.push(item);
                    }
                });
                if (this.data.SubjectiveMarkStrategy) {
                    return $.when(this._sendRequest({
                        url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.InteractiveQuestionsUrl ? this.data.ApiRequestUrls.InteractiveQuestionsUrl : this.data.Host + '/exam/papers/coursewareobjects',
                        data: JSON.stringify(interactiveQuestionIds),
                        contentType: 'application/json;charset=utf-8',
                        type: 'POST',
                        enableToggleCase: false
                    }), this._sendRequest({
                        url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.AnalysisUrl ? this.data.ApiRequestUrls.AnalysisUrl : this.data.Host + '/v2/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/single_qa',
                        type: 'POST',
                        data: JSON.stringify(baseQuestionIds),
                        contentType: 'application/json;',
                        async: false,
                        traditional: true,
                        enableToggleCase: false
                    }));
                } else {
                    return $.when(this._sendRequest({
                        url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.InteractiveQuestionsUrl ? this.data.ApiRequestUrls.InteractiveQuestionsUrl : this.data.Host + '/exam/papers/coursewareobjects',
                        data: JSON.stringify(interactiveQuestionIds),
                        contentType: 'application/json;charset=utf-8',
                        type: 'POST',
                        enableToggleCase: false
                    }), this._sendRequest({
                        url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.QuestionsUrl ? this.data.ApiRequestUrls.QuestionsUrl : this.data.Host + '/exam/papers/questions',
                        data: JSON.stringify(baseQuestionIds),
                        contentType: 'application/json;charset=utf-8',
                        type: 'POST',
                        enableToggleCase: false
                    }));
                }
            };
            Store.prototype._loadRefPath = function () {
                var _this = this;
                this._sendRequest({
                    url: this.data.Host + '/exam/v2/ref_path',
                    type: 'GET',
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    traditional: true
                }).done(function (data) {
                    _this.data['QtiPath']['RefPath'] = data.refPath;
                });
            };
            Store.prototype.getQuestionsBody = function () {
                var _this = this;
                var def = $.Deferred();
                this._loadCells(this.data.Cells).done(function (cs, bs) {
                    cs = cs[0], bs = bs[0];
                    if (bs && bs.length > 0) {
                        Enumerable.from(bs).forEach(function (item, index) {
                            if (item) {
                                var tempItem = _this.data.SubjectiveMarkStrategy ? item.item : item;
                                var id = tempItem.identifier ? tempItem.identifier : tempItem.id ? tempItem.id : '';
                                item.identifier = id;
                                item.id = id;
                                var cell = Enumerable.from(_this.data.Cells).firstOrDefault(null, '$.Id == "' + id + '"');
                                cell && (cell.Question = tempItem);
                            }
                        });
                    }
                    if (cs && cs.length > 0) {
                        Enumerable.from(cs).forEach(function (item, index) {
                            if (item) {
                                var cell = Enumerable.from(_this.data.Cells).firstOrDefault(null, '$.Id == "' + item.id + '"');
                                if (cell) {
                                    cell.Question = item;
                                    cell.Question.identifier = item.id;
                                }
                            }
                        });
                    }
                    def.resolve();
                });
                return def.promise();
            };
            Store.prototype._buildCellBatch = function () {
                var cells = [], currentBatchIndex = this.getCurrentBatchIndex();
                for (var i = 0, len = this.data.Batches[currentBatchIndex].length; i < len; i++) {
                    var item = this.loader.get(this.data.Batches[currentBatchIndex][i]);
                    if (item)
                        cells.push(item);
                }
                return cells;
            };
            Store.prototype._loadAnalysisData = function () {
                return this.data.UserExam.AnalysisData;
            };
            Store.prototype._getState = function (cell) {
                return cell.Result == null ? __enum.Studying.Result.Undo : cell.Result['Result'];
            };
            Store.prototype.getBatchIndex = function (id) {
                var batches = this.data.Batches, len = batches.length;
                for (var i = 0; i < len; i++) {
                    for (var j = 0, len2 = batches[i].length; j < len2; j++) {
                        if (batches[i][j] == id)
                            return i;
                    }
                }
                return 0;
            };
            Store.prototype.getCurrentBatchIndex = function () {
                return this.getBatchIndex(this.data.CurrentQuestionId);
            };
            Store.prototype.datas = function () {
                return this.loader.datas();
            };
            Store.prototype.load = function (id) {
                return this.loader.load(id);
            };
            Store.prototype.get = function (id) {
                return this.loader.get(id);
            };
            Store.prototype.submit = function () {
                this.updater.submit();
            };
            Store.prototype.commit = function () {
                return this.updater.commit();
            };
            Store.prototype.queue = function (data, submit) {
                var totalCorrect = true, cell = data.cell;
                if (!this.isDone(cell))
                    cell.Result['Result'] = __enum.Studying.Result.Undo;
                if (submit)
                    this.updater.queue(cell, data.time, data.sessionId);
                else
                    this.updater.set(cell);
                if (this.data.EventCallbacks && this.data.EventCallbacks.onAnswerChange && $.isFunction(this.data.EventCallbacks.onAnswerChange)) {
                    this.data.EventCallbacks.onAnswerChange.call(this, data);
                }
            };
            Store.prototype.isDone = function (cell) {
                var isDone = false;
                if (cell.Result) {
                    isDone = cell.Result['Result'] != __enum.Studying.Result.Undo ? true : false;
                }
                return isDone;
            };
            Store.prototype.getDoneCount = function () {
                var _this = this;
                var cells = this.loader.datas().values();
                return Enumerable.from(cells).count(function (c) {
                    return _this.isDone(c);
                });
            };
            Store.prototype.getTotalCount = function () {
                return this.loader.datas().values().length;
            };
            Store.prototype.calculateNum = function () {
                if (this.data.Mode == __enum.Studying.AnswerMode.View) {
                    this.data.CurrentQuestionId = this.data.Batches[0][0];
                    return;
                }
                if (this.data.CurrentQuestionId != 0)
                    return;
                var cells = this.data.Cells;
                for (var i = 0; i < cells.length; i++) {
                    if (cells[i].Result == null) {
                        this.data.CurrentQuestionId = cells[i].Id;
                        break;
                    }
                }
            };
            Store.prototype.getNumById = function (id) {
                var batches = this.data.Batches, index = 1, currentId = 0;
                if (typeof id == 'undefined')
                    currentId = this.data.CurrentQuestionId;
                else
                    currentId = id;
                for (var i = 0; i < batches.length; i++) {
                    for (var j = 0; j < batches[i].length; j++) {
                        if (batches[i][j] == currentId)
                            return index;
                        else
                            index++;
                    }
                }
                return 1;
            };
            Store.prototype.getQuestionInBankId = function (questionId) {
                return this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_questions?question_source=1&question_source_id=' + questionId + '&user_id=' + this.data.UserId,
                    type: 'GET',
                    contentType: 'application/json;',
                    async: false
                });
            };
            Store.prototype.getQuestionErrorReasons = function (qids) {
                var _this = this;
                var def = $.Deferred();
                this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_question/tags/search',
                    type: 'POST',
                    data: JSON.stringify({
                        'user_question_ids': qids,
                        'tag_types': [
                            'wrong_reason',
                            'key_wrong_question',
                            'wrong_question'
                        ]
                    }),
                    contentType: 'application/json;',
                    async: false
                }).done(function (reasons) {
                    def.resolve(_this.filterReason(reasons));
                }).fail(function () {
                    def.reject(null);
                });
                return def;
            };
            Store.prototype.getErrorReasons = function () {
                return this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_question_tags/search',
                    type: 'POST',
                    data: JSON.stringify({ 'tag_types': ['wrong_reason'] }),
                    contentType: 'application/json;',
                    async: false
                });
            };
            Store.prototype.filterReason = function (reasons) {
                for (var i = reasons.length - 1; i >= 0; i--) {
                    if (reasons[i].userQuestionTagId == 'f0000000-0000-0000-0000-000000000001') {
                        reasons.splice(i, 1);
                    }
                }
                return reasons;
            };
            Store.prototype._setErrorReasons = function (reasons) {
                for (var i = reasons.length - 1; i >= 0; i--) {
                    if (reasons[i].id == 'f0000000-0000-0000-0000-000000000001') {
                        reasons.splice(i, 1);
                    }
                }
                this.data.UserExam.ErrorReasons = reasons;
            };
            Store.prototype.setEmphasisQuestion = function (questionId) {
                return this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_questions/' + questionId + '/tags',
                    type: 'POST',
                    data: JSON.stringify({
                        'type': 'key_wrong_question',
                        'value': 'true'
                    }),
                    contentType: 'application/json;',
                    async: false
                });
            };
            Store.prototype.removeEmphasisQuestion = function (questionId) {
                return this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_questions/' + questionId + '/tags?tag_type=key_wrong_question&tag_value=true',
                    type: 'DELETE',
                    contentType: 'application/json;',
                    async: false
                });
            };
            Store.prototype.addToQuestionBank = function (questionId) {
                return this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_questions/' + questionId + '/tags',
                    type: 'POST',
                    data: JSON.stringify({
                        type: 'wrong_question',
                        value: true
                    }),
                    contentType: 'application/json;',
                    async: false
                });
            };
            Store.prototype.deleteErrorReason = function (questionId, reason) {
                return this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1.0/user_questions/' + questionId + '/tag/relations?tag_type=wrong_reason&tag_value=' + reason,
                    type: 'DELETE',
                    contentType: 'application/json;',
                    async: false
                });
            };
            Store.prototype.updateErrorReason = function (reasonId, data) {
                var _this = this;
                return this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_question_tags/' + reasonId,
                    type: 'PUT',
                    data: JSON.stringify(data),
                    contentType: 'application/json;',
                    async: false
                }).fail(function (data) {
                    try {
                        $.fn.udialog.alert(JSON.parse(data.responseText).message, {
                            width: '420',
                            icon: '',
                            buttons: [{
                                    text: _this.data.i18n.common.store.sureBtn,
                                    click: function () {
                                        $(this)['udialog']('hide');
                                    },
                                    'class': 'default-btn'
                                }],
                            disabledClose: true
                        });
                    } catch (ex) {
                    }
                });
            };
            Store.prototype.createErrorReason = function (data) {
                var _this = this;
                return this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_question_tags',
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json;',
                    async: false
                }).done(function (reason) {
                    _this.data.UserExam.ErrorReasons.push(reason);
                }).fail(function (data) {
                    try {
                        $.fn.udialog.alert(JSON.parse(data.responseText).message, {
                            width: '420',
                            icon: '',
                            buttons: [{
                                    text: _this.data.i18n.common.store.sureBtn,
                                    click: function () {
                                        $(this)['udialog']('hide');
                                    },
                                    'class': 'default-btn'
                                }],
                            disabledClose: true
                        });
                    } catch (ex) {
                    }
                });
            };
            Store.prototype.updateQuestionTags = function (questionId, reasons) {
                var _this = this;
                var def = $.Deferred();
                this._sendRequest({
                    url: this.data.QuestionBankServiceHost + '/v1/user_questions/' + questionId + '/tags?tag_type=' + reasons.type,
                    type: 'PUT',
                    data: JSON.stringify(reasons.value),
                    contentType: 'application/json;',
                    async: false
                }).then(function (reasons) {
                    def.resolve(_this.filterReason(reasons));
                }, function () {
                    def.reject(null);
                });
                return def;
            };
            Store.prototype.getNote = function (qid) {
                return this._sendRequest({
                    url: this.data.NoteServiceHost + '/v1/notes/search',
                    type: 'POST',
                    contentType: 'application/json;',
                    async: false,
                    data: JSON.stringify({
                        filter: 'target_id in (\'questionbank:' + qid + '\') and user_id eq ' + this.data.UserId,
                        limit: '100',
                        result: 'pager'
                    })
                });
            };
            Store.prototype.createNote = function (data) {
                return this._sendRequest({
                    url: this.data.NoteServiceHost + '/v1/notes',
                    type: 'POST',
                    data: JSON.stringify(data.note),
                    contentType: 'application/json;'
                });
            };
            Store.prototype.updateNote = function (data) {
                return this._sendRequest({
                    url: this.data.NoteServiceHost + '/v1/notes/' + data.note_id,
                    type: 'PUT',
                    data: JSON.stringify(data.note),
                    contentType: 'application/json;'
                });
            };
            Store.prototype.deleteNote = function (noteId) {
                return this._sendRequest({
                    url: this.data.NoteServiceHost + '/v1/notes/' + noteId,
                    type: 'DELETE'
                });
            };
            Store.prototype._sendRequest = function (datas) {
                var _this = this;
                var that = this;
                var obj = $.extend({
                    type: 'GET',
                    dataType: 'json',
                    requestCase: 'snake',
                    reponseCase: 'camel',
                    enableToggleCase: true,
                    contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                    traditional: true,
                    beforeSend: function (xhr) {
                        if (_this.data.Language)
                            xhr.setRequestHeader('Accept-Language', decodeURIComponent(_this.data.Language));
                        if (_this.data.TokenConfig && _this.data.TokenConfig.NeedToken) {
                            var buff = __helper.Studying.HelperMethods.ResolveHost(obj.url);
                            var mac = {
                                'method': obj.type,
                                'path': encodeURI(buff.path),
                                'host': buff.host
                            };
                            var tokenInfo = _this.data.TokenConfig.OnGetToken(mac);
                            xhr.setRequestHeader('Authorization', tokenInfo['Authorization']);
                            xhr.setRequestHeader('X-Gaea-Authorization', tokenInfo['X-Gaea-Authorization']);
                        }
                    }
                }, datas);
                if (obj.type.toLowerCase() == 'get') {
                    obj.url = __helper.Studying.HelperMethods.GenUrlEandRom(obj.url);
                }
                return $.ajax(obj).fail(function () {
                    if ($.studying.loading && $.isFunction($.studying.loading.hide)) {
                        $.studying.loading.hide();
                    }
                });
            };
            Store.prototype.getControlOption = function (key) {
                var result = undefined;
                if (this.data.controlOptions && this.data.controlOptions[key] != undefined) {
                    result = this.data.controlOptions[key];
                }
                return result;
            };
            return Store;
        }();
        Studying.Store = Store;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
(function ($) {
    var tmpl = '    <div class="wt-top">        <div class="wt-top-hd">            <div class="inner-wrapper clearfix">                <h3 data-bind="html:title, attr: { \'title\': title }"></h3>                <span data-bind="visible: $root.viewMode() == 1" class="wt-timer">                    <ins></ins>                    <span class="wt-timer-clock" data-bind="text:time,attr:{title: ($root.showCostTime()? $root.i18n.costTime : $root.i18n.residualTime) }"></span>                </span>            </div>        </div>        <div class="wt-top-bd">            <div class="inner-wrapper clearfix">                <div class="wt-top-btns" data-bind="visible: $root.viewMode() == 1">                    <a class="ln-btn-submit wt-history-btn" data-tool="save" data-bind="attr: { title: $root.i18n.saveTitle }" href="javascript:void(0);"><ins></ins><span data-bind="text: $root.i18n.save"></span></a>                    <a class="ln-btn-finish wt-submit-btn" data-tool="operate" href="javascript:void(0);"></a>                </div>                <div class="wt-top-nav">                </div>            </div>        </div>    </div>        ';
    $.widget('studying.header', {
        options: {
            currentIndex: 0,
            paperTitle: '考试说明',
            title: '',
            time: '',
            showCostTime: false,
            inited: function () {
            },
            i18n: {
                residualTime: '剩余用时',
                costTime: '考试用时',
                saveTitle: '保存答案',
                save: '保存'
            }
        },
        _init: function () {
            this.element.html(tmpl);
            this._vm = ko.mapping.fromJS(this.options);
            this._vm._viewPaperTitle = function () {
                $.fn.udialog.confirm(this.paperTitle(), []);
            };
            this._trigger('inited', null, this._ui());
            this._inner = $('.wt-top', this.element);
            ko.applyBindings(this._vm, this._inner[0]);
        },
        setTime: function (v) {
            this._vm.time(v);
        },
        viewModel: function () {
            return this._vm;
        },
        _ui: function (v) {
            return $.extend({ viewModel: this._vm }, v);
        },
        hideCountDown: function () {
            $(' .wt-top-hd').find('span').hide();
        }
    });
}(jQuery));
define('studying.header', [], function () {
    return;
});
(function ($) {
    var tmplParts = '    <a href="javascript:;" class="wt-nav-prev wt-nav-op" data-op="prev" data-bind="visible:showPrev"></a>    <a href="javascript:;" class="wt-nav-next wt-nav-op" data-op="next" data-bind="visible:showNext"></a>    <ul class="clearfix" data-bind="foreach:batchs()">        <li data-bind="css:{\'active\':$index()==$root.currentIndex()},click:$root.handlerClick">            <a href="javascript:void(0);" data-bind="html:title+count, attr: { title: $root.i18n.buttonTitle }"></a>        </li>    </ul>    ';
    $.widget('studying.parts', {
        options: {
            currentIndex: 0,
            items: [],
            batches: [],
            partTitles: [],
            inited: function () {
            },
            tabselect: function () {
            },
            showPrev: false,
            showNext: false,
            currentLi: 0,
            i18n: { buttonTitle: '点击可切换' }
        },
        _init: function () {
            var t = this;
            this._vm = ko.mapping.fromJS(this.options);
            this.element.html(tmplParts);
            this._vm = ko.mapping.fromJS(this.options);
            this._vm.batchs = ko.computed(function () {
                var d = [];
                var items = this.items();
                var batches = this.batches();
                var l = 0;
                for (var i = 0; i < batches.length; i++) {
                    l += i == 0 ? 0 : batches[i - 1].length;
                    var ary = $.map(items, function (ivalue) {
                        var existed = Enumerable.from(batches[i]).contains(ko.unwrap(ivalue.Id));
                        if (existed)
                            return ivalue;
                    });
                    d.push({
                        batchIndex: i,
                        firstQId: batches[i].length > 0 ? batches[i][0] : 0,
                        title: this.partTitles()[i] ? this.partTitles()[i] : '',
                        count: '[<em>' + Enumerable.from(ary).count('$.state()!=0') + '</em>/<span>' + batches[i].length + '</span>]'
                    });
                }
                return d;
            }, this._vm);
            this._vm.currentIndex.subscribe(function (newVal) {
                this.currentLi(0);
                var wrap = $(t.element), index = 0, liHeight = wrap.find('ul li.active').outerHeight();
                wrap.find('ul li').show();
                while (index < newVal && wrap.find('ul').height() > liHeight) {
                    index++;
                    t._innerOperate('next');
                }
                this.currentLi(index);
                t.showOpBtn();
            }, this._vm);
            this._vm.handlerClick = $.proxy(this._tabSelect, this);
            this._trigger('inited', null, this._ui());
            $('.wt-nav-op').click($.proxy(this._operate, this));
            ko.applyBindings(this._vm, this.element[0]);
            t.tick = 0;
            t.tick = setInterval(function () {
                if ($(t.element).find('ul').height() <= $(t.element).find('ul li.active').outerHeight()) {
                    clearInterval(t.tick);
                }
                t.showOpBtn();
            }, 500);
        },
        showOpBtn: function () {
            var t = this, ulHeight = $(t.element).find('ul').height();
            if (ulHeight > $(t.element).find('ul li.active').outerHeight()) {
                t._vm.showNext(true);
            } else {
                t._vm.showNext(false);
            }
            if (t._vm.currentLi() > 0) {
                t._vm.showPrev(true);
            } else {
                t._vm.showPrev(false);
            }
        },
        _tabSelect: function (evt) {
            this._vm.currentIndex(evt.batchIndex);
            this._trigger('tabselect', null, this._ui({
                firstqid: evt.firstQId,
                batchIndex: evt.batchIndex
            }));
        },
        _operate: function (evt) {
            var t = this;
            var e = $(evt.currentTarget);
            this._innerOperate(e.data('op'));
        },
        _innerOperate: function (op) {
            var t = this;
            switch (op) {
            case 'next':
                var wrap = $(t.element);
                var count = wrap.find('ul li').length;
                var index = this._vm.currentLi();
                if (index < count - 1 && index >= 0 && wrap.find('ul').height() > wrap.find('ul li.active').outerHeight()) {
                    index = index + 1;
                    wrap.find('ul li').show();
                    wrap.find('ul li:lt(' + index + ')').hide();
                    this._vm.currentLi(index);
                }
                t.showOpBtn();
                break;
            case 'prev':
                var wrap = $(t.element);
                var count = wrap.find('ul li').length;
                var index = this._vm.currentLi();
                if (index < count && index > 0) {
                    index = index - 1;
                    wrap.find('ul li').show();
                    wrap.find('ul li:lt(' + index + ')').hide();
                    this._vm.currentLi(index);
                }
                t.showOpBtn();
                break;
            }
        },
        viewModel: function () {
            return this._vm;
        },
        _ui: function (v) {
            return $.extend({ viewModel: this._vm }, v);
        }
    });
}(jQuery));
define('studying.parts', [], function () {
    return;
});
define('studying.exception', [
    'require',
    'exports',
    'module',
    'studying.enum'
], function (require, exports, module) {
    var _enum = require('studying.enum');
    (function ($) {
        var tmpl = '<div class="test-enter test-result" style="z-index:99;">    <div class="test-enter-con">        <div></div>        <div class="testpaper-info text-center" style="border: none;" data-bind="html: message"></div>    </div></div>        ';
        $.widget('studying.exception', {
            options: {
                backUrl: 'javascript:void(0);',
                message: '<span>考试不存在\uFF01</span><br/><span>如有问题请联系客服\uFF0C给您带来不变请见谅\u3002</span>',
                i18n: {
                    back: '< 返回',
                    title: '考试异常页'
                }
            },
            _init: function () {
                document.title = this.options.i18n.title;
                this.element.html(tmpl);
                $('.test-enter').siblings().hide();
                var op = this.options;
                this._vm = ko.mapping.fromJS(op);
                ko.applyBindings(this._vm, $('.test-enter')[0]);
            }
        });
    }(jQuery));
});
define('studying.prepare', [
    'require',
    'exports',
    'module',
    'timer',
    'studying.enum'
], function (require, exports, module) {
    var _timer = require('timer');
    var _enum = require('studying.enum');
    (function ($) {
        var timer = _timer.Common.TimerFactory.Singleton();
        var tmpl = '          <div class="new-prepare">                <div class="pre-header"></div>                <div class="pre-container">                    <div class="ma-body">                        <div class="content">                            <div class="base">                                <h1 class="col-1" data-bind="html:title"></h1>                                <div class="col-1 socre" data-bind="visible: $root.showHightSocre()">                                    <div data-bind="visible: $root.subType() != 1">                                        <span data-bind="text: $root.i18n.bestScore">最高分\uFF1A</span>                                        <em data-bind="css: { success: $root.isPassed(), fail: !$root.isPassed() }, text: $root.getBestScore()">50</em>                                        <span data-bind="css: { success: $root.isPassed(), fail: !$root.isPassed() }, text: $root.i18n.score"></span>                                    </div>                                    <div data-bind="visible: $root.subType() == 1">                                        <span data-bind="text: $root.i18n.lastAnswer"></span>                                        <span class="info fail" data-bind="text: $root.resultCode"></span>                                    </div>                                </div>                                <div class="test-enter-cd col-1 button" data-bind="visible: $root.isTimerReady() &amp;&amp; $root.showExamEndTime()" style="display: none;">                                  <span data-bind="text: $root.i18n.examStartTime"></span><em data-bind="text: $root.getBeginTime()"></em>                                </div>                                <div class="test-enter-cd countdown col-1 button" data-bind="visible: $root.showCountDown() && !$root.largetThenSeven() && ($root.examToolType()!=1 || $root.isInClient())" style="display: none;"></div>                                <div class="col-1 button" data-bind="visible: $root.examToolType()!=1 || $root.isInClient()">                                    <a href="javascript:void(0);" class="ln-btn" data-bind="visible: $root.showOralBtn, click: $root.onDetection, text: $root.i18n.detection" style="display: none;"></a>                                    <!--ko if: ($root.subType() == 2 || $root.subType() == 3) && (window.projectCode != \'onetest\' &&window.projectCode != \'autonomiclearning\' && window.projectCode != \'chaungguan\')-->                                        <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.disabled"></a>                                    <!--/ko-->                                    <!--ko if: ($root.subType() != 3 && $root.subType() != 2) || window.projectCode == \'onetest\' || window.projectCode == \'autonomiclearning\' || window.projectCode == \'chaungguan\'-->                                            <!-- ko if:$root.isTimerReady() -->                                                <!-- ko if:$root.isExamEnd() -->                                                    <!-- ko if:$root.userExamStatus()==8 -->                                                        <!-- ko if:$root.canContinue() -->                                                            <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}, text: $root.i18n.examStatus.continue"></a>                                                        <!-- /ko -->                                                        <!-- ko if:!$root.canContinue() -->                                                            <!-- ko if:$root.remainingTryTimes()>0 -->                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}"><span data-bind="text: $root.i18n.examStatus.retry1"></span><span data-bind="text: $root.remainingTryTimes()"></span><span data-bind="text: $root.i18n.examStatus.retry2"></span></a>                                                            <!-- /ko -->                                                            <!--ko if:$root.remainingTryTimes()<=0 -->                                                                <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.noRetryTimes"></a>                                                            <!-- /ko -->                                                        <!-- /ko -->                                                    <!-- /ko -->                                                    <!-- ko if:$root.userExamStatus()!=8 -->                                                        <!-- ko if:$root.userExamStatus()==16 -->                                                            <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.waitingPerusal"></a>                                                        <!-- /ko -->                                                        <!-- ko if:$root.userExamStatus()!=16 -->                                                            <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.ended"></a>                                                        <!-- /ko -->                                                    <!-- /ko -->                                                <!-- /ko -->                                                <!-- ko if:!$root.isExamEnd() -->                                                    <!-- ko if:$root.userExamStatus()<=0 -->                                                        <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.disabled"></a>                                                    <!-- /ko -->                                                    <!-- ko if:$root.userExamStatus()>=8 -->                                                        <!-- ko if:$root.userExamStatus()==8 -->                                                            <!-- ko if:$root.canContinue() -->                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}, text: $root.i18n.examStatus.goon"></a>                                                            <!-- /ko -->                                                            <!-- ko if:!$root.canContinue() -->                                                                <!-- ko if:$root.remainingTryTimes()>0 -->                                                                    <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}"><span data-bind="text: $root.i18n.examStatus.retry1"></span><span data-bind="text: $root.remainingTryTimes()"></span><span data-bind="text: $root.i18n.examStatus.retry2"></span></a>                                                                <!-- /ko -->                                                                <!-- ko if:$root.remainingTryTimes()<=0 -->                                                                    <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.noRetryTimes"></a>                                                                <!-- /ko -->                                                            <!-- /ko -->                                                        <!-- /ko -->                                                        <!-- ko if:$root.userExamStatus()!=8 -->                                                            <!-- ko if:$root.userExamStatus()==16 -->                                                                <!-- ko if:$root.markedNotStarted() -->                                                                    <!--ko if: $root.enrollType() == 5-->                                                                        <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.enrollNow"></a>                                                                    <!--/ko-->                                                                    <!--ko if: $root.enrollType() != 5-->                                                                        <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.wait"></a>                                                                    <!--/ko-->                                                                <!-- /ko -->                                                                <!-- ko if:!$root.markedNotStarted() -->                                                                    <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.waitingPerusal"></a>                                                                <!-- /ko -->                                                            <!-- /ko -->                                                            <!-- ko if:$root.userExamStatus()!=16 -->                                                                <!-- ko if:$root.markedNotStarted() -->                                                                    <!--ko if: $root.enrollType() == 5-->                                                                        <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.enrollNow"></a>                                                                    <!--/ko-->                                                                    <!--ko if: $root.enrollType() != 5-->                                                                        <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.wait"></a>                                                                    <!--/ko-->                                                                <!-- /ko -->                                                                <!-- ko if:$root.remainingTryTimes()>0 && !$root.markedNotStarted() -->                                                                    <!--ko if: $root.remainingTryTimes() <= 1000 -->                                                                        <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}">                                                                            <span data-bind="text: $root.i18n.examStatus.retry1"></span>                                                                            <span data-bind="text: $root.remainingTryTimes()"></span>                                                                            <span data-bind="text: $root.i18n.examStatus.retry2"></span>                                                                        </a>                                                                    <!--/ko-->                                                                    <!--ko if: $root.remainingTryTimes() > 1000-->                                                                        <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}">                                                                            <span data-bind="text: $root.i18n.examStatus.retryNoLimit()"></span>                                                                        </a>                                                                    <!--/ko-->                                                                <!-- /ko -->                                                                <!-- ko if:$root.remainingTryTimes()<=0 && !$root.markedNotStarted() -->                                                                    <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.noRetryTimes"></a>                                                                <!-- /ko -->                                                            <!-- /ko -->                                                        <!-- /ko -->                                                    <!-- /ko -->                                                    <!-- ko if:$root.userExamStatus()<8 -->                                                        <!-- ko if:$root.userExamStatus()>0 -->                                                            <!-- ko if:$root.remainingTryTimes()<=0 -->                                                                <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.disabled"></a>                                                            <!-- /ko -->                                                            <!-- ko if:$root.remainingTryTimes()>=1 -->                                                                <!-- ko if:$root.userExamStatus()==1 -->                                                                    <!-- ko if:!$root.isExamStarted() -->                                                                        <!--ko if: $root.enrollType() == 1 || $root.enrollType() == 2-->                                                                            <!--ko if: $root.userEnrollType() == null-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.enrollNow"></a>                                                                            <!--/ko-->                                                                            <!--ko if: $root.userEnrollType() != null-->                                                                                <!--ko if: $root.userEnrollType() == 0-->                                                                                    <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.pendingAudit"></a>                                                                                <!--/ko-->                                                                                <!--ko if:$root.userEnrollType() == 2-->                                                                                    <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.reEnrollNow"></a>                                                                                    <div class="wt-reject">                                                                                        <b data-bind="text: $root.i18n.reason"></b>                                                                                        <span class="wt-txt-newline" data-bind="text: $root.opinion()"></span>                                                                                    </div>                                                                                <!--/ko-->                                                                                <!--ko if: $root.userEnrollType() == 12-->                                                                                    <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.paying"></a>                                                                                <!--/ko-->                                                                                <!--ko if: $root.userEnrollType() == 5 || $root.userEnrollType() == 13-->                                                                                    <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.enrollNow"></a>                                                                                <!--/ko-->                                                                                <!--ko if: $root.userEnrollType() == 1 || $root.userEnrollType() == 4 || $root.userEnrollType() == 8-->                                                                                    <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.wait"></a>                                                                                <!--/ko-->                                                                            <!--/ko-->                                                                        <!--/ko-->                                                                        <!--ko if: $root.enrollType() == 0 || $root.enrollType() == 4-->                                                                            <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.wait"></a>                                                                        <!--/ko-->                                                                    <!--/ko-->                                                                <!--/ko-->                                                                <!--ko if: $root.userExamStatus() == 4-->                                                                    <!--ko if:$root.enrollType() == 0-->                                                                        <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}, text: $root.i18n.examStatus.start"></a>                                                                    <!--/ko-->                                                                    <!--ko if:$root.enrollType() != 0 && $root.userEnrollType() == null-->                                                                        <!--ko if:$root.enrollType() == 4-->                                                                            <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.notEnroll"></a>                                                                        <!--/ko-->                                                                        <!--ko if:$root.enrollType() == 2 || $root.enrollType() == 1-->                                                                            <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.enrollNow"></a>                                                                        <!--/ko-->                                                                        <!--ko if:$root.enrollType() == 5-->                                                                            <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.enrollNow"></a>                                                                        <!--/ko-->                                                                    <!--/ko-->                                                                    <!--ko if:$root.enrollType() != 0 && $root.userEnrollType() != null-->                                                                        <!--ko if:$root.enrollType() == 4-->                                                                            <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}, text: $root.i18n.examStatus.start"></a>                                                                        <!--/ko-->                                                                        <!--ko if:$root.enrollType() == 5 || $root.enrollType() == 1-->                                                                            <!--ko if:$root.userEnrollType() == 0-->                                                                                <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.pendingAudit"></a>                                                                            <!--/ko-->                                                                            <!--ko if:$root.userEnrollType() == 2-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.reEnrollNow"></a>                                                                                <div class="wt-reject">                                                                                    <b data-bind="text: $root.i18n.reason"></b>                                                                                    <span class="wt-txt-newline" data-bind="text: $root.opinion()"></span>                                                                                </div>                                                                            <!--/ko-->                                                                            <!--ko if: $root.userEnrollType() == 12-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.paying"></a>                                                                            <!--/ko-->                                                                            <!--ko if:$root.userEnrollType() == 5 || $root.userEnrollType() == 13-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.enrollNow"></a>                                                                            <!--/ko-->                                                                            <!--ko if:$root.userEnrollType() == 1 ||$root.userEnrollType() == 4 || $root.userEnrollType() == 8-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}, text: $root.i18n.examStatus.start"></a>                                                                            <!--/ko-->                                                                        <!--/ko-->                                                                        <!--ko if:$root.enrollType() == 2-->                                                                            <!--ko if:$root.userEnrollType() == 0-->                                                                                <a href="javascript:void(0);" class="ln-btn disabled" data-bind="text: $root.i18n.examStatus.pendingAudit"></a>                                                                            <!--/ko-->                                                                            <!--ko if:$root.userEnrollType() == 2-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.reEnrollNow"></a>                                                                                <div class="wt-reject">                                                                                    <b data-bind="text: $root.i18n.reason"></b>                                                                                    <span class="wt-txt-newline" data-bind="text: $root.opinion()"></span>                                                                                </div>                                                                            <!--/ko-->                                                                            <!--ko if: $root.userEnrollType() == 12-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.paying"></a>                                                                            <!--/ko-->                                                                            <!--ko if:$root.userEnrollType() == 5 || $root.userEnrollType() == 13-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.enrollButtonClick()},text: $root.i18n.examStatus.enrollNow"></a>                                                                            <!--/ko-->                                                                            <!--ko if:$root.userEnrollType() == 1 ||$root.userEnrollType() == 4 || $root.userEnrollType() == 8-->                                                                                <a href="javascript:void(0);" class="ln-btn" data-bind="click: function() {$root.onPrepareButtonClick()}, text: $root.i18n.examStatus.start"></a>                                                                            <!--/ko-->                                                                        <!--/ko-->                                                                    <!--/ko-->                                                                <!--/ko-->                                                            <!--/ko-->                                                        <!--/ko-->                                                    <!--/ko-->                                                <!--/ko-->                                            <!--/ko-->                                    <!--/ko-->                                </div>                                <div class="col-1 button" data-bind="visible: $root.examToolType()==1 && !$root.isInClient()">                                    <a href="javascript:;" class="ln-btn" data-bind="text: $root.i18n.examStatus.openClient, click:$root.setClientPrepareUrl.bind($root)"></a>                                </div>                            </div>                            <div class="rank col-2">                                <!--ko if:$root.showRanking()-->                                    <!--ko if:$root.rankingAble() == true-->                                        <!--ko if:$root.rank() == 1-->                                            <div class="ranking" data-bind="visible: $root.showRankingUrl() && $root.subType() != 1">                                                <i class="icon i-ranking"></i>                                                <a data-bind="text: $root.i18n.ranking, attr: { href: $root.rankingUrl }" href="javascript:;">排行榜</a>                                            </div>                                        <!-- /ko -->                                    <!-- /ko-->                                <!-- /ko-->                                <!--ko if: $root.showFavorite()-->                                    <div class="fav" data-bind="visible: $root.favoriteHander.enableFavorite()">                                        <i class="icon" data-bind="css: {\'i-fav2\': $root.collectionDisabled(), \'i-fav\': !$root.collectionDisabled() }"></i>                                        <a data-bind="click: $root.onCollection, text: $root.collectionDisabled() ? $root.i18n.cancelCollection : $root.i18n.collection, css: { \'disabled\': $root.collectionDisabled }" href="javascript:;">收藏</a>                                    </div>                                <!--/ko-->                                <div class="history" data-bind="visible: $root.showHistory()">                                    <i class="icon i-history"></i>                                    <a data-bind="attr: { href: $root.historyScoreUrl }, text: $root.getHistoryText()" href="javascript:;">历史成绩</a>                                </div>                            </div>                            <div class="paper">                                <div class="info col-2">                                    <ul>                                        <li>                                            <span class="label" data-bind="text: $root.i18n.examQNum">考试题数</span>                                            <span><!--ko text:quCount--><!--/ko-->&nbsp;<!--ko text: $root.i18n.question--><!--/ko--></span>                                        </li>                                        <li data-bind="$root.subType() != 1">                                            <span class="label" data-bind="text: $root.i18n.totalScore">总分</span>                                            <span data-bind="html:score() + $root.i18n.score()"></span>                                        </li>                                        <li data-bind="$root.subType() != 1 && $root.subType() != 2">                                            <span class="label" data-bind="text: $root.i18n.passScore">及格分</span>                                            <span data-bind="html:$root.passScoreTitle(passScore())"></span>                                        </li>                                        <li>                                            <span class="label" data-bind="text: $root.i18n.examTimeLength">考试时长</span>                                            <span><t data-bind="html:completionSeconds()?completionSeconds():$root.i18n.noEndTime"></t><!--ko text: $root.i18n.minute--><!--/ko--></span>                                        </li>                                    </ul>                                </div>                                <div class="time">                                    <label class="label" data-bind="text: $root.i18n.examTimeTitle">考试时间\uFF1A</label>                                    <p class="text-indent">                                        <!--ko text: $root.getExamBeginTime()--><!--/ko-->&nbsp;&nbsp;&nbsp;<!--ko text: $root.i18n.toText--><!--/ko-->&nbsp;&nbsp;&nbsp;<!--ko text: $root.getExamEndTime()--><!--/ko-->                                    </p>                                </div>                                <div class="description" data-bind="visible: $root.examDetail().length>0">                                    <label class="label" data-bind="text: $root.i18n.examSummary">考试介绍\uFF1A</label>                                    <p class="text-indent" data-bind="html: $root.examDetail"></p>                                </div>                                <div class="warn" data-bind="visible: $root.description().length>0">                                    <label class="label" data-bind="text: $root.i18n.caution">注意事项\uFF1A</label>                                    <span data-bind="text: $root.description()"></span>                                </div>                            </div>                        </div>                    </div>                    <div class="ma-left"></div>                </div>                <div class="pre-footer"></div>            </div>        ';
        var mobileTmpl = '            <div class="test-enter" data-bind="visible: $root.mobileOrNot()" style="z-index:99;">                <div class="test-enter-con">                    <div class="testpaper-info text-center" style="border: none;">                        <span class="fail-message" data-bind="text: $root.i18n.toMobile"></span>                    </div>                </div>            </div>        ';
        $.widget('studying.examPrepare', {
            options: {
                collectionDisabled: false,
                onUpdateStatus: null,
                enrollExam: null,
                back: 'javascript:void(0);',
                rankingUrl: '',
                rank: 1,
                mobileOrNot: !!window.navigator.userAgent.match(/AppleWebKit.*Mobile.*/),
                showFavorite: true,
                showRanking: true,
                examToolType: 0,
                isInClient: false,
                clientPrepareUrl: '',
                description: '',
                checkDisplayRanking: function () {
                },
                favoriteHander: {
                    enableFavorite: false,
                    addFavorites: function () {
                    },
                    deleteFavorites: function () {
                    },
                    checkFavorites: function () {
                    }
                },
                i18n: {
                    examQNum: '考试题数',
                    passScore: '及格分',
                    examTimeLength: '考试时长',
                    back: '< 返回',
                    question: '题',
                    totalScore: '总分',
                    pass: '及格',
                    minute: '分钟',
                    caution: '注意',
                    timeHint: '距离考试结束',
                    examStartTime: '考试开始时间\uFF1A',
                    cautionItem1: '1\u3001开始考试后不可暂停\uFF0C时间到后自动交卷\uFF0C请注意时间安排\u3002',
                    cautionItem2: '2\u3001答题结束\uFF0C点击\u201C交卷\u201D完成当前考试\u3002',
                    examFinishTitle: '考试已结束',
                    examEndTitle: '距离考试结束还有\uFF1A',
                    examStartTitle: '距离开考还有\uFF1A',
                    examStartedTitle: '考试已开始\uFF1A',
                    examFinished: '本次考试时间已到, 不能继续答题',
                    commit: '交卷',
                    sureBtn: '确定',
                    confirmCaption: '系统提示',
                    notSupport: {
                        subType2: '闯关请到移动端体验\uFF01',
                        subType3: '竞赛请到移动端体验\uFF01<br>99u中的体验路径为\uFF1A\u3010我\u3011-\u3010更多应用\u3011-\u3010智力竞赛\u3011'
                    },
                    hours: '小时',
                    minutes: '分',
                    seconds: '秒',
                    score: '分',
                    noEndTime: '不限',
                    examTimeTitle: '考试时间',
                    examSummary: '考试介绍',
                    bestScore: '最高分',
                    lastAnswer: '上次结果',
                    noBestScore: '无统计',
                    historyScore: '历史成绩',
                    viewAnalysis: '查看解析',
                    toText: '至',
                    examStatus: {
                        ended: '考试已结束',
                        disabled: '考试不可用',
                        goon: '继续考试',
                        noRetryTimes: '无考试机会',
                        wait: '即将开始',
                        start: '开始考试',
                        retry1: '重新考试\uFF08剩',
                        retry2: '次机会\uFF09',
                        waitingPerusal: '待批改',
                        enrollNow: '立即报名',
                        pendingAudit: '待审核',
                        rejectAudit: '审核拒绝',
                        notEnroll: '未报名',
                        reEnrollNow: '重新报名',
                        retryNoLimit: '重新考试\uFF08不限次数\uFF09',
                        paying: '待付款',
                        openClient: '打开客户端'
                    },
                    ranking: '排行榜',
                    reason: '原因: ',
                    clientTip: {
                        title: '客户端考试提示',
                        content: '请在打开的客户端中进行考试\uFF0C如未能打开客户端\uFF0C请联系管理员\uFF01',
                        close: '关闭'
                    },
                    detection: '音频试听'
                }
            },
            _init: function () {
                var that = this;
                document.title = this.options.title;
                if (!this.options.onUpdateStatus) {
                    this.options.onUpdateStatus = this._nextStatus;
                }
                if (!this.options.mobileOrNot)
                    this.element.html(tmpl);
                else
                    this.element.html(mobileTmpl);
                var op = this.options;
                this._vm = ko.mapping.fromJS(op);
                this._vm.isTimerReady = ko.observable(false);
                if (userId && this._vm.favoriteHander.enableFavorite()) {
                    this.checkCollection();
                }
                this._checkDisplayRanking();
                this._vm.onCollection = function () {
                    var _self = this;
                    if (!this.collectionDisabled()) {
                        var addData = {
                            'source_request': {
                                'source_id': op.examId,
                                'source_type': 'e-exam'
                            },
                            'title': op.title,
                            'link': examLink,
                            'web_link': window.location.href,
                            'text': op.examDetail,
                            'image': ''
                        };
                        this.favoriteHander.addFavorites(addData).done(function () {
                            _self.collectionDisabled(true);
                        }).fail(function () {
                            $.fn.udialog.confirm2(_self.i18n.collectionFail(), {
                                title: _self.i18n.confirmCaption(),
                                buttons: [{
                                        text: _self.i18n.sureBtn(),
                                        click: function () {
                                            var t = $(this);
                                            t['udialog']('hide');
                                        },
                                        'class': 'default-btn'
                                    }]
                            });
                        });
                    } else {
                        var cancelData = {
                            source_id: op.examId,
                            source_type: 'e-exam'
                        };
                        this.favoriteHander.deleteFavorites(cancelData).done(function () {
                            _self.collectionDisabled(false);
                        }).fail(function () {
                            $.fn.udialog.confirm2(_self.i18n.collectionFail(), {
                                title: _self.i18n.confirmCaption(),
                                buttons: [{
                                        text: _self.i18n.sureBtn(),
                                        click: function () {
                                            var t = $(this);
                                            t['udialog']('hide');
                                        },
                                        'class': 'default-btn'
                                    }]
                            });
                        });
                    }
                };
                this._vm.passScoreTitle = function (s) {
                    s = s ? s : 0;
                    return s == -1 ? '--' : s.toString() + this.i18n.score();
                };
                this._vm.getExamBeginTime = function () {
                    return this.dateFormat(new Date(ko.unwrap(this.examBeginTime)), 'yyyy/MM/dd hh:mm:ss');
                };
                this._vm.getExamEndTime = function () {
                    if (this.examEndTime() >= _enum.Studying.ConstValue.MaxExamEndTime)
                        return ko.unwrap(this.i18n.noEndTime);
                    return this.dateFormat(new Date(ko.unwrap(this.examEndTime)), 'yyyy/MM/dd hh:mm:ss');
                };
                this._vm.isPassed = function () {
                    var result = false;
                    if (ko.utils.unwrapObservable(this.bestScore) >= ko.unwrap(this.passScore))
                        result = true;
                    return result;
                };
                this._vm.getUserExamStatus = function () {
                    return this.userExamStatus();
                };
                this._vm.showHightSocre = function () {
                    if (ko.unwrap(this.bestScore) == null || ko.unwrap(this.bestScore) == undefined)
                        return false;
                    return true;
                };
                this._vm.getBestScore = function () {
                    var score = ko.unwrap(this.bestScore);
                    var r = /^[+-]?[1-9]?[0-9]*\.[0-9]*$/;
                    if (r.test(score))
                        return score.toFixed(1);
                    return score;
                };
                this._vm.showHistory = function () {
                    var historyAble = ko.unwrap(this.historyAble);
                    if (!historyAble)
                        return false;
                    if (!ko.unwrap(this.historyScoreUrl))
                        return false;
                    if (ko.unwrap(this.bestScore) == undefined)
                        return false;
                    return true;
                };
                this._vm.showAnalysis = function () {
                    var status = ko.unwrap(this.analysisCondStatus);
                    if (status == 0)
                        return false;
                    if (status == 1)
                        return true;
                    if (status == 2)
                        return ko.unwrap(this.remainingTryTimes) <= 0 ? true : false;
                    if (status == 3) {
                        var timeZone = JSON.parse(ko.unwrap(this.analysisCondata));
                        var beginTime = new Date(timeZone.begin_time).getTime();
                        var endTime = new Date(timeZone.end_time).getTime();
                        var now = new Date().getTime();
                        return now >= beginTime && now <= endTime ? true : false;
                    }
                };
                this._vm.getHistoryText = function () {
                    return ko.unwrap(this.i18n.historyScore);
                };
                this._vm.setClientPrepareUrl = function (data, event) {
                    var _self = this;
                    var clientPrepareUrl = ko.unwrap(this.clientPrepareUrl);
                    clientPrepareUrl = 'elearningexamclient://param?target_url=' + clientPrepareUrl + '&__mac=' + Nova.getMacToB64(clientPrepareUrl);
                    event.target.href = clientPrepareUrl;
                    $.fn.udialog.alert(_self.i18n.clientTip.content(), {
                        title: _self.i18n.clientTip.title(),
                        dialogClass: 'udialog-blue',
                        buttons: [{
                                text: _self.i18n.clientTip.close(),
                                click: function () {
                                    $(this).udialog('hide');
                                },
                                'class': 'ui-btn-primary'
                            }]
                    });
                    return true;
                };
                this._vm.showCountDown = ko.observable(false);
                this._vm.markedNotStarted = ko.observable(false);
                this._vm.isExamStarted = function () {
                    var examStartTime = new Date(ko.unwrap(this.examBeginTime)).getTime(), examEndTime = new Date(ko.unwrap(this.examEndTime)).getTime(), now = new Date(timer.time()).getTime();
                    if (now > examStartTime && now < examEndTime)
                        return true;
                    return false;
                };
                this._vm.isExamEnd = ko.computed($.proxy(function () {
                    if (!ko.unwrap(this.isTimerReady))
                        return false;
                    var examEndTime = new Date(this.examEndTime()).getTime();
                    var now = new Date(timer.time()).getTime();
                    if (now > examEndTime)
                        return true;
                    return false;
                }, this._vm));
                this._vm.canContinue = function () {
                    if (!this.leavetime())
                        return true;
                    var now = new Date(timer.time()).getTime(), leaveTime = new Date(ko.unwrap(this.leavetime)).getTime();
                    if (now > leaveTime)
                        return false;
                    return true;
                };
                this._vm.getBeginTime = function () {
                    return this.dateFormat(new Date(ko.unwrap(this.examBeginTime)), 'yyyy/MM/dd hh:mm:ss');
                };
                this._vm.largetThenSeven = function () {
                    var examEndTime = this.dateFormat(new Date(ko.unwrap(this.examBeginTime)), 'yyyy/MM/dd hh:mm:ss');
                    var now = this.dateFormat(new Date(timer.time()), 'yyyy/MM/dd hh:mm:ss');
                    var days = this.GetDateDiff(now, examEndTime, 'day');
                    return days >= 7;
                };
                this._vm.showExamEndTime = function () {
                    return this.largetThenSeven();
                };
                this._vm.showRankingUrl = function () {
                    var url = ko.unwrap(this.rankingUrl);
                    return url && url.length > 0;
                };
                this._vm.GetDateDiff = function (startTime, endTime, diffType) {
                    startTime = startTime.replace(/\-/g, '/');
                    endTime = endTime.replace(/\-/g, '/');
                    diffType = diffType.toLowerCase();
                    var sTime = new Date(startTime);
                    var eTime = new Date(endTime);
                    var divNum = 1;
                    switch (diffType) {
                    case 'second':
                        divNum = 1000;
                        break;
                    case 'minute':
                        divNum = 1000 * 60;
                        break;
                    case 'hour':
                        divNum = 1000 * 3600;
                        break;
                    case 'day':
                        divNum = 1000 * 3600 * 24;
                        break;
                    default:
                        break;
                    }
                    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
                };
                this._vm.dateFormat = function (value, format) {
                    var o = {
                        'M+': value.getMonth() + 1,
                        'd+': value.getDate(),
                        'h+': value.getHours(),
                        'm+': value.getMinutes(),
                        's+': value.getSeconds(),
                        'q+': Math.floor((value.getMonth() + 3) / 3),
                        'S': value.getMilliseconds()
                    };
                    if (/(y+)/.test(format))
                        format = format.replace(RegExp.$1, (value.getFullYear() + '').substr(4 - RegExp.$1.length));
                    for (var k in o)
                        if (new RegExp('(' + k + ')').test(format))
                            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
                    return format;
                };
                this._vm.onPrepareButtonClick = $.proxy(this._onPrepareButtonClick, this);
                this._vm.enrollButtonClick = $.proxy(this._enrollButtonClick, this);
                this._vm.onDetection = $.proxy(this._onDetection, this);
                ko.applyBindings(this._vm, $('.test-enter')[0]);
                if (this._vm.examToolType() == 0 || this._vm.isInClient()) {
                    timer.ready().done(function () {
                        that._vm.isTimerReady(true);
                        timer.startTimeline();
                        that._onStatusChange();
                    });
                }
            },
            _checkDisplayRanking: function () {
                var checkDisplayRanking = this._vm.checkDisplayRanking() || null;
                if (checkDisplayRanking) {
                    checkDisplayRanking.done($.proxy(function (resData) {
                        if (resData) {
                            if (resData.value == 'false') {
                                this._vm.showRanking(false);
                            } else {
                                this._vm.showRanking(true);
                            }
                        }
                    }, this)).fail($.proxy(function (resData) {
                        this._vm.showRanking(true);
                    }, this));
                } else {
                    this._vm.showRanking(true);
                }
            },
            checkCollection: function () {
                var _self = this;
                var postArr = [{
                        source_id: _self._vm.examId(),
                        source_type: 'e-exam'
                    }];
                this._vm.favoriteHander.checkFavorites(postArr).done(function (resData) {
                    if (resData && resData.items) {
                        _self._vm.collectionDisabled(resData.items[0].is_fav);
                    }
                });
            },
            updateUserEnrollType: function (examCandidateVo) {
                this._vm.userEnrollType(examCandidateVo.userEnrollType ? examCandidateVo.userEnrollType : 0);
                this._vm.opinion(examCandidateVo.opinion ? examCandidateVo.opinion : '');
            },
            updateOptionData: function (mineData) {
                timer.removeHandler('tick');
                this._vm.userExamStatus(mineData.status);
                mineData.endTime && this._vm.examEndTime(mineData.endTime);
                if (!this._vm.isExamEnd()) {
                    switch (this._vm.userExamStatus()) {
                    case _enum.Studying.UserExamStatus.Marked:
                        this._vm.showCountDown(false);
                        this._vm.markedNotStarted(false);
                        break;
                    case _enum.Studying.UserExamStatus.Ready:
                        this._vm.showCountDown(false);
                        if (!this._vm.isExamEnd())
                            this._onStatusChange();
                        break;
                    case _enum.Studying.UserExamStatus.SubmitAndFinished:
                        this._end();
                        break;
                    case _enum.Studying.UserExamStatus.Submit:
                        this._vm.showCountDown(false);
                        this._vm.markedNotStarted(false);
                        this._end();
                        break;
                    case _enum.Studying.UserExamStatus.Joining:
                        this._vm.userExamStatus(_enum.Studying.UserExamStatus.SubmitAndFinished);
                        this._end();
                        break;
                    case _enum.Studying.UserExamStatus.UnjoinAndFinished:
                    case _enum.Studying.UserExamStatus.SubmitAndFinished:
                    case _enum.Studying.UserExamStatus.MarkedAndFinished:
                    case _enum.Studying.UserExamStatus.Timeout:
                        this._vm.examEndTime(new Date().getTime());
                        break;
                    default:
                        if (this._vm.isExamEnd()) {
                            this._vm.isExamEnd(this.examEndTime);
                        }
                        break;
                    }
                }
            },
            _enrollButtonClick: function () {
                $.proxy(this.options.enrollExam, this)();
            },
            _onDetection: function () {
                $.proxy(this.options.onDetection, this)();
            },
            _onPrepareButtonClick: function () {
                switch (this._vm.userExamStatus()) {
                case _enum.Studying.UserExamStatus.Disabled:
                    break;
                case _enum.Studying.UserExamStatus.Waiting:
                case _enum.Studying.UserExamStatus.Ready:
                case _enum.Studying.UserExamStatus.Preparation:
                    this._start(1);
                    break;
                case _enum.Studying.UserExamStatus.Joining:
                    this._start(2);
                    break;
                case _enum.Studying.UserExamStatus.Submit:
                case _enum.Studying.UserExamStatus.Marked:
                    if (!this._vm.isExamStarted()) {
                        this._start(1);
                        break;
                    }
                case _enum.Studying.UserExamStatus.UnjoinAndFinished:
                case _enum.Studying.UserExamStatus.SubmitAndFinished:
                case _enum.Studying.UserExamStatus.MarkedAndFinished:
                case _enum.Studying.UserExamStatus.Timeout:
                    this._start(1);
                    break;
                }
                $('.test-enter').hide().siblings().show();
            },
            _onStatusChange: function () {
                timer.appendRepeateHandler('tick', $.proxy(this._onTimerElapsed, this), Number.MAX_VALUE, 400);
                switch (this._vm.userExamStatus()) {
                case _enum.Studying.UserExamStatus.Disabled:
                    this._processDisabled();
                    break;
                case _enum.Studying.UserExamStatus.Waiting:
                    this._processWaiting();
                    break;
                case _enum.Studying.UserExamStatus.Ready:
                    this._processUnJoined();
                    break;
                case _enum.Studying.UserExamStatus.Joining:
                    this._processHasJoined();
                    break;
                case _enum.Studying.UserExamStatus.Submit:
                    if (!this._vm.isExamStarted()) {
                        this._processWaiting();
                        break;
                    }
                case _enum.Studying.UserExamStatus.Marked:
                    if (!this._vm.isExamStarted()) {
                        this._processWaiting();
                        break;
                    }
                case _enum.Studying.UserExamStatus.UnjoinAndFinished:
                case _enum.Studying.UserExamStatus.SubmitAndFinished:
                case _enum.Studying.UserExamStatus.MarkedAndFinished:
                case _enum.Studying.UserExamStatus.Timeout:
                    this._processFinished();
                    break;
                }
            },
            _onTimerElapsed: function () {
                var that = this;
                if (!ko.unwrap(that._vm.userExamStatus) > 0)
                    that._vm.showCountDown(false);
                else if (ko.unwrap(this._vm.userExamStatus) == 112)
                    that._vm.showCountDown(false);
                else if (that._vm.isExamEnd())
                    that._vm.showCountDown(false);
                else if (ko.unwrap(that._vm.remainingTryTimes) <= 0 && ko.unwrap(this._vm.userExamStatus()) != 8)
                    that._vm.showCountDown(false);
                else if (!this._vm.leavetime() && ko.unwrap(this._vm.userExamStatus) == 8)
                    that._vm.showCountDown(false);
                else
                    that._vm.showCountDown(true);
                switch (this._vm.userExamStatus()) {
                case _enum.Studying.UserExamStatus.Submit:
                    if (!this._vm.isExamStarted()) {
                        that._vm.markedNotStarted(true);
                        $('.j-ln-exam-tick').html(this._getFormatTime(this._vm.examBeginTime() / 1000 - timer.time() / 1000));
                        break;
                    }
                case _enum.Studying.UserExamStatus.Marked:
                    if (!this._vm.isExamStarted()) {
                        that._vm.markedNotStarted(true);
                        $('.j-ln-exam-tick').html(this._getFormatTime(this._vm.examBeginTime() / 1000 - timer.time() / 1000));
                        break;
                    }
                case _enum.Studying.UserExamStatus.Waiting:
                    $('.j-ln-exam-tick').html(this._getFormatTime(this._vm.examBeginTime() / 1000 - timer.time() / 1000));
                    break;
                case _enum.Studying.UserExamStatus.Ready:
                    if (this._vm.leavetime())
                        $('.j-ln-exam-tick').html(this._getFormatTime(this._vm.leavetime() / 1000 - timer.time() / 1000));
                    break;
                case _enum.Studying.UserExamStatus.Joining:
                    if (this._vm.leavetime())
                        $('.j-ln-exam-tick').html(this._getFormatTime(this._vm.leavetime() / 1000 - timer.time() / 1000));
                    break;
                }
            },
            _processFinished: function () {
                $('.test-enter-cd.countdown').html('');
                timer.removeHandler('tick');
            },
            _processDisabled: function () {
                var html = [];
                html.push(this.options.i18n.examFinishTitle);
                $('.test-enter-cd.countdown').html(html.join(''));
                timer.removeHandler('tick');
            },
            _processWaiting: function () {
                var html = [];
                html.push(this.options.i18n.examStartTitle + '<em class="j-ln-exam-tick"></em>');
                $('.test-enter-cd.countdown').html(html.join(''));
                timer.appendHandler('nextstatus', Math.min(_enum.Studying.ConstValue.MinDateTime + timer.time(), this._vm.examBeginTime()), $.proxy(this.options.onUpdateStatus, this));
            },
            _processUnJoined: function () {
                var html = [];
                if (this._vm.examMode() == 0) {
                    html.push(this.options.i18n.examStartedTitle + '<em class="j-ln-exam-tick"></em>');
                }
                $('.test-enter-cd.countdown').html(html.join(''));
                if (this._vm.leavetime()) {
                    timer.appendHandler('nextstatus', Math.min(_enum.Studying.ConstValue.MinDateTime + timer.time(), this._vm.leavetime()), $.proxy(this.options.onUpdateStatus, this));
                } else {
                    timer.appendHandler('nextstatus', this._vm.examEndTime(), $.proxy(this.options.onUpdateStatus, this));
                }
            },
            _processHasJoined: function () {
                var html = [];
                if (this._vm.leavetime()) {
                    html.push(this.options.i18n.examEndTitle + '<em class="j-ln-exam-tick"></em>');
                    $('.test-enter-cd.countdown').html(html.join(''));
                    timer.appendHandler('nextstatus', Math.min(_enum.Studying.ConstValue.MinDateTime + timer.time(), this._vm.leavetime()), $.proxy(this.options.onUpdateStatus, this));
                } else {
                    timer.appendHandler('nextstatus', this._vm.examEndTime(), $.proxy(this.options.onUpdateStatus, this));
                }
            },
            _nextStatus: function () {
                timer.removeHandler('tick');
                switch (this._vm.userExamStatus()) {
                case _enum.Studying.UserExamStatus.Marked:
                    this._vm.showCountDown(false);
                    this._vm.markedNotStarted(false);
                    break;
                case _enum.Studying.UserExamStatus.Waiting:
                    this._vm.userExamStatus(_enum.Studying.UserExamStatus.Ready);
                    this._vm.showCountDown(false);
                    break;
                case _enum.Studying.UserExamStatus.Ready:
                    this._vm.userExamStatus(_enum.Studying.UserExamStatus.Ready);
                    if (!this._vm.isExamEnd())
                        this._onStatusChange();
                    break;
                case _enum.Studying.UserExamStatus.Joining:
                    this._vm.userExamStatus(_enum.Studying.UserExamStatus.SubmitAndFinished);
                    this._end();
                    break;
                }
            },
            _start: function (mode) {
                this._vm.showCountDown(false);
                this._trigger('start', null, mode);
            },
            _end: function () {
                this._vm.showCountDown(false);
                timer.removeHandler('tick');
                this._trigger('end', null);
            },
            _getFormatTime: function (time) {
                if (time > -1) {
                    var result = '', h = parseInt(time / 3600), m = parseInt(time % 3600 / 60), s = parseInt(time % 60);
                    if (h > 0)
                        return h + this.options.i18n.hours + m + this.options.i18n.minutes + s + this.options.i18n.seconds;
                    if (m > 0)
                        return m + this.options.i18n.minutes + s + this.options.i18n.seconds;
                    return s + this.options.i18n.seconds;
                } else {
                    return '0' + this.options.i18n.seconds;
                }
            }
        });
    }(jQuery));
});
define('studying.end', [
    'require',
    'exports',
    'module',
    'studying.enum'
], function (require, exports, module) {
    var _enum = require('studying.enum');
    (function ($) {
        var tmpl = '<div class="test-enter test-result" style="z-index:99;">    <div class="test-enter-con">        <div></div>        <div class="testpaper-info text-center" style="border: none;">            <div data-bind="if:$root.data.subType()!=1">                <div class="exam-result-img" data-bind="css: { fail: !$root.isPassed(), success: $root.isPassed() }">                    <h2 data-bind="html:data.name"></h2>                </div>            </div>            <div class="exam-score-container" data-bind="if:$root.data.subType()!=1">                <div class="wait-check exam-score" data-bind="css: { fail: !$root.isPassed(), success: $root.isPassed() }, visible: $root.data.status() == 16 || $root.data.status() == 80 || $root.data.status() == 101">                    <span data-bind="text: $root.i18n.objectiveQuestionsTile">客观题</span><span data-bind="text: $root.getScore()"></span><i data-bind="text: $root.i18n.score">分</i><span data-bind="text: $root.i18n.subjectQuestionTitle">\uFF0C主观题待批改</span>                </div>                <div class="exam-score" data-bind="visible: $root.data.status() == 0 || $root.data.status() == 32 || $root.data.status() == 64 || $root.data.status() == 96,css: { success: $root.isPassed(), fail: !$root.isPassed() }">                    <span data-bind="text: $root.getScore()"></span><i data-bind="text: $root.i18n.score">分</i>                </div>                <a data-bind="visible: data.analysisAllowed() && ($root.data.subType() != 2), click: $root.goAnalysis, text: $root.i18n.analysisTitle" class="exam-resolve" href="javascript:;">答案解析</a>            </div>            <!--ko if: $root.data.subType()!=1-->                <ul class="clearfix exam-detail">                    <li style="display:inline-block; border: none;" class="exam-item">                        <div>                            <b data-bind="text: $root.userTimeConsuming"></b>                        </div>                        <div>                            <span class="mark" data-bind="text: $root.i18n.consuming">考试用时</span>                        </div>                    </li>                    <li class="exam-item" style="display:inline-block;">                        <div>                            <b data-bind="text: $root.data.passingScore"></b><span data-bind="text: $root.i18n.score">分</span>                        </div>                        <div>                            <span class="mark" data-bind="text: $root.i18n.passingScore">及格分数</span>                        </div>                    </li>                    <li class="exam-item" style="display:inline-block;">                        <div>                            <b data-bind="text: $root.data.totalScore"></b><span data-bind="text: $root.i18n.score">分</span>                        </div>                        <div>                            <span class="mark" data-bind="text: $root.i18n.totalScore">总分</span>                        </div>                    </li>                </ul>            <!--/ko-->            <!--ko if: $root.data.subType()==1-->                <div class="exam-score-container">                    <h2 data-bind="text:$root.i18n.testResult"></h2>                    <div class="wt-txt-newline" data-bind="text: $root.data.userData.resultCode"></div>                    <!--ko if: $root.data.userData.urlOrNot() == true-->                        <div class="wt-txt-newline">                            <a data-bind="attr: {href: $root.data.userData.detailUrl}" style="color: #0f9cff!important;text-decoration: none;">查询详细描述</a>                        </div>                    <!--/ko-->                    <!--ko if: $root.data.userData.urlOrNot() == false-->                        <div class="wt-txt-newline" data-bind="html: $root.data.userData.resultText"></div>                    <!--/ko-->                </div>                <a data-bind="visible: data.analysisAllowed(), click: $root.goAnalysis, text: $root.i18n.analysisTitle" class="exam-resolve-center" href="javascript:;">答案解析</a>            <!--/ko-->            <div class="exam-btns">                <p>                    <!--ko if: $root.data.examChance() > 0-->                        <!--ko if:$root.data.examChance() <= 1000-->                            <a class="ln-exam-restart" href="javascript:void(0);" data-bind="click: $root.retryClick">                                <span data-bind="text: $root.i18n.retryTitle1">再考一次\uFF08剩</span>                                <span data-bind="text: $root.data.examChance()"></span>                                <span data-bind="text: $root.i18n.retryTitle2">次\uFF09</span>                            </a>                        <!--/ko-->                        <!--ko if:$root.data.examChance() > 1000-->                            <a class="ln-exam-restart" href="javascript:void(0);" data-bind="click: $root.retryClick">                                <span data-bind="text: $root.i18n.retryNoLimit()"></span>                            </a>                        <!--/ko-->                    <!--/ko-->                </p>            </div>            <div class="testpaper-info text-center" style="border: none; margin-top: 50px;">                <!--ko if:$root.showRanking()-->                    <!--ko if: $root.data.rankingAble() == true-->                    <!-- ko if: $root.rank() == 1-->                        <a class="l-ranking" data-bind="visible: $root.showRankingUrl()&&$root.data.subType()!=1, text: $root.i18n.ranking, attr: { href: $root.rankingUrl }"></a>                    <!-- /ko -->                    <!-- /ko-->                <!-- /ko-->                <!--ko if: $root.customId()-->                     <a class="l-ranking" data-bind="text: $root.i18n.seeTips, attr: { href: $root.customTypeUrl}, style: {marginLeft: $root.data.rankingAble() == true && $root.rank() == 1 && $root.showRankingUrl()&&$root.data.subType()!=1 ? 40 + \'px\' : 0}"></a>                <!-- /ko-->            </div>        </div>    </div></div>        ';
        $.widget('studying.end', {
            options: {
                detailDescribe: '查询详细描述',
                backUrl: 'javascript:void(0);',
                analysisUrl: 'http://www.baidu.com',
                title: '考试结束页',
                rankingUrl: '',
                data: {},
                rank: 1,
                checkDisplayRanking: function () {
                },
                showRanking: true,
                i18n: {
                    examEndPage: '考试结果',
                    back: '< 返回',
                    objectiveQuestionsTile: '客观题',
                    score: '分',
                    subjectQuestionTitle: '\uFF0C主观题待批改',
                    analysisTitle: '答案解析',
                    testResult: '你的测试结果\uFF1A',
                    consuming: '考试用时',
                    passingScore: '及格分数',
                    totalScore: '总分',
                    retryTitle2: '次\uFF09',
                    retryTitle1: '再考一次\uFF08剩',
                    hours: '小时',
                    minutes: '分',
                    seconds: '秒',
                    ranking: '排行榜',
                    retryNoLimit: '重新考试\uFF08不限次数\uFF09'
                }
            },
            _init: function () {
                document.title = this.options.i18n.examEndPage;
                this.element.html(tmpl);
                $('.test-enter').siblings().hide();
                var op = this.options;
                this._vm = ko.mapping.fromJS(op);
                this._vm.userTimeConsuming = ko.computed($.proxy(function () {
                    return this._getFormatTime(ko.unwrap(this._vm.data.userData.costTimes));
                }, this));
                this._vm.isPassed = function () {
                    var result = false;
                    switch (ko.unwrap(this.data.status)) {
                    case _enum.Studying.UserExamStatus.MarkedAndFinished:
                    case _enum.Studying.UserExamStatus.Marked:
                    case _enum.Studying.UserExamStatus.Timeout:
                    case _enum.Studying.UserExamStatus.Joining:
                    case _enum.Studying.UserExamStatus.Submit:
                        if (ko.unwrap(this.data.userData.score) >= ko.unwrap(this.data.passingScore))
                            result = true;
                        else
                            result = false;
                        break;
                    case _enum.Studying.UserExamStatus.Disabled:
                    case _enum.Studying.UserExamStatus.Waiting:
                    case _enum.Studying.UserExamStatus.Ready:
                    case _enum.Studying.UserExamStatus.UnjoinAndFinished:
                        result = false;
                        break;
                    }
                    return result;
                };
                this._vm.showRankingUrl = function () {
                    var url = ko.unwrap(this.rankingUrl);
                    return url && url.length > 0;
                };
                this._vm.getScore = function () {
                    var score = ko.unwrap(this.data.userData.score);
                    var r = /^[+-]?[1-9]?[0-9]*\.[0-9]*$/;
                    if (r.test(score))
                        return score.toFixed(1);
                    return score;
                };
                this._vm.retryClick = $.proxy(function () {
                    location.replace(this.options.restartUrl);
                }, this);
                this._vm.goAnalysis = $.proxy(function () {
                    location.replace(this.options.analysisUrl + '&exam_id=' + ko.unwrap(this._vm.data.examId) + '&session_id=' + ko.unwrap(this._vm.data.sessionId));
                }, this);
                this._checkDisplayRanking();
                ko.applyBindings(this._vm, $('.test-enter')[0]);
            },
            _getFormatTime: function (time) {
                if (time > -1) {
                    var result = '', h = parseInt(time / 3600), m = parseInt(time % 3600 / 60), s = parseInt(time % 60);
                    if (h > 0)
                        return h + ko.unwrap(this._vm.i18n.hours) + m + ko.unwrap(this._vm.i18n.minutes) + s + ko.unwrap(this._vm.i18n.seconds);
                    if (m > 0)
                        return m + ko.unwrap(this._vm.i18n.minutes) + s + ko.unwrap(this._vm.i18n.seconds);
                    return s + ko.unwrap(this._vm.i18n.seconds);
                } else {
                    return '0' + ko.unwrap(this._vm.i18n.seconds);
                }
            },
            _checkDisplayRanking: function () {
                var checkDisplayRanking = this._vm.checkDisplayRanking() || null;
                if (checkDisplayRanking) {
                    checkDisplayRanking.done($.proxy(function (resData) {
                        if (resData) {
                            if (resData.value == 'false') {
                                this._vm.showRanking(false);
                            } else {
                                this._vm.showRanking(true);
                            }
                        }
                    }, this)).fail($.proxy(function (resData) {
                        this._vm.showRanking(true);
                    }, this));
                } else {
                    this._vm.showRanking(true);
                }
            }
        });
    }(jQuery));
});
define('studying.ranking', [
    'require',
    'exports',
    'module',
    'studying.helper'
], function (require, exports, module) {
    var __helper = require('studying.helper');
    (function ($) {
        var tmpl = '         <div class="test-enter test-result" style="z-index:99;">            <div class="test-enter-con">                <div class="top-list">                    <div class="top-list-hd">                        <h3 data-bind="text: $root.i18n.rankingList"></h3>                        <div class="top-list-self" data-bind="visible: $root.rankings.items().length > 0">                            <span data-bind="text:$root.i18n.notAttend, visible: $root.my.ranking() <= 0"></span>                            <span data-bind="visible: $root.my.ranking() > 0">                                <span data-bind="text: $root.i18n.myRanking"></span>                                <em data-bind="text: $root.my.ranking"></em>                                <span data-bind="text: $root.i18n.position"></span>                            </span>                            <span data-bind="visible: $root.my.ranking() > 0">                                <span data-bind="text: $root.i18n.costTime"></span>                                <em data-bind="text: $root.my.costTimes"></em>                            </span>                            <span data-bind="visible: $root.my.ranking() > 0">                                <span data-bind="text: $root.i18n.bestScore"></span>                                <em data-bind="text: $root.my.bestScore"></em>                            </span>                        </div>                    </div>                    <table class="top-list-table" data-bind="visible:$root.rankings.items().length">                        <thead>                            <tr>                                <th class="top-list-th-1"><span data-bind="text: $root.i18n.ranking">排名</span></th>                                <th class="top-list-th-2"><span data-bind="text: $root.i18n.user">用户名</span></th>                                <th class="top-list-th-3"><span data-bind="text: $root.i18n.costTime">用时</span></th>                                <th class="top-list-th-4"><span data-bind="text: $root.i18n.bestScore">分数</span></th>                            </tr>                        </thead>                        <tbody data-bind="foreach: $root.rankings.items">                            <tr data-bind="css: { \'my\': $root.IsMy($data) }">                                <td class="top-list-td-1"><span><i data-bind="text: $index() + 1, css: $root.getTopClass($index())">1</i></span></td>                                <td class="top-list-td-2">                                    <div class="user-avatar">                                        <div data-bind="component: { name: \'image-loader\', params: { original:photoUrl, element:$element } }"></div>                                    </div>                                    <span class="user-name" data-bind="text: userName"></span>                                </td>                                <td class="top-list-td-3">                                    <span data-bind="text:$root.formatTime(costTimes)"></span>                                </td>                                <td class="top-list-td-4">                                    <strong data-bind="text: bestScores"></strong>                                </td>                            </tr>                        </tbody>                    </table>                    <div class="top-nodata" data-bind="text: $root.i18n.nodata, visible: $root.rankings.items().length <= 0">                    </div>                    <div class="tc click-load" data-bind="if: $root.status.hasNext()">                        <a href="javascript:;" data-bind="visible: !$root.status.loading(), click: $root.loadMore, text: $root.i18n.loadMore"></a>                        <span data-bind="visible: $root.status.loading(), text: $root.i18n.loading"></span>                    </div>                </div>            </div>         </div>        ';
        var store = {
            sendRequest: function (datas, tokenConfig, language) {
                var that = this;
                var obj = $.extend({
                    type: 'GET',
                    dataType: 'json',
                    requestCase: 'snake',
                    reponseCase: 'camel',
                    enableToggleCase: true,
                    contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                    traditional: true,
                    beforeSend: function (xhr) {
                        if (tokenConfig.needToken) {
                            var buff = __helper.Studying.HelperMethods.ResolveHost(obj.url);
                            var mac = {
                                'method': obj.type,
                                'path': buff.path,
                                'host': buff.host
                            };
                            var tokenInfo = tokenConfig.onGetToken(mac);
                            xhr.setRequestHeader('Authorization', tokenInfo['Authorization']);
                            if (obj.type.toLowerCase() != 'get')
                                xhr.setRequestHeader('X-Gaea-Authorization', tokenInfo['X-Gaea-Authorization']);
                        }
                        if (language)
                            xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                    }
                }, datas);
                if (obj.type.toLowerCase() == 'get') {
                    obj.url = __helper.Studying.HelperMethods.GenUrlEandRom(obj.url);
                }
                return $.ajax(obj).fail(function () {
                    if ($.studying.loading && $.isFunction($.studying.loading.hide))
                        $.studying.loading.hide();
                });
            },
            list: function (host, examId, pageSize, pageIndex, language, tokenConfig) {
                var datas = { url: host + '/v1/m/exams/' + examId + '/users/ranking?page=' + pageIndex + '&size=' + pageSize };
                return store.sendRequest(datas, tokenConfig, language);
            },
            my: function (host, examId, userId, language, tokenConfig) {
                var datas = { url: host + '/v1/m/exams/' + examId + '/users/ranking/' + userId };
                return store.sendRequest(datas, tokenConfig, language);
            }
        };
        $.widget('studying.ranking', {
            options: {
                host: 'http://' + window.location.host + '/',
                examId: '',
                title: '',
                userId: null,
                token: '',
                language: 'zh-cn',
                i18n: {
                    rankingList: '排行榜',
                    myRanking: '我的排名',
                    ranking: '排名',
                    user: '用户',
                    costTime: '用时',
                    bestScore: '最高分',
                    loadMore: '点击加载更多排名...',
                    loading: '加载中...',
                    nodata: '快参加考试\uFF0C冲上榜单吧\uFF01',
                    hours: '\u2032',
                    minutes: '\u2032\u2032',
                    seconds: '\u2032\u2032\u2032',
                    position: '位',
                    notAttend: '未参加'
                }
            },
            _init: function () {
                document.title = this.options.i18n.rankingList;
                this.element.html(tmpl);
                $('.test-enter').siblings().hide();
                var op = this.options;
                this._vm = ko.mapping.fromJS(op);
                this._vm.rankings = {
                    items: ko.observableArray([]),
                    totalCount: ko.observable(0),
                    pageSize: ko.observable(20),
                    pageIndex: ko.observable(0)
                };
                this._vm.status = {
                    hasNext: ko.observable(false),
                    loading: ko.observable(false)
                };
                this._vm.my = {
                    ranking: ko.observable(0),
                    costTimes: ko.observable(0),
                    userName: ko.observable(''),
                    bestScore: ko.observable(0),
                    userId: ko.observable(0)
                };
                this._vm.getMyInfo = $.proxy(function () {
                    var args = {
                        ranking: this._vm.my.ranking(),
                        bestScore: this._vm.my.bestScore(),
                        costTimes: this._vm.my.costTimes()
                    };
                    return this.stringFormat(this._vm.i18n.myInfo(), args);
                }, this);
                this._vm.getTopClass = $.proxy(function (index) {
                    return 'top-' + (index + 1);
                });
                this._vm.formatTime = $.proxy(function (time) {
                    if (time > -1) {
                        var result = '', h = parseInt(time / 3600), m = parseInt(time % 3600 / 60), s = parseInt(time % 60);
                        if (h > 0)
                            return h + ko.unwrap(this._vm.i18n.hours) + m + ko.unwrap(this._vm.i18n.minutes) + s + ko.unwrap(this._vm.i18n.seconds);
                        if (m > 0)
                            return m + ko.unwrap(this._vm.i18n.minutes) + s + ko.unwrap(this._vm.i18n.seconds);
                        return s + ko.unwrap(this._vm.i18n.seconds);
                    } else {
                        return '0' + ko.unwrap(this._vm.i18n.seconds);
                    }
                }, this);
                this._vm.loadMore = $.proxy(function () {
                    if (!this._vm.status.hasNext())
                        return;
                    var pageIndex = this._vm.rankings.pageIndex();
                    this._vm.rankings.pageIndex(pageIndex + 1);
                    this.list().done($.proxy(function (list) {
                        this.resetList(list);
                    }, this));
                }, this);
                this._vm.IsMy = $.proxy(function (data) {
                    return ko.unwrap(data.userId) == this._vm.my.userId();
                }, this);
                $.when(this.list(), this.loadMy()).done($.proxy(function (listData, myData) {
                    var list = listData[0], my = myData[0];
                    this.resetMy(my);
                    this.resetList(list);
                }, this));
                ko.applyBindings(this._vm, $('.test-enter')[0]);
            },
            resetMy: function (my) {
                if (my) {
                    this._vm.my.ranking(my.ranking);
                    this._vm.my.costTimes(this._vm.formatTime(my.costTimes));
                    this._vm.my.userName(my.userName);
                    this._vm.my.bestScore(my.bestScores);
                    this._vm.my.userId(my.userId);
                }
            },
            resetList: function (list) {
                if (list && list.count && list.count > 0) {
                    this._vm.rankings.items(this._vm.rankings.items().concat(list.items));
                    this._vm.status.loading(false);
                    if (this._vm.rankings.items().length < list.count)
                        this._vm.status.hasNext(true);
                    else
                        this._vm.status.hasNext(false);
                }
            },
            list: function () {
                var examId = this._vm.examId(), host = this._vm.host(), pageSize = this._vm.rankings.pageSize(), pageIndex = this._vm.rankings.pageIndex(), language = this._vm.language(), tokenConfig = ko.mapping.toJS(this._vm.tokenConfig);
                this._vm.status.loading(true);
                return store.list(host, examId, pageSize, pageIndex, language, tokenConfig);
            },
            loadMy: function () {
                var examId = this._vm.examId(), host = this._vm.host(), userId = this._vm.userId(), language = this._vm.language(), tokenConfig = ko.mapping.toJS(this._vm.tokenConfig);
                return store.my(host, examId, userId, language, tokenConfig);
            }
        });
    }(jQuery));
});
define('studying.history', [
    'require',
    'exports',
    'module',
    'studying.enum'
], function (require, exports, module) {
    var __enum = require('studying.enum');
    (function ($) {
        var tmpl = '            <div class="test-enter test-result" style="z-index:99;">                <div class="test-enter-con">                    <h2 data-bind="html:$root.data.exam.title"></h2>                    <div class="text-center" style="border: none;">                        <div class="clearfix" data-bind="if: $root.data.exam.subType() != 1 && $root.data.exam.subType() != 2, visible: $root.data.items().length">                            <div class="statistics"">                                <div class="list">                                    <label data-bind="html: $root.i18n.totalScoreTitle"></label>                                    <span data-bind="text: $root.data.exam.totalScore"></span>                                    <span data-bind="html: $root.i18n.scoreTitle"></span>                                </div>                                <div class="list">                                    <label data-bind="html: $root.i18n.bestScoreTitle"></label>                                    <span data-bind="text: $root.data.exam.bestScore"></span>                                    <span data-bind="html: $root.i18n.scoreTitle"></span>                                </div>                            </div>                            <div class="statistics">                                <div class="list">                                    <label data-bind="html: $root.i18n.passScoreTitle"></label>                                    <span data-bind="text: $root.data.exam.passingScore"></span>                                    <span data-bind="html: $root.i18n.scoreTitle"></span>                                </div>                                <div class="list">                                    <label data-bind="html: $root.i18n.tryTimesTitle"></label>                                    <span data-bind="text: $root.data.exam.chance"></span>                                </div>                            </div>                        </div>                        <div class="clearfix" style="text-align: center;">                            <div class="hr"></div>                            <div>                                <table class="table table-bordered table-striped list-table">                                    <thead>                                        <tr>                                            <th style="width: 20%" data-bind="text: $root.i18n.involvementTimeTitle"></th>                                            <th style="width: 20%" data-bind="text: $root.i18n.timeConsumingTitle"></th>                                            <!--ko if: $root.data.exam.subType()!=1-->                                                <th style="width: 20%" data-bind="text: $root.i18n.tableScoreHeaderTitle"></th>                                                <th style="width: 20%" data-bind="text: $root.i18n.isPassTitle"></th>                                            <!--/ko-->                                            <!--ko if: $root.data.exam.subType()==1-->                                                <th style="width: 20%" data-bind="text: $root.i18n.viewResult"></th>                                            <!--/ko-->                                            <th style="width: 20%" data-bind="text: $root.data.exam.subType() != 2 && $root.data.exam.analysisAllowed() ? $root.i18n.viewAnalysisAndResult : $root.i18n.viewResult"></th>                                        </tr>                                    </thead>                                    <tbody class="table-format" data-bind="foreach: $root.data.items, visible: $root.data.items().length">                                        <tr>                                            <td data-bind="text: $root.getUserStartTime(userData.startTime)"></td>                                            <td data-bind="text: $root.getUserInvolvementTime(userData.costTimes())"></td>                                            <!--ko if: $root.data.exam.subType()!=1-->                                                <td data-bind="text: userData.score"></td>                                                <td data-bind="text: $root.getUserHasPassed(userData.score)"></td>                                            <!--/ko-->                                            <!--ko if: $root.data.exam.subType()==1-->                                                <td data-bind="text: userData.resultCode"></td>                                            <!--/ko-->                                            <td>                                                <a target="_blank" href="javascript:void(0);" data-bind="visible: $root.data.exam.subType() != 2 && $root.data.exam.analysisAllowed(), attr: { href: $root.getAnalysisUrl(examId, sessionId) }, text: $root.i18n.viewAnalysisTitle"></a>                                                <!-- ko if: $root.data.exam.analysisAllowed() -->                                                &nbsp;&nbsp;                                                <!-- /ko -->                                                <a target="_blank" href="javascript:void(0);" data-bind="attr: { href: $root.getEndUrl(examId, sessionId) }, text: $root.i18n.viewResult"></a>                                            </td>                                        </tr>                                    </tbody>                                    <tbody class="table-format" data-bind="visible: $root.data.items().length <= 0">                                        <tr>                                            <td style="text-align: center; padding: 50px 0;" colspan="5" data-bind="text: $root.i18n.noData"></td>                                        </tr>                                    </tbody>                                </table>                            </div>                            <button class="btn" data-bind="text: $root.i18n.back, click: function(){window.history.back(-1)}""></button>                        </div>                    </div>                </div>            </div>        ';
        $.widget('studying.history', {
            options: {
                analysisUrl: '',
                data: {
                    exam: null,
                    items: []
                },
                i18n: {
                    historyScorePage: '历史成绩',
                    involvementTimeTitle: '考试时间',
                    totalScoreTitle: '总分',
                    passScoreTitle: '及格分',
                    tryTimesTitle: '考试次数',
                    bestScoreTitle: '最高分',
                    questionNumTitle: '题量',
                    timeConsumingTitle: '考试用时',
                    durationTitle: '考试时长',
                    viewAnalysisTitle: '查看解析',
                    viewResult: '查看结果',
                    isPassTitle: '是否通过',
                    questionTitle: '题',
                    passedTitle: '已通过',
                    noPassTitle: '未通过',
                    tableScoreHeaderTitle: '分数',
                    scoreTitle: '分',
                    hoursTitle: '小时',
                    minutesTitle: '分钟',
                    secondsTitle: '秒',
                    noData: '暂无数据',
                    back: '返回'
                }
            },
            _init: function () {
                document.title = this.options.i18n.historyScorePage + ' - ' + this.options.data.exam.title;
                this.element.html(tmpl);
                $('.test-enter').siblings().hide();
                var op = this.options;
                this._vm = ko.mapping.fromJS(op);
                this.initVM();
                ko.applyBindings(this._vm, $('.test-enter')[0]);
            },
            initVM: function () {
                this._vm.getDuration = ko.computed($.proxy(function () {
                    return this.formatTime(ko.unwrap(this._vm.data.exam.duration));
                }, this));
                this._vm.getUserInvolvementTime = $.proxy(function (costTime) {
                    return this.formatTime(costTime);
                }, this);
                this._vm.getUserHasPassed = $.proxy(function (userScore) {
                    return ko.unwrap(userScore) >= this._vm.data.exam.passingScore() ? ko.unwrap(this._vm.i18n.passedTitle) : ko.unwrap(this._vm.i18n.noPassTitle);
                }, this);
                this._vm.getUserStartTime = $.proxy(function (startTime) {
                    var time = ko.unwrap(startTime);
                    return startTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(time), 'yyyy/MM/dd HH:mm:ss') : null;
                }, this);
                this._vm.getAnalysisUrl = $.proxy(function (examId, sessionId) {
                    var analysisUrl = ko.unwrap(this._vm.host);
                    if (!analysisUrl)
                        analysisUrl = 'http://' + window.location.host + '/exam/analysis';
                    return analysisUrl + '?exam_id=' + ko.unwrap(examId) + '&session_id=' + ko.unwrap(sessionId) + '&location_source=' + ko.unwrap(locationSource);
                }, this);
                this._vm.getEndUrl = $.proxy(function (examId, sessionId) {
                    return this._vm.data.exam.examResultPageUrl() + '?exam_id=' + ko.unwrap(examId) + '&session_id=' + ko.unwrap(sessionId) + '&location_source=' + ko.unwrap(locationSource);
                }, this);
                this._vm.getResultUrl = $.proxy(function (resultUrl, resultText, examId, sessionId) {
                    var resultHost = ko.unwrap(this._vm.data.exam.examResultPageUrl);
                    var resultUrl = ko.unwrap(resultUrl), resultText = ko.unwrap(resultText), examId = ko.unwrap(examId), sessionId = ko.unwrap(sessionId);
                    if (resultUrl) {
                        return resultUrl + resultText;
                    } else {
                        return resultHost + '?exam_id=' + examId + '&session_id=' + sessionId + '&location_source=' + ko.unwrap(locationSource);
                    }
                }, this);
            },
            formatTime: function (time) {
                if (time > -1) {
                    var result = '', h = parseInt(time / 3600), m = parseInt(time % 3600 / 60), s = parseInt(time % 60);
                    if (h > 0)
                        return h + ko.unwrap(this._vm.i18n.hoursTitle) + m + ko.unwrap(this._vm.i18n.minutesTitle) + s + ko.unwrap(this._vm.i18n.secondsTitle);
                    if (m > 0)
                        return m + ko.unwrap(this._vm.i18n.minutesTitle) + s + ko.unwrap(this._vm.i18n.secondsTitle);
                    return s + ko.unwrap(this._vm.i18n.secondsTitle);
                } else {
                    return '0' + ko.unwrap(this._vm.i18n.secondsTitle);
                }
            }
        });
    }(jQuery));
});
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define('studying.exam.store', [
    'require',
    'exports',
    'studying.store',
    'util',
    'studying.enum'
], function (require, exports, __store, __hash, __enum) {
    var Studying;
    (function (Studying) {
        var ExamStore = function (_super) {
            __extends(ExamStore, _super);
            function ExamStore(data) {
                _super.call(this, data);
                this.updateLeavetime();
                this.data.BatchesCache = {};
                this.data.CachedQuestionIds = [];
                this.data.currentBatchIndex = -1;
                this.viewModel.Questions = new __hash.Common.Hash();
            }
            ExamStore.prototype.updateLeavetime = function () {
                this.data.leavetime = this.data.Exam.LimitSeconds ? this.data.UserExam.BeginTime == 0 ? this.data.Exam.EndTime : this.data.UserExam.BeginTime + this.data.Exam.LimitSeconds > this.data.Exam.EndTime ? this.data.Exam.EndTime : this.data.UserExam.BeginTime + this.data.Exam.LimitSeconds : null;
            };
            ExamStore.prototype._submit = function (cells) {
                var _this = this;
                var that = this;
                var results = Enumerable.from(cells).select(function (c) {
                    return {
                        Id: c.Id,
                        Result: {
                            Answers: c.Result['Answers'],
                            CostSeconds: c.Result['CostSeconds']
                        }
                    };
                }).toArray();
                var answerBody = Enumerable.from(results).select(function (c) {
                    var answerResult = {};
                    answerResult.id = c.Id;
                    answerResult.qv = 0;
                    answerResult.cs = c.Result.CostSeconds;
                    answerResult.answer = '';
                    answerResult.qti_answer = c.Result.Answers;
                    return answerResult;
                }).toArray();
                var def = this._sendRequest({
                    type: 'PUT',
                    dataType: 'json',
                    requestCase: 'snake',
                    responseCase: 'camel',
                    enableToggleCase: false,
                    contentType: 'application/json; charset=utf-8',
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.AnswersUrl ? this.data.ApiRequestUrls.AnswersUrl : this.data.Host + '/v2/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/answers',
                    data: JSON.stringify(answerBody)
                });
                var returnDef = def;
                if (this.data.SubjectiveMarkStrategy) {
                    var body = this._mark(cells), mdef = $.Deferred();
                    returnDef = mdef;
                    def.done(function () {
                        if (body && body.length > 0) {
                            _this._sendRequest({
                                type: 'PUT',
                                dataType: 'json',
                                requestCase: 'snake',
                                responseCase: 'camel',
                                enableToggleCase: false,
                                contentType: 'application/json; charset=utf-8',
                                url: _this.data.ApiRequestUrls && _this.data.ApiRequestUrls.MarkUrl ? _this.data.ApiRequestUrls.MarkUrl : _this.data.Host + '/v1/exams/' + _this.data.ExamId + '/mark',
                                data: JSON.stringify(body)
                            }).done(function () {
                                mdef.resolve();
                            });
                        } else {
                            mdef.resolve();
                        }
                    });
                }
                return returnDef;
            };
            ExamStore.prototype._mark = function (cells) {
                var _this = this;
                var results = Enumerable.from(cells).where(function (item) {
                    if (item.Question.res_type == '$RE0209') {
                        return true;
                    } else if (item.Question.res_type == '$RE0208') {
                        var textEntryList = Enumerable.from(item.Question.items).where('$.type==\'textentry\'').toArray();
                        if (!textEntryList || textEntryList.length <= 0)
                            return false;
                        return true;
                    }
                }).select(function (c) {
                    return {
                        Id: c.Id,
                        Question: c.Question,
                        Result: {
                            Answers: c.Result['Answers'],
                            CostSeconds: c.Result['CostSeconds']
                        }
                    };
                }).toArray();
                var body = Enumerable.from(results).select(function (cell) {
                    var result = {
                        'session_id': _this.data.SessionId,
                        'question_id': cell.Id,
                        'question_version': 0,
                        'question_answer_status': 0,
                        'score': 0,
                        'marking_remark': '前台自动批改',
                        'marking_user_id': _this.data.UserId,
                        'subs': []
                    };
                    Enumerable.from(cell.Result.Answers).forEach(function (answer, index) {
                        if (cell.Question.res_type == '$RE0208') {
                            result.subs.push({
                                'question_answer_status': _this._getAnswerState(answer.value.state),
                                'score': _this._getAnswerScore(cell.Id, answer.state, index)
                            });
                        } else {
                            result['question_answer_status'] = _this._getAnswerState(answer.value.state);
                            result['score'] = _this._getAnswerScore(cell.Id, answer.state, index);
                            result.subs.push({
                                'question_answer_status': _this._getAnswerState(answer.value.state),
                                'score': _this._getAnswerScore(cell.Id, answer.state, index)
                            });
                        }
                    });
                    result['score'] = Enumerable.from(result.subs).select('$.score').sum();
                    var undoes = Enumerable.from(result.subs).where('$.question_answer_status == 0').toArray();
                    var failList = Enumerable.from(result.subs).where('$.question_answer_status == 7').toArray();
                    var correctList = Enumerable.from(result.subs).where('$.question_answer_status == 5').toArray();
                    if (cell.Question.res_type == '$RE0208') {
                        if (undoes.length == result.subs.length) {
                            result['question_answer_status'] = 0;
                        }
                        if (failList.length == result.subs.length) {
                            result['question_answer_status'] = 7;
                        }
                        if (correctList.length == result.subs.length) {
                            result['question_answer_status'] = 5;
                        }
                        if (correctList.length > 0) {
                            result['question_answer_status'] = 9;
                        }
                    }
                    return result;
                }).toArray();
                return body;
            };
            ExamStore.prototype._getAnswerScore = function (id, state, index) {
                if (state == 'FAILED' || state == 'INCOMPLETE')
                    return 0;
                var scores = Enumerable.from(this.data.QuestionScoreDict).where('$.id==\'' + id + '\'').toArray();
                if (scores && scores.length > 0) {
                    return scores[0].scores[index].score;
                }
                return 0;
            };
            ExamStore.prototype._getAnswerState = function (state) {
                switch (state) {
                case 'FAILED':
                    return 7;
                case 'PASSED':
                    return 5;
                case 'INCOMPLETE':
                    return 0;
                }
            };
            ExamStore.prototype._buildCellBatch = function (cell) {
                var cells = [], currentBatchIndex = this.getBatchIndex(cell.Id);
                for (var i = 0, len = this.data.Batches[currentBatchIndex].length; i < len; i++) {
                    var item = this.loader.get(this.data.Batches[currentBatchIndex][i]);
                    if (item)
                        cells.push(item);
                }
                return cells;
            };
            ExamStore.prototype.prepare = function (customData) {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.PrepareUrl ? this.data.ApiRequestUrls.PrepareUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/prepare',
                    type: 'POST',
                    data: JSON.stringify({ custom_data: customData ? customData : null }),
                    contentType: 'application/json;',
                    dataType: 'json'
                }).done(function (data) {
                    _this._initData(data, 1).done(function () {
                        if (_this.data.EventCallbacks && _this.data.EventCallbacks.onPrepared && $.isFunction(_this.data.EventCallbacks.onPrepared))
                            _this.data.EventCallbacks.onPrepared.call(_this, data);
                    });
                });
            };
            ExamStore.prototype.start = function () {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.StartUrl ? this.data.ApiRequestUrls.StartUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/start',
                    type: 'POST'
                }).done(function (data) {
                    _this._updateExamInfo(data);
                    _this.doMerageAnswer(true);
                    if (_this.data.EventCallbacks && _this.data.EventCallbacks.onStarted && $.isFunction(_this.data.EventCallbacks.onStarted))
                        _this.data.EventCallbacks.onStarted.call(_this, data);
                });
            };
            ExamStore.prototype.end = function () {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.SubmitUrl ? this.data.ApiRequestUrls.SubmitUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/submit',
                    type: 'POST',
                    contentType: 'application/json;'
                }).done(function (data) {
                    if (_this.data.EventCallbacks && _this.data.EventCallbacks.onSubmited && $.isFunction(_this.data.EventCallbacks.onSubmited))
                        _this.data.EventCallbacks.onSubmited.call(_this, data);
                });
            };
            ExamStore.prototype.continueAnswer = function () {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.SessionDataUrl ? this.data.ApiRequestUrls.SessionDataUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId,
                    type: 'GET'
                }).done(function (data) {
                    _this._initData(data, 2).done(function () {
                        _this.doMerageAnswer(true);
                    });
                });
            };
            ExamStore.prototype.viewAnalysis = function () {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.SessionDataUrl ? this.data.ApiRequestUrls.SessionDataUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId,
                    type: 'GET'
                }).done(function (data) {
                    _this._initData(data, 3).done(function () {
                        _this.doMerageAnswer(false);
                    });
                });
            };
            ExamStore.prototype.doMerageAnswer = function (mergeLocal) {
                var _this = this;
                if (mergeLocal) {
                    $.when(this._getQuestionsBody(), this._mergeLocalAnswer()).done(function () {
                        _this._removeUnknownOrNotSupportQuestion();
                        _this._initQuestionCells();
                        _this.setInited();
                    });
                } else {
                    $.when(this._getQuestionsBody()).done(function () {
                        _this._removeUnknownOrNotSupportQuestion();
                        _this._initQuestionCells();
                        _this.setInited();
                    });
                }
            };
            ExamStore.prototype._insert = function (value, ofset, subStr) {
                if (ofset < 0 || ofset >= value.length - 1)
                    return this.append(subStr);
                return value.substring(0, ofset + 1) + subStr + value.substring(ofset + 1);
            };
            ExamStore.prototype._initData = function (data, type) {
                var _this = this;
                var that = this;
                var parts = Enumerable.from(data.userData.ndrPaper.item.testParts[0].assessmentSections).toArray();
                var questionIds = [];
                var defs = [], def = $.Deferred();
                this.data.PartTitles = Enumerable.from(parts).select('$.title').toArray();
                this.data.SessionId = data.sessionId;
                this.data.Cells = [];
                this.data.Batches = [];
                this.data.Paper.Title = data.userData.ndrPaper.title;
                this.data.Paper.Score = data.userData.ndrPaper.totalScore;
                Enumerable.from(parts).forEach(function (value, index) {
                    var questionIdArray = [];
                    Enumerable.from(value.sectionParts).forEach(function (s, i) {
                        that.data.Cells.push({
                            Id: s.identifier,
                            Result: null
                        });
                        questionIdArray.push(s.identifier);
                        if (s.type == 'assessment_courseware_object') {
                            _this.interactiveQuestions.set(s.identifier, 'assessment_courseware_object');
                        }
                    });
                    that.data.Batches.push(questionIdArray);
                    questionIds = questionIds.concat(questionIdArray);
                });
                if (type == 3) {
                    if (!that.data.UserExam.AnswersData || that.data.UserExam.AnswersData.length <= 0) {
                        defs.push(this._getUserQuestionAnswers(questionIds, function (answerData) {
                            if (answerData && answerData.length > 0)
                                that.data.UserExam.AnswersData = that.data.UserExam.AnswersData.concat(answerData);
                        }));
                    }
                    if (!this.data.UserExam.AnalysisData || this.data.UserExam.AnalysisData.length <= 0) {
                        defs.push(this._getQuestionAnalysis(questionIds, function (analysisData) {
                            if (analysisData && analysisData.length > 0)
                                that.data.UserExam.AnalysisData = that.data.UserExam.AnalysisData.concat(analysisData);
                        }));
                    }
                }
                defs.push(this._getUploadInfo(function (data) {
                    that.data.Attachement['Session'] = data.session;
                    that.data.Attachement['Url'] = data.url;
                    that.data.Attachement['Path'] = data.path;
                    that.data.Attachement['DownloadUrlFormat'] = data.serverUrl + '/download';
                }));
                this.data.UserExam.DoneCount = data.userData.answeredCount;
                if (data.userData.startTime && data.userData.finishTime) {
                    this._updateExamInfo(data);
                }
                $.when.apply({}, defs).done(function () {
                    def.resolve();
                });
                return def;
            };
            ExamStore.prototype._updateExamInfo = function (data) {
                var beginTime = new Date(this._insert(data.userData.startTime, data.userData.startTime.indexOf('+') + 2, ':')).getTime();
                var finishedTime = data.userData.finishTime ? new Date(this._insert(data.userData.finishTime, data.userData.finishTime.indexOf('+') + 2, ':')).getTime() : 0;
                this.data.UserExam.BeginTime = beginTime;
                this.data.UserExam.CostSeconds = finishedTime > 0 ? (finishedTime - beginTime) / 1000 : 0;
                this.updateLeavetime();
            };
            ExamStore.prototype._getUploadInfo = function (success) {
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.UploadUrl ? this.data.ApiRequestUrls.UploadUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/upload',
                    type: 'GET',
                    async: false,
                    success: success
                });
            };
            ExamStore.prototype._getPaperInfo = function (paperId) {
                return this._sendRequest({ url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.PapersUrl ? this.data.ApiRequestUrls.PapersUrl : this.data.Host + '/v1/exams/' + this.data.ExamId + '/papers' });
            };
            ExamStore.prototype._getUserQuestionAnswers = function (qids, success) {
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.AnswersUrl ? this.data.ApiRequestUrls.AnswersUrl : this.data.Host + '/v2/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/answers',
                    type: 'POST',
                    data: JSON.stringify(qids),
                    contentType: 'application/json;',
                    async: false,
                    traditional: true,
                    enableToggleCase: false,
                    success: success
                });
            };
            ExamStore.prototype._getQuestionAnalysis = function (qids, success) {
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.AnalysisUrl ? this.data.ApiRequestUrls.AnalysisUrl : this.data.Host + '/v2/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/analysis?resource_type=assessment_courseware_object',
                    type: 'POST',
                    data: JSON.stringify(qids),
                    contentType: 'application/json;',
                    async: false,
                    traditional: true,
                    success: success
                });
            };
            ExamStore.prototype._getQuestionsBody = function () {
                return _super.prototype.getQuestionsBody.call(this);
            };
            ExamStore.prototype.checkInteractiveQuestionState = function () {
                return this._getUserQuestionAnswers(this.data.InteractiveQuestions);
            };
            ExamStore.prototype._removeUnknownOrNotSupportQuestion = function () {
                for (var i = this.data.Batches.length - 1; i >= 0; i--) {
                    var v = this.data.Batches[i];
                    for (var j = v.length - 1; j >= 0; j--) {
                        var icell = null, ci = -1;
                        Enumerable.from(this.data.Cells).forEach(function (ce, index) {
                            if (ce.Question.identifier == v[j]) {
                                icell = ce;
                                ci = index;
                            }
                        });
                        var notSupported = icell ? !this._isSupportQuestionType(icell.Question) : false;
                        var isInteractiveQuestion = icell ? this._isInteractiveQuestion(icell.Question) : false;
                        if (!icell) {
                            v.splice(j, 1);
                            v.length <= 0 && this.data.Batches.splice(i, 1);
                        }
                        if (notSupported) {
                            ci >= 0 && this.data.Cells.splice(ci, 1);
                            v.splice(j, 1);
                            v.length <= 0 && this.data.Batches.splice(i, 1);
                        }
                        if (isInteractiveQuestion) {
                            this.data.InteractiveQuestions.push(icell.Id);
                        }
                    }
                }
            };
            ExamStore.prototype._isSupportQuestionType = function (question) {
                return true;
            };
            ExamStore.prototype._isInteractiveQuestion = function (question) {
                return question.items ? false : true;
            };
            ExamStore.prototype._diff = function (a, b) {
                return a.filter(function (i) {
                    return b.indexOf(i) < 0;
                });
            };
            ExamStore.prototype._initQuestionCells = function () {
                var _this = this;
                var cells = Enumerable.from(this.data.Cells).select(function (c) {
                    var answer = Enumerable.from(_this.data.UserExam.AnswersData).where('$.id == \'' + c.Id + '\'').toArray()[0];
                    var analysis = Enumerable.from(_this.data.UserExam.AnalysisData).where('$.id ==\'' + c.Id + '\'').toArray()[0];
                    if (Boolean(answer)) {
                        var answers = [], attachements = answer.answer ? JSON.parse(answer.answer) : null;
                        c.Result = {
                            'CostSeconds': answer.cs,
                            'Answers': answer.qti_answer,
                            'Result': analysis && analysis.questionAnswerStatus === 5 ? 1 : analysis && analysis.questionAnswerStatus === 7 ? 2 : answer.qti_answer ? 7 : 0
                        };
                    }
                    c.state = _this._getState(c);
                    c.submit = c.Result != null;
                    return c;
                }).toArray();
                this.data.Items = cells;
                this.loader.mergeCells(cells);
            };
            ExamStore.prototype._mergeLocalAnswer = function () {
                var def = $.Deferred(), that = this;
                var tempCookie = store.get(__enum.Studying.ConstValue.LocalAnswerKey + this.data.SessionId);
                var savedAnswer = this.data.UserExam.AnswersData;
                if (tempCookie && tempCookie != 'undefined' && tempCookie != 'null') {
                    var localAnswers = JSON.parse(tempCookie);
                    $.fn.udialog.alert(this.data.i18n.common.store.mergeAnswerTitle, {
                        width: '420',
                        icon: '',
                        buttons: [
                            {
                                text: this.data.i18n.common.store.mergeBtn,
                                click: function () {
                                    Enumerable.from(localAnswers.data).forEach(function (value, index) {
                                        var id = value.Id;
                                        var crt = Enumerable.from(savedAnswer).firstOrDefault(null, '$.id==\'' + id + '\'');
                                        if (crt) {
                                            crt.answer = '';
                                            crt.qti_answer = value.Result.Answers;
                                            crt.qv = 0;
                                            crt.cs = value.Result.CostSeconds;
                                        } else {
                                            that.data.UserExam.AnswersData.push({
                                                'id': id,
                                                'answer': '',
                                                'qti_answer': value.Result.Answers,
                                                'qv': 0,
                                                'cs': value.Result.CostSeconds
                                            });
                                        }
                                        if (value.Result && value.Result.Answers)
                                            that.updater.set(value);
                                    });
                                    $(this)['udialog']('hide');
                                    def.resolve();
                                },
                                'class': 'default-btn'
                            },
                            {
                                text: this.data.i18n.common.store.ignoreBtn,
                                click: function () {
                                    $(this)['udialog']('hide');
                                    def.resolve();
                                }
                            }
                        ],
                        disabledClose: true
                    });
                } else {
                    def.resolve();
                }
                return def.promise();
            };
            ExamStore.prototype.getBatchStartIndex = function (index) {
                var bsi = 0;
                var batches = this.data.Batches;
                for (var i = 0; i < index; i++)
                    bsi += batches[i].length;
                return bsi;
            };
            ExamStore.prototype._checkSubmit = function (cells) {
                return cells.length >= 5;
            };
            return ExamStore;
        }(__store.Studying.Store);
        Studying.ExamStore = ExamStore;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define('studying.exam.answer', [
    'require',
    'exports',
    'studying.exam.store',
    'studying.answer',
    'studying.enum',
    'timer'
], function (require, exports, __store, __answer, __enum, _timer) {
    var Studying;
    (function (Studying) {
        var ExamAnswer = function (_super) {
            __extends(ExamAnswer, _super);
            function ExamAnswer(data) {
                _super.call(this);
                this.isCommit = false;
                this._elementSelector = '#exam';
                this.timer = null;
                this.nosureCookiePrefix = '_nosure_';
                this.locationOfScroll = false;
                this._tmpl = '         <div class="ln-header-wrapper"></div>         <div class="wt-container">            <div class="ln-main wt-cons clearfix">                <div class="wt-main border-right"></div>                <div class="wt-side">                    <div class="wt-sheet">                        <div class="wt-sheet-hd clearfix">                            <ul>                                <li class="active"><a href="javascript:void(0);" id="navigator">答题卡</a></li>                                <li class="wt-sheet-collapse"><a href="javascript:void(0);" id="pullup">收起</a></li>                            </ul>                        </div>                        <div class="navigator"></div>                        <div class="navigatorStat"></div>                    </div>                </div>                <div class="wt-side-expand hide"><a href="javascript:void(0);" id="expand">展开答题卡<</a></div>            </div>            <div class="w-test-alert1" style="display: none;"></div>        </div>        ';
                this._i18n = {
                    common: {
                        navigation: '答题卡',
                        pullUp: '收起',
                        expand: '展开答题卡',
                        judge: {
                            right: '对',
                            error: '错'
                        },
                        subjective: {
                            attachement: '附件\uFF1A',
                            uploadTitle: '(附件允许上传图片文件\uFF0C最大不超过10M)',
                            uploadingText: '上传中\uFF1A',
                            downloadAttachement: '点击下载',
                            selectFileText: '请选择文件...',
                            fileLimitSize: '选择的文件过大',
                            sureBtn: '确定'
                        },
                        explain: { title: '考试说明' },
                        navigatorStat: {
                            title: '本次成绩',
                            accuracy: '正确率',
                            right: '答对',
                            question: '题',
                            error: '答错',
                            noAnswer: '未做'
                        },
                        option: { answerTitle: '此选项为参考答案' },
                        question: {
                            temporarilyUncertain: '标记题目',
                            cancelTemporarilyUncertain: '取消标记题目',
                            rightAnswerLabel: '正确答案',
                            answerRightTitle: '您答对了',
                            subjectiveUserAnswer: '主观题用户答案',
                            questionExplanation: '题目详解',
                            questionsExplanation: '套题详解',
                            notScore: '\t不计分',
                            score: '分',
                            analysisTitle: '<暂无>',
                            notAnswer: '您未作答',
                            subQuestionUserTitle: '您错答为'
                        }
                    },
                    exam: {
                        answer: {
                            sure: '确定',
                            retry: '重试',
                            explanation: '试卷说明',
                            msg1: '已完成全部题目\uFF0C确定交卷吗\uFF1F',
                            msg2: '已完成 {{doneCount}} 题\uFF0C还有 {{noAnswerCount}} 题未做\uFF0C确定交卷吗\uFF1F',
                            msg3: '已完成 {{doneCount}} 题\uFF0C还有 {{noAnswerCount}} 题未做\uFF0C不能交卷\uFF01',
                            commitExam: '交卷',
                            commitFail: '交卷失败',
                            continueAnswer: '继续答题',
                            examFinishTitle: '本次考试时间已到, 不能继续答题',
                            examAutoCommitTitle: '本次考试已自动交卷\uFF0C不能继续作答',
                            confirmCaption: '系统提示'
                        },
                        header: {
                            residualTime: '剩余用时',
                            costTime: '考试用时',
                            saveTitle: '保存答案',
                            save: '保存'
                        },
                        parts: { buttonTitle: '点击可切换' },
                        prepare: {
                            back: '< 返回',
                            question: '题',
                            totalScore: '总分',
                            pass: '及格',
                            minute: '分钟',
                            caution: '注意',
                            timeHint: '距离考试结束',
                            cautionItem1: '1\u3001开始考试后不可暂停\uFF0C时间到后自动交卷\uFF0C请注意时间安排\u3002',
                            cautionItem2: '2\u3001答题结束\uFF0C点击\u201C交卷\u201D完成当前考试\u3002',
                            examFinishTitle: '考试已结束',
                            examEndTitle: '距离考试结束还有\uFF1A',
                            examStartTitle: '距离开考还有\uFF1A',
                            examStartedTitle: '考试已开始\uFF1A',
                            examFinished: '本次考试时间已到, 不能继续答题',
                            commit: '交卷',
                            hours: '小时',
                            minutes: '分',
                            seconds: '秒'
                        }
                    }
                };
                this.store = new __store.Studying.ExamStore(data);
                this.store.initedHandler = $.proxy(this.onStoreInited, this);
                this.store.questionStateChangeHandler = $.proxy(this.onQuestionStateChange, this);
                this.store.sessionNeedSubmitHandler = $.proxy(this.onSessionNeedSubmit, this);
                this._elementSelector = data.ElementSelector;
                $(this._elementSelector).html(this._tmpl);
                $('.wt-sheet-collapse a').click($.proxy(this._onCollapseSide, this));
                $(window).resize($.proxy(this._onResize, this));
                $('.wt-side-expand').click($.proxy(this._onExpandSide, this));
            }
            ExamAnswer.prototype.init = function (data) {
                if (data.i18n && data.i18n)
                    this._i18n = data.i18n;
                this.timer = _timer.Common.TimerFactory.Singleton();
                this.initUi();
            };
            ExamAnswer.prototype.initUi = function () {
                $('#navigator').text(this._i18n.common.navigation);
                $('#pullup').text(this._i18n.common.pullUp);
                $('#expand').text(this._i18n.common.expand);
                if (this.store.data.controlOptions && this.store.data.controlOptions.hideNavigator) {
                    $('.wt-side').addClass('hide');
                    var wtMainWidth = $('.ln-main').outerWidth() - $('.wt-side-expand').outerWidth() - 50;
                    $('.wt-main').removeClass('border-right').width(wtMainWidth);
                }
            };
            ExamAnswer.prototype.onQuestionStateChange = function (qid, state) {
                $('.navigator').navigator('stateChange', qid, state);
            };
            ExamAnswer.prototype.onSessionNeedSubmit = function () {
                this.dofinish(true, true, this._i18n.exam.answer.examAutoCommitTitle);
            };
            ExamAnswer.prototype.onStoreInited = function () {
                if (!this.timer.isReady()) {
                    this.timer.ready().done($.proxy(this.regiest, this));
                    return;
                }
                $(this._elementSelector).show();
                this.regiest();
            };
            ExamAnswer.prototype.regiest = function () {
                if (this.store.data.ViewMode < 2) {
                    this.timer.appendRepeateHandler('autosave', $.proxy(this._onSubmit, this), Number.MAX_VALUE, 60000);
                    this.timer.appendRepeateHandler('autocheck', $.proxy(this._onCheckInteractiveQuestionState, this), Number.MAX_VALUE, 60000);
                    if (this.store.data.leavetime) {
                        this.timer.appendRepeateHandler('tick', $.proxy(this._onTimerElapsed, this), Number.MAX_VALUE, 400);
                        if (this.store.data.leavetime > this.store.data.Exam.EndTime && this.store.data.UserExam.IsDekaron) {
                            var et = this.store.data.Exam.EndAnswerTime;
                            var et2 = this.timer.time() + this.store.data.Exam.LimitSeconds;
                            this.store.data.leavetime = et2 > et ? et : et2;
                        }
                        this.timer.appendHandler('finish', Math.min(259200000 + parseInt(this.timer.time()), this.store.data.leavetime), $.proxy(this._timeover, this));
                    }
                    if (this.store.getDoneCount() <= 0)
                        this._clearNosureCookie();
                    for (var i = 0, len = this.store.data.Cells && this.store.data.Cells.length; i < len; i++) {
                        var nosure = this._nosureCookie(this.store.data.Cells[i].Id);
                        this.store.data.Items[i].nosure = nosure;
                    }
                }
                this.registerWidge();
                if (!this.store.data.leavetime) {
                    $(this._elementSelector + ' .ln-header-wrapper').header('hideCountDown');
                }
            };
            ExamAnswer.prototype.registerWidge = function () {
                var _this = this;
                var parts = '';
                for (var i = 0, len = this.store.data.PartTitles && this.store.data.PartTitles.length > 0 ? this.store.data.PartTitles.length : 1; i < len; i++) {
                    parts += '<div class=\'wt-item-list\' index=\'' + i + '\'></div>';
                }
                $('.wt-main').html(parts);
                $(this._elementSelector + ' .ln-header-wrapper').header({
                    currentIndex: 0,
                    title: this.store.data.Exam.Name,
                    time: '',
                    viewMode: this.store.data.ViewMode,
                    showCostTime: this.store.data && this.store.data.controlOptions && this.store.data.controlOptions.showCostTime || false,
                    inited: function (evt, ui) {
                        _this.store.viewModel.header = ui.viewModel;
                    },
                    i18n: this._i18n.exam.header
                });
                $('.navigator').navigator({
                    sideElementSelector: '.wt-side',
                    num: 1,
                    items: this.store.data.Items,
                    batches: this.store.data.Batches,
                    partTitles: this.store.data.PartTitles,
                    isShowAnswerState: this.store.data.Exam.Mode != __enum.Studying.AnswerMode.View ? false : true,
                    isShowCurrentState: false,
                    disableJump: this.store.data.controlOptions && this.store.data.controlOptions.disableNavigatorJump ? this.store.data.controlOptions.disableNavigatorJump : false,
                    numChanged: $.proxy(this._numChanged, this),
                    inited: function (evt, ui) {
                        _this.store.viewModel.navigator = ui.viewModel;
                    },
                    i18n: this._i18n.common.navigator
                });
                $(this._elementSelector + ' .wt-top-nav').parts({
                    currentIndex: 0,
                    items: this.store.viewModel.navigator.items,
                    batches: this.store.viewModel.navigator.batches,
                    partTitles: this.store.viewModel.navigator.partTitles,
                    inited: function (evt, ui) {
                        _this.store.viewModel.parts = ui.viewModel;
                    },
                    tabselect: $.proxy(this._tabselect, this),
                    i18n: this._i18n.exam.parts
                });
                if (this.store.data.Paper.Summary.length > 0) {
                    $('.ln-btn-explain').show();
                    $('.w-test-alert1').explain({
                        title: this._i18n.exam.answer.explanation,
                        summary: this.store.data.Paper.Summary,
                        showed: function () {
                            $('body').data('overflow', $('body').css('overflow')).css('overflow', 'hidden');
                        },
                        hidded: function () {
                            $('body').css('overflow', $('body').data('overflow'));
                        },
                        ispaperMode: true,
                        i18n: this._i18n.common.explain
                    });
                } else {
                    $('.ln-btn-explain').hide();
                }
                var timeoutNum = 0;
                $(window).off('.learningPaper').on('scroll.learningPaper', function () {
                    if (!_this.locationOfScroll) {
                        _this.locationOfScroll = true;
                        return;
                    }
                    clearTimeout(timeoutNum);
                    timeoutNum = setTimeout(function () {
                        var scrollTop = $(window).scrollTop();
                        if ($(window).height() + scrollTop - $('.wt-main').height() > 100) {
                            var index = $('.wt-item-list').length - 1;
                            _this.store.viewModel.parts.currentIndex(index > 0 ? index : 0);
                        } else {
                            $('.wt-item-list').each(function (i, elem) {
                                var $elem = $(elem);
                                if (scrollTop - ($elem.height() + $elem.position().top) < 0) {
                                    _this.store.viewModel.parts.currentIndex(i);
                                    return false;
                                }
                            });
                        }
                    }, 100);
                });
            };
            ExamAnswer.prototype._onResize = function () {
                var left = $('.ln-main').width() + ($('.wt-container').width() - $('.ln-main').width()) / 2;
                $('.wt-side-expand a').css('left', left + 'px');
            };
            ExamAnswer.prototype._onCollapseSide = function () {
                var wtMainWidth = $('.ln-main').outerWidth() - $('.wt-side-expand').outerWidth() - 50;
                $('.wt-side').hide();
                $('.wt-main').removeClass('border-right').width(wtMainWidth);
                var left = $('.ln-main').width() + ($('.wt-container').width() - $('.ln-main').width()) / 2;
                $('.wt-side-expand a').css('left', left + 'px');
                $('.wt-side-expand').removeClass('hide').addClass('show');
            };
            ExamAnswer.prototype._onExpandSide = function () {
                $('.wt-side').show();
                $('.wt-main').addClass('border-right').removeAttr('style');
                $('.wt-side-expand').removeClass('show').addClass('hide');
            };
            ExamAnswer.prototype._onTimerElapsed = function () {
                var leavetime = new Date(this.store.data.leavetime).getTime();
                var showCostTime = this.store.data && this.store.data.controlOptions && this.store.data.controlOptions.showCostTime || false;
                if (showCostTime) {
                    var beginTime = this.store.data && this.store.data.UserExam && this.store.data.UserExam.BeginTime || 0;
                    $(this._elementSelector + ' .ln-header-wrapper').header('setTime', this._toTimeString(this.timer.time() - beginTime));
                } else {
                    $(this._elementSelector + ' .ln-header-wrapper').header('setTime', this._toTimeString(leavetime - this.timer.time()));
                }
            };
            ExamAnswer.prototype._tabselect = function (evt, ui) {
                if (typeof ui.firstqid == 'undefined' && typeof ui.batchIndex == 'undefined')
                    return;
                this.store.viewModel.navigator.num(this.store.getNumById(ui.firstqid));
                this.store.viewModel.navigator.num.valueHasMutated();
            };
            ExamAnswer.prototype._numChanged = function (evt, ui) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onNumberChanged) {
                    var analysisData = this.store.data.UserExam.AnalysisData;
                    var questionId = ui.item.Id();
                    var questionAnswerStatus = null;
                    if (analysisData.length) {
                        var itemArray = Enumerable.from(analysisData).where('$.id ==\'' + questionId + '\'').toArray();
                        if (itemArray.length) {
                            questionAnswerStatus = itemArray[0].questionAnswerStatus;
                        }
                    }
                    this.store.data.EventCallbacks.onNumberChanged(questionId, questionAnswerStatus);
                }
                if (typeof ui.item == 'undefined')
                    return;
                this.store.data.CurrentQuestionId = ui.item.Id();
                var batchIndex = this.store.getBatchIndex(this.store.data.CurrentQuestionId);
                this.store.viewModel.parts && this.store.viewModel.parts.currentIndex(batchIndex);
                this.jump(batchIndex, this.store.data.CurrentQuestionId);
            };
            ExamAnswer.prototype.jump = function (batchIndex, id) {
                this.store.data.currentBatchIndex = batchIndex;
                if (id && !this.store.data.BatchesCache[batchIndex])
                    this.renderAll().done($.proxy(this.gotoQuestion, this, batchIndex, id));
                else
                    this.gotoQuestion(batchIndex, id);
            };
            ExamAnswer.prototype.gotoQuestion = function (batchIndex, id) {
                this.locationOfScroll = false;
                $(window).scrollTop(0);
                var $q = $('#' + id);
                if ($q.length > 0)
                    $(window).scrollTop($q.position().top - 108);
            };
            ExamAnswer.prototype.renderAll = function () {
                var id = 0, req = [], batchLength = this.store.data.Batches.length;
                $.studying.loading.show();
                for (var batchIndex = 0; batchIndex < batchLength; batchIndex++) {
                    id = this.store.data.Batches[batchIndex][0];
                    this.store.data.BatchesCache[batchIndex] = true;
                    req.push(this.render(id));
                }
                return $.when.apply(this, req).done(function () {
                    $.studying.loading.hide();
                });
            };
            ExamAnswer.prototype.render = function (id) {
                var _this = this;
                return this.store.load(id).done(function () {
                    var store = _this.store, cell = null, cells = store.datas(), i = 0, batchIndex = store.getBatchIndex(id), batch = store.data.Batches[batchIndex], $q = null, bsi = store.getBatchStartIndex(batchIndex), $parts = $('.wt-item-list[index=' + batchIndex + ']');
                    for (; i < batch.length; i++) {
                        cell = cells.get(batch[i]);
                        var analysisData = Enumerable.from(store.data.UserExam.AnalysisData).where('$.id ==\'' + cell.Id + '\'').toArray()[0];
                        var showQuestionNum = store.getControlOption('showQuestionNum');
                        var showGotoLearn = _this.store.getControlOption('showGotoLearnButton');
                        var showQuizButton = _this.store.getControlOption('showQuizButton');
                        $q = $('<div class=\'ln-question\'></div>').attr('id', cell.Id);
                        $q.qtiquestion({
                            'host': store.data.Host,
                            'examId': store.data.ExamId,
                            'questionId': cell.Id,
                            'sessionId': store.data.SessionId,
                            'subType': store.data.Exam.SubType,
                            'uploadAllowed': store.data.Exam.UploadAllowed,
                            'num': bsi + i + 1,
                            'editable': store.data.ViewMode == 1 ? true : false,
                            'showAnswer': store.data.ViewMode == 1 ? false : true,
                            'showQuestionNum': showQuestionNum != undefined ? showQuestionNum : true,
                            'question': cell.Question,
                            'result': cell.Result,
                            'analysisData': analysisData,
                            'showQuestionBank': false,
                            'showGotoLearnButton': showGotoLearn,
                            'showQuizButton': showQuizButton,
                            'qtiPath': { 'refPath': store.data.QtiPath.RefPath },
                            'attachementSetting': {
                                'session': store.data.Attachement.Session,
                                'url': store.data.Attachement.Url,
                                'path': store.data.Attachement.Path,
                                'flashUrl': store.data.Attachement.FlashUrl,
                                'downloadUrlFormat': store.data.Attachement.DownloadUrlFormat
                            },
                            'changed': $.proxy(_this._answerChanged, _this),
                            'inited': function (evt, ui) {
                            },
                            'learnButtonClick': $.proxy(_this._learnButtonClick, _this, cell.Id),
                            'questionButtonClick': $.proxy(_this._questionButtonClick, _this, cell.Id),
                            'nosure': store.data.ViewMode == 1 ? _this._nosureCookie(cell.Id) : false,
                            'ispapermode': true,
                            'nosureHandle': $.proxy(_this._nosure, _this),
                            'i18n': $.extend({}, _this._i18n.common.question, {
                                'judge': _this._i18n.common.judge,
                                'questionOption': _this._i18n.common.questionOption,
                                'subjective': _this._i18n.common.subjective
                            })
                        });
                        $parts.append($q);
                        $q.qtiquestion('onDomReady');
                    }
                    $parts.find('input[class*=_qp-text-input]').width(124);
                });
            };
            ExamAnswer.prototype._nosure = function (evt, data) {
                try {
                    this._nosureCookie(data.viewModel.question.identifier(), data.nosure);
                } catch (err) {
                    window.console && console.log('error In \'_nosure\',可能是data.viewModel.question.id() 不存在');
                }
                $('.navigator').navigator('setNoSureState', data.viewModel.question.identifier(), data.nosure);
            };
            ExamAnswer.prototype._nosureCookie = function (questionId, isNosure) {
                if (arguments.length == 1)
                    return $.cookie(this.nosureCookiePrefix + questionId) == 'true';
                else
                    $.cookie(this.nosureCookiePrefix + questionId, isNosure ? true : false);
            };
            ExamAnswer.prototype._clearNosureCookie = function () {
                var _this = this;
                $(this.store.data.Items).each(function (i, item) {
                    $.cookie(_this.nosureCookiePrefix + item.Id, null, { expires: -1 });
                });
            };
            ExamAnswer.prototype._learnButtonClick = function (questionId) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onLearnButtonClick) {
                    this.store.data.EventCallbacks.onLearnButtonClick(questionId);
                }
            };
            ExamAnswer.prototype._questionButtonClick = function (questionId) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onQuestionButtonClick) {
                    this.store.data.EventCallbacks.onQuestionButtonClick(questionId);
                }
            };
            ExamAnswer.prototype._answerChanged = function (evt, ui) {
                if (this.isCommit)
                    return;
                var vm = ui.viewModel;
                if (typeof vm == 'undefined')
                    return;
                var cell = this.store.get(vm.question.identifier()), result = $.extend(true, { CostSeconds: 0 }, cell.Result, ko.mapping.toJS(vm.result));
                result.CostSeconds = 1;
                cell.Result = result;
                cell.Result.Answers = vm.result.Answers;
                cell.submit = false;
                var answerData = {
                    cell: cell,
                    time: this.timer.time(),
                    examId: this.store.data.ExamId,
                    sessionId: this.store.data.SessionId
                };
                this.store.queue(answerData, true);
                $('.navigator').navigator('setState', cell.Id, cell.Result['Result']);
            };
            ExamAnswer.prototype._onSubmit = function () {
                this.store.submit();
            };
            ExamAnswer.prototype._onCheckInteractiveQuestionState = function () {
                this.store.checkInteractiveQuestionState().done(function (data) {
                    Enumerable.from(data).forEach(function (item, index) {
                        var id = item.id, state = item.qti_answer ? 2 : 0;
                        $('.navigator').navigator('setState', id, state);
                    });
                });
            };
            ExamAnswer.prototype._finish = function () {
                var doneCount = this.store.getDoneCount(), totalCount = this.store.getTotalCount(), _this = this, msg = '';
                if (this.store.data.controlOptions && this.store.data.controlOptions.forceToAnswer) {
                    msg = this._i18n.exam.answer.msg3.replace('{{doneCount}}', doneCount.toString());
                    msg = msg.replace('{{noAnswerCount}}', (totalCount - doneCount).toString());
                    $.fn.udialog.alert(msg, {
                        width: '420',
                        icon: '',
                        title: this._i18n.exam.answer.confirmCaption,
                        buttons: [{
                                text: this._i18n.exam.answer.sure,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                },
                                'class': 'default-btn'
                            }],
                        disabledClose: true
                    });
                } else {
                    if (totalCount - doneCount == 0) {
                        msg = this._i18n.exam.answer.msg1;
                    } else {
                        msg = this._i18n.exam.answer.msg2.replace('{{doneCount}}', doneCount.toString());
                        msg = msg.replace('{{noAnswerCount}}', (totalCount - doneCount).toString());
                    }
                    $.fn.udialog.confirm2(msg, {
                        title: this._i18n.exam.answer.confirmCaption,
                        buttons: [
                            {
                                text: this._i18n.exam.answer.commitExam,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                    _this.dofinish(false, false);
                                }
                            },
                            {
                                text: this._i18n.exam.answer.continueAnswer,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                },
                                'class': 'default-btn'
                            }
                        ]
                    });
                }
            };
            ExamAnswer.prototype._timeover = function () {
                var store = this.store;
                this.timer.removeHandler('tick');
                this.dofinish(true, true);
            };
            ExamAnswer.prototype.dofinish = function (showdialog, retry, title) {
                var _this = this;
                var that = this;
                var store = this.store;
                var title = title ? title : this._i18n.exam.answer.examFinishTitle;
                $.studying.loading.show();
                store.commit().done(function () {
                    _this.isCommit = true;
                    store.end().done(function (data) {
                        if (data && data.userData && data.userData.subType == 1) {
                            var resultUrl;
                            var customerUrl = data && data.userData && data.userData.resultUrl;
                            var defaultUrl = store.data.Exam.ExamResultPageUrl + '?exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData + '&location_source=' + store.data.LocationSource;
                            if (store.data.Exam.ExamResultPageUrl.indexOf('?') >= 0) {
                                defaultUrl = store.data.Exam.ExamResultPageUrl + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                            }
                            if (customerUrl) {
                                resultUrl = customerUrl + data.userData.resultCode;
                            } else {
                                resultUrl = defaultUrl;
                            }
                            try {
                                if (showdialog) {
                                    $.fn.udialog.alert(title, {
                                        width: '420',
                                        icon: '',
                                        title: _this._i18n.exam.answer.confirmCaption,
                                        buttons: [{
                                                text: _this._i18n.exam.answer.sure,
                                                click: function () {
                                                    var t = $(this);
                                                    t['udialog']('hide');
                                                    location.replace(resultUrl);
                                                },
                                                'class': 'default-btn'
                                            }],
                                        disabledClose: true
                                    });
                                } else {
                                    location.replace(resultUrl);
                                }
                            } catch (e) {
                                alert('customer script error.');
                            }
                        } else {
                            if (showdialog) {
                                $.fn.udialog.alert(title, {
                                    width: '420',
                                    icon: '',
                                    title: _this._i18n.exam.answer.confirmCaption,
                                    buttons: [{
                                            text: _this._i18n.exam.answer.sure,
                                            click: function () {
                                                var t = $(this);
                                                t['udialog']('hide');
                                                var url = store.data.Exam.ExamResultPageUrl + '?ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData + '&location_source=' + store.data.LocationSource;
                                                if (store.data.Exam.ExamResultPageUrl.indexOf('?') >= 0) {
                                                    url = store.data.Exam.ExamResultPageUrl + '&ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData + '&location_source=' + store.data.LocationSource;
                                                }
                                                location.replace(url);
                                            },
                                            'class': 'default-btn'
                                        }],
                                    disabledClose: true
                                });
                            } else {
                                var url = store.data.Exam.ExamResultPageUrl + '?ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData + '&location_source=' + store.data.LocationSource;
                                if (store.data.Exam.ExamResultPageUrl.indexOf('?') >= 0) {
                                    url = store.data.Exam.ExamResultPageUrl + '&ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData + '&location_source=' + store.data.LocationSource;
                                }
                                location.replace(url);
                            }
                        }
                    }).fail(function () {
                    }).always(function () {
                        $.studying.loading.hide();
                    });
                }).fail(function (data) {
                    $.studying.message.show(_this._i18n.exam.answer.commitFail);
                    var responseData = data && data.responseText ? JSON.parse(data.responseText) : null;
                    if (retry && !responseData) {
                        $.fn.udialog.alert(title, {
                            width: '420',
                            icon: '',
                            title: _this._i18n.exam.answer.confirmCaption,
                            buttons: [{
                                    text: _this._i18n.exam.answer.retry,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                        that.dofinish(doNav, retry);
                                    },
                                    'class': 'default-btn'
                                }],
                            disabledClose: true
                        });
                    }
                    if (responseData && responseData.code == 500000) {
                        $.fn.udialog.alert(responseData.message, {
                            width: '420',
                            icon: '',
                            title: _this._i18n.exam.answer.confirmCaption,
                            buttons: [{
                                    text: _this._i18n.exam.answer.sure,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                        var url = store.data.Exam.ExamResultPageUrl + '?ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData + '&location_source=' + store.data.LocationSource;
                                        if (store.data.Exam.ExamResultPageUr.indexOf('?') >= 0) {
                                            url = store.data.Exam.ExamResultPageUrl + '&ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData + '&location_source=' + store.data.LocationSource;
                                        }
                                        location.replace(url);
                                    },
                                    'class': 'default-btn'
                                }],
                            disabledClose: true
                        });
                    }
                });
            };
            ExamAnswer.prototype.goto = function (questionId) {
                var num = this.store.getNumById(questionId);
                if (num) {
                    this.store.viewModel.navigator.num(num);
                }
            };
            return ExamAnswer;
        }(__answer.Studying.Answer);
        Studying.ExamAnswer = ExamAnswer;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define('studying.exam.singleanswer', [
    'require',
    'exports',
    'studying.exam.store',
    'studying.answer',
    'studying.enum',
    'timer'
], function (require, exports, __store, __answer, __enum, _timer) {
    var Studying;
    (function (Studying) {
        var ExamSingleAnswer = function (_super) {
            __extends(ExamSingleAnswer, _super);
            function ExamSingleAnswer() {
                _super.call(this);
                this.isCommit = false;
                this._elementSelector = '#exercise';
                this.timer = null;
                this.timeout = 0;
                this.modeCache = null;
                this.i18n = {
                    common: {
                        explain: { title: '考试说明' },
                        subjective: {
                            attachement: '附件\uFF1A',
                            uploadTitle: '(附件允许上传图片文件\uFF0C最大不超过10M)',
                            uploadingText: '上传中\uFF1A',
                            downloadAttachement: '点击下载',
                            selectFileText: '请选择文件...',
                            fileLimitSize: '选择的文件过大',
                            sureBtn: '确定'
                        },
                        navigatorStat: {
                            title: '本次成绩',
                            accuracy: '正确率',
                            right: '答对',
                            question: '题',
                            error: '答错',
                            noAnswer: '未做'
                        },
                        option: { answerTitle: '此选项为参考答案' },
                        question: {
                            temporarilyUncertain: '暂不确定',
                            rightAnswerLabel: '正确答案',
                            answerRightTitle: '您答对了',
                            subjectiveUserAnswer: '主观题用户答案',
                            questionExplanation: '题目详解',
                            questionsExplanation: '套题详解',
                            notScore: '\t不计分',
                            score: '分',
                            analysisTitle: '<暂无>',
                            notAnswer: '您未作答',
                            subQuestionUserTitle: '您错答为'
                        },
                        navigation: '答题卡',
                        prev: '<i></i>上一题',
                        next: '<i></i>下一题',
                        submit: '提交考试'
                    },
                    singleModeExam: {
                        answer: {
                            commit: '交卷',
                            reAnswer: '重新考试',
                            explanation: '考试说明',
                            exerciseScore: '本次成绩',
                            noAnswer: '很抱歉\uFF01您尚未答题\uFF0C不能提交答案\u3002',
                            continueAnswer: '继续答题',
                            answerAllCommitTitle: '已完成全部题目\uFF0C确定提交答案吗\uFF1F',
                            examAutoCommitTitle: '本次考试已自动交卷\uFF0C不能继续作答',
                            sure: '确定',
                            cancel: '取消',
                            partialFinishCommitTitle: '已完成 {{doneCount}} 题\uFF0C还有 {{noAnswer}} 题未做\uFF0C确定提交答案吗\uFF1F',
                            partialFinishCommitTitle2: '已完成 {{doneCount}} 题\uFF0C还有 {{noAnswer}} 题未做\uFF0C不能提交\uFF01'
                        },
                        prepare: {
                            totalQuestion: '本考试共 {{totalCount}} 题',
                            startAnswer: '开始考试',
                            bestScoreCaption: '最好成绩\uFF1A',
                            right: '答对',
                            question: '题',
                            error: '答错',
                            noAnswer: '未答',
                            accuracy: '正确率'
                        }
                    }
                };
                this._tmpl = '                <div>                    <div class="prepare"></div>                    <div class="test-box">                        <div class="test-main">                            <div class="test-wrapper test-unflod">                                <div class="w-test-con">                                    <div class="question w-item-list"></div>                                </div>                                <div class="w-test-sheet">                                    <div class="wt-sheet">                                        <div class="wt-sheet-hd clearfix">                                            <ul>                                                <li class="active"><a href="javascript:void(0);" id="navigator">答题卡</a></li>                                            </ul>                                        </div>                                        <div class="navigator"></div>                                    </div>                                    <a class="w-test-collapse" href="javascript:;">                                        <i></i>                                    </a>                                </div>                                <div class="w-test-alert1" style="display: none;"></div>                            </div>                            <div class="test-toolbar">                                <div class="wt-tool-left" style="display: none;">                                    <span class="wt-timer">                                        <ins></ins><span class="wt-timer-clock wt-active"></span>                                    </span>                                </div>                                <div class="wt-tool-mid">                                    <a href="javascript:;" class="wt-question-prev ln-btn-prev wt-prev-disabled">                                        <span id="prev"><i></i>上一题</span>                                    </a>                                    <a href="javascript:;" class="wt-question-next ln-btn-next">                                        <span id="next"><i></i>下一题</span>                                    </a>                                </div>                                <div class="wt-tool-right">                                    <a href="javascript:void(0);" class="wt-result-btn ln-btn-finish wt-active" style="display: none;">                                        <span id="submit">提交考试</span>                                    </a>                                </div>                            </div>                        </div>                    </div>                </div>        ';
            }
            ExamSingleAnswer.prototype.init = function (data) {
                this.dataCache = data;
                if (data && data.i18n)
                    this.i18n = data.i18n;
                this._elementSelector = data.ElementSelector;
                $(this._elementSelector).html(this._tmpl);
                this.store = new __store.Studying.ExamStore(data);
                this.store.initedHandler = $.proxy(this.onStoreInited, this);
                this.store.questionStateChangeHandler = $.proxy(this.onQuestionStateChange, this);
                this.store.sessionNeedSubmitHandler = $.proxy(this.onSessionNeedSubmit, this);
                this.timer = _timer.Common.TimerFactory.Singleton();
                if (this.store.data.controlOptions.disablePreButton) {
                    $('.ln-btn-prev').hide();
                }
                if (this.store.data.controlOptions.disableNextButton) {
                    $('.ln-btn-next').hide();
                }
                this.initLanguageText();
            };
            ExamSingleAnswer.prototype.initLanguageText = function () {
                $('#navigator').html(this.i18n.common.navigation);
                $('#prev').html(this.i18n.common.prev);
                $('#next').html(this.i18n.common.next);
                $('#submit').html(this.i18n.singleModeExam.answer.commit);
            };
            ExamSingleAnswer.prototype.onStoreInited = function () {
                var _this = this;
                if (!this.timer.isReady()) {
                    this.timer.ready().done(function () {
                        _this.initUi();
                        _this.regiest();
                    });
                    return;
                }
                this.initUi();
                this.regiest();
            };
            ExamSingleAnswer.prototype.onQuestionStateChange = function (qid, state) {
            };
            ExamSingleAnswer.prototype.onSessionNeedSubmit = function () {
                this.dofinish(true, true, this.i18n.singleModeExam.answer.examAutoCommitTitle);
            };
            ExamSingleAnswer.prototype.initUi = function () {
                switch (this.store.data.Exam.SingleModeConfig.Mode) {
                case __enum.Studying.AnswerMode.Exercise:
                    $('.ln-btn-restart').removeClass('ln-btn-restart').addClass('ln-btn-finish').find('span').text(this.i18n.singleModeExam.answer.commit);
                    $('.ln-btn-finish').show();
                    break;
                case __enum.Studying.AnswerMode.View:
                    $('.ln-btn-finish').removeClass('ln-btn-finish').addClass('ln-btn-restart').find('span').text(this.i18n.singleModeExam.answer.reAnswer);
                    break;
                }
                if (this.store.data.controlOptions && this.store.data.controlOptions.hideNavigator) {
                    $('.w-test-sheet').addClass('hide');
                    $('.test-wrapper').removeClass('test-unflod');
                }
            };
            ExamSingleAnswer.prototype.regiest = function () {
                var _this = this;
                $('.navigator').navigator({
                    num: this.store.getNumById(),
                    items: this.store.data.Items,
                    batches: this.store.data.Batches,
                    partTitles: this.store.data.PartTitle,
                    isShowAnswerState: this.store.data.Exam.SingleModeConfig.Mode != __enum.Studying.AnswerMode.View ? false : true,
                    autoHidePrev: this.store.getControlOption('autoHidePrev'),
                    autoHideNext: this.store.getControlOption('autoHideNext'),
                    disableJump: this.store.data.controlOptions && this.store.data.controlOptions.disableNavigatorJump ? this.store.data.controlOptions.disableNavigatorJump : false,
                    numChanged: $.proxy(this._numChanged, this),
                    inited: function (evt, ui) {
                        _this.store.viewModel.navigator = ui.viewModel;
                    },
                    i18n: this.i18n.common.navigator
                });
                if (this.store.data.Exam.SingleModeConfig.Mode == __enum.Studying.AnswerMode.View) {
                    this.renderSide();
                    $(window).unbind('resize', $.proxy(this.renderSide, this)).resize($.proxy(this.renderSide, this));
                } else {
                    $(window).unbind('resize', $.proxy(this.renderSide, this));
                    $('.wt-sheet-field').css('bottom', '20px');
                    $('.wt-sheet-hd li').hide().eq(0).show().addClass('active').unbind('click');
                }
                this.regiestTimer();
            };
            ExamSingleAnswer.prototype.regiestTimer = function () {
                if (this.store.data.ViewMode < 2) {
                    if (this.store.data.leavetime || this.store.data && this.store.data.controlOptions && this.store.data.controlOptions.showCostTime) {
                        $(this._elementSelector + ' .wt-tool-left').show();
                        this.timer.appendRepeateHandler('tick', $.proxy(this._onTimerElapsed, this), Number.MAX_VALUE, 400);
                        if (this.store.data.leavetime) {
                            this.timer.appendHandler('finish', Math.min(259200000 + parseInt(this.timer.time()), this.store.data.leavetime), $.proxy(this._timeover, this));
                        }
                    }
                }
            };
            ExamSingleAnswer.prototype.renderSide = function () {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(function () {
                    if ($('.w-test-sheet').height() > 420) {
                        $('.wt-sheet-stat').css({
                            'top': 'auto',
                            'bottom': 0
                        }).show();
                        $('.wt-sheet-stat .wss-text').show();
                        $('.wt-sheet-hd li').hide().eq(0).show().addClass('active').unbind('click');
                        $('.wt-sheet-tab').show();
                        $('.wt-sheet-field').css('bottom', '255px');
                    } else {
                        $('.wt-sheet-stat').css({
                            'top': '55px',
                            'bottom': 'auto'
                        }).show();
                        $('.wt-sheet-stat .wss-text').hide();
                        $('.wt-sheet-hd li').removeClass('active').show().eq(0).addClass('active');
                        $('.wt-sheet-tab').hide().eq(0).show();
                        $('.wt-sheet-field').css('bottom', '20px');
                        $('.wt-sheet-hd li').unbind('click').click(function () {
                            $('.wt-sheet-hd li').removeClass('active');
                            $(this).addClass('active');
                            $('.wt-sheet-tab').hide().eq($(this).index()).show();
                            $('.wt-sheet-stat').show();
                        });
                    }
                }, 100);
            };
            ExamSingleAnswer.prototype._onTimerElapsed = function () {
                var leavetime = new Date(this.store.data.leavetime).getTime();
                var showCostTime = this.store.data && this.store.data.controlOptions && this.store.data.controlOptions.showCostTime || false;
                if (showCostTime) {
                    var beginTime = this.store.data && this.store.data.UserExam && this.store.data.UserExam.BeginTime || 0;
                    $(this._elementSelector + ' .wt-timer-clock').text(this._toTimeString(this.timer.time() - beginTime));
                } else {
                    $(this._elementSelector + ' .wt-timer-clock').text(this._toTimeString(leavetime - this.timer.time()));
                }
            };
            ExamSingleAnswer.prototype.render = function (id, num) {
                var _this = this;
                $.studying.loading.show();
                this.store.load(id).done(function (cell) {
                    $.studying.loading.hide();
                    var editable = true, showAnswer = false;
                    switch (_this.store.data.Exam.SingleModeConfig.Mode) {
                    case __enum.Studying.AnswerMode.Test:
                    case __enum.Studying.AnswerMode.Exercise:
                        editable = true;
                        showAnswer = false;
                        break;
                    case __enum.Studying.AnswerMode.View:
                        editable = false;
                        showAnswer = true;
                        break;
                    }
                    var analysisData = Enumerable.from(_this.store.data.UserExam.AnalysisData).where('$.id ==\'' + cell.Id + '\'').toArray()[0];
                    var showQuestionNum = _this.store.getControlOption('showQuestionNum');
                    var showGotoLearn = _this.store.getControlOption('showGotoLearnButton');
                    var showQuizButton = _this.store.getControlOption('showQuizButton');
                    cell.ErrorReasons = [];
                    cell.QuestionErrorReasons = [];
                    var $q = $('.question');
                    $q.qtiquestion({
                        'mode': _this.store.data.Exam.SingleModeConfig.Mode,
                        'uploadAllowed': false,
                        'editable': editable,
                        'showAnswer': showAnswer,
                        'showQuestionNum': showQuestionNum != undefined ? showQuestionNum : true,
                        'ispapermode': false,
                        'num': num,
                        'question': cell.Question,
                        'result': cell.Result,
                        'analysisData': analysisData,
                        'qtiPath': { 'refPath': _this.store.data.QtiPath.RefPath },
                        'questionInBankId': null,
                        'showQuestionBank': false,
                        'showGotoLearnButton': showGotoLearn,
                        'showQuizButton': showQuizButton,
                        'errorReasons': cell.ErrorReasons,
                        'questionErrorReasons': cell.QuestionErrorReasons,
                        'addToQuestionBank': $.proxy(_this._onAddToQuestionBank, _this, $q),
                        'setEmphasisQuestion': $.proxy(_this._onSetEmphasisQuestion, _this, $q),
                        'removeEmphasisQuestion': $.proxy(_this._onRemoveEmphasisQuestion, _this),
                        'addErrorReason': $.proxy(_this._onAddErrorReason, _this, $q),
                        'updateErrorReason': $.proxy(_this._onUpdateErrorReason, _this),
                        'updateQuestionTags': $.proxy(_this._onUpdateQuestionTags, _this, $q),
                        'deleteErrorReason': $.proxy(_this._onDeleteErrorReason, _this, $q),
                        'learnButtonClick': $.proxy(_this._learnButtonClick, _this, cell.Id),
                        'questionButtonClick': $.proxy(_this._questionButtonClick, _this, cell.Id),
                        'changed': $.proxy(_this._answerChanged, _this),
                        'attachementSetting': {
                            'session': _this.store.data.Attachement.Session,
                            'url': _this.store.data.Attachement.Url,
                            'path': _this.store.data.Attachement.Path,
                            'flashUrl': _this.store.data.Attachement.FlashUrl,
                            'downloadUrlFormat': _this.store.data.Attachement.DownloadUrlFormat
                        },
                        inited: function (evt, ui) {
                            _this.store.viewModel.question = ui.viewModel;
                        },
                        i18n: $.extend({}, _this.i18n.common.question, {
                            judge: _this.i18n.common.judge,
                            questionOption: _this.i18n.common.questionOption,
                            subjective: _this.i18n.common.subjective
                        })
                    });
                    $q.qtiquestion('onDomReady');
                    $q.find('input[class*=_qp-text-input]').width(124);
                });
            };
            ExamSingleAnswer.prototype._onAddToQuestionBank = function (context, evt, data) {
                this.store.addToQuestionBank(data.questionId).done(function (r) {
                    context.question('updateQuestionRelateTag', r);
                });
            };
            ExamSingleAnswer.prototype._onSetEmphasisQuestion = function (context, evt, data) {
                this.store.setEmphasisQuestion(data.questionId).done(function (r) {
                    context.question('updateQuestionRelateTag', r);
                });
            };
            ExamSingleAnswer.prototype._onRemoveEmphasisQuestion = function (evt, data) {
                this.store.removeEmphasisQuestion(data.questionId);
            };
            ExamSingleAnswer.prototype._onAddErrorReason = function (questionDom, evt, data) {
                this.store.createErrorReason(data).done(function (reason) {
                    questionDom.question('updateErrorReasons', reason);
                });
            };
            ExamSingleAnswer.prototype._onUpdateErrorReason = function (evt, data) {
                this.store.updateErrorReason(data.reasonId, data.reason).done(function () {
                });
            };
            ExamSingleAnswer.prototype._onUpdateQuestionTags = function (questionDom, evt, data) {
                this.store.updateQuestionTags(data.questionId, data.reason).done(function (reasons) {
                    questionDom.question('updateQuestionReasons', reasons);
                });
            };
            ExamSingleAnswer.prototype._onDeleteErrorReason = function (context, evt, data) {
                this.store.deleteErrorReason(data.questionId, data.reason);
            };
            ExamSingleAnswer.prototype._learnButtonClick = function (questionId) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onLearnButtonClick) {
                    this.store.data.EventCallbacks.onLearnButtonClick(questionId);
                }
            };
            ExamSingleAnswer.prototype._questionButtonClick = function (questionId) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onQuestionButtonClick) {
                    this.store.data.EventCallbacks.onQuestionButtonClick(questionId);
                }
            };
            ExamSingleAnswer.prototype._answerChanged = function (evt, ui) {
                if (this.isCommit)
                    return;
                var vm = ui.viewModel;
                if (typeof vm == 'undefined')
                    return;
                var cell = this.store.get(vm.question.identifier()), lastCostSecond = cell.Result.CostSeconds, result = $.extend(true, cell.Result, ko.mapping.toJS(vm.result));
                cell.Result = result;
                cell.Result.Answers = vm.result.Answers;
                cell.submit = false;
                this.pushCostSeconds(cell, lastCostSecond);
                var answerData = {
                    cell: cell,
                    time: new Date().getTime(),
                    examId: this.store.data.ExamId,
                    sessionId: this.store.data.SessionId
                };
                this.store.queue(answerData, true);
                this.store.viewModel.navigator.items()[vm.num() - 1].state(cell.Result['Result']);
            };
            ExamSingleAnswer.prototype._numChanged = function (evt, ui) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onNumberChanged) {
                    var analysisData = this.store.data.UserExam.AnalysisData;
                    var questionId = ui.item.Id();
                    var questionAnswerStatus = null;
                    if (analysisData.length) {
                        var itemArray = Enumerable.from(analysisData).where('$.id ==\'' + questionId + '\'').toArray();
                        if (itemArray.length) {
                            questionAnswerStatus = itemArray[0].questionAnswerStatus;
                        }
                    }
                    this.store.data.EventCallbacks.onNumberChanged(questionId, questionAnswerStatus);
                }
                if (typeof ui.item == 'undefined')
                    return;
                var currentQuestion = this.store.get(ui.item.Id());
                if (currentQuestion) {
                    currentQuestion.CostSecondsStartTime = new Date().getTime();
                }
                this.store.data.CurrentQuestionId = ui.item.Id();
                this.render(this.store.data.CurrentQuestionId, ui.item.num());
                var cElement = $('.wt-sheet-box li').eq(ui.item.num() - 1);
                if (cElement.length > 0) {
                    var liHeight = cElement.height();
                    var top = cElement.position().top;
                    var wrap = $('.wt-sheet-field');
                    var wrapHeight = wrap.height();
                    do {
                        if (top > wrapHeight - liHeight)
                            wrap.scrollTop(wrap.scrollTop() + liHeight);
                        else if (top < 0)
                            wrap.scrollTop(wrap.scrollTop() - liHeight);
                        top = cElement.position().top;
                    } while (top > wrapHeight - liHeight);
                }
            };
            ExamSingleAnswer.prototype._checkSubmit = function () {
                var vm = this.store.viewModel.question;
                if (typeof vm == 'undefined')
                    return false;
                if (!vm.done()) {
                    return false;
                }
                return true;
            };
            ExamSingleAnswer.prototype._onSubmit = function () {
                if (!this._checkSubmit())
                    return;
                this._updateAnswers(true);
                if (this.store.data.Exam.SingleModeConfig.Mode == __enum.Studying.AnswerMode.Exercise) {
                    var vm = this.store.viewModel.question;
                    this.render(vm.question.id(), vm.num());
                }
            };
            ExamSingleAnswer.prototype._updateAnswers = function (submit) {
                var vm = this.store.viewModel.question;
                if (typeof vm == 'undefined')
                    return;
                var cell = this.store.get(vm.question.id());
                var result = $.extend(true, { CostSeconds: 0 }, cell.Result, vm.result());
                result.CostSeconds = 1;
                cell.Result = result;
                cell.submit = submit || cell.submit;
                this.store.queue(cell, submit);
                this.store.viewModel.navigator.items()[vm.num() - 1].state(cell.Result['Result']);
            };
            ExamSingleAnswer.prototype._timeover = function () {
                var store = this.store;
                this.timer.removeHandler('tick');
                this.dofinish(true, true);
            };
            ExamSingleAnswer.prototype._finish = function () {
                var doneCount = this.store.getDoneCount(), totalCount = this.store.getTotalCount(), _this = this;
                if (doneCount == totalCount) {
                    $.fn.udialog.confirm2(this.i18n.singleModeExam.answer.answerAllCommitTitle, {
                        title: this.i18n.exam.answer.confirmCaption,
                        buttons: [
                            {
                                text: this.i18n.singleModeExam.answer.cancel,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                }
                            },
                            {
                                text: this.i18n.singleModeExam.answer.sure,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                    _this.dofinish(false, false);
                                },
                                'class': 'default-btn'
                            }
                        ]
                    });
                } else {
                    if (this.store.data.controlOptions && this.store.data.controlOptions.forceToAnswer) {
                        var title = this.i18n.singleModeExam.answer.partialFinishCommitTitle2.replace('{{doneCount}}', doneCount.toString()).replace('{{noAnswer}}', (totalCount - doneCount).toString());
                        $.fn.udialog.alert(title, {
                            width: '420',
                            icon: '',
                            title: this.i18n.exam.answer.confirmCaption,
                            buttons: [{
                                    text: this.i18n.exam.answer.sure,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                    },
                                    'class': 'default-btn'
                                }],
                            disabledClose: true
                        });
                    } else {
                        var title = this.i18n.singleModeExam.answer.partialFinishCommitTitle.replace('{{doneCount}}', doneCount.toString()).replace('{{noAnswer}}', (totalCount - doneCount).toString());
                        $.fn.udialog.confirm2(title, {
                            title: this.i18n.exam.answer.confirmCaption,
                            buttons: [
                                {
                                    text: this.i18n.singleModeExam.answer.sure,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                        _this.dofinish(false, false);
                                    }
                                },
                                {
                                    text: this.i18n.singleModeExam.answer.continueAnswer,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                    },
                                    'class': 'default-btn'
                                }
                            ]
                        });
                    }
                }
            };
            ExamSingleAnswer.prototype.pushCostSeconds = function (lastQuestion, lastCostSecond) {
                if (lastQuestion && lastQuestion.CostSecondsStartTime) {
                    lastQuestion.Result.CostSeconds = Math.round((lastCostSecond ? lastCostSecond : 0) + (new Date().getTime() - lastQuestion.CostSecondsStartTime) / 1000);
                    lastQuestion.Result.CostSeconds = lastQuestion.Result.CostSeconds ? lastQuestion.Result.CostSeconds : 1;
                    lastQuestion.CostSecondsStartTime = new Date().getTime();
                }
            };
            ExamSingleAnswer.prototype.dofinish = function (showdialog, retry, title) {
                var _this = this;
                var that = this;
                var store = this.store;
                var title = title ? title : this.i18n.exam.answer.examFinishTitle;
                $.studying.loading.show();
                store.commit().done(function () {
                    _this.isCommit = true;
                    store.end().done(function (data) {
                        if (data && data.userData && data.userData.subType == 1) {
                            var resultUrl;
                            var customerUrl = data && data.userData && data.userData.resultUrl;
                            var defaultUrl = store.data.Exam.ExamResultPageUrl + '?exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                            if (store.data.Exam.ExamResultPageUrl.indexOf('?') >= 0) {
                                defaultUrl = store.data.Exam.ExamResultPageUrl + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                            }
                            if (customerUrl) {
                                resultUrl = customerUrl + data.userData.resultCode;
                            } else {
                                resultUrl = defaultUrl;
                            }
                            try {
                                if (showdialog) {
                                    $.fn.udialog.alert(title, {
                                        width: '420',
                                        icon: '',
                                        title: _this.i18n.exam.answer.confirmCaption,
                                        buttons: [{
                                                text: _this.i18n.exam.answer.sure,
                                                click: function () {
                                                    var t = $(this);
                                                    t['udialog']('hide');
                                                    location.replace(resultUrl);
                                                },
                                                'class': 'default-btn'
                                            }],
                                        disabledClose: true
                                    });
                                } else {
                                    location.replace(resultUrl);
                                }
                            } catch (e) {
                                alert('customer script error.');
                            }
                        } else {
                            if (showdialog) {
                                $.fn.udialog.alert(title, {
                                    width: '420',
                                    icon: '',
                                    title: _this.i18n.exam.answer.confirmCaption,
                                    buttons: [{
                                            text: _this.i18n.exam.answer.sure,
                                            click: function () {
                                                var t = $(this);
                                                t['udialog']('hide');
                                                var url = store.data.Exam.ExamResultPageUrl + '?ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                                                if (store.data.Exam.ExamResultPageUrl.indexOf('?') >= 0) {
                                                    url = store.data.Exam.ExamResultPageUrl + '&ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                                                }
                                                location.replace(url);
                                            },
                                            'class': 'default-btn'
                                        }],
                                    disabledClose: true
                                });
                            } else {
                                var url = store.data.Exam.ExamResultPageUrl + '?ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                                if (store.data.Exam.ExamResultPageUrl.indexOf('?') >= 0) {
                                    url = store.data.Exam.ExamResultPageUrl + '&ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                                }
                                location.replace(url);
                            }
                        }
                    }).fail(function () {
                    }).always(function () {
                        $.studying.loading.hide();
                    });
                }).fail(function (data) {
                    $.studying.message.show(_this.i18n.exam.answer.commitFail);
                    var responseData = data && data.responseText ? JSON.parse(data.responseText) : null;
                    if (retry && !responseData) {
                        $.fn.udialog.alert(title, {
                            width: '420',
                            icon: '',
                            title: _this.i18n.exam.answer.confirmCaption,
                            buttons: [{
                                    text: _this.i18n.exam.answer.retry,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                        that.dofinish(doNav, retry);
                                    },
                                    'class': 'default-btn'
                                }],
                            disabledClose: true
                        });
                    }
                    if (responseData && responseData.code == 500000) {
                        $.fn.udialog.alert(responseData.message, {
                            width: '420',
                            icon: '',
                            title: _this.i18n.exam.answer.confirmCaption,
                            buttons: [{
                                    text: _this.i18n.exam.answer.sure,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                        var url = store.data.Exam.ExamResultPageUrl + '?ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                                        if (store.data.Exam.ExamResultPageUrl.indexOf('?') >= 0) {
                                            url = store.data.Exam.ExamResultPageUrl + '&ranking_url=' + encodeURIComponent(store.data.RankingUrl) + '&exam_id=' + store.data.ExamId + '&session_id=' + store.data.SessionId + '&custom_data=' + store.data.CustomData;
                                        }
                                        location.replace(url);
                                    },
                                    'class': 'default-btn'
                                }],
                            disabledClose: true
                        });
                    }
                });
            };
            ExamSingleAnswer.prototype._toTimeString = function (span) {
                span = Math.ceil(parseInt(span / 1000 + ''));
                var h = parseInt(span / 3600 + '');
                var m = parseInt(span / 60 + '') % 60;
                var s = span % 60;
                return (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s);
            };
            ExamSingleAnswer.prototype.goto = function (questionId) {
                var num = this.store.getNumById(questionId);
                if (num) {
                    this.store.viewModel.navigator.num(num);
                }
            };
            return ExamSingleAnswer;
        }(__answer.Studying.Answer);
        Studying.ExamSingleAnswer = ExamSingleAnswer;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.bussiness.base', [
    'require',
    'exports',
    'studying.helper'
], function (require, exports, __helper) {
    var Studying;
    (function (Studying) {
        var BaseWrapper = function () {
            function BaseWrapper(config) {
                this.config = {
                    'host': {
                        'mainHost': '',
                        'noteServiceHost': '',
                        'questionBankServiceHost': '',
                        'errorUrl': '',
                        'elearningEnrollGatewayHost': '',
                        'historyScoreUrl': '',
                        'rankingUrl': '',
                        'returnUrl': ''
                    },
                    'envConfig': {
                        'currentQuestionId': 0,
                        'examId': '',
                        'sessionId': '',
                        'element': '#exercise',
                        'prepareElement': '#examPrepare',
                        'token': '',
                        'userId': 0,
                        'language': 'zh-CN',
                        'i18n': {},
                        'locationSource': 0,
                        'displayOptions': {
                            'showRank': false,
                            'hideNavigator': false,
                            'disableNavigatorJump': false,
                            'disablePreButton': false,
                            'showQuestionNum': true,
                            'enableQuestionBank': true,
                            'showGotoLearnButton': false,
                            'showQuizButton': false,
                            'autoHidePrev': false,
                            'showErrorButton': false,
                            'hideErrorButton': false,
                            'autoHideNext': false,
                            'showCostTime': false,
                            'disableNextButton': false
                        },
                        'answerOptions': { 'forceToAnswer': false },
                        'tokenConfig': {
                            'needToken': false,
                            'onGetToken': function () {
                            }
                        }
                    },
                    'eventCallBack': {
                        'onAnswerSaved': function () {
                        },
                        'onAnswerChange': function () {
                        },
                        'onNumberChanged': function () {
                        },
                        'onNextButtonClick': function () {
                        },
                        'onLearnButtonClick': function () {
                        },
                        'onQuestionButtonClick': function () {
                        }
                    }
                };
                this.config = $.extend(this.config, config);
            }
            BaseWrapper.prototype.init = function () {
            };
            BaseWrapper.prototype.entryExam = function (mine, exam, answersData, analysisData) {
            };
            BaseWrapper.prototype.getEnrollUrl = function (unitId, returnUrl) {
                var url = this.config.envConfig.elearningEnrollGatewayHost + '/enroll/enroll?unit_id=' + unitId + '&__return_url=' + encodeURIComponent(returnUrl);
                url += '&__mac=' + Nova.getMacToB64(url);
                return url;
            };
            BaseWrapper.prototype.onError = function (failData) {
                var message = JSON.parse(failData.responseText);
                location.replace(this.config.host.errorUrl + '?message=' + message.message);
            };
            BaseWrapper.prototype.getQueryStringByName = function (name) {
                var result = location.search.match(new RegExp('[?&]' + name + '=([^&]+)', 'i'));
                if (result == null || result.length < 1) {
                    return '';
                }
                return result[1];
            };
            BaseWrapper.prototype.insert = function (val, ofset, subStr) {
                if (ofset < 0 || ofset >= val.length - 1) {
                    return val.append(subStr);
                }
                return val.substring(0, ofset + 1) + subStr + val.substring(ofset + 1);
            };
            BaseWrapper.prototype.getExamInfo = function () {
                return this.sendRequest({ url: this.config.host.mainHost + '/v1/exams/' + this.config.envConfig.examId });
            };
            BaseWrapper.prototype.getMyExamInfo = function () {
                return this.sendRequest({ url: this.config.host.mainHost + '/v1/m/exams/' + this.config.envConfig.examId + '/mine' });
            };
            BaseWrapper.prototype.sendRequest = function (datas) {
                var _this = this;
                var that = this;
                var obj = $.extend({
                    type: 'get',
                    dataType: 'json',
                    requestCase: 'snake',
                    reponseCase: 'camel',
                    enableToggleCase: true,
                    contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                    traditional: true,
                    beforeSend: function (xhr) {
                        if (_this.config.envConfig.tokenConfig.needToken) {
                            var buff = __helper.Studying.HelperMethods.ResolveHost(obj.url);
                            var mac = {
                                'method': obj.type,
                                'path': buff.path,
                                'host': buff.host
                            };
                            var tokenInfo = _this.config.envConfig.tokenConfig.onGetToken(mac);
                            xhr.setRequestHeader('Authorization', tokenInfo['Authorization']);
                            if (obj.type.toLowerCase() != 'get')
                                xhr.setRequestHeader('X-Gaea-Authorization', tokenInfo['X-Gaea-Authorization']);
                        }
                        if (_this.config.envConfig.language)
                            xhr.setRequestHeader('Accept-Language', decodeURIComponent(_this.config.envConfig.language));
                    }
                }, datas);
                if (obj.type.toLowerCase() == 'get') {
                    obj.url = __helper.Studying.HelperMethods.GenUrlEandRom(obj.url);
                }
                return $.ajax(obj).fail(function () {
                    if ($.studying.loading && $.isFunction($.studying.loading.hide)) {
                        $.studying.loading.hide();
                    }
                });
            };
            return BaseWrapper;
        }();
        Studying.BaseWrapper = BaseWrapper;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define('studying.bussiness.singlemodeexam', [
    'require',
    'exports',
    'studying.enum',
    'studying.bussiness.base',
    'studying.exam.singleanswer'
], function (require, exports, __enum, __base, __answer) {
    var Studying;
    (function (Studying) {
        var Bussiness;
        (function (Bussiness) {
            var SingleModeExam = function (_super) {
                __extends(SingleModeExam, _super);
                function SingleModeExam(config) {
                    _super.call(this, config);
                }
                SingleModeExam.prototype.init = function () {
                    var _this = this;
                    $.studying.loading.show();
                    this.main = null;
                    $.when(this.getExamInfo(), this.getMyExamInfo()).done(function (examData, mineData) {
                        var data = mineData[0], examInfo = examData[0];
                        examInfo.beginTime = Date.ajustTimeString(examInfo.beginTime);
                        examInfo.endTime = Date.ajustTimeString(examInfo.endTime);
                        data.beginTime = Date.ajustTimeString(data.beginTime);
                        data.endTime = Date.ajustTimeString(data.endTime);
                        if (data.userData && data.userData.finishTime)
                            data.userData.finishTime = Date.ajustTimeString(data.userData.finishTime);
                        if (data.userData && data.userData.markTime)
                            data.userData.markTime = Date.ajustTimeString(data.userData.markTime);
                        if (data.userData && data.userData.startTime)
                            data.userData.startTime = Date.ajustTimeString(data.userData.startTime);
                        if (data.userData && data.userData.submitTime)
                            data.userData.submitTime = Date.ajustTimeString(data.userData.submitTime);
                        var answersData = [], analysisData = [], defs = [], qids = [];
                        if (data.status == 8 && data.userData) {
                            Enumerable.from(data.userData.ndrPaper.item.testParts[0].assessmentSections).forEach(function (value, index) {
                                qids = qids.concat($.map(value.sectionParts, function (spv, spi) {
                                    return spv.identifier;
                                }));
                            });
                            defs.push(_this._getUserQuestionAnswers(data.examId, data.sessionId, qids, function (answerData) {
                                if (answerData && answerData.length > 0)
                                    answersData = answersData.concat(answerData);
                            }));
                        }
                        $.when.apply({}, defs).done(function () {
                            _this.entryExam(data, examInfo, answersData, analysisData);
                        });
                    }).fail($.proxy(this.onError, this));
                };
                SingleModeExam.prototype.entryExam = function (mine, exam, answersData, analysisData) {
                    $.studying.loading.hide();
                    var config = {
                        'Host': this.config.host.mainHost,
                        'NoteServiceHost': this.config.host.noteServiceHost,
                        'QuestionBankServiceHost': this.config.host.questionBankServiceHost,
                        'ElementSelector': this.config.envConfig.element,
                        'ExamId': mine.examId,
                        'UserId': this.config.envConfig.userId,
                        'CustomData': null,
                        'SessionId': mine.sessionId,
                        'Language': this.config.envConfig.language,
                        'Batches': [],
                        'Sid': '1a642291763348e98df58ab43fe41ac7',
                        'Cells': [],
                        'i18n': this.config.envConfig.i18n,
                        'ViewMode': 1,
                        'CurrentQuestionId': this.config.envConfig.currentQuestionId,
                        'TokenConfig': {
                            'NeedToken': this.config.envConfig.tokenConfig.needToken,
                            'OnGetToken': this.config.envConfig.tokenConfig.onGetToken
                        },
                        'QuestionScoreDict': {},
                        'ApiRequestUrls': {},
                        'controlOptions': {
                            'showCostTime': this.config.envConfig.displayOptions.showCostTime,
                            'disableNavigatorJump': this.config.envConfig.displayOptions.disableNavigatorJump,
                            'disablePreButton': this.config.envConfig.displayOptions.disablePreButton,
                            'disableNextButton': this.config.envConfig.displayOptions.disableNextButton,
                            'hideNavigator': this.config.envConfig.displayOptions.hideNavigator,
                            'forceToAnswer': this.config.envConfig.answerOptions.forceToAnswer,
                            'showQuestionNum': this.config.envConfig.displayOptions.showQuestionNum,
                            'showGotoLearnButton': this.config.envConfig.displayOptions.showGotoLearnButton == undefined ? true : this.config.envConfig.displayOptions.showGotoLearnButton,
                            'showQuizButton': this.config.envConfig.displayOptions.showQuizButton == undefined ? true : this.config.envConfig.displayOptions.showQuizButton,
                            'autoHidePrev': this.config.envConfig.displayOptions.autoHidePrev == undefined ? false : this.config.envConfig.displayOptions.autoHidePrev,
                            'autoHideNext': this.config.envConfig.displayOptions.autoHideNext == undefined ? false : this.config.envConfig.displayOptions.autoHideNext
                        },
                        'EventCallbacks': {
                            'onAnswerSaved': this.config.eventCallBack.onAnswerSaved,
                            'onAnswerChange': this.config.eventCallBack.onAnswerChange,
                            'onNumberChanged': this.config.eventCallBack.onNumberChanged,
                            'onLearnButtonClick': this.config.eventCallBack.onLearnButtonClick,
                            'onQuestionButtonClick': this.config.eventCallBack.onQuestionButtonClick
                        },
                        'Attachement': {
                            'Session': '',
                            'Url': '',
                            'Path': '',
                            'Server': '',
                            'DownloadUrlFormat': ''
                        },
                        Paper: {
                            'Summary': '这里是考试说明预留字段',
                            'CompletionSeconds': mine.duration,
                            'QuestionCount': mine.questionCount,
                            'Score': mine.totalScore,
                            'Title': mine.name
                        },
                        'Exam': {
                            'Id': exam.id,
                            'Name': exam.title,
                            'LimitSeconds': exam.duration ? exam.duration * 1000 : null,
                            'BeginTime': new Date(exam.beginTime).getTime(),
                            'EndTime': exam.endTime && exam.endTime != '1970/01/01 08:00:00' ? new Date(exam.endTime).getTime() : __enum.Studying.ConstValue.MaxExamEndTime,
                            'Mode': 1,
                            'PassScore': exam.passingScore,
                            'Summary': exam.description ? exam.description : '',
                            'Chance': exam.examChance,
                            'ExamResultPageUrl': this.config.host.returnUrl ? this.config.host.returnUrl : 'http://' + window.location.host,
                            'EnrollType': exam.enrollType,
                            'EnrollUrl': '',
                            'UploadAllowed': exam.uploadAllowed,
                            'SubType': exam.subType,
                            'rankingAble': exam.rankingAble,
                            'AnswerQueue': 1,
                            'SingleModeConfig': { 'Mode': 2 }
                        },
                        'UserExam': {
                            'AnswersData': answersData,
                            'UserEnroll': mine.userEnroll,
                            'AnalysisData': [],
                            'UserExamStatus': mine.status,
                            'BeginTime': mine.userData && mine.userData.startTime ? new Date(mine.userData.startTime).getTime() : 0,
                            'AnswerMode': 0,
                            'CostSeconds': 0,
                            'DoneCount': mine.userData && mine.userData.answeredCount ? mine.userData.answeredCount : 0,
                            'MaxScore': mine.maxUserData && mine.maxUserData.submitTime ? mine.maxUserData.score : undefined,
                            'resultCode': mine.lastUserData && mine.lastUserData.resultCode ? mine.lastUserData.resultCode.length > 10 ? mine.lastUserData.resultCode.substr(0, 10) + '...' : mine.lastUserData.resultCode : ''
                        },
                        'SubjectiveMarkStrategy': exam.subjectiveMarkStrategy
                    };
                    $.studying.loading.show();
                    var main = this.main = new __answer.Studying.ExamSingleAnswer();
                    main.init(config);
                    if ((main.store.data.UserExam.UserExamStatus < 8 || main.store.data.UserExam.UserExamStatus > 8) && main.store.data.UserExam.UserExamStatus != 112) {
                        main.store.prepare(config.CustomData).done(function (data) {
                            $.studying.loading.hide();
                            main.store.start();
                        });
                    } else {
                        $.studying.loading.hide();
                        main.store.data.UserExam.UserExamStatus == 8 ? main.store.continueAnswer() : main.store.start();
                    }
                };
                SingleModeExam.prototype._getUserQuestionAnswers = function (examId, sessionId, qids, success) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v2/m/exams/' + examId + '/sessions/' + sessionId + '/answers?resource_type=assessment_courseware_object',
                        type: 'POST',
                        enableToggleCase: false,
                        data: JSON.stringify(qids),
                        contentType: 'application/json;charset=utf-8',
                        success: success
                    });
                };
                SingleModeExam.prototype.goto = function (questionId) {
                    this.main.goto(questionId);
                };
                return SingleModeExam;
            }(__base.Studying.BaseWrapper);
            Bussiness.SingleModeExam = SingleModeExam;
        }(Bussiness = Studying.Bussiness || (Studying.Bussiness = {})));
    }(Studying = exports.Studying || (exports.Studying = {})));
});
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define('studying.bussiness.papermodeexam', [
    'require',
    'exports',
    'studying.enum',
    'studying.bussiness.base',
    'studying.exam.answer'
], function (require, exports, __enum, __base, __answer) {
    var Studying;
    (function (Studying) {
        var Bussiness;
        (function (Bussiness) {
            var PaperModeExam = function (_super) {
                __extends(PaperModeExam, _super);
                function PaperModeExam(config) {
                    _super.call(this, config);
                }
                PaperModeExam.prototype.init = function () {
                    var _this = this;
                    $.studying.loading.show();
                    this.main = null;
                    $.when(this.getExamInfo(), this.getMyExamInfo()).done(function (examData, mineData) {
                        var mine = mineData[0], examInfo = examData[0];
                        examInfo.beginTime = Date.ajustTimeString(examInfo.beginTime);
                        examInfo.endTime = Date.ajustTimeString(examInfo.endTime);
                        mine.beginTime = Date.ajustTimeString(mine.beginTime);
                        mine.endTime = Date.ajustTimeString(mine.endTime);
                        if (mine.userData && mine.userData.finishTime)
                            mine.userData.finishTime = Date.ajustTimeString(mine.userData.finishTime);
                        if (mine.userData && mine.userData.markTime)
                            mine.userData.markTime = Date.ajustTimeString(mine.userData.markTime);
                        if (mine.userData && mine.userData.startTime)
                            mine.userData.startTime = Date.ajustTimeString(mine.userData.startTime);
                        if (mine.userData && mine.userData.submitTime)
                            mine.userData.submitTime = Date.ajustTimeString(mine.userData.submitTime);
                        var answersData = [], defs = [], qids = [];
                        if (mine.status == 8 && mine.userData) {
                            Enumerable.from(mine.userData.ndrPaper.item.testParts[0].assessmentSections).forEach(function (value, index) {
                                qids = qids.concat($.map(value.sectionParts, function (spv, spi) {
                                    return spv.identifier;
                                }));
                            });
                            defs.push(_this.getUserQuestionAnswers(mine.examId, mine.sessionId, qids, function (answerData) {
                                if (answerData && answerData.length > 0)
                                    answersData = answersData.concat(answerData);
                            }));
                        }
                        $.when.apply({}, defs).done(function () {
                            _this.entryExam(mine, examInfo, answersData, []);
                        });
                    }).fail($.proxy(this.onError, this));
                };
                PaperModeExam.prototype.entryExam = function (mine, exam, answersData, analysisData) {
                    var _this = this;
                    var bussiness = this;
                    $.studying.loading.hide();
                    var config = {
                        'ElementSelector': this.config.envConfig.element,
                        'Host': this.config.host.mainHost,
                        'NoteServiceHost': this.config.host.noteServiceHost,
                        'QuestionBankServiceHost': this.config.host.questionBankServiceHost,
                        'UserId': this.config.envConfig.userId,
                        'ExamId': mine.examId,
                        'SessionId': mine.sessionId,
                        'CustomData': null,
                        'LocationSource': this.config.envConfig.locationSource,
                        'RankingUrl': this.config.host.rankingUrl ? this.config.host.rankingUrl : '',
                        'View': -1,
                        'QuestionScoreDict': {},
                        'Batches': [],
                        'Cells': [],
                        'Answers': [],
                        'ViewMode': 1,
                        'CurrentQuestionId': this.config.envConfig.currentQuestionId,
                        'Language': this.config.envConfig.language,
                        'TokenConfig': {
                            'NeedToken': this.config.envConfig.tokenConfig.needToken,
                            'OnGetToken': this.config.envConfig.tokenConfig.onGetToken
                        },
                        'controlOptions': {
                            'disableNavigatorJump': this.config.envConfig.displayOptions.disableNavigatorJump,
                            'hideNavigator': this.config.envConfig.displayOptions.hideNavigator,
                            'forceToAnswer': this.config.envConfig.answerOptions.forceToAnswer,
                            'showQuestionNum': this.config.envConfig.displayOptions.showQuestionNum,
                            'showGotoLearnButton': this.config.envConfig.displayOptions.showGotoLearnButton,
                            'showQuizButton': this.config.envConfig.displayOptions.showQuizButton,
                            'showCostTime': this.config.envConfig.displayOptions.showCostTime
                        },
                        'EventCallbacks': {
                            'onAnswerSaved': this.config.eventCallBack.onAnswerSaved,
                            'onAnswerChange': this.config.eventCallBack.onAnswerChange,
                            'onNumberChanged': this.config.eventCallBack.onNumberChanged,
                            'onLearnButtonClick': this.config.eventCallBack.onLearnButtonClick,
                            'onQuestionButtonClick': this.config.eventCallBack.onQuestionButtonClick
                        },
                        'Attachement': {
                            'Session': '',
                            'Url': '',
                            'Path': '',
                            'Server': '',
                            'DownloadUrlFormat': ''
                        },
                        'Paper': {
                            'Summary': '这里是考试说明预留字段',
                            'CompletionSeconds': mine.duration,
                            'QuestionCount': mine.questionCount,
                            'Score': mine.totalScore,
                            'Title': mine.name
                        },
                        'Exam': {
                            'Id': exam.id,
                            'Name': exam.title,
                            'LimitSeconds': exam.duration ? exam.duration * 1000 : null,
                            'BeginTime': new Date(exam.beginTime).getTime(),
                            'EndTime': exam.endTime && exam.endTime != '1970/01/01 08:00:00' ? new Date(exam.endTime).getTime() : __enum.Studying.ConstValue.MaxExamEndTime,
                            'Mode': 1,
                            'PassScore': exam.passingScore,
                            'Summary': exam.description ? exam.description : '',
                            'Chance': exam.examChance,
                            'ExamResultPageUrl': this.config.host.returnUrl,
                            'EnrollType': exam.enrollType,
                            'UploadAllowed': exam.uploadAllowed,
                            'SubType': exam.subType,
                            'rankingAble': exam.rankingAble,
                            'EnrollUrl': this.getEnrollUrl(mine.examId, location.href)
                        },
                        'UserExam': {
                            'AnswersData': answersData,
                            'UserEnroll': mine.userEnroll,
                            'AnalysisData': [],
                            'UserExamStatus': mine.status,
                            'BeginTime': mine.userData && mine.userData.startTime ? new Date(mine.userData.startTime).getTime() : 0,
                            'AnswerMode': 0,
                            'CostSeconds': 0,
                            'DoneCount': mine.userData && mine.userData.answeredCount ? mine.userData.answeredCount : 0,
                            'MaxScore': mine.maxUserData && mine.maxUserData.submitTime ? mine.maxUserData.score : undefined,
                            'resultCode': mine.lastUserData && mine.lastUserData.resultCode ? mine.lastUserData.resultCode.length > 10 ? mine.lastUserData.resultCode.substr(0, 10) + '...' : mine.lastUserData.resultCode : ''
                        },
                        'Parts': [],
                        'PartTitles': [],
                        'SubjectiveMarkStrategy': exam.subjectiveMarkStrategy,
                        'i18n': this.config.envConfig.i18n
                    };
                    var main = this.main = new __answer.Studying.ExamAnswer(config);
                    $(this.config.envConfig.prepareElement).examPrepare({
                        examId: config.ExamId,
                        bestScore: config.UserExam.MaxScore,
                        historyScoreUrl: this.config.host.historyScoreUrl + '?exam_id=' + this.config.envConfig.examId + '&location_source=' + this.config.envConfig.locationSource,
                        rankingUrl: this.config.envConfig.displayOptions.showRank ? this.config.host.rankingUrl + '?exam_id=' + this.config.envConfig.examId : '',
                        rank: this.config.envConfig.showRank,
                        customData: null,
                        remainingTryTimes: mine.examChance,
                        examChance: config.Exam.Chance,
                        analysisCondStatus: exam.analysisCondStatus,
                        analysisCondata: exam.analysisCondData,
                        examDetail: config.Exam.Summary,
                        quCount: config.Paper.QuestionCount,
                        score: config.Paper.Score,
                        passScore: config.Exam.PassScore,
                        completionSeconds: config.Paper.CompletionSeconds ? config.Paper.CompletionSeconds / 60 : null,
                        userExamStatus: config.UserExam.UserExamStatus,
                        examMode: config.Exam.Mode,
                        examBeginTime: config.Exam.BeginTime,
                        examEndTime: config.Exam.EndTime,
                        leavetime: config.Exam.LimitSeconds ? config.UserExam.BeginTime == 0 ? config.Exam.EndTime : config.UserExam.BeginTime + config.Exam.LimitSeconds > config.Exam.EndTime ? config.Exam.EndTime : config.UserExam.BeginTime + config.Exam.LimitSeconds : null,
                        title: config.Paper.Title,
                        i18n: this.config.envConfig.i18n.exam.prepare,
                        enrollType: config.Exam.EnrollType,
                        subType: config.Exam.SubType,
                        userEnrollType: config.UserExam.UserEnroll ? config.UserExam.UserEnroll.userEnrollType : null,
                        opinion: config.UserExam.UserEnroll ? config.UserExam.UserEnroll.opinion : null,
                        resultCode: config.UserExam.resultCode,
                        rankingAble: config.Exam.rankingAble,
                        favoriteHander: {
                            enableFavorite: this.config && this.config.favoriteHander && this.config.favoriteHander.enableFavorite || false,
                            addFavorites: this.config && this.config.favoriteHander && this.config.favoriteHander.addFavorites || null,
                            deleteFavorites: this.config && this.config.favoriteHander && this.config.favoriteHander.deleteFavorites || null,
                            checkFavorites: this.config && this.config.favoriteHander && this.config.favoriteHander.checkFavorites || null
                        },
                        onUpdateStatus: function () {
                            var _this = this;
                            var that = this;
                            window.setTimeout(function () {
                                bussiness.sendRequest({
                                    url: bussiness.config.host.mainHost + '/v1/m/exams/' + _this.config.envConfig.examId + '/mine',
                                    type: 'get'
                                }).done(function (resultData) {
                                    that.updateOptionData(resultData);
                                });
                            }, 2000);
                        },
                        enrollExam: function () {
                            location.href = _this.getEnrollUrl(mine.examId, location.href);
                        },
                        start: function (e, mode) {
                            switch (mode) {
                            case 1:
                                $.studying.loading.show();
                                main.init(config);
                                if (main.store.data.UserExam.UserExamStatus != 112) {
                                    main.store.prepare(config.CustomData).done(function (data) {
                                        $.studying.loading.hide();
                                        main.store.start();
                                        $(_this.config.envConfig.prepareElement).hide();
                                    }).fail($.proxy(_this.onError, _this));
                                } else {
                                    $.studying.loading.hide();
                                    main.store.start();
                                    $(_this.config.envConfig.prepareElement).hide();
                                }
                                break;
                            case 2:
                                $.studying.loading.show();
                                main.init(config);
                                main.store.continueAnswer().done(function (data) {
                                    $.studying.loading.hide();
                                    $(_this.config.envConfig.prepareElement).hide();
                                }).fail($.proxy(_this.onError, _this));
                                break;
                            }
                        },
                        end: function () {
                            main.dofinish(true, true);
                        }
                    });
                };
                PaperModeExam.prototype.getUserQuestionAnswers = function (examId, sessionId, qids, success) {
                    this.sendRequest({
                        url: this.config.host.mainHost + '/v2/m/exams/' + examId + '/sessions/' + sessionId + '/answers',
                        type: 'POST',
                        enableToggleCase: false,
                        data: JSON.stringify(qids),
                        contentType: 'application/json;charset=utf-8',
                        success: success
                    });
                };
                PaperModeExam.prototype.goto = function (number) {
                    this.main.goto(number);
                };
                return PaperModeExam;
            }(__base.Studying.BaseWrapper);
            Bussiness.PaperModeExam = PaperModeExam;
        }(Bussiness = Studying.Bussiness || (Studying.Bussiness = {})));
    }(Studying = exports.Studying || (exports.Studying = {})));
});
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define('studying.bussiness.analysispapermodeexam', [
    'require',
    'exports',
    'studying.bussiness.base',
    'studying.exam.answer'
], function (require, exports, __base, __answer) {
    var Studying;
    (function (Studying) {
        var Bussiness;
        (function (Bussiness) {
            var AnalysisPaperModeExam = function (_super) {
                __extends(AnalysisPaperModeExam, _super);
                function AnalysisPaperModeExam(config) {
                    _super.call(this, config);
                }
                AnalysisPaperModeExam.prototype.init = function () {
                    var _this = this;
                    $.studying.loading.show();
                    $.when(this.getExamInfo(), this.getMyExamInfo()).done(function (examData, mineData) {
                        var mineInfo = mineData[0], examInfo = examData[0];
                        if (examInfo.title.length > 0)
                            document.title = examInfo.title;
                        examInfo.beginTime = Date.ajustTimeString(examInfo.beginTime);
                        examInfo.endTime = Date.ajustTimeString(examInfo.endTime);
                        mineInfo.beginTime = Date.ajustTimeString(mineInfo.beginTime);
                        mineInfo.endTime = Date.ajustTimeString(mineInfo.endTime);
                        if (mineInfo.userData && mineInfo.userData.finishTime)
                            mineInfo.userData.finishTime = Date.ajustTimeString(mineInfo.userData.finishTime);
                        if (mineInfo.userData && mineInfo.userData.markTime)
                            mineInfo.userData.markTime = Date.ajustTimeString(mineInfo.userData.markTime);
                        if (mineInfo.userData && mineInfo.userData.startTime)
                            mineInfo.userData.startTime = Date.ajustTimeString(mineInfo.userData.startTime);
                        if (mineInfo.userData && mineInfo.userData.submitTime)
                            mineInfo.userData.submitTime = Date.ajustTimeString(mineInfo.userData.submitTime);
                        var answersData = [], analysisData = [], defs = [], qids = [], aqids = [];
                        Enumerable.from(mineInfo.userData.ndrPaper.item.testParts[0].assessmentSections).forEach(function (value, index) {
                            qids = qids.concat($.map(value.sectionParts, function (spv, spi) {
                                return spv.identifier;
                            }));
                            aqids = aqids.concat($.map(value.sectionParts, function (spv, spi) {
                                return spv.type == 'assessment_courseware_object' ? null : spv.identifier;
                            }));
                            defs.push(_this.getUserQuestionAnswers(_this.config.envConfig.examId, _this.config.envConfig.sessionId, qids, function (answerData) {
                                if (answerData && answerData.length > 0)
                                    answersData = answersData.concat(answerData);
                            }, $.proxy(_this.onError, _this)));
                            defs.push(_this.getQuestionAnalysis(_this.config.envConfig.examId, _this.config.envConfig.sessionId, aqids, function (returnData) {
                                if (returnData && returnData.length > 0)
                                    analysisData = analysisData.concat(returnData);
                            }, $.proxy(_this.onError, _this)));
                        });
                        $.when.apply(_this, defs).done(function () {
                            _this.entryExam(mineInfo, examInfo, answersData, analysisData);
                        });
                    });
                };
                AnalysisPaperModeExam.prototype.entryExam = function (mine, exam, answersData, analysisData) {
                    var _this = this;
                    $.studying.loading.hide();
                    var config = {
                        ElementSelector: this.config.envConfig.element,
                        Host: this.config.host.mainHost,
                        'NoteServiceHost': this.config.host.noteServiceHost,
                        'QuestionBankServiceHost': this.config.host.questionBankServiceHost,
                        'UserId': this.config.envConfig.userId,
                        'Token': this.config.envConfig.token,
                        ExamId: mine.examId,
                        SessionId: this.config.envConfig.sessionId,
                        LocationSource: this.config.envConfig.locationSource,
                        View: -1,
                        QuestionScoreDict: {},
                        Batches: [],
                        Cells: [],
                        Answers: [],
                        ViewMode: 2,
                        'TokenConfig': {
                            'NeedToken': this.config.envConfig.tokenConfig.needToken,
                            'OnGetToken': this.config.envConfig.tokenConfig.onGetToken
                        },
                        'controlOptions': {
                            'disableNavigatorJump': this.config.envConfig.displayOptions.disableNavigatorJump,
                            'hideNavigator': this.config.envConfig.displayOptions.hideNavigator,
                            'showQuestionNum': this.config.envConfig.displayOptions.showQuestionNum,
                            'showGotoLearnButton': this.config.envConfig.displayOptions.showGotoLearnButton,
                            'showQuizButton': this.config.envConfig.displayOptions.showQuizButton
                        },
                        'EventCallbacks': {
                            'onLearnButtonClick': this.config.eventCallBack.onLearnButtonClick,
                            'onQuestionButtonClick': this.config.eventCallBack.onQuestionButtonClick
                        },
                        Attachement: {
                            Session: '',
                            Url: '',
                            Path: '',
                            Server: '',
                            DownloadUrlFormat: ''
                        },
                        Paper: {
                            'Summary': '这里是考试说明预留字段',
                            'CompletionSeconds': mine.duration,
                            'QuestionCount': mine.questionCount,
                            'Score': mine.totalScore,
                            'Title': mine.name
                        },
                        Exam: {
                            'Id': exam.id,
                            'Name': exam.title,
                            'LimitSeconds': exam.duration * 1000,
                            'BeginTime': new Date(exam.beginTime).getTime(),
                            'EndTime': new Date(exam.endTime).getTime(),
                            'Mode': 1,
                            'PassScore': exam.passingScore,
                            'Summary': exam.description ? exam.description : '',
                            'Chance': mine.examChance,
                            'ExamResultPageUrl': this.config.host.returnUrl,
                            'UploadAllowed': exam.uploadAllowed,
                            'SubType': exam.subType
                        },
                        UserExam: {
                            'AnswersData': answersData,
                            'AnalysisData': analysisData,
                            'UserExamStatus': mine.status,
                            'BeginTime': mine.userData && mine.userData.startTime ? new Date(mine.userData.startTime).getTime() : 0,
                            'AnswerMode': 0,
                            'CostSeconds': 0,
                            'DoneCount': mine.userData && mine.userData.answeredCount ? mine.userData.answeredCount : 0
                        },
                        Parts: [],
                        PartTitles: [],
                        'SubjectiveMarkStrategy': exam.subjectiveMarkStrategy,
                        i18n: this.config.envConfig.i18n
                    };
                    var main = new __answer.Studying.ExamAnswer(config);
                    $.studying.loading.show();
                    main.init(config);
                    main.store.viewAnalysis().done(function (data) {
                        $.studying.loading.hide();
                        $(_this.config.envConfig.prepareElement).hide();
                        $(_this.config.envConfig.element).show();
                    });
                };
                AnalysisPaperModeExam.prototype.getUserQuestionAnswers = function (examId, sessionId, qids, success, error) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v2/m/exams/' + examId + '/sessions/' + sessionId + '/answers?resource_type=assessment_courseware_object',
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(qids),
                        enableToggleCase: false,
                        contentType: 'application/json;charset=utf-8',
                        success: success,
                        error: error
                    });
                };
                AnalysisPaperModeExam.prototype.getQuestionAnalysis = function (examId, sessionId, qids, success, error) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v2/m/exams/' + examId + '/sessions/' + sessionId + '/analysis',
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(qids),
                        contentType: 'application/json;',
                        uccess: success,
                        error: error
                    });
                };
                return AnalysisPaperModeExam;
            }(__base.Studying.BaseWrapper);
            Bussiness.AnalysisPaperModeExam = AnalysisPaperModeExam;
        }(Bussiness = Studying.Bussiness || (Studying.Bussiness = {})));
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.bussiness.ranking', [
    'require',
    'exports'
], function (require, exports) {
    var Studying;
    (function (Studying) {
        var Bussiness;
        (function (Bussiness) {
            var RankingPage = function () {
                function RankingPage(config) {
                    this.config = {
                        i18n: null,
                        host: { mainHost: 'http://' + window.location.host + '/' },
                        data: {
                            examId: 0,
                            userId: 0,
                            token: '',
                            language: 'zh-CN',
                            element: '#ranking',
                            tokenConfig: {
                                needToken: false,
                                onGetToken: function () {
                                }
                            }
                        }
                    };
                    $.extend(this.config, config);
                }
                RankingPage.prototype.init = function () {
                    $('#ranking').ranking({
                        host: this.config.host.mainHost,
                        examId: this.config.data.examId,
                        userId: this.config.data.userId,
                        language: this.config.data.language,
                        i18n: this.config.i18n.exam.ranking,
                        tokenConfig: {
                            needToken: this.config.data.tokenConfig.needToken,
                            onGetToken: this.config.data.tokenConfig.onGetToken
                        }
                    });
                };
                return RankingPage;
            }();
            Bussiness.RankingPage = RankingPage;
        }(Bussiness = Studying.Bussiness || (Studying.Bussiness = {})));
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.bussiness.history', [
    'require',
    'exports',
    'studying.helper'
], function (require, exports, __helper) {
    var Studying;
    (function (Studying) {
        var Bussiness;
        (function (Bussiness) {
            var HistoryPage = function () {
                function HistoryPage(config) {
                    this.config = {
                        i18n: null,
                        'host': {
                            'mainHost': 'http://' + window.location.host + '/',
                            'analysisUrl': 'http://' + window.location.host + '/',
                            'examResultUrl': 'http://' + window.location.host + '/'
                        },
                        data: {
                            'element': '#history',
                            'examId': '',
                            'userId': '',
                            'locationSource': 4,
                            'language': 'zh-CN',
                            'tokenConfig': {
                                'needToken': false,
                                'onGetToken': function () {
                                }
                            }
                        }
                    };
                    $.extend(this.config, config);
                }
                HistoryPage.prototype.init = function () {
                    var _this = this;
                    var examId = this.config.data.examId, userId = this.config.data.userId;
                    $.when(this.getExam(examId), this.getMine(examId), this.getHistorys(examId, userId), this.getServerTime()).done(function (examData, mineData, historyData, serverTimeData) {
                        $.studying.loading.hide();
                        var exam = examData[0], historys = historyData[0], serverTime = serverTimeData[0], mine = mineData[0];
                        $(_this.config.data.element).history({
                            host: _this.config.host.analysisUrl,
                            i18n: _this.config.i18n.exam.history,
                            data: {
                                'exam': {
                                    'locationSource': _this.config.data.locationSource,
                                    'title': exam.title,
                                    'duration': exam.duration,
                                    'chance': exam.examChance,
                                    'passingScore': exam.passingScore,
                                    'totalScore': exam.totalScore,
                                    'bestScore': mine.maxUserData && mine.maxUserData.submitTime ? mine.maxUserData.score : 0,
                                    'subType': mine.subType,
                                    'examResultUrl': _this.config.host.examResultUrl
                                },
                                'items': historys
                            }
                        });
                    });
                };
                HistoryPage.prototype.getHistorys = function (examId, userId) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v1/m/exams/' + examId + '/users/' + userId + '/history',
                        type: 'get'
                    });
                };
                HistoryPage.prototype.getMine = function (examId) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v1/m/exams/' + examId + '/mine',
                        type: 'get'
                    });
                };
                HistoryPage.prototype.getExam = function (examId) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v1/exams/' + examId,
                        type: 'get'
                    });
                };
                HistoryPage.prototype.getServerTime = function () {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v1/m/other/date',
                        type: 'get'
                    });
                };
                HistoryPage.prototype.sendRequest = function (datas) {
                    var _this = this;
                    var that = this;
                    var obj = $.extend({
                        type: 'get',
                        dataType: 'json',
                        requestCase: 'snake',
                        reponseCase: 'camel',
                        enableToggleCase: true,
                        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                        traditional: true,
                        beforeSend: function (xhr) {
                            if (_this.config.data.tokenConfig.needToken) {
                                var buff = __helper.Studying.HelperMethods.ResolveHost(obj.url);
                                var mac = {
                                    'method': obj.type,
                                    'path': buff.path,
                                    'host': buff.host
                                };
                                var tokenInfo = _this.config.envConfig.tokenConfig.onGetToken(mac);
                                xhr.setRequestHeader('Authorization', tokenInfo['Authorization']);
                                if (obj.type.toLowerCase() != 'get')
                                    xhr.setRequestHeader('X-Gaea-Authorization', tokenInfo['X-Gaea-Authorization']);
                            }
                            if (_this.config.language)
                                xhr.setRequestHeader('Accept-Language', decodeURIComponent(_this.config.data.language));
                        }
                    }, datas);
                    if (obj.type.toLowerCase() == 'get') {
                        obj.url = __helper.Studying.HelperMethods.GenUrlEandRom(obj.url);
                    }
                    return $.ajax(obj).fail(function () {
                        if ($.studying.loading && $.isFunction($.studying.loading.hide)) {
                            $.studying.loading.hide();
                        }
                    });
                };
                return HistoryPage;
            }();
            Bussiness.HistoryPage = HistoryPage;
        }(Bussiness = Studying.Bussiness || (Studying.Bussiness = {})));
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.bussiness.endpage', [
    'require',
    'exports',
    'studying.helper'
], function (require, exports, __helper) {
    var Studying;
    (function (Studying) {
        var Bussiness;
        (function (Bussiness) {
            var EndPage = function () {
                function EndPage(config) {
                    this.config = {
                        i18n: null,
                        host: {
                            mainHost: 'http://' + window.location.host + '/',
                            analysisUrl: '',
                            restartUrl: '',
                            rankingUrl: ''
                        },
                        data: {
                            element: '#end',
                            language: 'zh-CN',
                            examId: '',
                            sessionId: '',
                            showRank: false,
                            'tokenConfig': {
                                'needToken': false,
                                'onGetToken': function () {
                                }
                            }
                        }
                    };
                    $.extend(this.config, config);
                }
                EndPage.prototype.init = function () {
                    var _this = this;
                    $.studying.loading.show();
                    var examId = this.config.data.examId, sessionId = this.config.data.sessionId;
                    $.when(this.getExamInfo(examId), this.getMyInfo(examId, sessionId)).done(function (mineData, sessionData) {
                        $.studying.loading.hide();
                        var urlOrNot = false;
                        mineData = mineData[0], sessionData = sessionData[0];
                        mineData.beginTime = Date.ajustTimeString(mineData.beginTime);
                        mineData.endTime = Date.ajustTimeString(mineData.endTime);
                        if (mineData.userData && mineData.userData.finishTime)
                            mineData.userData.finishTime = Date.ajustTimeString(mineData.userData.finishTime);
                        if (mineData.userData && mineData.userData.markTime)
                            mineData.userData.markTime = Date.ajustTimeString(mineData.userData.markTime);
                        if (mineData.userData && mineData.userData.startTime)
                            mineData.userData.startTime = Date.ajustTimeString(mineData.userData.startTime);
                        if (mineData.userData && mineData.userData.submitTime)
                            mineData.userData.submitTime = Date.ajustTimeString(mineData.userData.submitTime);
                        if (sessionData.userData.resultUrl) {
                            urlOrNot = true;
                            var detailUrl = sessionData.userData.resultUrl + '?result_code=' + sessionData.userData.resultCode;
                        }
                        var config = {
                            i18n: _this.config.i18n.exam.end,
                            rankingUrl: _this.config.host.rankingUrl,
                            rank: _this.config.data.showRank ? 1 : 0,
                            title: mineData.name,
                            analysisUrl: _this.config.host.analysisUrl,
                            restartUrl: _this.config.host.restartUrl,
                            customId: 0,
                            customTypeUrl: '',
                            data: {
                                examId: _this.config.data.examId,
                                sessionId: _this.config.data.sessionId,
                                userData: {
                                    answeredCount: mineData.userData.answeredCount,
                                    score: mineData.userData && mineData.userData.markTime ? mineData.userData.score : mineData.userData.objectiveScore,
                                    startTime: mineData.userData.startTime,
                                    finishTime: mineData.userData.finishTime,
                                    submitTime: mineData.userData.submitTime,
                                    markTime: mineData.userData.markTime,
                                    examChance: mineData.userData.examChance,
                                    resultText: sessionData.userData.resultText ? sessionData.userData.resultText : '',
                                    resultCode: sessionData.userData.resultCode,
                                    urlOrNot: urlOrNot,
                                    detailUrl: detailUrl
                                },
                                status: mineData.status,
                                name: mineData.name,
                                questionCount: mineData.questionCount,
                                totalScore: mineData.totalScore,
                                passingScore: mineData.passingScore,
                                duration: mineData.duration,
                                beginTime: mineData.beginTime,
                                endTime: mineData.endTime,
                                examChance: mineData.examChance,
                                description: mineData.description,
                                analysisAllowed: mineData.analysisAllowed,
                                subType: mineData.subType,
                                rankingAble: mineData.rankingAble
                            }
                        };
                        $(_this.config.data.element).end(config);
                    });
                };
                EndPage.prototype.getExamInfo = function (examId) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v1/m/exams/' + examId + '/mine',
                        type: 'GET'
                    });
                };
                EndPage.prototype.getMyInfo = function (examId, sessionId) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v1/m/exams/' + examId + '/sessions/' + sessionId,
                        type: 'GET'
                    });
                };
                EndPage.prototype.sendRequest = function (datas) {
                    var _this = this;
                    var that = this;
                    var obj = $.extend({
                        type: 'get',
                        dataType: 'json',
                        requestCase: 'snake',
                        reponseCase: 'camel',
                        enableToggleCase: true,
                        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                        traditional: true,
                        beforeSend: function (xhr) {
                            if (_this.config.data.tokenConfig.needToken) {
                                var buff = __helper.Studying.HelperMethods.ResolveHost(obj.url);
                                var mac = {
                                    'method': obj.type,
                                    'path': buff.path,
                                    'host': buff.host
                                };
                                var tokenInfo = _this.config.envConfig.tokenConfig.onGetToken(mac);
                                xhr.setRequestHeader('Authorization', tokenInfo['Authorization']);
                                if (obj.type.toLowerCase() != 'get')
                                    xhr.setRequestHeader('X-Gaea-Authorization', tokenInfo['X-Gaea-Authorization']);
                            }
                            if (_this.config.language)
                                xhr.setRequestHeader('Accept-Language', decodeURIComponent(_this.config.language));
                        }
                    }, datas);
                    if (obj.type.toLowerCase() == 'get') {
                        obj.url = __helper.Studying.HelperMethods.GenUrlEandRom(obj.url);
                    }
                    return $.ajax(obj).fail(function () {
                        if ($.studying.loading && $.isFunction($.studying.loading.hide)) {
                            $.studying.loading.hide();
                        }
                    });
                };
                return EndPage;
            }();
            Bussiness.EndPage = EndPage;
        }(Bussiness = Studying.Bussiness || (Studying.Bussiness = {})));
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.exam.factory', [
    'require',
    'exports',
    'studying.bussiness.singlemodeexam',
    'studying.bussiness.papermodeexam',
    'studying.bussiness.analysispapermodeexam',
    'studying.bussiness.ranking',
    'studying.bussiness.history',
    'studying.bussiness.endpage'
], function (require, exports, __singlemode, __papermode, __papermodeAnalsysis, __ranking, __history, __endpage) {
    var Studying;
    (function (Studying) {
        var ExamBussinessFactory = function () {
            function ExamBussinessFactory() {
            }
            ExamBussinessFactory.CreatePaperModeExam = function (config) {
                return new __papermode.Studying.Bussiness.PaperModeExam(config);
            };
            ExamBussinessFactory.CreateAnalysisPaperModeExam = function (config) {
                return new __papermodeAnalsysis.Studying.Bussiness.AnalysisPaperModeExam(config);
            };
            ExamBussinessFactory.CreateSingleModeExam = function (config) {
                return new __singlemode.Studying.Bussiness.SingleModeExam(config);
            };
            ExamBussinessFactory.CreateRankingPage = function (config) {
                return new __ranking.Studying.Bussiness.RankingPage(config);
            };
            ExamBussinessFactory.CreateHistoryPage = function (config) {
                return new __history.Studying.Bussiness.HistoryPage(config);
            };
            ExamBussinessFactory.CreateEndPage = function (config) {
                return new __endpage.Studying.Bussiness.EndPage(config);
            };
            return ExamBussinessFactory;
        }();
        Studying.ExamBussinessFactory = ExamBussinessFactory;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.exam.main', [
    'require',
    'util',
    'jstimer',
    'swftimer',
    'timer',
    'studying.explain',
    'studying.judge',
    'studying.loading',
    'studying.message',
    'studying.navigator',
    'studying.navigatorstat',
    'studying.option',
    'studying.qtiquestion',
    'studying.completion',
    'studying.subjective',
    'studying.answer',
    'studying.enum',
    'studying.loader',
    'studying.store',
    'studying.updater',
    'studying.header',
    'studying.parts',
    'studying.exception',
    'studying.prepare',
    'studying.end',
    'studying.ranking',
    'studying.history',
    'studying.exam.answer',
    'studying.exam.singleanswer',
    'studying.exam.store',
    'studying.exam.factory',
    'studying.bussiness.base',
    'studying.bussiness.singlemodeexam',
    'studying.bussiness.papermodeexam',
    'studying.bussiness.analysispapermodeexam',
    'studying.bussiness.ranking',
    'studying.bussiness.history',
    'studying.bussiness.endpage',
    'studying.helper'
], function (require, factory) {
    'use strict';
    window.console && console.log('main.js');
});