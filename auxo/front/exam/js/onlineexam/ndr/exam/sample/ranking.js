(function($) {
    require.config({
        baseUrl: staticurl
    });
    require(["studying.exam.factory", "studying.ranking"], function (factory, ranking) {
        var languageVarl;
        if(language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        }
        else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        var config = {
            "host": {
                "mainHost": "http://" +  window.location.host + selfUrl + "/" + projectCode,  // 必填，测评组件API地址
            },
            "data": {
                "examId": examId,                                                   // 必填，考试标识
                "userId": userId,                                                   // 必填，当前登陆用户标识
                "language": language,                                               // 可空，默认值"zh-CN", 当前系统语言
                "tokenConfig": {
                    "needToken": false,                                             // 必填，是否需要传递授权TOKEN。
                    "onGetToken": function () {

                    }                                                               // 可空，默认值function() {}，如果needToken值为true时该回调必须
                }
            },
            "i18n": languageVarl                                                    // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示 
        };
        
        var bussiness = factory.Studying.ExamBussinessFactory.CreateRankingPage(config);
        bussiness.init();
    });
}(jQuery));