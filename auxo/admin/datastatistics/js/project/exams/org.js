(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据
    var store = {
        list: function(filter) {
            var uri = '/v1/datastatistics/exams/all/org_stats';
            return $.ajax({
                url: uri,
                data: filter
            });
        },

        output: function(options) {
            var uri = '/v1/datastatistics/exams/all/org_stats/export';
            return $.ajax({
                url: uri,
                data: options
            });
        },
        layer: function(rootId, nodeId) {
            var uri = '/v1/org_tree/' + rootId + '/nodes/' + nodeId + '/layer';
            return $.ajax({
                url: uri,
                global:false
            });
        }
    };
    var sortStatus = {
        user_count: 'asc',
        study_user: 'asc',
        pass_user: 'asc',
        pass_ratio: 'asc'
    };

    function ViewModel(params) {
        var _model = {
            items: [],
            exporting: false,
            org: '',
            layer: '',
            layers: [],
            clear: false,
            filter: {
                root_id: '',
                org_id: '',
                layer: 1,
                exam_ids: [],
                order_by: '',
                size: 20,
                page: 0
            }
        };
        this.model = ko.mapping.fromJS(_model);
        this.model.org.subscribe(function(v) {
            var vm = this;
            this.model.filter.root_id(v ? v.root_id : '');
            this.model.filter.org_id(v ? v.node_id : '');
            //this.model.layer(v ? v.layer : '');
            this.model.filter.layer(vm.model.layer());
            //if (!this.first) {
                this.rootNode = v;
                this._list();
                //this.first = true;
            //}
            store.layer(v.root_id, v.node_id).then(function(max_layer) {
                var layers = [];
                for (var i = (vm.model.layer()||1); i <= max_layer; i++) {
                    layers.push({
                        key: i + '级组织',
                        value: i
                    });
                }
                vm.model.layers(layers);
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
            // this._list();
        },
        /**
         * 列表查询
         * @return {null} null
         */
        _list: function() {
            var vm = this,
                _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.filter));
            _filter.exam_ids.length && (_filter.exam_ids = _filter.exam_ids.join(','));
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
                is_show_total: true,
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
            this.model.clear(true);
        }
    };

    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
