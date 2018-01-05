(function ($) {
    'use strict';
    var viewModel = {
        init: function () {
            var pt = encodeURIComponent('学分设置');
            var ppu = encodeURIComponent(location.origin + '/' + projectCode + '/specialty/' + specialtyId + '/exam/' + examId + '/score?source='+source+'&return_url='+encodeURIComponent(return_url));
            var pru = encodeURIComponent(location.origin + '/' + projectCode + '/specialty/' + specialtyId + '/courselist?source='+source+'&return_url='+encodeURIComponent(return_url))

            var url = examWebpage + '/' + projectCode + '/exam/paper?exam_id=' + examId
                + '&__train_id=' + specialtyId + '&sub_type=0' + '&__prev_text=' + pt
                + '&__parent_return_url=' + pru + '&__parent_prev_url=' + ppu;

            $('#frame').attr('src', url);
            /*跨域发送监听消息*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_examCondition = "train.examCondition";
            var message_key_paperlist = "train.paperlist";
            n.addEventListener(message_key_examCondition, function (receiveData) {
                if (receiveData.event_type == 'examCondition') {
                    if (receiveData.data.returnUrl) {
                        window.location.href = receiveData.data.returnUrl;
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