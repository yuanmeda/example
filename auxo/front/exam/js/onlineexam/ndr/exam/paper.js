(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(['studying.exam.answer', 'studying.prepare', 'studying.enum'], function (v, p, _enum) {
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

        var returnUrl = decodeURIComponent(getQueryStringByName('return_url'));
        var languageVarl;
        if (language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        } else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        var global_config = window.G_CONFIG && JSON.parse(base64_decode(window.G_CONFIG));
        var pid = global_config.encode_gaea_id;
        var xGaeaId = pid && 'GAEA id="' + pid + '"';
        /*添加收藏*/
        function addFavorites(data) {
            var url = assistUrl + '/v1/favorites';
            return $.ajax({
                url: url,
                type: 'POST',
                contentType: "application/json",
                dataType: 'text',
                data: JSON.stringify(data),
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', Nova.getMacToken('POST', "/v1/favorites", assistUrl.split('//')[1]));
                    xhr.setRequestHeader('X-Gaea-Authorization', xGaeaId);
                }
            });

        }

        /*删除收藏*/
        function deleteFavorites(data) {
            var url = assistUrl + '/v1/favorites/' + data.source_type + "/" + data.source_id;
            return $.ajax({
                url: url,
                type: 'DELETE',
                contentType: "application/json",
                dataType: 'text',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', Nova.getMacToken('DELETE', "/v1/favorites/" + data.source_type + "/" + data.source_id, assistUrl.split('//')[1]));
                    xhr.setRequestHeader('X-Gaea-Authorization', xGaeaId);
                }
            });
        }

        /*查询收藏状态*/
        function checkFavorites(data) {
            var url = assistUrl + '/v1/sources';
            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                contentType: "application/json",
                data: JSON.stringify(data) || null,
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', Nova.getMacToken('POST', "/v1/sources", assistUrl.split('//')[1]));
                    xhr.setRequestHeader('X-Gaea-Authorization', xGaeaId);
                }
            });
        }

        function getUserQuestionAnswers(examId, sessionId, qids, success) {
            return $.ajax({
                url: selfUrl + '/' + projectCode + "/v2/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
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

        function checkDisplayRanking(){
            return $.ajax({
                url: recommendUrl + '/v1/recommends/kvs/display_ranking',
                type: 'GET',
                contentType: "application/json",
                dataType: 'JSON',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', Nova.getMacToken('GET', "/v1/recommends/kvs/display_ranking", recommendUrl.split('//')[1]));
                    xhr.setRequestHeader('X-Gaea-Authorization', xGaeaId);
                }
            })
        }

        function getExamActionRules(data) {
            var url =webfrontServiceDomain + '/' + projectCode + '/exam/exams/action_rules';
            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                contentType: "application/json",
                data: JSON.stringify(data) || null,
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', Nova.getMacToken('POST','/' + projectCode + '/exam/exams/action_rules',  webfrontServiceDomain.split('//')[1]));
                    xhr.setRequestHeader('X-Gaea-Authorization', xGaeaId);
                }
            });
        }

        function getOralConfig(examId, success) {
            var url = '/' + window.projectCode + '/v1/exams/' + window.examId + '/oral_config';
            return $.ajax({
                url: url,
                success: success
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
            enableToggleCase: true,
            cache: false,
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
            }
        })).done(function (examData, mineData) {
            var data = mineData[0],
                examInfo = examData[0];

            examInfo.beginTime = examInfo.beginTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(examInfo.beginTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(examInfo.beginTime);
            examInfo.endTime = examInfo.endTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(examInfo.endTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(examInfo.endTime);
            data.beginTime = data.beginTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(data.beginTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(data.beginTime);
            data.endTime = data.endTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(data.endTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(data.endTime);
            if (data.userData && data.userData.finishTime)
                data.userData.finishTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.finishTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(data.userData.finishTime);
            if (data.userData && data.userData.markTime)
                data.userData.markTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.markTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(data.userData.markTime);
            if (data.userData && data.userData.startTime)
                data.userData.startTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.startTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(data.userData.startTime);
            if (data.userData && data.userData.submitTime)
                data.userData.submitTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.submitTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(data.userData.submitTime);
            isInClient = window.getIPAddres? '1': '0';
            var examToolType = examInfo.examToolType;
            if (examToolType == 1 && isInClient == '1') {
                //客户端打开，验证IP
                var currentIP = window.getIPAddres();
                var actionRule = {
                    "action": "exam_access",
                    "params": {
                        "exam_id": data.examId,
                        "ip": currentIP
                        // "ip":"IU2LBNgWabKMJdDH8NWgOYQuj0xFGqvBFUCNb+FYBaM="
                    }
                };
                getExamActionRules(actionRule).done(function (actionRes) {
                    if (actionRes && actionRes.result) {
                        loadPrepare();
                    } else {
                        //IP黑名单，跳转error page
                        location.href = '/' + projectCode + '/exam/client/error?title=' + examInfo.title;
                    }
                })
            } else {
                loadPrepare();
            }
            function loadPrepare() {
                var answersData = [],
                    defs = [],
                    qids = [],
                    scores = [],
                    oralConfig = null;
                // 如果是继续作答或者解析的话需要事先获取到用户已经作答过的答案
                if (data.status == 8 && data.userData) {
                    Enumerable.from(data.userData.ndrPaper.item.testParts[0].assessmentSections).forEach(function (value, index) {
                        qids = qids.concat($.map(value.sectionParts, function (spv, spi) {
                            scores.push({
                                "id": spv.identifier,
                                "scores": spv.scores
                            });

                            return spv.identifier;
                        }));
                    });
                    defs.push(getUserQuestionAnswers(data.examId, data.sessionId, qids, function (answerData) {
                        if (answerData && answerData.length > 0)
                            answersData = answersData.concat(answerData);
                    }));
                }

                defs.push(getOralConfig(data.examId, function(data) {
                    oralConfig = data;
                }))

                $.when.apply({}, defs).done(function () {
                    $.studying.loading.hide();

                    var config = {
                        ElementSelector: '#exam',
                        "Host": "http://" + window.location.host + selfUrl + "/" + projectCode,
                        "NoteServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode, // 必填，笔记组件API地址
                        "QuestionBankServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode, // 必填，题库服务API地址
                        "UserId": window.userId,
                        StaticHost: staticurl,
                        CloudUrl: cloudUrl,
                        LCGatewayUrl: 'http://elearning-resource-gateway.dev.web.nd',
                        AccessToken: accessToken,
                        ExamId: data.examId,
                        SessionId: data.sessionId,
                        CustomData: customData,
                        LocationSource: locationSource,
                        RankingUrl: rankingUrl ? rankingUrl : "",
                        View: -1,
                        QuestionScoreDict: scores,
                        Batches: [],
                        Cells: [],
                        Answers: [],
                        ViewMode: 1, // 1、作答, 2、解析
                        Language: language,
                        "TokenConfig": {
                            "NeedToken": false,
                            "OnGetToken": function (data) {
                            },
                        },
                        EventCallbacks: {
                            onAnswerSaved: function (answerData) {
                                window.console && console.log('onAnswerSaved');
                            },
                            "onNumberChanged": function () {
                                window.console && console.log('onNumberChanged');
                            }
                        },
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
                            "LimitSeconds": examInfo.duration ? examInfo.duration * 1000 : null, // 单位毫秒
                            "BeginTime": new Date(examInfo.beginTime).getTime(), // 单位毫秒
                            "EndTime": examInfo.endTime ? new Date(examInfo.endTime).getTime() : _enum.Studying.ConstValue.MaxExamEndTime,
                            "Mode": 1,
                            "PassScore": examInfo.passingScore,
                            "Summary": examInfo.description ? examInfo.description.replace(/\$\{cs_host}/gim, servelUrl) : "",
                            "Chance": examInfo.examChance, // 考试机会
                            "ExamResultPageUrl": returnUrl ? returnUrl : "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/end", // 考试结束后要跳转的页面
                            "EnrollType": examInfo.enrollType,
                            "UploadAllowed": examInfo.uploadAllowed,
                            "SubType": examInfo.subType,
                            "rankingAble": examInfo.rankingAble,
                            "EnrollUrl": getEnrollUrl(data.examId, location.href),
                            "SubjectiveMarkStrategy": examInfo.subjectiveMarkStrategy,
                            "examToolType": examInfo.examToolType
                        },
                        UserExam: {
                            "AnswersData": answersData,
                            "UserEnroll": data.userEnroll,
                            "AnalysisData": [],
                            "UserExamStatus": data.status, // 用户考试状态
                            "BeginTime": data.userData && data.userData.startTime ? new Date(data.userData.startTime).getTime() : 0,
                            "AnswerMode": 0,
                            "CostSeconds": 0,
                            "DoneCount": data.userData && data.userData.answeredCount ? data.userData.answeredCount : 0,
                            "MaxScore": data.maxUserData && data.maxUserData.submitTime ? data.maxUserData.score : undefined,
                            "resultCode": data.lastUserData && data.lastUserData.resultCode ? (data.lastUserData.resultCode.length > 10 ? data.lastUserData.resultCode.substr(0, 10) + "..." : data.lastUserData.resultCode) : "",
                            "HistoryAble": data.historyAble
                        },
                        Parts: [],
                        PartTitles: [],
                        i18n: languageVarl,
                        "controlOptions": {
                            "enableQuestionBank": false
                        }
                    };

                    var main = new v.Studying.ExamAnswer(config);
                    $("#examPrepare").examPrepare({
                        showOralBtn: oralConfig ? oralConfig.test_audio_device : false,
                        examId: config.ExamId,
                        bestScore: config.UserExam.MaxScore,
                        historyScoreUrl: "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/history?exam_id=" + examId + '&location_source=' + locationSource, // 历史成绩页面链接
                        historyAble: config.UserExam.HistoryAble,
                        rankingUrl: rankingUrl ? rankingUrl : "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/ranking?exam_id=" + examId,
                        rank: rank,
                        checkDisplayRanking: checkDisplayRanking,
                        customData: customData,
                        // 剩余考试次数
                        remainingTryTimes: data.examChance,
                        // 考试机会
                        examChance: config.Exam.Chance,
                        // 是否显示解析连接
                        analysisCondStatus: examInfo.analysisCondStatus,
                        analysisCondata: examInfo.analysisCondData,
                        // 考试详细说明
                        examDetail: config.Exam.Summary,
                        //题目总数
                        quCount: config.Paper.QuestionCount,
                        // 总分
                        score: config.Paper.Score,
                        // 通过分数
                        passScore: config.Exam.PassScore,
                        // 考试时长（分钟）
                        completionSeconds: config.Paper.CompletionSeconds ? config.Paper.CompletionSeconds / 60 : null,
                        userExamStatus: config.UserExam.UserExamStatus,
                        examMode: config.Exam.Mode,
                        // 考试结束时间
                        examBeginTime: config.Exam.BeginTime,
                        // 考试结束时间
                        examEndTime: config.Exam.EndTime,
                        // 本次考试结束时间
                        leavetime: config.Exam.LimitSeconds ? (config.UserExam.BeginTime == 0 ? config.Exam.EndTime : (config.UserExam.BeginTime + config.Exam.LimitSeconds > config.Exam.EndTime ? config.Exam.EndTime : config.UserExam.BeginTime + config.Exam.LimitSeconds)) : null,
                        // back: "/" + config.ProjectDomain + "/" + config.TargetId + "/user/exam",
                        title: config.Paper.Title,
                        i18n: languageVarl.exam.prepare,
                        //考试报名设置
                        enrollType: config.Exam.EnrollType,
                        //考试类型
                        subType: config.Exam.SubType,
                        //用户报名状态
                        userEnrollType: config.UserExam.UserEnroll ? config.UserExam.UserEnroll.userEnrollType : null,
                        opinion: config.UserExam.UserEnroll ? config.UserExam.UserEnroll.opinion : null,
                        resultCode: config.UserExam.resultCode,
                        rankingAble: config.Exam.rankingAble,
                        //是否显示收藏按钮(暂时给定，随后与服务端联调)
                        showFavorite: !!(!window.SWITCHES || (window.SWITCHES && window.SWITCHES['switch.assist.fav'])),
                        examToolType: config.Exam.examToolType,
                        isInClient: isInClient ? (isInClient == '1' ? true : false) : false,
                        clientPrepareUrl: 'http://' + window.location.host + '/' + projectCode + '/exam/clientprepare/' + examId + '?language=' + language,
                        favoriteHander: {
                            addFavorites: addFavorites,
                            deleteFavorites: deleteFavorites,
                            checkFavorites: checkFavorites,
                            enableFavorite: true, // 是否启动收藏功能
                        },
                        onUpdateStatus: function () {
                            var that = this;
                            window.setTimeout(function () {
                                $.ajax({
                                    url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
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
                                }).done(function (mineData) {
                                    that.updateOptionData(mineData);
                                })
                            }, 2000);
                        },
                        enrollExam: function () {
                            var that = this;
                            location.href = getEnrollUrl(data.examId, location.href);
                        },
                        onDetection: function() {
                            window.open("https://" + window.location.host + selfUrl + "/" + projectCode + "/exam/detection/play")
                        },
                        start: function (e, mode) {
                            //mode 开始作答1; 继续作答 2
                            switch (mode) {
                                case 1:
                                    $("#examPrepare").hide();
                                    $.studying.loading.show();
                                    main.init(config);
                                    if (main.store.data.UserExam.UserExamStatus != 112) {
                                        main.store.prepare(config.CustomData).done(function (data) {
                                            $.studying.loading.hide();
                                            main.store.start();
                                            // $("#examPrepare").hide();
                                        }).fail(errorHandler);
                                    } else {
                                        $.studying.loading.hide();
                                        main.store.start();
                                        // $("#examPrepare").hide();
                                    }
                                    break;
                                case 2:
                                    $("#examPrepare").hide();
                                    $.studying.loading.show();
                                    main.init(config);
                                    main.store.continueAnswer().done(function (data) {
                                        $.studying.loading.hide();
                                        // $("#examPrepare").hide();
                                    }).fail(errorHandler);
                                    break;
                            }
                        },
                        end: function () {
                            main.dofinish(true, true);
                        }
                    });
                });
            }
        }).fail(errorHandler);

        function errorHandler(failData) {
            var message = JSON.parse(failData.responseText);

            var testUrl = "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/exception";
            location.replace(testUrl + "?exam_id=" + examId + "&message=" + message.message);
        }
    });
}(jQuery));
