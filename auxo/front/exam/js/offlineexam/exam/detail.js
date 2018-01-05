(function (w, $) {

  var EXAMID = w.examId;
  var SESSIONID = w.sessionId;
  var code = w.projectCode;
  var REQ_URI = selfUrl + '/' + code + '/v1/m/exams/' + EXAMID,
    REQ_URI_SE = REQ_URI + '/sessions/' + SESSIONID;
  var defaultNode = {
    title: "",
    duration: 0,
    time_left: 0,
    description: "",
    submit_time: "",
    status: 0, //0 提交答案  //1答案回顾  //2时间到未提交
    attachment: {
      id: "",
      name: "",
      size: 0,
      description: "",
      url: "",
      prview_url: ""
    }
  };
  var store = {
    dm: {
      getSessionDetail: function () {
        return $.ajax({
          url: REQ_URI_SE,
          cache: false,
          dataType: 'json'
        })
      },
      getDetail: function () {
        return $.ajax({
          url: REQ_URI + '/mine_detail_with_subject',
          cache: false,
          dataType: 'json'
        })
      },
      getQuestions: function (ids) {
        return $.ajax({
          url: REQ_URI_SE + '/questions',
          cache: false,
          dataType: 'json',
          data: {
            qid: ids
          },
          traditional: true
        })
      },
      submit: function (body) {
        return $.ajax({
          url: REQ_URI_SE + '/submit_dm',
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({
            mark_applied: body
          })
        })
      }
    },
    answer: {
      submit: function (index, data) {
        return $.ajax({
          url: REQ_URI_SE + '/answers/' + index,
          data: JSON.stringify(data),
          type: 'PUT',
          dataType: 'json',
          contentType: 'application/json'
        })
      },
      syn: function () {
        return $.ajax({
          url: '/' + code + '/v1/m/other/date',
          cache: false,
          dataType: 'json'
        })
      }
    },
    cs: {
      upload: function () {
        return $.ajax({
          url: REQ_URI_SE + '/upload',
          dataType: 'json',
          cache: false
        })
      }
    },
    analysis: {
      findAll: function (qid) {
        return $.ajax({
          url: REQ_URI_SE + '/analysis',
          dataType: 'json',
          cache: false,
          data: {
            qid: qid
          },
          traditional: true
        })
      }
    }
  };
  var viewModel = {
    model: {
      exam: {
        begin_time: "",
        end_time: "",
        analysis_cond_data: {
          begin_time: "",
          end_time: "",
          end_seconds: 0
        },
        mark: {
          time_left: 0,
          end_time: "",
          dv: 0,
          status: 1 //默认可以提交
        },
        cyclic_strategy: 0,
        submit_time: "",
        type: 0, //0 考试  1 练习
        qid: [],
        title: ''
      },
      stem: {
        complex_body: "",
        body_attachments: []
      },
      node: [],
      analysis: {
        analysis_allowed: false,
        items: [],
        analysis_cond_status: 0
      },
      upload: {
        index: -1,
        attachment: {
          id: "",
          name: "",
          size: 0,
          description: "",
          url: "",
          prview_url: ""
        },
        status: 0 // 0: 未上传, 1: 上传失败, 2: 上传成功或已上传, 3: 上传中
      },
      cs: {
        session: "",
        url: "",
        server_url: "",
        path: ""
      },
      timer: {
        h: "00",
        m: "00",
        s: "00",
        sub: null
      },
      preview: w.preview,
      init: false,
      showTimeModal: false
    },
    kits: {
      standardDate: function (d) {
        d = ko.unwrap(d);
        // return d.replace('T', ' ').substr(0, 19);
        return d ? $.format.toBrowserTimeZone(Date.ajustTimeString(d), "yyyy-MM-dd HH:mm:ss") : "";
      },
      toDate: function (d) {
        d = ko.unwrap(d);
        if (!d) return d;
        if (parseInt(d) === d) return new Date(d);
        return new Date(this.standardDate(d).replace(/-/g, '/'));
      },
      cd: function (t) {
        t = ko.unwrap(t);
        if (t < 0) return "00:00";
        var h = parseInt(t / 60 / 60),
          m = parseInt(t / 60 % 60),
          s = parseInt(t % 60);
        h = h < 10 ? ("0" + h) : h;
        m = m < 10 ? ("0" + m) : m;
        s = s < 10 ? ("0" + s) : s;
        return h > 0 ? (h + ":" + m + ":" + s) : (m + ":" + s);
      },
      toM: function (s) {
        s = ko.unwrap(s);
        return Math.floor(s / 60);
      },
      format: function (d) {
        d = ko.unwrap(d);
        if (typeof d == 'string') {
          if (!d) return d;
          d = this.toDate(d);
        }
        if (typeof d == 'number') d = new Date(d);
        return d.Format('yyyy-MM-dd HH:mm:ss'); //warn
      }
    },
    init: function () {
      this.model = ko.mapping.fromJS(this.model);
      var that = this;
      this.model.upload.uploadStatusText = ko.computed(function () {
        var text = '';
        switch (this.model.upload.status()) {
          case 0:
            text = i18nHelper.getKeyValue('offlineExam.detail.chooseFile');
            break;
          case 1:
            text = i18nHelper.getKeyValue('offlineExam.detail.chooseFile');
            break;
          case 2:
            text = i18nHelper.getKeyValue('offlineExam.detail.reUpload');
            break;
          case 3:
            text = i18nHelper.getKeyValue('offlineExam.detail.uploading');
            break;
        }

        return text;
      }, this);
      ko.applyBindings(this);
      $.ajaxSetup({
        error: function (res) {
          var t = i18nHelper.getKeyValue('offlineExam.common.confirmCaption');
          try {
            var json = JSON.parse(res.responseText);
            t = json.message;
          } catch (e) {}
          that.alert(t, null);
        }
      });
      $.when(store.dm.getDetail())
        .pipe($.proxy(this.questions, this))
        .pipe($.proxy(this._init, this))
        .always($.proxy(this.timer, this));
      var func = $.proxy(this.close, this);
      this.model.exam.mark.status.subscribe(function (value) {
        if (!value && this.model.exam.mark.time_left() <= 0 && !this.model.preview()) {
          this.alert(i18nHelper.getKeyValue('offlineExam.detail.alertTips1'), func);
        }
      }, this)
    },
    _init: function (detail, question, realDetail) {
      var stem = this.model.stem,
        exam = detail.exam;
      stem.complex_body(question.complex_body);
      if (question.body_attachments && question.body_attachments[0])
        stem.body_attachments(question.body_attachments);
      if (exam.type == "exercise") {
        exam.submit_node_list = $.map(question.sub_items || [], function (item) {
          return {
            title: item.body,
            duration: 0,
            description: ""
          }
        });
      }
      this.peel(detail, realDetail);
      this.model.init(true);
    },
    peel: function (detail, realDetail) {
      var userData = realDetail.user_data,
        now = +this.kits.toDate(detail.now),
        startTime = +this.kits.toDate(realDetail.exam_room.begin_time),
        that = this,
        exam = detail.exam,
        exam_room = realDetail.exam_room;

      var funObj = this.model.exam;
      type = +(exam.type != "exam");
      var nodeList = $.map(exam.submit_node_list, $.proxy(this.nodeTrans, this, realDetail.user_data.submit_node_list, userData, type, startTime, now));
      this.model.node(nodeList);
      type && this.showAnalysis(true);
      document.title = detail.exam.title + i18nHelper.getKeyValue('offlineExam.detail.answerPage');
      this.model.analysis.analysis_cond_status(exam.analysis_cond_status);
      this.model.analysis.analysis_allowed(exam.analysis_allowed);
      funObj.begin_time(realDetail.exam_room.begin_time);
      funObj.cyclic_strategy(exam.cyclic_strategy);
      funObj.submit_time(userData.submit_time);
      funObj.type(type);
      funObj.title(exam.title);
      if (exam.cyclic_strategy && exam_room.end_time) {
        var markEndSeconed = exam.mark_apply_end_time || 0;
        var realEndTime = +this.kits.toDate(exam_room.end_time);
        var markEndTime = realEndTime + markEndSeconed * 1000;
        funObj.end_time(realEndTime);
        if (!type) {
          funObj.analysis_cond_data.begin_time(realEndTime);
          try {
            var end = JSON.parse(exam.analysis_cond_data);
            funObj.analysis_cond_data.end_time(end.end_seconds * 1000 + realEndTime);
          } catch (e) {}
          funObj.mark.time_left(parseInt(markEndTime - now) / 1000);
          funObj.mark.dv(markEndSeconed);
          funObj.mark.end_time(markEndTime);
          funObj.mark.status(this.markStatus(funObj.mark.time_left(), markEndSeconed));
          funObj.submit_time(markEndTime > now ? userData.submit_time : -1);
        }
      }
    },
    nodeTrans: function (realNodeList, userData, type, time, now, node, index) { //再优化
      var userNodeList = realNodeList || [];
      var userNode = userNodeList[index] || {
        submit_time: "",
        attachment: {
          id: "",
          name: "",
          size: 0,
          description: "",
          url: "",
          prview_url: ""
        }
      };
      var sy = time + node.duration * 1000 - now;
      if ((sy <= 0 || userData.submit_time) && type == 0) {
        if (userNode.attachment.id) userNode.status = 1;
        else userNode.status = 2;
      } else {
        userNode.status = 0;
        if (type == 1 && userNode.attachment.id) userNode.status = 1;
      }
      userNode.time_left = parseInt(sy / 1000);
      userNode.analysis_items = [];
      var result = ko.mapping.fromJS($.extend({}, userNode, node));
      if (type) {
        result.attachment.id.subscribe($.proxy(this.showAnalysis, this), this);
      }
      return result
    },
    showAnalysis: function () {
      var zz = false,
        result;
      return function (nv) {
        if (zz || !nv) return;
        zz = true;
        var qid = this.model.exam.qid(),
          nodes = this.model.node(),
          p;
        if (!result) p = store.analysis.findAll(qid);
        else p = $.when(result);
        p.done(function (res) {
          result && (result = res);
          var ana = res[0];
          if (ana) {
            $.each(ana.items || [], function (index, item) {
              var att = item.answer_attachments || [],
                node = nodes[index];
              if (node.attachment.id() && !node.analysis_items().length) {
                node.status(1);
                node.analysis_items(att);
              }
            });
          }
        }).always(function () {
          zz = false;
        })
      }
    }(),
    questions: function (detail) {
      var ids = [];
      try {
        var parts = detail.user_data.paper.parts,
          that = this;
        ids = $.map(parts, function (part) {
          return part.question_identities
        });
        this.model.exam.qid(ids);
      } catch (e) {}
      var d = $.Deferred();
      if (ids && ids.length) {
        if (detail.analysis_allowed && detail.exam.type == "exam") {
          store.analysis.findAll(ids).done(function (res) {
            var ana = res[0];
            if (ana) {
              var items = $.map(ana.items, function (item) {
                return item.answer_attachments
              });
              that.model.analysis.items(items || []);
            }
          })
        }
        store.dm.getQuestions(ids).done(function (res) {
          var question = res[0];
          if (question) {
            store.dm.getSessionDetail().done(function (data) {
              d.resolve(detail, question, data);
            });
          } else d.reject();
        })
      } else {
        d.reject();
      }
      return d.promise();
    },
    markStatus: function (tl, dv) {
      return +(tl > 0 && tl < dv);
    },
    tranPromise: function (promiseFn) {
      var defer = $.Deferred();
      promiseFn().then(defer.resolve, defer.reject);
      return defer.promise();
    },
    submitDM: function (s) {
      var that = this,
        mark = this.model.exam.mark;
      if (!mark.status()) return;
      var e = s ? (ko.unwrap(this.model.exam.type) ? i18nHelper.getKeyValue('offlineExam.detail.confimSubmitExercise') : i18nHelper.getKeyValue('offlineExam.detail.confimSubmitExam')) : i18nHelper.getKeyValue('offlineExam.detail.giveUpExam');
      this.confirm(e, function () {
        if (!ko.unwrap(that.model.exam.type)) {
          store.answer.syn().pipe(function (res) {
            var markEndTime = mark.end_time(),
              now = +that.kits.toDate(res.date);
            if (!markEndTime || markEndTime > now)
              return store.dm.submit(s);
            that.model.exam.submit_time(-1);
          }).done(function (res) {
            if (res) location.href = 'prepare?tmpl_id=' + EXAMID;
          });
        } else {
          store.dm.submit(s)
            .done(function (res) {
              location.href = 'prepare?tmpl_id=' + EXAMID;
            });

        }
      });
    },
    alert: function (text, cb) {
      var that = this;
      $.fn.udialog.alert(text, {
        buttons: [{
          text: i18nHelper.getKeyValue('offlineExam.common.confirmBtn'),
          click: function () {
            if ($.isFunction(cb)) cb();
            $(this).udialog('hide');
          },
          'class': 'default-btn bt-md bt-primary'
        }],
        icon: "",
        title: i18nHelper.getKeyValue('offlineExam.common.confirmCaption'),
        dialogClass: 'udialog sys-confirm'
      })
    },
    confirm: function (text, cb) {
      $.fn.udialog.confirm(text, [{
        text: i18nHelper.getKeyValue('offlineExam.common.cancel'),
        click: function () {
          $(this).udialog('hide');
        },
        'class': 'default-btn bt-md bt-nobg'
      }, {
        text: i18nHelper.getKeyValue('offlineExam.common.confirmBtn'),
        click: function () {
          if ($.isFunction(cb)) cb();
          $(this).udialog('hide');
        },
        'class': 'default-btn bt-md bt-primary'
      }])
    },
    submitAN: function () {
      var data = ko.mapping.toJS(this.model.upload),
        that = this;
      if (!data.attachment.id) return;
      var index = that.model.upload.index(),
        node = that.model.node()[index];

      if (!that.model.exam.type()) {
        var text, func = $.proxy(this.close, this);
        if (node.time_left() < 0) {
          this.alert(i18nHelper.getKeyValue('offlineExam.detail.alertTips1'), func);
          return;
        }
        if (!this.model.exam.mark.time_left() < 0) {
          this.alert(i18nHelper.getKeyValue('offlineExam.detail.alertTips2'), func);
          return;
        }
      }
      this.confirm(i18nHelper.getKeyValue('offlineExam.detail.alertTips3'), function () {
        store.answer.submit(data.index, data.attachment).done(function () {
          ko.mapping.fromJS(data.attachment, {}, node.attachment);
          that.close();
        });
      })

    },
    timer: function () {
      var that = this,
        mark = this.model.exam.mark;

      function start() {
        setTimeout(function () {
          // mark.status(!mark.status());
          var tl = mark.time_left;
          if (tl()) {
            tl(tl() - 1);
            mark.status(that.markStatus(tl(), mark.dv()));
          }
          $.each(that.model.node(), function (index, obj) {
            var func = obj.time_left;
            if (obj.time_left == 1600) {
              that.model.showTimeModal(true);
            }
            if (func() <= 0) {
              if (obj.attachment.id()) obj.status(1);
              else obj.status(2);
              return;
            }
            func(func() - 1);
          });
          start();
        }, 1000)
      }

      var exam = this.model.exam;
      if (!exam.type() && !exam.submit_time() && !this.model.preview()) start();
    },
    upload: function (index) {
      var cs = ko.mapping.toJS(this.model.cs),
        promise, that = this;
      if (cs.url) promise = $.when(cs);
      else promise = store.cs.upload();
      this.model.upload.index(index);
      promise.done(function (cs) {
        ko.mapping.fromJS(cs, {}, that.model.cs);
        that.initSwf(cs);
      });
      var node = this.model.node()[index],
        attachment = ko.mapping.toJS(node.attachment);
      ko.mapping.fromJS(attachment, {}, this.model.upload.attachment);
      this.model.upload.status(0);
      attachment.url && this.model.upload.status(2);
      this.timer.sub = node.time_left.subscribe(this.clock, this);
      this.clock(node.time_left());

    },
    clock: function (nv) {
      var _self = this;
      if (!this.model.exam.type() && nv === 0 && _self.model.upload.index() != -1) {
        // 考试时间已结束弹窗
        var data = ko.mapping.toJS(this.model.upload);
        if (!data.attachment.id) {
          _self.alert(i18nHelper.getKeyValue('offlineExam.detail.alertTips2'), function () {
            _self.close();
          });
          return;
        }
        var index = _self.model.upload.index(),
          node = _self.model.node()[index];
        store.answer.submit(data.index, data.attachment).done(function () {
          ko.mapping.fromJS(data.attachment, {}, node.attachment);
          _self.alert(i18nHelper.getKeyValue('offlineExam.detail.alertTips2'), function () {
            _self.closeToPrepare();
          });
        });
      }
      if (nv < 0) return;
      var d = this.kits.cd(nv),
        h = d.split(':'),
        len = h.length,
        timer = this.model.timer;
      timer.s(h[len - 1]);
      timer.m(h[len - 2]);
      timer.h(h[len - 3] || "00");
    },
    closeToPrepare: function () {
      this.uploader && this.uploader.destroy();
      this.model.upload.index(-1);
      location.href = selfUrl + '/' + code + '/exam/offline_exam/prepare?tmpl_id=' + EXAMID;
    },
    close: function () {
      this.uploader && this.uploader.destroy();
      this.model.upload.index(-1);
      if (this.timer.sub) this.timer.sub.dispose();

    },
    initSwf: function (cs) {
      this.uploader = new WebUploader.Uploader({
        swf: staticurl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
        server: cs.url,
        auto: true,
        duplicate: true,
        pick: {
          id: '#js_uploader',
          multiple: false
        },
        formData: {
          path: cs.path
        },
        fileSingleSizeLimit: 20 * 1024 * 1024,
        accept: [{
          title: "Images & Word",
          extensions: "gif,jpg,jpeg,bmp,png,pptx,ppt,doc,docx,xls,xlsx",
          mimeTypes: 'image/gif,image/jpeg,image/bmp,image/png,application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12'
        }]
      });
      this.uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
      this.uploader.on('uploadError', $.proxy(this.uploadError, this));
      this.uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, cs));
    },
    uploadError: function (file, reason) {
      this.alert(i18nHelper.getKeyValue('offlineExam.detail.alertTips4'));
      this.model.upload.status(2);
    },
    uploadBeforeSend: function (obj, file, headers) {
      file.type = undefined;
      file.scope = 1;
      headers.Accept = "*/*";

      this.model.upload.status(3);
    },
    uploadSuccess: function (cs, file, response) {
      var path = cs.server_url + '/download?path=' + cs.path + '&attachment=true&dentryId=' + response.dentry_id;
      var attachment = {
        name: file.name,
        id: response.dentry_id,
        size: file.size,
        description: file.name,
        url: path,
        preview_url: path
      };
      ko.mapping.fromJS(attachment, {}, this.model.upload.attachment);
      this.model.upload.status(2);
    }
  };
  $(function () {
    viewModel.init();
  })
})(window, jQuery);
