(function () {
    "use strict";
    var RESOURCE_CONFIG_MAP = (function () {
        var map = {}, g = window.allGroupNames;
        for (var i = 0; i < g.length; i++)
            map[g[i].type] = g[i];
        return map;
    }());
    var _ = ko.utils;

    function formatUrl(url, data) {
        url = url || '';
        url = url.replace(/\$\{project_code\}/gi, projectCode);
        if (data) url = url.replace(/\$\{data\.(.+?)(\|(.+?))?\}/gi, function (match, m1, m2, filter) {
            var arr = m1.split('.'), d = data;
            for (var i = 0; i < arr.length; i++)
                d = d[arr[i]];
            if (filter) {
                switch (filter) {
                    case 'e':
                        d = encodeURIComponent(d);
                }
            }
            return d;
        });
        var url_auth = url.replace(/[?&]__mac=\${mac}/, ''),
            mac = Nova.getMacToB64(url_auth);
        url = url.replace(/\${mac}/gi, mac);
        return url;
    }

    var store = {
        getStat: function () {
            return $.ajax({
                url: channelUrl + "/v2/resources/audit/stat",
                dataType: "json",
                cache: false
            });
        },
        getChannellist: function () {
            return $.ajax({
                url: "/" + projectCode + "/channels",
                dataType: "json",
                cache: false
            });
        },
        getTag: function (channelId) {
            return $.ajax({
                url: "/" + projectCode + "/channels/" + channelId + "/tags/tree",
                type: "get",
                dataType: "json",
                cache: false
            });
        },
        getResource: function (data) {
            return $.ajax({
                url: channelUrl + "/v2/resources/audits/search",
                type: "post",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        }
    };
    var viewModel = {
        model: {
            channels: [],
            items: [],
            total: 0,
            stat: null,
            filter: {
                page_size: 20,
                page_no: 0,
                name: '',
                audit_status: 1,//审核状态：0未提交 1待审核 2审核通过 3驳回
                channel_id: '',
                channel_tag_ids: [],
            },
            allGroupNames: [],
            isLoaded: false,
            tags: [],
            listStyle: 'card', //列表显示风格
            selectedArray: [],// 勾选到的item，
            orgText: "点击查看或选择组织",
            tree: {
                init: false,
                manager: null,
                org: null
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.selectTags = ko.observable({});
            this.initComputed();
            this.getStat();
            this.initChannels();
            this.eventHandler();
            this.search();
            ko.applyBindings(this, document.getElementById('mainContent'));
        },
        getStat: function () {
            var self = this;
            store.getStat().done(function (res) {
                self.model.stat(res);
            })
        },
        initChannels: function () {
            var self = this;
            store.getChannellist().done(function (res) {
                self.model.channels(res);
            })
        },
        setChannel: function (id) {
            this.model.filter.channel_id(id);
            id && this.getTag(id);
            this.search();
        },
        hrefToAudit: function ($data) {
            location.href = '/' + projectCode + '/resource/' + $data.unit_id + '/distribute_audit';
        },
        setAuditStatus: function (status) {
            this.model.filter.audit_status(status);
            this.search();
        },
        switchListStyle: function (type) {
            this.model.listStyle(type);
        },
        initComputed: function () {
            this.model.filter.channel_tag_ids = ko.pureComputed(function () {
                var selectTags = this.model.selectTags, arr = [];
                $.each(selectTags(), function (i, v) {
                    if (v) arr.push(v);
                });
                return arr;
            }, this);
            ko.options.deferUpdates = true;
        },
        eventHandler: function () {
            var self = this;
            $(document).on('click', function (e) {
                if (!$(e.target).closest('.item-check').length) $('.item-check').removeClass('active');
            });
            $('#js-content').on('click', '.item-check', function () {
                $('.item-check').removeClass('active');
                $(this).addClass('active');
            });
        },
        getResourceGroup: function (global) {
            var self = this, exam_group = [], result = [], group_names = [];
            window.notShowCover = global;
            var res = $.extend(true, [], window.allGroupNames);
            this.model.allGroupNames(res);
            $.each(res, function (i, v) {
                if (v.is_exam_group) {
                    exam_group.push(v);
                } else {
                    result.push({
                        title: '添加' + v.title,
                        type: v.type,
                        children: []
                    });
                }
                if (!window.unitType || (window.unitType && window.unitType == v.type)) group_names.push(v.name);
            });
            if (exam_group.length) {
                result = [{
                    title: '添加测评',
                    type: '',
                    children: exam_group
                }].concat(result);
            }
            this.getList();
        },
        getTag: function (channelId) {
            var self = this;
            store.getTag(channelId).done(function (res) {
                if (res && res.children) self.formatTag(res);
            })
        },
        formatTag: function (data) {
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
        },
        getList: function () {
            var self = this, _filter = this.model.filter, _search = ko.mapping.toJS(_filter);
            this.model.isLoaded(false);
            store.getResource(this.formatFilter(_search)).done(function (res) {
                self.model.items(res.items);
                self.model.total(res.total);
                self.model.selectedArray([]);
                self.model.isLoaded(true);
                self.pagination(res.total,
                    _filter.page_size(),
                    _filter.page_no(),
                    $.proxy(function (no) {
                        _filter.page_no(no);
                        this.getList();
                    }, self)
                );
            }).always(function () {
                window.notShowCover = false;
                location.hash = "";
            })
        },
        formatFilter: function (search) {
            var newFilter = {};
            $.each(search, function (k, v) {
                if ($.isArray(v)) {
                    if (v.length) newFilter[k] = v;
                } else {
                    if (v !== "" && v !== undefined) newFilter[k] = v;
                }
            });
            return newFilter;
        },
        formatResourceType: function ($data) {
            var allGroupNames = window.allGroupNames || [];
            for (var i = 0; i < allGroupNames.length; i++)
                if (allGroupNames[i].type == $data.type) return allGroupNames[i].alias;
        },
        clearSelect: function () {
            this.model.selectedArray([]);
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
        checkClick: function ($data) {
            var selectedArray = this.model.selectedArray, index = ~selectedArray.indexOf($data);
            if (index) {
                selectedArray.remove($data);
            } else {
                selectedArray.push($data)
            }
        },
        formatTime: function (time) {
            return $.format.date(time, 'yyyy-MM-dd HH:mm:ss');
        },
        formatPrice: function (commodity) {
            return commodity ? commodity.price ? (function () {
                var price = '';
                _.objectForEach(commodity.price, function (k, v) {
                    if (!price) price = v;
                });
                return price || '免费';
            })() : '免费' : ''
        },
        setTag: function (id, pid) {
            var selectTags = this.model.selectTags;
            selectTags()[pid] = id;
            selectTags(selectTags());
            this.search();
        },
        search: function () {
            this.model.filter.page_no(0);
            this.getList();
        },
        enterSearch: function ($data, $event) {
            if ($event && $event.type == "keyup" && $event.keyCode != 13) return;
            this.search();
        },
        //设置标签
        formatSelectedTag: function (tags) {
            return tags ? ($.isArray(tags) ? $.map(tags, function (v) {
                return v.id;
            }) : []) : [];
        },
        openCatalog: function () {
            var selectedArray = this.model.selectedArray();
            if (selectedArray.length === 1) {
                this._setCatalogTree(this.formatSelectedTag(selectedArray[0].tags), [selectedArray[0].resource_id]);
            } else {
                this._setCatalogTree([], $.map(selectedArray, function (v) {
                    return v.resource_id;
                }));
            }
        },
        openUnitCatalog: function (data) {
            this._setCatalogTree(this.formatSelectedTag(data.tags), [data.resource_id]);
        },
        _setCatalogTree: function (items, ids) {
            var self = this;
            store.getTag().done(function (data) {
                new ToolBar({
                    selectObj: items,
                    treeData: data,
                    saveCallback: function (data) {
                        var modal = this,
                            options = ids.map(function (item) {
                                return {
                                    resource_id: item,
                                    tag_ids: data
                                }
                            });
                        store.updateResourceTags(options).done(function (data) {
                            $.simplyToast("标签设置成功");
                            modal.hide();
                            self.search();
                        });
                    }
                })
            });
        },
        doTop: function (flag, $data) {
            var self = this, ids = $data ? [$data.resource_id] : $.map(this.model.selectedArray(), function (v) {
                return v.resource_id;
            });
            store.updateResourceIsTop(flag, ids).done(function (data) {
                $.simplyToast((flag ? '置顶' : '取消置顶') + "成功");
                self.getList();
            });
        },
        isAudit: function (type) {
            var allGroupNames = window.allGroupNames;
            for (var i = 0; i < allGroupNames.length; i++)
                if (allGroupNames[i].type == type) return allGroupNames[i].resource_audit;
        },
        selectAll: function () {
            if (this.model.selectedArray().length == this.model.items().length) {
                this.model.selectedArray([]);
            } else {
                this.model.selectedArray(this.model.items().concat());
            }
        },

    };
    $(function () {
        viewModel.init();
    });
})();