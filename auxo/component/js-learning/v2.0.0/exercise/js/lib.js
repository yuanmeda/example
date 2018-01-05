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
    var tmpl = '<div class="test-ready">    <!--ko if:!$root.mobileOrNot()-->    <div class="test-ready-hd">        <h3 data-bind="text:tiltle"></h3>        <p data-bind="text: $root.OverView(totalCount())"></p>    </div>    <div class="test-ready-bd">        <div class="test-ready-pro" data-bind="visible:isFirst">            <a href="javascript:;" class="test-start-btn" data-mode="1" data-bind="text: $root.i18n.startAnswer"></a>        </div>        <div class="test-once" data-bind="visible:!isFirst()">            <p data-bind="visible:hasBestUserResult"><span data-bind="text: $root.i18n.bestScoreCaption"></span><span><span data-bind="text: $root.i18n.right"></span><em data-bind="text:correctCount"></em><span data-bind="text: $root.i18n.question"></span></span><span><span data-bind="text: $root.i18n.error"></span><b data-bind="text:wrongCount"></b><span data-bind="text: $root.i18n.question"></span></span><span><span data-bind="text: $root.i18n.noAnswer"></span><b data-bind="text:unDoneCount"></b><span data-bind="text: $root.i18n.question"></span></span><span><span data-bind="text: $root.i18n.accuracy"></span><strong data-bind="text:correctRate()+\'%\'"></strong></span></p>            <div class="test-ready-btns" data-bind="visible:isFinished">                <a href="javascript:;" class="solve-btn" data-mode="100"></a><a href="javascript:;" class="restart-btn" data-mode="2"></a>            </div>            <div class="test-ready-btns" data-bind="visible:!isFinished()">                <a href="javascript:;" class="with-btn" data-mode="3"></a>            </div>        </div>    </div>    <!-- /ko -->    <!--ko if:$root.mobileOrNot()-->    <div class="test-enter-con">        <div class="testpaper-info text-center" style="border: none;">            <span class="fail-message" data-bind="text: $root.i18n.toMobile"></span>        </div>    </div>    <!-- /ko --></div>        ';
    $.widget('studying.prepare', {
        options: {
            tiltle: '',
            totalCount: 130,
            correctCount: 0,
            correctRate: 10,
            wrongCount: 0,
            unDoneCount: 0,
            hasBestUserResult: false,
            isFirst: false,
            isFinished: false,
            onBtnClick: function (e, mode) {
            },
            mobileOrNot: !!window.navigator.userAgent.match(/AppleWebKit.*Mobile.*/),
            i18n: {
                totalQuestion: '本练习共 {{totalCount}} 题',
                startAnswer: '开始练习',
                bestScoreCaption: '最好成绩\uFF1A',
                right: '答对',
                question: '题',
                error: '答错',
                noAnswer: '未答',
                accuracy: '正确率'
            }
        },
        _init: function () {
            this.element.html(tmpl);
            this.options.correctRate = this.options.correctRate <= 1 ? (this.options.correctRate * 100).toFixed(0) : this.options.correctRate.toFixed(0);
            var vm = ko.mapping.fromJS(this.options);
            vm.OverView = function (totalCount) {
                var temp = ko.utils.unwrapObservable(this.i18n.totalQuestion);
                temp = temp.replace('{{totalCount}}', totalCount);
                return temp;
            };
            this._inner = $('.test-ready', this.element);
            ko.applyBindings(vm, this._inner[0]);
            $('.test-ready-bd a').click($.proxy(this.btnClick, this));
        },
        btnClick: function (e) {
            var target = $(e.target);
            var mode = parseInt(target.data('mode'));
            if (!mode) {
                mode = 1;
            }
            this._trigger('onBtnClick', null, mode);
        }
    });
}(jQuery));
define('studying.prepare', [], function () {
    return;
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
define('studying.exercise.store', [
    'require',
    'exports',
    'studying.store',
    'studying.enum'
], function (require, exports, __store, __enum) {
    var Studying;
    (function (Studying) {
        var ExerciseStore = function (_super) {
            __extends(ExerciseStore, _super);
            function ExerciseStore(data) {
                _super.call(this, data);
                this.updateLeavetime();
            }
            ExerciseStore.prototype.updateLeavetime = function () {
                this.data.leavetime = this.data.Exercise.LimitSeconds ? this.data.UserExam.BeginTime == 0 ? this.data.Exercise.EndTime : this.data.UserExam.BeginTime + this.data.Exercise.LimitSeconds > this.data.Exercise.EndTime ? this.data.Exercise.EndTime : this.data.UserExam.BeginTime + this.data.Exercise.LimitSeconds : null;
            };
            ExerciseStore.prototype._buildCellBatch = function () {
                var cells = [], currentBatchIndex = this.getCurrentBatchIndex(), currentBatch = this.data.Batches[currentBatchIndex], currentBatchLen = currentBatch.length, currentQuestionId = this.data.CurrentQuestionId, limit = 20, ids = [], currentQuestionIdIndex = 0;
                if (currentBatchLen > limit) {
                    for (var i = 0; i < currentBatchLen; i++) {
                        if (currentQuestionId == currentBatch[i]) {
                            currentQuestionIdIndex = i;
                            break;
                        }
                    }
                    for (var j = currentQuestionIdIndex, z = 0; j < currentBatchLen && z < limit; j++, z++) {
                        ids.push(currentBatch[j]);
                    }
                } else {
                    ids = ids.concat(currentBatch);
                }
                for (var i = 0, length = ids.length; i < length; i++) {
                    var item = this.loader.get(ids[i]);
                    if (item)
                        cells.push(item);
                }
                return cells;
            };
            ExerciseStore.prototype._submit = function (cells) {
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
                    var cell = c;
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
                    reponseCase: 'camel',
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
                return def;
            };
            ExerciseStore.prototype._mark = function (cells) {
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
            ExerciseStore.prototype._getAnswerScore = function (id, state, index) {
                if (state == 'FAILED' || state == 'INCOMPLETE')
                    return 0;
                var scores = Enumerable.from(this.data.QuestionScoreDict).where('$.id==\'' + id + '\'').toArray();
                if (scores && scores.length > 0) {
                    return scores[0].scores[index].score;
                }
                return 0;
            };
            ExerciseStore.prototype._getAnswerState = function (state) {
                switch (state) {
                case 'FAILED':
                    return 7;
                case 'PASSED':
                    return 5;
                case 'INCOMPLETE':
                    return 0;
                }
            };
            ExerciseStore.prototype._checkSubmit = function (cells) {
                return cells.length >= 1;
            };
            ExerciseStore.prototype.prepare = function (customData) {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.PrepareUrl ? this.data.ApiRequestUrls.PrepareUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/prepare',
                    type: 'POST',
                    data: JSON.stringify({ custom_data: customData ? customData : null }),
                    contentType: 'application/json;',
                    dataType: 'json'
                }).done(function (data) {
                    _this._initData(data, 1);
                    if (_this.data.EventCallbacks && _this.data.EventCallbacks.onPrepared && $.isFunction(_this.data.EventCallbacks.onPrepared))
                        _this.data.EventCallbacks.onPrepared.call(_this, data);
                });
            };
            ExerciseStore.prototype.start = function () {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.StartUrl ? this.data.ApiRequestUrls.StartUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/start',
                    type: 'POST'
                }).done(function (data) {
                    _this._updateExamInfo(data);
                    _this.doMerageAnswer();
                    if (_this.data.EventCallbacks && _this.data.EventCallbacks.onStarted && $.isFunction(_this.data.EventCallbacks.onStarted))
                        _this.data.EventCallbacks.onStarted.call(_this, data);
                });
            };
            ExerciseStore.prototype._updateExamInfo = function (data) {
                var beginTime = new Date(this._insert(data.userData.startTime, data.userData.startTime.indexOf('+') + 2, ':')).getTime();
                var finishedTime = data.userData.finishTime ? new Date(this._insert(data.userData.finishTime, data.userData.finishTime.indexOf('+') + 2, ':')).getTime() : 0;
                this.data.UserExam.BeginTime = beginTime;
                this.data.UserExam.CostSeconds = finishedTime > 0 ? (finishedTime - beginTime) / 1000 : 0;
                this.updateLeavetime();
            };
            ExerciseStore.prototype._insert = function (value, ofset, subStr) {
                if (ofset < 0 || ofset >= value.length - 1)
                    return this.append(subStr);
                return value.substring(0, ofset + 1) + subStr + value.substring(ofset + 1);
            };
            ExerciseStore.prototype.restart = function () {
                var _this = this;
                this.prepare().done(function (data) {
                    _this.start();
                });
            };
            ExerciseStore.prototype.end = function () {
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
            ExerciseStore.prototype.continueAnswer = function () {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.SessionDataUrl ? this.data.ApiRequestUrls.SessionDataUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId,
                    type: 'GET'
                }).done(function (data) {
                    _this._initData(data, 2);
                    _this.doMerageAnswer();
                });
            };
            ExerciseStore.prototype.viewAnalysis = function () {
                var _this = this;
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.SessionDataUrl ? this.data.ApiRequestUrls.SessionDataUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId,
                    type: 'GET'
                }).done(function (data) {
                    _this._initData(data, 3);
                    _this.doMerageAnswer();
                });
            };
            ExerciseStore.prototype._initData = function (data, type) {
                var that = this;
                var parts = Enumerable.from(data.userData.ndrPaper.item.testParts[0].assessmentSections).toArray();
                var questionIds = [], defs = [];
                this.data.SessionId = data.sessionId;
                this.data.Cells = [];
                this.data.Batches = [];
                this.data.Exercise.Title = data.userData.ndrPaper.title;
                this.data.Exercise.Score = data.userData.ndrPaper.totalScore;
                if (this.data.wrongBookParams) {
                    this.data.wrongBookParams.session_id = data.sessionId;
                }
                Enumerable.from(parts).forEach(function (value, index) {
                    var questionIdArray = [];
                    Enumerable.from(value.sectionParts).forEach(function (s, i) {
                        that.data.Cells.push({
                            Id: s.identifier,
                            Result: null
                        });
                        questionIdArray.push(s.identifier);
                    });
                    that.data.Batches.push(questionIdArray);
                    questionIds = questionIds.concat(questionIdArray);
                });
                if (type == 3) {
                    if (!that.data.UserExam.AnswersData || that.data.UserExam.AnswersData.length <= 0) {
                        this._getUserQuestionAnswers(questionIds).done(function (answerData) {
                            if (answerData && answerData.length > 0)
                                that.data.UserExam.AnswersData = that.data.UserExam.AnswersData.concat(answerData);
                        });
                    }
                    if (!this.data.UserExam.AnalysisData || this.data.UserExam.AnalysisData.length <= 0) {
                        this._getQuestionAnalysis(questionIds).done(function (analysisData) {
                            if (analysisData && analysisData.length > 0)
                                that.data.UserExam.AnalysisData = that.data.UserExam.AnalysisData.concat(analysisData);
                        });
                    }
                }
                if (type == 2) {
                    $.when(that._getUserQuestionAnswers(questionIds)).done(function (answerData) {
                        if (answerData && answerData.length > 0) {
                            that.data.UserExam.AnswersData = that.data.UserExam.AnswersData.concat(answerData);
                            if (that.data.Exercise.Mode == __enum.Studying.AnswerMode.ExericseSingleCommit) {
                                that.data.Exercise.CommitQuestions = $.map(answerData, function (item, index) {
                                    return item.id;
                                });
                            }
                        }
                    });
                }
                this.QuestionIds = questionIds;
                this._getUploadInfo().done(function (userReasonInfo) {
                    userReasonInfo = userReasonInfo[0];
                    that.data.UserExam.ErrorReasons = userReasonInfo;
                });
                if (this.getControlOption('enableQuestionBank') != false && this.data.Exercise.Mode != __enum.Studying.AnswerMode.Test && this.data.Exercise.Mode != __enum.Studying.AnswerMode.Exercise) {
                    this.getErrorReasons().done(function (userReasonInfo) {
                        that.data.UserExam.ErrorReasons = userReasonInfo;
                    });
                }
                this.data.UserExam.DoneCount = data.userData.answeredCount;
            };
            ExerciseStore.prototype._getPaperInfo = function (paperId) {
                return this._sendRequest({ url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.PapersUrl ? this.data.ApiRequestUrls.PapersUrl : this.data.Host + '/v1/exams/' + this.data.ExamId + '/papers' });
            };
            ExerciseStore.prototype._getUploadInfo = function () {
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.UploadUrl ? this.data.ApiRequestUrls.UploadUrl : this.data.Host + '/v1/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/upload',
                    type: 'GET',
                    async: false
                });
            };
            ExerciseStore.prototype._getUserQuestionAnswers = function (qids, success) {
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
            ExerciseStore.prototype._getQuestionAnalysis = function (qids, success) {
                return this._sendRequest({
                    url: this.data.ApiRequestUrls && this.data.ApiRequestUrls.AnalysisUrl ? this.data.ApiRequestUrls.AnalysisUrl : this.data.Host + '/v2/m/exams/' + this.data.ExamId + '/sessions/' + this.data.SessionId + '/analysis',
                    type: 'POST',
                    data: JSON.stringify(qids),
                    contentType: 'application/json;',
                    async: false,
                    traditional: true,
                    success: success
                });
            };
            ExerciseStore.prototype._getQuestionsBody = function () {
                return _super.prototype.getQuestionsBody.call(this);
            };
            ExerciseStore.prototype._removeUnknownOrNotSupportQuestion = function () {
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
                        if (!icell) {
                            v.splice(j, 1);
                            v.length <= 0 && this.data.Batches.splice(i, 1);
                        }
                        if (notSupported) {
                            ci >= 0 && this.data.Cells.splice(ci, 1);
                            v.splice(j, 1);
                            v.length <= 0 && this.data.Batches.splice(i, 1);
                        }
                    }
                }
            };
            ExerciseStore.prototype._isSupportQuestionType = function (question) {
                return true;
            };
            ExerciseStore.prototype._diff = function (a, b) {
                return a.filter(function (i) {
                    return b.indexOf(i) < 0;
                });
            };
            ExerciseStore.prototype.doMerageAnswer = function () {
                var _this = this;
                $.when(this._getQuestionsBody(), this._mergeLocalAnswer()).done(function () {
                    _this._removeUnknownOrNotSupportQuestion();
                    _this._initQuestionCells();
                    _this.setInited();
                });
            };
            ExerciseStore.prototype._mergeLocalAnswer = function () {
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
            ExerciseStore.prototype._initQuestionCells = function () {
                var _this = this;
                var cells = Enumerable.from(this.data.Cells).select(function (c) {
                    var answer = Enumerable.from(_this.data.UserExam.AnswersData).where('$.id == \'' + c.Id + '\'').toArray()[0];
                    var analysis = Enumerable.from(_this.data.UserExam.AnalysisData).where('$.id == \'' + c.Id + '\'').toArray()[0];
                    if (Boolean(answer)) {
                        var answers = [], attachements = answer.answer ? JSON.parse(answer.answer) : null;
                        c.Result = {
                            'CostSeconds': answer.cs,
                            'Answers': answer.qti_answer,
                            'Result': analysis && analysis.questionAnswerStatus === 5 ? 1 : analysis && analysis.questionAnswerStatus === 7 ? 2 : answer.qti_answer ? 7 : 0
                        };
                    }
                    if (analysis) {
                        switch (analysis.questionAnswerStatus) {
                        case 0:
                            c.Result.Result = 0;
                            break;
                        case 1:
                            c.Result.Result = 7;
                            break;
                        case 5:
                            c.Result.Result = 1;
                            break;
                        case 7:
                            c.Result.Result = 2;
                            break;
                        case 9:
                            c.Result.Result = 9;
                            break;
                        }
                    }
                    c.state = _this._getState(c);
                    c.submit = c.Result != null;
                    return c;
                }).toArray();
                this.data.Items = cells;
                this.loader.mergeCells(cells);
            };
            return ExerciseStore;
        }(__store.Studying.Store);
        Studying.ExerciseStore = ExerciseStore;
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
define('studying.exercise.answer', [
    'require',
    'exports',
    'studying.exercise.store',
    'studying.answer',
    'studying.enum',
    'timer'
], function (require, exports, __store, __answer, __enum, _timer) {
    var Studying;
    (function (Studying) {
        var ExerciseAnswer = function (_super) {
            __extends(ExerciseAnswer, _super);
            function ExerciseAnswer() {
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
                            subQuestionUserTitle: '您错答为',
                            'goToLearn': '去学习',
                            'goSubmitQuestion': '提问'
                        },
                        navigation: '答题卡',
                        prev: '<i></i>上一题',
                        next: '<i></i>下一题',
                        submit: '提交练习'
                    },
                    exercise: {
                        answer: {
                            commit: '提交练习',
                            reAnswer: '重新练习',
                            explanation: '练习说明',
                            exerciseScore: '本次成绩',
                            noAnswer: '很抱歉\uFF01您尚未答题\uFF0C不能提交答案\u3002',
                            continueAnswer: '继续答题',
                            answerAllCommitTitle: '已完成全部题目\uFF0C确定提交答案吗\uFF1F',
                            examAutoCommitTitle: '本次考试已自动交卷\uFF0C不能继续作答',
                            sure: '确定',
                            cancel: '取消',
                            partialFinishCommitTitle: '已完成 {{doneCount}} 题\uFF0C还有 {{noAnswer}} 题未做\uFF0C确定提交答案吗\uFF1F',
                            partialFinishCommitTitle2: '已完成 {{doneCount}} 题\uFF0C还有 {{noAnswer}} 题未做\uFF0C不能提交答案\uFF01',
                            questionBank: { reasonEmpty: '错因不能为空' },
                            see: '我知道了',
                            wrongBook: '做错的题目将自动记录到\u201C错题本\u201D中\uFF0C可以查看并练习哦\uFF01'
                        },
                        prepare: {
                            totalQuestion: '本练习共 {{totalCount}} 题',
                            startAnswer: '开始练习',
                            bestScoreCaption: '最好成绩\uFF1A',
                            right: '答对',
                            question: '题',
                            error: '答错',
                            noAnswer: '未答',
                            accuracy: '正确率'
                        }
                    }
                };
                this._tmpl = '                <div>                    <div class="prepare"></div>                    <div class="test-box">                        <div class="test-main">                            <div class="test-wrapper test-unflod">                                <div class="w-test-con">                                    <div class="question"></div>                                </div>                                <div class="w-test-sheet">                                    <div class="wt-sheet">                                        <div class="wt-sheet-hd clearfix">                                            <ul>                                                <li class="active"><a href="javascript:void(0);" id="navigator">答题卡</a></li>                                            </ul>                                        </div>                                        <div class="navigator"></div>                                        <!--<div class="navigatorStat"></div>-->                                    </div>                                    <a class="w-test-collapse" href="javascript:;">                                        <i></i>                                    </a>                                </div>                                <div class="w-test-alert1" style="display: none;"></div>                            </div>                            <div class="test-toolbar">                                <div class="wt-tool-left" style="display: none;">                                    <span class="wt-timer">                                        <ins></ins><span class="wt-timer-clock wt-active"></span>                                    </span>                                </div>                                <div class="wt-tool-mid">                                    <a href="javascript:;" class="wt-question-prev ln-btn-prev wt-prev-disabled">                                        <span id="prev"><i></i>上一题</span>                                    </a>                                    <a href="javascript:;" class="wt-question-next ln-btn-next">                                        <span id="next"><i></i>下一题</span>                                    </a>                                </div>                                <div class="wt-tool-right">                                    <a href="javascript:void(0);" class="wt-result-btn ln-btn-finish wt-active">                                        <span id="submit">提交练习</span>                                    </a>                                    <!--<a href="javascript:void(0);" class="wt-fullscreen-btn ln-btn-fullscreen"><i></i></a>-->                                </div>                            </div>                        </div>                    </div>                </div>        ';
                $(document).off('click', '.ln-btn-learn-error', $.proxy(this._learnError, this)).on('click', '.ln-btn-learn-error', $.proxy(this._learnError, this));
            }
            ExerciseAnswer.prototype.init = function (data) {
                if (data && data.i18n)
                    this.i18n = data.i18n;
                this._elementSelector = data.ElementSelector;
                $(this._elementSelector).html(this._tmpl);
                this.store = new __store.Studying.ExerciseStore(data);
                if (this.store.data.controlOptions && this.store.data.controlOptions.hideNavigator) {
                    $('.w-test-sheet').addClass('hide');
                    $('.test-wrapper').removeClass('test-unflod');
                }
                this.store.initedHandler = $.proxy(this.onStoreInited, this);
                this.store.questionStateChangeHandler = $.proxy(this.onQuestionStateChange, this);
                this.store.sessionNeedSubmitHandler = $.proxy(this.onSessionNeedSubmit, this);
                if (this.store.data.Exercise.Mode != __enum.Studying.AnswerMode.View) {
                    this.timer = _timer.Common.TimerFactory.Singleton();
                }
                if (this.store.data.controlOptions && this.store.data.controlOptions.disablePreButton) {
                    $('.ln-btn-prev').hide();
                }
                if (this.store.data.controlOptions && this.store.data.controlOptions.disableNextButton) {
                    $('.ln-btn-next').hide();
                }
                this.initLanguageText();
            };
            ExerciseAnswer.prototype.initLanguageText = function () {
                $('#navigator').html(this.i18n.common.navigation);
                $('#prev').html(this.i18n.common.prev);
                $('#next').html(this.i18n.common.next);
                $('#submit').html(this.i18n.common.submit);
            };
            ExerciseAnswer.prototype.onStoreInited = function () {
                var _this = this;
                if (!this.timer.isReady && this.store.data.Exercise.Mode != __enum.Studying.AnswerMode.View) {
                    this.timer.ready().done(function () {
                        _this.initUi();
                        _this.regiest();
                    });
                    return;
                }
                this.initUi();
                this.regiest();
            };
            ExerciseAnswer.prototype.onQuestionStateChange = function (qid, state) {
            };
            ExerciseAnswer.prototype.onSessionNeedSubmit = function () {
                var _this = this;
                $.fn.udialog.confirm2(this.i18n.exercise.answer.examAutoCommitTitle, {
                    title: this.i18n.exam.answer.confirmCaption,
                    buttons: [
                        {
                            text: this.i18n.exercise.answer.cancel,
                            click: function () {
                                var t = $(this);
                                t['udialog']('hide');
                            }
                        },
                        {
                            text: this.i18n.exercise.answer.sure,
                            click: function () {
                                var t = $(this);
                                t['udialog']('hide');
                                _this.dofinish();
                            },
                            'class': 'default-btn'
                        }
                    ]
                });
            };
            ExerciseAnswer.prototype.initUi = function () {
                $('.ln-btn-learn-error').hide();
                switch (this.store.data.Exercise.Mode) {
                case __enum.Studying.AnswerMode.Test:
                case __enum.Studying.AnswerMode.Exercise:
                    $('.ln-btn-restart').removeClass('ln-btn-restart').addClass('ln-btn-finish').find('span').text(this.i18n.exercise.answer.commit);
                    break;
                case __enum.Studying.AnswerMode.View:
                    $('.ln-btn-finish').removeClass('ln-btn-finish').addClass('ln-btn-restart').find('span').text(this.i18n.exercise.answer.reAnswer);
                    break;
                }
                if (this.store.data.controlOptions && this.store.data.controlOptions.hideNavigator) {
                    $('.w-test-sheet').addClass('hide');
                    $('.test-wrapper').removeClass('test-unflod');
                }
            };
            ExerciseAnswer.prototype.regiest = function () {
                var _this = this;
                var isShowAnswerState = false;
                if (this.store.data.Exercise.Mode == __enum.Studying.AnswerMode.View || this.store.data.Exercise.Mode == __enum.Studying.AnswerMode.ExericseSingleCommit)
                    isShowAnswerState = true;
                $('.navigator').navigator({
                    num: this.store.getNumById(),
                    items: this.store.data.Items,
                    batches: this.store.data.Batches,
                    partTitles: this.store.data.PartTitle,
                    isShowAnswerState: isShowAnswerState,
                    disableJump: this.store.data.controlOptions && this.store.data.controlOptions.disableNavigatorJump ? this.store.data.controlOptions.disableNavigatorJump : false,
                    autoHidePrev: this.store.getControlOption('autoHidePrev'),
                    autoHideNext: this.store.getControlOption('autoHideNext'),
                    numChanged: $.proxy(this._numChanged, this),
                    onNextButtonClick: this.store.data.EventCallbacks && this.store.data.EventCallbacks.onNextButtonClick,
                    getNumByQuestionId: $.proxy(this._getNumByQuestionId, this),
                    getCurrentQuestionState: $.proxy(this._getCurrentQuestionState, this),
                    inited: function (evt, ui) {
                        _this.store.viewModel.navigator = ui.viewModel;
                    },
                    i18n: this.i18n.common.navigator
                });
                if (this.store.data.Exercise.Mode == __enum.Studying.AnswerMode.View) {
                    this.renderSide();
                    $(window).unbind('resize', $.proxy(this.renderSide, this)).resize($.proxy(this.renderSide, this));
                    var isShown = $.cookie('wrongBookTip_' + window.userId);
                    if (!isShown) {
                        $.cookie('wrongBookTip_' + window.userId, true, {
                            expires: 7 * 4 * 12 * 10,
                            path: '/'
                        });
                        $.fn.udialog.confirm2(this.i18n.exercise.answer.wrongBook, {
                            title: this.i18n.exam.answer.confirmCaption,
                            buttons: [{
                                    text: this.i18n.exercise.answer.see,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                    },
                                    'class': 'default-btn'
                                }]
                        });
                    }
                } else {
                    $(window).unbind('resize', $.proxy(this.renderSide, this));
                    $('.wt-sheet-field').css('bottom', '20px');
                    $('.wt-sheet-hd li').hide().eq(0).show().addClass('active').unbind('click');
                }
                this.regiestTimer();
            };
            ExerciseAnswer.prototype._getNumByQuestionId = function (questionId) {
                var num = this.store.getNumById(questionId);
                return num;
            };
            ExerciseAnswer.prototype._getCurrentQuestionState = function (num) {
                var analysisData = this.store.data.UserExam.AnalysisData;
                var questionId = this.store.data.Cells.length > num - 1 && num ? this.store.data.Cells[num - 1].Id : null;
                var questionAnswerStatus = null;
                if (analysisData.length && questionId) {
                    var itemArray = Enumerable.from(analysisData).where('$.id ==\'' + questionId + '\'').toArray();
                    if (itemArray.length) {
                        questionAnswerStatus = itemArray[0].questionAnswerStatus;
                    }
                }
                var result = {
                    id: questionId,
                    answerStatus: questionAnswerStatus
                };
                return result;
            };
            ExerciseAnswer.prototype.regiestTimer = function () {
                if (this.store.data.ViewMode < 2 && this.store.data.Exercise.Mode != __enum.Studying.AnswerMode.View) {
                    if (this.store.data.leavetime) {
                        $(this._elementSelector + ' .wt-tool-left').show();
                        this.timer.appendRepeateHandler('tick', $.proxy(this._onTimerElapsed, this), Number.MAX_VALUE, 400);
                        this.timer.appendHandler('finish', Math.min(259200000 + parseInt(this.timer.time()), this.store.data.leavetime), $.proxy(this._timeover, this));
                    }
                }
            };
            ExerciseAnswer.prototype.renderSide = function () {
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
            ExerciseAnswer.prototype._onTimerElapsed = function () {
                var leavetime = new Date(this.store.data.leavetime).getTime();
                $(this._elementSelector + ' .wt-timer-clock').text(this._toTimeString(leavetime - this.timer.time()));
            };
            ExerciseAnswer.prototype.render = function (id, num) {
                var _this = this;
                $.studying.loading.show();
                this.store.load(id).done(function (cell) {
                    $.studying.loading.hide();
                    var editable = true, showAnswer = false;
                    switch (_this.store.data.Exercise.Mode) {
                    case __enum.Studying.AnswerMode.Test:
                        editable = true;
                        showAnswer = false;
                        break;
                    case __enum.Studying.AnswerMode.Exercise:
                        editable = true;
                        showAnswer = false;
                        break;
                    case __enum.Studying.AnswerMode.View:
                        editable = false;
                        showAnswer = true;
                        break;
                    case __enum.Studying.AnswerMode.ExericseSingleCommit:
                        if (cell.Result.Answers && cell.Result.Answers != '' && (_this.store.data.Exercise.CommitQuestions && _this.store.data.Exercise.CommitQuestions.indexOf(cell.Id) >= 0)) {
                            editable = false;
                            showAnswer = true;
                        } else {
                            editable = true;
                            showAnswer = false;
                        }
                        break;
                    }
                    var analysisData = Enumerable.from(_this.store.data.UserExam.AnalysisData).where('$.id ==\'' + cell.Id + '\'').toArray()[0];
                    var showQuestionNum = _this.store.getControlOption('showQuestionNum');
                    var showGotoLearn = _this.store.getControlOption('showGotoLearnButton');
                    var showQuizButton = _this.store.getControlOption('showQuizButton');
                    var showErrorButton = _this.store.getControlOption('showErrorButton');
                    var hideErrorButton = false;
                    var defer = null;
                    if (showErrorButton && _this.store.data.EventCallbacks && _this.store.data.EventCallbacks.checkAddQuestionBank) {
                        defer = $.Deferred();
                        _this.store.data.EventCallbacks.checkAddQuestionBank(cell.Question.identifier).done(function (res) {
                            if (!showErrorButton) {
                                defer.resolve();
                                return;
                            }
                            if (res) {
                                showErrorButton = false;
                                hideErrorButton = true;
                            }
                            defer.resolve();
                        });
                    } else {
                        defer = $.Deferred();
                        defer.resolve([]);
                    }
                    var def = null;
                    if (showAnswer && _this.store.getControlOption('enableQuestionBank') != false) {
                        def = $.Deferred();
                        _this.store.getQuestionInBankId(cell.Id).done(function (qr) {
                            if (qr) {
                                cell.QuestionInBankId = qr.id;
                                $.when(_this.store.getQuestionErrorReasons([qr.id]), _this.store.getNote(cell.QuestionInBankId)).done(function (reasons, notes) {
                                    reasons = reasons, notes = notes[0];
                                    def.resolve(reasons, notes);
                                });
                            } else {
                                def.resolve([]);
                            }
                        });
                    } else {
                        def = $.Deferred();
                        def.resolve([]);
                    }
                    defer.done(function () {
                        def.done(function (resons, notes) {
                            cell.ErrorReasons = _this.store.data.UserExam.ErrorReasons;
                            cell.QuestionErrorReasons = resons;
                            if (notes && notes.items && notes.items.length > 0) {
                                cell.Note = notes.items[0];
                            } else {
                                cell.Note = {
                                    'id': null,
                                    'userId': null,
                                    'projectId': null,
                                    'content': null,
                                    'targetId': null,
                                    'targetName': null,
                                    'isOpen': null,
                                    'createTime': null,
                                    'updateTime': null,
                                    'praiseCount': null
                                };
                            }
                            var $q = $('.question');
                            $q.qtiquestion({
                                'mode': _this.store.data.Exercise.Mode,
                                'uploadAllowed': false,
                                'editable': editable,
                                'showAnswer': showAnswer,
                                'showQuestionNum': showQuestionNum != undefined ? showQuestionNum : true,
                                'ispapermode': false,
                                'num': num,
                                'question': cell.Question,
                                'cloudUrl': _this.store.data.CloudUrl,
                                'accessToken': _this.store.data.AccessToken,
                                'result': cell.Result,
                                'analysisData': analysisData,
                                'qtiPath': { 'refPath': _this.store.data.QtiPath.RefPath },
                                'questionInBankId': cell.QuestionInBankId,
                                'showQuestionBank': showAnswer && cell.QuestionInBankId ? true : false,
                                'showGotoLearnButton': showGotoLearn,
                                'showQuizButton': showQuizButton,
                                'showErrorButton': showErrorButton,
                                'hideErrorButton': hideErrorButton,
                                'note': cell.Note,
                                'errorReasons': cell.ErrorReasons,
                                'questionErrorReasons': cell.QuestionErrorReasons,
                                'addToQuestionBank': $.proxy(_this._onAddToQuestionBank, _this, $q),
                                'setEmphasisQuestion': $.proxy(_this._onSetEmphasisQuestion, _this, $q),
                                'removeEmphasisQuestion': $.proxy(_this._onRemoveEmphasisQuestion, _this),
                                'addErrorReason': $.proxy(_this._onAddErrorReason, _this, $q),
                                'updateErrorReason': $.proxy(_this._onUpdateErrorReason, _this, $q),
                                'updateQuestionTags': $.proxy(_this._onUpdateQuestionTags, _this, $q),
                                'deleteErrorReason': $.proxy(_this._onDeleteErrorReason, _this, $q),
                                'updateNote': $.proxy(_this._updateNote, _this, $q),
                                'createNote': $.proxy(_this._createNote, _this, $q),
                                'deleteNote': $.proxy(_this._deleteNote, _this, $q),
                                'learnButtonClick': $.proxy(_this._learnButtonClick, _this, cell.Id),
                                'questionButtonClick': $.proxy(_this._questionButtonClick, _this, cell.Id),
                                'errorButtonClick': $.proxy(_this._errorButtonClick, _this, $q, cell.Id, cell.Result, _this.store.data.wrongBookParams),
                                'attachementSetting': {
                                    'session': _this.store.data.Attachement.Session,
                                    'url': _this.store.data.Attachement.Url,
                                    'path': _this.store.data.Attachement.Path,
                                    'flashUrl': _this.store.data.Attachement.FlashUrl,
                                    'downloadUrlFormat': _this.store.data.Attachement.DownloadUrlFormat
                                },
                                changed: $.proxy(_this._answerChanged, _this),
                                showAnalysis: $.proxy(_this._onShowAnalysis, _this),
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
                    });
                });
            };
            ExerciseAnswer.prototype.c = function (context, evt, data) {
                this.store.addToQuestionBank(data.questionId).done(function (r) {
                    context.qtiquestion('updateQuestionRelateTag', r);
                });
            };
            ExerciseAnswer.prototype._onSetEmphasisQuestion = function (context, evt, data) {
                this.store.setEmphasisQuestion(data.questionId).done(function (r) {
                }).fail(function () {
                    context.qtiquestion('resetKeyWrongQuestionStatus', r);
                });
            };
            ExerciseAnswer.prototype._onRemoveEmphasisQuestion = function (evt, data) {
                this.store.removeEmphasisQuestion(data.questionId);
            };
            ExerciseAnswer.prototype._onAddErrorReason = function (questionDom, evt, data) {
                if (!data.value) {
                    $.fn.udialog.confirm2(this.i18n.exercise.answer.questionBank.reasonEmpty, {
                        buttons: [{
                                text: this.i18n.exercise.answer.sure,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                },
                                'class': 'default-btn'
                            }]
                    });
                    return;
                }
                this.store.createErrorReason(data).done(function (reason) {
                    questionDom.qtiquestion('updateErrorReasons', reason);
                });
            };
            ExerciseAnswer.prototype._onUpdateErrorReason = function (context, evt, data) {
                var _this = this;
                if (!data.reason.value) {
                    context.qtiquestion('updateErrorReasonById', {
                        'id': data.reasonId,
                        'reason': data.reason
                    });
                    $.fn.udialog.confirm2(this.i18n.exercise.answer.questionBank.reasonEmpty, {
                        buttons: [{
                                text: this.i18n.exercise.answer.sure,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                },
                                'class': 'default-btn'
                            }]
                    });
                    return;
                }
                this.store.updateErrorReason(data.reasonId, data.reason).done(function () {
                    _this.store.getErrorReasons().done(function (reasons) {
                        _this.store.data.UserExam.ErrorReasons = reasons;
                    });
                }).fail(function () {
                    context.qtiquestion('updateErrorReasonById', {
                        'id': data.reasonId,
                        'reason': data.reason
                    });
                });
            };
            ExerciseAnswer.prototype._onUpdateQuestionTags = function (questionDom, evt, data) {
                this.store.updateQuestionTags(data.questionId, data.reason).done(function (reasons) {
                    questionDom.qtiquestion('updateQuestionReasons', reasons);
                });
            };
            ExerciseAnswer.prototype._onDeleteErrorReason = function (context, evt, data) {
                var _this = this;
                this.store.deleteErrorReason(data.questionId, data.reason).done(function () {
                    _this.store.getErrorReasons().done(function (reasons) {
                        _this.store.data.UserExam.ErrorReasons = reasons;
                    });
                });
            };
            ExerciseAnswer.prototype._updateNote = function (context, evt, data) {
                this.store.updateNote(data).done(function (result) {
                    context.qtiquestion('updateNote', result);
                });
            };
            ExerciseAnswer.prototype._deleteNote = function (context, evt, data) {
                this.store.deleteNote(data).done(function (result) {
                    context.qtiquestion('deleteNote', result);
                });
            };
            ExerciseAnswer.prototype._createNote = function (context, evt, data) {
                this.store.createNote(data).done(function (result) {
                    context.qtiquestion('updateNote', result);
                });
            };
            ExerciseAnswer.prototype._learnButtonClick = function (questionId) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onLearnButtonClick) {
                    this.store.data.EventCallbacks.onLearnButtonClick(questionId);
                }
            };
            ExerciseAnswer.prototype._questionButtonClick = function (questionId) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onQuestionButtonClick) {
                    this.store.data.EventCallbacks.onQuestionButtonClick(questionId);
                }
            };
            ExerciseAnswer.prototype._errorButtonClick = function (context, questionId, result, wrongBookParams) {
                var params = wrongBookParams;
                params.question_id = questionId;
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onErrorButtonClick) {
                    this.store.data.EventCallbacks.onErrorButtonClick(params).done(function (resData) {
                        context.qtiquestion('updateShowError', { 'showErrorButton': false });
                    });
                }
            };
            ExerciseAnswer.prototype._answerChanged = function (evt, ui) {
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
            ExerciseAnswer.prototype._onShowAnalysis = function (evt, ui) {
                if (this.store.data.Exercise.Mode == __enum.Studying.AnswerMode.ExericseSingleCommit) {
                    var questionId = ui.viewModel.question.identifier();
                    this.store.data.Exercise.CommitQuestions.push(questionId);
                    this.doSingleCommit(questionId);
                }
            };
            ExerciseAnswer.prototype.pushCostSeconds = function (lastQuestion, lastCostSecond) {
                if (lastQuestion && lastQuestion.CostSecondsStartTime) {
                    lastQuestion.Result.CostSeconds = Math.round((lastCostSecond ? lastCostSecond : 0) + (new Date().getTime() - lastQuestion.CostSecondsStartTime) / 1000);
                    lastQuestion.Result.CostSeconds = lastQuestion.Result.CostSeconds ? lastQuestion.Result.CostSeconds : 1;
                    lastQuestion.CostSecondsStartTime = new Date().getTime();
                }
            };
            ExerciseAnswer.prototype._numChanged = function (evt, ui) {
                if (this.store.data.EventCallbacks && this.store.data.EventCallbacks.onNumberChanged) {
                    var analysisData = this.store.data.UserExam.AnalysisData;
                    var num = ui.item.num();
                    var lastNum = ui.item.num() - 1 > 0 ? ui.item.num() - 1 : 0;
                    var lastQuestionId = this.store.data.Cells.length > num - 1 && lastNum ? this.store.data.Cells[lastNum - 1].Id : null;
                    var lastQuestionAnswerStatus = null;
                    if (analysisData.length && lastQuestionId) {
                        var itemArray = Enumerable.from(analysisData).where('$.id ==\'' + lastQuestionId + '\'').toArray();
                        if (itemArray.length) {
                            lastQuestionAnswerStatus = itemArray[0].questionAnswerStatus;
                        }
                    }
                    this.store.data.EventCallbacks.onNumberChanged(lastQuestionId, lastQuestionAnswerStatus);
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
            ExerciseAnswer.prototype._checkSubmit = function () {
                var vm = this.store.viewModel.question;
                if (typeof vm == 'undefined')
                    return false;
                if (!vm.done()) {
                    return false;
                }
                return true;
            };
            ExerciseAnswer.prototype._onSubmit = function () {
                if (!this._checkSubmit())
                    return;
                this._updateAnswers(true);
                if (this.store.data.Exercise.Mode == __enum.Studying.AnswerMode.Exercise) {
                    var vm = this.store.viewModel.question;
                    this.render(vm.question.identifier(), vm.num());
                }
            };
            ExerciseAnswer.prototype._updateAnswers = function (submit) {
                var vm = this.store.viewModel.question;
                if (typeof vm == 'undefined')
                    return;
                var cell = this.store.get(vm.question.identifier());
                var result = $.extend(true, { CostSeconds: 0 }, cell.Result, ko.mapping.toJS(vm.result()));
                result.CostSeconds = 1;
                cell.Result = result;
                cell.submit = submit || cell.submit;
                this.store.queue(cell, submit);
                this.store.viewModel.navigator.items()[vm.num() - 1].state(cell.Result['Result']);
            };
            ExerciseAnswer.prototype._learnError = function () {
                var _this = this;
                $.studying.loading.show();
                this.store._restart(1).done(function (d) {
                    var result = [], obj = {}, cells = _this.store.data.Cells, batches = _this.store.data.Batches, newBatches = [];
                    for (var i = 0; i < cells.length; i++) {
                        if (typeof cells[i].Result == 'undefined' || cells[i].Result.Result == 0 || cells[i].Result.Result == 2) {
                            result.push({
                                Id: cells[i].Id,
                                Result: null
                            });
                            obj['' + cells[i].Id] = true;
                        }
                    }
                    for (var i = 0; i < batches.length; i++) {
                        var exitAry = [];
                        for (var j = 0; j < batches[i].length; j++) {
                            if (typeof obj[batches[i][j]] != 'undefined') {
                                exitAry.push(batches[i][j]);
                            }
                        }
                        newBatches.push(exitAry);
                    }
                    _this.store.data.Batches = newBatches;
                    _this.store.data.Exercise.Mode = __enum.Studying.AnswerMode.Test;
                    _this.store.data.Sid = d.Sid;
                    _this.store.data.CurrentQuestionId = result[0].Id;
                    _this.store.data.Cells = result;
                    _this.init(_this.store.data);
                    $.studying.loading.hide();
                });
            };
            ExerciseAnswer.prototype._finish = function () {
                var doneCount = this.store.getDoneCount(), totalCount = this.store.getTotalCount(), _this = this;
                if (doneCount == 0) {
                    $.fn.udialog.confirm2(this.i18n.exercise.answer.noAnswer, {
                        title: this.i18n.exam.answer.confirmCaption,
                        buttons: [{
                                text: this.i18n.exercise.answer.continueAnswer,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                },
                                'class': 'default-btn'
                            }]
                    });
                } else if (doneCount == totalCount) {
                    $.fn.udialog.confirm2(this.i18n.exercise.answer.answerAllCommitTitle, {
                        title: this.i18n.exam.answer.confirmCaption,
                        buttons: [
                            {
                                text: this.i18n.exercise.answer.cancel,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                }
                            },
                            {
                                text: this.i18n.exercise.answer.sure,
                                click: function () {
                                    var t = $(this);
                                    t['udialog']('hide');
                                    _this.dofinish();
                                },
                                'class': 'default-btn'
                            }
                        ]
                    });
                } else {
                    if (this.store.data.controlOptions && this.store.data.controlOptions.forceToAnswer) {
                        var title = this.i18n.exercise.answer.partialFinishCommitTitle2.replace('{{doneCount}}', doneCount.toString()).replace('{{noAnswer}}', (totalCount - doneCount).toString());
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
                        var title = this.i18n.exercise.answer.partialFinishCommitTitle.replace('{{doneCount}}', doneCount.toString()).replace('{{noAnswer}}', (totalCount - doneCount).toString());
                        $.fn.udialog.confirm2(title, {
                            title: this.i18n.exam.answer.confirmCaption,
                            buttons: [
                                {
                                    text: this.i18n.exercise.answer.sure,
                                    click: function () {
                                        var t = $(this);
                                        t['udialog']('hide');
                                        _this.dofinish();
                                    }
                                },
                                {
                                    text: this.i18n.exercise.answer.continueAnswer,
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
            ExerciseAnswer.prototype._timeover = function () {
                var store = this.store;
                this.dofinish();
            };
            ExerciseAnswer.prototype.dofinish = function () {
                var _this = this;
                this.timer.removeHandler('tick');
                $.studying.loading.show();
                var resultPageUrl = this.store.data.Exercise.ResultPageUrl || '';
                this.store.commit().done(function () {
                    _this.store.end().done(function (data) {
                        if (resultPageUrl) {
                            var defaultUrl = resultPageUrl + '?exam_id=' + _this.store.data.ExamId + '&session_id=' + _this.store.data.SessionId + '&custom_data=' + (_this.store.data.CustomData ? _this.store.data.CustomData : '');
                            if (resultPageUrl.indexOf('?') >= 0) {
                                var defaultUrl = resultPageUrl + '&exam_id=' + _this.store.data.ExamId + '&session_id=' + _this.store.data.SessionId + '&custom_data=' + (_this.store.data.CustomData ? _this.store.data.CustomData : '');
                            }
                            location.replace(defaultUrl);
                        } else {
                            _this.modeCache = _this.modeCache ? _this.modeCache : _this.store.data.Exercise.Mode;
                            _this._review(__enum.Studying.AnswerMode.View);
                            $.studying.loading.hide();
                        }
                    });
                });
            };
            ExerciseAnswer.prototype.doSingleCommit = function (questionId) {
                var _this = this;
                $.studying.loading.show();
                this.store.commit().done(function () {
                    _this.modeCache = __enum.Studying.AnswerMode.ExericseSingleCommit;
                    _this._review(__enum.Studying.AnswerMode.ExericseSingleCommit, questionId);
                    $.studying.loading.hide();
                });
            };
            ExerciseAnswer.prototype._review = function (exerciseMode, questionId) {
                this.store.data.Exercise.Mode = exerciseMode;
                this.store.data.CurrentQuestionId = questionId ? questionId : this.store.data.Batches[0][0];
                this.store.data.Cells = [];
                this.store.data.Batches = [];
                this.store.data.UserExam.AnswersData = [];
                this.store.data.UserExam.AnalysisData = [];
                this.init(this.store.data);
                this.store.viewAnalysis();
            };
            ExerciseAnswer.prototype._restart = function () {
                this.store.data.Exercise.CommitQuestions = [];
                this.store.data.Exercise.Mode = this.modeCache ? this.modeCache : __enum.Studying.AnswerMode.Exercise;
                this.store.data.CurrentQuestionId = null;
                this.store.data.Cells = [];
                this.store.data.Batches = [];
                this.store.data.UserExam.AnswersData = [];
                this.store.data.UserExam.AnalysisData = [];
                this.init(this.store.data);
                this.store.restart();
            };
            ExerciseAnswer.prototype._fullscreen = function () {
                $('.learning-con').toggleClass('full-screen');
                return false;
            };
            ExerciseAnswer.prototype.goto = function (questionId) {
                var num = this.store.getNumById(questionId);
                if (num) {
                    this.store.viewModel.navigator.num(num);
                }
            };
            return ExerciseAnswer;
        }(__answer.Studying.Answer);
        Studying.ExerciseAnswer = ExerciseAnswer;
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
define('studying.bussiness.standardexercise', [
    'require',
    'exports',
    'studying.bussiness.base',
    'studying.exercise.answer',
    'studying.enum'
], function (require, exports, __base, __answer, _enum) {
    var Studying;
    (function (Studying) {
        var Bussiness;
        (function (Bussiness) {
            var StandardExercise = function (_super) {
                __extends(StandardExercise, _super);
                function StandardExercise(config) {
                    _super.call(this, config);
                }
                StandardExercise.prototype.init = function () {
                    var _this = this;
                    $.studying.loading.show();
                    this.mian = null;
                    $.when(this.getExamInfo(), this.getMyExamInfo()).done(function (examData, mineData) {
                        var data = mineData[0], examInfo = examData[0];
                        examInfo.beginTime = _this.insert(examInfo.beginTime, examInfo.beginTime.indexOf('+') + 2, ':');
                        examInfo.endTime = examInfo.endTime ? _this.insert(examInfo.endTime, examInfo.endTime.indexOf('+') + 2, ':') : null;
                        data.beginTime = _this.insert(data.beginTime, data.beginTime.indexOf('+') + 2, ':');
                        data.endTime = data.endTime ? _this.insert(data.endTime, data.endTime.indexOf('+') + 2, ':') : null;
                        if (data.userData && data.userData.finishTime)
                            data.userData.finishTime = _this.insert(data.userData.finishTime, data.userData.finishTime.indexOf('+') + 2, ':');
                        if (data.userData && data.userData.markTime)
                            data.userData.markTime = _this.insert(data.userData.markTime, data.userData.markTime.indexOf('+') + 2, ':');
                        if (data.userData && data.userData.startTime)
                            data.userData.startTime = _this.insert(data.userData.startTime, data.userData.startTime.indexOf('+') + 2, ':');
                        if (data.userData && data.userData.submitTime)
                            data.userData.submitTime = _this.insert(data.userData.submitTime, data.userData.submitTime.indexOf('+') + 2, ':');
                        $.studying.loading.hide();
                        _this.entryExam(data, examInfo, [], []);
                    }).fail($.proxy(this.onError, this));
                };
                StandardExercise.prototype.entryExam = function (mine, exam, answersData, analysisData) {
                    var config = {
                        'UserId': this.config.envConfig.userId,
                        'Host': this.config.host.mainHost,
                        'NoteServiceHost': this.config.host.noteServiceHost,
                        'QuestionBankServiceHost': this.config.host.questionBankServiceHost,
                        'ElementSelector': this.config.envConfig.element,
                        'ExamId': mine.examId,
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
                        'controlOptions': {
                            'disableNavigatorJump': this.config.envConfig.displayOptions.disableNavigatorJump,
                            'hideNavigator': this.config.envConfig.displayOptions.hideNavigator,
                            'disablePreButton': this.config.envConfig.displayOptions.disablePreButton,
                            'disableNextButton': this.config.envConfig.displayOptions.disableNextButton,
                            'forceToAnswer': this.config.envConfig.answerOptions.forceToAnswer,
                            'showQuestionNum': this.config.envConfig.displayOptions.showQuestionNum,
                            'enableQuestionBank': this.config.envConfig.displayOptions.enableQuestionBank == undefined ? true : this.config.envConfig.displayOptions.enableQuestionBank,
                            'showGotoLearnButton': this.config.envConfig.displayOptions.showGotoLearnButton == undefined ? true : this.config.envConfig.displayOptions.showGotoLearnButton,
                            'showQuizButton': this.config.envConfig.displayOptions.showQuizButton == undefined ? true : this.config.envConfig.displayOptions.showQuizButton,
                            'showErrorButton': this.config.envConfig.displayOptions.showErrorButton == undefined ? true : this.config.envConfig.displayOptions.showErrorButton,
                            'hideErrorButton': this.config.envConfig.displayOptions.hideErrorButton == undefined ? true : this.config.envConfig.displayOptions.hideErrorButton,
                            'autoHidePrev': this.config.envConfig.displayOptions.autoHidePrev == undefined ? false : this.config.envConfig.displayOptions.autoHidePrev,
                            'autoHideNext': this.config.envConfig.displayOptions.autoHideNext == undefined ? false : this.config.envConfig.displayOptions.autoHideNext
                        },
                        'QuestionScoreDict': {},
                        'ApiRequestUrls': {},
                        'EventCallbacks': {
                            'onAnswerSaved': this.config.eventCallBack.onAnswerSaved,
                            'onAnswerChange': this.config.eventCallBack.onAnswerChange,
                            'onNumberChanged': this.config.eventCallBack.onNumberChanged,
                            'onLearnButtonClick': this.config.eventCallBack.onLearnButtonClick,
                            'onQuestionButtonClick': this.config.eventCallBack.onQuestionButtonClick,
                            'checkAddQuestionBank': this.config.eventCallBack.checkAddQuestionBank,
                            'onErrorButtonClick': this.config.eventCallBack.onErrorButtonClick
                        },
                        'Attachement': {
                            'Session': '',
                            'Url': '',
                            'Path': '',
                            'Server': '',
                            'DownloadUrlFormat': ''
                        },
                        'Exercise': {
                            'Summary': '这里是考试说明预留字段',
                            'CompletionSeconds': mine.duration,
                            'QuestionCount': mine.questionCount,
                            'Score': mine.totalScore,
                            'Title': mine.name,
                            'ExerciseType': 2,
                            'Mode': 2,
                            'LimitSeconds': exam.duration ? exam.duration * 1000 : null,
                            'EndTime': _enum.Studying.ConstValue.MaxExamEndTime,
                            'CommitQuestions': [],
                            'ResultPageUrl': this.config.host.returnUrl
                        },
                        'UserExam': {
                            'AnswersData': answersData,
                            'AnalysisData': analysisData,
                            'UserExamStatus': mine.status,
                            'BeginTime': mine.userData && mine.userData.startTime ? new Date(mine.userData.startTime).getTime() : 0
                        },
                        'SubjectiveMarkStrategy': exam.subjectiveMarkStrategy,
                        'wrongBookParams': this.config.wrongBookParams
                    };
                    $.studying.loading.show();
                    var main = this.main = new __answer.Studying.ExerciseAnswer();
                    main.init(config);
                    if ((main.store.data.UserExam.UserExamStatus < 8 || main.store.data.UserExam.UserExamStatus > 8) && main.store.data.UserExam.UserExamStatus != 112) {
                        main.store.data.UserExam.AnswersData = [];
                        main.store.data.UserExam.AnalysisData = [];
                        main.store.prepare(config.CustomData).done(function (data) {
                            $.studying.loading.hide();
                            main.store.start();
                        });
                    } else {
                        $.studying.loading.hide();
                        main.store.data.UserExam.UserExamStatus == 8 ? main.store.continueAnswer() : main.store.start();
                    }
                };
                StandardExercise.prototype.goto = function (questionId) {
                    this.main.goto(questionId);
                };
                return StandardExercise;
            }(__base.Studying.BaseWrapper);
            Bussiness.StandardExercise = StandardExercise;
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
define('studying.bussiness.singlecommitexercise', [
    'require',
    'exports',
    'studying.bussiness.base',
    'studying.exercise.answer',
    'studying.enum'
], function (require, exports, __base, __answer, _enum) {
    var Studying;
    (function (Studying) {
        var Bussiness;
        (function (Bussiness) {
            var SingleCommitExercise = function (_super) {
                __extends(SingleCommitExercise, _super);
                function SingleCommitExercise(config) {
                    _super.call(this, config);
                }
                SingleCommitExercise.prototype.init = function () {
                    var _this = this;
                    $.studying.loading.show();
                    this.main = null;
                    $.when(this.getExamInfo(), this.getMyExamInfo()).done(function (examData, mineData) {
                        var data = mineData[0], examInfo = examData[0];
                        examInfo.beginTime = _this.insert(examInfo.beginTime, examInfo.beginTime.indexOf('+') + 2, ':');
                        examInfo.endTime = examInfo.endTime ? _this.insert(examInfo.endTime, examInfo.endTime.indexOf('+') + 2, ':') : null;
                        data.beginTime = _this.insert(data.beginTime, data.beginTime.indexOf('+') + 2, ':');
                        data.endTime = data.endTime ? _this.insert(data.endTime, data.endTime.indexOf('+') + 2, ':') : null;
                        if (data.userData && data.userData.finishTime)
                            data.userData.finishTime = _this.insert(data.userData.finishTime, data.userData.finishTime.indexOf('+') + 2, ':');
                        if (data.userData && data.userData.markTime)
                            data.userData.markTime = _this.insert(data.userData.markTime, data.userData.markTime.indexOf('+') + 2, ':');
                        if (data.userData && data.userData.startTime)
                            data.userData.startTime = _this.insert(data.userData.startTime, data.userData.startTime.indexOf('+') + 2, ':');
                        if (data.userData && data.userData.submitTime)
                            data.userData.submitTime = _this.insert(data.userData.submitTime, data.userData.submitTime.indexOf('+') + 2, ':');
                        $.studying.loading.hide();
                        var answersData = [], analysisData = [], defs = [], qids = [];
                        if (data.sessionId) {
                            Enumerable.from(data.userData.ndrPaper.item.testParts[0].assessmentSections).forEach(function (value, index) {
                                qids = qids.concat($.map(value.sectionParts, function (spv, spi) {
                                    return spv.identifier;
                                }));
                                defs.push(_this._getUserQuestionAnswers(data.examId, data.sessionId, qids, function (answerData) {
                                    if (answerData && answerData.length > 0)
                                        answersData = answersData.concat(answerData);
                                }, $.proxy(_this.onError, _this)));
                                defs.push(_this._getQuestionAnalysis(data.examId, data.sessionId, qids, function (returnData) {
                                    if (returnData && returnData.length > 0)
                                        analysisData = analysisData.concat(returnData);
                                }, $.proxy(_this.onError, _this)));
                            });
                            $.when.apply(_this, defs).done(function () {
                                _this.entryExam(data, examInfo, answersData, analysisData);
                            });
                        } else {
                            _this.entryExam(data, examInfo, answersData, analysisData);
                        }
                    }).fail($.proxy(this.onError, this));
                };
                SingleCommitExercise.prototype.entryExam = function (mine, exam, answersData, analysisData) {
                    var config = {
                        'UserId': this.config.envConfig.userId,
                        'Host': this.config.host.mainHost,
                        'NoteServiceHost': this.config.host.noteServiceHost,
                        'QuestionBankServiceHost': this.config.host.questionBankServiceHost,
                        'Token': this.config.envConfig.token,
                        'ElementSelector': this.config.envConfig.element,
                        'ExamId': mine.examId,
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
                        'controlOptions': {
                            'disableNavigatorJump': this.config.envConfig.displayOptions.disableNavigatorJump,
                            'hideNavigator': this.config.envConfig.displayOptions.hideNavigator,
                            'disablePreButton': this.config.envConfig.displayOptions.disablePreButton,
                            'disableNextButton': this.config.envConfig.displayOptions.disableNextButton,
                            'forceToAnswer': this.config.envConfig.answerOptions.forceToAnswer,
                            'showQuestionNum': this.config.envConfig.displayOptions.showQuestionNum,
                            'enableQuestionBank': this.config.envConfig.displayOptions.enableQuestionBank == undefined ? true : this.config.envConfig.displayOptions.enableQuestionBank,
                            'showGotoLearnButton': this.config.envConfig.displayOptions.showGotoLearnButton,
                            'showQuizButton': this.config.envConfig.displayOptions.showQuizButton,
                            'showErrorButton': this.config.envConfig.displayOptions.showErrorButton,
                            'hideErrorButton': this.config.envConfig.displayOptions.hideErrorButton,
                            'autoHidePrev': this.config.envConfig.displayOptions.autoHidePrev == undefined ? false : this.config.envConfig.displayOptions.autoHidePrev,
                            'autoHideNext': this.config.envConfig.displayOptions.autoHideNext == undefined ? false : this.config.envConfig.displayOptions.autoHideNext
                        },
                        'QuestionScoreDict': {},
                        'ApiRequestUrls': {},
                        'EventCallbacks': {
                            'onAnswerSaved': this.config.eventCallBack.onAnswerSaved,
                            'onAnswerChange': this.config.eventCallBack.onAnswerChange,
                            'onNumberChanged': this.config.eventCallBack.onNumberChanged,
                            'onNextButtonClick': this.config.eventCallBack.onNextButtonClick,
                            'onLearnButtonClick': this.config.eventCallBack.onLearnButtonClick,
                            'onQuestionButtonClick': this.config.eventCallBack.onQuestionButtonClick,
                            'checkAddQuestionBank': this.config.eventCallBack.checkAddQuestionBank,
                            'onErrorButtonClick': this.config.eventCallBack.onErrorButtonClick
                        },
                        'Attachement': {
                            'Session': '',
                            'Url': '',
                            'Path': '',
                            'Server': '',
                            'DownloadUrlFormat': ''
                        },
                        'Exercise': {
                            'Summary': '这里是考试说明预留字段',
                            'CompletionSeconds': mine.duration,
                            'QuestionCount': mine.questionCount,
                            'Score': mine.totalScore,
                            'Title': mine.name,
                            'ExerciseType': 2,
                            'LimitSeconds': exam.duration ? exam.duration * 1000 : null,
                            'EndTime': _enum.Studying.ConstValue.MaxExamEndTime,
                            'Mode': 4,
                            'CommitQuestions': [],
                            'ResultPageUrl': this.config.host.returnUrl
                        },
                        'UserExam': {
                            'AnswersData': answersData,
                            'AnalysisData': analysisData,
                            'UserExamStatus': mine.status,
                            'BeginTime': mine.userData && mine.userData.startTime ? new Date(mine.userData.startTime).getTime() : 0
                        },
                        'SubjectiveMarkStrategy': exam.subjectiveMarkStrategy,
                        'wrongBookParams': this.config.wrongBookParams
                    };
                    $.studying.loading.show();
                    var main = this.main = new __answer.Studying.ExerciseAnswer();
                    main.init(config);
                    if ((main.store.data.UserExam.UserExamStatus < 8 || main.store.data.UserExam.UserExamStatus > 8) && main.store.data.UserExam.UserExamStatus != 112) {
                        main.store.data.UserExam.AnswersData = [];
                        main.store.data.UserExam.AnalysisData = [];
                        main.store.prepare(config.CustomData).done(function (data) {
                            $.studying.loading.hide();
                            main.store.start();
                        });
                    } else {
                        $.studying.loading.hide();
                        main.store.data.UserExam.UserExamStatus == 8 ? main.store.continueAnswer() : main.store.start();
                    }
                };
                SingleCommitExercise.prototype._getUserQuestionAnswers = function (examId, sessionId, qids, success, error) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v2/m/exams/' + examId + '/sessions/' + sessionId + '/answers',
                        type: 'POST',
                        dataType: 'json',
                        enableToggleCase: false,
                        data: JSON.stringify(qids),
                        contentType: 'application/json;charset=utf-8',
                        traditional: true,
                        success: success,
                        error: error
                    });
                };
                SingleCommitExercise.prototype._getQuestionAnalysis = function (examId, sessionId, qids, success, error) {
                    return this.sendRequest({
                        url: this.config.host.mainHost + '/v2/m/exams/' + examId + '/sessions/' + sessionId + '/analysis',
                        type: 'POST',
                        data: JSON.stringify(qids),
                        contentType: 'application/json;',
                        success: success,
                        error: error
                    });
                };
                SingleCommitExercise.prototype.goto = function (questionId) {
                    this.main.goto(questionId);
                };
                return SingleCommitExercise;
            }(__base.Studying.BaseWrapper);
            Bussiness.SingleCommitExercise = SingleCommitExercise;
        }(Bussiness = Studying.Bussiness || (Studying.Bussiness = {})));
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.exercise.factory', [
    'require',
    'exports',
    'studying.bussiness.standardexercise',
    'studying.bussiness.singlecommitexercise'
], function (require, exports, __standardexercise, __singlecommitexercise) {
    var Studying;
    (function (Studying) {
        var ExerciseBussinessFactory = function () {
            function ExerciseBussinessFactory() {
            }
            ExerciseBussinessFactory.CreateSingleCommitExercise = function (config) {
                return new __singlecommitexercise.Studying.Bussiness.SingleCommitExercise(config);
            };
            ExerciseBussinessFactory.CreateStandardExercise = function (config) {
                return new __standardexercise.Studying.Bussiness.StandardExercise(config);
            };
            return ExerciseBussinessFactory;
        }();
        Studying.ExerciseBussinessFactory = ExerciseBussinessFactory;
    }(Studying = exports.Studying || (exports.Studying = {})));
});
define('studying.exercise.main', [
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
    'studying.prepare',
    'studying.exercise.answer',
    'studying.exercise.store',
    'studying.exercise.factory',
    'studying.bussiness.base',
    'studying.bussiness.singlecommitexercise',
    'studying.bussiness.standardexercise',
    'studying.helper'
], function (require, factory) {
    'use strict';
    window.console && console.log('studying.exercise.main.js');
});