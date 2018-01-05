;(function (window, $) {
    'use strict';
    var store = {
        getCourseList: function (data) {
            var url = (window.selfUrl || '') + "/" + projectCode + "/open_courses/search";
            return $.ajax({
                url: url,
                cache: false,
                data: data,
                dataType: "json"
            });
        }
    };
    //课程详细数据模型
    var viewModel = {
        model: {
            init: false,
            list: {
                items: [],
                count: 0
            },
            filter: {
                page_size: 20,
                page_no: 0,
                catalogs: [tag_id],
                sort_type: sortType || 0,
                status_type: 1
            }
        },
        orderSearch: function (type) {
            this.model.filter.sort_type(type);
            this.model.filter.page_no(0);
            this.pageQuery();
        },
        clist: ko.observable({}),
        bindEvent: function () {
            var self = this;
            self.pageQuery();
            self.clist.sub("clist", function (val) {
                if (val.catalogs().toString() != self.model.filter.catalogs().toString()) {
                    self.model.filter.catalogs(val.catalogs());
                    self.model.filter.page_no(0);
                    self.pageQuery();
                }
            });
            $(".show-more").on("click", function () {
                $(".filter-right").toggleClass("release");
            });
        },
        statusSearch: function (mode) {
            if (this.model.filter.status_type() == mode) return;
            this.model.filter.status_type(mode);
            this.model.filter.page_no(0);
            this.pageQuery();
        },
        pageQuery: function () {
            this.store && this.store.abort();
            var self = this, filter = ko.mapping.toJS(this.model.filter);
            filter.tag_ids = filter.catalogs.join(',');
            filter.status = 1;
            this.store = store.getCourseList(filter);
            this.store.done(function (data) {
                for (var i = 0, j = data.items.length; i < j; i++) {
                    if (data.items[i].tags && data.items[i].tags.length > 3) {
                        data.items[i].tags.length = 3;
                    }
                }
                self.model.list.items(data.items);
                self.model.list.count(data.count);
                self.model.init(true);
                self.page();
                $('#js_opencourse_list .lazy-image:not(.loaded)').lazyload({
                    load: function () {
                        $(this).addClass('loaded');
                    }
                }).trigger('scroll');

            }).always(function () {
                self.store = null;
            });
        },
        triggerTagButton: function (data) {
            var selector = "[data-id=" + data.id + "]"; //获取标签dom元素
            $(selector).trigger("click");
        },
        page: function () {
            var self = this;
            $("#pagination").pagination(self.model.list.count(), {
                is_show_first_last: false,
                is_show_input: true,
                is_show_total: false,
                items_per_page: self.model.filter.page_size(),
                num_display_entries: 5,
                current_page: self.model.filter.page_no(),
                prev_text: "common.addins.pagination.prev",
                next_text: "common.addins.pagination.next",
                callback: function (index) {
                    if (index != self.model.filter.page_no()) {
                        self.model.filter.page_no(index);
                        self.pageQuery();
                    }
                }
            })
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.bindEvent();
            ko.applyBindings(this, document.getElementById("js_content"));
        }
    };
    $(function () {
        viewModel.init();
    })
})(window, jQuery);

