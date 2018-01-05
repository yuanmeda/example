(function ($) {
  document.title = "考试解析页";
  require.config({
    baseUrl: staticurl
  });
  require(['learning.exam.answer', 'learning.prepare'], function (v, p) {
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

    function getUserQuestionAnswers(examId, sessionId, qids, success, error) {
      return $.ajax({
        url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
        type: "POST",
        dataType: "json",
        requestCase: "snake",
        responseCase: "camel",
        enableToggleCase: true,
        // data: {
        //     qid: qids
        // },
        data: JSON.stringify(qids),
        contentType: "application/json;",
        traditional: true,
        cache: false,
        success: success,
        error: error,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
        }
      });
    }

    function getQuestionAnalysis(examId, sessionId, qids, success, error) {
      return $.ajax({
        url: selfUrl  + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId + "/analysis",
        type: "POST",
        dataType: "json",
        requestCase: "snake",
        responseCase: "camel",
        enableToggleCase: true,
        // data: {
        //     qid: qids
        // },
        data: JSON.stringify(qids),
        contentType: "application/json;",
        traditional: true,
        cache: false,
        success: success,
        error: error,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
        }
      });
    }

    var languageVarl; // = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
    if (language == "zh_cn" || language == 'en_us') {
      languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
    } else {
      languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
    }

    $.learning.loading.show();
    $.when($.ajax({
      url: selfUrl + '/' + projectCode + "/v1/exams/" + examId,
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
    })).done(function (examData, mineData) {
      var data = mineData[0],
        examInfo = examData[0];

      if (examInfo.title.length > 0)
        document.title = examInfo.title;

      // examInfo.beginTime = examInfo.beginTime.insert(examInfo.beginTime.indexOf("+") + 2, ":");
      examInfo.beginTime = examInfo.beginTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(examInfo.beginTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(examInfo.beginTime);
      // examInfo.endTime = examInfo.endTime ? examInfo.endTime.insert(examInfo.endTime.indexOf("+") + 2, ":") : null;
      examInfo.endTime = examInfo.endTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(examInfo.endTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(examInfo.endTime);
      // data.beginTime = data.beginTime.insert(data.beginTime.indexOf("+") + 2, ":");
      data.beginTime = data.beginTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(data.beginTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(data.beginTime);
      // data.endTime = data.endTime ? data.endTime.insert(data.endTime.indexOf("+") + 2, ":") : null;
      data.endTime = data.endTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(data.endTime), 'yyyy-MM-dd HH:mm:ss') : null; //Date.ajustTimeString(data.endTime);
      if (data.userData && data.userData.finishTime)
        data.userData.finishTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.finishTime), 'yyyy-MM-dd HH:mm:ss'); //Date.ajustTimeString(data.userData.finishTime); //data.userData.finishTime.insert(data.userData.finishTime.indexOf("+") + 2, ":");
      if (data.userData && data.userData.markTime)
        data.userData.markTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.markTime), 'yyyy-MM-dd HH:mm:ss'); //Date.ajustTimeString(data.userData.markTime); //data.userData.markTime.insert(data.userData.markTime.indexOf("+") + 2, ":");
      if (data.userData && data.userData.startTime)
        data.userData.startTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.startTime), 'yyyy-MM-dd HH:mm:ss'); //Date.ajustTimeString(data.userData.startTime); //data.userData.startTime.insert(data.userData.startTime.indexOf("+") + 2, ":");
      if (data.userData && data.userData.submitTime)
        data.userData.submitTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.submitTime), 'yyyy-MM-dd HH:mm:ss'); //Date.ajustTimeString(data.userData.submitTime); //data.userData.submitTime.insert(data.userData.submitTime.indexOf("+") + 2, ":");

      var answersData = [],
        analysisData = [],
        defs = [];
      // 如果是继续作答或者解析的话需要事先获取到用户已经作答过的答案
      Enumerable.from(data.userData.paper.parts).forEach(function (value, index) {
        var qids = value.questionIdentities;

        defs.push(getUserQuestionAnswers(examId, sessionId, qids, function (answerData) {
          if (answerData && answerData.length > 0)
            answersData = answersData.concat(answerData);
        }, function (failData) {
          var response = JSON.parse(failData.responseText);
          var testUrl = "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/exception";
          location.replace(testUrl + "?exam_id=" + examId + "&message=" + response.message);
        }));

        defs.push(getQuestionAnalysis(examId, sessionId, qids, function (returnData) {
          if (returnData && returnData.length > 0)
            analysisData = analysisData.concat(returnData);
        }, function (failData) {
          var response = JSON.parse(failData.responseText);
          var testUrl = "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/exception";
          location.replace(testUrl + "?exam_id=" + examId + "&message=" + response.message);
        }));
      });

      $.when.apply(this, defs).done(function () {
        $.learning.loading.hide();

        var config = {
          ElementSelector: '#exam',
          "Host": "http://" + window.location.host + selfUrl + "/" + projectCode,
          "NoteServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode, // 必填，笔记组件API地址
          "QuestionBankServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode, // 必填，题库服务API地址
          CloudUrl: cloudUrl,
          AccessToken: accessToken,
          ExamId: data.examId, //'0a7f501f-987b-4802-8c22-080225dbc7f5',
          SessionId: sessionId,
          //CurrentQuestionId: 14825, // 当前跳转到第几题
          View: -1,
          QuestionScoreDict: {},
          Batches: [],
          Cells: [],
          Answers: [],
          ViewMode: 2, // 1、作答, 2、解析
          Attachement: {
            Session: "",
            Url: "",
            Path: "",
            Server: "",
            DownloadUrlFormat: ""
          },
          Paper: {
            "Summary": "这里是考试说明预留字段",
            "CompletionSeconds": data.duration,
            "QuestionCount": data.questionCount,
            "Score": data.totalScore,
            "Title": data.name
          },
          Exam: {
            "Id": examInfo.id,
            "Name": examInfo.title,
            "LimitSeconds": examInfo.duration * 1000, // 单位毫秒
            "BeginTime": new Date(examInfo.beginTime).getTime(), //new Date(new Date().getTime() + 600000).getTime(), // 单位毫秒
            "EndTime": new Date(examInfo.endTime).getTime(), //new Date('2016/03/26 23:00:00').getTime(), //// 单位毫秒
            "Mode": 3,
            "PassScore": examInfo.passingScore,
            "Summary": examInfo.description ? examInfo.description : "",
            "Chance": data.examChance, // 考试机会
            "ExamResultPageUrl": "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/end?language=" + language, // 考试结束后要跳转的页面
            "UploadAllowed": examInfo.uploadAllowed,
            "SubType": examInfo.subType
          },
          UserExam: {
            "AnswersData": answersData,
            "AnalysisData": analysisData,
            "UserExamStatus": data.status, // 用户考试状态
            "BeginTime": data.userData && data.userData.startTime ? new Date(data.userData.startTime).getTime() : 0, //parseInt(new Date().getTime()),
            "AnswerMode": 0,
            "CostSeconds": 0,
            "DoneCount": data.userData && data.userData.answeredCount ? data.userData.answeredCount : 0
          },
          Parts: [],
          PartTitles: [],
          i18n: languageVarl,
          "controlOptions": {
            "enableQuestionBank": false
          }
        };

        var main = new v.Learning.ExamAnswer(config);
        $.learning.loading.show();
        main.init(config);
        main.store.viewAnalysis().done(function (data) {
          $.learning.loading.hide();
          $("#examPrepare").hide();
          $("#exam").show();
        });
      });
    }).fail(function (failData) {
      var message = JSON.parse(failData.responseText);

      var testUrl = "http://" + window.location.host + selfUrl +  '/' + projectCode + "/exam/exception";
      location.replace(testUrl + "?exam_id=" + examId + "&message=" + message.message);
    });
  });
}(jQuery));
