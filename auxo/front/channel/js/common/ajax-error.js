$(function () {
    var dialogHelper = function (msg) {
        if ($.fn.udialog) {
            $.fn.udialog.alert(msg, {
                icon: 'error',
                title: window.i18nHelper ? window.i18nHelper.getKeyValue('channel.dialog.title') : '系统提示',
                buttons: [{
                    text: window.i18nHelper ? window.i18nHelper.getKeyValue('channel.dialog.confirm') : '确认',
                    click: function () {
                        $(this).udialog("hide");
                        if (window.__return_url) window.location.href = window.__return_url;
                    },
                    'class': 'ui-btn-confirm'
                }]
            }, function () {
                if (window.__return_url) window.location.href = window.__return_url;
            });
        } else {
            window.alert(msg);
        }
    };
    $(document).ajaxError(function (e, response, request, errType) {
        var error = response.responseJSON || JSON.parse(response.responseText);
        if (response.status === 401)return;
        dialogHelper(error.cause ? error.cause.message : error.message);
    });
});