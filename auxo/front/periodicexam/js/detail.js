(function ($, window) {
    var store = {
        query: {
            answer: function (sessionId) {
                return $.ajax({
                    url: window.answer_api_url + "/v1/user_paper_answers/sessions/" + sessionId,
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8"
                });
            },
            marks: function (sessionId) {
                return $.ajax({
                    url: window.mark_api_url + "/v1/user_question_marks/search?$filter=session_id eq " + sessionId,
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8"
                });
            },
            paper: function (paperId) {
                return $.ajax({
                    url: window.resource_gateway_url + "/v2/paper/actions/list",
                    type: "POST",
                    data: JSON.stringify([paperId]),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8"
                });
            },
            questions: function (qids) {
                return $.ajax({
                    url: window.resource_gateway_url + "/v2/question/actions/list",
                    type: "POST",
                    data: JSON.stringify(qids),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8"
                });
            },
            analysis: function (qids) {
                return $.ajax({
                    url: window.resource_gateway_url + "/v2/question/actions/list",
                    type: "POST",
                    data: JSON.stringify(qids),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8"
                });
            },
            userAnswers: function (answerId, sessionId) {
                return $.ajax({
                    url: window.answer_api_url + "/v1/user_question_answers/search?$filter=" + encodeURIComponent("user_paper_answer_id eq " + answerId + " and session_id eq " + sessionId),
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8"
                });
            }
        }
    };
    var viewModel = {
        model: {
            exam: {
                title: ""
            },
            questions: {
                items: [],
                total: 0
            },
            userId: "",
            style: 'table', // 列表显示风格

            answer: {
                paperId: "",
                answerId: ""
            },
            userAnswers: null,
            analysis: null,
            rawQuestions: null,
            marks: null
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);

            this.model.options = {
                'staticUrl': window.staticUrl,
                'showExtras': true,
                'showMark': true,
                'showSequence': true,
                'showUserAnswer': true
            };
            ko.applyBindings(this);


            store.query.answer(window.sessionId).done($.proxy(function (data) {
                this.model.answer.paperId(data.paper_id);
                this.model.answer.answerId(data.id);
                this.model.userId(data.user_id);

                store.query.paper(data.paper_id).done($.proxy(function (paper) {
                    var parts = Enumerable.from(paper[0].parts).toArray(),
                        questionIds = [];

                    Enumerable.from(parts).forEach(function (value, index) {
                        var questionIdArray = [];
                        Enumerable.from(value.paper_questions).forEach(function (s, i) {
                            questionIdArray.push(s.id);
                        });

                        questionIds = questionIds.concat(questionIdArray);
                    });

                    $.when(store.query.analysis(questionIds), store.query.userAnswers(this.model.answer.answerId(), window.sessionId), store.query.marks(window.sessionId)).done($.proxy(function (analysis, answers, marks) {
                        this.model.analysis(analysis[0]);
                        this.model.rawQuestions(analysis[0]);
                        this.model.userAnswers(answers[0]);
                        this.model.marks(marks[0]);

                        var items = Enumerable.from(analysis[0]).select($.proxy(this.getItem, this)).toArray();
                        this.model.questions.items(items);
                    }, this));
                }, this));
            }, this));
        },
        getItem: function (analysis) {
            var question = {};

            question.questionItem = analysis.content;
            question.identifier = analysis.id;
            question.userAnswer = this.getQuestionAnswerById(analysis.id, analysis.type);
            question.mark = this.getQuestionMarkById(analysis.id, analysis.type);

            return question;
        },
        getQuestionMarkById: function (id, type) {
            var result = {
                "marking_remark": "",
                "marking_user_id": "",
                "question_answer_status": "",
                "question_id": id,
                "question_type": type,
                "question_version": 0,
                "score": "",
                "session_id": window.sessionId,
                "subs": []
            };

            var marks = Enumerable.from(this.model.marks().items).where('$.question_id=="' + id + '"').toArray();
            if (marks && marks.length > 0) {
                result.marking_remark = marks[0].remark;
                result.marking_user_id = marks[0].create_user;
                result.question_answer_status = marks[0].status;
                result.score = marks[0].score;
                $.each(marks[0].subs, function (index, item) {
                    result.subs.push({
                        "score": item.score,
                        "user_score": item.score,
                        "question_answer_status": item.status,
                        "question_type": 15
                    });
                });
            }

            return result;
        },
        getQuestionType: function () {

        },
        getQuestionAnswerById: function (id, type) {
            var answers = Enumerable.from(this.model.userAnswers().items).where('$.question_id=="' + id + '"').toArray();
            if (answers && answers.length > 0) {
                if (this.isComplexQuestion(type)) {
                    var tempAnswerStr = "{";
                    Enumerable.from(answers[0].subs).forEach((item, index) => {
                        if (index > 0) {
                            tempAnswerStr += "," + item.answer.substring(1, item.answer.length - 1)
                        } else {
                            tempAnswerStr += item.answer.substring(1, item.answer.length - 1);
                        }
                    });
                    tempAnswerStr += "}";

                    return JSON.parse(tempAnswerStr);
                } else {
                    return JSON.parse(answers[0].subs[0].answer);
                }
            } else {
                return null;
            }
        },
        isComplexQuestion: function (type) {
            switch (type) {
                case 50:
                case 208:
                    return true;
                default:
                    return false;
            }
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);
