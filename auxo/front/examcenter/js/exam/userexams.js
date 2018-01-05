;(function ($, window) {
    'use strict';
    var store = {
        getUserExamList: function (searchObj) {
            return $.ajax({
                url: selfUrl + '/' + projectCode + '/exam_center/user_exams',
                cache: false,
                dataType: 'json',
                data: searchObj
            });
        }
    };
    var viewModel = {
        model: {
            exams: {
                items: ko.observableArray([]),
                init: ko.observable(false),
                count: {
                    total: ko.observable(0),
                    underway: ko.observable(0),
                    wait: ko.observable(0),
                    end: ko.observable(0)
                }
            },
            search: {
                page: ko.observable(0),
                size: 15,
                exam_status: ko.observable(undefined)
            }
        },
        init: function () {
            this.getAllExamsByStatus();
            ko.applyBindings(this, document.getElementById('js_userexams'));
        },
        getAllExamsByStatus: function () {
            var self = this;
            store.getUserExamList({page: 0, size: 15})
                .done(function (data) {
                    self.model.exams.init(true);
                    self.model.exams.count.total(data.count);
                    self.model.exams.items(data.items);
                    self.page(data.count, self.model.search.page());
                    store.getUserExamList({page: 0, size: 15, exam_status: 2})
                        .done(function (data) {
                            self.model.exams.count.underway(data.count);
                        });
                    store.getUserExamList({page: 0, size: 15, exam_status: 1})
                        .done(function (data) {
                            self.model.exams.count.wait(data.count);
                        });
                    store.getUserExamList({page: 0, size: 15, exam_status: 3})
                        .done(function (data) {
                            self.model.exams.count.end(data.count);
                        });
                });
        },
        status: function (examStatus) {
            this.model.search.exam_status(examStatus);
            this.model.search.page(0);
            this.list();
        },
        list: function () {
            var self = this,
                search = ko.toJS(this.model.search);
            store.getUserExamList(search).done(function (data) {
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
            var html = '';
            if ($data.status == '60' || $data.status == '70') {
                html = $data.end_time ? Utils.formatDate($data.end_time) + '<em class="ml">结束</em>' : '';
            } else {
                html = Utils.formatDate($data.begin_time) + '<em class="ml">开始</em>';
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
                items_per_page: self.model.search.size,
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
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
