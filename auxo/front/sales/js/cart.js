$(function(){
    var vm = {};
    var e_cart_gw_host = window.e_cart_gw_host;
    var e_goods_gw_host = window.e_goods_gw_host;
    var e_cart_srv_host = window.e_cart_srv_host;
    var auxo_pay_srv_host = window.auxo_pay_srv_host;
    var auxo_pay_gw_host = window.auxo_pay_gw_host;
    var auxo_mystudy_wf_host = window.auxo_mystudy_wf_host;
    var has_header_footer = window.has_header_footer;
    var project_code = window.project_code;
    var i18nGetKeyValue = window.i18nHelper.getKeyValue;
    var cart_id;
    var promotions = {
        single: 'SINGLE',
        combine_discount: 'COMBINE_DISCOUNT',
        combine_reduce: 'COMBINE_REDUCE'
    };
    var store = {
        get_cart: function(){
            return $.ajax({
                url: e_cart_gw_host + '/v1/carts',
                type: 'GET'
            });
        },
        add_fav: function(sku_ids){
            return $.ajax({
                url: e_goods_gw_host + '/v1/sku/actions/add_favorites',
                data: JSON.stringify(sku_ids),
                type: 'POST'
            });
        },
        del: function(sku_ids){
            var search = $.param({
                sku_ids: sku_ids
            }, true);
            return $.ajax({
                url: e_cart_srv_host + '/v1/cart/skus?' + search,
                type: 'DELETE'
            });
        },
        calculate: function(sku_ids){
            if (sku_ids.length === 0) {
                return $.Deferred().resolve({
                    amount: 0,
                    settlement_amount: 0
                });
            }
            return $.ajax({
                url: e_cart_srv_host + '/v1/cart/actions/calculate',
                data: JSON.stringify(sku_ids),
                type: 'POST'
            });
        },
        create_order: function(data){
            return $.ajax({
                url: auxo_pay_srv_host + '/v2/orders',
                data: JSON.stringify(data),
                type: 'POST'
            });
        }
    };

    vm.has_header_footer = has_header_footer;
    vm.all_goods_count = ko.observable(0);
    vm.amount_price = ko.observable(0);
    vm.settle_price = ko.observable(0);
    vm.total_reduced = ko.pureComputed(function(){
        return (this.amount_price() - this.settle_price()).toFixed(2);
    }, vm);
    vm.promotions = promotions;
    vm.valid_goods = ko.observableArray();
    vm.selected_goods = ko.observableArray();
    vm.is_all_checked = ko.pureComputed(function(){
        var selected_ln = this.selected_goods().length;
        var valid_ln = this.valid_goods().length;
        return valid_ln > 0 && selected_ln === valid_ln;
    }, vm);
    vm.could_fav = ko.observable(false);
    vm.selected_goods.subscribe(v =>{
        var count = 0;
        $.each(v, function(i, item){
            if (item.is_fav() === false) {
                count++
            }
        });
        vm.could_fav(count > 0);
    });
    /**
     * [
     *   {
     *     combine_promotion_id,
     *     promotion_type,
     *     promotion_result,
     *     sales_config,
     *     list: []
     *   }
     * ]
     *
     */
    vm.tables = ko.observableArray();
    vm.toggle_all_check = toggle_all_check;
    vm.toggle_check = toggle_check;
    vm.goods_delete = goods_delete;
    vm.goods_batch_delete = goods_batch_delete;
    vm.fav_add = fav_add;
    vm.fav_batch_add = fav_batch_add;
    vm.create_order = create_order;


    get_cart();

    function get_cart(){
        return store.get_cart()
            .pipe(function(res){
                var goods = res.goods;
                var valid_goods = [];
                cart_id = res.cart_id;
                $.each(goods, function(i, item){
                    item.is_fav = ko.observable(item.is_fav);
                    item._checked = ko.observable(false);
                    if (item.status === 1) {
                        valid_goods.push(item);
                    }
                });
                vm.all_goods_count(goods.length);
                vm.valid_goods(valid_goods);

                calc_real_price(goods);
                split_tables(goods, res.combine_promotions);

            });
    }

    function split_tables(goods, combine_proms){
        var tables = [];
        var promotion_sku_ids = [];
        // 满优惠
        $.each(combine_proms, function(i, promotion){
            var table = {
                promotion_result: ko.observable(),
                sales_config: promotion.sales_config,
                list: ko.observableArray()
            };
            table.sales_config.grads.sort(function(prev, next){
                return prev.quota - next.quota;
            });
            switch (promotion.sales_sub_type) {
                case 1:
                    table.promotion_type = promotions.combine_reduce;
                    break;
                case 2:
                    table.promotion_type = promotions.combine_discount;
                    set_discount_label(promotion.sales_config.grads);
                    break;
            }
            var list = [];
            $.each(promotion.sku_ids, function(j, sku_id){
                var item = find_goods(goods, sku_id);
                if (item && item.status > 0) {
                    item._parent = table;
                    list.push(item);
                }
            });
            if (list.length > 0) {
                table.combine_promotion_id = promotion.combine_promotion_id;
                list.sort(sort_goods_status);
                table.list(list);
                tables.push(table);
            }
            promotion_sku_ids = promotion_sku_ids.concat(promotion.sku_ids);
        });
        // 单品
        var single_table = {
            promotion_type: promotions.single
        };
        var single_goods_list = [];
        $.each(goods, function(i, item){
            if (item.status === 0 || promotion_sku_ids.indexOf(item.sku_id) === -1) {
                item._parent = single_table;
                single_goods_list.push(item);
            }
        });
        if (single_goods_list.length > 0) {
            single_goods_list.sort(sort_goods_status);
            single_table.list = ko.observableArray(single_goods_list);
            tables.push(single_table);
        }
        vm.tables(tables);
    }

    function set_discount_label(discount_grads){
        $.each(discount_grads, function(i, grade){
            grade.display_discount = grade.discount * 10;
        });
    }

    /*按商品状态排序*/
    function sort_goods_status(prev, next){
        return next.status - prev.status;
    }

    /*按sku_id查找商品*/
    function find_goods(list, sku_id){
        var i = 0, ln = list.length;
        for (; i < ln; i++) {
            if (list[i].sku_id === sku_id) {
                return list[i];
            }
        }
        return null;
    }

    /*计算商品的实际价格*/
    function calc_real_price(goods){
        $.each(goods, function(idx, item){
            var promotion = item.promotion;
            var sales_config;
            var real_price;
            var sale_type;
            var display_discount;
            if (promotion) {
                // 单品有优惠
                sales_config = promotion.sales_config;
                if (promotion.sales_sub_type === 1) {
                    // 单品特价
                    real_price = sales_config.amount;
                    sale_type = i18nGetKeyValue('sales.sales_label.flash_sale');
                } else {
                    // 单品打折
                    real_price = item.amount * sales_config.discount;
                    display_discount = sales_config.discount * 10;
                    if (display_discount % 1 > 0) {
                        display_discount = display_discount.toFixed(1);
                    }
                    sale_type = i18nGetKeyValue('sales.sales_label.discount', {display_discount: display_discount});
                }
            } else {
                // 单品无优惠
                real_price = item.amount;
            }
            item._real_price = real_price;
            item._display_real_price = '￥' + real_price.toFixed(2);
            sale_type && (item._sale_type = sale_type);
        });
    }

    /*计算组合价格*/
    function calc_combine_prom_result(table){
        var selected = [];
        if (table.promotion_type === promotions.single) {
            return;
        }
        $.each(table.list(), function(i, item){
            if (item._checked()) {
                selected.push(item)
            }
        });
        var price = 0;
        $.each(selected, function(i, item){
            price += item._real_price;
        });

        var grads = table.sales_config.grads;
        var i = -1, ln = grads.length;
        var grade;

        while (i < ln - 1) {
            grade = grads[i + 1];
            if (price < grade.quota) {
                break;
            }
            i++;
        }
        var reduced, buy_more = 0;

        if (i === -1) {
            // 不足最低优惠
            reduced = 0;
            buy_more = grade.quota - price;
        } else if (i === ln - 1 && price > grade.quota) {
            // 超过最高优惠
            if (grade.reduce_amount) {
                reduced = grade.reduce_amount;
            } else {
                reduced = (1 - grade.discount) * price;
            }
            buy_more = 0;
        } else {
            if (grade.reduce_amount) {
                reduced = grads[i].reduce_amount;
            } else {
                reduced = (1 - grads[i].discount) * price;
            }
            buy_more = grade.quota - price;
        }
        if (selected.length > 0) {
            table.promotion_result({
                reduced: reduced.toFixed(2),
                buy_more: buy_more,
                display_buy_more: buy_more.toFixed(2),
                grade: grade
            });
        } else {
            table.promotion_result(null);
        }
    }

    /*从服务器端计算总价格*/
    function calculate(){
        var sku_ids = [];
        $.each(vm.selected_goods(), function(i, item){
            sku_ids.push(item.sku_id);
        });
        return store.calculate(sku_ids)
            .then(function(res){
                vm.amount_price(res.amount);
                vm.settle_price(res.settlement_amount);
            });
    }

    /*全选*/
    function toggle_all_check(){
        var checked = !vm.is_all_checked();
        $.each(vm.valid_goods(), function(i, item){
            item._checked(checked);
        });
        $.each(vm.tables(), function(i, table){
            if (table.promotion_type !== promotions.single) {
                calc_combine_prom_result(table);
            }
        });
        if (checked) {
            var l = [];
            $.each(vm.valid_goods(), function(i, item){
                l.push(item)
            });
            vm.selected_goods(l);
        } else {
            vm.selected_goods([]);
        }
        return calculate();
    }

    /*单条商品勾选*/
    function toggle_check(){
        var item = this;
        var checked = item._checked();
        item._checked(!checked);
        checked = item._checked();
        if (checked) {
            vm.selected_goods.push(item);
        } else {
            vm.selected_goods.remove(item);
        }
        calc_combine_prom_result(item._parent);
        return calculate();
    }

    /*单独删除商品*/
    function goods_delete(){
        var item = this;
        store.del([item.sku_id])
            .pipe(function(){
                sync_remain_goods(item);
                // 重新计算满优惠
                calc_combine_prom_result(item._parent);
            })
            .pipe(function(){
                if (item._checked()) {
                    // 单个商品只针对有勾选的情况进行计算
                    return calculate();
                }
            })

    }

    /*批量删除商品*/
    function goods_batch_delete(){
        var selected_goods = vm.selected_goods().concat();
        if (selected_goods.length === 0) {
            return;
        }
        var sku_ids = [];
        $.each(selected_goods, function(i, item){
            sku_ids.push(item.sku_id);
        });
        store.del(sku_ids)
            .pipe(function(){
                var table_map = {};
                $.each(selected_goods, function(i, item){
                    var table = item._parent;
                    var id = table.combine_promotion_id;
                    id && (table_map[id] = table);
                    sync_remain_goods(item);
                });
                // 重新计算满优惠
                var n;
                for (n in table_map) {
                    if (table_map.hasOwnProperty(n)) {
                        calc_combine_prom_result(table_map[n]);
                    }
                }
            })
            .pipe(function(){
                return calculate();
            });
    }

    /*删除商品后同步数据*/
    function sync_remain_goods(item){
        item._parent.list.remove(item);
        vm.selected_goods.remove(item);
        item.status !== 0 && vm.valid_goods.remove(item);
        vm.all_goods_count(vm.all_goods_count() - 1);
    }

    /*单独收藏*/
    function fav_add(){
        var item = this;
        store.add_fav([item.sku_id])
            .then(function(){
                item.is_fav(true);
            });
    }

    /*批量收藏*/
    function fav_batch_add(){
        if (!vm.could_fav()) {
            return;
        }
        var sku_ids = [];
        $.each(vm.selected_goods(), function(i, item){
            if (item.is_fav() === false) {
                sku_ids.push(item.sku_id);
            }

        });
        store.add_fav(sku_ids)
            .then(function(){
                $.each(vm.selected_goods(), function(i, item){
                    item.is_fav(true);
                });
                vm.selected_goods.valueHasMutated();
            });
    }

    /*确认订单*/
    function create_order(){
        if (vm.selected_goods().length === 0) {
            return;
        }
        var cart_goods_ids = [];
        $.each(vm.selected_goods(), function(i, item){
            cart_goods_ids.push(item.cart_goods_id);
        });
        store.create_order({
            pay_source: 3,
            cart_id: cart_id,
            cart_goods_id_list: cart_goods_ids
        })
            .then(function(res){
                var search = $.param({
                    order_id: res.id,
                    __return_url: auxo_mystudy_wf_host + '/' + project_code + '/mystudy/user_center#my-dist-courses-order'
                });
                var url = auxo_pay_gw_host + '/' + project_code + '/pay/commodity?' + search;
                var mac = Nova.getMacToB64(url);
                url += '&__mac=' + mac;
                window.location.assign(url);
            });
    }


    ko.bindingHandlers.defaultImg = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext){
            var defaultImage = 'data:image/png;base64,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';
            var pic_src = allBindings().attr.src;
            if (!pic_src) {
                element.src = defaultImage;
            } else {
                element.onerror = function(){
                    element.src = defaultImage;
                    element.onerror = null;
                };
            }

        }
    };

    ko.applyBindings(vm, document.getElementById('boot'));
});