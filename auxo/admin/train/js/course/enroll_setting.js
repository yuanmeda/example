(function ($) {
    'use strict';
    var viewModel = {
        init: function () {
            ko.applyBindings(this);
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery);