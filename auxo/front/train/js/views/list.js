/*!
 * 培训认证列表
 */
(function ($, window) {
    'use strict';

    var store = {
        getTrainList: function (data) {
            var url = selfUrl +  '/' + projectCode + '/v1/trains/pages';
            return $.ajax({
                url: url,
                data: data,
                cache: false,
                traditional: true
            });
        }
    };

    var viewModel = {
        model: {
            totalCount: '',
            init: false,
            items: [],
            filter: {
                title: "",
                size: 20,
                page: 0,
                catalogs: [tag_id],
                flag: -1,
                order_by: +order_by || 0,
                status_type: 1
            },
            clist: ko.observable({})
        },

        init: function () {
            var _self = this;
            document.title = i18nHelper.getKeyValue('trainComponent.trains.frontPage.pageTitle');
            _self.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('container'));
            _self.list(0);
            //监听标签变化
            _self.model.clist.sub("clist", function (val) {
                if (val.catalogs().toString() != _self.model.filter.catalogs().toString()) {
                    _self.model.filter.catalogs(val.catalogs());
                    _self.model.filter.flag(val.flag());
                    _self.list(0);
                }
            });
        },

        list: function (page) {
            var _self = this, filter = this.model.filter;
            if (page === 0) filter.page(0);
            var jsonSearch = {
                title: filter.title(),
                tag_ids: filter.catalogs(),
                page: filter.page(),
                size: filter.size(),
                order_by: filter.order_by(),
                status_type: filter.status_type()
            };
            store.getTrainList(jsonSearch).done(function (data) {
                $.each(data.items, function (i, v) {
                    if (v.tag_list)v.tag_list.length = v.tag_list.length > 3 ? 3 : v.tag_list.length;
                });
                _self.model.items(data.items || []);
                _self.model.totalCount(data.total);
                _self.model.init(true);
                _self.page(data.total, filter.page());
                $('.js-lazy:not(.loaded)').lazyload({
                    load: function () {
                        $(this).addClass('loaded');
                    }
                }).trigger('scroll');
            });
        },
        orderSearch: function (mode) {
            var _self = this;
            if (_self.model.filter.order_by() == mode) return;
            _self.model.filter.order_by(mode);
            _self.list(0);
        },
        statusSearch: function (mode) {
            var _self = this;
            if (_self.model.filter.status_type() == mode) return;
            _self.model.filter.status_type(mode);
            _self.list(0);
        },
        page: function (totalCount, currentPage) {
            var that = viewModel;
            $('#pagination').pagination(totalCount, {
                items_per_page: that.model.filter.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        that.model.filter.page(page_id);
                        that.list();
                    }
                }
            });
        },
        triggerTagButton: function ($data) {
            var selector = "[data-id=" + $data.tag_id + "]"; //获取标签dom元素
            $(selector).trigger("click");
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);
