/*
 js公用函数
 */

(function ($, window) {
    var ToolBar = function (urls, selectObj,selectIds,viewModel) {
        if (!(this instanceof ToolBar)) {
            new ToolBar(urls, selectObj, viewModel);
        }
        this.selectIds=selectIds;
        //维护选中item
        this.selectObj = selectObj;
        this.ids = [];
        this.catalogs = [];
        this.model = viewModel;

        //设置初始化选中节点this.catalogs
        var temp = [];
        var obj = {};
        this.selectObj.forEach(function (a, i, self) {
            var _c = typeof(a.catalog) == 'string' ? JSON.parse(a.catalog) : a.catalog;
            this.ids.push(a.id);
            [].push.apply(temp, _c);
        }, this);
        temp.forEach(function (a, i, self) {
            if (obj[a.id]) {
                obj[a.id]++;
            }
            else {
                obj[a.id] = 1;
            }
            if (obj[a.id] == this.selectObj.length) {
                this.catalogs.push(a);
            }
        }, this);

        //z_tree配置信息
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
                enable: true,
                chkboxType: {
                    "Y": "",
                    "N": ""
                }
            },
            callback: {
                onClick: $.proxy(this._getNode, this)
            }
        };
        if (!$('#catalogs_modal').length) {
            var str = '<div id="catalogs_modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="myModalLabel">选择分类</h3></div>' +
                '<div class="modal-body"><ul id="z_tree" class="ztree"></ul></div><div class="modal-footer"><button id="catalogSave" class="btn btn-primary">保存</button><button class="btn" data-dismiss="modal" aria-hidden="true">关闭</button></div></div>'
            $('body').append(str);
        }
        urls && this._init(urls);
    };

    ToolBar.prototype = {
        //初始化
        _init: function (urls) {
            this.store = ToolBar._getStore(urls);
            this._loadTree();
            this._initEvent();
        },
        //加载标签树
        _loadTree: function () {
            var _self = this;
            _self.store.catalogs()
                .done(function (data) {
                    if (typeof(data) != undefined && data != null && data.children.length) {
                        _self.treeObj = $.fn.zTree.init($("#z_tree"), _self.treeSetting, data.children);
                        _self.rootNode = data;
                        _self.treeObj.expandAll(true);
                        _self._checkNode();
                        $("#catalogSave").show();
                    }
                    else {
                        $('#z_tree').html('没有标签！');
                        $("#catalogSave").hide();
                    }
                    $('#catalogs_modal').modal('show');
                });
        },
        //选中共有标签
        _checkNode: function () {
            var _self = this;
           /* this.catalogs.forEach(function (a, i, self) {
                var node = _self.treeObj.getNodesByParam("id", a.id, null)[0];
                _self.treeObj.checkNode(node, true, true, false);
            }, this)*/
            $.each(this.selectObj,function(index,data){
                var node=_self.treeObj.getNodeByParam("id",data,null);
                _self.treeObj.checkNode(node, true, true, false);
            })
        },
        //获取当前节点的同级序号
        _getIndex: function (node, index) {
            if (node.getPreNode() != null) {
                index++;
                index = this._getIndex(node.getPreNode(), index);
            }
            return index;
        },
        //选中节点
        _getNode: function (event, treeId, treeNode) {
            //this._showToolBar(treeNode);
            if (treeNode.checked) {
                this.treeObj.checkNode(treeNode, false, true);
            }
            else {
                this.treeObj.checkNode(treeNode, true, true);
            }
        },
        //初始化事件
        _initEvent: function () {
            var _self = this;
            //保存标签
            $('#catalogSave').unbind('click').on('click', function () {
                $(this).attr('disabled', true);
                var nodes = _self.treeObj.getCheckedNodes(true),
                    _tagids = [],
                    _catalogs = [],
                    _postData = [],
                    _checkedItem = $('[data-check].on');
                nodes.forEach(function (a, i, self) {
                    //选中子级，把父级id也传入
                    //function getParentIds(current,target){
                    //    target.push(current.id);
                    //    if(current.getParentNode() != null){
                    //        getParentIds(current.getParentNode(),target);
                    //    }
                    //}
                    _catalogs.push({
                        id: a.id
                    });
                    _tagids.push(a.id);
//                    getParentIds(a,_tagids);
                });
                _self.ids.forEach(function (a, i, self) {
                    _postData.push({
                        exam_id: a,
                        tag_ids: _tagids
                    });
                    _checkedItem.data('catalog', JSON.stringify(_catalogs));
                });
                var _postData={};
                _postData.course_ids=_self.selectIds;
                _postData.tag_ids=_tagids;
                _self.store.update(_postData).done(function (data, status) {
                    $.fn.dialog2.helpers.alert("标签设置成功");
                    $('#catalogs_modal').modal('hide');
                    if (_self.model && typeof(_self.model.clearSelect) == 'function') {
                        _self.model.clearSelect();
                    }
                    if (_self.model && typeof(_self.model.list) == 'function') {
                        _self.model.list();
                    }
                }).always(function () {
                    $('#catalogSave').attr('disabled', false);
                });
                return false;
            });
        },
        //判断是否为根节点
        _isRootCatalog: function (node) {
            var parent = node.getParentNode();
            if (typeof(parent) == undefined || parent == null) {
                return true;
            }
            return false;
        }
    };
    //内部函数
    ToolBar._ajaxHandler = function (url, data, type) {
        return $.ajax({
            url: url,
            cache: false,
            data: data || null,
            type: type || 'get',
            contentType: 'application/json;charset=utf8',
            error: function (jqXHR) {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail);
                }
                else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
            }
        });
    },
        ToolBar._getStore = function (urls) {
            return ({
                //获取分类
                catalogs: function () {
                    var url = urls.query;
                    return ToolBar._ajaxHandler(url,{custom_type:custom_type},'GET');
                },
                //更新操作
                update: function (data) {
                    var url = urls.update;
                    return ToolBar._ajaxHandler(url, JSON.stringify(data), 'PUT');
                }
            })
        }

    window.ToolBar = ToolBar;

})(jQuery, window)
