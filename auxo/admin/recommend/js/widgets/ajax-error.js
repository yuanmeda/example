void function () {
    $(document).ajaxSend(function (event, jqXhr, setting) {
        if(!jqXhr.hideLoading) $("body").loading('show');
        jqXhr.global = true;
    }).ajaxComplete(function () {
        $("body").loading('hide');
    }).ajaxError(function (event, jqxhr, setting, thrownError) {
        var statusCode = jqxhr.status;
        if (!jqxhr.global || !statusCode) return;
        if ($.fn.dialog2.helpers) {
            var res = $.parseJSON(jqxhr.responseText),
                m = res.message || res.Message;
            if (m && m !== 'null') $.fn.dialog2.helpers.alert(m, {title: '错误'});
            else $.fn.dialog2.helpers.alert('服务错误', {title: '错误'});
        }
        $("body").loading('hide');
    });
}();