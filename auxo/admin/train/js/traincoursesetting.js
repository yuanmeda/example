;(function ($, window) {
    "use strict";
    var viewModel = {
        //页面初始化
        init: function () {
            ko.applyBindings(this);
            /*跨域发送监听消息*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_course = "train.course";
            var message_key = "opencourse.course";
            var message_key_cancel = "course.cancel";
            n.addEventListener(message_key_course, function (receiveData) {
                if (receiveData.event_type == 'create_course') {
                    if (receiveData.data.courseId) {
                        window.location.href = save_url + '?course_type=' + courseType + '&course_id=' + receiveData.data.courseId + (return_url ? '&return_url=' + encodeURIComponent(return_url) : '') + (window.source ? '&source=' + encodeURIComponent(window.source) : '');
                    }
                    if (receiveData.data.edit) {
                        window.location.href = "/" + projectCode + "/train/" + trainId + "/course" + (return_url ? '?return_url=' + encodeURIComponent(return_url) : '') + (window.source ? '&source=' + encodeURIComponent(window.source) : '');
                    }
                }
            });
            n.addEventListener(message_key, function (receiveData) {
                if (receiveData.event_type == 'edit_course') {
                    if (receiveData.data.courseId) {
                        window.location.href = '/' + projectCode + '/train/' + trainId + '/course/' + courseId + '/edit' + (return_url ? '?return_url=' + encodeURIComponent(return_url) : '') + (window.source ? '&source=' + encodeURIComponent(window.source) : '');
                    }
                }
            });
            n.addEventListener(message_key_cancel, function (receiveData) {
                if (receiveData.event_type == 'cancel') {
                    if (receiveData.data.cancel) {
                        window.location.href = '/' + projectCode + '/train/' + trainId + '/course' + (return_url ? '?return_url=' + encodeURIComponent(return_url) : '') + (window.source ? '&source=' + encodeURIComponent(window.source) : '');
                    }
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
