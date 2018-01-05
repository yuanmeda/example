;(function () {

    "use strict";

    (function (factory) {
        if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
            factory(require("jquery"), require("knockout"), exports);
        } else if (typeof define === 'function' && define.amd) {
            define(["jquery", "knockout", "exports"], factory);
        } else {
            factory(window.jQuery, window.ko, (window.fs || (window.fs = {})));
        }
    }(function ($, ko, fs) {
        $.extend(true, fs, {
            API: {
                // 强制学习API基础路径
                FORCE_STUDY: "/forcestudys2/",
                forceStudy: function (url, data) {
                    if (url) {
                        if (url.indexOf(fs.API.FORCE_STUDY) != 0) {
                            url = fs.API.FORCE_STUDY + url;
                        }
                        url = fs.util.restfulApi(url, data);
                    }
                    return url;
                }
            },
            defaults: {
                // 后台分页脚本默认配置
                backstagePagination: {
                    items_per_page: 10,
                    num_display_entries: 5,
                    is_show_first_last: true,
                    is_show_input: true,
                    current_page: 0,
                    prev_text: "上一页",
                    next_text: "下一页",
                    callback: function () { return false; }
                },
                // 数组长度>200视为大数组
                ARRAY_LARGE_SIZE: 200
            },
            fmt: {
                /**
                 * 格式化日期
                 * @param date java时间戳/.net时间戳/字符串
                 * @param fmt 格式化格式，默认: yyyy-MM-dd hh:mm:ss
                 * @returns {*}
                 */
                date: function (date, fmt) {
                    fmt = fmt || "yyyy-MM-dd hh:mm:ss";
                    date = fs.ko.unwrap(date);
                    // java格式的timestamp
                    if (/^\d+$/.test(date)) {
                        date = new Date(+date);
                        return !date ? "Invalid Date" : date.format(fmt);
                    }
                    // .net格式的timestamp
                    else if ((/date/i).test(date)) {
                        date = new Date(+date.match(/\d+/)[0]);
                        return !date ? "Invalid Date" : date.format(fmt);
                    }
                    // mysql字符串格式转化
                    else if (date && $.type(date) === "string" && /\.\d$/.test(date)) {
                        date = new Date(date.replace(/\.\d$/, "").replace(/-/g, "/"));
                        return !date ? "Invalid Date" : date.format(fmt);
                    }
                    return date;
                },
                /**
                 * 输出obj[key]
                 * @param key 键/索引
                 * @param obj 对象/数组
                 * @returns {*}
                 */
                value: function (key, obj) {
                    return obj[fs.ko.unwrap(key)];
                },
                /**
                 * 输出obj的子属性值
                 * @param keyPath 属性，以"."分隔
                 * @param obj 对象
                 * @param defaultValue 默认值
                 * @returns {*}
                 */
                refer: function (keyPath, obj, defaultValue){
                    if ($.type(keyPath) === "string"){
                        var keys = keyPath.split(".");
                        var key;
                        var refer = fs.ko.unwrap(obj);
                        var i, l = keys.length;
                        try {
                            for (i = 0; refer && (key = keys[i]) && i < l; i++){
                                refer = fs.ko.unwrap(refer[key]);
                            }
                        } catch (e) { }
                        return i === l && (refer = fs.ko.unwrap(refer)) != null ? refer : defaultValue;
                    } else {
                        return defaultValue;
                    }
                },
                /**
                 * 判断两个值是否相等
                 * @param value 值1
                 * @param equalValue 值2
                 * @param isStrongEqual 是否全等于
                 * @returns {boolean}
                 */
                equal: function (value, equalValue, isStrongEqual) {
                    value = fs.ko.unwrap(value);
                    return isStrongEqual ? value === equalValue : value == equalValue;
                },
                /**
                 * 是否包含在数组中，返回数组下标，不包含则返回-1
                 * @param value 值
                 * @param arr 数组
                 * @param prop 如果数组是对象，则可以通过对象的属性来判断是否包含，此处使用全等判断
                 * @returns {*|number}
                 */
                index: function (value, arr, prop) {
                    return !(prop && $.type(prop) === "string") ? $.inArray(fs.ko.unwrap(value), arr) : (function () {
                        var index = -1;
                        value = $.type(value) === "string" ? fs.ko.unwrap(value) : value[prop];
                        $.each(arr, function (i, v) {
                            if (v[prop] === value){
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
                    return fs.fmt.index(value, arr, prop) > -1;
                },
                /**
                 * 是否为null、undefined或空字符串
                 * @param value
                 * @returns {boolean}
                 */
                nullOrEmpty: function (value) {
                    value = fs.ko.unwrap(value);
                    return value == null ? true : value === "";
                },
                /**
                 * 取较小值
                 * @param value
                 * @param minValue
                 * @returns {number}
                 */
                min: function (value, minValue) {
                    value = +fs.ko.unwrap(value);
                    return value === value ? Math.min(value, minValue) : minValue;
                },
                /**
                 * 取较大值
                 * @param value
                 * @param maxValue
                 * @returns {number}
                 */
                max: function (value, maxValue) {
                    value = +fs.ko.unwrap(value);
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
                    if (minValue > maxValue) {
                        tempValue = minValue;
                        minValue = maxValue;
                        maxValue = tempValue;
                    }
                    value = +fs.ko.unwrap(value);
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
                    value = +fs.ko.unwrap(value);
                    if (typeof defaultValue !== "number") {
                        defaultValue = 0;
                    }
                    return (value === value ? value : defaultValue)["toFixed"](figures || 2);
                }
            },
            util: {
                /**
                 * 生成后台分页脚本
                 * @param $page
                 * @param totalCount
                 * @param opts
                 */
                generalBackenPagination: function ($page, totalCount, opts) {
                    opts = $.extend(true, {}, fs.defaults.backstagePagination, opts);
                    $page.pagination(totalCount, opts);
                },
                /**
                 * 转换为日期格式
                 * @param value
                 * @returns {*}
                 */
                toDate: function (value) {
                    return $.type(value) === "date" ? value :
                        new Date((value + "").replace(/-/g, "/")    // yyyy-MM-dd => // yyyy/MM/dd
                            .replace(/\.\d$/, "")); // 处理mysql取出的未格式化datetime尾部携带.0的问题
                },
                /**
                 * 移除data对象中的空值
                 * @param data
                 * @returns {*}
                 */
                removeEmpty: function (data) {
                    $.each(data, function (k, v) {
                        if (v === undefined || v === null || v === "") {
                            delete data[k];
                        }
                    });
                    return data;
                },
                /**
                 * post方式提交form表单
                 * @param url
                 * @param data
                 * @param target
                 */
                postForm: function (url, data, target) {
                    var $form = $("<form method='post' style='position: absolute; left: -999px; top: -999px; visibility: hidden; display: none;'></form>");
                    if (data) {
                        for (var name in data) {
                            if (data.hasOwnProperty(name)) {
                                $form.append("<input type='hidden' name='" + name + "' + value='" + data[name] + "' />");
                            }
                        }
                    }
                    if (target) {
                        $form.attr("target", target);
                    }
                    $form.attr("action", url).appendTo($("body")).submit();
                    setTimeout(function () {
                        $form.remove();
                    }, 0);
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
                            var v = data[k.replace(/\{|\}/g, "")];
                            url = url.replace(new RegExp(k, "g"), v === undefined ? k : v);
                        });
                    }
                    return url;
                },
                /**
                 * 数组去重，返回orgiArr中不包含repeatArr的一个新数组
                 * @param orgiArr 原数组
                 * @param repeatArr 重复的数组
                 * @param prop 配置了表示数组为对象数组，根据prop属性来比较重复
                 * @returns {*}
                 */
                arrayDuplicate: function (orgiArr, repeatArr, prop) {
                    var orgiArrLength = orgiArr ? orgiArr.length : 0;
                    var repeatArrLength = repeatArr ? repeatArr.length : 0;
                    if (!orgiArrLength) {
                        return [];
                    }
                    if (!repeatArrLength) {
                        return orgiArr.slice(0);
                    }
                    return orgiArrLength < fs.defaults.ARRAY_LARGE_SIZE ? (function () {
                        var ret = orgiArr.slice(0);
                        $.each(repeatArr, function (i, v) {
                            var index = fs.fmt.index(v, orgiArr, prop);
                            if (index > -1) {
                                ret.splice(index, 1);
                            }
                        });
                        return ret;
                    }()) : (function () {
                        var ret = [];
                        var map = {};
                        var value;
                        var i;
                        var isObject = prop && $.type(prop) === "string";
                        if (isObject) {
                            for (i = 0; i < repeatArrLength && (value = repeatArr[i][prop]) != null; i++) {
                                map[value] = (map[value] || 0) + 1;
                            }
                            for (i = 0; i < orgiArrLength && (value = orgiArr[i][prop]) != null; i++) {
                                if (!map[value]) {
                                    ret.push(value);
                                }
                            }
                        } else {
                            for (i = 0; i < repeatArrLength && (value = repeatArr[i]) != null; i++) {
                                map[value] = (map[value] || 0) + 1;
                            }
                            for (i = 0; i < orgiArrLength && (value = orgiArr[i]) != null; i++) {
                                if (!map[value]) {
                                    ret.push(value);
                                }
                            }
                        }
                        return ret;
                    }());
                },
                /**
                 * 按Enter键提交form
                 * @param $form
                 */
                enterSubmitForm: function ($form) {
                    $form.on("keydown", function (e) {
                        e = e || window.event;
                        if (e.keyCode === 13) {
                            $form.submit();
                        }
                    });
            	},
                /**
                 * 执行fn
                 * @param fn
                 */
                catchFunction: function (fn) {
                    try { fn(); } catch (e) {}
                }
            },
            auxo: {
                /**
                 * 取project_code
                 */
                getProjectCode: (function () {
                    var projectCode = "";
                    if (window.project_code) {
                        projectCode = window.project_code;
                    } else if (window.projectCode) {
                        projectCode = window.projectCode;
                    } else {
                        var array = location.pathname.split("/");
                        if (array.length >= 3 && array[1] && array[2]) {
                            projectCode = array[1];
                        }
                    }
                    return function () {
                        return projectCode;
                    };
                }()),
                /**
                 * 组装project_code的url
                 * @param url
                 * @returns {string}
                 */
                getProjectCodeUrl: function (url){
                    return "/" + this.getProjectCode() + "/" + url;
                }
            },
            ko: {
                /**
                 * 取ko监视对象的值
                 * @param value
                 * @returns {*}
                 */
                unwrap: function (value) {
                    return ko ? ko.unwrap(value) : value;
                },
                /**
                 * 将data中的值赋给model，data中没有对应值的则清空
                 * @param model ko对象
                 * @param data js对象
                 * @param isClear 是否清空data中没有对应值的属性
                 * @returns {*}
                 */
                fromJS: function (model, data, isClear) {
                    if (!model || !data) {
                        return model;
                    }
                    if ($.type(isClear) !== "boolean") {
                        isClear = true;
                    }
                    $.each(model, function (k) {
                        if (model.hasOwnProperty(k)) {
                            var o = model[k],
                                v = data[k];
                            if (ko.isObservable(o)) {
                                if (v != null) {
                                    o(v);
                                } else if (isClear){
                                    o("");
                                }
                            } else {
                                if (v != null) {
                                    model[k] = v;
                                } else if (isClear) {
                                    model[k] = "";
                                }
                            }
                        }
                    });
                    return model;
                }
            }
        });

        // 对Date的扩展，将 Date 转化为指定格式的String
        // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
        // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
        // 例子：
        // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
        // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
        if (!Date.prototype.format) {
            Date.prototype.format = function (fmt) {
                var o = {
                    "M+": this.getMonth() + 1,                      //月份
                    "d+": this.getDate(),                           //日
                    "h+": this.getHours(),                          //小时
                    "m+": this.getMinutes(),                        //分
                    "s+": this.getSeconds(),                        //秒
                    "q+": Math.floor((this.getMonth() + 3) / 3),    //季度
                    "S": this.getMilliseconds()                     //毫秒
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            }
        }

        // fix jQuery.browser removed at jQuery1.9+
        if (!$.browser) {
            var ua = navigator.userAgent.toLowerCase();
            $.browser = {
                mozilla: /firefox/.test(ua),
                webkit: /webkit/.test(ua),
                opera: /opera/.test(ua),
                msie: /msie/.test(ua)
            }
        }

        return fs;
    }));

    // fix window.btoa encoding function on IE9- by base64.js
    if (!window.btoa && window.base64_encode) {
        window.btoa = window.base64_encode;
    }

    // fix window.atob decoding function on IE9- by base64.js
    if (!window.atob && window.base64_decode) {
        window.atob = window.base64_decode;
    }

}());