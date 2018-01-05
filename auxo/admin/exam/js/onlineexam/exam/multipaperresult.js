(function ($) {
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
        getAnswerDetails: function (sessionId) {
            var url = '/' + projectCode + '/v1/m/exams/' + examId + '/sessions/' + sessionId + '/answers/details';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                reponseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        getExam: function () {
            var url = '/' + projectCode + '/v1/exams/' + examId;
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                reponseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        //获取用户历史考试列表
        getUserExamHistory: function () {
            var url = '/' + projectCode + '/v1/m/exams/' + examId + '/users/' + userId + '/history';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                reponseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        //获取NDR试卷答案
        getNDRQuestionAndAnswers: function (sessionId) {
            var url = '/' + projectCode + '/v2/m/exams/' + examId + '/sessions/' + sessionId + '/answers/details';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            exam: {
                title: ""
            },
            items: [],
            //for ndr
            questions: {
                items: [],
                total: 0
            },
            //for ndr end
            selectedIds: [],
            enabled: false,//考试是否上线
            userId: "",
            nextSessionId: "",
            style: 'table',//列表显示风格

            userExamHistoryList: [],
            sessionList: [],
            isNDRPaper: false
        },
        init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.options = {
                'staticUrl': window.staticUrl,
                'showExtras': true,
                'showMark': false,
                'showSequence': true,
                'showUserAnswer': true
            };
            ko.applyBindings(this);
            var tempSessionList = [];
            store.getUserExamHistory()
                .done(function (examHistories) {
                    var total = examHistories.length;
                    if (total > 0) {
                        $.each(examHistories, function (index, history) {
                            tempSessionList.push({
                                place: total - index,
                                sessionId: history.sessionId,
                                active: index == 0 ? true : false,
                                paperLocation: history.userData.paperLocation ? history.userData.paperLocation : 1
                            });
                        });
                        self.model.sessionList(tempSessionList);
                        self.model.userExamHistoryList(examHistories);
                        if (examHistories[0].userData.paperLocation && examHistories[0].userData.paperLocation == 4) {
                            store.getNDRQuestionAndAnswers(examHistories[0].sessionId)
                                .done(function (data) {
                                    self.model.isNDRPaper(true);
                                    if (data && data.length > 0) {
                                        var items = [];
                                        $.each(data, function (index, question) {
                                            items.push({
                                                identifier: question.item.identifier,
                                                questionItem: question.item,
                                                userAnswer: question.qti_answer
                                            });
                                        });
                                        self.model.questions.items([]);
                                        self.model.questions.items(items);
                                        self.model.questions.total(data.length);
                                    } else {
                                        self.model.questions.items([]);
                                        self.model.questions.total(0);
                                    }
                                });
                        } else {
                            self.model.isNDRPaper(false);
                            self.getUserAnswers(examHistories[0].sessionId);
                        }
                    } else {
                        self.model.sessionList([]);
                        self.model.userExamHistoryList([]);
                    }

                });
        },
        newExamResultAction: function (sessionId, paperLocation, parent, element) {
            if ($(parent).hasClass('active'))
                return;
            $('li').removeClass('active');
            $(element).closest('li').addClass('active');
            if (paperLocation == 4) {
                this.model.questions.items([]);
                this.model.questions.total(0);
                this.model.isNDRPaper(true);
                store.getNDRQuestionAndAnswers(sessionId)
                    .done($.proxy(function (data) {
                        if (data && data.length > 0) {
                            var items = [];
                            $.each(data, function (index, question) {
                                items.push({
                                    identifier: question.item.identifier,
                                    questionItem: question.item,
                                    userAnswer: question.qti_answer
                                });
                            });
                            this.model.questions.items([]);
                            this.model.questions.items(items);
                            this.model.questions.total(data.length);
                        } else {
                            this.model.questions.items([]);
                            this.model.questions.total(0);
                        }
                    }, this));
            } else {
                this.model.isNDRPaper(false);
                this.getUserAnswers(sessionId);
            }
        },
        getUserAnswers: function (sessionId) {
            var self = this;
            store.getAnswerDetails(sessionId)
                .done(function (data) {
                    if (data instanceof Array) {
                        self.items = data || [];
                        self.model.items(self.items);
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].userId) {
                                self.model.userId(data[i].userId);
                                break;
                            }
                        }
                    }
                    self.getExam();
                });
        },
        getExam: function () {
            var self = this;
            store.getExam()
                .done(function (data) {
                    self.model.exam.title(data.title);
                });
        },

        formatQuestionType: function (data) {
            var s = "";
            switch (data) {
                case 10:
                    s += "单选题";
                    break;
                case 15:
                    s += "多选题";
                    break;
                case 18:
                    s += "不定项选择题";
                    break;
                case 20:
                    s += "填空题";
                    break;
                case 25:
                    s += "主观题";
                    break;
                case 30:
                    s += "判断题";
                    break;
                case 40:
                    s += "连线题";
                    break;
                case 50:
                    s += "套题";
                    break;
                default:
                    break;
            }
            return s;
        },
        formatAnswer: function (s) {
            if (!s) return '';
            var preWrapper = "<pre style='background-color: #FFF; border-width: 0'>";
            var postWrapper = "</pre>";
            try {
                var obj = JSON.parse(s);
                var resultArr = [];
                for (var i = 0; i < obj.length; i++) {
                    var idx = "";
                    for (var j = 0; j < obj[i].index.length; j++) {
                        idx += "【" + obj[i].index[j] + "】";
                    }
                    resultArr.push(idx + preWrapper + obj[i].value.join("，") + postWrapper);
                }
                return resultArr.join("<br/>");
            } catch (e) {
                return preWrapper + s + postWrapper;
            }
        },
        bindQuestion: function (control, question, index) {
            var questionHtml = $(control).question({
                showOther: false,
                showProperty: false,
                num: index,
                question: question,
                edit: $.proxy(viewModel.editQuestion, this),
                refresh: $.proxy(viewModel.refreshSingle, this),
                source: $.proxy(viewModel.source, this),
                formatQuestionType: $.proxy(viewModel.formatQuestionType, this),
                formatAnswer: $.proxy(viewModel.formatAnswer, this)
            });

            return questionHtml;
        },
        formatImageAnswer: function (s, index) {
            if (!s) {
                return "";
            }
            var obj = JSON.parse(s);
            var result = "";

            if (obj.data.length > 0) {
                for (var i = 0; i < obj.data.length; i++) {
                    if (obj.data[i].q == index) {
                        if (obj.data[i].sub_data && obj.data[i].sub_data.length > 0) {
                            $.each(obj.data[i].sub_data, function (index, item) {
                                result += "<a href='" + item.url +'&attachment=true' + "'style='color:#0302DF' target='_blank'>";
                                result += "点击下载附件";
                                result += "</a>";
                            });
                        }
                    }
                }
            }

            // if (obj.type == "cs_sub_image" && obj.data.length > 0) {
            //     for (var i = 0; i < obj.data.length; i++) {
            //         if (obj.data[i].q == index) {
            //             if (obj.data[i].sub_data && obj.data[i].sub_data.length > 0) {
            //                 $.each(obj.data[i].sub_data, function (index, item) {
            //                     result += "<a href='" + item.url + "' target='_blank'>";
            //                     result += "<img src='" + item.url + "&size=120" + "'/>";
            //                     result += "</a>";
            //                 });
            //             }
            //         }
            //     }
            // }
            if (result)
                result = "<div class='box' style='border-top: 1px solid #ddd;'><div style='font-weight: bold'>考生上传附件：</div>" + result + "</div>"
            return result;
        },
        //格式化简答题
        formatAnswer25: function (s) {
            if (!s) return '';
            var preWrapper = "<pre style='background-color: #FFF; border-width: 0'>";
            var postWrapper = "</pre>";
            return preWrapper + s + postWrapper;
        }
    };

    $(function () {
        viewModel.init();
    })
})(jQuery);
