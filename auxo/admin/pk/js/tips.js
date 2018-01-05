/**
 * Created by Administrator on 2017/4/25 0025.
 */
(function (w, $) {
    var viewModel = {
        init: function () {
            ko.applyBindings(this);
        }
    };
    $(function () {
        viewModel.init();
    })
})(window, jQuery);