;(function ($, window) {
    'use strict';
    var viewModel = {
        model: {
            train: {
                id: train_id,
                title: train_title,
                logo_url: train_url
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('appraise-container'));
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);