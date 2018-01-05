(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(['studying.exam.answer', 'studying.prepare'], function (v, p) {
        //根据QueryString参数名称获取值
        function getQueryStringByName(name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        }
        String.prototype.insert = function (ofset, subStr) {
            if (ofset < 0 || ofset >= this.length - 1) {
                return this.append(subStr);
            }
            return this.substring(0, ofset + 1) + subStr + this.substring(ofset + 1);
        };

        function getUserQuestionAnswers(examId, sessionId, qids, success) {
            return $.ajax({
                url: selfUrl +  '/' + projectCode + "/v2/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
                type: "POST",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: false,
                data: JSON.stringify(qids),
                contentType: "application/json;charset=utf-8",
                cache: false,
                traditional: true,
                success: success,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        function getQuestionAnalysis(examId, sessionId, qids) {
            return $.ajax({
                url: selfUrl +  '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId + "/analysis",
                type: "POST",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                // data: { qid: qids },
                data: JSON.stringify(qids),
                contentType: "application/json;",
                async: false,
                traditional: true,
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        }

        var languageVarl;// = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        if (language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        }
        else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        $.studying.loading.show();
        $.when($.ajax({
            url: selfUrl + '/' + projectCode + "/v1/exams/" + examId,
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
            url: selfUrl +  '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
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
        })).done(function (examData, mineData) {
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

            var answersData = [], analysisData = [], defs = [], qids = [];
            // 如果是继续作答或者解析的话需要事先获取到用户已经作答过的答案
            Enumerable.from(data.userData.ndrPaper.item.testParts[0].assessmentSections).forEach(function (value, index) {
                qids = qids.concat($.map(value.sectionParts, function (spv, spi) {
                    return spv.identifier;
                }));
            });

            defs.push(getUserQuestionAnswers(examId, sessionId, qids, function (answerData) {
                if (answerData && answerData.length > 0)
                    answersData = answersData.concat(answerData);
            }, function (failData) {
                var response = JSON.parse(failData.responseText);
                var testUrl = "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/exception";
                location.replace(testUrl + "?exam_id=" + examId + "&message=" + response.message);
            }));

            $.when.apply(this, defs).done(function () {
                $.studying.loading.hide();

                var config = {
                    ElementSelector: '#exam',
                    "UserId": userId,
                    "Host": "http://" + window.location.host + selfUrl +  "/" + projectCode,
                    "NoteServiceHost": "http://" + window.location.host + selfUrl +  "/" + projectCode,                          // 必填，笔记组件API地址
                    "QuestionBankServiceHost": "http://" + window.location.host + selfUrl +  "/" + projectCode,               // 必填，题库服务API地址
                    StaticHost: staticurl,
                    CloudUrl: cloudUrl,
                    AccessToken: accessToken,
                    ExamId: data.examId, //'0a7f501f-987b-4802-8c22-080225dbc7f5',
                    SessionId: data.sessionId,
                    LocationSource: locationSource,
                    View: -1,
                    QuestionScoreDict: {},
                    Batches: [],
                    Cells: [],
                    Answers: [],
                    ViewMode: 2, // 1、作答, 2、解析
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
                        "LimitSeconds": examInfo.duration * 1000, // 单位毫秒
                        "BeginTime": new Date(examInfo.beginTime).getTime(), //new Date(new Date().getTime() + 600000).getTime(), // 单位毫秒
                        "EndTime": new Date(examInfo.endTime).getTime(), //new Date('2016/03/26 23:00:00').getTime(), //// 单位毫秒
                        "Mode": 1,
                        "PassScore": examInfo.passingScore,
                        "Summary": examInfo.description,
                        "Chance": data.examChance, // 考试机会
                        "ExamResultPageUrl": "http://" + window.location.host + selfUrl + "/exam/end",  // 考试结束后要跳转的页面
                        "UploadAllowed": examInfo.uploadAllowed
                    },
                    UserExam: {
                        "AnswersData": answersData,
                        "AnalysisData": analysisData,
                        "UserExamStatus": data.status, // 用户考试状态
                        "BeginTime": data.userData && data.userData.startTime ? new Date(data.userData.startTime).getTime() : 0,//parseInt(new Date().getTime()),
                        "AnswerMode": 0,
                        "CostSeconds": 0,
                        "DoneCount": data.userData && data.userData.answeredCount ? data.userData.answeredCount : 0
                    },
                    Parts: [],
                    PartTitles: [],
                    i18n: languageVarl
                };

                var main = new v.Studying.ExamAnswer(config);
                main.init(config);
                main.store.viewAnalysis().done(function (data) {
                    $.studying.loading.hide();
                    $("#examPrepare").hide();
                    $("#exam").show();
                });
            });
        }).fail(function (failData) {
            $.studying.loading.hide();
            var message = JSON.parse(failData.responseText);

            var testUrl = "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/exception";
            location.replace(testUrl + "?exam_id=" + examId + "&message=" + message.message);
        });
    });
} (jQuery));