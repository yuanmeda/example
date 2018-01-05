define(function (require, exports) {
    var Status = {
        '0': 'Disabled 考试不可用【考试不可用】',
        '1': 'Waiting 等待开始【未开始】',
        '4': 'Ready 考试可开始，用户未参加【开始考试】',
        '8': 'Joining 用户已参加考试【考试中】',
        '16': 'Submit 用户已交卷【等待批改】',
        '32': 'Marked 用户已完成考试，成绩已出【已评分】',
        '64': 'UnjoinAndFinished 考试已结束，用户未参加【考试已截止，未参加】',
        '80': 'SubmitAndFinished 考试已结束，用户已交卷【考试已截止，已交卷】',
        '96': 'MarkedAndFinished 考试已结束，用户已完成考试，成绩已出【考试已截止，已改卷】',
        '101': 'Timeout 用户作答超时【超时】',
        '112': 'Prepare 开始考试前准备【开始考试】'
    };

    var languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];

    String.prototype.insert = function (ofset, subStr) {
        if (ofset < 0 || ofset >= this.length - 1) {
            return this.append(subStr);
        }
        return this.substring(0, ofset + 1) + subStr + this.substring(ofset + 1);
    };

    function init(mine, exam, answersData, analysisData) {
        return {
            "Host": (window.selfUrl || '') + "/" + projectCode,
            "NoteServiceHost": (window.selfUrl || '') + "/" + projectCode,                          // 必填，笔记组件API地址
            "QuestionBankServiceHost": (window.selfUrl || '') + "/" + projectCode,               // 必填，题库服务API地址
            "ElementSelector": "#chapter",
            "ExamId": mine.examId,
            "SessionId": mine.sessionId,
            "Language": language,
            "Batches": [],
            "Sid": "1a642291763348e98df58ab43fe41ac7",
            "Cells": [],
            "i18n": languageVarl,
            "QuestionScoreDict": {},
            "UserId": window.userId,
            "AccessToken": accessToken,
            "Attachement": {
                "Session": "",
                "Url": "",
                "Path": "",
                "Server": "",
                "DownloadUrlFormat": ""
            },
            "Exercise": {
                "Summary": "这里是考试说明预留字段",
                "CompletionSeconds": mine.duration,
                "QuestionCount": mine.questionCount,
                "Score": mine.totalScore,
                "Title": mine.name,
                "ExerciseType": 2,
                "Mode": 2
            },
            "UserExam": {
                "AnswersData": answersData, //answersData,
                "AnalysisData": analysisData,
                "UserExamStatus": mine.status // 用户考试状态
            },
            "EventCallbacks": {
                "onStarted": function () {
                    store.progress(mine.examId);
                },
                "onSubmited": function () {
                    store.progress(mine.examId);
                },
                //加入错题本回调
                "onErrorButtonClick": function (data) {
                    var url = wrongQuestionUrl + '/v1/wrong_questions';
                    return $.ajax({
                        url: url,
                        dataType: 'JSON',
                        type: 'POST',
                        data: JSON.stringify(data)
                    });
                },
                //是否加入错题本回调
                "checkAddQuestionBank": function (questionId) {
                    var url = wrongQuestionUrl + '/v1/wrong_questions/users/' + userId + '/questions/' + questionId;
                    return $.ajax({
                        url: url,
                        dataType: 'JSON',
                        type: 'GET',
                        cache: false
                    });
                }
            },
            "controlOptions": {
                "enableQuestionBank": false,
                "showErrorButton": true,
                "showGotoLearnButton": false,     // 是否显示去学习按钮
                "showQuizButton": false
            },
            /*对接错题本传入数据*/
            "wrongBookParams": {
                "question_id": "",//作答组件内部去获取
                "session_id": mine.sessionId,
                "user_id": userId,
                "source": {
                    "component": "course",
                    "value": "",
                    "label": currentChapterTitle ? courseTitle + ">" + currentChapterTitle + ">" + resourceTitle : courseTitle + ">" + resourceTitle
                },
                "is_wrong": false
            }
        };
    }

    function play(mine, exam, answersData, analysisData) {
        var config = init(mine, exam, answersData, analysisData);
        window.require.config({
            baseUrl: staticUrl
        });
        window.require(['learning.exercise.answer', 'studying.exercise.answer'], function (learning, studying) {
            var main = null;
            if (exam[0].paperLocation == 4)
                main = new studying.Studying.ExerciseAnswer();
            else
                main = new learning.Learning.ExerciseAnswer();

            /*修改config中的wrongBookParams对象*/
            if (chapterId && sectionId) {
                config.wrongBookParams.source.value = "course:" + courseId + ".cloud_course:" + unitId + ".cloud_chapter:" + chapterId + ".cloud_chapter:" + sectionId + ".exercise:" + resourceUuid;
            } else if (chapterId && !sectionId) {
                config.wrongBookParams.source.value = "course:" + courseId + ".cloud_course:" + unitId + ".cloud_chapter:" + chapterId + ".exercise:" + resourceUuid;
            } else {
                config.wrongBookParams.source.value = "course:" + courseId + ".cloud_course:" + unitId + ".exercise:" + resourceUuid;
            }

            main.init(config);

            var status = main.store.data.UserExam.UserExamStatus;

            if (status == 4) {
                main.store.data.Exercise.Mode = 2;
                main.store.prepare().done(function (data) {
                    main.store.start();
                    $("#examPrepare").hide();
                });
            } else if (status == 112) {
                main.store.data.Exercise.Mode = 2;
                main.store.start();
            } else if (status == 8) {
                main.store.data.Exercise.Mode = 2;
                main.store.continueAnswer();
            } else if (status == 32 || status == 96 || status == 64) {

                main.store.data.Exercise.Mode = 3;
                main.store.viewAnalysis();
            }
            exam[0].paperLocation == 4 ? $.studying.loading.hide() : $.learning.loading.hide();
        });
    }

    var store = {
        getExamInfo: function (examId) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + "/v1/exams/" + examId,
                async: true,
                cache: false,
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
        },
        getMyExamInfo: function (examId) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
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
        },
        getUserQuestionAnswers: function (examId, sessionId, qids) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
                type: "get",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                data: {
                    qid: qids
                },
                contentType: "application/json;",
                async: false,
                traditional: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        },
        getQuestionAnalysis: function (examId, sessionId, qids) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId + "/analysis",
                type: "get",
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                data: {
                    qid: qids
                },
                contentType: "application/json;",
                async: false,
                traditional: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
                }
            });
        },
        progress: function (examId) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/exercises/' + examId + '/progress' + ((window.resourceType == 101 || window.resourceType == 102 || window.resourceType == 103) ? "?v=2" : ""),
                type: "POST",
                success: viewModel.success
            })
        }
    };

    var viewModel = {
        play: function (examId) {
            $.learning.loading.show();

            $.when(store.getExamInfo(examId), store.getMyExamInfo(examId)).done(function (examData, mineData) {
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
                    analysisData = [];

                play(data, examData, answersData, analysisData);

            }).fail(function (failData) {
                var message = JSON.parse(failData.responseText);
                window.console && console.log(message);
            }).always(function () {
                $.learning.loading.hide();
            });

        }
    };

    exports.viewModel = viewModel;
});