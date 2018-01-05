(function (ko) {
'use strict';

ko = ko && ko.hasOwnProperty('default') ? ko['default'] : ko;

var tpl = "<div class=\"tab-nav\">\r\n    <ul>\r\n        <li data-bind=\"click:$component.handleTabClick.bind($component,undefined),css:{'active':model.filter.status() === undefined},translate:{'key':'payMine.allOrders'}\">\r\n            全部订单\r\n        </li>\r\n        <li data-bind=\"click:$component.handleTabClick.bind($component,0),css:{'active':model.filter.status() === 0},translate:{'key':'payMine.waitForPay'}\">\r\n            待付款\r\n        </li>\r\n        <li data-bind=\"click:$component.handleTabClick.bind($component,1),css:{'active':model.filter.status() === 1},translate:{'key':'payMine.paid'}\">\r\n            已购买\r\n        </li>\r\n        <li data-bind=\"click:$component.handleTabClick.bind($component,-1),css:{'active':model.filter.status() === -1},translate:{'key':'payMine.closed'}\">\r\n            已关闭\r\n        </li>\r\n    </ul>\r\n</div>\r\n<div class=\"order-container\">\r\n    <div class=\"order-list\">\r\n        <table class=\"order-head\">\r\n            <colgroup>\r\n                <col style=\"width: 30%\">\r\n                <col style=\"width: 20%\">\r\n                <col style=\"width: 20%\">\r\n                <col style=\"width: 15%\">\r\n                <col style=\"width: 15%\">\r\n            </colgroup>\r\n            <thead>\r\n            <tr>\r\n                <th data-bind=\"translate:{'key':'payMine.name'}\">名称</th>\r\n                <th data-bind=\"translate:{'key':'payMine.price'}\">单价</th>\r\n                <th data-bind=\"translate:{'key':'payMine.total'}\">总价</th>\r\n                <th data-bind=\"translate:{'key':'payMine.orderStatus'}\">订单状态</th>\r\n                <th data-bind=\"translate:{'key':'payMine.options'}\">操作</th>\r\n            </tr>\r\n            </thead>\r\n            <tbody></tbody>\r\n        </table>\r\n        <!--ko foreach: model.order.items-->\r\n        <div class=\"order-item-wrap\" data-bind=\"css:'status-' + (status+1)\">\r\n            <table class=\"order-item\">\r\n                <colgroup>\r\n                    <col style=\"width: 30%\">\r\n                    <col style=\"width: 20%\">\r\n                    <col style=\"width: 20%\">\r\n                    <col style=\"width: 15%\">\r\n                    <col style=\"width: 15%\">\r\n                </colgroup>\r\n                <thead>\r\n                <tr>\r\n                    <th colspan=\"2\" class=\"tl\" data-bind=\"translate:{'key':'payMine.orderId','properties':{'id':id}}\">\r\n                        订单号：1141395006\r\n                    </th>\r\n                    <th data-bind=\"text:$component.formatTime(create_time)\">\r\n                        2017-08-14 14:36:53\r\n                    </th>\r\n                    <th colspan=\"2\"></th>\r\n                </tr>\r\n                </thead>\r\n                <tbody>\r\n                <!--ko foreach: goods_snapshot_list-->\r\n                <tr>\r\n                    <td class=\"no-br\" data-bind=\"text:name\">高三语文第6课.ppt</td>\r\n                    <td>\r\n                        <div class=\"lt\" data-bind=\"text:display_amount\">￥23.00</div>\r\n                        <div class=\"strong\" data-bind=\"text:display_settlement_amount\">￥23.00</div>\r\n                    </td>\r\n                    <!--ko if:!$index() -->\r\n                    <td data-bind=\"attr:{'rowspan':$parent.goods_snapshot_list.length}\">\r\n                        <div data-bind=\"translate:{'key':'payMine.totalAmount','properties':{'amount':$parent.display_amount}}\">\r\n                            总额￥45.00\r\n                        </div>\r\n                        <div data-bind=\"translate:{'key':'payMine.settlementAmount','properties':{'amount':$parent.display_settlement_amount}}\">\r\n                            应付￥35.00\r\n                        </div>\r\n                    </td>\r\n                    <td data-bind=\"attr:{'rowspan':$parent.goods_snapshot_list.length},text:$component.formatStatus($parent.status)\">\r\n                        待付款\r\n                    </td>\r\n                    <td class=\"no-br\" data-bind=\"attr:{'rowspan':$parent.goods_snapshot_list.length}\">\r\n                        <a class=\"btn\" href=\"javascript:;\"\r\n                           data-bind=\"visible:$parent.status==0,click:$component.handlePayClick.bind($component,$parent),translate:{'key':'payMine.payNow'}\">立即支付</a>\r\n                        <a class=\"btn-link\" href=\"javascript:;\"\r\n                           data-bind=\"visible:$parent.status==0,click:$component.handleCancelPayClick.bind($component,$parent),translate:{'key':'payMine.cancelOrder'}\">取消订单</a>\r\n                    </td>\r\n                    <!--/ko-->\r\n                </tr>\r\n                <!--/ko-->\r\n                </tbody>\r\n            </table>\r\n        </div>\r\n        <!--/ko-->\r\n        <div class=\"no-order\" data-bind=\"visible:!model.order.items().length,translate:{'key':'payMine.noOrder'}\">\r\n            暂无订单信息\r\n        </div>\r\n    </div>\r\n    <div class=\"pagination-box\" id=\"pagination\"></div>\r\n</div>";

var dialogHelper = {
    alert: function alert(message) {
        var fn = $.fn.udialog && $.fn.udialog.alert || window.alert;
        fn(message, {
            title: i18nHelper.getKeyValue('payMine.hint'),
            buttons: [{
                text: i18nHelper.getKeyValue('payMine.confirm')
            }]
        });
    },
    confirm: function confirm(message, callback) {
        var fn = $.fn.udialog && $.fn.udialog.confirm || window.confirm;
        fn(message, [{
            text: i18nHelper.getKeyValue('payMine.confirm'),
            'class': 'ui-btn-confirm',
            click: function click() {
                callback && callback();
                $(this).udialog("hide");
            }
        }, {
            text: i18nHelper.getKeyValue('payMine.cancel'),
            'class': 'ui-btn-primary',
            click: function click() {
                $(this).udialog("hide");
            }
        }], {
            title: i18nHelper.getKeyValue('payMine.hint')
        });
    }
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var _i18nValue = i18nHelper.getKeyValue;

var ViewModel = function () {
    function ViewModel(params) {
        var _this = this;

        classCallCheck(this, ViewModel);

        this.model = {
            filter: {
                status: ko.observable(), // -1已失效，0未支付，1支付成功
                page: ko.observable(0),
                limit: 20
            },
            order: {
                items: ko.observableArray(),
                total: ko.observable(0)
            }
        };
        this.model.filter.offset = ko.pureComputed(function () {
            return _this.model.filter.limit * _this.model.filter.page();
        });
        this.store = {
            getUserOrders: function getUserOrders(filter) {
                return $.ajax({
                    url: '/v2/order/actions/query_current_user_orders',
                    type: 'post',
                    dataType: 'json',
                    data: JSON.stringify(filter),
                    contentType: 'application/json;charset=utf-8'
                });
            },
            regenerateVouchers: function regenerateVouchers(orderId) {
                return $.ajax({
                    url: PAY_SERVICE_URL + '/v2/orders/' + orderId + '/actions/regenerate_vouchers',
                    type: 'post',
                    dataType: 'json'
                });
            },
            cancelOrder: function cancelOrder(orderId) {
                return $.ajax({
                    url: PAY_SERVICE_URL + '/v2/orders/' + orderId + '/actions/cancel',
                    type: 'post',
                    dataType: 'json'
                });
            }
        };
        this.init();
    }

    ViewModel.prototype.init = function init() {
        this.pageQuery();
    };

    ViewModel.prototype.pageQuery = function pageQuery() {
        var _this2 = this;

        var filter = ko.mapping.toJS(this.model.filter);
        filter.page = undefined;
        this.store.getUserOrders(filter).done(function (res) {
            _this2.model.order.items(res.items);
            _this2.model.order.total(res.total);
            _this2.page();
        }).always(function () {
            _this2.postMsgToParent();
        });
    };

    ViewModel.prototype.regenerateVouchers = function regenerateVouchers(order) {
        var w = window.open();
        this.store.regenerateVouchers(order.id).done(function (res) {
            w.location.href = '/' + projectCode + '/pay/commodity?order_id=' + res.id + '&__return_url=' + encodeURIComponent(auxoMystudyWebUrl + '/' + projectCode + '/mystudy/user_center#my-dist-courses-order');
        });
    };

    ViewModel.prototype.cancelOrder = function cancelOrder(order) {
        var _this3 = this;

        this.store.cancelOrder(order.id).done(function () {
            _this3.model.filter.page(0);
            _this3.pageQuery();
        });
    };

    ViewModel.prototype.formatTime = function formatTime(time) {
        return time && time.split('.')[0].replace('T', ' ');
    };

    ViewModel.prototype.formatStatus = function formatStatus(status) {
        return _i18nValue({
            '-1': 'payMine.closed',
            '0': 'payMine.waitForPay',
            '1': 'payMine.paid'
        }[status] || 'payMine.unknown');
    };

    ViewModel.prototype.page = function page() {
        var _this4 = this;

        var filter = this.model.filter;
        $("#pagination").pagination(this.model.order.total(), {
            is_show_first_last: false,
            is_show_input: true,
            is_show_total: false,
            items_per_page: filter.limit,
            num_display_entries: 5,
            current_page: filter.page(),
            prev_text: "common.addins.pagination.prev",
            next_text: "common.addins.pagination.next",
            callback: function callback(index) {
                if (index != filter.page()) {
                    filter.page(index);
                    _this4.pageQuery();
                }
            }
        });
    };

    ViewModel.prototype.postMsgToParent = function postMsgToParent() {
        if (window.parent === window) return;
        var msg = {
            "type": "$resize",
            "data": {
                "width": document.body.scrollWidth,
                "height": document.body.scrollHeight + 50
            },
            "origin": location.host,
            "timestamp": +new Date()
        };
        window.parent.postMessage(JSON.stringify(msg), '*');
    };

    ViewModel.prototype.handleTabClick = function handleTabClick(type) {
        this.model.filter.status(type);
        this.model.filter.page(0);
        this.pageQuery();
    };

    ViewModel.prototype.handlePayClick = function handlePayClick($data) {
        this.regenerateVouchers($data);
    };

    ViewModel.prototype.handleCancelPayClick = function handleCancelPayClick($data) {
        var _this5 = this;

        dialogHelper.confirm(_i18nValue('payMine.cancelOrderConfirm'), function () {
            _this5.cancelOrder($data);
        });
        setTimeout(function () {
            _this5.postMsgToParent();
        }, 13);
    };

    return ViewModel;
}();

ko.components.register('x-pay-my-order', {
    viewModel: ViewModel,
    template: tpl
});

}(ko));
