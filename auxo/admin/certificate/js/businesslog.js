(function($, window) {
    var store = {
        //获取初始化列表
        businessLogList: function(data) {
            var url = '/' + projectCode + '/businesslogs/search';
            return $.ajax({
                url: url,
                data: data,
                type: 'GET'
            });
        },
        getModuleList: function(data) {
            var url = '/' + projectCode + '/businesslogs/module' ;
            return $.ajax({
                url: url,
                data: data,
                type: 'GET'
            });
        }
    };
    var viewModel = {
        model: {
            search: {
                size: 10,
                page: 0,
                module: '',
                user_name: ''
            },
            dataList: [],
            modules:[]
        },
        //初始化事件
        init: function() {
            var t = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('boot'));
            this._list();
            store.getModuleList().done(function (data) {
                var objs = [{
                    value: '',
                    title: '全部'
                }];
                for (var i = 0;i<data.length;i++) {
                    var obj = {
                        value: data[i],
                        title: data[i]
                    };
                    objs.push(obj);
                }
               t.model.modules(objs);
            })


        },
        _list: function() {
            var t = this,
                _filter = ko.mapping.toJS(this.model.search);
            store.businessLogList(_filter).done(function(returnData) {
                t.model.dataList(returnData.items);
                t._page(returnData.count, _filter.page);
                $('#boot').show();
            });
        },
        formatDate: function(time) {
            return time.substr(0, 19).replace('T', ' ');
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