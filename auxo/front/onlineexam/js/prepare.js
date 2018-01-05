(function ($) {
    var store = {
        fav: {
            addFavorites: function (data) {
                var url = window.assist_url + '/v1/favorites';
                return $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: "application/json",
                    dataType: 'text',
                    data: JSON.stringify(data),
                    cache: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', TokenUtils.getMacToken('POST', "/v1/favorites", window.assist_url.split('//')[1]));
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                });
            },
            deleteFavorites: function (data) {
                var url = window.assist_url + '/v1/favorites/' + data.source_type + "/" + data.source_id;
                return $.ajax({
                    url: url,
                    type: 'DELETE',
                    contentType: "application/json",
                    dataType: 'text',
                    cache: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', TokenUtils.getMacToken('DELETE', "/v1/favorites/" + data.source_type + "/" + data.source_id, window.assist_url.split('//')[1]));
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                });
            },
            checkFavorites: function (data) {
                var url = window.assist_url + '/v1/sources';
                return $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'JSON',
                    contentType: "application/json",
                    data: JSON.stringify(data) || null,
                    cache: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', TokenUtils.getMacToken('POST', "/v1/sources", window.assist_url.split('//')[1]));
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                });
            }
        },
        exam: {
            info: function () {
                var url = window.periodic_exam_gateway_url + "/v1/periodic_exam_details/" + window.periodic_exam_id + "?_=" + new Date().getTime();
                return $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'JSON',
                    contentType: "application/json",
                    requestCase: "snake",
                    responseCase: "camel",
                    enableToggleCase: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', TokenUtils.getMacToken('GET', url, window.periodic_exam_gateway_url.split('//')[1]));
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                });
            },
            session: function (examId, data) {
                var url = window.periodic_exam_gateway_url + "/v1/user_exam_sessions?exam_id=" + examId;
                return $.ajax({
                    url: url,
                    type: 'POST',
                    data: JSON.stringify(data),
                    dataType: 'JSON',
                    contentType: "application/json",
                    requestCase: "snake",
                    responseCase: "camel",
                    enableToggleCase: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', TokenUtils.getMacToken('GET', url, window.periodic_exam_gateway_url.split('//')[1]));
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                });
            },
            submit: function (answerId) {
                var url = window.answer_api_url + "/v1/user_paper_answers/" + answerId + "/actions/submit";
                return $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'JSON',
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', TokenUtils.getMacToken('GET', url, window.answer_api_url.split('//')[1]));
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                });
            }
        },
        businessExam: {
            info: function () {
                var url = window.self_host + "/v1/online_exam_details/" + window.online_exam_id + "?_=" + new Date().getTime();
                return $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'JSON',
                    contentType: "application/json",
                    requestCase: "snake",
                    responseCase: "camel",
                    enableToggleCase: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                });
            },
        },
        enroll: {
            info: function () {
                var url = window.enroll_gateway_url + "/v1/user/enroll_entrance_info?unit_id=" + window.online_exam_id + "&_=" + new Date().getTime();
                return $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'JSON',
                    contentType: "application/json",
                    requestCase: "snake",
                    responseCase: "camel",
                    enableToggleCase: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', TokenUtils.getMacToken('GET', url, window.enroll_gateway_url.split('//')[1]));
                        xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                    }
                });
            }
        }
    }

    var viewModel = {
        model: {
            enroll: null,
            businessExam: null,
            answer: null,
            periodicExamDetail: null,
            nextSessionStartTime: "",
            examInfo: {
                id: "",
                answerTime: "",
                chance: "",
                remainingTryTimes: "",
                totalScore: "",
                description: "",
                passScore: "",
                startTime: "",
                endTime: "",
                title: "",
                duration: "",
                analysisStrategy: {
                    strategy: "",
                    startTime: "",
                    endTime: ""
                },
                enroll: {
                    enrollType: "",
                    userEnrollStatus: null,
                    comment: ""
                }
            },
            currentSessionInfo: {
                startTime: "",
                status: ""
            },
            periodConfig: {}
        },
        init: function () {
            this.answer = new window.Answer({});

            $.when(store.businessExam.info(), store.exam.info()).done($.proxy(function (businessExam, exam) {
                this.model.businessExam = businessExam[0];
                this.model.periodicExamDetail = exam[0];

                if (this.model.businessExam.needEnroll) {
                    store.enroll.info().done($.proxy(function (enroll) {
                        this.model.enroll = enroll;
                        this.exec();
                    }, this))
                }
                else {
                    this.exec();
                }
            }, this));
        },
        exec: function () {
            this.initExamInfo();

            var prepareConfig = this.getPrepareConfig();
            this.play(prepareConfig);
        },
        initExamInfo: function () {
            if (this.model.periodicExamDetail.periodicExam.nextSessionStartTime || (this.model.periodicExamDetail.nextPeriodicExamSession && this.model.periodicExamDetail.nextPeriodicExamSession.startTime)) {
                this.model.nextSessionStartTime = this.getTimestamp(this.model.periodicExamDetail.periodicExam.nextSessionStartTime ? this.model.periodicExamDetail.periodicExam.nextSessionStartTime : this.model.periodicExamDetail.nextPeriodicExamSession.startTime);
            }
            else {
                this.model.nextSessionStartTime = null;
            }
            this.model.periodConfig = this.model.periodicExamDetail.periodicExam.periodConfig;

            this.model.examInfo.analysisStrategy = {
                "strategy": this.model.periodicExamDetail.periodicExam.analysisStrategy.strategy,
                "startTime": this.getTimestamp(this.model.periodicExamDetail.periodicExam.analysisStrategy.startTime),
                "endTime": this.getTimestamp(this.model.periodicExamDetail.periodicExam.analysisStrategy.endTime)
            };

            this.model.examInfo.enroll = {
                "enrollType": this.model.periodicExamDetail.enroll ? this.model.periodicExamDetail.enroll.enrollFormType : 0,
                "userEnrollStatus": this.model.periodicExamDetail.userEnroll ? this.model.periodicExamDetail.userEnroll.status : 4,
                "comment": this.model.periodicExamDetail.userEnroll ? this.model.periodicExamDetail.userEnroll.comment : ""
            };

            this.model.currentSessionInfo.startTime = this.model.periodicExamDetail.userExamSession ? this.getTimestamp(this.model.periodicExamDetail.userExamSession.createTime) : null;
            this.model.currentSessionInfo.status = this.model.periodicExamDetail.userExamSession ? this.model.periodicExamDetail.userExamSession.status : null;

            this.model.examInfo.id = this.model.periodicExamDetail.periodicExamSession ? this.model.periodicExamDetail.periodicExamSession.exam.id : "";
            this.model.examInfo.answerTime = this.model.periodicExamDetail.periodicExamSession ? this.model.periodicExamDetail.periodicExamSession.exam.answerTime : this.model.periodicExamDetail.periodicExam.answerTime;
            this.model.examInfo.title = this.model.periodicExamDetail.periodicExamSession ? this.model.periodicExamDetail.periodicExamSession.exam.name : this.model.periodicExamDetail.periodicExam.name;
            this.model.examInfo.startTime = this.model.periodicExamDetail.periodicExamSession ? this.getTimestamp(this.model.periodicExamDetail.periodicExamSession.startTime) : 0;
            this.model.examInfo.endTime = this.model.periodicExamDetail.periodicExamSession ? this.getTimestamp(this.model.periodicExamDetail.periodicExamSession.endTime) : 0;
            this.model.examInfo.passScore = this.model.periodicExamDetail.periodicExamSession ? this.model.periodicExamDetail.periodicExamSession.exam.passScore : this.model.periodicExamDetail.periodicExam.passScore;
            this.model.examInfo.description = this.model.periodicExamDetail.periodicExamSession ? this.model.periodicExamDetail.periodicExamSession.exam.description : this.model.periodicExamDetail.periodicExam.description;
            this.model.examInfo.totalScore = this.model.periodicExamDetail.periodicExamSession ? this.model.periodicExamDetail.periodicExamSession.exam.totalScore : this.model.periodicExamDetail.periodicExam.totalScore;
            this.model.examInfo.chance = this.model.periodicExamDetail.periodicExamSession ? this.model.periodicExamDetail.periodicExamSession.exam.chance : this.model.periodicExamDetail.periodicExam.chance;
            this.model.examInfo.remainingTryTimes = this.model.periodicExamDetail.periodicExamSession ? this.getRemainingTryTimes() : this.model.periodicExamDetail.periodicExam.chance;
            this.model.examInfo.tryTimes = this.model.periodicExamDetail.periodicExamSessionUser ? this.model.periodicExamDetail.periodicExamSessionUser.userExamSessionCount : 0;

            this.model.examInfo.passModel = this.model.periodicExamDetail.periodicExam.passModel;
            // this.model.examInfo.passModel = 2;
            this.model.examInfo.questionNumber = this.model.periodicExamDetail.userExamSession ? this.model.periodicExamDetail.userExamSession.totalQuestionNumber : this.model.periodicExamDetail.periodicExam.questionNumber;
            this.model.examInfo.passAccuracy = this.model.periodicExamDetail.periodicExam.passAccuracy;
        },
        getUserExamStatus: function () {
            var status = 0;

            if (this.model.businessExam.needEnroll && this.model.enroll.status != 1) {
                status = 0;
            }
            else {
                status = this.model.periodicExamDetail.periodicExamUserStatus;
            }

            return status;
        },
        getPrepareConfig: function () {
            var config = {
                userId: TokenUtils.getUserId(),
                examId: this.model.examInfo.id,
                sessionStatus: this.model.currentSessionInfo.status,
                userExamStatus: this.getUserExamStatus(),
                nextSessionStartTime: this.model.nextSessionStartTime,
                bestScore: this.model.periodicExamDetail.periodicExamSessionUser ? this.model.periodicExamDetail.periodicExamSessionUser.highestScore : "--",
                bestAccuracy: this.model.periodicExamDetail.periodicExamSessionUser ? this.model.periodicExamDetail.periodicExamSessionUser.highestAccuracy : "--",
                historyScoreUrl: window.self_host + "/" + projectCode + "/periodic_exam/" + window.periodic_exam_id + "/history", // 历史成绩页面链接
                passed: this.model.periodicExamDetail.periodicExamSessionUser ? this.model.periodicExamDetail.periodicExamSessionUser.passed : "--",
                // 剩余考试次数
                remainingTryTimes: this.model.examInfo.remainingTryTimes,
                //已使用考试次数
                tryTimes: this.model.examInfo.tryTimes,
                // 考试机会
                examChance: this.model.examInfo.chance,
                // 是否显示解析连接
                analysisCondStatus: this.model.examInfo.analysisStrategy.strategy,
                analysisCondata: this.model.examInfo.analysisStrategy,
                // 考试详细说明
                examDetail: this.model.examInfo.description,
                // 总分
                score: this.model.examInfo.totalScore,

                //通过模式0: SCORE 得分, 1: ACCURACY 正确率, 2: ASSIGNMENT 交卷]
                passModel: this.model.examInfo.passModel,
                //题目数
                questionNumber: this.model.examInfo.questionNumber,
                //通过正确率【5.6.1】
                passAccuracy: this.model.examInfo.passAccuracy,

                // 通过分数
                passScore: this.model.examInfo.passScore,
                // 考试时长（分钟）
                completionSeconds: this.model.examInfo.answerTime > 0 ? this.model.examInfo.answerTime / 60 : '--',
                //作答时长  null 为不限时间
                answerTime: this.model.examInfo.answerTime,
                nextExamTimeText: this.getNextExamText(),
                // examMode: config.Exam.Mode,
                // 考试结束时间
                examBeginTime: this.model.examInfo.startTime,
                // 考试结束时间
                examEndTime: this.model.examInfo.endTime,
                // 本次考试结束时间
                leavetime: this.getCurrentSessionLeavetime(),
                title: this.model.examInfo.title,
                i18n: this.getLanaguageKey().exam.prepare,
                //考试报名设置
                enrollType: this.model.examInfo.enroll.enrollType,
                //用户报名状态
                userEnrollType: this.model.examInfo.enroll.userEnrollStatus,
                opinion: this.model.examInfo.enroll.comment,
                //是否显示收藏按钮(暂时给定，随后与服务端联调)
                showFavorite: window.switch_assist_fav,
                examTimeText: this.getExamTimeText(),
                onStart: $.proxy(this.onStart, this),
                favoriteHander: {
                    addFavorites: store.fav.addFavorites,
                    deleteFavorites: store.fav.deleteFavorites,
                    checkFavorites: store.fav.checkFavorites,
                    enableFavorite: true, // 是否启动收藏功能
                    examLink: window.exam_link
                },
                enrollExam: function () {
                    var that = this;
                    location.href = TokenUtils.getEnrollUrl(window.online_exam_id, location.href);
                },
                onEnd: $.proxy(this.onEnd, this),
                onUpdateStatus: $.proxy(this.onUpdateStatus, this),
                attachments: this.model.businessExam.onlineExam.attachments,
                examType: window.sub_type
            };

            return config;
        },
        getNextExamText: function () {
            if (this.model.periodicExamDetail.nextPeriodicExamSession) {
                var startTime = this.model.periodicExamDetail.nextPeriodicExamSession.startTime;

                return $.format.toBrowserTimeZone(Date.ajustTimeString(startTime), 'MM-dd HH:mm');
            } else if (this.model.periodicExamDetail.periodicExam.nextSessionStartTime) {
                var startTime = this.model.periodicExamDetail.periodicExam.nextSessionStartTime;

                return $.format.toBrowserTimeZone(Date.ajustTimeString(startTime), 'MM-dd HH:mm');
            }

            return "";
        },
        getCurrentSessionLeavetime: function () {
            var leaveTime = null,
                answerTime = this.model.examInfo.answerTime > 0 ? this.model.examInfo.answerTime * 1000 : 0;

            if (this.model.examInfo.answerTime) {
                if (this.model.currentSessionInfo.startTime == null) {
                    leaveTime = null;
                } else if (this.model.currentSessionInfo.startTime == 0) {
                    leaveTime = this.model.examInfo.endTime;
                } else if (this.model.currentSessionInfo.startTime + answerTime > this.model.examInfo.endTime) {
                    leaveTime = this.model.examInfo.endTime;
                } else {
                    leaveTime = this.model.currentSessionInfo.startTime + answerTime;
                }
            } else {
                leaveTime = this.model.examInfo.endTime;
            }

            return leaveTime;
        },
        getRemainingTryTimes: function () {
            if (!this.model.periodicExamDetail.periodicExamSessionUser)
                return this.model.periodicExamDetail.periodicExamSession.exam.chance;

            return this.model.periodicExamDetail.periodicExamSession.exam.chance - this.model.periodicExamDetail.periodicExamSessionUser.userExamSessionCount;
        },
        getTimestamp: function (time) {
            if (!time)
                return time;
            return new Date($.format.toBrowserTimeZone(Date.ajustTimeString(time), 'yyyy/MM/dd HH:mm:ss')).getTime();
        },
        getLanaguageKey: function () {
            return language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        },
        getExamTimeText: function () {
            if (this.model.periodConfig.type != undefined) {
                switch (this.model.periodConfig.type) {
                    case 0:
                        return $.format.toBrowserTimeZone(Date.ajustTimeString(this.model.periodicExamDetail.periodicExam.startTime), 'yyyy-MM-dd HH:mm:ss') + " ~ " + $.format.toBrowserTimeZone(Date.ajustTimeString(this.model.periodicExamDetail.periodicExam.endTime), 'yyyy-MM-dd HH:mm:ss');
                    case 1:
                    case 2:
                    case 3:
                    default:
                        return this.getRankTimeText(this.model.periodConfig.type);
                }
            } else {
                return '';
            }

        },
        getRankTimeText: function (type) {
            var i18n = this.getLanaguageKey().exam.prepare;
            var result = $.format.toBrowserTimeZone(Date.ajustTimeString(this.model.periodicExamDetail.periodicExam.startTime), "yyyy-MM-dd") + " ~ " + $.format.toBrowserTimeZone(Date.ajustTimeString(this.model.periodicExamDetail.periodicExam.endTime), "yyyy-MM-dd") + " ";

            switch (type) {
                case 1:
                    result += i18n.perTitle; //"每";
                    $.each(this.model.periodConfig.week, $.proxy(function (index, item) {
                        if (item == 1)
                            result += i18n.weekTitle + this.toUpperNumCase(item + 6);
                        else
                            result += i18n.weekTitle + this.toUpperNumCase(item - 1);

                        if (index != this.model.periodConfig.week.length - 1) {
                            result += "、"
                        }
                    }, this));
                    if (this.model.periodConfig && this.model.periodConfig.timeFrames)
                        $.each(this.model.periodConfig.timeFrames, $.proxy(function (index, item) {
                            result += " " + $.format.toBrowserTimeZone(Date.ajustTimeString(item.startTime), 'HH:mm') + " ~ " + $.format.toBrowserTimeZone(Date.ajustTimeString(item.endTime), 'HH:mm') + "\r\n";
                        }, this));
                    break;
                case 2:
                    result += i18n.perMonthTitle;
                    $.each(this.model.periodConfig.month, $.proxy(function (index, item) {
                        result += item;
                        if (index == this.model.periodConfig.month.length - 1) {
                            result += i18n.dayTitle;
                        } else {
                            result += "、"
                        }
                    }, this));
                    $.each(this.model.periodConfig.timeFrames, $.proxy(function (index, item) {
                        result += $.format.toBrowserTimeZone(Date.ajustTimeString(item.startTime), 'HH:mm') + " ~ " + $.format.toBrowserTimeZone(Date.ajustTimeString(item.endTime), 'HH:mm') + "\r\n";
                    }, this));
                    break;
                case 3:
                    result = "";
                    $.each(this.model.periodConfig.timeFrames, $.proxy(function (index, item) {
                        result += $.format.toBrowserTimeZone(Date.ajustTimeString(item.startTime), 'yyyy-MM-dd HH:mm') + " ~ " + $.format.toBrowserTimeZone(Date.ajustTimeString(item.endTime), 'yyyy-MM-dd HH:mm') + "<br/>";
                    }, this));
                    break;
            }

            return result;
        },
        play: function (config) {
            this.answer.prepare("#prepare", config);
        },
        onStart: function (examId, userExamStatus) {
            $("#prepare").hide();

            if (userExamStatus != 3) {
                store.exam.session(examId, this.model.periodicExamDetail.periodicExamSession.exam.examPaperStrategy).done($.proxy(function (data) {
                    this.answer.start(data.id);
                    $("#exam").show();
                }, this));
            } else {
                this.answer.start(this.model.periodicExamDetail.userExamSession.id);
                $("#exam").show();
            }
        },
        onEnd: function () {
            var that = this;
            var i18n = this.getLanaguageKey().exam.answer;
            store.exam.submit(this.model.periodicExamDetail.userExamSession.userPaperAnswerId).done($.proxy(function () {
                $.fn.udialog.alert(i18n.examFinishTitle, {
                    width: '420',
                    icon: '',
                    title: i18n.confirmCaption,
                    buttons: [{
                        text: i18n.sure,
                        click: function () {
                            var t = $(this);
                            t["udialog"]("hide");
                            location.replace(window.self_host + "/" + window.projectCode + "/periodic_exam/" + that.model.periodicExamDetail.userExamSession.id + "/end");
                        },
                        'class': 'default-btn'
                    }],
                    disabledClose: true
                });
            }, this));
        },
        onUpdateStatus: function () {
            $.studying.loading.show();

            setTimeout(function () {
                window.location.reload();
            }, 3000);
        },
        toUpperNumCase: function (num) {
            var i18n = this.getLanaguageKey().exam.prepare;

            switch (num) {
                case 7:
                    return i18n.week.seven;
                case 6:
                    return i18n.week.six;
                case 5:
                    return i18n.week.five;
                case 4:
                    return i18n.week.four;
                case 3:
                    return i18n.week.three;
                case 2:
                    return i18n.week.two;
                case 1:
                    return i18n.week.one;
            }
        }
    }

    $(function () {
        viewModel.init();
    })
}(jQuery));