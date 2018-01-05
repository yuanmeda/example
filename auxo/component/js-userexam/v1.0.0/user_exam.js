/*!
 * 测评中心我的测评组件
 */
(function ($, window) {
    'use strict';
    function ExamModel(params) {
        var model = {
            exams: {
                items: [],
                init: false,
                count: {
                    total: 0,
                    underway: 0,
                    wait: 0,
                    end: 0
                }
            },
            search: {
                page: 0,
                size: 15,
                exam_status: undefined
            }
        };
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        // status改变事件
        //this.model.filter.status.subscribe(this._flashByStatus, this);
        // 数据仓库
        this.store = {
            getUserExamList: function (searchObj) {
                return $.ajax({
                    url: '/' + params.projectCode + '/auxo/exam_center/front/userexams/pages',
                    cache: false,
                    dataType: 'json',
                    data: searchObj
                });
            }
        };
        // 初始化动作
        this.init();
    }

    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    ExamModel.prototype = {
        init: function () {
            this.getAllExamsByStatus();
        },
        getAllExamsByStatus: function () {
            var self = this, search = ko.mapping.toJS(this.model.search);
            this.store.getUserExamList(search)
                .done(function (data) {
                    self.model.exams.init(true);
                    self.model.exams.count.total(data.count);
                    self.model.exams.items(data.items);
                    self.page(data.count, self.model.search.page());
                    self.store.getUserExamList({page: 0, size: 1, exam_status: 2})
                        .done(function (data) {
                            self.model.exams.count.underway(data.count);
                        });
                    self.store.getUserExamList({page: 0, size: 1, exam_status: 1})
                        .done(function (data) {
                            self.model.exams.count.wait(data.count);
                        });
                    self.store.getUserExamList({page: 0, size: 1, exam_status: 3})
                        .done(function (data) {
                            self.model.exams.count.end(data.count);
                        });
                });
        },
        toggleTab: function (examStatus) {
            this.model.search.exam_status(examStatus);
            this.model.search.page(0);
            this.list();
        },
        list: function () {
            var self = this,
                search = ko.mapping.toJS(this.model.search);
            self.store.getUserExamList(search).done(function (data) {
                self.model.exams.items(data.items);
                self.page(data.count, self.model.search.page());
                switch (search.exam_status) {
                    case 1:
                        self.model.exams.count.wait(data.count);
                        break;
                    case 2:
                        self.model.exams.count.underway(data.count);
                        break;
                    case 3:
                        self.model.exams.count.end(data.count);
                        break;
                    default :
                        self.model.exams.count.total(data.count);
                }
            });
        },
        formatDateTime: function ($data) {
            var html = '', timeArr;
            if ($data.status == '60' || $data.status == '70') {
                timeArr = $data.end_time ? $data.end_time.split('T') : '';
                html = $data.end_time ? timeArr[0] + ' ' + timeArr[1].substr(0, 5) + '<em class="ml">结束</em>' : '';
            } else {
                timeArr = $data.begin_time ? $data.begin_time.split('T') : '';
                html = timeArr[0] + ' ' + timeArr[1].substr(0, 5) + '<em class="ml">开始</em>';
            }
            return html;
        },
        disableBtn: function ($data) {
            var isDisable = -1;
            switch ($data.status) {
                case '50':
                case '70':
                    isDisable = 1;
                    break;
                case '60':
                    switch ($data.last_status) {
                        case 16:
                        case 101:
                            isDisable = 1;
                            break;
                        case 32:
                            isDisable = ($data.exam_chance - $data.exam_times <= 0) ? 1 : 0;
                            break;
                        default:
                            isDisable = 0;
                    }
                    break;
            }
            return isDisable;
        },
        userExamStatus: function ($data) {
            var txt = '';
            switch ($data.status) {
                case '50':
                    txt = '即将开始';
                    break;
                case '60':
                    switch ($data.last_status) {
                        case 8:
                        case 112:
                            txt = '继续考试';
                            break;
                        case 16:
                        case 101:
                            txt = '等待批改';
                            break;
                        case 32:
                            txt = ($data.exam_chance - $data.exam_times <= 0) ? '无考试机会' : '重新考试';
                            break;
                        default:
                            txt = '开始考试';
                    }
                    break;
                case '70':
                    txt = '已结束';
                    break;
            }
            return txt;
        },
        formatScore: function (score) {
            var value = 0;
            if (score) {
                return score.toFixed(1).replace(/.0$/, '');
            } else {
                return value;
            }
        },
        page: function (totalCount, currentPage) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: self.model.search.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageId) {
                    if (pageId != currentPage) {
                        self.model.search.page(pageId);
                        self.list();
                    }
                }
            });
        }
    };

    /**
     * 注册ko组件x-user-exam
     */
    ko.components.register('x-user-exam', {
        synchronous: true,
        viewModel: ExamModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
