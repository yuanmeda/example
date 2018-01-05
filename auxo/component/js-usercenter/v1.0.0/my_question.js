/*!
 * 我的答疑组件
 */
(function ($, window) {
    'use strict';

    function MyQuestionModel(params) {
        var model = {
            totalCount: 0,
            items: [],
            userInfo: {
                userLogo: '',
                userName: ''
            },
            filter: {
                keyword: '',
                type: 1,
                page_no: 0,
                page_size: 10
            },
            lastKeyword: '',
            loadComplete: false
        };
        this.model = ko.mapping.fromJS(model);
        this.params = params;
        this.store = {
            list: function (search) {
                return $.ajax({
                    url: '/' + params.projectCode + '/mystudy/questions',
                    type: 'GET',
                    dataType: 'json',
                    data: search,
                    cache: false
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
    MyQuestionModel.prototype = {
        init: function () {
            var self = this;
            this.list();
        },
        list: function (noFresh) {
            var self = this;
            var search = ko.mapping.toJS(this.model.filter);
            if (!noFresh) {
                this.model.totalCount(0);
                this.model.items([]);
                this.page(0, 0);
            }
            this.model.loadComplete(false);
            this.store.list(search).done(function (data) {
                self.model.lastKeyword(search.keyword);
                self.model.totalCount(data.count);
                self.model.items(data.items);
                self.page(data.count, self.model.filter.page_no());
            })
                .always(function () {
                    self.model.loadComplete(true);
                });
        },
        search: function () {
            this.model.filter.page_no(0);
            this.list();
        },
        enterSwitch: function (searchType, binds, evt) {
            if (!$.trim(this.model.filter.keyword())) {
                return;
            }
            if (evt.keyCode === 13) {
                this.tabSwitch(searchType);
                evt.target.blur();
            }
        },
        tabSwitch: function (searchType) {
            this.model.filter.type(searchType);
            this.model.filter.page_no(0);
            this.list(searchType == 5);
        },
        page: function (totalCount, currentPage) {
            var self = this;
            $("#pagination").pagination(totalCount, {
                items_per_page: self.model.filter.page_size(),
                num_display_entries: 5,
                current_page: self.model.filter.page_no(),
                is_show_total: false,
                is_show_input: true,
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (pageNum) {
                    if (pageNum != self.model.filter.page_no()) {
                        self.model.items([]);
                        self.model.filter.page_no(pageNum);
                        self.list(true);
                    }
                }
            });
        },
        formatDateTime: function (time) {
            return time ? time.split('T')[0] + ' ' + time.split('T')[1].substr(0, 5) : '';
        },
        openCourseDetail: function ($data) {
            var url = (typeof courseFrontUrl=='undefined'?'':courseFrontUrl) + '/' + this.params.projectCode + '/course/' + $data.custom_id;
            var el = document.createElement("a");
            document.body.appendChild(el);
            el.href = url;
            el.target = '_blank';
            el.click();
            document.body.removeChild(el);
        },
        stringFormat: function (str) {
            return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/[\r\n]/g, '<br/>').replace(/\s/g, '&nbsp;');
        },
        avatar_error: function (binds, e) {
            e.target.src = defaultAvatar;
        }
    };

    /**
     * 注册ko组件x-my-question
     */
    ko.components.register('x-my-question', {
        synchronous: true,
        viewModel: MyQuestionModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})(jQuery, window);
