(function ($) {
    var store = {
        getPaper: function () {
            return $.ajax({
                type: "GET",
                url: '/' + projectCode + '/v2/papers/' + paperId,
                cache: false
            });
        },
        getCustomerPaper: function () {
            return $.ajax({
                type: "GET",
                url: '/' + projectCode + '/v2/question_banks/' + paperId + '/questions',
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            questions: {
                items: [],
                total: 0
            },
            text: '加载中'
        },
        init: function () {
            var self = viewModel;
            this.model = ko.mapping.fromJS(this.model);
            this.model.options = {
                'staticUrl': window.staticUrl,
                'showExtras': true,
                'showMark': false,
                'showSequence': true,
                'showUserAnswer': false
            };
            ko.applyBindings(this);
            this.getPaperDetail();
        },
        getPaperDetail: function () {
            var self = this;
            var items = [];
            if (paperId) {
                if (style == 2) {
                    store.getPaper()
                        .done($.proxy(function (data) {
                            if (data && data.questions && data.questions.length > 0) {
                                $.each(data.questions, function (index, question) {
                                    items.push({identifier: question.item.identifier, questionItem: question.item});
                                });
                                this.model.text('');
                                this.model.questions.items(items);
                                this.model.questions.total(items.length);
                            } else {
                                this.model.text('此试卷下没有题目');
                            }
                        }, this))
                } else if (style == 3) {
                    store.getCustomerPaper()
                        .done($.proxy(function (data) {
                            if (data && data.length > 0) {
                                $.each(data, function (index, question) {
                                    items.push({identifier: question.item.identifier, questionItem: question.item});
                                });
                                this.model.text('');
                                this.model.questions.items(items);
                                this.model.questions.total(items.length);
                            } else {
                                this.model.text('此试卷下无题目');
                            }
                        }, this))
                } else {
                    this.model.text('试卷类型错误');
                }

            }
        }
    };

    $(function () {
        viewModel.init();
    })
})(jQuery);
