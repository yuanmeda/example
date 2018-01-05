(function ($) {
    document.title = "历史成绩页";
    require.config({
        baseUrl: staticurl
    });
    require(["learning.exam.factory", "learning.history"], function (factory, history) {
        var languageVarl;
        if (language == "zh_cn" || language == 'en_us')
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        else
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];

        var config = {
            "i18n": languageVarl,                                                                             // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
            "host": {
                "mainHost": "http://" + window.location.host + selfUrl + "/" + projectCode,                             // 必填，测评组件API地址
                "analysisUrl": 'http://' + window.location.host + selfUrl + "/" + projectCode + '/exam/analysis',       // 必填，解析页面地址
                "examResultUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/end"           // 必填，结果页地址
            },
            "data": {
                "element": "#history",                                                                        // 可空，默认值“#history”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。 
                "examId": examId,                                                                             // 必填，考试标识
                "userId": userId,                                                                             // 必填，当前登陆用户标识
                "language": language,                                                                         // 可空，默认值“zh-CN”。当前系统的语言
                "locationSource": 4,                                                                          // 可空，默认值 4，试卷来源
                "tokenConfig": {
                    "needToken": false,                                                                       // 必填，是否需要传递授权TOKEN。
                    "onGetToken": function () { }                                                             // 可空，默认值function() {}，如果needToken值为true时该回调必须
                }
            }
        };
        var bussiness = factory.Learning.ExamBussinessFactory.CreateHistoryPage(config);
        bussiness.init();
    });
}(jQuery));