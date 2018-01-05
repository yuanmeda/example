var Video;
(function (Video) {
    function isType(type) {
        return function (arg) {
            return Object.prototype.toString.call(arg) === "[object " + type + "]";
        };
    }
    var isObject = isType("Object");
    var isArray = isType("Array");
    var isString = isType("String");
    var isNumber = isType("Number");
    var own = Object.prototype.hasOwnProperty;
    function upperCase(str) {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }
    function camelCase(str) {
        var r = str.split("_"), start = "";
        forInOwn(r, function (v) {
            start += upperCase(v);
        });
        return start;
    }
    function forInOwn(obj, cb) {
        var value, data;
        if (isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                value = obj[i];
                if (cb(value, i, obj) === false)
                    break;
            }
        }
        if (isObject(obj)) {
            for (var key in obj) {
                if (!own.call(obj, key))
                    continue;
                value = obj[key];
                if (cb(value, key, obj) === false)
                    break;
            }
        }
    }
    Video.utils = {
        isArray: isArray,
        isObject: isObject,
        isString: isString,
        forInOwn: forInOwn,
        camelCase: camelCase,
        isNumber: isNumber
    };
})(Video || (Video = {}));
;var Common;
(function (Common) {
    var Event = (function () {
        function Event(type) {
            this.type = type;
        }
        return Event;
    })();
    Common.Event = Event;
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this._listeners = [];
        }
        EventDispatcher.prototype.hasEventListener = function (type, listener, scope) {
            var exists = false;
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].type === type && this._listeners[i].listener === listener && this._listeners[i].scope == scope) {
                    exists = true;
                }
            }

            return exists;
        };

        EventDispatcher.prototype.addEventListener = function (typeStr, listenerFunc) {
            var pos = typeStr.indexOf("."), eventName, scope;
            if (pos > -1) {
                eventName = typeStr.substr(0, pos);
                scope = typeStr.substr(pos);
            } else {
                eventName = typeStr;
                scope = "";
            }

            if (this.hasEventListener(eventName, listenerFunc, scope)) {
                return;
            }

            this._listeners.push({ type: eventName, listener: listenerFunc, scope: scope });
        };

        EventDispatcher.prototype.removeEventListener = function (typeStr, listenerFunc) {
            var pos = typeStr.indexOf("."), eventName, scope;
            if (pos > -1) {
                eventName = typeStr.substr(0, pos);
                scope = typeStr.substr(pos);
            } else {
                eventName = typeStr;
                scope = "";
            }

            for (var i = 0; i < this._listeners.length; i++) {
                if (listenerFunc) {
                    if (this._listeners[i].type === eventName && this._listeners[i].listener === listenerFunc && this._listeners[i].scope == scope) {
                        this._listeners.splice(i, 1);
                    }
                } else {
                    if (this._listeners[i].type === eventName && this._listeners[i].scope == scope) {
                        this._listeners.splice(i, 1);
                    }
                }
            }
        };

        EventDispatcher.prototype.dispatchEvent = function (evt) {
            var pos = evt.type.indexOf(".");
            if (pos > -1) {
                var eventName = evt.type.substr(0, pos), scope = evt.type.substr(pos);
                for (var i = 0; i < this._listeners.length; i++) {
                    if (this._listeners[i].type === evt.type && this._listeners[i].scope == scope) {
                        this._listeners[i].listener.call(this, evt);
                    }
                }
            } else {
                for (var i = 0; i < this._listeners.length; i++) {
                    if (this._listeners[i].type === evt.type) {
                        this._listeners[i].listener.call(this, evt);
                    }
                }
            }
        };
        return EventDispatcher;
    })();
    Common.EventDispatcher = EventDispatcher;
})(Common || (Common = {}));
;///<reference path='../../../../addins/flowplayer/flowplayer.d.ts' />
///<reference path='../../../../addins/common/event.ts' />
///<reference path='../event/cuepointevent.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var Clip = (function (_super) {
        __extends(Clip, _super);
        function Clip(innerClip) {
            _super.call(this);
            this.innerClip = innerClip;
        }
        Clip.prototype.addCuepoint = function (c) {
            var _this = this;
            this.innerClip.onCuepoint(c, function (clip, point) {
                _this.dispatchEvent(new Video.CuepointEvent("onCuepoint", point));
            });
        };
        return Clip;
    }(Common.EventDispatcher));
    Video.Clip = Clip;
})(Video || (Video = {}));
;///<reference path='../../../../addins/common/event.ts' />
///<reference path='../clip/clip.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var ClipEvent = (function (_super) {
        __extends(ClipEvent, _super);
        function ClipEvent(type, clip) {
            _super.call(this, type);
            this.type = type;
            this.clip = clip;
        }
        return ClipEvent;
    }(Common.Event));
    Video.ClipEvent = ClipEvent;
})(Video || (Video = {}));
;///<reference path='../../../../addins/common/event.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var CuepointEvent = (function (_super) {
        __extends(CuepointEvent, _super);
        function CuepointEvent(type, obj) {
            _super.call(this, type);
            this.type = type;
            this.obj = obj;
        }
        return CuepointEvent;
    }(Common.Event));
    Video.CuepointEvent = CuepointEvent;
})(Video || (Video = {}));
;///<reference path='../../../../addins/common/event.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var PlayerEvent = (function (_super) {
        __extends(PlayerEvent, _super);
        function PlayerEvent(type, callback) {
            _super.call(this, type);
            this.type = type;
            this.callback = callback;
        }
        return PlayerEvent;
    }(Common.Event));
    Video.PlayerEvent = PlayerEvent;
})(Video || (Video = {}));
;///<reference path='../../../../addins/common/event.ts' />
///<reference path='../player.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var PluginEvent = (function (_super) {
        __extends(PluginEvent, _super);
        function PluginEvent(type, player) {
            _super.call(this, type);
            this.type = type;
            this.player = player;
        }
        return PluginEvent;
    }(Common.Event));
    Video.PluginEvent = PluginEvent;
})(Video || (Video = {}));
;///<reference path='../../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../../addins/common/event.ts' />
///<reference path='../event/pluginevent.ts' />
///<reference path='../playerbase.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var PluginBase = (function (_super) {
        __extends(PluginBase, _super);
        function PluginBase() {
            _super.call(this);
            this.addEventListener("onLoad", $.proxy(this.onLoad, this));
        }
        PluginBase.prototype.onLoad = function (evt) {
            this.player = evt.player;
        };
        return PluginBase;
    }(Common.EventDispatcher));
    Video.PluginBase = PluginBase;
})(Video || (Video = {}));
;///<reference path='../../../../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../../../../addins/jqueryui/jqueryui.d.ts' />
///<reference path='../../../../../../addins/knockout/knockout.d.ts' />
///<reference path='../../../../../../addins/knockout.mapping/knockout.mapping.d.ts' />
///<reference path='../../../../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
var Learning;
(function (Learning) {
    var tmp = '\
<div class="ln-judge" data-bind="css:{\'ln-judge-editable\':editable}" >\
    <ul data-bind="foreach:options">\
        <li  data-bind="css:{\'ln-judge-checked\':answered,\'ln-judge-hover\':hovered,\'ln-judget-standarded\':standarded}">\
            <i data-bind="css:{\'ln-judge-hover-i\':hovered}"></i><em></em>\
            <label data-bind="text: content"></label>\
        </li>\
    </ul>\
</div>\
                ';
    var judge = (function () {
        function judge() {
            this.init();
        }
        judge.prototype.init = function () {
            $.widget("learning.judgeVideo", {
                options: {
                    id: 0,
                    sub: 0,
                    options: ["对", "错"],
                    answer: { Answer: "", Result: -1 },
                    standard: ""
                },
                _init: function () {
                    var t = this;
                    this.element.html(tmp);
                    var op = this.options;
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
                    t._vm = ko.mapping.fromJS(vm);
                    t._vm.pushAnswer = $.proxy(this._pushAnswer, this);
                    this._inner = $(".ln-judge", this.element);
                    this._trigger("inited", null, this._ui());
                    ko.applyBindings(this._vm, t._inner[0]);
                    $("li", t._inner).hover($.proxy(this._onOptionHover, this)).click($.proxy(this._onOptionClick, this));
                },
                _pushAnswer: function (answer) {
                    var item = Enumerable.from(this._vm.options()).firstOrDefault(null, "$.content()=='" + answer + "'");
                    if (item != null) {
                        if (!item.answered()) {
                            Enumerable.from(this._vm.options()).forEach("$.answered(false)");
                            item.answered(true);
                            this._triggerChanged();
                        }
                    }
                },
                _triggerChanged: function () {
                    this._vm.answer.Answer(Enumerable.from(this._vm.options()).where("$.answered()").select("$.content()").toArray().join(""));
                    this._trigger("changed", null, this._ui());
                },
                _onOptionHover: function (evt) {
                    if (!this._vm.editable())
                        return;
                    ko.dataFor(evt.currentTarget).hovered(evt.type == "mouseenter");
                },
                _onOptionClick: function (evt) {
                    if (!this._vm.editable())
                        return;
                    var ctx = ko.contextFor(evt.currentTarget);
                    ctx.$parent.pushAnswer(ctx.$data.content());
                },
                _ui: function () {
                    return {
                        viewModel: this._vm
                    };
                },
                viewModel: function () {
                    return this._vm;
                }
            });
        };
        return judge;
    }());
    Learning.judge = judge;
})(Learning || (Learning = {}));
;///<reference path='../../../../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../../../../addins/jqueryui/jqueryui.d.ts' />
///<reference path='../../../../../../addins/knockout/knockout.d.ts' />
///<reference path='../../../../../../addins/knockout.mapping/knockout.mapping.d.ts' />
///<reference path='../../../../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
var Learning;
(function (Learning) {
    var tmpl = '\
<div class="ln-options" data-bind="foreach:options, css:{\'ln-options-mutil\':multiSelect(),\'ln-options-single\':!multiSelect(), \'ln-options-editable\':editable}">\
    <dl data-bind="attr:{\'data-item\':$data},css:{\'ln-option-hover\': hovered,\'ln-option-answered\':answered,\'ln-option-standarded\':standarded }">\
        <dt data-bind="css:{\'ln-option-hover-dt\':hovered}"><i></i><em data-bind="attr:{title:standarded?\'此选项为参考答案\':\'\'}"></em>\
            <label data-bind="text: label() + \'.&nbsp;\'"></label>\
        </dt>\
        <dd data-bind="html:content"></dd>\
    </dl>\
</div>\
                ';
    var Option = (function () {
        function Option() {
            this.init();
        }
        Option.prototype.init = function () {
            $.widget("learning.questionOptionVideo", {
                options: {
                    id: 0,
                    sub: 0,
                    options: [],
                    multiSelect: true,
                    editable: true,
                    answer: { Answer: "", Result: -1 },
                    standard: "",
                    shortcut: true,
                    ispapermode: false
                },
                _init: function () {
                    var t = this;
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
                    t._vm = ko.mapping.fromJS(vm);
                    t._vm.pushAnswer = $.proxy(this._pushAnswer, this);
                    this._inner = $(".ln-options", this.element);
                    this._trigger("inited", null, this._ui());
                    ko.applyBindings(t._vm, t._inner[0]);
                    //this.layout();
                    $("dl", t._inner).hover($.proxy(this._onOptionHover, this)).click($.proxy(this._onOptionClick, this));
                    this._keyUpHandler = $.proxy(this._onKeyUp, this);
                    if (!this._vm.ispapermode())
                        $(document).keyup(t._keyUpHandler);
                    //删除事件绑定
                    this.element.bind("remove." + t.widgetName, function () {
                        $(document).unbind("keyup", t._keyUpHandler);
                    });
                },
                layout: function () {
                    var t = this;
                    t._inner.removeClass("ln-span1 ln-span2 ln-span4");
                    //计算宽度
                    //当启动题目切换效果时，无法计算宽度
                    var mb = this.element.closest(".ln-main-body:hidden");
                    mb.show();
                    if (this.options.options.join('').indexOf("<img") < 0) {
                        var dds = t._inner.find("dd");
                        var lw = t._inner.width() - 50, max = 0;
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
                            t._inner.addClass("ln-span4");
                        else if (max < lw / 2)
                            t._inner.addClass("ln-span2");
                        else
                            t._inner.addClass("ln-span1");
                    }
                    else
                        t._inner.addClass("ln-span1");
                    mb.hide();
                },
                _onKeyUp: function (evt) {
                    if (!this._vm.editable() || !this._vm.shortcut())
                        return;
                    if (evt.keyCode >= 65 && evt.keyCode <= 65 + this._vm.options().length && $(".ln-feedback").css("display") == 'none')
                        this._pushAnswer(String.fromCharCode(evt.keyCode));
                },
                _pushAnswer: function (answer) {
                    var item = Enumerable.from(this._vm.options()).firstOrDefault(null, "$.label()=='" + answer + "'");
                    if (item != null) {
                        if (this._vm.multiSelect()) {
                            item.answered(!item.answered());
                            this._triggerChanged();
                        }
                        else if (!item.answered()) {
                            Enumerable.from(this._vm.options()).forEach("$.answered(false)");
                            item.answered(true);
                            this._triggerChanged();
                        }
                    }
                },
                _triggerChanged: function () {
                    this._vm.answer.Answer(Enumerable.from(this._vm.options()).where("$.answered()").select("$.label()").toArray().join(""));
                    this._trigger("changed", null, this._ui());
                },
                _onOptionHover: function (evt) {
                    if (!this._vm.editable())
                        return;
                    ko.dataFor(evt.currentTarget).hovered(evt.type == "mouseenter");
                },
                _onOptionClick: function (evt) {
                    if (!this._vm.editable())
                        return;
                    var ctx = ko.contextFor(evt.currentTarget);
                    ctx.$parent.pushAnswer(ctx.$data.label());
                },
                _ui: function () {
                    return {
                        viewModel: this._vm
                    };
                },
                viewModel: function () {
                    return this._vm;
                }
            });
        };
        return Option;
    }());
    Learning.Option = Option;
})(Learning || (Learning = {}));
;///<reference path='../../../../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../../../../addins/jqueryui/jqueryui.d.ts' />
///<reference path='../../../../../../addins/knockout/knockout.d.ts' />
///<reference path='../../../../../../addins/knockout.mapping/knockout.mapping.d.ts' />
///<reference path='../../../../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='../../../../../../addins/jqueryui/jqueryui.extends.d.ts' />
///<reference path='./judge.ts' />
///<reference path='./option.ts' />
///<reference path='./scroll.ts' />
var Learning;
(function (Learning) {
    var tmpl = '\
<div class="ln-work">\
    <div class="ln-question">\
        <div class="ln-body" data-bind="visible:question.QuestionType()==50">\
            <label data-bind="text: num() + \'.\'"></label>\
            <em data-bind="text:\'（\' + question.QuestionTypeName() + \'）\'"></em>\
            <div data-bind="html:question.ComplexBody" class="ln-body-content"></div>\
        </div>\
        <div data-bind="foreach:question.SubItems">\
            <div class="ln-body">\
                <label data-bind="text: $root.SubNum($index())"></label>\
                <em data-bind="text:\'（\' + QuestionTypeName() + \'）\'"></em>\
                <div data-bind="html:Body" class="ln-body-content"></div>\
            </div>\
            <div class="ln-input"></div>\
            <div class="ln-answer" data-bind="visible:$root.showAnswer,css:{\'ln-answercorrect\':$root.qResult(),\'ln-answererror\':!$root.qResult()}">\
                <dl><dt class="answer"></dt><dd class="answer" data-bind="html:$root.qResult()==true?\'恭喜你答对了！\':\'很遗憾你答错了，请继续作答\',css:{\'ln-xl\':$root.qResult()==true,\'ln-kl\':$root.qResult()==false}"></dd></dl>\
                <dl data-bind="visible:$root.ShowExplanation($index())"><dt>题目详解:</dt><dd data-bind="html:$root.StandardExplanation($index())"></dd></dl>\
            </div>\
        </div>\
        <div class="ln-answer" data-bind="visible:$root.showAnswer() && question.ComplexExplanation().length>0">\
            <dl>\
                <dt>套题详解:</dt><dd data-bind="html:question.ComplexExplanation"></dd>\
            </dl>\
        </div>\
    </div>\
</div>';
    var statusTmpl = '\
<div class="ln-status">\
    <span data-bind="text:$root.statusTitle">疑似错题</span>\
    <div class="ln-status-tip">\
        <i></i>\
        <div data-bind="text:$root.statusDesc" class="ln-status-title">本题为疑似错题，建议跳过作答：</div>\
        <div data-bind="text:$root.question.FeedbackRemark, visible: $root.showFeedbackRemark"></div>\
        <ul data-bind="foreach:$root.feedbacks,visible: $root.showFeedback">\
            <li><span class="ln-status-label" data-bind="text: Title"></span><span class="ln-status-count" data-bind="text: \'反馈: \' + Count()"><i class="ln-status-icon"></i></span></li>\
        </ul>\
    </div>\
</div>';
    var Question = (function () {
        function Question() {
            new Learning.judge();
            new Learning.Option();
            new Learning.Scroll();
            this.init();
        }
        Question.prototype.init = function () {
            $.widget("learning.questionVideo", {
                options: {
                    feedbacks: [],
                    feedbackLoaded: false,
                    editable: true,
                    showAnswer: true,
                    ispapermode: false
                },
                _init: function () {
                    var _this = this;
                    this.element.html(tmpl);
                    var op = this.options;
                    var question = op.question;
                    var t = this;
                    var body = question.QuestionType == 50 ? $(".ln-body:eq(0)", this.element) : $(".ln-body:eq(1)", this.element);
                    if (question.Status != 0 && question.Status != 4) {
                        body.prepend(statusTmpl);
                    }
                    var t = this;
                    t._inner = $(".ln-work", this.element);
                    var vm = ko.mapping.fromJS(op);
                    vm.statusTitle = ko.computed(function () {
                        var q = this.question;
                        return ["", "疑似错题", "争议题", "鉴定题", "作废题"][q.Status()];
                    }, vm);
                    vm.statusDesc = ko.computed(function () {
                        var q = this.question;
                        return ["", "本题为疑似错题，建议跳过作答", "本题为争议题，建议跳过作答", "", "本题为作废题，建议跳过作答"][q.Status()];
                    }, vm);
                    vm.showFeedback = ko.computed(function () {
                        var t = this;
                        var q = this.question;
                        return q.Status() == 1 && t.feedbacks().length > 0;
                    }, vm);
                    vm.showFeedbackRemark = ko.computed(function () {
                        var q = this.question;
                        var s = q.Status();
                        return (s == 2 || s == 3) && (q.FeedbackRemark() != null && q.FeedbackRemark().length > 0);
                    }, vm);
                    vm.StandardCostime = ko.computed(function () {
                        return this.result.CostSeconds() != 0 ? this.result.CostSeconds() + "秒" : "";
                    }, vm);
                    vm.catalogs = ko.computed(function () {
                        var q = this.question;
                        return typeof q.Catalogs == 'undefined' ? "<无>" : Enumerable.from(q.Catalogs()).select("$.Title()").toJoinedString(" &gt; ");
                    }, vm);
                    vm.qResult = ko.computed(function () {
                        return Enumerable.from(this.result.Answers()).all("$.Result()==1");
                    }, vm);
                    this._vm = vm;
                    vm.editable.subscribe(function (nv) {
                        for (var i = 0; i < question.SubItems.length; i++) {
                            var vm = question.SubItems[i].viewModel;
                            if (vm && vm.shortcut)
                                vm.shortcut(nv && question.QuestionType != 50);
                        }
                    }, this);
                    //处理子题的题号
                    vm.SubNum = function (index) {
                        var q = this.question;
                        var t = this;
                        if (q.QuestionType() != 50)
                            return t.num() + ".";
                        return index + 1 + ").";
                    };
                    //处理子题的题号
                    vm.MineAnswer = function (index) {
                        var a = this.result.Answers()[index].Answer();
                        return a.length > 0 ? a : "<未作答>";
                    };
                    vm.StandardAnswer = function (index) {
                        var q = this.question;
                        return q.SubItems()[index].Answer();
                    };
                    vm.StandardScore = function (index) {
                        var q = this.question;
                        var score = typeof q.SubItems()[index].Score == 'function' ? q.SubItems()[index].Score() : 0;
                        if (score == 0) {
                            return "";
                        }
                        else {
                            var userscore = typeof this.result.Answers()[index].Score == 'function' ? this.result.Answers()[index].Score() : 0;
                            return userscore + "(总分: " + score + ")";
                        }
                    };
                    vm.ShowExplanation = function (index) {
                        var ex = this.question["SubItems"]()[index].Explanation();
                        return (ex != null && ex.length > 0) && (!op.editable);
                    };
                    vm.StandardExplanation = function (index) {
                        var q = this.question;
                        var ex = q.SubItems()[index].Explanation();
                        return ex != null && ex.length > 0 ? ex : "<暂无>";
                    };
                    vm.MineAnswerResult = function (index) {
                        return this.result.Answers()[index].Result() == 1;
                    };
                    this._trigger("inited", null, this._ui());
                    ko.applyBindings(vm, this._inner[0]);
                    //题型处理
                    var complex = question.QuestionType == 50;
                    var qbs = $(".ln-input", this._inner);
                    for (var i = 0; i < question.SubItems.length; i++) {
                        var sub = question.SubItems[i];
                        switch (sub.QuestionType) {
                            case 10:
                            case 15:
                            case 18:
                                var answer = { Answer: "", Result: -1, Score: 0 };
                                if (op.result != null && i < op.result.Answers.length)
                                    answer = op.result.Answers[i];
                                $(qbs[i]).questionOptionVideo({
                                    id: question.Id,
                                    sub: i,
                                    options: sub.Options,
                                    multiSelect: sub.QuestionType != 10,
                                    answer: answer,
                                    changed: $.proxy(this._onAnswerChanged, this),
                                    inited: function (evt, ui) {
                                        sub.viewModel = ui.viewModel;
                                    },
                                    shortcut: vm.editable() && !complex,
                                    editable: vm.editable(),
                                    standard: vm.editable() ? "" : sub.Answer,
                                    ispapermode: vm.ispapermode()
                                });
                                break;
                            case 20:
                            case 25:
                                var answer = { Answer: "", Result: 1, Score: 0 };
                                if (op.result != null && i < op.result.Answers.length)
                                    answer = op.result.Answers[i];
                                $(qbs[i]).subjective({
                                    id: question.Id,
                                    sub: i,
                                    answer: answer,
                                    showAnswer: op.showAnswer,
                                    scoreable: typeof op.isSetScoreView != 'undefined' ? true : false,
                                    ischapter: typeof op.ischapter != 'undefined' && op.ischapter == true ? true : false,
                                    subQuestionscore: sub.Score ? sub.Score : 1,
                                    changed: $.proxy(this._onAnswerChanged, this),
                                    inited: function (evt, ui) {
                                        sub.viewModel = ui.viewModel;
                                    }
                                });
                                break;
                            case 30:
                                var answer = { Answer: "", Result: -1, Score: 0 };
                                if (op.result != null && i < op.result.Answers.length)
                                    answer = op.result.Answers[i];
                                $(qbs[i]).judgeVideo({
                                    id: question.Id,
                                    sub: i,
                                    answer: answer,
                                    editable: vm.editable(),
                                    standard: vm.editable() ? "" : sub.Answer,
                                    changed: $.proxy(this._onAnswerChanged, this),
                                    inited: function (evt, ui) {
                                        sub.viewModel = ui.viewModel;
                                    }
                                });
                                break;
                        }
                    }
                    //清除多余的EM
                    $(".ln-body-content", this._inner).each(function (i, n) {
                        var nt = n.childNodes;
                        if (nt.length == 0 || nt[0].tagName != "P") {
                            $(n).prev().css("margin-right", "0em");
                        }
                    });
                    vm.result = ko.computed(function () {
                        return t.getResult();
                    });
                    vm.done = ko.computed(function () {
                        //此处后面加入评分提交判断
                        if (typeof op.isSetScoreView != 'undefined' && op.isSetScoreView == true)
                            return Enumerable.from(this.result().Answers).any("$.Score>0");
                        return Enumerable.from(this.result().Answers).any("$.Answer.length>0");
                    }, vm);
                    $(".ln-question-wrapper", this._inner).scrollC({
                        targetElement: $(".ln-question", this._inner)
                    });
                    if (!Enumerable.from(vm.result().Answers).all("$.Result==1")) {
                        setTimeout(function () {
                            $(".ln-answererror", _this._inner).fadeOut(1000);
                        }, 1000);
                    }
                    else
                        $(".ln-answer-only", this._inner).show();
                    $(".ln-question span", this._inner).each(function (i, n) {
                        var tn = $(n), tcss = tn.css("background-color");
                        if (tcss == "rgb(255, 255, 255)" || tcss == "#ffffff")
                            tn.css("background-color", "");
                    });
                },
                getResult: function () {
                    var result = { Answers: [], Result: -1 }, q = this.options.question;
                    var qbs = $(".ln-input", this._inner);
                    for (var i = 0; i < q.SubItems.length; i++) {
                        var sub = q.SubItems[i];
                        var subResult = ko.mapping.toJS(sub.viewModel.answer);
                        result.Answers.push(subResult);
                    }
                    return result;
                },
                layout: function () {
                    var t = this;
                    var v = Enumerable.from(t.options.question["SubItems"]).any("$.QuestionType<=18");
                    if (v)
                        $(".ln-input", this.element).questionOptionVideo("layout");
                },
                _onAnswerChanged: function (evt, data) {
                    this._trigger("changed", null, this._ui());
                },
                _ui: function () {
                    var t = this;
                    return {
                        viewModel: t._vm
                    };
                }
            });
        };
        return Question;
    }());
    Learning.Question = Question;
})(Learning || (Learning = {}));
;///<reference path='../../../../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../../../../addins/jqueryui/jqueryui.d.ts' />
///<reference path='../../../../../../addins/knockout/knockout.d.ts' />
///<reference path='../../../../../../addins/knockout.mapping/knockout.mapping.d.ts' />
///<reference path='../../../../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='../../../../../../addins/jqueryui/jqueryui.extends.d.ts' />
var Learning;
(function (Learning) {
    var Scroll = (function () {
        function Scroll() {
            this.init();
        }
        Scroll.prototype.init = function () {
            $.widget("learning.scrollC", {
                options: {
                    step: 10
                },
                _hover: false,
                _create: function () {
                    var t = this;
                    this.element.addClass("ln-scroll");
                    $('<div class="ln-scroll-bar"><div class="ln-scroll-handler" /></div>').prependTo(this.element);
                    this._scroll = this.element.find(".ln-scroll-bar");
                    this._scrollHander = this.element.find(".ln-scroll-handler");
                    this._targetElement = $(this.options.targetElement);
                    t._scroll.height(this.element.height());
                    t._targetElement.addClass("ln-scroll-content");
                    $("body").mousewheel($.proxy(this._onMousewheel, this)).resize($.proxy(this._onResize, this));
                    t._scrollHander.draggable({
                        containment: 'parent',
                        drag: $.proxy(this._onDrag, this)
                    });
                    this._targetHeight = t._targetElement.height();
                    window.setInterval($.proxy(this._onDetectSize, this), 100);
                    this.reset();
                    //this.element.hover($.proxy(this._onScrollHover, this));
                },
                value: function (v) {
                    var t = this;
                    if (typeof v == "undefined" || v == null)
                        return t._scrollHander.position().top;
                    if (v < 0)
                        v = 0;
                    v = Math.min(Math.max(0, v), t._scroll.height() - t._scrollHander.height());
                    var val = -v * t._targetElement.height() / t._scroll.height();
                    t._scrollHander.css("top", v);
                    this._trigger("scrolling", null, { value: v });
                    t._targetElement.css("top", val);
                },
                normal: function () {
                    var t = this;
                    var v = Math.min(Math.max(0, 1), t._scroll.height() - t._scrollHander.height());
                    return v * t._targetElement.height() / t._scroll.height();
                },
                reset: function () {
                    var t = this;
                    t._scroll.height(this.element.height());
                    t._targetElement.width(this.element.width());
                    var h = t._targetElement.height(), sh = t._scroll.height(), s = h > sh;
                    var os = t._scroll.position().top + sh - (t._targetElement.position().top + h);
                    if (os > 0)
                        t._targetElement.css("top", Math.min(0, t._targetElement.position().top + os));
                    t._scroll.toggle(s); //this._scroll.toggle(s && this._hover);
                    t._scrollHander.height(sh * sh / h);
                },
                _onDetectSize: function () {
                    var t = this;
                    var h = t._targetElement.height();
                    if (h != t._targetHeight) {
                        //this._targetHeight = h;
                        this.reset();
                    }
                    t._scrollHander.css('left', 0);
                },
                _showed: function () {
                    var t = this;
                    return t._targetElement.height() > t._scroll.height();
                },
                _onMousewheel: function (evt, delta, deltaX, deltaY) {
                    if (this._showed())
                        this.value(this.value(null) - deltaY * this.options.step);
                },
                _onDrag: function (evt, ui) {
                    this.value(ui.position.top);
                },
                _onResize: function (evt) {
                    var t = this;
                    t._targetElement.height();
                },
                _onScrollHover: function (evt) {
                    var t = this;
                    this._hover = evt.type == "mouseenter";
                    if (this._showed()) {
                        if (this._hover)
                            t._scroll.stop(true, true).fadeIn(500);
                        else
                            t._scroll.stop(true, true).fadeOut(500);
                    }
                }
            });
        };
        return Scroll;
    }());
    Learning.Scroll = Scroll;
})(Learning || (Learning = {}));
;///<reference path='../../../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='../../../../../addins/jqueryui/jqueryui.extends.d.ts' />
///<reference path='../plugin.ts' />
///<reference path='../../event/clipevent.ts' />
///<reference path='../../event/cuepointevent.ts' />
///<reference path='../../event/pluginevent.ts'/>
///<reference path='./learning/question.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var QuestionPlugin = (function (_super) {
        __extends(QuestionPlugin, _super);
        function QuestionPlugin(config, player) {
            _super.call(this);
            this.dotTriggerInfo = [];
            this.currentSeekTime = 0;
            this.currentIndexForDot = -1;
            this.currentkey = "";
            this.timeoutId = 0;
            this.pausetimeoutId = 0;
            this.disable = false;
            this.maxPlayPosition = 0;
            this._config = {
                element: "",
                sid: "",
                cellsUrl: "",
                submit: null,
                results: null,
                apiHost: "",
                accessToken: ""
            };
            this._config.apiHost = player.setting.apiHost;
            this._config.accessToken = player.setting.accessToken;
            this._config.element = $("#" + player.element);
            this._config = $.extend(this._config, config);
            this.questionPlayer = new QuestionPlayer(this);
            new Learning.Question();
            window['circle'] = $.proxy(this.show, this);
        }
        QuestionPlugin.prototype.config = function () {
            return this._config;
        };
        QuestionPlugin.prototype.getConfig = function () {
            return this._config;
        };
        QuestionPlugin.prototype.onLoad = function (evt) {
            _super.prototype.onLoad.call(this, evt);
            this.player.removeEventListener("onClipLoad.QuestionPlugin");
            this.player.removeEventListener("onSeek.QuestionPlugin");
            this.player.removeEventListener("onResume.QuestionPlugin");
            this.player.addEventListener("onClipLoad.QuestionPlugin", $.proxy(this.clipLoad, this));
            this.player.addEventListener("onSeek.QuestionPlugin", $.proxy(this.seek, this));
            this.player.addEventListener("onResume.QuestionPlugin", $.proxy(this.seek, this));
        };
        QuestionPlugin.prototype.getcells = function () {
            var _this = this;
            if (this._config.cellsUrl == "" || !this.player.setting.video || this.player.setting.video.type != "id")
                return;
            if (!this._config.mooc) {
                $.ajax({
                    url: this._config.cellsUrl,
                    dataType: "jsonp",
                    type: "Get",
                    jsonp: "jsoncallback",
                    data: { videoId: this.player.setting.video.id },
                    cache: false,
                    success: function (data) {
                        _this._config.results = data.Cells;
                        _this._config.sid = data.Sid;
                    },
                    error: function () {
                    }
                });
            }
            else {
                $.ajax({
                    url: this._config.cellsUrl,
                    dataType: "jsonp",
                    type: "Get",
                    jsonp: "jsoncallback",
                    //data: { videoId: this.player.key },
                    cache: false,
                    success: function (data) {
                        //TODO:需要做数据对象转换
                        _this._config.results = Enumerable.from(data.data).select(function (d) {
                            return {
                                Id: d.questionId,
                                Result: {
                                    CostSeconds: d.costSeconds,
                                    Answers: Enumerable.from(d.answers).select(function (a) {
                                        return { Answer: a.answer, Result: a.answerResult };
                                    }).toArray(),
                                    Result: Enumerable.from(d.answers).all("$.answerResult==1")
                                }
                            };
                        }).toArray();
                        //this._config.sid = data.Sid;
                    },
                    error: function () {
                    }
                });
            }
        };
        QuestionPlugin.prototype.checkIsActive = function () {
            return this.disable;
        };
        QuestionPlugin.prototype.clipLoad = function (e) {
            //初始化  this.questionPlayer
            if (this.currentkey != this.player.key && this.currentkey == "") {
                this.currentkey = this.player.key;
                this.disable = true;
            }
            else {
                this.disable = false;
                return;
            }
            if (this.player.timeQuestions && this.player.timeQuestions.length > 0) {
                this.getcells();
                e.clip.addEventListener("onCuepoint", $.proxy(this.cuepoint, this));
                var qids = [];
                Enumerable.from(this.player.timeQuestions).select(function (tq) {
                    for (var i = 0; i < tq.QuestionIds.length; i++) {
                        qids.push(tq.QuestionIds[i]);
                    }
                }).toArray();
                this.questionPlayer.setIds(qids);
            }
        };
        //seek的时候检测之前的题目都做了没有
        QuestionPlugin.prototype.seek = function () {
            var _this = this;
            if (!this.checkIsActive())
                return;
            if (this.player.timeQuestions && this.player.timeQuestions.length > 0) {
                //seek有可能取到的时间是seek前的时间 延迟执行
                if (!this.player.isPaused()) {
                    window.setTimeout(function () {
                        var time = _this.player.getTime();
                        _this.checkunanswer(Math.round(time));
                    }, 50);
                }
            }
        };
        QuestionPlugin.prototype.checkunanswer = function (time) {
            for (var i = 0; i < this.player.timeQuestions.length; i++) {
                var e = this.player.timeQuestions[i];
                if (this.currentSeekTime == time) {
                    return;
                }
                if (time >= e.time && e.time != 0) {
                    if (!this.questionPlayer.getResults(e.QuestionIds)) {
                        this.currentSeekTime = e.time;
                        this.player.seek(Math.round(e.time));
                        this.jump(e.time, e.QuestionIds);
                        break;
                    }
                }
            }
        };
        //播放过程中 到时间点触发
        QuestionPlugin.prototype.cuepoint = function (e) {
            if (!this.checkIsActive())
                return;
            if (e.obj.type == 'question' || e.obj.type == 'any') {
                var time = e.obj.time / 1000;
                var qids = e.obj.QuestionIds;
                //触发过的就不自动触发
                if (this.dotTriggerInfo[time])
                    return;
                this.jump(time, qids);
            }
        };
        //点在点上时一定触发
        QuestionPlugin.prototype.show = function (time) {
            var _this = this;
            if (!this.checkIsActive())
                return;
            //if (this.maxPlayPosition < time && this.player.settingHelper.getPlayerConfigs().plugins && this.player.settingHelper.getPlayerConfigs().plugins.controls.dragDirection == "backward")
            //    return;
            Enumerable.from(this.player.timeQuestions).forEach(function (e, i) {
                if (time == e.time) {
                    if (_this.questionPlayer.getResults(e.QuestionIds)) {
                        _this.jump(e.time, e.QuestionIds);
                        return;
                    }
                }
            });
        };
        QuestionPlugin.prototype.jump = function (time, qids) {
            var _this = this;
            if (!this.checkIsActive())
                return;
            clearTimeout(this.timeoutId);
            clearTimeout(this.pausetimeoutId);
            this.timeoutId = setTimeout(function () {
                //记录触发时的事件
                _this.dotTriggerInfo[time] = _this.player.getTime();
                //更新点的index
                _this.currentIndexForDot = _this.getDotIndex(time);
                if (_this.player.isFullscreen())
                    _this.player.toggleFullscreen();
                _this.questionPlayer.jump(qids);
                //BUG #17114 
                _this.pausetimeoutId = setTimeout(function () {
                    if (!_this.player.isPaused()) {
                        if (typeof _this.player.getPlugin("poster") != "undefined") {
                            var poster = _this.player.getPlugin("poster");
                            poster.skipPoster();
                        }
                        _this.player.pause();
                    }
                }, 50);
            }, 100);
        };
        QuestionPlugin.prototype.getDotIndex = function (time) {
            for (var i = 0; i < this.player.timeQuestions.length; i++) {
                if (this.player.timeQuestions[i].time == time) {
                    return i;
                }
            }
        };
        return QuestionPlugin;
    }(Video.PluginBase));
    Video.QuestionPlugin = QuestionPlugin;
    var QuestionPlayer = (function () {
        function QuestionPlayer(plugin) {
            //if ($(".ln-overlay").length == 0) {
            //$("<div class='ln-overlay'></div>").appendTo(document.body);
            //}
            this.plugin = plugin;
            this.element = null; //题目组件的容器
            this.isAnswering = false;
            this.cells = null;
            this.viewModel = {};
            this.numFromCurrentIds = 1;
            this.tipTimeOut = 0;
            this.questionTypeName = {
                10: "单选题",
                15: "多选题",
                18: "不定项选择题",
                20: "填空题",
                25: "主观题",
                30: "判断题",
                40: "连线题",
                50: "套题"
            };
            var id = 'chaptervideo_' + (new Date()).getTime();
            plugin.getConfig().element.prev(".chaptervideo").remove();
            plugin.getConfig().element.before('<div class="chaptervideo" id="' + id + '" style = "display: none;" >' +
                '<div class="ln-result-tip"><div style="display: none;"></div></div><div class="ln-close" style="display: none;"><a href="javascript:void(0);">×</a></div><div class="ln-container" style="display:none;">' +
                '<div class="ln-main">' +
                '<div class="ln-main-body"></div>' +
                '</div>' +
                '<div class="chapter-foot">' +
                '<a href="javascript:void(0);" class="chapter-btn-commit ln-submit" style = "display: none;"></a>' +
                '<a href="javascript:void(0);" class="chapter-btn-next ln-next" style = "display: none;"></a>' +
                '<a href="javascript:void(0);" class="chapter-btn-resume ln-resume" style = "display: none;"></a>' +
                '</div>' +
                '</div>' +
                '<div class="ln-confirm" style="display:none;">' +
                '<h3>检测题</h3>' +
                '<p>共 <em></em> 题，<span>已做答 </span></p>' +
                '<div>' +
                '<a href="javascript:void(0);" class="ln-confirm-btn j-reanswer"> 重新作答 </a>' +
                '<a href="javascript:void(0);" class="ln-confirm-btn j-resume1"> 继续播放 </a>' +
                '</div>' +
                '</div>' +
                '</div>');
            this.element = $("#" + id);
            this.regiestEvents();
        }
        QuestionPlayer.prototype.regiestEvents = function () {
            var t = this;
            $('.j-resume1', t.element).on('click', function () {
                t.resume();
            });
            $('.j-reanswer', t.element).on('click', function () {
                t.renswer(t.currentIds);
            });
            $('.ln-resume', t.element).on('click', function () {
                if (!$(this).hasClass('disable'))
                    t.resume();
            });
            $('.ln-next', t.element).on('click', function () {
                if (!$(this).hasClass('disable'))
                    t.next();
            });
            $('.ln-submit', t.element).on('click', function () {
                if (!$(this).hasClass('disable'))
                    t._onSubmit();
            });
            $('.ln-close', t.element).on('click', function () {
                if (!t.getResults(t.currentIds))
                    t.plugin.dotTriggerInfo[t.plugin.currentSeekTime] = 0;
                t.element.hide();
            });
        };
        QuestionPlayer.prototype.setIds = function (qids) {
            this.qids = qids;
        };
        QuestionPlayer.prototype.jump = function (ids) {
            this.currentIds = ids;
            this.element.show();
            $(".j-resume1", this.element).focus().blur();
            if (this.getResults(this.currentIds)) {
                this.showConfirm(ids.length);
            }
            else {
                this.transfer(ids[0], this.getNum(ids[0], this.plugin.currentIndexForDot));
                this.showAnswer();
            }
            //if (navigator.appVersion.indexOf("MSIE 7.") !== -1) {
            //    $(".content").css("z-index", 200);
            //    $f(0).hide();
            //}
        };
        QuestionPlayer.prototype.transfer = function (id, num, beforeRander) {
            var _this = this;
            if (this.cells == null) {
                this.load({ qids: this.qids, accessToken: this.plugin.getConfig().accessToken }, function (data) {
                    if (data.Code == 0) {
                        var data = _this.toquestionModel(data.Data);
                        _this.cells = data;
                        _this.mergeCells();
                        if (beforeRander && typeof beforeRander == "function") {
                            beforeRander();
                        }
                        _this.render(id, num);
                    }
                });
            }
            else {
                if (beforeRander && typeof beforeRander == "function") {
                    beforeRander();
                }
                this.render(id, num);
            }
        };
        QuestionPlayer.prototype.toquestionModel = function (data) {
            var _this = this;
            return Enumerable.from(data).select(function (o) {
                return {
                    Id: o.Id,
                    Question: {
                        Id: o.Id,
                        IsSubjective: o.IsSubjective,
                        QuestionType: o.QuestionType,
                        ComplexBody: o.ComplexBody,
                        CompletionSeconds: o.CompletionSeconds,
                        Status: 0,
                        ComplexExplanation: o.ComplexExplanation,
                        QuestionTypeName: _this.questionTypeName[o.QuestionType],
                        SubItems: Enumerable.from(o.SubItems).select(function (s) {
                            return {
                                Body: s.Body,
                                Options: s.Options,
                                QuestionType: s.QuestionType,
                                Answer: s.Answer,
                                Explanation: s.Explanation,
                                QuestionTypeName: _this.questionTypeName[o.QuestionType]
                            };
                        }).toArray()
                    }
                };
            }).toArray();
        };
        QuestionPlayer.prototype.render = function (id, num) {
            var t = this;
            var time = 150;
            var cell = this.get(id);
            var view = cell.submit == true ? 1 : 0;
            var showAnswer = view == 1 || view == 2;
            var editable = this.getResult(id);
            $(".ln-main-body", t.element).questionVideo({
                num: num,
                //unitId: currentCourse.UserUnitId,
                question: cell.Question,
                result: cell.Result,
                changed: $.proxy(t._onAnswerChanged, t),
                inited: function (evt, ui) {
                    t.viewModel.question = ui.viewModel;
                },
                showAnswer: showAnswer,
                editable: !editable,
                ischapter: true
            });
            this.initui(showAnswer, editable, id);
            window.setTimeout(function () {
                if (!t.isAnswering) {
                    $(".ln-main-body", t.element).show();
                    //                    $(".ln-main").mCustomScrollbar("destroy");
                    //                    $(".ln-main").mCustomScrollbar({ scrollButtons: { enable: true} });
                    t.isAnswering = true;
                }
            }, 200);
            $(".ln-main-body", t.element).show();
            $(".ln-close", t.element).show();
        };
        QuestionPlayer.prototype.initui = function (showAnswer, editable, id) {
            var vm = this.viewModel.question;
            var num = this.numFromCurrentIds = this.getNumFromCurrentIds(id);
            if (editable && this.currentIds.length > 1 && num != this.currentIds.length)
                $('.ln-next', this.element).removeClass('disable').show();
            if (!editable && this.currentIds.length > 1)
                $('.ln-next', this.element).addClass('disable').show();
            if (this.currentIds.length <= 1 || num == this.currentIds.length || (vm.question.QuestionType() == 15 && !editable))
                $('.ln-next', this.element).hide();
            if (num == this.currentIds.length && editable)
                $('.ln-resume', this.element).removeClass('disable').show();
            if (!editable && (vm.question.QuestionType() == 10 || vm.question.QuestionType() == 30) && num == this.currentIds.length)
                $('.ln-resume', this.element).addClass('disable').show();
            if (!editable && !(vm.question.QuestionType() == 10 || vm.question.QuestionType() == 30) || this.currentIds.length > 1 && num != this.currentIds.length)
                $('.ln-resume', this.element).hide();
            if (vm.question.QuestionType() == 10 || vm.question.QuestionType() == 30 || editable) {
                $('.ln-submit', this.element).hide();
            }
            else {
                $('.ln-submit', this.element).show().addClass('disable');
            }
        };
        QuestionPlayer.prototype.getNumFromCurrentIds = function (id) {
            var num = 0;
            for (var i = 0; i < this.currentIds.length; i++) {
                num++;
                if (this.currentIds[i] == id)
                    return num;
            }
        };
        QuestionPlayer.prototype.getNum = function (id, dotIndex) {
            var timeQuestions = this.plugin.player.timeQuestions;
            var num = 0, result = 0, len = typeof dotIndex == "number" && dotIndex >= 0 ? Math.min(timeQuestions.length, dotIndex + 1) : timeQuestions.length;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < timeQuestions[i].QuestionIds.length; j++) {
                    num++;
                    if (timeQuestions[i].QuestionIds[j] == id)
                        result = num;
                }
            }
            return result;
        };
        QuestionPlayer.prototype.get = function (id) {
            return Enumerable.from(this.cells).where(function (e) {
                return e.Id == id;
            }).firstOrDefault([]);
        };
        QuestionPlayer.prototype.mergeCells = function () {
            var _this = this;
            this.cells = Enumerable.from(this.cells).select(function (c) {
                var q = c.Question;
                var len = q.SubItems.length;
                var _result = Enumerable.from(_this.plugin.getConfig().results).where(function (r) {
                    if (r.Id == c.Id) {
                        r.submit = true;
                        return true;
                    }
                }).firstOrDefault(null);
                if (_result == null) {
                    _result = { Result: { CostSeconds: 0, Answers: [], Result: 0 } };
                    for (var j = 0; j < len; j++) {
                        if (_result.Result.Answers.length <= j)
                            _result.Result.Answers.push({ Answer: "", Result: 0 });
                    }
                }
                c = $.extend({}, _result, c);
                return c;
            }).toArray();
        };
        QuestionPlayer.prototype.getResult = function (id) {
            var cell = this.get(id);
            if (typeof cell.Result == 'undefined') {
                var r = Enumerable.from(this.plugin.getConfig().results).where(function (r) {
                    return r.Id == id;
                }).firstOrDefault(null);
                return r ? r.Result.Result == 1 : false;
            }
            else {
                return cell.Result.Result == 1;
            }
            return false;
        };
        QuestionPlayer.prototype.setResult = function (id) {
            var r = Enumerable.from(this.cells).where(function (r) {
                return r.Id == id;
            }).firstOrDefault(null);
            if (r) {
                if (r.Result) {
                    r.Result.Result = 0;
                    r.Result.Answers = [];
                }
                r.submit = false;
            }
        };
        QuestionPlayer.prototype.getResults = function (ids) {
            var _this = this;
            return Enumerable.from(ids).all(function (qid) {
                return _this.getResult(qid) == true;
            });
        };
        QuestionPlayer.prototype.setResults = function (ids) {
            for (var i = 0, len = ids.length; i < len; i++) {
                this.setResult(ids[i]);
            }
        };
        QuestionPlayer.prototype._onAnswerChanged = function () {
            var vm = this.viewModel.question;
            if (vm.question.QuestionType() == 10 || vm.question.QuestionType() == 30) {
                this._onSubmit();
                return;
            }
            else {
                if (Enumerable.from(vm.result().Answers).any("$.Answer.length>0"))
                    $('.ln-submit').removeClass('disable');
                else {
                    $('.ln-submit').addClass('disable');
                }
            }
        };
        QuestionPlayer.prototype._onSubmit = function () {
            this._updateAnswers(true);
        };
        QuestionPlayer.prototype._updateAnswers = function (submit) {
            var vm = this.viewModel.question;
            if (typeof vm == 'undefined' || vm == null)
                return;
            var cell = this.get(vm.question.Id());
            var q = cell.Question;
            var result = $.extend(true, { CostSeconds: 0 }, cell.Result, vm.result());
            result.CostSeconds += 1;
            cell.Result = result;
            cell.submit = submit || cell.submit;
            if (submit) {
                var totalCorrect = true;
                for (var i = 0; i < q.SubItems.length; i++) {
                    var sub = q.SubItems[i], subAnswer = cell.Result.Answers[i];
                    var correct = subAnswer.Result == 1;
                    if (sub.QuestionType == 10 || sub.QuestionType == 15 || sub.QuestionType == 18 || sub.QuestionType == 30) {
                        correct = cell.Result.Answers[i].Answer == sub.Answer;
                        subAnswer.Result = correct ? 1 : 2;
                    }
                    totalCorrect &= correct;
                }
                cell.Result.Result = totalCorrect ? 1 : 2;
            }
            this.update(cell);
            this.render(vm.question.Id(), vm.num());
            $(".ln-result-tip div").stop(false, true).show();
            if (totalCorrect) {
                $(".ln-result-tip div").html("恭喜你答对了！");
            }
            else {
                $(".ln-result-tip div").html("很遗憾你答错了，请继续作答");
            }
            $(".ln-result-tip").show();
            clearTimeout(this.tipTimeOut);
            this.tipTimeOut = setTimeout(function () {
                $(".ln-result-tip div").fadeOut(1000, function () {
                    $(".ln-result-tip").hide();
                });
            }, 1000); //如果修改动画和延迟时间，记得同步修改question.js中的 266行的时间 为了保持两个提示动画的同步
        };
        QuestionPlayer.prototype.update = function (cell) {
            var results = [];
            results.push({
                Id: cell.Id,
                Result: {
                    Answers: cell.Result.Answers,
                    CostSeconds: cell.Result.CostSeconds
                }
            });
            var con = this.plugin.getConfig();
            con.submit && con.submit.call(this, { sid: con.sid, results: results, userUnitId: 0, version: 2 });
        };
        QuestionPlayer.prototype.load = function (data, success) {
            $.ajax({
                url: this.plugin.getConfig().apiHost + "/v1/cloud/question/list",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                traditional: true,
                type: "Get",
                data: data,
                cache: false,
                success: success,
                error: function () {
                }
            });
        };
        QuestionPlayer.prototype.resume = function () {
            var _this = this;
            this.plugin.player.resume();
            window.setTimeout(function () {
                _this.element.hide();
                //if (navigator.appVersion.indexOf("MSIE 7.") !== -1) {
                //$(".content").css("z-index", "auto");
                //this.plugin.player.show();
                //$("#player,#player_api").removeAttr("style");
                //}
                _this.isAnswering = false;
                if (_this.plugin.player.isPaused())
                    _this.plugin.player.resume();
            }, 150);
            //this.callback(); todo:
        };
        QuestionPlayer.prototype.next = function () {
            var vm = this.viewModel.question;
            this.render(this.currentIds[this.numFromCurrentIds], vm.num() + 1);
        };
        QuestionPlayer.prototype.showConfirm = function (count) {
            $(".ln-close", this.element).hide();
            $(".ln-confirm p em", this.element).text(count);
            $(".ln-container", this.element).hide();
            $(".ln-confirm", this.element).show();
        };
        QuestionPlayer.prototype.showAnswer = function () {
            $(".ln-confirm", this.element).hide();
            $(".ln-container", this.element).show();
        };
        QuestionPlayer.prototype.renswer = function (ids) {
            var _this = this;
            this.transfer(ids[0], this.getNum(ids[0], this.plugin.currentIndexForDot), function () {
                _this.setResults(ids);
            });
            this.showAnswer();
        };
        return QuestionPlayer;
    }());
})(Video || (Video = {}));
;///<reference path='../plugin.ts'/>
///<reference path='../../event/pluginevent.ts' />
///<reference path='../../event/clipevent.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var CuepointPlugin = (function (_super) {
        __extends(CuepointPlugin, _super);
        function CuepointPlugin(config, player) {
            _super.call(this);
            this._config = {
                times: [
                    { time: 10 }
                ],
                callback: function (obj) {
                }
            };
            this._config = $.extend(true, this._config, config);
        }
        CuepointPlugin.prototype.onLoad = function (evt) {
            _super.prototype.onLoad.call(this, evt);
            this.player.addEventListener("onClipLoad", $.proxy(this.clipLoad, this));
        };
        CuepointPlugin.prototype.clipLoad = function (e) {
            e.clip.addEventListener("onCuepoint", $.proxy(this.cuepoint, this));
            e.clip.addCuepoint(this._config.times);
        };
        CuepointPlugin.prototype.cuepoint = function (obj) {
            this._config.callback(obj);
        };
        return CuepointPlugin;
    }(Video.PluginBase));
    Video.CuepointPlugin = CuepointPlugin;
})(Video || (Video = {}));
;///<reference path='../../../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='../plugin.ts' />
///<reference path='../../event/pluginevent.ts'/>
///<reference path='../../event/cuepointevent.ts' />
///<reference path='../../event/clipevent.ts' />
///<reference path='../../player.ts' />
///<reference path='../../../../document/v2/main/demon.player.ts' />
///<reference path='../../../../document/v2/core/demon.enum.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var DocumentPlugin = (function (_super) {
        __extends(DocumentPlugin, _super);
        function DocumentPlugin(config, player) {
            _super.call(this);
            this._config = {
                element: "",
                apiHost: "",
                accessToken: ""
            };
            this._documentPlayer = null;
            this._queue = [];
            this._currentPage = 1;
            this._key = 0;
            this.first = true;
            this._config.apiHost = player.setting.apiHost;
            this._config.accessToken = player.setting.accessToken;
            this._config = $.extend(true, this._config, config);
            //$(document).off("click", "#syncvideo").on("click", "#syncvideo", $.proxy(this.syncVideo, this));
            $("#syncvideo").click($.proxy(this.syncVideo, this));
        }
        DocumentPlugin.prototype.config = function () {
            return this._config;
        };
        DocumentPlugin.prototype.onLoad = function (evt) {
            var _this = this;
            _super.prototype.onLoad.call(this, evt);
            if (this.player.videoInfo == null || this.player.videoInfo.LinkDocumentId == 0)
                return;
            this._key = this.player.key;
            this.first = true;
            if (!this.first)
                return;
            //this._documentPlayer = new _document.Document.ExtendMain(this._config.element, {
            //    Document: {AccessToken: this._config.accessToken},
            //    Host: this._config.apiHost,
            //    isShowFullScreen: this._config.isShowFullScreen
            //});
            this._documentPlayer = new Demon.Player(this._config.element, {
                host: this._config.apiHost,
                document: null,
                items: []
            });
            if (this.player.setting.video.type == 'id')
                this._documentPlayer.play({
                    id: this.player.videoInfo.LinkDocumentId,
                    accesstoken: this._config.accessToken
                });
            else if (this.player.setting.video.type == 'code')
                this._documentPlayer.init(this.player.documentInfo);
            this._documentPlayer.onStart(function () {
                _this._documentPlayer.go(1);
                _this._currentPage = _this._documentPlayer.getCurrentNum();
            });
            this.first = false;
            this.player.addEventListener("onClipLoad", $.proxy(this.clipLoad, this));
            this.player.addEventListener("onStart", $.proxy(this.onStart, this));
            this.player.addEventListener("onSeek", $.proxy(this.onSeek, this));
            this.player.addEventListener("onFinish", $.proxy(this.onFinish, this));
        };
        DocumentPlugin.prototype.resize = function () {
            this._documentPlayer.resize();
        };
        DocumentPlugin.prototype.clipLoad = function (e) {
            e.clip.addEventListener("onCuepoint", $.proxy(this.cuepoint, this));
        };
        DocumentPlugin.prototype.onSeek = function () {
            var _this = this;
            window.setTimeout(function () {
                var time = parseInt("" + _this.player.getTime(), 10) * 1000, td = _this.player.timeDocuments, len = td ? td.length : 0;
                if (len == 0)
                    return;
                for (var i = 0; i < len; i++) {
                    if (time < td[i].time)
                        break;
                }
                if (i == 0 || len == 0)
                    return;
                _this._queue = td[i - 1].PageNumber;
                if (_this._currentPage != _this._documentPlayer.getCurrentNum())
                    return;
                var gotoPage = i == 0 ? 1 : td[i - 1].PageNumber;
                _this._currentPage = gotoPage;
                _this.go(gotoPage);
            }, 200);
        };
        DocumentPlugin.prototype.onFinish = function () {
            this.first = true;
        };
        DocumentPlugin.prototype.onStart = function () {
            if (!this.first)
                return;
            this.first = false;
            this._queue = 1;
            this._currentPage = 1;
            if (this._currentPage != this._documentPlayer.getCurrentNum())
                this.go(this._queue);
        };
        DocumentPlugin.prototype.cuepoint = function (e) {
            if (e.obj.type == 'document' || e.obj.type == 'any') {
                this._queue = e.obj.PageNumber;
                if (this._currentPage != this._documentPlayer.getCurrentNum() || this._documentPlayer.getStatus() != Demon.Status.playing)
                    return;
                this._currentPage = e.obj.PageNumber;
                this.go(e.obj.PageNumber);
            }
        };
        DocumentPlugin.prototype.syncVideo = function () {
            this._currentPage = this._queue;
            this.go(this._queue);
        };
        DocumentPlugin.prototype.isSync = function () {
            if (this._documentPlayer == null || this.player.timeDocuments == null || this.player.timeDocuments.length == 0 || this._documentPlayer.getStatus() != Demon.Status.playing)
                return true;
            return this._currentPage == this._documentPlayer.getCurrentNum();
        };
        DocumentPlugin.prototype.go = function (num) {
            // if (num != this._documentPlayer.getCurrentPage())
            if (this._documentPlayer.getStatus() == Demon.Status.playing)
                this._documentPlayer.go(num);
        };
        return DocumentPlugin;
    }(Video.PluginBase));
    Video.DocumentPlugin = DocumentPlugin;
})(Video || (Video = {}));
;///<reference path='../../../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='../plugin.ts' />
///<reference path='../../event/pluginevent.ts'/>
///<reference path='../../event/clipevent.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var InnerCuepointPlugin = (function (_super) {
        __extends(InnerCuepointPlugin, _super);
        function InnerCuepointPlugin(config, player) {
            _super.call(this);
            //#必须带有time属性,其他可选
            this._config = {
                times: [
                    { time: 0 }
                ]
            };
            this.currentkey = "";
            this._config = $.extend(true, this._config, config);
        }
        InnerCuepointPlugin.prototype.onLoad = function (evt) {
            _super.prototype.onLoad.call(this, evt);
            this.player.addEventListener("onClipLoad", $.proxy(this.clipLoad, this));
        };
        InnerCuepointPlugin.prototype.clipLoad = function (e) {
            if (this.currentkey != this.player.key && this.currentkey == "") {
                this.currentkey = this.player.key;
            }
            else {
                return;
            }
            var times = this.uniq();
            e.clip.addCuepoint(times);
        };
        InnerCuepointPlugin.prototype.uniq = function () {
            var times = this.player.times.sort(function (a, b) {
                return a.time - b.time;
            }), len = times.length, result = [];
            for (var i = 0; i < len;) {
                var j = i + 1;
                if (j < len) {
                    if (times[i].time == times[j].time) {
                        var obj = $.extend(true, times[i], times[j]);
                        obj.isShow = true;
                        obj.type = "any";
                        result.push(obj);
                        i += 2;
                    }
                    else {
                        result.push(times[i]);
                        i++;
                    }
                }
                else {
                    result.push(times[i]);
                    i++;
                }
            }
            return result;
        };
        return InnerCuepointPlugin;
    }(Video.PluginBase));
    Video.InnerCuepointPlugin = InnerCuepointPlugin;
})(Video || (Video = {}));
;///<reference path='../../../../../addins/jquery/jquery.d.ts' />
///<reference path='../plugin.ts' />
///<reference path='../../event/pluginevent.ts'/>
///<reference path='../../playerbase.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var PositionPlugin = (function (_super) {
        __extends(PositionPlugin, _super);
        function PositionPlugin(config, player) {
            _super.call(this);
            this._isfirstresume = true;
            this._config = {
                autoPosition: true,
                intervalTime: 20000,
                beginTime: 0,
                callback: null
            };
            this._config = $.extend(this._config, config);
        }
        PositionPlugin.prototype.config = function () {
            return this._config;
        };
        PositionPlugin.prototype.getConfig = function () {
            return this._config;
        };
        PositionPlugin.prototype.onLoad = function (evt) {
            console && console.log('position plugin is loaded');
            _super.prototype.onLoad.call(this, evt);
            this.player.addEventListener("onResume", $.proxy(this.resume, this));
        };
        PositionPlugin.prototype.resume = function () {
            if (this._isfirstresume) {
                this._isfirstresume = false;
                console && console.log('position plugin is started');
                this.position();
                this.interval();
            }
        };
        PositionPlugin.prototype.position = function () {
            var time = 0;
            if (this._config.autoPosition)
                time = parseInt($.cookie("" + this.player.key));
            if (this._config.beginTime > 0)
                time = this._config.beginTime;
            if (time > 0)
                this.player.seek(Math.round(time));
            console && console.log('position seek time:' + Math.round(time));
        };
        PositionPlugin.prototype.interval = function () {
            var _this = this;
            window.setInterval(function () {
                var state = _this.player.getState();
                if (state == Video.STATE['playing']) {
                    var time = Math.round(_this.player.getTime());
                    _this._config.autoPosition && $.cookie("" + _this.player.key, time);
                    _this._config.callback && _this._config.callback.call && _this._config.callback.call(_this, time);
                }
            }, this._config.intervalTime);
        };
        return PositionPlugin;
    }(Video.PluginBase));
    Video.PositionPlugin = PositionPlugin;
})(Video || (Video = {}));
;///<reference path='../playerbase.ts' />
///<reference path='../event/pluginevent.ts'/>
///<reference path='./questionplugin/questionplugin.ts'/>
///<reference path='./positionplugin/positionplugin.ts'/>
///<reference path='./documentplugin/documentplugin.ts'/>
///<reference path='./cuepointplugin/cuepointplugin.ts'/>
///<reference path='./innercuepointplugin/innercuepointplugin.ts'/>
var Video;
(function (Video) {
    var PluginFactory = (function () {
        function PluginFactory() {
            this._plugins = {};
        }
        PluginFactory.prototype.init = function (player, plugins) {
            for (var n in plugins) {
                switch (n) {
                    case "question":
                        this._plugins[n] = new Video.QuestionPlugin(plugins[n], player);
                        break;
                    case "position":
                        this._plugins[n] = new Video.PositionPlugin(plugins[n], player);
                        break;
                    case "document":
                        this._plugins[n] = new Video.DocumentPlugin(plugins[n], player);
                        break;
                    case "cuepoint":
                        this._plugins[n] = new Video.CuepointPlugin(plugins[n], player);
                        break;
                    case "innerCuepoint":
                        this._plugins[n] = new Video.InnerCuepointPlugin(plugins[n], player);
                        break;
                    default:
                        this._plugins[n] = plugins[n];
                        break;
                }
                if (typeof this._plugins[n].dispatchEvent == 'function')
                    this._plugins[n].dispatchEvent(new Video.PluginEvent("onLoad", player));
            }
        };
        PluginFactory.prototype.get = function (name) {
            return this._plugins[name] || null;
        };
        return PluginFactory;
    }());
    Video.PluginFactory = PluginFactory;
})(Video || (Video = {}));
;///<reference path='../../../../addins/jquery/jquery.d.ts' />
var Multiscreen;
(function (Multiscreen) {
    var Sreen2Base = (function () {
        function Sreen2Base(setting) {
            this.config = {
                selector: ".s2",
                minLeftWidth: 260,
                minRightWidth: 300,
                threshold: 560
            };
            this.wrap = null;
            this.left = null;
            this.right = null;
            this.splite = null;
            this.resizeTick = 0;
            this.leftDomId = "";
            this.rightDomId = "";
            this.s2DomId = "";
            $.extend(this.config, setting);
            var timestamp = (new Date()).getTime();
            this.leftDomId = "player" + timestamp,
                this.rightDomId = "documentPlayer" + timestamp,
                this.s2DomId = "s2Player" + timestamp;
            $(this.config.selector).empty().append('<div id="' + this.s2DomId + '" class="s2">' +
                '   <div id="' + this.leftDomId + '" class="s2-left" style = "background-color: #000;" ></div>' +
                '   <div class="s2-right">' +
                '       <div class="s2-split"></div>' +
                '       <div id="' + this.rightDomId + '" class="docplayer"></div>' +
                '   </div>' +
                '</div>');
            this.wrap = $("#" + this.s2DomId, this.config.selector).css({ "minWidth": this.config.minLeftWidth + this.config.minRightWidth });
            this.left = $(".s2-left", this.config.selector);
            this.right = $(".s2-right", this.config.selector);
            this.splite = $(".s2-split", this.config.selector);
            this._init();
        }
        Sreen2Base.prototype._init = function () {
            var _this = this;
            //注册拖拽用的事件
            this.splite.mousedown(function (e) {
                _this._startDrag(e.pageX);
            }).mouseup(function () {
                _this._stopDrag();
            });
            $(window).resize(function () {
                clearTimeout(_this.resizeTick);
                _this.resizeTick = setTimeout(function () {
                    var flag = "step", leftWidth = _this.left.width(), rightWidth = _this.right.width();
                    if (_this.splite.data("isAvg")) {
                        flag = "avg";
                    }
                    else if (Math.abs(_this.splite.data("prevWidht") - _this.wrap.width()) > 200) {
                        if (Math.abs(leftWidth - rightWidth) < 6) {
                            //两个播放器宽度 差距在5px 认为两个是平均分
                            flag = "avg";
                            _this.splite.data("isAvg", 1);
                        }
                        else {
                            //容器变化的宽度 差距大于240px 当作最大化，保持比例
                            flag = "keep";
                        }
                    }
                    _this._onResize(flag);
                }, 0);
            });
        };
        //清空鼠标选中的内容并禁用选择功能
        Sreen2Base.prototype._disableSelect = function () {
            if (window.getSelection) {
                if (window.getSelection()['empty']) {
                    window.getSelection()['empty']();
                }
                else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
                $(this.wrap).css({ "-moz-user-select": 'none', "-ms-user-select": "none", "-webkit-user-select": "none" });
            }
            else if (document.selection) {
                $(this.wrap).attr("unselectable", "on");
                document.selection.empty();
            }
        };
        Sreen2Base.prototype._enableSelet = function () {
            if (window.getSelection) {
                if (window.getSelection()['empty']) {
                    window.getSelection()['empty']();
                }
                else if (window.getSelection().removeAllRanges) {
                    window.getSelection().removeAllRanges();
                }
                $(this.wrap).css({ "-moz-user-select": 'inherit', "-ms-user-select": "inherit", "-webkit-user-select": "inherit" });
            }
            else if (document.selection) {
                $(this.wrap).removeAttr("unselectable");
                document.selection.empty();
            }
        };
        //pageX 当前鼠标的x坐标值
        Sreen2Base.prototype._startDrag = function (pageX) {
            var _this = this;
            this._disableSelect();
            var paddingNum = Math.max(this.config.minRightWidth, this.config.minLeftWidth);
            //flash 上不支持鼠标事件。 加大滑块的宽度 盖在flash上 使能响应到鼠标时间
            this.splite.css({ "padding": "0 " + paddingNum + "px", "marginLeft": "-" + paddingNum + "px", "z-index": 100 }).data({ "isAvg": 0, "pageX": pageX });
            //鼠标离开范围的时候停止拖动
            this.wrap.mousemove(function (e) {
                _this._dragging(e.pageX);
            }).bind("mouseleave mouseup", function () {
                _this._stopDrag();
            });
        };
        //pageX 当前鼠标的x坐标值
        Sreen2Base.prototype._dragging = function (pageX) {
            this._disableSelect();
            var oldPageX = this.splite.data("pageX"), leftOffset = oldPageX - pageX;
            if (Math.abs(leftOffset) > 5) {
                var newLeftW = this.left.width() - leftOffset;
                var newRightW = this.right.width() + leftOffset;
                //避免过多的dom操作和限制最小值
                if (newLeftW < this.config.minLeftWidth) {
                    newLeftW = this.config.minLeftWidth;
                    newRightW = this.wrap.width() - newLeftW;
                }
                if (newRightW < this.config.minRightWidth) {
                    newRightW = this.config.minRightWidth;
                    newLeftW = this.wrap.width() - newRightW;
                }
                //下次移动的比较值
                this.splite.data("pageX", pageX);
                this.left.width(newLeftW);
                this.right.width(newRightW);
            }
        };
        Sreen2Base.prototype._stopDrag = function () {
            this.wrap.unbind("mousemove mouseleave mouseup");
            this.splite.css({ "padding": 0, "marginLeft": 0 });
            this._enableSelet();
            this.fixDrag();
        };
        //窗口变化的响应事件
        Sreen2Base.prototype._onResize = function (size) {
            var t = this;
            var spliteWidth = this.splite.width();
            var w = this.wrap.width(), leftWidth = this.left.width(), rightWidth = this.right.width();
            if (w < this.config.threshold) {
                w = this.config.threshold;
            }
            switch (size) {
                case "avg":
                    var halfWidth = w / 2;
                    leftWidth = Math.max(halfWidth, this.config.minLeftWidth);
                    rightWidth = Math.max(halfWidth, this.config.minRightWidth);
                    this.left.width(leftWidth);
                    this.right.width(rightWidth);
                    break;
                case "keep":
                    var oldWidth = parseInt(this.splite.data("prevWidht"), 10);
                    //放大
                    leftWidth = this.left.width() / oldWidth * w;
                    rightWidth = this.right.width() / oldWidth * w;
                    if (leftWidth < this.config.minLeftWidth) {
                        leftWidth = this.config.minLeftWidth;
                        rightWidth = w - this.config.minLeftWidth;
                    }
                    else if (rightWidth < this.config.minRightWidth) {
                        leftWidth = w - this.config.minRightWidth;
                        rightWidth = this.config.minRightWidth;
                    }
                    this.left.width(leftWidth);
                    this.right.width(rightWidth);
                    break;
                case "step":
                    var oldWidth = parseInt(this.splite.data("prevWidht"), 10);
                    if (w > oldWidth) {
                        //放大
                        if (oldWidth < this.config.minRightWidth + this.config.minLeftWidth) {
                            this.wrap.data("fromMin", 1);
                        }
                        if (this.wrap.data("fromMin") && rightWidth < this.config.threshold) {
                            if (w > this.config.minRightWidth + this.config.minLeftWidth) {
                                rightWidth = w - leftWidth;
                            }
                        }
                        else {
                            this.wrap.data("fromMin", 0);
                            //优先放大小的区域
                            if (leftWidth > rightWidth) {
                                leftWidth = Math.max(leftWidth, this.config.minLeftWidth);
                                rightWidth = w - leftWidth;
                                rightWidth = Math.max(rightWidth, this.config.minRightWidth);
                            }
                            else {
                                rightWidth = Math.max(rightWidth, this.config.minRightWidth);
                                leftWidth = w - rightWidth;
                                leftWidth = Math.max(leftWidth, this.config.minLeftWidth);
                            }
                        }
                    }
                    else {
                        if (w > this.config.threshold * 2) {
                            //缩小 优先缩小大的区域
                            if (leftWidth > rightWidth) {
                                rightWidth = Math.max(rightWidth, this.config.minRightWidth);
                                leftWidth = w - rightWidth;
                                leftWidth = Math.max(leftWidth, this.config.minLeftWidth);
                            }
                            else {
                                leftWidth = Math.max(leftWidth, this.config.minLeftWidth);
                                rightWidth = w - leftWidth;
                                rightWidth = Math.max(rightWidth, this.config.minRightWidth);
                            }
                        }
                        else {
                            if (leftWidth > this.config.minLeftWidth) {
                                rightWidth = Math.max(rightWidth, this.config.minRightWidth);
                                leftWidth = w - rightWidth;
                                leftWidth = Math.max(leftWidth, this.config.minLeftWidth);
                            }
                            else {
                                leftWidth = Math.max(leftWidth, this.config.minLeftWidth);
                                rightWidth = w - leftWidth;
                                rightWidth = Math.max(rightWidth, this.config.minRightWidth);
                            }
                        }
                    }
                    this.left.width(leftWidth);
                    this.right.width(rightWidth);
                    break;
            }
            //下次变化宽度时用来判断是放大还是缩小的依据
            this.splite.data("prevWidht", w);
            this.fixDrag(leftWidth, rightWidth);
            this.resize();
        };
        Sreen2Base.prototype.getConfig = function () {
            return this.config || {};
        };
        Sreen2Base.prototype.fixDrag = function (newLeftW, newRightW) {
            if (newLeftW === void 0) { newLeftW = this.left.width(); }
            if (newRightW === void 0) { newRightW = this.right.width(); }
            //请在子类实现
        };
        //非窗口大小变化时需要调用。用来改变两块的内容大小。
        Sreen2Base.prototype.resize = function () {
            //请在子类实现
        };
        return Sreen2Base;
    }());
    Multiscreen.Sreen2Base = Sreen2Base;
})(Multiscreen || (Multiscreen = {}));
;///<reference path='../../../../addins/jquery/jquery.d.ts' />
///<reference path='./screen2base.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Multiscreen;
(function (Multiscreen) {
    var S2videodoc = (function (_super) {
        __extends(S2videodoc, _super);
        function S2videodoc(setting) {
            var _this = this;
            _super.call(this, setting);
            this.setting = setting;
            this.options = null;
            this.fixDragTick = 0;
            this.videoPlayer = null;
            this.docPlayer = null;
            this.options = _super.prototype.getConfig.call(this);
            this.wrap.append('<div class="s2-sync" style="display:none;" id="syncvideo">' +
                '   <label>回到老师正在讲的页面</label><i></i>' +
                '</div>');
            this.options.videoPlayer && this.options.videoPlayer.onStart(function () {
                !_this.options.docPlayer && (_this.options.docPlayer = _this.options.videoPlayer.getCustomPlugin("document"));
            });
            //同步按钮
            setInterval(function () {
                _this.options.docPlayer && _this.toggleSync(_this.options.docPlayer.isSync());
            }, 500);
            $(".s2 .s2-right .docplayer").height("100%");
            //调整文档高度 高度计算不对
            //$(".s2 .s2-right .docplayer").height(this.wrap.height());
        }
        S2videodoc.prototype._startDrag = function (pageX) {
            this.left.find("object").width(this.left.width());
            _super.prototype._startDrag.call(this, pageX);
        };
        S2videodoc.prototype._stopDrag = function () {
            _super.prototype._stopDrag.call(this);
            this.left.find("object").width(this.left.width());
            this.resize();
        };
        S2videodoc.prototype.fixDrag = function (newLeftW, newRightW) {
            //fix ie下resizes是文档播放器高度错误
            //$(".s2 .s2-right .docplayer").height(this.wrap.height());
            var _this = this;
            if (newLeftW === void 0) { newLeftW = this.left.width(); }
            if (newRightW === void 0) { newRightW = this.right.width(); }
            //修正视频播放器快速拖动时的画面比例错误
            clearTimeout(this.fixDragTick);
            this.fixDragTick = setTimeout(function () {
                _this.left.width(newLeftW - 1);
                setTimeout(function () {
                    if (newLeftW + newRightW != _this.wrap.width()) {
                        newLeftW = _this.wrap.width() - newRightW;
                        newLeftW = Math.max(newLeftW, _this.options.minLeftWidth);
                    }
                    _this.left.width(newLeftW);
                }, 30);
            }, 20);
        };
        S2videodoc.prototype.toggleSync = function (state) {
            if (state) {
                this.wrap.find(".s2-sync").hide();
            }
            else {
                this.wrap.find(".s2-sync").show();
            }
        };
        //非窗口大小变化时需要调用。用来改变播放器的内容大小
        S2videodoc.prototype.resize = function () {
            this.left.find("object").width(this.left.width());
            //this.right.height(this.wrap.height());
            this.options.docPlayer && this.options.docPlayer.resize();
        };
        return S2videodoc;
    }(Multiscreen.Sreen2Base));
    Multiscreen.S2videodoc = S2videodoc;
})(Multiscreen || (Multiscreen = {}));
;///<reference path='../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../addins/swfobject/swfobject.d.ts' />
///<reference path='./playersetting.ts' />
var Video;
(function (Video) {
    var FlashHelper = (function () {
        function FlashHelper(element, setting) {
            this.element = element;
            this.setting = setting;
            this.stylePrefix = 'flashdetect-';
            this.hasFlash = true;
            this.supportVideo = !!(document.createElement('video').canPlayType);
            this.detect();
        }
        FlashHelper.prototype.detect = function () {
            var ver = swfobject.getFlashPlayerVersion(), ua = window.navigator.userAgent, androidVersion = "", iPad = (/iPad/i).test(ua), iPhone = (/iPhone/i).test(ua), matchArr = ua.match(/Android\s?(\d+.\d+(.\d+)?)/i);
            if (matchArr && matchArr.length > 2) {
                androidVersion = matchArr[1];
            }
            if (ver.major >= 10 && androidVersion < "4.0.3" && !iPad && !iPhone) {
                this.hasFlash = true;
            }
            else {
                this.hasFlash = false;
                this.show();
            }
        };
        FlashHelper.prototype.show = function (msg) {
            this.appendStyle();
            this.showError(msg);
        };
        FlashHelper.prototype.appendStyle = function () {
            var styleId = this.stylePrefix + this.element;
            if ($("#" + styleId).length > 0)
                return;
            var id = "#" + this.element;
            var style = '<style type="text/css" id="' + styleId + '">' +
                id + ' { width: 100%; height: 100%; background-color: #000; overflow: hidden; }' +
                id + ' .player-warn { width: 425px; height: 100px; background: url(' + this.setting.staticHost + 'nae/images/warn.png) no-repeat 188px 0; margin: 125px auto 0; padding-top: 75px; }' +
                id + ' .player-warn p { height: 30px; font: 18px/30px "MicroSoft YaHei"; text-align: center; color: #B5B5B5; }' +
                id + ' .player-warn p a { color: #EE750A; text-decoration: none; }' +
                '</style>';
            $('head').append(style);
        };
        FlashHelper.prototype.showError = function (msg) {
            if (!this.hasFlash) {
                msg = msg || '<p>如果您无法播放视频，请确认您是否安装Flash</p><p><a href="http://get.adobe.com/cn/flashplayer/" target="_blank">点击下载</a>安装最新Flash Player播放器</p>';
                msg = '<div class="player-warn">' + msg + '</div>';
                $("#" + this.element).html(msg);
            }
        };
        return FlashHelper;
    }());
    Video.FlashHelper = FlashHelper;
})(Video || (Video = {}));
;///<reference path='../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../addins/jquery.cookie/jquery.cookie.d.ts' />
///<reference path='../../../addins/flowplayer/flowplayer.d.ts' />
///<reference path='../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='../../../addins/common/event.ts' />
///<reference path='./event/playerevent.ts' />
///<reference path='./event/clipEvent.ts' />
///<reference path='./playersetting.ts' />
///<reference path='./flashdetect.ts' />
///<reference path='./playerException.ts' />
///<reference path='./plugin/pluginfactory.ts' />
///<reference path='./clip/clip.ts' />
///<reference path='../../../addins/multiscreen/screen2videodoc.ts' />
///<reference path='./utils.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    (function (PlayerType) {
        PlayerType[PlayerType["unknown"] = 0] = "unknown";
        PlayerType[PlayerType["html5"] = 1] = "html5";
        PlayerType[PlayerType["flash"] = 2] = "flash";
    })(Video.PlayerType || (Video.PlayerType = {}));
    var PlayerType = Video.PlayerType;
    (function (STATE) {
        STATE[STATE["loaded"] = 0] = "loaded";
        STATE[STATE["unstarted"] = 1] = "unstarted";
        STATE[STATE["buffering"] = 2] = "buffering";
        STATE[STATE["playing"] = 3] = "playing";
        STATE[STATE["paused"] = 4] = "paused";
        STATE[STATE["ended"] = 5] = "ended";
    })(Video.STATE || (Video.STATE = {}));
    var STATE = Video.STATE;
    var utils = Video.utils;
    var PlayerBase = (function (_super) {
        __extends(PlayerBase, _super);
        function PlayerBase(element, setting) {
            if (element === void 0) { element = "player"; }
            if (setting === void 0) { setting = null; }
            _super.call(this);
            this.element = element;
            this.setting = setting;
            this.playerException = new Video.PlayerException(this);
            this.key = ""; //播放器唯一标识
            this.playerType = PlayerType.unknown;
            //public type:any = null;
            this.innerPlayer = null;
            this.originalElement = null;
            this.videoInfo = null;
            this.timeDocuments = null;
            this.documentInfo = null;
            this.timeQuestions = null;
            this.times = [];
            this.seekTick = 0; //seek settimeout
            this.sthOption = null;
            this.tryServerRequestNum = 0;
            setting.accessToken = setting.video.accessToken;
            this.settingHelper = new Video.PlayerSetting();
            this.originalElement = element;
        }
        PlayerBase.prototype.replay = function () {
            if (this.innerPlayer) {
                this.innerPlayer.play();
            }
        };
        PlayerBase.prototype.play = function (arg, quality) {
            this.element = this.originalElement + "Wrap";
            $("#" + this.originalElement).html('<div id="' + this.element + '" style="height:100%;width:100%;">');
            //fix BUG #23199 未关闭作答页面，更换id后点击播放，没有清除答题，无法加载新视频（详情见附件）
            $("#" + this.element).prev(".chaptervideo").remove();
            this.key = (new Date()).getTime();
            var data = null;
            var defaultVideo = {
                id: null,
                code: null,
                url: null,
                quality: quality >= 0 && quality <= 4 ? quality : this.setting.video["quality"] >= 0 && this.setting.video["quality"] <= 4 ? this.setting.video["quality"] : 2,
                autoPlay: typeof arg["autoPlay"] == "boolean" ? arg["autoPlay"] : !!this.setting.video["autoPlay"],
                autoBuffering: typeof arg["autoBuffering"] == "boolean" ? arg["autoBuffering"] : !!this.setting.video["autoBuffering"],
                type: null
            };
            this.setting.video = typeof this.setting.video == "object" ? this.setting.video : defaultVideo;
            if (typeof arg == 'object') {
                if (typeof arg.id == 'number' && arg.id > 0) {
                    arg.type = 'id';
                }
                else if (typeof arg.code == 'string' && arg.code != "") {
                    arg.type = 'code';
                }
                else if (typeof arg.url == 'string' && arg.url != "") {
                    arg.type = 'url';
                }
            }
            else {
                if (typeof arg == 'number' && arg != 0) {
                    arg = { id: arg, type: 'id' };
                }
                else if (typeof arg == 'string' && arg != "") {
                    if (arg.indexOf('http:') > -1) {
                        arg = { url: arg, type: 'url' };
                    }
                    else {
                        arg = { code: arg, type: 'code' };
                    }
                }
            }
            if (arg.type == null)
                return;
            this.setting.video = $.extend({}, defaultVideo, arg);
            this.times = [];
            this.timeDocuments = null;
            this.timeQuestions = null;
            this.initPlayer();
        };
        PlayerBase.prototype.initPlayer = function () {
        };
        PlayerBase.prototype.converters = function (data) {
            var _this = this;
            var values = data;
            if (utils.isObject(data))
                values = {};
            if (utils.isArray(data))
                values = [];
            if (utils.isObject(data) || utils.isArray(data)) {
                utils.forInOwn(data, function (v, i, obj) {
                    if (!utils.isNumber(i))
                        i = utils.camelCase(i);
                    values[i] = _this.converters(v);
                });
            }
            return values;
        };
        PlayerBase.prototype.dataFilter = function (data, type) {
            if (type == "json") {
                data = JSON.stringify(this.converters(JSON.parse(data)));
            }
            return data;
        };
        PlayerBase.prototype.getVideo = function () {
            var _this = this;
            var tempDate = {};
            if (this.setting.video.type == 'id')
                tempDate = { videoId: this.setting.video.id, accessToken: this.setting.accessToken };
            else if (this.setting.video.type == 'code')
                tempDate = { videoCode: this.setting.video.code };
            var settings = this.setting.store['getVideo'];
            if (utils.isString(settings)) {
                settings = {
                    url: settings
                };
            }
            var opts = $.extend(true, {}, settings, {
                data: tempDate,
                success: function (videoInfo) {
                    videoInfo = _this.converters(videoInfo);
                    if (_this.playerException.detect(videoInfo)) {
                        _this.videoInfo = _this.formatVideoBaseInfo(videoInfo);
                        _this.videoInfo.ApiHost = _this.setting.apiHost;
                    }
                    else {
                        _this.videoInfo = null;
                    }
                },
                error: function (xhr) {
                    try {
                        var json = $.parseJSON(xhr.responseType);
                        _this.playerException.loadError(json);
                    }
                    catch (e) {
                    }
                },
                dataFilter: this.dataFilter,
                cache: false,
                complete: function (xmlHttpRequest, status) {
                    if (status == 'timeout') {
                        _this.playerException.queryFail();
                    }
                }
            });
            return $.ajax(opts);
        };
        PlayerBase.prototype.getUrlByQuality = function (data) {
            var _this = this;
            var defaultVideoObj = data.DefaultFile;
            var defaultOption = {
                quality: defaultVideoObj.Quality,
                audioIndex: defaultVideoObj.AudioIndex,
                types: defaultVideoObj.Type
            };
            if (this.setting.video.type == 'id') {
                defaultOption.videoId = data.Id;
                defaultOption.accessToken = this.setting.accessToken;
            }
            else if (this.setting.video.type == 'code') {
                defaultOption.videoCode = this.setting.video.code;
            }
            var setting = this.setting.store['getUrlByQuality'];
            if (utils.isString(setting)) {
                setting = {
                    url: setting
                };
            }
            var opts = $.extend(true, {}, setting, {
                data: defaultOption,
                dataFilter: this.dataFilter,
                success: function (videoDetail) {
                    videoDetail = _this.converters(videoDetail);
                    defaultVideoObj.FileName = videoDetail[0].Urls;
                    _this.videoInfo.DefaultFile = defaultVideoObj;
                    _this.videoInfo.accessToken = _this.setting.accessToken;
                },
                cache: false
            });
            return $.ajax(opts);
        };
        PlayerBase.prototype.getVideoQuestion = function () {
            var _this = this;
            var tempDate = { videoId: this.setting.video.id, accessToken: this.setting.accessToken };
            return $.ajax({
                url: this.setting.apiHost + "/v2/cloud/video/word",
                dataType: "jsonp",
                jsonp: "jsoncallback",
                type: "Get",
                data: tempDate,
                cache: false,
                success: function (timequestions) {
                    if (timequestions.Code == 0) {
                        _this.timeQuestions = Enumerable.from(timequestions.Data.Relations).where(function (r) {
                            return r.IsSubjective == false && r.Duration > 0;
                        }).select(function (r) {
                            return {
                                time: r.Duration,
                                QuestionIds: r.QuestionIds,
                                IsSubjective: r.IsSubjective,
                                type: "question",
                                isShow: true
                            };
                        }).toArray().sort(function (a, b) {
                            return a.time - b.time;
                        });
                        _this.times = _this.times.concat(Enumerable.from(_this.timeQuestions).select(function (r) {
                            return {
                                time: r.time * 1000,
                                QuestionIds: r.QuestionIds,
                                IsSubjective: r.IsSubjective,
                                type: "question",
                                isShow: true
                            };
                        }).toArray());
                    }
                    else {
                        window.console && console.log("getVideoQuestion：" + timequestions.Message);
                    }
                }
            });
        };
        PlayerBase.prototype.getVideoDocument = function () {
            var _this = this;
            var tempDate = {}, url = "";
            if (this.setting.video.type == 'id') {
                tempDate = { videoId: this.setting.video.id, accessToken: this.setting.accessToken };
                url = "/v2/cloud/video/document";
            }
            else if (this.setting.video.type == 'code') {
                tempDate = { videoCode: this.setting.video.code };
                url = "/v2/cloud/video/document/query";
            }
            return $.ajax({
                url: this.setting.apiHost + url,
                dataType: "jsonp",
                jsonp: "jsoncallback",
                type: "get",
                data: tempDate,
                cache: false,
                success: function (timedocument) {
                    if (timedocument.Code == 0 && timedocument.Data != null) {
                        _this.documentInfo = timedocument.Data;
                        _this.timeDocuments = Enumerable.from(timedocument.Data.Relations).select(function (r) {
                            return { time: r.Duration * 1000, PageNumber: r.PageNumber, type: "document", isShow: false };
                        }).toArray().sort(function (a, b) {
                            return a.time - b.time;
                        });
                        _this.times = _this.times.concat(_this.timeDocuments);
                    }
                    else {
                        window.console && console.log("getVideoDocument：" + timedocument.Message);
                    }
                }
            });
        };
        PlayerBase.prototype.formatVideoBaseInfo = function (data) {
            var videoExtension = this.playerType == PlayerType.html5 ? 'mp4' : 'f4v';
            var obj = {
                Id: data.Id,
                Title: data.Title,
                VideoType: data.VideoType,
                DefaultAudioIndex: data.DefaultAudioIndex,
                ResourceStatus: data.ResourceStatus,
                Duration: data.Duration,
                LinkDocumentId: data.LinkDocumentId,
                LinkWordId: data.LinkWordId,
                ScreenshotInterval: data.ScreenshotInterval,
                ScreenshotPath: data.ScreenshotPath,
                ScreenshotWidth: data.ScreenshotWidth,
                ScreenshotHeight: data.ScreenshotHeight,
                //Hosts: data.Hosts,
                FrontCoverUrl: data.FrontCoverUrl,
                SubTitle: data.Subtitles,
                M3U8S: data.M3U8S,
                Files: Enumerable.from(data.Files).where(function (o) {
                    if (typeof data.VideoType == 'undefined') {
                        return true;
                    }
                    else if (data.VideoType == 0 || data.VideoType == 2) {
                        if (videoExtension == 'mp4') {
                            return o.Type != 1;
                        }
                        else if (videoExtension == 'f4v') {
                            return o.Type != 2;
                        }
                    }
                    else {
                        return o.Type == 3;
                    }
                }).select(function (o) {
                    return {
                        Quality: o.Quality,
                        Type: o.Type,
                        AudioIndex: o.AudioIndex,
                        AudioTitle: o.AudioTitle,
                        AudioLanguage: o.AudioLanguage
                    };
                }).toArray().sort(function (a, b) {
                    var sort1 = b.Quality - a.Quality;
                    var sort2 = b.AudioIndex - a.AudioIndex;
                    return sort1 == 0 ? sort2 : sort1;
                })
            };
            obj.DefaultSubtitle = Enumerable.from(data.Subtitles).where(function (o) {
                return o.IsDefault;
            }).toArray()[0];
            obj.DefaultFiles = Enumerable.from(obj.Files).where(function (o) {
                return o.AudioIndex == data.DefaultAudioIndex;
            }).toArray();
            var defualtQuality = this.setting.video["quality"];
            obj.DefaultFile = (function () {
                var files = obj.DefaultFiles;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].Quality <= defualtQuality) {
                        return files[i];
                    }
                }
                for (var i = files.length - 1; i >= 0; i--) {
                    if (files[i].Quality >= defualtQuality) {
                        return files[i];
                    }
                }
            })();
            return obj;
        };
        PlayerBase.prototype.toVideoInfo = function (data) {
            var videoExtension = this.playerType == PlayerType.html5 ? 'mp4' : 'f4v';
            var obj = {
                Id: data.Id,
                Title: data.Title,
                VideoType: data.VideoType,
                DefaultAudioIndex: data.DefaultAudioIndex,
                ResourceStatus: data.ResourceStatus,
                Duration: data.Duration,
                LinkDocumentId: data.LinkDocumentId,
                LinkWordId: data.LinkWordId,
                ScreenshotInterval: data.ScreenshotInterval,
                ScreenshotPath: data.ScreenshotPath,
                ScreenshotWidth: data.ScreenshotWidth,
                ScreenshotHeight: data.ScreenshotHeight,
                Hosts: data.Hosts,
                FrontCoverUrl: data.FrontCoverUrl,
                SubTitle: data.Subtitle,
                M3U8S: data.M3U8S,
                Files: Enumerable.from(data.Files).where(function (o) {
                    if (typeof data.VideoType == 'undefined')
                        return true;
                    else if (data.VideoType == 0 || data.VideoType == 2)
                        return o.Type.toLowerCase() == videoExtension;
                    else
                        return o.Type.toLowerCase() == 'mp3';
                }).select(function (o) {
                    return {
                        Quality: o.Quality,
                        FileName: o.Path,
                        AudioIndex: o.AudioIndex,
                        AudioTitle: o.AudioTitle,
                        AudioLanguage: o.AudioLanguage
                    };
                }).toArray().sort(function (a, b) {
                    var sort1 = b.Quality - a.Quality;
                    var sort2 = b.AudioIndex - a.AudioIndex;
                    return sort1 == 0 ? sort2 : sort1;
                })
            };
            obj.DefaultSubtitle = Enumerable.from(data.Subtitle).where(function (o) {
                return o.IsDefault;
            }).toArray()[0];
            obj.DefaultFiles = Enumerable.from(obj.Files).where(function (o) {
                return o.AudioIndex == data.DefaultAudioIndex;
            }).toArray();
            var defualtQuality = this.setting.video["quality"];
            obj.DefaultFile = (function () {
                var files = obj.DefaultFiles;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].Quality <= defualtQuality) {
                        return files[i];
                    }
                }
                for (var i = files.length - 1; i >= 0; i--) {
                    if (files[i].Quality >= defualtQuality) {
                        return files[i];
                    }
                }
            })();
            return obj;
        };
        /**
         *  InnerPlayer Function Api
         */
        PlayerBase.prototype.resize = function () {
            //if (this.s2videodoc != null) {
            //    this.s2videodoc._onResize("keep");
            //}
        };
        PlayerBase.prototype.close = function () {
            this.innerPlayer.close();
            //fix 非学历切换章节的时候 前一个视频还在播放。
            //清空播放器元素能达到注销的效果 但是用jquery的empty()清空会出现前一个视频还在播放的问题 改用html("")正常 原因还要查下
            $("#" + this.originalElement).html("");
        };
        PlayerBase.prototype.getControls = function () {
            return this.innerPlayer.getControls();
        };
        PlayerBase.prototype.getCommonClip = function () {
            return this.innerPlayer.getCommonClip();
        };
        PlayerBase.prototype.getIndex = function () {
            return this.innerPlayer.getIndex();
        };
        PlayerBase.prototype.getParent = function () {
            return this.innerPlayer.getParent();
        };
        PlayerBase.prototype.getPlay = function () {
            return this.innerPlayer.getPlay();
        };
        PlayerBase.prototype.getPlaylist = function () {
            return this.innerPlayer.getPlaylist();
        };
        PlayerBase.prototype.getPlugin = function (name) {
            return this.innerPlayer.getPlugin(name);
        };
        PlayerBase.prototype.getCustomPlugin = function (name) {
            //return this.pluginfactory.get(name);
        };
        PlayerBase.prototype.getScreen = function () {
            return this.innerPlayer.getScreen();
        };
        PlayerBase.prototype.getState = function () {
            return this.innerPlayer.getState();
        };
        PlayerBase.prototype.getStatus = function () {
            return this.innerPlayer.getStatus();
        };
        PlayerBase.prototype.getTime = function () {
            if (this.innerPlayer == null)
                return 0;
            return this.innerPlayer.getTime();
        };
        PlayerBase.prototype.getVersion = function () {
            return this.innerPlayer.getVersion();
        };
        PlayerBase.prototype.getVolume = function () {
            return this.innerPlayer.getVolume();
        };
        PlayerBase.prototype.getCurrentQuality = function () {
            //var clip = this.getClip();
            //if (clip == null || clip.innerClip == null)
            //    return 0;
            //
            //return clip.innerClip.quality || 0;
        };
        PlayerBase.prototype.hide = function () {
            return this.innerPlayer.hide();
        };
        PlayerBase.prototype.id = function () {
            return this.innerPlayer.id();
        };
        PlayerBase.prototype.isFullscreen = function () {
            //return this.innerPlayer.isFullscreen();
        };
        PlayerBase.prototype.isHidden = function () {
            return this.innerPlayer.isHidden();
        };
        PlayerBase.prototype.isLoaded = function () {
            return this.innerPlayer.isLoaded();
        };
        PlayerBase.prototype.isPaused = function () {
            return this.innerPlayer.isPaused();
        };
        PlayerBase.prototype.isPlaying = function () {
            return this.innerPlayer.isPlaying();
        };
        PlayerBase.prototype.pause = function () {
            return this.innerPlayer.pause();
        };
        PlayerBase.prototype.resume = function () {
            return this.innerPlayer.resume();
        };
        PlayerBase.prototype.getClip = function () {
            //return this.currentClip;
        };
        PlayerBase.prototype.seek = function (seconds) {
            clearTimeout(this.seekTick);
            this.seekTick = setTimeout((function (seconds) {
                return function () {
                    //if (this.currentClip == null) {
                    //    return;
                    //}
                    //
                    //var duration = this.currentClip.innerClip.duration;
                    //if (seconds <= duration - 1)
                    //    this.innerPlayer.seek(seconds);
                };
            })(seconds), 200);
        };
        PlayerBase.prototype.setVolume = function (integer) {
            return this.innerPlayer.setVolume(integer);
        };
        PlayerBase.prototype.show = function () {
            return this.innerPlayer.show();
        };
        PlayerBase.prototype.stop = function () {
            return this.innerPlayer.stop();
        };
        PlayerBase.prototype.toggle = function () {
            return this.innerPlayer.toggle();
        };
        PlayerBase.prototype.toggleFullscreen = function () {
            return this.innerPlayer.toggleFullscreen();
        };
        /**
         *  InnerPlayer Event Api
         */
        PlayerBase.prototype.onMouseOver = function (fn) {
            this.addEventListener("onMouseOver", fn);
            return this;
        };
        PlayerBase.prototype.onMouseOut = function (fn) {
            this.addEventListener("onMouseOut", fn);
            return this;
        };
        PlayerBase.prototype.onFullscreen = function (fn) {
            this.addEventListener("onFullscreen", fn);
            return this;
        };
        PlayerBase.prototype.onFullscreenExit = function (fn) {
            this.addEventListener("onFullscreenExit", fn);
            return this;
        };
        PlayerBase.prototype.onStart = function (fn) {
            this.addEventListener("onStart", fn);
            return this;
        };
        PlayerBase.prototype.onBeforeSeek = function (fn) {
            this.addEventListener("onBeforeSeek", fn);
            return this;
        };
        PlayerBase.prototype.onSeek = function (fn) {
            this.addEventListener("onSeek", fn);
            return this;
        };
        PlayerBase.prototype.onBegin = function (fn) {
            this.addEventListener("onBegin", fn);
            return this;
        };
        PlayerBase.prototype.onPause = function (fn) {
            this.addEventListener("onPause", fn);
            return this;
        };
        PlayerBase.prototype.onResume = function (fn) {
            this.addEventListener("onResume", fn);
            return this;
        };
        PlayerBase.prototype.onFinish = function (fn) {
            this.addEventListener("onFinish", fn);
            return this;
        };
        PlayerBase.prototype.onCuepoint = function (cuepoints, fn) {
            //参考 clip对象的 clipLoad
            //            this.innerPlayer.getClip(0).onCuepoint([10000, 20000], (p, o)=> {
            //                this.dispatchEvent(new cuepointevent.Video.CuepointEvent("onCuepoint"));
            //            });
        };
        return PlayerBase;
    }(Common.EventDispatcher));
    Video.PlayerBase = PlayerBase;
})(Video || (Video = {}));
;///<reference path='../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../addins/jquery.cookie/jquery.cookie.d.ts' />
///<reference path='../../../addins/flowplayer/flowplayer.d.ts' />
///<reference path='../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='../../../addins/common/event.ts' />
///<reference path='./multiscreen/screen2videodoc.ts' />
///<reference path='./event/playerevent.ts' />
///<reference path='./event/clipEvent.ts' />
///<reference path='./playersetting.ts' />
///<reference path='./flashdetect.ts' />
///<reference path='./playerException.ts' />
///<reference path='./plugin/pluginfactory.ts' />
///<reference path='./clip/clip.ts' />
///<reference path='./playerbase.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var Flowplayer = (function (_super) {
        __extends(Flowplayer, _super);
        function Flowplayer(element, setting) {
            if (element === void 0) { element = "player"; }
            if (setting === void 0) { setting = null; }
            _super.call(this, element, setting);
            this.pluginfactory = new Video.PluginFactory();
            this.s2videodoc = null;
            this.results = null;
            this.isPlayerLoaded = false;
            this.currentClip = null;
            this.isFirst = true;
            this.playerType = Video.PlayerType.flash;
            this.play(setting.video);
        }
        Flowplayer.prototype.initPlayer = function () {
            var _this = this;
            this.isFirst = true;
            this.registerPlayerEvents();
            if (this.setting.video.type == "url") {
                this.s2videodoc = null;
                //this.element = this.originalElement;
                if (this.playerException.detectUrl(this.setting.video.url))
                    this.initPlayerConfig(this.setting.video.url, this.setting.video);
            }
            else {
                var request = [];
                request.push(this.getVideo());
                $.when.apply({}, request).done(function () {
                    if (_this.videoInfo == null) {
                        return;
                    }
                    request.push(_this.getUrlByQuality(_this.videoInfo));
                    $.when.apply({}, request).done(function () {
                        var plugins = _this.setting.plugins || {};
                        if (_this.videoInfo == null)
                            return;
                        else {
                            if (_this.videoInfo.LinkDocumentId > 0 && plugins['document']) {
                                request.push(_this.getVideoDocument());
                            }
                            if (_this.videoInfo.LinkWordId > 0 && plugins['question'] && _this.setting.video.type === "id") {
                                request.push(_this.getVideoQuestion());
                            }
                            if (request.length >= 3) {
                                $.when.apply({}, request).done(function () {
                                    _this.s2(plugins);
                                    _this.initPlayerConfig(_this.videoInfo, _this.setting);
                                    $("#fixObjectStyle").remove();
                                    $("#" + _this.element).after("<style id='fixObjectStyle'>#" + _this.element + " Object,#" + _this.element + " object{display:block;}</style>");
                                });
                            }
                            else {
                                _this.s2(plugins);
                                _this.initPlayerConfig(_this.videoInfo, _this.setting);
                                $("#fixObjectStyle").remove();
                                $("#" + _this.element).after("<style id='fixObjectStyle'>#" + _this.element + " Object,#" + _this.element + " object{display:block;}</style>");
                            }
                        }
                    });
                });
            }
        };
        Flowplayer.prototype.registerPlayerEvents = function () {
            var events = this.setting.events;
            for (var name in events) {
                this.addEventListener(name, events[name]);
            }
        };
        Flowplayer.prototype.registerPlayerPlugins = function () {
            var plugins = this.setting.plugins;
            //bug#11070 添加通用的cuepoint插件 ,防止视频与文档同时打点时造成阻塞与覆盖
            if (this.times.length > 0)
                plugins.innerCuepoint = {
                    times: this.times
                };
            this.pluginfactory.init(this, plugins);
        };
        Flowplayer.prototype.initPlayerConfig = function (videoInfo, setting) {
            var obj = this.settingHelper.getPlayerConfigs(videoInfo, setting);
            if (obj.obj2.plugins.captionsContent)
                obj.obj2.plugins.captionsContent.style.body.fontSize = $("#" + this.element).width() / 40;
            this.initPlayerEvent(obj.obj1, obj.obj2);
        };
        Flowplayer.prototype.initPlayerEvent = function (obj1, obj2) {
            var _this = this;
            var throttle;
            $f(this.element, obj1, obj2).onLoad(function () {
                _this.isPlayerLoaded = true;
                _this.registerPlayerPlugins();
                _this.dispatchEvent(new Video.PlayerEvent("onLoad"));
                var doc = _this.pluginfactory.get('document');
                if (doc != null)
                    doc.first = true;
            }).onFullscreen(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onFullscreen"));
            }).onMouseOver(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onMouseOver"));
            }).onMouseOut(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onMouseOut"));
            }).onFullscreenExit(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onFullscreenExit"));
            }).onStart(function (clip) {
                clearTimeout(throttle);
                throttle = setTimeout(function () {
                    _this.currentClip = new Video.Clip(clip);
                    _this.dispatchEvent(new Video.ClipEvent("onClipLoad", _this.currentClip));
                    _this.dispatchEvent(new Video.PlayerEvent("onStart"));
                    _this._onStart();
                }, 100);
            }).onBeforeSeek(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onBeforeSeek"));
            }).onSeek(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onSeek"));
            }).onPause(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onPause"));
            }).onResume(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onResume"));
            }).onFinish(function () {
                _this.dispatchEvent(new Video.PlayerEvent("onFinish"));
            });
            this.innerPlayer = $f(this.element);
        };
        Flowplayer.prototype._onStart = function () {
            var _this = this;
            var plugin = this.pluginfactory.get("lastPositionContent"), content = this.innerPlayer.getPlugin("lastPositionContent"), interval = 0;
            if (plugin) {
                content.hide();
                content.setHtml(plugin.html);
                interval = setInterval(function () {
                    if (_this.isLoaded()) {
                        var poster = _this.getPlugin("poster");
                        if (poster) {
                            if (poster.startPosterIsComplete()) {
                                showLastPositionContent();
                                clearInterval(interval);
                            }
                        }
                        else {
                            showLastPositionContent();
                            clearInterval(interval);
                        }
                    }
                }, 100);
                function showLastPositionContent() {
                    content.show();
                    window.setTimeout(function () {
                        try {
                            content.hide();
                        }
                        catch (e) {
                        }
                    }, plugin.time);
                }
            }
        };
        Flowplayer.prototype.s2 = function (plugins) {
            if (plugins['document'] && this.videoInfo.LinkDocumentId > 0) {
                this.s2videodoc = new Multiscreen.S2videodoc({
                    selector: "#" + this.element,
                    videoPlayer: this
                });
                plugins["document"]["element"] = "#" + this.s2videodoc.rightDomId;
                this.element = this.s2videodoc.leftDomId;
            }
            else {
                this.s2videodoc = null;
            }
        };
        /**
         *  InnerPlayer Function Api
         */
        Flowplayer.prototype.resize = function () {
            if (this.s2videodoc != null) {
                this.s2videodoc._onResize("keep");
            }
        };
        Flowplayer.prototype.close = function () {
            this.innerPlayer.close();
            //fix 非学历切换章节的时候 前一个视频还在播放。
            //清空播放器元素能达到注销的效果 但是用jquery的empty()清空会出现前一个视频还在播放的问题 改用html("")正常 原因还要查下
            $("#" + this.originalElement).html("");
        };
        Flowplayer.prototype.getControls = function () {
            return this.innerPlayer.getControls();
        };
        Flowplayer.prototype.getCommonClip = function () {
            return this.innerPlayer.getCommonClip();
        };
        Flowplayer.prototype.getIndex = function () {
            return this.innerPlayer.getIndex();
        };
        Flowplayer.prototype.getParent = function () {
            return this.innerPlayer.getParent();
        };
        Flowplayer.prototype.getPlay = function () {
            return this.innerPlayer.getPlay();
        };
        Flowplayer.prototype.getPlaylist = function () {
            return this.innerPlayer.getPlaylist();
        };
        Flowplayer.prototype.getPlugin = function (name) {
            return this.innerPlayer.getPlugin(name);
        };
        Flowplayer.prototype.getCustomPlugin = function (name) {
            return this.pluginfactory.get(name);
        };
        Flowplayer.prototype.getScreen = function () {
            return this.innerPlayer.getScreen();
        };
        Flowplayer.prototype.getState = function () {
            return this.innerPlayer.getState();
        };
        Flowplayer.prototype.getStatus = function () {
            return this.innerPlayer.getStatus();
        };
        Flowplayer.prototype.getTime = function () {
            if (this.innerPlayer == null)
                return 0;
            return this.innerPlayer.getTime();
        };
        Flowplayer.prototype.getVersion = function () {
            return this.innerPlayer.getVersion();
        };
        Flowplayer.prototype.getVolume = function () {
            return this.innerPlayer.getVolume();
        };
        Flowplayer.prototype.getCurrentQuality = function () {
            var clip = this.getClip();
            if (clip == null || clip.innerClip == null)
                return 0;
            return clip.innerClip.quality || 0;
        };
        Flowplayer.prototype.hide = function () {
            return this.innerPlayer.hide();
        };
        Flowplayer.prototype.id = function () {
            return this.innerPlayer.id();
        };
        Flowplayer.prototype.isFullscreen = function () {
            return this.innerPlayer.isFullscreen();
        };
        Flowplayer.prototype.isHidden = function () {
            return this.innerPlayer.isHidden();
        };
        Flowplayer.prototype.isLoaded = function () {
            return this.innerPlayer.isLoaded();
        };
        Flowplayer.prototype.isPaused = function () {
            return this.innerPlayer.isPaused();
        };
        Flowplayer.prototype.isPlaying = function () {
            return this.innerPlayer.isPlaying();
        };
        Flowplayer.prototype.pause = function () {
            return this.innerPlayer.pause();
        };
        Flowplayer.prototype.resume = function () {
            return this.innerPlayer.resume();
        };
        Flowplayer.prototype.getClip = function () {
            return this.currentClip;
        };
        Flowplayer.prototype.seek = function (seconds) {
            var _this = this;
            clearTimeout(this.seekTick);
            this.seekTick = setTimeout((function (seconds) {
                return function () {
                    if (_this.currentClip == null) {
                        return;
                    }
                    var duration = _this.currentClip.innerClip.duration;
                    if (seconds <= duration - 1)
                        _this.innerPlayer.seek(seconds);
                };
            })(seconds), 200);
        };
        Flowplayer.prototype.setVolume = function (integer) {
            return this.innerPlayer.setVolume(integer);
        };
        Flowplayer.prototype.show = function () {
            return this.innerPlayer.show();
        };
        Flowplayer.prototype.stop = function () {
            return this.innerPlayer.stop();
        };
        Flowplayer.prototype.toggle = function () {
            return this.innerPlayer.toggle();
        };
        Flowplayer.prototype.toggleFullscreen = function () {
            return this.innerPlayer.toggleFullscreen();
        };
        /**
         *  InnerPlayer Event Api
         */
        Flowplayer.prototype.onMouseOver = function (fn) {
            this.addEventListener("onMouseOver", fn);
            return this;
        };
        Flowplayer.prototype.onMouseOut = function (fn) {
            this.addEventListener("onMouseOut", fn);
            return this;
        };
        Flowplayer.prototype.onFullscreen = function (fn) {
            this.addEventListener("onFullscreen", fn);
            return this;
        };
        Flowplayer.prototype.onFullscreenExit = function (fn) {
            this.addEventListener("onFullscreenExit", fn);
            return this;
        };
        Flowplayer.prototype.onStart = function (fn) {
            this.addEventListener("onStart", fn);
            return this;
        };
        Flowplayer.prototype.onProgressBarClick = function (fn) {
            this.addEventListener("onProgressBarClick", fn);
            return this;
        };
        Flowplayer.prototype.onBeforeSeek = function (fn) {
            this.addEventListener("onBeforeSeek", fn);
            return this;
        };
        Flowplayer.prototype.onSeek = function (fn) {
            this.addEventListener("onSeek", fn);
            return this;
        };
        Flowplayer.prototype.onBegin = function (fn) {
            this.addEventListener("onBegin", fn);
            return this;
        };
        Flowplayer.prototype.onPause = function (fn) {
            this.addEventListener("onPause", fn);
            return this;
        };
        Flowplayer.prototype.onResume = function (fn) {
            this.addEventListener("onResume", fn);
            return this;
        };
        Flowplayer.prototype.onFinish = function (fn) {
            this.addEventListener("onFinish", fn);
            return this;
        };
        Flowplayer.prototype.onCuepoint = function (cuepoints, fn) {
            //参考 clip对象的 clipLoad
            //            this.innerPlayer.getClip(0).onCuepoint([10000, 20000], (p, o)=> {
            //                this.dispatchEvent(new cuepointevent.Video.CuepointEvent("onCuepoint"));
            //            });
        };
        return Flowplayer;
    }(Video.PlayerBase));
    Video.Flowplayer = Flowplayer;
})(Video || (Video = {}));
;///<reference path='../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../addins/jquery.cookie/jquery.cookie.d.ts' />
///<reference path='../../../addins/flowplayer/flowplayer.d.ts' />
///<reference path='../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='../../../addins/common/event.ts' />
///<reference path='./event/playerevent.ts' />
///<reference path='./event/clipEvent.ts' />
///<reference path='./playersetting.ts' />
///<reference path='./playerException.ts' />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Video;
(function (Video) {
    var Html5player = (function (_super) {
        __extends(Html5player, _super);
        function Html5player(element, setting) {
            if (element === void 0) { element = "player"; }
            if (setting === void 0) { setting = null; }
            _super.call(this, element, setting);
            this.html5Help = {
                isLoaded: true,
                state: Video.STATE.buffering
            };
            this.playerType = Video.PlayerType.html5;
            this.play(setting.video);
        }
        Html5player.prototype.initPlayer = function () {
            var _this = this;
            if (this.setting.video.type == "url") {
                this.innerPlayer = this.html5TryPlay([this.setting.video.url]);
            }
            else {
                var request = [];
                request.push(this.getVideo());
                $.when.apply({}, request).done(function () {
                    if (_this.videoInfo == null) {
                        return;
                    }
                    request.push(_this.getUrlByQuality(_this.videoInfo));
                    $.when.apply({}, request).done(function () {
                        if (_this.videoInfo == null)
                            return;
                        var palyerType = (_this.videoInfo.VideoType == 0 || _this.videoInfo.VideoType == 2) ? "video" : "audio";
                        _this.innerPlayer = _this.html5TryPlay(_this.videoInfo.DefaultFile.FileName, _this.videoInfo.FrontCoverUrl, palyerType);
                    });
                });
            }
        };
        Html5player.prototype.html5TryPlay = function (urls, frontCoverUrl, type) {
            var _this = this;
            if (type === void 0) { type = "video"; }
            var sourceType = type == "audio" ? "audio/mpeg" : "video/mp4", url = "", count = urls.length, tryTimes = 2, isError = true;
            $(".j-huayuHtml5Player", $("#" + this.element)).remove();
            var properties = {
                "class": "j-huayuHtml5Player",
                "controls": "controls",
                "style": "height:100%;width:100%;",
                "autoplay": this.setting.video["autoPlay"]
            };
            if (frontCoverUrl)
                properties.poster = frontCoverUrl;
            $("#" + this.element).append($("<" + type + ">", properties));
            this.video = $(".j-huayuHtml5Player", $("#" + this.element));
            this.video.on("play", function (e) {
                if (_this.video[0].isPlayToEnded) {
                    _this.video[0].isPlayToEnded = false;
                    _this.dispatchEvent(new Video.PlayerEvent("onResume"));
                }
                _this.html5Help.state = Video.STATE.playing;
                _this.dispatchEvent(new Video.PlayerEvent("onStart"));
            });
            this.video.on("seeking", function (e) {
                _this.dispatchEvent(new Video.PlayerEvent("onBeforeSeek"));
            });
            this.video.on("seeked", function (e) {
                _this.dispatchEvent(new Video.PlayerEvent("onSeek"));
            });
            this.video.on("pause", function (e) {
                _this.html5Help.state = Video.STATE.paused;
                _this.dispatchEvent(new Video.PlayerEvent("onPause"));
            });
            this.video.on("ended", function (e) {
                _this.video[0].isPlayToEnded = true;
                _this.html5Help.state = Video.STATE.ended;
                _this.dispatchEvent(new Video.PlayerEvent("onFinish"));
            });
            this.html5Help.isLoaded = true;
            this.dispatchEvent(new Video.PlayerEvent("onLoad"));
            var sourceStr = "";
            for (var i = 0, len = urls.length; i < len; i++) {
                var url = '<source src="' + urls[i] + '" type="' + sourceType + '"/>';
                for (var j = tryTimes; j > 0; j--) {
                    sourceStr += url;
                }
            }
            this.video.append(sourceStr);
            return this.video[0];
        };
        /**
         *  InnerPlayer Function Api
         */
        Html5player.prototype.resize = function () {
        };
        Html5player.prototype.addClip = function (clip, index) {
        };
        Html5player.prototype.close = function () {
        };
        Html5player.prototype.getClip = function () {
            return null;
        };
        Html5player.prototype.getControls = function () {
            return null;
            //return this.video.getControls();
        };
        Html5player.prototype.getCommonClip = function () {
            return null;
            //return this.innerPlayer.getCommonClip();
        };
        Html5player.prototype.getIndex = function () {
            return null;
            //return this.innerPlayer.getIndex();
        };
        Html5player.prototype.getParent = function () {
            return $("#" + this.originalElement)[0];
        };
        Html5player.prototype.getPlay = function () {
            return null;
            //return this.innerPlayer.getPlay();
        };
        Html5player.prototype.getPlaylist = function () {
            return null;
            //return this.innerPlayer.getPlaylist();
        };
        Html5player.prototype.getPlugin = function (name) {
            return null;
            //return this.innerPlayer.getPlugin(name);
        };
        Html5player.prototype.getCustomPlugin = function (name) {
            return null;
            //return this.pluginfactory.get(name);
        };
        Html5player.prototype.getScreen = function () {
            return null;
            //return this.innerPlayer.getScreen();
        };
        Html5player.prototype.getState = function () {
            return this.html5Help.state;
        };
        Html5player.prototype.getStateName = function () {
            return Video.STATE[this.html5Help.state];
        };
        Html5player.prototype.getStatus = function () {
            return {
                bufferEnd: 0,
                bufferStart: 0,
                muted: this.innerPlayer.muted,
                state: this.html5Help.state,
                time: this.innerPlayer.currentTime,
                volume: Math.floor(this.innerPlayer.volume * 100)
            };
        };
        Html5player.prototype.getTime = function () {
            if (this.innerPlayer == null)
                return 0;
            return this.innerPlayer.currentTime;
        };
        Html5player.prototype.getVersion = function () {
            return null;
            //return this.innerPlayer.getVersion();
        };
        Html5player.prototype.getVolume = function () {
            if (this.innerPlayer == null)
                return 0;
            return Math.floor(this.innerPlayer.volume * 100);
        };
        Html5player.prototype.getCurrentQuality = function () {
            //var clip = this.getClip();
            //if (clip == null || clip.innerClip == null)
            //    return 0;
            //
            //return clip.innerClip.quality || 0;
            return 0;
        };
        Html5player.prototype.hide = function () {
            return this.video.hide();
        };
        Html5player.prototype.id = function () {
            return this.video.attr("id");
        };
        Html5player.prototype.isHidden = function () {
            return this.video.is(":visible");
        };
        Html5player.prototype.isLoaded = function () {
            return this.html5Help.isLoaded;
        };
        Html5player.prototype.isPaused = function () {
            return this.innerPlayer.paused;
        };
        Html5player.prototype.isPlaying = function () {
            return this.html5Help.state == 3;
        };
        Html5player.prototype.pause = function () {
            return this.innerPlayer.pause();
        };
        Html5player.prototype.resume = function () {
            this.innerPlayer.currentTime = 0;
            this.innerPlayer.play();
        };
        Html5player.prototype.seek = function (seconds) {
            var _this = this;
            clearTimeout(this.seekTick);
            this.seekTick = setTimeout((function (seconds) {
                return function () {
                    if (_this.innerPlayer == null) {
                        return;
                    }
                    var duration = _this.innerPlayer.duration;
                    if (seconds <= duration - 1)
                        _this.innerPlayer.currentTime = seconds;
                };
            })(seconds), 200);
        };
        Html5player.prototype.setVolume = function (integer) {
            if (integer < 0) {
                integer = 0;
            }
            if (integer > 100) {
                integer = 100;
            }
            this.innerPlayer.volume = integer / 100;
            return this.innerPlayer;
        };
        Html5player.prototype.show = function () {
            return this.video.show();
        };
        Html5player.prototype.stop = function () {
            this.innerPlayer.currentTime = 0;
            this.innerPlayer.pause();
        };
        Html5player.prototype.toggle = function () {
            return this.video.toggle();
        };
        Html5player.prototype.toggleFullscreen = function () {
            return null;
            //return this.innerPlayer.toggleFullscreen();
        };
        Html5player.prototype.isFullscreen = function () {
            var docum = document;
            return $(docum.fullscreenElement ||
                docum.webkitCurrentFullScreenElement ||
                docum.mozFullScreenElement ||
                null).attr("id") == this.element;
        };
        return Html5player;
    }(Video.PlayerBase));
    Video.Html5player = Html5player;
})(Video || (Video = {}));
;///<reference path='../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='./playerbase.ts' />
var Video;
(function (Video) {
    var PlayerException = (function () {
        function PlayerException(player) {
            this.player = player;
            this.stylePrefix = 'playerWarnStyle-';
        }
        PlayerException.prototype.detect = function (data) {
            var message = "";
            if (data == null) {
                data = {};
                data.VideoType = 0;
                data.ResourceStatus = ResourceStatus.Noting;
            }
            else if (data.Files.length > 0 && (data.ResourceStatus == ResourceStatus.Ready || data.ResourceStatus == ResourceStatus.Release || typeof data.ResourceStatus == 'undefined'))
                return true;
            message = '<div class="player-warn"><p>' + this.getStatusDescription(data) + '</p></div>';
            this.showError(message);
            return false;
        };
        PlayerException.prototype.loadError = function (data) {
            var message = '<div class="player-warn"><p>抱歉，视频加载失败，错误码：' + data.code + '</p></div>';
            this.showError(message);
            return false;
        };
        PlayerException.prototype.detectUrl = function (url) {
            url = url.toLowerCase();
            if (url.indexOf(".mp3") > -1 || url.indexOf(".f4v") > -1 || url.indexOf(".mp4") > -1 || url.indexOf(".flv") > -1)
                return true;
            var message = '<div class="player-warn"><p>抱歉，视频加载失败，错误码：9</p></div>';
            this.showError(message);
            return false;
        };
        PlayerException.prototype.queryFail = function () {
            var message = '<div class="player-warn"><p>抱歉，视频加载失败，错误码：404</p></div>';
            this.showError(message);
            return false;
        };
        PlayerException.prototype.appendStyle = function () {
            var styleId = this.stylePrefix + this.player.originalElement;
            if ($("#" + styleId).length > 0)
                return;
            var position = $('#' + this.player.originalElement).css('position');
            if (position == 'static' || position == '')
                position = 'position:relative; ';
            else
                position = ' ';
            var style = '';
            style = style + '<style type="text/css" id="' + styleId + '">';
            style = style + ' #' + this.player.originalElement + ' {' + position + ' background-color: #000; overflow: hidden; }';
            style = style + ' #' + this.player.originalElement + ' .player-warn { width: 380px; height: 100px; background: url(' + this.player.setting.staticHost + 'nae/images/warn.png) no-repeat center top; margin:-80px 0 0 -190px; padding-top: 60px;position: absolute; top: 50%;left: 50%;}';
            style = style + ' #' + this.player.originalElement + ' .player-warn p { height: 30px; font: 18px/30px "MicroSoft YaHei"; text-align: center; color: #B5B5B5; }';
            style = style + '</style>';
            $('head').append(style);
        };
        PlayerException.prototype.showError = function (message) {
            this.appendStyle();
            $("#" + this.player.originalElement).html(message);
        };
        PlayerException.prototype.getStatusDescription = function (data) {
            var descript = data.VideoType == 1 ? "音频" : "视频";
            switch (data.ResourceStatus) {
                case ResourceStatus.Encoding:
                case ResourceStatus.Sync:
                case ResourceStatus.Create:
                    descript = "抱歉，当前" + descript + "未转码完成，请稍候再观看。";
                    break;
                case ResourceStatus.Ready:
                    descript = descript + "已就绪";
                    break;
                case ResourceStatus.Disabled:
                case ResourceStatus.Expired:
                    descript = "抱歉，当前" + descript + "已下线，无法观看。";
                    break;
                case ResourceStatus.Delete:
                    descript = "抱歉，当前" + descript + "已删除，无法观看。";
                    break;
                //case ResourceStatus.Noting:
                //    descript = "无此"+descript;
                //    break;
                default:
                    descript = "抱歉，" + descript + "加载失败，错误码：" + data.ResourceStatus;
                    break;
            }
            return descript;
        };
        return PlayerException;
    }());
    Video.PlayerException = PlayerException;
    var ResourceStatus;
    (function (ResourceStatus) {
        ResourceStatus[ResourceStatus["Create"] = 0] = "Create";
        ResourceStatus[ResourceStatus["Ready"] = 1] = "Ready";
        ResourceStatus[ResourceStatus["Disabled"] = 2] = "Disabled";
        ResourceStatus[ResourceStatus["Expired"] = 3] = "Expired";
        ResourceStatus[ResourceStatus["Encoding"] = 4] = "Encoding";
        ResourceStatus[ResourceStatus["Sync"] = 5] = "Sync";
        ResourceStatus[ResourceStatus["Delete"] = 7] = "Delete";
        ResourceStatus[ResourceStatus["Release"] = 8] = "Release";
        ResourceStatus[ResourceStatus["Noting"] = 9] = "Noting"; //无此视频
    })(ResourceStatus || (ResourceStatus = {}));
})(Video || (Video = {}));
;///<reference path='../../../addins/jquery/jquery.d.ts' />
///<reference path='../../../addins/requirejs/require.d.ts' />
///<reference path='../../../addins/linq/linq.3.0.3-Beta4.d.ts' />
///<reference path='./playerbase.ts' />
var Video;
(function (Video) {
    //var v = "", vAry = require.toUrl("").split("?");
    //if (vAry.length > 1)
    var v = "?v=20161020"; //+ vAry[1];
    var PlayerSetting = (function () {
        function PlayerSetting() {
            this.config = null;
            this.setting = null;
            // private playerConfigs?:any
        }
        /**
         * 获取flowplayer 的配置信息
         * @param videoInfo
         * @param video
         * @param type 播放配置的类型：单url（只要播放功能）、多个url（需要设置等功能）
         * @returns {any}
         */
        PlayerSetting.prototype.getPlayerConfigs = function (videoInfo, setting) {
            this.setting = setting;
            this.setting.swfHost = this.setting.swfHost || this.setting.staticHost + "flowplayer/core/build1/";
            this.setting.video = this.setting.video || {
                autoBuffering: !!this.setting.autoBuffering,
                autoPlay: !!this.setting.autoPlay,
                accessToken: "",
                type: "url"
            };
            if (typeof this.setting.staticHost != "undefined" && this.setting.staticHost.indexOf("//s2") >= 0) {
                var staticUrls = ["s21", "s22", "s23", "s24", "s25"];
                this.setting.staticHost = this.setting.staticHost.replace(/\/\/s2\d?./ig, "//" + staticUrls[Math.floor(Math.random() * staticUrls.length)] + ".");
            }
            //if(this.config == null)
            this.initConfig(videoInfo);
            this.updateConfig(videoInfo, this.setting.configs);
            if (this.setting.video) {
                this.config.obj2["clip"]["autoPlay"] = typeof this.setting.video["autoPlay"] == "boolean" ? this.setting.video["autoPlay"] : true;
                this.config.obj2["clip"]["autoBuffering"] = typeof this.setting.video["autoBuffering"] == "boolean" ? this.setting.video["autoBuffering"] : true;
            }
            return this.config;
        };
        PlayerSetting.prototype.updateConfig = function (videoInfo, playerConfigs) {
            var obj1 = this.config.obj1;
            var obj2 = this.config.obj2;
            // 复制用户自定义的配置
            if (typeof playerConfigs != 'undefined' && typeof playerConfigs["plugins"] != 'undefined' && playerConfigs["plugins"] != null) {
                for (var p in playerConfigs["plugins"]) {
                    if (!playerConfigs["plugins"][p].url || playerConfigs["plugins"][p].url.indexOf("?") > 0) {
                        continue;
                    }
                    if (playerConfigs["plugins"][p].url.indexOf("http://") > -1) {
                        playerConfigs["plugins"][p].url = playerConfigs["plugins"][p].url + v;
                    }
                    else {
                        playerConfigs["plugins"][p].url = this.setting.swfHost + playerConfigs["plugins"][p].url + v;
                    }
                }
                obj2 = $.extend(true, obj2, playerConfigs);
            }
            this.verify(videoInfo, obj1, obj2, playerConfigs);
        };
        PlayerSetting.prototype.initConfig = function (videoInfo) {
            this.config = {
                obj1: { src: "" }, obj2: {
                    clip: {
                        id: videoInfo && videoInfo.Id ? videoInfo.Id : 0,
                        url: videoInfo && videoInfo.DefaultFile ? videoInfo.DefaultFile.FileName[0] : videoInfo,
                        autoPlay: false,
                        autoBuffering: true,
                        loading: false,
                        //loadingUrl:"http://debug.static.huayu.nd/flowplayer/core/build/101loading.swf",//可以自定义loading 支持swf、静态图
                        //loadingTime:2500,//loading运行时间
                        captionUrl: videoInfo && videoInfo.DefaultSubtitle && videoInfo.DefaultSubtitle.Url,
                        quality: videoInfo && videoInfo.DefaultFile && videoInfo.DefaultFile.Quality,
                        frontCoverUrl: videoInfo && videoInfo.FrontCoverUrl,
                        screenshotInterval: videoInfo && videoInfo.ScreenshotInterval,
                        screenshotPath: videoInfo.ScreenshotPath,
                        screenshotWidth: videoInfo && videoInfo.ScreenshotWidth,
                        screenshotHeight: videoInfo && videoInfo.ScreenshotHeight
                    },
                    log: {},
                    i18n: {
                        noFlashPluginMessage: '<p>如果您无法播放视频，请确认您是否安装Flash</p><p><a href="http://get.adobe.com/cn/flashplayer/" target="_blank">点击下载</a>安装最新Flash Player播放器</p>',
                        videoText: '视频',
                        audioText: '音频',
                        resourceStatusEncodingMessage: '抱歉，当前{{videoType}}未转码完成，请稍候再观看。',
                        resourceStatusReadyMessage: '{{videoType}}：已就绪',
                        resourceStatusExpiredMessage: '抱歉，当前{{videoType}}已下线，无法观看。',
                        resourceStatusDeleteMessage: '抱歉，当前{{videoType}}已删除，无法观看。',
                        resourceStatusDefaultMessage: '抱歉，{{videoType}}加载失败，错误码：',
                        resourceLoadFailMessage: '抱歉，视频加载失败，错误码：',
                        play: '播放',
                        pause: '暂停',
                        replay: "重播",
                        volume: '音量',
                        preference: '设置',
                        fullscreen: '全屏',
                        exitFullscreen: '退出全屏幕',
                        coveredTheEntireScreen: '满屏',
                        ad: '广告',
                        second: '秒',
                        sure: '确定',
                        cancel: '取消',
                        language: '语言',
                        subtitles: '字幕',
                        quality: '画质',
                        auto: '自动',
                        notAvailable: '不可选',
                        noUseed: '不使用',
                        ultimateHD: '超清',
                        hd: '高清',
                        sd: '标清',
                        smooth: '流畅',
                        rapidly: '极速',
                        rightAnswerTitle: '恭喜你答对了',
                        examinationQuestions: '检测题',
                        continuePlay: '继续播放',
                        reAnswer: '重新作答',
                        question: '题',
                        total: '共',
                        hasAnswered: '已作答',
                        failAnswerTitle: '很遗憾你答错了，请继续作答',
                        fastreverse: "后退15秒",
                        scale: "画面比例",
                        chinese: "中文",
                        english: "英文",
                        japanese: "日文"
                    },
                    plugins: {
                        flashls: {
                            url: this.setting.swfHost + 'flowplayer.flashls-3.2.10.swf',
                            hls_maxbufferlength: 30,
                            hls_startfromlevel: 0,
                            hls_fragmentloadmaxretry: 1,
                            hls_fragmentloadmaxretrytimeout: 5000,
                            hls_manifestloadmaxretry: 1,
                            hls_manifestloadmaxretrytimeout: 5000
                        },
                        lighttpd: {
                            url: this.setting.swfHost + "flowplayer.pseudostreaming-3.2.13.swf" + v,
                            id: videoInfo && videoInfo.Id ? videoInfo.Id : 0,
                            code: this.setting.video.code ? this.setting.video.code : "",
                            playType: this.setting.video.type.toString(),
                            apiHost: videoInfo && videoInfo.ApiHost ? videoInfo.ApiHost : '',
                            accessToken: videoInfo && videoInfo.accessToken ? videoInfo.accessToken : '',
                            hosts: videoInfo && videoInfo.Hosts ? videoInfo.Hosts : [],
                            files: videoInfo && videoInfo.Files ? videoInfo.Files : [],
                            defaultFile: videoInfo.DefaultFile
                        },
                        controls: {
                            url: this.setting.swfHost + "flowplayer.controls-3.2.15.swf" + v,
                            margins: [9, 10, 9, 20],
                            height: 40,
                            opacity: 1,
                            sliderBorder: 0,
                            ratio: true,
                            quality: true,
                            fastreverse: false,
                            logo: true,
                            logourl: "http://s21.tianyuimg.com/typescript/cloud/video/dest/images/101_logo.jpg",
                            backgroundGradient: [0],
                            backgroundColor: '#1E1E1E',
                            bufferColor: '#797979',
                            progressColor: '#EE750A',
                            volumeColor: '#EE750A',
                            timeColor: "#b5b5b5",
                            timeFontSize: 14,
                            durationColor: "#737373",
                            dragDirection: "both",
                            autoHide: {
                                fullscreenOnly: true,
                                hideDelay: 2000,
                                hideProgressBar: true,
                                hideStyle: "fade"
                            },
                            onClick: function (name) {
                                //var ary = name.split('_');
                                //window['circle'](parseInt(ary[1]) / 1000);
                            }
                        },
                        toppanel: {
                            url: this.setting.swfHost + "flowplayer.toppanel-3.2.8.swf" + v,
                            top: 0,
                            height: 30,
                            borderRadius: 0,
                            border: 0,
                            backgroundColor: '#1E1E1E',
                            opacity: 0.95,
                            backgroundGradient: [0],
                            left: 0,
                            autoHide: {
                                fullscreenOnly: true,
                                hideDelay: 2000,
                                hideStyle: "fade"
                            },
                            scaleTextColor: '#ffffff',
                            fontColor: '#ee750a'
                        },
                        setpanel: {
                            url: this.setting.swfHost + "flowplayer.setpanel-3.2.8.swf" + v,
                            top: "50%",
                            left: "50%",
                            width: 400,
                            height: 250,
                            borderRadius: 0,
                            border: 0,
                            backgroundColor: '#1E1E1E',
                            opacity: 0.9,
                            backgroundGradient: [0],
                            files: videoInfo && videoInfo.Files ? videoInfo.Files : [],
                            currentFile: videoInfo && videoInfo.DefaultFile ? videoInfo.DefaultFile : {},
                            subTitle: videoInfo && videoInfo.SubTitle ? videoInfo.SubTitle : [],
                            currentSubtitle: videoInfo && videoInfo.DefaultSubtitle ? videoInfo.DefaultSubtitle : {},
                            closeButton: true,
                            itemTextColor: '#ffffff',
                            selectItemBackgroundColor: '#ee750a',
                            sureButtonBackgroundColor: '#ee750a',
                            sureButtonFontColor: '#ffffff',
                            cancelButtonBackgroundColor: '#ffffff',
                            cancelButtonFontColor: '#000000'
                        },
                        captionsContent: {
                            url: this.setting.swfHost + 'flowplayer.content-3.2.9.swf' + v,
                            bottom: 52,
                            height: 75,
                            zIndex: 1,
                            backgroundColor: 'transparent',
                            backgroundGradient: 'none',
                            border: 0,
                            textDecoration: 'glow',
                            opacity: 1,
                            style: {
                                "body": {
                                    fontSize: 16,
                                    fontFamily: 'simhei,黑体',
                                    textAlign: 'center',
                                    color: '#ffffff'
                                },
                                "p": {
                                    leading: 2
                                }
                            }
                        },
                        lastPositionContent: {
                            url: this.setting.swfHost + 'flowplayer.content-3.2.9.swf' + v,
                            bottom: 50,
                            left: 0,
                            zIndex: 2,
                            border: 0,
                            borderRadius: 0,
                            textDecoration: 'outline',
                            backgroundGradient: 'none',
                            height: 40,
                            backgroundColor: 'transparent',
                            style: {
                                "body": {
                                    fontSize: 16,
                                    fontFamily: 'simhei,黑体',
                                    textAlign: 'left',
                                    color: '#ffffff',
                                    textShadow: '1px 1px 1px #a00,-1px -1px 1px #a00'
                                }
                            }
                        },
                        captions: {
                            url: this.setting.swfHost + "flowplayer.captions-3.2.9.swf" + v,
                            captionTarget: 'captionsContent'
                        },
                        poster: {
                            url: this.setting.swfHost + "flowplayer.poster-1.0.0.swf" + v,
                            start: {
                                hideTimer: false,
                                closeButton: true,
                                enable: true,
                                items: []
                            },
                            pause: {
                                hideTimer: true,
                                closeButton: true,
                                enable: true,
                                items: []
                            },
                            end: {
                                hideTimer: true,
                                closeButton: true,
                                enable: true,
                                items: []
                            }
                        }
                    },
                    logo: {
                        url: 'http://flash.flowplayer.org/media/img/player/acme.png',
                        fullscreenOnly: false,
                        opacity: 0
                    },
                    contextMenu: [
                        { "华渔未来教育视频播放器 v1.0.6(core-3.2.17)": function () {
                            } },
                        { "下载诊断工具": function () {
                                window.open("http://f11.e.99.com/tools/video/HuayuVideoCheck.exe");
                            } },
                        { "网络诊断分析": function () {
                                var videoUrl = Video.player.currentClip.innerClip.completeUrl;
                                window.open('hyvideo://url=' + encodeURIComponent(videoUrl));
                            } }
                    ],
                    canvas: {
                        background: "#000000",
                        backgroundGradient: [0]
                    }
                }
            };
        };
        // 根据用户的输入，设置默认配置
        PlayerSetting.prototype.verify = function (videoInfo, obj1, obj2, playerConfigs) {
            // 生产环境使用商业版
            if (typeof this.setting.staticHost == "undefined" || this.setting.staticHost.indexOf("huayu.nd") == -1) {
                obj2 = $.extend(obj2, { key: '#$8369a13897007a895dd' });
                obj1 = $.extend(obj1, {
                    src: this.setting.swfHost + "flowplayer.commercial-3.2.16.swf" + v,
                    wmode: "opaque"
                });
            }
            else {
                obj1 = $.extend(obj1, { src: this.setting.swfHost + "flowplayer-3.2.16.swf" + v, wmode: "opaque" });
            }
            //url模式只有一个视频 设置面板无存在意义。并且如果用户在url模式下配置setpanel 会因为缺某些参数无法初始化播放器， 同时单一视频时，视频清晰度设置亦无意义
            var isUrlPlay = this.setting.video.type == "url" ? true : false;
            obj2.plugins.controls.ratio = !isUrlPlay;
            obj2.plugins.controls.quality = !isUrlPlay;
            if (isUrlPlay)
                obj2.plugins.setpanel = null;
            // 无字幕时不需要加载字幕插件
            if (videoInfo && typeof videoInfo.SubTitle == "undefined" || videoInfo.SubTitle.length == 0) {
                obj2.plugins.captionsContent = null;
                obj2.plugins.captions = null;
            }
            this.audioCheck(videoInfo, obj2);
            this.posterCheck(obj2, playerConfigs);
        };
        // 检测音频设置
        PlayerSetting.prototype.audioCheck = function (videoInfo, obj) {
            var mp3ImgUrl = "";
            if (typeof videoInfo == 'string' && videoInfo.indexOf(".mp3") < 0) {
                obj = $.extend(true, obj, {
                    clip: {
                        url: videoInfo,
                        provider: 'lighttpd',
                        autoPlay: false,
                        autoBuffering: true
                    }, plugins: { tybitrateselect: null }
                });
            }
            else if (typeof videoInfo == 'string' && videoInfo.indexOf(".mp3") >= 0) {
                mp3ImgUrl = this.setting.swfHost + "audio.jpg";
                obj = $.extend(true, obj, {
                    clip: { coverImage: { url: mp3ImgUrl, scaling: 'orig', provider: "audio" } },
                    plugins: {
                        audio: { url: this.setting.swfHost + "flowplayer.audio-3.2.10.swf" + v },
                        tybitrateselect: null,
                        scale: null,
                        lighttpd: null,
                        toppanel: null
                    }
                });
            }
            else if ((videoInfo.VideoType == 0 || videoInfo.VideoType == 2) && videoInfo.M3U8S != null && this.setting.video.enableM3U8) {
                //var host:String = videoInfo.Hosts.length > 0 ? videoInfo.Hosts[0] : "";
                obj = $.extend(true, obj, {
                    clip: {
                        //url: "http://192.168.205.4/02/v.m3u8?videoid=sdfa,dfasdfasdf=sdfasdf",
                        url: this.setting.apiHost + videoInfo.M3U8S[0],
                        provider: "flashls",
                        urlResolvers: "flashls",
                        m3u8Files: videoInfo.M3U8S
                    }
                });
                if (typeof this.setting.video.quality == 'number') {
                    obj = $.extend(true, obj, {
                        plugins: {
                            flashls: {
                                hls_playlevel: this.setting.video.quality
                            }
                        }
                    });
                }
            }
            else {
                if ((videoInfo.VideoType == 0 || videoInfo.VideoType == 2) || typeof videoInfo.VideoType == 'undefined') {
                    obj = $.extend(true, obj, { clip: { provider: 'lighttpd', urlResolvers: null } });
                }
                else if (videoInfo.VideoType == 1) {
                    mp3ImgUrl = typeof videoInfo.FrontCoverUrl != 'undefined' && videoInfo.FrontCoverUrl.length > 0 && (videoInfo.FrontCoverUrl.toLowerCase().indexOf(".jpg") >= 0 || videoInfo.FrontCoverUrl.toLowerCase().indexOf(".png") >= 0) ? videoInfo.FrontCoverUrl : this.setting.swfHost + "audio.jpg";
                    obj = $.extend(true, obj, {
                        clip: {
                            coverImage: {
                                url: mp3ImgUrl,
                                scaling: 'orig',
                                provider: "audio"
                            }
                        },
                        plugins: {
                            audio: { url: this.setting.swfHost + "flowplayer.audio-3.2.10.swf" + v },
                            tybitrateselect: null,
                            scale: null,
                            lighttpd: null,
                            toppanel: null
                        }
                    });
                }
            }
        };
        // 检查广告的相应设置
        PlayerSetting.prototype.posterCheck = function (obj, playerConfigs) {
            //如果用户没配置广告 要去掉默认的广告配置（刚加载时，控制条根据是否有这个配置决定是否禁用控制条部分按钮）
            if (typeof playerConfigs == "undefined" || typeof playerConfigs["plugins"] == 'undefined' || playerConfigs["plugins"] == null || !playerConfigs.plugins.poster) {
                obj.plugins.poster = null;
                return;
            }
            //poster flash插件中不限制广告个数 在这里限制暂停和结束的广告只能有一个
            if (obj.plugins.poster.start && obj.plugins.poster.start.items) {
                //片头广告只能是视频 必须配置时间
                var items = obj.plugins.poster.start.items, newItems = [];
                for (var i = 0, len = items.length; i < items.length; i++) {
                    if (items[i].type == "video" && typeof items[i].duration == "number" && items[i].duration > 0) {
                        newItems.push(items[i]);
                    }
                }
                obj.plugins.poster.start.items = newItems;
                //片头必须显示计时
                obj.plugins.poster.start.hideTimer = false;
            }
            //暂停和结尾都只能播一个广告
            if (obj.plugins.poster.pause && obj.plugins.poster.pause.items.length > 1) {
                obj.plugins.poster.pause.items = obj.plugins.poster.pause.items.slice(0, 1);
                //片中必须显示关闭
                obj.plugins.poster.pause.closeButton = true;
            }
            if (obj.plugins.poster.end && obj.plugins.poster.end.items.length > 1) {
                obj.plugins.poster.end.items = obj.plugins.poster.end.items.slice(0, 1);
                //片尾必须显示关闭
                obj.plugins.poster.end.closeButton = true;
            }
        };
        return PlayerSetting;
    }());
    Video.PlayerSetting = PlayerSetting;
})(Video || (Video = {}));
;///<reference path='./flashdetect.ts' />
///<reference path='./playerbase.ts' />
///<reference path='./flowplayer.ts' />
///<reference path='./html5player.ts' />
var Video;
(function (Video) {
    var Player = (function () {
        function Player(element, setting) {
            if (setting === void 0) { setting = null; }
            this.setting = setting;
            this.flashHelp = null;
            this.player = null;
            if (typeof element == "string") {
                this.element = element;
            }
            else {
                var eId = element.id;
                if (!eId) {
                    element.id = eId = "fp_" + Player.uuid();
                }
                this.element = eId;
            }
            this.flashHelp = new Video.FlashHelper(this.element, this.setting);
            if (!this.flashHelp.hasFlash && !this.setting.enableHtml5) {
                return;
            }
            if (!this.flashHelp.hasFlash && this.setting.enableHtml5 && this.flashHelp.supportVideo) {
                this.player = new Video.Html5player(this.element, setting);
            }
            else {
                if (this.flashHelp.hasFlash) {
                    this.setting.enableHtml5 = false;
                    this.player = new Video.Flowplayer(this.element, setting);
                }
                else {
                    this.flashHelp.show();
                }
            }
            //this.player = new Video.Html5player(element,setting);
            return this.player;
        }
        Player.uuid = (function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return function () {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            };
        }());
        return Player;
    }());
    Video.Player = Player;
})(Video || (Video = {}));
