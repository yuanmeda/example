(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(["learning.exercise.factory"], function (factory) {
        var languageVarl;
        if (language == "zh_cn" || language == 'en_us')
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        else
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];

        var config = {
            "host": {
                "mainHost": "http://" + window.location.host + "/" + projectCode,                     // 必填，测评组件API地址。
                "noteServiceHost": "http://" + window.location.host + "/" + projectCode,              // 必填，笔记组件API地址
                "questionBankServiceHost": "http://" + window.location.host + "/" + projectCode,      // 必填，题库服务API地址
                "errorUrl": "http://" + window.location.host + "/" + projectCode + "/exam/exception",  // 必填，初始化过程中发生流程错误是用户显示错误信息的页面，值为完整的URL地址
                "returnUrl": 'https://www.baidu.com'                                                            //非必真，点击提交后的跳转地址
            },
            "envConfig": {
                "examId": examId,                                                                     // 必填，当前考试标志。
                "userId": userId,                                                                     // 必填，当前登陆用户的标志，用于笔记组件。
                "i18n": languageVarl,                                                                 // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
                "element": "#exercise",                                                               // 可空，默认值“#exercise”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。 
                "language": language,                                                                 // 可空，默认值“zh-CN”。当前系统的语言。
                "currentQuestionId": '1325186a-f2ae-4049-95e2-c28dd8c60fdd',                          // 5.4.2 初始化后的第一道题目
                "displayOptions": {
                    "hideNavigator": false,                                                           // 可空，默认值 false。是否隐藏答题卡。 
                    "disableNavigatorJump": false,                                                    // 可空，默认值 false。点击答题卡题目时是否允许定位到该题目。
                    "disablePreButton": false,                                                        // 5.4.2 默认值为false, 为true时，“上一题”按钮不显示。
                    "enableQuestionBank": true
                },
                "answerOptions": {
                    "forceToAnswer": false                                                         // 5.4.2, 可空，默认为false,为true时用户只有在答完所有题目时才允许提交。
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
                "onAnswerSaved": function (data) {
                    // window.console && console.log(JSON.stringify(data));
                },                                                                                   // 可空，默认值 function() {}。答案保存成功后的回调。
                "onAnswerChange": function (data) {
                    // window.console && console.log(JSON.stringify(data));
                },                                                                                   // 可空，默认值 function() {}。答案发生变更时的回调。
                "onNumberChanged": function (questionId, questionAnswerStatus) {
                    // 5.4.2做题过程中可以接收外部的事情 返回参数为question Id，和答题状态作答状态 [0: Undo 未做, 1: Done 有做题（未评分）, 5: Correct 完全正确, 7: Wrong 错误，非全部正确, 9: Invalid 无效的答案] null: 未知
                    window.console && console.log('onNumberChanged:' + questionId + ":" + questionAnswerStatus);
                }
            }
        }

        var bussiness = factory.Learning.ExerciseBussinessFactory.CreateStandardExercise(config);
        bussiness.viewAnalysis();
    });
}(jQuery));