(function () {
    "use strict";
    function ViewModel(params) {
        var model = {
            items: [],
            total: 0,
            filter: {
                page_size: 20,
                page_no: 0,
                status: '', //状态：0下线，1上线
                name: '',//搜索关键字
                no_tag_resource: false,//是否查询未贴标签的资源, 默认为false
                tag_ids: [],//标签ID(多值)
                is_top: false,//置顶标识
                sort_type: 3,//排序类型：1默认创建时间倒序，2上线时间（最新），3报名人数（最热）
                time_status: '',//1即将开始 2正在开课 3已结束
                group_names: [],//学习单元分组列表
                affiliated_org_nodes: [],
                affiliated_org_node_filter_type: 0,
                audit_status: ''
            },
            allGroupNames: [],
            tags: [],
            style: 'pic', //列表显示风格
            selectedArray: [],// 勾选到的item，
            setSortable: ''// 设置sortable
        };
        this.model = ko.mapping.fromJS(model);
        this.model.filter.affiliated_org_nodes(params.manager_nodes || []);
        this.model.selectTags = ko.observable({});
        this.params = params;
        this.init();
    }

    ViewModel.prototype.store = {
        getTag: function (channelId) {
            return $.ajax({
                url: "/" + projectCode + "/resource_pool/tags/tree",
                type: "get",
                dataType: "json",
                cache: false
            });
        },
        getResource: function (data) {
            return $.ajax({
                url: "/" + projectCode + "/resource_pool/resources",
                type: "post",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        getResourceGroup: function () {
            return $.ajax({
                url: "/" + projectCode + "/channels/resource_groups",
                type: "get",
                dataType: 'json',
                cache: false
            });
        }
    };
    ViewModel.prototype.init = function () {
        var _self = this;
        this.model = ko.mapping.fromJS(this.model);
        this.model.selectTags = ko.observable({});
        this._initComputed();
        this.initTag();
        this.getResourceGroup();
    };
    ViewModel.prototype.formatResourceType = function ($data) {
        var allGroupNames = window.allGroupNames || [];
        for (var i = 0; i < allGroupNames.length; i++)
            if (allGroupNames[i].type == $data.type)return allGroupNames[i].alias;
    };
    ViewModel.prototype._initComputed = function () {
        this.model.allStatus = ko.pureComputed(function () {
            var filter = this.model.filter;
            return !(filter.no_tag_resource() || filter.is_top() || ~$.inArray(filter.status(), [0, 1]) || ~$.inArray(filter.audit_status(), [1, 2, 3]));
        }, this);
        this.model.filter.tag_ids = ko.pureComputed(function () {
            var selectTags = this.model.selectTags, arr = [];
            $.each(selectTags(), function (i, v) {
                if (v) arr.push(v);
            });
            return arr;
        }, this);
        this.model.isAllGroupNames = ko.computed({
            read: function () {
                var list = this.model.allGroupNames(), selected = this.model.filter.group_names();
                return list.length && selected.length === list.length;
            },
            write: function (value) {
                var list = this.model.allGroupNames(), selected = this.model.filter.group_names;
                if (value) {
                    selected($.map(list, function (v) {
                        return v.name;
                    }));
                } else {
                    selected([])
                }
            },
            owner: this
        });
    };
    ViewModel.prototype.getResourceGroup = function () {
        var self = this;
        this.store.getResourceGroup().done(function (res) {
            self.model.allGroupNames(res);
            self.model.filter.group_names($.map(res, function (v) {
                return v.name;
            }));
            self.getList();
            self.model.filter.group_names.subscribe(function () {
                self.search();
            }, this);
        })
    };
    ViewModel.prototype.initTag = function () {
        var self = this;
        this.store.getTag().done(function (res) {
            if (res && res.children) self.formatTag(res);
        })
    };
    ViewModel.prototype.formatTag = function (data) {
        function getChildren(array, target) {
            for (var i = 0; i < array.children.length; i++) {
                var root = $.extend(true, {}, array.children[i]);
                delete root.children;
                target.push(root);
                if (array.children[i].children.length) {
                    getChildren(array.children[i], target);
                }
            }
        }

        for (var i = 0; i < data.children.length; i++) {
            //初始化选择条件
            data.children[i].all = [];
            getChildren(data.children[i], data.children[i].all);
            data.children[i].children = data.children[i].all;
            delete data.children[i].all;
        }
        //拼凑二级标签
        this.model.tags(data.children);
    };
    ViewModel.prototype.getList = function () {
        var self = this, _filter = this.model.filter, _search = ko.mapping.toJS(_filter);
        if (!_search.group_names.length) {
            this.model.items([]);
            this.model.total(0);
            _filter.page_no(0);
            this.pagination(0,
                _filter.page_size(),
                _filter.page_no(),
                $.proxy(function (no) {
                    _filter.page_no(no);
                    this.getList();
                }, this)
            );
            return;
        }
        this.store.getResource(this.formatFilter(_search)).done(function (res) {
            self.model.items(res.items);
            self.model.total(res.total);
            self.clearSelect();
            self.pagination(res.total,
                _filter.page_size(),
                _filter.page_no(),
                $.proxy(function (no) {
                    _filter.page_no(no);
                    this.getList();
                }, self)
            );
        })
    };
    ViewModel.prototype.formatFilter = function (search) {
        var newFilter = {};
        $.each(search, function (k, v) {
            if ($.isArray(v)) {
                if (v.length) newFilter[k] = v;
            } else {
                if (v !== "" && v !== false) newFilter[k] = v;
            }
        });
        return newFilter;
    };
    //清除选择
    ViewModel.prototype.clearSelect = function () {
        this.model.selectedArray([]);
        this.params.selectedArray([]);
    };
    ViewModel.prototype.pagination = function (totalCount, pageSize, currentPage, callback, target) {
        var $target = target || $('#resourcePoolPagination');
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
    };
    //项目item勾选事件
    ViewModel.prototype.checkClick = function ($data) {
        var selectedArray = this.model.selectedArray, index = ~selectedArray.indexOf($data);
        if (index) {
            selectedArray.remove($data);
        } else {
            selectedArray.push($data)
        }
        this.params.selectedArray(selectedArray());
    };
    ViewModel.prototype.formatTime = function (time) {
        return $.format.date(time, 'yyyy-MM-dd');
    };
    //设定查询参数
    ViewModel.prototype.clearStatus = function () {
        this.model.filter.no_tag_resource(false);
        this.model.filter.is_top(false);
        this.model.filter.status("");
        this.model.filter.audit_status("");
    };
    ViewModel.prototype.setTag = function (id, pid) {
        if (id) this.model.filter.no_tag_resource(false);
        var selectTags = this.model.selectTags;
        selectTags()[pid] = id;
        selectTags(selectTags());
        this.search();
    };
    ViewModel.prototype.setStatus = function (k, v) {
        if (k !== 'sort_type') this.clearStatus();
        if (k) {
            if (k == "no_tag_resource") this.model.selectTags({});
            this.model.filter[k](v);
        }
        this.search();
    };
    ViewModel.prototype.setSortType = function () {
        this.clearStatus();
        if (k) {
            if (k == "no_tag_resource") this.model.selectTags({});
            this.model.filter[k](v);
        }
        this.search();
    };
    ViewModel.prototype.search = function () {
        this.model.filter.page_no(0);
        this.getList();
    };
    ViewModel.prototype.enterSearch = function ($data, $event) {
        if ($event && $event.type == "keyup" && $event.keyCode != 13) return;
        this.search();
    };
    ko.components.register('x-resource-pool', {
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})();