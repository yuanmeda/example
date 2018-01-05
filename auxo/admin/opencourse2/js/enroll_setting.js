(function ($, window) {
    'use strict';
    var viewModel = {
        init: function () {
            ko.applyBindings(this);
            /*跨域接受消息跳转*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_list_course = "opencourse2.return_url";
            n.addEventListener(message_key_list_course, function (receiveData) {
                if (receiveData.event_type == 'return_url') {
                    window.location.href = receiveData.data.returnUrl;
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);