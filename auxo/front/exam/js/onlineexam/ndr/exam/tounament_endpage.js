(function ($) {
  var store = {
    getMyExamInfo: function () {
      return $.ajax({
        url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/mine",
        type: "get",
        async: true,
        dataType: "json",
        cache: false,
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
        }
      });
    },
    getUserExamSessionInfo: function () {
      return $.ajax({
        url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/sessions/" + sessionId,
        type: "get",
        async: true,
        dataType: "json",
        cache: false,
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
        }
      });
    },
    getUserRanking: function () {
      return $.ajax({
        url: selfUrl + '/' + projectCode + "/v1/m/exams/" + examId + "/users/ranking/" + userId,
        type: "get",
        async: true,
        dataType: "json",
        cache: false,
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Accept-Language', decodeURIComponent(language));
        }
      })
    }
  };

  var viewModel = {
    model: {
      mine: {
        correct_rate: 0,
        ranking: 0,
        cost_times: 0,
        correct_count: 0,
        score: 0,
      },
      exam: {
        id: "",
        title: "",
        passing_score: 0,
        analysis_allowed: false,
        ranking_able: true,
        reward_ranking_able: true,
        history_able: true
      }
    },
    init: function () {
      this.model = ko.mapping.fromJS(this.model);
      this.model.mine.format_cost_times = ko.computed(function () {
        return this._toTimeString(this.model.mine.cost_times() * 1000);
      }, this);

      this.model.mine.examPassed = ko.computed($.proxy(function () {
        return this.model.mine.correct_rate() >= 50
      }, this));

      ko.applyBindings(this, document.getElementById("end"));

      this.initMyInfo();
      this.initRankingInfo();
    },
    initRankingInfo: function () {
      store.getUserRanking().done($.proxy(function (data) {
        if (data) {
          this.model.mine.ranking(data.ranking);
        }
      }, this));
    },
    initMyInfo: function () {
      store.getMyExamInfo().done($.proxy(function (data) {
        this.model.exam.id(data.exam_id);
        this.model.exam.title(data.name);
        this.model.exam.passing_score(data.passing_score);
        this.model.exam.analysis_allowed(data.analysis_allowed);
        this.model.exam.history_able(data.history_able);
        this.model.exam.ranking_able(data.ranking_able);
        this.model.exam.reward_ranking_able(data.reward_ranking_able);

        document.title = data.name;
      }, this));
      store.getUserExamSessionInfo().done($.proxy(function (data) {
        if (data && data.user_data) {
          this.model.mine.correct_rate(data.user_data.correct_rate);
          this.model.mine.cost_times(data.user_data.cost_times);
          this.model.mine.score(data.user_data.score);
          this.model.mine.correct_count(data.user_data.correct_count);
        }
      }, this));
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
    _toTimeString: function (span) {
      span = Math.ceil(parseInt((span / 1000) + ""));
      var h = parseInt((span / 3600) + "");
      var m = parseInt((span / 60) + "") % 60;
      var s = span % 60;

      return (h < 10 ? '0' + h : '' + h) + ":" + (m < 10 ? '0' + m : '' + m) + ":" + (s < 10 ? '0' + s : '' + s);
    }
  };

  viewModel.init();
})(jQuery);