/**
 * @file 任务新建/编辑
 * @remark 非snake写法的属性字段都是与服务端无关的
 */

(function ($) {
    "use strict";
    var store = {
        /**
         * 获取项目对象
         *
         * @param workGroupId
         */
        get: function (workGroupId) {
            return $.ajax({
                url: fs.API.forceStudy("workgroups/{workGroupId}/members", {workGroupId: workGroupId}),
                type: "GET",
                dataType: "json"
            });
        },
        /**
         * 保存项目对象
         *
         * @param data
         * @returns {*}
         */
        save: function (data) {
            return $.ajax({
                url: fs.API.FORCE_STUDY + "workgroups",
                type: data.id ? "PUT" : "POST",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data)
            })
        },
        /**
         * 删除项目对象
         *
         * @param id
         * @returns {*}
         */
        deleteWorkGroup: function (id) {
            return $.ajax({
                url: fs.API.forceStudy("workgroups/{work_groupid}", {work_groupid: id}),
                type: "DELETE",
                dataType: "json"
            })
        },
        /**
         * 获取项目列表
         * @returns {*}
         */
        getWorkGroupList: function () {
            return $.ajax({
                url: fs.API.FORCE_STUDY + 'workgroups/search',
                type: "GET",
                dataType: "json"
            });
        }
    };

    var viewModel = {
        /**
         * viewModel的数据对象
         *
         * @property info 项目组对象
         */
        model: {
            info: {
                id: "",
                group_name: "",
                enabled: 1,
                create_user_id: 123,
                user_list: []
            }
        },
        /**
         * json数据缓存
         *
         * @property selectId 当前选中节点
         * @property ztree 缓存树对象
         * @property ztreeData 缓存项目组的数据
         */
        cacheData: {
            selectId: "",
            ztree: null,
            ztreeData: []
        },
        /**
         * 表单数据的验证
         */
        observableValidate: function () {
            var that = this;
            ko.validation.rules["minArrayLength"] = {
                validator: function (arr, minLength) {
                    if (!arr || typeof arr !== "object" || !(arr instanceof Array)) {
                        throw "对象类型错误";
                    }
                    return arr.length >= minLength;
                },
                message: "数据验证错误"
            };
            ko.validation.rules['remoteGroupName'] = {
                /*async: true,
                validator: function (val, parms, callback) {
                    $.ajax({
                        url: '/auxo/forcestudy/admin/workgroup/allowworkgroupsave',
                        dataType: "json",
                        data: {work_groupid: viewModel.model.info.id(), work_groupname: val},
                        success: function (bl) {
                            callback(bl);
                        }
                    });
                },
                message: '远程数据验证错误'*/
                validator: function (val) {
                    var ztreeData = viewModel.cacheData.ztreeData,
                        info = viewModel.model.info,
                        bl = true;
                    if (!ztreeData || ztreeData.length == 0)
                        return true;
                    $.each(ztreeData, function (i, v) {
                        if (val == v.group_name && info.id.peek() != v.id) {
                            bl = false;
                            return;
                        }
                    });
                    return bl;
                },
                message: "数据验证错误"
            };
            ko.validation.registerExtenders();

            that.model.info.group_name.extend({
                required: {params: true, message: "请输入项目名称"},
                maxLength: {params: 100, message: "项目名称不能大于{0}字"},
                remoteGroupName: {message: "项目名称重复"}
            });
            that.model.info.user_list.extend({
                minArrayLength: {
                    params: 1,
                    message: "请选择学员"
                }
            });

            that.model.validatedInfo = ko.validatedObservable(that.model.info, {
                observable: true,
                live: true,
                deep: true
            });
        },
        /**
         * 数据与视图初始化
         */
        init: function () {
            ko.options.deferUpdates = true;//启用全局延更
            var that = this;
            that.model = ko.mapping.fromJS(that.model);
            that.observableValidate();
            ko.applyBindings(this, $("#js_editworkgroup")[0]);
            viewModel.getWorkGroupList();
        },
        /**
         * 获取项目组列表
         */
        getWorkGroupList: function () {
            store.getWorkGroupList().done(function (data) {
                $.each(data, function (index, value) {
                    value.name = value.group_name;
                });
                viewModel.cacheData.ztreeData = data;
                viewModel.initzTree(data);
                if (!viewModel.cacheData.selectId)
                    return;
                var nodes = viewModel.cacheData.ztree.getNodesByParam("id", viewModel.cacheData.selectId);
                if (nodes.length > 0)
                    viewModel.cacheData.ztree.selectNode(nodes[0]);
            });
        },
        /**
         * 新增项目组
         */
        AddWorkGroup: function () {
            viewModel.cacheData.ztree.checkAllNodes(false);
            viewModel.model.info.id("");
            viewModel.model.info.group_name("");
            viewModel.model.info.enabled(1);
            viewModel.model.info.create_user_id(123);
            viewModel.model.info.user_list([]);
            viewModel.cacheData.selectId = "";
        },
        /**
         * 树形的学员单位结构初始化
         *
         * @param data
         */
        initzTree: function (data) {
            var setting = {
                edit: {
                    enable: true,
                    showRenameBtn: false
                },
                view: {
                    selectedMulti: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    onClick: viewModel.nodeClick,
                    beforeRemove: viewModel.removeClick
                }

            };
            var ztreeNode = $("#js_ztreeworkgroup");
            viewModel.cacheData.ztree = $.fn.zTree.init(ztreeNode, setting, data);
        },
        /**
         * 树节点的点击事件
         *
         * @event
         * @param event 点击事件的event对象
         * @param treeId 树节点id
         * @param treeNode 树节点对象
         */
        nodeClick: function (event, treeId, treeNode) {
            var model = viewModel.model, cacheData = viewModel.cacheData;
            if (cacheData.selectId == treeNode.id)
                return;
            cacheData.selectId = treeNode.id;
            store.get(treeNode.id).done(function (data) {
                viewModel.model.info.id(treeNode.id);
                viewModel.model.info.group_name(treeNode.group_name);
                viewModel.model.info.enabled(treeNode.enabled);
                viewModel.model.info.create_user_id(treeNode.create_user_id);
                $.each(data, function (index, value) {
                    value.checked = ko.observable(false);
                });
                viewModel.model.info.user_list(data);
                viewModel.cacheData.selectId = treeNode.id;
            });
        },
        /**
         *删除树节点的点击事件
         *
         * @param treeId 树节点id
         * @param treeNode 树节点对象
         */
        removeClick: function (treeId, treeNode) {
            var deleteNode = treeNode;
            $.fn.dialog2.helpers.confirm("确定删除项目:(" + treeNode.group_name + ")?", {
                confirm: function () {
                    store.deleteWorkGroup(treeNode.id).done(function () {
                        viewModel.cacheData.ztree.removeNode(deleteNode);
                        if (viewModel.cacheData.selectId == treeNode.id)
                            viewModel.AddWorkGroup();
                    })
                }
            });
            return false;
        },
        /**
         * 打开添加学员弹窗的点击事件
         *
         * @event
         */
        showStudent: function () {
            var addStudent = window.studentViewModel.model.addStudent,
                userList = viewModel.model.info.user_list;
            addStudent.selectStudentList(userList.peek().concat());
            addStudent.ensureStudentList = userList;
            $("#js_addstudent").modal('show');
        },
        /**
         * 保存所选学员并关闭弹窗的点击事件
         *
         * @event
         */
        ensureStudent: function () {
            $("#js_addstudent").modal('hide');
        },
        /**
         * 保存项目组对象
         */
        save: function () {
            var that = viewModel;
            if (!that.model.validatedInfo.isValid()) {
                that.model.validatedInfo.errors.showAllMessages();
                return;
            }
            var jsonInfo = ko.mapping.toJS(that.model.info);
            store.save(jsonInfo).done(function (data) {
                if (!jsonInfo.id) {
                    viewModel.model.info.id(data);
                    viewModel.cacheData.selectId = data;
                }
                viewModel.getWorkGroupList();
                $.fn.dialog2.helpers.alert('保存成功');

                if(!window.opener || !window.opener.initWorkGroupzTree)
                    return;
                window.opener.initWorkGroupzTree();
            })
        }
    };
    $(function () {
        viewModel.init();
    })
})
(jQuery);
