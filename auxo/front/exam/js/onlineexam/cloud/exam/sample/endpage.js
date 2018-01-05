(function ($) {
    document.title = "考试结束页";
    require.config({
        baseUrl: staticurl
    });
    require(['learning.exam.factory', 'learning.end'], function (factory, endpage) {
        var languageVarl;
        if (language == "zh_cn" || language == 'en_us')
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        else
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];

        var config = {
            "i18n": languageVarl,                                                                        // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
            "host": {
                "mainHost": "http://" + window.location.host + selfUrl + "/" + projectCode,                        // 必填，测评组件API地址
                "analysisUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/analysis",  // 必填，解析页面地址
                "restartUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/prepare",    // 必填，考试准备页地址
                "rankingUrl": "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/ranking",    // 必填，排行榜地址
            },
            "data": {
                "examId": examId,                                                                        // 必填，考试标识
                "sessionId": sessionId,                                                                  // 必填，会话标识
                "element": "#end",                                                                       // 可空，默认值“#end”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。 
                "language": "zh-CN",                                                                     // 可空，默认值“zh-CN”。当前系统的语言。
                "showRank": false,                                                                       // 可空，是否显示排行榜
                "tokenConfig": {
                    "needToken": false,                                                                  // 必填，是否需要传递授权TOKEN。
                    "onGetToken": function () { }                                                        // 可空，默认值function() {}，如果needToken值为true时该回调必须
                }
            }
        };
        var bussiness = factory.Learning.ExamBussinessFactory.CreateEndPage(config);
        bussiness.init();
    });
}(jQuery));