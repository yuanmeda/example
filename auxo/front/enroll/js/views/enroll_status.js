/*!
 * 报名信息
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //获取报名状态(GET)
        getEnrollEntranceInfo: function () {
            var url = window.self_host + '/v1/user/enroll_entrance_info/';
            return $.ajax({
                url: url,
                data: {unit_id: unitId},
                dataType: 'json',
                cache: false
            });
        },
        //获取用户最近一次报名信息
        getLatestEnroll: function () {
            var url = window.self_host + '/v1/user/latest_enrollments?unit_id=' + unitId;
            return $.ajax({
                url: url,
                dataType: 'JSON',
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            enroll_status: 0,
            payment_strategy: false,
            show_page: false,
            __return_url: __return_url
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko监听数据
            document.title = i18nHelper.getKeyValue('enrollComponent.form.resultTitle');
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            //获取用户最近一次报名信息
            this._getLatestEnroll();
            this._getEnrollEntranceInfo();
        },
        _getEnrollEntranceInfo: function () {
            var _self = this;
            store.getEnrollEntranceInfo().done(function (data) {
                if (data && data.payment_strategy) {
                    _self.model.payment_strategy(true);
                }
            })
        },
        //获取用户最近一次报名信息
        _getLatestEnroll: function () {
            var _self = this;
            store.getLatestEnroll().done(function (data) {
                if (data) {
                    _self.model.enroll_status(data.status);
                    _self.model.show_page(true);
                } else {
                    _self._selfAlert(i18nHelper.getKeyValue('enrollComponent.form.userNoEnroll'), 'error');

                }
            })
        },
        // 弹窗
        _selfAlert: function (text, icon, url) {
            $.fn.udialog.alert(text, {
                width: 550,
                icon: icon || '',
                title: i18nHelper.getKeyValue('enrollComponent.form.resultTitle'),
                dialogClass: 'sys-alert udialog enroll-udialog',
                buttons: [{
                    text: i18nHelper.getKeyValue('enrollComponent.common.confirm'),
                    click: function () {
                        if (url) {
                            window.location.href = url;
                        } else {
                            $(this).udialog("hide");
                        }
                    },
                    'class': 'ui-btn-confirm'
                }]
            });
        }
    };
    /**
     * 执行程序
     */
    viewModel._init();
})(jQuery, window);