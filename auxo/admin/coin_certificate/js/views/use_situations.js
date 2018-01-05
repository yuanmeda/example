/*!
 * 兑换券领用情况列表
 * @param  {object} window window对象
 * @param  {object} $      jQuery对象
 */
(function (window, $) {
    'use strict';
    // 绑定元素
    var bindingDom = document.getElementById('voucher_receive_js');
    //VoucherReceiveManage构造函数
    function VoucherReceiveManage(params) {
        var _model = {
                items: [], //兑换券列表
                filter: {
                    use_status: '', //使用状态
                    user_nick_name: '', //领取人手机号
                    page_no: 0, //页码
                    page_size: 20 //每页的记录数
                }
            },
            _self = this;
        this.store = {
            //查询兑换券列表
            queryReceive: function (filter) {
                // var _url = '/v1/coin_certificates/' + params.coinId + '/use_situations/pages';
                return $.ajax({
                    url: '/v1/coin_certificates/' + params.coinId + '/use_situations/pages',
                    data: filter,
                    dataType: "json",
                    cache: false
                });
            },
        };
        //ko双向绑定
        this.model = ko.mapping.fromJS(_model);
        this._init();
    }

    //VoucherReceiveManage原型方法
    VoucherReceiveManage.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function () {
            this._queryReceive(true);

        },
        /**
         * 兑换券领用情况查询
         * @param  {boolean} isFirst 是否第一次加载
         * @return {null} null
         */
        _queryReceive: function (isFirst) {
            var _filter = ko.mapping.toJS(this.model.filter),
                _self = this;
            this.store.queryReceive(_self._queryFilter(_filter))
                .done(function (data) {
                    _self.model.items(data.items);
                    _self._pagePlugin(data.total, _filter.page_size, _filter.page_no);
                })
                .always(function () {
                    if (isFirst) {
                        $(bindingDom).fadeIn(300);
                    }
                });
        },
        /**
         * 参数过滤
         * @param  {object} querys 参数对象
         * @return {object}        过滤后的对象
         */
        _queryFilter: function (querys) {
            var _query = {};
            for (var key in querys) {
                if (querys[key] !== '') {
                    _query[key] = querys[key];
                }
            }
            return _query;
        },
        /**
         * 分页初始化
         * @param  {int}   total       总条数
         * @param  {int}   pageSize    每页条数
         * @param  {int}   currentPage 当前页码
         * @return {null}               null
         */
        _pagePlugin: function (total, pageSize, currentPage) {
            var _self = this;
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
                        _self.model.filter.page_no(pageNum);
                        _self._queryReceive();
                    }
                }
            });
        },
        /**
         * 兑换券搜索
         * @return {null} null
         */
        voucherSearch_js: function () {
            this.model.filter.page_no(0);
            this._queryReceive();
        }
    };
    //绑定ko-页面
    ko.applyBindings(new VoucherReceiveManage({
        projectCode: projectCode,
        coinId: coinId
    }), bindingDom);
})(window, jQuery);
