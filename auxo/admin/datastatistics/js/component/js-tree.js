(function (window, $) {
    var store = {
        query: function () {
            return $.ajax({
                url: elearningJavaService + '/v1/mix_organizations/' + orgId + '/mix_nodes/0/children',
                cache: false,
                type: 'GET',
                dataType: 'JSON',
                headers: {
                    'X-Gaea-Authorization': undefined,
                    'Authorization': undefined
                }
            });
        },
        queryChildrenNodes: function (mix_organization_id, mix_node_id) {
            return $.ajax({
                url: elearningJavaService + '/v1/mix_organizations/' + mix_organization_id + '/mix_nodes/' + mix_node_id + '/children',
                cache: false,
                type: 'GET',
                dataType: 'JSON',
                headers: {
                    'X-Gaea-Authorization': undefined,
                    'Authorization': undefined
                }
            });
        }
    };

    function ViewModel(params) {
        if (!ko.isObservable(params.value)) {
            throw new Error('params value must a observable value.');
        }
        this.$el = params.$el;
        this.value = params.value;
        this.layer = params.layer;
        this.uri = params.uri || '/v1/org_tree';
        this.nodeName = ko.observable('');
        this.rootNodeId = ko.observable('');
        this.currentSavedNodeId = ko.observable('');
        this.value.subscribe(function (v) {
            if (!v) {
                this._clearData();
            } else {
                this.treeInstance.selectNode(v);
            }
        }, this);
        this._init();
    }

    ViewModel.prototype = {
        _init: function () {
            this._queryData();
        },
        // 加载数据
        _queryData: function () {
            var vm = this;
            store.query()
                .done(function (data) {
                    var $target = vm.$el.find('#ztree');
                    if (!data) {
                        $target.html('暂无节点');
                        return;
                    }
                    !$.isArray(data) && (data = [data]);
                    if (data[0].is_parent) {
                        data[0].isParent = true;
                    }
                    vm.rootNodeId(data[0].node_id);
                    vm.layer && vm.layer(1);//初始加载只有根节点，默认layer等于1
                    vm.currentSavedNodeId(data[0].id);
                    vm._generateTree(data, $target);
                });
        },
        // 生成树实例
        _generateTree: function (data, target) {
            this.treeInstance = $.fn.zTree.init(target, {
                data: {
                    key: {
                        /*children: "children",*/
                        name: "node_name",
                        title: "node_name"
                    },
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "parent_id",
                        rootPId: "root_id"
                    }
                },
                callback: {
                    onClick: $.proxy(this._onClick, this),
                    onExpand: $.proxy(this._onExpand, this)
                }
            }, data);
            this.rootNode = this.treeInstance.getNodes()[0];
            //this.treeInstance.expandNode(this.rootNode);
            this.treeInstance.selectNode(this.rootNode);
            this.value(this.rootNode);
        },
        // 节点点击事件
        _onClick: function (evt, treeId, treeNode) {
            // if(this.value()&&treeNode.id===this.value().id){
            //     this.treeInstance.cancelSelectedNode(treeNode);
            //     this.value(this.rootNode);
            // }else{
            //     this.treeInstance.selectNode(treeNode);
            //     this.value(treeNode);
            // }
            var _self = this;
            this.treeInstance.selectNode(treeNode);
            /*获取当前点击的节点的layer值*/
            if (this.layer) {
                var newLayer = this._getLayer(treeNode);
                this.layer(newLayer);
            }
            /*判断是否点击同一个节点，避免重复访问接口*/
            if (this.currentSavedNodeId() != treeNode.id) {
                this.value(treeNode);
                this.currentSavedNodeId(treeNode.id);
            }
        },
        _onExpand: function (evt, treeId, treeNode) {
            var _self = this;
            /*检验当前节点是否已加载了子节点*/
            var flag = treeNode.children;
            if (flag) return;
            store.queryChildrenNodes(this.rootNodeId(), treeNode.node_id).done(function (resData) {
                if (resData && resData.length) {
                    /*遍历子节点数组，判断其is_parent属性*/
                    $.each(resData, function (index, item) {
                        if (item.is_parent) {
                            item.isParent = true;
                        }
                    });
                    _self.treeInstance.addNodes(treeNode, resData, false);
                }
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
        // 取消选中节点
        _clearData: function () {
            this.treeInstance.cancelSelectedNode();
        },
        _treeSearch: function () {
            var _self = this, chosenNode = null;
            var nodes = this.treeInstance.getNodesByParamFuzzy('node_name', this.nodeName());
            if (nodes && nodes[0]) {
                /*如果nodes中包含精确的nodeName，那就选中nodeName。不然就选中nodes中的第一个*/
                $.each(nodes, function (index, item) {
                    if (item.node_name == _self.nodeName()) {
                        _self.treeInstance.selectNode(item);
                        chosenNode = item;
                        return false;
                    }
                });
                if (!chosenNode) {
                    this.treeInstance.selectNode(nodes[0]);
                    chosenNode = nodes[0];
                }
                if (this.layer) {
                    var newLayer = this._getLayer(chosenNode);
                    this.layer(newLayer);
                }
                this.value(chosenNode);
            }
        },
    };
    ko.components.register('x-statistics-tree', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                var $el = $(componentInfo.element).find('[data-dom="tree"]');
                $el.addClass(params.clazz || '');
                params.$el = $el;
                return new ViewModel(params);
            }
        },
        template: '<div data-dom="tree"><div class="form-inline" role="form">\
                        <div class="form-group">\
                            <label class="sr-only">组织名称</label>\
                            <input type="text" class="form-control" data-bind="textInput:nodeName" placeholder="组织名称">\
                        </div>\
                        <a href="javascript:;" class="btn btn-primary btn-sm" data-bind="click:_treeSearch">搜索</a>\
                    </div><ul class="ztree" id="ztree"></ul></div>'
    })
})(window, jQuery);
