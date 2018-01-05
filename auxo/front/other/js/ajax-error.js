void function () {
    $(document).ajaxSend(function (event, jqXhr, setting) {
        //jqXhr.then(null,function(resObj){
        jqXhr.global = true;
        //});
    }).ajaxError(function (event, jqxhr, setting, thrownError) {
        var statusCode = jqxhr.status;
        if (!jqxhr.global || !statusCode) return;
        if (statusCode == 401) {
            window.location.href = window.portal_web_url + '/' + projectCode + '/account/login?returnurl=' + encodeURIComponent(window.location.href);
        }
    });
}();
