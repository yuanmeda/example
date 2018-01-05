;(function ($, window) {
    var thirdUrl = window.thirdUrl, iframe = document.getElementById("mainIframe"),
        initscreenh = $(iframe).height();
    if (~thirdUrl.indexOf("{auth}")) {
        var fmtThirdUrl = window.Nova.getMacTokenBySlash(thirdUrl);
        if (thirdUrl == fmtThirdUrl) location.href = selfUrl + '/' + projectCode + '/account/login?returnurl=' + encodeURIComponent(window.location.href);
        else iframe.src = fmtThirdUrl;
    } else {
        if (~thirdUrl.indexOf('lecturer')) {
            thirdUrl += '&project_code=' + window.projectCode;
            if (window.isLogin && Nova.getMacToB64(thirdUrl)) thirdUrl += (~thirdUrl.indexOf("?") ? "&" : "?") + '__mac=' + Nova.getMacToB64(thirdUrl);
            $(window).on('message', function (event) {
                var msg = event.originalEvent.data && JSON.parse(event.originalEvent.data),
                    innerHeight = 0;
                if (msg) innerHeight = msg.data.height;
                if (initscreenh < innerHeight) {
                    $('#channelContainer').removeAttr('style').css({
                        'height': innerHeight + 'px'
                    });
                }
            });
        }
        if (~thirdUrl.indexOf('mystudy')) {
            $(window).on('message', function (event) {
                var msg = event.originalEvent.data && JSON.parse(event.originalEvent.data),
                    innerHeight = 0;
                if (msg) innerHeight = msg.height;
                if (initscreenh < innerHeight) {
                    $('#channelContainer').removeAttr('style').css({
                        'height': innerHeight + 'px'
                    });
                }
            });
        }
        iframe.src = thirdUrl;
    }
})(jQuery, window);