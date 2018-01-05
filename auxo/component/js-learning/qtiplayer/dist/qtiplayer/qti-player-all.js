//version=1.0
(function(window,document,$){
/**
 * 简易模块化加载器
 * Created by ylf on 2016/7/5.
 */


var require, define;
(function () {
    var defined = {}, defineWaiting = {};

    var callDeps = function (key) {
        if (key) {
            key = key.toLowerCase();
        }
        if (defineWaiting[key]) {
            var df = defineWaiting[key];
            delete defineWaiting[key];
            var args = [];
            for (var i = 0; i < df.deps.length; i++) {
                var depName = df.deps[i];
                args[i] = callDeps(depName);
            }
            var ret = df.callback.apply(df.callback, args);
            defined[key] = ret;
        }

        return defined[key];
    };

    define = function (key, deps, callback) {
        if (key) {
            key = key.toLowerCase();
        }
        if (!(deps instanceof Array)) {
            callback = deps;
            deps = [];
        }
        if (defineWaiting[key]) {
            throw  new Error('the key already has been  used');
        }
        defineWaiting[key] = {
            'deps': deps,
            'callback': callback,
            'module': null
        };
    };

    require = function (key) {
        return callDeps(key);
    };

})();

// qti model
define('model/ajax', ['model/logger', 'model/event'], function (_logger, _event) {

    var _ajax = {
        _logger: _logger,
        _event: _event
    };

    if (window.XDomainRequest) {
        _logger.debug('_ajax:使用XDomainRequest加载数据');
        //支持ie特有的支持xml跨与访问的方式
        _ajax._getUrl = function (url, callback,errorCallback) {
            var that = this;
            var request = new XDomainRequest();
            request.open('GET', url);
            request.onload = function () {
                callback(this.responseText);
            };
            request.onprogress = function () {

            };
            request.ontimeout = function () {
                _logger.error('_ajax:XDomainRequest加载超时');
                errorCallback && errorCallback(ex);
            };
            request.onerror = function () {
                _logger.error('_ajax:XDomainRequest加载失败');
                that._event.trigger('load', 'error', url);
                errorCallback && errorCallback(ex);
            };
            request.send();
        };
    } else {
        //默认使用jquery的xml访问
        _logger.debug('_ajax:使用jquery ajax加载数据');
        _ajax._getUrl = function (url, callback,errorCallback) {
            var that = this;
            $.ajax({
                method: 'GET',
                url: url,
                dataType: 'text',
                cache: false
            }).done(function (xmlText) {
                callback(xmlText);
            }).fail(function () {
                _logger.error('_ajax:jquery ajax加载失败');
                that._event.trigger('load', 'error', url);
                errorCallback && errorCallback(ex);
            });
        };
    }

    return _ajax;

});

// qti model
define('model/convertTextToMultiple', ['model/logger', 'model/utils'], function (_logger, _utils) {

    var convertTextToMultiple = function (assessmentItemModel) {
        var isTextEntry = true;
        var prompt = '';
        var firstModelId = '';
        var modelMap = assessmentItemModel.modelMap;
        //将选择题转换为复合题中的结构
        for (var modelKey in modelMap) {
            if (!firstModelId) {
                firstModelId = modelKey;
            }

            var model = modelMap[modelKey];
            if (model.modelType !== 'textEntryInteraction') {
                isTextEntry = false;
                break;
            }
        }
        if (isTextEntry) {
            prompt = assessmentItemModel.prompt.replace(/<(div|span) class="_qp-model"[\s\S]*?><\/(div|span)>/g, function (modelHtml) {
                var modelId = _utils.getValue(modelHtml, /data-model-id="([\s\S]*?)"/);
                var model = modelMap[modelId];
                return '<textEntry textentryid="" keyboard="' + model.keyboard + '"  style="' + model.style + '" width="' + model.width + '" expectedLength="' + model.expectedLength + '" \/>';
            });

            var multipleModel = {
                modelId: firstModelId,
                modelType: 'textEntryMultipleInteraction',
                prompt: prompt,
                questionType: '',
                style: ''
            };

            var correctAnswer = [];
            for (var key in assessmentItemModel.correctAnswer) {
                var answer = assessmentItemModel.correctAnswer[key].value;
                correctAnswer.push(answer[0]);
            }
            assessmentItemModel.correctAnswer = {};
            assessmentItemModel.correctAnswer[firstModelId] = {
                value: correctAnswer,
                identifier: firstModelId,
                cardinality: 'multiple',
                baseType: 'pair'
            };

            assessmentItemModel.modelMap = {};
            assessmentItemModel.modelMap[firstModelId] = multipleModel;
            assessmentItemModel.prompt = '<div class="_qp-model" data-model-id="' + firstModelId + '" ></div>';
        }
    };
    return convertTextToMultiple;
});

// qti model
define('model/event', ['model/logger'], function (logger) {

    //空方法
    var _emptyFunc = function () {
    };

    //创建事件管理对象
    var _event = {
        _logger: logger,
        _eventHandler: {
            load: {
                error: _emptyFunc
            }
        },
        trigger: function (group, type, para) {
            this._logger.debug('model trigger event:' + group + '-' + type);
            this._eventHandler[group][type](para);
        },
        bind: function (group, type, callback) {
            if (this._eventHandler[group] && this._eventHandler[group][type] && $.type(callback) === 'function') {
                this._logger.debug('model bind event:' + group + '-' + type);
                this._eventHandler[group][type] = callback;
            }
        }
    };

    return _event;

});

define('model/exception', ['model/logger', 'model/event'], function (_logger, _event) {


    'use strict';

    var exception = {
        create: function (message, throwable, code) {
            throwable.message = message + '： ' + throwable.message;
            throwable.code = code || 0;
            throwable.type = 'qtiplayerException';
            return throwable;
        }
    };

    return exception;
});
// qti model
//define('model/ie8shim', function () {


//兼容代码
if (typeof Array.prototype.forEach === typeof  undefined) {
    Array.prototype.forEach = function (callback) {
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            callback.apply(this, [item, i, this]);
        }
    };
}
if (typeof String.prototype.trim === typeof  undefined) {
    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    };
}

if (typeof Array.prototype.clear === typeof  undefined) {
//array 方法增强
    Array.prototype.clear = function () {
        while (this.length) {
            this.pop();
        }
    };
}
if (typeof Array.prototype.pushArray === typeof  undefined) {
    Array.prototype.pushArray = function () {
        var toPush = this.concat.apply([], arguments);
        for (var i = 0, len = toPush.length; i < len; ++i) {
            this.push(toPush[i]);
        }
    };
}

if (typeof Array.prototype.indexOf === typeof  undefined) {
    Array.prototype.indexOf = function (item) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == item) {
                return i;
            }
        }
        return -1;
    };
}


//--扩展出jq的_xml方法，兼容IE浏览器无innerHTML的问题
//获取JQ的XML对象中的内部的所有元素，类似innerHTML
$.prototype._xml = function () {
    if (this.length <= 0)
        return null;
    var _this = this[0];
    var _xmlinnerHTMLSTR = '';
    if (window.DOMParser) { // Standard
        var oSerializer = new XMLSerializer();
        _xmlinnerHTMLSTR = oSerializer.serializeToString(_this);
    } else { // IE
        _xmlinnerHTMLSTR = _this.xml;
    }
    var myregexp = /^\s*<[\s\S]*?>([\s\S]*)<[\s\S]*?>\s*$/;
    var _xmlinnerHTML = _xmlinnerHTMLSTR.match(myregexp);
    if (_xmlinnerHTML && _xmlinnerHTML.length >= 2)
        return _xmlinnerHTML[1];
};

//});
// qti model
define('model/logger', function () {
    var method;
    var noop = function () {
    };

    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var _console = (window.console = window.console || {});
    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!_console[method]) {
            _console[method] = noop;
        }
    }

    //logger
    //----创建日志处理对象
    //logger level值(debug:3, info:2, warn:1, error: 0, close: -1)
    var _logger = {
        _level: 0,
        _console: _console,
        setLevel: function (level) {
            switch (level) {
                case 'debug':
                    this._level = 3;
                    break;
                case 'info':
                    this._level = 2;
                    break;
                case 'warn':
                    this._level = 1;
                    break;
                case 'error':
                    this._level = 0;
                    break;
                default:
                    this._level = -1;
            }
        },
        _log: function (method, args) {
            try {
                this._console[method].apply(this._console, args);
            } catch (e) {
                var that = this;
                this._log = function (method, args) {
                    if (args.length <= 1) {
                        that._console[method](args[0]);
                    } else {
                        that._console[method](args);
                    }
                };
                this._log(method, args);
            }
        },
        debug: function (msg) {
            if (this._level >= 3) {
                this._log('log', arguments);
            }
        },
        info: function (msg) {
            if (this._level >= 2) {
                this._log('info', arguments);
            }
        },
        warn: function (msg) {
            if (this._level >= 1) {
                this._log('warn', arguments);
            }
        },
        error: function (msg) {
            if (this._level >= 0) {
                this._log('error', arguments);
            }
        }
    };
    return _logger;
});

//绑定全局变量
if (!window.QtiPlayer) {
    window.QtiPlayer = {};
}
// qti model
define('model/qtiModel', ['model/logger', 'model/event', 'model/utils', 'model/ajax'], function (_logger, _event, _utils, _ajax) {

    var jsonParser = require('model/json/jsonParser');
    var xmlParser = require('model/xml/xmlParser');
    var convertTextToMultiple = require('model/convertTextToMultiple');

    var _QtiPlayer = window.QtiPlayer;


    //全局api
    _QtiPlayer.getLogger = function () {
        return _logger;
    };

    _QtiPlayer.getUtils = function () {
        return _utils;
    };

    _QtiPlayer.setLoggerLevel = function (level) {
        return _logger.setLevel(level);
    };

    /**
     * 全局API，load习题
     * @param loadSrc 习题model的 url/json字符串/json对象
     * @param option 配置信息json对象
     * @param callback 加载数据成功的回调
     */
    _QtiPlayer.load = function (loadSrc, option, callback, errorCallback) {
        try {
            if (loadSrc && loadSrc instanceof Object) {// json对象转json字符串
                loadSrc = JSON.stringify(loadSrc);
            }

            var prefix = loadSrc.substring(0, 1);
            var assessmentItemModel;
            if (prefix === '{' || prefix === '[') {// json字符串
                assessmentItemModel = jsonParser.parse(loadSrc, option, null);

                //将普通填空题转换为复合中的结构
                if (option.unifyTextEntry === true) {
                    convertTextToMultiple(assessmentItemModel);
                }

                if (callback) {
                    callback(assessmentItemModel);
                }
            } else {// url字符串
                _logger.debug('_ajax:加载' + loadSrc);
                _ajax._getUrl(loadSrc, function (text) {
                    try {
                        text = $.trim(text);
                        prefix = text.substring(0, 1);
                        if (prefix === '{' || prefix === '[') {
                            assessmentItemModel = jsonParser.parse(text, option, loadSrc);
                        } else {
                            assessmentItemModel = xmlParser.parse(text, option, loadSrc);
                        }

                        //将普通填空题转换为复合中的结构
                        if (option.unifyTextEntry === true) {
                            convertTextToMultiple(assessmentItemModel);
                        }

                        if (callback) {
                            callback(assessmentItemModel);
                        }
                    } catch (ex) {
                        _logger.error('load解析数据:',  ex);
                        errorCallback && errorCallback(ex);
                    }
                }, function (ex) {
                    _logger.error('load加载数据:',  ex);
                    errorCallback && errorCallback(ex);
                });
            }
        } catch (ex) {
            _logger.error('load解析数据:',  ex);
            errorCallback && errorCallback(ex);
        }
    };

    _QtiPlayer.loadOnError = function (callback) {
        _event.bind('load', 'error', callback);
    };
});

//初始化qtiplayer-model
//require('model/modelParser');

// qti model
define('model/utils', function () {
    //工具类
    var _utils = {
        _encodeLeftRegex: /</g,
        _decodeLeftRegex: /&lt;/g,
        _encodeRightRegex: />/g,
        _decodeRightRegex: /&gt;/g,
        _encodeAndRegex: /&/g,
        _decodeAndRegex: /&amp;/g,
        _decodeBlankRegex: /&nbsp;/g,
        xmlEncode: function (value) {
            value = value.replace(this._encodeAndRegex, '&amp;');
            value = value.replace(this._encodeLeftRegex, '&lt;');
            value = value.replace(this._encodeRightRegex, '&gt;');
            return value;
        },
        xmlDecode: function (value) {
            value = value.replace(this._decodeBlankRegex, ' ');
            value = value.replace(this._decodeLeftRegex, '<');
            value = value.replace(this._decodeRightRegex, '>');
            value = value.replace(this._decodeAndRegex, '&');
            return value;
        },
        stringToBoolean: function (v) {
            var result = false;
            if (v && v === 'true') {
                result = true;
            }
            return result;
        },
        getValue: function (xml, v, index) {
            var result = '';
            var arr = xml.match(v);
            if (typeof  index === 'number' && arr && arr.length > index) {
                result = arr[index]
            } else if (arr && arr.length === 2) {
                result = arr[1];
            }
            return result;
        },
        getValues: function (xml, r, v) {
            var values = [];
            var value;
            var arr = xml.match(r);
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    value = this.getValue(arr[i], v);
                    if (value) {
                        values.push(value);
                    }
                }
            }
            return values;
        },
        getIntValue: function (xml, v) {
            var result = 0;
            var arr = xml.match(v);
            if (arr && arr.length === 2) {
                result = parseInt(arr[1]);
            }
            return result;
        },
        getBasePath: function (path) {
            if (typeof path == typeof  undefined) {
                throw new Error('path not defined');
            }
            var hashIndex = path.lastIndexOf('#');
            if (hashIndex == -1) {
                hashIndex = path.length;
            }
            var queryIndex = path.indexOf('?');
            if (queryIndex == -1) {
                queryIndex = path.length;
            }
            var slashIndex = path.lastIndexOf('/', Math.min(queryIndex, hashIndex));
            return slashIndex >= 0 ? path.substring(0, slashIndex) : '';
        },
        template: function (tpl, attrs) {
            var templateRegExp = /\$\{(.+?)(?:\:(.+?))?\}/g;
            return tpl.replace(templateRegExp, function ($0, $1, $2) {
                if (attrs[$1] !== undefined) {
                    return attrs[$1];
                }
                return $0;
            });
        },
        getUuid: function () {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        },
        //获取地址后缀,入json,xml
        getPathSuffix: function (path) {
            path = path.toLowerCase();
            var hashIndex = path.indexOf('#');
            if (hashIndex == -1) {
                hashIndex = path.length;
            }
            var queryIndex = path.indexOf('?');
            if (queryIndex == -1) {
                queryIndex = path.length;
            }
            var slashIndex = Math.min(queryIndex, hashIndex);
            var reUrl = slashIndex >= 0 ? path.substring(0, slashIndex) : '';

            var dotIndex = reUrl.indexOf('.');
            return dotIndex >= 0 ? reUrl.substring(dotIndex + 1) : '';
        }
    };

    return _utils;

});

//create by 王斌
define('model/json/jsonConvert', ['model/utils', 'model/logger'], function (_utils, _logger) {

    var addAnswer = function (response) {
        var item = {
            baseType: response.base_type,
            cardinality: response.cardinality,
            identifier: response.identifier,
            value: response.corrects
        };
        return item;
    };


    var feedbackParser = {
        _subjectiveRegex: /class="subjectivebase_text"/i,
        _subjectiveBaseAssetRegex: /<div[^<>]*?class="asset"[^<>]*?><\/div>/g,
        _subjectiveBaseAssetPosterRegex: /data-poster="([\s\S]*?)"/,
        _subjectiveBaseAssetSrcRegex: /data-src="([\s\S]*?)"/,
        _subjectiveBaseAssetTypeRegex: /data-type="([\s\S]*?)"/,
        _subjectiveBaseTextRegex: /<div class="subjectivebase_text">([\s\S]*?)<\/div>\s*?<div class="subjectivebase_asset"/,
        _widthRegex: /width="([\s\S]+)"/,
        _heightRegex: /height="([\s\S]+)"/,
        parse: function (content, itemModel) {
            //是否是主观题提示内容
            if (this._subjectiveRegex.test(content)) {
                var assets = [];
                var text = '';

                var assetsResult = content.match(this._subjectiveBaseAssetRegex);
                if (assetsResult) {
                    for (var i = 0; i < assetsResult.length; i++) {
                        var asset = assetsResult[i];
                        assets.push({
                            poster: _utils.getValue(asset, this._subjectiveBaseAssetPosterRegex),
                            src: _utils.getValue(asset, this._subjectiveBaseAssetSrcRegex),
                            type: _utils.getValue(asset, this._subjectiveBaseAssetTypeRegex),
                            width: _utils.getIntValue(asset, this._widthRegex),
                            height: _utils.getIntValue(asset, this._heightRegex)
                        });
                    }
                }
                text = _utils.getValue(content, this._subjectiveBaseTextRegex);
                itemModel.contentData = {
                    asset: assets,
                    text: text
                }
            }
        }
    };

    var addFeedBack = function (feedback, modelId) {
        var item = {
            content: feedback.content,
            identifier: feedback.identifier,
            modelId: modelId,
            showHide: feedback.show_hide
        };

        feedbackParser.parse(feedback.content, item);

        return item;
    };


    var questionTypeToModelType = function (questionType) {
        var types = {
            'choice': 'choiceInteraction',
            'multiplechoice': 'choiceInteraction',
            'vote': 'choiceInteraction_vote',
            "judge": "choiceInteraction",
            "order": "orderInteraction",
            "match": "matchInteraction",
            "extendedtext": "extendedTextInteraction",
            "graphicgapmatch": "graphicGapMatchInteraction",
            "textentry": "textEntryInteraction",
            "textentrymultiple": "textEntryMultipleInteraction",
            "drawing": "drawingInteraction_drawing",
            "handwrite": "drawingInteraction_handwrite",
            "subjectivebase": "extendedTextInteraction",
            "inlinechoice": "inlineChoiceInteraction"
        };
        return types[questionType];
    };

    var checkUseMath = function (texts) {
        for (var i = 0; i < texts.length; i++) {
            if (texts[i] && texts[i].indexOf("<latex") != -1) {
                return true;
            }
        }
        return false;
    };

    var number = /^-?[0-9]+\.?[0-9]*$/;

    var addTextEntryModel = function (result, textentrys, responses) {
        for (var j = 0; j < textentrys.length; j++) {
            var keyboard = "text";
            if (responses) {
                for (var i = 0; i < responses.length; i++) {
                    var response = responses[i];
                    var modelId = response.identifier;
                    if (modelId === textentrys[j]) {
                        if (response.corrects && number.test(response.corrects[0])) {
                            keyboard = "number";
                        }
                        break;
                    }
                }
            }
            result.modelMap[textentrys[j]] = {
                modelId: textentrys[j],
                modelType: "textEntryInteraction",
                questionType: '',
                keyboard: keyboard,
                width: 0,
                expectedLength: 0,
                style: ''
            };
        }
    };
    var addMultipleTextEntryModel = function (result, item, questionModel) {
        _logger.debug(filterMultTextentryInteraction(item.prompt, questionModel));
        result.modelMap[item.response_identifier] = {
            modelId: item.response_identifier,
            modelType: "textEntryMultipleInteraction",
            questionType: '',
            prompt: filterMultTextentryInteraction(item.prompt, questionModel),
            style: ''
        };
    };
    var filterMultTextentryInteraction = function (text, questionModel) {
        if (!text) return '';
        var i = 0;
        return text.replace(/<textentryinteraction[^>]*?responseidentifier="([^\"]+)"[^>]*?><\/textentryinteraction>/gm, function (text, identifier, otherMsg) {
            var keyboard = '';
            if (questionModel && questionModel.corrects && questionModel.corrects[i] !== 'undefined') {
                if (number.test(questionModel.corrects[i])) {
                    keyboard = "number";
                }
            }
            i++;
            return "<textEntry textentryid=\"" + identifier + "\" keyboard=\"" + keyboard + "\" \/>";
        });
    };

    var modelMap = {
        subjectivebase: {
            _subjectiveBaseAssetRegex: /<div[^<>]*?class="asset"[^<>]*?><\/div>/g,
            _subjectiveBaseAssetPosterRegex: /data-poster="([\s\S]*?)"/,
            _subjectiveBaseAssetSrcRegex: /data-src="([\s\S]*?)"/,
            _subjectiveBaseAssetTypeRegex: /data-type="([\s\S]*?)"/,
            _subjectiveBaseTextRegex: /<div class="subjectivebase_text">([\s\S]*?)<\/div>\s*?<div class="subjectivebase_asset"/,
            _widthRegex: /width="([\s\S]+)"/,
            _heightRegex: /height="([\s\S]+)"/,
            parse: function (resModel, itemModel) {
                var that = this;
                var assets = [];
                var text = '';
                var prompt = resModel.prompt;
                var assetsResult = prompt.match(that._subjectiveBaseAssetRegex);
                if (assetsResult) {
                    for (var i = 0; i < assetsResult.length; i++) {
                        var asset = assetsResult[i];
                        assets.push({
                            poster: _utils.getValue(asset, that._subjectiveBaseAssetPosterRegex),
                            src: _utils.getValue(asset, that._subjectiveBaseAssetSrcRegex),
                            type: _utils.getValue(asset, that._subjectiveBaseAssetTypeRegex),
                            width: _utils.getIntValue(asset, that._widthRegex),
                            height: _utils.getIntValue(asset, that._heightRegex)
                        });
                    }
                }
                text = _utils.getValue(prompt, that._subjectiveBaseTextRegex);

                itemModel.text = text;
                itemModel.asset = assets;
            }
        },
        rubricBlock: {
            _subjectiveBaseAssetRegex: /<div[^<>]*?class="asset"[^<>]*?><\/div>/g,
            _subjectiveBaseAssetPosterRegex: /data-poster="([\s\S]*?)"/,
            _subjectiveBaseAssetSrcRegex: /data-src="([\s\S]*?)"/,
            _subjectiveBaseAssetTypeRegex: /data-type="([\s\S]*?)"/,
            _responseTextRegex: /<div class="response_text">([\s\S]*?)<\/div>\s*?<div class="subjectivebase_asset"/,
            _widthRegex: /width="([\s\S]+)"/,
            _heightRegex: /height="([\s\S]+)"/,
            parse: function (prompt, itemModel) {
                //该模型为对应的问答题的参考答案
                var that = this;
                var rubricBlock;
                var view = 'scorer';

                var subjectiveBase = that._responseTextRegex.test(prompt);
                if (subjectiveBase) {
                    var assets = [];
                    var text = '';

                    var assetsResult = prompt.match(that._subjectiveBaseAssetRegex);
                    if (assetsResult) {
                        for (var i = 0; i < assetsResult.length; i++) {
                            var asset = assetsResult[i];
                            assets.push({
                                poster: _utils.getValue(asset, that._subjectiveBaseAssetPosterRegex),
                                src: _utils.getValue(asset, that._subjectiveBaseAssetSrcRegex),
                                type: _utils.getValue(asset, that._subjectiveBaseAssetTypeRegex),
                                width: _utils.getIntValue(asset, that._widthRegex),
                                height: _utils.getIntValue(asset, that._heightRegex)
                            });
                        }
                    }
                    text = _utils.getValue(prompt, that._responseTextRegex);

                    rubricBlock = {
                        view: view,
                        text: text,
                        asset: assets
                    };
                } else {
                    rubricBlock = {
                        prompt: prompt,
                        view: view
                    };
                }
                itemModel.rubricBlock = rubricBlock;
            }
        },
        drawing: {
            parse: function (resModel, itemModel) {
                _logger.debug(resModel);
                itemModel.asset = [];
                if (resModel.prompt_object.assets) {
                    var assets = resModel.prompt_object.assets;
                    itemModel.asset = assets;
                }
                if (resModel.prompt_object.asset_titles) {
                    var assetsTitle = resModel.prompt_object.asset_titles;
                    itemModel.assetTitle = assetsTitle;
                }
                itemModel.content = resModel.prompt_object.content;
                itemModel.object = resModel.object;
                itemModel.paperType = resModel.papertype;
                itemModel.title = filterTextentryInteraction(resModel.prompt_object.title, [], true);
                itemModel.titleType = resModel.titletype;
            }
        },
        handwrite: {
            parse: function (resModel, itemModel) {
                itemModel.object = resModel.object;
                itemModel.object.width = itemModel.object.width ? parseInt(itemModel.object.width) : 0;
                itemModel.object.height = itemModel.object.height ? parseInt(itemModel.object.height) : 0;
            }
        },
        graphicgapmatch: {
            parse: function (resModel, itemModel) {
                //TODO .....需要服务端切图。
                //object &gapImg & associableHotspot
                itemModel.object = {};
                itemModel.object = resModel.object;
                itemModel.object.param = [];
                //兼容旧数据
                if (resModel.object.params['blankImage']) {
                    itemModel.object.data = resModel.object.params['blankImage'];
                    var keys = ['rows', 'columns', 'blankImage', 'originalImage'];
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        var value = resModel.object.params[key];
                        itemModel.object.param.push({
                            name: key,
                            value: value,
                            valueType: 'DATA'
                        });
                    }
                }
                else {
                    itemModel.object.param = resModel.object.params;
                    for (var j = 0; j < resModel.object.params.length; j++) {
                        var param = resModel.object.params[j];
                        if (param.name === "blankImage") {
                            itemModel.object.data = param.value;
                        }
                    }
                }

                itemModel.object.width = itemModel.object.width ? parseInt(itemModel.object.width) : 0;
                itemModel.object.height = itemModel.object.height ? parseInt(itemModel.object.height) : 0;
                itemModel.gapImg = resModel.gap_imgs;
                if (itemModel.gapImg) {
                    for (var i = 0; i < itemModel.gapImg.length; i++) {
                        var obj = itemModel.gapImg[i];
                        if (typeof obj.matchMax == 'undefined') {
                            obj.matchMax = 1;
                        }
                        //兼容text数据
                        if (typeof obj.text != 'undefined') {
                            obj.identifier = obj.text;
                        }
                    }
                }
                itemModel.associableHotspot = resModel.associable_hotspots;
                if (itemModel.associableHotspot) {
                    for (var i = 0; i < itemModel.associableHotspot.length; i++) {
                        var obj = itemModel.associableHotspot[i];
                        if (typeof obj.matchMax == 'undefined') {
                            obj.matchMax = 1;
                        }
                    }
                }
            }
        },
        match: {
            parse: function (resModel, itemModel) {
                var groups = {};
                var groupsArray = [];
                for (var i = 0; i < resModel.choices.length; i++) {
                    var choice = resModel.choices[i];
                    var playerChoice = {
                        content: choice.text,
                        fixed: choice.fixed,
                        matchMax: choice.match_max,
                        identifier: choice.identifier
                    };
                    var groupId = choice.group_id;
                    if (!groups[groupId]) {
                        var array = [];
                        groups[groupId] = array;
                        groupsArray.push(array);
                    }
                    groups[groupId].push(playerChoice);
                }
                itemModel.simpleMatchSet = groupsArray;
            }
        }
    };
    var addModel = function (model, result) {
        var textentrys = [];
        var item = {
            layout: model.layout || '',
            modelId: model.response_identifier,
            modelType: questionTypeToModelType(model.type),
            prompt: filterTextentryInteraction(model.prompt, textentrys),
            questionType: model.type,
            shuffle: model.shuffle,
            style: ''
        };

        if (model.type != 'drawing' && model.type != 'textentrymultiple') {
            addTextEntryModel(result, textentrys, result.correctAnswer);
        }

        if (model.type != 'match') {
            item.maxChoices = model.max_choices;
            item.minChoices = model.min_choices || 0;
        }
        else {
            item.maxAssociations = model.max_choices;
            item.minAssociations = model.min_choices || 0;
        }

        if (model.choices && model.choices.length > 0) {
            if (model.type != 'match') {
                item.simpleChoice = [];
                for (var i = 0; i < model.choices.length; i++) {
                    var choice = model.choices[i];
                    item.simpleChoice.push({
                        content: choice.text,
                        fixed: choice.fixed,
                        identifier: choice.identifier
                    });
                }
            }
        }

        if (modelMap[model.type]) {
            modelMap[model.type].parse(model, item);
        }
        _logger.debug(item);
        return item;
    };
    var findByModelId = function (result, id) {
        return result.modelMap[id];
    };
    var filterTextentryInteraction = function (text, ids, useTextentry) {
        if (!text) return '';
        return text.replace(/<textentryinteraction[^>]*?responseidentifier="([^\"]+)"[^>]*?><\/textentryinteraction>/gm, function (text, identifier) {
            ids.push(identifier);
            return useTextentry ? "<textEntry\/>" : '<span class="_qp-model" data-model-id="' + identifier + '" ></span>';
        });
    };

    //文本选择题
    var addInlineModel = function (modelMap, resModel) {
        var inlineChoice;
        for (var i = 0; i < resModel.children.length; i++) {
            inlineChoice = [];
            var choice = resModel.children[i];
            for (var j = 0; j < choice.choices.length; j++) {
                var playerChoice = {
                    content: choice.choices[j].text,
                    identifier: choice.choices[j].identifier
                };
                inlineChoice.push(playerChoice);
            }
            modelMap[choice.response_identifier] = {
                inlineChoice: inlineChoice,
                modelId: choice.response_identifier,
                modelType: 'inlineChoiceInteraction',
                questionType: 'inlinechoice',
                shuffle: false
            };
        }
    };

//检查是否使用mathjax
    var jsonAdapter = {
        convert: function (assessment) {
            _logger.debug(assessment);
            var texts = [];
            var result = {
                answerFeedback: {},
                correctAnswer: {},
                hasMath: false,
                hintFeedback: {},
                modelMap: {},
                prompt: ''
            };
            //反馈
            for (var i = 0; i < assessment.feedbacks.length; i++) {
                var feedback = assessment.feedbacks[i];
                var modelId = 'RESPONSE_' + (feedback.sequence || 1) + "-1";
                var playerFeedback = addFeedBack(feedback, modelId);
                if (feedback.identifier == 'showHint') {
                    result.hintFeedback[modelId] = playerFeedback;
                }
                else if (feedback.identifier == 'showAnswer') {
                    result.answerFeedback[modelId] = playerFeedback;
                }
                texts.push(feedback.content);
            }
            //具体题型
            var prompt = '';
            for (var i = 0; i < assessment.items.length; i++) {
                var item = assessment.items[i];
                var modelId = item.response_identifier;
                if (item.type == 'data' || item.type == 'textentry') {
                    var textentrys = [];
                    prompt = prompt + " " + filterTextentryInteraction(item.prompt, textentrys);
                    addTextEntryModel(result, textentrys, assessment.responses);
                } else if (item.type == 'textentrymultiple') {
                    var questionModel;
                    for (var j = 0; j < assessment.responses.length; j++) {
                        if (assessment.responses[j]['identifier'] === item.response_identifier) {
                            questionModel = assessment.responses[j];
                            break;
                        }
                    }
                    prompt = prompt + ' <div class="_qp-model" data-model-id="' + item.response_identifier + '" ></div>';
                    addMultipleTextEntryModel(result, item, questionModel);
                }
                else if (item.type === 'inlinechoice') {
                    var regex = /<inlinechoiceinteraction(?:.*?)responseidentifier="([\s\S]*?)"(?:.*?)shuffle=(["'])([^"']*?)\2><\/inlinechoiceinteraction>/ig;
                    prompt = item.prompt.replace(regex, function ($1, responseidentifier, $3, shuffle) {
                        return '<span class="_qp-model" data-model-id="' + responseidentifier + '" style=""></span>';
                    });
                    addInlineModel(result.modelMap, item);
                }
                else {
                    prompt = prompt + " <div class=\"_qp-model\" data-model-id=\"" + modelId + "\" style=\"\"></div>";
                    var playerItem = addModel(item, result);
                    playerItem.full_score = item.full_score || 0;
                    playerItem.user_score = item.user_score || 0;
                    result.modelMap[modelId] = playerItem;
                }
                texts.push(item.prompt);
                if (item.choices && item.choices.length > 0) {
                    for (var j = 0; j < item.choices.length; j++) {
                        texts.push(item.choices[j].text);
                    }
                }
                //作文题
                if (item.prompt_object) {
                    texts.push(item.prompt_object.title);
                    texts.push(item.prompt_object.content);
                    if (item.prompt_object.assets) {
                        var assets = item.prompt_object.assets;
                        for (var j = 0; j < assets.length; j++) {
                            texts.push(assets[j]);
                        }
                    }
                }
            }
            //答案
            for (var i = 0; i < assessment.responses.length; i++) {
                var response = assessment.responses[i];
                var modelId = response.identifier;
                var questionModel = findByModelId(result, modelId);

                var playerAnswer = addAnswer(response);
                for (var j = 0; j < response.corrects.length; j++) {
                    texts.push(response.corrects[j]);
                }
                if (questionModel && (questionModel.questionType === 'subjectivebase' || questionModel.questionType == 'extendedtext')) {
                    modelMap.rubricBlock.parse(response.corrects[0], questionModel);
                }
                result.correctAnswer[modelId] = playerAnswer;
            }

            result.hasMath = checkUseMath(texts);
            result.prompt = prompt;
            _logger.debug(result);
            return result;
        }
    };

    return jsonAdapter;
});

// qti model
define('model/json/jsonParser', ['model/logger', 'model/utils', 'model/json/jsonConvert'], function (_logger, _utils, _jsonConvert) {

    //json数据解析
    var _json = {
        _logger: _logger,
        _refPathRegex: /\$\{ref-path\}/g,
        _refBaseRegex: /\$\{ref-base\}/g,
        _imgFilterRegex: /<img([^<>]*?)><\/img>/g,
        _convert: null,
        parseJson: function (jsonText, option, url) {
            var that = this;
            var refPath = '';
            var basePath = '';
            if (option && option.refPath) {
                refPath = option.refPath;
            }
            if(option && option.basePath) {
                basePath = option.basePath;
            }

            //替换refPath表达式
            jsonText = jsonText.replace(that._refPathRegex, refPath);
            //替换basePath表达式
            jsonText = url ? jsonText.replace(that._refBaseRegex, _utils.getBasePath(url)) : jsonText.replace(that._refBaseRegex, basePath);

            //图片标签转换
            jsonText = jsonText.replace(that._imgFilterRegex, function ($0, $1) {
                var result = '<img' + $1 + '/>';
                return result;
            });
            //解析数据
            var itemModel = JSON.parse(jsonText);

            //json数据适配
            var assessmentItemModel = that._convert(itemModel);

            var correctAnswer;
            var model;
            for (var mId in assessmentItemModel.modelMap) {
                model = assessmentItemModel.modelMap[mId];
                if (model.modelType === 'textEntryInteraction' || model.modelType === 'textEntryMultipleInteraction') {
                    //编辑在保存正确的答案的字符串时，会对&<>这个3个符号做2次转义
                    correctAnswer = assessmentItemModel.correctAnswer[mId];
                    if (correctAnswer && correctAnswer.value.length > 0) {
                        for (var index = 0; index < correctAnswer.value.length; index++) {
                            value = correctAnswer.value[index];
                            //针对&<>三个符号进行decode
                            var value = _utils.xmlDecode(value);
                            correctAnswer.value[index] = value;
                        }
                    }
                }
            }
            return assessmentItemModel;
        },
        parse: function (text, option, url) {
            var that = this;
            that._convert = _jsonConvert.convert;
            if (!that._convert) {
                throw '_json:convert未加载';
            }
            //解析数据
            return that.parseJson(text, option, url);
        }
    };

    return _json;

});

// qti model
define('model/xml/choiceInteraction', ['model/utils'], function (_utils) {

    var choiceInteraction = {
        _choiceInteractionRegex: /<choiceInteraction[^/]*?>[\s\S]*?<\/choiceInteraction>/g,
        _choiceInteractionAttrRegex: /<choiceInteraction([\s\S]*?)>/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _shuffleRegex: /shuffle="([\s\S]*?)"/,
        _maxChoicesRegex: /maxChoices="(\d+)"/,
        _minChoicesRegex: /minChoices="(\d+)"/,
        _promptRegex: /<prompt>([\s\S]*?)<\/prompt>/,
        _simpleChoiceRegex: /<simpleChoice[\s\S]*?<\/simpleChoice>/g,
        _simpleChoiceValueRegex: /<simpleChoice[\s\S]*?>([\s\S]*?)<\/simpleChoice>/,
        _identifierRegex: /identifier="([\s\S]*?)"/,
        _fixedRegex: /fixed="([\s\S]*?)"/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        _layoutRegex: /layout="([\s\S]*?)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._choiceInteractionRegex, function (modelXml) {
                var choiceInteractionAttr = _utils.getValue(modelXml, that._choiceInteractionAttrRegex);
                var modelId = _utils.getValue(choiceInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var modelType = 'choiceInteraction';
                    var questionType = _utils.getValue(choiceInteractionAttr, that._questionTypeRegex);
                    if (questionType === 'vote') {
                        modelType = modelType + '_' + questionType;
                    }
                    var style = _utils.getValue(choiceInteractionAttr, that._styleRegex);
                    var shuffle = _utils.stringToBoolean(_utils.getValue(choiceInteractionAttr, that._shuffleRegex));
                    var maxChoices = _utils.getIntValue(choiceInteractionAttr, that._maxChoicesRegex);
                    var minChoices = _utils.getIntValue(choiceInteractionAttr, that._minChoicesRegex);
                    var layout = _utils.getValue(choiceInteractionAttr, that._layoutRegex);
                    var prompt = _utils.getValue(modelXml, that._promptRegex);
                    var simpleChoiceXmlArr = modelXml.match(that._simpleChoiceRegex);
                    var simpleChoice = [];
                    var simpleChoiceXml;
                    var identifier;
                    var fixed;
                    var content;
                    if (simpleChoiceXmlArr) {
                        for (var index = 0; index < simpleChoiceXmlArr.length; index++) {
                            simpleChoiceXml = simpleChoiceXmlArr[index];
                            identifier = _utils.getValue(simpleChoiceXml, that._identifierRegex);
                            fixed = _utils.stringToBoolean(_utils.getValue(simpleChoiceXml, that._fixedRegex));
                            content = _utils.getValue(simpleChoiceXml, that._simpleChoiceValueRegex);
                            simpleChoice.push({
                                identifier: identifier,
                                fixed: fixed,
                                content: content
                            });
                        }
                    }
                    var model = {
                        modelId: modelId,
                        modelType: modelType,
                        questionType: questionType,
                        style: style,
                        layout: layout,
                        prompt: prompt,
                        shuffle: shuffle,
                        maxChoices: maxChoices,
                        minChoices: minChoices,
                        simpleChoice: simpleChoice
                    };
                    itemModel.modelMap[modelId] = model;
                }
                return '<div class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></div>';
            });
            return result;
        }
    };

    return choiceInteraction;

});

// qti model
define('model/xml/correctAnswerParser', ['model/utils'], function (_utils) {

    var correctAnswerParser = {
        _correctAnswerRegex: /<responseDeclaration[^/]*?>[\s\S]*?<\/responseDeclaration>/g,
        _identifierRegex: /identifier="([\s\S]*?)"/,
        _cardinalityRegex: /cardinality="([\s\S]*?)"/,
        _baseTypeRegex: /baseType="([\s\S]*?)"/,
        _answerRegex: /<value>[\s\S]*?<\/value>/g,
        _answerValueRegex: /<value>([\s\S]*?)<\/value>/,
        parse: function (xml, itemModel) {
            var modelId;
            var correctAnswerXml;
            var cardinality;
            var baseType;
            var values;
            //解析正确答案
            var correctAnswerXmlArr = xml.match(this._correctAnswerRegex);
            if (correctAnswerXmlArr) {
                for (var index = 0; index < correctAnswerXmlArr.length; index++) {
                    correctAnswerXml = correctAnswerXmlArr[index];
                    modelId = _utils.getValue(correctAnswerXml, this._identifierRegex);
                    if (modelId) {
                        values = _utils.getValues(correctAnswerXml, this._answerRegex, this._answerValueRegex);
                        cardinality = _utils.getValue(correctAnswerXml, this._cardinalityRegex);
                        baseType = _utils.getValue(correctAnswerXml, this._baseTypeRegex);
                        itemModel.correctAnswer[modelId] = {
                            identifier: modelId,
                            cardinality: cardinality,
                            baseType: baseType,
                            value: values
                        };
                    }
                }
            }
        }
    }

    return correctAnswerParser;

});

// qti model
define('model/xml/drawingInteraction', ['model/utils'], function (_utils) {

    var drawingInteraction = {
        _drawingInteractionRegex: /<drawingInteraction[^/]*?>[\s\S]*?<\/drawingInteraction>/g,
        _drawingInteractionAttrRegex: /<drawingInteraction([\s\S]*?)>/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        _titleTypeRegex: /titletype="([\s\S]*?)"/,
        _paperTypeRegex: /papertype="([\s\S]*?)"/,
        _titleRegex: /<div class="drawingInteraction_title">([\s\S]*)<\/div>\s*?<div class="drawingInteraction_content">/,
        _contentRegex: /<div class="drawingInteraction_content">([\s\S]*)<\/div>\s*?<div class="drawingInteraction_asset">/,
        _assetRegex: /<div class="drawingInteraction_asset">([\s\S]*)<\/div>\s*?<\/prompt>/,
        _assetValueRegex: /<div class="asset">([\s\S]*?)<\/div>\s*?<div class="asset">/,
        _assetTitleRegex: /<div class="drawingInteraction_asset_title">([\s\S]*)<\/div>\s*?<\/prompt>/,
        _assetTitleValueRegex: /<div class="asset_title">([\s\S]*?)<\/div>\s*?<div class="asset_title">/,
        _emptyAssetRegex: /<div class="asset"\/>/g,
        _emptyAssetTitleRegex: /<div class="asset_title"\/>/g,
        _objectRegex: /(<object[\s\S]*?<\/object>)/,
        _dataRegex: /data="([\s\S]*?)"/,
        _typeRegex: /type="([\s\S]*?)"/,
        _widthRegex: /width="(\d+)"/,
        _heightRegex: /height="(\d+)"/,
        _promptRegex: /<prompt>([\s\S]*?)<\/prompt>/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._drawingInteractionRegex, function (modelXml) {
                var drawingInteractionAttr = _utils.getValue(modelXml, that._drawingInteractionAttrRegex);
                var modelId = _utils.getValue(drawingInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var model;
                    var questionType = _utils.getValue(drawingInteractionAttr, that._questionTypeRegex);
                    if (questionType === '') {
                        questionType = 'drawing';
                    }
                    var modelType = 'drawingInteraction_' + questionType;
                    var style = _utils.getValue(drawingInteractionAttr, that._styleRegex);
                    if (modelType === 'drawingInteraction_handwrite') {
                        //特殊题目
                        var prompt = _utils.getValue(modelXml, that._promptRegex);
                        model = {
                            modelId: modelId,
                            modelType: modelType,
                            questionType: questionType,
                            style: style,
                            prompt: prompt
                        };
                    } else {
                        var titleType = _utils.getValue(drawingInteractionAttr, that._titleTypeRegex);
                        var title = '';
                        if (titleType === '1') {
                            //固定命题
                            title = _utils.getValue(modelXml, that._titleRegex);
                        }
                        var paperType = _utils.getValue(drawingInteractionAttr, that._paperTypeRegex);
                        var content = _utils.getValue(modelXml, that._contentRegex);
                        var asset = [];
                        //获取asset
                        var assetXml = _utils.getValue(modelXml, that._assetRegex);
                        assetXml = assetXml.replace(that._emptyAssetRegex, '<div class="asset"></div>');
                        assetXml += '<div class="asset">';
                        var hasAsset = true;
                        while (hasAsset) {
                            hasAsset = false;
                            assetXml = assetXml.replace(that._assetValueRegex, function ($0, $1) {
                                hasAsset = true;
                                asset.push($1);
                                return '<div class="asset">';
                            });
                        }
                        //获取asset_title
                        var assetTitleXml = _utils.getValue(modelXml, that._assetTitleRegex);
                        assetTitleXml = assetTitleXml.replace(that._emptyAssetTitleRegex, '<div class="asset_title"></div>');
                        assetTitleXml += '<div class="asset_title">';
                        var hasAssetTitle = true;
                        var assetTitle=[];
                        while (hasAssetTitle) {
                            hasAssetTitle = false;
                            assetTitleXml = assetTitleXml.replace(that._assetTitleValueRegex, function ($0, $1) {
                                hasAssetTitle = true;
                                assetTitle.push($1);
                                return '<div class="asset_title">';
                            });
                        }

                        model = {
                            modelId: modelId,
                            modelType: modelType,
                            questionType: questionType,
                            style: style,
                            titleType: titleType,
                            paperType: paperType,
                            title: title,
                            content: content,
                            asset: asset,
                            assetTitle:assetTitle
                        };
                    }
                    var object = {};
                    var objectXml = _utils.getValue(modelXml, that._objectRegex);
                    object.type = _utils.getValue(objectXml, that._typeRegex);
                    object.data = _utils.getValue(objectXml, that._dataRegex);
                    object.width = _utils.getIntValue(objectXml, that._widthRegex);
                    object.height = _utils.getIntValue(objectXml, that._heightRegex);
                    model.object = object;
                    itemModel.modelMap[modelId] = model;
                }
                return '<div class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></div>';
            });
            return result;
        }
    };

    return drawingInteraction;

});

// qti model
define('model/xml/extendedTextInteraction', ['model/utils'], function (_utils) {

    var extendedTextInteraction = {
        _extendedTextInteractionRegex: /<extendedTextInteraction[^/]*?>[\s\S]*?<\/extendedTextInteraction>/g,
        _extendedTextInteractionAttrRegex: /<extendedTextInteraction([\s\S]*?)>/,
        _styleRegex: /style="([\s\S]*?)"/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _promptRegex: /<prompt>([\s\S]*?)<\/prompt>/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        _subjectiveBaseAssetRegex: /<div[^<>]*?class="asset"[^<>]*?><\/div>/g,
        _subjectiveBaseAssetPosterRegex: /data-poster="([\s\S]*?)"/,
        _subjectiveBaseAssetSrcRegex: /data-src="([\s\S]*?)"/,
        _subjectiveBaseAssetTypeRegex: /data-type="([\s\S]*?)"/,
        _subjectiveBaseTextRegex: /<div class="subjectivebase_text">([\s\S]*?)<\/div>\s*?<div class="subjectivebase_asset"/,
        _widthRegex: /width="([\s\S]+)"/,
        _heightRegex: /height="([\s\S]+)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._extendedTextInteractionRegex, function (modelXml) {
                var extendedTextInteractionAttr = _utils.getValue(modelXml, that._extendedTextInteractionAttrRegex);
                var modelId = _utils.getValue(extendedTextInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var questionType = _utils.getValue(extendedTextInteractionAttr, that._questionTypeRegex);
                    var modelType = 'extendedTextInteraction';
                    var style = _utils.getValue(extendedTextInteractionAttr, that._styleRegex);
                    var prompt = _utils.getValue(modelXml, that._promptRegex);
                    var model;
                    //特殊题型处理
                    if (questionType === 'subjectivebase') {
                        var assets = [];
                        var text = '';

                        var assetsResult = prompt.match(that._subjectiveBaseAssetRegex);
                        if (assetsResult) {
                            for (var i = 0; i < assetsResult.length; i++) {
                                var asset = assetsResult[i];
                                assets.push({
                                    poster: _utils.getValue(asset, that._subjectiveBaseAssetPosterRegex),
                                    src: _utils.getValue(asset, that._subjectiveBaseAssetSrcRegex),
                                    type: _utils.getValue(asset, that._subjectiveBaseAssetTypeRegex),
                                    width: _utils.getIntValue(asset, that._widthRegex),
                                    height: _utils.getIntValue(asset, that._heightRegex)
                                });
                            }
                        }
                        text = _utils.getValue(prompt, that._subjectiveBaseTextRegex);

                        model = {
                            text: text,
                            asset: assets,
                            modelId: modelId,
                            modelType: modelType,
                            questionType: questionType,
                            style: style,
                            rubricBlock: {
                                text: '',
                                asset: [],
                                view: 'scorer'
                            }
                        }
                    } else {
                        model = {
                            modelId: modelId,
                            modelType: modelType,
                            questionType: questionType,
                            style: style,
                            prompt: prompt,
                            rubricBlock: {
                                prompt: '',
                                view: 'scorer'
                            }
                        };
                    }

                    itemModel.modelMap[modelId] = model;
                }
                return '<div class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></div>';
            });
            return result;
        }
    };

    return extendedTextInteraction;

});

// qti model
define('model/xml/feedbackParser', ['model/utils'], function (_utils) {

    var feedbackParser = {
        _feedbackRegex: /<modalFeedback[^/]*?>[\s\S]*?<\/modalFeedback>/g,
        _showHideRegex: /showHide="([\s\S]*?)"/,
        _sequenceRegex: /sequence="([\s\S]*?)"/,
        _identifierRegex: /identifier="([\s\S]*?)"/,
        _contentRegex: /<modalFeedback[\s\S]*?>([\s\S]*?)<\/modalFeedback>/,
        _subjectiveRegex: /class="subjectivebase_text"/i,
        _subjectiveBaseAssetRegex: /<div[^<>]*?class="asset"[^<>]*?><\/div>/g,
        _subjectiveBaseAssetPosterRegex: /data-poster="([\s\S]*?)"/,
        _subjectiveBaseAssetSrcRegex: /data-src="([\s\S]*?)"/,
        _subjectiveBaseAssetTypeRegex: /data-type="([\s\S]*?)"/,
        _subjectiveBaseTextRegex: /<div class="subjectivebase_text">([\s\S]*?)<\/div>\s*?<div class="subjectivebase_asset"/,
        _widthRegex: /width="([\s\S]+)"/,
        _heightRegex: /height="([\s\S]+)"/,
        parse: function (xml, itemModel) {
            var modelId;
            var feedbackXml;
            var identifier;
            var sequence;
            var content;
            var showHide;
            var feedbackXmlArr = xml.match(this._feedbackRegex);
            if (feedbackXmlArr) {
                for (var index = 0; index < feedbackXmlArr.length; index++) {
                    feedbackXml = feedbackXmlArr[index];
                    sequence = _utils.getValue(feedbackXml, this._sequenceRegex);
                    if (sequence) {
                        modelId = 'RESPONSE_' + sequence + '-1';
                        identifier = _utils.getValue(feedbackXml, this._identifierRegex);
                        showHide = _utils.getValue(feedbackXml, this._showHideRegex);
                        content = _utils.getValue(feedbackXml, this._contentRegex);
                        var feedback = {
                            modelId: modelId,
                            showHide: showHide,
                            identifier: identifier,
                            content: content
                        };
                        //是否是主观题提示内容
                        if (this._subjectiveRegex.test(content)) {
                            var assets = [];
                            var text = '';

                            var assetsResult = content.match(this._subjectiveBaseAssetRegex);
                            if (assetsResult) {
                                for (var i = 0; i < assetsResult.length; i++) {
                                    var asset = assetsResult[i];
                                    assets.push({
                                        poster: _utils.getValue(asset, this._subjectiveBaseAssetPosterRegex),
                                        src: _utils.getValue(asset, this._subjectiveBaseAssetSrcRegex),
                                        type: _utils.getValue(asset, this._subjectiveBaseAssetTypeRegex),
                                        width: _utils.getIntValue(asset, this._widthRegex),
                                        height: _utils.getIntValue(asset, this._heightRegex)
                                    });
                                }
                            }
                            text = _utils.getValue(content, this._subjectiveBaseTextRegex);
                            feedback.contentData = {
                                asset: assets,
                                text: text
                            }
                        }

                        if (identifier === 'showHint') {
                            itemModel.hintFeedback[modelId] = feedback;
                        } else {
                            itemModel.answerFeedback[modelId] = feedback;
                        }
                    }
                }
            }
        }
    };

    return feedbackParser;

});

// qti model
define('model/xml/gapMatchInteraction', ['model/utils'], function (_utils) {

    var gapMatchInteraction = {
        _gapMatchInteractionRegex: /<gapMatchInteraction[^/]*?>[\s\S]*?<\/gapMatchInteraction>/g,
        _gapMatchInteractionAttrRegex: /<gapMatchInteraction([\s\S]*?)>/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _promptRegex: /<prompt>([\s\S]*?)<\/prompt>/,
        _shuffleRegex: /shuffle="([\s\S]*?)"/,
        _gapTextRegex: /<gapText[\s\S]*?<\/gapText>/g,
        _gapTextValueRegex: /<gapText[\s\S]*?>([\s\S]*?)<\/gapText>/,
        _identifierRegex: /identifier="([\s\S]*?)"/,
        _matchMaxRegex: /matchMax="([\s\S]*?)"/,
        _fixedRegex: /fixed="([\s\S]*?)"/,
        _tableContentRegex: /(<div class="gapMatchInteraction_table_content">[\s\S]*<\/div>)/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._gapMatchInteractionRegex, function (modelXml) {
                var gapMatchInteractionAttr = _utils.getValue(modelXml, that._gapMatchInteractionAttrRegex);
                var modelId = _utils.getValue(gapMatchInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var modelType = 'gapMatchInteraction';
                    var questionType = _utils.getValue(gapMatchInteractionAttr, that._questionTypeRegex);
                    var style = _utils.getValue(gapMatchInteractionAttr, that._styleRegex);
                    var shuffle = _utils.stringToBoolean(_utils.getValue(gapMatchInteractionAttr, that._shuffleRegex));
                    var prompt = _utils.getValue(modelXml, that._promptRegex);
                    var gapText = [];
                    var gapTextXmlArr = modelXml.match(that._gapTextRegex);
                    if (gapTextXmlArr) {
                        var gapTextXml;
                        var gapTextObj;
                        for (var index = 0; index < gapTextXmlArr.length; index++) {
                            gapTextXml = gapTextXmlArr[index];
                            gapTextObj = {};
                            gapTextObj.identifier = _utils.getValue(gapTextXml, that._identifierRegex);
                            gapTextObj.matchMax = _utils.getValue(gapTextXml, that._matchMaxRegex);
                            gapTextObj.content = _utils.getValue(gapTextXml, that._gapTextValueRegex);
                            gapText.push(gapTextObj);
                        }
                    }
                    var tableContent = _utils.getValue(modelXml, that._tableContentRegex);
                    var model = {
                        modelId: modelId,
                        modelType: modelType,
                        questionType: questionType,
                        style: style,
                        prompt: prompt,
                        shuffle: shuffle,
                        gapText: gapText,
                        tableMatchContent: tableContent
                    };
                    itemModel.modelMap[modelId] = model;
                }
                return '<div class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></div>';
            });
            return result;
        }
    };

    return gapMatchInteraction;

});

// qti model
define('model/xml/graphicGapMatchInteraction', ['model/utils'], function (_utils) {

    var graphicGapMatchInteraction = {
        _graphicGapMatchInteractionRegex: /<graphicGapMatchInteraction[^/]*?>[\s\S]*?<\/graphicGapMatchInteraction>/g,
        _graphicGapMatchInteractionAttrRegex: /<graphicGapMatchInteraction([\s\S]*?)>/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _promptRegex: /<prompt>([\s\S]*?)<\/prompt>/,
        _objectRegex: /(<object[\s\S]*?<\/object>)/,
        _paramRegex: /<param[\s\S]*?><\/param>/g,
        _nameRegex: /name="([\s\S]*?)"/,
        _valueRegex: /value="([\s\S]*?)"/,
        _valueTypeRegex: /valuetype="([\s\S]*?)"/,
        _gapImgRegex: /<gapImg[\s\S]*?<\/gapImg>/g,
        _identifierRegex: /identifier="([\s\S]*?)"/,
        _matchMaxRegex: /matchMax="([\s\S]*?)"/,
        _dataRegex: /data="([\s\S]*?)"/,
        _typeRegex: /type="([\s\S]*?)"/,
        _widthRegex: /width="(\d+)"/,
        _heightRegex: /height="(\d+)"/,
        _associableHotspotRegex: /<associableHotspot[\s\S]*?><\/associableHotspot>/g,
        _shapeRegex: /shape="([\s\S]*?)"/,
        _coordsRegex: /coords="([\s\S]*?)"/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._graphicGapMatchInteractionRegex, function (modelXml) {
                var graphicGapMatchInteractionAttr = _utils.getValue(modelXml, that._graphicGapMatchInteractionAttrRegex);
                var modelId = _utils.getValue(graphicGapMatchInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var modelType = 'graphicGapMatchInteraction';
                    var questionType = _utils.getValue(graphicGapMatchInteractionAttr, that._questionTypeRegex);
                    var style = _utils.getValue(graphicGapMatchInteractionAttr, that._styleRegex);
                    var prompt = _utils.getValue(modelXml, that._promptRegex);
                    var object = {};
                    var objectXml = _utils.getValue(modelXml, that._objectRegex);
                    object.data = _utils.getValue(objectXml, that._dataRegex);
                    object.type = _utils.getValue(objectXml, that._typeRegex);
                    object.width = _utils.getIntValue(objectXml, that._widthRegex);
                    object.height = _utils.getIntValue(objectXml, that._heightRegex);
                    object.param = [];
                    var paramXmlArr = objectXml.match(that._paramRegex);
                    if (paramXmlArr) {
                        var paramXml;
                        var param;
                        for (var index = 0; index < paramXmlArr.length; index++) {
                            paramXml = paramXmlArr[index];
                            param = {};
                            param.name = _utils.getValue(paramXml, that._nameRegex);
                            param.value = _utils.getValue(paramXml, that._valueRegex);
                            param.valueType = _utils.getValue(paramXml, that._valueTypeRegex);
                            object.param.push(param);
                        }
                    }
                    var gapImg = [];
                    var gapImgXmlArr = modelXml.match(that._gapImgRegex);
                    if (gapImgXmlArr) {
                        var gapImgXml;
                        var gapImgObj;
                        for (var index = 0; index < gapImgXmlArr.length; index++) {
                            gapImgXml = gapImgXmlArr[index];
                            gapImgObj = {};
                            gapImgObj.identifier = _utils.getValue(gapImgXml, that._identifierRegex);
                            gapImgObj.matchMax = _utils.getValue(gapImgXml, that._matchMaxRegex);
                            gapImgObj.data = _utils.getValue(gapImgXml, that._dataRegex);
                            gapImgObj.type = _utils.getValue(gapImgXml, that._typeRegex);
                            gapImgObj.width = _utils.getIntValue(gapImgXml, that._widthRegex);
                            gapImgObj.height = _utils.getIntValue(gapImgXml, that._heightRegex);
                            gapImg.push(gapImgObj);
                        }
                    }
                    var associableHotspot = [];
                    var associableHotspotXmlArr = modelXml.match(that._associableHotspotRegex);
                    if (associableHotspotXmlArr) {
                        var associableHotspotXml;
                        var associableHotspotObj;
                        for (var index = 0; index < associableHotspotXmlArr.length; index++) {
                            associableHotspotXml = associableHotspotXmlArr[index];
                            associableHotspotObj = {};
                            associableHotspotObj.identifier = _utils.getValue(associableHotspotXml, that._identifierRegex);
                            associableHotspotObj.matchMax = _utils.getValue(associableHotspotXml, that._matchMaxRegex);
                            associableHotspotObj.shape = _utils.getValue(associableHotspotXml, that._shapeRegex);
                            associableHotspotObj.coords = _utils.getValue(associableHotspotXml, that._coordsRegex);
                            associableHotspot.push(associableHotspotObj);
                        }
                    }
                    var model = {
                        modelId: modelId,
                        modelType: modelType,
                        questionType: questionType,
                        style: style,
                        prompt: prompt,
                        object: object,
                        gapImg: gapImg,
                        associableHotspot: associableHotspot
                    };
                    itemModel.modelMap[modelId] = model;
                }
                return '<div class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></div>';
            });
            return result;
        }
    };

    return graphicGapMatchInteraction;

});

// qti model
define('model/xml/inlineChoiceInteraction', ['model/utils'], function (_utils) {

    var inlineChoiceInteraction = {
        _inlineChoiceInteractionRegex: /<inlineChoiceInteraction[^/]*?>[\s\S]*?<\/inlineChoiceInteraction>/g,
        _inlineChoiceInteractionAttrRegex: /<inlineChoiceInteraction([\s\S]*?)>/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _shuffleRegex: /shuffle="([\s\S]*?)"/,
        _inlineChoiceRegex: /<inlineChoice [\s\S]*?<\/inlineChoice>/g,
        _inlineChoiceValueRegex: /<inlineChoice [\s\S]*?>([\s\S]*?)<\/inlineChoice>/,
        _identifierRegex: /identifier="([\s\S]*?)"/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._inlineChoiceInteractionRegex, function (modelXml) {
                var inlineChoiceInteractionAttr = _utils.getValue(modelXml, that._inlineChoiceInteractionAttrRegex);
                var modelId = _utils.getValue(inlineChoiceInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var modelType = 'inlineChoiceInteraction';
                    var questionType = _utils.getValue(inlineChoiceInteractionAttr, that._questionTypeRegex);
                    var style = _utils.getValue(inlineChoiceInteractionAttr, that._styleRegex);
                    var shuffle = _utils.stringToBoolean(_utils.getValue(inlineChoiceInteractionAttr, that._shuffleRegex));
                    var inlineChoice = [];
                    var inlineChoiceXmlArr = modelXml.match(that._inlineChoiceRegex);
                    if (inlineChoiceXmlArr) {
                        var inlineChoiceXml;
                        var identifier;
                        var content;
                        for (var index = 0; index < inlineChoiceXmlArr.length; index++) {
                            inlineChoiceXml = inlineChoiceXmlArr[index];
                            identifier = _utils.getValue(inlineChoiceXml, that._identifierRegex);
                            content = _utils.getValue(inlineChoiceXml, that._inlineChoiceValueRegex);
                            inlineChoice.push({
                                identifier: identifier,
                                content: content
                            });
                        }
                    }
                    var model = {
                        modelId: modelId,
                        modelType: modelType,
                        questionType: questionType,
                        shuffle: shuffle,
                        style: style,
                        inlineChoice: inlineChoice
                    };
                    itemModel.modelMap[modelId] = model;
                }
                return '<span class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></span>';
            });
            return result;
        }
    };

    return inlineChoiceInteraction;

});

// qti model
define('model/xml/matchInteraction', ['model/utils'], function (_utils) {

    var matchInteraction = {
        _matchInteractionRegex: /<matchInteraction[^/]*?>[\s\S]*?<\/matchInteraction>/g,
        _matchInteractionAttrRegex: /<matchInteraction([\s\S]*?)>/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _shuffleRegex: /shuffle="([\s\S]*?)"/,
        _maxAssociationsRegex: /maxAssociations="(\d+)"/,
        _minAssociationsRegex: /minAssociations="(\d+)"/,
        _promptRegex: /<prompt>([\s\S]*?)<\/prompt>/,
        _simpleMatchSetRegex: /<simpleMatchSet[\s\S]*?<\/simpleMatchSet>/g,
        _simpleMatchSetValueRegex: /<simpleMatchSet[\s\S]*?>([\s\S]*?)<\/simpleMatchSet>/,
        _simpleAssociableChoiceRegex: /<simpleAssociableChoice[\s\S]*?<\/simpleAssociableChoice>/g,
        _simpleAssociableChoiceValueRegex: /<simpleAssociableChoice[\s\S]*?>([\s\S]*?)<\/simpleAssociableChoice>/,
        _identifierRegex: /identifier="([\s\S]*?)"/,
        _fixedRegex: /fixed="([\s\S]*?)"/,
        _matchMaxRegex: /matchMax="(\d+)"/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._matchInteractionRegex, function (modelXml) {
                var matchInteractionAttr = _utils.getValue(modelXml, that._matchInteractionAttrRegex);
                var modelId = _utils.getValue(matchInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var modelType = 'matchInteraction';
                    var questionType = _utils.getValue(matchInteractionAttr, that._questionTypeRegex);
                    var style = _utils.getValue(matchInteractionAttr, that._styleRegex);
                    var shuffle = _utils.stringToBoolean(_utils.getValue(matchInteractionAttr, that._shuffleRegex));
                    var maxAssociations = _utils.getIntValue(matchInteractionAttr, that._maxAssociationsRegex);
                    var minAssociations = _utils.getIntValue(matchInteractionAttr, that._minAssociationsRegex);
                    var prompt = _utils.getValue(modelXml, that._promptRegex);
                    var simpleMatchSetXmlArr = modelXml.match(that._simpleMatchSetRegex);
                    var simpleMatchSetXml;
                    var simpleMatchSet = [];
                    var simpleAssociableChoiceXmlArr;
                    var simpleAssociableChoiceXml;
                    var simpleAssociableChoice;
                    var identifier;
                    var fixed;
                    var content;
                    var matchMax;
                    if (simpleMatchSetXmlArr) {
                        for (var index = 0; index < simpleMatchSetXmlArr.length; index++) {
                            simpleMatchSetXml = simpleMatchSetXmlArr[index];
                            simpleAssociableChoiceXmlArr = simpleMatchSetXml.match(that._simpleAssociableChoiceRegex);
                            if (simpleAssociableChoiceXmlArr) {
                                simpleAssociableChoice = [];
                                for (var cIndex = 0; cIndex < simpleAssociableChoiceXmlArr.length; cIndex++) {
                                    simpleAssociableChoiceXml = simpleAssociableChoiceXmlArr[cIndex];
                                    identifier = _utils.getValue(simpleAssociableChoiceXml, that._identifierRegex);
                                    fixed = _utils.stringToBoolean(_utils.getValue(simpleAssociableChoiceXml, that._fixedRegex));
                                    matchMax = _utils.getIntValue(simpleAssociableChoiceXml, that._matchMaxRegex);
                                    content = _utils.getValue(simpleAssociableChoiceXml, that._simpleAssociableChoiceValueRegex);
                                    simpleAssociableChoice.push({
                                        identifier: identifier,
                                        fixed: fixed,
                                        matchMax: matchMax,
                                        content: content
                                    });
                                }
                                simpleMatchSet.push(simpleAssociableChoice);
                            }
                        }
                    }
                    var model = {
                        modelId: modelId,
                        modelType: modelType,
                        questionType: questionType,
                        style: style,
                        prompt: prompt,
                        shuffle: shuffle,
                        maxAssociations: maxAssociations,
                        minAssociations: minAssociations,
                        simpleMatchSet: simpleMatchSet
                    };
                    itemModel.modelMap[modelId] = model;
                }
                return '<div class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></div>';
            });
            return result;
        }
    };

    return matchInteraction;

});

// qti model
define('model/xml/orderInteraction', ['model/utils'], function (_utils) {

    var orderInteraction = {
        _orderInteractionRegex: /<orderInteraction[^/]*?>[\s\S]*?<\/orderInteraction>/g,
        _orderInteractionAttrRegex: /<orderInteraction([\s\S]*?)>/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _shuffleRegex: /shuffle="([\s\S]*?)"/,
        _maxChoicesRegex: /maxChoices="(\d+)"/,
        _minChoicesRegex: /minChoices="(\d+)"/,
        _promptRegex: /<prompt>([\s\S]*?)<\/prompt>/,
        _simpleChoiceRegex: /<simpleChoice[\s\S]*?<\/simpleChoice>/g,
        _simpleChoiceValueRegex: /<simpleChoice[\s\S]*?>([\s\S]*?)<\/simpleChoice>/,
        _identifierRegex: /identifier="([\s\S]*?)"/,
        _fixedRegex: /fixed="([\s\S]*?)"/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._orderInteractionRegex, function (modelXml) {
                var orderInteractionAttr = _utils.getValue(modelXml, that._orderInteractionAttrRegex);
                var modelId = _utils.getValue(orderInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var modelType = 'orderInteraction';
                    var questionType = _utils.getValue(orderInteractionAttr, that._questionTypeRegex);
                    var shuffle = _utils.stringToBoolean(_utils.getValue(orderInteractionAttr, that._shuffleRegex));
                    var style = _utils.getValue(orderInteractionAttr, that._styleRegex);
                    var maxChoices = _utils.getIntValue(orderInteractionAttr, that._maxChoicesRegex);
                    var minChoices = _utils.getIntValue(orderInteractionAttr, that._minChoicesRegex);
                    var prompt = _utils.getValue(modelXml, that._promptRegex);
                    var simpleChoiceXmlArr = modelXml.match(that._simpleChoiceRegex);
                    var simpleChoice = [];
                    var simpleChoiceXml;
                    var identifier;
                    var fixed;
                    var content;
                    if (simpleChoiceXmlArr) {
                        for (var index = 0; index < simpleChoiceXmlArr.length; index++) {
                            simpleChoiceXml = simpleChoiceXmlArr[index];
                            identifier = _utils.getValue(simpleChoiceXml, that._identifierRegex);
                            fixed = _utils.stringToBoolean(_utils.getValue(simpleChoiceXml, that._fixedRegex));
                            content = _utils.getValue(simpleChoiceXml, that._simpleChoiceValueRegex);
                            simpleChoice.push({
                                identifier: identifier,
                                fixed: fixed,
                                content: content
                            });
                        }
                    }
                    var model = {
                        modelId: modelId,
                        modelType: modelType,
                        questionType: questionType,
                        style: style,
                        prompt: prompt,
                        shuffle: shuffle,
                        maxChoices: maxChoices,
                        minChoices: minChoices,
                        simpleChoice: simpleChoice
                    };
                    itemModel.modelMap[modelId] = model;
                }
                return '<div class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></div>';
            });
            return result;
        }
    };

    return orderInteraction;

});

// qti model
define('model/xml/rubricBlock', ['model/utils'], function (_utils) {

    var rubricBlock = {
        _rubricBlockRegex: /<rubricBlock[^/]*?>[\s\S]*?<\/rubricBlock>/g,
        _idRegex: /id="([\s\S]*?)"/,
        _viewRegex: /view="([\s\S]*?)"/,
        _promptRegex: /<rubricBlock[\s\S]*?>([\s\S]*?)<\/rubricBlock>/,
        _subjectiveBaseAssetRegex: /<div[^<>]*?class="asset"[^<>]*?><\/div>/g,
        _subjectiveBaseAssetPosterRegex: /data-poster="([\s\S]*?)"/,
        _subjectiveBaseAssetSrcRegex: /data-src="([\s\S]*?)"/,
        _subjectiveBaseAssetTypeRegex: /data-type="([\s\S]*?)"/,
        _responseTextRegex: /<div class="response_text">([\s\S]*?)<\/div>\s*?<div class="subjectivebase_asset"/,
        _widthRegex: /width="([\s\S]+)"/,
        _heightRegex: /height="([\s\S]+)"/,
        parse: function (xml, itemModel) {
            //该模型为对应的问答题的参考答案
            var that = this;
            var result = '';
            result = xml.replace(that._rubricBlockRegex, function (modelXml) {
                var id = _utils.getValue(modelXml, that._idRegex);
                if (id) {
                    var prompt = _utils.getValue(modelXml, that._promptRegex);
                    var view = _utils.getValue(modelXml, that._viewRegex);
                    var rubricBlock;

                    var subjectiveBase = that._responseTextRegex.test(prompt);
                    if (subjectiveBase) {
                        var assets = [];
                        var text = '';

                        var assetsResult = prompt.match(that._subjectiveBaseAssetRegex);
                        if (assetsResult) {
                            for (var i = 0; i < assetsResult.length; i++) {
                                var asset = assetsResult[i];
                                assets.push({
                                    poster: _utils.getValue(asset, that._subjectiveBaseAssetPosterRegex),
                                    src: _utils.getValue(asset, that._subjectiveBaseAssetSrcRegex),
                                    type: _utils.getValue(asset, that._subjectiveBaseAssetTypeRegex),
                                    width: _utils.getIntValue(asset, that._widthRegex),
                                    height: _utils.getIntValue(asset, that._heightRegex)
                                });
                            }
                        }
                        text = _utils.getValue(prompt, that._responseTextRegex);

                        rubricBlock = {
                            view: view,
                            text: text,
                            asset: assets
                        }
                    } else {
                        rubricBlock = {
                            prompt: prompt,
                            view: view
                        };
                    }

                    itemModel.rubricBlockMap[id] = rubricBlock;
                }
                return '';
            });
            return result;
        }
    };

    return rubricBlock;

});

// qti model
define('model/xml/textEntryInteraction', ['model/utils'], function (_utils) {

    var textEntryInteraction = {
        _textEntryInteractionRegex: /<textEntryInteraction[\s\S]*?\/>/g,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _expectedLengthRegex: /expectedLength="(\d+)"/,
        _keyboardRegex: /keyboard="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        _widthRegex: /width="(\d+)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._textEntryInteractionRegex, function (modelXml) {
                var modelId = _utils.getValue(modelXml, that._responseIdentifierRegex);
                if (modelId) {
                    var modelType = 'textEntryInteraction';
                    var questionType = _utils.getValue(modelXml, that._questionTypeRegex);
                    var expectedLength = _utils.getIntValue(modelXml, that._expectedLengthRegex);
                    var style = _utils.getValue(modelXml, that._styleRegex);
                    var keyboard = _utils.getValue(modelXml, that._keyboardRegex);
                    var width = _utils.getIntValue(modelXml, that._widthRegex);
                    if (!keyboard) {
                        keyboard = 'text';
                    }
                    var model = {
                        modelId: modelId,
                        modelType: modelType,
                        questionType: questionType,
                        style: style,
                        expectedLength: expectedLength,
                        keyboard: keyboard,
                        width: width
                    };
                    itemModel.modelMap[modelId] = model;
                }
                return '<span class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></span>';
            });
            return result;
        }
    };

    return textEntryInteraction;

});

// qti model
define('model/xml/textEntryMultipleInteraction', ['model/utils'], function (_utils) {

    var textEntryMultipleInteraction = {
        _textEntryMultipleInteractionRegex: /<textEntryMultipleInteraction[^/]*?>[\s\S]*?<\/textEntryMultipleInteraction>/g,
        _textEntryMultipleInteractionAttrRegex: /<textEntryMultipleInteraction([\s\S]*?)>/,
        _responseIdentifierRegex: /responseIdentifier="([\s\S]*?)"/,
        _styleRegex: /style="([\s\S]*?)"/,
        _promptRegex: /<prompt>([\s\S]*?)<\/prompt>/,
        _questionTypeRegex: /questionType="([\s\S]*?)"/,
        parse: function (xml, itemModel) {
            var that = this;
            var result = '';
            result = xml.replace(that._textEntryMultipleInteractionRegex, function (modelXml) {
                var textEntryMultipleInteractionAttr = _utils.getValue(modelXml, that._textEntryMultipleInteractionAttrRegex);
                var modelId = _utils.getValue(textEntryMultipleInteractionAttr, that._responseIdentifierRegex);
                if (modelId) {
                    var modelType = 'textEntryMultipleInteraction';
                    var questionType = _utils.getValue(textEntryMultipleInteractionAttr, that._questionTypeRegex);
                    var prompt = _utils.getValue(modelXml, that._promptRegex);
                    var style = _utils.getValue(textEntryMultipleInteractionAttr, that._styleRegex);
                    var model = {
                        modelId: modelId,
                        modelType: modelType,
                        questionType: questionType,
                        prompt: prompt,
                        style: style
                    };
                    itemModel.modelMap[modelId] = model;
                }
                return '<div class="_qp-model" data-model-id="' + modelId + '" style="' + style + '"></div>';
            });
            return result;
        }
    };

    return textEntryMultipleInteraction;

});

// qti model
define('model/xml/xmlParser', ['model/logger', 'model/utils', 'model/event'], function (logger, utils,_event) {

    var _utils = utils;
    var choiceInteraction = require('model/xml/choiceInteraction');
    var correctAnswerParser = require('model/xml/correctAnswerParser');
    var drawingInteraction = require('model/xml/drawingInteraction');
    var extendedTextInteraction = require('model/xml/extendedTextInteraction');
    var feedbackParser = require('model/xml/feedbackParser');
    var gapMatchInteraction = require('model/xml/gapMatchInteraction');
    var graphicGapMatchInteraction = require('model/xml/graphicGapMatchInteraction');
    var inlineChoiceInteraction = require('model/xml/inlineChoiceInteraction');
    var matchInteraction = require('model/xml/matchInteraction');
    var orderInteraction = require('model/xml/orderInteraction');
    var rubricBlock = require('model/xml/rubricBlock');
    var textEntryInteraction = require('model/xml/textEntryInteraction');
    var textEntryMultipleInteraction = require('model/xml/textEntryMultipleInteraction');

    var _xml = {
        _event: _event,
        _logger: logger,
        _refPathRegex: /\$\{ref-path\}/g,
        _refBaseRegex: /\$\{ref-base\}/g,
        _mathLeftDecodeRegex: /&lt;latex( class="math-tex")?&gt;/g,
        _mathRightDecodeRegex: /&lt;\/latex&gt;/g,
        _mathRegex: /<latex( class="math-tex")?>[\s\S]*?<\/latex>/g,
        _imgFilterRegex: /<img([^<>]*?)><\/img>/g,
        _textEntryInteractionFilterRegex: /<textEntryInteraction([^<>]*?)><\/textEntryInteraction>/g,
        _modelFeedbackFilterRegex: /<modalFeedback([^<>]*?)\/>/g,
        _textEntryFilterRegex: /<textEntry([^<>]*?)><\/textEntry>/g,
        _paramFilterRegex: /<param([^<>]*?)\/>/g,
        _associableHotspotFilterRegex: /<associableHotspot([^<>]*?)\/>/g,
        _objectFilterRegex: /<object([^<>]*?)\/>/g,
        correctAnswerParser: correctAnswerParser,
        feedbackParser: feedbackParser,
        modelParser: {
            _itemBodyRegex: /<itemBody[\s\S]*?>([\s\S]*?)<\/itemBody>/,
            _parserMap: {
                textEntryInteraction: textEntryInteraction,
                inlineChoiceInteraction: inlineChoiceInteraction,
                textEntryMultipleInteraction: textEntryMultipleInteraction,
                choiceInteraction: choiceInteraction,
                orderInteraction: orderInteraction,
                matchInteraction: matchInteraction,
                graphicGapMatchInteraction: graphicGapMatchInteraction,
                gapMatchInteraction: gapMatchInteraction,
                extendedTextInteraction: extendedTextInteraction,
                rubricBlock: rubricBlock,
                drawingInteraction: drawingInteraction
            },
            parse: function (xml, itemModel) {
                var result = _utils.getValue(xml, this._itemBodyRegex);
                var parser;
                itemModel.rubricBlockMap = {};
                //解析所有模型
                for (var modelId in this._parserMap) {
                    parser = this._parserMap[modelId];
                    result = parser.parse(result, itemModel);
                }
                //将问答题的参考答案模型合并到问答题的模型
                var model;
                var rubricBlock;
                for (var modelId in itemModel.rubricBlockMap) {
                    model = itemModel.modelMap[modelId];
                    if (model) {
                        rubricBlock = itemModel.rubricBlockMap[modelId];
                        model.rubricBlock = rubricBlock;
                    }
                }
                delete itemModel.rubricBlockMap;
                return result;
            }
        }
    };

    _xml.parseXml = function (xmlText, option, url) {
        var that = this;
        var refPath = '';
        if (option && option.refPath) {
            refPath = option.refPath;
        }
        //替换refPath表达式
        xmlText = xmlText.replace(that._refPathRegex, refPath);
        xmlText = xmlText.replace(that._refBaseRegex, _utils.getBasePath(url));
        //图片标签转换
        xmlText = xmlText.replace(that._imgFilterRegex, function ($0, $1) {
            var result = '<img' + $1 + '/>';
            return result;
        });
        //填空题特殊标签转换
        xmlText = xmlText.replace(that._textEntryInteractionFilterRegex, function ($0, $1) {
            var result = '<textEntryInteraction' + $1 + '/>';
            return result;
        });
        xmlText = xmlText.replace(that._textEntryFilterRegex, function ($0, $1) {
            var result = '<textEntry' + $1 + '/>';
            return result;
        });
        //拼图题和手写作文题特殊标签转换
        xmlText = xmlText.replace(that._associableHotspotFilterRegex, function ($0, $1) {
            var result = '<associableHotspot' + $1 + '></associableHotspot>';
            return result;
        });
        xmlText = xmlText.replace(that._paramFilterRegex, function ($0, $1) {
            var result = '<param' + $1 + '></param>';
            return result;
        });
        xmlText = xmlText.replace(that._objectFilterRegex, function ($0, $1) {
            var result = '<object' + $1 + '></object>';
            return result;
        });
        //反馈空标签转换
        xmlText = xmlText.replace(that._modelFeedbackFilterRegex, function ($0, $1) {
            var result = '<modalFeedback' + $1 + '></modalFeedback>';
            return result;
        });
        //数学表达式标签解码
        xmlText = xmlText.replace(that._mathLeftDecodeRegex, '<latex class="math-tex">');
        xmlText = xmlText.replace(that._mathRightDecodeRegex, '</latex>');
        //判断是否含有数学公式
        var hasMath = false;
        if (xmlText.match(that._mathRegex)) {
            hasMath = true;
        }
        //将$xml解析成assessmentItemModel
        var assessmentItemModel = {
            hasMath: hasMath,
            prompt: '',
            correctAnswer: {},
            hintFeedback: {},
            answerFeedback: {},
            modelMap: {}
        };
        var filterXml = xmlText;
        //解析正确答案
        that.correctAnswerParser.parse(filterXml, assessmentItemModel);
        //解析Feedback
        that.feedbackParser.parse(filterXml, assessmentItemModel);
        //解析itemBody
        var prompt = that.modelParser.parse(filterXml, assessmentItemModel);
        //保存html模板
        assessmentItemModel.prompt = prompt;
        //针对填空题的正确答案数据中的&<>3个符号decode编码处理
        var model;
        var correctAnswer;
        var value;
        var decodeAndRegex = /&amp;/g;
        for (var mId in assessmentItemModel.modelMap) {
            model = assessmentItemModel.modelMap[mId];
            if (model.modelType === 'textEntryInteraction' || model.modelType === 'textEntryMultipleInteraction') {
                //编辑在保存正确的答案的字符串时，会对&<>这个3个符号做2次转义
                correctAnswer = assessmentItemModel.correctAnswer[mId];
                if (correctAnswer && correctAnswer.value.length > 0) {
                    for (var index = 0; index < correctAnswer.value.length; index++) {
                        value = correctAnswer.value[index];
                        //第一次针对&符号进行decode
                        value = value.replace(decodeAndRegex, '&');
                        //第二次针对&<>三个符号进行decode
                        value = _utils.xmlDecode(value);
                        correctAnswer.value[index] = value;
                    }
                }
            }
        }

        return assessmentItemModel;
    };

    _xml.parse = function (text, option, url) {
        var that = this;
        return that.parseXml(text, option, url);
    };

    return _xml;

});

define('player/assessment/assessmentItem', ['model/logger', 'player/utils/imageLoader', 'player/utils/extendUtils'], function (_logger, _imageLoader, _utils) {

    var ModelItem = require('player/model/modelItem');

    //定义AssessmentItem,负责题目的展示和数据存储
    var AssessmentItem = {
        _event: null,
        _media: null,
        _itemModel: null,
        _answer: null,
        _isComposite: false,//标识是否是复合题
        _sequenceNumber: null,// 题目的序号
        _stat: null, //外部传入的统计信息
        _modelItem: null,
        _score: 0,
        _supportType: ["choiceInteraction", "textEntryMultipleInteraction", "extendedTextInteraction"],
        _fullScoreMap: null,//由外部json传入初始化每道题型的满分值键值对
        _userScoreMap: null,//有外部json传入初始化每道题的用户得分值键值对
        _state: 'INCOMPLETE', //INCOMPLETE-未作答,FAILED-答题错误,PASSED-答题正确
        _logger: _logger,
        _titleExtras: null,//标题附加信息
        _answerExtras: null,//题目后面的附加信息
        _imageLoader: _imageLoader,
        _mediaClass: "_mediaMark",// elearning播放器渲染audio标签class
        _videoMinSize: {
            height: 300,
            width: 300
        },
        _audioMinSize: {
            height: 200,
            width: 200
        },
        _videoTagRegex: /<video(([\s\S])*?)<\/video>/g,
        _audioTagRegex: /<audio(([\s\S])*?)<\/audio>/g,
        _mediaSrcAttrRegex: /src="([^"]*)"/,
        _posterAttrRegex: /poster="([^"]*)"/,
        _heightAttrRegex: /height="([^"]*)"/,
        _widthAttrRegex: /width="([^"]*)"/,
        _modelRegex: /<(div|span) class="_qp-model"[\s\S]*?><\/(div|span)>/g,
        _modelIdRegex: /data-model-id="([\s\S]*?)"/,
        _modelNumRegex: /_(\d*?)-/,
        _modelHtmlRegex: /<[\s\S]*class="_qp-model"[\s\S]*?>([\s\S]*?)<\/[\s\S]*>/g,
        _modelLatexRegex: /<latex(?: class="math-tex")?>([\s\S]*?)<\/latex>/g,
        _modelIsWYSIWYG: /<div style=(["'])[^"']*?position:absolute;overflow:hidden[^"']*?\1 questionType="(data|textentry|handwrite)">/i,
        create: function (assessmentItemModel, event, media) {
            var instance = $.extend({}, this);
            instance._event = event;
            instance._score = 0;
            instance._state = 'INCOMPLETE';
            instance._answer = {};
            instance._stat = {};
            instance._titleExtras = {};
            //初始化答案附件
            instance._answerExtras = {};
            //初始化满分值键值对
            instance._fullScoreMap = {
                totalFullScore: 0//每道题的满分总分
            };
            //初始化用户得分值键值对
            instance._userScoreMap = {
                totalUserScore: 0//用户获得的总分
            };
            instance._modelItem = {};
            instance._itemModel = assessmentItemModel;
            instance._media = media;
            var model;
            var modelNum = 0;
            for (var modelId in instance._itemModel.modelMap) {
                model = instance._itemModel.modelMap[modelId];
                ++modelNum;
                //初始化答案
                instance._answer[modelId] = {
                    state: 'INCOMPLETE',
                    value: []
                };
                //初始化统计
                instance._stat[modelId] = {};
                //初始化标题附加信息
                instance._titleExtras[modelId] = {};
                //初始化题目后面的附加信息KeyMap
                instance._answerExtras[modelId] = {};
                //初始化每道题型的满分值
                instance._fullScoreMap[modelId] = model.full_score || 0;
                //初始化每道题的用户得分值
                instance._userScoreMap[modelId] = model.user_score || 0;
                //实例化modelItem
                var modelItem = ModelItem.create(instance, model, event);
                //保存到assessmentItem
                instance._modelItem[modelItem._model.modelId] = modelItem;
            }
            if (modelNum > 1) {
                instance._isComposite = true;
            }
            this._logger.debug("_assessmentTest:解析xml后得到的assessmentItem对象");
            this._logger.debug(instance);
            return instance;
        },
        //获取得分
        getScore: function () {
            return this._score;
        },
        //设置分数
        setScore: function (score) {
            this._score = score;
        },
        //获取答案
        getAnswer: function () {
            return $.extend(true, {}, this._answer);
        },
        //获取模型
        getItemModel: function () {
            return $.extend(true, {}, this._itemModel);
        },
        //设置答案
        setAnswer: function (answer) {
            var result = true;
            //构造空答案
            var newAnswer = {};
            for (var modelId in this._answer) {
                newAnswer[modelId] = {
                    state: 'INCOMPLETE',
                    value: []
                };
            }
            var modelAnswer;
            var state;
            for (var modelId in newAnswer) {
                modelAnswer = answer[modelId];
                if (modelAnswer && modelAnswer.value) {
                    state = modelAnswer.state;
                    if (!state) {
                        state = '';
                    }
                    newAnswer[modelId].state = state;
                    newAnswer[modelId].value.pushArray(modelAnswer.value);
                }
            }
            this._answer = newAnswer;
            //检测状态变化
            this._checkAnswer();
            return result;
        },
        //设置统计信息 {'RESPONSE_1-1': {'A': '5人','B': '10人'}};
        setStat: function (stat) {
            var result = true;
            //构造空答案
            var newStat = {};
            for (var modelId in this._stat) {
                newStat[modelId] = {};
            }
            for (var modelId in newStat) {
                newStat[modelId] = stat[modelId];
            }
            this._stat = newStat;
            return result;
        },
        //设置统计信息 {'Resopnse-1-1':{prefix:'',suffix:''}}
        setTitleExtras: function (extras) {
            var result = true;
            //构造空答案
            var titleExtras = {};
            for (var modelId in this._titleExtras) {
                titleExtras[modelId] = {};
            }
            titleExtras['composite'] = {};
            for (var modelId in titleExtras) {
                titleExtras[modelId] = extras[modelId];
            }
            this._titleExtras = titleExtras;
            return result;
        },
        //支持拍照上传图片到指定小题后面设置数据方法
        setExtrasAnswer: function ($view, extra, isAppended) {
            var result = true;
            var modelId = extra.modelId;
            var extraHtml = extra.extraHtml;
            for (var modelId in this._answerExtras) {
                this._answerExtras[modelId] = extraHtml;
            }
            var appendView = $(extraHtml);
            var appendToModelId = modelId;
            var cleanModelId = modelId;

            //清空原有的内容
            if (!isAppended) {
                this.cleanExtras($view, cleanModelId);
            }

            //渲染到小题后面
            this.appendToExtras($view, appendView, appendToModelId);

            return result;
        },
        //设置某道题的满分值
        setFullScore: function (retrieveData) {
            var modelId = retrieveData.modelId;
            var fullScore = retrieveData.fullScore || 0;
            if (this._fullScoreMap && this._fullScoreMap[modelId] !== undefined) {
                this._fullScoreMap[modelId] = fullScore;
                //重新计算总分值
                this._calTotalScore();
            }
        },
        //获取某道题的满分值
        getFullScore: function (modelId) {
            if (arguments.length == 0) {// 获取所有题目的满分值
                //重新计算总分值
                var totalScore = this._calTotalScore();
                return totalScore.totalFullScore;
            } else {// 获取某道题的满分值
                if (this._fullScoreMap && this._fullScoreMap[modelId] !== undefined) {
                    return this._fullScoreMap[modelId];
                }
            }
        },
        //设置某道题的用户得分值
        setUserScore: function (retrieveData) {
            var modelId = retrieveData.modelId;
            var userScore = retrieveData.userScore || 0;
            if (this._userScoreMap && this._userScoreMap[modelId] !== undefined) {
                this._userScoreMap[modelId] = userScore;
                //重新计算总分值
                this._calTotalScore();
            }
        },
        //获取某道题的用户得分值
        getUserScore: function (modelId) {
            if (arguments.length == 1) {// 获取用户某道题的得分
                if (this._userScoreMap && this._userScoreMap[modelId] !== undefined) {
                    return this._userScoreMap[modelId];
                }
            } else {// 获取用户所有题目的总分
                //重新计算总分值
                this._calTotalScore();
                return this._userScoreMap.totalUserScore;
            }
        },
        //计算qtiPlayer实例 用户获得的总分 以及 所有题目的满分值
        _calTotalScore: function () {
            var totalUserScore = 0;
            var totalFullScore = 0;
            for (var modelId in this._itemModel.modelMap) {
                var model = this._itemModel.modelMap[modelId];
                totalUserScore += parseFloat(model.user_score);
                totalFullScore += parseFloat(model.full_score);
            }
            return {
                totalUserScore: totalUserScore,
                totalFullScore: totalFullScore
            };
        },
        //获取js版结果模型
        getAnswerState: function () {
            var that = this;
            var result = {
                completionStatus: that._state,
                score: that._score,
                duration: 0,
                numAttempts: 0,
                responseVariable: []
            };
            var correctAnswer;
            var currentAnswer;
            var responseVariable;
            for (var modelId in that._answer) {
                correctAnswer = that._itemModel.correctAnswer[modelId];
                if (correctAnswer) {
                    currentAnswer = that._answer[modelId];
                    responseVariable = {
                        baseType: correctAnswer.baseType,
                        cardinality: correctAnswer.cardinality,
                        identifier: correctAnswer.identifier,
                        state: currentAnswer.state,
                        correctResponse: [],
                        candidateResponse: []
                    };
                    $(correctAnswer.value).each(function (i, v) {
                        responseVariable.correctResponse.push(v);
                    });
                    $(currentAnswer.value).each(function (i, v) {
                        responseVariable.candidateResponse.push(v);
                    });
                    result.responseVariable.push(responseVariable);
                } else {// 模型里无correctAnswer
                    if (result.completionStatus !== "INCOMPLETE") {
                        result.completionStatus = "FAILED";
                    }
                }
            }
            return result;
        },
        setAnswerState: function (answerState) {
            var result = false;
            var newAnswer = {};
            var responseVariable = answerState.responseVariable;
            if (responseVariable) {
                var answer;
                var currentAnswer;
                for (var index = 0; index < responseVariable.length; index++) {
                    currentAnswer = responseVariable[index];
                    answer = {
                        state: currentAnswer.state,
                        value: currentAnswer.candidateResponse
                    };
                    newAnswer[currentAnswer.identifier] = answer;
                }
                //保存答案
                result = this.setAnswer(newAnswer);
            }
            return result;
        },
        //qti标准
        getState: function () {
            var that = this;
            var state = ''
                + '<assessmentResult xmlns="http://edu.nd.com.cn/xsd/assessmentResult" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://edu.nd.com.cn/xsd/assessmentResult http://nd-schema.dev.web.nd/xsd/assessmentResult.xsd">'
                + '    <itemResult>'
                + '        <outcomeVariable identifier="completionStatus">'
                + '            <value>' + that._state + '</value>'
                + '        </outcomeVariable>'
                + '        <outcomeVariable identifier="SCORE">'
                + '            <value>' + that._score + '</value>'
                + '        </outcomeVariable>'
                + '        <responseVariable identifier="duration">'
                + '            <candidateResponse><value>0</value></candidateResponse>'
                + '        </responseVariable>'
                + '        <responseVariable identifier="numAttempts">'
                + '            <candidateResponse><value>0</value></candidateResponse>'
                + '        </responseVariable>';
            var correctAnswer;
            var currentAnswer;
            for (var modelId in that._answer) {
                correctAnswer = that._itemModel.correctAnswer[modelId];
                if (correctAnswer) {
                    currentAnswer = that._answer[modelId];
                    state += '<responseVariable baseType="' + correctAnswer.baseType
                        + '" cardinality="' + correctAnswer.cardinality
                        + '" identifier="' + correctAnswer.identifier
                        + '" state="' + currentAnswer.state
                        + '">'
                        + '<correctResponse>';
                    $(correctAnswer.value).each(function (i, v) {
                        v = _utils.xmlEncode(v);
                        state += '<value>' + v + '</value>';
                    });
                    state += '</correctResponse>'
                        + '<candidateResponse>';
                    $(currentAnswer.value).each(function (i, v) {
                        v = _utils.xmlEncode(v);
                        state += '<value>' + v + '</value>';
                    });
                    state += '</candidateResponse>'
                        + '</responseVariable>';
                }
            }
            state += '</itemResult>'
                + '</assessmentResult>';
            return state;
        },
        //qti标准
        _stateParser: {
            responseVariableRegex: /<responseVariable[^/]*?>[\s\S]*?<\/responseVariable>/g,
            identifierRegex: /identifier="([\s\S]*?)"/,
            baseTypeRegex: /baseType="([\s\S]*?)"/,
            cardinalityRegex: /cardinality="([\s\S]*?)"/,
            stateRegex: /state="([\s\S]*?)"/,
            candidateResponseRegex: /<candidateResponse[^/]*?>([\s\S]*?)<\/candidateResponse>/,
            valueRegex: /<value>([\s\S]*?)<\/value>/g
        },
        setState: function (state) {
            var result = true;
            var that = this;
            var responseVariableArray = state.match(that._stateParser.responseVariableRegex);
            var responseVariable;
            var baseType;
            var cardinality;
            var identifier;
            var candidateResponse;
            var state;
            var newAnswer = {};
            var modelAnawer;
            var value;
            for (var index = 0; index < responseVariableArray.length; index++) {
                responseVariable = responseVariableArray[index];
                baseType = _utils.getValue(responseVariable, that._stateParser.baseTypeRegex);
                cardinality = _utils.getValue(responseVariable, that._stateParser.cardinalityRegex);
                identifier = _utils.getValue(responseVariable, that._stateParser.identifierRegex);
                if (baseType !== '' && cardinality !== '' && identifier !== '') {
                    state = _utils.getValue(responseVariable, that._stateParser.stateRegex);
                    modelAnawer = {
                        state: state,
                        value: []
                    };
                    //该标签存储了题目信息
                    candidateResponse = _utils.getValue(responseVariable, that._stateParser.candidateResponseRegex);
                    if (candidateResponse !== '') {
                        candidateResponse.replace(that._stateParser.valueRegex, function ($0, $1) {
                            value = _utils.xmlDecode($1);
                            modelAnawer.value.push(value);
                            return $0;
                        });
                    }
                    newAnswer[identifier] = modelAnawer;
                }
            }
            //保存答案
            result = this.setAnswer(newAnswer);
            return result;
        },
        _checkAnswerValue: function (valueType, correctValue, currentValue) {
            //答案比对时，去除latex标签
            correctValue = correctValue.replace(this._modelLatexRegex, function ($1, $2) {
                return $2;
            });
            var result = false;
            if (valueType === 'multipleString') {
                //这一项可以有多个答案
                var valueArray = correctValue.split('|');
                for (var index = 0; index < valueArray.length; index++) {
                    if (valueArray[index].trim() == currentValue) {
                        result = true;
                        break;
                    }
                }
            } else {
                //这一项只有一个答案
                if (correctValue == currentValue) {
                    result = true;
                }
            }
            return result;
        },
        _checkTextAnswerValue: function (modelId, correctValue, currentValue) {
            //检查填空是否正确
            var correctAnswer = this._itemModel.correctAnswer[modelId];
            if (correctAnswer.value.length > 0) {
                return this._checkAnswerValue(correctAnswer.baseType, correctValue, currentValue);
            }
            return false;
        },
        _checkModelAnswer: function (modelId, reset) {
            //触发该方法，说明用户有操作过该题目
            var correctAnswer = this._itemModel.correctAnswer[modelId];
            var currentAnswer = this._answer[modelId];

            //重置答案
            if (reset) {
                currentAnswer.state = 'INCOMPLETE';
                this._score = 0;
                this._state = 'INCOMPLETE';
            } else if (correctAnswer && correctAnswer.value.length > 0) {
                //有正确答案
                if (currentAnswer.value.length > 0) {
                    //有正确答案,有用户答案
                    var modelResult = true;
                    if (currentAnswer.value.length !== correctAnswer.value.length) {
                        //用户答案的长度和正确答案的长度不一致，答题错误
                        modelResult = false;
                    } else {
                        if (correctAnswer.cardinality === 'single') {
                            //只有一个答案项
                            modelResult = this._checkAnswerValue(correctAnswer.baseType, correctAnswer.value[0], currentAnswer.value[0]);
                        } else {
                            //多个答案项
                            if (correctAnswer.cardinality === 'ordered') {
                                //顺序必须一致
                                for (var cIndex = 0; cIndex < correctAnswer.value.length; cIndex++) {
                                    modelResult = this._checkAnswerValue(correctAnswer.baseType, correctAnswer.value[cIndex], currentAnswer.value[cIndex]);
                                    if (modelResult === false) {
                                        //该位置上正确答案和用户答案不一致，答题错误
                                        break;
                                    }
                                }
                            } else {
                                //顺序可以不一致
                                var tempAnswer = [];
                                tempAnswer.pushArray(currentAnswer.value);
                                //继续判断答案，部分题型答案的顺序会和正确答案不一致，但是内容一致
                                var currentResult;
                                for (var cIndex = 0; cIndex < correctAnswer.value.length; cIndex++) {
                                    currentResult = false;
                                    var errorCount = 0;
                                    while (errorCount < tempAnswer.length) {
                                        var temp = tempAnswer.shift();
                                        currentResult = this._checkAnswerValue(correctAnswer.baseType, correctAnswer.value[cIndex], temp);
                                        if (currentResult) {
                                            break;
                                        } else {
                                            tempAnswer.push(temp);
                                            errorCount++;
                                        }
                                    }
                                    if (currentResult === false) {
                                        //该正确答案在用户答案中不存在，答题错误
                                        modelResult = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (modelResult) {
                        //该小题答题正确
                        currentAnswer.state = 'PASSED';
                        //触发检测复合题答题是否正确
                        this._checkAnswer();
                    } else {
                        //该小题答题错误
                        currentAnswer.state = 'FAILED';
                        this._score = 0;
                        this._state = 'FAILED';
                    }
                } else {
                    //有正确答案,但是没有用户答案,该小题答题错误，复合题答题错误
                    currentAnswer.state = 'FAILED';
                    this._score = 0;
                    this._state = 'FAILED';
                }
            } else {
                //没正确答案,该小题答题正确
                currentAnswer.state = 'FAILED';
                //触发检测复合题答题是否正确
                this._checkAnswer();
            }
        },
        _checkAnswer: function () {
            var currentAnswer;
            var isCorrect = true;
            var isIncomplete = true;
            for (var modelId in this._answer) {
                currentAnswer = this._answer[modelId];
                //如果没有小题state值(旧版结果模型没有),则重新计算小题状态值
                if (currentAnswer.state === '') {
                    this._checkModelAnswer(modelId);
                }
                if (currentAnswer.state !== 'PASSED') {
                    isCorrect = false;
                }
                if (currentAnswer.state !== 'INCOMPLETE') {
                    isIncomplete = false;
                }
            }
            if (isCorrect) {
                //答案全部正确
                this._score = 1;
                this._state = 'PASSED';
            } else {
                if (isIncomplete) {
                    //答案全部未作答
                    this._score = 0;
                    this._state = 'INCOMPLETE';
                } else {
                    this._score = 0;
                    this._state = 'FAILED';
                }
            }
        },
        _getTitleExtras: function (modelId) {
            return this._titleExtras[modelId] || {};
        },
        _getCompositeTitleExtras: function () {
            return this._titleExtras['composite'] || {};
        },
        createHintHtml: function (modelId, option) {
            var that = this;
            var hintHtml = '';
            var hintFeedback = that._itemModel.hintFeedback[modelId];
            if (hintFeedback && hintFeedback.showHide === 'show' && hintFeedback.content !== '') {
                var tipTxt = _utils.getLangText('prompt', option);
                var confirm = _utils.getLangText('confirm', option);
//                var confirmHtml = '<div class="qp-pop-btn-box">'
//                        + '    <a href="javascript:void(0)" class="qp-pop-btn">' + confirm + '</a>'
//                        + '</div>';

//                hintHtml = ''
//                        + '<div class="qp-question-hint">'
//                        + '    <a  href="javascript:void(0)" class="qp-question-hint-tip-enter" data-model-id="' + modelId + '">'
//                        + '      <span class="qp-question-hint-tip-enter-icon"></span><span class="qp-question-hint-tip-enter-text">' + tipTxt + '</span>'
//                        + '   </a>'
//                        + '   <div class="qp-question-hint-background"></div>'
//                        + '   <div class="qp-question-hint-tip-wrapper">'
//                        + '   <div class="qp-question-hint-tip" data-model-id="' + modelId + '">'
//                        + '       <div class="qp-question-hint-tip-ts">' + tipTxt + '</div>'
//                        + '       <div class="qp-question-hint-tip-close"></div>'
//                        + '       <div class="qp-question-hint-tip-text">'
//                        + hintFeedback.content
//                        + '       </div>'
//                        + confirmHtml
//                        + '   </div>'
//                        + '   </div>'
//                        + '</div>';
                hintHtml = ''
                    + '<div class="nqti-com-pop-content nqti-hide-dom _hint-pop-content" data-model-id="' + modelId + '">'
                    + '    <div class="nqti-com-pop-box com-pop-hint-box _hint-pop-content-box">'
                    + '        <p class="nqti-com-pop-hd">'
                    + '            <span class="nqti-pop-dec nqti-dec-1"></span>'
                    + '            <span class="nqti-pop-dec nqti-dec-2"></span>'
                    + '        </p>'
                    + '        <div class="nqti-com-pop-bd nqti-scrollbar-style-gray _hint-pop-bd">'
                    + '            <div class="nqti-com-remind-text">'
                    + '                <span class="nqti-text-size">' + hintFeedback.content + '</span>'
                    + '            </div>'
                    + '        </div>'
                    + '        <div class="nqti-com-pop-bt">'
                    + '            <a class="nqti-hint-btn _hint-confirm-btn" href="javascript:;">'
                    + '                <span class="nqti-tip-icon-text">' + confirm + '</span>'
                    + '            </a>'
                    + '        </div>'
                    + '    </div>'
                    + '</div>'
                    + '<a class="nqti-hint-btn _hint-pop-btn " href="javascript:;" data-model-id="' + modelId + '">'
                    + '    <span class="nqti-tip-icon"></span>'
                    + '    <span class="nqti-tip-icon-text">' + tipTxt + '</span>'
                    + '</a>';
            }
            return hintHtml;
        },
        hintEventHandle: function ($view) {
            //提示按钮
            var $hintEnter = $view.find('._hint-pop-btn');
            //提示弹出框
            var $hintTipWrapper = $view.find('._hint-pop-content');
            if ($hintEnter && $hintEnter.length > 0 && $hintTipWrapper && $hintTipWrapper.length > 0) {
                var $hintText = $view.find('._hint-pop-bd');
                var $hintCloseBtn = $view.find('._hint-confirm-btn');
                //阻止提示框的滚动事件冒泡
                if ($hintTipWrapper.qpStopMouseWheel) {
                    $hintTipWrapper.qpStopMouseWheel();
                }
                //实现滚动条滚动事件
                $hintText.bind('qpMouseWheel', function (event) {
                    var dy = event.deltaY * 1.5;
                    event.currentTarget.scrollTop = event.currentTarget.scrollTop + dy;
                });
                //关闭提示窗口方法
                var closeHintTip = function () {
                    //隐藏遮罩和提示内容
                    $hintTipWrapper.addClass('nqti-hide-dom');
                };
                //提示按钮点击事件
                $hintEnter.bind('qpTap', function () {
                    //显示遮罩和提示内容
                    $hintTipWrapper.removeClass('nqti-hide-dom');
                    //重置提示高度，最高不超过window高度-150
                    var tipHeight = parseInt($hintText.css('maxHeight'));
                    var tipWinHeight = parseInt($hintTipWrapper.height());
                    var windowHeight = $(window).height();
                    if (!isNaN(windowHeight) && windowHeight > 0 && windowHeight - tipWinHeight < 80) {
                        if (!isNaN(tipHeight)) {
                            if (windowHeight - tipWinHeight < 0) {
                                $hintText.css('maxHeight', Math.abs(tipHeight - 80 + (windowHeight - tipWinHeight)) + 'px');
                            } else {
                                $hintText.css('maxHeight', Math.abs(tipHeight - 80) + 'px');
                            }
                        }
                    }
                    $hintTipWrapper.css('height', ($hintTipWrapper.height() + 1) + 'px');
                });
                //提示框上下空白背景点击事件
//                $hintBackground.bind('qpTap', closeHintTip);
//                $hintTip.bind('qpTap', function () {
//                    //为了向上传递事件触发对象
//                });
                //提示框左右空白背景点击事件
                $hintTipWrapper.bind('qpTap', function (e) {
                    var $target = $(e.target);
                    var $tip = $target.closest('._hint-pop-content-box');
                    if ($tip.length === 0) {
                        closeHintTip();
                    }
                });
                //关闭按钮事件
                $hintCloseBtn.bind('qpTap', closeHintTip);
            }
        },
        _setExtrasTitleHtml: function (titleHtml, titleExtras, modelName, option) {
            var prefix = '<span class="_qti-title-prefix">';
            //if (option.showTitleExtras) {
            if (typeof titleExtras.prefix != typeof undefined && titleExtras.prefix.length > 0) {
                prefix += titleExtras.prefix;
            }
            //}
            if (option.showQuestionName) {
                prefix += ' <span class="_qti-title-prefix-qtype">(' + modelName + ')</span>';
            }
            prefix += '</span>';

            var suffix = '';
            //if (option.showTitleExtras) {
            if (typeof titleExtras.suffix != typeof undefined && titleExtras.suffix.length > 0) {
                suffix = '<span class="_qti-title-suffix">' + titleExtras.suffix + '</span>';
            }
            //}


            titleHtml = titleHtml.trim();
            if (prefix !== '') {
                if (/^(<(div|p)(.*?)>(\s*?))+/.test(titleHtml)) {
                    titleHtml = titleHtml.replace(/^(<(div|p)(.*?)>(\s*?))+/, function ($0) {
                        return $0 + prefix;
                    });
                } else {
                    titleHtml = prefix + titleHtml;
                }
            }
            if (suffix !== '') {
                if (/(<\/(div|p)[^<>]*?>(\s*?))+$/.test(titleHtml)) {
                    titleHtml = titleHtml.replace(/(<\/(div|p)[^<>]*?>(\s*?))+$/, function ($0) {
                        return suffix + $0;
                    });
                } else {
                    titleHtml = titleHtml + suffix;
                }
            }
            return titleHtml;
        },
        createExtrasHtml: function (modelItem, modelId, extrasOption) {
            var that = this;
            var html = '';
            //var hintFeedback = that._itemModel.hintFeedback[modelId];
            //var answerFeedback = that._itemModel.answerFeedback[modelId];
            var hintFeedbackContent = that._itemModel.hintFeedback[modelId] ? that._itemModel.hintFeedback[modelId].content : '';
            var answerFeedbackContent = that._itemModel.answerFeedback[modelId] ? that._itemModel.answerFeedback[modelId].content : '';
            var userAnswerHtml = '';
            var correctAnswerHtml = '';
            if (modelItem.getModel().modelType === 'choiceInteraction') {
                userAnswerHtml = modelItem.getAnswer().join('');
                correctAnswerHtml = modelItem.getCorrectAnswer().join('');
            } else {
                userAnswerHtml = modelItem.getAnswer().join(',');
                correctAnswerHtml = modelItem.getCorrectAnswer().join(',');
            }
            var ar = [];
            ar.push('<div class="nqti-module-extras-default">');
            if (extrasOption.showUserAnswer || extrasOption.showCorrectAnswer) {
                var extrasUserAnswer = _utils.getLangText('extras_user_answer', this._option);
                var extrasCorrectAnswer = _utils.getLangText('extras_correct_answer', this._option);
                ar.push('    <div class="nqti-extras-answer"> ');
                if (extrasOption.showUserAnswer) {
                    var checked = this._answer[modelId].state === 'PASSED' ? 'nqti-correct' : 'nqti-wrong';
                    ar.push('        <span class="nqti-answer-user ' + checked + '">【' + extrasUserAnswer + '】' + userAnswerHtml + '</span> ');
                }
                if (extrasOption.showCorrectAnswer) {
                    ar.push('        <span class="nqti-answer-correct">【' + extrasCorrectAnswer + '】' + correctAnswerHtml + '</span>  ');
                }
                ar.push('    </div> ');
            }
            if (extrasOption.showHint) {
                ar.push('    <div class="nqti-extras-hint">  ');
                ar.push('        <span>【' + _utils.getLangText('prompt', this._option) + '】</span> ');
                ar.push('        <span>' + hintFeedbackContent + '</span>');
                ar.push('    </div>');
            }
            if (extrasOption.showAnalyse) {
                ar.push('    <div class="nqti-extras-analyse">');
                ar.push('        <span>【' + _utils.getLangText('analyse', this._option) + '】</span>');
                ar.push('        <span>' + answerFeedbackContent + '</span>');
                ar.push('    </div>');
            }
            ar.push('</div>');

            html = ar.join('');
            return html;
        },
        _parseHtml: function (html, option, $view) {
            var that = this;
            var isSupport = false;
            var result = html.replace(that._modelRegex, function (modelHtml) {
                var modelResult = '';
                var modelId = _utils.getValue(modelHtml, that._modelIdRegex);
                //没有指定渲染参数,或则渲染参数中包含该小题的modelId
                if (option.modelId.length === 0 || option.modelId.indexOf(modelId) > -1) {
                    //渲染该小题
                    var modelItem = that._modelItem[modelId];
                    var modelType = modelItem.getModel().modelType;
                    if (modelItem.init) {
                        modelItem.init(option);
                    }

                    // qtiPlayer是否做了该题型的兼容
                    isSupport = that._supportType.indexOf(modelType) !== -1;

                    var numHtml = '';// 题号
                    var answerHtml = '';// 答案
                    var titleHtml = '';// 标题
                    var hintHtml = '';// 提示
                    var extrasHtml = '';

                    // 是否渲染题号（这个是渲染单题型 和 复合题小题的 题号）
                    if (option.showNum && modelItem.hasNum()) {
                        var num;
                        if (option.isElearningSkin) {
                            //elearning皮肤需要对复合题大标题设置序号，所以导致单题型也需要对此做兼容处理
                            if (that._sequenceNumber === null) {// 原始的处理方式
                                num = "null";
                            } else {
                                if (!that._isComposite) {// 非复合题
                                    num = that._sequenceNumber;
                                } else {
                                    num = _utils.getValue(modelId, that._modelNumRegex);
                                }
                            }
                        } else {
                            // 互动课堂保持原有的处理逻辑
                            num = _utils.getValue(modelId, that._modelNumRegex);
                        }
                        numHtml = '<div class="nqti-module-listnum">'
                            + '<em class="nqti-listnum-text">' + num + '</em>'
                            + '<span class="nqti-listnum-dot">、</span>'
                            + '</div>';
                    }
                    //是否渲染标题
                    if (option.showTitleArea && modelItem.hasTitle()) {
                        titleHtml = modelItem.createTitleHtml(option);
                        if (titleHtml.trim() === '') {
                            titleHtml = '无题目信息';
                        }
                        //渲染附加内容
                        if (modelType !== 'textEntryInteraction') {
                            titleHtml = that._setExtrasTitleHtml(titleHtml, modelItem.getTitleExtras(), modelItem.getName(), option);
                        }
                        titleHtml = '<div class="nqti-module-title">'
                            + '<em class="nqti-title-text">' + titleHtml + '</em>'
                            + '</div>';
                    }

                    if (isSupport) {
                        //是否渲染答案
                        if (option.hideAnswerArea === false || modelItem.isBlock() === false) {
                            var tag = 'div';
                            if (modelItem.isBlock() === false) {
                                tag = 'span';
                            }
                            answerHtml = modelItem.createAnswerHtml(option);
                            answerHtml = '<' + tag + ' class="nqti-module-content">'
                                + answerHtml
                                + '</' + tag + '>';
                        }
                        //是否渲染提示
                        if (modelItem.hasHint()) {
                            hintHtml = that.createHintHtml(modelId, option);
                            hintHtml = '<div class="nqti-hint-box ' + (option.showHint ? '' : 'nqti-hide-dom') + '">'
                                + hintHtml
                                + '</div>';
                        }
                        if (modelType !== 'textEntryInteraction') {
                            extrasHtml = '<div class="nqti-module-extras _qti-module-extras"></div>';
                        }
                    }

                    //组合片段
                    var centerHtml;
                    if (titleHtml === '') {
                        if (!isSupport) {
                            titleHtml = '该题没有题目信息';
                            centerHtml = titleHtml + answerHtml + hintHtml;
                        } else {
                            centerHtml = answerHtml + hintHtml;
                        }
                    } else {
                        centerHtml = titleHtml + hintHtml + answerHtml;
                    }

                    centerHtml = centerHtml + extrasHtml;

                    centerHtml += isSupport ? "" : "<p style='color: #e02222;font-size: 18px;margin-top: 5px;text-align: left'>当前qtiPlayer不支持该题型</p>";

                    if (modelItem.hasNum()) {
                        //该题支持小题编号
                        modelResult += numHtml + centerHtml;
                    } else {
                        modelResult += centerHtml;
                    }
                    //解析内嵌题
                    modelResult = that._parseHtml(modelResult, option);
                    var modelHtmlArr = modelHtml.split('><');
                    modelResult = modelHtmlArr[0] + '>' + modelResult + '<' + modelHtmlArr[1];
                }
                return modelResult;
            });

            // 表明使用elearning媒体播放器
            if (option.swfHost && window.Video) {
                // 兼容elearing播放器替换video标签为div进行渲染
                result = result.replace(that._videoTagRegex, function (word) {
                    var videoSrc = word.match(that._mediaSrcAttrRegex);
                    var videoHeight = word.match(that._heightAttrRegex);
                    var videoWidth = word.match(that._widthAttrRegex);
                    var videoPoster = word.match(that._posterAttrRegex);

                    // 检测video src属性
                    if (videoSrc) {
                        videoSrc = videoSrc[1];
                        if (videoSrc === '') {
                            console.log('没有指定视频来源...');
                            //throw new Error('没有指定视频来源...');
                        }
                    } else {
                        videoSrc = '';
                        console.log('没有指定视频来源...');
                        //throw new Error('没有指定视频来源...');
                    }

                    // 检测video poster属性
                    if (videoPoster) {
                        videoPoster = videoPoster[1];
                    } else {
                        videoPoster = '';
                    }

                    // 检测video height属性
                    if (videoHeight) {
                        videoHeight = parseFloat(videoHeight[1]);
                        if (isNaN(videoHeight)) {
                            videoHeight = that._videoMinSize.height;
                        }
                    } else {
                        videoHeight = that._videoMinSize.height;
                    }
                    if (videoHeight < that._videoMinSize.height) {
                        videoHeight = that._videoMinSize.height;
                    }

                    // 检测video width属性
                    if (videoWidth) {
                        videoWidth = parseFloat(videoWidth[1]);
                        if (isNaN(videoWidth)) {
                            videoWidth = that._videoMinSize.width;
                        }
                    } else {
                        videoWidth = that._videoMinSize.width;
                    }
                    if (videoWidth < that._videoMinSize.width) {
                        videoWidth = that._videoMinSize.width;
                    }

                    return '<div poster_src="' + videoPoster + '" style="margin-bottom:5px;width:' + videoWidth + 'px;height:' + videoHeight + 'px;" media_src="' + videoSrc + '" class="' + that._mediaClass + '"></div>';
                });


                // 兼容elearning播放器替换audio标签为div进行渲染
                result = result.replace(that._audioTagRegex, function (word) {
                    var audioSrc = word.match(that._mediaSrcAttrRegex);
                    var audioHeight = word.match(that._heightAttrRegex);
                    var audioWidth = word.match(that._widthAttrRegex);
                    var audioPoster = word.match(that._posterAttrRegex);

                    // 检测audio src属性
                    if (audioSrc) {
                        audioSrc = audioSrc[1];
                        if (audioSrc === '') {
                            console.log('没有指定音频来源...');
                        }
                    } else {
                        // audio没有配置音频来源信息
                        audioSrc = '';
                        console.log('没有指定音频来源...');
                        //throw new Error('没有指定音频来源...');
                    }

                    // 检测audio poster属性
                    if (audioPoster) {
                        audioPoster = audioPoster[1];
                    } else {
                        audioPoster = '';
                    }

                    // 检测audio height属性
                    if (audioHeight) {
                        // 获取正则表达式的子表达式匹配文本信息
                        audioHeight = parseFloat(audioHeight[1]);
                        if (isNaN(audioHeight)) {
                            audioHeight = that._audioMinSize.height;
                        }
                    } else {
                        audioHeight = that._audioMinSize.height;
                    }
                    if (audioHeight < that._audioMinSize.height) {
                        audioHeight = that._audioMinSize.height;
                    }

                    // 检测audio width属性
                    if (audioWidth) {
                        audioWidth = parseFloat(audioWidth[1]);
                        if (isNaN(audioWidth)) {
                            audioWidth = that._audioMinSize.width;
                        }
                    } else {// json串无配置height属性,使用qtiPlayer的默认值
                        audioWidth = that._audioMinSize.width;
                    }
                    if (audioWidth < that._audioMinSize.width) {
                        audioWidth = that._audioMinSize.width;
                    }

                    return '<div poster_src="' + audioPoster + '" style="margin-bottom:5px;width:' + audioWidth + 'px;height:' + audioHeight + 'px;" media_src="' + audioSrc + '" class="' + that._mediaClass + '"></div>';
                });
            }

            return result;
        },
        _parseCompositeHtml: function (html, option) {
            var HTML = {
                compositeTitle: '<div class="nqti-composite-title _qti-composite-title">            ' +
                '    <div class="nqti-composite-title-content _qti-composite-title-content">' +
                '       <div class="nqti-composite-title-inside _qti-composite-title-inside">' +
                '            ${title}    ' +
                '       </div>                                    ' +
                '    </div>                                    ' +
                '    <div class="nqti-composite-title-bar">    ' +
                '        <div class="nqti-bar _qti-composite-bar">                ' +
                '            <div class="nqti-icon nqti-up"></div>     ' +
                '        </div>                                ' +
                '        <div class="nqti-line" ></div>        ' +
                '    </div>                                    ' +
                '</div>                                        ',
                compositeBody: ' <div class="nqti-composite-body _qti-composite-body">'
            };
            var regex = /^([\w\W]*?)<div class="_qp-model/;
            var title = '';
            var titleResult = regex.exec(html);
            if (titleResult && titleResult.length > 1) {
                title = titleResult[1];
            }
            title = this._setExtrasTitleHtml(title, this._getCompositeTitleExtras(), _utils.getLangText('complex', this._option), option);


            if (option.showCompositeSeparate) {
                title = _utils.template(HTML.compositeTitle, {title: title});
                title += HTML.compositeBody;
            }
            html = html.replace(titleResult[1], title) + '</div>';
            return html;
        },
        _compositeSeparateEventHandler: function ($view) {
            var $title = $view.find('._qti-composite-title');
            var $titleContent = $view.find('._qti-composite-title-content');
            var $titleInside = $view.find('._qti-composite-title-inside');
            var $separateBar = $view.find('._qti-composite-bar');
            var $compositeBody = $view.find('._qti-composite-body');
            //var bodyHeight = $(document.body).height();
            var titleInsideHeight = $titleInside.height();

            //var twoLineHeight = parseInt($titleContent.css('fontSize')) * parseInt($titleContent.css('lineHeight'));
            var lineHeight = parseInt($titleContent.css('lineHeight'));
            var fontSize = parseInt($titleContent.css('fontSize'));
            var twoLineHeight;
            if (lineHeight <= 1 || lineHeight < fontSize) {
                twoLineHeight = 2 * fontSize + 10;
            } else {
                twoLineHeight = 2 * lineHeight
            }

            if (isNaN(twoLineHeight)) {
                twoLineHeight = 30;
            }
            var paddingTop = parseInt($titleContent.css('paddingTop')) || 0;
            var paddingBottom = parseInt($titleContent.css('paddingBottom')) || 0;
            twoLineHeight = twoLineHeight + paddingTop + paddingBottom;

            var separate = function (toggle) {
                var barHeight = $separateBar.height();
                //var viewHeight = $view[0].clientHeight;
                var viewHeight = $view.height();
                //var viewHeight = $(window).height();
                viewHeight = viewHeight - barHeight;
                titleInsideHeight = $titleInside.height();
                titleInsideHeight = titleInsideHeight + paddingTop + paddingBottom;

                if (toggle) {
                    if (!$title.hasClass('nqti-down')) {
                        $title.addClass('nqti-down');
                        //题干小于两行直接显示题干高度
                        if (twoLineHeight < titleInsideHeight) {
                            $titleContent.css('height', twoLineHeight + 'px');
                        } else {
                            $titleContent.css('height', titleInsideHeight + 'px');
                        }
                    } else {
                        $title.removeClass('nqti-down');
                        //题干不超过窗口一半，直接显示题干高度
                        if (titleInsideHeight > viewHeight / 2) {
                            $titleContent.css('height', viewHeight / 2 + 'px');
                        } else {
                            $titleContent.css('height', titleInsideHeight + 'px');
                        }
                    }
                } else {
                    if ($title.hasClass('nqti-down')) {
                        if (twoLineHeight < titleInsideHeight) {
                            $titleContent.css('height', twoLineHeight + 'px');
                        } else {
                            $titleContent.css('height', titleInsideHeight + 'px');
                        }
                    } else {
                        if (titleInsideHeight > viewHeight / 2) {
                            $titleContent.css('height', (viewHeight / 2 ) + 'px');
                        } else {
                            $titleContent.css('height', titleInsideHeight + 'px');
                        }
                    }
                }
                $compositeBody.css('height', viewHeight + barHeight - $title.height() + 'px');
            };

            separate(false);

            $titleInside.resize(function () {
                separate(false);
            });


            $separateBar.on('qpTap', function () {
                separate(true);
            });
        },
        //render方法
        render: function ($view, option, callback) {
            var that = this;
            this._option = option;
            //设置渲染参数
            for (var modelId in that._modelItem) {
                model = that._modelItem[modelId];
                model.setOption(option);
            }

            //判断是否有数学公式
            var qpPlayerLatexLoadingClass = '';
            if (that._itemModel.hasMath && typeof MathJax !== 'undefined') {
                qpPlayerLatexLoadingClass = 'nqti-player-run-loading';
            }
            //是否显示小题序号
            var showNumClass = '';
            if (option.showNum) {
                showNumClass = 'nqti-module-show-num';
            }

            // 是否显示得分
            var showScoreClass = '';
            option.showScore = true;
            if (option.showScore) {
                showScoreClass = 'nqti-module-show-score';
            }

            //简单的复合题(只有顺序填空题或则文本选择题)增加尾部hint提示信息渲染
            var isSimpleModel = true;
            var isTextEntry = true;
            var firstModelId;
            //题目类型
            var qpModelName = '';
            var isComposite = 0;//是否复合题
            var model;
            var modelType;
            for (var modelId in that._modelItem) {
                if (!firstModelId) {
                    firstModelId = modelId;
                }
                model = that._modelItem[modelId];
                qpModelName = model.getName();
                if (model._model.modelType !== 'textEntryInteraction') {
                    isTextEntry = false;
                }
                if (model._model.modelType !== 'textEntryInteraction' && model._model.modelType !== 'inlineChoiceInteraction') {
                    isSimpleModel = false;
                    isComposite++;
                    if (modelType && modelType !== model._model.modelType) {
                        isComposite++;
                        qpModelName = '复合题';
                        break;
                    }

                    modelType = model._model.modelType;
                }
            }
            isComposite = isComposite > 1;
            var itemBodyHtml = that._itemModel.prompt;
            if (isComposite) {
                itemBodyHtml = that._parseCompositeHtml(that._itemModel.prompt, option)
            }
            if (isTextEntry) {
                itemBodyHtml = that._setExtrasTitleHtml(itemBodyHtml, that._modelItem[firstModelId].getTitleExtras(), that._modelItem[firstModelId].getName(), option);
            }
            //生成所有的model html片段
            var itemBodyHtml = that._parseHtml(itemBodyHtml, option, $view);

            //图片资源分析
            itemBodyHtml = that._imageLoader.parseImage($view, itemBodyHtml, option);

            if (isSimpleModel) {
                //简单的复合题，显示提示，取第一个提示信息
                var mId = '';
                for (var modelId in that._itemModel.hintFeedback) {
                    mId = modelId;
                    break;
                }
                if (mId !== '') {
                    var hintHtml = that.createHintHtml(mId, option);
                    itemBodyHtml += hintHtml;
                }
            }

            var matjaxLoading = _utils.getLangText('mathjax_loading', option);

            var bodyClass = ' ' + option.skin + ' ' + option.platForm;

            var showCompositeClass = 'nqti-show-composite-num';

            var isElearningSkin = option.isElearningSkin;

            if (isElearningSkin) {
                //elearning皮肤走新的流程
                // 是否渲染复合题大题号
                if (option.showNum && that._isComposite) {
                    var num;
                    if (that._sequenceNumber === null) {
                        num = '一';
                    } else {
                        num = that._sequenceNumber;
                    }
                    var numHtml = '<div class="nqti-composite-listnum">'
                        + '<em class="text">' + num + '</em>'
                        + '</div>';
                    itemBodyHtml = '<div class="nqti-composite-container">' + numHtml + itemBodyHtml + '</div>';
                }
            }

            //加载itemBodyHtml
            if (isElearningSkin) {
                //elearning皮肤走新的流程
                itemBodyHtml = ''
                    + '<div class="_qti-player ' + bodyClass + '">'
                    + '    <div class="_qti-player-body nqti-player-body nqti-scrollbar-style-gray ' + showCompositeClass + ' ' + showNumClass + '">'
                    + itemBodyHtml
                    + '        <div class="nqti-player-loading ' + qpPlayerLatexLoadingClass + '">'
                    + '            <em>' + matjaxLoading + '<span class="nqti-loading-dotting"></span></em>'
                    + '        </div>'
                    + '    </div>'
                    + '</div>';
            } else {
                // hdkt皮肤走原来流程
                itemBodyHtml = ''
                    + '<div class="_qti-player ' + bodyClass + '">'
                    + '    <div class="_qti-player-body nqti-player-body nqti-scrollbar-style-gray ' + showNumClass + '">'
                    + itemBodyHtml
                    + '        <div class="nqti-player-loading ' + qpPlayerLatexLoadingClass + '">'
                    + '            <em>' + matjaxLoading + '<span class="nqti-loading-dotting"></span></em>'
                    + '        </div>'
                    + '    </div>'
                    + '</div>';
            }

            $view.html(itemBodyHtml);
            //多媒体渲染
            if (option.showMedia) {
                that._media.render($view, option);
            } else {
                $view.find('audio,video').each(function () {
                    var $this = $(this);
                    var poster = $this.attr('poster');
                    if (poster) {
                        //有图片链接
                        $this.before('<img src="' + poster + '" alt=""/>');
                    }
                    $this.remove();
                });
            }
            //总体事件处理方法
            var $qpTextModule = $view.find('._qti-player-body');
            var $qpModel = $qpTextModule.find('._qp-model');
            $qpModel.each(function () {
                var $this = $(this);
                var modelId = $this.data('model-id');
                $this.addClass('nqti-module-body');

                // elearning皮肤 并且 需要显示题目序号
                if (isElearningSkin && option.showNum) {
                    $this.addClass('npti-show-onlymodule-num');
                }

                var modelItem = that._modelItem[modelId];
                var className = modelItem.getClassName(option);
                $this.addClass(className);
                //动态渲染
                if (modelItem.render) {
                    modelItem.render($this, option);
                }
            });

            var eventHandle = function () {
                //遍历所有的model,逐个处理事件
                $qpModel.each(function () {
                    var $this = $(this);
                    var modelId = $this.data('model-id');
                    var modelItem = that._modelItem[modelId];
                    //交互事件处理,如果锁定就不处理交互
                    //modelType为手写题、连线题、拼图题、表格题的继续使用旧的showLock控制方式
                    var model = modelItem.getModel();
                    modelItem.eventHandle($this, option);
                    //提示点击事件处理
                    that.hintEventHandle($this, option);
                    //渲染是否锁定
                    if (modelItem.renderLock) {
                        modelItem.renderLock($this);
                    }
                    //渲染答案
                    if (option.showAnswer) {
                        if (modelItem.renderAnswer) {
                            modelItem.renderAnswer($this);
                        }
                    } else if (option.showCheckedAnswer) {
                        if (modelItem.renderCheckedAnswer) {
                            modelItem.renderCheckedAnswer($this);
                        }
                    } else if (option.showCorrectAnswer) {
                        if (modelItem.renderCorrectAnswer) {
                            modelItem.renderCorrectAnswer($this);
                        }
                    } else if (option.showStatisAnswer) {
                        if (modelItem.renderStatisAnswer) {
                            modelItem.renderStatisAnswer($this);
                        }
                    }
                });
                //简单的复合题hint提示处理
                if (isSimpleModel) {
                    that.hintEventHandle($qpTextModule, option);
                }
                //图片点击事件处理
                $view.find('img').bind('qpTap', function () {
                    var $this = $(this);
                    var url = $this.data('src');
                    if (!url) {
                        url = $this.attr('src');
                    }
                    that._event.trigger('image', 'click', {
                        url: url
                    });
                });
                //图片加载
                that._imageLoader.load();

                that._compositeSeparateEventHandler($view);

                //是否锁定多媒体
                that._media.setLock(option.lockMedia, $view);

                //渲染完成回调
                if (callback) {
                    callback();
                }
            };
            //解析数据公式
            if (that._itemModel.hasMath && typeof MathJax !== 'undefined') {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
                MathJax.Hub.Queue(['End', function () {
                    //异步渲染异常处理
                    try {
                        eventHandle();
                    } catch (e) {
                        that._logger.error('异步渲染异常处理');
                        that._logger.error(e);
                    }
                    $qpTextModule.removeClass('nqti-player-run-loading');
                    //触发公式解析回调
                    that._event.trigger('latex', 'onEnded');
                    that._event.trigger('render', 'rendered', that._option);
                }]);
            } else {
                //处理事件
                eventHandle();
                //触发公式解析回调
                that._event.trigger('latex', 'onEnded');
                that._event.trigger('render', 'rendered', that._option);
            }
        },
        _modelEach: function ($view, callback) {
            var that = this;
            var $qpModel = $view.find('._qti-player-body ._qp-model');
            $qpModel.each(function () {
                var $this = $(this);
                var modelId = $this.data('model-id');
                var modelItem = that._modelItem[modelId];
                callback.apply(that, [$this, modelItem, modelId]);
            });
        },
        //锁定
        setLock: function ($view, lockArea) {
            this._modelEach($view, function ($modelView, modelItem) {
                if (modelItem.setLock) {
                    modelItem.setLock($modelView, lockArea);
                }
            });
            this._event.trigger('render', 'renderChanged', this._option);
        },
        showAnswer: function ($view) {
            this._modelEach($view, function ($modelView, modelItem) {
                if (modelItem.showAnswer) {
                    modelItem.showAnswer($modelView);
                }
            });
            this._event.trigger('render', 'renderChanged', this._option);
        },
        // 设置题目的序号
        setSequenceNumber: function (num) {
            this._sequenceNumber = num;
        },
        getSupportType: function () {
            return this._supportType;
        },
        showCheckedAnswer: function ($view) {
            this._modelEach($view, function ($modelView, modelItem) {
                if (modelItem.showCheckedAnswer) {
                    modelItem.showCheckedAnswer($modelView);
                }
            });
            this._event.trigger('render', 'renderChanged', this._option);
        },
        showUsrAndCorrectAnswer: function ($view) {
            this._modelEach($view, function ($modelView, modelItem) {
                var questionType = modelItem._model.questionType;
                var isSupportThisInterface = (questionType === "choice" || questionType === "multiplechoice");
                if (isSupportThisInterface) {
                    // 该接口只是多项选择 与 单项选择支持
                    if (modelItem.showUsrAndCorrectAnswer) {
                        modelItem.showUsrAndCorrectAnswer($modelView);
                    }
                } else {
                    console.warn("只有单项选择和多项选择才支持showUsrAndCorrectAnswer接口");
                }
            });
            this._event.trigger('render', 'renderChanged', this._option);
        },
        showCorrectAnswer: function ($view) {
            this._modelEach($view, function ($modelView, modelItem) {
                if (modelItem.showCorrectAnswer) {
                    modelItem.showCorrectAnswer($modelView);
                }
            });
            this._event.trigger('render', 'renderChanged', this._option);
        },
        showStatisAnswer: function ($view) {
            this._modelEach($view, function ($modelView, modelItem) {
                if (modelItem.showStatisAnswer) {
                    modelItem.showStatisAnswer($modelView);
                }
            });
            this._event.trigger('render', 'renderChanged', this._option);
        },
        reset: function ($view) {
            this._modelEach($view, function ($modelView, modelItem) {
                if (modelItem.reset) {
                    modelItem.reset($modelView);
                }
            });
            this._event.trigger('render', 'renderChanged', this._option);
        },
        showDefaultExtras: function ($view, extrasOption) {
            var that = this;
            this._modelEach($view, function ($modelView, modelItem, modelId) {
                var html = that.createExtrasHtml(modelItem, modelId, extrasOption);
                $modelView.find('._qti-module-extras').html(html);
                var newOption = $.extend(true, that._option, {img: {render: true}});
                that._media.render($modelView, newOption);
            });
            if (typeof  MathJax != typeof undefined) {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, $view[0]]);
            }
        },
        //在指定区域添加自定义内容
        appendToExtras: function ($view, appendView, appendToModelId) {
            var that = this;
            this._modelEach($view, function ($modelView, modelItem, modelId) {
                if (appendToModelId && typeof appendToModelId != typeof undefined) {
                    if (appendToModelId === modelId) {
                        $modelView.find('._qti-module-extras').append(appendView);
                        var newOption = $.extend(true, that._option, {img: {render: true}});
                        that._media.render($modelView, newOption);
                    }
                } else {
                    $modelView.find('._qti-module-extras').append(appendView);
                    that._media.render($modelView, that._option);
                }
            });
            if (typeof  MathJax != typeof undefined) {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, $view[0]]);
            }
        },
        //清空指定区域内容
        cleanExtras: function ($view, cleanModelId) {
            this._modelEach($view, function ($modelView, modelItem, modelId) {
                console.log(modelId);
                if (cleanModelId && cleanModelId != typeof undefined) {
                    if (cleanModelId === modelId) {
                        $modelView.find('._qti-module-extras').html('');
                    }
                }
            });
        },
        //destroy方法
        destroy: function () {
            var modelItem;
            for (var modelId in this._modelItem) {
                modelItem = this._modelItem[modelId];
                if (modelItem.destroy && $.type(modelItem.destroy) === 'function') {
                    modelItem.destroy();
                }
            }
            this._media.destroy();
        }
    };

    return AssessmentItem;
});

define('player/assessment/assessmentTest', ['model/logger', 'player/utils/extendUtils'], function (_logger, _utils) {

    var AssessmentItem = require('player/assessment/assessmentItem');

    //创建AssessmentTest
    //暂时,AssessmentTest中只有一个AssessmentItem
    var AssessmentTest = {
        _assessmentItem: null,
        _sequenceNumber: null,// 由于现在player和题目的对应关系是1对1的（复合题也算一道题目），该player对应的题目的序号
        _option: null,
        _event: null,
        _media: null,
        _logger: _logger,
        create: function (option, event, media) {
            var instance = $.extend({}, this);
            instance._event = event;
            instance._option = option;
            instance._media = media;
            instance._sequenceNumber = option.sequenceNumber || null;
            return instance;
        },
        //递归解析$itemBody对象
        loadAssessmentItem: function (assessmentItemModel) {
            this._assessmentItem = AssessmentItem.create(assessmentItemModel, this._event, this._media);
            if (this._sequenceNumber) {
                this._assessmentItem.setSequenceNumber(this._sequenceNumber)
            }
        },
        getAssessmentItem: function () {
            return this._assessmentItem;
        },
        render: function ($view, option, callback) {
            this._sequenceNumber = option.sequenceNumber || null;
            if (this._sequenceNumber) {
                this._assessmentItem.setSequenceNumber(this._sequenceNumber)
            }
            if (this._assessmentItem) {
                this._assessmentItem.render($view, option, callback);

            } else {
                this._logger.warn('_assessmentTest:render失败,请先加载数据');
            }
        }
    };
    return AssessmentTest;
});

/**
 * Created by ylf on 2015/5/28.
 */

define('player/cls/baseInteraction', function () {
    var Class = require('player/cls/class');
    var utils = require('player/utils/extendUtils');
    var lang = require('player/config/lang');

    var classUtilsObject = function () {
    };

    classUtilsObject.prototype.base = function () {
        var base = this.Type.Base;
        if (!base.Base) {
            base.apply(this, arguments);
        } else {
            this.base = MakeBase(base);
            base.apply(this, arguments);
            delete this.base;
        }

        function MakeBase(type) {
            var Base = type.Base;
            if (!Base.Base) return Base;
            return function () {
                this.base = MakeBase(Base);
                Base.apply(this, arguments);
            };
        }
    };

    var BaseInteraction = Class(classUtilsObject, (function () {
        var member = {
            //constructor
            Create: function (modelItem) {
                this.base();
                if (lang == null || lang == undefined) {
                    lang = {};
                }
                var model = modelItem.getModel();
                this.name = model.modelType;
                this.interactionId = utils.Rd.getRandom(this.name);

                this.modalItem = modelItem;
                this.modalModel = model;
            },
            setOption: function (option) {
                this.option = option;
            },
            /**
             * dom是否还存在
             * @returns {boolean}
             */
            isDomExist: function () {
                return $('[data-key="' + this.interactionId + '"]').length > 0;
            },
            getLangText: function (key, str) {
                return lang[key] != null && lang[key] != undefined ? lang[key] : str;
            },
            /**
             * 获取选项随机数组
             * @param len
             * @returns {Array}
             */
            getAnswerRandom: function (len, start) {
                return lang.Rd.getAnswerRandom((len - 1), start, this.option.randomSeed);
            },
            /**
             * 是否锁定
             * @returns {boolean|showLock|*|qtiplayer.showLock|_option.showLock|member.option.showLock}
             */
            isLock: function () {
                return this.option.showLock;
            },
            //common api end

            //modalItem api start
            getAnswer: function () {
                return this.modalItem.getAnswer();
            },
            getCorrectAnswer: function () {
                return this.modalItem.getCorrectAnswer();
            },
            setAnswer: function (arry) {
                return this.modalItem.setAnswer(arry);
            },
            getLogger: function () {
                return this.modalItem.getLogger();
            },
            /**
             * 是否随机排列
             * @returns {*}
             */
            getShuffle: function () {
                return !!this.modalItem.getModel().shuffle;
            }

            //modalItem api end
        };

        return member;
    })());
    return BaseInteraction;
});

/**
 * Created by ylf on 2015/5/28.
 */
define('player/cls/class', function () {

    var Class = function (baseClass, member) {

        function prototype_() {
        };
        prototype_.prototype = baseClass.prototype;
        var aPrototype = new prototype_();
        for (var m in member) {
            if (m != "Create") {
                aPrototype[m] = member[m];
            }
        }
        if (member.toString() != Object.prototype.toString()) {
            aPrototype.toString = member.toString;
        }
        if (member.toLocaleString() != Object.prototype.toLocaleString()) {
            aPrototype.toLocaleString = member.toLocaleString;
        }
        if (member.valueOf() != Object.prototype.valueOf()) {
            aPrototype.valueOf = member.valueOf;
        }

        var aType = null;
        if (member.Create) {
            aType = member.Create;
        } else {
            aType = function () {
                this.base.apply(this, [baseClass, member]);
            };
        }

        aType.prototype = aPrototype;
        aType.Base = baseClass;
        aType.prototype.Type = aType;
        return aType;
    };



    return Class;
});
define('player/config/extrasOption', function () {

    var ExtrasOption = {
        showHint: true,
        showUserAnswer: true,
        showCorrectAnswer: true,
        showAnalyse: true
    };


    return ExtrasOption;
});

define('player/config/lang', function () {

    var zh = {
        "mathjax_loading": "正在努力解析中...",
        "confirm": "确定",
        "prompt": "提示",
        "drawing_source_material": "素材",
        "drawing_stem": "题干",
        "drawing_view_material": "查看素材",
        "drawing_view_topics": "查看题目",
        "drawing_continue_write": "继续书写",
        "gapmath_title": "将以下选项进行归类",
        "inline_choice_choose": "请选择",
        "vote_sigleitem": "单项投票",
        "vote_mutipleitem": "不定项投票",
        "vote_tip_pre": "总共有",
        "vote_tip_end": "个投票项，投票时请注意查看，避免遗漏。",
        "choice_screenshot_title": "请选择正确的答案",
        "text_title": "请完成下面的填空",
        "extras_user_answer": "您的答案",
        "extras_correct_answer": "正确答案",
        "analyse": "解析",
        "single_choise": '单选题',
        "multiple_choise": '多选题',
        "blank_filling": '填空题',
        "connection": '连线题',
        "sort": '排序题',
        "question": '问答题',
        "voting": '投票题',
        "true_or_false": '判断题',
        "puzzle": '拼图题',
        "complex": '复合题'
    };

    var ja = {
        "mathjax_loading": "解析中...",
        "confirm": "OK",
        "prompt": "ヒント",
        "drawing_source_material": "素材",
        "drawing_stem": "問題テキスト",
        "drawing_view_material": "素材をみる",
        "drawing_view_topics": "問題をみる",
        "drawing_continue_write": "書き続ける",
        "gapmath_title": "以下の選択肢を分類してください",
        "inline_choice_choose": "ご選択を",
        "vote_sigleitem": "単一選択肢投票",
        "vote_mutipleitem": "複数選択肢投票",
        "vote_tip_pre": "合計",
        "vote_tip_end": "投票選択肢，投票の時に、見逃さないようにしてください。",
        "choice_screenshot_title": "正しい回答を選択してください",
        "text_title": "以下の穴埋めを完成してください",
        "extras_user_answer": "ご解答",
        "extras_correct_answer": "正解",
        "analyse": "解析",
        "single_choise": '単一選択問題',
        "multiple_choise": '複数選択問題',
        "blank_filling": '穴埋め問題',
        "connection": 'リンク問題',
        "sort": '並べ替え問題',
        "question": '記述問題',
        "voting": '投票問題',
        "true_or_false": '正誤問題',
        "puzzle": 'ジグソーパズル問題',
        "complex": '複合問題'
    }

    var lang = {
        'zh': zh,
        'ja': ja,
        'ja_jp': ja,
        'en': {
            "mathjax_loading": "Loading...",
            "confirm": "Confirm",
            "prompt": "Hints",
            "drawing_source_material": "Material",
            "drawing_stem": "Question Stem",
            "drawing_view_material": "查看素材",
            "drawing_view_topics": "查看题目",
            "drawing_continue_write": "继续书写",
            "gapmath_title": "将以下选项进行归类",
            "inline_choice_choose": "Please select",
            "vote_sigleitem": "Single Vote",
            "vote_mutipleitem": "Multiple Votes",
            "vote_tip_pre": "There is ",
            "vote_tip_end": " voting items, please check carefully to avoid the omission.",
            "choice_screenshot_title": "Please choose the correct answer",
            "text_title": "Please fill in the following blanks",
            "extras_correct_answer": "Correct Answer",
            "analyse": "Analysis",
            "single_choise": 'Single Choice',
            "multiple_choise": 'Multiple Choice',
            "blank_filling": 'Fill-in-the-blank ',
            "connection": 'Matching',
            "sort": 'Sorting Exercise',
            "question": 'Question',
            "voting": 'Voting',
            "true_or_false": 'True or False',
            "puzzle": 'Puzzle',
            "complex": 'Mixed Question Types'
        },
        'es_ec': {
            "mathjax_loading": "正在努力解析中...",
            "confirm": "Confirmar",
            "prompt": "Sugerencia",
            "drawing_source_material": "Materiales",
            "drawing_stem": "Tema",
            "drawing_view_material": "Consultar Materiales",
            "drawing_view_topics": "Consultar Ejercicios",
            "drawing_continue_write": "Sigue escribiendo",
            "gapmath_title": "Clasificar siguientes opciones",
            "inline_choice_choose": "请选择",
            "vote_sigleitem": "单项投票",
            "vote_mutipleitem": "不定项投票",
            "vote_tip_pre": "总共有",
            "vote_tip_end": "个投票项，投票时请注意查看，避免遗漏。",
            "choice_screenshot_title": "请选择正确的答案",
            "text_title": "请完成下面的填空",
            "extras_correct_answer": "正确答案",
            "analyse": "解析"
        }
    };

    return lang;
});

define('player/config/option', function () {

    var Option = {
        refPath: '',
        unifyTextEntry: false,//统一填空题结构
        lang: 'zh',
        skin: 'wood', //皮肤
        platForm: '', //接入平台
        showNum: false,
        screenshotLayout: false,
        showTitleArea: true,
        hideAnswerArea: false,
        showAnswerArea: true,
        showSubSequence: false,
        showHint: true,
        showStat: false, //显示统计信息
        showLock: false,//锁定作答区域
        showAnswer: false,
        showCheckedAnswer: false,
        showCorrectAnswer: false,
        showStatisAnswer: false,
        showMedia: true,
        lockMedia: false,//禁用多媒体
        modelId: [],
        randomSeed: [],
        event: true,
        expectWidth: 0,
        expectHeight: 0,
        thumbnailEnable: true,
        //showTitleExtras: false,//显示标题补充信息
        showQuestionName: false,//显示题目类型
        showCompositeSeparate: false,//显示复合题分割
        graphicGapMatchImageLoaderEnable:true
    };


    return Option;
});

define('player/config/platForm', function () {

    //接入平台
    var platForm = {
        pptshell: 'qp-player-pptshell',
        statis: 'qp-statis'//pc新统计模块
    };


    return platForm;
});

// qti model
define('player/config/skin', function () {

    var skin = {
        //木纹
        wood: 'nqti-player-skin-wood',
        elearning: 'nqti-player-skin-elearning'
    };

    return skin;
});

define('player/media/defaultMediaPlayer', function () {

    var _emptyFunc = function () {
    };

    var mediaPlayer = {
        _$medias: null,
        _eventHandler: null,
        create: function () {
            var instance = $.extend({}, this);
            instance._eventHandler = {
                play: _emptyFunc,
                pause: _emptyFunc,
                ended: _emptyFunc,
                timeupdate: _emptyFunc,
                seeked: _emptyFunc,
                volumeChange: _emptyFunc,
                fullScreenChange: _emptyFunc
            };
            instance._$medias = {};
            return instance;
        },
        render: function ($view, option) {
        },
        renderImg: function () {
            //TODO:
        },
        eventHandle: function ($view, option) {
            var that = this;
            //多媒体事件处理
            var mediaHandler = function (index) {
                var $media = $(this);
                var mediaType = $media[0].tagName;
                var mediaId = mediaType + '-' + index;
                //记录
                that._$medias[mediaId] = $media;
                //
                var mediaTarget = {
                    mediaId: mediaId,
                    index: index,
                    mediaType: mediaType
                };
                //绑定事件
                var eventTypes = ['play', 'pause', 'ended', 'timeupdate', 'seeked'];
                $(eventTypes).each(function (i, eventType) {
                    if (eventType === 'seeked') {
                        mediaTarget.seeked = $media[0].currentTime;
                    } else {
                        delete mediaTarget.seeked;
                    }
                    $media.bind(eventType, function () {
                        that._eventHandler[eventType](mediaTarget);
                    });
                });
            };
            $view.find('audio').each(mediaHandler);
            $view.find('video').each(mediaHandler);
        },
        mediaOnStart: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.play = callback;
            }
        },
        mediaOnPause: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.pause = callback;
            }
        },
        mediaOnEnded: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.ended = callback;
            }
        },
        mediaOnTimeupdate: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.timeupdate = callback;
            }
        },
        mediaOnVolumeChange: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.volumeChange = callback;
            }
        },
        mediaOnSeeked: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.seeked = callback;
            }
        },
        _getMedia: function (mediaType, index) {
            var mediaId = mediaType + '-' + index;
            var $media = this._$medias[mediaId];
            return $media;
        },
        mediaPlay: function (mediaType, index) {
            var $media = this._getMedia(mediaType, index);
            if ($media) {
                $media.trigger('play');
            }
        },
        mediaPause: function (mediaType, index) {
            var $media = this._getMedia(mediaType, index);
            if ($media) {
                $media.trigger('pause');
            }
        },
        mediaPauseAll: function (obj) {

        },
        mediaSkip: function (mediaType, index, seeked) {
            var $media = this._getMedia(mediaType, index);
            if ($media) {
                $media[0].currentTime = seeked;
                $media.trigger('pause');
            }
        },
        mediaVolumeChange: function (mediaType, index, volume, diaplay) {
            //TODO:
        },
        mediaOnFullScreenChange: function (callback) {
            //TODO:
        },
        destroy: function () {
            //TODO:
        },
        setLock:function(lock,view){
            //TODO:
        }
    };

    return mediaPlayer;
});

/**
 * Created by LinMingDao on 2016/9/1.
 * eLearning媒体播放器Adapter
 */
define('player/media/eLearningMediaPlayer', function () {

    if (!window.Video) {
        throw new Error("未加载elearning媒体播放器资源，请手动加载");
    }

    var _emptyFunc = function () {
    };

    // elearning 播放器 impl
    window.ELMediaPlayer = {
        _players: [],//
        _eventHandler: {
            play: _emptyFunc,
            pause: _emptyFunc,
            ended: _emptyFunc,
            timeupdate: _emptyFunc,
            seeked: _emptyFunc,
            volumeChange: _emptyFunc,
            fullScreenChange: _emptyFunc,
            fullScreen: _emptyFunc,
            fullScreenExit: _emptyFunc
        },
        _getMedia: function (mediaType, index) {
            var that = this;
            var mediaId = mediaType + '-' + index;
            for (var key in this._$medias) {
                if (that._getKeyMedia(key) === mediaId) {
                    var $media = this._$medias[key];
                    return $media;
                }
            }
            return null;
        },
        render: function ($view, option) {
            var that = this;
            that._players.length = 0;
            var $media = $view.find("._mediaMark");
            for (var i = 0; i < $media.length; ++i) {
                // 解析media资源url
                var mediaUrl = $($media[i]).attr("media_src");
                var config = {
                    video: {
                        swfHost: option.swfHost || "http://static.auxo.test.huayu.nd/auxo/addins/flowplayer/v1.0.0/",
                        url: mediaUrl,
                        autoPlay: false
                    }
                };
                var player = new window.Video.Player($media[i], config);
                // 注册回调事件
                player.addEventListener("onStart", function () {
                    console.log('onStart...');
                    // 暂停所有其他视频
                    for (var i = 0; i < that._players.length; ++i) {
                        if (this != that._players[i]) {
                            that._players[i].pause();
                        }
                    }
                    that._eventHandler.play();
                });
                player.addEventListener("onPause", function () {
                    console.log('onPause...');
                    that._eventHandler.pause();
                });
                player.addEventListener("onFullscreen", function () {
                    console.log('onFullscreen...');
                    that._eventHandler.fullScreenChange();
                    that._eventHandler.fullScreen();
                });
                player.addEventListener("onFullscreenExit", function () {
                    console.log('onFullscreenExit...');
                    that._eventHandler.fullScreenChange();
                    that._eventHandler.fullScreenExit();
                });
                player.addEventListener("onFinish", function () {
                    console.log('onFinish...');
                    that._eventHandler.ended();
                });
                player.addEventListener("onSeek", function () {
                    console.log('onSeek...');
                    that._eventHandler.seeked();
                });

                player.addEventListener("onResume", function () {
                    // 暂停所有其他视频
                    console.log('onResume');
                    for (var i = 0; i < that._players.length; ++i) {
                        if (this != that._players[i]) {
                            that._players[i].pause();
                        }
                    }
                });

                // 缓存播放器实例
                this._players.push(player);
            }
        },
        mediaOnStart: function (callback) {
            if (typeof callback === 'function') {
                this._eventHandler.play = callback;
            }
        },
        mediaOnPause: function (callback) {
            if (typeof callback === 'function') {
                this._eventHandler.pause = callback;
            }
        },
        mediaOnEnded: function (callback) {
            if (typeof callback === 'function') {
                this._eventHandler.ended = callback;
            }
        },
        mediaOnTimeupdate: function (callback) {
            if (typeof callback === 'function') {
                this._eventHandler.timeupdate = callback;
            }
        },
        mediaOnSeeked: function (callback) {
            if (typeof callback === 'function') {
                this._eventHandler.seeked = callback;
            }
        },
        mediaOnVolumeChange: function (callback) {
            if (typeof callback === 'function') {
                this._eventHandler.volumeChange = callback;
            }
        },
        getMedia: function () {
        },
        mediaPlay: function () {
            debugger;
            var that = this;
            for (var i = 0; i < that._players.length; ++i) {
                that._players[i].replay();
            }
        },
        mediaPause: function () {
            var that = this;
            for (var i = 0; i < that._players.length; ++i) {
                that._players[i].pause();
            }
        },
        mediaPauseAll: function () {
        },
        mediaSkip: function () {
        },
        mediaVolumeChange: function () {
        },
        mediaOnFullScreenChange: function (callback) {// ok
            if (typeof callback === 'function') {
                this._eventHandler.fullScreenChange = callback;
            }
        },
        mediaOnFullScreen: function (callback) {// ok
            if ($.type(callback) === 'function') {
                this._eventHandler.fullScreen = callback;
            }
        },
        mediaOnFullScreenExit: function (callback) {// ok
            if (typeof callback === 'function') {
                this._eventHandler.fullScreenExit = callback;
            }
        },
        destroy: function () {
            var that = this;
            this._fullChangeEvent.remove(this._eventHandler.fullScreenChange);
            for (var i = 0; i < that._players.length; ++i) {
                that._players[i].close();
            }
            that._players = null;
        }
    };

    var eMediaPlayer = {
        _mediaImpl: window.ELMediaPlayer,
        _eventHandler: null,
        _fullChangeEvent: {
            onFullScreenChange: [],
            trigger: function (isFull) {
                this.onFullScreenChange.forEach(function (callback) {
                    if (callback) {
                        callback(isFull);
                    }
                })
            },
            push: function (callback) {
                this.onFullScreenChange.push(callback);
            },
            remove: function (callback) {
                var len = this.onFullScreenChange.length;
                for (var i = 0; i < len; i++) {
                    if (callback === this.onFullScreenChange[i]) {
                        this.onFullScreenChange.splice(i, 1);
                        i--;
                        len--;
                    }
                }
            }
        },
        create: function () {
            var instance = $.extend({}, this);
            instance._eventHandler = {
                play: _emptyFunc,
                pause: _emptyFunc,
                ended: _emptyFunc,
                timeupdate: _emptyFunc,
                seeked: _emptyFunc,
                volumeChange: _emptyFunc,
                fullScreenChange: _emptyFunc
            };
            return instance;
        },
        render: function ($view, option) {
            option.onPlay = this._eventHandler.play;
            option.onPause = this._eventHandler.pause;
            option.onEnd = this._eventHandler.ended;
            option.onSeek = this._eventHandler.seeked;
            option.onVolumeChange = this._eventHandler.volumeChange;
            option.onTimeUpdate = this._eventHandler.timeupdate;
            option.onFullScreenChange = this._eventHandler.fullScreenChange;
            this._mediaImpl.render($view, option);
        },
        renderImg: function () {// eLearning无此接口，留空不实现
        },
        mediaOnStart: function (callback) {// ok
            if ($.type(callback) === 'function') {
                this._mediaImpl.mediaOnStart(callback);
            }
        },
        mediaOnPause: function (callback) {// ok
            if ($.type(callback) === 'function') {
                this._mediaImpl.mediaOnPause(callback);
            }
        },
        mediaOnEnded: function (callback) {// ok
            if ($.type(callback) === 'function') {
                //this._eventHandler.ended = callback;
                this._mediaImpl.mediaOnEnded(callback);
            }
        },
        mediaOnTimeupdate: function (callback) {// eLearning无该api
            if ($.type(callback) === 'function') {
                this._eventHandler.timeupdate = callback;
            }
        },
        mediaOnVolumeChange: function (callback) {// eLearning无该api
            if ($.type(callback) === 'function') {
                this._eventHandler.volumeChange = callback;
            }
        },
        mediaOnSeeked: function (callback) {// ok
            if ($.type(callback) === 'function') {
                this._mediaImpl.mediaOnSeeked(callback);
            }
        },
        mediaPlay: function () {// ok
            this._mediaImpl.mediaPlay();
        },
        mediaPause: function () {// ok
            this._mediaImpl.mediaPause();
        },
        mediaPauseAll: function () {// ok
            this._mediaImpl.mediaPauseAll();
        },
        mediaSkip: function () {// has
            this._mediaImpl.seek();
        },
        mediaVolumeChange: function () {// has
            this._mediaImpl.setVolume();
        },
        mediaOnFullScreenChange: function (callback) {// ok
            if ($.type(callback) === 'function') {
                this._mediaImpl.mediaOnFullScreenChange(callback);
                this._fullChangeEvent.push(this._eventHandler.fullScreenChange);
            }
        },
        mediaOnFullScreen: function (callback) {
            if ($.type(callback) === 'function') {
                this._mediaImpl.mediaOnFullScreen(callback);
            }
        },
        mediaOnFullScreenExit: function (callback) {
            if ($.type(callback) === 'function') {
                this._mediaImpl.mediaOnFullScreenExit(callback);
            }
        },
        destroy: function () {
            this._fullChangeEvent.remove(this._eventHandler.fullScreenChange);
            this._mediaImpl.destroy();
        },
        setLock: function () {
        }
    };

    return eMediaPlayer;
});
define('player/media/eMedia', function () {
    var eLearningMediaPlayer = require('player/media/eLearningMediaPlayer');
    var Media = require('player/media/mediaApi');

    //扩展media对象api
    var extendMedia = function (media) {
        var methods = [
            'create', 'render', 'renderImg', 'mediaOnStart', 'mediaOnPause',
            'mediaOnEnded', 'mediaOnTimeupdate', 'mediaOnSeeked', 'mediaOnVolumeChange',
            'mediaPlay', 'mediaPause', 'mediaSkip', 'mediaVolumeChange', 'mediaOnFullScreenChange', 'mediaPauseAll', 'setLock'
        ];
        var method;
        var isComplete = true;
        for (var index = 0; index < methods.length; index++) {
            method = methods[index];
            if (!media[method] || $.type(media[method]) !== 'function') {
                isComplete = false;
                break;
            }
        }
        if (isComplete) {
            $.extend(Media, media);
        } else {
            throw 'QtiPlayer.extendMedia输入错误,请确认输入的对象是否有实现所有的api';
        }
    };

    extendMedia(eLearningMediaPlayer);

    return Media;
});

define('player/media/lowVersionMediaPlayer', [], function () {

    var _emptyFunc = function () {
    };

    var mediaPlayer = {
        _fullChangeEvent: {
            onFullScreenChange: [],
            trigger: function (isFull) {
                this.onFullScreenChange.forEach(function (callback) {
                    if (callback) {
                        callback(isFull);
                    }
                })
            },
            push: function (callback) {
                this.onFullScreenChange.push(callback);
            },
            remove: function (callback) {
                var len = this.onFullScreenChange.length;
                for (var i = 0; i < len; i++) {
                    if (callback === this.onFullScreenChange[i]) {
                        this.onFullScreenChange.splice(i, 1);
                        i--;
                        len--;
                    }
                }
            }
        },
        _mediaImpl: window.NDMediaPlayer,
        _eventHandler: null,
        create: function () {
            var instance = $.extend({}, this);
            instance._eventHandler = {
                play: _emptyFunc,
                pause: _emptyFunc,
                ended: _emptyFunc,
                timeupdate: _emptyFunc,
                seeked: _emptyFunc,
                volumeChange: _emptyFunc,
                fullScreenChange: _emptyFunc
            };
            return instance;
        },
        render: function ($view, option) {
            option.onPlay = this._eventHandler.play;
            option.onPause = this._eventHandler.pause;
            option.onEnd = this._eventHandler.ended;
            option.onSeek = this._eventHandler.seeked;
            option.onVolumeChange = this._eventHandler.volumeChange;
            option.onTimeUpdate = this._eventHandler.timeupdate;
            option.onFullScreenChange = this._eventHandler.fullScreenChange;
            $view.find('audio').removeAttr('height');
            $view.find('audio').removeAttr('width');
            $view.find('audio').removeAttr('poster');
            $view.find('video,audio').mediaelementplayer({});
        },
        renderImg: function ($img, option) {
            // do nothing
        },
        mediaOnStart: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.play = callback;
            }
        },
        mediaOnPause: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.pause = callback;
            }
        },
        mediaOnEnded: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.ended = callback;
            }
        },
        mediaOnTimeupdate: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.timeupdate = callback;
            }
        },
        mediaOnVolumeChange: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.volumeChange = callback;
            }
        },
        mediaOnSeeked: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.seeked = callback;
            }
        },
        mediaPlay: function (mediaType, index) {
            this._mediaImpl.mediaPlay(mediaType, index);
        },
        mediaPause: function (mediaType, index) {
            this._mediaImpl.mediaPause(mediaType, index);
        },
        mediaPauseAll: function (obj) {
            this._mediaImpl.mediaPauseAll(obj);
        },
        mediaSkip: function (mediaType, index, seeked) {
            this._mediaImpl.mediaSkip(mediaType, index, seeked);
        },
        mediaVolumeChange: function (mediaType, index, volume, diaplay) {
            this._mediaImpl.mediaVolumeChange(mediaType, index, volume, diaplay);
        },
        mediaOnFullScreenChange: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.fullScreenChange = callback;
                this._fullChangeEvent.push(this._eventHandler.fullScreenChange);
            }
        },
        destroy: function () {
            this._fullChangeEvent.remove(this._eventHandler.fullScreenChange);
        },
        setLock:function(lock,view){
            //TODO:
        }
    };


    return mediaPlayer;
});

define('player/media/media', function () {
    var lowVersionMediaPlayer = require('player/media/lowVersionMediaPlayer');
    var defaultMediaPlayer = require('player/media/defaultMediaPlayer');
    var ndMediaPlayer = require('player/media/ndMediaPlayer');
    var Media = require('player/media/mediaApi');

    //扩展media对象api
    var extendMedia = function (media) {
        var methods = [
            'create', 'render', 'renderImg', 'mediaOnStart', 'mediaOnPause',
            'mediaOnEnded', 'mediaOnTimeupdate', 'mediaOnSeeked', 'mediaOnVolumeChange',
            'mediaPlay', 'mediaPause', 'mediaSkip', 'mediaVolumeChange', 'mediaOnFullScreenChange', 'mediaPauseAll', 'setLock'
        ];
        var method;
        var isComplete = true;
        for (var index = 0; index < methods.length; index++) {
            method = methods[index];
            if (!media[method] || $.type(media[method]) !== 'function') {
                isComplete = false;
                break;
            }
        }
        if (isComplete) {
            $.extend(Media, media);
        } else {
            throw 'QtiPlayer.extendMedia输入错误,请确认输入的对象是否有实现所有的api';
        }
    };

    // qti内置的媒体播放器
    if (typeof Audio == typeof undefined) {
        extendMedia(lowVersionMediaPlayer);
        //扩充渲染img接口
        if (window.NDMediaPlayer) {
            Media.renderImg = (function () {
                var that = ndMediaPlayer;
                return function () {
                    var args = Array.prototype.slice.apply(arguments, [0]);
                    return ndMediaPlayer.renderImg.apply(that, args);
                }
            })();
        }
    } else if (window.NDMediaPlayer) {
        extendMedia(ndMediaPlayer);
    } else {
        extendMedia(defaultMediaPlayer);
    }

    return Media;
});

define('player/media/mediaApi', function () {
    var Media = {
        create: function () {
        },
        render: function ($view, option) {
        },
        renderImg: function ($view) {
        },
        mediaOnStart: function (callback) {
        },
        mediaOnPause: function (callback) {
        },
        mediaOnEnded: function (callback) {
        },
        mediaOnTimeupdate: function (callback) {
        },
        mediaOnVolumeChange: function (callback) {
        },
        mediaOnSeeked: function (callback) {
        },
        mediaPlay: function (mediaType, index) {
        },
        mediaPause: function (mediaType, index) {
        },
        mediaPauseAll: function () {
        },
        mediaSkip: function (mediaType, index, seeked) {
        },
        mediaVolumeChange: function (mediaType, index, volume, diaplay) {
        },
        mediaOnFullScreenChange: function (callback) {
        },
        destroy: function () {
        },
        setLock: function (lock, view) {
        }
    };
    return Media;
});

define('player/media/ndMediaPlayer', function () {

    var _emptyFunc = function () {
    };

    var mediaPlayer = {
        _fullChangeEvent: {
            onFullScreenChange: [],
            trigger: function (isFull) {
                this.onFullScreenChange.forEach(function (callback) {
                    if (callback) {
                        callback(isFull);
                    }
                })
            },
            push: function (callback) {
                this.onFullScreenChange.push(callback);
            },
            remove: function (callback) {
                var len = this.onFullScreenChange.length;
                for (var i = 0; i < len; i++) {
                    if (callback === this.onFullScreenChange[i]) {
                        this.onFullScreenChange.splice(i, 1);
                        i--;
                        len--;
                    }
                }
            }
        },
        _mediaImpl: window.NDMediaPlayer,
        _eventHandler: null,
        create: function () {
            var instance = $.extend({}, this);
            instance._eventHandler = {
                play: _emptyFunc,
                pause: _emptyFunc,
                ended: _emptyFunc,
                timeupdate: _emptyFunc,
                seeked: _emptyFunc,
                volumeChange: _emptyFunc,
                fullScreenChange: _emptyFunc
            };
            return instance;
        },
        render: function ($view, option) {
            option.onPlay = this._eventHandler.play;
            option.onPause = this._eventHandler.pause;
            option.onEnd = this._eventHandler.ended;
            option.onSeek = this._eventHandler.seeked;
            option.onVolumeChange = this._eventHandler.volumeChange;
            option.onTimeUpdate = this._eventHandler.timeupdate;
            option.onFullScreenChange = this._eventHandler.fullScreenChange;
            if (option && typeof Audio == typeof undefined) {
                //ie8不渲染video\audio
                if (!option.video) {
                    option.video = {};
                }
                option.video.render = false;
                if (!option.audio) {
                    option.audio = {}
                }
                option.audio.render = false;
            }
            option.lock = option.lockMedia;
            this._mediaImpl.render($view, option);
        },
        renderImg: function ($img, option, lang,lock) {
            var that = this;

            var defaultOption = {
                video: {
                    render: false
                },
                audio: {
                    render: false
                },
                img: {
                    render: true,
                    renderUI: true,
                    renderImmediately: true
                },
                lang: lang,
                lock: lock
            };

            defaultOption.onFullScreenChange = function (isFull) {
                that._fullChangeEvent.trigger(isFull);
            };

            $.extend(defaultOption.img, option);

            this._mediaImpl.renderMediaEle($img, defaultOption);
        },
        mediaOnStart: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.play = callback;
            }
        },
        mediaOnPause: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.pause = callback;
            }
        },
        mediaOnEnded: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.ended = callback;
            }
        },
        mediaOnTimeupdate: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.timeupdate = callback;
            }
        },
        mediaOnVolumeChange: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.volumeChange = callback;
            }
        },
        mediaOnSeeked: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.seeked = callback;
            }
        },
        mediaPlay: function (mediaType, index) {
            this._mediaImpl.mediaPlay(mediaType, index);
        },
        mediaPause: function (mediaType, index) {
            this._mediaImpl.mediaPause(mediaType, index);
        },
        mediaPauseAll: function (obj) {
            this._mediaImpl.mediaPauseAll(obj);
        },
        mediaSkip: function (mediaType, index, seeked) {
            this._mediaImpl.mediaSkip(mediaType, index, seeked);
        },
        mediaVolumeChange: function (mediaType, index, volume, diaplay) {
            this._mediaImpl.mediaVolumeChange(mediaType, index, volume, diaplay);
        },
        mediaOnFullScreenChange: function (callback) {
            if ($.type(callback) === 'function') {
                this._eventHandler.fullScreenChange = callback;
                this._fullChangeEvent.push(this._eventHandler.fullScreenChange);
            }
        },
        destroy: function () {
            this._fullChangeEvent.remove(this._eventHandler.fullScreenChange);
        },
        setLock: function (lock, view) {
            this._mediaImpl.setLock(lock, view);
        }
    };

    return mediaPlayer;
});

define('player/model/modelHandlerFactory', ['model/logger'], function (_logger) {

    var modelHandlerFactory = {
        _modelHandler: {},
        _logger: _logger,
        //值否支持该模型
        isSupport: function (modelName) {
            var result = false;
            if (this._modelHandler[modelName]) {
                result = true;
            }
            return result;
        },
        //注册modelHandler,每个model对应一种特定的AssessmentItem类型
        register: function (modelHandler) {
            if (modelHandler.getName && modelHandler.create) {
                this._logger.debug('_modelHandlerFactory:regiser modelHandler:' + modelHandler.getName());
                this._modelHandler[modelHandler.getName()] = modelHandler;
            }
        },
        //获取model
        getModelHandler: function (modelName) {
            return this._modelHandler[modelName];
        }
    };
    return modelHandlerFactory;
});

define('player/model/modelItem', ['model/logger', 'player/model/modelHandlerFactory'], function (_logger, _modelHandlerFactory) {

    //定义ModelItem，负责每model的展示和数据存储
    var ModelItem = {
        _logger: _logger,
        _modelHandlerFactory: _modelHandlerFactory,
        _event: null,
        _assessmentItem: null,
        _model: null,
        _option: null,
        create: function (assessmentItem, model, event) {
            var instance = $.extend({}, this);
            //属性赋值
            instance._model = model;
            instance._assessmentItem = assessmentItem;
            instance._event = event;
            //创建渲染方法
            var modelHandler = this._modelHandlerFactory.getModelHandler(instance._model.modelType);
            if (modelHandler) {
                modelHandler.create(instance);
            } else {
                this._logger.error('model:' + instance._model.modelType + '不存在');
            }
            return instance;
        },
        setOption: function (option) {
            this._option = option;
        },
        getOption: function () {
            return this._option;
        },
        triggerOptionClick: function (index, val) {
            //index:每个modalitem内部答案的索引，默认0
            var param = {
                identifier: this._model.modelId,
                index: index,
                val: val
            };
            this._event.trigger('assessmentItem', 'optionClick', param);
        },
        hasNum: function () {
            return true;
        },
        hasHint: function () {
            return true;
        },
        hasTitle: function () {
            return true;
        },
        isBlock: function () {
            return true;
        },
        getName: function () {
            return '';
        },
        getClassName: function () {
            return '';
        },
        getLogger: function () {
            return this._logger;
        },
        getModel: function () {
            return $.extend(true, {}, this._model);
        },
        getAnswer: function () {
            var answer = this._assessmentItem._answer[this._model.modelId].value;
            var newAnswer = [];
            newAnswer.pushArray(answer);
            return newAnswer;
        },
        getStat: function () {
            return this._assessmentItem._stat[this._model.modelId] || {};
        },
        getTitleExtras: function () {
            return this._assessmentItem._titleExtras[this._model.modelId] || {};
        },
        getCorrectAnswer: function () {
            var answer = [];
            var correctAnswer = this._assessmentItem._itemModel.correctAnswer[this._model.modelId];
            if (correctAnswer) {
                answer.pushArray(correctAnswer.value);
            }
            return answer;
        },
        setAnswer: function (answer, reset) {
            var currentAnswer = this._assessmentItem._answer[this._model.modelId].value;
            //判断答案是否变化
            var isChange = false;
            var isEmpty = true;
            if (answer) {
                answer.forEach(function (an) {
                    if (an !== '') {
                        isEmpty = false;
                    }
                })
            }
            if (currentAnswer.length === 0 && isEmpty) {
                isChange = false;
            } else if (currentAnswer.length !== answer.length) {
                isChange = true;
            } else {
                $(currentAnswer).each(function (i, v) {
                    if (v !== answer[i]) {
                        isChange = true;
                        return false;
                    }
                });
            }
            //设置新答案
            currentAnswer.clear();
            if (answer) {
                currentAnswer.pushArray(answer);
            }
            //触发答案变化事件
            if (isChange) {
                //判断答案是否正确
                this._assessmentItem._checkModelAnswer(this._model.modelId, reset);
                var answerTemp = $.extend(true, {}, this._assessmentItem._answer);
                this._event.trigger('answer', 'change', answerTemp);
            }
        },
        checkTextAnswer: function (correctValue, currentValue) {
            return this._assessmentItem._checkTextAnswerValue(this._model.modelId, correctValue, currentValue);
        },
        showAnswer: function ($view) {
            this._option.showAnswer = true;
            this._option.showCorrectAnswer = false;
            this._option.showCheckedAnswer = false;
            this._option.showStatisAnswer = false;
            if (this.renderReset) {
                this.renderReset($view);
            }
            if (this.renderAnswer) {
                this.renderAnswer($view);
            }
            if (this.renderLock) {
                this.renderLock($view);
            }
        },
        showCheckedAnswer: function ($view) {
            this._option.showCorrectAnswer = true;
            this._option.showAnswer = true;
            this._option.showCheckedAnswer = true;
            this._option.showStatisAnswer = true;
            if (this.renderReset) {
                this.renderReset($view);
            }
            if (this.renderCheckedAnswer) {
                this.renderCheckedAnswer($view);
            }
            if (this.renderLock) {
                this.renderLock($view);
            }
        },
        showUsrAndCorrectAnswer: function ($view) {
            this._option.showCorrectAnswer = true;
            this._option.showAnswer = true;
            this._option.showCheckedAnswer = false;
            this._option.showStatisAnswer = false;
            if (this.renderReset) {
                this.renderReset($view);
            }
            // 显示用户答案
            if (this.renderAnswer) {
                this.renderAnswer($view);
            }
            // 显示正确答案
            if (this.renderCorrectAnswer) {
                this.renderCorrectAnswerNoneGrayBg($view);
            }
            if (this.renderLock) {
                this.renderLock($view);
            }
        },
        showCorrectAnswer: function ($view) {
            this._option.showCorrectAnswer = true;
            this._option.showAnswer = false;
            this._option.showCheckedAnswer = false;
            this._option.showStatisAnswer = false;
            if (this.renderReset) {
                this.renderReset($view);
            }
            if (this.renderCorrectAnswer) {
                this.renderCorrectAnswer($view);
            }
            if (this.renderLock) {
                this.renderLock($view);
            }
        },
        showStatisAnswer: function ($view) {
            this._option.showAnswer = false;
            this._option.showCorrectAnswer = false;
            this._option.showCheckedAnswer = false;
            this._option.showStatisAnswer = true;
            if (this.renderReset) {
                this.renderReset($view);
            }
            if (this.renderStatisAnswer) {
                this.renderStatisAnswer($view);
            }
            if (this.renderLock) {
                this.renderLock($view);
            }
        },
        reset: function ($view) {
            this._option.showCorrectAnswer = false;
            this._option.showAnswer = false;
            this._option.showCheckedAnswer = false;
            this._option.showStatisAnswer = false;

            //重置当前用户答案
            this.setAnswer([], true);

            if (this.renderReset) {
                var answer = this.renderReset($view);
                if (answer) {
                    this.setAnswer(answer);
                }
            }

            this.setLock($view, false);
        },
        setLock: function ($view, lock) {
            this._option.showLock = lock;
            if (this.renderLock) {
                this.renderLock($view);
            }
        },
        isLock: function () {
            return this._option.showLock || this._option.showCorrectAnswer || this._option.showCheckedAnswer;
        }
    };
    return ModelItem;
});

// qti model
define('player/utils/area', function () {


    var area = {
        getRectIntersectArea: function (rect1, rect2) {
            var m = 0;
            //左上角
            if (rect1.l > rect2.l && rect1.l < rect2.r && rect1.t > rect2.t && rect1.t < rect2.b) {
                m = (rect2.r - rect1.l) * (rect2.b - rect1.t);
            }
            //右上角
            if (rect1.r > rect2.l && rect1.r < rect2.r && rect1.t > rect2.t && rect1.t < rect2.b) {
                var s = (rect1.r - rect2.l) * (rect2.b - rect1.t);
                if (s > m) {
                    m = s;
                }
            }
            //左下角
            if (rect1.l > rect2.l && rect1.l < rect2.r && rect1.b > rect2.t && rect1.b < rect2.b) {
                var s = (rect2.r - rect1.l) * (rect1.b - rect2.t);
                if (s > m) {
                    m = s;
                }
            }
            //右下角
            if (rect1.r > rect2.l && rect1.r < rect2.r && rect1.b > rect2.t && rect1.b < rect2.b) {
                var s = (rect1.r - rect2.l) * (rect1.b - rect2.t);
                if (s > m) {
                    m = s;
                }
            }
            //四个点都不相交
            if (rect1.l < rect2.l && rect1.r > rect2.r && rect1.t > rect2.t && rect1.b < rect2.b) {
                var s = (rect2.r - rect2.l) * (rect1.b - rect1.t);
                if (s > m) {
                    m = s;
                }
            }
            return m;
        },
        getInteractRect: function (l, t, h, w, targetRects) {
            var that = this;
            var rects,
                max = 0,
                matchCount = 0,
                matchIndex;

            targetRects.forEach(function (rect, i) {

                //计算面积
                var m = that.getRectIntersectArea({
                    l: l,
                    t: t,
                    r: l + w,
                    b: t + h
                }, rect);
                var cm = that.getRectIntersectArea(rect, {
                    l: l,
                    t: t,
                    r: l + w,
                    b: t + h
                });

                if (cm > m) {
                    m = cm;
                }

                if (m > 0) {
                    matchCount++;
                }

                if (m > max) {
                    max = m;
                    matchIndex = i;
                }
            });

            //匹配区域超过1个且匹配度不高，按最高匹配
            if (matchCount > 1) {
                rects = targetRects[matchIndex];
            } else if (max >= ((w * h * 2) / 5)) {
                rects = targetRects[matchIndex];
            }
            return rects;
        },
        //点到线的距离
        pointToLine: function (x1, y1, x2, y2, x0, y0) {
            var space = 0;
            var a, b, c;
            a = this.lineSpace(x1, y1, x2, y2);// 线段的长度
            b = this.lineSpace(x1, y1, x0, y0);// (x1,y1)到点的距离
            c = this.lineSpace(x2, y2, x0, y0);// (x2,y2)到点的距离
            if (c <= 0.000001 || b <= 0.000001) {
                space = 0;
                return space;
            }
            if (a <= 0.000001) {
                space = b;
                return space;
            }
            if (c * c >= a * a + b * b) {
                space = b;
                return space;
            }
            if (b * b >= a * a + c * c) {
                space = c;
                return space;
            }
            var p = (a + b + c) / 2;// 半周长
            var s = Math.sqrt(p * (p - a) * (p - b) * (p - c));// 海伦公式求面积
            space = 2 * s / a;// 返回点到线的距离（利用三角形面积公式求高）
            return space;
        },
        // 计算两点之间的距离
        lineSpace: function (x1, y1, x2, y2) {
            var lineLength = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
            return lineLength;
        }
    };
    return area;

});

// qti model
define('player/utils/browser', function () {

    var userAgent = window.navigator.userAgent.toLowerCase();

    // Figure out what browser is being used
    jQuery.browser = {
        version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
        safari: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
        mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
    };

    var browser = {
        Android: function () {
            return navigator.userAgent.match(/Android/i) ? true : false;
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i) ? true : false;
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i) ? true : false;
        },
        any: function () {
            return (this.Android() || this.BlackBerry() || this.iOS() || this.Windows());
        },
        Mobile: function () {
            return (this.Android() || this.BlackBerry() || this.iOS() || this.Windows());
        },
        IEVersion: function () {
            var engine = 999999;
            if (window.navigator.appName == "Microsoft Internet Explorer" || window.navigator.appVersion.indexOf('MSIE') > 0) {
                // This is an IE browser. What mode is the engine in?
                if (document.documentMode) {
                    // IE8
                    engine = document.documentMode;
                }
                else // IE 5-7
                {
                    engine = 5; // Assume quirks mode unless proven otherwise
                    if (document.compatMode) {
                        if (document.compatMode == "CSS1Compat")
                            engine = 7; // standards mode
                    }
                }
                // the engine variable now contains the document compatibility mode.
            } else {
                var isIE11 = (/Trident\/7\./).test(navigator.userAgent);
                if (isIE11) {
                    engine = 11;
                }
            }
            return engine;
        },
        isIE:function(){
            return this.IEVersion() != 999999;
        }
    };


    return browser;

});

// qti model
define('player/utils/checkOption', ['player/config/skin', 'player/config/platform'], function (_skin, _platform) {

    var checkOption = function (option) {
        if (option && $.type(option) === 'object') {
            option = $.extend({}, option);
            //删除null,undefined项
            for (var name in option) {
                if (option[name] === null || option[name] === undefined) {
                    delete option[name];
                }
            }
            //用户输入answer相关渲染参数处理
            //处理逻辑:1、用户输入的答案渲染参数只能有一个为true，如果有多个true，按照以下顺序，保留第一个为true，其他赋值为false;
            //2、如果用户输入的参数全为false，或则没有输入任何参数，则hideAnswerArea为true，其他都为false
            var answerOptions = ['showAnswerArea', 'showAnswer', 'showCheckedAnswer', 'showCorrectAnswer', 'showStatisAnswer', 'hideAnswerArea'];
            var optionName;
            //判断是否有答案渲染项配置,如果没有定义答案渲染项
            var hasAnswerOption = false;
            for (var index = 0; index < answerOptions.length; index++) {
                optionName = answerOptions[index];
                if (option[optionName] !== undefined) {
                    //有答案渲染选项
                    hasAnswerOption = true;
                    break;
                }
            }
            if (hasAnswerOption) {
                //如果有答案渲染配置，判断是否有为true的答案渲染选项,保证只有一个渲染项为true
                var hasTrueAnswerOption = false;
                for (var index = 0; index < answerOptions.length; index++) {
                    optionName = answerOptions[index];
                    if (option[optionName] && hasTrueAnswerOption === false) {
                        hasTrueAnswerOption = true;
                        option[optionName] = true;
                    } else {
                        option[optionName] = false;
                    }
                }
                //如果有答案渲染项，但是所有渲染都为false，则隐藏答案渲染
                if (hasTrueAnswerOption === false) {
                    option.hideAnswerArea = true;
                }
            }
            //处理复合小题单独渲染参数
            if (option.modelId && $.type(option.modelId) !== 'array') {
                option.modelId = [];
            }
            //处理随机渲染参数
            if (option.randomSeed && $.type(option.randomSeed) !== 'array') {
                option.randomSeed = [];
            }

            if (option.platForm) {
                var platForm = _platform[option.platForm];
                option.platForm = platForm || '';
            }
            if (option.lang && $.type(option.lang) === 'string') {
                option.lang = option.lang.toLowerCase();
            }

            //重置主题和平台
            if (!option.skin && option.theme) {
                option.skin = option.theme;
            }
            if (option.skin) {
                //增加是否是elearning参数的判断
                option.isElearningSkin = (option.skin === 'elearning');
                var skinCls = _skin[option.skin];
                option.skin = skinCls || _skin.wood;
            }else{
                option.skin = _skin.wood;
            }


        } else {
            option = {};
        }
        return option;
    };

    return checkOption;

});

// qti model
define('player/utils/dom', function () {


    var dom = {
        getParentElement: function ($el, className) {
            //$el = $el.parent();
            while (!$el.hasClass(className) && $el[0].nodeName.toLocaleLowerCase() != "body") {
                $el = $el.parent();
            }
            return $el;
        },
        toCenter: function (obj) {
            var screenHeight = 0;
            if (window.innerHeight)
                screenHeight = window.innerHeight;
            else if ((document.body) && (document.body.clientHeight))
                screenHeight = document.body.clientHeight;
            if (document.documentElement && document.documentElement.clientHeight) {
                screenHeight = document.documentElement.clientHeight;
            }
            var scrolltop = $(document).scrollTop();//获取当前窗口距离页面顶部高度
            var objTop = (screenHeight - obj.height()) / 2 + scrolltop;
            if (objTop < 0) {
                objTop = 50;
            }
            $(obj).css("top", objTop + "px");
            $(obj).css("position", "absolute");
            $(obj).show();
        },
        addListener: function (target, type, handler) {
            if (target.addEventListener) {
                target.addEventListener(type, handler, false);
            } else if (target.attachEvent) {
                target.attachEvent("on" + type, handler);
            } else {
                target["on" + type] = handler;
            }
        },
        allowNumKeyCodes: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 110, 109, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 108, 190, 8, 37, 38, 40, 39, 46, 189],
        allowNumKeyDown: function () {
            var eventKeyCode = event.keyCode;
            if (event.shiftKey) {
                eventKeyCode = 0;
            }
            var input = event.srcElement || event.target;
            var txtVal = input.value;
            var result = false;
            for (var i = 0; i < this.allowNumKeyCodes.length; i++) {
                var keyCode = this.allowNumKeyCodes[i];
                if (eventKeyCode === keyCode) {
                    if (eventKeyCode == 109 || eventKeyCode == 189) {//负号
                        if (txtVal.length == 0) {
                            input.value = '';
                            result = true;
                        } else {
                            result = !(txtVal.toString().indexOf('-') > -1);
                        }
                    } else if (eventKeyCode == 190 || eventKeyCode == 110) {//小数点
                        if (txtVal.length == 0) {
                            input.value = '';
                        }
                        result = !(txtVal.toString().indexOf('.') > -1);
                    } else {
                        result = true;
                    }
                    break;
                }
            }
            input.setAttribute("key-result", result + "|" + eventKeyCode + "|" + event.ctrlKey);
            return result;
        },
        allowNumInput: function () {
            var input = event.srcElement || event.target;
            var keydown = input.getAttribute("key-result");
            var inputResults = keydown != null ? keydown.split('|') : [];
            if (inputResults.length < 3) {//黏贴
                if (input.value == '') {
                    input.value = '';
                }
                return false;
            }
            if (input.value.length > 0) {
                return;
            }
            var keyResult = inputResults[0],
                eventKeyCode = inputResults[1],
                ctrl = inputResults[2],
                inputPreVal = input.getAttribute("pre-v") || '';

            if (keyResult == "true" || ctrl == "true") {
                if (inputPreVal != "" && input.value == "" && eventKeyCode != 37 && eventKeyCode != 39 && eventKeyCode != 8 && eventKeyCode != 46 && eventKeyCode != 38 && eventKeyCode != 40 && !(ctrl && eventKeyCode == 88)) {
                    input.value = inputPreVal;
                } else if (ctrl && eventKeyCode == 86) {
                    input.value = input.value;
                }
                input.setAttribute("pre-v", input.value);
            } else {
                input.value = inputPreVal;
            }
            input.setAttribute('key-result', '');
            return false;
        },
        getCursorPos: function ($dom) {
            var el = $dom.get(0);
            var pos = 0;
            if ('selectionStart' in el) {
                pos = el.selectionStart;
            } else if ('selection' in document) {
                el.focus();
                var Sel = document.selection.createRange();
                var SelLength = document.selection.createRange().text.length;
                Sel.moveStart('character', -el.value.length);
                pos = Sel.text.length - SelLength;
            }
            return pos;
        },
        //兼容ie11和ff的方法
        getSelectedText: function () {
            var selText = "";
            if (window.getSelection) {  // all browsers, except IE before version 9
                var sel = document.activeElement;
                if (sel &&
                    (sel.tagName.toLowerCase() == "textarea" ||
                    (sel.tagName.toLowerCase() == "input" &&
                    ((sel.getAttribute("type").toLowerCase() == "text")||sel.getAttribute("type").toLowerCase() == "number")))) {
                    var text = sel.value;
                    selText = text.substring(
                        sel.selectionStart,
                        sel.selectionEnd
                    );
                }
                else {
                    var selRange = window.getSelection();
                    selText = selRange.toString();
                }
            } else {
                if (document.getSelection) {  // all browsers, except IE before version 9
                    range = document.getSelection();
                    selText = range.toString();
                } else if (document.selection.createRange) { // IE below version 9
                    var range = document.selection.createRange();
                    selText = range.text;
                }
            }
            return selText;
        },
        inputNumberKeydown: function ($input, e) {
            var val = $input.val();
            var eventKeyCode = e.keyCode;
            var result = true;
            var cursorPos = this.getCursorPos($input);
            var selectText = this.getSelectedText();
            var selectTextLength = selectText.length;

            if (eventKeyCode == 109 || eventKeyCode == 189) {//负号
                if (val.length == 0) {
                    $input.val('');
                    result = true;
                } else {
                    result = (val.toString().indexOf('-') <= -1)
                        || selectText.indexOf('-') >= 0;
                }
            } else if (eventKeyCode == 190 || eventKeyCode == 110) {//小数点
                if (val.length == 0) {
                    $input.val('')
                }

                var index = val.toString().indexOf('.');
                result = (index <= -1) || selectText.indexOf('.') >= 0;
            } else {
                result = true;
            }
            if (!result) {
                return false;
            }


            //allow first letter
            if ((val === '' || this.getCursorPos($input) === 0)
                && (e.keyCode === 189 || e.keyCode === 109 )
                && val.indexOf('-') < 0
                || (val.substring(0, 1) === '-'
                && cursorPos === 0
                && selectTextLength > 0
                && (e.keyCode === 189 || e.keyCode === 109 ))
            ) {
                return;
            }
            var index = val.indexOf('.');

            // Allow: backspace, delete, tab, escape, enter and .
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                    // Allow: Ctrl+A, Command+A
                (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) ||
                    // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            //不允许在-号前输入字符
            if (val.substring(0, 1) === '-'
                && this.getCursorPos($input) === 0 && selectTextLength <= 0
                && (e.keyCode !== 189 || e.keyCode !== 109)) {
                e.preventDefault();
                return false;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
                return false;
            }
        }
    }
    return dom;

});

// qti model
define('player/utils/extendUtils', ['model/utils', 'player/config/lang', 'player/utils/checkOption', 'player/config/platForm'],
    function (_utils, _lang, _checkOption, _platForm) {

        var random = require('player/utils/random');
        var img = require('player/utils/img');
        var svg = require('player/utils/svg');
        var area = require('player/utils/area');
        var dom = require('player/utils/dom');
        var browser = require('player/utils/browser');


        _utils.getPlatForm = function () {
            return _platForm;
        };

        //获取国际化参数值
        _utils.getLangText = function (key, option) {
            var lang = _lang[option.lang] ? _lang[option.lang] : _lang['zh'];
            var result = lang[key];
            if (result === null || result === undefined || result === '') {
                result = '';
            }
            return result;
        };

        _utils.checkOption = _checkOption;

        //扩展
        _utils.Svg = svg;

        _utils.Img = img;

        _utils.Rd = random;

        _utils.Area = area;

        _utils.Dom = dom;

        _utils.Broswer = browser;

        return _utils;

    });

define('player/utils/imageLoader', ['model/logger', 'player/utils/extendUtils'], function (_logger, _utils) {

    var Media = require('player/media/media');
    var _emptyFunc=function(){};

    //图片加载器
    var ImageLoader = {
        _waitingQueue: null,
        _loadQueue: null,
        _loadingIconData: null, //加载时显示图片
        _imageLoaderPool: null,
        _emptyIconData: null,
        _errorIconData: null, //加载错误显示图片
        _imageRegex: /<img([\s\S]*?)\/>/g,
        _srcRegex: /src="([\s\S]*?)"/,
        _widthRegex: /width="([\s\S]*?)"/,
        _heightRegex: /height="([\s\S]*?)"/,
        _dataClassRegex: /data-class="([\s\S]*?)"/,
        _dataWidthRegex: /data-width="([\s\S]*?)"/,
        _dataHeightRegex: /data-height="([\s\S]*?)"/,
        _lazyLoadRegex: /data-lazy-load="(true|false)"/,
        _renderMediaImgRegex: /data-media-img-render=(["'])([\s\S]*?)\1/, //默认使用多媒体渲染图片 {render:'true',renderUi:'false'} |true|false
        _loadingImageStart: false,
        _imageIndex: 0,
        _imageLoaderMaxNum: 6,
        create: function () {
            var instance = $.extend({}, this);
            instance._waitingQueue = [];
            instance._loadQueue = [];
            instance._emptyIconData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=';
            instance._errorIconData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADKUlEQVRIS6WVX0hTcRTHv2eba//UVuhLVBD5FAhRIJVNLZAoFAOF/hDOUIqiMiRRJIQso6QgJYTqYWXoQ1YK+hJhcyhUEBTRQ+JT9JKG+W+bTHdP5+76b7rNW56ny73nnM/5nnN+v0vQaQwYkGVPi7h/8I8SoOgJFT99xnmWHJCxSbyFFb5GfTM+PZG6AJwNJ5Lsz0F0VEvKPeOK/4zTi/G1IPoALttZGOmhACxafg6Kjgvk9XvWDeD9lu3YYOyU5HujkrHyEbNcQgPBH4kgCRVEBptjq5Pq66ViI5SwlstgBAhhKFwPb+B2ooEnBrhsu2EydEpLdiB1E5B7XAN4XwMTY/JAw6KimAb8X+KpiAvgXTAjzdEsGs4hPAcUVYAv3YvkoZYqoOsxYDSpO9WKkelK+oZQLEh8gMueDxO1S9BmzAnAXQMuq9cAngbA07gA+C0KT8rA3+oGjO1BqjPZ1gaDoSASpCooKANXNkt2AjVfXVKgfleUbkwFSukTJlZCYirgXEupHKpWSWaNBKjD3XcEfP2ZBrjpBgZ7tWFHjAMy8vPU729bE8Au61bZmhcgQ9aisyK3QkYmuKlH3R5QdSHw/bMADEv5FLwXqSXkDf5cDolSIGtJyLPVSpU35HGhPClQAGlbwA/eqBMAXckHRiUPLQOAZW1RB6//riSVVJpFAw6aM2Eyv5S3O6OksvinOMGNnVK1AGqKgUlZU2nXChvCXKiYfKGvqwCRtUy33ZeqLq7aBhVgsYJrn2gzaCwHZgKxAKraFkwGqmTgs1EK5LY8LHvXIQm0KzmWueu0t55bcV2EMIIwnaD+6XeLAM5CCuwOj7yYP6or4lUFyRuBY6Xah96nwJRcpKtbpH1nvEJo2k2DmIo0kV320zDhkUTYYpamnoPCcvDlZSe5W9qlnuSYxn7Z7QrqC3YQZ1u3IcnYLoM9EFf3PwPUqpUBhPkUca6jAQaulurNcQHzWwRXkebi65It+hO/RVqfQnKF3CE+ZP8lnukJpjbfV5lD1HWt51/FIwJwDEmGjDUB/+PAyrC0yJot2+CSySf9T464MSTngNmnR+e6uH8BvXgVNfoEydIAAAAASUVORK5CYII=';
            instance._loadingIconData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAvCAYAAACsaemzAAAHnklEQVRoQ9WZa2xTZRjHn3N6ejnttq7bgDEYhTHNGLDB5CIk4ETAEOWabCRqjPgJ1Eg0ihATQ2KMaCKaIeoHgQ/GKAYhYQQCARMkwrhs2QXGBiwwUMdtjN26de3p8f+ctlvXtYOtXS1vc3Ju7Tnv7/0/t/etQEHt8uXLL4qi+B0uZwXfi+dzVVWvC4KwRQjs5IULF/QJCQm/4cYqvu69qcYzh9ZLfw89Hk95P6DS0lJzdnb2ESi0kL/UIsjkFCQfWPxxcR+NqkI21aH1UVGUW2GBPCSoteJo5aEoS31jEF9QKjCsahdNVe6SCJ0eE8gEoPhsrFCy2k25kQGxXiLpyAkN3TjWkSIYfZYcW3+LApBAOoxIZvcxmtB1jIyeFnKJCXTLtIQa5WXkEiwBLjryqkYMJJBCeW0llNu5myTYLtsw66WQga5Ziqki6SNyC+aYRcaIgNi0xvScpcIHG8jgadNg+pqKc4lO27bRdXkV7igjL49v2IbtQwyU3/415bXv0PwmuInkpqvmtVSW/FlMYPwZMgIgkWa3fkpTOveQB2qEArouL6e/bF9pQSMWLWKTm+z4nZ59uCWk47OZVSa+RzWJ7+C+JxY8WoUQgUICyZ5mWvDgXUp3lpFHYLNjP2I9FGqRptDJlB3UJmUNG0jwKevB81TVQyLe4b3GPjowJUQE5LVZkWyuOvhRCQLEOS3ScYS7b5gJZd6mu4aCYYVt7rRbdVKz6x+647pBbe771IP0kCAmU4p+HI01TCaLzjoAKmIgP5SE2snqbvDmISGRWvXZ1IP9UE2Ngz6r0eRsoKtd5+lOzw1yAYQ76tWetBRuldIoW55Fk+WZpEcS96sVFSCvc3irBX/zggytSmBVujztdKnzFDV0VWggfpMLdkAGEPGxm6bTzMQlZBaTeo0wrA9t3bpVXLx4sSU1NfUQV9t9xWn0aznueIv7NlW0H6Wmnmu+jPboipHBMo05NDdpBZlQoXhwHhaourra5nK5Us1m848Aem6kgNjM7rlu0fm2Q/TA/W9YVcKHSZWeMs+hgoSlCBoGAHWFLk4rKyufxqzPajKZvgRQ4UgAsTLNrr/pTNsBeui+MwwYv8GLML2llGOep00fQlbbly5dWoAZn06SpE8A9PxgQDzK3iquv9/4r4UKsV4za6IzrQeGqUz/Qouj3sLkVyhLl0JTlNsD50MAehU/aQbMpkcBcVi957qphVe32qO9ySDKlIRoZJPGUpIulXSCHrjeBMugDgSAM637fT4TeSXBz86SC2gplJqm3B8IVFdX9zF8qFKv17+PNYVFwQpxp9yqi651lVOd4zR1Kq1ah/0asUtjcgFnNVOaPhMvm4H8kU0S7NyFHFPefkT7LT8nOk1FCJdpuXU1LdLxtEXpm7FyhCsuLt6JKeyhUEAivu6CEtUdJ+iK4xz/NGzHvOaG2hsgdtM0mm4ppJvOWqpsP96rWHSACMPpofnybHrNPMOb0fxrCljtMWO1Zx8U2hkM1Io1BQUwVYCpd5wNWYKE6yDD2aQxyDcd1O3pjKI63jcqgJhjyqd1ljn9gaqqqsYbjcZDINyi0+k+CDa5WiS/6o4/hgTjh2Qor5FFy9T6ho8VYqA3goGwuDgPEPsBtA5AH/qBLovpykXXDYmduQfhMXr2Hx2jGwxoDSLbbpjcWoTtTQyEYkM9q+qU0raDUsuwEmB0Oj3YU8ICIcJtBMQ2AK0KBPrFcVE51VUmcVCIxxYWqLa29hsotMHtdq8IBNrTUaacc9ZIuhjNQIc6aCGBeD3bYrH8CoVeDgV0HkBc6cZjCwdkBRCvZxfA5FYGK/TEASFkT0JBehwKZAT7EJvcEwdUU1MzH8m0FCYnA2j1E68QitIiQPyEqYMCH1oTCLRbCwrVcRsUuFKYa5rRv1JAUt0M//kcQI5AIGR2dZ+jQq1wXhHjNcox0DOmHFqDQlhbkuZaDiF7F6qDNwcCETlQJXejwo7nZsI0xYyFE622U5RGAUn1hFYZQCH40Es4LoJPveWfx8QzTGC9yMfo/0Ghvr6+Acf8BzGvsK9vbGw8nJaWth7Hdl9FObTlnNiOAMbfu+IJQW60tLTsYoWcuGjw9eMWbuwE6VVMx0X+dmz79/hv477BxBwQ4OTKlSs78Ett4AUEhbsICqMCHgUm/BMb5w08IvpZ39HR8cKsWbOa/N0VysvL12EutBFQ47Al4oYhnpUJHGdY0Z+dnZ3LAOToBWKVjh49OgrVwhjkoLGAmwCwTGwTEP3GY58OwFR8LwnHJp/NxoV+APp57969r2MJoffvjsF8RNi+fbspJycnAbApAGVgVjET+4mAHQe4DJyPxmYFoRl7fSxJ4UNf5Obmbg5857CdHqNisNvt5oyMDBtWW0cDcgzCvR17O0BZWd4Y1obzETFlFAIbpk6d+kNUgAZToqioSFdYWChDXSsgU6FmusFgYDPOxDFDZwJyNLY0bFZsxqGaMgJCD9rqvLy8wyMO9Aiz6zVlQNpkWWZYNuXxbMqsLraxAOfIa8V1MwMHPxP+cxNAS/Pz8+v/b6BBeUtKSozp6emW5ORk/uMgnVUFcBZgJwFsEs4nsjrIld82NDR8j/XEfinmP8t8qmxgb+JWAAAAAElFTkSuQmCC';
            instance._imageLoaderPool = [];
            var poolNum = 0;
            while (poolNum < instance._imageLoaderMaxNum) {
                instance._imageLoaderPool.push(new Image());
                poolNum++;
            }
            return instance;
        },
        _getImageLoader: function () {
            return this._imageLoaderPool.shift();
        },
        _returnImageLoader: function (imageLoader) {
            imageLoader.onerror = _emptyFunc;
            imageLoader.onload = _emptyFunc;
            imageLoader.src = this._emptyIconData;
            this._imageLoaderPool.push(imageLoader);
        },
        parseImage: function ($view, html, option) {
            var that = this;
            var resultHtml = html.replace(that._imageRegex, function (imageInfo) {
                var src = _utils.getValue(imageInfo, that._srcRegex);
                var result = '';
                if (src !== '') {
                    var lazyLoad = _utils.getValue(imageInfo, that._lazyLoadRegex);
                    if (lazyLoad === 'false') {
                        result = imageInfo;
                    } else {
                        var imageId = 'qp-loading-image-' + that._imageIndex;
                        var clazz = _utils.getValue(imageInfo, that._dataClassRegex);

                        var width = parseInt(_utils.getValue(imageInfo, that._dataWidthRegex));
                        if (!width) {
                            width = parseInt(_utils.getValue(imageInfo, that._widthRegex));
                            if (!width) {
                                width = 0;
                            }
                        }
                        var height = parseInt(_utils.getValue(imageInfo, that._dataHeightRegex));
                        if (!height) {
                            height = parseInt(_utils.getValue(imageInfo, that._heightRegex));
                            if (!height) {
                                height = 0;
                            }
                        }

                        var renderImgOption = _utils.getValue(imageInfo, that._renderMediaImgRegex, 2);
                        if (!option.thumbnailEnable) {
                            renderImgOption = false;
                        }
                        result = '<img class="' + imageId + ' ' + clazz + '" '
                            + 'data-src="' + src + '" '
                            + 'data-media-img-render=\'' + renderImgOption + '\' '
                            + 'data-lang="' + option.lang + '" '
                            + 'data-lockmedia="' + option.lockMedia + '" '
                            + 'src="' + that._loadingIconData + '" />';

                        that._imageIndex++;
                        that._waitingQueue.push({
                            $view: $view,
                            imageId: imageId,
                            src: src,
                            width: width,
                            height: height
                        });
                    }
                }
                return result;
            });
            return resultHtml;
        },
        _renderMediaImg: function ($img, width, height) {
            //超过大小的使用media插件渲染
            var that = this;
            var minHeight = 180;
            var minWidth = 260;
            //默认使用多媒体组件渲染图片
            var renderOption = $img.data('media-img-render');
            var lang = $img.data('lang');
            var lockMedia = $img.data('lockmedia');
            var renderMediaImg = !(renderOption === false);
            if (typeof renderOption === 'object') {
                minWidth = renderOption.minWidth;
                minHeight = renderOption.minHeight;
            }

            if ($img[0] && renderMediaImg && $img[0].parentNode && (width > minWidth || height > minHeight)) {

                Media.renderImg($img[0], typeof renderOption === 'object' ? renderOption : {}, lang,lockMedia);
                return true;
            }
            return false;
        },
        _loadImage: function () {
            var that = this;
            //执行图片加载
            var imageHandler = function (targetImageInfo, imageLoader) {
                imageLoader.onerror = function () {
                    //加载错误
                    //返回图片加载对象
                    //显示默认错误图片
                    that._returnImageLoader(imageLoader);
                    targetImageInfo.$image[0].src = that._errorIconData;
                };
                imageLoader.onload = function () {
                    //图片加载成功，开始往目标位置渲染图片
                    //图片实际高宽
                    var imageWidth = this.width;
                    var imageHeight = this.height;
                    //目标显示高宽
                    var targetWidth = targetImageInfo.width;
                    var targetHeight = targetImageInfo.height;
                    //先将目标位置图片改为透明图片
                    if (targetImageInfo.$image.length > 0) {
                        targetImageInfo.$image[0].src = that._emptyIconData;
                        var newWidth = 0;
                        var newHeight = 0;
                        //调整目标位置图片的额实际高宽
                        if (targetWidth && targetHeight) {
                            newWidth = targetWidth;
                            newHeight = targetHeight;
                            //如果有目标显示高宽
                            if (imageWidth > targetWidth || imageHeight > targetHeight) {
                                //如果图片实际高宽大于目标高宽，则根据比例缩小
                                var wc = imageWidth / targetWidth;
                                var hc = imageHeight / targetHeight;
                                if (wc > hc) {
                                    newHeight = parseInt(imageHeight / wc);
                                    newWidth = targetWidth;
                                } else {
                                    newHeight = targetHeight;
                                    newWidth = parseInt(imageWidth / hc);
                                }
                                targetImageInfo.$image.attr('width', newWidth);
                                targetImageInfo.$image.attr('height', newHeight);
                            }
                            //目标位置加载图片
                            targetImageInfo.$image[0].src = targetImageInfo.src;
                        } else {
                            //目标位置加载图片
                            targetImageInfo.$image[0].src = targetImageInfo.src;
                            newWidth = imageWidth;
                            newHeight = imageHeight;
                            //没有显示指定期望宽高的直接使用多媒体渲染
                            if (targetWidth) {
                                targetImageInfo.$image.attr('width', targetWidth);
                            }
                            if (targetHeight) {
                                targetImageInfo.$image.attr('height', targetHeight);
                            }
                        }
                        that._renderMediaImg(targetImageInfo.$image, newWidth, newHeight);
                    }
                    //返回图片加载对象
                    that._returnImageLoader(imageLoader);
                };
                imageLoader.src = targetImageInfo.src;
            };
            var loadingImageHandler = function () {
                //触发加载图片
                var imageInfo = that._loadQueue.shift();
                var imageLoader;
                while (imageInfo) {
                    //有等待加载的图片
                    imageLoader = that._imageLoaderPool.shift();
                    if (imageLoader) {
                        //有空闲图片加载对象,则开始加载
                        imageHandler(imageInfo, imageLoader);
                        //获取下一个等待加载的图片
                        imageInfo = that._loadQueue.shift();
                    } else {
                        //没有空闲图片加载对象，待加载图片放会加载队列
                        that._loadQueue.unshift(imageInfo);
                        //结束本次加载
                        imageInfo = null;
                    }
                }
                //判断是否还有图片未加载
                if (that._loadQueue.length > 0) {
                    //图片未加载完，触发下次加载
                    setTimeout(loadingImageHandler, 500);
                } else {
                    that._loadingImageStart = false;
                }
            };
            //player是多示例，共用一个ImageLoader示例，多次运行加载图片任务，保证只有一个定时加载任务执行
            if (that._loadingImageStart === false && that._loadQueue.length > 0) {
                that._loadingImageStart = true;
                loadingImageHandler();
            }
        },
        load: function () {
            var that = this;
            var imageInfo;
            var waitingQueueTemp = that._waitingQueue;
            that._waitingQueue = [];
            //初始化等待加载队列中的图片数据
            for (var index = 0; index < waitingQueueTemp.length; index++) {
                imageInfo = waitingQueueTemp[index];
                imageInfo.$image = imageInfo.$view.find('.' + imageInfo.imageId);
                if (imageInfo.$image.length === 1) {
                    //带加载图片对象存在，将图片移动到加载队列
                    this._loadQueue.push(imageInfo);
                }
            }
            //触发加载图片
            that._loadImage();
        }
    };

    //实例化图片加载器,全局单例
    var _imageLoader = ImageLoader.create();
    return _imageLoader;
});

// qti model
define('player/utils/img', function () {


    var img = {
        PreLoadingImg: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFFQjM3Q0UzNDAxRDExRTFCMDY2RjdDNTdFQjYzRUM1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFFQjM3Q0U0NDAxRDExRTFCMDY2RjdDNTdFQjYzRUM1Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUVCMzdDRTE0MDFEMTFFMUIwNjZGN0M1N0VCNjNFQzUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUVCMzdDRTI0MDFEMTFFMUIwNjZGN0M1N0VCNjNFQzUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4pDOh4AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABhJREFUeNpiYBgFo2AUjIJRMApoBwACDAAGaAABg+4RpgAAAABJRU5ErkJggg==",

        resizeImage: function (imgElement, url, maxWidth, maxHeight) {
            var $imgElement = $(imgElement);
            var dataLoad = $imgElement.attr("data-load");
            if ('true' != dataLoad) {
                var callback = function () {

                    //imgElement.src = url;
                    var scale = 1,
                        w = img.width,
                        h = img.height;
                    if (img.width > maxWidth) {
                        w = maxWidth;
                        h = img.height * (w / img.width);
                    }
                    if (h > maxHeight) {
                        h = maxHeight;
                        w = img.width * (h / img.height);
                    }
                    $imgElement.attr("src", url);
                    $imgElement.attr("width", w + "px");
                    $imgElement.attr("height", h + "px");
                    $imgElement.attr("data-load", true);
                };

                var img = new Image();
                img.src = url;
                if (img.complete) {
                    callback(img.width, img.height);
                } else {
                    img.onload = function () {
                        callback(img.width, img.height);
                        img.onload = null;
                    };
                }
            }

        },
        resize: function (oWidth, oHeight, maxW, maxH, minW, minH) {
            var w = oWidth, h = oHeight, scale = 1;

            if (minW && w < minW) {
                scale = (minW / w).toFixed(3);
                h = parseInt(scale * h);
                w = minW;
            }

            if (minH && h < minH) {
                scale = (minH / h).toFixed(3);
                w = parseInt(scale * w);
                h = minH;
            }

            if (oWidth > maxW) {
                scale = (maxW / oWidth).toFixed(3);
                h = parseInt(scale * oHeight);
                w = maxW;

            }
            if (h > maxH) {
                scale = (maxH / oHeight).toFixed(3);
                w = parseInt(scale * oWidth);
                h = maxH;
            }


            return {w: w, h: h, scale: scale};
        }
    };
    return img;

});

define('player/utils/playerEvent', ['model/logger'], function (_logger) {

    var _emptyFunc = function (obj) {
        _logger.debug('empty func invoke:');
        _logger.debug(obj);
    };

    var playerEvent = {
        _logger: _logger,
        _eventHandler: null,
        create: function () {
            var instance = $.extend({}, this);
            instance._eventHandler = {
                //答案事件
                answer: {
                    change: _emptyFunc
                },
                //图片事件
                image: {
                    click: _emptyFunc
                },
                //公式解析
                latex: {
                    onEnded: _emptyFunc
                },
                assessmentItem: {
                    optionClick: _emptyFunc
                },
                render: {
                    rendered: _emptyFunc,
                    renderChanged: _emptyFunc,
                    destroy: _emptyFunc,
                    resize: _emptyFunc
                },
                on: {
                    error: _emptyFunc
                }
            };
            return instance;
        },
        trigger: function (group, type, para) {
            this._logger.debug('player trigger event:' + group + '-' + type);
            this._eventHandler[group][type](para);
        },
        bind: function (group, type, callback) {
            if (this._eventHandler[group] && this._eventHandler[group][type] && $.type(callback) === 'function') {
                this._logger.debug('player bind event:' + group + '-' + type);
                this._eventHandler[group][type] = callback;
            }
        }
    };
    return playerEvent;
});

// qti model
define('player/utils/random', function () {


    var getRandomRange = function (n, m) {
        var c = m - n + 1;
        return Math.floor(Math.random() * c + n);
    }
    var getRandomArry = function (end, start) {
        var length = end + 1;
        if (typeof start != 'undefined' && start > 0) {
            length = end - start + 1;
        }


        var getRandomPri = function (randomEnd, arry) {
            var s = 0;
            if (typeof start != 'undefined' && start > 0) {
                s = start;
            }
            var rd = getRandomRange(s, randomEnd);
            var contain = false;
            for (var j = 0; j < arry.length; j++) {
                if (rd == arry[j]) {
                    contain = true;
                    break;
                }
            }
            if (contain) {
                getRandomPri(randomEnd, arry);
            } else {
                arry.push(rd);
            }
        };

        var arry = [];//随机索引
        for (var i = 0; i < length; i++) {
            getRandomPri(end, arry);
        }
        return arry;
    };

    var random = {
        getRandom: function (name) {
            var random = (Math.random() * 10 + new Date().getMilliseconds()).toString().replace(".", "");
            if (name) {
                return name + random;
            }
            return random;
        },
        getRandomRange: getRandomRange,
        //获取随机长度数组
        getRandomArray: function (length) {
            var order = [];
            var random = [];
            for (var i = 0; i < length; i++) {
                order[i] = i;
            }
            while (order.length) {
                var seed = Math.random();
                random.push(order.splice(Math.floor(seed * order.length), 1)[0]);
            }
            return random;
        },

        //数组乱序
        shuffleArray: function (array, randomSeed) {
            var result = array;
            if (randomSeed && randomSeed.length > 0) {
                result = [];
                var index;
                var value;
                for (var i = 0; i < randomSeed.length; i++) {
                    index = randomSeed[i];
                    value = array[index];
                    if (value) {
                        result.push(value);
                    }
                }
                for (var i = 0; i < array.length; i++) {
                    value = array[i];
                    if (result.indexOf(value) === -1) {
                        result.push(value);
                    }
                }
            } else {
                var j;
                var temp;
                for (var i = result.length - 1; i > 0; i--) {
                    j = Math.floor(Math.random() * (i + 1));
                    temp = result[i];
                    result[i] = result[j];
                    result[j] = temp;
                }
            }
            return result;
        },
        getAnswerRandom: function (end, start, answerRandom) {

            if (!start) {
                start = 0;
            }
            if (!answerRandom || !(answerRandom instanceof Array) || answerRandom.length <= 0) {
                return getRandomArry(end, start);
            } else {
                var arry = answerRandom;
                var resultArry = [];
                for (var i = 0; i < arry.length; i++) {
                    var ar = parseInt(arry[i]);
                    if (ar > end) {
                        continue;
                    }
                    if (typeof start != 'undefined' && ar < start) {
                        continue;
                    }
                    resultArry.push(ar);
                }
                if ((end + 1) > resultArry.length) {
                    for (var j = start; j < (end + 1); j++) {
                        var contain = false;
                        for (var k = 0; k < resultArry.length; k++) {
                            if (resultArry[k] == j) {
                                contain = true;
                                break;
                            }
                        }
                        if (!contain) {
                            resultArry.push(j);
                        }
                    }
                }
                return resultArry;
            }
        }
    };


    return random;

});

// qti model
define('player/utils/svg', function () {


    var svg = {
        twConstants: {
            DIALECT_SVG: 'svg',
            DIALECT_VML: 'vml',
            NS_SVG: 'http://www.w3.org/2000/svg',
            NS_XLINK: 'http://www.w3.org/1999/xlink'
        },
        getSVGDocument: function (svg) {
            if (!svg) return null;
            var result = null;
            var isIE = false;
            if (isIE) {
                if (svg.tagName.toLowerCase() == "embed") {
                    try {
                        result = svg.getSVGDocument();
                    } catch (e) {
                        alert(e + " may be svg embed not init");
                    }
                }
            } else {
                result = svg.ownerDocument;
            }
            return result;
        },
        getSVGRoot: function (svg, doc) {
            if (!svg) return null;
            if (svg.tagName.toLowerCase() == "embed") {
                if (doc) {
                    return doc.documentElement;
                } else {
                    return this.getSVGDocument(svg).documentElement;
                }
            } else if (svg.tagName.toLowerCase() == "svg") {
                return svg;
            }
            return null;
        },
        addLine: function (svgdoc, svgRoot, id, x1, y1, x2, y2, className, style) {
            var line = svgdoc.createElementNS(this.twConstants.NS_SVG, 'line');
            line.setAttribute("id", id);
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("style", style);
            line.setAttribute("class", className);
            svgRoot.appendChild(line);
            return line;
        },
        addImgLine: function (svgdoc, svgRoot, id, x1, y1, x2, y2, className, style, iscorrect, showForeignObject) {
            var line = svgdoc.createElementNS(this.twConstants.NS_SVG, 'line');
            line.setAttribute("id", id);
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("style", style);
            line.setAttribute("class", className);
            svgRoot.appendChild(line);

            if (showForeignObject) {
                var foreignObject = svgdoc.createElementNS(this.twConstants.NS_SVG, 'foreignObject');
                foreignObject.setAttribute("x", (parseInt(x1) + parseInt(x2)) / 2 - 19);
                foreignObject.setAttribute("y", (parseInt(y1) + parseInt(y2)) / 2 - 20);
                foreignObject.setAttribute("id", "foreignObject_" + id);
                foreignObject.setAttribute("height", "39px");
                foreignObject.setAttribute("width", "38px");
                var div = svgdoc.createElement('div');
                if (iscorrect) {
                    div.setAttribute("class", "qp-correct-answer");
                } else {
                    div.setAttribute("class", "qp-wrong-answer");
                }
                foreignObject.appendChild(div);
                svgRoot.appendChild(foreignObject);
            }
        }
    }
    return svg;

});

define('player/player', ['model/logger', 'player/utils/extendUtils'], function (_logger, _utils) {
    var _QtiPlayer = window.QtiPlayer;
    var Media;
    var AssessmentTest = require('player/assessment/assessmentTest');
    var PlayerEvent = require('player/utils/playerEvent');
    var ExtrasOption = require('player/config/extrasOption');
    var Option = require('player/config/option');
    var Exception = require('model/exception');

    //api
    var Player = {
        _event: null,
        _media: null,
        _assessmentTest: null,
        _option: null,
        _uuid: null,//渲染容器的标识
        create: function (option) {
            var instance = $.extend({}, this);
            //校验并纠正输入的渲染参数
            option = _utils.checkOption(option);
            //实例化配置
            var defaultOption = $.extend({}, Option, option);
            //实例化事件管理对象
            var event = PlayerEvent.create();
            //实例化多媒体对象
            var media;
            if (option.swfHost) {
                Media = require('player/media/eMedia');
                media = Media.create();
            } else {
                Media = require('player/media/media');
                media = Media.create();
            }
            //实例化assessmentTest对象
            var assessmentTest = AssessmentTest.create(defaultOption, event, media);
            //初始化属性
            instance._option = defaultOption;
            instance._event = event;
            instance._media = media;
            instance._assessmentTest = assessmentTest;
            return instance;
        },
        setOption: function (option) {
            $.extend(this._option, option);
        },
        load: function (url, callback) {
            var that = this;
            _QtiPlayer.load(url, that._option, function (assessmentItemModel) {
                that._assessmentTest.loadAssessmentItem(assessmentItemModel);
                if (callback) {
                    callback();
                }
            }, function (ex) {
                var e = Exception.create('load', ex);
                that._event.trigger('on', 'error', e);
            });
        },
        _render: function (obj, option, callback) {
            try {
                var type = $.type(obj);
                var $view = null;
                if (type === 'string') {
                    $view = $('#' + obj);
                } else if (type === 'object') {
                    if (obj instanceof jQuery) {
                        $view = obj;
                    } else {
                        $view = $(obj);
                    }
                }
                //设置一个唯一标识
                this._uuid = _utils.getUuid();
                $view.attr('data-qti-id', this._uuid);

                //深度克隆一个新对象
                var newOption = $.extend(true, {}, option);
                //校验并纠正输入的渲染参数
                newOption = _utils.checkOption(newOption);
                //补充默认配置
                $.extend(this._option, newOption);
                //处理extend时数组会合并的问题
                if (newOption.randomSeed && $.type(newOption.randomSeed) === 'array' && newOption.randomSeed.length > 0) {
                    this._option.randomSeed = newOption.randomSeed;
                }
                this._assessmentTest.render($view, this._option, callback);
            } catch (ex) {
                var e = Exception.create('render', ex);
                _logger.error('render异常', e);
                this._event.trigger('on', 'error', e);
            }
        },
        render: function (obj, option, callback) {
            this._render(obj, option, callback);
        },
        _destroy: function () {
            _QtiPlayer.closeCustomKeyBoard();
            _QtiPlayer.resetMedia();
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                assessmentItem.destroy();
            }
        },
        destroy: function () {
            this._destroy();
        },
        getModelType: function () {
            var modelType = {};
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                var itemModel = assessmentItem.getItemModel();
                var model;
                for (var modelId in itemModel.modelMap) {
                    model = itemModel.modelMap[modelId];
                    modelType[modelId] = model.modelType;
                }
            }
            return modelType;
        },
        // 获取支持的题目类型
        getSupportType: function () {
            return this._assessmentTest.getAssessmentItem().getSupportType();
        },
        // 获取该题型的具体类型
        getModelQuestionType: function () {
            var modelType = {};
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                var itemModel = assessmentItem.getItemModel();
                var model;
                for (var modelId in itemModel.modelMap) {
                    model = itemModel.modelMap[modelId];
                    modelType[modelId] = model.questionType;
                }
            }
            return modelType;
        },
        isMultipleModel: function () {
            var result = false;
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                var itemModel = assessmentItem.getItemModel();
                var num = 0;
                for (var modelId in itemModel.modelMap) {
                    num++;
                }
                if (num > 1) {
                    result = true;
                }
            }
            return result;
        },
        //获取分数
        getScore: function () {
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            return assessmentItem ? assessmentItem.getScore() : 0;
        },
        //设置分数
        _setScore: function (score) {
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            assessmentItem.setScore(score);
        },
        getAnswerState: function () {
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            return assessmentItem ? assessmentItem.getAnswerState() : {};
        },
        setAnswerState: function (answerState) {
            var result = false;
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                result = assessmentItem.setAnswerState(answerState);
            }
            return result;
        },
        getAnswer: function () {
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            return assessmentItem ? assessmentItem.getAnswer() : {};
        },
        answerOnChange: function (callback) {
            this._event.bind('answer', 'change', callback);
        },
        latexOnEnded: function (callback) {
            this._event.bind('latex', 'onEnded', callback);
        },
        answerOnClick: function (callback) {
            this._event.bind('assessmentItem', 'optionClick', callback);
        },
        getAssessmentModel: function () {
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            return assessmentItem ? assessmentItem.getItemModel() : {};
        },
        setAnswer: function (answer) {
            var result = false;
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                result = assessmentItem.setAnswer(answer);
                this._event.trigger('answer', 'change', assessmentItem.getAnswer());
            }
            return result;
        },
        setStat: function (stat) {
            var result = false;
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                result = assessmentItem.setStat(stat);
            }
            return result;
        },
        setTitleExtras: function (stat) {
            var result = false;
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                result = assessmentItem.setTitleExtras(stat);
            }
            return result;
        },
        getState: function () {
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            return assessmentItem ? assessmentItem.getState() : '';
        },
        setState: function (state) {
            var result = false;
            var assessmentItem = this._assessmentTest.getAssessmentItem();
            if (assessmentItem) {
                result = assessmentItem.setState(state);
                this._event.trigger('answer', 'change', assessmentItem.getAnswer());
            }
            return result;
        },
        mediaOnStart: function (callback) {
            this._media.mediaOnStart(callback);
        },
        mediaOnPause: function (callback) {
            this._media.mediaOnPause(callback);
        },
        mediaOnEnded: function (callback) {
            this._media.mediaOnEnded(callback);
        },
        mediaOnTimeupdate: function (callback) {
            this._media.mediaOnTimeupdate(callback);
        },
        mediaOnVolumeChange: function (callback) {
            this._media.mediaOnVolumeChange(callback);
        },
        mediaOnSeeked: function (callback) {
            this._media.mediaOnSeeked(callback);
        },
        mediaPlay: function (mediaType, index) {
            if (this._option.swfHost && arguments.length === 0) {
                this._media.mediaPlay();
            } else {
                this._media.mediaPlay(mediaType, index);
            }
        },
        mediaPause: function (mediaType, index) {
            if (this._option.swfHost && arguments.length === 0) {
                this._media.mediaPause();
            } else {
                this._media.mediaPause(mediaType, index);
            }
        },
        mediaPauseAll: function () {
            if (this._option.swfHost) {
                this._media.mediaPauseAll();
            } else {
                this._media.mediaPauseAll(this._getView());
            }
        },
        mediaSkip: function (mediaType, index, seeked) {
            if (this._option.swfHost) {
                this._media.mediaSkip();
            } else {
                this._media.mediaSkip(mediaType, index, seeked);
            }
        },
        mediaVolumeChange: function (mediaType, index, volume, display) {
            if (!this._option.swfHost) {
                this._media.mediaVolumeChange(mediaType, index, volume, display);
            }
        },
        _mediaOnFullScreenChange: function (callback) {
            this._media.mediaOnFullScreenChange(callback);
        },
        mediaOnFullScreenChange: function (callback) {
            this._media.mediaOnFullScreenChange(callback);
        },
        mediaOnFullScreen: function (callback) {
            this._media.mediaOnFullScreen(callback);
        },
        mediaOnFullScreenExit: function (callback) {
            this._media.mediaOnFullScreenExit(callback);
        },
        loadOnError: function (callback) {
            _QtiPlayer.loadOnError(callback);
        },
        imageOnClick: function (callback) {
            this._event.bind('image', 'click', callback);
        },
        //显示题目
        showQuestion: function (obj, identifiers) {
            var type = $.type(obj);
            var $view = null;
            if (type === 'string') {
                $view = $('#' + obj);
            } else if (type === 'object') {
                if (obj instanceof jQuery) {
                    $view = obj;
                } else {
                    $view = $(obj);
                }
            }

            if ($.type(identifiers) !== 'array') {
                identifiers = [];
            }

            if (identifiers.length === 0) {
                $view.find('._qp-model').show();
            } else {
                $view.find('._qp-model').each(function () {
                    var $model = $(this);
                    var hasIdentifier = false;
                    identifiers.forEach(function (identifier) {
                        if ($model.attr('data-model-id') === identifier) {
                            hasIdentifier = true;
                        }
                    });
                    if (hasIdentifier) {
                        $model.show();
                    } else {
                        $model.hide();
                    }
                });
            }
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
        },
        showAnswer: function () {
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
            this._assessmentTest.getAssessmentItem().showAnswer(this._getView());
        },
        showCheckedAnswer: function () {
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
            this._assessmentTest.getAssessmentItem().showCheckedAnswer(this._getView());
        },
        showUsrAndCorrectAnswer: function () {
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
            this._assessmentTest.getAssessmentItem().showUsrAndCorrectAnswer(this._getView());
        },
        showCorrectAnswer: function () {
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
            this._assessmentTest.getAssessmentItem().showCorrectAnswer(this._getView());
        },
        showStatisAnswer: function () {
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
            this._assessmentTest.getAssessmentItem().showStatisAnswer(this._getView());
        },
        showDefaultExtras: function (extrasOption) {
            extrasOption = $.extend(true, ExtrasOption, extrasOption);
            this._assessmentTest.getAssessmentItem().showDefaultExtras(this._getView(), extrasOption);
        },
        appendToExtras: function (appendView, appendModelId) {
            this._assessmentTest.getAssessmentItem().appendToExtras(this._getView(), appendView, appendModelId);
        },
        // 存储extraAnswer,为HTML字符串
        // extra格式为：{modelId:'Resopnse-1-1',extraHtml: '<div>这是图片信息</div>'}
        setExtrasAnswer: function (extra, isAppended) {
            this._assessmentTest.getAssessmentItem().setExtrasAnswer(this._getView(), extra, isAppended);
        },
        // 清空extraAnswer内容
        cleanExtrasAnswer: function (modelId) {
            this._assessmentTest.getAssessmentItem().cleanExtras(this._getView(), modelId);
        },
        // 获取满分值
        getFullScore: function (modelId) {
            return this._assessmentTest.getAssessmentItem().getFullScore(modelId);
        },
        // 设置满分值
        setFullScore: function (retrieveData) {
            this._assessmentTest.getAssessmentItem().setFullScore(retrieveData);
        },
        // 获取用户得分
        getUserScore: function (modelId) {
            return this._assessmentTest.getAssessmentItem().getUserScore(modelId);
        },
        // 设置用户得分
        setUserScore: function (retrieveData) {
            this._assessmentTest.getAssessmentItem().setUserScore(retrieveData);
        },
        reset: function () {
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
            this._assessmentTest.getAssessmentItem().reset(this._getView());
        },
        setLock: function (lockArea, lockMedia) {
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
            this._option.showLock = lockArea;
            this._assessmentTest._option.showLock = lockArea;
            this._assessmentTest.getAssessmentItem().setLock(this._getView(), lockArea);

            if (typeof lockMedia !== typeof  undefined) {
                this.lockMedia(lockMedia, this._getView());
            }
        },
        setHintVisible: function (visible) {
            _QtiPlayer.resetMedia();
            _QtiPlayer.closeCustomKeyBoard();
            var $view = this._getView();
            this._option.showHint = visible;
            this._assessmentTest._option.showHint = visible;
            if (visible) {
                $view.find('._hint-pop-btn').removeClass('nqti-hide-dom');
            } else {
                $view.find('._hint-pop-btn').addClass('nqti-hide-dom');
            }
        },
        lockMedia: function (lock, view) {
            this._media.setLock(lock, view);
        },
        _getView: function () {
            return $('[data-qti-id="' + this._uuid + '"]');
        },
        on: function (key, callback) {
            this._event.bind('on', key, callback);
        }
    };
    return Player;
});

//qti主入口
define('player/qtiPlayer', ['model/qtiModel'], function () {
    var _QtiPlayer = window.QtiPlayer;
    if (!_QtiPlayer) {
        throw '请先加载qti-model';
    }

    var Player = require('player/player');
    var modelHandlerFactory = require('player/model/modelHandlerFactory');
    var baseInteraction = require('player/cls/baseInteraction');
    var Class = require('player/cls/class');

    //全局api
    //获取qtiplayer实例
    _QtiPlayer.createPlayer = function (option) {
        return _QtiPlayer._createPlayer(option);
    };

    _QtiPlayer._createPlayer = function (option) {
        var player = Player.create(option);
        return player;
    };
    //注册modelHandler
    _QtiPlayer.registerModelHandler = function (modelHandler) {
        modelHandlerFactory.register(modelHandler);
    };

    _QtiPlayer.BaseInteraction = baseInteraction;
    _QtiPlayer.Class = Class;

    //扩展键盘,关闭自定义的键盘
    _QtiPlayer.closeCustomKeyBoard = function () {
        //关闭DigitalInput数字键盘
        if (typeof DigitalInput !== 'undefined' && DigitalInput.InputManager && DigitalInput.InputManager.getInstance) {
            var instance = DigitalInput.InputManager.getInstance();
            if (instance && instance.closeKeyBoard) {
                instance.closeKeyBoard();
            }
        }
    };

    _QtiPlayer.resetMedia = function () {
        if (window.NDMediaPlayer && window.NDMediaPlayer.reset) {
            window.NDMediaPlayer.reset();
        }
    }

});

//qti主入口初始化
require('player/qtiPlayer');

(function ($) {

    $.support.touch = 'ontouchend' in document;
    $.support.mobile = navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i) ? true : false;
    var vEventHandler = {};
    if ($.support.touch && $.support.mobile) {
        //拥有触屏事件
        vEventHandler.mouseDown = 'touchstart';
        vEventHandler.mouseUp = 'touchend';
        vEventHandler.mouseWheel = 'touchmove';
        vEventHandler.getEventX = function (event) {
            return event.originalEvent.changedTouches[0].clientX;
        };
        vEventHandler.getEventY = function (event) {
            return event.originalEvent.changedTouches[0].clientY;
        };
    } else {
        //没有触屏幕事件
        vEventHandler.mouseDown = 'mousedown';
        vEventHandler.mouseUp = 'mouseup';
        vEventHandler.mouseWheel = 'mousewheel';
        vEventHandler.getEventX = function (event) {
            return event.clientX;
        };
        vEventHandler.getEventY = function (event) {
            return event.clientY;
        };
    }
    //解决fixed布局，touch事件无效bug http://stackoverflow.com/questions/8809706/ios-5-safari-bug-with-html-touch-events-on-positionfixed-div
    $.support.fixed = function () {
        var bodys = document.getElementsByTagName("body");
        if (bodys && bodys.length > 0) {
            $(bodys[0]).on("touchstart", function () {
            });
        }
        $.support.fixed = true;
    };
    $.support.fixed();
    //点击事件
    $.event.special.qpTap = {
        setup: function () {
            var $that = $(this);
            //$that.unbind('click');
            if ($.support.touch&& $.support.mobile) {
                if ($.support.fixed !== true) {
                    $.support.fixed();
                }
                var vMouseDown = vEventHandler.mouseDown;
                var vMouseUp = vEventHandler.mouseUp;
                //$that.unbind(vMouseUp).unbind(vMouseDown);
                var _start = 0;
                var _startX = 0;
                var _startY = 0;
                $that.bind(vMouseDown, function (event) {
                    if (event.which !== 0 || event.which !== 1) {
                        _start = new Date().getTime();
                        _startX = vEventHandler.getEventX(event);
                        _startY = vEventHandler.getEventY(event);
                    }
                });
                $that.bind(vMouseUp, function (event) {
                    if (event.which !== 0 || event.which !== 1) {
                        var end = new Date().getTime();
                        var endX = vEventHandler.getEventX(event);
                        var endY = vEventHandler.getEventY(event);
                        var holdTime = end - _start;
                        var dx = Math.abs(endX - _startX);
                        var dy = Math.abs(endY - _startY);
                        if (holdTime <= 850 && dx < 6 && dy < 6) {
                            //触发tap事件
                            event = $.event.fix(event);
                            event.type = 'qpTap';
                            $that.triggerHandler(event);
                        }
                    }
                });
            } else {
                $that.bind('click', function (event) {
                    //触发tap事件
                    event = $.event.fix(event);
                    event.type = 'qpTap';
                    $that.triggerHandler(event);
                });
            }
        },
        teardown: function () {
            var vMouseDown = vEventHandler.mouseDown;
            var vMouseUp = vEventHandler.mouseUp;
            var $that = $(this);
            $that.unbind(vMouseUp).unbind(vMouseDown);
        }
    };
    $.fn.qpTap = function (callback) {
        return this.bind('qpTap', callback);
    };
    //滚动事件
    $.event.special.qpMouseWheel = {
        setup: function () {
            var $that = $(this);
            if ($.support.touch && $.support.mobile) {
                var _startY = 0;
                $that.unbind('touchstart').unbind('touchmove');
                $that.bind('touchstart', function (event) {
                    _startY = event.originalEvent.changedTouches[0].pageY;
                });
                $that.bind('touchmove', function (event) {
                    var currentY = event.originalEvent.changedTouches[0].pageY;
                    if (currentY !== _startY) {
                        event = $.event.fix(event);
                        event.type = 'qpMouseWheel';
                        event.deltaY = currentY - _startY;
                        //触发qpMouseWheel事件
                        $that.trigger(event);
                        _startY = currentY;
                    }
                });
            } else {
                $that.unbind('mousewheel');
                $that.bind('mousewheel', function (event) {
                    event = $.event.fix(event);
                    event.type = 'qpMouseWheel';
                    event.deltaY = event.originalEvent.deltaY;
                    //触发qpMouseWheel事件
                    $that.trigger(event);
                });
            }
        },
        teardown: function () {
            var $that = $(this);
            if ($.support.touch && $.support.mobile) {
                $that.unbind('touchstart').unbind('touchmove');
            } else {
                $that.unbind('mousewheel');
            }
        }
    };
    $.fn.qpMouseWheel = function (callback) {
        return this.bind('qpMouseWheel', callback);
    };
    $.fn.qpStopMouseWheel = function () {
        this.bind(vEventHandler.mouseWheel, function (event) {
            event.preventDefault();
        });
    };
})(jQuery);

/**
 * ccy 拖动
 * @date 2015.06.16
 * @param $
 */
(function ($) {
  'use strict';

  var Draggable,
  	//__bind用处，当对象相互调用传递方法：如 将a对象的f方法传递给b对象当属性 b={bf:a.f} ; b.bf()的this是b
	//如果 a.f = __bind(a.f,a) ;  b={bf:a.f} ;b.bf()的this是a ;
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

    var getScale = function ($dom) {
        if ($dom && $dom.length > 0) {
            var offWidth = $dom[0].offsetWidth;
            return (offWidth > 0 ? ($dom[0].getBoundingClientRect().width / offWidth) : 1) || 1;
        }
        return 1;
    };

  Draggable = (function() {



    function Draggable($container, options) {

      this.click = __bind(this.click, this);
      this.moved = __bind(this.moved, this);
      this.ended = __bind(this.ended, this);
      this.began = __bind(this.began, this);
      this.coordinate = __bind(this.coordinate, this);
      this.off = __bind(this.off, this);
      this.on = __bind(this.on, this);
      this.toggle = __bind(this.toggle, this);
      this.bind = __bind(this.bind, this);
      this.$container = $container;
      this.getElements = __bind(this.getElements, this);
      this.resetElements = __bind(this.getElements, this);
      this.options = $.extend({},Draggable.DEFAULTS,options);
      this.$elements =  this.$container.find( this.options.selector );
      if(  this.$elements.length === 0 ) return ;

	  this.elementOpts = {
	    		  count : this.$elements.length,
	    		  width : this.$elements.eq(0).width(),
	    		  height: this.$elements.eq(0).height()
	  };

      this.toggle();


    }

    Draggable.DEFAULTS = {
    		"z-index":999,
    		opacity: "0.8",
    		version:"0.01",
    		selector:' [data-toggle="draggable"]'
    };

    Draggable.prototype.getElements = function() {
    	return this.$container.find( this.options.selector );
    };
    //重置拖动元素
    Draggable.prototype.resetElements = function() {
    	delete this.$elements ;
    	this.$elements = this.getElements() ;
    	return this.$elements;
    };

    //处理鼠标移动，鼠标键松开事件
    Draggable.prototype.bind = function(method) {
      if (method == null) {
        method = 'on';
      }
      this.$container[method]('mousemove touchmove', this.moved);
      return this.$container[method]('mouseup mouseleave touchend touchcancel', this.ended);
    };

    Draggable.prototype.toggle = function(method) {
      if (method == null) {
        method = 'on';
      }

      this.$container[method]('mousedown touchstart',this.options.selector, this.began);
      return this.$container[method]('click', this.options.selector, this.click);
    };

    Draggable.prototype.on = function() {
      return this.toggle('on');
    };

    Draggable.prototype.off = function() {
      return this.toggle('off');
    };

    Draggable.prototype.coordinate = function(event) {
      switch (event.type) {
        case 'touchstart':
        case 'touchmove':
        case 'touchend':
        case 'touchcancel':
          return event.originalEvent.touches[0];
        default:
          return event;
      }
    };
    //鼠标点击开始
    Draggable.prototype.began = function(event) {
        this.bodyRect = {
            height: $(document.body).height(),
            width: $(document.body).width()
        };
      var _ref;
      if( this.$container.data("disabled")==="disabled" ||  this.$container.data("disabled")==="true" ){
    	return ;
      }
      if (this.$target) {
        return;
      }
        if (!this.scale) {
            this.scale = getScale(this.$container);
        }
      //event.preventDefault();
      //event.stopPropagation();
      //绑定鼠标移动，鼠标松开事件
      this.bind('on');
      this.$target = $(event.target).closest( '[data-toggle="draggable"]');


  	  if( !this.containerOpts || this.containerOpts.width !==  this.$container.width() ){
		  this.containerOpts = {
	    		  width : this.$container.width(),
	      		  height: this.$container.height()
	      };
      }

      //计算行列数
  	  if( this.$elements.length>1 ){

	  	  var fPosition = this.$elements.first().position() ;
	  	  var sPosition = this.$elements.eq(1).position() ;
	  	  var lPosition = this.$elements.last().position() ;

	  	  var spaceWidth= sPosition.left-fPosition.left - this.elementOpts.width;
	  	  this.elementOpts.columns = 	 Math.floor( ( this.containerOpts.width -this.elementOpts.width-spaceWidth/2)/(sPosition.left-fPosition.left)+1 );
	  	  this.elementOpts.rows =  Math.ceil( this.elementOpts.count / this.elementOpts.columns );
	  	  //console.log( spaceWidth+"|"+this.containerOpts.width +"|"+ this.elementOpts.columns  +"||"+ this.elementOpts.rows )
  	  }else {
  		//0个元素 0列0行，1同
  		this.elementOpts = {
  				columns:this.$elements.length,
  				rows:this.$elements.length
  		};
  	  }
      //console.log("||--拖动点击前的位置--"+this.$target.position().left+"|"+this.$target.position().top);
      //设置拖动对象样式前要先占位 修复拖动时，添加了新元素导致的换行问题
      var position=this.$target.position();
      this.$target.css({
        "position" : "absolute"
      });
      this.$placeHolder = $(this.$target[0].outerHTML).css({visibility: "hidden","position" : ""});
      this.$target.after(this.$placeHolder);
      this.resetElements();
      this.$target.css({
        "position" : "absolute",
        left:position.left/this.scale,
        top:position.top/this.scale,
        opacity:this.options.opacity
      });

  	  if ( (/^(?:a|\d)/).test(this.$target.css("z-index")) ) {
  		this.$target[0].style["z-index"] = "999";
      }
      this.$target.addClass('on');

      this.origin = {
        x: this.coordinate(event).pageX - this.$target.position().left ,
        y: this.coordinate(event).pageY - this.$target.position().top
      };

      return (_ref = this.options) != null ? typeof _ref.began === "function" ? _ref.began(event) : void 0 : void 0;
    };

    //鼠标拖动
    Draggable.prototype.moved = function(event) {
        var coor=this.coordinate(event);
        if (event.type === 'touchmove' &&
            (Math.abs(coor.clientY - this.bodyRect.height) <= 15 ||
                Math.abs(coor.clientX - this.bodyRect.width) <= 15 ||
                coor.clientX <= 15 ||
                coor.clientY <= 15
            )) {
            //console.log(this.coordinate(event), this.bodyRect);
            this.ended(event);
            return;
        }
      //console.log(" Draggable.prototype.moved ...............")
      var _ref;
      if (this.$target == null) {
        return;
      }
      event.preventDefault();
      //event.stopPropagation();
      this.$target.css({
        left: (this.coordinate(event).pageX - this.origin.x)/this.scale,
        top: (this.coordinate(event).pageY - this.origin.y)/this.scale
      });

      //计算拖动元素需插入的位置，当交互面积最大，且是矩形元素的四分一面积以上的时候做插入
      var maxIndex = -1 , maxArea = -1  ;
      var $target = this.$target ;
      var tarPos = this.$target.position() ;
        if (this.elementOpts.width == 0) {
            this.elementOpts.width = this.$elements.eq(0).width()
        }
      var eleWidth = this.elementOpts.width;
      var eleHeight = this.elementOpts.height;
      var overArea = eleWidth * eleHeight / 4 ;
      var placeHolderIndex = this.$placeHolder.index() ;

      this.$elements = this.getElements();
	  this.$elements.each(function(i){
		  if($target.index() === i ) {
			  return ;
	      }
		  var tempPos = $(this).position();

		  if( Math.abs( tarPos.left - tempPos.left ) > eleWidth || Math.abs( tarPos.top - tempPos.top ) > eleHeight ) return ;
		  //console.log("width****"+tarPos.left +"||"+ tempPos.left + "||" + eleWidth )
		 // console.log( "height***"+tarPos.top +"||"+tempPos.top + "||" + eleHeight )
		  var tempW = tarPos.left - tempPos.left ;
		  var tempH = tarPos.top - tempPos.top ;

		  tempW = tempW <= 0 ? tempW + eleWidth :  tempW = eleWidth - tempW ;
		  tempH = tempH <= 0 ? tempH + eleHeight : eleHeight - tempH ;

		  var tempA = tempW * tempH ;
		  //console.log( "area---" + tempW + "|| "+tempH+"|"+ maxArea +"||"+overArea+"||" +tempA )
		  if( maxArea < tempA  && overArea <= tempA ){
			  maxArea = tempA ;
			  maxIndex = i ;

		  }

	  });

	  if( maxIndex !== -1 ) {
		  if( this.$placeHolder.index() !== maxIndex ){
			  var $tempEle = this.$elements.eq(maxIndex) ;
			  var isAfter = this.$placeHolder.index() < $tempEle.index() ? true : false ;
			  if(isAfter){
				  this.$elements.eq(maxIndex).after(this.$placeHolder) ;
			  }else {
				  this.$elements.eq(maxIndex).before(this.$placeHolder) ;
			  }
			  this.$elements = this.$container.find( this.options.selector );
		  }
	  }
	  //计算拖动元素需插入的位置 end

      //当前拖拽的对象
      this.dragged = this.$target;
      return (_ref = this.options) != null ? typeof _ref.moved === "function" ? _ref.moved(event) : void 0 : void 0;
    };

    Draggable.prototype.ended = function(event) {
        var _ref;
        if (this.$target == null) {
          return;
        }

        //event.preventDefault();
        //event.stopPropagation();
        this.bind('off');
        this.$placeHolder.before( this.$target) ;
        this.$target.removeClass('on');

        this.$target.attr("style",this.$placeHolder.attr("style")) ;
        this.$placeHolder.remove();
        this.$target.css({"visibility":""});

        delete this.$target;
        delete this.$placeHolder ;
        delete this.origin;
        this.$elements =  this.resetElements();


        return (_ref = this.options) != null ? typeof _ref.ended === "function" ? _ref.ended(event) : void 0 : void 0;
    };

    Draggable.prototype.click = function(event) {
      if (!this.dragged) {
        return;
      }
      //event.preventDefault();
      //event.stopPropagation();
      return delete this.dragged;
    };


    return Draggable;

  })();


  function Plugin(option) {

	option = option || {} ;
    return this.each(function () {
      var $this   = $(this) ;
      if(typeof option  === "string"){
    	  $this.data('disabled',option) ;
    	  return ;
      }
  	  //console.log($this.css("z-index"));


      var data    = $this.data('my.draggable') ;
      var options = $.extend({}, $this.data(), typeof option == 'object' && option)
      //插件缓存
      if (!data){
    	  data = new Draggable($this) ;
    	  $this.data('my.draggable', data);
      }

    });
  }

  $.fn.draggabled             = Plugin ;
  $.fn.draggabled.Constructor = Draggable  ;

})(jQuery);

/**
 * ccy 排序拖动
 * @date 2015.06.16
 * @param $
 * @depend jquery,query.draggable.js
 */
(function ($) {
  'use strict';

  var Dragsort,
  	//__bind用处，当对象相互调用传递方法：如 将a对象的f方法传递给b对象当属性 b={bf:a.f} ; b.bf()的this是b
	//如果 a.f = __bind(a.f,a) ;  b={bf:a.f} ;b.bf()的this是a ;
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

  Dragsort = (function() {

    function Dragsort($container, options) {
    	//将当前this存放入各个方法中
        this.draggingMoved = __bind(this.draggingMoved, this);
        this.draggingEnded = __bind(this.draggingEnded, this);
        this.draggingBegan = __bind(this.draggingBegan, this);
        this.draggable = __bind(this.draggable, this);
        this.$ = __bind(this.$, this);
        //end

        this.options = $.extend({}, Dragsort.DEFAULTS, options);
        this.$container = $container ;
        this.$elements = this.$(this.options.draggable.selector) ;
        this.$elements.each(function(){
        	var $ele = $(this) ;
        	if(!$ele.attr("data-toggle")){
        		$ele.attr("data-toggle","draggable");
        	}
        });
        this.options.tagName = this.$elements.length>0? this.$elements.get(0).tagName.toLowerCase() :"div" ;
        //this.ordinalize(this.$('> *'));
        if (this.options.draggable !== false) {
          this.draggable();
        }
        return this;

    }

    Dragsort.DEFAULTS = {
    	base: 60,
	    gutter: 20,
	    columns: 12,
	    draggable: {
	        zIndex: 999,
	        selector: '> *'
	    },
	    placeHolderTemplate:""

    };

    Dragsort.prototype.$ = function(selector) {
        return this.$container.find(selector);
    };

    Dragsort.prototype.draggable = function(method) {
        if (this._draggable == null) {
          this._draggable = new  $.fn.draggabled.Constructor(
        	  this.$container,
	          {
	        	  id  	  : this.options.id,
	        	  selector: this.options.draggable.selector,
	           // began: this.draggingBegan,
	            ended: this.draggingEnded
	           // moved: this.draggingMoved
	          }
          );
        }
        if (method != null) {
          // return this._draggable[method]();
        }
    };



    Dragsort.prototype.draggingBegan = function(event) {

    };

    Dragsort.prototype.draggingEnded = function(event) {
      var  _ref, _update;

      return (_ref = this.options) != null ? ( _update = this.options.update) != null ? typeof _update === "function" ? _update(event) : void 0 : void 0 : void 0;
    };

    Dragsort.prototype.draggingMoved = function(event) {

    };
    return Dragsort;

  })();


  function Plugin(option) {
	option = option || {} ;
    return this.each(function () {
      var $this   = $(this) ;

      if(typeof option  === "string"){
    	  $this.data('disabled',option) ;
    	  return ;
      }
      if(option.disabled){
    	  $this.data('disabled',option.disabled) ;
    	  return
      };
      if(!$this.attr("id")){
    	  $this.attr("id","dragsort");
      }
      //console.log( $this.attr("id"))
      option.id = $this.attr("id") ;

      //position非relative , absolute, fixed ,则默认取 relative
  	  if (!(/^(?:r|a|f)/).test($this.css("position"))) {
  		this.style.position = "relative";
	  }
      var data    = $this.data('my.dragsort') ;
      var options = $.extend({}, $this.data(), typeof option == 'object' && option)
      //插件缓存
      if (!data){
    	  data = new Dragsort($this,options) ;
    	  $this.data('my.dragsort', data);
      }

    });
  }

  $.fn.dragsort             = Plugin ;
  $.fn.dragsort.Constructor = Dragsort  ;

})(jQuery);


// choiceInteraction
(function (window, $) {
    var _utils = window.QtiPlayer.getUtils();
    //创建
    var _modelHandler = {
        _name: 'choiceInteraction',
        //获取model名称
        getName: function () {
            return this._name;
        },
        //创建渲染的方法
        create: function (modelItem) {
            //获取模型数据
            var _model = modelItem.getModel();

            var _renderAnswer = function (answer, correctAnswer, $option, showChecked) {
                if (answer) {
                    //渲染作答
                    $option.each(function () {
                        var $this = $(this);
                        for (var index = 0; index < answer.length; index++) {
                            if ($this.attr('identifier') === answer[index]) {
                                if (_modelHandler.isElearningSkin) {
                                    //elearning皮肤走原来流程
                                    $this.addClass('nqti-option-on');
                                    if (showChecked) {
                                        if (correctAnswer.indexOf(answer[index]) > -1) {
                                            $this.addClass('nqti-option-right');
                                        } else {
                                            $this.addClass('nqti-option-wrong');
                                        }
                                    }
                                    break;
                                } else {
                                    $this.addClass('nqti-option-on');
                                    //显示用户反馈
                                    if (showChecked) {
                                        if (correctAnswer.indexOf(answer[index]) > -1) {
                                            $this.addClass('nqti-option-right');
                                        } else {
                                            $this.addClass('nqti-option-wrong');
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    });
                }
            };

            // 保持原有的流程，为elearning皮肤单独提供同时显示用户答案和正确答案的接口
            var _renderCorrectAnswerNoneGrayBg = function (answer, correctAnswer, $option, showChecked) {
                if (answer) {
                    //渲染作答
                    $option.each(function () {
                        var $this = $(this);
                        for (var index = 0; index < answer.length; index++) {
                            if ($this.attr('identifier') === answer[index]) {
                                if (_modelHandler.isElearningSkin) {
                                    if (showChecked) {
                                        if (correctAnswer.indexOf(answer[index]) > -1) {
                                            $this.addClass('nqti-option-right');
                                        } else {
                                            $this.addClass('nqti-option-wrong');
                                        }
                                    }
                                    break;
                                } else {
                                    console.warn("非elearning皮肤，不支持同时显示用户答案和正确答案...");
                                }
                            }
                        }
                    });
                }
            };

            //返回题目类型名称
            modelItem.getName = function () {
                var simpleChoice = _model.simpleChoice;
                if (simpleChoice.length === 2) {
                    var option1 = simpleChoice[0].identifier.toLowerCase();
                    var option2 = simpleChoice[1].identifier.toLowerCase();
                    if (option1 === 'yes' && option2 === 'no') {
                        return _utils.getLangText('true_or_false', this.getOption());
                    }
                }
                return _model.maxChoices === 1 ? _utils.getLangText('single_choise', this.getOption()) : _utils.getLangText('multiple_choise', this.getOption());
            };
            modelItem.getClassName = function (option) {
                var name = 'nqti-base-choice';
                if (option.screenshotLayout && _model.maxChoices === 1) {
                    name = 'nqti-player-srcm-body';
                }
                return name;
            };
            //返回标题片段
            modelItem.createTitleHtml = function () {
                return _model.prompt;
            };
            //普通类答案渲染
            modelItem._createCommonAnswerHtml = function (isJudgment, option) {
                var result = '';
                var simpleChoice = _model.simpleChoice;
                if (isJudgment) {
                    //判断
                    result += '<ul class="nqti-base-judment-list">';
                } else if (_model.maxChoices === 1) {
                    //单选
                    result += '<ul class="nqti-base-choice-list">';
                } else {
                    //多选
                    result += '<ul class="nqti-base-choice-multiple">';
                }
                var object;
                for (var i = 0; i < simpleChoice.length; i++) {
                    object = simpleChoice[i];
                    result += '<li class="nqti-option _qp-option" data-index="' + i + '" identifier="' + object.identifier + '">';
                    if (isJudgment || _model.maxChoices === 1) {
                        result += '<i class="nqti-option-radio-icon"></i>';
                    } else {
                        result += '<i class="nqti-option-checkbox-icon"></i>';
                    }
                    result += '<span class="nqti-check">';
                    if (isJudgment === false) {
                        result += '<em class="size">' + object.identifier + '</em>';
                    }
                    result += '</span>'
                        + '<div class="nqti-content"><em class="size">' + object.content + '</em></div>'
                        + '</li>';
                }
                result += '</ul>';
                return result;
            };
            //截图类答案渲染(单选、判断)
            modelItem._createScreenshotAnswerHtml = function (isJudgment, option) {
                var result = '';
                var tipText = _utils.getLangText('choice_screenshot_title', option);
                var simpleChoice = _model.simpleChoice;
                result += '<div class="nqti-srcm-layout-options">'
                    + '<p class="nqti-com-layout-title-answer">'
                    + '<span class="nqti-txt">' + tipText + ' :</span>';
                var object;
                var optionId;

                for (var i = 0; i < simpleChoice.length; i++) {
                    object = simpleChoice[i];
                    optionId = object.identifier;
                    if (isJudgment) {
                        optionId = object.content;
                    }
                    result += '<label class="nqti-com-btn-radio _qp-option" data-index="' + i + '" identifier="' + object.identifier + '">'
                        + '<i class="nqti-option-radio-icon"></i><span class="nqti-txt">' + optionId + '</span>'
                        + '</label>';
                }
                result += '</p></div>';
                return result;
            };
            //返回答案片段
            modelItem.createAnswerHtml = function (option) {
                var simpleChoice = _model.simpleChoice;
                //是否判断题
                var isJudgment = false;
                if (simpleChoice.length === 2) {
                    var option1 = simpleChoice[0].identifier.toLowerCase();
                    var option2 = simpleChoice[1].identifier.toLowerCase();
                    if (option1 === 'yes' && option2 === 'no') {
                        isJudgment = true;
                    }
                }
                var result = '';
                if (option.screenshotLayout) {
                    if (isJudgment || _model.maxChoices === 1) {
                        //判断或则单选
                        result = this._createScreenshotAnswerHtml(isJudgment, option);
                    } else {
                        //多选，普通模式渲染
                        result = this._createCommonAnswerHtml(isJudgment, option);
                    }
                } else {
                    result = this._createCommonAnswerHtml(isJudgment, option);
                }
                return result;
            };
            //动态渲染
            modelItem.render = function ($view, option) {
                var that = this;
                _modelHandler.isElearningSkin = option.isElearningSkin;
                var $option = $view.find('._qp-option');
                //填空点击回调
                $option.bind('qpTap', function () {
                    var val = $(this).attr('identifier');
                    var index = $(this).data('index');
                    that.triggerOptionClick(index, val);
                });
            };
            //交互事件处理
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var $option = $view.find('._qp-option');
                var getAnswer = function () {
                    var answer = [];
                    $option.each(function () {
                        var $this = $(this);
                        if ($this.hasClass('nqti-option-on')) {
                            answer.push($this.attr('identifier'));
                        }
                    });
                    return answer;
                };
                $option.each(function () {
                    var $this = $(this);
                    $this.bind('qpTap', function () {
                        if (that.isLock()) {
                            return;
                        }
                        if (_model.maxChoices === 1) {
                            //单选
                            if ($this.hasClass('nqti-option-on') === false) {
                                $option.each(function () {
                                    $(this).removeClass('nqti-option-on');
                                });
                                $this.addClass('nqti-option-on');
                            }
                        } else {
                            //多选
                            if ($this.hasClass('nqti-option-on')) {
                                $this.removeClass('nqti-option-on');
                            } else {
                                $this.addClass('nqti-option-on');
                            }
                        }
                        that.setAnswer(getAnswer());
                    });
                });
            };

            modelItem.renderReset = function ($view) {
                //do nothing
                var $options = $view.find('._qp-option');
                $options.each(function () {
                    var $this = $(this);
                    $this.removeClass('nqti-option-on');
                    $this.removeClass('nqti-option-right');
                    $this.removeClass('nqti-option-wrong');
                });
            };


            modelItem.renderAnswer = function ($view) {
                _renderAnswer(this.getAnswer(), this.getCorrectAnswer(), $view.find('._qp-option'), false);
            };

            modelItem.renderCheckedAnswer = function ($view) {
                _renderAnswer(this.getAnswer(), this.getCorrectAnswer(), $view.find('._qp-option'), true);
            };

            modelItem.renderCorrectAnswer = function ($view) {
                _renderAnswer(this.getCorrectAnswer(), this.getCorrectAnswer(), $view.find('._qp-option'), true);
            };

            modelItem.renderCorrectAnswerNoneGrayBg = function ($view) {
                _renderCorrectAnswerNoneGrayBg(this.getCorrectAnswer(), this.getCorrectAnswer(), $view.find('._qp-option'), true);
            };

            modelItem.renderLock = function ($view) {

            };
        }
    };
    //注册
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


// choiceInteraction_vote
(function (window, $) {

    var _utils = window.QtiPlayer.getUtils();
    //创建
    var _modelHandler = {
        _name: 'choiceInteraction_vote',
        //获取model名称
        getName: function () {
            return this._name;
        },
        //创建渲染的方法
        create: function (modelItem) {
            //获取数据模型
            var _model = modelItem.getModel();

            //选项单字文本标识
            var _singleText = true;
            //非单字文本，且投票项超过8个
            var _tooManyOptions = false;
            //正则
            var imageRegex = /<img[\s\S]*?\/>/g;
            var imageSrcRegex = /src="([\s\S]*?)"/;
            var contentTextRegex = /<p[\s\S]*?>([\s\S]*)<\/p>/;
            //特殊字符判断&<>
            var specifiedCharacterRegex = /^&(gt|lt|amp);$/i;

            //选项数据处理
            var simpleChoice = _model.simpleChoice;
            var choice;
            var choiceText;
            for (var index = 0; index < simpleChoice.length; index++) {
                choice = simpleChoice[index];
                //编号处理
                choice.identifier = choice.identifier.replace('ndvote_', '');
                //图片内容处理,只取最后一个img的内容，其他img的内容全部清空。清空图片后剩下的都是文字内容
                var image = '';
                choice.content = choice.content.replace(imageRegex, function (imageHtml) {
                    //设置图片期望高宽属性
                    var imageSrc = _utils.getValue(imageHtml, imageSrcRegex);
                    image = '<img data-media-img-render="false" src="' + imageSrc + '" alt=""/>';
                    return '';
                });
                choice.image = image;
                //提取图片后判断是否还有文字
                //替换掉html的空格编码
                choiceText = _utils.getValue(choice.content, contentTextRegex).trim();
                choice.content = choiceText;
                //判断是否单字文本
                if (choice.image !== '' || (choiceText.length !== 1 && !specifiedCharacterRegex.test(choiceText))) {
                    _singleText = false;
                }
                //判断是否是空文本
                if (choiceText === '') {
                    choice.content = '';
                }
            }
            //判断是否有太多的选项
            if (_singleText === false && simpleChoice.length > 8) {
                _tooManyOptions = true;
            }
            //返回题目类型名称
            modelItem.getName = function () {
                return _utils.getLangText('voting',this.getOption()) ;
            };
            modelItem.getClassName = function () {
                return 'nqti-vote';
            };
            //该model没有提示
            modelItem.hasHint = function () {
                return false;
            };
            //返回标题片段
            modelItem.createTitleHtml = function (option) {
                var sigleitem = _utils.getLangText('vote_sigleitem', option);
                var mutipleitem = _utils.getLangText('vote_mutipleitem', option);
                //标题处理，增加单项投票和不定项投票提示
                var prefix = '<div>(' + sigleitem + ')</div>';
                if (_model.maxChoices !== 1) {
                    prefix = '<div>(' + mutipleitem + ')</div>';
                }
                return prefix + _model.prompt;
            };
            //返回答案片段
            modelItem.createAnswerHtml = function (option) {
                var optionHtml = '';
                var tipPre = _utils.getLangText('vote_tip_pre', option);
                var tipEnd = _utils.getLangText('vote_tip_end', option);
                var simpleChoice = _model.simpleChoice;
                var choice;
                //选项布局类型
                //是否增加选项过多提示
                if (_tooManyOptions) {
                    optionHtml += '<div class="nqti-base-vote-hint">'
                            + '<span class="nqti-base-vote-txt">'
                            + tipPre + simpleChoice.length + tipEnd
                            + '</span></div>';
                }
                var ulClass = 'nqti-fixed';
                //单字文本去除nqti-fixed样式
                if (_singleText) {
                    ulClass = '';
                }
                optionHtml += '<ul class="nqti-base-vote-list ' + ulClass + '">';
                var liHtml;
                for (var index = 0; index < simpleChoice.length; index++) {
                    choice = simpleChoice[index];
                    if (_singleText) {
                        liHtml = '<span class="nqti-base-vote-list-txt">' + choice.content + '</span>';
                    } else {
                        if (choice.image.length > 0) {
                            //有图片
                            liHtml = choice.image;
                            if (choice.content.length > 0) {
                                liHtml += '<p class="nqti-base-vote-list-desc">'
                                        +'<i class="opacity_black_bg" style="display: none;"></i>'
                                        + '<sapn class="nqti-base-vote-list-desc-txt">'
                                        + choice.content
                                        + '</span>'
                                        + '</p>';
                            }
                        } else {
                            liHtml = '<p class="nqti-base-vote-list-txt">' + choice.content + '</p>';
                        }
                    }
                    var iconText = choice.identifier;
                    //获取统计信息
                    if (option.showStat) {
                        var stat = this.getStat();
                        if (typeof stat[iconText] !== typeof undefined && stat[iconText] !== '') {
                            iconText = iconText + '(' + stat[iconText] + ')';
                        }
                    }
                    optionHtml += '<li class="nqti-base-vote-list-cell _qp-option" data-identifier="' + choice.identifier + '">'
                            + '<div class="nqti-base-vote-list-box">'
                            + '<div class="nqti-base-vote-list-views">'
                            + liHtml
                            + '<i class="nqti-checked-icon"></i>'
                            + '</div>'
                            + '<p class="nqti-base-vote-list-index">'
                            + iconText
                            + '</p>'
                            + '</div>'
                            + '</li>';
                }
                optionHtml += '</ul>';
                return optionHtml;
            };
            //动态渲染
            modelItem.render = function ($view, option) {
                var that = this;
            };
            //交互事件处理
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var $option = $view.find('._qp-option');
                $option.each(function () {
                    var $that = $(this);
                    $that.bind('qpTap', function () {
                        if (that.isLock()) {
                            return;
                        }
                        var optionChecked = $that.data('identifier');
                        if ($that.hasClass('nqti-checked')) {
                            $that.removeClass('nqti-checked');
                        } else {
                            $that.addClass('nqti-checked');
                            if (_model.maxChoices === 1) {
                                //单选,清除其他选中
                                $option.each(function () {
                                    var $this = $(this);
                                    var option = $this.data('identifier');
                                    if (option != optionChecked) {
                                        $this.removeClass('nqti-checked');
                                    }
                                });
                            }
                        }
                        //保存当前答案
                        var answer = [];
                        $option.each(function () {
                            var $this = $(this);
                            if ($this.hasClass('nqti-checked')) {
                                answer.push($this.data('identifier').toString());
                            }
                        });
                        that.setAnswer(answer);
                    });
                });
            };

            modelItem.renderReset = function ($view) {
                $view.find('._qp-option').each(function () {
                    var $this = $(this);
                    $this.removeClass('nqti-checked');
                });
            };


            modelItem.renderAnswer = function ($view) {
                var answer = this.getAnswer();
                $view.find('._qp-option').each(function () {
                    var $this = $(this);
                    for (var index = 0; index < answer.length; index++) {
                        if ($this.data('identifier') == answer[index]) {
                            $this.addClass('nqti-checked');
                            break;
                        }
                    }
                });
            };

            modelItem.renderCheckedAnswer = function ($view) {
                this.renderAnswer($view)
            };

            modelItem.renderCorrectAnswer = function ($view) {
            };

            modelItem.renderLock = function ($view) {

            };
        }
    };
    //注册
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


// drawingInteraction_handwrite
(function (window, $) {
    var _utils=QtiPlayer.getUtils();
    //创建
    var _modelHandler = {
        _name: 'drawingInteraction_handwrite',
        //获取model名称
        getName: function () {
            return this._name;
        },
        //创建渲染的方法
        create: function (modelItem) {
            var _model = modelItem.getModel();
            var _canvasWidth = _model.object.width - 4;
            var _canvasHeight = _model.object.height - 8;
            var _canvasId = 'cvs';

            //返回题目类型名称
            modelItem.getName = function () {
                return '手写题';
            };

            //该model没有小题编号
            modelItem.hasNum = function () {
                return false;
            };
            modelItem.createTitleHtml = function () {
                return '<div class="qp-model-header">' + _model.prompt + '</div>';
            }
            modelItem.createAnswerHtml = function (option) {
                var html = '';
                var bg = _model.object.data;
                var style = '';
                var cavsBoxClass = '';
                if (bg.length > 0) {
                    style = 'background-image: url(\'' + bg + '\');'
                }else{
                    cavsBoxClass = ' qp-hw-cavs-nobg';
                }

                html += '      <div class="qp-hw-drawing-content qp-hw-bar-visible"  ">                                                                                                                       ';
                html += '      <div style="position: relative" class="qp-hw-drawing-box '+cavsBoxClass+'" >                                                                                                                       ';
                html += '        <div  class="qp-hw-writing_edit" >                                                                                                                          ';
                html += '          <a href="javascript:void(0)" class="qp-hw-writing_botton qp-hw-classlink"  style="display: none" id="btn_back">                                                                  ';
                html += '              <ins class="qp-hw-icon_back"></ins>                                                                                                                ';
                html += '          </a>                                                                                                                                                ';
                html += '          <a href="javascript:void(0)" class="qp-hw-writing_botton qp-hw-classlink qp-on" id="write">                                                                     ';
                html += '              <ins class="qp-hw-icon_writing"></ins>                                                                                                             ';
                html += '          </a>                                                                                                                                                ';
                html += '              <a href="javascript:void(0)" class="qp-hw-writing_botton qp-hw-botton_clear" id="clear">                                                              ';
                html += '                  <ins class="qp-hw-icon_clear"></ins>                                                                                                           ';
                html += '              </a>                                                                                                                                            ';
                html += '              <a href="javascript:void(0)"  class="qp-hw-writing_botton qp-hw-botton_allclear qp-hw-classlink" id="clearall">                                          ';
                html += '                  <ins class="qp-hw-icon_allclear"></ins>                                                                                                        ';
                html += '              </a>                                                                                                                                            ';
                html += '        </div>                                                                                                   ';
                html += '          <canvas class="qp-hw-cavs " id="' + _canvasId + '" style="' + style + '">               ';
                html += '              Fallback content, in case the browser does not support Canvas.                                                                                  ';
                html += '          </canvas>                                                                                                                                           ';
                html += '      </div>                                                                                                                                                  ';
                html += '      </div>                                                                                                                                                  ';
                return html;
            }
            modelItem.render = function ($view, option) {
                var that = this;
                //画板
                var $canvas = $view.find(".qp-hw-drawing-content canvas");
                //工具栏
                var $writingBar = $view.find('.qp-hw-writing_edit');
                //移动端不显示编辑按钮
                if (_utils.Broswer.any()) {
                    $writingBar.hide();
                    $view.find('.qp-hw-bar-visible').removeClass('qp-hw-bar-visible');
                }

                //初始化画板大小
                $canvas.css({
                    width: _canvasWidth,
                    height: _canvasHeight
                });
                if ($canvas.length > 0 && $canvas[0]) {
                    $canvas[0].width = _canvasWidth;
                    $canvas[0].height = _canvasHeight;
                }
                $view.find('.qp-hw-drawing-box').css({
                    width: _canvasWidth
                });

                //渲染答案
                if (option.showAnswer || option.showCorrectAnswer|| option.showCheckedAnswer) {
                    var answers = option.showCorrectAnswer ? that.getCorrectAnswer() : that.getAnswer();
                    if (answers && answers.length > 0 && answers[0]) {
                        var answers = answers[0].split('|$*-*$|')[1];
                        var ctx = $canvas[0].getContext("2d");
                        var image = new Image();
                        image.onload = function () {
                            ctx.drawImage(image, 0, 0);
                        };
                        image.src = answers;
                    }
                }

            }
            modelItem.eventHandle = function ($view, option) {
                if (option.hideAnswerArea) {
                    return;
                }
                //qti-player内部已经略过该题型，eventHandle默认就会执行
                if (option.showLock) {
                    return;
                }
                var that = this;
                //画板
                var $canvas = $view.find(".qp-hw-drawing-content canvas");

                var lock = false,
                    lastX = -1,
                    lastY = -1,
                    isEraser = false,
                    cxt = $canvas[0].getContext('2d');
                cxt.lineJoin = "round";//指定两条线段的连接方式


                var getMousePos = function (evt) {
                    var rect = $canvas[0].getBoundingClientRect();
                    var point = {};
                    switch (evt.type) {
                        case 'touchstart':
                        case 'touchmove':
                        case 'touchend':
                        case 'touchcancel':
                            point = {
                                x: evt.originalEvent.targetTouches[0].clientX - rect.left,
                                y: evt.originalEvent.targetTouches[0].clientY - rect.top
                            };
                            break;
                        default :
                            point = {
                                x: evt.clientX - rect.left,
                                y: evt.clientY - rect.top
                            };
                            break;

                    }

                    return point;
                };

                //清除函数
                var clearLine = function (coordinate) {
                    //获取坐标
                    var x = coordinate.x;
                    var y = coordinate.y;
                    //清除
                    cxt.clearRect(x - 15, y - 15, 30, 30);
                };


                var drawPoint = function (coordinate) {
                    //console.log(coordinate);
                    var x = coordinate.x;
                    var y = coordinate.y;
                    cxt.beginPath();//准备绘制一条路径
                    if (lastX === -1) {
                        cxt.moveTo(x - 1, y);
                    } else {
                        cxt.moveTo(lastX, lastY);
                    }
                    cxt.lineTo(x, y);//将当前点与指定的点用一条笔直的路径连接起来
                    cxt.closePath();//关闭当前路径
                    cxt.stroke();//绘制当前路径
                    //将但前坐标作为下一线的起点
                    lastX = x;
                    lastY = y;
                };

                var clear = function () {
                    cxt.clearRect(0, 0, _canvasWidth, _canvasHeight);//清除画布，左上角为起点
                    that.setAnswer(getAnswer());
                };

                var getAnswer = function () {
                    var answer = [];

                    var arry = {
                        img: {
                            width: _canvasWidth,
                            height: _canvasHeight
                        }
                    };
                    answer.push(JSON.stringify(arry) + "|$*-*$|" + $canvas[0].toDataURL());
                    return answer;
                };

                var event = (function () {
                    //if (ModuleUtil.IsMobile.any() && ( 'ontouchend' in document)) {
                        return {
                            move: 'touchmove mousemove',
                            down: 'touchstart mousedown',
                            up: 'touchend touchcancel mouseup mouseleave'
                        };
                    //} else {
                    //    return {
                    //        move: 'mousemove',
                    //        down: 'mousedown',
                    //        up: 'mouseup'
                    //    };
                    //}
                })();


                $canvas.on(event.move, function (e) {
                    //t.lock为true则执行
                    if (lock) {
                        e.preventDefault();
                        e.stopPropagation();
                        var point = getMousePos(e);
                        if (isEraser) {
                            clearLine(point);
                        } else {
                            drawPoint(point);//绘制路线
                        }
                    }
                });
                $canvas.on(event.down, function (e) {
                    $("input").blur();
                    e.preventDefault();
                    e.stopPropagation();
                    var point = getMousePos(e);
                    if (isEraser) {
                        clearLine(point);
                    } else {
                        drawPoint(point);//绘制路线
                    }
                    lock = true;

                });
                $canvas.on(event.up, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    lock = false;
                    that.setAnswer(getAnswer());
                    lastX = -1;
                    lastY = -1;
                });
                $canvas.on('click',function(e){
                    $("input").blur();
                });
                $view.on(event.move, function (ev) {
                    if (lock) {
                        e.preventDefault();
                        e.stopPropagation();
                        var oEvent = ev.originalEvent || event;
                        if (oEvent.target.id != _canvasId) {
                            lock = false;
                            that.setAnswer(getAnswer());
                        }
                    }
                });
                var $clear= $view.find('#clear');
                var $write= $view.find('#write');
                var $clearall= $view.find('#clearall');
                $clear.on("click", function () {
                    isEraser = true;
                    $clear.addClass('qp-on');
                    $write.removeClass('qp-on');
                });
                $write.on("click", function () {
                    isEraser = false;
                    $write.addClass('qp-on');
                    $clear.removeClass('qp-on');
                });
                $clearall.on("click", function () {
                    clear();
                });
            }

        }
    };
    //注册
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);
})
(window, jQuery);

// drawingInteraction_drawing
(function (window, $) {
    var _utils = window.QtiPlayer.getUtils();
    //创建modal
    var _modelHandler = {
        _modalName: 'drawingInteraction_drawing',
        //获取modal名称
        getName: function () {
            return this._modalName;
        },
        create: function (modelItem) {
            //获取模型数据
            var _model = modelItem.getModel();
            //初始化导航和按钮文本

            //标题输入框正则
            var _textEntryRegex = /<textEntry([\s\S])*?\/>/g;

            //返回题目类型名称
            modelItem.getName = function () {
                return '作文题';
            };

            //该model没有小题编号
            modelItem.hasNum = function () {
                return false;
            };
            //该model没有提示
            modelItem.hasHint = function () {
                return false;
            };
            //返回标题片段
            modelItem.createTitleHtml = function () {
                return '';
            };
            //返回答案区域片段
            modelItem.createAnswerHtml = function (option) {
                var _stem = _utils.getLangText('drawing_stem', option);
                var _sourceMaterial = _utils.getLangText('drawing_source_material', option);
                var _viewTopics = _utils.getLangText('drawing_view_topics', option);
                var _viewMaterial = _utils.getLangText('drawing_view_material', option);
                var _continueWrite = _utils.getLangText('drawing_continue_write', option);
                //导航栏
                var nav = '<div class="qp-drawing-navigation-wrapper">'
                        + '<ul class="qp-drawing-navigation qp-clearfix">';
                nav += '<li class="qp-drawing-navigation-item selected qp-drawing-navigation-title">' + _stem + '</li>';
                if (_model.asset.length > 0) {
                    nav += '<li class="qp-drawing-navigation-item qp-drawing-navigation-asset">' + _sourceMaterial + '</li>';
                }
                nav += '</ul></div>';
                //按钮栏
                var toolBar = '<div class="qp-drawing-toolbar qp-clearfix">'
                        + '<a href="javascript:void(0)" class="qp-drawing-button qp-view-title-button">' + _viewTopics + '</a>';
                if (_model.asset.length > 0) {
                    toolBar += '<a href="javascript:void(0)" class="qp-drawing-button qp-view-asset-button">' + _viewMaterial + '</a>';
                }
                toolBar += '</div>';
                //内容区域-题干内容
                var title = _model.title.replace(_textEntryRegex, '<span class="qp-underline"></span>');
                var titleContent = '<div class="qp-drawing-content-item " data-index="title">'
                        + '<div class="qp-title-contnet">'
                        + '<div class="qp-text">' + title + '</div>'
                        + '<div class="qp-text">' + _model.content + '</div>'
                        + '</div>'
                        + '</div>';
                //内容区域-素材内容
                var assetClass = '';
                if (_model.asset.length === 1) {
                    assetClass = 'qp-asset-one';
                } else if (_model.asset.length === 2) {
                    assetClass = 'qp-asset-two';
                }

                var assetNav = '<ul class="qp-asset-navigation '+assetClass+'">';
                var assetContentItem = '<div class="qp-asset-content">';
                var selectClass = 'selected';
                for (var index = 0; index < _model.asset.length; index++) {
                    assetNav += '<li data-index="asset' + index + '" class="qp-asset-navigation-item ' + selectClass + '">' + _sourceMaterial + (index + 1) + '</li>';
                    assetContentItem += '<div data-index="asset' + index + '" class="qp-asset-content-item ' + (index == 0 ? '' : ' qp-left-hide') + '">'
                        + '<div class="qp-text">' + _model.asset[index] + '</div>'
                        + '</div>';
                    selectClass = '';
                }
                assetNav += '</ul>';
                assetContentItem += '</div>';
                var assetContent = '<div class="qp-drawing-content-item qp-left-hide" data-index="asset">'
                        + assetNav
                        + assetContentItem
                        + '</div>';
                //内容区域
                var content = '<div class="qp-drawing-content">'
                        + titleContent
                        + assetContent
                        + '</div>';
                //书写区域-工具栏
                var editToolBar = '<div class="qp-drawing-edit-toolbar">'
                        + '<a href="javascript:void(0)" class="qp-edit-button qp-edit-button-back"><ins class="qp-edit-button-icon"></ins></a>'
                        + '<a href="javascript:void(0)" class="qp-edit-button qp-edit-button-clear"><ins class="qp-edit-button-icon"></ins></a>'
                        + '<a href="javascript:void(0)" class="qp-edit-button qp-edit-button-allclear"><ins class="qp-edit-button-icon"></ins></a>'
                        + '<a href="javascript:void(0)" class="qp-edit-button qp-edit-button-writing qp-on"><ins class="qp-edit-button-icon"></ins></a>'
                        + '</div>';
                //书写区域-内容
                var inputIndex = 0;
                var editContentTitle = '<div class="qp-drawing-edit-content-title">';
                editContentTitle += _model.title.replace(_textEntryRegex, function (m) {
                    var result = '<span class="qp-textentry">'
                            + '<input class="qp-textentry-input" type="text" placeholder="" data-index="' + inputIndex + '"/>'
                            + '</span>';
                    inputIndex++;
                    return result;
                });
                editContentTitle += '</div>';
                var editContent = '<div class="qp-drawing-edit-content">'
                        + editContentTitle
                        + '    <div class="qp-drawing-edit-content-canvas-wrapper">'
                        + '    <canvas class="qp-drawing-edit-content-canvas" width="770" height="750">Fallback content, in case the browser does not support Canvas.</canvas>'
                        + '    </div>'
                        + '</div>';
                //书写区域
                var edit = '<div class="qp-drawing-edit qp-left-hide">'
                        + editToolBar
                        + editContent
                        + '</div>';
                //底部按钮
                var bottomBar = '<div class="qp-drawing-bottom">'
                        + '<a href="javascript:void(0)" class="qp-drawing-button qp-write-button">' + _continueWrite + '</a>'
                        + '</div>';
                //返回
                var result = '<div class="qp-model-content qp-drawing">'
                        + nav
                        + toolBar
                        + content
                        + edit
                        + bottomBar;
                return result;
            };
            //动态渲染
            modelItem.render = function ($view, option) {
                //书写区域背景图片渲染
                var $editCanvas = $view.find('.qp-drawing-edit-content-canvas');
                if ($editCanvas.length > 0) {
                    //加载题目设定的背景图片，如果背景图片不存在，则使用默认背景
                    var imgUrl = _model.object.data;
                    if (imgUrl === '') {
                        //没有设定背景图片,使用默认背景
                        $editCanvas.addClass('qp-edit-default-background');
                    } else {
                        //有设定背景图片，开始加载背景
                        var img = new Image();
                        img.onerror = function () {
                            //设定的图片加载异常，改为默认图片
                            $editCanvas.addClass('qp-edit-default-background');
                        };
                        img.onload = function () {
                            //设定的图片加载成功,设置为背景
                            $editCanvas.css('background-image', 'url(' + imgUrl + ')');
                        };
                        img.src = imgUrl;
                    }
                }
                //渲染导航、素材交互事件
                //导航title项
                var $navTitleItem = $view.find('.qp-drawing-navigation-title');
                //导航asset项
                var $navAssetItem = $view.find('.qp-drawing-navigation-asset');
                //内容
                var $contentItem = $view.find('.qp-drawing-content-item');
                //导航title项点击
                $navTitleItem.bind('qpTap', function () {
                    if ($navTitleItem.hasClass('selected') === false) {
                        //title项没有被选中，切换到title内容
                        $navAssetItem.removeClass('selected');
                        $navTitleItem.addClass('selected');
                        //切换到title内容
                        $contentItem.each(function () {
                            var $this = $(this);
                            var contentIndex = $this.data('index');
                            if ('title' === contentIndex) {
                                $this.removeClass('qp-left-hide');
                            } else {
                                $this.addClass('qp-left-hide');
                            }
                        });
                    }
                });
                //导航asset项点击事件
                $navAssetItem.bind('qpTap', function () {
                    if ($navAssetItem.hasClass('selected') === false) {
                        //asset项没有被选中，切换到asset内容
                        $navTitleItem.removeClass('selected');
                        $navAssetItem.addClass('selected');
                        //切换asset内容
                        $contentItem.each(function () {
                            var $this = $(this);
                            var contentIndex = $this.data('index');
                            if ('asset' === contentIndex) {
                                $this.removeClass('qp-left-hide');
                            } else {
                                $this.addClass('qp-left-hide');

                            }
                        });
                    }
                });
                //素材导航
                var $assetNavItem = $view.find('.qp-asset-navigation-item');
                //素材内容
                var $assetContentItem = $view.find('.qp-asset-content-item');
                //素材导航事件
                $assetNavItem.bind('qpTap', function () {
                    var $that = $(this);
                    if ($that.hasClass('selected') === false) {
                        //当前导航项没有被选中，切换到新的导航内容，旧导航内容隐藏
                        $assetNavItem.removeClass('selected');
                        $that.addClass('selected');
                        //切换内容
                        var navIndex = $that.data('index');
                        $assetContentItem.each(function () {
                            var $this = $(this);
                            var contentIndex = $this.data('index');
                            if (navIndex === contentIndex) {
                                $this.removeClass('qp-left-hide');
                            } else {
                                $this.addClass('qp-left-hide');
                            }
                        });
                    }
                });
            };
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                //作文题显示区域$drawing
                var $drawing = $view.find('.qp-drawing');
                //导航title项
                var $navTitleItem = $view.find('.qp-drawing-navigation-title');
                //导航asset项
                var $navAssetItem = $view.find('.qp-drawing-navigation-asset');
                //查看题目按钮
                var $viewTitleButton = $view.find('.qp-view-title-button');
                //查看素材按钮
                var $viewAssetButton = $view.find('.qp-view-asset-button');
                //作答按钮
                var $wirteButton = $view.find('.qp-write-button');
                //画板
                var $editCanvas = $view.find('.qp-drawing-edit-content-canvas');
                //画板按钮-画笔按钮
                var $drawButton = $view.find('.qp-edit-button-writing');
                //画板按钮-清除按钮
                var $allClearButton = $view.find('.qp-edit-button-allclear');
                //画板按钮-橡皮擦按钮
                var $clearButton = $view.find('.qp-edit-button-clear');
                //画板按钮-撤销按钮
                var $backButton = $view.find('.qp-edit-button-back');
                //作文题内容区域
                var $drawingEdit = $view.find('.qp-drawing-edit');
                //写作按钮事件
                $wirteButton.bind('qpTap', function () {
                    //进入书写状态
                    $drawing.addClass('qp-writing');
                    $drawingEdit.removeClass('qp-left-hide');
                });
                //查看题目事件
                $viewTitleButton.bind('qpTap', function () {
                    //退出书写状态
                    $drawing.removeClass('qp-writing');
                    $drawingEdit.addClass('qp-left-hide');
                    //触发导航中title项点击事件处理
                    $navTitleItem.triggerHandler('qpTap');
                });
                //查看素材事件
                $viewAssetButton.bind('qpTap', function () {
                    //退出书写状态
                    $drawing.removeClass('qp-writing');
                    $drawingEdit.addClass('qp-left-hide');
                    //触发导航中asset项点击事件处理
                    $navAssetItem.triggerHandler('qpTap');
                });
                if ($editCanvas.length > 0) {
                    //输入框
                    var $input = $drawing.find('input');
                    //画布
                    var editCanvas = $editCanvas[0];
                    var ctx = editCanvas.getContext('2d');
                    ctx.lineJoin = "round";//指定两条线段的连接方式
                    ctx.lineWidth = 1;
                    //状态
                    var state = {
                        edit: false,
                        type: 'draw',
                        lastX: -1,
                        lastY: -1,
                        //dataUrl保存绘图的结果数据，最新的数据放在最前面
                        dataUrl: [],
                        inputState: {},
                        inputAnswer: []
                    };
                    //初始化状态
                    $input.each(function () {
                        var $this = $(this);
                        var index = $this.data('index');
                        state.inputState[index] = {
                            timer: null,
                            lastValue: ''
                        };
                    });
                    //保存整道题答案
                    var saveAllAnswer = function () {
                        var dataUrl = '';
                        if (state.dataUrl.length > 0) {
                            dataUrl = state.dataUrl[0];
                        }
                        var allAnswer = {
                            img: dataUrl,
                            answer: state.inputAnswer
                        };
                        var answer = [];
                        answer.push(allAnswer);
                        that.setAnswer(answer);
                    };
                    //标题填空区域处理
                    //保存填空题答案
                    var saveInputAnswer = function (index, value) {
                        if (state.inputAnswer.length === 0) {
                            var length = $input.length;
                            while (length > 0) {
                                state.inputAnswer.push('');
                                length--;
                            }
                        }
                        state.inputAnswer[index] = value;
                        //保存整道题答案
                        saveAllAnswer();
                    };
                    //获取焦点时定时检测输入输入框变化
                    $input.bind('focus', function () {
                        //定时检测输入输入框变化
                        var $this = $(this);
                        var index = $this.data('index');
                        var inputState = state.inputState[index];
                        inputState.timer = setInterval(function () {
                            var newValue = $this.val();
                            if (newValue !== inputState.lastValue) {
                                //输入内容有变化
                                inputState.lastValue = newValue;
                                saveInputAnswer(index, newValue);
                            }
                        }, 500);
                    });
                    //输入结束后保存答案
                    $input.bind('blur', function () {
                        var $this = $(this);
                        var index = $this.data('index');
                        //清除定时器
                        var inputState = state.inputState[index];
                        clearInterval(inputState.timer);
                        inputState.timer = null;
                        //保存答案
                        var newValue = $this.val();
                        $this.val(newValue);
                        saveInputAnswer(index, newValue);
                        inputState.lastValue = newValue;
                    });
                    //书写区域canvas处理
                    //获取鼠标在画布上的坐标
                    var getMousePos = function (evt) {

                        var rect = editCanvas.getBoundingClientRect();
                        var point = {};
                        switch (evt.type) {
                            case 'touchstart':
                            case 'touchmove':
                            case 'touchend':
                            case 'touchcancel':
                                point = {
                                    x: evt.originalEvent.targetTouches[0].clientX - rect.left,
                                    y: evt.originalEvent.targetTouches[0].clientY - rect.top
                                };
                                break;
                            default :
                                point = {
                                    x: evt.clientX - rect.left,
                                    y: evt.clientY - rect.top
                                };
                                break;

                        }
                        point.x=point.x* (editCanvas.width / rect.width);
                        point.y=point.y* (editCanvas.height / rect.height);
                        return point;
                    };
                    //绘图函数
                    var drawLine = function (evt) {
                        //获取坐标
                        var coordinate = getMousePos(evt);
                        var x = coordinate.x;
                        var y = coordinate.y;
                        ctx.beginPath();//准备绘制一条路径
                        if (state.lastX === -1) {
                            ctx.moveTo(x - 1, y);
                        } else {
                            ctx.moveTo(state.lastX, state.lastY);
                        }
                        ctx.lineTo(x, y);//将当前点与指定的点用一条笔直的路径连接起来
                        ctx.closePath();//关闭当前路径
                        ctx.stroke();//绘制当前路径
                        //将但前坐标作为下一线的起点
                        state.lastX = x;
                        state.lastY = y;
                    };
                    //清除函数
                    var clearLine = function (evt) {
                        //获取坐标
                        var coordinate = getMousePos(evt);
                        var x = coordinate.x;
                        var y = coordinate.y;
                        //清除
                        ctx.clearRect(x - 15, y - 15, 30, 30);
                    };
                    //保存绘图数据
                    var saveImageData = function () {
                        var data = editCanvas.toDataURL();
                        //最新数据插入带数据的开头
                        state.dataUrl.unshift(data);
                        //控制最多保存30次操作
//                        while (state.dataUrl.length > 30) {
//                            state.dataUrl.pop();
//                        }
                        //保存整道题答案
                        saveAllAnswer();
                    };
                    //画笔按钮点击事件
                    $drawButton.bind('qpTap', function () {
                        state.type = 'draw';
                        $drawButton.addClass('qp-on');
                        $clearButton.removeClass('qp-on');
                    });
                    //橡皮擦按钮点击事件
                    $clearButton.bind('qpTap', function () {
                        state.type = 'clear';
                        $drawButton.removeClass('qp-on');
                        $clearButton.addClass('qp-on');
                    });
                    //清除按钮点击事件
                    $allClearButton.bind('qpTap', function () {
                        ctx.clearRect(0, 0, editCanvas.width, editCanvas.height);//清除画布，左上角为起点
                        //保存绘图数据
                        saveImageData();
                    });
                    //撤销钮点击事件
                    $backButton.bind('qpTap', function () {
                        state.dataUrl.shift();
                        if (state.dataUrl.length > 0) {
                            //还原图像
                            var dataUrl = state.dataUrl[0];
                            var img = new Image();
                            img.onload = function () {
                                //先清除画布
                                ctx.clearRect(0, 0, editCanvas.width, editCanvas.height);
                                //还原图片
                                ctx.drawImage(img, 0, 0);
                                //保存整道题答案
                                saveAllAnswer();
                            };
                            img.src = dataUrl;
                        } else {
                            //没有图片数据，直接清除画布
                            ctx.clearRect(0, 0, editCanvas.width, editCanvas.height);
                            //保存整道题答案
                            saveAllAnswer();
                        }
                    });
                    //鼠标按住事件
                    $editCanvas.bind('mousedown touchstart', function (evt) {
                        evt.preventDefault();
                        state.edit = true;
                        if (state.type === 'draw') {
                            //绘制
                            drawLine(evt);
                        } else {
                            //擦除
                            clearLine(evt);
                        }
                        //
                        $editCanvas.bind('mousemove touchmove', function (evt) {
                            if (state.edit) {
                                evt.preventDefault();
                                if (state.type === 'draw') {
                                    //绘制
                                    drawLine(evt);
                                } else {
                                    //擦除
                                    clearLine(evt);
                                }
                            }
                        });
                    });
                    //鼠标放开事件
                    $editCanvas.bind('mouseup mouseout touchend touchcancel', function (evt) {
                        if (state.edit) {
                            evt.preventDefault();
                            //保存绘图数据
                            saveImageData();
                            $editCanvas.unbind('mousemove');
                            state.edit = false;
                            state.lastX = -1;
                            state.lastY = -1;
                        }
                    });
                }
            };
        }
    };
    //注册modal
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


// choiceInteraction
(function (window, $) {
    var _utils = window.QtiPlayer.getUtils();
    //创建
    var _modelHandler = {
        _name: 'extendedTextInteraction',
        //获取modal名称
        getName: function () {
            return this._name;
        },
        //创建渲染的方法
        create: function (modelItem) {
            var _model = modelItem.getModel();

            //返回题目类型名称
            modelItem.getName = function () {
                return _utils.getLangText('question', this.getOption());
            };

            modelItem.getClassName = function () {
                return 'nqti-base-essayQuestion';
            };
            modelItem.createTitleHtml = function () {
                return _model.prompt;
            };
            modelItem.createAnswerHtml = function (option) {
                var result = '';
                //if(option.showCorrectAnswer) {
                //参考答案
                var rubricBlock = _model.rubricBlock;
                if (rubricBlock && rubricBlock.prompt) {
                    result += '<div class="_nqti-answer nqti-hide-dom">' + rubricBlock.prompt + '</div>';
                }
                //} else {
                result += '<div class="nqti-base-essayQuestion-wrap _nqti-textarea">'
                    + '<textarea class="nqti-base-essay-area nqti-scrollbar-style-gray _essay-area"></textarea>'
                    + '</div>';
                //}
                return result;
            };
            modelItem.render = function ($view, option) {
                var that = this;

            };
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var _$textarea = $view.find('._essay-area');
                _$textarea.bind('input propertychange', function (e) {
                    var answer = [];
                    answer.push(_$textarea.val());
                    if (e.type === 'propertychange') {
                        if (e.originalEvent.propertyName === 'value') {
                            that.setAnswer(answer);
                        }
                    } else {
                        that.setAnswer(answer);
                    }
                    //if ((that.__reset === true ||that.__lock === true) && answer[0] === '') {
                    //    that.__reset = false;
                    //    that.__lock = false;
                    //    return;
                    //} else {
                    //    that.__reset = false;
                    //
                    //}

                });
            };

            modelItem.__unbind = function ($view) {
                //var _$textarea = $view.find('._essay-area');
                //_$textarea.unbind('input propertychange ');
            };

            modelItem.renderReset = function ($view) {
                //this.__unbind($view);
                $view.find('._nqti-answer').addClass('nqti-hide-dom');
                $view.find('._nqti-textarea').removeClass('nqti-hide-dom');
                var $textarea = $view.find('._essay-area');
                //this.__reset = true;
                $textarea.text('');
            };


            modelItem.renderAnswer = function ($view) {
                this.__unbind($view);
                //this.__reset = false;
                var $textarea = $view.find('._essay-area');
                var answer = this.getAnswer();
                var currentAnswer = '';
                if (answer.length > 0) {
                    currentAnswer = answer[0];
                }
                //使用text兼容ie8
                $textarea.text(currentAnswer);
            };

            modelItem.renderCheckedAnswer = function ($view) {
                this.__unbind($view);
                //this.__reset = false;
                this.renderAnswer($view);
                var $textarea = $view.find('._essay-area');
                $textarea.attr('readonly', 'readonly');
            };

            modelItem.renderCorrectAnswer = function ($view) {
                this.__unbind($view);
                //this.__reset = false;
                $view.find('._nqti-answer').removeClass('nqti-hide-dom');
                $view.find('._nqti-textarea').addClass('nqti-hide-dom');
            };

            modelItem.renderLock = function ($view) {
                var $textarea = $view.find('._essay-area');
                //this.__lock = true;
                if (this.isLock()) {
                    $textarea.attr('readonly', 'readonly');
                } else {
                    $textarea.removeAttr('readonly');
                }
            };
        }
    };

    //注册
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


// matchInteraction
(function (window, $) {
//创建modal
    var _utils = window.QtiPlayer.getUtils();
    var _logger = window.QtiPlayer.getLogger();
    var _modelHandler = {
        _modalName: 'gapMatchInteraction',
        //获取modal名称
        getName: function () {
            return this._modalName;
        },
        //创建渲染的方法
        create: function (modelItem) {

            var interaction = null;

            //返回题目类型名称
            modelItem.getName = function () {
                return '表格题';
            };

            modelItem.init = function () {
                interaction = new GraphicGapMatchInteraction(modelItem);
            }
            //该model没有小题编号
            modelItem.hasNum = function () {
                return false;
            };
            //该model没有提示
            modelItem.hasHint = function () {
                return false;
            };
            modelItem.createTitleHtml = function () {
                return '';
            }
            modelItem.createAnswerHtml = function (option) {
                interaction.setOption(option);
                return interaction.createHtml();
            }
            modelItem.render = function ($view, option) {
                interaction.setOption(option);
            }
            modelItem.eventHandle = function ($view, option) {
                if (option.hideAnswerArea) {
                    return;
                }
                interaction.eventHandle($view);
            };
        }
    };
//注册modal
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);

    var GraphicGapMatchInteraction = window.QtiPlayer.Class(window.QtiPlayer.BaseInteraction, (function () {

        //要严格按照顺序
        var LocationType = {
            Left: "Left",
            Right: "Right",
            LeftTop: "LeftTop",
            RightTop: "RightTop",
            LeftBottom: "LeftBottom",
            RightBottom: "RightBottom",
            Bottom: "Bottom",
            Middle: "Middle",
            Top: "Top",
            TopToBottom: "TopToBottom",
            None: "None"
        };

        //类成员
        var member = {

            /**
             * 构造函数，并声明全局变量
             * @param modalItem
             * @param $view
             * @param option
             * @constructor
             */
            Create: function (modalItem, $view, option) {
                this.base(modalItem, $view, option);

                this.RESBOX_HEIGHT = 70;//选项高度
                this.TARGET_MARGIN_TOP = 5;//选项放置时，距离上面高度
                this.TARGET_BOX_WIDTH = 140;//表格td宽度
                this.RES_BORDER = 1;//选项边框宽度
                this.TD_BORDER = 0;//表格宽度
                this.TABLE_SPACING = 10;//表格宽度
                this.RESBOX_MARGIN_RIGHT = 15;


                this.resBoxRects = [];
                this.targetBoxsRects = [];
                this.absOffset = null;

                this.zindex = 1;//拖动的zindex最高值
            },

            /**
             * 渲染数据
             */
            eventHandle: function ($view) {
                var _self = this;
                var $targetBoxs = $view.find(" .qp-gapText-td");
                var $resBoxs = {};
                $view.find(" .edu-question-list-container").each(function (i) {
                    $resBoxs[$(this).attr("identifier")] = $(this);
                });
                var $container = $view.find(".edu-question-gm_theme_wood_bg");


                /**
                 * 大小变化时重置坐标数据
                 */
                var resizeCoor = function () {
                    if (!($targetBoxs && $resBoxs)) {
                        return;
                    }
                    var cOffset = $container.offset();
                    initTargetRects(cOffset);
                    if (_self.resBoxRects && _self.resBoxRects.length > 0) {
                        for (var key in $resBoxs) {
                            var $box = $resBoxs[key];
                            var w = $box.width() + _self.RES_BORDER * 2,
                                h = $box.height() + _self.RES_BORDER * 2,
                                offset = $box.offset();

                            var rect = _self.resBoxRects[key];
                            rect.l = offset.left - cOffset.left;
                            rect.t = offset.top - cOffset.top;
                            rect.r = offset.left + w - cOffset.left;
                            rect.b = offset.top + h - cOffset.top;
                            rect.w = w;
                            rect.h = h;
                            _self.resBoxRects[key] = rect;
                        }
                    }
                };


                /**
                 * 初始化坐标数据
                 */
                var initCoor = function () {
                    _self.resBoxRects = [];
                    var cOffset = $container.offset();
                    for (var key in $resBoxs) {
                        var $box = $resBoxs[key],
                            w = $box.width() + _self.RES_BORDER * 2,
                            h = $box.height() + _self.RES_BORDER * 2,
                            offset = $box.offset();
                        //$box.parent().css({width: w});

                        _self.resBoxRects[key] = {
                            l: offset.left - cOffset.left,
                            t: offset.top - cOffset.top,
                            r: offset.left + w - cOffset.left,
                            b: offset.top + h - cOffset.top,
                            w: w,
                            h: h,
                            id: key,
                            f: "",
                            tid: ""//目前支持一对多
                        };
                    }
                    initTargetRects(cOffset);
                };

                var initTargetRects = function (cOffset) {
                    _self.targetBoxsRects = [];
                    $targetBoxs.each(function () {
                        var $box = $(this),
                            w = $box.width(),
                            h = $box.height(),
                            offset = $box.offset();

                        _self.targetBoxsRects.push({
                            l: offset.left - cOffset.left,
                            t: offset.top - cOffset.top,
                            r: offset.left + w - cOffset.left,
                            b: offset.top + h - cOffset.top,
                            w: w,
                            h: h,
                            id: $box.attr("identifier")
                        });
                    });
                };

                /**
                 * 判断拖动元素和目标区域是否有交集并绑定
                 */
                var intersectBind = function (l, t, h, w, id) {
                    var rect = _utils.Area.getInteractRect(l, t, h, w, _self.targetBoxsRects);
                    if (!rect) {
                        _self.resBoxRects[id].f = "";
                    } else {
                        _self.resBoxRects[id].f = rect.id;
                    }
                    return rect;
                };


                /**
                 * 移动高亮处理
                 * @returns {*}
                 */
                var moveBox = function (l, t, h, w, id) {
                    var rect = _utils.Area.getInteractRect(l, t, h, w, _self.targetBoxsRects);
                    $targetBoxs.removeClass("qp-move");
                    if (rect) {
                        $view.find("td[identifier='" + rect.id + "']").addClass("qp-move");
                    }
                    return rect;
                };


                var toTarget = function ($target, rect, show, callback) {

                    if (show) {
                        $target.css({
                            left: rect.l,
                            top: rect.t
                        });
                        if (callback) {
                            callback();
                        }
                    } else {
                        $target.stop().animate({
                            left: rect.l,
                            top: rect.t
                        }, function () {
                            if (callback) {
                                callback();
                            }
                        });
                    }
                };


                var initDrawEvent = function () {
                    var  lastPoint = null,
                        $target,
                        targetWidth,
                        targetHeight,
                        targetIdentifier,
                        targetCssText,
                        absPoint,
                        touchend = true,
                        maxContainerWidth = $view.find(".edu-question-table_footer").width(),
                        $gapMathMain = $view.find(".qp-gapmatch-container .edu-question-main"),
                        $gapMathTable = $view.find(".qp-gapmatch-container>table");

                    var changeRectColor = function (selected) {
                        if (selected) {
                            $targetBoxs.addClass("qp-active");
                        } else {
                            $targetBoxs.removeClass("qp-active");
                        }
                    };


                    var downEvent = function (touch, e) {
                        if (_self.isLock()) {
                            return;
                        }
                        var $targetNew = _utils.Dom.getParentElement($(e.target), "qp-gapText");//.parents(".qp-gapText");

                        if (!$targetNew.hasClass("edu-question-list-container")) {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();


                        if ($target && $target.attr("id") === $targetNew.attr("id")) {
                            $target.stop();
                        }

                        $target = $targetNew;
                        targetWidth = $target.width();
                        targetHeight = $target.height();
                        targetIdentifier = $target.attr("identifier");
                        var currentAbsOffset = $container.offset();
                        //重新计算坐标
                        if (!_self.absOffset || currentAbsOffset.left !== _self.absOffset.left || currentAbsOffset.top !== _self.absOffset.top) {
                            resizeCoor();
                        }
                        _self.absOffset = currentAbsOffset;//重新获取
                        //拖动未归类的选项
                        if ($target.attr("location") === LocationType.None || typeof $target.attr("location") === "undefined") {
                            $target.parent().css({
                                width: targetWidth + _self.RESBOX_MARGIN_RIGHT + _self.RES_BORDER * 2
                            });
                        }
                        var offset = $gapMathMain.offset();
                        $gapMathTable.css({
                            left: offset.left - _self.absOffset.left,
                            top: offset.top - _self.absOffset.top
                        });


                        changeRectColor(true);

                        lastPoint = getEventPoint(touch, e);
                        var tOffset = $target.offset();
                        absPoint = {
                            x: lastPoint.x - tOffset.left + _self.absOffset.left,
                            y: lastPoint.y - tOffset.top + _self.absOffset.top
                        };

                        targetCssText = $target[0].style.cssText.replace("left", "").replace("top", "").replace("position", "").replace("z-index", "");
                        $target[0].style.cssText = targetCssText + ";position:absolute;" + "z-index:" + (_self.zindex++) + ";left:" + (lastPoint.x - absPoint.x) + "px;" + "top:" + (lastPoint.y - absPoint.y) + "px;";
                        targetCssText = $target[0].style.cssText.replace("left", "").replace("top", "");

                        resizeResBox(targetIdentifier, (lastPoint.y - absPoint.y), targetHeight);
                    };

                    var moveEvent = function (touch, e) {
                        if (_self.isLock()) {
                            return;
                        }
                        if (!lastPoint) {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();

                        lastPoint = getEventPoint(touch, e);
                        $target[0].style.cssText = targetCssText + ";" + "left:" + (lastPoint.x - absPoint.x) + "px;" + "top:" + (lastPoint.y - absPoint.y) + "px;";
                        moveBox(lastPoint.x - absPoint.x, lastPoint.y - absPoint.y, targetHeight, targetWidth, targetIdentifier);
                    };

                    var stopEvent = function (e) {
                        if (!lastPoint || !absPoint) {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();


                        stopHandler();
                        changeRectColor(false);
                        if (lastPoint != null) {
                            _self.setAnswer(getAnswer());
                        }
                        lastPoint = null;
                        absPoint = null;


                    };

                    /**
                     * 元素拖动停止回调处理
                     * @param $originalthis
                     * @param event
                     * @param ui
                     */
                    var stopHandler = function () {
                        var oldTargetId = getTargetRectId(targetIdentifier);//旧id
                        var targetRect = intersectBind(lastPoint.x - absPoint.x, lastPoint.y - absPoint.y, targetHeight, targetWidth, targetIdentifier);
                        $targetBoxs.removeClass("qp-move");
                        if (targetRect) {

                            if (oldTargetId !== targetRect.id) {
                                $target.attr("location", LocationType.None);
                            }
                            var location = $target.attr("location");

                            //超过高度，不能排在下方
                            var targetAreaRect = getTargetLocationRect($target, targetRect, targetHeight, targetWidth, location, getResRectsByTid(targetRect.id));

                            //相交
                            $target.parent().css({width: 0});
                            toTarget($target, targetAreaRect, false, function () {
                                //resizeCoor();
                            });
                            //$target.attr("center", true);
                        }
                        else {
                            $target.attr("location", LocationType.None);
                            //还原
                            $target.parent().css({
                                width: targetWidth + _self.RESBOX_MARGIN_RIGHT + _self.RES_BORDER * 2
                            });


                            (function ($target) {
                                backToParent($target, $target.parent(), false, function () {
                                    $target.attr("style", "");
                                });
                            })($target);
                        }

                    };


                    /**
                     * 目标区域拖动选项向上移动
                     * @param id
                     * @param top
                     */
                    var resizeResBox = function (id, top, targetHeight) {

                        var tid = getTargetRectId(id);

                        if (!tid) {
                            return;
                        }

                        if ($target.attr("location") !== LocationType.TopToBottom) {
                            return;
                        }

                        for (var key in _self.resBoxRects) {
                            var resRect = _self.resBoxRects[key];
                            if (resRect.f === tid) {
                                if (id !== resRect.id) {
                                    var $res = $resBoxs[resRect.id];
                                    if ($res.attr("location") !== LocationType.TopToBottom) {
                                        continue;
                                    }
                                    var resTop = parseInt($res.css("top"));
                                    if (resTop > top) {
                                        $res.animate({top: resTop - targetHeight - 2 * _self.RES_BORDER});
                                    }
                                }
                            }
                        }
                    };


                    var getTargetRectId = function (id) {
                        return _self.resBoxRects[id] && _self.resBoxRects[id].f;
                    };

                    var backToParent = function ($target, $TargetContainer, show, callback) {
                        var w = $TargetContainer.width(),
                            h = $TargetContainer.height(),
                            offset = $TargetContainer.offset();
                        var height = (_self.RESBOX_HEIGHT - $target.height()) / 2;
                        var rectTarget = {
                            l: offset.left - _self.absOffset.left,
                            t: offset.top - _self.absOffset.top + height,
                            w: w,
                            h: h
                        };
                        if (rectTarget.l < 0) {
                            rectTarget.l = 0;
                        }
                        if (rectTarget.l > maxContainerWidth - targetWidth) {
                            rectTarget.l = maxContainerWidth - targetWidth;
                        }
                        toTarget($target, rectTarget, show, callback);
                        $target.attr("center", false);

                    };

                    var getEventPoint = function (touch, e) {

                        var point = {}, x, y;
                        if (touch) {
                            x = e.targetTouches[0].pageX - _self.absOffset.left;
                            y = e.targetTouches[0].pageY - _self.absOffset.top;
                            point = {x: x, y: y};
                        } else {
                            x = typeof e.pageX !== 'undefined' ? ( e.pageX - _self.absOffset.left ) : e.layerX;
                            y = typeof e.pageY !== 'undefined' ? ( e.pageY - _self.absOffset.top ) : e.layerY;
                            point = {x: x, y: y};
                        }
                        return point;
                    };


                    var bindEvent = function () {
                        var cover = $view.find(".edu-question-gm_theme_wood_bg")[0];

                        _utils.Dom.addListener(cover, 'mousedown', function (e) {
                            downEvent(false, e);
                        });
                        _utils.Dom.addListener(cover, 'mousemove', function (e) {
                            moveEvent(false, e);
                        });
                        _utils.Dom.addListener(cover, 'click', function (e) {
                            //e.preventDefault();
                            //e.stopPropagation();
                        });
                        _utils.Dom.addListener(cover, 'mouseup', stopEvent);
                        _utils.Dom.addListener(cover, 'mouseleave', stopEvent);


                        _utils.Dom.addListener(cover, 'touchstart', function (e) {
                            if (touchend) {
                                touchend = false;
                                downEvent(true, e);
                            }
                        });
                        _utils.Dom.addListener(cover, 'touchmove', function (e) {
                            if (!touchend) {
                                moveEvent(true, e);
                            }
                        });
                        _utils.Dom.addListener(cover, 'touchend', function (e) {
                            touchend = true;
                            stopEvent(e);
                        });
                        _utils.Dom.addListener(cover, 'touchcancel', function (e) {
                            touchend = true;
                            stopEvent(e);
                        });

                    };

                    var bindScroll = function () {
                        var $lisbox = $view.find(".edu-question-list_box");
                        var allWidth = 0, boxWidth = $lisbox.width();
                        //$view.find(".qp-gapTxt-parent").each(function () {
                        //    allWidth += $(this).width() + _self.RESBOX_MARGIN_RIGHT;
                        //});
                        var scrolling = false;

                        $view.find(".edu-question-icon_right").bind("click touchstart", function () {
                            if (scrolling) {
                                return;
                            }
                            var srollLeft = $lisbox.scrollLeft();
                            allWidth = 0;
                            for (var key in $resBoxs) {
                                var $res = $resBoxs[key];
                                //拖动未归类的选项
                                if ($res.attr("location") === LocationType.None || typeof $res.attr("location") === "undefined") {
                                    allWidth += $res.parent().width();
                                }

                            }

                            var left = allWidth - srollLeft - boxWidth;
                            if (left > 0) {
                                if (left <= srollLeft) {
                                    left = srollLeft + left;
                                } else {
                                    left = srollLeft > 0 ? srollLeft * 2 : boxWidth;
                                }
                                scrolling = true;
                                $lisbox.animate({scrollLeft: left}, function () {
                                    scrolling = false;
                                });
                            }
                        });

                        $view.find(".edu-question-icon_left").bind("click touchstart", function () {
                            if (scrolling) {
                                return;
                            }
                            var srollLeft = $lisbox.scrollLeft();
                            if (srollLeft > 0) {
                                if (srollLeft > boxWidth) {
                                    srollLeft = srollLeft - boxWidth;
                                } else {
                                    srollLeft = 0;
                                }
                                scrolling = true;
                                $lisbox.animate({scrollLeft: srollLeft}, function () {
                                    scrolling = false;
                                });
                            }
                        });
                    };

                    var init = function () {
                        _self.absOffset = $container.offset();
                        initCoor();
                        bindEvent();
                        bindScroll();
                    };

                    init();
                };

                /**
                 * //获取下一个合适的坐标
                 * @param $resBox 当前选项
                 * @param targetRect 目标矩形
                 * @param resHeight 当前选项高
                 * @param resWidth 当前选项宽
                 * @param reslocationType 当前选项类型
                 * @param resRects 当前选项所在目标区域所有选项
                 * @returns {*}
                 */
                var getTargetLocationRect = function ($resBox, targetRect, resHeight, resWidth, reslocationType, resRects) {

                    var resId = $resBox.attr("identifier");

                    var locationRect = {
                        Left: function () {
                            return {
                                l: targetRect.l,
                                t: targetRect.t + (targetRect.h - resHeight + _self.RES_BORDER * 2 + _self.TD_BORDER) / 2
                            };
                        },
                        Right: function () {
                            return {
                                l: targetRect.l + targetRect.w - resWidth,
                                t: targetRect.t + (targetRect.h - resHeight + _self.RES_BORDER * 2 + _self.TD_BORDER) / 2
                            };
                        },
                        Bottom: function () {
                            return {
                                l: targetRect.l + (targetRect.w - resWidth + _self.RES_BORDER * 2 + _self.TD_BORDER) / 2,
                                t: targetRect.t + targetRect.h - resHeight
                            };
                        },
                        LeftTop: function () {
                            return {
                                l: targetRect.l,
                                t: targetRect.t
                            };
                        },
                        RightTop: function () {
                            return {
                                l: targetRect.l + targetRect.w - resWidth,
                                t: targetRect.t
                            };
                        },
                        LeftBottom: function () {
                            return {
                                l: targetRect.l,
                                t: targetRect.t + targetRect.h - resHeight
                            };
                        },
                        RightBottom: function () {
                            return {
                                l: targetRect.l + targetRect.w - resWidth,
                                t: targetRect.t + targetRect.h - resHeight
                            };
                        },
                        Middle: function () {
                            return {
                                l: targetRect.l + (targetRect.w - resWidth + _self.RES_BORDER * 2 + _self.TD_BORDER) / 2,
                                t: targetRect.t + (targetRect.h - resHeight + _self.RES_BORDER * 2 + _self.TD_BORDER) / 2
                            };
                        }
                    };

                    var hasLocation = function (location) {
                        var has = false;
                        for (var key in $resBoxs) {
                            if ($resBoxs[key].attr("location") === location) {
                                if ($resBox) {
                                    if (key !== $resBox.attr("identifier") && _self.resBoxRects[key].f == targetRect.id) {
                                        has = true;
                                    }
                                } else {
                                    has = true;
                                }
                            }
                        }

                        return has;
                    };

                    var targetAreaRect = {
                        l: targetRect.l,
                        t: targetRect.t,
                        h: targetRect.h,
                        w: targetRect.w
                    };

                    var totalHeight = 0;
                    for (var i = 0; i < resRects.length; i++) {
                        var rect = resRects[i];
                        var $res = $resBoxs[rect.id];
                        if (resId !== rect.id) {
                            if ($res.attr("location") === LocationType.TopToBottom) {
                                totalHeight += rect.h;
                                targetAreaRect.t = targetAreaRect.t + rect.h;
                            }
                        } else {
                            targetAreaRect.l = targetAreaRect.l + (targetAreaRect.w - rect.w + _self.RES_BORDER * 2 + _self.TD_BORDER) / 2;
                            if (location !== LocationType.TopToBottom) {
                                totalHeight += rect.h;
                            }
                        }

                    }
                    //上、左、下、右 位置判断
                    targetAreaRect.t = targetAreaRect.t + _self.TARGET_MARGIN_TOP;
                    totalHeight += _self.TARGET_MARGIN_TOP;//总高度

                    if (totalHeight > targetRect.h) {
                        if (reslocationType && reslocationType !== LocationType.None && reslocationType !== LocationType.Top && reslocationType !== LocationType.TopToBottom) {
                            return locationRect[reslocationType]();
                        } else {
                            for (var key in LocationType) {
                                if (key === LocationType.None || key === LocationType.TopToBottom || key === LocationType.Top) {
                                    continue;
                                }
                                //if (key == LocationType.TopToBottom) continue;
                                //if (key == LocationType.Top) continue;
                                if (!hasLocation(key)) {
                                    $resBox.attr("location", key);
                                    return locationRect[key]();
                                }
                            }
                            $resBox.attr("location", LocationType.Middle);
                            return locationRect[LocationType.Middle]();
                        }
                    } else {
                        $resBox.attr("location", LocationType.TopToBottom);
                    }

                    return targetAreaRect;
                };


                var getResRectsByTid = function (tid) {
                    var rects = [];
                    for (var key in _self.resBoxRects) {
                        var rect = _self.resBoxRects[key];
                        if (rect.f === tid) {
                            rects.push(rect);
                        }
                    }
                    return rects;
                };

                var resizeTable = function () {

                    var resizeBoxs = [];
                    for (var i = 0; i < _self.targetBoxsRects.length; i++) {
                        var targetRect = _self.targetBoxsRects[i];
                        var resRects = getResRectsByTid(targetRect.id);
                        var $targetBox = $view.find(" [identifier='" + targetRect.id + "']");
                        var boxs = [];
                        //重新计算和设置该td的宽度，并返回td上面的选项
                        for (var k = 0; k < resRects.length; k++) {
                            var box = {};
                            var rect = resRects[k];
                            box.index = $resBoxs[rect.id].css("z-index");
                            box.$targetBox = $targetBox;
                            box.targetRect = targetRect;
                            //box.resRect = rect;
                            box.$resBox = $resBoxs[rect.id];
                            boxs.push(box);
                        }
                        resizeBoxs.push(boxs);
                    }

                    //重新设置td上选项的位置
                    for (var l = 0; l < resizeBoxs.length; l++) {
                        var nboxs = resizeBoxs[l];
                        if (nboxs.length > 0) {
                            var nResRects = getResRectsByTid(nboxs[0].targetRect.id);
                            for (var m = 0; m < nboxs.length; m++) {
                                var nbox = nboxs[m];
                                var locationRect = getTargetLocationRect(nbox.$resBox, nbox.targetRect, nbox.$resBox.height(), nbox.$resBox.width(), LocationType.None, nResRects);
                                toTarget(nbox.$resBox, locationRect, true);
                            }
                        }
                    }

                };

                var getAnswer = function () {
                    var answer = [];
                    for (var key in _self.resBoxRects) {
                        var rect = _self.resBoxRects[key];
                        if (rect.f) {
                            answer.push(rect.id + " " + rect.f);
                        }
                    }
                    _logger.debug(answer);
                    return answer;
                };

                /**
                 * 初始化答案
                 * @param answers
                 */
                var updateAnswer = function (answers) {
                    if (!answers || answers.length <= 0) {
                        return;
                    }

                    for (var i = 0; i < answers.length; i++) {
                        var answer = answers[i];
                        var answerArry = answer.split(" ");
                        if (answerArry.length !== 2) {
                            continue;
                        }
                        var id = answerArry[0], tid = answerArry[1];
                        _self.resBoxRects[id].f = tid;
                        //设置绝对定位
                        $resBoxs[id].css("position", "absolute");
                    }

                    _self.zindex = answers.length + 1;
                    resizeTable();
                    _self.setAnswer(getAnswer());
                };

                var layoutTable = function () {
                    var $main = $view.find(".qp-gapmatch-container .edu-question-main");
                    var $table = $view.find(".qp-gapmatch-container > table");
                    var offset = $main.offset();
                    var absOffset = $view.find(".edu-question-gm_theme_wood_bg").offset();
                    $view.find(".qp-gapmatch-container> table").css({
                        left: offset.left - absOffset.left,
                        top: offset.top - absOffset.top
                    });

                    var thHeight = $main.find(".edu-question-title_hang").height() - 2 * _self.TABLE_SPACING;
                    var th1Width = $main.find(".edu-question-table_lie_side").width() - 2 * _self.TABLE_SPACING;
                    var tdHeight = ($main.find(".edu-question-table_lie_side").height() - _self.TABLE_SPACING * ($table.find("  tr").length - 2)) / ($table.find("  tr").length - 1);
                    var tdWidth = $main.find(".edu-question-table_box").width() - _self.TABLE_SPACING;
                    $table.find("tr:eq(0)").find("td").css({
                        height: thHeight,
                        width: tdWidth
                    });
                    $table.find("tr:eq(0)").find(" td:eq(0)").css({width: th1Width});
                    $table.find(" tr ").each(function (i) {
                        if (i === 0) {
                            return;
                        }
                        $(this).find(" td").css({height: tdHeight, width: tdWidth});
                        $(this).find("td:eq(0)").css({width: th1Width});
                        $(this).find("td:eq(0)").html("");
                    });
                    $table.attr("cellspacing", "10px");

                };
                var init = function () {
                    layoutTable();

                    if (_self.option.event) {
                        initDrawEvent();
                    }

                    if (_self.option.showAnswer && !_self.option.showCorrectAnswer) {
                        updateAnswer(_self.getAnswer());

                    }
                    if (_self.option.showCorrectAnswer) {
                        updateAnswer(_self.getCorrectAnswer());
                    }

                };
                init();

            },
            createHtml: function () {
                var _self = this;
                var createHtml = function () {
                    var titleClass = _self.modalModel.prompt.length > 105 ? "edu-question-text_s" : "edu-question-text_m";
                    var $ths = $(_self.modalModel.tableMatchContent).find(" thead td");
                    var $tds = $(_self.modalModel.tableMatchContent).find(" tbody tr");
                    //注意：这边行列样式被美工写反了
                    var columnCount = "main_lie0" + $tds.length;//第一列空白
                    var rowsCount = "main_hang0" + ($ths.length - 1);
                    var gapmath_title=_utils.getLangText('gapmath_title', _self.option);

                    var html = "";
                    html += '<div class="edu-question-gm_theme_wood_bg" id="' + _self.interactionId + '">                                                                                                                                                                                                          ';
                    html += '    <div class="edu-question-qp_gm_header clearfix">                                                                                                                                                                                                        ';
                    html += '        <h1 class="edu-question-title_s">' + gapmath_title + '</h1>                                                                                                      ';
                    html += '    </div>                                                                                                                                                                                                                               ';
                    html += '    <div class="clearfix">                                                                                                                                                                                                       ';
                    html += '        <div class="edu-question-side">                                                                                                                                                                                                               ';
                    html += '            <div class="edu-question-side_content">                                                                                                                                                                                                     ';
                    html += '                <p class="' + titleClass + '" > ' + _self.modalModel.prompt + '</p>                                                                                                                                                                                ';
                    html += '            </div>                                                                                                                                                                                                                       ';
                    html += '        </div>                                                                                                                                                                                                                           ';
                    html += '                                                                                                                                                                                                                                         ';
                    html += '        <div class="qp-gapmatch-container">                                                                                                                                                                                              ';
                    html += '                                                                                                                                                                                                                                         ';
                    html += '            <div class="edu-question-main ' + columnCount + ' ' + rowsCount + '">                                                                                                                                                                                    ';

                    html += '                <div class="edu-question-title_hang">                                                                                                                                                                                                 ';
                    $ths.each(function (i) {
                        if (i > 0) {
                            html += '            <div class="edu-question-table_box"><span class="edu-question-table_btn">' + $(this).html() + '</span></div>                                                                                                                                                     ';
                        }
                    });
                    html += '                </div>                                                                                                                                                                                                                   ';

                    html += '                <div class="edu-question-table_lie_side clearfix">                                                                                                                                                                                    ';
                    $tds.each(function () {
                        html += '                 <span class="edu-question-table_lie_btn">' + $(this).find("td:eq(0)").html() + '</span>                                                                                                                                                    ';
                    });
                    html += '                </div>                                                                                                                                                                                                                   ';

                    html += '                <div class="edu-question-table_lie clearfix">                                                                                                                                                                                         ';

                    for (var i = 0; i < $tds.length; i++) {
                        html += '                    <div class="edu-question-table_lie_box">                                                                                                                                                                                          ';
                        for (var j = 1; j < $ths.length; j++) {
                            html += '                        <div class="edu-question-table_img_box">                                                                                                                                                                                      ';
                            html += '                        </div>                                                                                                                                                                                                           ';
                        }
                        html += '                    </div>                                                                                                                                                                                                               ';
                    }

                    html += '                </div>                                                                                                                                                                                                                   ';
                    html += '            </div>                                                                                                                                                                                                                       ';
                    html += getTableHtml();
                    html += '                                                                                                                                                                                                                                         ';
                    html += '        </div>                                                                                                                                                                                                                           ';
                    html += '    </div>                                                                                                                                                                                                                               ';
                    html += '                                                                                                                                                                                                                                         ';
                    html += getGapTextsHtml();


                    html += '</div>                                                                                                                                                                                                                                   ';
                    html += '                                                                                                                                                                                                                                         ';
                    return html;
                };

                var setImageData = function (html) {
                    var imageRegex = /<img([\s\S]*?)\/>/g;
                    var match = html.match(imageRegex);
                    for (var i = 0; i < match.length; i++) {
                        html = html.replace(match[i], match[i].replace('<img', '<img data-media-img-render="false" data-width="112" data-height="70"'));
                    }
                    return html;
                };
                var getGapTextsHtml = function () {

                    var html = "";
                    html += '    <div class="edu-question-table_footer">                                                                                                                                                                                                           ';
                    html += '        <a href="javascript:void(0)" class="edu-question-icon_left"></a>                                                                                                                                                                                             ';
                    html += '                                                                                                                                                                                                                                         ';
                    html += '        <div class="edu-question-list_box">                                                                                                                                                                                                           ';

                    html += '<div class="qp-gaptxt-container" > ';
                    var randomArry = _self.getAnswerRandom(_self.modalModel.gapText.length);// ModuleUtil.RandomUtil.getAnswerRandom(_self.modalModel.gapText.length - 1);
                    for (var i = 0; i < _self.modalModel.gapText.length; i++) {
                        var gapText = _self.modalModel.gapText[_self.getShuffle() ? randomArry[i] : i];
                        var pid = _utils.getRandom(_self.interactionId + "-container" + i);
                        html += '<div class="qp-gapTxt-parent"  >';
                        if (gapText.content.indexOf("<img") > -1) {
                            html += '   <div class="qp-gapText qp-gapText-img  edu-question-list-container"  id="' + pid + '"  identifier="' + gapText.identifier + '" > ';
                            //html += ModuleUtil.IMG.resizeHtmlImg(gapText.content);
                            html += setImageData(gapText.content);
                        } else {
                            html += '   <div class="qp-gapText edu-question-list-container"  id="' + pid + '"  identifier="' + gapText.identifier + '" > ';
                            html += '<span class="qp-gapText-span">' + gapText.content + '</span>';
                        }
                        html += '   </div>';
                        html += '</div>';
                    }
                    html += '</div>  ';

                    html += '        </div>                                                                                                                                                                                                                           ';
                    html += '        <a href="javascript:void(0)" class="edu-question-icon_right"></a>                                                                                                                                                                                            ';
                    html += '    </div>';
                    return html;
                };


                var getTableHtml = function () {
                    var $table = $(_self.modalModel.tableMatchContent);
                    var gaps = $table.find("gap");
                    gaps.parent().parent().addClass("qp-gapText-td");
                    for (var i = 0; i < gaps.length; i++) {
                        var $gaps = $(gaps[i]);
                        var identifier = $gaps.attr("identifier");
                        $gaps.parent().parent().attr("identifier", identifier);
                    }
                    $table.find("thead td").html("");
                    return $table._xml().replace(/<thead>/ig, "").replace(/<\/thead>/ig, "").replace(/<tbody>/ig, "").replace(/<\/tbody>/ig, "");
                };

                return createHtml();
            }
        };
        return member;
    })());

})(window, jQuery);


(function (window, $) {
    //创建

    var _utils = window.QtiPlayer.getUtils();
    var _logger = window.QtiPlayer.getLogger();


    var HTML = {
        TR: '<tr>${content}</tr>',
        TD: '<td id="${id}" width="${width}" height="${height}" class="_nqti-js-td">${content}</td>',
        SIDE_ITEM: '<li  class="on ${cls}"><span  class="nqti-base-puzzle-img-con ${orientation} _nqti-js-img"  id="${id}"><img   data-lazy-load="${lazyloader}"  data-media-img-render="false"  ${width} src="${src}"/></span></li>',
        QUS_BODY: '<div class="nqti-base-puzzle-wrap clearfix _nqti-js-wrap" style="${c-height}">' +
        '               <div class="nqti-base-puzzle-module" style="${c-width}">' +
        '                   <table class="nqti-base-puzzle-table" style="${width};${height}"><tbody>${tbody}</tbody></table>' +
        '               </div>' +
        '               <div class="nqti-base-side-puzzle _nqti-js-side"> ' +
        '                   <ul class="nqti-base-puzzle-list nqti-scrollbar-style-gray _nqti-js-side-ul">${list}</ul>' +
        '               </div> ' +
        '          </div>'
    };
    var _maxSvgWidth = 600;
    var _maxSvgHeight = 500;
    var _minSvgWidth = 100;
    var _minSvgHeight = 100;

    //跟样式比例耦合
    var _tdBorderWidth = 2;
    var _tableBorderWidth = 5;
    var _sideWidthPerHeight = 7.25 / 5.25;

    var gapUtil = {
        winSize: function () {
            var winWidth = 0;
            var winHeight = 0;
            if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
                winWidth = document.documentElement.clientWidth;
                winHeight = document.documentElement.clientHeight;
            }
            return {
                'width': winWidth,
                'height': winHeight
            };
        },
        qtiMaxSize: function ($view) {
            var parent = $view.closest('._qti-player').parent();
            var width = parent.width();
            var maxW = 0, maxH = 0;
            //按可视区域大小缩放
            if (width > 0) {
                var scale = width / 1080;
                maxW = _maxSvgWidth * scale;
                maxH = _maxSvgHeight * scale;
                if (maxW < 300) {
                    maxW = 300;
                }
                if (maxH < 300) {
                    maxH = 300;
                }
            }
            return {
                maxW: maxW,
                maxH: maxH
            };
        },
        mathMaxSize: function () {
            var winSize = this.winSize();
            var scale = 1;
            var maxW = 0, maxH = 0;
            if (winSize.width / winSize.height > 1280 / 800) {
                scale = winSize.height / 800;
            } else {
                scale = winSize.width / 1280;
            }
            maxW = parseInt(_maxSvgWidth * scale);
            maxH = parseInt(_maxSvgHeight * scale);
            if (maxH < _minSvgHeight) {
                maxH = _minSvgHeight;
            }
            if (maxW < _minSvgWidth) {
                maxW = _minSvgWidth;
            }
            return {
                maxW: maxW,
                maxH: maxH
            };
        },
        getOffsetInt: function ($dom) {
            var offset = $dom.offset();
            if (!offset) {
                return;
            }
            return {left: parseInt(offset.left), top: parseInt(offset.top)};
        },
        getScale: function ($dom) {
            if ($dom && $dom.length > 0) {
                var offWidth = $dom[0].offsetWidth;
                return (offWidth > 0 ? ($dom[0].getBoundingClientRect().width / offWidth) : 1) || 1;
            }
            return 1;
        },
        getTableData: function (model) {
            var maxW = 0, maxH = 0;
            var rows = 0, cols = 0;
            var oneWidth = model.gapImg[0].width, oneHeight = model.gapImg[0].height;
            var matrix = {};
            for (var j = 0; j < model.associableHotspot.length; j++) {
                var spot = model.associableHotspot[j];
                var vcoords = spot.coords.split(",");
                if (parseInt(vcoords[3]) > maxH) {
                    maxH = parseInt(vcoords[3]);
                }
                if (parseInt(vcoords[2]) > maxW) {
                    maxW = parseInt(vcoords[2]);
                }
                var tbPos = spot.identifier.split('_');
                var row = parseInt(tbPos[1]);
                var col = parseInt(tbPos[2]);
                if (col > cols) {
                    cols = col;
                }
                if (!matrix[row]) {
                    matrix[row] = [];
                    rows++;
                }
                matrix[row][col - 1] = spot;
            }
            return {
                matrix: matrix,
                width: maxW,
                height: maxH,
                rows: rows,
                cols: cols,
                oneWidth: oneWidth,
                oneHeight: oneHeight
            };
        },
        getAreaSize: function (maxW, maxH, expectWidth, expectHeight, columns, rows, oneWidth, oneHeight, maxSvgWidth, maxSvgHeight) {
            //不超过最大限制
            var resize = _utils.Img.resize(maxW, maxH, maxSvgWidth, maxSvgHeight, _minSvgWidth, _minSvgHeight);
            var maxScale = resize.scale;
            maxW = resize.w;
            maxH = resize.h;

            //外部设置了期望宽高，进行重置
            if (expectWidth || expectHeight) {
                expectWidth = expectWidth - (columns * _tdBorderWidth + _tdBorderWidth);
                expectHeight = expectHeight - (rows * _tdBorderWidth + _tdBorderWidth);
                //超过原始宽高则不缩放，图片会变模糊
                if (expectWidth < maxW || expectHeight < maxH) {
                    var relativeWidth = true;
                    if (expectWidth < maxW && expectHeight < maxH) {
                        relativeWidth = expectWidth / maxW < expectHeight / maxH;
                    } else if (expectWidth < maxW) {
                        relativeWidth = true;
                    } else if (expectHeight < maxH) {
                        relativeWidth = false;
                    }
                    if (relativeWidth) {
                        resize.w = expectWidth;
                        resize.scale = (expectWidth / maxW).toFixed(3);
                        resize.h = parseInt(resize.scale * maxH);
                    } else {
                        resize.h = expectHeight;
                        resize.scale = (expectHeight / maxH).toFixed(3);
                        resize.w = parseInt(resize.scale * maxW);
                    }
                    //计算真实缩放值
                    resize.scale = resize.scale * maxScale;
                }
            }
            //整数处理
            var moRows = resize.h % rows;
            var moCols = resize.w % columns;
            if (expectWidth && expectHeight) {
                if (moCols > 0) {
                    resize.w = (resize.w - (columns - moCols));
                }
                if (moRows > 0) {
                    resize.h = (resize.h - (rows - moRows ));
                }
            } else {
                if (moCols > 0) {
                    resize.w = (resize.w + (columns - moCols));
                }
                if (moRows > 0) {
                    resize.h = (resize.h + (rows - moRows ));
                }
                //如果单项的高宽比大于总体高宽比，高度统一加1像素防止抖动
                if (oneHeight / oneWidth > (resize.h / rows) / (resize.w / columns)) {
                    resize.h += rows;
                }
            }

            //计算完整表格宽高
            resize.w += (columns) * _tdBorderWidth + _tdBorderWidth;
            resize.h += (rows) * _tdBorderWidth + _tdBorderWidth;
            return resize;
        },
        getRects: function (cOffset, $rects) {
            var rects = [];
            var scale = this.getScale($($rects[0]));
            $rects.each(function () {
                var $this = $(this);
                var width = $this.width();
                var height = $this.height();
                var id = $this.attr('id');
                var offset = gapUtil.getOffsetInt($this);
                offset.left = offset.left - cOffset.left;
                offset.top = offset.top - cOffset.top;

                rects.push({
                    l: offset.left,
                    t: offset.top,
                    r: offset.left + width * scale,
                    b: offset.top + height * scale,
                    w: width * scale,
                    h: height * scale,
                    id: id
                });
            });
            return rects;
        },
        initFill: function (rects, answers) {
            rects.forEach(function (rect) {
                //初始化答案
                var f = '';
                answers.forEach(function (answer) {
                    var answerArry = answer.split(" ");
                    if (answerArry[1] === rect.id) {
                        f = answerArry[0];
                    }
                });
                rect.f = f;
            });
        },
        //取消绑定
        removeFill: function (rects, tId) {
            rects.forEach(function (rect) {
                if (rect.f === tId) {
                    rect.f = "";
                }
            });
        },
        //取消绑定
        removeAllFill: function (rects) {
            rects.forEach(function (rect) {
                rect.f = "";
            });
        },
        //绑定
        addFill: function (rects, id, tId) {
            this.removeFill(rects, tId);
            rects.forEach(function (rect) {
                if (rect.id === id) {
                    rect.f = tId;
                }
            });
        },
        getEventPoint: function (e, absOffset) {
            var point = {}, x, y;
            var isTouch = e.originalEvent && (e.originalEvent.targetTouches || e.originalEvent.changedTouches);
            if (isTouch) {
                var event = (e.originalEvent.targetTouches && e.originalEvent.targetTouches.length > 0) ? e.originalEvent.targetTouches : e.originalEvent.changedTouches;
                x = event[0].pageX - absOffset.left;
                y = event[0].pageY - absOffset.top;
                point = {x: x, y: y, touch: true};
            } else {
                var event = e.originalEvent || e;
                x = event.pageX - absOffset.left;
                y = event.pageY - absOffset.top;
                point = {x: x, y: y, touch: false};
            }
            return point;
        },
        coordinate: function (e) {
            switch (e.type) {
                case 'touchstart':
                case 'touchmove':
                case 'touchend':
                case 'touchcancel':
                    var event = (e.originalEvent.targetTouches && e.originalEvent.targetTouches.length > 0) ? e.originalEvent.targetTouches : e.originalEvent.changedTouches;
                    return event[0];
                default:
                    return e;
            }
        },
        /**
         * 判断拖动元素和目标区域是否有交集并绑定
         */
        intersectRect: function (rects, l, t, h, w, tId) {
            var that = this;
            var result = false;
            var max = 0, matchCount = 0, matchIndex;
            var area = (w * h * 2) / 5;
            var matchRect;
            rects.forEach(function (rect, i) {
                if (result || ( rect.f && rect.f != tId)) {
                    return;
                }
                //计算面积
                var m = _utils.Area.getRectIntersectArea({l: l, t: t, r: l + w, b: t + h}, rect);
                var cm = _utils.Area.getRectIntersectArea(rect, {l: l, t: t, r: l + w, b: t + h});

                if (cm > m) {
                    m = cm;
                }
                if (m > 0) {
                    matchCount++;
                }
                if (m > max) {
                    max = m;
                    matchIndex = i;
                }
                if (m > area) {
                    result = true;
                    matchRect = rect;
                }
            });

            //匹配区域超过1个且匹配度不高，按最高匹配
            if (!result && matchCount > 1) {
                result = true;
                matchRect = rects[matchIndex];
            }
            return matchRect;
        },
        renderAnswer: function ($view, $gapImgs, answers) {
            //显示答案
            $gapImgs.each(function (i) {
                    var $this = $(this),
                        id = $this.attr("id"),
                        targetId = '',
                        target = false;
                    if (answers) {
                        answers.forEach(function (answer) {
                            var answerArry = answer.split(" ");
                            if (answerArry[0] === id) {
                                targetId = answerArry[1];
                                target = true;
                            }
                        });
                    }
                    if (target) {
                        var $parent = $this.parent();
                        $this.attr('data-parent-style', $parent.attr('style'));
                        $this.attr('data-parent-class', $parent.attr('class'));
                        $parent.remove();
                        $view.find('#' + targetId).append($this);
                    }
                }
            );
        }
    }


    var _modelHandler = {
        _name: 'graphicGapMatchInteraction',
        //获取modal名称
        getName: function () {
            return this._name;
        },
        //创建渲染的方法
        create: function (modelItem) {
            var _model = modelItem.getModel();

            //返回题目类型名称
            modelItem.getName = function () {
                return _utils.getLangText('puzzle', this.getOption());
            };

            modelItem.getClassName = function () {
                return 'nqti-base-puzzle';
            };

            modelItem.createTitleHtml = function () {
                return _model.prompt;
            }
            modelItem.createAnswerHtml = function (option) {
                var that = this;
                //计算最大宽高值
                var data = gapUtil.getTableData(_model);

                //不超过最大限制
                var resize = gapUtil.getAreaSize(data.width, data.height, option.expectWidth, option.expectHeight, data.cols, data.rows, data.oneWidth, data.oneHeight, _maxSvgWidth, _maxSvgHeight);

                var tBody = '';
                for (var row in data.matrix) {
                    var td = '';
                    data.matrix[row].forEach(function (spot) {
                        td += _utils.template(HTML.TD, {id: spot.identifier, content: '', width: (100 / data.matrix[row].length) + '%', height: (100 / data.rows) + '%'});
                    });
                    tBody += _utils.template(HTML.TR, {content: td});
                }

                _model.gapImg = _utils.Rd.shuffleArray(_model.gapImg, option.randomSeed);
                var imgHtml = '';

                for (var i = 0; i < _model.gapImg.length; i++) {
                    var gapImg = _model.gapImg[i];

                    var orientation = gapImg.width / gapImg.height <= _sideWidthPerHeight ? '_horizontal' : '';
                    var liOrientation = gapImg.width / gapImg.height > _sideWidthPerHeight ? '_autoh' : '';
                    imgHtml += _utils.template(HTML.SIDE_ITEM, {
                        src: gapImg.data,
                        width: '',
                        id: gapImg.identifier,
                        orientation: orientation,
                        cls: liOrientation,
                        lazyloader: (option.graphicGapMatchImageLoaderEnable ? true : false)
                    });
                }

                var tableBorderWidth = _utils.getPlatForm().statis === option.platForm ? 0 : _tableBorderWidth;

                var html = _utils.template(HTML.QUS_BODY, {
                    list: imgHtml, tbody: tBody, width: 'width:' + resize.w + 'px', height: 'height:' + resize.h + 'px',
                    'c-width': 'width:' + ( resize.w + tableBorderWidth * 2) + 'px', 'c-height': 'height:' + (resize.h + tableBorderWidth * 2) + 'px'
                });

                return html;
            }


            modelItem.render = function ($view, option) {
                var that = this;
                //选项
                var $side = $view.find('._nqti-js-side');

                var platStatis = _utils.getPlatForm().statis === option.platForm;

                if (platStatis) {
                    $view.closest('._qti-player').addClass('nqti-base-puzzle-stati');
                }

                var $table = $view.find('.nqti-base-puzzle-table');
                var $wrap = $view.find('._nqti-js-wrap');
                var $puzzleModule = $view.find('.nqti-base-puzzle-module');

                //默认隐藏
                $side.hide();

                var resizeTable = function () {
                    var option = that.getOption();
                    var max = gapUtil.qtiMaxSize($view);
                    if (!option.expectWidth && !option.expectHeight) {
                        var tableBorderWidth = _utils.getPlatForm().statis === option.platForm ? 0 : _tableBorderWidth;
                        if (max.maxW) {
                            var data = gapUtil.getTableData(_model);
                            var resize = gapUtil.getAreaSize(data.width, data.height, option.expectWidth, option.expectHeight, data.cols,
                                data.rows, data.oneWidth, data.oneHeight, max.maxW, max.maxH);


                            $table.css({width: resize.w + 'px', height: resize.h + 'px'});
                            $wrap.css('height', (resize.h + tableBorderWidth * 2) + 'px');
                            $puzzleModule.css('width', (resize.w + tableBorderWidth * 2) + 'px');
                        }
                    }
                    //有宽高时，显示内容
                    if (max.maxW && !option.showCorrectAnswer && !platStatis) {
                        $side.show();
                    }
                    //重新计算，如果高度不超过最大高度直接自适应高度
                    var height = $view.find('._nqti-js-side-ul li').height();
                    if (_model.gapImg[0].height < height) {
                        $view.find('._nqti-js-side-ul li').css('height', 'auto');
                    }
                };

                resizeTable();
                $view.find('.nqti-module-content').resize(function () {
                    resizeTable();
                });
            };

            modelItem.eventHandle = function ($view, option) {
                var that = this;
                //做题区域容器
                var $container = $view.find('._nqti-js-wrap');
                //svg块
                var $rects = $view.find("._nqti-js-td");
                //
                var $ul = $view.find('._nqti-js-side-ul');
                //gapimg的offset和css的left的相差值
                var cOffset = $container.offset();
                //填写区域的块坐标
                that.__rects = [];

                /**
                 * 初始化目标矩形坐标位置
                 */
                that.__rects = gapUtil.getRects(cOffset, $rects);


                var resizeCoor = function () {
                    cOffset = gapUtil.getOffsetInt($container);
                    var newRects = gapUtil.getRects(cOffset, $rects);

                    newRects.forEach(function (rect, i) {
                        rect.f = that.__rects[i].f;
                    });
                    that.__rects = newRects;
                };


                var getAnswer = function () {
                    var answer = [];
                    that.__rects.forEach(function (rect) {
                        if (rect.f) {
                            answer.push(rect.f + " " + rect.id);
                        }
                    });
                    _logger.debug(answer);
                    return answer;
                };

                var initDrawEvent = function () {
                    var lastPoint = null,
                        $target,
                        targetCssText,
                        absPoint,
                        scale = 1;

                    var lastActiveTarget;
                    var moveNum = 0, rect;
                    var width, height, id;
                    var supportTouch = ('ontouchend' in document);

                    var downEvent = function (e) {
                        var _$target = $(e.target).closest('._nqti-js-img');
                        //防止多点触控造成的bug
                        if (!_$target || !_$target[0] || _$target.hasClass('_move')) {
                            return;
                        }
                        scale = gapUtil.getScale($container);
                        moveNum = 0;
                        e.preventDefault();
                        width = _$target.find('img').width();
                        height = _$target.find('img').height();
                        id = _$target.attr('id');

                        //获取原始位置
                        var tOffset = _$target.find('img').offset();
                        $target = _$target.clone();
                        $container.append($target);
                        if (_$target.parent()[0].tagName === 'LI') {
                            $target.attr('data-parent-style', _$target.parent().attr('style'));
                            $target.attr('data-parent-class', _$target.parent().attr('class'));
                            _$target.parent().addClass('_old');
                        } else {
                            _$target.addClass('_old');
                        }
                        var currentAbsOffset = gapUtil.getOffsetInt($container);
                        //重新计算坐标
                        if (!cOffset || currentAbsOffset.left !== cOffset.left || currentAbsOffset.top !== cOffset.top) {
                            resizeCoor();
                        }
                        cOffset = currentAbsOffset;

                        lastPoint = gapUtil.getEventPoint(e, cOffset);

                        absPoint = {
                            x: lastPoint.x - tOffset.left + cOffset.left,
                            y: lastPoint.y - tOffset.top + cOffset.top
                        };

                        $target.addClass('_move');
                        $target.css({'width': width + 'px', 'height': height + 'px', 'left': (lastPoint.x - absPoint.x) / scale + 'px', 'top': (lastPoint.y - absPoint.y) / scale + 'px'});
                        targetCssText = $target[0].style.cssText.replace('left', '').replace('top', '');
                    };

                    var moveEvent = function (e) {
                        if (!lastPoint) {
                            return;
                        }
                        //pc端重新计算坐标，移动端考虑的效率问题不实时获取坐标
                        if (!supportTouch) {
                            var currentAbsOffset = gapUtil.getOffsetInt($container);
                            //重新计算坐标
                            if (!cOffset || currentAbsOffset.left !== cOffset.left || currentAbsOffset.top !== cOffset.top) {
                                resizeCoor();
                                cOffset = currentAbsOffset;//重新获取
                            }
                        }
                        lastPoint = gapUtil.getEventPoint(e, cOffset);
                        e.preventDefault();
                        e.stopPropagation();
                        if (moveNum % 3 === 0) {
                            rect = gapUtil.intersectRect(that.__rects, lastPoint.x - absPoint.x, lastPoint.y - absPoint.y, height * scale, width * scale, id);
                            if (rect) {
                                if (lastActiveTarget)
                                    lastActiveTarget.removeClass('td-move');
                                lastActiveTarget = $view.find('#' + rect.id);
                                lastActiveTarget.addClass('td-move');
                            } else {
                                if (lastActiveTarget)
                                    lastActiveTarget.removeClass('td-move');
                            }
                        }
                        moveNum++;
                        $target[0].style.cssText = targetCssText + ";" + "left:" + (lastPoint.x - absPoint.x) / scale + "px;" + "top:" + (lastPoint.y - absPoint.y) / scale + "px;";
                    };

                    var stopEvent = function (e) {
                        if (!lastPoint || !absPoint) {
                            return;
                        }
                        if (moveNum === 0) {
                            rect = gapUtil.intersectRect(that.__rects, lastPoint.x - absPoint.x, lastPoint.y - absPoint.y, height * scale, width * scale, id);
                        }
                        $view.find('._old').remove();
                        if (rect) {
                            //相交  定位到目标中心
                            gapUtil.addFill(that.__rects, rect.id, id);
                            $view.find('#' + rect.id).append($target);
                            $target.removeClass('_move').attr('style', '');
                        } else {
                            gapUtil.removeFill(that.__rects, id);
                            var $li = $('<li style="' + $target.attr('data-parent-style') + '" class="' + $target.attr('data-parent-class') + '"></li>');
                            $target.removeClass('_move').attr('style', '');
                            $li.append($target);
                            $ul.append($li);
                        }
                        //移除旧元素
                        $rects.removeClass('td-move');
                        if (lastPoint != null) {
                            that.setAnswer(getAnswer());
                        }
                        lastPoint = null;
                        absPoint = null;
                        rect = null;
                    };

                    var _event = (function (e) {
                        var _downTrigger = false;
                        var bodyRect = null;
                        var __event = function (e) {
                            if (that.isLock()) {
                                return;
                            }
                            if (e.type !== 'touchmove' && e.type !== 'mousemove') {
                                _logger.debug(e.type);
                            }
                            switch (e.type) {
                                case 'touchstart':
                                case 'mousedown':
                                    if (_downTrigger) {
                                        return;
                                    }
                                    _downTrigger = true;
                                    downEvent(e);
                                    bodyRect = {
                                        height: $(document.body).height(),
                                        width: $(document.body).width()
                                    };
                                    break;
                                case 'touchmove':
                                case 'mousemove':
                                    if (!_downTrigger) {
                                        return;
                                    }
                                    moveEvent(e);
                                    var point = gapUtil.coordinate(e);

                                    if (e.type === 'touchmove' &&
                                        (Math.abs(point.clientY - bodyRect.height) <= 15
                                        || Math.abs(point.clientX - bodyRect.width) <= 15
                                        || point.clientX <= 12
                                        || point.clientY <= 12)) {
                                        _downTrigger = false;
                                        stopEvent(e);
                                        return;
                                    }
                                    break;
                                case 'touchend':
                                case 'touchcancel':
                                case 'mouseup':
                                case 'mouseleave':
                                    _downTrigger = false;
                                    stopEvent(e);
                                    break;

                            }
                        };
                        return __event;
                    })();

                    if (_utils.Broswer.any()) {
                        $container.on('touchstart touchmove touchend touchcancel ', _event);
                    } else {
                        $container.on('touchstart touchmove touchend touchcancel mousedown mousemove mouseup mouseleave', _event);
                    }
                };

                initDrawEvent();
                $container.resize(function () {
                    cOffset = gapUtil.getOffsetInt($container);
                    resizeCoor();
                });
            };

            modelItem.renderReset = function ($view) {
                //svg块
                var $gapImgs = $view.find("._nqti-js-td ._nqti-js-img");
                var $ul = $view.find('._nqti-js-side-ul');
                var $side = $view.find('._nqti-js-side');
                $side.show();
                $gapImgs.each(function () {
                    var $this = $(this);
                    var $li = $('<li style="' + $this.attr('data-parent-style') + '" class="' + $this.attr('data-parent-class') + '"></li>');
                    $this.removeClass('_move').attr('style', '');
                    $li.append($this);
                    $ul.append($li);
                });
                gapUtil.removeAllFill(this.__rects);
            };

            modelItem.renderAnswer = function ($view) {
                var answers = this.getAnswer();
                gapUtil.initFill(this.__rects, answers);
                var $gapImgs = $view.find('._nqti-js-img');
                gapUtil.renderAnswer($view, $gapImgs, answers);
            };

            modelItem.renderCheckedAnswer = function ($view) {
                this.renderAnswer($view);
            };

            modelItem.renderCorrectAnswer = function ($view) {
                var answers = this.getCorrectAnswer();
                gapUtil.initFill(this.__rects, answers);
                var $side = $view.find('._nqti-js-side');
                var $gapImgs = $view.find('._nqti-js-img');
                $side.hide();
                gapUtil.renderAnswer($view, $gapImgs, answers);
            };

            modelItem.destroy = function () {

            }
        }
    };
    //注册
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);

})(window, jQuery);


// inlineChoiceInteraction
(function (window, $) {
    //创建
    var _utils = window.QtiPlayer.getUtils();
    var _modelHandler = {
        _name: 'inlineChoiceInteraction',
        //获取model名称
        getName: function () {
            return this._name;
        },
        //创建渲染的方法
        create: function (modelItem) {
            var _model = modelItem.getModel();

            //返回题目类型名称
            modelItem.getName = function () {
                return '文本选择题';
            };
            //该model没有小题编号
            modelItem.hasNum = function () {
                return false;
            };
            //该model没有提示
            modelItem.hasHint = function () {
                return false;
            };
            modelItem.createTitleHtml = function () {
                return '';
            };
            modelItem.createAnswerHtml = function (option) {
                var result = '';
                var choose=_utils.getLangText('inline_choice_choose', option);
                var choice;
                var choiceArr = _model.inlineChoice;
                result += '<span class="qp-model-content"><select class="qp-inline-choice">'
                            + '<option>--' + choose + '--</option>';
                for (var i = 0; i < choiceArr.length; i++) {
                    choice = choiceArr[i];
                    result += '<option value="' + choice.identifier + '">' + choice.content + '</option>';
                }
                result += '</select></span>';
                return result;
            };
            modelItem.render = function ($view, option) {
                var that = this;
                var $select = $view.find('.qp-inline-choice');
                //初始化答案
                var answer = null;
                if (option.showAnswer || option.showCheckedAnswer) {
                    //显示当前用户答案
                    answer = that.getAnswer();
                } else if (option.showCorrectAnswer) {
                    //显示正确答案
                    answer = that.getCorrectAnswer();
                }
                if (answer && answer.length > 0) {
                    $select.val(answer[0]);
                }
                //锁定
                if (option.showLock) {
                    $select.attr('disabled', 'disabled');
                }
            };
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var $select = $view.find('.qp-inline-choice');
                $select.change(function () {
                    var answer = [];
                    answer.push($select.val());
                    that.setAnswer(answer);
                });
            };
        }
    };
    //注册
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


// matchInteraction
(function (window, $) {

    var _utils = window.QtiPlayer.getUtils();
    var _logger = window.QtiPlayer.getLogger();

    var EXTEND_WIDTH = 5;
    var LINE_WIDTH_PC = 8;
    var LINE_WIDTH_MOBIEL = 15;

    var _imgRegex = {
        _imageRegex: /<img([\s\S]*?)\/>/g,
        _srcRegex: /src="([\s\S]*?)"/,
        _widthRegex: /width="([\s\S]*?)"/,
        _heightRegex: /height="([\s\S]*?)"/
    }


    var HTML = {
        SORT_ITEM: ' <li identifier="${identifier}" class="nqti-base-connectLine-sort-list _nqti-js-sort-list">' +
        '               <span class="nqti-base-connectLine-sort-text"><em class="nqti-base-connectLine-sort-text-word">${index}</em></span>' +
        '           </li>',
        PIC_TEXT: '<li id="${id}" matchMax="${max}" class="nqti-base-connectLine-list nqti-base-connectLine-pic-text ${jscls}">' +
        '               <div class="nqti-base-connectLine-list-img">${img}</div>' +
        '               <span class="nqti-base-connectLine-list-btm"><i class="opacity_black_bg" style="display: none;"></i><em class="nqti-base-connectLine-list-btm-word">${text}</em></span>' +
        '           </li>',
        PIC: '<li id="${id}" matchMax="${max}"  class="nqti-base-connectLine-list nqti-base-connectLine-only-pic ${jscls}"><div class="nqti-base-connectLine-list-img">${img}</div></li>',
        TEXT: '<li id="${id}" matchMax="${max}"  class="nqti-base-connectLine-list nqti-base-connectLine-only-text ${jscls}">' +
        '<em class="nqti-base-connectLine-only-text-word">${text}</em>' +
        '</li>',
        ITEM_BODY: '<ul class="nqti-base-connectLine-list-ul">${content}</ul>',
        QUS_BODY: '<div class="nqti-base-connectLine-content ">' +
        '               <div class="nqti-base-connectLine-container clearfix">' +
        '                   <ul class="nqti-base-connectLine-sort-num-ul _nqti-js-sort">${sort}</ul>' +
        '                   ${item}' +
        '               </div>' +
        '               <svg class="nqti-base-connectLine-svg _nqti-js-svg" xmlns="http://www.w3.org/2000/svg" version="1.1"><defs></defs></svg> ' +
        '          </div>'
    };


    var matchUtil = {
        getScale: function ($dom) {
            if ($dom && $dom.length > 0) {
                var offWidth = $dom[0].offsetWidth;
                return (offWidth > 0 ? ($dom[0].getBoundingClientRect().width / offWidth) : 1) || 1;
            }
            return 1;
        },
        getFill: function ($item) {
            var fill = $item.attr('fill');
            if (fill !== undefined && fill != '') {
                return fill.split(',');
            }
            return [];
        },
        _removeFill: function ($item, fillId) {
            var fill = this.getFill($item);
            var index = fill.indexOf(fillId);
            if (index >= 0) {
                fill.splice(index, 1);
                $item.attr('fill', fill.join(','));
            }
        },
        removeFill: function ($view, id, fillId) {
            var item1 = $view.find('#' + id);
            var item2 = $view.find('#' + fillId);
            this._removeFill(item1, fillId);
            this._removeFill(item2, id);
            this.updateItemLineStyle(item1);
            this.updateItemLineStyle(item2);
        },
        removeAllFill: function ($view) {
            var $boxs = $view.find('._nqti-js-resbox,._nqti-js-targetbox');
            $boxs.attr('fill', '');
            $view.find('._nqti-js-svg line').remove();
            $boxs.removeClass('error');
            $boxs.removeClass('correct');
            $boxs.removeClass('on');
        },
        _addFill: function ($item, fillId) {
            var fill = this.getFill($item);
            var index = fill.indexOf(fillId);
            if (index < 0) {
                fill.push(fillId);
                $item.attr('fill', fill.join(','));
            }
        },
        addFill: function ($view, id, fillId) {
            var item1 = $view.find('#' + id);
            var item2 = $view.find('#' + fillId);
            console.log('match', id, fillId);
            this._addFill(item1, fillId);
            this._addFill(item2, id);
            this.updateItemLineStyle(item1);
            this.updateItemLineStyle(item2);
        },
        hasFill: function ($item, fillId) {
            var fill = this.getFill($item);
            var index = fill.indexOf(fillId);
            return index >= 0;
        },
        canFill: function ($item) {
            var fill = this.getFill($item);
            if (fill.length >= parseInt($item.attr('matchMax'))) {
                return false;
            }
            return true;
        },
        getRect: function ($box, res, scale) {
            var w = $box.width() * scale,
                h = $box.height() * scale,
                offset = $box.offset();
            var right = offset.left + w;
            if (res) {
                right = offset.left + w + EXTEND_WIDTH;
            }
            return {
                l: offset.left,
                t: offset.top,
                r: right,
                b: offset.top + h,
                w: w,
                h: h,
                id: $box.attr('id'),
                matchMax: parseInt($box.attr('matchMax'))
            };
        },
        getLinePos: function ($view, absOffset, id, fillId) {
            var scale = this.getScale($view);
            var resRect = this.getRect($view.find('#' + id), true, scale);
            var tRect = this.getRect($view.find('#' + fillId), false, scale);
            var pos = {};
            pos.y1 = (resRect.h) / 2 + resRect.t - absOffset.top;
            pos.x1 = resRect.r - absOffset.left - EXTEND_WIDTH;
            pos.x2 = tRect.l - absOffset.left;
            pos.y2 = tRect.t - absOffset.top + (tRect.h / 2);
            return pos;
        },
        getAnswer: function ($view) {
            var answer = [];
            var that = this;
            $view.find('._nqti-js-resbox').each(function () {
                var fill = that.getFill($(this));
                var id = $(this).attr('id');
                for (var i = 0; i < fill.length; i++) {
                    if (fill[i] != '') {
                        answer.push(id + ' ' + fill[i]);
                    }
                }
            });
            return answer;
        },
        isAnswerItemRight: function (correct, item) {
            var flag = false;
            for (var i = 0; i < correct.length; i++) {
                var answer = correct[i];
                if (answer === item) {
                    flag = true;
                    break;
                }
            }
            return flag;
        },
        getEventPoint: function (e, absOffset) {
            var point = {}, x, y;
            var isTouch = e.originalEvent && (e.originalEvent.targetTouches || e.originalEvent.changedTouches);
            if (isTouch) {
                var event = (e.originalEvent.targetTouches && e.originalEvent.targetTouches.length > 0) ? e.originalEvent.targetTouches : e.originalEvent.changedTouches;
                x = event[0].pageX - absOffset.left;
                y = event[0].pageY - absOffset.top;
                point = {x: x, y: y, touch: true};
            } else {
                var event = e.originalEvent || e;
                x = event.pageX - absOffset.left;
                y = event.pageY - absOffset.top;
                point = {x: x, y: y, touch: false};
            }
            return point;
        },
        coordinate: function (e) {
            switch (e.type) {
                case 'touchstart':
                case 'touchmove':
                case 'touchend':
                case 'touchcancel':
                    var event = (e.originalEvent.targetTouches && e.originalEvent.targetTouches.length > 0) ? e.originalEvent.targetTouches : e.originalEvent.changedTouches;
                    return event[0];
                default:
                    return e;
            }
        },
        updateItemLineStyle: function ($item) {
            var fill = this.getFill($item);
            if (fill.length <= 0) {
                $item.removeClass('on');
            } else {
                $item.addClass('on');
            }
        },
        isRes: function ($item) {
            return $item.hasClass('_nqti-js-resbox');
        },
        _intersectedRect: function (x, y, rects, absOffset) {
            x = x + absOffset.left;
            y = y + absOffset.top;

            var intersected = false;
            var inRect;
            for (var i = 0; i < rects.length; i++) {
                var rect = rects[i];
                if (x > rect.l && x < rect.r && y > rect.t && y < rect.b) {
                    intersected = true;
                    inRect = rect;
                    break;
                }
            }
            return inRect;
        },
        intersectedRect: function ($view, pos, absOffset, resBoxRects) {
            var rect = this._intersectedRect(pos.x, pos.y, resBoxRects, absOffset);
            if (rect == null) {
                return null;
            }
            return this.getFill($view.find('#' + rect.id)).length >= rect.matchMax ? null : rect;
        },
        renderAnswer: function ($view, answers, option, correctAnswers) {
            //数字图标
            var $qpNumber = $view.find('._nqti-js-sort');
            //每个选项的容器
            var $boxs = $view.find('._nqti-js-resbox,._nqti-js-targetbox');

            var $svg = $view.find('._nqti-js-svg');
            var svgdoc = _utils.Svg.getSVGDocument($svg[0]);
            var svgRoot = _utils.Svg.getSVGRoot($svg[0]);
            var scale = matchUtil.getScale($view);
            //初始化答案属性
            answers.forEach(function (answer) {
                var answerArry = answer.split(" ");
                if (answerArry.length === 2) {
                    matchUtil.addFill($view, answerArry[0], answerArry[1]);
                }
            });

            if (option.showCheckedAnswer) {
                //确认接入平台
                var pptshell = _utils.getPlatForm().pptshell === option.platForm;
                //隐藏左侧数字
                if (!pptshell) {
                    $qpNumber.hide();
                }
                //隐藏没有选中的项
                $boxs.each(function () {
                    var $box = $(this);
                    var fill = $box.attr('fill');
                    //是否有选中
                    if (fill === undefined || fill.length <= 0) {
                        if (!pptshell) {
                            $box.hide();
                        }
                    }
                })
            }

            var hide = false;
            for (var i = 0; i < answers.length; i++) {
                var answer = answers[i];
                var answerArry = answer.split(' ');
                if (answerArry.length !== 2) {
                    continue;
                }
                var id = answerArry[0], tid = answerArry[1];
                var pos = matchUtil.getLinePos($view, $svg.offset(), id, tid);
                if (pos) {
                    var line;
                    if (option.showCheckedAnswer) {
                        var fill = $view.find('#' + id).attr('fill');
                        var iscorrect = matchUtil.isAnswerItemRight(correctAnswers, id + ' ' + fill);
                        line = _utils.Svg.addLine(svgdoc, svgRoot, '', pos.x1 / scale, pos.y1 / scale, pos.x2 / scale, pos.y2 / scale, iscorrect ? 'nqti-base-connectLine-normal nqti-base-connectLine-correct' : 'nqti-base-connectLine-normal nqti-base-connectLine-error', '');
                        var $qpItemContainer = $view.find('#' + id + ' ,#' + tid);
                        if (iscorrect) {
                            $qpItemContainer.addClass('correct');
                        } else {
                            $qpItemContainer.addClass('error');
                        }
                    }
                    else {
                        if (option.showCorrectAnswer) {
                            $view.find('#' + id + ',#' + tid).addClass('correct');
                            line = _utils.Svg.addLine(svgdoc, svgRoot, '', pos.x1 / scale, pos.y1 / scale, pos.x2 / scale, pos.y2 / scale, 'nqti-base-connectLine-normal nqti-base-connectLine-correct', '');
                        } else {
                            $view.find('#' + id + ',#' + tid).addClass('on');
                            line = _utils.Svg.addLine(svgdoc, svgRoot, '', pos.x1 / scale, pos.y1 / scale, pos.x2 / scale, pos.y2 / scale, 'nqti-base-connectLine-normal', '');
                        }
                    }
                    $(line).attr('rid', id);
                    $(line).attr('tid', tid);
                    if (pos.x1 <= 5 || pos.x2 <= 5) {
                        hide = true;
                    }
                }
            }
            if (hide === true) {
                $view.find('line').hide();
            } else {
                $view.find('line').show();
            }


        }
    };

//创建
    var _modelHandler = {
        _name: 'matchInteraction',
        //获取model名称
        getName: function () {
            return this._name;
        },
        //创建渲染的方法
        create: function (modelItem) {

            var _model = modelItem.getModel();

            //返回题目类型名称
            modelItem.getName = function () {
                return _utils.getLangText('connection', this.getOption());
            };
            modelItem.getClassName = function () {
                return 'nqti-connectLine';
            };
            modelItem.init = function () {
            }
            modelItem.createTitleHtml = function () {
                return _model.prompt;
            }
            modelItem.createAnswerHtml = function (option) {
                //如果图片有宽高属性，直接加载，防止resize事件触发
                var resizeImg = function (html) {
                    var resultHtml = html.replace(_imgRegex._imageRegex, function (imageInfo, $1) {
                        var result = imageInfo;
                        //使用框架图片加载服务
                        result = result.replace(/\<img/, '<img data-media-img-render="false"').replace(/width=/, '').replace(/height=/, '');
                        return result;
                    });
                    return resultHtml
                };

                var getImage = function (str) {
                    var images = str.match(_imgRegex._imageRegex);
                    if (images.length > 0) {
                        return images[0];
                    }
                    return '';
                };
                var getText = function (str) {
                    return str.replace(_imgRegex._imageRegex, function (imageInfo) {
                        return '';
                    });
                };

                var createItem = function (simpleMatchSet, res) {
                    var html = '';
                    var len = simpleMatchSet.length;
                    var randomArry = _utils.Rd.getAnswerRandom((len * 2 - 1), len, option.randomSeed);
                    if (res) {
                        randomArry = _utils.Rd.getAnswerRandom((len - 1), 0, option.randomSeed);
                    }
                    var jscls = res ? '_nqti-js-resbox' : '_nqti-js-targetbox';
                    for (var i = 0; i < simpleMatchSet.length; i++) {
                        var simpleAC = simpleMatchSet[i];

                        if (_model.shuffle) {
                            simpleAC = simpleMatchSet[res ? randomArry[i] : (randomArry[i] - len)];
                        }

                        var content = resizeImg(simpleAC.content.trim());
                        if (/^<img([^<>]*?)\/>$/.test(content)) {
                            html += _utils.template(HTML.PIC, {id: simpleAC.identifier, max: simpleAC.matchMax, img: content, jscls: jscls})
                        } else if (/<img([^<>]*?)\/>/.test(content)) {
                            html += _utils.template(HTML.PIC_TEXT, {
                                id: simpleAC.identifier,
                                max: simpleAC.matchMax,
                                img: getImage(content),
                                text: getText(content),
                                jscls: jscls
                            })
                        } else {
                            html += _utils.template(HTML.TEXT, {id: simpleAC.identifier, max: simpleAC.matchMax, text: content, jscls: jscls})
                        }
                    }
                    html = _utils.template(HTML.ITEM_BODY, {content: html});
                    return html;
                };
                var item = createItem(_model.simpleMatchSet[0], true);
                item += createItem(_model.simpleMatchSet[1], false);
                var sort = '';
                _model.simpleMatchSet[0].forEach(function (item, i) {
                    sort += _utils.template(HTML.SORT_ITEM, {index: i + 1, identifier: item.identifier});
                });

                var html = _utils.template(HTML.QUS_BODY, {item: item, sort: sort});
                return html;
            }
            modelItem.render = function ($view, option) {
                var that = this;
                var qpNums = $view.find('._nqti-js-sort-list');
                //点击序号回调，统计部分用到
                $view.find('._nqti-js-svg').on('click', function (e) {
                    var point = {
                        x: e.pageX,
                        y: e.pageY
                    };
                    var answers = that.getCorrectAnswer();
                    qpNums.each(function () {
                        var $qpNum = $(this);
                        var offset = $qpNum.offset();
                        var numWidth = $qpNum.width();
                        var numHeight = $qpNum.height();
                        var index = parseInt($qpNum.text()) - 1;
                        var identifier = $qpNum.attr('identifier');
                        if (point.x >= (offset.left - 20) && point.x <= (offset.left + numWidth + 20) && point.y >= (offset.top - 20) && point.y <= (offset.top + numHeight + 20)) {
                            var val;
                            for (var i = 0; i < answers.length; i++) {
                                var answer = answers[i];
                                var answerArry = answer.split(' ');
                                if (answerArry.length !== 2) {
                                    continue;
                                }
                                var id = answerArry[0];
                                if (id == identifier) {
                                    val = answer;
                                    break;
                                }
                            }
                            that.triggerOptionClick(index, val);
                        }
                    });
                });
            };

            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var $resBoxs = $view.find('._nqti-js-resbox');
                var $targetBoxs = $view.find('._nqti-js-targetbox');
                var $svg = $view.find('._nqti-js-svg');
                var svg = $svg[0];
                var svgdoc = _utils.Svg.getSVGDocument(svg);
                var svgRoot = _utils.Svg.getSVGRoot(svg);
                var resBoxRects = [];
                var targetBoxsRects = [];
                var scale = matchUtil.getScale($view);

                /**
                 * 初始化坐标数据
                 */
                var initDataCoor = function () {
                    if (!($targetBoxs && $resBoxs)) {
                        return;
                    }
                    resBoxRects = [];
                    targetBoxsRects = [];
                    $resBoxs.each(function () {
                        var rect = matchUtil.getRect($(this), true, scale);
                        resBoxRects.push(rect);
                    });
                    $targetBoxs.each(function () {
                        targetBoxsRects.push(matchUtil.getRect($(this), false, scale));
                    });
                };

                /**
                 * 初始化画图事件
                 */
                var initDrawEvent = function () {
                    var $line = null,
                        isTargetRect = null;

                    //获取触发的矩形区域和起点
                    var getLinePoint = function (lastPoint, absOffset) {
                        var downRect = {};
                        isTargetRect = false;
                        var rect = matchUtil.intersectedRect($view, lastPoint, absOffset, resBoxRects);
                        if (!rect) {
                            isTargetRect = true;
                            rect = matchUtil.intersectedRect($view, lastPoint, absOffset, targetBoxsRects);
                        }
                        downRect.rect = rect;
                        if (!rect) {
                            lastPoint = null;
                            return downRect;
                        }

                        downRect.y1 = (rect.b - rect.t) / 2 + rect.t - absOffset.top;
                        if (isTargetRect) {
                            downRect.x1 = rect.r - absOffset.left - rect.w;
                        } else {
                            downRect.x1 = rect.r - absOffset.left - EXTEND_WIDTH;
                        }
                        return downRect;
                    };

                    var downEvent = function (e, lastPoint, absOffset) {
                        //重新计算坐标
                        var downRect = getLinePoint(lastPoint, absOffset);
                        if (!downRect.rect) {
                            return;
                        }
                        var line = _utils.Svg.addLine(svgdoc, svgRoot, '', downRect.x1 / scale, downRect.y1 / scale, lastPoint.x / scale, lastPoint.y / scale, 'nqti-base-connectLine-normal', '');
                        $line = $(line);
                        $line.attr('rid', downRect.rect.id);
                    };

                    var moveEvent = function (e, lastPoint) {
                        if ($line != null) {
                            e.preventDefault();
                            $line.attr('x2', lastPoint.x / scale);
                            $line.attr('y2', lastPoint.y / scale);
                        }
                    };

                    //动态高亮连线，返回当前点所在的直线
                    var hoverLine = function (point, lineWidth) {
                        var $lines = $view.find('.nqti-base-connectLine-normal');
                        $lines.attr('class', 'nqti-base-connectLine-normal');
                        var $line = null;
                        var width = 100;
                        $lines.each(function () {
                            var x1 = this.x1.baseVal.value, y1 = this.y1.baseVal.value, x2 = this.x2.baseVal.value, y2 = this.y2.baseVal.value;
                            var pwidth = _utils.Area.pointToLine(x1, y1, x2, y2, point.x / scale, point.y / scale);
                            if (pwidth <= width) {
                                width = pwidth;
                                $line = $(this);
                            }
                        });
                        if ($line) {
                            if (width <= lineWidth) {
                                $line.attr('class', 'nqti-base-connectLine-normal nqti-base-connectLine-hover')
                            } else {
                                $line = null;
                            }
                        }
                        return $line;
                    };

                    var stopEvent = function (e, lastPoint, absOffset) {
                        if ($line != null) {
                            var id = $line.attr('rid');

                            var tRect = matchUtil.intersectedRect($view, lastPoint, absOffset, isTargetRect ? resBoxRects : targetBoxsRects);
                            if (!tRect || matchUtil.hasFill($view, id, tRect.id)) {
                                $line.remove();
                            } else {
                                if (isTargetRect) {
                                    $line.attr('x2', (tRect.r - absOffset.left - EXTEND_WIDTH) / scale);
                                } else {
                                    $line.attr('x2', (tRect.l - absOffset.left) / scale);
                                }
                                $line.attr('y2', (tRect.t - absOffset.top + ((tRect.b - tRect.t) / 2)) / scale);
                                //绑定答案
                                matchUtil.addFill($view, id, tRect.id);
                                $line.attr('tid', tRect.id);
                            }
                            that.setAnswer(matchUtil.getAnswer($view));
                        }
                        $line = null;
                    };

                    var $lastTarget;

                    var click = function (e) {
                        var pos = matchUtil.getEventPoint(e, $svg.offset());
                        var $line = hoverLine(pos, pos.touch ? LINE_WIDTH_MOBIEL : LINE_WIDTH_PC);
                        if ($line) {
                            $line.remove();
                            matchUtil.removeFill($view, $line.attr('rid'), $line.attr('tid'));
                            that.setAnswer(matchUtil.getAnswer($view));
                        } else {
                            var rect = matchUtil.intersectedRect($view, pos, $svg.offset(), resBoxRects);
                            if (!rect) {
                                rect = matchUtil.intersectedRect($view, pos, $svg.offset(), targetBoxsRects);
                            }
                            if (rect) {
                                var $box = $view.find('#' + rect.id);

                                var res = $box.hasClass('_nqti-js-resbox');
                                if (!matchUtil.canFill($box)) {
                                    return;
                                }
                                if ($lastTarget && matchUtil.canFill($lastTarget)) {

                                    var lastIsRes = matchUtil.isRes($lastTarget);
                                    var boxId = $box.attr('id');
                                    var lastBoxId = $lastTarget.attr('id');

                                    if ($lastTarget[0] == $box[0]) {
                                        //和上一个相同，直接移除
                                        $lastTarget = null;
                                        $box.removeClass('on');
                                    } else if (res === lastIsRes) {
                                        //在同一侧，移除上一个的样式
                                        $lastTarget.removeClass('on');
                                        $lastTarget = $box;
                                        $lastTarget.addClass('on');
                                    } else if (!matchUtil.hasFill($lastTarget, boxId)) {

                                        var pos = {};
                                        if (lastIsRes) {
                                            pos = matchUtil.getLinePos($view, $svg.offset(), lastBoxId, boxId);
                                        } else {
                                            pos = matchUtil.getLinePos($view, $svg.offset(), boxId, lastBoxId);
                                        }
                                        var line = _utils.Svg.addLine(svgdoc, svgRoot, '', pos.x1 / scale, pos.y1 / scale, pos.x2 / scale, pos.y2 / scale, 'nqti-base-connectLine-normal', '');
                                        $(line).attr('tid', boxId);
                                        $(line).attr('rid', lastBoxId);
                                        matchUtil.addFill($view, boxId, lastBoxId);
                                        that.setAnswer(matchUtil.getAnswer($view));
                                        $lastTarget.addClass('on');
                                        $box.addClass('on');
                                        $lastTarget = null;
                                    }
                                } else {
                                    $box.addClass('on');
                                    $lastTarget = $box;
                                }
                            }
                        }
                    };


                    var _event = (function (e) {
                        var _downTrigger = false;
                        var _lastPoint = null;
                        var _startPos = null;
                        var _endPos = null;
                        var _startTime;
                        var _absOffset = null;
                        var bodyRect = null;
                        var __event = function (e) {
                            if (that.isLock()) {
                                return;
                            }
                            if (e.type !== 'touchmove' && e.type !== 'mousemove') {
                                _logger.debug(e.type);
                                //_logger.debug(e.type);
                            }
                            switch (e.type) {
                                case 'touchstart':
                                case 'mousedown':
                                    //防止多点触控异常
                                    if (_downTrigger) {
                                        return;
                                    }
                                    _downTrigger = true;
                                    var currentAbsOffset = $svg.offset();
                                    //重新计算坐标
                                    if (!_absOffset || currentAbsOffset.left !== _absOffset.left || currentAbsOffset.top !== _absOffset.top) {
                                        initDataCoor();
                                    }
                                    _absOffset = currentAbsOffset;//获取offset的差额
                                    _lastPoint = matchUtil.getEventPoint(e, _absOffset);
                                    _startPos = _lastPoint;
                                    _startTime = new Date().getTime();
                                    _lastPoint.x = _lastPoint.x;
                                    _lastPoint.y = _lastPoint.y;
                                    downEvent(e, _lastPoint, _absOffset);
                                    bodyRect = {
                                        height: $(document.body).height(),
                                        width: $(document.body).width()
                                    };
                                    break;
                                case 'touchmove':
                                case 'mousemove':
                                    if (!_downTrigger) {
                                        if (e.type === 'mousemove') {
                                            hoverLine(matchUtil.getEventPoint(e, $svg.offset()), LINE_WIDTH_PC);
                                        }
                                        return;
                                    }
                                    _lastPoint = matchUtil.getEventPoint(e, _absOffset);
                                    _lastPoint.x = _lastPoint.x;
                                    _lastPoint.y = _lastPoint.y;
                                    _endPos = _lastPoint;

                                    var point = matchUtil.coordinate(e);

                                    if (e.type === 'touchmove' &&
                                        (Math.abs(point.clientY - bodyRect.height) <= 15
                                        || Math.abs(point.clientX - bodyRect.width) <= 15
                                        || point.clientX <= 12
                                        || point.clientY <= 12)) {
                                        stopEvent(e, _lastPoint, _absOffset);
                                        _downTrigger = false;
                                        _lastPoint = null;
                                        return;
                                    }
                                    moveEvent(e, _lastPoint);
                                    break;
                                case 'touchend':
                                case 'touchcancel':
                                case 'mouseup':
                                case 'mouseleave':
                                    _lastPoint = matchUtil.getEventPoint(e, $svg.offset());
                                    _endPos = _lastPoint;
                                    stopEvent(e, _lastPoint, _absOffset);
                                    _downTrigger = false;
                                    _lastPoint = null;

                                    if (_endPos && e.type === 'mouseup') {
                                        var _holdTime = new Date().getTime() - _startTime;
                                        var dx = Math.abs(_endPos.x - _startPos.x);
                                        var dy = Math.abs(_endPos.y - _startPos.y);
                                        if (_holdTime > 800 || dx >= 5 || dy >= 5) {
                                            return;
                                        }
                                        click(e);
                                    }
                                    break;
                                case 'qpTap':
                                    //case 'click':
                                    if (_endPos && e.type === 'click') {
                                        var _holdTime = new Date().getTime() - _startTime;
                                        var dx = Math.abs(_endPos.x - _startPos.x);
                                        var dy = Math.abs(_endPos.y - _startPos.y);
                                        if (_holdTime > 800 || dx >= 5 || dy >= 5) {
                                            return;
                                        }
                                    }
                                    click(e);
                                    break;
                            }
                        };
                        return __event;
                    })();

                    if (_utils.Broswer.any()) {
                        $svg.on('qpTap touchstart touchmove touchend touchcancel ', _event);
                    } else {
                        $svg.on('click touchstart touchmove touchend touchcancel mousedown mousemove mouseup mouseleave ', _event);
                    }

                };

                initDataCoor();
                initDrawEvent();

            };


            modelItem.renderReset = function ($view, removeResize) {
                var $qpNumber = $view.find('._nqti-js-sort');
                var $boxs = $view.find('._nqti-js-resbox,._nqti-js-targetbox');
                if (removeResize !== false) {
                    $view.find('._nqti-js-resbox,._nqti-js-targetbox,.nqti-base-connectLine-content').off('resize');
                }
                //显示放在后面，防止触发resize事件
                $qpNumber.show();
                $boxs.show();
                matchUtil.removeAllFill($view);
            };

            modelItem.renderAnswer = function ($view) {
                var that = this;
                var answers = this.getAnswer();
                var correctAnswers = this.getCorrectAnswer();
                var option = that.getOption();
                $view.find('._nqti-js-resbox,._nqti-js-targetbox,.nqti-base-connectLine-content').off('resize');
                var showAnswer = function () {
                    that.renderReset($view, false);
                    matchUtil.renderAnswer($view, answers, option, correctAnswers);
                };

                //列高度变化，或者整体高度变化触发显示答案
                $view.find('._nqti-js-resbox,._nqti-js-targetbox,.nqti-base-connectLine-content').resize(function () {
                    showAnswer();
                });
                showAnswer();
            };

            modelItem.renderCheckedAnswer = function ($view) {
                this.renderAnswer($view);
            };

            modelItem.renderCorrectAnswer = function ($view) {
                var that = this;
                var answers = this.getCorrectAnswer();
                var option = that.getOption();
                $view.find('._nqti-js-resbox,._nqti-js-targetbox,.nqti-base-connectLine-content').off('resize');
                var showAnswer = function () {
                    that.renderReset($view, false);
                    matchUtil.renderAnswer($view, answers, option, answers);
                };

                //列高度变化，或者整体高度变化触发显示答案
                $view.find('._nqti-js-resbox,._nqti-js-targetbox,.nqti-base-connectLine-content').resize(function () {
                    showAnswer();
                });
                showAnswer();
            };

            modelItem.destroy = function () {

            }
        }
    };

    //注册
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);

})
(window, jQuery);


// choiceInteraction
(function (window, $) {
    var _utils = window.QtiPlayer.getUtils();


    var HTML = {
        PIC_TEXT: '<li data-id="${identifier}" class="nqti-base-sequence-list nqti-base-sequence-pic-text">' +
        '               ${img}' +
        '               <span class="nqti-base-sequence-list-btm-text">' +
        '                   <i class="opacity_black_bg" style="display: none;"></i>'+
        '                   <em class="nqti-base-sequence-list-btm-word">${text}</em>' +
        '               </span>' +
        '           </li>',
        PIC: '<li data-id="${identifier}" class="nqti-base-sequence-list nqti-base-sequence-only-pic">${img}</li>',
        TEXT: '<li data-id="${identifier}" class="nqti-base-sequence-list nqti-base-sequence-only-text">' +
        '<em class="nqti-base-sequence-only-text-word">${text}</em>' +
        '</li>',
        ITEM_BODY: '<ul class="nqti-base-sequence-list-ul clearfix _nqti-js-sequence-ul ">${content}</ul>'
    };


    var _modelHandler = {
        _name: 'orderInteraction',
        //获取modal名称
        getName: function () {
            return this._name;
        },

        //创建渲染的方法
        create: function (modelItem) {
            var _model = modelItem.getModel();
            //选项数据处理,将排序项的中的图片分离出来
            var simpleChoice = _model.simpleChoice;
            var choice;
            var imageRegex = /<img[\s\S]*?\/>/g;
            for (var index = 0; index < simpleChoice.length; index++) {
                choice = simpleChoice[index];
                //图片内容处理
                var image = '';
                choice.content = choice.content.replace(imageRegex, function (imageHtml) {
                    //设置图片期望高宽属性
                    var attr = imageHtml.substring(4, imageHtml.length - 2);
                    image = '<img data-class="qp-order-image" data-media-img-render=\'{"renderUI":false,"minWidth":205,"minHeight":165}\'  ' + attr + ' />'.replace(/width=/, '').replace(/height=/, '');
                    return '';
                });
                choice.image = image;
            }

            var getAnswer = function ($paixuList) {
                var answer = [];
                $paixuList.children('li').each(function () {
                    answer.push($(this).data('id'));
                });
                return answer;
            };

            var getRandomSimpleChoice = function (_model, correctAnswer, randomSeed) {
                var simpleChoice = [];
                simpleChoice.pushArray(_model.simpleChoice);
                //答题模式
                if (_model.shuffle) {
                    //乱序
                    simpleChoice = _utils.Rd.shuffleArray(simpleChoice, randomSeed);
                    //排除正确答案
                    var same = true;
                    for (var i = 0; i < simpleChoice.length; i++) {
                        if (simpleChoice[i].identifier != correctAnswer[i]) {
                            same = false;
                            break;
                        }
                    }
                    if (same) {
                        //如果乱序后还是正确答案，则取出第一个选项，插入到组后
                        var firstChoice = simpleChoice.shift();
                        simpleChoice.push(firstChoice);
                    }
                }
                return simpleChoice;
            };

            //返回题目类型名称
            modelItem.getName = function () {
                return _utils.getLangText('sort', this.getOption());
            };
            modelItem.getClassName = function () {
                return 'nqti-sequence';
            };
            //创建model html片段
            modelItem.createTitleHtml = function () {
                return _model.prompt;
            };
            modelItem.createAnswerHtml = function (option) {
                var that = this;
                var result;

                var simpleChoice = getRandomSimpleChoice(_model, that.getCorrectAnswer(), option.randomSeed);
                //渲染选项
                var choice;
                var itemHtml = '';
                for (var index = 0; index < simpleChoice.length; index++) {
                    choice = simpleChoice[index];
                    if (choice.image === '') {
                        itemHtml += _utils.template(HTML.TEXT, {text: choice.content, identifier: choice.identifier});
                    } else if (choice.content && choice.content.trim() !== '') {
                        itemHtml += _utils.template(HTML.PIC_TEXT, {img: choice.image, text: choice.content, identifier: choice.identifier});
                    } else {
                        itemHtml += _utils.template(HTML.PIC, {img: choice.image, identifier: choice.identifier});
                    }
                }
                result = _utils.template(HTML.ITEM_BODY, {content: itemHtml});
                return result;
            };
            modelItem.render = function ($view, option) {

            };

            modelItem.renderReset = function ($view) {
                var simpleChoice = getRandomSimpleChoice(_model, this.getCorrectAnswer(), this.getOption().randomSeed);
                var $paixuList = $view.find('._nqti-js-sequence-ul');
                simpleChoice.forEach(function (choice) {
                    $paixuList.find('[data-id="' + choice.identifier + '"]').appendTo($paixuList);
                });
                return getAnswer($paixuList);
            };

            modelItem.renderAnswer = function ($view) {
                var $paixuList = $view.find('._nqti-js-sequence-ul');
                var answers = this.getAnswer();
                answers.forEach(function (answer) {
                    $paixuList.find('[data-id="' + answer + '"]').appendTo($paixuList);
                });
                this.setAnswer(getAnswer($paixuList));
            };

            modelItem.renderCheckedAnswer = function ($view) {
                this.renderAnswer($view);
            };

            modelItem.renderCorrectAnswer = function ($view) {
                var $paixuList = $view.find('._nqti-js-sequence-ul');
                var correctAnswer = this.getCorrectAnswer();
                correctAnswer.forEach(function (answer) {
                    $paixuList.find('[data-id="' + answer + '"]').appendTo($paixuList);
                });
            };

            modelItem.renderLock = function ($view) {
                //重置内部option值
                var $paixuList = $view.find('._nqti-js-sequence-ul');
                if (this.isLock()) {
                    $paixuList.dragsort("disabled");
                } else {
                    $paixuList.dragsort("enable");
                }
            };

            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var $paixuList = $view.find('._nqti-js-sequence-ul');
                //
                //初始化答案
                if (option.showAnswerArea || option.showStatisAnswer) {
                    that.setAnswer(getAnswer($paixuList));
                }
                //拖动事件
                $paixuList.dragsort({
                    draggable: {
                        zIndex: 999,
                        selector: 'li'
                    },
                    update: function () {
                        that.setAnswer(getAnswer($paixuList));
                    }
                });
            };
        }
    };
    //注册
    var _QtiPlayer = window.QtiPlayer;
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


// textEntryInteraction
(function (window, $) {
    var _QtiPlayer = window.QtiPlayer;
    var _utils = _QtiPlayer.getUtils();

    //创建
    var _modelHandler = {
        _name: 'textEntryInteraction',
        //获取model名称
        getName: function () {
            return this._name;
        },
        create: function (modelItem) {
            //创建渲染方法
            var _model = modelItem.getModel();

            //返回题目类型名称
            modelItem.getName = function () {
                return _utils.getLangText('blank_filling', this.getOption());
            };
            //该model没有小题编号
            modelItem.hasNum = function () {
                return false;
            };
            //该model没有提示
            modelItem.hasHint = function () {
                return false;
            };
            modelItem.hasTitle = function () {
                return false;
            };
            modelItem.isBlock = function () {
                return false;
            };
            //创建html对象的方法
            modelItem.createTitleHtml = function () {
                return '';
            };
            modelItem.createAnswerHtml = function (option) {
                var that = this;
                var maxLangthAttr = '';
                if (_model.expectedLength > 0) {
                    maxLangthAttr = ' maxlength="' + _model.expectedLength + '" ';
                }
                var modelId = _model.modelId;
                var num = modelId.substring(modelId.lastIndexOf('-') + 1);
                //显示填空区域
                var result = '';

                //显示正确答案
                var answer = that.getCorrectAnswer();
                var currentAnswer = '';
                if (answer.length > 0) {
                    currentAnswer = answer[0];
                }
                var showNum = option.showSubSequence && option.showCorrectAnswer;
                var sequence = '<span class="nqti-base-fill-index _qp-text-showcorrectanswer-num ' + (showNum ? '' : 'nqti-hide-dom') + '">' + num + '</span>';
                result += '<span data-num="' + num + '" class="nqti-base-fill-cell nqti-correct _qp-text-input _qp-text-showcorrectanswer ' + (option.showCorrectAnswer ? '' : 'nqti-hide-dom') + '">'
                    + sequence
                    + currentAnswer
                    + '</span>';

                //checkedAnswer
                result += '<span data-num="' + num + '" class="nqti-base-fill-cell  _qp-text-input _qp-text-showcheckedanswer fill-cell-min-width ' + (option.showCheckedAnswer ? '' : 'nqti-hide-dom') + '">'
                    + '</span>';


                //显示统计样式
                result += '<span class="nqti-base-fill-cell _qp-text-input _qp-text-showstatisanswer ' + (option.showStatisAnswer ? '' : 'nqti-hide-dom') + '"><span class="nqti-base-fill-index">' + num + '</span></span>';

                //其他模式显示
                var showNormal = !option.showCorrectAnswer && !option.hideAnswerArea && !option.showStatisAnswer;
                var type = _model.keyboard;
                if ((typeof DigitalInput !== 'undefined') && _model.keyboard === 'number') {
                    result += '<span data-index="0" class="nqti-base-fill-cell span-to-div _qp-text-input qp-digital-container _qp-text-normal ' + (showNormal ? '' : 'nqti-hide-dom') + '"  id="' + _utils.Rd.getRandom() + '"></span>';
                } else {
                    var cls = '';
                    if (_model.keyboard === 'number') {
                        cls = 'input-number';
                    }
                    var step = '0.000000000001';
                    if (_utils.Broswer.isIE()) {
                        step = 'any';
                    }
                    result += '<input data-index="0" step="' + step + '" class="nqti-base-fill-cell ' + cls + ' _qp-text-input _qp-text-normal ' + (showNormal ? '' : 'nqti-hide-dom') + '" '
                        + ' data-type="' + type + '"'
                        + maxLangthAttr + '  type="' + type + '"/>';
                }
                var result = '<span class="nqti-base-fill _qp-base-fill">'
                    + result
                    + '<input style="position: absolute;left: -10000px;top: -10000px;" class="nqti-base-fill-cell _qp-text-hidden "  type="text">'
                    + '</span>';
                return result;
            };

            modelItem.render = function ($view, option) {
                var that = this;
                //填空点击回调
                $view.find('._qp-base-fill').bind('qpTap', function () {
                    var correctAnswer = that.getCorrectAnswer();
                    that.triggerOptionClick(0, correctAnswer[0]);
                });

                that.__digitalReset = false;
                //获取实际输入的文本框
                var $input = $view.find('._qp-text-input._qp-text-normal');
                if ($input.length <= 0) {
                    return;
                }
                if ($input.attr('type') !== 'number') {
                    $input.qtiAutogrow({
                        maxWidth: '._qti-player',
                        shadow: 'nqti-base-fill-cell',
                        vertical: false,
                        horizontal: true,
                        postGrowCallback:function(ele){
                            //解决pad上无法触发父节点重绘的问题
                            ele.closest('._qp-model').css('-webkit-box-shadow', '0 0 1px rgba(0, 0, 0, 0)');
                            setTimeout(function () {
                                ele.closest('._qp-model').css('-webkit-box-shadow', '');
                            }, 50);
                        }
                        //minWidth: $view.find('._qp-text-hidden')
                        //, debugx: 00
                        //, debugy: 100
                    });
                }
                //是否数字键盘
                var isDigital = $input.hasClass('qp-digital-container');
                if (option.showAnswerArea) {
                    if (_model.width) {
                        var width = _model.width * 18;
                        width = width < 60 ? 60 : width;
                        $input.css('width', width + 'px');
                    }
                }
                if (isDigital) {
                    //注册数字键盘
                    DigitalInput.InputManager.getInstance().register($input.get(0), function () {
                        if (that.__digitalReset) {
                            that.__digitalReset = false;
                            return;
                        }
                        //实时更新回调答案
                        var newValue = DigitalInput.InputManager.getInstance().getText4Dom($input.get(0));
                        var answer = [];
                        answer.push(newValue.toString());
                        that.setAnswer(answer);
                    });
                }
            };
            //创建事件处理方法
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var _$input = $view.find('._qp-text-input._qp-text-normal');
                var isDigital = _$input.hasClass('qp-digital-container');
                if (isDigital) {
                    return;
                }
                var _timer = null;
                var _lastValue = '';
                //保存当前答案
                var saveAnswer = function (newValue) {
                    var answer = [];
                    answer.push(newValue);
                    that.setAnswer(answer);
                };

                //获取焦点时定时检测输入输入框变化
                _$input.bind('focus', function () {
                    _timer = setInterval(function () {
                        var newValue = _$input.val().trim();
                        if (newValue !== _lastValue) {
                            //输入内容有变化
                            _lastValue = newValue;
                            saveAnswer(newValue);
                        }
                    }, 500);
                });

                //输入结束后保存答案
                _$input.bind('blur', function () {
                    //清空定时器
                    clearInterval(_timer);
                    _timer = null;
                    //保存作答
                    var newValue = _$input.val().trim();
                    if (_$input.attr('data-type') === 'number' && _utils.Broswer.IEVersion() === 8) {
                        if (newValue === '-' || newValue === '.') {
                            newValue = '';
                        }
                    }
                    _$input.val(newValue);
                    _lastValue = newValue;
                    saveAnswer(newValue);
                });

                if (_utils.Broswer.isIE() && _$input.attr('data-type') === 'number') {
                    _$input.keydown(function (e) {
                        return _utils.Dom.inputNumberKeydown(_$input, e);
                    });
                }
            };

            modelItem.renderReset = function ($view) {
                var $input = $view.find('._qp-text-input._qp-text-normal');
                $input.removeClass('nqti-error');
                $input.removeClass('nqti-correct');
                var isDigital = $input.hasClass('qp-digital-container');
                if (isDigital) {
                    this.__digitalReset = true;
                    DigitalInput.InputManager.getInstance().setText4DOM('', $input.get(0));
                } else {
                    $input.val('');
                    $input.trigger('input');
                }
                $view.find('._qp-text-showcorrectanswer').addClass('nqti-hide-dom');
                $view.find('._qp-text-showcorrectanswer-num').addClass('nqti-hide-dom');
                $view.find('._qp-text-showstatisanswer').addClass('nqti-hide-dom');
                $view.find('._qp-text-normal').removeClass('nqti-hide-dom');
                var $checkedAnswer = $view.find('._qp-text-showcheckedanswer');
                $checkedAnswer.addClass('nqti-hide-dom');
                $checkedAnswer.removeClass('nqti-error');
                $checkedAnswer.removeClass('nqti-correct');
                $checkedAnswer.addClass('fill-cell-min-width');

            };

            modelItem.renderAnswer = function ($view) {
                //获取实际输入的文本框
                var $input = $view.find('._qp-text-input._qp-text-normal');
                //是否数字键盘
                var isDigital = $input.hasClass('qp-digital-container');
                var answer = this.getAnswer();
                if (answer.length > 0) {
                    if (isDigital) {
                        DigitalInput.InputManager.getInstance().setText4DOM(answer[0], $input.get(0));
                    } else {
                        $input.val(answer[0]);
                        $input.trigger('input');
                    }
                }
            };

            modelItem.renderCheckedAnswer = function ($view) {
                var that = this;
                //获取实际输入的文本框
                var $answer = $view.find('._qp-text-showcheckedanswer');
                $answer.removeClass('nqti-hide-dom');
                $view.find('._qp-text-normal').addClass('nqti-hide-dom');

                var answer = this.getAnswer();
                var correctAnswer = this.getCorrectAnswer();
                answer = answer.length > 0 ? answer[0] : '';
                $answer.html(answer !== '' ? answer : '&nbsp;');

                var checkedClass = this.checkTextAnswer(correctAnswer[0], answer) ? 'nqti-correct' : 'nqti-error';
                $answer.addClass(checkedClass);
                //渲染公式
                if (typeof MathJax != typeof  undefined) {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, $answer[0]]);
                }

                this.__resizeCheckWidth($view);
                $answer.resize(function () {
                    that.__resizeCheckWidth($view);
                });
            };

            modelItem.__resizeCheckWidth = function ($view) {
                var inputWidth = $view.find('._qp-text-hidden')[0].clientWidth;
                var $answer = $view.find('._qp-text-showcheckedanswer');
                if ($answer.width() < (inputWidth + 5)) {
                    $answer.addClass('fill-cell-min-width');
                } else {
                    $answer.removeClass('fill-cell-min-width');
                }
            };

            modelItem.__unbindResize = function ($view) {
                var $answer = $view.find('._qp-text-showcheckedanswer');
                $answer.off('resize');
            };

            modelItem.renderStatisAnswer = function ($view) {
                $view.find('._qp-text-showstatisanswer').removeClass('nqti-hide-dom');
                $view.find('._qp-text-normal').addClass('nqti-hide-dom');
            };

            modelItem.renderCorrectAnswer = function ($view) {
                $view.find('._qp-text-showcorrectanswer').removeClass('nqti-hide-dom');
                if (this.getOption().showSubSequence) {
                    $view.find('._qp-text-showcorrectanswer-num').removeClass('nqti-hide-dom');
                }
                $view.find('._qp-text-normal').addClass('nqti-hide-dom');
            };

            modelItem.renderLock = function ($view) {
                var $input = $view.find('._qp-text-input._qp-text-normal');
                //是否数字键盘
                var isDigital = $input.hasClass('qp-digital-container');

                if (this.isLock()) {
                    if (isDigital) {
                        DigitalInput.InputManager.getInstance().setDisabled4DOM($input.get(0), true);
                    } else {
                        $input.attr('disabled', 'disabled');
                    }
                } else {
                    if (isDigital) {
                        DigitalInput.InputManager.getInstance().setDisabled4DOM($input.get(0), false);
                    } else {
                        $input.removeAttr('disabled');
                    }
                }
            };
        }
    };
    //注册
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


// choiceInteraction
(function (window, $) {
    var _QtiPlayer = window.QtiPlayer;
    var _utils = _QtiPlayer.getUtils();
    //创建
    var _modelHandler = {
        _name: 'textEntryMultipleInteraction',
        //获取model名称
        getName: function () {
            return this._name;
        },
        create: function (modelItem) {
            var _model = modelItem.getModel();
            _model.textEntry = [];
            var _initAnswer = [];
            var _textEntryRegex = /<textEntry[\s\S]*?\/>/g;
            var keyboardRegex = /keyboard="([\s\S]*?)"/;
            var widthRegex = /width="(\d+)"/;
            var textEntrys = _model.prompt.match(_textEntryRegex);
            var expectedLengthRegex = /expectedLength="(\d+)"/;
            var expectedLength;
            var keyboard;
            var width;
            for (var i = 0; i < textEntrys.length; i++) {
                expectedLength = _utils.getIntValue(textEntrys[i], expectedLengthRegex);
                keyboard = _utils.getValue(textEntrys[i], keyboardRegex);
                width = _utils.getIntValue(textEntrys[i], widthRegex);
                if (!keyboard) {
                    keyboard = 'text';
                }
                _model.textEntry.push({
                    expectedLength: expectedLength,
                    keyboard: keyboard,
                    width: width
                });
                _initAnswer.push('');
            }


            var saveAnswer = function (that, index, newValue) {
                var answer = that.getAnswer();
                if (answer.length === 0) {
                    answer = _initAnswer;
                }
                answer[index] = newValue;
                that.setAnswer(answer);
            };

            //返回题目类型名称
            modelItem.getName = function () {
                return _utils.getLangText('blank_filling', this.getOption());
            };

            modelItem.createTitleHtml = function (option) {
                return _utils.getLangText('text_title', option);
            };
            modelItem.createAnswerHtml = function (option) {
                var that = this;
                var textEntry = _model.textEntry;
                var prompt = _model.prompt;
                var index = 0;
                prompt = prompt.replace(_textEntryRegex, function (m) {
                    var num = index + 1;
                    var object = textEntry[index];
                    var maxLangthAttr = '';
                    if (object.expectedLength > 0) {
                        maxLangthAttr = ' maxlength="' + object.expectedLength + '" ';
                    }
                    //显示填空区域

                    //显示正确答案
                    var answer = that.getCorrectAnswer();
                    var currentAnswer = '';
                    if (answer.length > 0) {
                        currentAnswer = answer[index];
                    }
                    var sequence = '';
                    var showNum = option.showSubSequence && option.showCorrectAnswer;
                    if (option.showSubSequence) {
                        sequence = '<span class="nqti-base-fill-index _qp-text-showcorrectanswer-num ' + (showNum ? '' : 'nqti-hide-dom') + '">' + num + '</span>';
                    }
                    var input = '<span data-index="' + index + '" class="nqti-base-fill-cell nqti-correct _qp-text-input _qp-text-showcorrectanswer ' + (option.showCorrectAnswer ? '' : 'nqti-hide-dom') + '">'
                        + sequence
                        + currentAnswer
                        + '</span>';


                    //checkedAnswer
                    input += '<span data-index="' + index + '" class="nqti-base-fill-cell  _qp-text-input _qp-text-showcheckedanswer fill-cell-min-width ' + (option.showCheckedAnswer ? '' : 'nqti-hide-dom') + '">'
                        + '</span>';

                    //显示统计样式
                    input += '<span data-index="' + index + '" class="nqti-base-fill-cell _qp-text-input _qp-text-showstatisanswer ' + (option.showStatisAnswer ? '' : 'nqti-hide-dom') + '"><span class="nqti-base-fill-index">' + num + '</span></span>';

                    //其他模式显示
                    var showNormal = !option.showCorrectAnswer && !option.hideAnswerArea && !option.showStatisAnswer;
                    if ((typeof DigitalInput !== 'undefined') && object.keyboard === 'number') {
                        input += '<span class="_qp-text-input nqti-base-fill-cell span-to-div qp-digital-container  _qp-text-normal ' + (showNormal ? '' : 'nqti-hide-dom') + '"  data-index="' + index + '" id="' + _utils.Rd.getRandom() + '"></span>';
                    } else {
                        var cls = '';
                        if (object.keyboard === 'number') {
                            cls = 'input-number';
                        }
                        var step = '0.000000000001';
                        if (_utils.Broswer.isIE()) {
                            step = 'any';
                        }
                        input += '<input step="' + step + '" class="nqti-base-fill-cell ' + cls + ' _qp-text-input  _qp-text-normal ' + (showNormal ? '' : 'nqti-hide-dom') + '" '
                            + maxLangthAttr
                            + ' data-index="' + index + '"'
                            + ' data-type="' + object.keyboard + '"'
                            + ' type="' + object.keyboard + '"/>';
                    }
                    index++;
                    return input;
                });
                var result = '<div class="nqti-base-fill _qp-base-fill">'
                    + prompt
                    + '<input style="position: absolute;left: -10000px;top: -10000px;" class="nqti-base-fill-cell _qp-text-hidden "  type="text">'
                    + '</div>';
                return result;
            };
            modelItem.render = function ($view, option) {
                var that = this;
                that.__digitalResetCount = 0;

                var $input = $view.find('._qp-text-input._qp-text-normal');

                $input.each(function () {
                    var $this = $(this);
                    var index = $this.data('index');
                    if (option.showAnswerArea) {
                        if (_model.textEntry[index].width) {
                            var width = _model.textEntry[index].width * 18;
                            width = width < 60 ? 60 : width;
                            $this.css('width', width + 'px');
                        }
                    }

                    if ($this.hasClass('qp-digital-container')) {
                        //初始化手写键盘
                        DigitalInput.InputManager.getInstance().register($this.get(0), function () {
                            if (that.__digitalResetCount > 0) {
                                that.__digitalResetCount--;
                                return;
                            }
                            //实时更新回调答案
                            var newValue = DigitalInput.InputManager.getInstance().getText4Dom($this.get(0));
                            var index = $this.data('index');
                            saveAnswer(that, index, newValue.toString());
                        });
                    }
                });

                //填空点击回调
                $view.find('._qp-base-fill').bind('qpTap', function (e) {
                    var $target = $(e.target).closest('._qp-text-input');
                    if ($target && $target.length > 0) {
                        var index = $target.data('index');
                        var correctAnswer = that.getCorrectAnswer();
                        that.triggerOptionClick(index, correctAnswer[index]);
                    }
                });
            };
            modelItem.eventHandle = function ($view, option) {
                var that = this;
                var _$input = $view.find('._qp-text-input._qp-text-normal');
                var _state = {};
                //初始化状态数据
                _$input.each(function () {
                    var $this = $(this);
                    var index = $this.data('index');
                    _state[index] = {
                        timer: null,
                        lastValue: ''
                    };
                    if ($this.attr('type') !== 'number') {
                        $this.qtiAutogrow({
                            maxWidth: '._qti-player',
                            shadow: 'nqti-base-fill-cell',
                            vertical: false,
                            horizontal: true,
                            postGrowCallback: function (ele) {
                                //解决pad上无法触发父节点重绘的问题
                                ele.closest('._qp-model').css('-webkit-box-shadow', '0 0 1px rgba(0, 0, 0, 0)');
                                setTimeout(function () {
                                    ele.closest('._qp-model').css('-webkit-box-shadow', '');
                                }, 50);

                            }
                        });
                    }
                });

                _$input.each(function () {
                    var $this = $(this);
                    if (!$this.hasClass('qp-digital-container')) {
                        //获取焦点时定时检测输入输入框变化
                        $this.bind('focus', function () {
                            //定时检测输入输入框变化
                            var $this = $(this);
                            var index = $this.data('index');
                            var _thisState = _state[index];
                            _thisState.timer = setInterval(function () {
                                var newValue = $this.val().trim();
                                if (newValue !== _thisState.lastValue) {
                                    //输入内容有变化
                                    _thisState.lastValue = newValue;
                                    saveAnswer(that, index, newValue);
                                }
                            }, 500);
                        });
                        //输入结束后保存答案
                        $this.bind('blur', function () {
                            var $this = $(this);
                            var index = $this.data('index');
                            //清除定时器
                            var _thisState = _state[index];
                            clearInterval(_thisState.timer);
                            _thisState.timer = null;
                            //保存作答
                            var newValue = $this.val().trim();
                            if ($this.attr('data-type') === 'number' && _utils.Broswer.IEVersion() === 8) {
                                if (newValue === '-' || newValue === '.') {
                                    newValue = '';
                                }
                            }
                            $this.val(newValue);
                            _thisState.lastValue = newValue;
                            saveAnswer(that, index, newValue);
                        });

                        if (_utils.Broswer.isIE() && $this.attr('data-type') === 'number') {

                            $this.keydown(function (e) {
                                return _utils.Dom.inputNumberKeydown($this, e);
                            });
                        }
                    }
                });
            };

            modelItem.renderReset = function ($view) {
                var that = this;
                var $input = $view.find('._qp-text-input._qp-text-normal');
                $input.removeClass('nqti-error');
                $input.removeClass('nqti-correct');
                that.__digitalResetCount = 0;
                $input.each(function () {
                    var $this = $(this);
                    var isDigital = $this.hasClass('qp-digital-container');
                    if (isDigital) {
                        that.__digitalResetCount++;
                        DigitalInput.InputManager.getInstance().setText4DOM('', $this.get(0));
                    } else {
                        $this.val('');
                        $this.trigger('input');
                    }
                });
                $view.find('._qp-text-showcorrectanswer').addClass('nqti-hide-dom');
                $view.find('._qp-text-showcorrectanswer-num').addClass('nqti-hide-dom');
                $view.find('._qp-text-showstatisanswer').addClass('nqti-hide-dom');
                $view.find('._qp-text-normal').removeClass('nqti-hide-dom');
                var $checkedAnswer = $view.find('._qp-text-showcheckedanswer');
                $checkedAnswer.addClass('nqti-hide-dom');
                $checkedAnswer.removeClass('nqti-error');
                $checkedAnswer.removeClass('nqti-correct');
                $checkedAnswer.addClass('fill-cell-min-width');
            };

            modelItem.renderAnswer = function ($view) {
                //获取实际输入的文本框
                var $input = $view.find('._qp-text-input._qp-text-normal');
                //是否数字键盘
                var answer = this.getAnswer();
                if (answer.length > 0 && answer.length === $input.length) {
                    $input.each(function () {
                        var $this = $(this);
                        var index = $this.data('index');

                        if ($this.hasClass('qp-digital-container')) {
                            DigitalInput.InputManager.getInstance().setText4DOM(answer[index], $this.get(0));
                        } else {
                            $this.val(answer[index]);
                            $this.trigger('input');
                        }
                    });
                }
            };

            modelItem.renderCheckedAnswer = function ($view) {
                var that = this;
                var $answer = $view.find('._qp-text-showcheckedanswer');
                $answer.removeClass('nqti-hide-dom');
                $view.find('._qp-text-normal').addClass('nqti-hide-dom');

                var answer = this.getAnswer();
                var correctAnswer = this.getCorrectAnswer();
                //if (answer.length > 0 && answer.length === $answer.length) {
                $answer.each(function () {
                    var $this = $(this);
                    var index = $this.data('index');
                    var thisAnswer = answer[index] && answer[index] !== '' ? answer[index] : '';
                    $this.html(thisAnswer !== '' ? thisAnswer : '&nbsp;');
                    //答案反馈样式
                    var checkedClass = that.checkTextAnswer(correctAnswer[index], thisAnswer) ? 'nqti-correct' : 'nqti-error';
                    $this.addClass(checkedClass);
                    //渲染公式
                    if (typeof MathJax != typeof  undefined) {
                        MathJax.Hub.Queue(['Typeset', MathJax.Hub, $this[0]]);
                    }
                });
                //}

                this.__resizeCheckWidth($view);
                $answer.resize(function () {
                    that.__resizeCheckWidth($view);
                });
            };

            modelItem.__resizeCheckWidth = function ($view) {
                var inputWidth = $view.find('._qp-text-hidden')[0].clientWidth;
                var $answer = $view.find('._qp-text-showcheckedanswer');
                $answer.each(function () {
                    var $this = $(this);
                    if ($this.width() < inputWidth + 5) {
                        $this.addClass('fill-cell-min-width');
                    } else {
                        $this.removeClass('fill-cell-min-width');
                    }
                });
            };

            modelItem.__unbindResize = function ($view) {
                var $answer = $view.find('._qp-text-showcheckedanswer');
                $answer.off('resize');
            };


            modelItem.renderStatisAnswer = function ($view) {
                $view.find('._qp-text-showstatisanswer').removeClass('nqti-hide-dom');
                $view.find('._qp-text-normal').addClass('nqti-hide-dom');
            };

            modelItem.renderCorrectAnswer = function ($view) {
                $view.find('._qp-text-showcorrectanswer').removeClass('nqti-hide-dom');
                if (this.getOption().showSubSequence) {
                    $view.find('._qp-text-showcorrectanswer-num').removeClass('nqti-hide-dom');
                }
                $view.find('._qp-text-normal').addClass('nqti-hide-dom');
                //var correctAnswer = this.getCorrectAnswer();
                //$view.find('._qp-text-showcorrectanswer').each(function () {
                //    var $this = $(this);
                //    var index = $this.data('index');
                //    //答案反馈样式
                //    $this.addClass('nqti-correct');
                //});
            };

            modelItem.renderLock = function ($view) {
                var $input = $view.find('._qp-text-input._qp-text-normal');
                //是否数字键盘
                if (this.isLock()) {
                    $input.each(function () {
                        var $this = $(this);
                        var isDigital = $this.hasClass('qp-digital-container');
                        if (isDigital) {
                            DigitalInput.InputManager.getInstance().setDisabled4DOM($this.get(0), true);
                        } else {
                            $this.attr('disabled', 'disabled');
                        }
                    })

                } else {
                    $input.each(function () {
                        var $this = $(this);
                        var isDigital = $this.hasClass('qp-digital-container');
                        if (isDigital) {
                            DigitalInput.InputManager.getInstance().setDisabled4DOM($this.get(0), false);
                        } else {
                            $this.removeAttr('disabled');
                        }
                    });

                }
            };
        }
    };

//注册
    _QtiPlayer.registerModelHandler(_modelHandler);
})(window, jQuery);


/*!
 *  修复内存泄漏问题，修改为使用普通数组代替$([])  modify by ylf 2015/11/20
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery resize event
//
// *Version: 1.1, Last updated: 3/14/2010*
//
// Project Home - http://benalman.com/projects/jquery-resize-plugin/
// GitHub       - http://github.com/cowboy/jquery-resize/
// Source       - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.js
// (Minified)   - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.min.js (1.0kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// This working example, complete with fully commented code, illustrates a few
// ways in which this plugin can be used.
//
// resize event - http://benalman.com/code/projects/jquery-resize/examples/resize/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-resize/unit/
//
// About: Release History
//
// 1.1 - (3/14/2010) Fixed a minor bug that was causing the event to trigger
//       immediately after bind in some circumstances. Also changed $.fn.data
//       to $.data to improve performance.
// 1.0 - (2/10/2010) Initial release

(function ($, window, undefined) {
    '$:nomunge'; // Used by YUI compressor.

    // A jQuery object containing all non-window elements to which the resize
    // event is bound.
    var elems = [],

    // Extend $.resize if it already exists, otherwise create it.
        jq_resize = $.resize = $.extend($.resize, {}),

        timeout_id,
    // Reused strings.
        str_setTimeout = 'setTimeout',
        str_resize = 'resize',
        str_data = str_resize + '-special-event',
        str_delay = 'delay',
        str_resize_key = 'data-resize',
        str_throttle = 'throttleWindow',
        time_count = 0;

    // Property: jQuery.resize.delay
    //
    // The numeric interval (in milliseconds) at which the resize event polling
    // loop executes. Defaults to 250.

    jq_resize[str_delay] = 350;

    // Property: jQuery.resize.throttleWindow
    //
    // Throttle the native window object resize event to fire no more than once
    // every <jQuery.resize.delay> milliseconds. Defaults to true.
    //
    // Because the window object has its own resize event, it doesn't need to be
    // provided by this plugin, and its execution can be left entirely up to the
    // browser. However, since certain browsers fire the resize event continuously
    // while others do not, enabling this will throttle the window resize event,
    // making event behavior consistent across all elements in all browsers.
    //
    // While setting this property to false will disable window object resize
    // event throttling, please note that this property must be changed before any
    // window object resize event callbacks are bound.

    jq_resize[str_throttle] = true;

    // Event: resize event
    //
    // Fired when an element's width or height changes. Because browsers only
    // provide this event for the window element, for other elements a polling
    // loop is initialized, running every <jQuery.resize.delay> milliseconds
    // to see if elements' dimensions have changed. You may bind with either
    // .resize( fn ) or .bind( "resize", fn ), and unbind with .unbind( "resize" ).
    //
    // Usage:
    //
    // > jQuery('selector').bind( 'resize', function(e) {
    // >   // element's width or height has changed!
    // >   ...
    // > });
    //
    // Additional Notes:
    //
    // * The polling loop is not created until at least one callback is actually
    //   bound to the 'resize' event, and this single polling loop is shared
    //   across all elements.
    //
    // Double firing issue in jQuery 1.3.2:
    //
    // While this plugin works in jQuery 1.3.2, if an element's event callbacks
    // are manually triggered via .trigger( 'resize' ) or .resize() those
    // callbacks may double-fire, due to limitations in the jQuery 1.3.2 special
    // events system. This is not an issue when using jQuery 1.4+.
    //
    // > // While this works in jQuery 1.4+
    // > $(elem).css({ width: new_w, height: new_h }).resize();
    // >
    // > // In jQuery 1.3.2, you need to do this:
    // > var elem = $(elem);
    // > elem.css({ width: new_w, height: new_h });
    // > elem.data( 'resize-special-event', { width: elem.width(), height: elem.height() } );
    // > elem.resize();
    var getRandomId = function (name) {
        return name + (Math.random() * 10 + new Date().getMilliseconds()).toString().replace(".", "")
    };

    var removeItem = function (arry, item) {
        for (var i = 0; i < arry.length; i++) {
            var temp = arry[i];
            if (!isNaN(item)) {
                temp = i;
            }
            if (temp[0] == item[0]) {
                for (var j = i; j < arry.length; j++) {
                    arry[j] = arry[j + 1];
                }
                arry.length = arry.length - 1;
            }
        }
    }
    $.event.special[str_resize] = {

        // Called only when the first 'resize' event callback is bound per element.
        setup: function () {
            // Since window has its own native 'resize' event, return false so that
            // jQuery will bind the event using DOM methods. Since only 'window'
            // objects have a .setTimeout method, this should be a sufficient test.
            // Unless, of course, we're throttling the 'resize' event for window.
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false;
            }

            var elem = $(this);
            elem.attr(str_resize_key, getRandomId(str_resize_key));
            // Add this element to the list of internal elements to monitor.
            elems.push(elem);

            // Initialize data store on the element.
            elem.data(str_data, {w: elem.width(), h: elem.height()});

            // If this is the first element added, start the polling loop.
            if (elems.length === 1) {
                loopy();
            }
        },

        // Called only when the last 'resize' event callback is unbound per element.
        teardown: function () {
            // Since window has its own native 'resize' event, return false so that
            // jQuery will unbind the event using DOM methods. Since only 'window'
            // objects have a .setTimeout method, this should be a sufficient test.
            // Unless, of course, we're throttling the 'resize' event for window.
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false;
            }


            var elem = $(this);

            // Remove this element from the list of internal elements to monitor.
            removeItem(elems, elem);
            // Remove any data stored on the element.
            elem.removeData(str_data);

            // If this is the last element removed, stop the polling loop.
            if (!elems.length) {
                clearTimeout(timeout_id);
            }
        },

        // Called every time a 'resize' event callback is bound per element (new in
        // jQuery 1.4).
        add: function (handleObj) {
            // Since window has its own native 'resize' event, return false so that
            // jQuery doesn't modify the event object. Unless, of course, we're
            // throttling the 'resize' event for window.
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false;
            }

            var old_handler;

            // The new_handler function is executed every time the event is triggered.
            // This is used to update the internal element data store with the width
            // and height when the event is triggered manually, to avoid double-firing
            // of the event callback. See the "Double firing issue in jQuery 1.3.2"
            // comments above for more information.

            function new_handler(e, w, h) {
                var elem = $(this),
                    data = elem.data(str_data);

                // If called from the polling loop, w and h will be passed in as
                // arguments. If called manually, via .trigger( 'resize' ) or .resize(),
                // those values will need to be computed.
                data.w = w !== undefined ? w : elem.width();
                data.h = h !== undefined ? h : elem.height();

                old_handler.apply(this, arguments);
            };

            // This may seem a little complicated, but it normalizes the special event
            // .add method between jQuery 1.4/1.4.1 and 1.4.2+
            if ($.isFunction(handleObj)) {
                // 1.4, 1.4.1
                old_handler = handleObj;
                return new_handler;
            } else {
                // 1.4.2+
                old_handler = handleObj.handler;
                handleObj.handler = new_handler;
            }
        }

    };

    function loopy() {
        // Start the polling loop, asynchronously.
        timeout_id = window[str_setTimeout](function () {
            time_count++;
            // Iterate over all elements to which the 'resize' event is bound.
            elems.forEach(function (elem) {
                var width = elem.width(),
                    height = elem.height(),
                    data = elem.data(str_data);

                // If element size has changed since the last time, update the element
                // data store and trigger the 'resize' event.
                if (width !== data.w || height !== data.h) {
                    elem.trigger(str_resize, [data.w = width, data.h = height]);
                }

                if (time_count % 50 === 0) {
                    if (elem.get(0) !== window && $('[' + str_resize_key + '="' + elem.attr(str_resize_key) + '"]').length === 0) {
                        removeItem(elems, elem);
                        elem.removeData(str_data);
                        elem.unbind(str_resize);
                    }
                }

            });
            if (!elems.length) {
                clearTimeout(timeout_id);
            } else {
                // Loop.
                loopy();
            }

        }, jq_resize[str_delay]);


    };


})(jQuery, this);
/*!
 Non-Sucking Autogrow 1.1.1
 license: MIT
 author: Roman Pushkin
 https://github.com/ro31337/jquery.ns-autogrow
 modify by ylf 2016/6/29
 */
(function () {
    var getVerticalScrollbarWidth;

    (function ($, window) {
        return $.fn.qtiAutogrow = function (options) {
            if (options == null) {
                options = {};
            }
            if (options.horizontal == null) {
                options.horizontal = true;
            }
            if (options.vertical == null) {
                options.vertical = true;
            }
            if (options.debugx == null) {
                options.debugx = -10000;
            }
            if (options.debugy == null) {
                options.debugy = -10000;
            }
            if (options.debugcolor == null) {
                options.debugcolor = 'yellow';
            }
            if (options.flickering == null) {
                options.flickering = true;
            }
            if (options.postGrowCallback == null) {
                options.postGrowCallback = function () {
                };
            }
            if (options.verticalScrollbarWidth == null) {
                options.verticalScrollbarWidth = getVerticalScrollbarWidth();
            }
            if (options.horizontal === false && options.vertical === false) {
                return;
            }
            return this.filter('input,textarea').each(function () {
                var $e, $shadow, heightPadding, minHeight, minWidth, update, maxWidth;
                $e = $(this);
                if ($e.data('autogrow-enabled')) {
                    return;
                }
                $e.data('autogrow-enabled');
                minHeight = parseInt($e.attr('data-minHeight')) || $e.height();
                minWidth = parseInt($e.attr('data-minWidth')) || $e.width();
                heightPadding = $e.css('lineHeight') * 1 || 0;
                $e.hasVerticalScrollBar = function () {
                    return $e[0].clientHeight < $e[0].scrollHeight;
                };
                maxWidth = parseInt($e.css('max-width'));
                $shadow = $('<div class="' + options.shadow + '"></div>').css({
                    position: 'fixed',
                    display: 'inline-block',
                    //visibility: 'hidden',
                    'background-color': options.debugcolor,
                    top: options.debugy,
                    left: options.debugx,
                    'max-width': $e.css('max-width'),
                    'padding': $e.css('padding'),
                    'boxSizing': $e.css('boxSizing'),
                    fontSize: $e.css('fontSize'),
                    fontFamily: $e.css('fontFamily'),
                    fontWeight: $e.css('fontWeight'),
                    lineHeight: $e.css('lineHeight'),
                    resize: 'none',
                    'word-wrap': 'break-word',
                    'word-break': 'break-all'
                }).appendTo($e.parent());
                if (options.horizontal === false) {
                    $shadow.css({
                        'width': $e.width()
                    });
                }
                update = (function (_this) {
                    return function (event) {
                        if ((!minWidth || isNaN(minWidth))) {
                            if (typeof  options.minWidth === 'object') {
                                if (!options.minWidth instanceof jQuery) {
                                    options.minWidth = $(options.minWidth);
                                }
                                minWidth = options.minWidth.width();
                            }else{
                                minWidth=$e.width();
                            }

                        }
                        if ((!maxWidth || isNaN(maxWidth)) && typeof  options.maxWidth === 'string') {
                            //maxWidth = minWidth * 3;
                            var maxWidth = $shadow.closest(options.maxWidth).width() - 30;
                            $shadow.css({'max-width': maxWidth + 'px'})
                        }
                        var height, val, width;
                        val = _this.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n /g, '<br/>&nbsp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n$/, '<br/>&nbsp;').replace(/\n/g, '<br/>').replace(/ {2,}/g, function (space) {
                            return Array(space.length - 1).join('&nbsp;') + ' ';
                        });

                        $shadow.html(val);
                        if (options.vertical === true) {
                            minHeight = parseInt($e.attr('data-minheight')) || $e.height();
                            height = Math.max($shadow.height() + heightPadding, minHeight);
                            $e.height(height);
                        }
                        if (options.horizontal === true) {
                            minWidth = parseInt($e.attr('data-minwidth')) || minWidth;
                            //width = Math.max($shadow.outerWidth(), minWidth);
                            width = Math.max($shadow.width(), minWidth);
                            $e.width(width);

                        }
                        return options.postGrowCallback($e);
                    };
                })(this);
                $e.on('input', update);
                $e.resize( update);
                //$(window).resize(update);
                return update();
            });
        };
    })(window.jQuery, window);

    getVerticalScrollbarWidth = function () {
        var inner, outer, w1, w2;
        inner = document.createElement('p');
        inner.style.width = "100%";
        inner.style.height = "200px";
        outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "200px";
        outer.style.height = "150px";
        outer.style.overflow = "hidden";
        outer.appendChild(inner);
        document.body.appendChild(outer);
        w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        w2 = inner.offsetWidth;
        if (w1 === w2) {
            w2 = outer.clientWidth;
        }
        document.body.removeChild(outer);
        return w1 - w2;
    };

}).call(this);

 })(window,document,jQuery)