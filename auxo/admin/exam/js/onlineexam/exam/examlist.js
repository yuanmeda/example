(function ($, window) {

    //数据仓库
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        search: function (searchUrl) {
            var url = '/' + projectCode + '/v1/exams/pages?'+searchUrl;
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        del: function (id, success) {
            var url = '/' + projectCode + '/v1/exams/' + id;
            return $.ajax({
                url: url,
                cache: false,
                data: null,
                type: 'delete',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        online: function (id) {
            var url = '/' + projectCode + '/v1/exams/' + id + '/online';
            return $.ajax({
                url: url,
                cache: false,
                data: null,
                type: 'put',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        offline: function (id) {
            var url = '/' + projectCode + '/v1/exams/' + id + '/offline';
            return $.ajax({
                url: url,
                cache: false,
                data: null,
                type: 'put',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
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
            this.model = ko.mapping.fromJS(self.model);
            ko.applyBindings(this);

            $(document).trigger('remove_class', ['.main', 'hidden']);

            this.list();
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
                    self.items = data && data.items && data.items.length > 0 ? data.items : [];
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
        doSearch: function () {
            viewModel.model.filter.pageIndex(0);
            viewModel.list();
        },
        updateStatus: function (id, enabled) {
            var _self = viewModel;
            if (enabled) {
                store.offline(id).done(function () {
                    _self.list();
                });
            } else {
                store.online(id).done(function () {
                    _self.list();
                });
            }
        },
        del: function (id) {
            var _self = this;
            $.fn.dialog2.helpers.confirm('确定要删除吗？', {
                "confirm": function () {
                    store.del(id)
                        .done(function () {
                            $.fn.dialog2.helpers.alert('删除成功');
                            _self.list();
                        }).fail(function (jqXHR) {
                        var txt = JSON.parse(jqXHR.responseText);
                        if (txt.cause) {
                            $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                        } else {
                            $.fn.dialog2.helpers.alert(txt.message);
                        }
                        ;
                        $('body').loading('hide');
                    });
                },
                "decline": function () {
                    return;
                },
                buttonLabelYes: '确定',
                buttonLabelNo: '取消'
            })
        },
        logout: function () {
            location.href = "/logout";
        },
        formatTimezone: function (dt) {
            if (dt) return dt.replace(/(\+\d{2})(\d{2})$/, "$1:$2");
            return dt;
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);