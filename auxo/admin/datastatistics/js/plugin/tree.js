window.tree = (function(window, $) {
    function Tree() {
        this.treeSetting = {
            data: {
                key: {
                    children: "children",
                    name: "node_name",
                    title: "node_name"
                },
                simpleData: {
                    idKey: "id"
                }
            },
            callback: {
                onClick: $.proxy(this._onClick, this)
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
    Tree.loadTags = function(uri) {
        return $.ajax({
            url: '/v1/org_tree'
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
