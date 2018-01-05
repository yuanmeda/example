(function ($) {
    $(function () {
        var CURRENT_BODY_HEIGHT = 0;

        $('#examframe').on('load', function () {
            setTimeout(function () {
                var doc = getIframeDOM('examframe');
                resize(doc.body, true);
                setInterval(function () {
                    var doc = getIframeDOM('examframe');
                    doc.body.onresize = resize(doc.body);
                }, 1000);
            }, 1000);
        });

        function resize(body, ignore) {
            var bodyHeight = body.scrollHeight,
                newHeight = bodyHeight + 10000;
                // $(body).find('.modal').css('top',$(window).height()/2);
            if (bodyHeight > CURRENT_BODY_HEIGHT || ignore) {
                $(body).height(newHeight);
                CURRENT_BODY_HEIGHT = newHeight;
            }
        }

        function getIframeDOM(id) {
            return document.getElementById(id).contentDocument || document.frames[id].document;
        }

    });
})(jQuery);