/*
 公开课标签
 */
;(function ($, window) {
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "cmp://com.nd.elearning.train/etraincert?trainId=" + trainId
    });
})(jQuery, window);
