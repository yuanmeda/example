(function ($, window) {
    var store = {
        getMarkDetails: function () {
            var url = '/' + projectCode + '/v2/exams/' + examId + '/sessions/' + sessionId + '/mark/details';
            return commonJS._ajaxHandler(url);
        },
        getExam: function () {
            var url = '/' + projectCode + '/v1/exams/' + examId;
            return commonJS._ajaxHandler(url);
        },
        getNext: function () {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/sessions/' + sessionId + '/mark/next';
            return commonJS._ajaxHandler(url);
        },
        mark: function (data) {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/mark';
            return commonJS._ajaxHandler(url, JSON.stringify(data), "put");
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
            items: [],
            selectedIds: [],
            enabled: false,//考试是否上线
            userId: "",
            nextSessionId: "",
            style: 'table'//列表显示风格
        },
        init: function () {
            var self = viewModel;
            $.extend(self, commonJS);
            self.model = ko.mapping.fromJS(self.model);
            this.model.options = {
                'staticUrl': window.staticUrl,
                'showExtras': true,
                'showMark': true,
                'showSequence': true,
                'showUserAnswer': true
            };
            this.validate();
            ko.applyBindings(self);
            this.list();
        },
        validate: function () {
            ko.validation.rules["registEndTime"] = {
                validator: function (val) {
                    var start = that.model.info.regist_start_time(), end = that.model.info.regist_end_time();
                    if (end && start) {
                        return commonTool.getDataTime(end) - commonTool.getDataTime(start) >= 0;
                    } else {
                        return true;
                    }
                },
                message: "数据验证错误"
            };
            ko.validation.registerExtenders();
        },
        list: function () {
            store.getMarkDetails().done($.proxy(function (data) {
                if (data instanceof Array) {
                    this.model.items(data);
                    this.model.userId(data[0] && data[0].user_id);
                    var questions = [], errors = [];
                    $.each(data, function (i, v) {
                        var subs = [], qObj = {};
                        $.each(v.subs, function (subi, subv) {
                            var observable = ko.observable(subv.user_score === null ? "" : subv.user_score).extend({
                                digit: {params: true, message: "分数格式有误，请重新输入"},
                                min: {params: 0, message: "分数格式有误，请重新输入"},
                                max: {params: subv.score || 0, message: "分数不能超过总分(" + subv.score + ")"}
                            });
                            subv.user_score = markEdit && (subv.question_type == 216 || subv.question_type == 25 || subv.question_type == 20 || subv.question_type === null) ? observable : subv.user_score;
                            errors.push(observable);
                            subs.push(subv);
                        });
                        qObj.questionItem = v.item;
                        qObj.identifier = v.item.identifier;
                        qObj.userAnswer = v.qti_answer;
                        qObj.mark = {
                            marking_remark: v.marking_remark,
                            marking_user_id: v.marking_user_id,
                            question_answer_status: v.question_answer_status,
                            question_id: v.question_id,
                            question_type: v.question_type,
                            question_version: v.question_version,
                            score: v.score,
                            session_id: v.session_id,
                            subs: subs
                        };
                        questions.push(qObj);
                    });
                    this.model.questions.items(questions);
                    this.model.validatedInfo = ko.validatedObservable(errors);
                }
                this.getExam();
                this.getNext();
                if (window.top)
                    setTimeout(function () {
                        $(document.body).height($(document.body).height() + 100);
                    }, 1000);
            }, this));
        },
        getExam: function () {
            var self = this;
            store.getExam().done(function (data) {
                self.model.exam.title(data.title);
            });
        },
        getNext: function () {
            var self = this;
            store.getNext().done(function (data) {
                if (data) self.model.nextSessionId(data.session_id);
            });
        },
        hasDone: function (userAnswer, subUserAnswer, subQuestionType) {
            if (userAnswer) return true;
            if (subQuestionType == 20) {
                if (!subUserAnswer) return false;
                try {
                    var jsonData = JSON.parse(subUserAnswer);
                    for (var i = 0; i < jsonData.length; i++) {
                        if (jsonData[i].value && jsonData[i].value.length > 0 && jsonData[i].value[0]) {
                            return true;
                        }
                    }
                    return false;
                } catch (e) {
                    return true;
                }
            } else {
                return subUserAnswer;
            }
        },
        getData: function () {
            var self = this, temp = [], questions = this.model.questions.items();
            $.each(questions, function (indx, value) {
                var elem = value.mark;
                var it = {
                    session_id: sessionId,
                    question_id: elem.question_id,
                    question_version: elem.question_version
                };
                it.marking_remark = null;
                it.marking_user_id = userId;
                var totalScore = 0;
                var totalUserScore = 0;
                var allUnmarked = true;
                it.subs = [];
                $.each(elem.subs, function (i, e) {
                    var userScore = ko.toJS(e.user_score);
                    userScore = userScore === "" ? null : +userScore;
                    var qas = e.question_answer_status;
                    if (e.question_type == 216 || e.question_type == 20 || e.question_type == 25 || e.question_type === null) {
                        if (isNaN(userScore)) {
                            userScore = null;
                            if (self.hasDone(elem.user_answer, e.user_answer, e.question_type)) {
                                qas = 1;
                            } else {
                                qas = (userScore < e.score) ? 7 : 5;
                            }
                            if (qas != 1) {
                                allUnmarked = false;
                            }
                        } else {
                            qas = (userScore < e.score) ? 7 : 5;
                            allUnmarked = false;
                        }
                    } else {
                        allUnmarked = false;
                    }
                    it.subs.push({score: userScore, question_answer_status: qas});
                    totalScore += e.score;
                    if (userScore) totalUserScore += userScore;
                });
                it.score = totalUserScore;
                if (allUnmarked) {
                    it.question_answer_status = 1;
                } else {
                    it.question_answer_status = (totalUserScore < totalScore) ? 7 : 5;
                }
                temp.push(it);
            });
            return temp;
        },
        doSave: function (callback) {
            var errors = ko.validation.group(this);
            if (errors().length) {
                $.fn.dialog2.helpers.alert(errors()[0]);
                return;
            }
            // if (!this.model.validatedInfo.isValid()) {
            //     this.model.validatedInfo.errors.showAllMessages();
            //     return;
            // }
            var self = this, items = this.getData();
            if (items && items.length) {
                store.mark(items).done(function () {
                    $.fn.dialog2.helpers.alert("保存成功");
                    callback();
                });
            } else {
                callback();
            }
        },
        cancel: function () {
            location.href = '/' + projectCode + "/exam/mark/exam?exam_id=" + examId;
        },
        toNext: function () {
            location.href = '/' + projectCode + "/exam/mark/paper?exam_id=" + examId + "&session_id=" + this.model.nextSessionId();
        },
        save: function () {
            this.doSave($.proxy(this.cancel, this));
        },
        saveThenNext: function () {
            this.doSave($.proxy(this.toNext, this));
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);