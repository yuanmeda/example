(function ($) {
    document.title = "考试结束页";
    require.config({
        baseUrl: staticurl
    });
    require(['studying.end'], function (v, p) {
        var languageVarl;
        if (language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        } else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        $.studying.loading.show();

        function GetDetail() {
            var url = window.self_host + "/v1/periodic_exam_session_user/user_exam_session/" + window.sessionId + "/results?user_latest_answer_time=" + lastAnswerTime + "&_=" + new Date().getTime();
            return $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', TokenUtils.getMacToken("GET", url, window.location.host));
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        $.when(GetDetail()).done(function (data) {
            var startTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.periodicExamSession.exam.startTime), 'yyyy/MM/dd HH:mm:ss');
            var endTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.periodicExamSession.exam.endTime), 'yyyy/MM/dd HH:mm:ss');
            var remainingChance = data.periodicExamSession.exam.chance - data.totalSessionNumber;

            $('#end').end({
                i18n: languageVarl.exam.end,
                backUrl: "javascript:void(0);",
                title: data.periodicExamSession.exam.name,
                analysisUrl: window.self_host + '/' + projectCode + "/periodic_exam/" + window.sessionId + "/analysis",
                restartUrl: window.self_host + '/' + projectCode + "/periodic_exam/detail?periodic_exam_id=" + data.periodicExamSession.periodicExamId,
                data: {
                    examId: data.periodicExamSession.periodicExamId,
                    sessionId: window.sessionId,
                    userData: {
                        answeredCount: data.userExamSession.answerQuestionNumber, // 已作答的题目数
                        score: data.userExamSession.score, // 得分，当成绩未出时，值为 0
                        remainingChance: data.periodicExamSession.exam.chance - data.totalSessionNumber, // 剩余考试机会
                        costTimes: data.userExamSession.fixCostTime, // 用时
                        passed: data.userExamSession.passed // 是否已通过
                    },
                    status: data.userExamSession.status, // 用户考试状态0: ANSWERING 作答中, 1: ANSWER_FINISHED 作答已结束, 2: SCORED 已评分
                    name: data.periodicExamSession.exam.name, // 考试名称
                    questionCount: data.userExamSession.totalQuestionNumber, // 题目总数
                    totalScore: data.periodicExamSession.exam.totalScore, // 总分
                    passingScore: data.periodicExamSession.exam.passScore, // 合格分数
                    duration: data.periodicExamSession.exam.answerTime, // 考试时长（秒）
                    beginTime: startTime, // 考试开始时间
                    endTime: endTime, // 考试结束时间
                    remainingChance: remainingChance, // 剩余考试机会
                    examChance: data.periodicExamSession.exam.chance,
                    analysisAllowed: getAnalysisAllowed(remainingChance, data.periodicExamSession.exam.analysisStrategy, endTime, data.userExamSession.status), // 是否可以查看解析
                    rankingAble: false, // 是否显示排行榜
                    passModel: data.periodicExamSession.exam.passModel,
                    // passModel: 2,
                    passAccuracy: data.periodicExamSession.exam.passAccuracy,
                    accuracy: parseInt(data.userExamSession.correctQuestionNumber / data.userExamSession.totalQuestionNumber * 100)
                }
            });

            function getAnalysisAllowed(ramainingChance, analysisStrategy, endTime, status) {
                var now = new Date().getTime();
                endTime = new Date().getTime();

                if (status == 2) {
                    switch (analysisStrategy.strategy) {
                        case 0:
                            return false;
                        case 1:
                            return true;
                        case 2:
                            if (ramainingChance <= 0)
                                return true;
                            else
                                return false;
                        case 3:
                            var sst = new Date($.format.toBrowserTimeZone(Date.ajustTimeString(analysisStrategy.startTime), 'yyyy/MM/dd HH:mm:ss')).getTime(),
                                set = new Date($.format.toBrowserTimeZone(Date.ajustTimeString(analysisStrategy.endTime), 'yyyy/MM/dd HH:mm:ss')).getTime();

                            if (sst <= now && set >= now)
                                return true;
                            else
                                return false;
                        case 4:
                            return endTime < now;
                        default:
                            return false;
                    }
                } else {
                    return false;
                }
            }

            $.studying.loading.hide();
        });
    });
}(jQuery));
