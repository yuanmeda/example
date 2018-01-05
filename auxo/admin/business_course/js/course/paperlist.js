(function ($, window) {
    //数据仓库
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                // $('body').loading('hide');
            }
        },
        update: function (data) {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/strategy';
            return $.ajax({
                url: url,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8'
                // error: this.errorCallback
            });
        },
        online: function () {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/online';
            return $.ajax({
                url: url,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8'
                // error: this.errorCallback
            });
        }

    };
    var viewModel = {
        model: {
            subType: subType || '0',
            showPaperList: false,
            questionbanks: null,
            paperFilter: {
                title: '',
                custom_id: '',
                question_bank_id: '',
                page: 0,
                size: 10,
                type: 2
            },
            papers: {
                items: [],
                count: 0
            },
            selectedPapers: [],
            count: 0,
            exam: {
                id: examId || null,
                title: "",
                enabled: false,//考试是否上线
                exam_strategy: 1,
                paper_list: [],
                question_setting_list: []
            },
            originalPapers: [],//初始出卷范围，用于判断是否删除
            questionTypes: [],//可用的试卷包含的题目类型及数量
            selectedIds: [],
            //from 3.9.1
            ndrBtnActive: true,
            addBtnActive: true,
            ndrFilter: {
                words: '',
                coverage: 'App/f4bfd12b-e9bb-4665-8745-7e7dd42c8b66/OWNER',
                page: 0,
                size: 20
            },
            ndrPapers: {
                items: [],
                count: 0
            },
            selectedNDRPapers:[]
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            $(document).trigger('showContent');
            /*跨域接受消息跳转*/
            var z = document.getElementById('frame');
            var n = new Nova.Notification(z.contentWindow, "*");
            var message_key_examCondition = "open_course.course.examCondition";
            n.addEventListener(message_key_examCondition, function (receiveData) {
                if (receiveData.event_type == 'examCondition') {
                    window.location.href = receiveData.data.returnUrl;
                }
            });
        },
        doPrev: function () {
            window.parentModel._setFullPath('1.2.98-2');
        },
        doNext: function () {
            window.parentModel._setFullPath('1.2.97');
        },
        cancel: function () {
            window.parentModel._setFullPath('1.2.4');
        },
        save: function () {
            this.doSave(function () {
                $.fn.dialog2.helpers.alert("保存成功");
                viewModel.refreshAddPaperBtn();
            });
        },
        saveThenNext: function () {
            this.doSave(this.doNext);
        },
        refreshAddPaperBtn: function () {
            if (viewModel.model.exam.enabled() || (viewModel.model.exam.paper_list().length > 50)) {
                $('#btnUpload').hide();
            } else {
                $('#btnUpload').show();
            }
        },
        previewRandomPaper: function () {
            var _arr = viewModel.model.exam.paper_list();
            window.open($("#btnPreview").eq(0).attr('href'));
        },
        saveThenPreview: function () {
            var self = this;
            this.doSave(function () {
                $.fn.dialog2.helpers.alert('保存成功!', {
                    "close": function () {
                        self.previewRandomPaper();
                        return;
                    },
                    buttonLabelOk: '预览'
                });
                viewModel.refreshAddPaperBtn();
            });
        },
        doSave: function (callback) {
            if (!$("form").valid()) {
                return;
            }
            var self = viewModel;
            var data = self.getData();
            if (data.paper_list.length === 0) {
                Utils.alertTip('出卷范围不能为空！', {
                    icon: 7
                });
                return;
            }
            store.update(data).done(function () {
                if (callback) {
                    callback();
                }
            });
        },
        getData: function () {
            var self = viewModel;
            var exam = ko.mapping.toJS(viewModel.model.exam);
            var data = {};
            data.exam_strategy = exam.exam_strategy;
            if (data.exam_strategy == '2') {
                data.question_setting_list = exam.question_setting_list;
            } else {
                data.question_setting_list = [];
            }
            var removedIds = [];
            for (var i = 0; i < self.model.originalPapers.length; i++) {
                var originalPaper = self.model.originalPapers[i];
                var found = false;
                for (var j = 0; j < exam.paper_list.length; j++) {
                    var currentPaper = exam.paper_list[j];
                    if (originalPaper.id == currentPaper.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    removedIds.push(originalPaper.id);
                }
            }
            var papers = [];
            $.each(exam.paper_list, function (index, element) {
                var it = {
                    paper_id: element.id,
                    version: element.version,
                    disabled: element.disabled,
                    location: element.location
                };
                papers.push(it);
            });
            data.removed_paper_ids = removedIds;
            data.paper_list = papers;
            return data;
        }
    }
    $(function () {
        viewModel.init();
    });

})(jQuery, window);