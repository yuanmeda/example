$(function () {
    var dialogHelper = function (msg) {
        if ($.fn.udialog) {
            $.fn.udialog.alert(msg, {
                icon: 'error',
                title: i18nHelper.getKeyValue('enrollComponent.common.hint'),
                buttons: [{
                    text: i18nHelper.getKeyValue('enrollComponent.common.confirm'),
                    click: function () {
                        $(this).udialog("hide");
                        if (__return_url) window.location.href = __return_url;
                    },
                    'class': 'ui-btn-confirm'
                }]
            }, function () {
                if (__return_url)window.location.href = __return_url;
            });
        } else {
            window.alert(msg);
        }
    };
    $(document).ajaxError(function (e, response, request, errType) {
        var error = response.responseJSON || JSON.parse(response.responseText);
        if (response.status === 401) {
            return;
        }
        if(request.url !== "/v1/mobile_verification_codes")
            dialogHelper(error.cause ? error.cause.message : error.message);
    });
});
