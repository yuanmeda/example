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
                $('body').loading('hide');
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
//                error: this.errorCallback
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
            });
        }

    };
    var viewModel = {
        model: {
            showPaperList: false,
            questionbanks: null,
            paperFilter: {
                title: '',
                custom_id: '',
                question_bank_id: '',
                page: 0,
                size: 10
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
            subType: '0',
            originalPapers: [],//初始出卷范围，用于判断是否删除
            questionTypes: [],//可用的试卷包含的题目类型及数量
            selectedIds: [],
            style: 'table'//列表显示风格
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

        },
        cancel: function () {
            location.href = '/' + projectCode + "/train/" + trainId + "/exam";
        },
        //保存按钮事件
        save: function () {
            this.doSave($.proxy(function () {
                $.fn.dialog2.helpers.alert("保存成功");
                this.refreshAddPaperBtn();
            }, this));
        },
        saveThenReturn: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/train/" + trainId + "/exam";
            });
        },
        toCondition: function () {
            location.href = '/' + projectCode + "/train/" + trainId + "/exam/" + examId + "/admission_setting";
        },
        refreshAddPaperBtn: function () {
            if (this.model.exam.enabled() || (this.model.exam.paper_list().length > 50)) {
                $('#btnUpload').hide();
                $('#btnAdd').hide();
            } else {
                $('#btnUpload').show();
                $('#btnAdd').show();
            }
        },
        doSave: function (callback) {
            if (!$("form").valid()) {
                return;
            }
            var data = this.getData();
            if (Enumerable.from(data.paper_list).all("$.disabled")) {
                $.fn.dialog2.helpers.alert("至少启用一份试卷");
                return;
            }

            store.update(data).done(function () {
                if (callback) {
                    callback();
                }
            });
        },
        getData: function () {
            var self = this;
            var exam = ko.mapping.toJS(this.model.exam);
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
                var it = {paper_id: element.id, version: element.version, disabled: element.disabled};
                papers.push(it);
            });
            data.removed_paper_ids = removedIds;
            data.paper_list = papers;
            return data;
        },
        saveThenPreview: function () {
            var self = this;
            this.doSave(function () {
                $.fn.dialog2.helpers.alert('保存成功!', {
                    "close": function () {
                        window.open("/" + projectCode + "/exam/paper/preview?exam_id=" + examId)
                        return;
                    },
                    buttonLabelOk: '预览'
                });
                self.refreshAddPaperBtn();
            })
        }

    }

    $(function () {
        viewModel.init();
    });

})(jQuery, window)