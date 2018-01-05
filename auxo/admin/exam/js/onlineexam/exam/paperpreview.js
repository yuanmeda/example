/* 后台题目呈现组件
调用方法：$(selector).question(options);
options:
showOther: true     //是否显示其他的信息（答案、解析）
showProperty: true  //是否显示题目属性
isClient: flase     //是否为客户端环境
num: 1,             //题目的编号
question: {}        //题目对象
events:
//所有的事件参数 handler(evt,data);
//其中data为 data.question为题目对象
edit: handler       //点击编辑时触发
bank: handler       //点击题库时触发
status: handler     //点击状态时触发
repeat: handler     //点击重题时触发
detail: handler     //点击详细时触发，return false可以取消默认的行为。
refresh: handler    //点击刷新时触发
source: hander      //点击重题图标时触发
<li data-bind="visible:$root.isClient"><a href="javascript:void(0)" data-event="repeat">重题</a></li>\
*/
//define(function (require, exports) {
var tmpl = '\
<div class="qt-container" data-bind="css:{\'qt-container-shrink\':shrink},with: question">\
    <div class="row qt-head qt-main">\
        <div class="pull-left">\
            <span class="qt-num" data-bind="text:$root.num() + \'.\'"></span>\
            <span class="qt-type" data-bind="text:$root.formatQuestionType(question_type())"></span>\
               <span class="qt-type showScore" data-bind="visible:$root.showScore"  >【<span data-bind="text:total_score"></span>分】</span>\
        </div>\
        <div class="btn-toolbar pull-right qt-operate">\
            <span class="l1" data-bind="visible:$root.showScore()&& question_type()!=50,attr:{hasSubItem:(items().length>1).toString()}">&nbsp;本题&nbsp;<input type="text" class="dataS fix-margin l1" data-bind="attr:{questionid:id},value:items()[0].score"/>&nbsp;分</span>\
        </div>\
    </div>\
    <div class="row">\
        <div class="qt-body qt-part detail" data-bind="html: complex_body, visible: question_type()==50"></div>\
        <div style="margin-left:25px;" data-bind="foreach: videos">\
            <br/>\
            <video controls="controls" data-bind="attr: { src: $data }"></video>\
        </div>\
        <div style="margin-left:25px;" data-bind="foreach: audios">\
            <br/>\
            <audio controls="controls" data-bind="attr: { src: $data }"></audio>\
        </div>\
        <div data-bind="foreach: items">\
            <div class="qt-sub qt-part">\
                <div class="qt-head clearfix" data-bind="visible: $parent.question_type()==50">\
                    <div class="pull-left">\
                        <span class="qt-num" data-bind="text: $index()+1 + \').\'"></span>\
                        <span class="qt-type" data-bind="text: $root.formatQuestionType(question_type())"></span>\
                        <span class="qt-type showScore" >【<span data-bind="text:score"></span>分】</span>\
                    </div>\
                    <div class="pull-right l2" data-bind="visible:$root.showScore">\
                        <input type="text" class="dataS fix-margin l2" data-bind="attr:{questionId:$parent.id},value:score"/>&nbsp;分\
                    </div>\
                </div>\
                <div class="qt-body" >\
                    <div data-bind="html: body" class="detail" ></div>\
                    <div data-bind="foreach: videos">\
                        <br/>\
                        <video controls="controls" data-bind="attr: { src: $data }"></video>\
                    </div>\
                    <div data-bind="foreach: audios">\
                        <br/>\
                        <audio controls="controls" data-bind="attr: { src: $data }"></audio>\
                    </div>\
                </div>\
                <div class="qt-options detail" data-bind="foreach: options">\
                    <dl>\
                        <dt data-bind="text: String.fromCharCode($index()+65) + \'.\'"></dt>\
                        <dd data-bind="html: $data"></dd>\
                    </dl>\
                </div>\
                <div class="qt-other" data-bind="visible:$root.showOther">\
                    <dl data-bind="visible: $parent.question_type()==50">\
                        <dt style="float:none">答案</dt>\
                        <dd style="text-indent:0" data-bind="html: $root.formatAnswer(answer())"></dd>\
                        <dt style="float:none">解析</dt>\
                        <dd style="text-indent:0" data-bind="html: explanation()==\'\' ? \'<暂无>\' : explanation() "></dd>\
                    </dl>\
                    <dl data-bind="visible: $parent.question_type()!=50">\
                        <dt style="float:none">答案</dt>\
                        <dd style="text-indent:0" data-bind="html: $root.formatAnswer(answer())"></dd>\
                        <dt style="float:none">解析</dt>\
                        <dd style="text-indent:0" data-bind="html: explanation()==\'\' ? \'<暂无>\' : explanation() "></dd>\
                    </dl>\
                </div>\
            </div>\
        </div>\
        <div class="qt-other qt-part" data-bind="visible: question_type()==50 && $root.showOther">\
            <dl>\
                <dt style="float:none">解析</dt>\
                <dd style="text-indent:0" data-bind="html: complex_explanation()==\'\' ? \'<暂无>\' : complex_explanation()"></dd>\
            </dl>\
        </div>\
    </div>\
</div>\
';

(function ($) {
  $.widget("system.question", {
    options: {
      accessToken: "",
      showOther: true,
      showProperty: true,
      isClient: false,
      showScore: false,
      num: 1,
      showMark: false,
      shrink: false,
      question: {}
    },
    _QuestionStatusName: ["编辑", "就绪", "禁用", "过期", "", "", "", "删除"],
    _OnlineTypeName: ["正式区", "", "临时区"],
    _init: function () {
      //this._setShowProperty();
      this._reset();

    },
    _reset: function () {
      this.element.html(tmpl);

      this._vm = ko.mapping.fromJS(this.options);

      var t = this;
      this._vm.OptionName = function (v) {
        return String.fromCharCode(v + 65);
      };
      this._vm.question.total_score = ko.computed(function () {
        var subQuestion = ko.mapping.toJS(this.question.items),
          totalScore = 0;
        for (var i = 0; i < subQuestion.length; i++) {
          totalScore += parseFloat(subQuestion[i].score);
        }
        return totalScore;
      }, this._vm);

      this._resolveComplexBodyStreamMedia();
      this._resolveSubBodyStreamMedia();

      ko.applyBindings(this._vm, this.element[0]);

      //计算宽度
      var ops = $(".qt-options", this.element[0]),
        dds = ops.find("dd");
      var lw = ops.width(),
        max = 0;
      if (lw == 0 || lw == null) { //无法取到选项宽度时用（用于临时区、正式区预览）
        //取字体大小
        var fontSize = parseInt($(".part").css("font-size"));
        //计算一行能放几个字
        lw = Math.floor($(".part").width() / fontSize) - 8;
        //计算选项中最多几个字
        for (var i = 0; i < dds.length; i++) {
          var dd = $(dds[i]),
            w = dd.text().length;
          //作答2.0中根据宽度来排，但是跑到这里来说明无法取到选项的宽度。此时显示含图片的选项肯能出问题
          //if (w > lw / 2) {
          //同作答3.0中的规则遇到图片就竖排
          if (w > lw / 2 || dd.html().indexOf("<img") > 0) {
            max = lw;
            break;
          }
          max = Math.max(max, w);
        }
      } else {
        for (var i = 0; i < dds.length; i++) {
          var dd = $(dds[i]),
            w = dd.width();
          if (w > lw / 2) {
            max = lw;
            break;
          }
          max = Math.max(max, w);
        }
      }

      if (max < lw / 4)
        ops.addClass("qt-col4");
      else if (max < lw / 2)
        ops.addClass("qt-col2");
      else
        ops.addClass("qt-col1");

      this.element.find(".detail").click($.proxy(this._onMenuClick, this));
      this.element.find(".qt-repeat").click($.proxy(this._onRepeatClick, this));
    },
    _onRepeatClick: function () {
      this._trigger("source", null, {
        question: this.options
      });
    },
    _onMenuClick: function (evt) {
      this.toggleDetail(!this.element.find(".qt-other").is(":visible"));
    },
    toggleDetail: function (v) {
      if (this.options.shrink)
        this.element.find(".qt-container").toggleClass("qt-container-shrink", !v);
      this.element.find(".qt-property, .qt-sub .qt-other").toggle(v);
      if (this.options.question.BaseQuestionType == 50)
        this.element.find(".qt-other").toggle(v);

      this._setCookie(v);
    },
    _setShowProperty: function () {
      var isVisible = $.cookie("QuestionDetail");
      if (isVisible != undefined && isVisible != null) {
        if (isVisible == "true") {
          this.options.showProperty = true;
          this.options.showOther = true;
          this.options.shrink = false;
        } else {
          this.options.showProperty = false;
        }
      }
    },
    _setCookie: function (v) {
      $.cookie("QuestionDetail", v, {
        expires: 3600 * 24 * 7,
        path: '/'
      });
    },
    _queryVideoInfo: function (videoId) {
      return $.ajax({
        url: cloudUrl + "/v5/resource/videos/querys",
        dataType: "jsonp",
        jsonp: "callback",
        data: {
          access_token: this._vm.accessToken(),
          video_id: videoId
        },
        type: "get"
      });
    },
    _queryVideoFiles: function (videoId) {
      return $.ajax({
        url: cloudUrl + "/v5/resource/videos/queryurls",
        dataType: "jsonp",
        jsonp: "callback",
        data: {
          access_token: this._vm.accessToken(),
          video_id: videoId
        },
        type: "get"
      });
    },
    _getVideoUrl: function (body, files) {
      var streamUrl = Enumerable.from(files).where("$.type==2").toArray();
      return streamUrl[0].urls[0];
    },
    _getAudioUrl: function (body, files) {
      var streamUrl = Enumerable.from(files).where("$.type==3").toArray();
      return streamUrl[0].urls[0];
    },
    _resolveComplexBodyStreamMedia: function () {
      var cell = this._vm.question;
      var body = this._vm.question.complex_body();
      var medias = body.match(/\{video:[A-Za-z0-9-]+}/g);

      cell.videos = ko.observable([]);
      cell.audios = ko.observable([]);

      if (medias) {
        cell.complex_body(body.replace(/\{video:[A-Za-z0-9-]+}/g, ""));
        for (var i = 0; i < medias.length; i++) {
          var videoId = medias[i].replace("{video:", "").replace("}", "");
          $.when(this._queryVideoInfo(videoId), this._queryVideoFiles(videoId)).done($.proxy(function (videoInfoData, videoFilesData) {
            var videoInfo = window.toggleCase(videoInfoData[0], "camel"),
              videoFiles = window.toggleCase(videoFilesData[0], 'camel');
            if (videoInfo.resourceStatus != 1)
              return;

            switch (videoInfo.videoType) {
              case 0:
              case 2:
                var videos = cell.videos();
                videos.push(this._getVideoUrl(body, videoFiles));
                cell.videos(videos);
                break;
              case 1:
                var audios = cell.audios();
                audios.push(this._getAudioUrl(body, videoFiles));
                cell.audios(audios);
                break;
            }
          }, this));
        }
      }
    },
    _resolveSubBodyStreamMedia: function () {
      Enumerable.from(this._vm.question.items()).forEach($.proxy(function (cell, index) {
        var medias = cell.body().match(/\{video:[A-Za-z0-9-]+}/g),
          body = cell.body();

        cell.videos = ko.observable([]);
        cell.audios = ko.observable([]);

        if (medias) {
          cell.body(cell.body().replace(/\{video:[A-Za-z0-9-]+}/g, ""));
          for (var i = 0; i < medias.length; i++) {
            var videoId = medias[i].replace("{video:", "").replace("}", "");
            $.when(this._queryVideoInfo(videoId), this._queryVideoFiles(videoId)).done($.proxy(function (videoInfoData, videoFilesData) {
              var videoInfo = window.toggleCase(videoInfoData[0], "camel"),
                videoFiles = window.toggleCase(videoFilesData[0], 'camel');
              if (videoInfo.resourceStatus != 1)
                return;

              switch (videoInfo.videoType) {
                case 0:
                case 2:
                  var videos = cell.videos();
                  videos.push(this._getVideoUrl(body, videoFiles));
                  cell.videos(videos);
                  break;
                case 1:
                  var audios = cell.audios();
                  audios.push(this._getAudioUrl(body, videoFiles));
                  cell.audios(audios);
                  break;
              }
            }, this));
          }
        }
      }, this));
    }
  });
})(jQuery);
//});
(function ($) {
  var store = {
    getPaper: function (success) {
      return $.ajax({
        type: "GET",
        url: '/' + projectCode + '/v1/papers/' + paperId,
        cache: false,
        success: success
      });
    },
    getRandomPaper: function (success) {
      return $.ajax({
        type: "GET",
        url: '/' + projectCode + '/v1/exams/' + examId + '/papers/random_question',
        cache: false,
        success: success
      });
    }
  };
  var viewModel = {
    model: {
      title: "",
      total_score: 0,
      parts: [],
      part_count: 0,
      question_count: 0,
      sub_question_count: 0,
      disabled: false,
      showSetScoreButton: false,
      isClient: false
    },
    init: function () {
      var self = viewModel;
      this.model = ko.mapping.fromJS(this.model);
      ko.applyBindings(this);
      this.getPaperDetail();
    },
    importMathJax: function () {
      var head = document.getElementsByTagName("head")[0],
        script;
      script = document.createElement("script");
      script.type = "text/x-mathjax-config";
      script[(window.opera ? "innerHTML" : "text")] =
        "MathJax.Hub.Config({\n" +
        "  tex2jax: { inlineMath: [['$','$'], ['\\\\(','\\\\)']] }\n" +
        "});"
      head.appendChild(script);
      script = document.createElement("script");
      script.type = "text/javascript";
      script.src = staticUrl + "auxo/addins/mathjax/v2.6/MathJax.js?config=TeX-AMS-MML_HTMLorMML&timesamp=" + new Date().getTime();
      head.appendChild(script);
    },
    getPaperDetail: function () {
      $("body").loading("show");
      var self = this;
      if (paperId) {
        store.getPaper(self.showResult).fail(function () {
          $("body").loading("hide");
        });
      } else {
        store.getRandomPaper(self.showResult).fail(function () {
          $("body").loading("hide");
        });
      }
    },
    showResult: function (data) {
      var self = viewModel;
      var parts = data.parts;
      data.parts = [];
      ko.mapping.fromJS(data, {}, self.model);
      self.model.parts(parts);

      $(".part .tk-main div.pull-left").toggle(function () {
        $(this).find("i").removeClass().addClass("icon-minus");
        var partIndex = $(this).find("span.partindex").text() - 1;
        if ($(this).parent().parent().find(".list").text() == "") {
          self.showPartQuestion(partIndex);
        }
        $(this).parent().parent().find(".list").show();
      }, function () {
        $(this).find("i").removeClass().addClass("icon-plus");
        $(this).parent().parent().find(".list").hide();
      });
      $(".part .tk-main div.pull-left:first").click();
      $(".part .tk-main div.pull-left").css("cursor", "pointer");
      $(".part .list").hide();
      $(".part:first .list").show();
      $(".part:first .tk-main div.pull-left i").removeClass().addClass("icon-minus");
      $("body").loading("hide");

      self.importMathJax();
    },
    showPartQuestion: function (partIndex) {
      var self = this;
      var divPart = $($(".list")[partIndex]);
      var questions = self.model.parts()[partIndex].questions;

      var list = $('<div />');
      $.each(questions, function (questionIndex, question) {
        list.append(viewModel.bindQuestion($("<div id=" + partIndex + questionIndex + "></div>"), question, questionIndex + 1));
      });
      divPart.empty().append(list);
      $($(".part")[partIndex]).find("input.setScore").attr("disabled", false);
      $("body").loading("hide");
    },
    formatQuestionType: function (data) {
      var s = "";
      switch (data) {
        case 10:
          s += "单选题";
          break;
        case 15:
          s += "多选题";
          break;
        case 18:
          s += "不定项选择题";
          break;
        case 20:
          s += "填空题";
          break;
        case 25:
          s += "主观题";
          break;
        case 30:
          s += "判断题";
          break;
        case 40:
          s += "连线题";
          break;
        case 50:
          s += "套题";
          break;
        default:
          break;
      }
      return s;
    },
    formatAnswer: function (s) {
      if (!s) return '';
      var preWrapper = "<pre style='background-color: #FFF; border-width: 0'>";
      var postWrapper = "</pre>";
      try {
        var obj = JSON.parse(s);
        var resultArr = [];
        for (var i = 0; i < obj.length; i++) {
          var idx = "";
          for (var j = 0; j < obj[i].index.length; j++) {
            idx += "【" + obj[i].index[j] + "】";
          }
          resultArr.push(idx + preWrapper + obj[i].value.join("，") + postWrapper);
        }
        return resultArr.join("<br/>");
      } catch (e) {
        return preWrapper + s + postWrapper;
      }
    },
    bindQuestion: function (control, question, index) {
      var questionHtml = $(control).question({
        accessToken: accessToken, //"9fa43ad6cd9a4a749c9474d500aefe25",
        showOther: false,
        showProperty: false,
        num: index,
        question: question,
        edit: $.proxy(viewModel.editQuestion, this),
        refresh: $.proxy(viewModel.refreshSingle, this),
        source: $.proxy(viewModel.source, this),
        formatQuestionType: $.proxy(viewModel.formatQuestionType, this),
        formatAnswer: $.proxy(viewModel.formatAnswer, this)
      });

      return questionHtml;

    }
  };

  $(function () {
    viewModel.init();
  })
})(jQuery)
