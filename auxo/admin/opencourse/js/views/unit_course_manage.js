;(function ($, window) {
    'use strict';
    // 数据仓库
    var store = {
        // 获取课程列表
        courseList: function (filter, project_id) {
            return $.ajax({
                url: (window.courseWebpage || '') + '/' + projectCode + '/courses/pools/search?project_id=' + project_id,
                data: filter,
                dataType: 'json',
                cache: false
            });
        },
        /*获取项目列表*/
        projectList: function () {
            return $.ajax({
                url: (window.courseWebpage || '') + '/' + projectCode + '/courses/auth_projects',
                dataType: 'json',
                cache: false
            });
        },
        //复制元课程
        copyCourse: function (id) {
            return $.ajax({
                url: (window.courseApiUrl || '') + '/v1/resource_course/actions/copy?source_id=' + id,
                dataType: 'json',
                type: 'POST',
            });
        },
        //实例化公开课
        createBatch: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/open_courses/batch?context_id=' + window.contextId,
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data)
            });
        },
    };
    var viewModel = {
        model: {
            filter: {
                page_no: 0, //当前页码
                page_size: 20, //分页大小
                name: '' //关键字搜索
            },
            sentCount: 0,
            isAllChecked: false, //是否全选
            projects: [],
            items: [], //数据列表
            selectItems: [], //选中的数据列表
            selectedProject: null
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.isAllChecked = ko.computed({
                write: function (val) {
                    this.model.selectItems(val ? this.model.items().slice(0) : []);
                },
                read: function () {
                    return this.model.items().length && (this.model.items().length === this.model.selectItems().length);
                },
                owner: this
            });
            //给下拉列表定义订阅函数
            this.model.selectedProject.subscribe(function (newValue) {
                var self = this;
                if (this.model.selectedProject()) {
                    this.model.filter.page_no(0);
                    this.loadCourseList();
                }
            }, this);
            ko.applyBindings(this, document.getElementById('js-content'));
            //加载项目列表
            this.loadProjectList();
        },
        saveSelect: function (ids) {
            var data = {
                'action': 'RESOURCE_SAVE',
                'data': {
                    'items': ids
                }
            };
            window.parent.postMessage(JSON.stringify(data), '*');
        },
        cancelSelect: function () {
            var data = {
                'action': 'RESOURCE_CANCEL',
                'data': {}
            };
            window.parent.postMessage(JSON.stringify(data), '*');
        },
        copyAndUse: function () {
            var self = this, sendArr = this.model.selectItems().concat(), unitCourseArr = [], openCourseArr = [];

            function exec() {
                var data = sendArr.pop();
                self.model.sentCount(self.model.selectItems().length - sendArr.length);
                if (data) {
                    $('#modalLoading').modal('show');
                    store.copyCourse(data.id).done(function (res) {
                        unitCourseArr.push(res);
                        if (self.model.selectedProject().project_id != window.projectId) {
                            store.createBatch([{id: res.id}]).done(function (op) {
                                openCourseArr = openCourseArr.concat(op);
                                exec();
                            }).fail(function () {
                                $('#modalLoading').modal('hide');
                            })
                        } else {
                            exec();
                        }
                    }).fail(function () {
                        $('#modalLoading').modal('hide');
                    })
                } else {
                    $('#modalLoading').modal('hide');
                    self.saveSelect($.map(openCourseArr, function (v) {
                        v.resource_id = v.id;
                        return v;
                    }));
                }
            }

            if (sendArr.length) {
                exec();
            }

        },
        useCourse: function () {
            var self = this, sendArr = this.model.selectItems().concat(), unitCourseArr = [], openCourseArr = [];

            function exec() {
                var data = sendArr.pop();
                self.model.sentCount(self.model.selectItems().length - sendArr.length);
                if (data) {
                    $('#modalLoading').modal('show');
                    store.createBatch([{id: data.id}]).done(function (op) {
                        openCourseArr = openCourseArr.concat(op);
                        exec();
                    }).fail(function () {
                        $('#modalLoading').modal('hide');
                    })
                } else {
                    $('#modalLoading').modal('hide');
                    self.saveSelect($.map(openCourseArr, function (v) {
                        v.resource_id = v.id;
                        return v;
                    }));
                }
            }

            if (sendArr.length) {
                exec();
            }
        },
        /**
         * 加载项目列表
         */
        loadProjectList: function () {
            var _self = this;
            store.projectList().done(function (res) {
                /*当得到项目列表时，下拉列表会默认显示列表中的第一个值，第一次触发订阅函数，因此不需要再次发送获取当前项目下课程列表的请求*/
                var projects = res || [];
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].project_id == window.projectId) {
                        var temp = projects[i];
                        projects.splice(i, 1);
                        projects.unshift(temp);
                        break;
                    }
                }
                _self.model.projects(projects);
            })
        },

        /**
         * 加载课程列表
         * @param  {boolean} isFirst 是否第一次加载
         * @return {promise} promise对象
         */
        loadCourseList: function (isFirst) {
            var _self = this,
                _filter = ko.mapping.toJS(this.model.filter);
            this.model.selectItems([]);
            store.courseList(_filter, _self.model.selectedProject().project_id)
                .done(function (data) {
                    _self.model.items(data.items);
                    _self._pagination(data.total);
                });
        },
        /**
         * 分页初始化
         * @param  {int} totalCount 总条数
         * @return {null}            null
         */
        _pagination: function (totalCount) {
            var _target = $('#pagination'), _filter = this.model.filter, _self = this;
            _target.pagination(totalCount, {
                items_per_page: _filter.page_size(),
                num_display_entries: 5,
                current_page: _filter.page_no(),
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (page_no) {
                    if (page_no != _filter.page_no()) {
                        _filter.page_no(page_no);
                        _self.loadCourseList();
                    }
                }
            });
        },
        /**
         * 课程搜索事件
         * @return {null} null
         */
        search: function () {
            this.model.filter.page_no(0);
            this.loadCourseList();
        },

    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
