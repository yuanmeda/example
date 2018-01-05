/*
 院系组织
 */
;
(function (window, $) {
    ko.options.deferUpdates = true;
    var store = {
        // 获取学院专业组织树
        queryNodeTree: function () {
            var url = '/' + projectCode + '/specialty/nodetree?is_show_all=1';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        // 移动节点
        moveNode: function (d) {
            var url = '/' + projectCode + '/specialty/nodetree/move';
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(d),
                contentType: 'application/json',
                type: 'PUT'
            });
        },
        // 修改节点
        updateNode: function (d) {
            var url = '/' + projectCode + '/specialty/nodetree';
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(d),
                contentType: 'application/json',
                type: 'PUT'
            });
        },
        // 删除节点
        removeNode: function (nodeId) {
            var url = '/' + projectCode + '/specialty/nodetree?node_id=' + nodeId;
            return $.ajax({
                url: url,
                cache: false,
                type: 'DELETE'
            });
        },
        // 增加节点
        addNode: function (d) {
            var url = '/' + projectCode + '/specialty/nodetree';
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(d),
                contentType: 'application/json',
                type: 'POST'
            });
        },
        // 查询单个节点信息
        querySingleNode: function (id) {
            var url = '/' + projectCode + '/specialty/nodetree/' + id;
            return $.ajax({
                url: url,
                cache: false
            });
        },
        getUploadInfo: function () {
            return $.ajax({
                url: '/v1/upload_sessions',
                cache: false
            });
        }
    };
    var localData = {
        durations: [{
            key: 3,
            value: 3
        }, {
            key: 4,
            value: 4
        }, {
            key: 5,
            value: 5
        }]
    };

    function ViewModel() {
        this.treeInstance = null;
        this.$menu = $('.contextMenu_js');
        this.$tree = $('#organition_js');
        this.model = {
            // 学制列表
            durations: localData.durations,
            // 搜索条件
            filter: {
                name: ''
            },
            deleteItem: null, //移除节点数据
            // 节点信息
            extendInfo: {
                duration: '', //学制
                describe: '', //简介
                id: '', //id
                node_name: '', //节点名称
                parent_id: '', //父节点id
                status: 1, //节点状态（1启用/0禁用）
                sort_num: '', //排序
                node_type: '', //节点类型（0学院/1专业）
                extend_info: '' //json格式扩展属性
            },
            // 学院
            collegeInfo: {
                name: '', //名称
                describe: '', //简介
                status: 1 //节点状态（1启用/0禁用）
            },
            // 专业
            majorInfo: {
                duration: '', //学制
                name: '', //名称
                describe: '', //简介
                cover_url: '', //图片地址
                cover_id: '', //图片id
                status: 1 //节点状态（1启用/0禁用）
            },
            rightMenuType: -1, //右击类型
            opeType: -1 //节点操作类型
        }
        this._init();
    }

    ViewModel.prototype = {
        _init: function () {

            this.$deleteModal = $('#deleteModal');
            this.$collegeModal = $('#collegeModal');
            this.$majorModal = $('#majorModal');

            this.model = ko.mapping.fromJS(this.model);
            this.initUploadCover();
            this._validator();
            this._queryNodeTree();
            this._eventRegister();
        },
        // 初始化验证器
        _validator: function () {
            this.collegeValidInfo = ko.validation.group({
                name: this.model.collegeInfo.name.extend({
                    required: {
                        params: true,
                        message: '请填写学院名称'
                    },
                    maxLength: {
                        params: 20,
                        message: '学院名称不超过{0}个字'
                    }
                }),
                describe: this.model.collegeInfo.describe.extend({
                    required: {
                        params: true,
                        message: '请填写学院简介'
                    },
                    maxLength: {
                        params: 1000,
                        message: '学院简介不超过{0}个字'
                    }
                })
            });
            this.majorValidInfo = ko.validation.group({
                name: this.model.majorInfo.name.extend({
                    required: {
                        params: true,
                        message: '请填写学院名称'
                    },
                    maxLength: {
                        params: 20,
                        message: '学院名称不超过{0}个字'
                    }
                }),
                describe: this.model.majorInfo.describe.extend({
                    required: {
                        params: true,
                        message: '请填写专业简介'
                    },
                    maxLength: {
                        params: 1000,
                        message: '专业简介不超过{0}个字'
                    }
                })
            });
        },
        // 事件定义
        _eventRegister: function () {
            var vm = this;
            $(document).on('mouseup', function (e) {
                vm.$menu.fadeOut(50);
            });
            $('.close_callback_js').on('show.bs.modal', function (e) {
                // vm.model.collegeInfo.name.clearError();
                // vm.model.collegeInfo.describe.clearError();
                // vm.model.majorInfo.name.clearError();
                vm.collegeValidInfo.showAllMessages(false);
                vm.majorValidInfo.showAllMessages(false);
            });
            $('#keyword_js').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    vm.searchNode();
                }
            });
        },
        initUploadCover: function () {
            store.getUploadInfo()
                .done($.proxy(function (uploadInfo) {
                    // this.model.uploadInfo.path(uploadInfo.path || "");
                    // this.model.uploadInfo.server_url(uploadInfo.server_url || "");
                    // this.model.uploadInfo.session(uploadInfo.session || "");
                    // this.model.uploadInfo.service_id(uploadInfo.service_id || "");

                    this.uploadInfo = uploadInfo;
                    this.initPicturePlugin('photoUploadBtn', uploadInfo);
                    setTimeout(function () {
                        $('#majorModal').hide();
                    }, 500);
                }, this));
        },
        initPicturePlugin: function (domId, uploadInfo) {
            var uploader = new WebUploader.Uploader({
                swf: window.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + uploadInfo.server_url + '/v0.1/upload?session=' + uploadInfo.session,
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                pick: {
                    id: '#' + domId,
                    multiple: false
                },
                formData: {
                    path: uploadInfo.path
                },
                fileSingleSizeLimit: 2 * 1024 * 1024,
                accept: [{
                    title: "Images",
                    extensions: "gif,jpg,jpeg,png",
                    mimeTypes: 'image/png,image/jpeg,image/jpg,image/gif'
                }]
            });
            uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
            uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, "#" + domId));
            uploader.on('error', $.proxy(this.selectError, this, 'picture'));
        },
        selectError: function (type, error) {
            if (error == "Q_TYPE_DENIED") {
                if (type == 'picture') {
                    $.alert('请上传格式为gif,png,jpg的图片！');
                }

            } else if (error == "F_EXCEED_SIZE") {
                $.alert('大小不能超过2M');
            }
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.alert("文件大小为0，不能上传！");
                return false;
            }
        },
        uploadError: function (uploader, domId, file, reason) {
            this.uploaderMap = this.uploaderMap || {};
            this.uploaderMap[domId] = this.uploaderMap[domId] || 0;
            if (++this.uploaderMap[domId] <= 1) {
                store.getUploadInfo()
                    .done($.proxy(function (uploadInfo) {
                        uploader.option("server", "http://" + uploadInfo.server_url + "/v0.1/upload?session=" + uploadInfo.session);
                        uploader.retry();
                    }, this));
            } else {
                $.alert('上传失败：' + reason);
            }
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (domId, file, response) {
            if (!response.code) {
                $.alert("上传成功！");
                this.model.majorInfo.cover_id(response.dentry_id);
                // this.model.majorInfo.cover_url(data.absolute_url);
                this.model.majorInfo.cover_url('http://' + this.uploadInfo.server_url + '/v0.1/download?dentryId=' + response.dentry_id);
                // this.model.specialInfo.cover(response.dentry_id)
            } else {
                response ? $.alert(response.message) : $.alert("上传出错");
            }
        },
        // 组织结构查询
        _queryNodeTree: function () {
            var vm = this;
            store.queryNodeTree().done(function (d) {
                var _nodes;
                if (typeof(d) === 'object') {
                    _nodes = [d];
                }
                vm._generatorTree(_nodes);
            });
        },
        // 生成树
        _generatorTree: function (nodes) {
            var _setting = {
                data: {
                    key: {
                        children: 'children',
                        name: 'node_name',
                        title: 'node_name'
                    },
                    simpleData: {
                        idKey: 'id'
                    }
                },
                callback: {
                    beforeDrag: $.proxy(this._beforeDrag, this),
                    beforeDrop: $.proxy(this._beforeDrop, this),

                    onClick: $.proxy(this._onClick, this),
                    onRightClick: $.proxy(this._onRightClick, this),
                    onDblClick: $.proxy(this._onDblClick, this),

                    onDrop: $.proxy(this._onDrop, this),
                    onDrag: $.proxy(this._onDrag, this)
                },
                view: {
                    dblClickExpand: false,
                    selectedMulti: false
                },
                edit: {
                    enable: true,
                    showRemoveBtn: false,
                    showRenameBtn: false,
                    drag: {
                        isCopy: false,
                        isMove: true
                    }
                }
            };
            this.treeInstance = $.fn.zTree.init(this.$tree, _setting, nodes);
            this.treeInstance.expandAll(true);
        },
        // 拖动前
        _beforeDrag: function (treeId, treeNodes, targetNode, moveType) {

        },
        // 拖动结束
        _onDrag: function (event, treeId, treeNode) {

        },
        // 拖拽即将完成
        _beforeDrop: function (treeId, treeNodes, targetNode, moveType) {
            var _nodeType = treeNodes[0].node_type; //节点类型（0学院/1专业）
            if (targetNode.level !== treeNodes[0].level) {
                $.confirm({
                    type: 'alert',
                    content: '不同级节点不允许拖拽',
                    confirmButton: '关闭',
                    cancelButton: false,
                    title: false
                });
                return false;
            }
            if ((moveType == 'inner' && targetNode.level === treeNodes[0].level) || (targetNode.parent_id !== treeNodes[0].parent_id)) {
                $.confirm({
                    type: 'alert',
                    content: '只允许同级别节点拖拽',
                    confirmButton: '关闭',
                    cancelButton: false,
                    title: false
                });
                return false;
            }
        },
        // 拖拽进入目标节点
        _onDrop: function (event, treeId, treeNodes, targetNode, moveType) {
            var vm = this,
                index = vm._getDragIndex(treeNodes[0], 0),
                data = {
                    id: treeNodes[0].id,
                    parent_id: treeNodes[0].getParentNode().id,
                    sort_num: index
                };
            store.moveNode(data).done(function () {
                vm._reOrderNodes();
            });
        },
        // ztree重新排序(先重新获取，后续优化)
        _reOrderNodes: function () {
            // var vm=this,
            //     _nodes=this.treeInstance.getNodes();
            this._queryNodeTree();
        },
        // 节点点击
        _onClick: function (event, treeId, treeNode) {

        },
        // 节点鼠标右击
        _onRightClick: function (event, treeId, treeNode) {
            if (!treeNode || treeNode.level > 2) {
                return;
            }
            var _target = event.target,
                $menu_a = $(_target).closest('a[id^="organition_js"]'),
                _clientRect = null;
            if ($menu_a.length) {
                _target = $menu_a[0];
            }
            _clientRect = _target.getBoundingClientRect()
            this.$menu.hide();
            this.model.rightMenuType(treeNode.level);
            this.$menu.css({
                top: _target.offsetTop + _clientRect.height,
                left: _target.offsetLeft + _clientRect.width / 2
            }).fadeIn(50);
            this.treeInstance.selectNode(treeNode);
            event.stopPropagation();
        },
        // 节点双击
        _onDblClick: function (event, treeId, treeNode) {
            var _nodeType = treeNode.node_type;
            this.openModal(_nodeType, treeNode, 'edit');
        },
        // 弹开modal层
        openModal: function (nodeType, treeNode, type) {
            var vm = this,
                _extendInfo = null;
            this._querySingleNode(treeNode.id).done(function (d) {
                _extendInfo = JSON.parse(d.extend_info || '{}');
                vm.model.opeType(type);
                if (nodeType === 0) {
                    vm.model.collegeInfo.name(treeNode.node_name || '');
                    vm.model.collegeInfo.describe(_extendInfo.describe || '');
                    vm.model.collegeInfo.status(treeNode.status || 0);
                    setTimeout(function () {
                        vm.$collegeModal.modal('show');
                    }, 10)
                } else if (nodeType === 1) {
                    vm.model.majorInfo.name(treeNode.node_name || '');
                    vm.model.majorInfo.describe(_extendInfo.describe || '');
                    vm.model.majorInfo.status(treeNode.status || 0);
                    vm.model.majorInfo.cover_url(_extendInfo.cover_url || '');
                    vm.model.majorInfo.cover_id(_extendInfo.cover_id || '');
                    vm.model.majorInfo.duration(_extendInfo.duration || 3);
                    setTimeout(function () {
                        vm.$majorModal.modal('show');
                    }, 10)
                }
            });
        },
        // 获取拖拽index
        _getDragIndex: function (node, index) {
            var _prev = node.getPreNode(),
                _next = node.getNextNode(),
                _originalParentId = node.parent_id,
                _currentParentId;
            if (_next || _prev) {
                _currentParentId = (_next && _next.parent_id) || (_prev && _prev.parent_id);
            }
            if (_currentParentId == _originalParentId) {
                if (_next) {
                    if (node.sort_num > _next.sort_num) {
                        index = _next.sort_num;
                    } else {
                        if (_prev) {
                            index = _prev.sort_num;
                        } else {
                            index = node.sort_num;
                        }
                    }
                }
                if (!_next && _prev) {
                    index = _prev.sort_num;
                }
            } else {
                if (_next) {
                    index = _next.sort_num;
                }
                if (!_next && _prev) {
                    index = _prev.sort_num + 1;
                }
                if (!_next && !_prev) {
                    index = 0;
                }
            }
            return index;
        },
        // 查询单个节点信息
        _querySingleNode: function (id) {
            var _promise = $.Deferred();
            if (id) {
                _promise = store.querySingleNode(id);
            } else {
                _promise.resolve({});
            }
            return _promise;
        },
        // 编辑节点
        editItem: function () {
            var _level = this.model.rightMenuType(),
                _node = this.treeInstance.getSelectedNodes()[0];
            this.openModal(_level - 1, _node, 'edit');
        },
        // 移除节点
        removeItem: function () {
            var _selectedNode = this.treeInstance.getSelectedNodes()[0];
            _selectedNode.name = _selectedNode.node_name;
            this.model.deleteItem(_selectedNode);
            this.$deleteModal.modal('show');
        },
        // 移除确认
        deleteConfirm: function (binds) {
            var vm = this,
                _selectedNode = this.model.deleteItem();
            store.removeNode(_selectedNode.id).done(function (d) {
                vm.treeInstance.removeNode(_selectedNode);
            }).always(function () {
                vm.model.deleteItem(null);
                vm.$deleteModal.modal('hide');
            });
        },
        // 移除图片
        removeImg: function (binds) {
            this.cover_url('');
            this.cover_id('');
        },
        // 节点搜索
        searchNode: function () {
            var vm = this,
                _key = this.model.filter.name(),
                _fuzzyNodes = null;
            // this.treeInstance.cancelSelectedNode();
            vm.$tree.find('a[id^="organition_js"]').removeClass('active-node');
            if (!$.trim(_key)) {
                return;
            }
            _fuzzyNodes = this.treeInstance.getNodesByParamFuzzy('node_name', _key, null);
            _fuzzyNodes.forEach(function (node, index) {
                $('#' + node.tId + '_a').addClass('active-node');
                if (node.getParentNode() && !node.getParentNode().open) {
                    vm.treeInstance.expandNode(node.getParentNode(), true);
                }
            });
        },
        // 保存节点信息
        nodeConfirm: function (type, binds, event) {
            var vm = this,
                _nodeVo = {
                    extend_info: null
                },
                _isCollege = type === 'college',
                _promise = null;
            bindsObj = ko.mapping.toJS(binds);
            _nodeVo.node_name = bindsObj.name;
            _nodeVo.status = bindsObj.status;
            if (_isCollege) {
                if (vm.collegeValidInfo().length) {
                    vm.collegeValidInfo.showAllMessages();
                    return;
                }
                _nodeVo.extend_info = JSON.stringify({
                    describe: bindsObj.describe
                });
            } else {
                if (vm.majorValidInfo().length) {
                    vm.majorValidInfo.showAllMessages();
                    return;
                }
                _nodeVo.extend_info = JSON.stringify({
                    describe: bindsObj.describe,
                    duration: bindsObj.duration,
                    cover_url: bindsObj.cover_url,
                    cover_id: bindsObj.cover_id
                });
            }
            if (this.model.opeType() === 'edit') {
                _promise = this._updateNode(_nodeVo, _isCollege);
            } else {
                _promise = this._createNode(_nodeVo, _isCollege);
            }
            _promise.done(function (d) {
                vm.$collegeModal.modal('hide');
                vm.$majorModal.modal('hide');
            });
        },
        // 创建节点
        _createNode: function (nodeVo, isCollege) {
            var vm = this,
                _parentNode = this.treeInstance.getSelectedNodes()[0];
            nodeVo.parent_id = _parentNode.id;
            nodeVo.node_type = isCollege ? 0 : 1;
            return store.addNode(nodeVo).done(function (d) {
                vm.treeInstance.addNodes(_parentNode, [d]);
            });
        },
        // 更新节点
        _updateNode: function (nodeVo) {
            var vm = this,
                _currentNode = this.treeInstance.getSelectedNodes()[0];
            nodeVo.id = _currentNode.id;
            nodeVo.parent_id = _currentNode.parent_id;
            nodeVo.node_type = _currentNode.node_type;
            nodeVo.sort_num = _currentNode.sort_num;
            return store.updateNode(nodeVo).done(function (d) {
                $.extend(_currentNode, nodeVo);
                vm.treeInstance.updateNode(_currentNode);
            });
        }
    };

    $(function () {
        ko.validation.init({
            decorateInputElement: true,
            errorElementClass: 'ele-error',
            errorClass: 'mes-error',
            registerExtenders: true
        }, true);
        ko.applyBindings(new ViewModel(), document.getElementById('specialty_container_js'));
    })
})(window, jQuery);
