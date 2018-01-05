(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(['learning.exam.factory', 'learning.prepare'], function (factory, prepare) {
        var languageVarl;
        if (language == "zh_cn" || language == 'en_us')
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        else
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];


        var config = {
            "host": {
                "mainHost": "http://" + window.location.host + selfUrl +  "/" + projectCode,                         // 必填，测评组件API地址
                "noteServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode,                  // 必填，笔记组件API地址
                "questionBankServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode,          // 必填，题库服务API地址
                "errorUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/exception",     // 必填，初始化过程中发生流程错误是用户显示错误信息的页面，值为完整的URL地址
                "rankingUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/ranking"      // 可空，排行榜地址,
            },
            "envConfig": {
                "examId": examId,                                                                         // 必填，当前考试标志。
                "userId": userId,                                                                         // 必填，当前登陆用户的标志，用于笔记组件。
                "sessionId": sessionId,
                "i18n": languageVarl,                                                                     // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
                "element": "#exam",                                                                       // 可空，默认值“#exercise”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。 
                "prepareElement": "#examPrepare",                                                         // 准备页面需要渲染到哪个DOM元素下，值为jQuery选择符。 可空，默认值“#examPrepare”
                "language": language,                                                                     // 可空，默认值“zh-CN”。当前系统的语言。
                "locationSource": locationSource,
                "displayOptions": {
                    "hideNavigator": false,                                                               // 可空，默认值 false。是否隐藏答题卡。 
                    "disableNavigatorJump": false,                                                        // 可空，默认值 false。点击答题卡题目时是否允许定位到该题目。
                    "showRank": true,                                                                     // 是否显示排行榜
                    "showQuestionNum": true                                                               // 是否隐藏题目编号，默认值为true
                },
                "tokenConfig": {
                    "needToken": false,                                                                   // 必填，是否需要传递授权TOKEN。
                    "onGetToken": function () { }                                                         // 可空，默认值function() {}，如果needToken值为true时该回调必须
                }
            },
            "eventCallBack": {
                "onAnswerSaved": function (data) {
                    window.console && console.log(JSON.stringify(data));
                },                                                                                       // 可空，默认值 function() {}。答案保存成功后的回调。
                "onAnswerChange": function (data) {
                    window.console && console.log(JSON.stringify(data));
                }                                                                                        // 可空，默认值 function() {}。答案发生变更时的回调。
            }
        }

        var bussiness = factory.Learning.ExamBussinessFactory.CreateAnalysisPaperModeExam(config);
        bussiness.init();
    });
}(jQuery));