(function (window, $) {
    var store = {
        search: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/' + specialtyId + '/user/search',
                data: data
            });
        }
    };
    var viewModel = {
        model: {
            filter: {
                enroll_time_begin: '',
                enroll_time_end: '',
                page: 0,
                size: 5
            },
            items: []
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this._datePicker();
            this.list();
        },
        _datePicker: function () {
            var vm = this;
            $('.datepicker_js').datetimepicker({
                autoclose: true,
                clearBtn: true,
                format: 'yyyy-mm-dd',
                minView: 2,
                todayHighlight: 1,
                language: 'zh-CN',
                minuteStep: 10
            });
            // 搜索时间规则
            $('#send_begin_js').on('changeDate', function (e) {
                $('#send_end_js').datetimepicker('setStartDate', e.date);
                vm.model.filter.enroll_time_begin(e.date ? +e.date : '');
            });
            $('#send_end_js').on('changeDate', function (e) {
                $('#send_begin_js').datetimepicker('setEndDate', e.date);
                vm.model.filter.enroll_time_end(e.date ? +e.date : '');
            });
        },
        list: function () {
            var t = this;
            store.search(ko.mapping.toJS(this.model.filter)).then(function (returnData) {
                var items = returnData.items;
                t.model.items(items);
                t.pagination(returnData.total, t.model.filter.page());
            });
        },
        search: function () {
            this.model.filter.page(0);
            this.list();
        },
        pagination: function (total, currentPage) {
            var that = this;
            $('#pagination').pagination(total, {
                items_per_page: that.model.filter.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        that.model.filter.page(pageNum);
                        that.list();
                    }
                }
            });
        }
    };

    $(function () {
        viewModel.init();
    });
})(window, jQuery);