/**
 * Created by Administrator on 2016/4/26.
 */
(function ($, w) {
    var PROJECT_CODE = w.projectCode,
        TMPL_ID = w.tmplId,
        STRATEGY_REQ_URL = '/' + PROJECT_CODE + '/exam_center/exams/templates/' + TMPL_ID + '/strategy',
        BANK_REQ_URL = '/' + PROJECT_CODE + '/v1/questionbanks?page=0&size=10000&type=1';

    var store = {
        getExamTemplateStrategy: function () {
            return $.ajax({
                url: STRATEGY_REQ_URL,
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
            return $.ajax({
                url: STRATEGY_REQ_URL,
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
            return $.ajax({
                url: BANK_REQ_URL,
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
                randomStrategy: '0',
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
        return_url: return_url || '',
        source: source || '',
        init: function () {
            this.model = ko.mapping.fromJS(this.model);

            $.when(store.getExamTemplateStrategy(), store.getQuestionBanks()).done($.proxy(function (sResponse, qResponse) {
                var sData = sResponse[0],
                    qData = qResponse[0];

                if (sData) {
                    this.originalPapers = sData.paperList.slice();
                    this.model.exam.enabled(sData.enabled);
                    sData.randomStrategy && this.model.exam.randomStrategy(sData.randomStrategy + '');
                    sData.paperList && sData.paperList.length > 0 && this.model.exam.paperList(sData.paperList);
                }

                this.model.questionbanks(qData.items);

                ko.applyBindings(this);
            }, this));

            $('.closeModal').click(function () {
                $("#uploadmodal").modal('hide');
            });
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
            exam.randomStrategy = +exam.randomStrategy;

            var questionCount = Enumerable.from(paperList).sum('$.questionCount');
            if (questionCount <= 0) {
                $.fn.dialog2.helpers.alert("试卷必须要有题目！");
                return;
            }

            store.updateExamTemplateStrategy(exam).done($.proxy(function (paperList) {
                this.originalPapers = paperList;
                callback && callback();
            }, this, paperList));

        },
        saveThenNext: function () {
            var url = '/' + projectCode + "/exam_center/offline_exam/subject?tmpl_id=" + tmplId;
            if (this.return_url) {
                url = url + '&return_url=' + encodeURIComponent(this.return_url) ;
            }
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
            if (this.return_url) {
                location.href = this.return_url;
            } else {
                location.href = '/' + projectCode + "/exam_center/index";
            }

        },
        next: function () {
            var url = '/' + projectCode + "/exam_center/offline_exam/subject?tmpl_id=" + tmplId;
            if (this.return_url) {
                url = url + '&return_url=' + encodeURIComponent(this.return_url) ;
            }
            if (this.source) {
                url = url + '&source=' + this.source;
            }
            location.href = url;
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);