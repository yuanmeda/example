(function ($, window) {
    var store = {
        /*获取根节点*/
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
        /*根据层级获取节点*/
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
        },
        list: function (data) {
            return $.ajax({
                url: '/v1/project/orgs',
                type: 'GET',
                data: data
            })
        },
        export: function (data) {
            $.ajax({
                url: '/v1/project/orgs/export',
                type: 'GET',
                data: data
            }).done(function (d) {
                location.href = d.file_name;
            });
        },
        layer: function (node_id, root_id) {
            return $.ajax({
                url: '/v1/org_tree/' + root_id + '/nodes/' + node_id + '/layer',
                type: 'GET'
            })
        },
        trains: function () {
            return $.ajax({
                url: '/v1/trains',
                type: 'GET'
            })
        }
    };

    var sorts = {
        'enroll_count': 'ASC',
        'study_count': 'ASC',
        'total_period': 'ASC',
        'study_avg_period': 'ASC',
        'total_avg_period': 'ASC',
        'pass_count': 'ASC',
        'pass_ratio': 'ASC'
    };
    var tree;

    var viewModel = {
        model: {
            filter: {
                node_id: '',
                root_id: '',
                train_id: null,
                channel: 'open-course',
                layer: 1,
                order_by: '',
                page: 0,
                size: 20
            },
            node_name: '',
            layer: 1,
            items: [],
            trains: [],
            layers: []
        },
        init: function () {
            var t = this;

            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            this.model.filter.channel.subscribe(function (v) {
                var t = this;
                if (v == 'train') {
                    store.trains().then(function (d) {
                        t.model.trains(d);
                    });
                } else {
                    this.model.filter.train_id = null;
                    this.model.trains([]);
                }
            }, this);

            this.model.filter.node_id.subscribe(function (v) {
                var t = this;
                store.layer(v, this.model.filter.root_id()).then(function (max_layer) {
                    var layers = [];
                    for (var i = (t.model.filter.layer()||1); i <= max_layer; i++) {
                        layers.push({title: i + '级组织', id: i});
                    }
                    t.model.layers(layers);
                });
            }, this);

            var setting = {
                data: {
                    key: {
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
                    onClick: $.proxy(this._clickNode, this),
                    onExpand: $.proxy(this._onExpand, this)
                }
            };

            store.query().then(function (d) {
                if (d && d[0].is_parent) {
                    d[0].isParent = true;
                }
                tree = $.fn.zTree.init($("#ztree"), setting, d);
                var node = tree.getNodeByParam("id", d[0].id);
                t.model.filter.layer(1);//根节点，默认1层
                t.model.filter.root_id(d[0].root_id);
                t.model.filter.node_id(d[0].node_id);
                //tree.expandNode(node);
                tree.selectNode(node);
                t.search();
            });
        },
        list: function () {
            var t = this;
            var d = ko.mapping.toJS(this.model.filter);
            store.list(d).then(function (data) {
                t.model.items(data.items);
                t.pagination(data.total, t.model.filter.page());
            });
        },
        _clickNode: function (evt, treeId, treeNode) {
            var newLayer = this._getLayer(treeNode);
            this.model.filter.layer(newLayer);
            this.model.filter.node_id(treeNode.node_id);
            tree.selectNode(treeNode);
            this.search();
        },
        _onExpand: function (evt, treeId, treeNode) {
            var _self = this;
            /*检验当前节点是否已加载了子节点*/
            var flag = treeNode.children;
            if (flag) return;
            store.queryChildrenNodes(this.model.filter.root_id(), treeNode.node_id).done(function (resData) {
                if (resData && resData.length) {
                    /*遍历子节点数组，判断其is_parent属性*/
                    $.each(resData, function (index, item) {
                        if (item.is_parent) {
                            item.isParent = true;
                        }
                    });
                    tree.addNodes(treeNode, resData, false);
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
        search: function () {
            this.model.filter.page(0);
            this.model.filter.order_by('');
            this.list();
        },
        export: function () {
            store.export(ko.mapping.toJS(this.model.filter));
        },
        sort: function (key) {
            this.model.filter.page(0);
            this.model.filter.order_by(key + ' ' + sorts[key])
            this.list();
            sorts[key] = sorts[key] == 'ASC' ? 'DESC' : 'ASC';
        },
        searchTree: function () {
            var _self = this, chosenNode = null;
            var ns = tree.getNodesByParamFuzzy('node_name', this.model.node_name(), null);
            if (ns && ns[0]) {
                /*如果nodes中包含精确的nodeName，那就选中nodeName。不然就选中nodes中的第一个*/
                $.each(ns, function (index, item) {
                    if (item.node_name == _self.model.node_name()) {
                        tree.selectNode(item);
                        chosenNode = item;
                        return false;
                    }
                });
                if (!chosenNode) {
                    tree.selectNode(ns[0]);
                    chosenNode = ns[0];
                }
                this.model.filter.node_id(chosenNode.node_id);
                var newLayer = this._getLayer(chosenNode);
                this.model.filter.layer(newLayer);
                this.search();
            }
        },
        isPercent: function (num) {
            if (num === null) {
                return '--';
            } else {
                return num + '%';
            }
        },
        noPercent: function (num) {
            if (num === null) {
                return '--';
            } else {
                return num;
            }
        },
        pagination: function (total, currentPage) {
            var that = this;
            $('#pagination').pagination(total, {
                items_per_page: that.model.filter.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        that.model.filter.page(pageNum);
                        that.list();
                    }
                }
            });
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window);