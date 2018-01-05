(function($) {
    require.config({
        baseUrl: staticurl
    });
    require(['studying.exam.answer', 'studying.ranking'], function (v, p) {
        var languageVarl;// = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        if(language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        }
        else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        $("#ranking").ranking({
            host: "http://" + location.host + (selfUrl ? selfUrl : "") + "/" + projectCode,
            // projectCode: projectCode,
            examId: examId ,
            userId: userId,
            language: language,
            i18n: languageVarl.exam.ranking
        });
    });
}(jQuery));