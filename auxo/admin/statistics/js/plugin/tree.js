window.tree = (function(window, $) {
    function Tree() {
        this.treeSetting = {
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
                onClick: $.proxy(this._onClick, this),
                onExpand: $.proxy(this._onExpand, this)
            }
        };
        this.treeInstance = null;
    }
    Tree.prototype = {
        _show: function(target, hideRoot, clickBack) {
            var t = this;
            var deferred = $.Deferred();
            this.clickBack = clickBack || function() {};
            this.$target = $(target);
            if (!this.treeInstance) {
                Tree.loadTags()
                    .then(function(d) {
                        if (!d) {
                            t.$target.html('暂无节点');
                            return;
                        }
                        !$.isArray(d)&&(d=[d]);
                        var _tree = d;
                        if (hideRoot) {
                            _tree = d.children
                        }
                        if (_tree.length) {
                            if (d && d[0].is_parent) {
                                d[0].isParent = true;
                            }
                            t.treeInstance = $.fn.zTree.init(t.$target, t.treeSetting, _tree);
                            t.rootNode = d;
                        }
                        deferred.resolve(t.treeInstance);
                    });
            } else {
                deferred.resolve(this.treeInstance);
            }
            return deferred.promise();
        },
        _onClick: function(evt, treeId, treeNode) {
            this.treeInstance.selectNode(treeNode);
            this.clickBack(treeNode);
        },
        _onExpand: function (evt, treeId, treeNode) {
            var _self = this;
            /*检验当前节点是否已加载了子节点*/
            var flag = treeNode.children;
            if (flag) return;
            Tree.queryChildrenNodes(treeNode.root_id, treeNode.node_id).done(function (resData) {
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
        _node: function() {
            if (!this.treeInstance) {
                return [{
                    title: '全部'
                }];
            }
            var nodes = this.treeInstance.getSelectedNodes(true);
            return nodes;
        }
    }
    Tree.loadTags = function() {
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
    };
    Tree.queryChildrenNodes = function (mix_organization_id, mix_node_id) {
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
    var tree = new Tree();
    return {
        show: $.proxy(tree._show, tree),
        clazz: Tree,
        instance: tree,
        node: $.proxy(tree._node, tree)
    };
})(window, jQuery);
