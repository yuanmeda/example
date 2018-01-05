import ko from 'knockout'
import tpl from './template.html'
import dialogHelper from './dialogHelper'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            filter: {
                status: ko.observable(),// -1已失效，0未支付，1支付成功
                page: ko.observable(0),
                limit: 20
            },
            order: {
                items: ko.observableArray(),
                total: ko.observable(0)
            },
        };
        this.model.filter.offset = ko.pureComputed(() => {
            return this.model.filter.limit * this.model.filter.page();
        });
        this.store = {
            getUserOrders: (filter) => {
                return $.ajax({
                    url: `/v2/order/actions/query_current_user_orders`,
                    type: 'post',
                    dataType: 'json',
                    data: JSON.stringify(filter),
                    contentType: 'application/json;charset=utf-8'
                });
            },
            regenerateVouchers: (orderId) => {
                return $.ajax({
                    url: `${PAY_SERVICE_URL}/v2/orders/${orderId}/actions/regenerate_vouchers`,
                    type: 'post',
                    dataType: 'json',
                });
            },
            cancelOrder: (orderId) => {
                return $.ajax({
                    url: `${PAY_SERVICE_URL}/v2/orders/${orderId}/actions/cancel`,
                    type: 'post',
                    dataType: 'json',
                });
            }
        };
        this.init();
    }

    init() {
        this.pageQuery();
    }


    pageQuery() {
        let filter = ko.mapping.toJS(this.model.filter);
        filter.page = undefined;
        this.store.getUserOrders(filter).done(res => {
            this.model.order.items(res.items);
            this.model.order.total(res.total);
            this.page();
        }).always(() => {
            this.postMsgToParent();
        });
    }

    regenerateVouchers(order) {
        var w = window.open();
        this.store.regenerateVouchers(order.id).done((res) => {
            w.location.href = `/${projectCode}/pay/commodity?order_id=${res.id}&__return_url=${encodeURIComponent(`${auxoMystudyWebUrl}/${projectCode}/mystudy/user_center#my-dist-courses-order`)}`;
        })
    }

    cancelOrder(order) {
        this.store.cancelOrder(order.id).done(() => {
            this.model.filter.page(0);
            this.pageQuery();
        });
    }

    formatTime(time) {
        return time && time.split('.')[0].replace('T', ' ');
    }

    formatStatus(status) {
        return _i18nValue({
            '-1': 'payMine.closed',
            '0': 'payMine.waitForPay',
            '1': 'payMine.paid'
        }[status] || 'payMine.unknown');
    }

    page() {
        let filter = this.model.filter;
        $("#pagination").pagination(this.model.order.total(), {
            is_show_first_last: false,
            is_show_input: true,
            is_show_total: false,
            items_per_page: filter.limit,
            num_display_entries: 5,
            current_page: filter.page(),
            prev_text: "common.addins.pagination.prev",
            next_text: "common.addins.pagination.next",
            callback: (index) => {
                if (index != filter.page()) {
                    filter.page(index);
                    this.pageQuery();
                }
            }
        })
    }

    postMsgToParent() {
        if (window.parent === window) return;
        let msg = {
            "type": "$resize",
            "data": {
                "width": document.body.scrollWidth,
                "height": document.body.scrollHeight + 50
            },
            "origin": location.host,
            "timestamp": +new Date()
        };
        window.parent.postMessage(JSON.stringify(msg), '*');
    }

    handleTabClick(type) {
        this.model.filter.status(type);
        this.model.filter.page(0);
        this.pageQuery();
    }

    handlePayClick($data) {
        this.regenerateVouchers($data);
    }

    handleCancelPayClick($data) {
        dialogHelper.confirm(_i18nValue('payMine.cancelOrderConfirm'), () => {
            this.cancelOrder($data);
        });
        setTimeout(() => {
            this.postMsgToParent();
        }, 13)
    }

}

ko.components.register('x-pay-my-order', {
    viewModel: ViewModel,
    template: tpl
});