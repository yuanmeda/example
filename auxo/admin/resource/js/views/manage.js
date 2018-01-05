(function () {
    "use strict";

    function saveUrl(action, type, id) {
        return '//' + location.host + '/' + projectCode + '/resource/link' + '?context_id=' + (window.channelId ? ('el-channel:' + window.channelId) : '') + '&action=' + action + '&unit_type=' + type + (id ? ('&id=' + id) : '');
    }

    var course_config_map = {
        'teaching_course': {
            alias: "教学课",
            create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_manage?business_type=teaching_course&source=channel&__mac=${mac}",
            title: "教学课",
            update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
        },
        'exercise_course': {
            alias: "练习课",
            create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_for_channel?business_type=exercise_course&source=channel&__mac=${mac}",
            title: "练习课",
            update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
        },
        'offline_course': {
            alias: "线下课",
            create_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/create_for_channel?business_type=offline_course&source=channel&__mac=${mac}",
            title: "线下课",
            update_url: opencourse2GatewayUrl + '/' + projectCode + "/admin/open_course/${data.resource_id}?business_type=${data.extra.business_type}"
        }
    };
    var RESOURCE_CONFIG_MAP = (function () {
        var map = {}, g = window.allGroupNames;
        for (var i = 0; i < g.length; i++)
            map[g[i].type] = g[i];
        return $.extend(map, course_config_map);
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
        getMixOrgTree: function () {
            return $.ajax({
                url: "/" + projectCode + "/manage_orgs",
                data: {org_id: window.projectOrgId},
                type: "get",
                dataType: "json",
                cache: false
            });
        },
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
                cache: false,
                dataType: 'json'
            });
        },
        updateResourceStatus: function (status, data) {
            return $.ajax({
                url: channelUrl + "/v1/resources/enabled/" + status,
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceIsTop: function (isTop, data) {
            return $.ajax({
                url: learningUnitUrl + "/v1/resources/is_top/" + isTop,
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceTags: function (data) {
            return $.ajax({
                url: channelUrl + "/v1/resources/tags",
                type: "put",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            });
        },
        updateResourceForcesync: function (data) {
            return $.ajax({
                url: forceSyncUrl + '/v1/resources/actions/forcesync',
                type: 'put',
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data)
            })
        }
    };
    var viewModel = {
        model: {
            mode: window.mode,
            items: [],
            total: 0,
            filter: {
                page_size: 20,
                page_no: 0,
                status: '', //状态：0下线，1上线
                name: '',//搜索关键字
                no_tag_resource: undefined,//是否查询未贴标签的资源, 默认为false
                tag_ids: [],//标签ID(多值)
                is_top: undefined,//置顶标识
                sort_type: 3,//排序类型：3综合 1最新 2最热
                time_status: '',//1即将开始 2正在开课 3已结束
                group_names: [],//学习单元分组列表
                affiliated_org_nodes: [],
                affiliated_org_node_filter_type: 0,
                audit_status: "",
                is_free: window.isFree && window.isFree == 'true'
            },
            isLoaded: false,
            allGroupNames: [],
            tags: [],
            listStyle: 'card', //列表显示风格
            selectedArray: [],// 勾选到的item，
            setSortable: '',// 设置sortable
            orgText: "点击查看或选择组织",
            create_resource_list: [],
            stages: {
                '$PRIMARY': '小学',
                '$MIDDLE': '初中',
                '$HIGH': '高中'
            },
            tree: {
                init: false,
                manager: null,
                org: null
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.selectTags = ko.observable({});
            this.model.payFilter = [{'key': '免费', value: true}, {'key': '收费', value: false}];
            this.model.filter.is_free.subscribe(function (v) {
                this.search();
            }, this);
            this._initComputed();
            ko.applyBindings(this, document.getElementById('mainContent'));
            this.initTag();
            this._eventHandler();
            this._initMixOrgs();
        },
        initMessage: function () {
            var callbackList = {
                "RESOURCE_SET": $.proxy(function (data) {
                    this.formatInputItems(data);
                }, this),
                "RESOURCE_GET": $.proxy(function (data) {
                    this.saveSelect();
                }, this)
            };
            $(window).on('message', function (evt) {
                var rawData = void 0;
                try {
                    rawData = JSON.parse(evt.originalEvent.data)
                } catch (e) {
                }
                if (rawData) callbackList[rawData.action](rawData.data);
            });
            this.getResources();
        },
        switchListStyle: function (type) {
            this.model.listStyle(type);
            this.model.filter.is_free(window.isFree && window.isFree == 'true');
        },
        formatInputItems: function (data) {
            var self = this, filter = ko.mapping.toJS(this.model.filter);
            filter.resource_ids = _.arrayMap(data.items, function (v) {
                return v.id;
            });
            filter.page_size = 9999;
            store.getResource(this.formatFilter(filter)).done(function (res) {
                self.model.selectedArray(res.items);
            });
        },
        getResources: function () {
            var data = {
                'action': 'RESOURCE_GET',
                'data': {
                    'items': []
                }
            };
            window.parent.postMessage(JSON.stringify(data), '*');
        },
        saveSelect: function () {
            var data = {
                'action': 'RESOURCE_SAVE',
                'data': {
                    'items': this.model.selectedArray()
                }
            };
            window.parent.postMessage(JSON.stringify(data), '*');
        },
        cancelSelect: function () {
            var data = {
                'action': 'RESOURCE_CANCEL',
                'data': {}
            };
            window.parent.postMessage(JSON.stringify(data), '*');
        },
        _initMixOrgs: function () {
            var self = this;
            store.getMixOrgTree().done($.proxy(function (data) {
                this.manager_nodes = [];
                if (data.manager && !data.manager.has_manage_project) {
                    this.manager_nodes = $.map(data.manager.manager_nodes, function (v) {
                        return v.node_id;
                    }) || [];
                    this.model.filter.affiliated_org_nodes(this.manager_nodes);
                }
                this.getResourceGroup();
                this.model.tree.manager(data.manager);
                this.model.tree.org(data.org_tree);
                this.model.tree.init(true);
            }, this));
        },
        _initComputed: function () {
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
            ko.options.deferUpdates = true;
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
        editResource: function ($data) {
            if (window.mode == 'select' || this.model.selectedArray().length) this.checkClick($data);
            else {
                var type = $data.type === 'opencourse_2' ? $data.extra.business_type : $data.type;
                var href = formatUrl(RESOURCE_CONFIG_MAP[type].update_url, $data);
                href += (~href.indexOf("?") ? "&" : "?") + "source=channel&return_url=" + encodeURIComponent(saveUrl('edit', $data.type, $data.resource_id));
                href += '&__mac=' + Nova.getMacToB64(href);
                location.href = href;
            }
        },
        courseManage: function ($data) {
            var href = '';
            if ($data.type == "lecturer") href += window.lecturerUrl + '/admin/#/lecturer/' + $data.resource_id + '/course';
            else href += window.lecturer2GatewayUrl + '/admin/#/lecturer/' + $data.resource_id + '/resource';
            href += '?project_code=' + window.projectCode + '&return_url=' + encodeURIComponent(saveUrl('edit', $data.type, $data.resource_id));
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        pkRecordManage: function ($data) {
            var href = window.pkGatewayUrl + '/' + window.projectCode + '/pk/' + $data.resource_id + '/record/manage?return_url=' + encodeURIComponent(saveUrl('edit', $data.type, $data.resource_id));
            href += '&__mac=' + Nova.getMacToB64(href);
            location.href = href;
        },
        hrefTo: function (type) {
            location.hash = '';
            var obj = RESOURCE_CONFIG_MAP[type];
            if (!obj) return;
            var href = '';
            if (~obj.create_url.indexOf('?__mac=${mac}')) {
                obj.create_url = obj.create_url.replace('?__mac=${mac}', '');
                href = obj.create_url + (~obj.create_url.indexOf("?") ? "&" : "?") + 'context_id=&unit_type=' + type + '&no_resource_rool=true&return_url=' + encodeURIComponent(saveUrl('create', type)) + '&__mac=${mac}';
            } else {
                href = obj.create_url + (~obj.create_url.indexOf("?") ? "&" : "?") + 'context_id=&unit_type=' + type + '&no_resource_rool=true&return_url=' + encodeURIComponent(saveUrl('create', type))
            }
            location.href = formatUrl(href);
        },
        getResourceGroup: function (global) {
            var self = this, exam_group = [], course_group = [], result = [], group_names = [];
            window.notShowCover = global;
            if (window.unitType) window.unitType = window.unitType.split(',');
            var res = $.extend(true, [], window.allGroupNames);
            this.model.allGroupNames(res);
            $.each(res, function (i, v) {
                if (v.is_exam_group) {
                    exam_group.push(v);
                } else if (v.type === 'opencourse_2') {
                    course_group = [{
                        title: '教学课',
                        type: 'teaching_course'
                    }, {
                        title: '练习课',
                        type: 'exercise_course'
                    }, {
                        title: '线下课',
                        type: 'offline_course'
                    }]
                } else {
                    result.push({
                        title: '添加' + v.title,
                        type: v.type,
                        children: []
                    });
                }
                if (!window.unitType || ~$.inArray(v.type, window.unitType)) group_names.push(v.name);
            });
            if (course_group.length) {
                result = [{
                    title: '添加新课程',
                    type: '',
                    children: course_group
                }].concat(result);
            }
            if (exam_group.length) {
                result = [{
                    title: '添加测评',
                    type: '',
                    children: exam_group
                }].concat(result);
            }
            this.model.create_resource_list(result);
            this.model.filter.group_names(group_names);
            this.getList().done(function () {
                if (window.mode === 'select' && window.parent !== window) self.initMessage();
            });
            this.model.filter.group_names.subscribe(function () {
                self.search();
            }, this);
        },
        setOnline: function (flag, $data) {
            var self = this, selectedArray = this.model.selectedArray();
            if (!$data) {
                var needAuditResources = $.grep(selectedArray, function (v) {
                    return window.resourceAudit && self.isAudit(v.type);
                });
                if (needAuditResources.length) {
                    $.alert("当前选中资源中包含需要审核的资源，无法进行全部发布或禁用。");
                    return;
                }
            }
            var postData = $data ? [$data.resource_id] : $.map(selectedArray, function (v) {
                return v.resource_id;
            });
            store.updateResourceStatus(flag, postData).done(function (data) {
                if ($data) {
                    if (data && data[0]) {
                        if (data[0].code == 0) {
                            $.simplyToast("资源" + (flag ? "发布" : "禁用") + "成功！");
                        } else {
                            $.alert("资源" + (flag ? "发布" : "禁用") + "失败" + "，失败原因：" + data[0].message);
                        }
                    }
                } else {
                    self.formatErrorMessage(selectedArray, data, 'unit_id');
                }
                self.model.selectedArray([]);
                self.getList();
            })
        },
        formatErrorMessage: function (source, message, idKey) {
            var group = {}, str = "", errorCount = 0;
            idKey = idKey || "resource_id";
            $.each(message || [], function (im, vm) {
                if (vm.code != "0") {
                    ++errorCount;
                    $.each(source, function (is, vs) {
                        if (vs.resource_id == vm[idKey]) {
                            var hash = encodeURIComponent(vm.message);
                            group[hash] = group[hash] || [];
                            group[hash].push(vs.title);
                        }
                    })
                }
            });
            if (errorCount) {
                str = "共提交" + source.length + "个资源，其中" + (source.length - errorCount) + "个操作成功，" + errorCount + "个操作失败！<br/><br/><strong>失败原因</strong><br/>";
                var index = 1;
                $.each(group, function (i, v) {
                    str += index + "、" + decodeURIComponent(i) + "<br/>资源名称为：";
                    str += v.join("、") + "<br/>";
                    ++index;
                });
                return $.alert(str);
            } else {
                str = "共提交" + source.length + "个资源，全部成功！";
                return $.simplyToast(str);
            }
        },
        initTag: function () {
            var self = this;
            store.getTag().done(function (res) {
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
            if (!_search.group_names.length) {
                //$.alert('请至少勾选一种资源类型！');
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
                return $.when(false);
            }
            this.model.isLoaded(false);
            return store.getResource(this.formatFilter(_search)).done(function (res) {
                self.model.items(res.items);
                self.model.total(res.total);
                // self.model.selectedArray([]);
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
            var type = $data.type;
            if ($data.type === 'opencourse_2') {
                type = $data.extra.business_type;
            }
            return RESOURCE_CONFIG_MAP[type] && RESOURCE_CONFIG_MAP[type].alias || RESOURCE_CONFIG_MAP[$data.type].alias;
        },
        //清除选择
        clearSelect: function () {
            this.model.selectedArray([]);
        },
        /*组织树显示*/
        showOrgTree: function () {
            $("#zT-orgTreeModal").modal('show');
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
        /**
         * 移除勾选的项目
         * @return {null} null
         */
        deleteItems: function (data) {
            var _self = this, ids;
            if (data) {
                ids = viewModel._getArrayProp([data], 'id');
            } else {
                ids = viewModel._getArrayProp(viewModel.model.selectedArray(), 'id');
            }
            Utils.confirmTip('确定删除？', {
                icon: 7,
                btn: ['确定', '取消']
            }).then(function (index) {
                store.deleteTrains(ids).done(function () {
                    Utils.msgTip('删除成功!').done(function () {
                        _self.getList();
                    });
                });
            });
        },
        //项目item勾选事件
        checkClick: function ($data) {
            var selectedArray = this.model.selectedArray, index = this.formatResourceSelected($data);
            if (index) {
                selectedArray.remove(index);
            } else {
                if (window.singleSelect) selectedArray([]);
                selectedArray.push($data)
            }
            return true;
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
        //设定查询参数
        clearStatus: function () {
            this.model.filter.no_tag_resource(undefined);
            this.model.filter.is_top(undefined);
            this.model.filter.status("");
            this.model.filter.audit_status("");
        },
        setTag: function (id, pid) {
            if (id) this.model.filter.no_tag_resource(false);
            var selectTags = this.model.selectTags;
            selectTags()[pid] = id;
            selectTags(selectTags());
            this.search();
        },
        setStatus: function (k, v) {
            if (k !== 'sort_type') this.clearStatus();
            if (k) {
                if (k == "no_tag_resource") this.model.selectTags({});
                this.model.filter[k](v);
            }
            this.search();
        },
        setSortType: function () {
            this.clearStatus();
            if (k) {
                if (k == "no_tag_resource") this.model.selectTags({});
                this.model.filter[k](v);
            }
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
                            self.model.selectedArray([]);
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
                self.model.selectedArray([]);
                self.getList();
            });
        },
        isAudit: function (type) {
            var allGroupNames = window.allGroupNames;
            for (var i = 0; i < allGroupNames.length; i++)
                if (allGroupNames[i].type == type) return allGroupNames[i].resource_audit;
        },
        selectAll: function () {
            var self = this, items = this.model.items(), selectedArray = this.model.selectedArray;
            if (this.allSelectedFlag) {
                var removeItems = [];
                _.arrayForEach(items, function (item) {
                    var s = self.formatResourceSelected(item);
                    if (s) removeItems.push(s);
                });
                _.arrayForEach(removeItems, function (item) {
                    selectedArray.remove(item);
                });
            } else {
                var pushItems = [];
                _.arrayForEach(items, function (item) {
                    if (!self.formatResourceSelected(item)) pushItems.push(item);
                });
                selectedArray(selectedArray().concat(pushItems));
            }
        },
        formatResourceSelected: function ($data) {
            var selectedArray = this.model.selectedArray();
            return _.arrayFirst(selectedArray, function (v) {
                return v.resource_id === $data.resource_id;
            })
        },
        checkSelectAll: function () {
            var self = this, items = this.model.items();
            var res = _.arrayFilter(items, function (item) {
                return self.formatResourceSelected(item);
            });
            this.allSelectedFlag = items.length === res.length;
            return items.length === res.length;
        }
    };
    $(function () {
        viewModel.init();
    });
})();