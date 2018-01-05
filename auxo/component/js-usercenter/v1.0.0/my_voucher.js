/*!
 * 用户学习中心组件
 */
(function ($, window) {
    'use strict';
    var bindingsDom = document.getElementById('myVoucher_js');

    /**
     * 我的兑换券数据模型
     * @param {Object} params 模块参数(projectCode:项目标识)
     */
    function VoucherModel(params) {
        var model = {
            filter: {
                status: 0, //课程状态
                page_size: 10, //分页大小
                page_no: 0 //当前页码
            },
            items: [], //兑换券
            loadComplete: false //是否加载完成

        };
        this.params = params || {};
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        // status改变事件
        this.model.filter.status.extend({
            'notify': 'always'
        }).subscribe(this._flashByStatus, this);
        // items改变强制刷新
        this.model.items.extend({
            'notify': 'always'
        });
        // 数据仓库
        this.store = {
            // 获取我的兑换券列表v1/users/coin_certificates
            voucherList: function (filter) {
                var url = (typeof coinFrontUrl=='undefined'?'':coinFrontUrl) + '/v1/users/coin_certificates';
                return $.ajax({
                    url: url,
                    type: 'POST',
                    data: JSON.stringify(filter),
                    contentType: 'application/json'
                });
            }
        };
        // 初始化动作
        this._init();
    }

    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    VoucherModel.prototype = {
        /**
         * 初始化事件
         * @return {null}     null
         */
        _init: function () {
            // 加载兑换券列表
            this._loadVoucherList(true);
            // 加载事件
            this._eventHandler();
        },
        /**
         * 事件集合
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
        },
        /**
         * 加载我的兑换券列表
         * @param  {boolean} first 是否第一次加载
         * @return {promise} promise对象
         */
        _loadVoucherList: function (first) {
            var _self = this,
                _filter = ko.mapping.toJS(this.model.filter);
            this.model.loadComplete(false);
            return this.store.voucherList(_filter)
                .done(function (data) {
                    data.items = data.items || [];
                    _self.model.items(data.items);
                    _self._pagePlugin(data.total, _filter.page_size, _filter.page_no);
                })
                .always(function () {
                    _self.model.loadComplete(true);
                });
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
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        _self.model.items([]);
                        _self.model.filter.page_no(pageNum);
                        _self._loadVoucherList();
                    }
                }
            });
        },
        /**
         * status改变订阅事件
         * @param  {int} status 切换tab状态
         * @return {null}        null
         */
        _flashByStatus: function (status) {
            this.model.filter.page_no(0);
            this._loadVoucherList(false);
        },
        /**
         * tab页签点击事件
         * @param  {int} tabIndex tabINdex
         * @return {null}          null
         */
        tabHandler_js: function (tabIndex) {
            this.model.items([]);
            this.model.filter.status(tabIndex);
        },
        /**
         * 判断是否为历史兑换券
         * @param  {object}  binds ko绑定对象
         * @return {Boolean}       是否为历史
         */
        isDisabled_js: function (binds) {
            if (binds.use_status === 1 || binds.use_status === 0 && (binds.coin_certificate_vo.use_status === 1 || this._timeJudge(binds.coin_certificate_vo.allow_use_end_time, binds.server_time))) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * 判断是否为历史兑换券
         * @param  {object}  binds ko绑定对象
         * @return {string}       translate国际化code
         */
        coinLabel_js: function (binds) {
            if (binds.use_status === 1) {//已使用
                return 'myStudy.myVoucher.used';
            } else if (binds.use_status === 0 && binds.coin_certificate_vo.use_status === 1) {//禁止
                return 'myStudy.myVoucher.invalid';
            } else if (binds.use_status === 0 && this._timeJudge(binds.coin_certificate_vo.allow_use_end_time, binds.server_time)) {//过期
                return 'myStudy.myVoucher.expired';
            }
            return 'myStudy.myVoucher.noUse';//未使用
        },
        /**
         * 时间对比
         * @param  {date} t1 开始时间
         * @param  {date} t2 结束时间
         * @return {boolean}    开始时间是否小于结束时间
         */
        _timeJudge: function (t1, t2) {
            var _t1 = new Date(t1.substr(0, 19)),
                _t2 = new Date(t2.substr(0, 19));
            return _t1.getTime() < _t2.getTime();
        }
    };

    /**
     * 注册ko组件my-voucher
     */
    ko.components.register('x-my-voucher', {
        synchronous: true,
        viewModel: VoucherModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
