(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据
    var store = {
        query: function(data) {
            return $.ajax({
                url: '/' + projectCode + '/usercertificatepostinfo',
                data: data
            });
        },
        update: function(data) {
            return $.ajax({
                url: '/' + projectCode + '/usercertificatepost',
                data: JSON.stringify(data),
                contentType: 'application/json',
                type: 'PUT'
            });
        },
        addPrintHistory: function(cid) {
            return $.ajax({
                url: '/' + projectCode + '/printlogs?user_certificate_id=' + cid,
                type: 'POST'
            });
        },
        queryPrintInfo: function(uid, cid) {
            return $.ajax({
                url: '/' + projectCode + '/certificates/user_certificates/view',
                data: {
                    user_id: uid,
                    certificate_id: cid
                }
            });
        },
        goodsSearch: function(code) {
            return $.ajax({
                url: '/' + projectCode + '/materialInfo',
                data: {
                    no: code
                }
            });
        }
    };
    // 寄送状态
    var sendStatus = [{
        title: '未寄送',
        id: 0
    }, {
        title: '寄送中',
        id: 1
    }, {
        title: '已送达',
        id: 2
    }];

    function ViewModel(params) {
        var _model = {
            items: [],
            filter: {
                certificate_id: certificateId,
                id_card: '',
                send_status: status,
                certificate_number: '',
                user_id: '',
                size: 20,
                page: 0,
                start_time: '',
                end_time: ''
            },
            printInfo: {
                content: '',
                printIndex: -1,
                loadComplete: false
            },
            expressInfo: {
                expressNum: '',
                expressIndex: -1
            },
            markInfo: {
                mark: ''
            },
            goodsInfo: {
                goods: [],
                traces: [],
                logisticcode: null
            },
            total: 0,
            showNoNumber: false,
            sendStatus: sendStatus,
            checkedItems: [],
            currentItem: null
        };
        this.model = ko.mapping.fromJS(_model);
        // 打印索引强制刷新
        this.model.printInfo.printIndex.extend({
            notify: 'always'
        });
        // 打印索引变化查询打印信息
        this.model.printInfo.printIndex.subscribe(function(v) {
            var _currentItem = this.model.checkedItems()[v];
            this._getPrintInfo(_currentItem.user_id, _currentItem.certificate_id);
        }, this);
        // 全选读写
        this.model.checkAll = ko.computed({
            read: function() {
                if (!this.model.items().length) {
                    return false;
                }
                return this.model.checkedItems().length === this.model.items().length;
            },
            write: function(v) {
                this.model.checkedItems(v ? this.model.items().filter(function(item) {
                    return item.allow_print === 1;
                }) : []);
            },
            owner: this
        });
        // 可寄送证书
        this.model.expressItems = ko.computed(function() {
            return this.model.items().filter(function(item, i) {
                return item.send_status === 0;
            });
        }, this);
        this._init();
    }
    ViewModel.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function() {
            this.modal = {
                express: $('#expressModal'),
                mark: $('#markModal'),
                print: $('#printModal'),
                goods: $('#goodsModal'),
                number: $('#numberModal')
            };
            this._datePicker();
            this._valid();
            this._list()
                .then(function() {
                    $('#certificate_container_js').show();
                });
        },
        /**
         * 校验器
         * @return {null} null
         */
        _valid: function() {
            this.model.markInfo.mark.extend({
                maxLength: {
                    params: 200,
                    message: '最大输入{0}个字。'
                }
            });
            this.model.expressInfo.expressNum.extend({
                required: {
                    params: true,
                    message: '快递号必填。'
                },
                maxLength: {
                    params: 20,
                    message: '最大输入{0}个字符。'
                }
            });
            this.model.goodsInfo.logisticcode.extend({
                maxLength: {
                    params: 20,
                    message: '最大输入{0}个字符。'
                }
            });
            this.validationInfo = ko.validation.group({
                mark: this.model.markInfo.mark,
                logisticcode: this.model.goodsInfo.logisticcode,
                express: this.model.expressInfo.expressNum
            });
        },
        /**
         * 初始化datepicker
         * @return {null} null
         */
        _datePicker: function() {
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
            $('#send_begin_js').on('changeDate', function(e) {
                $('#send_end_js').datetimepicker('setStartDate', e.date);
                vm.model.filter.start_time(e.date ? +e.date : '');
            });
            $('#send_end_js').on('changeDate', function(e) {
                $('#send_begin_js').datetimepicker('setEndDate', e.date);
                vm.model.filter.end_time(e.date ? +e.date : '');
            });
        },
        /**
         * 列表查询
         * @return {null} null
         */
        _list: function() {
            var vm = this,
                _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.filter));
            return store.query(_filter)
                .then(function(d) {
                    vm.model.items(d.items || []);
                    vm._pagination(d.count, _filter.size, _filter.page);
                    vm.model.total(d.count || 0);
                    // 替换选中item
                    vm.model.checkedItems().forEach(function(item, index) {
                        for (var _i = 0; _i < d.items.length; _i++) {
                            if (d.items[_i].id === item.id) {
                                vm.model.checkedItems.replace(item, d.items[_i]);
                            }
                        }
                    });
                });
        },
        /**
         * 过滤空参数
         * @param  {Object} obj 待过滤参数
         * @return {Object}     已过滤参数
         */
        _dataEmptyFilter: function(obj) {
            var _obj = {};
            for (var k in obj) {
                if (obj.hasOwnProperty(k) && obj[k] !== '') {
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
        _pagination: function(total, pageSize, currentPage) {
            var vm = this;
            $('#pagination').pagination(total, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function(pageNum) {
                    if (pageNum != currentPage) {
                        vm.model.filter.page(pageNum);
                        vm._list();
                    }
                }
            });
        },
        /**
         * 打印详情
         * @param  {string} uid 用户ID
         * @param  {string} cid 证书ID
         * @return {null}     null
         */
        _getPrintInfo: function(uid, cid) {
            var t = this;
            this.model.printInfo.loadComplete(false);
            store.queryPrintInfo(uid, cid)
                .then(function(data) {
                    t.model.printInfo.content(data.content);
                    t.model.printInfo.loadComplete(true);
                });
        },
        /**
         * 物流详情
         * @param  {string} code 订单号
         * @return {Promise}      promise
         */
        _getGoodsInfo: function(code) {
            var t = this;
            return store.goodsSearch(code)
                .done(function(d) {
                    if (d && d.length ) {
                        if(d[0].traces && d[0].traces.length) {
                            t.model.goodsInfo.traces(d[0].traces.reverse());
                        }
                        t.model.goodsInfo.logisticcode(d[0].logisticcode);
                    }
                    t.model.goodsInfo.goods(d);
                });
        },
        /**
         * 查找
         * @return {null} null
         */
        search: function() {
            this.model.filter.page(0);
            this._list();
        },
        /**
         * 打开寄送modal
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */
        openExpressModel: function(b, evt) {
            this.model.currentItem(b);
            this.model.expressInfo.expressIndex(this._expressIndex(b.id));
            this.model.expressInfo.expressNum('');
            this.validationInfo.showAllMessages(false);
            this.modal.express.modal('show');
        },
        /**
         * 上一个寄送
         * @return {null} null
         */
        expressPrev: function() {
            var t = this,
                _index = this.model.expressInfo.expressIndex() - 1,
                _current = this.model.currentItem(),
                _next = this.model.expressItems()[_index];
            this._validAndUpdate(_current, _next);
        },
        /**
         * 下一个寄送
         * @return {null} null
         */
        expressNext: function() {
            var t = this,
                _index = this.model.expressInfo.expressIndex() + 1,
                _current = this.model.currentItem(),
                _next = this.model.expressItems()[_index];
            this._validAndUpdate(_current, _next);
        },
        /**
         * 验证更新
         * @param  {Object}   current 操作对象
         * @param  {Object} next    下一个操作对象
         * @return {null}           null
         */
        _validAndUpdate: function(current, next) {
            var t = this,
                _promise = this.expressConfirm(current),
                _update;
            if (_promise) {
                _promise.done(function() {
                    t.model.expressInfo.expressIndex(t._expressIndex(next.id));
                    t.model.currentItem(next);
                })
            }
        },
        /**
         * 更新寄送详情
         * @param  {Object} b   更新对象
         * @param  {Event} evt 事件
         * @return {Promise}     promise
         */
        expressConfirm: function(b, evt) {
            var t = this,
                _update;
            if (!this.model.expressInfo.expressNum.isValid()) {
                this.validationInfo.showAllMessages();
                return;
            }
            _update = {
                express_number: this.model.expressInfo.expressNum(),
                send_status: 1,
                id: b.id
            };
            return store.update(_update)
                .done(function(d) {
                    if (evt) {
                        t.modal.express.modal('hide');
                    }
                    t.model.expressInfo.expressNum('');
                    t.validationInfo.showAllMessages(false);
                    t.model.items.replace(b, $.extend({}, b, _update));
                    $.alert({
                        content: '寄送成功',
                        title: false
                    });
                });
        },
        /**
         * 获取id对应的快递对象
         * @param  {string} id id
         * @return {int}    索引
         */
        _expressIndex: function(id) {
            var _items = this.model.expressItems(),
                _index;
            for (var i = 0, len = _items.length; i < len; i++) {
                if (_items[i].id === id) {
                    _index = i;
                    break;
                }
            }
            return _index;
        },
        /**
         * 打开备注modal
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */
        openMarkModel: function(b, evt) {
            this.model.currentItem(b);
            this.validationInfo.showAllMessages(false);
            this.model.markInfo.mark(b.remark);
            this.modal.mark.modal('show');
        },
        /**
         * 更新备注
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */
        markConfirm: function(b, evt) {
            var t = this,
                _update;
            if (!this.model.markInfo.mark.isValid()) {
                this.validationInfo.showAllMessages();
                return;
            }
            _update = {
                remark: this.model.markInfo.mark(),
                id: b.id
            };
            store.update(_update)
                .done(function(d) {
                    t.model.items.replace(b, $.extend({}, b, _update));
                    $.confirm({
                        type: 'alert',
                        content: '更新成功',
                        confirmButton: '关闭',
                        cancelButton: false,
                        title: false
                    });
                    t.modal.mark.modal('hide');
                });
        },
        /**
         * 打开物流信息modal
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */
        openGoodsModel: function(b, evt) {
            var t = this;
            this.model.goodsInfo.traces([]);
            this.model.goodsInfo.goods([]);
            this.model.goodsInfo.logisticcode('');
            this._getGoodsInfo(b.express_number).done(function() {
                t.modal.goods.modal('show');
            });
        },
        /**
         * 修改单号modal
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */

        modifyNumber: function(b, evt) {
            var t = this;
            this.model.currentItem(b);
            this.model.showNoNumber(false);
            this.model.goodsInfo.logisticcode('');
            this._getGoodsInfo(b.express_number).done(function() {
                t.modal.number.modal('show');
            });
        },
        /**
         * 确认修改单号
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */

        sureModifyNunber: function (b, evt) {
            var t = this,
                _update;
            this.model.showNoNumber(false);
            if (!this.model.goodsInfo.logisticcode.isValid()) {
                this.validationInfo.showAllMessages();
                return;
            }

            _update = {
                express_number: this.model.goodsInfo.logisticcode(),
                id: b.id
            };
            if(this.model.goodsInfo.logisticcode() === '') {
                t.model.showNoNumber(true);
            } else {
                store.update(_update)
                    .done(function (d) {
                        t.model.items.replace(b, $.extend({}, b, _update));
                        $.alert({
                            content: '更新成功',
                            title: false
                        });
                        t.modal.number.modal('hide');
                    });
            }
        },
        /**
         * 打开打印modal
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */
        openPrintModel: function(b, evt) {
            this.model.printInfo.printIndex(0);
            this.modal.print.modal('show');
        },
        /**
         * 打印并添加打印记录
         * @param  {Object} b   ko对象
         * @param  {Event} evt 事件
         * @return {null}     null
         */
        printConfirm: function(b, evt) {
            $("#printContainer_js").printThis({
                debug: false,
                importCSS: true,
                importStyle: false,
                printContainer: true,
                // loadCSS: "path/to/my.css",
                pageTitle: '&nbsp;',
                removeInline: false,
                printDelay: 333,
                header: null,
                formValues: true
            });
            store.addPrintHistory(this.model.checkedItems()[this.model.printInfo.printIndex()].user_certificate_id);
        },
        /**
         * 下一个打印
         * @return {null} null
         */
        printPrev: function() {
            this.model.printInfo.printIndex(this.model.printInfo.printIndex() - 1);
        },
        /**
         * 下一个打印
         * @return {null} null
         */
        printNext: function() {
            this.model.printInfo.printIndex(this.model.printInfo.printIndex() + 1);
        }
    };
    // 初始化验证器
    ko.validation.init({
        decorateInputElement: true,
        errorElementClass: 'ele-error',
        errorClass: 'mes-error',
        registerExtenders: true
    }, true);
    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
