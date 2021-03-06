;
(function ($) {

    "use strict";

    var global = this || (0, eval)("this");

    /**
     * global handler of jquery ajax error.
     * can be cancel by option['global'] = false
     */
    (function () {
        var helper = {
            showError: function (jqAjax, jqXHR, textStatus, errorThrown) {
                if (jqXHR.readyState == 4) {
                    var exception = this.parseException(jqAjax, jqXHR, textStatus, errorThrown);
                    var content = exception.friendly ? [
                            $.trim(exception.message)
                        ] : [
                            "<b>错误类型:</b> " + $.trim(exception.code) + "<br />",
                            "<b>错误信息:</b> " + $.trim(exception.message) + "<br />",
                            "<b>错误详情:</b> " + $.trim(exception.stack) + "<br />"
                        ];
                    if ($.alert) {
                        $.alert({
                            title: exception.friendly ? "系统提示" : "出错了",
                            content: "<div style='max-height: 500px; overflow-x: hidden; overflow-y: auto; word-break: break-word;'>" +
                            "<p>" + content.join("</p><p>") + "</p>" +
                            "</div>",
                            closeIcon: true,
                            confirmButton: "确定"
                        });
                    } else {
                        alert(content.join(""));
                    }
                }
            },
            parseException: function (jqAjax, jqXHR, textStatus, errorThrown) {
                var exception = {
                    code: "",
                    message: "",
                    stack: "",
                    friendly: true
                };
                if (jqXHR.responseJSON) {
                    var responseJSON = jqXHR.responseJSON;
                    if (responseJSON.detail) {
                        var detail = responseJSON.detail;
                        var typeIndex = detail.indexOf("Exception");
                        if (typeIndex > -1) {
                            exception.type = detail.substring(detail.indexOf("Stack trace:") + 14, typeIndex + 9);
                            exception.stack = detail.substring(typeIndex + 10);
                        } else {
                            exception.type = "error";
                            exception.stack = detail;
                        }
                    } else {
                        exception.type = "error";
                        exception.stack = "";
                    }
                    exception.code = responseJSON.code;
                    exception.message = responseJSON.message;
                } else {
                    exception.code = 500;
                    exception.type = jqXHR.statusText.toLowerCase() == "ok" ? "error" : jqXHR.statusText;
                    exception.message = ['向服务器执行', jqAjax.type, '请求时出错', jqXHR.responseText].join('');
                    exception.stack = ['contentType：', jqAjax.contentType, '<br />', 'url：', jqAjax.url].join('');
                }

                return exception;
            }
        };

        $.ajaxSetup({
            cache: false,
            error: function (jqXHR, textStatus, errorThrown) {
                helper.showError(this, jqXHR, textStatus, errorThrown);
            }
        });

        //兼容IE浏览器
        if (window["context"] == undefined) {
            if (!window.location.origin) {
                window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            }
            window["context"] = location.origin + "/V6.0";
        }
    }());

    /**
     * global prevent multiple request.
     * it dependents on options['url'] as the key, so parameters will be ignored
     */
    (function () {
        var currentRequests = {};
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            var key = options.type + ":" + options.url;
            // if (!currentRequests[key]) {
            //     currentRequests[key] = jqXHR;
            // } else {
            //     // jqXHR.abort();
            //     return;
            // }

            var customComplete = options.complete;
            options.complete = function (jqXHR, textStatus) {
                currentRequests[key] = null;
                if ($.isFunction(customComplete)) {
                    customComplete.apply(this, arguments);
                }
            };
        });
    }());

    /**
     * 如果已经引用了$.fn.cover，则启用全局遮罩
     * $.fn.cover必须引用在该文件之前
     */
    (function (hasCover) {
        if (hasCover) {
            $(document).ajaxStart(function () {
                $("body").cover("show");
            }).ajaxStop(function () {
                $("body").cover("hide");
            });
        }
    }(!!$.fn.cover));

    /**
     * auto add ${project_code} to ajax request
     * project_code must be defined before.
     */
    (function () {
        var array = location.pathname.split("/");
        if (array.length >= 2 && !!array[1])
            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                // var projectCode = $.type(options.projectCode) === "boolean" ? options.projectCode : true;
                // if (options.projectCode !== false && projectCode) {
                //     options.url = "/" + array[1] + options.url;
                // }
                var addMac = $.type(options.addMac) === "boolean" ? options.addMac : false;
                if (options.addMac === true && addMac) {
                    var url = options.url.split("?");
                    var us = url[0];
                    // if (options.type == "POST") {
                    //     us = "/"
                    // }
                    var mac = JsMAF.getAuthHeader(location.origin + us, options.type);
                    if (mac) {
                        options.url = options.url.indexOf('?') < 0 ? (options.url + '?__mac=' + base64_encode(mac) ) : (options.url + '&__mac=' + base64_encode(mac));
                    }
                }


            });
    }());

    /**
     * form restful data
     * replace {param} to real data
     */
    (function () {
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            var m, url = options.url,
                restData = options.restData;
            if (url && restData && (m = url.match(/\{(.+?)\}/g)) && m.length) {
                $.each(m, function (i, k) {
                    var v = restData[k.replace(/\{|\}/g, "")];
                    url = url.replace(new RegExp(k, "g"), v === undefined ? k : v);
                });
                options.url = url;
            }
        });
    }());

}(jQuery));