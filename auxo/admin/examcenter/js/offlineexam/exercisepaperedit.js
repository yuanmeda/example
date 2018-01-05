/**
 * Created by Administrator on 2016/4/26.
 */
(function ($, window) {
    var store = {
        getExamTemplateStrategy: function () {
            var url = '/' + projectCode + '/exam_center/exams/templates/' + tmplId + '/strategy';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8'
            });
        },
        updateExamTemplateStrategy: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/templates/' + tmplId + '/strategy';
            return $.ajax({
                url: url,
                type: 'put',
                data: JSON.stringify(data),
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8'
            });
        },

        getQuestionBanks: function () {
            var url = '/' + projectCode + '/v1/questionbanks?page=0&size=1000&type=1';
            return $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8'
            });
        }
    };
    var viewModel = {
        originalPapers: [],
        model: {
            questionbanks: null,
            exam: {
                enabled: false,
                randomStrategy: 0,
                paperList: [],
                examStrategy: 1
            },
            selectedPapers: [],
            papers: {
                items: [],
                count: 0
            },
            paperFilter: {
                title: '',
                question_bank_id: '',
                page: 0,
                size: 10,
                type: 1
            }
        },
        return_url:return_url||'',
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            var _self = this;
            ko.applyBindings(this);
            store.getExamTemplateStrategy()
                .done(function (data) {
                    if (data) {
                        this.originalPapers = data.paperList.slice();
                        this.model.exam.enabled(data.enabled);
                        this.model.exam.paperList(data.paperList);
                    }
                }.bind(this));
            store.getQuestionBanks().done(function (data) {
                this.model.questionbanks(data.items);
            }.bind(this));
        },

        doSave: function (callback) {
            var exam = ko.mapping.toJS(this.model.exam);
            if (exam.paperList.length < 1) {
                $.fn.dialog2.helpers.alert("试卷范围不可为空");
                return;
            }
            var originalPapers = this.originalPapers;

            var tempArray = [];
            $.each(exam.paperList, function (index, item) {
                tempArray.push({
                    paperId: item.id,
                    version: item.version,
                    disabled: item.disabled,
                    location: item.location

                });
            });

            var removedPaperIds = [];
            $.each(originalPapers, function (index, item) {
                var flag = true;
                $.each(exam.paperList, function (index, paper) {
                    if (paper.id == item.id) {
                        flag = false;
                    }
                });
                if (flag) {
                    removedPaperIds.push(item.id);
                }
            });
            var paperList = exam.paperList.slice();
            exam.paperList = tempArray;
            exam.removedPaperIds = removedPaperIds;

            var questionCount = Enumerable.from(paperList).sum('$.questionCount');
            if (questionCount <= 0) {
                $.fn.dialog2.helpers.alert("试卷必须要有题目！");
                return;
            }

            store.updateExamTemplateStrategy(exam).done(function (paperList) {
                this.originalPapers = paperList;
                callback && callback();
            }.bind(this, paperList))

        },
        saveThenReturn: function () {
            var url = this.return_url? this.return_url:'/' + projectCode + "/exam_center";
            this.doSave(function () {
                location.href = url;
            });
        },
        save: function () {
            this.doSave(function () {
                $.fn.dialog2.helpers.alert("保存成功");
            });
        },
        cancel: function () {
            var return_url = this.return_url || '';
            if (return_url) {
                window.location.href = return_url;
            } else {
                window.location.href = '/' + projectCode + '/exam_center';
            }
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);