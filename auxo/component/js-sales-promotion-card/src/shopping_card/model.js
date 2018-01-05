/**
 *
 * @param params
 * {
 *   on_sales_timeout,
 *   on_add_to_cart_success,
 *   on_add_to_cart_fail
 * }
 *
 * @returns {*}
 * @constructor
 */
function Model(params){
    const vm = this;
    const project_code = params.project_code;
    const e_cart_srv_host = params.e_cart_srv_host;
    const e_cart_gw_host = params.e_cart_gw_host;
    const e_goods_gw_host = params.e_goods_gw_host;
    const e_sales_gw_host = params.e_sales_gw_host;
    const learning_unit_id = params.learning_unit_id;
    const on_sales_timeout = params.on_sales_timeout || $.noop;
    const on_add_to_cart_success = params.on_add_to_cart_success || $.noop;
    const on_add_to_cart_fail = params.on_add_to_cart_fail || $.noop;
    const i18nKeyValue = window.i18nHelper.getKeyValue;
    let sku_id;
    const store = {
        get_sales_information(){
            return $.ajax({
                url: `${e_goods_gw_host}/v1/learning_units/${learning_unit_id}/skus`,
                type: 'GET'
            })
        },
        check_available_to_buy(sku_id){
            return $.ajax({
                url: `${e_goods_gw_host}/v1/skus/${sku_id}/actions/check_available_to_buy`,
                type: 'GET'
            });
        },
        add_to_cart(sku_id){
            return $.ajax({
                url: `${e_cart_srv_host}/v1/cart/skus`,
                type: 'POST',
                data: JSON.stringify([sku_id])
            })
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

    /*获取促销信息*/
    function get_information(){
        return store.get_sales_information()
            .then(function(res){
                sku_id = res.sku_id;
                vm.display_amount(res.display_amount);
                vm.sales_promotion(res.goods_promotion || res.combine_promotion);
                // 计算已出售
                calc_sold(res);
                // 计算实价和单品促销类型
                calc_goods(res);
                // 满优惠
                set_combine(res);
                // 促销活动页地址
                set_sales_url(res);
                // 倒计时
                calc_time_remain(res);
            });
    }

    /*计算已售出*/
    function calc_sold(res){
        const promotion = res.goods_promotion;
        if (!promotion) {
            return;
        }
        const total_count = promotion.total_count;
        const remain_count = promotion.remain_count;
        const sales_count = total_count - remain_count;
        if (total_count === 0) {
            throw new Error('促销总数不能为0');
        }
        vm.total_count(total_count);
        vm.sales_percent(Math.floor(sales_count / total_count * 100));
        vm.sales_count(sales_count);
        vm.is_sold_out(remain_count === 0);
    }

    /*计算商品价格*/
    function calc_goods(res){
        let goods_promotion = res.goods_promotion;
        let real_price;
        let sgl_type;
        let discount;
        if (!goods_promotion) {
            real_price = window.parseFloat(res.amount);
        } else {
            if (goods_promotion.sales_sub_type === 1) {
                // 特价
                real_price = window.parseFloat(goods_promotion.sales_config.amount);
                sgl_type = i18nKeyValue('sales_promotion_card.goods_promotion.reduce');
            } else {
                // 打折
                discount = goods_promotion.sales_config.discount;
                real_price = window.parseFloat(res.amount) * discount;
                sgl_type = i18nKeyValue('sales_promotion_card.goods_promotion.discount', {discount: discount * 10});
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

    /*计算组合信息*/
    function set_combine(res){
        let combine_promotion = res.combine_promotion;
        let cmb_type;
        if (combine_promotion) {
            cmb_type = combine_promotion.sales_sub_type;
            $.each(combine_promotion.sales_config.grads, function(i, grade){
                let item;
                if (cmb_type === 1) {
                    // 满减
                    item = i18nKeyValue('sales_promotion_card.combine_promotion.reduce', {
                        quota: grade.quota,
                        reduce: grade.reduce_amount
                    });
                } else {
                    // 满折
                    item = i18nKeyValue('sales_promotion_card.combine_promotion.discount', {
                        quota: grade.quota,
                        discount: grade.discount * 10
                    });
                }
                vm.combine_promotion.push(item);
            });
        }
    }

    /*活动页地址*/
    function set_sales_url(res){
        vm.promotion_event_url(`${e_sales_gw_host}/${project_code}/sales/${res.sales_id}`);
    }

    /*剩余时间*/
    function calc_time_remain(res){
        const sales_promotion = vm.sales_promotion();
        if (!sales_promotion) {
            vm.show_count_down(false);
            return;
        }
        const end = timeZoneTrans(sales_promotion.end_time);
        const end_time = new Date(end);
        const expire = end_time - new Date();
        const remain_days = expire / 1000 / 3600 / 24;
        // 剩余天数大于7天，不显示倒计时
        if (remain_days > 7) {
            vm.show_count_down(false);
            return;
        }
        vm.expires(get_expire_desc(expire));
        loop_expires(end_time);
    }

    /*递归倒计时*/
    function loop_expires(end_time){
        setTimeout(() =>{
            const expires_desc = get_expire_desc(end_time - new Date());
            if (expires_desc !== null) {
                vm.expires(expires_desc);
                loop_expires(end_time);
            } else {
                // 促销结束
                on_sales_timeout();
            }
        }, 1000);
    }

    /*时分秒分割*/
    function get_expire_desc(expires){
        let seconds = 0, days = 0, hours = 0, minutes = 0;
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
            days,
            hours,
            minutes,
            seconds
        })
    }

    /*购物车统一处理*/
    function pre_handler(){
        return store.check_available_to_buy(sku_id)
            .pipe(res =>{
                const def = $.Deferred();
                if (!res.available_to_buy) {
                    // 加入购物车失败
                    return def.reject(res);
                } else {
                    // 成功加入购物车
                    return def.resolve();
                }
            })
            .pipe(res =>{
                return store.add_to_cart(sku_id);
            });
    }

    /*立即购买*/
    function buy_now(){
        pre_handler()
            .pipe(() =>{
                let url = `${e_cart_gw_host}/${project_code}/cart`;
                let mac = Nova.getMacToB64(url);
                window.location.assign(`${url}?__mac=${mac}`);
            }, error =>{
                not_available(error);
            });
    }

    /*加入购物车*/
    function add_to_cart(){
        pre_handler()
            .pipe(() =>{
                on_add_to_cart_success();
            }, error =>{
                not_available(error);
            });
    }

    function not_available(error){
        if (error.fail_reason) {
            on_add_to_cart_fail(error.fail_reason);
        }
    }


}

export default Model;