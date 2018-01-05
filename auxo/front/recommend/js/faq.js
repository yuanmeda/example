;
(function ($) {
    //数据仓库
    var store = {
        //获取问题和回答
        getQuestions: function (data) {
            var url = (window.selfUrl || '') + '/' + projectCode + '/recommends/faq?page=' + data.page + "&size=" + data.size + "&custom_type=" + data.custom_type + "&question_type=" + data.question_type;
            return commonJS._ajaxHandler(url, null, 'get');
        }
    };

    //数据模型
    var viewModel = {
        model: {
            title: '',
            search: {
                page: 0,
                size: 20,
                custom_type: customType,
                question_type: questionType
            },
            questions: [],
            init: false
        },
        init: function () {
            $.extend(this, commonJS);

            this.model = ko.mapping.fromJS(this.model);
            this.list();

            ko.applyBindings(this, document.getElementById('faqList'));

            // $("#test").faqButton({staticUrl:staticUrl,languageCode:"en-US"});
        },
        list: function () {
            var self = this;
            var title;
            if (questionType == 0) {
                title = i18n.faq.courseDescription;
            } else {
                title = i18n.faq.commonQuestions;
            }
            self.model.title(title);
            var params = ko.mapping.toJS(self.model.search);
            store.getQuestions(params).done(function (data) {
                self.model.questions(data.items);
                self.model.init(true);
                self.page(data.count, params.page);
            });
        },
        page: function (totalCount, currentPage) {
            var that = viewModel;
            $('#pagination').pagination(totalCount, {
                items_per_page: that.model.search.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        that.model.search.page(page_id);
                        that.list();
                    }
                }
            });
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery);
