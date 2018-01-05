/**
 * Label构造函数
 * @param {object} urls 增删改操作链接
 */
var Label = function ($element, urls) {
    if (!(this instanceof Label)) {
        new Label(urls);
    }
    this.model = {
        init: false,
        updateType: 1, // 1: add, 2: edit
        currentCatalog: {
            id: null,
            parent_id: null,
            title: "",
            parent_title: ''
        }
    };
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
        edit: {
            enable: true,
            showRemoveBtn: false,
            showRenameBtn: false,
            drag: {
                isCopy: false,
                isMove: true
            }
        },
        callback: {
            onClick: $.proxy(this._getNode, this),
            beforeDrop: this._beforDrop,
            onDrop: $.proxy(this._onDrap, this),
            beforeExpand: $.proxy(this._beforeExpand, this),
            beforeCollapse: $.proxy(this._beforeCollapse, this),
            onExpand: $.proxy(this._onExpand, this)
        }
    };
    if (urls && $element) {
        this._init(urls);
        this._createHtml($element);
    }
};
/**
 * Label原型链方法
 * @type {Object}
 */
Label.prototype = {
    /**
     * 组件初始化
     * @param  {object} urls 请求链接对象
     * @return {null}      null
     */
    _init: function (urls) {
        var _self = this;
        this.store = Label._getStore(urls);
        this.model = ko.mapping.fromJS(this.model);
        this.model.currentCatalog.title.subscribe(function (title) {
            var _len = _self._getStrLen(title),
                _reg = /[\!\@\#\$\%\^\&\*\(\)\！\￥\（\）\~\,\{\}\.\·\:\：\?\？\-\—\“\，\+\=\（\）]/g;
            if (_reg.test(title)) {
                _self.model.currentCatalog.title(title.replace(_reg, ''));
                return;
            }
            if (_len > 20) {
                _self.model.currentCatalog.title(_self._getStrByLen(title, 20));
                return;
            }
        });
        ko.applyBindings(this, document.getElementById('content'));
        this._loadTree();
        this._initEvent();
    },
    _createHtml: function ($element) {
        var tmpModal = temp();
        this.DOM = $(tmpModal);
        $element.append(this.DOM)
    },
    /**
     * 加载标签树
     * @return {null} null
     */
    _loadTree: function () {
        var _self = this;
        _self._hideToolBar();
        _self.store.catalogs()
            .done(function (data) {
                if (typeof(data) !== undefined && data !== null && data != "") {
                    _self.model.init(true);
                    var ztreeObject = _self._ztreeObject = $.fn.zTree.init($("#z_tree"), _self.treeSetting, data);
                    _self.rootNode = data;
                    ztreeObject.expandAll(true);
                    $("body").loading('hide');
                    $('.tree-container').css({
                        height: ($(window).height() - 220) + 'px',
                        'overflow-y': 'auto'
                    });
                    //为了显示横向滚动条，refresh
                    _self._ztreeObject.refresh();
                }
            })
            .error(function (data) {
                $('#z_tree').text(JSON.parse(data.responseText).cause ? JSON.parse(data.responseText).cause.detail : JSON.parse(data.responseText).message);
            });
    },
    /**
     * 获取字符串unicode长度
     * @param  {string} str 待处理字符串
     * @return {int}     字符串长度
     */
    _getStrLen: function (str) {
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                len += 2;
            } else {
                len++;
            }
        }
        return len;
    },
    /**
     * 获取指定长度的字符串
     * @param  {string} str 待处理字符串
     * @param  {int} len 字符串截取长度
     * @return {string}     截取后的字符串
     */
    _getStrByLen: function (str, len) {
        var strlen = 0,
            s = "";
        if (!len) {
            return str;
        }
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 128) {
                strlen += 2;
            } else {
                strlen++;
            }
            s += str.charAt(i);
            if (strlen >= len) {
                break;
            }
        }
        return s;
    },
    /**
     * 标签树拖拽进入前事件
     * @param  {int} treeId     拖拽节点id
     * @param  {object} treeNodes  拖拽节点对象
     * @param  {object} targetNode 拖拽目标节点
     * @param  {string} moveType   拖拽类型
     * @return {Boolean}            是否拖拽成功
     */
    _beforDrop: function (treeId, treeNodes, targetNode, moveType) {

        if (!targetNode.getParentNode() && (moveType === 'prev' || moveType === 'next')) {
            $.fn.dialog2.helpers.alert('不允许拖动到与根目录同级目录');
            return false;
        }
        if (treeNodes[0].children && treeNodes[0].children.length) {
            $.fn.dialog2.helpers.alert('拥有子节点的不允许拖动');
            return false;
        }
    },
    /**
     * 标签树节点拖拽时事件
     * @param  {Event} event      拖拽事件
     * @param  {int} treeId     拖拽节点id
     * @param  {object} treeNodes  拖拽节点对象
     * @param  {object} targetNode 拖拽目标节点
     * @param  {string} moveType   拖拽类型
     * @return {null}            null
     */
    _onDrap: function (event, treeId, treeNodes, targetNode, moveType) {
        var _self = this,
            index = _self.getDragIndex(treeNodes[0], 0),
            data = {
                parent_id: treeNodes[0].getParentNode().id,
                sort_number: index
            };
        _self.store.moveCatalog(data, treeNodes[0].id)
            .done(function () {
                _self._showToolBar(treeNodes[0]);
            });
    },
    /**
     * 标签树展开时事件
     * @param  {Event} e    点击事件
     * @param  {int} tid  点击节点id
     * @param  {object} node 点击节点对象
     * @return {null}      null
     */
    _beforeExpand: function (e, tid, node) {
        this._ztreeObject.cancelSelectedNode();
        this._hideToolBar();
    },
    /**
     * 标签树收缩时事件
     * @param  {Event} e    点击事件
     * @param  {int} tid  点击节点id
     * @param  {object} node 点击节点对象
     * @return {null}      null
     */
    _beforeCollapse: function (e, tid, node) {
        this._ztreeObject.cancelSelectedNode();
        this._hideToolBar();
    },
    _onExpand: function (e, t, node) {
        this._ztreeObject.refresh();
    },
    /**
     * 获取指定节点在当前层级序号
     * @param  {object} node  指定节点
     * @param  {int} index 序号初始值
     * @return {int}       节点序号
     */
    _getIndex: function (node, index) {
        if (node.getPreNode() !== null) {
            index++;
            index = this._getIndex(node.getPreNode(), index);
        }
        return index;
    },
    getDragIndex: function (node, index) {
        var prev = node.getPreNode();
        var next = node.getNextNode();
        var currentParentId;
        var originalParentId = node.parent_id;
        if (next || prev) {
            currentParentId = (next && next.parent_id) || (prev && prev.parent_id);
        }
        if (currentParentId == originalParentId) {
            if (next) {
                if (node.sort_number > next.sort_number) {
                    index = next.sort_number;
                } else {
                    if (prev) {
                        index = prev.sort_number;
                    } else {
                        index = node.sort_number;
                    }
                }
            }
            if (!next && prev) {
                index = prev.sort_number;
            }
        } else {
            if (next) {
                index = next.sort_number;
            }
            if (!next && prev) {
                index = prev.sort_number + 1;
            }
            if (!next && !prev) {
                index = 0;
            }
        }
        return index;
    },
    /**
     * 点中节点触发事件
     * @param  {Event} event    点击事件对象
     * @param  {int} treeId   节点id
     * @param  {object} treeNode 节点对象信息
     * @return {null}          null
     */
    _getNode: function (event, treeId, treeNode) {
        this._showToolBar(treeNode);
        if (treeNode.id !== this.model.currentCatalog.id()) {
            $(".span6.edit-table").fadeOut();
        } else {
            $(".span6.edit-table").fadeIn();
        }
    },
    /**
     * 隐藏工具条
     * @return {null} null
     */
    _hideToolBar: function () {
        $("#toolBar").css("display", "none");
    },
    /**
     * 根据选中节点显示工具条
     * @param  {object} selectNode 选中工具条
     * @param  {Boolean} flag       是否显示
     * @return {null}            null
     */
    _showToolBar: function (selectNode, flag) {
        var isRoot = selectNode.getParentNode();
        if (!isRoot) return false; // 根节点不显示
        var target = $("#" + selectNode.tId + "_a"),
            left = target.offset().left + target.outerWidth() + 10,
            top = target.offset().top,
            btnBar = $(".commandButtonBar");
        btnBar.css("display", "block").offset({left: left, top: top});

        if (!flag) {
            btnBar.find('a').show();
            //控制按钮显示
            var level = selectNode.level;
            var index = this._getIndex(selectNode, 0);
            var parentNode = selectNode.getParentNode() || this.rootNode;
            if (level === 0) {
                $('#btnUp,#btnDown,#btnDel,#btnEdit,#btnAdd', btnBar).hide();
                return;
            }
            if (selectNode.children && selectNode.children.length) {
                $('#btnUp,#btnDown,#btnDel', btnBar).hide();
            }
            if (index === 0) {
                $('#btnUp', btnBar).hide();
            }
            if (index === parentNode.children.length - 1) {
                $('#btnDown', btnBar).hide();
            }
            this.hasTool = true;
        }
    },
    /**
     * 工具条各个事件定义
     * @return {null} null
     */
    _initEvent: function () {
        var _self = this;
        //容器滚动监听事件
        $('.tree-container').on('scroll', function () {
            var selectNode = _self._ztreeObject.getSelectedNodes()[0];
            if (!!_self.hasTool && selectNode) {
                _self._showToolBar(selectNode, true);
            }
        });
        //名称输入事件
        $('input[name="typeName"]').on('keyup', function () {
            _self.model.currentCatalog.title(this.value);
        });
        //添加根节点标签
        $('#addLabel').on('click', function () {
            _self.model.updateType(1);
            $(".span6.edit-table").fadeIn();
            _self.model.currentCatalog.parent_id(_self.rootNode.id);
            _self.model.currentCatalog.parent_title(_self.rootNode.title);
            _self.model.currentCatalog.title("");
            _self.model.currentCatalog.id(null);
            return false;
        });
        //编辑框返回
        $('#back').on('click', function () {
            $(".span6.edit-table").fadeOut();
        });
        //编辑框保存
        $("#save").live("click", function () {
            var data;
            if ($.trim(_self.model.currentCatalog.title()) === '') {
                $.fn.dialog2.helpers.alert("请填写类别名称。");
                return;
            }
            if (_self.model.updateType() == 1) {
                data = {
                    title: _self.model.currentCatalog.title(),
                    parent_id: _self.model.currentCatalog.parent_id()
                };
                _self.store.createCatalog(data)
                    .done(function (redata) {
                        if (typeof(redata) !== undefined && redata !== null) {
                            //添加空子节点，防止删除报错
                            redata.children = [];
                            var parentNodeId = _self.model.currentCatalog.parent_id(),
                                parentNode = _self._ztreeObject.getNodesByParam('id', parentNodeId);
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
                            $(".span6.edit-table").fadeOut();
                        }
                    });
            } else {
                data = {
                    title: _self.model.currentCatalog.title()
                };
                _self.store.updateCatalog(data, _self.model.currentCatalog.id())
                    .done(function (redata) {
                        var editNode = _self._ztreeObject.getNodesByParam('id', redata.id);
                        editNode[0].title = data.title;
                        _self._ztreeObject.updateNode(editNode);
                        _self._ztreeObject.refresh();
                        _self._ztreeObject.selectNode(editNode[0]);
                        _self._showToolBar(editNode[0]);
                        $.fn.dialog2.helpers.alert("修改类别成功！");
                        $(".span6.edit-table").fadeOut();
                    });
            }
        });
        //添加子标签
        $("#btnAdd").live("click", function () {
            var nodes = _self._ztreeObject.getSelectedNodes();
            _self.model.updateType(1);
            _self.model.currentCatalog.parent_id(nodes[0].id);
            _self.model.currentCatalog.parent_title(nodes[0].title);
            _self.model.currentCatalog.title("");
            _self.model.currentCatalog.id(null);
            $(".span6.edit-table").fadeIn();
            return false;
        });
        //删除标签
        $("#btnDel").live("click", function () {
            var node = _self._ztreeObject.getSelectedNodes()[0];

            if (node.children !== null && node.children.length > 0)
                $.fn.dialog2.helpers.alert("该类别下存在子类别，无法删除！");
            else {
                $.fn.dialog2.helpers.confirm("确认删除类别？", {
                    confirm: function () {
                        _self.store.delCatalog(node.id)
                            .done(function () {
                                //_self._loadTree();
                                var removeNode = _self._ztreeObject.getNodesByParam('id', node.id);
                                _self._ztreeObject.removeNode(removeNode[0]);
                                _self._hideToolBar();
                                $.fn.dialog2.helpers.alert("删除成功！");
                            });
                    }
                });
            }
            return false;
        });
        //编辑标签
        $("#btnEdit").live("click", function () {
            var node = _self._ztreeObject.getSelectedNodes()[0];

            _self.model.updateType(2);
            $(".span6.edit-table").fadeIn();
            _self.model.currentCatalog.title(node.title);
            _self.model.currentCatalog.parent_id(node.parent_id);
            _self.model.currentCatalog.parent_title(node.getParentNode().title);
            _self.model.currentCatalog.id(node.id);
            return false;
        });
        //上移标签
        $("#btnUp").live("click", function () {
            var _node = _self._ztreeObject.getSelectedNodes()[0],
                _parentNode = _node.getParentNode() || _self.rootNode,
                _index = _self._getIndex(_node, 0);
            if (_node.children && _node.children.length) {
                $.fn.dialog2.helpers.alert("该节点包含子节点，不可移动！");
                return false;
            }
            if (_index === 0) {
                $.fn.dialog2.helpers.alert("该节点不能上移！");
            } else {
                var data = {
                    parent_id: _parentNode.id,
                    sort_number: _node.getPreNode().sort_number
                };
                _self.store.moveCatalog(data, _node.id)
                    .done(function (data) {
                        //_self._loadTree();
                        var moveNode = _self._ztreeObject.getNodesByParam('id', _node.id);
                        _self._ztreeObject.moveNode(moveNode[0].getPreNode(), moveNode[0], 'prev');
                        _self._ztreeObject.refresh();
                        _self._ztreeObject.selectNode(moveNode[0]);
                        _self._showToolBar(moveNode[0]);
                    });
            }
            return false;
        });
        //下移标签
        $("#btnDown").live("click", function () {
            var _node = _self._ztreeObject.getSelectedNodes()[0],
                _parentNode = _node.getParentNode() || _self.rootNode,
                _index = _self._getIndex(_node, 0);
            if (_node.children && _node.children.length) {
                $.fn.dialog2.helpers.alert("该节点包含子节点，不可移动！");
                return false;
            }
            if (_index >= _parentNode.children.length - 1) {
                $.fn.dialog2.helpers.alert("该节点不能下移！");
            } else {
                var data = {
                    parent_id: _parentNode.id,
                    sort_number: _node.getNextNode().sort_number
                };
                _self.store.moveCatalog(data, _node.id)
                    .done(function (data) {
                        //_self._loadTree();
                        var moveNode = _self._ztreeObject.getNodesByParam('id', _node.id);
                        _self._ztreeObject.moveNode(moveNode[0].getNextNode(), moveNode[0], 'next');
                        _self._ztreeObject.refresh();
                        _self._ztreeObject.selectNode(moveNode[0]);
                        _self._showToolBar(moveNode[0]);
                    });
            }
            return false;
        });
    },
    //判断是否为根节点
    _isRootCatalog: function (node) {
        var parent = node.getParentNode();
        if (typeof(parent) === undefined || parent === null) {
            return true;
        }
        return false;
    }
};
//内部函数
/**
 * ajax轻量包装
 * @param  {string} url  请求路径
 * @param  {object} data 请求数据
 * @param  {string} type 请求类型
 * @return {null}      null
 */
Label._ajaxHandler = function (url, data, type) {
    return $.ajax({
        url: url,
        cache: false,
        dataType:'json',
        data: data || null,
        type: type || 'get',
        contentType: 'application/json;charset=utf8',
        error: function (jqXHR) {
            jqXHR.global = true;
            var txt = JSON.parse(jqXHR.responseText);
            if (txt.cause) {
                $.fn.dialog2.helpers.alert(txt.cause.message);
            } else {
                $.fn.dialog2.helpers.alert(txt.message);
            }
            $('body').loading('hide');
        }
    });
};
/**
 * 组件数据接口
 * @param  {object} urls 接口url地址对象
 * @return {object}      数据接口对象
 */
Label._getStore = function (urls) {
    return ({
        //获取分类
        catalogs: function () {
            var url = urls.query;
            return Label._ajaxHandler(url, {custom_type: urls.custom_type}, 'GET');
        },
        //创建分类
        createCatalog: function (data) {
            var url = urls.create;
            data.title = data.title || urls.root_name;
            data.custom_type = urls.custom_type;
            return Label._ajaxHandler(url, JSON.stringify(data), 'POST');
        },
        //更新分类
        updateCatalog: function (data, catalog_id) {
            var url = urls.update(catalog_id);
            return Label._ajaxHandler(url, JSON.stringify(data), 'PUT');
        },
        //移动分类
        moveCatalog: function (data, catalog_id) {
            var url = urls.move(catalog_id);
            return Label._ajaxHandler(url, JSON.stringify(data), 'PUT');
        },
        //删除分类
        delCatalog: function (catalog_id) {
            var url = urls.del(catalog_id);
            return Label._ajaxHandler(url, null, 'DELETE');
        }
    });
};
//暴露Label组件
$.fn.Label = Label;