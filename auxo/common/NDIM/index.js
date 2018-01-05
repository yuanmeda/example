/*!
 * 前台头部nav
 */
(function ($, window) {
    $(function () {
        var url = im_sso_url;
        var urlArr = url.split("/");
        var host = urlArr[2];
        if (host && host.length > 0) {
            var macToken = encodeURIComponent(Nova.getMacToken('GET', '/', host));
            url = url + '?auth=' + macToken;
            var temp = '<iframe name="ndIm" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>';
            $("#imChart").append(temp);
        }
    });

})(jQuery, window);
