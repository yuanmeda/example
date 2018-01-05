(function (window, $) {
    'use strict';
    var channelMap = {
        CHANNEL_CASH: '现金支付',
        CHANNEL_WECHAT: '微信支付',
        CHANNEL_ALIPAY: '支付宝支付',
        CHANNEL_FZF: '富支付',
        CHANNEL_EMONEY: '代币支付',
        CHANNEL_POINT: '养成支付',
        CHANNEL_GOLD: '金币支付',
        CHANNEL_GUARDCOIN: '守护币支付'
    };
    var viewModel = function () {
        this.store = {
            query: function (data) {
                return $.ajax({
                    url: '/v1/orders/mine',
                    data: data
                });
            }
        };
        this.paylist = ko.observableArray([]);
        this.page = ko.observable(0);
        this.size = ko.observable(20);
        this.channelMap = channelMap;
        this._init();
    };
    viewModel.prototype = {
        _init: function () {
            this._query()
                .then($('#pay_container_js').show());
        },
        _query: function () {
            var vm = this,
                _page = this.page(),
                _size = this.size();
            return this.store.query({
                page: _page,
                size: _size
            }).then(function (d) {
                vm.paylist(d.items);
                vm._pagination(d.total, _size, _page);
                ko.applyBindings(vm);
                vm.postMsgToParent();
            });
        },
        _pagination: function (count, size, page) {
            var $target = $('#pagination'),
                vm = this;
            $target.pagination(count, {
                items_per_page: size,
                num_display_entries: 5,
                current_page: page,
                is_show_total: true,
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (pageNum) {
                    if (pageNum != page) {
                        vm.page(pageNum);
                        vm._query();
                    }
                }
            });
        },
        postMsgToParent: function () {
            var msg = {
                "type": "$resize",
                "data": {
                    "width": document.body.scrollWidth + 'px',
                    "height": document.body.scrollHeight + 'px'
                },
                "origin": location.host,
                "timestamp": +new Date()
            };
            window.parent.postMessage(JSON.stringify(msg), '*');
        }
    };
    $(function () {
        new viewModel();
        //ko.applyBindings(new viewModel(), document.body);
        document.title = i18nHelper.getKeyValue('myPay.payRecord');
    });
})(window, jQuery);
