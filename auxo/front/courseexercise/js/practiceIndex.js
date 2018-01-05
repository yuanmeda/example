(function ($, window) {
    'use strict';
    var viewModel = {
        _init: function () {
            ko.applyBindings(this);
            /*默认选中第一个根节点*/
            /*setTimeout(function () {
                var firstChapter = $($($('.dlist')[0]).children()[1]);
                firstChapter.click();
            },500);*/
        }
    };
    $(function () {
        viewModel._init();
    });
})(jQuery, window);
