;
(function ($, window) {
    'use strict';
    var store = {
        getExamScoreList: function (searchObj, exam_id) {
            return $.ajax({
                url: '/' + projectCode + '/exam_center/exams/' + exam_id + '/scores',
                cache: false,
                dataType: 'json',
                data: searchObj
            })
        }
    };
    var viewModel = {
        model: {
            examScoretList: {
                items: ko.observableArray([]),
                init: ko.observable(false)
            },
            search: {
                name: ko.observable(''),
                page: ko.observable(0),
                size: 10,
                pass_status: ko.observable('')
            },
            isFocus: ko.observable(false)
        },
        init: function () {
            if (examId) this.list();
            this.validate();
            ko.applyBindings(this, document.getElementById('js_examScore'));
        },
        search: function () {
            var errors = ko.validation.group(this.model.search);
            var name = $.trim(this.model.search.name());
            if (errors().length || !examId || !name.length) {
                return;
            }
            this.model.search.name(name);
            this.model.search.page(0);
            this.list();
        },
        list: function () {
            var search = ko.toJS(this.model.search),
                self = this;
            store.getExamScoreList(search, examId).done(function (data) {
                self.model.examScoretList.items(data.items);
                self.model.examScoretList.init(true);
                self.page(data.count, self.model.search.page());
            })
        },
        focusInput: function ($data, event) {
            this.model.isFocus(true);
        },
        page: function (totalCount, currentPage) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: self.model.search.size,
                num_display_entries: 5,
                current_page: currentPage,
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
        },
        validate: function () {
            var search = this.model.search;
            search.name.extend({
                maxLength: {params: 100, message: "不能超过100个字符"}
            });
        }
    };
    $(function () {
        viewModel.init();
    })
})(jQuery, window);