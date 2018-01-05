(function ($) {
    'use strict';
    var viewModel = {
        init: function () {
            ko.applyBindings(this);
            /*跨域发送监听消息*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_examCondition = "open_course.course.examCondition";
            var message_key_paperlist = "train.paperlist";
            n.addEventListener(message_key_examCondition, function (receiveData) {
                if (receiveData.event_type == 'examCondition') {
                    if (receiveData.data.returnUrl) {
                        window.location.href = receiveData.data.returnUrl.split('?__mac=')[0];
                    }
                }
            });
            n.addEventListener(message_key_paperlist, function (receiveData) {
                if (receiveData.event_type == 'paperlist') {
                    if (receiveData.data.returnUrl) {
                        window.location.href = receiveData.data.returnUrl;
                    }
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery);