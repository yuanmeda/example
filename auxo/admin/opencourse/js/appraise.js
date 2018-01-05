(function ($, window) {
    'use strict';
    var viewModel = {
        init: function () {
            ko.applyBindings(this, document.getElementById('appraise-container'));
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);