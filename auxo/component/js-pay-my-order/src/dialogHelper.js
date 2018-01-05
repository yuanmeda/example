export default {
    alert: function (message) {
        var fn = $.fn.udialog && $.fn.udialog.alert || window.alert;
        fn(message, {
            title: i18nHelper.getKeyValue('payMine.hint'),
            buttons: [
                {
                    text: i18nHelper.getKeyValue('payMine.confirm')
                }
            ]
        },)
    },
    confirm: function (message, callback) {
        var fn = $.fn.udialog && $.fn.udialog.confirm || window.confirm;
        fn(message, [{
            text: i18nHelper.getKeyValue('payMine.confirm'),
            'class': 'ui-btn-confirm',
            click: function () {
                callback && callback();
                $(this).udialog("hide");
            }
        }, {
            text: i18nHelper.getKeyValue('payMine.cancel'),
            'class': 'ui-btn-primary',
            click: function () {
                $(this).udialog("hide");
            }
        }], {
            title: i18nHelper.getKeyValue('payMine.hint')
        });
    }
}