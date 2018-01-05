;
(function ($, ko, global) {

    function ViewModel () {
        this.model = {
            video: global.moduleConfig.studyVideoVo.video
        };
    }
    ViewModel.prototype = {
        constructor: ViewModel,
        initViewModel: function (el) {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, el);
        }
    };

    global.ready(function () {
        new ViewModel().initViewModel($('.md-video')[0]);
    });

}(jQuery, window.ko, window.global || (window.global = {})));