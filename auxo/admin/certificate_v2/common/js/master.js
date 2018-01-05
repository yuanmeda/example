/**
 * Created by Administrator on 2017.8.30.
 */
;
(function () {

    "use strict";

    var global = (0, eval)("this"),

        ko = global["ko"],

        $ = global["jQuery"],

        master = global["master"] || (global["master"] = {}),

        koUnwrap = ko.unwrap;

    var format = {

            /**
             * 格式化日期
             * @param date java时间戳/.net时间戳/mysql字符串/字符串
             * @param fmt 格式化格式，默认: yyyy-MM-dd hh:mm:ss
             * @returns {*}
             */
            date: function (date, fmt) {
                fmt = fmt || "yyyy-MM-dd hh:mm:ss";
                date = koUnwrap(date);
                if (!date) {
                    return date;
                }
                // java格式的timestamp
                if (/^\d+$/.test(date)) {
                    date = new Date(+date);
                    return !date ? "##" : utils.dateFormat(date, fmt);
                }
                // java格式object
                else if (typeof date === "object" && date.time) {
                    date = new Date(+date.time);
                    return !date ? "##" : utils.dateFormat(date, fmt);
                }
                // .net格式的timestamp
                else if ((/date/i).test(date)) {
                    date = new Date(+date.match(/\d+/)[0]);
                    return !date ? "##" : utils.dateFormat(date, fmt);
                }
                // mysql字符串格式转化
                else if ($.type(date) === "string" && /\.\d$/.test(date)) {
                    date = new Date(date.replace(/\.\d$/, "").replace(/-/g, "/"));
                    return !date ? "##" : utils.dateFormat(date, fmt);
                }
                // UNIT格式时间字符串
                else if ($.type(date) === "string" && /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}\..+$/.test(date)) {
                    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\..+$/.exec(date);
                    if (m && m.length > 0) {
                        date = new Date(+m[1], (m[2] - 1) || 0, +m[3] || 0, +m[4] || 0, +m[5] || 0, +m[6] || 0);
                        return utils.dateFormat(date, fmt);
                    }
                }
                return date;
            },
            /**
             * 取对象值
             * @param key
             * @param obj
             * @param defaultValue
             * @returns
             */
            value: function (key, obj, defaultValue) {
                if (defaultValue == null) {
                    defaultValue = ""
                }
                var value = obj[koUnwrap(key)];
                return value == null ? defaultValue : value;
            },
            /**
             * 货币格式化
             * @param money
             * @param opt
             * @returns
             */
            currency: function (money, opt) {
                opt = $.extend({
                    places: 2,
                    symbol: "￥",
                    thousand: ", ",
                    decimal: "."
                }, opt);
                var number = koUnwrap(money),
                    negative = number < 0 ? "-" : "",
                    i = parseInt(number = Math.abs(+number || 0).toFixed(opt.places), 10) + "",
                    l = i.length,
                    j = l > 3 ? l % 3 : 0;
                return opt.symbol + negative + (j ? i.substr(0, j) + opt.thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + opt.thousand) +
                    (opt.places ? opt.decimal + Math.abs(number - i).toFixed(opt.places).slice(2) : "");
            },
            /**
             * 输出obj的子属性值
             * @param keyPath 属性，以"."分隔
             * @param obj 对象
             * @param defaultValue 默认值
             * @returns {*}
             */
            refer: function (keyPath, obj, defaultValue) {
                keyPath = koUnwrap(keyPath);
                if ($.type(keyPath) === "string") {
                    var keys = keyPath.split("."),
                        key,
                        refer = koUnwrap(obj),
                        i, l = keys.length;
                    try {
                        for (i = 0; refer && (key = keys[i]) && i < l; i++) {
                            refer = koUnwrap(refer[key]);
                        }
                    } catch (e) {
                    }
                    return i === l && (refer = koUnwrap(refer)) != null ? refer : defaultValue;
                } else {
                    return defaultValue;
                }
            },
            /**
             * 返回obj对应keyPath的对象
             * @param keyPath
             * @param obj
             * @returns {*}
             */
            referKo: function (keyPath, obj) {
                try {
                    var keys = keyPath.split("."),
                        key,
                        referKo = obj;
                    for (var i = 0, l = keys.length; referKo != undefined && (key = keys[i]) && i < l; i++) {
                        referKo = referKo[key];
                    }
                    return referKo;
                } catch (e) {
                }
                return null;
            },
            /**
             * 判断两个值是否相等
             * @param value 值1
             * @param equalValue 值2
             * @param isStrongEqual 是否全等于
             * @returns {boolean}
             */
            equal: function (value, equalValue, isStrongEqual) {
                value = koUnwrap(value);
                return isStrongEqual ? value === equalValue : value == equalValue;
            },
            /**
             * 是否包含在数组中，返回数组下标，不包含则返回-v4.3.0
             * @param value 值
             * @param arr 数组
             * @param prop 如果数组是对象，则可以通过对象的属性来判断是否包含，此处使用全等判断
             * @returns {*|number}
             */
            index: function (value, arr, prop) {
                value = koUnwrap(value);
                arr = koUnwrap(arr);
                prop = koUnwrap(prop);
                return !(prop && $.type(prop) === "string") ? $.inArray(value, arr) : (function () {
                    var index = -1;
                    value = $.type(value) === "object" ? value[prop] : value;
                    $.each(arr, function (i, v) {
                        if (v[prop] === value) {
                            index = i;
                            return false;
                        }
                    });
                    return index;
                }());
            },
            /**
             * 是否包含在数组中
             * @param value
             * @param arr
             * @param prop
             * @returns {boolean}
             */
            inArray: function (value, arr, prop) {
                return this.index(value, arr, prop) > -1;
            },
            /**
             * 是否为null、undefined或空字符串
             * @param value
             * @returns {boolean}
             */
            nullOrEmpty: function (value) {
                value = koUnwrap(value);
                return value == null ? true : value === "";
            },
            /**
             * 取较小值
             * @param value
             * @param minValue
             * @returns {number}
             */
            min: function (value, minValue) {
                value = +koUnwrap(value);
                return value === value ? Math.min(value, minValue) : minValue;
            },
            /**
             * 取较大值
             * @param value
             * @param maxValue
             * @returns {number}
             */
            max: function (value, maxValue) {
                value = +koUnwrap(value);
                return value === value ? Math.max(value, maxValue) : maxValue;
            },
            /**
             * 取范围内的值
             * @param value 操作数
             * @param minValue 最小值
             * @param maxValue 最大值
             * @returns {number}
             */
            range: function (value, minValue, maxValue) {
                var tempValue;
                value = +koUnwrap(value);
                minValue = +koUnwrap(minValue);
                maxValue = +koUnwrap(maxValue);
                if (minValue > maxValue) {
                    tempValue = minValue;
                    minValue = maxValue;
                    maxValue = tempValue;
                }
                return value === value ? Math.max(minValue, Math.min(value, maxValue)) : minValue;
            },
            /**
             * 保留小数位数
             * @param value 操作数
             * @param figures 小数位数
             * @param defaultValue 默认值
             * @returns {*}
             */
            toFixed: function (value, figures, defaultValue) {
                value = +koUnwrap(value);
                figures = +koUnwrap(figures) || 2;
                if (typeof defaultValue !== "number") {
                    defaultValue = 0;
                }
                return (value === value ? value : defaultValue)["toFixed"](figures);
            },
            /**
             * 处理长文本
             * @param value 操作文本
             * @param len 保留长度，默认20
             * @returns
             */
            longText: function (value, len) {
                value = koUnwrap(value);
                len = +koUnwrap(len) || 20;
                if (!value)
                    return "";
                if (value.length > len) {
                    return value.substring(0, len) + "...";
                } else {
                    return value;
                }
            }
        },
        koWrap = {
            /**
             * 是否ko观察对象
             * @param o
             * @returns {*}
             */
            isKo: function (o) {
                return ko.isObservable(o);
            },
            /**
             * 是否ko观察数组
             * @param o
             * @returns {*|boolean}
             */
            isKoArray: function (o) {
                return this.isKo(o) && $.isArray(o.peek());
            },
            /**
             * 将data中的值赋给model，{data中没有对应值的则清空}
             * @param model ko对象
             * @param data js对象
             * @param isClear 是否清空data中没有对应值的属性
             * @returns {*}
             */
            fromJS: function (model, data) {
                if (!model || !data) {
                    return model;
                }
                var isClear = $.type(arguments[2]) === "boolean" ? arguments[2] : true,
                    that = this;
                $.each(model, function (name, observableObj) {
                    var v = data[name];
                    if (that.isKo(observableObj)) {
                        if (that.isKoArray(observableObj)) {
                            if (!$.isArray(v)) {
                                v = v ? (v + "").split(",") : (isClear ? [] : observableObj.peek());
                            }
                        } else if (v == null) {
                            v = isClear ? "" : observableObj.peek();
                        }
                        observableObj(v);
                    }
                });
            }
        },
        utils = {
            /**
             * 重置remote验证
             * @param $dom
             * @returns {utils}
             */
            resetRemote: function ($dom) {
                if ($dom) {
                    $dom.removeData("previousValue");
                }
                return this;
            },
            /**
             * 重置$form的remote验证
             * @param $form
             * @returns {utils}
             */
            resetFormRemote: function ($form) {
                var that = this;
                if ($form) {
                    $form.find("[remote]").each(function () {
                        that.resetRemote($(this));
                    });
                }
                return this;
            },
            /**
             * 重置表单验证
             * @param $form
             * @returns {utils}
             */
            resetForm: function ($form) {
                var validator = $form.data("validator"),
                    that = this;
                if (validator) {
                    validator.resetForm();
                }
                this.resetFormRemote($form);
                $form.find(".form-group").removeClass("has-success has-error");
                return this;
            },
            /**
             * 转换为日期格式
             * @param value
             * @returns {*}
             */
            toDate: function (value) {
                value = koUnwrap(value);
                return $.type(value) === "date" ? value :
                    new Date((value + "").replace(/-/g, "/")    // yyyy-MM-dd => // yyyy/MM/dd
                        .replace(/\.\d$/, ""));                 // 处理mysql取出的未格式化datetime尾部携带.0的问题
            },
            /**
             * 日期格式化
             * @param date
             * @param fmt
             * @returns {*}
             */
            dateFormat: function (date, fmt) {
                var o = {
                    "M+": date.getMonth() + 1,                      //月份
                    "d+": date.getDate(),                           //日
                    "h+": date.getHours(),                          //小时
                    "m+": date.getMinutes(),                        //分
                    "s+": date.getSeconds(),                        //秒
                    "q+": Math.floor((date.getMonth() + 3) / 3),    //季度
                    "S": date.getMilliseconds()                     //毫秒
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            },
            /**
             *  移除data对象中的null/undefined/""
             * @param data
             * @returns {*}
             */
            removeEmpty: function (data) {
                var that = this;
                $.each(data, function (k, v) {
                    v = koUnwrap(v);
                    var type = $.type(v);
                    if (v == null) {
                        delete data[k];
                    } else if (type === "object") {
                        that.removeEmpty(data[k]);
                    } else if (type === "string" && (v = $.trim(v)) === "") {
                        delete data[k];
                    } else {
                        data[k] = v;
                    }
                });
                return data;
            },
            /**
             * json对象转为url条件
             * @param json
             * @param flag
             * @returns {*|string}
             */
            jsonToQueryString: function (json, flag) {
                var that = this;
                return json && ( function () {
                        var query = [];
                        $.each(that.removeEmpty(json), function (k, v) {
                            query.push(k + "=" + v);
                        });
                        return query.join(flag || "&");
                    }() ) || "";
            },
            /**
             * 添加参数到url
             * @param url
             * @returns {*}
             */
            compatUrl: function (url) {
                var json = {};
                if ($.type(arguments[1]) !== "object") {
                    json[arguments[1]] = arguments[2];
                } else {
                    json = arguments[1];
                }
                if (url != null) {
                    var query = this.jsonToQueryString(json, "&");
                    if (url.indexOf("?") == -1) {
                        url += "?" + query;
                    } else {
                        url += "&" + query;
                    }
                }
                return url;
            },
            /**
             * post方式提交form表单
             * @param url
             * @param data
             * @param target
             * @returns {utils}
             */
            postForm: function (url, data, target) {
                var $form = $("<form method='post' style='position: absolute; left: -999px; top: -999px; visibility: hidden; display: none;'></form>");
                if (data) {
                    $.each(data, function (name, value) {
                        $form.append("<input type='hidden' name='" + name + "' + value='" + value + "' />");
                    });
                }
                if (target) {
                    $form.attr("target", target);
                }
                $form.attr("action", url).appendTo($("body")).submit();
                setTimeout(function () {
                    $form.remove();
                }, 0);
                return this;
            },
            /**
             * 拼接restful风格的URL
             * @param url
             * @param data
             * @returns {*}
             */
            restfulApi: function (url, data) {
                if (!url || !data) {
                    return url;
                }
                var m = url.match(/\{(.+?)\}/g);
                if (m && m.length) {
                    $.each(m, function (i, k) {
                        url = url.replace(new RegExp(k, "g"), data[k.replace(/\{|\}/g, "")] || k);
                    });
                }
                return url;
            },
            /**
             * 缓存ajax请求
             * @param uniqueKey
             * @param cacheKey
             * @parma fn
             * @return promise
             */
            cacheAjax: (function () {
                var CacheFn = function (cacheKey, cacheData, callback) {
                    var that = this;
                    this.promise = $.Deferred(function () {
                        var deferred = this,
                            deferredResolve = deferred.resolve;
                        that.resolve = function (data) {
                            cacheData[cacheKey] = data;
                            deferredResolve.apply(deferred, arguments);
                        };
                        callback.apply(that, arguments);
                    }).promise();

                }, cacheObj = {};
                return function (uniqueKey, cacheKey, fn) {
                    function doFn(cacheData) {
                        var cacheFn = new CacheFn(cacheKey, cacheData, fn);
                        return cacheFn.promise;
                    }

                    if (cacheObj[uniqueKey]) {
                        var cacheData = cacheObj[uniqueKey];
                        if (cacheData[cacheKey]) {
                            return $.Deferred(function () {
                                this.resolve(cacheData[cacheKey]);
                            }).promise();
                        } else {
                            return doFn(cacheObj[uniqueKey]);
                        }
                    } else {
                        return doFn(cacheObj[uniqueKey] = {});
                    }
                };
            }()),
            mock: function (data, time) {
                return $.Deferred(function () {
                    var that = this;
                    setTimeout(function () {
                        that.resolve(data);
                    }, time || 0);
                }).promise();
            }
        };


    $.extend(true, master, {
        fmt: format,
        utils: utils,
        ko: koWrap
    });


}());