/**
 * Created by Leo on 2016/5/20.
 */

;(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //列表(GET)
        trainsList: function (data) {
            var url = '/' + projectCode + '/trains/pages';
            return $.ajax({
                url: url,
                data: data,
                cache: false
            });
        },
        //删除(DELETE)
        deleteTrains: function (data) {
            var url = '/' + projectCode + '/trains';

            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'DELETE',
                cache: false
            });
        },
        //批量下线
        offline: function (data) {
            var url = '/' + projectCode + '/trains/enabled/false';

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        online: function (data) {
            var url = '/' + projectCode + '/trains/enabled/true';

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        top: function (data) {
            var url = '/' + projectCode + '/trains/top/true';

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        untop: function (data) {
            var url = '/' + projectCode + '/trains/top/false';

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        sort: function (train_id, sort_number) {
            var url = '/' + projectCode + '/trains/' + train_id + '/sort_number/' + sort_number + '/';

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
            var url = '/' + projectCode + '/trains/tags';

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        getMixOrgTree: function () {
            var url = '/' + projectCode + '/trains/manage_orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        }
    };
    //列表数据模型
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
                affiliated_org_nodes: []
            },
            style: 'pic', //列表显示风格
            selectedArray: [],// 勾选到的item
            setSortable: ''// 设置sortable
        },
        clist: ko.observable({}),
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
        _initOrgTree: function (managerData, treeData) {
            var managerIds = $.map(managerData.manager_nodes,function(node){
                return node.node_id;
            })
            function uri(treeId,treeNode){
                return '/' + projectCode + '/trains/manage_orgs/' + treeNode.node_id + '/nodes'
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
                    chkDisabledInherit: false,
                    radioType: "all"
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
            if (treeData && treeData.length) {
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
            if (this.model.updateNodes().length > 0) {
                var nodeIds = $.map(this.model.updateNodes(), function (v) {
                    return v.node_id;
                });
                this.model.filter.affiliated_org_nodes(nodeIds);
                this.model.orgText('已选' + this.model.updateNodes()[0].node_name + '等' + this.model.updateNodes().length + '个部门');
            } else {
                this.model.filter.affiliated_org_nodes([]);
                this.model.orgText('点击查看或选择组织');
            }
            $("#zT-orgTreeModal").modal('hide');
        },
        orgTreeSearch: function () {
            this.changeColor("node_name", $('#zT-searchOrg').val());
        },
        changeColor: function (key, value) {
            var _this = this, orgTreeObj = _this.orgTreeObj;
            if (orgTreeObj) {
                value = String(value).toLowerCase();
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
        cancelAllNodes: function () {
            var self = this;
            this.model.updateNodes([]);
            this.model.orgText('点击查看或选择组织');
            this.model.filter.affiliated_org_nodes([]);
            if(this.orgTreeObj) {
                $.each(this.orgTreeObj.getCheckedNodes(), function (i, v) {
                    self.orgTreeObj.checkNode(v, false, false, false);
                });
            }
            $('#zT-orgTreeModal').modal('hide');
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
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            var _self = this;
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //课程数组数据强制刷新
            this.model.items.extend({
                notify: 'always'
            });
            this.model.toolbarDeleteShow = ko.pureComputed(function () {
                return !this._filterKey(this.model.selectedArray(), 'enabled', true);
            }, this);
            this._initSortable();
            //ko绑定作用域
            this.koBind();
            //加载事件
            this._eventInit();
            //加载列表
            //this._list(true);
            var selectMap = {
                '-1': {prop: 'all', val: ''},
                '0': {prop: 'tag_flag', val: 1},
                '1': {prop: 'enabled', val: true},
                '2': {prop: 'enabled', val: false}
            };
            this.clist.sub("clist", function (val) {
                var selected = selectMap[val.flag()];
                _self._catalogSelect(selected.prop, selected.val);
                _self.model.filter.tag_ids(val.catalogs());
                _self.doSearch();
            });
            store.getMixOrgTree().done($.proxy(function (returnData) {
                this._initOrgTree(returnData.manager, this.transform(returnData.org_tree));
            }, this));
        },
        koBind: function () {
            var $content = $('#js-content');
            ko.applyBindings(this, $content[0]);
            $content.show();
        },
        _refreshItems: function () {
            viewModel.model.items($.extend(true, [], this.model.items()));
        },
        _initTreeChkDisabled: function (treeData, disabledNodes) {
            disabledNodes = $.map(disabledNodes, function (v) {
                return v.node_id;
            });
            $.each(treeData, function (i, v) {
                if (!~$.inArray(v.node_id, disabledNodes)) v.chkDisabled = true;
            });
            return treeData;
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
                                if (op.targetIndex > op.dropIndex) {
                                    sort_number = sort_number + 1;
                                }
                                store.sort(op.targetItem.id, sort_number).done(function () {
                                    _self._list();
                                });
                            }
                        }
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
                        }
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
                                if (op.targetIndex > op.dropIndex) {
                                    sort_number = sort_number + 1;
                                }
                                store.sort(op.targetItem.id, sort_number).done(function () {
                                    _self._list();
                                });
                            }
                        }
                    }
                }
            }
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventInit: function () {
            var _self = this, $jsContent = $('#js-content');
            //item操作事件集
            $jsContent.on('click', '.item-check', function () {
                var $checkItem = $(this), hasCheck = $checkItem.hasClass('active');
                $jsContent.find('.item-check').removeClass('active');
                if (!hasCheck) {
                    $checkItem.addClass('active');
                }
            });
            //回车搜索
            $('#js-keyword').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch();
                }
            });
        },
        _filterKey: function (arr, key, val) {
            var i = arr.length;
            while (i--) {
                if (arr[i][key] === val) {
                    return true;
                }
            }
            return false;
        },
        /**
         * 课程列表初始化
         * @return {null} null
         */
        _list: function () {
            var _self = this,
                _filter = _self.model.filter,
                _search = _self._getParamString(ko.mapping.toJS(_filter));
            store.trainsList(_search).done(function (data) {
                if (_self._fixPage(data.total)) {
                    _self._list();
                    return;
                }
                _self.model.items(Array.isArray(data.items) ? data.items : []);
                Utils.pagination(data.total,
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
        /**
         * 过滤请求参数
         * @param  {object} params 入参
         * @return {object}        处理后的参数
         */
        _filterParams: function (params) {
            var _params = "";
            for (var key in params) {
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
                    _params = _params + key + "=" + encodeURIComponent(params[key]) + "&";
                }
            }
            return _params.substring(0, _params.length - 1);
        },
        _getParamString: function (params) {
            var str = "";
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    var value = params[key], trimVal = "";
                    if ($.isArray(value)) {
                        var len = value.length;
                        for (var i = 0; i < len; i++) {
                            trimVal = $.trim(value[i]);
                            if (trimVal !== "") str += key + '=' + trimVal + "&";
                        }
                    } else {
                        trimVal = $.trim(value);
                        if (trimVal !== "") str += key + '=' + trimVal + "&";
                    }
                }
            }
            return str ? str.substring(0, str.length - 1) : str
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
         * 搜索
         * @return {null} null
         */
        doSearch: function () {
            this.model.filter.page(0);
            this._list();
        },
        /**
         * 移除勾选的项目
         * @return {null} null
         */
        deleteItems: function (data) {
            var _self = this, ids;
            if (data) {
                ids = viewModel._getArrayProp([data], 'id');
            } else {
                ids = viewModel._getArrayProp(viewModel.model.selectedArray(), 'id');
            }
            Utils.confirmTip('确定删除？', {
                icon: 7,
                btn: ['确定', '取消']
            }).then(function (index) {
                store.deleteTrains(ids).done(function () {
                    Utils.msgTip('删除成功!').done(function () {
                        _self._list();
                    });
                });
            });
        },
        /**
         * 更新上下线
         */
        onOffLine: function (selectedArray, enabled) {
            var _self = this, ids;
            ids = viewModel._getArrayProp(Array.isArray(selectedArray) ? selectedArray : [selectedArray], 'id');
            store[enabled ? 'online' : 'offline'](ids).done(function (data) {
                Utils.msgTip((enabled ? '上线' : '下线') + '成功!').done(function () {
                    _self._list();
                });
            });
        },
        //项目item勾选事件
        checkClick: function () {
            var selectedArray = viewModel.model.selectedArray, index = selectedArray.indexOf(this);
            if (index > -1) {
                selectedArray.remove(this);
            } else {
                selectedArray.push(this)
            }
        },
        _getArrayProp: function (array, prop) {
            return array.map(function (item) {
                return item[prop];
            });
        },
        //设置标签
        openCatalog: function () {
            var selectedArray = viewModel.model.selectedArray();
            if (selectedArray.length === 1) {
                this._setCatalogTree(selectedArray[0].train_tags, [selectedArray[0].id]);
            } else {
                this._setCatalogTree([], viewModel._getArrayProp(selectedArray, 'id'));
            }
        },
        openUnitCatalog: function (data) {
            viewModel._setCatalogTree(data.train_tags, [data.id]);
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
                                    train_id: item,
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
        //置顶
        doPosition: function (flag) {
            var _self = this, ids = viewModel._getArrayProp(viewModel.model.selectedArray(), 'id');
            store[flag === 1 ? 'top' : 'untop'](ids).done(function (data) {
                Utils.msgTip((flag === 1 ? '置顶' : '取消置顶') + '成功!').done(function () {
                    _self._list();
                });
            });
        },
        //清除选择
        clearSelect: function () {
            viewModel.model.selectedArray([]);
        },
        //状态分类事件
        _catalogSelect: function (prop, val) {
            var filter = viewModel.model.filter;
            ['tag_flag', 'enabled'].forEach(function (name, i) {
                if (name === prop) {
                    filter[prop](val)
                } else {
                    filter[name]('')
                }
            });
        },
        //通用分类事件
        orderSearch: function (order_by) {
            viewModel.model.filter.order_by(order_by);
            this.doSearch();
            if (order_by === 1) {
                viewModel.model.setSortable(['option', 'disabled', false]);
            } else {
                viewModel.model.setSortable(['option', 'disabled', true]);
            }
        },
        formatTime: function (time) {
            return $.format.date(time, 'yyyy-MM-dd');
        }
    };
    /**
     * 执行程序
     */
    $(function () {
        viewModel._init();
    });
})(jQuery, window);