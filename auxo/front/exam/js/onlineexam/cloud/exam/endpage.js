(function ($) {
    document.title = "考试结束页";
    require.config({
        baseUrl: staticurl
    });
    require(['learning.exam.answer', 'learning.end'], function (v, p) {
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

        //根据customType获取对应的url
        function getSeeTips(val, data) {
            switch (val) {
                case 'business_course':
                    return courseWebFront + "/" + projectCode + '/course/' + data.customId;
                    break;
                case 'businesscourse_2':
                    return businessCourseGatewayUrl + "/" + projectCode + '/course/' + data.customId;
                    break;
                case 'auxo-train':
                    return trainWebFront + "/" + projectCode + '/train/' + data.customId;
                    break;
                case 'auxo-exam-center':
                    return examWebfrontUrl + '/' + projectCode + '/' + (data.offlineExam ? 'exam/offline_exam' : 'exam') + '/prepare' + (data.offlineExam ? '?tmpl_id=' : '/') + data.customId + (data.offlineExam ? '&location_source=' : '?location_source=') + (data.paperLocation ? data.paperLocation : 1);
                    break;
            }
        }

        var languageVarl; // = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        if (language == "zh_cn" || language == 'en_us') {
            languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
        } else {
            languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
        }
        var global_config = window.G_CONFIG && JSON.parse(base64_decode(window.G_CONFIG));
        var pid = global_config.encode_gaea_id;
        var xGaeaId = pid && 'GAEA id="' + pid + '"';

        function checkDisplayRanking() {
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

        $.learning.loading.show();
        $.when($.ajax({
            url: selfUrl +  '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
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
            url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId,
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
        })).done(function (mineDataArray, sessionDataArray) {
            $.learning.loading.hide();
            var mineData = mineDataArray[0],
                sessionData = sessionDataArray[0];
            var urlOrNot = false;
            mineData.beginTime = mineData.beginTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(mineData.beginTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(mineData.beginTime); //mineData.beginTime.insert(mineData.beginTime.indexOf("+") + 2, ":");
            mineData.endTime = mineData.endTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(mineData.endTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(mineData.endTime); //mineData.endTime ? mineData.endTime.insert(mineData.endTime.indexOf("+") + 2, ":") : null;
            if (mineData.userData && mineData.userData.finishTime)
                mineData.userData.finishTime = $.format.toBrowserTimeZone(Date.ajustTimeString(mineData.userData.finishTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(mineData.userData.finishTime); //mineData.userData.finishTime.insert(mineData.userData.finishTime.indexOf("+") + 2, ":");
            if (mineData.userData && mineData.userData.markTime)
                mineData.userData.markTime = $.format.toBrowserTimeZone(Date.ajustTimeString(mineData.userData.markTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(mineData.userData.markTime); //mineData.userData.markTime.insert(mineData.userData.markTime.indexOf("+") + 2, ":");
            if (mineData.userData && mineData.userData.startTime)
                mineData.userData.startTime = $.format.toBrowserTimeZone(Date.ajustTimeString(mineData.userData.startTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(mineData.userData.startTime); //mineData.userData.startTime.insert(mineData.userData.startTime.indexOf("+") + 2, ":");
            if (mineData.userData && mineData.userData.submitTime)
                mineData.userData.submitTime = $.format.toBrowserTimeZone(Date.ajustTimeString(mineData.userData.submitTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(mineData.userData.submitTime); //mineData.userData.submitTime.insert(mineData.userData.submitTime.indexOf("+") + 2, ":");
            if (sessionData.userData.resultUrl) {
                urlOrNot = true;
                var detailUrl = sessionData.userData.resultUrl + "?result_code=" + sessionData.userData.resultCode;
            }

            $('#end').end({
                i18n: languageVarl.exam.end,
                backUrl: "javascript:void(0);",
                rankingUrl: rankingUrl ? rankingUrl : "http://" + window.location.host + selfUrl + "/" + projectCode + "/exam/ranking?exam_id=" + examId,
                rank: rank,
                checkDisplayRanking: checkDisplayRanking,
                title: mineData.name,
                analysisUrl: "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/analysis",
                restartUrl: "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/prepare/" + examId + "?ranking_url=" + (rankingUrl ? rankingUrl : '') + "&custom_data=" + (customData ? encodeURIComponent(customData) : ""),
                customId: mineData.customId,
                customTypeUrl: getSeeTips(mineData.customType, mineData),
                data: {
                    examId: examId, //"d580a136-2f88-475e-b2fc-acc90030ebe7",
                    sessionId: sessionId, //"a4fa8118-d9ab-4c30-b8a6-ad0292d6e702",
                    userData: {
                        answeredCount: sessionData.userData&&sessionData.userData.answeredCount, //0, // 已作答的题目数
                        score: sessionData.userData && sessionData.userData.markTime ? sessionData.userData.score : sessionData.userData.objectiveScore, //mineData.userData.score,//0.0, // 得分，当成绩未出时，值为 0
                        startTime: sessionData.userData.startTime, //"2015-01-01T00:00:00", // 用户开始作答时间
                        finishTime: sessionData.userData.finishTime, //"2015-01-01T00:00:00", // 用户本次作答的标准完成时间
                        submitTime: sessionData.userData.submitTime, //"2015-01-01T00:00:00", // 用户交卷时间
                        markTime: sessionData.userData.markTime, //"2015-01-01T00:00:00", // 用户改卷时间
                        examChance: mineData.userData.examChance, //0 // 剩余考试机会
                        resultText: sessionData.userData.resultText ? sessionData.userData.resultText : '',
                        resultCode: sessionData.userData.resultCode,
                        urlOrNot: urlOrNot,
                        detailUrl: detailUrl,
                        costTimes: sessionData.userData.costTimes
                    },
                    status: mineData.status, //64, // 用户考试状态
                    name: mineData.name, //"zhangchh_dev_0229_5min", // 考试名称
                    questionCount: mineData.questionCount, //10, // 题目总数
                    totalScore: mineData.totalScore, //100, // 总分
                    passingScore: mineData.passingScore, //10, // 合格分数
                    duration: mineData.duration, //300, // 考试时长（秒）
                    beginTime: mineData.beginTime, //"2016-02-01T00:00:00.000+0800", // 考试开始时间
                    endTime: mineData.endTime, //"2016-03-12T00:00:00.000+0800", // 考试结束时间
                    examChance: mineData.examChance, //100, // 剩余考试机会
                    description: mineData.description, //"<pre><span style=\"color:#cc7832;\">bc4ed42c-c4bb-11e5-9fb2-94de80aee9df</span><span style=\"color:#cc7832;\"></span></pre>", // 描述
                    analysisAllowed: mineData.analysisAllowed, //true // 是否可以查看解析
                    subType: mineData.subType,
                    rankingAble: mineData.rankingAble //是否显示排行榜
                }
            });
        });
    });
}(jQuery));