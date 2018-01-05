(function ($, window) {
	
    //数据仓库
    var store = {
        search: function (filter) {
            var url = '/' + projectCode + '/v1/exams/mark/pages';
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
            style:'table'//列表显示风格
        },
        items: [],
        init: function () {
            var self = viewModel;
            $.extend(this, commonJS);
            this.model = ko.mapping.fromJS(self.model);
            ko.applyBindings(this);

            $(document).trigger('remove_class', ['.main', 'hidden']);

            this.list();
            this.keyword.subscribe($.proxy(function (newValue) {
                if (!newValue) {
                    this.model.filter.pageIndex(0);
                    this.list();
                }
            }, this));
        },
        list: function () {
            var self = this,
                filter = self.model.filter,
                searchData = "page=" + filter.pageIndex() +
                            "&size=" + filter.pageSize() +
                            "&orderby=" + filter.sortword() +
                            "&title=" + encodeURIComponent(self.keyword());
            store.search(searchData)
            .done(function (data) {
                if (data == null)
                    self.items = [];
                else
                    self.items = data.items;
                self.model.items(self.items);
                self.page(data.count, filter.pageIndex(), filter.pageSize());
            });
        },
        queryAction: function () {
            this.model.filter.pageIndex(0);
            this.list();
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
        markByPaper: function (id) {
            location.href = '/' + projectCode + "/exam/mark/exam?exam_id=" + id;
        },
        markByQuestion: function (id) {
        	
        }
    }

    $(function () {
        viewModel.init();
    });

})(jQuery, window)