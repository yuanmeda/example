/*!
 * 我的测评组件
 */
(function($, window) {
    'use strict';

    function MyExamModel(params) {
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
                status: '',
                group_name: 'exam_group'
            },
            loadComplete: false
        };
        // 数据模型
        this.model = ko.mapping.fromJS(model);
        this.uris = gaea_js_properties || {};
        this.uris.mystudy_mooc_exam_web_url= myStudyMoocWebUrl;
        // 数据仓库
        this.store = {
            getUserExamList: function(searchObj) {
                return $.ajax({
                    url: gaea_js_properties.auxo_mystudy_url + '/v2/users/' + userId + '/studies',
                    cache: false,
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
    MyExamModel.prototype = {
        init: function() {
            this.getExams(true);
        },
        getExams: function(first) {
            var self = this,
                search = ko.mapping.toJS(this.model.search);
            this.model.loadComplete(false);
            this.store.getUserExamList(search)
                .done(function(data) {
                    self.model.exams.init(true);
                    self.model.exams.items(data.items);
                    self.page(data.count, self.model.search.page());
                    if (!first) {
                        return;
                    }
                    self.model.exams.count.total(data.count);
                    self.store.getUserExamList({
                            page: 0,
                            size: 1,
                            status: 1,
                            group_name: 'exam_group'
                        })
                        .done(function(data) {
                            self.model.exams.count.underway(data.count);
                        });
                    self.store.getUserExamList({
                            page: 0,
                            size: 1,
                            status: 0,
                            group_name: 'exam_group'
                        })
                        .done(function(data) {
                            self.model.exams.count.wait(data.count);
                        });
                    self.store.getUserExamList({
                            page: 0,
                            size: 1,
                            status: 2,
                            group_name: 'exam_group'
                        })
                        .done(function(data) {
                            self.model.exams.count.end(data.count);
                        });
                })
                .always(function() {
                    self.model.loadComplete(true);
                });
        },
        toggleTab: function(status) {
            this.model.search.status(status);
            this.model.search.page(0);
            this.model.exams.items([]);
            this.getExams();
        },
        page: function(totalCount, currentPage) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: self.model.search.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function(pageId) {
                    if (pageId != currentPage) {
                        self.model.exams.items([]);
                        self.model.search.page(pageId);
                        self.getExams();
                    }
                }
            });
        }
    };

    /**
     * 注册ko组件x-user-exam
     */
    ko.components.register('x-my-exam', {
        synchronous: true,
        viewModel: MyExamModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
