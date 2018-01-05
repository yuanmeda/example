;
(function(window, $) {
    'use strict';

    // 数据模型
    function Goods(code) {
        this.gId = code;
        this.goods = ko.observableArray([]);
        this.loading = ko.observable(false);
        // store
        this.store = {
            query: function(gId) {
                return $.ajax({
                    url: selfUrl + '/' + Goods.code + '/certificates/materialInfo',
                    data: {
                        no: gId
                    }
                });
            }
        };

        this._init();
    }

    Goods.prototype = {

        _init: function() {
            this._list()
                .then(function() {
                    $('.mobile_container_js').fadeIn(50);
                });
        },

        _list: function() {
            var vm = this,
                _data;
            this.loading(true);
            return this.store.query(this.gId)
                .then(function(d) {
                    if (d && d.length) {
                        vm.goods(d[0].traces.reverse());
                    }
                });
        }
    };

    // 启动入口
    $(function() {
        Goods.code = projectCode;
        FastClick.attach(document.body);
        document.title = i18nHelper.getKeyValue('certificate.goods.goodInfo');
        ko.applyBindings(new Goods(gId));
    });

})(window, jQuery);
