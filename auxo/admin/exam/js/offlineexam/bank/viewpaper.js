(function ($) {
    var PROJECT_CODE = projectCode,
        PAPER_ID = paperId;

    var errorHandler = function (jqXHR) {
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
    };

    var store = {
        getPaperInfo: function () {
            var url = type == 'questionbank:paperid' ? '/' + PROJECT_CODE + '/v1/questionbanks/papers/' + PAPER_ID : '/' + PROJECT_CODE + '/v1/papers/' + PAPER_ID + '?location=2';
            return $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                dataType: 'json',
                contentType: 'application/json;charset=utf8',
                error: errorHandler
            });
        }
    };

    var viewModel = {
        model: {
            paper: {
                title: '',
                paperId: paperId,
                partCount: 0
            },
            complexQuestion: {
                id: "",
                partId: '',
                complexBody: '',
                complexExplanation: '',
                questionType: 50,
                subItems: [],
                bodyAttachments: []
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.getPaperInfo();
        },
        getPaperInfo: function () {
            store.getPaperInfo().done($.proxy(function (data) {
                this.model.paper.title(data.title);
                this.model.paper.partCount(data.partCount);

                if (data.partCount > 0) {
                    var part = data.parts[0];
                    if (part.questions.length > 0) {
                        var complexQuestion = data.parts[0]['questions'][0];
                        this.model.complexQuestion.id(complexQuestion.id);
                        this.model.complexQuestion.partId(part.id);
                        this.model.complexQuestion.complexBody(complexQuestion.complexBody);
                        this.model.complexQuestion.complexExplanation(complexQuestion.complexExplanation);
                        this.model.complexQuestion.questionType(complexQuestion.questionType);
                        this.model.complexQuestion.bodyAttachments(complexQuestion.bodyAttachments);

                        for (var j = 0; j < complexQuestion.items.length; j++)
                            this.model.complexQuestion.subItems.push(ko.mapping.fromJS(complexQuestion.items[j]));
                    }
                }
            }, this));
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery);