(function($) {
    require.config({
        baseUrl: staticurl
    });
    require(['learning.exam.answer', 'learning.exception'], function (v, p) {
        //根据QueryString参数名称获取值
        function getQueryStringByName(name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        }

        String.prototype.insert = function (ofset, subStr) {
            if (ofset < 0 || ofset >= this.length - 1) {
                return this.append(subStr);
            }
            return this.substring(0, ofset + 1) + subStr + this.substring(ofset + 1);
        };

        var languageVarl;// = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        if(language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        }
        else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }

        $("#exception").exception({
            backUrl: "javascript:void(0);",
            message: "<span class='fail-message'>" + decodeURIComponent(message) + languageVarl.exam.exception.message,
            i18n: {
                back: languageVarl.exam.exception.back
            }
        });
    });
}(jQuery));