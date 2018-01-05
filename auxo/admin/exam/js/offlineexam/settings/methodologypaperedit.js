(function ($, window) {
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

        getExamTemplateStrategy: function () {
            var url = '/' + projectCode + '/v1/exams/templates/' + tmplId + '/strategy';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        updateExamTemplateStrategy: function (data) {
            var url = '/' + projectCode + '/v1/exams/templates/' + tmplId + '/strategy';
            return $.ajax({
                url: url,
                type: 'put',
                data: JSON.stringify(data),
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        getPapers: function (search) {
            var url = '/' + projectCode + '/v1/questionbanks/papers';
            return $.ajax({
                url: url,
                type: 'get',
                data: search,
                dataType: "json",
                requestCase: "snake",
                reponseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
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
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
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
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            var _self = this;
            this.model.selectedAllPaper = ko.pureComputed({
                read: function () {
                    var _found = 0;
                    $.each(_self.model.papers.items(), function (i1, v1) {
                        $.each(_self.model.selectedPapers(), function (i2, v2) {
                            if (v1.paperId == v2.paperId) {
                                ++_found;
                                return false;
                            }
                        })
                    });
                    return _found === _self.model.papers.items().length;
                },
                write: function (value) {
                    if (value) {
                        _self.model.selectedPapers(_self.model.selectedPapers().concat(_self.model.papers.items.slice(0)));
                    } else {
                        _self.model.selectedPapers.removeAll(_self.model.papers.items());
                    }
                }
            });
            ko.applyBindings(this);
            store.getExamTemplateStrategy()
                .done(function (data) {
                    if (data) {
                        this.originalPapers = data.paperList.slice();
                        this.model.exam.enabled(data.enabled);
                        data.randomStrategy && this.model.exam.randomStrategy(data.randomStrategy + '');
                        data.paperList && data.paperList.length > 0 && this.model.exam.paperList(data.paperList);
                    }
                }.bind(this));

            $('.closeModal').click(function () {
                $("#uploadmodal").modal('hide');
            });
            store.getQuestionBanks().done(function (data) {
                this.model.questionbanks(data.items);
            }.bind(this));
        },
        openPaperModal: function () {
            ko.mapping.fromJS([], {}, this.model.selectedPapers);
            $('#choosePaperModal').modal('show');
            this.searchPapers();
        },

        searchPapers: function () {
            var _self = this, _paperFilter = ko.mapping.toJS(this.model.paperFilter);
            store.getPapers(_paperFilter).done(function (data) {
                _self.model.papers.items(data.items);
                _self.model.papers.count(data.count);
                $.each(data.items, function (i1, v1) {
                    $.each(_self.model.selectedPapers(), function (i2, v2) {
                        if (v1.paperId == v2.paperId) {
                            _self.model.selectedPapers.splice(i2, 1, v1);
                            return false;
                        }
                    })
                });
                _self._pagination(_self.model.papers.count(), _self.model.paperFilter.page(), _self.model.paperFilter.size());
            });
        },
        _pagination: function (count, offset, limit) {
            var self = this;
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != offset) {
                        self.model.paperFilter.page(index);
                        self.searchPapers();
                    }
                }
            });
        },
        searchPapersAction: function () {
            var self = this;
            self.model.paperFilter.page(0);
            self.searchPapers();
        },
        savePapers: function () {
            var selectedPapers = this.model.selectedPapers();
            var originalPaperList = ko.mapping.toJS(this.model.exam.paperList);
            $.each(selectedPapers, function (index, newPaper) {
                var flag = true;
                $.each(originalPaperList, function (index2, originalPaper) {
                    if (newPaper.paperId == originalPaper.id) {
                        flag = false;
                    }
                });
                if (flag) {
                    originalPaperList.push({
                        appId: newPaper.appId,
                        id: newPaper.paperId,
                        version: 0,
                        title: newPaper.title,
                        totalScore: newPaper.totalScore,
                        questionCount: newPaper.questionCount,
                        subQuestionCount: newPaper.subQuestionCount,
                        disabled: false,
                        location: newPaper.location,
                        questions: newPaper.questions
                    })
                }
            }.bind(this));
            this.model.exam.paperList(originalPaperList);
            $('#choosePaperModal').modal('hide');
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

            store.updateExamTemplateStrategy(exam).done(function (paperList) {
                this.originalPapers = paperList;
                callback && callback();
            }.bind(this, paperList))
        },
        saveThenNext: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam/offline_exam/subject?tmpl_id=" + tmplId;
            });
        },
        saveThenReturn: function () {
            this.doSave(function () {
                location.href = '/' + projectCode + "/exam/offline_exam";
            });
        },
        save: function () {
            this.doSave(function () {
                $.fn.dialog2.helpers.alert("保存成功");
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);