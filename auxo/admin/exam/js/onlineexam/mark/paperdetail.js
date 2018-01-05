(function ($, window) {
  var store = {
    getMarkDetails: function () {
      var url = '/' + projectCode + '/v1/exams/' + examId + '/sessions/' + sessionId + '/mark/details';
      return commonJS._ajaxHandler(url);
    },
    getExam: function () {
      var url = '/' + projectCode + '/v1/exams/' + examId;
      return commonJS._ajaxHandler(url);
    },
    getNext: function () {
      var url = '/' + projectCode + '/v1/exams/' + examId + '/sessions/' + sessionId + '/mark/next';
      return commonJS._ajaxHandler(url);
    },
    mark: function (data) {
      var url = '/' + projectCode + '/v1/exams/' + examId + '/mark';
      return commonJS._ajaxHandler(url, JSON.stringify(data), "put");
    },
    videoInfo: function (videoId) {
      return $.ajax({
        url: cloudUrl + "/v5/resource/videos/querys",
        dataType: "jsonp",
        jsonp: "callback",
        data: {
          access_token: accessToken,
          video_id: videoId
        },
        type: "get"
      });
    },
    videoFiles: function (videoId) {
      return $.ajax({
        url: cloudUrl + "/v5/resource/videos/queryurls",
        dataType: "jsonp",
        jsonp: "callback",
        data: {
          access_token: accessToken,
          video_id: videoId
        },
        type: "get"
      });
    }
  };
  var viewModel = {
    model: {
      exam: {
        title: ""
      },
      items: [],
      selectedIds: [],
      enabled: false, //考试是否上线
      userId: "",
      nextSessionId: "",
      style: 'table' //列表显示风格
    },
    items: [],
    init: function () {
      var self = viewModel;
      $.extend(self, commonJS);
      self.model = ko.mapping.fromJS(self.model);
      ko.applyBindings(self);

      this.list();
      this.importMathJax();
    },
    importMathJax: function () {
      var head = document.getElementsByTagName("head")[0],
        script;
      script = document.createElement("script");
      script.type = "text/x-mathjax-config";
      script[(window.opera ? "innerHTML" : "text")] =
        "MathJax.Hub.Config({\n" +
        "  tex2jax: { inlineMath: [['$','$'], ['\\\\(','\\\\)']] }\n" +
        "});";

      head.appendChild(script);

      script = document.createElement("script");
      script.type = "text/javascript";
      script.src = staticUrl + "auxo/addins/mathjax/v2.6/MathJax.js?config=TeX-AMS-MML_HTMLorMML&timesamp=" + new Date().getTime();
      head.appendChild(script);
    },
    list: function () {
      var self = this;
      store.getMarkDetails().done($.proxy(function (data) {
        if (data instanceof Array) {
          this.items = data || [];
          this.resolveSubBodyStreamMedia();
          this.resolveComplexBodyStreamMedia();

          this.model.items(this.items);
          for (var i = 0; i < data.length; i++) {
            if (data[i].user_id) {
              this.model.userId(data[i].user_id);
              break;
            }
          }
          this._validator();
        }

        this.getExam();
        this.getNext();

        if (window.top)
          setTimeout(function () {
            $(document.body).height($(document.body).height() + 100);
          }, 1000);
      }, this));
    },
    getExam: function () {
      var self = this;
      store.getExam().done(function (data) {
        self.model.exam.title(data.title);
      });
    },
    getNext: function () {
      var self = this;
      store.getNext().done(function (data) {
        if (data) {
          self.model.nextSessionId(data.session_id);
        }
      });
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
    formatModelAnswer: function (s) {
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
          resultArr.push(idx + obj[i].value.join("，").replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\r\n]/g, '<br/>').replace(/\s/g, '&nbsp;'));
        }
        return resultArr.join("<br/>");
      } catch (e) {
        return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\r\n]/g, '<br/>').replace(/\s/g, '&nbsp;');
      }
    },
    //格式化简答题
    formatAnswer25: function (s) {
      if (!s) return '';
      var preWrapper = "<pre style='background-color: #FFF; border-width: 0'>";
      var postWrapper = "</pre>";
      return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\r\n]/g, '<br/>').replace(/\s/g, '&nbsp;');
    },
    formatImageAnswer: function (s, index) {
      if (!s) {
        return "";
      }
      var obj = JSON.parse(s);
      var result = "";

      if (obj.data.length > 0) {
        for (var i = 0; i < obj.data.length; i++) {
          if (obj.data[i].q == index) {
            if (obj.data[i].sub_data && obj.data[i].sub_data.length > 0) {
              $.each(obj.data[i].sub_data, function (index, item) {
                result += "<a href='" + item.url + '&attachment=true' + "'style='color:#0302DF' target='_blank'>";
                result += "点击下载附件";
                result += "</a>";
              });
            }
          }
        }
      }

      // if (obj.type == "cs_sub_image" && obj.data.length > 0) {
      //     for (var i = 0; i < obj.data.length; i++) {
      //         if (obj.data[i].q == index) {
      //             if (obj.data[i].sub_data && obj.data[i].sub_data.length > 0) {
      //                 $.each(obj.data[i].sub_data, function (index, item) {
      //                     result += "<a href='" + item.url + "' target='_blank'>";
      //                     result += "<img src='" + item.url + "&size=120" + "'/>";
      //                     result += "</a>";
      //                 });
      //             }
      //         }
      //     }
      // }
      if (result)
        result = "<div class='box' style='border-top: 1px solid #ddd;'><div style='font-weight: bold'>考生上传附件：</div>" + result + "</div>"
      return result;
    },
    _validator: function () {
      var rules = {};
      $.each(viewModel.items, function (indx, elem) {
        $.each(elem.subs, function (i, e) {
          if (e.question_type == 20 || e.question_type == 25) {
            var qid = elem.question_id + "_" + i;
            var elementId = "q_" + qid;
            $.validator.addMethod("score_" + qid, function (val, element) {
              var re = /^\d+(\.\d)?$/;
              return this.optional(element) || (re.test(val));
            }, "分数格式有误，请重新输入");
            $.validator.addMethod("scoreRange_" + qid, function (val, element) {
              var userScore = parseFloat($("#" + elementId).val());
              if (isNaN(userScore))
                return true;
              if (userScore > e.score) {
                return false;
              }
              return true;
            }, "分数不能超过总分(" + e.score + ")");
            rules[elementId] = {};
            rules[elementId]["score_" + qid] = "";
            rules[elementId]["scoreRange_" + qid] = "";
          }
        });
      });
      $("#edit").validate({
        rules: rules,
        onkeyup: function (element) {
          $(element).valid()
        },
        errorPlacement: function (erorr, element) {
          erorr.appendTo(element.parent());
        },
        errorElement: 'div',
        errorClass: 'help-inline',
        highlight: function (label) {
          $(label).closest('.control-group').addClass('error').removeClass('success');
        },
        success: function (label) {
          label.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
        }
      });
    },
    hasDone: function (userAnswer, subUserAnswer, subQuestionType) {
      if (userAnswer) {
        return true;
      }
      if (subQuestionType == 20) {
        if (!subUserAnswer) {
          return false;
        }
        try {
          var jsonData = JSON.parse(subUserAnswer);
          for (var i = 0; i < jsonData.length; i++) {
            if (jsonData[i].value && jsonData[i].value.length > 0 && jsonData[i].value[0]) {
              return true;
            }
          }
          return false;
        } catch (e) {
          return true;
        }
      } else {
        return subUserAnswer;
      }
    },
    getData: function () {
      var self = viewModel,
        temp = [];
      $.each(viewModel.items, function (indx, elem) {
        var it = {
          session_id: sessionId,
          question_id: elem.question_id,
          question_version: elem.question_version
        };
        it.marking_remark = null;
        it.marking_user_id = userId;
        var totalScore = 0;
        var totalUserScore = 0;
        var allUnmarked = true;
        it.subs = [];
        $.each(elem.subs, function (i, e) {
          var userScore = e.user_score;
          var qas = e.question_answer_status;
          if (e.question_type == 20 || e.question_type == 25) {
            var qid = elem.question_id + "_" + i;
            var elementId = "q_" + qid;
            userScore = parseFloat($("#" + elementId).val());
            if (isNaN(userScore)) {
              userScore = null;
              if (self.hasDone(elem.user_answer, e.user_answer, e.question_type)) {
                qas = 1;
              } else {
                qas = (userScore < e.score) ? 7 : 5;
              }
              if (qas != 1) {
                allUnmarked = false;
              }
            } else {
              qas = (userScore < e.score) ? 7 : 5;
              allUnmarked = false;
            }
          } else {
            allUnmarked = false;
          }
          it.subs.push({
            score: userScore,
            question_answer_status: qas
          });
          totalScore += e.score;
          if (userScore) {
            totalUserScore += userScore;
          }
        });
        it.score = totalUserScore;
        if (allUnmarked) {
          it.question_answer_status = 1;
        } else {
          it.question_answer_status = (totalUserScore < totalScore) ? 7 : 5;
        }
        temp.push(it);
      });
      return temp;
    },
    doSave: function (callback) {
      if (!$("form").valid()) {
        return;
      }
      var self = viewModel;
      var items = self.getData();
      if (items && items.length) {
        store.mark(items).done(function () {
          $.fn.dialog2.helpers.alert("保存成功");
          callback();
        });
      } else {
        callback();
      }
    },
    cancel: function () {
      location.href = '/' + projectCode + "/exam/mark/exam?exam_id=" + examId;
    },
    toNext: function () {
      location.href = '/' + projectCode + "/exam/mark/paper?exam_id=" + examId + "&session_id=" + viewModel.model.nextSessionId();
    },
    save: function () {
      this.doSave(this.cancel);
    },
    saveThenNext: function () {
      this.doSave(this.toNext);
    },
    getVideoUrl: function (body, files) {
      var streamUrl = Enumerable.from(files).where("$.type==2").toArray();
      return streamUrl[0].urls[0];
    },
    getAudioUrl: function (body, files) {
      var streamUrl = Enumerable.from(files).where("$.type==3").toArray();
      return streamUrl[0].urls[0];
    },
    resolveSubBodyStreamMedia: function () {
      Enumerable.from(this.items).forEach($.proxy(function (question, qi) {
        Enumerable.from(question.subs).forEach($.proxy(function (cell, index) {
          var medias = cell.body.match(/\{video:[A-Za-z0-9-]+}/g),
            body = cell.body;

          cell.videos = ko.observable([]);
          cell.audios = ko.observable([]);

          if (medias) {
            cell.body = cell.body.replace(/\{video:[A-Za-z0-9-]+}/g, "");
            for (var i = 0; i < medias.length; i++) {
              var videoId = medias[i].replace("{video:", "").replace("}", "");
              $.when(store.videoInfo(videoId), store.videoFiles(videoId)).done($.proxy(function (videoInfoData, videoFilesData) {
                var videoInfo = window.toggleCase(videoInfoData[0], "camel"),
                  videoFiles = window.toggleCase(videoFilesData[0], 'camel');
                if (videoInfo.resourceStatus != 1)
                  return;

                switch (videoInfo.videoType) {
                  case 0:
                  case 2:
                    var videos = cell.videos();
                    videos.push(this.getVideoUrl(body, videoFiles));
                    cell.videos(videos);
                    break;
                  case 1:
                    var audios = cell.audios();
                    audios.push(this.getAudioUrl(body, videoFiles));
                    cell.audios(audios);
                    break;
                }
              }, this));
            }
          }
        }, this));
      }, this));
    },
    resolveComplexBodyStreamMedia: function () {
      Enumerable.from(this.items).forEach($.proxy(function (cell, qi) {
        var body = cell.complex_body;
        var medias = body.match(/\{video:[A-Za-z0-9-]+}/g);

        cell.videos = ko.observable([]);
        cell.audios = ko.observable([]);

        if (medias) {
          cell.complex_body = body.replace(/\{video:[A-Za-z0-9-]+}/g, "");
          for (var i = 0; i < medias.length; i++) {
            var videoId = medias[i].replace("{video:", "").replace("}", "");
            $.when(store.videoInfo(videoId), store.videoFiles(videoId)).done($.proxy(function (videoInfoData, videoFilesData) {
              var videoInfo = window.toggleCase(videoInfoData[0], "camel"),
                videoFiles = window.toggleCase(videoFilesData[0], 'camel');
              if (videoInfo.resourceStatus != 1)
                return;

              switch (videoInfo.videoType) {
                case 0:
                case 2:
                  var videos = cell.videos();
                  videos.push(this.getVideoUrl(body, videoFiles));
                  cell.videos(videos);
                  break;
                case 1:
                  var audios = cell.audios();
                  audios.push(this.getAudioUrl(body, videoFiles));
                  cell.audios(audios);
                  break;
              }
            }, this));
          }
        }
      }, this));
    }
  };

  $(function () {
    viewModel.init();
  });

})(jQuery, window);
