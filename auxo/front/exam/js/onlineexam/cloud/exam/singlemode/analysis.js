(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(["learning.exam.singleanswer", "learning.enum"], function (answer, _enum) {
        $.learning.loading.show();

        String.prototype.insert = function (ofset, subStr) {
            if (ofset < 0 || ofset >= this.length - 1) {
                return this.append(subStr);
            }
            return this.substring(0, ofset + 1) + subStr + this.substring(ofset + 1);
        };

        //根据QueryString参数名称获取值
        function getQueryStringByName(name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        }

        var returnUrl = decodeURIComponent(getQueryStringByName('return_url'));

        var languageVarl;
        if (language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        } else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        function getExamInfo() {
            return $.ajax({
                url: selfUrl + '/' + projectCode + "/v1/exams/" + examId,
                cache: false,
                async: true,
                type: "get",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        function getMyExamInfo() {
            return $.ajax({
                url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
                cache: false,
                type: "get",
                async: true,
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        function getUserQuestionAnswers(examId, sessionId, qids, success) {
            return $.ajax({
                url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
                cache: false,
                type: "POST",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                data: JSON.stringify(qids),
                contentType: "application/json;",
                async: false,
                traditional: true,
                success: success,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        function getQuestionAnalysis(examId, sessionId, qids, success) {
            return $.ajax({
                url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId + "/analysis",
                type: "POST",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                data: JSON.stringify(qids),
                contentType: "application/json;",
                traditional: true,
                cache: false,
                success: success,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        $.when(getExamInfo(), getMyExamInfo()).done(function (examData, mineData) {
            var data = mineData[0],
                examInfo = examData[0];

            examInfo.beginTime = examInfo.beginTime.insert(examInfo.beginTime.indexOf("+") + 2, ":");
            examInfo.endTime = examInfo.endTime ? examInfo.endTime.insert(examInfo.endTime.indexOf("+") + 2, ":") : null;
            data.beginTime = data.beginTime.insert(data.beginTime.indexOf("+") + 2, ":");
            data.endTime = data.endTime ? data.endTime.insert(data.endTime.indexOf("+") + 2, ":") : null;
            if (data.userData && data.userData.finishTime)
                data.userData.finishTime = data.userData.finishTime.insert(data.userData.finishTime.indexOf("+") + 2, ":");
            if (data.userData && data.userData.markTime)
                data.userData.markTime = data.userData.markTime.insert(data.userData.markTime.indexOf("+") + 2, ":");
            if (data.userData && data.userData.startTime)
                data.userData.startTime = data.userData.startTime.insert(data.userData.startTime.indexOf("+") + 2, ":");
            if (data.userData && data.userData.submitTime)
                data.userData.submitTime = data.userData.submitTime.insert(data.userData.submitTime.indexOf("+") + 2, ":");

            var answersData = [],
                analysisData = [],
                defs = [];

            Enumerable.from(data.userData.paper.parts).forEach(function (value, index) {
                var qids = value.questionIdentities;

                defs.push(getUserQuestionAnswers(data.examId, sessionId, qids, function (answerData) {
                    if (answerData && answerData.length > 0)
                        answersData = answersData.concat(answerData);
                }));
                defs.push(getQuestionAnalysis(examId, sessionId, qids, function (returnData) {
                    if (returnData && returnData.length > 0)
                        analysisData = analysisData.concat(returnData);
                }));
            });

            $.when.apply({}, defs).done(function () {
                init(data, examData, answersData, analysisData);
            });
        }).fail(function (failData) {
            var message = JSON.parse(failData.responseText);

            var testUrl = "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/exception";
            location.replace(testUrl + "?exam_id=" + examId + "&message=" + message.message);
        });

        function init(mine, exam, answersData, analysisData) {
            $.learning.loading.hide();

            var config = {
                "Host": "http://" + window.location.host + selfUrl + "/" + projectCode,
                "CloudUrl": cloudUrl,
                "AccessToken": accessToken,
                "ElementSelector": "#exercise",
                "ExamId": examId,
                "CustomData": customData || null,
                "SessionId": sessionId,
                "Language": language,
                "Batches": [],
                "Sid": "1a642291763348e98df58ab43fe41ac7",
                "Cells": [],
                "i18n": languageVarl,
                "ViewMode": 2, // 1、作答, 2、解析
                "QuestionScoreDict": {},
                "ApiRequestUrls": {

                },
                "EventCallbacks": {
                    "onAnswerSaved": function (answerData) {
                        window.console && console.log('onAnswerSaved');
                    }
                },
                "Attachement": {
                    "Session": "",
                    "Url": "",
                    "Path": "",
                    "Server": "",
                    "DownloadUrlFormat": ""
                },
                Paper: {
                    "Summary": "这里是考试说明预留字段",
                    "CompletionSeconds": mine.duration,
                    "QuestionCount": mine.questionCount,
                    "Score": mine.totalScore,
                    "Title": mine.name
                },
                "Exam": {
                    "Id": exam[0].id,
                    "Name": exam[0].title,
                    "LimitSeconds": exam[0].duration ? exam[0].duration * 1000 : null, // 单位毫秒
                    "BeginTime": new Date(exam[0].beginTime).getTime(), //new Date(new Date().getTime() + 600000).getTime(), // 单位毫秒
                    "EndTime": exam[0].endTime ? new Date(exam[0].endTime).getTime() : _enum.Learning.ConstValue.MaxExamEndTime, //new Date('2016/03/26 23:00:00').getTime(), //// 单位毫秒
                    "Mode": 1,
                    "PassScore": exam[0].passingScore,
                    "Summary": exam[0].description ? exam[0].description : "",
                    "Chance": exam[0].examChance, // 考试机会
                    "ExamResultPageUrl": returnUrl ? returnUrl : "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/end", // 考试结束后要跳转的页面
                    "EnrollType": exam[0].enrollType,
                    "EnrollUrl": getEnrollUrl(mine.examId, location.href),
                    "UploadAllowed": exam[0].uploadAllowed,
                    "SubType": exam[0].subType,
                    "rankingAble": exam[0].rankingAble,
                    "AnswerQueue": 1,
                    "SingleModeConfig": {
                        "Mode": 3
                    }
                },
                "UserExam": {
                    "AnswersData": answersData,
                    "UserEnroll": mine.userEnroll,
                    "AnalysisData": [],
                    "UserExamStatus": mine.status, // 用户考试状态
                    "BeginTime": mine.userData && mine.userData.startTime ? new Date(mine.userData.startTime).getTime() : 0, //parseInt(new Date().getTime()),
                    "AnswerMode": 0,
                    "CostSeconds": 0,
                    "DoneCount": mine.userData && mine.userData.answeredCount ? mine.userData.answeredCount : 0,
                    "MaxScore": mine.maxUserData && mine.maxUserData.submitTime ? mine.maxUserData.score : undefined,
                    "resultCode": mine.lastUserData && mine.lastUserData.resultCode ? (mine.lastUserData.resultCode.length > 10 ? mine.lastUserData.resultCode.substr(0, 10) + "..." : mine.lastUserData.resultCode) : ""
                },
            };

            $.learning.loading.show();
            var main = new answer.Learning.ExamSingleAnswer();
            main.init(config);
            main.store.viewAnalysis().done(function (data) {
                $.learning.loading.hide();
                $("#exercise").show();
            });

            // if ((main.store.data.UserExam.UserExamStatus < 8 || main.store.data.UserExam.UserExamStatus > 8) && main.store.data.UserExam.UserExamStatus != 112) {
            //     main.store.prepare(config.CustomData).done(function (data) {
            //         $.learning.loading.hide();
            //         main.store.start();
            //         $("#examPrepare").hide();
            //     });
            // } else {
            //     // 开始考试
            //     $.learning.loading.hide();
            //     main.store.data.UserExam.UserExamStatus == 8 ? main.store.continueAnswer() : main.store.start();
            // }
        }
    });
}(jQuery));