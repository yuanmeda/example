(function ($, window) {
    'use strict';
    var viewModel = {
        model: {
            url: ko.observable()
        },
        init: function () {
            ko.applyBindings(this);
            if (courseId) {
                var __return_url = opencourseWebpage + '/' + projectCode + '/admin/open_course/' + courseId + '?source=' + source + '&return_url=' + encodeURIComponent(returnUrl);
                this.model.url(__return_url);
            } else {
                this.model.url(returnUrl);
            }
            /*跨域发送监听消息*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_create = "opencourse.course";
            var message_key_cancel = "course.cancel";
            n.addEventListener(message_key_create, function (receiveData) {
                if (receiveData.event_type == 'edit_course') {
                    window.location.href = '/' + projectCode + '/admin/open_course/' + courseId + '/chapter?business_type=' + business_type + '&source=' + source + '&return_url=' + returnUrl;
                    // if (receiveData.data.returnUrl) {
                    //     window.location.href = receiveData.data.returnUrl;
                    // }
                    // if (receiveData.data.edit) {
                    //     if (returnUrl && source && returnUrl != 'null' && source != 'null') {
                    //         window.location.href = returnUrl;
                    //     } else {
                    //         window.location.href = '/' + projectCode + '/admin/open_course/manage';
                    //     }
                    // }
                }
            });
            n.addEventListener(message_key_cancel, function (receiveData) {
                if (receiveData.event_type == 'cancel') {
                    if (receiveData.data.cancel) {
                        window.location.href = '/' + projectCode + '/admin/open_course/' + courseId + '?business_type=' + business_type + '&source=' + source + '&return_url=' + returnUrl;
                        // if (returnUrl && source && returnUrl != 'null' && source != 'null') {
                        //     window.location.href = returnUrl;
                        // } else {
                        //     window.location.href = '/' + projectCode + '/admin/open_course/manage';
                        // }
                    }
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);