(function ($) {
  require.config({
    baseUrl: staticurl
  });

  function errorHandler(failData) {
    var message = JSON.parse(failData.responseText);

    var testUrl = "http://" + window.location.host +  selfUrl + '/' + projectCode + "/exam/exception";
    location.replace(testUrl + "?exam_id=" + examId + "&message=" + message.message);
  }

  function getUserQuestionAnswers(examId, sessionId, qids, success) {
    return $.ajax({
      url: selfUrl + '/' + projectCode + "/v2/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
      type: "POST",
      dataType: "json",
      requestCase: "snake",
      responseCase: "camel",
      enableToggleCase: false,
      data: JSON.stringify(qids),
      contentType: "application/json;charset=utf-8",
      cache: false,
      traditional: true,
      success: success,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
      }
    });
  }

  function getExamInfo() {
    return $.ajax({
      url: selfUrl + '/' + projectCode + "/v1/exams/" + examId,
      async: true,
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
    });
  }

  function getMyExamInfo() {
    return $.ajax({
      url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
      type: "get",
      async: true,
      dataType: "json",
      requestCase: "snake",
      responseCase: "camel",
      enableToggleCase: true,
      cache: false,
      contentType: "application/x-www-form-urlencoded; charset=utf-8",
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
      }
    })
  }

  require(['studying.exam.answer', 'studying.prepare', 'studying.enum', 'timer'], function (v, p, _enum, _timer) {

    $.studying.loading.show();

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

    var returnUrl = decodeURIComponent(getQueryStringByName('return_url'));
    var languageVarl;
    if (language == "zh_cn" || language == 'en_us') {
      languageVarl = language == "zh_cn" ? (i18n["zh_cn"])["learning"] : (i18n["en_us"])["learning"];
    } else {
      languageVarl = language == "zh-CN" ? (i18n["zh-CN"])["learning"] : (i18n["en-US"])["learning"];
    }

    $.when(getExamInfo(), getMyExamInfo()).done(function (examData, mineData) {
      var data = mineData[0],
        examInfo = examData[0];

      examInfo.beginTime = examInfo.beginTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(examInfo.beginTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(examInfo.beginTime);
      examInfo.endTime = examInfo.endTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(examInfo.endTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(examInfo.endTime);
      data.beginTime = data.beginTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(data.beginTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(data.beginTime);
      data.endTime = data.endTime ? $.format.toBrowserTimeZone(Date.ajustTimeString(data.endTime), 'yyyy/MM/dd HH:mm:ss') : null; //Date.ajustTimeString(data.endTime);
      if (data.userData && data.userData.finishTime)
        data.userData.finishTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.finishTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(data.userData.finishTime);
      if (data.userData && data.userData.markTime)
        data.userData.markTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.markTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(data.userData.markTime);
      if (data.userData && data.userData.startTime)
        data.userData.startTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.startTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(data.userData.startTime);
      if (data.userData && data.userData.submitTime)
        data.userData.submitTime = $.format.toBrowserTimeZone(Date.ajustTimeString(data.userData.submitTime), 'yyyy/MM/dd HH:mm:ss'); //Date.ajustTimeString(data.userData.submitTime);

      var answersData = [],
        defs = [],
        qids = [];
      // 如果是继续作答或者解析的话需要事先获取到用户已经作答过的答案
      if (data.status == 8 && data.userData) {
        Enumerable.from(data.userData.ndrPaper.item.testParts[0].assessmentSections).forEach(function (value, index) {
          qids = qids.concat($.map(value.sectionParts, function (spv, spi) {
            return spv.identifier;
          }));
        });
        defs.push(getUserQuestionAnswers(data.examId, data.sessionId, qids, function (answerData) {
          if (answerData && answerData.length > 0)
            answersData = answersData.concat(answerData);
        }));
      }

      $.when.apply({}, defs).done(function () {
        $.studying.loading.hide();

        var config = {
          ElementSelector: '#exam',
          "Host": "http://" + window.location.host + selfUrl + "/" + projectCode,
          "NoteServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode, // 必填，笔记组件API地址
          "QuestionBankServiceHost": "http://" + window.location.host + selfUrl + "/" + projectCode, // 必填，题库服务API地址
          StaticHost: staticurl,
          CloudUrl: cloudUrl,
          LCGatewayUrl: 'http://elearning-resource-gateway.dev.web.nd',
          AccessToken: accessToken,
          ExamId: data.examId,
          SessionId: data.sessionId,
          CustomData: customData,
          LocationSource: locationSource,
          RankingUrl: rankingUrl ? rankingUrl : "",
          View: -1,
          QuestionScoreDict: {},
          Batches: [],
          Cells: [],
          Answers: [],
          ViewMode: 1, // 1、作答, 2、解析
          Language: language,
          EventCallbacks: {
            onAnswerSaved: function (answerData) {
              window.console && console.log('onAnswerSaved');
            }
          },
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
            "LimitSeconds": examInfo.duration ? examInfo.duration * 1000 : null, // 单位毫秒
            "EndAnswerTime": examInfo.endAnswerTime,
            "BeginTime": new Date(examInfo.beginTime).getTime(), // 单位毫秒
            "EndTime": examInfo.endTime ? new Date(examInfo.endTime).getTime() : _enum.Studying.ConstValue.MaxExamEndTime,
            "Mode": 1,
            "PassScore": examInfo.passingScore,
            "Summary": examInfo.description ? examInfo.description : "",
            "Chance": examInfo.examChance, // 考试机会
            "ExamResultPageUrl": returnUrl ? returnUrl : "http://" + window.location.host + selfUrl + '/' + projectCode + "/exam/tounament/end", // 考试结束后要跳转的页面
            "EnrollType": examInfo.enrollType,
            "UploadAllowed": examInfo.uploadAllowed,
            "SubType": examInfo.subType,
            "rankingAble": examInfo.rankingAble,
            "EnrollUrl": getEnrollUrl(data.examId, location.href)
          },
          UserExam: {
            "IsDekaron": false,
            "AnswersData": answersData,
            "UserEnroll": data.userEnroll,
            "AnalysisData": [],
            "UserExamStatus": data.status, // 用户考试状态
            "BeginTime": data.userData && data.userData.startTime ? new Date(data.userData.startTime).getTime() : 0,
            "AnswerMode": 0,
            "CostSeconds": 0,
            "DoneCount": data.userData && data.userData.answeredCount ? data.userData.answeredCount : 0,
            "MaxScore": data.maxUserData && data.maxUserData.submitTime ? data.maxUserData.score : undefined,
            "resultCode": data.lastUserData && data.lastUserData.resultCode ? (data.lastUserData.resultCode.length > 10 ? data.lastUserData.resultCode.substr(0, 10) + "..." : data.lastUserData.resultCode) : ""
          },
          Parts: [],
          PartTitles: [],
          i18n: languageVarl
        };

        var main = new v.Studying.ExamAnswer(config);

        var timer = _timer.Common.TimerFactory.Singleton();
        var initData = {
          exam: {
            examId: data.examId,
            title: examInfo.title,
            questionCount: data.questionCount,
            duration: data.duration,
            startTime: new Date(data.beginTime).format("yyyy/MM/dd hh:mm"),
            endTime: new Date(data.endTime).format("yyyy/MM/dd hh:mm"),
            description: data.description.replace(/\$\{cs_host}/gim, servelUrl),
            enrollType: data.enrollType,
            userEnroll: data.userEnroll,
            examChance: data.examChance,
            status: data.status,
            userData: data.userData,
            endAnswerTime: data.endAnswerTime,
            ranking: {
              showRanking: data.rankingAble,
              showHistory: data.historyAble,
              showIntegral: data.rewardRankingAble
            }
          }
        };

        viewModel.init(timer, main, config, initData);
      });
    }).fail(errorHandler);
  });

  var viewModel = {
    model: {
      exam: {
        examId: null,
        title: "",
        questionCount: 0,
        duration: 0,
        startTime: "",
        endTime: "",
        description: "",
        enrollType: 0,
        userEnroll: null,
        status: 0,
        userData: null,
        examChance: 0,
        endAnswerTime: 0,
        ranking: {
          showRanking: false,
          showHistory: false,
          showIntegral: false
        }
      }
    },
    init: function (timer, main, examConfig, data) {
      $.extend(this.model, data);
      this.timer = timer;
      this.main = main;
      this.examConfig = examConfig;
      document.title = this.model.exam.title;

      this.timer.ready().done($.proxy(this.onTimerReady, this));
    },
    onTimerReady: function () {
      this.model = ko.mapping.fromJS(this.model);
      this.model.currentTime = ko.observable(this.timer.time()); // 毫秒
      this.model.exam.formatDuration = ko.computed(function () {
        return this._toTimeString(this.model.exam.duration() * 1000);
      }, this);

      this.model.exam.startTimeSpan = ko.computed(function () {
        return new Date(this.model.exam.startTime()).getTime();
      }, this);

      this.model.exam.endTimeSpan = ko.computed(function () {
        return new Date(this.model.exam.endTime()).getTime();
      }, this);

      this.model.exam.endAnswerTimeSpan = ko.computed(function () {
        return this.model.exam.endAnswerTime() * 1000;
      }, this);

      this.model.buttonText = ko.computed(function () {
        switch (this.model.exam.status()) {
          case 0:
          case 1:
            return i18n.tounament.prepare.bespoke;
          default:
            if (this.model.exam.startTimeSpan() > this.model.currentTime()) {
              return i18n.tounament.prepare.bespoke;
            } else if (this.model.exam.endTimeSpan() < this.model.currentTime()) {
              if (this.canDekaron())
                return i18n.tounament.prepare.dekaron;
              else
                return i18n.tounament.prepare.join;
            } else {
              return i18n.tounament.prepare.join;
            }
        }
      }, this);

      this.model.isExamStarted = ko.computed($.proxy(function () {
        return this.model.exam.startTimeSpan() < this.model.currentTime();
      }, this));

      this.model.showExamFinished = ko.computed(function () {
        switch (this.model.exam.status()) {
          case 0:
          case 64:
          case 80:
          case 96:
            return true;
          case 8:
            if (this.canDekaron())
              return true;
            else if (this.model.exam.endTimeSpan() + this.model.exam.endAnswerTimeSpan() < this.timer.time())
              return true;
            else
              return false;
            break;
          default:
            return false;
        }
      }, this);


      this.model.showDayInBanner = ko.computed(function () {
        var bt = new Date(this.model.exam.startTime()).getTime();
        var ct = this.model.currentTime();
        var ot = bt - ct;
        if (ot > 0 && ot > 86400000) {
          // 大于一天开始
          return true;
        } else if (ot > 0 && ot < 86400000) {
          // 小于一天开始
          return false;
        } else {
          // 开始已经开始
          return false;
        }
      }, this);

      this.model.hasExamChance = ko.computed(function () {
        if (this.model.exam.examChance() >= 1)
          return true;
        else if (this.model.exam.status() > 8 && this.model.exam.status() < 101)
          return false;
        else if (this.model.exam.status() > 0 && this.model.exam.status() < 8)
          return false;
        else
          return true;
      }, this);

      this.model.DekaronEnd = ko.computed(function () {
        if (this.canDekaron()) {
          return false;
        } else {
          if (this.model.currentTime() > this.model.exam.endTimeSpan() + this.model.exam.endAnswerTime() * 1000)
            return true;
          else
            return false;
        }
      }, this);

      this.model.canDekaron = ko.computed(function () {
        if (this.model.exam.startTimeSpan() > this.model.currentTime())
          return false;
        if (this.model.exam.endTimeSpan() > this.model.currentTime())
          return false;

        var dekaronEndTime = this.model.exam.endTimeSpan() + this.model.exam.endAnswerTimeSpan();
        if (dekaronEndTime > this.model.currentTime())
          return true;
        else
          return false;
      }, this);

      ko.applyBindings(this, document.getElementById("examPrepare"));
      this.initTimer();
    },
    initTimer: function () {
      if (this.canDekaron()) {
        this.initDekaronTimer();
      } else if (!this.model.showExamFinished()) {
        this.initExamTimer();
      }
    },
    initExamTimer: function () {
      this.timer.appendRepeateHandler('tick', $.proxy(this.onTimerElapsed, this), Number.MAX_VALUE, 400);
      if (this.model.exam.status() == 8) {
        if (this.model.exam.endTimeSpan() >= this.model.currentTime())
          this.timer.appendHandler("OddChance", this.model.currentTime() + this.getExamEndTime(), $.proxy(this.onOddChance, this));
      }
    },
    initDekaronTimer: function () {
      var dekaronEndTime = this.model.exam.endTimeSpan() + this.model.exam.endAnswerTimeSpan();
      this.timer.appendHandler('end_dekaron', dekaronEndTime, $.proxy(this.doFinishDekaron, this));
    },
    doFinishDekaron: function () {
      this.model.currentTime(this.timer.time());
      if (this.model.exam.status() == 8 || this.model.exam.status() == 112 || this.model.exam.status() == 101) {
        this.main.store.commit().done($.proxy(function () {
          this.main.store.end().done($.proxy(function () {
            this.reQueryExamStatus();
          }, this));
        }, this));
      } else {
        this.reQueryExamStatus();
      }
      this.timer.removeHandler("dekaron_tick");
    },
    canDekaron: function () {
      if (this.model.exam.startTimeSpan() > this.model.currentTime())
        return false;
      if (this.model.exam.endTimeSpan() > this.model.currentTime())
        return false;

      var dekaronEndTime = this.model.exam.endTimeSpan() + this.model.exam.endAnswerTimeSpan();
      if (dekaronEndTime > this.model.currentTime())
        return true;
      else
        return false;
    },
    getExamEndTime: function () {
      var ll = this.examConfig.Exam.LimitSeconds ? (this.examConfig.UserExam.BeginTime == 0 ? this.examConfig.Exam.EndTime : this.examConfig.UserExam.BeginTime + this.examConfig.Exam.LimitSeconds > this.examConfig.Exam.EndTime ? this.examConfig.Exam.EndTime : this.examConfig.UserExam.BeginTime + this.examConfig.Exam.LimitSeconds) : null;

      return ll - this.model.currentTime() > 0 ? ll - this.model.currentTime() : 0;
    },
    getDateBeginLeft: function () {
      var st = new Date(this.model.exam.startTime()).getTime(),
        ct = new Date(this.model.currentTime()).getTime(),
        dt = st - ct;

      return Math.floor(dt / 86400000);
    },
    onOddChance: function () {
      this.main.dofinish(true, true);
      this.model.exam.examChance(this.model.exam.examChance() - 1);

      var endTime = new Date(this.model.exam.endTime()).getTime();
      if (this.timer.time() >= endTime) {
        this.reQueryExamStatus();
      }
    },
    onTimerElapsed: function () {
      this.model.currentTime(this.timer.time());

      var leaveTime = this.getCountdownNum();
      if (leaveTime == 0)
        this.reQueryExamStatus();

      var timeText = this._toTimeString(this.getCountdownNum());
      $(".time").html(timeText);

      var startTime = new Date(this.model.exam.startTime());
      if (this.model.currentTime() > startTime && this.model.exam.status() == 1)
        this.model.exam.status(4)
    },
    getCountdownNum: function () {
      switch (this.model.exam.status()) {
        case 1:
          return this.getExamStartTimeLeft();
        default:
          return this.getCurrentExamFinisheTime(this.model.currentTime());
      }
    },
    reQueryExamStatus: function () {
      if (this.model.exam.examChance() <= 0)
        this.model.exam.status(32);
      else if (this.model.exam.endTimeSpan() > this.model.currentTime())
        this.model.exam.status(4);
      else
        this.model.exam.status(96);

      // setTimeout($.proxy(function () {
      getMyExamInfo().done($.proxy(function (data) {
        this.model.exam.examChance(data.examChance);
        this.model.exam.status(data.status);

        if (data.status == 64 || data.status == 80 || data.status == 96)
          this.timer.removeHandler("tick");

        if (data.examChance <= 0)
          this.timer.removeHandler("OddChance");

        if (this.canDekaron()) {
          this.timer.removeHandler("tick");
          this.timer.removeHandler("OddChance");
          this.model.exam.status(96);

          this.initDekaronTimer();
        }
      }, this));
      // }, this), 3000);
    },
    getExamStartTimeLeft: function () {
      return new Date(this.model.exam.startTime()).getTime() - this.model.currentTime();
    },
    getCurrentExamFinisheTime: function () {
      var leaveTime = null,
        startTime = null,
        endTime = new Date(this.model.exam.endTime()).getTime(),
        tempEndTime = null,
        examStartTime = new Date(this.model.exam.startTime()).getTime();

      switch (this.model.exam.status()) {
        case 8:
          leaveTime = this.getExamEndTime();
          break;
        case 4:
        case 16:
        case 32:
        case 112:
          startTime = this.model.currentTime();
          if (examStartTime < this.model.currentTime()) {
            leaveTime = endTime > this.model.currentTime() ? endTime - this.model.currentTime() : 0;
          } else {
            leaveTime = examStartTime - startTime;
          }
          break;
        case 101:
          break;
      }

      return leaveTime;
    },
    onButtonClick: function () {
      var userEnroll = ko.mapping.toJS(this.model.exam.userEnroll);

      switch (this.model.exam.status()) {
        case 1:
          this.enroll(userEnroll);
          break;
        case 4:
          if (userEnroll && userEnroll.userEnrollType == 4)
            this.intoExam(1);
          else if (userEnroll && userEnroll.userEnrollType == 8)
            this.intoExam(2);
          else if (this.model.exam.enrollType() == 0 || this.model.exam.enrollType() == 4)
            this.intoExam(1);
          else
            this.enroll(userEnroll);
          break;
        case 8:
          this.intoExam(2);
          break;
        case 16:
        case 32:
        case 101:
        case 112:
          this.intoExam(1);
          break;
        case 64:
        case 80:
        case 96:
          if (this.canDekaron())
            this.intoExam(1);
          break;
      }
    },
    intoDekaron: function () {
      if (this.model.exam.status() == 8 || this.model.exam.status() == 112 || this.model.exam.status() == 101) {
        this.intoExam(2);
      } else {
        this.intoExam(1);
      }
    },
    onIntegralLinkClick: function () {
      $.fn.udialog.alert(i18n.tounament.common.notSupport, {
        width: '420',
        icon: '',
        title: i18n.tounament.common.systemTitleCaption,
        buttons: [{
          text: i18n.tounament.common.confirmButton,
          click: function () {
            var t = $(this);
            t["udialog"]("hide");
          },
          'class': 'default-btn'
        }],
        disabledClose: true
      });
    },
    intoExam: function (mode) {
      if (this.model.exam.startTimeSpan() > this.model.currentTime())
        return;

      if (this.timer && this.timer.isReady()) {
        this.timer.removeHandler("tick");
        this.timer.removeHandler("OddChance");
      }
      this.timer = null;

      $.studying.loading.show();

      if (this.canDekaron()) {
        this.main.store.data.UserExam.IsDekaron = true;
        if (this.model.exam.status() == 8) {
          this.main.store.data.Exam.EndAnswerTime = this.main.store.data.UserExam.BeginTime + this.main.store.data.Exam.LimitSeconds;
        }
      }

      $("#examPrepare").hide();
      // 新考试      
      if (mode == 1) {
        this.main.init(this.examConfig);
        if (this.main.store.data.UserExam.UserExamStatus != 112) {
          this.main.store.prepare(this.examConfig.CustomData).done($.proxy(function (data) {
            $.studying.loading.hide();
            // 开始考试
            this.main.store.start();
          }, this)).fail(errorHandler);
        } else {
          // 开始考试
          $.studying.loading.hide();
          this.main.store.start();
        }
      }
      // 继续考试
      if (mode == 2) {
        this.main.init(this.examConfig);
        this.main.store.continueAnswer().done(function (data) {
          $.studying.loading.hide();
        }).fail(errorHandler);
      }
    },
    enroll: function (userEnroll) {
      switch (this.model.exam.enrollType()) {
        case 1:
        case 2:
        case 5:
          if (!userEnroll ||
            userEnroll.userEnrollType == 0 ||
            userEnroll.userEnrollType == 2 ||
            userEnroll.userEnrollType == 5 ||
            userEnroll.userEnrollType == 12 ||
            userEnroll.userEnrollType == 13) {
            location.href = getEnrollUrl(this.model.exam.examId(), location.href);
          }
          break;
      }
    },
    _toTimeString: function (span) {
      span = Math.ceil(parseInt((span / 1000) + ""));
      var h = parseInt((span / 3600) + "");
      var m = parseInt((span / 60) + "") % 60;
      var s = span % 60;

      return (h < 10 ? '0' + h : '' + h) + ":" + (m < 10 ? '0' + m : '' + m) + ":" + (s < 10 ? '0' + s : '' + s);
    }
  };
}(jQuery));
