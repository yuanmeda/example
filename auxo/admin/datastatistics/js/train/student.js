(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据
    var store = {
        list: function(filter) {
            var uri = '/v1/datastatistics/trains/' + trainId + '/users';
            return $.ajax({
                url: uri,
                data: filter
            });
        },

        output: function(options) {
            var uri = '/v1/datastatistics/trains/' + trainId + '/users/export';
            return $.ajax({
                url: uri,
                data: options
            });
        },

        users: function(data) {
            var uri = '/v1/datastatistics/user_search';
            return $.ajax({
                url: uri,
                delay: 400,
                cache: true,
                global: false,
                data: data
            });
        }
    };
    var sortStatus = {
        study_duration: 'asc',
        require_period: 'asc',
        option_period: 'asc',
        last_study_time: 'asc'
    };

    function ViewModel(params) {
        var _model = {
            items: [],
            exporting: false,
            org: '',
            filter: {
                user_id: '',
                root_id: '',
                org_id: '',
                order_by: '',
                size: 20,
                page: 0
            }
        };
        this.model = ko.mapping.fromJS(_model);
        this.model.org.subscribe(function(v) {
            this.model.filter.root_id(v ? v.root_id : '');
            this.model.filter.org_id(v ? v.node_id : '');
            if (!this.first) {
                this.rootNode = v;
                this._list();
                this.first = true;
            }
        }, this);
        this._init();
    }
    ViewModel.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function() {
            this._select2();
        },
        /**
         * 列表查询
         * @return {null} null
         */
        _list: function() {
            var vm = this,
                _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.filter));
            return store.list(_filter)
                .then(function(d) {
                    vm.model.items(d.items || []);
                    vm._pagination(d.total, _filter.size, _filter.page);
                });
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
         * select2插件初始化
         * @return {null} null
         */
        _select2: function() {
            var query = {
                $offset: 0,
                $limit: 50
            };
            $('#userSelect_js').select2({
                allowClear: true,
                width: '160px',
                placeholder: '帐号/姓名',
                language: 'zh-CN',
                ajax: {
                    transport: function(params, success, failure) {
                        if (!params.data) {
                            return;
                        } else {
                            store.users(params.data).then(success, failure);
                        }
                    },
                    data: function(params) {
                        params.term = $.trim(params.term);
                        if (params.term) {
                            query.account = params.term;
                        } else {
                            return false;
                        }
                        return query;
                    },
                    processResults: function(data, params) {
                        var mapData = data.items.map(function(v, i, arr) {
                            return {
                                id: v.user_id,
                                text: v.nick_name
                            };
                        });
                        return {
                            results: mapData
                        }
                    }
                },
                minimumInputLength: 1,
                maximumInputLength: 10
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
         * 排序
         * @return {null} null
         */
        orderBy: function(type) {
            var oType = sortStatus[type];
            sortStatus[type] = oType === 'asc' ? 'desc' : 'asc';
            this.model.filter.order_by(type + ' ' + oType);
            this.model.filter.page(0);
            this._list();
        },
        /**
         * 查找
         * @return {null} null
         */
        search: function() {
            this.model.filter.page(0);
            this.model.filter.order_by('');
            this._list();
        },
        /**
         * 导出
         * @return {null} null
         */
        output: function() {
            var vm = this;
            var options = ko.mapping.toJS(this.model.filter);
            delete options.page;
            delete options.size;
            this.model.exporting(true);
            store.output(this._dataEmptyFilter(options))
                .done(function(file) {
                    window.location.href = file.file_name;
                })
                .always(function() {
                    vm.model.exporting(false);
                });
        },
        clear: function() {
            this.model.org(this.rootNode);
            var $search = $('#userSelect_js').data('select2').$selection.find('.select2-selection__clear');
            $search.trigger('mousedown');
            this.model.filter.user_id('');
        }
    };

    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);