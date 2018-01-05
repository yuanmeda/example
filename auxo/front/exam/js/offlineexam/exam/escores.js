(function (w, $) {
  var REQ_URI = selfUrl + '/' + w.projectCode + '/v1/m/exams/',
    EXAM_ID = w.examId,
    USER_ID = w.userId;

  var store = {
    scores: {
      findAll: function () {
        return $.ajax({
          url: REQ_URI + EXAM_ID + '/user_started_history',
          dataType: 'json',
          cache: false
        })
      }
    }
  };

  var viewModel = {
    model: {
      items: [],
      t: w.t,
      init: true
    },
    init: function () {
      this.model = ko.mapping.fromJS(this.model);
      document.title = i18nHelper.getKeyValue('offlineExam.common.examRecord');
      ko.applyBindings(this);
      store.scores.findAll().done($.proxy(function (res) {
        this.model.items(res);
        this.model.init(true);
      }, this));
    },
    standardDate: function (d) {
      d = ko.unwrap(d);
      // return d.replace('T', ' ').substr(0, 19);
      return $.format.toBrowserTimeZone(Date.ajustTimeString(d), "yyyy-MM-dd HH:mm:ss");
    }
  }

  $(function () {
    viewModel.init();
  })
})(window, jQuery);
