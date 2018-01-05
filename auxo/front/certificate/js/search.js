;
(function(window, $) {
    'use strict';

    // 数据模型
    function Search(code) {
        this.code = code;
        this.certificateNumber = ko.observable('');
        this.userRealName = ko.observable('');
        this.userIdCard = ko.observable('');
        this.page = ko.observable(0);
        this.size = ko.observable(5);
        this.items = ko.observableArray([]);
        this.tipShow = ko.observable(false);
        this.hasMore = ko.observable(false);
        this.loading = ko.observable(false);
        this.layer = ko.observable(1);
        this.validMessage = ko.observable('');
        // store
        this.store = {
            query: function(data) {
                return $.ajax({
                    url: selfUrl + '/' + Search.code + '/certificates/user_certificates',
                    data: data
                });
            }
        };

        this._init();
    }

    Search.prototype = {

        _init: function() {
            this._valid();
            setTimeout(function() {
                $('.mobile_container_js').fadeIn(50);
            }, 0);
        },

        _valid: function() {
            var _mes = i18nHelper.getKeyValue('certificate.certSearch.conditionLimit');
            this.validInfo = ko.validation.group({
                cNumber: this.certificateNumber.extend({
                    required: {
                        message: _mes,
                        params: true
                    }
                }),
                uId: this.userIdCard.extend({
                    required: {
                        message: _mes,
                        params: true
                    },
                    // pattern:{
                    //     params:/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                    //     message:'证件格式错误'
                    // }
                }),
                uName: this.userRealName.extend({
                    required: {
                        message: _mes,
                        params: true
                    }
                }),
            });
        },

        _list: function() {
            var vm = this,
                _data;
            _data = this._dataEmptyFilter({
                certificate_number: this.certificateNumber(),
                user_real_name: this.userRealName(),
                user_id_card: this.userIdCard(),
                page: this.page(),
                size: this.size()
            });
            this.loading(true);
            return this.store.query(_data)
                .done(function(d) {
                    if (d && d.items) {
                        vm.items(vm.items().concat(d.items));
                        if (vm.items().length === d.count) {
                            vm.hasMore(false);
                        } else {
                            vm.hasMore(true);
                        }
                    }
                }).always(function() {
                    vm.loading(false);
                });
        },

        _dataEmptyFilter: function(obj) {
            var _obj = {};
            for (var k in obj) {
                if (obj.hasOwnProperty(k) && obj[k] !== '') {
                    _obj[k] = obj[k];
                }
            }
            return _obj;
        },

        debunce: function(fn, time) {
            if (this._timer) {
                clearTimeout(this._timer);
            }
            this._timer = setTimeout(fn.bind(this), time);
        },

        search: function() {
            var vm = this;
            if (this.validInfo().length > 1) {
                this.validMessage(this.validInfo()[0]);
                this.tipShow(true);
                this.debunce(function() {
                    this.tipShow(false);
                }, 1500);
                return;
            } else {
                this.tipShow(false);
            }
            if(this.loading()){
                return;
            }
            this.page(0);
            this.items([]);
            this._list()
                .always(function() {
                    vm.layer(2);
                });
        },

        backward: function() {
            this.layer(1);
        },

        loadMore: function() {
            this.debunce(function() {
                this.page(this.page() + 1);
                this._list();
            }, 300);
        }
    };

    // 启动入口
    $(function() {
        // 初始化验证器
        ko.validation.init({
            decorateInputElement: true,
            errorElementClass: 'ele-error',
            errorClass: 'mes-error',
            registerExtenders: true,
            insertMessages: false
        }, true);
        document.title = i18nHelper.getKeyValue('certificate.certSearch.certificateSearch');
        Search.code = projectCode;
        FastClick.attach(document.body);
        ko.applyBindings(new Search());
    });

})(window, jQuery);
