(function ($) {
    document.title = "历史成绩页";
    require.config({
        baseUrl: staticurl
    });
    require(['learning.history'], function (v, p) {
        String.prototype.insert = function (ofset, subStr) {
            if (ofset < 0 || ofset >= this.length - 1) {
                return this.append(subStr);
            }
            return this.substring(0, ofset + 1) + subStr + this.substring(ofset + 1);
        };

        var languageVarl;// = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        if(language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        }
        else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        function getHistorys(examId, userId) {
            return $.ajax({
                url:  selfUrl + "/" + projectCode + "/v1/m/exams/" + examId + "/users/" + userId + '/history',
                type: "get",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        function getMine(examId) {
            return $.ajax({
                url:  selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
                type: "get",
                async: true,
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        function getExam(examId) {
            return $.ajax({
                url:  selfUrl + "/" + projectCode + "/v1/exams/" + examId,
                type: "get",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        function getServerTime() {
            return $.ajax({
                url:  selfUrl + "/" + projectCode + '/v1/m/other/date',
                type: 'get',
                dataType: 'json',
                requestCase: 'snake"',
                responseCase: 'camel',
                enableToggleCase: true,
                contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        $.learning.loading.show();
        $.when(getExam(examId), getMine(examId), getHistorys(examId, userId), getServerTime()).done(function (examData, mineData, historyData, serverTimeData) {
            $.learning.loading.hide();

            var exam = examData[0], historys = historyData[0], serverTime = serverTimeData[0], mine = mineData[0];
            var resultPageUrl = mine.subType != 3 ? "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/end" : "http://" + window.location.host +  selfUrl + '/' + projectCode + "/exam/tounament/end"
            
            $('#history').history({
                host: 'http://' + window.location.host +  selfUrl + '/' + projectCode + '/exam/analysis',
                i18n: languageVarl.exam.history,
                data: {
                    "exam": {
                        "title": exam.title,
                        "duration": exam.duration,
                        "chance": exam.examChance,
                        "passingScore": exam.passingScore,
                        "totalScore": exam.totalScore,
                        "bestScore": mine.maxUserData && mine.maxUserData.submitTime ? mine.maxUserData.score : 0,
                        "subType":mine.subType,
                        "examResultPageUrl": resultPageUrl,//"http://" + window.location.host + '/' + projectCode + "/exam/end",  // 考试结束后要跳转的页面
                        "analysisAllowed": mine.analysisAllowed
                    },
                    "items": historys
                }
            });
        });
    });
} (jQuery));