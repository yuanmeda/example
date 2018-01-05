(function ($, window) {
    'use strict';
    var viewModel = {
        model: {
            url: ko.observable()
        },
        init: function () {
            ko.applyBindings(this);
            var __return_url = opencourseWebpage + '/' + projectCode + '/admin/open_course/create?business_type=' + business_type + '&course_id=' + courseId + '&source=' + source + '&return_url=' + encodeURIComponent(returnUrl);
            this.model.url(__return_url);
            /*跨域发送监听消息*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_create = "opencourse.course";
            n.addEventListener(message_key_create, function (receiveData) {
                if (receiveData.event_type == 'edit_course') {
                    if (receiveData.data.returnUrl) {
                        window.location.href = receiveData.data.returnUrl;
                    }
                }
            });
            n.addEventListener(message_key_create, function (receiveData) {
                if (receiveData.event_type == 'detail_next_page') {
                    window.location.href = '/' + projectCode + '/admin/open_course/' + courseId + '/chapter?business_type=' + business_type + '&source=' + source + '&return_url=' + returnUrl;
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);