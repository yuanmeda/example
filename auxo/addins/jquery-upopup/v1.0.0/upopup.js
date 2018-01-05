(function ($) {
    var popup = function () {
        var p = "center";
        try {
            if (top.window !== window) {
                var vw = $(top.window).width() - $(window).width();
                p = { my: 'center-' + vw / 2 + 'center', at: "center", of: $(top.window) };
            }
        }catch(err){
            window.console && console.log(err);
        }
        this._defaults = {
            dialogClass: 'upopup',
            draggable: false,
            resizable: false,
            height: 'auto',
            minHeight: "60",
            width: 400,
            modal: true,
            position: p,
            title: '系统提示',
            content: "",
            closeTimes: 3000,
            overlay: 0.3,
            zIndex: 1060
        };
    };

    popup.prototype = {
        constructor: popup,
        _dialog: function (option) {
            var maxTag = $(".upopup-concent:last").attr("upopup-tag"),
                tag = 0;
            if (typeof maxTag != "undefined") {
                tag = parseInt(maxTag, 10) + 1;
            }

            $("body").append(this._getTmpl(tag, option.title, option.content));

            $(".upopup-close").click(function () {
                $(".upopup-concent[upopup-tag=" + tag + "]").udialog("hide");
                return false;
            });

            $(".upopup-concent[upopup-tag=" + tag + "]").udialog(option);
        },
        _getTmpl: function (tag, title, content) {
            var html = [];
            html.push(
                '<div class="upopup-concent" upopup-tag="' + tag + '">\
                    <a class="upopup-i upopup-close" href="#"></a>\
                    <div class="upopup-left">\
                        <div class="upopup-i upopup-pic"></div>\
                    </div>\
                    <div class="upopup-right">\
                        <span class="upopup-prompt">'+ title + '</span><br />\
                        <span class="upopup-info">'+ content + '</span>\
                    </div>\
                </div>'
            );
            return html.join('');
        },
        success: function (option) {
            option = $.extend({}, this._defaults, option);
            option.dialogClass += ' upopup-success';
            this._dialog(option);
        },
        error: function (option) {
            option = $.extend({}, this._defaults, option);
            option.dialogClass += ' upopup-error';
            this._dialog(option);
        },
        //替代原来的$.fn.udialog.alert
        alert: function (content, options) {
            $.fn.udialog.alert(content, options);
        }
    };

    if (typeof $.popup == 'undefined' || $.popup == null) {
        $.popup = new popup();
    }
})(jQuery);