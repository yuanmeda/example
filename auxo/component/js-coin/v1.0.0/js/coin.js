;(function ($, window) {
    'use strict';
    function coinModel(params) {
        this.model = params.data;
        this.init();
    }

    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    coinModel.prototype = {
        init: function () {
        },
        formatStatus: function (status) {
            if (status === 0) {
                return "singleCoin.common.notUse"
            } else {
                return "singleCoin.common.used"
            }
        },
        formatTime: function (time) {
            return time.split('T')[0];
        }
    };

    ko.components.register('x-single-coin', {
        // synchronous: true,
        viewModel: coinModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
