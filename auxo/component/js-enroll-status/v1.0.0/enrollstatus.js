;(function ($, window) {
    'use strict';

    function ViewModel(params) {
        var _i18nValue = i18nHelper.getKeyValue;
        this.params = params || {};
        this.unitId = params.unitId; //课程id
        this.projectCode = params.code || projectCode; //项目标识
        this.returnUrl = params.returnUrl; //返回页面的地址
        this.host = params.host; //域名
        this.payHost = params.payHost; // 支付域名
        this.contextId = 'enroll:' + this.unitId + '.' + params.contextId; // 支付context_id

        this.statusMap = {
            // 未登录
            0: {
                "display": _i18nValue('enroll.unLogin'),
                "href": 'javascript:;'
            },
            // 已报名
            1: {
                "display": _i18nValue('enroll.enrolled'),
                "href": 'javascript:;'
            },
            // 立即报名
            2: {
                "display": _i18nValue('enroll.enroll'),
                "href": this.host + '/' + this.projectCode + '/enroll/enroll?unit_id=' + this.unitId + '&__return_url=' + this.returnUrl
            },
            // 报名未开始
            3: {
                "display": _i18nValue('enroll.enrollNotStart'),
                "href": 'javascript:;'
            },
            // 已结束
            4: {
                "display": _i18nValue('enroll.finished'),
                "href": 'javascript:;'
            },
            // 审核中
            5: {
                "display": _i18nValue('enroll.audit'),
                "href": 'javascript:;'
            },
            // 去支付
            6: {
                "display": _i18nValue('enroll.goPay'),
                "href": this.payHost + '/' + this.projectCode + '/pay/commodity?context_id=' + this.contextId + '&unit_id=' + this.unitId + '&__return_url=' + this.returnUrl
            },
            // 名额已满
            7: {
                "display": _i18nValue('enroll.quotaFull'),
                "href": 'javascript:;'
            },
            // 立即报名(表单待填写)
            8: {
                "display": _i18nValue('enroll.enroll'),
                "href": this.host + '/' + this.projectCode + '/enroll/enroll?unit_id=' + this.unitId + '&__return_url=' + this.returnUrl
            }
        };

        this.displayText = ko.observable(''); //展示文本
        this.isDisabled = ko.observable(false); //按钮是否禁用
        this.actionUrl = 'javascript:;'; //跳转地址

        this.start = ko.observable(null); //开始时间
        this.end = ko.observable(null); //结束时间
        this.limit = ko.observable(null); //限制人数
        this.enrolled_count = ko.observable(null); //报名人数
        this.payment_strategy = ko.observable(null); //报名费用
        this.status = ko.observable(null); //报名状态
        this.displayAmount = ko.observable(null); //展示金额

        this.blockShow = ko.computed(function () {
            return !!this.start() || !!this.end() || !!this.limit() || !!this.payment_strategy();
        }, this);

        this._init();
    }

    ViewModel.getEnrollStatus = function (host, uId) {
        var _url = host + '/v1/user/enroll_entrance_info';
        return $.ajax({
            url: _url,
            data: {
                unit_id: uId
            }
        });
    };
    ViewModel.prototype = {
        _init: function () {
            var vm = this;
            if (!this.unitId) {
                return;
            }
            ViewModel.getEnrollStatus(this.host, this.unitId)
                .done(function (d) {
                    var _statusMap = vm.statusMap[d.status];
                    vm.start(d.start);
                    vm.end(d.end);
                    vm.limit(d.limit);
                    vm.enrolled_count(d.enrolled_count);
                    vm.payment_strategy(d.payment_strategy);
                    vm.status(d.status);
                    vm.displayAmount(d.display_amount);
                    // 按钮禁用状态
                    if ($.inArray(d.status, [3, 5, 1, 4, 7, 0]) > -1) {
                        vm.isDisabled(true);
                    }
                    vm.displayText(_statusMap.display);
                    vm.actionUrl = _statusMap.href;
                }).always(function () {
                $('.x-enroll-status').removeClass('hide');
            });
        },
        // 时间格式化
        _dateFormat: function (time) {
            if (ko.isObservable(time)) {
                time = time();
            }
            if (!time) {
                return;
            }
            if(timeZoneTrans){
                return timeZoneTrans(time).slice(0, 10);;
            } else {
                return time.replace('T', ' ').replace(/\-/g, '/').slice(0, 10);
            }
        },
        // 获取macUrl
        _getMacUrl: function (uri) {
            var __mac = Nova.getMacToB64(uri),
                __prefix;
            if (/\&/g.test(uri)) {
                __prefix = '&'
            } else {
                __prefix = '?'
            }
            return uri + __prefix + '__mac=' + __mac;
        },
        //按钮点击事件
        onClick: function (binds, evt) {
            if (!this.isDisabled() && this.actionUrl !== 'javascript:;') {
                var url = this._getMacUrl(this.actionUrl);
                // if (this.status() === 6) {
                //     window.open(url);
                // } else {
                    window.location.href = url;
                // }
            }
        }
    };
    $(function () {
        ko.components.register('x-enroll-status', {
            synchronous: true,
            viewModel: {
                createViewModel: function (params, componentInfo) {
                    $(componentInfo.element).css('height', '100%');
                    return new ViewModel(params);
                }
            },
            template: '<div class="x-enroll-status hide">\
				            <div class="enroll--info" data-bind="visible:blockShow">\
                                <div class="table-layout">\
    					            <p data-bind="visible:start()||end()">\
    						            <span data-bind="text:_dateFormat(start)"></span>\
    						            <!--ko translate:{key:\'enroll.to\'}--><!--/ko-->\
    						            <span data-bind="text:_dateFormat(end)"></span>\
    					            </p>\
    					            <p data-bind="visible:limit">\
    					            	<span data-bind="translate:{key:\'enroll.enrollLimit\',properties:{enrolled:enrolled_count,limit:limit}}"></span>\
    					            </p>\
    					            <p data-bind="visible:displayAmount">\
    					            	<span data-bind="translate:{key:\'enroll.enrollPay\'}"></span>\
    					            	<strong data-bind="text:displayAmount"></strong>\
    					            </p>\
                                </div>\
                                <div class="badge"></div>\
				            </div>\
				            <div class="default-icon" data-bind="visible:!blockShow()">\
    					        <i class="es-icon-study"></i>\
    					    </div>\
				            <div class="enroll--button">\
				            	<a href="javascript:;" class="button" data-bind="click:onClick,text:displayText,css:{\'button--disabled\':isDisabled,\'button--theme\':!isDisabled()}"></a>\
				            </div>\
            			</div>'
        });
    });
})(jQuery, window);
