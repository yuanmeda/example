(function (w, $) {
    function Model(params) {
        this.params = params;
        this.model = params.model;
        this.projectCode = params.projectCode;
        this.tmplId = params.tmplId;

        this.getPapersUrl = params.getPapersUrl;
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
            getPapers: function (search, getPapersUrl, projectCode) {
                var url = getPapersUrl ? getPapersUrl : '/' + projectCode + '/v1/questionbanks/papers';
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
            }
        };
        this.init();
    };
    Model.prototype = {
        init: function () {
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
            $('.closeModal').click(function () {
                $("#uploadmodal").modal('hide');
            });
        },
        openPaperModal: function () {
            ko.mapping.fromJS([], {}, this.model.selectedPapers);
            $('#choosePaperModal').modal('show');
            this.searchPapers();
        },

        searchPapers: function () {
            var _self = this, _paperFilter = ko.mapping.toJS(this.model.paperFilter);
            this.store.getPapers(_paperFilter, this.getPapersUrl, this.projectCode).done(function (data) {
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
            });
            this.model.exam.paperList(originalPaperList);
            $('#choosePaperModal').modal('hide');
        },
    };
    ko.components.register('x-exercisepaperedit', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    })
})(window, jQuery);