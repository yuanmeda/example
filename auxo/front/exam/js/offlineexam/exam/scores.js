(function (w, $) {

  var REQ_URI = selfUrl + '/' + w.projectCode + '/v1/m/exams/',
    EXAMID = w.examId
  var store = {
    scores: {
      findAll: function (examId) {
        return $.ajax({
          url: REQ_URI + examId + '/scores/mine',
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
      var that = this;
      store.scores.findAll(EXAMID).done(function (res) {
        that.model.items(res);
        that.model.init(true);
      });
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
