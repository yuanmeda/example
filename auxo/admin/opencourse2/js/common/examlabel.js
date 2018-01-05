/*
 公开课标签
 */
;(function ($, window) {
    var viewModel = {
        model: {
            url: ko.observable("")
        },
        _init: function () {
            var url = tag_gateway_url + "/" + projectCode + "/tag/label?custom_type=" + custom_type + "&__mac=" + Nova.getMacToB64(tag_gateway_url + "/" + projectCode + "/tag/label?custom_type=" + custom_type);
            this.model.url(url);
            ko.applyBindings(viewModel);
        }
    };
    viewModel._init();
})(jQuery, window);
