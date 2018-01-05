; (function ($) {
    "use strict";
    var store = {
        getCourse: function () {
            var url = '/v1/open_courses/' + courseId;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json'
            });
        },
        updateCourse: function (data) {
            var url = '/v1/open_courses/' + courseId;
            return $.ajax({
                url: url,
                contentType: 'application/json',
                data: JSON.stringify(data),
                type: 'PUT'
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
            var url = '/v1/tags/tree?custom_type=auxo-open-course';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        getRequiredObj: function () {
            var url = '/v1/open_courses/' + courseId + '/require_objects';
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
        $userTreeModal: $('#js-userTreeModal'),
        $chznSelect: null,
        $orgTreeModalBody: null,
        $orgTree: null,
        orgTreeCheckNodes: [],
        model: {
            course: {
                title: "",
                visible_config: 0,//可见配置 0:全部可见 1:组织内部可见
                org_node_ids: [], //可见组织标识列表
                affiliated_org_node: -1, //所属组织节点 无所属传-1
                tag_ids: [], //标签标识
                open_course_tag_base_vos: [],
                required: false,
                required_user_type: null,
                required_user_nodes: [],
                required_org_nodes: []
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
                require: {
                    updateNodes: [],
                    orgSelectedText: '',
                    visibleType: '0',
                    chkStyle: 'radio'
                },
                requiredUser: {
                    updateNodes: [],
                    orgSelectedText: '',
                    visibleType: '1',
                    chkStyle: 'radio'
                }
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
            readonly: false,
            treePattern: 0
        },
        //页面初始化
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);

            $.when(store.getCourse(), store.getTree(), store.getRequiredObj())
                .done(function (courses, trees, requiredObjs) {
                    var course = courses[0];
                    var tree = trees[0];
                    var requiredObjs = requiredObjs[0];
                    if (tree && tree.children && tree.children.length) {
                        _self._initTree(tree, (course && course.tag_ids) || []);
                    }
                    if (course) {
                        _self._initCourseInfo(course, requiredObjs);
                    }
                });
            this.model.readonly.subscribe(function (readonly) {
                var ztreeObject = _self.treeObj;
                if (ztreeObject) {
                    if (readonly) {
                        $.each(ztreeObject.getNodes(), function (index, singlenode) {
                            var node = ztreeObject.getNodeByParam("id", singlenode.id);
                            ztreeObject.setChkDisabled(node, true, false, true);
                        });
                    } else {
                        $.each(ztreeObject.getNodes(), function (index, singlenode) {
                            var node = ztreeObject.getNodeByParam("id", singlenode.id);
                            ztreeObject.setChkDisabled(node, false, false, true);
                        });
                    }
                }

            });
        },
        _initTree: function (data, selectedIds) {
            var _self = this, setting = {
                data: {
                    key: {
                        name: 'title',
                        title: 'title'
                    }
                },
                check: {
                    enable: true,
                    chkboxType: { "Y": "", "N": "" },
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
            var ztreeObject = _self.treeObj = $.fn.zTree.init($('#J_Tree'), setting, data.children);
            if (selectedIds && Array.isArray(selectedIds) && selectedIds.length) {
                selectedIds.forEach(function (item) {
                    var node = ztreeObject.getNodeByParam('id', item);
                    if (node) {
                        ztreeObject.checkNode(node, true, false, false);
                    }
                });
            }
            $.each(ztreeObject.getNodes(), function (index, singlenode) {
                var node = ztreeObject.getNodeByParam("id", singlenode.id);
                ztreeObject.setChkDisabled(node, false, false, true);
            });
            _self.treeObj.expandAll(true);
        },
        _checkNodes: function (ids) {
            if (ids && Array.isArray(ids) && ids.length > 0) {
                var treeObj = viewModel.treeObj;
                ids.forEach(function (item) {
                    var node = treeObj.getNodeByParam('id', item);
                    if (node) {
                        treeObj.checkNode(node, true, false, false);
                    }
                });
            }
        },
        backPage: function () {
            window.parent.location.href = '/' + projectCode + "/admin/open_course/" + courseId + "/advanced_setting?source=" + source + "&return_url=" + encodeURIComponent(return_url);
        },
        toEdit: function () {
            this.model.readonly(false);
        },
        _initCourseInfo: function (data, requiredObjs) {
            var _self = this, _course = this.model.course;
            _course.title(data.title);
            _course.tag_ids(data.tag_ids);
            _course.open_course_tag_base_vos(data.open_course_tag_base_vos);
            _course.visible_config(data.visible_config);
            _course.org_node_ids(data.org_node_ids);
            _course.affiliated_org_node(data.affiliated_org_node);

            _course.required(data.required);
            _course.required_user_type(data.required_user_type);
            if (data.required_user_type === 2) {
                var requireUserList = _self._initUserList(requiredObjs);
                _course.required_user_nodes(requireUserList || []);
            }
            data.required_user_type === 3 && _course.required_org_nodes(data.required_user_json && data.required_user_json.length > 0 && JSON.parse(data.required_user_json));

            /*初始化标签*/
            // _self._checkNodes(data.tag_ids);
            if (data && data.open_course_tag_base_vos && data.open_course_tag_base_vos.length) {
                var content = '', len = data.open_course_tag_base_vos.length;
                if (len === 1) {
                    content = data.open_course_tag_base_vos[0].tag_name;
                    _self.model.labelContent(content);
                } else {
                    $.each(data.open_course_tag_base_vos, function (i, n) {
                        if (i != len - 1) {
                            content += (n.tag_name + '、');
                        } else {
                            content += n.tag_name;
                        }
                    });
                    _self.model.labelContent(content);
                }
            }


            this.model.orgSettings['belong'].visibleType((+!!data.affiliated_org_node).toString());
            this.model.orgSettings['available'].visibleType(data.visible_config.toString());
            this.model.orgSettings['require'].visibleType((+!!data.required).toString());
            this.model.orgSettings['requiredUser'].visibleType((+(data.required_user_type || 1)).toString());

            store.getMixOrgTree().done(function (treeData) {
                var manager = treeData.manager || {};
                _self.mTreeOpts = {
                    readonly: _self.model.readonly,
                    nodeIds: _self.model.course.org_node_ids,
                    orgId: orgId,
                    multiple: true,
                    projectCode: projectCode,
                    host1: '/v1/open_courses',
                    host2: elearningServiceUri,
                    visible: true,
                    managerNodes: manager.manager_nodes,
                    hasManager: manager.has_manage_project,
                    initData: treeData.org_tree
                }
                _self.sTreeOpts = $.extend({}, _self.mTreeOpts, {
                    nodeIds: _self.model.course.affiliated_org_node,
                    multiple: false
                })
                _self.rTreeOpts = $.extend({}, _self.mTreeOpts, {
                    nodeIds: _self.model.course.required_org_nodes
                })
                _self.uTreeOpts = {
                    readonly: _self.model.readonly,
                    orgId: orgId,
                    selectedList: _self.model.course.required_user_nodes,
                    config: {
                        projectCode: projectCode,
                        host: '',
                        userHost: '',
                        version: 'v1',
                        userVersion: 'v0.93',
                        initData: treeData.org_tree,
                        avatarPath: CSAvatarPath
                    }
                }
                ko.applyBindings(_self, document.getElementById("js_content"));
            });
        },
        _initUserList: function (requiredObjs) {
            return requiredObjs.filter(function (item) {
                return item.type === 2;
            }).map(function (item) {
                return {
                    user_id: item.require_object_id,
                    'org.real_name': item.open_course_require_object_facade.title,
                    'org.pic': item.require_object_id
                }
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
        saveOrg: function () {
            if (this.orgTreeObj) this.model.orgSettings[this.model.orgInfo.nowType()].updateNodes(this.orgTreeObj.getCheckedNodes());
            this.$orgTreeModal.modal('hide');
        },
        showOrgTree: function (type) {
            this.model.treePattern(type);
            this.$orgTreeModal.modal('show');
        },
        showUserTree: function () {
            this.$userTreeModal.modal('show');
        },
        _matchValue: function (match, value) {
            return (String(match).toLowerCase().indexOf(value) > -1);
        },
        updateCourseInfo: function (data) {
            var self = this;
            var belongOrg = this.model.orgSettings.belong, availableOrg = this.model.orgSettings.available,
                isRequire = !!parseInt(this.model.orgSettings.require.visibleType()),
                requiredUserOrg = this.model.orgSettings.requiredUser,
                checkNode = null, postData = {
                    title: data.course.title,
                    tag_ids: data.course.tag_ids,
                    visible_config: parseInt(availableOrg.visibleType()),
                    affiliated_org_node: this.model.course.affiliated_org_node(),
                    org_node_ids: this.model.course.org_node_ids(),
                    required: isRequire,
                    required_user_type: (isRequire && parseInt(requiredUserOrg.visibleType())) || null,
                    required_user_json: null
                };
            if (belongOrg.visibleType() === '0') {
                postData.affiliated_org_node = -1;
            } else if (belongOrg.visibleType() === '1') {
                if (!~postData.affiliated_org_node) {
                    $.fn.dialog2.helpers.alert('请选择所属组织！');
                    return;
                }
            }
            if (availableOrg.visibleType() === '0') {
                postData.org_node_ids = [];
            } else if (availableOrg.visibleType() === '1') {
                if (!postData.org_node_ids.length) {
                    $.fn.dialog2.helpers.alert('请选择可见范围！');
                    return;
                }
            }
            if (isRequire) {
                if (requiredUserOrg.visibleType() === '1') {
                    postData.required_user_json = null;
                } else if (requiredUserOrg.visibleType() === '2') {
                    if (!this.model.course.required_user_nodes().length) {
                        $.fn.dialog2.helpers.alert('请选择必修对象！');
                        return;
                    } else {
                        var requireUserList = this.model.course.required_user_nodes().map(function (item) {
                            return item.user_id;
                        });
                        postData.required_user_json = JSON.stringify(requireUserList);
                    }
                } else if (requiredUserOrg.visibleType() === '3') {
                    if (!this.model.course.required_org_nodes().length) {
                        $.fn.dialog2.helpers.alert('请选择必修对象！');
                        return;
                    } else {
                        postData.required_user_json = JSON.stringify(this.model.course.required_org_nodes());
                    }
                }
            }
            store.updateCourse(postData).done(function () {
                $.fn.dialog2.helpers.alert("编辑成功!");
            });
        },
        savePage: function () {
            var self = this;
            if ($('#validateForm').valid()) {
                var postData = ko.mapping.toJS(self.model);
                self.updateCourseInfo(postData);
            }
        },
        removeRequiredUser: function (removeItem, index) {
            var requiredUserList = this.model.course.required_user_nodes();
            requiredUserList.splice(index, 1);
            this.model.course.required_user_nodes(requiredUserList);
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery);
