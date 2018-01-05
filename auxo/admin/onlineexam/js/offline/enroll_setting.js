(function ($, window) {
    'use strict';
    var viewModel = {
        init: function () {
            ko.applyBindings(this);
        },
        geturl: function() {
            return elearning_enroll_gateway_url + "/" + projectCode + "/enroll/setting?unit_id=" + offline_exam_id + "&__mac=" + Nova.getMacToB64(elearning_enroll_gateway_url + '/' + projectCode + '/enroll/setting?unit_id=$' + offline_exam_id);
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);