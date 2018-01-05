/*!
 * ztree标签
 * @param  {Object} window window对象
 * @param  {Plugin} $      jQuery对象
 * @return {null}        null
 */
(function($, window) {
    'use strict';
    var ToolBar = function(options) {
        if (typeof options !== 'object' || !options.urls) {
            return;
        }
        if (!(this instanceof ToolBar)) {
            new ToolBar(options);
        }
        this.promise = $.Deferred();
        this.target = $(options.target || '#ztree');
        this.options=options;
        //tree配置信息
        this.treeSetting = {
            data: {
                key: {
                    children: "children",
                    name: "title",
                    title: "title"
                },
                simpleData: {
                    idKey: "id"
                }
            },
            check: {
                enable: options.enable || false,
                radioType: options.level || 'all',
                chkboxType: {
                    "Y": "ps",
                    "N": "ps"
                },
                chkStyle: options.type || 'radio'
            },
            callback: {
                onClick: $.proxy(this._getNode, this)
            }
        };
        this._init(options.urls);
    };

    ToolBar.prototype = {
        //初始化
        _init: function(urls) {
            this.store = ToolBar._getStore(urls);
            this._loadTree();
        },
        //加载标签树
        _loadTree: function() {
            var _self = this;
            _self.store.catalogs()
                .done(function(data) {
                    if (data) {
                        _self.treeObj = $.fn.zTree.init(_self.target, _self.treeSetting, data);
                        _self.rootNode = data;
                        _self.treeObj.expandAll(true);
                        _self.promise.resolve(_self.treeObj);
                    } else {
                        _self.target.html('没有标签！');
                    }
                });
        },
        //选中节点
        _getNode: function(event, treeId, treeNode) {
            if (treeNode.checked) {
                this.treeObj.checkNode(treeNode, false, true);
            } else {
                this.treeObj.checkNode(treeNode, true, true);
            }
            if(typeof this.options.onClick ==='function'){
                this.options.onClick(treeNode);
            }
        },
        //判断是否为根节点
        _isRootCatalog: function(node) {
            var parent = node.getParentNode();
            if (typeof(parent) == undefined || parent == null) {
                return true;
            }
            return false;
        },
        //获取选中节点数据
        getCheckData: function() {
            var _nodes = this.treeObj.getCheckedNodes(true),
                _items = [];
            $.each(_nodes, function(i, node, nodes) {
                if(!node.parent_id){
                    node.id =null;
                }
                _items.push({
                    id: node.id,
                    type: node.custom_type,
                    title:node.title
                });
            });
            return _items;
        },
        //获取选中节点数据(非check or radio,只获取一个)
        getSelectData: function() {
            var _nodes = this.treeObj.getSelectedNodes();
            return _nodes[0];
        }
    };
    //内部函数
    ToolBar._getStore = function(urls) {
        return ({
            //获取分类
            catalogs: function() {
                var url = urls.query;
                return $.ajax({
                    url: url
                });
            },
            //更新操作
            update: function(data) {
                var url = urls.update;
                return $.ajax({
                    url: url,
                    data: JSON.stringify(data),
                    type: 'PUT'
                });
            }
        })
    }

    window.ToolBar = ToolBar;

})(jQuery, window);
