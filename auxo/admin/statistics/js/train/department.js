(function(window, $) {
    'use strict';
    var applyTarget = document.body;
    // 数据
    var store = {
        list: function(filter) {
            var uri = '/v1/exams/' + examId + '/orgs';
            return $.ajax({
                url: uri,
                data: filter
            });
        },
        output: function(options) {
            var uri = '/v1/exams/' + examId + '/orgs/export';
            return $.ajax({
                url: uri,
                data: options
            });
        },
        layer: function(rootId, nodeId) {
            var uri = ' /v1/org_tree/' + rootId + '/nodes/' + nodeId + '/layer';
            return $.ajax({
                url: uri
            });
        }
    };
    var sortStatus = {
        enroll_count: 'asc',
        exam_count: 'asc',
        wait_count: 'asc',
        exam_ratio: 'asc',
        best_avg_score: 'asc'
    };

    function ViewModel(params) {
        var _model = {
            items: [],
            layers: [],
            exporting: false,
            nodeName: '',
            filter: {
                node_id: '',
                root_id: '',
                layer: 1,
                order_by: '',
                size: 20,
                page: 0
            }
        };
        this.model = ko.mapping.fromJS(_model);
        this.model.filter.node_id.subscribe(function(id) {
            this._layer(this.model.filter.root_id(), id);
        }, this);
        this._init();
    }
    ViewModel.prototype = {
        /**
         * 初始化
         * @return {null} null
         */
        _init: function() {
            this._initTree();
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
         * 搜索组织层级
         * @return {null} null
         */
        _layer: function(rootId, nodeId) {
            var vm = this;
            store.layer(rootId, nodeId)
                .done(function(max_layer) {
                    var layers = [],
                        layerIndex = vm.model.filter.layer()||1;
                    for (var i = layerIndex; i <= max_layer; i++) {
                        layers.push({
                            value: i,
                            text: i + '级组织'
                        });
                    }
                    vm.model.layers(layers);
                    !vm.INIT && vm._list()
                        .then(function() {
                            setTimeout(function() {
                                $('[v-block]').removeClass('hide');
                            }, 300);
                            vm.INIT = true;
                        });
                });
        },
        /**
         * 初始化树
         * @return {null} null
         */
        _initTree: function() {
            var vm = this;
            window.tree.show('#ztree', false, function(node) {
                vm.model.filter.node_id(node.node_id);
                var newLayer = vm._getLayer(node);
                vm.model.filter.layer(newLayer);
                vm._list();
            }).done(function(tree) {
                vm.tree = tree;
                var rootNode = tree.getNodes()[0];
                vm.model.filter.root_id(rootNode.root_id);
                vm.model.filter.node_id(rootNode.node_id);
                vm.model.filter.layer(1);//层级加载，根节点默认为1
                //tree.expandNode(rootNode);
                tree.selectNode(rootNode);
            });
        },
        /*获取当前点击的节点的layer值*/
        _getLayer: function (treeNode) {
            var layer = 0, node = treeNode;
            while (node != null) {
                node = node.getParentNode();
                layer++;
            }
            return layer;
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
         * 组织节点查找
         * @return {null} null
         */
        treeSearch: function() {
            var _self = this, chosenNode = null;
            var nodes = this.tree.getNodesByParamFuzzy('node_name', this.model.nodeName());
            if (nodes && nodes[0]) {
                /*如果nodes中包含精确的nodeName，那就选中nodeName。不然就选中nodes中的第一个*/
                $.each(nodes, function (index, item) {
                    if (item.node_name == _self.model.nodeName()) {
                        _self.tree.selectNode(item);
                        chosenNode = item;
                        return false;
                    }
                });
                if (!chosenNode) {
                    _self.tree.selectNode(nodes[0]);
                    chosenNode = nodes[0];
                }
                this.model.filter.node_id(chosenNode.node_id);
                var newLayer = this._getLayer(chosenNode);
                this.model.filter.layer(newLayer);
                this.search();
            }
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
        }
    };

    $(function() {
        ko.applyBindings(new ViewModel(), applyTarget);
    })
})(window, jQuery);
