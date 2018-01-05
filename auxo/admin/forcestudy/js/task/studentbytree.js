/**
 * @file 任务新建/编辑
 * @remark 非snake写法的属性字段都是与服务端无关的
 */

(function ($, window) {
    "use strict";
    var store = {
        /**
         * 获取人员部门的树结构(部门)
         *
         * @returns {*}
         */
        getDepartmentList: function () {
            return $.ajax({
                url: fs.API.FORCE_STUDY + 'departments/base_on_permission',
                type: "GET",
                dataType: "json"
            });
        },
        /**
         * 获取所属部门的学员集合（部门）
         *
         * @param orgCode
         * @returns {*}
         */
        getUserList: function (orgCode) {
            var data = {page_no: 0, page_size: 200000, org_code: orgCode};
            return $.ajax({
                url: fs.API.FORCE_STUDY + 'users/base_on_permission',
                type: "GET",
                data: data,
                dataType: "json"
            });
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
        },
        /**
         * 获取项目对象
         * @param workGroupId
         * @returns {*}
         */
        getWorkGroup: function (workGroupId) {
            return $.ajax({
                url: fs.API.FORCE_STUDY + 'workgroups/members?work_groupid=' + workGroupId,
                type: "GET",
                dataType: "json"
            });
        }
    };

    var viewModel = {
        /**
         * viewModel的数据对象
         *
         * @property addStudent 添加学员的对象
         */
        model: {
            addStudent: {
                selectCode: 0,
                studentType: "1",
                studentList: [],
                selectStudentList: [],
                ensureStudentList: [],
                departmentCount: 0 //提示判断
            }
        },
        /**
         * 数据与视图初始化
         */
        init: function () {
            var that = this;
            that.model = ko.mapping.fromJS(that.model);
            that.model.addStudent.studentType.subscribe(function (val) {
                if (val == "1") {
                    store.getDepartmentList()
                        .done(viewModel.initzTree)
                        .done(function(data){
                            if(!data)
                                viewModel.model.addStudent.departmentCount(0);
                            else
                                viewModel.model.addStudent.departmentCount(data.length);
                        });
                }
                else if (val == "2") {
                    store.getWorkGroupList().done(function (data) {
                        $.each(data, function (index, value) {
                            value.name = value.group_name;
                        });
                        viewModel.initzTree(data);
                    });
                }
            });
            that.model.addStudent.studentType.valueHasMutated();
            ko.applyBindings(this, $("#js_addstudent")[0]);
        },
        /**
         * 保存所选学员并关闭弹窗的点击事件
         *
         * @event
         */
        ensureStudent: function () {
            var that = viewModel.model;
            that.addStudent.ensureStudentList(that.addStudent.selectStudentList.peek().concat());
            that.addStudent.ensureStudentList = ko.observableArray([]);
            $("#js_addstudent").modal('hide');
        },
        /**
         * 树形的学员单位结构初始化
         */
        initzTree: function (data) {
            var setting = {
                view: {
                    selectedMulti: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    onClick: viewModel.nodeClick
                }

            };
            $.fn.zTree.init($("#js_ztree"), setting, data);
            viewModel.model.addStudent.studentList([]);
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
            var addStudent = viewModel.model.addStudent;
            if (addStudent.studentType.peek() == 1) {
                if (addStudent.selectCode.peek() == treeNode.OrgCode)
                    return;
                addStudent.selectCode(treeNode.OrgCode);
                store.getUserList(treeNode.OrgCode).done(function (data) {
                    $.each(data.items, function (i, v) {
                        v.checked = ko.observable(false);
                    });
                    addStudent.studentList(data.items);
                });
            }
            else if (addStudent.studentType.peek() == 2) {
                if (addStudent.selectCode.peek() == treeNode.id)
                    return;
                addStudent.selectCode(treeNode.id);
                store.getWorkGroup(treeNode.id).done(function (data) {
                    $.each(data, function (i, v) {
                        v.checked = ko.observable(false);
                    });
                    addStudent.studentList(data);
                });
            }
        }
    };
    $(function () {
        viewModel.init();
    });
    window.studentViewModel = viewModel;
})(jQuery, window);
