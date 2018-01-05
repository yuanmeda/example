;(function ($) {
    "use strict";
    var store = {
        createCourse: function (data) {
            var url = '/' + projectCode + '/open_courses';
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
            var url = '/' + projectCode + '/open_courses/orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        getMixOrgTree: function () {
            var url = '/' + projectCode + '/open_courses/manage_orgs';
            return $.ajax({
                url: url,
                dataType: 'json',
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
                affiliated_org_node: null,
                affiliated_org_root: null,
                visible_config: 0,
                org_node_ids: [],
                summary: "",
                tag_ids: [],
                open_course_tag_base_vos: [],
                uploadInfo: {
                    path: '',
                    server_url: '',
                    service_id: '',
                    session: ''
                },
                context_id: context_id || ''
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
            searchText: '',
            readonly: !!window.readonly,
            treePattern: 0
        },
        //页面初始化
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            $.each(['belong', 'available'], function (i, v) {
                _self.model.orgSettings[v].orgSelectedText = ko.computed(function () {
                    var visibleType = this.model.orgSettings[v].visibleType(), updateNodes = this.model.orgSettings[v].updateNodes();
                    return visibleType == '0' ? "请选择要开放的部门" : (updateNodes.length > 0 ? '已选' + updateNodes[0].node_name + '等' + updateNodes.length + '个部门' : '点击查看或选择组织');
                }, _self);
            });
            store.getMixOrgTree().done(function (treeData) {
                var manager = treeData.manager || {};
                _self.mTreeOpts = {
                    readonly: _self.model.readonly,
                    nodeIds: _self.model.course.org_node_ids,
                    orgId: orgId,
                    multiple:true,
                    projectCode: projectCode,
                    host1: '/' + projectCode + '/open_courses/',
                    host2: elearningServiceUri,
                    visible: true,
                    managerNodes: manager.manager_nodes,
                    hasManager: manager.has_manage_project,
                    initData:treeData.org_tree
                } 
                _self.sTreeOpts = $.extend({},_self.mTreeOpts,{
                    nodeIds: _self.model.course.affiliated_org_node,
                    multiple:false
                })
                ko.applyBindings(_self, document.getElementById("js_content"));
            });
            
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
        showOrgTree: function (type) {
             this.model.treePattern(type);
            this.$orgTreeModal.modal('show');
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
                visible_config: data.course.visible_config,

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
                        window.parent.location.href = '/' + projectCode + "/open_course/" + courseId + "/chapter";
                    },
                    "decline": function () {
                        window.parent.location.href = "/" + projectCode + "/open_course/manage"
                    },
                    "close": function () {
                        window.parent.location.href = "/" + projectCode + "/open_course/manage"
                    },
                    buttonLabelYes: '设置章节信息',
                    buttonLabelNo: '返回公开课列表'
                });
            });
        },
        savePage: function () {
            var self = this;
            if ($('#validateForm').valid()) {
                var postData = ko.mapping.toJS(self.model);
                self.createUnitCourse(postData);
            }
        },
        backPage: function () {
            if (return_url) {
                window.location.href = return_url;
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
                visible_config: data.course.visible_config,
                context_id: data.course.context_id,
                affiliated_org_node : data.course.affiliated_org_node,
                org_node_ids: data.course.org_node_ids
            };
            var return_url = decodeURIComponent(this.getQueryStringByName('return_url'));
            store.createCourse(postData).done(function (returnData) {
                var courseId = returnData.id;
                if (return_url) {
                    var hasParams = return_url.indexOf('?') >= 0;
                    window.location.href = return_url + (hasParams ? '&' : '?') + 'id=' + courseId;
                }
            });
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery);
