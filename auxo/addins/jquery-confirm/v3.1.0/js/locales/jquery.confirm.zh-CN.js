(function ($, jconfirm) {
    $.extend(true, jconfirm.pluginDefaults, {
        title: '系统提示',
        defaultButtons: {
            ok: {
                text: "确定",
                btnClass: 'btn-primary',
                action: function () {
                }
            },
            close: {
                text: "取消",
                action: function () {
                }
            },
        }
    });
}(jQuery, jconfirm));