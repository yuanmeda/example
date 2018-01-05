!function (window, $) {
    function temp() {
        return'<div id="_label"><div class="tool-bar"><a href="javascript:;" class="btn btn-default" id="addLabel">新建标签</a></div><div class="tree-container span6"><div class="ztree" id="z_tree"></div></div><div id="toolBar" class="commandButtonBar"><a href="#" id="btnAdd" class="add" data-dismiss="modal" title="增加"></a><a href="#" id="btnEdit" class="edit" data-dismiss="modal" title="编辑"></a><a href="#" id="btnDel" class="delete" data-dismiss="modal" title="删除"></a><a href="#" id="btnUp" class="move-up" data-dismiss="modal" title="上移"></a><a href="#" id="btnDown" class="move-down" data-dismiss="modal" title="下移"></a></div><div class="edit-table span6 hide"><table class="table table-bordered table-hover" data-bind="with:model.currentCatalog"><tr data-bind="if:parent_id"><td>父节点名称：</td><td><input type="text" name="parentTypeFlag" data-bind="value:parent_title,attr:{\'data-id\':parent_id}"readonly/></td></tr><tr data-bind="if:id"><td>类别标识：</td><td><input type="text" name="typeFlag" data-bind="value:id" readonly/></td></tr><tr><td>类别名称：</td><td><input type="text" name="typeName" data-bind="value:title" placeholder="中文最多10个，其他字符20个"/><small>不允许输入!@#$等字符.</small></td></tr><tr><td colspan="2"><a href="javascript:;" class="btn btn-primary" id="save"style="padding: 5px 9px;display: inline-block;">确定</a>&nbsp<a href="javascript:;" class="btn btn-default" id="back"style="padding: 5px 9px;display: inline-block;">取消</a></td></tr></table></div></div>'
    }

    var Label = function ($element, urls) {
        if (!(this instanceof Label)) {
            return new Label(urls)
        }
        this.model = {updateType: 1, currentCatalog: {id: null, parent_id: null, title: "", parent_title: ""}};
        this.treeSetting = {data: {key: {children: "children", name: "title", title: "title"}, simpleData: {idKey: "id"}}, edit: {enable: true, showRemoveBtn: false, showRenameBtn: false, drag: {isCopy: false, isMove: true}}, callback: {onClick: $.proxy(this._getNode, this), beforeDrop: this._beforDrop, onDrop: $.proxy(this._onDrap, this), beforeExpand: $.proxy(this._beforeExpand, this), beforeCollapse: $.proxy(this._beforeCollapse, this), onExpand: $.proxy(this._onExpand, this)}};
        if (urls && $element) {
            this._createHtml($element);
            this._init(urls)
        }
    };
    Label.prototype = {_init: function (urls) {
        var _self = this;
        this.store = Label._getStore(urls);
        this.model = ko.mapping.fromJS(this.model);
        this.model.currentCatalog.title.subscribe(function (title) {
            var _len = _self._getStrLen(title), _reg = /[\!\@\#\$\%\^\&\*\(\)\！\￥\（\）\~\,\{\}\.\·\:\：\?\？\-\—\“\，\+\=\（\）]/g;
            if (_reg.test(title)) {
                _self.model.currentCatalog.title(title.replace(_reg, ""));
                return
            }
            if (_len > 20) {
                _self.model.currentCatalog.title(_self._getStrByLen(title, 20));
                return
            }
        });
        ko.applyBindings(this, document.getElementById("label_tree"));
        this._loadTree();
        this._initEvent()
    }, _createHtml: function ($element) {
        var tmpModal = temp();
        this.DOM = $(tmpModal);
        $element.append(this.DOM)
    }, _loadTree: function () {
        var _self = this;
        _self._hideToolBar();
        _self.store.catalogs().done(function (data) {
            if (typeof data !== undefined && data !== null) {
                var ztreeObject = _self._ztreeObject = $.fn.zTree.init($("#z_tree"), _self.treeSetting, data);
                _self.rootNode = data;
                ztreeObject.expandAll(true);
                $("body").loading("hide");
                $(".tree-container").css({height: $(window).height() - 220 + "px", "overflow-y": "auto"});
                _self._ztreeObject.refresh()
            }
        }).error(function (data) {
            $("#z_tree").text(JSON.parse(data.responseText).cause ? JSON.parse(data.responseText).cause.detail : JSON.parse(data.responseText).message)
        })
    }, _getStrLen: function (str) {
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                len += 2
            } else {
                len++
            }
        }
        return len
    }, _getStrByLen: function (str, len) {
        var strlen = 0, s = "";
        if (!len) {
            return str
        }
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 128) {
                strlen += 2
            } else {
                strlen++
            }
            s += str.charAt(i);
            if (strlen >= len) {
                break
            }
        }
        return s
    }, _beforDrop: function (treeId, treeNodes, targetNode, moveType) {
        if (!targetNode.getParentNode() && (moveType === "prev" || moveType === "next")) {
            $.fn.dialog2.helpers.alert("不允许拖动到与根目录同级目录");
            return false
        }
        if (treeNodes[0].children && treeNodes[0].children.length) {
            $.fn.dialog2.helpers.alert("拥有子节点的不允许拖动");
            return false
        }
    }, _onDrap: function (event, treeId, treeNodes, targetNode, moveType) {
        var _self = this, index = _self._getIndex(treeNodes[0], 0), data = {parent_id: treeNodes[0].getParentNode().id, sort_number: index};
        _self.store.moveCatalog(data, treeNodes[0].id).done(function () {
            _self._showToolBar(treeNodes[0])
        })
    }, _beforeExpand: function (e, tid, node) {
        this._ztreeObject.cancelSelectedNode();
        this._hideToolBar()
    }, _beforeCollapse: function (e, tid, node) {
        this._ztreeObject.cancelSelectedNode();
        this._hideToolBar()
    }, _onExpand: function (e, t, node) {
        this._ztreeObject.refresh()
    }, _getIndex: function (node, index) {
        if (node.getPreNode() !== null) {
            index++;
            index = this._getIndex(node.getPreNode(), index)
        }
        return index
    }, _getNode: function (event, treeId, treeNode) {
        this._showToolBar(treeNode);
        if (treeNode.id !== this.model.currentCatalog.id()) {
            $(".span6.edit-table").fadeOut()
        } else {
            $(".span6.edit-table").fadeIn()
        }
    }, _hideToolBar: function () {
        $("#toolBar").css("display", "none")
    }, _showToolBar: function (selectNode, flag) {
        var isRoot = selectNode.getParentNode();
        if (!isRoot)return false;
        var target = $("#" + selectNode.tId + "_a"), left = target.offset().left + target.outerWidth() + 10, top = target.offset().top, btnBar = $(".commandButtonBar");
        btnBar.css("display", "block").offset({left: left, top: top});
        if (!flag) {
            btnBar.find("a").show();
            var level = selectNode.level;
            var index = this._getIndex(selectNode, 0);
            var parentNode = selectNode.getParentNode() || this.rootNode;
            if (level === 0) {
                $("#btnUp,#btnDown,#btnDel,#btnEdit,#btnAdd", btnBar).hide();
                return
            }
            if (selectNode.children && selectNode.children.length) {
                $("#btnUp,#btnDown,#btnDel", btnBar).hide()
            }
            if (index === 0) {
                $("#btnUp", btnBar).hide()
            }
            if (index === parentNode.children.length - 1) {
                $("#btnDown", btnBar).hide()
            }
            this.hasTool = true
        }
    }, _initEvent: function () {
        var _self = this;
        $(".tree-container").on("scroll", function () {
            var selectNode = _self._ztreeObject.getSelectedNodes()[0];
            if (!!_self.hasTool && selectNode) {
                _self._showToolBar(selectNode, true)
            }
        });
        $('input[name="typeName"]').on("keyup", function () {
            _self.model.currentCatalog.title(this.value)
        });
        $("#addLabel").on("click", function () {
            _self.model.updateType(1);
            $(".span6.edit-table").fadeIn();
            _self.model.currentCatalog.parent_id(_self.rootNode.id);
            _self.model.currentCatalog.parent_title(_self.rootNode.title);
            _self.model.currentCatalog.title("");
            _self.model.currentCatalog.id(null);
            return false
        });
        $("#back").on("click", function () {
            $(".span6.edit-table").fadeOut()
        });
        $("#save").live("click", function () {
            var data;
            if ($.trim(_self.model.currentCatalog.title()) === "") {
                $.fn.dialog2.helpers.alert("请填写类别名称。");
                return
            }
            if (_self.model.updateType() == 1) {
                data = {title: _self.model.currentCatalog.title(), parent_id: _self.model.currentCatalog.parent_id()};
                _self.store.createCatalog(data).done(function (redata) {
                    if (typeof redata !== undefined && redata !== null) {
                        redata.children = [];
                        var parentNodeId = _self.model.currentCatalog.parent_id(), parentNode = _self._ztreeObject.getNodesByParam("id", parentNodeId);
                        var newNode = _self._ztreeObject.addNodes(parentNode[0], redata);
                        _self._ztreeObject.updateNode(parentNode);
                        _self._ztreeObject.refresh();
                        if (parentNode[0]) {
                            //添加一级标签时，取消选中父节点（根节点不可编辑删除）
                            if (parentNode[0].getParentNode()) {
                                _self._ztreeObject.selectNode(parentNode[0]);
                            } else {
                                _self._hideToolBar();
                            }
                        } else {
                            //添加根节点时，赋值rootNode，防止重复添加根节点
                            _self.rootNode = redata;
                            _self._hideToolBar();
                        }
                        $.fn.dialog2.helpers.alert("添加类别成功！");
                        $(".span6.edit-table").fadeOut()
                    }
                })
            } else {
                data = {title: _self.model.currentCatalog.title()};
                _self.store.updateCatalog(data, _self.model.currentCatalog.id()).done(function (redata) {
                    var editNode = _self._ztreeObject.getNodesByParam("id", redata.id);
                    editNode[0].title = data.title;
                    _self._ztreeObject.updateNode(editNode);
                    _self._ztreeObject.refresh();
                    _self._ztreeObject.selectNode(editNode[0]);
                    _self._showToolBar(editNode[0]);
                    $.fn.dialog2.helpers.alert("修改类别成功！");
                    $(".span6.edit-table").fadeOut()
                })
            }
        });
        $("#btnAdd").live("click", function () {
            var nodes = _self._ztreeObject.getSelectedNodes();
            _self.model.updateType(1);
            _self.model.currentCatalog.parent_id(nodes[0].id);
            _self.model.currentCatalog.parent_title(nodes[0].title);
            _self.model.currentCatalog.title("");
            _self.model.currentCatalog.id(null);
            $(".span6.edit-table").fadeIn();
            return false
        });
        $("#btnDel").live("click", function () {
            var node = _self._ztreeObject.getSelectedNodes()[0];
            if (node.children !== null && node.children.length > 0)$.fn.dialog2.helpers.alert("该类别下存在子类别，无法删除！"); else {
                $.fn.dialog2.helpers.confirm("确认删除类别？", {confirm: function () {
                    _self.store.delCatalog(node.id).done(function () {
                        var removeNode = _self._ztreeObject.getNodesByParam("id", node.id);
                        _self._ztreeObject.removeNode(removeNode[0]);
                        _self._hideToolBar();
                        $.fn.dialog2.helpers.alert("删除成功！")
                    })
                }})
            }
            return false
        });
        $("#btnEdit").live("click", function () {
            var node = _self._ztreeObject.getSelectedNodes()[0];
            _self.model.updateType(2);
            $(".span6.edit-table").fadeIn();
            _self.model.currentCatalog.title(node.title);
            _self.model.currentCatalog.parent_id(node.parent_id);
            _self.model.currentCatalog.parent_title(node.getParentNode().title);
            _self.model.currentCatalog.id(node.id);
            return false
        });
        $("#btnUp").live("click", function () {
            var _node = _self._ztreeObject.getSelectedNodes()[0], _parentNode = _node.getParentNode() || _self.rootNode, _index = _self._getIndex(_node, 0);
            if (_node.children && _node.children.length) {
                $.fn.dialog2.helpers.alert("该节点包含子节点，不可移动！");
                return false
            }
            if (_index === 0) {
                $.fn.dialog2.helpers.alert("该节点不能上移！")
            } else {
                var data = {parent_id: _parentNode.id, sort_number: _index - 1};
                _self.store.moveCatalog(data, _node.id).done(function (data) {
                    var moveNode = _self._ztreeObject.getNodesByParam("id", _node.id);
                    _self._ztreeObject.moveNode(moveNode[0].getPreNode(), moveNode[0], "prev");
                    _self._ztreeObject.refresh();
                    _self._ztreeObject.selectNode(moveNode[0]);
                    _self._showToolBar(moveNode[0])
                })
            }
            return false
        });
        $("#btnDown").live("click", function () {
            var _node = _self._ztreeObject.getSelectedNodes()[0], _parentNode = _node.getParentNode() || _self.rootNode, _index = _self._getIndex(_node, 0);
            if (_node.children && _node.children.length) {
                $.fn.dialog2.helpers.alert("该节点包含子节点，不可移动！");
                return false
            }
            if (_index >= _parentNode.children.length - 1) {
                $.fn.dialog2.helpers.alert("该节点不能下移！")
            } else {
                var data = {parent_id: _parentNode.id, sort_number: _index + 1};
                _self.store.moveCatalog(data, _node.id).done(function (data) {
                    var moveNode = _self._ztreeObject.getNodesByParam("id", _node.id);
                    _self._ztreeObject.moveNode(moveNode[0].getNextNode(), moveNode[0], "next");
                    _self._ztreeObject.refresh();
                    _self._ztreeObject.selectNode(moveNode[0]);
                    _self._showToolBar(moveNode[0])
                })
            }
            return false
        })
    }, _isRootCatalog: function (node) {
        var parent = node.getParentNode();
        if (typeof parent === undefined || parent === null) {
            return true
        }
        return false
    }};
    Label._ajaxHandler = function (url, data, type) {
        return $.ajax({url: url, cache: false, data: data || null, type: type || "get", contentType: "application/json;charset=utf8"})
    };
    Label._getStore = function (urls) {
        return{catalogs: function () {
            var url = urls.query;
            return Label._ajaxHandler(url, {custom_type: urls.custom_type}, "GET")
        }, createCatalog: function (data) {
            var url = urls.create;
            data.custom_type = urls.custom_type;
            return Label._ajaxHandler(url, JSON.stringify(data), "POST")
        }, updateCatalog: function (data, catalog_id) {
            var url = urls.update(catalog_id);
            return Label._ajaxHandler(url, JSON.stringify(data), "PUT")
        }, moveCatalog: function (data, catalog_id) {
            var url = urls.move(catalog_id);
            return Label._ajaxHandler(url, JSON.stringify(data), "PUT")
        }, delCatalog: function (catalog_id) {
            var url = urls.del(catalog_id);
            return Label._ajaxHandler(url, null, "DELETE")
        }}
    };
    window.Label = Label
}(window, window.jQuery);