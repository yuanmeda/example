(function ($) {
    var viewModel = {
        model: {
            periodic_exam_id: ""
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
        },
        edit: function () {
            window.open(window.self_host + "/" + window.project_code + "/periodic_exam/setting?periodic_exam_id=" + this.model.periodic_exam_id());
        },
        into: function () {
            window.open(window.self_host + "/" + window.project_code + "/periodic_exam/detail?periodic_exam_id=" + this.model.periodic_exam_id());
        },
        score: function () {
            window.open( window.self_host + "/" + window.project_code + "/periodic_exam/admin/session_users?periodic_exam_id=" + this.model.periodic_exam_id());
        },
        peridoc: function () {
            window.open(window.self_host + "/" + window.project_code + "/periodic_exam/admin/sessions?periodic_exam_id=" + this.model.periodic_exam_id());
        }
    }

    $(function () {
        viewModel.init();
    })
})(jQuery);
