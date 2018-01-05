$(document).ajaxStart(function () {
    try {
        if (typeof $.loading != 'undefined' && typeof $.ui.position != 'undefined' && !$.loading.exist() && window.location.href.indexOf("system") < 0) {
            $.loading.show();
        } else {
            if (typeof $.fn.loading != 'undefined') {
                $("body").loading("show");
            }
        }
    }
    catch (error) {
    }
});
$.ajaxhelper = {
    hideLoading:function(isForceHide){
        if (typeof $.loading != 'undefined') {
            $.loading.hide();
        }
        if (typeof $.fn.loading != 'undefined') {
            $("body").loading("hide", isForceHide);
        }
    },
    parseException: function (jqAjax, jqXHR) {
        var text = jqXHR.responseText;
        if (text && text.substr(0, 1) == "{") {
            var ex = $.parseJSON(text);
            if (ex.detail) {
                var exception = ex.detail;
                var typeIndex = exception.indexOf(':');
                var messageIndex = exception.indexOf('\r\n');
                var type = exception.substr(0, typeIndex);
                var message = exception.substr(typeIndex + 1, messageIndex - typeIndex);
                var stackTrace = exception.substr(messageIndex + 4);

                //type = type.toLowerCase() == "ok" ? "error" : type;
                type = "error";
                return { "type": type, "message": message, "stackTrace": stackTrace, "code": ex.code };
            }
            else {
                return { "type": "error", "message": ex.message, "stackTrace": '', "code": ex.code };
            }
        } else {
            return {
                "type": jqXHR.statusText.toLowerCase() == "ok" ? "error" : jqXHR.statusText,
                "message": ['向服务器执行', jqAjax.type, '请求时出错', text].join(''),
                "stackTrace": ['contentType：', jqAjax.contentType, '<br />', 'url：', jqAjax.url].join(''),
                "code": 400
            };
        }
    },
    showError: function (jqAjax, jqXHR, textStatus, errorThrown) {
        var catchExceptions = ['Nd.Platform.PlatformException', 'System.ArgumentException', 'System.ArgumentNullException', 'Nd.Tool.BusinessException', 'Nd.Platform.NAE.NotFoundException (0x00000002)'];
        if (jqXHR.readyState == 4) {
            var exception = $.ajaxhelper.parseException(jqAjax, jqXHR);
            if ($.inArray(exception.type, catchExceptions) > -1) {
                if (typeof $.fn.dialog != 'undefined') {
                    if (typeof $.fn.udialog != 'undefined') {
                        if (typeof $.popup != 'undefined') {
                            $.popup.error({
                                content: $.trim(exception.message),
                                closeTimes: 5000,
                                dialogClass: "upopup upopup-a",
                                width: "auto"
                            });
                        } else {
                            $(['<div>', '<p style="line-height:24px;">', $.trim(exception.message), '</p>', '</div>'].join(''))
                                .udialog({
                                    title: '系统提示',
                                    icon: '',
                                    maxHeight: 400,
                                    height: 400,
                                    modal: true,
                                    closeTimes: 2000,
                                    buttons: [
                                        {
                                            text: "关闭",
                                            click: function () {
                                                $(this).udialog("destroy");
                                                $(this).remove();
                                            },
                                            "class": "default-btn"
                                        }
                                    ]
                                });
                        }
                    } else {
                        $(['<div>', '<p style="line-height:24px;">', $.trim(exception.message), '</p>', '</div>'].join(''))
                            .dialog({
                                title: '系统提示',
                                resizable: false,
                                modal: true,
                                height: 140,
                                buttons: {
                                    "关闭": function () {
                                        $(this).dialog("close");
                                    }
                                }
                            });
                    }
                } else {
                    alert(exception.message);
                }
            } else {
                if (typeof $.fn.dialog != 'undefined') {
                    if (typeof $.fn.udialog != 'undefined') {
                        $(['<div>', '<p>', '错误信息：', $.trim(exception.message), '<br />', '错误类型：', $.trim(exception.type), '<br />', '错误堆栈：', '<pre>', $.trim(exception.stackTrace), '</pre>', '</p>', '</div>'].join(''))
                            .udialog({
                                title: '出错了，请将以下错误反馈给客服',
                                icon: '',
                                width: 500,
                                height: 400,
                                maxHeight: 400,
                                buttons: [
                                    {
                                        text: "关闭",
                                        click: function () {
                                            $(this).udialog("destroy");
                                            $(this).remove();
                                        },
                                        "class": "default-btn"
                                    }
                                ]
                            });
                    } else {
                        $(['<div>',
                            '<p style="line-height:20px;">',
                            '错误信息：', $.trim(exception.message), '<br />',
                            '错误类型：', $.trim(exception.type), '<br />',
                            '错误堆栈：', '<pre>', $.trim(exception.stackTrace), '</pre>',
                            '</p>',
                            '</div>'].join(''))
                            .dialog({
                                title: '出错了，请将以下错误反馈给客服',
                                width: 500,
                                height: 400,
                                maxHeight: 400,
                                buttons: [
                                    {
                                        text: "关闭",
                                        click: function () {
                                            $(this).udialog("destroy");
                                            $(this).remove();
                                        },
                                        "class": "udialogBtn"
                                    }
                                ]
                            });
                    }
                } else {
                    alert([
                        '出错了，请将以下错误反馈给客服', '\r',
                        '错误信息：', $.trim(exception.message), '\r',
                        '错误类型：', $.trim(exception.type), '\r',
                        '错误堆栈：', $.trim(exception.stackTrace)
                    ].join(''));
                }
            }
        }
    }
};
$.ajaxSetup({
    complete: function (jqXHR, textStatus) {
        $.ajaxhelper.hideLoading();
    },
    error: function (jqXHR, textStatus, errorThrown) {
        $.ajaxhelper.showError(this, jqXHR, textStatus, errorThrown);
        $.ajaxhelper.hideLoading(true);
    }
});