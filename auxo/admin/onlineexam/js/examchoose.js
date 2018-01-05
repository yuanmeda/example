(function ($) {
    var viewModel = {
        model: {

        },
        init: function () {
            this.model = ko.mapping.fromJS(viewModel.model);
            ko.applyBindings(this, document.getElementById('online_exam_setting'));
        },
        goOnline: function () {
            location.href = "http://" + location.host + "/" + projectCode + "/admin/online_exam/newcreate" + location.search;
        },
        goOfflline: function () {
            location.href = "http://" + location.host + "/" + projectCode + "/admin/offline_exam/create" + location.search;
        }
    }


    $(function() {
        viewModel.init();
    })
})(jQuery)