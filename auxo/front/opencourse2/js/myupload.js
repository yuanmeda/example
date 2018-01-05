(function ($, window) {
    'use strict';
    var store = {

    };

    var viewModel = {
        model: {

        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('container'));
        }
    };
    $(function () {
        viewModel._init();
    });

})(jQuery, window);
