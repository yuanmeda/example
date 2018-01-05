(function (ko$1) {
'use strict';

ko$1 = ko$1 && ko$1.hasOwnProperty('default') ? ko$1['default'] : ko$1;

function Model(params) {
    var vm = this;
    var project_code = params.project_code;
    var e_cart_srv_host = params.e_cart_srv_host;
    var e_cart_gw_host = params.e_cart_gw_host;
    var e_goods_gw_host = params.e_goods_gw_host;
    var e_sales_gw_host = params.e_sales_gw_host;
    var learning_unit_id = params.learning_unit_id;
    var on_sales_timeout = params.on_sales_timeout || $.noop;
    var on_add_to_cart_success = params.on_add_to_cart_success || $.noop;
    var on_add_to_cart_fail = params.on_add_to_cart_fail || $.noop;
    var i18nKeyValue = window.i18nHelper.getKeyValue;
    var sku_id = void 0;
    var store = {
        get_sales_information: function get_sales_information() {
            return $.ajax({
                url: e_goods_gw_host + '/v1/learning_units/' + learning_unit_id + '/skus',
                type: 'GET'
            });
        },
        check_available_to_buy: function check_available_to_buy(sku_id) {
            return $.ajax({
                url: e_goods_gw_host + '/v1/skus/' + sku_id + '/actions/check_available_to_buy',
                type: 'GET'
            });
        },
        add_to_cart: function add_to_cart(sku_id) {
            return $.ajax({
                url: e_cart_srv_host + '/v1/cart/skus',
                type: 'POST',
                data: JSON.stringify([sku_id])
            });
        }
    };

    vm.display_amount = ko.observable();
    vm.sales_count = ko.observable(null);
    vm.is_sales_amount_equal = ko.observable(false);
    vm.sales_percent = ko.observable(null);
    vm.total_count = ko.observable(null);
    vm.is_sold_out = ko.observable(false);
    vm.display_real_price = ko.observable();
    vm.sales_promotion = ko.observable();
    vm.goods_promotion = ko.observable();
    vm.combine_promotion = ko.observableArray();
    vm.promotion_event_url = ko.observable();
    vm.expires = ko.observable();
    vm.show_count_down = ko.observable(true);
    vm.add_to_cart = add_to_cart;
    vm.buy_now = buy_now;

    get_information();

    function get_information() {
        return store.get_sales_information().then(function (res) {
            sku_id = res.sku_id;
            vm.display_amount(res.display_amount);
            vm.sales_promotion(res.goods_promotion || res.combine_promotion);

            calc_sold(res);

            calc_goods(res);

            set_combine(res);

            set_sales_url(res);

            calc_time_remain(res);
        });
    }

    function calc_sold(res) {
        var promotion = res.goods_promotion;
        if (!promotion) {
            return;
        }
        var total_count = promotion.total_count;
        var remain_count = promotion.remain_count;
        var sales_count = total_count - remain_count;
        if (total_count === 0) {
            throw new Error('促销总数不能为0');
        }
        vm.total_count(total_count);
        vm.sales_percent(Math.floor(sales_count / total_count * 100));
        vm.sales_count(sales_count);
        vm.is_sold_out(remain_count === 0);
    }

    function calc_goods(res) {
        var goods_promotion = res.goods_promotion;
        var real_price = void 0;
        var sgl_type = void 0;
        var discount = void 0;
        if (!goods_promotion) {
            real_price = window.parseFloat(res.amount);
        } else {
            if (goods_promotion.sales_sub_type === 1) {
                real_price = window.parseFloat(goods_promotion.sales_config.amount);
                sgl_type = i18nKeyValue('sales_promotion_card.goods_promotion.reduce');
            } else {
                discount = goods_promotion.sales_config.discount;
                real_price = window.parseFloat(res.amount) * discount;
                sgl_type = i18nKeyValue('sales_promotion_card.goods_promotion.discount', { discount: discount * 10 });
            }
        }
        vm.goods_promotion(sgl_type);
        vm.display_real_price('￥' + real_price.toFixed(2));
        if (!goods_promotion) {
            vm.is_sales_amount_equal(true);
        } else {
            vm.is_sales_amount_equal(res.amount === real_price);
        }
    }

    function set_combine(res) {
        var combine_promotion = res.combine_promotion;
        var cmb_type = void 0;
        if (combine_promotion) {
            cmb_type = combine_promotion.sales_sub_type;
            $.each(combine_promotion.sales_config.grads, function (i, grade) {
                var item = void 0;
                if (cmb_type === 1) {
                    item = i18nKeyValue('sales_promotion_card.combine_promotion.reduce', {
                        quota: grade.quota,
                        reduce: grade.reduce_amount
                    });
                } else {
                    item = i18nKeyValue('sales_promotion_card.combine_promotion.discount', {
                        quota: grade.quota,
                        discount: grade.discount * 10
                    });
                }
                vm.combine_promotion.push(item);
            });
        }
    }

    function set_sales_url(res) {
        vm.promotion_event_url(e_sales_gw_host + '/' + project_code + '/sales/' + res.sales_id);
    }

    function calc_time_remain(res) {
        var sales_promotion = vm.sales_promotion();
        if (!sales_promotion) {
            vm.show_count_down(false);
            return;
        }
        var end = timeZoneTrans(sales_promotion.end_time);
        var end_time = new Date(end);
        var expire = end_time - new Date();
        var remain_days = expire / 1000 / 3600 / 24;

        if (remain_days > 7) {
            vm.show_count_down(false);
            return;
        }
        vm.expires(get_expire_desc(expire));
        loop_expires(end_time);
    }

    function loop_expires(end_time) {
        setTimeout(function () {
            var expires_desc = get_expire_desc(end_time - new Date());
            if (expires_desc !== null) {
                vm.expires(expires_desc);
                loop_expires(end_time);
            } else {
                on_sales_timeout();
            }
        }, 1000);
    }

    function get_expire_desc(expires) {
        var seconds = 0,
            days = 0,
            hours = 0,
            minutes = 0;
        expires = expires / 1000;
        if (expires > 0) {
            seconds = expires;
        } else {
            return null;
        }
        if (seconds > 86400) {
            days = Math.floor(seconds / 86400);
            seconds = seconds % 86400;
        }
        if (seconds > 3600) {
            hours = Math.floor(seconds / 3600);
            seconds = seconds % 3600;
        }
        if (seconds > 60) {
            minutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
        }
        seconds = Math.floor(seconds);
        return i18nKeyValue('sales_promotion_card.time_remain', {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        });
    }

    function pre_handler() {
        return store.check_available_to_buy(sku_id).pipe(function (res) {
            var def = $.Deferred();
            if (!res.available_to_buy) {
                return def.reject(res);
            } else {
                return def.resolve();
            }
        }).pipe(function (res) {
            return store.add_to_cart(sku_id);
        });
    }

    function buy_now() {
        pre_handler().pipe(function () {
            var url = e_cart_gw_host + '/' + project_code + '/cart';
            var mac = Nova.getMacToB64(url);
            window.location.assign(url + '?__mac=' + mac);
        }, function (error) {
            not_available(error);
        });
    }

    function add_to_cart() {
        pre_handler().pipe(function () {
            on_add_to_cart_success();
        }, function (error) {
            not_available(error);
        });
    }

    function not_available(error) {
        if (error.fail_reason) {
            on_add_to_cart_fail(error.fail_reason);
        }
    }
}

var template = "<div class=\"sales-shopping-card\">\r\n  <!--价格-->\r\n  <div class=\"header-info\">\r\n    <span class=\"label\" data-bind=\"translate:{key:'sales_promotion_card.price_label'}\">价格：</span>\r\n    <strong class=\"real\" data-bind=\"text:display_real_price\">￥150</strong>\r\n    <!--ko if:!is_sales_amount_equal()-->\r\n    <span class=\"fake\" data-bind=\"text:display_amount\">￥200</span>\r\n    <!--/ko-->\r\n  </div>\r\n  <!--优惠信息-->\r\n  <!--ko if:sales_promotion()-->\r\n  <div class=\"promotion-info\">\r\n    <div class=\"proms\">\r\n      <!--ko if:goods_promotion-->\r\n      <div class=\"prom-item\"><span class=\"label\" data-bind=\"text:goods_promotion\">4.5折</span></div>\r\n      <!--/ko-->\r\n      <!--ko if:combine_promotion().length>0-->\r\n      <div class=\"prom-item\">\r\n        <span class=\"label\" data-bind=\"text:combine_promotion()[0]\">满100减10</span>\r\n        <ul class=\"full-proms\">\r\n          <!--ko foreach:combine_promotion-->\r\n          <li class=\"label\" data-bind=\"text:$data\">满100减10</li>\r\n          <!--/ko-->\r\n        </ul>\r\n      </div>\r\n      <!--/ko-->\r\n      <a class=\"get-more\" target=\"_blank\" data-bind=\"\r\n         translate:{key:'sales_promotion_card.get_more_promotion'},\r\n         attr:{href:promotion_event_url()}\r\n        \">更多优惠点击</a>\r\n    </div>\r\n    <!--ko if:show_count_down() || !is_sold_out()-->\r\n    <p class=\"time\" data-bind=\"text:expires\">距离抢购结束 03天09时48分10秒</p>\r\n    <!--/ko-->\r\n  </div>\r\n  <!--/ko-->\r\n  <!--商品数-->\r\n  <!--ko if:sales_count() !== null-->\r\n  <div class=\"goods-remain\">\r\n    <!--ko if:!is_sold_out()-->\r\n    <p class=\"desc\">\r\n      <span class=\"count\" data-bind=\"translate:{key:'sales_promotion_card.sales_count', properties:{sales_count:sales_count()}}\">已抢650件</span>\r\n      <span class=\"perc\" data-bind=\"translate:{key:'sales_promotion_card.sales_percentage', properties:{sales_percent:sales_percent()}}\">已抢60%</span>\r\n    </p>\r\n    <p class=\"remain-progress-bar\">\r\n      <span style=\"width:0\" data-bind=\"style:{width:sales_percent() + '%'}\"></span>\r\n    </p>\r\n    <!--/ko-->\r\n    <!--ko if:is_sold_out()-->\r\n    <p class=\"desc\">\r\n      <span class=\"count\" data-bind=\"translate:{key:'sales_promotion_card.sales_count', properties:{sales_count:sales_count()}}\">已抢650件</span>\r\n    </p>\r\n    <!--/ko-->\r\n  </div>\r\n  <!--/ko-->\r\n  <!--操作-->\r\n  <div class=\"bottom-bar\">\r\n    <!--ko if:!is_sold_out()-->\r\n    <span class=\"nm on-left\" data-bind=\"translate:{key:'sales_promotion_card.buy_now'},click:buy_now\">立即购买</span>\r\n    <span class=\"prm on-right\" data-bind=\"translate:{key:'sales_promotion_card.add_to_cart'},click:add_to_cart\">加入购物车</span>\r\n    <!--/ko-->\r\n    <!--ko if:is_sold_out()-->\r\n    <span class=\"disable on-right\" data-bind=\"translate:{key:'sales_promotion_card.sold_out'}\">已抢光</span>\r\n    <!--/ko-->\r\n  </div>\r\n</div>";

ko$1.components.register("x-sales-shopping-card", {
  viewModel: Model,
  template: template
});

}(ko));
