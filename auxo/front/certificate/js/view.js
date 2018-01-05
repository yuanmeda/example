;
(function(window, $) {
    'use strict';

    // 数据模型
    function View(code) {
        this._init();
    }

    View.prototype = {
        _init: function() {
            $('.mobile_container_js').fadeIn(50);
        }
    };

    // 启动入口
    $(function() {
        View.code = projectCode;
        document.title=i18nHelper.getKeyValue('certificate.view.detail');
        ko.applyBindings(new View());
    });

})(window, jQuery);
