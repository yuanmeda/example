(function (window, $) {
    var store = {
        search: function (data) {
            return $.ajax({
                url: '/v1/orders/stat',
                data: data
            });
        },
        history: function (user_id, data) {
            return $.ajax({
                url: '/v1/users/' + user_id + '/orders?page=0&size=9999',
                data: data
            })
        },
        // 查询账户支持的币种
        currency: function () {
            return $.ajax({
                url: PAY_SERVICE_URL + '/v1/account/currencies'
            });
        },
        users: function () {
            return $.ajax({
                url: '/v1/users'
            })
        }
    };
    var viewModel = {
        model: {
            filter: {
                user_id: '',
                amount_type: 'CHANNEL_CASH',
                page: 0,
                size: 20
            },
            currency: [],
            items: [],
            total: '',
            user: {
                title: ''
            },
            historys: []
        },
        export: function () {

        },
        init: function () {
            var t = this;
            this._select2();
            this.model = ko.mapping.fromJS(this.model);

            this.model.exportUrl = ko.computed(function () {
                var url = '/' + projectCode + '/pay/orders/stat/export?amount_type=' + this.filter.amount_type();
                if (this.filter.user_id())
                    url += '&user_id=' + this.filter.user_id();

                if (this.filter.amount_type()) {
                    t.list();
                }

                return url;
            }, this.model);

            this.getCurrency();
        },
        getCurrency: function () {
            var t = this;
            store.currency().then(function (data) {
                data.map(function (item) {
                    item.name += '(' + item.unit + ')';
                });
                t.model.currency(data);

                ko.applyBindings(t);
            });
        },
        list: function () {
            var t = this;
            store.search(ko.mapping.toJS(this.model.filter)).then(function (returnData) {
                var items = returnData.items;
                t.model.items(items);
                t.model.total(returnData.display_total_amount);
                t.pagination(returnData.total, t.model.filter.page());
                $('#pay_container_js').show();
            });
        },
        search: function () {
            this.model.filter.page(0);
            this.list();
        },
        history: function (obj) {
            var t = this;
            $('#buyhistory').modal();
            this.model.user.title(obj.user_account + '(' + obj.user_name + ')');
            store.history(obj.user_id, {amount_type: this.model.filter.amount_type()}).then(function (data) {
                t.model.historys(data.items);
            });
        },
        dateFormat: function (d) {
            if (!d)
                return '';
            return d.replace('T', ' ').substr(0, 19);
        },
        _select2: function () {
            $('#userSelect_js').select2({
                allowClear: true,
                width: '160px',
                placeholder: '帐号/姓名',
                language: 'zh-CN',
                ajax: {
                    url: '/v1/users',
                    type: 'GET',
                    dataType: 'json',
                    delay: 400,
                    cache: true,
                    global: false,
                    data: function (params) {
                        var data = {};
                        if (params.term) {
                            data.key = params.term;
                        }
                        data.page = params.page || 0;
                        data.size = params.size || 50;
                        params.key = params.term;
                        return data;
                    },
                    processResults: function (data, params) {
                        var mapData = data.items.map(function (v, i, arr) {
                            return {
                                id: v.user_id,
                                text: v.nick_name + '(' + v["org.org_user_code"] + ')'
                            };
                        });
                        return {
                            results: mapData,
                            pagination: {
                                more: params.page * 20 < data.count
                            }
                        }
                    }
                },
                minimumInputLength: 1,
                maximumInputLength: 10
            });
        },
        pagination: function (total, currentPage) {
            var that = this;
            $('#pagination').pagination(total, {
                items_per_page: that.model.filter.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        that.model.filter.page(pageNum);
                        that.list();
                    }
                }
            });
        }
    };

    $(function () {
        viewModel.init();
    });
})(window, jQuery);
