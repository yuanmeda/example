(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(['learning.exam.answer', 'learning.prepare', 'learning.enum'], function (v, p, _enum) {
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

        var languageVarl;// = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        if (language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        }
        else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        function getUserQuestionAnswers(examId, sessionId, qids) {
            return $.ajax({
                url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
                type: "POST",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                // data: {qid: qids},
                data: JSON.stringify(qids),
                contentType: "application/json;",
                async: false,
                cache: false,
                traditional: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        $.when($.ajax({
            url: selfUrl + '/' + projectCode + "/v1/exams/" + examId,
            async: true,
            type: "get",
            dataType: "json",
            requestCase: "snake",
            responseCase: "camel",
            enableToggleCase: true,
            cache: false,
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
            }
        }), $.ajax({
            url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
            type: "get",
            async: true,
            dataType: "json",
            requestCase: "snake",
            responseCase: "camel",
            cache: false,
            enableToggleCase: true,
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
            }
        })).done(function (examData, mineData) {
            var data = mineData[0], examInfo = examData[0];

            examInfo.beginTime = examInfo.beginTime.insert(examInfo.beginTime.indexOf("+") + 2, ":");
            examInfo.endTime = null;
            data.beginTime = data.beginTime.insert(data.beginTime.indexOf("+") + 2, ":");
            data.endTime = null;
            if (data.userData && data.userData.finishTime)
                data.userData.finishTime = data.userData.finishTime.insert(data.userData.finishTime.indexOf("+") + 2, ":");
            if (data.userData && data.userData.markTime)
                data.userData.markTime = data.userData.markTime.insert(data.userData.markTime.indexOf("+") + 2, ":");
            if (data.userData && data.userData.startTime)
                data.userData.startTime = data.userData.startTime.insert(data.userData.startTime.indexOf("+") + 2, ":");
            if (data.userData && data.userData.submitTime)
                data.userData.submitTime = data.userData.submitTime.insert(data.userData.submitTime.indexOf("+") + 2, ":");

            var answersData = [];
            // 如果是继续作答或者解析的话需要事先获取到用户已经作答过的答案
            if (data.status == 8 && data.userData) {
                Enumerable.from(data.userData.paper.parts).forEach(function (value, index) {
                    var qids = value.questionIdentities;
                    getUserQuestionAnswers(data.examId, data.sessionId, qids).done(function (answerData) {
                        if (answerData && answerData.length > 0)
                            answersData = answersData.concat(answerData);
                    });
                });
            }

            // $.learning.loading.hide();

            var config = {
                ElementSelector: '#exam',
                Host: "http://" + window.location.host + selfUrl + "/" + projectCode,
                CloudUrl: cloudUrl,
                AccessToken: accessToken,
                ExamId: data.examId, //'0a7f501f-987b-4802-8c22-080225dbc7f5',
                SessionId: data.sessionId,
                CustomData: customData || null,
                View: -1,
                QuestionScoreDict: {},
                Batches: [],
                Cells: [],
                Answers: [],
                ViewMode: 1, // 1、作答, 2、解析
                Language: language,
                Attachement: {
                    Session: "",
                    Url: "",
                    Path: "",
                    Server: "",
                    DownloadUrlFormat: ""
                },
                Paper: {
                    "Summary": "这里是考试说明预留字段",
                    "CompletionSeconds": data.duration,
                    "QuestionCount": data.questionCount,
                    "Score": data.totalScore,
                    "Title": data.name
                },
                Exam: {
                    "Id": examInfo.id,
                    "Name": examInfo.title,
                    "LimitSeconds": null, // 单位毫秒
                    "BeginTime": new Date(examInfo.beginTime).getTime(), //new Date(new Date().getTime() + 600000).getTime(), // 单位毫秒
                    "EndTime": examInfo.endTime ? new Date(examInfo.endTime).getTime() : _enum.Learning.ConstValue.MaxExamEndTime, //new Date('2016/03/26 23:00:00').getTime(), //// 单位毫秒
                    "Mode": 1,
                    "PassScore": examInfo.passingScore,
                    "Summary": examInfo.description,
                    "Chance": examInfo.examChance, // 考试机会
                    "ExamResultPageUrl": "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/exercise/analysis",  // 考试结束后要跳转的页面
                    "UploadAllowed": examInfo.uploadAllowed
                },
                UserExam: {
                    "AnswersData": answersData,
                    "AnalysisData": [],
                    "UserExamStatus": data.status, // 用户考试状态
                    "BeginTime": data.userData && data.userData.startTime ? new Date(data.userData.startTime).getTime() : 0,//parseInt(new Date().getTime()),
                    "AnswerMode": 0,
                    "CostSeconds": 0,
                    "DoneCount": data.userData && data.userData.answeredCount ? data.userData.answeredCount : 0,
                    "MaxScore": data.maxUserData && data.maxUserData.finishTime ? data.maxUserData.score : (data.userData ? (data.finishTime ? (data.userData.markTime ? data.userData.score : data.userData.objectiveScore) : undefined) : undefined)
                },
                Parts: [],
                PartTitles: [],
                i18n: languageVarl
            };

            var main = new v.Learning.ExamAnswer(config);
            main.init(config);
            if ((main.store.data.UserExam.UserExamStatus < 8 || main.store.data.UserExam.UserExamStatus > 8) && main.store.data.UserExam.UserExamStatus != 112) {
                main.store.prepare(config.CustomData).done(function (data) {
                    main.store.start();
                    $.learning.loading.hide();
                    $("#examPrepare").hide();
                });
            }
            else {
                // 开始考试
                $.learning.loading.hide();
                main.store.data.UserExam.UserExamStatus == 8 ? main.store.continueAnswer() : main.store.start();
            }
        }).fail(function (failData) {
            $.learning.loading.hide();
            var message = JSON.parse(failData.responseText);

            var testUrl = "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/exception";
            location.replace(testUrl + "?exam_id=" + examId + "&message=" + message.message);
        });
    });
}(jQuery));