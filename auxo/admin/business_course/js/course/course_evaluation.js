; (function ($) {
    "use strict";
    var store = {
        getCourseEvaluations: function (limit, pageNo) {
            var url = '/v1/business_courses/' + courseId + '/users?need_progress=true&limit=' + limit + '&offset=' + pageNo;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'GET'
            });
        },
        getCourseInfo: function () {
            var url = '/v1/business_courses/' + courseId;
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'GET'
            });
        },
        updateCourseEvaluationProgress: function (progress, comment, user_id) {
            var url = window.elearning_business_service_url + '/v1/users/' + user_id + '/business_courses/' + courseId + '/actions/manual_progress';
            var data = {};
            if(progress >= 0) {
                data.manual_progress = progress;
            }
            if(comment) {
                data.comment = comment;
            }

            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                data: JSON.stringify(data),
                type: 'PUT'
            });
        },
        // 批量导出
        exportUser: function (url) {
            return window.open(url);
        },
    }

    var courseEvaluationSchema = {
        "user_info": {
            "user_id": 0,
            "name": "string",
            "real_name": "string",
            "code": "string",
            "node_id": 0,
            "node_name": "string",
            "org_id": 0,
            "org_name": "string",
        },
        "progress": {
            "progress_percent": 0,
            "status": 0,
            "pass_status": 0,
            "evaluate_time": "",
            "total_period": 0,
            "comment": ""
        }
    }

    var viewModel = {
        model: {
            isLoading: false,
            isLoadingText: "导出",
            mode: '', // 课程模式 编辑(edit)和设置(set) 来区分上传的时候应该上传哪个课程进度
            courseName: '', // 课程名称
            courseProgress: '',  // 课程学习进度
            courseEvaluationArr: [],
            currentCourseEvaluation: JSON.parse(JSON.stringify(courseEvaluationSchema)),
            currentCourseEvaluationIndex: '',
            options: {
                user_id_str: '',
                pass_status: ''
            },
            filter: {
                pageNo: 0,
                pageSize: 20
            }
        },
        init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(self, document.getElementById('course_evaluation'))
            this.list();
        },
        list: function () {
            var pageNo = this.model.filter.pageNo(),
                pageSize = this.model.filter.pageSize();
            $.when(store.getCourseEvaluations(pageSize, pageNo), store.getCourseInfo()).done($.proxy(function (courseEvaluationRes, courseInfoRes) {
                this.model.courseName(courseInfoRes[0].title);
                this.model.courseEvaluationArr(courseEvaluationRes[0].items);

                var currentPage = Math.ceil(pageNo * pageSize / courseEvaluationRes[0].total);
                this.page(courseEvaluationRes[0].total, currentPage, pageSize)
            }, this));
        },
        editCourseEvaluation: function (index, mode) {
            var i = index();
            var courseEvaluationArr = ko.toJS(this.model.courseEvaluationArr);

            var item = courseEvaluationArr[i];

            this.model.currentCourseEvaluation.user_info.user_id(item.user_info.user_id);
            this.model.currentCourseEvaluation.user_info.name(item.user_info.name);
            this.model.currentCourseEvaluation.user_info.real_name(item.user_info.real_name);
            this.model.currentCourseEvaluation.user_info.code(item.user_info.code);
            this.model.currentCourseEvaluation.user_info.node_id(item.user_info.node_id);
            this.model.currentCourseEvaluation.user_info.node_name(item.user_info.node_name);
            this.model.currentCourseEvaluation.user_info.org_id(item.user_info.org_id);
            this.model.currentCourseEvaluation.user_info.org_name(item.user_info.org_name);

            if (item.progress) {
                this.model.currentCourseEvaluation.progress.progress_percent(item.progress.progress_percent);
                this.model.currentCourseEvaluation.progress.status(item.progress.status);
                this.model.currentCourseEvaluation.progress.pass_status(item.progress.pass_status);
                this.model.currentCourseEvaluation.progress.comment(item.progress.comment);
                this.model.currentCourseEvaluation.progress.total_period(item.progress.total_period);
            }

            this.model.currentCourseEvaluationIndex(i);
            this.model.mode(mode)
            $('#courseEvaluationModal').modal('show');
        },
        /**
         *导出功能
         *
         */
        _doExport: function () {
            var url = businessCourseGatewayUrl + '/' + projectCode + "/admin/course/" + courseId + "/users/export";
            window.open(url)
        },
        updateCourseEvaluationProgress: function () {
            /*
            *  1. 学习进度100之后， 不能更改
            *  2. 学习进度非100. 评论必填
            *  3. 评论任何时候，都可以更改
            */ 
            var mode = this.model.mode();
            var currentCourseEvaluation = ko.mapping.toJS(this.model.currentCourseEvaluation)
            var currentCourseEvaluationIndex = this.model.currentCourseEvaluationIndex();
            var oldProgress = currentCourseEvaluation.progress.progress_percent;
            var newProgress = this.model.courseProgress();
            var comment = currentCourseEvaluation.progress.comment;
            var user_id = currentCourseEvaluation.user_info.user_id;
           
            if(oldProgress!=100&&!newProgress) {
                $.fn.dialog2.helpers.alert("学习进度不能为空");
                return
            }

            if (newProgress != 100 && !comment) {
                $.fn.dialog2.helpers.alert("学习进度不是100%，备注必填！");
                return;
            }

            if (comment.length >= 50) {
                $.fn.dialog2.helpers.alert("备注长度不能超过50");
                return; 
            }

            if(oldProgress==100) {
                // 已经是100了，就不让更改了
                newProgress = 100;
            }

            store.updateCourseEvaluationProgress(parseInt(newProgress), comment, user_id).done($.proxy(function () {
                this.list();
                this.model.courseProgress('');
                $('#courseEvaluationModal').modal('hide');
            }, this))

        },
        page: function (totalCount, currentPage, pageSize) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: pageSize,
                current_page: currentPage,
                num_display_entries: 5,
                is_show_total: true,
                is_show_input: true,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        self.model.filter.pageIndex(page_id);
                        self.list();
                    }
                }
            });
        },
        conditionQuery: function () {
            var options = ko.toJS(viewModel.model.options);
            return store.getCourseEvaluations(options);
        }
    };
    $(function () {
        viewModel.init();
    });
    $(".form_datetimepicker").datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language: 'zh-CN',
        autoclose: true
    });
})(jQuery);
