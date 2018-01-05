/*
 js公用函数
 */

(function ($, window) {
    var ToolBar = function (options) {
        if (!(this instanceof ToolBar)) {
            return new ToolBar(options);
        }
        this._setOption(options);
        this._init();
    };
    ToolBar.prototype = {
        constructor: ToolBar,
        _setOption: function (options) {
            var defaultOp = {
                selectObj: [],
                treeData: [],
                treeSetting: {
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
                        enable: true,
                        chkboxType: {"Y": "", "N": ""}
                    },
                    callback: {
                        onClick: $.proxy(this._getNode, this)
                    }
                },
                saveCallback: $.noop
            };
            this.options = $.extend(true, {}, defaultOp, options);
        },
        _modalHtml: function () {
            if (!$('#catalogs_modal').length) {
                var str = '<div id="catalogs_modal" class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" aria-labelledby="myModalLabel" aria-hidden="true">\
                                <div class="modal-dialog">\
                                    <div class="modal-content">\
                                        <div class="modal-header">\
                                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h4 id="myModalLabel">选择分类</h4></div>\
                                        <div class="modal-body">\
                                            <ul id="z_tree" class="ztree"></ul>\
                                        </div>\
                                        <div class="modal-footer">\
                                            <button id="catalogSave" class="btn btn-primary">保存</button>\
                                            <button class="btn" data-dismiss="modal" aria-hidden="true">关闭</button>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>';
                $('body').append(str);
            }
        },
        hide: function () {
            $('#catalogs_modal').modal('hide');
        },
        //初始化
        _init: function () {
            this._modalHtml();
            this._loadTree();
            this._initEvent();
        },
        //加载标签树
        _loadTree: function () {
            var _self = this, data = _self.options.treeData;
            if (typeof (data) != undefined && data != null && data.children.length) {
                _self.treeObj = $.fn.zTree.init($("#z_tree"), _self.options.treeSetting, data.children);
                _self.rootNode = data;
                _self.treeObj.expandAll(true);
                _self._checkNode();
                $("#catalogSave").show();
            } else {
                $('#z_tree').html('没有标签！');
                $("#catalogSave").hide();
            }
            $('#catalogs_modal').modal('show');
        },
        //选中共有标签
        _checkNode: function () {
            var treeObj = this.treeObj, selectObj = this.options.selectObj;
            treeObj.transformToArray(treeObj.getNodes()).forEach(function (item, i) {
                if (selectObj.indexOf(item.id) > -1) {
                    treeObj.checkNode(item, true, true);
                }
            })
        },
        //选中节点
        _getNode: function (event, treeId, treeNode) {
            if (treeNode.checked) {
                this.treeObj.checkNode(treeNode, false, true);
            } else {
                this.treeObj.checkNode(treeNode, true, true);
            }
        },
        //初始化事件
        _initEvent: function () {
            var _self = this;
            //保存标签
            $('#catalogSave').off('click').on('click', function () {
                var nodes = _self.treeObj.getCheckedNodes(true), _postData = [];
                nodes.forEach(function (item) {
                    _postData.push(item.id);
                });
                _self.options.saveCallback.call(_self, _postData);
            });
        }
    };
    window.ToolBar = ToolBar;
})(jQuery, window)