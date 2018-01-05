(function (window, $) {
    'use strict';
    var project_code = window.projectCode;
    var oc2_gw_host = window.oc2_gw_host;
    var org_id = window.org_id;
    var ucs_ava_path = window.ucs_ava_path;
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
    var applyTarget = document.body;
    // 数据
    var store = {
        // 查询商品订单列表
        query: function (data) {
            return $.ajax({
                url: '/v1/units/' + unitId + '/orders',
                data: data
            });
        },
        // 查询用户
        user: function (key) {
            return $.ajax({
                url: '/v1/users',
                data: {
                    size: 50,
                    key: key
                }
            });
        },
        // 导出商品订单列表
        output: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/orders/units/' + unitId + '/orders/export',
                data: data
            });
        },
        // 查询账户支持的币种
        currency: function () {
            return $.ajax({
                url: PAY_SERVICE_URL + '/v1/account/currencies'
            });
        }
    };
    // 寄送状态
    var payStatus = [{
        title: '已付款',
        id: 1
    }, {
        title: '待付款',
        id: 0
    }];

    function ViewModel(params) {
        var _model = {
            items: [],
            filter: {
                user_id: '',
                status: payStatus[0].id,
                size: 20,
                page: 0,
                start_pay_time: '',
                end_pay_time: '',
            },
            selected_users: [],
            currencies: [],
            typeSums: [],
            payStatus: payStatus
        };
        this.channelMap = channelMap;
        this.currenciesMap = {};
        this._init(_model);
      this.uTreeOpts = {
        readonly:false,
        orgId: org_id,
        selectedList: this.model.selected_users,
        config: {
          projectCode: project_code,
          host: oc2_gw_host,
          userHost: '',
          version: 'v1',
          userVersion: 'v0.93',
          initData: null,
          avatarPath: ucs_ava_path,
          isRadio: true
        }
      };
    }

    ViewModel.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function (model) {
            var vm = this,
                _outputPrefix = '/' + projectCode + '/admin/pay/orders/units/' + unitId + '/orders/export?';
            this.model = ko.mapping.fromJS(model);
            // 搜索计算
            this.searchComputed = ko.computed(function () {
                var _filter = this.model.filter;
                return {
                    u: _filter.user_id(),
                    s: _filter.status(),
                    b: _filter.start_pay_time(),
                    e: _filter.end_pay_time()
                };
            }, this);
            // 导出href计算
            this.outputUrl = ko.computed(function () {
                var _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.filter)),
                    _search = [];
                for (var key in _filter) {
                    _search.push(key + '=' + _filter[key]);
                }
                return _outputPrefix + _search.join('&');
            }, this);
            this._datePicker();
            $.when(this._list(), this._queryCurrency()).done(function (list, currencies) {
                (currencies[0] || []).forEach(function (currency) {
                    vm.currenciesMap[currency.code] = currency;
                });
                $('#pay_container_js').show();
            });
        },
        /**
         * 初始化datepicker
         * @return {null} null
         */
        _datePicker: function () {
            var vm = this;
            $('.datepicker_js').datetimepicker({
                autoclose: true,
                clearBtn: true,
                format: 'yyyy-mm-dd',
                minView: 2,
                todayHighlight: 1,
                language: 'zh-CN',
                minuteStep: 10
            });
            // 搜索时间规则
            $('#pay_begin_js').on('changeDate', function (e) {
                $('#pay_end_js').datetimepicker('setStartDate', e.date);
                // vm.model.filter.start_pay_time(e.date ? +e.date : '');
            });
            $('#pay_end_js').on('changeDate', function (e) {
                $('#pay_begin_js').datetimepicker('setEndDate', e.date);
                // vm.model.filter.end_pay_time(e.date ? +e.date : '');
            });
        },
        show_users_tree: function(){
          $('#js-userTreeModal').modal('show');
        },
        remove_user: function(){
            this.model.selected_users([]);
        },
        /**
         * 初始化select2
         * @return {null} null
         */
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
        /**
         * 列表查询
         * @return {null} null
         */
        _list: function () {
            var vm = this,
                _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.filter));
            if (_filter.end_pay_time) {
                _filter.end_pay_time += ' 23:59:59';
            }
            if(vm.model.selected_users().length > 0){
                _filter.user_id = vm.model.selected_users()[0].user_id;
            }
            return store.query(_filter)
                .done(function (d) {
                    vm.model.items(d.items || []);
                    vm.model.typeSums(d.amount_type_sums || []);
                    vm._pagination(d.total, _filter.size, _filter.page);
                });
        },
        /**
         * currencies查询
         * @return {null} null
         */
        _queryCurrency: function () {
            var vm = this;
            return store.currency()
                .done(function (d) {
                    vm.model.currencies(d || []);
                });
        },
        /**
         * 过滤空参数
         * @param  {Object} obj 待过滤参数
         * @return {Object}     已过滤参数
         */
        _dataEmptyFilter: function (obj) {
            var _obj = {};
            for (var k in obj) {
                if (obj.hasOwnProperty(k) && obj[k] !== '' && obj[k] !== null && obj[k] !== void(0)) {
                    _obj[k] = obj[k];
                }
            }
            return _obj;
        },
        /**
         * 分页
         * @param  {int} total       总数
         * @param  {int} pageSize    每页数量
         * @param  {int} currentPage 页码
         * @return {null}             null
         */
        _pagination: function (total, pageSize, currentPage) {
            var vm = this;
            $('#pagination').pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        vm.model.filter.page(pageNum);
                        vm._list();
                    }
                }
            });
        },
        /**
         * 查找列表
         * @return {null} null
         */
        search: function () {
            this.model.filter.page(0);
            this._list();
        },
        /**
         * 导出
         * @return {null} null
         */
        output: function () {
            var _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.filter));
            store.output(_filter);
        }
    };
    $(function () {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
