/**
 * @file 任务新建/编辑
 * @remark 非snake写法的属性字段都是与服务端无关的
 */

(function ($) {
    "use strict";

    /**
     * 通用工具类
     */
    var commonTool = {
        /**
         * ko的大数据量将就setTimeout优化，仅为视觉
         *
         * @returns {Function}
         */
        bindOptimize: function () {
            var timer,
                koObj,
                array,
                timerMethod = function () {
                    if (array.length >= 50) {
                        koObj(koObj.peek().concat(array.splice(0, 50)));
                        timer = setTimeout(timerMethod, 100);
                    }
                    else {
                        koObj(koObj.peek().concat(array));
                        $("body").cover("hide");
                    }
                };

            return function (koObject, data) {
                clearTimeout(timer);
                koObj = koObject;
                array = data;
                if (array.length > 1000) {
                    setTimeout(function () {
                        $("body").cover("大数据处理中...");
                    }, 500);
                    koObj([]);
                    timerMethod();
                }
                else {
                    koObj(array);
                }
            }
        },
        /**
         * 获取时间的time值
         *
         * @param dateStr
         * @returns {number}
         */
        getDataTime: function (dateStr) {
            if (dateStr.length < 11)
                dateStr += " 00:00:00";
            return new Date(dateStr.replace(/-/g, '/')).getTime();
        }
    };

    var store = {
        /**
         * 获取任务对象
         *
         * @returns {*}
         */
        get: function () {
            return $.ajax({
                url: fs.API.forceStudy("tasks/{task_id}", {task_id: task_id}),
                type: "GET",
                dataType: "json"
            });
        },
        /**
         * 保存任务对象
         *
         * @param data
         * @returns {*}
         */
        save: function (data) {
            return $.ajax({
                url: fs.API.FORCE_STUDY + "tasks",
                type: data.id ? "PUT" : "POST",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data)
            })
        },

        /**
         * 获取人员部门的树结构
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
         * 获取所属部门的学员集合
         *
         * @param orgCode
         * @returns {*}
         */
        getUserList: function (orgCode) {
            var data = {page_no: 0, page_size: 200000, org_code: orgCode};
            return $.ajax({
                url: fs.API.FORCE_STUDY + 'users/base_on_permission',
                type: "GET",
                dataType: "json",
                data: data
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
         *
         * @param workGroupId
         * @returns {*}
         */
        getWorkGroup: function (workGroupId) {
            return $.ajax({
                url: fs.API.forceStudy("workgroups/{workGroupId}/members", {workGroupId: workGroupId}),
                type: "GET",
                dataType: "json"
            });
        },
        /**
         * 获取职级列表
         *
         * @returns {*}
         */
        getJobLevels: function () {
            return $.ajax({
                url: fs.API.FORCE_STUDY + 'joblevels',
                type: "GET",
                dataType: "json"
            });
        },
        /**
         * 获取职级的学员列表
         *
         * @returns {*}
         */
        getUserByJobLevel: function (jobLevel) {
            return $.ajax({
                url: fs.API.FORCE_STUDY + 'joblevels/users/base_on_permission',
                type: "GET",
                dataType: "json",
                data: {job_level: jobLevel}
            });
        }
    };

    var viewModel = {
        /**
         * viewModel的数据对象
         *
         * @property addStudent 添加学员的对象
         * @property validatedInfo info对象的数据验证对象
         * @property info 任务对象
         */
        model: {
            addStudent: {
                selectCode: "",
                studentType: "1",
                studentList: [],
                selectStudentList: [],
                departmentCount: 0 //提示判断
            },
            validatedInfo: {},
            info: {
                id: task_id,
                task_workgroup_id: "",
                task_workgroup_name: "",
                task_joblevel_name: "",
                task_status: 2,

                task_type: 1,
                title: "",
                require_type: 1,
                time_limit_type: 2,
                time_limit_begin: "",
                time_limit_end: "",
                study_order_type: 2,
                study_freq: 2,
                work_day: 1,
                everytime_study_mins: 5,//单位秒
                description: "",
                studentLimit: "true",
                user_list: [],
                task_details_list: [],
                isTaskStart: false,
                workGroupList: [],
                JobLevelList: []
            },
            course: {
                type: 0     // 0-公开课，1-培训认证
            }
        },
        /**
         * json数据缓存
         *
         * @property taskWorkgroupId 编辑时初始化，临时存放任务对象的taskWorkgroupId值
         * @property taskJoblevelName 编辑时初始化，临时存放任务对象的taskJoblevelName值
         */
        cache: {
            taskWorkgroupId: null,
            taskJoblevelName: null
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
            ko.validation.rules["endDateLimit"] = {
                validator: function (val) {
                    var begin = viewModel.model.info.time_limit_begin.peek();
                    if (!val || !begin)
                        return true;

                    var endDate = commonTool.getDataTime(val);
                    return endDate >= commonTool.getDataTime(begin) && (endDate - 1000 * 60 * 60 * 24) >= date;
                },
                message: "数据验证错误"
            };
            ko.validation.rules["everytimeStudyMins"] = {
                validator: function (val, length) {
                    if (!val)
                        return true;
                    return val <= length;
                },
                message: "数据验证错误"
            };
            ko.validation.registerExtenders();

            that.model.info.title.extend({
                required: {params: true, message: "请输入任务名称"},
                maxLength: {params: 100, message: "任务名称不能大于{0}字"}
            });
            that.model.info.task_details_list.extend({
                minArrayLength: {params: 1, message: "请添加课程或培训"}
            });
            that.model.info.everytime_study_mins.extend({
                required: {params: true, message: "请输入学习分钟"},
                pattern: {params: '^\\d+$', message: "请输入非负整数"},
                min: {params: 0, message: "自定义时间不小于{0}分钟"},
                max: {
                    params: 60,
                    message: "每日学习自定义时间不超过{0}分钟",
                    onlyIf: function () {
                        return that.model.info.study_freq() == 2;
                    }
                },
                everytimeStudyMins: {
                    params: 180,
                    message: "每周学习自定义时间不超过{0}分钟",
                    onlyIf: function () {
                        return that.model.info.study_freq() == 3;
                    }
                }
            });
            that.model.info.description.extend({
                required: {params: true, message: "请输入任务描述"},
                maxLength: {params: 15000, message: "任务名称不能大于{0}字"}
            });
            that.model.info.time_limit_begin.extend({
                required: {
                    params: true,
                    message: "请输入任务开始时间",
                    onlyIf: function () {
                        return that.model.info.time_limit_type() == 2;
                    }
                }
            });
            that.model.info.time_limit_end.extend({
                required: {
                    params: true,
                    message: "请输入任务结束时间",
                    onlyIf: function () {
                        return that.model.info.time_limit_type() == 2;
                    }
                },
                endDateLimit: {message: "结束时间不能小于开始时间且必须大于今天"}
            });
            that.model.info.user_list.extend({
                minArrayLength: {
                    params: 1,
                    message: "请选择学员",
                    onlyIf: function () {
                        return that.model.info.studentLimit() == "true";
                    }
                }
            });

            that.model.info.task_workgroup_id.extend({
                required: {
                    params: true,
                    message: "请选择项目推送条件",
                    onlyIf: function () {
                        return that.model.info.task_type.peek() == 2 && that.model.info.studentLimit.peek() == "false";
                    }
                }
            });

            that.model.info.task_joblevel_name.extend({
                required: {
                    params: true,
                    message: "请选择职级推送条件",
                    onlyIf: function () {
                        return that.model.info.task_type.peek() == 3 && that.model.info.studentLimit.peek() == "false";
                    }
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
            $("#js_timelimitbegin, #js_timelimitend").datetimepicker({
                language: 'zh-CN',
                todayBtn: true,
                autoclose: true,
                todayHighlight: true,
                format: 'yyyy-mm-dd',
                minView: "month",
                pickerPosition: "bottom-left"
            });
            that.model = ko.mapping.fromJS(that.model);
            that.model.info.task_type.subscribe(function (val) {
                if (!val)
                    return;
                this.model.addStudent.studentType(val.toString());
                that.model.info.task_workgroup_id.valueHasMutated();
                that.model.info.task_joblevel_name.valueHasMutated();
            }, that);
            that.model.info.study_freq.subscribe(function (val) {
                if (val == 1)
                    that.model.info.everytime_study_mins(0);
            }, that);
            that.model.addStudent.studentType.subscribe(function (val) {
                if (!val)
                    return;
                if (val == 1) {
                    viewModel.initDepartmentzTree();
                }
                else if (val == 2) {
                    viewModel.initWorkGroupzTree();
                }
                else if (val == 3) {
                    viewModel.initJobLevelzTree();
                }
                this.model.addStudent.selectCode("");
            }, that);
            that.model.addStudent.studentType.valueHasMutated();

            this.model.course.type.subscribe(function (value) {
                that.fixedCourseData(window['selectedCourse'], value);
            }, null, 'beforeChange');
            this.model.course.type.subscribe(function () {
                that.switchCourseType();
            });
            //触发选择学员的鸟验证
            that.model.info.studentLimit.subscribe(function (val) {
                if (val == "false") {
                    //this.model.info.user_list([]);
                }
                else {
                    this.model.info.task_workgroup_id("");
                    this.model.info.task_joblevel_name("");
                }
                that.model.info.task_workgroup_id.valueHasMutated();
                that.model.info.task_joblevel_name.valueHasMutated();
            }, that);

            that.model.info.time_limit_begin.subscribe(function (val) {
                var timeLimitEnd = that.model.info.time_limit_end;
                if (!timeLimitEnd.peek())
                    return;
                timeLimitEnd.valueHasMutated();
            }, that);
            that.observableValidate();
            ko.applyBindings(this, $("#js_taskedit")[0]);
            if (that.model.info.id.peek().length > 0) {
                that.getInfo();
            }
        },
        /**
         * 获取任务对象。id不为空时
         */
        getInfo: function () {
            store.get().done(function (data) {
                if (data.task_type == 1
                    || (data.task_type == 2 && !data.task_workgroup_id)
                    || (data.task_type == 3 && !data.task_joblevel_name)) {
                    data.studentLimit = "true";
                }
                else {
                    data.studentLimit = "false";
                }
                if (data.time_limit_begin != null && data.time_limit_begin.length > 10)
                    data.time_limit_begin = data.time_limit_begin.substring(0, 10);
                if (data.time_limit_end != null && data.time_limit_end.length > 10)
                    data.time_limit_end = data.time_limit_end.substring(0, 10);
                data.everytime_study_mins = data.everytime_study_mins / 60;

                var list = data.user_list;
                $.each(list, function (i, v) {
                    v.checked = ko.observable(false);
                });
                data.user_list = [];
                ko.mapping.fromJS({info: data}, viewModel.model);
                viewModel.cache.taskWorkgroupId = data.task_workgroup_id;
                viewModel.cache.taskJoblevelName = data.task_joblevel_name;
                viewModel.model.info.user_list(list);

                var info = viewModel.model.info,
                    timeLimitType = info.time_limit_type.peek(),
                    bl = true;
                if (timeLimitType == 2 && info.time_limit_begin.peek() != null) {
                    var currentDate = commonTool.getDataTime(info.time_limit_begin.peek());
                    bl = currentDate <= date;
                }
                info.isTaskStart(bl);
                if (bl)
                    $('#js_timelimitbegin').datetimepicker('remove');
            });
        },
        /**
         * 课程/培训列表的上移操作
         *
         * @event
         * @param $index
         * @param $data
         */
        moveUp: function ($index, $data) {
            if ($index == 0)
                return;
            var list = viewModel.model.info.task_details_list;
            list.splice($index, 1);
            list.splice($index - 1, 0, $data);
        },
        /**
         * 课程/培训列表的下移操作
         *
         * @event
         * @param $index
         * @param $data
         */
        moveDown: function ($index, $data) {
            var list = viewModel.model.info.task_details_list;
            if ($index == list.length - 1)
                return;
            list.splice($index, 1);
            list.splice($index + 1, 0, $data);
        },
        /**
         * 课程/培训列表的删除操作
         *
         * @event
         * @param $data
         */
        remove: function ($data) {
            viewModel.model.info.task_details_list.remove($data);
        },
        /**
         * 保存任务的点击事件
         *
         * @event
         */
        save: function () {
            var that = viewModel;
            if (!that.model.validatedInfo.isValid()) {
                that.model.validatedInfo.errors.showAllMessages();
                return;
            }

            var jsonInfo = ko.mapping.toJS(that.model.info);
            jsonInfo.everytime_study_mins = jsonInfo.everytime_study_mins * 60;

            // 处理课程数据
            $.each(jsonInfo.task_details_list || [], function (i, v) {
                v.exam_count = 0;
                v.course_hours = 0;
                v.course_count = 0;
                if (!v.object_id) {
                    v.object_id = v.id;
                }
                v.object_cover_url = v.image_url;

                delete v.id;
                delete v.title;
                delete v.image_url;
            });
            store.save(jsonInfo).done(function (data) {
                if (!that.model.info.id.peek())
                    that.model.info.id(data);

                var timeLimitType = viewModel.model.info.time_limit_type.peek(), bl = true;
                if (timeLimitType == 2) {
                    var currentDate = commonTool.getDataTime(viewModel.model.info.time_limit_begin.peek());
                    bl = currentDate <= date;
                }
                viewModel.model.info.isTaskStart(bl);
                if (bl)
                    $('#js_timelimitbegin').datetimepicker('remove');
                $.fn.dialog2.helpers.alert('保存成功');
            });
        },
        /**
         * 打开添加课程弹窗的点击事件
         *
         * @event
         */
        showCourse: function () {
            window['selectedCourse'] = this.model.info.task_details_list.peek().concat();
            viewModel.switchCourseType();
            $("#js_addcourse").modal('show');
        },
        /**
         * 切换课程类型
         */
        switchCourseType: function () {
            var url = [  '/' + projectCode + '/open_course?options=true',  '/' + projectCode + '/train/modal?options=true'][this.model.course.type()];
            $('#courseIframe').removeAttr('src').attr('src', url);
        },
        /**
         * 调整课程数据对象
         * @param selectedCourse
         * @param courseType
         */
        fixedCourseData: function (selectedCourse, courseType) {
            $.each(selectedCourse || [], function (i, v) {
                if (v.object_type === undefined) {
                    v.object_type = courseType;
                }
                if (v.object_name === undefined) {
                    v.object_name = v.title;
                }
            });
        },
        /**
         * 保存所选课程并关闭弹窗的点击事件
         *
         * @event
         */
        ensureCourse: function () {
            var that = viewModel.model;
            this.fixedCourseData(window['selectedCourse'], this.model.course.type.peek());
            that.info.task_details_list((window['selectedCourse'] || []).concat());
            delete window['selectedCourse'];
            $('#courseIframe').removeAttr('src');
            $("#js_addcourse").modal('hide');
        },
        /**
         * 打开添加学员弹窗的点击事件
         *
         * @event
         */
        showStudent: function () {
            var that = viewModel.model;
            that.addStudent.selectStudentList(that.info.user_list.peek().concat());
            $("#js_addstudent").modal('show');
        },
        /**
         * 保存所选学员并关闭弹窗的点击事件
         *
         * @event
         */
        ensureStudent: function () {
            var that = viewModel.model;
            that.info.user_list(that.addStudent.selectStudentList.peek().concat());
            $("#js_addstudent").modal('hide');
        },
        /**
         * 树形的学员单位结构初始化
         */
        initDepartmentzTree: (function () {
            var departmentData;
            return function () {
                if (!departmentData) {
                    store.getDepartmentList().done(function (data) {
                        departmentData = data;
                        viewModel.initzTree(data);
                        if (!departmentData)
                            viewModel.model.addStudent.departmentCount(0);
                        else
                            viewModel.model.addStudent.departmentCount(departmentData.length);

                    });
                }
                else {
                    viewModel.initzTree(departmentData);
                    viewModel.model.addStudent.departmentCount(departmentData.length);
                }
            };
        }()),
        /**
         * 树形的学员项目组结构初始化
         */
        initWorkGroupzTree: function () {
            store.getWorkGroupList().done(function (data) {
                $.each(data, function (index, value) {
                    value.name = value.group_name;
                });
                viewModel.initzTree(data);
                viewModel.model.info.workGroupList(data);
                if (!viewModel.cache.taskWorkgroupId)
                    return;
                viewModel.model.info.task_workgroup_id(viewModel.cache.taskWorkgroupId);
                viewModel.cache.taskWorkgroupId = null;
            });
        },
        /**
         * 树形的职级结构初始化
         */
        initJobLevelzTree: (function () {
            var jobLevelData;
            return function () {
                if (!jobLevelData) {
                    store.getJobLevels().done(function (data) {
                        var list = [], obj;
                        $.each(data, function (index, value) {
                            obj = {id: value, name: value};
                            list.push(obj);
                        });
                        jobLevelData = list;
                        viewModel.initzTree(list);
                        viewModel.model.info.JobLevelList(list);
                        if (!viewModel.cache.taskJoblevelName)
                            return;
                        viewModel.model.info.task_joblevel_name(viewModel.cache.taskJoblevelName);
                        viewModel.cache.taskJoblevelName = null;
                    });
                } else {
                    viewModel.initzTree(jobLevelData);
                    viewModel.model.info.JobLevelList(jobLevelData);
                }
            }
        }()),
        /**
         * 树控件初始化
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
        nodeClick: (function () {
            var cacheData = {},
                func = function (id, mode, fn) {
                    var addStudent = viewModel.model.addStudent;
                    if (addStudent.selectCode.peek() == id)
                        return;
                    addStudent.selectCode(id);
                    if (!cacheData[id]) {
                        fn(id).done(function (data) {
                            if (!data) {
                                data = [];
                                if (mode == 1) {
                                    data = {items: []};
                                }
                            }
                            if (mode == 1)
                                data = data.items;
                            $.each(data, function (i, v) {
                                v.checked = ko.observable(false);
                            });
                            if (mode != 2) {//项目组这鸟编辑会变
                                cacheData[id] = data;
                            }
                            viewModel.setStudentList(addStudent.studentList, data.slice(0));
                        });
                    } else {
                        viewModel.setStudentList(addStudent.studentList, cacheData[id].slice(0));
                    }
                };
            return function (event, treeId, treeNode) {
                var addStudent = viewModel.model.addStudent;
                if (addStudent.studentType.peek() == 1) {
                    func(treeNode.OrgCode, 1, $.proxy(store.getUserList, store));
                } else if (addStudent.studentType.peek() == 2) {
                    func(treeNode.id, 2, $.proxy(store.getWorkGroup, store));
                } else if (addStudent.studentType.peek() == 3) {
                    func(treeNode.id, 3, $.proxy(store.getUserByJobLevel, store));
                }
            }

        }()),
        /**
         *大数据量时的学员赋值ko优化
         */
        setStudentList: commonTool.bindOptimize(),
        /**
         * 添加课程/培训的查询列表分页功能
         *
         * @param totalCount
         * @param pageIndex
         * @param pageSize
         */
        page: function (totalCount, pageIndex, pageSize) {
            var self = this;
            $("#js_pagination").pagination(totalCount, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: pageIndex,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != pageIndex) {
                        self.model.search.page_no(index);
                        self.searchCourse();
                    }
                }
            });
        },
        /**
         * 显示导入用户Modal
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        showImportUser: function () {
            $("#importUserModal").modal("show");
        },
        /**
         * 导入用户
         * @return {[type]} [description]
         */
        importUser: function () {
            var that = this;
            $("body").cover();
            $.ajaxFileUpload({
                url: "/" + projectCode + fs.API.FORCE_STUDY + "tasks/viewimport",
                secureuri: false,
                fileElementId: 'userFile',
                dataType: 'json',
                data: {
                    task_id: task_id
                },
                success: function (response, status) {
                    var ret = [];
                    $.each(response.success_list, function (i, v) {
                        if (v) {
                            ret.push({
                                account: v.account || v,
                                logo: "",
                                realname: v.realname || v,
                                user_id: v.user_id || v,
                                checked: ko.observable(false)
                            });
                        }
                    });
                    that.model.info.user_list(that.model.info.user_list().concat(ret));
                    $.alert({
                        title: "导入结果",
                        content: "成功导入" + ret.length + "条数据<br />" + (!response.error_list.length ? "" :
                        "失败：<br /><div class='fail-box'>" + response.error_list.join("、") + "</div>"),
                        confirmButton: "确定"
                    });
                    $("#importUserModal").modal("hide");
                    $("body").uncover();
                },
                error: function (data, status, e) {
                    $.alert({
                        title: "导入失败",
                        content: data.responseText || "",
                        confirmButton: "确定"
                    });
                    $("body").uncover();
                }
            });
        }
    };
    $(function () {
        viewModel.init();
        window.initWorkGroupzTree = viewModel.initWorkGroupzTree;
        window["viewModel"] = viewModel;
    })
})
(jQuery);
