(function ($, window) {

    //数据仓库
    var store = {
        getList: function (filter) {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/paper_answer';
            return commonJS._ajaxHandler(url, filter);
        }
    };

    var viewModel = {
        keyword: ko.observable(''),
        model: {
            items: [],
            filter: {
                pageSize: 20,
                pageIndex: 0,
                sortword: ''
            },
            style: 'table'//列表显示风格
        },
        items: [],
        init: function () {
            var self = viewModel;
            $.extend(this, commonJS);
            this.model = ko.mapping.fromJS(self.model);
            ko.applyBindings(this);

            $(document).trigger('remove_class', ['.main', 'hidden']);

            this.list();
        },
        list: function () {
            var self = this,
                filter = self.model.filter,
                searchData = "page=" + filter.pageIndex() +
                    "&size=" + filter.pageSize();
            store.getList(searchData)
                .done(function (data) {
                    if (data == null)
                        self.items = [];
                    else
                        self.items = data.items;
                    self.model.items(self.items);
                    self.page(data.count, filter.pageIndex(), filter.pageSize());
                });
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
        mark: function (sessionId, $data) {
            location.href = '/' + projectCode + "/exam/mark/paper?exam_id=" + examId + "&session_id=" + sessionId + '&location=' + $data.paper_location;
        },
        showDetail: function (sessionId, $data) {
            location.href = '/' + projectCode + "/exam/mark/detail?exam_id=" + examId + "&session_id=" + sessionId + '&location=' + $data.paper_location;
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);