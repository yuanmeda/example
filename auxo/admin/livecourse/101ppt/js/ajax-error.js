void function () {
    $(document).ajaxSend(function (event, jqXhr, setting) {
        jqXhr.global = true;
    }).ajaxError(function (event, jqxhr, setting, thrownError) {
        var statusCode = jqxhr.status;
        if (!jqxhr.global || !statusCode) return;
        var error = jqxhr.responseText && JSON.parse(jqxhr.responseText);
        $.errorDialog((error && error.message) || '服务故障').show();
    });
}();
