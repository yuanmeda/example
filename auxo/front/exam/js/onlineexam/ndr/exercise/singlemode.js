(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(["studying.exercise.answer", "studying.enum"], function (answer, _enum) {
        $.studying.loading.show();

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

        var languageVarl;// = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        if (language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        }
        else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        function getExamInfo() {
            return $.ajax({
                url: selfUrl +  '/' + projectCode + "/v1/exams/" + examId,
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
                url: selfUrl +  '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
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

        $.when(getExamInfo(), getMyExamInfo()).done(function (examData, mineData) {
            var data = mineData[0], examInfo = examData[0];

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

            // 如果是继续作答或者解析的话需要事先获取到用户已经作答过的答案
            var answersData = [], analysisData = [];
            $.studying.loading.hide();

            init(data, examData, answersData, analysisData);
        }).fail(function (failData) {
            var message = JSON.parse(failData.responseText);

            var testUrl = "http://" + window.location.host + selfUrl +  '/' + projectCode + "/exam/exception";
            location.replace(testUrl + "?exam_id=" + examId + "&message=" + message.message);
        });

        function init(mine, exam, answersData, analysisData) {
            var config = {
                "UserId": userId,
                "Host": "http://" + window.location.host + selfUrl +  "/" + projectCode,
                "NoteServiceHost": "http://" + window.location.host + selfUrl +  "/" + projectCode,                          // 必填，笔记组件API地址
                "QuestionBankServiceHost": "http://" + window.location.host + selfUrl +  "/" + projectCode,               // 必填，题库服务API地址
                'StaticHost': staticurl,
                "CloudUrl": cloudUrl,
                "AccessToken": accessToken,
                "ElementSelector": "#exercise",
                "ExamId": mine.examId,
                CustomData: customData || null,
                "SessionId": mine.sessionId,
                "Language": language,
                "Batches": [],
                "Sid": "1a642291763348e98df58ab43fe41ac7",
                "Cells": [],
                "i18n": languageVarl,
                "ViewMode": 1, // 1、作答, 2、解析
                "TokenConfig": {
                    "NeedToken": false,
                    "OnGetToken": function (data) { },
                },
                "QuestionScoreDict": {},
                "ApiRequestUrls": {

                },
                "EventCallbacks": {
                    "onAnswerSaved": function (answerData) {
                        window.console && console.log('onAnswerSaved');
                    },
                    "onNumberChanged": function () {
                        window.console && console.log('onNumberChanged');
                    }
                },
                "Attachement": {
                    "Session": "",
                    "Url": "",
                    "Path": "",
                    "Server": "",
                    "DownloadUrlFormat": ""
                },
                'controlOptions': {
                    'disableNavigatorJump': false,
                    'hideNavigator': false,
                    'disablePreButton':false,
                    'forceToAnswer': false
                },
                "Exercise": {
                    "Summary": "这里是考试说明预留字段",
                    "CompletionSeconds": mine.duration,
                    "QuestionCount": mine.questionCount,
                    "Score": mine.totalScore,
                    "Title": mine.name,
                    "ExerciseType": 2,
                    "Mode": 2,
                    "LimitSeconds":exam[0].duration?exam[0].duration * 1000 : null,
                    "EndTime": _enum.Studying.ConstValue.MaxExamEndTime
                },
                "UserExam": {
                    "AnswersData": [], //answersData,
                    "AnalysisData": [],
                    "UserExamStatus": mine.status, // 用户考试状态
                    "BeginTime":mine.userData && mine.userData.startTime ? new Date(mine.userData.startTime).getTime() : 0
                }
            };

            $.studying.loading.show();
            var main = new answer.Studying.ExerciseAnswer();
            main.init(config);
            if ((main.store.data.UserExam.UserExamStatus < 8 || main.store.data.UserExam.UserExamStatus > 8) && main.store.data.UserExam.UserExamStatus != 112) {
                main.store.prepare(config.CustomData).done(function (data) {
                    $.studying.loading.hide();
                    main.store.start();
                    $("#examPrepare").hide();
                });
            }
            else {
                // 开始考试
                $.studying.loading.hide();
                main.store.data.UserExam.UserExamStatus == 8 ? main.store.continueAnswer() : main.store.start();
            }
        }
    });
} (jQuery));