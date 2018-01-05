(function ($,window) {
    'use strict';
    $("#J_Nav li").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        var src = cloudUrl + $(this).data("src") + "?cloud_token=" + encodeURIComponent(cloudToken);
        if ($(this).attr("id") == "exambank") {
            src = elearningNetUrl+$(this).data("src");
        }
        $("#subiframe").attr("src", src);
        var windowHeight = $(window).height();
        var height = windowHeight - $('.subiframe')[0].offsetTop - 41;
        $('.subiframe').css({
            height: height > 800 ? (height + 'px') : '650px'
        });
    }).eq(0).trigger("click");
})(jQuery,window);