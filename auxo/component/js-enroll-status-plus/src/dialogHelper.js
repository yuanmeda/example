export default {
    alert: function (message) {
        var fn = $.fn.udialog && $.fn.udialog.alert || window.alert;
        fn(message, {
            title: i18nHelper.getKeyValue('enroll.hint'),
            buttons: [
                {
                    text: i18nHelper.getKeyValue('enroll.confirm'),
                    'class': 'ui-btn-primary'
                }
            ]
        },)
    },
    confirm: function (message, callback) {
        var fn = $.fn.udialog && $.fn.udialog.confirm || window.confirm;
        fn(message, [{
            text: i18nHelper.getKeyValue('enroll.confirm'),
            click: function () {
                callback && callback();
                $(this).udialog("hide");
            }
        }, {
            text: i18nHelper.getKeyValue('enroll.cancel'),
            click: function () {
                $(this).udialog("hide");
            }
        }], {
            title: i18nHelper.getKeyValue('enroll.hint')
        });
    }
}