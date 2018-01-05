(function (w, $) {
    'use strict';
    function Model(params) {
        this.type = params.type;
        this.forms = params.forms;
        this._init();
    }

    Model.prototype = {
        _init: function () {

        },
        initPlugin:function(){
            $("input[id^='datepicker']").datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'yy-mm-dd'
            });
        }
    };

    ko.components.register('x-enrollform', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    });
})(window, jQuery);