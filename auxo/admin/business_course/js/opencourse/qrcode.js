/*
 公开课标签
 */
;(function ($, window) {
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "cmp://com.nd.sdp.component.e-course-new/main?courseId=" + courseId
    });
})(jQuery, window);
