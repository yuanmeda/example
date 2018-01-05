(function (w, $) {

    var EXAMID = w.examId;
    var SESSIONID = w.sessionId;
    var code = w.projectCode;
    var REQ_URI = selfUrl + '/' + code + '/v1/m/exams/' + EXAMID,
        REQ_URI_SE = REQ_URI + '/sessions/' + SESSIONID;
    var defaultNode = {
        title: "",
        duration: 0,
        time_left: 0,
        description: "",
        submit_time: "",
        status: 0, //0 提交答案  //1答案回顾  //时间到未提交
        attachment: {
            id: "",
            name: "",
            size: 0,
            description: "",
            url: "",
            prview_url: ""
        }
    };
    var store = {
        //body answer user_answer
        getAttachments: function (data) {
            return $.ajax({
                url: REQ_URI_SE + '/attachments',
                data: data,
                dataType: 'json',
                cache: false
            })
        }
    };
    var viewModel = {
        model: {
            attachments: [],
            slider: {
                from: 0
            },
            nowAttachment: {
                id: '',
                name: '',
                preview_url: '',
                url: ""
            },
            attachmentType: window.attachmentType,
            init: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.showItems = ko.computed(function () {
                return this.model.attachments().concat([]).splice(this.model.slider.from(), 5)
            }, this);

            ko.applyBindings(this);
            this.getAttachments();
        },
        getAttachments: function () {
            var self = this;
            store.getAttachments({
                exam_id: examId,
                session_id: sessionId,
                type: attachmentType,
                index: nodeIndex === '' ? undefined : parseInt(nodeIndex)
            }).done(function (data) {
                self.model.attachments(data);
                var nowAttachment = null;
                if (window.attachmentId) {
                    $.each(data, function (i, v) {
                        if (v.id == window.attachmentId) {
                            self.model.slider.from(data.length - 5 > i ? i : (data.length - 5 < 0 ? 0 : data.length - 5));
                            nowAttachment = v;
                            return false;
                        }
                    })
                } else {
                    nowAttachment = data[0];
                }
                ko.mapping.fromJS(nowAttachment, {}, self.model.nowAttachment);
                self.model.init(true);
            });
        },
        selectAttachment: function ($data) {
            ko.mapping.fromJS($data, {}, this.model.nowAttachment);
        },
        slideTab: function (offset) {
            var fn = this.model.slider.from;
            if (fn() + offset >= 0 && fn() + offset + 5 <= this.model.attachments().length)fn(fn() + offset);
        },
        checkFileType: function () {
            var filename = this.model.nowAttachment.name(), suffix = filename.split('.')[filename.split('.').length - 1];
            if (/^(xlsx|xls)$/gi.test(suffix) && this.model.nowAttachment.preview_url() !== this.model.nowAttachment.url())return 'excel';
            if (/^(gif|jpg|jpeg|bmp|png)$/gi.test(suffix))return 'image';
            return 'download';
        }
    };
    $(function () {
        viewModel.init();
    })
})(window, jQuery);