(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {//cause应该是存放错误的原因对象
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        /*将ajax请求封装成函数，方便重用*/
        search: function (params) {
            var url = '/' + projectCode + '/v1/exams/downloadings';
            return $.ajax({
                url: url,
                data: params,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/x-www-form-urlencoded',
                error: this.errorCallback
            });
        }
    };

    /*定义视图模型*/
    var viewModel = {
        model: {
            items: [],
            filter: {
                page: 0,
                size: 20
            }
        },

        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.list();
        },

        list: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            store.search(filter)//将filter直接传入作为请求参数
                .done($.proxy(function (data) {
                    var items = data.items || [];
                    this.model.items(items);
                    this.page(data.count, filter.page, filter.size);
                }, this)) ;
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
                        self.model.filter.page(page_id);
                        self.list();
                    }
                }
            });
        },
        getSize: function (item) {
            var size = item.size;
            var temp = (size / 1024).toFixed(2);
            return temp > 1024 ? (temp / 1024).toFixed(2) + 'MB' : temp + 'KB';
        }

    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);