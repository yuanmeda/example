(function ($) {

    $.fn.udialog = function (options) {
        var self = $(this);
        if (options instanceof Object || typeof options == "undefined") {
            options = $.extend(true, {}, $.fn.udialog.defaults, options);
            var div = $("<div class='udialog-message'></div>");
            if (options.icon != "") {
                $("<i class='udialog-icon udialog-icon-" + options.icon + "'></i>").appendTo(div);
                var text = $("<div class='udialog-message-text'></div>");
                $(this).children().appendTo(text);
                text.appendTo(div);
                div.appendTo($(this));
            }
            $(this).dialog(options);
            if (options.title == "")
                $(this).prev().hide();
            if (options.disabledClose) {
                $(this).prev().find(".ui-dialog-titlebar-close").remove();
            }
            if (options.closeTimes > 0)
                window.setTimeout(function () {
                    self.udialog("close");
                }, options.closeTimes);
            if (options.modal == true && typeof options.overlay == "number")
                $(this).parent().next().css("opacity", options.overlay);
        }
        if (typeof options == "string") {
            switch (options) {
                case "show":
                    $(this).dialog("open");
                    break;
                case "hide":
                    $(this).dialog("close");
                    break;
                default:
                    $(this).dialog("destroy");
                    break;
            }
        }
        return this;
    };
    //默认配置
    $.fn.udialog.defaults = {
        autoOpen: true,
        closeOnEscape: false,
        disabledClose: false,
        closeText: '关闭',
        dialogClass: 'udialog',
        draggable: true,
        resizable: false,
        height: 'auto',
        buttonType: 'a',
        width: 400,
        zIndex: 1000,
        modal: true,
        maxHeight: false,//The maximum height to which the dialog can be resized, in pixels.
        minHeight: 200,
        maxWidth: false,//The maximum width to which the dialog can be resized, in pixels.
        minWidth: 150,
        position: 'center',// 'center', 'left', 'right', 'top', 'bottom'
        title: '系统提示',
        icon: '',//枚举值 info, right,error
        buttons: [],
        closeTimes: 0,
        overlay: 0.3
    };
    function tmpl(text, desc, iconClass) {
        var tmpl = "";
        tmpl += " <div class=\"sys-err-box\">";
        tmpl += "        <div class=\"sys-err\">";
        tmpl += "            <div class=\"sys-err-bd\">";
        tmpl += "                <div class=\"sys-err-alert clearfix\">";
        tmpl += "                    <i class=\"" + iconClass + "\"><\/i>";
        tmpl += "                    <p class=\"sys-err-text\">" + text + "<\/p>";
        tmpl += "                    <p class=\"sys-err-desc\">" + desc + "<\/p>";
        tmpl += "                <\/div>";
        tmpl += "            <\/div>";
        tmpl += "        <\/div>";
        tmpl += "    <\/div>";
        return tmpl;
    }

    var __helpers = {
        alert: function (content, options) {
            options = $.extend({}, $.fn.udialog.alert.defaults, options);
            var u;
            if (content.scrollIntoView) {
                u = $("<div></div>").append($(content)).udialog(options);
            }
            if (content instanceof jQuery) {
                var self = $("<div></div>");
                u = self.append(content.show()).udialog(options);
            }
            if (typeof content == "string") {
                u = $("<div><div class='udialog-text'>" + content + "</div></div>").udialog(options);
            }
            $(".ui-icon-closethick", u.prev()).unbind("click").click(function () {
                u.udialog("hide");
                //u.remove();
                return false;
            })
        },
        confirm: function (msg, btns, opts) {
            var opts = $.extend({}, $.fn.udialog.confirm.defaults, {buttons: btns || []}, opts);
            $("<div class='udialog-message-text'><div class='udialog-text'>" + msg + "</div></div>").udialog(opts);
        },
        modalTip: function () {
            var dialog;
            return function (content, opts, func) {
                dialog = $(tmpl(content.text || '', content.desc || '', opts.iconClass));
                dialog.udialog($.extend({}, $.fn.udialog.modalTip.defaults, opts));
                $(".ui-icon-closethick", dialog.prev()).unbind("click").click(function () {
                    dialog.udialog("hide");
                    if (typeof func == 'function')func();
                    return false;
                })
            }
        }()
    };
    $.extend(true, $.fn.udialog, __helpers);

    $.extend($.fn.udialog.alert, {
        defaults: {
            modal: true,
            icon: "info",
            overlay: 0.2,
            title: " ",
            buttonType: 'a',
            minHeight: 80,
            closeText: '',
            dialogClass: "sys-alert udialog",
            closeTimes: 0,
            buttons: [{
                text: "确认", click: function () {
                    $(this).udialog("hide");
                }, 'class': 'default-btn'
            }]
        }
    });
    $.extend($.fn.udialog.confirm, {
        defaults: {
            modal: true,
            icon: "",
            overlay: 0.1,
            minHeight: 80,
            width: 440,
            buttonType: 'a',
            closeText: '',
            dialogClass: "sys-confirm udialog",
            closeTimes: 0
        }
    });
    $.extend($.fn.udialog.modalTip, {
        defaults: {
            modal: true,
            icon: "",
            title: " ",
            overlay: 0.2,
            buttonType: 'a',
            closeTimes: 0,
            width: 400,
            dialogClass: "sys-modalTip udialog",
            closeText: ''
        }
    });

})(jQuery);
