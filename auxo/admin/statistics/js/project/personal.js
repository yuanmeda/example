/**
 * Created by Administrator on 2016.12.20.
 */
(function($, window) {
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
        //获取列表
        list: function (data) {
            return $.ajax({
                url: '/v1/project/users',
                type: 'GET',
                data: data
            })
        },
        //获取培训列表
        train: function () {
            return $.ajax({
                url: '/v1/trains',
                type: 'GET'
            })
        },
        //导出
        export: function (data) {
            $.ajax({
                url: '/v1/project/users/export',
                type: 'GET',
                data: data
            }).done(function (d) {
                location.href = d.file_name;
            });
        }
    };
    var sorts = {
        'had_total_period': 'ASC'
    };
    var tree;
    var viewModel = {
        $treeObj: null,
        model: {
            search: {
                size: 20,
                page: 0,
                channel: 'open-course',
                train_id: null,
                order_by: '',
                status: '',
                node_id: '',
                root_id: ''
            },
            node_name: '',
            dataList: [],
            trainList:[]
        },
        //初始化事件
        init: function() {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('boot'));
            store.query().then($.proxy(function (data) {
                if (data && data[0].is_parent) {
                    data[0].isParent = true;
                }
                this.initTree(data);

                this.model.search.root_id(data[0].root_id);
                this.model.search.node_id(data[0].node_id);
                this._list();
            }, this));
        },
        _list: function() {
            var t = this,
                _filter = ko.mapping.toJS(this.model.search);

            this.model.search.channel.subscribe(function (v) {
                if (v == 'train') {
                    store.train().done(function(data) {
                        t.model.trainList(data);
                    });
                } else {
                    this.model.search.train_id = null;
                }
            }, this);

            store.list(_filter).done(function(data) {
                if (data) {
                    t.model.dataList(data.items);
                }
                t._page(data.total, t.model.search.page());
            });

        },
        treeNode: function (evt, treeId, treeNode) {
            //this.model.search.root_id(treeNode.root_id);
            this.model.search.node_id(treeNode.node_id);
            this.$treeObj.selectNode(treeNode);
            this._list();
        },
        _onExpand: function (evt, treeId, treeNode) {
            var _self = this;
            /*检验当前节点是否已加载了子节点*/
            var flag = treeNode.children;
            if (flag) return;
            store.queryChildrenNodes(this.model.search.root_id(), treeNode.node_id).done(function (resData) {
                if (resData && resData.length) {
                    /*遍历子节点数组，判断其is_parent属性*/
                    $.each(resData, function (index, item) {
                        if (item.is_parent) {
                            item.isParent = true;
                        }
                    });
                    _self.$treeObj.addNodes(treeNode, resData, false);
                }
            });
        },
        export: function () {
            store.export(ko.mapping.toJS(this.model.search));
        },
        sort: function (key) {
            this.model.search.page(0);
            this.model.search.order_by(key + ' ' + sorts[key])
            this._list();
            sorts[key] = sorts[key] == 'ASC' ? 'DESC' : 'ASC';
        },
        initTree: function (treeData) {
            var t = this;
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
                    onClick: $.proxy(this.treeNode, this),
                    onExpand: $.proxy(this._onExpand, this)
                }
            };
            t.$treeObj = $.fn.zTree.init($("#ztree"), setting, treeData);
            t.selectTree();
        },
        selectTree: function () {
            //获取节点
            var nodes = this.$treeObj.getNodes();
            if (nodes.length>0)
            {
                this.$treeObj.selectNode(nodes[0]);
                //this.$treeObj.expandNode(nodes[0], true);
            }
        },
        search: function() {
            this.model.search.page(0);
            this._list();
        },
        searchTree: function () {
            var _self = this, chosenNode = null;
            var ns = this.$treeObj.getNodesByParamFuzzy('node_name', this.model.node_name(), null);
            if (ns && ns[0]) {
                /*如果ns中包含精确的nodeName，那就选中nodeName。不然就选中nodes中的第一个*/
                $.each(ns, function (index, item) {
                    if (item.node_name == _self.model.node_name()) {
                        _self.$treeObj.selectNode(item);
                        chosenNode = item;
                        return false;
                    }
                });
                if (!chosenNode) {
                    this.$treeObj.selectNode(ns[0]);
                    chosenNode = ns[0];
                }
                this.model.search.node_id(chosenNode.node_id);
                this._list();
            }
        },
        isPass: function(status) {
            if (status === 1) {
                return '合格';
            } if (status === 0){
                return '不合格';
            } else {
                return '--'
            }
        },
        noPercent: function (num) {
            if (num === null) {
                return '--';
            } else {
                return num;
            }
        },
        isPercent: function (num) {
            if (num === null) {
                return '--';
            } else {
                return num + '%';
            }
        },
        _page: function(totalCount, currentPage) {
            var t = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: t.model.search.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function(page_id) {
                    if (page_id != currentPage) {
                        t.model.search.page(page_id);
                        t._list();
                    }
                }
            });
        }
    };
    $(function() {
        viewModel.init();
    });
})(jQuery, window);