(function ($) {
    var store = {
        query: function () {
            var url = (window.selfUrl || '') + "/v1/business_courses/" + course_id + "/knowledges";
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'JSON',
                contentType: "application/json"
            });
        },
        lesson: {
            info: function (lessionId) {
                return $.ajax({
                    url: (window.selfUrl || '') + "/v1/business_courses/" + course_id + "/lessons/" + lessionId + "/resources",
                    type: 'GET',
                    dataType: 'JSON',
                    contentType: "application/json"
                });
            },
            progresses: function (data) {
                return $.ajax({
                    url: window.business_course_service_url + "/v1/business_course_study_activity/actions/search",
                    type: 'POST',
                    dataType: 'JSON',
                    data: JSON.stringify(data),
                    contentType: "application/json"
                });
            }
        }
    };

    var viewModel = {
        model: {},
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
        },
        updateLesson: function (data) {

        }
    };

    $(function () {
        viewModel.init();
    })
})(jQuery);
