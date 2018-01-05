/*
 公开课标签
 */
;(function ($, window) {
    var viewModel = {
        model: {
            url: ko.observable("")
        },
        _init: function () {
            var url = courseWebpage + '/' + projectCode + '/course/' + course_id + '/chapter?__mac=' + Nova.getMacToB64(courseWebpage + '/' + projectCode + '/course/' + course_id + '/chapter');
            this.model.url(url);
            ko.applyBindings(viewModel);
        }
    };
    viewModel._init();
})(jQuery, window);
