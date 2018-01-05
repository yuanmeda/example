(function ($) {
    //数据仓库
    var store = {
        //考试列表
        examList: function (data) {
            var url = '/' + projectCode + '/exam_center/exams';
            return $.ajax({
                url: url,
                data: data,
                cache: false
            });
        },
        copyExam: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/templates/' + data.id + '/copy';
            return $.ajax({
                url: url,
                type: 'POST',
                cache: false
            });
        },
        online: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/templates/online';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        offline: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/templates/offline';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        remove: function (id) {
            var url = '/' + projectCode + '/exam_center/exams/templates/' + id;
            return $.ajax({
                url: url,
                type: 'DELETE',
                cache: false
            });
        },
        sort: function (examId, sortNumber) {
            var url = '/' + projectCode + '/exam_center/exams/' + examId + '/sort_number/' + sortNumber;
            return $.ajax({
                url: url,
                type: 'PUT',
                cache: false
            });
        },
        getTree: function () {
            var url = '/' + projectCode + '/tags/tree?custom_type=' + custom_type;

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        putTags: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/tags';

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        top: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/top';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        untop: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/untop';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        getOrgTree: function () {
            var url = '/' + projectCode + '/exam_center/exams/manage_orgs';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        }
    };
    //数据模型
    var viewModel = {
        $searchOrg: null,
        $orgTreeModalBody: null,
        orgTreeObj: null,
        $orgTree: null,
        model: {
            searchText: '',
            orgText: "点击查看或选择组织",
            updateNodes: [],
            items: [],
            filter: {
                size: 20, //分页大小
                page: 0, //分页索引
                enabled: '', //状态：false下线，true上线
                title: '',//搜索关键字
                tag_flag: '',//空标签辅助标志 0全部(缺省) 1未贴标签
                tag_ids: '',//标签ID(多值)
                order_by: 0,//排序类型 0：综合 1：最新 2：最热
                exam_status: '',//考试状态 1:未开始 2:进行中 3:已结束
                affiliated_org_nodes: []
            },
            style: 'pic', //列表显示风格
            selectedArray: [],// 勾选到的item
            setSortable: ''// 设置sortable
        },
        clist: ko.observable({}),
        init: function () {
            var _self = this;
            _self.model = ko.mapping.fromJS(_self.model);
            this.model.items.extend({
                notify: 'always'
            });

            this._initSortable();
            //ko绑定作用域
            this.koBind();

            var selectMap = {
                '-1': {prop: 'all', val: ''},
                '0': {prop: 'tag_flag', val: 1},
                '1': {prop: 'exam_status', val: 2},
                '2': {prop: 'exam_status', val: 3},
                '3': {prop: 'enabled', val: false},
                '4': {prop: 'enabled', val: true}
            };
            this.clist.sub("clist", function (val) {
                var selected = selectMap[val.flag()];
                _self._catalogSelect(selected.prop, selected.val);
                viewModel.model.filter.tag_ids(val.catalogs());
                _self.doSearch();
            });
            Utils.placeholder($("#examquery"));
            viewModel._eventHandler();
            store.getOrgTree().done($.proxy(function (returnData) {
                this._initOrgTree(_self.transform(returnData.org_tree), returnData.manager);
            }, this));
        },
        /*组织树显示*/
        showOrgTree: function () {
            $("#zT-orgTreeModal").modal('show');
        },
        transform : function(data){
            return $.map(data || [],function(item){
                item.isParent = item.isParent || item.is_parent;
                delete item.children
                return item;
            })
        },
        _initOrgTree: function (treeData, managerData) {
            var managerIds = $.map(managerData.manager_nodes || [],function(node){
                return node.node_id;
            })
            function uri(treeId,treeNode){
                return '/' + projectCode + '/exam_center/exams/manage_orgs/' + treeNode.node_id + '/nodes'
            }
            var _this = this, orgTreeObj, setting = {
                 async:{
                    enable: true,
                    url: uri,
                    type:'get',
                    dataType:'json',
                    contentType: "application/json",
                    dataFilter:function(treeId, parentNode, responseData){
                        if(!responseData) return null;
                        return _this.transform(responseData)
                    }
                },
                data: {
                    key: {
                        name: 'node_name',
                        title: 'node_name'
                    }
                },
                check: {
                    enable: true,
                    chkboxType: {"Y": "", "N": ""},
                    chkStyle: "checkbox",
                    chkDisabledInherit: false
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        var updateNodes = _this.model.updateNodes;
                        if (treeNode.checked) {
                            updateNodes.push(treeNode);
                        } else {
                            updateNodes.remove(function (item) {
                                return item.node_id === treeNode.node_id;
                            });
                        }
                    },  
                    onAsyncSuccess: function(event,treeId,treeNode,msg){
                        if(!managerData.has_manage_project){
                            var children = treeNode.children;
                            $.each(children, function (i, v) {
                                orgTreeObj.setChkDisabled(v, !~$.inArray(v.node_id,managerIds), false, true);
                            });
                        }
                    }
                },
                view: {
                    fontCss: function (treeId, treeNode) {
                        if (treeNode.highlight) {
                            return {color: "#38adff", "font-weight": "bold"};
                        } else if (treeNode.node_type === 1) {
                            return {color: "#767cf3", "font-weight": "normal"};
                        } else if (treeNode.node_type === 2) {
                            return {color: "#000", "font-weight": "normal"};
                        } else if (treeNode.node_type === 3) {
                            return {color: "#6c6d76", "font-weight": "normal"};
                        }
                    },
                    expandSpeed: ''
                }
            };
            if (Array.isArray(treeData) && treeData.length) {
                _this.$orgTreeModalBody = $('#zT-orgTreeModalBody');
                orgTreeObj = _this.orgTreeObj = $.fn.zTree.init((_this.$orgTree = $("#zT-orgTree")), setting, treeData);
                orgTreeObj.checkAllNodes(false);
                var allNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), rootNode = allNodes[0];
                if(!managerData.has_manage_project){
                      orgTreeObj.setChkDisabled(rootNode, true, false, true);
                }
                _this.$searchOrg = $("#zT-searchOrg").on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        _this.changeColor("node_name", _this.$searchOrg.val());
                    }
                });
            } else {
                $("#zT-orgTreeModelBody").hide();
                $("#zT-orgTreeModelBody2").text("请在项目中配置项目的UC组织");
            }
        },
        saveOrg: function () {
            var updateNodes = this.model.updateNodes(), len = updateNodes.length, parm = [];
            if (len) {
                $.each(updateNodes, function (index, item) {
                    parm.push(item.node_id);
                });
            }
            var display = len ? '已选' + updateNodes[0].node_name + '等' + len + '个部门' : '点击查看或选择组织';
            this.model.filter.affiliated_org_nodes(parm);
            this.model.orgText(display);
            $("#zT-orgTreeModal").modal('hide');
        },
        cancelSelected: function () {
            this.model.filter.affiliated_org_nodes([]);
            this.model.updateNodes([]);
            if(this.orgTreeObj){
                this.orgTreeObj.checkAllNodes(false);
            }
            this.model.orgText('点击查看或选择组织');
            $("#zT-orgTreeModal").modal('hide');
        },
        orgTreeSearch: function () {
            this.changeColor("node_name", $('#zT-searchOrg').val());
        },
        changeColor: function (key, value) {
            var _this = this, orgTreeObj = _this.orgTreeObj;
            if (orgTreeObj && value) {
                value = String($.trim(value)).toLowerCase();
                var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), matchNode = null;
                for (var i = 0, len = orgTreeNodes.length; i < len; i++) {
                    var node = orgTreeNodes[i];
                    if (value !== '' && _this._matchValue(node[key], value)) {
                        node.highlight = true;
                        !matchNode && (matchNode = node);
                    } else {
                        node.highlight = false;
                    }
                    orgTreeObj.expandNode(node.getParentNode(),true, false, false);
                    orgTreeObj.updateNode(node);
                }
            }
        },
        _matchValue: function (match, value) {
            return String(match).toLowerCase().indexOf(value) > -1;
        },
        _setBodyScrollTop: function (id) {
            var $orgTreeModalBody = this.$orgTreeModalBody;
            $orgTreeModalBody.scrollTop(0);
            $orgTreeModalBody.scrollTop($('#' + id).position().top - this._getSearchFormH());
        },
        _getSearchFormH: (function () {
            var height = null;
            return function () {
                if (!height) {
                    height = $('#zT-searchForm').outerHeight(true);
                }
                return height;
            }
        })(),
        //状态分类事件
        _catalogSelect: function (prop, val) {
            var filter = viewModel.model.filter;
            ['tag_flag', 'enabled', 'exam_status'].forEach(function (name, i) {
                if (name === prop) {
                    filter[prop](val)
                } else {
                    filter[name]('')
                }
            });
        },
        koBind: function () {
            var $content = $('#js-content');
            ko.applyBindings(this, $content[0]);
            $content.show();
        },
        /**
         * 图片列表模式切换
         * @param  {string} type 模式名
         * @return {null}      null
         */
        styleChange: function (type) {
            this.model.style(type);
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
            //item操作事件集
            $('#examlist').on('click', '.item-check', function () {
                var _this = $(this),
                    _hasCheck = _this.hasClass('active');
                _this.closest('#examlist').find('.item').find('.item-check').removeClass('active');
                if (!_hasCheck) {
                    _this.addClass('active');
                }
            });
            //回车搜索
            $('#js-keyword').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch();
                }
            });
        },
        //获取考试列表数据
        _list: function (pageIndex) {
            var _self = this,
                _filter = _self.model.filter,
                _search = _self._filterParams(ko.mapping.toJS(_filter));
            store.examList(_search).done(function (data) {
                if (_self._fixPage(data.count)) {
                    _self._list();
                    return;
                }
                _self.model.items(Array.isArray(data.items) ? data.items : []);
                Utils.pagination(data.count,
                    _filter.size(),
                    _filter.page(),
                    function (no) {
                        _filter.page(no);
                        _self._list();
                    }
                );
                _self.clearSelect();
            });
        },
        _fixPage: function (total) {
            var page = this.model.filter.page(), max = Math.ceil(total / this.model.filter.size() - 1);
            max < 0 && (max = 0);
            if (page > 0 && page > max) {
                this.model.filter.page(max);
                return true;
            }
            return false;
        },
        _filterParams: function (params) {
            var _params = "";
            for (var key in params) {
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
                    _params = _params + key + "=" + encodeURIComponent(params[key]) + "&";
                }
            }
            return _params.substring(0, _params.length - 1);
        },
        _initSortable: function () {
            var _self = this;
            this.Sortable = {
                options: {
                    sortableOp: {
                        items: 'li.item',
                        tolerance: 'pointer',
                        delay: '100',
                        placeholder: 'sort-state-highlight item cf',
                        cursor: "move"
                    },
                    koModelOp: {
                        sortableItems: viewModel.model.items,//ko.observable,排序item
                        setSortable: viewModel.model.setSortable,//ko.observable
                    },
                    leoSortableOp: {
                        beforeInit: function ($el) {
                            $el.css('display', 'block');//chrome下自定义标签不占位导致拖拽位置计算错误
                        },
                        sortableStart: function (event, ui, targetIndex) {
                            _self.clearSelect();
                        },
                        sortableStop: function (event, ui, op) {
                            if (op.targetItem.id === op.dropItem.id) {
                                return;
                            }
                            if (op.targetItem.is_top !== op.dropItem.is_top) {
                                _self._refreshItems();
                            } else {
                                var sort_number = +op.dropItem.sort_number;
                                //if (op.targetIndex > op.dropIndex) {
                                //    sort_number = sort_number + 1;
                                //}
                                store.sort(op.targetItem.id, sort_number).done(function () {
                                    _self._list();
                                });
                            }
                        },
                    }
                }
            };
            this.TableSortable = {
                options: {
                    sortableOp: {
                        items: 'tr.item',
                        tolerance: 'pointer',
                        delay: '100',
                        cursor: "move",
                        helper: function (event, $item) {
                            var $clone = $item.clone().css('background', '#f9f9f9'), $cloneTds = $clone.find('td');
                            $item.find('td').each(function (i, item) {
                                $cloneTds[i].width = $(item).outerWidth() + 'px';
                                i === 0 && $($cloneTds[i]).removeClass('on');
                            });
                            return $clone;
                        },
                    },
                    koModelOp: {
                        sortableItems: viewModel.model.items,//ko.observable,排序item
                        setSortable: viewModel.model.setSortable,//ko.observable
                    },
                    leoSortableOp: {
                        beforeInit: function ($el) {
                            $el.css('display', 'block');//chrome下自定义标签不占位导致拖拽位置计算错误
                        },
                        sortableStart: function (event, ui, targetIndex) {
                            _self.clearSelect();
                        },
                        sortableStop: function (event, ui, op) {
                            if (op.targetItem.id === op.dropItem.id) {
                                return;
                            }
                            if (op.targetItem.is_top !== op.dropItem.is_top) {
                                _self._refreshItems();
                            } else {
                                var sort_number = +op.dropItem.sort_number;
                                //if (op.targetIndex > op.dropIndex) {
                                //    sort_number = sort_number + 1;
                                //}
                                store.sort(op.targetItem.id, sort_number).done(function () {
                                    _self._list();
                                });
                            }
                        }
                    }
                }
            }
        },
        _refreshItems: function () {
            viewModel.model.items($.extend(true, [], this.model.items()));
        },
        //项目item勾选事件
        checkClick: function (type) {
            var selectedArray = viewModel.model.selectedArray, index = selectedArray.indexOf(this);
            if (index > -1) {
                selectedArray.remove(this);
            } else {
                selectedArray.push(this)
            }
        },
        doSearch: function () {
            this.model.filter.page(0);
            this._list();
        },
        //清除选择
        clearSelect: function () {
            viewModel.model.selectedArray([]);
        },
        //通用分类事件
        orderSearch: function (order_by) {
            viewModel.model.filter.order_by(order_by);
            this.doSearch();
            if (order_by === 0) {
                viewModel.model.setSortable(['option', 'disabled', false]);
            } else {
                viewModel.model.setSortable(['option', 'disabled', true]);
            }
        },
        //置顶（1）,取消置顶（-1）
        doPosition: function (flag) {
            var _self = this, ids = viewModel._getArrayProp(viewModel.model.selectedArray(), 'id');
            store[flag === 1 ? 'top' : 'untop'](ids).done(function (data) {
                Utils.msgTip((flag === 1 ? '置顶' : '取消置顶') + '成功!').done(function () {
                    _self._list();
                });
            });
        },
        _getArrayProp: function (array, prop) {
            return array.map(function (item) {
                return item[prop];
            });
        },
        //设置position操作
        handlerPosition: function (flag, position) {
            var _self = viewModel,
                _temp = [],
                _items = _self.items.slice(0);
            $.each(_self.model.selectedIds(), function (index, element) {
                $.each(_items, function (i, item) {
                    var _position = item.position;
                    if (element == item.id) {
                        if (_position == position) {
                            return;
                        }
                        if (position > 0) {
                            if (_position == 1 || _position == 0 || _position == 2) {
                                !flag && _temp.push({
                                    id: element,
                                    position: _position | position
                                });
                                flag && (item.position |= position);
                            }
                        } else {
                            if (_position == 1 || _position == 3 || _position == 2) {
                                !flag && _temp.push({
                                    id: element,
                                    position: _position & ~(-position)
                                });
                                flag && (item.position &= ~(-position));
                            }
                        }
                    }
                });
            });
            return flag ? _items : _temp;
        },
        //考试上下线操作
        onOffLine: function (selectedArray, enabled) {
            var _self = this, ids;
            ids = viewModel._getArrayProp(Array.isArray(selectedArray) ? selectedArray : [selectedArray], 'id');
            store[enabled ? 'online' : 'offline'](ids).done(function (data) {
                Utils.msgTip((enabled ? '上线' : '下线') + '成功!').done(function () {
                    _self._list();
                });
            });
        },
        //复制考试操作
        copyExam: function ($data) {
            var _self = this;
            store.copyExam($data).done(function () {
                $.fn.dialog2.helpers.alert('复制成功');
                _self._list();
            });
        },
        //设置标签
        openCatalog: function () {
            var selectedArray = viewModel.model.selectedArray();
            if (selectedArray.length === 1) {
                this._setCatalogTree(selectedArray[0].exam_tags, [selectedArray[0].id]);
            } else {
                this._setCatalogTree([], viewModel._getArrayProp(selectedArray, 'id'));
            }
        },
        openUnitCatalog: function (data) {
            viewModel._setCatalogTree(data.exam_tags, [data.id]);
        },
        _setCatalogTree: function (items, ids) {
            store.getTree().done(function (data) {
                new ToolBar({
                    selectObj: items,
                    treeData: data,
                    saveCallback: function (data) {
                        var _self = this,
                            options = ids.map(function (item) {
                                return {
                                    exam_id: item,
                                    tag_ids: data
                                }
                            });
                        store.putTags(options).done(function (data, status) {
                            Utils.msgTip('标签设置成功').done(function () {
                                viewModel._list();
                                _self.hide();
                            });
                        });
                    }
                })
            });
        },
        delExam: function (id) {
            Utils.confirmTip("您确认要删除考试吗？", function () {
                store.remove(id)
                    .done(function () {
                        viewModel._list();
                        $.fn.dialog2.helpers.alert("移除成功");
                    });
            });
        },
        //移除公开课资源
        remove: function () {
            var _self = this;
            var data = {
                ids: _self.model.selectedIds()
            };

            delIds = _self.model.selectedIds().map(function (id, index) {
                return 'ids=' + id;
            });

            store.remove(delIds.join('&'))
                .done(function () {
                    _self._list();
                    _self.model.selectedIds([]);
                    $.fn.dialog2.helpers.alert("移除成功");
                })
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery);