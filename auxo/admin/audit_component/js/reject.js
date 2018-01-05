(function ($, window) {
    var store = {
        search: function (filter) {
            return $.ajax({
                url: auditApiUrl + '/v1/reject_reasons/search',
                data: JSON.stringify(filter),
                type: 'POST'
            })
        },
        create: function (data) {
            return $.ajax({
                url: auditApiUrl + '/v1/reject_reasons',
                data: JSON.stringify(data),
                type: 'POST'
            })
        },
        get: function (id) {
            return $.ajax({
                url: auditApiUrl + '/v1/reject_reasons/' + id
            })
        },
        update: function (id, info) {
            return $.ajax({
                url: auditApiUrl + '/v1/reject_reasons/' + id,
                type: 'PUT',
                data: JSON.stringify(info)
            })
        },
        delete: function (id) {
            return $.ajax({
                url: auditApiUrl + '/v1/reject_reasons/' + id,
                type: 'DELETE'
            })
        },
        move: function (id, target) {
            return $.ajax({
                url: auditApiUrl + '/v1/reject_reasons/' + id + '/sort',
                type: 'PUT',
                data: JSON.stringify(target)
            })
        }
    };
    var viewModel = {
        model: {
            filter: {
                program_id: programId,
                page: 0,
                size: 99
            },
            items: [],
            info: {
                id: '',
                program_id: programId,
                content: ''
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            this.list();
        },
        create: function () {
            this.model.info.id('');
            this.model.info.content('');
            $('#createPop').modal();
        },
        edit: function (d) {
            this.model.info.id(d.reject_reason_id);
            this.model.info.content(d.content);
            $('#createPop').modal();
        },
        createOk: function () {
            var t = this;
            var info = ko.mapping.toJS(this.model.info);
            if (!info.content) {
                $.confirm({
                    title: '提示',
                    content: '驳回原因不能为空',
                    confirmButtonClass: 'btn-info',
                    cancelButtonClass: 'btn-danger',
                    buttons: {
                        "确定": function () {}
                    }
                })
            }else {
                if (info.id) {
                    store.update(info.id, info).done(function () {
                        t.success();
                        $.alert({
                            title: false,
                            content: '更新成功'
                        });
                    });
                } else {
                    store.create(info).done(function () {
                        t.success();
                        $.alert({
                            title: false,
                            content: '创建成功'
                        });
                    });
                }
            }
        },
        success: function () {
            this.list();
            $('#createPop').modal('hide');
        },
        del: function (d) {
            var t = this;

            $.confirm({
                title: '删除提示!',
                content: '确认删除？',
                confirmButtonClass: 'btn-info',
                cancelButtonClass: 'btn-danger',
                buttons: {
                    "确定": function () {
                        store.delete(d.reject_reason_id).done(function () {
                            t.success();
                            $.alert({
                                title: false,
                                content: '删除成功'
                            });
                        });
                    },
                    "取消": function () {
                    }
                }
            })
        },
        move: function (type, index, d) {
            var t = this;
            
            if (type == 'DOWN')
                index++;
            else
                index--;

            var item = this.model.items()[index];

            var target = {
                "target_id": item.reject_reason_id,
                "position": type
            };

            store.move(d.reject_reason_id, target).done(function () {
                t.list();
            });
        },
        list: function () {
            var t = this;
            var filter = ko.mapping.toJS(this.model.filter);

            store.search(filter).done(function (d) {
                t.model.items(d.items);
                t.pagination(d.total, t.model.filter.page());
            });
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
    })
})(jQuery, window);