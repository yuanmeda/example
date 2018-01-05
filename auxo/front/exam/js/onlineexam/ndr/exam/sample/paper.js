(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(['studying.exam.factory', 'studying.prepare'], function (factory, prepare) {
        var languageVarl;
        if (language == "zh_cn" || language == 'en_us')
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        else
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        //此注释内容可忽略，以后需要接入收藏时可自行参考启用。
        // /*删除收藏*/
        // function deleteFavorites(data) {
        //     var url = assistUrl + '/v1/favorites/' + data.source_type + "/" + data.source_id;
        //     return $.ajax({
        //         url: url,
        //         type: 'DELETE',
        //         contentType: "application/json",
        //         dataType: 'text',
        //         cache: false,
        //         beforeSend: function (xhr) {
        //             xhr.setRequestHeader('Authorization', Nova.getMacToken('DELETE', "/v1/favorites/" + data.source_type + "/" + data.source_id, assistUrl.split('//')[1]));
        //             xhr.setRequestHeader('X-Gaea-Authorization', xGaeaId);
        //         }
        //     });
        // }
        // /*查询收藏状态*/
        // function checkFavorites(data) {
        //     var url = assistUrl + '/v1/sources';
        //     return $.ajax({
        //         url: url,
        //         type: 'POST',
        //         dataType: 'JSON',
        //         contentType: "application/json",
        //         data: JSON.stringify(data) || null,
        //         cache: false,
        //         beforeSend: function (xhr) {
        //             xhr.setRequestHeader('Authorization', Nova.getMacToken('POST', "/v1/sources", assistUrl.split('//')[1]));
        //             xhr.setRequestHeader('X-Gaea-Authorization', xGaeaId);
        //         }
        //     });
        // }
        //
        // function getUserQuestionAnswers(examId, sessionId, qids, success) {
        //     return $.ajax({
        //         url: '/' + projectCode + "/v2/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
        //         type: "POST",
        //         dataType: "json",
        //         requestCase: "snake",
        //         responseCase: "camel",
        //         enableToggleCase: false,
        //         data: JSON.stringify(qids),
        //         contentType: "application/json;charset=utf-8",
        //         cache: false,
        //         traditional: true,
        //         success: success,
        //         beforeSend: function (xhr) {
        //             xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
        //         }
        //     });
        // }

        var config = {
            "host": {
                "mainHost": "http://" + window.location.host + selfUrl + "/" + projectCode,                          // 必填，测评组件API地址。
                "noteServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode,                   // 必填，笔记组件API地址。
                "questionBankServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode,           // 必填，题库服务API地址。
                "errorUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/exception",      // 必填，初始化过程中发生流程错误是用户显示错误信息的页面，值为完整的URL地址
                "elearningEnrollGatewayHost": elearning_enroll_gateway_url,                                // 必填，报名组件网关地址
                "historyScoreUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/history", // 必填，历史成绩地址,
                "rankingUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/ranking",      // 必填，排行榜地址,
                "returnUrl": "http://" + window.location.host +  selfUrl +"/" + projectCode + "/exam/end"            // 必填，考试提交后的跳转地址
            },
            // 5.4.2
            "favoriteHander": {
                "enableFavorite": false,                                                                   // 是否启动收藏功能
                "addFavorites": null,                                                                      // 添加收藏方法 可为null 格式参考addFavorites
                "deleteFavorites": null,                                                                   // 取消收藏方法 可为null 格式参考deleteFavorites
                "checkFavorites": null                                                                     // 查看收藏状态 可为null 格式参考checkFavorites
            },
            "envConfig": {
                "examId": examId,                                                                          // 必填，当前考试标志。
                "userId": userId,                                                                          // 必填，当前登陆用户的标志，用于笔记组件。
                "i18n": languageVarl,                                                                      // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
                "element": "#exam",                                                                        // 可空，默认值“#exercise”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。 
                "prepareElement": "#examPrepare",                                                          // 准备页面需要渲染到哪个DOM元素下，值为jQuery选择符。 可空，默认值“#examPrepare”
                "language": language,                                                                      // 可空，默认值“zh-CN”。当前系统的语言。
                "locationSource": locationSource,
                "currentQuestionId": '1325186a-f2ae-4049-95e2-c28dd8c60fdd',                               // 5.4.2 初始化后的第一道题目
                "displayOptions": {
                    "hideNavigator": false,                                                                // 可空，默认值 false。是否隐藏答题卡。 
                    "disableNavigatorJump": false,                                                         // 可空，默认值 false。点击答题卡题目时是否允许定位到该题目。
                    "showRank": true,                                                                      // 可空，是否显示排行榜
                    "showQuestionNum": false,                                                              // 是否隐藏题目编号，默认值为true
                    "showGotoLearnButton": true,                                                           // 是否显示去学习按钮，默认值为false
                    "showQuizButton": true,                                                                // 是否显示去提问按钮，默认值为false
                    "showCostTime": true                                                                   // 显示考试计时，默认值为false
                },
                "answerOptions": {
                    "forceToAnswer": false                                                                 // 5.4.2, 可空，默认为false,为true时用户只有在答完所有题目时才允许提交。
                },
                "tokenConfig": {
                    "needToken": false,
                    "onGetToken": function (data) {
                        return {
                            "Authorization": "",
                            "X-Gaea-Authorization": ""
                        }
                    }
                }
            },
            "eventCallBack": {
                "onGetToken": function (data) {
                    window.console && console.log(JSON.stringify(data));                                  // 可空，当envConfig.needToken值为TRUE时，该回调必须有
                },
                "onAnswerSaved": function (data) {
                    window.console && console.log(JSON.stringify(data));
                },                                                                                        // 可空，默认值 function() {}。答案发生变更时的回调。
                "onNumberChanged": function (questionId, questionAnswerStatus) {
                    // 5.4.2做题过程中可以接收外部的事情 返回参数为question Id，
                    // 和答题状态作答状态 [0: Undo 未做, 1: Done 有做题（未评分）, 5: Correct 完全正确, 7: Wrong 错误，非全部正确, 9: Invalid 无效的答案] null: 未知
                    window.console && console.log('onNumberChanged:' + questionId + ":" + questionAnswerStatus);
                },
                "onLearnButtonClick": function () {
                    console.log("onLearnButtonClick");
                },                                                                                    // 去学习按钮点击事情回调。可空，默认值function(){}
                "onQuestionButtonClick": function () {
                    console.log("onQuestionButtonClick")
                }                                                                                     // 提问按钮可空，默认值function(){}
            }
        }

        var bussiness = factory.Studying.ExamBussinessFactory.CreatePaperModeExam(config);
        bussiness.init();
    });
}(jQuery));