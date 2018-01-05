(function (window, $) {
    'use strict';
    var applyTarget = document.body;
    ko.options.deferUpdates = true;
    // 数据
    var store = {
        // 获取付费策略
        strategy: function () {
            return $.ajax({
                url: PAY_SERVICE_URL + '/v1/units/' + unitId + '/strategy'
            });
        },
        // 设置付费策略
        setStrategy: function (data) {
            return $.ajax({
                url: PAY_SERVICE_URL + '/v1/units/' + unitId + '/strategy',
                data: JSON.stringify(data),
                type: 'PUT'
            });
        },
        // 查询账户支持的币种
        currency: function () {
            return $.ajax({
                url: PAY_SERVICE_URL + '/v1/account/currencies'
            });
        }
    };

    function ViewModel(unitId) {
        var _model = {
            strategy: {
                unit_id: unitId,
                price: 0,
                price_type: 'CHANNEL_CASH', //默认人民币
                project_id: ''
            },
            currencies: []
        };
        this.validInfo = null;
        this._init(_model);
    }

    ViewModel.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function (model) {
            var vm = this;
            this.model = ko.mapping.fromJS(model);
            this._validInit();
            $.when(this._queryCurrency(), this._queryStrategy()).then(function (curreny, strategy) {
                vm.model.currencies(curreny[0] || []);
                strategy[0] && ko.mapping.fromJS(strategy[0], {}, vm.model.strategy);
                $('#pay_container_js').show();
            });
        },
        /**
         * valid验证
         * @return {null} null
         */
        _validInit: function () {
            var t = this;
            ko.validation.rules['decimal'] = {
                validator: function (val, decimal) {
                    var _reg = new RegExp('^\\d+(?:\.\\d{1,' + decimal + '})?$');
                    return _reg.test(val) || !val;
                },
                message: '最多保留 {0} 位小数'
            };
            ko.validation.registerExtenders();
            this.validInfo = ko.validation.group({
                price: this.model.strategy.price.extend({
                    required: {
                        params: true,
                        message: '费用必填'
                    },
                    number: {
                        params: true,
                        message: '费用格式错误'
                    },
                    min: {
                        params: 0,
                        message: '费用不能低于{0}'
                    },
                    max: {
                        params: 100000,
                        message: '费用不能高于{0}'
                    },
                    pattern: {
                        params: /^\d+$/g,
                        message: '积分、代币、守护币不能为小数',
                        onlyIf: function () {
                            var _priceType = t.model.strategy.price_type();
                            return _priceType === 'CHANNEL_GOLD' || _priceType === 'CHANNEL_EMONEY' || _priceType === 'CHANNEL_GUARDCOIN';
                        }
                    },
                    decimal: {
                        params: 2,
                        onlyIf: function () {
                            var _priceType = t.model.strategy.price_type();
                            return _priceType === 'CHANNEL_CASH';
                        }
                    }
                })
            });
        },
        /**
         * Strategy查询
         * @return {null} null
         */
        _queryStrategy: function () {
            var vm = this;
            return store.strategy();
        },
        /**
         * currencies查询
         * @return {null} null
         */
        _queryCurrency: function () {
            var vm = this;
            return store.currency();
        },
        /**
         * Strategy设置
         * @return {null} null
         */
        _setStrategy: function () {
            var vm = this,
                _strategy = ko.mapping.toJS(this.model.strategy);
            var url = this.getQueryString('__return_url');
            var contextId = this.getQueryString('context_id');
            return store.setStrategy({
                price: _strategy.price,
                price_type: _strategy.price_type,
                context_id: contextId
            }).then(function (d) {
                $.confirm({
                    type: 'alert',
                    content: '设置成功',
                    cancelButton: false,
                    title: false,
                    confirm: function () {
                        if (url) {
                            location.href = url;
                        }
                    }
                });
            });
        },
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        /**
         * 保存
         * @return {null} null
         */
        save: function () {
            if (!this.model.currencies().length) {
                $.alert('请完善付费信息设置');
                return;
            }
            this._setStrategy();
        }
    };
    $(function () {
        ko.validation.init({
            insertMessages: false,
            decorateInputElement: true,
            errorElementClass: 'ele-error',
            errorClass: 'mes-error',
            registerExtenders: true
        }, true);
        ko.applyBindings(new ViewModel(unitId), applyTarget);
    })
})(window, jQuery);
