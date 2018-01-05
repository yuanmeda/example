/*
 公开课标签
 */
;(function ($, window) {
    var viewModel = {
        model: {
            url: ko.observable("")
        },
        _init: function () {
            var url = courseWebpage + '/' + projectCode + '/admin/course/' + course_id + '/knowledge_map?__mac=' + Nova.getMacToB64(courseWebpage + '/' + projectCode + '/admin/course/' + course_id + '/knowledge_map');
            this.model.url(url);
            ko.applyBindings(viewModel);
        }
    };
    viewModel._init();
})(jQuery, window);
