;(function ($) {
    "use strict";
    var store = {
        //课程列表(GET)
        courseList: function () {
            var url = '/v1/open_courses/search';

            return $.ajax({
                url: url,
                cache: false
            });
        },
        /*编辑和详情用获取课程*/
        getCourse: function () {
            var url = '/v1/open_courses/' + courseId;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json'
            });
        },
        /*编辑*/
        updateCourse: function (data) {
            var url = '/v1/open_courses/' + courseId;
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                contentType: 'application/json',
                type: 'PUT'
            });
        },
        createCourse: function (data) {
            var url = '/v1/open_courses';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                contentType: 'application/json',
                type: 'POST',
                dataType: 'json',
                cache: false
            });
        },
        getOrgTree: function () {
            var url = '/v1/open_courses/orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        getMixOrgTree: function () {
            var url = '/v1/open_courses/manage_orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        getTree: function () {
            var url = '/v1/tags/tree?custom_type=' + custom_type;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        }
    };
    var viewModel = {
        treeObj: null,
        orgTreeObj: null,
        $searchOrg: null,
        $orgTreeModal: $('#js-orgTreeModal'),
        $chznSelect: null,
        $orgTreeModalBody: null,
        $orgTree: null,
        orgTreeCheckNodes: [],
        model: {
            course: {
                description: "",
                title: "",
                pic_url: '',
                pic_id: "",
                user_suit: "",
                course_status: "",
                org_node_ids: [],
                affiliated_org_node: null,
                visible_config: 0,
                summary: "",
                tag_ids: [],
                open_course_tag_base_vos: [],
                uploadInfo: {
                    path: '',
                    server_url: '',
                    service_id: '',
                    session: ''
                }

            },
            orgSettings: {
                belong: {
                    updateNodes: [],
                    orgSelectedText: '',
                    visibleType: '0',
                    chkStyle: 'radio'
                },
                available: {
                    updateNodes: [],
                    orgSelectedText: '',
                    visibleType: '0',
                    chkStyle: 'checkbox'
                },
            },
            orgInfo: {
                allNodes: null,
                disabledNodes: [],
                orgTreeModel: null,
                updateNodes: [],
                nowType: ''
            },
            labelContent: '',
            searchText: '',
            readonly: !!window.readonly
        },
        //页面初始化
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            $.each(['belong', 'available'], function (i, v) {
                _self.model.orgSettings[v].orgSelectedText = ko.computed(function () {
                    var visibleType = this.model.orgSettings[v].visibleType(), updateNodes = this.model.orgSettings[v].updateNodes();
                    return visibleType == '0' ? "请选择要开放的部门" : (updateNodes.length > 0 ? '已选' + updateNodes[0].node_name + '等' + updateNodes.length + '个部门' : '点击查看或选择组织');
                }, _self);
            });
            if (courseId) {
                document.title = '编辑公开课';
                _self.getCourseInfo();
            } else {
                document.title = '新增公开课';
                store.getMixOrgTree().done(function (treeData) {
                    _self._initOrgTree(treeData.manager, treeData.org_tree, [], "radio");
                });
            }
            ko.applyBindings(_self, document.getElementById("js_content"));
            this._loadTree();
        },

        //初始化标签树
        _loadTree: function () {
            if (this.model.readonly()) {
                return;
            }
            var _self = this, setting = {
                data: {
                    key: {
                        name: 'title',
                        title: 'title'
                    }
                },
                check: {
                    enable: true,
                    chkboxType: {"Y": "", "N": ""},
                },
                callback: {
                    onCheck: function (e, tid, tnode) {
                        var tagIds = _self.model.course.tag_ids;
                        if (tnode.checked) {
                            tagIds.push(tnode.id);
                        } else {
                            tagIds.remove(function (item) {
                                return item === tnode.id;
                            });
                        }
                    }
                },
                simpleData: {
                    enable: true,
                    idKey: 'id',
                    pIdKey: 'parent_id'
                }
            };
            return store.getTree().done(function (data) {
                if (data && data.children && data.children.length) {
                    _self.treeObj = $.fn.zTree.init($('#J_Tree'), setting, data.children);
                    _self.treeObj.expandAll(true);
                }
            });
        },
        //初始化选中节点
        _checkNodes: function (ids) {
            if (!this.model.readonly() && ids && Array.isArray(ids) && ids.length > 0) {
                var treeObj = viewModel.treeObj;
                ids.forEach(function (item) {
                    var node = treeObj.getNodeByParam('id', item);
                    if (node) {
                        treeObj.checkNode(node, true, false, false);
                    }
                });
            }
        },

        getCourseInfo: function () {
            var _self = this, _course = this.model.course;
            store.getCourse().done(function (data) {
                _course.title(data.title);
                /*_course.description(data.description);*/
                var des = data.description;
                if (des) {
                    if (!_self.model.course.uploadInfo.service_id()){
                        _self.model.course.uploadInfo.service_id.subscribe(function (val) {
                            if (val) {
                                var str = des.replace(/\$\{cs_host}/gim, _self.model.course.uploadInfo.server_url());
                                _self.model.course.description(str);
                                window.desEditor.html(_self.model.course.description());
                            }
                        });
                    } else {
                        _self.model.course.description(des.replace(/\$\{cs_host}/gim, _self.model.course.uploadInfo.server_url()));
                        window.desEditor.html(_self.model.course.description());
                    }
                }
                _course.tag_ids(data.tag_ids);
                _course.open_course_tag_base_vos(data.open_course_tag_base_vos);
                _course.pic_id(data.pic_id);
                _course.pic_url(data.pic_url);
                _course.user_suit(data.user_suit);
                _course.course_status(data.course_status);
                _course.visible_config(data.visible_config);
                _course.org_node_ids(data.org_node_ids);
                _course.summary(data.summary);
                _course.affiliated_org_node(data.affiliated_org_node);
                /*初始化标签*/
                _self._checkNodes(data.tag_ids);
                if (data && data.open_course_tag_base_vos && data.open_course_tag_base_vos.length) {
                    var content = '', len = data.open_course_tag_base_vos.length;
                    if (len === 1) {
                        content = data.open_course_tag_base_vos[0].tag_name;
                        _self.model.labelContent(content);
                    } else {
                        $.each(data.open_course_tag_base_vos, function (i, n) {
                            if (i != len-1) {
                                content += (n.tag_name + '、');
                            } else {
                                content += n.tag_name;
                            }
                        })
                        _self.model.labelContent(content);
                    }
                }
                store.getMixOrgTree().done(function (treeData) {
                    _self.model.orgSettings['belong'].visibleType((+!!data.affiliated_org_node).toString());
                    _self.model.orgSettings['available'].visibleType(data.visible_config.toString());
                    _self._initOrgTree(treeData.manager, treeData.org_tree, [], "radio");
                });
            })
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
        findNodesByIds: function (all, ids) {
            return ids ? $.grep(all, function (v) {
                return ~$.inArray(v.node_id, ids);
            }) : [];
        },
        orgTreeSearch: function () {
            if (this.$searchOrg) {
                this.changeColor("node_name", this.$searchOrg.val());
            }
        },
        saveOrg: function () {
            if (this.orgTreeObj) this.model.orgSettings[this.model.orgInfo.nowType()].updateNodes(this.orgTreeObj.getCheckedNodes());
            this.$orgTreeModal.modal('hide');
        },
        cancelOrg: function () {
            if (this.orgTreeObj) this.model.orgSettings[this.model.orgInfo.nowType()].updateNodes([]);
            this.$orgTreeModal.modal('hide');
        },
        showOrgTree: function (type) {
            var orgInfo = this.model.orgInfo, orgTreeObj = this.orgTreeObj, orgSettings = this.model.orgSettings[type];
            if (orgTreeObj) {
                this._refreshTree(orgSettings.updateNodes().slice(), orgSettings.chkStyle());
            }
            orgInfo.nowType(type);
            if (!this.model.readonly()) {
                this.$orgTreeModal.modal('show');
            }
        },
        _refreshTree: function (updateNodes, chkStyle) {
            this._clearSearch();
            this.orgTreeObj.setting.check.chkStyle = chkStyle;
            this.orgTreeObj.checkAllNodes(false);
            this._checkOrgNode(updateNodes);
            this.orgTreeObj.refresh();
        },
        _clearSearch: function () {
            this.$searchOrg.val('');
            this.model.searchText('');
            this.changeColor("node_name", "")
        },
        _checkOrgNode: function (updateNodes) {
            var orgTreeObj = viewModel.orgTreeObj, orgTreeCheckNodes = updateNodes, j = orgTreeCheckNodes.length;
            if (viewModel && orgTreeCheckNodes) {
                var orgTreeNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes());
                for (var i = 0, len = orgTreeNodes.length; i < len; i++) {
                    var z = j, node = orgTreeNodes[i], noChecked = true;
                    while (z--) {
                        if (orgTreeCheckNodes[z].node_id === node.node_id) {
                            orgTreeObj.selectNode(node, false);
                            orgTreeObj.checkNode(node, true, false, false);
                            orgTreeObj.expandNode(node, true, false, true);
                            orgTreeCheckNodes.splice(z, 1);
                            j--;
                            noChecked = false;
                            break;
                        }
                    }
                    if (noChecked) {
                        orgTreeObj.checkNode(node, false, false, false);
                    }
                }
                orgTreeObj.cancelSelectedNode(orgTreeObj.getSelectedNodes()[0]);
            }
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
                        orgTreeObj.selectNode(node, false);
                        orgTreeObj.expandNode(node, true, false, false);
                        !matchNode && (matchNode = node);
                    } else {
                        node.highlight = false;
                        orgTreeObj.expandNode(node, false, false, false);
                    }
                }
                orgTreeObj.refresh();
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
        _setBodyScrollTop: function (id) {
            var $orgTreeModalBody = this.$orgTreeModalBody;
            $orgTreeModalBody.scrollTop(0);
            $orgTreeModalBody.scrollTop($('#' + id).position().top - this._getSearchFormH());
        },
        _getSearchFormH: (function () {
            var height = null;
            return function () {
                if (!height) {
                    height = $('#js-searchForm').outerHeight(true);
                }
                return height;
            }
        })(),
        _matchValue: function (match, value) {
            return (String(match).toLowerCase().indexOf(value) > -1);
        },
        _setCheckData: function (checkData, treeData) {
            if (checkData && checkData.length) {
                var checkArr = [];
                for (var i = 0, checkLen = checkData.length; i < checkLen; i++) {
                    for (var j = 0, treeLen = treeData.length; j < treeLen; j++) {
                        if (treeData[j].node_id === checkData[i]) {
                            checkArr.push(treeData[j]);
                            break;
                        }
                    }
                }
                this.orgTreeCheckNodes = checkArr;
                var orgTreeObj = viewModel.orgTreeObj;
                if (orgTreeObj) {
                    this._checkOrgNode();
                }
            }
        },
        _initOrgTree: function (managerData, treeData, checkData, chkStyle) {
            var _self = this, orgTreeObj, setting = {
                data: {
                    key: {
                        name: 'node_name',
                        title: 'node_name'
                    }
                },
                check: {
                    enable: true,
                    chkStyle: chkStyle,
                    chkboxType: {"Y": "", "N": ""},
                    radioType: "all",
                    chkDisabledInherit: this.model.readonly()
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
                this.$orgTreeModalBody = $('#js-orgTreeModalBody');
                orgTreeObj = this.orgTreeObj = $.fn.zTree.init((this.$orgTree = $("#js-orgTree")), setting, treeData);
                orgTreeObj.checkAllNodes(false);
                var allNodes = orgTreeObj.transformToArray(orgTreeObj.getNodes()), rootNode = allNodes[0];
                orgTreeObj.expandNode(rootNode, true, false, false);
                _self.model.orgSettings['belong'].updateNodes(_self.findNodesByIds(allNodes, _self.model.course.affiliated_org_node() ? [_self.model.course.affiliated_org_node()] : []));
                _self.model.orgSettings['available'].updateNodes(_self.findNodesByIds(allNodes, _self.model.course.org_node_ids()));
                /*此处判断用户权限，禁用用户不能选择的节点*/
                if (!managerData.has_manage_project) {
                    orgTreeObj.setChkDisabled(rootNode, true, false, true);
                    if (managerData.manager_nodes.length > 0) {
                        $.each(managerData.manager_nodes, function (i, v) {
                            var availableNode = orgTreeObj.getNodeByParam("node_id", v.node_id);
                            orgTreeObj.setChkDisabled(availableNode, false, false, true);
                        });
                    }
                }
                this.$searchOrg = $("#js-searchOrg").off('.orgTreeObj').on('keyup.orgTreeObj', function (e) {
                    if (e.keyCode === 13) _self.changeColor("node_name", _self.$searchOrg.val());
                });
                this._checkOrgNode(checkData);
            } else {
                $("#js-orgTreeModelBody").hide();
                $("#js-orgTreeModelBody2").text("请在项目中配置项目的UC组织");
            }
        },
        updateCourseInfo: function (data) {
            var belongOrg = this.model.orgSettings.belong, availableOrg = this.model.orgSettings.available, checkNode = null, postData = {
                pic_id: data.course.pic_id,
                description: data.course.description,
                title: data.course.title,
                course_status: data.course.course_status,
                user_suit: data.course.user_suit,
                tag_ids: data.course.tag_ids,
                summary: data.course.summary,
                visible_config: parseInt(availableOrg.visibleType())

            };
            if (belongOrg.visibleType() === '0') {
                postData.affiliated_org_node = -1;
            } else if (belongOrg.visibleType() === '1') {
                checkNode = belongOrg.updateNodes();
                if (checkNode.length) {
                    postData.affiliated_org_node = checkNode[0].node_id;
                } else {
                    $.fn.dialog2.helpers.alert('请选择所属组织！');
                    return;
                }
            }
            if (availableOrg.visibleType() === '0') {
                postData.org_node_ids = [];
            } else if (availableOrg.visibleType() === '1') {
                checkNode = availableOrg.updateNodes();
                if (checkNode.length) {
                    postData.org_node_ids = $.map(checkNode, function (item) {
                        return item.node_id;
                    });
                } else {
                    $.fn.dialog2.helpers.alert('请选择可见范围！');
                    return;
                }
            }
            store.updateCourse(postData).done(function () {
                $.fn.dialog2.helpers.confirm("编辑成功!", {
                    "confirm": function () {
                        window.parent.location.href = '/' + projectCode + "/admin/open_course/" + courseId + "/chapter?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                    },
                    "decline": function () {

                    },
                    buttonLabelYes: '设置章节信息',
                    buttonLabelNo: '关闭'
                });
            });
        },
        savePage: function () {
            var self = this;
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            if ($('#validateForm').valid()) {
                var postData = ko.mapping.toJS(self.model);
                postData.course.description = postData.course.description.replace(new RegExp("" + self.model.course.uploadInfo.server_url(), "gim"), '${cs_host}');
                if (courseId) {
                    self.updateCourseInfo(postData);
                }
                else {
                    self.createUnitCourse(postData);
                }
            }
        },
        backPage: function () {
            if (courseId) {
                window.parent.location = "/" + projectCode + "/admin/open_course/" + courseId + "?source=" + source + "&return_url=" + encodeURIComponent(return_url);
            } else {
                window.parent.location = "/" + projectCode + "/admin/open_course/manage?source=" + source + "&return_url=" + encodeURIComponent(return_url);
            }

        },
        //创建公开课课程
        createUnitCourse: function (data) {
            var belongOrg = this.model.orgSettings.belong, availableOrg = this.model.orgSettings.available, checkNode = null, postData = {
                pic_id: data.course.pic_id,
                description: data.course.description,
                title: data.course.title,
                course_status: 0,
                custom_type: custom_type,
                user_suit: data.course.user_suit,
                tag_ids: data.course.tag_ids,
                summary: data.course.summary,
                visible_config: parseInt(availableOrg.visibleType())
            };
            if (belongOrg.visibleType() === '0') {
                postData.affiliated_org_node = -1;
            } else if (belongOrg.visibleType() === '1') {
                checkNode = belongOrg.updateNodes();
                if (checkNode.length) {
                    postData.affiliated_org_node = checkNode[0].node_id
                } else {
                    $.fn.dialog2.helpers.alert('请选择所属组织！');
                    return;
                }
            }
            if (availableOrg.visibleType() === '0') {
                postData.org_node_ids = [];
            } else if (availableOrg.visibleType() === '1') {
                checkNode = availableOrg.updateNodes();
                if (checkNode.length) {
                    postData.org_node_ids = $.map(checkNode, function (item) {
                        return item.node_id;
                    });
                } else {
                    $.fn.dialog2.helpers.alert('请选择可见范围！');
                    return;
                }
            }
            store.createCourse(postData).done(function (returnData) {
                var courseId = returnData.id;
                $.fn.dialog2.helpers.confirm("创建成功!", {
                    "confirm": function () {
                        window.parent.location.href = '/' + projectCode + "/admin/open_course/" + courseId + "/chapter?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                    },
                    "decline": function () {
                        window.parent.location.href = "/" + projectCode + "/admin/open_course/manage?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                    },
                    "close": function () {
                        window.parent.location.href = "/" + projectCode + "/admin/open_course/manage?source=" + source + "&return_url=" + encodeURIComponent(return_url);
                    },
                    buttonLabelYes: '设置章节信息',
                    buttonLabelNo: '返回公开课列表'
                });
            });
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery);
