(function ($) {
    var store = {
        saveScore: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/specialty_plans/' + specialtyId + '/learning_units/' + examId,
                data: JSON.stringify(data),
                type: 'PUT',
                contentType: 'application/json'
            });
        },
        getSpecialtyExamInfo: function () {
            return $.ajax({
                url: '/' + projectCode + '/specialty/specialty_plans/' + specialtyId + '/learning_units/' + examId
            })
        }
    };

    var viewModel = {
        model: {
            score: 0,
            errorMessage: ''
        },
        init: function () {
            var t = this;

            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            store.getSpecialtyExamInfo().done(function (data) {
                t.model.score(data.score);
            });
        },
        save: function () {
            var data = {
                score: this.model.score()
            };

            store.saveScore(data).done(function () {
                $.alert('保存成功')
            });
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery);