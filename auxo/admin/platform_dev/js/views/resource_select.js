(function () {
    'use strict';
    var _ = ko.utils;
    var store = {
        getResources: function (data) {
            return $.ajax({
                url: '/v1/resources/actions/search',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        },
    };
    var viewModel = {
        model: {
            resource: {
                items: [],
                total: 0,
            },
            filter: {
                page_size: 20,
                page_no: 0,
                status: '', //状态：0下线，1上线
                name: '',//搜索关键字
                no_tag_resource: false,//是否查询未贴标签的资源, 默认为false
                tag_ids: [],//标签ID(多值)
                is_top: false,//置顶标识
                sort_type: 3,//排序类型：3综合 1最新 2最热
                time_status: '',//1即将开始 2正在开课 3已结束
                group_names: _.arrayMap(window.allGroupNames || [], function (v) {
                    return v.name;
                }),//学习单元分组列表
                affiliated_org_nodes: [],
                affiliated_org_node_filter_type: 0
            },
            selectedResources: [],
            selectedIds: [],
            ids: []
        },
        stopPropagation: function ($data, $event) {
            $event && $event.stopPropagation();
            return true;
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.selectedIds = ko.pureComputed(function () {
                return _.arrayMap(this.model.selectedResources(), function (item) {
                    return item.unit_id;
                })
            }, this);
            ko.applyBindings(this, document.getElementById('mainContent'));
            this._eventHandler();
            this._initMessage();
            this._list();
        },
        checkSelected: function ($data) {
            return ~this.model.selectedIds().indexOf($data.unit_id);
        },
        _initMessage: function () {
            var callbackList = {
                "PLATFORM_FETCH_RESOURCE_CALLBACK": $.proxy(function (data) {
                    this.model.ids(data.ids);
                }, this)
            };
            $(window).off('message').on('message', function (evt) {
                if (evt.originalEvent.data) {
                    var rawData = void 0;
                    try {
                        rawData = JSON.parse(evt.originalEvent.data)
                    } catch (e) {
                    }
                    if (rawData) callbackList[rawData.action](rawData.data);
                }
            });
            var msg = {
                "action": "PLATFORM_FETCH_RESOURCE",
                "data": {},
                "origin": location.host,
                "timestamp": +new Date()
            };
            if (window.parent !== window) window.parent.postMessage(JSON.stringify(msg), '*');
        },
        _list: function () {
            var self = this, _filter = this.model.filter, _search = ko.mapping.toJS(_filter);
            store.getResources(this._formatFilter(_search)).done(function (res) {
                self.model.resource.items(res.items);
                self.model.resource.total(res.total);
                self.pagination(res.total,
                    _filter.page_size(),
                    _filter.page_no(),
                    $.proxy(function (no) {
                        _filter.page_no(no);
                        this._list();
                    }, self)
                );
                $('#js-content .lazy-image:not(.loaded)').lazyload({
                    placeholder: defaultImage,
                    load: function () {
                        $(this).addClass('loaded');
                    }
                }).trigger('scroll');
            });
        },
        _formatFilter: function (search) {
            var newFilter = {};
            $.each(search, function (k, v) {
                if ($.isArray(v)) {
                    if (v.length) newFilter[k] = v;
                } else {
                    if (v !== "" && v !== false) newFilter[k] = v;
                }
            });
            return newFilter;
        },
        _eventHandler: function () {
            var self = this;
            $(document).on('click', function (e) {
                if (!$(e.target).closest('.item-check').length) $('.item-check').removeClass('active');
            });
            $('#js-content').on('click', '.item-check', function () {
                $('.item-check').removeClass('active');
                $(this).addClass('active');
            });
        },
        search: function () {
            this.model.filter.page_no(0);
            this._list();
        },
        toggleSelected: function ($data) {
            var selectedResources = this.model.selectedResources, found = false;
            for (var i = 0; i < selectedResources().length; i++) {
                if (selectedResources()[i].unit_id == $data.unit_id) {
                    selectedResources.remove(selectedResources()[i]);
                    found = true;
                    break;
                }
            }
            if (!found) selectedResources.push($data);
        },
        submitSelectedResource: function () {
            var msg = {
                'action': 'PLATFORM_SUBMIT_RESOURCE_ADD',
                'data': {
                    'ids': this.model.selectedIds()
                },
                'origin': location.host,
                'timestamp': +new Date()
            };
            window.parent.postMessage(JSON.stringify(msg), '*');
        },
        enterSearch: function ($data, $event) {
            if ($event && $event.type == 'keyup' && $event.keyCode != 13) return;
            this.search();
        },
        pagination: function (totalCount, pageSize, currentPage, callback, target) {
            var $target = target || $('#pagination');
            $target.pagination(totalCount, {
                items_per_page: pageSize,
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (pageNum) {
                    if (pageNum != currentPage && callback) {
                        callback(pageNum);
                    }
                }
            });
        },
        formatResourceType: function ($data) {
            var allGroupNames = window.allGroupNames || [];
            for (var i = 0; i < allGroupNames.length; i++)
                if (allGroupNames[i].type == $data.type)return allGroupNames[i].title;
        },
    };
    $(function () {
        viewModel.init();
    });
})();