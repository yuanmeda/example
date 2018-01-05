(function () {
    "use strict";
    var store = {
        getMixOrgTree: function () {
            return $.ajax({
                url: "/" + projectCode + "/manage_orgs",
                data: {org_id: window.projectOrgId},
                type: "get",
                dataType: "json",
                cache: false
            });
        },
        getTag: function (channelId) {
            return $.ajax({
                url: "/" + projectCode + "/resource_pool/tags/tree",
                type: "get",
                dataType: "json",
                cache: false
            });
        },
        getResource: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/resource_pool/resources",
                type: "post",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        getResourceGroup: function () {
            return $.ajax({
                url: "/" + projectCode + "/channels/resource_groups",
                cache: false,
                dataType: 'json'
            });
        },
        updateResourceStatus: function (status, data) {
            return $.ajax({
                url: learningUnitUrl + "/v1/learning_units/enabled/" + status,
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceIsTop: function (isTop, data) {
            return $.ajax({
                url: learningUnitUrl + "/v1/learning_units/is_top/" + isTop,
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceTags: function (data) {
            return $.ajax({
                url: learningUnitUrl + "/v1/learning_units/tags",
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceForcesync: function (data) {
            return $.ajax({
                url: forceSyncUrl + '/v1/resources/actions/forcesync',
                type: 'put',
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            })
        }
    };
    var viewModel = {
        $searchOrg: null,
        $orgTreeModalBody: null,
        orgTreeObj: null,
        $orgTree: null,
        model: {
            items: [],
            total: 0,
            filter: {
                page_size: 20,
                page_no: 0,
                status: '', //状态：0下线，1上线
                name: '',//搜索关键字
                no_tag_resource: false,//是否查询未贴标签的资源, 默认为false
                tag_ids: [],//标签ID(多值)
                is_top: false,//置顶标识
                sort_type: 3,//排序类型：3综合 1最新 2最热
                time_status: '',//1即将开始 2正在开课 3已结束
                group_names: [],//学习单元分组列表
                affiliated_org_nodes: [],
                affiliated_org_node_filter_type: 0,
                audit_status: 1
            },
            isLoaded: false,
            allGroupNames: [],
            tags: [],
            style: 'pic', //列表显示风格
            selectedArray: [],// 勾选到的item，
            setSortable: '',// 设置sortable
            orgText: "点击查看或选择组织",
            updateNodes: [],
            create_resource_list: []
        },
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.selectTags = ko.observable({});
            this._initComputed();
            ko.applyBindings(this, document.getElementById('mainContent'));
            this.initTag();
            this._eventHandler();
            this._initMixOrgs();
        },
        _initMixOrgs: function () {
            var self = this;
            store.getMixOrgTree().done($.proxy(function (data) {
                this.manager_nodes = [];
                if (data.manager && !data.manager.has_manage_project) {
                    this.manager_nodes = $.map(data.manager.manager_nodes, function (v) {
                            return v.node_id;
                        }) || [];
                    this.model.filter.affiliated_org_nodes(this.manager_nodes);
                }
                if (location.hash) {
                    var h = location.hash,
                        i = h.indexOf('id');
                    if (~i) {
                        var id = h.substring(i + 3);
                        var unit_type = h.slice(h.indexOf('unit_type') + 10, i - 1);
                        if (id) {
                            var obj = {
                                unit_id: id,
                                type: unit_type
                            };
                            if (~h.indexOf('create')) {
                                store.updateResourceForcesync(obj).done(function () {
                                    self.getResourceGroup();
                                });
                            }
                        }
                    } else {
                        this.getResourceGroup()
                    }
                } else {
                    this.getResourceGroup();
                }
                this._initOrgTree(data.manager, data.org_tree);
            }, this));
        },
        _initComputed: function () {
            this.model.allStatus = ko.pureComputed(function () {
                var filter = this.model.filter;
                return !(filter.no_tag_resource() || filter.is_top() || ~$.inArray(filter.status(), [0, 1]) || ~$.inArray(filter.audit_status(), [1, 2, 3]));
            }, this);
            this.model.filter.tag_ids = ko.pureComputed(function () {
                var selectTags = this.model.selectTags, arr = [];
                $.each(selectTags(), function (i, v) {
                    if (v) arr.push(v);
                });
                return arr;
            }, this);
            this.model.isAllGroupNames = ko.computed({
                read: function () {
                    var list = this.model.allGroupNames(), selected = this.model.filter.group_names();
                    return list.length && selected.length === list.length;
                },
                write: function (value) {
                    var list = this.model.allGroupNames(), selected = this.model.filter.group_names;
                    if (value) {
                        selected($.map(list, function (v) {
                            return v.name;
                        }));
                    } else {
                        selected([])
                    }
                },
                owner: this
            });
        },
        _eventHandler: function () {
            var self = this;
            $(document).on('click', function (e) {
                if (!$(e.target).closest('.item-check').length) $('.item-check').removeClass('active');
            });
            $('#js-content').on('click', '.item-check', function () {
                $('.item-check').removeClass('active');
                $(this).addClass('active');
            });
        },
        editResource: function ($data) {
            var href = webpageUrl + "/" + projectCode;
            if ($data.type == "open-course") {
                href = window.opencourseUrl + "/" + projectCode + "/open_course/" + $data.resource_id;
            } else if ($data.type == "auxo-train") {
                href = window.trainUrl + "/" + projectCode + "/train/" + $data.resource_id + "/detail";
            } else if (~$.inArray($data.type, ['standard_exam', 'custom_exam', 'competition'])) {
                href += "/exam_center/exam/edit?id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            } else if ($data.type == "design_methodlogy_exam") {
                href += "/exam_center/offline_exam/edit?tmpl_id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            } else if ($data.type == "design_methodlogy_exercise") {
                href += "/exam_center/offline_exam/exerciseedit?tmpl_id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            } else if ($data.type == "e-certificate") {
                href = window.certificateUrl + "/" + projectCode + "/certificate/manage/form?id=" + $data.resource_id;
            } else if ($data.type == "barrier") {
                href += "/exam_center/exam/edit?id=" + $data.resource_id + "&sub_type=2";
            } else if ($data.type == "lecturer") {
                href = window.lecturerUrl + "/admin/lecturer/lecturer.html?lecturer_id=" + $data.resource_id + '&project_code=' + projectCode;
            } else {
                return;
            }
            href += (~href.indexOf("?") ? "&" : "?") + "return_url=" + encodeURIComponent(location.href.replace('#', '') + '#action=create?unit_type=' + $data.type + '&id=' + $data.resource_id) + '&source=channel';
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        editResourceAudit: function ($data) {
            var href = webpageUrl + "/" + projectCode;
            if ($data.type == "open-course") {
                href = window.opencourseUrl + "/" + projectCode + "/open_course/" + $data.resource_id + "/audit_detail";
            } else if ($data.type == "auxo-train") {
                href = window.trainUrl + "/" + projectCode + "/train/" + $data.resource_id + "/audit_detail";
            } else if (~$.inArray($data.type, ['standard_exam', 'custom_exam', 'competition'])) {
                href += "/exam_center/exam/audit_detail?id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            } else if ($data.type == "design_methodlogy_exam") {
                href += "/exam_center/offline_exam/audit_detail?tmpl_id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            } else if ($data.type == "design_methodlogy_exercise") {
                href += "/exam_center/offline_exam/exercise/audit_detail?tmpl_id=" + $data.resource_id + "&sub_type=" + $data.extra.subtype;
            } else if ($data.type == "e-certificate") {
                href = window.certificateUrl + "/" + projectCode + "/certificate/manage/form?id=" + $data.resource_id;
            } else if ($data.type == "barrier") {
                href += "/exam_center/exam/audit_detail?id=" + $data.resource_id + "&sub_type=2";
            } else if ($data.type == "lecturer") {
                href = window.lecturerUrl + "/admin/lecturer/lecturer.html?lecturer_id=" + $data.resource_id + '&project_code=' + projectCode;
            } else {
                return;
            }
            href += (~href.indexOf("?") ? "&" : "?") + "return_url=" + encodeURIComponent(location.href.replace('#', '') + '#action=create?unit_type=' + $data.type + '&id=' + $data.resource_id) + '&source=channel';
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        courseManage: function ($data) {
            var href = window.lecturerUrl + '/admin/#/lecturer/' + $data.resource_id + '/course?project_code=' + window.projectCode + "&return_url=" + encodeURIComponent(location.href.replace('#', '') + '#action=create?id=' + $data.resource_id);
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        hrefTo: function (type) {
            var href = '';
            switch (type) {
                case 'open-course':
                    href = window.opencourseUrl + '/' + projectCode + '/open_course/createforchannel';
                    break;
                case 'auxo-train':
                    href = window.trainUrl + '/' + projectCode + '/train/createforchannel';
                    break;
                case 'standard_exam':
                    href = window.webpageUrl + '/' + projectCode + '/exam_center/createforchannel?sub_type=0';
                    break;
                case 'custom_exam':
                    href = window.webpageUrl + '/' + projectCode + '/exam_center/createforchannel?sub_type=1';
                    break;
                case 'design_methodlogy_exam':
                    href = window.webpageUrl + '/' + projectCode + '/exam_center/offline_exam/createforchannel';
                    break;
                case 'design_methodlogy_exercise':
                    href = window.webpageUrl + '/' + projectCode + '/exam_center/offline_exam/exercisecfc';
                    break;
                case 'barrier':
                    href = window.webpageUrl + '/' + projectCode + '/exam_center/createforchannel?sub_type=2';
                    break;
                case 'competition':
                    href = window.webpageUrl + '/' + projectCode + '/exam_center/createforchannel?sub_type=3';
                    break;
                case 'e-certificate':
                    href = window.certificateUrl + '/' + projectCode + '/certificate/manage/formnew';
                    break;
                case 'lecturer':
                    href = window.lecturerUrl + '/admin/lecturer/lecturer_manage.html?project_code=' + projectCode;
                    break;
                default:
                    href = '';
            }
            if (href) {
                href += (~href.indexOf("?") ? "&" : "?") + "context_id=" + "&return_url=" + encodeURIComponent(location.href.replace('#', '') + '#action=create');
                href += '&__mac=' + Nova.getMacToB64(href);
                location.href = href;
            }
        },
        getResourceGroup: function (global) {
            var self = this;
            window.notShowCover = global;
            store.getResourceGroup().done(function (res) {
                self.model.allGroupNames(res);
                var exam_group = [],
                    result = [],
                    group_names = [];
                $.each(res, function (i, v) {
                    if (v.is_exam_group) {
                        exam_group.push(v);
                    } else {
                        result.push({
                            title: '新建' + v.title,
                            type: v.type,
                            children: []
                        });
                    }
                    group_names.push(v.name);
                });
                if (exam_group.length) {
                    result = result.concat([{
                        title: '新建测评',
                        type: '',
                        children: exam_group
                    }]);
                }
                self.model.create_resource_list(result);
                self.model.filter.group_names(group_names);
                self.getList();
                self.model.filter.group_names.subscribe(function () {
                    self.search();
                }, this);
            })
        },
        setOnline: function (flag, $data) {
            var self = this, selectedArray = this.model.selectedArray();
            var postData = $data ? [$data.resource_id] : $.map(selectedArray, function (v) {
                return v.resource_id;
            });
            store.updateResourceStatus(flag, postData).done(function (data) {
                if ($data) {
                    if (data && data[0]) {
                        if (data[0].code == 0) {
                            $.simplyToast("资源" + (flag ? "上线" : "下线") + "成功！");
                        } else {
                            $.alert("资源" + (flag ? "上线" : "下线") + "失败" + "，失败原因：" + data[0].message);
                        }
                    }
                } else {
                    self.formatErrorMessage(selectedArray, data, 'unit_id');
                }
                self.getList();
            })
        },
        formatErrorMessage: function (source, message, idKey) {
            var group = {}, str = "", errorCount = 0;
            idKey = idKey || "resource_id";
            $.each(message || [], function (im, vm) {
                if (vm.code != "0") {
                    ++errorCount;
                    $.each(source, function (is, vs) {
                        if (vs.resource_id == vm[idKey]) {
                            var hash = encodeURIComponent(vm.message);
                            group[hash] = group[hash] || [];
                            group[hash].push(vs.title);
                        }
                    })
                }
            });
            if (errorCount) {
                str = "共提交" + source.length + "个资源，其中" + (source.length - errorCount) + "个操作成功，" + errorCount + "个操作失败！<br/><br/><strong>失败原因</strong><br/>";
                var index = 1;
                $.each(group, function (i, v) {
                    str += index + "、" + decodeURIComponent(i) + "<br/>资源名称为：";
                    str += v.join("、") + "<br/>";
                    ++index;
                });
                return $.alert(str);
            } else {
                str = "共提交" + source.length + "个资源，全部成功！";
                return $.simplyToast(str);
            }
        },
        initTag: function () {
            var self = this;
            store.getTag().done(function (res) {
                if (res && res.children) self.formatTag(res);
            })
        },
        formatTag: function (data) {
            function getChildren(array, target) {
                for (var i = 0; i < array.children.length; i++) {
                    var root = $.extend(true, {}, array.children[i]);
                    delete root.children;
                    target.push(root);
                    if (array.children[i].children.length) {
                        getChildren(array.children[i], target);
                    }
                }
            }

            for (var i = 0; i < data.children.length; i++) {
                //初始化选择条件
                data.children[i].all = [];
                getChildren(data.children[i], data.children[i].all);
                data.children[i].children = data.children[i].all;
                delete data.children[i].all;
            }
            //拼凑二级标签
            this.model.tags(data.children);
        },
        setStyle: function (style) {
            this.model.style(style);
        },
        getList: function () {
            var self = this, _filter = this.model.filter, _search = ko.mapping.toJS(_filter);
            if (!_search.group_names.length) {
                //$.alert('请至少勾选一种资源类型！');
                this.model.items([]);
                this.model.total(0);
                _filter.page_no(0);
                this.pagination(0,
                    _filter.page_size(),
                    _filter.page_no(),
                    $.proxy(function (no) {
                        _filter.page_no(no);
                        this.getList();
                    }, this)
                );
                return;
            }
            this.model.isLoaded(false);
            store.getResource(this.formatFilter(_search)).done(function (res) {
                self.model.items(res.items);
                self.model.total(res.total);
                self.model.selectedArray([]);
                self.model.isLoaded(true);
                self.pagination(res.total,
                    _filter.page_size(),
                    _filter.page_no(),
                    $.proxy(function (no) {
                        _filter.page_no(no);
                        this.getList();
                    }, self)
                );
            }).always(function () {
                window.notShowCover = false;
                location.hash = "";
            })
        },
        formatFilter: function (search) {
            var newFilter = {};
            $.each(search, function (k, v) {
                if ($.isArray(v)) {
                    if (v.length) newFilter[k] = v;
                } else {
                    if (v !== "" && v !== false) newFilter[k] = v;
                }
            });
            return newFilter;
        },
        formatResourceType: function ($data) {
            var allGroupNames = window.allGroupNames || [];
            for (var i = 0; i < allGroupNames.length; i++)
                if (allGroupNames[i].type == $data.type)return allGroupNames[i].alias;
        },
        //清除选择
        clearSelect: function () {
            this.model.selectedArray([]);
        },
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
        _initOrgTree: function (managerData, treeData) {
            var _this = this, orgTreeObj, setting = {
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
            if (treeData) {
                _this.$orgTreeModalBody = $('#zT-orgTreeModalBody');
                orgTreeObj = _this.orgTreeObj = $.fn.zTree.init((_this.$orgTree = $("#zT-orgTree")), setting, treeData);
                orgTreeObj.checkAllNodes(false);
                var allNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), rootNode = allNodes[0];
                orgTreeObj.expandNode(rootNode, true, false, false);
                /*此处判断用户权限，禁用用户不能选择的节点*/
                if (!managerData.has_manage_project) {
                    orgTreeObj.setChkDisabled(rootNode, true, false, true);
                    if (managerData.manager_nodes.length > 0) {
                        $.each(managerData.manager_nodes, function (i, v) {
                            var availableNode = orgTreeObj.getNodeByParam("node_id", v.node_id);
                            if (availableNode) orgTreeObj.setChkDisabled(availableNode, false, false, true);
                        });
                    }
                }
                _this.$searchOrg = $("#zT-searchOrg").on('keyup', function (e) {
                    if (e.keyCode === 13) {
                        _this.changeColor("node_name", _this.$searchOrg.val());
                    }
                });
            } else {
                $("#zT-orgTreeModelBody").hide();
                $("#zT-orgTreeModelBody2").show().text("请在项目中配置项目的UC组织");
            }
        },
        saveOrg: function () {
            if (this.model.updateNodes().length > 0) {
                var nodeIds = $.map(this.model.updateNodes(), function (v) {
                    return v.node_id;
                });
                this.model.filter.affiliated_org_node_filter_type(1);
                this.model.filter.affiliated_org_nodes(nodeIds);
                this.model.orgText('已选' + this.model.updateNodes()[0].node_name + '等' + this.model.updateNodes().length + '个部门');
            } else {
                this.model.filter.affiliated_org_node_filter_type(0);
                this.model.filter.affiliated_org_nodes(this.manager_nodes || []);
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
                _this.$orgTree.css('display', 'none');
                value = String(value).toLowerCase();
                var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), matchNode = null;
                for (var i = 0, len = orgTreeNodes.length; i < len; i++) {
                    var node = orgTreeNodes[i];
                    if (value !== '' && _this._matchValue(node[key], value)) {
                        node.highlight = true;
                        orgTreeObj.selectNode(node, false);
                        orgTreeObj.expandNode(node, true, false, false);
                        !matchNode && (matchNode = node);
                    } else {
                        node.highlight = false;
                        orgTreeObj.expandNode(node, false, false, false);
                    }
                }
                orgTreeObj.refresh();
                _this.$orgTree.css('display', 'block');
                if (value === '') {
                    orgTreeObj.expandNode(orgTreeNodes[0], true, false, false);
                    _this.model.searchText('');
                } else if (matchNode) {
                    _this._setBodyScrollTop(matchNode.tId);
                    _this.model.searchText('');
                } else {
                    orgTreeObj.expandNode(orgTreeNodes[0], true, false, false);
                    _this.model.searchText('没有相关数据！');
                }
                _this.$searchOrg.blur();
            }
        },
        cancelAllNodes: function () {
            var self = this;
            this.model.updateNodes([]);
            this.model.orgText('点击查看或选择组织');
            this.model.filter.affiliated_org_node_filter_type(0);
            this.model.filter.affiliated_org_nodes(this.manager_nodes || []);
            if (this.orgTreeObj) {
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
        pagination: function (totalCount, pageSize, currentPage, callback, target) {
            var $target = target || $('#pagination');
            $target.pagination(totalCount, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (pageNum) {
                    if (pageNum != currentPage && callback) {
                        callback(pageNum);
                    }
                }
            });
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
                        sortableItems: _self.model.items,//ko.observable,排序item
                        setSortable: _self.model.setSortable,//ko.observable
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
                                    _self.getList();
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
                        sortableItems: _self.model.items,//ko.observable,排序item
                        setSortable: _self.model.setSortable,//ko.observable
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
                                    _self.getList();
                                });
                            }
                        }
                    }
                }
            }
        },
        saveResource: function () {

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
                        _self.getList();
                    });
                });
            });
        },
        //项目item勾选事件
        checkClick: function ($data) {
            var selectedArray = this.model.selectedArray, index = ~selectedArray.indexOf($data);
            if (index) {
                selectedArray.remove($data);
            } else {
                selectedArray.push($data)
            }
        },
        formatTime: function (time) {
            return $.format.date(time, 'yyyy-MM-dd');
        },
        //设定查询参数
        clearStatus: function () {
            this.model.filter.no_tag_resource(false);
            this.model.filter.is_top(false);
            this.model.filter.status("");
            this.model.filter.audit_status("");
        },
        setTag: function (id, pid) {
            if (id) this.model.filter.no_tag_resource(false);
            var selectTags = this.model.selectTags;
            selectTags()[pid] = id;
            selectTags(selectTags());
            this.search();
        },
        setStatus: function (k, v) {
            if (k !== 'sort_type') this.clearStatus();
            if (k) {
                if (k == "no_tag_resource") this.model.selectTags({});
                this.model.filter[k](v);
            }
            this.search();
        },
        setSortType: function () {
            this.clearStatus();
            if (k) {
                if (k == "no_tag_resource") this.model.selectTags({});
                this.model.filter[k](v);
            }
            this.search();
        },
        search: function () {
            this.model.filter.page_no(0);
            this.getList();
        },
        enterSearch: function ($data, $event) {
            if ($event && $event.type == "keyup" && $event.keyCode != 13) return;
            this.search();
        },
        //设置标签
        formatSelectedTag: function (tags) {
            return tags ? ($.isArray(tags) ? $.map(tags, function (v) {
                return v.id;
            }) : []) : [];
        },
        openCatalog: function () {
            var selectedArray = this.model.selectedArray();
            if (selectedArray.length === 1) {
                this._setCatalogTree(this.formatSelectedTag(selectedArray[0].tags), [selectedArray[0].resource_id]);
            } else {
                this._setCatalogTree([], $.map(selectedArray, function (v) {
                    return v.resource_id;
                }));
            }
        },
        openUnitCatalog: function (data) {
            this._setCatalogTree(this.formatSelectedTag(data.tags), [data.resource_id]);
        },
        _setCatalogTree: function (items, ids) {
            var self = this;
            store.getTag().done(function (data) {
                new ToolBar({
                    selectObj: items,
                    treeData: data,
                    saveCallback: function (data) {
                        var modal = this,
                            options = ids.map(function (item) {
                                return {
                                    resource_id: item,
                                    tag_ids: data
                                }
                            });
                        store.updateResourceTags(options).done(function (data) {
                            $.simplyToast("标签设置成功");
                            modal.hide();
                            self.search();
                        });
                    }
                })
            });
        },
        doTop: function (flag) {
            var self = this, ids = $.map(this.model.selectedArray(), function (v) {
                return v.resource_id;
            });
            store.updateResourceIsTop(flag, ids).done(function (data) {
                $.simplyToast((flag ? '置顶' : '取消置顶') + "成功");
                self.getList();
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})();