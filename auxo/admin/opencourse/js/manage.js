/**
 * 课程资源列表
 * Created by Leo on 2016/4/20.
 */

(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //课程列表(GET)
        courseList: function (data) {
            var url = '/' + projectCode + '/open_courses/search';

            return $.ajax({
                url: url,
                data: data,
                cache: false
            });
        },
        //更新上下线(PUT)
        updateCourseStatus: function (data, status) {
            var url = '/' + projectCode + '/open_courses/status/' + status;

            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        updateCourseTop: function (data, top) {
            var url = '/' + projectCode + "/open_courses/top/" + top;
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data),
                cache: false
            });
        },
        //删除课程(DELETE)
        deleteCourse: function (data) {
            var url = '/' + projectCode + '/open_courses';

            return $.ajax({
                url: url,
                type: 'DELETE',
                cache: false,
                data: JSON.stringify(data)
            });
        },
        //获取课程标签
        getCourseTags: function (courseId) {
            var url = '/' + projectCode + '/open_courses/' + courseId + '/tags';
            return $.ajax({
                url: url,
                cache: false
            });
        },
        sortCourse: function (targetId, dropId, top, cb) {
            var url = '/' + projectCode + "/open_courses/" + targetId + "/sort";
            return $.ajax({
                url: url,
                cache: false,
                type: "PUT",
                data: JSON.stringify({
                    "target_course_id": dropId, // 目标课程ID
                    "top": top // 课程置顶状态：0不置顶，1置顶
                }),
                success: cb
            });
        },
        createBatch: function (data) {
            var url = '/' + projectCode + '/open_courses/batch';

            return $.ajax({
                url: url,
                cache: false,
                type: 'POST',
                data: JSON.stringify(data)
            });
        },
        getMixOrgTree: function () {
            var url = '/' + projectCode + '/open_courses/manage_orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        }

    };
    //课程列表数据模型
    var viewModel = {
        $searchOrg: null,
        $orgTreeModalBody: null,
        orgTreeObj: null,
        $orgTree: null,
        model: {
            searchText: '',
            orgText: "点击查看或选择组织",
            updateNodes: [],
            isShowModal: false,
            items: [],
            filter: {
                page_size: 20, //分页大小
                page_no: 0, //分页索引
                status: '', //状态：0下线，1上线
                name: '', //搜索关键字
                has_tag: '', //是否已贴标签（0否，1是）
                tag_ids: '', //标签ID(多值)
                top_number: '', //置顶标识（0未置顶，1已置顶）
                sort_type: 0, //排序类型：0默认创建时间倒序，1上线时间（最新），2报名人数（最热）
                is_search_stat: 1, //是否查询统计信息：0默认否，1是
                affiliated_org_nodes: []
            },
            "style": 'pic', //列表显示风格
            tips: false, //是否显示提示信息
            selectedArray: [], // 勾选到的item
            setSortable: '', // 设置sortable
            processStatus: '数据加载中...'
        },
        clist: ko.observable({}),
        /*组织树显示*/
        showOrgTree: function () {
            $("#zT-orgTreeModal").modal('show');
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
        transform : function(data){
            return $.map(data || [],function(item){
                item.isParent = item.isParent || item.is_parent;
                delete item.children
                return item;
            })
        },
        _initOrgTree: function (managerData, treeData) {
            function uri(treeId,treeNode){
                return '/' + projectCode + '/open_courses/manage_orgs/' + treeNode.node_id + '/nodes'
            }
            var managerIds = $.map(managerData.manager_nodes,function(node){
                return node.node_id;
            })
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
                    },
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "parent_id",
                        rootPId: '0'
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
            //关键词搜索事件订阅
            this.model.filter.name.subscribe(function (val) {
                if (val.length > 50) {
                    this.model.tips(true);
                } else {
                    this.model.tips(false);
                }
            }, this);
            //课程数组数据强制刷新
            this.model.items.extend({
                notify: 'always'
            });

            this.Sortable = {
                options: {
                    sortableOp: {
                        items: 'li.item',
                        tolerance: 'pointer',
                        delay: '100',
                        placeholder: 'sort-state-highlight item cf',
                    },
                    koModelOp: {
                        sortableItems: viewModel.model.items, //ko.observable,排序item
                        setSortable: viewModel.model.setSortable, //ko.observable
                    },
                    leoSortableOp: {
                        beforeInit: function ($el) {
                            $el.css('display', 'block'); //chrome下自定义标签不占位导致拖拽位置计算错误
                        },
                        sortableStart: function (event, ui, targetIndex) {
                            _self.clearSelect();
                        },
                        sortableStop: function (event, ui, targetItem, dropItem, $el, sortableKoItems) {
                            if ((targetItem.top_number != 0 && dropItem.top_number == 0) || (targetItem.top_number == 0 && dropItem.top_number != 0)) {
                                viewModel.model.items($.extend(true, [], this.model.items()));
                            } else {
                                if (targetItem.id != dropItem.id) {
                                    store.sortCourse(targetItem.id, dropItem.id, !targetItem.top_number ? 0 : 1, function (data) {
                                        _self.doSearch();
                                    });
                                }

                            }
                        },
                    }
                }
            }

            this.TableSortable = {
                options: {
                    sortableOp: {
                        items: 'tr.item',
                        tolerance: 'pointer',
                        delay: '100',
                        helper: function (event, $item) {
                            var $clone = $item.clone().css('background', '#f9f9f9'),
                                $cloneTds = $clone.find('td');
                            $item.find('td').each(function (i, item) {
                                $cloneTds[i].width = $(item).outerWidth() + 'px';
                                i === 0 && $($cloneTds[i]).removeClass('on');
                            });
                            return $clone;
                        },
                    },
                    koModelOp: {
                        sortableItems: viewModel.model.items, //ko.observable,排序item
                        setSortable: viewModel.model.setSortable, //ko.observable
                    },
                    leoSortableOp: {
                        beforeInit: function ($el) {
                            $el.css('display', 'block'); //chrome下自定义标签不占位导致拖拽位置计算错误
                        },
                        sortableStart: function (event, ui, targetIndex) {
                            _self.clearSelect();
                        },
                        sortableStop: function (event, ui, targetItem, dropItem, $el, sortableKoItems) {
                            if ((targetItem.top_number != 0 && dropItem.top_number == 0) || (targetItem.top_number == 0 && dropItem.top_number != 0)) {
                                viewModel.model.items($.extend(true, [], this.model.items()));
                            } else {
                                if (targetItem.id != dropItem.id) {
                                    store.sortCourse(targetItem.id, dropItem.id, !targetItem.top_number ? 0 : 1, function (data) {

                                        _self.doSearch();

                                    });
                                }

                            }
                        },
                    }
                }
            }
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('opencourseContent'));
            //加载事件
            this._eventHandler();
            var selectMap = {
                '-1': {
                    prop: 'all',
                    val: ''
                },
                '0': {
                    prop: 'has_tag',
                    val: 0
                },
                '1': {
                    prop: 'top_number',
                    val: 1
                },
                '2': {
                    prop: 'status',
                    val: 1
                },
                '3': {
                    prop: 'status',
                    val: 0
                }
            };
            this.clist.sub("clist", function (val) {
                var selected = selectMap[val.flag()];
                _self._catalogSelect(selected.prop, selected.val);
                _self.model.filter.tag_ids(val.catalogs().join(','));
                _self.doSearch();
            });
            store.getMixOrgTree().done($.proxy(function (returnData) {
                this._initOrgTree(returnData.manager, this.transform(returnData.org_tree));
            }, this));
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {
            var _self = this;
            //item操作事件集
            $('#opencourseContent').on('click', '.item-check', function () {
                var _this = $(this),
                    _hasCheck = _this.hasClass('active');
                _this.closest('#opencourseContent').find('.item').find('.item-check').removeClass('active');
                if (!_hasCheck) {
                    _this.addClass('active');
                }
            });
            //回车搜索
            $('#keyword').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch();
                }
            });
        },
        /**
         * 课程列表初始化
         * @return {null} null
         */
        _list: function (flag) {
            var _self = this,
                _filter = _self.model.filter,
                _search = _self._getParamString(ko.mapping.toJS(_filter));
            //获取职位列表
            if (_self.model.items().length < 1) {
                _self.model.processStatus('数据加载中...');
            }
            store.courseList(_search).done(function (returnData) {
                if (returnData.items && returnData.items.length > 0) {
                    _self.model.processStatus('');
                    _self.model.items(returnData.items);
                } else {
                    _self.model.processStatus('暂无此类课程');
                    _self.model.items([]);
                }
                Utils.pagination(returnData.count,
                    _filter.page_size(),
                    _filter.page_no(),
                    function (no) {
                        _filter.page_no(no);
                        _self._list();
                    }
                );
                if (flag) {
                    $(document).trigger('showContent');
                }
                _self.clearSelect();
            });
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
                    if (typeof key)
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
        createCourse: function () {
            window.parent.location.href = "/" + projectCode + '/open_course/create?course_id=0&return_url=' + encodeURIComponent(return_url);
        },
        styleChange: function (type) {
            this.model.style(type);
        },
        doSearch: function () {
            if (this.model.tips()) {
                return;
            }
            this.model.filter.page_no(0);
            this._list();
        },
        /**
         * 移除勾选的课程
         * @return {null} null
         */
        deleteCourse: function (data) {
            var _self = this;
            var _postData = {
                course_ids: []
            };
            if (data) {
                _postData.course_ids.push(data.id);
            } else {
                $.each(viewModel.model.selectedArray(), function (index, data) {
                    _postData.course_ids.push(data.id);
                })
            }
            $.fn.dialog2.helpers.confirm("确定删除!", {
                "confirm": function () {
                    store.deleteCourse(_postData)
                        .done(function () {
                            $.fn.dialog2.helpers.alert('课程删除成功!');
                            (function () {
                                var _pageNo = _self.model.filter.page_no();
                                if (_self.model.items().length === 1 && _pageNo > 0) {
                                    _self.model.filter.page_no(_pageNo - 1);
                                }
                                _self._list()
                            })();
                        });
                },
                buttonLabelYes: '确定',
                buttonLabelNo: '取消'
            });

        },
        /**
         * 上下线操作
         * @param  {int} flag 上下线标识(1-上线、-1-下线)
         * @return {[type]}      [description]
         */
        onOffLine: function (binds, toolbar) {
            if (toolbar) {
                this._changeStatus(viewModel.model.selectedArray(), binds);
            } else {
                this._changeStatus([binds], binds.status === 1 ? 0 : 1);
            }
        },
        /**
         * 更新课程状态
         * @param  {int} status 状态值
         * @return {null}        null
         */
        _changeStatus: function (courses, status) {
            var _self = this;
            var _postData = {
                course_ids: []
            };
            $.each(courses, function (index, data) {
                _postData.course_ids.push(data.id);
            });

            store.updateCourseStatus(_postData, status)
                .done(function (data) {
                    $.fn.dialog2.helpers.alert((status === 1 ? '上线' : '下线') + '成功!');

                    (function () {
                        var _pageNo = _self.model.filter.page_no();
                        if (_self.model.filter.status() !== '' && _self.model.items().length === 1 && _pageNo > 0) {
                            _self.model.filter.page_no(_pageNo - 1);
                        }
                        _self._list();
                    })()
                });
        },
        //项目item勾选事件
        checkClick: function () {
            var selectedArray = viewModel.model.selectedArray,
                index = selectedArray.indexOf(this);
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
        //公开课设置标签
        openUnitCatalog: function () {
            var selectedArray = viewModel.model.selectedArray(),
                _self = this,
                ids = viewModel._getArrayProp(selectedArray, 'id');
            if (selectedArray.length === 1) {
                store.getCourseTags(selectedArray[0].id).done(function (data) {
                    _self._setCatalogTree(data.items, ids);
                });
            } else {
                this._setCatalogTree([], ids);
            }
        },
        _setCatalogTree: function (items, ids) {
            var _options = [],
                len = items.length,
                i = 0,
                _self = this,
                _urls = {
                    query: "/" + projectCode + '/tags/tree',
                    update: "/" + projectCode + '/open_courses/tags'
                };
            if (len) {
                for (; i < len; i++) {
                    _options.push(items[i].tag_id);
                }
            }
            var selectIds = [];
            $.each(viewModel.model.selectedArray(), function (index, data) {
                selectIds.push(data.id);
            });
            new ToolBar(_urls, _options, selectIds, viewModel, function () {
                var _pageNo = _self.model.filter.page_no();
                if (_self.model.filter.tag_ids() !== '' && _self.model.items().length === 1 && _pageNo > 0) {
                    _self.model.filter.page_no(_pageNo - 1);
                }
                _self._list();
            });
        },
        //置顶
        doPosition: function (flag) {
            var _self = this;
            var _postData = {
                course_ids: []
            };
            $.each(viewModel.model.selectedArray(), function (index, data) {
                _postData.course_ids.push(data.id);
            });
            store.updateCourseTop(_postData, flag)
                .done(function (data) {
                    $.fn.dialog2.helpers.alert((flag === 1 ? '置顶' : '取消置顶') + '成功!');
                    (function () {
                        var _pageNo = _self.model.filter.page_no();
                        if (_self.model.filter.top_number() !== '' && _self.model.items().length === 1 && _pageNo > 0) {
                            _self.model.filter.page_no(_pageNo - 1);
                        }
                        _self._list();
                    })();
                });
        },
        //公开课清除选择
        clearSelect: function () {
            viewModel.model.selectedArray([]);
        },
        //状态分类事件
        _catalogSelect: function (prop, val) {
            var filter = viewModel.model.filter;
            ['has_tag', 'top_number', 'status'].forEach(function (name, i) {
                if (name === prop) {
                    filter[prop](val)
                } else {
                    filter[name]('')
                }
            });
        },
        //通用分类事件
        orderSearch: function (sort_type) {
            viewModel.model.filter.sort_type(sort_type);
            this.doSearch();
            if (sort_type === 0) {
                viewModel.model.setSortable(['option', 'disabled', false]);
            } else {
                viewModel.model.setSortable(['option', 'disabled', true]);
            }
        },
        addFormPool: function () {
            this.model.isShowModal(true);
        },
        saveFromPool: function (items) {
            var _dataItems = $.map(items, function (item, index) {
                    return {
                        id: item.id
                    };
                }),
                _self = this;
            store.createBatch(_dataItems)
                .done(function () {
                    $.fn.dialog2.helpers.alert('添加成功!');
                    _self._list();
                });
        }
    };

    $(function () {
        viewModel._init();
    });

})(jQuery, window);
