(function ($) {
    require.config({
        baseUrl: staticurl
    });
    require(["studying.exam.factory"], function (factory) {
        var languageVarl;
        if (language == "zh_cn" || language == 'en_us')
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        else
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];

        var config = {
            "host": {
                "mainHost": window.exam_api_url,                                                                // 必填，测评组件API地址
                "resourceGatewayHost": window.resource_gateway_url,                                             // 必填，资源网关API地址
                "answerGatewayHost": window.answer_api_url,                                                     // 必填
                "markApiHost": window.mark_api_url                                                              // 必填
            },
            "envConfig": {
                "sessionId": window.sessionId,                                                        // 必填，当前会话标识
                "macKey": TokenUtils.getMacKey(),                                                     // 必填，mac_key
                "userId": TokenUtils.getUserId(),                                                     // 必填，当前登陆用户的标志，用于笔记组件。
                "i18n": languageVarl,                                                                 // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
                "element": "#analysis",                                                               // 可空，默认值“#exercise”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。
                "language": language,                                                                 // 可空，默认值“zh-CN”。当前系统的语言。
                "currentQuestionId": "",                                                              // 5.4.2 初始化后的第一道题目
                "displayOptions": {
                    "hideTimer": false,                                                               // 可空，默认值 false。是否隐藏计时器。
                    "hideNavigator": false,                                                           // 可空，默认值 false。是否隐藏答题卡。
                    "disableNavigatorJump": false,                                                    // 可空，默认值 false。点击答题卡题目时是否允许定位到该题目。
                    "disablePreButton": false,                                                        // 5.4.2 默认值为false, 为true时，“上一题”按钮不显示。
                    "disableNextButton": false,                                                       // 默认值为false, 为true时，“下一题”按钮不显示。
                    "showQuestionNum": true,                                                          // 是否隐藏题目编号，默认值为true
                    "enableQuestionBank": false,                                                      // 是否启用题库服务, 默认值为true
                    "showGotoLearnButton": false,                                                     // 是否显示去学习按钮，默认值为false
                    "showQuizButton": false,                                                          // 是否显示去提问按钮，默认值为false
                    "autoHidePrev": false,                                                            // 是否自动隐藏上一题按钮, 默认值为false
                    "autoHideNext": false,                                                             // 是否自动隐藏下一题按钮,默认值为false
                    "showMark": true
                },
                "answerOptions": {
                    "forceToAnswer": false                                                            // 5.4.2, 可空，默认为false,为true时用户只有在答完所有题目时才允许提交。
                },
                "tokenConfig": {
                    "needToken": true,                                                                // 必填，是否需要传递授权TOKEN。
                    "onGetToken": function (context) {
                        return {
                            "Authorization": TokenUtils.getMacToken(context.method, context.path, context.host),
                            "X-Gaea-Authorization": TokenUtils.getGaeaId()
                        };
                    }                                                                                 // 可空，默认值function() {}，如果needToken值为true时该回调必须
                }
            },
            "eventCallBack": {
                "onAnswerSaved": function (data) {
                    // window.console && console.log(JSON.stringify(data));
                },                                                                                    // 可空，默认值 function() {}。答案保存成功后的回调。
                "onAnswerChange": function (data) {
                    // window.console && console.log(JSON.stringify(data));
                },                                                                                    // 可空，默认值 function() {}。答案发生变更时的回调。
                "onNumberChanged": function (questionId, questionAnswerStatus) {
                    window.console && console.log('onNumberChanged:' + questionId + ":" + questionAnswerStatus);
                },                                                                                    // 5.4.2做题过程中可以接收外部的事情 返回参数为question Id，和答题状态作答状态 [0: Undo 未做, 1: Done 有做题（未评分）, 5: Correct 完全正确, 7: Wrong 错误，非全部正确, 9: Invalid 无效的答案] null: 未知
                "onNextButtonClick": function (context, questionId, questionAnswerStatus) {
                    // console.log('onNextButtonClick:'+ questionId + ":" + questionAnswerStatus);//questionId 当前题目ID， 当前题目的答案状态 [0: Undo 未做, 1: Done 有做题（未评分）, 5: Correct 完全正确, 7: Wrong 错误，非全部正确, 9: Invalid 无效的答案， null: 未知]
                    // context.nextQuestionId="1e752bd0-4a3e-4692-ae34-0666044c3abf"; // 下一题时跳转的题目ID
                    // context.jumpToNextQuestion = true; // 点击下题的时候是否跳转
                },
                "onLearnButtonClick": function () {
                    console.log("onLearnButtonClick");
                },                                                                                    // 去学习按钮点击事情回调。可空，默认值function(){}
                "onQuestionButtonClick": function () {
                    console.log("onQuestionButtonClick")
                },                                                                                    // 提问按钮可空，默认值function(){}
                "onSubmitCallBack": function () {

                },
                "onRenderComplete": function() {
                    console.log("onRenderComplete")
                },                                                                                    // 题目显示完成过后的回调，默认值function(){}  
                "onTimerElapsed": function() {

                }                                                                                   
            }
        }

        var bussiness = factory.Studying.ExamBussinessFactory.CreateSingleModeExam(config);
        bussiness.init();
        $("#analysis").show();
        // bussiness.end();
    });
}(jQuery));