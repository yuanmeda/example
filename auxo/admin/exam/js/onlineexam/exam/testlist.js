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
        exam_search: function (filter) {
            var url = '/' + projectCode + '/v1/exams/pages';
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: "json",
                requestCase: "snake",
                reponseCase: "camel",
                enableToggleCase: true,
                cache: false,
                data: filter,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        exam_del: function (id) {
            var url = '/' + projectCode + '/v1/exams/' + id;
            return $.ajax({
                url: url,
                type: 'DELETE',
                dataType: "json",
                requestCase: "snake",
                reponseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        exam_online: function (id) {
            var url = '/' + projectCode + '/v1/exams/' + id + '/online';
            return $.ajax({
                url: url,
                type: 'PUT',
                dataType: "json",
                requestCase: "snake",
                reponseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        exam_offline: function (id) {
            var url = '/' + projectCode + '/v1/exams/' + id + '/offline';
            return $.ajax({
                url: url,
                type: 'PUT',
                dataType: "json",
                requestCase: "snake",
                reponseCase: "camel",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        exercise_search: function (filter) {
            var url = '/' + projectCode + '/v1/exercises';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                data: filter,
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        exercise_del: function (id, success) {
            var url = '/' + projectCode + '/v1/exercises/' + id;
            return $.ajax({
                url: url,
                cache: false,
                data: null,
                type: 'DELETE',
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        exercise_online: function (id) {
            var url = '/' + projectCode + '/v1/exercises/' + id + '/online';
            return $.ajax({
                url: url,
                cache: false,
                data: null,
                type: 'PUT',
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        },
        exercise_offline: function (id) {
            var url = '/' + projectCode + '/v1/exercises/' + id + '/offline';
            return $.ajax({
                url: url,
                cache: false,
                data: null,
                type: 'PUT',
                contentType: 'application/json;charset=utf8',
                error: store.errorCallback
            });
        }
    };

    var viewModel = {
        model: {
            tabType: 'exam',
            exam_items: [],
            filter: {
                size: 20,
                page: 0,
                title: ''
            },
            exercise_items: []
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            $("#exerciseList").hide();
            $(document).trigger('remove_class', ['.main', 'hidden']);

            this.list();
            $('#filterTitle').bind("keyup blur", $.proxy(function (e) {
                if (e.keyCode == 13) {
                    this.doSearch();
                }
            }, this));
        },
        tabClickAction: function (tabType, element) {
            if ($(parent).hasClass('active'))
                return;
            $('li').removeClass('active');
            $(element).closest('li').addClass('active');
            this.model.tabType(tabType);
            this.model.filter.page(0);
            $("#filterTitle").val("");
            this.model.filter.title('');
            this.list();

        },
        list: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            store[this.model.tabType() + '_search'](filter)
                .done($.proxy(function (data) {
                    this.model[this.model.tabType() + '_items'](data && data.items && data.items.length > 0 ? data.items : []);
                    this.page(data.count, filter.page, filter.size);
                }, this));
        },
        page: function (totalCount, currentPage, size) {
            $('#pagination').pagination(totalCount, {
                items_per_page: size,
                current_page: currentPage,
                num_display_entries: 5,
                is_show_total: true,
                is_show_input: true,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                items_per: [20, 50, 100, 200, 500, 1000],
                callback: $.proxy(function (page_id) {
                    if (page_id != currentPage) {
                        this.model.filter.page(page_id);
                        this.list();
                    }
                }, this),
                perCallback: $.proxy(function (size) {
                    this.model.filter.page(0);
                    this.model.filter.size(size);
                    this.list();
                }, this)
            });
        },
        doSearch: function () {
            viewModel.model.filter.page(0);
            viewModel.list();
        },
        updateStatus: function (id, enabled) {
            if (enabled) {
                store[this.model.tabType() + '_offline'](id).done($.proxy(function () {
                    this.list();
                }, this));
            } else {
                store[this.model.tabType() + '_online'](id).done($.proxy(function () {
                    this.list();
                }, this));
            }
        },
        del: function (id) {
            var _self = this;
            $.fn.dialog2.helpers.confirm('确定要删除吗？', {
                "confirm": function () {
                    store[_self.model.tabType() + '_del'](id)
                        .done(function () {
                            $.fn.dialog2.helpers.alert('删除成功');
                            _self.list();
                        });
                },
                "decline": function () {
                    return;
                },
                buttonLabelYes: '确定',
                buttonLabelNo: '取消'
            })
        },
        //格式化日期时间的时区，以便兼容IE和Chrome。格式化前2016-03-25T14:33:00.000+0800，格式化后2016-03-25T14:33:00.000+08:00
        _formatTimezone: function (dt) {
            if (dt) return dt.replace(/(\+\d{2})(\d{2})$/, "$1:$2");
            return dt;
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);