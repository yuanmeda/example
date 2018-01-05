void function () {
    var store = {
        createSpecialtyExam: function (data) {
            return $.ajax({
                url: specialtyWebpageApi + '/v1/specialty_plans/' + specialtyId + '/learning_units',
                data: JSON.stringify(data),
                type: 'POST',
                contentType: 'application/json'
            })
        }
    };

    var viewModel = {
        model: {},
        init: function () {
            ko.applyBindings(this);
            /*跨域发送监听消息*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_createExam = "train.exam.create";// + (examId ? 'edit' : 'create');
            var message_key_editExam = "train.exam.edit";
            var message_data = {
                event_type: (examId ? 'edit' : 'create') + "_exam",
                //context_id: __context_id ? __context_id : "",
                data: {
                    custom_id: specialtyId,
                    context_id: contextId,
                    custom_type: customType,
                    cancelUrl: '/' + projectCode + '/specialty/' + specialtyId + '/courselist?source=' + source + '&return_url=' + encodeURIComponent(return_url),
                    saveThenNextUrl: '/' + projectCode + '/specialty/' + specialtyId + '/exam/' + examId + '/score?source=' + source + '&return_url=' + encodeURIComponent(return_url)
                }
            };
            n.addEventListener(message_key_createExam, function (receiveData) {
                if (receiveData.event_type == 'create_exam') {
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
                    if (receiveData.data.sendData) {
                        n.dispatchEvent("message:" + message_key_editExam, message_data);
                    }
                    if (receiveData.data.examId) {
                        if (!examId) {
                            var data = {
                                term_id: termId,
                                score: 0,
                                is_required: courseType,
                                unit_id: receiveData.data.examId,
                                unit_type: 'plan_exam',
                            };
                            store.createSpecialtyExam(data).done(function () {
                                location.href = receiveData.data.returnUrl;
                            });
                        } else
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