void function () {
    var viewModel = {
        model: {
        },
        init: function () {
            ko.applyBindings(this);
            /*跨域发送监听消息*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_createExam = "train.exam." + (examId ? 'edit' : 'create');
            var message_key_editExam = "train.exam.edit";
            var message_data = {
                event_type: (examId ? 'edit' : 'create') + "_exam",
                //context_id: __context_id ? __context_id : "",
                data:{
                    custom_id: trainId,
                    context_id: contextId,
                    custom_type: customType,
                    cancelUrl: '/' + projectCode + '/train/' + trainId + '/exam?source=' + source + '&return_url=' + encodeURIComponent(return_url),
                    saveThenNextUrl: '/' + projectCode + '/train/' + trainId + '/exam/' + examId +'/admission_setting?source=' + source + '&return_url=' + encodeURIComponent(return_url)
                }
            };
            n.addEventListener(message_key_createExam, function (receiveData) {
                if (receiveData.event_type == (examId ? 'edit' : 'create') + '_exam') {
                    if (receiveData.data.sendData) {
                        n.dispatchEvent("message:" + message_key_createExam, message_data);
                    }
                    if (receiveData.data.returnUrl) {
                        location.href = receiveData.data.returnUrl;
                    }
                }
            });
            /*刚创建，保存并返回用*/
            n.addEventListener(message_key_editExam, function (receiveData) {
                if (receiveData.event_type == 'edit_exam') {
                    if (receiveData.data.returnUrl) {
                        location.href = receiveData.data.returnUrl;
                    }
                }
            });
        },
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);