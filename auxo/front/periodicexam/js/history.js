(function ($) {
    document.title = "历史成绩页";
    require.config({
        baseUrl: staticurl
    });
    require(['studying.history', 'timer'], function (v, __timer) {
        var timer = __timer.Common.TimerFactory.Singleton();

        var languageVarl;
        if (language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        } else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        function getHistorys(examId) {
            return $.ajax({
                url: window.exam_api_url + "/v1/user_exam_sessions/search?$filter=" + encodeURIComponent("exam_id eq " + examId + " and user_id eq " + userId),
                type: "GET",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: "application/json; charset=utf-8",
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        function getExam() {
            var url = window.self_host + "/v1/periodic_exam_details/" + window.periodic_exam_id + "?_=" + new Date().getTime();
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'JSON',
                contentType: "application/json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', TokenUtils.getMacToken('GET', url, location.host));
                    xhr.setRequestHeader('X-Gaea-Authorization', TokenUtils.getGaeaId());
                }
            });
        }

        function getMaxScore(sessions) {
            var score = 0;
            for (var i = 0; i < sessions.length; i++) {
                score = sessions[i].score > score ? sessions[i].score : score;
            }

            return score;
        }


        function getAnalysisAllowed(ramainingChance, analysisStrategy, endTime) {
            var now = timer.time();
            endTime = new Date().getTime();

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
                    false;
            }
        }

        $.studying.loading.show();
        $.when(timer.ready(), getExam()).done(function (t, pData) {
            pData = pData[0];
            getHistorys(pData.periodicExamSession.exam.id).done(function (historys) {
                var resultPageUrl = window.self_host + +'/' + projectCode + "/periodic_exam/end"
                var remainingChance = pData.periodicExamSession.exam.chance - pData.totalSessionNumber;
                var endTime = $.format.toBrowserTimeZone(Date.ajustTimeString(pData.periodicExamSession.exam.endTime), 'yyyy/MM/dd HH:mm:ss');

                $('#history').history({
                    host: window.self_host + '/' + projectCode + "/periodic_exam/" + pData.userExamSession.id + "/analysis",
                    i18n: languageVarl.exam.history,
                    data: {
                        "exam": {
                            "title": pData.periodicExamSession.exam.name,
                            "duration": pData.periodicExamSession.exam.answerTime,
                            "chance": pData.periodicExamSession.exam.chance,
                            "passingScore": pData.periodicExamSession.exam.passScore,
                            "totalScore": pData.periodicExamSession.exam.totalScore,
                            "bestScore": getMaxScore(historys.items),
                            "examResultPageUrl": resultPageUrl,
                            "analysisAllowed": getAnalysisAllowed(remainingChance, pData.periodicExamSession.exam.analysisStrategy, endTime),
                            "passModel": pData.periodicExamSession.exam.passModel,
                            // "passModel": 2,//test data
                            "questionNumber": pData.userExamSession.totalQuestionNumber,
                            "passAccuracy": pData.periodicExamSession.exam.passAccuracy,
                            "bestAccuracy": pData.periodicExamSessionUser ? pData.periodicExamSessionUser.highestAccuracy : '--'
                        },
                        "items": historys.items
                    }
                });
                $.studying.loading.hide();
            });
        });
    });
}(jQuery));
