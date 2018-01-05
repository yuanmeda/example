/*!
 * 兑换券管理列表
 * @param  {object} window window对象
 * @param  {object} $      jQuery对象
 */
(function (window, $) {
    'use strict';
    // 绑定元素
    var bindingDom = document.getElementById('voucher_js');
    //VoucherManage构造函数
    function VoucherManage(params) {
        var _model = {
                items: [], //兑换券列表
                filter: {
                    name: '', //名称
                    min_number: '', //数量下限
                    max_number: '', //数量上限
                    allow_receive_start_time: '', //领取开始时间
                    allow_receive_end_time: '', //领取结束时间
                    allow_use_start_time: '', //使用开始时间
                    allow_use_end_time: '', //使用结束时间
                    receive_status: '', //领用状态
                    use_status: '', //使用状态
                    page: 0, //页码
                    size: 20 //每页的记录数
                },
                isForbid: false, //搜索按钮状态
                modalTitle: '' //模态框提示文本
            },
            _self = this;
        this.store = {
            //查询兑换券列表
            queryVouchers: function (filter) {
                var _url = '/' + params.projectCode + '/coin_certificates/pages';
                return $.ajax({
                    url: _url,
                    data: JSON.stringify(filter),
                    contentType: 'application/json',
                    type: 'POST'
                });
            },
            // 禁领（启领）
            receiveToggle: function (coinId, status) {
                var _url = '/' + params.projectCode + '/coin_certificates/' + coinId + '/receive_status/' + status;
                return $.ajax({
                    url: _url,
                    type: 'PUT'
                });
            },
            // 禁用（启用）
            useToggle: function (coinId, status) {
                var _url = '/' + params.projectCode + '/coin_certificates/' + coinId + '/use_status/' + status;
                return $.ajax({
                    url: _url,
                    type: 'PUT'
                });
            }
        };
        //ko双向绑定
        this.model = ko.mapping.fromJS(_model);
        //领用数量规则
        this.model.filter.min_number.extend({
            pattern: {
                params: '^\\d+$',
                message: '请输入非负整数'
            }
        }).subscribe(function (val) {
            this.model.isForbid(!!this.model.validatedInfo().length);
        }, this);
        this.model.filter.max_number.extend({
            pattern: {
                params: '^\\d+$',
                message: '请输入非负整数'
            },
            number_judge: {
                params: _self.model.filter.min_number,
                onlyIf: function () {
                    return +_self.model.filter.min_number() !== '';
                }
            }
        }).subscribe(function (val) {
            this.model.isForbid(!!this.model.validatedInfo().length);
        }, this);
        //ko-validation验证组
        this.model.validatedInfo = ko.validation.group(this.model.filter);
        this._init();
    }

    //VoucherManage原型方法
    VoucherManage.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function () {
            this._datePicker();
            this._queryVouchers(true);
        },
        /**
         * datePicker初始化
         * @return {null} null
         */
        _datePicker: function () {
            var _self = this;
            // 初始化datepicker
            $('.datepicker_js').datetimepicker({
                autoclose: true,
                clearBtn: true,
                format: 'yyyy-mm-dd',
                minView: 2,
                todayHighlight: 1,
                language: 'zh-CN',
                minuteStep: 10
            });
            // 领用时间规则
            $('#receive_begin_js').on('changeDate', function (e) {
                $('#receive_end_js').datetimepicker('setStartDate', e.date);
                _self.model.filter.allow_receive_start_time(+e.date ? _self._getTimeZone(e.date) : '');
            });
            $('#receive_end_js').on('changeDate', function (e) {
                $('#receive_begin_js').datetimepicker('setEndDate', e.date);
                _self.model.filter.allow_receive_end_time(+e.date ? _self._getTimeZone(e.date) : '');
            });
            // 使用时间规则
            $('#use_begin_js').on('changeDate', function (e) {
                $('#use_end_js').datetimepicker('setStartDate', e.date);
                _self.model.filter.allow_use_start_time(+e.date ? _self._getTimeZone(e.date) : '');
            });
            $('#use_end_js').on('changeDate', function (e) {
                $('#use_begin_js').datetimepicker('setEndDate', e.date);
                _self.model.filter.allow_use_end_time(+e.date ? _self._getTimeZone(e.date) : '');
            });
        },
        /**
         * 兑换券列表查询
         * @param  {boolean} isFirst 是否第一次加载
         * @return {null} null
         */
        _queryVouchers: function (isFirst) {
            var _filter = ko.mapping.toJS(this.model.filter),
                _self = this;
            this.store.queryVouchers(_self._queryFilter(_filter))
                .done(function (data) {
                    _self.model.items(data.items);
                    _self._pagePlugin(data.total, _filter.size, _filter.page);
                    window.parent.scrollTo(0, 0);
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
                        _self.model.filter.page(pageNum);
                        _self._queryVouchers();
                    }
                }
            });
        },
        /**
         * 兑换券搜索
         * @return {null} null
         */
        voucherSearch_js: function () {
            this.model.filter.page(0);
            if (this.model.validatedInfo().length > 0) {
                return;
            }
            this._queryVouchers();
        },
        /**
         * 兑换券创建
         * @return {null} null
         */
        voucherCreate_js: function () {
            return false;
        },
        /**
         * 切换领用状态件
         * @param  {object} type 形式
         * @param  {object} binds ko绑定对象
         * @return {null}       null
         */
        openForbidModal: function (type, binds) {
            this.currentBinds = {
                type: type,
                id: binds.id,
                status: binds[type + '_status'],
            };
            if (this.currentBinds.status === 3) {
                this.submitForbid_js();
                return;
            }
            if (type === 'receive') {
                this.model.modalTitle('是否禁止该兑换券领用？');
            } else {
                this.model.modalTitle('是否禁止该兑换券使用？');
            }
            $('#forbidModal_js').modal('show');
        },

        /**
         * 切换领用状态件
         * @param  {object} binds ko绑定对象
         * @return {null}       null
         */
        submitForbid_js: function () {
            var _self = this,
                _status = +!!(3 ^ this.currentBinds.status);
            this.store[this.currentBinds.type + 'Toggle'](this.currentBinds.id, _status)
                .done(function (data) {
                    _self._queryVouchers();
                })
                .always(function () {
                    $('#forbidModal_js').modal('hide');
                });
        },
        /**
         * 服务端日期格式化
         * @param  {string} dateString 服务端日期字符串
         * @param  {string} fmt 时间格式
         * @return {string}            格式化字符串
         */
        dataFormat_js: function (dateString, fmt) {
            return dateString ? dateString.split('.')[0].replace('T', ' ') : '';
        },
        /**
         * 获取时区
         * @param  {string} dt js时间格式
         * @return {string}    java时间格式
         */
        _getTimeZone: function (dt) {
            var _self = this,
                _t = new Date(),
                gmt;
            dt = $.format.date(dt, 'yyyy-MM-dd');
            if (!dt) {
                return;
            }
            gmt = _t.getTimezoneOffset() / 60 * (-100);
            return dt.split('T')[0] + 'T00:00:00.000+0' + gmt;
        }
    };
    /**
     * 静态方法
     * @type {Object}
     */
    VoucherManage.validation = {
        /**
         * 验证器初始化
         * @return {null} null
         */
        _init: function () {
            ko.validation.init({
                insertMessages: false,
                decorateInputElement: true,
                errorElementClass: 'error'
            }, true);
            this._register();
        },
        /**
         * 注册验证器
         * @return {null} null
         */
        _register: function () {
            //数字比较
            ko.validation.rules.number_judge = {
                validator: function (val, otherVal) {
                    if (!val)
                        return true;
                    return +val >= +otherVal;
                },
                message: '数值必须大于{0}'

            };
            //注册
            ko.validation.registerExtenders();
        }
    };
    VoucherManage.validation._init();
    //绑定ko-页面
    ko.applyBindings(new VoucherManage({
        projectCode: projectCode
    }), bindingDom);
})(window, jQuery);
