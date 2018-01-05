$(function () {
    var dialogHelper = function (msg) {
        if ($.fn.udialog) {
            $.fn.udialog.alert(msg, {
                icon: 'error',
                title: i18nHelper.getKeyValue('pkComponent.common.hint'),
                buttons: [{
                    text: i18nHelper.getKeyValue('pkComponent.common.confirm'),
                    click: function () {
                        $(this).udialog("hide");
                        if (window.__return_url) window.location.href = __return_url;
                    },
                    'class': 'ui-btn-confirm'
                }]
            }, function () {
                if (window.__return_url) window.location.href = __return_url;
            });
        } else {
            window.alert(msg);
        }
    };
    $(document).ajaxError(function (e, response, request, errType) {
        var error;
        try {
            error = response.responseJSON || (response.responseText && JSON.parse(response.responseText));
        } catch (e) {
        }
        if (error) dialogHelper((error.cause ? error.cause.message : error.message) || i18nHelper.getKeyValue('pkComponent.common.error'));
    });
});
