(function (w, $) {
    var REQ_URI = selfUrl + '/' + w.projectCode + '/v1/m/exams/';
    var store = {
        node: {
            find: function (examId, roomId) {
                return $.ajax({
                    url: REQ_URI + examId + '/user_score_dm',
                    dataType: 'json',
                    cache: false,
                    data:{ room_id : roomId }
                })
            }
        }
    };
    var viewModel = {
        model: {
            dm: {
                pass_status: 0,
                subject_node_list: []
            },
            init: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            document.title = i18nHelper.getKeyValue('offlineExam.score.resultsIntro');
            ko.applyBindings(this);
            var that = this;
            store.node.find(w.id, w.roomId).done(function (res) {
                ko.mapping.fromJS(res, {}, that.model.dm);
                that.model.init(true);
            });
        }

    };
    $(function () {
        viewModel.init();
    })
})(window, jQuery);