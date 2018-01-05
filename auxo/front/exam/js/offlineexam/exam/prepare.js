(function ($, w) {
  'use strict';
  //数据仓库
  var REQ_P = selfUrl + '/' + w.projectCode,
    REQ_URI = '/v1/m/exams/',
    FULL_REQ_URL = REQ_P + REQ_URI;
  var store = {
    tmpl: {
      ready: function (tmplId) {
        return $.ajax({
          url: FULL_REQ_URL + tmplId + '/sessions/prepare',
          type: 'POST',
          dataType: 'json',
          data: JSON.stringify({
            exam_id: tmplId
          }),
          contentType: 'appliction/json'
        })
      },
      start: function (tmplId, sessionId) {
        return $.ajax({
          url: FULL_REQ_URL + tmplId + '/sessions/' + sessionId + '/start',
          type: 'POST',
          dataType: 'json',
          contentType: 'appliction/json'
        })
      }
    },
    ueView: {
      findone: function (tmplId) {
        return $.ajax({
          url: FULL_REQ_URL + tmplId + '/mine_detail',
          cache: false,
          dataType: "json"
        })
      }
    }
  };
  var TYPTTEXT = {
    exam: i18nHelper.getKeyValue('offlineExam.prepare.exam'),
    exercise: i18nHelper.getKeyValue('offlineExam.prepare.exercise')
  }
  var viewModel = {
    model: {
      detail: {
        id: tmplId,
        title: "",
        exam_chance: "",
        description: "",
        date_list: [],
        attachments: [],
        all_attachment: '',
        cyclic_strategy: -1,
        type: 'exam',
        begin_time: "",
        end_time: ""
      },
      ueView: {
        status: 0,
        exam_chance: 0,
        session_id: ""
      },
      sView: {
        text: "",
        disabled: true
      },
      init: false,
      timer: {
        duration: 0,
        time_left: 0,
        cz: 0
      }
    },
    init: function () {
      this.model = ko.mapping.fromJS(this.model);
      this.model.sView.reset = ko.pureComputed(function () {
        var ise = this.model.detail.type() != "exam",
          disabled = this.model.sView.disabled(),
          isR = this.model.ueView.status() == 16 || this.model.ueView.status() == 32;
        return ise && !disabled && isR
      }, this);
      this.typeText = TYPTTEXT;
      ko.applyBindings(this);
      $.ajaxSetup({
        error: function (res) {
          var t = i18nHelper.getKeyValue('offlineExam.common.systemError');
          try {
            var json = JSON.parse(res.responseText);
            t = json.message;
          } catch (e) {}
          that.alert(t, null);
        }
      })
      var tmplId = w.tmplId,
        that = this;
      this.initUserView(tmplId);
    },
    alert: function (text, cb) {
      var that = this
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
    initUserView: function (tmplId) {
      var that = this;
      store.ueView.findone(tmplId).done(function (res) {
        var detail = that.model.detail;
        document.title = res.exam.title + ' - ' + that.typeText[res.exam.type];
        $.each(detail, function (key, func) {
          func(res.exam[key]);
        });
        that.model.detail.begin_time(res.begin_time);
        that.model.detail.end_time(res.end_time);
        that.model.ueView.status(res.status);
        that.model.ueView.exam_chance(res.exam_chance);
        that.model.ueView.session_id(res.session_id);
        if (res.begin_time && res.end_time) {
          var startTime = that.toLongDate(detail.begin_time()),
            endTime = that.toLongDate(detail.end_time());
          that.model.timer.duration(endTime - startTime);
          that.model.timer.time_left(endTime - now);
          that.timer();
        }
        that.prepare(res.status, startTime || 0);
        that.model.init(true);
      })
    },
    prepare: function (nv, startTime) {
      var chance = this.model.ueView.exam_chance;
      var examId = w.tmplId,
        that = this,
        r = $.when(null);
      this.bt(nv, parseInt((startTime - w.now) / 1000));
      if (nv == 4 || (nv == 32 && chance())) {
        r = store.tmpl.ready(examId);
      }
      r.done(function success(res) {
        if (res) that.model.ueView.session_id(res.session_id);
      })
    },
    start: function (reset) {
      var examId = w.tmplId,
        sessionId = this.model.ueView.session_id(),
        status = this.model.ueView.status(),
        p;
      if (this.model.sView.disabled() || !sessionId) return;
      if (status === 8 && reset !== true) p = $.when();
      else p = store.tmpl.start(examId, sessionId)
      p.done(function () {
        location.href = "detail?exam_id=" + examId + '&session_id=' + sessionId;
      })
    },
    reset: function () {
      if (this.model.sView.disabled()) return;
      var examId = this.model.detail.id(),
        that = this;
      store.tmpl.ready(examId)
        .pipe(function (res) {
          that.model.ueView.session_id(res.session_id);
          return true;
        }).pipe($.proxy(this.start, this));
    },
    splitDate: function (date) {
      // return date.replace('T', ' ').substr(0, 19);
      return $.format.toBrowserTimeZone(Date.ajustTimeString(date), "yyyy-MM-dd HH:mm:ss");
    },
    toLongDate: function (date) {
      date = ko.unwrap(date);
      return +new Date(this.splitDate(date).replace(/-/g, '/'))
    },
    bt: function (s, dv) {
      var btxt = "",
        disabled = true,
        type = this.model.detail.type();
      switch (s) {
        case 1:
          if (dv > 600) btxt = i18nHelper.getKeyValue('offlineExam.prepare.notTime') +
            TYPTTEXT[type] + i18nHelper.getKeyValue('offlineExam.prepare.textTime');
          else btxt = i18nHelper.getKeyValue('offlineExam.common.wait');
          break;
        case 4:
        case 112:
          btxt = i18nHelper.getKeyValue('offlineExam.prepare.start') + TYPTTEXT[type];
          disabled = false;
          break;
        case 8:
          btxt = i18nHelper.getKeyValue('offlineExam.common.goOn') + TYPTTEXT[type];
          disabled = false;
          break;
        case 32:
          var chance = this.model.ueView.exam_chance();
          if (chance !== null && chance <= 0) btxt = i18nHelper.getKeyValue('offlineExam.prepare.noTime');
          else {
            disabled = false;
            btxt = (type == 'exam') ? i18nHelper.getKeyValue('offlineExam.prepare.start') + TYPTTEXT[type] : '';
          }
          break;
        case 64:
        case 80:
        case 96:
          btxt = TYPTTEXT[type] + i18nHelper.getKeyValue('offlineExam.common.finished');
          break;
      }
      ko.mapping.fromJS({
        text: btxt,
        disabled: disabled
      }, {}, this.model.sView);
    },
    timer: function () {
      var tFunc = this.model.timer.time_left,
        d = this.model.timer.duration(),
        that = this;

      function cz(params) {
        setTimeout(function () {
          var t = tFunc() - 1000;
          tFunc(t);
          var dv = parseInt((t - d) / 1000);
          if (dv >= 0) {
            that.model.timer.cz(dv);
            that.bt(1, dv);
          } else {
            location.reload();
          }
          cz();
        }, 1000);
      }

      if (tFunc() > d) cz();
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
    }
  };
  $(function () {
    viewModel.init();
  })
})(jQuery, window);
