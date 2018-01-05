(function($, window) {
    var store = {
        printList: function(data) {
            var url = '/' + projectCode + '/printlogs/search';
            return $.ajax({
                url: url,
                data: data,
            });
        },
    };
    var viewModel = {
        model: {
            search: {
                size: 10,
                page: 0,
                certificate_id: cId,
                print_time_from: '',
                print_time_to: ''
            },
            items: []
        },
        //初始化事件
        init: function() {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('sendflow_js'));
            this._list();
            this._datePicker();
        },
        _list: function() {
            var t = this,
                _filter = this._dataEmptyFilter(ko.mapping.toJS(this.model.search));
            store.printList(_filter).done(function(returnData) {
                t.model.items(returnData.items);
                t._page(returnData.count, _filter.page);
                $('#sendflow_js').show();
            });
        },
        _dataEmptyFilter: function(obj) {
            var _obj = {};
            for (var k in obj) {
                if (obj.hasOwnProperty(k) && obj[k] !== '') {
                    _obj[k] = obj[k];
                }
            }
            return _obj;
        },
        formatDate: function(time) {
            return time.substr(0, 19).replace('T', ' ');
        },
        _datePicker: function() {
            var vm = this;
            // 初始化datepicker
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
            $('#history_begin_js').on('changeDate', function(e) {
                $('#history_end_js').datetimepicker('setStartDate', e.date);
                vm.model.search.print_time_from(e.date ? +e.date : '');
            });
            $('#history_end_js').on('changeDate', function(e) {
                $('#history_begin_js').datetimepicker('setEndDate', e.date);
                vm.model.search.print_time_to(e.date ? +e.date : '');
            });
        },
        search: function() {
            this.model.search.page(0);
            this._list();
        },
        _page: function(totalCount, currentPage) {
            var t = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: t.model.search.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function(page_id) {
                    if (page_id != currentPage) {
                        t.model.search.page(page_id);
                        t._list();
                    }
                }
            });
        }
    };
    $(function() {
        viewModel.init();
    });
})(jQuery, window);
