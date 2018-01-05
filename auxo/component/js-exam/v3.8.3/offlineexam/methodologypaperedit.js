(function ($, w) {
    'use strict';

    var PROJECT_CODE = w.projectCode,
        TMPL_ID = w.tmplId;

    function Model(params) {
        this.model = params.model;
        this.init();
        this.store = {
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
            getPapers: function (search) {
                var url = '/' + PROJECT_CODE + '/v1/questionbanks/papers';
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
                var url = '/' + PROJECT_CODE + '/v1/questionbanks?page=0&size=10000&type=1';
                return $.ajax({
                    url: url,
                    type: 'get',
                    dataType: "json",
                    cache: false,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            }
        }
    };

    Model.prototype = {
        init: function () {
            this.model.selectedAllPaper = ko.pureComputed({
                read: function () {
                    var found = 0;
                    $.each(this.model.papers.items(), $.proxy(function (i1, v1) {
                        $.each(this.model.selectedPapers(), function (i2, v2) {
                            if (v1.paperId == v2.paperId) {
                                ++found;
                                return false;
                            }
                        })
                    }, this));
                    return found === this.model.papers.items().length;
                },
                write: function (value) {
                    if (value)
                        this.model.selectedPapers(this.model.selectedPapers().concat(this.model.papers.items.slice(0)));
                    else
                        this.model.selectedPapers.removeAll(this.model.papers.items());
                },
                owner: this
            });
        },
        openPaperModal: function () {
            ko.mapping.fromJS([], {}, this.model.selectedPapers);
            $('#choosePaperModal').modal('show');
            this.searchPapers();
        },
        searchPapers: function () {
            var paperFilter = ko.mapping.toJS(this.model.paperFilter);
            this.store.getPapers(paperFilter).done($.proxy(function (data) {
                this.model.papers.items(data.items);
                this.model.papers.count(data.count);
                $.each(data.items, $.proxy(function (i1, v1) {
                    $.each(this.model.selectedPapers(), $.proxy(function (i2, v2) {
                        if (v1.paperId == v2.paperId) {
                            this.model.selectedPapers.splice(i2, 1, v1);
                            return false;
                        }
                    }, this))
                }, this));
                this.pagination(this.model.papers.count(), this.model.paperFilter.page(), this.model.paperFilter.size());
            }, this));
        },
        pagination: function (count, offset, limit) {
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: $.proxy(function (index) {
                    if (index != offset) {
                        this.model.paperFilter.page(index);
                        this.searchPapers();
                    }
                }, this)
            });
        },
        searchPapersAction: function () {
            this.model.paperFilter.page(0);
            this.searchPapers();
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
        }
    };

    ko.components.register('x-methodologypaperedit', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    })
})(jQuery, window);



