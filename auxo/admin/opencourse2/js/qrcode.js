/*
 公开课标签
 */
;(function ($, window) {
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "cmp://com.nd.sdp.component.elearning-businesscourse/course?course_id=" + courseId
    });
})(jQuery, window);
