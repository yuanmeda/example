;(function () {
    "use strict";

    var global = this || (0, eval)("this");

    /**
     * global handler of jquery ajax error.
     * can be cancel by option['global'] = false
     */
    (function(){
        var helper = {
            showError: function(jqAjax, jqXHR, textStatus, errorThrown){
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
            parseException: function(jqAjax, jqXHR, textStatus, errorThrown){
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
            error: function(jqXHR, textStatus, errorThrown){
                helper.showError(this, jqXHR, textStatus, errorThrown);
            }
        });
    }());
}());