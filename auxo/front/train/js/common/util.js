/*!
 * js工具库
 */
(function ($, w) {
    'use strict';
    //设置工具函数
    w.Utils = {
        /**
         * 全局初始化
         * @return {null} null
         */
        _init: function () {
            //加载器标识
            var loading = null;
            //在ko绑定完成后进行trigger(页面不闪烁)
            $(document).on('showContent', function () {
                $('#content').removeClass('hide');
                $('#container').removeClass('hide');
            });
            //ajax全局设置
            $.ajaxSetup({
                contentType: 'application/json;charset=utf8'
            });
            //ajax失败回调
            $(document).ajaxSend(function (event, jqXhr, setting) {
                jqXhr.global = true;
            }).ajaxError(function (e, response, request, errType) {
                if (!response.global) return;
                if (response.responseJSON || response.responseText) {
                    var error = response.responseJSON || JSON.parse(response.responseText);
                    if (response.status != 401) {
                        if (error.cause) {
                            Utils.alertTip(error.cause.message, {
                                icon: 2
                            });
                        } else {
                            Utils.alertTip(error.message, {
                                icon: 2
                            });
                        }
                    }
                }
            });
            //ajax开始回调
            $(document).ajaxStart(function () {
                loading = layer.load(0, {
                    time: 1000 * 10
                });
            });
            //ajax结束回调
            $(document).ajaxStop(function () {
                layer.close(loading);
            });
            //加载layer插件扩展模块
            layer.config({
                extend: 'extend/layer.ext.js'
            });
        },
        /**
         * 分页器
         * @param  {int}   totalCount  总条数
         * @param  {int}   pageSize    每页条数
         * @param  {int}   currentPage 当前页码
         * @param  {Function} callback    分页回调函数
         * @param  {jQuery DOM}   target      分页器容器
         * @return {null}               null
         */
        pagination: function (totalCount, pageSize, currentPage, callback, target) {
            var $target = target || $('#pagination');
            $target.pagination(totalCount, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (pageNum) {
                    if (pageNum != currentPage && callback) {
                        callback(pageNum);
                    }
                }
            });
        },
        /**
         * 点击事件不冒泡及默认行为
         * @param  {event} e 事件参数
         * @return {null}   null
         */
        stopEvent: function (e) {
            var _e = e || window.event;
            _e.preventDefault();
            if (_e.stopPropagation) {
                _e.stopPropagation();
            } else {
                _e.cancelBubble = true;
            }
        },
        /**
         * 消息tip提示
         * @param  {string} msg  消息
         * @param  {int} time 延迟毫秒数
         * @param  {string} type 消息类型--默认1(1：成功框，2：失败框，3：帮助框，4：锁定框，5：fail，6：success,7:warn
         * @return {Promise}      promise对象
         */
        msgTip: function (msg, options) {
            var _defer = $.Deferred();
            options = options || {};
            layer.msg(msg, {
                icon: options.icon || 1,
                time: options.time || 1000
            }, function (index) {
                layer.close(index);
                _defer.resolve();
            });
            return _defer.promise();
        },
        /**
         * 消息提示框（layer.alert(content, options, yes)）
         * @param  {string} msg     消息提示内容
         * @param  {object} options 配置项
         * @return {Promise}      promise对象
         */
        alertTip: function (msg, options) {
            var _defer = $.Deferred();
            options = $.extend(true, {}, options, {
                "title": window.i18nHelper ? i18nHelper.getKeyValue('trainComponent.common.addins.alertTitle') : '信息',
                "btn": [window.i18nHelper ? i18nHelper.getKeyValue('trainComponent.common.addins.cancel') : '取消']
            });
            layer.alert(msg, options || {}, function (index) {
                layer.close(index);
                _defer.resolve();
            });
            return _defer.promise();
        },
        /**
         * 询问提示框（layer.confirm(content, options, yes, cancel) ）
         * @param  {string} msg     消息提示内容
         * @param  {object} options 配置项
         * @return {Promise}      promise对象
         */
        confirmTip: function (msg, options) {
            var _defer = $.Deferred();
            options = $.extend(true, {}, options, {
                "title": i18nHelper.getKeyValue('trainComponent.common.addins.alertTitle') || '信息',
                "btn": [
                    i18nHelper.getKeyValue('trainComponent.common.addins.sure') || '确定',
                    i18nHelper.getKeyValue('trainComponent.common.addins.cancel') || '取消'
                ]
            });
            layer.confirm(msg, options, function (index) {
                layer.close(index);
                _defer.resolve();
            }, function (index) {
                layer.close(index);
                _defer.reject();
            });
            return _defer.promise();
        },
        /**
         * 获取请求参数对象数组
         * @return {object}        参数对象数组
         */
        getSearchParams: function () {
            var _search = window.location.search,
                _params = {};
            if (_search) {
                _search.slice(1).split('&').forEach(function (pair, index) {
                    var _temp = pair.split('=');
                    _params[_temp[0]] = _temp[1];
                });
            }
            return _params;
        },
        /**
         * 蛇形方式
         * @param  {string} value 转换值
         * @return {string}       输出值
         */
        toSnakeCase: function (value) {
            value = value.replace(/([A-Z])/g, "_$1").toLowerCase();
            if (value.indexOf('-') === 0)
                value = value.substr(1);

            return value;
        },
        /**
         * 驼峰方式
         * @param  {string} value 转换值
         * @return {string}       输出值
         */
        toCamelCase: function (value) {
            value = value.replace(/\_(\w)/g, function (all, letter) {
                return letter.toUpperCase();
            });

            return value;
        },
        /**
         * 转换方式
         * @param  {string} tagName 转换值
         * @param  {string} type    转换类型
         * @return {object}         输出对象
         */
        internalToggleCase: function (tagName, type) {
            switch (type.toLowerCase()) {
                case 'camel':
                    return this.toCamelCase(tagName);
                case 'snake':
                    return this.toSnakeCase(tagName);
                default:
                    return this.toCamelCase(tagName);
            }
        },
        /**
         * 参数转换函数
         * @param  {object} data 输入对象
         * @param  {string} type 转换类型
         * @return {object}      输出对象
         */
        toggleCase: function (data, type) {
            if (!data || typeof data !== 'object')
                return data;

            if (typeof data === 'string')
                data = JSON.parse(data);

            var tempData = {},
                itemTagName = '';
            if ($.isArray(data)) {
                tempData = [];
                for (var j = 0; j < data.length; j++) {
                    tempData.push(this.toggleCase(data[j], type));
                }
            } else {
                for (var item in data) {
                    if ($.isArray(data[item]) && data[item].length > 0) {
                        var tempArray = [];
                        for (var i = 0; i < data[item].length; i++) {
                            tempArray.push(this.toggleCase(data[item][i], type));
                        }

                        itemTagName = this.internalToggleCase(item.toString(), type);
                        tempData[itemTagName] = tempArray;
                    } else {
                        itemTagName = this.internalToggleCase(item.toString(), type);
                        tempData[itemTagName] = data[item];
                    }
                }
            }

            return tempData;
        },
        //将时间转换为'yyyy-MM-dd hh:mm'
        formatDate: function (time) {
            function int(str) {
                return parseInt(str, 10);
            }

            var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
            // 1        2       3         4          5          6          7          8  9     10      11
            function jsonStringToDate(string) {
                var match;
                if (match = string.match(R_ISO8601_STR)) {
                    var date = new Date(0),
                        tzHour = 0,
                        tzMin = 0,
                        dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear,
                        timeSetter = match[8] ? date.setUTCHours : date.setHours;

                    if (match[9]) {
                        tzHour = int(match[9] + match[10]);
                        tzMin = int(match[9] + match[11]);
                    }
                    dateSetter.call(date, int(match[1]), int(match[2]) - 1, int(match[3]));
                    var h = int(match[4] || 0) - tzHour;
                    var m = int(match[5] || 0) - tzMin;
                    var s = int(match[6] || 0);
                    var ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
                    timeSetter.call(date, h, m, s, ms);
                    return date;
                }
                return string;
            }

            function dateFormat(date) {
                var time = {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    hour: date.getHours(),
                    min: date.getMinutes()
                };
                for (var i in time) {
                    if (String(time[i]).length == 1) {
                        time[i] = '0' + time[i];
                    }
                }
                return time;
            }

            if (!time) {
                return '';
            }
            time = jsonStringToDate(time);
            var date = new Date(time);
            var dateStry = dateFormat(date);
            return dateStry.year + "-" + dateStry.month + "-" + dateStry.day + ' ' + dateStry.hour + ':' + dateStry.min;
        },
        //获取字符串长度
        strlen: function (str) {
            var len = 0;
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 127) len += 2; else len++;
            }
            return len;
        },
        /*兼容性处理*/
//        var compatibilityUtils = {
        check: {
            placeholder: function () {
                var attr = "placeholder";
                var input = document.createElement("input");
                return attr in input;
            }
        },
        placeholder: function (dom) {
            if (!Utils.check.placeholder()) {
                dom = dom || $('body');
                var inputs = dom.find('input[placeholder]');
                inputs.each(function (i, item) {
                    item = $(item);
                    var str = item.attr('placeholder');
                    if (str) {
                        var style = '';
                        var parent = item.parent();
                        if (parseInt(parent.height(), 10) == 0) {
                            parent.addClass('ui-placeholder-container');
                        } else {
                            var height = parseInt(parent.height(), 10) + parseInt(parent.css('padding-top'), 10) + parseInt(parent.css('padding-bottom'), 10) + parseInt(parent.css('border-top-width')) * 2 || 0;
                            height -= parseInt($(this).css('margin-bottom'), 10) || 0;
                            var top = (height - 21) / 2;
                            var left = item.position().left + 5;
                            style = 'style="position:absolute;top:' + top + 'px;left:' + left + 'px;"';
                        }
                        var $tem = $('<label class="ipt-placeholder" ' + style + ' >' + str + '</label>');
                        item.parent().append($tem);
                        setTimeout(function () {
                            if (item.val() != '') {
                                $tem.hide();
                            }
                        }, 200);

                        if (item.val() != '') {
                            $tem.hide();
                        }
                        item.on('focus', function () {
                            $tem.hide();
                            item.one('blur', function () {
                                if ($(this).val() == '') {
                                    $(this).parent().find('.ipt-placeholder').show();
                                }
                            });
                        });
                        $tem.click(function () {
                            $(this).parent().find('input').focus();
                        })
                    }
                })
            }
        }
//        };
    };
    Utils._init();
})(jQuery, window);
