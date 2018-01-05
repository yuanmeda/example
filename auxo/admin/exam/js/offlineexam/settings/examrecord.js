(function ($, w) {
    var USER_ID = w.userId,
        EXAM_ID = w.examId,
        ROOM_ID = w.roomId;

    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            }
            else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        get: function () {
            var url = '/' + projectCode + '/v1/m/exams/' + EXAM_ID + '/users/' + USER_ID + '/score_dm?room_id=' + ROOM_ID;
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            recordInfo: {
                userName: '',
                orgName: '',
                nodeName: '',
                markApplied: '',
                passStatus: '',
                subjectNodeList: [],
                submitNodeList: []
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.getExamRecord();
        },
        getExamRecord: function () {
            store.get().done($.proxy(function (data) {
                this.model.recordInfo.userName(data.userName);
                this.model.recordInfo.nodeName(data.nodeName);
                this.model.recordInfo.orgName(data.orgName);
                this.model.recordInfo.markApplied(data.markApplied);
                this.model.recordInfo.passStatus(data.passStatus);
                var newList = [];
                $.each(data.submitNodeList, $.proxy(function (i, v) {
                    if (v) {
                        v.submitTime = timeZoneTrans(v.submitTime);
                        newList.push(v);
                    }
                }, this));

                this.model.recordInfo.submitNodeList(newList);
                this.model.recordInfo.subjectNodeList(data.subjectNodeList);
            }, this));
        },
        toJSTime: function (dt) {
            if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5");
            return dt;
        }
    };

    $(function () {
        viewModel.init();
    })
})(jQuery, window);