;(function ($, window) {
    'use strict';
    var store = {
        getAllCourse: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/v1/trains/' + train_id + '/courses',
                data: data,
                dataType: 'json'
            })
        }
    };
    var viewModel = {
        model: {
            courses: []
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.courses = [];
            this.getAllCourse();
        },
        getAllCourse: function () {
            var _self = this;
            store.getAllCourse().done(function (data) {
                var courses = $.map(data, function (value) {
                    return {id: value.course_id, name: value.title};
                });
                _self.model.courses(courses);
                _self.courses = courses;
                ko.applyBindings(_self, document.getElementById('appraise-container'));
            })
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);