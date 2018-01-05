import ko from 'knockout'
import tpl from './template.html'
import dialogHelper from './dialogHelper'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;

class ViewModel {
    constructor(params) {
        this.model = {
            order: ko.observable(),
            goodsSnapshots: ko.observableArray(),
            channels: ko.observableArray(),
            selectChannel: ko.observable(),
            payParams: ko.observable(),
            success: ko.observable(false),
            showQRcodeMask: ko.observable(false)
        };
        this.store = {
            getOrder: () => {
                return $.ajax({
                    url: `${PAY_SERVICE_URL}/v2/orders/${orderId}`,
                    dataType: 'json',
                    cache: false
                });
            },
            getGoodsSnapshots: () => {
                return $.ajax({
                    url: `${PAY_SERVICE_URL}/v2/orders/${orderId}/goods_snapshots`,
                    dataType: 'json',
                    cache: false
                });
            },
            getChannels: function () {
                return $.ajax({
                    url: `${PAY_SERVICE_URL}/v1/account/web_channels`,
                    dataType: 'json',
                    cache: false
                });
            },
            createOrderVoucher: function (data) {
                return $.ajax({
                    url: `${PAY_SERVICE_URL}/v1/orders/voucher`,
                    dataType: 'json',
                    type: 'post',
                    contentType: 'application/json;charset=utf-8',
                    data: JSON.stringify(data)
                });
            },
            getOrderStatus: function () {
                return $.ajax({
                    url: `${PAY_SERVICE_URL}/v1/orders/${orderId}/status`,
                    dataType: 'json',
                    cache: false
                });
            },
        };
        this.init();
    }

    init() {
        $.when(this.store.getOrder(), this.store.getGoodsSnapshots()).then((r1, r2) => {
            let order = r1[0];
            this.model.order(r1[0]);
            this.model.goodsSnapshots(r2[0]);
            this.store.getChannels().done(res => {
                if (res && res.payment_channel && res.payment_channel['CHANNEL_CASH']) {
                    let channels = res.payment_channel['CHANNEL_CASH'];
                    this.model.selectChannel(channels[0]);
                    this.model.channels(channels);
                }
            })
        });
    }

    handleSelectChannel($data) {
        this.model.selectChannel($data);
    }

    handlePayClick() {
        if (this.model.selectChannel()) this.createOrderVoucher();
    }

    formatTime(time) {
        return time && time.split('.')[0].replace('T', ' ');
    }

    createOrderVoucher() {
        this.store.createOrderVoucher({
            payment_channel: this.model.selectChannel().channel_name,
            order_id: orderId
        }).done(voucher => {
            this.model.payParams(JSON.parse(voucher.pay_params));
            this.model.order();
            this.syncOrderStatus(orderId);
        })
    }

    syncOrderStatus(duration = 0) {
        if (duration > 5 * 60 * 1000) {
            this.model.showQRcodeMask(true);
            return;
        }
        this.store.getOrderStatus().done(res => {
            if (res) {
                this.model.success(true);
                setTimeout(() => __return_url && (location.href = __return_url), 5000);
            }
        }).always(() => {
            setTimeout(() => this.syncOrderStatus(duration + 3000), 3000);
        })
    }

    retry() {
        location.reload();
    }
}

ko.components.register('x-pay-commodity', {
    viewModel: ViewModel,
    template: tpl
});